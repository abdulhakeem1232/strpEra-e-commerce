const express = require('express')
const controller = require('../controller/usercontroller/user_controller.js')
const productcontroller=require('./../controller/usercontroller/product_controller.js')
const cartController=require('./../controller/usercontroller/cart_controller.js')
const middleware = require('./../../middleware.js')




const router = express.Router()



router.get('/', controller.index)
router.get('/login',middleware.iflooged,controller.login)
router.get('/reg',middleware.iflooged,controller.signup)
router.post('/regpost', controller.regpost)
router.get('/otp', controller.otp)
router.post('/verifyotp', controller.verifyotp)
router.post('/resendotp', controller.resendotp)
router.get('/forgotpassword', controller.forgotpassword)
router.post('/loginpost', controller.loginpost)
router.get('/logout', controller.logout)
router.post('/forgotpasswordpost', controller.forgotpasswordpost)
router.get('/newpassword', controller.newpassword)
router.post('/resetpassword', controller.resetpassword)
router.get('/shop/:id', productcontroller.shopping)
router.get('/subshop/:pid/:sid', productcontroller.subshopping)
router.get('/singleproduct/:id', productcontroller.singleproduct)

router.post('/add-to-cart/:pid',cartController.addTocart)
router.get('/showcart',middleware.islogged,cartController.showcart)
router.get('/deletcart/:id/:size',middleware.islogged,cartController.deletecart)
router.post('/upadate-cart-quantity/:pid/:size/:quantity',middleware.islogged,cartController.updatecart)









module.exports = router
