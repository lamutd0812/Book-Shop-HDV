const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String
    }
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);