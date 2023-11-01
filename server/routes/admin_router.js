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









module.exports= router