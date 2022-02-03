As a summary for the bounty, I am giving you better a series of actionables points:

1. Grab the `PerformanceFeeGovernance` & `TreeDistribution` events from each of the strategies I shared above along story using archive node

2. Present them in a table and a graph, so it is appealing visually speaking into a basic UI. UI should have the ability to sort them out with different intervals (i.e: daily, weekly, monthly...)

3. - Will be great addition also to present the above data VS the gas expend for each strategy, basically to see the overall profitability from the DAO perspective. The operation will be `bcvxCRV harvested + bveCVXharvested - ETH gas cost`. The value of those tokens will be on the block where the harvest occurred, as all these assets are volatile

   - For simplicity you could use coingecko API for `cvxCRV`, `CVX` and `ETH`, even tho `bcvxCRV` is not 1:1 ratio to the `cvxCRV` for example. For the appropriate conversion you will need the price per share of the vault
   - [tx sample](https://etherscan.io/tx/0x44efb8f4e6d0fbfe4ac97aeaffb378282aea13acdcc55482de00d92e948ca23a)

   - For the price per share for the bcvxCRV if you want to be maore precise on the pricing you can find it [here](https://etherscan.io/address/0x2B5455aac8d64C14786c3a29858E43b5945819C0#readProxyContract)
     - **method 11:**
       `getPricePerFullShare`, means that 1 bcvxCRV is 1.3416509412935338 cvxCRV, that value is increasing btw, but it can be read easily on a block basis as well
