const axios = require('axios');
const { Network, ShyftSdk, TxnAction } = require('@shyft-to/js');

const RAYDIUM_AMM_ADDRESS = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";

const registerCallback = async () => {
  const shyft = new ShyftSdk({
    apiKey: process.env.SHYFT_API_KEY,
    network: Network.Mainnet,
  });
console.log(`${process.env.API_URL}/api/callback`)
  await shyft.callback.register({
    network: Network.Mainnet,
    addresses: [RAYDIUM_AMM_ADDRESS],
    callbackUrl: `${process.env.API_URL}/api/callback`,
    events: [TxnAction.SWAP, TxnAction.ADD_LIQUIDITY, TxnAction.REMOVE_LIQUIDITY],
  });
  console.log("success");
};

const ACTIONS = [
  TxnAction.ADD_LIQUIDITY,
  TxnAction.REMOVE_LIQUIDITY,
  TxnAction.SWAP,
  TxnAction.CREATE_POOL,
];

const handleCallback = async (req, res, next) => {
  try {
    console.log(req)
    const body = req.body;

    if (
      !body.type ||
      !body.actions ||
      body.status !== "Success" ||
      !ACTIONS.includes(body.type)
    ) {
      return res.status(400).json({ message: "Invalid callback data" });
    }

    console.dir(body, { depth: null });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error handling callback:", error);
    // res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  registerCallback,
  handleCallback
};