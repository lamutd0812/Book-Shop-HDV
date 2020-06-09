const express = require('express');

const passport = require('passport');

const authController = require('../controllers/auth');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/login',
    failureFlash: true
}), authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', authController.postSignup);

router.get('/profile', isAuth, authController.getProfile);

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/login'
}), authController.getFBAuthCb);

router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
}), authController.getGoogleAuthCb);

router.get('/logout', authController.getLogout);

module.exports = router;