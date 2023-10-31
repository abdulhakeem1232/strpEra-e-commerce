const express=require('express')
const controller=require('../controller/user_controller.js')




const router=express.Router()



router.get('/',controller.index)
router.get('/login',controller.login)
router.get('/reg',controller.signup)
router.post('/regpost',controller.regpost)
router.get('/otp',controller.otp)
router.post('/verifyotp',controller.verifyotp)
router.post('/resendotp',controller.resendotp)
router.get('/forgotpassword',controller.forgotpassword)
router.post('/loginpost',controller.loginpost)
router.post('/forgotpasswordpost',controller.forgotpasswordpost)
router.get('/newpassword',controller.newpassword)
router.post('/resetpassword',controller.resetpassword)








module.exports= router
