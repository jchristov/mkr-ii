const exchange = require('./exchange');
const price = require('./price');
const log = require('ololog').configure({ locate: false })

module.exports = {

    placedOrders: {},
    
    cacheOrders: async function (orderType) {
        try {
            var arr = [];
            for (let value of orderType) {
                arr.push(value.id);
            }
        } catch (error) {
            ("orders cache failed...");
        }
        return arr;
    },

    placeScaledOrders: async function (exchange, amount, symbol, message) {
        
        let msg = "";
        let orders = {};
        let buy = [];
        let sell = [];
        orders.buy = buy;
        orders.sell = sell;
        
        try {
            let exch = exchange;
            let scaledPrices = await price.scaledPrices(exchange);
            log(scaledPrices);
            for (let orderType in scaledPrices) {
                for (let value of scaledPrices[orderType]) {
                    let type = orderType;
                    let currentOrder = {};
                    try {
                        log("attempting", msg, orderType, "at ", value, "at", exchange.name);
                        currentOrder = await exch.createOrder(symbol, 'limit', orderType, amount, value);
                        log.bright.green("order", currentOrder.id, "placed at ", value, "at", exchange.name);
                        orders[orderType].push(currentOrder);
                    } catch (error) {
                        log.bright.red("ERROR", error.message)
                        log(error);
                    }
                }
            }
        } catch (error) {
            log.bright.red("ERROR", error.message);
        }
        this.placedOrders = orders;
    },

    regenerateOrders: async function (exchange, amount, symbol, placedOrders) {

        function sleep(ms) {
            return new Promise(resolve => {
                setTimeout(resolve, ms)
            })
        };
        
        let orders = {};
        let buy = [];
        let sell = [];
        let scaledPrices = await price.scaledPrices(exchange);
        orders.buy = buy;
        orders.sell = sell;
        log(scaledPrices);
        for (let orderType in placedOrders) {
            let regeneratedQuantity = 0;
            for (let order of placedOrders[orderType]) {
                let currentOrder = {};
            //    try {
                let previousLenght = placedOrders[orderType].length;
                let exch = exchange;
                let value = scaledPrices[orderType][regeneratedQuantity];
                log.bright.yellow("attempting", orderType, "at", value)
                currentOrder = await exch.createOrder(symbol, 'limit', orderType, amount, value);
                this.placedOrders[orderType][regeneratedQuantity] = currentOrder;
                log.bright.green("new", orderType, "order createad at", value, "with id:", currentOrder.id);
                log.bright.magenta(regeneratedQuantity + 1, "regenerated orders of",
                    previousLenght, "previously placed", orderType, "orders")
                try {
                    let canceled = await exchange.cancelOrder(order.id, symbol);
                    log("order id:", canceled.id, "was canceled");
                } catch (error) {
                    log.bright.red(error.message);
                }
              //  } catch (error) {
                   // log(error);
                    //log("we are here");
            //    }
                regeneratedQuantity ++;
                await sleep(3000);
            }
        }
        return orders;
    }
}