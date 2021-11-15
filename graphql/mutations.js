const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
} = require("graphql");

require("dotenv").config();

const Response = require("../models/response");
const UniswapFactory = require("../models/uniswapFactory");
const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
const MintEvent = require("../models/mint");
const BurnEvent = require("../models/burn");
const SwapEvent = require("../models/swap");
const Transaction = require("../models/transaction");
const LiquidityPosition = require("../models/liquidityPosition");
let pairDayData = require("../models/pairDayData");
let pairHourData = require("../models/pairHourData");
let uniswapDayData = require("../models/uniswapDayData");
let token0DayData = require("../models/tokenDayData");
let token1DayData = require("../models/tokenDayData");

const {responseType} = require("./types/response");

const {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  ZERO_BD,
  ZERO_BI,
  ONE_BI,
  //   convertTokenToDecimal,
  ADDRESS_ZERO,
  createUser,
  createLiquidityPosition,
  BI_18,
  createLiquiditySnapshot,
} = require("./helpers");

const {

  updateUniswapDayData,
  updatePairDayData,
  updatePairHourData,
  updateTokenDayData

} = require("./dayUpdates");


var PairContract = require("../JsClients/PAIR/test/installed.ts");

const {
  getEthPriceInUSD,
  findEthPerToken,
  getTrackedVolumeUSD,
  getTrackedLiquidityUSD,
} = require("./pricing");

const handleNewPair = {
  type: responseType,
  description: "Handle New Pair",
  args: {
    token0: { type: GraphQLString },
    token1: { type:GraphQLString  },
    pair: { type: GraphQLString  },
    all_pairs_length: { type: GraphQLInt },
    timeStamp: { type: GraphQLString  },
    blockHash: { type: GraphQLString  }
  },
  async resolve(parent, args, context) {
    try {

      console.log("process.env.FACTORY_CONTRACT: ",process.env.FACTORY_CONTRACT);
      // load factory (create if first exchange)
      let factory = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });
      if (factory === null) {
        factory = new UniswapFactory({
          id: process.env.FACTORY_CONTRACT,
          pairCount: 0,
          totalVolumeETH: ZERO_BD,
          totalLiquidityETH: ZERO_BD,
          totalVolumeUSD: ZERO_BD,
          untrackedVolumeUSD: ZERO_BD,
          totalLiquidityUSD: ZERO_BD,
          txCount: ZERO_BI,
        });

        // create new bundle
        let bundle = new Bundle({
          id: "1",
          ethPrice: ZERO_BD,
        });
        await bundle.save();
      }
      factory.pairCount = factory.pairCount + 1;
      await factory.save();


      // create the tokens
      let token0 = await Token.findOne({ id: args.token0 });
      let token1 = await Token.findOne({ id: args.token1 });

      // fetch info if null
      if (token0 === null) {
        let Decimals = 18;
        //await fetchTokenDecimals(args.token0);
        
        // bail if we couldn't figure out the decimals
        if (Decimals === null) {
          console.log("mybug the decimal on token 0 was null", []);
          return;
        }

        let TokenName="token0";
        //await fetchTokenName(args.token0);
        let TokenSymbol="DAI";
        //await fetchTokenSymbol(args.token0);
        let TokenTotalSupply=0;
        //await fetchTokenTotalSupply(args.token0);

        token0 = new Token({
          id: args.token0,
          symbol: TokenSymbol,
          name: TokenName,
          totalSupply:TokenTotalSupply,
          decimals: Decimals,
          derivedETH: ZERO_BD,
          tradeVolume: ZERO_BD,
          tradeVolumeUSD: ZERO_BD,
          untrackedVolumeUSD: ZERO_BD,
          totalLiquidity: ZERO_BD,
          txCount: ZERO_BI,
        });
      }

      // fetch info if null
      if (token1 === null) {
        let Decimals = 18;
        //await fetchTokenDecimals(args.token1);

        // bail if we couldn't figure out the decimals
        if (Decimals === null) {
          return;
        }

        let TokenName="token1";
        //await fetchTokenName(args.token1);
        let TokenSymbol="DAI";
        //await fetchTokenSymbol(args.token1);
        let TokenTotalSupply=0;
        //await fetchTokenTotalSupply(args.token1);

        token1 = new Token({
          id: args.token1,
          symbol: TokenSymbol,
          name: TokenName,
          totalSupply:TokenTotalSupply,
          decimals: Decimals,
          derivedETH: ZERO_BD,
          tradeVolume: ZERO_BD,
          tradeVolumeUSD: ZERO_BD,
          untrackedVolumeUSD: ZERO_BD,
          totalLiquidity: ZERO_BD,
          txCount: ZERO_BI,
        });
      }

      let pair = new Pair({
        id: args.pair,
        token0: {id:token0.id, name:token0.name,symbol:token0.symbol,derivedETH:token0.derivedETH,totalLiquidity:token0.totalLiquidity},
        token1: {id:token1.id, name:token1.name,symbol:token1.symbol,derivedETH:token1.derivedETH,totalLiquidity:token1.totalLiquidity},
        liquidityProviderCount: ZERO_BI,
        createdAtTimestamp : parseInt(args.timeStamp),
        createdAtBlockNumber :args.blockHash,
        txCount: ZERO_BI,
        reserve0: ZERO_BD,
        reserve1: ZERO_BD,
        trackedReserveETH: ZERO_BD,
        reserveETH: ZERO_BD,
        reserveUSD: ZERO_BD,
        totalSupply: ZERO_BD,
        volumeToken0: ZERO_BD,
        volumeToken1: ZERO_BD,
        volumeUSD: ZERO_BD,
        untrackedVolumeUSD: ZERO_BD,
        token0Price: ZERO_BD,
        token1Price: ZERO_BD,
      });

      // save updated values
      await token0.save();
      await token1.save();
      await pair.save();
      await factory.save();
      
      let response = await Response.findOne({ id: "1" });
      if(response=== null)
      {
        // create new response
        response = new Response({
          id: "1",
          result: true
        });
        await response.save();
      }
      return response;
    } catch (error) {
      throw new Error(error);
    }
  },
};

