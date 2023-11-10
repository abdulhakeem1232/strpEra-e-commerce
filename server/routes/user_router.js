const express = require('express')
const controller = require('../controller/user_controller.js')
const middleware = require('./../../middleware.js')




const router = express.Router()



router.get('/', controller.index)
router.get('/login', controller.login)
router.get('/reg', controller.signup)
router.post('/regpost', controller.regpost)
router.get('/otp', controller.otp)
router.post('/verifyotp', controller.verifyotp)
router.post('/resendotp', controller.resendotp)
router.get('/forgotpassword', controller.forgotpassword)
router.post('/loginpost', controller.loginpost)
router.post('/forgotpasswordpost', controller.forgotpasswordpost)
router.get('/newpassword', controller.newpassword)
router.post('/resetpassword', controller.resetpassword)
router.get('/shop/:id', controller.shopping)
router.get('/subshop/:pid/:sid', controller.subshopping)
router.get('/singleproduct/:id', controller.singleproduct)








module.exports = router
