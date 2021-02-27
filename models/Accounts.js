const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const AccountSchema = new Schema({
    email: String,
    username: String,
    password: String,
    package: {
        subscribed: Boolean,
        packageId: String,
        subDate: Date,
    },
    dateCreated: Date,
    companyLimit: Number,
    companies: [{
        companyId: String,
        name: String
    }],
    accountType: String,
});

const Account = mongoose.model('accounts', AccountSchema);
module.exports = Account;


