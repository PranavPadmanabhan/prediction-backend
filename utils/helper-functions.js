const ethers = require("ethers");
const {
  contractAddress,
  ABI,
  rewardsForFirst,
  rewardsForSecond,
  rewardsForThird,
} = require("../constants/constants");
const dotenv = require("dotenv");

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS_ENCRYPTED;
const PRIVATE_KEY = process.env.PRIVATE_KEY_ENCRYPTED;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL_ENCRYPTED;

const getPredictionContract = async (signerRequired = false) => {
  // console.log(contractAddress[ch ainId]);

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

  contract?.on("ResultAnnounced", async () => {
    try {
      getResult();
      console.log("Announcing Result");
    } catch (error) {
      console.error(error);
    }
  });
};

let rewardList = [];
let rewardArrayList1 = [];
let rewardArrayList2 = [];
let rewardArrayList3 = [];

function setRewardArray(fee) {
  for (let i = 0; i < 100; i++) {
    if (i < 3) {
      rewardArrayList1.push(
        ethers.utils.parseEther(rewardsForFirst[i].toString())
      );
    } else if (i >= 3 && i < 6) {
      rewardArrayList1.push(
        ethers.utils.parseEther(rewardsForFirst[3].toString())
      );
    } else if (i >= 7 && i < 10) {
      rewardArrayList1.push(
        ethers.utils.parseEther(rewardsForFirst[4].toString())
      );
    } else if (i >= 10 && i < 15) {
      rewardArrayList1.push(
        ethers.utils.parseEther(rewardsForFirst[5].toString())
      );
    } else if (i >= 16 && i < 25) {
      rewardArrayList1.push(
        ethers.utils.parseEther(rewardsForFirst[6].toString())
      );
    } else if (i >= 26 && i < 50) {
      rewardArrayList1.push(
        ethers.utils.parseEther(rewardsForFirst[7].toString())
      );
    } else {
      rewardArrayList1.push(
        ethers.utils.parseEther(rewardsForFirst[8].toString())
      );
    }
  }
  for (let i = 0; i < 100; i++) {
    if (i < 3) {
      rewardArrayList2.push(
        ethers.utils.parseEther(rewardsForSecond[i].toString())
      );
    } else if (i >= 3 && i < 6) {
      rewardArrayList2.push(
        ethers.utils.parseEther(rewardsForSecond[3].toString())
      );
    } else if (i >= 7 && i < 10) {
      rewardArrayList2.push(
        ethers.utils.parseEther(rewardsForSecond[4].toString())
      );
    } else if (i >= 10 && i < 15) {
      rewardArrayList2.push(
        ethers.utils.parseEther(rewardsForSecond[5].toString())
      );
    } else if (i >= 16 && i < 25) {
      rewardArrayList2.push(
        ethers.utils.parseEther(rewardsForSecond[6].toString())
      );
    } else if (i >= 26 && i < 50) {
      rewardArrayList2.push(
        ethers.utils.parseEther(rewardsForSecond[7].toString())
      );
    } else {
      rewardArrayList2.push(
        ethers.utils.parseEther(rewardsForSecond[8].toString())
      );
    }
  }

  for (let i = 0; i < 100; i++) {
    if (i < 3) {
      rewardArrayList3.push(
        ethers.utils.parseEther(rewardsForThird[i].toString())
      );
    } else if (i >= 3 && i < 6) {
      rewardArrayList3.push(
        ethers.utils.parseEther(rewardsForThird[3].toString())
      );
    } else if (i >= 7 && i < 10) {
      rewardArrayList3.push(
        ethers.utils.parseEther(rewardsForThird[4].toString())
      );
    } else if (i >= 10 && i < 15) {
      rewardArrayList3.push(
        ethers.utils.parseEther(rewardsForThird[5].toString())
      );
    } else if (i >= 16 && i < 25) {
      rewardArrayList3.push(
        ethers.utils.parseEther(rewardsForThird[6].toString())
      );
    } else if (i >= 26 && i < 50) {
      rewardArrayList3.push(
        ethers.utils.parseEther(rewardsForThird[7].toString())
      );
    } else {
      rewardArrayList3.push(
        ethers.utils.parseEther(rewardsForThird[8].toString())
      );
    }
  }
}

const getRewardArray = (fee) => {
  switch (fee) {
    case 0.0005:
      rewardList = rewardArrayList1;
      break;
    case 0.00075:
      rewardList = rewardArrayList2;
      break;
    case 0.001:
      rewardList = rewardArrayList3;
      break;
    default:
      rewardList = rewardArrayList1;
      break;
  }
};

