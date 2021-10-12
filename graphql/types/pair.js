const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

var token=require('./token');
var pairHourData=require('./pairHourData');
var liquidityPosition=require('./liquidityPosition');
var liquidityPositionSnapshot=require('./liquidityPositionSnapshot');
var mint=require('./mint');
var burn=require('./burn');
var swap=require('./swap');  

const pairType = new GraphQLObjectType({
  
    name: "Pair",
    description: "Pair type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id: {type: GraphQLString},// pair address

        // mirrored from the smart contract
        token0: token,
        token1: token,
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
        createdAtBlockNumber: {type: GraphQLInt},

        // Fields used to help derived relationship
        liquidityProviderCount: {type: GraphQLInt}, // used to detect new exchanges
        
        // derived fields
        pairHourData: [pairHourData], //@derivedFrom(field: "pair")
        liquidityPositions: [liquidityPosition], //@derivedFrom(field: "pair")
        liquidityPositionSnapshots: [liquidityPositionSnapshot], //@derivedFrom(field: "pair")
        mints: [mint], //@derivedFrom(field: "pair")
        burns: [burn], //@derivedFrom(field: "pair")
        swaps: [swap], //@derivedFrom(field: "pair")
  
    })
  });
  
  module.exports = { pairType };
