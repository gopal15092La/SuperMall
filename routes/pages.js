const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index',{
        heading:"supermall"
    });
});


module.exports = router;
