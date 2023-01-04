const router = require("express").Router();
const { getPredictionContract } = require("../utils/helper-functions");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  if (req.query.contestId && mongoose.ConnectionStates.connected) {
    const contract = await getPredictionContract();
    const priceData = await contract?.getLatestPrice(req.query.contestId);

    const price =
      parseInt(priceData[0].toString()) /
      10 ** parseInt(priceData[1].toString());
    res.status(200).json({
      latestPrice: price,
      decimals: priceData[1].toString(),
    });
  } else if (mongoose.ConnectionStates.disconnected) {
    res.status(404).json({ error: "database disconnected" });
  } else {
    res.status(404).json({ error: "Not Found!" });
  }
});

module.exports = router;
