const http = require('http');

const UUID = 'acac847f-cfc1-4c7c-b7ac-9a1c8a8ca8e9';
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    const url = req.url;
    
    // En-têtes de cache pour toutes les réponses
    const cacheHeaders = {
        'Cache-Control': 'public, max-age=60',
        'Expires': new Date(Date.now() + 60000).toUTCString()
    };
    
    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain', ...cacheHeaders });
        res.end('Serveur XHTTP OK\n');
        return;
    }
    
    if (url === `/${UUID}` || url === '/config') {
        const domain = req.headers.host || 'xhttp-new.upsun.app';
        const vlessLink = `vless://${UUID}@${domain}:443?type=xhttp&encryption=none&path=/&host=${domain}&mode=auto&x_padding_bytes=100-1000&security=tls#XHTTP-New`;
        // Pas de cache pour le lien VLESS (même en-têtes)
        res.writeHead(200, { 'Content-Type': 'text/plain', ...cacheHeaders });
        res.end(vlessLink + '\n');
        return;
    }
    
    res.writeHead(404);
    res.end('Not Found\n');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur actif sur le port ${PORT}`);
    console.log(`🔗 /config`);
});
