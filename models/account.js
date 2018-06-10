const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DACSEETokenAccountSchema = new Schema({
    address: String,
    privateKey: String
});

// Create Schema
const AccountSchema = new Schema({
    userid: {
        type: String,
        unique: true
    },
    password: String,
    firstname: String,
    secondname: String,
    defaultTokenAccount_id: String,
    dacseeTokenAccount: [DACSEETokenAccountSchema]
});

// Creaet model
const Account = mongoose.model('account', AccountSchema);

module.exports = Account;
