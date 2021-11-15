var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const pairSchema = new Schema({

    // pair address
    id: {
        type: String,
    },

    // mirrored from the smart contract
    
    token0: { 
        id:{
            type : String
        },
        name:{
            type : String
        },
        symbol:{
            type : String
        },
        totalLiquidity:{
            type : String
        },
        derivedETH:{
            type : Number
        } 
    },
    token1: { 
        id:{
            type : String
        },
        name:{
            type : String
        },
        symbol:{
            type : String
        },
        totalLiquidity:{
            type : String
        },
        derivedETH:{
            type : Number
        } 
    },

    reserve0: {
        type: Number,
    },
    reserve1: {
        type: Number,
    },
    totalSupply:{
        type: Number,
    },
  
    //derived liquidity
    reserveETH: {
        type: Number,
    },
    reserveUSD: {
        type: Number,
    },
    // used for separating per pair reserves and global
    trackedReserveETH: {
        type: Number,
    },
  
    // Price in terms of the asset pair
    token0Price: {
        type: Number,
    },
    token1Price: {
        type: Number,
    },
  
    // lifetime volume stats
    volumeToken0: {
        type: Number,
    },
    volumeToken1: {
        type: Number,
    },
    volumeUSD: {
        type: Number,
    },
    untrackedVolumeUSD: {
        type: Number,
    },
    txCount: {
        type: Number,
    },
  
    // creation stats
    createdAtTimestamp: {
        type: Number,
    },
    createdAtBlockNumber: {
        type: String,
    },
  
    // Fields used to help derived relationship
    liquidityProviderCount: {
        type: Number,
    }, // used to detect new exchanges

});

var pair = mongoose.model("pair", pairSchema);
module.exports = pair;
