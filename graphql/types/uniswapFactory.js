const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = require("graphql");

const uniswapFactoryType = new GraphQLObjectType({
  name: "UniswapFactory",
  description: "UniswapFactory type",
  fields: () => ({
    _id: {type: GraphQLID },
    id: { type: GraphQLString },//factory address
    pairCount: {type: GraphQLInt},// pair info
    totalVolumeUSD: {type: GraphQLInt},// total volume
    totalVolumeETH: {type: GraphQLInt},
    untrackedVolumeUSD: {type: GraphQLInt},//untracked values - less confident USD scores
    totalLiquidityUSD: {type: GraphQLInt},//total liquidity
    totalLiquidityETH: {type: GraphQLInt},
    txCount: {type: GraphQLInt},//transactions
    mostLiquidTokens: {type: GraphQLList(GraphQLString)}

  })
});

module.exports = { uniswapFactoryType };