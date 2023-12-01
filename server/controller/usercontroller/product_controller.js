const categoryModel = require('../../model/categoryModel')
const productModel=require('./../../model/productModel')
const subcategoryModel=require('./../../model/subcatModel')



const shopping=async(req,res)=>{
    try{
        const id=req.params.id
        req.session.category=id
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
        req.session.category=sid
        const product=await productModel.find({$and:[{category:pid},{sub_category:sid},{status:true}]})
        const sub_category=await subcategoryModel.find({p_category:pid}) 
        res.render('user/shop',{product:product,subcategory:sub_category})
    }
    catch(err){
        console.log("Shopping Page Error:",err);
        res.status(500).send('Internal Server Error');
    }

}

const sortproducts=async(req,res)=>{
    try{
        const sort=req.params.sort
        console.log("fwei");
        const id=req.session.category
        const product=await productModel.find({$and:[{$or:[{category:id},{sub_category:id}]},{status:true}]}).sort({price:sort})
        console.log("wbefbwedkc",product);
        const pid=product[0].category
        const sub_category=await subcategoryModel.find({p_category:pid}) 
        res.render('user/shop',{product:product,subcategory:sub_category})
    }
    catch(err){
        console.log("Shopping Page Error:",err);
        res.status(500).send('Internal Server Error');
    }

}

const search=async(req,res)=>{
    try{
        const search=req.body.search
        const cat = await categoryModel.findOne({ name: { $regex: new RegExp(`^${search}`, 'i') } });
        const id=cat._id
        const product=await productModel.find({category:id})
        const sub_category=await subcategoryModel.find({p_category:id})
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
    sortproducts,
    search,
}