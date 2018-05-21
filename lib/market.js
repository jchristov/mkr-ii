'use strict'
const ccxt = require('ccxt');
const exchange = require('./exchange');
const price = require('./price');
const log  = require ('ololog').configure ({ locate: false })


module.exports = {

    lastPrice : async function(exchange) {
        try {
            let markets = await exchange.loadMarkets();
            //log.bright.magenta("Market: ", mex.id, markets['BTC/USD'].symbol)
            return markets['BTC/USD'].info.lastPrice;
            
        } catch (error) {
            console.log("last price could't be fetched!")
        }
    },
}