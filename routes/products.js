const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

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


//Get  products details By Category
router.get('/:category/:product', async (req, res) => {
    var galleryImages = null;

    var loggedIn = (req.isAuthenticated()) ? true : false;
    
    try{
        var p = await product.findOne({slug : req.params.product});
        var galleryDir = 'public/product_images/' + p._id + '/gallery';

        fs.readdir(galleryDir, (err , files) => {
            if(err){
                console.log("error at fs-readir :" , err);
            }else{
                galleryImages = files;

                res.render('product', {
                    heading:"",
                    title : p.title,
                    product : p,
                    galleryImages: galleryImages,
                    loggedIn: loggedIn
                })
            }
        });
    } catch( err ){
        console.log("error at category/product route .", err );
    }
    
});





module.exports = router;
