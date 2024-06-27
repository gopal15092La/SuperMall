const express = require('express');
const router = express.Router();

//Get Page model
const page = require("../models/page");


//Get Home Page
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
