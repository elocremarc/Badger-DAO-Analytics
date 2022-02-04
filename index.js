import express from "express";
import dotenv from "dotenv";
import { createRequire } from "module";
import axios from "axios";
import ethers from "ethers";
import decodeLogs from "./utils/decodeLogs.js";
import getblockNumbers from "./utils/getBlockNumbers.js";
import cors from "cors";
import path from "path";
const require = createRequire(import.meta.url);
const strategies = require("./strategies.json");
const tokenDictionary = require("./tokenDictionary.json");
const abi = require("./abi.json");
const dataTest = require("./dataTest.json");
import moment from "moment";

const app = express();
const port = process.env.PORT || 5000;

let BN = ethers.BigNumber.from;

const EtherScanKEY = process.env.YOUR_ETHERSCAN_API_KEY;

const provider = new ethers.providers.AlchemyProvider(
  "homestead",
  "PqGIQyzUNvWoazbLuGeGhRuMHTaO1sRw"
);

const EVENTS = {
  TreeDistribution:
    "0x17cc18c044bdfa5f365fb0f6140ffbaa76843012681aedb2015580693fa49b94",
  PerformanceFeeGovernance:
    "0x7d9c11b977b58d20949545f69e59d50e907cf4ad8fdc98cab1eaabd76574f7cd",
};

const whitelist = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://badger-dao-analytics.herokuapp.com/",
];
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable");
      callback(null, true);
    } else {
      console.log("Origin rejected");
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));
  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.get("/strategies", (req, res) => {
  res.json(strategies);
});

app.get("/tokenDictionary", (req, res) => {
  res.json(tokenDictionary);
});

