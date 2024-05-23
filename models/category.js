const mongoose = require('mongoose');

// Category Schema of Supermall by Gopal
const CategorySchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    }
});
const Category =mongoose.model('Category', CategorySchema);


module.exports = Category;