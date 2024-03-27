const  axios =  require("axios")

const LAMPORTS_PER_SOL = 1000000000
const MICROLAMPORTS_PER_SOL = LAMPORTS_PER_SOL * 1000000

async function createSwapTxn() {
    const txData = {
        "ownerAddress": process.env.WALLET_ADDRESS,
        "inToken": process.env.IN_TOKEN,
        "outToken": process.env.OUT_TOKEN,
        "inAmount": process.env.IN_AMOUNT,
        "slippage": process.env.SLIPPAGE,
        "computePrice": process.env.PRIORITY_FEE * LAMPORTS_PER_SOL
    }
    if (process.env.TIP) txData["tip"] = process.env.TIP * LAMPORTS_PER_SOL
    const createSwapTxn = await axios.post(process.env.BLOXROUTE_API_URL + '/api/v2/raydium/swap', txData, {
        headers: {
            "Authorization": process.env.AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    return {
        "transaction": createSwapTxn.data.transactions[0]
    }
}

async function submitSignedTransactionBatch(entries) {
    const batchData = {
        "entries": [...entries],
        "useBundle": true
    }
    const submitSignedTransactionBatch = await axios.post(process.env.BLOXROUTE_API_URL + '/api/v2/submit-batch', batchData, {
        headers: {
            "Authorization": process.env.AUTH_HEADER,
            "Content-Type": "application/json"
        }
    })
    // console.log(submitSignedTransactionBatch.data)
    return submitSignedTransactionBatch.data
}

module.exports = {
    createSwapTxn,
    submitSignedTransactionBatch
}