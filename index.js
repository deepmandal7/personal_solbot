const dotenv = require('dotenv');
const http = require('http');
const localtunnel = require('localtunnel');
const  { HttpProvider } =  require("@bloxroute/solana-trader-client-ts")
const { registerCallback, getCallbackList, updateCallback } = require("./pool_listener");
const { submitTx, submitFrontRunningProtectionTx, submitBatchTx, submitBundleBatchTx } = require("./swap")

dotenv.config();

const LAMPORTS_PER_SOL = 1000000000
const MICROLAMPORTS_PER_SOL = LAMPORTS_PER_SOL * 1000000

async function main() {
    const PORT = process.env.PORT || 3000;

    console.log('Setting up provider...')
    const provider = new HttpProvider(
        process.env.BX_AUTH_HEADER,
        process.env.PRIVATE_KEY,
        process.env.BX_API_URL,
    )
    console.log('Provider is set')

    let txData = {
        ownerAddress: process.env.WALLET_ADDRESS,
        inToken: process.env.IN_TOKEN,
        outToken: process.env.OUT_TOKEN,
        inAmount: process.env.IN_AMOUNT,
        slippage: process.env.BUY_SLIPPAGE,
        computePrice: String((parseFloat(process.env.BUY_PRIORITY_FEE) * LAMPORTS_PER_SOL)),
    }

    const tripleZero = process.env.BUY_FRONT_RUNNING_PROTECTION == 0 && process.env.BUY_BUNDLE == 0 && process.env.BUY_BATCH == 0

    let buyTx

    const server = http.createServer(
        (req, res) => {
        if (req.method === 'POST' && req.url === '/api/callback') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    if(req.data) {
                        console.log('-----Pool created-----')
                        if (tripleZero) {
                            buyTx = await submitTx(provider, txData)
                        }
                        console.log('Tx Complete')
                        res.statusCode = 200
                        res.end('Success');   
                    }
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

    server.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        (async () => {
        const tunnel = await localtunnel({ port: PORT });
        tunnel.on('close', () => {
            // tunnels are closed
          });
        console.log('Tunnel URL is', tunnel.url)
        console.log("Fetching listener...");
        const callbackList = await getCallbackList()
        if (callbackList.length < 1) {
            console.log("Listener not found. Creating...");
            await registerCallback(tunnel.url)
            console.log("Listener created.");
        } else {
            console.log("Listener found")
            if(callbackList[0].addresses[0] === process.env.OUT_TOKEN && callbackList[0].callback_url === tunnel.url + '/api/callback') {
                console.log("Update not required")
            } else {
                console.log("Updating listener...")
                await updateCallback(callbackList[0]._id, tunnel.url)
                console.log("Updated listener")
            }
        }
        console.log(`Listening for ${process.env.OUT_TOKEN}`)
        })()
    });
}
main()