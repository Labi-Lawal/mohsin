const mongoose = require('mongoose');

//connect to mongodb

mongoose.connect('mongodb+srv://labi:spectacular1@cluster0.7gmyn.mongodb.net/mohsin?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', ()=>{
    console.log('Connection to local database is established..........');
}).on('error', (error)=>{
    console.log('There was an error connecting to the database', error)
});
