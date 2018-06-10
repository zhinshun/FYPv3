// Express server
const express = require('express');
const session = require('express-session');

// Parse query
const body_parser = require('body-parser');

// MongoDB 
const mongoose = require('mongoose');

// Local modules
const variables = require('./modules/variables');
const AccountControl = require('./modules/account-control');
const Web3Control = require('./modules/web3-control');
const BuddiesControl = require('./modules/buddies-control');

// Global variables
var app = express();

// app settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(body_parser.urlencoded({
    extended: true
}));

app.use(session({
    cookieName: 'session',
    secret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    resave: false,
    saveUninitialized: true,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

var isLoggedIn = (session) => session.isLoggedIn === true && session.account !== null;

// app get methods
app.get('/', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'is logged-in, jumping to daccsee-ewallet');
        return res.redirect('/dacseewallet');
    } else {
        console.log(req.connection.remoteAddress, 'Requested home page');
        res.render('home');
    }
});

app.get('/contact', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'is logged-in, jumping to dashboard');
        return res.redirect('/dacseewallet');
    } else {
        console.log(req.connection.remoteAddress, 'Requested contact page');
        res.render('contact');
    }
});

app.get('/team', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'is logged-in, jumping to dashboard');
        return res.redirect('/dacseewallet');
    } else {
        console.log(req.connection.remoteAddress, 'Requested team page');
        res.render('team');
    }
});

app.get('/tutorial', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'is logged-in, jumping to dashboard');
        return res.redirect('/dacseewallet');
    } else {
        console.log(req.connection.remoteAddress, 'Requested tutorial page');
        res.send('Tutorial');

    }
});

app.get('/login', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'is logged-in, jumping to dashboard');
        return res.redirect('/dacseewallet');
    } else {
        console.log(req.connection.remoteAddress, 'Requested login page');
        res.render('login');
    }
});

app.get('/logout', (req, res) => {
    if (isLoggedIn(req.session)) {
        req.session.destroy();
        console.log(req.connection.remoteAddress, 'Logout');
        return res.redirect('/');
    } else {
        console.log(req.connection.remoteAddress, 'is not logged-in, jumping to login page');
        return res.redirect('/login');
    }
});


app.get('/register', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'is logged-in, jumping to dashboard');
        return res.redirect('/dacseewallet');
    } else {
        console.log(req.connection.remoteAddress, 'Requested register page');
        res.render('register');
    }
});

app.get('/reset', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'is logged-in, jumping to dashboard');
        return res.redirect('/dacseewallet');
    } else {
        console.log(req.connection.remoteAddress, 'Requested reset password page');
        res.render('reset');
    }
});

app.get('/download', (req, res) => {
    console.log(req.connection.remoteAddress, 'Requested download page');
    res.render('download');
});


app.get('/dacseewallet', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'Requested dacseewallet page');

        Web3Control._.getDacseeToken(req.session.defaultwallet.address,
            (dacseetoken) => {
                Web3Control._.getEtherBalance(req.session.defaultwallet.address,
                    (etherbalance) => {
                        Web3Control._.getTokenRateInETH(((tokenRate) => {
                            Web3Control._.getGasPrice(((gasPrice) => {
                                res.render('dacsee_wallet', {
                                    wallet: req.session.wallet,
                                    defaultaddress: req.session.defaultwallet.address,
                                    page: null,
                                    dacseetoken: dacseetoken,
                                    etherbalance: etherbalance,
                                    tokenRate: tokenRate,
                                    gasPrice: gasPrice,
                                    buddies: req.session.buddies
                                });
                            }));
                        }));
                    });
            });
    } else {
        return res.redirect('/');
    }
});

app.get('/dacseewallet/:page', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'Requested dacseewallet page');

        Web3Control._.getDacseeToken(req.session.defaultwallet.address,
            (dacseetoken) => {
                Web3Control._.getEtherBalance(req.session.defaultwallet.address,
                    (etherbalance) => {
                        Web3Control._.getTokenRateInETH(((tokenRate) => {
                            Web3Control._.getGasPrice(((gasPrice) => {
                                res.render('dacsee_wallet', {
                                    wallet: req.session.wallet,
                                    defaultaddress: req.session.defaultwallet.address,
                                    page: req.params.page,
                                    dacseetoken: dacseetoken,
                                    etherbalance: etherbalance,
                                    tokenRate: tokenRate,
                                    gasPrice: gasPrice,
                                    buddies: req.session.buddies
                                });
                            }));
                        }));
                    });
            });

    } else {
        return res.redirect('/');
    }
});


