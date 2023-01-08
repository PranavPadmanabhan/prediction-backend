const router = require("express").Router();
const { getPredictionContract } = require("../utils/helper-functions");
const { array } = require("../constants/constants");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

const KEY = process.env.PRIVATE_KEY || "";
const acc = process.env.ADDRESS || "";

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

router.get("/", async (req, res) => {
  setRewardArray();
  const contract = await getPredictionContract(false);
  const lastNum = await contract.getContestPlayers(req.query.contestId);
  const startingNumber = parseInt(lastNum.toString());
  const priceData = await contract.getLatestPrice(req.query.contestId);
  const currentPrice =
    parseInt(priceData[0].toString()) / 10 ** parseInt(priceData[1].toString());
  if (req.query.contestId) {
    const data = await contract.getPredictions(req.query.contestId);
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
        .formatEther(
          await (await predictionContract.signer.getBalance()).toString()
        )
        .toString()
    );

    if (addresses.length > 0 && balance >= 0.005) {
      const tx = await predictionContract?.automateResult(
        addresses,
        rewardList,
        req.query.contestId,
        {
          gasLimit: 10000000,
        }
      );
      const rec = await tx.wait(1);
      const { gasUsed, effectiveGasPrice } = rec;
      console.log(
        ethers.utils
          .formatEther(gasUsed.mul(effectiveGasPrice).toString())
          .toString()
      );
    }

    res
      .status(200)
      .json({ results: predictions, rewards: rewardList, currentPrice });
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
