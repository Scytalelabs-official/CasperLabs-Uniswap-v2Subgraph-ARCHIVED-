var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var token=require('./token');
var pairHourData=require('./pairHourData');
var liquidityPosition=require('./liquidityPosition');
var liquidityPositionSnapshot=require('./liquidityPositionSnapshot');
var mint=require('./mint');
var burn=require('./burn');
var swap=require('./swap');

const pairSchema = new Schema({

    // pair address
    id: {
        type: String,
    },

    // mirrored from the smart contract
    token0: token,
    token1: token,

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
        type: Number,
    },
  
    // Fields used to help derived relationship
    liquidityProviderCount: {
        type: Number,
    }, // used to detect new exchanges

    // derived fields
    pairHourData: [pairHourData], //@derivedFrom(field: "pair")
    liquidityPositions: [liquidityPosition], //@derivedFrom(field: "pair")
    liquidityPositionSnapshots: [liquidityPositionSnapshot], //@derivedFrom(field: "pair")
    mints: [mint], //@derivedFrom(field: "pair")
    burns: [burn], //@derivedFrom(field: "pair")
    swaps: [swap], //@derivedFrom(field: "pair")

});

var pair = mongoose.model("pair", pairSchema);
module.exports = pair;
