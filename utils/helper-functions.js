const ethers = require("ethers");
const { contractAddress, ABI } = require("../constants/constants");
const dotenv = require("dotenv");
var CryptoJS = require("crypto-js");

dotenv.config();

const decrypt = (value) => {
  var bytes = CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

const getPredictionContract = async (signerRequired = false) => {
  // console.log(contractAddress[ch ainId]);
  const CONTRACT_ADDRESS = decrypt(process.env.CONTRACT_ADDRESS_ENCRYPTED);
  const PRIVATE_KEY = decrypt(process.env.PRIVATE_KEY_ENCRYPTED);
  const GOERLI_RPC_URL = decrypt(process.env.GOERLI_RPC_URL_ENCRYPTED);
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

const listenForResult = async () => {
  const contract = await getPredictionContract(true);

  await new Promise(async (resolve, reject) => {
    contract?.on("ResultAnnounced", async () => {
      try {
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

let rewardList = [];

function setRewardArray() {
  for (let i = 0; i < 100; i++) {
    if (i < 3) {
      rewardList.push(ethers.utils.parseEther(array[i].toString()));
    } else if (i >= 3 && i < 6) {
      rewardList.push(ethers.utils.parseEther(array[3].toString()));
    } else if (i >= 7 && i < 10) {
      rewardList.push(ethers.utils.parseEther(array[4].toString()));
    } else if (i >= 10 && i < 15) {
      rewardList.push(ethers.utils.parseEther(array[5].toString()));
    } else if (i >= 16 && i < 25) {
      rewardList.push(ethers.utils.parseEther(array[6].toString()));
    } else if (i >= 26 && i < 50) {
      rewardList.push(ethers.utils.parseEther(array[7].toString()));
    } else {
      rewardList.push(ethers.utils.parseEther(array[8].toString()));
    }
  }
}

const getResult = async () => {
  setRewardArray();
  const contract = await getPredictionContract(false);
  const contests = await contract.getNumOfContests();
  const numOfContests = parseInt(contests.toString());
  for (let i = 0; i < numOfContests; i++) {
    const lastNum = await contract.getContestPlayers(i + 1);
    const startingNumber = parseInt(lastNum.toString());
    const priceData = await contract.getLatestPrice(i + 1);
    const currentPrice =
      parseInt(priceData[0].toString()) /
      10 ** parseInt(priceData[1].toString());
    const data = await contract.getPredictions(i + 1);
    let predictions = data.map((item) => ({
      predictedValue: parseFloat(item.predictedValue.toString()),
      predictedAt: parseInt(item.predictedAt.toString()) * 1000,
      user: item.user.toString(),
      difference: parseFloat(item.difference.toString()),
    }));

    predictions = predictions.filter((item, i) => {
      if (i >= startingNumber) {
        return item;
      }
    });

    for (let i = 0; i < predictions.length; i++) {
      if (currentPrice > predictions[i].predictedValue) {
        predictions[i].difference =
          currentPrice - predictions[i].predictedValue;
      } else {
        predictions[i].difference =
          predictions[i].predictedValue - currentPrice;
      }
    }

    predictions = predictions.sort((a, b) => {
      if (
        a.difference > b.difference ||
        (a.difference === b.difference && a.predictedAt > b.predictedAt)
      ) {
        return 1;
      } else if (
        a.difference < b.difference ||
        (a.difference === b.difference && a.predictedAt < b.predictedAt)
      ) {
        return -1;
      } else {
        return 0;
      }
    });

    const addresses = predictions.map((item) => item.user);
    const predictionContract = await getPredictionContract(true);
    const balance = parseFloat(
      ethers.utils
        .formatEther(await predictionContract.signer.getBalance().toString())
        .toString()
    );

    // if (addresses.length > 0 && balance >= 0.005) {
    //   const tx = await predictionContract?.automateResult(
    //     addresses,
    //     rewardList,
    //     i+1,
    //     {
    //       gasLimit: 10000000,
    //     }
    //   );
    //   const rec = await tx.wait(1);
    //   const { gasUsed, effectiveGasPrice } = rec;
    //   console.log(
    //     ethers.utils
    //       .formatEther(gasUsed.mul(effectiveGasPrice).toString())
    //       .toString()
    //   );
    // }
  }
};

module.exports = {
  getPredictionContract,
  listenForResult,
};
