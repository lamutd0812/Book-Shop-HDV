var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [{
        productId: { type: Schema.Types.ObjectId, required: true },
        quantity: {type: Number, required: true}
    }]
});