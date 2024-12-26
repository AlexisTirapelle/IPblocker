const http = require('http');
const requestIp = require('request-ip');


// Lista de IPs ou faixas permitidas (CIDR)
const allowedIPs = [
    // { network: '161.148.0.0', prefix: 16 },  // Intervalo 161.148.0.1 a 161.148.255.254
    // { network: '189.9.0.0', prefix: 16 },    // Intervalo 189.9.0.1 a 189.9.255.254
    // { network: '200.198.192.0', prefix: 18 } // Intervalo 200.198.192.1 a 200.198.255.254
    { network: '191.177.191.204', prefix: 32 }
];

// Função para verificar se um IP está dentro do intervalo CIDR
function isIpAllowed(clientIp) {
    const ipBytes = ipToBytes(clientIp);

    for (const { network, prefix } of allowedIPs) {
        const networkBytes = ipToBytes(network);

        if (isIpInRange(ipBytes, networkBytes, prefix)) {
            return true;
        }
    }

    return false;
}

// Converte um IP em string para array de bytes
function ipToBytes(ip) {
    return ip.split('.').map((octet) => parseInt(octet, 10));
}

// Verifica se o IP está dentro do intervalo CIDR
function isIpInRange(ipBytes, networkBytes, prefix) {
    const bitsToCheck = prefix;

    for (let i = 0; i < ipBytes.length; i++) {
        const mask = 0xFF << (8 - Math.min(bitsToCheck - i * 8, 8));
        if ((ipBytes[i] & mask) !== (networkBytes[i] & mask)) {
            return false;
        }
    }

    return true;
}

// Criação do servidor HTTP
const server = http.createServer((req, res) => {

    const clientIps = requestIp.getClientIp(req);
    console.log("clientIps: " + clientIps);


    console.log("req.headers: " + JSON.stringify(req.headers));

    console.log("x-forwarded-for: " + req.headers['x-forwarded-for']);
    console.log("req.connection.remoteAddress: " + req.connection.remoteAddress);
    console.log("req.socket.remoteAddress: " + req.socket.remoteAddress);
    console.log("req.ip: " + req.ip);
    console.log("req.ip: " + req.ips);


    console.log("antes " + req.socket.remoteAddress);

    // Obtém o IP do cliente
    const clientIp = req.socket.remoteAddress.replace(/^.*:/, ''); // Remove prefixos "::ffff:" para IPv4
    console.log("depois " + clientIp);

    if (!isIpAllowed(clientIp)) {
        // Retorna 403 se o IP não estiver permitido
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Acesso negado: IP não autorizado.\n');
    } else {
        // Retorna 200 se o IP estiver permitido
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bem-vindo! Seu IP está autorizado.\n');
    }
});

// Inicia o servidor na porta 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
