const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const flash=require('express-flash')
const userModel = require('../model/userModel.js')
const userotp = require('../model/userotpModel.js')
const productModel=require('../model/productModel.js')
const { EMAIL, PASSWORD } = require('../../env.js')
const { nameValid, emailValid, phoneValid, passwordValid, confirmpasswordValid } = require("../../utils/validators/signupValidators.js")
const subcategoryModel = require('../model/subcatModel.js')




const index = async (req, res) => {
    res.render('user/index.ejs')
}

const login = async (req, res) => {
    try {
        res.render('user/login.ejs')
    }
    catch {
        res.status(200).send('error occured')

    }
}

const loginpost=async(req,res)=> {
    try{
        const email=req.body.email
        const user=await userModel.findOne({email:email})
        const passwordmatch=await bcrypt.compare(req.body.password,user.password)
        if(passwordmatch && !user.status){
            req.session.isAuth = true;
            res.redirect('/');
        }
        else{
            // req.flash('passworderror','invalid password')
            // res.redirect('/login')
            res.render("user/login.ejs",{passworderror:"Invalid-password or you are blocked"} )
        }
    }
    catch{
        // req.flash('emailerror','invalid e-mail')
        // res.redirect('/login')
        res.render("user/login.ejs",{emailerror:"Invalid-email"})
    }
}

const signup = async (req, res) => {
    try {
        res.render('user/signup.ejs')
    }
    catch {
        res.status(200).send('error occured')

    }
}

const sendmail = async (email, otp) => {
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        });

        var mailOptions = {
            from: 'StepEra <StepEra@gmail.com>',
            to: email,
            subject: 'E-Mail Verification',
            text: 'Your OTP is:' + otp
        };

        transporter.sendMail(mailOptions);
        console.log("E-mail sent sucessfully");
    }
    catch (err) {
        console.log("error in sending mail:", err);
    }
}

const otpgenerator = () => {
    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    return otp
}

const regpost = async (req, res) => {
    try {
        const fname = req.body.fname
        const lname = req.body.lname
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const cpassword = req.body.confirm_password

        const isNameValid = nameValid(fname)
        const isEmailValid = emailValid(email)
        const isPhoneValid = phoneValid(phone)
        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)

        const emailExist = await userModel.findOne({ email: email })
        if (emailExist) {
            res.render('user/signup', { emailerror: "E-mail already exits" })
        }
        else if (!isEmailValid) {
            res.render('user/signup', { emailerror: "Enetr a valid E-mail" })
        }
        else if (!isNameValid) {
            res.render('user/signup', { nameerror: "Enetr a valid Name" })
        }
        else if (!isPhoneValid) {
            res.render('user/signup', { phoneerror: "Enetr a valid Phone Number" })
        }
        else if (!ispasswordValid) {
            res.render('user/signup', { passworderror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            res.render('user/signup', { cpassworderror: "Password and Confirm password should be match" })
        }
        else {
            const hashedpassword = await bcrypt.hash(password, 10)
            const user = new userModel({ f_name: fname, l_name: lname, email: email, phone_no: phone, password: hashedpassword })
            req.session.user = user
            req.session.signup = true
            req.session.forgot = false
            const otp = otpgenerator()
            console.log(otp);
            const currentTimestamp = Date.now();
            const expiryTimestamp = currentTimestamp + 60 * 1000;
            await userotp.create({ email: email, otp: otp, expiry: new Date(expiryTimestamp) })

            await sendmail(email, otp)
            res.redirect('/otp')
        }
    }
    catch (err) {
        console.error('Error:', err);
        res.send('error')
    }
}

const otp = async (req, res) => {
    try {
        res.render('user/otp.ejs')
    }
    catch {
        res.status(200).send('error occured')

    }

}

const verifyotp = async (req, res) => {
    try {
        const enteredotp = req.body.otp
        // const generatedotp=req.session.otp
        const user = req.session.user
       
        console.log(enteredotp);
        // console.log(generatedotp);
        console.log(req.session.user);
        const email = req.session.user.email
        const userdb = await userotp.findOne({ email: email })
        const otp = userdb.otp
        const expiry = userdb.expiry
        console.log(otp);
        if (enteredotp == otp && expiry.getTime() >= Date.now()) {

            user.isVerified = true;
            try {
                if(req.session.signup){
                await userModel.create(user)
                res.redirect('/')
                }
               else if(req.session.forgot){
                    res.redirect('/newpassword')
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Error occurred while saving user data');
            }
        }
        else {
            res.status(400).send("Wrong OTP or Time Expired");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send('error occured')

    }

}
const resendotp=async(req,res)=>{
    try{
    const email = req.session.user.email
    const otp = otpgenerator()
     console.log(otp);

     const currentTimestamp = Date.now();
     const expiryTimestamp = currentTimestamp + 60 * 1000;
     await userotp.updateOne({ email: email },{otp:otp,expiry:new Date(expiryTimestamp)})

     await sendmail(email, otp)

    }
    catch(err){
       console.log(err);
    }

}
const forgotpassword=async (req, res) => {
    try {
        res.render('user/forgot.ejs')
    }
    catch {
        res.status(200).send('error occured')

    }
}

const forgotpasswordpost=async (req, res) => {
    try {
        const email=req.body.email
        const emailexist= await userModel.findOne({email:email})
        req.session.id=emailexist._id
        console.log(emailexist);
        if(emailexist){
            req.session.forgot=true
            req.session.signup=false
            req.session.user = { email: email };
            const otp = otpgenerator()
            console.log(otp);
            const currentTimestamp = Date.now();
            const expiryTimestamp = currentTimestamp + 60 * 1000;
            await userotp.create({ email: email, otp: otp, expiry: new Date(expiryTimestamp) })

            await sendmail(email, otp)
            res.redirect('/otp')
        }
        else{
           res.render('user/forgot.ejs',{email:"E-Mail Not Exist"})
        }
    }
    catch(err) {
        res.status(400).send('error occurred: ' + err.message);
        console.log(err);

    }
}
const newpassword = async (req, res) => {
    try {
        res.render('user/newpassword.ejs')
    }
    catch {
        res.status(400).send('error occured')

    }
}

const resetpassword = async (req, res) => {
    try {
        const password = req.body.newPassword
        const cpassword = req.body.confirmPassword

        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)

         if (!ispasswordValid) {
            res.render('user/newpaasword', { perror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            res.render('user/newpassword', { cperror: "Password and Confirm password should be match" })
        }
        else{
            const hashedpassword = await bcrypt.hash(password, 10)
            const email = req.session.user.email;
            await userModel.updateOne({email:email},{password:hashedpassword})
            res.redirect('/login')

        }
    }
    catch {
        res.status(400).send('error occured')

    }
}

const shopping=async(req,res)=>{
    try{
        const id=req.params.id
        const product=await productModel.find({category:id})
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
        const product=await productModel.find({$and:[{category:pid},{sub_category:sid}]})
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
        console.log('Image Path:', product.images[0]);
        res.render('user/singleproduct',{product:product})
    }
    catch(err){
        console.log("Shopping Page Error:",err);
        res.status(500).send('Internal Server Error');
    }

}























module.exports = {
    index,
    login,
    signup,
    regpost,
    otp,
    verifyotp,
    resendotp,
    forgotpassword,
    forgotpasswordpost,
    loginpost,
    newpassword,
    resetpassword,
    shopping,
    subshopping,
    singleproduct,
}