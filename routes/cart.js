const express = require('express');
const router = express.Router();

//Get product model
const product = require("../models/product");


//Get cart
router.get('/', async (req, res) => {
    var slug = "home";
    try{
        var p = await page.findOne({slug: slug});
        res.render('index',{
            heading:"supermall",
            title:  p.title,
            content: p.content,
        });
    }catch(err){
        return console.log("err :", err);
    }
    
});




module.exports = router;
