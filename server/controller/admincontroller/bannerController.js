const bannerModel=require('../../model/bannerModel')
const path=require('path')



const banner=async(req,res)=>{
    try{
        const banner=await bannerModel.find({})
        res.render("admin/banner",{banner:banner})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const newbanner=async(req,res)=>{
    try{
        
        res.render("admin/newbanner")
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const addbanner=async(req,res)=>{
    try {
        const { title, subtitle } = req.body;

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imagePath = req.file.path;

        const newbanner = new bannerModel({
            title: title,
            subtitle: subtitle,
            image: imagePath,
        });

        await newbanner.save();
        res.redirect('/admin/banner');
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const unlist = async (req, res) => {
    try {
        const id = req.params.id;
        const banner = await bannerModel.findOne({ _id: id });
        

        banner.active = !banner.active;
        await banner.save();
    
        res.redirect('/admin/banner')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const updatebanner= async (req, res) => {
    try {
        const id = req.params.id;
        const banner = await bannerModel.findOne({ _id: id });
    
        res.render('admin/updatebanner',{banner:banner})
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const updatebanners= async (req, res) => {
    try {
        const id = req.params.id;
        const {title,subtitle}=req.body
        const banner= await bannerModel.findOne({_id:id})
        banner.title=title;
        banner.subtitle=subtitle;
        await banner.save();

        res.redirect('/admin/banner')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}



module.exports={
    banner,
    newbanner,
    addbanner,
    unlist,
    updatebanner,
    updatebanners,
}