const mongoose = require('mongoose');

const Category = require('../model/category');
const Product = require('../model/product');

exports.getIndexPageAdmin = async (req, res, next) => {
    try {
        const products = await Product.find().populate('categoryId');
        res.render('admin/index', {
            user: req.user,
            products: products
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getLoginAdmin = (req, res, next) => {
    res.render('admin/login', { message: req.flash('loginMessage') });
};

exports.postLoginAdmin = (req, res, next) => {
    res.redirect('/admin');
};

exports.getAddProduct = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.render('admin/add-product', {
            user: req.user,
            categories: categories,
            error: '',
            product: {}
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postAddProduct = async (req, res, next) => {
    const name = req.body.name;
    const author = req.body.author;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const categoryId = req.body.category;

    try {
        const categories = await Category.find();
        if (!image) {
            return res.status(422).render('admin/add-product', {
                user: req.user,
                categories: categories,
                error: 'Attached file is not an image.',
                product: {
                    name: name,
                    author: author,
                    description: description,
                    price: price
                }
            });
        }
        const category = await Category.findById(categoryId);
        const product = new Product({
            name: name,
            author: author,
            imageUrl: image.path.replace("\\","/"),
            description: description,
            price: price,
            categoryId: category
        });
        await product.save();
        console.log('Added New Product!');
        res.redirect('/admin');
    } catch (err) {
        console.log(err);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.render('admin/categories', {
            user: req.user,
            categories: categories
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getAddCategory = (req, res, next) => {
    res.render('admin/add-category', {
        user: req.user,
        error: '',
        category: {}
    });
};

exports.postAddCategory = async (req, res, next) => {
    const name = req.body.name;
    const image = req.file;
    if (!image) {
        return res.status(422).render('admin/add-category', {
            user: req.user,
            error: 'Attached file is not an image.',
            category: {
                name: name
            }
        });
    }

    const category = new Category({
        name: name,
        imageUrl: '/' + image.path.replace("\\","/")
    });
    try {
        await category.save();
        console.log('Added New Category.');
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
    }
};

exports.getLogoutAdmin = (req, res, next) => {
    req.logout();
    res.redirect('/admin');
}