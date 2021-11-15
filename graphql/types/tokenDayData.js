const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
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
        dailyVolumeToken: {type:GraphQLInt},
        dailyVolumeETH: {type:GraphQLInt},
        dailyVolumeUSD: {type:GraphQLInt},
        dailyTxns: {type:GraphQLInt},
        // liquidity stats
        totalLiquidityToken: {type:GraphQLInt},
        totalLiquidityETH: {type:GraphQLInt},
        totalLiquidityUSD: {type:GraphQLInt},
        priceUSD: {type:GraphQLInt},// price stats
        mostLiquidPairs: {type: GraphQLList(GraphQLString)}
  })
});
  
module.exports = { tokenDayDataType };
  
  
  
