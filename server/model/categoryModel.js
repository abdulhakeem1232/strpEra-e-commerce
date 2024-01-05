const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    }
})


const categoryModel = new mongoose.model("categories", schema)

module.exports = categoryModel