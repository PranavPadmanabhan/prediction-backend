const contractAddress = require("./contractAddresses.json");
const ABI = require("./abi.json");
const rewardsForFirst = [
  0.0008, 0.0005, 0.0002, 0.00005333333, 0.00004, 0.000032, 0.00001066666,
  0.0000064, 0.00000333333,
];

const rewardsForSecond = [
  0.0015, 0.0012, 0.0009, 0.0008, 0.0007, 0.0005, 0.0004, 0.0002, 0.0001,
];
const rewardsForThird = [
  0.008, 0.005, 0.003, 0.0008, 0.0007, 0.0005, 0.0004, 0.0002, 0.0001,
];

const contestTitles = [
  {
    from: "ETH",
    to: "USD",
  },
  {
    from: "BTC",
    to: "USD",
  },
  {
    from: "DAI",
    to: "USD",
  },
  {
    from: "LINK",
    to: "USD",
  },
  {
    from: "FORTH",
    to: "USD",
  },
  {
    from: "SNX",
    to: "USD",
  },
  {
    from: "JPY",
    to: "USD",
  },
  {
    from: "CZK",
    to: "USD",
  },
  {
    from: "USDC",
    to: "USD",
  },
  {
    from: "XAU",
    to: "USD",
  },
  {
    from: "BTC",
    to: "ETH",
  },
  {
    from: "LINK",
    to: "ETH",
  },
];

module.exports = {
  contractAddress,
  ABI,
  rewardsForFirst,
  rewardsForSecond,
  rewardsForThird,
  contestTitles,
};
