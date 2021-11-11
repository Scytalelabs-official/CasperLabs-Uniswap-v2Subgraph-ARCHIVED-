const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLOutputType
} = require("graphql");

// var GraphQLOutputType={
//     id: {type: GraphQLString},
//     name: {type: GraphQLString},
//     symbol: {type: GraphQLString}
// };
const { tokenType } = require("./token");
const pairType = new GraphQLObjectType({
  
    name: "Pair",
    description: "Pair type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id: {type: GraphQLString},// pair address

        // mirrored from the smart contract
        token0: {type:tokenType},
        token1: {type:tokenType},
        reserve0: {type: GraphQLInt},
        reserve1: {type: GraphQLInt},
        totalSupply:{type: GraphQLInt},

        //derived liquidity
        reserveETH: {type: GraphQLInt},
        reserveUSD: {type: GraphQLInt},
        trackedReserveETH: {type: GraphQLInt},// used for separating per pair reserves and global
    
        // Price in terms of the asset pair
        token0Price: {type: GraphQLInt},
        token1Price: {type: GraphQLInt},
        
        // lifetime volume stats
        volumeToken0: {type: GraphQLInt},
        volumeToken1: {type: GraphQLInt},
        volumeUSD: {type: GraphQLInt},
        untrackedVolumeUSD: {type: GraphQLInt},
        txCount: {type: GraphQLInt},

        // creation stats
        createdAtTimestamp: {type: GraphQLInt},
        createdAtBlockNumber: {type: GraphQLString},

        // Fields used to help derived relationship
        liquidityProviderCount: {type: GraphQLInt}, // used to detect new exchanges
        
    })
  });
  
  module.exports = { pairType };
