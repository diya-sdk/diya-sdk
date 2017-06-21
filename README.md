Diya-SDK
========

Client-side Javascript library for interacting with Diya One Robots

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

## Use 

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

### Unix Socket

#### Open a UNIX socket and write on it

```js
d1("D1R01").openSocket("/tmp/echo_server.sock", (peerId, err, sock) => { // Open a DiyaSocket
	if (sock) { // The opened socket
		sock.write("Hello"); // Write on socket
	}
})
```

#### Read the socket

```js
sock.on('data', (buff) => console.log(buff.toString('ascii')));
```

#### Pipe on the socket
e.g. pipe on stdin:

```js
process.stdin.resume();
process.stdin.pipe(sock);
```

#### Be notified that the socket is closed

```js
sock.on('close', () => {
	console.log('Socket closed!');
})
```

#### Close the socket

```js
sock.disconnect();
```

#### Full example code

```js
var d1 = require('diya-sdk');
var WebSocket = require('ws');
var Promise = require('bluebird');

Promise.try(_ => { return d1.connectAsUser('wss://172.18.0.3/api', 'TheUserName', 'ThePassWord', WebSocket) })
.then(() => {
    console.log('connected !');
    d1("D1R01").openSocket("/tmp/echo_server.sock", (peerId, err, sock) => { // Open a DiyaSocket
        if (sock) { // The opened socket
            sock.write("Hello"); // Write on socket
            sock.on('data', (buff) => console.log(buff.toString('ascii')));
            process.stdin.resume();
            process.stdin.pipe(sock);
            sock.on('close', () => {
                console.log('Socket closed!');
            })
            process.on('SIGINT', () => {
                sock.disconnect();
                process.exit();
            });
        } else {
            console.log("Error: " + err)
        }
    });
})
.catch((error) => {
    console.log('game over : ' + error);
}); 
```
