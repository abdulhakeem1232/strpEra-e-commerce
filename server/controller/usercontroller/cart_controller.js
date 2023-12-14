const productModel = require('../../model/productModel');
const cartModel = require('./../../model/cartModel')


const addTocart = async (req, res) => {
    
    const selectedSize = req.body.size;
    const pid = req.params.pid
    const product = await productModel.findOne({ _id: pid })
    const userId = req.session.userId;
    const price = product.price
    const quantity = 1
    const stock = await productModel.findOne({ _id: pid, "stock.size": selectedSize });
    const selectedStock = stock.stock.find(item => item.size == selectedSize);
    console.log("selectedstock",selectedStock);
   
    if (selectedStock.quantity == 0) {
        res.redirect('/showcart')
    }
    else{
    
    
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
    

    if (productExist !== -1) {
        cart.item[productExist].quantity += 1
        cart.item[productExist].total = cart.item[productExist].quantity * price
    }
    else {
        const newItem = {
            productId: pid,
            stock:selectedStock.quantity,
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
      
    
      
      
        await cart.save()
        res.redirect('/showcart')
}
}

const showcart=async(req,res)=>{
    try {
        const userId = req.session.userId
        const cart = await cartModel.findOne({ userId: userId }).populate({
            path: 'item.productId',
            select: 'name stock images'
        });
    
       
        const insufficientStock = [];
        for (const cartItem of cart.item) {
            const product = cartItem.productId;
           
            const size = product.stock.findIndex(s => s.size == cartItem.size);
            
    
            if ( product.stock[size].quantity < cartItem.quantity) {
                insufficientStock.push({
                    item: cartItem,
                    availableQuantity: size !== -1 ? product.stock[size].quantity : 0
                });
            }
        }
            res.render('user/cart', { cart: cart,insufficientStock });
    
    } catch (err) {
        res.redirect('/error')
        console.error(err);
    }
}

const deletecart=async(req,res)=>{
    try {
        const userId=req.session.userId
        const pid=req.params.id
        const size=req.params.size
        
        const result=await cartModel.updateOne({userId:userId},{$pull:{item:{_id:pid,size:size}}})
        
        const updatedCart = await cartModel.findOne({ userId: userId });
        const newTotal = updatedCart.item.reduce((acc, item) => acc + item.total, 0);
        updatedCart.total = newTotal;
        await updatedCart.save();
       res.redirect('/showcart')
    }
    catch(err) {
        console.log(err);
        res.redirect('/error')

    }
}
const updatecart=async(req,res)=>{
    try {
        const { productId, size } = req.params;
        const { action,cartId } = req.body;
        const cart=await cartModel.findOne({_id:cartId})
        ; 
        const itemIndex = cart.item.findIndex(item => item._id == productId && item.size == size);
        const currentQuantity = cart.item[itemIndex].quantity;
        const stockLimit = cart.item[itemIndex].stock;
        const price = cart.item[itemIndex].price;
        const opid=cart.item[itemIndex].productId
        const product= await productModel.findOne({_id:opid})
        const selectedinfo=product.stock.findIndex(stock=>stock.size==size)
        const stockLimit2=product.stock[selectedinfo].quantity;

        
        
        let updatedQuantity;

    if (action == '1') {
        console.log("1");
      updatedQuantity = currentQuantity + 1;
    } else if (action == '-1') {
        console.log("-1");
      updatedQuantity = currentQuantity - 1;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    if ( updatedQuantity > stockLimit2 && action=='1') {
        return res.status(400).json({ success: false, error: 'Quantity exceeds stock limits' });
    } else if (updatedQuantity == 0) {
        return res.status(400).json({ success: false, error: 'Quantity cannot be zero' });
    }
    

      cart.item[itemIndex].quantity = updatedQuantity;
      

      
      const newProductTotal = price * updatedQuantity;
      cart.item[itemIndex].total=newProductTotal
     await cart.save()
      const total = cart.item.reduce((acc, item) => acc + item.total, 0);
      cart.total=total
          await cart.save();
      
      
      res.json({
        success: true,
        newQuantity: updatedQuantity,
        newProductTotal,
        total: total,
      });


    }catch (error) {
        console.error('Error updating cart quantity:', error);
        res.redirect('/error')
      }
      
}










module.exports = {
    addTocart,
    showcart,
    deletecart,
    updatecart,
}