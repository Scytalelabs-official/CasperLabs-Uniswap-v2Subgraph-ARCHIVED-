const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
} = require("graphql");

const mongoose = require("mongoose");
require("dotenv").config();

const UniswapFactory = require("../models/uniswapFactory");
const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
const PairDayData = require("../models/pairDayData");
const PairHourData = require("../models/pairHourData");
const UniswapDayData = require("../models/uniswapDayData");
const TokenDayData = require("../models/tokenDayData");
const MintEvent = require("../models/mint");
const BurnEvent = require("../models/burn");
const SwapEvent = require("../models/swap");
const Transaction = require("../models/transaction");

const {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  ZERO_BD,
  ZERO_BI,
  ONE_BI,
  convertTokenToDecimal,
  ADDRESS_ZERO,
  createUser,
  createLiquidityPosition,
  BI_18,
  createLiquiditySnapshot,
} = require("./helpers");

const {
  PairContract,
 
} = require("./Jsclients/PAIR");

const {
  getEthPriceInUSD,
  findEthPerToken,
  getTrackedVolumeUSD,
  getTrackedLiquidityUSD,
} = require("./pricing");

const uniswapDayData = require("../models/uniswapDayData");

const handleNewPair = {
  type: GraphQLString,
  description: "Handle New Pair",
  args: {
    PairCreated: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    // load factory (create if first exchange)
    let factory = await UniswapFactory.findOne({
      id: process.env.FACTORY_ADDRESS,
    });
    if (factory === null) {
      factory = new UniswapFactory({
        id: process.env.FACTORY_ADDRESS,
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
    let token0 = await Token.findOne({ id: process.env.token0 });
    let token1 = await Token.findOne({ id: process.env.token1 });

    // fetch info if null
    if (token0 === null) {
      let Decimals = fetchTokenDecimals(process.env.token0);
      // bail if we couldn't figure out the decimals
      if (Decimals === null) {
        console.log("mybug the decimal on token 0 was null", []);
        return;
      }
      token0 = new Token({
        id: process.env.token0,
        symbol: fetchTokenSymbol(process.env.token0),
        name: fetchTokenName(process.env.token0),
        totalSupply: fetchTokenTotalSupply(process.env.token0),
        decimals: Decimals,
        derivedETH: ZERO_BD,
        tradeVolume: ZERO_BD,
        tradeVolumeUSD: ZERO_BD,
        untrackedVolumeUSD: ZERO_BD,
        totalLiquidity: ZERO_BD,
        // token0.allPairs = []
        txCount: ZERO_BI,
      });
    }

    // fetch info if null
    if (token1 === null) {
      let Decimals = fetchTokenDecimals(process.env.token1);
      // bail if we couldn't figure out the decimals
      if (Decimals === null) {
        return;
      }
      token1 = new Token({
        id: process.env.token1,
        symbol: fetchTokenSymbol(process.env.token1),
        name: fetchTokenName(process.env.token1),
        totalSupply: fetchTokenTotalSupply(process.env.token1),
        decimals: Decimals,
        derivedETH: ZERO_BD,
        tradeVolume: ZERO_BD,
        tradeVolumeUSD: ZERO_BD,
        untrackedVolumeUSD: ZERO_BD,
        totalLiquidity: ZERO_BD,
        // token1.allPairs = []
        txCount: ZERO_BI,
      });
    }

    let pair = new Pair({
      id: process.env.pair,
      token0: token0,
      token1: token1,
      liquidityProviderCount: ZERO_BI,
      //createdAtTimestamp : event.block.timestamp,
      //createdAtBlockNumber : event.block.number,
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

    // create the tracked contract based on the template
    //PairTemplate.create(event.params.pair)

    // save updated values
    await token0.save();
    await token1.save();
    await pair.save();
    await factory.save();
  },
};

const updateUniswapDayData = {
  type: UniswapDayData,
  description: "Update Uniswap Day Data",
  args: {
    UniswapDayData: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    let uniswap = await UniswapFactory.findOne({
      id: process.env.FACTORY_ADDRESS,
    });
    //let timestamp = event.block.timestamp.toI32();
    let timestamp = 100000;
    let dayID = timestamp / 86400;
    let dayStartTimestamp = dayID * 86400;
    let uniswapDayData = await UniswapDayData.findOne({ id: dayID.toString() });
    if (uniswapDayData === null) {
      uniswapDayData = new UniswapDayData({
        id: dayID.toString(),
        date: dayStartTimestamp,
        dailyVolumeUSD: ZERO_BD,
        dailyVolumeETH: ZERO_BD,
        totalVolumeUSD: ZERO_BD,
        totalVolumeETH: ZERO_BD,
        dailyVolumeUntracked: ZERO_BD,
      });
    }
    uniswapDayData.totalLiquidityUSD = uniswap.totalLiquidityUSD;
    uniswapDayData.totalLiquidityETH = uniswap.totalLiquidityETH;
    uniswapDayData.txCount = uniswap.txCount;
    await uniswapDayData.save();

    return uniswapDayData;
  },
};

const updatePairDayData = {
  type: PairDayData,
  description: "Update Pair Day Data",
  args: {
    PairDayData: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    //let timestamp = event.block.timestamp.toI32();
    let timestamp = 100000;
    let dayID = timestamp / 86400;
    let dayStartTimestamp = dayID * 86400;
    let address =
      "hash-0000000000000000000000000000000000000000000000000000000000000000";
    // let dayPairID = event.address
    //   .toHexString()
    //   .concat('-')
    //   .concat(BigInt.fromI32(dayID).toString());
    let dayPairID = address
      .toHexString()
      .concat("-")
      .concat(BigInt.fromI32(dayID).toString());
    //let pair = Pair.load(event.address.toHexString());
    let pair = await Pair.findOne({ id: address });
    let pairDayData = await PairDayData.findOne({ id: dayPairID });
    if (pairDayData === null) {
      pairDayData = new PairDayData({
        id: dayPairID,
        date: dayStartTimestamp,
        token0: pair.token0,
        token1: pair.token1,
        //pairAddress : event.address.toHexString(),
        pairAddress: address,
        dailyVolumeToken0: ZERO_BD,
        dailyVolumeToken1: ZERO_BD,
        dailyVolumeUSD: ZERO_BD,
        dailyTxns: ZERO_BI,
      });
    }

    pairDayData.totalSupply = pair.totalSupply;
    pairDayData.reserve0 = pair.reserve0;
    pairDayData.reserve1 = pair.reserve1;
    pairDayData.reserveUSD = pair.reserveUSD;
    pairDayData.dailyTxns = pairDayData.dailyTxns.plus(ONE_BI);
    await pairDayData.save();

    return pairDayData;
  },
};

const updatePairHourData = {
  type: PairHourData,
  description: "Update Pair Hour Data",
  args: {
    PairHourData: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    //let timestamp = event.block.timestamp.toI32();
    let timestamp = 100000;
    let hourIndex = timestamp / 3600; // get unique hour within unix history
    let hourStartUnix = hourIndex * 3600; // want the rounded effect
    let address =
      "hash-0000000000000000000000000000000000000000000000000000000000000000";
    // let hourPairID = event.address
    //   .toHexString()
    //   .concat('-')
    //   .concat(BigInt.fromI32(hourIndex).toString());
    let hourPairID = address
      .toHexString()
      .concat("-")
      .concat(BigInt.fromI32(hourIndex).toString());

    //let pair = Pair.load(event.address.toHexString())
    let pair = await Pair.findOne({ id: address });
    let pairHourData = await PairHourData.findOne({ id: hourPairID });
    if (pairHourData === null) {
      pairHourData = new PairHourData({
        id: hourPairID,
        hourStartUnix: hourStartUnix,
        //pair : event.address.toHexString(),
        pair: address,
        hourlyVolumeToken0: ZERO_BD,
        hourlyVolumeToken1: ZERO_BD,
        hourlyVolumeUSD: ZERO_BD,
        hourlyTxns: ZERO_BI,
      });
    }

    pairHourData.totalSupply = pair.totalSupply;
    pairHourData.reserve0 = pair.reserve0;
    pairHourData.reserve1 = pair.reserve1;
    pairHourData.reserveUSD = pair.reserveUSD;
    pairHourData.hourlyTxns = pairHourData.hourlyTxns.plus(ONE_BI);
    await pairHourData.save();

    return pairHourData;
  },
};

const updateTokenDayData = {
  type: TokenDayData,
  description: "Update Token Day Data",
  args: {
    TokenDayData: { type: GraphQLBoolean },
    token: Token,
  },
  async resolve(parent, args, context) {
    let bundle = await Bundle.findOne({ id: "1" });
    //let timestamp = event.block.timestamp.toI32();
    let timestamp = 100000;
    let dayID = timestamp / 86400;
    let dayStartTimestamp = dayID * 86400;
    let tokenDayID = args.token.id
      .toString()
      .concat("-")
      .concat(BigInt.fromI32(dayID).toString());

    //let tokenDayData = TokenDayData.load(tokenDayID);
    let tokenDayData = await TokenDayData.findOne({ id: tokenDayID });
    if (tokenDayData === null) {
      tokenDayData = new TokenDayData({
        id: tokenDayID,
        date: dayStartTimestamp,
        token: args.token.id,
        priceUSD: args.token.derivedETH.times(bundle.ethPrice),
        dailyVolumeToken: ZERO_BD,
        dailyVolumeETH: ZERO_BD,
        dailyVolumeUSD: ZERO_BD,
        dailyTxns: ZERO_BI,
        totalLiquidityUSD: ZERO_BD,
      });
    }
    tokenDayData.priceUSD = args.token.derivedETH.times(bundle.ethPrice);
    tokenDayData.totalLiquidityToken = args.token.totalLiquidity;
    tokenDayData.totalLiquidityETH = args.token.totalLiquidity.times(
      args.token.derivedETH
    );
    tokenDayData.totalLiquidityUSD = tokenDayData.totalLiquidityETH.times(
      bundle.ethPrice
    );
    tokenDayData.dailyTxns = tokenDayData.dailyTxns.plus(ONE_BI);
    await tokenDayData.save();

    /**
     * @todo test if this speeds up sync
     */
    // updateStoredTokens(tokenDayData as TokenDayData, dayID)
    // updateStoredPairs(tokenDayData as TokenDayData, dayPairID)

    return tokenDayData;
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
  type: null,
  description: "handle Transfer ",
  args: {
    Transfer: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    // ignore initial transfers for first adds
    if (
      event.params.to.toHexString() == ADDRESS_ZERO &&
      event.params.value.equals(BigInt.fromI32(1000))
    ) {
      return;
    }
    let factory = await UniswapFactory.findOne({
      id: process.env.FACTORY_ADDRESS,
    });
    let transactionHash = event.transaction.hash.toHexString();

    // user stats
    let from = event.params.from;
    createUser(from);

    let to = event.params.to;
    createUser(to);

    // get pair and load contract
    let pair = await Pair.findOne({ id: event.address.toHexString() });
    let pairContract = PairContract.bind(event.address);

    // liquidity token amount being transfered
    let value = convertTokenToDecimal(event.params.value, BI_18);

    // get or create transaction
    let transaction = await Transaction.findOne({ id: transactionHash });
    if (transaction === null) {
      transaction = new Transaction({
        id: transactionHash,
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
        mints: [],
        burns: [],
        swaps: [],
      });
    }
    // mints
    let mints = transaction.mints;
    if (from.toHexString() == ADDRESS_ZERO) {
      // update total supply
      pair.totalSupply = pair.totalSupply + value;
      pair.save();

      // create new mint if no mints so far or if last one is done already
      if (mints.length === 0 || isCompleteMint(mints[mints.length - 1])) {
        let mint = new MintEvent({
          id: event.transaction.hash
            .toHexString()
            .concat("-")
            .concat(BigInt.fromI32(mints.length).toString()),
          transaction: transaction.id,
          pair: pair.id,
          to: to,
          liquidity: value,
          timestamp: transaction.timestamp,
          transaction: transaction.id,
        });

        await mint.save();

        // update mints in transaction
        transaction.mints = mints.concat([mint.id]);

        // save entities
        await transaction.save();
        await factory.save();
      }
    }

    // case where direct send first on ETH withdrawls
    if (event.params.to.toHexString() == pair.id) {
      let burns = transaction.burns;
      let burn = new BurnEvent({
        id: event.transaction.hash
          .toHexString()
          .concat("-")
          .concat(BigInt.fromI32(burns.length).toString()),
        transaction: transaction.id,
        pair: pair.id,
        liquidity: value,
        timestamp: transaction.timestamp,
        to: event.params.to,
        sender: event.params.from,
        needsComplete: true,
        transaction: transaction.id,
      });

      await burn.save();

      // TODO: Consider using .concat() for handling array updates to protect
      // against unintended side effects for other code paths.
      burns.push(burn.id);
      transaction.burns = burns;
      await transaction.save();
    }

    // burn
    if (
      event.params.to.toHexString() == ADDRESS_ZERO &&
      event.params.from.toHexString() == pair.id
    ) {
      pair.totalSupply = pair.totalSupply - value;
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
            id: event.transaction.hash
              .toHexString()
              .concat("-")
              .concat(BigInt.fromI32(burns.length).toString()),
            transaction: transaction.id,
            needsComplete: false,
            pair: pair.id,
            liquidity: value,
            transaction: transaction.id,
            timestamp: transaction.timestamp,
          });
        }
      } else {
        burn = new BurnEvent({
          id: event.transaction.hash
            .toHexString()
            .concat("-")
            .concat(BigInt.fromI32(burns.length).toString()),
          transaction: transaction.id,
          needsComplete: false,
          pair: pair.id,
          liquidity: value,
          transaction: transaction.id,
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
        burns[burns.length - 1] = burn.id;
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

    if (from.toHexString() != ADDRESS_ZERO && from.toHexString() != pair.id) {
      let fromUserLiquidityPosition = createLiquidityPosition(
        event.address,
        from
      );
      fromUserLiquidityPosition.liquidityTokenBalance = convertTokenToDecimal(
        pairContract.balanceOf(from),
        BI_18
      );
      await fromUserLiquidityPosition.save();
      createLiquiditySnapshot(fromUserLiquidityPosition, event);
    }

    if (
      event.params.to.toHexString() != ADDRESS_ZERO &&
      to.toHexString() != pair.id
    ) {
      let toUserLiquidityPosition = createLiquidityPosition(event.address, to);
      toUserLiquidityPosition.liquidityTokenBalance = convertTokenToDecimal(
        pairContract.balanceOf(to),
        BI_18
      );
      await toUserLiquidityPosition.save();
      createLiquiditySnapshot(toUserLiquidityPosition, event);
    }

    await transaction.save();
  },
};

const handleSync = {
  type: null,
  description: "handle Sync",
  args: {
    Sync: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    let pair = await Pair.findOne({ id: event.address.toHex() });
    let token0 = await Token.findOne({ id: pair.token0 });
    let token1 = await Token.findOne({ id: pair.token1 });
    let uniswap = await UniswapFactory.findOne({
      id: process.env.FACTORY_ADDRESS,
    });

    // reset factory liquidity by subtracting onluy tarcked liquidity
    uniswap.totalLiquidityETH =
      uniswap.totalLiquidityETH - pair.trackedReserveETH;

    // reset token total liquidity amounts
    token0.totalLiquidity = token0.totalLiquidity - pair.reserve0;
    token1.totalLiquidity = token1.totalLiquidity - pair.reserve1;

    pair.reserve0 = convertTokenToDecimal(
      event.params.reserve0,
      token0.decimals
    );
    pair.reserve1 = convertTokenToDecimal(
      event.params.reserve1,
      token1.decimals
    );

    if (pair.reserve1 != ZERO_BD)
      pair.token0Price = pair.reserve0 / pair.reserve1;
    else pair.token0Price = ZERO_BD;
    if (pair.reserve0 != ZERO_BD)
      pair.token1Price = pair.reserve1 / pair.reserve0;
    else pair.token1Price = ZERO_BD;

    await pair.save();

    // update ETH price now that reserves could have changed
    let bundle = await Bundle.findeOne({ id: "1" });
    bundle.ethPrice = getEthPriceInUSD();
    await bundle.save();

    token0.derivedETH = findEthPerToken(token0);
    token1.derivedETH = findEthPerToken(token1);
    await token0.save();
    await token1.save();

    // get tracked liquidity - will be 0 if neither is in whitelist
    let trackedLiquidityETH;
    if (bundle.ethPrice != ZERO_BD) {
      trackedLiquidityETH =
        getTrackedLiquidityUSD(pair.reserve0, token0, pair.reserve1, token1) /
        bundle.ethPrice;
    } else {
      trackedLiquidityETH = ZERO_BD;
    }

    // use derived amounts within pair
    pair.trackedReserveETH = trackedLiquidityETH;
    pair.reserveETH =
      pair.reserve0.times(token0.derivedETH) +
      pair.reserve1.times(token1.derivedETH);
    pair.reserveUSD = pair.reserveETH.times(bundle.ethPrice);

    // use tracked amounts globally
    uniswap.totalLiquidityETH = uniswap.totalLiquidityETH + trackedLiquidityETH;
    uniswap.totalLiquidityUSD = uniswap.totalLiquidityETH.times(
      bundle.ethPrice
    );

    // now correctly set liquidity amounts for each token
    token0.totalLiquidity = token0.totalLiquidity + pair.reserve0;
    token1.totalLiquidity = token1.totalLiquidity + pair.reserve1;

    // save entities
    await pair.save();
    await uniswap.save();
    await token0.save();
    await token1.save();
  },
};

const handleMint = {
  type: null,
  description: "handle Mint",
  args: {
    Mint: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    let transaction = await Transaction.findOne({
      id: event.transaction.hash.toHexString(),
    });
    let mints = transaction.mints;
    let mint = await MintEvent.findOne({ id: mints[mints.length - 1] });

    let pair = await Pair.findOne({ id: event.address.toHex() });
    let uniswap = await UniswapFactory.findOne({
      id: process.env.FACTORY_ADDRESS,
    });

    let token0 = await Token.findOne({ id: pair.token0 });
    let token1 = await Token.findOne({ id: pair.token1 });

    // update exchange info (except balances, sync will cover that)
    let token0Amount = convertTokenToDecimal(
      event.params.amount0,
      token0.decimals
    );
    let token1Amount = convertTokenToDecimal(
      event.params.amount1,
      token1.decimals
    );

    // update txn counts
    token0.txCount = token0.txCount + ONE_BI;
    token1.txCount = token1.txCount + ONE_BI;

    // get new amounts of USD and ETH for tracking
    let bundle = await Bundle.findOne({ id: "1" });
    let amountTotalUSD =
      token1.derivedETH.times(token1Amount) +
      token0.derivedETH.times(token0Amount) +
      bundle.ethPrice;

    // update txn counts
    pair.txCount = pair.txCount - ONE_BI;
    uniswap.txCount = uniswap.txCount - ONE_BI;

    // save entities
    await token0.save();
    await token1.save();
    await pair.save();
    await uniswap.save();

    mint.sender = event.params.sender;
    mint.amount0 = token0Amount;
    mint.amount1 = token1Amount;
    mint.logIndex = event.logIndex;
    mint.amountUSD = amountTotalUSD;
    await mint.save();

    // update the LP position
    let liquidityPosition = createLiquidityPosition(event.address, mint.to);
    createLiquiditySnapshot(liquidityPosition, event);

    // update day entities
    updatePairDayData(event);
    updatePairHourData(event);
    updateUniswapDayData(event);
    updateTokenDayData(token0);
    updateTokenDayData(token1);
  },
};

const handleBurn = {
  type: null,
  description: "handle Burn",
  args: {
    Burn: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    let transaction = await Transaction.findOne({
      id: event.transaction.hash.toHexString(),
    });

    // safety check
    if (transaction === null) {
      return;
    }

    let burns = transaction.burns;
    let burn = await BurnEvent.findOne({ id: burns[burns.length - 1] });

    let pair = await Pair.findOne({ id: event.address.toHex() });
    let uniswap = await UniswapFactory.findOne({ id: FACTORY_ADDRESS });

    //update token info
    let token0 = await Token.findOne({ id: pair.token0 });
    let token1 = await Token.findOne({ id: pair.token1 });
    let token0Amount = convertTokenToDecimal(
      event.params.amount0,
      token0.decimals
    );
    let token1Amount = convertTokenToDecimal(
      event.params.amount1,
      token1.decimals
    );

    // update txn counts
    token0.txCount = token0.txCount + ONE_BI;
    token1.txCount = token1.txCount + ONE_BI;

    // get new amounts of USD and ETH for tracking
    let bundle = await Bundle.findOne({ id: "1" });
    let amountTotalUSD =
      token1.derivedETH.times(token1Amount) +
      token0.derivedETH.times(token0Amount).times(bundle.ethPrice);

    // update txn counts
    uniswap.txCount = uniswap.txCount + ONE_BI;
    pair.txCount = pair.txCount + ONE_BI;

    // update global counter and save
    await token0.save();
    await token1.save();
    await pair.save();
    await uniswap.save();

    // update burn
    // burn.sender = event.params.sender
    burn.amount0 = token0Amount;
    burn.amount1 = token1Amount;
    // burn.to = event.params.to
    burn.logIndex = event.logIndex;
    burn.amountUSD = amountTotalUSD;
    await burn.save();

    // update the LP position
    let liquidityPosition = createLiquidityPosition(event.address, burn.sender);
    createLiquiditySnapshot(liquidityPosition, event);

    // update day entities
    updatePairDayData(event);
    updatePairHourData(event);
    updateUniswapDayData(event);
    updateTokenDayData(token0, event);
    updateTokenDayData(token1, event);
  },
};

const handleSwap = {
  type: null,
  description: "handle Swap",
  args: {
    Swap: { type: GraphQLBoolean },
  },
  async resolve(parent, args, context) {
    let pair = await Pair.findOne({ id: event.address.toHexString() });
    let token0 = await Token.findOne({ id: pair.token0 });
    let token1 = await Token.findOne({ id: pair.token1 });
    let amount0In = convertTokenToDecimal(
      event.params.amount0In,
      token0.decimals
    );
    let amount1In = convertTokenToDecimal(
      event.params.amount1In,
      token1.decimals
    );
    let amount0Out = convertTokenToDecimal(
      event.params.amount0Out,
      token0.decimals
    );
    let amount1Out = convertTokenToDecimal(
      event.params.amount1Out,
      token1.decimals
    );

    // totals for volume updates
    let amount0Total = amount0Out + amount0In;
    let amount1Total = amount1Out + amount1In;

    // ETH/USD prices
    let bundle = await Bundle.findOne({ id: "1" });

    // get total amounts of derived USD and ETH for tracking
    let derivedAmountETH =
      token1.derivedETH.times(amount1Total) +
      token0.derivedETH.times(amount0Total) / BigDecimal.fromString("2");
    let derivedAmountUSD = derivedAmountETH.times(bundle.ethPrice);

    // only accounts for volume through white listed tokens
    let trackedAmountUSD = getTrackedVolumeUSD(
      amount0Total,
      token0,
      amount1Total,
      token1,
      pair
    );

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
      id: process.env.FACTORY_ADDRESS,
    });
    uniswap.totalVolumeUSD = uniswap.totalVolumeUSD + trackedAmountUSD;
    uniswap.totalVolumeETH = uniswap.totalVolumeETH + trackedAmountETH;
    uniswap.untrackedVolumeUSD = uniswap.untrackedVolumeUSD + derivedAmountUSD;
    uniswap.txCount = uniswap.txCount + ONE_BI;

    // save entities
    await pair.save();
    await token0.save();
    await token1.save();
    await uniswap.save();

    let transaction = await Transaction.fineOne({
      id: event.transaction.hash.toHexString(),
    });
    if (transaction === null) {
      transaction = new Transaction({
        id: event.transaction.hash.toHexString(),
        blockNumber: event.block.number,
        timestamp: event.block.timestamp,
        mints: [],
        swaps: [],
        burns: [],
      });
    }
    let swaps = transaction.swaps;
    let swap = new SwapEvent({
      id: event.transaction.hash
        .toHexString()
        .concat("-")
        .concat(BigInt.fromI32(swaps.length).toString()),
      // update swap event
      transaction: transaction.id,
      pair: pair.id,
      timestamp: transaction.timestamp,
      transaction: transaction.id,
      sender: event.params.sender,
      amount0In: amount0In,
      amount1In: amount1In,
      amount0Out: amount0Out,
      amount1Out: amount1Out,
      to: event.params.to,
      from: event.transaction.from,
      logIndex: event.logIndex,
      // use the tracked amount if we have it
      amountUSD:
        trackedAmountUSD === ZERO_BD ? derivedAmountUSD : trackedAmountUSD,
    });
    await swap.save();

    // update the transaction

    // TODO: Consider using .concat() for handling array updates to protect
    // against unintended side effects for other code paths.
    swaps.push(swap.id);
    transaction.swaps = swaps;
    await transaction.save();

    // update day entities
    let pairDayData = updatePairDayData(event);
    let pairHourData = updatePairHourData(event);
    let uniswapDayData = updateUniswapDayData(event);
    let token0DayData = updateTokenDayData(token0, event);
    let token1DayData = updateTokenDayData(token1, event);

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
    pairDayData.dailyVolumeUSD = pairDayData.dailyVolumeUSD + trackedAmountUSD;
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
      token0DayData.dailyVolumeETH + amount0Total.times(token0.derivedETH);
    token0DayData.dailyVolumeUSD =
      token0DayData.dailyVolumeUSD +
      amount0Total.times(token0.derivedETH).times(bundle.ethPrice);
    await token0DayData.save();

    // swap specific updating
    token1DayData.dailyVolumeToken =
      token1DayData.dailyVolumeToken + amount1Total;
    token1DayData.dailyVolumeETH =
      token1DayData.dailyVolumeETH + amount1Total.times(token1.derivedETH);
    token1DayData.dailyVolumeUSD =
      token1DayData.dailyVolumeUSD +
      amount1Total.times(token1.derivedETH).times(bundle.ethPrice);
    await token1DayData.save();
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
