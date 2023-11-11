const express=require('express')
const controller=require('../controller/admincontroller/admin_controller')
const categorycontroller=require('../controller/admincontroller/category_controller')
const productcontroller=require('../controller/admincontroller/productController')

// const app=express();


// app.use(express.static('public/admin_assets'))

const router=express.Router()

router.use(express.urlencoded({extended:true}))
const multer=require('multer')
const upload=require('./../../multer')

router.get('/',controller.login)
router.post('/aloginpost',controller.aloginpost)
router.get('/dashboard',controller.dashboard)
router.get('/customer',controller.customer)
router.get('/update/:email',controller.userupdate)
router.post('/searchUser',controller.searchUser)
router.get('/searchview',controller.searchview)
router.get('/filter/:option',controller.filter)

router.get('/category',categorycontroller.category)
router.get('/newcat',categorycontroller.newcat)
router.post('/add-category',categorycontroller.addcategory)
router.get('/updatecat/:id',categorycontroller.updatecat)
router.post('/update-category/:id',categorycontroller.updatecategory)
router.get('/subcategory',categorycontroller.subcategory)
router.get('/newsubcat',categorycontroller.newsubcat)
router.post('/add-subcategory',categorycontroller.addsubcategory)
router.get('/statuscat/:id',categorycontroller.catstatus)
router.get('/deletesubcat/:id',categorycontroller.deletesubcat)
router.get('/updatesubcat/:id',categorycontroller.updatesubcat)
router.post('/update-subcategory/:id',categorycontroller.updatesubcategory)

router.get('/products',productcontroller.products)
router.get('/newproduct',productcontroller.newproduct)
router.post('/addproduct',upload.array('images'),productcontroller.addproduct)
router.get('/unlist/:id',productcontroller.unlist)
// router.get('/deletpro/:id',productcontroller.delet)
router.get('/updatepro/:id',productcontroller.updatepro)
router.post('/update-pro/:id',productcontroller.updateproduct)
router.get('/editimg/:id',productcontroller.editimg)
router.get('/deleteimg',productcontroller.deleteimg)
router.post('/updateimg/:id',upload.array('images'),productcontroller.updateimg)









module.exports= router