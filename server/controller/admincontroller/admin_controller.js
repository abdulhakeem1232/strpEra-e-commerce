const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const { chromium } = require('playwright');
const flash = require('express-flash')
const userModel = require('../../model/userModel.js')
const categoryModel = require('../../model/categoryModel.js')
const subcatModel = require('../../model/subcatModel.js')
const userotp = require('../../model/userotpModel.js')
const { passwordValid, confirmpasswordValid } = require('../../../utils/validators/signupValidators.js')
const orderModel = require('../../model/orderModel.js')
const ExcelJS = require('exceljs')
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const productModel = require('../../model/productModel.js')
const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')
const os = require('os')


const login = async (req, res) => {
    try {
        res.render('admin/alogin', {
            expressFlash: {
                passworderror: req.flash('passworderror'),
                emailerror: req.flash('emailerror')
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error', error);
    }
};

const aloginpost = async (req, res) => {
    try {
        const email = req.body.email
        const user = await userModel.findOne({ email: email })
        const passwordmatch = await bcrypt.compare(req.body.password, user.password)
        if (passwordmatch && user.isAdmin) {
            req.session.adminAuth = true;
            res.redirect('/admin/dashboard');

        }
        else {
            req.flash('passworderror', 'Invalid-password')
            res.redirect('/admin')
        }
    }
    catch {
        req.flash('emailerror', 'Invalid-email')
        res.redirect('/admin')
    }
}

const dashboard = async (req, res) => {
    try {
        const total = await orderModel.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }

                }
            }
        ])

        const users = await userModel.find().countDocuments()
        const pro = await productModel.find().countDocuments()
        const orders = await orderModel.find().countDocuments()

        res.render("admin/dashboard", { revenue: total, users, orders, pro })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}
const customer = async (req, res) => {
    try {
        const user = await userModel.find({})
        res.render("admin/customer", { users: user })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const userupdate = async (req, res) => {
    try {
        const email = req.params.email;
        const user = await userModel.findOne({ email: email });

        user.status = !user.status;
        await user.save();

        // if (req.session.isAuth && req.session.userId == user._id) {

        //        req.session.isAuth=false
        // }
        res.redirect('/admin/customer');
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const searchUser = async (req, res) => {
    try {
        const searchName = req.body.search
        const data = await userModel.find({
            $or: [
                { f_name: { $regex: new RegExp(`^${searchName}`, 'i') } },
                { l_name: { $regex: new RegExp(`^${searchName}`, 'i') } }
            ]
        });
        req.session.searchUser = data
        res.redirect('/admin/searchview')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const searchview = async (req, res) => {
    try {
        const user = req.session.searchUser
        res.render('admin/customer', { users: user })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }

}
const filter = async (req, res) => {
    try {
        const option = req.params.option
        if (option === 'A-Z') {
            user = await userModel.find().sort({ f_name: 1 })
        }
        else if (option === 'Z-A') {
            user = await userModel.find().sort({ f_name: -1 })
        }
        else if (option === 'Blocked') {
            user = await userModel.find({ status: true })
        }
        else {
            user = await userModel.find()
        }
        res.render('admin/customer', { users: user })
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }

}
const chartData = async (req, res) => {
    try {
        const selected = req.body.selected
        if (selected == 'month') {
            const orderByMonth = await orderModel.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    }
                }
            ])
            const salesByMonth = await orderModel.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                        },
                        totalAmount: { $sum: '$amount' },

                    }
                }
            ])
            const responseData = {
                order: orderByMonth,
                sales: salesByMonth
            };


            res.status(200).json(responseData);
        }
        else if (selected == 'year') {
            const orderByYear = await orderModel.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    }
                }
            ])
            const salesByYear = await orderModel.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                        },
                        totalAmount: { $sum: '$amount' },
                    }
                }
            ])
            const responseData = {
                order: orderByYear,
                sales: salesByYear,
            }
            res.status(200).json(responseData);
        }

    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }

}


const downloadsales = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const salesData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        const products = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate),
                    },
                },
            },
            {
                $unwind: '$items',
            },
            {
                $group: {
                    _id: '$items.productId',
                    totalSold: { $sum: '$items.quantity' },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            {
                $unwind: '$productDetails',
            },
            {
                $project: {
                    _id: 1,
                    totalSold: 1,
                    productName: '$productDetails.name',
                },
            },
            {
                $sort: { totalSold: -1 },
            },
        ]);

        const totalOrders = salesData[0]?.totalOrders || 0;
        const totalAmount = salesData[0]?.totalAmount || 0;

        const doc = new jsPDF();

        // Add title
        doc.text('Sales Report', 14, 20);
        doc.text(`Start Date: ${startDate}`, 14, 30);
        doc.text(`End Date: ${endDate}`, 14, 40);

        // Prepare the data for the table
        const tableData = products.map((item, index) => [
            index + 1,
            item.productName,
            item.totalSold,
        ]);

        // Add the table
        doc.autoTable({
            head: [['Sl No', 'Product Name', 'Quantity Sold']],
            body: tableData,
        });

        // Add the total orders and revenue
        doc.autoTable({
            body: [
                ['Total No of Orders', '', totalOrders],
                ['Total Revenue', '', totalAmount],
            ],
        });

        const pdfBuffer = doc.output('arraybuffer');

        res.setHeader('Content-Length', pdfBuffer.byteLength);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales.pdf');
        res.status(200).send(Buffer.from(pdfBuffer));
    } catch (err) {
        console.log('Error generating sales report PDF:', err);
        res.status(500).send('Error Occurred');
    }
};


const logout = async (req, res) => {
    req.session.adminAuth = false;
    req.session.destroy();
    res.redirect('/admin')
}



module.exports = {
    login,
    aloginpost,
    dashboard,
    customer,
    userupdate,
    searchUser,
    searchview,
    filter,
    logout,
    chartData,
    downloadsales,



}
