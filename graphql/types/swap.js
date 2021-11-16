const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLFloat
} = require("graphql");

const  {pairType} = require("./pair");

const swapType = new GraphQLObjectType({
  
    name: "Swap",
    description: "Swap type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id:{type:GraphQLString},//transaction hash + "-" + index in swap Transaction array
        transactionid: {type:GraphQLString},
        transactiontimestamp: {type:GraphQLFloat},
        timestamp:{type:GraphQLFloat}, //need this to pull recent txns for specific token or pair
        pair: {type: pairType},
        // populated from the Swap event
        sender:{type:GraphQLString},
        from:{type:GraphQLString},//the EOA that initiated the txn
        amount0In:{type:GraphQLInt},
        amount1In:{type:GraphQLInt},
        amount0Out:{type:GraphQLInt},
        amount1Out:{type:GraphQLInt},
        // populated from the primary Transfer event
        to:{type:GraphQLString},
        logIndex:{type:GraphQLInt},
        amountUSD:{type:GraphQLInt}, // derived amount based on available prices of tokens

  })
});
  
module.exports = { swapType };
  
