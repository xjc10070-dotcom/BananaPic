const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const API_TARGET = 'https://api.lingyaai.cn';
const DIST_DIR = path.join(__dirname, 'dist');
const PROXY_TIMEOUT = 180000;

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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serveStatic(req, res) {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (req.url !== '/') {
        req.url = '/';
        serveStatic(req, res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    });
    res.end(data);
  });
}

function proxyRequest(req, res) {
  const targetUrl = new URL(req.url.replace(/^\/api/, ''), API_TARGET);

  let bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', () => {
    const bodyData = Buffer.concat(bodyChunks);

    const options = {
      hostname: targetUrl.hostname,
      port: 443,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.hostname,
        'content-length': bodyData.length,
      },
      timeout: PROXY_TIMEOUT,
    };

    delete options.headers['accept-encoding'];

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('timeout', () => {
      console.error('代理请求超时:', req.url);
      proxyReq.destroy();
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: '上游服务响应超时，请稍后重试' } }));
      }
    });

    proxyReq.on('error', (err) => {
      console.error('代理请求失败:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: `代理请求失败: ${err.message}` } }));
      }
    });

    proxyReq.write(bodyData);
    proxyReq.end();
  });

  req.on('error', (err) => {
    console.error('读取请求体失败:', err.message);
    if (!res.headersSent) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: '读取请求数据失败' } }));
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxyRequest(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  🍌 Nano Banana 图片生成器');
  console.log('========================================');
  console.log('');
  console.log(`  本地访问: http://localhost:${PORT}`);
  console.log('');
  console.log('  首次使用请点击右上角 [配置] 设置 API Key');
  console.log('  按 Ctrl+C 停止服务器');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请关闭占用该端口的程序后重试`);
  } else {
    console.error('服务器启动失败:', err.message);
  }
  process.exit(1);
});
