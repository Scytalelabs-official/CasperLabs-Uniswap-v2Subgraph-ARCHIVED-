// Import required stuff from graphql
const { GraphQLSchema, GraphQLObjectType } = require("graphql");

// Import queries
const {
  users,
  user,
  uniswapfactorys,
  uniswapfactory,
  pairs,
  pair,
  tokens,
  token,
  bundles,
  bundle,
  transactions,
  transaction,
  liquiditypositions,
  liquidityposition,
  liquiditypositionsnapshots,
  liquiditypositionsnapshot,
  mints,
  mint,
  burns,
  burn,
  swaps,
  swap,
  uniswapdaydatas,
  uniswapdaydata,
  pairdaydatas,
  pairdaydata,
  pairhourdatas,
  pairhourdata,
  tokendaydatas,
  tokendaydata,
} = require("./queries");

// Import mutations
const {
  handleNewPair,
  handleTransfer,
  handleSync,
  handleMint,
  handleBurn,
  handleSwap,
} = require("./mutations");

// Define QueryType
const QueryType = new GraphQLObjectType({
  name: "QueryType",
  description: "Queries",
  fields: {
    users,
    user,
    uniswapfactorys,
    uniswapfactory,
    pairs,
    pair,
    tokens,
    token,
    bundles,
    bundle,
    transactions,
    transaction,
    liquiditypositions,
    liquidityposition,
    liquiditypositionsnapshots,
    liquiditypositionsnapshot,
    mints,
    mint,
    burns,
    burn,
    swaps,
    swap,
    uniswapdaydatas,
    uniswapdaydata,
    pairdaydatas,
    pairdaydata,
    pairhourdatas,
    pairhourdata,
    tokendaydatas,
    tokendaydata,
  },
});

// Define MutationType
const MutationType = new GraphQLObjectType({
  name: "MutationType",
  description: "Mutations",
  fields: {
    handleNewPair,
    handleTransfer,
    handleSync,
    handleMint,
    handleBurn,
    handleSwap,
  },
});

module.exports = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
