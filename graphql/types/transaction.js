const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt
} = require("graphql");

var mint=require('./mint');
var burn=require('./burn');
var swap=require('./swap');

const transactionType = new GraphQLObjectType({
  
    name: "Transaction",
    description: "Transaction type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},// txn hash
        blockNumber: {type: GraphQLInt},
        timestamp: {type: GraphQLInt},
        // This is not the reverse of Mint.transaction; it is only used to
        // track incomplete mints (similar for burns and swaps)
        mints: [mint],
        burns: [burn],
        swaps: [swap]

  })
});
  
module.exports = { transactionType };




