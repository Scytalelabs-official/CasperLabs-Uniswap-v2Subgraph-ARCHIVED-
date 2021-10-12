const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");
  
var pair = require('./pair');

const pairHourDataType = new GraphQLObjectType({
  
    name: "PairHourData",
    description: "PairHourData type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id:{type:GraphQLString},
        hourStartUnix: {type:GraphQLInt},// unix timestamp for start of hour
        pair: pair,
        // reserves
        reserve0: {type:GraphQLInt},
        reserve1: {type:GraphQLInt},
        totalSupply: {type:GraphQLInt},// total supply for LP historical returns
        reserveUSD: {type:GraphQLInt},// derived liquidity
        // volume stats
        hourlyVolumeToken0: {type:GraphQLInt},
        hourlyVolumeToken1: {type:GraphQLInt},
        hourlyVolumeUSD: {type:GraphQLInt},
        hourlyTxns: {type:GraphQLInt}
        
  })
});
  
module.exports = { pairHourDataType };
  
  
  
