const { Pool } = require('pg');
const { processListingImages } = require('./imageProcessor');
const { queryExternal } = require('./externalDb');
require('dotenv').config();

async function runBatchProcessing() {
    try {
        console.log('--- Starting Image Processing Batch ---');

        // 1. Get listings with images
        // For testing, we might want to target specific IDs or ALL owner listings
        const query = `
            SELECT id, images 
            FROM properties 
            WHERE seller_type = 'owner' 
            AND status = 'active'
            AND array_length(images, 1) > 0
            -- AND processed_images IS NULL (Future optimization)
            LIMIT 5
        `;

        const result = await queryExternal(query);
        const listings = result.rows;

        console.log(`Found ${listings.length} listings to process.`);

        for (const listing of listings) {
            console.log(`\nProcessing Listing ID: ${listing.id}`);

            // Process images
            const newImages = await processListingImages(listing.id, listing.images);

            if (newImages.length > 0) {
                // Update DB
                // NOTE: We might want to store in a new column 'clean_images' first for safety
                // For now, we print only.
                console.log(`DONE. New Images Count: ${newImages.length}`);

                // Uncomment to Save:
                /*
                await queryExternal('UPDATE properties SET images = $1 WHERE id = $2', [newImages, listing.id]);
                */
            } else {
                console.log('No images processed successfully.');
            }
        }

    } catch (err) {
        console.error('Batch Error:', err);
    }
}

runBatchProcessing();
