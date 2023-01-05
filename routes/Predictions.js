const { getPredictionContract } = require("../utils/helper-functions");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const contract = await getPredictionContract(false);
  const lastRoundPlayers = await contract?.getContestPlayers(
    req.query.contestId
  );
  const startingNumber = parseInt(lastRoundPlayers.toString());

  if (req.query.contestId) {
    let predictions = await contract?.getPredictions(req.query.contestId);
    predictions = predictions.map((item, i) => {
      if (i >= startingNumber) {
        return {
          predictedValue: parseFloat(item.predictedValue.toString()),
          predictedAt: parseInt(item.predictedAt.toString()),
          user: item.user.toString(),
          difference: parseFloat(item.difference.toString()),
        };
      }
    });
    res.status(200).json(predictions);
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
