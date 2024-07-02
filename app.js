const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config/database");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
// const flash = require('express-flash');
const fileUpload = require("express-fileupload");

//connect to db
mongoose.connect(config.database);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connections error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//init app
const app = express();

//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//set public folder
app.use(express.static(path.join(__dirname, "public")));

//set Global Errors variable
app.locals.errors = null;
app.locals.success = null;

//Global variable for Pages---
app.locals.globalPages = null;
const page = require("./models/page");
async function setGlobalPages() {
  try {
    app.locals.globalPages = await page.find();
  } catch (err) {
    console.error("Error fetching global pages: ", err);
  }
}
setGlobalPages();

//Global variable for Categories---
app.locals.globalCategories = null;
const category = require("./models/category");
async function setGlobalCategories() {
  try {
    app.locals.globalCategories = await category.find();
  } catch (err) {
    console.error("Error fetching global categories: ", err);
  }
}
setGlobalCategories();

// Serve static files from the "public" directory
app.use(express.static("public"));

//Express fileUpload middleware
app.use(fileUpload());

//Body-Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());

//Express Session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

//Express Validator middleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      },
    },
  })
);
// Middleware to parse JSON bodies (as sent by API clients)
app.use(express.json());

//Express messages middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    next();
});



//set routes
const pages = require("./routes/pages.js");
const cart = require("./routes/cart.js");
const products = require('./routes/products.js');
const adminPages = require("./routes/admin_pages.js");
const adminCategories = require("./routes/admin_categories.js");
const adminProducts = require("./routes/admin_products.js");
const Category = require("./models/category");
const Product = require("./models/product.js");

app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/products", products);
app.use("/cart", cart);
app.use("/", pages);

//start the server
const port = 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

