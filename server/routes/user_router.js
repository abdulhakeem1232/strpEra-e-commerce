const express = require('express')
const controller = require('../controller/usercontroller/user_controller.js')
const productcontroller=require('./../controller/usercontroller/product_controller.js')
const cartController=require('./../controller/usercontroller/cart_controller.js')
const checkoutController=require('../controller/usercontroller/checkout_controller.js')
const middleware = require('./../../middleware.js')




const router = express.Router()



router.get('/', controller.index)
router.get('/login',middleware.iflooged,controller.login)
router.get('/reg',middleware.iflooged,controller.signup)
router.post('/regpost', controller.regpost)
router.get('/otp',middleware.isotp, controller.otp)
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
router.get('/sortproduct/:sort', productcontroller.sortproducts)
router.post('/search', productcontroller.search)

router.post('/add-to-cart/:pid',cartController.addTocart)
router.get('/showcart',middleware.islogged,cartController.showcart)
router.get('/deletcart/:id/:size',middleware.islogged,cartController.deletecart)
router.post('/update-cart-quantity/:productId/:size',middleware.islogged,cartController.updatecart)

router.get('/profile',middleware.islogged,controller.profile)
router.get('/editProfile',middleware.islogged,controller.profileEdit)
router.post('/profileUpdating',middleware.islogged,controller.profileUpdate)
router.get('/address',middleware.islogged,controller.address)
router.get('/addAddress',middleware.islogged,controller.newAddress)
router.post('/addressUpdating',middleware.islogged,controller.addressUpdate)
router.get('/changepassword',middleware.islogged,controller.changepassword)
router.post('/passwordUpdating',middleware.islogged,controller.passwordUpdate)
router.get('/editAddress/:id',middleware.islogged,controller.editAddress)
router.get('/deleteAddress/:id',middleware.islogged,controller.deleteAddress)
router.post('/addressupdated/:id',middleware.islogged,controller.addressPost)

router.get('/checkout',middleware.islogged,checkoutController.checkout)
router.post('/order',middleware.islogged,checkoutController.order)
router.get('/orderhistory',middleware.islogged,checkoutController.orders)
router.get('/cancelorder/:id',middleware.islogged,checkoutController.ordercancelling)
router.get('/returnorder/:id',middleware.islogged,checkoutController.orderreturning)
router.post('/create/orderId',middleware.islogged,checkoutController.upi)

router.get('/wishlist/:id',middleware.islogged,checkoutController.addToFav)
router.get('/fav',middleware.islogged,checkoutController.viewFav)
router.get('/removefromfavorites/:id',middleware.islogged,checkoutController.removeFav)
router.post('/apply-coupon',middleware.islogged,checkoutController.applycoupon)




router.get('/error',middleware.islogged,controller.error)

module.exports = router
