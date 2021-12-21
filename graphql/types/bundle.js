const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} = require("graphql");

const bundleType = new GraphQLObjectType({
  name: "Bundle",
  description: "Bundle type",
  fields: () => ({
    _id: {type: GraphQLID },
    id:{type:GraphQLString},
    ethPrice:{type:GraphQLFloat}, // price of ETH usd
    //bundleuser:{type:GraphQLObjectType}
  })
});

module.exports = { bundleType };

