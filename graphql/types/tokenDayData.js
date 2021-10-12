const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

var token=require('./token');

const tokenDayDataType = new GraphQLObjectType({
  
    name: "TokenDayData",
    description: "TokenDayData type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id:{type:GraphQLString},
        date: {type:GraphQLInt},
        token: token,
        // volume stats
        dailyVolumeToken: {type:GraphQLInt},
        dailyVolumeETH: {type:GraphQLInt},
        dailyVolumeUSD: {type:GraphQLInt},
        dailyTxns: {type:GraphQLInt},
        // liquidity stats
        totalLiquidityToken: {type:GraphQLInt},
        totalLiquidityETH: {type:GraphQLInt},
        totalLiquidityUSD: {type:GraphQLInt},
        priceUSD: {type:GraphQLInt}// price stats
        
  })
});
  
module.exports = { tokenDayDataType };
  
  
  
