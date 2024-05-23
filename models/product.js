const mongoose = require('mongoose');

// Product Schema of Supermall by Gopal
const ProductSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});
// view-source:getbootstrap.com/examples/starter-template/
const Product =mongoose.model('Product', ProductSchema);


module.exports = Product;