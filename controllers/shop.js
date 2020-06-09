const Category = require('../model/category');
const Product = require('../model/product');

exports.getIndexPage = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.render('index', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            categories: categories
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const categories = await Category.find();
        const products = await Product.find();
        res.render('shop', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            categories: categories,
            products: products
        });
    } catch (err) {
        console.log(err);
    }
};