"use strict";
const log = require("ololog").configure({ locate: false })
const exchange = require("./lib/exchange");
const market = require("./lib/market");
const order = require("./lib/order");
const price = require("./lib/price");
const trade = require("./lib/trade");
const conf = require("./config.json");
const symbol = conf.symbol;
const symbol2 = conf.symbol2;


/*this instance isin charge of regenarating orders*/


async function main() {
    let exchange1 = {};
    let exchange2 = {};
    let lastPrice = "";
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

    // TODO es resp de order
    async function cancelMultipleOrders(symbol, lowerId, uperId) {
        for (let i = lowerId; i <= uperId; i++) {
            try {
                let canceled = await exchange2.cancelOrder(i, symbol)
                log(canceled)
            } catch (error) {
                log(error)
            }
        }
    };

    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    };

    try {
        let isFirstIteration = true;
        init();
        price.basePrice = await price.lastPrice(symbol2, exchange1);
        log("price at generation", price.basePrice);
        initialBalance = await exchange.balances(exchange2);
        await order.placeScaledOrders(exchange2, conf.amount, symbol);
        await trade.getTradesByBalance(exchange1, exchange2, initialBalance, order.placedOrders, isFirstIteration); 
        //await cancelMultipleOrders(symbol, 6064, 6251);
    } catch (error) {
        log(error);
    }
}
main()