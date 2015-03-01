!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.diya=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":3,"_process":2,"inherits":1}],5:[function(require,module,exports){
/* Diya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */


var message = require('./services/message');

//Services
var auth = require('./services/auth/auth');
var timer = require('./services/timer/timer');
var rtc = require('./services/rtc/rtc');
var Promethe = require('./services/promethe/promethe');
var watchdog = require('./services/watchdog/watchdog');
var discover = require('./services/discover/discover');

var WebSocket = window.WebSocket || window.MozWebSocket;



 

function Diya(addr){
	var that = this;
	var socket;	

	var close_cb = null;

	var pendingRequests = [];
	var registeredListeners = [];

	var nextReqId = -1;
	function consumeNextReqId(){
		nextReqId++;
		return nextReqId;
	}

	var nextSubscriptionId = -1;
	function consumeNextSubscriptionId(){
		nextSubscriptionId++;
		return nextSubscriptionId;
	}
	
	function dispatch(msg){

		if(msg.reqId !== undefined){
			dispatchRequest(msg);
		}else if(msg.subId !== undefined){
			dispatchEvent(msg);
		}
		//If the msg doesn't have a reqId, it cannot be matched to a pending request
		else {
			console.log('missing reqId or subId. Ignoring msg : ');
			console.log(msg);
			return ;
		}

		
	}

	function dispatchRequest(msg){
		//If msg.reqId corresponds to a pending request, execute the response callback
		if(typeof pendingRequests[msg.reqId] === 'function'){
			console.log(msg);

			//execute the response callback, pass the message data as argument
			pendingRequests[msg.reqId](msg.data);
			delete pendingRequests[msg.reqId];
		}else{
			//No pending request for this reqId, ignoring response
			console.log('msg.reqId doesn\'t match any pending request, Ignoring msg ! '+msg);
			return ;
		}
	}

	function dispatchEvent(msg){
		//If msg.subId corresponds to a registered listener, execute the event callback
		if(typeof registeredListeners[msg.subId] === 'function'){
			console.log(msg);

			//execute the event callback, pass the message data as argument
			if(!msg.result || msg.result != 'closed'){
				registeredListeners[msg.subId](msg.data);
			}else{
				//If the subscription was closed, then remove the handler
				delete registeredListeners[msg.subId];
			}


		}else{
			//No pending request for this subId, ignoring event
			console.log('msg.subId doesn\'t match any registered listeners, Ignoring msg ! '+msg);
			return ;
		}
	}
	
	
	function send(msg){
		if(socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED){
			console.log("diya-SDK : cannot send message -> socket closed");
		}
		try{
			data = JSON.stringify(msg);
			socket.send(data);
		}catch(e){
			console.log('malformed JSON, ignoring msg...');
		}
	}	
	
	function handleMessage(incomingMessage){
		var msg;

		try{
			msg = JSON.parse(incomingMessage.data);
		}catch(e){
			console.log("malformed JSON");
			 
			return ;
		}
		
		dispatch(msg);

	};
	
	function closeAll(){
		while(pendingRequests.length){
			pendingRequests.pop();
		}
		while(registeredListeners.length){
			registeredListeners.pop();
		}

		console.log(close_cb);

		if(typeof close_cb === 'function'){
			close_cb();
		}
	}

	function createMessage(params){
		if(!params.service) return null;
		else return {
			service: params.service,
			func: params.func ? params.func : undefined,
			obj: params.obj ? params.obj : undefined,
			data: params.data ? params.data : undefined
		}
	}


	///////////////////////////////////
	//////////Public API///////////////
	///////////////////////////////////
	
	this.connect = function(callback, args){
		try{
			socket = new WebSocket(addr);

			socket.onerror = function(e){
				callback("Cannot Connect", null);
			}
			
			socket.onopen = function(){
				callback(null, args);
			};
			
			socket.onmessage = function(incomingMessage){
				handleMessage(incomingMessage);
			}
			
			socket.onclose = function(){
				closeAll();
			}
		}catch(e){
			console.log("can't connect to "+addr);
		}
	};

	this.get = function(params, callback){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.reqId = consumeNextReqId();
		pendingRequests[msg.reqId] = callback;

		send(msg);
	}

	this.listen = function(params, callback){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.subId = consumeNextSubscriptionId();
		registeredListeners[msg.subId] = callback;
		
		send(msg);

		return msg.subId;
	}

	this.closeCallback = function(cb){
		close_cb = cb;
	}

	this.stopListening = function(subId){
		msg = {
			func: 'Unsubscribe',
			data: {
				subId: subId
			}
		}

		send(msg);
	}

	this.connected = function(){
		return ! (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED);
	}

	this.disconnect = function(){
		socket.close();
	}
	
}


function DiyaClient(addr, user, password){

	var that = this;

	function createNode(){
		var node = new diya.Diya(addr);
		//nodes.push(node);

		return node;
	}

	this.setAddress = function(address){
		addr = address;
	}

	this.createSession = function(onconnected, onfailure){
		var node = createNode();

		node.connect(function(err){
			if(err){
				onfailure(err);
			}else{
				node.get({
					service: 'auth',
					func: 'Authenticate',
					data: {user: user, password: password}
				},
				function(res){
					if(res.authenticated || (res.error && res.error === 'ServiceNotFound')) onconnected(node);
					else onfailure();
				});
			}
		});	
	}
	
}


var diya = {
		DiyaClient: DiyaClient,
		Diya: Diya,
		auth: auth,
		timer: timer,
		rtc: rtc,
		Promethe: Promethe,
		watchdog: watchdog,
		discover: discover
}

