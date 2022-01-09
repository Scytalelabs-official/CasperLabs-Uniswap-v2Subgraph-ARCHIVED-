const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

const { userType } = require("./user");
const { pairType } = require("./pair");
const liquidityPositionType = new GraphQLObjectType({
  
    name: "LiquidityPosition",
    description: "LiquidityPosition type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},
        user: {type: userType},
        pair: {type: pairType},
        liquidityTokenBalance:{type: GraphQLString}

  })
});
  
module.exports = { liquidityPositionType };

