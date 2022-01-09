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

var a = BigInt(
  "782910138827292261791972728324982565756575668687686786786786787686786786"
);
var b = BigInt(
  "782910138827292261791972728324982565756575668687686786786786787686786786"
);

console.log(a);
console.log(b.toString());
console.log((a * b).toString());
console.log(((a * b) / b).toString());

console.log(BigInt(000000000));
console.log(2 * 1 + (9 + 1) * 3);
if(BigInt(1)>BigInt(0))
{
  console.log(2 * 1 + (9 + 1) * 3);
}