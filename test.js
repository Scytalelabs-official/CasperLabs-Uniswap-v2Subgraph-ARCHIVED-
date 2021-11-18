const currentDate = parseInt(1636464775 / 86400 / 1000) * 86400 - 86400
console.log("currentDate",currentDate);
console.log("Date.now()",Date.now()/1000);

const second=parseInt(parseInt("1636464775865")/1000);
console.log("seconds",second);

let dayID = second / 3600;
let dayStartTimestamp = dayID * 3600;

console.log("dayID",dayID);
console.log("dayStartTimestamp",dayStartTimestamp);