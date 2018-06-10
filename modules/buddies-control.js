// Mongo DB module
const mongoose = require('mongoose');

// MongoDB Models
const Buddies = require('../models/buddies');

var sortJsonArray = require('sort-json-array');

const func = {

    createBuddiesList: function (_id, callback) {
        var buddies = new Buddies({
            _id: _id
        });

        buddies.save().then(function (result) {
            if (typeof callback === 'undefined')
                return 0;
            callback(0);
        }, function (err) {
            if (typeof callback === 'undefined')
                return 1;
            callback(1);
        });
    },

    addBuddy: function (info, callback) {
        Buddies.update({
            _id: info._id
        }, {
            $push: {
                buddiesInfo: {
                    displayName: info.displayName,
                    address: info.address
                }
            }
        }).then((result) => {
            callback(result);
        });
    },

    updateBuddy: function (info, callback) {

        console.log('ac id', info.ac_id);
        console.log('bd id', info.bd_id);
        console.log('displayName', info.displayName);
        console.log('address', info.address);

        func.removeBuddy({
            ac_id: info.ac_id,
            bd_id: info.bd_id
        }, (rv) => {
            if (rv.nModified == 1) {
                func.addBuddy({
                    _id: info.ac_id,
                    displayName: info.displayName,
                    address: info.address
                }, (rv) => {
                    if (rv.nModified == 1) {
                        callback(rv);
                    }
                });
            } else {
                callback(rv);
            }
        })
    },

    removeBuddy: function (info, callback) {

        Buddies.update({
            _id: info.ac_id
        }, {
            $pull: {
                buddiesInfo: {
                    _id: info.bd_id,
                }
            }
        }).then((result) => {
            callback(result);
        });

    },

    getBuddies: function (_id, callback) {

        Buddies.findOne({
            _id: _id
        }).then(function (result) {
            if (result === null) {
                if (typeof callback === 'undefined')
                    return 1;
                callback(1);
            } else {
                sortJsonArray(result.buddiesInfo, 'displayName');
                if (typeof callback === 'undefined')
                    return result;
                callback(result);
            }
        });
    }
};

module.exports._ = func;
