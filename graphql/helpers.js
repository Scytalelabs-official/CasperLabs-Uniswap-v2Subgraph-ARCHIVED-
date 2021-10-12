const  ERC20  = require('./Jsclients/ERC20');
const  ERC20SymbolBytes = require('./Jsclients/ERC20SymbolBytes');
const  ERC20NameBytes = require('./Jsclients/ERC20NameBytes');
const  FactoryContract = require('../Jsclients/FACTORY');
const  TokenDefinition = require('./tokenDefinition');

const User = require("../models/user");
const LiquidityPosition = require("../models/liquidityPosition");
const LiquidityPositionSnapshot = require("../models/liquidityPositionSnapshot");
const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
require("dotenv").config();

const ADDRESS_ZERO = 'account-hash-0000000000000000000000000000000000000000000000000000000000000000';

let ZERO_BI = 0;
let ONE_BI = 1;
let ZERO_BD = 0;
let ONE_BD = 1;
let BI_18 =18;

let factoryContract = FactoryContract.bind(process.env.FACTORY_ADDRESS);

// rebass tokens, dont count in tracked volume
let UNTRACKED_PAIRS = ['0x9ea3b5b4ec044b70375236a281986106457b20ef'];

function exponentToBigDecimal(decimals) {
  let bd = BigDecimal.fromString('1');
  for (let i = ZERO_BI; i.lt(decimals); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'));
  }
  return bd;
}

function bigDecimalExp18() {
  return BigDecimal.fromString('1000000000000000000');
}

function convertEthToDecimal(eth) {
  return eth.toBigDecimal().div(exponentToBigDecimal(18));
}

function convertTokenToDecimal(tokenAmount, exchangeDecimals) {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

function equalToZero(value) {
  const formattedVal = parseFloat(value.toString());
  const zero = parseFloat(ZERO_BD.toString());
  if (zero == formattedVal) {
    return true;
  }
  return false;
}

function isNullEthValue(value) {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001';
}

function fetchTokenSymbol(tokenAddress) {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress);
  if(staticDefinition != null) {
    return (staticDefinition).symbol;
  }

  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown';
  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString();
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

function fetchTokenName(tokenAddress){
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress);
  if(staticDefinition != null) {
    return (staticDefinition).name;
  }

  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  // try types string and bytes32 for name
  let nameValue = 'unknown';
  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString();
      }
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

function fetchTokenTotalSupply(tokenAddress){
  let contract = ERC20.bind(tokenAddress);
  let totalSupplyValue = null;
  let totalSupplyResult = contract.try_totalSupply();
  if (!totalSupplyResult.reverted) {
    totalSupplyValue = totalSupplyResult;
  }
  return BigInt.fromI32(totalSupplyValue);
}

function fetchTokenDecimals(tokenAddress) {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress);
  if(staticDefinition != null) {
    return (staticDefinition).decimals;
  }

  let contract = ERC20.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = null;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue);
}

async function createLiquidityPosition(exchange, user){
  let liquidityTokenBalance = await LiquidityPosition.findOne({id: exchange.toHexString().concat('-').concat(user.toHexString())});
  if (liquidityTokenBalance === null) {
    let pair = await Pair.findOne({id:exchange.toHexString()});
    pair.liquidityProviderCount = pair.liquidityProviderCount+(ONE_BI);
    liquidityTokenBalance = new LiquidityPosition({
        id:exchange.toHexString().concat('-').concat(user.toHexString()),
        liquidityTokenBalance : ZERO_BD,
        pair : exchange.toHexString(),
        user : user.toHexString()
    });

    await liquidityTokenBalance.save();
    await pair.save();

  }
  if (liquidityTokenBalance === null) console.log('LiquidityTokenBalance is null', [id]);
  return liquidityTokenBalance;
}

async function createUser(address){
  let user = await User.findOne({id:address.toHexString()});
  if (user === null) {
    user = new User({
        id:address.toHexString(),
        usdSwapped : ZERO_BD,
    });
    
    await user.save();
  }
}

async function createLiquiditySnapshot(position, event) {
  let timestamp = event.block.timestamp.toI32();
  let bundle =await Bundle.findOne({id:'1'});
  let pair = await Pair.findOne({id:position.pair});
  let token0 = await Token.findOne({id:pair.token0});
  let token1 = await Token.findOne({id:pair.token1});

  // create new snapshot
  let snapshot = new LiquidityPositionSnapshot({
        id:position.id.concat(timestamp.toString()),
        liquidityPosition : position.id,
        timestamp : timestamp,
        block : event.block.number.toI32(),
        user : position.user,
        pair : position.pair,
        token0PriceUSD : token0.derivedETH.times(bundle.ethPrice),
        token1PriceUSD : token1.derivedETH.times(bundle.ethPrice),
        reserve0 : pair.reserve0,
        reserve1 : pair.reserve1,
        reserveUSD : pair.reserveUSD,
        liquidityTokenTotalSupply : pair.totalSupply,
        liquidityTokenBalance : position.liquidityTokenBalance,
        liquidityPosition : position.id
    });
 
    await snapshot.save();
    await position.save();
}

module.exports = {
    ADDRESS_ZERO,
    ZERO_BI,
    ONE_BI,
    ZERO_BD,
    ONE_BD,
    BI_18,
    factoryContract,
    UNTRACKED_PAIRS,
    exponentToBigDecimal,
    bigDecimalExp18,
    convertEthToDecimal,
    equalToZero,
    isNullEthValue,
    fetchTokenSymbol,
    fetchTokenName,
    fetchTokenTotalSupply,
    fetchTokenDecimals,
    createLiquidityPosition,
    createUser,
    createLiquiditySnapshot
};