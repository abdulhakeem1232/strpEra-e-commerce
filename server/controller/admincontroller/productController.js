const fs=require('fs')
const path=require('path')
const productModel = require('../../model/productModel')
const categoryModel = require('../../model/categoryModel')
const subcatModel = require('../../model/subcatModel')

const products = async (req, res) => {
    try {
        const product = await productModel.find({}).populate({
            path: 'category',
            select: 'name'
        }).populate({
            path: 'sub_category',
            select: 'name'
        });
        res.render("admin/product", { product: product })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const newproduct = async (req, res) => {
    try {
        const category = await categoryModel.find()
        const subcat = await subcatModel.find().populate('p_category');

        const subcatData = subcat.map(item => ({ _id: item._id, parentCategoryId: item.p_category, subcategoryName: item.name }));


        console.log("Categories:", category);
        console.log("Subcategories:", subcat);
        console.log("SubcatData:", JSON.stringify(subcatData));

        res.render('admin/newproduct', { category: category, subcat: subcat, subcatData: JSON.stringify(subcatData) })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const addproduct = async (req, res) => {
    try {
        const { productName,parentCategory, subCategory, images, s6, s7, s8, s9,price, description } = req.body
        const newproduct = new productModel({
            name: productName,
            category: parentCategory,
            sub_category: subCategory,
            price: price,
            images: req.files.map(file => file.path),
            stock: [{
                size: "6",
                quantity: s6,
            },
            {
                size: "7",
                quantity: s7,
            },
            {
                size: "8",
                quantity: s8,
            },
            {
                size: "9",
                quantity: s9,
            },
            ],
            description: description
        })

        await newproduct.save()
        res.redirect('/admin/products')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}
const unlist = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findOne({ _id: id });
        // console.log(category);

        product.status = !product.status;
        await product.save();
        // console.log(category);
        res.redirect('/admin/products')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}
const delet = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.deleteOne({ _id: id })
        res.redirect('/admin/products')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}
const updatepro = async (req, res) => {
    try {
        const id = req.params.id
        const product = await productModel.findOne({ _id: id });
        // console.log(product);
        res.render('admin/updateproduct', { product: product })
    } catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}
const updateproduct = async (req, res) => {
    try {
        const id = req.params.id
        const { productName,s6, s7, s8, s9,productprice,description } = req.body
        const product=await productModel.findOne({_id:id})
        product.name = productName;
        product.price = productprice;
        product.stock = [
            { size: '6', quantity: s6 },
            { size: '7', quantity: s7 },
            { size: '8', quantity: s8 },
            { size: '9', quantity: s9 }
        ];
        product.description = description;

        await product.save()
        res.redirect('/admin/products')
    } catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}
const editimg = async (req, res) => {
    try {
        const id = req.params.id
        const product=await productModel.findOne({_id:id})
        res.render('admin/editimg', { product: product })
    } catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}
const updateimg=async(req,res)=>{
    try{
     const id=req.params.id
     const newimg=req.files.map(file => file.path)
     const product=await productModel.findOne({_id:id})
     product.images.push(...newimg)
     product.save()
     res.redirect('/admin/products')
    }
    catch (err) {
        console.log(err);
        res.send("Error while adding images")
    }
}
const deleteimg=async(req,res)=>{
    try{
        const pid=req.query.pid
        const filename=req.query.filename
        const imagePath=path.join('uploads',filename)

        if(fs.existsSync(filename))
        {

        
        try{
            fs.unlinkSync(filename)
            console.log("Image deleted");
            res.redirect('/admin/products')

            await productModel.updateOne(
                { _id: pid },
                { $pull: { images: filename } } 
              );
        
    
        }
        catch(err){
            console.log("error deleting image:",err);
            res.status(500).send('Internal Server Error');
        }

    }
    else{
        console.log("Image not found");
    }
}
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}



module.exports = {
    products,
    newproduct,
    addproduct,
    unlist,
    delet,
    updatepro,
    deleteimg,
    editimg,
    updateimg,
    updateproduct,

}