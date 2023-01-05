const { getPredictionContract } = require("../utils/helper-functions");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const contract = await getPredictionContract(false);
  const lastRoundPlayers = await contract?.getContestPlayers(
    req.query.contestId
  );
  const lastTimestamp = await contract?.getLatestTimeStamp();
  const timestamp = parseInt(lastTimestamp.toString());
  const startingNumber = parseInt(lastRoundPlayers.toString());

  if (req.query.contestId) {
    let predictions = await contract?.getPredictions(req.query.contestId);
    let result = predictions.filter((item, i) => i >= startingNumber);
    res.status(200).json(
      result.map((item) => ({
        predictedValue: item.predictedValue.toString(),
        predictedAt: item.predictedAt.toString(),
        user: item.user.toString(),
        difference: item.difference.toString(),
      }))
    );
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
