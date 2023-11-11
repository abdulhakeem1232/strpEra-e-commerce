const productModel=require('./../../model/productModel')
const subcategoryModel=require('./../../model/subcatModel')



const shopping=async(req,res)=>{
    try{
        const id=req.params.id
        const product=await productModel.find({$and:[{category:id},{status:true}]})
        const sub_category=await subcategoryModel.find({p_category:id}) 
        res.render('user/shop',{product:product,subcategory:sub_category})
    }
    catch(err){
        console.log("Shopping Page Error:",err);
        res.status(500).send('Internal Server Error');
    }

}
const subshopping=async(req,res)=>{
    try{
        const pid=req.params.pid
        const sid=req.params.sid
        const product=await productModel.find({$and:[{category:pid},{sub_category:sid},{status:true}]})
        const sub_category=await subcategoryModel.find({p_category:pid}) 
        res.render('user/shop',{product:product,subcategory:sub_category})
    }
    catch(err){
        console.log("Shopping Page Error:",err);
        res.status(500).send('Internal Server Error');
    }

}
const singleproduct=async(req,res)=>{
    try{
        const id=req.params.id
        const product=await productModel.findOne({_id:id}) 
        product.images = product.images.map(image => image.replace(/\\/g, '/'));
        // console.log('Image Path:', product.images[0]);
        res.render('user/singleproduct',{product:product})
    }
    catch(err){
        console.log("Shopping Page Error:",err);
        res.status(500).send('Internal Server Error');
    }

}


module.exports={
    shopping,
    subshopping,
    singleproduct,
}