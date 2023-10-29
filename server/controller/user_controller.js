const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const userModel = require('../model/userModel.js')
const userotp = require('../model/userotpModel.js')
const { EMAIL, PASSWORD } = require('../../env.js')
const { nameValid, emailValid, phoneValid, passwordValid, confirmpasswordValid } = require("../../utils/validators/signupValidators.js")




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
const signup = async (req, res) => {
    try {
        res.render('user/signup.ejs')
    }
    catch {
        res.status(200).send('error occured')

    }
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
            req.session.user=user
            const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
            req.session.otp=otp
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
                subject: 'Sending Email using Node.js',
                text: 'That was easy!' + otp
            };

            transporter.sendMail(mailOptions);
            console.log(otp);
            const currentTimestamp = Date.now();
            const expiryTimestamp = currentTimestamp + 30 * 1000;
            await userotp.create({email:email,otp:otp,expiry:new Date(expiryTimestamp)}) 
            res.redirect('/otp')
        }
    }
    catch (err) {
        console.error('Error:', err);
        res.send('error')
    }
}

const otp=async(req,res)=>{
    try {
        res.render('user/otp.ejs')
    }
    catch {
        res.status(200).send('error occured')

    }

}
const verifyotp=async(req,res)=>{
    try {
        const enteredotp=req.body.otp
        // const generatedotp=req.session.otp
        const user=req.session.user
        const email=req.session.user.email
        console.log(enteredotp);
        // console.log(generatedotp);
        console.log(req.session.user);
        const userdb= await userotp.findOne({email:email})
        const otp=userdb.otp
        const expiry=userdb.expiry
        console.log(otp);
        if(enteredotp==otp && expiry.getTime() >= Date.now()){
           
           user.isVerified = true;
           try{
            await userModel.create(user)
            res.redirect('/')
           }
           catch(error){
            console.error(error);
                res.status(500).send('Error occurred while saving user data');
           }
        }
        else{
            res.status(400).send("Wrong OTP or Time Expired");
        }
    }
    catch (err){
        console.log(err);
        res.status(500).send('error occured')

    }

}


module.exports = {
    index,
    login,
    signup,
    regpost,
    otp,
    verifyotp
}