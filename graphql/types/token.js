const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} = require("graphql");

var tokenDayData= require('./tokenDayData');
var pairDayData= require('./pairDayData');
var pair= require('./pair');

const tokenType = new GraphQLObjectType({

  name: "Token",
  description: "Token type",
  fields: () => ({

    _id: {type: GraphQLID },
    id: {type: GraphQLString},//token address
    // mirrored from the smart contract
    symbol: {type: GraphQLString},
    name: {type: GraphQLString},
    decimals: {type: GraphQLInt},
    totalSupply: {type: GraphQLInt},// used for other stats like marketcap
    //token specific volume
    tradeVolume: {type: GraphQLInt},
    tradeVolumeUSD: {type: GraphQLInt},
    untrackedVolumeUSD: {type: GraphQLInt},
    txCount: {type: GraphQLInt},//transactions across all pairs
    totalLiquidity: {type: GraphQLInt},//liquidity across all pairs
    derivedETH: {type: GraphQLInt},//derived prices

    // derived fields
    tokenDayData:[tokenDayData], // @derivedFrom(field: "token")
    pairDayDataBase: [pairDayData], //@derivedFrom(field: "token0")
    pairDayDataQuote: [pairDayData], //@derivedFrom(field: "token1")
    pairBase: [pair], //@derivedFrom(field: "token0")
    pairQuote: [pair], //@derivedFrom(field: "token1")

  })
});

module.exports = { tokenType };