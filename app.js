const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const config = require('./config/config');

const app = express();

// multer config
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//views config
app.set('view engine', 'ejs');
app.set('views', 'views');

// routes
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

//app.use(morgan('dev')); // log all request in console log
//app.use(cookieParser()); // read cookie (for authentication)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({ secret: 'supersecretsecret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // for flash messages stored in session

app.use(adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

mongoose.connect(config.db_uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(result => {
        console.log('server started!');
        app.listen(3000);
    })
    .catch(err => {
        console.log(err)
    });
