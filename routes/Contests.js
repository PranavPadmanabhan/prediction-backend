const router = require("express").Router();
const Contests = require("../models/Contest");
const { getPredictionContract } = require("../utils/helper-functions");
const { contestTitles } = require("../constants/constants");
const mongoose = require("mongoose");

const createContests = async (contests, res) => {
  let listOfContests = [];
  Contests.collection.find({}).toArray((err, data) => {
    if (data.length !== contests.length) {
      contests.map((contest, i) => {
        console.log(contest.id.toString());
        const newContest = new Contests({
          contestId: contest.id.toString(),
          predictions: [],
          title: contestTitles[i],
        });
        newContest.save();
        listOfContests.push(newContest);
      });
    }
  });
  if (listOfContests.length > 0) {
    res.status(200).json(listOfContests);
  }
};

router.get("/", async (req, res) => {
  if (mongoose.ConnectionStates.connected) {
    const contract = await getPredictionContract();
    const contests = await contract?.getContests();
    const length = contests.length;
    //   console.log(length);
    await createContests(contests, res);
    Contests.collection.find({}).toArray((err, data) => {
      if (data.length == length) {
        res.status(200).json(data);
      }
    });
  } else if (mongoose.ConnectionStates.disconnected) {
    res.status(404).json({ error: "database disconnected" });
  }
});

module.exports = router;
