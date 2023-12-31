const orderModel = require('../../model/orderModel');
const productModel = require('../../model/productModel');


const order = async (req, res) => {
    try {
        const order = await orderModel.find({}).sort({ createdAt: -1 }).populate({
            path: 'items.productId',
            select: 'name'
        })
        res.render("admin/order", { order: order })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const orderstatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        const updateOrder = await orderModel.updateOne({ _id: orderId }, { status: status, updated: new Date() })
        res.redirect('/admin/order')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const crop = async (req, res) => {
    try {
        res.render("admin/sma")
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}








module.exports = {
    order,
    orderstatus,
    crop,
}