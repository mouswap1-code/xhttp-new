const http = require('http');

// === CONFIGURATION ===
const VPS_PORT = 80;                                     // Port du VPS par défaut
const DEFAULT_UUID = '00447462-c455-475b-a0b9-680f70dfeb5d';     // UUID par défaut
const XHTTP_PATH = '/';                                  // Path XHTTP
const XHTTP_MODE = 'auto';                               // Mode auto
const XHTTP_PADDING = '100-1000';                        // Padding
const HOST_HEADER = 'ultrategateworld.benbilal237free.xyz'; // Domaine VPS
const FP = 'chrome';
const ALPN = ['h2', 'http/1.1'];

// Port Cloud Run (imposé par Google)
const PORT = process.env.PORT || 8080;

// Récupérer l'URL Cloud Run
const CLOUD_RUN_DOMAIN = process.env.CLOUD_RUN_DOMAIN || 'xhttp-new-646064729527.us-central1.run.app
';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         🚀 XHTTP Bridge - Google Cloud Run → VPS X-UI        ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║ 🎯 Mode:          Génération de liens VLESS par IP/UUID`);
console.log(`║ 🌐 Port:          ${PORT}`);
console.log(`║ 📦 Type:          XHTTP (mode ${XHTTP_MODE})`);
console.log('╚══════════════════════════════════════════════════════════════╝');

// Fonction pour valider une IP (IPv4)
function isValidIP(ip) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
}

// Fonction pour générer un lien VLESS
function generateVlessLink(vpsHost, uuid = DEFAULT_UUID) {
    const extraObj = {
        mode: XHTTP_MODE,
        scMaxEachPostBytes: "1000000",
        xPaddingBytes: XHTTP_PADDING
    };
    const extraEncoded = Buffer.from(JSON.stringify(extraObj)).toString('base64');
    
    return `vless://${uuid}@${vpsHost}:${VPS_PORT}?encryption=none&type=xhttp&path=${encodeURIComponent(XHTTP_PATH)}&host=${HOST_HEADER}&mode=${XHTTP_MODE}&x_padding_bytes=${XHTTP_PADDING}&extra=${extraEncoded}&fp=${FP}&alpn=${ALPN.join('%2C')}#XHTTP-${vpsHost.replace(/\./g, '-')}`;
}

