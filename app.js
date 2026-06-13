const http = require('http');

// Configuration
const VPS_HOST = '188.213.28.174';
const VPS_PORT = 80;
const UUID = '00447462-c455-475b-a0b9-680f70dfeb5d';
const HOST_HEADER = 'ultrategateworld.benbilal237free.xyz';
const XHTTP_PATH = '/';
const XHTTP_MODE = 'auto';
const XHTTP_PADDING = '100-1000';
const PORT = process.env.PORT || 8080;

// Création du serveur
const server = http.createServer((req, res) => {
    const url = req.url;
    
    // Health check (important pour Cloud Run)
    if (url === '/health' || url === '/healthz') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
        return;
    }
    
    // Génération du lien VLESS
    if (url === `/${UUID}` || url === '/config') {
        const extraObj = {
            mode: XHTTP_MODE,
            xPaddingBytes: XHTTP_PADDING
        };
        const extraEncoded = Buffer.from(JSON.stringify(extraObj)).toString('base64');
        
        const vlessLink = `vless://${UUID}@${VPS_HOST}:${VPS_PORT}?encryption=none&type=xhttp&path=${encodeURIComponent(XHTTP_PATH)}&host=${HOST_HEADER}&mode=${XHTTP_MODE}&x_padding_bytes=${XHTTP_PADDING}&extra=${extraEncoded}#XHTTP-CloudRun`;
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(vlessLink + '\n');
        return;
    }
    
    // Proxy vers le VPS
    const options = {
        hostname: VPS_HOST,
        port: VPS_PORT,
        path: url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': HOST_HEADER
        },
        timeout: 30000
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Bad Gateway: ${err.message}`);
    });
    
    req.pipe(proxyReq);
});

// Démarrage du serveur - LIGNE CRITIQUE
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur XHTTP Bridge démarré`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🎯 VPS: ${VPS_HOST}:${VPS_PORT}`);
});

// Gestion des erreurs
server.on('error', (err) => {
    console.error('❌ Erreur serveur:', err.message);
    process.exit(1);
});
