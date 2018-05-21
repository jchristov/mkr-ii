"use strict";
const log = require("ololog").configure({ locate: false })
const exchange = require("./exchange");
const conf = require("../config.json");
var order = require("./order");
const symbol = conf.symbol;
const symbol2 = conf.symbol2;

module.exports = {
    
    amount : 0,
    balance : {},
    currentBalance : 0,
    cachedBalance : 0,
    currency : symbol.substring(0, 3),
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

    placeOpposingOrder : async function(exch1, exch2, placedOrders) {
        let amount = this.getAmount();
        log.bright.magenta(this.side, amount, symbol2);
        try {
            exch1[this.side](symbol2, amount);
        } catch (error) {
            log.bright.red("ERROR", error.message);
            log(error);
        }
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
                this.cachedBalance = this.balance[this.currency].total;
            }

            while (true) {
                try {
                    this.balance = await exchange.balances(exch2);
                    log.bright.yellow(this.currency, "Balance at", exch2.seconds() * 1000, this.balance[this.currency].total)
                    if (this.balance[this.currency].total < this.cachedBalance) {
                        this.side = "createMarketBuyOrder";
                        this.placeOpposingOrder(exch1, exch2, placedOrders);
                    }
                    if (this.balance[this.currency].total > this.cachedBalance) {
                        this.side = "createMarketSellOrder";
                        this.placeOpposingOrder(exch1, exch2, placedOrders);
                    }
                } catch (error) {
                    log.bright.red("ERROR", error.message)
                    log(error)
                }
                await this.sleep(1500);
                this.cachedBalance = this.balance[this.currency].total;
                log.bright.red(this.currency, "Balance at", exch2.seconds() * 1000, this.balance[this.currency].total)
                await this.sleep(1500);
            }
        } catch (error) {
            log.bright.red("ERROR", error.message)
            log(error)
        }
    }
};