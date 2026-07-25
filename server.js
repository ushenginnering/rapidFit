/**
 * RapidFit Dev Server
 * 
 * Serves static HTML/JS/CSS files and proxies all API calls
 * to https://gym.rapidsuite.ng/api/v1/ to avoid CORS issues.
 * 
 * Usage:  node server.js
 * Then:   http://localhost:3000/Pages/login.html
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const API_HOST = 'gym.rapidsuite.ng';
const API_PREFIX = '/api/v1';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
};

// ─── Serve static files ────────────────────────────────────────────
function serveStatic(req, res) {
    // Default to login.html for root path
    let urlPath = req.url === '/' ? '/Pages/login.html' : req.url;
    let filePath = path.join(__dirname, urlPath);

    // Try with Pages/ prefix fallback
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'Pages', urlPath.replace(/^\//, ''));
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('<h1>404 - File Not Found</h1>');
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// ─── Proxy API calls to backend ────────────────────────────────────
function proxyApi(req, res) {
    const apiPath = `${API_PREFIX}${req.url}`;
    
    console.log(`  ⚡ PROXY ${req.method} ${req.url} → ${API_HOST}${apiPath}`);

    // Collect request body
    let bodyChunks = [];
    req.on('data', chunk => bodyChunks.push(chunk));
    req.on('end', () => {
        const body = Buffer.concat(bodyChunks);

        // Build clean headers — only forward what the real API needs
        const headers = {
            'Host': API_HOST,
            'Content-Type': req.headers['content-type'] || 'application/json',
            'Accept': 'application/json',
        };

        // Forward auth headers if present
        if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'];
        if (req.headers['x-gym-id']) headers['X-Gym-Id'] = req.headers['x-gym-id'];
        if (req.headers['x-requested-with']) headers['X-Requested-With'] = req.headers['x-requested-with'];

        if (body.length > 0) {
            headers['Content-Length'] = body.length;
        }

        const options = {
            hostname: API_HOST,
            port: 443,
            path: apiPath,
            method: req.method,
            headers: headers,
        };

        const proxyReq = https.request(options, (proxyRes) => {
            // Add CORS headers so browser accepts the response
            const responseHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Gym-Id, X-Requested-With',
            };

            // Forward response body & status
            let responseBody = '';
            proxyRes.on('data', chunk => responseBody += chunk);
            proxyRes.on('end', () => {
                console.log(`  📥 RESPONSE ${proxyRes.statusCode} from ${apiPath}`);
                res.writeHead(proxyRes.statusCode, responseHeaders);
                res.end(responseBody);
            });
        });

        proxyReq.on('error', (err) => {
            console.error('  ❌ PROXY ERROR:', err.message);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: `Cannot reach API server: ${err.message}`
            }));
        });

        if (body.length > 0) proxyReq.write(body);
        proxyReq.end();
    });
}

// ─── Main server ───────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    const urlPath = req.url;
    console.log(`${req.method} ${urlPath}`);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Gym-Id, X-Requested-With',
            'Access-Control-Max-Age': '86400',
        });
        return res.end();
    }

    // Route API calls to proxy
    // Any URL starting with /auth, /members, /checkin, /plans, /finance,
    // /companies, /reports, /staff, /settings, /dashboard, /instructors, /equipment → proxy
    const apiEndpoints = ['/auth', '/members', '/checkin', '/plans', '/finance', '/companies', '/reports', '/staff', '/settings', '/dashboard', '/instructors', '/equipment'];
    if (apiEndpoints.some(prefix => urlPath.startsWith(prefix))) {
        return proxyApi(req, res);
    }

    // Everything else → static files
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║      🏋️  RapidFit Dev Server             ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log(`║  Open: http://localhost:${PORT}/Pages/login.html  ║`);
    console.log('║                                           ║');
    console.log('║  ✓ Static files served (no CORS issues)  ║');
    console.log('║  ✓ API proxied to gym.rapidsuite.ng      ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
});

