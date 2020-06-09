const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/', shopController.getIndexPage);

router.get('/shop', shopController.getProducts);

module.exports = router;