const getResult = async () => {
  const contract = await getPredictionContract(false);
  const contests = await contract.getNumOfContests();
  const numOfContests = parseInt(contests.toString());
  const playersData = await contract.getNumOfMaxPlayers();
  const maxPlayers = parseInt(playersData.toString());
  for (let i = 0; i < numOfContests; i++) {
    const contest = await contract?.getContest(i + 1);
    const entranceFee = parseFloat(
      ethers.utils.formatEther(contest.entranceFee.toString()).toString()
    );
    getRewardArray(entranceFee);
    const lastNum = await contract.getContestPlayers(i + 1);
    const startingNumber = parseInt(lastNum.toString());
    const priceData = await contract.getLatestPrice(i + 1);
    const currentPrice = parseInt(priceData[0].toString());
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

    if (!priceData || priceData === (null || undefined || "")) {
      let addressesListForRefund = [];
      const limit = 500;
      for (let i = 0; i < predictions.length; i += limit) {
        const divided = addresses.slice(i, i + limit);
        addressesListForRefund.push(divided);
      }

      for (let j = 0; j < addressesListForRefund.length; j++) {
        const tx = await predictionContract?.Refund(addressesListForRefund[j], {
          gasLimit: 500000,
        });
        const rec = await tx.wait(1);
        const { gasUsed, effectiveGasPrice } = rec;
        console.log(
          `group - ${j + 1} transaction -  ${ethers.utils
            .formatEther(gasUsed.mul(effectiveGasPrice).toString())
            .toString()}`
        );
      }
    } else {
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

      let addressList = [];
      let rewardArrayList = [];

      const addresses = predictions.map((item) => item.user);

      const limit = 500;
      for (let i = 0; i < addresses.length; i += limit) {
        const divided = addresses.slice(i, i + limit);
        addressList.push(divided);
      }

      for (let i = 0; i < rewardList.length; i += limit) {
        const divided = rewardList.slice(i, i + limit);
        rewardArrayList.push(divided);
      }

      const predictionContract = await getPredictionContract(true);
      const bal = await predictionContract.signer.getBalance();
      const balance = parseFloat(
        ethers.utils.formatEther(bal.toString()).toString()
      );

      for (let j = 0; j < addressList.length; j++) {
        if (
          addresses.length > 0 &&
          balance >= 0.005 &&
          addresses.length < maxPlayers
        ) {
          const tx = await predictionContract?.Refund(i + 1, addressList[j], {
            gasLimit: 500000,
          });
          const rec = await tx.wait(1);
          const { gasUsed, effectiveGasPrice } = rec;
          console.log(
            `group - ${j + 1} transaction -  ${ethers.utils
              .formatEther(gasUsed.mul(effectiveGasPrice).toString())
              .toString()}`
          );
        } else if (
          addresses.length > 0 &&
          balance >= 0.005 &&
          addresses.length >= maxPlayers
        ) {
          const tx = await predictionContract?.setReward(
            addressList[j],
            rewardArrayList[j],
            {
              gasLimit: 500000,
            }
          );
          await predictionContract?.updateWinnerList(addressList[j], i + 1, {
            gasLimit: 500000,
          });
          const rec = await tx.wait(1);
          const { gasUsed, effectiveGasPrice } = rec;
          console.log(
            ethers.utils
              .formatEther(gasUsed.mul(effectiveGasPrice).toString())
              .toString()
          );
        }
      }

      await predictionContract.declareCompletetion(i + 1);
    }
  }
  console.log("result published..");
};

const checkResultStatus = async () => {
  const contract = await getPredictionContract(false);
  const interval = await contract?.getInterval();
  let expire;
  setInterval(async () => {
    let lastTime = await contract?.getLatestTimeStamp();
    let timeStamp = parseInt(lastTime.add(interval).toString());
    let date = timeStamp + 120;
    expire = new Date(date * 1000).getTime();
    let now = new Date().getTime();
    let distance = expire - now;
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var sec = seconds < 10 ? "0" + seconds : seconds;
    console.log(hours + ":" + minutes + ":" + sec);
    if (distance <= 0) {
      const predictionContract = await getPredictionContract(true);
      // clearInterval(x);
      const tx = await predictionContract?.updateTimeStamp();
      await tx.wait(1);
      lastTime = await predictionContract?.getLatestTimeStamp();
    }
  }, 1000);
};

module.exports = {
  getPredictionContract,
  listenForResult,
  checkResultStatus,
  setRewardArray,
};
