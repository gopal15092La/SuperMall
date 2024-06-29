const express = require('express');
const router = express.Router();

//Get Product model
const product = require("../models/product");

//Get category model
const category = require("../models/category");

//Get All producst
router.get('/', async (req, res) => {
    try{
        var p = await product.find();
        if(!p){
            res.status(404).send("Server error");
        }
        res.render('all_products',{
            heading:"All Products",
            products : p,
        });
    }catch(err){
        return console.log("err :", err);
    }
    
});


//Get All products By Category
router.get('/:category', async (req, res) => {
    var categorySlug = req.params.category;
    try{
        var cat = await category.findOne({slug : categorySlug});
        var p = await product.find({category : categorySlug});
        if(!p){
            res.status(404).send("Server error");
        }
        res.render('cat_products',{
            heading: cat.title,
            products : p,
        });
    }catch(err){
        return console.log("err :", err);
    }
    
});


module.exports = router;
