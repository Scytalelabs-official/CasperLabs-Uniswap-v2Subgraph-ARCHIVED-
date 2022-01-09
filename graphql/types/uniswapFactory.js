const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList
} = require("graphql");

const uniswapFactoryType = new GraphQLObjectType({
  name: "UniswapFactory",
  description: "UniswapFactory type",
  fields: () => ({
    _id: {type: GraphQLID },
    id: { type: GraphQLString },//factory address
    pairCount: {type: GraphQLString},// pair info
    totalVolumeUSD: {type: GraphQLString},// total volume
    totalVolumeETH: {type: GraphQLString},
    untrackedVolumeUSD: {type: GraphQLString},//untracked values - less confident USD scores
    totalLiquidityUSD: {type: GraphQLString},//total liquidity
    totalLiquidityETH: {type: GraphQLString},
    txCount: {type: GraphQLString},//transactions
    mostLiquidTokens: {type: GraphQLList(GraphQLString)}

  })
});

module.exports = { uniswapFactoryType };