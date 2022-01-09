const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString
} = require("graphql");

const bundleType = new GraphQLObjectType({
  name: "Bundle",
  description: "Bundle type",
  fields: () => ({
    _id: {type: GraphQLID },
    id:{type:GraphQLString},
    ethPrice:{type:GraphQLString}, // price of ETH usd
  
  })
});

module.exports = { bundleType };

