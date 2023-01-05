const ethers = require("ethers");
const { contractAddress, ABI } = require("../constants/constants");
const dotenv = require("dotenv");

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const getPredictionContract = async (signerRequired = false) => {
  // console.log(contractAddress[chainId]);
  const provider = new ethers.providers.WebSocketProvider(GOERLI_RPC_URL);

  if (signerRequired) {
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    return contract;
  } else {
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    return contract;
  }
};

module.exports = {
  getPredictionContract,
};
