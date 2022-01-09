
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} = require("graphql");

const  {pairType} = require("./pair");

const mintType = new GraphQLObjectType({

  name: "Mint",
  description: "Mint type",
  fields: () => ({

      _id: {type: GraphQLID },
      id:{type:GraphQLString},//transaction hash + "-" + index in mints Transaction array
      transactionid: {type:GraphQLString},
      transactiontimestamp: {type:GraphQLFloat},
      timestamp:{type:GraphQLFloat}, //need this to pull recent txns for specific token or pair
      pair: {type: pairType},
      // populated from the primary Transfer event
      to:{type:GraphQLString},
      liquidity:{type:GraphQLString},
      // populated from the Mint event
      sender:{type:GraphQLString},
      amount0:{type:GraphQLString},
      amount1:{type:GraphQLString},
      logIndex:{type:GraphQLInt},
      amountUSD:{type:GraphQLString}, // derived amount based on available prices of tokens
      // optional fee fields, if a Transfer event is fired in _mintFee
      feeTo:{type:GraphQLString},
      feeLiquidity:{type:GraphQLString}

})
});

module.exports = { mintType };


