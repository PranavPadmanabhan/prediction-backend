const { getPredictionContract } = require("../utils/helper-functions");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const contract = await getPredictionContract(false);
  const maxPlayers = await contract?.getNumOfMaxPlayers();
  const round = await contract?.getContestRound();
  const startingNumber =
    parseInt(maxPlayers.toString()) * parseInt(round.toString());
  let response = [];
  if (req.query.contestId) {
    const predictions = await contract?.getPredictions(req.query.contestId);
    for (let i = startingNumber; i < predictions.length; i++) {
      response.push({
        predictedValue: parseFloat(predictions[i].predictedValue.toString()),
        predictedAt: parseInt(predictions[i].predictedAt.toString()),
        user: predictions[i].user.toString(),
        difference: parseFloat(predictions[i].difference.toString()),
      });
    }
    res.status(200).json(response);
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
