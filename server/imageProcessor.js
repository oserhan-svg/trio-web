const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const { pool } = require('./externalDb'); // Reuse DB connection
require('dotenv').config();

// Supabase Storage Config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const BUCKET_NAME = 'listing-images';

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/**
 * Downloads image from URL
 * @param {string} url 
 * @returns {Promise<Buffer>}
 */
async function downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    return await response.buffer();
}

/**
 * Removes watermark using Python OpenCV script (Inpainting)
 * Fallback: Uses sharp to apply subtle blur/crop if Python fails
 * @param {Buffer} buffer 
 * @returns {Promise<Buffer>}
 */
async function removeWatermark(buffer) {
    // Attempt Python Inpainting first
    const pythonResult = await new Promise((resolve) => {
        const tempDir = os.tmpdir();
        const inputPath = path.join(tempDir, `input_${Date.now()}.jpg`);
        const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);

        fs.writeFileSync(inputPath, buffer);

        const pythonProcess = spawn('python', [
            path.join(__dirname, 'watermark_remover.py'),
            inputPath,
            outputPath
        ]);

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                resolve(null);
                return;
            }
            try {
                const processedBuffer = fs.readFileSync(outputPath);
                resolve(processedBuffer);
            } catch {
                resolve(null);
            } finally {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });
    });

    if (pythonResult) return pythonResult;

    // Fast Path Fallback: Sharp-based subtle crop/blur for bottom area
    console.warn('Using Fast Path (Sharp) for watermark obscuration.');
    const metadata = await sharp(buffer).metadata();
    const watermarkHeight = Math.floor(metadata.height * 0.12); // Branding is usually in bottom 12%

    return await sharp(buffer)
        .extract({
            left: 0,
            top: 0,
            width: metadata.width,
            height: metadata.height - Math.floor(watermarkHeight / 2)
        }) // Slight crop
        .extend({
            bottom: Math.floor(watermarkHeight / 2),
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }) // Padding
        .toBuffer();
}

/**
 * Uploads buffer to Supabase Storage
 * @param {Buffer} buffer 
 * @param {string} path 
 * @returns {Promise<string>} Public URL
 */
async function uploadToStorage(buffer, filename) {
    if (!supabase) throw new Error('Supabase Not Configured');

    const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(filename, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(filename);

    return publicUrl;
}

/**
 * Main Processor Function
 */
async function processListingImages(listingId, imageUrls) {
    console.log(`Starting parallel processing for ${listingId} (${imageUrls.length} images)`);

    // Concurrency limit of 3 to avoid overloading memory/CPU
    const CONCURRENCY = 3;
    const results = [];

    for (let i = 0; i < imageUrls.length; i += CONCURRENCY) {
        const chunk = imageUrls.slice(i, i + CONCURRENCY);
        const chunkPromises = chunk.map(async (url, index) => {
            const actualIndex = i + index;
            if (!url) return null;

            try {
                // 1. Download
                const rawBuffer = await downloadImage(url);

                // 2. Process & Convert to WebP
                const processedBuffer = await removeWatermark(rawBuffer);
                const webpBuffer = await sharp(processedBuffer)
                    .webp({ quality: 80 })
                    .toBuffer();

                // 3. Upload
                const filename = `listings/${listingId}/${Date.now()}_${actualIndex}.webp`;
                return await uploadToStorage(webpBuffer, filename);
            } catch (err) {
                console.error(`Error processing image ${actualIndex}:`, err.message);
                return null;
            }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
    }

    return results.filter(url => url !== null);
}

module.exports = { processListingImages };