module.exports = diya;

},{"./services/auth/auth":6,"./services/discover/discover":7,"./services/message":8,"./services/promethe/promethe":9,"./services/rtc/rtc":10,"./services/timer/timer":11,"./services/watchdog/watchdog":12}],6:[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */


var util = require('util');

var Message = require('../message');


function Authenticate(user, password, callback){
	Message.call(this, 'auth', 'Authenticate');
	
	this.user = user;
	this.password = password;
	this.callback = callback;
}
util.inherits(Authenticate, Message);

Authenticate.prototype.exec = function(){
	return Authenticate.super_.prototype.exec.call(this, {
			user: this.user,
			password: this.password
	});
}

Authenticate.prototype.parse = function(data){
	if(data.authenticated != undefined){
		this.callback(data.authenticated);
	}
}


var core = {
		Authenticate: Authenticate
}

module.exports = core;

},{"../message":8,"util":4}],7:[function(require,module,exports){
var dgram;

var networkIdRequest = 'diya-network-id\n';

var socket;
var callbacks = [];
var diyas = [];


var state = 'stopped';

function isNode(){
	if(dgram) return true;
	try{
		dgram = require('dgram'+'');
		return true;
	}catch(e){
		return false;
	}
}

function listen(callback){
	if(!isNode()) return ;
	callbacks.push(callback);
	
}

function removeOutdatedDiyas(){
	for(var i=0;i<diyas.length; i++){
		if(new Date().getTime() - diyas[i].touch > 10000){
			diyas.splice(i, 1);
		}
	}
}

function getDiya(name, port, address){
	for(var i=0; i<diyas.length; i++){
		if(diyas[i].name === name && diyas[i].addr === address+':'+port){
			return diyas[i];
		}
	}
	return null;
}

function gotDiya(name, port, address){


	var diya = getDiya(name, port, address);
	if(!diya){
		diya = {name: name, addr: address+':'+port};
		diyas.push(diya);
	}
	diya.touch = new Date().getTime();
}

function dispatchAnswer(name, port, address){
	for(var i=0;i<callbacks.length;i++){
		callbacks[i](name, port, address);
	}
}

function request(){
	socket.send(networkIdRequest, 0, networkIdRequest.length, 2000, '255.255.255.255');
}

function start(){
	if(!isNode()) return ;

	state = 'started';

	if(!socket){
		socket = dgram.createSocket('udp4');

		socket.on('message', function(data, rinfo){
			var msg = data.toString('ascii');
			var params = msg.split(':');
			
			if(params.length == 2){
				gotDiya(params[0], params[1], rinfo.address);
			}
		});

		socket.on('listening', function(){
			socket.setBroadcast(true);	
		});
	}

	function doDiscover(){
		request();
		removeOutdatedDiyas();

		if(state === 'started') setTimeout(doDiscover, 1000);
	}
	doDiscover();


}

function stop(){

	state = 'stopped';

	if(socket) socket.close();
	while(callbacks.length){
		callbacks.pop();
	}
}


function availableDiyas(){
	return diyas;
}

module.exports = {
	start: start,
	stop: stop,
	listen: listen,
	isDiscoverable: isNode,
	availableDiyas: availableDiyas
}
},{}],8:[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



function Message(service, func, obj, permanent){

	this.service = service;
	this.func = func;
	this.obj = obj;
	
	this.permanent = permanent; //If this flag is on, the command will stay on the callback list listening for events
}

Message.buildSignature = function(msg){
	return msg.service+'.'+msg.func+'.'+msg.obj;
}


Message.prototype.signature = function(){
	return this.service+'.'+this.func+'.'+this.obj;
}

Message.prototype.exec = function(data){
	return {
		service: this.service,
		func: this.func,
		obj: this.obj,
		data: data
	}
}

module.exports = Message;

},{}],9:[function(require,module,exports){
var RTC = require('../rtc/rtc');

function Promethe(session){
	this.rtc = new RTC.RTC(session);
}

Promethe.prototype.use = function(regex, callback){
	var that = this;
	this.rtc.use(regex, function(channel){
		that._negociateNeuron(channel, callback);
	});
}

Promethe.prototype.connect = function(){
	this.rtc.connect();
}

Promethe.prototype.disconnect = function(){
	this.rtc.disconnect();
}


Promethe.prototype._negociateNeuron = function(channel, callback){
	channel.setOnMessage(function(message){
		
		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if(typeChar === 'O'){
			//Input
			channel.type = 'input'; //Promethe Output = Client Input
		}else if(typeChar === 'I'){
			//Output
			channel.type = 'output'; //Promethe Input = Client Output
		}else{
			//Error
		}

		var size = view.getInt32(1,true);
		if(size != undefined){
			channel.size = size;
			channel._buffer = new Float32Array(size);
		}else{
			//error
		}



		channel.setOnMessage(undefined);

		channel.setOnValue = function(onvalue_cb){
			channel.setOnMessage(onvalue_cb);
		}

		channel.write = function(index, value){
			if(index < 0 || index > channel.size || isNaN(value)) return false;
			channel._buffer[index] = value;
			return true;
		}

		channel.frequency = 33;

		channel._run = function(){
			channel.send(channel._buffer);
			setTimeout(channel._run, channel.frequency);
		}

		channel._run();

		callback(channel);

	});
}


module.exports = Promethe;
},{"../rtc/rtc":10}],10:[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



var util = require('util');


var Message = require('../message');

/*==========================================*/
var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function Channel(name, open_cb){
	this.name = name;

	this.channel = undefined;
	this.onopen = open_cb;
}

Channel.prototype.setChannel = function(datachannel){
	this.channel = datachannel;

	var that = this;
	if(that.onopen) that.onopen(that);
}

Channel.prototype.setOnMessage = function(onmessage){
	this.channel.onmessage = onmessage;
}

Channel.prototype.send = function(msg){
	if(this.channel.readyState === 'open') this.channel.send(msg);
	else console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
}

function RTC(node){
	var that = this;
	
	this.node = node;
	this.availableChannels = [];
	this.usedChannels = [];

	this.requestedChannels = [];

	this.subscriptions = [];

	this.peers = [];
	
	this.id = -1;
}

RTC.prototype.use = function(name_regex, onopen_callback){
	this.requestedChannels.push({regex: name_regex, cb: onopen_callback});
}

RTC.prototype.disconnect = function(){
	for(var promID in this.peers){
		this.peers[promID].close();
		delete this.peers[promID];
	}
}

RTC.prototype.connect = function(){
	var that = this;

	var sub = this.node.listen({
		service: 'rtc',
		func: 'ListChannels'
	},
	function(data){
		//Match received channels with requested channels
		var channels = that._matchChannels(data.channels);
		//Initiate a new Connection
		that._doConnect(channels);		
	});

	this.subscriptions.push(sub);
}


RTC.prototype._matchChannels = function(receivedChannels){
	var that = this;

	//Contains all channels that will be passed to Connect as objects
	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];
		
		for(var j = 0; j < that.requestedChannels.length; j++){
			var req = that.requestedChannels[j];
			
			if(name && name.match(req.regex)){
				that.usedChannels[name] = new Channel(name, req.cb);
				channels.push(name); //prepare the connect object list
			}
		}
	}

	return channels;
};

RTC.prototype._doConnect = function(channels){
	var that = this;

	console.log(channels);

	var sub = this.node.listen({
		service: 'rtc',
		func: 'Connect',
		obj: channels
	},
	function(data){
		that._handleNegociationMessage(data);
	});

	this.subscriptions.push(sub);
};


RTC.prototype._handleNegociationMessage = function(msg){

	if(msg.eventType === 'RemoteOffer'){
		this.peers[msg.promID] = this._createPeer(msg);
	}else if(msg.eventType === 'RemoteICECandidate'){
		this._addRemoteICECandidate(this.peers[msg.promID], msg);
	}
};

