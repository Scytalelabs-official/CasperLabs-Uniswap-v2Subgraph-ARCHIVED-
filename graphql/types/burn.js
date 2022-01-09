const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLFloat
} = require("graphql");

const  {pairType} = require("./pair");

const burnType = new GraphQLObjectType({

  name: "Burn",
  description: "Burn type",
  fields: () => ({

      _id: {type: GraphQLID },
      id:{type:GraphQLString},//transaction hash + "-" + index in mints Transaction array
      transactionid: {type:GraphQLString},
      transactiontimestamp: {type:GraphQLFloat},
      timestamp:{type:GraphQLFloat}, //need this to pull recent txns for specific token or pair
      pair: {type: pairType},
      liquidity:{type:GraphQLString},
      // populated from the Burn event
      sender:{type:GraphQLString},
      amount0:{type:GraphQLString},
      amount1:{type:GraphQLString},
      // populated from the primary Transfer event
      to:{type:GraphQLString},
      logIndex:{type:GraphQLInt},
      amountUSD:{type:GraphQLString}, // derived amount based on available prices of tokens
      // optional fee fields, if a Transfer event is fired in _mintFee
      needsComplete:{type:GraphQLBoolean},// mark uncomplete in ETH case
      feeTo:{type:GraphQLString},
      feeLiquidity:{type:GraphQLString}

})
});

module.exports = { burnType };
