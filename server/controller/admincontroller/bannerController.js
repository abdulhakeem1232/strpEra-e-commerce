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




module.exports={
    banner,
    newbanner,
    addbanner,
}