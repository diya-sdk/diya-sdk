!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.diya=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
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

},{}],"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
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

},{}],"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/support/isBufferBrowser.js":[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/util.js":[function(require,module,exports){
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
},{"./support/isBuffer":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/support/isBufferBrowser.js","_process":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/process/browser.js","inherits":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/home/sylvain/dev/diya-sdk/src/diya-sdk.js":[function(require,module,exports){
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
				//If the subscription was closed, call listener with null data, then remove the handler
				registeredListeners[msg.subId](null);
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

},{"./services/auth/auth":"/home/sylvain/dev/diya-sdk/src/services/auth/auth.js","./services/discover/discover":"/home/sylvain/dev/diya-sdk/src/services/discover/discover.js","./services/message":"/home/sylvain/dev/diya-sdk/src/services/message.js","./services/promethe/promethe":"/home/sylvain/dev/diya-sdk/src/services/promethe/promethe.js","./services/qei/qei":"/home/sylvain/dev/diya-sdk/src/services/qei/qei.js","./services/rtc/rtc":"/home/sylvain/dev/diya-sdk/src/services/rtc/rtc.js","./services/timer/timer":"/home/sylvain/dev/diya-sdk/src/services/timer/timer.js","./services/watchdog/watchdog":"/home/sylvain/dev/diya-sdk/src/services/watchdog/watchdog.js"}],"/home/sylvain/dev/diya-sdk/src/services/auth/auth.js":[function(require,module,exports){
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

},{"../message":"/home/sylvain/dev/diya-sdk/src/services/message.js","util":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/util.js"}],"/home/sylvain/dev/diya-sdk/src/services/discover/discover.js":[function(require,module,exports){
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
},{}],"/home/sylvain/dev/diya-sdk/src/services/message.js":[function(require,module,exports){
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

},{}],"/home/sylvain/dev/diya-sdk/src/services/promethe/promethe.js":[function(require,module,exports){
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
},{"../rtc/rtc":"/home/sylvain/dev/diya-sdk/src/services/rtc/rtc.js"}],"/home/sylvain/dev/diya-sdk/src/services/qei/qei.js":[function(require,module,exports){
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
 * 			range: [FLOAT, FLOAT],
 *      threshold: FLOAT,
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
QEI.prototype.getDataThreshold = function(){
	return this.dataModel.threshold;
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
		if(data>qualityConfig.threshold)
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
					/* update data unit */
					dataModel[n].unit=data[n].unit;
					/* update data threshold */
					dataModel[n].qualityConfig={threshold: data[n].threshold};

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
					/* update data unit */
					dataModel[n].unit=data[n].unit;
					/* update data threshold */
					dataModel[n].qualityConfig={threshold: data[n].threshold};

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

},{"../message":"/home/sylvain/dev/diya-sdk/src/services/message.js","util":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/util.js"}],"/home/sylvain/dev/diya-sdk/src/services/rtc/rtc.js":[function(require,module,exports){
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
	while(this.usedChannels.length){
		this.usedChannels.pop().close();
	}

	for(var promID in this.peers){
		this.peers[promID].close();
		delete this.peers[promID];
	}

	if(typeof this.onclose === 'function') this.onclose();
}

RTC.prototype.connect = function(){
	var that = this;
	var foundChannels = false;

	var sub = this.node.listen({
		service: 'rtc',
		func: 'ListChannels'
	},
	function(data){
		if(data){
			console.log("data");
			console.log(data);
			if(data.channels && data.channels.length > 0){
				foundChannels = true;
				//Match received channels with requested channels
				var channels = that._matchChannels(data.channels);
				//Initiate a new Connection
				that._doConnect(channels);
			}
		}else{
			if(!foundChannels){
				that.disconnect();
			}
		}
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
			that._unsubscribeAll();
		}else if(peer.iceConnectionState === 'disconnected'){
			//notify user
			that.disconnect();
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

},{"../message":"/home/sylvain/dev/diya-sdk/src/services/message.js","util":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/util.js"}],"/home/sylvain/dev/diya-sdk/src/services/timer/timer.js":[function(require,module,exports){
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

},{"../message":"/home/sylvain/dev/diya-sdk/src/services/message.js","util":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/util.js"}],"/home/sylvain/dev/diya-sdk/src/services/watchdog/watchdog.js":[function(require,module,exports){
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


},{"../message":"/home/sylvain/dev/diya-sdk/src/services/message.js","util":"/home/sylvain/dev/diya-sdk/node_modules/browserify/node_modules/util/util.js"}]},{},["/home/sylvain/dev/diya-sdk/src/diya-sdk.js"])("/home/sylvain/dev/diya-sdk/src/diya-sdk.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9zcmMvc2VydmljZXMvYXV0aC9hdXRoLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL2Rpc2NvdmVyL2Rpc2NvdmVyLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL21lc3NhZ2UuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9zcmMvc2VydmljZXMvcHJvbWV0aGUvcHJvbWV0aGUuanMiLCIvaG9tZS9zeWx2YWluL2Rldi9kaXlhLXNkay9zcmMvc2VydmljZXMvcWVpL3FlaS5qcyIsIi9ob21lL3N5bHZhaW4vZGV2L2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3RpbWVyL3RpbWVyLmpzIiwiL2hvbWUvc3lsdmFpbi9kZXYvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3dhdGNoZG9nL3dhdGNoZG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKiBEaXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG52YXIgbWVzc2FnZSA9IHJlcXVpcmUoJy4vc2VydmljZXMvbWVzc2FnZScpO1xuXG4vL1NlcnZpY2VzXG52YXIgYXV0aCA9IHJlcXVpcmUoJy4vc2VydmljZXMvYXV0aC9hdXRoJyk7XG52YXIgdGltZXIgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3RpbWVyL3RpbWVyJyk7XG52YXIgcnRjID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9ydGMvcnRjJyk7XG52YXIgUHJvbWV0aGUgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3Byb21ldGhlL3Byb21ldGhlJyk7XG52YXIgd2F0Y2hkb2cgPSByZXF1aXJlKCcuL3NlcnZpY2VzL3dhdGNoZG9nL3dhdGNoZG9nJyk7XG52YXIgZGlzY292ZXIgPSByZXF1aXJlKCcuL3NlcnZpY2VzL2Rpc2NvdmVyL2Rpc2NvdmVyJyk7XG52YXIgcWVpID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9xZWkvcWVpJyk7XG5cbnZhciBXZWJTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0IHx8IHdpbmRvdy5Nb3pXZWJTb2NrZXQ7XG5cblxuXG4gXG5cbmZ1bmN0aW9uIERpeWEoYWRkcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dmFyIHNvY2tldDtcdFxuXG5cdHZhciBjbG9zZV9jYiA9IG51bGw7XG5cblx0dmFyIHBlbmRpbmdSZXF1ZXN0cyA9IFtdO1xuXHR2YXIgcmVnaXN0ZXJlZExpc3RlbmVycyA9IFtdO1xuXG5cdHZhciBuZXh0UmVxSWQgPSAtMTtcblx0ZnVuY3Rpb24gY29uc3VtZU5leHRSZXFJZCgpe1xuXHRcdG5leHRSZXFJZCsrO1xuXHRcdHJldHVybiBuZXh0UmVxSWQ7XG5cdH1cblxuXHR2YXIgbmV4dFN1YnNjcmlwdGlvbklkID0gLTE7XG5cdGZ1bmN0aW9uIGNvbnN1bWVOZXh0U3Vic2NyaXB0aW9uSWQoKXtcblx0XHRuZXh0U3Vic2NyaXB0aW9uSWQrKztcblx0XHRyZXR1cm4gbmV4dFN1YnNjcmlwdGlvbklkO1xuXHR9XG5cdFxuXHRmdW5jdGlvbiBkaXNwYXRjaChtc2cpe1xuXG5cdFx0aWYobXNnLnJlcUlkICE9PSB1bmRlZmluZWQpe1xuXHRcdFx0ZGlzcGF0Y2hSZXF1ZXN0KG1zZyk7XG5cdFx0fWVsc2UgaWYobXNnLnN1YklkICE9PSB1bmRlZmluZWQpe1xuXHRcdFx0ZGlzcGF0Y2hFdmVudChtc2cpO1xuXHRcdH1cblx0XHQvL0lmIHRoZSBtc2cgZG9lc24ndCBoYXZlIGEgcmVxSWQsIGl0IGNhbm5vdCBiZSBtYXRjaGVkIHRvIGEgcGVuZGluZyByZXF1ZXN0XG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZygnbWlzc2luZyByZXFJZCBvciBzdWJJZC4gSWdub3JpbmcgbXNnIDogJyk7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHRcblx0fVxuXG5cdGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChtc2cpe1xuXHRcdC8vSWYgbXNnLnJlcUlkIGNvcnJlc3BvbmRzIHRvIGEgcGVuZGluZyByZXF1ZXN0LCBleGVjdXRlIHRoZSByZXNwb25zZSBjYWxsYmFja1xuXHRcdGlmKHR5cGVvZiBwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXSA9PT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXG5cdFx0XHQvL2V4ZWN1dGUgdGhlIHJlc3BvbnNlIGNhbGxiYWNrLCBwYXNzIHRoZSBtZXNzYWdlIGRhdGEgYXMgYXJndW1lbnRcblx0XHRcdHBlbmRpbmdSZXF1ZXN0c1ttc2cucmVxSWRdKG1zZy5kYXRhKTtcblx0XHRcdGRlbGV0ZSBwZW5kaW5nUmVxdWVzdHNbbXNnLnJlcUlkXTtcblx0XHR9ZWxzZXtcblx0XHRcdC8vTm8gcGVuZGluZyByZXF1ZXN0IGZvciB0aGlzIHJlcUlkLCBpZ25vcmluZyByZXNwb25zZVxuXHRcdFx0Y29uc29sZS5sb2coJ21zZy5yZXFJZCBkb2VzblxcJ3QgbWF0Y2ggYW55IHBlbmRpbmcgcmVxdWVzdCwgSWdub3JpbmcgbXNnICEgJyttc2cpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KG1zZyl7XG5cdFx0Ly9JZiBtc2cuc3ViSWQgY29ycmVzcG9uZHMgdG8gYSByZWdpc3RlcmVkIGxpc3RlbmVyLCBleGVjdXRlIHRoZSBldmVudCBjYWxsYmFja1xuXHRcdGlmKHR5cGVvZiByZWdpc3RlcmVkTGlzdGVuZXJzW21zZy5zdWJJZF0gPT09ICdmdW5jdGlvbicpe1xuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0Ly9leGVjdXRlIHRoZSBldmVudCBjYWxsYmFjaywgcGFzcyB0aGUgbWVzc2FnZSBkYXRhIGFzIGFyZ3VtZW50XG5cdFx0XHRpZighbXNnLnJlc3VsdCB8fCBtc2cucmVzdWx0ICE9ICdjbG9zZWQnKXtcblx0XHRcdFx0cmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdKG1zZy5kYXRhKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHQvL0lmIHRoZSBzdWJzY3JpcHRpb24gd2FzIGNsb3NlZCwgY2FsbCBsaXN0ZW5lciB3aXRoIG51bGwgZGF0YSwgdGhlbiByZW1vdmUgdGhlIGhhbmRsZXJcblx0XHRcdFx0cmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdKG51bGwpO1xuXHRcdFx0XHRkZWxldGUgcmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdO1xuXHRcdFx0fVxuXG5cblx0XHR9ZWxzZXtcblx0XHRcdC8vTm8gcGVuZGluZyByZXF1ZXN0IGZvciB0aGlzIHN1YklkLCBpZ25vcmluZyBldmVudFxuXHRcdFx0Y29uc29sZS5sb2coJ21zZy5zdWJJZCBkb2VzblxcJ3QgbWF0Y2ggYW55IHJlZ2lzdGVyZWQgbGlzdGVuZXJzLCBJZ25vcmluZyBtc2cgISAnK21zZyk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblx0fVxuXHRcblx0XG5cdGZ1bmN0aW9uIHNlbmQobXNnKXtcblx0XHRpZihzb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NJTkcgfHwgc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJkaXlhLVNESyA6IGNhbm5vdCBzZW5kIG1lc3NhZ2UgLT4gc29ja2V0IGNsb3NlZFwiKTtcblx0XHR9XG5cdFx0dHJ5e1xuXHRcdFx0ZGF0YSA9IEpTT04uc3RyaW5naWZ5KG1zZyk7XG5cdFx0XHRzb2NrZXQuc2VuZChkYXRhKTtcblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZygnbWFsZm9ybWVkIEpTT04sIGlnbm9yaW5nIG1zZy4uLicpO1xuXHRcdH1cblx0fVx0XG5cdFxuXHRmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGluY29taW5nTWVzc2FnZSl7XG5cdFx0dmFyIG1zZztcblxuXHRcdHRyeXtcblx0XHRcdG1zZyA9IEpTT04ucGFyc2UoaW5jb21pbmdNZXNzYWdlLmRhdGEpO1xuXHRcdH1jYXRjaChlKXtcblx0XHRcdGNvbnNvbGUubG9nKFwibWFsZm9ybWVkIEpTT05cIik7XG5cdFx0XHQgXG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblx0XHRcblx0XHRkaXNwYXRjaChtc2cpO1xuXG5cdH07XG5cdFxuXHRmdW5jdGlvbiBjbG9zZUFsbCgpe1xuXHRcdHdoaWxlKHBlbmRpbmdSZXF1ZXN0cy5sZW5ndGgpe1xuXHRcdFx0cGVuZGluZ1JlcXVlc3RzLnBvcCgpO1xuXHRcdH1cblx0XHR3aGlsZShyZWdpc3RlcmVkTGlzdGVuZXJzLmxlbmd0aCl7XG5cdFx0XHRyZWdpc3RlcmVkTGlzdGVuZXJzLnBvcCgpO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKGNsb3NlX2NiKTtcblxuXHRcdGlmKHR5cGVvZiBjbG9zZV9jYiA9PT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRjbG9zZV9jYigpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2UocGFyYW1zKXtcblx0XHRpZighcGFyYW1zLnNlcnZpY2UpIHJldHVybiBudWxsO1xuXHRcdGVsc2UgcmV0dXJuIHtcblx0XHRcdHNlcnZpY2U6IHBhcmFtcy5zZXJ2aWNlLFxuXHRcdFx0ZnVuYzogcGFyYW1zLmZ1bmMgPyBwYXJhbXMuZnVuYyA6IHVuZGVmaW5lZCxcblx0XHRcdG9iajogcGFyYW1zLm9iaiA/IHBhcmFtcy5vYmogOiB1bmRlZmluZWQsXG5cdFx0XHRkYXRhOiBwYXJhbXMuZGF0YSA/IHBhcmFtcy5kYXRhIDogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vUHVibGljIEFQSS8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcblx0dGhpcy5jb25uZWN0ID0gZnVuY3Rpb24oY2FsbGJhY2ssIGFyZ3Mpe1xuXHRcdHRyeXtcblx0XHRcdHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYWRkcik7XG5cblx0XHRcdHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGNhbGxiYWNrKFwiQ2Fubm90IENvbm5lY3RcIiwgbnVsbCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBhcmdzKTtcblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihpbmNvbWluZ01lc3NhZ2Upe1xuXHRcdFx0XHRoYW5kbGVNZXNzYWdlKGluY29taW5nTWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0Y2xvc2VBbGwoKTtcblx0XHRcdH1cblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNhbid0IGNvbm5lY3QgdG8gXCIrYWRkcik7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuZ2V0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjayl7XG5cdFx0dmFyIG1zZyA9IGNyZWF0ZU1lc3NhZ2UocGFyYW1zKTtcblx0XHRpZihtc2cgPT09IG51bGwpIHJldHVybiA7XG5cblx0XHRtc2cucmVxSWQgPSBjb25zdW1lTmV4dFJlcUlkKCk7XG5cdFx0cGVuZGluZ1JlcXVlc3RzW21zZy5yZXFJZF0gPSBjYWxsYmFjaztcblxuXHRcdHNlbmQobXNnKTtcblx0fVxuXG5cdHRoaXMubGlzdGVuID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjayl7XG5cdFx0dmFyIG1zZyA9IGNyZWF0ZU1lc3NhZ2UocGFyYW1zKTtcblx0XHRpZihtc2cgPT09IG51bGwpIHJldHVybiA7XG5cblx0XHRtc2cuc3ViSWQgPSBjb25zdW1lTmV4dFN1YnNjcmlwdGlvbklkKCk7XG5cdFx0cmVnaXN0ZXJlZExpc3RlbmVyc1ttc2cuc3ViSWRdID0gY2FsbGJhY2s7XG5cdFx0XG5cdFx0c2VuZChtc2cpO1xuXG5cdFx0cmV0dXJuIG1zZy5zdWJJZDtcblx0fVxuXG5cdHRoaXMuY2xvc2VDYWxsYmFjayA9IGZ1bmN0aW9uKGNiKXtcblx0XHRjbG9zZV9jYiA9IGNiO1xuXHR9XG5cblx0dGhpcy5zdG9wTGlzdGVuaW5nID0gZnVuY3Rpb24oc3ViSWQpe1xuXHRcdG1zZyA9IHtcblx0XHRcdGZ1bmM6ICdVbnN1YnNjcmliZScsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHN1YklkOiBzdWJJZFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHNlbmQobXNnKTtcblx0fVxuXG5cdHRoaXMuY29ubmVjdGVkID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gISAoc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEKTtcblx0fVxuXG5cdHRoaXMuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdFx0c29ja2V0LmNsb3NlKCk7XG5cdH1cblx0XG59XG5cblxuZnVuY3Rpb24gRGl5YUNsaWVudChhZGRyLCB1c2VyLCBwYXNzd29yZCl7XG5cblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUoKXtcblx0XHR2YXIgbm9kZSA9IG5ldyBkaXlhLkRpeWEoYWRkcik7XG5cdFx0Ly9ub2Rlcy5wdXNoKG5vZGUpO1xuXG5cdFx0cmV0dXJuIG5vZGU7XG5cdH1cblxuXHR0aGlzLnNldEFkZHJlc3MgPSBmdW5jdGlvbihhZGRyZXNzKXtcblx0XHRhZGRyID0gYWRkcmVzcztcblx0fVxuXG5cdHRoaXMuY3JlYXRlU2Vzc2lvbiA9IGZ1bmN0aW9uKG9uY29ubmVjdGVkLCBvbmZhaWx1cmUpe1xuXHRcdHZhciBub2RlID0gY3JlYXRlTm9kZSgpO1xuXG5cdFx0bm9kZS5jb25uZWN0KGZ1bmN0aW9uKGVycil7XG5cdFx0XHRpZihlcnIpe1xuXHRcdFx0XHRvbmZhaWx1cmUoZXJyKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRub2RlLmdldCh7XG5cdFx0XHRcdFx0c2VydmljZTogJ2F1dGgnLFxuXHRcdFx0XHRcdGZ1bmM6ICdBdXRoZW50aWNhdGUnLFxuXHRcdFx0XHRcdGRhdGE6IHt1c2VyOiB1c2VyLCBwYXNzd29yZDogcGFzc3dvcmR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRcdFx0aWYocmVzLmF1dGhlbnRpY2F0ZWQgfHwgKHJlcy5lcnJvciAmJiByZXMuZXJyb3IgPT09ICdTZXJ2aWNlTm90Rm91bmQnKSkgb25jb25uZWN0ZWQobm9kZSk7XG5cdFx0XHRcdFx0ZWxzZSBvbmZhaWx1cmUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fVxuXHRcbn1cblxuXG52YXIgZGl5YSA9IHtcblx0XHREaXlhQ2xpZW50OiBEaXlhQ2xpZW50LFxuXHRcdERpeWE6IERpeWEsXG5cdFx0YXV0aDogYXV0aCxcblx0XHR0aW1lcjogdGltZXIsXG5cdFx0cnRjOiBydGMsXG5cdFx0UHJvbWV0aGU6IFByb21ldGhlLFxuXHRcdHdhdGNoZG9nOiB3YXRjaGRvZyxcblx0XHRkaXNjb3ZlcjogZGlzY292ZXIsXG5cdFx0cWVpOiBxZWlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXlhO1xuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbmZ1bmN0aW9uIEF1dGhlbnRpY2F0ZSh1c2VyLCBwYXNzd29yZCwgY2FsbGJhY2spe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ2F1dGgnLCAnQXV0aGVudGljYXRlJyk7XG5cdFxuXHR0aGlzLnVzZXIgPSB1c2VyO1xuXHR0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG5cdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbn1cbnV0aWwuaW5oZXJpdHMoQXV0aGVudGljYXRlLCBNZXNzYWdlKTtcblxuQXV0aGVudGljYXRlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIEF1dGhlbnRpY2F0ZS5zdXBlcl8ucHJvdG90eXBlLmV4ZWMuY2FsbCh0aGlzLCB7XG5cdFx0XHR1c2VyOiB0aGlzLnVzZXIsXG5cdFx0XHRwYXNzd29yZDogdGhpcy5wYXNzd29yZFxuXHR9KTtcbn1cblxuQXV0aGVudGljYXRlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLmF1dGhlbnRpY2F0ZWQgIT0gdW5kZWZpbmVkKXtcblx0XHR0aGlzLmNhbGxiYWNrKGRhdGEuYXV0aGVudGljYXRlZCk7XG5cdH1cbn1cblxuXG52YXIgY29yZSA9IHtcblx0XHRBdXRoZW50aWNhdGU6IEF1dGhlbnRpY2F0ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmU7XG4iLCJ2YXIgZGdyYW07XG5cbnZhciBuZXR3b3JrSWRSZXF1ZXN0ID0gJ2RpeWEtbmV0d29yay1pZFxcbic7XG5cbnZhciBzb2NrZXQ7XG52YXIgY2FsbGJhY2tzID0gW107XG52YXIgZGl5YXMgPSBbXTtcblxuXG52YXIgc3RhdGUgPSAnc3RvcHBlZCc7XG5cbmZ1bmN0aW9uIGlzTm9kZSgpe1xuXHRpZihkZ3JhbSkgcmV0dXJuIHRydWU7XG5cdHRyeXtcblx0XHRkZ3JhbSA9IHJlcXVpcmUoJ2RncmFtJysnJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1jYXRjaChlKXtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdGVuKGNhbGxiYWNrKXtcblx0aWYoIWlzTm9kZSgpKSByZXR1cm4gO1xuXHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFxufVxuXG5mdW5jdGlvbiByZW1vdmVPdXRkYXRlZERpeWFzKCl7XG5cdGZvcih2YXIgaT0wO2k8ZGl5YXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZGl5YXNbaV0udG91Y2ggPiAxMDAwMCl7XG5cdFx0XHRkaXlhcy5zcGxpY2UoaSwgMSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldERpeWEobmFtZSwgcG9ydCwgYWRkcmVzcyl7XG5cdGZvcih2YXIgaT0wOyBpPGRpeWFzLmxlbmd0aDsgaSsrKXtcblx0XHRpZihkaXlhc1tpXS5uYW1lID09PSBuYW1lICYmIGRpeWFzW2ldLmFkZHIgPT09IGFkZHJlc3MrJzonK3BvcnQpe1xuXHRcdFx0cmV0dXJuIGRpeWFzW2ldO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ290RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKXtcblxuXG5cdHZhciBkaXlhID0gZ2V0RGl5YShuYW1lLCBwb3J0LCBhZGRyZXNzKTtcblx0aWYoIWRpeWEpe1xuXHRcdGRpeWEgPSB7bmFtZTogbmFtZSwgYWRkcjogYWRkcmVzcysnOicrcG9ydH07XG5cdFx0ZGl5YXMucHVzaChkaXlhKTtcblx0fVxuXHRkaXlhLnRvdWNoID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQW5zd2VyKG5hbWUsIHBvcnQsIGFkZHJlc3Mpe1xuXHRmb3IodmFyIGk9MDtpPGNhbGxiYWNrcy5sZW5ndGg7aSsrKXtcblx0XHRjYWxsYmFja3NbaV0obmFtZSwgcG9ydCwgYWRkcmVzcyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVxdWVzdCgpe1xuXHRzb2NrZXQuc2VuZChuZXR3b3JrSWRSZXF1ZXN0LCAwLCBuZXR3b3JrSWRSZXF1ZXN0Lmxlbmd0aCwgMjAwMCwgJzI1NS4yNTUuMjU1LjI1NScpO1xufVxuXG5mdW5jdGlvbiBzdGFydCgpe1xuXHRpZighaXNOb2RlKCkpIHJldHVybiA7XG5cblx0c3RhdGUgPSAnc3RhcnRlZCc7XG5cblx0aWYoIXNvY2tldCl7XG5cdFx0c29ja2V0ID0gZGdyYW0uY3JlYXRlU29ja2V0KCd1ZHA0Jyk7XG5cblx0XHRzb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihkYXRhLCByaW5mbyl7XG5cdFx0XHR2YXIgbXNnID0gZGF0YS50b1N0cmluZygnYXNjaWknKTtcblx0XHRcdHZhciBwYXJhbXMgPSBtc2cuc3BsaXQoJzonKTtcblx0XHRcdFxuXHRcdFx0aWYocGFyYW1zLmxlbmd0aCA9PSAyKXtcblx0XHRcdFx0Z290RGl5YShwYXJhbXNbMF0sIHBhcmFtc1sxXSwgcmluZm8uYWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2xpc3RlbmluZycsIGZ1bmN0aW9uKCl7XG5cdFx0XHRzb2NrZXQuc2V0QnJvYWRjYXN0KHRydWUpO1x0XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb0Rpc2NvdmVyKCl7XG5cdFx0cmVxdWVzdCgpO1xuXHRcdHJlbW92ZU91dGRhdGVkRGl5YXMoKTtcblxuXHRcdGlmKHN0YXRlID09PSAnc3RhcnRlZCcpIHNldFRpbWVvdXQoZG9EaXNjb3ZlciwgMTAwMCk7XG5cdH1cblx0ZG9EaXNjb3ZlcigpO1xuXG5cbn1cblxuZnVuY3Rpb24gc3RvcCgpe1xuXG5cdHN0YXRlID0gJ3N0b3BwZWQnO1xuXG5cdGlmKHNvY2tldCkgc29ja2V0LmNsb3NlKCk7XG5cdHdoaWxlKGNhbGxiYWNrcy5sZW5ndGgpe1xuXHRcdGNhbGxiYWNrcy5wb3AoKTtcblx0fVxufVxuXG5cbmZ1bmN0aW9uIGF2YWlsYWJsZURpeWFzKCl7XG5cdHJldHVybiBkaXlhcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHN0YXJ0OiBzdGFydCxcblx0c3RvcDogc3RvcCxcblx0bGlzdGVuOiBsaXN0ZW4sXG5cdGlzRGlzY292ZXJhYmxlOiBpc05vZGUsXG5cdGF2YWlsYWJsZURpeWFzOiBhdmFpbGFibGVEaXlhc1xufSIsIi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxuZnVuY3Rpb24gTWVzc2FnZShzZXJ2aWNlLCBmdW5jLCBvYmosIHBlcm1hbmVudCl7XG5cblx0dGhpcy5zZXJ2aWNlID0gc2VydmljZTtcblx0dGhpcy5mdW5jID0gZnVuYztcblx0dGhpcy5vYmogPSBvYmo7XG5cdFxuXHR0aGlzLnBlcm1hbmVudCA9IHBlcm1hbmVudDsgLy9JZiB0aGlzIGZsYWcgaXMgb24sIHRoZSBjb21tYW5kIHdpbGwgc3RheSBvbiB0aGUgY2FsbGJhY2sgbGlzdCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xufVxuXG5NZXNzYWdlLmJ1aWxkU2lnbmF0dXJlID0gZnVuY3Rpb24obXNnKXtcblx0cmV0dXJuIG1zZy5zZXJ2aWNlKycuJyttc2cuZnVuYysnLicrbXNnLm9iajtcbn1cblxuXG5NZXNzYWdlLnByb3RvdHlwZS5zaWduYXR1cmUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5zZXJ2aWNlKycuJyt0aGlzLmZ1bmMrJy4nK3RoaXMub2JqO1xufVxuXG5NZXNzYWdlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oZGF0YSl7XG5cdHJldHVybiB7XG5cdFx0c2VydmljZTogdGhpcy5zZXJ2aWNlLFxuXHRcdGZ1bmM6IHRoaXMuZnVuYyxcblx0XHRvYmo6IHRoaXMub2JqLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2U7XG4iLCJ2YXIgUlRDID0gcmVxdWlyZSgnLi4vcnRjL3J0YycpO1xuXG5mdW5jdGlvbiBQcm9tZXRoZShzZXNzaW9uKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMucnRjID0gbmV3IFJUQy5SVEMoc2Vzc2lvbik7XG5cdFxuXHR0aGlzLnJ0Yy5vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0XHRpZih0eXBlb2YgdGhhdC5vbmNsb3NlID09PSAnZnVuY3Rpb24nKSB0aGF0Lm9uY2xvc2UoKTtcblx0fVxufVxuXG5Qcm9tZXRoZS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24ocmVnZXgsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnJ0Yy51c2UocmVnZXgsIGZ1bmN0aW9uKGNoYW5uZWwpe1xuXHRcdHRoYXQuX25lZ29jaWF0ZU5ldXJvbihjaGFubmVsLCBjYWxsYmFjayk7XG5cdH0pO1xufVxuXG5Qcm9tZXRoZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMucnRjLmNvbm5lY3QoKTtcbn1cblxuUHJvbWV0aGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnJ0Yy5kaXNjb25uZWN0KCk7XG59XG5cblxuUHJvbWV0aGUucHJvdG90eXBlLl9uZWdvY2lhdGVOZXVyb24gPSBmdW5jdGlvbihjaGFubmVsLCBjYWxsYmFjayl7XG5cdGNoYW5uZWwuc2V0T25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdFxuXHRcdHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KG1lc3NhZ2UuZGF0YSk7XG5cblx0XHR2YXIgdHlwZUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXcuZ2V0VWludDgoMCkpO1xuXHRcdGlmKHR5cGVDaGFyID09PSAnTycpe1xuXHRcdFx0Ly9JbnB1dFxuXHRcdFx0Y2hhbm5lbC50eXBlID0gJ2lucHV0JzsgLy9Qcm9tZXRoZSBPdXRwdXQgPSBDbGllbnQgSW5wdXRcblx0XHR9ZWxzZSBpZih0eXBlQ2hhciA9PT0gJ0knKXtcblx0XHRcdC8vT3V0cHV0XG5cdFx0XHRjaGFubmVsLnR5cGUgPSAnb3V0cHV0JzsgLy9Qcm9tZXRoZSBJbnB1dCA9IENsaWVudCBPdXRwdXRcblx0XHR9ZWxzZXtcblx0XHRcdC8vRXJyb3Jcblx0XHR9XG5cblx0XHR2YXIgc2l6ZSA9IHZpZXcuZ2V0SW50MzIoMSx0cnVlKTtcblx0XHRpZihzaXplICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRjaGFubmVsLnNpemUgPSBzaXplO1xuXHRcdFx0Y2hhbm5lbC5fYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblx0XHR9ZWxzZXtcblx0XHRcdC8vZXJyb3Jcblx0XHR9XG5cblxuXG5cdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2UodW5kZWZpbmVkKTtcblxuXHRcdGNoYW5uZWwuc2V0T25WYWx1ZSA9IGZ1bmN0aW9uKG9udmFsdWVfY2Ipe1xuXHRcdFx0Y2hhbm5lbC5zZXRPbk1lc3NhZ2Uob252YWx1ZV9jYik7XG5cdFx0fVxuXG5cdFx0Y2hhbm5lbC53cml0ZSA9IGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFubmVsLnNpemUgfHwgaXNOYU4odmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjaGFubmVsLl9idWZmZXJbaW5kZXhdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRjaGFubmVsLmZyZXF1ZW5jeSA9IDMzO1xuXG5cdFx0Y2hhbm5lbC5fcnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGNoYW5uZWwuc2VuZChjaGFubmVsLl9idWZmZXIpKVxuXHRcdFx0XHRzZXRUaW1lb3V0KGNoYW5uZWwuX3J1biwgY2hhbm5lbC5mcmVxdWVuY3kpO1xuXHRcdH1cblxuXHRcdGNoYW5uZWwuX3J1bigpO1xuXG5cdFx0Y2FsbGJhY2soY2hhbm5lbCk7XG5cblx0fSk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9tZXRoZTsiLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuLyoqXG4gKiAgY2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIFFFSShub2RlLCBjYWxsYmFjaywgc2FtcGxpbmcpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdFxuXHR0aGlzLnNhbXBsaW5nID0gc2FtcGxpbmcgfHwgMTA7IC8qIG1heCBudW0gb2YgcHRzIHN0b3JlZCAqL1xuXHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24ocmVzKXt9OyAvKiBjYWxsYmFjaywgdXN1YWxseSBhZnRlciBnZXRNb2RlbCAqL1xuXG5cdG5vZGUuZ2V0KHtcblx0XHRzZXJ2aWNlOiBcInFlaVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVJlcXVlc3RcIixcblx0XHRkYXRhOiB7XG5cdFx0XHR0eXBlOlwibXNnSW5pdFwiLFxuXHRcdFx0c2FtcGxpbmc6IDEsXG5cdFx0XHRyZXF1ZXN0ZWREYXRhOiBcImFsbFwiXG5cdFx0XHQvKiBubyB0aW1lIHJhbmdlIHNwZWNpZmllZCAqL1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhhdC5kYXRhTW9kZWw9IHt9O1xuXHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRcdHRoYXQuX2dldERhdGFNb2RlbEZyb21SZWN2KGRhdGEpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRcdFxuXHRcdFx0Ly8vIHRoYXQudXBkYXRlQ2hhcnQodGhpcy5kYXRhTW9kZWwpO1xuXHRcdFx0dGhhdC5jYWxsYmFjayh0aGF0LmRhdGFNb2RlbCk7XG5cblx0XHRcdG5vZGUubGlzdGVuKHtcblx0XHRcdFx0XHRzZXJ2aWNlOiBcInFlaVwiLFxuXHRcdFx0XHRcdGZ1bmM6IFwiU3Vic2NyaWJlUWVpXCJcblx0XHRcdFx0fSwgZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YocmVzLmRhdGEpO1xuXHRcdFx0XHRcdHRoYXQuY2FsbGJhY2sodGhhdC5kYXRhTW9kZWwpO1xuXHRcdFx0XHRcdH0pO1xuXHR9KTtcblxuXHRjb25zb2xlLmxvZyhcIkRpeWFTREsgLSBRRUk6IGNyZWF0ZWRcIik7XG5cdHJldHVybiB0aGlzO1xufVxuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDogXG4gKiB7XG4gKiBcdHRpbWU6IFtGTE9BVCwgLi4uXSxcbiAqIFx0XCJzZW5zZXVyWFhcIjoge1xuICogXHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sXG4gKiBcdFx0XHRyYW5nZTogW0ZMT0FULCBGTE9BVF0sXG4gKiAgICAgIHRocmVzaG9sZDogRkxPQVQsXG4gKiBcdFx0XHR1bml0OiBGTE9BVFxuICogXHRcdH0sXG4gKiAgIC4uLiAoXCJzZW5zZXVyc1lZXCIpXG4gKiB9XG4gKi9cblFFSS5wcm90b3R5cGUuZ2V0RGF0YU1vZGVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsO1xufVxuUUVJLnByb3RvdHlwZS5nZXREYXRhUmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwucmFuZ2U7XG59XG5RRUkucHJvdG90eXBlLnVwZGF0ZVF1YWxpdHlJbmRleCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0PXRoaXM7XG5cdHZhciBkbSA9IHRoaXMuZGF0YU1vZGVsO1xuXHRcblx0Zm9yKHZhciBkIGluIGRtKSB7XG5cdFx0aWYoZD09J3RpbWUnIHx8ICFkbVtkXS5kYXRhKSBjb250aW51ZTtcblx0XG5cdFx0aWYoIWRtW2RdLnF1YWxpdHlJbmRleCB8fCBkbVtkXS5kYXRhLmxlbmd0aCAhPSBkbVtkXS5xdWFsaXR5SW5kZXgubGVuZ3RoKVxuXHRcdFx0ZG1bZF0ucXVhbGl0eUluZGV4ID0gbmV3IEFycmF5KGRtW2RdLmRhdGEubGVuZ3RoKTtcblx0XHRcblx0XHRkbVtkXS5kYXRhLmZvckVhY2goZnVuY3Rpb24odixpKSB7XG5cdFx0XHRcdGRtW2RdLnF1YWxpdHlJbmRleFtpXSA9IGNoZWNrUXVhbGl0eSh2LGRtW2RdLnF1YWxpdHlDb25maWcpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblFFSS5wcm90b3R5cGUuZ2V0RGF0YVRocmVzaG9sZCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmRhdGFNb2RlbC50aHJlc2hvbGQ7XG59XG5RRUkucHJvdG90eXBlLmdldFNhbXBsaW5nID0gZnVuY3Rpb24obnVtU2FtcGxlcyl7XG5cdHJldHVybiB0aGlzLnNhbXBsaW5nO1xufVxuUUVJLnByb3RvdHlwZS5zZXRTYW1wbGluZyA9IGZ1bmN0aW9uKG51bVNhbXBsZXMpe1xuXHR0aGlzLnNhbXBsaW5nID0gbnVtU2FtcGxlcztcbn1cblxuXG52YXIgY2hlY2tRdWFsaXR5ID0gZnVuY3Rpb24oZGF0YSwgcXVhbGl0eUNvbmZpZyl7XG5cdHZhciBxdWFsaXR5O1xuXHRpZihkYXRhICYmIHF1YWxpdHlDb25maWcpIHtcblx0XHRpZihkYXRhPnF1YWxpdHlDb25maWcudGhyZXNob2xkKVxuXHRcdFx0cXVhbGl0eT0wO1xuXHRcdGVsc2Vcblx0XHRcdHF1YWxpdHk9MS4wXG5cdFx0cmV0dXJuIHF1YWxpdHk7XG5cdH1cblx0cmV0dXJuIDEuMDtcbn1cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfSAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5RRUkucHJvdG90eXBlLl9nZXREYXRhTW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgZGF0YU1vZGVsPXRoaXMuZGF0YU1vZGVsO1xuXHQvKlxcXG5cdHwqfFxuXHR8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcblx0fCp8XG5cdHwqfCAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9Ew6ljb2Rlcl9lbmNvZGVyX2VuX2Jhc2U2NFxuXHR8Knxcblx0XFwqL1xuXHQvKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cblx0YjY0VG9VaW50NiA9IGZ1bmN0aW9uKG5DaHIpIHtcblx0XHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0XHRcdG5DaHIgLSA2NVxuXHRcdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0XHRcdG5DaHIgLSA3MVxuXHRcdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRcdFx0bkNociArIDRcblx0XHRcdDogbkNociA9PT0gNDMgP1xuXHRcdFx0XHQ2MlxuXHRcdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0XHRcdDYzXG5cdFx0XHQ6XHQwO1xuXHR9O1xuXHQvKipcblx0ICogRGVjb2RlIGJhc2U2NCBzdHJpbmcgdG8gVUludDhBcnJheVxuXHQgKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjQgICAgIGJhc2U2NCBjb2RlZCBzdHJpbmdcblx0ICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cblx0ICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgICAgdGFiIG9mIGRlY29kZWQgYnl0ZXNcblx0ICovXG5cdGJhc2U2NERlY1RvQXJyID0gZnVuY3Rpb24oc0Jhc2U2NCwgbkJsb2Nrc1NpemUpIHtcblx0XHR2YXJcblx0XHRzQjY0RW5jID0gc0Jhc2U2NC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL10vZywgXCJcIiksIG5JbkxlbiA9IHNCNjRFbmMubGVuZ3RoLFxuXHRcdG5PdXRMZW4gPSBuQmxvY2tzU2l6ZSA/IE1hdGguY2VpbCgobkluTGVuICogMyArIDEgPj4gMikgLyBuQmxvY2tzU2l6ZSkgKiBuQmxvY2tzU2l6ZSA6IG5JbkxlbiAqIDMgKyAxID4+IDIsXG5cdFx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRcdGZvciAodmFyIG5Nb2QzLCBuTW9kNCwgblVpbnQyNCA9IDAsIG5PdXRJZHggPSAwLCBuSW5JZHggPSAwOyBuSW5JZHggPCBuSW5MZW47IG5JbklkeCsrKSB7XG5cdFx0XHRuTW9kNCA9IG5JbklkeCAmIDM7IC8qIG4gbW9kIDQgKi9cblx0XHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0XHRpZiAobk1vZDQgPT09IDMgfHwgbkluTGVuIC0gbkluSWR4ID09PSAxKSB7XG5cdFx0XHRcdGZvciAobk1vZDMgPSAwOyBuTW9kMyA8IDMgJiYgbk91dElkeCA8IG5PdXRMZW47IG5Nb2QzKyssIG5PdXRJZHgrKykge1xuXHRcdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5VaW50MjQgPSAwO1xuXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdFx0cmV0dXJuIGJ1ZmZlcjtcblx0fTtcblx0XG5cdGlmKGRhdGEgJiYgZGF0YS5oZWFkZXIpIHtcblx0XHQvL34gY29uc29sZS5sb2coJ3JjdmRhdGEgJytKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdFx0Ly8gaWYoIWRhdGEuaGVhZGVyLnNhbXBsaW5nKSBkYXRhLmhlYWRlci5zYW1wbGluZz0xO1xuXHRcdFxuXHRcdC8qKiBjYXNlIDEgOiAxIHZhbHVlIHJlY2VpdmVkIGFkZGVkIHRvIGRhdGFNb2RlbCAqL1xuXHRcdGlmKGRhdGEuaGVhZGVyLnNhbXBsaW5nPT0xKSB7XG5cdFx0XHRpZihkYXRhLmhlYWRlci50aW1lRW5kKSB7XG5cdFx0XHRcdGlmKCFkYXRhTW9kZWwudGltZSkgZGF0YU1vZGVsLnRpbWU9W107XG5cdFx0XHRcdGRhdGFNb2RlbC50aW1lLnB1c2goZGF0YS5oZWFkZXIudGltZUVuZCk7XG5cdFx0XHRcdGlmKGRhdGFNb2RlbC50aW1lLmxlbmd0aCA+IHRoaXMuc2FtcGxpbmcpIHtcblx0XHRcdFx0XHRkYXRhTW9kZWwudGltZSA9IGRhdGFNb2RlbC50aW1lLnNsaWNlKGRhdGFNb2RlbC50aW1lLmxlbmd0aCAtIHRoaXMuc2FtcGxpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBuIGluIGRhdGEpIHtcblx0XHRcdFx0aWYobiAhPSBcImhlYWRlclwiICYmIG4gIT0gXCJ0aW1lXCIpIHtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YT1bXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHVuaXQgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdGhyZXNob2xkICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnF1YWxpdHlDb25maWc9e3RocmVzaG9sZDogZGF0YVtuXS50aHJlc2hvbGR9O1xuXG5cdFx0XHRcdFx0aWYoZGF0YVtuXS5kYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdC8qIGRlY29kZSBkYXRhIHRvIEZsb2F0MzJBcnJheSovXG5cdFx0XHRcdFx0XHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YVtuXS5kYXRhLCA0KTtcblx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGJ1ZikpO1xuXHRcdFx0XHRcdFx0dmFyIGZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmKTtcblxuXHRcdFx0XHRcdFx0aWYoZGF0YVtuXS5zaXplICE9IGZBcnJheS5sZW5ndGgpIGNvbnNvbGUubG9nKFwiTWlzbWF0Y2ggb2Ygc2l6ZSBcIitkYXRhW25dLnNpemUrXCIgdnMgXCIrZkFycmF5Lmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRpZihkYXRhW25dLnNpemUgIT0gMSkgY29uc29sZS5sb2coXCJFeHBlY3RlZCAxIHZhbHVlIHJlY2VpdmVkIDpcIitkYXRhW25dLnNpemUpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dLmRhdGEpIGRhdGFNb2RlbFtuXS5kYXRhPVtdO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEucHVzaChmQXJyYXlbMF0pO1xuXHRcdFx0XHRcdFx0aWYoZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoID4gdGhpcy5zYW1wbGluZykge1xuXHRcdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IGRhdGFNb2RlbFtuXS5kYXRhLnNsaWNlKGRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCAtIHRoaXMuc2FtcGxpbmcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSAwKSBjb25zb2xlLmxvZyhcIlNpemUgbWlzbWF0Y2ggcmVjZWl2ZWQgZGF0YSAobm8gZGF0YSB2ZXJzdXMgc2l6ZT1cIitkYXRhW25dLnNpemUrXCIpXCIpO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy51cGRhdGVRdWFsaXR5SW5kZXgoKTtcblx0XHRcdFx0XHQvL34gY29uc29sZS5sb2coJ215ZGF0YSAnK0pTT04uc3RyaW5naWZ5KGRhdGFNb2RlbFtuXS5kYXRhKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvKiogY2FzZSAyIDogaGlzdG9yeSBkYXRhIC0gbWFueSB2YWx1ZXMgcmVjZWl2ZWQgKi9cblx0XHRcdC8qKiBUT0RPICAqL1xuXHRcdFx0Zm9yICh2YXIgbiBpbiBkYXRhKSB7XG5cdFx0XHRcdGlmKG4gPT0gJ3RpbWUnKSB7XG5cdFx0XHRcdFx0LyogY2FzZSAxIDogdGltZSBkYXRhIHRyYW5zbWl0dGVkLCAxIHZhbHVlICovXG5cdFx0XHRcdFx0LyoqIFRPRE8gKiovXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZihuICE9IFwiaGVhZGVyXCIpIHtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YT1bXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHVuaXQgKi9cblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdGhyZXNob2xkICovXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnF1YWxpdHlDb25maWc9e3RocmVzaG9sZDogZGF0YVtuXS50aHJlc2hvbGR9O1xuXG5cdFx0XHRcdFx0aWYoZGF0YVtuXS5kYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdC8qIGRlY29kZSBkYXRhIHRvIEZsb2F0MzJBcnJheSovXG5cdFx0XHRcdFx0XHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YVtuXS5kYXRhLCA0KTsgXG5cdFx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShidWYpKTtcblx0XHRcdFx0XHRcdHZhciBmQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KGJ1Zik7XG5cblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSBmQXJyYXkubGVuZ3RoKSBjb25zb2xlLmxvZyhcIk1pc21hdGNoIG9mIHNpemUgXCIrZGF0YVtuXS5zaXplK1wiIHZzIFwiK2ZBcnJheS5sZW5ndGgpO1xuXHRcdFx0XHRcdFx0Ly8gLyogaW5jcmVhc2Ugc2l6ZSBvZiBkYXRhIGlmIG5lY2Vzc2FyeSAqL1xuXHRcdFx0XHRcdFx0aWYoZkFycmF5Lmxlbmd0aD5kYXRhTW9kZWxbbl0uZGF0YS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0Ly8gZGF0YU1vZGVsW25dLnNpemU9ZGF0YVtuXS5zaXplO1xuXHRcdFx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IG5ldyBBcnJheShkYXRhTW9kZWxbbl0uc2l6ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvKiB1cGRhdGUgbmIgb2Ygc2FtcGxlcyBzdG9yZWQgKi9cblx0XHRcdFx0XHRcdGZvcih2YXIgaSBpbiBmQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGFbcGFyc2VJbnQoaSldPWZBcnJheVtpXTsgLyoga2VlcCBmaXJzdCB2YWwgLSBuYW1lIG9mIGNvbHVtbiAqL1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGlmKGRhdGFbbl0uc2l6ZSAhPSAwKSBjb25zb2xlLmxvZyhcIlNpemUgbWlzbWF0Y2ggcmVjZWl2ZWQgZGF0YSAobm8gZGF0YSB2ZXJzdXMgc2l6ZT1cIitkYXRhW25dLnNpemUrXCIpXCIpO1xuXHRcdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZGF0YU1vZGVsW25dLmRhdGEgPSBBcnJheS5mcm9tKGZBcnJheSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ215ZGF0YSAnK0pTT04uc3RyaW5naWZ5KGRhdGFNb2RlbFtuXS5kYXRhKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSB7XG5cdFx0Y29uc29sZS5sb2coXCJObyBEYXRhIHRvIHJlYWQgb3IgaGVhZGVyIGlzIG1pc3NpbmcgIVwiKTtcblx0fVxuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59XG5cblxudmFyIGV4cCA9IHtcblx0XHRRRUk6IFFFSVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDsgXG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuLyo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xudmFyIFJUQ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb247XG52YXIgUlRDSWNlQ2FuZGlkYXRlID0gd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cubW96UlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy53ZWJraXRSVENJY2VDYW5kaWRhdGU7XG52YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cubW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENTZXNzaW9uRGVzY3JpcHRpb247XG5cbmZ1bmN0aW9uIENoYW5uZWwobmFtZSwgb3Blbl9jYil7XG5cdHRoaXMubmFtZSA9IG5hbWU7XG5cblx0dGhpcy5jaGFubmVsID0gdW5kZWZpbmVkO1xuXHR0aGlzLm9ub3BlbiA9IG9wZW5fY2I7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG59XG5cbkNoYW5uZWwucHJvdG90eXBlLnNldENoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdHRoaXMuY2hhbm5lbCA9IGRhdGFjaGFubmVsO1xuXG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYodGhhdC5vbm9wZW4pIHRoYXQub25vcGVuKHRoYXQpO1xufVxuXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuc2V0T25NZXNzYWdlID0gZnVuY3Rpb24ob25tZXNzYWdlKXtcblx0dGhpcy5jaGFubmVsLm9ubWVzc2FnZSA9IG9ubWVzc2FnZTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKG1zZyl7XG5cdGlmKHRoaXMuY2xvc2VkKSByZXR1cm4gZmFsc2U7XG5cdGVsc2UgaWYodGhpcy5jaGFubmVsLnJlYWR5U3RhdGUgPT09ICdvcGVuJyl7XG5cdFx0dGhpcy5jaGFubmVsLnNlbmQobXNnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRlbHNle1xuXHRcdGNvbnNvbGUubG9nKCdbcnRjLmNoYW5uZWwud3JpdGVdIHdhcm5pbmcgOiB3ZWJydGMgZGF0YWNoYW5uZWwgc3RhdGUgPSAnK3RoaXMuY2hhbm5lbC5yZWFkeVN0YXRlKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gUlRDKG5vZGUpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdFxuXHR0aGlzLm5vZGUgPSBub2RlO1xuXHR0aGlzLmF2YWlsYWJsZUNoYW5uZWxzID0gW107XG5cdHRoaXMudXNlZENoYW5uZWxzID0gW107XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscyA9IFtdO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucyA9IFtdO1xuXG5cdHRoaXMucGVlcnMgPSBbXTtcblx0XG5cdHRoaXMuaWQgPSAtMTtcbn1cblxuUlRDLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihuYW1lX3JlZ2V4LCBvbm9wZW5fY2FsbGJhY2spe1xuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goe3JlZ2V4OiBuYW1lX3JlZ2V4LCBjYjogb25vcGVuX2NhbGxiYWNrfSk7XG59XG5cblJUQy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHdoaWxlKHRoaXMudXNlZENoYW5uZWxzLmxlbmd0aCl7XG5cdFx0dGhpcy51c2VkQ2hhbm5lbHMucG9wKCkuY2xvc2UoKTtcblx0fVxuXG5cdGZvcih2YXIgcHJvbUlEIGluIHRoaXMucGVlcnMpe1xuXHRcdHRoaXMucGVlcnNbcHJvbUlEXS5jbG9zZSgpO1xuXHRcdGRlbGV0ZSB0aGlzLnBlZXJzW3Byb21JRF07XG5cdH1cblxuXHRpZih0eXBlb2YgdGhpcy5vbmNsb3NlID09PSAnZnVuY3Rpb24nKSB0aGlzLm9uY2xvc2UoKTtcbn1cblxuUlRDLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgZm91bmRDaGFubmVscyA9IGZhbHNlO1xuXG5cdHZhciBzdWIgPSB0aGlzLm5vZGUubGlzdGVuKHtcblx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRmdW5jOiAnTGlzdENoYW5uZWxzJ1xuXHR9LFxuXHRmdW5jdGlvbihkYXRhKXtcblx0XHRpZihkYXRhKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiZGF0YVwiKTtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0aWYoZGF0YS5jaGFubmVscyAmJiBkYXRhLmNoYW5uZWxzLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRmb3VuZENoYW5uZWxzID0gdHJ1ZTtcblx0XHRcdFx0Ly9NYXRjaCByZWNlaXZlZCBjaGFubmVscyB3aXRoIHJlcXVlc3RlZCBjaGFubmVsc1xuXHRcdFx0XHR2YXIgY2hhbm5lbHMgPSB0aGF0Ll9tYXRjaENoYW5uZWxzKGRhdGEuY2hhbm5lbHMpO1xuXHRcdFx0XHQvL0luaXRpYXRlIGEgbmV3IENvbm5lY3Rpb25cblx0XHRcdFx0dGhhdC5fZG9Db25uZWN0KGNoYW5uZWxzKTtcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdGlmKCFmb3VuZENoYW5uZWxzKXtcblx0XHRcdFx0dGhhdC5kaXNjb25uZWN0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHR0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChzdWIpO1xufVxuXG5cblJUQy5wcm90b3R5cGUuX21hdGNoQ2hhbm5lbHMgPSBmdW5jdGlvbihyZWNlaXZlZENoYW5uZWxzKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8vQ29udGFpbnMgYWxsIGNoYW5uZWxzIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gQ29ubmVjdCBhcyBvYmplY3RzXG5cdHZhciBjaGFubmVscyA9IFtdO1xuXG5cdGZvcih2YXIgaSA9IDA7IGkgPCByZWNlaXZlZENoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgbmFtZSA9IHJlY2VpdmVkQ2hhbm5lbHNbaV07XG5cdFx0XG5cdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRoYXQucmVxdWVzdGVkQ2hhbm5lbHMubGVuZ3RoOyBqKyspe1xuXHRcdFx0dmFyIHJlcSA9IHRoYXQucmVxdWVzdGVkQ2hhbm5lbHNbal07XG5cdFx0XHRcblx0XHRcdGlmKG5hbWUgJiYgbmFtZS5tYXRjaChyZXEucmVnZXgpKXtcblx0XHRcdFx0dGhhdC51c2VkQ2hhbm5lbHNbbmFtZV0gPSBuZXcgQ2hhbm5lbChuYW1lLCByZXEuY2IpO1xuXHRcdFx0XHRjaGFubmVscy5wdXNoKG5hbWUpOyAvL3ByZXBhcmUgdGhlIGNvbm5lY3Qgb2JqZWN0IGxpc3Rcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY2hhbm5lbHM7XG59O1xuXG5SVEMucHJvdG90eXBlLl9kb0Nvbm5lY3QgPSBmdW5jdGlvbihjaGFubmVscyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHRjb25zb2xlLmxvZyhjaGFubmVscyk7XG5cblx0dmFyIHN1YiA9IHRoaXMubm9kZS5saXN0ZW4oe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdDb25uZWN0Jyxcblx0XHRvYmo6IGNoYW5uZWxzXG5cdH0sXG5cdGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHRoYXQuX2hhbmRsZU5lZ29jaWF0aW9uTWVzc2FnZShkYXRhKTtcblx0fSk7XG5cblx0dGhpcy5zdWJzY3JpcHRpb25zLnB1c2goc3ViKTtcbn07XG5cblxuUlRDLnByb3RvdHlwZS5faGFuZGxlTmVnb2NpYXRpb25NZXNzYWdlID0gZnVuY3Rpb24obXNnKXtcblxuXHRpZihtc2cuZXZlbnRUeXBlID09PSAnUmVtb3RlT2ZmZXInKXtcblx0XHR0aGlzLnBlZXJzW21zZy5wcm9tSURdID0gdGhpcy5fY3JlYXRlUGVlcihtc2cpO1xuXHR9ZWxzZSBpZihtc2cuZXZlbnRUeXBlID09PSAnUmVtb3RlSUNFQ2FuZGlkYXRlJyl7XG5cdFx0dGhpcy5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlKHRoaXMucGVlcnNbbXNnLnByb21JRF0sIG1zZyk7XG5cdH1cbn07XG5cbnZhciBzZXJ2ZXJzID0ge1wiaWNlU2VydmVyc1wiOiBbe1widXJsXCI6IFwic3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMlwifV19O1xuUlRDLnByb3RvdHlwZS5fY3JlYXRlUGVlciA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIHBlZXIgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oc2VydmVycywge21hbmRhdG9yeTogW3tEdGxzU3J0cEtleUFncmVlbWVudDogdHJ1ZX0sIHtFbmFibGVEdGxzU3J0cDogdHJ1ZX1dfSk7XG5cblx0cGVlci5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtzZHA6IGRhdGEuc2RwLCB0eXBlOiBkYXRhLnR5cGV9KSk7XG5cblx0Y29uc29sZS5sb2coXCJjcmVhdGUgYW5zd2VyXCIpO1xuXG5cdHBlZXIuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRcdHBlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKTtcblxuXHRcdHRoYXQubm9kZS5nZXQoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnQW5zd2VyJyxcblx0XHRcdGRhdGE6e1xuXHRcdFx0XHRwcm9tSUQ6IGRhdGEucHJvbUlELFxuXHRcdFx0XHRwZWVySWQ6IGRhdGEucGVlcklkLFxuXHRcdFx0XHRzZHA6IHNlc3Npb25fZGVzY3JpcHRpb24uc2RwLFxuXHRcdFx0XHR0eXBlOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnR5cGVcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0ZnVuY3Rpb24oZXJyKXtcblx0XHRjb25zb2xlLmxvZyhcImNhbm5vdCBjcmVhdGUgYW5zd2VyXCIpO1xuXHR9LCBcblx0eyAnbWFuZGF0b3J5JzogeyAnT2ZmZXJUb1JlY2VpdmVBdWRpbyc6IHRydWUsICdPZmZlclRvUmVjZWl2ZVZpZGVvJzogdHJ1ZSB9IH0pO1xuXG5cblx0cGVlci5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjb25uZWN0ZWQnKXtcblx0XHRcdC8vVW5yZWdpc3RlciBsaXN0ZW5lcnNcblx0XHRcdHRoYXQuX3Vuc3Vic2NyaWJlQWxsKCk7XG5cdFx0fWVsc2UgaWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdkaXNjb25uZWN0ZWQnKXtcblx0XHRcdC8vbm90aWZ5IHVzZXJcblx0XHRcdHRoYXQuZGlzY29ubmVjdCgpO1xuXHRcdH1cblx0fVxuXG5cdHBlZXIub25pY2VjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpe1xuXHRcdFxuXHRcdHRoYXQubm9kZS5nZXQoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnSUNFQ2FuZGlkYXRlJyxcblx0XHRcdGRhdGE6e1xuXHRcdFx0XHRwZWVySWQ6IGRhdGEucGVlcklkLFxuXHRcdFx0XHRwcm9tSUQ6IGRhdGEucHJvbUlELFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuX29uRGF0YUNoYW5uZWwoZXZ0LmNoYW5uZWwpO1xuXHR9O1xuXG5cdHBlZXIub25hZGRzdHJlYW0gPSBmdW5jdGlvbihldnQpe1xuXHRcdGNvbnNvbGUubG9nKFwiT04gQUREIFNUUkVBTVwiKTtcblx0XHR2YXIgcmVtb3RlVmlldyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbXl2aWRcIik7XG5cdFx0cmVtb3RlVmlldy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGV2dC5zdHJlYW0pO1xuXHR9O1xuXG5cdHBlZXIucHJvbUlEID0gZGF0YS5wcm9tSUQ7XG5cblx0cmV0dXJuIHBlZXI7XG59XG5cblJUQy5wcm90b3R5cGUuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKHBlZXIsIGRhdGEpe1xuXHR0cnl7XG5cdFx0dmFyIGNhbmRpZGF0ZSA9IG5ldyBSVENJY2VDYW5kaWRhdGUoZGF0YS5jYW5kaWRhdGUpO1xuXHRcdHBlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSxmdW5jdGlvbigpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJjYW5kaWRhdGUgYWRkZWQgKFwiK3BlZXIuaWNlQ29ubmVjdGlvblN0YXRlK1wiKVwiKTtcblx0XHR9LGZ1bmN0aW9uKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0fSk7XG5cdH1jYXRjaChlKSB7Y29uc29sZS5sb2coZSk7fVxufVxuXG5SVEMucHJvdG90eXBlLl91bnN1YnNjcmliZUFsbCA9IGZ1bmN0aW9uKCl7XG5cdHdoaWxlKHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGgpe1xuXHRcdHRoaXMubm9kZS5zdG9wTGlzdGVuaW5nKHRoaXMuc3Vic2NyaXB0aW9ucy5wb3AoKSk7XG5cdH1cbn1cblxuUlRDLnByb3RvdHlwZS5fb25EYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKGRhdGFjaGFubmVsKXtcblx0Y29uc29sZS5sb2coXCJDaGFubmVsIFwiK2RhdGFjaGFubmVsLmxhYmVsK1wiIGNyZWF0ZWQgIVwiKTtcblxuXHR2YXIgY2hhbm5lbCA9IHRoaXMudXNlZENoYW5uZWxzW2RhdGFjaGFubmVsLmxhYmVsXTtcblx0aWYoIWNoYW5uZWwpe1xuXHRcdGRhdGFjaGFubmVsLmNsb3NlKCk7XG5cdFx0cmV0dXJuIDtcblx0fVxuXG5cdGNoYW5uZWwuc2V0Q2hhbm5lbChkYXRhY2hhbm5lbCk7XG59XG5cblxudmFyIGV4cCA9IHtcblx0XHRSVEM6IFJUQ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDsgXG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuZnVuY3Rpb24gVGltZXIocGVyaW9kLCBvbnRpbWUpe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ3RpbWVyJyk7XG5cdFxuXHR0aGlzLnBlcmlvZCA9IHBlcmlvZDtcblx0dGhpcy5vbnRpbWUgPSBvbnRpbWU7XG5cdFxuXHRpZihwZXJpb2Qpe1xuXHRcdHRoaXMubG9vcCA9IHRydWU7XG5cdFx0dGhpcy5wZXJtYW5lbnQgPSB0cnVlO1xuXHR9XG59XG51dGlsLmluaGVyaXRzKFRpbWVyLCBNZXNzYWdlKTtcblxuVGltZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gVGltZXIuc3VwZXJfLnByb3RvdHlwZS5leGVjLmNhbGwodGhpcywge1xuXHRcdGxvb3A6IHRoaXMubG9vcCxcblx0XHRwZXJpb2Q6IHRoaXMucGVyaW9kXG5cdH0pO1xufVxuXG5UaW1lci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKXtcblx0aWYoISBkYXRhKSByZXR1cm4gO1xuXHRpZihkYXRhLmN1cnJlbnRUaW1lKXtcblx0XHR0aGlzLm9udGltZShkYXRhLmN1cnJlbnRUaW1lKTtcblx0fVxufVxuXG5cblxudmFyIHRpbWVyID0ge1xuXHRcdFRpbWVyOiBUaW1lclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWVyO1xuIiwiLyogZGl5YS1zZGtcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG5mdW5jdGlvbiBMaXN0U2VydmljZXMoY2FsbGJhY2spe1xuXHRNZXNzYWdlLmNhbGwodGhpcywgJ3dhdGNoZG9nJywgJ0xpc3RTZXJ2aWNlcycpO1xuXG5cdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbn1cbnV0aWwuaW5oZXJpdHMoTGlzdFNlcnZpY2VzLCBNZXNzYWdlKTtcblxuTGlzdFNlcnZpY2VzLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIExpc3RTZXJ2aWNlcy5zdXBlcl8ucHJvdG90eXBlLmV4ZWMuY2FsbCh0aGlzKTtcbn1cblxuTGlzdFNlcnZpY2VzLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRpZihkYXRhLnNlcnZpY2VzICYmIHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2soZGF0YS5zZXJ2aWNlcyk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdExpc3RTZXJ2aWNlczogTGlzdFNlcnZpY2VzXG59XG5cbiJdfQ==
