(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.d1 = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
/**
 * Utility functions
 */

var util = {};

util.isObject = function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

util.isNumber = function isNumber(arg) {
  return typeof arg === 'number';
}

util.isUndefined = function isUndefined(arg) {
  return arg === void 0;
}

util.isFunction = function isFunction(arg){
  return typeof arg === 'function';
}


/**
 * EventEmitter class
 */

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!util.isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error' && !this._events.error) {
    er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      throw Error('Uncaught, unspecified "error" event.');
    }
    return false;
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (util.isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (util.isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              util.isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (util.isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (util.isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!util.isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;

      if (util.isFunction(console.error)) {
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
      }
      if (util.isFunction(console.trace))
        console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (util.isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (util.isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (util.isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (Array.isArray(listeners)) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (util.isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (util.isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],6:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
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

},{"./support/isBuffer":6,"_process":4,"inherits":5}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;
  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Comment out the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  require('./utils').disableLog(true);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'opera': // fallthrough as it uses chrome shims
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection) {
        logging('Chrome shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = chromeShim;

      chromeShim.shimGetUserMedia();
      chromeShim.shimSourceObject();
      chromeShim.shimPeerConnection();
      chromeShim.shimOnTrack();
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection) {
        logging('Firefox shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = firefoxShim;

      firefoxShim.shimGetUserMedia();
      firefoxShim.shimSourceObject();
      firefoxShim.shimPeerConnection();
      firefoxShim.shimOnTrack();
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection) {
        logging('MS edge shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = edgeShim;

      edgeShim.shimPeerConnection();
      break;
    case 'safari':
      if (!safariShim) {
        logging('Safari shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = safariShim;

      safariShim.shimGetUserMedia();
      break;
    default:
      logging('Unsupported browser!');
  }
})();

},{"./chrome/chrome_shim":9,"./edge/edge_shim":12,"./firefox/firefox_shim":13,"./safari/safari_shim":15,"./utils":16}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;
var browserDetails = require('../utils.js').browserDetails;

var chromeShim = {
  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          var self = this;
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var event = new Event('track');
              event.track = te.track;
              event.receiver = {track: te.track};
              event.streams = [e.stream];
              self.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    // The RTCPeerConnection object.
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      // Translate iceTransportPolicy to iceTransports,
      // see https://code.google.com/p/webrtc/issues/detail?id=4869
      logging('PeerConnection');
      if (pcConfig && pcConfig.iceTransportPolicy) {
        pcConfig.iceTransports = pcConfig.iceTransportPolicy;
      }

      var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
      var origGetStats = pc.getStats.bind(pc);
      pc.getStats = function(selector, successCallback, errorCallback) {
        var self = this;
        var args = arguments;

        // If selector is a function then we are in the old style stats so just
        // pass back the original getStats format to avoid breaking old users.
        if (arguments.length > 0 && typeof selector === 'function') {
          return origGetStats(selector, successCallback);
        }

        var fixChromeStats_ = function(response) {
          var standardReport = {};
          var reports = response.result();
          reports.forEach(function(report) {
            var standardStats = {
              id: report.id,
              timestamp: report.timestamp,
              type: report.type
            };
            report.names().forEach(function(name) {
              standardStats[name] = report.stat(name);
            });
            standardReport[standardStats.id] = standardStats;
          });

          return standardReport;
        };

        if (arguments.length >= 2) {
          var successCallbackWrapper_ = function(response) {
            args[1](fixChromeStats_(response));
          };

          return origGetStats.apply(this, [successCallbackWrapper_,
              arguments[0]]);
        }

        // promise-support
        return new Promise(function(resolve, reject) {
          if (args.length === 1 && typeof selector === 'object') {
            origGetStats.apply(self,
                [function(response) {
                  resolve.apply(null, [fixChromeStats_(response)]);
                }, reject]);
          } else {
            origGetStats.apply(self, [resolve, reject]);
          }
        });
      };

      return pc;
    };
    window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

    // wrap static methods. Currently just generateCertificate.
    if (webkitRTCPeerConnection.generateCertificate) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return webkitRTCPeerConnection.generateCertificate;
        }
      });
    }

    // add promise support
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = webkitRTCPeerConnection.prototype[method];
      webkitRTCPeerConnection.prototype[method] = function() {
        var self = this;
        if (arguments.length < 1 || (arguments.length === 1 &&
            typeof(arguments[0]) === 'object')) {
          var opts = arguments.length === 1 ? arguments[0] : undefined;
          return new Promise(function(resolve, reject) {
            nativeMethod.apply(self, [resolve, reject, opts]);
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });

    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = webkitRTCPeerConnection.prototype[method];
          webkitRTCPeerConnection.prototype[method] = function() {
            var args = arguments;
            var self = this;
            args[0] = new ((method === 'addIceCandidate')?
                RTCIceCandidate : RTCSessionDescription)(args[0]);
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(self, [args[0],
                  function() {
                    resolve();
                    if (args.length >= 2) {
                      args[1].apply(null, []);
                    }
                  },
                  function(err) {
                    reject(err);
                    if (args.length >= 3) {
                      args[2].apply(null, [err]);
                    }
                  }]
                );
            });
          };
        });
  },

  // Attach a media stream to an element.
  attachMediaStream: function(element, stream) {
    logging('DEPRECATED, attachMediaStream will soon be removed.');
    if (browserDetails.version >= 43) {
      element.srcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      logging('Error attaching stream to element.');
    }
  },

  reattachMediaStream: function(to, from) {
    logging('DEPRECATED, reattachMediaStream will soon be removed.');
    if (browserDetails.version >= 43) {
      to.srcObject = from.srcObject;
    } else {
      to.src = from.src;
    }
  }
};


// Expose public methods.
module.exports = {
  shimOnTrack: chromeShim.shimOnTrack,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia'),
  attachMediaStream: chromeShim.attachMediaStream,
  reattachMediaStream: chromeShim.reattachMediaStream
};

},{"../utils.js":16,"./getusermedia":10}],10:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;

// Expose public methods.
module.exports = function() {
  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints.audio) {
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints.video) {
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return navigator.webkitGetUserMedia(constraints, onSuccess, onError);
  };
  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (c) {
        logging('spec:   ' + JSON.stringify(c)); // whitespace for alignment
        c.audio = constraintsToChrome_(c.audio);
        c.video = constraintsToChrome_(c.video);
        logging('chrome: ' + JSON.stringify(c));
      }
      return origGetUserMedia(c);
    }.bind(this);
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":16}],11:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parts[1],
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      default: // Unknown extensions are silently ignored.
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
       ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + ' ' + fb.parameter +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var fpLine = lines.filter(function(line) {
    return line.indexOf('a=fingerprint:') === 0;
  })[0].substr(14);
  // Note: a=setup line is ignored since we use the 'auto' role.
  var dtlsParameters = {
    role: 'auto',
    fingerprints: [{
      algorithm: fpLine.split(' ')[0],
      value: fpLine.split(' ')[1]
    }]
  };
  return dtlsParameters;
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  // FIXME: add headerExtensions, fecMechanismş and rtcp.
  sdp += 'a=rtcp-mux\r\n';
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(5), 10);
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

SDPUtils.writeSessionBoilerplate = function() {
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  // FIXME: for RTX there might be multiple SSRCs. Not implemented in Edge yet.
  if (transceiver.rtpSender) {
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

// Expose public methods.
module.exports = SDPUtils;

},{}],12:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('./edge_sdp');
var logging = require('../utils').log;

var edgeShim = {
  shimPeerConnection: function() {
    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
    }

    window.RTCPeerConnection = function(config) {
      var self = this;

      var _eventTarget = document.createDocumentFragment();
      ['addEventListener', 'removeEventListener', 'dispatchEvent']
          .forEach(function(method) {
            self[method] = _eventTarget[method].bind(_eventTarget);
          });

      this.onicecandidate = null;
      this.onaddstream = null;
      this.ontrack = null;
      this.onremovestream = null;
      this.onsignalingstatechange = null;
      this.oniceconnectionstatechange = null;
      this.onnegotiationneeded = null;
      this.ondatachannel = null;

      this.localStreams = [];
      this.remoteStreams = [];
      this.getLocalStreams = function() {
        return self.localStreams;
      };
      this.getRemoteStreams = function() {
        return self.remoteStreams;
      };

      this.localDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.remoteDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.signalingState = 'stable';
      this.iceConnectionState = 'new';
      this.iceGatheringState = 'new';

      this.iceOptions = {
        gatherPolicy: 'all',
        iceServers: []
      };
      if (config && config.iceTransportPolicy) {
        switch (config.iceTransportPolicy) {
          case 'all':
          case 'relay':
            this.iceOptions.gatherPolicy = config.iceTransportPolicy;
            break;
          case 'none':
            // FIXME: remove once implementation and spec have added this.
            throw new TypeError('iceTransportPolicy "none" not supported');
          default:
            // don't set iceTransportPolicy.
            break;
        }
      }
      if (config && config.iceServers) {
        // Edge does not like
        // 1) stun:
        // 2) turn: that does not have all of turn:host:port?transport=udp
        this.iceOptions.iceServers = config.iceServers.filter(function(server) {
          if (server && server.urls) {
            server.urls = server.urls.filter(function(url) {
              return url.indexOf('turn:') === 0 &&
                  url.indexOf('transport=udp') !== -1;
            })[0];
            return !!server.urls;
          }
          return false;
        });
      }

      // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
      // everything that is needed to describe a SDP m-line.
      this.transceivers = [];

      // since the iceGatherer is currently created in createOffer but we
      // must not emit candidates until after setLocalDescription we buffer
      // them in this array.
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
      var self = this;
      var sections = SDPUtils.splitSections(self.localDescription.sdp);
      // FIXME: need to apply ice candidates in a way which is async but
      // in-order
      this._localIceCandidatesBuffer.forEach(function(event) {
        var end = !event.candidate || Object.keys(event.candidate).length === 0;
        if (end) {
          for (var j = 1; j < sections.length; j++) {
            if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
              sections[j] += 'a=end-of-candidates\r\n';
            }
          }
        } else if (event.candidate.candidate.indexOf('typ endOfCandidates')
            === -1) {
          sections[event.candidate.sdpMLineIndex + 1] +=
              'a=' + event.candidate.candidate + '\r\n';
        }
        self.localDescription.sdp = sections.join('');
        self.dispatchEvent(event);
        if (self.onicecandidate !== null) {
          self.onicecandidate(event);
        }
        if (!event.candidate && self.iceGatheringState !== 'complete') {
          var complete = self.transceivers.every(function(transceiver) {
            return transceiver.iceGatherer &&
                transceiver.iceGatherer.state === 'completed';
          });
          if (complete) {
            self.iceGatheringState = 'complete';
          }
        }
      });
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype.addStream = function(stream) {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      this.localStreams.push(stream.clone());
      this._maybeFireNegotiationNeeded();
    };

    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var idx = this.localStreams.indexOf(stream);
      if (idx > -1) {
        this.localStreams.splice(idx, 1);
        this._maybeFireNegotiationNeeded();
      }
    };

    // Determines the intersection of local and remote capabilities.
    window.RTCPeerConnection.prototype._getCommonCapabilities =
        function(localCapabilities, remoteCapabilities) {
          var commonCapabilities = {
            codecs: [],
            headerExtensions: [],
            fecMechanisms: []
          };
          localCapabilities.codecs.forEach(function(lCodec) {
            for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
              var rCodec = remoteCapabilities.codecs[i];
              if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                  lCodec.clockRate === rCodec.clockRate &&
                  lCodec.numChannels === rCodec.numChannels) {
                // push rCodec so we reply with offerer payload type
                commonCapabilities.codecs.push(rCodec);

                // FIXME: also need to determine intersection between
                // .rtcpFeedback and .parameters
                break;
              }
            }
          });

          localCapabilities.headerExtensions
              .forEach(function(lHeaderExtension) {
                for (var i = 0; i < remoteCapabilities.headerExtensions.length;
                     i++) {
                  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                  if (lHeaderExtension.uri === rHeaderExtension.uri) {
                    commonCapabilities.headerExtensions.push(rHeaderExtension);
                    break;
                  }
                }
              });

          // FIXME: fecMechanisms
          return commonCapabilities;
        };

    // Create ICE gatherer, ICE transport and DTLS transport.
    window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
        function(mid, sdpMLineIndex) {
          var self = this;
          var iceGatherer = new RTCIceGatherer(self.iceOptions);
          var iceTransport = new RTCIceTransport(iceGatherer);
          iceGatherer.onlocalcandidate = function(evt) {
            var event = new Event('icecandidate');
            event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

            var cand = evt.candidate;
            var end = !cand || Object.keys(cand).length === 0;
            // Edge emits an empty object for RTCIceCandidateComplete‥
            if (end) {
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              if (iceGatherer.state === undefined) {
                iceGatherer.state = 'completed';
              }

              // Emit a candidate with type endOfCandidates to make the samples
              // work. Edge requires addIceCandidate with this empty candidate
              // to start checking. The real solution is to signal
              // end-of-candidates to the other side when getting the null
              // candidate but some apps (like the samples) don't do that.
              event.candidate.candidate =
                  'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
            } else {
              // RTCIceCandidate doesn't have a component, needs to be added
              cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
              event.candidate.candidate = SDPUtils.writeCandidate(cand);
            }

            var complete = self.transceivers.every(function(transceiver) {
              return transceiver.iceGatherer &&
                  transceiver.iceGatherer.state === 'completed';
            });

            // Emit candidate if localDescription is set.
            // Also emits null candidate when all gatherers are complete.
            switch (self.iceGatheringState) {
              case 'new':
                self._localIceCandidatesBuffer.push(event);
                if (end && complete) {
                  self._localIceCandidatesBuffer.push(
                      new Event('icecandidate'));
                }
                break;
              case 'gathering':
                self._emitBufferedCandidates();
                self.dispatchEvent(event);
                if (self.onicecandidate !== null) {
                  self.onicecandidate(event);
                }
                if (complete) {
                  self.dispatchEvent(new Event('icecandidate'));
                  if (self.onicecandidate !== null) {
                    self.onicecandidate(new Event('icecandidate'));
                  }
                  self.iceGatheringState = 'complete';
                }
                break;
              case 'complete':
                // should not happen... currently!
                break;
              default: // no-op.
                break;
            }
          };
          iceTransport.onicestatechange = function() {
            self._updateConnectionState();
          };

          var dtlsTransport = new RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function() {
            self._updateConnectionState();
          };
          dtlsTransport.onerror = function() {
            // onerror does not set state to failed by itself.
            dtlsTransport.state = 'failed';
            self._updateConnectionState();
          };

          return {
            iceGatherer: iceGatherer,
            iceTransport: iceTransport,
            dtlsTransport: dtlsTransport
          };
        };

    // Start the RTP Sender and Receiver for a transceiver.
    window.RTCPeerConnection.prototype._transceive = function(transceiver,
        send, recv) {
      var params = this._getCommonCapabilities(transceiver.localCapabilities,
          transceiver.remoteCapabilities);
      if (send && transceiver.rtpSender) {
        params.encodings = transceiver.sendEncodingParameters;
        params.rtcp = {
          cname: SDPUtils.localCName
        };
        if (transceiver.recvEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
        }
        transceiver.rtpSender.send(params);
      }
      if (recv && transceiver.rtpReceiver) {
        params.encodings = transceiver.recvEncodingParameters;
        params.rtcp = {
          cname: transceiver.cname
        };
        if (transceiver.sendEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
        }
        transceiver.rtpReceiver.receive(params);
      }
    };

    window.RTCPeerConnection.prototype.setLocalDescription =
        function(description) {
          var self = this;
          var sections;
          var sessionpart;
          if (description.type === 'offer') {
            // FIXME: What was the purpose of this empty if statement?
            // if (!this._pendingOffer) {
            // } else {
            if (this._pendingOffer) {
              // VERY limited support for SDP munging. Limited to:
              // * changing the order of codecs
              sections = SDPUtils.splitSections(description.sdp);
              sessionpart = sections.shift();
              sections.forEach(function(mediaSection, sdpMLineIndex) {
                var caps = SDPUtils.parseRtpParameters(mediaSection);
                self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
              });
              this.transceivers = this._pendingOffer;
              delete this._pendingOffer;
            }
          } else if (description.type === 'answer') {
            sections = SDPUtils.splitSections(self.remoteDescription.sdp);
            sessionpart = sections.shift();
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var transceiver = self.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;
              var rejected = mediaSection.split('\n', 1)[0]
                  .split(' ', 2)[1] === '0';

              if (!rejected) {
                var remoteIceParameters = SDPUtils.getIceParameters(
                    mediaSection, sessionpart);
                iceTransport.start(iceGatherer, remoteIceParameters,
                    'controlled');

                var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                    mediaSection, sessionpart);
                dtlsTransport.start(remoteDtlsParameters);

                // Calculate intersection of capabilities.
                var params = self._getCommonCapabilities(localCapabilities,
                    remoteCapabilities);

                // Start the RTCRtpSender. The RTCRtpReceiver for this
                // transceiver has already been started in setRemoteDescription.
                self._transceive(transceiver,
                    params.codecs.length > 0,
                    false);
              }
            });
          }

          this.localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-local-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }

          // If a success callback was provided, emit ICE candidates after it
          // has been executed. Otherwise, emit callback after the Promise is
          // resolved.
          var hasCallback = arguments.length > 1 &&
            typeof arguments[1] === 'function';
          if (hasCallback) {
            var cb = arguments[1];
            window.setTimeout(function() {
              cb();
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              self._emitBufferedCandidates();
            }, 0);
          }
          var p = Promise.resolve();
          p.then(function() {
            if (!hasCallback) {
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              // Usually candidates will be emitted earlier.
              window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
            }
          });
          return p;
        };

    window.RTCPeerConnection.prototype.setRemoteDescription =
        function(description) {
          var self = this;
          var stream = new MediaStream();
          var receiverList = [];
          var sections = SDPUtils.splitSections(description.sdp);
          var sessionpart = sections.shift();
          sections.forEach(function(mediaSection, sdpMLineIndex) {
            var lines = SDPUtils.splitLines(mediaSection);
            var mline = lines[0].substr(2).split(' ');
            var kind = mline[0];
            var rejected = mline[1] === '0';
            var direction = SDPUtils.getDirection(mediaSection, sessionpart);

            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpSender;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;

            var track;
            // FIXME: ensure the mediaSection has rtcp-mux set.
            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                  sessionpart);
            }
            recvEncodingParameters =
                SDPUtils.parseRtpEncodingParameters(mediaSection);

            var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
            if (mid.length) {
              mid = mid[0].substr(6);
            } else {
              mid = SDPUtils.generateIdentifier();
            }

            var cname;
            // Gets the first SSRC. Note that with RTX there might be multiple
            // SSRCs.
            var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                .map(function(line) {
                  return SDPUtils.parseSsrcMedia(line);
                })
                .filter(function(obj) {
                  return obj.attribute === 'cname';
                })[0];
            if (remoteSsrc) {
              cname = remoteSsrc.value;
            }

            var isComplete = SDPUtils.matchPrefix(mediaSection,
                'a=end-of-candidates').length > 0;
            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                .map(function(cand) {
                  return SDPUtils.parseCandidate(cand);
                })
                .filter(function(cand) {
                  return cand.component === '1';
                });
            if (description.type === 'offer' && !rejected) {
              var transports = self._createIceAndDtlsTransports(mid,
                  sdpMLineIndex);
              if (isComplete) {
                transports.iceTransport.setRemoteCandidates(cands);
              }

              localCapabilities = RTCRtpReceiver.getCapabilities(kind);
              sendEncodingParameters = [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];

              rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

              track = rtpReceiver.track;
              receiverList.push([track, rtpReceiver]);
              // FIXME: not correct when there are multiple streams but that is
              // not currently supported in this shim.
              stream.addTrack(track);

              // FIXME: look at direction.
              if (self.localStreams.length > 0 &&
                  self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                // FIXME: actually more complicated, needs to match types etc
                var localtrack = self.localStreams[0]
                    .getTracks()[sdpMLineIndex];
                rtpSender = new RTCRtpSender(localtrack,
                    transports.dtlsTransport);
              }

              self.transceivers[sdpMLineIndex] = {
                iceGatherer: transports.iceGatherer,
                iceTransport: transports.iceTransport,
                dtlsTransport: transports.dtlsTransport,
                localCapabilities: localCapabilities,
                remoteCapabilities: remoteCapabilities,
                rtpSender: rtpSender,
                rtpReceiver: rtpReceiver,
                kind: kind,
                mid: mid,
                cname: cname,
                sendEncodingParameters: sendEncodingParameters,
                recvEncodingParameters: recvEncodingParameters
              };
              // Start the RTCRtpReceiver now. The RTPSender is started in
              // setLocalDescription.
              self._transceive(self.transceivers[sdpMLineIndex],
                  false,
                  direction === 'sendrecv' || direction === 'sendonly');
            } else if (description.type === 'answer' && !rejected) {
              transceiver = self.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpSender = transceiver.rtpSender;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;

              self.transceivers[sdpMLineIndex].recvEncodingParameters =
                  recvEncodingParameters;
              self.transceivers[sdpMLineIndex].remoteCapabilities =
                  remoteCapabilities;
              self.transceivers[sdpMLineIndex].cname = cname;

              if (isComplete) {
                iceTransport.setRemoteCandidates(cands);
              }
              iceTransport.start(iceGatherer, remoteIceParameters,
                  'controlling');
              dtlsTransport.start(remoteDtlsParameters);

              self._transceive(transceiver,
                  direction === 'sendrecv' || direction === 'recvonly',
                  direction === 'sendrecv' || direction === 'sendonly');

              if (rtpReceiver &&
                  (direction === 'sendrecv' || direction === 'sendonly')) {
                track = rtpReceiver.track;
                receiverList.push([track, rtpReceiver]);
                stream.addTrack(track);
              } else {
                // FIXME: actually the receiver should be created later.
                delete transceiver.rtpReceiver;
              }
            }
          });

          this.remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-remote-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }
          if (stream.getTracks().length) {
            self.remoteStreams.push(stream);
            window.setTimeout(function() {
              var event = new Event('addstream');
              event.stream = stream;
              self.dispatchEvent(event);
              if (self.onaddstream !== null) {
                window.setTimeout(function() {
                  self.onaddstream(event);
                }, 0);
              }

              receiverList.forEach(function(item) {
                var track = item[0];
                var receiver = item[1];
                var trackEvent = new Event('track');
                trackEvent.track = track;
                trackEvent.receiver = receiver;
                trackEvent.streams = [stream];
                self.dispatchEvent(event);
                if (self.ontrack !== null) {
                  window.setTimeout(function() {
                    self.ontrack(trackEvent);
                  }, 0);
                }
              });
            }, 0);
          }
          if (arguments.length > 1 && typeof arguments[1] === 'function') {
            window.setTimeout(arguments[1], 0);
          }
          return Promise.resolve();
        };

    window.RTCPeerConnection.prototype.close = function() {
      this.transceivers.forEach(function(transceiver) {
        /* not yet
        if (transceiver.iceGatherer) {
          transceiver.iceGatherer.close();
        }
        */
        if (transceiver.iceTransport) {
          transceiver.iceTransport.stop();
        }
        if (transceiver.dtlsTransport) {
          transceiver.dtlsTransport.stop();
        }
        if (transceiver.rtpSender) {
          transceiver.rtpSender.stop();
        }
        if (transceiver.rtpReceiver) {
          transceiver.rtpReceiver.stop();
        }
      });
      // FIXME: clean up tracks, local streams, remote streams, etc
      this._updateSignalingState('closed');
    };

    // Update the signaling state.
    window.RTCPeerConnection.prototype._updateSignalingState =
        function(newState) {
          this.signalingState = newState;
          var event = new Event('signalingstatechange');
          this.dispatchEvent(event);
          if (this.onsignalingstatechange !== null) {
            this.onsignalingstatechange(event);
          }
        };

    // Determine whether to fire the negotiationneeded event.
    window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
        function() {
          // Fire away (for now).
          var event = new Event('negotiationneeded');
          this.dispatchEvent(event);
          if (this.onnegotiationneeded !== null) {
            this.onnegotiationneeded(event);
          }
        };

    // Update the connection state.
    window.RTCPeerConnection.prototype._updateConnectionState = function() {
      var self = this;
      var newState;
      var states = {
        'new': 0,
        closed: 0,
        connecting: 0,
        checking: 0,
        connected: 0,
        completed: 0,
        failed: 0
      };
      this.transceivers.forEach(function(transceiver) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      });
      // ICETransport.completed and connected are the same for this purpose.
      states.connected += states.completed;

      newState = 'new';
      if (states.failed > 0) {
        newState = 'failed';
      } else if (states.connecting > 0 || states.checking > 0) {
        newState = 'connecting';
      } else if (states.disconnected > 0) {
        newState = 'disconnected';
      } else if (states.new > 0) {
        newState = 'new';
      } else if (states.connected > 0 || states.completed > 0) {
        newState = 'connected';
      }

      if (newState !== self.iceConnectionState) {
        self.iceConnectionState = newState;
        var event = new Event('iceconnectionstatechange');
        this.dispatchEvent(event);
        if (this.oniceconnectionstatechange !== null) {
          this.oniceconnectionstatechange(event);
        }
      }
    };

    window.RTCPeerConnection.prototype.createOffer = function() {
      var self = this;
      if (this._pendingOffer) {
        throw new Error('createOffer called while there is a pending offer.');
      }
      var offerOptions;
      if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        offerOptions = arguments[0];
      } else if (arguments.length === 3) {
        offerOptions = arguments[2];
      }

      var tracks = [];
      var numAudioTracks = 0;
      var numVideoTracks = 0;
      // Default to sendrecv.
      if (this.localStreams.length) {
        numAudioTracks = this.localStreams[0].getAudioTracks().length;
        numVideoTracks = this.localStreams[0].getVideoTracks().length;
      }
      // Determine number of audio and video tracks we need to send/recv.
      if (offerOptions) {
        // Reject Chrome legacy constraints.
        if (offerOptions.mandatory || offerOptions.optional) {
          throw new TypeError(
              'Legacy mandatory/optional constraints not supported.');
        }
        if (offerOptions.offerToReceiveAudio !== undefined) {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
        if (offerOptions.offerToReceiveVideo !== undefined) {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
      if (this.localStreams.length) {
        // Push local streams.
        this.localStreams[0].getTracks().forEach(function(track) {
          tracks.push({
            kind: track.kind,
            track: track,
            wantReceive: track.kind === 'audio' ?
                numAudioTracks > 0 : numVideoTracks > 0
          });
          if (track.kind === 'audio') {
            numAudioTracks--;
          } else if (track.kind === 'video') {
            numVideoTracks--;
          }
        });
      }
      // Create M-lines for recvonly streams.
      while (numAudioTracks > 0 || numVideoTracks > 0) {
        if (numAudioTracks > 0) {
          tracks.push({
            kind: 'audio',
            wantReceive: true
          });
          numAudioTracks--;
        }
        if (numVideoTracks > 0) {
          tracks.push({
            kind: 'video',
            wantReceive: true
          });
          numVideoTracks--;
        }
      }

      var sdp = SDPUtils.writeSessionBoilerplate();
      var transceivers = [];
      tracks.forEach(function(mline, sdpMLineIndex) {
        // For each track, create an ice gatherer, ice transport,
        // dtls transport, potentially rtpsender and rtpreceiver.
        var track = mline.track;
        var kind = mline.kind;
        var mid = SDPUtils.generateIdentifier();

        var transports = self._createIceAndDtlsTransports(mid, sdpMLineIndex);

        var localCapabilities = RTCRtpSender.getCapabilities(kind);
        var rtpSender;
        var rtpReceiver;

        // generate an ssrc now, to be used later in rtpSender.send
        var sendEncodingParameters = [{
          ssrc: (2 * sdpMLineIndex + 1) * 1001
        }];
        if (track) {
          rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
        }

        if (mline.wantReceive) {
          rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
        }

        transceivers[sdpMLineIndex] = {
          iceGatherer: transports.iceGatherer,
          iceTransport: transports.iceTransport,
          dtlsTransport: transports.dtlsTransport,
          localCapabilities: localCapabilities,
          remoteCapabilities: null,
          rtpSender: rtpSender,
          rtpReceiver: rtpReceiver,
          kind: kind,
          mid: mid,
          sendEncodingParameters: sendEncodingParameters,
          recvEncodingParameters: null
        };
        var transceiver = transceivers[sdpMLineIndex];
        sdp += SDPUtils.writeMediaSection(transceiver,
            transceiver.localCapabilities, 'offer', self.localStreams[0]);
      });

      this._pendingOffer = transceivers;
      var desc = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.createAnswer = function() {
      var self = this;

      var sdp = SDPUtils.writeSessionBoilerplate();
      this.transceivers.forEach(function(transceiver) {
        // Calculate intersection of capabilities.
        var commonCapabilities = self._getCommonCapabilities(
            transceiver.localCapabilities,
            transceiver.remoteCapabilities);

        sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
            'answer', self.localStreams[0]);
      });

      var desc = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
      var mLineIndex = candidate.sdpMLineIndex;
      if (candidate.sdpMid) {
        for (var i = 0; i < this.transceivers.length; i++) {
          if (this.transceivers[i].mid === candidate.sdpMid) {
            mLineIndex = i;
            break;
          }
        }
      }
      var transceiver = this.transceivers[mLineIndex];
      if (transceiver) {
        var cand = Object.keys(candidate.candidate).length > 0 ?
            SDPUtils.parseCandidate(candidate.candidate) : {};
        // Ignore Chrome's invalid candidates since Edge does not like them.
        if (cand.protocol === 'tcp' && cand.port === 0) {
          return;
        }
        // Ignore RTCP candidates, we assume RTCP-MUX.
        if (cand.component !== '1') {
          return;
        }
        // A dirty hack to make samples work.
        if (cand.type === 'endOfCandidates') {
          cand = {};
        }
        transceiver.iceTransport.addRemoteCandidate(cand);

        // update the remoteDescription.
        var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
        sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
            : 'a=end-of-candidates') + '\r\n';
        this.remoteDescription.sdp = sections.join('');
      }
      if (arguments.length > 1 && typeof arguments[1] === 'function') {
        window.setTimeout(arguments[1], 0);
      }
      return Promise.resolve();
    };

    window.RTCPeerConnection.prototype.getStats = function() {
      var promises = [];
      this.transceivers.forEach(function(transceiver) {
        ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
            'dtlsTransport'].forEach(function(method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
      });
      var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
          arguments[1];
      return new Promise(function(resolve) {
        var results = {};
        Promise.all(promises).then(function(res) {
          res.forEach(function(result) {
            Object.keys(result).forEach(function(id) {
              results[id] = result[id];
            });
          });
          if (cb) {
            window.setTimeout(cb, 0, results);
          }
          resolve(results);
        });
      });
    };
  },

  // Attach a media stream to an element.
  attachMediaStream: function(element, stream) {
    logging('DEPRECATED, attachMediaStream will soon be removed.');
    element.srcObject = stream;
  },

  reattachMediaStream: function(to, from) {
    logging('DEPRECATED, reattachMediaStream will soon be removed.');
    to.srcObject = from.srcObject;
  }
};

// Expose public methods.
module.exports = {
  shimPeerConnection: edgeShim.shimPeerConnection,
  attachMediaStream: edgeShim.attachMediaStream,
  reattachMediaStream: edgeShim.reattachMediaStream
};

},{"../utils":16,"./edge_sdp":11}],13:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

var firefoxShim = {
  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = mozRTCSessionDescription;
      window.RTCIceCandidate = mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate')?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });
  },

  shimGetUserMedia: function() {
    // getUserMedia constraints shim.
    var getUserMedia_ = function(constraints, onSuccess, onError) {
      var constraintsToFF37_ = function(c) {
        if (typeof c !== 'object' || c.require) {
          return c;
        }
        var require = [];
        Object.keys(c).forEach(function(key) {
          if (key === 'require' || key === 'advanced' ||
              key === 'mediaSource') {
            return;
          }
          var r = c[key] = (typeof c[key] === 'object') ?
              c[key] : {ideal: c[key]};
          if (r.min !== undefined ||
              r.max !== undefined || r.exact !== undefined) {
            require.push(key);
          }
          if (r.exact !== undefined) {
            if (typeof r.exact === 'number') {
              r. min = r.max = r.exact;
            } else {
              c[key] = r.exact;
            }
            delete r.exact;
          }
          if (r.ideal !== undefined) {
            c.advanced = c.advanced || [];
            var oc = {};
            if (typeof r.ideal === 'number') {
              oc[key] = {min: r.ideal, max: r.ideal};
            } else {
              oc[key] = r.ideal;
            }
            c.advanced.push(oc);
            delete r.ideal;
            if (!Object.keys(r).length) {
              delete c[key];
            }
          }
        });
        if (require.length) {
          c.require = require;
        }
        return c;
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      if (browserDetails.version < 38) {
        logging('spec: ' + JSON.stringify(constraints));
        if (constraints.audio) {
          constraints.audio = constraintsToFF37_(constraints.audio);
        }
        if (constraints.video) {
          constraints.video = constraintsToFF37_(constraints.video);
        }
        logging('ff37: ' + JSON.stringify(constraints));
      }
      return navigator.mozGetUserMedia(constraints, onSuccess, onError);
    };

    navigator.getUserMedia = getUserMedia_;

    // Returns the result of getUserMedia as a Promise.
    var getUserMediaPromise_ = function(constraints) {
      return new Promise(function(resolve, reject) {
        navigator.getUserMedia(constraints, resolve, reject);
      });
    };

    // Shim for mediaDevices on older versions.
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
        addEventListener: function() { },
        removeEventListener: function() { }
      };
    }
    navigator.mediaDevices.enumerateDevices =
        navigator.mediaDevices.enumerateDevices || function() {
          return new Promise(function(resolve) {
            var infos = [
              {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
              {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
            ];
            resolve(infos);
          });
        };

    if (browserDetails.version < 41) {
      // Work around http://bugzil.la/1169665
      var orgEnumerateDevices =
          navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
      navigator.mediaDevices.enumerateDevices = function() {
        return orgEnumerateDevices().then(undefined, function(e) {
          if (e.name === 'NotFoundError') {
            return [];
          }
          throw e;
        });
      };
    }
  },

  // Attach a media stream to an element.
  attachMediaStream: function(element, stream) {
    logging('DEPRECATED, attachMediaStream will soon be removed.');
    element.srcObject = stream;
  },

  reattachMediaStream: function(to, from) {
    logging('DEPRECATED, reattachMediaStream will soon be removed.');
    to.srcObject = from.srcObject;
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia'),
  attachMediaStream: firefoxShim.attachMediaStream,
  reattachMediaStream: firefoxShim.reattachMediaStream
};

},{"../utils":16,"./getusermedia":14}],14:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

// Expose public methods.
module.exports = function() {
  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, onError);
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
};

},{"../utils":16}],15:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests
  // shimOnTrack: function() { },

  // TODO: DrAlex
  // attachMediaStream: function(element, stream) { },
  // reattachMediaStream: function(to, from) { },

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimGetUserMedia: function() {
    navigator.getUserMedia = navigator.webkitGetUserMedia;
  }
};

// Expose public methods.
module.exports = {
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimOnTrack: safariShim.shimOnTrack,
  // shimPeerConnection: safariShim.shimPeerConnection,
  // attachMediaStream: safariShim.attachMediaStream,
  // reattachMediaStream: safariShim.reattachMediaStream
};

},{}],16:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = false;

// Utility methods.
var utils = {
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser, version and minVersion
   *     properties.
   */
  detectBrowser: function() {
    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;
    result.minVersion = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = this.extractVersion(navigator.userAgent,
          /Firefox\/([0-9]+)\./, 1);
      result.minVersion = 31;

    // all webkit-based browsers
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = this.extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/([0-9]+)\./, 2);
        result.minVersion = 38;

      // Safari or unknown webkit-based
      // for the time being Safari has support for MediaStreams but not webRTC
      } else {
        // Safari UA substrings of interest for reference:
        // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
        // - safari UI version:        Version/9.0.3 (unique to Safari)
        // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
        //
        // if the webkit version and safari UI webkit versions are equals,
        // ... this is a stable version.
        //
        // only the internal webkit version is important today to know if
        // media streams are supported
        //
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = this.extractVersion(navigator.userAgent,
            /AppleWebKit\/([0-9]+)\./, 1);
          result.minVersion = 602;

        // unknown webkit-based browser
        } else {
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }

    // Edge.
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = 'edge';
      result.version = this.extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
      result.minVersion = 10547;

    // Default fallthrough: not supported.
    } else {
      result.browser = 'Not a supported browser.';
      return result;
    }

    // Warn if version is less than minVersion.
    if (result.version < result.minVersion) {
      utils.log('Browser: ' + result.browser + ' Version: ' + result.version +
          ' < minimum supported version: ' + result.minVersion +
          '\n some things might not work!');
    }

    return result;
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  browserDetails: utils.detectBrowser(),
  extractVersion: utils.extractVersion
};

},{}],17:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

var isBrowser = !(typeof window === 'undefined');
if (!isBrowser) {
	var Q = require('q');
} else {
	var Q = window.Q;
}

var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = false;
var Logger = {
	log: function log() {
		var _console;

		if (DEBUG) (_console = console).log.apply(_console, arguments);
	},

	error: function error() {
		var _console2;

		if (DEBUG) (_console2 = console).error.apply(_console2, arguments);
	}
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////


function DiyaNode() {
	EventEmitter.call(this);

	this._user = null;
	this._authenticated = null;
	this._pass = null;

	this._status = 'closed';
	this._addr = null;
	this._socket = null;
	this._nextId = 0;
	this._connectionDeferred = null;
	this._disconnectionDeferred = null;
	this._pendingMessages = [];
	this._peers = [];
	this._reconnectTimeout = 1000;
	this._connectTimeout = 5000;
}
inherits(DiyaNode, EventEmitter);

////////////////////////////////////////////////////
////////////////// Public API //////////////////////
////////////////////////////////////////////////////

DiyaNode.prototype.user = function (user) {
	if (user) this._user = user;else return this._user;
};
DiyaNode.prototype.authenticated = function (authenticated) {
	if (authenticated !== undefined) this._authenticated = authenticated;else return this._authenticated;
};
DiyaNode.prototype.pass = function (pass) {
	if (pass !== undefined) this._pass = pass;else return this._pass;
};
DiyaNode.prototype.addr = function () {
	return this._addr;
};
DiyaNode.prototype.peers = function () {
	return this._peers;
};
DiyaNode.prototype.self = function () {
	return this._self;
};
DiyaNode.prototype.setSecured = function (bSecured) {
	this._secured = bSecured !== false;
};
DiyaNode.prototype.setWSocket = function (WSocket) {
	this._WSocket = WSocket;
};

/** @return {Promise<String>} the connected peer name */
DiyaNode.prototype.connect = function (addr, WSocket) {
	var that = this;
	this.bDontReconnect = false;

	if (WSocket) this._WSocket = WSocket;else if (!this._WSocket) this._WSocket = window.WebSocket;
	WSocket = this._WSocket;

	// Check and Format URI (FQDN)
	if (addr.indexOf("ws://") === 0 && this._secured) return Q.reject("Please use a secured connection (" + addr + ")");
	if (addr.indexOf("wss://") === 0 && this._secured === false) return Q.reject("Please use a non-secured connection (" + addr + ")");
	if (addr.indexOf("ws://") !== 0 && addr.indexOf("wss://") !== 0) {
		if (this._secured) addr = "wss://" + addr;else addr = "ws://" + addr;
	}

	if (this._addr === addr) {
		if (this._status === 'opened') return Q(this.self());else if (this._connectionDeferred && this._connectionDeferred.promise && this._connectionDeferred.promise.isPending()) return this._connectionDeferred.promise;
	}

	return this.close().then(function () {
		that._addr = addr;
		that._connectionDeferred = Q.defer();
		Logger.log('d1: connect to ' + that._addr);
		var sock = new SocketHandler(WSocket, that._addr, that._connectTimeout);

		if (!that._socketHandler) that._socketHandler = sock;

		that._onopening();

		sock.on('open', function () {
			if (that._socketHandler !== sock) {
				console.log("[d1] Websocket responded but already connected to a different one");
				return;
			}
			that._socketHandler = sock;
			that._status = 'opened';
			that._setupPingResponse();
		});

		sock.on('closing', function () {
			if (that._socketHandler !== sock) return;
			that._onclosing();
		});

		sock.on('close', function () {
			if (that._socketHandler !== sock) return;
			that._socketHandler = null;
			that._status = 'closed';
			that._stopPingResponse();
			that._onclose();
			if (that._connectionDeferred) {
				that._connectionDeferred.reject("closed");that._connectionDeferred = null;
			}
		});

		sock.on('error', function (error) {
			if (that._socketHandler !== sock) return;
			that._onerror(error);
		});

		sock.on('timeout', function () {
			if (that._socketHandler !== sock) return;
			that._socketHandler = null;
			that._status = 'closed';
			if (that._connectionDeferred) {
				that._connectionDeferred.reject("closed");that._connectionDeferred = null;
			}
		});

		sock.on('message', function (message) {
			that._onmessage(message);
		});

		return that._connectionDeferred.promise;
	});
};

DiyaNode.prototype.disconnect = function () {
	this.bDontReconnect = true;
	return this.close();
};

DiyaNode.prototype.close = function () {
	this._stopPingResponse();
	if (this._socketHandler) return this._socketHandler.close();else return Q();
};

DiyaNode.prototype.isConnected = function () {
	return this._socketHandler && this._socketHandler.isConnected();
};

DiyaNode.prototype.request = function (params, callback, timeout, options) {
	var that = this;
	if (!options) options = {};

	if (params.constructor === String) {
		var _params = params.split(".");
		if (_params.length != 2) throw 'MalformedRequest';
		params = { service: _params[0], func: _params[1] };
	}

	if (!params.service) {
		Logger.error('No service defined for request !');
		return false;
	}

	var message = this._createMessage(params, "Request");
	this._appendMessage(message, callback);
	if (typeof options.callback_partial === 'function') this._pendingMessages[message.id].callback_partial = options.callback_partial;
	message.options = options;

	if (!isNaN(timeout) && timeout > 0) {
		setTimeout(function () {
			var handler = that._removeMessage(message.id);
			if (handler) that._notifyListener(handler, 'Timeout exceeded (' + timeout + 'ms) !');
		}, timeout);
	}

	if (!this._send(message)) {
		this._removeMessage(message.id);
		console.error('Cannot send request !');
		return false;
	}

	return true;
};

DiyaNode.prototype.subscribe = function (params, callback) {
	if (params.constructor === String) {
		var _params = params.split(".");
		if (_params.length != 2) throw 'MalformedRequest';
		params = { service: _params[0], func: _params[1] };
	}

	if (!params.service) {
		Logger.error('No service defined for subscription !');
		return -1;
	}

	var message = this._createMessage(params, "Subscription");
	this._appendMessage(message, callback);

	if (!this._send(message)) {
		this._removeMessage(message.id);
		Logger.error('Cannot send subscription !');
		return -1;
	}

	return message.id;
};

DiyaNode.prototype.unsubscribe = function (subId) {
	if (this._pendingMessages[subId] && this._pendingMessages[subId].type === "Subscription") {
		var subscription = this._removeMessage(subId);

		var message = this._createMessage({
			target: subscription.target,
			data: {
				subId: subId
			}
		}, "Unsubscribe");

		if (!this._send(message)) {
			Logger.error('Cannot send unsubscribe !');
			return false;
		}

		return true;
	}
	return false;
};

///////////////////////////////////////////////////////////
//////////////////// Internal methods /////////////////////
///////////////////////////////////////////////////////////

DiyaNode.prototype._appendMessage = function (message, callback) {
	this._pendingMessages[message.id] = {
		callback: callback,
		type: message.type,
		target: message.target
	};
};

DiyaNode.prototype._removeMessage = function (messageId) {
	var handler = this._pendingMessages[messageId];
	if (handler) {
		delete this._pendingMessages[messageId];
		return handler;
	} else {
		return null;
	}
};

DiyaNode.prototype._clearMessages = function (err, data) {
	for (var messageId in this._pendingMessages) {
		var handler = this._removeMessage(messageId);
		this._notifyListener(handler, err, data);
	}
};

DiyaNode.prototype._clearPeers = function () {
	while (this._peers.length) {
		this.emit('peer-disconnected', this._peers.pop());
	}
};

DiyaNode.prototype._getMessageHandler = function (messageId) {
	var handler = this._pendingMessages[messageId];
	return handler ? handler : null;
};

DiyaNode.prototype._notifyListener = function (handler, error, data) {
	if (handler && typeof handler.callback === 'function') {
		error = error ? error : null;
		data = data ? data : null;
		try {
			handler.callback(error, data);
		} catch (e) {
			console.log('[Error in Request callback] ' + e.stack ? e.stack : e);
		}
	}
};

DiyaNode.prototype._send = function (message) {
	return this._socketHandler && this._socketHandler.send(message);
};

DiyaNode.prototype._setupPingResponse = function () {
	var that = this;

	this._pingTimeout = 15000;
	this._lastPing = new Date().getTime();

	function checkPing() {
		var curTime = new Date().getTime();
		if (curTime - that._lastPing > that._pingTimeout) {
			that._forceClose();
			Logger.log("d1:  timed out !");
		} else {
			Logger.log("d1: last ping ok");
			that._pingSetTimeoutId = setTimeout(checkPing, Math.round(that._pingTimeout / 2.1));
		}
	}

	checkPing();
};

DiyaNode.prototype._stopPingResponse = function () {
	clearTimeout(this._pingSetTimeoutId);
};

DiyaNode.prototype._forceClose = function () {
	this._socketHandler.close();
	this._onclose();
};

///////////////////////////////////////////////////////////////
/////////////////// Socket event handlers /////////////////////
///////////////////////////////////////////////////////////////


DiyaNode.prototype._onmessage = function (message) {
	if (isNaN(message.id)) return this._handleInternalMessage(message);
	var handler = this._getMessageHandler(message.id);
	if (!handler) return;
	switch (handler.type) {
		case "Request":
			this._handleRequest(handler, message);
			break;
		case "Subscription":
			this._handleSubscription(handler, message);
			break;
	}
};

DiyaNode.prototype._onopening = function () {
	this.emit('opening', this);
};

DiyaNode.prototype._onerror = function (error) {
	this.emit('error', new Error(error));
};

DiyaNode.prototype._onclosing = function () {
	this.emit('closing', this);
};

DiyaNode.prototype._onclose = function () {
	var that = this;

	this._clearMessages('PeerDisconnected');
	this._clearPeers();

	if (!this.bDontReconnect) {
		Logger.log('d1: connection lost, try reconnecting');
		setTimeout(function () {
			that.connect(that._addr, that._WSocket).catch(function (err) {});
		}, that._reconnectTimeout);
	}
	this.emit('close', this._addr);
};

/////////////////////////////////////////////////////////////
/////////////// Protocol event handlers /////////////////////
/////////////////////////////////////////////////////////////

DiyaNode.prototype._handleInternalMessage = function (message) {
	switch (message.type) {
		case "PeerConnected":
			this._handlePeerConnected(message);
			break;
		case "PeerDisconnected":
			this._handlePeerDisconnected(message);
			break;
		case "Handshake":
			this._handleHandshake(message);
			break;
		case "Ping":
			this._handlePing(message);
			break;
	}
};

DiyaNode.prototype._handlePing = function (message) {
	message.type = "Pong";
	this._lastPing = new Date().getTime();
	this._send(message);
};

DiyaNode.prototype._handleHandshake = function (message) {

	if (message.peers === undefined || typeof message.self !== 'string') {
		Logger.error("Missing arguments for Handshake message, dropping...");
		return;
	}

	this._self = message.self;

	for (var i = 0; i < message.peers.length; i++) {
		this._peers.push(message.peers[i]);
		this.emit('peer-connected', message.peers[i]);
	}

	this._connectionDeferred.resolve(this.self());
	this.emit('open', this._addr);
	this._status = 'opened';
	this._connectionDeferred = null;
};

DiyaNode.prototype._handlePeerConnected = function (message) {
	if (message.peerId === undefined) {
		Logger.error("Missing arguments for PeerConnected message, dropping...");
		return;
	}

	//Add peer to the list of reachable peers
	this._peers.push(message.peerId);

	this.emit('peer-connected', message.peerId);
};

DiyaNode.prototype._handlePeerDisconnected = function (message) {
	if (message.peerId === undefined) {
		Logger.error("Missing arguments for PeerDisconnected Message, dropping...");
		return;
	}

	//Go through all pending messages and notify the ones that are targeted
	//at the disconnected peer that it disconnected and therefore the command
	//cannot be fulfilled
	for (var messageId in this._pendingMessages) {
		var handler = this._getMessageHandler(messageId);
		if (handler && handler.target === message.peerId) {
			this._removeMessage(messageId);
			this._notifyListener(handler, 'PeerDisconnected', null);
		}
	}

	//Remove peer from list of reachable peers
	for (var i = this._peers.length - 1; i >= 0; i--) {
		if (this._peers[i] === message.peerId) {
			this._peers.splice(i, 1);
			break;
		}
	}

	this.emit('peer-disconnected', message.peerId);
};

DiyaNode.prototype._handleRequest = function (handler, message) {
	if (message.type === 'PartialAnswer') {
		if (typeof this._pendingMessages[message.id].callback_partial === 'function') {
			var error = message.error ? message.error : null;
			var data = message.data ? message.data : null;
			this._pendingMessages[message.id].callback_partial(error, data);
		}
	} else {
		this._removeMessage(message.id);
		this._notifyListener(handler, message.error, message.data);
	}
};

DiyaNode.prototype._handleSubscription = function (handler, message) {
	//remove subscription if it was closed from node
	if (message.result === "closed") {
		this._removeMessage(message.id);
		message.error = 'SubscriptionClosed';
	}
	this._notifyListener(handler, message.error, message.data ? message.data : null);
};

///////////////////
// SocketHandler //
///////////////////

function SocketHandler(WSocket, addr, timeout) {
	var that = this;
	this.addr = addr;

	if (WSocket) this._WSocket = WSocket;else if (!this._WSocket) this._WSocket = window.WebSocket;
	WSocket = this._WSocket;

	this._status = 'opening';

	try {
		this._socket = addr.indexOf("wss://") === 0 ? new WSocket(addr, undefined, { rejectUnauthorized: false }) : new WSocket(addr);

		this._socketOpenCallback = this._onopen.bind(this);
		this._socketCloseCallback = this._onclose.bind(this);
		this._socketMessageCallback = this._onmessage.bind(this);
		this._socketErrorCallback = this._onerror.bind(this);

		this._socket.addEventListener('open', this._socketOpenCallback);
		this._socket.addEventListener('close', this._socketCloseCallback);
		this._socket.addEventListener('message', this._socketMessageCallback);
		this._socket.addEventListener('error', this._socketErrorCallback);

		this._socket.addEventListener('error', function (err) {
			Logger.error("[WS] error : ", err);
			that._socket.close();
		});

		setTimeout(function () {
			if (that._status === 'opened') return;
			if (that._status !== 'closed') {
				Logger.log('d1: ' + that.addr + ' timed out while connecting');
				that.close();
				that.emit('timeout', that._socket);
			}
		}, timeout);
	} catch (e) {
		Logger.error(e.stack);
		that.close();
		throw e;
	}
};
inherits(SocketHandler, EventEmitter);

SocketHandler.prototype.close = function () {
	if (this._disconnectionDeferred && this._disconnectionDeferred.promise) return this._disconnectionDeferred.promise;
	this._disconnectionDeferred = Q.defer();
	this._status = 'closing';
	this.emit('closing', this._socket);
	if (this._socket) this._socket.close();
	return this._disconnectionDeferred.promise;
};

SocketHandler.prototype.send = function (message) {
	try {
		var data = JSON.stringify(message);
	} catch (err) {
		console.error('Cannot serialize message');
		return false;
	}

	try {
		this._socket.send(data);
	} catch (err) {
		console.error('Cannot send message');
		console.error(err);
		return false;
	}

	return true;
};

SocketHandler.prototype.isConnected = function () {
	return this._socket.readyState == this._WSocket.OPEN && this._status === 'opened';
};

SocketHandler.prototype._onopen = function () {
	this._status = 'opened';
	this.emit('open', this._socket);
};

SocketHandler.prototype._onclose = function (evt) {
	this._status = 'closed';
	this.unregisterCallbacks();
	this.emit('close', this._socket);
	if (this._disconnectionDeferred && this._disconnectionDeferred.promise) this._disconnectionDeferred.resolve();
};

SocketHandler.prototype._onmessage = function (evt) {
	try {
		var message = JSON.parse(evt.data);
		this.emit('message', message);
	} catch (err) {
		Logger.error("[WS] cannot parse message, dropping...");
		throw err;
	}
};

SocketHandler.prototype._onerror = function (evt) {
	this.emit('error', evt);
};

SocketHandler.prototype.unregisterCallbacks = function () {
	if (this._socket && typeof this._socket.removeEventListener === 'function') {
		this._socket.removeEventListener('open', this._socketOpenCallback);
		this._socket.removeEventListener('close', this._socketCloseCallback);
		this._socket.removeEventListener('message', this._socketMessageCallback);
	} else if (this._socket && typeof this._socket.removeAllListeners === 'function') {
		this._socket.removeAllListeners();
	}
};

///////////////////////////////////////////////////////////////
////////////////////// Utility methods ////////////////////////
///////////////////////////////////////////////////////////////

DiyaNode.prototype._createMessage = function (params, type) {
	if (!params || !type || type !== "Request" && type !== "Subscription" && type !== "Unsubscribe") {
		return null;
	}

	return {
		type: type,
		id: this._generateId(),
		service: params.service,
		target: params.target,
		func: params.func,
		obj: params.obj,
		data: params.data
	};
};

DiyaNode.prototype._generateId = function () {
	var id = this._nextId;
	this._nextId++;
	return id;
};

module.exports = DiyaNode;

},{"inherits":2,"node-event-emitter":3,"q":undefined}],18:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

var isBrowser = !(typeof window === 'undefined');
if (!isBrowser) {
	var Q = require('q');
} else {
	var Q = window.Q;
}
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

//////////////
//  D1 API  //
//////////////

function newInstance() {

	var connection = new DiyaNode();

	var d1inst = function d1inst(selector) {
		return new DiyaSelector(selector, connection);
	};

	d1inst.DiyaNode = DiyaNode;
	d1inst.DiyaSelector = DiyaSelector;

	d1inst.connect = function (addr, WSocket) {
		return connection.connect(addr, WSocket);
	};

	d1inst.disconnect = function () {
		return connection.disconnect();
	};

	d1inst.isConnected = function () {
		return connection.isConnected();
	};
	d1inst.peers = function () {
		return connection.peers();
	};
	d1inst.self = function () {
		return connection.self();
	};
	d1inst.addr = function () {
		return connection.addr();
	};
	d1inst.user = function () {
		return connection.user();
	};
	d1inst.pass = function () {
		return connection.pass();
	};
	d1inst.isAuthenticated = function () {
		return connection.authenticated();
	};

	d1inst.parsePeer = function (addrStr) {
		var peer = {};

		// <nothing> -> wss://localhost/api
		if (!addrStr || addrStr === "") {
			peer.addr = "wss://localhost/api";
			peer.addrNet = "wss://localhost/net";
		}
		// 1234 -> ws://localhost:1234
		else if (/^[0-9]*$/.test(addrStr)) {
				peer.addr = "ws://localhost:" + addrStr;
			}
			// 10.42.0.1 -> wss://10.42.0.1/api
			//          -> wss://10.24.0.1/net
			else if (IP_REGEX.test(addrStr)) {
					peer.addr = "wss://" + addrStr + "/api";
					peer.addrNet = "wss://" + addrStr + "/net";
				}
				// 10.42.0.1:1234 -> ws://10.42.0.1:1234
				else if (IP_REGEX.test(addrStr.split(':')[0]) && /^[0-9]*$/.test(addrStr.split(':')[1])) {
						peer.addr = "ws://" + addrStr;
					}
					// wss://someaddress.com/stuff -> wss://someaddress.com/stuff
					// ws://someaddress.com/stuff -> ws://someaddress.com/stuff
					else if (addrStr.indexOf("wss://") === 0 || addrStr.indexOf("ws://") === 0) {
							peer.addr = addrStr;
						}
						// somedomain/somesite -> "wss://somedomain/somesite/api
						//                     -> "wss://somedomain/somesite/net
						//                     -> somesite
						else if (addrStr.split('/').length === 2) {
								peer.addr = "wss://" + addrStr + '/api';
								peer.addrNet = "wss://" + addrStr + '/net';
								peer.name = addrStr.split('/')[1];
							}
							// somedomain/somesite/api -> "wss://somedomain/somesite/api"
							//                         -> "wss://somedomain/somesite/net"
							//                         -> somesite
							else if (addrStr.split('/').length === 3 && addrStr.split('/')[2] === "api") {
									peer.addr = "wss://" + addrStr;
									peer.addrNet = "wss://" + addrStr.substr(0, addrStr.length - 4);
									peer.name = addrStr.split('/')[1];
								}
								// somesite -> "wss://partnering-cloud.com/somesite/api"
								//          -> "wss://partnering-cloud.com/somesite/net"
								//          -> somesite
								else {
										peer.addr = "wss://partnering-cloud.com/" + addrStr + "/api";
										peer.addrNet = "wss://partnering-cloud.com/" + addrStr + "/net";
										peer.name = addrStr;
									}

		return peer;
	};

	/** Try to connect to the given servers list in the list order, until finding an available one */
	d1inst.tryConnect = function (servers, WSocket) {
		var deferred = Q.defer();
		function tc(i) {
			d1inst.connect(servers[i], WSocket).then(function (e) {
				return deferred.resolve(servers[i]);
			}).catch(function (e) {
				d1inst.disconnect().then(function () {
					i++;
					if (i < servers.length) setTimeout(function () {
						tc(i);
					}, 100);else return deferred.reject("Timeout");
				});
			});
		}
		tc(0);
		return deferred.promise;
	};

	d1inst.currentServer = function () {
		return connection._addr;
	};

	d1inst.on = function (event, callback) {
		connection.on(event, callback);
		return d1inst;
	};

	d1inst.removeListener = function (event, callback) {
		connection.removeListener(event, callback);
		return d1inst;
	};

	/** Shorthand function to connect and login with the given (user,password) */
	d1inst.connectAsUser = function (ip, user, password, WSocket) {
		return d1inst.connect(ip, WSocket).then(function () {
			return d1inst("#self").auth(user, password);
		});
	};

	d1inst.deauthenticate = function () {
		connection.authenticated(false);connection.user(null);connection.pass(null);
	};
	d1inst.setSecured = function (bSecured) {
		connection.setSecured(bSecured);
	};
	d1inst.isSecured = function () {
		return connection._secured;
	};
	d1inst.setWSocket = function (WSocket) {
		connection.setWSocket(WSocket);
	};

	/** Self-authenticate the local DiyaNode bound to port <port>, using its RSA signature */
	d1inst.selfConnect = function (port, signature, WSocket) {
		return d1inst.connect('ws://localhost:' + port, WSocket).then(function () {
			var deferred = Q.defer();
			d1inst("#self").request({
				service: 'peerAuth',
				func: 'SelfAuthenticate',
				data: { signature: signature }
			}, function (peerId, err, data) {
				if (err) return deferred.reject(err);
				if (data && data.authenticated) {
					connection.authenticated(true);
					connection.user("#DiyaNode#" + peerId);
					deferred.resolve();
				} else {
					connection.authenticated(false);
					deferred.reject('AccessDenied');
				}
			});
			return deferred.promise;
		});
	};

	return d1inst;
}

var d1 = newInstance();
d1.newInstance = newInstance;

//////////////////
// DiyaSelector //
//////////////////

function DiyaSelector(selector, connection) {
	EventEmitter.call(this);

	this._connection = connection;
	this._selector = selector;
	this._listenerCount = 0;
	this._listenCallback = null;
	this._callbackAttached = false;
}
inherits(DiyaSelector, EventEmitter);

//////////////////////////////////////////////////////////
////////////////////// Public API ////////////////////////
//////////////////////////////////////////////////////////

DiyaSelector.prototype.select = function () {
	return this._select();
};

/**
 * Apply callback cb to each selected peer. Peers are selected
 * according to the rule 'selector' given to constructor. Selector can
 * be a peerId, a regEx for peerIds of an array of peerIds.
 * @params 	cb		callback to be applied
 * @return 	this 	<DiyaSelector>
 */
DiyaSelector.prototype.each = function (cb) {
	var peers = this._select();
	for (var i = 0; i < peers.length; i++) {
		cb.bind(this)(peers[i]);
	}return this;
};

/**
 * Send request to selected peers ( see each() ) through the current connection (DiyaNode).
 * @param {String | Object} params : can be service.function or {service:service, func:function, ...}
 */
DiyaSelector.prototype.request = function (params, callback, timeout, options) {
	if (!this._connection) return this;
	if (!options) options = {};
	if (params.constructor === String) {
		var _params = params.split(".");
		if (_params.length != 2) throw 'MalformedRequest';
		params = { service: _params[0], func: _params[1] };
	}

	var nbAnswers = 0;
	var nbExpected = this._select().length;
	if (nbExpected === 0 && options.bNotifyWhenFinished) callback(null, null, "##END##");
	return this.each(function (peerId) {
		params.target = peerId;

		var opts = {};
		for (var i in options) {
			opts[i] = options[i];
		}if (typeof opts.callback_partial === 'function') opts.callback_partial = function (err, data) {
			options.callback_partial(peerId, err, data);
		};

		this._connection.request(params, function (err, data) {
			if (typeof callback === 'function') callback(peerId, err, data);
			nbAnswers++;
			if (nbAnswers == nbExpected && options.bNotifyWhenFinished) callback(null, err, "##END##"); // TODO : Find a better way to notify request END !!
		}, timeout, opts);
	});
};

// IMPORTANT !!! By 30/11/15, this method doesn't return 'this' anymore, but a Subscription object instead
/* @param {String | Object} params : can be 'service.function' or {service:service, func:function, ...} */
DiyaSelector.prototype.subscribe = function (params, callback, options) {
	if (params.constructor === String) {
		var _params = params.split(".");
		if (_params.length != 2) throw 'MalformedSubscription';
		params = { service: _params[0], func: _params[1] };
	}

	return new Subscription(this, params, callback, options);
};

// IMPORTANT !!! BY 30/11/15, this method doesn't take subIds as input anymore.
// Please provide a subscription instead !
DiyaSelector.prototype.unsubscribe = function (subscription) {
	if (Array.isArray(subscription) || !subscription.close) return this.__old_deprecated_unsubscribe(subscription);
	return subscription.close();
};

DiyaSelector.prototype.auth = function (user, password, callback, timeout) {
	var that = this;
	if (typeof callback === 'function') callback = callback.bind(this);

	var deferred = Q.defer();

	this.request({
		service: 'auth',
		func: 'Authenticate',
		data: {
			user: user, // DEPRECATED, kept for now for backward compatiblity (will be dropped)
			username: user, // New syntax since switching to DBus
			password: password
		}
	}, function (peerId, err, data) {

		if (err === 'ServiceNotFound') {
			if (typeof callback === 'function') callback(peerId, true);else deferred.reject(err);
			return;
		}

		// data.authenticated is DEPRECATED, kept for backward compatibility
		if (!err && data && (data === true || data.authenticated === true)) {
			that._connection.authenticated(true);
			that._connection.user(user);
			that._connection.pass(password);
			if (typeof callback === 'function') callback(peerId, true);else deferred.resolve();
		} else {
			that._connection.authenticated(false);
			if (typeof callback === 'function') callback(peerId, false);else deferred.reject('AccessDenied');
		}
	}, timeout);

	return deferred.promise;
};

// Privates

DiyaSelector.prototype._select = function (selectorFunction) {
	var that = this;

	if (!this._connection) return [];
	return this._connection.peers().filter(function (peerId) {
		return that._match(that._selector, peerId);
	});
};

DiyaSelector.prototype._match = function (selector, str) {
	if (!selector) return false;
	if (selector === "#self") {
		return this._connection && str === this._connection.self();
	} else if (selector.not) return !this._match(selector.not, str);else if (selector.constructor.name === 'String') {
		return matchString(selector, str);
	} else if (selector.constructor.name === 'RegExp') {
		return matchRegExp(selector, str);
	} else if (Array.isArray(selector)) {
		return matchArray(selector, str);
	}
	return false;
};

function matchString(selector, str) {
	return selector === str;
}

function matchRegExp(selector, str) {
	return str.match(selector);
}

function matchArray(selector, str) {
	for (var i = 0; i < selector.length; i++) {
		if (selector[i] === str) return true;
	}
	return false;
}

// Overrides EventEmitter's behavior to proxy and filter events from the connection
DiyaSelector.prototype._on = DiyaSelector.prototype.on;
DiyaSelector.prototype.on = function (type, callback) {
	var that = this;
	callback.___DiyaSelector_hidden_wrapper = function (peerId) {
		if (that._match(that._selector, peerId)) that.emit(type, peerId);
	};
	this._connection.on(type, callback.___DiyaSelector_hidden_wrapper);
	var ret = this._on(type, callback);

	// Handle the specific case of "peer-connected" events, i.e., notify of already connected peers
	if (type === 'peer-connected' && this._connection.isConnected()) {
		var peers = this._connection.peers();
		for (var i = 0; i < peers.length; i++) {
			if (this._match(this._selector, peers[i])) callback(peers[i]);
		}
	}
	return ret;
};

// Overrides EventEmitter's behavior to proxy and filter events from the connection
DiyaSelector.prototype._removeListener = DiyaSelector.prototype.removeListener;
DiyaSelector.prototype.removeListener = function (type, callback) {
	if (callback.___DiyaSelector_hidden_wrapper) this._connection.removeListener(type, callback.___DiyaSelector_hidden_wrapper);
	this._removeListener(type, callback);
};

//////////////////
// SUBSCRIPTION //
//////////////////


/**
* Handles a subscription to some DiyaNode service for multiple nodes
* according to the given selector
*/
function Subscription(selector, params, callback, options) {
	var that = this;
	this.selector = selector;
	this.params = params;
	this.callback = callback;
	this.options = options;
	this.subIds = [];

	this.doSubscribe = function (peerId) {
		that.subIds.push(that._addSubscription(peerId));
		that.state = "open";
	};

	if (this.options && this.options.auto) {
		this.selector.on('peer-connected', this.doSubscribe);
	} else {
		this.selector.each(this.doSubscribe);
	}

	return this;
};

Subscription.prototype.close = function () {
	for (var i = 0; i < this.subIds.length; i++) {
		this.selector._connection.unsubscribe(this.subIds[i]);
	}
	this.subIds = [];
	this.selector.removeListener('peer-connected', this.doSubscribe);
	this.state = "closed";
};

Subscription.prototype._addSubscription = function (peerId) {
	var that = this;
	var params = {};
	for (var k in this.params) {
		params[k] = this.params[k];
	}params.target = peerId;
	var subId = this.selector._connection.subscribe(params, function (err, data) {
		that.callback(peerId, err, data);
	});
	if (this.options && Array.isArray(this.options.subIds)) this.options.subIds[peerId] = subId;
	return subId;
};

// Legacy --------------------------------------------


/** @deprecated  */
DiyaSelector.prototype.listen = function () {};

DiyaSelector.prototype.__old_deprecated_unsubscribe = function (subIds) {
	this.each(function (peerId) {
		var subId = subIds[peerId];
		if (subId) this._connection.unsubscribe(subId);
	});
	return this;
};

// -------------------------------------


module.exports = d1;

},{"./DiyaNode":17,"inherits":2,"node-event-emitter":3,"q":undefined}],19:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

var d1 = require('./DiyaSelector.js');

require('./services/rtc/rtc.js');
require('./services/ieq/ieq.js');
require('./services/config/config.js');
require('./services/peerAuth/PeerAuth.js');
require('./services/meshNetwork/MeshNetwork.js');
require('./utils/encoding/encoding.js');
require('./services/status/status.js');

module.exports = d1;

},{"./DiyaSelector.js":18,"./services/config/config.js":20,"./services/ieq/ieq.js":21,"./services/meshNetwork/MeshNetwork.js":22,"./services/peerAuth/PeerAuth.js":24,"./services/rtc/rtc.js":25,"./services/status/status.js":26,"./utils/encoding/encoding.js":27}],20:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var util = require('util');

var Message = require('../message');

//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = true;
var Logger = {
	log: function log(message) {
		if (DEBUG) console.log(message);
	},

	error: function error(message) {
		if (DEBUG) console.error(message);
	}
};

/**
 * Config API handler
 */
function Config(selector) {
	var that = this;
	this.selector = selector;
	this.subscriptions = [];

	return this;
};

/**
 * List all available keys
 * @param {func} callback : called after update with params ({Array<String>} list, {Error} error)
 */
Config.prototype.list = function (callback) {
	var that = this;
	this.selector.request({
		service: "configManager",
		func: "List"
	}, function (dnId, err, data) {
		if (err) {
			if (typeof err == "string") Logger.error(dnId + " sent error: " + err);else if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) == "object" && typeof err.name == 'string') {
				callback(null, err.name);
				if (typeof err.message == "string") Logger.error(dnId + " sent error: " + err.message);
			}
			return;
		}
		callback(data); // callback func
	});
};

/**
 * Set config for given key
 * @param {String} key : key to which is associated the config value
 * @param {Object} config : configuration to be stored
 */
Config.prototype.set = function (key, config) {
	var that = this;
	this.selector.request({
		service: "configManager",
		func: "Set",
		data: config,
		obj: key
	}, function (dnId, err) {
		if (err) {
			if (typeof err == "string") Logger.error(dnId + " sent error: " + err);else if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) == "object" && typeof err.name == 'string') {
				if (typeof err.message == "string") Logger.error(dnId + " sent error: " + err.message);
			}
			return;
		}
	});
};

/**
 * Update internal model with received data
 * @param  key to select configuration to be watched
 * @param  callback called on answers (@param : {Object} configuration )
 */
Config.prototype.watch = function (key, callback) {
	var that = this;

	var subs = this.selector.subscribe({
		service: "configManager",
		func: "Config",
		obj: key
	}, function (dnId, err, data) {
		if (err) {
			if (typeof err == "string") Logger.error(dnId + " sent error: " + err);else if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) == "object" && typeof err.name == 'string') {
				if (typeof err.message == "string") Logger.error(dnId + " sent error: " + err.message);
			}
			that.closeSubscriptions(); // should not be necessary
			that.subscriptionReqPeriod = that.subscriptionReqPeriod + 1000 || 1000; // increase delay by 1 sec
			if (that.subscriptionReqPeriod > 300000) that.subscriptionReqPeriod = 300000; // max 5min
			subs.watchTentative = setTimeout(function () {
				that.watch(key, callback);
			}, that.subscriptionReqPeriod); // try again later
			return;
		}
		that.subscriptionReqPeriod = 0; // reset period on subscription requests
		callback(data.value); // callback func
	});

	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
Config.prototype.closeSubscriptions = function () {
	for (var i in this.subscriptions) {
		this.subscriptions[i].close();
		clearTimeout(this.subscriptions[i].watchTentative);
	}
	this.subscriptions = [];
};

/** create Config service **/
DiyaSelector.prototype.Config = function () {
	return new Config(this);
};

},{"../../DiyaSelector":18,"../message":23,"util":7}],21:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

/**
   Todo :
   check err for each data
   improve API : getData(sensorName, dataConfig)
   updateData(sensorName, dataConfig)
   set and get for the different dataConfig params

*/

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var util = require('util');

var Message = require('../message');

//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = true;
var Logger = {
	log: function log(message) {
		if (DEBUG) console.log(message);
	},

	error: function error(message) {
		if (DEBUG) console.error(message);
	}
};

/**
 * IEQ API handler
 */
function IEQ(selector) {
	var that = this;
	this.selector = selector;
	this.dataModel = {};
	this._coder = selector.encode();
	this.subscriptions = [];
	//	that.subscriptionErrorNum = 0;

	/*** structure of data config. [] means default value ***
 	 criteria :
 	   time: all 3 time criteria should not be defined at the same time. (range would be given up)
 	     start: {[null],time} (null means most recent) // stored a UTC in ms (num)
 	     end: {[null], time} (null means most oldest) // stored as UTC in ms (num)
 	     range: {[null], time} (range of time(positive) ) // in s (num)
 	   robot: {ArrayOf ID or ["all"]}
 	   place: {ArrayOf ID or ["all"]}
 	 operator: {[last], max, moy, sd} - deprecated
 	 ...
 		 sensors : {[null] or ArrayOf SensorName}
 		 sampling: {[null] or int} - deprecated
 */
	this.dataConfig = {
		criteria: {
			time: {
				start: null,
				end: null,
				range: null // in s
			},
			robot: null,
			place: null
		},
		operator: 'last',
		sensors: null,
		sampling: null //sampling
	};

	return this;
};

/**
 * Get dataModel :
 * {
 *	"senseurXX": {
 *			data:[FLOAT, ...],
 *			time:[FLOAT, ...],
 *			robot:[FLOAT, ...],
 *			place:[FLOAT, ...],
 *			qualityIndex:[FLOAT, ...],
 *			range: [FLOAT, FLOAT],
 *			unit: string,
 *		label: string
 *		},
 *	 ... ("senseursYY")
 * }
 */
IEQ.prototype.getDataModel = function () {
	return this.dataModel;
};
IEQ.prototype.getDataRange = function () {
	return this.dataModel.range;
};

/**
 * @param {Object} dataConfig config for data request
 * if dataConfig is define : set and return this
 *	 @return {IEQ} this
 * else
 *	 @return {Object} current dataConfig
 */
IEQ.prototype.DataConfig = function (newDataConfig) {
	if (newDataConfig) {
		this.dataConfig = newDataConfig;
		return this;
	} else return this.dataConfig;
};
/**
 * TO BE IMPLEMENTED : operator management in DN-IEQ
 * @param  {String}	 newOperator : {[last], max, moy, sd}
 * @return {IEQ} this - chainable
 * Set operator criteria.
 * Depends on newOperator
 *	@param {String} newOperator
 *	@return this
 * Get operator criteria.
 *	@return {String} operator
 */
IEQ.prototype.DataOperator = function (newOperator) {
	if (newOperator) {
		this.dataConfig.operator = newOperator;
		return this;
	} else return this.dataConfig.operator;
};
/**
 * Depends on numSamples
 * @param {int} number of samples in dataModel
 * if defined : set number of samples
 *	@return {IEQ} this
 * else
 *	@return {int} number of samples
 **/
IEQ.prototype.DataSampling = function (numSamples) {
	if (numSamples) {
		this.dataConfig.sampling = numSamples;
		return this;
	} else return this.dataConfig.sampling;
};
/**
 * Set or get data time criteria start and end.
 * If param defined
 *	@param {Date} newTimeStart // may be null
 *	@param {Date} newTimeEnd // may be null
 *	@return {IEQ} this
 * If no param defined:
 *	@return {Object} Time object: fields start and end.
 */
IEQ.prototype.DataTime = function (newTimeStart, newTimeEnd, newRange) {
	if (newTimeStart || newTimeEnd || newRange) {
		this.dataConfig.criteria.time.start = newTimeStart.getTime();
		this.dataConfig.criteria.time.end = newTimeEnd.getTime();
		this.dataConfig.criteria.time.range = newRange;
		return this;
	} else return {
		start: new Date(this.dataConfig.criteria.time.start),
		end: new Date(this.dataConfig.criteria.time.end),
		range: new Date(this.dataConfig.criteria.time.range)
	};
};
/**
 * Depends on robotIds
 * Set robot criteria.
 *	@param {Array[Int]} robotIds list of robot Ids
 * Get robot criteria.
 *	@return {Array[Int]} list of robot Ids
 */
IEQ.prototype.DataRobotIds = function (robotIds) {
	if (robotIds) {
		this.dataConfig.criteria.robot = robotIds;
		return this;
	} else return this.dataConfig.criteria.robot;
};
/**
 * Depends on placeIds
 * Set place criteria.
 *	@param {Array[Int]} placeIds list of place Ids
 * Get place criteria.
 *	@return {Array[Int]} list of place Ids
 */
IEQ.prototype.DataPlaceIds = function (placeIds) {
	if (placeIds) {
		this.dataConfig.criteria.placeId = placeIds;
		return this;
	} else return this.dataConfig.criteria.place;
};
/**
 * Get data by sensor name.
 *	@param {Array[String]} sensorName list of sensors
 */

IEQ.prototype.getDataByName = function (sensorNames) {
	var data = [];
	for (var n in sensorNames) {
		data.push(this.dataModel[sensorNames[n]]);
	}
	return data;
};

/**
 * Update data given dataConfig.
 * @param {func} callback : called after update
 * @param {object} dataConfig: data to config request
 * TODO USE PROMISE
 */

IEQ.prototype.updateData = function (callback, dataConfig) {
	this._updateData(callback, dataConfig, "DataRequest");
};

/**
 * Update data given dataConfig.
 * @param {func} callback : called after update
 * @param {object} dataConfig: data to config request
 * @param {string} funcName: name of requested function in diya-node-ieq. Default: "DataRequest".
 * TODO USE PROMISE
 */

IEQ.prototype._updateData = function (callback, dataConfig, funcName) {
	var that = this;
	if (dataConfig) this.DataConfig(dataConfig);
	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "ieq",
		func: funcName,
		data: {
			type: "splReq",
			dataConfig: that.dataConfig
		}
	}, function (dnId, err, data) {
		if (err) {
			if (typeof err == "string") Logger.error("Recv err: " + err);else if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) == "object" && typeof err.name == 'string') {
				callback(null, err.name);
				if (typeof err.message == "string") Logger.error(err.message);
			}
			return;
		}
		if (data && data.header && data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("UpdateData:\n" + JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed (" + data.header.error.st + "): " + data.header.error.msg);
			return;
		}
		that._getDataModelFromRecv(data);
		// Logger.log(that.getDataModel());
		callback(that.getDataModel()); // callback func
	});
};

IEQ.prototype._isDataModelWithNaN = function () {
	var dataModelNaN = false;
	var sensorNan;
	for (var n in this.dataModel) {
		sensorNan = this.dataModel[n].data.reduce(function (nanPres, d) {
			return nanPres && isNaN(d);
		}, false);
		dataModelNaN = dataModelNaN && sensorNan;
		Logger.log(n + " with nan : " + sensorNan + " (" + dataModelNaN + ") / " + this.dataModel[n].data.length);
	}
};

IEQ.prototype.getConfinementLevel = function () {
	return this.confinement;
};

IEQ.prototype.getAirQualityLevel = function () {
	return this.airQuality;
};

IEQ.prototype.getEnvQualityLevel = function () {
	return this.envQuality;
};

/**
 * Update internal model with received data
 * @param  data to configure subscription
 * @param  callback called on answers (@param : dataModel)
 */
IEQ.prototype.watch = function (config, callback) {
	var that = this;

	/** default **/
	config = config || {};
	config.timeRange = config.timeRange || 'hours';
	config.cat = config.cat || 'ieq'; /* category */

	var subs = this.selector.subscribe({
		service: "ieq",
		func: "Data",
		data: config,
		obj: config.cat /* provide category of sensor to be watched, filtered according to CRM */
	}, function (dnId, err, data) {
		if (err) {
			Logger.error("WatchIEQRecvErr:" + JSON.stringify(err));
			that.closeSubscriptions(); // should not be necessary
			that.subscriptionReqPeriod = that.subscriptionReqPeriod + 1000 || 1000; // increase delay by 1 sec
			if (that.subscriptionReqPeriod > 300000) that.subscriptionReqPeriod = 300000; // max 5min
			subs.watchTentative = setTimeout(function () {
				that.watch(config, callback);
			}, that.subscriptionReqPeriod); // try again later
			return;
		}
		that.subscriptionReqPeriod = 0; // reset period on subscription requests
		if (data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("WatchIEQ:\n" + JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed (" + data.header.error.st + "): " + data.header.error.msg);
			return;
		}
		//	console.log('watch');
		//	console.log(data);
		that._getDataModelFromRecv(data);
		//		that.subscriptionError = 0; // reset error counter

		callback = callback.bind(that); // bind callback with IEQ
		callback(that.getDataModel()); // callback func
	});

	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
IEQ.prototype.closeSubscriptions = function () {
	for (var i in this.subscriptions) {
		this.subscriptions[i].close();
		clearTimeout(this.subscriptions[i].watchTentative);
	}
	this.subscriptions = [];
};

/**
* Request Data to make CSV file
	* @param {object} csvConfig params:
	* @param {list} csvConfig.sensorNames : list of sensor and index names
	* @param {number} csvConfig._startTime: timestamp of beginning time
	* @param {number} csvConfig._endTime: timestamp of end time
	* @param {string} csvConfig.timeSample: timeinterval for data. Parameters: "second", "minute", "hour", "day", "week", "month"
	* @param {number} csvConfig._nlines: maximum number of lines requested
	* @param {callback} callback: called after update
*/

IEQ.prototype.getCSVData = function (csvConfig, callback) {
	var that = this;

	if (csvConfig && typeof csvConfig.nlines != "number") csvConfig.nlines = undefined;
	if (csvConfig && typeof csvConfig.lang != "string") csvConfig.lang = undefined;

	var dataConfig = {
		criteria: {
			time: { start: new Date(csvConfig.startTime).getTime(), end: new Date(csvConfig.endTime).getTime(), sampling: csvConfig.timeSample },
			places: [],
			robots: []
		},
		sensors: csvConfig.sensorNames,
		sampling: csvConfig.nlines,
		lang: csvConfig.lang
	};

	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "ieq",
		func: "CsvDataRequest",
		data: {
			type: "splReq",
			dataConfig: dataConfig
		}
	}, function (dnId, err, data) {
		if (err) {
			if (typeof err == "string") Logger.error("Recv err: " + err);else if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) == "object" && typeof err.name == 'string') {
				callback(null, err.name);
				if (typeof err.message == "string") Logger.error(err.message);
			}
			return;
		}
		if (typeof data === 'string') {
			callback(data);
		} else {
			// DEPRECATED
			if (data && data.header && data.header.error) {
				// TODO : check/use err status and adapt behavior accordingly
				Logger.error("UpdateData:\n" + JSON.stringify(data.header.dataConfig));
				Logger.error("Data request failed (" + data.header.error.st + "): " + data.header.error.msg);
				return;
			}
			that._getDataModelFromRecv(data);
			// Logger.log(that.getDataModel());
			callback(that.getDataModel()); // callback func
		}
	});
};

/**
 * Request Data to make data map
  * @param {Object} dataConfig config for data request
  * @param {callback} callback: called after update
  */
IEQ.prototype.getDataMapData = function (dataConfig, callback) {
	this._updateData(callback, dataConfig, "DataRequest");
};

/**
 * Request Data to make heatmap
  * @param {list} sensorNames : list of sensor and index names
  * @param {object} time: object containing timestamps for begin and end of data for heatmap
  * @param {string} sample: timeinterval for data. Parameters: "second", "minute", "hour", "day", "week", "month"
  * @param {callback} callback: called after update
  * @deprecated Will be deprecated in future version. Please use "getDataMapData" instead.

  */
IEQ.prototype.getHeatMapData = function (sensorNames, time, sample, callback) {
	var dataConfig = {
		criteria: {
			time: { start: time.startEpoch, end: time.endEpoch, sampling: sample },
			places: [],
			robots: []
		},
		sensors: sensorNames
	};
	console.warn('This function will be deprecated. Please use "getDataMapData" instead.');
	this.getDataMapData(dataConfig, callback);
};

/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
IEQ.prototype._getDataModelFromRecv = function (data) {
	var dataModel = null;
	//	console.log('getDataModel');
	//	console.log(data);

	if (data.err && data.err.st > 0) {
		Logger.error(data.err.msg);
		return null;
	}
	delete data.err;
	if (data && data.header) {
		for (var n in data) {
			if (n != "header" && n != "err") {

				if (data[n].err && data[n].err.st > 0) {
					Logger.error(n + " was in error: " + data[n].err.msg);
					continue;
				}

				if (!dataModel) dataModel = {};

				// Logger.log(n);
				if (!dataModel[n]) {
					dataModel[n] = {};
				}
				/* update data absolute range */
				dataModel[n].range = data[n].range;
				/* update data range */
				dataModel[n].timeRange = data[n].timeRange;
				/* update data label */
				dataModel[n].label = data[n].label;
				/* update data unit */
				dataModel[n].unit = data[n].unit;
				/* update data precision */
				dataModel[n].precision = data[n].precision;
				/* update data categories */
				dataModel[n].category = data[n].category;
				/* suggested y display range */
				dataModel[n].zoomRange = [0, 100];
				// update sensor confort range
				dataModel[n].confortRange = data[n].confortRange;

				/* update data indexRange */
				dataModel[n].qualityConfig = {
					/* confortRange: data[n].confortRange, */
					indexRange: data[n].indexRange
				};
				dataModel[n].time = this._coder.from(data[n].time, 'b64', 8);
				dataModel[n].data = data[n].data ? this._coder.from(data[n].data, 'b64', 4) : data[n].avg ? this._coder.from(data[n].avg.d, 'b64', 4) : null;
				dataModel[n].qualityIndex = data[n].data ? this._coder.from(data[n].index, 'b64', 4) : data[n].avg ? this._coder.from(data[n].avg.i, 'b64', 4) : null;
				dataModel[n].robotId = this._coder.from(data[n].robotId, 'b64', 4);
				if (dataModel[n].robotId) {
					/** dico robotId -> robotName **/
					var dicoRobot = {};
					data.header.robots.forEach(function (el) {
						dicoRobot[el.id] = el.name;
					});
					dataModel[n].robotId = dataModel[n].robotId.map(function (el) {
						return dicoRobot[el];
					});
				}

				dataModel[n].placeId = this._coder.from(data[n].placeId, 'b64', 4);
				dataModel[n].x = null;
				dataModel[n].y = null;

				if (data[n].avg) dataModel[n].avg = {
					d: this._coder.from(data[n].avg.d, 'b64', 4),
					i: this._coder.from(data[n].avg.i, 'b64', 4)
				};
				if (data[n].min) dataModel[n].min = {
					d: this._coder.from(data[n].min.d, 'b64', 4),
					i: this._coder.from(data[n].min.i, 'b64', 4)
				};
				if (data[n].max) dataModel[n].max = {
					d: this._coder.from(data[n].max.d, 'b64', 4),
					i: this._coder.from(data[n].max.i, 'b64', 4)
				};
				if (data[n].stddev) dataModel[n].stddev = {
					d: this._coder.from(data[n].stddev.d, 'b64', 4),
					i: this._coder.from(data[n].stddev.i, 'b64', 4)
				};
				if (data[n].stddev) dataModel[n].stddev = {
					d: this._coder.from(data[n].stddev.d, 'b64', 4),
					i: this._coder.from(data[n].stddev.i, 'b64', 4)
				};
				if (data[n].x) dataModel[n].x = this._coder.from(data[n].x, 'b64', 4);
				if (data[n].y) dataModel[n].y = this._coder.from(data[n].y, 'b64', 4);
				/**
     * current quality : {'b'ad, 'm'edium, 'g'ood}
     * evolution : {'u'p, 'd'own, 's'table}
     * evolution quality : {'b'etter, 'w'orse, 's'ame}
     */
				/// TODO
				dataModel[n].trend = 'mss';
			}
		}
	} else {
		Logger.error("No Data to read or header is missing !");
	}
	/** list robots **/
	//	dataModel.robots = [{name: 'D2R2', id:1}];
	this.dataModel = dataModel;
	return dataModel;
};

/** create IEQ service **/
DiyaSelector.prototype.IEQ = function () {
	return new IEQ(this);
};

},{"../../DiyaSelector":18,"../message":23,"util":7}],22:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');
var isBrowser = !(typeof window === 'undefined');
if (!isBrowser) {
  var Q = require('q');
} else {
  var Q = window.Q;
}

d1.knownPeers = function () {
  return d1("#self").knownPeers();
};
d1.kp = d1.knownPeers;

DiyaSelector.prototype.knownPeers = function (callback) {
  var deferred = Q.defer();
  this.request({ service: 'meshNetwork', func: 'ListKnownPeers' }, function (peerId, err, data) {
    if (err) return deferred.reject(err);
    var peers = [];
    for (var i = 0; i < data.peers.length; i++) {
      peers.push(data.peers[i].name);
    }return deferred.resolve(peers);
  });
  return deferred.promise;
};

d1.listenMeshNetwork = function (callback) {
  return d1(/.*/).subscribe({ service: 'meshNetwork', func: 'MeshNetwork' }, callback, { auto: true });
};

},{"../../DiyaSelector":18,"q":undefined}],23:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

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

function Message(service, func, obj, permanent) {

  this.service = service;
  this.func = func;
  this.obj = obj;

  this.permanent = permanent; //If this flag is on, the command will stay on the callback list listening for events
}

Message.buildSignature = function (msg) {
  return msg.service + '.' + msg.func + '.' + msg.obj;
};

Message.prototype.signature = function () {
  return this.service + '.' + this.func + '.' + this.obj;
};

Message.prototype.exec = function (data) {
  return {
    service: this.service,
    func: this.func,
    obj: this.obj,
    data: data
  };
};

module.exports = Message;

},{}],24:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');
var isBrowser = !(typeof window === 'undefined');
if (!isBrowser) {
	var Q = require('q');
} else {
	var Q = window.Q;
}

if (typeof INFO === 'undefined') var INFO = function INFO(s) {
	console.log(s);
};
if (typeof OK === 'undefined') var OK = function OK(s) {
	console.log(s);
};

/**
* Installs a new DiyaNode device (with address 'ip') into an existing network, by
* contacting an existing DiyaNode device with address 'bootstrap_ip' :
*   1) Contact the new node to get its public key
*   2) Add this public key to the existing node TrustedPeers list
*   3) Add the existing node's public key to the new node's TrustedPeers list
*   4) Ask the new node to join the network by calling @see{d1().join()}
*
* NOTE : This operation requires the given user to have root role on both nodes
*
* @param ip : the IP address of the new device
* @param user : a username with root role on the new device
* @param password : the password for 'user'
* @param bootstrap_ip : the IP address of the bootstrap device
* @param bootstrap_user : a user identifier with root role on the boostrap device
* @param bootstrap_password : the password for 'bootstrap_user'
* @param bootstrap_net : the IP address where the new device will connect to the boostrap one
* @param callback : of the form callback(new_peer_name,bootstrap_peer_name, err, data)
*/
d1.installNodeExt = function (ip, user, password, bootstrap_ip, bootstrap_user, bootstrap_password, bootstrap_net, callback) {
	if (typeof ip !== 'string') throw "[installNode] ip should be an IP address";
	if (typeof bootstrap_ip !== 'string') throw "[installNode] bootstrap_ip should be an IP address";
	if (typeof bootstrap_net !== 'string') throw "[installNode] bootstrap_net should be an IP address";

	// Check and Format URI (FQDN)
	if (bootstrap_ip.indexOf("ws://") !== 0 && bootstrap_ip.indexOf("wss://") !== 0) {
		if (d1.isSecured()) bootstrap_ip = "wss://" + bootstrap_ip;else bootstrap_ip = "ws://" + bootstrap_ip;
	}
	if (bootstrap_net.indexOf("ws://") !== 0 && bootstrap_net.indexOf("wss://") !== 0) {
		if (d1.isSecured()) bootstrap_net = "wss://" + bootstrap_net;else bootstrap_net = "ws://" + bootstrap_net;
	}

	function join(peer, bootstrap_peer) {
		d1("#self").join(bootstrap_net, true, function (peer, err, data) {
			if (!err) OK("JOINED !!!");
			return callback(peer, bootstrap_peer, err, data);
		});
	}

	d1.connectAsUser(ip, user, password).then(function (peer, err, data) {
		d1("#self").givePublicKey(function (peer, err, data) {
			if (err === 'ServiceNotFound') {
				INFO("Peer Authentication disabled ... directly joining");
				join();
				return;
			} else if (err) return callback(peer, null, err, null);else {
				INFO("Add trusted peer " + peer + "(ip=" + ip + ") to " + bootstrap_ip + " with public key " + data.public_key.slice(0, 20));
				d1.connectAsUser(bootstrap_ip, bootstrap_user, bootstrap_password).then(function () {
					d1("#self").addTrustedPeer(peer, data.public_key, function (bootstrap_peer, err, data) {

						if (err) return callback(peer, bootstrap_peer, err, null);
						if (data.alreadyTrusted) INFO(peer + " already trusted by " + bootstrap_peer);else INFO(bootstrap_peer + "(ip=" + bootstrap_ip + ") added " + peer + "(ip=" + ip + ") as a Trusted Peer");

						INFO("In return, add " + bootstrap_peer + " to " + peer + " as a Trusted Peer with public key " + data.public_key.slice(0, 20));
						d1.connectAsUser(ip, user, password).then(function () {
							d1("#self").addTrustedPeer(bootstrap_peer, data.public_key, function (peer, err, data) {
								if (err) callback(peer, bootstrap_peer, err, null);else if (data.alreadyTrusted) INFO(bootstrap_peer + " already trusted by " + peer);else INFO(peer + "(ip=" + ip + ") added " + bootstrap_peer + "(ip=" + bootstrap_ip + ") as a Trusted Peer");
								// Once Keys have been exchanged ask to join the network
								OK("KEYS OK ! Now, let " + peer + "(ip=" + ip + ") join the network via " + bootstrap_peer + "(ip=" + bootstrap_net + ") ...");
								return join(peer, bootstrap_peer);
							});
						});
					});
				});
			}
		});
	});
};

/** Short version of @see{d1.installNodeExt} */
d1.installNode = function (bootstrap_ip, bootstrap_net, callback) {
	var ip = d1.addr();
	var user = d1.user();
	var password = d1.pass();
	var bootstrap_user = user;
	var bootstrap_password = password;
	return d1.installNodeExt(ip, user, password, bootstrap_ip, bootstrap_user, bootstrap_password, bootstrap_net, callback);
};

/**
 * Make the selected DiyaNodes join an existing DiyaNodes Mesh Network by contacting
 * the given bootstrap peers.
 *
 * NOTE : This operation requires root role
 *
 * @param bootstrap_ips : an array of bootstrap IP addresses to contact to join the Network
 * @param bPermanent : if true, permanently add the bootstrap peers as automatic bootstrap peers for the selected nodes.
 *
 */
DiyaSelector.prototype.join = function (bootstrap_ips, bPermanent, callback) {
	if (typeof bootstrap_ips === 'string') bootstrap_ips = [bootstrap_ips];
	if (bootstrap_ips.constructor !== Array) throw "join() : bootstrap_ips should be an array of peers URIs";
	this.request({ service: 'meshNetwork', func: 'Join', data: { bootstrap_ips: bootstrap_ips, bPermanent: bPermanent } }, function (peerId, err, data) {
		if (typeof callback === "function") callback(peerId, err, data);
	});
};

/**
 * Disconnect the selected DiyaNodes from the given bootstrap peers
 *
 * NOTE : This operation requires root role
 *
 * @param bootstrap_ips : an array of bootstrap IP addresses to leave
 * @param bPermanent : if true, permanently remove the given peers from the automatic bootstrap peers list
 *
 */
DiyaSelector.prototype.leave = function (bootstrap_ips, bPermanent, callback) {
	if (typeof bootstrap_ips === 'string') bootstrap_ips = [bootstrap_ips];
	if (bootstrap_ips.constructor !== Array) throw "leave() : bootstrap_ips should be an array of peers URIs";
	this.request({ service: 'meshNetwork', func: 'Leave', data: { bootstrap_ips: bootstrap_ips, bPermanent: bPermanent } }, function (peerId, err, data) {
		if (typeof callback === "function") callback(peerId, err, data);
	});
};

/**
 * Ask the selected DiyaNodes for their public keys
 */
DiyaSelector.prototype.givePublicKey = function (callback) {
	return this.request({ service: 'peerAuth', func: 'GivePublicKey', data: {} }, function (peerId, err, data) {
		callback(peerId, err, data);
	});
};

/**
 * Add a new trusted peer RSA public key to the selected DiyaNodes
 * NOTE : This operation requires root role
 *
 * @param name : the name of the new trusted DiyaNode peer
 * @param public_key : the RSA public key of the new trusted DiyaNode peer
 */
DiyaSelector.prototype.addTrustedPeer = function (name, public_key, callback) {
	return this.request({ service: 'peerAuth', func: 'AddTrustedPeer', data: { name: name, public_key: public_key } }, function (peerId, err, data) {
		callback(peerId, err, data);
	});
};

/**
 * Check if the selected DiyaNodes trust the given peers
 * @param peers : an array of peer names
 */
DiyaSelector.prototype.areTrusted = function (peers, callback) {
	return this.request({ service: 'peerAuth', func: 'AreTrusted', data: { peers: peers } }, function (peerId, err, data) {
		var allTrusted = data.trusted;
		if (allTrusted) {
			OK(peers + " are trusted by " + peerId);callback(peerId, true);
		} else {
			ERR("Some peers in " + peers + " are untrusted by " + peerId);callback(peerId, false);
		}
	});
};
DiyaSelector.prototype.isTrusted = function (peer, callback) {
	return this.areTrusted([peer], callback);
};

d1.trustedPeers = function () {
	var deferred = Q.defer();
	d1("#self").request({ service: 'peerAuth', func: 'GetTrustedPeers' }, function (peerId, err, data) {
		if (err) return deferred.reject(err);
		var peers = [];
		for (var i = 0; i < data.peers.length; i++) {
			peers.push(data.peers[i].name);
		}return deferred.resolve(peers);
	});
	return deferred.promise;
};
d1.tp = d1.trustedPeers; // Shorthand

d1.blacklistedPeers = function () {
	var deferred = Q.defer();
	d1("#self").request({ service: 'peerAuth', func: 'GetBlacklistedPeers' }, function (peerId, err, data) {
		if (err) return deferred.reject(err);
		var peers = [];
		for (var i = 0; i < data.peers.length; i++) {
			peers.push(data.peers[i].name);
		}return deferred.resolve(peers);
	});
	return deferred.promise;
};
d1.bp = d1.blacklistedPeers; // Shorthand

},{"../../DiyaSelector":18,"q":undefined}],25:[function(require,module,exports){
"use strict";
/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

require('webrtc-adapter');

/*if(typeof window !== 'undefined'){
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
}*/

/////////////
// CHANNEL //
/////////////

/** Handles a RTC channel (datachannel and/or stream) to a DiyaNode peer
 *  @param dnId : the DiyaNode peerId
 *  @param name : the channel's name
 *  @param datachannel_cb : callback called when a RTC datachannel is open for this channel
 *  @param stream_cb : callback called when a RTC stream is open for this channel
 */
function Channel(dnId, name, datachannel_cb, stream_cb) {
	EventEmitter.call(this);
	this.name = name;
	this.dnId = dnId;

	this.frequency = 20;

	this.channel = undefined;
	this.stream = undefined;
	this.ondatachannel = datachannel_cb;
	this.onstream = stream_cb;
	this.closed = false;
}
inherits(Channel, EventEmitter);

/** Bind an incoming RTC datachannel to this channel */
Channel.prototype.setDataChannel = function (datachannel) {
	var that = this;
	this.channel = datachannel;
	this.channel.binaryType = 'arraybuffer';
	console.log("set data channel :" + this.name);
	datachannel.onmessage = function (message) {
		// First message carries channel description header
		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if (typeChar === 'O') that.type = 'input'; //Promethe Output = Client Input
		else if (typeChar === 'I') that.type = 'output'; //Promethe Input = Client Output
			else throw "Unrecnognized channel type : " + typeChar;

		var size = view.getInt32(1, true);
		if (!size) throw "Wrong datachannel message size";
		that.size = size;
		that._buffer = new Float32Array(size);

		// Subsequent messages are forwarded to appropriate handlers
		datachannel.onmessage = that._onMessage.bind(that);
		datachannel.onclose = that._onClose.bind(that);

		if (typeof that.ondatachannel === 'function') that.ondatachannel(that.dnId, that);

		console.log('Open datachannel ' + that.name);
	};
};

/** Bind an incoming RTC stream to this channel */
Channel.prototype.onAddStream = function (stream) {
	this.stream = stream;
	if (typeof this.onstream === 'function') this.onstream(this.dnId, stream);else console.warn("Ignore stream " + stream.id);

	console.log('Open stream ' + this.name);
};

/** Close this channel */
Channel.prototype.close = function () {
	this.closed = true;
};

/** Write a scalar value to the given index on the RTC datachannel */
Channel.prototype.write = function (index, value) {
	if (index < 0 || index > this.size || isNaN(value)) return false;
	this._buffer[index] = value;
	this._requestSend();
	return true;
};

/** Write an array of values to the RTC datachannel */
Channel.prototype.writeAll = function (values) {
	if (!Array.isArray(values) || values.length !== this.size) return false;

	for (var i = 0; i < values.length; i++) {
		if (isNaN(values[i])) return false;
		this._buffer[i] = values[i];
	}
	this._requestSend();
};

/** Ask to send the internal data buffer through the datachannel at the defined frequency */
Channel.prototype._requestSend = function () {
	var that = this;

	var elapsedTime = new Date().getTime() - this._lastSendTimestamp;
	var period = 1000 / this.frequency;
	if (elapsedTime >= period) doSend();else if (!this._sendRequested) {
		this._sendRequested = true;
		setTimeout(doSend, period - elapsedTime);
	}

	function doSend() {
		that._sendRequested = false;
		that._lastSendTimestamp = new Date().getTime();
		var ret = that._send(that._buffer);
		//If autosend is set, automatically send buffer at the given frequency
		if (ret && that.autosend) that._requestSend();
	}
};

/** Actual send the internal data buffer through the RTC datachannel */
Channel.prototype._send = function (msg) {
	if (this.closed || !this.channel) return false;else if (this.channel.readyState === 'open') {
		try {
			this.channel.send(msg);
		} catch (e) {
			console.log('[rtc.channel.write] exception occured while sending data');
		}
		return true;
	} else {
		console.log('[rtc.channel.write] warning : webrtc datachannel state = ' + this.channel.readyState);
		return false;
	}
};

/** Called when a message is received from the channel's RTC datachannel */
Channel.prototype._onMessage = function (message) {
	var valArray = new Float32Array(message.data);
	this.emit('value', valArray);
};

/** Called when the channel is closed on the remote side */
Channel.prototype._onClose = function () {
	console.log('Close datachannel ' + this.name);
	this.emit('close');
};

//////////////////////////////////////////////////////////////////
///////////////////// RTC Peer implementation ////////////////////
//////////////////////////////////////////////////////////////////

/**
 * An RTC Peer associated to a single (DiyaNode peerId, promId) couple.
 * @param dnId : The DiyaNode peerId
 * @param rtc : The RTC diya-sdk instance
 * @param id : the promId
 * @param channels : an array of RTC channel names to open
 */
function Peer(dnId, rtc, id, channels) {
	this.dn = d1(dnId);
	this.dnId = dnId;
	this.id = id;
	this.channels = channels;
	this.rtc = rtc;
	this.peer = null;

	this.streams = [];

	this.connected = false;
	this.closed = false;

	this._connect();
}

/** Initiate a RTC connection to this Peer */
Peer.prototype._connect = function () {
	var that = this;

	this.subscription = this.dn.subscribe({
		service: 'rtc', func: 'Connect', obj: this.channels, data: { promID: this.id }
	}, function (diya, err, data) {
		if (data) {
			if (data.eventType === 'TurnInfo') that._turninfo = data.turn;else if (data.eventType === 'RemoteOffer') that._createPeer(data);else if (data.eventType === 'RemoteICECandidate') that._addRemoteICECandidate(data);
		}
	});

	this._timeoutId = setTimeout(function () {
		if (!that.connected && !that.closed) that._reconnect();
	}, 40000);
};

/** Reconnects the RTC peer */
Peer.prototype._reconnect = function () {
	this.close();

	this.peer = null;
	this.connected = false;
	this.closed = false;

	this._connect();
};

/** Creates a RTCPeerConnection in response to a RemoteOffer */
Peer.prototype._createPeer = function (data) {
	var that = this;

	var iceServers = [];
	if (this._turninfo) {
		if (!Array.isArray(this._turninfo)) {
			iceServers.push({
				urls: [this._turninfo.url],
				username: this._turninfo.username,
				credential: this._turninfo.password
			});
		} else {
			iceServers = this._turninfo.map(function (turn) {
				return {
					urls: [turn.url],
					username: turn.username,
					credential: turn.password
				};
			});
		}
	} else {
		iceServers.push({ urls: ["stun:stun.l.google.com:19302"] });
	}

	var config = {
		iceServers: iceServers,
		iceTransportPolicy: 'all'
	};

	var constraints = {
		mandatory: { DtlsSrtpKeyAgreement: true, OfferToReceiveAudio: true, OfferToReceiveVideo: true }
	};

	this._peerId = data.peerId;

	var peer = new RTCPeerConnection(config, constraints);
	this.peer = peer;

	this.streams.forEach(function (s) {
		peer.addStream(s);
	});

	peer.setRemoteDescription(new RTCSessionDescription({ sdp: data.sdp, type: data.type }));

	peer.createAnswer(function (session_description) {
		//favor VP9 instead of VP8
		session_description.sdp = session_description.sdp.replace(/SAVPF 100 101/g, 'SAVPF 101 100');

		peer.setLocalDescription(session_description);

		that.dn.request({
			service: 'rtc',
			func: 'Answer',
			data: {
				promID: data.promID,
				peerId: data.peerId,
				sdp: session_description.sdp,
				type: session_description.type
			}
		});
	}, function (err) {
		console.log(err);
	}, { 'mandatory': { OfferToReceiveAudio: true, OfferToReceiveVideo: true } });

	peer.oniceconnectionstatechange = function () {
		if (peer.iceConnectionState === 'connected') {
			that.connected = true;
			if (that.subscription) that.subscription.close();
		} else if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'closed' || peer.iceConnectionState === 'failed') {
			if (!that.closed) that._reconnect();
		}
	};

	peer.onicecandidate = function (evt) {
		that.dn.request({
			service: 'rtc',
			func: 'ICECandidate',
			data: {
				peerId: data.peerId,
				promID: that.id,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function (evt) {
		that.connected = true;
		that.rtc._onDataChannel(that.dnId, evt.channel);
	};

	peer.onaddstream = function (evt) {
		that.connected = true;
		that.rtc._onAddStream(that.dnId, evt.stream);
	};
};

Peer.prototype._addRemoteICECandidate = function (data) {
	try {
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate, function () {}, function (err) {
			console.error(err);
		});
	} catch (err) {
		console.error(err);
	}
};

/** Send the mappings from channel names to stream IDs */
Peer.prototype.sendChannelsStreamsMappings = function () {
	this.dn.request({
		service: "rtc",
		func: "ChannelsStreamsMappings",
		data: { peerId: 0, mappings: this.rtc[this.dnId].channelsByStream }
	}, function (peerId, err, data) {
		if (err) console.error(err);
	});
};

/** Adds a local stream to this Peer */
Peer.prototype.addStream = function (stream) {
	this.sendChannelsStreamsMappings();
	if (!this.streams.filter(function (s) {
		return stream.id === s;
	})[0]) this.streams.push(stream);
	this._reconnect();
};

Peer.prototype.removeStream = function (stream) {
	this.streams = this.streams.filter(function (s) {
		return stream.id !== s;
	});
	if (this.peer) this.peer.removeStream(stream);
};

Peer.prototype.close = function () {
	if (this.subscription) this.subscription.close();
	this.dn.request({
		service: "rtc",
		func: "Close",
		data: {
			peerId: this._peerId,
			promID: this.id
		}
	}, function (peerId, err, data) {});
	clearTimeout(this._timeoutId);
	if (this.peer) {
		try {
			this.peer.close();
		} catch (e) {}
		this.connected = false;
		this.closed = true;
	}
};

//////////////////////////////////////////////////////////////////////////////
/////////////////////////// RTC service implementation ///////////////////////
//////////////////////////////////////////////////////////////////////////////


function RTC(selector) {
	var that = this;
	this.selector = selector;

	this.requestedChannels = [];
	this.channelsByStream = [];
}

RTC.prototype.use = function (name_regex, type, ondatachannel_callback, onaddstream_callback) {
	this.requestedChannels.push({ regex: name_regex, type: type, cb: ondatachannel_callback, stream_cb: onaddstream_callback });
	return this;
};

/** Start listening to Peers connections.
 * A 'Peer' object will be created for each DiyaNode peerId and each promID
 */
RTC.prototype.connect = function () {
	var that = this;

	this.subscription = this.selector.subscribe({
		service: 'rtc',
		func: 'Peers'
	}, function (dnId, err, data) {

		if (!that[dnId]) that._createDiyaNode(dnId);

		if (err === 'SubscriptionClosed' || err === 'PeerDisconnected') {
			that._closeDiyaNode(dnId);
			return;
		}

		if (data && data.eventType && data.promID !== undefined) {

			if (data.eventType === 'PeerConnected') {
				if (!that[dnId].peers[data.promID]) {
					var channels = that._matchChannels(dnId, data.channels);
					if (channels.length > 0) {
						that[dnId].peers[data.promID] = new Peer(dnId, that, data.promID, channels);
					}

					// Autoreconnect declared streams
					that.channelsByStream.forEach(function (cbs) {
						that.addStream(cbs.channel, cbs.mediaStream);
					});
				}
				if (that[dnId].peers[data.promID]) that[dnId].peers[data.promID].sendChannelsStreamsMappings();
			} else if (data.eventType === 'PeerClosed') {
				if (that[dnId].peers[data.promID]) {
					that._closePeer(dnId, data.promID);
					if (typeof that.onclose === 'function') that.onclose(dnId);
				}
			}
		}
	}, { auto: true });

	return this;
};

RTC.prototype.disconnect = function () {
	var that = this;

	this.selector.each(function (dnId) {
		if (!that[dnId]) return;
		for (var promID in that[dnId].peers) {
			that._closePeer(dnId, promID);
		}
	});

	if (this.subscription) this.subscription.close();
	return this;
};

RTC.prototype._createDiyaNode = function (dnId) {
	var that = this;

	this[dnId] = {
		dnId: dnId,
		usedChannels: [],
		requestedChannels: [],
		peers: [],
		channelsByStream: []
	};

	this.requestedChannels.forEach(function (c) {
		that[dnId].requestedChannels.push(c);
	});
};

RTC.prototype._closeDiyaNode = function (dnId) {
	for (var promID in this[dnId].peers) {
		this._closePeer(dnId, promID);
	}

	delete this[dnId];
};

RTC.prototype._closePeer = function (dnId, promID) {
	if (this[dnId].peers[promID]) {
		var p = this[dnId].peers[promID];
		p.close();

		for (var i = 0; i < p.channels.length; i++) {
			delete this[dnId].usedChannels[p.channels[i]];
		}

		delete this[dnId].peers[promID];
	}
};

/** Matches the given receivedChannels proposed by the given DiyaNode peerId
 *  against the requested channels and creates a Channel for each match
 */
RTC.prototype._matchChannels = function (dnId, receivedChannels) {
	var that = this;

	var channels = [];

	for (var i = 0; i < receivedChannels.length; i++) {
		var name = receivedChannels[i];
		var remoteStreamId = name.split("_;:_")[1];
		name = name.split("_;:_")[0];

		for (var j = 0; j < that[dnId].requestedChannels.length; j++) {
			var req = that[dnId].requestedChannels[j];

			if (name && name.match(req.regex) && !that[dnId].usedChannels[name]) {
				var channel = new Channel(dnId, name, req.cb, req.stream_cb);
				that[dnId].usedChannels[name] = channel;
				channels.push(name);

				// If a stream id is provided for the channel, register the mapping
				if (remoteStreamId) {
					that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function (cbs) {
						return cbs.stream !== remoteStreamId && cbs.channel !== channel;
					});
					that[dnId].channelsByStream.push({ stream: remoteStreamId, channel: channel });
					channel.streamId = streamId;
				}
				var localStreamId = that.channelsByStream.filter(function (cbs) {
					return cbs.channel === name;
				})[0];
				if (localStreamId) {
					that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function (cbs) {
						return cbs.stream !== localStreamId && cbs.channel !== name;
					});
					that[dnId].channelsByStream.push({ stream: localStreamId, channel: name });
					channel.localStreamId = localStreamId;
				}
			}
		}
	}

	return channels;
};

/** Called upon RTC datachannels connections */
RTC.prototype._onDataChannel = function (dnId, datachannel) {
	if (!this[dnId]) return console.warn("Tried to open a data channel on a closed peer");
	var channel = this[dnId].usedChannels[datachannel.label];

	if (!channel) {
		console.log("Datachannel " + datachannel.label + " unmatched, closing !");
		datachannel.close();
		return;
	}
	channel.setDataChannel(datachannel);
};

/** Called upon RTC stream channel connections */
RTC.prototype._onAddStream = function (dnId, stream) {
	if (!this[dnId]) return console.warn("Tried to open a stream on a closed peer");

	var channel = this[dnId].usedChannels[stream.id];

	if (!channel) {
		console.warn("Stream Channel " + stream.id + " unmatched, closing !");
		stream.close();
		return;
	}
	channel.onAddStream(stream);
};

/** Add a local stream to be sent through the given RTC channel */
RTC.prototype.addStream = function (channel, stream) {
	var that = this;

	// Register the channel<->stream mapping
	this.channelsByStream = this.channelsByStream.filter(function (cbs) {
		return cbs.channel !== channel && cbs.stream !== stream.id;
	});
	this.channelsByStream.push({ channel: channel, stream: stream.id, mediaStream: stream });

	console.log("Open local stream " + channel);

	// Send the channel<->stream mapping to all connected Peers
	this.selector.each(function (dnId) {
		if (!that[dnId]) return;
		that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function (cbs) {
			return cbs.channel !== channel && cbs.stream !== stream.id;
		});
		that[dnId].channelsByStream.push({ channel: channel, stream: stream.id });
		for (var promID in that[dnId].peers) {
			that[dnId].peers[promID].addStream(stream);
		}
	});
};

RTC.prototype.removeStream = function (channel, stream) {
	var that = this;

	// Register the channel<->stream mapping
	this.channelsByStream = this.channelsByStream.filter(function (cbs) {
		return cbs.channel !== channel && cbs.stream !== stream.id;
	});

	console.log("Close local stream " + channel);

	// Send the channel<->stream mapping to all connected Peers
	this.selector.each(function (dnId) {
		if (!that[dnId]) return;
		that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function (cbs) {
			return cbs.channel !== channel && cbs.stream !== stream.id;
		});
		for (var promID in that[dnId].peers) {
			that[dnId].peers[promID].removeStream(stream);
		}
	});
};

////////////////////////

DiyaSelector.prototype.rtc = function () {
	return new RTC(this);
};

},{"../../DiyaSelector":18,"inherits":2,"node-event-emitter":3,"webrtc-adapter":8}],26:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var util = require('util');

var Message = require('../message');

//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = true;
var Logger = {
	log: function log(message) {
		if (DEBUG) console.log(message);
	},

	error: function error(message) {
		if (DEBUG) console.error(message);
	}
};

/**
 *	callback : function called after model updated
 * */
function Status(selector) {
	var that = this;
	this.selector = selector;
	this._coder = selector.encode();
	this.subscriptions = [];

	/** model of robot : available parts and status **/
	this.robotModel = [];
	this._robotModelInit = false;

	/*** structure of data config ***
 	 criteria :
 	   time: all 3 time criteria should not be defined at the same time. (range would be given up)
 	     beg: {[null],time} (null means most recent) // stored a UTC in ms (num)
 	     end: {[null], time} (null means most oldest) // stored as UTC in ms (num)
 	     range: {[null], time} (range of time(positive) ) // in s (num)
 	   robot: {ArrayOf ID or ["all"]}
 	   place: {ArrayOf ID or ["all"]}
 	 operator: {[last], max, moy, sd} -( maybe moy should be default
 	 ...
 		 parts : {[null] or ArrayOf PartsId} to get errors
 	 status : {[null] or ArrayOf StatusName} to get status
 		 sampling: {[null] or int}
 */
	this.dataConfig = {
		criteria: {
			time: {
				beg: null,
				end: null,
				range: null // in s
			},
			robot: null
		},
		operator: 'last',
		parts: null,
		status: null
	};

	return this;
};
/**
 * Get robotModel :
 * {
 *  parts: {
 *		"partXX": {
 * 			 errorsDescr: { encountered errors indexed by errorIds>0 }
 *				> Config of errors :
 *					critLevel: FLOAT, // could be int...
 * 					msg: STRING,
 *					stopServiceId: STRING,
 *					runScript: Sequelize.STRING,
 *					missionMask: Sequelize.INTEGER,
 *					runLevel: Sequelize.INTEGER
 *			error:[FLOAT, ...], // could be int...
 *			time:[FLOAT, ...],
 *			robot:[FLOAT, ...],
 *			/// place:[FLOAT, ...], not implemented yet
 *		},
 *	 	... ("PartYY")
 *  },
 *  status: {
 *		"statusXX": {
 *				data:[FLOAT, ...], // could be int...
 *				time:[FLOAT, ...],
 *				robot:[FLOAT, ...],
 *				/// place:[FLOAT, ...], not implemented yet
 *				range: [FLOAT, FLOAT],
 *				label: string
 *			},
 *	 	... ("StatusYY")
 *  }
 * }
 */
Status.prototype.getRobotModel = function () {
	return this.robotModel;
};

/**
 * @param {Object} dataConfig config for data request
 * if dataConfig is define : set and return this
 *	 @return {Status} this
 * else
 *	 @return {Object} current dataConfig
 */
Status.prototype.DataConfig = function (newDataConfig) {
	if (newDataConfig) {
		this.dataConfig = newDataConfig;
		return this;
	} else return this.dataConfig;
};
/**
 * TO BE IMPLEMENTED : operator management in DN-Status
 * @param  {String}	 newOperator : {[last], max, moy, sd}
 * @return {Status} this - chainable
 * Set operator criteria.
 * Depends on newOperator
 *	@param {String} newOperator
 *	@return this
 * Get operator criteria.
 *	@return {String} operator
 */
Status.prototype.DataOperator = function (newOperator) {
	if (newOperator) {
		this.dataConfig.operator = newOperator;
		return this;
	} else return this.dataConfig.operator;
};
/**
 * Depends on numSamples
 * @param {int} number of samples in dataModel
 * if defined : set number of samples
 *	@return {Status} this
 * else
 *	@return {int} number of samples
 **/
Status.prototype.DataSampling = function (numSamples) {
	if (numSamples) {
		this.dataConfig.sampling = numSamples;
		return this;
	} else return this.dataConfig.sampling;
};
/**
 * Set or get data time criteria beg and end.
 * If param defined
 *	@param {Date} newTimeBeg // may be null
 *	@param {Date} newTimeEnd // may be null
 *	@return {Status} this
 * If no param defined:
 *	@return {Object} Time object: fields beg and end.
 */
Status.prototype.DataTime = function (newTimeBeg, newTimeEnd, newRange) {
	if (newTimeBeg || newTimeEnd || newRange) {
		this.dataConfig.criteria.time.beg = newTimeBeg.getTime();
		this.dataConfig.criteria.time.end = newTimeEnd.getTime();
		this.dataConfig.criteria.time.range = newRange;
		return this;
	} else return {
		beg: new Date(this.dataConfig.criteria.time.beg),
		end: new Date(this.dataConfig.criteria.time.end),
		range: new Date(this.dataConfig.criteria.time.range)
	};
};
/**
 * Depends on robotIds
 * Set robot criteria.
 *	@param {Array[Int]} robotIds list of robot Ids
 * Get robot criteria.
 *	@return {Array[Int]} list of robot Ids
 */
Status.prototype.DataRobotIds = function (robotIds) {
	if (robotIds) {
		this.dataConfig.criteria.robot = robotIds;
		return this;
	} else return this.dataConfig.criteria.robot;
};
/**
 * Depends on placeIds // not relevant?, not implemented yet
 * Set place criteria.
 *	@param {Array[Int]} placeIds list of place Ids
 * Get place criteria.
 *	@return {Array[Int]} list of place Ids
 */
Status.prototype.DataPlaceIds = function (placeIds) {
	if (placeIds) {
		this.dataConfig.criteria.placeId = placeIds;
		return this;
	} else return this.dataConfig.criteria.place;
};
/**
 * Get data by sensor name.
 *	@param {Array[String]} sensorName list of sensors
 */
Status.prototype.getDataByName = function (sensorNames) {
	var data = [];
	for (var n in sensorNames) {
		data.push(this.dataModel[sensorNames[n]]);
	}
	return data;
};

/**
 * Subscribe to error/status updates
 */
Status.prototype.watch = function (robotNames, callback) {
	var that = this;
	// console.log(robotNames);

	var subs = this.selector.subscribe({
		service: 'status',
		func: 'Status',
		data: robotNames
	}, function (peerId, err, data) {
		// console.log(peerId);
		// console.log(data);
		if (err) {
			Logger.error("StatusSubscribe:" + err);
			that.closeSubscriptions(); // should not be necessary
			that.subscriptionReqPeriod = that.subscriptionReqPeriod + 1000 || 1000; // increase delay by 1 sec
			if (that.subscriptionReqPeriod > 60000) that.subscriptionReqPeriod = 60000; // max 1min
			subs.watchTentative = setTimeout(function () {
				that.watch(data, callback);
			}, that.subscriptionReqPeriod); // try again later
			return;
		}
		that.subscriptionReqPeriod = 0; // reset period on subscription requests
		if (data && data.err && data.err.st) {
			Logger.error("WatchStatusErr:" + JSON.stringify(data.err));
		} else {
			that._getRobotModelFromRecv2(data);
			if (typeof callback === 'function') callback(that.robotModel);
		}
	});
	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
Status.prototype.closeSubscriptions = function () {
	for (var i in this.subscriptions) {
		this.subscriptions[i].close();
		clearTimeout(this.subscriptions[i].watchTentative);
	}
	this.subscriptions = [];
	this.robotModel = [];
};

/**
 * Get data given dataConfig.
 * @param {func} callback : called after update
 * TODO USE PROMISE
 */
Status.prototype.getData = function (callback, dataConfig) {
	var that = this;
	var dataModel = {};
	if (dataConfig) this.DataConfig(dataConfig);
	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "status",
		func: "DataRequest",
		data: {
			type: "splReq",
			dataConfig: that.dataConfig
		}
	}, function (dnId, err, data) {
		if (err) {
			Logger.error("[" + that.dataConfig.sensors + "] Recv err: " + JSON.stringify(err));
			return;
		}
		if (data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("UpdateData:\n" + JSON.stringify(data.header.reqConfig));
			Logger.error("Data request failed (" + data.header.error.st + "): " + data.header.error.msg);
			return;
		}
		//Logger.log(JSON.stringify(that.dataModel));
		dataModel = that._getDataModelFromRecv(data);

		Logger.log(that.getDataModel());
		callback = callback.bind(that); // bind callback with Status
		callback(dataModel); // callback func
	});
};

/**
 * Update internal robot model with received data (version 2)
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
Status.prototype._getRobotModelFromRecv2 = function (data) {
	var robot;
	var dataRobots = data.robots;
	var dataParts = data.partList;
	if (!this.robotModel) this.robotModel = [];
	// console.log("_getRobotModelFromRecv");
	// console.log(this.robotModel);

	for (var n in this.robotModel) {
		// console.log(n);
		this.robotModel[n].parts = {}; // reset parts
	}

	for (var n in dataRobots) {
		if (!this.robotModel[n]) this.robotModel[n] = {};
		this.robotModel[n].robot = dataRobots[n].robot;

		// if(this.robotModel.length<data.length) {
		// 	this.robotModel.push({robot: data[0].robots});
		// }

		/** extract parts info **/
		if (dataRobots[n] && dataRobots[n].parts) {
			var parts = dataRobots[n].parts;
			this.robotModel[n].parts = {};
			var rParts = this.robotModel[n].parts;
			// for(var q in rParts) {
			// 	/** part[q] was not sent because no error **/
			// 	if(!parts[q]
			// 	   &&rParts[q].evts&&rParts[q].evts.code) {
			// 		rParts[q].evts = {
			// 			code: 0,
			// 			codeRef: 0,
			// 			time: Date.now() /** update **/
			// 		};
			// 	}
			// }
			for (var p in parts) {
				if (!rParts[p]) {
					rParts[p] = {};
				}
				if (parts[p]) {
					// Logger.log(n);
					/* update part category */
					rParts[p].category = dataParts[p].category;
					/* update part name */
					rParts[p].name = dataParts[p].name;
					/* update part label */
					rParts[p].label = dataParts[p].label;
					/* update error time */
					// console.log(parts[p]);
					// console.log(parts[p].errors.time);
					// console.log(rParts[p].time);
					/* update error */
					// console.log(parts[p].errors.code);

					/** update errorList **/
					if (!rParts[p].errorList) rParts[p].errorList = {};
					for (var el in dataParts[p].errorList) {
						if (!rParts[p].errorList[el]) rParts[p].errorList[el] = dataParts[p].errorList[el];
					}var evts_tmp = {
						time: this._coder.from(parts[p].time),
						code: this._coder.from(parts[p].code),
						codeRef: this._coder.from(parts[p].codeRef)
					};
					/** if received list of events **/
					if (Array.isArray(evts_tmp.code) || Array.isArray(evts_tmp.time) || Array.isArray(evts_tmp.codeRef)) {
						if (evts_tmp.code.length === evts_tmp.codeRef.length && evts_tmp.code.length === evts_tmp.time.length) {
							/** build list of events **/
							rParts[p].evts = [];
							for (var i = 0; i < evts_tmp.code.length; i++) {
								rParts[p].evts.push({
									time: evts_tmp.time[i],
									code: evts_tmp.code[i],
									codeRef: evts_tmp.codeRef[i] });
							}
						} else Logger.error("Status:Inconsistant lengths of buffers (time/code/codeRef)");
					} else {
						/** just in case, to provide backward compatibility **/
						/** set received event **/
						rParts[p].evts = [{
							time: evts_tmp.time,
							code: evts_tmp.code,
							codeRef: evts_tmp.codeRef }];
					}
				}
				// console.log(rParts[p].error);
			}
			// console.log('parts, rParts');
			// console.log(parts);
			// 	console.log(rParts);
		} else {
			Logger.error("No parts to read for robot " + data[n].name);
		}
	}
};

/**
 * Update internal robot model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
Status.prototype._getRobotModelFromRecv = function (data) {
	var robot;

	if (!this.robotModel) this.robotModel = [];
	// console.log("_getRobotModelFromRecv");
	// console.log(this.robotModel);

	/** Only one robot is manage at the same time currently **/
	for (var n in data) {
		if (!this.robotModel[n]) this.robotModel[n] = {};
		this.robotModel[n].robot = data[n].robot;

		// if(this.robotModel.length<data.length) {
		// 	this.robotModel.push({robot: data[0].robots});
		// }

		/** extract parts info **/
		if (data[n] && data[n].parts) {
			if (!this.robotModel[n].parts) this.robotModel[n].parts = {};
			var parts = data[n].parts;
			var rParts = this.robotModel[n].parts;
			for (var q in rParts) {
				/** part[q] was not sent because no error **/
				if (!parts[q] && rParts[q].evts && rParts[q].evts.code) {
					rParts[q].evts = {
						code: [0],
						codeRef: [0],
						time: [Date.now()] /** update **/
					};
				}
			}
			for (var p in parts) {
				if (parts[p] && parts[p].err && parts[p].err.st > 0) {
					Logger.error("Parts " + p + " was in error: " + data[p].err.msg);
					continue;
				}
				if (!rParts[p]) {
					rParts[p] = {};
				}
				if (parts[p]) {
					// Logger.log(n);
					/* update part category */
					rParts[p].category = parts[p].category;
					/* update part name */
					rParts[p].name = parts[p].name;
					/* update part label */
					rParts[p].label = parts[p].label;
					/* update error time */
					// console.log(parts[p]);
					// console.log(parts[p].errors.time);
					// console.log(rParts[p].time);
					/* update error */
					// console.log(parts[p].errors.code);

					/** update errorList **/
					if (!rParts[p].errorList) rParts[p].errorList = {};
					for (var el in parts[p].errorList) {
						if (!rParts[p].errorList[el]) rParts[p].errorList[el] = parts[p].errorList[el];
					}rParts[p].evts = {
						code: this._coder.from(parts[p].evts.code),
						codeRef: this._coder.from(parts[p].evts.codeRef),
						time: this._coder.from(parts[p].evts.time)
					};
				}
				// console.log(rParts[p].error);
			}
			// console.log('parts, rParts');
			// console.log(parts);
			// console.log(rParts);
		} else {
			Logger.error("No parts to read for robot " + data[n].name);
		}
	}
};

/** create Status service **/
DiyaSelector.prototype.Status = function () {
	return new Status(this);
};

/**
 * Set on status
 * @param robotName to find status to modify
 * @param partName 	to find status to modify
 * @param code		newCode
 * @param source		source
 * @param callback		return callback (<bool>success)
 */
DiyaSelector.prototype.setStatus = function (robotName, partName, code, source, callback) {
	var funcName = "SetStatus_" + partName;
	this.request({ service: "status", func: funcName, data: { robotName: robotName, statusCode: code, partName: partName, source: source | 1 } }, function (peerId, err, data) {
		if (err) {
			if (callback) callback(false);
		} else {
			if (callback) callback(true);
		}
	});
};

/**
 * Get one status
 * @param robotName to get status
 * @param partName 	to get status
 * @param callback		return callback(-1 if not found/data otherwise)
 * @param _full 	more data about status
 */
DiyaSelector.prototype.getStatus = function (robotName, partName, callback, _full) {
	var full = _full || false;
	this.request({ service: "status", func: "GetStatus", data: { robotName: robotName, partName: partName, full: full } }, function (peerId, err, data) {
		if (err) {
			if (callback) callback(-1);
		} else {
			if (callback) callback(data);
		}
	});
};

},{"../../DiyaSelector":18,"../message":23,"util":7}],27:[function(require,module,exports){
'use strict';

/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */

/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

/**
 * Management of channel encoding
 * - base64 coding
 * - none
 * Data format :
 *		t: {'b64','none'}
 *		b: <if b64> {4,8}
 *		d: encoded data {buffer or Array}
 *		s: size
 */

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var base64 = require('base-64');

/**
 * Default : no encoding
 * */
function NoCoding() {
	return this;
};

/**
*
*/
NoCoding.prototype.from = function (data) {
	if (data.d === 'number' || Array.isArray(data.d)) return data.d;else return data;
};

/**
*/
NoCoding.prototype.to = function (array) {
	return {
		t: 'no', /* type */
		d: array, /* data */
		s: array.length
	};
};

/**
 * Management of base64 encoding
 * Effective for string based channels (like JSON based WS)
 * */
function Base64Coding() {
	return this;
};

////////////////////////////////////////////////////////////////
/////////////////    Utility functions    //////////////////////
////////////////////////////////////////////////////////////////

/*\
 |*|
 |*|  utilitaires de manipulations de chaînes base 64 / binaires / UTF-8
 |*|
 |*|  https://developer.mozilla.org/fr/docs/Décoder_encoder_en_base64
 |*|
 \*/
/** Decoder un tableau d'octets depuis une chaîne en base64 */
var b64ToUint6 = function b64ToUint6(nChr) {
	return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;
};

/**
 * Decode base64 string to UInt8Array
 * @param  {String} sBase64		base64 coded string
 * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
 * @return {Uint8Array}				tab of decoded bytes
 */
var base64DecToArr = function base64DecToArr(sBase64, nBlocksSize) {
	var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
	    nInLen = sB64Enc.length,
	    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
	    buffer = new ArrayBuffer(nOutLen),
	    taBytes = new Uint8Array(buffer);

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

////////////////////////////////////////////////////////////////
/////////////////   Interface functions   //////////////////////
////////////////////////////////////////////////////////////////


/**
* Convert buffer coded in base64 and containing numbers coded by
* byteCoding bytes into array
* @param buffer in base64
* @param byteCoding number of bytes for each number (4 or 8)
* @return array of float (32 or 64). null if could not convert.
*/
Base64Coding.prototype.from = function (data) {
	var byteCoding = data.b;

	/* check byte coding */
	if (byteCoding !== 4 && byteCoding !== 8) {
		return null;
	}

	/* decode data to array of byte */
	var buf = base64DecToArr(data.d, data.b);
	/* parse data to float array */
	var fArray = null;
	switch (data.b) {
		case 4:
			fArray = new Float32Array(buf);
			break;
		case 8:
			fArray = new Float64Array(buf);
			break;
		default:
			console.log("Unexpected byteCoding! Should not happen!!");
			return null;
	}
	/* parse fArray into normal array */
	var tab = [].slice.call(fArray);

	if (data.s !== tab.length) {
		console.log("Size mismatch when decoding !");
		return null;
	}
	return tab;
};

/**
* Convert array containing numbers coded by byteCoding bytes into buffer coded in base64
* @param 	{Array<Float>} 	array of float (32 or 64 bits)
* @param 	{integer} 	byteCoding number of bytes for each float (4 or 8)
* @return  	{String} 	buffer in base64. null if could not convert.
*/
Base64Coding.prototype.to = function (array, byteCoding) {
	/* check byte coding */
	if (byteCoding !== 4 && byteCoding !== 8) {
		return null;
	}

	/*** case ArrayBuffer ***/
	var buffer = new ArrayBuffer(array.length * byteCoding);
	switch (byteCoding) {
		case 4:
			var buf32 = new Float32Array(buffer);
			buf32.set(array);
			break;
		case 8:
			var buf64 = new Float64Array(buffer);
			buf64.set(array);
			break;
	}
	var buffChar = new Uint8Array(buffer);
	var buffCharCoded = new Array(buffChar.length);
	for (var n = 0; n < buffChar.length; n++) {
		buffCharCoded[n] = String.fromCharCode(buffChar[n]);
	}
	var str = new String(buffCharCoded.join(''));
	var b64Buff = base64.encode(str);
	return {
		t: 'b64', /* type */
		b: byteCoding, /* byteCoding */
		d: b64Buff, /* data */
		s: array.length /* size */
	};
};

/**
 * Management of comm encoding
 * */
function CodingHandler() {
	this.b64 = new Base64Coding();
	this.none = new NoCoding();

	return this;
};

CodingHandler.prototype.from = function (data) {
	if (typeof data == 'undefined' || data == null) return null;
	switch (data.t) {
		case 'b64':
			return this.b64.from(data);
		default:
			return this.none.from(data);
	}
};

CodingHandler.prototype.to = function (array, type, byteCoding) {
	if (typeof array === 'number') {
		array = [array];
	}
	if (!Array.isArray(array)) {
		console.log("CodingHandler.to only accepts array !");
		return null;
	}

	switch (type) {
		case 'b64':
			return this.b64.to(array, byteCoding);
		case 'no':
		default:
			return this.none.to(array);
	}
};

/** Add base64 handler to DiyaSelector **/
DiyaSelector.prototype.encode = function () {
	return new CodingHandler();
};

},{"../../DiyaSelector":18,"base-64":1}]},{},[19])(19)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZS02NC9iYXNlNjQuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9ub2RlLWV2ZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9hZGFwdGVyX2NvcmUuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2Nocm9tZS9jaHJvbWVfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvY2hyb21lL2dldHVzZXJtZWRpYS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZWRnZS9lZGdlX3NkcC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZWRnZS9lZGdlX3NoaW0uanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZmlyZWZveF9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9maXJlZm94L2dldHVzZXJtZWRpYS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvc2FmYXJpL3NhZmFyaV9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy91dGlscy5qcyIsInNyYy9EaXlhTm9kZS5qcyIsInNyYy9EaXlhU2VsZWN0b3IuanMiLCJzcmMvZGl5YS1zZGsuanMiLCJzcmMvc2VydmljZXMvY29uZmlnL2NvbmZpZy5qcyIsInNyYy9zZXJ2aWNlcy9pZXEvaWVxLmpzIiwic3JjL3NlcnZpY2VzL21lc2hOZXR3b3JrL01lc2hOZXR3b3JrLmpzIiwic3JjL3NlcnZpY2VzL21lc3NhZ2UuanMiLCJzcmMvc2VydmljZXMvcGVlckF1dGgvUGVlckF1dGguanMiLCJzcmMvc2VydmljZXMvcnRjL3J0Yy5qcyIsInNyYy9zZXJ2aWNlcy9zdGF0dXMvc3RhdHVzLmpzIiwic3JjL3V0aWxzL2VuY29kaW5nL2VuY29kaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFaO0FBQ0EsU0FBTyxJQUFQO0FBQ0E7O0FBRUQsU0FBTyxJQUFQO0FBQ0EsT0FBSyxLQUFMO0FBQ0MsVUFBTyxLQUFLLEdBQUwsQ0FBUyxFQUFULENBQVksS0FBWixFQUFtQixVQUFuQixDQUFQO0FBQ0QsT0FBSyxJQUFMO0FBQ0E7QUFDQyxVQUFPLEtBQUssSUFBTCxDQUFVLEVBQVYsQ0FBYSxLQUFiLENBQVA7QUFMRDtBQU9BLENBaEJEOztBQW1CQTtBQUNBLGFBQWEsU0FBYixDQUF1QixNQUF2QixHQUFnQyxZQUFVO0FBQ3pDLFFBQU8sSUFBSSxhQUFKLEVBQVA7QUFDQSxDQUZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qISBodHRwOi8vbXRocy5iZS9iYXNlNjQgdjAuMS4wIGJ5IEBtYXRoaWFzIHwgTUlUIGxpY2Vuc2UgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlcyBgZXhwb3J0c2AuXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuXG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSwgYW5kIHVzZVxuXHQvLyBpdCBhcyBgcm9vdGAuXG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIEludmFsaWRDaGFyYWN0ZXJFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9O1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yO1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZENoYXJhY3RlckVycm9yJztcblxuXHR2YXIgZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0Ly8gTm90ZTogdGhlIGVycm9yIG1lc3NhZ2VzIHVzZWQgdGhyb3VnaG91dCB0aGlzIGZpbGUgbWF0Y2ggdGhvc2UgdXNlZCBieVxuXHRcdC8vIHRoZSBuYXRpdmUgYGF0b2JgL2BidG9hYCBpbXBsZW1lbnRhdGlvbiBpbiBDaHJvbWl1bS5cblx0XHR0aHJvdyBuZXcgSW52YWxpZENoYXJhY3RlckVycm9yKG1lc3NhZ2UpO1xuXHR9O1xuXG5cdHZhciBUQUJMRSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC9jb21tb24tbWljcm9zeW50YXhlcy5odG1sI3NwYWNlLWNoYXJhY3RlclxuXHR2YXIgUkVHRVhfU1BBQ0VfQ0hBUkFDVEVSUyA9IC9bXFx0XFxuXFxmXFxyIF0vZztcblxuXHQvLyBgZGVjb2RlYCBpcyBkZXNpZ25lZCB0byBiZSBmdWxseSBjb21wYXRpYmxlIHdpdGggYGF0b2JgIGFzIGRlc2NyaWJlZCBpbiB0aGVcblx0Ly8gSFRNTCBTdGFuZGFyZC4gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC93ZWJhcHBhcGlzLmh0bWwjZG9tLXdpbmRvd2Jhc2U2NC1hdG9iXG5cdC8vIFRoZSBvcHRpbWl6ZWQgYmFzZTY0LWRlY29kaW5nIGFsZ29yaXRobSB1c2VkIGlzIGJhc2VkIG9uIEBhdGvigJlzIGV4Y2VsbGVudFxuXHQvLyBpbXBsZW1lbnRhdGlvbi4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYXRrLzEwMjAzOTZcblx0dmFyIGRlY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpXG5cdFx0XHQucmVwbGFjZShSRUdFWF9TUEFDRV9DSEFSQUNURVJTLCAnJyk7XG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0XHRpZiAobGVuZ3RoICUgNCA9PSAwKSB7XG5cdFx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UoLz09PyQvLCAnJyk7XG5cdFx0XHRsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdGxlbmd0aCAlIDQgPT0gMSB8fFxuXHRcdFx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvQyNhbHBoYW51bWVyaWMtYXNjaWktY2hhcmFjdGVyc1xuXHRcdFx0L1teK2EtekEtWjAtOS9dLy50ZXN0KGlucHV0KVxuXHRcdCkge1xuXHRcdFx0ZXJyb3IoXG5cdFx0XHRcdCdJbnZhbGlkIGNoYXJhY3RlcjogdGhlIHN0cmluZyB0byBiZSBkZWNvZGVkIGlzIG5vdCBjb3JyZWN0bHkgZW5jb2RlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgYml0Q291bnRlciA9IDA7XG5cdFx0dmFyIGJpdFN0b3JhZ2U7XG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0dmFyIHBvc2l0aW9uID0gLTE7XG5cdFx0d2hpbGUgKCsrcG9zaXRpb24gPCBsZW5ndGgpIHtcblx0XHRcdGJ1ZmZlciA9IFRBQkxFLmluZGV4T2YoaW5wdXQuY2hhckF0KHBvc2l0aW9uKSk7XG5cdFx0XHRiaXRTdG9yYWdlID0gYml0Q291bnRlciAlIDQgPyBiaXRTdG9yYWdlICogNjQgKyBidWZmZXIgOiBidWZmZXI7XG5cdFx0XHQvLyBVbmxlc3MgdGhpcyBpcyB0aGUgZmlyc3Qgb2YgYSBncm91cCBvZiA0IGNoYXJhY3RlcnPigKZcblx0XHRcdGlmIChiaXRDb3VudGVyKysgJSA0KSB7XG5cdFx0XHRcdC8vIOKApmNvbnZlcnQgdGhlIGZpcnN0IDggYml0cyB0byBhIHNpbmdsZSBBU0NJSSBjaGFyYWN0ZXIuXG5cdFx0XHRcdG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuXHRcdFx0XHRcdDB4RkYgJiBiaXRTdG9yYWdlID4+ICgtMiAqIGJpdENvdW50ZXIgJiA2KVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdC8vIGBlbmNvZGVgIGlzIGRlc2lnbmVkIHRvIGJlIGZ1bGx5IGNvbXBhdGlibGUgd2l0aCBgYnRvYWAgYXMgZGVzY3JpYmVkIGluIHRoZVxuXHQvLyBIVE1MIFN0YW5kYXJkOiBodHRwOi8vd2hhdHdnLm9yZy9odG1sL3dlYmFwcGFwaXMuaHRtbCNkb20td2luZG93YmFzZTY0LWJ0b2Fcblx0dmFyIGVuY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpO1xuXHRcdGlmICgvW15cXDAtXFx4RkZdLy50ZXN0KGlucHV0KSkge1xuXHRcdFx0Ly8gTm90ZTogbm8gbmVlZCB0byBzcGVjaWFsLWNhc2UgYXN0cmFsIHN5bWJvbHMgaGVyZSwgYXMgc3Vycm9nYXRlcyBhcmVcblx0XHRcdC8vIG1hdGNoZWQsIGFuZCB0aGUgaW5wdXQgaXMgc3VwcG9zZWQgdG8gb25seSBjb250YWluIEFTQ0lJIGFueXdheS5cblx0XHRcdGVycm9yKFxuXHRcdFx0XHQnVGhlIHN0cmluZyB0byBiZSBlbmNvZGVkIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3V0c2lkZSBvZiB0aGUgJyArXG5cdFx0XHRcdCdMYXRpbjEgcmFuZ2UuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIHBhZGRpbmcgPSBpbnB1dC5sZW5ndGggJSAzO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR2YXIgcG9zaXRpb24gPSAtMTtcblx0XHR2YXIgYTtcblx0XHR2YXIgYjtcblx0XHR2YXIgYztcblx0XHR2YXIgZDtcblx0XHR2YXIgYnVmZmVyO1xuXHRcdC8vIE1ha2Ugc3VyZSBhbnkgcGFkZGluZyBpcyBoYW5kbGVkIG91dHNpZGUgb2YgdGhlIGxvb3AuXG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aCAtIHBhZGRpbmc7XG5cblx0XHR3aGlsZSAoKytwb3NpdGlvbiA8IGxlbmd0aCkge1xuXHRcdFx0Ly8gUmVhZCB0aHJlZSBieXRlcywgaS5lLiAyNCBiaXRzLlxuXHRcdFx0YSA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pIDw8IDE2O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbikgPDwgODtcblx0XHRcdGMgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pO1xuXHRcdFx0YnVmZmVyID0gYSArIGIgKyBjO1xuXHRcdFx0Ly8gVHVybiB0aGUgMjQgYml0cyBpbnRvIGZvdXIgY2h1bmtzIG9mIDYgYml0cyBlYWNoLCBhbmQgYXBwZW5kIHRoZVxuXHRcdFx0Ly8gbWF0Y2hpbmcgY2hhcmFjdGVyIGZvciBlYWNoIG9mIHRoZW0gdG8gdGhlIG91dHB1dC5cblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTggJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTIgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gNiAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciAmIDB4M0YpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmIChwYWRkaW5nID09IDIpIHtcblx0XHRcdGEgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA8PCA4O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbik7XG5cdFx0XHRidWZmZXIgPSBhICsgYjtcblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTApICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPj4gNCkgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDIpICYgMHgzRikgK1xuXHRcdFx0XHQnPSdcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChwYWRkaW5nID09IDEpIHtcblx0XHRcdGJ1ZmZlciA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pO1xuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAyKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDQpICYgMHgzRikgK1xuXHRcdFx0XHQnPT0nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH07XG5cblx0dmFyIGJhc2U2NCA9IHtcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J3ZlcnNpb24nOiAnMC4xLjAnXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gYmFzZTY0O1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gYmFzZTY0O1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYmFzZTY0KSB7XG5cdFx0XHRcdGJhc2U2NC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gYmFzZTY0W2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QuYmFzZTY0ID0gYmFzZTY0O1xuXHR9XG5cbn0odGhpcykpO1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zXG4gKi9cblxudmFyIHV0aWwgPSB7fTtcblxudXRpbC5pc09iamVjdCA9IGZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG51dGlsLmlzTnVtYmVyID0gZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxudXRpbC5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5cbnV0aWwuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKXtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cblxuLyoqXG4gKiBFdmVudEVtaXR0ZXIgY2xhc3NcbiAqL1xuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF1dGlsLmlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicgJiYgIXRoaXMuX2V2ZW50cy5lcnJvcikge1xuICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICB1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmICh1dGlsLmlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcblxuICAgICAgaWYgKHV0aWwuaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIH1cbiAgICAgIGlmICh1dGlsLmlzRnVuY3Rpb24oY29uc29sZS50cmFjZSkpXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICh1dGlsLmlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAodXRpbC5pc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gU2hpbW1pbmcgc3RhcnRzIGhlcmUuXG4oZnVuY3Rpb24oKSB7XG4gIC8vIFV0aWxzLlxuICB2YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5sb2c7XG4gIHZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcbiAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlckRldGFpbHMgPSBicm93c2VyRGV0YWlscztcbiAgbW9kdWxlLmV4cG9ydHMuZXh0cmFjdFZlcnNpb24gPSByZXF1aXJlKCcuL3V0aWxzJykuZXh0cmFjdFZlcnNpb247XG4gIG1vZHVsZS5leHBvcnRzLmRpc2FibGVMb2cgPSByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZztcblxuICAvLyBDb21tZW50IG91dCB0aGUgbGluZSBiZWxvdyBpZiB5b3Ugd2FudCBsb2dnaW5nIHRvIG9jY3VyLCBpbmNsdWRpbmcgbG9nZ2luZ1xuICAvLyBmb3IgdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3cuIENhbiBhbHNvIGJlIHR1cm5lZCBvbiBpbiB0aGUgYnJvd3NlciB2aWFcbiAgLy8gYWRhcHRlci5kaXNhYmxlTG9nKGZhbHNlKSwgYnV0IHRoZW4gbG9nZ2luZyBmcm9tIHRoZSBzd2l0Y2ggc3RhdGVtZW50IGJlbG93XG4gIC8vIHdpbGwgbm90IGFwcGVhci5cbiAgcmVxdWlyZSgnLi91dGlscycpLmRpc2FibGVMb2codHJ1ZSk7XG5cbiAgLy8gQnJvd3NlciBzaGltcy5cbiAgdmFyIGNocm9tZVNoaW0gPSByZXF1aXJlKCcuL2Nocm9tZS9jaHJvbWVfc2hpbScpIHx8IG51bGw7XG4gIHZhciBlZGdlU2hpbSA9IHJlcXVpcmUoJy4vZWRnZS9lZGdlX3NoaW0nKSB8fCBudWxsO1xuICB2YXIgZmlyZWZveFNoaW0gPSByZXF1aXJlKCcuL2ZpcmVmb3gvZmlyZWZveF9zaGltJykgfHwgbnVsbDtcbiAgdmFyIHNhZmFyaVNoaW0gPSByZXF1aXJlKCcuL3NhZmFyaS9zYWZhcmlfc2hpbScpIHx8IG51bGw7XG5cbiAgLy8gU2hpbSBicm93c2VyIGlmIGZvdW5kLlxuICBzd2l0Y2ggKGJyb3dzZXJEZXRhaWxzLmJyb3dzZXIpIHtcbiAgICBjYXNlICdvcGVyYSc6IC8vIGZhbGx0aHJvdWdoIGFzIGl0IHVzZXMgY2hyb21lIHNoaW1zXG4gICAgY2FzZSAnY2hyb21lJzpcbiAgICAgIGlmICghY2hyb21lU2hpbSB8fCAhY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnQ2hyb21lIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGNocm9tZS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGNocm9tZVNoaW07XG5cbiAgICAgIGNocm9tZVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltU291cmNlT2JqZWN0KCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgY2hyb21lU2hpbS5zaGltT25UcmFjaygpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmlyZWZveCc6XG4gICAgICBpZiAoIWZpcmVmb3hTaGltIHx8ICFmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnRmlyZWZveCBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBmaXJlZm94LicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gZmlyZWZveFNoaW07XG5cbiAgICAgIGZpcmVmb3hTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1Tb3VyY2VPYmplY3QoKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbU9uVHJhY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VkZ2UnOlxuICAgICAgaWYgKCFlZGdlU2hpbSB8fCAhZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ01TIGVkZ2Ugc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZWRnZS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGVkZ2VTaGltO1xuXG4gICAgICBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NhZmFyaSc6XG4gICAgICBpZiAoIXNhZmFyaVNoaW0pIHtcbiAgICAgICAgbG9nZ2luZygnU2FmYXJpIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIHNhZmFyaS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IHNhZmFyaVNoaW07XG5cbiAgICAgIHNhZmFyaVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxvZ2dpbmcoJ1Vuc3VwcG9ydGVkIGJyb3dzZXIhJyk7XG4gIH1cbn0pKCk7XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmJyb3dzZXJEZXRhaWxzO1xuXG52YXIgY2hyb21lU2hpbSA9IHtcbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb250cmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIGlmICh0aGlzLl9vbnRyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gb25hZGRzdHJlYW0gZG9lcyBub3QgZmlyZSB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgdG8gYW4gZXhpc3RpbmdcbiAgICAgICAgICAgIC8vIHN0cmVhbS4gQnV0IHN0cmVhbS5vbmFkZHRyYWNrIGlzIGltcGxlbWVudGVkIHNvIHdlIHVzZSB0aGF0LlxuICAgICAgICAgICAgZS5zdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbih0ZSkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdGUudHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0ZS50cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBzaGltU291cmNlT2JqZWN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudCAmJlxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUsICdzcmNPYmplY3QnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zcmNPYmplY3Q7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgLy8gVXNlIF9zcmNPYmplY3QgYXMgYSBwcml2YXRlIHByb3BlcnR5IGZvciB0aGlzIHNoaW1cbiAgICAgICAgICAgIHRoaXMuX3NyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuc3JjKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFzdHJlYW0pIHtcbiAgICAgICAgICAgICAgdGhpcy5zcmMgPSAnJztcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHJlY3JlYXRlIHRoZSBibG9iIHVybCB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgb3JcbiAgICAgICAgICAgIC8vIHJlbW92ZWQuIERvaW5nIGl0IG1hbnVhbGx5IHNpbmNlIHdlIHdhbnQgdG8gYXZvaWQgYSByZWN1cnNpb24uXG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdyZW1vdmV0cmFjaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5zcmMpIHtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHNlbGYuc3JjKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xuICAgICAgLy8gVHJhbnNsYXRlIGljZVRyYW5zcG9ydFBvbGljeSB0byBpY2VUcmFuc3BvcnRzLFxuICAgICAgLy8gc2VlIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3Avd2VicnRjL2lzc3Vlcy9kZXRhaWw/aWQ9NDg2OVxuICAgICAgbG9nZ2luZygnUGVlckNvbm5lY3Rpb24nKTtcbiAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgcGNDb25maWcuaWNlVHJhbnNwb3J0cyA9IHBjQ29uZmlnLmljZVRyYW5zcG9ydFBvbGljeTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBjID0gbmV3IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIHZhciBvcmlnR2V0U3RhdHMgPSBwYy5nZXRTdGF0cy5iaW5kKHBjKTtcbiAgICAgIHBjLmdldFN0YXRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIC8vIElmIHNlbGVjdG9yIGlzIGEgZnVuY3Rpb24gdGhlbiB3ZSBhcmUgaW4gdGhlIG9sZCBzdHlsZSBzdGF0cyBzbyBqdXN0XG4gICAgICAgIC8vIHBhc3MgYmFjayB0aGUgb3JpZ2luYWwgZ2V0U3RhdHMgZm9ybWF0IHRvIGF2b2lkIGJyZWFraW5nIG9sZCB1c2Vycy5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMoc2VsZWN0b3IsIHN1Y2Nlc3NDYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZml4Q2hyb21lU3RhdHNfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICB2YXIgc3RhbmRhcmRSZXBvcnQgPSB7fTtcbiAgICAgICAgICB2YXIgcmVwb3J0cyA9IHJlc3BvbnNlLnJlc3VsdCgpO1xuICAgICAgICAgIHJlcG9ydHMuZm9yRWFjaChmdW5jdGlvbihyZXBvcnQpIHtcbiAgICAgICAgICAgIHZhciBzdGFuZGFyZFN0YXRzID0ge1xuICAgICAgICAgICAgICBpZDogcmVwb3J0LmlkLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IHJlcG9ydC50aW1lc3RhbXAsXG4gICAgICAgICAgICAgIHR5cGU6IHJlcG9ydC50eXBlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVwb3J0Lm5hbWVzKCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgIHN0YW5kYXJkU3RhdHNbbmFtZV0gPSByZXBvcnQuc3RhdChuYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RhbmRhcmRSZXBvcnRbc3RhbmRhcmRTdGF0cy5pZF0gPSBzdGFuZGFyZFN0YXRzO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHN0YW5kYXJkUmVwb3J0O1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICB2YXIgc3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgYXJnc1sxXShmaXhDaHJvbWVTdGF0c18ocmVzcG9uc2UpKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIG9yaWdHZXRTdGF0cy5hcHBseSh0aGlzLCBbc3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8sXG4gICAgICAgICAgICAgIGFyZ3VtZW50c1swXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcHJvbWlzZS1zdXBwb3J0XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIHNlbGVjdG9yID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgb3JpZ0dldFN0YXRzLmFwcGx5KHNlbGYsXG4gICAgICAgICAgICAgICAgW2Z1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlLmFwcGx5KG51bGwsIFtmaXhDaHJvbWVTdGF0c18ocmVzcG9uc2UpXSk7XG4gICAgICAgICAgICAgICAgfSwgcmVqZWN0XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9yaWdHZXRTdGF0cy5hcHBseShzZWxmLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBwYztcbiAgICB9O1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XG5cbiAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgIGlmICh3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gYWRkIHByb21pc2Ugc3VwcG9ydFxuICAgIFsnY3JlYXRlT2ZmZXInLCAnY3JlYXRlQW5zd2VyJ10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxIHx8IChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzBdKSA9PT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgdmFyIG9wdHMgPSBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkO1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIG5hdGl2ZU1ldGhvZC5hcHBseShzZWxmLCBbcmVzb2x2ZSwgcmVqZWN0LCBvcHRzXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgYXJnc1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpP1xuICAgICAgICAgICAgICAgIFJUQ0ljZUNhbmRpZGF0ZSA6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbikoYXJnc1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgIG5hdGl2ZU1ldGhvZC5hcHBseShzZWxmLCBbYXJnc1swXSxcbiAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXJnc1sxXS5hcHBseShudWxsLCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYXJnc1syXS5hcHBseShudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICB9LFxuXG4gIC8vIEF0dGFjaCBhIG1lZGlhIHN0cmVhbSB0byBhbiBlbGVtZW50LlxuICBhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24oZWxlbWVudCwgc3RyZWFtKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPj0gNDMpIHtcbiAgICAgIGVsZW1lbnQuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW1lbnQuc3JjICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZWxlbWVudC5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dpbmcoJ0Vycm9yIGF0dGFjaGluZyBzdHJlYW0gdG8gZWxlbWVudC4nKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24odG8sIGZyb20pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCByZWF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uID49IDQzKSB7XG4gICAgICB0by5zcmNPYmplY3QgPSBmcm9tLnNyY09iamVjdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG8uc3JjID0gZnJvbS5zcmM7XG4gICAgfVxuICB9XG59O1xuXG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltT25UcmFjazogY2hyb21lU2hpbS5zaGltT25UcmFjayxcbiAgc2hpbVNvdXJjZU9iamVjdDogY2hyb21lU2hpbS5zaGltU291cmNlT2JqZWN0LFxuICBzaGltUGVlckNvbm5lY3Rpb246IGNocm9tZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpLFxuICBhdHRhY2hNZWRpYVN0cmVhbTogY2hyb21lU2hpbS5hdHRhY2hNZWRpYVN0cmVhbSxcbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogY2hyb21lU2hpbS5yZWF0dGFjaE1lZGlhU3RyZWFtXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykubG9nO1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29uc3RyYWludHNUb0Nocm9tZV8gPSBmdW5jdGlvbihjKSB7XG4gICAgaWYgKHR5cGVvZiBjICE9PSAnb2JqZWN0JyB8fCBjLm1hbmRhdG9yeSB8fCBjLm9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgdmFyIGNjID0ge307XG4gICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciByID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/IGNba2V5XSA6IHtpZGVhbDogY1trZXldfTtcbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHIubWluID0gci5tYXggPSByLmV4YWN0O1xuICAgICAgfVxuICAgICAgdmFyIG9sZG5hbWVfID0gZnVuY3Rpb24ocHJlZml4LCBuYW1lKSB7XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsgbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuYW1lID09PSAnZGV2aWNlSWQnKSA/ICdzb3VyY2VJZCcgOiBuYW1lO1xuICAgICAgfTtcbiAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2Mub3B0aW9uYWwgPSBjYy5vcHRpb25hbCB8fCBbXTtcbiAgICAgICAgdmFyIG9jID0ge307XG4gICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWluJywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICAgIG9jID0ge307XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJ21heCcsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnJywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiByLmV4YWN0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICBjYy5tYW5kYXRvcnkgPSBjYy5tYW5kYXRvcnkgfHwge307XG4gICAgICAgIGNjLm1hbmRhdG9yeVtvbGRuYW1lXygnJywga2V5KV0gPSByLmV4YWN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgWydtaW4nLCAnbWF4J10uZm9yRWFjaChmdW5jdGlvbihtaXgpIHtcbiAgICAgICAgICBpZiAoclttaXhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNjLm1hbmRhdG9yeSA9IGNjLm1hbmRhdG9yeSB8fCB7fTtcbiAgICAgICAgICAgIGNjLm1hbmRhdG9yeVtvbGRuYW1lXyhtaXgsIGtleSldID0gclttaXhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGMuYWR2YW5jZWQpIHtcbiAgICAgIGNjLm9wdGlvbmFsID0gKGNjLm9wdGlvbmFsIHx8IFtdKS5jb25jYXQoYy5hZHZhbmNlZCk7XG4gICAgfVxuICAgIHJldHVybiBjYztcbiAgfTtcblxuICB2YXIgZ2V0VXNlck1lZGlhXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoY29uc3RyYWludHMuYXVkaW8pIHtcbiAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMuYXVkaW8pO1xuICAgIH1cbiAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMudmlkZW8pO1xuICAgIH1cbiAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIHJldHVybiBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICB9O1xuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZ2V0VXNlck1lZGlhXztcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9O1xuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7XG4gICAgICBnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxuICAgICAgZW51bWVyYXRlRGV2aWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGtpbmRzID0ge2F1ZGlvOiAnYXVkaW9pbnB1dCcsIHZpZGVvOiAndmlkZW9pbnB1dCd9O1xuICAgICAgICAgIHJldHVybiBNZWRpYVN0cmVhbVRyYWNrLmdldFNvdXJjZXMoZnVuY3Rpb24oZGV2aWNlcykge1xuICAgICAgICAgICAgcmVzb2x2ZShkZXZpY2VzLm1hcChmdW5jdGlvbihkZXZpY2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtsYWJlbDogZGV2aWNlLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IGtpbmRzW2RldmljZS5raW5kXSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VJZDogZGV2aWNlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ6ICcnfTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIEEgc2hpbSBmb3IgZ2V0VXNlck1lZGlhIG1ldGhvZCBvbiB0aGUgbWVkaWFEZXZpY2VzIG9iamVjdC5cbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgICAgcmV0dXJuIGdldFVzZXJNZWRpYVByb21pc2VfKGNvbnN0cmFpbnRzKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIEV2ZW4gdGhvdWdoIENocm9tZSA0NSBoYXMgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyBhbmQgYSBnZXRVc2VyTWVkaWFcbiAgICAvLyBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgUHJvbWlzZSwgaXQgZG9lcyBub3QgYWNjZXB0IHNwZWMtc3R5bGVcbiAgICAvLyBjb25zdHJhaW50cy5cbiAgICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgICBiaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oYykge1xuICAgICAgaWYgKGMpIHtcbiAgICAgICAgbG9nZ2luZygnc3BlYzogICAnICsgSlNPTi5zdHJpbmdpZnkoYykpOyAvLyB3aGl0ZXNwYWNlIGZvciBhbGlnbm1lbnRcbiAgICAgICAgYy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGMuYXVkaW8pO1xuICAgICAgICBjLnZpZGVvID0gY29uc3RyYWludHNUb0Nocm9tZV8oYy52aWRlbyk7XG4gICAgICAgIGxvZ2dpbmcoJ2Nocm9tZTogJyArIEpTT04uc3RyaW5naWZ5KGMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvcmlnR2V0VXNlck1lZGlhKGMpO1xuICAgIH0uYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8vIER1bW15IGRldmljZWNoYW5nZSBldmVudCBtZXRob2RzLlxuICAvLyBUT0RPKEthcHRlbkphbnNzb24pIHJlbW92ZSBvbmNlIGltcGxlbWVudGVkIGluIENocm9tZSBzdGFibGUuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgbG9nZ2luZygnRHVtbXkgbWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgY2FsbGVkLicpO1xuICAgIH07XG4gIH1cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb2dnaW5nKCdEdW1teSBtZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciBjYWxsZWQuJyk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBTRFAgaGVscGVycy5cbnZhciBTRFBVdGlscyA9IHt9O1xuXG4vLyBHZW5lcmF0ZSBhbiBhbHBoYW51bWVyaWMgaWRlbnRpZmllciBmb3IgY25hbWUgb3IgbWlkcy5cbi8vIFRPRE86IHVzZSBVVUlEcyBpbnN0ZWFkPyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9qZWQvOTgyODgzXG5TRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCAxMCk7XG59O1xuXG4vLyBUaGUgUlRDUCBDTkFNRSB1c2VkIGJ5IGFsbCBwZWVyY29ubmVjdGlvbnMgZnJvbSB0aGUgc2FtZSBKUy5cblNEUFV0aWxzLmxvY2FsQ05hbWUgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcblxuLy8gU3BsaXRzIFNEUCBpbnRvIGxpbmVzLCBkZWFsaW5nIHdpdGggYm90aCBDUkxGIGFuZCBMRi5cblNEUFV0aWxzLnNwbGl0TGluZXMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHJldHVybiBibG9iLnRyaW0oKS5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gbGluZS50cmltKCk7XG4gIH0pO1xufTtcbi8vIFNwbGl0cyBTRFAgaW50byBzZXNzaW9ucGFydCBhbmQgbWVkaWFzZWN0aW9ucy4gRW5zdXJlcyBDUkxGLlxuU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgdmFyIHBhcnRzID0gYmxvYi5zcGxpdCgnXFxubT0nKTtcbiAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbihwYXJ0LCBpbmRleCkge1xuICAgIHJldHVybiAoaW5kZXggPiAwID8gJ209JyArIHBhcnQgOiBwYXJ0KS50cmltKCkgKyAnXFxyXFxuJztcbiAgfSk7XG59O1xuXG4vLyBSZXR1cm5zIGxpbmVzIHRoYXQgc3RhcnQgd2l0aCBhIGNlcnRhaW4gcHJlZml4LlxuU0RQVXRpbHMubWF0Y2hQcmVmaXggPSBmdW5jdGlvbihibG9iLCBwcmVmaXgpIHtcbiAgcmV0dXJuIFNEUFV0aWxzLnNwbGl0TGluZXMoYmxvYikuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gbGluZS5pbmRleE9mKHByZWZpeCkgPT09IDA7XG4gIH0pO1xufTtcblxuLy8gUGFyc2VzIGFuIElDRSBjYW5kaWRhdGUgbGluZS4gU2FtcGxlIGlucHV0OlxuLy8gY2FuZGlkYXRlOjcwMjc4NjM1MCAyIHVkcCA0MTgxOTkwMiA4LjguOC44IDYwNzY5IHR5cCByZWxheSByYWRkciA4LjguOC44XG4vLyBycG9ydCA1NTk5NlwiXG5TRFBVdGlscy5wYXJzZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzO1xuICAvLyBQYXJzZSBib3RoIHZhcmlhbnRzLlxuICBpZiAobGluZS5pbmRleE9mKCdhPWNhbmRpZGF0ZTonKSA9PT0gMCkge1xuICAgIHBhcnRzID0gbGluZS5zdWJzdHJpbmcoMTIpLnNwbGl0KCcgJyk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHMgPSBsaW5lLnN1YnN0cmluZygxMCkuc3BsaXQoJyAnKTtcbiAgfVxuXG4gIHZhciBjYW5kaWRhdGUgPSB7XG4gICAgZm91bmRhdGlvbjogcGFydHNbMF0sXG4gICAgY29tcG9uZW50OiBwYXJ0c1sxXSxcbiAgICBwcm90b2NvbDogcGFydHNbMl0udG9Mb3dlckNhc2UoKSxcbiAgICBwcmlvcml0eTogcGFyc2VJbnQocGFydHNbM10sIDEwKSxcbiAgICBpcDogcGFydHNbNF0sXG4gICAgcG9ydDogcGFyc2VJbnQocGFydHNbNV0sIDEwKSxcbiAgICAvLyBza2lwIHBhcnRzWzZdID09ICd0eXAnXG4gICAgdHlwZTogcGFydHNbN11cbiAgfTtcblxuICBmb3IgKHZhciBpID0gODsgaSA8IHBhcnRzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgc3dpdGNoIChwYXJ0c1tpXSkge1xuICAgICAgY2FzZSAncmFkZHInOlxuICAgICAgICBjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MgPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncnBvcnQnOlxuICAgICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQgPSBwYXJzZUludChwYXJ0c1tpICsgMV0sIDEwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0Y3B0eXBlJzpcbiAgICAgICAgY2FuZGlkYXRlLnRjcFR5cGUgPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gVW5rbm93biBleHRlbnNpb25zIGFyZSBzaWxlbnRseSBpZ25vcmVkLlxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZTtcbn07XG5cbi8vIFRyYW5zbGF0ZXMgYSBjYW5kaWRhdGUgb2JqZWN0IGludG8gU0RQIGNhbmRpZGF0ZSBhdHRyaWJ1dGUuXG5TRFBVdGlscy53cml0ZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICB2YXIgc2RwID0gW107XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5mb3VuZGF0aW9uKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmNvbXBvbmVudCk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wcm90b2NvbC50b1VwcGVyQ2FzZSgpKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByaW9yaXR5KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmlwKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnBvcnQpO1xuXG4gIHZhciB0eXBlID0gY2FuZGlkYXRlLnR5cGU7XG4gIHNkcC5wdXNoKCd0eXAnKTtcbiAgc2RwLnB1c2godHlwZSk7XG4gIGlmICh0eXBlICE9PSAnaG9zdCcgJiYgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzICYmXG4gICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQpIHtcbiAgICBzZHAucHVzaCgncmFkZHInKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MpOyAvLyB3YXM6IHJlbEFkZHJcbiAgICBzZHAucHVzaCgncnBvcnQnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZFBvcnQpOyAvLyB3YXM6IHJlbFBvcnRcbiAgfVxuICBpZiAoY2FuZGlkYXRlLnRjcFR5cGUgJiYgY2FuZGlkYXRlLnByb3RvY29sLnRvTG93ZXJDYXNlKCkgPT09ICd0Y3AnKSB7XG4gICAgc2RwLnB1c2goJ3RjcHR5cGUnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUudGNwVHlwZSk7XG4gIH1cbiAgcmV0dXJuICdjYW5kaWRhdGU6JyArIHNkcC5qb2luKCcgJyk7XG59O1xuXG4vLyBQYXJzZXMgYW4gcnRwbWFwIGxpbmUsIHJldHVybnMgUlRDUnRwQ29kZGVjUGFyYW1ldGVycy4gU2FtcGxlIGlucHV0OlxuLy8gYT1ydHBtYXA6MTExIG9wdXMvNDgwMDAvMlxuU0RQVXRpbHMucGFyc2VSdHBNYXAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDkpLnNwbGl0KCcgJyk7XG4gIHZhciBwYXJzZWQgPSB7XG4gICAgcGF5bG9hZFR5cGU6IHBhcnNlSW50KHBhcnRzLnNoaWZ0KCksIDEwKSAvLyB3YXM6IGlkXG4gIH07XG5cbiAgcGFydHMgPSBwYXJ0c1swXS5zcGxpdCgnLycpO1xuXG4gIHBhcnNlZC5uYW1lID0gcGFydHNbMF07XG4gIHBhcnNlZC5jbG9ja1JhdGUgPSBwYXJzZUludChwYXJ0c1sxXSwgMTApOyAvLyB3YXM6IGNsb2NrcmF0ZVxuICAvLyB3YXM6IGNoYW5uZWxzXG4gIHBhcnNlZC5udW1DaGFubmVscyA9IHBhcnRzLmxlbmd0aCA9PT0gMyA/IHBhcnNlSW50KHBhcnRzWzJdLCAxMCkgOiAxO1xuICByZXR1cm4gcGFyc2VkO1xufTtcblxuLy8gR2VuZXJhdGUgYW4gYT1ydHBtYXAgbGluZSBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvclxuLy8gUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVSdHBNYXAgPSBmdW5jdGlvbihjb2RlYykge1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIHJldHVybiAnYT1ydHBtYXA6JyArIHB0ICsgJyAnICsgY29kZWMubmFtZSArICcvJyArIGNvZGVjLmNsb2NrUmF0ZSArXG4gICAgICAoY29kZWMubnVtQ2hhbm5lbHMgIT09IDEgPyAnLycgKyBjb2RlYy5udW1DaGFubmVscyA6ICcnKSArICdcXHJcXG4nO1xufTtcblxuLy8gUGFyc2VzIGFuIGE9ZXh0bWFwIGxpbmUgKGhlYWRlcmV4dGVuc2lvbiBmcm9tIFJGQyA1Mjg1KS4gU2FtcGxlIGlucHV0OlxuLy8gYT1leHRtYXA6MiB1cm46aWV0ZjpwYXJhbXM6cnRwLWhkcmV4dDp0b2Zmc2V0XG5TRFBVdGlscy5wYXJzZUV4dG1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICBpZDogcGFyc2VJbnQocGFydHNbMF0sIDEwKSxcbiAgICB1cmk6IHBhcnRzWzFdXG4gIH07XG59O1xuXG4vLyBHZW5lcmF0ZXMgYT1leHRtYXAgbGluZSBmcm9tIFJUQ1J0cEhlYWRlckV4dGVuc2lvblBhcmFtZXRlcnMgb3Jcbi8vIFJUQ1J0cEhlYWRlckV4dGVuc2lvbi5cblNEUFV0aWxzLndyaXRlRXh0bWFwID0gZnVuY3Rpb24oaGVhZGVyRXh0ZW5zaW9uKSB7XG4gIHJldHVybiAnYT1leHRtYXA6JyArIChoZWFkZXJFeHRlbnNpb24uaWQgfHwgaGVhZGVyRXh0ZW5zaW9uLnByZWZlcnJlZElkKSArXG4gICAgICAgJyAnICsgaGVhZGVyRXh0ZW5zaW9uLnVyaSArICdcXHJcXG4nO1xufTtcblxuLy8gUGFyc2VzIGFuIGZ0bXAgbGluZSwgcmV0dXJucyBkaWN0aW9uYXJ5LiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWZtdHA6OTYgdmJyPW9uO2NuZz1vblxuLy8gQWxzbyBkZWFscyB3aXRoIHZicj1vbjsgY25nPW9uXG5TRFBVdGlscy5wYXJzZUZtdHAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGt2O1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCc7Jyk7XG4gIGZvciAodmFyIGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICBrdiA9IHBhcnRzW2pdLnRyaW0oKS5zcGxpdCgnPScpO1xuICAgIHBhcnNlZFtrdlswXS50cmltKCldID0ga3ZbMV07XG4gIH1cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cbi8vIEdlbmVyYXRlcyBhbiBhPWZ0bXAgbGluZSBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZUZtdHAgPSBmdW5jdGlvbihjb2RlYykge1xuICB2YXIgbGluZSA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5wYXJhbWV0ZXJzICYmIE9iamVjdC5rZXlzKGNvZGVjLnBhcmFtZXRlcnMpLmxlbmd0aCkge1xuICAgIHZhciBwYXJhbXMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICBwYXJhbXMucHVzaChwYXJhbSArICc9JyArIGNvZGVjLnBhcmFtZXRlcnNbcGFyYW1dKTtcbiAgICB9KTtcbiAgICBsaW5lICs9ICdhPWZtdHA6JyArIHB0ICsgJyAnICsgcGFyYW1zLmpvaW4oJzsnKSArICdcXHJcXG4nO1xuICB9XG4gIHJldHVybiBsaW5lO1xufTtcblxuLy8gUGFyc2VzIGFuIHJ0Y3AtZmIgbGluZSwgcmV0dXJucyBSVENQUnRjcEZlZWRiYWNrIG9iamVjdC4gU2FtcGxlIGlucHV0OlxuLy8gYT1ydGNwLWZiOjk4IG5hY2sgcnBzaVxuU0RQVXRpbHMucGFyc2VSdGNwRmIgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKGxpbmUuaW5kZXhPZignICcpICsgMSkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBwYXJ0cy5zaGlmdCgpLFxuICAgIHBhcmFtZXRlcjogcGFydHMuam9pbignICcpXG4gIH07XG59O1xuLy8gR2VuZXJhdGUgYT1ydGNwLWZiIGxpbmVzIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRjcEZiID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmVzID0gJyc7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgaWYgKGNvZGVjLnJ0Y3BGZWVkYmFjayAmJiBjb2RlYy5ydGNwRmVlZGJhY2subGVuZ3RoKSB7XG4gICAgLy8gRklYTUU6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyci1pbnQ/XG4gICAgY29kZWMucnRjcEZlZWRiYWNrLmZvckVhY2goZnVuY3Rpb24oZmIpIHtcbiAgICAgIGxpbmVzICs9ICdhPXJ0Y3AtZmI6JyArIHB0ICsgJyAnICsgZmIudHlwZSArICcgJyArIGZiLnBhcmFtZXRlciArXG4gICAgICAgICAgJ1xcclxcbic7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGxpbmVzO1xufTtcblxuLy8gUGFyc2VzIGFuIFJGQyA1NTc2IHNzcmMgbWVkaWEgYXR0cmlidXRlLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXNzcmM6MzczNTkyODU1OSBjbmFtZTpzb21ldGhpbmdcblNEUFV0aWxzLnBhcnNlU3NyY01lZGlhID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgc3AgPSBsaW5lLmluZGV4T2YoJyAnKTtcbiAgdmFyIHBhcnRzID0ge1xuICAgIHNzcmM6IHBhcnNlSW50KGxpbmUuc3Vic3RyKDcsIHNwIC0gNyksIDEwKVxuICB9O1xuICB2YXIgY29sb24gPSBsaW5lLmluZGV4T2YoJzonLCBzcCk7XG4gIGlmIChjb2xvbiA+IC0xKSB7XG4gICAgcGFydHMuYXR0cmlidXRlID0gbGluZS5zdWJzdHIoc3AgKyAxLCBjb2xvbiAtIHNwIC0gMSk7XG4gICAgcGFydHMudmFsdWUgPSBsaW5lLnN1YnN0cihjb2xvbiArIDEpO1xuICB9IGVsc2Uge1xuICAgIHBhcnRzLmF0dHJpYnV0ZSA9IGxpbmUuc3Vic3RyKHNwICsgMSk7XG4gIH1cbiAgcmV0dXJuIHBhcnRzO1xufTtcblxuLy8gRXh0cmFjdHMgRFRMUyBwYXJhbWV0ZXJzIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBmaW5nZXJwcmludCBsaW5lIGFzIGlucHV0LiBTZWUgYWxzbyBnZXRJY2VQYXJhbWV0ZXJzLlxuU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgLy8gU2VhcmNoIGluIHNlc3Npb24gcGFydCwgdG9vLlxuICBsaW5lcyA9IGxpbmVzLmNvbmNhdChTRFBVdGlscy5zcGxpdExpbmVzKHNlc3Npb25wYXJ0KSk7XG4gIHZhciBmcExpbmUgPSBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9ZmluZ2VycHJpbnQ6JykgPT09IDA7XG4gIH0pWzBdLnN1YnN0cigxNCk7XG4gIC8vIE5vdGU6IGE9c2V0dXAgbGluZSBpcyBpZ25vcmVkIHNpbmNlIHdlIHVzZSB0aGUgJ2F1dG8nIHJvbGUuXG4gIHZhciBkdGxzUGFyYW1ldGVycyA9IHtcbiAgICByb2xlOiAnYXV0bycsXG4gICAgZmluZ2VycHJpbnRzOiBbe1xuICAgICAgYWxnb3JpdGhtOiBmcExpbmUuc3BsaXQoJyAnKVswXSxcbiAgICAgIHZhbHVlOiBmcExpbmUuc3BsaXQoJyAnKVsxXVxuICAgIH1dXG4gIH07XG4gIHJldHVybiBkdGxzUGFyYW1ldGVycztcbn07XG5cbi8vIFNlcmlhbGl6ZXMgRFRMUyBwYXJhbWV0ZXJzIHRvIFNEUC5cblNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMsIHNldHVwVHlwZSkge1xuICB2YXIgc2RwID0gJ2E9c2V0dXA6JyArIHNldHVwVHlwZSArICdcXHJcXG4nO1xuICBwYXJhbXMuZmluZ2VycHJpbnRzLmZvckVhY2goZnVuY3Rpb24oZnApIHtcbiAgICBzZHAgKz0gJ2E9ZmluZ2VycHJpbnQ6JyArIGZwLmFsZ29yaXRobSArICcgJyArIGZwLnZhbHVlICsgJ1xcclxcbic7XG4gIH0pO1xuICByZXR1cm4gc2RwO1xufTtcbi8vIFBhcnNlcyBJQ0UgaW5mb3JtYXRpb24gZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxuLy8gICBnZXQgdGhlIGljZS11ZnJhZyBhbmQgaWNlLXB3ZCBsaW5lcyBhcyBpbnB1dC5cblNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgLy8gU2VhcmNoIGluIHNlc3Npb24gcGFydCwgdG9vLlxuICBsaW5lcyA9IGxpbmVzLmNvbmNhdChTRFBVdGlscy5zcGxpdExpbmVzKHNlc3Npb25wYXJ0KSk7XG4gIHZhciBpY2VQYXJhbWV0ZXJzID0ge1xuICAgIHVzZXJuYW1lRnJhZ21lbnQ6IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWljZS11ZnJhZzonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTIpLFxuICAgIHBhc3N3b3JkOiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtcHdkOicpID09PSAwO1xuICAgIH0pWzBdLnN1YnN0cigxMClcbiAgfTtcbiAgcmV0dXJuIGljZVBhcmFtZXRlcnM7XG59O1xuXG4vLyBTZXJpYWxpemVzIElDRSBwYXJhbWV0ZXJzIHRvIFNEUC5cblNEUFV0aWxzLndyaXRlSWNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICByZXR1cm4gJ2E9aWNlLXVmcmFnOicgKyBwYXJhbXMudXNlcm5hbWVGcmFnbWVudCArICdcXHJcXG4nICtcbiAgICAgICdhPWljZS1wd2Q6JyArIHBhcmFtcy5wYXNzd29yZCArICdcXHJcXG4nO1xufTtcblxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBSVENSdHBQYXJhbWV0ZXJzLlxuU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBkZXNjcmlwdGlvbiA9IHtcbiAgICBjb2RlY3M6IFtdLFxuICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxuICAgIGZlY01lY2hhbmlzbXM6IFtdLFxuICAgIHJ0Y3A6IFtdXG4gIH07XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIG1saW5lID0gbGluZXNbMF0uc3BsaXQoJyAnKTtcbiAgZm9yICh2YXIgaSA9IDM7IGkgPCBtbGluZS5sZW5ndGg7IGkrKykgeyAvLyBmaW5kIGFsbCBjb2RlY3MgZnJvbSBtbGluZVszLi5dXG4gICAgdmFyIHB0ID0gbWxpbmVbaV07XG4gICAgdmFyIHJ0cG1hcGxpbmUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1ydHBtYXA6JyArIHB0ICsgJyAnKVswXTtcbiAgICBpZiAocnRwbWFwbGluZSkge1xuICAgICAgdmFyIGNvZGVjID0gU0RQVXRpbHMucGFyc2VSdHBNYXAocnRwbWFwbGluZSk7XG4gICAgICB2YXIgZm10cHMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgICBtZWRpYVNlY3Rpb24sICdhPWZtdHA6JyArIHB0ICsgJyAnKTtcbiAgICAgIC8vIE9ubHkgdGhlIGZpcnN0IGE9Zm10cDo8cHQ+IGlzIGNvbnNpZGVyZWQuXG4gICAgICBjb2RlYy5wYXJhbWV0ZXJzID0gZm10cHMubGVuZ3RoID8gU0RQVXRpbHMucGFyc2VGbXRwKGZtdHBzWzBdKSA6IHt9O1xuICAgICAgY29kZWMucnRjcEZlZWRiYWNrID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1ydGNwLWZiOicgKyBwdCArICcgJylcbiAgICAgICAgLm1hcChTRFBVdGlscy5wYXJzZVJ0Y3BGYik7XG4gICAgICBkZXNjcmlwdGlvbi5jb2RlY3MucHVzaChjb2RlYyk7XG4gICAgICAvLyBwYXJzZSBGRUMgbWVjaGFuaXNtcyBmcm9tIHJ0cG1hcCBsaW5lcy5cbiAgICAgIHN3aXRjaCAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ1JFRCc6XG4gICAgICAgIGNhc2UgJ1VMUEZFQyc6XG4gICAgICAgICAgZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5wdXNoKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IC8vIG9ubHkgUkVEIGFuZCBVTFBGRUMgYXJlIHJlY29nbml6ZWQgYXMgRkVDIG1lY2hhbmlzbXMuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9ZXh0bWFwOicpLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgIGRlc2NyaXB0aW9uLmhlYWRlckV4dGVuc2lvbnMucHVzaChTRFBVdGlscy5wYXJzZUV4dG1hcChsaW5lKSk7XG4gIH0pO1xuICAvLyBGSVhNRTogcGFyc2UgcnRjcC5cbiAgcmV0dXJuIGRlc2NyaXB0aW9uO1xufTtcblxuLy8gR2VuZXJhdGVzIHBhcnRzIG9mIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBkZXNjcmliaW5nIHRoZSBjYXBhYmlsaXRpZXMgL1xuLy8gcGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24gPSBmdW5jdGlvbihraW5kLCBjYXBzKSB7XG4gIHZhciBzZHAgPSAnJztcblxuICAvLyBCdWlsZCB0aGUgbWxpbmUuXG4gIHNkcCArPSAnbT0nICsga2luZCArICcgJztcbiAgc2RwICs9IGNhcHMuY29kZWNzLmxlbmd0aCA+IDAgPyAnOScgOiAnMCc7IC8vIHJlamVjdCBpZiBubyBjb2RlY3MuXG4gIHNkcCArPSAnIFVEUC9UTFMvUlRQL1NBVlBGICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5tYXAoZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICAgIH1cbiAgICByZXR1cm4gY29kZWMucGF5bG9hZFR5cGU7XG4gIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuXG4gIHNkcCArPSAnYz1JTiBJUDQgMC4wLjAuMFxcclxcbic7XG4gIHNkcCArPSAnYT1ydGNwOjkgSU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuXG4gIC8vIEFkZCBhPXJ0cG1hcCBsaW5lcyBmb3IgZWFjaCBjb2RlYy4gQWxzbyBmbXRwIGFuZCBydGNwLWZiLlxuICBjYXBzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRwTWFwKGNvZGVjKTtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVGbXRwKGNvZGVjKTtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVSdGNwRmIoY29kZWMpO1xuICB9KTtcbiAgLy8gRklYTUU6IGFkZCBoZWFkZXJFeHRlbnNpb25zLCBmZWNNZWNoYW5pc23FnyBhbmQgcnRjcC5cbiAgc2RwICs9ICdhPXJ0Y3AtbXV4XFxyXFxuJztcbiAgcmV0dXJuIHNkcDtcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgYW4gYXJyYXkgb2Zcbi8vIFJUQ1J0cEVuY29kaW5nUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBlbmNvZGluZ1BhcmFtZXRlcnMgPSBbXTtcbiAgdmFyIGRlc2NyaXB0aW9uID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBoYXNSZWQgPSBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLmluZGV4T2YoJ1JFRCcpICE9PSAtMTtcbiAgdmFyIGhhc1VscGZlYyA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignVUxQRkVDJykgIT09IC0xO1xuXG4gIC8vIGZpbHRlciBhPXNzcmM6Li4uIGNuYW1lOiwgaWdub3JlIFBsYW5CLW1zaWRcbiAgdmFyIHNzcmNzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgfSlcbiAgLmZpbHRlcihmdW5jdGlvbihwYXJ0cykge1xuICAgIHJldHVybiBwYXJ0cy5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gIH0pO1xuICB2YXIgcHJpbWFyeVNzcmMgPSBzc3Jjcy5sZW5ndGggPiAwICYmIHNzcmNzWzBdLnNzcmM7XG4gIHZhciBzZWNvbmRhcnlTc3JjO1xuXG4gIHZhciBmbG93cyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYy1ncm91cDpGSUQnKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgcGFydHMuc2hpZnQoKTtcbiAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChwYXJ0LCAxMCk7XG4gICAgfSk7XG4gIH0pO1xuICBpZiAoZmxvd3MubGVuZ3RoID4gMCAmJiBmbG93c1swXS5sZW5ndGggPiAxICYmIGZsb3dzWzBdWzBdID09PSBwcmltYXJ5U3NyYykge1xuICAgIHNlY29uZGFyeVNzcmMgPSBmbG93c1swXVsxXTtcbiAgfVxuXG4gIGRlc2NyaXB0aW9uLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1JUWCcgJiYgY29kZWMucGFyYW1ldGVycy5hcHQpIHtcbiAgICAgIHZhciBlbmNQYXJhbSA9IHtcbiAgICAgICAgc3NyYzogcHJpbWFyeVNzcmMsXG4gICAgICAgIGNvZGVjUGF5bG9hZFR5cGU6IHBhcnNlSW50KGNvZGVjLnBhcmFtZXRlcnMuYXB0LCAxMCksXG4gICAgICAgIHJ0eDoge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmNcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKGVuY1BhcmFtKTtcbiAgICAgIGlmIChoYXNSZWQpIHtcbiAgICAgICAgZW5jUGFyYW0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVuY1BhcmFtKSk7XG4gICAgICAgIGVuY1BhcmFtLmZlYyA9IHtcbiAgICAgICAgICBzc3JjOiBzZWNvbmRhcnlTc3JjLFxuICAgICAgICAgIG1lY2hhbmlzbTogaGFzVWxwZmVjID8gJ3JlZCt1bHBmZWMnIDogJ3JlZCdcbiAgICAgICAgfTtcbiAgICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChlbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoID09PSAwICYmIHByaW1hcnlTc3JjKSB7XG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgc3NyYzogcHJpbWFyeVNzcmNcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHdlIHN1cHBvcnQgYm90aCBiPUFTIGFuZCBiPVRJQVMgYnV0IGludGVycHJldCBBUyBhcyBUSUFTLlxuICB2YXIgYmFuZHdpZHRoID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYj0nKTtcbiAgaWYgKGJhbmR3aWR0aC5sZW5ndGgpIHtcbiAgICBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9VElBUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig3KSwgMTApO1xuICAgIH0gZWxzZSBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9QVM6JykgPT09IDApIHtcbiAgICAgIGJhbmR3aWR0aCA9IHBhcnNlSW50KGJhbmR3aWR0aFswXS5zdWJzdHIoNSksIDEwKTtcbiAgICB9XG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICBwYXJhbXMubWF4Qml0cmF0ZSA9IGJhbmR3aWR0aDtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZW5jb2RpbmdQYXJhbWV0ZXJzO1xufTtcblxuU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gRklYTUU6IHNlc3MtaWQgc2hvdWxkIGJlIGFuIE5UUCB0aW1lc3RhbXAuXG4gIHJldHVybiAndj0wXFxyXFxuJyArXG4gICAgICAnbz10aGlzaXNhZGFwdGVyb3J0YyA4MTY5NjM5OTE1NjQ2OTQzMTM3IDIgSU4gSVA0IDEyNy4wLjAuMVxcclxcbicgK1xuICAgICAgJ3M9LVxcclxcbicgK1xuICAgICAgJ3Q9MCAwXFxyXFxuJztcbn07XG5cblNEUFV0aWxzLndyaXRlTWVkaWFTZWN0aW9uID0gZnVuY3Rpb24odHJhbnNjZWl2ZXIsIGNhcHMsIHR5cGUsIHN0cmVhbSkge1xuICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVSdHBEZXNjcmlwdGlvbih0cmFuc2NlaXZlci5raW5kLCBjYXBzKTtcblxuICAvLyBNYXAgSUNFIHBhcmFtZXRlcnMgKHVmcmFnLCBwd2QpIHRvIFNEUC5cbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlSWNlUGFyYW1ldGVycyhcbiAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmdldExvY2FsUGFyYW1ldGVycygpKTtcblxuICAvLyBNYXAgRFRMUyBwYXJhbWV0ZXJzIHRvIFNEUC5cbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMoXG4gICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LmdldExvY2FsUGFyYW1ldGVycygpLFxuICAgICAgdHlwZSA9PT0gJ29mZmVyJyA/ICdhY3RwYXNzJyA6ICdhY3RpdmUnKTtcblxuICBzZHAgKz0gJ2E9bWlkOicgKyB0cmFuc2NlaXZlci5taWQgKyAnXFxyXFxuJztcblxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgc2RwICs9ICdhPXNlbmRyZWN2XFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZG9ubHlcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgc2RwICs9ICdhPXJlY3Zvbmx5XFxyXFxuJztcbiAgfSBlbHNlIHtcbiAgICBzZHAgKz0gJ2E9aW5hY3RpdmVcXHJcXG4nO1xuICB9XG5cbiAgLy8gRklYTUU6IGZvciBSVFggdGhlcmUgbWlnaHQgYmUgbXVsdGlwbGUgU1NSQ3MuIE5vdCBpbXBsZW1lbnRlZCBpbiBFZGdlIHlldC5cbiAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIHZhciBtc2lkID0gJ21zaWQ6JyArIHN0cmVhbS5pZCArICcgJyArXG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci50cmFjay5pZCArICdcXHJcXG4nO1xuICAgIHNkcCArPSAnYT0nICsgbXNpZDtcbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcbiAgICAgICAgJyAnICsgbXNpZDtcbiAgfVxuICAvLyBGSVhNRTogdGhpcyBzaG91bGQgYmUgd3JpdHRlbiBieSB3cml0ZVJ0cERlc2NyaXB0aW9uLlxuICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcbiAgICAgICcgY25hbWU6JyArIFNEUFV0aWxzLmxvY2FsQ05hbWUgKyAnXFxyXFxuJztcbiAgcmV0dXJuIHNkcDtcbn07XG5cbi8vIEdldHMgdGhlIGRpcmVjdGlvbiBmcm9tIHRoZSBtZWRpYVNlY3Rpb24gb3IgdGhlIHNlc3Npb25wYXJ0LlxuU0RQVXRpbHMuZ2V0RGlyZWN0aW9uID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICAvLyBMb29rIGZvciBzZW5kcmVjdiwgc2VuZG9ubHksIHJlY3Zvbmx5LCBpbmFjdGl2ZSwgZGVmYXVsdCB0byBzZW5kcmVjdi5cbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc3dpdGNoIChsaW5lc1tpXSkge1xuICAgICAgY2FzZSAnYT1zZW5kcmVjdic6XG4gICAgICBjYXNlICdhPXNlbmRvbmx5JzpcbiAgICAgIGNhc2UgJ2E9cmVjdm9ubHknOlxuICAgICAgY2FzZSAnYT1pbmFjdGl2ZSc6XG4gICAgICAgIHJldHVybiBsaW5lc1tpXS5zdWJzdHIoMik7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBGSVhNRTogV2hhdCBzaG91bGQgaGFwcGVuIGhlcmU/XG4gICAgfVxuICB9XG4gIGlmIChzZXNzaW9ucGFydCkge1xuICAgIHJldHVybiBTRFBVdGlscy5nZXREaXJlY3Rpb24oc2Vzc2lvbnBhcnQpO1xuICB9XG4gIHJldHVybiAnc2VuZHJlY3YnO1xufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBTRFBVdGlscztcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU0RQVXRpbHMgPSByZXF1aXJlKCcuL2VkZ2Vfc2RwJyk7XG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzJykubG9nO1xuXG52YXIgZWRnZVNoaW0gPSB7XG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHdpbmRvdy5SVENJY2VHYXRoZXJlcikge1xuICAgICAgLy8gT1JUQyBkZWZpbmVzIGFuIFJUQ0ljZUNhbmRpZGF0ZSBvYmplY3QgYnV0IG5vIGNvbnN0cnVjdG9yLlxuICAgICAgLy8gTm90IGltcGxlbWVudGVkIGluIEVkZ2UuXG4gICAgICBpZiAoIXdpbmRvdy5SVENJY2VDYW5kaWRhdGUpIHtcbiAgICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gYXJncztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIE9SVEMgZG9lcyBub3QgaGF2ZSBhIHNlc3Npb24gZGVzY3JpcHRpb24gb2JqZWN0IGJ1dFxuICAgICAgLy8gb3RoZXIgYnJvd3NlcnMgKGkuZS4gQ2hyb21lKSB0aGF0IHdpbGwgc3VwcG9ydCBib3RoIFBDIGFuZCBPUlRDXG4gICAgICAvLyBpbiB0aGUgZnV0dXJlIG1pZ2h0IGhhdmUgdGhpcyBkZWZpbmVkIGFscmVhZHkuXG4gICAgICBpZiAoIXdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24pIHtcbiAgICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gYXJncztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIF9ldmVudFRhcmdldCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgIFsnYWRkRXZlbnRMaXN0ZW5lcicsICdyZW1vdmVFdmVudExpc3RlbmVyJywgJ2Rpc3BhdGNoRXZlbnQnXVxuICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgc2VsZlttZXRob2RdID0gX2V2ZW50VGFyZ2V0W21ldGhvZF0uYmluZChfZXZlbnRUYXJnZXQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9uaWNlY2FuZGlkYXRlID0gbnVsbDtcbiAgICAgIHRoaXMub25hZGRzdHJlYW0gPSBudWxsO1xuICAgICAgdGhpcy5vbnRyYWNrID0gbnVsbDtcbiAgICAgIHRoaXMub25yZW1vdmVzdHJlYW0gPSBudWxsO1xuICAgICAgdGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkID0gbnVsbDtcbiAgICAgIHRoaXMub25kYXRhY2hhbm5lbCA9IG51bGw7XG5cbiAgICAgIHRoaXMubG9jYWxTdHJlYW1zID0gW107XG4gICAgICB0aGlzLnJlbW90ZVN0cmVhbXMgPSBbXTtcbiAgICAgIHRoaXMuZ2V0TG9jYWxTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmLmxvY2FsU3RyZWFtcztcbiAgICAgIH07XG4gICAgICB0aGlzLmdldFJlbW90ZVN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYucmVtb3RlU3RyZWFtcztcbiAgICAgIH07XG5cbiAgICAgIHRoaXMubG9jYWxEZXNjcmlwdGlvbiA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgc2RwOiAnJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICcnLFxuICAgICAgICBzZHA6ICcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2lnbmFsaW5nU3RhdGUgPSAnc3RhYmxlJztcbiAgICAgIHRoaXMuaWNlQ29ubmVjdGlvblN0YXRlID0gJ25ldyc7XG4gICAgICB0aGlzLmljZUdhdGhlcmluZ1N0YXRlID0gJ25ldyc7XG5cbiAgICAgIHRoaXMuaWNlT3B0aW9ucyA9IHtcbiAgICAgICAgZ2F0aGVyUG9saWN5OiAnYWxsJyxcbiAgICAgICAgaWNlU2VydmVyczogW11cbiAgICAgIH07XG4gICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgc3dpdGNoIChjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgICAgY2FzZSAnYWxsJzpcbiAgICAgICAgICBjYXNlICdyZWxheSc6XG4gICAgICAgICAgICB0aGlzLmljZU9wdGlvbnMuZ2F0aGVyUG9saWN5ID0gY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICAgICAgLy8gRklYTUU6IHJlbW92ZSBvbmNlIGltcGxlbWVudGF0aW9uIGFuZCBzcGVjIGhhdmUgYWRkZWQgdGhpcy5cbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ljZVRyYW5zcG9ydFBvbGljeSBcIm5vbmVcIiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIGRvbid0IHNldCBpY2VUcmFuc3BvcnRQb2xpY3kuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuaWNlU2VydmVycykge1xuICAgICAgICAvLyBFZGdlIGRvZXMgbm90IGxpa2VcbiAgICAgICAgLy8gMSkgc3R1bjpcbiAgICAgICAgLy8gMikgdHVybjogdGhhdCBkb2VzIG5vdCBoYXZlIGFsbCBvZiB0dXJuOmhvc3Q6cG9ydD90cmFuc3BvcnQ9dWRwXG4gICAgICAgIHRoaXMuaWNlT3B0aW9ucy5pY2VTZXJ2ZXJzID0gY29uZmlnLmljZVNlcnZlcnMuZmlsdGVyKGZ1bmN0aW9uKHNlcnZlcikge1xuICAgICAgICAgIGlmIChzZXJ2ZXIgJiYgc2VydmVyLnVybHMpIHtcbiAgICAgICAgICAgIHNlcnZlci51cmxzID0gc2VydmVyLnVybHMuZmlsdGVyKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICByZXR1cm4gdXJsLmluZGV4T2YoJ3R1cm46JykgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgIHVybC5pbmRleE9mKCd0cmFuc3BvcnQ9dWRwJykgIT09IC0xO1xuICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICByZXR1cm4gISFzZXJ2ZXIudXJscztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gcGVyLXRyYWNrIGljZUdhdGhlcnMsIGljZVRyYW5zcG9ydHMsIGR0bHNUcmFuc3BvcnRzLCBydHBTZW5kZXJzLCAuLi5cbiAgICAgIC8vIGV2ZXJ5dGhpbmcgdGhhdCBpcyBuZWVkZWQgdG8gZGVzY3JpYmUgYSBTRFAgbS1saW5lLlxuICAgICAgdGhpcy50cmFuc2NlaXZlcnMgPSBbXTtcblxuICAgICAgLy8gc2luY2UgdGhlIGljZUdhdGhlcmVyIGlzIGN1cnJlbnRseSBjcmVhdGVkIGluIGNyZWF0ZU9mZmVyIGJ1dCB3ZVxuICAgICAgLy8gbXVzdCBub3QgZW1pdCBjYW5kaWRhdGVzIHVudGlsIGFmdGVyIHNldExvY2FsRGVzY3JpcHRpb24gd2UgYnVmZmVyXG4gICAgICAvLyB0aGVtIGluIHRoaXMgYXJyYXkuXG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIgPSBbXTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgIC8vIEZJWE1FOiBuZWVkIHRvIGFwcGx5IGljZSBjYW5kaWRhdGVzIGluIGEgd2F5IHdoaWNoIGlzIGFzeW5jIGJ1dFxuICAgICAgLy8gaW4tb3JkZXJcbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBlbmQgPSAhZXZlbnQuY2FuZGlkYXRlIHx8IE9iamVjdC5rZXlzKGV2ZW50LmNhbmRpZGF0ZSkubGVuZ3RoID09PSAwO1xuICAgICAgICBpZiAoZW5kKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBzZWN0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHNlY3Rpb25zW2pdLmluZGV4T2YoJ1xcclxcbmE9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgc2VjdGlvbnNbal0gKz0gJ2E9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlLmluZGV4T2YoJ3R5cCBlbmRPZkNhbmRpZGF0ZXMnKVxuICAgICAgICAgICAgPT09IC0xKSB7XG4gICAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXggKyAxXSArPVxuICAgICAgICAgICAgICAnYT0nICsgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSArICdcXHJcXG4nO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYubG9jYWxEZXNjcmlwdGlvbi5zZHAgPSBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICBzZWxmLm9uaWNlY2FuZGlkYXRlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWV2ZW50LmNhbmRpZGF0ZSAmJiBzZWxmLmljZUdhdGhlcmluZ1N0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgdmFyIGNvbXBsZXRlID0gc2VsZi50cmFuc2NlaXZlcnMuZXZlcnkoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5pY2VHYXRoZXJlciAmJlxuICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLnN0YXRlID09PSAnY29tcGxldGVkJztcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnY29tcGxldGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIgPSBbXTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIC8vIENsb25lIGlzIG5lY2Vzc2FyeSBmb3IgbG9jYWwgZGVtb3MgbW9zdGx5LCBhdHRhY2hpbmcgZGlyZWN0bHlcbiAgICAgIC8vIHRvIHR3byBkaWZmZXJlbnQgc2VuZGVycyBkb2VzIG5vdCB3b3JrIChidWlsZCAxMDU0NykuXG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcy5wdXNoKHN0cmVhbS5jbG9uZSgpKTtcbiAgICAgIHRoaXMuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkKCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICB2YXIgaWR4ID0gdGhpcy5sb2NhbFN0cmVhbXMuaW5kZXhPZihzdHJlYW0pO1xuICAgICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmVzIHRoZSBpbnRlcnNlY3Rpb24gb2YgbG9jYWwgYW5kIHJlbW90ZSBjYXBhYmlsaXRpZXMuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzID1cbiAgICAgICAgZnVuY3Rpb24obG9jYWxDYXBhYmlsaXRpZXMsIHJlbW90ZUNhcGFiaWxpdGllcykge1xuICAgICAgICAgIHZhciBjb21tb25DYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgICAgICBjb2RlY3M6IFtdLFxuICAgICAgICAgICAgaGVhZGVyRXh0ZW5zaW9uczogW10sXG4gICAgICAgICAgICBmZWNNZWNoYW5pc21zOiBbXVxuICAgICAgICAgIH07XG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24obENvZGVjKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHJDb2RlYyA9IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3NbaV07XG4gICAgICAgICAgICAgIGlmIChsQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpID09PSByQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpICYmXG4gICAgICAgICAgICAgICAgICBsQ29kZWMuY2xvY2tSYXRlID09PSByQ29kZWMuY2xvY2tSYXRlICYmXG4gICAgICAgICAgICAgICAgICBsQ29kZWMubnVtQ2hhbm5lbHMgPT09IHJDb2RlYy5udW1DaGFubmVscykge1xuICAgICAgICAgICAgICAgIC8vIHB1c2ggckNvZGVjIHNvIHdlIHJlcGx5IHdpdGggb2ZmZXJlciBwYXlsb2FkIHR5cGVcbiAgICAgICAgICAgICAgICBjb21tb25DYXBhYmlsaXRpZXMuY29kZWNzLnB1c2gockNvZGVjKTtcblxuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBhbHNvIG5lZWQgdG8gZGV0ZXJtaW5lIGludGVyc2VjdGlvbiBiZXR3ZWVuXG4gICAgICAgICAgICAgICAgLy8gLnJ0Y3BGZWVkYmFjayBhbmQgLnBhcmFtZXRlcnNcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihsSGVhZGVyRXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICBpKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBySGVhZGVyRXh0ZW5zaW9uID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICAgICAgICBpZiAobEhlYWRlckV4dGVuc2lvbi51cmkgPT09IHJIZWFkZXJFeHRlbnNpb24udXJpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLnB1c2gockhlYWRlckV4dGVuc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBGSVhNRTogZmVjTWVjaGFuaXNtc1xuICAgICAgICAgIHJldHVybiBjb21tb25DYXBhYmlsaXRpZXM7XG4gICAgICAgIH07XG5cbiAgICAvLyBDcmVhdGUgSUNFIGdhdGhlcmVyLCBJQ0UgdHJhbnNwb3J0IGFuZCBEVExTIHRyYW5zcG9ydC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyA9XG4gICAgICAgIGZ1bmN0aW9uKG1pZCwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSBuZXcgUlRDSWNlR2F0aGVyZXIoc2VsZi5pY2VPcHRpb25zKTtcbiAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0ID0gbmV3IFJUQ0ljZVRyYW5zcG9ydChpY2VHYXRoZXJlcik7XG4gICAgICAgICAgaWNlR2F0aGVyZXIub25sb2NhbGNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKTtcbiAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZSA9IHtzZHBNaWQ6IG1pZCwgc2RwTUxpbmVJbmRleDogc2RwTUxpbmVJbmRleH07XG5cbiAgICAgICAgICAgIHZhciBjYW5kID0gZXZ0LmNhbmRpZGF0ZTtcbiAgICAgICAgICAgIHZhciBlbmQgPSAhY2FuZCB8fCBPYmplY3Qua2V5cyhjYW5kKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICAvLyBFZGdlIGVtaXRzIGFuIGVtcHR5IG9iamVjdCBmb3IgUlRDSWNlQ2FuZGlkYXRlQ29tcGxldGXigKVcbiAgICAgICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICAgICAgLy8gcG9seWZpbGwgc2luY2UgUlRDSWNlR2F0aGVyZXIuc3RhdGUgaXMgbm90IGltcGxlbWVudGVkIGluXG4gICAgICAgICAgICAgIC8vIEVkZ2UgMTA1NDcgeWV0LlxuICAgICAgICAgICAgICBpZiAoaWNlR2F0aGVyZXIuc3RhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyLnN0YXRlID0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBFbWl0IGEgY2FuZGlkYXRlIHdpdGggdHlwZSBlbmRPZkNhbmRpZGF0ZXMgdG8gbWFrZSB0aGUgc2FtcGxlc1xuICAgICAgICAgICAgICAvLyB3b3JrLiBFZGdlIHJlcXVpcmVzIGFkZEljZUNhbmRpZGF0ZSB3aXRoIHRoaXMgZW1wdHkgY2FuZGlkYXRlXG4gICAgICAgICAgICAgIC8vIHRvIHN0YXJ0IGNoZWNraW5nLiBUaGUgcmVhbCBzb2x1dGlvbiBpcyB0byBzaWduYWxcbiAgICAgICAgICAgICAgLy8gZW5kLW9mLWNhbmRpZGF0ZXMgdG8gdGhlIG90aGVyIHNpZGUgd2hlbiBnZXR0aW5nIHRoZSBudWxsXG4gICAgICAgICAgICAgIC8vIGNhbmRpZGF0ZSBidXQgc29tZSBhcHBzIChsaWtlIHRoZSBzYW1wbGVzKSBkb24ndCBkbyB0aGF0LlxuICAgICAgICAgICAgICBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlID1cbiAgICAgICAgICAgICAgICAgICdjYW5kaWRhdGU6MSAxIHVkcCAxIDAuMC4wLjAgOSB0eXAgZW5kT2ZDYW5kaWRhdGVzJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFJUQ0ljZUNhbmRpZGF0ZSBkb2Vzbid0IGhhdmUgYSBjb21wb25lbnQsIG5lZWRzIHRvIGJlIGFkZGVkXG4gICAgICAgICAgICAgIGNhbmQuY29tcG9uZW50ID0gaWNlVHJhbnNwb3J0LmNvbXBvbmVudCA9PT0gJ1JUQ1AnID8gMiA6IDE7XG4gICAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgPSBTRFBVdGlscy53cml0ZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNvbXBsZXRlID0gc2VsZi50cmFuc2NlaXZlcnMuZXZlcnkoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyICYmXG4gICAgICAgICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRW1pdCBjYW5kaWRhdGUgaWYgbG9jYWxEZXNjcmlwdGlvbiBpcyBzZXQuXG4gICAgICAgICAgICAvLyBBbHNvIGVtaXRzIG51bGwgY2FuZGlkYXRlIHdoZW4gYWxsIGdhdGhlcmVycyBhcmUgY29tcGxldGUuXG4gICAgICAgICAgICBzd2l0Y2ggKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUpIHtcbiAgICAgICAgICAgICAgY2FzZSAnbmV3JzpcbiAgICAgICAgICAgICAgICBzZWxmLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZCAmJiBjb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdnYXRoZXJpbmcnOlxuICAgICAgICAgICAgICAgIHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLm9uaWNlY2FuZGlkYXRlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uaWNlY2FuZGlkYXRlKG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdjb21wbGV0ZSc6XG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIG5vdCBoYXBwZW4uLi4gY3VycmVudGx5IVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OiAvLyBuby1vcC5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGljZVRyYW5zcG9ydC5vbmljZXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQgPSBuZXcgUlRDRHRsc1RyYW5zcG9ydChpY2VUcmFuc3BvcnQpO1xuICAgICAgICAgIGR0bHNUcmFuc3BvcnQub25kdGxzc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgZHRsc1RyYW5zcG9ydC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBvbmVycm9yIGRvZXMgbm90IHNldCBzdGF0ZSB0byBmYWlsZWQgYnkgaXRzZWxmLlxuICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGF0ZSA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpY2VHYXRoZXJlcjogaWNlR2F0aGVyZXIsXG4gICAgICAgICAgICBpY2VUcmFuc3BvcnQ6IGljZVRyYW5zcG9ydCxcbiAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IGR0bHNUcmFuc3BvcnRcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgLy8gU3RhcnQgdGhlIFJUUCBTZW5kZXIgYW5kIFJlY2VpdmVyIGZvciBhIHRyYW5zY2VpdmVyLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3RyYW5zY2VpdmUgPSBmdW5jdGlvbih0cmFuc2NlaXZlcixcbiAgICAgICAgc2VuZCwgcmVjdikge1xuICAgICAgdmFyIHBhcmFtcyA9IHRoaXMuX2dldENvbW1vbkNhcGFiaWxpdGllcyh0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xuICAgICAgaWYgKHNlbmQgJiYgdHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICBwYXJhbXMucnRjcCA9IHtcbiAgICAgICAgICBjbmFtZTogU0RQVXRpbHMubG9jYWxDTmFtZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbXMucnRjcC5zc3JjID0gdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zZW5kKHBhcmFtcyk7XG4gICAgICB9XG4gICAgICBpZiAocmVjdiAmJiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgICAgICBwYXJhbXMuZW5jb2RpbmdzID0gdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgcGFyYW1zLnJ0Y3AgPSB7XG4gICAgICAgICAgY25hbWU6IHRyYW5zY2VpdmVyLmNuYW1lXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHBhcmFtcy5ydGNwLnNzcmMgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmM7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIucmVjZWl2ZShwYXJhbXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldExvY2FsRGVzY3JpcHRpb24gPVxuICAgICAgICBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICB2YXIgc2VjdGlvbnM7XG4gICAgICAgICAgdmFyIHNlc3Npb25wYXJ0O1xuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInKSB7XG4gICAgICAgICAgICAvLyBGSVhNRTogV2hhdCB3YXMgdGhlIHB1cnBvc2Ugb2YgdGhpcyBlbXB0eSBpZiBzdGF0ZW1lbnQ/XG4gICAgICAgICAgICAvLyBpZiAoIXRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgICAgICAgLy8gVkVSWSBsaW1pdGVkIHN1cHBvcnQgZm9yIFNEUCBtdW5naW5nLiBMaW1pdGVkIHRvOlxuICAgICAgICAgICAgICAvLyAqIGNoYW5naW5nIHRoZSBvcmRlciBvZiBjb2RlY3NcbiAgICAgICAgICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKGRlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FwcyA9IFNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgICAgIHNlbGYuX3BlbmRpbmdPZmZlcltzZHBNTGluZUluZGV4XS5sb2NhbENhcGFiaWxpdGllcyA9IGNhcHM7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB0aGlzLnRyYW5zY2VpdmVycyA9IHRoaXMuX3BlbmRpbmdPZmZlcjtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3BlbmRpbmdPZmZlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdhbnN3ZXInKSB7XG4gICAgICAgICAgICBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoc2VsZi5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgICAgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgICAgICAgIHZhciBpY2VHYXRoZXJlciA9IHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyO1xuICAgICAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzO1xuICAgICAgICAgICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzO1xuICAgICAgICAgICAgICB2YXIgcmVqZWN0ZWQgPSBtZWRpYVNlY3Rpb24uc3BsaXQoJ1xcbicsIDEpWzBdXG4gICAgICAgICAgICAgICAgICAuc3BsaXQoJyAnLCAyKVsxXSA9PT0gJzAnO1xuXG4gICAgICAgICAgICAgIGlmICghcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3RlSWNlUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMoXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zdGFydChpY2VHYXRoZXJlciwgcmVtb3RlSWNlUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRyb2xsZWQnKTtcblxuICAgICAgICAgICAgICAgIHZhciByZW1vdGVEdGxzUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzKFxuICAgICAgICAgICAgICAgICAgICBtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXJ0KHJlbW90ZUR0bHNQYXJhbWV0ZXJzKTtcblxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBzZWxmLl9nZXRDb21tb25DYXBhYmlsaXRpZXMobG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcyk7XG5cbiAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgUlRDUnRwU2VuZGVyLiBUaGUgUlRDUnRwUmVjZWl2ZXIgZm9yIHRoaXNcbiAgICAgICAgICAgICAgICAvLyB0cmFuc2NlaXZlciBoYXMgYWxyZWFkeSBiZWVuIHN0YXJ0ZWQgaW4gc2V0UmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZSh0cmFuc2NlaXZlcixcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNvZGVjcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubG9jYWxEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnR5cGUsXG4gICAgICAgICAgICBzZHA6IGRlc2NyaXB0aW9uLnNkcFxuICAgICAgICAgIH07XG4gICAgICAgICAgc3dpdGNoIChkZXNjcmlwdGlvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdvZmZlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdoYXZlLWxvY2FsLW9mZmVyJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5zd2VyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ3N0YWJsZScpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Vuc3VwcG9ydGVkIHR5cGUgXCInICsgZGVzY3JpcHRpb24udHlwZSArXG4gICAgICAgICAgICAgICAgICAnXCInKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiBhIHN1Y2Nlc3MgY2FsbGJhY2sgd2FzIHByb3ZpZGVkLCBlbWl0IElDRSBjYW5kaWRhdGVzIGFmdGVyIGl0XG4gICAgICAgICAgLy8gaGFzIGJlZW4gZXhlY3V0ZWQuIE90aGVyd2lzZSwgZW1pdCBjYWxsYmFjayBhZnRlciB0aGUgUHJvbWlzZSBpc1xuICAgICAgICAgIC8vIHJlc29sdmVkLlxuICAgICAgICAgIHZhciBoYXNDYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgICB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nO1xuICAgICAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNiID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgIGlmIChzZWxmLmljZUdhdGhlcmluZ1N0YXRlID09PSAnbmV3Jykge1xuICAgICAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnZ2F0aGVyaW5nJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHAgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICBwLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWhhc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLmljZUdhdGhlcmluZ1N0YXRlID09PSAnbmV3Jykge1xuICAgICAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnZ2F0aGVyaW5nJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBVc3VhbGx5IGNhbmRpZGF0ZXMgd2lsbCBiZSBlbWl0dGVkIGVhcmxpZXIuXG4gICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMuYmluZChzZWxmKSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0UmVtb3RlRGVzY3JpcHRpb24gPVxuICAgICAgICBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICB2YXIgc3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgICAgdmFyIHJlY2VpdmVyTGlzdCA9IFtdO1xuICAgICAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoZGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICB2YXIgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICB2YXIgbWxpbmUgPSBsaW5lc1swXS5zdWJzdHIoMikuc3BsaXQoJyAnKTtcbiAgICAgICAgICAgIHZhciBraW5kID0gbWxpbmVbMF07XG4gICAgICAgICAgICB2YXIgcmVqZWN0ZWQgPSBtbGluZVsxXSA9PT0gJzAnO1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IFNEUFV0aWxzLmdldERpcmVjdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcblxuICAgICAgICAgICAgdmFyIHRyYW5zY2VpdmVyO1xuICAgICAgICAgICAgdmFyIGljZUdhdGhlcmVyO1xuICAgICAgICAgICAgdmFyIGljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgdmFyIHJ0cFNlbmRlcjtcbiAgICAgICAgICAgIHZhciBydHBSZWNlaXZlcjtcbiAgICAgICAgICAgIHZhciBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgIHZhciB0cmFjaztcbiAgICAgICAgICAgIC8vIEZJWE1FOiBlbnN1cmUgdGhlIG1lZGlhU2VjdGlvbiBoYXMgcnRjcC1tdXggc2V0LlxuICAgICAgICAgICAgdmFyIHJlbW90ZUNhcGFiaWxpdGllcyA9IFNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgdmFyIHJlbW90ZUljZVBhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnM7XG4gICAgICAgICAgICBpZiAoIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHJlbW90ZUljZVBhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgcmVtb3RlRHRsc1BhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzID1cbiAgICAgICAgICAgICAgICBTRFBVdGlscy5wYXJzZVJ0cEVuY29kaW5nUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuXG4gICAgICAgICAgICB2YXIgbWlkID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1taWQ6Jyk7XG4gICAgICAgICAgICBpZiAobWlkLmxlbmd0aCkge1xuICAgICAgICAgICAgICBtaWQgPSBtaWRbMF0uc3Vic3RyKDYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWlkID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjbmFtZTtcbiAgICAgICAgICAgIC8vIEdldHMgdGhlIGZpcnN0IFNTUkMuIE5vdGUgdGhhdCB3aXRoIFJUWCB0aGVyZSBtaWdodCBiZSBtdWx0aXBsZVxuICAgICAgICAgICAgLy8gU1NSQ3MuXG4gICAgICAgICAgICB2YXIgcmVtb3RlU3NyYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouYXR0cmlidXRlID09PSAnY25hbWUnO1xuICAgICAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKHJlbW90ZVNzcmMpIHtcbiAgICAgICAgICAgICAgY25hbWUgPSByZW1vdGVTc3JjLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaXNDb21wbGV0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAnYT1lbmQtb2YtY2FuZGlkYXRlcycpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB2YXIgY2FuZHMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWNhbmRpZGF0ZTonKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlKGNhbmQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gY2FuZC5jb21wb25lbnQgPT09ICcxJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInICYmICFyZWplY3RlZCkge1xuICAgICAgICAgICAgICB2YXIgdHJhbnNwb3J0cyA9IHNlbGYuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzKG1pZCxcbiAgICAgICAgICAgICAgICAgIHNkcE1MaW5lSW5kZXgpO1xuICAgICAgICAgICAgICBpZiAoaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMgPSBSVENSdHBSZWNlaXZlci5nZXRDYXBhYmlsaXRpZXMoa2luZCk7XG4gICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSBbe1xuICAgICAgICAgICAgICAgIHNzcmM6ICgyICogc2RwTUxpbmVJbmRleCArIDIpICogMTAwMVxuICAgICAgICAgICAgICB9XTtcblxuICAgICAgICAgICAgICBydHBSZWNlaXZlciA9IG5ldyBSVENSdHBSZWNlaXZlcih0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsIGtpbmQpO1xuXG4gICAgICAgICAgICAgIHRyYWNrID0gcnRwUmVjZWl2ZXIudHJhY2s7XG4gICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5wdXNoKFt0cmFjaywgcnRwUmVjZWl2ZXJdKTtcbiAgICAgICAgICAgICAgLy8gRklYTUU6IG5vdCBjb3JyZWN0IHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIHN0cmVhbXMgYnV0IHRoYXQgaXNcbiAgICAgICAgICAgICAgLy8gbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQgaW4gdGhpcyBzaGltLlxuICAgICAgICAgICAgICBzdHJlYW0uYWRkVHJhY2sodHJhY2spO1xuXG4gICAgICAgICAgICAgIC8vIEZJWE1FOiBsb29rIGF0IGRpcmVjdGlvbi5cbiAgICAgICAgICAgICAgaWYgKHNlbGYubG9jYWxTdHJlYW1zLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgIHNlbGYubG9jYWxTdHJlYW1zWzBdLmdldFRyYWNrcygpLmxlbmd0aCA+PSBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFjdHVhbGx5IG1vcmUgY29tcGxpY2F0ZWQsIG5lZWRzIHRvIG1hdGNoIHR5cGVzIGV0Y1xuICAgICAgICAgICAgICAgIHZhciBsb2NhbHRyYWNrID0gc2VsZi5sb2NhbFN0cmVhbXNbMF1cbiAgICAgICAgICAgICAgICAgICAgLmdldFRyYWNrcygpW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICAgICAgICAgIHJ0cFNlbmRlciA9IG5ldyBSVENSdHBTZW5kZXIobG9jYWx0cmFjayxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyOiB0cmFuc3BvcnRzLmljZUdhdGhlcmVyLFxuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydDogdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LFxuICAgICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzOiBsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM6IHJlbW90ZUNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICBydHBTZW5kZXI6IHJ0cFNlbmRlcixcbiAgICAgICAgICAgICAgICBydHBSZWNlaXZlcjogcnRwUmVjZWl2ZXIsXG4gICAgICAgICAgICAgICAga2luZDoga2luZCxcbiAgICAgICAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICAgICAgICBjbmFtZTogY25hbWUsXG4gICAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVyczogc2VuZEVuY29kaW5nUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzOiByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBSZWNlaXZlciBub3cuIFRoZSBSVFBTZW5kZXIgaXMgc3RhcnRlZCBpblxuICAgICAgICAgICAgICAvLyBzZXRMb2NhbERlc2NyaXB0aW9uLlxuICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLFxuICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHRyYW5zY2VpdmVyID0gc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgICAgICAgIGljZUdhdGhlcmVyID0gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICAgIGljZVRyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHJ0cFNlbmRlciA9IHRyYW5zY2VpdmVyLnJ0cFNlbmRlcjtcbiAgICAgICAgICAgICAgcnRwUmVjZWl2ZXIgPSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5yZW1vdGVDYXBhYmlsaXRpZXMgPVxuICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzO1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5jbmFtZSA9IGNuYW1lO1xuXG4gICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zdGFydChpY2VHYXRoZXJlciwgcmVtb3RlSWNlUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICdjb250cm9sbGluZycpO1xuICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXJ0KHJlbW90ZUR0bHNQYXJhbWV0ZXJzKTtcblxuICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3JlY3Zvbmx5JyxcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpO1xuXG4gICAgICAgICAgICAgIGlmIChydHBSZWNlaXZlciAmJlxuICAgICAgICAgICAgICAgICAgKGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpKSB7XG4gICAgICAgICAgICAgICAgdHJhY2sgPSBydHBSZWNlaXZlci50cmFjaztcbiAgICAgICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyXSk7XG4gICAgICAgICAgICAgICAgc3RyZWFtLmFkZFRyYWNrKHRyYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWN0dWFsbHkgdGhlIHJlY2VpdmVyIHNob3VsZCBiZSBjcmVhdGVkIGxhdGVyLlxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnR5cGUsXG4gICAgICAgICAgICBzZHA6IGRlc2NyaXB0aW9uLnNkcFxuICAgICAgICAgIH07XG4gICAgICAgICAgc3dpdGNoIChkZXNjcmlwdGlvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdvZmZlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdoYXZlLXJlbW90ZS1vZmZlcicpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdzdGFibGUnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICAgICAgICAgJ1wiJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdHJlYW0uZ2V0VHJhY2tzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxmLnJlbW90ZVN0cmVhbXMucHVzaChzdHJlYW0pO1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnYWRkc3RyZWFtJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbSA9IHN0cmVhbTtcbiAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgaWYgKHNlbGYub25hZGRzdHJlYW0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYub25hZGRzdHJlYW0oZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciB0cmFjayA9IGl0ZW1bMF07XG4gICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVyID0gaXRlbVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhY2tFdmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC5yZWNlaXZlciA9IHJlY2VpdmVyO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQuc3RyZWFtcyA9IFtzdHJlYW1dO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub250cmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub250cmFjayh0cmFja0V2ZW50KTtcbiAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1sxXSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgLyogbm90IHlldFxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0KSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEZJWE1FOiBjbGVhbiB1cCB0cmFja3MsIGxvY2FsIHN0cmVhbXMsIHJlbW90ZSBzdHJlYW1zLCBldGNcbiAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdjbG9zZWQnKTtcbiAgICB9O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzaWduYWxpbmcgc3RhdGUuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlU2lnbmFsaW5nU3RhdGUgPVxuICAgICAgICBmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgICAgICAgIHRoaXMuc2lnbmFsaW5nU3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3NpZ25hbGluZ3N0YXRlY2hhbmdlJyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICBpZiAodGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGZpcmUgdGhlIG5lZ290aWF0aW9ubmVlZGVkIGV2ZW50LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkID1cbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gRmlyZSBhd2F5IChmb3Igbm93KS5cbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ25lZ290aWF0aW9ubmVlZGVkJyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICBpZiAodGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgY29ubmVjdGlvbiBzdGF0ZS5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVDb25uZWN0aW9uU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBuZXdTdGF0ZTtcbiAgICAgIHZhciBzdGF0ZXMgPSB7XG4gICAgICAgICduZXcnOiAwLFxuICAgICAgICBjbG9zZWQ6IDAsXG4gICAgICAgIGNvbm5lY3Rpbmc6IDAsXG4gICAgICAgIGNoZWNraW5nOiAwLFxuICAgICAgICBjb25uZWN0ZWQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZDogMCxcbiAgICAgICAgZmFpbGVkOiAwXG4gICAgICB9O1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICBzdGF0ZXNbdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0YXRlXSsrO1xuICAgICAgICBzdGF0ZXNbdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdGF0ZV0rKztcbiAgICAgIH0pO1xuICAgICAgLy8gSUNFVHJhbnNwb3J0LmNvbXBsZXRlZCBhbmQgY29ubmVjdGVkIGFyZSB0aGUgc2FtZSBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgc3RhdGVzLmNvbm5lY3RlZCArPSBzdGF0ZXMuY29tcGxldGVkO1xuXG4gICAgICBuZXdTdGF0ZSA9ICduZXcnO1xuICAgICAgaWYgKHN0YXRlcy5mYWlsZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0aW5nID4gMCB8fCBzdGF0ZXMuY2hlY2tpbmcgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RpbmcnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuZGlzY29ubmVjdGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMubmV3ID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICduZXcnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGVkID4gMCB8fCBzdGF0ZXMuY29tcGxldGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgICAgfVxuXG4gICAgICBpZiAobmV3U3RhdGUgIT09IHNlbGYuaWNlQ29ubmVjdGlvblN0YXRlKSB7XG4gICAgICAgIHNlbGYuaWNlQ29ubmVjdGlvblN0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJyk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIGlmICh0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZShldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVPZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgaWYgKHRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWF0ZU9mZmVyIGNhbGxlZCB3aGlsZSB0aGVyZSBpcyBhIHBlbmRpbmcgb2ZmZXIuJyk7XG4gICAgICB9XG4gICAgICB2YXIgb2ZmZXJPcHRpb25zO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1swXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgb2ZmZXJPcHRpb25zID0gYXJndW1lbnRzWzJdO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHJhY2tzID0gW107XG4gICAgICB2YXIgbnVtQXVkaW9UcmFja3MgPSAwO1xuICAgICAgdmFyIG51bVZpZGVvVHJhY2tzID0gMDtcbiAgICAgIC8vIERlZmF1bHQgdG8gc2VuZHJlY3YuXG4gICAgICBpZiAodGhpcy5sb2NhbFN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgIG51bUF1ZGlvVHJhY2tzID0gdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGg7XG4gICAgICAgIG51bVZpZGVvVHJhY2tzID0gdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0VmlkZW9UcmFja3MoKS5sZW5ndGg7XG4gICAgICB9XG4gICAgICAvLyBEZXRlcm1pbmUgbnVtYmVyIG9mIGF1ZGlvIGFuZCB2aWRlbyB0cmFja3Mgd2UgbmVlZCB0byBzZW5kL3JlY3YuXG4gICAgICBpZiAob2ZmZXJPcHRpb25zKSB7XG4gICAgICAgIC8vIFJlamVjdCBDaHJvbWUgbGVnYWN5IGNvbnN0cmFpbnRzLlxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm1hbmRhdG9yeSB8fCBvZmZlck9wdGlvbnMub3B0aW9uYWwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICAnTGVnYWN5IG1hbmRhdG9yeS9vcHRpb25hbCBjb25zdHJhaW50cyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbztcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG51bVZpZGVvVHJhY2tzID0gb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgICAgLy8gUHVzaCBsb2NhbCBzdHJlYW1zLlxuICAgICAgICB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogdHJhY2sua2luZCxcbiAgICAgICAgICAgIHRyYWNrOiB0cmFjayxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cmFjay5raW5kID09PSAnYXVkaW8nID9cbiAgICAgICAgICAgICAgICBudW1BdWRpb1RyYWNrcyA+IDAgOiBudW1WaWRlb1RyYWNrcyA+IDBcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgbnVtQXVkaW9UcmFja3MtLTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRyYWNrLmtpbmQgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgIG51bVZpZGVvVHJhY2tzLS07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIC8vIENyZWF0ZSBNLWxpbmVzIGZvciByZWN2b25seSBzdHJlYW1zLlxuICAgICAgd2hpbGUgKG51bUF1ZGlvVHJhY2tzID4gMCB8fCBudW1WaWRlb1RyYWNrcyA+IDApIHtcbiAgICAgICAgaWYgKG51bUF1ZGlvVHJhY2tzID4gMCkge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6ICdhdWRpbycsXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bVZpZGVvVHJhY2tzID4gMCkge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6ICd2aWRlbycsXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG51bVZpZGVvVHJhY2tzLS07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlKCk7XG4gICAgICB2YXIgdHJhbnNjZWl2ZXJzID0gW107XG4gICAgICB0cmFja3MuZm9yRWFjaChmdW5jdGlvbihtbGluZSwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAvLyBGb3IgZWFjaCB0cmFjaywgY3JlYXRlIGFuIGljZSBnYXRoZXJlciwgaWNlIHRyYW5zcG9ydCxcbiAgICAgICAgLy8gZHRscyB0cmFuc3BvcnQsIHBvdGVudGlhbGx5IHJ0cHNlbmRlciBhbmQgcnRwcmVjZWl2ZXIuXG4gICAgICAgIHZhciB0cmFjayA9IG1saW5lLnRyYWNrO1xuICAgICAgICB2YXIga2luZCA9IG1saW5lLmtpbmQ7XG4gICAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcblxuICAgICAgICB2YXIgdHJhbnNwb3J0cyA9IHNlbGYuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzKG1pZCwgc2RwTUxpbmVJbmRleCk7XG5cbiAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzID0gUlRDUnRwU2VuZGVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcbiAgICAgICAgdmFyIHJ0cFNlbmRlcjtcbiAgICAgICAgdmFyIHJ0cFJlY2VpdmVyO1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIGFuIHNzcmMgbm93LCB0byBiZSB1c2VkIGxhdGVyIGluIHJ0cFNlbmRlci5zZW5kXG4gICAgICAgIHZhciBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gW3tcbiAgICAgICAgICBzc3JjOiAoMiAqIHNkcE1MaW5lSW5kZXggKyAxKSAqIDEwMDFcbiAgICAgICAgfV07XG4gICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgIHJ0cFNlbmRlciA9IG5ldyBSVENSdHBTZW5kZXIodHJhY2ssIHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWxpbmUud2FudFJlY2VpdmUpIHtcbiAgICAgICAgICBydHBSZWNlaXZlciA9IG5ldyBSVENSdHBSZWNlaXZlcih0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsIGtpbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0ge1xuICAgICAgICAgIGljZUdhdGhlcmVyOiB0cmFuc3BvcnRzLmljZUdhdGhlcmVyLFxuICAgICAgICAgIGljZVRyYW5zcG9ydDogdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgZHRsc1RyYW5zcG9ydDogdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LFxuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzOiBsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM6IG51bGwsXG4gICAgICAgICAgcnRwU2VuZGVyOiBydHBTZW5kZXIsXG4gICAgICAgICAgcnRwUmVjZWl2ZXI6IHJ0cFJlY2VpdmVyLFxuICAgICAgICAgIGtpbmQ6IGtpbmQsXG4gICAgICAgICAgbWlkOiBtaWQsXG4gICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVyczogc2VuZEVuY29kaW5nUGFyYW1ldGVycyxcbiAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgc2RwICs9IFNEUFV0aWxzLndyaXRlTWVkaWFTZWN0aW9uKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsICdvZmZlcicsIHNlbGYubG9jYWxTdHJlYW1zWzBdKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9wZW5kaW5nT2ZmZXIgPSB0cmFuc2NlaXZlcnM7XG4gICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnb2ZmZXInLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1swXSwgMCwgZGVzYyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRlc2MpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUoKTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGludGVyc2VjdGlvbiBvZiBjYXBhYmlsaXRpZXMuXG4gICAgICAgIHZhciBjb21tb25DYXBhYmlsaXRpZXMgPSBzZWxmLl9nZXRDb21tb25DYXBhYmlsaXRpZXMoXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcyk7XG5cbiAgICAgICAgc2RwICs9IFNEUFV0aWxzLndyaXRlTWVkaWFTZWN0aW9uKHRyYW5zY2VpdmVyLCBjb21tb25DYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAnYW5zd2VyJywgc2VsZi5sb2NhbFN0cmVhbXNbMF0pO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICdhbnN3ZXInLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1swXSwgMCwgZGVzYyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRlc2MpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICAgICAgdmFyIG1MaW5lSW5kZXggPSBjYW5kaWRhdGUuc2RwTUxpbmVJbmRleDtcbiAgICAgIGlmIChjYW5kaWRhdGUuc2RwTWlkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50cmFuc2NlaXZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpcy50cmFuc2NlaXZlcnNbaV0ubWlkID09PSBjYW5kaWRhdGUuc2RwTWlkKSB7XG4gICAgICAgICAgICBtTGluZUluZGV4ID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHRyYW5zY2VpdmVyID0gdGhpcy50cmFuc2NlaXZlcnNbbUxpbmVJbmRleF07XG4gICAgICBpZiAodHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgdmFyIGNhbmQgPSBPYmplY3Qua2V5cyhjYW5kaWRhdGUuY2FuZGlkYXRlKS5sZW5ndGggPiAwID9cbiAgICAgICAgICAgIFNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlKGNhbmRpZGF0ZS5jYW5kaWRhdGUpIDoge307XG4gICAgICAgIC8vIElnbm9yZSBDaHJvbWUncyBpbnZhbGlkIGNhbmRpZGF0ZXMgc2luY2UgRWRnZSBkb2VzIG5vdCBsaWtlIHRoZW0uXG4gICAgICAgIGlmIChjYW5kLnByb3RvY29sID09PSAndGNwJyAmJiBjYW5kLnBvcnQgPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWdub3JlIFJUQ1AgY2FuZGlkYXRlcywgd2UgYXNzdW1lIFJUQ1AtTVVYLlxuICAgICAgICBpZiAoY2FuZC5jb21wb25lbnQgIT09ICcxJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBBIGRpcnR5IGhhY2sgdG8gbWFrZSBzYW1wbGVzIHdvcmsuXG4gICAgICAgIGlmIChjYW5kLnR5cGUgPT09ICdlbmRPZkNhbmRpZGF0ZXMnKSB7XG4gICAgICAgICAgY2FuZCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5hZGRSZW1vdGVDYW5kaWRhdGUoY2FuZCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSByZW1vdGVEZXNjcmlwdGlvbi5cbiAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyh0aGlzLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgIHNlY3Rpb25zW21MaW5lSW5kZXggKyAxXSArPSAoY2FuZC50eXBlID8gY2FuZGlkYXRlLmNhbmRpZGF0ZS50cmltKClcbiAgICAgICAgICAgIDogJ2E9ZW5kLW9mLWNhbmRpZGF0ZXMnKSArICdcXHJcXG4nO1xuICAgICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuICAgICAgfVxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzFdLCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIFsncnRwU2VuZGVyJywgJ3J0cFJlY2VpdmVyJywgJ2ljZUdhdGhlcmVyJywgJ2ljZVRyYW5zcG9ydCcsXG4gICAgICAgICAgICAnZHRsc1RyYW5zcG9ydCddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICAgIGlmICh0cmFuc2NlaXZlclttZXRob2RdKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0cmFuc2NlaXZlclttZXRob2RdLmdldFN0YXRzKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGNiID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgIGFyZ3VtZW50c1sxXTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHNbaWRdID0gcmVzdWx0W2lkXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2IsIDAsIHJlc3VsdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgLy8gQXR0YWNoIGEgbWVkaWEgc3RyZWFtIHRvIGFuIGVsZW1lbnQuXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbihlbGVtZW50LCBzdHJlYW0pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCBhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICBlbGVtZW50LnNyY09iamVjdCA9IHN0cmVhbTtcbiAgfSxcblxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbih0bywgZnJvbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIHJlYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgdG8uc3JjT2JqZWN0ID0gZnJvbS5zcmNPYmplY3Q7XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltUGVlckNvbm5lY3Rpb246IGVkZ2VTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgYXR0YWNoTWVkaWFTdHJlYW06IGVkZ2VTaGltLmF0dGFjaE1lZGlhU3RyZWFtLFxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBlZGdlU2hpbS5yZWF0dGFjaE1lZGlhU3RyZWFtXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG52YXIgZmlyZWZveFNoaW0gPSB7XG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmICEoJ29udHJhY2snIGluXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIGlmICh0aGlzLl9vbnRyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgLy8gRmlyZWZveCBoYXMgc3VwcG9ydGVkIG1velNyY09iamVjdCBzaW5jZSBGRjIyLCB1bnByZWZpeGVkIGluIDQyLlxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICEoJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW96U3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHRoaXMubW96U3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cbiAgICBpZiAoIXdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAzOCkge1xuICAgICAgICAgIC8vIC51cmxzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gRkYgPCAzOC5cbiAgICAgICAgICAvLyBjcmVhdGUgUlRDSWNlU2VydmVycyB3aXRoIGEgc2luZ2xlIHVybC5cbiAgICAgICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlU2VydmVycykge1xuICAgICAgICAgICAgdmFyIG5ld0ljZVNlcnZlcnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGNDb25maWcuaWNlU2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgc2VydmVyID0gcGNDb25maWcuaWNlU2VydmVyc1tpXTtcbiAgICAgICAgICAgICAgaWYgKHNlcnZlci5oYXNPd25Qcm9wZXJ0eSgndXJscycpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZXJ2ZXIudXJscy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgdmFyIG5ld1NlcnZlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2ZXIudXJsc1tqXVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXIudXJsc1tqXS5pbmRleE9mKCd0dXJuJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLnVzZXJuYW1lID0gc2VydmVyLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgICAgICBuZXdTZXJ2ZXIuY3JlZGVudGlhbCA9IHNlcnZlci5jcmVkZW50aWFsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKG5ld1NlcnZlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGNDb25maWcuaWNlU2VydmVycyA9IG5ld0ljZVNlcnZlcnM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgbW96UlRDUGVlckNvbm5lY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSBtb3pSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XG5cbiAgICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXG4gICAgICBpZiAobW96UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IG1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcbiAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBtb3pSVENJY2VDYW5kaWRhdGU7XG4gICAgfVxuXG4gICAgLy8gc2hpbSBhd2F5IG5lZWQgZm9yIG9ic29sZXRlIFJUQ0ljZUNhbmRpZGF0ZS9SVENTZXNzaW9uRGVzY3JpcHRpb24uXG4gICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJyk/XG4gICAgICAgICAgICAgICAgUlRDSWNlQ2FuZGlkYXRlIDogUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKShhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICB9LFxuXG4gIHNoaW1HZXRVc2VyTWVkaWE6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGdldFVzZXJNZWRpYSBjb25zdHJhaW50cyBzaGltLlxuICAgIHZhciBnZXRVc2VyTWVkaWFfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgICAgdmFyIGNvbnN0cmFpbnRzVG9GRjM3XyA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjICE9PSAnb2JqZWN0JyB8fCBjLnJlcXVpcmUpIHtcbiAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVxdWlyZSA9IFtdO1xuICAgICAgICBPYmplY3Qua2V5cyhjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHxcbiAgICAgICAgICAgICAga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciByID0gY1trZXldID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/XG4gICAgICAgICAgICAgIGNba2V5XSA6IHtpZGVhbDogY1trZXldfTtcbiAgICAgICAgICBpZiAoci5taW4gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgICByLm1heCAhPT0gdW5kZWZpbmVkIHx8IHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVxdWlyZS5wdXNoKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgci4gbWluID0gci5tYXggPSByLmV4YWN0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY1trZXldID0gci5leGFjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSByLmV4YWN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoci5pZGVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjLmFkdmFuY2VkID0gYy5hZHZhbmNlZCB8fCBbXTtcbiAgICAgICAgICAgIHZhciBvYyA9IHt9O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByLmlkZWFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICBvY1trZXldID0ge21pbjogci5pZGVhbCwgbWF4OiByLmlkZWFsfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG9jW2tleV0gPSByLmlkZWFsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYy5hZHZhbmNlZC5wdXNoKG9jKTtcbiAgICAgICAgICAgIGRlbGV0ZSByLmlkZWFsO1xuICAgICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhyKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZGVsZXRlIGNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVxdWlyZS5sZW5ndGgpIHtcbiAgICAgICAgICBjLnJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfTtcbiAgICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAzOCkge1xuICAgICAgICBsb2dnaW5nKCdzcGVjOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgICAgaWYgKGNvbnN0cmFpbnRzLmF1ZGlvKSB7XG4gICAgICAgICAgY29uc3RyYWludHMuYXVkaW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMuYXVkaW8pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICAgICAgfVxuICAgICAgICBsb2dnaW5nKCdmZjM3OiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICAgIH07XG5cbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZ2V0VXNlck1lZGlhXztcblxuICAgIC8vIFJldHVybnMgdGhlIHJlc3VsdCBvZiBnZXRVc2VyTWVkaWEgYXMgYSBQcm9taXNlLlxuICAgIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gU2hpbSBmb3IgbWVkaWFEZXZpY2VzIG9uIG9sZGVyIHZlcnNpb25zLlxuICAgIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyA9IHtnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfSxcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH1cbiAgICAgIH07XG4gICAgfVxuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyB8fCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgICAgdmFyIGluZm9zID0gW1xuICAgICAgICAgICAgICB7a2luZDogJ2F1ZGlvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfSxcbiAgICAgICAgICAgICAge2tpbmQ6ICd2aWRlb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ31cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICByZXNvbHZlKGluZm9zKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDEpIHtcbiAgICAgIC8vIFdvcmsgYXJvdW5kIGh0dHA6Ly9idWd6aWwubGEvMTE2OTY2NVxuICAgICAgdmFyIG9yZ0VudW1lcmF0ZURldmljZXMgPVxuICAgICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcy5iaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBvcmdFbnVtZXJhdGVEZXZpY2VzKCkudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICAvLyBBdHRhY2ggYSBtZWRpYSBzdHJlYW0gdG8gYW4gZWxlbWVudC5cbiAgYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKGVsZW1lbnQsIHN0cmVhbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIGF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIGVsZW1lbnQuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICB9LFxuXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHRvLCBmcm9tKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgcmVhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICB0by5zcmNPYmplY3QgPSBmcm9tLnNyY09iamVjdDtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1PblRyYWNrOiBmaXJlZm94U2hpbS5zaGltT25UcmFjayxcbiAgc2hpbVNvdXJjZU9iamVjdDogZmlyZWZveFNoaW0uc2hpbVNvdXJjZU9iamVjdCxcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJyksXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBmaXJlZm94U2hpbS5hdHRhY2hNZWRpYVN0cmVhbSxcbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZmlyZWZveFNoaW0ucmVhdHRhY2hNZWRpYVN0cmVhbVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzJykubG9nO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gZ2V0VXNlck1lZGlhIGNvbnN0cmFpbnRzIHNoaW0uXG4gIHZhciBnZXRVc2VyTWVkaWFfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIHZhciBjb25zdHJhaW50c1RvRkYzN18gPSBmdW5jdGlvbihjKSB7XG4gICAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMucmVxdWlyZSkge1xuICAgICAgICByZXR1cm4gYztcbiAgICAgIH1cbiAgICAgIHZhciByZXF1aXJlID0gW107XG4gICAgICBPYmplY3Qua2V5cyhjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpZiAoa2V5ID09PSAncmVxdWlyZScgfHwga2V5ID09PSAnYWR2YW5jZWQnIHx8IGtleSA9PT0gJ21lZGlhU291cmNlJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IGNba2V5XSA9ICh0eXBlb2YgY1trZXldID09PSAnb2JqZWN0JykgP1xuICAgICAgICAgICAgY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgICBpZiAoci5taW4gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgci5tYXggIT09IHVuZGVmaW5lZCB8fCByLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXF1aXJlLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgci4gbWluID0gci5tYXggPSByLmV4YWN0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjW2tleV0gPSByLmV4YWN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWxldGUgci5leGFjdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoci5pZGVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYy5hZHZhbmNlZCA9IGMuYWR2YW5jZWQgfHwgW107XG4gICAgICAgICAgdmFyIG9jID0ge307XG4gICAgICAgICAgaWYgKHR5cGVvZiByLmlkZWFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgb2Nba2V5XSA9IHttaW46IHIuaWRlYWwsIG1heDogci5pZGVhbH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9jW2tleV0gPSByLmlkZWFsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjLmFkdmFuY2VkLnB1c2gob2MpO1xuICAgICAgICAgIGRlbGV0ZSByLmlkZWFsO1xuICAgICAgICAgIGlmICghT2JqZWN0LmtleXMocikubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgY1trZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAocmVxdWlyZS5sZW5ndGgpIHtcbiAgICAgICAgYy5yZXF1aXJlID0gcmVxdWlyZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjO1xuICAgIH07XG4gICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAzOCkge1xuICAgICAgbG9nZ2luZygnc3BlYzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICBpZiAoY29uc3RyYWludHMuYXVkaW8pIHtcbiAgICAgICAgY29uc3RyYWludHMuYXVkaW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMuYXVkaW8pO1xuICAgICAgfVxuICAgICAgaWYgKGNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2ZmMzc6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIH1cbiAgICByZXR1cm4gbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYShjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKTtcbiAgfTtcblxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZ2V0VXNlck1lZGlhXztcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNoaW0gZm9yIG1lZGlhRGV2aWNlcyBvbiBvbGRlciB2ZXJzaW9ucy5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyA9IHtnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxuICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH0sXG4gICAgICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfVxuICAgIH07XG4gIH1cbiAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyB8fCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICB2YXIgaW5mb3MgPSBbXG4gICAgICAgICAgICB7a2luZDogJ2F1ZGlvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfSxcbiAgICAgICAgICAgIHtraW5kOiAndmlkZW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9XG4gICAgICAgICAgXTtcbiAgICAgICAgICByZXNvbHZlKGluZm9zKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDEpIHtcbiAgICAvLyBXb3JrIGFyb3VuZCBodHRwOi8vYnVnemlsLmxhLzExNjk2NjVcbiAgICB2YXIgb3JnRW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcy5iaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG9yZ0VudW1lcmF0ZURldmljZXMoKS50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciBzYWZhcmlTaGltID0ge1xuICAvLyBUT0RPOiBEckFsZXgsIHNob3VsZCBiZSBoZXJlLCBkb3VibGUgY2hlY2sgYWdhaW5zdCBMYXlvdXRUZXN0c1xuICAvLyBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7IH0sXG5cbiAgLy8gVE9ETzogRHJBbGV4XG4gIC8vIGF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbihlbGVtZW50LCBzdHJlYW0pIHsgfSxcbiAgLy8gcmVhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24odG8sIGZyb20pIHsgfSxcblxuICAvLyBUT0RPOiBvbmNlIHRoZSBiYWNrLWVuZCBmb3IgdGhlIG1hYyBwb3J0IGlzIGRvbmUsIGFkZC5cbiAgLy8gVE9ETzogY2hlY2sgZm9yIHdlYmtpdEdUSytcbiAgLy8gc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHsgfSxcblxuICBzaGltR2V0VXNlck1lZGlhOiBmdW5jdGlvbigpIHtcbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYTtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1HZXRVc2VyTWVkaWE6IHNhZmFyaVNoaW0uc2hpbUdldFVzZXJNZWRpYVxuICAvLyBUT0RPXG4gIC8vIHNoaW1PblRyYWNrOiBzYWZhcmlTaGltLnNoaW1PblRyYWNrLFxuICAvLyBzaGltUGVlckNvbm5lY3Rpb246IHNhZmFyaVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICAvLyBhdHRhY2hNZWRpYVN0cmVhbTogc2FmYXJpU2hpbS5hdHRhY2hNZWRpYVN0cmVhbSxcbiAgLy8gcmVhdHRhY2hNZWRpYVN0cmVhbTogc2FmYXJpU2hpbS5yZWF0dGFjaE1lZGlhU3RyZWFtXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2dEaXNhYmxlZF8gPSBmYWxzZTtcblxuLy8gVXRpbGl0eSBtZXRob2RzLlxudmFyIHV0aWxzID0ge1xuICBkaXNhYmxlTG9nOiBmdW5jdGlvbihib29sKSB7XG4gICAgaWYgKHR5cGVvZiBib29sICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FyZ3VtZW50IHR5cGU6ICcgKyB0eXBlb2YgYm9vbCArXG4gICAgICAgICAgJy4gUGxlYXNlIHVzZSBhIGJvb2xlYW4uJyk7XG4gICAgfVxuICAgIGxvZ0Rpc2FibGVkXyA9IGJvb2w7XG4gICAgcmV0dXJuIChib29sKSA/ICdhZGFwdGVyLmpzIGxvZ2dpbmcgZGlzYWJsZWQnIDpcbiAgICAgICAgJ2FkYXB0ZXIuanMgbG9nZ2luZyBlbmFibGVkJztcbiAgfSxcblxuICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGxvZ0Rpc2FibGVkXykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRXh0cmFjdCBicm93c2VyIHZlcnNpb24gb3V0IG9mIHRoZSBwcm92aWRlZCB1c2VyIGFnZW50IHN0cmluZy5cbiAgICpcbiAgICogQHBhcmFtIHshc3RyaW5nfSB1YXN0cmluZyB1c2VyQWdlbnQgc3RyaW5nLlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IGV4cHIgUmVndWxhciBleHByZXNzaW9uIHVzZWQgYXMgbWF0Y2ggY3JpdGVyaWEuXG4gICAqIEBwYXJhbSB7IW51bWJlcn0gcG9zIHBvc2l0aW9uIGluIHRoZSB2ZXJzaW9uIHN0cmluZyB0byBiZSByZXR1cm5lZC5cbiAgICogQHJldHVybiB7IW51bWJlcn0gYnJvd3NlciB2ZXJzaW9uLlxuICAgKi9cbiAgZXh0cmFjdFZlcnNpb246IGZ1bmN0aW9uKHVhc3RyaW5nLCBleHByLCBwb3MpIHtcbiAgICB2YXIgbWF0Y2ggPSB1YXN0cmluZy5tYXRjaChleHByKTtcbiAgICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID49IHBvcyAmJiBwYXJzZUludChtYXRjaFtwb3NdLCAxMCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEJyb3dzZXIgZGV0ZWN0b3IuXG4gICAqXG4gICAqIEByZXR1cm4ge29iamVjdH0gcmVzdWx0IGNvbnRhaW5pbmcgYnJvd3NlciwgdmVyc2lvbiBhbmQgbWluVmVyc2lvblxuICAgKiAgICAgcHJvcGVydGllcy5cbiAgICovXG4gIGRldGVjdEJyb3dzZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFJldHVybmVkIHJlc3VsdCBvYmplY3QuXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHJlc3VsdC5icm93c2VyID0gbnVsbDtcbiAgICByZXN1bHQudmVyc2lvbiA9IG51bGw7XG4gICAgcmVzdWx0Lm1pblZlcnNpb24gPSBudWxsO1xuXG4gICAgLy8gRmFpbCBlYXJseSBpZiBpdCdzIG5vdCBhIGJyb3dzZXJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgIXdpbmRvdy5uYXZpZ2F0b3IpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIGJyb3dzZXIuJztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gRmlyZWZveC5cbiAgICBpZiAobmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSkge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnZmlyZWZveCc7XG4gICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvRmlyZWZveFxcLyhbMC05XSspXFwuLywgMSk7XG4gICAgICByZXN1bHQubWluVmVyc2lvbiA9IDMxO1xuXG4gICAgLy8gYWxsIHdlYmtpdC1iYXNlZCBicm93c2Vyc1xuICAgIH0gZWxzZSBpZiAobmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSkge1xuICAgICAgLy8gQ2hyb21lLCBDaHJvbWl1bSwgV2VidmlldywgT3BlcmEsIGFsbCB1c2UgdGhlIGNocm9tZSBzaGltIGZvciBub3dcbiAgICAgIGlmICh3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnY2hyb21lJztcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0Nocm9tKGV8aXVtKVxcLyhbMC05XSspXFwuLywgMik7XG4gICAgICAgIHJlc3VsdC5taW5WZXJzaW9uID0gMzg7XG5cbiAgICAgIC8vIFNhZmFyaSBvciB1bmtub3duIHdlYmtpdC1iYXNlZFxuICAgICAgLy8gZm9yIHRoZSB0aW1lIGJlaW5nIFNhZmFyaSBoYXMgc3VwcG9ydCBmb3IgTWVkaWFTdHJlYW1zIGJ1dCBub3Qgd2ViUlRDXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTYWZhcmkgVUEgc3Vic3RyaW5ncyBvZiBpbnRlcmVzdCBmb3IgcmVmZXJlbmNlOlxuICAgICAgICAvLyAtIHdlYmtpdCB2ZXJzaW9uOiAgICAgICAgICAgQXBwbGVXZWJLaXQvNjAyLjEuMjUgKGFsc28gdXNlZCBpbiBPcCxDcilcbiAgICAgICAgLy8gLSBzYWZhcmkgVUkgdmVyc2lvbjogICAgICAgIFZlcnNpb24vOS4wLjMgKHVuaXF1ZSB0byBTYWZhcmkpXG4gICAgICAgIC8vIC0gc2FmYXJpIFVJIHdlYmtpdCB2ZXJzaW9uOiBTYWZhcmkvNjAxLjQuNCAoYWxzbyB1c2VkIGluIE9wLENyKVxuICAgICAgICAvL1xuICAgICAgICAvLyBpZiB0aGUgd2Via2l0IHZlcnNpb24gYW5kIHNhZmFyaSBVSSB3ZWJraXQgdmVyc2lvbnMgYXJlIGVxdWFscyxcbiAgICAgICAgLy8gLi4uIHRoaXMgaXMgYSBzdGFibGUgdmVyc2lvbi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gb25seSB0aGUgaW50ZXJuYWwgd2Via2l0IHZlcnNpb24gaXMgaW1wb3J0YW50IHRvZGF5IHRvIGtub3cgaWZcbiAgICAgICAgLy8gbWVkaWEgc3RyZWFtcyBhcmUgc3VwcG9ydGVkXG4gICAgICAgIC8vXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKFxcZCspLihcXGQrKS8pKSB7XG4gICAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnc2FmYXJpJztcbiAgICAgICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAgIC9BcHBsZVdlYktpdFxcLyhbMC05XSspXFwuLywgMSk7XG4gICAgICAgICAgcmVzdWx0Lm1pblZlcnNpb24gPSA2MDI7XG5cbiAgICAgICAgLy8gdW5rbm93biB3ZWJraXQtYmFzZWQgYnJvd3NlclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdC5icm93c2VyID0gJ1Vuc3VwcG9ydGVkIHdlYmtpdC1iYXNlZCBicm93c2VyICcgK1xuICAgICAgICAgICAgICAnd2l0aCBHVU0gc3VwcG9ydCBidXQgbm8gV2ViUlRDIHN1cHBvcnQuJztcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAvLyBFZGdlLlxuICAgIH0gZWxzZSBpZiAobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyAmJlxuICAgICAgICBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9FZGdlXFwvKFxcZCspLihcXGQrKSQvKSkge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnZWRnZSc7XG4gICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvRWRnZVxcLyhcXGQrKS4oXFxkKykkLywgMik7XG4gICAgICByZXN1bHQubWluVmVyc2lvbiA9IDEwNTQ3O1xuXG4gICAgLy8gRGVmYXVsdCBmYWxsdGhyb3VnaDogbm90IHN1cHBvcnRlZC5cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnTm90IGEgc3VwcG9ydGVkIGJyb3dzZXIuJztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gV2FybiBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBtaW5WZXJzaW9uLlxuICAgIGlmIChyZXN1bHQudmVyc2lvbiA8IHJlc3VsdC5taW5WZXJzaW9uKSB7XG4gICAgICB1dGlscy5sb2coJ0Jyb3dzZXI6ICcgKyByZXN1bHQuYnJvd3NlciArICcgVmVyc2lvbjogJyArIHJlc3VsdC52ZXJzaW9uICtcbiAgICAgICAgICAnIDwgbWluaW11bSBzdXBwb3J0ZWQgdmVyc2lvbjogJyArIHJlc3VsdC5taW5WZXJzaW9uICtcbiAgICAgICAgICAnXFxuIHNvbWUgdGhpbmdzIG1pZ2h0IG5vdCB3b3JrIScpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5cbi8vIEV4cG9ydC5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2c6IHV0aWxzLmxvZyxcbiAgZGlzYWJsZUxvZzogdXRpbHMuZGlzYWJsZUxvZyxcbiAgYnJvd3NlckRldGFpbHM6IHV0aWxzLmRldGVjdEJyb3dzZXIoKSxcbiAgZXh0cmFjdFZlcnNpb246IHV0aWxzLmV4dHJhY3RWZXJzaW9uXG59O1xuIiwiLypcbiAqIENvcHlyaWdodCA6IFBhcnRuZXJpbmcgMy4wICgyMDA3LTIwMTYpXG4gKiBBdXRob3IgOiBTeWx2YWluIE1haMOpIDxzeWx2YWluLm1haGVAcGFydG5lcmluZy5mcj5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBkaXlhLXNkay5cbiAqXG4gKiBkaXlhLXNkayBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBkaXlhLXNkayBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBkaXlhLXNkay4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5cblxuXG5cbnZhciBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKTtcbmlmKCFpc0Jyb3dzZXIpIHsgdmFyIFEgPSByZXF1aXJlKCdxJyk7IH1cbmVsc2UgeyB2YXIgUSA9IHdpbmRvdy5ROyB9XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gZmFsc2U7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKC4uLmFyZ3Mpe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyguLi5hcmdzKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24oLi4uYXJncyl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IoLi4uYXJncyk7XG5cdH1cbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBEaXlhTm9kZSgpe1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuXHR0aGlzLl91c2VyID0gbnVsbDtcblx0dGhpcy5fYXV0aGVudGljYXRlZCA9IG51bGw7XG5cdHRoaXMuX3Bhc3MgPSBudWxsO1xuXG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHR0aGlzLl9hZGRyID0gbnVsbDtcblx0dGhpcy5fc29ja2V0ID0gbnVsbDtcblx0dGhpcy5fbmV4dElkID0gMDtcblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcblx0dGhpcy5fcGVuZGluZ01lc3NhZ2VzID0gW107XG5cdHRoaXMuX3BlZXJzID0gW107XG5cdHRoaXMuX3JlY29ubmVjdFRpbWVvdXQgPSAxMDAwO1xuXHR0aGlzLl9jb25uZWN0VGltZW91dCA9IDUwMDA7XG59XG5pbmhlcml0cyhEaXlhTm9kZSwgRXZlbnRFbWl0dGVyKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vIFB1YmxpYyBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUudXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcblx0aWYodXNlcikgdGhpcy5fdXNlciA9IHVzZXI7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3VzZXI7XG59O1xuRGl5YU5vZGUucHJvdG90eXBlLmF1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbihhdXRoZW50aWNhdGVkKSB7XG5cdGlmKGF1dGhlbnRpY2F0ZWQgIT09IHVuZGVmaW5lZCkgdGhpcy5fYXV0aGVudGljYXRlZCA9IGF1dGhlbnRpY2F0ZWQ7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX2F1dGhlbnRpY2F0ZWQ7XG59O1xuRGl5YU5vZGUucHJvdG90eXBlLnBhc3MgPSBmdW5jdGlvbihwYXNzKSB7XG5cdGlmKHBhc3MgIT09IHVuZGVmaW5lZCkgdGhpcy5fcGFzcyA9IHBhc3M7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3Bhc3M7XG59O1xuRGl5YU5vZGUucHJvdG90eXBlLmFkZHIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2FkZHI7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUucGVlcnMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5fcGVlcnM7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2VsZiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fc2VsZjsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5zZXRTZWN1cmVkID0gZnVuY3Rpb24oYlNlY3VyZWQpIHsgdGhpcy5fc2VjdXJlZCA9IGJTZWN1cmVkICE9PSBmYWxzZTsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5zZXRXU29ja2V0ID0gZnVuY3Rpb24oV1NvY2tldCkge3RoaXMuX1dTb2NrZXQgPSBXU29ja2V0O31cblxuXG5cbi8qKiBAcmV0dXJuIHtQcm9taXNlPFN0cmluZz59IHRoZSBjb25uZWN0ZWQgcGVlciBuYW1lICovXG5EaXlhTm9kZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKGFkZHIsIFdTb2NrZXQpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuYkRvbnRSZWNvbm5lY3QgPSBmYWxzZTtcblxuXHRpZihXU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gV1NvY2tldDtcblx0ZWxzZSBpZighdGhpcy5fV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQ7XG5cdFdTb2NrZXQgPSB0aGlzLl9XU29ja2V0O1xuXG5cdC8vIENoZWNrIGFuZCBGb3JtYXQgVVJJIChGUUROKVxuXHRpZihhZGRyLmluZGV4T2YoXCJ3czovL1wiKSA9PT0gMCAmJiB0aGlzLl9zZWN1cmVkKSByZXR1cm4gUS5yZWplY3QoXCJQbGVhc2UgdXNlIGEgc2VjdXJlZCBjb25uZWN0aW9uIChcIiArIGFkZHIgKyBcIilcIik7XG5cdGlmKGFkZHIuaW5kZXhPZihcIndzczovL1wiKSA9PT0gMCAmJiB0aGlzLl9zZWN1cmVkID09PSBmYWxzZSkgcmV0dXJuIFEucmVqZWN0KFwiUGxlYXNlIHVzZSBhIG5vbi1zZWN1cmVkIGNvbm5lY3Rpb24gKFwiICsgYWRkciArIFwiKVwiKTtcblx0aWYoYWRkci5pbmRleE9mKFwid3M6Ly9cIikgIT09IDAgJiYgYWRkci5pbmRleE9mKFwid3NzOi8vXCIpICE9PSAwKSB7XG5cdFx0aWYodGhpcy5fc2VjdXJlZCkgYWRkciA9IFwid3NzOi8vXCIgKyBhZGRyO1xuXHRcdGVsc2UgYWRkciA9IFwid3M6Ly9cIiArIGFkZHI7XG5cdH1cblxuXG5cdGlmKHRoaXMuX2FkZHIgPT09IGFkZHIpe1xuXHRcdGlmKHRoaXMuX3N0YXR1cyA9PT0gJ29wZW5lZCcpXG5cdFx0XHRyZXR1cm4gUSh0aGlzLnNlbGYoKSk7XG5cdFx0ZWxzZSBpZih0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UgJiYgdGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UuaXNQZW5kaW5nKCkpXG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRyZXR1cm4gdGhpcy5jbG9zZSgpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHR0aGF0Ll9hZGRyID0gYWRkcjtcblx0XHR0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdFx0TG9nZ2VyLmxvZygnZDE6IGNvbm5lY3QgdG8gJyArIHRoYXQuX2FkZHIpO1xuXHRcdHZhciBzb2NrID0gbmV3IFNvY2tldEhhbmRsZXIoV1NvY2tldCwgdGhhdC5fYWRkciwgdGhhdC5fY29ubmVjdFRpbWVvdXQpO1xuXG5cdFx0aWYoIXRoYXQuX3NvY2tldEhhbmRsZXIpIHRoYXQuX3NvY2tldEhhbmRsZXIgPSBzb2NrO1xuXG5cdFx0dGhhdC5fb25vcGVuaW5nKCk7XG5cblx0XHRzb2NrLm9uKCdvcGVuJywgZnVuY3Rpb24oKXtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJbZDFdIFdlYnNvY2tldCByZXNwb25kZWQgYnV0IGFscmVhZHkgY29ubmVjdGVkIHRvIGEgZGlmZmVyZW50IG9uZVwiKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhhdC5fc29ja2V0SGFuZGxlciA9IHNvY2s7XG5cdFx0XHR0aGF0Ll9zdGF0dXMgPSAnb3BlbmVkJztcblx0XHRcdHRoYXQuX3NldHVwUGluZ1Jlc3BvbnNlKCk7XG5cdFx0fSk7XG5cblx0XHRzb2NrLm9uKCdjbG9zaW5nJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGF0Ll9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKSByZXR1cm4gO1xuXHRcdFx0dGhhdC5fb25jbG9zaW5nKCk7XG5cdFx0fSk7XG5cblx0XHRzb2NrLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhhdC5fc29ja2V0SGFuZGxlciAhPT0gc29jaykgcmV0dXJuO1xuXHRcdFx0dGhhdC5fc29ja2V0SGFuZGxlciA9IG51bGw7XG5cdFx0XHR0aGF0Ll9zdGF0dXMgPSAnY2xvc2VkJztcblx0XHRcdHRoYXQuX3N0b3BQaW5nUmVzcG9uc2UoKTtcblx0XHRcdHRoYXQuX29uY2xvc2UoKTtcblx0XHRcdGlmKHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZCkgeyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQucmVqZWN0KFwiY2xvc2VkXCIpOyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO31cblx0XHR9KTtcblxuXHRcdHNvY2sub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX29uZXJyb3IoZXJyb3IpO1xuXHRcdH0pO1xuXG5cdFx0c29jay5vbigndGltZW91dCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhhdC5fc29ja2V0SGFuZGxlciAhPT0gc29jaykgcmV0dXJuO1xuXHRcdFx0dGhhdC5fc29ja2V0SGFuZGxlciA9IG51bGw7XG5cdFx0XHR0aGF0Ll9zdGF0dXMgPSAnY2xvc2VkJztcblx0XHRcdGlmKHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZCkgeyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQucmVqZWN0KFwiY2xvc2VkXCIpOyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO31cblx0XHR9KVxuXG5cdFx0c29jay5vbignbWVzc2FnZScsIGZ1bmN0aW9uKG1lc3NhZ2UpIHsgdGhhdC5fb25tZXNzYWdlKG1lc3NhZ2UpOyB9KTtcblxuXHRcdHJldHVybiB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0fSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmJEb250UmVjb25uZWN0ID0gdHJ1ZTtcblx0cmV0dXJuIHRoaXMuY2xvc2UoKTtcbn07XG5cblxuRGl5YU5vZGUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc3RvcFBpbmdSZXNwb25zZSgpO1xuXHRpZih0aGlzLl9zb2NrZXRIYW5kbGVyKSByZXR1cm4gdGhpcy5fc29ja2V0SGFuZGxlci5jbG9zZSgpO1xuXHRlbHNlIHJldHVybiBRKCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gKHRoaXMuX3NvY2tldEhhbmRsZXIgJiYgdGhpcy5fc29ja2V0SGFuZGxlci5pc0Nvbm5lY3RlZCgpKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgdGltZW91dCwgb3B0aW9ucyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHRpZighcGFyYW1zLnNlcnZpY2UpIHtcblx0XHRMb2dnZXIuZXJyb3IoJ05vIHNlcnZpY2UgZGVmaW5lZCBmb3IgcmVxdWVzdCAhJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKHBhcmFtcywgXCJSZXF1ZXN0XCIpO1xuXHR0aGlzLl9hcHBlbmRNZXNzYWdlKG1lc3NhZ2UsIGNhbGxiYWNrKTtcblx0aWYodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwgPSBvcHRpb25zLmNhbGxiYWNrX3BhcnRpYWw7XG5cdG1lc3NhZ2Uub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0aWYoIWlzTmFOKHRpbWVvdXQpICYmIHRpbWVvdXQgPiAwKXtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgaGFuZGxlciA9IHRoYXQuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0XHRpZihoYW5kbGVyKSB0aGF0Ll9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCAnVGltZW91dCBleGNlZWRlZCAoJyt0aW1lb3V0KydtcykgIScpO1xuXHRcdH0sIHRpbWVvdXQpO1xuXHR9XG5cblx0aWYoIXRoaXMuX3NlbmQobWVzc2FnZSkpe1xuXHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlbmQgcmVxdWVzdCAhJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjayl7XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkUmVxdWVzdCc7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdGlmKCFwYXJhbXMuc2VydmljZSl7XG5cdFx0TG9nZ2VyLmVycm9yKCdObyBzZXJ2aWNlIGRlZmluZWQgZm9yIHN1YnNjcmlwdGlvbiAhJyk7XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0dmFyIG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKHBhcmFtcywgXCJTdWJzY3JpcHRpb25cIik7XG5cdHRoaXMuX2FwcGVuZE1lc3NhZ2UobWVzc2FnZSwgY2FsbGJhY2spO1xuXG5cdGlmKCF0aGlzLl9zZW5kKG1lc3NhZ2UpKXtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdExvZ2dlci5lcnJvcignQ2Fubm90IHNlbmQgc3Vic2NyaXB0aW9uICEnKTtcblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHRyZXR1cm4gbWVzc2FnZS5pZDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YklkKXtcblx0aWYodGhpcy5fcGVuZGluZ01lc3NhZ2VzW3N1YklkXSAmJiB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbc3ViSWRdLnR5cGUgPT09IFwiU3Vic2NyaXB0aW9uXCIpe1xuXHRcdHZhciBzdWJzY3JpcHRpb24gPSB0aGlzLl9yZW1vdmVNZXNzYWdlKHN1YklkKTtcblxuXHRcdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZSh7XG5cdFx0XHR0YXJnZXQ6IHN1YnNjcmlwdGlvbi50YXJnZXQsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHN1YklkOiBzdWJJZFxuXHRcdFx0fVxuXHRcdH0sIFwiVW5zdWJzY3JpYmVcIik7XG5cblx0XHRpZighdGhpcy5fc2VuZChtZXNzYWdlKSl7XG5cdFx0XHRMb2dnZXIuZXJyb3IoJ0Nhbm5vdCBzZW5kIHVuc3Vic2NyaWJlICEnKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vIEludGVybmFsIG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2FwcGVuZE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCBjYWxsYmFjayl7XG5cdHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXSA9IHtcblx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0dHlwZTogbWVzc2FnZS50eXBlLFxuXHRcdHRhcmdldDogbWVzc2FnZS50YXJnZXRcblx0fTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fcmVtb3ZlTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCl7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdGlmKGhhbmRsZXIpe1xuXHRcdGRlbGV0ZSB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZUlkXTtcblx0XHRyZXR1cm4gaGFuZGxlcjtcblx0fWVsc2V7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY2xlYXJNZXNzYWdlcyA9IGZ1bmN0aW9uKGVyciwgZGF0YSl7XG5cdGZvcih2YXIgbWVzc2FnZUlkIGluIHRoaXMuX3BlbmRpbmdNZXNzYWdlcyl7XG5cdFx0dmFyIGhhbmRsZXIgPSB0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2VJZCk7XG5cdFx0dGhpcy5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgZXJyLCBkYXRhKTtcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9jbGVhclBlZXJzID0gZnVuY3Rpb24oKXtcblx0d2hpbGUodGhpcy5fcGVlcnMubGVuZ3RoKSB0aGlzLmVtaXQoJ3BlZXItZGlzY29ubmVjdGVkJywgdGhpcy5fcGVlcnMucG9wKCkpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9nZXRNZXNzYWdlSGFuZGxlciA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCl7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdHJldHVybiBoYW5kbGVyID8gaGFuZGxlciA6IG51bGw7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX25vdGlmeUxpc3RlbmVyID0gZnVuY3Rpb24oaGFuZGxlciwgZXJyb3IsIGRhdGEpe1xuXHRpZihoYW5kbGVyICYmIHR5cGVvZiBoYW5kbGVyLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0ZXJyb3IgPSBlcnJvciA/IGVycm9yIDogbnVsbDtcblx0XHRkYXRhID0gZGF0YSA/IGRhdGEgOiBudWxsO1xuXHRcdHRyeSB7XG5cdFx0XHRoYW5kbGVyLmNhbGxiYWNrKGVycm9yLCBkYXRhKTtcblx0XHR9IGNhdGNoKGUpIHsgY29uc29sZS5sb2coJ1tFcnJvciBpbiBSZXF1ZXN0IGNhbGxiYWNrXSAnICsgZS5zdGFjayA/IGUuc3RhY2sgOiBlKTt9XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fc2VuZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRyZXR1cm4gdGhpcy5fc29ja2V0SGFuZGxlciAmJiB0aGlzLl9zb2NrZXRIYW5kbGVyLnNlbmQobWVzc2FnZSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3NldHVwUGluZ1Jlc3BvbnNlID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuX3BpbmdUaW1lb3V0ID0gMTUwMDA7XG5cdHRoaXMuX2xhc3RQaW5nID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cblx0ZnVuY3Rpb24gY2hlY2tQaW5nKCl7XG5cdFx0dmFyIGN1clRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHRpZihjdXJUaW1lIC0gdGhhdC5fbGFzdFBpbmcgPiB0aGF0Ll9waW5nVGltZW91dCl7XG5cdFx0XHR0aGF0Ll9mb3JjZUNsb3NlKCk7XG5cdFx0XHRMb2dnZXIubG9nKFwiZDE6ICB0aW1lZCBvdXQgIVwiKTtcblx0XHR9ZWxzZXtcblx0XHRcdExvZ2dlci5sb2coXCJkMTogbGFzdCBwaW5nIG9rXCIpO1xuXHRcdFx0dGhhdC5fcGluZ1NldFRpbWVvdXRJZCA9IHNldFRpbWVvdXQoY2hlY2tQaW5nLCBNYXRoLnJvdW5kKHRoYXQuX3BpbmdUaW1lb3V0IC8gMi4xKSk7XG5cdFx0fVxuXHR9XG5cblx0Y2hlY2tQaW5nKCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3N0b3BQaW5nUmVzcG9uc2UgPSBmdW5jdGlvbigpe1xuXHRjbGVhclRpbWVvdXQodGhpcy5fcGluZ1NldFRpbWVvdXRJZCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2ZvcmNlQ2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLl9zb2NrZXRIYW5kbGVyLmNsb3NlKCk7XG5cdHRoaXMuX29uY2xvc2UoKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBTb2NrZXQgZXZlbnQgaGFuZGxlcnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5EaXlhTm9kZS5wcm90b3R5cGUuX29ubWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihpc05hTihtZXNzYWdlLmlkKSkgcmV0dXJuIHRoaXMuX2hhbmRsZUludGVybmFsTWVzc2FnZShtZXNzYWdlKTtcblx0dmFyIGhhbmRsZXIgPSB0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcihtZXNzYWdlLmlkKTtcblx0aWYoIWhhbmRsZXIpIHJldHVybjtcblx0c3dpdGNoKGhhbmRsZXIudHlwZSl7XG5cdFx0Y2FzZSBcIlJlcXVlc3RcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVJlcXVlc3QoaGFuZGxlciwgbWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiU3Vic2NyaXB0aW9uXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVTdWJzY3JpcHRpb24oaGFuZGxlciwgbWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbm9wZW5pbmcgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5lbWl0KCdvcGVuaW5nJywgdGhpcyk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX29uZXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuXHR0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKGVycm9yKSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX29uY2xvc2luZyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmVtaXQoJ2Nsb3NpbmcnLCB0aGlzKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLl9jbGVhck1lc3NhZ2VzKCdQZWVyRGlzY29ubmVjdGVkJyk7XG5cdHRoaXMuX2NsZWFyUGVlcnMoKTtcblxuXHRpZighdGhpcy5iRG9udFJlY29ubmVjdCkge1xuXHRcdExvZ2dlci5sb2coJ2QxOiBjb25uZWN0aW9uIGxvc3QsIHRyeSByZWNvbm5lY3RpbmcnKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGF0LmNvbm5lY3QodGhhdC5fYWRkciwgdGhhdC5fV1NvY2tldCkuY2F0Y2goZnVuY3Rpb24oZXJyKXt9KTtcblx0XHR9LCB0aGF0Ll9yZWNvbm5lY3RUaW1lb3V0KTtcblx0fVxuXHR0aGlzLmVtaXQoJ2Nsb3NlJywgdGhpcy5fYWRkcik7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8gUHJvdG9jb2wgZXZlbnQgaGFuZGxlcnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlSW50ZXJuYWxNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdHN3aXRjaChtZXNzYWdlLnR5cGUpe1xuXHRcdGNhc2UgXCJQZWVyQ29ubmVjdGVkXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVQZWVyQ29ubmVjdGVkKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlBlZXJEaXNjb25uZWN0ZWRcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVBlZXJEaXNjb25uZWN0ZWQobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiSGFuZHNoYWtlXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVIYW5kc2hha2UobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiUGluZ1wiOlxuXHRcdFx0dGhpcy5faGFuZGxlUGluZyhtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVBpbmcgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0bWVzc2FnZS50eXBlID0gXCJQb25nXCI7XG5cdHRoaXMuX2xhc3RQaW5nID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdHRoaXMuX3NlbmQobWVzc2FnZSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZUhhbmRzaGFrZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXG5cdGlmKG1lc3NhZ2UucGVlcnMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgbWVzc2FnZS5zZWxmICE9PSAnc3RyaW5nJyl7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTWlzc2luZyBhcmd1bWVudHMgZm9yIEhhbmRzaGFrZSBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblxuXHR0aGlzLl9zZWxmID0gbWVzc2FnZS5zZWxmO1xuXG5cdGZvcih2YXIgaT0wO2k8bWVzc2FnZS5wZWVycy5sZW5ndGg7IGkrKyl7XG5cdFx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJzW2ldKTtcblx0XHR0aGlzLmVtaXQoJ3BlZXItY29ubmVjdGVkJywgbWVzc2FnZS5wZWVyc1tpXSk7XG5cdH1cblxuXHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucmVzb2x2ZSh0aGlzLnNlbGYoKSk7XG5cdHRoaXMuZW1pdCgnb3BlbicsIHRoaXMuX2FkZHIpO1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckNvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckNvbm5lY3RlZCBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9BZGQgcGVlciB0byB0aGUgbGlzdCBvZiByZWFjaGFibGUgcGVlcnNcblx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJJZCk7XG5cblx0dGhpcy5lbWl0KCdwZWVyLWNvbm5lY3RlZCcsIG1lc3NhZ2UucGVlcklkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckRpc2Nvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckRpc2Nvbm5lY3RlZCBNZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9HbyB0aHJvdWdoIGFsbCBwZW5kaW5nIG1lc3NhZ2VzIGFuZCBub3RpZnkgdGhlIG9uZXMgdGhhdCBhcmUgdGFyZ2V0ZWRcblx0Ly9hdCB0aGUgZGlzY29ubmVjdGVkIHBlZXIgdGhhdCBpdCBkaXNjb25uZWN0ZWQgYW5kIHRoZXJlZm9yZSB0aGUgY29tbWFuZFxuXHQvL2Nhbm5vdCBiZSBmdWxmaWxsZWRcblx0Zm9yKHZhciBtZXNzYWdlSWQgaW4gdGhpcy5fcGVuZGluZ01lc3NhZ2VzKXtcblx0XHR2YXIgaGFuZGxlciA9IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKG1lc3NhZ2VJZCk7XG5cdFx0aWYoaGFuZGxlciAmJiBoYW5kbGVyLnRhcmdldCA9PT0gbWVzc2FnZS5wZWVySWQpIHtcblx0XHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZUlkKTtcblx0XHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsICdQZWVyRGlzY29ubmVjdGVkJywgbnVsbCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9SZW1vdmUgcGVlciBmcm9tIGxpc3Qgb2YgcmVhY2hhYmxlIHBlZXJzXG5cdGZvcih2YXIgaT10aGlzLl9wZWVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG5cdFx0aWYodGhpcy5fcGVlcnNbaV0gPT09IG1lc3NhZ2UucGVlcklkKXtcblx0XHRcdHRoaXMuX3BlZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRoaXMuZW1pdCgncGVlci1kaXNjb25uZWN0ZWQnLCBtZXNzYWdlLnBlZXJJZCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVJlcXVlc3QgPSBmdW5jdGlvbihoYW5kbGVyLCBtZXNzYWdlKXtcblx0aWYobWVzc2FnZS50eXBlID09PSAnUGFydGlhbEFuc3dlcicpIHtcblx0XHRpZih0eXBlb2YgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHZhciBlcnJvciA9IG1lc3NhZ2UuZXJyb3IgPyBtZXNzYWdlLmVycm9yIDogbnVsbDtcblx0XHRcdHZhciBkYXRhID0gbWVzc2FnZS5kYXRhID8gbWVzc2FnZS5kYXRhIDogbnVsbDtcblx0XHRcdHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsKGVycm9yLCBkYXRhKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEpO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKGhhbmRsZXIsIG1lc3NhZ2Upe1xuXHQvL3JlbW92ZSBzdWJzY3JpcHRpb24gaWYgaXQgd2FzIGNsb3NlZCBmcm9tIG5vZGVcblx0aWYobWVzc2FnZS5yZXN1bHQgPT09IFwiY2xvc2VkXCIpIHtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdG1lc3NhZ2UuZXJyb3IgPSAnU3Vic2NyaXB0aW9uQ2xvc2VkJztcblx0fVxuXHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEgPyBtZXNzYWdlLmRhdGEgOiBudWxsKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU29ja2V0SGFuZGxlciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBTb2NrZXRIYW5kbGVyKFdTb2NrZXQsIGFkZHIsIHRpbWVvdXQpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmFkZHIgPSBhZGRyO1xuXG5cdGlmKFdTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSBXU29ja2V0O1xuXHRlbHNlIGlmKCF0aGlzLl9XU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gd2luZG93LldlYlNvY2tldDtcblx0V1NvY2tldCA9IHRoaXMuX1dTb2NrZXQ7XG5cblx0dGhpcy5fc3RhdHVzID0gJ29wZW5pbmcnO1xuXG5cdHRyeSB7XG5cdFx0dGhpcy5fc29ja2V0ID0gYWRkci5pbmRleE9mKFwid3NzOi8vXCIpPT09MCA/IG5ldyBXU29ja2V0KGFkZHIsIHVuZGVmaW5lZCwge3JlamVjdFVuYXV0aG9yaXplZDpmYWxzZX0pIDogbmV3IFdTb2NrZXQoYWRkcik7XG5cblx0XHR0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2sgPSB0aGlzLl9vbm9wZW4uYmluZCh0aGlzKTtcblx0XHR0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrID0gdGhpcy5fb25jbG9zZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayA9IHRoaXMuX29ubWVzc2FnZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldEVycm9yQ2FsbGJhY2sgPSB0aGlzLl9vbmVycm9yLmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJyx0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fc29ja2V0RXJyb3JDYWxsYmFjayk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBlcnJvciA6IFwiLGVycik7XG5cdFx0XHR0aGF0Ll9zb2NrZXQuY2xvc2UoKTtcblx0XHR9KTtcblxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdGlmKHRoYXQuX3N0YXR1cyA9PT0gJ29wZW5lZCcpIHJldHVybjtcblx0XHRcdGlmKHRoYXQuX3N0YXR1cyAhPT0gJ2Nsb3NlZCcpe1xuXHRcdFx0XHRMb2dnZXIubG9nKCdkMTogJyArIHRoYXQuYWRkciArICcgdGltZWQgb3V0IHdoaWxlIGNvbm5lY3RpbmcnKTtcblx0XHRcdFx0dGhhdC5jbG9zZSgpO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVvdXQnLCB0aGF0Ll9zb2NrZXQpO1xuXHRcdFx0fVxuXHRcdH0sIHRpbWVvdXQpO1xuXG5cdH0gY2F0Y2goZSkge1xuXHRcdExvZ2dlci5lcnJvcihlLnN0YWNrKTtcblx0XHR0aGF0LmNsb3NlKCk7XG5cdFx0dGhyb3cgZTtcblx0fVxufTtcbmluaGVyaXRzKFNvY2tldEhhbmRsZXIsIEV2ZW50RW1pdHRlcik7XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGlmKHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSkgcmV0dXJuIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlO1xuXHR0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zaW5nJztcblx0dGhpcy5lbWl0KCdjbG9zaW5nJywgdGhpcy5fc29ja2V0KTtcblx0aWYodGhpcy5fc29ja2V0KSB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcblx0cmV0dXJuIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0dHJ5IHtcblx0XHR2YXIgZGF0YSA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuXHR9IGNhdGNoKGVycikge1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBzZXJpYWxpemUgbWVzc2FnZScpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0dGhpcy5fc29ja2V0LnNlbmQoZGF0YSk7XG5cdH0gY2F0Y2goZXJyKXtcblx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3Qgc2VuZCBtZXNzYWdlJyk7XG5cdFx0Y29uc29sZS5lcnJvcihlcnIpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fc29ja2V0LnJlYWR5U3RhdGUgPT0gdGhpcy5fV1NvY2tldC5PUEVOICYmIHRoaXMuX3N0YXR1cyA9PT0gJ29wZW5lZCc7XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25vcGVuID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX3N0YXR1cyA9ICdvcGVuZWQnO1xuXHR0aGlzLmVtaXQoJ29wZW4nLCB0aGlzLl9zb2NrZXQpO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuX29uY2xvc2UgPSBmdW5jdGlvbihldnQpIHtcblx0dGhpcy5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdHRoaXMudW5yZWdpc3RlckNhbGxiYWNrcygpO1xuXHR0aGlzLmVtaXQoJ2Nsb3NlJywgdGhpcy5fc29ja2V0KTtcblx0aWYodGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkICYmIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlKSB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucmVzb2x2ZSgpO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuX29ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2dCkge1xuXHR0cnkge1xuXHRcdHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldnQuZGF0YSk7XG5cdFx0dGhpcy5lbWl0KCdtZXNzYWdlJywgbWVzc2FnZSk7XG5cdH0gY2F0Y2goZXJyKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJbV1NdIGNhbm5vdCBwYXJzZSBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHR0aHJvdyBlcnI7XG5cdH1cbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbmVycm9yID0gZnVuY3Rpb24oZXZ0KSB7XG5cdHRoaXMuZW1pdCgnZXJyb3InLCBldnQpO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUudW5yZWdpc3RlckNhbGxiYWNrcyA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykpe1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgdGhpcy5fc29ja2V0T3BlbkNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cdH0gZWxzZSBpZih0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlQWxsTGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSl7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycygpO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gVXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY3JlYXRlTWVzc2FnZSA9IGZ1bmN0aW9uKHBhcmFtcywgdHlwZSl7XG5cdGlmKCFwYXJhbXMgfHwgIXR5cGUgfHwgKHR5cGUgIT09IFwiUmVxdWVzdFwiICYmIHR5cGUgIT09IFwiU3Vic2NyaXB0aW9uXCIgJiYgdHlwZSAhPT0gXCJVbnN1YnNjcmliZVwiKSl7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IHR5cGUsXG5cdFx0aWQ6IHRoaXMuX2dlbmVyYXRlSWQoKSxcblx0XHRzZXJ2aWNlOiBwYXJhbXMuc2VydmljZSxcblx0XHR0YXJnZXQ6IHBhcmFtcy50YXJnZXQsXG5cdFx0ZnVuYzogcGFyYW1zLmZ1bmMsXG5cdFx0b2JqOiBwYXJhbXMub2JqLFxuXHRcdGRhdGE6IHBhcmFtcy5kYXRhXG5cdH07XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2dlbmVyYXRlSWQgPSBmdW5jdGlvbigpe1xuXHR2YXIgaWQgPSB0aGlzLl9uZXh0SWQ7XG5cdHRoaXMuX25leHRJZCsrO1xuXHRyZXR1cm4gaWQ7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBEaXlhTm9kZTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG52YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxudmFyIERpeWFOb2RlID0gcmVxdWlyZSgnLi9EaXlhTm9kZScpO1xuXG52YXIgSVBfUkVHRVggPSAvXigyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pXFwuKDI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPylcXC4oMjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLigyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pJC87XG5cbi8vLy8vLy8vLy8vLy8vXG4vLyAgRDEgQVBJICAvL1xuLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gbmV3SW5zdGFuY2UgKCkge1xuXG5cdHZhciBjb25uZWN0aW9uID0gbmV3IERpeWFOb2RlKCk7XG5cblx0dmFyIGQxaW5zdCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuXHRcdHJldHVybiBuZXcgRGl5YVNlbGVjdG9yKHNlbGVjdG9yLCBjb25uZWN0aW9uKTtcblx0fVxuXG5cdGQxaW5zdC5EaXlhTm9kZSA9IERpeWFOb2RlO1xuXHRkMWluc3QuRGl5YVNlbGVjdG9yID0gRGl5YVNlbGVjdG9yO1xuXG5cdGQxaW5zdC5jb25uZWN0ID0gZnVuY3Rpb24oYWRkciwgV1NvY2tldCl7XG5cdFx0cmV0dXJuIGNvbm5lY3Rpb24uY29ubmVjdChhZGRyLCBXU29ja2V0KTtcblx0fTtcblxuXHRkMWluc3QuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGNvbm5lY3Rpb24uZGlzY29ubmVjdCgpO1xuXHR9O1xuXG5cdGQxaW5zdC5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uKCkge1x0cmV0dXJuIGNvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKTt9O1xuXHRkMWluc3QucGVlcnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24ucGVlcnMoKTt9O1xuXHRkMWluc3Quc2VsZiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5zZWxmKCk7IH07XG5cdGQxaW5zdC5hZGRyID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLmFkZHIoKTsgfTtcblx0ZDFpbnN0LnVzZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24udXNlcigpOyB9O1xuXHRkMWluc3QucGFzcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5wYXNzKCk7IH07XG5cdGQxaW5zdC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24uYXV0aGVudGljYXRlZCgpOyB9O1xuXG5cdGQxaW5zdC5wYXJzZVBlZXIgPSBmdW5jdGlvbihhZGRyU3RyKSB7XG5cdFx0dmFyIHBlZXIgPSB7fTtcblxuXHRcdC8vIDxub3RoaW5nPiAtPiB3c3M6Ly9sb2NhbGhvc3QvYXBpXG5cdFx0aWYoIWFkZHJTdHIgfHwgYWRkclN0ciA9PT0gXCJcIikge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9sb2NhbGhvc3QvYXBpXCI7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL2xvY2FsaG9zdC9uZXRcIjtcblx0XHR9XG5cdFx0Ly8gMTIzNCAtPiB3czovL2xvY2FsaG9zdDoxMjM0XG5cdFx0ZWxzZSBpZigvXlswLTldKiQvLnRlc3QoYWRkclN0cikpIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3M6Ly9sb2NhbGhvc3Q6XCIrYWRkclN0cjtcblx0XHR9XG5cdFx0Ly8gMTAuNDIuMC4xIC0+IHdzczovLzEwLjQyLjAuMS9hcGlcblx0XHQvLyAgICAgICAgICAtPiB3c3M6Ly8xMC4yNC4wLjEvbmV0XG5cdFx0ZWxzZSBpZiAoSVBfUkVHRVgudGVzdChhZGRyU3RyKSkge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9cIithZGRyU3RyK1wiL2FwaVwiO1xuXHRcdFx0cGVlci5hZGRyTmV0ID0gXCJ3c3M6Ly9cIithZGRyU3RyK1wiL25ldFwiO1xuXHRcdH1cblx0XHQvLyAxMC40Mi4wLjE6MTIzNCAtPiB3czovLzEwLjQyLjAuMToxMjM0XG5cdCAgICAgICBcdGVsc2UgaWYgKElQX1JFR0VYLnRlc3QoYWRkclN0ci5zcGxpdCgnOicpWzBdKSAmJiAvXlswLTldKiQvLnRlc3QoYWRkclN0ci5zcGxpdCgnOicpWzFdKSkge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3czovL1wiK2FkZHJTdHI7XG5cdFx0fVxuXHRcdC8vIHdzczovL3NvbWVhZGRyZXNzLmNvbS9zdHVmZiAtPiB3c3M6Ly9zb21lYWRkcmVzcy5jb20vc3R1ZmZcblx0XHQvLyB3czovL3NvbWVhZGRyZXNzLmNvbS9zdHVmZiAtPiB3czovL3NvbWVhZGRyZXNzLmNvbS9zdHVmZlxuXHRcdGVsc2UgaWYgKGFkZHJTdHIuaW5kZXhPZihcIndzczovL1wiKSA9PT0gMCB8fCBhZGRyU3RyLmluZGV4T2YoXCJ3czovL1wiKSA9PT0gMCkge1xuXHRcdFx0cGVlci5hZGRyID0gYWRkclN0cjtcblx0XHR9XG5cdFx0Ly8gc29tZWRvbWFpbi9zb21lc2l0ZSAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvYXBpXG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvbmV0XG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAtPiBzb21lc2l0ZVxuXHRcdGVsc2UgaWYoYWRkclN0ci5zcGxpdCgnLycpLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9cIiArIGFkZHJTdHIgKyAnL2FwaSc7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL1wiICsgYWRkclN0ciArICcvbmV0Jztcblx0XHRcdHBlZXIubmFtZSA9IGFkZHJTdHIuc3BsaXQoJy8nKVsxXTtcblx0XHR9XG5cdFx0Ly8gc29tZWRvbWFpbi9zb21lc2l0ZS9hcGkgLT4gXCJ3c3M6Ly9zb21lZG9tYWluL3NvbWVzaXRlL2FwaVwiXG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICAgLT4gXCJ3c3M6Ly9zb21lZG9tYWluL3NvbWVzaXRlL25ldFwiXG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICAgLT4gc29tZXNpdGVcblx0XHRlbHNlIGlmKGFkZHJTdHIuc3BsaXQoJy8nKS5sZW5ndGggPT09IDMgJiYgYWRkclN0ci5zcGxpdCgnLycpWzJdID09PSBcImFwaVwiKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzczovL1wiK2FkZHJTdHI7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL1wiK2FkZHJTdHIuc3Vic3RyKDAsIGFkZHJTdHIubGVuZ3RoIC0gNCk7XG5cdFx0XHRwZWVyLm5hbWUgPSBhZGRyU3RyLnNwbGl0KCcvJylbMV07XG5cdFx0fVxuXHRcdC8vIHNvbWVzaXRlIC0+IFwid3NzOi8vcGFydG5lcmluZy1jbG91ZC5jb20vc29tZXNpdGUvYXBpXCJcblx0XHQvLyAgICAgICAgICAtPiBcIndzczovL3BhcnRuZXJpbmctY2xvdWQuY29tL3NvbWVzaXRlL25ldFwiXG5cdFx0Ly8gICAgICAgICAgLT4gc29tZXNpdGVcblx0XHRlbHNlIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3NzOi8vcGFydG5lcmluZy1jbG91ZC5jb20vXCIrYWRkclN0citcIi9hcGlcIjtcblx0XHRcdHBlZXIuYWRkck5ldCA9IFwid3NzOi8vcGFydG5lcmluZy1jbG91ZC5jb20vXCIrYWRkclN0citcIi9uZXRcIjtcblx0XHRcdHBlZXIubmFtZSA9IGFkZHJTdHI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBlZXI7XG5cdH07XG5cblxuXHQvKiogVHJ5IHRvIGNvbm5lY3QgdG8gdGhlIGdpdmVuIHNlcnZlcnMgbGlzdCBpbiB0aGUgbGlzdCBvcmRlciwgdW50aWwgZmluZGluZyBhbiBhdmFpbGFibGUgb25lICovXG5cdGQxaW5zdC50cnlDb25uZWN0ID0gZnVuY3Rpb24oc2VydmVycywgV1NvY2tldCl7XG5cdFx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRcdGZ1bmN0aW9uIHRjKGkpIHtcblx0XHRcdGQxaW5zdC5jb25uZWN0KHNlcnZlcnNbaV0sIFdTb2NrZXQpLnRoZW4oZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHNlcnZlcnNbaV0pO1xuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGQxaW5zdC5kaXNjb25uZWN0KCkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0aWYoaTxzZXJ2ZXJzLmxlbmd0aCkgc2V0VGltZW91dChmdW5jdGlvbigpIHt0YyhpKTt9LCAxMDApO1xuXHRcdFx0XHRcdGVsc2UgcmV0dXJuIGRlZmVycmVkLnJlamVjdChcIlRpbWVvdXRcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHRjKDApO1xuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHR9XG5cblx0ZDFpbnN0LmN1cnJlbnRTZXJ2ZXIgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBjb25uZWN0aW9uLl9hZGRyO1xuXHR9O1xuXG5cdGQxaW5zdC5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjayl7XG5cdFx0Y29ubmVjdGlvbi5vbihldmVudCwgY2FsbGJhY2spO1xuXHRcdHJldHVybiBkMWluc3Q7XG5cdH07XG5cblx0ZDFpbnN0LnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKXtcblx0XHRjb25uZWN0aW9uLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XG5cdFx0cmV0dXJuIGQxaW5zdDtcblx0fTtcblxuXHQvKiogU2hvcnRoYW5kIGZ1bmN0aW9uIHRvIGNvbm5lY3QgYW5kIGxvZ2luIHdpdGggdGhlIGdpdmVuICh1c2VyLHBhc3N3b3JkKSAqL1xuXHRkMWluc3QuY29ubmVjdEFzVXNlciA9IGZ1bmN0aW9uKGlwLCB1c2VyLCBwYXNzd29yZCwgV1NvY2tldCkge1xuXHRcdHJldHVybiBkMWluc3QuY29ubmVjdChpcCwgV1NvY2tldCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIGQxaW5zdChcIiNzZWxmXCIpLmF1dGgodXNlciwgcGFzc3dvcmQpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdGQxaW5zdC5kZWF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uKCl7IGNvbm5lY3Rpb24uYXV0aGVudGljYXRlZChmYWxzZSk7IGNvbm5lY3Rpb24udXNlcihudWxsKTsgY29ubmVjdGlvbi5wYXNzKG51bGwpO307XG5cdGQxaW5zdC5zZXRTZWN1cmVkID0gZnVuY3Rpb24oYlNlY3VyZWQpIHsgY29ubmVjdGlvbi5zZXRTZWN1cmVkKGJTZWN1cmVkKTsgfTtcblx0ZDFpbnN0LmlzU2VjdXJlZCA9IGZ1bmN0aW9uKCkge3JldHVybiBjb25uZWN0aW9uLl9zZWN1cmVkOyB9XG5cdGQxaW5zdC5zZXRXU29ja2V0ID0gZnVuY3Rpb24oV1NvY2tldCkgeyBjb25uZWN0aW9uLnNldFdTb2NrZXQoV1NvY2tldCk7IH1cblxuXG5cdC8qKiBTZWxmLWF1dGhlbnRpY2F0ZSB0aGUgbG9jYWwgRGl5YU5vZGUgYm91bmQgdG8gcG9ydCA8cG9ydD4sIHVzaW5nIGl0cyBSU0Egc2lnbmF0dXJlICovXG5cdGQxaW5zdC5zZWxmQ29ubmVjdCA9IGZ1bmN0aW9uKHBvcnQsIHNpZ25hdHVyZSwgV1NvY2tldCkge1xuXHRcdHJldHVybiBkMWluc3QuY29ubmVjdCgnd3M6Ly9sb2NhbGhvc3Q6JyArIHBvcnQsIFdTb2NrZXQpXG5cdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdFx0XHRkMWluc3QoXCIjc2VsZlwiKS5yZXF1ZXN0KHtcblx0XHRcdFx0c2VydmljZTogJ3BlZXJBdXRoJyxcblx0XHRcdFx0ZnVuYzogJ1NlbGZBdXRoZW50aWNhdGUnLFxuXHRcdFx0XHRkYXRhOiB7XHRzaWduYXR1cmU6IHNpZ25hdHVyZSB9XG5cdFx0XHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cdFx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0XHRpZihkYXRhICYmIGRhdGEuYXV0aGVudGljYXRlZCl7XG5cdFx0XHRcdFx0Y29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKHRydWUpO1xuXHRcdFx0XHRcdGNvbm5lY3Rpb24udXNlcihcIiNEaXlhTm9kZSNcIitwZWVySWQpO1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25uZWN0aW9uLmF1dGhlbnRpY2F0ZWQoZmFsc2UpO1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdCgnQWNjZXNzRGVuaWVkJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gZDFpbnN0O1xufVxuXG52YXIgZDEgPSBuZXdJbnN0YW5jZSgpO1xuZDEubmV3SW5zdGFuY2UgPSBuZXdJbnN0YW5jZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gRGl5YVNlbGVjdG9yIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gRGl5YVNlbGVjdG9yKHNlbGVjdG9yLCBjb25uZWN0aW9uKXtcblx0RXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cblx0dGhpcy5fY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG5cdHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG5cdHRoaXMuX2xpc3RlbmVyQ291bnQgPSAwO1xuXHR0aGlzLl9saXN0ZW5DYWxsYmFjayA9IG51bGw7XG5cdHRoaXMuX2NhbGxiYWNrQXR0YWNoZWQgPSBmYWxzZTtcbn1cbmluaGVyaXRzKERpeWFTZWxlY3RvciwgRXZlbnRFbWl0dGVyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFB1YmxpYyBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9zZWxlY3QoKTsgfTtcblxuXG5cbi8qKlxuICogQXBwbHkgY2FsbGJhY2sgY2IgdG8gZWFjaCBzZWxlY3RlZCBwZWVyLiBQZWVycyBhcmUgc2VsZWN0ZWRcbiAqIGFjY29yZGluZyB0byB0aGUgcnVsZSAnc2VsZWN0b3InIGdpdmVuIHRvIGNvbnN0cnVjdG9yLiBTZWxlY3RvciBjYW5cbiAqIGJlIGEgcGVlcklkLCBhIHJlZ0V4IGZvciBwZWVySWRzIG9mIGFuIGFycmF5IG9mIHBlZXJJZHMuXG4gKiBAcGFyYW1zIFx0Y2JcdFx0Y2FsbGJhY2sgdG8gYmUgYXBwbGllZFxuICogQHJldHVybiBcdHRoaXMgXHQ8RGl5YVNlbGVjdG9yPlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihjYil7XG5cdHZhciBwZWVycyA9IHRoaXMuX3NlbGVjdCgpO1xuXHRmb3IodmFyIGk9MDsgaTxwZWVycy5sZW5ndGg7IGkrKykgY2IuYmluZCh0aGlzKShwZWVyc1tpXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIHJlcXVlc3QgdG8gc2VsZWN0ZWQgcGVlcnMgKCBzZWUgZWFjaCgpICkgdGhyb3VnaCB0aGUgY3VycmVudCBjb25uZWN0aW9uIChEaXlhTm9kZSkuXG4gKiBAcGFyYW0ge1N0cmluZyB8IE9iamVjdH0gcGFyYW1zIDogY2FuIGJlIHNlcnZpY2UuZnVuY3Rpb24gb3Ige3NlcnZpY2U6c2VydmljZSwgZnVuYzpmdW5jdGlvbiwgLi4ufVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrLCB0aW1lb3V0LCBvcHRpb25zKXtcblx0aWYoIXRoaXMuX2Nvbm5lY3Rpb24pIHJldHVybiB0aGlzO1xuXHRpZighb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHR2YXIgbmJBbnN3ZXJzID0gMDtcblx0dmFyIG5iRXhwZWN0ZWQgPSB0aGlzLl9zZWxlY3QoKS5sZW5ndGg7XG5cdGlmIChuYkV4cGVjdGVkID09PSAwICYmIG9wdGlvbnMuYk5vdGlmeVdoZW5GaW5pc2hlZCkgY2FsbGJhY2sobnVsbCwgbnVsbCwgXCIjI0VORCMjXCIpO1xuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKHBlZXJJZCl7XG5cdFx0cGFyYW1zLnRhcmdldCA9IHBlZXJJZDtcblxuXHRcdHZhciBvcHRzID0ge307XG5cdFx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIG9wdHNbaV0gPSBvcHRpb25zW2ldO1xuXHRcdGlmKHR5cGVvZiBvcHRzLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIG9wdHMuY2FsbGJhY2tfcGFydGlhbCA9IGZ1bmN0aW9uKGVyciwgZGF0YSl7IG9wdGlvbnMuY2FsbGJhY2tfcGFydGlhbChwZWVySWQsIGVyciwgZGF0YSk7fVxuXG5cdFx0dGhpcy5fY29ubmVjdGlvbi5yZXF1ZXN0KHBhcmFtcywgZnVuY3Rpb24oZXJyLCBkYXRhKXtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpO1xuXHRcdFx0bmJBbnN3ZXJzKys7XG5cdFx0XHRpZihuYkFuc3dlcnMgPT0gbmJFeHBlY3RlZCAmJiBvcHRpb25zLmJOb3RpZnlXaGVuRmluaXNoZWQpIGNhbGxiYWNrKG51bGwsIGVyciwgXCIjI0VORCMjXCIpOyAvLyBUT0RPIDogRmluZCBhIGJldHRlciB3YXkgdG8gbm90aWZ5IHJlcXVlc3QgRU5EICEhXG5cdFx0fSwgdGltZW91dCwgb3B0cyk7XG5cdH0pO1xufTtcblxuXG4vLyBJTVBPUlRBTlQgISEhIEJ5IDMwLzExLzE1LCB0aGlzIG1ldGhvZCBkb2Vzbid0IHJldHVybiAndGhpcycgYW55bW9yZSwgYnV0IGEgU3Vic2NyaXB0aW9uIG9iamVjdCBpbnN0ZWFkXG4vKiBAcGFyYW0ge1N0cmluZyB8IE9iamVjdH0gcGFyYW1zIDogY2FuIGJlICdzZXJ2aWNlLmZ1bmN0aW9uJyBvciB7c2VydmljZTpzZXJ2aWNlLCBmdW5jOmZ1bmN0aW9uLCAuLi59ICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpe1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFN1YnNjcmlwdGlvbic7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdHJldHVybiBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpO1xufTtcblxuXG4vLyBJTVBPUlRBTlQgISEhIEJZIDMwLzExLzE1LCB0aGlzIG1ldGhvZCBkb2Vzbid0IHRha2Ugc3ViSWRzIGFzIGlucHV0IGFueW1vcmUuXG4vLyBQbGVhc2UgcHJvdmlkZSBhIHN1YnNjcmlwdGlvbiBpbnN0ZWFkICFcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24pe1xuXHRpZihBcnJheS5pc0FycmF5KHN1YnNjcmlwdGlvbikgfHwgIXN1YnNjcmlwdGlvbi5jbG9zZSkgcmV0dXJuIHRoaXMuX19vbGRfZGVwcmVjYXRlZF91bnN1YnNjcmliZShzdWJzY3JpcHRpb24pO1xuXHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG59O1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzd29yZCwgY2FsbGJhY2ssIHRpbWVvdXQpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXMpO1xuXG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdhdXRoJyxcblx0XHRmdW5jOiAnQXV0aGVudGljYXRlJyxcblx0XHRkYXRhOiB7XG5cdFx0XHR1c2VyOiB1c2VyLCAvLyBERVBSRUNBVEVELCBrZXB0IGZvciBub3cgZm9yIGJhY2t3YXJkIGNvbXBhdGlibGl0eSAod2lsbCBiZSBkcm9wcGVkKVxuXHRcdFx0dXNlcm5hbWU6IHVzZXIsIC8vIE5ldyBzeW50YXggc2luY2Ugc3dpdGNoaW5nIHRvIERCdXNcblx0XHRcdHBhc3N3b3JkOiBwYXNzd29yZFxuXHRcdH1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXG5cdFx0aWYoZXJyID09PSAnU2VydmljZU5vdEZvdW5kJyl7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHQvLyBkYXRhLmF1dGhlbnRpY2F0ZWQgaXMgREVQUkVDQVRFRCwga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuXHRcdGlmKCFlcnIgJiYgZGF0YSAmJiAoZGF0YSA9PT0gdHJ1ZSB8fCBkYXRhLmF1dGhlbnRpY2F0ZWQgPT09IHRydWUpKXtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24uYXV0aGVudGljYXRlZCh0cnVlKTtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24udXNlcih1c2VyKTtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24ucGFzcyhwYXNzd29yZCk7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlc29sdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhhdC5fY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKGZhbHNlKTtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdCgnQWNjZXNzRGVuaWVkJyk7XG5cdFx0fVxuXG5cdH0sIHRpbWVvdXQpO1xuXG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuXG5cbi8vIFByaXZhdGVzXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3NlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdG9yRnVuY3Rpb24pe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0aWYoIXRoaXMuX2Nvbm5lY3Rpb24pIHJldHVybiBbXTtcblx0cmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24ucGVlcnMoKS5maWx0ZXIoZnVuY3Rpb24ocGVlcklkKXtcblx0XHRyZXR1cm4gdGhhdC5fbWF0Y2godGhhdC5fc2VsZWN0b3IsIHBlZXJJZCk7XG5cdH0pO1xufTtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fbWF0Y2ggPSBmdW5jdGlvbihzZWxlY3Rvciwgc3RyKXtcblx0aWYoIXNlbGVjdG9yKSByZXR1cm4gZmFsc2U7XG5cdGlmKHNlbGVjdG9yID09PSBcIiNzZWxmXCIpIHsgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24gJiYgc3RyID09PSB0aGlzLl9jb25uZWN0aW9uLnNlbGYoKTsgfVxuXHRlbHNlIGlmKHNlbGVjdG9yLm5vdCkgcmV0dXJuICF0aGlzLl9tYXRjaChzZWxlY3Rvci5ub3QsIHN0cik7XG5cdGVsc2UgaWYoc2VsZWN0b3IuY29uc3RydWN0b3IubmFtZSA9PT0gJ1N0cmluZycpe1xuXHRcdHJldHVybiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKTtcblx0fSBlbHNlIGlmKHNlbGVjdG9yLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdSZWdFeHAnKXtcblx0XHRyZXR1cm4gbWF0Y2hSZWdFeHAoc2VsZWN0b3IsIHN0cik7XG5cdH0gZWxzZSBpZihBcnJheS5pc0FycmF5KHNlbGVjdG9yKSl7XG5cdFx0cmV0dXJuIG1hdGNoQXJyYXkoc2VsZWN0b3IsIHN0cik7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKXtcblx0cmV0dXJuIHNlbGVjdG9yID09PSBzdHI7XG59XG5cbmZ1bmN0aW9uIG1hdGNoUmVnRXhwKHNlbGVjdG9yLCBzdHIpe1xuXHRyZXR1cm4gc3RyLm1hdGNoKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hBcnJheShzZWxlY3Rvciwgc3RyKXtcblx0Zm9yKHZhciBpPTA7aTxzZWxlY3Rvci5sZW5ndGg7IGkrKyl7XG5cdFx0aWYoc2VsZWN0b3JbaV0gPT09IHN0cikgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG4vLyBPdmVycmlkZXMgRXZlbnRFbWl0dGVyJ3MgYmVoYXZpb3IgdG8gcHJveHkgYW5kIGZpbHRlciBldmVudHMgZnJvbSB0aGUgY29ubmVjdGlvblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fb24gPSBEaXlhU2VsZWN0b3IucHJvdG90eXBlLm9uO1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0XHRpZih0aGF0Ll9tYXRjaCh0aGF0Ll9zZWxlY3RvciwgcGVlcklkKSkgdGhhdC5lbWl0KHR5cGUsIHBlZXJJZCk7XG5cdH07XG5cdHRoaXMuX2Nvbm5lY3Rpb24ub24odHlwZSwgY2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyKTtcblx0dmFyIHJldCA9IHRoaXMuX29uKHR5cGUsIGNhbGxiYWNrKTtcblxuXHQvLyBIYW5kbGUgdGhlIHNwZWNpZmljIGNhc2Ugb2YgXCJwZWVyLWNvbm5lY3RlZFwiIGV2ZW50cywgaS5lLiwgbm90aWZ5IG9mIGFscmVhZHkgY29ubmVjdGVkIHBlZXJzXG5cdGlmKHR5cGUgPT09ICdwZWVyLWNvbm5lY3RlZCcgJiYgdGhpcy5fY29ubmVjdGlvbi5pc0Nvbm5lY3RlZCgpKSB7XG5cdFx0dmFyIHBlZXJzID0gdGhpcy5fY29ubmVjdGlvbi5wZWVycygpO1xuXHRcdGZvcih2YXIgaT0wO2k8cGVlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmKHRoaXMuX21hdGNoKHRoaXMuX3NlbGVjdG9yLCBwZWVyc1tpXSkpIGNhbGxiYWNrKHBlZXJzW2ldKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJldDtcbn07XG5cblxuLy8gT3ZlcnJpZGVzIEV2ZW50RW1pdHRlcidzIGJlaGF2aW9yIHRvIHByb3h5IGFuZCBmaWx0ZXIgZXZlbnRzIGZyb20gdGhlIGNvbm5lY3Rpb25cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3JlbW92ZUxpc3RlbmVyID0gRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaykge1xuXHRpZihjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpIHRoaXMuX2Nvbm5lY3Rpb24ucmVtb3ZlTGlzdGVuZXIodHlwZSwgY2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyKTtcblx0dGhpcy5fcmVtb3ZlTGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU1VCU0NSSVBUSU9OIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4vKipcbiogSGFuZGxlcyBhIHN1YnNjcmlwdGlvbiB0byBzb21lIERpeWFOb2RlIHNlcnZpY2UgZm9yIG11bHRpcGxlIG5vZGVzXG4qIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gc2VsZWN0b3JcbiovXG5mdW5jdGlvbiBTdWJzY3JpcHRpb24oc2VsZWN0b3IsIHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHRcdHRoaXMucGFyYW1zID0gcGFyYW1zO1xuXHRcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuc3ViSWRzID0gW107XG5cblx0XHR0aGlzLmRvU3Vic2NyaWJlID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdFx0XHR0aGF0LnN1Yklkcy5wdXNoKHRoYXQuX2FkZFN1YnNjcmlwdGlvbihwZWVySWQpKTtcblx0XHRcdHRoYXQuc3RhdGUgPSBcIm9wZW5cIjtcblx0XHR9O1xuXG5cdFx0aWYodGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5hdXRvKSB7XG5cdFx0XHR0aGlzLnNlbGVjdG9yLm9uKCdwZWVyLWNvbm5lY3RlZCcsIHRoaXMuZG9TdWJzY3JpYmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNlbGVjdG9yLmVhY2godGhpcy5kb1N1YnNjcmliZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG59O1xuXG5TdWJzY3JpcHRpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGZvcih2YXIgaSA9IDA7IGk8dGhpcy5zdWJJZHMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLnNlbGVjdG9yLl9jb25uZWN0aW9uLnVuc3Vic2NyaWJlKHRoaXMuc3ViSWRzW2ldKTtcblx0fVxuXHR0aGlzLnN1YklkcyA9IFtdO1xuXHR0aGlzLnNlbGVjdG9yLnJlbW92ZUxpc3RlbmVyKCdwZWVyLWNvbm5lY3RlZCcsIHRoaXMuZG9TdWJzY3JpYmUpO1xuXHR0aGlzLnN0YXRlID0gXCJjbG9zZWRcIjtcbn07XG5cblN1YnNjcmlwdGlvbi5wcm90b3R5cGUuX2FkZFN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBwYXJhbXMgPSB7fTtcblx0Zm9yKHZhciBrIGluIHRoaXMucGFyYW1zKSBwYXJhbXNba10gPSB0aGlzLnBhcmFtc1trXTtcblx0cGFyYW1zLnRhcmdldCA9IHBlZXJJZDtcblx0dmFyIHN1YklkID0gdGhpcy5zZWxlY3Rvci5fY29ubmVjdGlvbi5zdWJzY3JpYmUocGFyYW1zLCBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRcdHRoYXQuY2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpO1xuXHR9KTtcblx0aWYodGhpcy5vcHRpb25zICYmIEFycmF5LmlzQXJyYXkodGhpcy5vcHRpb25zLnN1YklkcykpXG5cdFx0dGhpcy5vcHRpb25zLnN1Yklkc1twZWVySWRdID0gc3ViSWQ7XG5cdHJldHVybiBzdWJJZDtcbn07XG5cblxuXG5cblxuLy8gTGVnYWN5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuLyoqIEBkZXByZWNhdGVkICAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbigpe307XG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX19vbGRfZGVwcmVjYXRlZF91bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1Yklkcykge1xuXHR0aGlzLmVhY2goZnVuY3Rpb24ocGVlcklkKXtcblx0XHR2YXIgc3ViSWQgPSBzdWJJZHNbcGVlcklkXTtcblx0XHRpZihzdWJJZCkgdGhpcy5fY29ubmVjdGlvbi51bnN1YnNjcmliZShzdWJJZCk7XG5cdH0pO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gZDE7XG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxudmFyIGQxID0gcmVxdWlyZSgnLi9EaXlhU2VsZWN0b3IuanMnKTtcblxucmVxdWlyZSgnLi9zZXJ2aWNlcy9ydGMvcnRjLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL2llcS9pZXEuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvY29uZmlnL2NvbmZpZy5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9wZWVyQXV0aC9QZWVyQXV0aC5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9tZXNoTmV0d29yay9NZXNoTmV0d29yay5qcycpO1xucmVxdWlyZSgnLi91dGlscy9lbmNvZGluZy9lbmNvZGluZy5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9zdGF0dXMvc3RhdHVzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZDE7XG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cblxuLyogbWF5YS1jbGllbnRcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqXHQzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IHRydWU7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8qKlxuICogQ29uZmlnIEFQSSBoYW5kbGVyXG4gKi9cbmZ1bmN0aW9uIENvbmZpZyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTGlzdCBhbGwgYXZhaWxhYmxlIGtleXNcbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlIHdpdGggcGFyYW1zICh7QXJyYXk8U3RyaW5nPn0gbGlzdCwge0Vycm9yfSBlcnJvcilcbiAqL1xuQ29uZmlnLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJjb25maWdNYW5hZ2VyXCIsXG5cdFx0ZnVuYzogXCJMaXN0XCJcblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdGlmICh0eXBlb2YgZXJyID09XCJzdHJpbmdcIikgTG9nZ2VyLmVycm9yKGRuSWQrXCIgc2VudCBlcnJvcjogXCIrIGVycik7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZXJyID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGVyci5uYW1lID09J3N0cmluZycpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZXJyLm5hbWUpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGVyci5tZXNzYWdlPT1cInN0cmluZ1wiKSBMb2dnZXIuZXJyb3IoZG5JZCtcIiBzZW50IGVycm9yOiBcIitlcnIubWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNhbGxiYWNrKGRhdGEpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xuXG59O1xuXG4vKipcbiAqIFNldCBjb25maWcgZm9yIGdpdmVuIGtleVxuICogQHBhcmFtIHtTdHJpbmd9IGtleSA6IGtleSB0byB3aGljaCBpcyBhc3NvY2lhdGVkIHRoZSBjb25maWcgdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgOiBjb25maWd1cmF0aW9uIHRvIGJlIHN0b3JlZFxuICovXG5Db25maWcucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGtleSxjb25maWcpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJjb25maWdNYW5hZ2VyXCIsXG5cdFx0ZnVuYzogXCJTZXRcIixcblx0XHRkYXRhOiBjb25maWcsXG5cdFx0b2JqOiBrZXlcblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdGlmICh0eXBlb2YgZXJyID09XCJzdHJpbmdcIikgTG9nZ2VyLmVycm9yKGRuSWQrXCIgc2VudCBlcnJvcjogXCIrIGVycik7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZXJyID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGVyci5uYW1lID09J3N0cmluZycpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlcnIubWVzc2FnZT09XCJzdHJpbmdcIikgTG9nZ2VyLmVycm9yKGRuSWQrXCIgc2VudCBlcnJvcjogXCIrZXJyLm1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fSk7XG5cbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIGtleSB0byBzZWxlY3QgY29uZmlndXJhdGlvbiB0byBiZSB3YXRjaGVkXG4gKiBAcGFyYW0gIGNhbGxiYWNrIGNhbGxlZCBvbiBhbnN3ZXJzIChAcGFyYW0gOiB7T2JqZWN0fSBjb25maWd1cmF0aW9uIClcbiAqL1xuQ29uZmlnLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKGtleSwgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIHN1YnMgPSB0aGlzLnNlbGVjdG9yLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogXCJjb25maWdNYW5hZ2VyXCIsXG5cdFx0ZnVuYzogXCJDb25maWdcIixcblx0XHRvYmo6IGtleVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0aWYgKHR5cGVvZiBlcnIgPT0gXCJzdHJpbmdcIikgTG9nZ2VyLmVycm9yKGRuSWQrXCIgc2VudCBlcnJvcjogXCIrIGVycik7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZXJyID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGVyci5uYW1lID09J3N0cmluZycpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlcnIubWVzc2FnZT09XCJzdHJpbmdcIikgTG9nZ2VyLmVycm9yKGRuSWQrXCIgc2VudCBlcnJvcjogXCIrZXJyLm1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0dGhhdC5jbG9zZVN1YnNjcmlwdGlvbnMoKTsgLy8gc2hvdWxkIG5vdCBiZSBuZWNlc3Nhcnlcblx0XHRcdHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID0gdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2QrMTAwMHx8MTAwMDsgLy8gaW5jcmVhc2UgZGVsYXkgYnkgMSBzZWNcblx0XHRcdGlmKHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID4gMzAwMDAwKSB0aGF0LnN1YnNjcmlwdGlvblJlcVBlcmlvZD0zMDAwMDA7IC8vIG1heCA1bWluXG5cdFx0XHRzdWJzLndhdGNoVGVudGF0aXZlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcdHRoYXQud2F0Y2goa2V5LGNhbGxiYWNrKTsgfSwgdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2QpOyAvLyB0cnkgYWdhaW4gbGF0ZXJcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2Q9MDsgLy8gcmVzZXQgcGVyaW9kIG9uIHN1YnNjcmlwdGlvbiByZXF1ZXN0c1xuXHRcdGNhbGxiYWNrKGRhdGEudmFsdWUpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnMpO1xufTtcblxuLyoqXG4gKiBDbG9zZSBhbGwgc3Vic2NyaXB0aW9uc1xuICovXG5Db25maWcucHJvdG90eXBlLmNsb3NlU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgaSBpbiB0aGlzLnN1YnNjcmlwdGlvbnMpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaV0uY2xvc2UoKTtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5zdWJzY3JpcHRpb25zW2ldLndhdGNoVGVudGF0aXZlKTtcblx0fVxuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPVtdO1xufTtcblxuXG5cbi8qKiBjcmVhdGUgQ29uZmlnIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLkNvbmZpZyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgQ29uZmlnKHRoaXMpO1xufTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG4vKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuLyoqXG4gICBUb2RvIDpcbiAgIGNoZWNrIGVyciBmb3IgZWFjaCBkYXRhXG4gICBpbXByb3ZlIEFQSSA6IGdldERhdGEoc2Vuc29yTmFtZSwgZGF0YUNvbmZpZylcbiAgIHVwZGF0ZURhdGEoc2Vuc29yTmFtZSwgZGF0YUNvbmZpZylcbiAgIHNldCBhbmQgZ2V0IGZvciB0aGUgZGlmZmVyZW50IGRhdGFDb25maWcgcGFyYW1zXG5cbiovXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IHRydWU7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8qKlxuICogSUVRIEFQSSBoYW5kbGVyXG4gKi9cbmZ1bmN0aW9uIElFUShzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLmRhdGFNb2RlbD17fTtcblx0dGhpcy5fY29kZXIgPSBzZWxlY3Rvci5lbmNvZGUoKTtcblx0dGhpcy5zdWJzY3JpcHRpb25zID0gW107XG4vL1x0dGhhdC5zdWJzY3JpcHRpb25FcnJvck51bSA9IDA7XG5cblx0LyoqKiBzdHJ1Y3R1cmUgb2YgZGF0YSBjb25maWcuIFtdIG1lYW5zIGRlZmF1bHQgdmFsdWUgKioqXG5cdFx0IGNyaXRlcmlhIDpcblx0XHQgICB0aW1lOiBhbGwgMyB0aW1lIGNyaXRlcmlhIHNob3VsZCBub3QgYmUgZGVmaW5lZCBhdCB0aGUgc2FtZSB0aW1lLiAocmFuZ2Ugd291bGQgYmUgZ2l2ZW4gdXApXG5cdFx0ICAgICBzdGFydDoge1tudWxsXSx0aW1lfSAobnVsbCBtZWFucyBtb3N0IHJlY2VudCkgLy8gc3RvcmVkIGEgVVRDIGluIG1zIChudW0pXG5cdFx0ICAgICBlbmQ6IHtbbnVsbF0sIHRpbWV9IChudWxsIG1lYW5zIG1vc3Qgb2xkZXN0KSAvLyBzdG9yZWQgYXMgVVRDIGluIG1zIChudW0pXG5cdFx0ICAgICByYW5nZToge1tudWxsXSwgdGltZX0gKHJhbmdlIG9mIHRpbWUocG9zaXRpdmUpICkgLy8gaW4gcyAobnVtKVxuXHRcdCAgIHJvYm90OiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0ICAgcGxhY2U6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgb3BlcmF0b3I6IHtbbGFzdF0sIG1heCwgbW95LCBzZH0gLSBkZXByZWNhdGVkXG5cdFx0IC4uLlxuXG5cdFx0IHNlbnNvcnMgOiB7W251bGxdIG9yIEFycmF5T2YgU2Vuc29yTmFtZX1cblxuXHRcdCBzYW1wbGluZzoge1tudWxsXSBvciBpbnR9IC0gZGVwcmVjYXRlZFxuXHQqL1xuXHR0aGlzLmRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHtcblx0XHRcdFx0c3RhcnQ6IG51bGwsXG5cdFx0XHRcdGVuZDogbnVsbCxcblx0XHRcdFx0cmFuZ2U6IG51bGwgLy8gaW4gc1xuXHRcdFx0fSxcblx0XHRcdHJvYm90OiBudWxsLFxuXHRcdFx0cGxhY2U6IG51bGxcblx0XHR9LFxuXHRcdG9wZXJhdG9yOiAnbGFzdCcsXG5cdFx0c2Vuc29yczogbnVsbCxcblx0XHRzYW1wbGluZzogbnVsbCAvL3NhbXBsaW5nXG5cdH07XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBkYXRhTW9kZWwgOlxuICoge1xuICpcdFwic2Vuc2V1clhYXCI6IHtcbiAqXHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHRpbWU6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRyb2JvdDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHBsYWNlOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cXVhbGl0eUluZGV4OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cmFuZ2U6IFtGTE9BVCwgRkxPQVRdLFxuICpcdFx0XHR1bml0OiBzdHJpbmcsXG4gKlx0XHRsYWJlbDogc3RyaW5nXG4gKlx0XHR9LFxuICpcdCAuLi4gKFwic2Vuc2V1cnNZWVwiKVxuICogfVxuICovXG5JRVEucHJvdG90eXBlLmdldERhdGFNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmRhdGFNb2RlbDtcbn07XG5JRVEucHJvdG90eXBlLmdldERhdGFSYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmRhdGFNb2RlbC5yYW5nZTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFDb25maWcgY29uZmlnIGZvciBkYXRhIHJlcXVlc3RcbiAqIGlmIGRhdGFDb25maWcgaXMgZGVmaW5lIDogc2V0IGFuZCByZXR1cm4gdGhpc1xuICpcdCBAcmV0dXJuIHtJRVF9IHRoaXNcbiAqIGVsc2VcbiAqXHQgQHJldHVybiB7T2JqZWN0fSBjdXJyZW50IGRhdGFDb25maWdcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhQ29uZmlnID0gZnVuY3Rpb24obmV3RGF0YUNvbmZpZyl7XG5cdGlmKG5ld0RhdGFDb25maWcpIHtcblx0XHR0aGlzLmRhdGFDb25maWc9bmV3RGF0YUNvbmZpZztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZztcbn07XG4vKipcbiAqIFRPIEJFIElNUExFTUVOVEVEIDogb3BlcmF0b3IgbWFuYWdlbWVudCBpbiBETi1JRVFcbiAqIEBwYXJhbSAge1N0cmluZ31cdCBuZXdPcGVyYXRvciA6IHtbbGFzdF0sIG1heCwgbW95LCBzZH1cbiAqIEByZXR1cm4ge0lFUX0gdGhpcyAtIGNoYWluYWJsZVxuICogU2V0IG9wZXJhdG9yIGNyaXRlcmlhLlxuICogRGVwZW5kcyBvbiBuZXdPcGVyYXRvclxuICpcdEBwYXJhbSB7U3RyaW5nfSBuZXdPcGVyYXRvclxuICpcdEByZXR1cm4gdGhpc1xuICogR2V0IG9wZXJhdG9yIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge1N0cmluZ30gb3BlcmF0b3JcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhT3BlcmF0b3IgPSBmdW5jdGlvbihuZXdPcGVyYXRvcil7XG5cdGlmKG5ld09wZXJhdG9yKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yID0gbmV3T3BlcmF0b3I7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcub3BlcmF0b3I7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIG51bVNhbXBsZXNcbiAqIEBwYXJhbSB7aW50fSBudW1iZXIgb2Ygc2FtcGxlcyBpbiBkYXRhTW9kZWxcbiAqIGlmIGRlZmluZWQgOiBzZXQgbnVtYmVyIG9mIHNhbXBsZXNcbiAqXHRAcmV0dXJuIHtJRVF9IHRoaXNcbiAqIGVsc2VcbiAqXHRAcmV0dXJuIHtpbnR9IG51bWJlciBvZiBzYW1wbGVzXG4gKiovXG5JRVEucHJvdG90eXBlLkRhdGFTYW1wbGluZyA9IGZ1bmN0aW9uKG51bVNhbXBsZXMpe1xuXHRpZihudW1TYW1wbGVzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLnNhbXBsaW5nID0gbnVtU2FtcGxlcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZztcbn07XG4vKipcbiAqIFNldCBvciBnZXQgZGF0YSB0aW1lIGNyaXRlcmlhIHN0YXJ0IGFuZCBlbmQuXG4gKiBJZiBwYXJhbSBkZWZpbmVkXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lU3RhcnQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVFbmQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcmV0dXJuIHtJRVF9IHRoaXNcbiAqIElmIG5vIHBhcmFtIGRlZmluZWQ6XG4gKlx0QHJldHVybiB7T2JqZWN0fSBUaW1lIG9iamVjdDogZmllbGRzIHN0YXJ0IGFuZCBlbmQuXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YVRpbWUgPSBmdW5jdGlvbihuZXdUaW1lU3RhcnQsbmV3VGltZUVuZCwgbmV3UmFuZ2Upe1xuXHRpZihuZXdUaW1lU3RhcnQgfHwgbmV3VGltZUVuZCB8fCBuZXdSYW5nZSkge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnN0YXJ0ID0gbmV3VGltZVN0YXJ0LmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5lbmQgPSBuZXdUaW1lRW5kLmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5yYW5nZSA9IG5ld1JhbmdlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4ge1xuXHRcdFx0c3RhcnQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnN0YXJ0KSxcblx0XHRcdGVuZDogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuZW5kKSxcblx0XHRcdHJhbmdlOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5yYW5nZSlcblx0XHR9O1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiByb2JvdElkc1xuICogU2V0IHJvYm90IGNyaXRlcmlhLlxuICpcdEBwYXJhbSB7QXJyYXlbSW50XX0gcm9ib3RJZHMgbGlzdCBvZiByb2JvdCBJZHNcbiAqIEdldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtBcnJheVtJbnRdfSBsaXN0IG9mIHJvYm90IElkc1xuICovXG5JRVEucHJvdG90eXBlLkRhdGFSb2JvdElkcyA9IGZ1bmN0aW9uKHJvYm90SWRzKXtcblx0aWYocm9ib3RJZHMpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3QgPSByb2JvdElkcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5yb2JvdDtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcGxhY2VJZHNcbiAqIFNldCBwbGFjZSBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHBsYWNlSWRzIGxpc3Qgb2YgcGxhY2UgSWRzXG4gKiBHZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiBwbGFjZSBJZHNcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhUGxhY2VJZHMgPSBmdW5jdGlvbihwbGFjZUlkcyl7XG5cdGlmKHBsYWNlSWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnBsYWNlSWQgPSBwbGFjZUlkcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZTtcbn07XG4vKipcbiAqIEdldCBkYXRhIGJ5IHNlbnNvciBuYW1lLlxuICpcdEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gc2Vuc29yTmFtZSBsaXN0IG9mIHNlbnNvcnNcbiAqL1xuXG5cblxuSUVRLnByb3RvdHlwZS5nZXREYXRhQnlOYW1lID0gZnVuY3Rpb24oc2Vuc29yTmFtZXMpe1xuXHR2YXIgZGF0YT1bXTtcblx0Zm9yKHZhciBuIGluIHNlbnNvck5hbWVzKSB7XG5cdFx0ZGF0YS5wdXNoKHRoaXMuZGF0YU1vZGVsW3NlbnNvck5hbWVzW25dXSk7XG5cdH1cblx0cmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBkYXRhIGdpdmVuIGRhdGFDb25maWcuXG4gKiBAcGFyYW0ge2Z1bmN9IGNhbGxiYWNrIDogY2FsbGVkIGFmdGVyIHVwZGF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFDb25maWc6IGRhdGEgdG8gY29uZmlnIHJlcXVlc3RcbiAqIFRPRE8gVVNFIFBST01JU0VcbiAqL1xuXG5JRVEucHJvdG90eXBlLnVwZGF0ZURhdGEgPSBmdW5jdGlvbihjYWxsYmFjaywgZGF0YUNvbmZpZyl7XG5cdHRoaXMuX3VwZGF0ZURhdGEoY2FsbGJhY2ssIGRhdGFDb25maWcsIFwiRGF0YVJlcXVlc3RcIilcbn07XG5cbi8qKlxuICogVXBkYXRlIGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YUNvbmZpZzogZGF0YSB0byBjb25maWcgcmVxdWVzdFxuICogQHBhcmFtIHtzdHJpbmd9IGZ1bmNOYW1lOiBuYW1lIG9mIHJlcXVlc3RlZCBmdW5jdGlvbiBpbiBkaXlhLW5vZGUtaWVxLiBEZWZhdWx0OiBcIkRhdGFSZXF1ZXN0XCIuXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cblxuSUVRLnByb3RvdHlwZS5fdXBkYXRlRGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnLCBmdW5jTmFtZSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwiaWVxXCIsXG5cdFx0ZnVuYzogZnVuY05hbWUsXG5cdFx0ZGF0YToge1xuXHRcdFx0dHlwZTpcInNwbFJlcVwiLFxuXHRcdFx0ZGF0YUNvbmZpZzogdGhhdC5kYXRhQ29uZmlnXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0aWYgKHR5cGVvZiBlcnIgPT1cInN0cmluZ1wiKSBMb2dnZXIuZXJyb3IoXCJSZWN2IGVycjogXCIrIGVycik7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZXJyID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGVyci5uYW1lID09J3N0cmluZycpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZXJyLm5hbWUpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGVyci5tZXNzYWdlPT1cInN0cmluZ1wiKSBMb2dnZXIuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhICYmIGRhdGEuaGVhZGVyICYmIGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJVcGRhdGVEYXRhOlxcblwiK0pTT04uc3RyaW5naWZ5KGRhdGEuaGVhZGVyLmRhdGFDb25maWcpKTtcblx0XHRcdExvZ2dlci5lcnJvcihcIkRhdGEgcmVxdWVzdCBmYWlsZWQgKFwiK2RhdGEuaGVhZGVyLmVycm9yLnN0K1wiKTogXCIrZGF0YS5oZWFkZXIuZXJyb3IubXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cdFx0Ly8gTG9nZ2VyLmxvZyh0aGF0LmdldERhdGFNb2RlbCgpKTtcblx0XHRjYWxsYmFjayh0aGF0LmdldERhdGFNb2RlbCgpKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHR9KTtcbn07XG5cbklFUS5wcm90b3R5cGUuX2lzRGF0YU1vZGVsV2l0aE5hTiA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZGF0YU1vZGVsTmFOPWZhbHNlO1xuXHR2YXIgc2Vuc29yTmFuO1xuXHRmb3IodmFyIG4gaW4gdGhpcy5kYXRhTW9kZWwpIHtcblx0XHRzZW5zb3JOYW4gPSB0aGlzLmRhdGFNb2RlbFtuXS5kYXRhLnJlZHVjZShmdW5jdGlvbihuYW5QcmVzLGQpIHtcblx0XHRcdHJldHVybiBuYW5QcmVzICYmIGlzTmFOKGQpO1xuXHRcdH0sZmFsc2UpO1xuXHRcdGRhdGFNb2RlbE5hTiA9IGRhdGFNb2RlbE5hTiAmJiBzZW5zb3JOYW47XG5cdFx0TG9nZ2VyLmxvZyhuK1wiIHdpdGggbmFuIDogXCIrc2Vuc29yTmFuK1wiIChcIitkYXRhTW9kZWxOYU4rXCIpIC8gXCIrdGhpcy5kYXRhTW9kZWxbbl0uZGF0YS5sZW5ndGgpO1xuXHR9XG59O1xuXG5JRVEucHJvdG90eXBlLmdldENvbmZpbmVtZW50TGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5jb25maW5lbWVudDtcbn07XG5cbklFUS5wcm90b3R5cGUuZ2V0QWlyUXVhbGl0eUxldmVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuYWlyUXVhbGl0eTtcbn07XG5cbklFUS5wcm90b3R5cGUuZ2V0RW52UXVhbGl0eUxldmVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZW52UXVhbGl0eTtcbn07XG5cblxuXG4vKipcbiAqIFVwZGF0ZSBpbnRlcm5hbCBtb2RlbCB3aXRoIHJlY2VpdmVkIGRhdGFcbiAqIEBwYXJhbSAgZGF0YSB0byBjb25maWd1cmUgc3Vic2NyaXB0aW9uXG4gKiBAcGFyYW0gIGNhbGxiYWNrIGNhbGxlZCBvbiBhbnN3ZXJzIChAcGFyYW0gOiBkYXRhTW9kZWwpXG4gKi9cbklFUS5wcm90b3R5cGUud2F0Y2ggPSBmdW5jdGlvbihjb25maWcsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8qKiBkZWZhdWx0ICoqL1xuXHRjb25maWcgPSBjb25maWcgfHwge307XG5cdGNvbmZpZy50aW1lUmFuZ2UgPSBjb25maWcudGltZVJhbmdlICB8fCAnaG91cnMnO1xuXHRjb25maWcuY2F0ID0gY29uZmlnLmNhdCB8fCAnaWVxJzsgLyogY2F0ZWdvcnkgKi9cblxuXHR2YXIgc3VicyA9IHRoaXMuc2VsZWN0b3Iuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiBcImllcVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVwiLFxuXHRcdGRhdGE6IGNvbmZpZyxcblx0XHRvYmo6IGNvbmZpZy5jYXQgLyogcHJvdmlkZSBjYXRlZ29yeSBvZiBzZW5zb3IgdG8gYmUgd2F0Y2hlZCwgZmlsdGVyZWQgYWNjb3JkaW5nIHRvIENSTSAqL1xuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiV2F0Y2hJRVFSZWN2RXJyOlwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0dGhhdC5jbG9zZVN1YnNjcmlwdGlvbnMoKTsgLy8gc2hvdWxkIG5vdCBiZSBuZWNlc3Nhcnlcblx0XHRcdHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID0gdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2QrMTAwMHx8MTAwMDsgLy8gaW5jcmVhc2UgZGVsYXkgYnkgMSBzZWNcblx0XHRcdGlmKHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID4gMzAwMDAwKSB0aGF0LnN1YnNjcmlwdGlvblJlcVBlcmlvZD0zMDAwMDA7IC8vIG1heCA1bWluXG5cdFx0XHRzdWJzLndhdGNoVGVudGF0aXZlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcdHRoYXQud2F0Y2goY29uZmlnLGNhbGxiYWNrKTsgfSwgdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2QpOyAvLyB0cnkgYWdhaW4gbGF0ZXJcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2Q9MDsgLy8gcmVzZXQgcGVyaW9kIG9uIHN1YnNjcmlwdGlvbiByZXF1ZXN0c1xuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJXYXRjaElFUTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5kYXRhQ29uZmlnKSk7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJEYXRhIHJlcXVlc3QgZmFpbGVkIChcIitkYXRhLmhlYWRlci5lcnJvci5zdCtcIik6IFwiK2RhdGEuaGVhZGVyLmVycm9yLm1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHQvL1x0Y29uc29sZS5sb2coJ3dhdGNoJyk7XG5cdC8vXHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHR0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcbi8vXHRcdHRoYXQuc3Vic2NyaXB0aW9uRXJyb3IgPSAwOyAvLyByZXNldCBlcnJvciBjb3VudGVyXG5cblx0XHRjYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhhdCk7IC8vIGJpbmQgY2FsbGJhY2sgd2l0aCBJRVFcblx0XHRjYWxsYmFjayh0aGF0LmdldERhdGFNb2RlbCgpKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHR9KTtcblxuXHR0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChzdWJzKTtcbn07XG5cbi8qKlxuICogQ2xvc2UgYWxsIHN1YnNjcmlwdGlvbnNcbiAqL1xuSUVRLnByb3RvdHlwZS5jbG9zZVN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbigpe1xuXHRmb3IodmFyIGkgaW4gdGhpcy5zdWJzY3JpcHRpb25zKSB7XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zW2ldLmNsb3NlKCk7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuc3Vic2NyaXB0aW9uc1tpXS53YXRjaFRlbnRhdGl2ZSk7XG5cdH1cblx0dGhpcy5zdWJzY3JpcHRpb25zID1bXTtcbn07XG5cbi8qKlxuKiBSZXF1ZXN0IERhdGEgdG8gbWFrZSBDU1YgZmlsZVxuXHQqIEBwYXJhbSB7b2JqZWN0fSBjc3ZDb25maWcgcGFyYW1zOlxuXHQqIEBwYXJhbSB7bGlzdH0gY3N2Q29uZmlnLnNlbnNvck5hbWVzIDogbGlzdCBvZiBzZW5zb3IgYW5kIGluZGV4IG5hbWVzXG5cdCogQHBhcmFtIHtudW1iZXJ9IGNzdkNvbmZpZy5fc3RhcnRUaW1lOiB0aW1lc3RhbXAgb2YgYmVnaW5uaW5nIHRpbWVcblx0KiBAcGFyYW0ge251bWJlcn0gY3N2Q29uZmlnLl9lbmRUaW1lOiB0aW1lc3RhbXAgb2YgZW5kIHRpbWVcblx0KiBAcGFyYW0ge3N0cmluZ30gY3N2Q29uZmlnLnRpbWVTYW1wbGU6IHRpbWVpbnRlcnZhbCBmb3IgZGF0YS4gUGFyYW1ldGVyczogXCJzZWNvbmRcIiwgXCJtaW51dGVcIiwgXCJob3VyXCIsIFwiZGF5XCIsIFwid2Vla1wiLCBcIm1vbnRoXCJcblx0KiBAcGFyYW0ge251bWJlcn0gY3N2Q29uZmlnLl9ubGluZXM6IG1heGltdW0gbnVtYmVyIG9mIGxpbmVzIHJlcXVlc3RlZFxuXHQqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4qL1xuXG5cbklFUS5wcm90b3R5cGUuZ2V0Q1NWRGF0YSA9IGZ1bmN0aW9uKGNzdkNvbmZpZywgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0aWYgKGNzdkNvbmZpZyAmJiB0eXBlb2YgY3N2Q29uZmlnLm5saW5lcyAhPVwibnVtYmVyXCIgKSBjc3ZDb25maWcubmxpbmVzID0gdW5kZWZpbmVkO1xuXHRpZiAoY3N2Q29uZmlnICYmIHR5cGVvZiBjc3ZDb25maWcubGFuZyAhPSBcInN0cmluZ1wiICkgY3N2Q29uZmlnLmxhbmcgPSB1bmRlZmluZWQ7XG5cblx0dmFyIGRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHsgc3RhcnQ6IChuZXcgRGF0ZShjc3ZDb25maWcuc3RhcnRUaW1lKSkuZ2V0VGltZSgpLCBlbmQ6IChuZXcgRGF0ZShjc3ZDb25maWcuZW5kVGltZSkpLmdldFRpbWUoKSAsIHNhbXBsaW5nOmNzdkNvbmZpZy50aW1lU2FtcGxlfSxcblx0XHRcdHBsYWNlczogW10sXG5cdFx0XHRyb2JvdHM6IFtdXG5cdFx0fSxcblx0XHRzZW5zb3JzOiBjc3ZDb25maWcuc2Vuc29yTmFtZXMsXG5cdFx0c2FtcGxpbmc6IGNzdkNvbmZpZy5ubGluZXMsXG5cdFx0bGFuZzogY3N2Q29uZmlnLmxhbmdcblx0fTtcblxuXHQvLyBjb25zb2xlLmxvZyhcIlJlcXVlc3Q6IFwiK0pTT04uc3RyaW5naWZ5KGRhdGFDb25maWcpKTtcblx0dGhpcy5zZWxlY3Rvci5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiBcImllcVwiLFxuXHRcdGZ1bmM6IFwiQ3N2RGF0YVJlcXVlc3RcIixcblx0XHRkYXRhOiB7XG5cdFx0XHR0eXBlOlwic3BsUmVxXCIsXG5cdFx0XHRkYXRhQ29uZmlnOiBkYXRhQ29uZmlnXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0aWYgKHR5cGVvZiBlcnIgPT1cInN0cmluZ1wiKSBMb2dnZXIuZXJyb3IoXCJSZWN2IGVycjogXCIrIGVycik7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZXJyID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGVyci5uYW1lID09J3N0cmluZycpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZXJyLm5hbWUpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGVyci5tZXNzYWdlPT1cInN0cmluZ1wiKSBMb2dnZXIuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZih0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGNhbGxiYWNrKGRhdGEpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdC8vIERFUFJFQ0FURURcblx0XHRcdGlmKGRhdGEgJiYgZGF0YS5oZWFkZXIgJiYgZGF0YS5oZWFkZXIuZXJyb3IpIHtcblx0XHRcdC8vIFRPRE8gOiBjaGVjay91c2UgZXJyIHN0YXR1cyBhbmQgYWRhcHQgYmVoYXZpb3IgYWNjb3JkaW5nbHlcblx0XHRcdExvZ2dlci5lcnJvcihcIlVwZGF0ZURhdGE6XFxuXCIrSlNPTi5zdHJpbmdpZnkoZGF0YS5oZWFkZXIuZGF0YUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcblx0XHRcdC8vIExvZ2dlci5sb2codGhhdC5nZXREYXRhTW9kZWwoKSk7XG5cdFx0XHRjYWxsYmFjayh0aGF0LmdldERhdGFNb2RlbCgpKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHRcdH1cblx0fSk7XG59O1xuXG5cblxuLyoqXG4gKiBSZXF1ZXN0IERhdGEgdG8gbWFrZSBkYXRhIG1hcFxuICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gICogQHBhcmFtIHtjYWxsYmFja30gY2FsbGJhY2s6IGNhbGxlZCBhZnRlciB1cGRhdGVcbiAgKi9cbklFUS5wcm90b3R5cGUuZ2V0RGF0YU1hcERhdGEgPSBmdW5jdGlvbihkYXRhQ29uZmlnLCBjYWxsYmFjayl7XG5cdHRoaXMuX3VwZGF0ZURhdGEoY2FsbGJhY2ssIGRhdGFDb25maWcsIFwiRGF0YVJlcXVlc3RcIik7XG59O1xuXG5cbi8qKlxuICogUmVxdWVzdCBEYXRhIHRvIG1ha2UgaGVhdG1hcFxuICAqIEBwYXJhbSB7bGlzdH0gc2Vuc29yTmFtZXMgOiBsaXN0IG9mIHNlbnNvciBhbmQgaW5kZXggbmFtZXNcbiAgKiBAcGFyYW0ge29iamVjdH0gdGltZTogb2JqZWN0IGNvbnRhaW5pbmcgdGltZXN0YW1wcyBmb3IgYmVnaW4gYW5kIGVuZCBvZiBkYXRhIGZvciBoZWF0bWFwXG4gICogQHBhcmFtIHtzdHJpbmd9IHNhbXBsZTogdGltZWludGVydmFsIGZvciBkYXRhLiBQYXJhbWV0ZXJzOiBcInNlY29uZFwiLCBcIm1pbnV0ZVwiLCBcImhvdXJcIiwgXCJkYXlcIiwgXCJ3ZWVrXCIsIFwibW9udGhcIlxuICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGNhbGxiYWNrOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gICogQGRlcHJlY2F0ZWQgV2lsbCBiZSBkZXByZWNhdGVkIGluIGZ1dHVyZSB2ZXJzaW9uLiBQbGVhc2UgdXNlIFwiZ2V0RGF0YU1hcERhdGFcIiBpbnN0ZWFkLlxuXG4gICovXG5JRVEucHJvdG90eXBlLmdldEhlYXRNYXBEYXRhID0gZnVuY3Rpb24oc2Vuc29yTmFtZXMsdGltZSwgc2FtcGxlLCBjYWxsYmFjayl7XG5cdHZhciBkYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7c3RhcnQ6IHRpbWUuc3RhcnRFcG9jaCwgZW5kOiB0aW1lLmVuZEVwb2NoLCBzYW1wbGluZzogc2FtcGxlfSxcblx0XHRcdHBsYWNlczogW10sXG5cdFx0XHRyb2JvdHM6IFtdXG5cdFx0fSxcblx0XHRzZW5zb3JzOiBzZW5zb3JOYW1lc1xuXHR9O1xuXHRjb25zb2xlLndhcm4oJ1RoaXMgZnVuY3Rpb24gd2lsbCBiZSBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIFwiZ2V0RGF0YU1hcERhdGFcIiBpbnN0ZWFkLicpO1xuXHR0aGlzLmdldERhdGFNYXBEYXRhKGRhdGFDb25maWcsIGNhbGxiYWNrKVxufTtcblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cbklFUS5wcm90b3R5cGUuX2dldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9bnVsbDtcbi8vXHRjb25zb2xlLmxvZygnZ2V0RGF0YU1vZGVsJyk7XG4vL1x0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0aWYoZGF0YS5lcnIgJiYgZGF0YS5lcnIuc3Q+MCkge1xuXHRcdExvZ2dlci5lcnJvcihkYXRhLmVyci5tc2cpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGRlbGV0ZSBkYXRhLmVycjtcblx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlcikge1xuXHRcdGZvciAodmFyIG4gaW4gZGF0YSkge1xuXHRcdFx0aWYobiAhPSBcImhlYWRlclwiICYmIG4gIT0gXCJlcnJcIikge1xuXG5cdFx0XHRcdGlmKGRhdGFbbl0uZXJyICYmIGRhdGFbbl0uZXJyLnN0PjApIHtcblx0XHRcdFx0XHRMb2dnZXIuZXJyb3IobitcIiB3YXMgaW4gZXJyb3I6IFwiK2RhdGFbbl0uZXJyLm1zZyk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighZGF0YU1vZGVsKVxuXHRcdFx0XHRcdGRhdGFNb2RlbD17fTtcblxuXHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGFic29sdXRlIHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZVJhbmdlPWRhdGFbbl0udGltZVJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBsYWJlbCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdW5pdCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHByZWNpc2lvbiAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucHJlY2lzaW9uPWRhdGFbbl0ucHJlY2lzaW9uO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBjYXRlZ29yaWVzICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5jYXRlZ29yeT1kYXRhW25dLmNhdGVnb3J5O1xuXHRcdFx0XHQvKiBzdWdnZXN0ZWQgeSBkaXNwbGF5IHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS56b29tUmFuZ2UgPSBbMCwgMTAwXTtcblx0XHRcdFx0Ly8gdXBkYXRlIHNlbnNvciBjb25mb3J0IHJhbmdlXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5jb25mb3J0UmFuZ2UgPSBkYXRhW25dLmNvbmZvcnRSYW5nZTtcblxuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBpbmRleFJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5Q29uZmlnPXtcblx0XHRcdFx0XHQvKiBjb25mb3J0UmFuZ2U6IGRhdGFbbl0uY29uZm9ydFJhbmdlLCAqL1xuXHRcdFx0XHRcdGluZGV4UmFuZ2U6IGRhdGFbbl0uaW5kZXhSYW5nZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZSA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS50aW1lLCdiNjQnLDgpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IChkYXRhW25dLmRhdGE/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmRhdGEsJ2I2NCcsNCk6KGRhdGFbbl0uYXZnP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5hdmcuZCwnYjY0Jyw0KTpudWxsKSk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5SW5kZXggPSAoZGF0YVtuXS5kYXRhP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5pbmRleCwnYjY0Jyw0KTooZGF0YVtuXS5hdmc/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpOm51bGwpKTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnJvYm90SWQgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ucm9ib3RJZCwnYjY0Jyw0KTtcblx0XHRcdFx0aWYoZGF0YU1vZGVsW25dLnJvYm90SWQpIHtcblx0XHRcdFx0XHQvKiogZGljbyByb2JvdElkIC0+IHJvYm90TmFtZSAqKi9cblx0XHRcdFx0XHR2YXIgZGljb1JvYm90ID0ge307XG5cdFx0XHRcdFx0ZGF0YS5oZWFkZXIucm9ib3RzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcblx0XHRcdFx0XHRcdGRpY29Sb2JvdFtlbC5pZF09ZWwubmFtZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ucm9ib3RJZCA9IGRhdGFNb2RlbFtuXS5yb2JvdElkLm1hcChmdW5jdGlvbihlbCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGRpY29Sb2JvdFtlbF07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucGxhY2VJZCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5wbGFjZUlkLCdiNjQnLDQpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IG51bGw7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS55ID0gbnVsbDtcblxuXHRcdFx0XHRpZihkYXRhW25dLmF2Zylcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uYXZnID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5taW4pXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLm1pbiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ubWF4KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5tYXggPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLnN0ZGRldilcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uc3RkZGV2ID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5zdGRkZXYpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnN0ZGRldiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ueClcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS54LCdiNjQnLDQpO1xuXHRcdFx0XHRpZihkYXRhW25dLnkpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnkgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ueSwnYjY0Jyw0KTtcblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIGN1cnJlbnQgcXVhbGl0eSA6IHsnYidhZCwgJ20nZWRpdW0sICdnJ29vZH1cblx0XHRcdFx0ICogZXZvbHV0aW9uIDogeyd1J3AsICdkJ293biwgJ3MndGFibGV9XG5cdFx0XHRcdCAqIGV2b2x1dGlvbiBxdWFsaXR5IDogeydiJ2V0dGVyLCAndydvcnNlLCAncydhbWV9XG5cdFx0XHRcdCAqL1xuXHRcdFx0XHQvLy8gVE9ET1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udHJlbmQgPSAnbXNzJztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSB7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTm8gRGF0YSB0byByZWFkIG9yIGhlYWRlciBpcyBtaXNzaW5nICFcIik7XG5cdH1cblx0LyoqIGxpc3Qgcm9ib3RzICoqL1xuLy9cdGRhdGFNb2RlbC5yb2JvdHMgPSBbe25hbWU6ICdEMlIyJywgaWQ6MX1dO1xuXHR0aGlzLmRhdGFNb2RlbD1kYXRhTW9kZWw7XG5cdHJldHVybiBkYXRhTW9kZWw7XG59O1xuXG5cblxuXG5cbi8qKiBjcmVhdGUgSUVRIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLklFUSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgSUVRKHRoaXMpO1xufTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIGQxID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJyk7XG52YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxuXG5cbmQxLmtub3duUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIGQxKFwiI3NlbGZcIikua25vd25QZWVycygpO1xufTtcbmQxLmtwID0gZDEua25vd25QZWVycztcblxuXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUua25vd25QZWVycyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0dGhpcy5yZXF1ZXN0KHtzZXJ2aWNlOiAnbWVzaE5ldHdvcmsnLGZ1bmM6ICdMaXN0S25vd25QZWVycyd9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0dmFyIHBlZXJzID0gW107XG5cdFx0Zm9yKHZhciBpPTA7IGk8ZGF0YS5wZWVycy5sZW5ndGg7IGkrKykgcGVlcnMucHVzaChkYXRhLnBlZXJzW2ldLm5hbWUpO1xuXHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0fSk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5cblxuZDEubGlzdGVuTWVzaE5ldHdvcmsgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRyZXR1cm4gZDEoLy4qLykuc3Vic2NyaWJlKHsgc2VydmljZTogJ21lc2hOZXR3b3JrJywgZnVuYzogJ01lc2hOZXR3b3JrJyB9LCBjYWxsYmFjaywge2F1dG86IHRydWV9KTtcbn07XG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cblxuLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG5mdW5jdGlvbiBNZXNzYWdlKHNlcnZpY2UsIGZ1bmMsIG9iaiwgcGVybWFuZW50KXtcblxuXHR0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXHR0aGlzLmZ1bmMgPSBmdW5jO1xuXHR0aGlzLm9iaiA9IG9iajtcblx0XG5cdHRoaXMucGVybWFuZW50ID0gcGVybWFuZW50OyAvL0lmIHRoaXMgZmxhZyBpcyBvbiwgdGhlIGNvbW1hbmQgd2lsbCBzdGF5IG9uIHRoZSBjYWxsYmFjayBsaXN0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG59XG5cbk1lc3NhZ2UuYnVpbGRTaWduYXR1cmUgPSBmdW5jdGlvbihtc2cpe1xuXHRyZXR1cm4gbXNnLnNlcnZpY2UrJy4nK21zZy5mdW5jKycuJyttc2cub2JqO1xufVxuXG5cbk1lc3NhZ2UucHJvdG90eXBlLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnNlcnZpY2UrJy4nK3RoaXMuZnVuYysnLicrdGhpcy5vYmo7XG59XG5cbk1lc3NhZ2UucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbihkYXRhKXtcblx0cmV0dXJuIHtcblx0XHRzZXJ2aWNlOiB0aGlzLnNlcnZpY2UsXG5cdFx0ZnVuYzogdGhpcy5mdW5jLFxuXHRcdG9iajogdGhpcy5vYmosXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIGQxID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJyk7XG52YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxuXG5pZih0eXBlb2YgSU5GTyA9PT0gJ3VuZGVmaW5lZCcpIHZhciBJTkZPID0gZnVuY3Rpb24ocykgeyBjb25zb2xlLmxvZyhzKTt9XG5pZih0eXBlb2YgT0sgPT09ICd1bmRlZmluZWQnKSB2YXIgT0sgPSBmdW5jdGlvbihzKSB7IGNvbnNvbGUubG9nKHMpO31cblxuXG5cbi8qKlxuKiBJbnN0YWxscyBhIG5ldyBEaXlhTm9kZSBkZXZpY2UgKHdpdGggYWRkcmVzcyAnaXAnKSBpbnRvIGFuIGV4aXN0aW5nIG5ldHdvcmssIGJ5XG4qIGNvbnRhY3RpbmcgYW4gZXhpc3RpbmcgRGl5YU5vZGUgZGV2aWNlIHdpdGggYWRkcmVzcyAnYm9vdHN0cmFwX2lwJyA6XG4qICAgMSkgQ29udGFjdCB0aGUgbmV3IG5vZGUgdG8gZ2V0IGl0cyBwdWJsaWMga2V5XG4qICAgMikgQWRkIHRoaXMgcHVibGljIGtleSB0byB0aGUgZXhpc3Rpbmcgbm9kZSBUcnVzdGVkUGVlcnMgbGlzdFxuKiAgIDMpIEFkZCB0aGUgZXhpc3Rpbmcgbm9kZSdzIHB1YmxpYyBrZXkgdG8gdGhlIG5ldyBub2RlJ3MgVHJ1c3RlZFBlZXJzIGxpc3RcbiogICA0KSBBc2sgdGhlIG5ldyBub2RlIHRvIGpvaW4gdGhlIG5ldHdvcmsgYnkgY2FsbGluZyBAc2Vle2QxKCkuam9pbigpfVxuKlxuKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgdGhlIGdpdmVuIHVzZXIgdG8gaGF2ZSByb290IHJvbGUgb24gYm90aCBub2Rlc1xuKlxuKiBAcGFyYW0gaXAgOiB0aGUgSVAgYWRkcmVzcyBvZiB0aGUgbmV3IGRldmljZVxuKiBAcGFyYW0gdXNlciA6IGEgdXNlcm5hbWUgd2l0aCByb290IHJvbGUgb24gdGhlIG5ldyBkZXZpY2VcbiogQHBhcmFtIHBhc3N3b3JkIDogdGhlIHBhc3N3b3JkIGZvciAndXNlcidcbiogQHBhcmFtIGJvb3RzdHJhcF9pcCA6IHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBib290c3RyYXAgZGV2aWNlXG4qIEBwYXJhbSBib290c3RyYXBfdXNlciA6IGEgdXNlciBpZGVudGlmaWVyIHdpdGggcm9vdCByb2xlIG9uIHRoZSBib29zdHJhcCBkZXZpY2VcbiogQHBhcmFtIGJvb3RzdHJhcF9wYXNzd29yZCA6IHRoZSBwYXNzd29yZCBmb3IgJ2Jvb3RzdHJhcF91c2VyJ1xuKiBAcGFyYW0gYm9vdHN0cmFwX25ldCA6IHRoZSBJUCBhZGRyZXNzIHdoZXJlIHRoZSBuZXcgZGV2aWNlIHdpbGwgY29ubmVjdCB0byB0aGUgYm9vc3RyYXAgb25lXG4qIEBwYXJhbSBjYWxsYmFjayA6IG9mIHRoZSBmb3JtIGNhbGxiYWNrKG5ld19wZWVyX25hbWUsYm9vdHN0cmFwX3BlZXJfbmFtZSwgZXJyLCBkYXRhKVxuKi9cbmQxLmluc3RhbGxOb2RlRXh0ID0gZnVuY3Rpb24oaXAsIHVzZXIsIHBhc3N3b3JkLCBib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQsIGJvb3RzdHJhcF9uZXQsIGNhbGxiYWNrKSB7XG5cdGlmKHR5cGVvZiBpcCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBpcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGJvb3RzdHJhcF9pcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX25ldCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBib290c3RyYXBfbmV0IHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYm9vdHN0cmFwX2lwLmluZGV4T2YoXCJ3czovL1wiKSAhPT0gMCAmJiBib290c3RyYXBfaXAuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfaXAgPSBcIndzczovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHRcdGVsc2UgYm9vdHN0cmFwX2lwID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHR9XG5cdGlmKGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfbmV0ID0gXCJ3c3M6Ly9cIiArIGJvb3RzdHJhcF9uZXQ7XG5cdFx0ZWxzZSBib290c3RyYXBfbmV0ID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX25ldDtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKSB7XG5cdFx0ZDEoXCIjc2VsZlwiKS5qb2luKGJvb3RzdHJhcF9uZXQsIHRydWUsIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSl7XG5cdFx0XHRpZighZXJyKSBPSyhcIkpPSU5FRCAhISFcIik7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSk7XG5cdFx0fSk7XG5cdH1cblxuXHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpe1xuXHRcdGQxKFwiI3NlbGZcIikuZ2l2ZVB1YmxpY0tleShmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycj09PSdTZXJ2aWNlTm90Rm91bmQnKSB7XG5cdFx0XHRcdElORk8oXCJQZWVyIEF1dGhlbnRpY2F0aW9uIGRpc2FibGVkIC4uLiBkaXJlY3RseSBqb2luaW5nXCIpO1xuXHRcdFx0XHRqb2luKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZXJyKSByZXR1cm4gY2FsbGJhY2socGVlciwgbnVsbCwgZXJyLCBudWxsKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRJTkZPKFwiQWRkIHRydXN0ZWQgcGVlciBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIHRvIFwiICsgYm9vdHN0cmFwX2lwICsgXCIgd2l0aCBwdWJsaWMga2V5IFwiICsgZGF0YS5wdWJsaWNfa2V5LnNsaWNlKDAsMjApKTtcblx0XHRcdFx0ZDEuY29ubmVjdEFzVXNlcihib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKHBlZXIsIGRhdGEucHVibGljX2tleSwgZnVuY3Rpb24oYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSkge1xuXG5cdFx0XHRcdFx0XHRpZihlcnIpIHJldHVybiBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBudWxsKTtcblx0XHRcdFx0XHRcdGlmKGRhdGEuYWxyZWFkeVRydXN0ZWQpIElORk8ocGVlciArIFwiIGFscmVhZHkgdHJ1c3RlZCBieSBcIiArIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdGVsc2UgSU5GTyhib290c3RyYXBfcGVlciArIFwiKGlwPVwiKyBib290c3RyYXBfaXAgK1wiKSBhZGRlZCBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXG5cdFx0XHRcdFx0XHRJTkZPKFwiSW4gcmV0dXJuLCBhZGQgXCIgKyBib290c3RyYXBfcGVlciArIFwiIHRvIFwiICsgcGVlciArIFwiIGFzIGEgVHJ1c3RlZCBQZWVyIHdpdGggcHVibGljIGtleSBcIiArIGRhdGEucHVibGljX2tleS5zbGljZSgwLDIwKSk7XG5cdFx0XHRcdFx0XHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKGJvb3RzdHJhcF9wZWVyLCBkYXRhLnB1YmxpY19rZXksIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKGVycikgY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgbnVsbCk7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZihkYXRhLmFscmVhZHlUcnVzdGVkKSBJTkZPKGJvb3RzdHJhcF9wZWVyICsgXCIgYWxyZWFkeSB0cnVzdGVkIGJ5IFwiICsgcGVlcik7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBJTkZPKHBlZXIgKyBcIihpcD1cIisgaXAgK1wiKSBhZGRlZCBcIiArIGJvb3RzdHJhcF9wZWVyICsgXCIoaXA9XCIrIGJvb3RzdHJhcF9pcCArXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vIE9uY2UgS2V5cyBoYXZlIGJlZW4gZXhjaGFuZ2VkIGFzayB0byBqb2luIHRoZSBuZXR3b3JrXG5cdFx0XHRcdFx0XHRcdFx0T0soXCJLRVlTIE9LICEgTm93LCBsZXQgXCIrcGVlcitcIihpcD1cIitpcCtcIikgam9pbiB0aGUgbmV0d29yayB2aWEgXCIrYm9vdHN0cmFwX3BlZXIrXCIoaXA9XCIrYm9vdHN0cmFwX25ldCtcIikgLi4uXCIpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5cbi8qKiBTaG9ydCB2ZXJzaW9uIG9mIEBzZWV7ZDEuaW5zdGFsbE5vZGVFeHR9ICovXG5kMS5pbnN0YWxsTm9kZSA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spIHtcblx0XHR2YXIgaXAgPSBkMS5hZGRyKCk7XG5cdFx0dmFyIHVzZXIgPSBkMS51c2VyKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gZDEucGFzcygpO1xuXHRcdHZhciBib290c3RyYXBfdXNlciA9IHVzZXI7XG5cdFx0dmFyIGJvb3RzdHJhcF9wYXNzd29yZCA9IHBhc3N3b3JkO1xuXHRcdHJldHVybiBkMS5pbnN0YWxsTm9kZUV4dChpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spO1xufVxuXG5cblxuXG4vKipcbiAqIE1ha2UgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBqb2luIGFuIGV4aXN0aW5nIERpeWFOb2RlcyBNZXNoIE5ldHdvcmsgYnkgY29udGFjdGluZ1xuICogdGhlIGdpdmVuIGJvb3RzdHJhcCBwZWVycy5cbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGNvbnRhY3QgdG8gam9pbiB0aGUgTmV0d29ya1xuICogQHBhcmFtIGJQZXJtYW5lbnQgOiBpZiB0cnVlLCBwZXJtYW5lbnRseSBhZGQgdGhlIGJvb3RzdHJhcCBwZWVycyBhcyBhdXRvbWF0aWMgYm9vdHN0cmFwIHBlZXJzIGZvciB0aGUgc2VsZWN0ZWQgbm9kZXMuXG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbihib290c3RyYXBfaXBzLCBiUGVybWFuZW50LCBjYWxsYmFjayl7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXBzID09PSAnc3RyaW5nJykgYm9vdHN0cmFwX2lwcyA9IFsgYm9vdHN0cmFwX2lwcyBdO1xuXHRpZihib290c3RyYXBfaXBzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkgdGhyb3cgXCJqb2luKCkgOiBib290c3RyYXBfaXBzIHNob3VsZCBiZSBhbiBhcnJheSBvZiBwZWVycyBVUklzXCI7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZSA6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdKb2luJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIERpc2Nvbm5lY3QgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBmcm9tIHRoZSBnaXZlbiBib290c3RyYXAgcGVlcnNcbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGxlYXZlXG4gKiBAcGFyYW0gYlBlcm1hbmVudCA6IGlmIHRydWUsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGUgZ2l2ZW4gcGVlcnMgZnJvbSB0aGUgYXV0b21hdGljIGJvb3RzdHJhcCBwZWVycyBsaXN0XG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24oYm9vdHN0cmFwX2lwcywgYlBlcm1hbmVudCwgY2FsbGJhY2spe1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwcyA9PT0gJ3N0cmluZycpIGJvb3RzdHJhcF9pcHMgPSBbIGJvb3RzdHJhcF9pcHMgXTtcblx0aWYoYm9vdHN0cmFwX2lwcy5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHRocm93IFwibGVhdmUoKSA6IGJvb3RzdHJhcF9pcHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHBlZXJzIFVSSXNcIjtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlIDogJ21lc2hOZXR3b3JrJywgZnVuYzogJ0xlYXZlJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIEFzayB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGZvciB0aGVpciBwdWJsaWMga2V5c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdpdmVQdWJsaWNLZXkgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dpdmVQdWJsaWNLZXknLFx0ZGF0YToge30gfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7Y2FsbGJhY2socGVlcklkLGVycixkYXRhKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIEFkZCBhIG5ldyB0cnVzdGVkIHBlZXIgUlNBIHB1YmxpYyBrZXkgdG8gdGhlIHNlbGVjdGVkIERpeWFOb2Rlc1xuICogTk9URSA6IFRoaXMgb3BlcmF0aW9uIHJlcXVpcmVzIHJvb3Qgcm9sZVxuICpcbiAqIEBwYXJhbSBuYW1lIDogdGhlIG5hbWUgb2YgdGhlIG5ldyB0cnVzdGVkIERpeWFOb2RlIHBlZXJcbiAqIEBwYXJhbSBwdWJsaWNfa2V5IDogdGhlIFJTQSBwdWJsaWMga2V5IG9mIHRoZSBuZXcgdHJ1c3RlZCBEaXlhTm9kZSBwZWVyXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYWRkVHJ1c3RlZFBlZXIgPSBmdW5jdGlvbihuYW1lLCBwdWJsaWNfa2V5LCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoeyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FkZFRydXN0ZWRQZWVyJyxcdGRhdGE6IHsgbmFtZTogbmFtZSwgcHVibGljX2tleTogcHVibGljX2tleSB9fSxcblx0XHRmdW5jdGlvbihwZWVySWQsZXJyLGRhdGEpe2NhbGxiYWNrKHBlZXJJZCxlcnIsZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBzZWxlY3RlZCBEaXlhTm9kZXMgdHJ1c3QgdGhlIGdpdmVuIHBlZXJzXG4gKiBAcGFyYW0gcGVlcnMgOiBhbiBhcnJheSBvZiBwZWVyIG5hbWVzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYXJlVHJ1c3RlZCA9IGZ1bmN0aW9uKHBlZXJzLCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FyZVRydXN0ZWQnLFx0ZGF0YTogeyBwZWVyczogcGVlcnMgfSB9LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHR2YXIgYWxsVHJ1c3RlZCA9IGRhdGEudHJ1c3RlZDtcblx0XHRcdGlmKGFsbFRydXN0ZWQpIHsgT0socGVlcnMgKyBcIiBhcmUgdHJ1c3RlZCBieSBcIiArIHBlZXJJZCk7IGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7IH1cblx0XHRcdGVsc2UgeyBFUlIoXCJTb21lIHBlZXJzIGluIFwiICsgcGVlcnMgKyBcIiBhcmUgdW50cnVzdGVkIGJ5IFwiICsgcGVlcklkKTsgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7IH1cblx0XHR9XG5cdCk7XG59O1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5pc1RydXN0ZWQgPSBmdW5jdGlvbihwZWVyLCBjYWxsYmFjaykgeyByZXR1cm4gdGhpcy5hcmVUcnVzdGVkKFtwZWVyXSwgY2FsbGJhY2spOyB9XG5cblxuZDEudHJ1c3RlZFBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0ZDEoXCIjc2VsZlwiKS5yZXF1ZXN0KFxuXHRcdHsgc2VydmljZTogJ3BlZXJBdXRoJyxcdGZ1bmM6ICdHZXRUcnVzdGVkUGVlcnMnIH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0dmFyIHBlZXJzID0gW107XG5cdFx0XHRmb3IodmFyIGk9MDsgaTxkYXRhLnBlZXJzLmxlbmd0aDsgaSsrKSBwZWVycy5wdXNoKGRhdGEucGVlcnNbaV0ubmFtZSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5kMS50cCA9IGQxLnRydXN0ZWRQZWVyczsgLy8gU2hvcnRoYW5kXG5cbmQxLmJsYWNrbGlzdGVkUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRkMShcIiNzZWxmXCIpLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dldEJsYWNrbGlzdGVkUGVlcnMnIH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0dmFyIHBlZXJzID0gW107XG5cdFx0XHRmb3IodmFyIGk9MDsgaTxkYXRhLnBlZXJzLmxlbmd0aDsgaSsrKSBwZWVycy5wdXNoKGRhdGEucGVlcnNbaV0ubmFtZSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5kMS5icCA9IGQxLmJsYWNrbGlzdGVkUGVlcnM7IC8vIFNob3J0aGFuZFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cbmxldCBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG5sZXQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG5sZXQgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5yZXF1aXJlKCd3ZWJydGMtYWRhcHRlcicpO1xuXG4vKmlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKXtcblx0dmFyIFJUQ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb247XG5cdHZhciBSVENJY2VDYW5kaWRhdGUgPSB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy5tb3pSVENJY2VDYW5kaWRhdGUgfHwgd2luZG93LndlYmtpdFJUQ0ljZUNhbmRpZGF0ZTtcblx0dmFyIFJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93Lm1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xufSovXG5cblxuXG5cbi8vLy8vLy8vLy8vLy9cbi8vIENIQU5ORUwgLy9cbi8vLy8vLy8vLy8vLy9cblxuLyoqIEhhbmRsZXMgYSBSVEMgY2hhbm5lbCAoZGF0YWNoYW5uZWwgYW5kL29yIHN0cmVhbSkgdG8gYSBEaXlhTm9kZSBwZWVyXG4gKiAgQHBhcmFtIGRuSWQgOiB0aGUgRGl5YU5vZGUgcGVlcklkXG4gKiAgQHBhcmFtIG5hbWUgOiB0aGUgY2hhbm5lbCdzIG5hbWVcbiAqICBAcGFyYW0gZGF0YWNoYW5uZWxfY2IgOiBjYWxsYmFjayBjYWxsZWQgd2hlbiBhIFJUQyBkYXRhY2hhbm5lbCBpcyBvcGVuIGZvciB0aGlzIGNoYW5uZWxcbiAqICBAcGFyYW0gc3RyZWFtX2NiIDogY2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBSVEMgc3RyZWFtIGlzIG9wZW4gZm9yIHRoaXMgY2hhbm5lbFxuICovXG5mdW5jdGlvbiBDaGFubmVsKGRuSWQsIG5hbWUsIGRhdGFjaGFubmVsX2NiLCBzdHJlYW1fY2IpIHtcblx0RXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cdHRoaXMubmFtZSA9IG5hbWU7XG5cdHRoaXMuZG5JZCA9IGRuSWQ7XG5cblx0dGhpcy5mcmVxdWVuY3kgPSAyMDtcblxuXHR0aGlzLmNoYW5uZWwgPSB1bmRlZmluZWQ7XG5cdHRoaXMuc3RyZWFtID0gdW5kZWZpbmVkO1xuXHR0aGlzLm9uZGF0YWNoYW5uZWwgPSBkYXRhY2hhbm5lbF9jYjtcblx0dGhpcy5vbnN0cmVhbSA9IHN0cmVhbV9jYjtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcbn1cbmluaGVyaXRzKENoYW5uZWwsIEV2ZW50RW1pdHRlcik7XG5cbi8qKiBCaW5kIGFuIGluY29taW5nIFJUQyBkYXRhY2hhbm5lbCB0byB0aGlzIGNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLnNldERhdGFDaGFubmVsID0gZnVuY3Rpb24oZGF0YWNoYW5uZWwpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuY2hhbm5lbCA9IGRhdGFjaGFubmVsO1xuXHR0aGlzLmNoYW5uZWwuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cdGNvbnNvbGUubG9nKFwic2V0IGRhdGEgY2hhbm5lbCA6XCIrdGhpcy5uYW1lKTtcblx0ZGF0YWNoYW5uZWwub25tZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0Ly8gRmlyc3QgbWVzc2FnZSBjYXJyaWVzIGNoYW5uZWwgZGVzY3JpcHRpb24gaGVhZGVyXG5cdFx0dmFyIHZpZXcgPSBuZXcgRGF0YVZpZXcobWVzc2FnZS5kYXRhKTtcblxuXHRcdHZhciB0eXBlQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlldy5nZXRVaW50OCgwKSk7XG5cdFx0aWYodHlwZUNoYXIgPT09ICdPJykgdGhhdC50eXBlID0gJ2lucHV0JzsgLy9Qcm9tZXRoZSBPdXRwdXQgPSBDbGllbnQgSW5wdXRcblx0XHRlbHNlIGlmKHR5cGVDaGFyID09PSAnSScpIHRoYXQudHlwZSA9ICdvdXRwdXQnOyAvL1Byb21ldGhlIElucHV0ID0gQ2xpZW50IE91dHB1dFxuXHRcdGVsc2UgdGhyb3cgXCJVbnJlY25vZ25pemVkIGNoYW5uZWwgdHlwZSA6IFwiICsgdHlwZUNoYXI7XG5cblx0XHR2YXIgc2l6ZSA9IHZpZXcuZ2V0SW50MzIoMSx0cnVlKTtcblx0XHRpZighc2l6ZSkgdGhyb3cgXCJXcm9uZyBkYXRhY2hhbm5lbCBtZXNzYWdlIHNpemVcIjtcblx0XHR0aGF0LnNpemUgPSBzaXplO1xuXHRcdHRoYXQuX2J1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSk7XG5cblx0XHQvLyBTdWJzZXF1ZW50IG1lc3NhZ2VzIGFyZSBmb3J3YXJkZWQgdG8gYXBwcm9wcmlhdGUgaGFuZGxlcnNcblx0XHRkYXRhY2hhbm5lbC5vbm1lc3NhZ2UgPSB0aGF0Ll9vbk1lc3NhZ2UuYmluZCh0aGF0KTtcblx0XHRkYXRhY2hhbm5lbC5vbmNsb3NlID0gdGhhdC5fb25DbG9zZS5iaW5kKHRoYXQpO1xuXG5cdFx0aWYodHlwZW9mIHRoYXQub25kYXRhY2hhbm5lbCA9PT0gJ2Z1bmN0aW9uJykgdGhhdC5vbmRhdGFjaGFubmVsKHRoYXQuZG5JZCwgdGhhdCk7XG5cblx0XHRjb25zb2xlLmxvZygnT3BlbiBkYXRhY2hhbm5lbCAnK3RoYXQubmFtZSk7XG5cdH1cbn07XG5cbi8qKiBCaW5kIGFuIGluY29taW5nIFJUQyBzdHJlYW0gdG8gdGhpcyBjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5vbkFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR0aGlzLnN0cmVhbSA9IHN0cmVhbTtcblx0aWYodHlwZW9mIHRoaXMub25zdHJlYW0gPT09ICdmdW5jdGlvbicpIHRoaXMub25zdHJlYW0odGhpcy5kbklkLCBzdHJlYW0pO1xuXHRlbHNlIGNvbnNvbGUud2FybihcIklnbm9yZSBzdHJlYW0gXCIgKyBzdHJlYW0uaWQpO1xuXG5cdGNvbnNvbGUubG9nKCdPcGVuIHN0cmVhbSAnK3RoaXMubmFtZSk7XG59O1xuXG5cbi8qKiBDbG9zZSB0aGlzIGNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5jbG9zZWQgPSB0cnVlO1xufTtcblxuLyoqIFdyaXRlIGEgc2NhbGFyIHZhbHVlIHRvIHRoZSBnaXZlbiBpbmRleCBvbiB0aGUgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdGlmKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMuc2l6ZSB8fCBpc05hTih2YWx1ZSkpIHJldHVybiBmYWxzZTtcblx0dGhpcy5fYnVmZmVyW2luZGV4XSA9IHZhbHVlO1xuXHR0aGlzLl9yZXF1ZXN0U2VuZCgpO1xuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKiBXcml0ZSBhbiBhcnJheSBvZiB2YWx1ZXMgdG8gdGhlIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUud3JpdGVBbGwgPSBmdW5jdGlvbih2YWx1ZXMpe1xuXHRpZighQXJyYXkuaXNBcnJheSh2YWx1ZXMpIHx8IHZhbHVlcy5sZW5ndGggIT09IHRoaXMuc2l6ZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8dmFsdWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYoaXNOYU4odmFsdWVzW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLl9idWZmZXJbaV0gPSB2YWx1ZXNbaV07XG4gICAgfVxuICAgIHRoaXMuX3JlcXVlc3RTZW5kKCk7XG59O1xuXG4vKiogQXNrIHRvIHNlbmQgdGhlIGludGVybmFsIGRhdGEgYnVmZmVyIHRocm91Z2ggdGhlIGRhdGFjaGFubmVsIGF0IHRoZSBkZWZpbmVkIGZyZXF1ZW5jeSAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX3JlcXVlc3RTZW5kID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdFNlbmRUaW1lc3RhbXA7XG5cdHZhciBwZXJpb2QgPSAxMDAwIC8gdGhpcy5mcmVxdWVuY3k7XG5cdGlmKGVsYXBzZWRUaW1lID49IHBlcmlvZCkgZG9TZW5kKCk7XG5cdGVsc2UgaWYoIXRoaXMuX3NlbmRSZXF1ZXN0ZWQpIHtcblx0XHR0aGlzLl9zZW5kUmVxdWVzdGVkID0gdHJ1ZTtcblx0XHRzZXRUaW1lb3V0KGRvU2VuZCwgcGVyaW9kIC0gZWxhcHNlZFRpbWUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZG9TZW5kKCkge1xuXHRcdHRoYXQuX3NlbmRSZXF1ZXN0ZWQgPSBmYWxzZTtcblx0XHR0aGF0Ll9sYXN0U2VuZFRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdHZhciByZXQgPSB0aGF0Ll9zZW5kKHRoYXQuX2J1ZmZlcik7XG5cdFx0Ly9JZiBhdXRvc2VuZCBpcyBzZXQsIGF1dG9tYXRpY2FsbHkgc2VuZCBidWZmZXIgYXQgdGhlIGdpdmVuIGZyZXF1ZW5jeVxuXHRcdGlmKHJldCAmJiB0aGF0LmF1dG9zZW5kKSB0aGF0Ll9yZXF1ZXN0U2VuZCgpO1xuXHR9XG59O1xuXG4vKiogQWN0dWFsIHNlbmQgdGhlIGludGVybmFsIGRhdGEgYnVmZmVyIHRocm91Z2ggdGhlIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbihtc2cpe1xuXHRpZih0aGlzLmNsb3NlZCB8fCAhdGhpcy5jaGFubmVsKSByZXR1cm4gZmFsc2U7XG5cdGVsc2UgaWYodGhpcy5jaGFubmVsLnJlYWR5U3RhdGUgPT09ICdvcGVuJykge1xuXHRcdHRyeSB7XG5cdFx0XHR0aGlzLmNoYW5uZWwuc2VuZChtc2cpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gZXhjZXB0aW9uIG9jY3VyZWQgd2hpbGUgc2VuZGluZyBkYXRhJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKCdbcnRjLmNoYW5uZWwud3JpdGVdIHdhcm5pbmcgOiB3ZWJydGMgZGF0YWNoYW5uZWwgc3RhdGUgPSAnK3RoaXMuY2hhbm5lbC5yZWFkeVN0YXRlKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKiBDYWxsZWQgd2hlbiBhIG1lc3NhZ2UgaXMgcmVjZWl2ZWQgZnJvbSB0aGUgY2hhbm5lbCdzIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX29uTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0dmFyIHZhbEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShtZXNzYWdlLmRhdGEpO1xuXHR0aGlzLmVtaXQoJ3ZhbHVlJywgdmFsQXJyYXkpO1xufTtcblxuLyoqIENhbGxlZCB3aGVuIHRoZSBjaGFubmVsIGlzIGNsb3NlZCBvbiB0aGUgcmVtb3RlIHNpZGUgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9vbkNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKCdDbG9zZSBkYXRhY2hhbm5lbCAnK3RoaXMubmFtZSk7XG5cdHRoaXMuZW1pdCgnY2xvc2UnKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8gUlRDIFBlZXIgaW1wbGVtZW50YXRpb24gLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIEFuIFJUQyBQZWVyIGFzc29jaWF0ZWQgdG8gYSBzaW5nbGUgKERpeWFOb2RlIHBlZXJJZCwgcHJvbUlkKSBjb3VwbGUuXG4gKiBAcGFyYW0gZG5JZCA6IFRoZSBEaXlhTm9kZSBwZWVySWRcbiAqIEBwYXJhbSBydGMgOiBUaGUgUlRDIGRpeWEtc2RrIGluc3RhbmNlXG4gKiBAcGFyYW0gaWQgOiB0aGUgcHJvbUlkXG4gKiBAcGFyYW0gY2hhbm5lbHMgOiBhbiBhcnJheSBvZiBSVEMgY2hhbm5lbCBuYW1lcyB0byBvcGVuXG4gKi9cbmZ1bmN0aW9uIFBlZXIoZG5JZCwgcnRjLCBpZCwgY2hhbm5lbHMpe1xuXHR0aGlzLmRuID0gZDEoZG5JZCk7XG5cdHRoaXMuZG5JZCA9IGRuSWQ7XG5cdHRoaXMuaWQgPSBpZDtcblx0dGhpcy5jaGFubmVscyA9IGNoYW5uZWxzO1xuXHR0aGlzLnJ0YyA9IHJ0Yztcblx0dGhpcy5wZWVyID0gbnVsbDtcblxuXHR0aGlzLnN0cmVhbXMgPSBbXTtcblxuXHR0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xuXG5cdHRoaXMuX2Nvbm5lY3QoKTtcbn1cblxuLyoqIEluaXRpYXRlIGEgUlRDIGNvbm5lY3Rpb24gdG8gdGhpcyBQZWVyICovXG5QZWVyLnByb3RvdHlwZS5fY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLnN1YnNjcmlwdGlvbiA9IHRoaXMuZG4uc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAncnRjJywgZnVuYzogJ0Nvbm5lY3QnLCBvYmo6IHRoaXMuY2hhbm5lbHMsIGRhdGE6IHsgcHJvbUlEOiB0aGlzLmlkIH1cblx0fSwgZnVuY3Rpb24oZGl5YSwgZXJyLCBkYXRhKXtcblx0XHRpZihkYXRhKSB7XG5cdFx0XHRpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1R1cm5JbmZvJykgdGhhdC5fdHVybmluZm8gPSBkYXRhLnR1cm47XG5cdFx0XHRlbHNlIGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUmVtb3RlT2ZmZXInKSB0aGF0Ll9jcmVhdGVQZWVyKGRhdGEpO1xuXHRcdFx0ZWxzZSBpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZUlDRUNhbmRpZGF0ZScpIHRoYXQuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZShkYXRhKTtcblx0XHR9XG5cdH0pO1xuXG5cdHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgaWYoIXRoYXQuY29ubmVjdGVkICYmICF0aGF0LmNsb3NlZCkgdGhhdC5fcmVjb25uZWN0KCk7IH0sIDQwMDAwKTtcbn07XG5cbi8qKiBSZWNvbm5lY3RzIHRoZSBSVEMgcGVlciAqL1xuUGVlci5wcm90b3R5cGUuX3JlY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuY2xvc2UoKTtcblxuXHR0aGlzLnBlZXIgPSBudWxsO1xuXHR0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xuXG5cdHRoaXMuX2Nvbm5lY3QoKTtcbn07XG5cblxuLyoqIENyZWF0ZXMgYSBSVENQZWVyQ29ubmVjdGlvbiBpbiByZXNwb25zZSB0byBhIFJlbW90ZU9mZmVyICovXG5QZWVyLnByb3RvdHlwZS5fY3JlYXRlUGVlciA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIGljZVNlcnZlcnMgPSBbXTtcblx0aWYodGhpcy5fdHVybmluZm8pIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5fdHVybmluZm8pKSB7XG5cdFx0XHRpY2VTZXJ2ZXJzLnB1c2goeyBcblx0XHRcdFx0dXJsczogWyB0aGlzLl90dXJuaW5mby51cmwgXSwgXG5cdFx0XHRcdHVzZXJuYW1lOiB0aGlzLl90dXJuaW5mby51c2VybmFtZSwgXG5cdFx0XHRcdGNyZWRlbnRpYWw6IHRoaXMuX3R1cm5pbmZvLnBhc3N3b3JkIFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGljZVNlcnZlcnMgPSB0aGlzLl90dXJuaW5mby5tYXAoZnVuY3Rpb24odHVybikgeyBcblx0XHRcdFx0cmV0dXJuIHsgXG5cdFx0XHRcdFx0dXJsczogWyB0dXJuLnVybCBdLCBcblx0XHRcdFx0XHR1c2VybmFtZTogdHVybi51c2VybmFtZSwgXG5cdFx0XHRcdFx0Y3JlZGVudGlhbDogdHVybi5wYXNzd29yZCBcblx0XHRcdFx0fSBcblx0XHRcdH0pO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRpY2VTZXJ2ZXJzLnB1c2goe3VybHM6IFsgXCJzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyXCIgXX0pO1xuXHR9XG5cdFxuXHR2YXIgY29uZmlnID0ge1xuXHRcdGljZVNlcnZlcnM6IGljZVNlcnZlcnMsXG5cdFx0aWNlVHJhbnNwb3J0UG9saWN5OiAnYWxsJ1xuXHR9O1xuXG5cdHZhciBjb25zdHJhaW50cyA9IHtcblx0XHRtYW5kYXRvcnk6IHtEdGxzU3J0cEtleUFncmVlbWVudDogdHJ1ZSwgT2ZmZXJUb1JlY2VpdmVBdWRpbzogdHJ1ZSwgT2ZmZXJUb1JlY2VpdmVWaWRlbzp0cnVlfVxuXHR9XG5cdFxuXHR0aGlzLl9wZWVySWQgPSBkYXRhLnBlZXJJZDtcblxuXHR2YXIgcGVlciA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihjb25maWcsICBjb25zdHJhaW50cyk7XG5cdHRoaXMucGVlciA9IHBlZXI7XG5cblx0dGhpcy5zdHJlYW1zLmZvckVhY2goZnVuY3Rpb24ocykge1xuXHRcdHBlZXIuYWRkU3RyZWFtKHMpO1xuXHR9KTtcblxuXHRwZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe3NkcDogZGF0YS5zZHAsIHR5cGU6IGRhdGEudHlwZX0pKTtcblxuXHRwZWVyLmNyZWF0ZUFuc3dlcihmdW5jdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKXtcblx0XHQvL2Zhdm9yIFZQOSBpbnN0ZWFkIG9mIFZQOFxuXHRcdHNlc3Npb25fZGVzY3JpcHRpb24uc2RwID0gc2Vzc2lvbl9kZXNjcmlwdGlvbi5zZHAucmVwbGFjZSgvU0FWUEYgMTAwIDEwMS9nLCAnU0FWUEYgMTAxIDEwMCcpO1xuXG5cdFx0cGVlci5zZXRMb2NhbERlc2NyaXB0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pO1xuXG5cdFx0dGhhdC5kbi5yZXF1ZXN0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0Fuc3dlcicsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHByb21JRDogZGF0YS5wcm9tSUQsXG5cdFx0XHRcdHBlZXJJZDogZGF0YS5wZWVySWQsXG5cdFx0XHRcdHNkcDogc2Vzc2lvbl9kZXNjcmlwdGlvbi5zZHAsXG5cdFx0XHRcdHR5cGU6IHNlc3Npb25fZGVzY3JpcHRpb24udHlwZVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRmdW5jdGlvbihlcnIpeyBjb25zb2xlLmxvZyhlcnIpOyB9LFxuXHR7J21hbmRhdG9yeSc6IHsgT2ZmZXJUb1JlY2VpdmVBdWRpbzogdHJ1ZSwgT2ZmZXJUb1JlY2VpdmVWaWRlbzogdHJ1ZX19KTtcblxuXHRwZWVyLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcblx0XHRpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Nvbm5lY3RlZCcpe1xuXHRcdFx0dGhhdC5jb25uZWN0ZWQgPSB0cnVlO1xuXHRcdFx0aWYodGhhdC5zdWJzY3JpcHRpb24pIHRoYXQuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdkaXNjb25uZWN0ZWQnIHx8IHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnY2xvc2VkJyB8fCBwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2ZhaWxlZCcpe1xuXHRcdFx0aWYoIXRoYXQuY2xvc2VkKSB0aGF0Ll9yZWNvbm5lY3QoKTtcblx0XHR9XG5cdH07XG5cblx0cGVlci5vbmljZWNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGV2dCl7XG5cdFx0dGhhdC5kbi5yZXF1ZXN0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0lDRUNhbmRpZGF0ZScsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHBlZXJJZDogZGF0YS5wZWVySWQsXG5cdFx0XHRcdHByb21JRDogdGhhdC5pZCxcblx0XHRcdFx0Y2FuZGlkYXRlOiBldnQuY2FuZGlkYXRlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cGVlci5vbmRhdGFjaGFubmVsID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0dGhhdC5ydGMuX29uRGF0YUNoYW5uZWwodGhhdC5kbklkLCBldnQuY2hhbm5lbCk7XG5cdH07XG5cblx0cGVlci5vbmFkZHN0cmVhbSA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25BZGRTdHJlYW0odGhhdC5kbklkLCBldnQuc3RyZWFtKTtcblx0fTtcbn07XG5cblxuUGVlci5wcm90b3R5cGUuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR0cnkge1xuXHRcdHZhciBjYW5kaWRhdGUgPSBuZXcgUlRDSWNlQ2FuZGlkYXRlKGRhdGEuY2FuZGlkYXRlKTtcblx0XHR0aGlzLnBlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSwgZnVuY3Rpb24oKXt9LGZ1bmN0aW9uKGVycil7IGNvbnNvbGUuZXJyb3IoZXJyKTtcdH0pO1xuXHR9IGNhdGNoKGVycikgeyBjb25zb2xlLmVycm9yKGVycik7IH1cbn07XG5cbi8qKiBTZW5kIHRoZSBtYXBwaW5ncyBmcm9tIGNoYW5uZWwgbmFtZXMgdG8gc3RyZWFtIElEcyAqL1xuUGVlci5wcm90b3R5cGUuc2VuZENoYW5uZWxzU3RyZWFtc01hcHBpbmdzID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZG4ucmVxdWVzdCh7XG5cdFx0c2VydmljZTpcInJ0Y1wiLFxuXHRcdGZ1bmM6XCJDaGFubmVsc1N0cmVhbXNNYXBwaW5nc1wiLFxuXHRcdGRhdGE6e3BlZXJJZDowLCBtYXBwaW5nczp0aGlzLnJ0Y1t0aGlzLmRuSWRdLmNoYW5uZWxzQnlTdHJlYW19XG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0fSk7XG59O1xuXG4vKiogQWRkcyBhIGxvY2FsIHN0cmVhbSB0byB0aGlzIFBlZXIgKi9cblBlZXIucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR0aGlzLnNlbmRDaGFubmVsc1N0cmVhbXNNYXBwaW5ncygpO1xuXHRpZighdGhpcy5zdHJlYW1zLmZpbHRlcihmdW5jdGlvbihzKXtyZXR1cm4gc3RyZWFtLmlkID09PSBzO30pWzBdKSB0aGlzLnN0cmVhbXMucHVzaChzdHJlYW0pO1xuXHR0aGlzLl9yZWNvbm5lY3QoKTtcbn1cblxuUGVlci5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG5cdHRoaXMuc3RyZWFtcyA9IHRoaXMuc3RyZWFtcy5maWx0ZXIoZnVuY3Rpb24ocyl7cmV0dXJuIHN0cmVhbS5pZCAhPT0gczt9KTtcblx0aWYodGhpcy5wZWVyKSB0aGlzLnBlZXIucmVtb3ZlU3RyZWFtKHN0cmVhbSk7XG59XG5cblBlZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0aWYodGhpcy5zdWJzY3JpcHRpb24pIHRoaXMuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdHRoaXMuZG4ucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJydGNcIixcblx0XHRmdW5jOiBcIkNsb3NlXCIsXG5cdFx0ZGF0YToge1xuXHRcdFx0cGVlcklkOiB0aGlzLl9wZWVySWQsXG5cdFx0XHRwcm9tSUQ6IHRoaXMuaWRcblx0XHR9XG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFxuXHR9KTtcblx0Y2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRJZCk7XG5cdGlmKHRoaXMucGVlcil7XG5cdFx0dHJ5e1xuXHRcdFx0dGhpcy5wZWVyLmNsb3NlKCk7XG5cdFx0fWNhdGNoKGUpe31cblx0XHR0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY2xvc2VkID0gdHJ1ZTtcblx0fVxufTtcblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gUlRDIHNlcnZpY2UgaW1wbGVtZW50YXRpb24gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cblxuZnVuY3Rpb24gUlRDKHNlbGVjdG9yKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscyA9IFtdO1xuXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0gPSBbXTtcbn1cblxuUlRDLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihuYW1lX3JlZ2V4LCB0eXBlLCBvbmRhdGFjaGFubmVsX2NhbGxiYWNrLCBvbmFkZHN0cmVhbV9jYWxsYmFjayl7XG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMucHVzaCh7cmVnZXg6IG5hbWVfcmVnZXgsIHR5cGU6dHlwZSwgY2I6IG9uZGF0YWNoYW5uZWxfY2FsbGJhY2ssIHN0cmVhbV9jYjogb25hZGRzdHJlYW1fY2FsbGJhY2t9KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKiogU3RhcnQgbGlzdGVuaW5nIHRvIFBlZXJzIGNvbm5lY3Rpb25zLlxuICogQSAnUGVlcicgb2JqZWN0IHdpbGwgYmUgY3JlYXRlZCBmb3IgZWFjaCBEaXlhTm9kZSBwZWVySWQgYW5kIGVhY2ggcHJvbUlEXG4gKi9cblJUQy5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXG5cdHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdQZWVycydcblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblxuXHRcdGlmKCF0aGF0W2RuSWRdKSB0aGF0Ll9jcmVhdGVEaXlhTm9kZShkbklkKTtcblxuXHRcdGlmKGVyciA9PT0gJ1N1YnNjcmlwdGlvbkNsb3NlZCcgfHwgZXJyID09PSAnUGVlckRpc2Nvbm5lY3RlZCcpe1xuXHRcdFx0dGhhdC5fY2xvc2VEaXlhTm9kZShkbklkKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0aWYoZGF0YSAmJiBkYXRhLmV2ZW50VHlwZSAmJiBkYXRhLnByb21JRCAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0aWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ29ubmVjdGVkJyl7XG5cdFx0XHRcdGlmKCF0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSl7XG5cdFx0XHRcdFx0dmFyIGNoYW5uZWxzID0gdGhhdC5fbWF0Y2hDaGFubmVscyhkbklkLCBkYXRhLmNoYW5uZWxzKTtcblx0XHRcdFx0XHRpZihjaGFubmVscy5sZW5ndGggPiAwKXtcblx0XHRcdFx0XHRcdHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdID0gbmV3IFBlZXIoZG5JZCwgdGhhdCwgZGF0YS5wcm9tSUQsIGNoYW5uZWxzKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBBdXRvcmVjb25uZWN0IGRlY2xhcmVkIHN0cmVhbXNcblx0XHRcdFx0XHR0aGF0LmNoYW5uZWxzQnlTdHJlYW0uZm9yRWFjaChmdW5jdGlvbihjYnMpIHtcblx0XHRcdFx0XHRcdHRoYXQuYWRkU3RyZWFtKGNicy5jaGFubmVsLCBjYnMubWVkaWFTdHJlYW0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdKSB0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXS5zZW5kQ2hhbm5lbHNTdHJlYW1zTWFwcGluZ3MoKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ2xvc2VkJykge1xuXHRcdFx0XHRpZih0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSkge1xuXHRcdFx0XHRcdHRoYXQuX2Nsb3NlUGVlcihkbklkLCBkYXRhLnByb21JRCk7XG5cdFx0XHRcdFx0aWYodHlwZW9mIHRoYXQub25jbG9zZSA9PT0gJ2Z1bmN0aW9uJykgdGhhdC5vbmNsb3NlKGRuSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSwge2F1dG86IHRydWV9KTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblJUQy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLnNlbGVjdG9yLmVhY2goZnVuY3Rpb24oZG5JZCl7XG5cdFx0aWYoIXRoYXRbZG5JZF0pIHJldHVybiA7XG5cdFx0Zm9yKHZhciBwcm9tSUQgaW4gdGhhdFtkbklkXS5wZWVycyl7XG5cdFx0XHR0aGF0Ll9jbG9zZVBlZXIoZG5JZCwgcHJvbUlEKTtcblx0XHR9XG5cdH0pO1xuXG5cdGlmKHRoaXMuc3Vic2NyaXB0aW9uKSB0aGlzLnN1YnNjcmlwdGlvbi5jbG9zZSgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuUlRDLnByb3RvdHlwZS5fY3JlYXRlRGl5YU5vZGUgPSBmdW5jdGlvbihkbklkKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXNbZG5JZF0gPSB7XG5cdFx0ZG5JZDogZG5JZCxcblx0XHR1c2VkQ2hhbm5lbHM6IFtdLFxuXHRcdHJlcXVlc3RlZENoYW5uZWxzOiBbXSxcblx0XHRwZWVyczogW10sXG5cdFx0Y2hhbm5lbHNCeVN0cmVhbTogW11cblx0fVxuXG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMuZm9yRWFjaChmdW5jdGlvbihjKXt0aGF0W2RuSWRdLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goYyl9KTtcbn07XG5cblJUQy5wcm90b3R5cGUuX2Nsb3NlRGl5YU5vZGUgPSBmdW5jdGlvbihkbklkKXtcblx0Zm9yKHZhciBwcm9tSUQgaW4gdGhpc1tkbklkXS5wZWVycyl7XG5cdFx0dGhpcy5fY2xvc2VQZWVyKGRuSWQsIHByb21JRCk7XG5cdH1cblxuXHRkZWxldGUgdGhpc1tkbklkXTtcbn07XG5cblJUQy5wcm90b3R5cGUuX2Nsb3NlUGVlciA9IGZ1bmN0aW9uKGRuSWQsIHByb21JRCl7XG5cdGlmKHRoaXNbZG5JZF0ucGVlcnNbcHJvbUlEXSl7XG5cdFx0dmFyIHAgPSB0aGlzW2RuSWRdLnBlZXJzW3Byb21JRF07XG5cdFx0cC5jbG9zZSgpO1xuXG5cdFx0Zm9yKHZhciBpPTA7aTxwLmNoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHRcdGRlbGV0ZSB0aGlzW2RuSWRdLnVzZWRDaGFubmVsc1twLmNoYW5uZWxzW2ldXTtcblx0XHR9XG5cblx0XHRkZWxldGUgdGhpc1tkbklkXS5wZWVyc1twcm9tSURdO1xuXHR9XG59O1xuXG4vKiogTWF0Y2hlcyB0aGUgZ2l2ZW4gcmVjZWl2ZWRDaGFubmVscyBwcm9wb3NlZCBieSB0aGUgZ2l2ZW4gRGl5YU5vZGUgcGVlcklkXG4gKiAgYWdhaW5zdCB0aGUgcmVxdWVzdGVkIGNoYW5uZWxzIGFuZCBjcmVhdGVzIGEgQ2hhbm5lbCBmb3IgZWFjaCBtYXRjaFxuICovXG5SVEMucHJvdG90eXBlLl9tYXRjaENoYW5uZWxzID0gZnVuY3Rpb24oZG5JZCwgcmVjZWl2ZWRDaGFubmVscyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR2YXIgY2hhbm5lbHMgPSBbXTtcblxuXHRmb3IodmFyIGkgPSAwOyBpIDwgcmVjZWl2ZWRDaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIG5hbWUgPSByZWNlaXZlZENoYW5uZWxzW2ldO1xuXHRcdHZhciByZW1vdGVTdHJlYW1JZCA9IG5hbWUuc3BsaXQoXCJfOzpfXCIpWzFdO1xuXHRcdG5hbWUgPSBuYW1lLnNwbGl0KFwiXzs6X1wiKVswXTtcblxuXHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGF0W2RuSWRdLnJlcXVlc3RlZENoYW5uZWxzLmxlbmd0aDsgaisrKXtcblx0XHRcdHZhciByZXEgPSB0aGF0W2RuSWRdLnJlcXVlc3RlZENoYW5uZWxzW2pdO1xuXG5cdFx0XHRpZihuYW1lICYmIG5hbWUubWF0Y2gocmVxLnJlZ2V4KSAmJiAhdGhhdFtkbklkXS51c2VkQ2hhbm5lbHNbbmFtZV0pe1xuXHRcdFx0XHR2YXIgY2hhbm5lbCA9IG5ldyBDaGFubmVsKGRuSWQsIG5hbWUsIHJlcS5jYiwgcmVxLnN0cmVhbV9jYik7XG5cdFx0XHRcdHRoYXRbZG5JZF0udXNlZENoYW5uZWxzW25hbWVdID0gY2hhbm5lbDtcblx0XHRcdFx0Y2hhbm5lbHMucHVzaChuYW1lKTtcblxuXHRcdFx0XHQvLyBJZiBhIHN0cmVhbSBpZCBpcyBwcm92aWRlZCBmb3IgdGhlIGNoYW5uZWwsIHJlZ2lzdGVyIHRoZSBtYXBwaW5nXG5cdFx0XHRcdGlmKHJlbW90ZVN0cmVhbUlkKSB7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuc3RyZWFtICE9PSByZW1vdGVTdHJlYW1JZCAmJiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbDsgfSk7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLnB1c2goe3N0cmVhbTpyZW1vdGVTdHJlYW1JZCwgY2hhbm5lbDpjaGFubmVsfSk7XG5cdFx0XHRcdFx0Y2hhbm5lbC5zdHJlYW1JZCA9IHN0cmVhbUlkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBsb2NhbFN0cmVhbUlkID0gdGhhdC5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCA9PT0gbmFtZTsgfSlbMF07XG5cdFx0XHRcdGlmKGxvY2FsU3RyZWFtSWQpIHtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5zdHJlYW0gIT09IGxvY2FsU3RyZWFtSWQgJiYgY2JzLmNoYW5uZWwgIT09IG5hbWU7IH0pO1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtzdHJlYW06bG9jYWxTdHJlYW1JZCwgY2hhbm5lbDpuYW1lfSk7XG5cdFx0XHRcdFx0Y2hhbm5lbC5sb2NhbFN0cmVhbUlkID0gbG9jYWxTdHJlYW1JZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiAgY2hhbm5lbHM7XG59O1xuXG5cbi8qKiBDYWxsZWQgdXBvbiBSVEMgZGF0YWNoYW5uZWxzIGNvbm5lY3Rpb25zICovXG5SVEMucHJvdG90eXBlLl9vbkRhdGFDaGFubmVsID0gZnVuY3Rpb24oZG5JZCwgZGF0YWNoYW5uZWwpe1xuXHRpZighdGhpc1tkbklkXSkgcmV0dXJuIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIG9wZW4gYSBkYXRhIGNoYW5uZWwgb24gYSBjbG9zZWQgcGVlclwiKTtcblx0dmFyIGNoYW5uZWwgPSB0aGlzW2RuSWRdLnVzZWRDaGFubmVsc1tkYXRhY2hhbm5lbC5sYWJlbF07XG5cblx0aWYoIWNoYW5uZWwpe1xuXHRcdGNvbnNvbGUubG9nKFwiRGF0YWNoYW5uZWwgXCIrZGF0YWNoYW5uZWwubGFiZWwrXCIgdW5tYXRjaGVkLCBjbG9zaW5nICFcIik7XG5cdFx0ZGF0YWNoYW5uZWwuY2xvc2UoKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cdGNoYW5uZWwuc2V0RGF0YUNoYW5uZWwoZGF0YWNoYW5uZWwpO1xufTtcblxuLyoqIENhbGxlZCB1cG9uIFJUQyBzdHJlYW0gY2hhbm5lbCBjb25uZWN0aW9ucyAqL1xuUlRDLnByb3RvdHlwZS5fb25BZGRTdHJlYW0gPSBmdW5jdGlvbihkbklkLCBzdHJlYW0pIHtcblx0aWYoIXRoaXNbZG5JZF0pIHJldHVybiBjb25zb2xlLndhcm4oXCJUcmllZCB0byBvcGVuIGEgc3RyZWFtIG9uIGEgY2xvc2VkIHBlZXJcIik7XG5cblx0dmFyIGNoYW5uZWwgPSB0aGlzW2RuSWRdLnVzZWRDaGFubmVsc1tzdHJlYW0uaWRdO1xuXG5cdGlmKCFjaGFubmVsKXtcblx0XHRjb25zb2xlLndhcm4oXCJTdHJlYW0gQ2hhbm5lbCBcIisgc3RyZWFtLmlkICtcIiB1bm1hdGNoZWQsIGNsb3NpbmcgIVwiKTtcblx0XHRzdHJlYW0uY2xvc2UoKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cdGNoYW5uZWwub25BZGRTdHJlYW0oc3RyZWFtKTtcbn07XG5cbi8qKiBBZGQgYSBsb2NhbCBzdHJlYW0gdG8gYmUgc2VudCB0aHJvdWdoIHRoZSBnaXZlbiBSVEMgY2hhbm5lbCAqL1xuUlRDLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihjaGFubmVsLCBzdHJlYW0pIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8vIFJlZ2lzdGVyIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmdcblx0dGhpcy5jaGFubmVsc0J5U3RyZWFtID0gdGhpcy5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuIFx0dGhpcy5jaGFubmVsc0J5U3RyZWFtLnB1c2goe2NoYW5uZWw6Y2hhbm5lbCwgc3RyZWFtOnN0cmVhbS5pZCwgbWVkaWFTdHJlYW06c3RyZWFtfSk7XG5cblx0Y29uc29sZS5sb2coXCJPcGVuIGxvY2FsIHN0cmVhbSBcIiArIGNoYW5uZWwpO1xuXG5cdC8vIFNlbmQgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZyB0byBhbGwgY29ubmVjdGVkIFBlZXJzXG5cdHRoaXMuc2VsZWN0b3IuZWFjaChmdW5jdGlvbihkbklkKXtcblx0XHRpZighdGhhdFtkbklkXSkgcmV0dXJuIDtcblx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG5cdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLnB1c2goe2NoYW5uZWw6Y2hhbm5lbCwgc3RyZWFtOnN0cmVhbS5pZH0pO1xuXHRcdGZvcih2YXIgcHJvbUlEIGluIHRoYXRbZG5JZF0ucGVlcnMpe1xuXHRcdFx0dGhhdFtkbklkXS5wZWVyc1twcm9tSURdLmFkZFN0cmVhbShzdHJlYW0pO1xuXHRcdH1cblx0fSk7XG5cbn07XG5cblJUQy5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oY2hhbm5lbCwgc3RyZWFtKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvLyBSZWdpc3RlciB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nXG5cdHRoaXMuY2hhbm5lbHNCeVN0cmVhbSA9IHRoaXMuY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcblxuXHRjb25zb2xlLmxvZyhcIkNsb3NlIGxvY2FsIHN0cmVhbSBcIiArIGNoYW5uZWwpO1xuXG5cdC8vIFNlbmQgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZyB0byBhbGwgY29ubmVjdGVkIFBlZXJzXG5cdHRoaXMuc2VsZWN0b3IuZWFjaChmdW5jdGlvbihkbklkKXtcblx0XHRpZighdGhhdFtkbklkXSkgcmV0dXJuIDtcblx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG5cdFx0Zm9yKHZhciBwcm9tSUQgaW4gdGhhdFtkbklkXS5wZWVycyl7XG5cdFx0XHR0aGF0W2RuSWRdLnBlZXJzW3Byb21JRF0ucmVtb3ZlU3RyZWFtKHN0cmVhbSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUucnRjID0gZnVuY3Rpb24oKXsgcmV0dXJuIG5ldyBSVEModGhpcyk7fTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG4vKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gdHJ1ZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLyoqXG4gKlx0Y2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIFN0YXR1cyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcblxuXHQvKiogbW9kZWwgb2Ygcm9ib3QgOiBhdmFpbGFibGUgcGFydHMgYW5kIHN0YXR1cyAqKi9cblx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdHRoaXMuX3JvYm90TW9kZWxJbml0ID0gZmFsc2U7XG5cblx0LyoqKiBzdHJ1Y3R1cmUgb2YgZGF0YSBjb25maWcgKioqXG5cdFx0IGNyaXRlcmlhIDpcblx0XHQgICB0aW1lOiBhbGwgMyB0aW1lIGNyaXRlcmlhIHNob3VsZCBub3QgYmUgZGVmaW5lZCBhdCB0aGUgc2FtZSB0aW1lLiAocmFuZ2Ugd291bGQgYmUgZ2l2ZW4gdXApXG5cdFx0ICAgICBiZWc6IHtbbnVsbF0sdGltZX0gKG51bGwgbWVhbnMgbW9zdCByZWNlbnQpIC8vIHN0b3JlZCBhIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgZW5kOiB7W251bGxdLCB0aW1lfSAobnVsbCBtZWFucyBtb3N0IG9sZGVzdCkgLy8gc3RvcmVkIGFzIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgcmFuZ2U6IHtbbnVsbF0sIHRpbWV9IChyYW5nZSBvZiB0aW1lKHBvc2l0aXZlKSApIC8vIGluIHMgKG51bSlcblx0XHQgICByb2JvdDoge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCAgIHBsYWNlOiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0IG9wZXJhdG9yOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9IC0oIG1heWJlIG1veSBzaG91bGQgYmUgZGVmYXVsdFxuXHRcdCAuLi5cblxuXHRcdCBwYXJ0cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBQYXJ0c0lkfSB0byBnZXQgZXJyb3JzXG5cdFx0IHN0YXR1cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTdGF0dXNOYW1lfSB0byBnZXQgc3RhdHVzXG5cblx0XHQgc2FtcGxpbmc6IHtbbnVsbF0gb3IgaW50fVxuXHQqL1xuXHR0aGlzLmRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHtcblx0XHRcdFx0YmVnOiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbFxuXHRcdH0sXG5cdFx0b3BlcmF0b3I6ICdsYXN0Jyxcblx0XHRwYXJ0czogbnVsbCxcblx0XHRzdGF0dXM6IG51bGxcblx0fTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG4vKipcbiAqIEdldCByb2JvdE1vZGVsIDpcbiAqIHtcbiAqICBwYXJ0czoge1xuICpcdFx0XCJwYXJ0WFhcIjoge1xuICogXHRcdFx0IGVycm9yc0Rlc2NyOiB7IGVuY291bnRlcmVkIGVycm9ycyBpbmRleGVkIGJ5IGVycm9ySWRzPjAgfVxuICpcdFx0XHRcdD4gQ29uZmlnIG9mIGVycm9ycyA6XG4gKlx0XHRcdFx0XHRjcml0TGV2ZWw6IEZMT0FULCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqIFx0XHRcdFx0XHRtc2c6IFNUUklORyxcbiAqXHRcdFx0XHRcdHN0b3BTZXJ2aWNlSWQ6IFNUUklORyxcbiAqXHRcdFx0XHRcdHJ1blNjcmlwdDogU2VxdWVsaXplLlNUUklORyxcbiAqXHRcdFx0XHRcdG1pc3Npb25NYXNrOiBTZXF1ZWxpemUuSU5URUdFUixcbiAqXHRcdFx0XHRcdHJ1bkxldmVsOiBTZXF1ZWxpemUuSU5URUdFUlxuICpcdFx0XHRlcnJvcjpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHR9LFxuICpcdCBcdC4uLiAoXCJQYXJ0WVlcIilcbiAqICB9LFxuICogIHN0YXR1czoge1xuICpcdFx0XCJzdGF0dXNYWFwiOiB7XG4gKlx0XHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHRcdHRpbWU6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRcdHJvYm90OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHRcdFx0cmFuZ2U6IFtGTE9BVCwgRkxPQVRdLFxuICpcdFx0XHRcdGxhYmVsOiBzdHJpbmdcbiAqXHRcdFx0fSxcbiAqXHQgXHQuLi4gKFwiU3RhdHVzWVlcIilcbiAqICB9XG4gKiB9XG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0Um9ib3RNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnJvYm90TW9kZWw7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tU3RhdHVzXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtTdGF0dXN9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBiZWcgYW5kIGVuZC5cbiAqIElmIHBhcmFtIGRlZmluZWRcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVCZWcgLy8gbWF5IGJlIG51bGxcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVFbmQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcmV0dXJuIHtTdGF0dXN9IHRoaXNcbiAqIElmIG5vIHBhcmFtIGRlZmluZWQ6XG4gKlx0QHJldHVybiB7T2JqZWN0fSBUaW1lIG9iamVjdDogZmllbGRzIGJlZyBhbmQgZW5kLlxuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZUJlZyxuZXdUaW1lRW5kLCBuZXdSYW5nZSl7XG5cdGlmKG5ld1RpbWVCZWcgfHwgbmV3VGltZUVuZCB8fCBuZXdSYW5nZSkge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyA9IG5ld1RpbWVCZWcuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCA9IG5ld1RpbWVFbmQuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlID0gbmV3UmFuZ2U7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB7XG5cdFx0XHRiZWc6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzIC8vIG5vdCByZWxldmFudD8sIG5vdCBpbXBsZW1lbnRlZCB5ZXRcbiAqIFNldCBwbGFjZSBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHBsYWNlSWRzIGxpc3Qgb2YgcGxhY2UgSWRzXG4gKiBHZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiBwbGFjZSBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUGxhY2VJZHMgPSBmdW5jdGlvbihwbGFjZUlkcyl7XG5cdGlmKHBsYWNlSWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnBsYWNlSWQgPSBwbGFjZUlkcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZTtcbn07XG4vKipcbiAqIEdldCBkYXRhIGJ5IHNlbnNvciBuYW1lLlxuICpcdEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gc2Vuc29yTmFtZSBsaXN0IG9mIHNlbnNvcnNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5nZXREYXRhQnlOYW1lID0gZnVuY3Rpb24oc2Vuc29yTmFtZXMpe1xuXHR2YXIgZGF0YT1bXTtcblx0Zm9yKHZhciBuIGluIHNlbnNvck5hbWVzKSB7XG5cdFx0ZGF0YS5wdXNoKHRoaXMuZGF0YU1vZGVsW3NlbnNvck5hbWVzW25dXSk7XG5cdH1cblx0cmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byBlcnJvci9zdGF0dXMgdXBkYXRlc1xuICovXG5TdGF0dXMucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24ocm9ib3ROYW1lcywgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKHJvYm90TmFtZXMpO1xuXG5cdHZhciBzdWJzID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdzdGF0dXMnLFxuXHRcdGZ1bmM6ICdTdGF0dXMnLFxuXHRcdGRhdGE6IHJvYm90TmFtZXNcblx0fSwgZnVuY3Rpb24gKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cocGVlcklkKTtcblx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoIFwiU3RhdHVzU3Vic2NyaWJlOlwiK2VyciApO1xuXHRcdFx0dGhhdC5jbG9zZVN1YnNjcmlwdGlvbnMoKTsgLy8gc2hvdWxkIG5vdCBiZSBuZWNlc3Nhcnlcblx0XHRcdHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID0gdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2QrMTAwMHx8MTAwMDsgLy8gaW5jcmVhc2UgZGVsYXkgYnkgMSBzZWNcblx0XHRcdGlmKHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID4gNjAwMDApIHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kPTYwMDAwOyAvLyBtYXggMW1pblxuXHRcdFx0c3Vicy53YXRjaFRlbnRhdGl2ZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHR0aGF0LndhdGNoKGRhdGEsY2FsbGJhY2spOyB9LCB0aGF0LnN1YnNjcmlwdGlvblJlcVBlcmlvZCk7IC8vIHRyeSBhZ2FpbiBsYXRlclxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGF0LnN1YnNjcmlwdGlvblJlcVBlcmlvZD0wOyAvLyByZXNldCBwZXJpb2Qgb24gc3Vic2NyaXB0aW9uIHJlcXVlc3RzXG5cdFx0aWYgKGRhdGEmJmRhdGEuZXJyJiZkYXRhLmVyci5zdCkge1xuXHRcdFx0TG9nZ2VyLmVycm9yKCBcIldhdGNoU3RhdHVzRXJyOlwiK0pTT04uc3RyaW5naWZ5KGRhdGEuZXJyKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoYXQuX2dldFJvYm90TW9kZWxGcm9tUmVjdjIoZGF0YSk7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpXG5cdFx0XHRcdGNhbGxiYWNrKHRoYXQucm9ib3RNb2RlbCk7XG5cdFx0fVxuXHR9KTtcblx0dGhpcy5zdWJzY3JpcHRpb25zLnB1c2goc3Vicyk7XG59O1xuXG4vKipcbiAqIENsb3NlIGFsbCBzdWJzY3JpcHRpb25zXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuY2xvc2VTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oKXtcblx0Zm9yKHZhciBpIGluIHRoaXMuc3Vic2NyaXB0aW9ucykge1xuXHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tpXS5jbG9zZSgpO1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLnN1YnNjcmlwdGlvbnNbaV0ud2F0Y2hUZW50YXRpdmUpO1xuXHR9XG5cdHRoaXMuc3Vic2NyaXB0aW9ucyA9W107XG5cdHRoaXMucm9ib3RNb2RlbCA9IFtdO1xufTtcblxuXG4vKipcbiAqIEdldCBkYXRhIGdpdmVuIGRhdGFDb25maWcuXG4gKiBAcGFyYW0ge2Z1bmN9IGNhbGxiYWNrIDogY2FsbGVkIGFmdGVyIHVwZGF0ZVxuICogVE9ETyBVU0UgUFJPTUlTRVxuICovXG5TdGF0dXMucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbihjYWxsYmFjaywgZGF0YUNvbmZpZyl7XG5cdHZhciB0aGF0PXRoaXM7XG5cdHZhciBkYXRhTW9kZWwgPSB7fTtcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwic3RhdHVzXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJzcGxSZXFcIixcblx0XHRcdGRhdGFDb25maWc6IHRoYXQuZGF0YUNvbmZpZ1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIltcIit0aGF0LmRhdGFDb25maWcuc2Vuc29ycytcIl0gUmVjdiBlcnI6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiVXBkYXRlRGF0YTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5yZXFDb25maWcpKTtcblx0XHRcdExvZ2dlci5lcnJvcihcIkRhdGEgcmVxdWVzdCBmYWlsZWQgKFwiK2RhdGEuaGVhZGVyLmVycm9yLnN0K1wiKTogXCIrZGF0YS5oZWFkZXIuZXJyb3IubXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly9Mb2dnZXIubG9nKEpTT04uc3RyaW5naWZ5KHRoYXQuZGF0YU1vZGVsKSk7XG5cdFx0ZGF0YU1vZGVsID0gdGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHRMb2dnZXIubG9nKHRoYXQuZ2V0RGF0YU1vZGVsKCkpO1xuXHRcdGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGF0KTsgLy8gYmluZCBjYWxsYmFjayB3aXRoIFN0YXR1c1xuXHRcdGNhbGxiYWNrKGRhdGFNb2RlbCk7IC8vIGNhbGxiYWNrIGZ1bmNcblx0fSk7XG59O1xuXG5cbi8qKlxuICogVXBkYXRlIGludGVybmFsIHJvYm90IG1vZGVsIHdpdGggcmVjZWl2ZWQgZGF0YSAodmVyc2lvbiAyKVxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgcmVjZWl2ZWQgZnJvbSBEaXlhTm9kZSBieSB3ZWJzb2NrZXRcbiAqIEByZXR1cm4ge1t0eXBlXX1cdFx0W2Rlc2NyaXB0aW9uXVxuICovXG5TdGF0dXMucHJvdG90eXBlLl9nZXRSb2JvdE1vZGVsRnJvbVJlY3YyID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciByb2JvdDtcblx0dmFyIGRhdGFSb2JvdHMgPSBkYXRhLnJvYm90cztcblx0dmFyIGRhdGFQYXJ0cyA9IGRhdGEucGFydExpc3Q7XG5cdGlmKCF0aGlzLnJvYm90TW9kZWwpXG5cdFx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdC8vIGNvbnNvbGUubG9nKFwiX2dldFJvYm90TW9kZWxGcm9tUmVjdlwiKTtcblx0Ly8gY29uc29sZS5sb2codGhpcy5yb2JvdE1vZGVsKTtcblxuXHRmb3IodmFyIG4gaW4gdGhpcy5yb2JvdE1vZGVsKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cobik7XG5cdFx0dGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzID0ge307IC8vIHJlc2V0IHBhcnRzXG5cdH1cblxuXHRmb3IodmFyIG4gaW4gZGF0YVJvYm90cykge1xuXHRcdGlmKCF0aGlzLnJvYm90TW9kZWxbbl0pXG5cdFx0XHR0aGlzLnJvYm90TW9kZWxbbl09e307XG5cdFx0dGhpcy5yb2JvdE1vZGVsW25dLnJvYm90ID0gZGF0YVJvYm90c1tuXS5yb2JvdDtcblxuXHRcdC8vIGlmKHRoaXMucm9ib3RNb2RlbC5sZW5ndGg8ZGF0YS5sZW5ndGgpIHtcblx0XHQvLyBcdHRoaXMucm9ib3RNb2RlbC5wdXNoKHtyb2JvdDogZGF0YVswXS5yb2JvdHN9KTtcblx0XHQvLyB9XG5cblx0XHQvKiogZXh0cmFjdCBwYXJ0cyBpbmZvICoqL1xuXHRcdGlmKGRhdGFSb2JvdHNbbl0gJiYgZGF0YVJvYm90c1tuXS5wYXJ0cykge1xuXHRcdFx0dmFyIHBhcnRzID0gZGF0YVJvYm90c1tuXS5wYXJ0cztcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cyA9IHt9O1xuXHRcdFx0dmFyIHJQYXJ0cyA9IHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cztcblx0XHRcdC8vIGZvcih2YXIgcSBpbiByUGFydHMpIHtcblx0XHRcdC8vIFx0LyoqIHBhcnRbcV0gd2FzIG5vdCBzZW50IGJlY2F1c2Ugbm8gZXJyb3IgKiovXG5cdFx0XHQvLyBcdGlmKCFwYXJ0c1txXVxuXHRcdFx0Ly8gXHQgICAmJnJQYXJ0c1txXS5ldnRzJiZyUGFydHNbcV0uZXZ0cy5jb2RlKSB7XG5cdFx0XHQvLyBcdFx0clBhcnRzW3FdLmV2dHMgPSB7XG5cdFx0XHQvLyBcdFx0XHRjb2RlOiAwLFxuXHRcdFx0Ly8gXHRcdFx0Y29kZVJlZjogMCxcblx0XHRcdC8vIFx0XHRcdHRpbWU6IERhdGUubm93KCkgLyoqIHVwZGF0ZSAqKi9cblx0XHRcdC8vIFx0XHR9O1xuXHRcdFx0Ly8gXHR9XG5cdFx0XHQvLyB9XG5cdFx0XHRmb3IgKHZhciBwIGluIHBhcnRzKSB7XG5cdFx0XHRcdGlmKCFyUGFydHNbcF0pIHtcblx0XHRcdFx0XHRyUGFydHNbcF09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocGFydHNbcF0pIHtcblx0XHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGNhdGVnb3J5ICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmNhdGVnb3J5PWRhdGFQYXJ0c1twXS5jYXRlZ29yeTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBuYW1lICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLm5hbWU9ZGF0YVBhcnRzW3BdLm5hbWU7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbGFiZWwgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubGFiZWw9ZGF0YVBhcnRzW3BdLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciB0aW1lICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0pO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy50aW1lKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0udGltZSk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLmNvZGUpO1xuXG5cdFx0XHRcdFx0LyoqIHVwZGF0ZSBlcnJvckxpc3QgKiovXG5cdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3QpXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0PXt9O1xuXHRcdFx0XHRcdGZvciggdmFyIGVsIGluIGRhdGFQYXJ0c1twXS5lcnJvckxpc3QgKVxuXHRcdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3RbZWxdKVxuXHRcdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0W2VsXSA9IGRhdGFQYXJ0c1twXS5lcnJvckxpc3RbZWxdO1xuXHRcdFx0XHRcdHZhciBldnRzX3RtcCA9IHtcblx0XHRcdFx0XHRcdHRpbWU6IHRoaXMuX2NvZGVyLmZyb20ocGFydHNbcF0udGltZSksXG5cdFx0XHRcdFx0XHRjb2RlOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmNvZGUpLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5jb2RlUmVmKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0LyoqIGlmIHJlY2VpdmVkIGxpc3Qgb2YgZXZlbnRzICoqL1xuXHRcdFx0XHRcdGlmKEFycmF5LmlzQXJyYXkoZXZ0c190bXAuY29kZSkgfHwgQXJyYXkuaXNBcnJheShldnRzX3RtcC50aW1lKVxuXHRcdFx0XHRcdCAgIHx8IEFycmF5LmlzQXJyYXkoZXZ0c190bXAuY29kZVJlZikpIHtcblx0XHRcdFx0XHRcdGlmKGV2dHNfdG1wLmNvZGUubGVuZ3RoID09PSBldnRzX3RtcC5jb2RlUmVmLmxlbmd0aFxuXHRcdFx0XHRcdFx0ICAgJiYgZXZ0c190bXAuY29kZS5sZW5ndGggPT09IGV2dHNfdG1wLnRpbWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdC8qKiBidWlsZCBsaXN0IG9mIGV2ZW50cyAqKi9cblx0XHRcdFx0XHRcdFx0clBhcnRzW3BdLmV2dHMgPSBbXTtcblx0XHRcdFx0XHRcdFx0Zm9yKHZhciBpPTA7IGk8ZXZ0c190bXAuY29kZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0dGltZTogZXZ0c190bXAudGltZVtpXSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvZGU6IGV2dHNfdG1wLmNvZGVbaV0sXG5cdFx0XHRcdFx0XHRcdFx0XHRjb2RlUmVmOiBldnRzX3RtcC5jb2RlUmVmW2ldfSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgTG9nZ2VyLmVycm9yKFwiU3RhdHVzOkluY29uc2lzdGFudCBsZW5ndGhzIG9mIGJ1ZmZlcnMgKHRpbWUvY29kZS9jb2RlUmVmKVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7IC8qKiBqdXN0IGluIGNhc2UsIHRvIHByb3ZpZGUgYmFja3dhcmQgY29tcGF0aWJpbGl0eSAqKi9cblx0XHRcdFx0XHRcdC8qKiBzZXQgcmVjZWl2ZWQgZXZlbnQgKiovXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXZ0cyA9IFt7XG5cdFx0XHRcdFx0XHRcdHRpbWU6IGV2dHNfdG1wLnRpbWUsXG5cdFx0XHRcdFx0XHRcdGNvZGU6IGV2dHNfdG1wLmNvZGUsXG5cdFx0XHRcdFx0XHRcdGNvZGVSZWY6IGV2dHNfdG1wLmNvZGVSZWZ9XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gY29uc29sZS5sb2coclBhcnRzW3BdLmVycm9yKTtcblx0XHRcdH1cblx0XHRcdC8vIGNvbnNvbGUubG9nKCdwYXJ0cywgclBhcnRzJyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0cyk7XG4gXHRcdC8vIFx0Y29uc29sZS5sb2coclBhcnRzKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJObyBwYXJ0cyB0byByZWFkIGZvciByb2JvdCBcIitkYXRhW25dLm5hbWUpO1xuXHRcdH1cblx0fVxufTtcblxuXG4vKipcbiAqIFVwZGF0ZSBpbnRlcm5hbCByb2JvdCBtb2RlbCB3aXRoIHJlY2VpdmVkIGRhdGFcbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBkYXRhIHJlY2VpdmVkIGZyb20gRGl5YU5vZGUgYnkgd2Vic29ja2V0XG4gKiBAcmV0dXJuIHtbdHlwZV19XHRcdFtkZXNjcmlwdGlvbl1cbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciByb2JvdDtcblxuXHRpZighdGhpcy5yb2JvdE1vZGVsKVxuXHRcdHRoaXMucm9ib3RNb2RlbCA9IFtdO1xuXHQvLyBjb25zb2xlLmxvZyhcIl9nZXRSb2JvdE1vZGVsRnJvbVJlY3ZcIik7XG5cdC8vIGNvbnNvbGUubG9nKHRoaXMucm9ib3RNb2RlbCk7XG5cblx0LyoqIE9ubHkgb25lIHJvYm90IGlzIG1hbmFnZSBhdCB0aGUgc2FtZSB0aW1lIGN1cnJlbnRseSAqKi9cblx0Zm9yKHZhciBuIGluIGRhdGEpIHtcblx0XHRpZighdGhpcy5yb2JvdE1vZGVsW25dKVxuXHRcdFx0dGhpcy5yb2JvdE1vZGVsW25dPXt9O1xuXHRcdHRoaXMucm9ib3RNb2RlbFtuXS5yb2JvdCA9IGRhdGFbbl0ucm9ib3Q7XG5cblx0XHQvLyBpZih0aGlzLnJvYm90TW9kZWwubGVuZ3RoPGRhdGEubGVuZ3RoKSB7XG5cdFx0Ly8gXHR0aGlzLnJvYm90TW9kZWwucHVzaCh7cm9ib3Q6IGRhdGFbMF0ucm9ib3RzfSk7XG5cdFx0Ly8gfVxuXG5cdFx0LyoqIGV4dHJhY3QgcGFydHMgaW5mbyAqKi9cblx0XHRpZihkYXRhW25dICYmIGRhdGFbbl0ucGFydHMpIHtcblx0XHRcdGlmKCF0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMpXG5cdFx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cyA9IHt9O1xuXHRcdFx0dmFyIHBhcnRzID0gZGF0YVtuXS5wYXJ0cztcblx0XHRcdHZhciByUGFydHMgPSB0aGlzLnJvYm90TW9kZWxbbl0ucGFydHM7XG5cdFx0XHRmb3IodmFyIHEgaW4gclBhcnRzKSB7XG5cdFx0XHRcdC8qKiBwYXJ0W3FdIHdhcyBub3Qgc2VudCBiZWNhdXNlIG5vIGVycm9yICoqL1xuXHRcdFx0XHRpZighcGFydHNbcV1cblx0XHRcdFx0ICAgJiZyUGFydHNbcV0uZXZ0cyYmclBhcnRzW3FdLmV2dHMuY29kZSkge1xuXHRcdFx0XHRcdHJQYXJ0c1txXS5ldnRzID0ge1xuXHRcdFx0XHRcdFx0Y29kZTogWzBdLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogWzBdLFxuXHRcdFx0XHRcdFx0dGltZTogW0RhdGUubm93KCldIC8qKiB1cGRhdGUgKiovXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgcCBpbiBwYXJ0cykge1xuXHRcdFx0XHRpZihwYXJ0c1twXSYmcGFydHNbcF0uZXJyICYmIHBhcnRzW3BdLmVyci5zdD4wKSB7XG5cdFx0XHRcdFx0TG9nZ2VyLmVycm9yKFwiUGFydHMgXCIrcCtcIiB3YXMgaW4gZXJyb3I6IFwiK2RhdGFbcF0uZXJyLm1zZyk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoIXJQYXJ0c1twXSkge1xuXHRcdFx0XHRcdHJQYXJ0c1twXT17fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihwYXJ0c1twXSkge1xuXHRcdFx0XHRcdC8vIExvZ2dlci5sb2cobik7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgY2F0ZWdvcnkgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0uY2F0ZWdvcnk9cGFydHNbcF0uY2F0ZWdvcnk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbmFtZSAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5uYW1lPXBhcnRzW3BdLm5hbWU7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbGFiZWwgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubGFiZWw9cGFydHNbcF0ubGFiZWw7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yIHRpbWUgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLnRpbWUpO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS50aW1lKTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZXJyb3IgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXS5lcnJvcnMuY29kZSk7XG5cblx0XHRcdFx0XHQvKiogdXBkYXRlIGVycm9yTGlzdCAqKi9cblx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdClcblx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3Q9e307XG5cdFx0XHRcdFx0Zm9yKCB2YXIgZWwgaW4gcGFydHNbcF0uZXJyb3JMaXN0IClcblx0XHRcdFx0XHRcdGlmKCFyUGFydHNbcF0uZXJyb3JMaXN0W2VsXSlcblx0XHRcdFx0XHRcdFx0clBhcnRzW3BdLmVycm9yTGlzdFtlbF0gPSBwYXJ0c1twXS5lcnJvckxpc3RbZWxdO1xuXG5cdFx0XHRcdFx0clBhcnRzW3BdLmV2dHMgPSB7XG5cdFx0XHRcdFx0XHRjb2RlOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmV2dHMuY29kZSksXG5cdFx0XHRcdFx0XHRjb2RlUmVmOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmV2dHMuY29kZVJlZiksXG5cdFx0XHRcdFx0XHR0aW1lOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmV2dHMudGltZSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS5lcnJvcik7XG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZygncGFydHMsIHJQYXJ0cycpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHMpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coclBhcnRzKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJObyBwYXJ0cyB0byByZWFkIGZvciByb2JvdCBcIitkYXRhW25dLm5hbWUpO1xuXHRcdH1cblx0fVxufTtcblxuLyoqIGNyZWF0ZSBTdGF0dXMgc2VydmljZSAqKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuU3RhdHVzID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIG5ldyBTdGF0dXModGhpcyk7XG59O1xuXG4vKipcbiAqIFNldCBvbiBzdGF0dXNcbiAqIEBwYXJhbSByb2JvdE5hbWUgdG8gZmluZCBzdGF0dXMgdG8gbW9kaWZ5XG4gKiBAcGFyYW0gcGFydE5hbWUgXHR0byBmaW5kIHN0YXR1cyB0byBtb2RpZnlcbiAqIEBwYXJhbSBjb2RlXHRcdG5ld0NvZGVcbiAqIEBwYXJhbSBzb3VyY2VcdFx0c291cmNlXG4gKiBAcGFyYW0gY2FsbGJhY2tcdFx0cmV0dXJuIGNhbGxiYWNrICg8Ym9vbD5zdWNjZXNzKVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnNldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNvZGUsIHNvdXJjZSwgY2FsbGJhY2spIHtcblx0dmFyIGZ1bmNOYW1lID0gXCJTZXRTdGF0dXNfXCIrcGFydE5hbWU7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6ZnVuY05hbWUsZGF0YToge3JvYm90TmFtZTogcm9ib3ROYW1lLCBzdGF0dXNDb2RlOiBjb2RlLCBwYXJ0TmFtZTogcGFydE5hbWUsIHNvdXJjZTogc291cmNlfDF9fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjayh0cnVlKTtcblx0XHRcdH1cblx0XHR9KTtcbn07XG5cbi8qKlxuICogR2V0IG9uZSBzdGF0dXNcbiAqIEBwYXJhbSByb2JvdE5hbWUgdG8gZ2V0IHN0YXR1c1xuICogQHBhcmFtIHBhcnROYW1lIFx0dG8gZ2V0IHN0YXR1c1xuICogQHBhcmFtIGNhbGxiYWNrXHRcdHJldHVybiBjYWxsYmFjaygtMSBpZiBub3QgZm91bmQvZGF0YSBvdGhlcndpc2UpXG4gKiBAcGFyYW0gX2Z1bGwgXHRtb3JlIGRhdGEgYWJvdXQgc3RhdHVzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZ2V0U3RhdHVzID0gZnVuY3Rpb24ocm9ib3ROYW1lLCBwYXJ0TmFtZSwgY2FsbGJhY2ssIF9mdWxsKSB7XG5cdHZhciBmdWxsPV9mdWxsfHxmYWxzZTtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlOlwic3RhdHVzXCIsZnVuYzpcIkdldFN0YXR1c1wiLGRhdGE6IHtyb2JvdE5hbWU6IHJvYm90TmFtZSwgcGFydE5hbWU6IHBhcnROYW1lLCBmdWxsOiBmdWxsfX0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKC0xKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2soZGF0YSk7XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuIiwiLypcbiAqIENvcHlyaWdodCA6IFBhcnRuZXJpbmcgMy4wICgyMDA3LTIwMTYpXG4gKiBBdXRob3IgOiBTeWx2YWluIE1haMOpIDxzeWx2YWluLm1haGVAcGFydG5lcmluZy5mcj5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBkaXlhLXNkay5cbiAqXG4gKiBkaXlhLXNkayBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBkaXlhLXNkayBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBkaXlhLXNkay4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5cblxuXG5cbi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgY2hhbm5lbCBlbmNvZGluZ1xuICogLSBiYXNlNjQgY29kaW5nXG4gKiAtIG5vbmVcbiAqIERhdGEgZm9ybWF0IDpcbiAqXHRcdHQ6IHsnYjY0Jywnbm9uZSd9XG4gKlx0XHRiOiA8aWYgYjY0PiB7NCw4fVxuICpcdFx0ZDogZW5jb2RlZCBkYXRhIHtidWZmZXIgb3IgQXJyYXl9XG4gKlx0XHRzOiBzaXplXG4gKi9cblxuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2UtNjQnKTtcblxuLyoqXG4gKiBEZWZhdWx0IDogbm8gZW5jb2RpbmdcbiAqICovXG5mdW5jdGlvbiBOb0NvZGluZygpe1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHRpZihkYXRhLmQgPT09ICdudW1iZXInIHx8IEFycmF5LmlzQXJyYXkoZGF0YS5kKSlcblx0XHRyZXR1cm4gZGF0YS5kO1xuXHRlbHNlXG5cdFx0cmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiovXG5Ob0NvZGluZy5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihhcnJheSkge1xuXHRyZXR1cm4ge1xuXHRcdHQ6ICdubycsIC8qIHR5cGUgKi9cblx0XHRkOiBhcnJheSwgLyogZGF0YSAqL1xuXHRcdHM6IGFycmF5Lmxlbmd0aFxuXHR9O1xufTtcblxuXG5cblxuLyoqXG4gKiBNYW5hZ2VtZW50IG9mIGJhc2U2NCBlbmNvZGluZ1xuICogRWZmZWN0aXZlIGZvciBzdHJpbmcgYmFzZWQgY2hhbm5lbHMgKGxpa2UgSlNPTiBiYXNlZCBXUylcbiAqICovXG5mdW5jdGlvbiBCYXNlNjRDb2RpbmcoKXtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8gICAgVXRpbGl0eSBmdW5jdGlvbnMgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKlxcXG4gfCp8XG4gfCp8ICB1dGlsaXRhaXJlcyBkZSBtYW5pcHVsYXRpb25zIGRlIGNoYcOubmVzIGJhc2UgNjQgLyBiaW5haXJlcyAvIFVURi04XG4gfCp8XG4gfCp8ICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL0TDqWNvZGVyX2VuY29kZXJfZW5fYmFzZTY0XG4gfCp8XG4gXFwqL1xuLyoqIERlY29kZXIgdW4gdGFibGVhdSBkJ29jdGV0cyBkZXB1aXMgdW5lIGNoYcOubmUgZW4gYmFzZTY0ICovXG52YXIgYjY0VG9VaW50NiA9IGZ1bmN0aW9uKG5DaHIpIHtcblx0cmV0dXJuIG5DaHIgPiA2NCAmJiBuQ2hyIDwgOTEgP1xuXHRcdG5DaHIgLSA2NVxuXHRcdDogbkNociA+IDk2ICYmIG5DaHIgPCAxMjMgP1xuXHRcdG5DaHIgLSA3MVxuXHRcdDogbkNociA+IDQ3ICYmIG5DaHIgPCA1OCA/XG5cdFx0bkNociArIDRcblx0XHQ6IG5DaHIgPT09IDQzID9cblx0XHQ2MlxuXHRcdDogbkNociA9PT0gNDcgP1xuXHRcdDYzXG5cdFx0Olx0MDtcbn07XG5cbi8qKlxuICogRGVjb2RlIGJhc2U2NCBzdHJpbmcgdG8gVUludDhBcnJheVxuICogQHBhcmFtICB7U3RyaW5nfSBzQmFzZTY0XHRcdGJhc2U2NCBjb2RlZCBzdHJpbmdcbiAqIEBwYXJhbSAge2ludH0gbkJsb2Nrc1NpemUgc2l6ZSBvZiBibG9ja3Mgb2YgYnl0ZXMgdG8gYmUgcmVhZC4gT3V0cHV0IGJ5dGVBcnJheSBsZW5ndGggd2lsbCBiZSBhIG11bHRpcGxlIG9mIHRoaXMgdmFsdWUuXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fVx0XHRcdFx0dGFiIG9mIGRlY29kZWQgYnl0ZXNcbiAqL1xudmFyIGJhc2U2NERlY1RvQXJyID0gZnVuY3Rpb24oc0Jhc2U2NCwgbkJsb2Nrc1NpemUpIHtcblx0dmFyXG5cdHNCNjRFbmMgPSBzQmFzZTY0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCBcIlwiKSwgbkluTGVuID0gc0I2NEVuYy5sZW5ndGgsXG5cdG5PdXRMZW4gPSBuQmxvY2tzU2l6ZSA/IE1hdGguY2VpbCgobkluTGVuICogMyArIDEgPj4gMikgLyBuQmxvY2tzU2l6ZSkgKiBuQmxvY2tzU2l6ZSA6IG5JbkxlbiAqIDMgKyAxID4+IDIsXG5cdGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihuT3V0TGVuKSwgdGFCeXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cblx0Zm9yICh2YXIgbk1vZDMsIG5Nb2Q0LCBuVWludDI0ID0gMCwgbk91dElkeCA9IDAsIG5JbklkeCA9IDA7IG5JbklkeCA8IG5JbkxlbjsgbkluSWR4KyspIHtcblx0XHRuTW9kNCA9IG5JbklkeCAmIDM7IC8qIG4gbW9kIDQgKi9cblx0XHRuVWludDI0IHw9IGI2NFRvVWludDYoc0I2NEVuYy5jaGFyQ29kZUF0KG5JbklkeCkpIDw8IDE4IC0gNiAqIG5Nb2Q0O1xuXHRcdGlmIChuTW9kNCA9PT0gMyB8fCBuSW5MZW4gLSBuSW5JZHggPT09IDEpIHtcblx0XHRcdGZvciAobk1vZDMgPSAwOyBuTW9kMyA8IDMgJiYgbk91dElkeCA8IG5PdXRMZW47IG5Nb2QzKyssIG5PdXRJZHgrKykge1xuXHRcdFx0XHR0YUJ5dGVzW25PdXRJZHhdID0gblVpbnQyNCA+Pj4gKDE2ID4+PiBuTW9kMyAmIDI0KSAmIDI1NTtcblx0XHRcdH1cblx0XHRcdG5VaW50MjQgPSAwO1xuXHRcdH1cblx0fVxuXHQvLyBjb25zb2xlLmxvZyhcInU4aW50IDogXCIrSlNPTi5zdHJpbmdpZnkodGFCeXRlcykpO1xuXHRyZXR1cm4gYnVmZmVyO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8gICBJbnRlcmZhY2UgZnVuY3Rpb25zICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8qKlxuKiBDb252ZXJ0IGJ1ZmZlciBjb2RlZCBpbiBiYXNlNjQgYW5kIGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieVxuKiBieXRlQ29kaW5nIGJ5dGVzIGludG8gYXJyYXlcbiogQHBhcmFtIGJ1ZmZlciBpbiBiYXNlNjRcbiogQHBhcmFtIGJ5dGVDb2RpbmcgbnVtYmVyIG9mIGJ5dGVzIGZvciBlYWNoIG51bWJlciAoNCBvciA4KVxuKiBAcmV0dXJuIGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCkuIG51bGwgaWYgY291bGQgbm90IGNvbnZlcnQuXG4qL1xuQmFzZTY0Q29kaW5nLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHR2YXIgYnl0ZUNvZGluZyA9IGRhdGEuYjtcblxuXHQvKiBjaGVjayBieXRlIGNvZGluZyAqL1xuXHRpZihieXRlQ29kaW5nICE9PSA0ICYmIGJ5dGVDb2RpbmcgIT09IDgpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qIGRlY29kZSBkYXRhIHRvIGFycmF5IG9mIGJ5dGUgKi9cblx0dmFyIGJ1ZiA9IGJhc2U2NERlY1RvQXJyKGRhdGEuZCwgZGF0YS5iKTtcblx0LyogcGFyc2UgZGF0YSB0byBmbG9hdCBhcnJheSAqL1xuXHR2YXIgZkFycmF5PW51bGw7XG5cdHN3aXRjaChkYXRhLmIpIHtcblx0Y2FzZSA0OlxuXHRcdGZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmKTtcblx0XHRicmVhaztcblx0Y2FzZSA4OlxuXHRcdGZBcnJheSA9IG5ldyBGbG9hdDY0QXJyYXkoYnVmKTtcblx0XHRicmVhaztcblx0ZGVmYXVsdDpcblx0XHRjb25zb2xlLmxvZyhcIlVuZXhwZWN0ZWQgYnl0ZUNvZGluZyEgU2hvdWxkIG5vdCBoYXBwZW4hIVwiKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHQvKiBwYXJzZSBmQXJyYXkgaW50byBub3JtYWwgYXJyYXkgKi9cblx0dmFyIHRhYiA9IFtdLnNsaWNlLmNhbGwoZkFycmF5KTtcblxuXHRpZihkYXRhLnMgIT09IHRhYi5sZW5ndGgpIHtcblx0XHRjb25zb2xlLmxvZyhcIlNpemUgbWlzbWF0Y2ggd2hlbiBkZWNvZGluZyAhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0YWI7XG59O1xuXG4vKipcbiogQ29udmVydCBhcnJheSBjb250YWluaW5nIG51bWJlcnMgY29kZWQgYnkgYnl0ZUNvZGluZyBieXRlcyBpbnRvIGJ1ZmZlciBjb2RlZCBpbiBiYXNlNjRcbiogQHBhcmFtIFx0e0FycmF5PEZsb2F0Pn0gXHRhcnJheSBvZiBmbG9hdCAoMzIgb3IgNjQgYml0cylcbiogQHBhcmFtIFx0e2ludGVnZXJ9IFx0Ynl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggZmxvYXQgKDQgb3IgOClcbiogQHJldHVybiAgXHR7U3RyaW5nfSBcdGJ1ZmZlciBpbiBiYXNlNjQuIG51bGwgaWYgY291bGQgbm90IGNvbnZlcnQuXG4qL1xuQmFzZTY0Q29kaW5nLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5LCBieXRlQ29kaW5nKSB7XG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqKiBjYXNlIEFycmF5QnVmZmVyICoqKi9cblx0dmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihhcnJheS5sZW5ndGgqYnl0ZUNvZGluZyk7XG5cdHN3aXRjaChieXRlQ29kaW5nKSB7XG5cdGNhc2UgNDpcblx0XHR2YXIgYnVmMzIgPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlcik7XG5cdFx0YnVmMzIuc2V0KGFycmF5KTtcblx0XHRicmVhaztcblx0Y2FzZSA4OlxuXHRcdHZhciBidWY2NCA9IG5ldyBGbG9hdDY0QXJyYXkoYnVmZmVyKTtcblx0XHRidWY2NC5zZXQoYXJyYXkpO1xuXHRcdGJyZWFrO1xuXHR9XG5cdHZhciBidWZmQ2hhciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cdHZhciBidWZmQ2hhckNvZGVkID0gbmV3IEFycmF5KGJ1ZmZDaGFyLmxlbmd0aCk7XG5cdGZvcih2YXIgbiA9MDsgbjxidWZmQ2hhci5sZW5ndGg7IG4rKykge1xuXHRcdGJ1ZmZDaGFyQ29kZWRbbl0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZmZDaGFyW25dKTtcblx0fVxuXHR2YXIgc3RyID0gbmV3IFN0cmluZyhidWZmQ2hhckNvZGVkLmpvaW4oJycpKTtcblx0dmFyIGI2NEJ1ZmYgPSBiYXNlNjQuZW5jb2RlKHN0cik7XG5cdHJldHVybiB7XG5cdFx0dDogJ2I2NCcsIC8qIHR5cGUgKi9cblx0XHRiOiBieXRlQ29kaW5nLCAvKiBieXRlQ29kaW5nICovXG5cdFx0ZDogYjY0QnVmZiwgLyogZGF0YSAqL1xuXHRcdHM6IGFycmF5Lmxlbmd0aCAvKiBzaXplICovXG5cdH07XG59O1xuXG5cblxuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgY29tbSBlbmNvZGluZ1xuICogKi9cbmZ1bmN0aW9uIENvZGluZ0hhbmRsZXIoKXtcblx0dGhpcy5iNjQgPSBuZXcgQmFzZTY0Q29kaW5nKCk7XG5cdHRoaXMubm9uZSA9IG5ldyBOb0NvZGluZygpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuXG5Db2RpbmdIYW5kbGVyLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHRpZih0eXBlb2YgZGF0YSA9PSAndW5kZWZpbmVkJyB8fCBkYXRhPT1udWxsKVxuXHRcdHJldHVybiBudWxsO1xuXHRzd2l0Y2goZGF0YS50KSB7XG5cdGNhc2UgJ2I2NCc6XG5cdFx0cmV0dXJuIHRoaXMuYjY0LmZyb20oZGF0YSk7XG5cdGRlZmF1bHQ6XG5cdFx0cmV0dXJuIHRoaXMubm9uZS5mcm9tKGRhdGEpO1xuXHR9XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIHR5cGUsIGJ5dGVDb2RpbmcpIHtcblx0aWYodHlwZW9mIGFycmF5ID09PSAnbnVtYmVyJykge1xuXHRcdGFycmF5PVthcnJheV07XG5cdH1cblx0aWYoIUFycmF5LmlzQXJyYXkoYXJyYXkpKXtcblx0XHRjb25zb2xlLmxvZyhcIkNvZGluZ0hhbmRsZXIudG8gb25seSBhY2NlcHRzIGFycmF5ICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRzd2l0Y2godHlwZSkge1xuXHRjYXNlICdiNjQnOlxuXHRcdHJldHVybiB0aGlzLmI2NC50byhhcnJheSwgYnl0ZUNvZGluZyk7XG5cdGNhc2UgJ25vJzpcblx0ZGVmYXVsdDpcblx0XHRyZXR1cm4gdGhpcy5ub25lLnRvKGFycmF5KTtcblx0fVxufTtcblxuXG4vKiogQWRkIGJhc2U2NCBoYW5kbGVyIHRvIERpeWFTZWxlY3RvciAqKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIG5ldyBDb2RpbmdIYW5kbGVyKCk7XG59O1xuIl19
