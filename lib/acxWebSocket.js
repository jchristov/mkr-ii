const conf = require ('../config.json');
const host = 'wss://beta.jfraiese.com:443';
const WebSocket = require('ws');
let socket = new WebSocket(host);
const crypto = require('crypto')

let payload = "";
let challenge = "";

function genAuthSig(secret, payload) {

    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return {'auth' : {'answer' : sig, 'acces_key' : conf.acx.apiKey}}
};

socket.onopen = function() {
  
    console.log("opened");
}

socket.onmessage = function(msg) {
  
  console.log(msg);
  let auth = "";
  let signature = {};
  let data = JSON.parse(msg.data);
  challenge = data.challenge;
  payload = conf.acx.apiKey + challenge;
  signature = genAuthSig(conf.acx.secret, payload);
  auth = JSON.stringify(signature)
  console.log("auth is:", auth)
  socket.send(auth); 
}

socket.onclose = function() {
  
    console.log("closed");
}