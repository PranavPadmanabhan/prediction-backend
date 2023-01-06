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

    for (let i = 0; i < predictions.length; i++) {
      if (currentPrice > predictions[i].predictedValue) {
        predictions[i].difference =
          currentPrice - predictions[i].predictedValue;
      } else {
        predictions[i].difference =
          predictions[i].predictedValue - currentPrice;
      }
    }

    let differences = predictions.map((item) => item.difference);
    differences = differences.sort();

    let result = [];
    predictions.map((item) => {
      let index = differences.indexOf(item.difference);
      result[index] = item;
      console.log(result[index].toString());
    });

    const addresses = result.map((item) => item.user);

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

    res.status(200).json({
      results: result.map((item) => ({
        predictedValue: item.predictedValue.toString(),
        predictedAt: item.predictedAt.toString(),
        user: item.user.toString(),
        difference: item.difference.toString(),
      })),
      rewards: rewardList.map((item) =>
        ethers.utils.formatEther(item.toString())
      ),
    });
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
