const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const AdminSchema = new Schema({
    email: String,
    username: String,
    password: String
});

const Admin = mongoose.model('admin', AdminSchema);

module.exports = Admin;



