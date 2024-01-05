const mongoose = require('mongoose')
const shortid = require('shortid')
const Schema = mongoose.Schema;

// mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    orderId: {
        type: String,
        default: shortid.generate,
        unique: true
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'products',
        },
        quantity: {
            type: Number,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },

    }],
    amount: {
        type: Number,
        required: true
    },
    wallet: {
        type: Number,
    },
    status: {
        type: String,
        default: "pending",
        required: true
    }, address: {
        type: Array,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    updated: {
        type: Date,
        required: true
    }
})


const orderModel = new mongoose.model("orders", schema)

module.exports = orderModel