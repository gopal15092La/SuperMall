const express = require("express");
const router = express.Router();
const  { mkdirp } = require('mkdirp');
const path = require('path');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const fileUpload = require('express-fileupload');
// app.use(fileUpload());
// Get Product model
const Product = require("../models/product");
// Get Category model
const Category = require("../models/category");

//GET Product index
router.get("/", async(req, res) => {
    try {
        let products = await Product.find();
        let count = products.length;
        res.render('admin/products',{
                    products : products,
                    count: count
                });
    } catch (error) {
        console.log(error);
    }
});

//GET add product
router.get("/add-product", async(req, res) => {
    var title = "";
    var desc = "";
    var price = "";
    var categories = await Category.find();
    if(!categories) {
        return console.log("error : ", categories);
    }
    res.render('admin/add_product', {
        title : title,
        desc : desc,
        categories : categories,
        price: price,
    });
    
});

//POST add product
router.post("/add-product", async (req, res) => {
    // console.log(req.body);
    var imageFile = (req.files && req.files.image) ? req.files.image.name : "";
    // console.log("imageFile : ", imageFile);

    req.checkBody("title", "title must have a value.").notEmpty();
    req.checkBody("price", "Price must have a value.").isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    // res.send("hi gopal");
    var errors = req.validationErrors();

    var title = req.body["title"];
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var desc = req.body["desc"];
        desc = stripHtmlTags(desc);
    var price = req.body["price"];
    var category = req.body["Category"];

    
    // console.log("desc : ", desc);
    if (errors) {
        console.log("error is : " + errors);
        var categories = await Category.find();
        res.render('admin/add_product', {
            title : title,
            desc : desc,
            categories : categories,
            price: price, 
            errors: errors,
        });
    } else {
        try {
            var existingProduct = await Product.findOne({ slug: slug });
            if (existingProduct) {
                console.log("Product with this title already exists: Choose another title");
        
                var categories = await Category.find();
                return res.render('admin/add_product', {
                    errors: [{ msg: "Product title already exists. Choose another title." }],
                    title: title,
                    desc: desc,
                    categories: categories,
                    price: price,
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);
                var newProduct = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    category: category,
                    price: price2,
                    image: imageFile,
                });
        
                try {
                    await newProduct.save();
                    // console.log("Product successfully saved!");
        
                    await mkdirp('public/product_images/' + newProduct._id);
                    await mkdirp('public/product_images/' + newProduct._id + '/gallery');
                    await mkdirp('public/product_images/' + newProduct._id + '/gallery/thumbs');
                    console.log("newProduct._id:", newProduct._id);
                    console.log("imageFile:", imageFile);
                    if(imageFile != ""){
                        var productImage = req.files.image;
                        var uploadPath = 'public/product_images/' + newProduct._id + '/' + imageFile;
                        console.log("path : ", path);
                        try {
                            await fs.ensureDir(path.dirname(uploadPath));
                            await productImage.mv(uploadPath);
                            console.log("Image file moved successfully");
                        }
                        catch(err){
                            return console.error("mv Error:", err);
                        }
                    }
                    return res.redirect("/admin/products");
                } catch (err) {
                    return res.redirect("/admin/products/add-product");
                }
            }
        } catch (err) {
            console.error("Error:", err);
            return res.redirect("/admin/products/add");
        }
        
    }
});
function stripHtmlTags(str) {
    return str.replace(/<[^>]*>?/gm, '');
}

//GET edit product
router.get('/edit-product/:id', async (req, res) => {

    var errors ; 
    
    if(req.session.errors)  errors = req.session.errors;
    req.session.errors = null;
    var rcvd_id = req.params.id;
    var categories = await Category.find();
    if(!categories) {
        return console.log("error : ", categories);
    }
    try {
        var p = await Product.findOne({_id : rcvd_id});
        // console.log("p : ", p);
        if(!p) {
            console.log("error_p : ", p);
            res.redirect('/admin/products');
        }else{
            var galleryDir = 'public/product_images/' + p._id + '/gallery';
            var galleryImages = null;
            
            fs.readdir(galleryDir, (err, files) => {
                if(err) {
                    console.log(err);
                }else{
                    galleryImages = files;
                    console.log("admin : title  : : ", p.title);
                    res.render('admin/edit_product', {
                        title: p.title,
                        errors: errors,
                        desc: p.desc,
                        categories: categories,
                        category: p.category.replace(/\s+/g,'-').toLowerCase(),
                        price: p.price,
                        image: p.image,
                        galleryImages: galleryImages ,
                        id:rcvd_id,
                    });
                }
            });
        }

    } catch (error) {
        console.error("Error fetching page:", error);
        res.status(500).send("Server error");
    }
});

//POST edit product
router.post("/edit-product/:id", async (req, res) => {
    // console.log(req.body);
    var imageFile = (req.files && req.files.image) ? req.files.image.name : "";
    // console.log("imageFile : ", imageFile);

    req.checkBody("title", "title must have a value.").notEmpty();
    req.checkBody("price", "Price must have a value.").isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body["title"];
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var desc = req.body["desc"];
        desc = stripHtmlTags(desc);
    var price = req.body["price"];
    var pimage = req.body["pimage"];
    var id = req.params.id;

    var errors = req.validationErrors();
    if(errors){
        req.session.errors = errors;
        req.redirect('/admin/products/edit-product/' + id)
    } else{
        try{
            var dupProduct = await Product.findOne({slug: slug, _id:{'$ne':id}});
            
            if(dupProduct){
                red.redirect('admin/products/edit-product/'  + id);
            }else{
                try{ 
                    let p = await Product.findById(id);
                    p.title = slug;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    // if(imageFile != "") p.image = imageFile;

                    await p.save();
                    res.redirect('/admin/products')
                } catch(err){
                    console.log("err retriving page : ", err);
                    red.redirect('admin/products/edit-product/'  + id);
                }

            }
        } catch(err){
            console.log("dupProduct Error: ", err);
            red.redirect('admin/products/edit-product/'  + id);
        }
    }

});




//GET Delete Page
router.get('/delete-page/:slug', async (req, res) => {
    console.log("on delete section ....");

    // Ensure the id is extracted correctly. Assuming it's sent in the request body.
    const slug = req.params.slug;
    console.log("**slug : " , slug);

    if (!slug) {
        return res.status(400).send("Bad Request: Missing _id");
    }

    try {
        const result = await Page.deleteOne({ slug: slug });

        if (result.deletedCount === 1) {
            console.log(`Page with slug: ${slug} was deleted.`);
            // return res.status(200).send("Page successfully deleted");
            res.redirect('/admin/pages/');
        } else {
            console.log(`Page with slug: ${slug} was not found.`);
            return res.status(404).send("Page not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});





module.exports = router;
