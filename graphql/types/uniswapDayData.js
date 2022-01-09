const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat
} = require("graphql");

const uniswapDayDataType = new GraphQLObjectType({

  name: "UniswapDayData",
  description: "UniswapDayData type",
  fields: () => ({

      _id: {type: GraphQLID },
      id:{type:GraphQLString},// timestamp rounded to current day by dividing by 86400
      date: {type:GraphQLFloat},
      dailyVolumeETH: {type:GraphQLString},
      dailyVolumeUSD: {type:GraphQLString},
      dailyVolumeUntracked: {type:GraphQLString},
      totalVolumeETH: {type:GraphQLString},
      totalLiquidityETH: {type:GraphQLString},
      totalVolumeUSD: {type:GraphQLString}, // Accumulate at each trade, not just calculated off whatever totalVolume is. making it more accurate as it is a live conversion
      totalLiquidityUSD: {type:GraphQLString},
      txCount: {type:GraphQLString}
      
})
});

module.exports = { uniswapDayDataType };


