const { urlencoded } = require("express");
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
const predictionRoute = require("./routes/Predictions");
const ResultRoute = require("./routes/PublishResult");
const {
  listenForResult,
  checkResultStatus,
  setRewardArray,
} = require("./utils/helper-functions");

dotenv.config();

const http = require("http");
const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

app.use(
  session({
    secret: "prediction-backend",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(cors());
app.use(express.json());

app.use(urlencoded({ extended: false }));

///  Routes
app.use("/predictions", predictionRoute);
app.use("/result", ResultRoute);
// app.use("/latestPrice", Price);

/// listening to changes

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  listenForResult();
  checkResultStatus();
  setRewardArray();
});
