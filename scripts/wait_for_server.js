const http = require('http');

const url = 'http://localhost:5173';
const timeout = 60000; // 60 seconds
const start = Date.now();

function checkServer() {
    const req = http.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log('Server is up!');
            process.exit(0);
        } else {
            console.log(`Server responded with status: ${res.statusCode}. Retrying...`);
            setTimeout(checkServer, 1000);
        }
    });

    req.on('error', (err) => {
        if (Date.now() - start > timeout) {
            console.error('Timeout waiting for server.');
            process.exit(1);
        }
        console.log(`Error connecting to server: ${err.message}. Retrying...`);
        setTimeout(checkServer, 1000);
    });

    req.end();
}

console.log(`Waiting for server at ${url}...`);
checkServer();
