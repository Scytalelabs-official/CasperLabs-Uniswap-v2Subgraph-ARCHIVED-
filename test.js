function splitdata(data)
{
    var temp=data.split('(');
    var result=temp[1].split(')');
    return result[0];
}