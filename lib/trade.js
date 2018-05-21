"use strict";
const log = require("ololog").configure({ locate: false })
const exchange = require("./exchange");
const price = require("./price");
const conf = require("../config.json");
var order = require("./order");
const symbol = conf.symbol;
const symbol2 = conf.symbol2;

module.exports = {
    
    amount : 0,
    balance : {},
    currentBalance : 0,
    cachedBalance : 0,
    cachedPrice : 0,
    currency : symbol.substring(0, 3),
    lastPrice : 0,
    priceDifference : 0,
    percentageTrigger : conf.percentageTrigger,
    side : "",

    getAmount : function () {
        let amt = this.cachedBalance  - this.balance[this.currency].total;
        if (amt < 0) amt = amt * - 1;
        amt = amt.toFixed(6);
        return amt;
    },

    sleep : function(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },

    getTradesByBalance : async function(exch1, exch2, initialBalance, placedOrders, isFirstIteration) {
        try {
            
            this.balance = await exchange.balances(exch2);

            if (isFirstIteration) {
                log.bright.magenta("Is first iteration:", isFirstIteration, 
                    "| initial balance: ", initialBalance[this.currency].total);
                this.cachedBalance = initialBalance;
                isFirstIteration = false;
            } else{
                this.cachedBalance = this.balance[currency].total;
            }

            while (true) {
                try {
                    
                    this.lastPrice = await price.lastPrice(symbol2, exch1);
                    this.balance = await exchange.balances(exch2);
                    this.priceDifference = this.lastPrice - price.basePrice;
                    if (this.priceDifference < 0 ) this.priceDifference = this.priceDifference * - 1;
                    log.bright.yellow(this.currency, "Balance at", 
                        exch2.seconds() * 1000, this.balance[this.currency].total,"last price:", this.lastPrice);
                    log("percentage change", (this.priceDifference * 100) / price.basePrice);
                    
                    if (this.balance[this.currency].total < this.cachedBalance) {
                        this.side = "createMarketBuyOrder";
                        await order.regenerateOrders(exch2, conf.amount, symbol, placedOrders);
                    }
                    if (this.balance[this.currency].total > this.cachedBalance) {
                        this.side = "createMarketSellOrder";
                        await order.regenerateOrders(exch2, conf.amount, symbol, placedOrders);
                    }
                    if (this.percentageTrigger <= (this.priceDifference * 100) / price.basePrice) {
                        let percentage = (this.priceDifference * 100) / price.basePrice;
                        log.bright.magenta("price difference triggered at", percentage, "%");
                        price.basePrice = await price.lastPrice(symbol2, exch1);
                        await order.regenerateOrders(exch2, conf.amount, symbol, placedOrders);
                    }
                    log("price at generation", price.basePrice);
                } catch (error) {
                    log.bright.red("ERROR", error.message)
                    log(error)
                }
                await this.sleep(3500);
                this.cachedBalance = this.balance[this.currency].total;
                this.lastPrice = await price.lastPrice(symbol2, exch1);
                log.bright.red(this.currency, "Balance at", exch2.seconds() * 1000, 
                this.balance[this.currency].total, "last price:", this.lastPrice);
                await this.sleep(3500);
            }
        } catch (error) {
            log.bright.red("ERROR", error.message)
            log(error)
        }
    }
};