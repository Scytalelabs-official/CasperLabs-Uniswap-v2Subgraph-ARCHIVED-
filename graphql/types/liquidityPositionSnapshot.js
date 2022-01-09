const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLFloat
} = require("graphql");

const  {pairType} = require("./pair");

const liquidityPositionSnapshotType = new GraphQLObjectType({
  
    name: "LiquidityPositionSnapshot",
    description: "LiquidityPositionSnapshot type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},
        liquidityPosition: {type:GraphQLString},
        timestamp:{type: GraphQLFloat},// saved for fast historical lookups
        block:{type: GraphQLString},// saved for fast historical lookups
        user: {type: GraphQLString}, // reference to user
        pair: {type:pairType}, // reference to pair
        token0PriceUSD:{type: GraphQLString}, //snapshot of token0 price
        token1PriceUSD:{type: GraphQLString}, //snapshot of token1 price
        reserve0:{type: GraphQLString}, //snapshot of pair token0 reserves
        reserve1:{type: GraphQLString}, //snapshot of pair token1 reserves
        reserveUSD:{type: GraphQLString}, //snapshot of pair reserves in USD
        liquidityTokenTotalSupply:{type: GraphQLString}, // snapshot of pool token supply
        liquidityTokenBalance:{type: GraphQLString} // snapshot of users pool token balance

  })
});
  
module.exports = { liquidityPositionSnapshotType };


