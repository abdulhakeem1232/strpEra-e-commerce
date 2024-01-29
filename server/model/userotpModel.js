const mongoose = require('mongoose')



// mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        required: true,
    },
    expiry: {
        type: Date,
        expires: '45s',
    }
})

const userotp = new mongoose.model("userotps", schema)

module.exports = userotp