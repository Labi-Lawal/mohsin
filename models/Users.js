const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const UserSchema = new Schema({
    username: String,
    password: String
});

const User = mongoose.model('users', UserSchema);

module.exports = User;



