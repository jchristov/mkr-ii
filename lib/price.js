const ccxt = require ('ccxt');
const log  = require ('ololog').configure ({ locate: false });
const conf = require ('../config.json');
const symbol = conf.symbol;

module.exports = {

    /* Precio en exchange liquido al momento de la creacion de ordenes escalonadas
       Se setea en main y en cuando se dispara regeneración de órdenes
    */
    basePrice : 0,
    
    lastPrice : async function(symbol, exchange) {
        try {          
            let info = await (exchange.fetchTicker(symbol));
            return info.last;
        } catch (error) {
            console.log("last price couldn't be fetched!");
            log(error)
        }
    },

    scaledPrices : async function(exchange) {
        try {
            // Base price de exchange local
            let basePrice = await this.lastPrice(symbol, exchange)
            let currentIncrement = 0;
            let buys = [];
            let sells = [];
            let spread = conf.spread;
            let price = basePrice + spread;
            let scaledPrices = {};
            while (currentIncrement < conf.top) {
                currentIncrement = currentIncrement + conf.increment;
                sells.push((basePrice + (basePrice * currentIncrement) + spread).toFixed(6));
                buys.push((basePrice - (basePrice * currentIncrement) + spread).toFixed(6));
            } 
            scaledPrices.buy = buys;
            scaledPrices.sell = sells;
            return scaledPrices;
        } catch (error) {
            console.log("Price scaling failed!");
            log(error);
        }
    }
}