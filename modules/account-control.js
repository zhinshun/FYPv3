// Mongo DB module
const mongoose = require('mongoose');

// Crypto module
const SHA256 = require('sha256');

// MongoDB Models
const Account = require('../models/account');

// Web3 
const Web3Control = require('../modules/web3-control');

const BuddiesControl = require('../modules/buddies-control');

// Initial web3
Web3Control._.init();

const _MSG = [

    // Register return
    [
        /* 0 */
        'Account successfully created',
        /* 1 */
        'User id already in use',
        /* 2 */
        'User id is empty',
        /* 3 */
        'Password is empty',
        /* 4 */
        'First name is empty',
        /* 5 */
        'Second name is empty'
    ],

        // Login return
    [
        /* 0 */
        'Account successfully logged-in',
        /* 1 */
        'Login failed',
        /* 2 */
        'User id is empty',
        /* 3 */
        'Password is empty'
    ]
];

const func = {

    // Start register function
    register: (credential, callback) => {

        if (typeof credential.userid === 'undefined') {
            if (typeof callback === 'undefined')
                return 2;
            callback(2);
        }

        if (typeof credential.password === 'undefined') {
            if (typeof callback === 'undefined')
                return 3;
            callback(3);
        } else {
            credential.password = SHA256(credential.password);
        }

        if (typeof credential.firstname === 'undefined') {
            if (typeof callback === 'undefined')
                return 4;
            callback(4);
        }

        if (typeof credential.secondname === 'undefined') {
            if (typeof callback === 'undefined')
                return 5;
            callback(5);
        }

        // Create a new account instance
        var account = new Account({
            userid: credential.userid,
            firstname: credential.firstname,
            secondname: credential.secondname,
            password: credential.password
        });

        // Save the account
        account.save().then((result) => {
            // Add new ether address and private key
            func.addEtherWallet(result._id);

            // Create buddies list
            BuddiesControl._.createBuddiesList(result._id);

            if (typeof callback === 'undefined')
                return 0;
            callback(0);
        }, (err) => {
            // Account already exists
            if (typeof callback === 'undefined')
                return 1;
            callback(1);
        });
    },
    // End register function

    // Start login function
    login: (credential, callback) => {

        if (typeof credential.userid === 'undefined') {
            if (typeof callback === 'undefined')
                return 2;
            callback(2);
        }

        if (typeof credential.password === 'undefined') {
            if (typeof callback === 'undefined')
                return 3;
            callback(3);
        } else {
            credential.password = SHA256(credential.password);
        }

        // Retrieve account from DB
        Account.findOne({
            userid: credential.userid,
            password: credential.password
        }).then((result) => {
            if (result === null) {
                if (typeof callback === 'undefined')
                    return 1;
                callback(1);
            } else {
                if (typeof callback === 'undefined')
                    return result;
                callback(result);
            }
        });
    },
    // End login function

    // Start reset function
    resetPassword: (credential, callback) => {

        Account.findOneAndUpdate({
            userid: credential.userid,
            password: SHA256(credential.old_password)
        }, {
            password: SHA256(credential.new_password)
        }).then(function (result) {
            if (typeof callback === 'undefined')
                return result;
            callback(result);
        })
    },
    // End reset function


    // Start update function
    updateProfile: (credential, callback) => {

        Account.findOneAndUpdate({
            userid: credential.userid
        }, {
            firstname: credential.firstname,
            secondname: credential.secondname
        }).then(function (result) {
            if (typeof callback === 'undefined')
                return result;
            callback(result);
        })
    },
    // End update function

    // Start add ethereum wallet
    addEtherWallet: (_id, callback) => {

        var etherAccount = Web3Control._.web3.eth.accounts.create();

        Account.update({
            _id: _id
        }, {
            $push: {
                dacseeTokenAccount: {
                    address: etherAccount.address,
                    privateKey: etherAccount.privateKey
                }
            }
        }).then((result) => {
            callback(result);
        });
    },
    // End add ethereum wallet

    // Start add ethereum wallet by private key
    addEtherWalletByPrivateKey: (credential, callback) => {
        var etherAccount = Web3Control._.web3.eth.accounts.privateKeyToAccount(credential.privateKey);

        Account.update({
            _id: credential._id
        }, {
            $push: {
                dacseeTokenAccount: {
                    address: etherAccount.address,
                    privateKey: etherAccount.privateKey
                }
            }
        }).then((result) => {
            callback(result);
        });
    },
    // End add ethereum wallet by private key

    // Start remove ethereum wallet
    removeEtherWallet: (credential, callback) => {
        Account.update({
            _id: credential.ac_id
        }, {
            $pull: {
                dacseeTokenAccount: {
                    _id: credential.wt_id,
                    address: credential.address
                }
            }
        }).then((result) => {
            callback(result);
        });
    },
    // End remove ethereum wallet

    // Start get ethereum wallets
    getEtherWallets: (_id, callback) => {
        Account.findOne({
            _id: _id
        }, {
            dacseeTokenAccount: 1
        }).then(function (result) {
            if (result === null) {
                if (typeof callback === 'undefined')
                    return 1;
                callback(1);
            } else {
                if (typeof callback === 'undefined')
                    return result;
                callback(result);
            }
        });
    },
    // End get ethereum wallets

    updateDefaultEtherWallet: (credential, callback) => {
        Account.findOneAndUpdate({
            _id: credential._id
        }, {
            defaultTokenAccount_id: credential.defaultTokenAccount_id
        }).then(() => {
            callback();
        });
    }
}

module.exports._ = func;
module.exports._MSG = _MSG;

/*
// Start add ethereum wallet
addEtherWallet: function (credential, credential.remoteAddress = '') {

    Account.findOne({
        userid: credential.userid,
        password: credential.password
    }).then(function (result) {
        if (result === null) {
            console.log(credential.remoteAddress, _MSG[1][1]);
            return 1;
        } else {

            var etherAccount = Web3Control._.web3.eth.accounts.create();
            if (typeof etherAccount === 'undefined') {
                console.log(credential.remoteAddress, _MSG[0][6]);
                return 6;
            }

            Account.update({
                _id: result._id
            }, {
                $push: {
                    dacseeTokenAccount: {
                        address: etherAccount.address,
                        privateKey: etherAccount.privateKey
                    }
                }
            }).then(function (error, success) {
                if (error) {
                    console.log('error', error);
                } else {
                    console.log('success', success);
                }
            });
            return 0;
        }
    });
},
// End add ethereum wallet
*/
