const productModel = require('../../model/productModel');
const cartModel = require('./../../model/cartModel')


const addTocart = async (req, res) => {
    console.log("hi");
    const selectedSize = req.body.size;
    console.log(selectedSize);
    const pid = req.params.pid
    const product = await productModel.findOne({ _id: pid })
    console.log("userid:", req.session.userId);
    const userId = req.session.userId;
    // console.log("sessionid:", req.session.id);
    // console.log("productid:", pid);
    const price = product.price
    const quantity = 1
    // console.log("price:", product.price);
    const stock = await productModel.findOne({ _id: pid, "stock.size": selectedSize });
    // console.log("whole",stock);
    const selectedStock = stock.stock.find(item => item.size == selectedSize);
    // console.log("selectedstock",selectedStock);
    // console.log("stock",selectedStock.quantity);
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
    // console.log(productExist);

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
      
    //   console.log(cart.total);
      
      
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
        const size=req.params.size
        // console.log('Deleting item:', { userId, pid });
        const result=await cartModel.updateOne({userId:userId},{$pull:{item:{_id:pid,size:size}}})
        // console.log('Update result:', result);
        const updatedCart = await cartModel.findOne({ userId: userId });
        const newTotal = updatedCart.item.reduce((acc, item) => acc + item.total, 0);
        updatedCart.total = newTotal;
        await updatedCart.save();
       res.redirect('/showcart')
    }
    catch(err) {
        console.log(err);
        res.status(500).send('error occured')

    }
}
const updatecart=async(req,res)=>{
    try {
        // console.log("hi");
        // console.log('Received Request:', req.body);
        const { productId, size } = req.params;
        const { action,cartId } = req.body;
        const cart=await cartModel.findOne({_id:cartId})
        // console.log("cartId",cartId);
        // console.log("cart",cart);
        // console.log(productId,size); 
        const itemIndex = cart.item.findIndex(item => item._id == productId && item.size == size);


        // console.log("itemIndex",itemIndex);
        // console.log(cart.item[itemIndex].quantity);
        // console.log(cart.item[itemIndex].stock);
        // console.log(cart.item[itemIndex].price);
        const currentQuantity = cart.item[itemIndex].quantity;
        const stockLimit = cart.item[itemIndex].stock;
        const price = cart.item[itemIndex].price;
        const opid=cart.item[itemIndex].productId

        // console.log('poid:',productId)
        // console.log('size:',size);
        const product= await productModel.findOne({_id:opid})
        // console.log("produbeba",product);
        const selectedinfo=product.stock.findIndex(stock=>stock.size==size)
        // console.log('fweuf',selectedinfo);
        const stockLimit2=product.stock[selectedinfo].quantity;
        // console.log(stockLimit2,"ehqfiweh");

        
        
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

    if ( updatedQuantity > stockLimit2) {
        return res.status(400).json({ success: false, error: 'Quantity exceeds stock limits' });
    } else if (updatedQuantity == 0) {
        return res.status(400).json({ success: false, error: 'Quantity cannot be zero' });
    }
    

      cart.item[itemIndex].quantity = updatedQuantity;
      

      // Calculate the new total for the specific product
      const newProductTotal = price * updatedQuantity;
      cart.item[itemIndex].total=newProductTotal
     await cart.save()
      const total = cart.item.reduce((acc, item) => acc + item.total, 0);
    //   console.log("total",total);
      cart.total=total
        //  cart.total = cart.item.reduce((total, item) => total + item.quantity * item.productId.price, 0);
          await cart.save();
      
      
      res.json({
        success: true,
        newQuantity: updatedQuantity,
        newProductTotal,
        total: total,
      });


    }catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
      
}










module.exports = {
    addTocart,
    showcart,
    deletecart,
    updatecart,
}