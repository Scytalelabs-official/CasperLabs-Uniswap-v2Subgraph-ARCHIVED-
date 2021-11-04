const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList
} = require("graphql");

const transactionType = new GraphQLObjectType({
  
    name: "Transaction",
    description: "Transaction type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},// txn hash
        blockNumber: {type: GraphQLString},
        timestamp: {type: GraphQLInt},
        // This is not the reverse of Mint.transaction; it is only used to
        // track incomplete mints (similar for burns and swaps)
        mints: {type: GraphQLList(GraphQLString)},
        burns: {type: GraphQLList(GraphQLString)},
        swaps: {type: GraphQLList(GraphQLString)}

  })
});
  
module.exports = { transactionType };




