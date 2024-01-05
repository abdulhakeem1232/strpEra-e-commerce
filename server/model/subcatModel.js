const mongoose = require('mongoose')
const Schema = mongoose.Schema;
// const ParentCategory = require('./categoryModel');

// mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    p_category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true,
    }
})


const subcategoryModel = new mongoose.model("subcategories", schema)

module.exports = subcategoryModel