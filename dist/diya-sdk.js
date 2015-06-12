!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.diya=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],3:[function(require,module,exports){
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

},{"./support/isBuffer":2,"_process":1,"inherits":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
var update = require('./services/update/update');
var pico = require('./services/pico/pico'); //lien fait service(cote serv)

var WebSocket = window.WebSocket || window.MozWebSocket;



 

function Diya(addr){
	var that = this;
	var socket;	

	var DEBUG = false;

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
		closeAll();
	}
	
	this.debug = function(value){
		DEBUG = value;
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
		qei: qei,
		update: update,
		pico: pico
}

module.exports = diya;

},{"./services/discover/discover":6,"./services/message":7,"./services/pico/pico":8,"./services/promethe/promethe":9,"./services/qei/qei":10,"./services/rtc/rtc":11,"./services/update/update":12}],6:[function(require,module,exports){
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

function pico(node){
	var that = this;
	this.node = node;
	return this;
}

//

pico.prototype.power = function(){

	this.node.get({
		service: 'pico',
		func: 'Power'
	}, function(data){
		/*if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);*/

	});
}

pico.prototype.zoom = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Zoom'
	}, function(data){
		/*if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);*/

	});
}


pico.prototype.back = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Back'
	}, function(data){
		/*if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}


pico.prototype.up = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Up'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
	*/
	});
}


pico.prototype.left = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Left'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
	*/
	});
}


pico.prototype.ok = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Ok'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}


pico.prototype.right = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Right'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}


pico.prototype.down = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Down'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}

pico.prototype.prev = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Prev'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}

pico.prototype.play = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Play'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}
pico.prototype.next = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Next'
	}, function(data){
/*		if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
	*/
	});
}

pico.prototype.lumiDown = function(callback){

	this.node.get({
		service: 'pico',
		func: 'LumiDown'
	}, function(data){
/*		if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
	*/
	});
}

pico.prototype.lumiUp = function(callback){

	this.node.get({
		service: 'pico',
		func: 'LumiUp'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}

pico.prototype.volumeDown = function(callback){

	this.node.get({
		service: 'pico',
		func: 'VolumeDown'
	}, function(data){
		/*if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
	*/
	});
}


pico.prototype.mute = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Mute'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}

pico.prototype.volumeUp = function(callback){

	this.node.get({
		service: 'pico',
		func: 'VolumeUp'
	}, function(data){
	/*	if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);
		*/
	});
}




var exp = {
		pico: pico
}

module.exports = exp;

},{"../message":7,"util":3}],9:[function(require,module,exports){
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
		};

		channel.write = function(index, value){
			if(index < 0 || index > channel.size || isNaN(value)) return false;
			channel._buffer[index] = value;
			channel._requestSend();
			return true;
		};

		channel.writeAll = function(values){
			if(!Array.isArray(values) || values.length !== channel.size)
				return false;

			for (var i = 0; i<values.length; i++){
				if(isNaN(values[i])) return false;
				channel._buffer[i] = values[i];
			}
			channel._requestSend();
		};

		channel._lastSendTimestamp = 0;
		channel._sendRequested = false;

		channel.frequency = 30;

		channel._requestSend = function(){
			var elapsedTime = new Date().getTime() - channel._lastSendTimestamp;
			var period = 1000 / channel.frequency;
			if(elapsedTime >= period){
				channel._doSend();
			}else if(!channel._sendRequested){
				channel._sendRequested = true;
				setTimeout(channel._doSend, period - elapsedTime);
			}
		};

		channel._doSend = function(){
			channel._sendRequested = false;
			channel._lastSendTimestamp = new Date().getTime();
			channel.send(channel._buffer);
		};

		callback(channel);

	});
}


