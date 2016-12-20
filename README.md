diya-sdk v1.x
========

<img src="https://partnering-robotics.com/ressources/img/logo/logo_robotics_horizontal.png" alt="Partnering Robotics" style="width: 50%; float: right" />

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

### Services 

Services running on any network node expose two types of commands that can be queried from a diya-sdk client : requests and 
subscriptions. 

A service can be used directly by calling its requests and subscriptions provided they are documented (see below).
However for some services, some client-side logic must be followed. For these services, modules that implement this logic and wrap requests and subscriptions are provided in the diya-sdk library.

#### Requests

A Request acts exactly like an HTTP request. The client asks for something, the request is executed on the server, and the answer
 is sent back to the client. The only difference is that if the given ```selector``` matches multiple nodes, the request will be 
executed on each nodes, and an answer will be sent back for each node.

#### Subscriptions

A subscription acts as a simple pub/sub mecanism. The client asks a service to listen for one of its events. When the event
 happens on the service side, the client is notified. As with the requests system, if the ```selector``` matches multiple nodes, events will be sent back to the client for each node.


## Getting Started 

Enough with the theory, let's code ! diya-sdk is packaged both as a bower package and an npm package, so it is rather easy to include it wherever you need it.

### Browser
#### install
```sh
bower install partnering/diya-sdk
```

#### example code
```html
<!-- include the diya-sdk library -->
<script type="text/javascript" src="bower_components/diya-sdk/build/diya-sdk.min.js"></script>

<script>

/* 
 * Connect to the node located at 'wss://localhost/api' using the 'toto' login and
 * the 'toto_password' password 
 */
d1.connectAsUser('wss://localhost/api', 'toto', 'toto_password').then(function () {
    /* The connectAsUser method returns a promise that resolve upon successful connection */
    console.log('connected !');

    //From then on, you can perform any requests or subscriptions you want

    /* 
     * this call creates a request 'my_function' to the service 'my_service' with
     * the data { foo: 'bar' } that will be applied to all nodes of the 'wss://localhost/api'
     * network that match the "#self" selector.
     */
    d1("#self").request({
        service: 'my_service',
        func: 'my_request',
        data: {
            foo: 'bar'
        }
    }, function(peerId, err, data) {
        /* 
         * this callback is call for each node that answers the request. the 'peerId' 
         * corresponds to the id of the node that answered, 'err' is defined if there
         * was an error while executing the request, and 'data' is the request's answer
         */
        console.log(peerId);
        console.log(err);
        console.log(data);
    });


    /*
     * The subscribe method works almost exaclty like the request method, except that it
     * returns a subscription handler that can be used to end the subscription once it's
     * not needed anymore.
     */
    let sub = d1(/.*/).subscribe({
        service: 'my_service',
        func: 'my_subscription',
        data: {
            zorblax: 42
        }
    }, function (peerId, err, data) {
        /* 
         * same as requests, but will be call for each service event until the subscription
         * is closed
         */
    });

    ...

    //closes the subscription
    sub.close()

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

/*
 * The only difference with the browser example is that we must pass a WebSocket implementation
 * object to the connectAsUser method in order to allow diya-sdk to open the WebSocket channel
 * to the network node. Altough only tested with _ws_, any WebSocket implementation should work 
 * as long as it follows the HTML5 WebSocket API.
 */
d1.connectAsUser('wss://localhost/api', 'toto', 'toto_password', WebSocket).then(function() {
    console.log('connected !');

    d1("#self").request(...)
    d1("D1R00018").subscribe(...)

    ...

}).catch(function(error) {
    console.log('game over : '+ error);
}); 
```


## API

### Core 

The diya-sdk exposes a global ```d1``` object (instance of DiyaSelector) that is used to perform all operation
at the application level.

#### d1.newInstance()

- Returns: ```<DiyaSelector>``` A new instance of DiyaSelector

This call is useful if you don't want to use the d1 singleton object to connect and interact with a network node.

```js
let myD1 = d1.newInstance()

myD1.connectAsUser('wss://some/server/api', 'foo', 'bar').then(function () {
	myD1(/.*/).request(...)
	...
	myD1.disconnect()
})
```

#### d1.connect(addr, [WebSocket])

- **addr** ```<String>``` A valid WebSocket address
- **WebSocket** ```<WebSocket>``` A WebSocket implementation - defaults to window.WebSocket
- Returns: ```<Promise<>>``` A promise that resolves upon successful connection

Connects to a network node by using its websocket address.


#### d1.connectAsUser(addr, user, password, [WebSocket])

- **addr** ```<String>``` A valid WebSocket address
- **user** ```<String>``` user name on the target network node
- **password** ```<String>``` user's password on the target network node
- **WebSocket** ```<WebSocket>``` A WebSocket implementation - defaults to window.WebSocket
- Returns: ```<Promise<>>``` A promise that resolves upon successful connection

