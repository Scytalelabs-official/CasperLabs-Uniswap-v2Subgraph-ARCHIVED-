const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLFloat
} = require("graphql");

var token=require('./token');
var pairDayData= require('./pairDayData');

const tokenDayDataType = new GraphQLObjectType({
  
    name: "TokenDayData",
    description: "TokenDayData type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id:{type:GraphQLString},
        date: {type:GraphQLFloat},
        token: {type:GraphQLString},
        // volume stats
        dailyVolumeToken: {type:GraphQLString},
        dailyVolumeETH: {type:GraphQLString},
        dailyVolumeUSD: {type:GraphQLString},
        dailyTxns: {type:GraphQLString},
        // liquidity stats
        totalLiquidityToken: {type:GraphQLString},
        totalLiquidityETH: {type:GraphQLString},
        totalLiquidityUSD: {type:GraphQLString},
        priceUSD: {type:GraphQLString},// price stats
        mostLiquidPairs: {type: GraphQLList(GraphQLString)}
  })
});
  
module.exports = { tokenDayDataType };
  
  
  
