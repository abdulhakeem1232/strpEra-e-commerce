const express=require('express')
const session=require('express-session')
const flash=require('express-flash')
const nocache=require('nocache')
const path=require('path')
// const ejs=require('ejs')
const userRouter=require('./server/routes/user_router.js')
const adminRouter=require('./server/routes/admin_router.js')



const app=express();
const port=9000;

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

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Other middleware
app.use(nocache());
app.use('/', userRouter);
app.use('/admin', adminRouter);

// app.use(flash());

// app.use(express.urlencoded({ extended: true }))
// app.use(express.static('public'))
// app.use(express.static('public/user_assets'))
// app.use(express.static('public/admin_assets'))
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine','ejs')
// app.use(nocache());
// app.use('/',userRouter)
// app.use('/admin',adminRouter)







app.listen(port,()=>{console.log(`Server running on http://localhost:${port}`)})