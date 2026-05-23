const http = require('http');

const UUID = 'acac847f-cfc1-4c7c-b7ac-9a1c8a8ca8e9';
const VPS_IP = '188.213.28.174';
const PORT = process.env.PORT || 8080;
const DOMAIN = process.env.DOMAIN || 'main-bvxea6i-yg5fdvxqyxcbu.fr-3.platformsh.site';

const server = http.createServer((req, res) => {
    const url = req.url;
    
    const cacheHeaders = {
        'Cache-Control': 'public, max-age=60',
        'Content-Type': 'text/plain'
    };
    
    if (url === '/') {
        res.writeHead(200, cacheHeaders);
        res.end('Serveur XHTTP OK\n');
        return;
    }
    
    if (url === `/${UUID}`) {
        const vlessLink = `vless://${UUID}@${DOMAIN}:443?type=xhttp&encryption=none&path=/&host=${DOMAIN}&mode=auto&x_padding_bytes=100-1000&security=tls#XHTTP-New`;
        res.writeHead(200, cacheHeaders);
        res.end(vlessLink + '\n');
        return;
    }
    
    if (url === '/config') {
        const vlessLink = `vless://${UUID}@${DOMAIN}:443?type=xhttp&encryption=none&path=/&host=${DOMAIN}&mode=auto&x_padding_bytes=100-1000&security=tls#XHTTP-New`;
        res.writeHead(200, cacheHeaders);
        res.end(vlessLink + '\n');
        return;
    }
    
    if (url === `/${VPS_IP}`) {
        const vlessLink = `vless://${UUID}@${DOMAIN}:443?type=xhttp&encryption=none&path=/&host=${DOMAIN}&mode=auto&x_padding_bytes=100-1000&security=tls#XHTTP-New`;
        res.writeHead(200, cacheHeaders);
        res.end(vlessLink + '\n');
        return;
    }
    
    res.writeHead(404, cacheHeaders);
    res.end('Not Found\n');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur actif sur le port ${PORT}`);
    console.log(`🔗 https://${DOMAIN}/config`);
    console.log(`🔗 https://${DOMAIN}/${VPS_IP}`);
});
