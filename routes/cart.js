const express = require('express');
const router = express.Router();
const session = require("express-session");

//Get product model
const product = require("../models/product");


//Get cart
router.get('/add/:product', async function (req, res) {
    var slug = req.params.product;
    try{
        var p = await product.findOne({slug: slug})

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var ct = req.session.cart;
            var newItem = true;

            for (var i = 0; i < ct.length; i++) {
                if (ct[i].title == slug) {
                    ct[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                ct.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

            console.log(req.session.cart);
            req.flash('success', 'Product added!');
            res.redirect('back');

    }catch(err){
        console.log("error at add-to-cart get request :\n", err);
    }

});

router.get('/add/:product', async function (req, res) {
    var slug = req.params.product;
    try {
        var p = await product.findOne({slug: slug});

        if (!p) {
            // Handle case where product with the given slug doesn't exist
            throw new Error('Product not found');
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Check if the product is already in the cart
        var foundIndex = req.session.cart.findIndex(item => item.title === slug);

        if (foundIndex !== -1) {
            // If found, increase the quantity
            req.session.cart[foundIndex].qty++;
        } else {
            // If not found, add it to the cart
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        }

        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');

    } catch(err) {
        console.log("Error adding product to cart:\n", err);
        req.flash('error', 'Failed to add product to cart');
        res.redirect('back');
    }
});





module.exports = router;
