
import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Active Listing
    const activeUrl = 'https://www.trioemlak.com/product-page/alt%C4%B1novada-5-ya%C5%9F%C4%B1nda-3-1-merkezi-sistem-ebeveyn-banyolu';
    // Passive/Sold Listing
    const passiveUrl = 'https://www.trioemlak.com/product-page/s%C4%B1f%C4%B1r-yerden-is%C4%B1tmal%C4%B1-geni%C5%9F-3-1-l%C3%BCks-daire-asans%C3%B6rl%C3%BC-depolu-%C3%B6n-cephe';

    const testUrls = [activeUrl, passiveUrl];

    for (const url of testUrls) {
        console.log(`Testing URL: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2' });

            const data = await page.evaluate(() => {
                let extracted = {};
                const script = document.querySelector('script[type="application/ld+json"]');
                if (script) {
                    try {
                        const json = JSON.parse(script.innerText);
                        console.log('Full JSON-LD:', JSON.stringify(json, null, 2));
                        const product = Array.isArray(json) ? json.find(i => i['@type'] === 'Product') : (json['@type'] === 'Product' ? json : null);
                        if (product) {
                            extracted.title = product.name;
                            extracted.description = product.description;
                            extracted.sku = product.sku;
                            extracted.price = product.offers ? product.offers.price : null;
                            const availability = product.offers ? product.offers.availability : null;
                            if (availability === 'https://schema.org/InStock') {
                                extracted.status = 'Active';
                            } else if (availability === 'https://schema.org/OutOfStock' || availability === 'https://schema.org/SoldOut') {
                                extracted.status = 'Passive';
                            } else {
                                extracted.status = 'Unknown (' + availability + ')';
                            }
                        }
                    } catch (e) {
                        return { error: e.message };
                    }
                }

                // Test regex extraction
                if (extracted.description) {
                    const desc = extracted.description;
                    const m2Match = desc.match(/(\d+)\s*(m²|m2)/i);
                    extracted.m2 = m2Match ? m2Match[1] : null;

                    const roomMatch = desc.match(/(\d+\+\d+)/);
                    extracted.rooms = roomMatch ? roomMatch[1] : null;
                }

                return extracted;
            });

            console.log('Result:', JSON.stringify(data, null, 2));

        } catch (e) {
            console.error('Error:', e.message);
        }
    }

    await browser.close();
})();
