const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLFloat
} = require("graphql");
  

const pairHourDataType = new GraphQLObjectType({
  
    name: "PairHourData",
    description: "PairHourData type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id:{type:GraphQLString},
        hourStartUnix: {type:GraphQLFloat},// unix timestamp for start of hour
        pair: {type:GraphQLString},
        // reserves
        reserve0: {type:GraphQLString},
        reserve1: {type:GraphQLString},
        totalSupply: {type:GraphQLString},// total supply for LP historical returns
        reserveUSD: {type:GraphQLString},// derived liquidity
        // volume stats
        hourlyVolumeToken0: {type:GraphQLString},
        hourlyVolumeToken1: {type:GraphQLString},
        hourlyVolumeUSD: {type:GraphQLString},
        hourlyTxns: {type:GraphQLString}
        
  })
});
  
module.exports = { pairHourDataType };
  
  
  
