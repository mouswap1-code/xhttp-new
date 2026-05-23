const http = require('http');
const https = require('https');

// === RATE LIMITING ===
const rateLimit = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 30;  // 30 requêtes par minute
    
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, []);
    }
    
    const timestamps = rateLimit.get(ip).filter(t => now - t < windowMs);
    timestamps.push(now);
    rateLimit.set(ip, timestamps);
    
    return timestamps.length > maxRequests;
}

// === Configuration ===
const VPS_HOST = 'ultrategateworld.benbilal237free.xyz';
const VPS_PORT = 80;
const UUID = 'acac847f-cfc1-4c7c-b7ac-9a1c8a8ca8e9';
const VPS_IP = '188.213.28.174';
const PORT = process.env.PORT || 8080;

// Paramètres XHTTP
const XHTTP_PATH = '/';
const XHTTP_MODE = 'auto';
const XHTTP_PADDING = '100-1000';
const HOST_HEADER = 'main-bvxea6i-gzlonww5dskks.fr-3.platformsh.site';
const SNI = 'main-bvxea6i-gzlonww5dskks.fr-3.platformsh.site';
const ALPN = ['h2', 'http/1.1', 'h3'];
const FP = 'chrome';

// Domaine Upsun
const DOMAIN = process.env.DOMAIN || 'main-bvxea6i-yg5fdvxqyxcbu.fr-3.platformsh.site';

console.log('==========================================');
console.log('🚀 Bridge XHTTP - Upsun → VPS');
console.log(`📡 VPS cible: ${VPS_HOST}:${VPS_PORT}`);
console.log(`🔑 UUID: ${UUID}`);
console.log(`🌐 Domaine Upsun: ${DOMAIN}`);
console.log('==========================================');

const server = http.createServer((req, res) => {
    const url = req.url;
    const clientIp = req.socket.remoteAddress || 'unknown';
    
    // === RATE LIMITING ===
    if (isRateLimited(clientIp)) {
        res.writeHead(429, { 'Content-Type': 'text/plain' });
        res.end('Too Many Requests\n');
        console.log(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
        return;
    }
    
    // En-têtes de cache
    const cacheHeaders = {
        'Cache-Control': 'public, max-age=60',
        'Content-Type': 'text/plain'
    };
    
    // Route principale
    if (url === '/') {
        res.writeHead(200, cacheHeaders);
        res.end(`Serveur XHTTP OK\n\nLiens disponibles:\n- /config\n- /${UUID}\n- /${VPS_IP}\n`);
        console.log(`📄 Page d'accueil affichée (${clientIp})`);
        return;
    }
    
    // Générer le lien VLESS
    if (url === `/${UUID}` || url === '/config' || url === `/${VPS_IP}`) {
        const vlessLink = `vless://${UUID}@${DOMAIN}:443?type=xhttp&encryption=none&path=${XHTTP_PATH}&host=${DOMAIN}&mode=${XHTTP_MODE}&x_padding_bytes=${XHTTP_PADDING}&extra=%7B%22xPaddingBytes%22%3A%22${XHTTP_PADDING}%22%7D&security=tls#XHTTP-Upsun`;
        res.writeHead(200, cacheHeaders);
        res.end(vlessLink + '\n');
        console.log(`🔗 Lien VLESS généré (${req.url}) pour ${clientIp}`);
        return;
    }
    
    // Proxy XHTTP vers le VPS
    const options = {
        hostname: VPS_HOST,
        port: VPS_PORT,
        path: url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': HOST_HEADER,
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'accept-encoding': 'gzip, deflate',
            'connection': 'keep-alive',
            'x-padding-bytes': XHTTP_PADDING
        },
        rejectUnauthorized: false
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
        console.log(`✅ Proxy: ${req.method} ${url} → ${proxyRes.statusCode} (${clientIp})`);
    });
    
    proxyReq.on('error', (err) => {
        console.error(`❌ Erreur proxy VPS: ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Bad Gateway: Cannot reach VPS ${VPS_HOST}:${VPS_PORT}\n`);
    });
    
    req.pipe(proxyReq);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Bridge XHTTP actif sur le port ${PORT}`);
    console.log(`🔗 https://${DOMAIN}/config`);
    console.log(`🔗 https://${DOMAIN}/${VPS_IP}`);
});
