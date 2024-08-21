const express = require("express");
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;
// Get Category model
const Category = require("../models/category");
const database = require("../config/database");

//GET category index
router.get("/",isAdmin , (req, res) => {

    Category.find()
        .then((categories) => {
            // console.log("categories :", categories);
            res.render('admin/categories', {
                categories: categories
            });
        })
        .catch((err) => {
            console.log("Database error:" , err);
            res.status(500).send('Internal Server Error');
        });
});

//GET add-category
router.get("/add-category",isAdmin, (req, res) => {
    var title = "";
    res.render("admin/add_category", {
        title: title,
    });
});

// //POST add page
router.post("/add-category", (req, res) => {
    console.log("yes recived***********");
    req.checkBody("title", "title must have a value.").notEmpty();
    
    var title = req.body["title"];
    console.log("title : " , title);
    var slug = title.replace(/\s+/g, "-").toLowerCase();

    var errors = req.validationErrors();
    req.app.locals.success = null;
    if (errors) {
        console.log("error is : " + errors);

        res.render("admin/add_category", {
            errors: errors,
            title: title,
        });
    } else {
        Category.findOne({ slug: slug })
            .then((category) => {
                if (category) {
                    console.log("Slug already exists: Choose another slug");
                    // res.redirect('/admin/pages/add-page');
                    res.render("admin/add_category", {
                        errors: [{ msg: "Title already exists: Choose another slug" }],
                        title: title
                    });
                } else {
                    var category = new Category({
                        title: title,
                        slug: slug
                    });

                    category.save()
                        .then(() => {
                            console.log("Successfully saved!");
                            req.app.locals.success = "Category saved successfully!";
                            res.redirect("/admin/categories");
                        })
                        .catch((err) => {
                            console.log("Error: Failed to save page!");
                            res.redirect("/admin/pages/add-category");
                        });
                }
            })
            .catch((err) => {
                console.log("Error:", err);
                res.redirect("/admin/pages/add-category");
            });
    }
});

// //GET edit category
router.get('/edit-category/:id', isAdmin, async (req, res) => {
    // console.log("at edit-catagory GET PAGE &&&&@#OIU@)U!@)");
    const id = req.params.id;
    // console.log("id :", id);
    try {
        const category = await Category.findOne({_id: id}); // Use id directly, not { id: id }
        if (!category) {
            return res.status(404).send("Category not found");
        }

        res.render("admin/edit_category", {
            title: category.title, // Assuming title and slug are properties of your category model
            slug: category.slug,
            id: id
        });
    } catch (error) {
        // console.error("Error fetching page:", error);
        res.status(500).send("Server error");
    }
});

// //POST edit page
router.post("/edit-category/:id", (req, res) => {
    // console.log("yes recived***********");
    req.checkBody("title", "title must have a value.").notEmpty();

    var title = req.body["title"];
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();
    req.app.locals.success = null;
    // console.log(`title : ${title} \n  id: ${id} `);
    if(errors) {
        // console.log("error is : " + errors);
        res.render("admin/edit_category", {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({ _id : id })
            .then((category) => {
                if (!category) {
                    console.log("Error: Category not found!");
                    req.app.locals.error = "Category not found!";
                    res.redirect("/admin/categories/add-category");
                    return;
                }
                category.title = title;
                category.slug = slug; // in the existing slug ; updaing it with new slug
                category.id = id ;
                category.save()
                    .then(() => {
                        // console.log("Successfully saved!");
                        req.app.locals.success = "Page saved successfully!";
                        res.redirect("/admin/categories");
                    })
                    .catch((err) => {
                        // console.log("Error: Failed to save category!", err);
                        req.app.locals.error = "Failed to save category!";
                        res.redirect("/admin/categories/edit-category/" + id);
                    });

            })
            .catch((err) => {
                // console.log("Error:", err);
                req.app.locals.error = "Error finding category!";
                res.redirect("/admin/categories/add-category");
            });
    }
});



//GET Delete Page
router.get('/delete-category/:id',isAdmin,  async (req, res) => {
    console.log("on delete section ....");

    const id = req.params.id;
    // console.log("_id : " , id);
    if (!id) {
        return res.status(400).send("Bad Request: Missing _id");
    }

    try {
        const result = await Category.deleteOne({ _id: id });

        if (result.deletedCount === 1) {
            console.log(`Category with _id: ${id} was deleted.`);
            res.redirect('/admin/categories/');
        } else {
            console.log(`Page with _id: ${id} was not found.`);
            return res.status(404).send("Category not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});









module.exports = router;
