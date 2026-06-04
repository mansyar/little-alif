/**
 * Production server entry for TanStack Start (Node.js / Docker).
 *
 * Serves:
 *   - Static assets from dist/client/ (JS, CSS, audio, fonts)
 *   - SSR + server functions via the TanStack Start fetch handler
 *
 * Equivalent to: srvx --prod -s dist/client dist/server/server.js
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CLIENT_DIR = resolve(ROOT, 'dist', 'client');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
};

// Load the TanStack Start server handler
const serverHandlerPath = resolve(ROOT, 'dist', 'server', 'server.js');
const { default: handler } = await import(serverHandlerPath);
const PORT = parseInt(process.env.PORT ?? '3000', 10);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    // ----- Static assets -----
    // Only GET/HEAD requests to non-root paths without extensions hit here
    // Everything else goes to the SSR handler
    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname !== '/') {
      // Try to serve from dist/client/
      let filePath = join(CLIENT_DIR, url.pathname);

      // If the path has no extension, try index.html (for client-side routing)
      if (!extname(url.pathname)) {
        const indexFile = join(filePath, 'index.html');
        if (existsSync(indexFile)) {
          filePath = indexFile;
        }
      }

      if (existsSync(filePath) && extname(filePath)) {
        const ext = extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
        const content = readFileSync(filePath);

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        });
        res.end(content);
        return;
      }
    }

    // ----- SSR / Server Functions -----
    const headers = new Headers();
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      headers.set(req.rawHeaders[i], req.rawHeaders[i + 1]);
    }

    const body =
      req.method === 'GET' || req.method === 'HEAD'
        ? null
        : await new Promise((resolve) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
          });

    const request = new Request(url, {
      method: req.method,
      headers,
      body,
    });

    const response = await handler.fetch(request);

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

    if (response.body) {
      // Use ReadableStream directly
      const reader = response.body.getReader();
      const pump = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            res.end();
            return;
          }
          res.write(value);
          pump();
        });
      };
      pump();
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Unhandled server error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Little Alif server listening on http://0.0.0.0:${PORT}`);
});
