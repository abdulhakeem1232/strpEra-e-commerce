const addressModel = require('../../model/addressModel');
const cartModel=require('../../model/cartModel');
const orderModel = require('../../model/orderModel');
const productModel= require('../../model/productModel')
const Razorpay=require('razorpay')
const {key_id,key_secret}=require('../../../env')
var instance = new Razorpay({key_id:key_id, key_secret:key_secret})


const checkout=async(req,res)=>{
    try{
        const userId=req.session.userId;
        // console.log(userId);
        const address=await addressModel.findOne({userId:userId})
        const data=await cartModel.findOne({userId:userId}).populate({
            path:'item.productId',
            select:'name'
        })
        res.render('user/checkout',{data:data,address:address})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}
const order=async(req,res)=>{
    try{
        const {address,paymentMethod}=req.body
        const userId=req.session.userId
        const cart=await cartModel.findOne({userId:userId})
        // console.log(req.body);
       
        // console.log(address);
        // console.log(paymentMethod);
        const useraddress=await addressModel.findOne({userId:userId})
        // console.log("11",useraddress);
        const selectedaddress=useraddress.address[address]
        // console.log("hi");
        // console.log("11",useraddress);
        // console.log("22",selectedaddress);
        const items=cart.item.map(item=>({
            productId:item.productId,
            quantity:item.quantity,
            size:item.size,
            price:item.price,
        }))

        for(const item of items){
            const product =await productModel.findOne({_id:item.productId})

            const size=product.stock.findIndex(size=>size.size ==item.size)
            product.stock[size].quantity -=item.quantity
            await product.save()
        }

        const order=new orderModel({
            userId:userId,
            items:items,
            amount:cart.total,
            payment:paymentMethod,
            address:selectedaddress,
            createdAt:new Date(),
            updated:new Date()
        })
        cart.item=[]
        cart.total=0


       const savedOrder= await order.save()
        await cart.save()
        const orderconfirmation= await orderModel.findOne({orderId:savedOrder.orderId}).populate({
            path:'items.productId',
            select:'name'
        })

       res.render('user/confirmation',{order:orderconfirmation})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const orders=async(req,res)=>{
    try{
        const userId=req.session.userId;
        // console.log(userId);
        const order=await orderModel.find({userId:userId}).populate({
            path:'items.productId',
            select:'name images'
        })
        // console.log(order);
        res.render('user/orderHistory',{orders:order})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const ordercancelling=async(req,res)=>{
    try{
       const id= req.params.id
       const update=await orderModel.updateOne({_id:id},{status:"Cancelled"})
       const result=await orderModel.findOne({_id:id})
    //    console.log("result",result);
       const items=result.items.map(item=>({
        productId:item.productId,
        quantity:item.quantity,
        size:item.size,
        
    }))

    for(const item of items){
        const product =await productModel.findOne({_id:item.productId})

        const size=product.stock.findIndex(size=>size.size ==item.size)
        product.stock[size].quantity +=item.quantity
        await product.save()
    }
       res.redirect("/orderhistory")

    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const upi=async(req,res)=>{
console.log('body:',req.body);
var options={
    amount:req.body.amount,
    currency:"INR",
    receipt:"order_rcpt"
};
instance.orders.create(options,function(err,order){
    console.log("order1 :",order);
    res.send({orderId:order.id})
})
}




module.exports={
    checkout,
    order,
    orders,
    ordercancelling,
    upi,
}