app.get('/wallet/add', (req, res) => {
    if (isLoggedIn(req.session)) {

        AccountControl._.addEtherWallet(req.session.account._id, (rv) => {
            console.log(rv);
            if (rv.nModified === 1) {
                // Retrieve account
                AccountControl._.getEtherWallets({
                    _id: req.session.account._id
                }, (result) => {
                    req.session.wallet = result.dacseeTokenAccount;
                    return res.redirect('/dacseewallet');
                });
            }
        });
    } else {
        return res.redirect('/');
    }
});

app.get('/wallet/remove/:address', (req, res) => {
    if (isLoggedIn(req.session)) {

        AccountControl._.removeEtherWallet({
            _id: req.session.account._id,
            address: req.params.address
        }, (rv) => {
            console.log(rv);
            if (rv.nModified === 1) {
                // Retrieve account
                AccountControl._.getEtherWallets({
                    _id: req.session.account._id
                }, (result) => {
                    req.session.wallet = result.dacseeTokenAccount;
                    return res.redirect('/dacseewallet');
                });
            }
        });
    } else {
        return res.redirect('/');
    }
});

app.get('/wallet/:address', (req, res) => {
    if (isLoggedIn(req.session)) {
        for (var i = 0; i < req.session.wallet.length; i++) {
            if (req.params.address === req.session.wallet[i].address) {
                req.session.defaultwallet = req.session.wallet[i];

                AccountControl._.updateDefaultEtherWallet({
                    _id: req.session.account._id,
                    defaultTokenAccount_id: req.session.wallet[i]._id
                }, () => {
                    return res.redirect(req.headers.referer);
                });
                break;
            }
        }
    } else {
        return res.redirect('/');
    }
});

app.get('/buddy/remove/:_id', (req, res) => {
    if (isLoggedIn(req.session)) {

        BuddiesControl._.removeBuddy({
            ac_id: req.session.account._id,
            bd_id: req.params._id
        }, (rv) => {
            if (rv.nModified == 1) {
                /* Get buddies */
                BuddiesControl._.getBuddies({
                    _id: req.session.account._id,
                }, (result) => {
                    req.session.buddies = result.buddiesInfo;
                    return res.redirect(req.headers.referer);
                });
            } else {
                return res.redirect(req.headers.referer);
            }
        });
    } else {
        return res.redirect('/');
    }
});

app.get('/transaction', (req, res) => {
    if (isLoggedIn(req.session)) {
        console.log(req.connection.remoteAddress, 'Requested transaction page');

        Transaction.find({
            from: req.session.account.dacseeTokenAccount.address
        }).sort({
            date: -1
        }).then(function (results) {
            console.log(results.length);
            res.render('transaction', {
                transactions: results
            });
        });

    } else {
        return res.redirect('/');
    }
});

// app post methods

// Login account
app.post('/login', (req, res) => {

    AccountControl._.login({

        userid: req.body.userid,
        password: req.body.password

    }, (rv) => {

        if (typeof rv === 'number') {
            console.log(req.connection.remoteAddress, AccountControl._MSG[1][rv]);
            return res.redirect('/login');
        } else {
            req.session.account = rv;
            req.session.isLoggedIn = true;

            req.session.wallet = rv.dacseeTokenAccount;

            if (typeof rv.defaultTokenAccount_id === 'undefined') {
                req.session.defaultwallet = rv.dacseeTokenAccount[0];
            } else {
                for (var i = 0; i < rv.dacseeTokenAccount.length; i++) {
                    if (rv.defaultTokenAccount_id == rv.dacseeTokenAccount[i]._id) {
                        req.session.defaultwallet = rv.dacseeTokenAccount[i];
                        break;
                    }
                }
            }
            /* Get buddies */
            BuddiesControl._.getBuddies({
                _id: req.session.account._id
            }, (result) => {
                req.session.buddies = result.buddiesInfo;
                Web3Control._.init();
                return res.redirect('/dacseewallet');
            });
        }
    });
});

