const router = require("express").Router();
const { getPredictionContract } = require("../utils/helper-functions");
const { array } = require("../constants/constants");
const User = require("../models/User");
const Contests = require("../models/Contest");
const { default: mongoose } = require("mongoose");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

const KEY = process.env.PRIVATE_KEY || "";
const acc = process.env.ADDRESS || "";

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

router.get("/", async (req, res) => {
  if (req.query.contestId && mongoose.ConnectionStates.connected) {
    setRewardArray();
    const contract = await getPredictionContract();
    const data = await contract?.getPredictions(req.query.contestId);
    const tx = await contract?.predict(1, 1999);
    console.log(tx);
    const numOfMaxPlayers = await contract?.getNumOfMaxPlayers();
    console.log(`max players = ${parseInt(numOfMaxPlayers.toString())}`);
    const currentPriceData = await contract?.getLatestPrice(
      req.query.contestId
    );
    const currentPrice =
      parseInt(currentPriceData[0].toString()) / 10 ** currentPriceData[1];
    console.log(currentPrice);
    let predictions = [];
    const contest = await Contests.findOne({
      contestId: parseInt(req.query.contestId.toString()),
    });
    contest.predictions.map((item) => {
      predictions.push({
        predictedValue: parseFloat(item.predictedValue.toString()),
        user: item.user.toString(),
        predictedAt: parseInt(item.predictedAt.toString()),
        difference: parseFloat(item.difference.toString()),
      });
    });

    if (predictions.length < parseInt(numOfMaxPlayers.toString())) {
      const entranceFee = await contract.getEntranceFee();
      const fee = parseFloat(
        ethers.utils.formatEther(entranceFee.toString()).toString()
      );
      for (let i = 0; i < predictions.length; i++) {
        const user = await User.findOne({
          address: predictions[i].user.toLowerCase(),
        });
        const newBalance = user.walletBalance + fee;
        user.walletBalance = newBalance;
        contest.predictions = [];
        await user.save();
        await contest.save();
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
      for (let i = 0; i < predictions.length; i++) {
        if (
          i + 1 <= predictions.length - 1 &&
          (predictions[i].difference > predictions[i + 1].difference ||
            (predictions[i].difference === predictions[i + 1].difference &&
              predictions[i].predictedAt > predictions[i + 1].difference))
        ) {
          let temp = predictions[i];
          predictions[i] = predictions[i + 1];
          predictions[i + 1] = temp;
        }
      }

      for (let i = 0; i < predictions.length; i++) {
        const user = await User.findOne({
          address: predictions[i].user.toLowerCase(),
        });
        const newBalance = user.walletBalance + rewardList[i];
        user.walletBalance = newBalance;
        await user.save();
        contest.predictions = [];
        await contest.save();
      }
    }
    res.status(200).json({
      predictions: predictions,
    });
  }
});

module.exports = router;
