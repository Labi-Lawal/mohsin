var Account = require('../models/Accounts.js');
var User = require('../models/Users.js');
var Admin = require('../models/Admins.js');
var Package = require('../models/Packages.js');
var Company = require('../models/Companies.js').Company;
var Folder = require('../models/Companies.js').Folder;

var Path = require('path');
var multer = require('multer');

var companyLogoName;
const companyLogoStorage = multer.diskStorage({
    destination: './public/images/companylogos',
    filename: function(req, file, cb){
        companyLogoName =  file.fieldname + req.session.user.username + '-' + Date.now() + Path.extname(file.originalname);
        cb(null, companyLogoName);
    }
});

const companyLogoUpload = multer({storage: companyLogoStorage}).single('companylogo');
var session = require('express-session');
const { Folders } = require('../models/Companies.js');

module.exports = (server)=>{

    server.use(session({secret: "k3y!ss3cr3t", resave: false, saveUninitialized: true}));

    server.get('/', (req, res)=>{
        Package.find((err, foundPackages) => {
            if(err){
                // 505
            }
            if(!foundPackages) {
                res.render('website', {allPackages: foundPackages});
            } else {
                res.render('website', {allPackages: foundPackages});
            }
        });
    });

    //********** USERS SINGING IN TO THEIR NEW ACCOUNTS *************

    server.get('/signin', (req, res)=>{
        if(req.session.user != undefined){
            res.redirect('/app/workspace');
        } else {
            res.render('website/signin');
        }
    });

    server.post('/signin', (req, res)=>{

        // Admin
        Account.findOne({$or:[
            {email: req.body.userlogin.toLowerCase()},
            {username: req.body.userlogin.toLowerCase()}
        ]}, (err, foundUser)=>{
            if(err){
                console.log(`Error ${err}`);
                res.send({userSession: false, sessionType: false, error: err});
            }
            if(foundUser){
                if(foundUser.password == req.body.password){
                    req.session.user = foundUser;

                    if(req.session.package != undefined) {
                        res.send({userSession: foundUser, sessionType: foundUser.accountType, toCheckOut: true, packageId: req.session.package, error: false});
                    } else {
                        res.send({userSession: foundUser, sessionType: foundUser.accountType, toCheckOut: false, error: false});
                    }
                } else {
                    res.send({userSession: false, sessionType: false, error: 'User login details or password incorrect'});
                }
            }
            if(!foundUser){

                Admin.findOne({$or:[
                    {email: req.body.userlogin.toLowerCase()},
                    {username: req.body.userlogin.toLowerCase()}
                ]}, (err, foundAdmin)=>{
                    if(err){
                        console.log(`There was an error ${err}`);
                        res.send({userSession: false, sessionType: false, error: err});
                    }
                    if(!foundAdmin){
                        console.log('Yeah');
                        res.send({userSession: false, sessionType: false, error: 'User with this details doesn\'t exist.'});
                    }
                    if(foundAdmin){
                        console.log(req.body.password, foundAdmin.password);

                        if(req.body.password == foundAdmin.password){
                            console.log('Yeah1');
                            req.session.user = foundAdmin;
                            console.log(`Admin has logged in ${req.session.user}`);
                            res.send({userSession: foundUser, sessionType: 'admin', error: false});
                        } else {
                            console.log('Yeah2');
                            res.send({userSession: false, sessionType: false, error: 'Admin login details or password incorrect'});
                        }
                    }
                });
            }
        });
    });

    //***************************************************************

    //********** USERS CREATING A NEW ACCOUNT ***********************

    server.get('/createaccount', (req, res)=>{
        if(req.session.user != undefined){
            res.redirect('/app/workspace');
        } else {
            res.render('website/signup');
        }
    });

    server.post('/createaccount', (req, res)=>{
        var newAccount = new Account();
        newAccount.email = req.body.email;
        newAccount.username = req.body.username;
        newAccount.password = req.body.password;
        newAccount.dateCreated = new Date();
        newAccount.package = false;
        newAccount.companyLimit = 0;
        newAccount.accountType = 'customerUser';

        newAccount.save((err, createdAccount)=>{
            if(createdAccount) {
                req.session.user = createdAccount;
                console.log(`New account created ${createdAccount.username}`);
                if(req.session.package != undefined) {
                    res.send({userSession: createdAccount, sessionType: createdAccount.accountType, toCheckOut: true, packageId: req.session.package, error: false});
                } else {
                    res.send({userSession: createdAccount, sessionType: createdAccount.accountType, toCheckOut: false, error: false});
                }
            }
            if(err) {
                res.send({userSession: false, sessionType: false, error: 'There was an error creatin your account. Please try again.'});
            }
        });
    });

    //******************************************************************

    server.get('/purchase/:packageId', (req, res) => {
        req.session.package = req.params.packageId.substr(0, req.params.packageId.length);

        if(req.session.user != undefined) {
            console.log('Here now' + req.params.packageId.substr(0, req.params.packageId.length));
            Package.findOne({_id: req.params.packageId}, (err, foundPackage)=>{
                if(err) {
                    console.log("Error occurred............");
                }
                if(!foundPackage) {
                    res.render('404');
                }
                if(foundPackage) {
                    res.render('website/checkout', {package: foundPackage});
                }
            });
        } else {
            res.redirect(`/signin`);
        }
    });

    server.post('/checkout', (req, res) => {
        Package.findOne({_id: req.session.package}, (err, foundPackage)=>{
            if(foundPackage) {
                Account.findOneAndUpdate(
                    {_id: req.session.user._id},
                    {
                       $set: {
                            accountType: 'customerAdmin',
                            companyLimit: foundPackage.companyLimit,
                            package: {
                                subscribed: true,
                                packageId: req.session.package,
                                subDate: new Date()
                            },
                       }
                    },
                    {useFindAndModify: true, new: true},
                    (err, updatedAccount) => {
                        console.log(updatedAccount);
                        if(updatedAccount) {
                            req.session.user = updatedAccount;
                            console.log(`${req.session.user.username} just subscribed to the ${foundPackage.title} package.`);
                            res.send({subscribed: true, errorOccurred: false});
                        }
                        else {
                            console.log(`${req.session.user.username} just tried to subscribe to the ${foundPackage.title} package but failed.`);
                            console.log(err);
                            res.send({subscribed: false, errorOccurred: false});
                        }
                });
            }
       });
    });

    //********** CUSTOMERS APPLICATION ************************

    server.get('/app/workspace/', async  (req, res)  => {
        if(req.session.user != undefined) {
            res.render('app/workspace', {folders: req.session.company.folders, sessionUser: req.session.user, sessionCompany: req.session.company});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/app/workspace/:folderid', (req, res) => {
        if(req.session.user != undefined){
            var folderId = req.params.folderid.substr(1, req.params.folderid.length);

            Folder.findOne({_id: folderId}, (err, foundFolder) => {
                if(foundFolder){
                    res.render('app/folder', {folder: foundFolder, sessionUser: req.session.user, sessionCompany: req.session.company});
                } else if(!foundFolder){
                    console.log('No found Folder');
                } else {
                    console.log('Error' + err);
                }
            });

        } else {
            res.redirect('/signin');
        }
    });

    // ********** CUSTOMER ADMIN APPLICATION ***************

    server.get('/app/dashboard', (req, res) => {
        if(req.session.user != undefined){
            if(req.session.user.accountType == 'customerAdmin') {
                if(req.session.user.companies.length > 0){
                    if(req.session.company == undefined) {
                        Company.findOne({_id: req.session.user.companies[0].companyId}, (err, foundCompany)=>{
                            if(foundCompany){
                                req.session.company = foundCompany;
                                res.render('app/admin/dashboard', {sessionUser: req.session.user, sessionCompany: req.session.company});
                            } else {
                                res.redirect('/app/newcompany');
                            }
                        });
                    } else {
                        res.render('app/admin/dashboard', {sessionUser: req.session.user, sessionCompany: req.session.company});
                    }
                } else {
                    res.redirect('/app/newcompany');
                }
            } else if(req.session.user.accountType == 'customerUser') {
                res.redirect('/404');
            } else if(req.session.user.accountType == 'admin') {
                res.redirect('/admin');
            }
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/app/newcompany', (req, res)=>{
        if(req.session.user != undefined){
            res.render('app/newcompany', {sessionUser: req.session.user, sessionCompany: req.session.company, errorOccurred: false, limitReached: false});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/app/users', (req, res)=>{
        if(req.session.user != undefined){
            res.render('app/users', {sessionUser: req.session.user, sessionCompany: req.session.company});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/app/companies', (req, res)=>{
        if(req.session.user != undefined){
            res.render('app/companies', {sessionUser: req.session.user, sessionCompany: req.session.company});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/app/changecompany/:companyId', (req, res)=>{
        if(req.session.user != undefined) {
            Company.findOne({_id: req.params.companyId.substr(1, req.params.companyId.length)}, (err, foundCompany)=>{
                if(foundCompany) {
                    req.session.company = foundCompany;
                    res.redirect('/app/dashboard');
                } else if(err){
                    res.redirect('/app/dashboard');
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.post('/createnewuser', (req, res)=>{
        console.log(req.body);
        var newUser = new User();
        newUser.username = req.body.username;
        newUser.password = req.body.password;

        newUser.save((err, savedUser)=>{
            if(savedUser){
               var message = {
                    "status": "ok",
                    "statusCode": 200,
                    "data": savedUser
                };
                res.send(message);
            } else {

            }
        });
    });

    server.post('/app/newcompany', (req, res)=>{
        if(req.session.user != undefined) {
            if(req.session.user.companyLimit > req.session.user.companies.length) {
                companyLogoUpload(req, res, (err)=>{
                    if(err){
                        console.log('error', err);
                    } else {
                        var newCompany = new Company();
                        newCompany.name = req.body.companyname;
                        newCompany.logo = companyLogoName;

                        newCompany.save((err, createdCompany) =>{
                            if(createdCompany) {
                                Account.findOneAndUpdate(
                                    {_id: req.session.user._id},
                                    {$push : {companies: {companyId: createdCompany._id , name: createdCompany.name}}},
                                    {new: true},
                                    (err, updatedAccount) => {
                                        if(updatedAccount) {
                                            req.session.company = createdCompany;
                                            req.session.user = updatedAccount;
                                            res.redirect('/app/dashboard');
                                        } else {
                                            res.render('app/newcompany', {sessionUser: req.session.user, sessionCompany: req.session.company, errorOccurred: true, limitReached: false});
                                        }
                                    }
                                );
                            } else {
                                console.log("HERE FUVKER 3");
                                console.log('Company not created.');
                            }
                        });
                    }
                });
            } else {
                res.render('app/newcompany', {sessionUser: req.session.user, sessionCompany: req.session.company, errorOccurred: false, limitReached: true});
            }
        } else {
            res.redirect('/signin');
        }
    });

    server.post('/createfolder', (req, res)=>{
        if(req.session.user != undefined){
            var newFolder = new Folder();
            newFolder.title = req.body.title;
            newFolder.date = new Date();

            newFolder.save((err, createdFolder) => {
               if(createdFolder) {
                    Company.findOneAndUpdate(
                        {_id: req.session.company._id},
                        {$push: {folders: {folderId: createdFolder._id, title: createdFolder.title, filesNo: 0 }}},
                        {new: true},
                        (err, updatedCompany)=>{
                        if(updatedCompany){
                                req.session.company = updatedCompany;
                                res.send({folderAdded: true, errorOccurred: false});
                        } else {
                                res.send({folderAdded: false, errorOccurred: true});
                        }
                    });
               }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.post('/app/createnote/:folderid', (req, res)=>{
        if(req.session.user != undefined) {
            var folderId = req.params.folderid.substr(1, req.params.folderid.length);

            Folder.findOneAndUpdate(
                {_id: folderId},
                {$push: {files: {title: req.body.title, content: req.body.content, fileType: 'note', dateCreated: new Date()}}},
                {new: true},
                (err, updatedFolder) =>{
                    if(updatedFolder) {
                        Company.findOneAndUpdate(
                            {_id: req.session.company._id, "folders.folderId": folderId},
                            {$set: {"folders.$.filesNo": updatedFolder.files.length}},
                            {new: true},
                            (err, updatedCompany)=>{
                            if(updatedCompany){
                                    req.session.company = updatedCompany;
                                    res.send({folderAdded: true, errorOccurred: false});
                            } else {
                                    res.send({folderAdded: false, errorOccurred: true});
                            }
                        });
                    } else {
                        console.log(err);
                        res.send({fileCreated: false, errorOccurred: true});
                    }
                }
            );
        } else {
            res.redirect('/signin');
        }
    });

    server.post('/app/createfile/:foldername', (req, res)=>{
        if(req.session.user != undefined) {
            var foldername = req.params.foldername.substr(1, req.params.foldername.length);

            Company.findOneAndUpdate(
                {_id: req.session.company._id, "folders.title": foldername },
                {$push: {"folders.$.files": {title: req.body.title, content: req.body.content, type: req.body.type, date: new Date()}}},
                {new: true},
                (err, updatedCompany)=>{
                if(updatedCompany){
                    req.session.company = updatedCompany;
                    res.send({fileCreated: true, errorOccurred: false});
                } else {
                    console.log(err);
                    res.send({fileCreated: false, errorOccurred: true});
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    // *****************************************************

    //******************************************************************

    // ********** ADMIN APPLICATION ***********************

    server.get('/admin/packages', (req, res)=>{
        if(req.session.user != undefined){
            if(req.session.user.accountType == 'admin'){
                Package.find((err, foundPackages)=>{
                    if(err){
                        res.render('admin/packages', {allPackages: false, error: true});
                    }
                    if(foundPackages){
                        res.render('admin/packages', {allPackages: foundPackages, error: false});
                    }
                });
            } else {
                res.redirect('/app/dashboard');
            }
        } else {
            res.redirect('/signin');
        }
    });

    server.post('/admin/createpackage', (req, res)=>{
        if(req.session.user != undefined){
            if(req.session.user.accountType == 'admin'){
                var newPackage = new Package();
                newPackage.title = req.body.title;
                newPackage.price = req.body.price;
                newPackage.durInDays = req.body.durInDays;
                newPackage.companyLimit = req.body.companyLimit;
                newPackage.date = new Date();

                newPackage.save((err, savedPackage)=>{
                    if(savedPackage){
                        res.send({packageCreated: true, error: false});
                    } else {
                        res.send({packageCreated: false, error: true});
                    }
                });
            } else {
                // res.redirect('/app/packages');
            }
        } else {
            // res.redirect('/signin');
        }
    });

    // ****************************************************


    // server.get('/auth/signin', (req, res)=>{
    //     res.render('auth/signin');
    // });

    // server.get('/auth/signup', (req, res)=>{
    //     res.render('auth/signup');
    // });

    // server.post('/auth', (req, res)=>{
    // });

    // ********** SIGN OUT *******************
    server.get('/signout', (req, res)=>{
        var username = req.session.user.username;
        if(req.session.destroy()){
            console.log(`${username} has logged out.`);
            res.redirect('/signin');
        }
    });
    // ***************************************

}

