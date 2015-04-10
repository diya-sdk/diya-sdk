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
var rtc = require('./services/rtc/rtc');
var Promethe = require('./services/promethe/promethe');
var discover = require('./services/discover/discover');
var qei = require('./services/qei/qei');

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
				//If the subscription was closed, call listener with null data, then remove the handler
				registeredListeners[msg.subId](null);
				delete registeredListeners[msg.subId];
			}


		}else{
			//No pending request for this subId, ignoring event
			console.log('msg.subId doesn\'t match any registered listeners, Ignoring msg ! ');
			console.log(msg);
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

	this.get = function(params, callback, timeout){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.reqId = consumeNextReqId();
		pendingRequests[msg.reqId] = callback;

		//Timeout after which the request will be discarded
		if(timeout && timeout > 0){
			setTimeout(function(){
				if(pendingRequests[msg.reqId]){
					delete pendingRequests[msg.reqId];
				}
			}, timeout);
		}

		send(msg);
	}

	this.listen = function(params, callback, timeout){
		var msg = createMessage(params);
		if(msg === null) return ;

		msg.subId = consumeNextSubscriptionId();
		registeredListeners[msg.subId] = callback;

		//Timeout after which the subscription is automatically invalidated
		if(timeout && timeout > 0){
			setTimeout(function(){
				that.stopListening(msg.subId);	
			}, timeout);
		}

		send(msg);

		return msg.subId;
	}

	this.closeCallback = function(cb){
		close_cb = cb;
	}

	this.stopListening = function(subId){

		if(!registeredListeners[subId]) return ;

		msg = {
			func: 'Unsubscribe',
			data: {
				subId: subId
			}
		}

		send(msg);

		delete registeredListeners[subId];
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
		rtc: rtc,
		Promethe: Promethe,
		discover: discover,
		qei: qei
}

module.exports = diya;

},{"./services/discover/discover":6,"./services/message":7,"./services/promethe/promethe":8,"./services/qei/qei":9,"./services/rtc/rtc":10}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
var RTC = require('../rtc/rtc');

function Promethe(session){
	var that = this;

	this.rtc = new RTC.RTC(session);
	
	this.rtc.onclose = function(){
		if(typeof that.onclose === 'function') that.onclose();
	}
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
			if(channel.send(channel._buffer))
				setTimeout(channel._run, channel.frequency);
		}

		channel._run();

		callback(channel);

	});
}


module.exports = Promethe;
},{"../rtc/rtc":10}],9:[function(require,module,exports){
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

/**
 *  callback : function called after model updated
 * */
function QEI(node, callback, sampling){
	var that = this;
	this.node = node;
	
	this.sampling = sampling || 10; /* max num of pts stored */
	this.callback = callback || function(res){}; /* callback, usually after getModel */

	node.get({
		service: "qei",
		func: "DataRequest",
		data: {
			type:"msgInit",
			sampling: 1,
			requestedData: "all"
			/* no time range specified */
			}
		}, function(data){
			that.dataModel= {};
			// console.log(JSON.stringify(that.dataModel));
			that._getDataModelFromRecv(data);
			// console.log(JSON.stringify(that.dataModel));
			
			/// that.updateChart(this.dataModel);
			that.callback(that.dataModel);

			node.listen({
					service: "qei",
					func: "SubscribeQei"
				}, function(res) {
					that._getDataModelFromRecv(res.data);
					that.callback(that.dataModel);
					});
	});

	console.log("DiyaSDK - QEI: created");
	return this;
}
/**
 * Get dataModel : 
 * {
 * 	time: [FLOAT, ...],
 * 	"senseurXX": {
 * 			data:[FLOAT, ...],
 * 			qualityIndex:[FLOAT, ...],
 * 			range: [FLOAT, FLOAT],
 * 			unit: FLOAT
 * 		},
 *   ... ("senseursYY")
 * }
 */
QEI.prototype.getDataModel = function(){
	return this.dataModel;
}
QEI.prototype.getDataRange = function(){
	return this.dataModel.range;
}
QEI.prototype.updateQualityIndex = function(){
	var that=this;
	var dm = this.dataModel;
	
	for(var d in dm) {
		if(d=='time' || !dm[d].data) continue;
	
		if(!dm[d].qualityIndex || dm[d].data.length != dm[d].qualityIndex.length)
			dm[d].qualityIndex = new Array(dm[d].data.length);
		
		dm[d].data.forEach(function(v,i) {
				dm[d].qualityIndex[i] = checkQuality(v,dm[d].qualityConfig);
			});
	}
}
QEI.prototype.getDataconfortRange = function(){
	return this.dataModel.confortRange;
}
QEI.prototype.getSampling = function(numSamples){
	return this.sampling;
}
QEI.prototype.setSampling = function(numSamples){
	this.sampling = numSamples;
}


var checkQuality = function(data, qualityConfig){
	var quality;
	if(data && qualityConfig) {
		if(data>qualityConfig.confortRange[1] || data<qualityConfig.confortRange[0])
			quality=0;
		else
			quality=1.0
		return quality;
	}
	return 1.0;
}

/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}     [description]
 */
QEI.prototype._getDataModelFromRecv = function(data){
	var dataModel=this.dataModel;
	/*\
	|*|
	|*|  utilitaires de manipulations de chaînes base 64 / binaires / UTF-8
	|*|
	|*|  https://developer.mozilla.org/fr/docs/Décoder_encoder_en_base64
	|*|
	\*/
	/** Decoder un tableau d'octets depuis une chaîne en base64 */
	b64ToUint6 = function(nChr) {
		return nChr > 64 && nChr < 91 ?
				nChr - 65
			: nChr > 96 && nChr < 123 ?
				nChr - 71
			: nChr > 47 && nChr < 58 ?
				nChr + 4
			: nChr === 43 ?
				62
			: nChr === 47 ?
				63
			:	0;
	};
	/**
	 * Decode base64 string to UInt8Array
	 * @param  {String} sBase64     base64 coded string
	 * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
	 * @return {Uint8Array}             tab of decoded bytes
	 */
	base64DecToArr = function(sBase64, nBlocksSize) {
		var
		sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
		nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
		buffer = new ArrayBuffer(nOutLen), taBytes = new Uint8Array(buffer);

		for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
			nMod4 = nInIdx & 3; /* n mod 4 */
			nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
					taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;

			}
		}
		// console.log("u8int : "+JSON.stringify(taBytes));
		return buffer;
	};
	
	if(data && data.header) {
		//~ console.log('rcvdata '+JSON.stringify(data));
		// if(!data.header.sampling) data.header.sampling=1;
		
		/** case 1 : 1 value received added to dataModel */
		if(data.header.sampling==1) {
			if(data.header.timeEnd) {
				if(!dataModel.time) dataModel.time=[];
				dataModel.time.push(data.header.timeEnd);
				if(dataModel.time.length > this.sampling) {
					dataModel.time = dataModel.time.slice(dataModel.time.length - this.sampling);
				}
			}
			for (var n in data) {
				if(n != "header" && n != "time") {
					// console.log(n);
					if(!dataModel[n]) {
						dataModel[n]={};
						dataModel[n].data=[];
					}

					/* update data range */
					dataModel[n].range=data[n].range;
					/* update data label */
					dataModel[n].label=data[n].label;
					/* update data unit */
					dataModel[n].unit=data[n].unit;
					/* update data confortRange */
					dataModel[n].qualityConfig={confortRange: data[n].confortRange};

					if(data[n].data.length > 0) {
						/* decode data to Float32Array*/
						var buf = base64DecToArr(data[n].data, 4);
						// console.log(JSON.stringify(buf));
						var fArray = new Float32Array(buf);

						if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
						if(data[n].size != 1) console.log("Expected 1 value received :"+data[n].size);
						
						if(!dataModel[n].data) dataModel[n].data=[];
						dataModel[n].data.push(fArray[0]);
						if(dataModel[n].data.length > this.sampling) {
							dataModel[n].data = dataModel[n].data.slice(dataModel[n].data.length - this.sampling);
						}
					}
					else {
						if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
						dataModel[n].data = [];
					}
					this.updateQualityIndex();
					//~ console.log('mydata '+JSON.stringify(dataModel[n].data));
				}
			}
		}
		else {
			/** case 2 : history data - many values received */
			/** TODO  */
			for (var n in data) {
				if(n == 'time') {
					/* case 1 : time data transmitted, 1 value */
					/** TODO **/
				}
				else if(n != "header") {
					// console.log(n);
					if(!dataModel[n]) {
						dataModel[n]={};
						dataModel[n].data=[];
					}

					/* update data range */
					dataModel[n].range=data[n].range;
					/* update data label */
					dataModel[n].label=data[n].label;
					/* update data unit */
					dataModel[n].unit=data[n].unit;
					/* update data confortRange */
					dataModel[n].qualityConfig={confortRange: data[n].confortRange};

					if(data[n].data.length > 0) {
						/* decode data to Float32Array*/
						var buf = base64DecToArr(data[n].data, 4); 
						// console.log(JSON.stringify(buf));
						var fArray = new Float32Array(buf);

						if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
						// /* increase size of data if necessary */
						if(fArray.length>dataModel[n].data.length) {
							// dataModel[n].size=data[n].size;
							dataModel[n].data = new Array(dataModel[n].size);
						}
						/* update nb of samples stored */
						for(var i in fArray) {
							dataModel[n].data[parseInt(i)]=fArray[i]; /* keep first val - name of column */
						}
					}
					else {
						if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
						dataModel[n].data = [];
					}
					// dataModel[n].data = Array.from(fArray);
					// console.log('mydata '+JSON.stringify(dataModel[n].data));
				}
			}
		}
	}
	else {
		console.log("No Data to read or header is missing !");
	}
	return this.dataModel;
}


