const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        items: [{
            product: {
                type: Object,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
        totalAmount: {
            type: Number,
            required: true
        },
        orderDetailId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'OrderDetail'
        },
        status: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

