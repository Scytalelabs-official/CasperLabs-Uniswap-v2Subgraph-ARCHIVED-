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

const tokenbyId = {
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
const tokenbyname = {
  type: tokenType,
  description: "Retrieves token against name",
  args: {

    name: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let token = await Token.findOne({ name: args.name });

      return token;
    } catch (error) {
      throw new Error(error);
    }
  },
};
const tokensbysymbol = {
  type: GraphQLList(tokenType),
  description: "Retrieves token against Id",
  args: {

    symbol: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let token = await Token.find({ symbol: args.symbol });

      return token;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const tokensbyId = {
  type:  GraphQLList(tokenType),
  description: "Retrieves tokens against Id",
  args: {
    first: { type: GraphQLInt },
    id: { type: GraphQLList (GraphQLString)}
  },
  async resolve(parent, args, context) {
    try {
      let tokens=[];
      for(var i=0;i<args.id.length;i++)
      {
        let token= await Token.findOne({ id: args.id[i] });
        tokens.push(token);
      }

      return tokens.splice(0, args.first);
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

const allpairs = {
  type: GraphQLList(pairType),
  description: "Retrieves list of pairs against allpairs",
  args: {
    first: { type: GraphQLInt },
    id: { type: GraphQLList(GraphQLString) },
  },
  async resolve(parent, args, context) {
    try {

      let pairs=[];
      for(var i=0;i<args.id.length;i++)
      {
        let pair= await Pair.findOne({ id: args.id[i] });
        pairs.push(pair);
      }
      return pairs.splice(0, args.first);

    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairbyId = {
  type: pairType,
  description: "Retrieves pair against id",
  args: {
    id: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let pair = await Pair.findOne({id:args.id});
      return pair;

    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairsbyId = {
  type: GraphQLList(pairType),
  description: "Retrieves pair against id",
  args: {
    first: { type: GraphQLInt },
    id: { type: GraphQLList (GraphQLString)}
  },
  async resolve(parent, args, context) {
    try {
      let pairs=[];
      for(var i=0;i<args.id.length;i++)
      {
        let pair= await Pair.findOne({ id: args.id[i] });
        pairs.push(pair);
      }

      return pairs.splice(0, args.first);

    } catch (error) {
      throw new Error(error);
    }
  },
};


const pairsbytoken0 = {
  type: GraphQLList(pairType),
  description: "Retrieves pair against token0",
  args: {
    first: { type: GraphQLInt },
    token0: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let pairs = await Pair.find({});
      let pairsbytoken0=[];
      for (var i=0; i< pairs.length;i++)
      {
        if( pairs[i].token0.id == args.token0)
        {
          pairsbytoken0.push(pairs[i]);
        }
      }
      return pairsbytoken0.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};
const pairsbytoken1 = {
  type: GraphQLList(pairType),
  description: "Retrieves pair against token1",
  args: {
    first: { type: GraphQLInt },
    token1: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let pairs = await Pair.find({});
      let pairsbytoken1=[];
      for (var i=0; i< pairs.length;i++)
      {
        if( pairs[i].token1.id == args.token1)
        {
          pairsbytoken1.push(pairs[i]);
        }
      }
      return pairsbytoken1.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairsbytoken0array = {
  type: GraphQLList(pairType),
  description: "Retrieves pair against token0",
  args: {
    token0: { type: GraphQLList(GraphQLString) },
  },
  async resolve(parent, args, context) {
    try {
      let pairs = await Pair.find({});
      let pairsbytoken0=[];
      for (var j=0; j< args.token0.length;j++)
      {
        for (var i=0; i< pairs.length;i++)
        {
          if( pairs[i].token0.id == args.token0[j])
          {
            pairsbytoken0.push(pairs[i]);
          }
        }
      }
      
      return pairsbytoken0;
    } catch (error) {
      throw new Error(error);
    }
  },
};
const pairsbytoken1array = {
  type: GraphQLList(pairType),
  description: "Retrieves pair against token1",
  args: {
    token1: { type: GraphQLList(GraphQLString) },
  },
  async resolve(parent, args, context) {
    try {
      let pairs = await Pair.find({});
      let pairsbytoken1=[];
      for (var j=0; j< args.token1.length;j++)
      {
        for (var i=0; i< pairs.length;i++)
        {
          if( pairs[i].token1.id == args.token1[j])
          {
            pairsbytoken1.push(pairs[i]);
          }
        }
      }
      
      return pairsbytoken1;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const liquiditypositions = {
  type: GraphQLList(liquidityPositionType),
  description: "Retrieves list of liquiditypositions against pair Id",
  args: {
    first: { type: GraphQLInt },
    id: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let liquiditypositions = await LiquidityPosition.find({pair:{id:args.id}});
      
      return liquiditypositions.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const liquidityPositionsagainstuserId = {
  type: liquidityPositionType,
  description: "Retrieves liquidityposition against user Id",
  args: {
    user: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let liquiditypositions = await LiquidityPosition.find({ user:{id:args.user}});

      return liquiditypositions;
    } catch (error) {
      throw new Error(error);
    }
  },
};

const liquiditypositionsnapshots = {
  type: GraphQLList(liquidityPositionSnapshotType),
  description: "Retrieves list of liquiditypositionsnapshots",
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    user: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let liquiditypositionsnapshots = await LiquidityPositionSnapshot.find({user:args.user});

      return liquiditypositionsnapshots.splice(0, args.first);
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
  description: "Retrieves list of transactions ",
  args: {
    user: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      //let transactions = await Transaction.find({mints:[{to:args.user}],burns:[{sender:args.user}],swaps:[{to:args.user}]});
      let transactions = await Transaction.find({id:args.user});
      return transactions;
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
    user: { type: GraphQLString },
    pair: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let mints = await MintEvent.find({to:args.user,pair:{id:args.pair}});

      return mints;
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
    user: { type: GraphQLString },
    pair: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      let burns = await BurnEvent.find({sender:args.user,pair:{id:args.pair}});

      return burns;
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
  description: "Retrieves list of pairdaydatas against pairAddress and date",
  args: {
    first: { type: GraphQLInt },
    pairAddress: { type: GraphQLList(GraphQLString) },
    date: {type: GraphQLInt}
  },
  async resolve(parent, args, context) {
    try {
      let pairdaydatas = await PairDayData.find();
      let pairdaydatasresult=[];
      for (var j=0; j<args.pairAddress.length;j++)
      {
        for (var i=0;i<pairdaydatas.length;i++)
        {
          if(pairdaydatas[i].pairAddress == args.pairAddress[j] && pairdaydatas[i].date == args.date)
          {
            pairdaydatasresult.push(pairdaydatas[i]);
          }
        }
      }
     
      return pairdaydatasresult.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairdaydata = {
  type: GraphQLList(pairDayDataType),
  description: "Retrieves pairdaydata against pairAddress and date",
  args: {
    first: { type: GraphQLInt },
    pairAddress: { type: GraphQLString},
    date: {type: GraphQLInt}
  },
  async resolve(parent, args, context) {
    try {
      let pairdaydata = await PairDayData.find({ pairAddress: args.pairAddress, date:args.date });

      return pairdaydata.splice(0, args.first);
    } catch (error) {
      throw new Error(error);
    }
  },
};

const pairdaydatasbypairAddress = {
  type: GraphQLList(pairDayDataType),
  description: "Retrieves pairdaydata against pairAddress",
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    pairAddress: { type: GraphQLString},
  },
  async resolve(parent, args, context) {
    try {
      let pairdaydata = await PairDayData.find({ pairAddress: args.pairAddress});

      return pairdaydata.splice(0, args.first);
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
  description: "Retrieves list of tokendaydatas against token passed",
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    token: {type: GraphQLString}
  },
  async resolve(parent, args, context) {
    try {
      let tokendaydatas = await TokenDayData.find({token:args.token});

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
    date: {type: GraphQLString}
  },
  async resolve(parent, args, context) {
    try {
      
      let date=parseFloat(args.date);
      let tokendaydatas = await TokenDayData.find({date:date});

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
const uniswapdaydatasbydate = {
  type: GraphQLList(uniswapDayDataType),
  description: "Retrieves list of uniswapdaydatas against date",
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    date: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      let uniswapdaydatas = await UniswapDayData.find({date:args.date});

      return uniswapdaydatas.splice(0, args.first);
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
  pairbyId,
  pairsbyId,
  allpairs,
  pairs,
  pairsbytoken0,
  pairsbytoken1,
  pairsbytoken0array,
  pairsbytoken1array,
  tokens,
  tokenbyId,
  tokenbyname,
  tokensbysymbol,
  tokensbyId,
  bundles,
  bundle,
  transactions,
  transaction,
  liquiditypositions,
  liquidityPositionsagainstuserId,
  liquiditypositionsnapshots,
  liquiditypositionsnapshot,
  mints,
  mint,
  burns,
  burn,
  swaps,
  swap,
  uniswapdaydatasbydate,
  uniswapdaydatas,
  uniswapdaydata,
  pairdaydatas,
  pairdaydata,
  pairdaydatasbypairAddress,
  pairhourdatas,
  pairhourdata,
  tokendaydatas,
  tokendaydata,
  tokendaydatasbydate
};
