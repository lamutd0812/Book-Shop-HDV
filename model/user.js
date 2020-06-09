var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    local: {
        email: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    role: String
});

module.exports = mongoose.model('User', userSchema);
