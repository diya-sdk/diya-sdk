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
<script type="text/javascript" src="bower_components/diya-sdk.min.js"></script>

<script>
d1.connectAsUser('wss://localhost/api', 'toto', 'toto_password').then(function() {
    console.log('connected !');

    d1("#self").request({
        service: 'mon_service',
        func: 'ma_function',
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
        service: 'mon_service',
        func: 'ma_function',
        data: {
            foo: 'bar'
    }, function(peerId, err, data) {
        console.log(data);
    });

}).catch(function(error) {
    console.log('game over : '+ error);
}); 
```

