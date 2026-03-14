const { execSync, spawn } = require('child_process');

async function run() {
    console.log("Starting server...");
    const serverProcess = spawn('node', ['index.js'], { stdio: 'inherit' });

    // wait a bit for server to start
    await new Promise(r => setTimeout(r, 2000));

    try {
        console.log("Measuring /api/listings...");
        const fetch = (await import('node-fetch')).default;
        const start = Date.now();
        const res = await fetch('http://localhost:5000/api/listings?page=1&limit=5&searchTerm=villa&category=satilik-villa');
        const data = await res.json();
        const duration = Date.now() - start;
        console.log(`Fetched paginated response in ${duration}ms`);
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        serverProcess.kill();
    }
}
run();
