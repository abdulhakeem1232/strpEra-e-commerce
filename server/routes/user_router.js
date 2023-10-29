const express=require('express')
const controller=require('../controller/user_controller.js')




const router=express.Router()



router.get('/',controller.index)
router.get('/login',controller.login)
router.get('/reg',controller.signup)
router.post('/regpost',controller.regpost)







module.exports= router
