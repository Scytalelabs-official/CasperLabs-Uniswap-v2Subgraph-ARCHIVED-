var mongoose = require('mongoose');
require('mongoose-bigdecimal');
var Schema = mongoose.Schema;
var BigDecimal = require('big.js');

//define your schema
var ProductSchema = new Schema({
    price: {
        type: Schema.Types.BigDecimal,
        required: true,
        index:true
    },
    discounts:[{
        type: Schema.Types.BigDecimal
    }]
});
Product = mongoose.model('Product', ProductSchema);

//use it
var book = new Product();
book.price = new BigDecimal(12);
book.save(done);