const coupanModel = require("../../model/coupanModel")

const coupan = async (req, res) => {
    try {
        const coupon = await coupanModel.find()
        res.render("admin/coupan", { coupon })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const newcoupon = async (req, res) => {
    try {
        res.render("admin/addcoupon")
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const addcoupon = async (req, res) => {
    try {
        const { coupancode, minprice, percentage, expiry } = req.body
        await coupanModel.insertMany({ coupancode: coupancode, minprice: minprice, discountpercentage: percentage, expirydate: expiry })
        res.redirect('/admin/coupan')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}



module.exports = {
    coupan,
    newcoupon,
    addcoupon,
}