app.post('/register', (req, res) => {

    AccountControl._.register({

        userid: req.body.userid,
        password: req.body.password,
        firstname: req.body.firstname,
        secondname: req.body.secondname

    }, (rv) => {
        console.log(req.connection.remoteAddress, AccountControl._MSG[0][rv]);
        if (rv === 1) {
            return res.redirect('/register');
        } else {
            return res.redirect('/login');
        }
    });
});

app.post('/wallet/import', (req, res) => {
    if (isLoggedIn(req.session)) {
        if (req.body.privateKey.length == 66) {
            AccountControl._.addEtherWalletByPrivateKey({
                _id: req.session.account._id,
                privateKey: req.body.privateKey
            }, (rv) => {
                if (rv.nModified === 1) {
                    // Retrieve account
                    AccountControl._.getEtherWallets({
                        _id: req.session.account._id
                    }, (result) => {
                        req.session.wallet = result.dacseeTokenAccount;
                        return res.redirect('/dacseewallet');
                    });
                } else {
                    return res.redirect('/dacseewallet');
                }
            });
        } else {
            return res.redirect('/dacseewallet');
        }
    } else {
        return res.redirect('/');
    }
});

app.post('/buddy/add', (req, res) => {
    if (isLoggedIn(req.session)) {
        BuddiesControl._.addBuddy({
            _id: req.session.account._id,
            displayName: req.body.displayName,
            address: req.body.address
        }, (rv) => {
            if (rv.nModified == 1) {
                /* Get buddies */
                BuddiesControl._.getBuddies({
                    _id: req.session.account._id,
                }, (result) => {
                    req.session.buddies = result.buddiesInfo;
                    return res.redirect(req.headers.referer);
                });
            } else {
                return res.redirect(req.headers.referer);
            }
        });
    } else {
        return res.redirect('/');
    }
});
app.post('/buddy/update', (req, res) => {
    if (isLoggedIn(req.session)) {
        BuddiesControl._.updateBuddy({
            ac_id: req.session.account._id,
            bd_id: req.body.buddy_id,
            displayName: req.body.newDisplayName,
            address: req.body.newAddress
        }, (rv) => {
            if (rv.nModified == 1) {
                /* Get buddies */
                BuddiesControl._.getBuddies({
                    _id: req.session.account._id,
                }, (result) => {
                    req.session.buddies = result.buddiesInfo;
                    return res.redirect(req.headers.referer);
                });
            } else {
                return res.redirect(req.headers.referer);
            }
        });
    } else {
        return res.redirect('/');
    }
});
app.post('/reset', (req, res) => {});

app.post('/transfer', (req, res) => {
    if (isLoggedIn(req.session)) {

        Web3Control._.transferDacseeToken({
            myAddress: req.session.defaultwallet.address,
            privateKey: req.session.defaultwallet.privateKey.substr(2),
            destAddress: req.body.destAddress,
            transferAmount: req.body.transferAmount,
            gasLimit: req.body.gasLimit
        }, () => {
            return res.redirect('/dacseewallet/transfer');
        });

    } else {
        return res.redirect('/');
    }
});

app.post('/sell', (req, res) => {
    if (isLoggedIn(req.session)) {

        Web3Control._.sellDacseeToken(
            req.session.defaultwallet.address,
            req.session.defaultwallet.privateKey.substr(2),
            req.body.transferAmount,
            req.body.gasLimit, () => {
                return res.redirect('/dacseewallet/sell');
            });

    } else {
        return res.redirect('/');
    }
});

app.post('/buy', (req, res) => {
    if (isLoggedIn(req.session)) {
        Web3Control._.buyDacseeToken(
            req.session.defaultwallet.address,
            req.session.defaultwallet.privateKey.substr(2),
            req.body.transferAmount,
            req.body.gasLimit, () => {
                return res.redirect('/dacseewallet/buy');
            });

    } else {
        return res.redirect('/');
    }
});

// Server listen to the port 
app.on('ready', () => {
    // Start server ....
    app.listen(variables._HOST_PORT);
    console.log(`-> Server running at http://${variables._HOST_IP}:${variables._HOST_PORT}/`);
});

// Connection to Mongo Database
mongoose.Promise = global.Promise; // ES6 promises
mongoose.connect('mongodb://localhost/dacseewallet');
mongoose.connection.once('open', () => {
    console.log('-> MongoDB Connection has been made.');
    app.emit('ready');
}).on('error', function (err) {
    console.log('MongoDB Connection error:', err);
    process.exit(1);
});
