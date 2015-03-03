!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.diya=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
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

},{}],"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
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

},{}],"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/support/isBufferBrowser.js":[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js":[function(require,module,exports){
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

},{"./support/isBuffer":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/support/isBufferBrowser.js","_process":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/process/browser.js","inherits":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/home/antoroll/workspace/DiyaSDK/src/diya-sdk.js":[function(require,module,exports){
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
		discover: discover,
		qei: qei
}

module.exports = diya;

},{"./services/auth/auth":"/home/antoroll/workspace/DiyaSDK/src/services/auth/auth.js","./services/discover/discover":"/home/antoroll/workspace/DiyaSDK/src/services/discover/discover.js","./services/message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","./services/promethe/promethe":"/home/antoroll/workspace/DiyaSDK/src/services/promethe/promethe.js","./services/qei/qei":"/home/antoroll/workspace/DiyaSDK/src/services/qei/qei.js","./services/rtc/rtc":"/home/antoroll/workspace/DiyaSDK/src/services/rtc/rtc.js","./services/timer/timer":"/home/antoroll/workspace/DiyaSDK/src/services/timer/timer.js","./services/watchdog/watchdog":"/home/antoroll/workspace/DiyaSDK/src/services/watchdog/watchdog.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/auth/auth.js":[function(require,module,exports){
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

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/discover/discover.js":[function(require,module,exports){
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
},{}],"/home/antoroll/workspace/DiyaSDK/src/services/message.js":[function(require,module,exports){
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

},{}],"/home/antoroll/workspace/DiyaSDK/src/services/promethe/promethe.js":[function(require,module,exports){
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
},{"../rtc/rtc":"/home/antoroll/workspace/DiyaSDK/src/services/rtc/rtc.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/qei/qei.js":[function(require,module,exports){
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


function QEI(node, callback, sampling){
	var that = this;
	this.node = node;
	
	this.sampling = sampling || 10; /* max num of pts displayed */
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
			that.getDataModelFromRecv(data);
			// console.log(JSON.stringify(that.dataModel));
			
			/// that.updateChart(this.dataModel);
			that.callback(that.dataModel);

			node.listen({
					service: "qei",
					func: "SubscribeQei"
				}, function(res) {
					that.getDataModelFromRecv(res.data);
					that.callback(that.dataModel);
					});
	});

	console.log("DiyaSDK - QEI: created");
	return this;
}

QEI.prototype.getSampling = function(numSamples){
	return this.sampling;
}
QEI.prototype.setSampling = function(numSamples){
	this.sampling = numSamples;
}


/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}     [description]
 */
QEI.prototype.getDataModelFromRecv = function(data){
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
		// console.log('rcvdata '+JSON.stringify(data));
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

					/* update dataFrame */
					dataModel[n].frame=data[n].frame;

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
					// console.log('mydata '+JSON.stringify(dataModel[n].data));
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

					/* update dataFrame */
					dataModel[n].frame=data[n].frame;

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
		console.err("No Data to read or header is missing !");
	}
	return this.dataModel;
}


var exp = {
		QEI: QEI
}

module.exports = exp; 

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/rtc/rtc.js":[function(require,module,exports){
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

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/timer/timer.js":[function(require,module,exports){
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

},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}],"/home/antoroll/workspace/DiyaSDK/src/services/watchdog/watchdog.js":[function(require,module,exports){
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


},{"../message":"/home/antoroll/workspace/DiyaSDK/src/services/message.js","util":"/home/antoroll/workspace/DiyaSDK/node_modules/browserify/node_modules/util/util.js"}]},{},["/home/antoroll/workspace/DiyaSDK/src/diya-sdk.js"])("/home/antoroll/workspace/DiyaSDK/src/diya-sdk.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9EaXlhU0RLL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvc2VydmljZXMvYXV0aC9hdXRoLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL2Rpc2NvdmVyL2Rpc2NvdmVyLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL21lc3NhZ2UuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvc2VydmljZXMvcHJvbWV0aGUvcHJvbWV0aGUuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvRGl5YVNESy9zcmMvc2VydmljZXMvcWVpL3FlaS5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9EaXlhU0RLL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL3RpbWVyL3RpbWVyLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL0RpeWFTREsvc3JjL3NlcnZpY2VzL3dhdGNoZG9nL3dhdGNoZG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qIERpeWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cbnZhciBtZXNzYWdlID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9tZXNzYWdlJyk7XG5cbi8vU2VydmljZXNcbnZhciBhdXRoID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9hdXRoL2F1dGgnKTtcbnZhciB0aW1lciA9IHJlcXVpcmUoJy4vc2VydmljZXMvdGltZXIvdGltZXInKTtcbnZhciBydGMgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3J0Yy9ydGMnKTtcbnZhciBQcm9tZXRoZSA9IHJlcXVpcmUoJy4vc2VydmljZXMvcHJvbWV0aGUvcHJvbWV0aGUnKTtcbnZhciB3YXRjaGRvZyA9IHJlcXVpcmUoJy4vc2VydmljZXMvd2F0Y2hkb2cvd2F0Y2hkb2cnKTtcbnZhciBkaXNjb3ZlciA9IHJlcXVpcmUoJy4vc2VydmljZXMvZGlzY292ZXIvZGlzY292ZXInKTtcbnZhciBxZWkgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3FlaS9xZWknKTtcblxudmFyIFdlYlNvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgd2luZG93Lk1veldlYlNvY2tldDtcblxuXG5cbiBcblxuZnVuY3Rpb24gRGl5YShhZGRyKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgc29ja2V0O1x0XG5cblx0dmFyIGNsb3NlX2NiID0gbnVsbDtcblxuXHR2YXIgcGVuZGluZ1JlcXVlc3RzID0gW107XG5cdHZhciByZWdpc3RlcmVkTGlzdGVuZXJzID0gW107XG5cblx0dmFyIG5leHRSZXFJZCA9IC0xO1xuXHRmdW5jdGlvbiBjb25zdW1lTmV4dFJlcUlkKCl7XG5cdFx0bmV4dFJlcUlkKys7XG5cdFx0cmV0dXJuIG5leHRSZXFJZDtcblx0fVxuXG5cdHZhciBuZXh0U3Vic2NyaXB0aW9uSWQgPSAtMTtcblx0ZnVuY3Rpb24gY29uc3VtZU5leHRTdWJzY3JpcHRpb25JZCgpe1xuXHRcdG5leHRTdWJzY3JpcHRpb25JZCsrO1xuXHRcdHJldHVybiBuZXh0U3Vic2NyaXB0aW9uSWQ7XG5cdH1cblx0XG5cdGZ1bmN0aW9uIGRpc3BhdGNoKG1zZyl7XG5cblx0XHRpZihtc2cucmVxSWQgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRkaXNwYXRjaFJlcXVlc3QobXNnKTtcblx0XHR9ZWxzZSBpZihtc2cuc3ViSWQgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRkaXNwYXRjaEV2ZW50KG1zZyk7XG5cdFx0fVxuXHRcdC8vSWYgdGhlIG1zZyBkb2Vzbid0IGhhdmUgYSByZXFJZCwgaXQgY2Fubm90IGJlIG1hdGNoZWQgdG8gYSBwZW5kaW5nIHJlcXVlc3Rcblx0XHRlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKCdtaXNzaW5nIHJlcUlkIG9yIHN1YklkLiBJZ25vcmluZyBtc2cgOiAnKTtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdFxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KG1zZyl7XG5cdFx0Ly9JZiBtc2cucmVxSWQgY29ycmVzcG9uZHMgdG8gYSBwZW5kaW5nIHJlcXVlc3QsIGV4ZWN1dGUgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG5cdFx0aWYodHlwZW9mIHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdID09PSAnZnVuY3Rpb24nKXtcblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cblx0XHRcdC8vZXhlY3V0ZSB0aGUgcmVzcG9uc2UgY2FsbGJhY2ssIHBhc3MgdGhlIG1lc3NhZ2UgZGF0YSBhcyBhcmd1bWVudFxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0obXNnLmRhdGEpO1xuXHRcdFx0ZGVsZXRlIHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdO1xuXHRcdH1lbHNle1xuXHRcdFx0Ly9ObyBwZW5kaW5nIHJlcXVlc3QgZm9yIHRoaXMgcmVxSWQsIGlnbm9yaW5nIHJlc3BvbnNlXG5cdFx0XHRjb25zb2xlLmxvZygnbXNnLnJlcUlkIGRvZXNuXFwndCBtYXRjaCBhbnkgcGVuZGluZyByZXF1ZXN0LCBJZ25vcmluZyBtc2cgISAnK21zZyk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobXNnKXtcblx0XHQvL0lmIG1zZy5zdWJJZCBjb3JyZXNwb25kcyB0byBhIHJlZ2lzdGVyZWQgbGlzdGVuZXIsIGV4ZWN1dGUgdGhlIGV2ZW50IGNhbGxiYWNrXG5cdFx0aWYodHlwZW9mIHJlZ2lzdGVyZWRMaXN0ZW5lcnNbbXNnLnN1YklkXSA9PT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXG5cdFx0XHQvL2V4ZWN1dGUgdGhlIGV2ZW50IGNhbGxiYWNrLCBwYXNzIHRoZSBtZXNzYWdlIGRhdGEgYXMgYXJndW1lbnRcblx0XHRcdGlmKCFtc2cucmVzdWx0IHx8IG1zZy5yZXN1bHQgIT0gJ2Nsb3NlZCcpe1xuXHRcdFx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF0obXNnLmRhdGEpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdC8vSWYgdGhlIHN1YnNjcmlwdGlvbiB3YXMgY2xvc2VkLCB0aGVuIHJlbW92ZSB0aGUgaGFuZGxlclxuXHRcdFx0XHRkZWxldGUgcmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdO1xuXHRcdFx0fVxuXG5cblx0XHR9ZWxzZXtcblx0XHRcdC8vTm8gcGVuZGluZyByZXF1ZXN0IGZvciB0aGlzIHN1YklkLCBpZ25vcmluZyBldmVudFxuXHRcdFx0Y29uc29sZS5sb2coJ21zZy5zdWJJZCBkb2VzblxcJ3QgbWF0Y2ggYW55IHJlZ2lzdGVyZWQgbGlzdGVuZXJzLCBJZ25vcmluZyBtc2cgISAnK21zZyk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblx0fVxuXHRcblx0XG5cdGZ1bmN0aW9uIHNlbmQobXNnKXtcblx0XHRpZihzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NJTkcgfHwgc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJkaXlhLVNESyA6IGNhbm5vdCBzZW5kIG1lc3NhZ2UgLT4gc29ja2V0IGNsb3NlZFwiKTtcblx0XHR9XG5cdFx0dHJ5e1xuXHRcdFx0ZGF0YSA9IEpTT04uc3RyaW5naWZ5KG1zZyk7XG5cdFx0XHRzb2NrZXQuc2VuZChkYXRhKTtcblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZygnbWFsZm9ybWVkIEpTT04sIGlnbm9yaW5nIG1zZy4uLicpO1xuXHRcdH1cblx0fVx0XG5cdFxuXHRmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGluY29taW5nTWVzc2FnZSl7XG5cdFx0dmFyIG1zZztcblxuXHRcdHRyeXtcblx0XHRcdG1zZyA9IEpTT04ucGFyc2UoaW5jb21pbmdNZXNzYWdlLmRhdGEpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKFwibWFsZm9ybWVkIEpTT05cIik7XG5cdFx0XHQgXG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblx0XHRcblx0XHRkaXNwYXRjaChtc2cpO1xuXG5cdH07XG5cdFxuXHRmdW5jdGlvbiBjbG9zZUFsbCgpe1xuXHRcdHdoaWxlKHBlbmRpbmdSZXF1ZXN0cy5sZW5ndGgpe1xuXHRcdFx0cGVuZGluZ1JlcXVlc3RzLnBvcCgpO1xuXHRcdH1cblx0XHR3aGlsZShyZWdpc3RlcmVkTGlzdGVuZXJzLmxlbmd0aCl7XG5cdFx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzLnBvcCgpO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKGNsb3NlX2NiKTtcblxuXHRcdGlmKHR5cGVvZiBjbG9zZV9jYiA9PT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRjbG9zZV9jYigpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2UocGFyYW1zKXtcblx0XHRpZighcGFyYW1zLnNlcnZpY2UpIHJldHVybiBudWxsO1xuXHRcdGVsc2UgcmV0dXJuIHtcblx0XHRcdHNlcnZpY2U6IHBhcmFtcy5zZXJ2aWNlLFxuXHRcdFx0ZnVuYzogcGFyYW1zLmZ1bmMgPyBwYXJhbXMuZnVuYyA6IHVuZGVmaW5lZCxcblx0XHRcdG9iajogcGFyYW1zLm9iaiA/IHBhcmFtcy5vYmogOiB1bmRlZmluZWQsXG5cdFx0XHRkYXRhOiBwYXJhbXMuZGF0YSA/IHBhcmFtcy5kYXRhIDogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vUHVibGljIEFQSS8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcblx0dGhpcy5jb25uZWN0ID0gZnVuY3Rpb24oY2FsbGJhY2ssIGFyZ3Mpe1xuXHRcdHRyeXtcblx0XHRcdHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYWRkcik7XG5cblx0XHRcdHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGNhbGxiYWNrKFwiQ2Fubm90IENvbm5lY3RcIiwgbnVsbCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBhcmdzKTtcblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihpbmNvbWluZ01lc3NhZ2Upe1xuXHRcdFx0XHRoYW5kbGVNZXNzYWdlKGluY29taW5nTWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0Y2xvc2VBbGwoKTtcblx0XHRcdH1cblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNhbid0IGNvbm5lY3QgdG8gXCIrYWRkcik7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuZ2V0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjayl7XG5cdFx0dmFyIG1zZyA9IGNyZWF0ZU1lc3NhZ2UocGFyYW1zKTtcblx0XHRpZihtc2cgPT09IG51bGwpIHJldHVybiA7XG5cblx0XHRtc2cucmVxSWQgPSBjb25zdW1lTmV4dFJlcUlkKCk7XG5cdFx0cGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0gPSBjYWxsYmFjaztcblxuXHRcdHNlbmQobXNnKTtcblx0fVxuXG5cdHRoaXMubGlzdGVuID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjayl7XG5cdFx0dmFyIG1zZyA9IGNyZWF0ZU1lc3NhZ2UocGFyYW1zKTtcblx0XHRpZihtc2cgPT09IG51bGwpIHJldHVybiA7XG5cblx0XHRtc2cuc3ViSWQgPSBjb25zdW1lTmV4dFN1YnNjcmlwdGlvbklkKCk7XG5cdFx0cmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdID0gY2FsbGJhY2s7XG5cdFx0XG5cdFx0c2VuZChtc2cpO1xuXG5cdFx0cmV0dXJuIG1zZy5zdWJJZDtcblx0fVxuXG5cdHRoaXMuY2xvc2VDYWxsYmFjayA9IGZ1bmN0aW9uKGNiKXtcblx0XHRjbG9zZV9jYiA9IGNiO1xuXHR9XG5cblx0dGhpcy5zdG9wTGlzdGVuaW5nID0gZnVuY3Rpb24oc3ViSWQpe1xuXHRcdG1zZyA9IHtcblx0XHRcdGZ1bmM6ICdVbnN1YnNjcmliZScsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHN1YklkOiBzdWJJZFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHNlbmQobXNnKTtcblx0fVxuXG5cdHRoaXMuY29ubmVjdGVkID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gISAoc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEKTtcblx0fVxuXG5cdHRoaXMuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdFx0c29ja2V0LmNsb3NlKCk7XG5cdH1cblx0XG59XG5cblxuZnVuY3Rpb24gRGl5YUNsaWVudChhZGRyLCB1c2VyLCBwYXNzd29yZCl7XG5cblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUoKXtcblx0XHR2YXIgbm9kZSA9IG5ldyBkaXlhLkRpeWEoYWRkcik7XG5cdFx0Ly9ub2Rlcy5wdXNoKG5vZGUpO1xuXG5cdFx0cmV0dXJuIG5vZGU7XG5cdH1cblxuXHR0aGlzLnNldEFkZHJlc3MgPSBmdW5jdGlvbihhZGRyZXNzKXtcblx0XHRhZGRyID0gYWRkcmVzcztcblx0fVxuXG5cdHRoaXMuY3JlYXRlU2Vzc2lvbiA9IGZ1bmN0aW9uKG9uY29ubmVjdGVkLCBvbmZhaWx1cmUpe1xuXHRcdHZhciBub2RlID0gY3JlYXRlTm9kZSgpO1xuXG5cdFx0bm9kZS5jb25uZWN0KGZ1bmN0aW9uKGVycil7XG5cdFx0XHRpZihlcnIpe1xuXHRcdFx0XHRvbmZhaWx1cmUoZXJyKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRub2RlLmdldCh7XG5cdFx0XHRcdFx0c2VydmljZTogJ2F1dGgnLFxuXHRcdFx0XHRcdGZ1bmM6ICdBdXRoZW50aWNhdGUnLFxuXHRcdFx0XHRcdGRhdGE6IHt1c2VyOiB1c2VyLCBwYXNzd29yZDogcGFzc3dvcmR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRcdFx0aWYocmVzLmF1dGhlbnRpY2F0ZWQgfHwgKHJlcy5lcnJvciAmJiByZXMuZXJyb3IgPT09ICdTZXJ2aWNlTm90Rm91bmQnKSkgb25jb25uZWN0ZWQobm9kZSk7XG5cdFx0XHRcdFx0ZWxzZSBvbmZhaWx1cmUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fVxuXHRcbn1cblxuXG52YXIgZGl5YSA9IHtcblx0XHREaXlhQ2xpZW50OiBEaXlhQ2xpZW50LFxuXHRcdERpeWE6IERpeWEsXG5cdFx0YXV0aDogYXV0aCxcblx0XHR0aW1lcjogdGltZXIsXG5cdFx0cnRjOiBydGMsXG5cdFx0UHJvbWV0aGU6IFByb21ldGhlLFxuXHRcdHdhdGNoZG9nOiB3YXRjaGRvZyxcblx0XHRkaXNjb3ZlcjogZGlzY292ZXIsXG5cdFx0cWVpOiBxZWlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXlhO1xuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbmZ1bmN0aW9uIEF1dGhlbnRpY2F0ZSh1c2VyLCBwYXNzd29yZCwgY2FsbGJhY2spe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ2F1dGgnLCAnQXV0aGVudGljYXRlJyk7XG5cdFxuXHR0aGlzLnVzZXIgPSB1c2VyO1xuXHR0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG5cdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbn1cbnV0aWwuaW5oZXJpdHMoQXV0aGVudGljYXRlLCBNZXNzYWdlKTtcblxuQXV0aGVudGljYXRlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIEF1dGhlbnRpY2F0ZS5zdXBlcl8ucHJvdG90eXBlLmV4ZWMuY2FsbCh0aGlzLCB7XG5cdFx0XHR1c2VyOiB0aGlzLnVzZXIsXG5cdFx0XHRwYXNzd29yZDogdGhpcy5wYXNzd29yZFxuXHR9KTtcbn1cblxuQXV0aGVudGljYXRlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLmF1dGhlbnRpY2F0ZWQgIT0gdW5kZWZpbmVkKXtcblx0XHR0aGlzLmNhbGxiYWNrKGRhdGEuYXV0aGVudGljYXRlZCk7XG5cdH1cbn1cblxuXG52YXIgY29yZSA9IHtcblx0XHRBdXRoZW50aWNhdGU6IEF1dGhlbnRpY2F0ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmU7XG4iLCJ2YXIgZGdyYW07XG5cbnZhciBuZXR3b3JrSWRSZXF1ZXN0ID0gJ2RpeWEtbmV0d29yay1pZFxcbic7XG5cbnZhciBzb2NrZXQ7XG52YXIgY2FsbGJhY2tzID0gW107XG52YXIgZGl5YXMgPSBbXTtcblxuXG52YXIgc3RhdGUgPSAnc3RvcHBlZCc7XG5cbmZ1bmN0aW9uIGlzTm9kZSgpe1xuXHRpZihkZ3JhbSkgcmV0dXJuIHRydWU7XG5cdHRyeXtcblx0XHRkZ3JhbSA9IHJlcXVpcmUoJ2RncmFtJysnJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1jYXRjaChlKXtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdGVuKGNhbGxiYWNrKXtcblx0aWYoIWlzTm9kZSgpKSByZXR1cm4gO1xuXHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFxufVxuXG5mdW5jdGlvbiByZW1vdmVPdXRkYXRlZERpeWFzKCl7XG5cdGZvcih2YXIgaT0wO2k8ZGl5YXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZGl5YXNbaV0udG91Y2ggPiAxMDAwMCl7XG5cdFx0XHRkaXlhcy5zcGxpY2UoaSwgMSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERpeWEobmFtZSwgcG9ydCwgYWRkcmVzcyl7XG5cdGZvcih2YXIgaT0wOyBpPGRpeWFzLmxlbmd0aDsgaSsrKXtcblx0XHRpZihkaXlhc1tpXS5uYW1lID09PSBuYW1lICYmIGRpeWFzW2ldLmFkZHIgPT09IGFkZHJlc3MrJzonK3BvcnQpe1xuXHRcdFx0cmV0dXJuIGRpeWFzW2ldO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ290RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKXtcblxuXG5cdHZhciBkaXlhID0gZ2V0RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKTtcblx0aWYoIWRpeWEpe1xuXHRcdGRpeWEgPSB7bmFtZTogbmFtZSwgYWRkcjogYWRkcmVzcysnOicrcG9ydH07XG5cdFx0ZGl5YXMucHVzaChkaXlhKTtcblx0fVxuXHRkaXlhLnRvdWNoID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQW5zd2VyKG5hbWUsIHBvcnQsIGFkZHJlc3Mpe1xuXHRmb3IodmFyIGk9MDtpPGNhbGxiYWNrcy5sZW5ndGg7aSsrKXtcblx0XHRjYWxsYmFja3NbaV0obmFtZSwgcG9ydCwgYWRkcmVzcyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVxdWVzdCgpe1xuXHRzb2NrZXQuc2VuZChuZXR3b3JrSWRSZXF1ZXN0LCAwLCBuZXR3b3JrSWRSZXF1ZXN0Lmxlbmd0aCwgMjAwMCwgJzI1NS4yNTUuMjU1LjI1NScpO1xufVxuXG5mdW5jdGlvbiBzdGFydCgpe1xuXHRpZighaXNOb2RlKCkpIHJldHVybiA7XG5cblx0c3RhdGUgPSAnc3RhcnRlZCc7XG5cblx0aWYoIXNvY2tldCl7XG5cdFx0c29ja2V0ID0gZGdyYW0uY3JlYXRlU29ja2V0KCd1ZHA0Jyk7XG5cblx0XHRzb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihkYXRhLCByaW5mbyl7XG5cdFx0XHR2YXIgbXNnID0gZGF0YS50b1N0cmluZygnYXNjaWknKTtcblx0XHRcdHZhciBwYXJhbXMgPSBtc2cuc3BsaXQoJzonKTtcblx0XHRcdFxuXHRcdFx0aWYocGFyYW1zLmxlbmd0aCA9PSAyKXtcblx0XHRcdFx0Z290RGl5YShwYXJhbXNbMF0sIHBhcmFtc1sxXSwgcmluZm8uYWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2xpc3RlbmluZycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRzb2NrZXQuc2V0QnJvYWRjYXN0KHRydWUpO1x0XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb0Rpc2NvdmVyKCl7XG5cdFx0cmVxdWVzdCgpO1xuXHRcdHJlbW92ZU91dGRhdGVkRGl5YXMoKTtcblxuXHRcdGlmKHN0YXRlID09PSAnc3RhcnRlZCcpIHNldFRpbWVvdXQoZG9EaXNjb3ZlciwgMTAwMCk7XG5cdH1cblx0ZG9EaXNjb3ZlcigpO1xuXG5cbn1cblxuZnVuY3Rpb24gc3RvcCgpe1xuXG5cdHN0YXRlID0gJ3N0b3BwZWQnO1xuXG5cdGlmKHNvY2tldCkgc29ja2V0LmNsb3NlKCk7XG5cdHdoaWxlKGNhbGxiYWNrcy5sZW5ndGgpe1xuXHRcdGNhbGxiYWNrcy5wb3AoKTtcblx0fVxufVxuXG5cbmZ1bmN0aW9uIGF2YWlsYWJsZURpeWFzKCl7XG5cdHJldHVybiBkaXlhcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHN0YXJ0OiBzdGFydCxcblx0c3RvcDogc3RvcCxcblx0bGlzdGVuOiBsaXN0ZW4sXG5cdGlzRGlzY292ZXJhYmxlOiBpc05vZGUsXG5cdGF2YWlsYWJsZURpeWFzOiBhdmFpbGFibGVEaXlhc1xufSIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxuZnVuY3Rpb24gTWVzc2FnZShzZXJ2aWNlLCBmdW5jLCBvYmosIHBlcm1hbmVudCl7XG5cblx0dGhpcy5zZXJ2aWNlID0gc2VydmljZTtcblx0dGhpcy5mdW5jID0gZnVuYztcblx0dGhpcy5vYmogPSBvYmo7XG5cdFxuXHR0aGlzLnBlcm1hbmVudCA9IHBlcm1hbmVudDsgLy9JZiB0aGlzIGZsYWcgaXMgb24sIHRoZSBjb21tYW5kIHdpbGwgc3RheSBvbiB0aGUgY2FsbGJhY2sgbGlzdCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xufVxuXG5NZXNzYWdlLmJ1aWxkU2lnbmF0dXJlID0gZnVuY3Rpb24obXNnKXtcblx0cmV0dXJuIG1zZy5zZXJ2aWNlKycuJyttc2cuZnVuYysnLicrbXNnLm9iajtcbn1cblxuXG5NZXNzYWdlLnByb3RvdHlwZS5zaWduYXR1cmUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5zZXJ2aWNlKycuJyt0aGlzLmZ1bmMrJy4nK3RoaXMub2JqO1xufVxuXG5NZXNzYWdlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oZGF0YSl7XG5cdHJldHVybiB7XG5cdFx0c2VydmljZTogdGhpcy5zZXJ2aWNlLFxuXHRcdGZ1bmM6IHRoaXMuZnVuYyxcblx0XHRvYmo6IHRoaXMub2JqLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2U7XG4iLCJ2YXIgUlRDID0gcmVxdWlyZSgnLi4vcnRjL3J0YycpO1xuXG5mdW5jdGlvbiBQcm9tZXRoZShzZXNzaW9uKXtcblx0dGhpcy5ydGMgPSBuZXcgUlRDLlJUQyhzZXNzaW9uKTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKHJlZ2V4LCBjYWxsYmFjayl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5ydGMudXNlKHJlZ2V4LCBmdW5jdGlvbihjaGFubmVsKXtcblx0XHR0aGF0Ll9uZWdvY2lhdGVOZXVyb24oY2hhbm5lbCwgY2FsbGJhY2spO1xuXHR9KTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5jb25uZWN0KCk7XG59XG5cblByb21ldGhlLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5ydGMuZGlzY29ubmVjdCgpO1xufVxuXG5cblByb21ldGhlLnByb3RvdHlwZS5fbmVnb2NpYXRlTmV1cm9uID0gZnVuY3Rpb24oY2hhbm5lbCwgY2FsbGJhY2spe1xuXHRjaGFubmVsLnNldE9uTWVzc2FnZShmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRcblx0XHR2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhtZXNzYWdlLmRhdGEpO1xuXG5cdFx0dmFyIHR5cGVDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3LmdldFVpbnQ4KDApKTtcblx0XHRpZih0eXBlQ2hhciA9PT0gJ08nKXtcblx0XHRcdC8vSW5wdXRcblx0XHRcdGNoYW5uZWwudHlwZSA9ICdpbnB1dCc7IC8vUHJvbWV0aGUgT3V0cHV0ID0gQ2xpZW50IElucHV0XG5cdFx0fWVsc2UgaWYodHlwZUNoYXIgPT09ICdJJyl7XG5cdFx0XHQvL091dHB1dFxuXHRcdFx0Y2hhbm5lbC50eXBlID0gJ291dHB1dCc7IC8vUHJvbWV0aGUgSW5wdXQgPSBDbGllbnQgT3V0cHV0XG5cdFx0fWVsc2V7XG5cdFx0XHQvL0Vycm9yXG5cdFx0fVxuXG5cdFx0dmFyIHNpemUgPSB2aWV3LmdldEludDMyKDEsdHJ1ZSk7XG5cdFx0aWYoc2l6ZSAhPSB1bmRlZmluZWQpe1xuXHRcdFx0Y2hhbm5lbC5zaXplID0gc2l6ZTtcblx0XHRcdGNoYW5uZWwuX2J1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSk7XG5cdFx0fWVsc2V7XG5cdFx0XHQvL2Vycm9yXG5cdFx0fVxuXG5cblxuXHRcdGNoYW5uZWwuc2V0T25NZXNzYWdlKHVuZGVmaW5lZCk7XG5cblx0XHRjaGFubmVsLnNldE9uVmFsdWUgPSBmdW5jdGlvbihvbnZhbHVlX2NiKXtcblx0XHRcdGNoYW5uZWwuc2V0T25NZXNzYWdlKG9udmFsdWVfY2IpO1xuXHRcdH1cblxuXHRcdGNoYW5uZWwud3JpdGUgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRcdFx0aWYoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhbm5lbC5zaXplIHx8IGlzTmFOKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2hhbm5lbC5fYnVmZmVyW2luZGV4XSA9IHZhbHVlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Y2hhbm5lbC5mcmVxdWVuY3kgPSAzMztcblxuXHRcdGNoYW5uZWwuX3J1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRjaGFubmVsLnNlbmQoY2hhbm5lbC5fYnVmZmVyKTtcblx0XHRcdHNldFRpbWVvdXQoY2hhbm5lbC5fcnVuLCBjaGFubmVsLmZyZXF1ZW5jeSk7XG5cdFx0fVxuXG5cdFx0Y2hhbm5lbC5fcnVuKCk7XG5cblx0XHRjYWxsYmFjayhjaGFubmVsKTtcblxuXHR9KTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21ldGhlOyIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbmZ1bmN0aW9uIFFFSShub2RlLCBjYWxsYmFjaywgc2FtcGxpbmcpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdFxuXHR0aGlzLnNhbXBsaW5nID0gc2FtcGxpbmcgfHwgMTA7IC8qIG1heCBudW0gb2YgcHRzIGRpc3BsYXllZCAqL1xuXHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24ocmVzKXt9OyAvKiBjYWxsYmFjaywgdXN1YWxseSBhZnRlciBnZXRNb2RlbCAqL1xuXG5cdG5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiBcInFlaVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVJlcXVlc3RcIixcblx0XHRkYXRhOiB7XG5cdFx0XHR0eXBlOlwibXNnSW5pdFwiLFxuXHRcdFx0c2FtcGxpbmc6IDEsXG5cdFx0XHRyZXF1ZXN0ZWREYXRhOiBcImFsbFwiXG5cdFx0XHQvKiBubyB0aW1lIHJhbmdlIHNwZWNpZmllZCAqL1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhhdC5kYXRhTW9kZWw9IHt9O1xuXHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRcdHRoYXQuZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0aGF0LmRhdGFNb2RlbCkpO1xuXHRcdFx0XG5cdFx0XHQvLy8gdGhhdC51cGRhdGVDaGFydCh0aGlzLmRhdGFNb2RlbCk7XG5cdFx0XHR0aGF0LmNhbGxiYWNrKHRoYXQuZGF0YU1vZGVsKTtcblxuXHRcdFx0bm9kZS5saXN0ZW4oe1xuXHRcdFx0XHRcdHNlcnZpY2U6IFwicWVpXCIsXG5cdFx0XHRcdFx0ZnVuYzogXCJTdWJzY3JpYmVRZWlcIlxuXHRcdFx0XHR9LCBmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0XHR0aGF0LmdldERhdGFNb2RlbEZyb21SZWN2KHJlcy5kYXRhKTtcblx0XHRcdFx0XHR0aGF0LmNhbGxiYWNrKHRoYXQuZGF0YU1vZGVsKTtcblx0XHRcdFx0XHR9KTtcblx0fSk7XG5cblx0Y29uc29sZS5sb2coXCJEaXlhU0RLIC0gUUVJOiBjcmVhdGVkXCIpO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuUUVJLnByb3RvdHlwZS5nZXRTYW1wbGluZyA9IGZ1bmN0aW9uKG51bVNhbXBsZXMpe1xuXHRyZXR1cm4gdGhpcy5zYW1wbGluZztcbn1cblFFSS5wcm90b3R5cGUuc2V0U2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0dGhpcy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG59XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfSAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5RRUkucHJvdG90eXBlLmdldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9dGhpcy5kYXRhTW9kZWw7XG5cdC8qXFxcblx0fCp8XG5cdHwqfCAgdXRpbGl0YWlyZXMgZGUgbWFuaXB1bGF0aW9ucyBkZSBjaGHDrm5lcyBiYXNlIDY0IC8gYmluYWlyZXMgLyBVVEYtOFxuXHR8Knxcblx0fCp8ICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL0TDqWNvZGVyX2VuY29kZXJfZW5fYmFzZTY0XG5cdHwqfFxuXHRcXCovXG5cdC8qKiBEZWNvZGVyIHVuIHRhYmxlYXUgZCdvY3RldHMgZGVwdWlzIHVuZSBjaGHDrm5lIGVuIGJhc2U2NCAqL1xuXHRiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRcdHJldHVybiBuQ2hyID4gNjQgJiYgbkNociA8IDkxID9cblx0XHRcdFx0bkNociAtIDY1XG5cdFx0XHQ6IG5DaHIgPiA5NiAmJiBuQ2hyIDwgMTIzID9cblx0XHRcdFx0bkNociAtIDcxXG5cdFx0XHQ6IG5DaHIgPiA0NyAmJiBuQ2hyIDwgNTggP1xuXHRcdFx0XHRuQ2hyICsgNFxuXHRcdFx0OiBuQ2hyID09PSA0MyA/XG5cdFx0XHRcdDYyXG5cdFx0XHQ6IG5DaHIgPT09IDQ3ID9cblx0XHRcdFx0NjNcblx0XHRcdDpcdDA7XG5cdH07XG5cdC8qKlxuXHQgKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG5cdCAqIEBwYXJhbSAge1N0cmluZ30gc0Jhc2U2NCAgICAgYmFzZTY0IGNvZGVkIHN0cmluZ1xuXHQgKiBAcGFyYW0gIHtpbnR9IG5CbG9ja3NTaXplIHNpemUgb2YgYmxvY2tzIG9mIGJ5dGVzIHRvIGJlIHJlYWQuIE91dHB1dCBieXRlQXJyYXkgbGVuZ3RoIHdpbGwgYmUgYSBtdWx0aXBsZSBvZiB0aGlzIHZhbHVlLlxuXHQgKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICB0YWIgb2YgZGVjb2RlZCBieXRlc1xuXHQgKi9cblx0YmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHRcdHZhclxuXHRcdHNCNjRFbmMgPSBzQmFzZTY0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCBcIlwiKSwgbkluTGVuID0gc0I2NEVuYy5sZW5ndGgsXG5cdFx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0XHRidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobk91dExlbiksIHRhQnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG5cdFx0Zm9yICh2YXIgbk1vZDMsIG5Nb2Q0LCBuVWludDI0ID0gMCwgbk91dElkeCA9IDAsIG5JbklkeCA9IDA7IG5JbklkeCA8IG5JbkxlbjsgbkluSWR4KyspIHtcblx0XHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdFx0blVpbnQyNCB8PSBiNjRUb1VpbnQ2KHNCNjRFbmMuY2hhckNvZGVBdChuSW5JZHgpKSA8PCAxOCAtIDYgKiBuTW9kNDtcblx0XHRcdGlmIChuTW9kNCA9PT0gMyB8fCBuSW5MZW4gLSBuSW5JZHggPT09IDEpIHtcblx0XHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdFx0dGFCeXRlc1tuT3V0SWR4XSA9IG5VaW50MjQgPj4+ICgxNiA+Pj4gbk1vZDMgJiAyNCkgJiAyNTU7XG5cdFx0XHRcdH1cblx0XHRcdFx0blVpbnQyNCA9IDA7XG5cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gY29uc29sZS5sb2coXCJ1OGludCA6IFwiK0pTT04uc3RyaW5naWZ5KHRhQnl0ZXMpKTtcblx0XHRyZXR1cm4gYnVmZmVyO1xuXHR9O1xuXHRcblx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlcikge1xuXHRcdC8vIGNvbnNvbGUubG9nKCdyY3ZkYXRhICcrSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHRcdC8vIGlmKCFkYXRhLmhlYWRlci5zYW1wbGluZykgZGF0YS5oZWFkZXIuc2FtcGxpbmc9MTtcblx0XHRcblx0XHQvKiogY2FzZSAxIDogMSB2YWx1ZSByZWNlaXZlZCBhZGRlZCB0byBkYXRhTW9kZWwgKi9cblx0XHRpZihkYXRhLmhlYWRlci5zYW1wbGluZz09MSkge1xuXHRcdFx0aWYoZGF0YS5oZWFkZXIudGltZUVuZCkge1xuXHRcdFx0XHRpZighZGF0YU1vZGVsLnRpbWUpIGRhdGFNb2RlbC50aW1lPVtdO1xuXHRcdFx0XHRkYXRhTW9kZWwudGltZS5wdXNoKGRhdGEuaGVhZGVyLnRpbWVFbmQpO1xuXHRcdFx0XHRpZihkYXRhTW9kZWwudGltZS5sZW5ndGggPiB0aGlzLnNhbXBsaW5nKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsLnRpbWUgPSBkYXRhTW9kZWwudGltZS5zbGljZShkYXRhTW9kZWwudGltZS5sZW5ndGggLSB0aGlzLnNhbXBsaW5nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgbiBpbiBkYXRhKSB7XG5cdFx0XHRcdGlmKG4gIT0gXCJoZWFkZXJcIiAmJiBuICE9IFwidGltZVwiKSB7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cobik7XG5cdFx0XHRcdFx0aWYoIWRhdGFNb2RlbFtuXSkge1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGE9W107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGFGcmFtZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5mcmFtZT1kYXRhW25dLmZyYW1lO1xuXG5cdFx0XHRcdFx0aWYoZGF0YVtuXS5kYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdC8qIGRlY29kZSBkYXRhIHRvIEZsb2F0MzJBcnJheSovXG5cdFx0XHRcdFx0XHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YVtuXS5kYXRhLCA0KTtcblx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJ1ZikpO1xuXHRcdFx0XHRcdFx0dmFyIGZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmKTtcblxuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IGZBcnJheS5sZW5ndGgpIGNvbnNvbGUubG9nKFwiTWlzbWF0Y2ggb2Ygc2l6ZSBcIitkYXRhW25dLnNpemUrXCIgdnMgXCIrZkFycmF5Lmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gMSkgY29uc29sZS5sb2coXCJFeHBlY3RlZCAxIHZhbHVlIHJlY2VpdmVkIDpcIitkYXRhW25dLnNpemUpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dLmRhdGEpIGRhdGFNb2RlbFtuXS5kYXRhPVtdO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEucHVzaChmQXJyYXlbMF0pO1xuXHRcdFx0XHRcdFx0aWYoZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoID4gdGhpcy5zYW1wbGluZykge1xuXHRcdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IGRhdGFNb2RlbFtuXS5kYXRhLnNsaWNlKGRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCAtIHRoaXMuc2FtcGxpbmcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSAwKSBjb25zb2xlLmxvZyhcIlNpemUgbWlzbWF0Y2ggcmVjZWl2ZWQgZGF0YSAobm8gZGF0YSB2ZXJzdXMgc2l6ZT1cIitkYXRhW25dLnNpemUrXCIpXCIpO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ215ZGF0YSAnK0pTT04uc3RyaW5naWZ5KGRhdGFNb2RlbFtuXS5kYXRhKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvKiogY2FzZSAyIDogaGlzdG9yeSBkYXRhIC0gbWFueSB2YWx1ZXMgcmVjZWl2ZWQgKi9cblx0XHRcdC8qKiBUT0RPICAqL1xuXHRcdFx0Zm9yICh2YXIgbiBpbiBkYXRhKSB7XG5cdFx0XHRcdGlmKG4gPT0gJ3RpbWUnKSB7XG5cdFx0XHRcdFx0LyogY2FzZSAxIDogdGltZSBkYXRhIHRyYW5zbWl0dGVkLCAxIHZhbHVlICovXG5cdFx0XHRcdFx0LyoqIFRPRE8gKiovXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZihuICE9IFwiaGVhZGVyXCIpIHtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YT1bXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YUZyYW1lICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmZyYW1lPWRhdGFbbl0uZnJhbWU7XG5cblx0XHRcdFx0XHRpZihkYXRhW25dLmRhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0LyogZGVjb2RlIGRhdGEgdG8gRmxvYXQzMkFycmF5Ki9cblx0XHRcdFx0XHRcdHZhciBidWYgPSBiYXNlNjREZWNUb0FycihkYXRhW25dLmRhdGEsIDQpOyBcblx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJ1ZikpO1xuXHRcdFx0XHRcdFx0dmFyIGZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmKTtcblxuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IGZBcnJheS5sZW5ndGgpIGNvbnNvbGUubG9nKFwiTWlzbWF0Y2ggb2Ygc2l6ZSBcIitkYXRhW25dLnNpemUrXCIgdnMgXCIrZkFycmF5Lmxlbmd0aCk7XG5cdFx0XHRcdFx0XHQvLyAvKiBpbmNyZWFzZSBzaXplIG9mIGRhdGEgaWYgbmVjZXNzYXJ5ICovXG5cdFx0XHRcdFx0XHRpZihmQXJyYXkubGVuZ3RoPmRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHQvLyBkYXRhTW9kZWxbbl0uc2l6ZT1kYXRhW25dLnNpemU7XG5cdFx0XHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gbmV3IEFycmF5KGRhdGFNb2RlbFtuXS5zaXplKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8qIHVwZGF0ZSBuYiBvZiBzYW1wbGVzIHN0b3JlZCAqL1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBpIGluIGZBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YVtwYXJzZUludChpKV09ZkFycmF5W2ldOyAvKiBrZWVwIGZpcnN0IHZhbCAtIG5hbWUgb2YgY29sdW1uICovXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IDApIGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCByZWNlaXZlZCBkYXRhIChubyBkYXRhIHZlcnN1cyBzaXplPVwiK2RhdGFbbl0uc2l6ZStcIilcIik7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBkYXRhTW9kZWxbbl0uZGF0YSA9IEFycmF5LmZyb20oZkFycmF5KTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZygnbXlkYXRhICcrSlNPTi5zdHJpbmdpZnkoZGF0YU1vZGVsW25dLmRhdGEpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRlbHNlIHtcblx0XHRjb25zb2xlLmVycihcIk5vIERhdGEgdG8gcmVhZCBvciBoZWFkZXIgaXMgbWlzc2luZyAhXCIpO1xuXHR9XG5cdHJldHVybiB0aGlzLmRhdGFNb2RlbDtcbn1cblxuXG52YXIgZXhwID0ge1xuXHRcdFFFSTogUUVJXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwOyBcbiIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG4vKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXG52YXIgUlRDUGVlckNvbm5lY3Rpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbjtcbnZhciBSVENJY2VDYW5kaWRhdGUgPSB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy5tb3pSVENJY2VDYW5kaWRhdGUgfHwgd2luZG93LndlYmtpdFJUQ0ljZUNhbmRpZGF0ZTtcbnZhciBSVENTZXNzaW9uRGVzY3JpcHRpb24gPSB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy5tb3pSVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93LndlYmtpdFJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcblxuZnVuY3Rpb24gQ2hhbm5lbChuYW1lLCBvcGVuX2NiKXtcblx0dGhpcy5uYW1lID0gbmFtZTtcblxuXHR0aGlzLmNoYW5uZWwgPSB1bmRlZmluZWQ7XG5cdHRoaXMub25vcGVuID0gb3Blbl9jYjtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuc2V0Q2hhbm5lbCA9IGZ1bmN0aW9uKGRhdGFjaGFubmVsKXtcblx0dGhpcy5jaGFubmVsID0gZGF0YWNoYW5uZWw7XG5cblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRpZih0aGF0Lm9ub3BlbikgdGhhdC5vbm9wZW4odGhhdCk7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNldE9uTWVzc2FnZSA9IGZ1bmN0aW9uKG9ubWVzc2FnZSl7XG5cdHRoaXMuY2hhbm5lbC5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtc2cpe1xuXHRpZih0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSA9PT0gJ29wZW4nKSB0aGlzLmNoYW5uZWwuc2VuZChtc2cpO1xuXHRlbHNlIGNvbnNvbGUubG9nKCdbcnRjLmNoYW5uZWwud3JpdGVdIHdhcm5pbmcgOiB3ZWJydGMgZGF0YWNoYW5uZWwgc3RhdGUgPSAnK3RoaXMuY2hhbm5lbC5yZWFkeVN0YXRlKTtcbn1cblxuZnVuY3Rpb24gUlRDKG5vZGUpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdFxuXHR0aGlzLm5vZGUgPSBub2RlO1xuXHR0aGlzLmF2YWlsYWJsZUNoYW5uZWxzID0gW107XG5cdHRoaXMudXNlZENoYW5uZWxzID0gW107XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscyA9IFtdO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucyA9IFtdO1xuXG5cdHRoaXMucGVlcnMgPSBbXTtcblx0XG5cdHRoaXMuaWQgPSAtMTtcbn1cblxuUlRDLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihuYW1lX3JlZ2V4LCBvbm9wZW5fY2FsbGJhY2spe1xuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goe3JlZ2V4OiBuYW1lX3JlZ2V4LCBjYjogb25vcGVuX2NhbGxiYWNrfSk7XG59XG5cblJUQy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgcHJvbUlEIGluIHRoaXMucGVlcnMpe1xuXHRcdHRoaXMucGVlcnNbcHJvbUlEXS5jbG9zZSgpO1xuXHRcdGRlbGV0ZSB0aGlzLnBlZXJzW3Byb21JRF07XG5cdH1cbn1cblxuUlRDLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBzdWIgPSB0aGlzLm5vZGUubGlzdGVuKHtcblx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRmdW5jOiAnTGlzdENoYW5uZWxzJ1xuXHR9LFxuXHRmdW5jdGlvbihkYXRhKXtcblx0XHQvL01hdGNoIHJlY2VpdmVkIGNoYW5uZWxzIHdpdGggcmVxdWVzdGVkIGNoYW5uZWxzXG5cdFx0dmFyIGNoYW5uZWxzID0gdGhhdC5fbWF0Y2hDaGFubmVscyhkYXRhLmNoYW5uZWxzKTtcblx0XHQvL0luaXRpYXRlIGEgbmV3IENvbm5lY3Rpb25cblx0XHR0aGF0Ll9kb0Nvbm5lY3QoY2hhbm5lbHMpO1x0XHRcblx0fSk7XG5cblx0dGhpcy5zdWJzY3JpcHRpb25zLnB1c2goc3ViKTtcbn1cblxuXG5SVEMucHJvdG90eXBlLl9tYXRjaENoYW5uZWxzID0gZnVuY3Rpb24ocmVjZWl2ZWRDaGFubmVscyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvL0NvbnRhaW5zIGFsbCBjaGFubmVscyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIENvbm5lY3QgYXMgb2JqZWN0c1xuXHR2YXIgY2hhbm5lbHMgPSBbXTtcblxuXHRmb3IodmFyIGkgPSAwOyBpIDwgcmVjZWl2ZWRDaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIG5hbWUgPSByZWNlaXZlZENoYW5uZWxzW2ldO1xuXHRcdFxuXHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGF0LnJlcXVlc3RlZENoYW5uZWxzLmxlbmd0aDsgaisrKXtcblx0XHRcdHZhciByZXEgPSB0aGF0LnJlcXVlc3RlZENoYW5uZWxzW2pdO1xuXHRcdFx0XG5cdFx0XHRpZihuYW1lICYmIG5hbWUubWF0Y2gocmVxLnJlZ2V4KSl7XG5cdFx0XHRcdHRoYXQudXNlZENoYW5uZWxzW25hbWVdID0gbmV3IENoYW5uZWwobmFtZSwgcmVxLmNiKTtcblx0XHRcdFx0Y2hhbm5lbHMucHVzaChuYW1lKTsgLy9wcmVwYXJlIHRoZSBjb25uZWN0IG9iamVjdCBsaXN0XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGNoYW5uZWxzO1xufTtcblxuUlRDLnByb3RvdHlwZS5fZG9Db25uZWN0ID0gZnVuY3Rpb24oY2hhbm5lbHMpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0Y29uc29sZS5sb2coY2hhbm5lbHMpO1xuXG5cdHZhciBzdWIgPSB0aGlzLm5vZGUubGlzdGVuKHtcblx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRmdW5jOiAnQ29ubmVjdCcsXG5cdFx0b2JqOiBjaGFubmVsc1xuXHR9LFxuXHRmdW5jdGlvbihkYXRhKXtcblx0XHR0aGF0Ll9oYW5kbGVOZWdvY2lhdGlvbk1lc3NhZ2UoZGF0YSk7XG5cdH0pO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1Yik7XG59O1xuXG5cblJUQy5wcm90b3R5cGUuX2hhbmRsZU5lZ29jaWF0aW9uTWVzc2FnZSA9IGZ1bmN0aW9uKG1zZyl7XG5cblx0aWYobXNnLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZU9mZmVyJyl7XG5cdFx0dGhpcy5wZWVyc1ttc2cucHJvbUlEXSA9IHRoaXMuX2NyZWF0ZVBlZXIobXNnKTtcblx0fWVsc2UgaWYobXNnLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZUlDRUNhbmRpZGF0ZScpe1xuXHRcdHRoaXMuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZSh0aGlzLnBlZXJzW21zZy5wcm9tSURdLCBtc2cpO1xuXHR9XG59O1xuXG52YXIgc2VydmVycyA9IHtcImljZVNlcnZlcnNcIjogW3tcInVybFwiOiBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIn1dfTtcblJUQy5wcm90b3R5cGUuX2NyZWF0ZVBlZXIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBwZWVyID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKHNlcnZlcnMsIHttYW5kYXRvcnk6IFt7RHRsc1NydHBLZXlBZ3JlZW1lbnQ6IHRydWV9LCB7RW5hYmxlRHRsc1NydHA6IHRydWV9XX0pO1xuXG5cdHBlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7c2RwOiBkYXRhLnNkcCwgdHlwZTogZGF0YS50eXBlfSkpO1xuXG5cdGNvbnNvbGUubG9nKFwiY3JlYXRlIGFuc3dlclwiKTtcblxuXHRwZWVyLmNyZWF0ZUFuc3dlcihmdW5jdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKXtcblx0XHRwZWVyLnNldExvY2FsRGVzY3JpcHRpb24oc2Vzc2lvbl9kZXNjcmlwdGlvbik7XG5cblx0XHR0aGF0Lm5vZGUuZ2V0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0Fuc3dlcicsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0c2RwOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcCxcblx0XHRcdFx0dHlwZTogc2Vzc2lvbl9kZXNjcmlwdGlvbi50eXBlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZ1bmN0aW9uKGVycil7XG5cdFx0Y29uc29sZS5sb2coXCJjYW5ub3QgY3JlYXRlIGFuc3dlclwiKTtcblx0fSwgXG5cdHsgJ21hbmRhdG9yeSc6IHsgJ09mZmVyVG9SZWNlaXZlQXVkaW8nOiB0cnVlLCAnT2ZmZXJUb1JlY2VpdmVWaWRlbyc6IHRydWUgfSB9KTtcblxuXG5cdHBlZXIub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnY29ubmVjdGVkJyl7XG5cdFx0XHQvL1VucmVnaXN0ZXIgbGlzdGVuZXJzXG5cdFx0XHQvL3RoYXQuX3Vuc3Vic2NyaWJlQWxsKCk7XG5cdFx0fWVsc2UgaWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdkaXNjb25uZWN0ZWQnKXtcblx0XHRcdC8vdHJ5IHJlY29ubmVjdFxuXHRcdH1cblx0fVxuXG5cdHBlZXIub25pY2VjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpe1xuXHRcdFxuXHRcdHRoYXQubm9kZS5nZXQoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnSUNFQ2FuZGlkYXRlJyxcblx0XHRcdGRhdGE6e1xuXHRcdFx0XHRwZWVySWQ6IGRhdGEucGVlcklkLFxuXHRcdFx0XHRwcm9tSUQ6IGRhdGEucHJvbUlELFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuX29uRGF0YUNoYW5uZWwoZXZ0LmNoYW5uZWwpO1xuXHR9O1xuXG5cdHBlZXIub25hZGRzdHJlYW0gPSBmdW5jdGlvbihldnQpe1xuXHRcdGNvbnNvbGUubG9nKFwiT04gQUREIFNUUkVBTVwiKTtcblx0XHR2YXIgcmVtb3RlVmlldyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbXl2aWRcIik7XG5cdFx0cmVtb3RlVmlldy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGV2dC5zdHJlYW0pO1xuXHR9O1xuXG5cdHBlZXIucHJvbUlEID0gZGF0YS5wcm9tSUQ7XG5cblx0cmV0dXJuIHBlZXI7XG59XG5cblJUQy5wcm90b3R5cGUuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKHBlZXIsIGRhdGEpe1xuXHR0cnl7XG5cdFx0dmFyIGNhbmRpZGF0ZSA9IG5ldyBSVENJY2VDYW5kaWRhdGUoZGF0YS5jYW5kaWRhdGUpO1xuXHRcdHBlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSxmdW5jdGlvbigpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJjYW5kaWRhdGUgYWRkZWQgKFwiK3BlZXIuaWNlQ29ubmVjdGlvblN0YXRlK1wiKVwiKTtcblx0XHR9LGZ1bmN0aW9uKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0fSk7XG5cdH1jYXRjaChlKSB7Y29uc29sZS5sb2coZSk7fVxufVxuXG5SVEMucHJvdG90eXBlLl91bnN1YnNjcmliZUFsbCA9IGZ1bmN0aW9uKCl7XG5cdHdoaWxlKHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGgpe1xuXHRcdHRoaXMubm9kZS5zdG9wTGlzdGVuaW5nKHRoaXMuc3Vic2NyaXB0aW9ucy5wb3AoKSk7XG5cdH1cbn1cblxuUlRDLnByb3RvdHlwZS5fb25DbG9zZSA9IGZ1bmN0aW9uKCl7XG5cbn1cblxuUlRDLnByb3RvdHlwZS5fb25EYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKGRhdGFjaGFubmVsKXtcblx0Y29uc29sZS5sb2coXCJDaGFubmVsIFwiK2RhdGFjaGFubmVsLmxhYmVsK1wiIGNyZWF0ZWQgIVwiKTtcblxuXHR2YXIgY2hhbm5lbCA9IHRoaXMudXNlZENoYW5uZWxzW2RhdGFjaGFubmVsLmxhYmVsXTtcblx0aWYoIWNoYW5uZWwpe1xuXHRcdGRhdGFjaGFubmVsLmNsb3NlKCk7XG5cdFx0cmV0dXJuIDtcblx0fVxuXG5cdGNoYW5uZWwuc2V0Q2hhbm5lbChkYXRhY2hhbm5lbCk7XG59XG5cblxudmFyIGV4cCA9IHtcblx0XHRSVEM6IFJUQ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDsgXG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuZnVuY3Rpb24gVGltZXIocGVyaW9kLCBvbnRpbWUpe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ3RpbWVyJyk7XG5cdFxuXHR0aGlzLnBlcmlvZCA9IHBlcmlvZDtcblx0dGhpcy5vbnRpbWUgPSBvbnRpbWU7XG5cdFxuXHRpZihwZXJpb2Qpe1xuXHRcdHRoaXMubG9vcCA9IHRydWU7XG5cdFx0dGhpcy5wZXJtYW5lbnQgPSB0cnVlO1xuXHR9XG59XG51dGlsLmluaGVyaXRzKFRpbWVyLCBNZXNzYWdlKTtcblxuVGltZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gVGltZXIuc3VwZXJfLnByb3RvdHlwZS5leGVjLmNhbGwodGhpcywge1xuXHRcdGxvb3A6IHRoaXMubG9vcCxcblx0XHRwZXJpb2Q6IHRoaXMucGVyaW9kXG5cdH0pO1xufVxuXG5UaW1lci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKXtcblx0aWYoISBkYXRhKSByZXR1cm4gO1xuXHRpZihkYXRhLmN1cnJlbnRUaW1lKXtcblx0XHR0aGlzLm9udGltZShkYXRhLmN1cnJlbnRUaW1lKTtcblx0fVxufVxuXG5cblxudmFyIHRpbWVyID0ge1xuXHRcdFRpbWVyOiBUaW1lclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWVyO1xuIiwiLyogZGl5YS1zZGtcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG5mdW5jdGlvbiBMaXN0U2VydmljZXMoY2FsbGJhY2spe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ3dhdGNoZG9nJywgJ0xpc3RTZXJ2aWNlcycpO1xuXG5cdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbn1cbnV0aWwuaW5oZXJpdHMoTGlzdFNlcnZpY2VzLCBNZXNzYWdlKTtcblxuTGlzdFNlcnZpY2VzLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIExpc3RTZXJ2aWNlcy5zdXBlcl8ucHJvdG90eXBlLmV4ZWMuY2FsbCh0aGlzKTtcbn1cblxuTGlzdFNlcnZpY2VzLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnNlcnZpY2VzICYmIHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2soZGF0YS5zZXJ2aWNlcyk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdExpc3RTZXJ2aWNlczogTGlzdFNlcnZpY2VzXG59XG5cbiJdfQ==
