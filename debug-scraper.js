
import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Active listing from previous observation
    const url = 'https://www.trioemlak.com/product-page/alt%C4%B1novada-5-ya%C5%9F%C4%B1nda-3-1-merkezi-sistem-ebeveyn-banyolu';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('Extracting HTML...');
    const html = await page.content();

    fs.writeFileSync('listing_dump.html', html);
    console.log('HTML saved to listing_dump.html');

    await browser.close();
})();
