const axios = require('axios');
const { TxnAction, Network } = require('@shyft-to/js');

const getCallbackList = async () => {

  const callbackList = await axios.get(process.env.SHYFT_URL + '/sol/v1/callback/list', {
    headers: {
      "x-api-key": process.env.SHYFT_API_KEY
    }
  })
  return callbackList.data.result
};

const registerCallback = async () => {
  await axios.post(process.env.SHYFT_URL + '/sol/v1/callback/create', {
    "network": Network.Mainnet,
    "addresses": [process.env.OUT_TOKEN],
    "callback_url": process.env.API_URL + '/api/callback',
    "events": [
      TxnAction.CREATE_POOL
    ]
  },
   {
    headers: {
      "x-api-key": process.env.SHYFT_API_KEY
    }
  })
};

const updateCallback = async (callbackId) => {
  await axios.post(process.env.SHYFT_URL + '/sol/v1/callback/update', {
      "id": callbackId,
      "addresses": [process.env.OUT_TOKEN],
      "callback_url": process.env.API_URL + '/api/callback',
    },
     {
      headers: {
        "x-api-key": process.env.SHYFT_API_KEY
      }
    })
}

// const ACTIONS = [
//   TxnAction.SWAP,
//   TxnAction.CREATE_POOL,
// ];

// // const handleCallback = async (req, res, next) => {
// //   try {

// //     const body = req.body;

// //     if (
// //       !body.type ||
// //       !body.actions ||
// //       body.status !== "Success" ||
// //       !ACTIONS.includes(body.type)
// //     ) {
// //       return res.status(400).json({ message: "Invalid callback data" });
// //     }

// //     console.dir(body, { depth: null });

// //     return res.json({ success: true });
// //   } catch (error) {
// //     console.error("Error handling callback:", error);
// //     // res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

module.exports = {
  registerCallback,
  getCallbackList,
  handleCallback,
  updateCallback
};