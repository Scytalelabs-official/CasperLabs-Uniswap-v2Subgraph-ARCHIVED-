const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
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
      reserve0: {type:GraphQLString},
      reserve1: {type:GraphQLString},
      totalSupply: {type:GraphQLString},// total supply for LP historical returns
      reserveUSD: {type:GraphQLString}, // derived liquidity
      // volume stats
      dailyVolumeToken0: {type:GraphQLString},
      dailyVolumeToken1: {type:GraphQLString},
      dailyVolumeUSD: {type:GraphQLString},
      dailyTxns: {type:GraphQLString}
      
})
});

module.exports = { pairDayDataType };


