const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} = require("graphql");

const pairDayDataType = new GraphQLObjectType({

  name: "PairDayData",
  description: "PairDayData type",
  fields: () => ({

      _id: {type: GraphQLID },
      id:{type:GraphQLString},
      date: {type:GraphQLFloat},
      pairAddress:{type:GraphQLString},
      token0: {type:GraphQLString},
      token1:{type: GraphQLString},
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


