const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

var user=require('./user');
var pair=require('./pair');

const liquidityPositionType = new GraphQLObjectType({
  
    name: "LiquidityPosition",
    description: "LiquidityPosition type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},
        user: user,
        pair: pair,
        liquidityTokenBalance:{type: GraphQLInt}

  })
});
  
module.exports = { liquidityPositionType };

