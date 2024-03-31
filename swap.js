const  axios =  require("axios")
const  { HttpProvider } =  require("@bloxroute/solana-trader-client-ts")

const LAMPORTS_PER_SOL = 1000000000
const MICROLAMPORTS_PER_SOL = LAMPORTS_PER_SOL * 1000000

let outAmount

async function submitTx(provider, txData, swaptType = 1) {
    console.log('Creating swap data...')
    if (swaptType == 1) {
    let txData
        txData = await provider.postRaydiumSwap({
        ownerAddress: process.env.WALLET_ADDRESS,
        inToken: process.env.IN_TOKEN,
        outToken: process.env.OUT_TOKEN,
        inAmount: 0.001,
        slippage: 0.1,
        computePrice: String((parseFloat(process.env.BUY_PRIORITY_FEE) * LAMPORTS_PER_SOL)),
    })
    } else {
    txData = {
        "ownerAddress": process.env.WALLET_ADDRESS,
        "inToken": process.env.OUT_TOKEN,
        "outToken": process.env.IN_TOKEN,
        "inAmount": parseFloat(outAmount),
        "slippage": parseFloat(process.env.SELL_SLIPPAGE),
        "computePrice": parseFloat(process.env.SELL_PRIORITY_FEE) * LAMPORTS_PER_SOL,
    }
    }
    console.log('Swap data created', txData)
    console.log('Sending tx...')
    const sign = await provider.signAndSubmitTx({ content: txData.transactions[0].content }, true, false, false)
    return sign && sign.signature ? sign.signature : 'Failed'
}

async function submitFrontRunningProtectionTx(swaptType = 0) {
    let txData
    if (swaptType == 1) {
        txData = {
            "ownerAddress": process.env.WALLET_ADDRESS,
            "inToken": process.env.IN_TOKEN,
            "outToken": process.env.OUT_TOKEN,
            "inAmount": parseFloat(process.env.IN_AMOUNT),
            "slippage": parseFloat(process.env.BUY_SLIPPAGE),
            "computePrice": parseFloat(process.env.BUY_PRIORITY_FEE) * LAMPORTS_PER_SOL,
            "tip": parseFloat(process.env.BUY_TIP) * LAMPORTS_PER_SOL
        }
    } else {
        txData = {
            "ownerAddress": process.env.WALLET_ADDRESS,
            "inToken": process.env.OUT_TOKEN,
            "outToken": process.env.IN_TOKEN,
            "inAmount": parseFloat(outAmount),
            "slippage": parseFloat(process.env.SELL_SLIPPAGE),
            "computePrice": parseFloat(process.env.SELL_PRIORITY_FEE) * LAMPORTS_PER_SOL,
            "tip": parseFloat(process.env.BUY_TIP) * LAMPORTS_PER_SOL
        }
    }
    console.log('Creating swap txn...')
    const createSwapTxn = await axios.post(process.env.BX_API_URL + '/api/v2/raydium/swap', txData, {
        headers: {
            "Authorization": process.env.BX_AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    console.log('Swap txn created')
    const signedTxData = {
        "transaction": {
            "content": createSwapTxn.data.transactions[0].content
        },
        "frontRunningProtection": true
    }
    const submitSignedTransaction = await axios.post(process.env.BX_API_URL + '/api/v2/submit', signedTxData, {
        headers: {
            "Authorization": process.env.BX_AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    console.log(submitSignedTransaction.data)
    return submitSignedTransaction.data
}

async function submitBatchTx(swaptType = 0) {
    let txData
    if (swaptType == 1) {
        txData = {
            "ownerAddress": process.env.WALLET_ADDRESS,
            "inToken": process.env.IN_TOKEN,
            "outToken": process.env.OUT_TOKEN,
            "inAmount": parseFloat(process.env.IN_AMOUNT),
            "slippage": parseFloat(process.env.BUY_SLIPPAGE),
            "computePrice": parseFloat(process.env.BUY_PRIORITY_FEE) * LAMPORTS_PER_SOL,
        }
    } else {
        txData = {
            "ownerAddress": process.env.WALLET_ADDRESS,
            "inToken": process.env.OUT_TOKEN,
            "outToken": process.env.IN_TOKEN,
            "inAmount": parseFloat(outAmount),
            "slippage": parseFloat(process.env.SELL_SLIPPAGE),
            "computePrice": parseFloat(process.env.SELL_PRIORITY_FEE) * LAMPORTS_PER_SOL
        }
    }
    console.log('Creating swap txn...')
    const createSwapTxn = await axios.post(process.env.BX_API_URL + '/api/v2/raydium/swap', txData, {
        headers: {
            "Authorization": process.env.BX_AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    console.log('Swap txn created')
    const signedBatchtxData = {
        "entries": [{ 
            "transaction": {
                "content": createSwapTxn.data.transactions[0].content
            },
        }],
    }
    const submitSignedBatchTransaction = await axios.post(process.env.BX_API_URL + '/api/v2/submit-batch', signedBatchtxData, {
        headers: {
            "Authorization": process.env.BX_AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    console.log(submitSignedBatchTransaction.data)
    return submitSignedBatchTransaction.data
}

async function submitBundleBatchTx(swaptType = 0) {
    let txData
    if (swaptType == 1) {
        txData = {
            "ownerAddress": process.env.WALLET_ADDRESS,
            "inToken": process.env.IN_TOKEN,
            "outToken": process.env.OUT_TOKEN,
            "inAmount": parseFloat(process.env.IN_AMOUNT),
            "slippage": parseFloat(process.env.BUY_SLIPPAGE),
            "computePrice": parseFloat(process.env.BUY_PRIORITY_FEE) * LAMPORTS_PER_SOL,
            "tip": parseFloat(process.env.BUY_TIP) * LAMPORTS_PER_SOL
        }
    } else {
        txData = {
            "ownerAddress": process.env.WALLET_ADDRESS,
            "inToken": process.env.OUT_TOKEN,
            "outToken": process.env.IN_TOKEN,
            "inAmount": parseFloat(outAmount),
            "slippage": parseFloat(process.env.SELL_SLIPPAGE),
            "computePrice": parseFloat(process.env.SELL_PRIORITY_FEE) * LAMPORTS_PER_SOL,
            "tip": parseFloat(process.env.SELL_TIP) * LAMPORTS_PER_SOL
        }
    }
    console.log('Creating swap txn...')
    const createSwapTxn = await axios.post(process.env.BX_API_URL + '/api/v2/raydium/swap', txData, {
        headers: {
            "Authorization": process.env.BX_AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    console.log('Swap txn created')
    const signedBatchtxData = {
        "entries": [{ 
            "transaction": {
                "content": createSwapTxn.data.transactions[0].content
            },
        }],
        "useBundle": true
    }
    const submitSignedBatchTransaction = await axios.post(process.env.BX_API_URL + '/api/v2/submit-batch', signedBatchtxData, {
        headers: {
            "Authorization": process.env.BX_AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    console.log(submitSignedBatchTransaction.data)
    return submitSignedBatchTransaction.data
}

module.exports = {
    submitTx,
    submitFrontRunningProtectionTx,
    submitBatchTx,
    submitBundleBatchTx
}