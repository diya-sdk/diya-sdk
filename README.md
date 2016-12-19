diya-sdk
========

diya-sdk is a javascript library that enables one to interact with a DiyaOne Network. It communicates over a 
WebSocket transport and can be used on both browsers and NodeJS (using [ws](https://github.com/websockets/ws)).


## Architecture

### The DiyaOne network 

The DiyaOne network is designed as a decentralized network of nodes, each of them supporting a set of services. Typical network
nodes include DiyaOne robots, DiyaOne docking stations, or Partnering servers. Using the diya-sdk, one can connect to any one of the reachable network nodes and from there query services of any subset of the network nodes.

Nodes are selected using a simple selector system :

- ```"D1R00018"``` -> selects the D1R00018 node
- ```['D1R0018', 'D1R00019']``` -> selects the D1R00018 and D1R00019 nodes
- ```/^D1R.*$/``` -> selects all nodes whose names start with "D1R"
- ```"#self"``` -> selects the node that the client directly connects to

### diya services

Services running on any network node expose two types of commands that can be queried from a diya-sdk client

#### Requests

A Request acts exactly like an HTTP request. The client asks for something, the request is executed on the server, and the answer is sent back to the client. The Only difference is that if the given ```selector``` matches multiple nodes, the request will be executed on each nodes, and an answer is sent back for each node.

#### Subscriptions

A subscription acts as a simple pub/sub mecanism. The client asks a service to listen for one of its events. When the event happens on the service side, the client is notified. As with the requests system, if the selector matches multiple nodes, events will be sent back to the client for each selected nodes.


## Getting Started 

### Browser
#### install
```sh
bower install partnering/diya-sdk
```

#### example code
```html
<script type="text/javascript" src="bower_components/diya-sdk/build/diya-sdk.min.js"></script>

<script>
d1.connectAsUser('wss://localhost/api', 'toto', 'toto_password').then(function() {
    console.log('connected !');

    d1("#self").request({
        service: 'my_service',
        func: 'my_function',
        data: {
            foo: 'bar'
    }, function(peerId, err, data) {
        console.log(data);
    });

}).catch(function(error) {
    console.log('game over : '+ error);
}); 

</script>
```

### NodeJS
#### install
```sh
npm init
npm install partnering/diya-sdk
npm install ws
npm install q
```
#### example code 
```js
var d1 = require('diya-sdk');
var WebSocket = require('ws');
var Q = require('q');

d1.connectAsUser('wss://localhost/api', 'toto', 'toto_password', WebSocket).then(function() {
    console.log('connected !');

    d1("#self").request({
        service: 'my_service',
        func: 'my_function',
        data: {
            foo: 'bar'
    }, function(peerId, err, data) {
        console.log(data);
    });

}).catch(function(error) {
    console.log('game over : '+ error);
}); 
```

## Develop
Install dependencies with : 
```sh
npm install
```

Compile debug and minify with : 
```sh
npm run build
```

Compile minify only with : 
```sh
npm run build-min
```

