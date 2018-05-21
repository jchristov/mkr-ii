const log = require("ololog").configure({ locate: false })

let orders = {};
let obj = {};
let buy = [1,2,3];
let sell = [11,22,33];
obj.buy = buy;
obj.sell = sell;

for (let i = 0; i < 10; i++){
    orders[i] = obj; 
};

for (let key in orders){
    //log(key, orders[key])
    for (orderType in orders[key]) {
        for (let elem of orders[key][orderType]){
            console.log(key, orderType, elem)
        }
    }
}
