const request = require('request');
const BFX = require('bitfinex-api-node')
const conf = require ('../config.json');
      
module.exports = {
  bitfinexWebSocket : function bitfinexWebSocket () {
        const symbol = 'tIOTEUR';
        const bfx = new BFX({
          apiKey: "",
          apiSecret: "",
          ws: {
            autoReconnect: true,
            packetWDDelay: 10 * 1000
          }
        })
        const ws = bfx.ws();
        // Bind events
        ws.on('error', (err) => console.log(err))
        ws.on('open', ws.auth.bind(ws));
        ws.on('open', ()=> { });
        ws.on('open', ()=> {
          console.log('Oening Bitfinex web socket...');
          ws.subscribeTicker(symbol);
        });
        /* ws.onOrderSnapshot({pair : 'OMGBTC'}, (orders) =>
            ws.cancelOrders(orders).then(() => {
                console.log('canceled orders', orders);
            })
        ); */
        ws.onOrderClose({pair : 'OMGBTC'}, function(){
            console.log("ORDER WAS CLOSED!!!");
        });
        /*
        ws.onTicker({symbol : symbol}, function(ticker){
            console.log('%s ticker : %j', symbol, ticker);
        });
        */
        ws.on('open', () => {
            ws.subscribeTrades('OMGBTC')
        });
          /*
          ws.onTrades({ pair: 'OMGBTC' }, (trades) => {
            console.log(`trades: ${JSON.stringify(trades)}`)
          })
          ws.onTradeEntry({ pair: 'OMGBTC' }, (trades) => {
            console.log(`te: ${JSON.stringify(trades)}`)
          })
          ws.onTradeUpdate({ pair: 'OMGBTC' }, (trades) => {
            console.log(`tu: ${JSON.stringify(trades)}`)
          })*/
        ws.open();
  }      
}
