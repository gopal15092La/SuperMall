const express = require('express');
const router = express.Router();

//Get Product model
const product = require("../models/product");


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

//Get a Page
router.get('/:slug', async (req, res) => {
    var slug = req.params.slug;
    try{
        var p = await page.findOne({slug: slug});
        if(!p){
            console.log("null page");
            res.redirect("/");
        }else{
            res.render('index',{
                heading:"supermall",
                title:  p.title,
                content: p.content,
            });
        }
    }catch(err){
        return console.log("err :", err);
    }
    
});


module.exports = router;
