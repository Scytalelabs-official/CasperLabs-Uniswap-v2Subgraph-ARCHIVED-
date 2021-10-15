const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList
} = require("graphql");

const userType = new GraphQLObjectType({
  
    name: "User",
    description: "User type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id: {type: GraphQLString},// user address
        liquidityPositions: {type: GraphQLList(GraphQLString)},
        usdSwapped: {type: GraphQLInt}
  })
});
  
module.exports = { userType };

