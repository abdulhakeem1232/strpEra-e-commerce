const category = require('./server/model/categoryModel');
const userModel = require('./server/model/userModel');
constuserModel = require('./server/model/userModel')

const loadCategory = async (req, res, next) => {
  try {
    res.locals.isAuth = req.session.isAuth || false;
    const categories = await category.find();
    res.locals.categories = categories;
    next();
  } catch (error) {

    console.error('Error fetching categories:', error);
    res.status(500).send('Internal Server Error');
  }
}

const iflooged = async (req, res, next) => {
  if (req.session.isAuth) {
    ('/')
  } else {
    next()
  }
}

const islogged = async (req, res, next) => {
  const user = await userModel.findOne({ _id: req.session.userId })
  console.log("user:", user);
  if (req.session.isAuth) {
    req.user = req.session.user;
    next();
  } else {
    res.redirect('/login');
  }
};

const userStatus = async (req, res, next) => {
  const user = await userModel.findOne({ _id: req.session.userId })
  console.log("user:", user);
  console.log('st', user.status);
  if (!user.status) {
    console.log('iff');
    next();

  } else {
    console.log('elsee');
    res.redirect('/');
    console.log('elsee44');
  }
};



const isotp = async (req, res, next) => {
  if (req.session.signup || req.session.forgot) {
    req.user = req.session.user;
    console.log('s');
    next()
  } else {
    console.log('n');
    res.redirect('/')
  }
}

const adminifloged = async (req, res, next) => {
  if (req.session.adminAuth) {
   res.redirect('/admin/dashboard')
  } else {
    next()
  }
}
const adminlogged = async (req, res, next) => {
  if (req.session.adminAuth) {
    req.user = req.session.user;
    next()
  } else {
    res.redirect('/admin')
  }
}

const loggedout = async (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/')
  }
}

const isBlocked = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: req.session.userId })
    if (user.status) {
      res.redirect('/login')
    }
    else {
      next()
    }
  } catch {
    res.redirect('/')
  }
}


module.exports = {
  loadCategory,
  islogged,
  loggedout,
  iflooged,
  adminlogged,
  adminifloged,
  isotp,
  isBlocked,
  userStatus,

}