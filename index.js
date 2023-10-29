const express=require('express')
const nocache=require('nocache')
const path=require('path')
const session=require('express-session')
// const ejs=require('ejs')
const userRouter=require('./server/routes/user_router.js')



const app=express();
const port=8080;

app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.static('public/user_assets'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')
app.use(nocache());
app.use('/',userRouter)







app.listen(port,()=>{console.log(`Server running on http://localhost:${port}`)})