Coingeicko has incomplete price data for xsushi. If you run these timestamps from `1609285536` to `1610996286 ` you will see the price is retunred as 0 which breaks the app. I changed the event call to only go back to the last timestamp we have a price for. Does xsushi have a price for this timestamp?

> https://api.coingecko.com/api/v3/coinsxsushi/market_chart/range?vs_currency=usd&from=1609285536&to=1610996286
