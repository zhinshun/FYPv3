const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BuddiesInfoSchema = new Schema({
    displayName: String,
    address: String
});

// Create Schema
const BuddiesSchema = new Schema({
    buddiesInfo: [BuddiesInfoSchema]
});

// Creaet model
const Buddies = mongoose.model('buddies', BuddiesSchema);

module.exports = Buddies;
