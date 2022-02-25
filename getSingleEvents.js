import axios from "axios";
import ethers from "ethers";
import decodeLogs from "./utils/decodeLogs.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const abi = require("./abi.json");
export let BN = ethers.BigNumber.from;
const EtherScanKEY = process.env.YOUR_ETHERSCAN_API_KEY;

export const EVENTS = {
  HarvestLpMetaFarm:
    "0x0dd9e8816f019db7cd9c7fd05137e174df345077951dceec99c0fe899a5d7142",
  HarvestState:
    "0x67a619370e37f3af4f694699d1acece0d7773651ff016db8771fa0a518067941",
  FarmHarvest:
    "0x11d59efb9cc9a1056d8187e2cd082a254e1d54d32965b706cbca99dfee5be05a",
  Harvest: "0x6c8433a8e155f0af04dba058d4e4695f7da554578963d876bdf4a6d8d6399d9c",
  TreeDistribution:
    "0x17cc18c044bdfa5f365fb0f6140ffbaa76843012681aedb2015580693fa49b94",
  PerformanceFeeGovernance:
    "0x7d9c11b977b58d20949545f69e59d50e907cf4ad8fdc98cab1eaabd76574f7cd",
};

/**
 * @param {string} address address of the contract
 * @param {string} event  event
 * @param {string} fromBlock from block
 * @param {string} toBlock to block default latest
 * @returns {Promise <Array>} array of events
 */
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
    // `&fromBlock=${fromBlock}` +
    // `&toBlock=${toBlock}` +
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
      console.log("Status Code: ", response.data.status);
      if (response.data.status === "0") {
        return { status: "0", message: "EtherScan API down" };
      } else {
        response.data.result.forEach((response) => {
          let eventDecoded = decodeLogs(
            event,
            response.data,
            response.topics,
            abi
          );
          //console.log("DEcoded", eventDecoded, "Block", eventDecoded.timeStamp);
          let eventDataObject = {};
          if (event === "HarvestState") {
            eventDataObject["amountGovernance"] = eventDecoded.toGovernance;
            eventDataObject["amountBadgerTree"] = eventDecoded.toBadgerTree;
            // console.log("ToGovernance", eventDecoded.toGovernance.toString());
            let token = "0x8798249c2e607446efb7ad49ec89dd1865ff4272";
            eventDataObject["token"] = token;
          } else if (
            event === "TreeDistribution" ||
            event === "PerformanceFeeGovernance"
          ) {
            eventDataObject["amount"] = eventDecoded.amount;
            eventDataObject["token"] = eventDecoded.token;
          } else if (event === "Harvest") {
            eventDataObject["amount"] = eventDecoded.harvested;
            eventDataObject["token"] =
              "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7";
          }

          let gasPrice = parseInt(response.gasPrice, 16);
          let gasUsed = parseInt(response.gasUsed, 16);
          let gasSpent = ethers.utils.formatEther(
            BN(gasPrice).mul(BN(gasUsed)).toString()
          );
          eventDataObject["event"] = event;
          eventDataObject["transactionHash"] = response.transactionHash;
          eventDataObject["blockNumber"] = parseInt(response.blockNumber, 16);
          eventDataObject["timeStamp"] = parseInt(response.timeStamp, 16);
          eventDataObject["gasSpent"] = gasSpent;
          eventData.push(eventDataObject);
        });
        console.log(`${event} events fetched`);

        return { status: "1", message: "Sucess", result: eventData };
      }
    });
  console.log("EVENTSS", events.result[0]);

  console.timeEnd(`eventFetch`);
  return events;
};
export default getSingleEvents;
