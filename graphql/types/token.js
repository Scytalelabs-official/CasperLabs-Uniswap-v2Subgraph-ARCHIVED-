const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = require("graphql");


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
    mostLiquidPairs: {type: GraphQLList(GraphQLString)}

  })
});

module.exports = { tokenType };