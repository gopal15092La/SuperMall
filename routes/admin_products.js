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
    console.log(req.body);

    var imageFile = (req.files && req.files.image) ? req.files.image.name : "";
    console.log("imageFile : ", imageFile);

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

//GET edit page
router.get('/edit-product/:id', async (req, res) => {

    var errors ; 
    
    if(req.session.errors)  errors = req.session.errors;
    req.session.errors = null;

    try {
        var categories = await Category.findById(req.params.id);
        if(!categories) {
            console.log("error : ", categories);
            res.redirect('/admin/products');
        }else{
            var galleryDir = 'public/product_images/' + categories._id + '/gallery';
            var galleryImages = null;
            
            fs.readdir(galleryDir, (err, files) => {
                if(err) {
                    console.log(err);
                }else{
                    galleryImages = files;
                    res.render('admin/edit_product', {
                        title: path.title,
                        errors: errors,
                        desc: p.desc,
                        categories: categories,
                        category: p.category.replace(/\s+/g,'-').toLowerCase(),
                        price: p.price,
                        image: p.image,
                        galleryImages: galleryImages 
                    });
                }
            });
        }

    } catch (error) {
        console.error("Error fetching page:", error);
        res.status(500).send("Server error");
    }
});

//POST EDIT page
router.post("/edit-page/:slug", (req, res) => {
    console.log("yes recived***********");
    console.log("Request body:", req.body);
    req.checkBody("title", "title must have a value.").notEmpty();
    req.checkBody("content", "content must have a value.").notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var id = req.body._id;
    var slug = req.params.slug.replace(/\s+/g, "-").toLowerCase();
    if (slug == "")    
            slug = title.replace(/\s+/g, "-").toLowerCase();

    var errors = req.validationErrors();
    req.app.locals.success = null;


    console.log(`title : ${title} \n content: ${content} \n id: ${id} \n slug: ${slug}`);

    if (errors) {
        console.log("error is : " + errors);

        res.render("admin/edit_page", {
            errors: errors,
            title: title,
            slug: slug, // Pass the slug variable here
            content: content,
            id: id
        });
    } else {
        Page.findOne({ slug: slug })
            .then((page) => {
                if (!page) {
                    console.log("Error: Page not found!");
                    req.app.locals.error = "Page not found!";
                    res.redirect("/admin/pages/add-page");
                    return;
                }
                page.title = title;
                page.slug = req.body.slug; // in the existing slug ; updaing it with new slug
                page.content = content;

                page.save()
                    .then(() => {
                        console.log("Successfully saved!");
                        req.app.locals.success = "Page saved successfully!";
                        res.redirect("/admin/pages");
                    })
                    .catch((err) => {
                        console.log("Error: Failed to save page!", err);
                        req.app.locals.error = "Failed to save page!";
                        res.redirect("/admin/pages/edit-page/" + slug);
                    });

            })
            .catch((err) => {
                console.log("Error:", err);
                req.app.locals.error = "Error finding page!";
                res.redirect("/admin/pages/add-page");
            });
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
