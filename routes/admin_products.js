const express = require("express");
const router = express.Router();
const  { mkdirp } = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

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
    // console.log("yes recived***********");
    console.log(req.body);

    var imageFile = req.files && req.files.image ? req.files.image.name : "";

    // req.checkBody("desc", "Description must have a value.").notEmpty();
    req.checkBody("title", "title must have a value.").notEmpty();
    req.checkBody("price", "Price must have a value.").isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);


    var errors = req.validationErrors();

    var title = req.body["title"];
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var desc = req.body["desc"];
    var price = req.body["price"];
    var category = req.body["Category"];
    // var category = req.params.Category;

    console.log("imageFile : ", imageFile);
    console.log("desc : ", desc);
    
    req.app.locals.success = null;

    if (errors) {
        console.log("error is : " + errors);

        var categories = await Category.find();
        res.render('admin/add_product', {
            errors: errors,
            title : title,
            desc : desc,
            categories : categories,
            price: price,
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
                    console.log("Product successfully saved!");
        
                    await mkdirp('public/product_images/' + newProduct._id);
                    // console.log("Directory created successfully");

                    await mkdirp('public/product_images/' + newProduct._id + '/gallery');
                    // console.log("Gallery directory created successfully");

                    await mkdirp('public/product_images/' + newProduct._id + '/gallery/thumbs');
                    // console.log("Thumbs directory created successfully");
                    
                    if(imageFile != ""){
                        var productImage = req.files.image;
                        var path = 'public/product_image/' + newProduct._id + '/' + imageFile;

                        try {
                            await productImage.mv(path);
                        }
                        catch(err){
                            return console.log("mv error : ", err);
                        }
                    }

                    return res.redirect("/admin/products");
                } catch (err) {
                    console.error("Error:", err);
                    return res.redirect("/admin/products/add-product");
                }
            }
        } catch (err) {
            console.error("Error:", err);
            return res.redirect("/admin/products/add");
        }
        
    }
});

//GET edit page
router.get('/edit-page/:slug', async (req, res) => {
    const title = req.params.title;
    const slug = req.params.slug;
    const content = req.params.content;
    const id = req.params._id;
    try {
        const page = await Page.findOne({slug: slug}); // Replace with your actual database call
        if (!page) {
            return res.status(404).send("Page not found");
        }

        res.render("admin/edit_page", {
            page: page,
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
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
