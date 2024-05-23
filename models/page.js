const mongoose = require('mongoose');

// Page Schema of Supermall by Gopal
const PageSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    }
});
// view-source:getbootstrap.com/examples/starter-template/
const page =mongoose.model('Page', PageSchema);


module.exports = page;