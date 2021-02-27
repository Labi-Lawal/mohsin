const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const PackageSchema = new Schema({
    title: String,
    price: Number,
    subDurInDays: Number,
    content: Array,
    companyLimit: Number,
    dateCreated: Date,
});

const Package = mongoose.model('packages', PackageSchema);

module.exports = Package;