var exp = {
		QEI: QEI
}

module.exports = exp; 

},{"../message":7,"util":4}],10:[function(require,module,exports){
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
	this.closed = false;
}

Channel.prototype.setChannel = function(datachannel){
	this.channel = datachannel;

	var that = this;
	if(that.onopen) that.onopen(that);
}

Channel.prototype.close = function(){
	this.closed = true;
}

Channel.prototype.setOnMessage = function(onmessage){
	this.channel.onmessage = onmessage;
}

Channel.prototype.send = function(msg){
	if(this.closed) return false;
	else if(this.channel.readyState === 'open'){
		this.channel.send(msg);
		return true;
	}
	else{
		console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
		return false;
	}
}


////////////////////////////////////////////////

function Peer(rtc, id, channels){
	this.id = id;
	this.channels = channels;
	this.rtc = rtc;
	this.peer = null;

	this.connected = false;
	this.closed = false;

	this._connect();
}


Peer.prototype._connect = function(){
	var that = this;

	this.sub = this.rtc.node.listen({
		service: 'rtc',
		func: 'Connect',
		obj: this.channels,
		data: {
			promID: this.id
		}
	},
	function(data){
		that._handleNegociationMessage(data);
	});

	setTimeout(function(){
		if(!that.connected && !that.closed){
			that.rtc.reconnect();
		}else{
		}
	}, 10000);
}

Peer.prototype._handleNegociationMessage = function(msg){

	if(msg.eventType === 'RemoteOffer'){
		this._createPeer(msg);
	}else if(msg.eventType === 'RemoteICECandidate'){
		this._addRemoteICECandidate(msg);
	}
};

var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

Peer.prototype._createPeer = function(data){
	var that = this;

	var peer = new RTCPeerConnection(servers, {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});
	this.peer = peer;

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		that.rtc.node.get({
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
		console.log(peer.iceConnectionState);
		if(peer.iceConnectionState === 'connected'){
			that.connected = true;  
			that.rtc.node.stopListening(this.sub);
		}else if(peer.iceConnectionState === 'disconnected'){
			if(!that.closed) that.rtc.reconnect();
		}
	}

	peer.onicecandidate = function(evt){
		that.rtc.node.get({
			service: 'rtc',
			func: 'ICECandidate',
			data:{
				peerId: data.peerId,
				promID: that.id,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function(evt){
		that.connected = true;
		that.rtc._onDataChannel(evt.channel);
	};
}

Peer.prototype._addRemoteICECandidate = function(data){
	var that = this;
	try{
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate,function(){
			console.log("candidate added ("+that.peer.iceConnectionState+")");
		},function(e){
			console.log(e);
		});
	}catch(e) {console.log(e);}
}

Peer.prototype.close = function(){
	this.rtc.node.stopListening(this.sub);
	if(this.peer) this.peer.close();
	this.connected = false;
	this.closed = true;
}



/////////////////////////////////


function RTC(node){
	var that = this;
	
	this.node = node;
	this.usedChannels = [];

	this.requestedChannels = [];

	this.peers = [];
}

RTC.prototype.use = function(name_regex, onopen_callback){
	this.requestedChannels.push({regex: name_regex, cb: onopen_callback});
}

RTC.prototype.reconnect = function(){
	var that = this;
		
	that.disconnect();
	that.connect();
	console.log("reconnecting...");
}

RTC.prototype.disconnect = function(){

	for(var promID in this.peers){
		this._closePeer(promID);
	}

	this.node.stopListening(this.sub);

	if(typeof this.onclose === 'function') this.onclose();
}

RTC.prototype.connect = function(){
	var that = this;
	var foundChannels = false;

	this.sub = this.node.listen({
		service: 'rtc',
		func: 'ListenPeers'
	},
	function(data){
			
		if(data.eventType && data.promID !== undefined){

			if(data.eventType === 'PeerConnected'){
				if(!that.peers[data.promID]){
					var channels = that._matchChannels(data.channels);
					if(channels.length > 0){
						that.peers[data.promID] = new Peer(that, data.promID, channels);
					}
				}
			}
			else if(data.eventType === 'PeerClosed'){
				if(that.peers[data.promID]) that._closePeer(data.promID);
			}
		}

	});
}


RTC.prototype._closePeer = function(promID){

	if(this.peers[promID]){
		var p = this.peers[promID];
		p.close();

		for(var i=0; i < p.channels.length; i++){
			delete this.usedChannels[p.channels[i]];
		}

		delete this.peers[promID];
	}
}

RTC.prototype._matchChannels = function(receivedChannels){
	var that = this;

	//Contains all channels that will be passed to Connect as objects
	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];
		
		for(var j = 0; j < that.requestedChannels.length; j++){
			var req = that.requestedChannels[j];
			
			if(name && name.match(req.regex) && !that.usedChannels[name]){
				that.usedChannels[name] = new Channel(name, req.cb);
				channels.push(name); //prepare the connect object list
			}
		}
	}

	return channels;
};

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

},{"../message":7,"util":4}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9zcmMvc2VydmljZXMvZGlzY292ZXIvZGlzY292ZXIuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzc2FnZS5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9wcm9tZXRoZS9wcm9tZXRoZS5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9xZWkvcWVpLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3J0Yy9ydGMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyogRGl5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxudmFyIG1lc3NhZ2UgPSByZXF1aXJlKCcuL3NlcnZpY2VzL21lc3NhZ2UnKTtcblxuLy9TZXJ2aWNlc1xudmFyIHJ0YyA9IHJlcXVpcmUoJy4vc2VydmljZXMvcnRjL3J0YycpO1xudmFyIFByb21ldGhlID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9wcm9tZXRoZS9wcm9tZXRoZScpO1xudmFyIGRpc2NvdmVyID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9kaXNjb3Zlci9kaXNjb3ZlcicpO1xudmFyIHFlaSA9IHJlcXVpcmUoJy4vc2VydmljZXMvcWVpL3FlaScpO1xuXG52YXIgV2ViU29ja2V0ID0gd2luZG93LldlYlNvY2tldCB8fCB3aW5kb3cuTW96V2ViU29ja2V0O1xuXG5cblxuIFxuXG5mdW5jdGlvbiBEaXlhKGFkZHIpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBzb2NrZXQ7XHRcblxuXHR2YXIgY2xvc2VfY2IgPSBudWxsO1xuXG5cdHZhciBwZW5kaW5nUmVxdWVzdHMgPSBbXTtcblx0dmFyIHJlZ2lzdGVyZWRMaXN0ZW5lcnMgPSBbXTtcblxuXHR2YXIgbmV4dFJlcUlkID0gLTE7XG5cdGZ1bmN0aW9uIGNvbnN1bWVOZXh0UmVxSWQoKXtcblx0XHRuZXh0UmVxSWQrKztcblx0XHRyZXR1cm4gbmV4dFJlcUlkO1xuXHR9XG5cblx0dmFyIG5leHRTdWJzY3JpcHRpb25JZCA9IC0xO1xuXHRmdW5jdGlvbiBjb25zdW1lTmV4dFN1YnNjcmlwdGlvbklkKCl7XG5cdFx0bmV4dFN1YnNjcmlwdGlvbklkKys7XG5cdFx0cmV0dXJuIG5leHRTdWJzY3JpcHRpb25JZDtcblx0fVxuXHRcblx0ZnVuY3Rpb24gZGlzcGF0Y2gobXNnKXtcblxuXHRcdGlmKG1zZy5yZXFJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoUmVxdWVzdChtc2cpO1xuXHRcdH1lbHNlIGlmKG1zZy5zdWJJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoRXZlbnQobXNnKTtcblx0XHR9XG5cdFx0Ly9JZiB0aGUgbXNnIGRvZXNuJ3QgaGF2ZSBhIHJlcUlkLCBpdCBjYW5ub3QgYmUgbWF0Y2hlZCB0byBhIHBlbmRpbmcgcmVxdWVzdFxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ21pc3NpbmcgcmVxSWQgb3Igc3ViSWQuIElnbm9yaW5nIG1zZyA6ICcpO1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0XG5cdH1cblxuXHRmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QobXNnKXtcblx0XHQvL0lmIG1zZy5yZXFJZCBjb3JyZXNwb25kcyB0byBhIHBlbmRpbmcgcmVxdWVzdCwgZXhlY3V0ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0gPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0Ly9leGVjdXRlIHRoZSByZXNwb25zZSBjYWxsYmFjaywgcGFzcyB0aGUgbWVzc2FnZSBkYXRhIGFzIGFyZ3VtZW50XG5cdFx0XHRwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXShtc2cuZGF0YSk7XG5cdFx0XHRkZWxldGUgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF07XG5cdFx0fWVsc2V7XG5cdFx0XHQvL05vIHBlbmRpbmcgcmVxdWVzdCBmb3IgdGhpcyByZXFJZCwgaWdub3JpbmcgcmVzcG9uc2Vcblx0XHRcdGNvbnNvbGUubG9nKCdtc2cucmVxSWQgZG9lc25cXCd0IG1hdGNoIGFueSBwZW5kaW5nIHJlcXVlc3QsIElnbm9yaW5nIG1zZyAhICcrbXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChtc2cpe1xuXHRcdC8vSWYgbXNnLnN1YklkIGNvcnJlc3BvbmRzIHRvIGEgcmVnaXN0ZXJlZCBsaXN0ZW5lciwgZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cblx0XHRcdC8vZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2ssIHBhc3MgdGhlIG1lc3NhZ2UgZGF0YSBhcyBhcmd1bWVudFxuXHRcdFx0aWYoIW1zZy5yZXN1bHQgfHwgbXNnLnJlc3VsdCAhPSAnY2xvc2VkJyl7XG5cdFx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXShtc2cuZGF0YSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Ly9JZiB0aGUgc3Vic2NyaXB0aW9uIHdhcyBjbG9zZWQsIGNhbGwgbGlzdGVuZXIgd2l0aCBudWxsIGRhdGEsIHRoZW4gcmVtb3ZlIHRoZSBoYW5kbGVyXG5cdFx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXShudWxsKTtcblx0XHRcdFx0ZGVsZXRlIHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXTtcblx0XHRcdH1cblxuXG5cdFx0fWVsc2V7XG5cdFx0XHQvL05vIHBlbmRpbmcgcmVxdWVzdCBmb3IgdGhpcyBzdWJJZCwgaWdub3JpbmcgZXZlbnRcblx0XHRcdGNvbnNvbGUubG9nKCdtc2cuc3ViSWQgZG9lc25cXCd0IG1hdGNoIGFueSByZWdpc3RlcmVkIGxpc3RlbmVycywgSWdub3JpbmcgbXNnICEgJyk7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cdH1cblx0XG5cdFxuXHRmdW5jdGlvbiBzZW5kKG1zZyl7XG5cdFx0aWYoc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiZGl5YS1TREsgOiBjYW5ub3Qgc2VuZCBtZXNzYWdlIC0+IHNvY2tldCBjbG9zZWRcIik7XG5cdFx0fVxuXHRcdHRyeXtcblx0XHRcdGRhdGEgPSBKU09OLnN0cmluZ2lmeShtc2cpO1xuXHRcdFx0c29ja2V0LnNlbmQoZGF0YSk7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coJ21hbGZvcm1lZCBKU09OLCBpZ25vcmluZyBtc2cuLi4nKTtcblx0XHR9XG5cdH1cdFxuXHRcblx0ZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShpbmNvbWluZ01lc3NhZ2Upe1xuXHRcdHZhciBtc2c7XG5cblx0XHR0cnl7XG5cdFx0XHRtc2cgPSBKU09OLnBhcnNlKGluY29taW5nTWVzc2FnZS5kYXRhKTtcblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZyhcIm1hbGZvcm1lZCBKU09OXCIpO1xuXHRcdFx0IFxuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cdFx0XG5cdFx0ZGlzcGF0Y2gobXNnKTtcblxuXHR9O1xuXHRcblx0ZnVuY3Rpb24gY2xvc2VBbGwoKXtcblx0XHR3aGlsZShwZW5kaW5nUmVxdWVzdHMubGVuZ3RoKXtcblx0XHRcdHBlbmRpbmdSZXF1ZXN0cy5wb3AoKTtcblx0XHR9XG5cdFx0d2hpbGUocmVnaXN0ZXJlZExpc3RlbmVycy5sZW5ndGgpe1xuXHRcdFx0cmVnaXN0ZXJlZExpc3RlbmVycy5wb3AoKTtcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZyhjbG9zZV9jYik7XG5cblx0XHRpZih0eXBlb2YgY2xvc2VfY2IgPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0Y2xvc2VfY2IoKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVNZXNzYWdlKHBhcmFtcyl7XG5cdFx0aWYoIXBhcmFtcy5zZXJ2aWNlKSByZXR1cm4gbnVsbDtcblx0XHRlbHNlIHJldHVybiB7XG5cdFx0XHRzZXJ2aWNlOiBwYXJhbXMuc2VydmljZSxcblx0XHRcdGZ1bmM6IHBhcmFtcy5mdW5jID8gcGFyYW1zLmZ1bmMgOiB1bmRlZmluZWQsXG5cdFx0XHRvYmo6IHBhcmFtcy5vYmogPyBwYXJhbXMub2JqIDogdW5kZWZpbmVkLFxuXHRcdFx0ZGF0YTogcGFyYW1zLmRhdGEgPyBwYXJhbXMuZGF0YSA6IHVuZGVmaW5lZFxuXHRcdH1cblx0fVxuXG5cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8vLy8vLy8vL1B1YmxpYyBBUEkvLy8vLy8vLy8vLy8vLy9cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XG5cdHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBhcmdzKXtcblx0XHR0cnl7XG5cdFx0XHRzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGFkZHIpO1xuXG5cdFx0XHRzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRjYWxsYmFjayhcIkNhbm5vdCBDb25uZWN0XCIsIG51bGwpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRzb2NrZXQub25vcGVuID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgYXJncyk7XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHRzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24oaW5jb21pbmdNZXNzYWdlKXtcblx0XHRcdFx0aGFuZGxlTWVzc2FnZShpbmNvbWluZ01lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNsb3NlQWxsKCk7XG5cdFx0XHR9XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJjYW4ndCBjb25uZWN0IHRvIFwiK2FkZHIpO1xuXHRcdH1cblx0fTtcblxuXHR0aGlzLmdldCA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIHRpbWVvdXQpe1xuXHRcdHZhciBtc2cgPSBjcmVhdGVNZXNzYWdlKHBhcmFtcyk7XG5cdFx0aWYobXNnID09PSBudWxsKSByZXR1cm4gO1xuXG5cdFx0bXNnLnJlcUlkID0gY29uc3VtZU5leHRSZXFJZCgpO1xuXHRcdHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdID0gY2FsbGJhY2s7XG5cblx0XHQvL1RpbWVvdXQgYWZ0ZXIgd2hpY2ggdGhlIHJlcXVlc3Qgd2lsbCBiZSBkaXNjYXJkZWRcblx0XHRpZih0aW1lb3V0ICYmIHRpbWVvdXQgPiAwKXtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYocGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0pe1xuXHRcdFx0XHRcdGRlbGV0ZSBwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgdGltZW91dCk7XG5cdFx0fVxuXG5cdFx0c2VuZChtc2cpO1xuXHR9XG5cblx0dGhpcy5saXN0ZW4gPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrLCB0aW1lb3V0KXtcblx0XHR2YXIgbXNnID0gY3JlYXRlTWVzc2FnZShwYXJhbXMpO1xuXHRcdGlmKG1zZyA9PT0gbnVsbCkgcmV0dXJuIDtcblxuXHRcdG1zZy5zdWJJZCA9IGNvbnN1bWVOZXh0U3Vic2NyaXB0aW9uSWQoKTtcblx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF0gPSBjYWxsYmFjaztcblxuXHRcdC8vVGltZW91dCBhZnRlciB3aGljaCB0aGUgc3Vic2NyaXB0aW9uIGlzIGF1dG9tYXRpY2FsbHkgaW52YWxpZGF0ZWRcblx0XHRpZih0aW1lb3V0ICYmIHRpbWVvdXQgPiAwKXtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5zdG9wTGlzdGVuaW5nKG1zZy5zdWJJZCk7XHRcblx0XHRcdH0sIHRpbWVvdXQpO1xuXHRcdH1cblxuXHRcdHNlbmQobXNnKTtcblxuXHRcdHJldHVybiBtc2cuc3ViSWQ7XG5cdH1cblxuXHR0aGlzLmNsb3NlQ2FsbGJhY2sgPSBmdW5jdGlvbihjYil7XG5cdFx0Y2xvc2VfY2IgPSBjYjtcblx0fVxuXG5cdHRoaXMuc3RvcExpc3RlbmluZyA9IGZ1bmN0aW9uKHN1YklkKXtcblxuXHRcdGlmKCFyZWdpc3RlcmVkTGlzdGVuZXJzW3N1YklkXSkgcmV0dXJuIDtcblxuXHRcdG1zZyA9IHtcblx0XHRcdGZ1bmM6ICdVbnN1YnNjcmliZScsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHN1YklkOiBzdWJJZFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHNlbmQobXNnKTtcblxuXHRcdGRlbGV0ZSByZWdpc3RlcmVkTGlzdGVuZXJzW3N1YklkXTtcblx0fVxuXG5cdHRoaXMuY29ubmVjdGVkID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gISAoc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEKTtcblx0fVxuXG5cdHRoaXMuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdFx0c29ja2V0LmNsb3NlKCk7XG5cdH1cblx0XG59XG5cblxuZnVuY3Rpb24gRGl5YUNsaWVudChhZGRyLCB1c2VyLCBwYXNzd29yZCl7XG5cblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUoKXtcblx0XHR2YXIgbm9kZSA9IG5ldyBkaXlhLkRpeWEoYWRkcik7XG5cdFx0Ly9ub2Rlcy5wdXNoKG5vZGUpO1xuXG5cdFx0cmV0dXJuIG5vZGU7XG5cdH1cblxuXHR0aGlzLnNldEFkZHJlc3MgPSBmdW5jdGlvbihhZGRyZXNzKXtcblx0XHRhZGRyID0gYWRkcmVzcztcblx0fVxuXG5cdHRoaXMuY3JlYXRlU2Vzc2lvbiA9IGZ1bmN0aW9uKG9uY29ubmVjdGVkLCBvbmZhaWx1cmUpe1xuXHRcdHZhciBub2RlID0gY3JlYXRlTm9kZSgpO1xuXG5cdFx0bm9kZS5jb25uZWN0KGZ1bmN0aW9uKGVycil7XG5cdFx0XHRpZihlcnIpe1xuXHRcdFx0XHRvbmZhaWx1cmUoZXJyKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRub2RlLmdldCh7XG5cdFx0XHRcdFx0c2VydmljZTogJ2F1dGgnLFxuXHRcdFx0XHRcdGZ1bmM6ICdBdXRoZW50aWNhdGUnLFxuXHRcdFx0XHRcdGRhdGE6IHt1c2VyOiB1c2VyLCBwYXNzd29yZDogcGFzc3dvcmR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRcdFx0aWYocmVzLmF1dGhlbnRpY2F0ZWQgfHwgKHJlcy5lcnJvciAmJiByZXMuZXJyb3IgPT09ICdTZXJ2aWNlTm90Rm91bmQnKSkgb25jb25uZWN0ZWQobm9kZSk7XG5cdFx0XHRcdFx0ZWxzZSBvbmZhaWx1cmUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fVxuXHRcbn1cblxuXG52YXIgZGl5YSA9IHtcblx0XHREaXlhQ2xpZW50OiBEaXlhQ2xpZW50LFxuXHRcdERpeWE6IERpeWEsXG5cdFx0cnRjOiBydGMsXG5cdFx0UHJvbWV0aGU6IFByb21ldGhlLFxuXHRcdGRpc2NvdmVyOiBkaXNjb3Zlcixcblx0XHRxZWk6IHFlaVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpeWE7XG4iLCJ2YXIgZGdyYW07XG5cbnZhciBuZXR3b3JrSWRSZXF1ZXN0ID0gJ2RpeWEtbmV0d29yay1pZFxcbic7XG5cbnZhciBzb2NrZXQ7XG52YXIgY2FsbGJhY2tzID0gW107XG52YXIgZGl5YXMgPSBbXTtcblxuXG52YXIgc3RhdGUgPSAnc3RvcHBlZCc7XG5cbmZ1bmN0aW9uIGlzTm9kZSgpe1xuXHRpZihkZ3JhbSkgcmV0dXJuIHRydWU7XG5cdHRyeXtcblx0XHRkZ3JhbSA9IHJlcXVpcmUoJ2RncmFtJysnJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1jYXRjaChlKXtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdGVuKGNhbGxiYWNrKXtcblx0aWYoIWlzTm9kZSgpKSByZXR1cm4gO1xuXHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFxufVxuXG5mdW5jdGlvbiByZW1vdmVPdXRkYXRlZERpeWFzKCl7XG5cdGZvcih2YXIgaT0wO2k8ZGl5YXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZGl5YXNbaV0udG91Y2ggPiAxMDAwMCl7XG5cdFx0XHRkaXlhcy5zcGxpY2UoaSwgMSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERpeWEobmFtZSwgcG9ydCwgYWRkcmVzcyl7XG5cdGZvcih2YXIgaT0wOyBpPGRpeWFzLmxlbmd0aDsgaSsrKXtcblx0XHRpZihkaXlhc1tpXS5uYW1lID09PSBuYW1lICYmIGRpeWFzW2ldLmFkZHIgPT09IGFkZHJlc3MrJzonK3BvcnQpe1xuXHRcdFx0cmV0dXJuIGRpeWFzW2ldO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ290RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKXtcblxuXG5cdHZhciBkaXlhID0gZ2V0RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKTtcblx0aWYoIWRpeWEpe1xuXHRcdGRpeWEgPSB7bmFtZTogbmFtZSwgYWRkcjogYWRkcmVzcysnOicrcG9ydH07XG5cdFx0ZGl5YXMucHVzaChkaXlhKTtcblx0fVxuXHRkaXlhLnRvdWNoID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQW5zd2VyKG5hbWUsIHBvcnQsIGFkZHJlc3Mpe1xuXHRmb3IodmFyIGk9MDtpPGNhbGxiYWNrcy5sZW5ndGg7aSsrKXtcblx0XHRjYWxsYmFja3NbaV0obmFtZSwgcG9ydCwgYWRkcmVzcyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVxdWVzdCgpe1xuXHRzb2NrZXQuc2VuZChuZXR3b3JrSWRSZXF1ZXN0LCAwLCBuZXR3b3JrSWRSZXF1ZXN0Lmxlbmd0aCwgMjAwMCwgJzI1NS4yNTUuMjU1LjI1NScpO1xufVxuXG5mdW5jdGlvbiBzdGFydCgpe1xuXHRpZighaXNOb2RlKCkpIHJldHVybiA7XG5cblx0c3RhdGUgPSAnc3RhcnRlZCc7XG5cblx0aWYoIXNvY2tldCl7XG5cdFx0c29ja2V0ID0gZGdyYW0uY3JlYXRlU29ja2V0KCd1ZHA0Jyk7XG5cblx0XHRzb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihkYXRhLCByaW5mbyl7XG5cdFx0XHR2YXIgbXNnID0gZGF0YS50b1N0cmluZygnYXNjaWknKTtcblx0XHRcdHZhciBwYXJhbXMgPSBtc2cuc3BsaXQoJzonKTtcblx0XHRcdFxuXHRcdFx0aWYocGFyYW1zLmxlbmd0aCA9PSAyKXtcblx0XHRcdFx0Z290RGl5YShwYXJhbXNbMF0sIHBhcmFtc1sxXSwgcmluZm8uYWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2xpc3RlbmluZycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRzb2NrZXQuc2V0QnJvYWRjYXN0KHRydWUpO1x0XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb0Rpc2NvdmVyKCl7XG5cdFx0cmVxdWVzdCgpO1xuXHRcdHJlbW92ZU91dGRhdGVkRGl5YXMoKTtcblxuXHRcdGlmKHN0YXRlID09PSAnc3RhcnRlZCcpIHNldFRpbWVvdXQoZG9EaXNjb3ZlciwgMTAwMCk7XG5cdH1cblx0ZG9EaXNjb3ZlcigpO1xuXG5cbn1cblxuZnVuY3Rpb24gc3RvcCgpe1xuXG5cdHN0YXRlID0gJ3N0b3BwZWQnO1xuXG5cdGlmKHNvY2tldCkgc29ja2V0LmNsb3NlKCk7XG5cdHdoaWxlKGNhbGxiYWNrcy5sZW5ndGgpe1xuXHRcdGNhbGxiYWNrcy5wb3AoKTtcblx0fVxufVxuXG5cbmZ1bmN0aW9uIGF2YWlsYWJsZURpeWFzKCl7XG5cdHJldHVybiBkaXlhcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHN0YXJ0OiBzdGFydCxcblx0c3RvcDogc3RvcCxcblx0bGlzdGVuOiBsaXN0ZW4sXG5cdGlzRGlzY292ZXJhYmxlOiBpc05vZGUsXG5cdGF2YWlsYWJsZURpeWFzOiBhdmFpbGFibGVEaXlhc1xufSIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxuZnVuY3Rpb24gTWVzc2FnZShzZXJ2aWNlLCBmdW5jLCBvYmosIHBlcm1hbmVudCl7XG5cblx0dGhpcy5zZXJ2aWNlID0gc2VydmljZTtcblx0dGhpcy5mdW5jID0gZnVuYztcblx0dGhpcy5vYmogPSBvYmo7XG5cdFxuXHR0aGlzLnBlcm1hbmVudCA9IHBlcm1hbmVudDsgLy9JZiB0aGlzIGZsYWcgaXMgb24sIHRoZSBjb21tYW5kIHdpbGwgc3RheSBvbiB0aGUgY2FsbGJhY2sgbGlzdCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xufVxuXG5NZXNzYWdlLmJ1aWxkU2lnbmF0dXJlID0gZnVuY3Rpb24obXNnKXtcblx0cmV0dXJuIG1zZy5zZXJ2aWNlKycuJyttc2cuZnVuYysnLicrbXNnLm9iajtcbn1cblxuXG5NZXNzYWdlLnByb3RvdHlwZS5zaWduYXR1cmUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5zZXJ2aWNlKycuJyt0aGlzLmZ1bmMrJy4nK3RoaXMub2JqO1xufVxuXG5NZXNzYWdlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oZGF0YSl7XG5cdHJldHVybiB7XG5cdFx0c2VydmljZTogdGhpcy5zZXJ2aWNlLFxuXHRcdGZ1bmM6IHRoaXMuZnVuYyxcblx0XHRvYmo6IHRoaXMub2JqLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2U7XG4iLCJ2YXIgUlRDID0gcmVxdWlyZSgnLi4vcnRjL3J0YycpO1xuXG5mdW5jdGlvbiBQcm9tZXRoZShzZXNzaW9uKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMucnRjID0gbmV3IFJUQy5SVEMoc2Vzc2lvbik7XG5cdFxuXHR0aGlzLnJ0Yy5vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0XHRpZih0eXBlb2YgdGhhdC5vbmNsb3NlID09PSAnZnVuY3Rpb24nKSB0aGF0Lm9uY2xvc2UoKTtcblx0fVxufVxuXG5Qcm9tZXRoZS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24ocmVnZXgsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnJ0Yy51c2UocmVnZXgsIGZ1bmN0aW9uKGNoYW5uZWwpe1xuXHRcdHRoYXQuX25lZ29jaWF0ZU5ldXJvbihjaGFubmVsLCBjYWxsYmFjayk7XG5cdH0pO1xufVxuXG5Qcm9tZXRoZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMucnRjLmNvbm5lY3QoKTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5kaXNjb25uZWN0KCk7XG59XG5cblxuUHJvbWV0aGUucHJvdG90eXBlLl9uZWdvY2lhdGVOZXVyb24gPSBmdW5jdGlvbihjaGFubmVsLCBjYWxsYmFjayl7XG5cdGNoYW5uZWwuc2V0T25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdFxuXHRcdHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KG1lc3NhZ2UuZGF0YSk7XG5cblx0XHR2YXIgdHlwZUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXcuZ2V0VWludDgoMCkpO1xuXHRcdGlmKHR5cGVDaGFyID09PSAnTycpe1xuXHRcdFx0Ly9JbnB1dFxuXHRcdFx0Y2hhbm5lbC50eXBlID0gJ2lucHV0JzsgLy9Qcm9tZXRoZSBPdXRwdXQgPSBDbGllbnQgSW5wdXRcblx0XHR9ZWxzZSBpZih0eXBlQ2hhciA9PT0gJ0knKXtcblx0XHRcdC8vT3V0cHV0XG5cdFx0XHRjaGFubmVsLnR5cGUgPSAnb3V0cHV0JzsgLy9Qcm9tZXRoZSBJbnB1dCA9IENsaWVudCBPdXRwdXRcblx0XHR9ZWxzZXtcblx0XHRcdC8vRXJyb3Jcblx0XHR9XG5cblx0XHR2YXIgc2l6ZSA9IHZpZXcuZ2V0SW50MzIoMSx0cnVlKTtcblx0XHRpZihzaXplICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRjaGFubmVsLnNpemUgPSBzaXplO1xuXHRcdFx0Y2hhbm5lbC5fYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblx0XHR9ZWxzZXtcblx0XHRcdC8vZXJyb3Jcblx0XHR9XG5cblxuXG5cdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2UodW5kZWZpbmVkKTtcblxuXHRcdGNoYW5uZWwuc2V0T25WYWx1ZSA9IGZ1bmN0aW9uKG9udmFsdWVfY2Ipe1xuXHRcdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2Uob252YWx1ZV9jYik7XG5cdFx0fVxuXG5cdFx0Y2hhbm5lbC53cml0ZSA9IGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFubmVsLnNpemUgfHwgaXNOYU4odmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjaGFubmVsLl9idWZmZXJbaW5kZXhdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRjaGFubmVsLmZyZXF1ZW5jeSA9IDMzO1xuXG5cdFx0Y2hhbm5lbC5fcnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGNoYW5uZWwuc2VuZChjaGFubmVsLl9idWZmZXIpKVxuXHRcdFx0XHRzZXRUaW1lb3V0KGNoYW5uZWwuX3J1biwgY2hhbm5lbC5mcmVxdWVuY3kpO1xuXHRcdH1cblxuXHRcdGNoYW5uZWwuX3J1bigpO1xuXG5cdFx0Y2FsbGJhY2soY2hhbm5lbCk7XG5cblx0fSk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9tZXRoZTsiLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuLyoqXG4gKiAgY2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIFFFSShub2RlLCBjYWxsYmFjaywgc2FtcGxpbmcpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdFxuXHR0aGlzLnNhbXBsaW5nID0gc2FtcGxpbmcgfHwgMTA7IC8qIG1heCBudW0gb2YgcHRzIHN0b3JlZCAqL1xuXHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24ocmVzKXt9OyAvKiBjYWxsYmFjaywgdXN1YWxseSBhZnRlciBnZXRNb2RlbCAqL1xuXG5cdG5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiBcInFlaVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVJlcXVlc3RcIixcblx0XHRkYXRhOiB7XG5cdFx0XHR0eXBlOlwibXNnSW5pdFwiLFxuXHRcdFx0c2FtcGxpbmc6IDEsXG5cdFx0XHRyZXF1ZXN0ZWREYXRhOiBcImFsbFwiXG5cdFx0XHQvKiBubyB0aW1lIHJhbmdlIHNwZWNpZmllZCAqL1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhhdC5kYXRhTW9kZWw9IHt9O1xuXHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRcdHRoYXQuX2dldERhdGFNb2RlbEZyb21SZWN2KGRhdGEpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRcdFxuXHRcdFx0Ly8vIHRoYXQudXBkYXRlQ2hhcnQodGhpcy5kYXRhTW9kZWwpO1xuXHRcdFx0dGhhdC5jYWxsYmFjayh0aGF0LmRhdGFNb2RlbCk7XG5cblx0XHRcdG5vZGUubGlzdGVuKHtcblx0XHRcdFx0XHRzZXJ2aWNlOiBcInFlaVwiLFxuXHRcdFx0XHRcdGZ1bmM6IFwiU3Vic2NyaWJlUWVpXCJcblx0XHRcdFx0fSwgZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YocmVzLmRhdGEpO1xuXHRcdFx0XHRcdHRoYXQuY2FsbGJhY2sodGhhdC5kYXRhTW9kZWwpO1xuXHRcdFx0XHRcdH0pO1xuXHR9KTtcblxuXHRjb25zb2xlLmxvZyhcIkRpeWFTREsgLSBRRUk6IGNyZWF0ZWRcIik7XG5cdHJldHVybiB0aGlzO1xufVxuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDogXG4gKiB7XG4gKiBcdHRpbWU6IFtGTE9BVCwgLi4uXSxcbiAqIFx0XCJzZW5zZXVyWFhcIjoge1xuICogXHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sXG4gKiBcdFx0XHRxdWFsaXR5SW5kZXg6W0ZMT0FULCAuLi5dLFxuICogXHRcdFx0cmFuZ2U6IFtGTE9BVCwgRkxPQVRdLFxuICogXHRcdFx0dW5pdDogRkxPQVRcbiAqIFx0XHR9LFxuICogICAuLi4gKFwic2Vuc2V1cnNZWVwiKVxuICogfVxuICovXG5RRUkucHJvdG90eXBlLmdldERhdGFNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmRhdGFNb2RlbDtcbn1cblFFSS5wcm90b3R5cGUuZ2V0RGF0YVJhbmdlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsLnJhbmdlO1xufVxuUUVJLnByb3RvdHlwZS51cGRhdGVRdWFsaXR5SW5kZXggPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdD10aGlzO1xuXHR2YXIgZG0gPSB0aGlzLmRhdGFNb2RlbDtcblx0XG5cdGZvcih2YXIgZCBpbiBkbSkge1xuXHRcdGlmKGQ9PSd0aW1lJyB8fCAhZG1bZF0uZGF0YSkgY29udGludWU7XG5cdFxuXHRcdGlmKCFkbVtkXS5xdWFsaXR5SW5kZXggfHwgZG1bZF0uZGF0YS5sZW5ndGggIT0gZG1bZF0ucXVhbGl0eUluZGV4Lmxlbmd0aClcblx0XHRcdGRtW2RdLnF1YWxpdHlJbmRleCA9IG5ldyBBcnJheShkbVtkXS5kYXRhLmxlbmd0aCk7XG5cdFx0XG5cdFx0ZG1bZF0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHYsaSkge1xuXHRcdFx0XHRkbVtkXS5xdWFsaXR5SW5kZXhbaV0gPSBjaGVja1F1YWxpdHkodixkbVtkXS5xdWFsaXR5Q29uZmlnKTtcblx0XHRcdH0pO1xuXHR9XG59XG5RRUkucHJvdG90eXBlLmdldERhdGFjb25mb3J0UmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwuY29uZm9ydFJhbmdlO1xufVxuUUVJLnByb3RvdHlwZS5nZXRTYW1wbGluZyA9IGZ1bmN0aW9uKG51bVNhbXBsZXMpe1xuXHRyZXR1cm4gdGhpcy5zYW1wbGluZztcbn1cblFFSS5wcm90b3R5cGUuc2V0U2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0dGhpcy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG59XG5cblxudmFyIGNoZWNrUXVhbGl0eSA9IGZ1bmN0aW9uKGRhdGEsIHF1YWxpdHlDb25maWcpe1xuXHR2YXIgcXVhbGl0eTtcblx0aWYoZGF0YSAmJiBxdWFsaXR5Q29uZmlnKSB7XG5cdFx0aWYoZGF0YT5xdWFsaXR5Q29uZmlnLmNvbmZvcnRSYW5nZVsxXSB8fCBkYXRhPHF1YWxpdHlDb25maWcuY29uZm9ydFJhbmdlWzBdKVxuXHRcdFx0cXVhbGl0eT0wO1xuXHRcdGVsc2Vcblx0XHRcdHF1YWxpdHk9MS4wXG5cdFx0cmV0dXJuIHF1YWxpdHk7XG5cdH1cblx0cmV0dXJuIDEuMDtcbn1cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfSAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5RRUkucHJvdG90eXBlLl9nZXREYXRhTW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgZGF0YU1vZGVsPXRoaXMuZGF0YU1vZGVsO1xuXHQvKlxcXG5cdHwqfFxuXHR8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcblx0fCp8XG5cdHwqfCAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9Ew6ljb2Rlcl9lbmNvZGVyX2VuX2Jhc2U2NFxuXHR8Knxcblx0XFwqL1xuXHQvKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cblx0YjY0VG9VaW50NiA9IGZ1bmN0aW9uKG5DaHIpIHtcblx0XHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0XHRcdG5DaHIgLSA2NVxuXHRcdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0XHRcdG5DaHIgLSA3MVxuXHRcdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRcdFx0bkNociArIDRcblx0XHRcdDogbkNociA9PT0gNDMgP1xuXHRcdFx0XHQ2MlxuXHRcdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0XHRcdDYzXG5cdFx0XHQ6XHQwO1xuXHR9O1xuXHQvKipcblx0ICogRGVjb2RlIGJhc2U2NCBzdHJpbmcgdG8gVUludDhBcnJheVxuXHQgKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjQgICAgIGJhc2U2NCBjb2RlZCBzdHJpbmdcblx0ICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cblx0ICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgICAgdGFiIG9mIGRlY29kZWQgYnl0ZXNcblx0ICovXG5cdGJhc2U2NERlY1RvQXJyID0gZnVuY3Rpb24oc0Jhc2U2NCwgbkJsb2Nrc1NpemUpIHtcblx0XHR2YXJcblx0XHRzQjY0RW5jID0gc0Jhc2U2NC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL10vZywgXCJcIiksIG5JbkxlbiA9IHNCNjRFbmMubGVuZ3RoLFxuXHRcdG5PdXRMZW4gPSBuQmxvY2tzU2l6ZSA/IE1hdGguY2VpbCgobkluTGVuICogMyArIDEgPj4gMikgLyBuQmxvY2tzU2l6ZSkgKiBuQmxvY2tzU2l6ZSA6IG5JbkxlbiAqIDMgKyAxID4+IDIsXG5cdFx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRcdGZvciAodmFyIG5Nb2QzLCBuTW9kNCwgblVpbnQyNCA9IDAsIG5PdXRJZHggPSAwLCBuSW5JZHggPSAwOyBuSW5JZHggPCBuSW5MZW47IG5JbklkeCsrKSB7XG5cdFx0XHRuTW9kNCA9IG5JbklkeCAmIDM7IC8qIG4gbW9kIDQgKi9cblx0XHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0XHRpZiAobk1vZDQgPT09IDMgfHwgbkluTGVuIC0gbkluSWR4ID09PSAxKSB7XG5cdFx0XHRcdGZvciAobk1vZDMgPSAwOyBuTW9kMyA8IDMgJiYgbk91dElkeCA8IG5PdXRMZW47IG5Nb2QzKyssIG5PdXRJZHgrKykge1xuXHRcdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5VaW50MjQgPSAwO1xuXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdFx0cmV0dXJuIGJ1ZmZlcjtcblx0fTtcblx0XG5cdGlmKGRhdGEgJiYgZGF0YS5oZWFkZXIpIHtcblx0XHQvL34gY29uc29sZS5sb2coJ3JjdmRhdGEgJytKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdFx0Ly8gaWYoIWRhdGEuaGVhZGVyLnNhbXBsaW5nKSBkYXRhLmhlYWRlci5zYW1wbGluZz0xO1xuXHRcdFxuXHRcdC8qKiBjYXNlIDEgOiAxIHZhbHVlIHJlY2VpdmVkIGFkZGVkIHRvIGRhdGFNb2RlbCAqL1xuXHRcdGlmKGRhdGEuaGVhZGVyLnNhbXBsaW5nPT0xKSB7XG5cdFx0XHRpZihkYXRhLmhlYWRlci50aW1lRW5kKSB7XG5cdFx0XHRcdGlmKCFkYXRhTW9kZWwudGltZSkgZGF0YU1vZGVsLnRpbWU9W107XG5cdFx0XHRcdGRhdGFNb2RlbC50aW1lLnB1c2goZGF0YS5oZWFkZXIudGltZUVuZCk7XG5cdFx0XHRcdGlmKGRhdGFNb2RlbC50aW1lLmxlbmd0aCA+IHRoaXMuc2FtcGxpbmcpIHtcblx0XHRcdFx0XHRkYXRhTW9kZWwudGltZSA9IGRhdGFNb2RlbC50aW1lLnNsaWNlKGRhdGFNb2RlbC50aW1lLmxlbmd0aCAtIHRoaXMuc2FtcGxpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBuIGluIGRhdGEpIHtcblx0XHRcdFx0aWYobiAhPSBcImhlYWRlclwiICYmIG4gIT0gXCJ0aW1lXCIpIHtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YT1bXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGxhYmVsICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmxhYmVsPWRhdGFbbl0ubGFiZWw7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdW5pdCAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS51bml0PWRhdGFbbl0udW5pdDtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBjb25mb3J0UmFuZ2UgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ucXVhbGl0eUNvbmZpZz17Y29uZm9ydFJhbmdlOiBkYXRhW25dLmNvbmZvcnRSYW5nZX07XG5cblx0XHRcdFx0XHRpZihkYXRhW25dLmRhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0LyogZGVjb2RlIGRhdGEgdG8gRmxvYXQzMkFycmF5Ki9cblx0XHRcdFx0XHRcdHZhciBidWYgPSBiYXNlNjREZWNUb0FycihkYXRhW25dLmRhdGEsIDQpO1xuXHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYnVmKSk7XG5cdFx0XHRcdFx0XHR2YXIgZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gZkFycmF5Lmxlbmd0aCkgY29uc29sZS5sb2coXCJNaXNtYXRjaCBvZiBzaXplIFwiK2RhdGFbbl0uc2l6ZStcIiB2cyBcIitmQXJyYXkubGVuZ3RoKTtcblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSAxKSBjb25zb2xlLmxvZyhcIkV4cGVjdGVkIDEgdmFsdWUgcmVjZWl2ZWQgOlwiK2RhdGFbbl0uc2l6ZSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmKCFkYXRhTW9kZWxbbl0uZGF0YSkgZGF0YU1vZGVsW25dLmRhdGE9W107XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YS5wdXNoKGZBcnJheVswXSk7XG5cdFx0XHRcdFx0XHRpZihkYXRhTW9kZWxbbl0uZGF0YS5sZW5ndGggPiB0aGlzLnNhbXBsaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gZGF0YU1vZGVsW25dLmRhdGEuc2xpY2UoZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoIC0gdGhpcy5zYW1wbGluZyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IDApIGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCByZWNlaXZlZCBkYXRhIChubyBkYXRhIHZlcnN1cyBzaXplPVwiK2RhdGFbbl0uc2l6ZStcIilcIik7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLnVwZGF0ZVF1YWxpdHlJbmRleCgpO1xuXHRcdFx0XHRcdC8vfiBjb25zb2xlLmxvZygnbXlkYXRhICcrSlNPTi5zdHJpbmdpZnkoZGF0YU1vZGVsW25dLmRhdGEpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdC8qKiBjYXNlIDIgOiBoaXN0b3J5IGRhdGEgLSBtYW55IHZhbHVlcyByZWNlaXZlZCAqL1xuXHRcdFx0LyoqIFRPRE8gICovXG5cdFx0XHRmb3IgKHZhciBuIGluIGRhdGEpIHtcblx0XHRcdFx0aWYobiA9PSAndGltZScpIHtcblx0XHRcdFx0XHQvKiBjYXNlIDEgOiB0aW1lIGRhdGEgdHJhbnNtaXR0ZWQsIDEgdmFsdWUgKi9cblx0XHRcdFx0XHQvKiogVE9ETyAqKi9cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKG4gIT0gXCJoZWFkZXJcIikge1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKG4pO1xuXHRcdFx0XHRcdGlmKCFkYXRhTW9kZWxbbl0pIHtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXT17fTtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhPVtdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHJhbmdlICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnJhbmdlPWRhdGFbbl0ucmFuZ2U7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgbGFiZWwgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSB1bml0ICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnVuaXQ9ZGF0YVtuXS51bml0O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGNvbmZvcnRSYW5nZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5Q29uZmlnPXtjb25mb3J0UmFuZ2U6IGRhdGFbbl0uY29uZm9ydFJhbmdlfTtcblxuXHRcdFx0XHRcdGlmKGRhdGFbbl0uZGF0YS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHQvKiBkZWNvZGUgZGF0YSB0byBGbG9hdDMyQXJyYXkqL1xuXHRcdFx0XHRcdFx0dmFyIGJ1ZiA9IGJhc2U2NERlY1RvQXJyKGRhdGFbbl0uZGF0YSwgNCk7IFxuXHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoYnVmKSk7XG5cdFx0XHRcdFx0XHR2YXIgZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gZkFycmF5Lmxlbmd0aCkgY29uc29sZS5sb2coXCJNaXNtYXRjaCBvZiBzaXplIFwiK2RhdGFbbl0uc2l6ZStcIiB2cyBcIitmQXJyYXkubGVuZ3RoKTtcblx0XHRcdFx0XHRcdC8vIC8qIGluY3JlYXNlIHNpemUgb2YgZGF0YSBpZiBuZWNlc3NhcnkgKi9cblx0XHRcdFx0XHRcdGlmKGZBcnJheS5sZW5ndGg+ZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdC8vIGRhdGFNb2RlbFtuXS5zaXplPWRhdGFbbl0uc2l6ZTtcblx0XHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBuZXcgQXJyYXkoZGF0YU1vZGVsW25dLnNpemUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0LyogdXBkYXRlIG5iIG9mIHNhbXBsZXMgc3RvcmVkICovXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgaW4gZkFycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhW3BhcnNlSW50KGkpXT1mQXJyYXlbaV07IC8qIGtlZXAgZmlyc3QgdmFsIC0gbmFtZSBvZiBjb2x1bW4gKi9cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gMCkgY29uc29sZS5sb2coXCJTaXplIG1pc21hdGNoIHJlY2VpdmVkIGRhdGEgKG5vIGRhdGEgdmVyc3VzIHNpemU9XCIrZGF0YVtuXS5zaXplK1wiKVwiKTtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGRhdGFNb2RlbFtuXS5kYXRhID0gQXJyYXkuZnJvbShmQXJyYXkpO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdteWRhdGEgJytKU09OLnN0cmluZ2lmeShkYXRhTW9kZWxbbl0uZGF0YSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKFwiTm8gRGF0YSB0byByZWFkIG9yIGhlYWRlciBpcyBtaXNzaW5nICFcIik7XG5cdH1cblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsO1xufVxuXG5cbnZhciBleHAgPSB7XG5cdFx0UUVJOiBRRUlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHA7IFxuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cblxudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cbi8qPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cbnZhciBSVENQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uO1xudmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgfHwgd2luZG93Lm1velJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cud2Via2l0UlRDSWNlQ2FuZGlkYXRlO1xudmFyIFJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93Lm1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xuXG5mdW5jdGlvbiBDaGFubmVsKG5hbWUsIG9wZW5fY2Ipe1xuXHR0aGlzLm5hbWUgPSBuYW1lO1xuXG5cdHRoaXMuY2hhbm5lbCA9IHVuZGVmaW5lZDtcblx0dGhpcy5vbm9wZW4gPSBvcGVuX2NiO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xufVxuXG5DaGFubmVsLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24oZGF0YWNoYW5uZWwpe1xuXHR0aGlzLmNoYW5uZWwgPSBkYXRhY2hhbm5lbDtcblxuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKHRoYXQub25vcGVuKSB0aGF0Lm9ub3Blbih0aGF0KTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLmNsb3NlZCA9IHRydWU7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNldE9uTWVzc2FnZSA9IGZ1bmN0aW9uKG9ubWVzc2FnZSl7XG5cdHRoaXMuY2hhbm5lbC5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtc2cpe1xuXHRpZih0aGlzLmNsb3NlZCkgcmV0dXJuIGZhbHNlO1xuXHRlbHNlIGlmKHRoaXMuY2hhbm5lbC5yZWFkeVN0YXRlID09PSAnb3Blbicpe1xuXHRcdHRoaXMuY2hhbm5lbC5zZW5kKG1zZyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0ZWxzZXtcblx0XHRjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSB3YXJuaW5nIDogd2VicnRjIGRhdGFjaGFubmVsIHN0YXRlID0gJyt0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIFBlZXIocnRjLCBpZCwgY2hhbm5lbHMpe1xuXHR0aGlzLmlkID0gaWQ7XG5cdHRoaXMuY2hhbm5lbHMgPSBjaGFubmVscztcblx0dGhpcy5ydGMgPSBydGM7XG5cdHRoaXMucGVlciA9IG51bGw7XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59XG5cblxuUGVlci5wcm90b3R5cGUuX2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5zdWIgPSB0aGlzLnJ0Yy5ub2RlLmxpc3Rlbih7XG5cdFx0c2VydmljZTogJ3J0YycsXG5cdFx0ZnVuYzogJ0Nvbm5lY3QnLFxuXHRcdG9iajogdGhpcy5jaGFubmVscyxcblx0XHRkYXRhOiB7XG5cdFx0XHRwcm9tSUQ6IHRoaXMuaWRcblx0XHR9XG5cdH0sXG5cdGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHRoYXQuX2hhbmRsZU5lZ29jaWF0aW9uTWVzc2FnZShkYXRhKTtcblx0fSk7XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdGlmKCF0aGF0LmNvbm5lY3RlZCAmJiAhdGhhdC5jbG9zZWQpe1xuXHRcdFx0dGhhdC5ydGMucmVjb25uZWN0KCk7XG5cdFx0fWVsc2V7XG5cdFx0fVxuXHR9LCAxMDAwMCk7XG59XG5cblBlZXIucHJvdG90eXBlLl9oYW5kbGVOZWdvY2lhdGlvbk1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpe1xuXG5cdGlmKG1zZy5ldmVudFR5cGUgPT09ICdSZW1vdGVPZmZlcicpe1xuXHRcdHRoaXMuX2NyZWF0ZVBlZXIobXNnKTtcblx0fWVsc2UgaWYobXNnLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZUlDRUNhbmRpZGF0ZScpe1xuXHRcdHRoaXMuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZShtc2cpO1xuXHR9XG59O1xuXG52YXIgc2VydmVycyA9IHtcImljZVNlcnZlcnNcIjogW3tcInVybFwiOiBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIn1dfTtcblxuUGVlci5wcm90b3R5cGUuX2NyZWF0ZVBlZXIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBwZWVyID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHNlcnZlcnMsIHttYW5kYXRvcnk6IFt7RHRsc1NydHBLZXlBZ3JlZW1lbnQ6IHRydWV9LCB7RW5hYmxlRHRsc1NydHA6IHRydWV9XX0pO1xuXHR0aGlzLnBlZXIgPSBwZWVyO1xuXG5cdHBlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7c2RwOiBkYXRhLnNkcCwgdHlwZTogZGF0YS50eXBlfSkpO1xuXG5cdHBlZXIuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRcdHBlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKTtcblxuXHRcdHRoYXQucnRjLm5vZGUuZ2V0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0Fuc3dlcicsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0c2RwOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcCxcblx0XHRcdFx0dHlwZTogc2Vzc2lvbl9kZXNjcmlwdGlvbi50eXBlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZ1bmN0aW9uKGVycil7XG5cdFx0Y29uc29sZS5sb2coXCJjYW5ub3QgY3JlYXRlIGFuc3dlclwiKTtcblx0fSwgXG5cdHsgJ21hbmRhdG9yeSc6IHsgJ09mZmVyVG9SZWNlaXZlQXVkaW8nOiB0cnVlLCAnT2ZmZXJUb1JlY2VpdmVWaWRlbyc6IHRydWUgfSB9KTtcblxuXG5cdHBlZXIub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGNvbnNvbGUubG9nKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlKTtcblx0XHRpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Nvbm5lY3RlZCcpe1xuXHRcdFx0dGhhdC5jb25uZWN0ZWQgPSB0cnVlOyAgXG5cdFx0XHR0aGF0LnJ0Yy5ub2RlLnN0b3BMaXN0ZW5pbmcodGhpcy5zdWIpO1xuXHRcdH1lbHNlIGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZGlzY29ubmVjdGVkJyl7XG5cdFx0XHRpZighdGhhdC5jbG9zZWQpIHRoYXQucnRjLnJlY29ubmVjdCgpO1xuXHRcdH1cblx0fVxuXG5cdHBlZXIub25pY2VjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQucnRjLm5vZGUuZ2V0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0lDRUNhbmRpZGF0ZScsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiB0aGF0LmlkLFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25EYXRhQ2hhbm5lbChldnQuY2hhbm5lbCk7XG5cdH07XG59XG5cblBlZXIucHJvdG90eXBlLl9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0cnl7XG5cdFx0dmFyIGNhbmRpZGF0ZSA9IG5ldyBSVENJY2VDYW5kaWRhdGUoZGF0YS5jYW5kaWRhdGUpO1xuXHRcdHRoaXMucGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNhbmRpZGF0ZSBhZGRlZCAoXCIrdGhhdC5wZWVyLmljZUNvbm5lY3Rpb25TdGF0ZStcIilcIik7XG5cdFx0fSxmdW5jdGlvbihlKXtcblx0XHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdH0pO1xuXHR9Y2F0Y2goZSkge2NvbnNvbGUubG9nKGUpO31cbn1cblxuUGVlci5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5ub2RlLnN0b3BMaXN0ZW5pbmcodGhpcy5zdWIpO1xuXHRpZih0aGlzLnBlZXIpIHRoaXMucGVlci5jbG9zZSgpO1xuXHR0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHR0aGlzLmNsb3NlZCA9IHRydWU7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBSVEMobm9kZSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdHRoaXMudXNlZENoYW5uZWxzID0gW107XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscyA9IFtdO1xuXG5cdHRoaXMucGVlcnMgPSBbXTtcbn1cblxuUlRDLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihuYW1lX3JlZ2V4LCBvbm9wZW5fY2FsbGJhY2spe1xuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goe3JlZ2V4OiBuYW1lX3JlZ2V4LCBjYjogb25vcGVuX2NhbGxiYWNrfSk7XG59XG5cblJUQy5wcm90b3R5cGUucmVjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFxuXHR0aGF0LmRpc2Nvbm5lY3QoKTtcblx0dGhhdC5jb25uZWN0KCk7XG5cdGNvbnNvbGUubG9nKFwicmVjb25uZWN0aW5nLi4uXCIpO1xufVxuXG5SVEMucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXG5cdGZvcih2YXIgcHJvbUlEIGluIHRoaXMucGVlcnMpe1xuXHRcdHRoaXMuX2Nsb3NlUGVlcihwcm9tSUQpO1xuXHR9XG5cblx0dGhpcy5ub2RlLnN0b3BMaXN0ZW5pbmcodGhpcy5zdWIpO1xuXG5cdGlmKHR5cGVvZiB0aGlzLm9uY2xvc2UgPT09ICdmdW5jdGlvbicpIHRoaXMub25jbG9zZSgpO1xufVxuXG5SVEMucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBmb3VuZENoYW5uZWxzID0gZmFsc2U7XG5cblx0dGhpcy5zdWIgPSB0aGlzLm5vZGUubGlzdGVuKHtcblx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRmdW5jOiAnTGlzdGVuUGVlcnMnXG5cdH0sXG5cdGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XG5cdFx0aWYoZGF0YS5ldmVudFR5cGUgJiYgZGF0YS5wcm9tSUQgIT09IHVuZGVmaW5lZCl7XG5cblx0XHRcdGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUGVlckNvbm5lY3RlZCcpe1xuXHRcdFx0XHRpZighdGhhdC5wZWVyc1tkYXRhLnByb21JRF0pe1xuXHRcdFx0XHRcdHZhciBjaGFubmVscyA9IHRoYXQuX21hdGNoQ2hhbm5lbHMoZGF0YS5jaGFubmVscyk7XG5cdFx0XHRcdFx0aWYoY2hhbm5lbHMubGVuZ3RoID4gMCl7XG5cdFx0XHRcdFx0XHR0aGF0LnBlZXJzW2RhdGEucHJvbUlEXSA9IG5ldyBQZWVyKHRoYXQsIGRhdGEucHJvbUlELCBjaGFubmVscyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUGVlckNsb3NlZCcpe1xuXHRcdFx0XHRpZih0aGF0LnBlZXJzW2RhdGEucHJvbUlEXSkgdGhhdC5fY2xvc2VQZWVyKGRhdGEucHJvbUlEKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG59XG5cblxuUlRDLnByb3RvdHlwZS5fY2xvc2VQZWVyID0gZnVuY3Rpb24ocHJvbUlEKXtcblxuXHRpZih0aGlzLnBlZXJzW3Byb21JRF0pe1xuXHRcdHZhciBwID0gdGhpcy5wZWVyc1twcm9tSURdO1xuXHRcdHAuY2xvc2UoKTtcblxuXHRcdGZvcih2YXIgaT0wOyBpIDwgcC5jaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRkZWxldGUgdGhpcy51c2VkQ2hhbm5lbHNbcC5jaGFubmVsc1tpXV07XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXMucGVlcnNbcHJvbUlEXTtcblx0fVxufVxuXG5SVEMucHJvdG90eXBlLl9tYXRjaENoYW5uZWxzID0gZnVuY3Rpb24ocmVjZWl2ZWRDaGFubmVscyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvL0NvbnRhaW5zIGFsbCBjaGFubmVscyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIENvbm5lY3QgYXMgb2JqZWN0c1xuXHR2YXIgY2hhbm5lbHMgPSBbXTtcblxuXHRmb3IodmFyIGkgPSAwOyBpIDwgcmVjZWl2ZWRDaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIG5hbWUgPSByZWNlaXZlZENoYW5uZWxzW2ldO1xuXHRcdFxuXHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGF0LnJlcXVlc3RlZENoYW5uZWxzLmxlbmd0aDsgaisrKXtcblx0XHRcdHZhciByZXEgPSB0aGF0LnJlcXVlc3RlZENoYW5uZWxzW2pdO1xuXHRcdFx0XG5cdFx0XHRpZihuYW1lICYmIG5hbWUubWF0Y2gocmVxLnJlZ2V4KSAmJiAhdGhhdC51c2VkQ2hhbm5lbHNbbmFtZV0pe1xuXHRcdFx0XHR0aGF0LnVzZWRDaGFubmVsc1tuYW1lXSA9IG5ldyBDaGFubmVsKG5hbWUsIHJlcS5jYik7XG5cdFx0XHRcdGNoYW5uZWxzLnB1c2gobmFtZSk7IC8vcHJlcGFyZSB0aGUgY29ubmVjdCBvYmplY3QgbGlzdFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBjaGFubmVscztcbn07XG5cblJUQy5wcm90b3R5cGUuX29uRGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdGNvbnNvbGUubG9nKFwiQ2hhbm5lbCBcIitkYXRhY2hhbm5lbC5sYWJlbCtcIiBjcmVhdGVkICFcIik7XG5cblx0dmFyIGNoYW5uZWwgPSB0aGlzLnVzZWRDaGFubmVsc1tkYXRhY2hhbm5lbC5sYWJlbF07XG5cdGlmKCFjaGFubmVsKXtcblx0XHRkYXRhY2hhbm5lbC5jbG9zZSgpO1xuXHRcdHJldHVybiA7XG5cdH1cblxuXHRjaGFubmVsLnNldENoYW5uZWwoZGF0YWNoYW5uZWwpO1xufVxuXG5cbnZhciBleHAgPSB7XG5cdFx0UlRDOiBSVENcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHA7IFxuIl19
