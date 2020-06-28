const passport = require('passport');
var bcrypt = require('bcrypt');

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('./config');

var User = require('../model/user');
var Cart = require('../model/cart');

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// local signup
passport.use('local-signup',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allow send request to callback function
        },
        async function (req, email, password, done) {
            process.nextTick(async function () {
                try {
                    const user = await User.findOne({ 'local.email': email });
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'This email is already exist!'));
                    }

                    const hashedPassword = await bcrypt.hash(password, 12);
                    var newUser = new User();
                    newUser.local.email = email;
                    newUser.local.password = hashedPassword
                    newUser.role = 'client';

                    // await newUser.save(async (err) => {
                    //     if (err) throw err;

                    //     return done(null, newUser);
                    // });

                    const savedUser = await newUser.save();
                    //console.log(savedUser);

                    const cart = await Cart.findOne({ userId: savedUser._id });
                    if (!cart) {
                        var newCart = new Cart();
                        newCart.userId = savedUser._id;
                        newCart.items = [];
                    }
                    await newCart.save();

                    return done(null, newUser);

                } catch (err) {
                    console.log(err);
                }
            });
        }
    )
);

passport.use('local-login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async function (req, email, password, done) {
            process.nextTick(async function () {
                try {
                    const user = await User.findOne({ 'local.email': email });
                    if (!user) {
                        return done(null, false, req.flash('loginMessage', 'User not found!'));
                    }

                    const doMatch = await bcrypt.compare(password, user.local.password);
                    if (!doMatch) {
                        return done(null, false, req.flash('loginMessage', 'Wrong password!'))
                    }
                    return done(null, user);
                } catch (err) {
                    console.log(err);
                }
            });
        }
    ));

passport.use(new FacebookStrategy(
    {
        clientID: config.facebook_auth.appId,
        clientSecret: config.facebook_auth.appSecret,
        callbackURL: config.facebook_auth.callbackUrl,
        profileFields: ['id', 'displayName', 'email']
    },
    async function (accessToken, refreshToken, profile, done) {
        //console.log(profile);
        process.nextTick(async function () {
            try {
                const user = await User.findOne({ 'facebook.id': profile.id });
                if (user) {
                    return done(null, user);
                }
                var newUser = new User();
                newUser.facebook.id = profile.id;
                newUser.facebook.token = accessToken;
                newUser.facebook.name = profile.displayName;
                newUser.facebook.email = profile.emails[0].value;
                newUser.role = 'client';

                const savedUser = await newUser.save();
                const cart = await Cart.findOne({ userId: savedUser._id });
                if (!cart) {
                    var newCart = new Cart();
                    newCart.userId = savedUser._id;
                    newCart.items = [];
                }
                await newCart.save();

                return done(null, newUser);
            } catch (err) {
                console.log(err);
            }
        });
    }
));

passport.use(new GoogleStrategy(
    {
        clientID: config.google_auth.clientId,
        clientSecret: config.google_auth.clientSecret,
        callbackURL: config.google_auth.callbackUrl
    },
    function (accessToken, refreshToken, profile, done) {
        //console.log(profile);
        try {
            process.nextTick(async function () {
                const user = await User.findOne({ 'google.id': profile.id });
                if (user) {
                    return done(null, user);
                }
                var newUser = new User();
                newUser.google.id = profile.id;
                newUser.google.token = accessToken;
                newUser.google.name = profile.displayName;
                newUser.google.email = profile.emails[0].value;
                newUser.role = 'client';

                const savedUser = await newUser.save();
                const cart = await Cart.findOne({ userId: savedUser._id });
                if (!cart) {
                    var newCart = new Cart();
                    newCart.userId = savedUser._id;
                    newCart.items = [];
                }
                await newCart.save();

                return done(null, newUser);
            });
        } catch (err) {
            console.log(err);
        }
    }
));

module.exports = passport;