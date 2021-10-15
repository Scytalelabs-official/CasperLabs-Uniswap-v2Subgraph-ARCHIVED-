const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

const liquidityPositionType = new GraphQLObjectType({
  
    name: "LiquidityPosition",
    description: "LiquidityPosition type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},
        user: {type: GraphQLString},
        pair: {type: GraphQLString},
        liquidityTokenBalance:{type: GraphQLInt}

  })
});
  
module.exports = { liquidityPositionType };

