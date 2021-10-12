const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

var liquidityPosition=require('./liquidityPosition');

const userType = new GraphQLObjectType({
  
    name: "User",
    description: "User type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id: {type: GraphQLString},// user address
        liquidityPositions: [liquidityPosition], // @derivedFrom(field: "user")
        usdSwapped: {type: GraphQLInt}
  })
});
  
module.exports = { userType };

