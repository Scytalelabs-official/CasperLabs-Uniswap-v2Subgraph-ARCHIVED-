const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
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
        amount0In:{type:GraphQLString},
        amount1In:{type:GraphQLString},
        amount0Out:{type:GraphQLString},
        amount1Out:{type:GraphQLString},
        // populated from the primary Transfer event
        to:{type:GraphQLString},
        logIndex:{type:GraphQLInt},
        amountUSD:{type:GraphQLString}, // derived amount based on available prices of tokens

  })
});
  
module.exports = { swapType };
  
