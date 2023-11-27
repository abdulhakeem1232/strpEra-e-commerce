const express=require('express')
const controller=require('../controller/admincontroller/admin_controller')
const categorycontroller=require('../controller/admincontroller/category_controller')
const productcontroller=require('../controller/admincontroller/productController')
const ordercontroller=require('../controller/admincontroller/orderControllre')
const middleware = require('./../../middleware.js')

// const app=express();


// app.use(express.static('public/admin_assets'))

const router=express.Router()

router.use(express.urlencoded({extended:true}))
const multer=require('multer')
const upload=require('./../../multer')

router.get('/',middleware.adminifloged,controller.login)
router.post('/aloginpost',controller.aloginpost)
router.get('/dashboard',middleware.adminlogged,controller.dashboard)
router.get('/customer',middleware.adminlogged,controller.customer)
router.get('/update/:email',middleware.adminlogged,controller.userupdate)
router.post('/searchUser',middleware.adminlogged,controller.searchUser)
router.get('/searchview',middleware.adminlogged,controller.searchview)
router.get('/filter/:option',middleware.adminlogged,controller.filter)
router.get('/logout',middleware.adminlogged,controller.logout)

router.get('/category',middleware.adminlogged,categorycontroller.category)
router.get('/newcat',middleware.adminlogged,categorycontroller.newcat)
router.post('/add-category',middleware.adminlogged,categorycontroller.addcategory)
router.get('/updatecat/:id',middleware.adminlogged,categorycontroller.updatecat)
router.post('/update-category/:id',middleware.adminlogged,categorycontroller.updatecategory)
router.get('/subcategory',middleware.adminlogged,categorycontroller.subcategory)
router.get('/newsubcat',middleware.adminlogged,categorycontroller.newsubcat)
router.post('/add-subcategory',middleware.adminlogged,categorycontroller.addsubcategory)
router.get('/statuscat/:id',middleware.adminlogged,categorycontroller.catstatus)
router.get('/deletesubcat/:id',middleware.adminlogged,categorycontroller.deletesubcat)
router.get('/updatesubcat/:id',middleware.adminlogged,categorycontroller.updatesubcat)
router.post('/update-subcategory/:id',middleware.adminlogged,categorycontroller.updatesubcategory)

router.get('/products',middleware.adminlogged,productcontroller.products)
router.get('/newproduct',middleware.adminlogged,productcontroller.newproduct)
router.post('/addproduct',middleware.adminlogged,upload.array('images'),productcontroller.addproduct)
router.get('/unlist/:id',middleware.adminlogged,productcontroller.unlist)
// router.get('/deletpro/:id',productcontroller.delet)
router.get('/updatepro/:id',middleware.adminlogged,productcontroller.updatepro)
router.post('/update-pro/:id',middleware.adminlogged,productcontroller.updateproduct)
router.get('/editimg/:id',middleware.adminlogged,productcontroller.editimg)
router.get('/deleteimg',middleware.adminlogged,productcontroller.deleteimg)
router.post('/updateimg/:id',middleware.adminlogged,upload.array('images'),productcontroller.updateimg)

router.get('/order',middleware.adminlogged,ordercontroller.order)
router.post('/updateOrderStatus',middleware.adminlogged,ordercontroller.orderstatus)









module.exports= router