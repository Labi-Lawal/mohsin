const mongoose = require('mongoose');

//connect to mongodb

// mongodb+srv://labi:spectacular1@cluster0.7gmyn.mongodb.net/ mohsin?retryWrites=true&w=majority
mongoose.connect('mongodb://localhost/mohsin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', ()=>{
    console.log('Connection to local database is established..........');
}).on('error', (error)=>{
    console.log('There was an error connecting to the database', error)
});