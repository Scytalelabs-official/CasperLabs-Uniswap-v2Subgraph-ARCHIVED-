const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
  } = require("graphql");
  
  const responseType = new GraphQLObjectType({
    name: "Response",
    description: "Response type",
    fields: () => ({
      _id: {type: GraphQLID },
      id: {type: GraphQLString },
      result:{type:GraphQLBoolean},
  
    })
  });
  
  module.exports = { responseType };
  
  