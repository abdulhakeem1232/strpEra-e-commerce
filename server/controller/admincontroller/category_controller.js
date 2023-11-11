const categoryModel=require('../../model/categoryModel')
const subcatModel=require('../../model/subcatModel')


const category=async(req,res)=>{
    try{
        const category=await categoryModel.find({})
        // console.log(user);
        res.render("admin/categories",{cat:category})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const newcat=async(req,res)=>{
    try{
        
        res.render("admin/addcatgories",{expressFlash: req.flash('ecategory') })
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const addcategory=async(req,res)=>{
    try{
        const catName=req.body.categoryName
        const category= await categoryModel.findOne({name:catName})
        if(category){
            req.flash('ecategory', 'Category already existed');
            res.redirect('/admin/newcat');
        }
        else{
        const catdes=req.body.description
        await categoryModel.insertMany({name:catName,description:catdes})
        res.redirect('/admin/category')
        }
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }

}
const updatecat=async(req,res)=>{
    try{
        const id=req.params.id
        const cat=await categoryModel.findOne({_id:id})
        res.render('admin/updatecat',{itemcat:cat})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const updatecategory=async(req,res)=>{
    try{
        const id=req.params.id
        const catName=req.body.categoryName
        const catdes=req.body.description
        await categoryModel.updateOne({_id:id},{$set:{name:catName,description:catdes}})
        res.redirect('/admin/category')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }

}
const subcategory=async(req,res)=>{
    try{
        const s_category=await subcatModel.find({}).populate({
            path: 'p_category',
            select: 'name'
        });
    //   console.log(s_category);
        res.render("admin/subcategories",{cat:s_category})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const newsubcat=async(req,res)=>{
    try{
        const pcat=await categoryModel.find()
        res.render("admin/addsubcat",{p_cat:pcat})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const updatesubcat=async(req,res)=>{
    try{
        const id=req.params.id
        const cat=await subcatModel.findOne({_id:id})
        const pcat=await categoryModel.find()
        res.render('admin/updatesubcat',{itemcat:cat,p_cat:pcat})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const addsubcategory=async(req,res)=>{
    try{
        const catName=req.body.categoryName
        const p_cat=req.body.parentCategory
        const catdes=req.body.description
        await subcatModel.insertMany({name:catName,description:catdes, p_category:p_cat})
        res.redirect('/admin/subcategory')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const catstatus=async(req,res)=>{
    try{
        const id = req.params.id; 
        const category =await subcatModel.findOne({_id:id}); 
        // console.log(category);
        if (!category) {
            return res.status(404).json({ message: 'category not found' });
        }
        category.status = !category.status;
        await category.save();
        // console.log(category);
        res.redirect('/admin/subcategory')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const deletesubcat=async(req,res)=>{
    try{
        const id = req.params.id; 
        const category=await subcatModel.deleteOne({_id:id})
        res.redirect('/admin/subcategory')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const updatesubcategory=async(req,res)=>{
    try{
        const id=req.params.id
        const catName=req.body.categoryName
        const catdes=req.body.description
        const pcat=req.body.parentCategory
        await subcatModel.updateOne({_id:id},{$set:{name:catName,description:catdes,p_category:pcat}})
        res.redirect('/admin/subcategory')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }

}

module.exports={
    category,
    newcat,
    addcategory,
    updatecat,
    updatecategory,
    subcategory,
    newsubcat,
    addsubcategory,
    catstatus,
    deletesubcat,
    updatesubcat,
    updatesubcategory,
}