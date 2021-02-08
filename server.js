const express = require('express');
const server = express();
const bodyParser = require('body-parser');

//template engine , for sending output to interface.
server.set('view engine', 'ejs');


// set up middleware for static files
server.use(express.static('./public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

var controller = require('./controllers/control.js');
controller(server);

var database = require('./controllers/dbconnect.js');

var port = process.env.PORT || 3000;

server.listen(port, ()=>{
    console.log(`MOHSIN is fucking listening on port ${port} .....`);
});


