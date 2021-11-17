const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} = require("graphql");

const uniswapDayDataType = new GraphQLObjectType({

  name: "UniswapDayData",
  description: "UniswapDayData type",
  fields: () => ({

      _id: {type: GraphQLID },
      id:{type:GraphQLString},// timestamp rounded to current day by dividing by 86400
      date: {type:GraphQLFloat},
      dailyVolumeETH: {type:GraphQLInt},
      dailyVolumeUSD: {type:GraphQLInt},
      dailyVolumeUntracked: {type:GraphQLInt},
      totalVolumeETH: {type:GraphQLInt},
      totalLiquidityETH: {type:GraphQLInt},
      totalVolumeUSD: {type:GraphQLInt}, // Accumulate at each trade, not just calculated off whatever totalVolume is. making it more accurate as it is a live conversion
      totalLiquidityUSD: {type:GraphQLInt},
      txCount: {type:GraphQLInt}
      
})
});

module.exports = { uniswapDayDataType };


