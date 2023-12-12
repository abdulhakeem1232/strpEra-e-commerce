const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const flash=require('express-flash')
const userModel = require('../../model/userModel.js')
const userotp = require('../../model/userotpModel.js')
const productModel=require('../../model/productModel.js')
const { EMAIL, PASSWORD } = require('../../../env.js')
const { nameValid, emailValid, phoneValid, passwordValid, confirmpasswordValid } = require("../../../utils/validators/signupValidators.js")
const subcategoryModel = require('../../model/subcatModel.js')
const addressModel=require('./../../model/addressModel.js')
const walletModel = require('../../model/walletModel.js')
const bannerModel=require('../../model/bannerModel.js')
const Razorpay=require('razorpay')
const { key_id, key_secret } = require('../../../env');


const error=async(req,res)=>{
    res.render('user/error')
}

const index = async (req, res) => {
    const isAuth = req.session.isAuth || false;
    const banner=await bannerModel.find({active:true})
    res.render('user/index.ejs',{ isAuth,banner:banner })
}

const login = async (req, res) => {
    try {
        res.render('user/login.ejs', {
            expressFlash: {
              passworderror: req.flash('passworderror'),
              emailerror: req.flash('emailerror')
            }
          })
    }
    catch {
        res.redirect('/error')

    }
}

const loginpost=async(req,res)=> {
    try{
        const email=req.body.email
        const user=await userModel.findOne({email:email})
        const passwordmatch=await bcrypt.compare(req.body.password,user.password)
        if(passwordmatch && !user.status){
            user.session=req.session.id
            console.log(user.session);
            user.save()
            req.session.isAuth = true;
            req.session.userId = user._id;
            res.redirect('/');
        }
        else{
            req.flash('passworderror','invalid password Or you are Blocked')
            res.redirect('/login')
            // res.render("user/login.ejs",{passworderror:"Invalid-password or you are blocked"} )
        }
    }
    catch{
        req.flash('emailerror','invalid e-mail')
        res.redirect('/login')
        // res.render("user/login.ejs",{emailerror:"Invalid-email"})
    }
}

const signup = async (req, res) => {
    try {
        res.render('user/signup.ejs',{
            expressFlash: {
                emailerror: req.flash('emailerror'),
                nameerror: req.flash('nameerror'),
                phoneerror: req.flash('phoneerror'),
                passworderror: req.flash('passworderror'),
                cpassworderror: req.flash('cpassworderror')
            }
          })
    }
    catch {
        res.redirect('/error')
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
            // res.render('user/signup', { emailerror: "E-mail already exits" })
            req.flash('emailerror','E-mail already Exist')
            res.redirect('/reg')
        }
        else if (!isEmailValid) {
            req.flash('emailerror','Enter a valid E-mail')
            res.redirect('/reg')
            // res.render('user/signup', { emailerror: "Enetr a valid E-mail" })
        }
        else if (!isNameValid) {
            req.flash('nameerror','Enter a valid Name')
            res.redirect('/reg')
            // res.render('user/signup', { nameerror: "Enetr a valid Name" })
        }
        else if (!isPhoneValid) {
            req.flash('phoneerror','Enter a valid Phone Number')
            res.redirect('/reg')
            // res.render('user/signup', { phoneerror: "Enetr a valid Phone Number" })
        }
        else if (!ispasswordValid) {
            req.flash('passworderror','Password should contain one uppercase,one lowercase,one number,one special charecter')
            res.redirect('/reg')
            // res.render('user/signup', { passworderror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            req.flash('cpassworderror','Password and Confirm password should be match')
            res.redirect('/reg')
            // res.render('user/signup', { cpassworderror: "Password and Confirm password should be match" })
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
            const expiryTimestamp = currentTimestamp + 45 * 1000;
            await userotp.create({ email: email, otp: otp, expiry: new Date(expiryTimestamp) })
            req.session.email=email;
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
        const otp=await userotp.findOne({email:req.session.email}) 
        req.session.otpExpiration = new Date().getTime() + 45 * 1000;
        res.render('user/otp.ejs',{
            expressFlash: {
              otperror: req.flash('otperror'),
            },
            otp:otp
         })
    }
    catch {
        res.redirect('/error')

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
                req.session.isAuth = true;
                req.session.signup=false
                req.session.userId = user._id;
                res.redirect('/')
                }
               else if(req.session.forgot){
                req.session.forgot=false;
                    res.redirect('/newpassword')
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).redirect('/error');
            }
        }
        else {
            // res.status(402).send("Wrong OTP or Time Expired");
            req.flash('otperror','Invalid OTP or Time Expired')
            res.redirect('/otp')
        }
    }
    catch (err) {
        console.log(err);
        res.redirect('/error')

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
       res.redirect('/error')
    }

}
const forgotpassword=async (req, res) => {
    try {
        res.render('user/forgot.ejs')
    }
    catch {
        res.redirect('/error')

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
        res.redirect('/error')
        console.log(err);

    }
}
const newpassword = async (req, res) => {
    try {
        res.render('user/newpassword.ejs',{
            perror:req.flash('perror'),
            cperror:req.flash('cperror')
        })
    }
    catch {
        res.redirect('/error')

    }
}

