"use strict";
const log = require("ololog").configure({ locate: false })
const exchange = require("./lib/exchange");
const market = require("./lib/market");
const hedge = require("./lib/hedge");
const conf = require("./config.json");
const symbol = conf.symbol;
const symbol2 = conf.symbol2;


async function main() {
    let exchange1 = {};
    let exchange2 = {};
    let seconds = 0;
    let initialBalance = {};

    // TODO el exchange debe pasarse: conf.exchange1.apiKey; conf.exchange1.secret
    function init() {
        try {
            exchange1 = exchange.setExchange(conf.exch1Name, conf.exch1.apiKey, conf.exch1.secret, conf.exch1.uid);
            exchange2 = exchange.setExchange(conf.exch2Name, conf.exch2.apiKey, conf.exch2.secret);
            seconds = exchange2.seconds() * 1000;
        } catch (error) {
            log.bright.red("ERROR", error.message)
        }
    };

    try {
        let isFirstIteration = true;
        init();
        initialBalance = await exchange.balances(exchange2);
        await hedge.getTradesByBalance(exchange1, exchange2, initialBalance, isFirstIteration); 
    } catch (error) {
        log(error);
    }
}
main()