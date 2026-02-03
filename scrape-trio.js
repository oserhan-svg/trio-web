
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

            // Load all products by clicking "Daha fazla" if available
            try {
                await page.evaluate(async () => {
                    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
                    let retries = 0;
                    while (retries < 2) {
                        const buttons = Array.from(document.querySelectorAll('button, span, div'));
                        const loadMoreBtn = buttons.find(b => b.innerText && (b.innerText.trim() === 'Daha fazla' || b.innerText.includes('Yükle')));

                        if (loadMoreBtn && loadMoreBtn.offsetParent !== null) {
                            console.log('Clicking load more...');
                            loadMoreBtn.click();
                            await sleep(1500);
                            window.scrollTo(0, document.body.scrollHeight);
                            retries = 0;
                        } else {
                            window.scrollBy(0, 500);
                            await sleep(500);
                            retries++;
                        }
                    }
                });
            } catch (err) {
                console.warn("Pagination warning:", err.message);
            }

            // Extract product links
            const productLinks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a[href*="/product-page/"]'));
                return links.map(link => link.href).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3); // Valid 3 listings
            });

            console.log(`Found ${productLinks.length} listings in ${category.name}`);

            for (const link of productLinks) {
                console.log(`  Scraping listing: ${link}`);
                try {
                    await page.goto(link, { waitUntil: 'networkidle2' });

                    // Extract data from JSON-LD
                    const listingData = await page.evaluate(() => {
                        let data = {};
                        const script = document.querySelector('script[type="application/ld+json"]');
                        if (script) {
                            try {
                                const json = JSON.parse(script.innerText);
                                // Handle both single object and array (sometimes Wix puts multiple schemas)
                                const product = Array.isArray(json) ? json.find(i => i['@type'] === 'Product') : (json['@type'] === 'Product' ? json : null);

                                if (product) {
                                    data.title = product.name;
                                    data.description = product.description;
                                    data.sku = product.sku;

                                    // Handle capitalizaion inconsistencies in Wix JSON-LD
                                    const offers = product.offers || product.Offers;

                                    data.price = offers ? offers.price : null;
                                    data.currency = offers ? offers.priceCurrency : 'TRY';
                                    data.url = offers ? offers.url : window.location.href;
                                    data.images = product.image ? (Array.isArray(product.image) ? product.image.map(img => img.contentUrl || img) : [product.image.contentUrl || product.image]) : [];

                                    // Check Availability
                                    const availability = offers ? (offers.availability || offers.Availability) : null;
                                    if (availability === 'https://schema.org/InStock') {
                                        data.status = 'Active';
                                    } else if (availability === 'https://schema.org/OutOfStock' || availability === 'https://schema.org/SoldOut') {
                                        data.status = 'Passive';
                                    } else {
                                        data.status = 'Unknown';
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing JSON-LD', e);
                            }
                        }

                        // Fallback extraction if JSON-LD fails or is incomplete
                        if (!data.title) data.title = document.querySelector('h1')?.innerText || 'No Title';
                        if (!data.price) data.price = document.querySelector('[data-hook="formatted-primary-price"]')?.innerText.replace(/[^0-9,.]/g, '') || '0';
                        if (!data.description) data.description = document.querySelector('[data-hook="description"]')?.innerText || '';

                        // Regex Extraction for details from description
                        const desc = data.description || '';

                        const m2Match = desc.match(/(\d+)\s*(m²|m2)/i);
                        data.m2 = m2Match ? parseInt(m2Match[1]) : null;

                        const roomMatch = desc.match(/(\d+\+\d+)/);
                        data.rooms = roomMatch ? roomMatch[1] : null;

                        const floorMatch = desc.match(/(\d+)\.\s*kat/i);
                        data.floor = floorMatch ? parseInt(floorMatch[1]) : null;

                        const ageMatch = desc.match(/(\d+)\s*yaşında/i);
                        data.age = ageMatch ? parseInt(ageMatch[1]) : null;

                        return data;
                    });

                    // Download the first image for local use, keep others as URLs
                    let localImagePath = null;
                    if (listingData.images && listingData.images.length > 0) {
                        const imgUrl = listingData.images[0];
                        const imageName = `listing-${category.slug}-${Date.now()}.jpg`;
                        const imagePath = path.join(assetsDir, imageName);
                        // We will skip actual downloading for now to speed up, just store the URL
                        // If user wants local images, we can implement downloadImage function here
                        // For this task, user emphasized "correct data extraction" so URLs are often better than broken local files
                        localImagePath = `/src/assets/scraped/${imageName}`;
                    }

                    allListings.push({
                        id: listingData.sku || Date.now() + Math.random(),
                        ...listingData,
                        category: category.slug, // Use our local slug
                        type: category.name,
                        originalUrl: link
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

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(allListings, null, 2));
    console.log(`Saved ${allListings.length} listings to ${outputPath}`);

})();
