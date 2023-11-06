const express=require('express')
const controller=require('../controller/admin_controller')
const productcontroller=require('../controller/admincontroller/productController')

// const app=express();


// app.use(express.static('public/admin_assets'))

const router=express.Router()

router.use(express.urlencoded({extended:true}))
const multer=require('multer')
const upload=multer({dest:'uploads/'})

router.get('/',controller.login)
router.post('/aloginpost',controller.aloginpost)
router.get('/dashboard',controller.dashboard)
router.get('/customer',controller.customer)
router.get('/update/:email',controller.userupdate)
router.post('/searchUser',controller.searchUser)
router.get('/searchview',controller.searchview)
router.get('/filter/:option',controller.filter)
router.get('/category',controller.category)
router.get('/newcat',controller.newcat)
router.post('/add-category',controller.addcategory)
router.get('/updatecat/:id',controller.updatecat)
router.post('/update-category/:id',controller.updatecategory)
router.get('/subcategory',controller.subcategory)
router.get('/newsubcat',controller.newsubcat)
router.post('/add-subcategory',controller.addsubcategory)
router.get('/statuscat/:id',controller.catstatus)
router.get('/deletesubcat/:id',controller.deletesubcat)
router.get('/updatesubcat/:id',controller.updatesubcat)
router.post('/update-subcategory/:id',controller.updatesubcategory)
router.get('/products',productcontroller.products)
router.get('/newproduct',productcontroller.newproduct)
router.post('/addproduct',upload.array('images'),productcontroller.addproduct)
router.get('/unlist/:id',productcontroller.unlist)
router.get('/deletpro/:id',productcontroller.delet)
router.get('/updatepro/:id',productcontroller.updatepro)
router.get('/editimg/:id',productcontroller.editimg)
router.get('/deleteimg',productcontroller.deleteimg)
router.post('/updateimg/:id',upload.array('images'),productcontroller.updateimg)









module.exports= router