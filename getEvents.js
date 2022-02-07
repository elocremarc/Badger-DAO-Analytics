import axios from "axios";
import ethers from "ethers";
import getblockNumbers from "./utils/getBlockNumbers.js";
import moment from "moment";
import commaNumber from "comma-number";
import getSingleEvents from "./getSingleEvents.js";
import getTokenPrices from "./getTokenPrices.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const strategies = require("./strategies.json");
const tokenDictionary = require("./tokenDictionary.json");
const abi = require("./abi.json");

export const EtherScanKEY = process.env.YOUR_ETHERSCAN_API_KEY;

export const provider = new ethers.providers.AlchemyProvider(
  "homestead",
  "PqGIQyzUNvWoazbLuGeGhRuMHTaO1sRw"
);

const getEvents = async (strategy) => {
  let blockNumbers = await getblockNumbers();
  let blockLastMonth = blockNumbers.lastMonth.amount;
  let events = [];
  if (strategy === "native.badger") {
    events = await getSingleEvents(
      strategies[strategy],
      "Harvest",
      blockLastMonth
    );
  } else {
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
    events = eventTreeDistribution.concat(eventPerformanceFeeGovernance);
  }
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
  //console.log("blockEvents", Object.entries(blockEvents));
  let TokenEvents = [];
  Object.entries(blockEvents).forEach(([blockNumber, events]) => {
    if (strategy === "native.badger") {
      TokenEvents = events;
      // console.log("token event", TokenEvents);
    } else {
      TokenEvents = events.reduce(
        (blockEvents, event) => ({
          ...blockEvents,
          [event.token]: [...(blockEvents[event.token] || []), event],
        }),
        []
      );
    }
    harvestTransactions.push({
      tokensTransferred: TokenEvents,
      blockNumber: blockNumber,
      transactionHash: events[0].transactionHash,
      gasSpent: parseFloat(events[0].gasSpent).toFixed(2),
      timeStamp: events[0].timeStamp,
    });

    // console.log(TokenEvents);
  });
  console.time("getPrice");
  let tokenPrices = await getTokenPrices();
  let harvest = harvestTransactions.map(async (harvestTransaction) => {
    let TreeDistributionTotal = [];
    let PerformanceFeeGovernanceTotal = [];
    let tokens = Object.keys(harvestTransaction["tokensTransferred"]);
    let blockNumber = harvestTransaction.blockNumber;
    let timeStamp = harvestTransaction.timeStamp;
    const date = moment(timeStamp * 1000);
    let total = tokens.map(async (token) => {
      const events = harvestTransaction["tokensTransferred"][token];
      let tokenInfo = tokenDictionary.find(
        (tokenInfo) => tokenInfo.token === token
      );
      let tokenPriceHistoric = tokenPrices.find(
        (tokenPrice) => tokenPrice.coinGeickoID === tokenInfo.coinGeickoID
      );

      // find the price in histoic array equal to the the day of the event
      let price = tokenPriceHistoric.price.find((price) =>
        moment(price[0]).isSame(date, "day")
      );
      let priceUSD = price[1];
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
        if (event.event === "TreeDistribution") {
          TreeDistributionTotal.push(Math.floor(event.amountUSD));
        }
        if (
          event.event === "PerformanceFeeGovernance" ||
          event.event === "Harvest"
        ) {
          PerformanceFeeGovernanceTotal.push(Math.floor(event.amountUSD));
        }
      });
      return {
        PerformanceFeeGovernanceTotal,
        TreeDistributionTotal,
      };
    });
    const promiseTotal = await Promise.all(total);
    //console.log(promiseTotal);

    // find the price in histoic array equal to the the day of the event
    let tokenPriceHistoric = tokenPrices.find(
      (tokenPrice) => tokenPrice.coinGeickoID === "ethereum"
    );

    // find the price in histoic array equal to the the day of the event
    let price = tokenPriceHistoric.price.find((price) =>
      moment(price[0]).isSame(date, "day")
    );
    let priceEthUSD = price[1];

    harvestTransaction["gas"] = Math.round(
      priceEthUSD * harvestTransaction.gasSpent
    );

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
    harvest.timeStamp = moment(harvest.timeStamp * 1000).format("MM/DD/YY");
  });
  // console.log(harvestFiltered);
  return harvestFiltered;
};

export default getEvents;
