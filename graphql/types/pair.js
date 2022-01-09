const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLFloat,
    GraphQLOutputType
} = require("graphql");

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
        reserve0: {type: GraphQLString},
        reserve1: {type: GraphQLString},
        totalSupply:{type: GraphQLString},

        //derived liquidity
        reserveETH: {type: GraphQLString},
        reserveUSD: {type: GraphQLString},
        trackedReserveETH: {type: GraphQLString},// used for separating per pair reserves and global
    
        // Price in terms of the asset pair
        token0Price: {type: GraphQLString},
        token1Price: {type: GraphQLString},
        
        // lifetime volume stats
        volumeToken0: {type: GraphQLString},
        volumeToken1: {type: GraphQLString},
        volumeUSD: {type: GraphQLString},
        untrackedVolumeUSD: {type: GraphQLString},
        txCount: {type: GraphQLString},

        // creation stats
        createdAtTimestamp: {type: GraphQLFloat},
        createdAtBlockNumber: {type: GraphQLString},

        // Fields used to help derived relationship
        liquidityProviderCount: {type: GraphQLString}, // used to detect new exchanges
        
    })
  });
  
  module.exports = { pairType };
