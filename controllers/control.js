var Account = require('../models/Accounts.js');
var User = require('../models/Users.js');
var Admin = require('../models/Admin.js');

var session = require('express-session');

module.exports = (server)=>{

    server.use(session({secret: "k3y!ss3cr3t", resave: false, saveUninitialized: true}));

    server.get('/', (req, res)=>{
        if(req.session.user != undefined){
            res.render('website', {userSession: req.session.user, sessionType: req.session.user.sessionType});
        } else {
            res.render('website');
        }
        
    });

    server.get('/signin/:packageName', (req, res)=>{
        res.render('website/signin');
    });

    server.get('/createaccount/:packageId', (req, res)=>{
        res.render('website/signup');
    });

    server.get('/admin', (req, res)=>{
        res.render('admin');
    });

    server.post('/signin', (req, res)=>{
        User.findOne({$or:[
            {email: req.body.userlogin.toLowerCase()},
            {username: req.body.userlogin.toLowerCase()}
        ]}, (err, foundUser)=>{
            if(err){
                console.log(`Error ${err}`);
                res.send({userSession: false, sessionType: false, error: err});
            }
            if(foundUser){
                if(foundUser.password == req.body.password){
                    req.session.user = foundUser
                    console.log(`User has logged in ${req.session.user}`);
                    res.send({userSession: foundUser, sessionType: 'user', error: false});
                } else {
                    res.send({userSession: false, sessionType: false, error: 'User login details or password incorrect'});
                }
            }
            if(!foundUser){
                Admin.find({$or:[
                    {email: req.body.userlogin.toLowerCase()},
                    {username: req.body.userlogin.toLowerCase()}
                ]}, (err, foundAdmin)=>{
                    if(err){
                        console.log(`There was an error ${err}`);
                    }
                    if(!foundAdmin){
                        res.send({userSession: false, sessionType: false, error: 'User with this details doesn\'t exist.'});
                    }
                    if(foundAdmin){
                        if(req.body.password == foundAdmin){
                            req.session.user = foundAdmin;
                            console.log(`Admin has logged in ${req.session.user}`);
                            res.send({userSession: foundUser, sessionType: 'admin', error: false});
                        } else {
                            res.send({userSession: false, sessionType: false, error: 'User login details or password incorrect'});
                        }
                    }
                });
            }
        });
    });

    server.post('/createaccount', (req, res)=>{
        var newAccount = new Account();
        newAccount.email = req.body.email;
        newAccount.username = req.body.username;
        newAccount.password = req.body.password;
        newAccount.dateCreated = new Date();
        newAccount.package = false;

        newAccount.save((err, savedAccount)=>{
            if(savedAccount) {
                console.log(`New account created ${savedAccount}`);
                res.redirect('/');
            }
        });
    });
    

    // server.get('/app', (req, res)=>{
    //     if(req.session.user != undefined){
    //         res.render('app');
    //     } else {
    //         res.redirect('/createaccount');
    //     }
    // });

    server.get('/app/workspace', (req, res)=>{
        if(req.session.user != undefined){
            res.render('app/workspace');
        } else {
            res.redirect('/createaccount');
        }
    });

    server.get('/app/workspace/folder', (req, res)=>{
        if(req.session.user != undefined){
            res.render('app/folder');
        } else {
            res.redirect('/createaccount');
        }
    });

    // server.get('/app/users', (req, res)=>{
    //     res.render('app/users');
    // });

    // server.get('/auth/signin', (req, res)=>{
    //     res.render('auth/signin');
    // });

    // server.get('/auth/signup', (req, res)=>{
    //     res.render('auth/signup');
    // });

    // server.post('/auth', (req, res)=>{
    // });

    // server.post('/createnewuser', (req, res)=>{
    //     console.log(req.body);
    //     var newUser = new User();
    //     newUser.username = req.body.username;
    //     newUser.password = req.body.password;

    //     newUser.save((err, savedUser)=>{
    //         if(savedUser){
    //            var message = {
    //                 "status": "ok",
    //                 "statusCode": 200,
    //                 "data": savedUser
    //             };
    //             res.send(message);
    //         } else {

    //         }
    //     });
    // });
}

