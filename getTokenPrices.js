import axios from "axios";

let tokenIds = [
  { coinGeickoID: "convex-finance" },
  { coinGeickoID: "wrapped-bitcoin" },
  { coinGeickoID: "badger-dao" },
  { coinGeickoID: "digg" },
  { coinGeickoID: "convex-crv" },
  { coinGeickoID: "ethereum" },
  { coinGeickoID: "xsushi" },
  { coinGeickoID: "sushi" },
];

// get historic prices from coingeiko for tokens in tokenDictionary
const getTokenPrices = async () => {
  console.time("getTokenPrices");
  let tokenPrices = [];
  let tokenPricesPromises = tokenIds.map(async (token) => {
    const url = `https://api.coingecko.com/api/v3/coins/${token.coinGeickoID}/market_chart?vs_currency=usd&days=max&interval=daily`;
    const response = await axios({
      method: "get",
      url: url,
    })
      .catch((err) => {
        console.log(err);
        // return { status: "0", message: "Coingecko API down" };
      })
      .then((response) => {
        // console.log(response.data.prices[0], token.coinGeickoID);
        return response.data;
      });
    return {
      coinGeickoID: token.coinGeickoID,
      price: response.prices,
    };
  });
  tokenPrices = await Promise.all(tokenPricesPromises);
  console.timeEnd("getTokenPrices");
  return tokenPrices;
};
export default getTokenPrices;
