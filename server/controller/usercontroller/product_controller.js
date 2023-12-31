const categoryModel = require('../../model/categoryModel')
const productModel = require('./../../model/productModel')
const subcategoryModel = require('./../../model/subcatModel')
const mongoose = require('mongoose')



const shopping = async (req, res) => {
    try {
        const id = req.params.id
        req.session.category = id
        const product = await productModel.find({ $and: [{ category: id }, { status: true }] })
        const sub_category = await subcategoryModel.find({ p_category: id })
        res.render('user/shop', { product: product, subcategory: sub_category })
    }
    catch (err) {
        console.log("Shopping Page Error:", err);
        res.redirect('/error')
    }

}
const subshopping = async (req, res) => {
    try {
        const pid = req.params.pid
        const sid = req.params.sid
        req.session.category = sid
        const product = await productModel.find({ $and: [{ category: pid }, { sub_category: sid }, { status: true }] })
        const sub_category = await subcategoryModel.find({ p_category: pid })
        res.render('user/shop', { product: product, subcategory: sub_category })
    }
    catch (err) {
        console.log("Shopping Page Error:", err);
        res.redirect('/error')
    }

}

const sortproducts = async (req, res) => {
    try {
        const sort = parseInt(req.params.sort)
        const id = req.session.category
        const product = await productModel.find({ $and: [{ $or: [{ category: id }, { sub_category: id }] }, { status: true }] }).sort({ price: sort })
        const pid = product[0].category
        const sub_category = await subcategoryModel.find({ p_category: pid })
        res.render('user/shop', { product: product, subcategory: sub_category })
    }
    catch (err) {
        console.log("Shopping Page Error:", err);
        res.redirect('/error')
    }

}

const search = async (req, res) => {
    try {
        const search = req.body.search
        const cat = await categoryModel.findOne({ name: { $regex: new RegExp(`^${search}`, 'i') } });
        const id = cat._id
        const product = await productModel.find({ category: id })
        const sub_category = await subcategoryModel.find({ p_category: id })
        res.render('user/shop', { product: product, subcategory: sub_category })

    }
    catch (err) {
        console.log("Shopping Page Error:", err);
        res.redirect('/')
    }

}


const singleproduct = async (req, res) => {
    try {
        const id = req.params.id
        const product = await productModel.findOne({ _id: id })
        const subId = product.sub_category
        const subcat = await productModel.find({
            $and: [
                { sub_category: subId },
                { _id: { $ne: id } }
            ]
        });
        const productId = new mongoose.Types.ObjectId(id);
        const avgRating = await productModel.aggregate([
            {
                $match: {
                    _id: productId
                }
            },
            {
                $unwind: '$ratings'
            },
            {
                $group: {
                    _id: null,
                    avg: { $avg: '$ratings.ratings' }
                }
            }
        ])
        console.log('id', id);
        console.log(avgRating);
        product.images = product.images.map(image => image.replace(/\\/g, '/'));
        res.render('user/singleproduct', { product: product, relatedpro: subcat, avgRating })
    }
    catch (err) {
        console.log("Shopping Page Error:", err);
        res.redirect('/error')
    }

}


module.exports = {
    shopping,
    subshopping,
    singleproduct,
    sortproducts,
    search,
}