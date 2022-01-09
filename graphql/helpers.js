var ERC20 = require("../JsClients/ERC20/test/installed.ts");
//var TokenDefinition = require('./tokenDefinition');

const User = require("../models/user");
const LiquidityPosition = require("../models/liquidityPosition");
const LiquidityPositionSnapshot = require("../models/liquidityPositionSnapshot");
const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
require("dotenv").config();

const ADDRESS_ZERO =
  "0000000000000000000000000000000000000000000000000000000000000000";

let ZERO_BI = "0";
let ONE_BI = "1";
let ZERO_BD = "0";
let ONE_BD = "1";
let BI_18 = "18";

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
      address:
        "52718191a7a3561a4731bdfe8a6c5cdb5b461f3ff4f108d992631e6546b6cf46", // Add DGD
      symbol: "DGD",
      name: "DGD",
      decimals: 9,
    },
    {
      address:
        "fa38deb158ea1726452ccbbc9dc04ef591f4796efa710962e561ecb92e8194ff", // Add AAVE
      symbol: "AAVE",
      name: "Aave Token",
      decimals: 18,
    },
    {
      address:
        "0f744d1f61294f0ae3ed5d42383ebb2c5e7d4c0c815083538783007686175d8d", // Add LIF
      symbol: "LIF",
      name: "Lif",
      decimals: 18,
    },
    {
      address:
        "8e0645dd0bf4c13d9f06ee1833168a2db4af7d34226138a5029e04516e8c07b9", // Add SVD
      symbol: "SVD",
      name: "savedroid",
      decimals: 18,
    },
    {
      address:
        "5b28b445ad942a24bb5c540deb016a13a86fd1e13e9a4d3f711daa214b0fb595", //Add THEDAO
      symbol: "THEDAO",
      name: "THEDAO",
      decimals: 16,
    },
    {
      address:
        "10bf7479c48e961c3852acdf9f08ed96acefbc30e4b999e3aad73d22c69785ea", //ADD HPB
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
  if (staticDefinition != null) {
    return staticDefinition.symbol;
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
  if (staticDefinition != null) {
    return staticDefinition.decimals;
  }

  let contractdecimal = await ERC20.getDecimals(tokenAddress);
  return contractdecimal;
}

async function createLiquidityPosition(exchange, user, value) {
  try {
    let liquidityTokenBalance = await LiquidityPosition.findOne({
      id: exchange + "-" + user,
    });
    if (liquidityTokenBalance === null) {
      let pair = await Pair.findOne({ id: exchange });
      pair.liquidityProviderCount = pair.liquidityProviderCount + ONE_BI;
      liquidityTokenBalance = new LiquidityPosition({
        id: exchange + "-" + user,
        liquidityTokenBalance: value.toString(),
        pair: {
          id: pair.id,
          reserve0: pair.reserve0,
          reserve1: pair.reserve1,
          reserveUSD: pair.reserveUSD,
          totalSupply: pair.totalSupply,
          token0: {
            id: pair.token0.id,
            symbol: pair.token0.symbol,
            derivedETH: pair.token0.derivedETH,
          },
          token1: {
            id: pair.token1.id,
            symbol: pair.token1.symbol,
            derivedETH: pair.token1.derivedETH,
          },
        },
        user: { id: user },
      });

      await liquidityTokenBalance.save();
      await pair.save();
    } else {
      liquidityTokenBalance.liquidityTokenBalance = value.toString();
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

async function createLiquiditySnapshot(position, timeStamp, blockHash) {
  try {
    let bundle = await Bundle.findOne({ id: "1" });
    let pair = await Pair.findOne({ id: position.pair.id });
    let token0 = await Token.findOne({ id: pair.token0.id });
    let token1 = await Token.findOne({ id: pair.token1.id });

    // create new snapshot
    let snapshot = new LiquidityPositionSnapshot({
      id: position.id + timeStamp.toString(),
      liquidityPosition: position.id,
      timestamp: timeStamp,
      block: blockHash,
      user: position.user.id,
      pair: {
        id: position.pair.id,
        reserve0: pair.reserve0,
        reserve1: pair.reserve1,
        reserveUSD: pair.reserveUSD,
        token0: { id: pair.token0.id },
        token1: { id: pair.token1.id },
      },
      token0PriceUSD: (
        BigInt(token0.derivedETH) * BigInt(bundle.ethPrice)
      ).toString(),
      token1PriceUSD: (
        BigInt(token1.derivedETH) * BigInt(bundle.ethPrice)
      ).toString(),
      reserve0: pair.reserve0,
      reserve1: pair.reserve1,
      reserveUSD: pair.reserveUSD,
      liquidityTokenTotalSupply: pair.totalSupply,
      liquidityTokenBalance: position.liquidityTokenBalance,
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
