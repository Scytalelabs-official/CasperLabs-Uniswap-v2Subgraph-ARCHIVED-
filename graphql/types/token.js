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
    totalSupply: {type: GraphQLString},// used for other stats like marketcap
    //token specific volume
    tradeVolume: {type: GraphQLString},
    tradeVolumeUSD: {type: GraphQLString},
    untrackedVolumeUSD: {type: GraphQLString},
    txCount: {type: GraphQLString},//transactions across all pairs
    totalLiquidity: {type: GraphQLString},//liquidity across all pairs
    derivedETH: {type: GraphQLString},//derived prices
    mostLiquidPairs: {type: GraphQLList(GraphQLString)}

  })
});

module.exports = { tokenType };