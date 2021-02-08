const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const AccountSchema = new Schema({
    email: String,
    username: String,
    password: String,
    package: Boolean,
    dateCreated: Date,
});

const Account = mongoose.model('accounts', AccountSchema);

module.exports = Account;