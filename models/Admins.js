const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const AdminSchema = new Schema({
    email: String,
    username: String,
    password: String,
    accountType: String
});

const Admin = mongoose.model('admins', AdminSchema);

module.exports = Admin;



