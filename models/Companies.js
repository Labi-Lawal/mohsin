const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = Schema({
    name: String,
    logo: String,
    users: [{
        userId: String,
        name: String
    }],
    folders: [],
});

const Company = mongoose.model('companies', CompanySchema);

const FolderSchema = Schema({
    folderId: String,
    title: String,
    files: [{
        title: String,
        content: String,
        fileType: String,
        dateCreated: Date,
    }],
    dateCreated: Date,
});

const Folder  = mongoose.model('folders', FolderSchema);
module.exports = {Folder, Company};


