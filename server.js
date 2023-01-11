const { urlencoded } = require("express");
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
const predictionRoute = require("./routes/Predictions");
const Sort = require("./routes/Sort");
const contest = require("./routes/getContests");
// const Price = require("./routes/LatestPrice");
const getTime = require("./routes/getLatestStamp");
const { listenForResult } = require("./utils/helper-functions");

const http = require("http");
const { default: mongoose } = require("mongoose");

const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

dotenv.config();

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
app.use("/getResult", Sort);
// app.use("/latestPrice", Price);
app.use("/getContests", contest);
app.use("/getLatestTime", getTime);

/// listening to changes

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // mongoose
  //   .connect(process.env.MONGO_DB_URL, {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //   })
  //   .then(() => {
  //     console.log("MongoDb connection successfull");
  //   })
  //   .catch((err) => console.log(err));
  listenForResult();
});
