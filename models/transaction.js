const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    date: Date,
    amount: Number,
    type: String,
    from: String,
    to: String
});

// Creaet model
const Transaction = mongoose.model('transaction', TransactionSchema);

module.exports = Transaction;