app.get("/events", async (req, res) => {
  let request = req.query;
  let fromBlock = req.fromBlock;
  let toBlock = req.toBlock;
  console.log("request", request);
  console.time(`FullEventFetch`);
  let harvestFiltered = await getEvents("native.tbtcCrv");

  res.json(harvestFiltered);
  console.timeEnd(`FullEventFetch`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const getSingleEvents = async (
  address,
  event,
  fromBlock,
  toBlock = "latest"
) => {
  console.log(`Getting ${event} events from block ${fromBlock} to ${toBlock}`);
  console.time(`eventFetch`);

  let eventData = [];
  let url = `https://api.etherscan.io/api?module=logs&action=getLogs`;
  url +=
    `&fromBlock=${fromBlock}` +
    `&toBlock=${toBlock}` +
    `&address=${address}` +
    `&topic0=${EVENTS[event]}` +
    `&apikey=${EtherScanKEY}`;

  const events = await axios({
    method: "get",
    url: url,
  })
    .catch((err) => {
      console.log(err);
    })
    .then((response) => {
      response.data.result.forEach((response) => {
        let eventDecoded = decodeLogs(
          event,
          response.data,
          response.topics,
          abi
        );
        let amount = eventDecoded.amount;
        let token = eventDecoded.token;
        let blockNumber = parseInt(response.blockNumber, 16);
        let gasPrice = parseInt(response.gasPrice, 16);
        let gasUsed = parseInt(response.gasUsed, 16);
        let timeStamp = parseInt(response.timeStamp, 16);
        let gasSpent = BN(gasPrice).mul(BN(gasUsed));

        eventData.push({
          event: event,
          token: token,
          amount: amount,
          transactionHash: response.transactionHash,
          blockNumber: blockNumber,
          gasSpent: ethers.utils.formatEther(gasSpent.toString()),
          timeStamp: timeStamp,
        });
      });
      console.log(`${event} events fetched`);
      // console.log(eventData);
      return eventData;
    });
  console.timeEnd(`eventFetch`);

  return events;
};
const getEvents = async (strategy) => {
  let blockNumbers = await getblockNumbers();
  let blockLastMonth = blockNumbers.lastMonth;

  let eventTreeDistribution = await getSingleEvents(
    strategies[strategy],
    "TreeDistribution",
    blockLastMonth
  );
  let eventPerformanceFeeGovernance = await getSingleEvents(
    strategies[strategy],
    "PerformanceFeeGovernance",
    blockLastMonth
  );
  let events = eventTreeDistribution.concat(eventPerformanceFeeGovernance);

  const blockEvents = events.reduce(
    (blockEvents, event) => ({
      ...blockEvents,
      [event.blockNumber]: [...(blockEvents[event.blockNumber] || []), event],
    }),
    []
  );

  const contract = new ethers.Contract(
    "0x2B5455aac8d64C14786c3a29858E43b5945819C0",
    abi,
    provider
  );

  let harvestTransactions = [];

  Object.entries(blockEvents).forEach(([blockNumber, events]) => {
    let TokenEvents = events.reduce(
      (blockEvents, event) => ({
        ...blockEvents,
        [event.token]: [...(blockEvents[event.token] || []), event],
      }),
      []
    );
    harvestTransactions.push({
      tokensTransferred: TokenEvents,
      blockNumber: blockNumber,
      transactionHash: events[0].transactionHash,
      gasSpent: events[0].gasSpent,
      timeStamp: events[0].timeStamp,
    });
    // console.log(TokenEvents);
  });
  console.time("getPrice");

  let harvest = harvestTransactions.map(async (harvestTransaction) => {
    let TreeDistributionTotal = [];
    let PerformanceFeeGovernanceTotal = [];
    let tokens = Object.keys(harvestTransaction["tokensTransferred"]);
    let blockNumber = harvestTransaction.blockNumber;
    let timeStamp = harvestTransaction.timeStamp;
    const date = moment(timeStamp * 1000).format("DD-MM-YYYY");
    let total = tokens.map(async (token) => {
      const events = harvestTransaction["tokensTransferred"][token];
      let tokenInfo = tokenDictionary.find(
        (tokenInfo) => tokenInfo.token === token
      );
      const priceToken = await axios
        .get(
          `https://api.coingecko.com/api/v3/coins/${tokenInfo.coinGeickoID}/history?date=${date}`
        )
        .catch((err) => {
          console.log(err);
        });
      let priceUSD = priceToken.data.market_data.current_price.usd;
      // let priceETH = priceToken.data.market_data.current_price.eth;
      // let priceBTC = priceToken.data.market_data.current_price.btc;
      if (tokenInfo.onChainPrice) {
        let pricePerFullShare = await contract.getPricePerFullShare({
          blockTag: Number(blockNumber),
        });
        pricePerFullShare = parseFloat(
          ethers.utils.formatEther(pricePerFullShare)
        ).toFixed(3);
        priceUSD = parseFloat(priceUSD).toFixed(3);
        priceUSD = parseFloat(priceUSD * pricePerFullShare).toFixed(3);
      }

      events.forEach((event) => {
        event.priceUSD = priceUSD;
        // event.name = tokenInfo.name;
        let amountUnitsEther = parseFloat(
          ethers.utils.formatEther(event.amount)
        ).toFixed(3);
        // event.amountUnitsEther = amountUnitsEther;
        event.amountUSD = parseFloat(priceUSD * amountUnitsEther).toFixed(3);
        if (event.event === "TreeDistribution" && event.amountUSD > 0) {
          TreeDistributionTotal.push(event.amountUSD);
        }
        if ((event.event === "PerformanceFeeGovernance", event.amountUSD > 0)) {
          PerformanceFeeGovernanceTotal.push(event.amountUSD);
        }
      });
      return {
        PerformanceFeeGovernanceTotal,
        TreeDistributionTotal,
      };
    });
    const promiseTotal = await Promise.all(total);
    //console.log(promiseTotal);
    let priceETH = await axios
      .get(
        `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${date}`
      )
      .catch((err) => {
        console.log(err);
      });
    let priceEthUSD = priceETH.data.market_data.current_price.usd;
    harvestTransaction["gas"] = priceEthUSD * harvestTransaction.gasSpent;

    harvestTransaction["PerformanceFeeGovernanceTotal"] = promiseTotal[0][
      "PerformanceFeeGovernanceTotal"
    ].reduce((a, b) => Number(a) + Number(b), 0);

    harvestTransaction["TreeDistributionTotal"] = promiseTotal[0][
      "TreeDistributionTotal"
    ].reduce((a, b) => Number(a) + Number(b), 0);
    return harvestTransaction;
  });
  const promiseHarvest = await Promise.all(harvest);
  console.timeEnd("getPrice");
  //filter Harvest by timeStamp in accending order
  let harvestFiltered = promiseHarvest.sort((a, b) => {
    return a.timeStamp - b.timeStamp;
  });
  // timestamp harvest filtered
  harvestFiltered.forEach((harvest) => {
    harvest.timeStamp = moment(harvest.timeStamp * 1000).format("MM-DD");
  });
  // console.log(harvestFiltered);
  return harvestFiltered;
};
