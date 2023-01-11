const router = require("express").Router();
const { getPredictionContract } = require("../utils/helper-functions");

router.get("/", async (req, res) => {
  const contract = await getPredictionContract();
  const timeData = await contract?.getLatestTimeStamp();
  const date = new Date(parseInt(timeData.toString()) * 1000);
  console.log(date);
  res.status(200).json(date);
});

module.exports = router;
