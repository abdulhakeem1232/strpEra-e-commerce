const productModel = require('../../model/productModel');
const cartModel = require('./../../model/cartModel')


const addToCart = async (req, res) => {
    const selectedSize = req.body.size;
    console.log(selectedSize);
    const pid = req.params.pid
    const product = await productModel.findOne({ _id: pid })
    console.log("userid:", req.session.userId);
    const userId = req.session.userId;
    console.log("sessionid:", req.session.id);
    console.log("productid:", pid);
    const price = product.price
    const quantity = 1
    console.log("price:", product.price);
    let cart
    if (userId) {
        cart = await cartModel.findOne({ userId: userId })
        
    }
    if (!cart) {
        cart = await cartModel.findOne({ sessionId: req.session.id })
    }
    if (!cart) {
        cart = new cartModel({
            sessionId: req.session.id,
            item: [],
            total: 0,
        })


    }
    const productExist = cart.item.findIndex(item => item.productId == pid && item.size === selectedSize)
    console.log(productExist);

    if (productExist !== -1) {
        cart.item[productExist].quantity += 1
        cart.item[productExist].total = cart.item[productExist].quantity * price
    }
    else {
        const newItem = {
            productId: pid,
            size: selectedSize,
            quantity: quantity,
            price: price,
            total: quantity * price
        }
        cart.item.push(newItem)
    }
    if(userId && !cart.userId){
        cart.userId=userId
    }
    let total=0
    cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);
      
      console.log(cart.total);
      
      
        await cart.save()
        res.redirect('/showcart')
}

const showcart=async(req,res)=>{
    try {
        const userId=req.session.userId
        const cart=await cartModel.findOne({userId:userId}).populate({
            path:'item.productId',
            select:'images name',
        })
        res.render('user/cart.ejs',{cart:cart})
    }
    catch(err) {
        console.log(err);
        res.status(500).send('error occured')

    }
}

const deletecart=async(req,res)=>{
    try {
        const userId=req.session.userId
        const pid=req.params.id
        console.log('Deleting item:', { userId, pid });
        const result=await cartModel.updateOne({userId:userId},{$pull:{item:{_id:pid}}})
        console.log('Update result:', result);
       res.redirect('/showcart')
    }
    catch(err) {
        console.log(err);
        res.status(500).send('error occured')

    }
}










module.exports = {
    addToCart,
    showcart,
    deletecart
}