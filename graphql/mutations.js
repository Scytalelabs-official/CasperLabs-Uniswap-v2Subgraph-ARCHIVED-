require("dotenv").config();
const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
} = require("graphql");

var { request } = require("graphql-request");

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
let eventsModel = require("../models/events");
let AllContractsData = require("../models/allcontractsData");

const { responseType } = require("./types/response");

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
  updateTokenDayData,
} = require("./dayUpdates");

var PairContract = require("../JsClients/PAIR/test/installed.ts");

const {
  getEthPriceInUSD,
  findEthPerToken,
  getTrackedVolumeUSD,
  getTrackedLiquidityUSD,
} = require("./pricing");

function splitdata(data) {
  var temp = data.split("(");
  var result = temp[1].split(")");
  return result[0];
}

const handleNewPair = {
  type: responseType,
  description: "Handle New Pair",
  args: {
    token0: { type: GraphQLString },
    token1: { type: GraphQLString },
    pair: { type: GraphQLString },
    all_pairs_length: { type: GraphQLInt },
    deployHash: { type: GraphQLString },
    timeStamp: { type: GraphQLString },
    blockHash: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      console.log(
        "process.env.FACTORY_CONTRACT: ",
        process.env.FACTORY_CONTRACT
      );
      // load factory (create if first exchange)
      let factory = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });
      if (factory === null) {
        factory = new UniswapFactory({
          id: process.env.FACTORY_CONTRACT,
          pairCount: "0",
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
      factory.pairCount = (BigInt(factory.pairCount) + BigInt(1)).toString();
      await factory.save();

      // create the tokens
      let token0 = await Token.findOne({ id: args.token0 });
      let token1 = await Token.findOne({ id: args.token1 });

      // fetch info if null
      if (token0 === null) {
        let token0Data=await AllContractsData.findOne({packageHash:args.token0});
        let Decimals =await fetchTokenDecimals(token0Data.contractHash);

        // bail if we couldn't figure out the decimals
        if (Decimals === null) {
          console.log("mybug the decimal on token 0 was null", []);
          return;
        }

        let TokenName=await fetchTokenName(token0Data.contractHash);
        let TokenSymbol=await fetchTokenSymbol(token0Data.contractHash);
        let TokenTotalSupply=BigInt(await fetchTokenTotalSupply(token0Data.contractHash));
        //let TokenTotalSupply = BigInt(1000000000000);

        token0 = new Token({
          id: args.token0,
          symbol: TokenSymbol,
          name: TokenName,
          //symbol: "WISE",
          //name: "WISE",
          totalSupply: TokenTotalSupply.toString(),
          decimals: Decimals,
          //decimals: 9,
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
        let token1Data=await AllContractsData.findOne({packageHash:args.token1});
        let Decimals =await fetchTokenDecimals(token1Data.contractHash);

        // bail if we couldn't figure out the decimals
         if (Decimals === null) {
           return;
         }

        let TokenName=await fetchTokenName(token1Data.contractHash);
        let TokenSymbol=await fetchTokenSymbol(token1Data.contractHash);
        let TokenTotalSupply=await fetchTokenTotalSupply(token1Data.contractHash);
        //let TokenTotalSupply = BigInt(500000000000);

        token1 = new Token({
          id: args.token1,
          symbol: TokenSymbol,
          name: TokenName,
          //symbol: "WCSPR",
          //name: "WCSPR",
          totalSupply: TokenTotalSupply.toString(),
          decimals: Decimals,
          //decimals: 9,
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
        token0: {
          id: token0.id,
          name: token0.name,
          symbol: token0.symbol,
          derivedETH: token0.derivedETH,
          totalLiquidity: token0.totalLiquidity,
        },
        token1: {
          id: token1.id,
          name: token1.name,
          symbol: token1.symbol,
          derivedETH: token1.derivedETH,
          totalLiquidity: token1.totalLiquidity,
        },
        liquidityProviderCount: ZERO_BI,
        createdAtTimestamp: parseInt(parseInt(args.timeStamp) / 1000),
        createdAtBlockNumber: args.blockHash,
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

      console.log("deployHash: ", args.deployHash);
      var eventsData = await eventsModel.find({ deployHash: args.deployHash });
      if (eventsData.length == 0) {
        console.log(
          "No event found in the database at this pair created event deployHash."
        );
        let response = await Response.findOne({ id: "1" });
        if (response === null) {
          // create new response
          response = new Response({
            id: "1",
            result: true,
          });
          await response.save();
        }
        return response;
      } else {
        const eventslength = eventsData.length;
        for (var i = 0; i < eventslength; i++) {
          let deployHash = eventsData[i].deployHash;
          let timestamp = eventsData[i].timestamp;
          let block_hash = eventsData[i].block_hash;
          let eventName = eventsData[i].eventName;
          let newData = eventsData[i].eventsdata;

          console.log("... Deployhash: ", deployHash);
          console.log("... Timestamp: ", timestamp);
          console.log("... Block hash: ", block_hash);
          console.log("Event Data: ", newData);

          if (eventName == "erc20_transfer") {
            console.log(eventName + " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);

            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);

            var from = splitdata(newData[2][1].data);
            var to = splitdata(newData[3][1].data);
            var value = newData[4][1].data;

            console.log("from: ", from);
            console.log("to: ", to);
            console.log("value: ", value);

            let response = await request(
              process.env.GRAPHQL,
              `mutation handleTransfer( $from: String!, $to: String!, $value: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                  handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                  result
                  }
                        
                  }`,
              {
                from: from,
                to: to,
                value: value,
                pairAddress: to,
                deployHash: deployHash,
                timeStamp: timestamp.toString(),
                blockHash: block_hash,
              }
            );

            console.log(response);
            await eventsModel.deleteOne({ _id: eventsData[i]._id });
          } else if (eventName == "transfer") {
            console.log(eventName + " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);

            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);
            console.log(newData[5][0].data + " = " + newData[5][1].data);

            var from = splitdata(newData[2][1].data);
            var to = splitdata(newData[4][1].data);
            var value = newData[5][1].data;
            pair = splitdata(newData[3][1].data);

            console.log("from: ", from);
            console.log("to: ", to);
            console.log("value: ", value);
            console.log("pair: ", pair);

            let response = await request(
              process.env.GRAPHQL,
              `mutation handleTransfer( $from: String!, $to: String!, $value: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                  handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                  result
                  }
                      
                  }`,
              {
                from: from,
                to: to,
                value: value,
                pairAddress: pair,
                deployHash: deployHash,
                timeStamp: timestamp.toString(),
                blockHash: block_hash,
              }
            );
            console.log(response);
            await eventsModel.deleteOne({ _id: eventsData[i]._id });
          } else if (eventName == "mint") {
            console.log(eventName + " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);
            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);
            console.log(newData[5][0].data + " = " + newData[5][1].data);

            var amount0 = newData[0][1].data;
            var amount1 = newData[1][1].data;
            pair = splitdata(newData[4][1].data);
            var sender = splitdata(newData[5][1].data);

            console.log("amount0: ", amount0);
            console.log("amount1: ", amount1);
            console.log("pair: ", pair);
            console.log("sender: ", sender);
            let response = await request(
              process.env.GRAPHQL,
              `mutation handleMint( $amount0: String!, $amount1: String!, $sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                  handleMint( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                    result
                  }
                        
                  }`,
              {
                amount0: amount0,
                amount1: amount1,
                sender: sender,
                logIndex: 0,
                pairAddress: pair,
                deployHash: deployHash,
                timeStamp: timestamp.toString(),
                blockHash: block_hash,
              }
            );

            console.log(response);
            await eventsModel.deleteOne({ _id: eventsData[i]._id });
          } else if (eventName == "burn") {
            console.log(eventName + " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);
            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);
            console.log(newData[5][0].data + " = " + newData[5][1].data);
            console.log(newData[6][0].data + " = " + newData[6][1].data);

            var amount0 = newData[0][1].data;
            var amount1 = newData[1][1].data;
            pair = splitdata(newData[4][1].data);
            var sender = splitdata(newData[5][1].data);
            var to = splitdata(newData[6][1].data);

            console.log("amount0: ", amount0);
            console.log("amount1: ", amount1);
            console.log("pair: ", pair);
            console.log("sender: ", sender);
            console.log("to: ", to);
            let response = await request(
              process.env.GRAPHQL,
              `mutation handleBurn( $amount0: String!, $amount1: String!, $sender: String!,$logIndex: Int!,$to: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                    handleBurn( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, to:$to, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                    result
                    }
                                    
                    }`,
              {
                amount0: amount0,
                amount1: amount1,
                sender: sender,
                logIndex: 0,
                to: to,
                pairAddress: pair,
                deployHash: deployHash,
                timeStamp: timestamp.toString(),
                blockHash: block_hash,
              }
            );

            console.log(response);
            await eventsModel.deleteOne({ _id: eventsData[i]._id });
          } else if (eventName == "sync") {
            console.log(eventName + " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);
            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);

            var reserve0 = newData[3][1].data;
            var reserve1 = newData[4][1].data;
            pair = splitdata(newData[2][1].data);

            console.log("reserve0: ", reserve0);
            console.log("reserve1: ", reserve1);
            console.log("pair: ", pair);
            let response = await request(
              process.env.GRAPHQL,
              `mutation handleSync( $reserve0: String!, $reserve1: String!, $pairAddress: String!){
                    handleSync( reserve0: $reserve0, reserve1: $reserve1, pairAddress: $pairAddress) {
                    result
                    }
                                
                    }`,
              { reserve0: reserve0, reserve1: reserve1, pairAddress: pair }
            );

            console.log(response);
            await eventsModel.deleteOne({ _id: eventsData[i]._id });
          } else if (eventName == "swap") {
            console.log(eventName + " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);
            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);
            console.log(newData[5][0].data + " = " + newData[5][1].data);
            console.log(newData[6][0].data + " = " + newData[6][1].data);
            console.log(newData[7][0].data + " = " + newData[7][1].data);
            console.log(newData[8][0].data + " = " + newData[8][1].data);
            console.log(newData[9][0].data + " = " + newData[9][1].data);

            var amount0In = newData[0][1].data;
            var amount1In = newData[1][1].data;
            var amount0Out = newData[2][1].data;
            var amount1Out = newData[3][1].data;
            var from = splitdata(newData[6][1].data);
            pair = splitdata(newData[7][1].data);
            var sender = splitdata(newData[8][1].data);
            var to = splitdata(newData[9][1].data);

            console.log("amount0In: ", amount0In);
            console.log("amount1In: ", amount1In);
            console.log("amount0Out: ", amount0Out);
            console.log("amount1Out: ", amount1Out);
            console.log("from: ", from);
            console.log("pair: ", pair);
            console.log("sender: ", sender);
            console.log("to: ", to);
            let response = await request(
              process.env.GRAPHQL,
              `mutation handleSwap( $amount0In: String!, $amount1In: String!, $amount0Out: String!, $amount1Out: String!, $to: String!,$from: String!,$sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
                    handleSwap( amount0In: $amount0In, amount1In: $amount1In, amount0Out: $amount0Out, amount1Out: $amount1Out, to:$to, from:$from,sender: $sender,logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                      result
                    }
                                    
                    }`,
              {
                amount0In: amount0In,
                amount1In: amount1In,
                amount0Out: amount0Out,
                amount1Out: amount1Out,
                to: to,
                from: from,
                sender: sender,
                logIndex: 0,
                pairAddress: pair,
                deployHash: deployHash,
                timeStamp: timestamp.toString(),
                blockHash: block_hash,
              }
            );
            console.log(response);
            await eventsModel.deleteOne({ _id: eventsData[i]._id });
          }
          if (i == eventslength) {
            let response = await Response.findOne({ id: "1" });
            if (response === null) {
              // create new response
              response = new Response({
                id: "1",
                result: true,
              });
              await response.save();
            }
            return response;
          }
        }
      }
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
    value: { type: GraphQLString },
    pairAddress: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    timeStamp: { type: GraphQLString },
    blockHash: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      // ignore initial transfers for first adds
      if (args.to == ADDRESS_ZERO && args.value === "1000") {
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
      console.log("pair result,", pair);

      // get or create transaction
      let transaction = await Transaction.findOne({ id: transactionHash });
      if (transaction === null) {
        transaction = new Transaction({
          id: transactionHash,
          blockNumber: args.blockHash,
          timestamp: parseInt(parseInt(args.timeStamp) / 1000),
          mints: [],
          burns: [],
          swaps: [],
        });
      }

      // mints
      let mints = transaction.mints;
      if (from == ADDRESS_ZERO) {
        // update total supply
        pair.totalSupply = (
          BigInt(pair.totalSupply) + BigInt(args.value)
        ).toString();
        pair.save();

        // create new mint if no mints so far or if last one is done already
        if (mints.length === 0 || isCompleteMint(mints[mints.length - 1])) {
          let mint = new MintEvent({
            id: transactionHash + "-" + mints.length.toString(),
            transactionid: transaction.id,
            transactiontimestamp: transaction.timestamp,
            pair: {
              id: pair.id,
              token0: {
                id: pair.token0.id,
                symbol: pair.token0.symbol,
              },
              token1: {
                id: pair.token1.id,
                symbol: pair.token1.symbol,
              },
            },
            to: to,
            liquidity: args.value,
            timestamp: transaction.timestamp,
            amount0: "0",
            amount1: "0",
            amountUSD: "0",
          });

          await mint.save();
          console.log("mint: ", mint);

          // update mints in transaction
          mints.push(mint);
          console.log("mints: ", mints);
          transaction.mints = mints;
          console.log("transaction.mints: ", transaction.mints);

          // save entities
          await transaction.save();
          await factory.save();
        }
      }

      // case where direct send first on ETH withdrawls
      if (to == pair.id) {
        console.log("case where direct send first on ETH withdrawls");
        let burns = transaction.burns;
        let burn = new BurnEvent({
          id: transactionHash + "-" + burns.length.toString(),
          transactionid: transaction.id,
          transactiontimestamp: transaction.timestamp,
          pair: {
            id: pair.id,
            token0: {
              id: pair.token0.id,
              symbol: pair.token0.symbol,
            },
            token1: {
              id: pair.token1.id,
              symbol: pair.token1.symbol,
            },
          },
          liquidity: args.value,
          timestamp: transaction.timestamp,
          to: to,
          sender: from,
          needsComplete: true,
          amount0: "0",
          amount1: "0",
          amountUSD: "0",
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
        console.log("burn");
        pair.totalSupply = (
          BigInt(pair.totalSupply) - BigInt(args.value)
        ).toString();
        await pair.save();

        // this is a new instance of a logical burn
        let burns = transaction.burns;
        let burn;
        if (burns.length > 0) {
          let currentBurn = await BurnEvent.findOne({
            id: burns[burns.length - 1].id,
          });
          if (currentBurn.needsComplete) {
            burn = currentBurn;
          } else {
            burn = new BurnEvent({
              id: transactionHash + "-" + burns.length.toString(),
              transactionid: transaction.id,
              transactiontimestamp: transaction.timestamp,
              pair: {
                id: pair.id,
                token0: {
                  id: pair.token0.id,
                  symbol: pair.token0.symbol,
                },
                token1: {
                  id: pair.token1.id,
                  symbol: pair.token1.symbol,
                },
              },
              needsComplete: false,
              liquidity: args.value,
              timestamp: transaction.timestamp,
              to: to,
              sender: from,
              amount0: "0",
              amount1: "0",
              amountUSD: "0",
            });
          }
        } else {
          burn = new BurnEvent({
            id: transactionHash + "-" + burns.length.toString(),
            transactionid: transaction.id,
            transactiontimestamp: transaction.timestamp,
            pair: {
              id: pair.id,
              token0: {
                id: pair.token0.id,
                symbol: pair.token0.symbol,
              },
              token1: {
                id: pair.token1.id,
                symbol: pair.token1.symbol,
              },
            },
            needsComplete: false,
            liquidity: args.value,
            timestamp: transaction.timestamp,
            to: to,
            sender: from,
            amount0: "0",
            amount1: "0",
            amountUSD: "0",
          });
        }

        // if this logical burn included a fee mint, account for this
        if (mints.length !== 0 && !isCompleteMint(mints[mints.length - 1].id)) {
          console.log("burn4");
          let mint = await MintEvent.findOne({
            id: mints[mints.length - 1].id,
          });
          burn.feeTo = mint.to;
          burn.feeLiquidity = mint.liquidity;
          // remove the logical mint
          await MintEvent.deleteOne({ id: mints[mints.length - 1].id });
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
          burns.push(burn);
        }
        transaction.burns = burns;
        await transaction.save();
      }

      if (from != ADDRESS_ZERO && from != pair.id) {
        console.log("burn2");
        let pairData1=await AllContractsData.findOne({packageHash:args.pairAddress});
        let Balance =await PairContract.balanceOf(pairData1.contractHash,from.toLowerCase());
        console.log("Balance at  "+from+" is = "+ Balance);

        //let Balance = BigInt(2000000000000);
        await createLiquidityPosition(args.pairAddress, from, Balance);

        let fromUserLiquidityPosition = null;
        while (fromUserLiquidityPosition == null) {
          fromUserLiquidityPosition = await LiquidityPosition.findOne({
            id: args.pairAddress + "-" + from,
          });
        }

        await createLiquiditySnapshot(
          fromUserLiquidityPosition,
          parseInt(parseInt(args.timeStamp) / 1000),
          args.blockHash
        );
      }

      if (to != ADDRESS_ZERO && to != pair.id) {
        console.log("burn3");
        let pairData2=await AllContractsData.findOne({packageHash:args.pairAddress});
        let Balance =await PairContract.balanceOf(pairData2.contractHash,to.toLowerCase());
        console.log("Balance at  "+to+" is = "+ Balance);

        //let Balance = BigInt(2000000000000);
        await createLiquidityPosition(args.pairAddress, to, Balance);

        let toUserLiquidityPosition = null;
        while (toUserLiquidityPosition == null) {
          toUserLiquidityPosition = await LiquidityPosition.findOne({
            id: args.pairAddress + "-" + to,
          });
        }
        await createLiquiditySnapshot(
          toUserLiquidityPosition,
          parseInt(parseInt(args.timeStamp) / 1000),
          args.blockHash
        );
      }

      await transaction.save();

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
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
    reserve0: { type: GraphQLString },
    reserve1: { type: GraphQLString },
    pairAddress: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let pair = await Pair.findOne({ id: args.pairAddress });
      let token0 = await Token.findOne({ id: pair.token0.id });
      let token1 = await Token.findOne({ id: pair.token1.id });
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });

      // reset factory liquidity by subtracting only tarcked liquidity
      uniswap.totalLiquidityETH = (
        BigInt(uniswap.totalLiquidityETH) - BigInt(pair.trackedReserveETH)
      ).toString();

      // reset token total liquidity amounts
      token0.totalLiquidity = (
        BigInt(token0.totalLiquidity) - BigInt(pair.reserve0)
      ).toString();
      token1.totalLiquidity = (
        BigInt(token1.totalLiquidity) - BigInt(pair.reserve1)
      ).toString();

      pair.reserve0 = args.reserve0;
      pair.reserve1 = args.reserve1;

      if (pair.reserve1 != ZERO_BD)
        pair.token0Price = (
          BigInt(pair.reserve0) / BigInt(pair.reserve1)
        ).toString();
      else pair.token0Price = ZERO_BD;
      if (pair.reserve0 != ZERO_BD)
        pair.token1Price = (
          BigInt(pair.reserve1) / BigInt(pair.reserve0)
        ).toString();
      else pair.token1Price = ZERO_BD;

      await pair.save();

      // update ETH price now that reserves could have changed
      let bundle = await Bundle.findOne({ id: "1" });
      bundle.ethPrice = await getEthPriceInUSD();
      await bundle.save();

      token0.derivedETH = await findEthPerToken(token0);
      token1.derivedETH = await findEthPerToken(token1);
      await token0.save();
      await token1.save();

      // get tracked liquidity - will be 0 if neither is in whitelist
      let trackedLiquidityETH;
      if (bundle.ethPrice != ZERO_BD) {
        trackedLiquidityETH =
          (await getTrackedLiquidityUSD(
            pair.reserve0,
            token0,
            pair.reserve1,
            token1
          )) / BigInt(bundle.ethPrice);
      } else {
        trackedLiquidityETH = ZERO_BD;
      }

      // use derived amounts within pair
      pair.trackedReserveETH = trackedLiquidityETH.toString();
      pair.reserveETH = (
        BigInt(pair.reserve0) * BigInt(token0.derivedETH) +
        BigInt(pair.reserve1) * BigInt(token1.derivedETH)
      ).toString();
      pair.reserveUSD = (
        BigInt(pair.reserveETH) * BigInt(bundle.ethPrice)
      ).toString();

      // use tracked amounts globally
      uniswap.totalLiquidityETH = (
        BigInt(uniswap.totalLiquidityETH) + BigInt(trackedLiquidityETH)
      ).toString();
      uniswap.totalLiquidityUSD = (
        BigInt(uniswap.totalLiquidityETH) * BigInt(bundle.ethPrice)
      ).toString();

      // now correctly set liquidity amounts for each token
      token0.totalLiquidity = (
        BigInt(token0.totalLiquidity) + BigInt(pair.reserve0)
      ).toString();
      token1.totalLiquidity = (
        BigInt(token1.totalLiquidity) + BigInt(pair.reserve1)
      ).toString();

      // save entities
      await pair.save();
      await uniswap.save();
      await token0.save();
      await token1.save();
      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
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
    amount0: { type: GraphQLString },
    amount1: { type: GraphQLString },
    sender: { type: GraphQLString },
    logIndex: { type: GraphQLInt }, //we don't have logIndex in Casper yet
    pairAddress: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    timeStamp: { type: GraphQLString },
    blockHash: { type: GraphQLString },
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
      let mint = await MintEvent.findOne({ id: mints[mints.length - 1].id });
      if (mint === null) {
        return false;
      }

      let pair = await Pair.findOne({ id: args.pairAddress });
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });

      let token0 = await Token.findOne({ id: pair.token0.id });
      let token1 = await Token.findOne({ id: pair.token1.id });

      let token0Amount = args.amount0;
      let token1Amount = args.amount1;

      // update txn counts
      token0.txCount = (BigInt(token0.txCount) + BigInt(ONE_BI)).toString();
      token1.txCount = (BigInt(token1.txCount) + BigInt(ONE_BI)).toString();

      // get new amounts of USD and ETH for tracking
      let bundle = await Bundle.findOne({ id: "1" });
      let amountTotalUSD = (
        (BigInt(token1.derivedETH) * BigInt(token1Amount) +
          BigInt(token0.derivedETH) * BigInt(token0Amount)) *
        BigInt(bundle.ethPrice)
      ).toString();

      // update txn counts
      pair.txCount = (BigInt(pair.txCount) - BigInt(ONE_BI)).toString();
      uniswap.txCount = (BigInt(uniswap.txCount) - BigInt(ONE_BI)).toString();

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
      await createLiquidityPosition(
        args.pairAddress,
        mint.to,
        BigInt(0000000000)
      );
      let liquidityPosition = null;
      while (liquidityPosition == null) {
        liquidityPosition = await LiquidityPosition.findOne({
          id: args.pairAddress + "-" + mint.to,
        });
      }
      await createLiquiditySnapshot(
        liquidityPosition,
        parseInt(parseInt(args.timeStamp) / 1000),
        args.blockHash
      );

      // update day entities
      pairDayData = await updatePairDayData(
        parseInt(parseInt(args.timeStamp) / 1000),
        args.pairAddress
      );
      pairHourData = await updatePairHourData(
        parseInt(parseInt(args.timeStamp) / 1000),
        args.pairAddress
      );
      uniswapDayData = await updateUniswapDayData(
        parseInt(parseInt(args.timeStamp) / 1000)
      );
      token0DayData = await updateTokenDayData(
        token0,
        parseInt(parseInt(args.timeStamp) / 1000)
      );
      token1DayData = await updateTokenDayData(
        token1,
        parseInt(parseInt(args.timeStamp) / 1000)
      );

      console.log("pairDayData: ", pairDayData);
      console.log("pairHourData: ", pairHourData);
      console.log("uniswapDayData: ", uniswapDayData);
      console.log("token0DayData: ", token0DayData);
      console.log("token1DayData: ", token1DayData);

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
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
    amount0: { type: GraphQLString },
    amount1: { type: GraphQLString },
    sender: { type: GraphQLString },
    logIndex: { type: GraphQLInt }, //we don't have logIndex in Casper yet
    to: { type: GraphQLString },
    pairAddress: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    timeStamp: { type: GraphQLString },
    blockHash: { type: GraphQLString },
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
      let burn = await BurnEvent.findOne({ id: burns[burns.length - 1].id });
      if (burn === null) {
        return false;
      }

      let pair = await Pair.findOne({ id: args.pairAddress });
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });

      //update token info
      let token0 = await Token.findOne({ id: pair.token0.id });
      let token1 = await Token.findOne({ id: pair.token1.id });

      let token0Amount = args.amount0;
      let token1Amount = args.amount1;

      // update txn counts
      token0.txCount = (BigInt(token0.txCount) + BigInt(ONE_BI)).toString();
      token1.txCount = (BigInt(token1.txCount) + BigInt(ONE_BI)).toString();

      // get new amounts of USD and ETH for tracking
      let bundle = await Bundle.findOne({ id: "1" });
      let amountTotalUSD = (
        (BigInt(token1.derivedETH) * BigInt(token1Amount) +
          BigInt(token0.derivedETH) * BigInt(token0Amount)) *
        BigInt(bundle.ethPrice)
      ).toString();

      // update txn counts
      uniswap.txCount = (BigInt(uniswap.txCount) + BigInt(ONE_BI)).toString();
      pair.txCount = (BigInt(pair.txCount) + BigInt(ONE_BI)).toString();

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
      await createLiquidityPosition(
        args.pairAddress,
        burn.sender,
        BigInt(0000000000)
      );
      let liquidityPosition = null;
      while (liquidityPosition == null) {
        liquidityPosition = await LiquidityPosition.findOne({
          id: args.pairAddress + "-" + burn.sender,
        });
      }
      await createLiquiditySnapshot(
        liquidityPosition,
        parseInt(parseInt(args.timeStamp) / 1000),
        args.blockHash
      );

      // update day entities
      pairDayData = await updatePairDayData(
        parseInt(parseInt(args.timeStamp) / 1000),
        args.pairAddress
      );
      pairHourData = await updatePairHourData(
        parseInt(parseInt(args.timeStamp) / 1000),
        args.pairAddress
      );
      uniswapDayData = await updateUniswapDayData(
        parseInt(parseInt(args.timeStamp) / 1000)
      );
      token0DayData = await updateTokenDayData(
        token0,
        parseInt(parseInt(args.timeStamp) / 1000)
      );
      token1DayData = await updateTokenDayData(
        token1,
        parseInt(parseInt(args.timeStamp) / 1000)
      );

      console.log("pairDayData: ", pairDayData);
      console.log("pairHourData: ", pairHourData);
      console.log("uniswapDayData: ", uniswapDayData);
      console.log("token0DayData: ", token0DayData);
      console.log("token1DayData: ", token1DayData);

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
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
    amount0In: { type: GraphQLString },
    amount1In: { type: GraphQLString },
    amount0Out: { type: GraphQLString },
    amount1Out: { type: GraphQLString },
    to: { type: GraphQLString },
    from: { type: GraphQLString },
    sender: { type: GraphQLString },
    logIndex: { type: GraphQLInt }, //we don't have logIndex in Casper yet
    pairAddress: { type: GraphQLString },
    deployHash: { type: GraphQLString },
    timeStamp: { type: GraphQLString },
    blockHash: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let pair = await Pair.findOne({ id: args.pairAddress });
      let token0 = await Token.findOne({ id: pair.token0.id });
      let token1 = await Token.findOne({ id: pair.token1.id });

      let amount0In = args.amount0In;
      let amount1In = args.amount1In;
      let amount0Out = args.amount0Out;
      let amount1Out = args.amount1Out;

      // totals for volume updates
      let amount0Total = BigInt(amount0Out) + BigInt(amount0In);
      let amount1Total = BigInt(amount1Out) + BigInt(amount1In);

      // ETH/USD prices
      let bundle = await Bundle.findOne({ id: "1" });

      // get total amounts of derived USD and ETH for tracking
      let derivedAmountETH =
        (BigInt(token1.derivedETH) * amount1Total +
          BigInt(token0.derivedETH) * amount0Total) /
        BigInt(2);
      let derivedAmountUSD = derivedAmountETH * BigInt(bundle.ethPrice);

      // only accounts for volume through white listed tokens
      let trackedAmountUSD = await getTrackedVolumeUSD(
        amount0Total,
        token0,
        amount1Total,
        token1,
        pair
      );

      let trackedAmountETH;
      if (bundle.ethPrice == ZERO_BD) {
        trackedAmountETH = BigInt(ZERO_BD);
      } else {
        trackedAmountETH = trackedAmountUSD / BigInt(bundle.ethPrice);
      }

      // update token0 global volume and token liquidity stats
      token0.tradeVolume = (
        BigInt(token0.tradeVolume) +
        BigInt(amount0In) +
        BigInt(amount0Out)
      ).toString();
      token0.tradeVolumeUSD = (
        BigInt(token0.tradeVolumeUSD) + trackedAmountUSD
      ).toString();
      token0.untrackedVolumeUSD = (
        BigInt(token0.untrackedVolumeUSD) + derivedAmountUSD
      ).toString();

      // update token1 global volume and token liquidity stats
      token1.tradeVolume = (
        BigInt(token1.tradeVolume) +
        BigInt(amount1In) +
        BigInt(amount1Out)
      ).toString();
      token1.tradeVolumeUSD = (
        BigInt(token1.tradeVolumeUSD) + trackedAmountUSD
      ).toString();
      token1.untrackedVolumeUSD = (
        BigInt(token1.untrackedVolumeUSD) + derivedAmountUSD
      ).toString();

      // update txn counts
      token0.txCount = (BigInt(token0.txCount) + BigInt(ONE_BI)).toString();
      token1.txCount = (BigInt(token1.txCount) + BigInt(ONE_BI)).toString();

      // update pair volume data, use tracked amount if we have it as its probably more accurate
      pair.volumeUSD = (BigInt(pair.volumeUSD) + trackedAmountUSD).toString();
      pair.volumeToken0 = (BigInt(pair.volumeToken0) + amount0Total).toString();
      pair.volumeToken1 = (BigInt(pair.volumeToken1) + amount1Total).toString();
      pair.untrackedVolumeUSD = (
        BigInt(pair.untrackedVolumeUSD) + derivedAmountUSD
      ).toString();
      pair.txCount = (BigInt(pair.txCount) + BigInt(ONE_BI)).toString();
      await pair.save();

      // update global values, only used tracked amounts for volume
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });
      uniswap.totalVolumeUSD = (
        BigInt(uniswap.totalVolumeUSD) + trackedAmountUSD
      ).toString();
      uniswap.totalVolumeETH = (
        BigInt(uniswap.totalVolumeETH) + trackedAmountETH
      ).toString();
      uniswap.untrackedVolumeUSD = (
        BigInt(uniswap.untrackedVolumeUSD) + derivedAmountUSD
      ).toString();
      uniswap.txCount = (BigInt(uniswap.txCount) + BigInt(ONE_BI)).toString();

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
          timestamp: parseInt(parseInt(args.timeStamp) / 1000),
          mints: [],
          swaps: [],
          burns: [],
        });
      }
      let swaps = transaction.swaps;
      let swap = new SwapEvent({
        id: transactionHash + "-" + swaps.length.toString(),
        // update swap event
        transactionid: transaction.id,
        transactiontimestamp: transaction.timestamp,
        pair: {
          id: pair.id,
          token0: {
            id: pair.token0.id,
            symbol: pair.token0.symbol,
          },
          token1: {
            id: pair.token1.id,
            symbol: pair.token1.symbol,
          },
        },
        timestamp: transaction.timestamp,
        sender: args.sender,
        amount0In: amount0In,
        amount1In: amount1In,
        amount0Out: amount0Out,
        amount1Out: amount1Out,
        to: args.to,
        from: args.from,
        logIndex: args.logIndex,
        // use the tracked amount if we have it
        amountUSD:
          trackedAmountUSD.toString() === ZERO_BD
            ? derivedAmountUSD.toString()
            : trackedAmountUSD.toString(),
      });
      await swap.save();

      // update the transaction

      // TODO: Consider using .concat() for handling array updates to protect
      // against unintended side effects for other code paths.
      swaps.push(swap);
      transaction.swaps = swaps;
      await transaction.save();

      // update day entities
      pairDayData = await updatePairDayData(
        parseInt(parseInt(args.timeStamp) / 1000),
        args.pairAddress
      );
      pairHourData = await updatePairHourData(
        parseInt(parseInt(args.timeStamp) / 1000),
        args.pairAddress
      );
      uniswapDayData = await updateUniswapDayData(
        parseInt(parseInt(args.timeStamp) / 1000)
      );
      token0DayData = await updateTokenDayData(
        token0,
        parseInt(parseInt(args.timeStamp) / 1000)
      );
      token1DayData = await updateTokenDayData(
        token1,
        parseInt(parseInt(args.timeStamp) / 1000)
      );

      console.log("pairDayData: ", pairDayData);
      console.log("pairHourData: ", pairHourData);
      console.log("uniswapDayData: ", uniswapDayData);
      console.log("token0DayData: ", token0DayData);
      console.log("token1DayData: ", token1DayData);

      // swap specific updating
      uniswapDayData.dailyVolumeUSD = (
        BigInt(uniswapDayData.dailyVolumeUSD) + trackedAmountUSD
      ).toString();
      uniswapDayData.dailyVolumeETH = (
        BigInt(uniswapDayData.dailyVolumeETH) + trackedAmountETH
      ).toString();
      uniswapDayData.dailyVolumeUntracked = (
        BigInt(uniswapDayData.dailyVolumeUntracked) + derivedAmountUSD
      ).toString();
      await uniswapDayData.save();

      // swap specific updating for pair
      pairDayData.dailyVolumeToken0 = (
        BigInt(pairDayData.dailyVolumeToken0) + amount0Total
      ).toString();
      pairDayData.dailyVolumeToken1 = (
        BigInt(pairDayData.dailyVolumeToken1) + amount1Total
      ).toString();
      pairDayData.dailyVolumeUSD = (
        BigInt(pairDayData.dailyVolumeUSD) + trackedAmountUSD
      ).toString();
      await pairDayData.save();

      // update hourly pair data
      pairHourData.hourlyVolumeToken0 = (
        BigInt(pairHourData.hourlyVolumeToken0) + amount0Total
      ).toString();
      pairHourData.hourlyVolumeToken1 = (
        BigInt(pairHourData.hourlyVolumeToken1) + amount1Total
      ).toString();
      pairHourData.hourlyVolumeUSD = (
        BigInt(pairHourData.hourlyVolumeUSD) + trackedAmountUSD
      ).toString();
      await pairHourData.save();

      // swap specific updating for token0
      token0DayData.dailyVolumeToken = (
        BigInt(token0DayData.dailyVolumeToken) + amount0Total
      ).toString();
      token0DayData.dailyVolumeETH = (
        BigInt(token0DayData.dailyVolumeETH) +
        amount0Total * BigInt(token0.derivedETH)
      ).toString();
      token0DayData.dailyVolumeUSD = (
        BigInt(token0DayData.dailyVolumeUSD) +
        amount0Total * BigInt(token0.derivedETH) * BigInt(bundle.ethPrice)
      ).toString();
      await token0DayData.save();

      // swap specific updating
      token1DayData.dailyVolumeToken = (
        BigInt(token1DayData.dailyVolumeToken) + amount1Total
      ).toString();
      token1DayData.dailyVolumeETH = (
        BigInt(token1DayData.dailyVolumeETH) +
        amount1Total * BigInt(token1.derivedETH)
      ).toString();
      token1DayData.dailyVolumeUSD = (
        BigInt(token1DayData.dailyVolumeUSD) +
        amount1Total * BigInt(token1.derivedETH) * BigInt(bundle.ethPrice)
      ).toString();
      await token1DayData.save();

      let response = await Response.findOne({ id: "1" });
      if (response === null) {
        // create new response
        response = new Response({
          id: "1",
          result: true,
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