var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
RTC.prototype._createPeer = function(data){
	var that = this;

	var peer = new RTCPeerConnection(servers, {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	console.log("create answer");

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		that.node.get({
			service: 'rtc',
			func: 'Answer',
			data:{
				promID: data.promID,
				peerId: data.peerId,
				sdp: session_description.sdp,
				type: session_description.type
			}
		});
	},
	function(err){
		console.log("cannot create answer");
	}, 
	{ 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });


	peer.oniceconnectionstatechange = function(){
		if(peer.iceConnectionState === 'connected'){
			//Unregister listeners
			//that._unsubscribeAll();
		}else if(peer.iceConnectionState === 'disconnected'){
			//try reconnect
		}
	}

	peer.onicecandidate = function(evt){
		
		that.node.get({
			service: 'rtc',
			func: 'ICECandidate',
			data:{
				peerId: data.peerId,
				promID: data.promID,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function(evt){
		that._onDataChannel(evt.channel);
	};

	peer.onaddstream = function(evt){
		console.log("ON ADD STREAM");
		var remoteView = document.querySelector("#myvid");
		remoteView.src = URL.createObjectURL(evt.stream);
	};

	peer.promID = data.promID;

	return peer;
}

RTC.prototype._addRemoteICECandidate = function(peer, data){
	try{
		var candidate = new RTCIceCandidate(data.candidate);
		peer.addIceCandidate(candidate,function(){
			console.log("candidate added ("+peer.iceConnectionState+")");
		},function(e){
			console.log(e);
		});
	}catch(e) {console.log(e);}
}

RTC.prototype._unsubscribeAll = function(){
	while(this.subscriptions.length){
		this.node.stopListening(this.subscriptions.pop());
	}
}

RTC.prototype._onClose = function(){

}

RTC.prototype._onDataChannel = function(datachannel){
	console.log("Channel "+datachannel.label+" created !");

	var channel = this.usedChannels[datachannel.label];
	if(!channel){
		datachannel.close();
		return ;
	}

	channel.setChannel(datachannel);
}


var exp = {
		RTC: RTC
}

module.exports = exp; 

},{"../message":8,"util":4}],11:[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



var util = require('util');

var Message = require('../message');

function Timer(period, ontime){
	Message.call(this, 'timer');
	
	this.period = period;
	this.ontime = ontime;
	
	if(period){
		this.loop = true;
		this.permanent = true;
	}
}
util.inherits(Timer, Message);

Timer.prototype.exec = function(){
	return Timer.super_.prototype.exec.call(this, {
		loop: this.loop,
		period: this.period
	});
}

Timer.prototype.parse = function(data){
	if(! data) return ;
	if(data.currentTime){
		this.ontime(data.currentTime);
	}
}



var timer = {
		Timer: Timer
}

module.exports = timer;

},{"../message":8,"util":4}],12:[function(require,module,exports){
/* diya-sdk
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

var util = require('util');

var Message = require('../message');


function ListServices(callback){
	Message.call(this, 'watchdog', 'ListServices');

	this.callback = callback;
}
util.inherits(ListServices, Message);

ListServices.prototype.exec = function(){
	return ListServices.super_.prototype.exec.call(this);
}

ListServices.prototype.parse = function(data){
	if(data.services && this.callback) this.callback(data.services);
}


module.exports = {
	ListServices: ListServices
}


},{"../message":8,"util":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zeWx2YWluL2Rldi93b3JrL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvd29yay9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvd29yay9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9zeWx2YWluL2Rldi93b3JrL2RpeWEtc2RrL3NyYy9kaXlhLXNkay5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L3dvcmsvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL2F1dGgvYXV0aC5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L3dvcmsvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL2Rpc2NvdmVyL2Rpc2NvdmVyLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvd29yay9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzc2FnZS5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L3dvcmsvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3Byb21ldGhlL3Byb21ldGhlLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvd29yay9kaXlhLXNkay9zcmMvc2VydmljZXMvcnRjL3J0Yy5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L3dvcmsvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3RpbWVyL3RpbWVyLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvd29yay9kaXlhLXNkay9zcmMvc2VydmljZXMvd2F0Y2hkb2cvd2F0Y2hkb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLyogRGl5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxudmFyIG1lc3NhZ2UgPSByZXF1aXJlKCcuL3NlcnZpY2VzL21lc3NhZ2UnKTtcblxuLy9TZXJ2aWNlc1xudmFyIGF1dGggPSByZXF1aXJlKCcuL3NlcnZpY2VzL2F1dGgvYXV0aCcpO1xudmFyIHRpbWVyID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy90aW1lci90aW1lcicpO1xudmFyIHJ0YyA9IHJlcXVpcmUoJy4vc2VydmljZXMvcnRjL3J0YycpO1xudmFyIFByb21ldGhlID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9wcm9tZXRoZS9wcm9tZXRoZScpO1xudmFyIHdhdGNoZG9nID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy93YXRjaGRvZy93YXRjaGRvZycpO1xudmFyIGRpc2NvdmVyID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9kaXNjb3Zlci9kaXNjb3ZlcicpO1xuXG52YXIgV2ViU29ja2V0ID0gd2luZG93LldlYlNvY2tldCB8fCB3aW5kb3cuTW96V2ViU29ja2V0O1xuXG5cblxuIFxuXG5mdW5jdGlvbiBEaXlhKGFkZHIpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBzb2NrZXQ7XHRcblxuXHR2YXIgY2xvc2VfY2IgPSBudWxsO1xuXG5cdHZhciBwZW5kaW5nUmVxdWVzdHMgPSBbXTtcblx0dmFyIHJlZ2lzdGVyZWRMaXN0ZW5lcnMgPSBbXTtcblxuXHR2YXIgbmV4dFJlcUlkID0gLTE7XG5cdGZ1bmN0aW9uIGNvbnN1bWVOZXh0UmVxSWQoKXtcblx0XHRuZXh0UmVxSWQrKztcblx0XHRyZXR1cm4gbmV4dFJlcUlkO1xuXHR9XG5cblx0dmFyIG5leHRTdWJzY3JpcHRpb25JZCA9IC0xO1xuXHRmdW5jdGlvbiBjb25zdW1lTmV4dFN1YnNjcmlwdGlvbklkKCl7XG5cdFx0bmV4dFN1YnNjcmlwdGlvbklkKys7XG5cdFx0cmV0dXJuIG5leHRTdWJzY3JpcHRpb25JZDtcblx0fVxuXHRcblx0ZnVuY3Rpb24gZGlzcGF0Y2gobXNnKXtcblxuXHRcdGlmKG1zZy5yZXFJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoUmVxdWVzdChtc2cpO1xuXHRcdH1lbHNlIGlmKG1zZy5zdWJJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoRXZlbnQobXNnKTtcblx0XHR9XG5cdFx0Ly9JZiB0aGUgbXNnIGRvZXNuJ3QgaGF2ZSBhIHJlcUlkLCBpdCBjYW5ub3QgYmUgbWF0Y2hlZCB0byBhIHBlbmRpbmcgcmVxdWVzdFxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ21pc3NpbmcgcmVxSWQgb3Igc3ViSWQuIElnbm9yaW5nIG1zZyA6ICcpO1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0XG5cdH1cblxuXHRmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QobXNnKXtcblx0XHQvL0lmIG1zZy5yZXFJZCBjb3JyZXNwb25kcyB0byBhIHBlbmRpbmcgcmVxdWVzdCwgZXhlY3V0ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0gPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0Ly9leGVjdXRlIHRoZSByZXNwb25zZSBjYWxsYmFjaywgcGFzcyB0aGUgbWVzc2FnZSBkYXRhIGFzIGFyZ3VtZW50XG5cdFx0XHRwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXShtc2cuZGF0YSk7XG5cdFx0XHRkZWxldGUgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF07XG5cdFx0fWVsc2V7XG5cdFx0XHQvL05vIHBlbmRpbmcgcmVxdWVzdCBmb3IgdGhpcyByZXFJZCwgaWdub3JpbmcgcmVzcG9uc2Vcblx0XHRcdGNvbnNvbGUubG9nKCdtc2cucmVxSWQgZG9lc25cXCd0IG1hdGNoIGFueSBwZW5kaW5nIHJlcXVlc3QsIElnbm9yaW5nIG1zZyAhICcrbXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChtc2cpe1xuXHRcdC8vSWYgbXNnLnN1YklkIGNvcnJlc3BvbmRzIHRvIGEgcmVnaXN0ZXJlZCBsaXN0ZW5lciwgZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cblx0XHRcdC8vZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2ssIHBhc3MgdGhlIG1lc3NhZ2UgZGF0YSBhcyBhcmd1bWVudFxuXHRcdFx0aWYoIW1zZy5yZXN1bHQgfHwgbXNnLnJlc3VsdCAhPSAnY2xvc2VkJyl7XG5cdFx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXShtc2cuZGF0YSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Ly9JZiB0aGUgc3Vic2NyaXB0aW9uIHdhcyBjbG9zZWQsIHRoZW4gcmVtb3ZlIHRoZSBoYW5kbGVyXG5cdFx0XHRcdGRlbGV0ZSByZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF07XG5cdFx0XHR9XG5cblxuXHRcdH1lbHNle1xuXHRcdFx0Ly9ObyBwZW5kaW5nIHJlcXVlc3QgZm9yIHRoaXMgc3ViSWQsIGlnbm9yaW5nIGV2ZW50XG5cdFx0XHRjb25zb2xlLmxvZygnbXNnLnN1YklkIGRvZXNuXFwndCBtYXRjaCBhbnkgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMsIElnbm9yaW5nIG1zZyAhICcrbXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHR9XG5cdFxuXHRcblx0ZnVuY3Rpb24gc2VuZChtc2cpe1xuXHRcdGlmKHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORyB8fCBzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImRpeWEtU0RLIDogY2Fubm90IHNlbmQgbWVzc2FnZSAtPiBzb2NrZXQgY2xvc2VkXCIpO1xuXHRcdH1cblx0XHR0cnl7XG5cdFx0XHRkYXRhID0gSlNPTi5zdHJpbmdpZnkobXNnKTtcblx0XHRcdHNvY2tldC5zZW5kKGRhdGEpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKCdtYWxmb3JtZWQgSlNPTiwgaWdub3JpbmcgbXNnLi4uJyk7XG5cdFx0fVxuXHR9XHRcblx0XG5cdGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoaW5jb21pbmdNZXNzYWdlKXtcblx0XHR2YXIgbXNnO1xuXG5cdFx0dHJ5e1xuXHRcdFx0bXNnID0gSlNPTi5wYXJzZShpbmNvbWluZ01lc3NhZ2UuZGF0YSk7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJtYWxmb3JtZWQgSlNPTlwiKTtcblx0XHRcdCBcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHRcdFxuXHRcdGRpc3BhdGNoKG1zZyk7XG5cblx0fTtcblx0XG5cdGZ1bmN0aW9uIGNsb3NlQWxsKCl7XG5cdFx0d2hpbGUocGVuZGluZ1JlcXVlc3RzLmxlbmd0aCl7XG5cdFx0XHRwZW5kaW5nUmVxdWVzdHMucG9wKCk7XG5cdFx0fVxuXHRcdHdoaWxlKHJlZ2lzdGVyZWRMaXN0ZW5lcnMubGVuZ3RoKXtcblx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnMucG9wKCk7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coY2xvc2VfY2IpO1xuXG5cdFx0aWYodHlwZW9mIGNsb3NlX2NiID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNsb3NlX2NiKCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlTWVzc2FnZShwYXJhbXMpe1xuXHRcdGlmKCFwYXJhbXMuc2VydmljZSkgcmV0dXJuIG51bGw7XG5cdFx0ZWxzZSByZXR1cm4ge1xuXHRcdFx0c2VydmljZTogcGFyYW1zLnNlcnZpY2UsXG5cdFx0XHRmdW5jOiBwYXJhbXMuZnVuYyA/IHBhcmFtcy5mdW5jIDogdW5kZWZpbmVkLFxuXHRcdFx0b2JqOiBwYXJhbXMub2JqID8gcGFyYW1zLm9iaiA6IHVuZGVmaW5lZCxcblx0XHRcdGRhdGE6IHBhcmFtcy5kYXRhID8gcGFyYW1zLmRhdGEgOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy9QdWJsaWMgQVBJLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFxuXHR0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihjYWxsYmFjaywgYXJncyl7XG5cdFx0dHJ5e1xuXHRcdFx0c29ja2V0ID0gbmV3IFdlYlNvY2tldChhZGRyKTtcblxuXHRcdFx0c29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcblx0XHRcdFx0Y2FsbGJhY2soXCJDYW5ub3QgQ29ubmVjdFwiLCBudWxsKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIGFyZ3MpO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGluY29taW5nTWVzc2FnZSl7XG5cdFx0XHRcdGhhbmRsZU1lc3NhZ2UoaW5jb21pbmdNZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRjbG9zZUFsbCgpO1xuXHRcdFx0fVxuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiY2FuJ3QgY29ubmVjdCB0byBcIithZGRyKTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy5nZXQgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrKXtcblx0XHR2YXIgbXNnID0gY3JlYXRlTWVzc2FnZShwYXJhbXMpO1xuXHRcdGlmKG1zZyA9PT0gbnVsbCkgcmV0dXJuIDtcblxuXHRcdG1zZy5yZXFJZCA9IGNvbnN1bWVOZXh0UmVxSWQoKTtcblx0XHRwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXSA9IGNhbGxiYWNrO1xuXG5cdFx0c2VuZChtc2cpO1xuXHR9XG5cblx0dGhpcy5saXN0ZW4gPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrKXtcblx0XHR2YXIgbXNnID0gY3JlYXRlTWVzc2FnZShwYXJhbXMpO1xuXHRcdGlmKG1zZyA9PT0gbnVsbCkgcmV0dXJuIDtcblxuXHRcdG1zZy5zdWJJZCA9IGNvbnN1bWVOZXh0U3Vic2NyaXB0aW9uSWQoKTtcblx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF0gPSBjYWxsYmFjaztcblx0XHRcblx0XHRzZW5kKG1zZyk7XG5cblx0XHRyZXR1cm4gbXNnLnN1YklkO1xuXHR9XG5cblx0dGhpcy5jbG9zZUNhbGxiYWNrID0gZnVuY3Rpb24oY2Ipe1xuXHRcdGNsb3NlX2NiID0gY2I7XG5cdH1cblxuXHR0aGlzLnN0b3BMaXN0ZW5pbmcgPSBmdW5jdGlvbihzdWJJZCl7XG5cdFx0bXNnID0ge1xuXHRcdFx0ZnVuYzogJ1Vuc3Vic2NyaWJlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c3ViSWQ6IHN1YklkXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c2VuZChtc2cpO1xuXHR9XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiAhIChzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NJTkcgfHwgc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpO1xuXHR9XG5cblx0dGhpcy5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0XHRzb2NrZXQuY2xvc2UoKTtcblx0fVxuXHRcbn1cblxuXG5mdW5jdGlvbiBEaXlhQ2xpZW50KGFkZHIsIHVzZXIsIHBhc3N3b3JkKXtcblxuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0ZnVuY3Rpb24gY3JlYXRlTm9kZSgpe1xuXHRcdHZhciBub2RlID0gbmV3IGRpeWEuRGl5YShhZGRyKTtcblx0XHQvL25vZGVzLnB1c2gobm9kZSk7XG5cblx0XHRyZXR1cm4gbm9kZTtcblx0fVxuXG5cdHRoaXMuc2V0QWRkcmVzcyA9IGZ1bmN0aW9uKGFkZHJlc3Mpe1xuXHRcdGFkZHIgPSBhZGRyZXNzO1xuXHR9XG5cblx0dGhpcy5jcmVhdGVTZXNzaW9uID0gZnVuY3Rpb24ob25jb25uZWN0ZWQsIG9uZmFpbHVyZSl7XG5cdFx0dmFyIG5vZGUgPSBjcmVhdGVOb2RlKCk7XG5cblx0XHRub2RlLmNvbm5lY3QoZnVuY3Rpb24oZXJyKXtcblx0XHRcdGlmKGVycil7XG5cdFx0XHRcdG9uZmFpbHVyZShlcnIpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdG5vZGUuZ2V0KHtcblx0XHRcdFx0XHRzZXJ2aWNlOiAnYXV0aCcsXG5cdFx0XHRcdFx0ZnVuYzogJ0F1dGhlbnRpY2F0ZScsXG5cdFx0XHRcdFx0ZGF0YToge3VzZXI6IHVzZXIsIHBhc3N3b3JkOiBwYXNzd29yZH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24ocmVzKXtcblx0XHRcdFx0XHRpZihyZXMuYXV0aGVudGljYXRlZCB8fCAocmVzLmVycm9yICYmIHJlcy5lcnJvciA9PT0gJ1NlcnZpY2VOb3RGb3VuZCcpKSBvbmNvbm5lY3RlZChub2RlKTtcblx0XHRcdFx0XHRlbHNlIG9uZmFpbHVyZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcdFxuXHR9XG5cdFxufVxuXG5cbnZhciBkaXlhID0ge1xuXHRcdERpeWFDbGllbnQ6IERpeWFDbGllbnQsXG5cdFx0RGl5YTogRGl5YSxcblx0XHRhdXRoOiBhdXRoLFxuXHRcdHRpbWVyOiB0aW1lcixcblx0XHRydGM6IHJ0Yyxcblx0XHRQcm9tZXRoZTogUHJvbWV0aGUsXG5cdFx0d2F0Y2hkb2c6IHdhdGNoZG9nLFxuXHRcdGRpc2NvdmVyOiBkaXNjb3ZlclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpeWE7XG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cblxuZnVuY3Rpb24gQXV0aGVudGljYXRlKHVzZXIsIHBhc3N3b3JkLCBjYWxsYmFjayl7XG5cdE1lc3NhZ2UuY2FsbCh0aGlzLCAnYXV0aCcsICdBdXRoZW50aWNhdGUnKTtcblx0XG5cdHRoaXMudXNlciA9IHVzZXI7XG5cdHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZDtcblx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xufVxudXRpbC5pbmhlcml0cyhBdXRoZW50aWNhdGUsIE1lc3NhZ2UpO1xuXG5BdXRoZW50aWNhdGUucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gQXV0aGVudGljYXRlLnN1cGVyXy5wcm90b3R5cGUuZXhlYy5jYWxsKHRoaXMsIHtcblx0XHRcdHVzZXI6IHRoaXMudXNlcixcblx0XHRcdHBhc3N3b3JkOiB0aGlzLnBhc3N3b3JkXG5cdH0pO1xufVxuXG5BdXRoZW50aWNhdGUucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSl7XG5cdGlmKGRhdGEuYXV0aGVudGljYXRlZCAhPSB1bmRlZmluZWQpe1xuXHRcdHRoaXMuY2FsbGJhY2soZGF0YS5hdXRoZW50aWNhdGVkKTtcblx0fVxufVxuXG5cbnZhciBjb3JlID0ge1xuXHRcdEF1dGhlbnRpY2F0ZTogQXV0aGVudGljYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29yZTtcbiIsInZhciBkZ3JhbTtcblxudmFyIG5ldHdvcmtJZFJlcXVlc3QgPSAnZGl5YS1uZXR3b3JrLWlkXFxuJztcblxudmFyIHNvY2tldDtcbnZhciBjYWxsYmFja3MgPSBbXTtcbnZhciBkaXlhcyA9IFtdO1xuXG5cbnZhciBzdGF0ZSA9ICdzdG9wcGVkJztcblxuZnVuY3Rpb24gaXNOb2RlKCl7XG5cdGlmKGRncmFtKSByZXR1cm4gdHJ1ZTtcblx0dHJ5e1xuXHRcdGRncmFtID0gcmVxdWlyZSgnZGdyYW0nKycnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fWNhdGNoKGUpe1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0ZW4oY2FsbGJhY2spe1xuXHRpZighaXNOb2RlKCkpIHJldHVybiA7XG5cdGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblx0XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU91dGRhdGVkRGl5YXMoKXtcblx0Zm9yKHZhciBpPTA7aTxkaXlhcy5sZW5ndGg7IGkrKyl7XG5cdFx0aWYobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBkaXlhc1tpXS50b3VjaCA+IDEwMDAwKXtcblx0XHRcdGRpeWFzLnNwbGljZShpLCAxKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKXtcblx0Zm9yKHZhciBpPTA7IGk8ZGl5YXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKGRpeWFzW2ldLm5hbWUgPT09IG5hbWUgJiYgZGl5YXNbaV0uYWRkciA9PT0gYWRkcmVzcysnOicrcG9ydCl7XG5cdFx0XHRyZXR1cm4gZGl5YXNbaV07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBnb3REaXlhKG5hbWUsIHBvcnQsIGFkZHJlc3Mpe1xuXG5cblx0dmFyIGRpeWEgPSBnZXREaXlhKG5hbWUsIHBvcnQsIGFkZHJlc3MpO1xuXHRpZighZGl5YSl7XG5cdFx0ZGl5YSA9IHtuYW1lOiBuYW1lLCBhZGRyOiBhZGRyZXNzKyc6Jytwb3J0fTtcblx0XHRkaXlhcy5wdXNoKGRpeWEpO1xuXHR9XG5cdGRpeWEudG91Y2ggPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hBbnN3ZXIobmFtZSwgcG9ydCwgYWRkcmVzcyl7XG5cdGZvcih2YXIgaT0wO2k8Y2FsbGJhY2tzLmxlbmd0aDtpKyspe1xuXHRcdGNhbGxiYWNrc1tpXShuYW1lLCBwb3J0LCBhZGRyZXNzKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZXF1ZXN0KCl7XG5cdHNvY2tldC5zZW5kKG5ldHdvcmtJZFJlcXVlc3QsIDAsIG5ldHdvcmtJZFJlcXVlc3QubGVuZ3RoLCAyMDAwLCAnMjU1LjI1NS4yNTUuMjU1Jyk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0KCl7XG5cdGlmKCFpc05vZGUoKSkgcmV0dXJuIDtcblxuXHRzdGF0ZSA9ICdzdGFydGVkJztcblxuXHRpZighc29ja2V0KXtcblx0XHRzb2NrZXQgPSBkZ3JhbS5jcmVhdGVTb2NrZXQoJ3VkcDQnKTtcblxuXHRcdHNvY2tldC5vbignbWVzc2FnZScsIGZ1bmN0aW9uKGRhdGEsIHJpbmZvKXtcblx0XHRcdHZhciBtc2cgPSBkYXRhLnRvU3RyaW5nKCdhc2NpaScpO1xuXHRcdFx0dmFyIHBhcmFtcyA9IG1zZy5zcGxpdCgnOicpO1xuXHRcdFx0XG5cdFx0XHRpZihwYXJhbXMubGVuZ3RoID09IDIpe1xuXHRcdFx0XHRnb3REaXlhKHBhcmFtc1swXSwgcGFyYW1zWzFdLCByaW5mby5hZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHNvY2tldC5vbignbGlzdGVuaW5nJywgZnVuY3Rpb24oKXtcblx0XHRcdHNvY2tldC5zZXRCcm9hZGNhc3QodHJ1ZSk7XHRcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRvRGlzY292ZXIoKXtcblx0XHRyZXF1ZXN0KCk7XG5cdFx0cmVtb3ZlT3V0ZGF0ZWREaXlhcygpO1xuXG5cdFx0aWYoc3RhdGUgPT09ICdzdGFydGVkJykgc2V0VGltZW91dChkb0Rpc2NvdmVyLCAxMDAwKTtcblx0fVxuXHRkb0Rpc2NvdmVyKCk7XG5cblxufVxuXG5mdW5jdGlvbiBzdG9wKCl7XG5cblx0c3RhdGUgPSAnc3RvcHBlZCc7XG5cblx0aWYoc29ja2V0KSBzb2NrZXQuY2xvc2UoKTtcblx0d2hpbGUoY2FsbGJhY2tzLmxlbmd0aCl7XG5cdFx0Y2FsbGJhY2tzLnBvcCgpO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gYXZhaWxhYmxlRGl5YXMoKXtcblx0cmV0dXJuIGRpeWFzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c3RhcnQ6IHN0YXJ0LFxuXHRzdG9wOiBzdG9wLFxuXHRsaXN0ZW46IGxpc3Rlbixcblx0aXNEaXNjb3ZlcmFibGU6IGlzTm9kZSxcblx0YXZhaWxhYmxlRGl5YXM6IGF2YWlsYWJsZURpeWFzXG59IiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG5mdW5jdGlvbiBNZXNzYWdlKHNlcnZpY2UsIGZ1bmMsIG9iaiwgcGVybWFuZW50KXtcblxuXHR0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXHR0aGlzLmZ1bmMgPSBmdW5jO1xuXHR0aGlzLm9iaiA9IG9iajtcblx0XG5cdHRoaXMucGVybWFuZW50ID0gcGVybWFuZW50OyAvL0lmIHRoaXMgZmxhZyBpcyBvbiwgdGhlIGNvbW1hbmQgd2lsbCBzdGF5IG9uIHRoZSBjYWxsYmFjayBsaXN0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG59XG5cbk1lc3NhZ2UuYnVpbGRTaWduYXR1cmUgPSBmdW5jdGlvbihtc2cpe1xuXHRyZXR1cm4gbXNnLnNlcnZpY2UrJy4nK21zZy5mdW5jKycuJyttc2cub2JqO1xufVxuXG5cbk1lc3NhZ2UucHJvdG90eXBlLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnNlcnZpY2UrJy4nK3RoaXMuZnVuYysnLicrdGhpcy5vYmo7XG59XG5cbk1lc3NhZ2UucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbihkYXRhKXtcblx0cmV0dXJuIHtcblx0XHRzZXJ2aWNlOiB0aGlzLnNlcnZpY2UsXG5cdFx0ZnVuYzogdGhpcy5mdW5jLFxuXHRcdG9iajogdGhpcy5vYmosXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZTtcbiIsInZhciBSVEMgPSByZXF1aXJlKCcuLi9ydGMvcnRjJyk7XG5cbmZ1bmN0aW9uIFByb21ldGhlKHNlc3Npb24pe1xuXHR0aGlzLnJ0YyA9IG5ldyBSVEMuUlRDKHNlc3Npb24pO1xufVxuXG5Qcm9tZXRoZS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24ocmVnZXgsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnJ0Yy51c2UocmVnZXgsIGZ1bmN0aW9uKGNoYW5uZWwpe1xuXHRcdHRoYXQuX25lZ29jaWF0ZU5ldXJvbihjaGFubmVsLCBjYWxsYmFjayk7XG5cdH0pO1xufVxuXG5Qcm9tZXRoZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMucnRjLmNvbm5lY3QoKTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5kaXNjb25uZWN0KCk7XG59XG5cblxuUHJvbWV0aGUucHJvdG90eXBlLl9uZWdvY2lhdGVOZXVyb24gPSBmdW5jdGlvbihjaGFubmVsLCBjYWxsYmFjayl7XG5cdGNoYW5uZWwuc2V0T25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdFxuXHRcdHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KG1lc3NhZ2UuZGF0YSk7XG5cblx0XHR2YXIgdHlwZUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXcuZ2V0VWludDgoMCkpO1xuXHRcdGlmKHR5cGVDaGFyID09PSAnTycpe1xuXHRcdFx0Ly9JbnB1dFxuXHRcdFx0Y2hhbm5lbC50eXBlID0gJ2lucHV0JzsgLy9Qcm9tZXRoZSBPdXRwdXQgPSBDbGllbnQgSW5wdXRcblx0XHR9ZWxzZSBpZih0eXBlQ2hhciA9PT0gJ0knKXtcblx0XHRcdC8vT3V0cHV0XG5cdFx0XHRjaGFubmVsLnR5cGUgPSAnb3V0cHV0JzsgLy9Qcm9tZXRoZSBJbnB1dCA9IENsaWVudCBPdXRwdXRcblx0XHR9ZWxzZXtcblx0XHRcdC8vRXJyb3Jcblx0XHR9XG5cblx0XHR2YXIgc2l6ZSA9IHZpZXcuZ2V0SW50MzIoMSx0cnVlKTtcblx0XHRpZihzaXplICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRjaGFubmVsLnNpemUgPSBzaXplO1xuXHRcdFx0Y2hhbm5lbC5fYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblx0XHR9ZWxzZXtcblx0XHRcdC8vZXJyb3Jcblx0XHR9XG5cblxuXG5cdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2UodW5kZWZpbmVkKTtcblxuXHRcdGNoYW5uZWwuc2V0T25WYWx1ZSA9IGZ1bmN0aW9uKG9udmFsdWVfY2Ipe1xuXHRcdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2Uob252YWx1ZV9jYik7XG5cdFx0fVxuXG5cdFx0Y2hhbm5lbC53cml0ZSA9IGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFubmVsLnNpemUgfHwgaXNOYU4odmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjaGFubmVsLl9idWZmZXJbaW5kZXhdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRjaGFubmVsLmZyZXF1ZW5jeSA9IDMzO1xuXG5cdFx0Y2hhbm5lbC5fcnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdGNoYW5uZWwuc2VuZChjaGFubmVsLl9idWZmZXIpO1xuXHRcdFx0c2V0VGltZW91dChjaGFubmVsLl9ydW4sIGNoYW5uZWwuZnJlcXVlbmN5KTtcblx0XHR9XG5cblx0XHRjaGFubmVsLl9ydW4oKTtcblxuXHRcdGNhbGxiYWNrKGNoYW5uZWwpO1xuXG5cdH0pO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWV0aGU7IiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cblxudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cbi8qPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cbnZhciBSVENQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uO1xudmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgfHwgd2luZG93Lm1velJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cud2Via2l0UlRDSWNlQ2FuZGlkYXRlO1xudmFyIFJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93Lm1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xuXG5mdW5jdGlvbiBDaGFubmVsKG5hbWUsIG9wZW5fY2Ipe1xuXHR0aGlzLm5hbWUgPSBuYW1lO1xuXG5cdHRoaXMuY2hhbm5lbCA9IHVuZGVmaW5lZDtcblx0dGhpcy5vbm9wZW4gPSBvcGVuX2NiO1xufVxuXG5DaGFubmVsLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24oZGF0YWNoYW5uZWwpe1xuXHR0aGlzLmNoYW5uZWwgPSBkYXRhY2hhbm5lbDtcblxuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKHRoYXQub25vcGVuKSB0aGF0Lm9ub3Blbih0aGF0KTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuc2V0T25NZXNzYWdlID0gZnVuY3Rpb24ob25tZXNzYWdlKXtcblx0dGhpcy5jaGFubmVsLm9ubWVzc2FnZSA9IG9ubWVzc2FnZTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKG1zZyl7XG5cdGlmKHRoaXMuY2hhbm5lbC5yZWFkeVN0YXRlID09PSAnb3BlbicpIHRoaXMuY2hhbm5lbC5zZW5kKG1zZyk7XG5cdGVsc2UgY29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gd2FybmluZyA6IHdlYnJ0YyBkYXRhY2hhbm5lbCBzdGF0ZSA9ICcrdGhpcy5jaGFubmVsLnJlYWR5U3RhdGUpO1xufVxuXG5mdW5jdGlvbiBSVEMobm9kZSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdHRoaXMuYXZhaWxhYmxlQ2hhbm5lbHMgPSBbXTtcblx0dGhpcy51c2VkQ2hhbm5lbHMgPSBbXTtcblxuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzID0gW107XG5cblx0dGhpcy5zdWJzY3JpcHRpb25zID0gW107XG5cblx0dGhpcy5wZWVycyA9IFtdO1xuXHRcblx0dGhpcy5pZCA9IC0xO1xufVxuXG5SVEMucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKG5hbWVfcmVnZXgsIG9ub3Blbl9jYWxsYmFjayl7XG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMucHVzaCh7cmVnZXg6IG5hbWVfcmVnZXgsIGNiOiBvbm9wZW5fY2FsbGJhY2t9KTtcbn1cblxuUlRDLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0Zm9yKHZhciBwcm9tSUQgaW4gdGhpcy5wZWVycyl7XG5cdFx0dGhpcy5wZWVyc1twcm9tSURdLmNsb3NlKCk7XG5cdFx0ZGVsZXRlIHRoaXMucGVlcnNbcHJvbUlEXTtcblx0fVxufVxuXG5SVEMucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIHN1YiA9IHRoaXMubm9kZS5saXN0ZW4oe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdMaXN0Q2hhbm5lbHMnXG5cdH0sXG5cdGZ1bmN0aW9uKGRhdGEpe1xuXHRcdC8vTWF0Y2ggcmVjZWl2ZWQgY2hhbm5lbHMgd2l0aCByZXF1ZXN0ZWQgY2hhbm5lbHNcblx0XHR2YXIgY2hhbm5lbHMgPSB0aGF0Ll9tYXRjaENoYW5uZWxzKGRhdGEuY2hhbm5lbHMpO1xuXHRcdC8vSW5pdGlhdGUgYSBuZXcgQ29ubmVjdGlvblxuXHRcdHRoYXQuX2RvQ29ubmVjdChjaGFubmVscyk7XHRcdFxuXHR9KTtcblxuXHR0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChzdWIpO1xufVxuXG5cblJUQy5wcm90b3R5cGUuX21hdGNoQ2hhbm5lbHMgPSBmdW5jdGlvbihyZWNlaXZlZENoYW5uZWxzKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8vQ29udGFpbnMgYWxsIGNoYW5uZWxzIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gQ29ubmVjdCBhcyBvYmplY3RzXG5cdHZhciBjaGFubmVscyA9IFtdO1xuXG5cdGZvcih2YXIgaSA9IDA7IGkgPCByZWNlaXZlZENoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgbmFtZSA9IHJlY2VpdmVkQ2hhbm5lbHNbaV07XG5cdFx0XG5cdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRoYXQucmVxdWVzdGVkQ2hhbm5lbHMubGVuZ3RoOyBqKyspe1xuXHRcdFx0dmFyIHJlcSA9IHRoYXQucmVxdWVzdGVkQ2hhbm5lbHNbal07XG5cdFx0XHRcblx0XHRcdGlmKG5hbWUgJiYgbmFtZS5tYXRjaChyZXEucmVnZXgpKXtcblx0XHRcdFx0dGhhdC51c2VkQ2hhbm5lbHNbbmFtZV0gPSBuZXcgQ2hhbm5lbChuYW1lLCByZXEuY2IpO1xuXHRcdFx0XHRjaGFubmVscy5wdXNoKG5hbWUpOyAvL3ByZXBhcmUgdGhlIGNvbm5lY3Qgb2JqZWN0IGxpc3Rcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY2hhbm5lbHM7XG59O1xuXG5SVEMucHJvdG90eXBlLl9kb0Nvbm5lY3QgPSBmdW5jdGlvbihjaGFubmVscyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHRjb25zb2xlLmxvZyhjaGFubmVscyk7XG5cblx0dmFyIHN1YiA9IHRoaXMubm9kZS5saXN0ZW4oe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdDb25uZWN0Jyxcblx0XHRvYmo6IGNoYW5uZWxzXG5cdH0sXG5cdGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHRoYXQuX2hhbmRsZU5lZ29jaWF0aW9uTWVzc2FnZShkYXRhKTtcblx0fSk7XG5cblx0dGhpcy5zdWJzY3JpcHRpb25zLnB1c2goc3ViKTtcbn07XG5cblxuUlRDLnByb3RvdHlwZS5faGFuZGxlTmVnb2NpYXRpb25NZXNzYWdlID0gZnVuY3Rpb24obXNnKXtcblxuXHRpZihtc2cuZXZlbnRUeXBlID09PSAnUmVtb3RlT2ZmZXInKXtcblx0XHR0aGlzLnBlZXJzW21zZy5wcm9tSURdID0gdGhpcy5fY3JlYXRlUGVlcihtc2cpO1xuXHR9ZWxzZSBpZihtc2cuZXZlbnRUeXBlID09PSAnUmVtb3RlSUNFQ2FuZGlkYXRlJyl7XG5cdFx0dGhpcy5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlKHRoaXMucGVlcnNbbXNnLnByb21JRF0sIG1zZyk7XG5cdH1cbn07XG5cbnZhciBzZXJ2ZXJzID0ge1wiaWNlU2VydmVyc1wiOiBbe1widXJsXCI6IFwic3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMlwifV19O1xuUlRDLnByb3RvdHlwZS5fY3JlYXRlUGVlciA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIHBlZXIgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oc2VydmVycywge21hbmRhdG9yeTogW3tEdGxzU3J0cEtleUFncmVlbWVudDogdHJ1ZX0sIHtFbmFibGVEdGxzU3J0cDogdHJ1ZX1dfSk7XG5cblx0cGVlci5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtzZHA6IGRhdGEuc2RwLCB0eXBlOiBkYXRhLnR5cGV9KSk7XG5cblx0Y29uc29sZS5sb2coXCJjcmVhdGUgYW5zd2VyXCIpO1xuXG5cdHBlZXIuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRcdHBlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKTtcblxuXHRcdHRoYXQubm9kZS5nZXQoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnQW5zd2VyJyxcblx0XHRcdGRhdGE6e1xuXHRcdFx0XHRwcm9tSUQ6IGRhdGEucHJvbUlELFxuXHRcdFx0XHRwZWVySWQ6IGRhdGEucGVlcklkLFxuXHRcdFx0XHRzZHA6IHNlc3Npb25fZGVzY3JpcHRpb24uc2RwLFxuXHRcdFx0XHR0eXBlOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnR5cGVcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0ZnVuY3Rpb24oZXJyKXtcblx0XHRjb25zb2xlLmxvZyhcImNhbm5vdCBjcmVhdGUgYW5zd2VyXCIpO1xuXHR9LCBcblx0eyAnbWFuZGF0b3J5JzogeyAnT2ZmZXJUb1JlY2VpdmVBdWRpbyc6IHRydWUsICdPZmZlclRvUmVjZWl2ZVZpZGVvJzogdHJ1ZSB9IH0pO1xuXG5cblx0cGVlci5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjb25uZWN0ZWQnKXtcblx0XHRcdC8vVW5yZWdpc3RlciBsaXN0ZW5lcnNcblx0XHRcdC8vdGhhdC5fdW5zdWJzY3JpYmVBbGwoKTtcblx0XHR9ZWxzZSBpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Rpc2Nvbm5lY3RlZCcpe1xuXHRcdFx0Ly90cnkgcmVjb25uZWN0XG5cdFx0fVxuXHR9XG5cblx0cGVlci5vbmljZWNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGV2dCl7XG5cdFx0XG5cdFx0dGhhdC5ub2RlLmdldCh7XG5cdFx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRcdGZ1bmM6ICdJQ0VDYW5kaWRhdGUnLFxuXHRcdFx0ZGF0YTp7XG5cdFx0XHRcdHBlZXJJZDogZGF0YS5wZWVySWQsXG5cdFx0XHRcdHByb21JRDogZGF0YS5wcm9tSUQsXG5cdFx0XHRcdGNhbmRpZGF0ZTogZXZ0LmNhbmRpZGF0ZVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9O1xuXG5cdHBlZXIub25kYXRhY2hhbm5lbCA9IGZ1bmN0aW9uKGV2dCl7XG5cdFx0dGhhdC5fb25EYXRhQ2hhbm5lbChldnQuY2hhbm5lbCk7XG5cdH07XG5cblx0cGVlci5vbmFkZHN0cmVhbSA9IGZ1bmN0aW9uKGV2dCl7XG5cdFx0Y29uc29sZS5sb2coXCJPTiBBREQgU1RSRUFNXCIpO1xuXHRcdHZhciByZW1vdGVWaWV3ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNteXZpZFwiKTtcblx0XHRyZW1vdGVWaWV3LnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZXZ0LnN0cmVhbSk7XG5cdH07XG5cblx0cGVlci5wcm9tSUQgPSBkYXRhLnByb21JRDtcblxuXHRyZXR1cm4gcGVlcjtcbn1cblxuUlRDLnByb3RvdHlwZS5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlID0gZnVuY3Rpb24ocGVlciwgZGF0YSl7XG5cdHRyeXtcblx0XHR2YXIgY2FuZGlkYXRlID0gbmV3IFJUQ0ljZUNhbmRpZGF0ZShkYXRhLmNhbmRpZGF0ZSk7XG5cdFx0cGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNhbmRpZGF0ZSBhZGRlZCAoXCIrcGVlci5pY2VDb25uZWN0aW9uU3RhdGUrXCIpXCIpO1xuXHRcdH0sZnVuY3Rpb24oZSl7XG5cdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHR9KTtcblx0fWNhdGNoKGUpIHtjb25zb2xlLmxvZyhlKTt9XG59XG5cblJUQy5wcm90b3R5cGUuX3Vuc3Vic2NyaWJlQWxsID0gZnVuY3Rpb24oKXtcblx0d2hpbGUodGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aCl7XG5cdFx0dGhpcy5ub2RlLnN0b3BMaXN0ZW5pbmcodGhpcy5zdWJzY3JpcHRpb25zLnBvcCgpKTtcblx0fVxufVxuXG5SVEMucHJvdG90eXBlLl9vbkNsb3NlID0gZnVuY3Rpb24oKXtcblxufVxuXG5SVEMucHJvdG90eXBlLl9vbkRhdGFDaGFubmVsID0gZnVuY3Rpb24oZGF0YWNoYW5uZWwpe1xuXHRjb25zb2xlLmxvZyhcIkNoYW5uZWwgXCIrZGF0YWNoYW5uZWwubGFiZWwrXCIgY3JlYXRlZCAhXCIpO1xuXG5cdHZhciBjaGFubmVsID0gdGhpcy51c2VkQ2hhbm5lbHNbZGF0YWNoYW5uZWwubGFiZWxdO1xuXHRpZighY2hhbm5lbCl7XG5cdFx0ZGF0YWNoYW5uZWwuY2xvc2UoKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Y2hhbm5lbC5zZXRDaGFubmVsKGRhdGFjaGFubmVsKTtcbn1cblxuXG52YXIgZXhwID0ge1xuXHRcdFJUQzogUlRDXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwOyBcbiIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5mdW5jdGlvbiBUaW1lcihwZXJpb2QsIG9udGltZSl7XG5cdE1lc3NhZ2UuY2FsbCh0aGlzLCAndGltZXInKTtcblx0XG5cdHRoaXMucGVyaW9kID0gcGVyaW9kO1xuXHR0aGlzLm9udGltZSA9IG9udGltZTtcblx0XG5cdGlmKHBlcmlvZCl7XG5cdFx0dGhpcy5sb29wID0gdHJ1ZTtcblx0XHR0aGlzLnBlcm1hbmVudCA9IHRydWU7XG5cdH1cbn1cbnV0aWwuaW5oZXJpdHMoVGltZXIsIE1lc3NhZ2UpO1xuXG5UaW1lci5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBUaW1lci5zdXBlcl8ucHJvdG90eXBlLmV4ZWMuY2FsbCh0aGlzLCB7XG5cdFx0bG9vcDogdGhpcy5sb29wLFxuXHRcdHBlcmlvZDogdGhpcy5wZXJpb2Rcblx0fSk7XG59XG5cblRpbWVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRpZighIGRhdGEpIHJldHVybiA7XG5cdGlmKGRhdGEuY3VycmVudFRpbWUpe1xuXHRcdHRoaXMub250aW1lKGRhdGEuY3VycmVudFRpbWUpO1xuXHR9XG59XG5cblxuXG52YXIgdGltZXIgPSB7XG5cdFx0VGltZXI6IFRpbWVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGltZXI7XG4iLCIvKiBkaXlhLXNka1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbmZ1bmN0aW9uIExpc3RTZXJ2aWNlcyhjYWxsYmFjayl7XG5cdE1lc3NhZ2UuY2FsbCh0aGlzLCAnd2F0Y2hkb2cnLCAnTGlzdFNlcnZpY2VzJyk7XG5cblx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xufVxudXRpbC5pbmhlcml0cyhMaXN0U2VydmljZXMsIE1lc3NhZ2UpO1xuXG5MaXN0U2VydmljZXMucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gTGlzdFNlcnZpY2VzLnN1cGVyXy5wcm90b3R5cGUuZXhlYy5jYWxsKHRoaXMpO1xufVxuXG5MaXN0U2VydmljZXMucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSl7XG5cdGlmKGRhdGEuc2VydmljZXMgJiYgdGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjayhkYXRhLnNlcnZpY2VzKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0TGlzdFNlcnZpY2VzOiBMaXN0U2VydmljZXNcbn1cblxuIl19
