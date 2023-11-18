const cartModel=require('../../model/cartModel')


const checkout=async(req,res)=>{
    try{
        const userId=req.session.userId;
        console.log(userId);
        const data=await cartModel.findOne({userId:userId}).populate({
            path:'item.productId',
            select:'name'
        })
        res.render('user/checkout',{data:data})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}




module.exports={
    checkout,
}