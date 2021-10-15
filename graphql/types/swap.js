const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean
} = require("graphql");
  
const swapType = new GraphQLObjectType({
  
    name: "Swap",
    description: "Swap type",
    fields: () => ({
  
        _id: {type: GraphQLID },
        id:{type:GraphQLString},//transaction hash + "-" + index in swap Transaction array
        transaction: {type: GraphQLString},
        timestamp:{type:GraphQLInt}, //need this to pull recent txns for specific token or pair
        pair: {type: GraphQLString},
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
  
