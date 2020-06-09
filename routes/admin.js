const express = require('express');

const passport = require('passport');

const adminController = require('../controllers/admin');
const isAuthAdmin = require('../middlewares/is-auth-admin');

const router = express.Router();

router.get('/admin', isAuthAdmin, adminController.getIndexPageAdmin);

router.get('/admin/login', adminController.getLoginAdmin);

router.post('/admin/login', passport.authenticate('local-login', {
    failureRedirect: '/admin/login',
    failureFlash: true
}), adminController.postLoginAdmin);

router.get('/admin/add-product', isAuthAdmin, adminController.getAddProduct);

router.post('/admin/add-product', isAuthAdmin, adminController.postAddProduct)

router.get('/admin/categories', isAuthAdmin, adminController.getCategories);

router.get('/admin/add-category', isAuthAdmin, adminController.getAddCategory);

router.post('/admin/add-category', isAuthAdmin, adminController.postAddCategory);

router.get('/admin/logout', adminController.getLogoutAdmin);

module.exports = router;