/*
PS C:\Users\Dell\Desktop\SuperMall> git push -u origin main
Enumerating objects: 4890, done.
Counting objects: 100% (4890/4890), done.
Delta compression using up to 12 threads       
Compressing objects: 100% (4681/4681), done.
Writing objects:  11% (575/4890), 984.00 KiB | Writing objects:  12% (587/4890), 984.00 KiB | Writing objects:  13% (636/4890), 984.00 KiB | Writing objects:  14% (685/4890), 984.00 KiB | Writing objects:  15% (734/4890), 984.00 KiB | Writing objects:  16% (783/4890), 984.00 KiB | Writing objects:  17% (832/4890), 984.00 KiB | Writing objects:  18% (881/4890), 984.00 KiB | Writing objects:  19% (930/4890), 984.00 KiB | Writing objects:  20% (978/4890), 984.00 KiB | Writing objects:  21% (1027/4890), 984.00 KiB |Writing objects:  22% (1076/4890), 1.79 MiB | 1Writing objects:  23% (1125/4890), 1.79 MiB | 1Writing objects:  24% (1174/4890), 1.79 MiB | 1Writing objects:  25% (1223/4890), 1.79 MiB | 1Writing objects:  26% (1272/4890), 1.79 MiB | 1Writing objects:  27% (1321/4890), 1.79 MiB | 1Writing objects:  28% (1370/4890), 1.79 MiB | 1Writing objects:  29% (1419/4890), 1.79 MiB | 1Writing objects:  30% (1467/4890), 1.79 MiB | 1Writing objects:  31% (1516/4890), 1.79 MiB | 1Writing objects:  32% (1565/4890), 1.79 MiB | 1Writing objects:  33% (1614/4890), 1.79 MiB | 1Writing objects:  34% (1663/4890), 1.79 MiB | 1Writing objects:  35% (1712/4890), 1.79 MiB | 1Writing objects:  35% (1726/4890), 1.79 MiB | 1Writing objects:  36% (1761/4890), 4.72 MiB | 2Writing objects:  37% (1810/4890), 4.72 MiB | 2Writing objects:  38% (1859/4890), 4.72 MiB | 2Writing objects:  39% (1908/4890), 4.72 MiB | 2Writing objects:  40% (1956/4890), 4.72 MiB | 2Writing objects:  41% (2005/4890), 4.72 MiB | 2Writing objects:  42% (2054/4890), 4.72 MiB | 2Writing objects:  43% (2103/4890), 4.72 MiB | 2Writing objects:  44% (2152/4890), 4.72 MiB | 2Writing objects:  45% (2201/4890), 4.72 MiB | 2Writing objects:  46% (2250/4890), 4.72 MiB | 2Writing objects:  47% (2299/4890), 4.72 MiB | 2Writing objects:  48% (2349/4890), 4.72 MiB | 2Writing objects:  49% (2398/4890), 4.72 MiB | 2Writing objects:  50% (2445/4890), 4.72 MiB | 2Writing objects:  51% (2494/4890), 4.72 MiB | 2Writing objects:  52% (2543/4890), 4.72 MiB | 2Writing objects:  53% (2592/4890), 4.72 MiB | 2Writing objects:  54% (2641/4890), 4.72 MiB | 2Writing objects:  55% (2690/4890), 4.72 MiB | 2Writing objects:  56% (2739/4890), 4.72 MiB | 2Writing objects:  57% (2788/4890), 4.72 MiB | 2Writing objects:  58% (2837/4890), 4.72 MiB | 2Writing objects:  59% (2886/4890), 4.72 MiB | 2Writing objects:  60% (2934/4890), 4.72 MiB | 2Writing objects:  61% (2983/4890), 4.72 MiB | 2Writing objects:  62% (3032/4890), 4.72 MiB | 2Writing objects:  63% (3081/4890), 4.72 MiB | 2Writing objects:  64% (3130/4890), 4.72 MiB | 2Writing objects:  65% (3179/4890), 4.72 MiB | 2Writing objects:  66% (3228/4890), 4.72 MiB | 2Writing objects:  67% (3277/4890), 4.72 MiB | 2Writing objects:  68% (3326/4890), 4.72 MiB | 2Writing objects:  69% (3375/4890), 4.72 MiB | 2Writing objects:  70% (3423/4890), 4.72 MiB | 2Writing objects:  71% (3472/4890), 4.72 MiB | 2Writing objects:  72% (3521/4890), 4.72 MiB | 2Writing objects:  73% (3570/4890), 4.72 MiB | 2Writing objects:  74% (3619/4890), 4.72 MiB | 2Writing objects:  75% (3668/4890), 4.72 MiB | 2Writing objects:  76% (3717/4890), 4.72 MiB | 2Writing objects:  77% (3767/4890), 4.72 MiB | 2Writing objects:  78% (3815/4890), 4.72 MiB | 2Writing objects:  79% (3864/4890), 7.30 MiB | 2Writing objects:  80% (3912/4890), 7.30 MiB | 2Writing objects:  81% (3961/4890), 7.30 MiB | 2Writing objects:  82% (4010/4890), 7.30 MiB | 2Writing objects:  83% (4059/4890), 7.30 MiB | 2Writing objects:  84% (4108/4890), 7.30 MiB | 2Writing objects:  85% (4157/4890), 7.30 MiB | 2Writing objects:  86% (4206/4890), 7.30 MiB | 2Writing objects:  87% (4255/4890), 7.30 MiB | 2Writing objects:  88% (4304/4890), 7.30 MiB | 2Writing objects:  89% (4353/4890), 7.30 MiB | 2Writing objects:  90% (4401/4890), 7.30 MiB | 2Writing objects:  91% (4451/4890), 7.30 MiB | 2Writing objects:  92% (4499/4890), 7.30 MiB | 2Writing objects:  93% (4548/4890), 7.30 MiB | 2Writing objects:  94% (4597/4890), 7.30 MiB | 2Writing objects:  95% (4646/4890), 7.30 MiB | 2Writing objects:  96% (4695/4890), 7.30 MiB | 2Writing objects:  97% (4744/4890), 7.30 MiB | 2Writing objects:  98% (4793/4890), 7.30 MiB | 2Writing objects:  99% (4842/4890), 7.30 MiB | 2Writing objects: 100% (4890/4890), 7.30 MiB | 2Writing objects: 100% (4890/4890), 9.56 MiB | 3.26 MiB/s, done.
Total 4890 (delta 725), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (725/725), done 
To https://github.com/gopal15092La/SuperMall.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.   
PS C:\Users\Dell\Desktop\SuperMall> 
 */
