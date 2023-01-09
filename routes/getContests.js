const { getPredictionContract } = require("../utils/helper-functions");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const contract = await getPredictionContract(false);
  const contests = await contract.getContests();
  const allContests = contests.map((item) => ({
    id: parseInt(item.id.toString()),
  }));
  res.status(200).json(allContests);
});

module.exports = router;
