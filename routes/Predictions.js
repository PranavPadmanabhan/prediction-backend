const { getPredictionContract } = require("../utils/helper-functions");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const contract = await getPredictionContract(false);
  const maxPlayers = await contract?.getNumOfMaxPlayers();
  const round = await contract?.getContestRound();
  const startingNumber =
    parseInt(maxPlayers.toString()) * parseInt(round.toString());

  if (req.query.contestId) {
    let response = [];
    const predictions = await contract?.getPredictions(req.query.contestId);
    // console.log(predictions.toString());
    for (let i = startingNumber; i < predictions.length; i++) {
      response.push({
        predictedValue: parseFloat(predictions[i].predictedValue.toString()),
        predictedAt: parseInt(predictions[i].predictedAt.toString()),
        user: predictions[i].user.toString(),
        difference: parseFloat(predictions[i].difference.toString()),
      });
    }
    res.status(200).json(
      predictions.map((item) => ({
        predictedValue: parseFloat(item.predictedValue.toString()),
        predictedAt: parseInt(item.predictedAt.toString()),
        user: item.user.toString(),
        difference: parseFloat(item.difference.toString()),
      }))
    );
  } else {
    res.status(404).json({ error: "error" });
  }
});

module.exports = router;
