// function splitdata(data)
// {
//     var temp=data.split('(');
//     var result=temp[1].split(')');
//     return result[0];
// }

// var date = new Date();
// var seconds = date.getTime();
// console.log("time: ",date);
// console.log("time: ",seconds);

// let contractHash="bbe35d58c30e66e128f2AD83E4B2030441FDB5dA0227772ab7F277920F4482Ac".toLowerCase();
// console.log(contractHash);

// var i=1e+26;
// var j=1e+26;
// var z=i*j;
// console.log("z is i+j: ",z);
// var i="100000000000000000000";
// console.log("i: ",i);
// var z=1e+24;
// var j=parseFloat(i);
// console.log("j: ",j);

// var a = BigInt(
//   "782910138827292261791972728324982565756575668687686786786786787686786786"
// );
// var b = BigInt(
//   "782910138827292261791972728324982565756575668687686786786786787686786786"
// );

// console.log(a);
// console.log(b.toString());
// console.log((a * b).toString());
// console.log(((a * b) / b).toString());

// console.log(BigInt(000000000));
// console.log(2 * 1 + (9 + 1) * 3);
// if(BigInt(1)>BigInt(0))
// {
//   console.log(2 * 1 + (9 + 1) * 3);
// }

//  const Graph = require('node-dijkstra');
 
// const route = new Graph();
 
// route.addNode('WCSPR', { WISER:1 });
// route.addNode('WISER', { WCSPR:1 ,USDC:1 });
// route.addNode('USDC', { WISER:1, USDT:1,WETH:1});
// route.addNode('USDT', { USDC:1 });
// route.addNode('ETH', { WETH:1 });
// route.addNode('WETH', { ETH:1 ,USDC:1});

// console.log("graph: ",route);
// console.log("path: ",route.path('WCSPR', 'USDC'));
// console.log("path: ",route.path('WISER', 'USDT'));
// console.log("path: ",route.path('USDT', 'WISER'));
// console.log("path: ",route.path('WCSPR', 'ETH'));
// console.log("path: ",route.path('ETH','WETH'));
// console.log("path: ",route.path('WETH','ETH'));



// const graph = new Map()
 
// const a = new Map()
// a.set('B', 1)
 
// const b = new Map()
// b.set('C', 1)


// graph.set('A', a)
// graph.set('B', b);
 
// const route = new Graph(graph)

// console.log("path: ",route.path('A', 'C'));

// console.log(parseFloat("1000000000")/parseFloat("10000000000"));
// console.log(0.1/parseFloat("10"));

// let pairagainstuserresult = await pairagainstuser.findOne({
//     id: args.to,
//     pair: args.pairAddress,
//   });
//   if (pairagainstuserresult == null) {
//     let newData = new pairagainstuser({
//       id: args.to,
//       pair: args.pairAddress,
//       reserve0: args.amount0,
//       reserve1: args.amount1,
//     });
//     await pairagainstuser.create(newData);
//   } else {
//     pairagainstuserresult.reserve0 = args.amount0;
//     pairagainstuserresult.reserve1 = args.amount1;
//     await pairagainstuserresult.save();
//   }