const resetpassword = async (req, res) => {
    try {
        const password = req.body.newPassword
        const cpassword = req.body.confirmPassword

        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)

         if (!ispasswordValid) {
            req.flash('perror','Password should contain one uppercase,one lowercase,one number,one special charecter')
            res.redirect('/newpassword')
        }
        else if (!iscpasswordValid) {
         req.flash('cperror','Password and Confirm password should be match')
            res.redirect('/newpassword')
        }
        else{
            const hashedpassword = await bcrypt.hash(password, 10)
            const email = req.session.user.email;
            await userModel.updateOne({email:email},{password:hashedpassword})
            res.redirect('/login')

        }
    }
    catch {
        res.redirect('/error')

    }
}

const logout=async(req,res)=>{
    req.session.isAuth=false;
    req.session.userId = null;
    req.session.destroy();
    res.redirect('/')
}

const profile=async(req,res)=>{
    try{
        const userId=req.session.userId
        console.log("id",userId);
        const data=await userModel.findOne({_id:userId})
        console.log("data",data);
        res.render('user/profile',{userData:data,expressFlash: req.flash('success')} )
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}
const profileEdit=async(req,res)=>{
    try{
        const userId=req.session.userId
        console.log("id",userId);
        const data=await userModel.findOne({_id:userId})
        console.log("data",data);
        res.render('user/editProfile',{userData:data})
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}
const profileUpdate=async(req,res)=>{
    try{
        const {fname,lname,phone_no}=req.body
        const userId=req.session.userId
        console.log("id",userId);
        const data=await userModel.updateOne({_id:userId},{f_name:fname,l_name:lname,phone_no:phone_no})
        console.log("data",data);
        res.redirect('/profile')
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const address=async(req,res)=>{
    try{
        const userId=req.session.userId
        console.log("id",userId);
        const data=await addressModel.findOne({userId:userId})
        console.log("data",data);
        res.render('user/address',{userData:data})
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const newAddress=async(req,res)=>{
    try{
        res.render('user/newAddress',{expressFlash: req.flash('address') })
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const addressUpdate = async (req, res) => {
    try {
        const { name,mobile,email,housename,street, city, state, country,pincode,saveas } = req.body;
        const userId = req.session.userId;
        console.log("id", userId);

        const existingUser = await addressModel.findOne({ userId: userId });

        if (existingUser) {
            // Corrected query to find existing address for the user
            const existingAddress = await addressModel.findOne({
                'userId': userId,
                'address.name': name,
                'address.mobile': mobile,
                'address.email': email,
                'address.houseName': housename,
                'address.street': street,
                'address.city': city,
                'address.state': state,
                'address.country': country,
                'address.pincode': pincode,
                'address.save_as':saveas
            });

            if (existingAddress) {
                req.flash('address', 'This Address already existed');
                return res.redirect('/addAddress');
            }

            existingUser.address.push({
                name:name,
                mobile:mobile,
                email:email,
                houseName:housename,
                street: street,
                city: city,
                state: state,
                country:country,
                pincode: pincode,
                save_as:saveas
            });

            await existingUser.save();

            return res.redirect('/address');
        }

        const newAddress = await addressModel.create({
            userId: userId,
            address: {
                name:name,
                mobile:mobile,
                email:email,
                houseName:housename,
                street: street,
                city: city,
                state: state,
                country:country,
                pincode: pincode,
                save_as:saveas,
            },
        });

        res.redirect('/address');
    } catch (err) {
        res.redirect('/error')
        console.log(err);
    }
};


const changepassword=async(req,res)=>{
    try{
        res.render('user/changePassword',{expressFlash: req.flash('pass','npass','cpass')})
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const passwordUpdate=async(req,res)=>{
    try{
       const {pass,npass,cpass}=req.body
       const userId=req.session.userId
       const user=await userModel.findOne({_id:userId})
       const passwordmatch=await bcrypt.compare(pass,user.password)
       if(passwordmatch){
        const ispasswordValid = passwordValid(npass)
        const iscpasswordValid = confirmpasswordValid(cpass, npass)
        
        if(!ispasswordValid){
            req.flash("npass", "Password should contain one uppercase,one lowercase,one number,one special charecter");
                return res.redirect('/changepassword');
        }
        if(!iscpasswordValid){
            req.flash("cpass", "New Password and Confirm Password shold be match");
                return res.redirect('/changepassword');
        }

        const hashedpassword = await bcrypt.hash(npass, 10)
        const newuser=await userModel.updateOne({_id:userId},{password:hashedpassword})
        console.log("password updated");
        req.flash("success", "Password updated successfully!");
        return res.redirect('/profile')

       }
       else{
        req.flash("pass", "Invalid Password");
                return res.redirect('/changepassword');
       }

    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const deleteAddress=async(req,res)=>{
    try{
        const userId=req.session.userId;
        const id=req.params.id;
        const result = await addressModel.updateOne(
            { userId: userId, 'address._id': id },
            { $pull: { address: { _id: id } } }
        );
        console.log('userId:', userId);
        console.log('addressId:', id);
        console.log('Update result:', result);
        res.redirect('/address');


    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const editAddress=async(req,res)=>{
    try{
        const userId=req.session.userId
        const id=req.params.id
        const address=await addressModel.findOne({userId:userId,'address._id':id})
        console.log("deqjdq",address);
        res.render('user/editAddress',{adress:address})
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const addressPost=async(req,res)=>{
    try {
        const { name,mobile,housename,street,city,state,country,pincode,saveas } = req.body;
        const addressId=req.params.id
        const userId = req.session.userId;
        console.log("id", userId);

        // Check if the new address already exists for the user excluding the currently editing address
        const isAddressExists = await addressModel.findOne({
            'userId': userId,
            'address': {
                $elemMatch: {
                    '_id': { $ne: addressId }, // Exclude the currently editing address
                    'save_as': saveas,
                    'name': name,
                    'mobile': mobile,
                    'housename':housename,
                    'street': street,
                    'pincode': pincode,
                    'city': city,
                    'state': state,
                    'country': country,

                }
            }
        });

        if (isAddressExists) {
            // Address with the same details already exists, handle it accordingly
            return res.status(400).send('Address already exists');
        }

        // Update the existing address based on the addressId
        const result = await addressModel.updateOne(
            { 'userId': userId, 'address._id': addressId },
            {
                $set: {
                    'address.$.save_as': saveas,
                    'address.$.name': name,
                    'address.$.mobile': mobile,
                    'address.$.houseName': housename,
                    'address.$.street': street,
                    'address.$.pincode': pincode,
                    'address.$.city': city,
                    'address.$.state': state,
                    'address.$.country': country,
                    
                }
            }
        );

        // Check if the update was successful
        
            res.redirect('/address');
    } catch (err) {
        res.redirect('/error')
        console.log(err);
    }

}

const wallet=async(req,res)=>{
    try{
        const userId=req.session.userId;
        const user=await userModel.findOne({_id:userId})
        const wallet=await walletModel.findOne({userId:userId})
        console.log("wmdec",wallet);
        res.render('user/wallet',{wallet:wallet,user:user})
    }
    catch(err){
        res.redirect('/error')
        console.log(err);
    }
}

const instance=new Razorpay({key_id:key_id,key_secret:key_secret})

const walletupi = async (req, res) => {
    console.log("CAM");
  console.log('body:', req.body);
  var options = {
      amount: 500,
      currency: "INR",
      receipt: "order_rcpt"
  };
  instance.orders.create(options, function (err, order) {
      console.log("order1 :", order);
      res.send({ orderId: order.id })
    })
}

  
  
const walletTopup= async(req,res)=>{
    try {
        console.log("camehere");
        const userId = req.session.userId;
        const user=await userModel.findOne({_id:userId})
        console.log('jjj',user);
        const { razorpay_payment_id, razorpay_order_id } = req.body;
    const Amount=parseFloat(req.body.Amount)
    console.log(Amount);
        const wallet = await walletModel.findOne({ userId :userId});
    
        console.log(user.wallet,'hhhh');
        user.wallet += Amount;
        wallet.history.push({transaction:"Credited",
        amount:Amount,
        date:new Date()});

        await wallet.save();
        await user.save();
        res.redirect("/wallet")
      } catch (error) {
        console.error('Error handling Razorpay callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}



module.exports = {
    error,
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
    logout,
    profile,
    profileEdit,
    profileUpdate,
    address,
    newAddress,
    addressUpdate,
    changepassword,
    passwordUpdate,
    deleteAddress,
    editAddress,
    addressPost,
    wallet,
    walletupi,
    walletTopup,
}