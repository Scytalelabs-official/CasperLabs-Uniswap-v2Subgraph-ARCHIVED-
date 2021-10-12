const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

var user=require('./user');
var pair=require('./pair');
var liquidityPosition=require('./liquidityPosition');

const liquidityPositionSnapshotType = new GraphQLObjectType({
  
    name: "LiquidityPositionSnapshot",
    description: "LiquidityPositionSnapshot type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},
        liquidityPosition: liquidityPosition,
        timestamp:{type: GraphQLInt},// saved for fast historical lookups
        block:{type: GraphQLInt},// saved for fast historical lookups
        user: user, // reference to user
        pair: pair, // reference to pair
        token0PriceUSD:{type: GraphQLInt}, //snapshot of token0 price
        token1PriceUSD:{type: GraphQLInt}, //snapshot of token1 price
        reserve0:{type: GraphQLInt}, //snapshot of pair token0 reserves
        reserve1:{type: GraphQLInt}, //snapshot of pair token1 reserves
        reserveUSD:{type: GraphQLInt}, //snapshot of pair reserves in USD
        liquidityTokenTotalSupply:{type: GraphQLInt}, // snapshot of pool token supply
        liquidityTokenBalance:{type: GraphQLInt} // snapshot of users pool token balance

  })
});
  
module.exports = { liquidityPositionSnapshotType };


