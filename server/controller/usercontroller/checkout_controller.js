const addressModel = require('../../model/addressModel');
const cartModel = require('../../model/cartModel');
const orderModel = require('../../model/orderModel');
const productModel = require('../../model/productModel')
const favModel = require('../../model/favModel')
const Razorpay = require('razorpay')
const { key_id, key_secret } = require('../../../env');
const coupanModel = require('../../model/coupanModel');
var instance = new Razorpay({ key_id: key_id, key_secret: key_secret })


const checkout = async (req, res) => {
    try {
        const userId = req.session.userId;
        // console.log(userId);
        const address = await addressModel.findOne({ userId: userId })
        const data = await cartModel.findOne({ userId: userId }).populate({
            path: 'item.productId',
            select: 'name'
        })

        for (const cartItem of data.item || []) {
            const pro = cartItem.productId;
            const product=await productModel.findOne({_id:pro._id})
            console.log("kewn11",product);
            const size = product.stock.findIndex(s => s.size == cartItem.size);
            console.log("kekwe22",size);

    
            if (product.stock[size].quantity < cartItem.quantity) {
                console.log('Selected quantity exceeds available stock for productId:', product._id);
                return res.redirect('/showcart'); 
            }
        }

        res.render('user/checkout', { data: data, address: address })
    }
    catch (err) {
        res.status(500).send('error occured')
        console.log(err);
    }
}
const order = async (req, res) => {
   
    try {
        console.log(req.body);
        const { address,pay} = req.body
        console.log(pay);
        const userId = req.session.userId
        const cart = await cartModel.findOne({ userId: userId })
        

        // console.log(address);
        // console.log(paymentMethod);
        const useraddress = await addressModel.findOne({ userId: userId })
        // console.log("11",useraddress);
        const selectedaddress = useraddress.address[address]
        // console.log("hi");
        // console.log("11",useraddress);
        // console.log("22",selectedaddress);
        const items = cart.item.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: item.price,
        }))

        for (const item of items) {
            const product = await productModel.findOne({ _id: item.productId })

            const size = product.stock.findIndex(size => size.size == item.size)
            product.stock[size].quantity -= item.quantity
            await product.save()
        }

        const order = new orderModel({
            userId: userId,
            items: items,
            amount: cart.total,
            payment: pay,
            address: selectedaddress,
            createdAt: new Date(),
            updated: new Date()
        })
        cart.item = []
        cart.total = 0


        const savedOrder = await order.save()
        await cart.save()
        const orderconfirmation = await orderModel.findOne({ orderId: savedOrder.orderId }).populate({
            path: 'items.productId',
            select: 'name'
        })

        res.render('user/confirmation', { order: orderconfirmation })
    }
    catch (err) {
        res.status(500).send('error occured')
        console.log(err);
    }
}

const orders = async (req, res) => {
    try {
        const userId = req.session.userId;
        // console.log(userId);
        const order = await orderModel.find({ userId: userId }).populate({
            path: 'items.productId',
            select: 'name images'
        })
        // console.log(order);
        res.render('user/orderHistory', { orders: order })
    }
    catch (err) {
        res.status(500).send('error occured')
        console.log(err);
    }
}

const ordercancelling = async (req, res) => {
    try {
        const id = req.params.id
        const update = await orderModel.updateOne({ _id: id }, { status: "Cancelled" })
        const result = await orderModel.findOne({ _id: id })
        //    console.log("result",result);
        const items = result.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,

        }))

        for (const item of items) {
            const product = await productModel.findOne({ _id: item.productId })

            const size = product.stock.findIndex(size => size.size == item.size)
            product.stock[size].quantity += item.quantity
            await product.save()
        }
        res.redirect("/orderhistory")

    }
    catch (err) {
        res.status(500).send('error occured')
        console.log(err);
    }
}

const upi = async (req, res) => {
    console.log('body:', req.body);
    var options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: "order_rcpt"
    };
    instance.orders.create(options, function (err, order) {
        console.log("order1 :", order);
        res.send({ orderId: order.id })
    })
}

const addToFav = async (req, res) => {
    try {
        const pid = req.params.id;
        const userId = req.session.userId;

        // Check if the product is already in the favorites
        const fav = await favModel.findOne({ userId: userId });

        if (!fav) {
            // If favorites document doesn't exist for the user, create a new one
            const newFav = new favModel({
                userId: userId,
                item: [{ productId: pid }],
            });
            await newFav.save();

        } else {
            const isProductInFavorites = fav.item.some((item) => item.productId.toString() === pid);

            if (!isProductInFavorites) {

                fav.item.push({ productId: pid });
                await fav.save();

            }
        }
        res.redirect('/fav')
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred');
    }
}

const viewFav = async (req, res) => {
    try {
        const userId = req.session.userId
        const fav = await favModel.findOne({ userId: userId }).populate({
            path: 'item.productId',
            select: "_id name images"
        })
        res.render('user/fav', { fav: fav })
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred');
    }
}


const removeFav = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productIdToRemove = req.params.id;

        console.log(productIdToRemove,"nwef");
        const result = await favModel.updateOne(
            { userId: userId },
            { $pull: { item: { productId: productIdToRemove } } }
        );

        res.redirect('/fav')
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred');
    }
}


const applycoupon = async (req, res) => {
    try {
       const {code,amount}=req.body
       const coupon=await coupanModel.findOne({coupancode:code})
       console.log(coupon);
       if(coupon && coupon.expirydate > new Date() && coupon.minprice <= amount){
        const dicprice=(amount*coupon.discountpercentage)/100
        const price=amount-dicprice;
        res.json({success:true,price,dicprice})
       }
       else{
        res.json({success:false,message:"Invalid Coupon"})
       }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred');
    }
}




module.exports = {
    checkout,
    order,
    orders,
    ordercancelling,
    upi,
    addToFav,
    viewFav,
    removeFav,
    applycoupon,
}