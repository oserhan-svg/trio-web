import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseUrl = 'https://www.trioemlak.com';
const categories = [
    { name: 'Satılık Arsa', url: '/satilik-arsa', slug: 'satilik-arsa' },
    { name: 'Satılık Daire', url: '/satilik-daire', slug: 'satilik-daire' },
    { name: 'Satılık Villa', url: '/satilik-villa', slug: 'satilik-villa' },
    { name: 'Satılık Taş Ev', url: '/satilik-tas-ev', slug: 'satilik-tas-ev' },
    { name: 'Satılık Zeytinlik', url: '/satilik-zeytinlik', slug: 'satilik-zeytinlik' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => reject(err));
        });
    });
};

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const allListings = [];

    // Ensure assets directory exists for images
    const assetsDir = path.join(__dirname, 'src', 'assets', 'scraped');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    for (const category of categories) {
        console.log(`Scraping category: ${category.name}`);
        try {
            await page.goto(baseUrl + category.url, { waitUntil: 'networkidle2' });

            // Wix specific selectors - might need adjustment based on actual DOM
            // Looking for product links
            const productLinks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a[href*="/product-page/"]'));
                return links.map(link => link.href).filter((v, i, a) => a.indexOf(v) === i); // Unique
            });

            console.log(`Found ${productLinks.length} listings in ${category.name}`);

            for (const link of productLinks) {
                console.log(`  Scraping listing: ${link}`);
                try {
                    await page.goto(link, { waitUntil: 'networkidle2' });

                    const listingData = await page.evaluate(() => {
                        const title = document.querySelector('h1')?.innerText || 'No Title';
                        const price = document.querySelector('[data-hook="formatted-primary-price"]')?.innerText || 'Fiyat Alınız';
                        const description = document.querySelector('[data-hook="description"]')?.innerText || '';
                        // Try to find image
                        const img = document.querySelector('img[data-hook="product-image"]');
                        const imageUrl = img ? img.src : 'https://via.placeholder.com/400';

                        // Extract more details if possible (room, area often in description or custom fields)
                        // Simple robust extraction for now
                        return { title, price, description, imageUrl };
                    });

                    // Download image
                    const imageName = `listing-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
                    const imagePath = path.join(assetsDir, imageName);
                    if (listingData.imageUrl && !listingData.imageUrl.includes('placeholder')) {
                        // Hacky download inside node context because simple https.get might fail on some CDNs or relative paths
                        // For now, let's just save the URL reference or try to download if it's a valid http url
                    }

                    allListings.push({
                        id: Date.now() + Math.random(),
                        ...listingData,
                        category: category.slug, // Use our local slug
                        location: 'Ayvalık', // Default for now
                        type: category.name,
                        imageUrl: listingData.imageUrl // store remote URL for now, download logic is complex in simple script
                    });

                } catch (e) {
                    console.error(`  Failed to scrape listing ${link}:`, e.message);
                }
            }
        } catch (e) {
            console.error(`Failed to scrape category ${category.name}:`, e.message);
        }
    }

    await browser.close();

    const outputPath = path.join(__dirname, 'src', 'data', 'listings.json');
    fs.writeFileSync(outputPath, JSON.stringify(allListings, null, 2));
    console.log(`Saved ${allListings.length} listings to ${outputPath}`);

})();