// Fonction pour générer la page HTML
function generateHTML(vpsHost = null, uuid = null) {
    const targetIP = vpsHost || 'Non spécifiée';
    const targetUUID = uuid || DEFAULT_UUID;
    const vlessLink = vpsHost ? generateVlessLink(vpsHost, targetUUID) : null;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>XHTTP Bridge - Google Cloud Run</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: monospace; padding: 2rem; max-width: 800px; margin: 0 auto; background: #0a0e27; color: #e0e0e0; }
        pre { background: #1a1f3a; padding: 1rem; border-radius: 8px; overflow-x: auto; color: #00ff88; font-size: 0.8rem; word-wrap: break-word; white-space: pre-wrap; }
        .success { color: #00ff88; }
        .info { color: #00aaff; }
        .warning { color: #ffaa00; }
        h1 { color: #00ff88; }
        hr { border-color: #1a1f3a; }
        a { color: #00aaff; }
        input { width: 100%; padding: 0.5rem; margin: 0.5rem 0; background: #1a1f3a; border: 1px solid #00ff88; color: #00ff88; border-radius: 4px; }
        button { background: #00ff88; color: #0a0e27; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: bold; }
        button:hover { background: #00cc66; }
        .card { background: #1a1f3a; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    </style>
</head>
<body>
    <h1>🚀 XHTTP Bridge - Google Cloud Run</h1>
    <p class="success">✅ Bridge actif</p>
    
    ${vpsHost ? `
    <div class="card">
        <h2>🎯 Lien généré pour l'IP : ${targetIP}</h2>
        <p>UUID: <strong>${targetUUID}</strong></p>
        <p>Port: <strong>${VPS_PORT}</strong></p>
        <p>Host Header: <strong>${HOST_HEADER}</strong></p>
        <pre id="vlessLink">${vlessLink}</pre>
        <button onclick="copyToClipboard()">📋 Copier le lien</button>
        <p class="info">ℹ️ Utilisez ce lien dans v2rayN / Nekobox / Sing-box</p>
    </div>
    ` : `
    <div class="card">
        <h2>📱 Générer un lien pour une IP spécifique</h2>
        <p>Utilisez l'un de ces formats :</p>
        <pre>https://${CLOUD_RUN_DOMAIN}/IP_DE_VOTRE_VPS</pre>
        <pre>https://${CLOUD_RUN_DOMAIN}/IP_DE_VOTRE_VPS/UUID</pre>
        <p class="info">Exemple : <a href="/188.213.28.174">/${CLOUD_RUN_DOMAIN}/188.213.28.174</a></p>
    </div>
    `}
    
    <hr>
    <h2>📋 Liens disponibles :</h2>
    <ul>
        <li><a href="/">🏠 Accueil</a></li>
        <li><a href="/health">💚 Health check</a></li>
        <li><a href="/config">⚙️ Configuration par défaut</a></li>
        <li><a href="/${DEFAULT_UUID}">🔑 UUID par défaut</a></li>
        <li><a href="/188.213.28.174">🌐 Lien pour 188.213.28.174</a></li>
    </ul>
    <hr>
    <p class="info">ℹ️ Format: <strong>/IP</strong> ou <strong>/IP/UUID</strong></p>
    <p>🟢 Statut: <span class="success">EN LIGNE</span></p>
    
    <script>
        function copyToClipboard() {
            const link = document.getElementById('vlessLink').innerText;
            navigator.clipboard.writeText(link).then(() => {
                alert('Lien copié !');
            });
        }
    </script>
</body>
</html>
    `;
}

const server = http.createServer((req, res) => {
    const url = req.url;
    const now = new Date().toISOString();
    
    // Supprimer le slash au début
    let path = url.slice(1);
    
    // Extraire l'IP et l'UUID optionnel
    let targetIP = null;
    let targetUUID = null;
    
    // Pattern: /IP ou /IP/UUID
    const parts = path.split('/');
    const firstPart = parts[0];
    
    // Vérifier si le premier segment est une IP valide
    if (isValidIP(firstPart)) {
        targetIP = firstPart;
        if (parts.length > 1 && parts[1].length > 0) {
            // Deuxième segment optionnel = UUID
            targetUUID = parts[1];
        }
    }
    
    // === HEALTH CHECK (obligatoire pour Cloud Run) ===
    if (url === '/health' || url === '/healthz') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'X-Health-Check': 'ok'
        });
        res.end(JSON.stringify({ 
            status: 'ok', 
            service: 'xhttp-bridge',
            timestamp: now,
            uptime: process.uptime()
        }));
        console.log(`[${now}] ✅ Health check OK`);
        return;
    }
    
    // === PAGE D'ACCUEIL ===
    if (url === '/' || url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(generateHTML());
        console.log(`[${now}] 📄 Page d'accueil affichée`);
        return;
    }
    
    // === GÉNÉRATION DE LIEN POUR UNE IP SPÉCIFIQUE ===
    if (targetIP) {
        const finalUUID = targetUUID || DEFAULT_UUID;
        const vlessLink = generateVlessLink(targetIP, finalUUID);
        
        // Si c'est une requête API (format texte)
        if (req.headers.accept === 'text/plain' || url.includes('?raw')) {
            res.writeHead(200, { 
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(vlessLink + '\n');
        } else {
            // Sinon afficher une page HTML
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(generateHTML(targetIP, finalUUID));
        }
        console.log(`[${now}] 🔗 Lien VLESS généré pour IP: ${targetIP} (UUID: ${finalUUID.substring(0, 8)}...)`);
        return;
    }
    
    // === GÉNÉRATION DU LIEN VLESS PAR DÉFAUT ===
    if (url === '/config' || url === '/vless' || url === `/${DEFAULT_UUID}`) {
        const vlessLink = generateVlessLink('188.213.28.174', DEFAULT_UUID);
        res.writeHead(200, { 
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(vlessLink + '\n');
        console.log(`[${now}] 🔗 Lien VLESS par défaut généré (${url})`);
        return;
    }
    
    // === PROXY XHTTP VERS LE VPS (pour les requêtes non reconnues) ===
    console.log(`[${now}] 🔄 Proxy: ${req.method} ${url}`);
    
    const options = {
        hostname: '188.213.28.174',
        port: VPS_PORT,
        path: url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': HOST_HEADER,
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
            'accept-encoding': 'gzip, deflate',
            'connection': 'keep-alive',
            'x-padding-bytes': XHTTP_PADDING,
            'x-request-id': Date.now().toString()
        },
        timeout: 60000,
        rejectUnauthorized: false
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
        console.log(`[${now}] ✅ Réponse: ${proxyRes.statusCode} pour ${url}`);
    });
    
    proxyReq.on('error', (err) => {
        console.error(`[${now}] ❌ Erreur proxy: ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Bad Gateway: ${err.message}\n`);
    });
    
    proxyReq.on('timeout', () => {
        proxyReq.destroy();
        res.writeHead(504, { 'Content-Type': 'text/plain' });
        res.end('Gateway Timeout\n');
    });
    
    req.pipe(proxyReq);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Bridge XHTTP démarré sur le port ${PORT}`);
    console.log(`\n📱 NOUVEAUX FORMATS DISPONIBLES :`);
    console.log(`   ➜ https://${CLOUD_RUN_DOMAIN}/IP`);
    console.log(`   ➜ https://${CLOUD_RUN_DOMAIN}/IP/UUID`);
    console.log(`\n📋 EXEMPLES :`);
    console.log(`   ➜ https://${CLOUD_RUN_DOMAIN}/188.213.28.174`);
    console.log(`   ➜ https://${CLOUD_RUN_DOMAIN}/188.213.28.174/00447462-c455-475b-a0b9-680f70dfeb5d`);
    console.log(`\n✅ Prêt !\n`);
});

process.on('SIGTERM', () => {
    console.log('🛑 Arrêt...');
    server.close(() => process.exit(0));
});
