const mongoose = require('mongoose');
const SHA256 = require('SHA256');
const Tx = require('ethereumjs-tx');

const AccountControl = require('./modules/account-control');
const BuddiesControl = require('./modules/buddies-control');
const Web3Control = require('./modules/web3-control');
const variables = require('./modules/variables');

// Connection to Mongo Database
mongoose.Promise = global.Promise; // ES6 promises
mongoose.connect('mongodb://localhost/' + variables._DATABASE_DACSEE_EWALLET);
mongoose.connection.once('open', () => {
    console.log('-> MongoDB Connection has been made.');
}).on('error', function (err) {
    console.log('MongoDB Connection error:', err);
    process.exit(1);
});


Web3Control._.init();

var myAddress = "0x1b6155a8AE371BF3cB7E687E3132CFd91814b304";
var destAddress = "0xd2752701B779b1D641Cda21876B41F26fc8028CE";
var contractAddress = "0x75f0cc7ff05f923468f35bb23aefa730ba93ebfd";
var my_privkey = "69776cae84fb2dd5c059d4c7e133633ae33f597536fdfc6bc1ccaac05e3edd48";
var transferAmount = 1;

Web3Control._.getGasPrice(((r) => {
    console.log(r);
}));

Web3Control._.getTransactionCount(myAddress, (r) => {
    console.log(r);
});

Web3Control._.transferDacseeToken({
    myAddress: myAddress,
    destAddress: destAddress,
    transferAmount: transferAmount,
    privateKey: my_privkey,
    gasLimit: 41000,
});

/*
// Determine the nonce
Web3Control._.web3.eth.getTransactionCount(myAddress).then((count) => {
    console.log(`num transactions so far: ${count}`);

    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    var rawTransaction = {
        "from": myAddress,
        "nonce": "0x" + count.toString(16),
        "gasPrice": "0x003B9ACA00",
        "gasLimit": "0x250CA",
        "to": contractAddress,
        "value": "0x0",
        "data": Web3Control._.Dacsee.methods.transfer(destAddress, transferAmount).encodeABI(),
        "chainId": "0x04"
    };

    // Example private key (do not use): 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109'
    // The private key must be for myAddress
    var privKey = new Buffer(my_privkey, 'hex');

    var tx = new Tx(rawTransaction);
    tx.sign(privKey);
    var serializedTx = tx.serialize();

    Web3Control._.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).then((receipt) => {
        console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
    });
});
*/

/*
Web3Control._.transferDacseeToken({
    fromAddress: from,
    toAddress: to,
    amount: 10
}, (result) => {
    console.log(result);
});
*/


AccountControl._.register({
    userid: 'userid1',
    firstname: 'firstname',
    secondname: 'secondname',
    password: 'password'
});

var account = AccountControl._.login({
    userid: 'shun',
    password: 'shunshun'
}, (result) => {

    /*
    BuddiesControl._.addBuddy({
        _id: result._id,
        displayName: 'Dylon',
        address: '0x00001'
    });
    
    BuddiesControl._.addBuddy({
        _id: result._id,
        displayName: 'Rick',
        address: '0x00002'
    });
    BuddiesControl._.getBuddies({
        _id: result._id
    }, (result) => {
        for (var i = 0; i < result.buddiesInfo.length; i++) {
            console.log(result.buddiesInfo[i]);
        }
    });
    */
    /*
    BuddiesControl._.removeBuddy({
        _id: result._id,
        displayName: 'name1',
        address: '0x00001'
    });

    AccountControl._.getEtherWallets({
        _id: result._id
    }, function(result){
       console.log(result.dacseeTokenAccount.length); 
    });
    */

    /*
    AccountControl._.addEtherWalletByPrivateKey({
        _id: result._id,
        privateKey: '0xd6704aa1469fbbb6e58767c1eb6c9fbe9b6b62d2e12f48c2abe40fa845eaeebd'
    });

    AccountControl._.removeEtherWallet({
        _id: result._id,
        address: '0x16780c2f81deBA5Fbfb5B035293DC30495fAb7E2'
    }, '127.0.0.1');
    */
});


/*
1. Ether 
https://ethereum.stackexchange.com/questions/32901/error-insufficient-funds-for-gas-price-value?rq=1

2. Token
https://ethereum.stackexchange.com/questions/12823/proper-transaction-signing
https://ethereum.stackexchange.com/questions/24828/how-to-send-erc20-token-using-web3-api

*/
