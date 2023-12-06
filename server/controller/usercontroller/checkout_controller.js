const addressModel = require('../../model/addressModel');
const cartModel = require('../../model/cartModel');
const orderModel = require('../../model/orderModel');
const productModel = require('../../model/productModel')
const favModel = require('../../model/favModel')
const Razorpay = require('razorpay')
const { key_id, key_secret } = require('../../../env');
const coupanModel = require('../../model/coupanModel');
const userModel = require('../../model/userModel');
const walletModel = require('../../model/walletModel');

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
        res.redirect('/error')
        console.log(err);
    }
}
const order = async (req, res) => {
    try {
        console.log(req.body);
        const { address,pay,amount} = req.body
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
            amount: amount,
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
        res.redirect('/error')
        console.log(err);
    }
}

const orders = async (req, res) => {
    try {
        const userId = req.session.userId;
        // console.log(userId);
        const order = await orderModel.find({ userId: userId }).sort({createdAt:-1}).populate({
            path: 'items.productId',
            select: 'name images'
        })
        // console.log(order);
        res.render('user/orderHistory', { orders: order })
    }
    catch (err) {
        res.redirect('/error')
        console.log(err);
    }
}

const ordercancelling = async (req, res) => {
    try {
        const id = req.params.id
        const update = await orderModel.updateOne({ _id: id }, { status: "Cancelled",updated:new Date() })
        const result = await orderModel.findOne({ _id: id })
       console.log("result",result);

       if(result.payment=='upi'){
        const userId=req.session.userId
        const user=await userModel.findOne({_id:userId})
        user.wallet +=result.amount
        await user.save()

        //storing in wallet
        const wallet=await walletModel.findOne({userId:userId})
        if(!wallet){
            const newWallet=new walletModel({
                userId:userId,
                history:[
                    {transaction:"Credited",
                    amount:result.amount,
                    date:new Date()}
                ]
            })
            await newWallet.save();
        }else{
            wallet.history.push({transaction:"Credited",
            amount:result.amount,
            date:new Date()})
            await wallet.save();
        }
       }

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
        res.redirect('/error')
        console.log(err);
    }
}

const orderreturning = async (req, res) => {
    try {
        const id = req.params.id
        const update = await orderModel.updateOne({ _id: id }, { status: "returned",updated:new Date() })
        const result = await orderModel.findOne({ _id: id })
       console.log("result",result);

        const userId=req.session.userId
        const user=await userModel.findOne({_id:userId})
        user.wallet +=result.amount
        await user.save()

        const wallet=await walletModel.findOne({userId:userId})
        if(!wallet){
            const newWallet=new walletModel({
                userId:userId,
                history:[
                    {transaction:"Credited",
                    amount:result.amount,
                    date:new Date()}
                ]
            })
            await newWallet.save();
        }else{
            wallet.history.push({transaction:"Credited",
            amount:result.amount,
            date:new Date()})
            await wallet.save();
        }
       
       
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
        res.redirect('/error')
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


        const fav = await favModel.findOne({ userId: userId });

        if (!fav) {
            
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
        res.redirect('/error')
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
        res.redirect('/error')
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
        res.redirect('/error')
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
        res.redirect('/error')
    }
}

const wallet = async (req, res) => {
    try {
       const amount=req.body.amount
       const user=await userModel.findOne({_id:req.session.userId})
       if(user.wallet>=amount){
        user.wallet-=amount
        await user.save();

        const wallet=await walletModel.findOne({userId:user._id})
        if(!wallet){
            const newWallet=new walletModel({
                userId:user._id,
                history:[
                    {transaction:"Debited",
                    amount:amount,
                    date:new Date()}
                ]
            })
            await newWallet.save();
        }else{
            wallet.history.push({transaction:"Debited",
            amount:amount,
            date:new Date()})
            await wallet.save();
        }
        res.json({success:true})
       }
       else{
        res.json({success:false,message:"don't have enought money"})
       }
    } catch (err) {
        console.error(err);
        res.redirect('/error')
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
    orderreturning,
    wallet,
}