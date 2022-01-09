const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLFloat
} = require("graphql");

const  {mintType} = require("./mint");
const  {burnType} = require("./burn");
const  {swapType} = require("./swap");

const transactionType = new GraphQLObjectType({
  
    name: "Transaction",
    description: "Transaction type",
    fields: () => ({

        _id: {type: GraphQLID },
        id: {type: GraphQLString},// txn hash
        blockNumber: {type: GraphQLString},
        timestamp: {type: GraphQLFloat},
        // This is not the reverse of Mint.transaction; it is only used to
        // track incomplete mints (similar for burns and swaps)
        mints: {type: GraphQLList(mintType)},
        burns: {type: GraphQLList(burnType)},
        swaps: {type: GraphQLList(swapType)},

  })
});
  
module.exports = { transactionType };




