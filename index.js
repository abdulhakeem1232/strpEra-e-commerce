const express=require('express')
const session=require('express-session')
const flash=require('express-flash')
const nocache=require('nocache')
const path=require('path')
const multer=require('multer')
// const ejs=require('ejs')
const middleware=require('./middleware.js')
const userRouter=require('./server/routes/user_router.js')
const adminRouter=require('./server/routes/admin_router.js')



const app=express();
const port=8001;

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});

app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());
app.use(express.urlencoded({ extended: true }));

// Static file serving
// app.use('/admin_assets', express.static(path.join(__dirname, 'public/admin_assets')));
app.use( express.static(path.join(__dirname, 'public/user_assets')));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/public", express.static('./public/'));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(middleware.loadCategory)

// Other middleware
app.use(nocache());
app.use('/', userRouter);
app.use('/admin', adminRouter);

app.use('/uploads',express.static('uploads'))
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload =multer({storage:storage})









app.listen(port,()=>{console.log(`Server running on http://localhost:${port}`)})