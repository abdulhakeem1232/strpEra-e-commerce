const bannerModel = require('../../model/bannerModel')
const path = require('path')
const categoryModel = require('../../model/categoryModel')



const banner = async (req, res) => {
    try {
        const banner = await bannerModel.find({})
        res.render("admin/banner", { banner: banner })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const newbanner = async (req, res) => {
    try {
        const category = await categoryModel.find()
        res.render("admin/newbanner", { category })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const addbanner = async (req, res) => {
    try {
        const { title, subtitle, type, url } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imagePath = req.file.path;

        const newbanner = new bannerModel({
            title: title,
            subtitle: subtitle,
            type: type,
            url: url,
            image: imagePath,
        });

        await newbanner.save();
        res.redirect('/admin/banner');
    }
    catch (err) {
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

const updatebanner = async (req, res) => {
    try {
        const id = req.params.id;
        const banner = await bannerModel.findOne({ _id: id });
        res.render('admin/updatebanner', { banner: banner })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const updatebanners = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, subtitle } = req.body
        const banner = await bannerModel.findOne({ _id: id })
        banner.title = title;
        banner.subtitle = subtitle;
        await banner.save();
        res.redirect('/admin/banner')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}



module.exports = {
    banner,
    newbanner,
    addbanner,
    unlist,
    updatebanner,
    updatebanners,
}