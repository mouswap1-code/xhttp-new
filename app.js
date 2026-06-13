const http = require('http');

// === CONFIGURATION ===
const VPS_HOST = '188.213.28.174';                      // IP de ton VPS
const VPS_PORT = 80;                                     // Port du VPS
const UUID = '00447462-c455-475b-a0b9-680f70dfeb5d';     // Ton UUID
const XHTTP_PATH = '/';                                  // Path XHTTP
const XHTTP_MODE = 'auto';                               // Mode auto
const XHTTP_PADDING = '100-1000';                        // Padding
const HOST_HEADER = 'ultrategateworld.benbilal237free.xyz'; // Domaine VPS
const FP = 'chrome';
const ALPN = ['h2', 'http/1.1'];

// Port Cloud Run (imposé par Google)
const PORT = process.env.PORT || 8080;

// Récupérer l'URL Cloud Run (optionnel)
const CLOUD_RUN_DOMAIN = process.env.CLOUD_RUN_DOMAIN || 'localhost';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         🚀 XHTTP Bridge - Google Cloud Run → VPS X-UI        ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║ 📡 VPS cible:     ${VPS_HOST}:${VPS_PORT}`);
console.log(`║ 🔑 UUID:          ${UUID}`);
console.log(`║ 🎯 Host Header:   ${HOST_HEADER}`);
console.log(`║ 🌐 Port:          ${PORT}`);
console.log(`║ 📦 Type:          XHTTP (mode ${XHTTP_MODE})`);
console.log('╚══════════════════════════════════════════════════════════════╝');

const server = http.createServer((req, res) => {
    const url = req.url;
    const now = new Date().toISOString();
    
    // === HEALTH CHECK (obligatoire pour Cloud Run) ===
    if (url === '/health' || url === '/healthz') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'X-Health-Check': 'ok'
        });
        res.end(JSON.stringify({ 
            status: 'ok', 
            service: 'xhttp-bridge',
            vps: VPS_HOST,
            timestamp: now,
            uptime: process.uptime()
        }));
        console.log(`[${now}] ✅ Health check OK`);
        return;
    }
    
    // === PAGE D'ACCUEIL ===
    if (url === '/' || url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>XHTTP Bridge - Google Cloud Run</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: monospace; padding: 2rem; max-width: 800px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; }
                    pre { background: #1a1f3a; padding: 1rem; border-radius: 8px; overflow-x: auto; color: #00ff88; }
                    .success { color: #00ff88; }
                    .info { color: #00aaff; }
                    h1 { color: #00ff88; }
                    hr { border-color: #1a1f3a; }
                    a { color: #00aaff; }
                </style>
            </head>
            <body>
                <h1>🚀 XHTTP Bridge - Google Cloud Run</h1>
                <p class="success">✅ Bridge actif vers VPS X-UI</p>
                <p>📡 VPS cible: <strong>${VPS_HOST}:${VPS_PORT}</strong></p>
                <p>🔑 UUID: <strong>${UUID.substring(0, 8)}...${UUID.substring(UUID.length - 8)}</strong></p>
                <hr>
                <h2>📱 Liens VLESS :</h2>
                <ul>
                    <li><a href="/${UUID}">Configuration principale</a></li>
                    <li><a href="/config">Configuration alternative</a></li>
                </ul>
                <hr>
                <p class="info">ℹ️ Copiez le lien généré dans v2rayN / Nekobox / Sing-box</p>
                <p>🟢 Statut: <span class="success">EN LIGNE</span></p>
            </body>
            </html>
        `);
        console.log(`[${now}] 📄 Page d'accueil affichée`);
        return;
    }
    
    // === GÉNÉRATION DU LIEN VLESS ===
    if (url === `/${UUID}` || url === '/config' || url === '/vless') {
        // Construction du paramètre extra (format base64)
        const extraObj = {
            mode: XHTTP_MODE,
            scMaxEachPostBytes: "1000000",
            xPaddingBytes: XHTTP_PADDING
        };
        const extraEncoded = Buffer.from(JSON.stringify(extraObj)).toString('base64');
        
        // Construction du lien VLESS complet
        const vlessLink = `vless://${UUID}@${VPS_HOST}:${VPS_PORT}?encryption=none&type=xhttp&path=${encodeURIComponent(XHTTP_PATH)}&host=${HOST_HEADER}&mode=${XHTTP_MODE}&x_padding_bytes=${XHTTP_PADDING}&extra=${extraEncoded}&fp=${FP}&alpn=${ALPN.join('%2C')}#XHTTP-Bridge-${CLOUD_RUN_DOMAIN.split('.')[0]}`;
        
        // Lien alternatif avec le domaine Cloud Run comme adresse
        const vlessLinkAlt = `vless://${UUID}@${CLOUD_RUN_DOMAIN}:443?encryption=none&type=xhttp&path=${encodeURIComponent(XHTTP_PATH)}&host=${HOST_HEADER}&mode=${XHTTP_MODE}&x_padding_bytes=${XHTTP_PADDING}&extra=${extraEncoded}&fp=${FP}&alpn=${ALPN.join('%2C')}#XHTTP-Bridge-CloudRun`;
        
        res.writeHead(200, { 
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'X-VLESS-Version': '1.0'
        });
        res.end(vlessLink + '\n\n' + vlessLinkAlt + '\n');
        console.log(`[${now}] 🔗 Lien VLESS généré (${url})`);
        return;
    }
    
    // === PROXY XHTTP VERS LE VPS ===
    console.log(`[${now}] 🔄 Proxy: ${req.method} ${url} → ${VPS_HOST}:${VPS_PORT}`);
    
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
            'x-padding-bytes': XHTTP_PADDING,
            'x-request-id': Date.now().toString()
        },
        timeout: 60000,
        rejectUnauthorized: false
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
            ...proxyRes.headers,
            'x-proxied-by': 'Google-Cloud-Run-XHTTP-Bridge'
        });
        proxyRes.pipe(res);
        console.log(`[${now}] ✅ Réponse: ${proxyRes.statusCode} pour ${url}`);
    });
    
    proxyReq.on('error', (err) => {
        console.error(`[${now}] ❌ Erreur proxy VPS: ${err.message}`);
        res.writeHead(502, { 
            'Content-Type': 'text/plain',
            'x-error': err.message
        });
        res.end(`Bad Gateway: Cannot reach VPS ${VPS_HOST}:${VPS_PORT}\nErreur: ${err.message}\n`);
    });
    
    proxyReq.on('timeout', () => {
        console.error(`[${now}] ⏰ Timeout sur ${url}`);
        proxyReq.destroy();
        res.writeHead(504, { 'Content-Type': 'text/plain' });
        res.end('Gateway Timeout\n');
    });
    
    req.pipe(proxyReq);
});

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Bridge XHTTP démarré sur le port ${PORT}`);
    console.log(`\n📱 LIENS DISPONIBLES :`);
    console.log(`   ➜ https://${CLOUD_RUN_DOMAIN}/`);
    console.log(`   ➜ https://${CLOUD_RUN_DOMAIN}/health`);
    console.log(`   ➜ https://${CLOUD_RUN_DOMAIN}/config\n`);
    console.log(`📋 À tester avec: v2rayN / Nekobox / Sing-box`);
    console.log(`   Type: XHTTP | Host: ${HOST_HEADER} | Port: 443 (Cloud Run)\n`);
});

// Gestion des erreurs serveur
server.on('error', (err) => {
    console.error(`❌ Erreur serveur: ${err.message}`);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Interruption...');
    server.close(() => {
        console.log('✅ Serveur arrêté');
        process.exit(0);
    });
});
