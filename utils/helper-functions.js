const ethers = require("ethers");
const { contractAddress, ABI } = require("../constants/constants");
const dotenv = require("dotenv");
const User = require("../models/User");
const Predictions = require("../models/Predictions");
const Contests = require("../models/Contest");
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const getPredictionContract = async () => {
  // console.log(contractAddress[chainId]);
  let id = 5;
  const provider = new ethers.providers.WebSocketProvider(GOERLI_RPC_URL);

  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  return contract;
};

const listenWalletTopUps = async () => {
  const contract = await getPredictionContract();
  await new Promise((resolve, reject) => {
    contract.on("TopUpSuccessfull", async (value, address) => {
      try {
        const amount = parseFloat(
          ethers.utils.formatEther(value.toString()).toString()
        );
        const user = await User.findOne({
          address: address.toLowerCase(),
        });
        if (user) {
          const updatedBalance = user.walletBalance + amount;
          user.walletBalance = updatedBalance;
          user.save();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

const listenWithdraw = async () => {
  const contract = await getPredictionContract();
  await new Promise((resolve, reject) => {
    contract.on("WithdrawSuccessfull", async (value, address) => {
      try {
        const amount = parseFloat(
          ethers.utils.formatEther(value.toString()).toString()
        );
        const user = await User.findOne({
          address: address.toLowerCase(),
        });
        if (user) {
          const updatedBalance = user.walletBalance - amount;
          user.walletBalance = updatedBalance;
          user.save();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

const listenToPredictions = async () => {
  const contract = await getPredictionContract();
  const entranceFee = await contract.getEntranceFee();
  const fee = parseFloat(
    ethers.utils.formatEther(entranceFee.toString()).toString()
  );
  await new Promise((resolve, reject) => {
    contract.on(
      "NewPrediction",
      async (value, time, difference, address, contestId) => {
        try {
          const user = await User.findOne({
            address: address.toLowerCase(),
          });

          const contest = await Contests.findOne({
            contestId: parseInt(contestId),
          });
          if (user) {
            const newPrediction = new Predictions({
              predictedValue: value.toString(),
              predictedAt: time.toString(),
              difference: difference.toString(),
              user: address.toString(),
              contestId: contestId.toString(),
            });
            contest.predictions = [...contest.predictions, newPrediction];
            await contest.save();
            const updatedBalance = user.walletBalance - fee;
            user.walletBalance = updatedBalance;
            user.predictions = [...user.predictions, newPrediction];
            await user.save();
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

const listenForResult = async () => {
  const contract = await getPredictionContract();
  const entranceFee = await contract.getEntranceFee();
  const fee = parseFloat(
    ethers.utils.formatEther(entranceFee.toString()).toString()
  );
  await new Promise((resolve, reject) => {
    contract.on("ResultPublishing", async () => {
      try {
        publishResult();
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
      rewardList.push(array[i]);
    } else if (i >= 3 && i < 6) {
      rewardList.push(array[3]);
    } else if (i >= 7 && i < 10) {
      rewardList.push(array[4]);
    } else if (i >= 10 && i < 15) {
      rewardList.push(array[5]);
    } else if (i >= 16 && i < 25) {
      rewardList.push(array[6]);
    } else if (i >= 26 && i < 50) {
      rewardList.push(array[7]);
    } else {
      rewardList.push(array[8]);
    }
  }
}

const publishResult = async () => {
  const contract = await getPredictionContract();
  const tx = await contract?.automateResult({ gasLimit: 10000000 });
  const rec = await tx.wait(1);
  const { gasUsed, effectiveGasPrice } = rec;
  console.log(
    `gasPrice : ${ethers.utils.formatEther(
      gasUsed.mul(effectiveGasPrice).toString()
    )}`
  );
};

module.exports = {
  getPredictionContract,
  listenWalletTopUps,
  listenWithdraw,
  listenToPredictions,
  listenForResult,
};
