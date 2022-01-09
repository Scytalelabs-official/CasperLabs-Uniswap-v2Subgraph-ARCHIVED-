const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList
} = require("graphql");


const userType = new GraphQLObjectType({
  
    name: "User",
    description: "User type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id: {type: GraphQLString},// user address
        liquidityPositions: {type: GraphQLList(GraphQLString)},
        usdSwapped: {type: GraphQLString}
  })
});
  
module.exports = { userType };

