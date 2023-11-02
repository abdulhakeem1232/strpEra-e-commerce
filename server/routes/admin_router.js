const express=require('express')
const controller=require('../controller/admin_controller')

const app=express();


app.use(express.static('public/admin_assets'))

const router=express.Router()

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









module.exports= router