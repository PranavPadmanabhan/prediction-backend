const router = require("express").Router();
const { getPredictionContract } = require("../utils/helper-functions");

router.get("/", async (req, res) => {
  const contract = await getPredictionContract(true);
  console.log("Starting..");
  for (let i = 0; i < 1000; i++) {
    const tx = await contract.predict(1, 1100 + i);
    console.log(`transaction ${i + 1} confirmed`);

    await tx.wait(1);
  }
  res.status(200).json("Done");
});

module.exports = router;
