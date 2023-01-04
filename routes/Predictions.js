const router = require("express").Router();
const Contests = require("../models/Contest");
const mongooose = require("mongoose");

router.get("/", async (req, res) => {
  if (req.query.contestId && mongooose.ConnectionStates.connected) {
    const contest = await Contests.findOne({
      contestId: parseInt(req.query.contestId.toString()),
    });
    if (contest) {
      // console.log(contest);
      res.status(200).json(contest.predictions);
    } else {
      res.status(404).json({ error: "Not Found!" });
    }
  } else if (mongooose.ConnectionStates.disconnected) {
    res.status(404).json({ error: "database disconnected" });
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
