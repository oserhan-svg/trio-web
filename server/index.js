const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Database Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Routes
app.get('/api/listings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM listings ORDER BY created_at DESC');

        // Transform data to match original JSON structure if needed (e.g., camelCase for fullDescription)
        const transformed = result.rows.map(row => ({
            ...row,
            fullDescription: row.full_description,
            imageUrl: row.image_url
        }));

        res.json(transformed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/listings/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        const row = result.rows[0];
        const transformed = {
            ...row,
            fullDescription: row.full_description,
            imageUrl: row.image_url
        };

        res.json(transformed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin & Management Routes
app.patch('/api/listings/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!['active', 'sold', 'passive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const result = await pool.query(
            'UPDATE listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/listings/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'sold') as sold,
                COUNT(*) FILTER (WHERE status = 'passive') as passive,
                COUNT(*) FILTER (WHERE category = 'satilik-konut') as residential,
                COUNT(*) FILTER (WHERE category = 'satilik-arsa') as land
            FROM listings
        `);
        res.json(stats.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
    const { password } = req.body;
    const MASTER_PASSWORD = process.env.ADMIN_PASSWORD || 'trio2024';

    if (password === MASTER_PASSWORD) {
        // Return a mock token for development
        res.json({
            success: true,
            token: 'trio-adm-session-' + Date.now(),
            user: { role: 'admin', name: 'Trio Admin' }
        });
    } else {
        res.status(401).json({ error: 'Giriş başarısız. Lütfen şifrenizi kontrol edin.' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'Trio Emlak Backend' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
