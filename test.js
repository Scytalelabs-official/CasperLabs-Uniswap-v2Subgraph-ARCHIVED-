function splitdata(data)
{
    var temp=data.split('(');
    var result=temp[1].split(')');
    return result[0];
}

var date = new Date("2021-12-14T18:42:24.445Z");
var seconds = date.getTime();
console.log("time: ",seconds);
