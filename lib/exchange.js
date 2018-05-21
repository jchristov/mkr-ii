"use strict";
const ccxt = require ('ccxt')
const log = require ('ololog').configure ({ locate: false })

module.exports = {

    setExchange :  function setExchange(name, apikey, secret, uid) {
        try {
            let exchange = new ccxt[name] ({
                'apiKey': apikey,
                'secret': secret,
                'uid' : uid,
                'rateLimit' : 1500,
                'enableRateLimit' : true
            })
            return exchange;
            
        } catch (error) {
            log(error);
        }
    },

    balances : async function balances(exchange) {
        try { 
            let exchangeBal = await exchange.fetchBalance ()
            return exchangeBal;
        } catch (e) {
    
            if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
                log.bright.red ('[DDoS Protection] ' + e.message)
            } else if (e instanceof ccxt.RequestTimeout) {
                log.bright.red ('[Request Timeout] ' + e.message)
            } else if (e instanceof ccxt.AuthenticationError) {
                log.bright.red ('[Authentication Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                log.bright.red ('[Exchange Not Available Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeError) {
                log.bright.red ('[Exchange Error] ' + e.message)
            } else if (e instanceof ccxt.NetworkError) {
                log.bright.red ('[Network Error] ' + e.message)
            } else {
                throw e;
            }
        }
    }
}
