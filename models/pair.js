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
            type : String
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
            type : String
        } 
    },

    reserve0: {
        type: String,
    },
    reserve1: {
        type: String,
    },
    totalSupply:{
        type: String,
    },
  
    //derived liquidity
    reserveETH: {
        type: String,
    },
    reserveUSD: {
        type: String,
    },
    // used for separating per pair reserves and global
    trackedReserveETH: {
        type: String,
    },
  
    // Price in terms of the asset pair
    token0Price: {
        type: String,
    },
    token1Price: {
        type: String,
    },
  
    // lifetime volume stats
    volumeToken0: {
        type: String,
    },
    volumeToken1: {
        type: String,
    },
    volumeUSD: {
        type: String,
    },
    untrackedVolumeUSD: {
        type: String,
    },
    txCount: {
        type: String,
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
        type: String,
    }, // used to detect new exchanges

});

var pair = mongoose.model("pair", pairSchema);
module.exports = pair;
