const passport = require('passport');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', { message: req.flash('loginMessage') });
};

exports.postLogin = (req, res, next) => {
    res.redirect('/');
};

exports.getFBAuthCb = (req, res, next) => {
    res.redirect('/'); // chuyển hướng về trang chủ khi login thành công
};

exports.getGoogleAuthCb = (req, res, next) => {
    res.redirect('/');
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', { message: req.flash('signupMessage') });
};

exports.postSignup = passport.authenticate('local-signup', {
    successRedirect: '/login',
    failureRedirect: '/signup',
    failureFlash: true
});

exports.getProfile = (req, res, next) => {
    res.render('profile', {
        user: req.user
    });
};

exports.getLogout = (req, res, next) => {
    req.logout();
    res.redirect('/');
};

