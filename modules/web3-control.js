// Web 3
const Web3 = require("web3");
const Tx = require('ethereumjs-tx');

const fs = require("fs");

const _INFURA_API_KEY = 'f2Mov3LYuAhPAdukF6Ep';
const _DACSEE_TOKEN_CONTRACT = '0x75f0cc7ff05f923468f35bb23aefa730ba93ebfd';

var func = {
    web3: null,
    Dacsee: null,
    init: function () {
        if (func.web3 === null) {
            func.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/' + _INFURA_API_KEY));
        }
        if (func.Dacsee === null) {
            var dacsee_token_abi = fs.readFileSync("json/dacsee_token_abi.json");
            var json_dacsee_token_abi = JSON.parse(dacsee_token_abi);
            func.Dacsee = new func.web3.eth.Contract(json_dacsee_token_abi, _DACSEE_TOKEN_CONTRACT);
        }
    },
    getEtherBalance: function (address, callback) {
        func.web3.eth.getBalance(address).then(function (balance) {
            balance = func.web3.utils.fromWei(balance, 'ether');

            if (typeof callback === 'undefined')
                return balance;
            callback(balance);
        });
    },
    getDacseeToken: (address, callback) => {
        //var tokens = func.Dacsee.methods.balanceOf(address);
        func.Dacsee.methods.balanceOf(address).call().then((token) => {

            if (typeof callback === 'undefined')
                return token;
            callback(token);
        });
    },

    getGasPrice: (callback) => {
        func.web3.eth.getGasPrice((err, res) => {
            if (err) {
                callback(err);
            } else {
                var gasPrice = func.web3.utils.hexToNumber(res);
                callback(gasPrice);
            }
        });
    },

    getTransactionCount: (fromAddress, callback) => {
        func.web3.eth.getTransactionCount(fromAddress, 'pending', (err, res) => {
            if (err) {
                callback(err);
            } else {
                callback(res);
            }
        });
    },

    signTrans: (rawTransaction, privKey, callback) => {
        var tx = new Tx(rawTransaction);
        tx.sign(privKey);
        var serializedTx = tx.serialize();

        if (typeof callback === 'undefined')
            return serializedTx;
        callback(serializedTx);
    },

    sendTrans: (serializedTx, callback) => {
        func.web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`).then((res) => {
            console.log(`Receipt info:  ${JSON.stringify(res, null, '\t')}`);
            if (typeof callback === 'undefined')
                return res;
            callback(res);
        });
        /*
        func.web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`, (err, res) => {
            if (err) {
                if (typeof callback === 'undefined')
                    return err;
                callback(err);
            } else {
                console.log(`Receipt info:  ${JSON.stringify(res, null, '\t')}`);
                if (typeof callback === 'undefined')
                    return res;
                callback(res);
            }
        });
        */
    },

    transferDacseeToken: (info, callback) => {
        // Determine the nonce
        func.getTransactionCount(info.myAddress, (count) => {
            func.getGasPrice((gasPrice) => {
                // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
                var rawTransaction = {
                    "from": info.myAddress,
                    "nonce": func.web3.utils.toHex(count),
                    "gasPrice": func.web3.utils.toHex(gasPrice),
                    "gasLimit": func.web3.utils.toHex(info.gasLimit),
                    "to": _DACSEE_TOKEN_CONTRACT,
                    "value": "0x0",
                    "data": func.Dacsee.methods.transfer(info.destAddress, info.transferAmount).encodeABI(),
                    "chainId": func.web3.utils.toHex(4)
                };

                // Example private key (do not use): 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109'
                // The private key must be for myAddress
                var privKey = new Buffer(info.privateKey, 'hex');
                func.signTrans(rawTransaction, privKey, (serializedTx) => {
                    func.sendTrans(serializedTx, (receipt) => {
                        // func.web3.eth.getTransactionReceipt(receipt, console.log);
                        if (typeof callback === 'undefined')
                            return;
                        callback();
                    });
                });

            });
        });
    }
}

module.exports._ = func;
