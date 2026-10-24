import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 10000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storeHtmlPath = path.resolve(
    __dirname,
    '../apps/coin-wallet-store/src/store.html'
);
const assetsDir = path.resolve(
    __dirname,
    '../apps/coin-wallet-store/public/assets'
);

const assetMimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    const url = new URL(
        req.url,
        'http://localhost'
    );

    const pathname = url.pathname;
    const method = req.method;
    // Serve public image and video assets
if (pathname.startsWith('/assets/')) {
    if (method !== 'GET' && method !== 'HEAD') {
        res.writeHead(405, { Allow: 'GET, HEAD' });
        res.end();
        return;
    }

    const filename = pathname.slice('/assets/'.length);

    // Allow only simple filenames from the public assets folder.
    if (!/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|gif|svg|mp4)$/i.test(filename)) {
        res.writeHead(404);
        res.end('Asset not found');
        return;
    }

    const filePath = path.join(assetsDir, filename);
    const extension = path.extname(filename).toLowerCase();

    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            res.writeHead(404);
            res.end('Asset not found');
            return;
        }

        res.writeHead(200, {
            'Content-Type': assetMimeTypes[extension] || 'application/octet-stream',
            'Content-Length': stats.size,
            'Cache-Control': 'public, max-age=3600',
            'X-Content-Type-Options': 'nosniff'
        });

        if (method === 'HEAD') {
            res.end();
            return;
        }

        fs.createReadStream(filePath).pipe(res);
    });

    return;
}

    // Render and UptimeRobot health check
    if (pathname === '/health' && method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        });

        res.end(JSON.stringify({
            status: 'UP',
            service: 'youpi-pg-demo',
            mode: 'demo-preview',
            timestamp: new Date().toISOString()
        }));

        return;
    }

    // Display the existing Demo Store homepage
    if (
        (pathname === '/' || pathname === '/store') &&
        (method === 'GET' || method === 'HEAD')
    ) {
        try {
            const html = fs.readFileSync(
                storeHtmlPath,
                'utf8'
            );

            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'SAMEORIGIN',
                'Content-Security-Policy':
                    "default-src 'self'; " +
                    "img-src 'self' data: https:; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "connect-src 'none'; " +
                    "frame-src 'none'; " +
                    "object-src 'none'; " +
                    "base-uri 'none'; " +
                    "form-action 'none'"
            });

            res.end(method === 'HEAD' ? undefined : html);
        } catch (error) {
            console.error('Store HTML error:', error);

            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });

            res.end('Unable to load Demo Store.');
        }

        return;
    }

    // Safe read-only demo pages
const previewPages = {
    '/wallet': 'wallet.html',
    '/order-success': 'order-success.html',
    '/order-failed': 'order-failed.html',
    '/order-suspicious': 'order-suspicious.html',
    '/order-expired': 'order-expired.html',
    '/order-cancelled': 'order-cancelled.html'
};

if (
    method === 'GET' &&
    Object.hasOwn(previewPages, pathname)
) {
    try {
        const pagePath = path.resolve(
            __dirname,
            '../apps/coin-wallet-store/src',
            previewPages[pathname]
        );

        const html = fs.readFileSync(pagePath, 'utf8');

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy':
                "default-src 'self'; " +
                "img-src 'self' data: https:; " +
                "style-src 'self' 'unsafe-inline'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "connect-src 'none'; " +
                "frame-src 'none'; " +
                "form-action 'none'; " +
                "object-src 'none'; " +
                "base-uri 'none'"
        });

        res.end(html);
    } catch (error) {
        console.error(error);
        res.writeHead(500);
        res.end('Unable to load preview page.');
    }

    return;
}
    // Payment functionality is deliberately disabled
    res.writeHead(404, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    });

    res.end(JSON.stringify({
        error: 'Not available in demo preview',
        message: 'Payment functionality is disabled.'
    }));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(
        `YouPI-PG Demo Store preview running on port ${PORT}`
    );
});