Connect as a given user to a given network node.

#### d1.deauthenticate()

Deauthenticate from the currently connected node.


#### d1.setSecured(bSecured)

#### d1.setWSocket(WebSocket)

- **WebSocket** ```<WebSocket>``` A WebSocket implementation.

Provide a custom WebSocket implementation (defaults to window.WebSocket). This must be called
before ```d1.connect```.


#### d1.disconnect()

- Returns: ```<Promise<>>``` a promise that is resolved upon successful disconnection

Disconnect from the currently connected node.


#### d1.isConnected()

- Returns: ```<Boolean>``` ```true``` if the d1 instance is currently connected, ```false``` otherwise.

Check whether the d1 singleton is currently connected to any node


#### d1.peers()

- Returns: ```<Array<String>>``` An array of all reachable node names.

Get an array of all reachable node names


#### d1.self()

- Returns: ```<String>``` the name of the directly connected node.

Get the name of the directly connected node.


#### d1.addr()

- Returns: ```<String>``` the websocket address of the currently connected/connecting node

Get the address of the currently connected node.


#### d1.user()

- Returns: ```<String>``` the user authenticated to the currently connected node

Get the user authenticated to the currently connected node.


#### d1.isAuthenticated()

- Returns: ```<Boolean>``` ```true``` if the user is authenticated to the currently connected node, ```false``` otherwise.

Check whether the d1 singleton is authenticated to the currently connected node.


#### d1.parsePeer(peerString)

- **peerString** <String> a peer string that can be converted to a raw WebSocket addr.
- Returns: ```<Object>```
	- **addr** ```<String>``` the parsed websocket address to the network node client API
	- **addrNet** ```<String>``` the parsed websocket address to the network node's network API
	- **name** ```<String>``` the parsed target node name

Helper method for formatting a peer name into a proper websocket address.

Examples :

- ```"partnering"```:
	- **addr**: ```"wss://partnering-cloud.com/partnering/api"```
	- **addrNet**: ```"wss://partnering-cloud.com/partnering/net"```
	- **name**: ```"partnering"```
- ```"somedomain.com/somesite"```:
	- **addr**: ```"wss://somedomain.com/somesite/api"```
	- **addrNet**: ```"wss://somedomain.com/somesite/net"```
	- **name**: ```"somesite"```
- ```"wss://websocketaddress"```:
	- **addr**: ```"wss://websocketaddress"```
- ```"1234"```:
	- **addr**: ```"ws://localhost:1234"```


#### d1.tryConnect()


#### d1.on(event, callback)


#### d1(selector).auth(user, password)

- **user** ```<String>``` user's name
- **password** ```<String>``` user's password
- Returns: ```<Promise<>>``` A promise that resolves upon successful user authentication


#### d1(selector).request(request, callback, timeout, options)

- **selector** ```<String | Array<String> | RegExp>``` selector that matches the target nodes
- **request** ```<Object>```
	- **service** ```<String>``` target service
	- **func** ```<String>``` target request
	- **[obj]** ```<String | Array<String>>``` Optional target object's identifiers
	- **data** ```<Object>``` request's arguments
- **callback** ```<Function>``` callback executed when a matched peer answers
	- **peerId** ```<String>``` id of the node which answered
	- **err** ```<Object>``` error while executing request or undefined if all when fine
	- **data** ```<Object>``` node's answer
- **timeout** <Integer> number of milliseconds after which the request is cancelled
- **options** ```<Object>```
	- **bNotifyWhenFinished** <Boolean> if ```true```, callback will be executed one more time with ```data = '##END##'``` once all peer answered
	- **callback_partial** ```<Function>``` callback executed when a matched peer sends a partial answer
		- **peerId** ```<String>``` id of the node which answered
		- **err** ```<Object>``` error while executing request or undefined if everything went fine
		- **data** ```<Object>``` node's partial answer



#### d1(selector).subscribe(subscription, callback, option, timeout)

- **selector** ```<String | Array<String> | RegExp>``` selector that matches the target nodes
- **subscription** ```<Object>```
	- **service** ```<String>``` target service
	- **func** ```<String>``` target subscription 
	- **[obj]** ```<String | Array<String>>``` Optional target object's identifiers
	- **data** ```<Object>``` subscription's arguments
- **callback** ```<Function>``` callback executed when a matched peer emits an event 
	- **peerId** ```<String>``` id of the node which emitted an event
	- **err** ```<Object>``` error while executing request or undefined if all when fine
	- **data** ```<Object>``` node's event 




### Services

#### IEQ

See [doc/IEQ](doc/IEQ.md)


#### RTC

See [doc/RTC](doc/RTC.md)


## Hack the code
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

