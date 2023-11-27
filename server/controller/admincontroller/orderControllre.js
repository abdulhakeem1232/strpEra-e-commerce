const orderModel= require('../../model/orderModel')


const order=async(req,res)=>{
    try{
        const order=await orderModel.find({}).sort({createdAt:-1}).populate({
            path:'items.productId',
            select:'name'
        })
        // console.log(user);
        res.render("admin/order",{order:order})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const orderstatus=async(req,res)=>{
    try{
        const {orderId,status}=req.body
        console.log("id",orderId)
        console.log("status",status);
        const updateOrder=await orderModel.updateOne({_id:orderId},{status:status})
        console.log(updateOrder);
        res.redirect('/admin/order')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}








module.exports={
    order,
    orderstatus,
}