const dotenv = require('dotenv');
const http = require('http');
const localtunnel = require('localtunnel');
const  { HttpProvider } =  require("@bloxroute/solana-trader-client-ts")
const { registerCallback, getCallbackList, updateCallback } = require("./pool_listener");
const { submitTx, submitFrontRunningProtectionTx, submitBatchTx, submitBundleBatchTx } = require("./swap")

dotenv.config();

(async () => {
  const tunnel = await localtunnel({ port: 3000 });

  // the assigned public url for your tunnel
  // i.e. https://abcdefgjhij.localtunnel.me
  tunnel.url;

  tunnel.on('close', () => {
    // tunnels are closed
  });
})();

async function main() {
    const PORT = process.env.PORT || 3000;

    console.log("Fetching listener...");
    const callbackList = await getCallbackList()
    if (callbackList.length < 1) {
        console.log("Listener not found. Creating...");
        await registerCallback()
        console.log("Listener created.");
    } else {
        console.log("Listener found. Checking for update...")
        if(callbackList[0].addresses[0] === process.env.OUT_TOKEN && callbackList[0].callback_url === process.env.API_URL + '/api/callback') {
            console.log("Update not required")
        } else {
            console.log("Updating listener...")
            await updateCallback(callbackList[0]._id)
            console.log("Updated listener")
        }
    }
    console.log(`Listening for ${process.env.OUT_TOKEN}`)

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
                    console.log('-----Pool created-----')
                    if (tripleZero) {
                        buyTx = await submitTx(provider, txData, swapType)
                    }
                    res.statusCode = 200
                    res.end('Success');
                    
                    // const tx = await createSwapTxn(process.env.IN_TOKEN, process.env.OUT_TOKEN, process.env.IN_AMOUNT, process.env.BUY_SLIPPAGE, process.env.BUY_PRIORITY_FEE, process.env.BUY_TIP)
                    // if (process.env.BUY_BUNDLE == 1) {
                    //     await submitSignedTransactionBatch(tx, true)
                    // } else if (process.env.BUY_FRONT_RUNNING_PROTECTION == 1) {
                    //     await submitSignedTransaction(tx, true)
                    // } else if (process.env.BUY_FRONT_RUNNING_PROTECTION == 0) {
                    //     await submitSignedTransaction(tx, false)
                    // }    
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
        // if (tripleZero) {
        //     buyTx = await submitTx(provider, txData, swapType)
        // }
        //  else if (process.env.BUY_FRONT_RUNNING_PROTECTION == 1 && process.env.BUY_BUNDLE == 0 && process.env.BUY_BATCH == 0) {
        //     await submitFrontRunningProtectionTx(1)
        // } else if (process.env.BUY_FRONT_RUNNING_PROTECTION == 0 && process.env.BUY_BUNDLE == 0 && process.env.BUY_BATCH == 1) {
        //     await submitBatchTx(1)
        // } else if (process.env.BUY_FRONT_RUNNING_PROTECTION == 0 && process.env.BUY_BUNDLE == 1 && process.env.BUY_BATCH == 1) {
        //     await submitBundleBatchTx(1)
        // }

        // console.log("Fetching listener...");
        // const callbackList = await getCallbackList()
        // if (callbackList.length < 1) {
        //     console.log("Listener not found. Creating...");
        //     await registerCallback()
        //     console.log("Listener created.");
        // } else {
        //     console.log("Listener found. Checking for update...")
        //     if(callbackList[0].addresses[0] === process.env.OUT_TOKEN && callbackList[0].callback_url === process.env.API_URL + '/api/callback') {
        //         console.log("Update not required")
        //     } else {
        //         console.log("Updating listener...")
        //         await updateCallback(callbackList[0]._id)
        //         console.log("Updated listener")
        //     }
        // }
        // console.log(`Listening for ${process.env.OUT_TOKEN}`)
    });
}
main()