const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const flash=require('express-flash')
const userModel= require('../../model/userModel.js')
const categoryModel= require('../../model/categoryModel.js')
const subcatModel= require('../../model/subcatModel.js')
const userotp= require('../../model/userotpModel.js')
const { EMAIL,PASSWORD} = require('../../../env.js')
const{passwordValid,confirmpasswordValid}=require('../../../utils/validators/signupValidators.js')


const login = async (req,res) => {
    try {
        res.render('admin/alogin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const aloginpost=async(req,res)=> {
    try{
        const email=req.body.email
        const user=await userModel.findOne({email:email})
        const passwordmatch=await bcrypt.compare(req.body.password,user.password)
        console.log(user);
        if(passwordmatch && user.isAdmin){
            console.log("getin");
            req.session.isAuth = true;
            res.redirect('/admin/dashboard');
            
        }
        else{
            // req.flash('passworderror','invalid password')
            // res.redirect('/login')
            console.log("get");
            res.render("admin/alogin",{passworderror:"Invalid-password"} )
            // res.send("password")
        }
    }
    catch{
        // req.flash('emailerror','invalid e-mail')
        // res.redirect('/login')
        console.log("gettt");
        res.render("admin/alogin",{emailerror:"Invalid-email"})
        // res.send("email")
    }
}

const dashboard=async(req,res)=>{
    try{
        res.render("admin/dashboard")
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const customer=async(req,res)=>{
    try{
        const user=await userModel.find({})
        // console.log(user);
        res.render("admin/customer",{users:user})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const userupdate=async(req,res)=>{
    try{
        const email = req.params.email; 
        const user =await userModel.findOne({email:email}); 
    
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = !user.status;
        await user.save();
        res.redirect('/admin/customer')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const searchUser=async(req,res)=>{
    try{
        const searchName= req.body.search
        const data = await userModel.find({
            $or: [
                { f_name: { $regex: new RegExp(`^${searchName}`, 'i') } },
                { l_name: { $regex: new RegExp(`^${searchName}`, 'i') } }
            ]
        });
        req.session.searchUser=data
        res.redirect('/admin/searchview')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const searchview=async(req,res)=>{
    try {
        const user = req.session.searchUser
        res.render('admin/customer',{users:user})
      }
    catch(err){
      console.log(err);
      res.send("Error Occured")
    }

}
const filter=async(req,res)=>{
    try {
        const option = req.params.option
        if(option==='A-Z'){
            user=await userModel.find().sort({f_name:1})
        }
        else if(option==='Z-A'){
            user=await userModel.find().sort({f_name:-1})
        }
        else if(option==='Blocked'){
            user=await userModel.find({status:true})
        }
        else{
            user=await userModel.find()
        }
        res.render('admin/customer',{users:user})
      }
    catch(err){
      console.log(err);
      res.send("Error Occured")
    }

}



module.exports = {
    login,
    aloginpost,
    dashboard,
    customer,
    userupdate,
    searchUser,
    searchview,
    filter,
    

    
}
