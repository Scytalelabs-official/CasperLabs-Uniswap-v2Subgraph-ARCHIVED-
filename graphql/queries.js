const {
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} = require("graphql");

// import types
const { userType } = require("./types/user");
const { uniswapFactoryType } = require("./types/uniswapFactory");
const { pairType } = require("./types/pair");
const { tokenType } = require("./types/token");
const { bundleType } = require("./types/bundle");
const { pairDayDataType } = require("./types/pairDayData");
const { pairHourDataType } = require("./types/pairHourData");
const { uniswapDayDataType } = require("./types/uniswapDayData");
const { tokenDayDataType } = require("./types/tokenDayData");
const { mintType } = require("./types/mint");
const { burnType } = require("./types/burn");
const { swapType } = require("./types/swap");
const { transactionType } = require("./types/transaction");
const { liquidityPositionType } = require("./types/liquidityPosition");
const {
  liquidityPositionSnapshotType,
} = require("./types/liquidityPositionSnapshot");

// import Models
const User = require("../models/user");
const UniswapFactory = require("../models/uniswapFactory");
const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
const PairDayData = require("../models/pairDayData");
const PairHourData = require("../models/pairHourData");
const UniswapDayData = require("../models/uniswapDayData");
const TokenDayData = require("../models/tokenDayData");
const MintEvent = require("../models/mint");
const BurnEvent = require("../models/burn");
const SwapEvent = require("../models/swap");
const Transaction = require("../models/transaction");
const LiquidityPosition = require("../models/liquidityPosition");
const LiquidityPositionSnapshot = require("../models/liquidityPositionSnapshot");

const users = {
  type: GraphQLList(userType),
  description: "Retrieves list of users",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let users = await User.find();

      return users.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const user = {
  type: userType,
  description: "Retrieves user against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let user = await User.findOne({ id: args.id });

      return user;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const uniswapfactorys = {
  type: GraphQLList(uniswapFactoryType),
  description: "Retrieves list of uniswap Factory ",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let uniswapfactorys = await UniswapFactory.find();

      return uniswapfactorys.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const uniswapfactory = {
  type: uniswapFactoryType,
  description: "Retrieves uniswapfactory against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let uniswapfactory = await UniswapFactory.findOne({ id: args.id });

      return uniswapfactory;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const tokens = {
  type: GraphQLList(tokenType),
  description: "Retrieves list of tokens",
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let tokens = await Token.find();

      return tokens.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const token = {
  type: tokenType,
  description: "Retrieves token against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let token = await Token.findOne({ id: args.id });

      return token;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairs = {
  type: GraphQLList(pairType),
  description: "Retrieves list of pairs",
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let pairs = await Pair.find();
      return pairs.splice(0, args.first);

    } catch (error) {
      throw new Error(error);
    }
  },
};

const pair = {
  type: pairType,
  description: "Retrieves pair against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let pair = await Pair.findOne({ id: args.id });

      return pair;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const liquiditypositions = {
  type: GraphQLList(liquidityPositionType),
  description: "Retrieves list of liquiditypositions",
  args: {
    first: { type: GraphQLInt },
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let liquiditypositions = await LiquidityPosition.find({id:args.id});

      return liquiditypositions.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const liquidityposition = {
  type: liquidityPositionType,
  description: "Retrieves liquidityposition against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let liquidityposition = await LiquidityPosition.findOne({ id: args.id });

      return liquidityposition;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const liquiditypositionsnapshots = {
  type: GraphQLList(liquidityPositionSnapshotType),
  description: "Retrieves list of liquiditypositionsnapshots",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let liquiditypositionsnapshots = await LiquidityPositionSnapshot.find();

      return liquiditypositionsnapshots.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const liquiditypositionsnapshot = {
  type: liquidityPositionSnapshotType,
  description: "Retrieves liquiditypositionsnapshot against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let liquiditypositionsnapshot = await LiquidityPositionSnapshot.findOne({
        id: args.id,
      });

      return liquiditypositionsnapshot;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const bundles = {
  type: GraphQLList(bundleType),
  description: "Retrieves list of bundles",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let bundles = await Bundle.find();

      return bundles.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const bundle = {
  type: bundleType,
  description: "Retrieves bundle against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let bundle = await Bundle.findOne({ id: args.id });

      return bundle;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const transactions = {
  type: GraphQLList(transactionType),
  description: "Retrieves list of transactions",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let transactions = await Transaction.find();

      return transactions.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const transaction = {
  type: transactionType,
  description: "Retrieves transaction against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let transaction = await Transaction.findOne({ id: args.id });

      return transaction;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const mints = {
  type: GraphQLList(mintType),
  description: "Retrieves list of mints",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let mints = await MintEvent.find();

      return mints.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const mint = {
  type: mintType,
  description: "Retrieves mint against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let mint = await MintEvent.findOne({ id: args.id });

      return mint;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const burns = {
  type: GraphQLList(burnType),
  description: "Retrieves list of burns",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let burns = await BurnEvent.find();

      return burns.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const burn = {
  type: burnType,
  description: "Retrieves burn against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let burn = await BurnEvent.findOne({ id: args.id });

      return burn;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const swaps = {
  type: GraphQLList(swapType),
  description: "Retrieves list of swaps",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let swaps = await SwapEvent.find();

      return swaps.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const swap = {
  type: swapType,
  description: "Retrieves swap against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let swap = await SwapEvent.findOne({ id: args.id });

      return swap;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairdaydatas = {
  type: GraphQLList(pairDayDataType),
  description: "Retrieves list of pairdaydatas",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let pairdaydatas = await PairDayData.find();

      return pairdaydatas.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairdaydata = {
  type: pairDayDataType,
  description: "Retrieves pairdaydata against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let pairdaydata = await PairDayData.findOne({ id: args.id });

      return pairdaydata;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairhourdatas = {
  type: GraphQLList(pairHourDataType),
  description: "Retrieves list of pairHourDatas",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let pairHourDatas = await PairHourData.find();

      return pairHourDatas.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairhourdata = {
  type: pairHourDataType,
  description: "Retrieves pairHourData against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let pairHourData = await PairHourData.findOne({ id: args.id });

      return pairHourData;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const tokendaydatas = {
  type: GraphQLList(tokenDayDataType),
  description: "Retrieves list of tokendaydatas",
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    id: {type: GraphQLString}
  },
  async resolve(parent, args, context) {
    try {
      let tokendaydatas = await TokenDayData.find({token:args.id});

      return tokendaydatas.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const tokendaydatasbydate = {
  type: GraphQLList(tokenDayDataType),
  description: "Retrieves list of tokendaydatas against date",
  args: {
    first: { type: GraphQLInt },
    date: {type: GraphQLInt}
  },
  async resolve(parent, args, context) {
    try {
      let tokendaydatas = await TokenDayData.find({date:args.date});

      return tokendaydatas.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const tokendaydata = {
  type: tokenDayDataType,
  description: "Retrieves tokendaydata against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let tokendaydata = await TokenDayData.findOne({ id: args.id });

      return tokendaydata;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const uniswapdaydatas = {
  type: GraphQLList(uniswapDayDataType),
  description: "Retrieves list of uniswapdaydatas",
  args: {
    start: { type: GraphQLInt },
    end: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let uniswapdaydatas = await UniswapDayData.find();

      return uniswapdaydatas.splice(args.start, args.end);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const uniswapdaydata = {
  type: uniswapDayDataType,
  description: "Retrieves uniswapdaydata against Id",
  args: {
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let uniswapdaydata = await UniswapDayData.findOne({ id: args.id });

      return uniswapdaydata;
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = {
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
  tokendaydatasbydate
};
