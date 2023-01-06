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
  const maxPlayers = await contract?.getNumOfMaxPlayers();
  const lastRoundPlayers = await contract?.getContestPlayers(
    req.query.contestId
  );
  const startingNumber = parseInt(lastRoundPlayers.toString());
  if (req.query.contestId) {
    let predictions = await contract?.getPredictions(req.query.contestId);
    const priceData = await contract?.getLatestPrice(req.query.contestId);
    const currentPrice =
      parseInt(priceData[0].toString()) /
      10 ** parseInt(priceData[1].toString());
    console.log(currentPrice);
    predictions = predictions.filter((item, i) => i >= startingNumber);

    predictions = predictions.map((item) => ({
      predictedValue: parseFloat(item.predictedValue.toString()),
      predictedAt: parseInt(item.predictedAt.toString()),
      user: item.user.toString(),
      difference: parseFloat(item.difference.toString()),
    }));

    predictions = predictions.map((item) => ({
      ...item,
      difference:
        currentPrice > item.predictedValue
          ? currentPrice - item.predictedValue
          : item.predictedValue - currentPrice,
    }));

    for (let i = 0; i < predictions.length - 1; i++) {
      if (
        predictions[i].difference > predictions[i + 1].difference ||
        (predictions[i].difference === predictions[i + 1].difference &&
          predictions[i].predictedAt > predictions[i + 1].predictedAt)
      ) {
        let temp = predictions[i];
        predictions[i] = predictions[i + 1];
        predictions[i + 1] = temp;
      }
    }

    if (predictions.length > 0) {
      const predictionContract = await getPredictionContract(true);
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

    res.status(200).json(predictions);
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
