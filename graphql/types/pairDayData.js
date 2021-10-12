const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} = require("graphql");

var token=require('./token');

const pairDayDataType = new GraphQLObjectType({

  name: "PairDayData",
  description: "PairDayData type",
  fields: () => ({

      _id: {type: GraphQLID },
      id:{type:GraphQLString},
      date: {type:GraphQLInt},
      pairAddress:{type:GraphQLString},
      token0: token,
      token1: token,
      // reserves
      reserve0: {type:GraphQLInt},
      reserve1: {type:GraphQLInt},
      totalSupply: {type:GraphQLInt},// total supply for LP historical returns
      reserveUSD: {type:GraphQLInt}, // derived liquidity
      // volume stats
      dailyVolumeToken0: {type:GraphQLInt},
      dailyVolumeToken1: {type:GraphQLInt},
      dailyVolumeUSD: {type:GraphQLInt},
      dailyTxns: {type:GraphQLInt}
      
})
});

module.exports = { pairDayDataType };


