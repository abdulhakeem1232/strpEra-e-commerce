const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer')
const userModel=require('../model/userModel.js')
const{nameValid,emailValid,phoneValid,passwordValid,confirmpasswordValid}=require("../../utils/validators/signupValidators.js")




const index=async(req,res)=>{
    res.render('user/index.ejs')
}
const login=async(req,res)=>{
    try{
        res.render('user/login.ejs')
        }
        catch{
            res.status(200).send('error occured')
    
        }
}
const signup= async(req,res)=>{
    try{
    res.render('user/signup.ejs')
    }
    catch{
        res.status(200).send('error occured')

    }
}
const regpost=async(req,res)=>{
    try{
        const fname=req.body.fname
        const lname=req.body.lname
        const email=req.body.email
        const phone=req.body.phone
        const password=req.body.password
        const cpassword=req.body.confirm_password

        const isNameValid=nameValid(fname)
        const isEmailValid=emailValid(email)
        const isPhoneValid=phoneValid(phone)
        const ispasswordValid=passwordValid(password)
        const iscpasswordValid=confirmpasswordValid(cpassword,password)

        const emailExist=await userModel.findOne({email:email})
        if(emailExist){
            res.render('user/signup',{emailerror:"E-mail already exits"})
        }
        else if(!isEmailValid){
            res.render('user/signup',{emailerror:"Enetr a valid E-mail"})
        }
        else if(!isNameValid){
            res.render('user/signup',{nameerror:"Enetr a valid Name"})
        }
        else if(!isPhoneValid){
            res.render('user/signup',{phoneerror:"Enetr a valid Phone Number"})
        }
        else if(!ispasswordValid){
            res.render('user/signup',{passworderror:"Password should contain one uppercase,one lowercase,one number,one special charecter"})
        }
        else if(!iscpasswordValid){
            res.render('user/signup',{cpassworderror:"Password and Confirm password should be match"})
        }
        else{
            const hashedpassword=await bcrypt.hash(password,10)
            const user=new userModel({f_name:fname,l_name:lname,email:email,phone_no:phone,password:hashedpassword})
            await user.save();
            res.redirect('/')
        }
       
        
    }
    catch (err) {
        console.error('Error:', err);
        res.send('error')
}

}










module.exports={
    index,
    login,
    signup,
    regpost
}