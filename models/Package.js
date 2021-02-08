const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const PackageSchema = new Schema({
    name: String,
    features: Array,
    dateCreated: Date,
});

const Package = mongoose.model('packages', PackageSchema);

module.exports = Package;