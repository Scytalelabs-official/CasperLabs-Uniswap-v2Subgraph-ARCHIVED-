// var mongoose = require('mongoose');
// require('mongoose-bigdecimal');
// var Schema = mongoose.Schema;
// var BigDecimal = require('big.js');

// //define your schema
// var ProductSchema = new Schema({
//     price: {
//         type: Schema.Types.BigDecimal,
//         required: true,
//         index:true
//     },
//     discounts:[{
//         type: Schema.Types.BigDecimal
//     }]
// });
// Product = mongoose.model('Product', ProductSchema);

// //use it
// var book = new Product();
// book.price = new BigDecimal(12);
// book.save(done);
// var data=[
//     [
//       { data: 'contract_package_hash' },
//       {
//         data: '0024dc4c2ea77a01a0da90893c3283cfa602d78acf198aaa67e61e9bc9b44c93'
//       }
//     ],
//     [ { data: 'event_type' }, { data: 'transfer' } ],
//     [
//       { data: 'from' },
//       {
//         data: 'Key::Account(0000000000000000000000000000000000000000000000000000000000000000)'
//       }
//     ],
//     [
//       { data: 'to' },
//       {
//         data: 'Key::Account(e56a24ed039010d56c2f47aad13fb740b94f3253889500129421054ebb38d917)'
//       }
//     ],
//     [ { data: 'value' }, { data: '50' } ]
// ];

// console.log("data: ",data[0][1].data);

//const { request } = require('graphql-request');

// request('http://localhost:3000/graphql',
//  `mutation handleTransfer( $pairAddress: String!, $from: String!, $to: String!, $value: Int!, $deployHash: String!, $timeStamp: Int!, $blockHash: String!){
//   handleTransfer( pairAddress: $pairAddress, from: $from, to: $to, value: $value, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
//     id
//   }

//  }`,
//   {pairAddress:'11f6e1b2d9566ab6d796f026b1d4bd36b71664c4ee8805fbc9cdca406607cd59', from: '0000000000000000000000000000000000000000000000000000000000000000', to: '0000000000000000000000000000000000000000000000000000000000000111', value: 5, pairAddress:'11f6e1b2d9566ab6d796f026b1d4bd36b71664c4ee8805fbc9cdca406607cd59', deployHash:'0000000000000000000000000000000000000000000000000000000000000000', timeStamp:1000, blockHash:'0000000000000000000000000000000000000000000000000000000000000000'})
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// request('http://localhost:3000/graphql',
//  `mutation handleNewPair( $token0: String!, $token1: String!, $pair: String!, $all_pairs_length: Int!, $timeStamp: Int!, $blockHash: String!){
//   handleNewPair( token0: $token0, token1: $token1, pair: $pair, all_pairs_length: $all_pairs_length, timeStamp: $timeStamp, blockHash: $blockHash) {
//     id
//   }

//  }`,
//   {token0:'51254d70d183f4b1e59ee5d5b0c76d3c3a81d0366278beecc05b546d49a9835c', token1: '96b0431770a34f5b651a43c830f3c8537e7c44f2cb8191d7efbcca2379785cda', pair: '11f6e1b2d9566ab6d796f026b1d4bd36b71664c4ee8805fbc9cdca406607cd59', all_pairs_length: 5, timeStamp:1000, blockHash:'0000000000000000000000000000000000000000000000000000000000000000'})
//   .then(data => console.log(data))
//   .catch(error => console.error(error));


// var data="Key::hash(45d8a07febaf15b0b0c5ace02533c9d278fd2b6e31b84e7a7abd0c7478e57ea2)";
// var from=data.split('(');
// var from1=from[1].split(')');
// console.log("from: ", from1[0]);
// var data1="1";

// console.log("from: ", parseInt(data1));

var int=1635977242919;
console.log("int: ",int.toString());