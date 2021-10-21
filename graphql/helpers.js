var ERC20 = require("../Jsclients/ERC20/test/installed.ts");
//var TokenDefinition = require('./tokenDefinition');

const User = require("../models/user");
const LiquidityPosition = require("../models/liquidityPosition");
const LiquidityPositionSnapshot = require("../models/liquidityPositionSnapshot");
const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
require("dotenv").config();

const ADDRESS_ZERO =
  "account-hash-0000000000000000000000000000000000000000000000000000000000000000";

let ZERO_BI = 0;
let ONE_BI = 1;
let ZERO_BD = 0;
let ONE_BD = 1;
let BI_18 = 18;

// // rebass tokens, dont count in tracked volume
let UNTRACKED_PAIRS = ["hash-0x9ea3b5b4ec044b70375236a281986106457b20ef"];

// function exponentToBigDecimal(decimals) {
//   let bd = BigDecimal.fromString('1');
//   for (let i = ZERO_BI; i.lt(decimals); i = i.plus(ONE_BI)) {
//     bd = bd.times(BigDecimal.fromString('10'));
//   }
//   return bd;
// }

// function bigDecimalExp18() {
//   return BigDecimal.fromString('1000000000000000000');
// }

// function convertEthToDecimal(eth) {
//   return eth.toBigDecimal().div(exponentToBigDecimal(18));
// }

// function convertTokenToDecimal(tokenAmount, exchangeDecimals) {
//   if (exchangeDecimals == ZERO_BI) {
//     return tokenAmount.toBigDecimal();
//   }
//   return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
// }

// function equalToZero(value) {
//   const formattedVal = parseFloat(value.toString());
//   const zero = parseFloat(ZERO_BD.toString());
//   if (zero == formattedVal) {
//     return true;
//   }
//   return false;
// }

// function isNullEthValue(value) {
//   return value == '0x0000000000000000000000000000000000000000000000000000000000000001';
// }

// NOTE: tokenDefination Class Converted to Array

function fromAddress(tokenAddress) {
  let staticDefinitions = [
    {
      address: "0xe0b7927c4af23765cb51314a0e0521a9645f0e2a", // Add DGD
      symbol: "DGD",
      name: "DGD",
      decimals: 9,
    },
    {
      address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", // Add AAVE
      symbol: "AAVE",
      name: "Aave Token",
      decimals: 18,
    },
    {
      address: "0xeb9951021698b42e4399f9cbb6267aa35f82d59d", // Add LIF
      symbol: "LIF",
      name: "Lif",
      decimals: 18,
    },
    {
      address: "0xbdeb4b83251fb146687fa19d1c660f99411eefe3", // Add SVD
      symbol: "SVD",
      name: "savedroid",
      decimals: 18,
    },
    {
      address: "0xbb9bc244d798123fde783fcc1c72d3bb8c189413", //Add THEDAO
      symbol: "THEDAO",
      name: "THEDAO",
      decimals: 16,
    },
    {
      address: "0x38c6a68304cdefb9bec48bbfaaba5c5b47818bb2", //ADD HPB
      symbol: "HPB",
      name: "HPBCoin",
      decimals: 18,
    },
  ];
  let tokenAddressHex = tokenAddress;

  // Search the definition using the address
  for (let i = 0; i < staticDefinitions.length; i++) {
    let staticDefinition = staticDefinitions[i];
    if (staticDefinition.address == tokenAddressHex) {
      return staticDefinition;
    }
  }

  // If not found, return null
  return null;
}

async function fetchTokenName(tokenAddress) {
  // definitions overrides

  let staticDefinition = fromAddress(tokenAddress);
  if (staticDefinition != null) {
    return staticDefinition.name;
  }

  let contractname = await ERC20.getName(tokenAddress);
  return contractname;
}

async function fetchTokenSymbol(tokenAddress) {
  // static definitions overrides
  let staticDefinition = fromAddress(tokenAddress);
  if(staticDefinition != null) {
    return (staticDefinition).symbol;
  }

  let contractsymbol = await ERC20.getSymbol(tokenAddress);
  return contractsymbol;
}

async function fetchTokenTotalSupply(tokenAddress) {
  let contracttotalsupply = await ERC20.getTotalSupply(tokenAddress);
  return contracttotalsupply;
}

async function fetchTokenDecimals(tokenAddress) {
  // static definitions overrides
  let staticDefinition = fromAddress(tokenAddress);
  if(staticDefinition != null) {
    return (staticDefinition).decimals;
  }

  let contractdecimal = await ERC20.getDecimals(tokenAddress);
  return contractdecimal;
}

async function createLiquidityPosition(exchange, user, value) {
  try {
    // let liquidityTokenBalance = await LiquidityPosition.findOne({id: exchange.toHexString().concat('-').concat(user.toHexString())});
    let liquidityTokenBalance = await LiquidityPosition.findOne({
      id: exchange + " - " + user,
    });
    if (liquidityTokenBalance === null) {
      let pair = await Pair.findOne({ id: exchange });
      pair.liquidityProviderCount = pair.liquidityProviderCount + ONE_BI;
      liquidityTokenBalance = new LiquidityPosition({
        // id:exchange.toHexString().concat('-').concat(user.toHexString()),
        id: exchange + " - " + user,
        liquidityTokenBalance: value,
        pair: exchange,
        user: user,
      });

      await liquidityTokenBalance.save();
      await pair.save();
    } else {
      liquidityTokenBalance.liquidityTokenBalance = value;
      await liquidityTokenBalance.save();
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function createUser(address) {
  try {
    let user = await User.findOne({ id: address });
    if (user === null) {
      user = new User({
        id: address,
        usdSwapped: ZERO_BD,
      });

      await user.save();
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function createLiquiditySnapshot(position, event) {
  try {
    // let timestamp = event.block.timestamp.toI32();
    let timestamp = 1000;
    let bundle = await Bundle.findOne({ id: "1" });
    let pair = await Pair.findOne({ id: position.pair });
    //let pair = await Pair.findOne({ id: "hash-0000000000000000000000000000000000000000000000000000000000000000" });
    let token0 = await Token.findOne({ id: pair.token0 });
    let token1 = await Token.findOne({ id: pair.token1 });

    // create new snapshot
    let snapshot = new LiquidityPositionSnapshot({
      // id:position.id.concat(timestamp.toString()),
      id: position.id + timestamp.toString(),
      liquidityPosition: position.id,
      timestamp: timestamp,
      // block : event.block.number.toI32(),
      block: 599,
      user: position.user,
      pair: position.pair,
      token0PriceUSD: token0.derivedETH * bundle.ethPrice,
      token1PriceUSD: token1.derivedETH * bundle.ethPrice,
      reserve0: pair.reserve0,
      reserve1: pair.reserve1,
      reserveUSD: pair.reserveUSD,
      liquidityTokenTotalSupply: pair.totalSupply,
      liquidityTokenBalance: position.liquidityTokenBalance,
      liquidityPosition: position.id,
    });

    await snapshot.save();
    await position.save();
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  ADDRESS_ZERO,
  ZERO_BI,
  ONE_BI,
  ZERO_BD,
  ONE_BD,
  BI_18,
  //     factoryContract,
  UNTRACKED_PAIRS,
  //     exponentToBigDecimal,
  //     bigDecimalExp18,
  //     convertEthToDecimal,
  //     equalToZero,
  //     isNullEthValue,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenTotalSupply,
  fetchTokenDecimals,
  createLiquidityPosition,
  createUser,
  createLiquiditySnapshot,
};
