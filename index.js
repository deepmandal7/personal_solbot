const dotenv = require('dotenv');
const http = require('http');
const { registerCallback, handleCallback } = require("./pool_listener")

dotenv.config();

async function main() {
    const PORT = process.env.PORT || 3000;

    const server = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/api/callback') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    handleCallback(data, res);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    res.statusCode = 400;
                    res.end('Invalid JSON');
                }
            });
        } else {
            res.statusCode = 404;
            res.end('Not Found');
        }
    });

    server.listen(PORT, () => {
        registerCallback()
    .then(() => {
        console.log('Callback registration successful');
    })
    .catch((error) => {
    console.error('Callback registration failed:', error);
    });
        console.log(`Server is running on port ${PORT}`);
    });
}
main()