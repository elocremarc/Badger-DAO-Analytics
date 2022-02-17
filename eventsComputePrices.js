import ethers from "ethers";
import moment from "moment";
import getTokenPrices from "./getTokenPrices.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const tokenDictionary = require("./tokenDictionary.json");
const abi = require("./abi.json");
export const EtherScanKEY = process.env.YOUR_ETHERSCAN_API_KEY;

export const provider = new ethers.providers.AlchemyProvider(
  "homestead",
  "15s0RlsCww6qXyZ9ybBafdITA7h81tA_"
);
const contract = new ethers.Contract(
  "0x2B5455aac8d64C14786c3a29858E43b5945819C0",
  abi,
  provider
);

const eventsComputePrices = async (events, tokenPrices) => {
  const blockEvents = events.reduce(
    (blockEvents, event) => ({
      ...blockEvents,
      [event.blockNumber]: [...(blockEvents[event.blockNumber] || []), event],
    }),
    []
  );

  let harvestTransactions = [];
  //console.log("blockEvents", Object.entries(blockEvents));
  let TokenEvents = [];
  Object.entries(blockEvents).forEach(([blockNumber, events]) => {
    TokenEvents = events.reduce(
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
      gasSpent: parseFloat(events[0].gasSpent).toFixed(2),
      timeStamp: events[0].timeStamp,
    });
  });
  console.time("getPrice");
  let harvest = harvestTransactions.map(async (harvestTransaction) => {
    let TokensTree = [];
    let TokensFee = [];
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

      const tokenConvertUnits = (amount) => {
        let amountUnitsEther = parseFloat(
          ethers.utils.formatEther(amount)
        ).toFixed(3);
        let amountUSD = parseFloat(amountUnitsEther * priceUSD).toFixed(3);
        return {
          tokenName: tokenInfo.name,
          tokenSymbol: tokenInfo.symbol,
          address: token,
          amountUnitsEther,
          amountUSD,
        };
      };
      //   token = events.forEach((event) => {
      //     tokenConvertUnits(event.anount);
      //   });

      events.forEach((event) => {
        if (event.event === "TreeDistribution") {
          TokensTree.push(tokenConvertUnits(event.amount));
        }
        if (
          event.event === "PerformanceFeeGovernance" ||
          event.event === "Harvest"
        ) {
          TokensFee.push(tokenConvertUnits(event.amount));
        }
        if (event.event === "HarvestState") {
          TokensFee.push(tokenConvertUnits(event.amountGovernance));
          TokensTree.push(tokenConvertUnits(event.amountBadgerTree));
        }
      });
      return {
        TokensTree,
        TokensFee,
      };
    });

    // find the price in histoic array equal to the the day of the event
    let tokenPriceHistoric = tokenPrices.find(
      (tokenPrice) => tokenPrice.coinGeickoID === "ethereum"
    );

    // find the price in histoic array equal to the the day of the event
    let price = tokenPriceHistoric.price.find((price) =>
      moment(price[0]).isSame(date, "day")
    );
    let priceEthUSD = price[1];

    harvestTransaction["TokensTree"] = TokensTree;
    harvestTransaction["TokensFee"] = TokensFee;
    harvestTransaction["id"] = blockNumber;

    harvestTransaction["gas"] = Math.round(
      priceEthUSD * harvestTransaction.gasSpent
    );

    harvestTransaction["PerformanceFeeGovernanceTotal"] = TokensFee.reduce(
      (acc, cur) => {
        return acc + Math.floor(cur.amountUSD);
      },
      0
    );

    harvestTransaction["TreeDistributionTotal"] = TokensTree.reduce(
      (acc, cur) => {
        return acc + Math.floor(cur.amountUSD);
      },
      0
    );

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
    harvest.timeStamp = moment(harvest.timeStamp * 1000).format("YYYY/MM/DD");
  });
  // console.log(harvestFiltered);
  return harvestFiltered;
};
export default eventsComputePrices;
