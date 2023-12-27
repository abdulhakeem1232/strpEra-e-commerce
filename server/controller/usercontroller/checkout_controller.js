const addressModel = require('../../model/addressModel');
const cartModel = require('../../model/cartModel');
const orderModel = require('../../model/orderModel');
const productModel = require('../../model/productModel')
const favModel = require('../../model/favModel')
const Razorpay = require('razorpay')
const coupanModel = require('../../model/coupanModel');
const userModel = require('../../model/userModel');
const walletModel = require('../../model/walletModel');
const easyinvoice = require('easyinvoice');
const fs=require('fs');
const puppeteer=require('puppeteer')
const path=require('path')
const os=require('os');
const { log } = require('console');
const PDFDocument=require('pdfkit')

var instance = new Razorpay({ key_id:process.env.key_id, key_secret: process.env.key_secret })


const checkout = async (req, res) => {
    try {
        const userId = req.session.userId;
        const address = await addressModel.findOne({ userId: userId })
        const data = await cartModel.findOne({ userId: userId }).populate({
            path: 'item.productId',
            select: 'name'
        })

        for (const cartItem of data.item || []) {
            const pro = cartItem.productId;
            const product=await productModel.findOne({_id:pro._id})
            const size = product.stock.findIndex(s => s.size == cartItem.size);
    
            if (product.stock[size].quantity < cartItem.quantity) {
                console.log('Selected quantity exceeds available stock for productId:', product._id);
                return res.redirect('/showcart'); 
            }
        }

        const coupon =await coupanModel.find({minprice:{$lte:data.total}})
        res.render('user/checkout', { data: data, address: address,coupon:coupon })
    }
    catch (err) {
        res.redirect('/error')
        console.log(err);
    }
}
const order = async (req, res) => {
    try {
        const { address,pay,amount,wallet} = req.body
        console.log("jjj",wallet);
        const userId = req.session.userId
        const cart = await cartModel.findOne({ userId: userId })
        const useraddress = await addressModel.findOne({ userId: userId })
        const selectedaddress = useraddress.address[address]
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
            wallet:wallet,
            payment: pay,
            address: selectedaddress,
            createdAt: new Date(),
            updated: new Date()
        })
        cart.item = []
        cart.total = 0
        if(wallet>0){
            const userWallet=await walletModel.findOne({userId:userId})
            userWallet.history.push({transaction:"Debited",
            amount:wallet,
            date:new Date()})
            await userWallet.save();
            const user=await userModel.findOne({_id:userId})
            user.wallet-=wallet;
            await user.save();

        }
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
        const order = await orderModel.find({ userId: userId }).sort({createdAt:-1}).populate({
            path: 'items.productId',
            select: 'name images ratings'
        })
        order.forEach(order => {
            order.items.forEach(item => {
                console.log('Ratings for item', item.productId.name, ':', item.productId.ratings);
            });
        });
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

       if(result.payment=='upi'|| result.payment=='wallet'){
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
        res.json({success:true})
       }
       else{
        res.json({success:false,amount:user.wallet})
       }
    } catch (err) {
        console.error(err);
        res.redirect('/error')
    }
}

const ordertracking = async (req, res) => {
    try {
       const id=req.params.id
       const order = await orderModel.find({ _id:id }).populate({
        path: 'items.productId',
        select: 'name images'
    })
    console.log('kkk',order,'jjjj');
       res.render('user/ordertracking',{order:order})
       
    } catch (err) {
        console.error(err);
        res.redirect('/error')
    }
}

const pdfmaker = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await orderModel.findOne({ _id: orderId }).populate({
          path: 'items.productId',
          select: 'name',
        });
    
    
        const pdfBuffer = await generateInvoice(order);
    
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
        res.send(pdfBuffer);
      } catch (error) {
        console.error(error);
        res.redirect('/error')
      }
  }

  const generateInvoice = async (order) => {
    try {
        let totalAmount=order.amount;
        const data = {
            documentTitle: 'Invoice',
            currency: 'INR',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            sender: {
              company: 'UrbanSole',
              address: '123 Main Street, Banglore, India',
              zip: '651323',
              city: 'Banglore',
              country: 'INDIA',
              phone: '9876543210',
              email: 'urbansole@gmail.com',
              website: 'www.urbansole.tech',
            },
            invoiceNumber: `INV-${order.orderId}`,
            invoiceDate: new Date().toJSON(),
            products: order.items.map(item => ({
              quantity: item.quantity,
              description: item.productId.name,
              price: item.price,
            })),
            total: `₹${totalAmount.toFixed(2)}`, 
            tax: 0,
            bottomNotice: 'Thank you for shopping at UrbanSole!',
          };
  
      const result = await easyinvoice.createInvoice(data);
      const pdfBuffer = Buffer.from(result.pdf, 'base64');
  
      return pdfBuffer;
    } catch (error) {
        console.error(error);
        res.redirect('/error')
    }
  };
  
  
const addratings = async (req, res) => {
    try {
       const {orderId,productId,rating,review}=req.body
       const product=await productModel.findOne({_id:productId})
       product.ratings.push({userId:req.session.userId,orderId:orderId,ratings:rating,reviews:review})
       await product.save();
        res.redirect('/orderhistory')
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
    ordertracking,
    pdfmaker,
    addratings,
}