async function isCompleteMint(mintId) {
  let MintResult = await MintEvent.findOne({ id: mintId });
  if (MintResult.sender !== null) {
    // sufficient checks
    return true;
  } else {
    return false;
  }
}

const handleTransfer = {
  type: responseType,
  description: "handle Transfer ",
  args: {
    from: { type: GraphQLString },
    to: { type: GraphQLString },
    value: { type: GraphQLInt },
    pairAddress: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    timeStamp: { type: GraphQLString  },
    blockHash: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {

      // ignore initial transfers for first adds
      if (args.to == ADDRESS_ZERO && args.value === 1000) {
        return false;
      }

      let factory = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });

      let transactionHash = args.deployHash;

      // user stats
      let from = args.from;
      createUser(from);

      let to = args.to;
      createUser(to);

      let pair = await Pair.findOne({ id: args.pairAddress });

      // get or create transaction
      let transaction = await Transaction.findOne({ id: transactionHash });
      if (transaction === null) {
        transaction = new Transaction({
          id: transactionHash,
          blockNumber: args.blockHash,
          timestamp: parseInt(args.timeStamp),
          mints: [],
          burns: [],
          swaps: [],
        });
      }

      // mints
      let mints = transaction.mints;
      if (from == ADDRESS_ZERO) {
        // update total supply
        pair.totalSupply = pair.totalSupply + args.value;
        pair.save();

        // create new mint if no mints so far or if last one is done already
        if (mints.length === 0 || isCompleteMint(mints[mints.length - 1])) {
          let mint = new MintEvent({
            id: transactionHash + "-" + (mints.length).toString(),
            transactionid:transaction.id,
            transactiontimestamp:transaction.timestamp,
            pair: {
              id:pair.id,
              token0:{
                id:pair.token0.id,
                symbol:pair.token0.symbol
              },
              token1:{
                id:pair.token1.id,
                symbol:pair.token1.symbol
              }
            },
            to: to,
            liquidity: args.value,
            timestamp: transaction.timestamp,
          });

          await mint.save();

          // update mints in transaction
          transaction.mints=mints.push(mint);

          // save entities
          await transaction.save();
          await factory.save();
        }
      }

      // case where direct send first on ETH withdrawls
      if (to == pair.id) {
        let burns = transaction.burns;
        let burn = new BurnEvent({
          id: transactionHash + "-" + (burns.length).toString(),
          transactionid:transaction.id,
          transactiontimestamp:transaction.timestamp,
          pair: {
            id:pair.id,
            token0:{
              id:pair.token0.id,
              symbol:pair.token0.symbol
            },
            token1:{
              id:pair.token1.id,
              symbol:pair.token1.symbol
            }
          },
          liquidity: args.value,
          timestamp: transaction.timestamp,
          to: to,
          sender: from,
          needsComplete: true
        });

        await burn.save();

        // TODO: Consider using .concat() for handling array updates to protect
        // against unintended side effects for other code paths.
        burns.push(burn);
        transaction.burns = burns;
        await transaction.save();
      }

      // burn
      if (to == ADDRESS_ZERO && from == pair.id) {
        pair.totalSupply = pair.totalSupply - args.value;
        await pair.save();

        // this is a new instance of a logical burn
        let burns = transaction.burns;
        let burn;
        if (burns.length > 0) {
          let currentBurn = await BurnEvent.findOne({
            id: burns[burns.length - 1],
          });
          if (currentBurn.needsComplete) {
            burn = currentBurn;
          } else {
            burn = new BurnEvent({
              id: transactionHash + "-" + (burns.length).toString(),
              transactionid:transaction.id,
              transactiontimestamp:transaction.timestamp,
              pair: {
                id:pair.id,
                token0:{
                  id:pair.token0.id,
                  symbol:pair.token0.symbol
                },
                token1:{
                  id:pair.token1.id,
                  symbol:pair.token1.symbol
                }
              },
              needsComplete: false,
              liquidity: args.value,
              timestamp: transaction.timestamp,
            });
          }
        } else {
          burn = new BurnEvent({
            id: transactionHash + "-" + (burns.length).toString(),
            transactionid:transaction.id,
            transactiontimestamp:transaction.timestamp,
            pair: {
              id:pair.id,
              token0:{
                id:pair.token0.id,
                symbol:pair.token0.symbol
              },
              token1:{
                id:pair.token1.id,
                symbol:pair.token1.symbol
              }
            },
            needsComplete: false,
            liquidity: args.value,
            timestamp: transaction.timestamp,
          });
        }

        // if this logical burn included a fee mint, account for this
        if (mints.length !== 0 && !isCompleteMint(mints[mints.length - 1])) {
          let mint = await MintEvent.findOne({ id: mints[mints.length - 1] });
          burn.feeTo = mint.to;
          burn.feeLiquidity = mint.liquidity;
          // remove the logical mint
          await MintEvent.deleteOne({ id: mints[mints.length - 1] });
          // update the transaction

          // TODO: Consider using .slice().pop() to protect against unintended
          // side effects for other code paths.
          mints.pop();
          transaction.mints = mints;
          await transaction.save();
        }
        await burn.save();
        // if accessing last one, replace it
        if (burn.needsComplete) {
          // TODO: Consider using .slice(0, -1).concat() to protect against
          // unintended side effects for other code paths.
          burns[burns.length - 1] = burn;
        }
        // else add new one
        else {
          // TODO: Consider using .concat() for handling array updates to protect
          // against unintended side effects for other code paths.
          burns.push(burn.id);
        }
        transaction.burns = burns;
        await transaction.save();
      }

      if (from != ADDRESS_ZERO && from != pair.id) {
        let Balance =await PairContract.balanceOf(args.pairAddress,from);
        await createLiquidityPosition(args.pairAddress, from, Balance);
        
        let fromUserLiquidityPosition = null;
        while (fromUserLiquidityPosition == null) {
          fromUserLiquidityPosition = await LiquidityPosition.findOne({
            id: args.pairAddress + "-" + from,
          });
        }

        await createLiquiditySnapshot(fromUserLiquidityPosition,  parseInt(args.timeStamp),args.blockHash);
      }

      if (to != ADDRESS_ZERO && to != pair.id) {
        let Balance = await PairContract.balanceOf(args.pairAddress,to);
        await createLiquidityPosition(args.pairAddress, to, Balance);
        
        let toUserLiquidityPosition = null;
        while (toUserLiquidityPosition == null) {
          toUserLiquidityPosition = await LiquidityPosition.findOne({
            id: args.pairAddress + "-" + to,
          });
        }
        await createLiquiditySnapshot(toUserLiquidityPosition,  parseInt(args.timeStamp),args.blockHash);
      }

      await transaction.save();
      let response = await Response.findOne({ id: "1" });
      if(response=== null)
      {
        // create new response
        response = new Response({
          id: "1",
          result: true
        });
        await response.save();
      }
      return response;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleSync = {
  type: responseType,
  description: "handle Sync",
  args: {
    reserve0: { type: GraphQLInt },
    reserve1: { type: GraphQLInt },
    pairAddress: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      
      let pair = await Pair.findOne({ id: args.pairAddress });
      let token0 = await Token.findOne({ id: pair.token0 });
      let token1 = await Token.findOne({ id: pair.token1 });
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });

      // reset factory liquidity by subtracting onluy tarcked liquidity
      uniswap.totalLiquidityETH =
        uniswap.totalLiquidityETH - pair.trackedReserveETH;

      // reset token total liquidity amounts
      token0.totalLiquidity = token0.totalLiquidity - pair.reserve0;
      token1.totalLiquidity = token1.totalLiquidity - pair.reserve1;

      pair.reserve0 = args.reserve0;
      pair.reserve1 = args.reserve1;

      if (pair.reserve1 != ZERO_BD)
        pair.token0Price = pair.reserve0 / pair.reserve1;
      else pair.token0Price = ZERO_BD;
      if (pair.reserve0 != ZERO_BD)
        pair.token1Price = pair.reserve1 / pair.reserve0;
      else pair.token1Price = ZERO_BD;

      await pair.save();

      // update ETH price now that reserves could have changed
      let bundle = await Bundle.findOne({ id: "1" });
      //bundle.ethPrice = getEthPriceInUSD(); 
      bundle.ethPrice = 0; //passing zero Because Casper don't have the feature right now
      await bundle.save();

      // token0.derivedETH = findEthPerToken(token0);
      // token1.derivedETH = findEthPerToken(token1);
      token0.derivedETH = 0; //passing zero Because Casper don't have the feature right now
      token1.derivedETH = 0; //passing zero Because Casper don't have the feature right now
      await token0.save();
      await token1.save();

      // get tracked liquidity - will be 0 if neither is in whitelist
      let trackedLiquidityETH;
      if (bundle.ethPrice != ZERO_BD) {
        // trackedLiquidityETH =
        //   getTrackedLiquidityUSD(pair.reserve0, token0, pair.reserve1, token1) /
        //   bundle.ethPrice;
        trackedLiquidityETH = 0; //passing zero Because Casper don't have the feature right now
      } else {
        trackedLiquidityETH = ZERO_BD;
      }

      // use derived amounts within pair
      pair.trackedReserveETH = trackedLiquidityETH;
      pair.reserveETH =
        pair.reserve0 * token0.derivedETH + pair.reserve1 * token1.derivedETH;
      pair.reserveUSD = pair.reserveETH * bundle.ethPrice;

      // use tracked amounts globally
      uniswap.totalLiquidityETH =
        uniswap.totalLiquidityETH + trackedLiquidityETH;
      uniswap.totalLiquidityUSD = uniswap.totalLiquidityETH * bundle.ethPrice;

      // now correctly set liquidity amounts for each token
      token0.totalLiquidity = token0.totalLiquidity + pair.reserve0;
      token1.totalLiquidity = token1.totalLiquidity + pair.reserve1;

      // save entities
      await pair.save();
      await uniswap.save();
      await token0.save();
      await token1.save();
      let response = await Response.findOne({ id: "1" });
      if(response=== null)
      {
        // create new response
        response = new Response({
          id: "1",
          result: true
        });
        await response.save();
      }
      return response;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleMint = {
  type: responseType,
  description: "handle Mint",
  args: {
    amount0: { type: GraphQLInt },
    amount1: { type: GraphQLInt },
    sender: { type: GraphQLString },
    logIndex: { type: GraphQLInt }, //we don't have logIndex in Casper yet
    pairAddress:{ type: GraphQLString},
    deployHash:{ type: GraphQLString},
    timeStamp: { type: GraphQLString },
    blockHash: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
     
      let transactionHash = args.deployHash;
      let transaction = await Transaction.findOne({
        id: transactionHash,
      });
      // safety check
      if (transaction === null) {
        return false;
      }
      let mints = transaction.mints;
      let mint = await MintEvent.findOne({ id: mints[mints.length - 1] });
      if (mint === null) {
        return false;
      }

      let pair = await Pair.findOne({ id: args.pairAddress });
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });

      let token0 = await Token.findOne({ id: pair.token0 });
      let token1 = await Token.findOne({ id: pair.token1 });

      let token0Amount = args.amount0;
      let token1Amount = args.amount1;

      // update txn counts
      token0.txCount = token0.txCount + ONE_BI;
      token1.txCount = token1.txCount + ONE_BI;

      // get new amounts of USD and ETH for tracking
      let bundle = await Bundle.findOne({ id: "1" });
      let amountTotalUSD =
        token1.derivedETH * token1Amount +
        token0.derivedETH * token0Amount +
        bundle.ethPrice;

      // update txn counts
      pair.txCount = pair.txCount - ONE_BI;
      uniswap.txCount = uniswap.txCount - ONE_BI;

      // save entities
      await token0.save();
      await token1.save();
      await pair.save();
      await uniswap.save();

      //mint.sender = event.params.sender;
      mint.sender = args.sender;
      mint.amount0 = token0Amount;
      mint.amount1 = token1Amount;
      // mint.logIndex = event.logIndex;
      mint.logIndex = args.logIndex;
      mint.amountUSD = amountTotalUSD;
      await mint.save();

      // update the LP position
      await createLiquidityPosition(args.pairAddress, mint.to, 0 );
      let liquidityPosition = null;
      while (liquidityPosition == null) {
        liquidityPosition = await LiquidityPosition.findOne({
          id: args.pairAddress + "-" + mint.to,
        });
      }
      await createLiquiditySnapshot(liquidityPosition, parseInt(args.timeStamp),args.blockHash);

      // update day entities
      pairDayData = await updatePairDayData(parseInt(args.timeStamp),args.pairAddress);
      pairHourData = await updatePairHourData(parseInt(args.timeStamp),args.pairAddress);
      uniswapDayData = await updateUniswapDayData(parseInt(args.timeStamp));
      token0DayData = await updateTokenDayData(token0,parseInt(args.timeStamp));
      token1DayData = await updateTokenDayData(token1,parseInt(args.timeStamp));
      
      await uniswapDayData.save();
      await pairDayData.save();
      await pairHourData.save();
      await token0DayData.save();
      await token1DayData.save();

      let response = await Response.findOne({ id: "1" });
      if(response=== null)
      {
        // create new response
        response = new Response({
          id: "1",
          result: true
        });
        await response.save();
      }
      return response;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleBurn = {
  type: responseType,
  description: "handle Burn",
  args: {
    amount0: { type: GraphQLInt },
    amount1: { type: GraphQLInt },
    sender: { type: GraphQLString },
    logIndex: { type: GraphQLInt }, //we don't have logIndex in Casper yet
    to: { type: GraphQLString},
    pairAddress:{ type: GraphQLString},
    deployHash:{ type: GraphQLString},
    timeStamp: { type: GraphQLString  },
    blockHash: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      
      let transactionHash = args.deployHash;
      let transaction = await Transaction.findOne({
        id: transactionHash,
      });
      // safety check
      if (transaction === null) {
        return false;
      }

      let burns = transaction.burns;
      let burn = await BurnEvent.findOne({ id: burns[burns.length - 1] });
      if (burn === null) {
        return false;
      }
      
      let pair = await Pair.findOne({ id: args.pairAaddress });
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });

      //update token info
      let token0 = await Token.findOne({ id: pair.token0 });
      let token1 = await Token.findOne({ id: pair.token1 });

      let token0Amount = args.amount0;
      let token1Amount = args.amount1;

      // update txn counts
      token0.txCount = token0.txCount + ONE_BI;
      token1.txCount = token1.txCount + ONE_BI;

      // get new amounts of USD and ETH for tracking
      let bundle = await Bundle.findOne({ id: "1" });
      let amountTotalUSD =
        token1.derivedETH * token1Amount +
        token0.derivedETH * token0Amount * bundle.ethPrice;

      // update txn counts
      uniswap.txCount = uniswap.txCount + ONE_BI;
      pair.txCount = pair.txCount + ONE_BI;

      // update global counter and save
      await token0.save();
      await token1.save();
      await pair.save();
      await uniswap.save();

      // update burn
      burn.sender = args.sender;
      burn.amount0 = token0Amount;
      burn.amount1 = token1Amount;
      burn.to = args.to;
      burn.logIndex = args.logIndex;
      burn.amountUSD = amountTotalUSD;
      await burn.save();

      // update the LP position
      await createLiquidityPosition(args.pairAddress, burn.sender,0);
      let liquidityPosition = null;
      while (liquidityPosition == null) {
        liquidityPosition = await LiquidityPosition.findOne({
          id: args.pairAddress + "-" + burn.sender,
        });
      }
      await createLiquiditySnapshot(liquidityPosition, parseInt(args.timeStamp),args.blockHash);

      // update day entities
      pairDayData = await updatePairDayData(parseInt(args.timeStamp),args.pairAddress);
      pairHourData = await updatePairHourData(parseInt(args.timeStamp),args.pairAddress);
      uniswapDayData = await updateUniswapDayData(parseInt(args.timeStamp));
      token0DayData = await updateTokenDayData(token0,parseInt(args.timeStamp));
      token1DayData = await updateTokenDayData(token1,parseInt(args.timeStamp));
     
      await uniswapDayData.save();
      await pairDayData.save();
      await pairHourData.save();
      await token0DayData.save();
      await token1DayData.save();

      let response = await Response.findOne({ id: "1" });
      if(response=== null)
      {
        // create new response
        response = new Response({
          id: "1",
          result: true
        });
        await response.save();
      }
      return response;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const handleSwap = {
  type: responseType,
  description: "handle Swap",
  args: {
    amount0In: { type: GraphQLInt },
    amount1In: { type: GraphQLInt },
    amount0Out: { type: GraphQLInt },
    amount1Out: { type: GraphQLInt },
    to: { type: GraphQLString },
    from: { type: GraphQLString },
    sender: { type: GraphQLString },
    logIndex: { type: GraphQLInt }, //we don't have logIndex in Casper yet
    pairAddress:{ type: GraphQLString},
    deployHash:{ type: GraphQLString},
    timeStamp: { type: GraphQLString},
    blockHash: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {

      let pair = await Pair.findOne({ id: args.pairAddress });
      let token0 = await Token.findOne({ id: pair.token0 });
      let token1 = await Token.findOne({ id: pair.token1 });

      let amount0In = args.amount0In;
      let amount1In = args.amount1In;
      let amount0Out = args.amount0Out;
      let amount1Out = args.amount1Out;

      // totals for volume updates
      let amount0Total = amount0Out + amount0In;
      let amount1Total = amount1Out + amount1In;

      // ETH/USD prices
      let bundle = await Bundle.findOne({ id: "1" });

      // get total amounts of derived USD and ETH for tracking
      let derivedAmountETH =
        token1.derivedETH * amount1Total +
        (token0.derivedETH * amount0Total) / 2;
      let derivedAmountUSD = derivedAmountETH * bundle.ethPrice;

      // only accounts for volume through white listed tokens
      // let trackedAmountUSD = getTrackedVolumeUSD(
      //   amount0Total,
      //   token0,
      //   amount1Total,
      //   token1,
      //   pair
      // );
      let trackedAmountUSD = 0; //passing zero Because Casper don't have the feature right now

      let trackedAmountETH;
      if (bundle.ethPrice == ZERO_BD) {
        trackedAmountETH = ZERO_BD;
      } else {
        trackedAmountETH = trackedAmountUSD / bundle.ethPrice;
      }

      // update token0 global volume and token liquidity stats
      token0.tradeVolume = token0.tradeVolume + (amount0In + amount0Out);
      token0.tradeVolumeUSD = token0.tradeVolumeUSD + trackedAmountUSD;
      token0.untrackedVolumeUSD = token0.untrackedVolumeUSD + derivedAmountUSD;

      // update token1 global volume and token liquidity stats
      token1.tradeVolume = token1.tradeVolume + (amount1In + amount1Out);
      token1.tradeVolumeUSD = token1.tradeVolumeUSD + trackedAmountUSD;
      token1.untrackedVolumeUSD = token1.untrackedVolumeUSD + derivedAmountUSD;

      // update txn counts
      token0.txCount = token0.txCount + ONE_BI;
      token1.txCount = token1.txCount + ONE_BI;

      // update pair volume data, use tracked amount if we have it as its probably more accurate
      pair.volumeUSD = pair.volumeUSD + trackedAmountUSD;
      pair.volumeToken0 = pair.volumeToken0 + amount0Total;
      pair.volumeToken1 = pair.volumeToken1 + amount1Total;
      pair.untrackedVolumeUSD = pair.untrackedVolumeUSD + derivedAmountUSD;
      pair.txCount = pair.txCount + ONE_BI;
      await pair.save();

      // update global values, only used tracked amounts for volume
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });
      uniswap.totalVolumeUSD = uniswap.totalVolumeUSD + trackedAmountUSD;
      uniswap.totalVolumeETH = uniswap.totalVolumeETH + trackedAmountETH;
      uniswap.untrackedVolumeUSD =
        uniswap.untrackedVolumeUSD + derivedAmountUSD;
      uniswap.txCount = uniswap.txCount + ONE_BI;

      // save entities
      await pair.save();
      await token0.save();
      await token1.save();
      await uniswap.save();

      let transactionHash = args.deployHash;
      let transaction = await Transaction.findOne({
        id: transactionHash,
      });
      if (transaction === null) {
        transaction = new Transaction({
          
          id: transactionHash,
          blockNumber: args.blockHash,
          timestamp: parseInt(args.timeStamp),
          mints: [],
          swaps: [],
          burns: [],
        });
      }
      let swaps = transaction.swaps;
      let swap = new SwapEvent({
        
        id: transactionHash + "-"+ (swaps.length).toString(),
        // update swap event
        transactionid:transaction.id,
        transactiontimestamp:transaction.timestamp,
        pair: {
          id:pair.id,
          token0:{
            id:pair.token0.id,
            symbol:pair.token0.symbol
          },
          token1:{
            id:pair.token1.id,
            symbol:pair.token1.symbol
          }
        },
        timestamp: transaction.timestamp,
        sender: args.sender,
        amount0In: amount0In,
        amount1In: amount1In,
        amount0Out: amount0Out,
        amount1Out: amount1Out,
        to: args.to,
        from: args.from,
        logIndex:args.logIndex,
        // use the tracked amount if we have it
        amountUSD:
          trackedAmountUSD === ZERO_BD ? derivedAmountUSD : trackedAmountUSD,
      });
      await swap.save();

      // update the transaction

      // TODO: Consider using .concat() for handling array updates to protect
      // against unintended side effects for other code paths.
      swaps.push(swap);
      transaction.swaps = swaps;
      await transaction.save();

      // update day entities
      pairDayData = await updatePairDayData(parseInt(args.timeStamp),args.pairAddress);
      pairHourData = await updatePairHourData(parseInt(args.timeStamp),args.pairAddress);
      uniswapDayData = await updateUniswapDayData(parseInt(args.timeStamp));
      token0DayData = await updateTokenDayData(token0,parseInt(args.timeStamp));
      token1DayData = await updateTokenDayData(token1,parseInt(args.timeStamp));

      // swap specific updating
      uniswapDayData.dailyVolumeUSD =
        uniswapDayData.dailyVolumeUSD + trackedAmountUSD;
      uniswapDayData.dailyVolumeETH =
        uniswapDayData.dailyVolumeETH + trackedAmountETH;
      uniswapDayData.dailyVolumeUntracked =
        uniswapDayData.dailyVolumeUntracked + derivedAmountUSD;
      await uniswapDayData.save();

      // swap specific updating for pair
      pairDayData.dailyVolumeToken0 =
        pairDayData.dailyVolumeToken0 + amount0Total;
      pairDayData.dailyVolumeToken1 =
        pairDayData.dailyVolumeToken1 + amount1Total;
      pairDayData.dailyVolumeUSD =
        pairDayData.dailyVolumeUSD + trackedAmountUSD;
      await pairDayData.save();

      // update hourly pair data
      pairHourData.hourlyVolumeToken0 =
        pairHourData.hourlyVolumeToken0 + amount0Total;
      pairHourData.hourlyVolumeToken1 =
        pairHourData.hourlyVolumeToken1 + amount1Total;
      pairHourData.hourlyVolumeUSD =
        pairHourData.hourlyVolumeUSD + trackedAmountUSD;
      await pairHourData.save();

      // swap specific updating for token0
      token0DayData.dailyVolumeToken =
        token0DayData.dailyVolumeToken + amount0Total;
      token0DayData.dailyVolumeETH =
        token0DayData.dailyVolumeETH + amount0Total*(token0.derivedETH);
      token0DayData.dailyVolumeUSD =
        token0DayData.dailyVolumeUSD +
        amount0Total*(token0.derivedETH)*(bundle.ethPrice);
      await token0DayData.save();

      // swap specific updating
      token1DayData.dailyVolumeToken =
        token1DayData.dailyVolumeToken + amount1Total;
      token1DayData.dailyVolumeETH =
        token1DayData.dailyVolumeETH + amount1Total*(token1.derivedETH);
      token1DayData.dailyVolumeUSD =
        token1DayData.dailyVolumeUSD +
        amount1Total*(token1.derivedETH)*(bundle.ethPrice);
      await token1DayData.save();

      let response = await Response.findOne({ id: "1" });
      if(response=== null)
      {
        // create new response
        response = new Response({
          id: "1",
          result: true
        });
        await response.save();
      }
      return response;
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = {
  handleNewPair,
  updateUniswapDayData,
  updatePairDayData,
  updatePairHourData,
  updateTokenDayData,
  handleTransfer,
  handleSync,
  handleMint,
  handleBurn,
  handleSwap,
};
