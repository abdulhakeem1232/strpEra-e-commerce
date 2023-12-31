require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const Razorpay = require('razorpay')
const nocache = require('nocache')
const path = require('path')
const middleware = require('./middleware.js')
const userRouter = require('./server/routes/user_router.js')
const adminRouter = require('./server/routes/admin_router.js')


const app = express();
const port = 4545;

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

app.use(flash({
    sessionKeyName: 'flashMessage',
    useViewEngine: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public/user_assets')));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/public", express.static('./public/'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(middleware.loadCategory)

app.use(nocache());
app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/uploads', express.static('uploads'))
app.get('*', (req, res) => {
    res.render('user/404')
});

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        app.listen(port, () => { console.log(`Server running on http://localhost:${port}`) })
    })
    .catch((err) => console.error('Error connecting to the database:', err));

