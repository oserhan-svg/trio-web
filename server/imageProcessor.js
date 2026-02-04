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
 * @param {Buffer} buffer 
 * @returns {Promise<Buffer>}
 */
async function removeWatermark(buffer) {
    return new Promise((resolve, reject) => {
        // Create temporary files
        const tempDir = os.tmpdir();
        const inputPath = path.join(tempDir, `input_${Date.now()}.jpg`);
        const outputPath = path.join(tempDir, `output_${Date.now()}.jpg`);

        fs.writeFileSync(inputPath, buffer);

        // Spawn Python process
        // Assumption: 'python' is in PATH. If 'python3', adjust command.
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'watermark_remover.py'),
            inputPath,
            outputPath
        ]);

        let errorOutput = '';

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                // Cleanup
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

                console.error(`Python Error: ${errorOutput}`);
                // Fallback: If python fails (e.g. not installed), return original buffer or throw?
                // Let's fallback to original for improved resilience
                console.warn('Falling back to original image due to Python error.');
                resolve(buffer);
                return;
            }

            try {
                // Read processed image
                const processedBuffer = fs.readFileSync(outputPath);
                resolve(processedBuffer);
            } catch (err) {
                reject(err);
            } finally {
                // Cleanup
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });
    });
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
    const newUrls = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        if (!url) continue;

        try {
            console.log(`Processing ${listingId} - Image ${i + 1}...`);

            // 1. Download
            const rawBuffer = await downloadImage(url);

            // 2. Crop & Convert to WebP
            const processedBuffer = await removeWatermark(rawBuffer);

            // Convert to WebP for optimization
            const webpBuffer = await sharp(processedBuffer)
                .webp({ quality: 80 }) // Good balance of quality and size
                .toBuffer();

            // 3. Upload
            const filename = `listings/${listingId}/${Date.now()}_${i}.webp`;
            const publicUrl = await uploadToStorage(webpBuffer, filename);

            newUrls.push(publicUrl);
            console.log(`> Uploaded: ${publicUrl}`);

        } catch (err) {
            console.error(`Error processing image ${url}:`, err.message);
            // newUrls.push(url); // Option: Keep original if fail
        }
    }

    return newUrls;
}

module.exports = { processListingImages };