module.exports = Promethe;

},{"../rtc/rtc":11}],10:[function(require,module,exports){
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
	that._updateLevels(that.dataModel);
	that.callback(that.dataModel);

	that.timedRequest = function() {
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
		that._updateLevels(that.dataModel);
		that.callback(that.dataModel);
	    });
	    setTimeout(that.timedRequest,3000);
	};
	setTimeout(that.timedRequest());

	node.listen({
	    service: "qei",
	    func: "SubscribeQei"
	}, function(res) {
	    that._getDataModelFromRecv(res.data);
	    that._updateLevels(that.dataModel);
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
 * 			unit: string,
 *      label: string
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



QEI.prototype._updateConfinementLevel = function(model){
	var co2 = model['CO2'].data[model['CO2'].data.length - 1];
	var voct = model['VOCt'].data[model['VOCt'].data.length - 1];
	var confinement = Math.max(co2, voct);

	if(confinement < 800){
		return 3;
	}
	if(confinement < 1600){
		return 2;
	}
	if(confinement < 2400){
		return 1;
	}
	if(confinement < 3000){
		return 0;
	}
}

QEI.prototype._updateAirQualityLevel = function(confinement, model){
	var fineDustQualityIndex = model['Fine Dust'].qualityIndex[model['Fine Dust'].qualityIndex.length-1];
	var ozoneQualityIndex = model['Ozone'].qualityIndex[model['Ozone'].qualityIndex.length-1];

	var qualityIndex = fineDustQualityIndex + ozoneQualityIndex;
	if(qualityIndex < 2) return confinement - 1;
	else return confinement;
}

QEI.prototype._updateEnvQualityLevel = function(airQuality, model){
	var humidityQualityIndex = model['Humidity'].qualityIndex[model['Humidity'].qualityIndex.length-1];
	var temperatureQualityIndex = model['Temperature'].qualityIndex[model['Temperature'].qualityIndex.length-1];

	var qualityIndex = humidityQualityIndex + temperatureQualityIndex;
	if(qualityIndex < 2) return airQuality - 1;
	else return airQuality;	
}

QEI.prototype._updateLevels = function(model){
	this.confinement = this._updateConfinementLevel(model);
	this.airQuality = this._updateAirQualityLevel(this.confinement, model);
	this.envQuality = this._updateEnvQualityLevel(this.airQuality, model);
}

QEI.prototype.getConfinementLevel = function(){
	return this.confinement;
}

QEI.prototype.getAirQualityLevel = function(){
	return this.airQuality;
}

QEI.prototype.getEnvQualityLevel = function(){
	return this.envQuality;
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

},{"../message":7,"util":3}],11:[function(require,module,exports){
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
		try{
			this.channel.send(msg);
		}catch(e){
			console.log('[rtc.channel.write] exception occured while sending data');
		}
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
	if(this.peer) try{
		this.peer.close();
	}catch(e){}
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
				if(that.peers[data.promID]){
					that._closePeer(data.promID);
					if(typeof that.onclose === 'function') that.onclose();
				}
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

},{"../message":7,"util":3}],12:[function(require,module,exports){
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

function Update(node){	
	var that = this;
	this.node = node;
	return this;
}

Update.prototype.statusLockApt = function(callback){
	
	/*this.node.get({
			service: 'update',
			func: 'LockStatus'
		},function(data){
			if(data.lockStatus) 
				callback(null,data.lockStatus); 
	});*/
	
	this.node.listen({
			service: 'update',
			func: 'SubscribeLockStatus'
		}, 
		function(res){
			callback(null,res.lockStatus);
			console.log(res.lockStatus);
		});

}

Update.prototype.listPackages = function(callback){

	this.node.get({
		service: 'update',
		func: 'ListPackages'
	}, function(data){
		if(data.packages) 
			callback(null,data.packages); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}
	
Update.prototype.updateAll = function(callback){

	this.node.get({
		service: 'update',
		func: 'UpdateAll'
	}, function(data){
		if(data.packages) 
			callback(null,data.packages); 
		if(data.error)
			callback(data.error,null);
	}); 
}
	
Update.prototype.installPackage = function(pkg, callback){
		
	if ((pkg === 'Undefined') || (typeof pkg !== 'string') || (pkg.length < 2)){
		callback('undefinedPackage',null);
	}
	else {
	
		var INVALID_PARAMETERS_REGEX = /^-|[^\s]\s+[^\s]|-$/;
		var testNamePkg= INVALID_PARAMETERS_REGEX.test(pkg);
		if (testNamePkg)
			callback("InvalidParameters",null);
		else{
				
			this.node.get({
				service: 'update',
				func: 'InstallPackage',
				data:{
					package: pkg,
				}
			}, function(data){
				if(data.packages) 
					callback(null,data.packages); 
				if(data.error)
					callback(data.error,null);
					
				
			});
		}
	}
	
}

Update.prototype.removePackage = function(pkg, callback){
		
	if ((pkg === 'Undefined') || (typeof pkg !== 'string') || (pkg.length < 2)){
		callback('undefinedPackage',null);
	}
	else {
	
		var INVALID_PARAMETERS_REGEX = /^[+ -]|[^\s]\s+[^\s]|[+ -]$/;
		var testNamePkg= INVALID_PARAMETERS_REGEX.test(pkg);
		if (testNamePkg)
			callback("InvalidParameters",null);
		else{
				
			this.node.get({
				service: 'update',
				func: 'RemovePackage',
				data:{
					package: pkg,
				}
			}, function(data){
				if(data.packages) 
					callback(null,data.packages); 
				if(data.error)
					callback(data.error,null);
					
				
			});
		}
	}
	
}
		
		
var exp = {
		Update: Update
}

module.exports = exp; 

},{"../message":7,"util":3}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zb25pYS93b3Jrc3BhY2UvRGl5YVNESy1ORy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvc29uaWEvd29ya3NwYWNlL0RpeWFTREstTkcvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL2hvbWUvc29uaWEvd29ya3NwYWNlL0RpeWFTREstTkcvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvaG9tZS9zb25pYS93b3Jrc3BhY2UvRGl5YVNESy1ORy9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9zb25pYS93b3Jrc3BhY2UvRGl5YVNESy1ORy9zcmMvc2VydmljZXMvZGlzY292ZXIvZGlzY292ZXIuanMiLCIvaG9tZS9zb25pYS93b3Jrc3BhY2UvRGl5YVNESy1ORy9zcmMvc2VydmljZXMvbWVzc2FnZS5qcyIsIi9ob21lL3NvbmlhL3dvcmtzcGFjZS9EaXlhU0RLLU5HL3NyYy9zZXJ2aWNlcy9waWNvL3BpY28uanMiLCIvaG9tZS9zb25pYS93b3Jrc3BhY2UvRGl5YVNESy1ORy9zcmMvc2VydmljZXMvcHJvbWV0aGUvcHJvbWV0aGUuanMiLCIvaG9tZS9zb25pYS93b3Jrc3BhY2UvRGl5YVNESy1ORy9zcmMvc2VydmljZXMvcWVpL3FlaS5qcyIsIi9ob21lL3NvbmlhL3dvcmtzcGFjZS9EaXlhU0RLLU5HL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvc29uaWEvd29ya3NwYWNlL0RpeWFTREstTkcvc3JjL3NlcnZpY2VzL3VwZGF0ZS91cGRhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvKiBEaXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG52YXIgbWVzc2FnZSA9IHJlcXVpcmUoJy4vc2VydmljZXMvbWVzc2FnZScpO1xuXG4vL1NlcnZpY2VzXG52YXIgcnRjID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9ydGMvcnRjJyk7XG52YXIgUHJvbWV0aGUgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3Byb21ldGhlL3Byb21ldGhlJyk7XG52YXIgZGlzY292ZXIgPSByZXF1aXJlKCcuL3NlcnZpY2VzL2Rpc2NvdmVyL2Rpc2NvdmVyJyk7XG52YXIgcWVpID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9xZWkvcWVpJyk7XG52YXIgdXBkYXRlID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy91cGRhdGUvdXBkYXRlJyk7XG52YXIgcGljbyA9IHJlcXVpcmUoJy4vc2VydmljZXMvcGljby9waWNvJyk7IC8vbGllbiBmYWl0IHNlcnZpY2UoY290ZSBzZXJ2KVxuXG52YXIgV2ViU29ja2V0ID0gd2luZG93LldlYlNvY2tldCB8fCB3aW5kb3cuTW96V2ViU29ja2V0O1xuXG5cblxuIFxuXG5mdW5jdGlvbiBEaXlhKGFkZHIpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBzb2NrZXQ7XHRcblxuXHR2YXIgREVCVUcgPSBmYWxzZTtcblxuXHR2YXIgY2xvc2VfY2IgPSBudWxsO1xuXG5cdHZhciBwZW5kaW5nUmVxdWVzdHMgPSBbXTtcblx0dmFyIHJlZ2lzdGVyZWRMaXN0ZW5lcnMgPSBbXTtcblxuXHR2YXIgbmV4dFJlcUlkID0gLTE7XG5cdGZ1bmN0aW9uIGNvbnN1bWVOZXh0UmVxSWQoKXtcblx0XHRuZXh0UmVxSWQrKztcblx0XHRyZXR1cm4gbmV4dFJlcUlkO1xuXHR9XG5cblx0dmFyIG5leHRTdWJzY3JpcHRpb25JZCA9IC0xO1xuXHRmdW5jdGlvbiBjb25zdW1lTmV4dFN1YnNjcmlwdGlvbklkKCl7XG5cdFx0bmV4dFN1YnNjcmlwdGlvbklkKys7XG5cdFx0cmV0dXJuIG5leHRTdWJzY3JpcHRpb25JZDtcblx0fVxuXHRcblx0ZnVuY3Rpb24gZGlzcGF0Y2gobXNnKXtcblxuXHRcdGlmKG1zZy5yZXFJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoUmVxdWVzdChtc2cpO1xuXHRcdH1lbHNlIGlmKG1zZy5zdWJJZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGRpc3BhdGNoRXZlbnQobXNnKTtcblx0XHR9XG5cdFx0Ly9JZiB0aGUgbXNnIGRvZXNuJ3QgaGF2ZSBhIHJlcUlkLCBpdCBjYW5ub3QgYmUgbWF0Y2hlZCB0byBhIHBlbmRpbmcgcmVxdWVzdFxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ21pc3NpbmcgcmVxSWQgb3Igc3ViSWQuIElnbm9yaW5nIG1zZyA6ICcpO1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0XG5cdH1cblxuXHRmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QobXNnKXtcblx0XHQvL0lmIG1zZy5yZXFJZCBjb3JyZXNwb25kcyB0byBhIHBlbmRpbmcgcmVxdWVzdCwgZXhlY3V0ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0gPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0Ly9leGVjdXRlIHRoZSByZXNwb25zZSBjYWxsYmFjaywgcGFzcyB0aGUgbWVzc2FnZSBkYXRhIGFzIGFyZ3VtZW50XG5cdFx0XHRwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXShtc2cuZGF0YSk7XG5cdFx0XHRkZWxldGUgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF07XG5cdFx0fWVsc2V7XG5cdFx0XHQvL05vIHBlbmRpbmcgcmVxdWVzdCBmb3IgdGhpcyByZXFJZCwgaWdub3JpbmcgcmVzcG9uc2Vcblx0XHRcdGNvbnNvbGUubG9nKCdtc2cucmVxSWQgZG9lc25cXCd0IG1hdGNoIGFueSBwZW5kaW5nIHJlcXVlc3QsIElnbm9yaW5nIG1zZyAhICcrbXNnKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChtc2cpe1xuXHRcdC8vSWYgbXNnLnN1YklkIGNvcnJlc3BvbmRzIHRvIGEgcmVnaXN0ZXJlZCBsaXN0ZW5lciwgZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2tcblx0XHRpZih0eXBlb2YgcmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cblx0XHRcdC8vZXhlY3V0ZSB0aGUgZXZlbnQgY2FsbGJhY2ssIHBhc3MgdGhlIG1lc3NhZ2UgZGF0YSBhcyBhcmd1bWVudFxuXHRcdFx0aWYoIW1zZy5yZXN1bHQgfHwgbXNnLnJlc3VsdCAhPSAnY2xvc2VkJyl7XG5cdFx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXShtc2cuZGF0YSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Ly9JZiB0aGUgc3Vic2NyaXB0aW9uIHdhcyBjbG9zZWQsIGNhbGwgbGlzdGVuZXIgd2l0aCBudWxsIGRhdGEsIHRoZW4gcmVtb3ZlIHRoZSBoYW5kbGVyXG5cdFx0XHRcdHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXShudWxsKTtcblx0XHRcdFx0ZGVsZXRlIHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXTtcblx0XHRcdH1cblxuXG5cdFx0fWVsc2V7XG5cdFx0XHQvL05vIHBlbmRpbmcgcmVxdWVzdCBmb3IgdGhpcyBzdWJJZCwgaWdub3JpbmcgZXZlbnRcblx0XHRcdGNvbnNvbGUubG9nKCdtc2cuc3ViSWQgZG9lc25cXCd0IG1hdGNoIGFueSByZWdpc3RlcmVkIGxpc3RlbmVycywgSWdub3JpbmcgbXNnICEgJyk7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cdH1cblx0XG5cdFxuXHRmdW5jdGlvbiBzZW5kKG1zZyl7XG5cdFx0aWYoc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiZGl5YS1TREsgOiBjYW5ub3Qgc2VuZCBtZXNzYWdlIC0+IHNvY2tldCBjbG9zZWRcIik7XG5cdFx0fVxuXHRcdHRyeXtcblx0XHRcdGRhdGEgPSBKU09OLnN0cmluZ2lmeShtc2cpO1xuXHRcdFx0c29ja2V0LnNlbmQoZGF0YSk7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coJ21hbGZvcm1lZCBKU09OLCBpZ25vcmluZyBtc2cuLi4nKTtcblx0XHR9XG5cdH1cdFxuXHRcblx0ZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShpbmNvbWluZ01lc3NhZ2Upe1xuXHRcdHZhciBtc2c7XG5cblx0XHR0cnl7XG5cdFx0XHRtc2cgPSBKU09OLnBhcnNlKGluY29taW5nTWVzc2FnZS5kYXRhKTtcblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZyhcIm1hbGZvcm1lZCBKU09OXCIpO1xuXHRcdFx0IFxuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cdFx0XG5cdFx0ZGlzcGF0Y2gobXNnKTtcblxuXHR9O1xuXHRcblx0ZnVuY3Rpb24gY2xvc2VBbGwoKXtcblx0XHR3aGlsZShwZW5kaW5nUmVxdWVzdHMubGVuZ3RoKXtcblx0XHRcdHBlbmRpbmdSZXF1ZXN0cy5wb3AoKTtcblx0XHR9XG5cdFx0d2hpbGUocmVnaXN0ZXJlZExpc3RlbmVycy5sZW5ndGgpe1xuXHRcdFx0cmVnaXN0ZXJlZExpc3RlbmVycy5wb3AoKTtcblx0XHR9XG5cdFx0aWYodHlwZW9mIGNsb3NlX2NiID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNsb3NlX2NiKCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlTWVzc2FnZShwYXJhbXMpe1xuXHRcdGlmKCFwYXJhbXMuc2VydmljZSkgcmV0dXJuIG51bGw7XG5cdFx0ZWxzZSByZXR1cm4ge1xuXHRcdFx0c2VydmljZTogcGFyYW1zLnNlcnZpY2UsXG5cdFx0XHRmdW5jOiBwYXJhbXMuZnVuYyA/IHBhcmFtcy5mdW5jIDogdW5kZWZpbmVkLFxuXHRcdFx0b2JqOiBwYXJhbXMub2JqID8gcGFyYW1zLm9iaiA6IHVuZGVmaW5lZCxcblx0XHRcdGRhdGE6IHBhcmFtcy5kYXRhID8gcGFyYW1zLmRhdGEgOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy9QdWJsaWMgQVBJLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFxuXHR0aGlzLmNvbm5lY3QgPSBmdW5jdGlvbihjYWxsYmFjaywgYXJncyl7XG5cdFx0dHJ5e1xuXHRcdFx0c29ja2V0ID0gbmV3IFdlYlNvY2tldChhZGRyKTtcblxuXHRcdFx0c29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcblx0XHRcdFx0Y2FsbGJhY2soXCJDYW5ub3QgQ29ubmVjdFwiLCBudWxsKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIGFyZ3MpO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGluY29taW5nTWVzc2FnZSl7XG5cdFx0XHRcdGhhbmRsZU1lc3NhZ2UoaW5jb21pbmdNZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRjbG9zZUFsbCgpO1xuXHRcdFx0fVxuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiY2FuJ3QgY29ubmVjdCB0byBcIithZGRyKTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy5nZXQgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrLCB0aW1lb3V0KXtcblx0XHR2YXIgbXNnID0gY3JlYXRlTWVzc2FnZShwYXJhbXMpO1xuXHRcdGlmKG1zZyA9PT0gbnVsbCkgcmV0dXJuIDtcblxuXHRcdG1zZy5yZXFJZCA9IGNvbnN1bWVOZXh0UmVxSWQoKTtcblx0XHRwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXSA9IGNhbGxiYWNrO1xuXG5cdFx0Ly9UaW1lb3V0IGFmdGVyIHdoaWNoIHRoZSByZXF1ZXN0IHdpbGwgYmUgZGlzY2FyZGVkXG5cdFx0aWYodGltZW91dCAmJiB0aW1lb3V0ID4gMCl7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdKXtcblx0XHRcdFx0XHRkZWxldGUgcGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF07XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRpbWVvdXQpO1xuXHRcdH1cblxuXHRcdHNlbmQobXNnKTtcblx0fVxuXG5cdHRoaXMubGlzdGVuID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgdGltZW91dCl7XG5cdFx0dmFyIG1zZyA9IGNyZWF0ZU1lc3NhZ2UocGFyYW1zKTtcblx0XHRpZihtc2cgPT09IG51bGwpIHJldHVybiA7XG5cblx0XHRtc2cuc3ViSWQgPSBjb25zdW1lTmV4dFN1YnNjcmlwdGlvbklkKCk7XG5cdFx0cmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdID0gY2FsbGJhY2s7XG5cblx0XHQvL1RpbWVvdXQgYWZ0ZXIgd2hpY2ggdGhlIHN1YnNjcmlwdGlvbiBpcyBhdXRvbWF0aWNhbGx5IGludmFsaWRhdGVkXG5cdFx0aWYodGltZW91dCAmJiB0aW1lb3V0ID4gMCl7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuc3RvcExpc3RlbmluZyhtc2cuc3ViSWQpO1x0XG5cdFx0XHR9LCB0aW1lb3V0KTtcblx0XHR9XG5cblx0XHRzZW5kKG1zZyk7XG5cblx0XHRyZXR1cm4gbXNnLnN1YklkO1xuXHR9XG5cblx0dGhpcy5jbG9zZUNhbGxiYWNrID0gZnVuY3Rpb24oY2Ipe1xuXHRcdGNsb3NlX2NiID0gY2I7XG5cdH1cblxuXHR0aGlzLnN0b3BMaXN0ZW5pbmcgPSBmdW5jdGlvbihzdWJJZCl7XG5cblx0XHRpZighcmVnaXN0ZXJlZExpc3RlbmVyc1tzdWJJZF0pIHJldHVybiA7XG5cblx0XHRtc2cgPSB7XG5cdFx0XHRmdW5jOiAnVW5zdWJzY3JpYmUnLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRzdWJJZDogc3ViSWRcblx0XHRcdH1cblx0XHR9XG5cblx0XHRzZW5kKG1zZyk7XG5cblx0XHRkZWxldGUgcmVnaXN0ZXJlZExpc3RlbmVyc1tzdWJJZF07XG5cdH1cblxuXHR0aGlzLmNvbm5lY3RlZCA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuICEgKHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORyB8fCBzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCk7XG5cdH1cblxuXHR0aGlzLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHRcdHNvY2tldC5jbG9zZSgpO1xuXHRcdGNsb3NlQWxsKCk7XG5cdH1cblx0XG5cdHRoaXMuZGVidWcgPSBmdW5jdGlvbih2YWx1ZSl7XG5cdFx0REVCVUcgPSB2YWx1ZTtcblx0fVxufVxuXG5cbmZ1bmN0aW9uIERpeWFDbGllbnQoYWRkciwgdXNlciwgcGFzc3dvcmQpe1xuXG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHRmdW5jdGlvbiBjcmVhdGVOb2RlKCl7XG5cdFx0dmFyIG5vZGUgPSBuZXcgZGl5YS5EaXlhKGFkZHIpO1xuXHRcdC8vbm9kZXMucHVzaChub2RlKTtcblxuXHRcdHJldHVybiBub2RlO1xuXHR9XG5cblx0dGhpcy5zZXRBZGRyZXNzID0gZnVuY3Rpb24oYWRkcmVzcyl7XG5cdFx0YWRkciA9IGFkZHJlc3M7XG5cdH1cblxuXHR0aGlzLmNyZWF0ZVNlc3Npb24gPSBmdW5jdGlvbihvbmNvbm5lY3RlZCwgb25mYWlsdXJlKXtcblx0XHR2YXIgbm9kZSA9IGNyZWF0ZU5vZGUoKTtcblxuXHRcdG5vZGUuY29ubmVjdChmdW5jdGlvbihlcnIpe1xuXHRcdFx0aWYoZXJyKXtcblx0XHRcdFx0b25mYWlsdXJlKGVycik7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0bm9kZS5nZXQoe1xuXHRcdFx0XHRcdHNlcnZpY2U6ICdhdXRoJyxcblx0XHRcdFx0XHRmdW5jOiAnQXV0aGVudGljYXRlJyxcblx0XHRcdFx0XHRkYXRhOiB7dXNlcjogdXNlciwgcGFzc3dvcmQ6IHBhc3N3b3JkfVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmdW5jdGlvbihyZXMpe1xuXHRcdFx0XHRcdGlmKHJlcy5hdXRoZW50aWNhdGVkIHx8IChyZXMuZXJyb3IgJiYgcmVzLmVycm9yID09PSAnU2VydmljZU5vdEZvdW5kJykpIG9uY29ubmVjdGVkKG5vZGUpO1xuXHRcdFx0XHRcdGVsc2Ugb25mYWlsdXJlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1x0XG5cdH1cblx0XG59XG5cblxudmFyIGRpeWEgPSB7XG5cdFx0RGl5YUNsaWVudDogRGl5YUNsaWVudCxcblx0XHREaXlhOiBEaXlhLFxuXHRcdHJ0YzogcnRjLFxuXHRcdFByb21ldGhlOiBQcm9tZXRoZSxcblx0XHRkaXNjb3ZlcjogZGlzY292ZXIsXG5cdFx0cWVpOiBxZWksXG5cdFx0dXBkYXRlOiB1cGRhdGUsXG5cdFx0cGljbzogcGljb1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpeWE7XG4iLCJ2YXIgZGdyYW07XG5cbnZhciBuZXR3b3JrSWRSZXF1ZXN0ID0gJ2RpeWEtbmV0d29yay1pZFxcbic7XG5cbnZhciBzb2NrZXQ7XG52YXIgY2FsbGJhY2tzID0gW107XG52YXIgZGl5YXMgPSBbXTtcblxuXG52YXIgc3RhdGUgPSAnc3RvcHBlZCc7XG5cbmZ1bmN0aW9uIGlzTm9kZSgpe1xuXHRpZihkZ3JhbSkgcmV0dXJuIHRydWU7XG5cdHRyeXtcblx0XHRkZ3JhbSA9IHJlcXVpcmUoJ2RncmFtJysnJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1jYXRjaChlKXtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdGVuKGNhbGxiYWNrKXtcblx0aWYoIWlzTm9kZSgpKSByZXR1cm4gO1xuXHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFxufVxuXG5mdW5jdGlvbiByZW1vdmVPdXRkYXRlZERpeWFzKCl7XG5cdGZvcih2YXIgaT0wO2k8ZGl5YXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZGl5YXNbaV0udG91Y2ggPiAxMDAwMCl7XG5cdFx0XHRkaXlhcy5zcGxpY2UoaSwgMSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERpeWEobmFtZSwgcG9ydCwgYWRkcmVzcyl7XG5cdGZvcih2YXIgaT0wOyBpPGRpeWFzLmxlbmd0aDsgaSsrKXtcblx0XHRpZihkaXlhc1tpXS5uYW1lID09PSBuYW1lICYmIGRpeWFzW2ldLmFkZHIgPT09IGFkZHJlc3MrJzonK3BvcnQpe1xuXHRcdFx0cmV0dXJuIGRpeWFzW2ldO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ290RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKXtcblxuXG5cdHZhciBkaXlhID0gZ2V0RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKTtcblx0aWYoIWRpeWEpe1xuXHRcdGRpeWEgPSB7bmFtZTogbmFtZSwgYWRkcjogYWRkcmVzcysnOicrcG9ydH07XG5cdFx0ZGl5YXMucHVzaChkaXlhKTtcblx0fVxuXHRkaXlhLnRvdWNoID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQW5zd2VyKG5hbWUsIHBvcnQsIGFkZHJlc3Mpe1xuXHRmb3IodmFyIGk9MDtpPGNhbGxiYWNrcy5sZW5ndGg7aSsrKXtcblx0XHRjYWxsYmFja3NbaV0obmFtZSwgcG9ydCwgYWRkcmVzcyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVxdWVzdCgpe1xuXHRzb2NrZXQuc2VuZChuZXR3b3JrSWRSZXF1ZXN0LCAwLCBuZXR3b3JrSWRSZXF1ZXN0Lmxlbmd0aCwgMjAwMCwgJzI1NS4yNTUuMjU1LjI1NScpO1xufVxuXG5mdW5jdGlvbiBzdGFydCgpe1xuXHRpZighaXNOb2RlKCkpIHJldHVybiA7XG5cblx0c3RhdGUgPSAnc3RhcnRlZCc7XG5cblx0aWYoIXNvY2tldCl7XG5cdFx0c29ja2V0ID0gZGdyYW0uY3JlYXRlU29ja2V0KCd1ZHA0Jyk7XG5cblx0XHRzb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihkYXRhLCByaW5mbyl7XG5cdFx0XHR2YXIgbXNnID0gZGF0YS50b1N0cmluZygnYXNjaWknKTtcblx0XHRcdHZhciBwYXJhbXMgPSBtc2cuc3BsaXQoJzonKTtcblx0XHRcdFxuXHRcdFx0aWYocGFyYW1zLmxlbmd0aCA9PSAyKXtcblx0XHRcdFx0Z290RGl5YShwYXJhbXNbMF0sIHBhcmFtc1sxXSwgcmluZm8uYWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2xpc3RlbmluZycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRzb2NrZXQuc2V0QnJvYWRjYXN0KHRydWUpO1x0XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb0Rpc2NvdmVyKCl7XG5cdFx0cmVxdWVzdCgpO1xuXHRcdHJlbW92ZU91dGRhdGVkRGl5YXMoKTtcblxuXHRcdGlmKHN0YXRlID09PSAnc3RhcnRlZCcpIHNldFRpbWVvdXQoZG9EaXNjb3ZlciwgMTAwMCk7XG5cdH1cblx0ZG9EaXNjb3ZlcigpO1xuXG5cbn1cblxuZnVuY3Rpb24gc3RvcCgpe1xuXG5cdHN0YXRlID0gJ3N0b3BwZWQnO1xuXG5cdGlmKHNvY2tldCkgc29ja2V0LmNsb3NlKCk7XG5cdHdoaWxlKGNhbGxiYWNrcy5sZW5ndGgpe1xuXHRcdGNhbGxiYWNrcy5wb3AoKTtcblx0fVxufVxuXG5cbmZ1bmN0aW9uIGF2YWlsYWJsZURpeWFzKCl7XG5cdHJldHVybiBkaXlhcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHN0YXJ0OiBzdGFydCxcblx0c3RvcDogc3RvcCxcblx0bGlzdGVuOiBsaXN0ZW4sXG5cdGlzRGlzY292ZXJhYmxlOiBpc05vZGUsXG5cdGF2YWlsYWJsZURpeWFzOiBhdmFpbGFibGVEaXlhc1xufSIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxuZnVuY3Rpb24gTWVzc2FnZShzZXJ2aWNlLCBmdW5jLCBvYmosIHBlcm1hbmVudCl7XG5cblx0dGhpcy5zZXJ2aWNlID0gc2VydmljZTtcblx0dGhpcy5mdW5jID0gZnVuYztcblx0dGhpcy5vYmogPSBvYmo7XG5cdFxuXHR0aGlzLnBlcm1hbmVudCA9IHBlcm1hbmVudDsgLy9JZiB0aGlzIGZsYWcgaXMgb24sIHRoZSBjb21tYW5kIHdpbGwgc3RheSBvbiB0aGUgY2FsbGJhY2sgbGlzdCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xufVxuXG5NZXNzYWdlLmJ1aWxkU2lnbmF0dXJlID0gZnVuY3Rpb24obXNnKXtcblx0cmV0dXJuIG1zZy5zZXJ2aWNlKycuJyttc2cuZnVuYysnLicrbXNnLm9iajtcbn1cblxuXG5NZXNzYWdlLnByb3RvdHlwZS5zaWduYXR1cmUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5zZXJ2aWNlKycuJyt0aGlzLmZ1bmMrJy4nK3RoaXMub2JqO1xufVxuXG5NZXNzYWdlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oZGF0YSl7XG5cdHJldHVybiB7XG5cdFx0c2VydmljZTogdGhpcy5zZXJ2aWNlLFxuXHRcdGZ1bmM6IHRoaXMuZnVuYyxcblx0XHRvYmo6IHRoaXMub2JqLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2U7XG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cbmZ1bmN0aW9uIHBpY28obm9kZSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5ub2RlID0gbm9kZTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8vXG5cbnBpY28ucHJvdG90eXBlLnBvd2VyID0gZnVuY3Rpb24oKXtcblxuXHR0aGlzLm5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiAncGljbycsXG5cdFx0ZnVuYzogJ1Bvd2VyJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0XHQvKmlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTsqL1xuXG5cdH0pO1xufVxuXG5waWNvLnByb3RvdHlwZS56b29tID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnWm9vbSdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdFx0LyppZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7Ki9cblxuXHR9KTtcbn1cblxuXG5waWNvLnByb3RvdHlwZS5iYWNrID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnQmFjaydcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdFx0LyppZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdFx0Ki9cblx0fSk7XG59XG5cblxucGljby5wcm90b3R5cGUudXAgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdVcCdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdCovXG5cdH0pO1xufVxuXG5cbnBpY28ucHJvdG90eXBlLmxlZnQgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdMZWZ0J1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0Ki9cblx0fSk7XG59XG5cblxucGljby5wcm90b3R5cGUub2sgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdPaydcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdFx0Ki9cblx0fSk7XG59XG5cblxucGljby5wcm90b3R5cGUucmlnaHQgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdSaWdodCdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdFx0Ki9cblx0fSk7XG59XG5cblxucGljby5wcm90b3R5cGUuZG93biA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblxuXHR0aGlzLm5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiAncGljbycsXG5cdFx0ZnVuYzogJ0Rvd24nXG5cdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHQvKlx0aWYoZGF0YS5waWNvKVxuXHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBpY28pO1xuXHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHRcdCovXG5cdH0pO1xufVxuXG5waWNvLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnUHJldidcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdFx0Ki9cblx0fSk7XG59XG5cbnBpY28ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdQbGF5J1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cbnBpY28ucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdOZXh0J1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcbi8qXHRcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0Ki9cblx0fSk7XG59XG5cbnBpY28ucHJvdG90eXBlLmx1bWlEb3duID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnTHVtaURvd24nXG5cdH0sIGZ1bmN0aW9uKGRhdGEpe1xuLypcdFx0aWYoZGF0YS5waWNvKVxuXHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBpY28pO1xuXHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHQqL1xuXHR9KTtcbn1cblxucGljby5wcm90b3R5cGUubHVtaVVwID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnTHVtaVVwJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cblxucGljby5wcm90b3R5cGUudm9sdW1lRG93biA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblxuXHR0aGlzLm5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiAncGljbycsXG5cdFx0ZnVuYzogJ1ZvbHVtZURvd24nXG5cdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdC8qaWYoZGF0YS5waWNvKVxuXHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBpY28pO1xuXHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHQqL1xuXHR9KTtcbn1cblxuXG5waWNvLnByb3RvdHlwZS5tdXRlID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnTXV0ZSdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdFx0Ki9cblx0fSk7XG59XG5cbnBpY28ucHJvdG90eXBlLnZvbHVtZVVwID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMubm9kZS5nZXQoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnVm9sdW1lVXAnXG5cdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHQvKlx0aWYoZGF0YS5waWNvKVxuXHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBpY28pO1xuXHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHRcdCovXG5cdH0pO1xufVxuXG5cblxuXG52YXIgZXhwID0ge1xuXHRcdHBpY286IHBpY29cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHA7XG4iLCJ2YXIgUlRDID0gcmVxdWlyZSgnLi4vcnRjL3J0YycpO1xuXG5mdW5jdGlvbiBQcm9tZXRoZShzZXNzaW9uKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMucnRjID0gbmV3IFJUQy5SVEMoc2Vzc2lvbik7XG5cblx0dGhpcy5ydGMub25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYodHlwZW9mIHRoYXQub25jbG9zZSA9PT0gJ2Z1bmN0aW9uJykgdGhhdC5vbmNsb3NlKCk7XG5cdH1cbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKHJlZ2V4LCBjYWxsYmFjayl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5ydGMudXNlKHJlZ2V4LCBmdW5jdGlvbihjaGFubmVsKXtcblx0XHR0aGF0Ll9uZWdvY2lhdGVOZXVyb24oY2hhbm5lbCwgY2FsbGJhY2spO1xuXHR9KTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5jb25uZWN0KCk7XG59XG5cblByb21ldGhlLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5ydGMuZGlzY29ubmVjdCgpO1xufVxuXG5cblByb21ldGhlLnByb3RvdHlwZS5fbmVnb2NpYXRlTmV1cm9uID0gZnVuY3Rpb24oY2hhbm5lbCwgY2FsbGJhY2spe1xuXHRjaGFubmVsLnNldE9uTWVzc2FnZShmdW5jdGlvbihtZXNzYWdlKXtcblxuXHRcdHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KG1lc3NhZ2UuZGF0YSk7XG5cblx0XHR2YXIgdHlwZUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXcuZ2V0VWludDgoMCkpO1xuXHRcdGlmKHR5cGVDaGFyID09PSAnTycpe1xuXHRcdFx0Ly9JbnB1dFxuXHRcdFx0Y2hhbm5lbC50eXBlID0gJ2lucHV0JzsgLy9Qcm9tZXRoZSBPdXRwdXQgPSBDbGllbnQgSW5wdXRcblx0XHR9ZWxzZSBpZih0eXBlQ2hhciA9PT0gJ0knKXtcblx0XHRcdC8vT3V0cHV0XG5cdFx0XHRjaGFubmVsLnR5cGUgPSAnb3V0cHV0JzsgLy9Qcm9tZXRoZSBJbnB1dCA9IENsaWVudCBPdXRwdXRcblx0XHR9ZWxzZXtcblx0XHRcdC8vRXJyb3Jcblx0XHR9XG5cblx0XHR2YXIgc2l6ZSA9IHZpZXcuZ2V0SW50MzIoMSx0cnVlKTtcblx0XHRpZihzaXplICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRjaGFubmVsLnNpemUgPSBzaXplO1xuXHRcdFx0Y2hhbm5lbC5fYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblx0XHR9ZWxzZXtcblx0XHRcdC8vZXJyb3Jcblx0XHR9XG5cblxuXG5cdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2UodW5kZWZpbmVkKTtcblxuXHRcdGNoYW5uZWwuc2V0T25WYWx1ZSA9IGZ1bmN0aW9uKG9udmFsdWVfY2Ipe1xuXHRcdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2Uob252YWx1ZV9jYik7XG5cdFx0fTtcblxuXHRcdGNoYW5uZWwud3JpdGUgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0aWYoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhbm5lbC5zaXplIHx8IGlzTmFOKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2hhbm5lbC5fYnVmZmVyW2luZGV4XSA9IHZhbHVlO1xuXHRcdFx0Y2hhbm5lbC5fcmVxdWVzdFNlbmQoKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cblx0XHRjaGFubmVsLndyaXRlQWxsID0gZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdGlmKCFBcnJheS5pc0FycmF5KHZhbHVlcykgfHwgdmFsdWVzLmxlbmd0aCAhPT0gY2hhbm5lbC5zaXplKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpPHZhbHVlcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRcdGlmKGlzTmFOKHZhbHVlc1tpXSkpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0Y2hhbm5lbC5fYnVmZmVyW2ldID0gdmFsdWVzW2ldO1xuXHRcdFx0fVxuXHRcdFx0Y2hhbm5lbC5fcmVxdWVzdFNlbmQoKTtcblx0XHR9O1xuXG5cdFx0Y2hhbm5lbC5fbGFzdFNlbmRUaW1lc3RhbXAgPSAwO1xuXHRcdGNoYW5uZWwuX3NlbmRSZXF1ZXN0ZWQgPSBmYWxzZTtcblxuXHRcdGNoYW5uZWwuZnJlcXVlbmN5ID0gMzA7XG5cblx0XHRjaGFubmVsLl9yZXF1ZXN0U2VuZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGNoYW5uZWwuX2xhc3RTZW5kVGltZXN0YW1wO1xuXHRcdFx0dmFyIHBlcmlvZCA9IDEwMDAgLyBjaGFubmVsLmZyZXF1ZW5jeTtcblx0XHRcdGlmKGVsYXBzZWRUaW1lID49IHBlcmlvZCl7XG5cdFx0XHRcdGNoYW5uZWwuX2RvU2VuZCgpO1xuXHRcdFx0fWVsc2UgaWYoIWNoYW5uZWwuX3NlbmRSZXF1ZXN0ZWQpe1xuXHRcdFx0XHRjaGFubmVsLl9zZW5kUmVxdWVzdGVkID0gdHJ1ZTtcblx0XHRcdFx0c2V0VGltZW91dChjaGFubmVsLl9kb1NlbmQsIHBlcmlvZCAtIGVsYXBzZWRUaW1lKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y2hhbm5lbC5fZG9TZW5kID0gZnVuY3Rpb24oKXtcblx0XHRcdGNoYW5uZWwuX3NlbmRSZXF1ZXN0ZWQgPSBmYWxzZTtcblx0XHRcdGNoYW5uZWwuX2xhc3RTZW5kVGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0XHRjaGFubmVsLnNlbmQoY2hhbm5lbC5fYnVmZmVyKTtcblx0XHR9O1xuXG5cdFx0Y2FsbGJhY2soY2hhbm5lbCk7XG5cblx0fSk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9tZXRoZTtcbiIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG4vKipcbiAqICBjYWxsYmFjayA6IGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBtb2RlbCB1cGRhdGVkXG4gKiAqL1xuZnVuY3Rpb24gUUVJKG5vZGUsIGNhbGxiYWNrLCBzYW1wbGluZyl7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgXG4gICAgdGhpcy5zYW1wbGluZyA9IHNhbXBsaW5nIHx8IDEwOyAvKiBtYXggbnVtIG9mIHB0cyBzdG9yZWQgKi9cbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24ocmVzKXt9OyAvKiBjYWxsYmFjaywgdXN1YWxseSBhZnRlciBnZXRNb2RlbCAqL1xuICAgIFxuICAgIG5vZGUuZ2V0KHtcblx0c2VydmljZTogXCJxZWlcIixcblx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRkYXRhOiB7XG5cdCAgICB0eXBlOlwibXNnSW5pdFwiLFxuXHQgICAgc2FtcGxpbmc6IDEsXG5cdCAgICByZXF1ZXN0ZWREYXRhOiBcImFsbFwiXG5cdCAgICAvKiBubyB0aW1lIHJhbmdlIHNwZWNpZmllZCAqL1xuXHR9XG4gICAgfSwgZnVuY3Rpb24oZGF0YSl7XG5cdHRoYXQuZGF0YU1vZGVsPSB7fTtcblx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRoYXQuZGF0YU1vZGVsKSk7XG5cdFxuXHQvLy8gdGhhdC51cGRhdGVDaGFydCh0aGlzLmRhdGFNb2RlbCk7XG5cdHRoYXQuX3VwZGF0ZUxldmVscyh0aGF0LmRhdGFNb2RlbCk7XG5cdHRoYXQuY2FsbGJhY2sodGhhdC5kYXRhTW9kZWwpO1xuXG5cdHRoYXQudGltZWRSZXF1ZXN0ID0gZnVuY3Rpb24oKSB7XG5cdCAgICBub2RlLmdldCh7XG5cdFx0c2VydmljZTogXCJxZWlcIixcblx0XHRmdW5jOiBcIkRhdGFSZXF1ZXN0XCIsXG5cdFx0ZGF0YToge1xuXHRcdCAgICB0eXBlOlwibXNnSW5pdFwiLFxuXHRcdCAgICBzYW1wbGluZzogMSxcblx0XHQgICAgcmVxdWVzdGVkRGF0YTogXCJhbGxcIlxuXHRcdCAgICAvKiBubyB0aW1lIHJhbmdlIHNwZWNpZmllZCAqL1xuXHRcdH1cblx0ICAgIH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHRoYXQuZGF0YU1vZGVsPSB7fTtcblx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0aGF0LmRhdGFNb2RlbCkpO1xuXHRcdHRoYXQuX2dldERhdGFNb2RlbEZyb21SZWN2KGRhdGEpO1xuXHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRoYXQuZGF0YU1vZGVsKSk7XG5cdFx0XG5cdFx0Ly8vIHRoYXQudXBkYXRlQ2hhcnQodGhpcy5kYXRhTW9kZWwpO1xuXHRcdHRoYXQuX3VwZGF0ZUxldmVscyh0aGF0LmRhdGFNb2RlbCk7XG5cdFx0dGhhdC5jYWxsYmFjayh0aGF0LmRhdGFNb2RlbCk7XG5cdCAgICB9KTtcblx0ICAgIHNldFRpbWVvdXQodGhhdC50aW1lZFJlcXVlc3QsMzAwMCk7XG5cdH07XG5cdHNldFRpbWVvdXQodGhhdC50aW1lZFJlcXVlc3QoKSk7XG5cblx0bm9kZS5saXN0ZW4oe1xuXHQgICAgc2VydmljZTogXCJxZWlcIixcblx0ICAgIGZ1bmM6IFwiU3Vic2NyaWJlUWVpXCJcblx0fSwgZnVuY3Rpb24ocmVzKSB7XG5cdCAgICB0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihyZXMuZGF0YSk7XG5cdCAgICB0aGF0Ll91cGRhdGVMZXZlbHModGhhdC5kYXRhTW9kZWwpO1xuXHQgICAgdGhhdC5jYWxsYmFjayh0aGF0LmRhdGFNb2RlbCk7XG5cdH0pO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coXCJEaXlhU0RLIC0gUUVJOiBjcmVhdGVkXCIpO1xuICAgIHJldHVybiB0aGlzO1xufVxuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDogXG4gKiB7XG4gKiBcdHRpbWU6IFtGTE9BVCwgLi4uXSxcbiAqIFx0XCJzZW5zZXVyWFhcIjoge1xuICogXHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sXG4gKiBcdFx0XHRxdWFsaXR5SW5kZXg6W0ZMT0FULCAuLi5dLFxuICogXHRcdFx0cmFuZ2U6IFtGTE9BVCwgRkxPQVRdLFxuICogXHRcdFx0dW5pdDogc3RyaW5nLFxuICogICAgICBsYWJlbDogc3RyaW5nXG4gKiBcdFx0fSxcbiAqICAgLi4uIChcInNlbnNldXJzWVlcIilcbiAqIH1cbiAqL1xuUUVJLnByb3RvdHlwZS5nZXREYXRhTW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59XG5RRUkucHJvdG90eXBlLmdldERhdGFSYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmRhdGFNb2RlbC5yYW5nZTtcbn1cblFFSS5wcm90b3R5cGUudXBkYXRlUXVhbGl0eUluZGV4ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0dmFyIGRtID0gdGhpcy5kYXRhTW9kZWw7XG5cdFxuXHRmb3IodmFyIGQgaW4gZG0pIHtcblx0XHRpZihkPT0ndGltZScgfHwgIWRtW2RdLmRhdGEpIGNvbnRpbnVlO1xuXHRcblx0XHRpZighZG1bZF0ucXVhbGl0eUluZGV4IHx8IGRtW2RdLmRhdGEubGVuZ3RoICE9IGRtW2RdLnF1YWxpdHlJbmRleC5sZW5ndGgpXG5cdFx0XHRkbVtkXS5xdWFsaXR5SW5kZXggPSBuZXcgQXJyYXkoZG1bZF0uZGF0YS5sZW5ndGgpO1xuXHRcdFxuXHRcdGRtW2RdLmRhdGEuZm9yRWFjaChmdW5jdGlvbih2LGkpIHtcblx0XHRcdFx0ZG1bZF0ucXVhbGl0eUluZGV4W2ldID0gY2hlY2tRdWFsaXR5KHYsZG1bZF0ucXVhbGl0eUNvbmZpZyk7XG5cdFx0XHR9KTtcblx0fVxufVxuXG5RRUkucHJvdG90eXBlLmdldERhdGFjb25mb3J0UmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwuY29uZm9ydFJhbmdlO1xufVxuUUVJLnByb3RvdHlwZS5nZXRTYW1wbGluZyA9IGZ1bmN0aW9uKG51bVNhbXBsZXMpe1xuXHRyZXR1cm4gdGhpcy5zYW1wbGluZztcbn1cblFFSS5wcm90b3R5cGUuc2V0U2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0dGhpcy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG59XG5cblxuXG5RRUkucHJvdG90eXBlLl91cGRhdGVDb25maW5lbWVudExldmVsID0gZnVuY3Rpb24obW9kZWwpe1xuXHR2YXIgY28yID0gbW9kZWxbJ0NPMiddLmRhdGFbbW9kZWxbJ0NPMiddLmRhdGEubGVuZ3RoIC0gMV07XG5cdHZhciB2b2N0ID0gbW9kZWxbJ1ZPQ3QnXS5kYXRhW21vZGVsWydWT0N0J10uZGF0YS5sZW5ndGggLSAxXTtcblx0dmFyIGNvbmZpbmVtZW50ID0gTWF0aC5tYXgoY28yLCB2b2N0KTtcblxuXHRpZihjb25maW5lbWVudCA8IDgwMCl7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblx0aWYoY29uZmluZW1lbnQgPCAxNjAwKXtcblx0XHRyZXR1cm4gMjtcblx0fVxuXHRpZihjb25maW5lbWVudCA8IDI0MDApe1xuXHRcdHJldHVybiAxO1xuXHR9XG5cdGlmKGNvbmZpbmVtZW50IDwgMzAwMCl7XG5cdFx0cmV0dXJuIDA7XG5cdH1cbn1cblxuUUVJLnByb3RvdHlwZS5fdXBkYXRlQWlyUXVhbGl0eUxldmVsID0gZnVuY3Rpb24oY29uZmluZW1lbnQsIG1vZGVsKXtcblx0dmFyIGZpbmVEdXN0UXVhbGl0eUluZGV4ID0gbW9kZWxbJ0ZpbmUgRHVzdCddLnF1YWxpdHlJbmRleFttb2RlbFsnRmluZSBEdXN0J10ucXVhbGl0eUluZGV4Lmxlbmd0aC0xXTtcblx0dmFyIG96b25lUXVhbGl0eUluZGV4ID0gbW9kZWxbJ096b25lJ10ucXVhbGl0eUluZGV4W21vZGVsWydPem9uZSddLnF1YWxpdHlJbmRleC5sZW5ndGgtMV07XG5cblx0dmFyIHF1YWxpdHlJbmRleCA9IGZpbmVEdXN0UXVhbGl0eUluZGV4ICsgb3pvbmVRdWFsaXR5SW5kZXg7XG5cdGlmKHF1YWxpdHlJbmRleCA8IDIpIHJldHVybiBjb25maW5lbWVudCAtIDE7XG5cdGVsc2UgcmV0dXJuIGNvbmZpbmVtZW50O1xufVxuXG5RRUkucHJvdG90eXBlLl91cGRhdGVFbnZRdWFsaXR5TGV2ZWwgPSBmdW5jdGlvbihhaXJRdWFsaXR5LCBtb2RlbCl7XG5cdHZhciBodW1pZGl0eVF1YWxpdHlJbmRleCA9IG1vZGVsWydIdW1pZGl0eSddLnF1YWxpdHlJbmRleFttb2RlbFsnSHVtaWRpdHknXS5xdWFsaXR5SW5kZXgubGVuZ3RoLTFdO1xuXHR2YXIgdGVtcGVyYXR1cmVRdWFsaXR5SW5kZXggPSBtb2RlbFsnVGVtcGVyYXR1cmUnXS5xdWFsaXR5SW5kZXhbbW9kZWxbJ1RlbXBlcmF0dXJlJ10ucXVhbGl0eUluZGV4Lmxlbmd0aC0xXTtcblxuXHR2YXIgcXVhbGl0eUluZGV4ID0gaHVtaWRpdHlRdWFsaXR5SW5kZXggKyB0ZW1wZXJhdHVyZVF1YWxpdHlJbmRleDtcblx0aWYocXVhbGl0eUluZGV4IDwgMikgcmV0dXJuIGFpclF1YWxpdHkgLSAxO1xuXHRlbHNlIHJldHVybiBhaXJRdWFsaXR5O1x0XG59XG5cblFFSS5wcm90b3R5cGUuX3VwZGF0ZUxldmVscyA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0dGhpcy5jb25maW5lbWVudCA9IHRoaXMuX3VwZGF0ZUNvbmZpbmVtZW50TGV2ZWwobW9kZWwpO1xuXHR0aGlzLmFpclF1YWxpdHkgPSB0aGlzLl91cGRhdGVBaXJRdWFsaXR5TGV2ZWwodGhpcy5jb25maW5lbWVudCwgbW9kZWwpO1xuXHR0aGlzLmVudlF1YWxpdHkgPSB0aGlzLl91cGRhdGVFbnZRdWFsaXR5TGV2ZWwodGhpcy5haXJRdWFsaXR5LCBtb2RlbCk7XG59XG5cblFFSS5wcm90b3R5cGUuZ2V0Q29uZmluZW1lbnRMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmNvbmZpbmVtZW50O1xufVxuXG5RRUkucHJvdG90eXBlLmdldEFpclF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmFpclF1YWxpdHk7XG59XG5cblFFSS5wcm90b3R5cGUuZ2V0RW52UXVhbGl0eUxldmVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZW52UXVhbGl0eTtcbn1cblxuXG52YXIgY2hlY2tRdWFsaXR5ID0gZnVuY3Rpb24oZGF0YSwgcXVhbGl0eUNvbmZpZyl7XG5cdHZhciBxdWFsaXR5O1xuXHRpZihkYXRhICYmIHF1YWxpdHlDb25maWcpIHtcblx0XHRpZihkYXRhPnF1YWxpdHlDb25maWcuY29uZm9ydFJhbmdlWzFdIHx8IGRhdGE8cXVhbGl0eUNvbmZpZy5jb25mb3J0UmFuZ2VbMF0pXG5cdFx0XHRxdWFsaXR5PTA7XG5cdFx0ZWxzZVxuXHRcdFx0cXVhbGl0eT0xLjBcblx0XHRyZXR1cm4gcXVhbGl0eTtcblx0fVxuXHRyZXR1cm4gMS4wO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBpbnRlcm5hbCBtb2RlbCB3aXRoIHJlY2VpdmVkIGRhdGFcbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBkYXRhIHJlY2VpdmVkIGZyb20gRGl5YU5vZGUgYnkgd2Vic29ja2V0XG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICBbZGVzY3JpcHRpb25dXG4gKi9cblFFSS5wcm90b3R5cGUuX2dldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9dGhpcy5kYXRhTW9kZWw7XG5cdC8qXFxcblx0fCp8XG5cdHwqfCAgdXRpbGl0YWlyZXMgZGUgbWFuaXB1bGF0aW9ucyBkZSBjaGHDrm5lcyBiYXNlIDY0IC8gYmluYWlyZXMgLyBVVEYtOFxuXHR8Knxcblx0fCp8ICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL0TDqWNvZGVyX2VuY29kZXJfZW5fYmFzZTY0XG5cdHwqfFxuXHRcXCovXG5cdC8qKiBEZWNvZGVyIHVuIHRhYmxlYXUgZCdvY3RldHMgZGVwdWlzIHVuZSBjaGHDrm5lIGVuIGJhc2U2NCAqL1xuXHRiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRcdHJldHVybiBuQ2hyID4gNjQgJiYgbkNociA8IDkxID9cblx0XHRcdFx0bkNociAtIDY1XG5cdFx0XHQ6IG5DaHIgPiA5NiAmJiBuQ2hyIDwgMTIzID9cblx0XHRcdFx0bkNociAtIDcxXG5cdFx0XHQ6IG5DaHIgPiA0NyAmJiBuQ2hyIDwgNTggP1xuXHRcdFx0XHRuQ2hyICsgNFxuXHRcdFx0OiBuQ2hyID09PSA0MyA/XG5cdFx0XHRcdDYyXG5cdFx0XHQ6IG5DaHIgPT09IDQ3ID9cblx0XHRcdFx0NjNcblx0XHRcdDpcdDA7XG5cdH07XG5cdC8qKlxuXHQgKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG5cdCAqIEBwYXJhbSAge1N0cmluZ30gc0Jhc2U2NCAgICAgYmFzZTY0IGNvZGVkIHN0cmluZ1xuXHQgKiBAcGFyYW0gIHtpbnR9IG5CbG9ja3NTaXplIHNpemUgb2YgYmxvY2tzIG9mIGJ5dGVzIHRvIGJlIHJlYWQuIE91dHB1dCBieXRlQXJyYXkgbGVuZ3RoIHdpbGwgYmUgYSBtdWx0aXBsZSBvZiB0aGlzIHZhbHVlLlxuXHQgKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICB0YWIgb2YgZGVjb2RlZCBieXRlc1xuXHQgKi9cblx0YmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHRcdHZhclxuXHRcdHNCNjRFbmMgPSBzQmFzZTY0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCBcIlwiKSwgbkluTGVuID0gc0I2NEVuYy5sZW5ndGgsXG5cdFx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0XHRidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobk91dExlbiksIHRhQnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG5cdFx0Zm9yICh2YXIgbk1vZDMsIG5Nb2Q0LCBuVWludDI0ID0gMCwgbk91dElkeCA9IDAsIG5JbklkeCA9IDA7IG5JbklkeCA8IG5JbkxlbjsgbkluSWR4KyspIHtcblx0XHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdFx0blVpbnQyNCB8PSBiNjRUb1VpbnQ2KHNCNjRFbmMuY2hhckNvZGVBdChuSW5JZHgpKSA8PCAxOCAtIDYgKiBuTW9kNDtcblx0XHRcdGlmIChuTW9kNCA9PT0gMyB8fCBuSW5MZW4gLSBuSW5JZHggPT09IDEpIHtcblx0XHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdFx0dGFCeXRlc1tuT3V0SWR4XSA9IG5VaW50MjQgPj4+ICgxNiA+Pj4gbk1vZDMgJiAyNCkgJiAyNTU7XG5cdFx0XHRcdH1cblx0XHRcdFx0blVpbnQyNCA9IDA7XG5cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gY29uc29sZS5sb2coXCJ1OGludCA6IFwiK0pTT04uc3RyaW5naWZ5KHRhQnl0ZXMpKTtcblx0XHRyZXR1cm4gYnVmZmVyO1xuXHR9O1xuXHRcblx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlcikge1xuXHRcdC8vfiBjb25zb2xlLmxvZygncmN2ZGF0YSAnK0pTT04uc3RyaW5naWZ5KGRhdGEpKTtcblx0XHQvLyBpZighZGF0YS5oZWFkZXIuc2FtcGxpbmcpIGRhdGEuaGVhZGVyLnNhbXBsaW5nPTE7XG5cdFx0XG5cdFx0LyoqIGNhc2UgMSA6IDEgdmFsdWUgcmVjZWl2ZWQgYWRkZWQgdG8gZGF0YU1vZGVsICovXG5cdFx0aWYoZGF0YS5oZWFkZXIuc2FtcGxpbmc9PTEpIHtcblx0XHRcdGlmKGRhdGEuaGVhZGVyLnRpbWVFbmQpIHtcblx0XHRcdFx0aWYoIWRhdGFNb2RlbC50aW1lKSBkYXRhTW9kZWwudGltZT1bXTtcblx0XHRcdFx0ZGF0YU1vZGVsLnRpbWUucHVzaChkYXRhLmhlYWRlci50aW1lRW5kKTtcblx0XHRcdFx0aWYoZGF0YU1vZGVsLnRpbWUubGVuZ3RoID4gdGhpcy5zYW1wbGluZykge1xuXHRcdFx0XHRcdGRhdGFNb2RlbC50aW1lID0gZGF0YU1vZGVsLnRpbWUuc2xpY2UoZGF0YU1vZGVsLnRpbWUubGVuZ3RoIC0gdGhpcy5zYW1wbGluZyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAodmFyIG4gaW4gZGF0YSkge1xuXHRcdFx0XHRpZihuICE9IFwiaGVhZGVyXCIgJiYgbiAhPSBcInRpbWVcIikge1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKG4pO1xuXHRcdFx0XHRcdGlmKCFkYXRhTW9kZWxbbl0pIHtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXT17fTtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhPVtdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHJhbmdlICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnJhbmdlPWRhdGFbbl0ucmFuZ2U7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgbGFiZWwgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSB1bml0ICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnVuaXQ9ZGF0YVtuXS51bml0O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGNvbmZvcnRSYW5nZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5Q29uZmlnPXtjb25mb3J0UmFuZ2U6IGRhdGFbbl0uY29uZm9ydFJhbmdlfTtcblxuXHRcdFx0XHRcdGlmKGRhdGFbbl0uZGF0YS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHQvKiBkZWNvZGUgZGF0YSB0byBGbG9hdDMyQXJyYXkqL1xuXHRcdFx0XHRcdFx0dmFyIGJ1ZiA9IGJhc2U2NERlY1RvQXJyKGRhdGFbbl0uZGF0YSwgNCk7XG5cdFx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShidWYpKTtcblx0XHRcdFx0XHRcdHZhciBmQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGJ1Zik7XG5cblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSBmQXJyYXkubGVuZ3RoKSBjb25zb2xlLmxvZyhcIk1pc21hdGNoIG9mIHNpemUgXCIrZGF0YVtuXS5zaXplK1wiIHZzIFwiK2ZBcnJheS5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IDEpIGNvbnNvbGUubG9nKFwiRXhwZWN0ZWQgMSB2YWx1ZSByZWNlaXZlZCA6XCIrZGF0YVtuXS5zaXplKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYoIWRhdGFNb2RlbFtuXS5kYXRhKSBkYXRhTW9kZWxbbl0uZGF0YT1bXTtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhLnB1c2goZkFycmF5WzBdKTtcblx0XHRcdFx0XHRcdGlmKGRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCA+IHRoaXMuc2FtcGxpbmcpIHtcblx0XHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBkYXRhTW9kZWxbbl0uZGF0YS5zbGljZShkYXRhTW9kZWxbbl0uZGF0YS5sZW5ndGggLSB0aGlzLnNhbXBsaW5nKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gMCkgY29uc29sZS5sb2coXCJTaXplIG1pc21hdGNoIHJlY2VpdmVkIGRhdGEgKG5vIGRhdGEgdmVyc3VzIHNpemU9XCIrZGF0YVtuXS5zaXplK1wiKVwiKTtcblx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMudXBkYXRlUXVhbGl0eUluZGV4KCk7XG5cdFx0XHRcdFx0Ly9+IGNvbnNvbGUubG9nKCdteWRhdGEgJytKU09OLnN0cmluZ2lmeShkYXRhTW9kZWxbbl0uZGF0YSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0LyoqIGNhc2UgMiA6IGhpc3RvcnkgZGF0YSAtIG1hbnkgdmFsdWVzIHJlY2VpdmVkICovXG5cdFx0XHQvKiogVE9ETyAgKi9cblx0XHRcdGZvciAodmFyIG4gaW4gZGF0YSkge1xuXHRcdFx0XHRpZihuID09ICd0aW1lJykge1xuXHRcdFx0XHRcdC8qIGNhc2UgMSA6IHRpbWUgZGF0YSB0cmFuc21pdHRlZCwgMSB2YWx1ZSAqL1xuXHRcdFx0XHRcdC8qKiBUT0RPICoqL1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYobiAhPSBcImhlYWRlclwiKSB7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cobik7XG5cdFx0XHRcdFx0aWYoIWRhdGFNb2RlbFtuXSkge1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGE9W107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgcmFuZ2UgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ucmFuZ2U9ZGF0YVtuXS5yYW5nZTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBsYWJlbCAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5sYWJlbD1kYXRhW25dLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHVuaXQgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgY29uZm9ydFJhbmdlICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnF1YWxpdHlDb25maWc9e2NvbmZvcnRSYW5nZTogZGF0YVtuXS5jb25mb3J0UmFuZ2V9O1xuXG5cdFx0XHRcdFx0aWYoZGF0YVtuXS5kYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdC8qIGRlY29kZSBkYXRhIHRvIEZsb2F0MzJBcnJheSovXG5cdFx0XHRcdFx0XHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YVtuXS5kYXRhLCA0KTsgXG5cdFx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShidWYpKTtcblx0XHRcdFx0XHRcdHZhciBmQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGJ1Zik7XG5cblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSBmQXJyYXkubGVuZ3RoKSBjb25zb2xlLmxvZyhcIk1pc21hdGNoIG9mIHNpemUgXCIrZGF0YVtuXS5zaXplK1wiIHZzIFwiK2ZBcnJheS5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0Ly8gLyogaW5jcmVhc2Ugc2l6ZSBvZiBkYXRhIGlmIG5lY2Vzc2FyeSAqL1xuXHRcdFx0XHRcdFx0aWYoZkFycmF5Lmxlbmd0aD5kYXRhTW9kZWxbbl0uZGF0YS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0Ly8gZGF0YU1vZGVsW25dLnNpemU9ZGF0YVtuXS5zaXplO1xuXHRcdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IG5ldyBBcnJheShkYXRhTW9kZWxbbl0uc2l6ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvKiB1cGRhdGUgbmIgb2Ygc2FtcGxlcyBzdG9yZWQgKi9cblx0XHRcdFx0XHRcdGZvcih2YXIgaSBpbiBmQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGFbcGFyc2VJbnQoaSldPWZBcnJheVtpXTsgLyoga2VlcCBmaXJzdCB2YWwgLSBuYW1lIG9mIGNvbHVtbiAqL1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSAwKSBjb25zb2xlLmxvZyhcIlNpemUgbWlzbWF0Y2ggcmVjZWl2ZWQgZGF0YSAobm8gZGF0YSB2ZXJzdXMgc2l6ZT1cIitkYXRhW25dLnNpemUrXCIpXCIpO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZGF0YU1vZGVsW25dLmRhdGEgPSBBcnJheS5mcm9tKGZBcnJheSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ215ZGF0YSAnK0pTT04uc3RyaW5naWZ5KGRhdGFNb2RlbFtuXS5kYXRhKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSB7XG5cdFx0Y29uc29sZS5sb2coXCJObyBEYXRhIHRvIHJlYWQgb3IgaGVhZGVyIGlzIG1pc3NpbmcgIVwiKTtcblx0fVxuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59XG5cblxudmFyIGV4cCA9IHtcblx0XHRRRUk6IFFFSVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDsgXG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuLyo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xudmFyIFJUQ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb247XG52YXIgUlRDSWNlQ2FuZGlkYXRlID0gd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cubW96UlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy53ZWJraXRSVENJY2VDYW5kaWRhdGU7XG52YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cubW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENTZXNzaW9uRGVzY3JpcHRpb247XG5cbmZ1bmN0aW9uIENoYW5uZWwobmFtZSwgb3Blbl9jYil7XG5cdHRoaXMubmFtZSA9IG5hbWU7XG5cblx0dGhpcy5jaGFubmVsID0gdW5kZWZpbmVkO1xuXHR0aGlzLm9ub3BlbiA9IG9wZW5fY2I7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNldENoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdHRoaXMuY2hhbm5lbCA9IGRhdGFjaGFubmVsO1xuXG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYodGhhdC5vbm9wZW4pIHRoYXQub25vcGVuKHRoYXQpO1xufVxuXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuc2V0T25NZXNzYWdlID0gZnVuY3Rpb24ob25tZXNzYWdlKXtcblx0dGhpcy5jaGFubmVsLm9ubWVzc2FnZSA9IG9ubWVzc2FnZTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKG1zZyl7XG5cdGlmKHRoaXMuY2xvc2VkKSByZXR1cm4gZmFsc2U7XG5cdGVsc2UgaWYodGhpcy5jaGFubmVsLnJlYWR5U3RhdGUgPT09ICdvcGVuJyl7XG5cdFx0dHJ5e1xuXHRcdFx0dGhpcy5jaGFubmVsLnNlbmQobXNnKTtcblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSBleGNlcHRpb24gb2NjdXJlZCB3aGlsZSBzZW5kaW5nIGRhdGEnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0ZWxzZXtcblx0XHRjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSB3YXJuaW5nIDogd2VicnRjIGRhdGFjaGFubmVsIHN0YXRlID0gJyt0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIFBlZXIocnRjLCBpZCwgY2hhbm5lbHMpe1xuXHR0aGlzLmlkID0gaWQ7XG5cdHRoaXMuY2hhbm5lbHMgPSBjaGFubmVscztcblx0dGhpcy5ydGMgPSBydGM7XG5cdHRoaXMucGVlciA9IG51bGw7XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59XG5cblxuUGVlci5wcm90b3R5cGUuX2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5zdWIgPSB0aGlzLnJ0Yy5ub2RlLmxpc3Rlbih7XG5cdFx0c2VydmljZTogJ3J0YycsXG5cdFx0ZnVuYzogJ0Nvbm5lY3QnLFxuXHRcdG9iajogdGhpcy5jaGFubmVscyxcblx0XHRkYXRhOiB7XG5cdFx0XHRwcm9tSUQ6IHRoaXMuaWRcblx0XHR9XG5cdH0sXG5cdGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHRoYXQuX2hhbmRsZU5lZ29jaWF0aW9uTWVzc2FnZShkYXRhKTtcblx0fSk7XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdGlmKCF0aGF0LmNvbm5lY3RlZCAmJiAhdGhhdC5jbG9zZWQpe1xuXHRcdFx0dGhhdC5ydGMucmVjb25uZWN0KCk7XG5cdFx0fWVsc2V7XG5cdFx0fVxuXHR9LCAxMDAwMCk7XG59XG5cblBlZXIucHJvdG90eXBlLl9oYW5kbGVOZWdvY2lhdGlvbk1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpe1xuXG5cdGlmKG1zZy5ldmVudFR5cGUgPT09ICdSZW1vdGVPZmZlcicpe1xuXHRcdHRoaXMuX2NyZWF0ZVBlZXIobXNnKTtcblx0fWVsc2UgaWYobXNnLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZUlDRUNhbmRpZGF0ZScpe1xuXHRcdHRoaXMuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZShtc2cpO1xuXHR9XG59O1xuXG52YXIgc2VydmVycyA9IHtcImljZVNlcnZlcnNcIjogW3tcInVybFwiOiBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIn1dfTtcblxuUGVlci5wcm90b3R5cGUuX2NyZWF0ZVBlZXIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBwZWVyID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHNlcnZlcnMsIHttYW5kYXRvcnk6IFt7RHRsc1NydHBLZXlBZ3JlZW1lbnQ6IHRydWV9LCB7RW5hYmxlRHRsc1NydHA6IHRydWV9XX0pO1xuXHR0aGlzLnBlZXIgPSBwZWVyO1xuXG5cdHBlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7c2RwOiBkYXRhLnNkcCwgdHlwZTogZGF0YS50eXBlfSkpO1xuXG5cdHBlZXIuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRcdHBlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKTtcblxuXHRcdHRoYXQucnRjLm5vZGUuZ2V0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0Fuc3dlcicsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0c2RwOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcCxcblx0XHRcdFx0dHlwZTogc2Vzc2lvbl9kZXNjcmlwdGlvbi50eXBlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZ1bmN0aW9uKGVycil7XG5cdFx0Y29uc29sZS5sb2coXCJjYW5ub3QgY3JlYXRlIGFuc3dlclwiKTtcblx0fSwgXG5cdHsgJ21hbmRhdG9yeSc6IHsgJ09mZmVyVG9SZWNlaXZlQXVkaW8nOiB0cnVlLCAnT2ZmZXJUb1JlY2VpdmVWaWRlbyc6IHRydWUgfSB9KTtcblxuXG5cdHBlZXIub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGNvbnNvbGUubG9nKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlKTtcblx0XHRpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Nvbm5lY3RlZCcpe1xuXHRcdFx0dGhhdC5jb25uZWN0ZWQgPSB0cnVlOyAgXG5cdFx0XHR0aGF0LnJ0Yy5ub2RlLnN0b3BMaXN0ZW5pbmcodGhpcy5zdWIpO1xuXHRcdH1lbHNlIGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZGlzY29ubmVjdGVkJyl7XG5cdFx0XHRpZighdGhhdC5jbG9zZWQpIHRoYXQucnRjLnJlY29ubmVjdCgpO1xuXHRcdH1cblx0fVxuXG5cdHBlZXIub25pY2VjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQucnRjLm5vZGUuZ2V0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0lDRUNhbmRpZGF0ZScsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiB0aGF0LmlkLFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25EYXRhQ2hhbm5lbChldnQuY2hhbm5lbCk7XG5cdH07XG59XG5cblBlZXIucHJvdG90eXBlLl9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0cnl7XG5cdFx0dmFyIGNhbmRpZGF0ZSA9IG5ldyBSVENJY2VDYW5kaWRhdGUoZGF0YS5jYW5kaWRhdGUpO1xuXHRcdHRoaXMucGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNhbmRpZGF0ZSBhZGRlZCAoXCIrdGhhdC5wZWVyLmljZUNvbm5lY3Rpb25TdGF0ZStcIilcIik7XG5cdFx0fSxmdW5jdGlvbihlKXtcblx0XHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdH0pO1xuXHR9Y2F0Y2goZSkge2NvbnNvbGUubG9nKGUpO31cbn1cblxuUGVlci5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5ub2RlLnN0b3BMaXN0ZW5pbmcodGhpcy5zdWIpO1xuXHRpZih0aGlzLnBlZXIpIHRyeXtcblx0XHR0aGlzLnBlZXIuY2xvc2UoKTtcblx0fWNhdGNoKGUpe31cblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSB0cnVlO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gUlRDKG5vZGUpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdFxuXHR0aGlzLm5vZGUgPSBub2RlO1xuXHR0aGlzLnVzZWRDaGFubmVscyA9IFtdO1xuXG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMgPSBbXTtcblxuXHR0aGlzLnBlZXJzID0gW107XG59XG5cblJUQy5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24obmFtZV9yZWdleCwgb25vcGVuX2NhbGxiYWNrKXtcblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscy5wdXNoKHtyZWdleDogbmFtZV9yZWdleCwgY2I6IG9ub3Blbl9jYWxsYmFja30pO1xufVxuXG5SVEMucHJvdG90eXBlLnJlY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0XHRcblx0dGhhdC5kaXNjb25uZWN0KCk7XG5cdHRoYXQuY29ubmVjdCgpO1xuXHRjb25zb2xlLmxvZyhcInJlY29ubmVjdGluZy4uLlwiKTtcbn1cblxuUlRDLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblxuXHRmb3IodmFyIHByb21JRCBpbiB0aGlzLnBlZXJzKXtcblx0XHR0aGlzLl9jbG9zZVBlZXIocHJvbUlEKTtcblx0fVxuXG5cdHRoaXMubm9kZS5zdG9wTGlzdGVuaW5nKHRoaXMuc3ViKTtcblxuXHRpZih0eXBlb2YgdGhpcy5vbmNsb3NlID09PSAnZnVuY3Rpb24nKSB0aGlzLm9uY2xvc2UoKTtcbn1cblxuUlRDLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgZm91bmRDaGFubmVscyA9IGZhbHNlO1xuXG5cdHRoaXMuc3ViID0gdGhpcy5ub2RlLmxpc3Rlbih7XG5cdFx0c2VydmljZTogJ3J0YycsXG5cdFx0ZnVuYzogJ0xpc3RlblBlZXJzJ1xuXHR9LFxuXHRmdW5jdGlvbihkYXRhKXtcblx0XHRcdFxuXHRcdGlmKGRhdGEuZXZlbnRUeXBlICYmIGRhdGEucHJvbUlEICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1BlZXJDb25uZWN0ZWQnKXtcblx0XHRcdFx0aWYoIXRoYXQucGVlcnNbZGF0YS5wcm9tSURdKXtcblx0XHRcdFx0XHR2YXIgY2hhbm5lbHMgPSB0aGF0Ll9tYXRjaENoYW5uZWxzKGRhdGEuY2hhbm5lbHMpO1xuXHRcdFx0XHRcdGlmKGNoYW5uZWxzLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRcdFx0dGhhdC5wZWVyc1tkYXRhLnByb21JRF0gPSBuZXcgUGVlcih0aGF0LCBkYXRhLnByb21JRCwgY2hhbm5lbHMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1BlZXJDbG9zZWQnKXtcblx0XHRcdFx0aWYodGhhdC5wZWVyc1tkYXRhLnByb21JRF0pe1xuXHRcdFx0XHRcdHRoYXQuX2Nsb3NlUGVlcihkYXRhLnByb21JRCk7XG5cdFx0XHRcdFx0aWYodHlwZW9mIHRoYXQub25jbG9zZSA9PT0gJ2Z1bmN0aW9uJykgdGhhdC5vbmNsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0fSk7XG59XG5cblxuUlRDLnByb3RvdHlwZS5fY2xvc2VQZWVyID0gZnVuY3Rpb24ocHJvbUlEKXtcblxuXHRpZih0aGlzLnBlZXJzW3Byb21JRF0pe1xuXHRcdHZhciBwID0gdGhpcy5wZWVyc1twcm9tSURdO1xuXHRcdHAuY2xvc2UoKTtcblxuXHRcdGZvcih2YXIgaT0wOyBpIDwgcC5jaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRkZWxldGUgdGhpcy51c2VkQ2hhbm5lbHNbcC5jaGFubmVsc1tpXV07XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXMucGVlcnNbcHJvbUlEXTtcblx0fVxufVxuXG5SVEMucHJvdG90eXBlLl9tYXRjaENoYW5uZWxzID0gZnVuY3Rpb24ocmVjZWl2ZWRDaGFubmVscyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvL0NvbnRhaW5zIGFsbCBjaGFubmVscyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIENvbm5lY3QgYXMgb2JqZWN0c1xuXHR2YXIgY2hhbm5lbHMgPSBbXTtcblxuXHRmb3IodmFyIGkgPSAwOyBpIDwgcmVjZWl2ZWRDaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIG5hbWUgPSByZWNlaXZlZENoYW5uZWxzW2ldO1xuXHRcdFxuXHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGF0LnJlcXVlc3RlZENoYW5uZWxzLmxlbmd0aDsgaisrKXtcblx0XHRcdHZhciByZXEgPSB0aGF0LnJlcXVlc3RlZENoYW5uZWxzW2pdO1xuXHRcdFx0XG5cdFx0XHRpZihuYW1lICYmIG5hbWUubWF0Y2gocmVxLnJlZ2V4KSAmJiAhdGhhdC51c2VkQ2hhbm5lbHNbbmFtZV0pe1xuXHRcdFx0XHR0aGF0LnVzZWRDaGFubmVsc1tuYW1lXSA9IG5ldyBDaGFubmVsKG5hbWUsIHJlcS5jYik7XG5cdFx0XHRcdGNoYW5uZWxzLnB1c2gobmFtZSk7IC8vcHJlcGFyZSB0aGUgY29ubmVjdCBvYmplY3QgbGlzdFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBjaGFubmVscztcbn07XG5cblJUQy5wcm90b3R5cGUuX29uRGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdGNvbnNvbGUubG9nKFwiQ2hhbm5lbCBcIitkYXRhY2hhbm5lbC5sYWJlbCtcIiBjcmVhdGVkICFcIik7XG5cblx0dmFyIGNoYW5uZWwgPSB0aGlzLnVzZWRDaGFubmVsc1tkYXRhY2hhbm5lbC5sYWJlbF07XG5cdGlmKCFjaGFubmVsKXtcblx0XHRkYXRhY2hhbm5lbC5jbG9zZSgpO1xuXHRcdHJldHVybiA7XG5cdH1cblxuXHRjaGFubmVsLnNldENoYW5uZWwoZGF0YWNoYW5uZWwpO1xufVxuXG5cbnZhciBleHAgPSB7XG5cdFx0UlRDOiBSVENcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHA7IFxuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuZnVuY3Rpb24gVXBkYXRlKG5vZGUpe1x0XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5ub2RlID0gbm9kZTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblVwZGF0ZS5wcm90b3R5cGUuc3RhdHVzTG9ja0FwdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblx0XG5cdC8qdGhpcy5ub2RlLmdldCh7XG5cdFx0XHRzZXJ2aWNlOiAndXBkYXRlJyxcblx0XHRcdGZ1bmM6ICdMb2NrU3RhdHVzJ1xuXHRcdH0sZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRpZihkYXRhLmxvY2tTdGF0dXMpIFxuXHRcdFx0XHRjYWxsYmFjayhudWxsLGRhdGEubG9ja1N0YXR1cyk7IFxuXHR9KTsqL1xuXHRcblx0dGhpcy5ub2RlLmxpc3Rlbih7XG5cdFx0XHRzZXJ2aWNlOiAndXBkYXRlJyxcblx0XHRcdGZ1bmM6ICdTdWJzY3JpYmVMb2NrU3RhdHVzJ1xuXHRcdH0sIFxuXHRcdGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRjYWxsYmFjayhudWxsLHJlcy5sb2NrU3RhdHVzKTtcblx0XHRcdGNvbnNvbGUubG9nKHJlcy5sb2NrU3RhdHVzKTtcblx0XHR9KTtcblxufVxuXG5VcGRhdGUucHJvdG90eXBlLmxpc3RQYWNrYWdlcyA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblxuXHR0aGlzLm5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiAndXBkYXRlJyxcblx0XHRmdW5jOiAnTGlzdFBhY2thZ2VzJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0XHRpZihkYXRhLnBhY2thZ2VzKSBcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5wYWNrYWdlcyk7IFxuXHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHRcdFxuXHR9KTsgXG59XG5cdFxuVXBkYXRlLnByb3RvdHlwZS51cGRhdGVBbGwgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5ub2RlLmdldCh7XG5cdFx0c2VydmljZTogJ3VwZGF0ZScsXG5cdFx0ZnVuYzogJ1VwZGF0ZUFsbCdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdFx0aWYoZGF0YS5wYWNrYWdlcykgXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGFja2FnZXMpOyBcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0fSk7IFxufVxuXHRcblVwZGF0ZS5wcm90b3R5cGUuaW5zdGFsbFBhY2thZ2UgPSBmdW5jdGlvbihwa2csIGNhbGxiYWNrKXtcblx0XHRcblx0aWYgKChwa2cgPT09ICdVbmRlZmluZWQnKSB8fCAodHlwZW9mIHBrZyAhPT0gJ3N0cmluZycpIHx8IChwa2cubGVuZ3RoIDwgMikpe1xuXHRcdGNhbGxiYWNrKCd1bmRlZmluZWRQYWNrYWdlJyxudWxsKTtcblx0fVxuXHRlbHNlIHtcblx0XG5cdFx0dmFyIElOVkFMSURfUEFSQU1FVEVSU19SRUdFWCA9IC9eLXxbXlxcc11cXHMrW15cXHNdfC0kLztcblx0XHR2YXIgdGVzdE5hbWVQa2c9IElOVkFMSURfUEFSQU1FVEVSU19SRUdFWC50ZXN0KHBrZyk7XG5cdFx0aWYgKHRlc3ROYW1lUGtnKVxuXHRcdFx0Y2FsbGJhY2soXCJJbnZhbGlkUGFyYW1ldGVyc1wiLG51bGwpO1xuXHRcdGVsc2V7XG5cdFx0XHRcdFxuXHRcdFx0dGhpcy5ub2RlLmdldCh7XG5cdFx0XHRcdHNlcnZpY2U6ICd1cGRhdGUnLFxuXHRcdFx0XHRmdW5jOiAnSW5zdGFsbFBhY2thZ2UnLFxuXHRcdFx0XHRkYXRhOntcblx0XHRcdFx0XHRwYWNrYWdlOiBwa2csXG5cdFx0XHRcdH1cblx0XHRcdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRpZihkYXRhLnBhY2thZ2VzKSBcblx0XHRcdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGFja2FnZXMpOyBcblx0XHRcdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRcbn1cblxuVXBkYXRlLnByb3RvdHlwZS5yZW1vdmVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjayl7XG5cdFx0XG5cdGlmICgocGtnID09PSAnVW5kZWZpbmVkJykgfHwgKHR5cGVvZiBwa2cgIT09ICdzdHJpbmcnKSB8fCAocGtnLmxlbmd0aCA8IDIpKXtcblx0XHRjYWxsYmFjaygndW5kZWZpbmVkUGFja2FnZScsbnVsbCk7XG5cdH1cblx0ZWxzZSB7XG5cdFxuXHRcdHZhciBJTlZBTElEX1BBUkFNRVRFUlNfUkVHRVggPSAvXlsrIC1dfFteXFxzXVxccytbXlxcc118WysgLV0kLztcblx0XHR2YXIgdGVzdE5hbWVQa2c9IElOVkFMSURfUEFSQU1FVEVSU19SRUdFWC50ZXN0KHBrZyk7XG5cdFx0aWYgKHRlc3ROYW1lUGtnKVxuXHRcdFx0Y2FsbGJhY2soXCJJbnZhbGlkUGFyYW1ldGVyc1wiLG51bGwpO1xuXHRcdGVsc2V7XG5cdFx0XHRcdFxuXHRcdFx0dGhpcy5ub2RlLmdldCh7XG5cdFx0XHRcdHNlcnZpY2U6ICd1cGRhdGUnLFxuXHRcdFx0XHRmdW5jOiAnUmVtb3ZlUGFja2FnZScsXG5cdFx0XHRcdGRhdGE6e1xuXHRcdFx0XHRcdHBhY2thZ2U6IHBrZyxcblx0XHRcdFx0fVxuXHRcdFx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGlmKGRhdGEucGFja2FnZXMpIFxuXHRcdFx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5wYWNrYWdlcyk7IFxuXHRcdFx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdFxufVxuXHRcdFxuXHRcdFxudmFyIGV4cCA9IHtcblx0XHRVcGRhdGU6IFVwZGF0ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDsgXG4iXX0=
