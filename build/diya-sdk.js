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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],7:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],8:[function(require,module,exports){
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

},{"./support/isBuffer":7,"_process":5,"inherits":6}],9:[function(require,module,exports){
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

},{"./chrome/chrome_shim":10,"./edge/edge_shim":13,"./firefox/firefox_shim":14,"./safari/safari_shim":16,"./utils":17}],10:[function(require,module,exports){
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

},{"../utils.js":17,"./getusermedia":11}],11:[function(require,module,exports){
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

},{"../utils.js":17}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"../utils":17,"./edge_sdp":12}],14:[function(require,module,exports){
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

},{"../utils":17,"./getusermedia":15}],15:[function(require,module,exports){
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

},{"../utils":17}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
'use strict';

var isBrowser = !(typeof window === 'undefined');
var UNIXSocketHandler = void 0;
if (!isBrowser) {
	var Q = require('q');
	UNIXSocketHandler = require('./UNIXSocketHandler');
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
	log: function log(message) {
		if (DEBUG) console.log(message);
	},

	error: function error(message) {
		if (DEBUG) console.error(message);
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
	var _this = this;

	this.bDontReconnect = false;

	// Handle local clients on UNIX sockets
	if (addr.startsWith('unix://')) {
		// If we've trying to connect to the same address we're already connected to
		if (this._addr === addr) {
			console.log('[SDK/DiyaNode] Address is identical to our address...');
			if (this._status === 'opened') {
				console.log('[SDK/DiyaNode] ... and the connection is still openened, returning it.');
				return Q(this.self());
			} else if (this._connectionDeferred && this._connectionDeferred.promise && this._connectionDeferred.promise.isPending()) {
				console.log('[SDK/DiyaNode]... and the connection is pending, so returning the pending connection.');
				return this._connectionDeferred.promise;
			}
		}

		return this.close().then(function (_) {
			_this._addr = addr;
			_this._connectionDeferred = Q.defer();
			Logger.log('d1: connect to ' + _this._addr);
			var sock = new UNIXSocketHandler(_this._addr.substr('unix://'.length), _this._connectTimeout);

			if (!_this._socketHandler) _this._socketHandler = sock;

			_this._onopening();

			sock.on('open', function (_) {
				if (_this._socketHandler !== sock) {
					console.log('[SDK/DiyaNode] Socket responded but already connected to a different one');
					return;
				}
				_this._status = 'opened';
				_this._setupPingResponse();
			});

			sock.on('closing', function (_) {
				if (_this._socketHandler !== sock) return;
				_this._onclosing();
			});

			sock.on('close', function (_) {
				if (_this._socketHandler !== sock) return;
				_this._socketHandler = null;
				_this._status = 'closed';
				_this._stopPingResponse();
				_this._onclose();

				if (_this._connectionDeferred) {
					_this._connectionDeferred.reject("closed");
					_this._connectionDeferred = null;
				}
			});

			sock.on('error', function (error) {
				if (_this._socketHandler !== sock) return;
				_this._onerror(error);
			});

			sock.on('timeout', function (_) {
				if (_this._socketHandler !== sock) return;
				_this._socketHandler = null;
				_this._status = 'closed';
				if (_this._connectionDeferred) {
					_this._connectionDeferred.reject("closed");
					_this._connectionDeferred = null;
				}
			});

			sock.on('message', _this._onmessage.bind(_this));

			return _this._connectionDeferred.promise;
		});
	}

	if (WSocket !== undefined) this._WSocket = WSocket;else if (this._WSocket === undefined) this._WSocket = window.WebSocket;

	WSocket = this._WSocket;

	// Check and Format URI (FQDN)
	if (addr.startsWith("ws://") && this._secured) return Q.reject("Please use a secured connection (" + addr + ")");

	if (addr.startsWith("wss://") && this._secured === false) return Q.reject("Please use a non-secured connection (" + addr + ")");

	if (!addr.startsWith("ws://") && !addr.startsWith("wss://")) {
		if (this._secured) addr = "wss://" + addr;else addr = "ws://" + addr;
	}

	if (this._addr === addr) {
		if (this._status === 'opened') return Q(this.self());else if (this._connectionDeferred && this._connectionDeferred.promise && this._connectionDeferred.promise.isPending()) return this._connectionDeferred.promise;
	}

	return this.close().then(function (_) {
		_this._addr = addr;
		_this._connectionDeferred = Q.defer();
		Logger.log('d1: connect to ' + _this._addr);
		var sock = new SocketHandler(WSocket, _this._addr, _this._connectTimeout);

		if (!_this._socketHandler) _this._socketHandler = sock;

		_this._onopening();

		sock.on('open', function (_) {
			if (_this._socketHandler !== sock) {
				console.log("[d1] Websocket responded but already connected to a different one");
				return;
			}
			_this._socketHandler = sock;
			_this._status = 'opened';
			_this._setupPingResponse();
		});

		sock.on('closing', function (_) {
			if (_this._socketHandler !== sock) return;
			_this._onclosing();
		});

		sock.on('close', function (_) {
			if (_this._socketHandler !== sock) return;
			_this._socketHandler = null;
			_this._status = 'closed';
			_this._stopPingResponse();
			_this._onclose();

			if (_this._connectionDeferred) {
				_this._connectionDeferred.reject("closed");
				_this._connectionDeferred = null;
			}
		});

		sock.on('error', function (error) {
			if (_this._socketHandler !== sock) return;
			_this._onerror(error);
		});

		sock.on('timeout', function (_) {
			if (_this._socketHandler !== sock) return;
			_this._socketHandler = null;
			_this._status = 'closed';
			if (_this._connectionDeferred) {
				_this._connectionDeferred.reject("closed");
				_this._connectionDeferred = null;
			}
		});

		sock.on('message', _this._onmessage.bind(_this));

		return _this._connectionDeferred.promise;
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
			Logger.error("[WS] error : " + JSON.stringify(err));
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
		data: params.data,
		bus: params.bus
	};
};

DiyaNode.prototype._generateId = function () {
	var id = this._nextId;
	this._nextId++;
	return id;
};

module.exports = DiyaNode;

},{"./UNIXSocketHandler":20,"inherits":3,"node-event-emitter":4,"q":undefined}],19:[function(require,module,exports){
'use strict';

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
			// 'localhost' alone -> UNIX socket /var/run/diya/diya-node.sock
			else if (addrStr === 'localhost') {
					peer.addr = 'unix:///var/run/diya/diya-node.sock';
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

},{"./DiyaNode":18,"inherits":3,"node-event-emitter":4,"q":undefined}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isBrowser = !(typeof window === 'undefined');

if (!isBrowser) {

	var Q = require('q');
	var net = require('net');
	var JSONSocket = require('json-socket');
	var EventEmitter = require('node-event-emitter');

	var UNIXSocketHandler = function (_EventEmitter) {
		_inherits(UNIXSocketHandler, _EventEmitter);

		function UNIXSocketHandler(addr, connectTimeout) {
			_classCallCheck(this, UNIXSocketHandler);

			var _this = _possibleConstructorReturn(this, (UNIXSocketHandler.__proto__ || Object.getPrototypeOf(UNIXSocketHandler)).call(this));

			_this.addr = addr;

			_this._socket = new JSONSocket(new net.Socket());
			_this._socket.connect(_this.addr);

			// Store callback so that we can unregister them later
			_this._socketOpenCallback = _this._onopen.bind(_this);
			_this._socketCloseCallback = _this._onclose.bind(_this);
			_this._socketMessageCallback = _this._onmessage.bind(_this);
			_this._socketErrorCallback = _this._onerror.bind(_this);

			_this._socket.on('connect', _this._socketOpenCallback);
			_this._socket._socket.on('close', _this._socketCloseCallback);
			_this._socket.on('message', _this._socketMessageCallback);
			_this._socket._socket.on('error', _this._socketErrorCallback);

			// Create timeout to abord connectiong
			setTimeout(function (_) {
				// Whe ntime times out, if the socket is opened, simply return
				if (_this._status === 'opened') return;
				// Otherwise, abord
				if (_this._status !== 'closed') {
					Logger.log('d1: ' + that.addr + ' timed out while connecting');
					_this.close();
					_this.emit('timeout', _this._socket);
				}
			}, connectTimeout);
			return _this;
		}

		_createClass(UNIXSocketHandler, [{
			key: 'close',
			value: function close() {
				if (this._disconnectionDeferred && this._disconnectionDeferred.promise) return this._disconnectionDeferred.promise;

				this._disconnectionDeferred = Q.defer();
				this._status = 'closing';

				this.emit('closing', this._socket);

				if (this._socket) this._socket.end();

				return this._disconnectionDeferred.promise;
			}

			/**
    * Send a JSON-formatted message through the socket
    * @param {JSON} msg The JSON to send (do not stringify it, json-socket will do it)
    */

		}, {
			key: 'send',
			value: function send(msg) {
				try {
					this._socket.sendMessage(msg);
				} catch (err) {
					console.error('Cannot send message: ' + err.message);
					return false;
				}

				return true;
			}
		}, {
			key: 'isConnected',
			value: function isConnected() {
				return !this._socket.isClosed() && this._status === 'opened';
			}
		}, {
			key: '_onopen',
			value: function _onopen() {
				this._status = 'opened';
				this.emit('open', this._socket);
			}
		}, {
			key: '_onclose',
			value: function _onclose() {
				this._status = 'closed';
				this.unregisterCallbacks();
				this.emit('close', this._socket);
				if (this._disconnectionDeferred && this._disconnectionDeferred.promise) this._disconnectionDeferred.resolve();
			}
		}, {
			key: '_onmessage',
			value: function _onmessage(msg) {
				// The message is already a JSON
				this.emit('message', msg);
			}
		}, {
			key: '_onerror',
			value: function _onerror(err) {
				this.emit('error', err);
			}
		}, {
			key: 'unregisterCallbacks',
			value: function unregisterCallbacks() {
				if (this._socket && typeof this._socket.removeEventListener === 'function') {
					this._socket.removeEventListener('open', this._socketOpenCallback);
					this._socket.removeEventListener('close', this._socketCloseCallback);
					this._socket.removeEventListener('message', this._socketMessageCallback);
				} else if (this._socket && typeof this._socket.removeAllListeners === 'function') {
					this._socket.removeAllListeners();
				}
			}
		}]);

		return UNIXSocketHandler;
	}(EventEmitter);

	module.exports = UNIXSocketHandler;
}

},{"json-socket":undefined,"net":2,"node-event-emitter":4,"q":undefined}],21:[function(require,module,exports){
'use strict';

var d1 = require('./DiyaSelector.js');

require('./services/rtc/rtc.js');
require('./services/ieq/ieq.js');
require('./services/peerAuth/PeerAuth.js');
require('./services/meshNetwork/MeshNetwork.js');
require('./utils/encoding/encoding.js');
require('./services/status/status.js');

module.exports = d1;

},{"./DiyaSelector.js":19,"./services/ieq/ieq.js":22,"./services/meshNetwork/MeshNetwork.js":23,"./services/peerAuth/PeerAuth.js":25,"./services/rtc/rtc.js":26,"./services/status/status.js":27,"./utils/encoding/encoding.js":28}],22:[function(require,module,exports){
'use strict';

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
   return adapted vector for display with D3 to reduce code in IHM ?
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
 *	callback : function called after model updated
 * */
function IEQ(selector) {
	var that = this;
	this.selector = selector;
	this.dataModel = {};
	this._coder = selector.encode();
	this.subscriptions = [];
	//	that.subscriptionErrorNum = 0;

	/*** structure of data config ***
 	 criteria :
 	   time: all 3 time criteria should not be defined at the same time. (range would be given up)
 	     start: {[null],time} (null means most recent) // stored a UTC in ms (num)
 	     end: {[null], time} (null means most oldest) // stored as UTC in ms (num)
 	     range: {[null], time} (range of time(positive) ) // in s (num)
 	   robot: {ArrayOf ID or ["all"]}
 	   place: {ArrayOf ID or ["all"]}
 	 operator: {[last], max, moy, sd} -( maybe moy should be default
 	 ...
 		 sensors : {[null] or ArrayOf SensorName}
 		 sampling: {[null] or int}
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
 * TODO USE PROMISE
 */
IEQ.prototype.updateData = function (callback, dataConfig) {
	var that = this;
	if (dataConfig) this.DataConfig(dataConfig);
	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "ieq",
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
			Logger.error("UpdateData:\n" + JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed (" + data.header.error.st + "): " + data.header.error.msg);
			return;
		}

		// console.log(data);
		that._getDataModelFromRecv(data);

		// Logger.log(that.getDataModel());

		callback = callback.bind(that); // bind callback with IEQ
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
IEQ.prototype.watch = function (data, callback) {
	var that = this;
	// console.log("Request: "+JSON.stringify(dataConfig));

	/** default **/
	data = data || {};
	data.timeRange = data.timeRange || 'hours';
	data.cat = data.cat || 'ieq'; /* category */

	var subs = this.selector.subscribe({
		service: "ieq",
		func: "Data",
		data: data,
		obj: data.cat /* provide category of sensor to be watched, filtered according to CRM */
	}, function (dnId, err, data) {
		if (err) {
			Logger.error("WatchIEQRecvErr:" + JSON.stringify(err));
			// console.log(e);
			// console.log(that.selector);
			// if(err==="SubscriptionClosed") {
			// 	that.closeSubscriptions(); // should not be necessary
			// 	that.subscriptionError = that.subscriptionErrorNum+1; // increase error counter
			// 	setTimeout(that.subscriptionErrorNum*60000, that.watch(data,callback)); // try again later
			// }
			// else {
			// 	console.error("Unmanage cases : should the subscription be regenerated ?");
			// }
			return;
		}
		if (data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("WatchIEQ:\n" + JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed (" + data.header.error.st + "): " + data.header.error.msg);
			return;
		}
		// console.log(data);
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
	}
	this.subscriptions = [];
};

/**
 * request Data to make CSV file
 */
IEQ.prototype.getCSVData = function (sensorNames, _firstDay, callback) {
	var firstDay = new Date(_firstDay);
	var dataConfig = {
		criteria: {
			time: { start: firstDay.getTime(), rangeUnit: 'hour', range: 180 }, // 360h -> 15d // 180h -> 7j
			places: [],
			robots: []
		},
		sensors: sensorNames
	};

	this.updateData(callback, dataConfig);
};

/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
IEQ.prototype._getDataModelFromRecv = function (data) {
	var dataModel = null;

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

},{"../../DiyaSelector":19,"../message":24,"util":8}],23:[function(require,module,exports){
'use strict';

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

},{"../../DiyaSelector":19,"q":undefined}],24:[function(require,module,exports){
'use strict';

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

},{}],25:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
				INFO("Add trusted peer '" + peer + "' (ip=" + ip + ") to '" + bootstrap_ip + "' with public key\n" + data.public_key);
				d1.connectAsUser(bootstrap_ip, bootstrap_user, bootstrap_password).then(function () {
					d1("#self").addTrustedPeer(peer, data.public_key, function (bootstrap_peer, err, _ref) {
						var _ref2 = _slicedToArray(_ref, 2),
						    alreadyTrusted = _ref2[0],
						    public_key = _ref2[1];

						if (err) return callback(peer, bootstrap_peer, err, null);
						if (alreadyTrusted) INFO(peer + " already trusted by " + bootstrap_peer);else INFO(bootstrap_peer + "(ip=" + bootstrap_ip + ") added " + peer + "(ip=" + ip + ") as a Trusted Peer");

						d1('#self').givePublicKey(function (_, err, data) {
							INFO("In return, add " + bootstrap_peer + " to " + peer + " as a Trusted Peer with public key " + data.public_key);
							d1.connectAsUser(ip, user, password).then(function () {
								d1("#self").addTrustedPeer(bootstrap_peer, data.public_key, function (peer, err, _ref3) {
									var _ref4 = _slicedToArray(_ref3, 2),
									    alreadyTrusted = _ref4[0],
									    public_key = _ref4[1];

									if (err) callback(peer, bootstrap_peer, err, null);else if (alreadyTrusted) INFO(bootstrap_peer + " already trusted by " + peer);else INFO(peer + "(ip=" + ip + ") added " + bootstrap_peer + "(ip=" + bootstrap_ip + ") as a Trusted Peer");
									// Once Keys have been exchanged ask to join the network
									OK("KEYS OK ! Now, let " + peer + "(ip=" + ip + ") join the network via " + bootstrap_peer + "(ip=" + bootstrap_net + ") ...");
									return join(peer, bootstrap_peer);
								});
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

	console.log('[installNode]\nip:' + ip);

	return d1.installNodeExt(ip, user, password, bootstrap_ip, bootstrap_user, bootstrap_password, bootstrap_net, callback);
};

/**
 * Make the selected DiyaNodes join an existing DiyaNodes Mesh Network by contacting
 * the given bootstrap peers.
 *
 * NOTE : This operation requires root role
 *
 * @param bootstrap_ips : an array of bootstrap IP addresses to contact to join the Network
 * @param permanent : if true, permanently add the bootstrap peers as automatic bootstrap peers for the selected nodes.
 *
 */
DiyaSelector.prototype.join = function (bootstrap_ips, permanent, callback) {
	if (typeof bootstrap_ips === 'string') bootstrap_ips = [bootstrap_ips];

	if (bootstrap_ips.constructor !== Array) throw "join() : bootstrap_ips should be an array of peers URIs";

	this.request({
		service: 'meshNetwork',
		func: 'Join',
		data: {
			bootstrap_ips: bootstrap_ips,
			permanent: permanent
		}
	}, function (peerId, err, data) {
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
 * @param peer_name : the name of the new trusted DiyaNode peer
 * @param public_key : the RSA public key of the new trusted DiyaNode peer
 */
DiyaSelector.prototype.addTrustedPeer = function (name, public_key, callback) {
	return this.request({
		service: 'peerAuth',
		func: 'AddTrustedPeer',
		data: {
			peer_name: name,
			public_key: public_key
		}
	}, function (peerId, err, data) {
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

},{"../../DiyaSelector":19,"q":undefined}],26:[function(require,module,exports){
'use strict';

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
		iceServers.push({ urls: [this._turninfo.url], username: this._turninfo.username, credential: this._turninfo.password });
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

	console.log(config);
	console.log(constraints);

	var peer = new RTCPeerConnection(config, constraints);
	this.peer = peer;

	this.streams.forEach(function (s) {
		peer.addStream(s);
	});

	peer.setRemoteDescription(new RTCSessionDescription({ sdp: data.sdp, type: data.type }));

	peer.createAnswer(function (session_description) {
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
		//console.log('remote ice :');
		//console.log(data.candidate.candidate);
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

},{"../../DiyaSelector":19,"inherits":3,"node-event-emitter":4,"webrtc-adapter":9}],27:[function(require,module,exports){
'use strict';

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
		// console.log(err);
		// console.log(data);
		if (err || data && data.err & data.err.st) {
			Logger.error("StatusSubscribe:" + (err ? err : "") + "\n" + (data && data.err ? data.err : ""));
		} else {
			if (data && data.header && data.header.type === "init") {
				// initialisation of robot model
				that.robotModelInit = true;
			}
			// console.log(data);
			if (that.robotModelInit) {
				that._getRobotModelFromRecv2(data);
				if (typeof callback === 'function') callback(that.robotModel);
			} else {
				// Error
				Logger.error("Robot model has not been initialised, cannot be updated");
				/// TODO unsubscribe
			}
		}
	}, { auto: true });
	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
Status.prototype.closeSubscriptions = function () {
	for (var i in this.subscriptions) {
		this.subscriptions[i].close();
	}
	this.subscriptions = [];
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

},{"../../DiyaSelector":19,"../message":24,"util":8}],28:[function(require,module,exports){
'use strict';

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

},{"../../DiyaSelector":19,"base-64":1}]},{},[21])(21)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZS02NC9iYXNlNjQuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvbm9kZS1ldmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvYWRhcHRlcl9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9jaHJvbWUvY2hyb21lX3NoaW0uanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2Nocm9tZS9nZXR1c2VybWVkaWEuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZWRnZV9zZHAuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZWRnZV9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9maXJlZm94L2ZpcmVmb3hfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZmlyZWZveC9nZXR1c2VybWVkaWEuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL3NhZmFyaS9zYWZhcmlfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvdXRpbHMuanMiLCJzcmMvRGl5YU5vZGUuanMiLCJzcmMvRGl5YVNlbGVjdG9yLmpzIiwic3JjL1VOSVhTb2NrZXRIYW5kbGVyLmpzIiwic3JjL2RpeWEtc2RrLmpzIiwic3JjL3NlcnZpY2VzL2llcS9pZXEuanMiLCJzcmMvc2VydmljZXMvbWVzaE5ldHdvcmsvTWVzaE5ldHdvcmsuanMiLCJzcmMvc2VydmljZXMvbWVzc2FnZS5qcyIsInNyYy9zZXJ2aWNlcy9wZWVyQXV0aC9QZWVyQXV0aC5qcyIsInNyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwic3JjL3NlcnZpY2VzL3N0YXR1cy9zdGF0dXMuanMiLCJzcmMvdXRpbHMvZW5jb2RpbmcvZW5jb2RpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyS0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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SSxZQUFKLEVBQVg7QUFDQSxNQUFLLElBQUwsR0FBWSxJQUFJLFFBQUosRUFBWjs7QUFFQSxRQUFPLElBQVA7QUFDQTs7QUFHRCxjQUFjLFNBQWQsQ0FBd0IsSUFBeEIsR0FBK0IsVUFBUyxJQUFULEVBQWU7QUFDN0MsS0FBRyxPQUFPLElBQVAsSUFBZSxXQUFmLElBQThCLFFBQU0sSUFBdkMsRUFDQyxPQUFPLElBQVA7QUFDRCxTQUFPLEtBQUssQ0FBWjtBQUNBLE9BQUssS0FBTDtBQUNDLFVBQU8sS0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLElBQWQsQ0FBUDtBQUNEO0FBQ0MsVUFBTyxLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsSUFBZixDQUFQO0FBSkQ7QUFNQSxDQVREOztBQVlBLGNBQWMsU0FBZCxDQUF3QixFQUF4QixHQUE2QixVQUFTLEtBQVQsRUFBZ0IsSUFBaEIsRUFBc0IsVUFBdEIsRUFBa0M7QUFDOUQsS0FBRyxPQUFPLEtBQVAsS0FBaUIsUUFBcEIsRUFBOEI7QUFDN0IsVUFBTSxDQUFDLEtBQUQsQ0FBTjtBQUNBO0FBQ0QsS0FBRyxDQUFDLE1BQU0sT0FBTixDQUFjLEtBQWQsQ0FBSixFQUF5QjtBQUN4QixVQUFRLEdBQVIsQ0FBWSx1Q0FBWjtBQUNBLFNBQU8sSUFBUDtBQUNBOztBQUVELFNBQU8sSUFBUDtBQUNBLE9BQUssS0FBTDtBQUNDLFVBQU8sS0FBSyxHQUFMLENBQVMsRUFBVCxDQUFZLEtBQVosRUFBbUIsVUFBbkIsQ0FBUDtBQUNELE9BQUssSUFBTDtBQUNBO0FBQ0MsVUFBTyxLQUFLLElBQUwsQ0FBVSxFQUFWLENBQWEsS0FBYixDQUFQO0FBTEQ7QUFPQSxDQWhCRDs7QUFtQkE7QUFDQSxhQUFhLFNBQWIsQ0FBdUIsTUFBdkIsR0FBZ0MsWUFBVTtBQUN6QyxRQUFPLElBQUksYUFBSixFQUFQO0FBQ0EsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiEgaHR0cDovL210aHMuYmUvYmFzZTY0IHYwLjEuMCBieSBAbWF0aGlhcyB8IE1JVCBsaWNlbnNlICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgLlxuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLlxuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgLCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUsIGFuZCB1c2Vcblx0Ly8gaXQgYXMgYHJvb3RgLlxuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBJbnZhbGlkQ2hhcmFjdGVyRXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0fTtcblx0SW52YWxpZENoYXJhY3RlckVycm9yLnByb3RvdHlwZSA9IG5ldyBFcnJvcjtcblx0SW52YWxpZENoYXJhY3RlckVycm9yLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cblx0dmFyIGVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdC8vIE5vdGU6IHRoZSBlcnJvciBtZXNzYWdlcyB1c2VkIHRocm91Z2hvdXQgdGhpcyBmaWxlIG1hdGNoIHRob3NlIHVzZWQgYnlcblx0XHQvLyB0aGUgbmF0aXZlIGBhdG9iYC9gYnRvYWAgaW1wbGVtZW50YXRpb24gaW4gQ2hyb21pdW0uXG5cdFx0dGhyb3cgbmV3IEludmFsaWRDaGFyYWN0ZXJFcnJvcihtZXNzYWdlKTtcblx0fTtcblxuXHR2YXIgVEFCTEUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cdC8vIGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvY29tbW9uLW1pY3Jvc3ludGF4ZXMuaHRtbCNzcGFjZS1jaGFyYWN0ZXJcblx0dmFyIFJFR0VYX1NQQUNFX0NIQVJBQ1RFUlMgPSAvW1xcdFxcblxcZlxcciBdL2c7XG5cblx0Ly8gYGRlY29kZWAgaXMgZGVzaWduZWQgdG8gYmUgZnVsbHkgY29tcGF0aWJsZSB3aXRoIGBhdG9iYCBhcyBkZXNjcmliZWQgaW4gdGhlXG5cdC8vIEhUTUwgU3RhbmRhcmQuIGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvd2ViYXBwYXBpcy5odG1sI2RvbS13aW5kb3diYXNlNjQtYXRvYlxuXHQvLyBUaGUgb3B0aW1pemVkIGJhc2U2NC1kZWNvZGluZyBhbGdvcml0aG0gdXNlZCBpcyBiYXNlZCBvbiBAYXRr4oCZcyBleGNlbGxlbnRcblx0Ly8gaW1wbGVtZW50YXRpb24uIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2F0ay8xMDIwMzk2XG5cdHZhciBkZWNvZGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdGlucHV0ID0gU3RyaW5nKGlucHV0KVxuXHRcdFx0LnJlcGxhY2UoUkVHRVhfU1BBQ0VfQ0hBUkFDVEVSUywgJycpO1xuXHRcdHZhciBsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdFx0aWYgKGxlbmd0aCAlIDQgPT0gMCkge1xuXHRcdFx0aW5wdXQgPSBpbnB1dC5yZXBsYWNlKC89PT8kLywgJycpO1xuXHRcdFx0bGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRsZW5ndGggJSA0ID09IDEgfHxcblx0XHRcdC8vIGh0dHA6Ly93aGF0d2cub3JnL0MjYWxwaGFudW1lcmljLWFzY2lpLWNoYXJhY3RlcnNcblx0XHRcdC9bXithLXpBLVowLTkvXS8udGVzdChpbnB1dClcblx0XHQpIHtcblx0XHRcdGVycm9yKFxuXHRcdFx0XHQnSW52YWxpZCBjaGFyYWN0ZXI6IHRoZSBzdHJpbmcgdG8gYmUgZGVjb2RlZCBpcyBub3QgY29ycmVjdGx5IGVuY29kZWQuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIGJpdENvdW50ZXIgPSAwO1xuXHRcdHZhciBiaXRTdG9yYWdlO1xuXHRcdHZhciBidWZmZXI7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdHZhciBwb3NpdGlvbiA9IC0xO1xuXHRcdHdoaWxlICgrK3Bvc2l0aW9uIDwgbGVuZ3RoKSB7XG5cdFx0XHRidWZmZXIgPSBUQUJMRS5pbmRleE9mKGlucHV0LmNoYXJBdChwb3NpdGlvbikpO1xuXHRcdFx0Yml0U3RvcmFnZSA9IGJpdENvdW50ZXIgJSA0ID8gYml0U3RvcmFnZSAqIDY0ICsgYnVmZmVyIDogYnVmZmVyO1xuXHRcdFx0Ly8gVW5sZXNzIHRoaXMgaXMgdGhlIGZpcnN0IG9mIGEgZ3JvdXAgb2YgNCBjaGFyYWN0ZXJz4oCmXG5cdFx0XHRpZiAoYml0Q291bnRlcisrICUgNCkge1xuXHRcdFx0XHQvLyDigKZjb252ZXJ0IHRoZSBmaXJzdCA4IGJpdHMgdG8gYSBzaW5nbGUgQVNDSUkgY2hhcmFjdGVyLlxuXHRcdFx0XHRvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShcblx0XHRcdFx0XHQweEZGICYgYml0U3RvcmFnZSA+PiAoLTIgKiBiaXRDb3VudGVyICYgNilcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHQvLyBgZW5jb2RlYCBpcyBkZXNpZ25lZCB0byBiZSBmdWxseSBjb21wYXRpYmxlIHdpdGggYGJ0b2FgIGFzIGRlc2NyaWJlZCBpbiB0aGVcblx0Ly8gSFRNTCBTdGFuZGFyZDogaHR0cDovL3doYXR3Zy5vcmcvaHRtbC93ZWJhcHBhcGlzLmh0bWwjZG9tLXdpbmRvd2Jhc2U2NC1idG9hXG5cdHZhciBlbmNvZGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdGlucHV0ID0gU3RyaW5nKGlucHV0KTtcblx0XHRpZiAoL1teXFwwLVxceEZGXS8udGVzdChpbnB1dCkpIHtcblx0XHRcdC8vIE5vdGU6IG5vIG5lZWQgdG8gc3BlY2lhbC1jYXNlIGFzdHJhbCBzeW1ib2xzIGhlcmUsIGFzIHN1cnJvZ2F0ZXMgYXJlXG5cdFx0XHQvLyBtYXRjaGVkLCBhbmQgdGhlIGlucHV0IGlzIHN1cHBvc2VkIHRvIG9ubHkgY29udGFpbiBBU0NJSSBhbnl3YXkuXG5cdFx0XHRlcnJvcihcblx0XHRcdFx0J1RoZSBzdHJpbmcgdG8gYmUgZW5jb2RlZCBjb250YWlucyBjaGFyYWN0ZXJzIG91dHNpZGUgb2YgdGhlICcgK1xuXHRcdFx0XHQnTGF0aW4xIHJhbmdlLidcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHZhciBwYWRkaW5nID0gaW5wdXQubGVuZ3RoICUgMztcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0dmFyIHBvc2l0aW9uID0gLTE7XG5cdFx0dmFyIGE7XG5cdFx0dmFyIGI7XG5cdFx0dmFyIGM7XG5cdFx0dmFyIGQ7XG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHQvLyBNYWtlIHN1cmUgYW55IHBhZGRpbmcgaXMgaGFuZGxlZCBvdXRzaWRlIG9mIHRoZSBsb29wLlxuXHRcdHZhciBsZW5ndGggPSBpbnB1dC5sZW5ndGggLSBwYWRkaW5nO1xuXG5cdFx0d2hpbGUgKCsrcG9zaXRpb24gPCBsZW5ndGgpIHtcblx0XHRcdC8vIFJlYWQgdGhyZWUgYnl0ZXMsIGkuZS4gMjQgYml0cy5cblx0XHRcdGEgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA8PCAxNjtcblx0XHRcdGIgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pIDw8IDg7XG5cdFx0XHRjID0gaW5wdXQuY2hhckNvZGVBdCgrK3Bvc2l0aW9uKTtcblx0XHRcdGJ1ZmZlciA9IGEgKyBiICsgYztcblx0XHRcdC8vIFR1cm4gdGhlIDI0IGJpdHMgaW50byBmb3VyIGNodW5rcyBvZiA2IGJpdHMgZWFjaCwgYW5kIGFwcGVuZCB0aGVcblx0XHRcdC8vIG1hdGNoaW5nIGNoYXJhY3RlciBmb3IgZWFjaCBvZiB0aGVtIHRvIHRoZSBvdXRwdXQuXG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDE4ICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDEyICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDYgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgJiAweDNGKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAocGFkZGluZyA9PSAyKSB7XG5cdFx0XHRhID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikgPDwgODtcblx0XHRcdGIgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pO1xuXHRcdFx0YnVmZmVyID0gYSArIGI7XG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDEwKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyID4+IDQpICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA8PCAyKSAmIDB4M0YpICtcblx0XHRcdFx0Jz0nXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAocGFkZGluZyA9PSAxKSB7XG5cdFx0XHRidWZmZXIgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA8PCA0KSAmIDB4M0YpICtcblx0XHRcdFx0Jz09J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdHZhciBiYXNlNjQgPSB7XG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCd2ZXJzaW9uJzogJzAuMS4wJ1xuXHR9O1xuXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGJhc2U2NDtcblx0XHR9KTtcblx0fVx0ZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IGJhc2U2NDtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yICh2YXIga2V5IGluIGJhc2U2NCkge1xuXHRcdFx0XHRiYXNlNjQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IGJhc2U2NFtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LmJhc2U2NCA9IGJhc2U2NDtcblx0fVxuXG59KHRoaXMpKTtcbiIsIiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uc1xuICovXG5cbnZhciB1dGlsID0ge307XG5cbnV0aWwuaXNPYmplY3QgPSBmdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxudXRpbC5pc051bWJlciA9IGZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbnV0aWwuaXNVbmRlZmluZWQgPSBmdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuXG51dGlsLmlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZyl7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5cbi8qKlxuICogRXZlbnRFbWl0dGVyIGNsYXNzXG4gKi9cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG5FdmVudEVtaXR0ZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59O1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghdXRpbC5pc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InICYmICF0aGlzLl9ldmVudHMuZXJyb3IpIHtcbiAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmICh1dGlsLmlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodXRpbC5pc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAodXRpbC5pc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCF1dGlsLmlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG5cbiAgICAgIGlmICh1dGlsLmlzRnVuY3Rpb24oY29uc29sZS5lcnJvcikpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICBpZiAodXRpbC5pc0Z1bmN0aW9uKGNvbnNvbGUudHJhY2UpKVxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAodXRpbC5pc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShsaXN0ZW5lcnMpKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmICh1dGlsLmlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIFNoaW1taW5nIHN0YXJ0cyBoZXJlLlxuKGZ1bmN0aW9uKCkge1xuICAvLyBVdGlscy5cbiAgdmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuL3V0aWxzJykubG9nO1xuICB2YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG4gIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJEZXRhaWxzID0gYnJvd3NlckRldGFpbHM7XG4gIG1vZHVsZS5leHBvcnRzLmV4dHJhY3RWZXJzaW9uID0gcmVxdWlyZSgnLi91dGlscycpLmV4dHJhY3RWZXJzaW9uO1xuICBtb2R1bGUuZXhwb3J0cy5kaXNhYmxlTG9nID0gcmVxdWlyZSgnLi91dGlscycpLmRpc2FibGVMb2c7XG5cbiAgLy8gQ29tbWVudCBvdXQgdGhlIGxpbmUgYmVsb3cgaWYgeW91IHdhbnQgbG9nZ2luZyB0byBvY2N1ciwgaW5jbHVkaW5nIGxvZ2dpbmdcbiAgLy8gZm9yIHRoZSBzd2l0Y2ggc3RhdGVtZW50IGJlbG93LiBDYW4gYWxzbyBiZSB0dXJuZWQgb24gaW4gdGhlIGJyb3dzZXIgdmlhXG4gIC8vIGFkYXB0ZXIuZGlzYWJsZUxvZyhmYWxzZSksIGJ1dCB0aGVuIGxvZ2dpbmcgZnJvbSB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvd1xuICAvLyB3aWxsIG5vdCBhcHBlYXIuXG4gIHJlcXVpcmUoJy4vdXRpbHMnKS5kaXNhYmxlTG9nKHRydWUpO1xuXG4gIC8vIEJyb3dzZXIgc2hpbXMuXG4gIHZhciBjaHJvbWVTaGltID0gcmVxdWlyZSgnLi9jaHJvbWUvY2hyb21lX3NoaW0nKSB8fCBudWxsO1xuICB2YXIgZWRnZVNoaW0gPSByZXF1aXJlKCcuL2VkZ2UvZWRnZV9zaGltJykgfHwgbnVsbDtcbiAgdmFyIGZpcmVmb3hTaGltID0gcmVxdWlyZSgnLi9maXJlZm94L2ZpcmVmb3hfc2hpbScpIHx8IG51bGw7XG4gIHZhciBzYWZhcmlTaGltID0gcmVxdWlyZSgnLi9zYWZhcmkvc2FmYXJpX3NoaW0nKSB8fCBudWxsO1xuXG4gIC8vIFNoaW0gYnJvd3NlciBpZiBmb3VuZC5cbiAgc3dpdGNoIChicm93c2VyRGV0YWlscy5icm93c2VyKSB7XG4gICAgY2FzZSAnb3BlcmEnOiAvLyBmYWxsdGhyb3VnaCBhcyBpdCB1c2VzIGNocm9tZSBzaGltc1xuICAgIGNhc2UgJ2Nocm9tZSc6XG4gICAgICBpZiAoIWNocm9tZVNoaW0gfHwgIWNocm9tZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ0Nocm9tZSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBjaHJvbWUuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBjaHJvbWVTaGltO1xuXG4gICAgICBjaHJvbWVTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbU9uVHJhY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpcmVmb3gnOlxuICAgICAgaWYgKCFmaXJlZm94U2hpbSB8fCAhZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ0ZpcmVmb3ggc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZmlyZWZveC4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGZpcmVmb3hTaGltO1xuXG4gICAgICBmaXJlZm94U2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltU291cmNlT2JqZWN0KCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1PblRyYWNrKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlZGdlJzpcbiAgICAgIGlmICghZWRnZVNoaW0gfHwgIWVkZ2VTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdNUyBlZGdlIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGVkZ2UuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBlZGdlU2hpbTtcblxuICAgICAgZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzYWZhcmknOlxuICAgICAgaWYgKCFzYWZhcmlTaGltKSB7XG4gICAgICAgIGxvZ2dpbmcoJ1NhZmFyaSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBzYWZhcmkuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBzYWZhcmlTaGltO1xuXG4gICAgICBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2dnaW5nKCdVbnN1cHBvcnRlZCBicm93c2VyIScpO1xuICB9XG59KSgpO1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykubG9nO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGNocm9tZVNoaW0gPSB7XG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmICEoJ29udHJhY2snIGluXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIC8vIG9uYWRkc3RyZWFtIGRvZXMgbm90IGZpcmUgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIHRvIGFuIGV4aXN0aW5nXG4gICAgICAgICAgICAvLyBzdHJlYW0uIEJ1dCBzdHJlYW0ub25hZGR0cmFjayBpcyBpbXBsZW1lbnRlZCBzbyB3ZSB1c2UgdGhhdC5cbiAgICAgICAgICAgIGUuc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24odGUpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRlLnRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdGUudHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAod2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcbiAgICAgICAgISgnc3JjT2JqZWN0JyBpbiB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIC8vIFNoaW0gdGhlIHNyY09iamVjdCBwcm9wZXJ0eSwgb25jZSwgd2hlbiBIVE1MTWVkaWFFbGVtZW50IGlzIGZvdW5kLlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjT2JqZWN0Jywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIC8vIFVzZSBfc3JjT2JqZWN0IGFzIGEgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgdGhpcyBzaGltXG4gICAgICAgICAgICB0aGlzLl9zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgICBpZiAodGhpcy5zcmMpIHtcbiAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnNyYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghc3RyZWFtKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3JjID0gJyc7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byByZWNyZWF0ZSB0aGUgYmxvYiB1cmwgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIG9yXG4gICAgICAgICAgICAvLyByZW1vdmVkLiBEb2luZyBpdCBtYW51YWxseSBzaW5jZSB3ZSB3YW50IHRvIGF2b2lkIGEgcmVjdXJzaW9uLlxuICAgICAgICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLnNyYykge1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoc2VsZi5zcmMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcigncmVtb3ZldHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgIC8vIFRyYW5zbGF0ZSBpY2VUcmFuc3BvcnRQb2xpY3kgdG8gaWNlVHJhbnNwb3J0cyxcbiAgICAgIC8vIHNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3dlYnJ0Yy9pc3N1ZXMvZGV0YWlsP2lkPTQ4NjlcbiAgICAgIGxvZ2dpbmcoJ1BlZXJDb25uZWN0aW9uJyk7XG4gICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgIHBjQ29uZmlnLmljZVRyYW5zcG9ydHMgPSBwY0NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3k7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYyA9IG5ldyB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cyk7XG4gICAgICB2YXIgb3JpZ0dldFN0YXRzID0gcGMuZ2V0U3RhdHMuYmluZChwYyk7XG4gICAgICBwYy5nZXRTdGF0cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICAvLyBJZiBzZWxlY3RvciBpcyBhIGZ1bmN0aW9uIHRoZW4gd2UgYXJlIGluIHRoZSBvbGQgc3R5bGUgc3RhdHMgc28ganVzdFxuICAgICAgICAvLyBwYXNzIGJhY2sgdGhlIG9yaWdpbmFsIGdldFN0YXRzIGZvcm1hdCB0byBhdm9pZCBicmVha2luZyBvbGQgdXNlcnMuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpeENocm9tZVN0YXRzXyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgdmFyIHN0YW5kYXJkUmVwb3J0ID0ge307XG4gICAgICAgICAgdmFyIHJlcG9ydHMgPSByZXNwb25zZS5yZXN1bHQoKTtcbiAgICAgICAgICByZXBvcnRzLmZvckVhY2goZnVuY3Rpb24ocmVwb3J0KSB7XG4gICAgICAgICAgICB2YXIgc3RhbmRhcmRTdGF0cyA9IHtcbiAgICAgICAgICAgICAgaWQ6IHJlcG9ydC5pZCxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiByZXBvcnQudGltZXN0YW1wLFxuICAgICAgICAgICAgICB0eXBlOiByZXBvcnQudHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcG9ydC5uYW1lcygpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgICBzdGFuZGFyZFN0YXRzW25hbWVdID0gcmVwb3J0LnN0YXQobmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0YW5kYXJkUmVwb3J0W3N0YW5kYXJkU3RhdHMuaWRdID0gc3RhbmRhcmRTdGF0cztcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBzdGFuZGFyZFJlcG9ydDtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgdmFyIHN1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGFyZ3NbMV0oZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKSk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMuYXBwbHkodGhpcywgW3N1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfLFxuICAgICAgICAgICAgICBhcmd1bWVudHNbMF1dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHByb21pc2Utc3VwcG9ydFxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAxICYmIHR5cGVvZiBzZWxlY3RvciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9yaWdHZXRTdGF0cy5hcHBseShzZWxmLFxuICAgICAgICAgICAgICAgIFtmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZS5hcHBseShudWxsLCBbZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKV0pO1xuICAgICAgICAgICAgICAgIH0sIHJlamVjdF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmlnR2V0U3RhdHMuYXBwbHkoc2VsZiwgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcGM7XG4gICAgfTtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cbiAgICBpZiAod2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGFkZCBwcm9taXNlIHN1cHBvcnRcbiAgICBbJ2NyZWF0ZU9mZmVyJywgJ2NyZWF0ZUFuc3dlciddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSB8fCAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1swXSkgPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkoc2VsZiwgW3Jlc29sdmUsIHJlamVjdCwgb3B0c10pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgICAgIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGFyZ3NbMF0gPSBuZXcgKChtZXRob2QgPT09ICdhZGRJY2VDYW5kaWRhdGUnKT9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3NbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkoc2VsZiwgW2FyZ3NbMF0sXG4gICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgICAgICAgIGFyZ3NbMV0uYXBwbHkobnVsbCwgW10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgICAgICAgIGFyZ3NbMl0uYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgfSxcblxuICAvLyBBdHRhY2ggYSBtZWRpYSBzdHJlYW0gdG8gYW4gZWxlbWVudC5cbiAgYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKGVsZW1lbnQsIHN0cmVhbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIGF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uID49IDQzKSB7XG4gICAgICBlbGVtZW50LnNyY09iamVjdCA9IHN0cmVhbTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtZW50LnNyYyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGVsZW1lbnQuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnaW5nKCdFcnJvciBhdHRhY2hpbmcgc3RyZWFtIHRvIGVsZW1lbnQuJyk7XG4gICAgfVxuICB9LFxuXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHRvLCBmcm9tKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgcmVhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA+PSA0Mykge1xuICAgICAgdG8uc3JjT2JqZWN0ID0gZnJvbS5zcmNPYmplY3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvLnNyYyA9IGZyb20uc3JjO1xuICAgIH1cbiAgfVxufTtcblxuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbU9uVHJhY2s6IGNocm9tZVNoaW0uc2hpbU9uVHJhY2ssXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCxcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKSxcbiAgYXR0YWNoTWVkaWFTdHJlYW06IGNocm9tZVNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGNocm9tZVNoaW0ucmVhdHRhY2hNZWRpYVN0cmVhbVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmxvZztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvbnN0cmFpbnRzVG9DaHJvbWVfID0gZnVuY3Rpb24oYykge1xuICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5tYW5kYXRvcnkgfHwgYy5vcHRpb25hbCkge1xuICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIHZhciBjYyA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVxdWlyZScgfHwga2V5ID09PSAnYWR2YW5jZWQnIHx8IGtleSA9PT0gJ21lZGlhU291cmNlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgciA9ICh0eXBlb2YgY1trZXldID09PSAnb2JqZWN0JykgPyBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xuICAgICAgICByLm1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgIH1cbiAgICAgIHZhciBvbGRuYW1lXyA9IGZ1bmN0aW9uKHByZWZpeCwgbmFtZSkge1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmFtZSA9PT0gJ2RldmljZUlkJykgPyAnc291cmNlSWQnIDogbmFtZTtcbiAgICAgIH07XG4gICAgICBpZiAoci5pZGVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNjLm9wdGlvbmFsID0gY2Mub3B0aW9uYWwgfHwgW107XG4gICAgICAgIHZhciBvYyA9IHt9O1xuICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJ21pbicsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgICBvYyA9IHt9O1xuICAgICAgICAgIG9jW29sZG5hbWVfKCdtYXgnLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJycsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygci5leGFjdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xuICAgICAgICBjYy5tYW5kYXRvcnlbb2xkbmFtZV8oJycsIGtleSldID0gci5leGFjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFsnbWluJywgJ21heCddLmZvckVhY2goZnVuY3Rpb24obWl4KSB7XG4gICAgICAgICAgaWYgKHJbbWl4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjYy5tYW5kYXRvcnkgPSBjYy5tYW5kYXRvcnkgfHwge307XG4gICAgICAgICAgICBjYy5tYW5kYXRvcnlbb2xkbmFtZV8obWl4LCBrZXkpXSA9IHJbbWl4XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChjLmFkdmFuY2VkKSB7XG4gICAgICBjYy5vcHRpb25hbCA9IChjYy5vcHRpb25hbCB8fCBbXSkuY29uY2F0KGMuYWR2YW5jZWQpO1xuICAgIH1cbiAgICByZXR1cm4gY2M7XG4gIH07XG5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgaWYgKGNvbnN0cmFpbnRzLmF1ZGlvKSB7XG4gICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICB9XG4gICAgaWYgKGNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICB9XG4gICAgbG9nZ2luZygnY2hyb21lOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICByZXR1cm4gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYShjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKTtcbiAgfTtcbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGdldFVzZXJNZWRpYV87XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYShjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge1xuICAgICAgZ2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGVudW1lcmF0ZURldmljZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIHZhciBraW5kcyA9IHthdWRpbzogJ2F1ZGlvaW5wdXQnLCB2aWRlbzogJ3ZpZGVvaW5wdXQnfTtcbiAgICAgICAgICByZXR1cm4gTWVkaWFTdHJlYW1UcmFjay5nZXRTb3VyY2VzKGZ1bmN0aW9uKGRldmljZXMpIHtcbiAgICAgICAgICAgIHJlc29sdmUoZGV2aWNlcy5tYXAoZnVuY3Rpb24oZGV2aWNlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7bGFiZWw6IGRldmljZS5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICBraW5kOiBraW5kc1tkZXZpY2Uua2luZF0sXG4gICAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQ6IGRldmljZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICBncm91cElkOiAnJ307XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBBIHNoaW0gZm9yIGdldFVzZXJNZWRpYSBtZXRob2Qgb24gdGhlIG1lZGlhRGV2aWNlcyBvYmplY3QuXG4gIC8vIFRPRE8oS2FwdGVuSmFuc3NvbikgcmVtb3ZlIG9uY2UgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIHN0YWJsZS5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSkge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICAgIHJldHVybiBnZXRVc2VyTWVkaWFQcm9taXNlXyhjb25zdHJhaW50cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVuIHRob3VnaCBDaHJvbWUgNDUgaGFzIG5hdmlnYXRvci5tZWRpYURldmljZXMgYW5kIGEgZ2V0VXNlck1lZGlhXG4gICAgLy8gZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIFByb21pc2UsIGl0IGRvZXMgbm90IGFjY2VwdCBzcGVjLXN0eWxlXG4gICAgLy8gY29uc3RyYWludHMuXG4gICAgdmFyIG9yaWdHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmIChjKSB7XG4gICAgICAgIGxvZ2dpbmcoJ3NwZWM6ICAgJyArIEpTT04uc3RyaW5naWZ5KGMpKTsgLy8gd2hpdGVzcGFjZSBmb3IgYWxpZ25tZW50XG4gICAgICAgIGMuYXVkaW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjLmF1ZGlvKTtcbiAgICAgICAgYy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGMudmlkZW8pO1xuICAgICAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3JpZ0dldFVzZXJNZWRpYShjKTtcbiAgICB9LmJpbmQodGhpcyk7XG4gIH1cblxuICAvLyBEdW1teSBkZXZpY2VjaGFuZ2UgZXZlbnQgbWV0aG9kcy5cbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgbG9nZ2luZygnRHVtbXkgbWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgY2FsbGVkLicpO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gU0RQIGhlbHBlcnMuXG52YXIgU0RQVXRpbHMgPSB7fTtcblxuLy8gR2VuZXJhdGUgYW4gYWxwaGFudW1lcmljIGlkZW50aWZpZXIgZm9yIGNuYW1lIG9yIG1pZHMuXG4vLyBUT0RPOiB1c2UgVVVJRHMgaW5zdGVhZD8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgMTApO1xufTtcblxuLy8gVGhlIFJUQ1AgQ05BTUUgdXNlZCBieSBhbGwgcGVlcmNvbm5lY3Rpb25zIGZyb20gdGhlIHNhbWUgSlMuXG5TRFBVdGlscy5sb2NhbENOYW1lID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbi8vIFNwbGl0cyBTRFAgaW50byBsaW5lcywgZGVhbGluZyB3aXRoIGJvdGggQ1JMRiBhbmQgTEYuXG5TRFBVdGlscy5zcGxpdExpbmVzID0gZnVuY3Rpb24oYmxvYikge1xuICByZXR1cm4gYmxvYi50cmltKCkuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUudHJpbSgpO1xuICB9KTtcbn07XG4vLyBTcGxpdHMgU0RQIGludG8gc2Vzc2lvbnBhcnQgYW5kIG1lZGlhc2VjdGlvbnMuIEVuc3VyZXMgQ1JMRi5cblNEUFV0aWxzLnNwbGl0U2VjdGlvbnMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHZhciBwYXJ0cyA9IGJsb2Iuc3BsaXQoJ1xcbm09Jyk7XG4gIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCwgaW5kZXgpIHtcbiAgICByZXR1cm4gKGluZGV4ID4gMCA/ICdtPScgKyBwYXJ0IDogcGFydCkudHJpbSgpICsgJ1xcclxcbic7XG4gIH0pO1xufTtcblxuLy8gUmV0dXJucyBsaW5lcyB0aGF0IHN0YXJ0IHdpdGggYSBjZXJ0YWluIHByZWZpeC5cblNEUFV0aWxzLm1hdGNoUHJlZml4ID0gZnVuY3Rpb24oYmxvYiwgcHJlZml4KSB7XG4gIHJldHVybiBTRFBVdGlscy5zcGxpdExpbmVzKGJsb2IpLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUuaW5kZXhPZihwcmVmaXgpID09PSAwO1xuICB9KTtcbn07XG5cbi8vIFBhcnNlcyBhbiBJQ0UgY2FuZGlkYXRlIGxpbmUuIFNhbXBsZSBpbnB1dDpcbi8vIGNhbmRpZGF0ZTo3MDI3ODYzNTAgMiB1ZHAgNDE4MTk5MDIgOC44LjguOCA2MDc2OSB0eXAgcmVsYXkgcmFkZHIgOC44LjguOFxuLy8gcnBvcnQgNTU5OTZcIlxuU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cztcbiAgLy8gUGFyc2UgYm90aCB2YXJpYW50cy5cbiAgaWYgKGxpbmUuaW5kZXhPZignYT1jYW5kaWRhdGU6JykgPT09IDApIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEyKS5zcGxpdCgnICcpO1xuICB9IGVsc2Uge1xuICAgIHBhcnRzID0gbGluZS5zdWJzdHJpbmcoMTApLnNwbGl0KCcgJyk7XG4gIH1cblxuICB2YXIgY2FuZGlkYXRlID0ge1xuICAgIGZvdW5kYXRpb246IHBhcnRzWzBdLFxuICAgIGNvbXBvbmVudDogcGFydHNbMV0sXG4gICAgcHJvdG9jb2w6IHBhcnRzWzJdLnRvTG93ZXJDYXNlKCksXG4gICAgcHJpb3JpdHk6IHBhcnNlSW50KHBhcnRzWzNdLCAxMCksXG4gICAgaXA6IHBhcnRzWzRdLFxuICAgIHBvcnQ6IHBhcnNlSW50KHBhcnRzWzVdLCAxMCksXG4gICAgLy8gc2tpcCBwYXJ0c1s2XSA9PSAndHlwJ1xuICAgIHR5cGU6IHBhcnRzWzddXG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHN3aXRjaCAocGFydHNbaV0pIHtcbiAgICAgIGNhc2UgJ3JhZGRyJzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jwb3J0JzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRQb3J0ID0gcGFyc2VJbnQocGFydHNbaSArIDFdLCAxMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndGNwdHlwZSc6XG4gICAgICAgIGNhbmRpZGF0ZS50Y3BUeXBlID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vIFVua25vd24gZXh0ZW5zaW9ucyBhcmUgc2lsZW50bHkgaWdub3JlZC5cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBjYW5kaWRhdGU7XG59O1xuXG4vLyBUcmFuc2xhdGVzIGEgY2FuZGlkYXRlIG9iamVjdCBpbnRvIFNEUCBjYW5kaWRhdGUgYXR0cmlidXRlLlxuU0RQVXRpbHMud3JpdGVDYW5kaWRhdGUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgdmFyIHNkcCA9IFtdO1xuICBzZHAucHVzaChjYW5kaWRhdGUuZm91bmRhdGlvbik7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5jb21wb25lbnQpO1xuICBzZHAucHVzaChjYW5kaWRhdGUucHJvdG9jb2wudG9VcHBlckNhc2UoKSk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wcmlvcml0eSk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5pcCk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wb3J0KTtcblxuICB2YXIgdHlwZSA9IGNhbmRpZGF0ZS50eXBlO1xuICBzZHAucHVzaCgndHlwJyk7XG4gIHNkcC5wdXNoKHR5cGUpO1xuICBpZiAodHlwZSAhPT0gJ2hvc3QnICYmIGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyAmJlxuICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRQb3J0KSB7XG4gICAgc2RwLnB1c2goJ3JhZGRyJyk7XG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzKTsgLy8gd2FzOiByZWxBZGRyXG4gICAgc2RwLnB1c2goJ3Jwb3J0Jyk7XG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnJlbGF0ZWRQb3J0KTsgLy8gd2FzOiByZWxQb3J0XG4gIH1cbiAgaWYgKGNhbmRpZGF0ZS50Y3BUeXBlICYmIGNhbmRpZGF0ZS5wcm90b2NvbC50b0xvd2VyQ2FzZSgpID09PSAndGNwJykge1xuICAgIHNkcC5wdXNoKCd0Y3B0eXBlJyk7XG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnRjcFR5cGUpO1xuICB9XG4gIHJldHVybiAnY2FuZGlkYXRlOicgKyBzZHAuam9pbignICcpO1xufTtcblxuLy8gUGFyc2VzIGFuIHJ0cG1hcCBsaW5lLCByZXR1cm5zIFJUQ1J0cENvZGRlY1BhcmFtZXRlcnMuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRwbWFwOjExMSBvcHVzLzQ4MDAwLzJcblNEUFV0aWxzLnBhcnNlUnRwTWFwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cig5KS5zcGxpdCgnICcpO1xuICB2YXIgcGFyc2VkID0ge1xuICAgIHBheWxvYWRUeXBlOiBwYXJzZUludChwYXJ0cy5zaGlmdCgpLCAxMCkgLy8gd2FzOiBpZFxuICB9O1xuXG4gIHBhcnRzID0gcGFydHNbMF0uc3BsaXQoJy8nKTtcblxuICBwYXJzZWQubmFtZSA9IHBhcnRzWzBdO1xuICBwYXJzZWQuY2xvY2tSYXRlID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKTsgLy8gd2FzOiBjbG9ja3JhdGVcbiAgLy8gd2FzOiBjaGFubmVsc1xuICBwYXJzZWQubnVtQ2hhbm5lbHMgPSBwYXJ0cy5sZW5ndGggPT09IDMgPyBwYXJzZUludChwYXJ0c1syXSwgMTApIDogMTtcbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cbi8vIEdlbmVyYXRlIGFuIGE9cnRwbWFwIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3Jcbi8vIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRwTWFwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICByZXR1cm4gJ2E9cnRwbWFwOicgKyBwdCArICcgJyArIGNvZGVjLm5hbWUgKyAnLycgKyBjb2RlYy5jbG9ja1JhdGUgK1xuICAgICAgKGNvZGVjLm51bUNoYW5uZWxzICE9PSAxID8gJy8nICsgY29kZWMubnVtQ2hhbm5lbHMgOiAnJykgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBhPWV4dG1hcCBsaW5lIChoZWFkZXJleHRlbnNpb24gZnJvbSBSRkMgNTI4NSkuIFNhbXBsZSBpbnB1dDpcbi8vIGE9ZXh0bWFwOjIgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxuU0RQVXRpbHMucGFyc2VFeHRtYXAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDkpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgaWQ6IHBhcnNlSW50KHBhcnRzWzBdLCAxMCksXG4gICAgdXJpOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gR2VuZXJhdGVzIGE9ZXh0bWFwIGxpbmUgZnJvbSBSVENSdHBIZWFkZXJFeHRlbnNpb25QYXJhbWV0ZXJzIG9yXG4vLyBSVENSdHBIZWFkZXJFeHRlbnNpb24uXG5TRFBVdGlscy53cml0ZUV4dG1hcCA9IGZ1bmN0aW9uKGhlYWRlckV4dGVuc2lvbikge1xuICByZXR1cm4gJ2E9ZXh0bWFwOicgKyAoaGVhZGVyRXh0ZW5zaW9uLmlkIHx8IGhlYWRlckV4dGVuc2lvbi5wcmVmZXJyZWRJZCkgK1xuICAgICAgICcgJyArIGhlYWRlckV4dGVuc2lvbi51cmkgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBmdG1wIGxpbmUsIHJldHVybnMgZGljdGlvbmFyeS4gU2FtcGxlIGlucHV0OlxuLy8gYT1mbXRwOjk2IHZicj1vbjtjbmc9b25cbi8vIEFsc28gZGVhbHMgd2l0aCB2YnI9b247IGNuZz1vblxuU0RQVXRpbHMucGFyc2VGbXRwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrdjtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnOycpO1xuICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAga3YgPSBwYXJ0c1tqXS50cmltKCkuc3BsaXQoJz0nKTtcbiAgICBwYXJzZWRba3ZbMF0udHJpbSgpXSA9IGt2WzFdO1xuICB9XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZXMgYW4gYT1mdG1wIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVGbXRwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmUgPSAnJztcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICBpZiAoY29kZWMucGFyYW1ldGVycyAmJiBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5sZW5ndGgpIHtcbiAgICB2YXIgcGFyYW1zID0gW107XG4gICAgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykuZm9yRWFjaChmdW5jdGlvbihwYXJhbSkge1xuICAgICAgcGFyYW1zLnB1c2gocGFyYW0gKyAnPScgKyBjb2RlYy5wYXJhbWV0ZXJzW3BhcmFtXSk7XG4gICAgfSk7XG4gICAgbGluZSArPSAnYT1mbXRwOicgKyBwdCArICcgJyArIHBhcmFtcy5qb2luKCc7JykgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gbGluZTtcbn07XG5cbi8vIFBhcnNlcyBhbiBydGNwLWZiIGxpbmUsIHJldHVybnMgUlRDUFJ0Y3BGZWVkYmFjayBvYmplY3QuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRjcC1mYjo5OCBuYWNrIHJwc2lcblNEUFV0aWxzLnBhcnNlUnRjcEZiID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogcGFydHMuc2hpZnQoKSxcbiAgICBwYXJhbWV0ZXI6IHBhcnRzLmpvaW4oJyAnKVxuICB9O1xufTtcbi8vIEdlbmVyYXRlIGE9cnRjcC1mYiBsaW5lcyBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0Y3BGYiA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBsaW5lcyA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5ydGNwRmVlZGJhY2sgJiYgY29kZWMucnRjcEZlZWRiYWNrLmxlbmd0aCkge1xuICAgIC8vIEZJWE1FOiBzcGVjaWFsIGhhbmRsaW5nIGZvciB0cnItaW50P1xuICAgIGNvZGVjLnJ0Y3BGZWVkYmFjay5mb3JFYWNoKGZ1bmN0aW9uKGZiKSB7XG4gICAgICBsaW5lcyArPSAnYT1ydGNwLWZiOicgKyBwdCArICcgJyArIGZiLnR5cGUgKyAnICcgKyBmYi5wYXJhbWV0ZXIgK1xuICAgICAgICAgICdcXHJcXG4nO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBsaW5lcztcbn07XG5cbi8vIFBhcnNlcyBhbiBSRkMgNTU3NiBzc3JjIG1lZGlhIGF0dHJpYnV0ZS4gU2FtcGxlIGlucHV0OlxuLy8gYT1zc3JjOjM3MzU5Mjg1NTkgY25hbWU6c29tZXRoaW5nXG5TRFBVdGlscy5wYXJzZVNzcmNNZWRpYSA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHNwID0gbGluZS5pbmRleE9mKCcgJyk7XG4gIHZhciBwYXJ0cyA9IHtcbiAgICBzc3JjOiBwYXJzZUludChsaW5lLnN1YnN0cig3LCBzcCAtIDcpLCAxMClcbiAgfTtcbiAgdmFyIGNvbG9uID0gbGluZS5pbmRleE9mKCc6Jywgc3ApO1xuICBpZiAoY29sb24gPiAtMSkge1xuICAgIHBhcnRzLmF0dHJpYnV0ZSA9IGxpbmUuc3Vic3RyKHNwICsgMSwgY29sb24gLSBzcCAtIDEpO1xuICAgIHBhcnRzLnZhbHVlID0gbGluZS5zdWJzdHIoY29sb24gKyAxKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEpO1xuICB9XG4gIHJldHVybiBwYXJ0cztcbn07XG5cbi8vIEV4dHJhY3RzIERUTFMgcGFyYW1ldGVycyBmcm9tIFNEUCBtZWRpYSBzZWN0aW9uIG9yIHNlc3Npb25wYXJ0LlxuLy8gRklYTUU6IGZvciBjb25zaXN0ZW5jeSB3aXRoIG90aGVyIGZ1bmN0aW9ucyB0aGlzIHNob3VsZCBvbmx5XG4vLyAgIGdldCB0aGUgZmluZ2VycHJpbnQgbGluZSBhcyBpbnB1dC4gU2VlIGFsc28gZ2V0SWNlUGFyYW1ldGVycy5cblNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cbiAgbGluZXMgPSBsaW5lcy5jb25jYXQoU0RQVXRpbHMuc3BsaXRMaW5lcyhzZXNzaW9ucGFydCkpO1xuICB2YXIgZnBMaW5lID0gbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWZpbmdlcnByaW50OicpID09PSAwO1xuICB9KVswXS5zdWJzdHIoMTQpO1xuICAvLyBOb3RlOiBhPXNldHVwIGxpbmUgaXMgaWdub3JlZCBzaW5jZSB3ZSB1c2UgdGhlICdhdXRvJyByb2xlLlxuICB2YXIgZHRsc1BhcmFtZXRlcnMgPSB7XG4gICAgcm9sZTogJ2F1dG8nLFxuICAgIGZpbmdlcnByaW50czogW3tcbiAgICAgIGFsZ29yaXRobTogZnBMaW5lLnNwbGl0KCcgJylbMF0sXG4gICAgICB2YWx1ZTogZnBMaW5lLnNwbGl0KCcgJylbMV1cbiAgICB9XVxuICB9O1xuICByZXR1cm4gZHRsc1BhcmFtZXRlcnM7XG59O1xuXG4vLyBTZXJpYWxpemVzIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR1cFR5cGUpIHtcbiAgdmFyIHNkcCA9ICdhPXNldHVwOicgKyBzZXR1cFR5cGUgKyAnXFxyXFxuJztcbiAgcGFyYW1zLmZpbmdlcnByaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGZwKSB7XG4gICAgc2RwICs9ICdhPWZpbmdlcnByaW50OicgKyBmcC5hbGdvcml0aG0gKyAnICcgKyBmcC52YWx1ZSArICdcXHJcXG4nO1xuICB9KTtcbiAgcmV0dXJuIHNkcDtcbn07XG4vLyBQYXJzZXMgSUNFIGluZm9ybWF0aW9uIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBpY2UtdWZyYWcgYW5kIGljZS1wd2QgbGluZXMgYXMgaW5wdXQuXG5TRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cbiAgbGluZXMgPSBsaW5lcy5jb25jYXQoU0RQVXRpbHMuc3BsaXRMaW5lcyhzZXNzaW9ucGFydCkpO1xuICB2YXIgaWNlUGFyYW1ldGVycyA9IHtcbiAgICB1c2VybmFtZUZyYWdtZW50OiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtdWZyYWc6JykgPT09IDA7XG4gICAgfSlbMF0uc3Vic3RyKDEyKSxcbiAgICBwYXNzd29yZDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9aWNlLXB3ZDonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTApXG4gIH07XG4gIHJldHVybiBpY2VQYXJhbWV0ZXJzO1xufTtcblxuLy8gU2VyaWFsaXplcyBJQ0UgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgcmV0dXJuICdhPWljZS11ZnJhZzonICsgcGFyYW1zLnVzZXJuYW1lRnJhZ21lbnQgKyAnXFxyXFxuJyArXG4gICAgICAnYT1pY2UtcHdkOicgKyBwYXJhbXMucGFzc3dvcmQgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgUlRDUnRwUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgZGVzY3JpcHRpb24gPSB7XG4gICAgY29kZWNzOiBbXSxcbiAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICBmZWNNZWNoYW5pc21zOiBbXSxcbiAgICBydGNwOiBbXVxuICB9O1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBtbGluZSA9IGxpbmVzWzBdLnNwbGl0KCcgJyk7XG4gIGZvciAodmFyIGkgPSAzOyBpIDwgbWxpbmUubGVuZ3RoOyBpKyspIHsgLy8gZmluZCBhbGwgY29kZWNzIGZyb20gbWxpbmVbMy4uXVxuICAgIHZhciBwdCA9IG1saW5lW2ldO1xuICAgIHZhciBydHBtYXBsaW5lID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRwbWFwOicgKyBwdCArICcgJylbMF07XG4gICAgaWYgKHJ0cG1hcGxpbmUpIHtcbiAgICAgIHZhciBjb2RlYyA9IFNEUFV0aWxzLnBhcnNlUnRwTWFwKHJ0cG1hcGxpbmUpO1xuICAgICAgdmFyIGZtdHBzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1mbXRwOicgKyBwdCArICcgJyk7XG4gICAgICAvLyBPbmx5IHRoZSBmaXJzdCBhPWZtdHA6PHB0PiBpcyBjb25zaWRlcmVkLlxuICAgICAgY29kZWMucGFyYW1ldGVycyA9IGZtdHBzLmxlbmd0aCA/IFNEUFV0aWxzLnBhcnNlRm10cChmbXRwc1swXSkgOiB7fTtcbiAgICAgIGNvZGVjLnJ0Y3BGZWVkYmFjayA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1mYjonICsgcHQgKyAnICcpXG4gICAgICAgIC5tYXAoU0RQVXRpbHMucGFyc2VSdGNwRmIpO1xuICAgICAgZGVzY3JpcHRpb24uY29kZWNzLnB1c2goY29kZWMpO1xuICAgICAgLy8gcGFyc2UgRkVDIG1lY2hhbmlzbXMgZnJvbSBydHBtYXAgbGluZXMuXG4gICAgICBzd2l0Y2ggKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICBjYXNlICdSRUQnOlxuICAgICAgICBjYXNlICdVTFBGRUMnOlxuICAgICAgICAgIGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMucHVzaChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiAvLyBvbmx5IFJFRCBhbmQgVUxQRkVDIGFyZSByZWNvZ25pemVkIGFzIEZFQyBtZWNoYW5pc21zLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWV4dG1hcDonKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBkZXNjcmlwdGlvbi5oZWFkZXJFeHRlbnNpb25zLnB1c2goU0RQVXRpbHMucGFyc2VFeHRtYXAobGluZSkpO1xuICB9KTtcbiAgLy8gRklYTUU6IHBhcnNlIHJ0Y3AuXG4gIHJldHVybiBkZXNjcmlwdGlvbjtcbn07XG5cbi8vIEdlbmVyYXRlcyBwYXJ0cyBvZiB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gZGVzY3JpYmluZyB0aGUgY2FwYWJpbGl0aWVzIC9cbi8vIHBhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uID0gZnVuY3Rpb24oa2luZCwgY2Fwcykge1xuICB2YXIgc2RwID0gJyc7XG5cbiAgLy8gQnVpbGQgdGhlIG1saW5lLlxuICBzZHAgKz0gJ209JyArIGtpbmQgKyAnICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5sZW5ndGggPiAwID8gJzknIDogJzAnOyAvLyByZWplY3QgaWYgbm8gY29kZWNzLlxuICBzZHAgKz0gJyBVRFAvVExTL1JUUC9TQVZQRiAnO1xuICBzZHAgKz0gY2Fwcy5jb2RlY3MubWFwKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVjLnBheWxvYWRUeXBlO1xuICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcblxuICBzZHAgKz0gJ2M9SU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuICBzZHAgKz0gJ2E9cnRjcDo5IElOIElQNCAwLjAuMC4wXFxyXFxuJztcblxuICAvLyBBZGQgYT1ydHBtYXAgbGluZXMgZm9yIGVhY2ggY29kZWMuIEFsc28gZm10cCBhbmQgcnRjcC1mYi5cbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZVJ0cE1hcChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRm10cChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRjcEZiKGNvZGVjKTtcbiAgfSk7XG4gIC8vIEZJWE1FOiBhZGQgaGVhZGVyRXh0ZW5zaW9ucywgZmVjTWVjaGFuaXNtxZ8gYW5kIHJ0Y3AuXG4gIHNkcCArPSAnYT1ydGNwLW11eFxcclxcbic7XG4gIHJldHVybiBzZHA7XG59O1xuXG4vLyBQYXJzZXMgdGhlIFNEUCBtZWRpYSBzZWN0aW9uIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mXG4vLyBSVENSdHBFbmNvZGluZ1BhcmFtZXRlcnMuXG5TRFBVdGlscy5wYXJzZVJ0cEVuY29kaW5nUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgZW5jb2RpbmdQYXJhbWV0ZXJzID0gW107XG4gIHZhciBkZXNjcmlwdGlvbiA9IFNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuICB2YXIgaGFzUmVkID0gZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5pbmRleE9mKCdSRUQnKSAhPT0gLTE7XG4gIHZhciBoYXNVbHBmZWMgPSBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLmluZGV4T2YoJ1VMUEZFQycpICE9PSAtMTtcblxuICAvLyBmaWx0ZXIgYT1zc3JjOi4uLiBjbmFtZTosIGlnbm9yZSBQbGFuQi1tc2lkXG4gIHZhciBzc3JjcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gIH0pXG4gIC5maWx0ZXIoZnVuY3Rpb24ocGFydHMpIHtcbiAgICByZXR1cm4gcGFydHMuYXR0cmlidXRlID09PSAnY25hbWUnO1xuICB9KTtcbiAgdmFyIHByaW1hcnlTc3JjID0gc3NyY3MubGVuZ3RoID4gMCAmJiBzc3Jjc1swXS5zc3JjO1xuICB2YXIgc2Vjb25kYXJ5U3NyYztcblxuICB2YXIgZmxvd3MgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmMtZ3JvdXA6RklEJylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnICcpO1xuICAgIHBhcnRzLnNoaWZ0KCk7XG4gICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocGFydCwgMTApO1xuICAgIH0pO1xuICB9KTtcbiAgaWYgKGZsb3dzLmxlbmd0aCA+IDAgJiYgZmxvd3NbMF0ubGVuZ3RoID4gMSAmJiBmbG93c1swXVswXSA9PT0gcHJpbWFyeVNzcmMpIHtcbiAgICBzZWNvbmRhcnlTc3JjID0gZmxvd3NbMF1bMV07XG4gIH1cblxuICBkZXNjcmlwdGlvbi5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIGlmIChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdSVFgnICYmIGNvZGVjLnBhcmFtZXRlcnMuYXB0KSB7XG4gICAgICB2YXIgZW5jUGFyYW0gPSB7XG4gICAgICAgIHNzcmM6IHByaW1hcnlTc3JjLFxuICAgICAgICBjb2RlY1BheWxvYWRUeXBlOiBwYXJzZUludChjb2RlYy5wYXJhbWV0ZXJzLmFwdCwgMTApLFxuICAgICAgICBydHg6IHtcbiAgICAgICAgICBzc3JjOiBzZWNvbmRhcnlTc3JjXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaChlbmNQYXJhbSk7XG4gICAgICBpZiAoaGFzUmVkKSB7XG4gICAgICAgIGVuY1BhcmFtID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShlbmNQYXJhbSkpO1xuICAgICAgICBlbmNQYXJhbS5mZWMgPSB7XG4gICAgICAgICAgc3NyYzogc2Vjb25kYXJ5U3NyYyxcbiAgICAgICAgICBtZWNoYW5pc206IGhhc1VscGZlYyA/ICdyZWQrdWxwZmVjJyA6ICdyZWQnXG4gICAgICAgIH07XG4gICAgICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKGVuY1BhcmFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAoZW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMCAmJiBwcmltYXJ5U3NyYykge1xuICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKHtcbiAgICAgIHNzcmM6IHByaW1hcnlTc3JjXG4gICAgfSk7XG4gIH1cblxuICAvLyB3ZSBzdXBwb3J0IGJvdGggYj1BUyBhbmQgYj1USUFTIGJ1dCBpbnRlcnByZXQgQVMgYXMgVElBUy5cbiAgdmFyIGJhbmR3aWR0aCA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2I9Jyk7XG4gIGlmIChiYW5kd2lkdGgubGVuZ3RoKSB7XG4gICAgaWYgKGJhbmR3aWR0aFswXS5pbmRleE9mKCdiPVRJQVM6JykgPT09IDApIHtcbiAgICAgIGJhbmR3aWR0aCA9IHBhcnNlSW50KGJhbmR3aWR0aFswXS5zdWJzdHIoNyksIDEwKTtcbiAgICB9IGVsc2UgaWYgKGJhbmR3aWR0aFswXS5pbmRleE9mKCdiPUFTOicpID09PSAwKSB7XG4gICAgICBiYW5kd2lkdGggPSBwYXJzZUludChiYW5kd2lkdGhbMF0uc3Vic3RyKDUpLCAxMCk7XG4gICAgfVxuICAgIGVuY29kaW5nUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgcGFyYW1zLm1heEJpdHJhdGUgPSBiYW5kd2lkdGg7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGVuY29kaW5nUGFyYW1ldGVycztcbn07XG5cblNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIEZJWE1FOiBzZXNzLWlkIHNob3VsZCBiZSBhbiBOVFAgdGltZXN0YW1wLlxuICByZXR1cm4gJ3Y9MFxcclxcbicgK1xuICAgICAgJ289dGhpc2lzYWRhcHRlcm9ydGMgODE2OTYzOTkxNTY0Njk0MzEzNyAyIElOIElQNCAxMjcuMC4wLjFcXHJcXG4nICtcbiAgICAgICdzPS1cXHJcXG4nICtcbiAgICAgICd0PTAgMFxcclxcbic7XG59O1xuXG5TRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbiA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLCBjYXBzLCB0eXBlLCBzdHJlYW0pIHtcbiAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24odHJhbnNjZWl2ZXIua2luZCwgY2Fwcyk7XG5cbiAgLy8gTWFwIElDRSBwYXJhbWV0ZXJzICh1ZnJhZywgcHdkKSB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMoXG4gICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5nZXRMb2NhbFBhcmFtZXRlcnMoKSk7XG5cbiAgLy8gTWFwIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5nZXRMb2NhbFBhcmFtZXRlcnMoKSxcbiAgICAgIHR5cGUgPT09ICdvZmZlcicgPyAnYWN0cGFzcycgOiAnYWN0aXZlJyk7XG5cbiAgc2RwICs9ICdhPW1pZDonICsgdHJhbnNjZWl2ZXIubWlkICsgJ1xcclxcbic7XG5cbiAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlciAmJiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgIHNkcCArPSAnYT1zZW5kcmVjdlxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgc2RwICs9ICdhPXNlbmRvbmx5XFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgIHNkcCArPSAnYT1yZWN2b25seVxcclxcbic7XG4gIH0gZWxzZSB7XG4gICAgc2RwICs9ICdhPWluYWN0aXZlXFxyXFxuJztcbiAgfVxuXG4gIC8vIEZJWE1FOiBmb3IgUlRYIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlIFNTUkNzLiBOb3QgaW1wbGVtZW50ZWQgaW4gRWRnZSB5ZXQuXG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICB2YXIgbXNpZCA9ICdtc2lkOicgKyBzdHJlYW0uaWQgKyAnICcgK1xuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIudHJhY2suaWQgKyAnXFxyXFxuJztcbiAgICBzZHAgKz0gJ2E9JyArIG1zaWQ7XG4gICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAgICcgJyArIG1zaWQ7XG4gIH1cbiAgLy8gRklYTUU6IHRoaXMgc2hvdWxkIGJlIHdyaXR0ZW4gYnkgd3JpdGVSdHBEZXNjcmlwdGlvbi5cbiAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XG4gIHJldHVybiBzZHA7XG59O1xuXG4vLyBHZXRzIHRoZSBkaXJlY3Rpb24gZnJvbSB0aGUgbWVkaWFTZWN0aW9uIG9yIHRoZSBzZXNzaW9ucGFydC5cblNEUFV0aWxzLmdldERpcmVjdGlvbiA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgLy8gTG9vayBmb3Igc2VuZHJlY3YsIHNlbmRvbmx5LCByZWN2b25seSwgaW5hY3RpdmUsIGRlZmF1bHQgdG8gc2VuZHJlY3YuXG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAobGluZXNbaV0pIHtcbiAgICAgIGNhc2UgJ2E9c2VuZHJlY3YnOlxuICAgICAgY2FzZSAnYT1zZW5kb25seSc6XG4gICAgICBjYXNlICdhPXJlY3Zvbmx5JzpcbiAgICAgIGNhc2UgJ2E9aW5hY3RpdmUnOlxuICAgICAgICByZXR1cm4gbGluZXNbaV0uc3Vic3RyKDIpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gRklYTUU6IFdoYXQgc2hvdWxkIGhhcHBlbiBoZXJlP1xuICAgIH1cbiAgfVxuICBpZiAoc2Vzc2lvbnBhcnQpIHtcbiAgICByZXR1cm4gU0RQVXRpbHMuZ2V0RGlyZWN0aW9uKHNlc3Npb25wYXJ0KTtcbiAgfVxuICByZXR1cm4gJ3NlbmRyZWN2Jztcbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gU0RQVXRpbHM7XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNEUFV0aWxzID0gcmVxdWlyZSgnLi9lZGdlX3NkcCcpO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscycpLmxvZztcblxudmFyIGVkZ2VTaGltID0ge1xuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh3aW5kb3cuUlRDSWNlR2F0aGVyZXIpIHtcbiAgICAgIC8vIE9SVEMgZGVmaW5lcyBhbiBSVENJY2VDYW5kaWRhdGUgb2JqZWN0IGJ1dCBubyBjb25zdHJ1Y3Rvci5cbiAgICAgIC8vIE5vdCBpbXBsZW1lbnRlZCBpbiBFZGdlLlxuICAgICAgaWYgKCF3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlKSB7XG4gICAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBPUlRDIGRvZXMgbm90IGhhdmUgYSBzZXNzaW9uIGRlc2NyaXB0aW9uIG9iamVjdCBidXRcbiAgICAgIC8vIG90aGVyIGJyb3dzZXJzIChpLmUuIENocm9tZSkgdGhhdCB3aWxsIHN1cHBvcnQgYm90aCBQQyBhbmQgT1JUQ1xuICAgICAgLy8gaW4gdGhlIGZ1dHVyZSBtaWdodCBoYXZlIHRoaXMgZGVmaW5lZCBhbHJlYWR5LlxuICAgICAgaWYgKCF3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKSB7XG4gICAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBfZXZlbnRUYXJnZXQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBbJ2FkZEV2ZW50TGlzdGVuZXInLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdkaXNwYXRjaEV2ZW50J11cbiAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIHNlbGZbbWV0aG9kXSA9IF9ldmVudFRhcmdldFttZXRob2RdLmJpbmQoX2V2ZW50VGFyZ2V0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgdGhpcy5vbmljZWNhbmRpZGF0ZSA9IG51bGw7XG4gICAgICB0aGlzLm9uYWRkc3RyZWFtID0gbnVsbDtcbiAgICAgIHRoaXMub250cmFjayA9IG51bGw7XG4gICAgICB0aGlzLm9ucmVtb3Zlc3RyZWFtID0gbnVsbDtcbiAgICAgIHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZCA9IG51bGw7XG4gICAgICB0aGlzLm9uZGF0YWNoYW5uZWwgPSBudWxsO1xuXG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcyA9IFtdO1xuICAgICAgdGhpcy5yZW1vdGVTdHJlYW1zID0gW107XG4gICAgICB0aGlzLmdldExvY2FsU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5sb2NhbFN0cmVhbXM7XG4gICAgICB9O1xuICAgICAgdGhpcy5nZXRSZW1vdGVTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnJlbW90ZVN0cmVhbXM7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvY2FsRGVzY3JpcHRpb24gPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHNkcDogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbiA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgc2RwOiAnJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gJ3N0YWJsZSc7XG4gICAgICB0aGlzLmljZUNvbm5lY3Rpb25TdGF0ZSA9ICduZXcnO1xuICAgICAgdGhpcy5pY2VHYXRoZXJpbmdTdGF0ZSA9ICduZXcnO1xuXG4gICAgICB0aGlzLmljZU9wdGlvbnMgPSB7XG4gICAgICAgIGdhdGhlclBvbGljeTogJ2FsbCcsXG4gICAgICAgIGljZVNlcnZlcnM6IFtdXG4gICAgICB9O1xuICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgIHN3aXRjaCAoY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICAgIGNhc2UgJ2FsbCc6XG4gICAgICAgICAgY2FzZSAncmVsYXknOlxuICAgICAgICAgICAgdGhpcy5pY2VPcHRpb25zLmdhdGhlclBvbGljeSA9IGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3k7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW1vdmUgb25jZSBpbXBsZW1lbnRhdGlvbiBhbmQgc3BlYyBoYXZlIGFkZGVkIHRoaXMuXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpY2VUcmFuc3BvcnRQb2xpY3kgXCJub25lXCIgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBkb24ndCBzZXQgaWNlVHJhbnNwb3J0UG9saWN5LlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgLy8gRWRnZSBkb2VzIG5vdCBsaWtlXG4gICAgICAgIC8vIDEpIHN0dW46XG4gICAgICAgIC8vIDIpIHR1cm46IHRoYXQgZG9lcyBub3QgaGF2ZSBhbGwgb2YgdHVybjpob3N0OnBvcnQ/dHJhbnNwb3J0PXVkcFxuICAgICAgICB0aGlzLmljZU9wdGlvbnMuaWNlU2VydmVycyA9IGNvbmZpZy5pY2VTZXJ2ZXJzLmZpbHRlcihmdW5jdGlvbihzZXJ2ZXIpIHtcbiAgICAgICAgICBpZiAoc2VydmVyICYmIHNlcnZlci51cmxzKSB7XG4gICAgICAgICAgICBzZXJ2ZXIudXJscyA9IHNlcnZlci51cmxzLmZpbHRlcihmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVybC5pbmRleE9mKCd0dXJuOicpID09PSAwICYmXG4gICAgICAgICAgICAgICAgICB1cmwuaW5kZXhPZigndHJhbnNwb3J0PXVkcCcpICE9PSAtMTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgcmV0dXJuICEhc2VydmVyLnVybHM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBlci10cmFjayBpY2VHYXRoZXJzLCBpY2VUcmFuc3BvcnRzLCBkdGxzVHJhbnNwb3J0cywgcnRwU2VuZGVycywgLi4uXG4gICAgICAvLyBldmVyeXRoaW5nIHRoYXQgaXMgbmVlZGVkIHRvIGRlc2NyaWJlIGEgU0RQIG0tbGluZS5cbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzID0gW107XG5cbiAgICAgIC8vIHNpbmNlIHRoZSBpY2VHYXRoZXJlciBpcyBjdXJyZW50bHkgY3JlYXRlZCBpbiBjcmVhdGVPZmZlciBidXQgd2VcbiAgICAgIC8vIG11c3Qgbm90IGVtaXQgY2FuZGlkYXRlcyB1bnRpbCBhZnRlciBzZXRMb2NhbERlc2NyaXB0aW9uIHdlIGJ1ZmZlclxuICAgICAgLy8gdGhlbSBpbiB0aGlzIGFycmF5LlxuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAvLyBGSVhNRTogbmVlZCB0byBhcHBseSBpY2UgY2FuZGlkYXRlcyBpbiBhIHdheSB3aGljaCBpcyBhc3luYyBidXRcbiAgICAgIC8vIGluLW9yZGVyXG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZW5kID0gIWV2ZW50LmNhbmRpZGF0ZSB8fCBPYmplY3Qua2V5cyhldmVudC5jYW5kaWRhdGUpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgc2VjdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChzZWN0aW9uc1tqXS5pbmRleE9mKCdcXHJcXG5hPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHNlY3Rpb25zW2pdICs9ICdhPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZS5pbmRleE9mKCd0eXAgZW5kT2ZDYW5kaWRhdGVzJylcbiAgICAgICAgICAgID09PSAtMSkge1xuICAgICAgICAgIHNlY3Rpb25zW2V2ZW50LmNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICsgMV0gKz1cbiAgICAgICAgICAgICAgJ2E9JyArIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgKyAnXFxyXFxuJztcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwID0gc2VjdGlvbnMuam9pbignJyk7XG4gICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFldmVudC5jYW5kaWRhdGUgJiYgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIHZhciBjb21wbGV0ZSA9IHNlbGYudHJhbnNjZWl2ZXJzLmV2ZXJ5KGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAvLyBDbG9uZSBpcyBuZWNlc3NhcnkgZm9yIGxvY2FsIGRlbW9zIG1vc3RseSwgYXR0YWNoaW5nIGRpcmVjdGx5XG4gICAgICAvLyB0byB0d28gZGlmZmVyZW50IHNlbmRlcnMgZG9lcyBub3Qgd29yayAoYnVpbGQgMTA1NDcpLlxuICAgICAgdGhpcy5sb2NhbFN0cmVhbXMucHVzaChzdHJlYW0uY2xvbmUoKSk7XG4gICAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgdmFyIGlkeCA9IHRoaXMubG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKTtcbiAgICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgICB0aGlzLmxvY2FsU3RyZWFtcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgdGhpcy5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lcyB0aGUgaW50ZXJzZWN0aW9uIG9mIGxvY2FsIGFuZCByZW1vdGUgY2FwYWJpbGl0aWVzLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2dldENvbW1vbkNhcGFiaWxpdGllcyA9XG4gICAgICAgIGZ1bmN0aW9uKGxvY2FsQ2FwYWJpbGl0aWVzLCByZW1vdGVDYXBhYmlsaXRpZXMpIHtcbiAgICAgICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0ge1xuICAgICAgICAgICAgY29kZWNzOiBbXSxcbiAgICAgICAgICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxuICAgICAgICAgICAgZmVjTWVjaGFuaXNtczogW11cbiAgICAgICAgICB9O1xuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGxDb2RlYykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciByQ29kZWMgPSByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzW2ldO1xuICAgICAgICAgICAgICBpZiAobENvZGVjLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gckNvZGVjLm5hbWUudG9Mb3dlckNhc2UoKSAmJlxuICAgICAgICAgICAgICAgICAgbENvZGVjLmNsb2NrUmF0ZSA9PT0gckNvZGVjLmNsb2NrUmF0ZSAmJlxuICAgICAgICAgICAgICAgICAgbENvZGVjLm51bUNoYW5uZWxzID09PSByQ29kZWMubnVtQ2hhbm5lbHMpIHtcbiAgICAgICAgICAgICAgICAvLyBwdXNoIHJDb2RlYyBzbyB3ZSByZXBseSB3aXRoIG9mZmVyZXIgcGF5bG9hZCB0eXBlXG4gICAgICAgICAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmNvZGVjcy5wdXNoKHJDb2RlYyk7XG5cbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWxzbyBuZWVkIHRvIGRldGVybWluZSBpbnRlcnNlY3Rpb24gYmV0d2VlblxuICAgICAgICAgICAgICAgIC8vIC5ydGNwRmVlZGJhY2sgYW5kIC5wYXJhbWV0ZXJzXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obEhlYWRlckV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3RlQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgaSsrKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgckhlYWRlckV4dGVuc2lvbiA9IHJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgaWYgKGxIZWFkZXJFeHRlbnNpb24udXJpID09PSBySGVhZGVyRXh0ZW5zaW9uLnVyaSkge1xuICAgICAgICAgICAgICAgICAgICBjb21tb25DYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5wdXNoKHJIZWFkZXJFeHRlbnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gRklYTUU6IGZlY01lY2hhbmlzbXNcbiAgICAgICAgICByZXR1cm4gY29tbW9uQ2FwYWJpbGl0aWVzO1xuICAgICAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIElDRSBnYXRoZXJlciwgSUNFIHRyYW5zcG9ydCBhbmQgRFRMUyB0cmFuc3BvcnQuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMgPVxuICAgICAgICBmdW5jdGlvbihtaWQsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIGljZUdhdGhlcmVyID0gbmV3IFJUQ0ljZUdhdGhlcmVyKHNlbGYuaWNlT3B0aW9ucyk7XG4gICAgICAgICAgdmFyIGljZVRyYW5zcG9ydCA9IG5ldyBSVENJY2VUcmFuc3BvcnQoaWNlR2F0aGVyZXIpO1xuICAgICAgICAgIGljZUdhdGhlcmVyLm9ubG9jYWxjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJyk7XG4gICAgICAgICAgICBldmVudC5jYW5kaWRhdGUgPSB7c2RwTWlkOiBtaWQsIHNkcE1MaW5lSW5kZXg6IHNkcE1MaW5lSW5kZXh9O1xuXG4gICAgICAgICAgICB2YXIgY2FuZCA9IGV2dC5jYW5kaWRhdGU7XG4gICAgICAgICAgICB2YXIgZW5kID0gIWNhbmQgfHwgT2JqZWN0LmtleXMoY2FuZCkubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgLy8gRWRnZSBlbWl0cyBhbiBlbXB0eSBvYmplY3QgZm9yIFJUQ0ljZUNhbmRpZGF0ZUNvbXBsZXRl4oClXG4gICAgICAgICAgICBpZiAoZW5kKSB7XG4gICAgICAgICAgICAgIC8vIHBvbHlmaWxsIHNpbmNlIFJUQ0ljZUdhdGhlcmVyLnN0YXRlIGlzIG5vdCBpbXBsZW1lbnRlZCBpblxuICAgICAgICAgICAgICAvLyBFZGdlIDEwNTQ3IHlldC5cbiAgICAgICAgICAgICAgaWYgKGljZUdhdGhlcmVyLnN0YXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpY2VHYXRoZXJlci5zdGF0ZSA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gRW1pdCBhIGNhbmRpZGF0ZSB3aXRoIHR5cGUgZW5kT2ZDYW5kaWRhdGVzIHRvIG1ha2UgdGhlIHNhbXBsZXNcbiAgICAgICAgICAgICAgLy8gd29yay4gRWRnZSByZXF1aXJlcyBhZGRJY2VDYW5kaWRhdGUgd2l0aCB0aGlzIGVtcHR5IGNhbmRpZGF0ZVxuICAgICAgICAgICAgICAvLyB0byBzdGFydCBjaGVja2luZy4gVGhlIHJlYWwgc29sdXRpb24gaXMgdG8gc2lnbmFsXG4gICAgICAgICAgICAgIC8vIGVuZC1vZi1jYW5kaWRhdGVzIHRvIHRoZSBvdGhlciBzaWRlIHdoZW4gZ2V0dGluZyB0aGUgbnVsbFxuICAgICAgICAgICAgICAvLyBjYW5kaWRhdGUgYnV0IHNvbWUgYXBwcyAobGlrZSB0aGUgc2FtcGxlcykgZG9uJ3QgZG8gdGhhdC5cbiAgICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSA9XG4gICAgICAgICAgICAgICAgICAnY2FuZGlkYXRlOjEgMSB1ZHAgMSAwLjAuMC4wIDkgdHlwIGVuZE9mQ2FuZGlkYXRlcyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBSVENJY2VDYW5kaWRhdGUgZG9lc24ndCBoYXZlIGEgY29tcG9uZW50LCBuZWVkcyB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICBjYW5kLmNvbXBvbmVudCA9IGljZVRyYW5zcG9ydC5jb21wb25lbnQgPT09ICdSVENQJyA/IDIgOiAxO1xuICAgICAgICAgICAgICBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlID0gU0RQVXRpbHMud3JpdGVDYW5kaWRhdGUoY2FuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21wbGV0ZSA9IHNlbGYudHJhbnNjZWl2ZXJzLmV2ZXJ5KGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5pY2VHYXRoZXJlciAmJlxuICAgICAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEVtaXQgY2FuZGlkYXRlIGlmIGxvY2FsRGVzY3JpcHRpb24gaXMgc2V0LlxuICAgICAgICAgICAgLy8gQWxzbyBlbWl0cyBudWxsIGNhbmRpZGF0ZSB3aGVuIGFsbCBnYXRoZXJlcnMgYXJlIGNvbXBsZXRlLlxuICAgICAgICAgICAgc3dpdGNoIChzZWxmLmljZUdhdGhlcmluZ1N0YXRlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ25ldyc6XG4gICAgICAgICAgICAgICAgc2VsZi5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChlbmQgJiYgY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnZ2F0aGVyaW5nJzpcbiAgICAgICAgICAgICAgICBzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnY29tcGxldGUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnY29tcGxldGUnOlxuICAgICAgICAgICAgICAgIC8vIHNob3VsZCBub3QgaGFwcGVuLi4uIGN1cnJlbnRseSFcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDogLy8gbm8tb3AuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpY2VUcmFuc3BvcnQub25pY2VzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gbmV3IFJUQ0R0bHNUcmFuc3BvcnQoaWNlVHJhbnNwb3J0KTtcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0Lm9uZHRsc3N0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGR0bHNUcmFuc3BvcnQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb25lcnJvciBkb2VzIG5vdCBzZXQgc3RhdGUgdG8gZmFpbGVkIGJ5IGl0c2VsZi5cbiAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhdGUgPSAnZmFpbGVkJztcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWNlR2F0aGVyZXI6IGljZUdhdGhlcmVyLFxuICAgICAgICAgICAgaWNlVHJhbnNwb3J0OiBpY2VUcmFuc3BvcnQsXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiBkdGxzVHJhbnNwb3J0XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgIC8vIFN0YXJ0IHRoZSBSVFAgU2VuZGVyIGFuZCBSZWNlaXZlciBmb3IgYSB0cmFuc2NlaXZlci5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl90cmFuc2NlaXZlID0gZnVuY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICAgIHNlbmQsIHJlY3YpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB0aGlzLl9nZXRDb21tb25DYXBhYmlsaXRpZXModHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzKTtcbiAgICAgIGlmIChzZW5kICYmIHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgICAgICBwYXJhbXMuZW5jb2RpbmdzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgcGFyYW1zLnJ0Y3AgPSB7XG4gICAgICAgICAgY25hbWU6IFNEUFV0aWxzLmxvY2FsQ05hbWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc2VuZChwYXJhbXMpO1xuICAgICAgfVxuICAgICAgaWYgKHJlY3YgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiB0cmFuc2NlaXZlci5jbmFtZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbXMucnRjcC5zc3JjID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnJlY2VpdmUocGFyYW1zKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID1cbiAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydDtcbiAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xuICAgICAgICAgICAgLy8gRklYTUU6IFdoYXQgd2FzIHRoZSBwdXJwb3NlIG9mIHRoaXMgZW1wdHkgaWYgc3RhdGVtZW50P1xuICAgICAgICAgICAgLy8gaWYgKCF0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgICAgICAgIC8vIFZFUlkgbGltaXRlZCBzdXBwb3J0IGZvciBTRFAgbXVuZ2luZy4gTGltaXRlZCB0bzpcbiAgICAgICAgICAgICAgLy8gKiBjaGFuZ2luZyB0aGUgb3JkZXIgb2YgY29kZWNzXG4gICAgICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhcHMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9wZW5kaW5nT2ZmZXJbc2RwTUxpbmVJbmRleF0ubG9jYWxDYXBhYmlsaXRpZXMgPSBjYXBzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy50cmFuc2NlaXZlcnMgPSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJykge1xuICAgICAgICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYucmVtb3RlRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcbiAgICAgICAgICAgICAgdmFyIGljZVRyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgdmFyIHJlbW90ZUNhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWVkaWFTZWN0aW9uLnNwbGl0KCdcXG4nLCAxKVswXVxuICAgICAgICAgICAgICAgICAgLnNwbGl0KCcgJywgMilbMV0gPT09ICcwJztcblxuICAgICAgICAgICAgICBpZiAoIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUljZVBhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzKFxuICAgICAgICAgICAgICAgICAgICBtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc3RhcnQoaWNlR2F0aGVyZXIsIHJlbW90ZUljZVBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICdjb250cm9sbGVkJyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyhcbiAgICAgICAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJzZWN0aW9uIG9mIGNhcGFiaWxpdGllcy5cbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gc2VsZi5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIFJUQ1J0cFNlbmRlci4gVGhlIFJUQ1J0cFJlY2VpdmVyIGZvciB0aGlzXG4gICAgICAgICAgICAgICAgLy8gdHJhbnNjZWl2ZXIgaGFzIGFscmVhZHkgYmVlbiBzdGFydGVkIGluIHNldFJlbW90ZURlc2NyaXB0aW9uLlxuICAgICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jb2RlY3MubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmxvY2FsRGVzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgICAgICAgc2RwOiBkZXNjcmlwdGlvbi5zZHBcbiAgICAgICAgICB9O1xuICAgICAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnb2ZmZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnaGF2ZS1sb2NhbC1vZmZlcicpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdzdGFibGUnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICAgICAgICAgJ1wiJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgYSBzdWNjZXNzIGNhbGxiYWNrIHdhcyBwcm92aWRlZCwgZW1pdCBJQ0UgY2FuZGlkYXRlcyBhZnRlciBpdFxuICAgICAgICAgIC8vIGhhcyBiZWVuIGV4ZWN1dGVkLiBPdGhlcndpc2UsIGVtaXQgY2FsbGJhY2sgYWZ0ZXIgdGhlIFByb21pc2UgaXNcbiAgICAgICAgICAvLyByZXNvbHZlZC5cbiAgICAgICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICAgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYiA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICBpZiAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9PT0gJ25ldycpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBwID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgcC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFoYXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9PT0gJ25ldycpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gVXN1YWxseSBjYW5kaWRhdGVzIHdpbGwgYmUgZW1pdHRlZCBlYXJsaWVyLlxuICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzLmJpbmQoc2VsZiksIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uID1cbiAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIHN0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICAgIHZhciByZWNlaXZlckxpc3QgPSBbXTtcbiAgICAgICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKGRlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgdmFyIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgdmFyIG1saW5lID0gbGluZXNbMF0uc3Vic3RyKDIpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB2YXIga2luZCA9IG1saW5lWzBdO1xuICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWxpbmVbMV0gPT09ICcwJztcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBTRFBVdGlscy5nZXREaXJlY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2NlaXZlcjtcbiAgICAgICAgICAgIHZhciBpY2VHYXRoZXJlcjtcbiAgICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgIHZhciBydHBTZW5kZXI7XG4gICAgICAgICAgICB2YXIgcnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzO1xuXG4gICAgICAgICAgICB2YXIgdHJhY2s7XG4gICAgICAgICAgICAvLyBGSVhNRTogZW5zdXJlIHRoZSBtZWRpYVNlY3Rpb24gaGFzIHJ0Y3AtbXV4IHNldC5cbiAgICAgICAgICAgIHZhciByZW1vdGVDYXBhYmlsaXRpZXMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgaWYgKCFyZWplY3RlZCkge1xuICAgICAgICAgICAgICByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgICAgICAgU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcblxuICAgICAgICAgICAgdmFyIG1pZCA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9bWlkOicpO1xuICAgICAgICAgICAgaWYgKG1pZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgbWlkID0gbWlkWzBdLnN1YnN0cig2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1pZCA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY25hbWU7XG4gICAgICAgICAgICAvLyBHZXRzIHRoZSBmaXJzdCBTU1JDLiBOb3RlIHRoYXQgd2l0aCBSVFggdGhlcmUgbWlnaHQgYmUgbXVsdGlwbGVcbiAgICAgICAgICAgIC8vIFNTUkNzLlxuICAgICAgICAgICAgdmFyIHJlbW90ZVNzcmMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgICAgICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChyZW1vdGVTc3JjKSB7XG4gICAgICAgICAgICAgIGNuYW1lID0gcmVtb3RlU3NyYy52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgJ2E9ZW5kLW9mLWNhbmRpZGF0ZXMnKS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgdmFyIGNhbmRzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1jYW5kaWRhdGU6JylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbmQuY29tcG9uZW50ID09PSAnMSc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJyAmJiAhcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSBzZWxmLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyhtaWQsXG4gICAgICAgICAgICAgICAgICBzZHBNTGluZUluZGV4KTtcbiAgICAgICAgICAgICAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzID0gUlRDUnRwUmVjZWl2ZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xuICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gW3tcbiAgICAgICAgICAgICAgICBzc3JjOiAoMiAqIHNkcE1MaW5lSW5kZXggKyAyKSAqIDEwMDFcbiAgICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgICAgcnRwUmVjZWl2ZXIgPSBuZXcgUlRDUnRwUmVjZWl2ZXIodHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LCBraW5kKTtcblxuICAgICAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xuICAgICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyXSk7XG4gICAgICAgICAgICAgIC8vIEZJWE1FOiBub3QgY29ycmVjdCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBzdHJlYW1zIGJ1dCB0aGF0IGlzXG4gICAgICAgICAgICAgIC8vIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkIGluIHRoaXMgc2hpbS5cbiAgICAgICAgICAgICAgc3RyZWFtLmFkZFRyYWNrKHRyYWNrKTtcblxuICAgICAgICAgICAgICAvLyBGSVhNRTogbG9vayBhdCBkaXJlY3Rpb24uXG4gICAgICAgICAgICAgIGlmIChzZWxmLmxvY2FsU3RyZWFtcy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICBzZWxmLmxvY2FsU3RyZWFtc1swXS5nZXRUcmFja3MoKS5sZW5ndGggPj0gc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBhY3R1YWxseSBtb3JlIGNvbXBsaWNhdGVkLCBuZWVkcyB0byBtYXRjaCB0eXBlcyBldGNcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWx0cmFjayA9IHNlbGYubG9jYWxTdHJlYW1zWzBdXG4gICAgICAgICAgICAgICAgICAgIC5nZXRUcmFja3MoKVtzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgICBydHBTZW5kZXIgPSBuZXcgUlRDUnRwU2VuZGVyKGxvY2FsdHJhY2ssXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNwb3J0cy5pY2VHYXRoZXJlcixcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllczogbG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiByZW1vdGVDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgcnRwU2VuZGVyOiBydHBTZW5kZXIsXG4gICAgICAgICAgICAgICAgcnRwUmVjZWl2ZXI6IHJ0cFJlY2VpdmVyLFxuICAgICAgICAgICAgICAgIGtpbmQ6IGtpbmQsXG4gICAgICAgICAgICAgICAgbWlkOiBtaWQsXG4gICAgICAgICAgICAgICAgY25hbWU6IGNuYW1lLFxuICAgICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVyczogcmVjdkVuY29kaW5nUGFyYW1ldGVyc1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgUlRDUnRwUmVjZWl2ZXIgbm93LiBUaGUgUlRQU2VuZGVyIGlzIHN0YXJ0ZWQgaW5cbiAgICAgICAgICAgICAgLy8gc2V0TG9jYWxEZXNjcmlwdGlvbi5cbiAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZShzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSxcbiAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdhbnN3ZXInICYmICFyZWplY3RlZCkge1xuICAgICAgICAgICAgICB0cmFuc2NlaXZlciA9IHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICAgICAgICBpY2VHYXRoZXJlciA9IHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyO1xuICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgICBydHBTZW5kZXIgPSB0cmFuc2NlaXZlci5ydHBTZW5kZXI7XG4gICAgICAgICAgICAgIHJ0cFJlY2VpdmVyID0gdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzO1xuXG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVtb3RlQ2FwYWJpbGl0aWVzID1cbiAgICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uY25hbWUgPSBjbmFtZTtcblxuICAgICAgICAgICAgICBpZiAoaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc3RhcnQoaWNlR2F0aGVyZXIsIHJlbW90ZUljZVBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAnY29udHJvbGxpbmcnKTtcbiAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZSh0cmFuc2NlaXZlcixcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdyZWN2b25seScsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKTtcblxuICAgICAgICAgICAgICBpZiAocnRwUmVjZWl2ZXIgJiZcbiAgICAgICAgICAgICAgICAgIChkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKSkge1xuICAgICAgICAgICAgICAgIHRyYWNrID0gcnRwUmVjZWl2ZXIudHJhY2s7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlcl0pO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFjdHVhbGx5IHRoZSByZWNlaXZlciBzaG91bGQgYmUgY3JlYXRlZCBsYXRlci5cbiAgICAgICAgICAgICAgICBkZWxldGUgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgICAgICAgc2RwOiBkZXNjcmlwdGlvbi5zZHBcbiAgICAgICAgICB9O1xuICAgICAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnb2ZmZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnaGF2ZS1yZW1vdGUtb2ZmZXInKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbnN3ZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICtcbiAgICAgICAgICAgICAgICAgICdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyZWFtLmdldFRyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VsZi5yZW1vdGVTdHJlYW1zLnB1c2goc3RyZWFtKTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2FkZHN0cmVhbScpO1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW0gPSBzdHJlYW07XG4gICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgIGlmIChzZWxmLm9uYWRkc3RyZWFtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLm9uYWRkc3RyZWFtKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJhY2sgPSBpdGVtWzBdO1xuICAgICAgICAgICAgICAgIHZhciByZWNlaXZlciA9IGl0ZW1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHRyYWNrRXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQucmVjZWl2ZXIgPSByZWNlaXZlcjtcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnN0cmVhbXMgPSBbc3RyZWFtXTtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9udHJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9udHJhY2sodHJhY2tFdmVudCk7XG4gICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMV0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIC8qIG5vdCB5ZXRcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICAqL1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0KSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydCkge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBGSVhNRTogY2xlYW4gdXAgdHJhY2tzLCBsb2NhbCBzdHJlYW1zLCByZW1vdGUgc3RyZWFtcywgZXRjXG4gICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnY2xvc2VkJyk7XG4gICAgfTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2lnbmFsaW5nIHN0YXRlLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlID1cbiAgICAgICAgZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICAgICAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdzaWduYWxpbmdzdGF0ZWNoYW5nZScpO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgaWYgKHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBmaXJlIHRoZSBuZWdvdGlhdGlvbm5lZWRlZCBldmVudC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCA9XG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIEZpcmUgYXdheSAoZm9yIG5vdykuXG4gICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcpO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgaWYgKHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIGNvbm5lY3Rpb24gc3RhdGUuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlQ29ubmVjdGlvblN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgbmV3U3RhdGU7XG4gICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAnbmV3JzogMCxcbiAgICAgICAgY2xvc2VkOiAwLFxuICAgICAgICBjb25uZWN0aW5nOiAwLFxuICAgICAgICBjaGVja2luZzogMCxcbiAgICAgICAgY29ubmVjdGVkOiAwLFxuICAgICAgICBjb21wbGV0ZWQ6IDAsXG4gICAgICAgIGZhaWxlZDogMFxuICAgICAgfTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgc3RhdGVzW3RyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdGF0ZV0rKztcbiAgICAgICAgc3RhdGVzW3RyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgICB9KTtcbiAgICAgIC8vIElDRVRyYW5zcG9ydC5jb21wbGV0ZWQgYW5kIGNvbm5lY3RlZCBhcmUgdGhlIHNhbWUgZm9yIHRoaXMgcHVycG9zZS5cbiAgICAgIHN0YXRlcy5jb25uZWN0ZWQgKz0gc3RhdGVzLmNvbXBsZXRlZDtcblxuICAgICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICAgIGlmIChzdGF0ZXMuZmFpbGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdmYWlsZWQnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGluZyA+IDAgfHwgc3RhdGVzLmNoZWNraW5nID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdjb25uZWN0aW5nJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmRpc2Nvbm5lY3RlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnZGlzY29ubmVjdGVkJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLm5ldyA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmNvbm5lY3RlZCA+IDAgfHwgc3RhdGVzLmNvbXBsZXRlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld1N0YXRlICE9PSBzZWxmLmljZUNvbm5lY3Rpb25TdGF0ZSkge1xuICAgICAgICBzZWxmLmljZUNvbm5lY3Rpb25TdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBpZiAodGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlT2ZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGlmICh0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmVhdGVPZmZlciBjYWxsZWQgd2hpbGUgdGhlcmUgaXMgYSBwZW5kaW5nIG9mZmVyLicpO1xuICAgICAgfVxuICAgICAgdmFyIG9mZmVyT3B0aW9ucztcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb2ZmZXJPcHRpb25zID0gYXJndW1lbnRzWzBdO1xuICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIG9mZmVyT3B0aW9ucyA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRyYWNrcyA9IFtdO1xuICAgICAgdmFyIG51bUF1ZGlvVHJhY2tzID0gMDtcbiAgICAgIHZhciBudW1WaWRlb1RyYWNrcyA9IDA7XG4gICAgICAvLyBEZWZhdWx0IHRvIHNlbmRyZWN2LlxuICAgICAgaWYgKHRoaXMubG9jYWxTdHJlYW1zLmxlbmd0aCkge1xuICAgICAgICBudW1BdWRpb1RyYWNrcyA9IHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldEF1ZGlvVHJhY2tzKCkubGVuZ3RoO1xuICAgICAgICBudW1WaWRlb1RyYWNrcyA9IHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldFZpZGVvVHJhY2tzKCkubGVuZ3RoO1xuICAgICAgfVxuICAgICAgLy8gRGV0ZXJtaW5lIG51bWJlciBvZiBhdWRpbyBhbmQgdmlkZW8gdHJhY2tzIHdlIG5lZWQgdG8gc2VuZC9yZWN2LlxuICAgICAgaWYgKG9mZmVyT3B0aW9ucykge1xuICAgICAgICAvLyBSZWplY3QgQ2hyb21lIGxlZ2FjeSBjb25zdHJhaW50cy5cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5tYW5kYXRvcnkgfHwgb2ZmZXJPcHRpb25zLm9wdGlvbmFsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgJ0xlZ2FjeSBtYW5kYXRvcnkvb3B0aW9uYWwgY29uc3RyYWludHMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID0gb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW87XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcyA9IG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5sb2NhbFN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIFB1c2ggbG9jYWwgc3RyZWFtcy5cbiAgICAgICAgdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IHRyYWNrLmtpbmQsXG4gICAgICAgICAgICB0cmFjazogdHJhY2ssXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJhY2sua2luZCA9PT0gJ2F1ZGlvJyA/XG4gICAgICAgICAgICAgICAgbnVtQXVkaW9UcmFja3MgPiAwIDogbnVtVmlkZW9UcmFja3MgPiAwXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHRyYWNrLmtpbmQgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XG4gICAgICAgICAgfSBlbHNlIGlmICh0cmFjay5raW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgICBudW1WaWRlb1RyYWNrcy0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAvLyBDcmVhdGUgTS1saW5lcyBmb3IgcmVjdm9ubHkgc3RyZWFtcy5cbiAgICAgIHdoaWxlIChudW1BdWRpb1RyYWNrcyA+IDAgfHwgbnVtVmlkZW9UcmFja3MgPiAwKSB7XG4gICAgICAgIGlmIChudW1BdWRpb1RyYWNrcyA+IDApIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiAnYXVkaW8nLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcy0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1WaWRlb1RyYWNrcyA+IDApIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiAndmlkZW8nLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcy0tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSgpO1xuICAgICAgdmFyIHRyYW5zY2VpdmVycyA9IFtdO1xuICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24obWxpbmUsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgLy8gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhbiBpY2UgZ2F0aGVyZXIsIGljZSB0cmFuc3BvcnQsXG4gICAgICAgIC8vIGR0bHMgdHJhbnNwb3J0LCBwb3RlbnRpYWxseSBydHBzZW5kZXIgYW5kIHJ0cHJlY2VpdmVyLlxuICAgICAgICB2YXIgdHJhY2sgPSBtbGluZS50cmFjaztcbiAgICAgICAgdmFyIGtpbmQgPSBtbGluZS5raW5kO1xuICAgICAgICB2YXIgbWlkID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbiAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSBzZWxmLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyhtaWQsIHNkcE1MaW5lSW5kZXgpO1xuXG4gICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcyA9IFJUQ1J0cFNlbmRlci5nZXRDYXBhYmlsaXRpZXMoa2luZCk7XG4gICAgICAgIHZhciBydHBTZW5kZXI7XG4gICAgICAgIHZhciBydHBSZWNlaXZlcjtcblxuICAgICAgICAvLyBnZW5lcmF0ZSBhbiBzc3JjIG5vdywgdG8gYmUgdXNlZCBsYXRlciBpbiBydHBTZW5kZXIuc2VuZFxuICAgICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMSkgKiAxMDAxXG4gICAgICAgIH1dO1xuICAgICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgICBydHBTZW5kZXIgPSBuZXcgUlRDUnRwU2VuZGVyKHRyYWNrLCB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1saW5lLndhbnRSZWNlaXZlKSB7XG4gICAgICAgICAgcnRwUmVjZWl2ZXIgPSBuZXcgUlRDUnRwUmVjZWl2ZXIodHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LCBraW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNwb3J0cy5pY2VHYXRoZXJlcixcbiAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LFxuICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCxcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllczogbG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiBudWxsLFxuICAgICAgICAgIHJ0cFNlbmRlcjogcnRwU2VuZGVyLFxuICAgICAgICAgIHJ0cFJlY2VpdmVyOiBydHBSZWNlaXZlcixcbiAgICAgICAgICBraW5kOiBraW5kLFxuICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMsXG4gICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVyczogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSB0cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgIHNkcCArPSBTRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbih0cmFuc2NlaXZlcixcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLCAnb2ZmZXInLCBzZWxmLmxvY2FsU3RyZWFtc1swXSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fcGVuZGluZ09mZmVyID0gdHJhbnNjZWl2ZXJzO1xuICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJ29mZmVyJyxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMF0sIDAsIGRlc2MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlKCk7XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0gc2VsZi5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICAgIHNkcCArPSBTRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbih0cmFuc2NlaXZlciwgY29tbW9uQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgJ2Fuc3dlcicsIHNlbGYubG9jYWxTdHJlYW1zWzBdKTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnYW5zd2VyJyxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMF0sIDAsIGRlc2MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgIHZhciBtTGluZUluZGV4ID0gY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXg7XG4gICAgICBpZiAoY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMudHJhbnNjZWl2ZXJzW2ldLm1pZCA9PT0gY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICAgICAgbUxpbmVJbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciB0cmFuc2NlaXZlciA9IHRoaXMudHJhbnNjZWl2ZXJzW21MaW5lSW5kZXhdO1xuICAgICAgaWYgKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHZhciBjYW5kID0gT2JqZWN0LmtleXMoY2FuZGlkYXRlLmNhbmRpZGF0ZSkubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kaWRhdGUuY2FuZGlkYXRlKSA6IHt9O1xuICAgICAgICAvLyBJZ25vcmUgQ2hyb21lJ3MgaW52YWxpZCBjYW5kaWRhdGVzIHNpbmNlIEVkZ2UgZG9lcyBub3QgbGlrZSB0aGVtLlxuICAgICAgICBpZiAoY2FuZC5wcm90b2NvbCA9PT0gJ3RjcCcgJiYgY2FuZC5wb3J0ID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIElnbm9yZSBSVENQIGNhbmRpZGF0ZXMsIHdlIGFzc3VtZSBSVENQLU1VWC5cbiAgICAgICAgaWYgKGNhbmQuY29tcG9uZW50ICE9PSAnMScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQSBkaXJ0eSBoYWNrIHRvIG1ha2Ugc2FtcGxlcyB3b3JrLlxuICAgICAgICBpZiAoY2FuZC50eXBlID09PSAnZW5kT2ZDYW5kaWRhdGVzJykge1xuICAgICAgICAgIGNhbmQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuYWRkUmVtb3RlQ2FuZGlkYXRlKGNhbmQpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnModGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICBzZWN0aW9uc1ttTGluZUluZGV4ICsgMV0gKz0gKGNhbmQudHlwZSA/IGNhbmRpZGF0ZS5jYW5kaWRhdGUudHJpbSgpXG4gICAgICAgICAgICA6ICdhPWVuZC1vZi1jYW5kaWRhdGVzJykgKyAnXFxyXFxuJztcbiAgICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHAgPSBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgIH1cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1sxXSwgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICBbJ3J0cFNlbmRlcicsICdydHBSZWNlaXZlcicsICdpY2VHYXRoZXJlcicsICdpY2VUcmFuc3BvcnQnLFxuICAgICAgICAgICAgJ2R0bHNUcmFuc3BvcnQnXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgICBpZiAodHJhbnNjZWl2ZXJbbWV0aG9kXSkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2godHJhbnNjZWl2ZXJbbWV0aG9kXS5nZXRTdGF0cygpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHZhciBjYiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICBhcmd1bWVudHNbMV07XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICByZXMuZm9yRWFjaChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICByZXN1bHRzW2lkXSA9IHJlc3VsdFtpZF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNiLCAwLCByZXN1bHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIC8vIEF0dGFjaCBhIG1lZGlhIHN0cmVhbSB0byBhbiBlbGVtZW50LlxuICBhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24oZWxlbWVudCwgc3RyZWFtKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgZWxlbWVudC5zcmNPYmplY3QgPSBzdHJlYW07XG4gIH0sXG5cbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24odG8sIGZyb20pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCByZWF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIHRvLnNyY09iamVjdCA9IGZyb20uc3JjT2JqZWN0O1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBlZGdlU2hpbS5hdHRhY2hNZWRpYVN0cmVhbSxcbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZWRnZVNoaW0ucmVhdHRhY2hNZWRpYVN0cmVhbVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzJykubG9nO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGZpcmVmb3hTaGltID0ge1xuICBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJiAhKCdvbnRyYWNrJyBpblxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdvbnRyYWNrJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9vbnRyYWNrO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEZpcmVmb3ggaGFzIHN1cHBvcnRlZCBtb3pTcmNPYmplY3Qgc2luY2UgRkYyMiwgdW5wcmVmaXhlZCBpbiA0Mi5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudCAmJlxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUsICdzcmNPYmplY3QnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1velNyY09iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGlzLm1velNyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKSB7XG4gICAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgICAgICAvLyAudXJscyBpcyBub3Qgc3VwcG9ydGVkIGluIEZGIDwgMzguXG4gICAgICAgICAgLy8gY3JlYXRlIFJUQ0ljZVNlcnZlcnMgd2l0aCBhIHNpbmdsZSB1cmwuXG4gICAgICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgICAgIHZhciBuZXdJY2VTZXJ2ZXJzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBjQ29uZmlnLmljZVNlcnZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHNlcnZlciA9IHBjQ29uZmlnLmljZVNlcnZlcnNbaV07XG4gICAgICAgICAgICAgIGlmIChzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybHMnKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2VydmVyLnVybHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBuZXdTZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmVyLnVybHNbal1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBpZiAoc2VydmVyLnVybHNbal0uaW5kZXhPZigndHVybicpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1NlcnZlci51c2VybmFtZSA9IHNlcnZlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLmNyZWRlbnRpYWwgPSBzZXJ2ZXIuY3JlZGVudGlhbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChuZXdTZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gocGNDb25maWcuaWNlU2VydmVyc1tpXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBjQ29uZmlnLmljZVNlcnZlcnMgPSBuZXdJY2VTZXJ2ZXJzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IG1velJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gbW96UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgICAgaWYgKG1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBtb3pSVENTZXNzaW9uRGVzY3JpcHRpb247XG4gICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gbW96UlRDSWNlQ2FuZGlkYXRlO1xuICAgIH1cblxuICAgIC8vIHNoaW0gYXdheSBuZWVkIGZvciBvYnNvbGV0ZSBSVENJY2VDYW5kaWRhdGUvUlRDU2Vzc2lvbkRlc2NyaXB0aW9uLlxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpP1xuICAgICAgICAgICAgICAgIFJUQ0ljZUNhbmRpZGF0ZSA6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbikoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgfSxcblxuICBzaGltR2V0VXNlck1lZGlhOiBmdW5jdGlvbigpIHtcbiAgICAvLyBnZXRVc2VyTWVkaWEgY29uc3RyYWludHMgc2hpbS5cbiAgICB2YXIgZ2V0VXNlck1lZGlhXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICAgIHZhciBjb25zdHJhaW50c1RvRkYzN18gPSBmdW5jdGlvbihjKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5yZXF1aXJlKSB7XG4gICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcXVpcmUgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVxdWlyZScgfHwga2V5ID09PSAnYWR2YW5jZWQnIHx8XG4gICAgICAgICAgICAgIGtleSA9PT0gJ21lZGlhU291cmNlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgciA9IGNba2V5XSA9ICh0eXBlb2YgY1trZXldID09PSAnb2JqZWN0JykgP1xuICAgICAgICAgICAgICBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICAgICAgaWYgKHIubWluICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgci5tYXggIT09IHVuZGVmaW5lZCB8fCByLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcXVpcmUucHVzaChrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgIHIuIG1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNba2V5XSA9IHIuZXhhY3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgci5leGFjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYy5hZHZhbmNlZCA9IGMuYWR2YW5jZWQgfHwgW107XG4gICAgICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgb2Nba2V5XSA9IHttaW46IHIuaWRlYWwsIG1heDogci5pZGVhbH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvY1trZXldID0gci5pZGVhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMuYWR2YW5jZWQucHVzaChvYyk7XG4gICAgICAgICAgICBkZWxldGUgci5pZGVhbDtcbiAgICAgICAgICAgIGlmICghT2JqZWN0LmtleXMocikubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRlbGV0ZSBjW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlcXVpcmUubGVuZ3RoKSB7XG4gICAgICAgICAgYy5yZXF1aXJlID0gcmVxdWlyZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICAgIH07XG4gICAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgICAgbG9nZ2luZygnc3BlYzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2luZygnZmYzNzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYShjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKTtcbiAgICB9O1xuXG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGdldFVzZXJNZWRpYV87XG5cbiAgICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFNoaW0gZm9yIG1lZGlhRGV2aWNlcyBvbiBvbGRlciB2ZXJzaW9ucy5cbiAgICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH0sXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9XG4gICAgICB9O1xuICAgIH1cbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPVxuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHZhciBpbmZvcyA9IFtcbiAgICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXG4gICAgICAgICAgICAgIHtraW5kOiAndmlkZW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQxKSB7XG4gICAgICAvLyBXb3JrIGFyb3VuZCBodHRwOi8vYnVnemlsLmxhLzExNjk2NjVcbiAgICAgIHZhciBvcmdFbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMuYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gb3JnRW51bWVyYXRlRGV2aWNlcygpLnRoZW4odW5kZWZpbmVkLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQXR0YWNoIGEgbWVkaWEgc3RyZWFtIHRvIGFuIGVsZW1lbnQuXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbihlbGVtZW50LCBzdHJlYW0pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCBhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICBlbGVtZW50LnNyY09iamVjdCA9IHN0cmVhbTtcbiAgfSxcblxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbih0bywgZnJvbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIHJlYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgdG8uc3JjT2JqZWN0ID0gZnJvbS5zcmNPYmplY3Q7XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltT25UcmFjazogZmlyZWZveFNoaW0uc2hpbU9uVHJhY2ssXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZpcmVmb3hTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpLFxuICBhdHRhY2hNZWRpYVN0cmVhbTogZmlyZWZveFNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZpcmVmb3hTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIC8vIGdldFVzZXJNZWRpYSBjb25zdHJhaW50cyBzaGltLlxuICB2YXIgZ2V0VXNlck1lZGlhXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICB2YXIgY29uc3RyYWludHNUb0ZGMzdfID0gZnVuY3Rpb24oYykge1xuICAgICAgaWYgKHR5cGVvZiBjICE9PSAnb2JqZWN0JyB8fCBjLnJlcXVpcmUpIHtcbiAgICAgICAgcmV0dXJuIGM7XG4gICAgICB9XG4gICAgICB2YXIgcmVxdWlyZSA9IFtdO1xuICAgICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSBjW2tleV0gPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID9cbiAgICAgICAgICAgIGNba2V5XSA6IHtpZGVhbDogY1trZXldfTtcbiAgICAgICAgaWYgKHIubWluICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIHIubWF4ICE9PSB1bmRlZmluZWQgfHwgci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmVxdWlyZS5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHIuIG1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY1trZXldID0gci5leGFjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIHIuZXhhY3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGMuYWR2YW5jZWQgPSBjLmFkdmFuY2VkIHx8IFtdO1xuICAgICAgICAgIHZhciBvYyA9IHt9O1xuICAgICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIG9jW2tleV0gPSB7bWluOiByLmlkZWFsLCBtYXg6IHIuaWRlYWx9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvY1trZXldID0gci5pZGVhbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYy5hZHZhbmNlZC5wdXNoKG9jKTtcbiAgICAgICAgICBkZWxldGUgci5pZGVhbDtcbiAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHIpLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVsZXRlIGNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHJlcXVpcmUubGVuZ3RoKSB7XG4gICAgICAgIGMucmVxdWlyZSA9IHJlcXVpcmU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYztcbiAgICB9O1xuICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgIGxvZ2dpbmcoJ3NwZWM6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgaWYgKGNvbnN0cmFpbnRzLmF1ZGlvKSB7XG4gICAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdmZjM3OiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH07XG5cbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGdldFVzZXJNZWRpYV87XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYShjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaGltIGZvciBtZWRpYURldmljZXMgb24gb2xkZXIgdmVyc2lvbnMuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH1cbiAgICB9O1xuICB9XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGluZm9zID0gW1xuICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXG4gICAgICAgICAgICB7a2luZDogJ3ZpZGVvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfVxuICAgICAgICAgIF07XG4gICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQxKSB7XG4gICAgLy8gV29yayBhcm91bmQgaHR0cDovL2J1Z3ppbC5sYS8xMTY5NjY1XG4gICAgdmFyIG9yZ0VudW1lcmF0ZURldmljZXMgPVxuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMuYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBvcmdFbnVtZXJhdGVEZXZpY2VzKCkudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgc2FmYXJpU2hpbSA9IHtcbiAgLy8gVE9ETzogRHJBbGV4LCBzaG91bGQgYmUgaGVyZSwgZG91YmxlIGNoZWNrIGFnYWluc3QgTGF5b3V0VGVzdHNcbiAgLy8gc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIC8vIFRPRE86IERyQWxleFxuICAvLyBhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24oZWxlbWVudCwgc3RyZWFtKSB7IH0sXG4gIC8vIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHRvLCBmcm9tKSB7IH0sXG5cbiAgLy8gVE9ETzogb25jZSB0aGUgYmFjay1lbmQgZm9yIHRoZSBtYWMgcG9ydCBpcyBkb25lLCBhZGQuXG4gIC8vIFRPRE86IGNoZWNrIGZvciB3ZWJraXRHVEsrXG4gIC8vIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7IH0sXG5cbiAgc2hpbUdldFVzZXJNZWRpYTogZnVuY3Rpb24oKSB7XG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWE7XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltR2V0VXNlck1lZGlhOiBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWFcbiAgLy8gVE9ET1xuICAvLyBzaGltT25UcmFjazogc2FmYXJpU2hpbS5zaGltT25UcmFjayxcbiAgLy8gc2hpbVBlZXJDb25uZWN0aW9uOiBzYWZhcmlTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgLy8gYXR0YWNoTWVkaWFTdHJlYW06IHNhZmFyaVNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIC8vIHJlYXR0YWNoTWVkaWFTdHJlYW06IHNhZmFyaVNoaW0ucmVhdHRhY2hNZWRpYVN0cmVhbVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nRGlzYWJsZWRfID0gZmFsc2U7XG5cbi8vIFV0aWxpdHkgbWV0aG9kcy5cbnZhciB1dGlscyA9IHtcbiAgZGlzYWJsZUxvZzogZnVuY3Rpb24oYm9vbCkge1xuICAgIGlmICh0eXBlb2YgYm9vbCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcmd1bWVudCB0eXBlOiAnICsgdHlwZW9mIGJvb2wgK1xuICAgICAgICAgICcuIFBsZWFzZSB1c2UgYSBib29sZWFuLicpO1xuICAgIH1cbiAgICBsb2dEaXNhYmxlZF8gPSBib29sO1xuICAgIHJldHVybiAoYm9vbCkgPyAnYWRhcHRlci5qcyBsb2dnaW5nIGRpc2FibGVkJyA6XG4gICAgICAgICdhZGFwdGVyLmpzIGxvZ2dpbmcgZW5hYmxlZCc7XG4gIH0sXG5cbiAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChsb2dEaXNhYmxlZF8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgYnJvd3NlciB2ZXJzaW9uIG91dCBvZiB0aGUgcHJvdmlkZWQgdXNlciBhZ2VudCBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7IXN0cmluZ30gdWFzdHJpbmcgdXNlckFnZW50IHN0cmluZy5cbiAgICogQHBhcmFtIHshc3RyaW5nfSBleHByIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIGFzIG1hdGNoIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0geyFudW1iZXJ9IHBvcyBwb3NpdGlvbiBpbiB0aGUgdmVyc2lvbiBzdHJpbmcgdG8gYmUgcmV0dXJuZWQuXG4gICAqIEByZXR1cm4geyFudW1iZXJ9IGJyb3dzZXIgdmVyc2lvbi5cbiAgICovXG4gIGV4dHJhY3RWZXJzaW9uOiBmdW5jdGlvbih1YXN0cmluZywgZXhwciwgcG9zKSB7XG4gICAgdmFyIG1hdGNoID0gdWFzdHJpbmcubWF0Y2goZXhwcik7XG4gICAgcmV0dXJuIG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+PSBwb3MgJiYgcGFyc2VJbnQobWF0Y2hbcG9zXSwgMTApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBCcm93c2VyIGRldGVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHJlc3VsdCBjb250YWluaW5nIGJyb3dzZXIsIHZlcnNpb24gYW5kIG1pblZlcnNpb25cbiAgICogICAgIHByb3BlcnRpZXMuXG4gICAqL1xuICBkZXRlY3RCcm93c2VyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBSZXR1cm5lZCByZXN1bHQgb2JqZWN0LlxuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICByZXN1bHQuYnJvd3NlciA9IG51bGw7XG4gICAgcmVzdWx0LnZlcnNpb24gPSBudWxsO1xuICAgIHJlc3VsdC5taW5WZXJzaW9uID0gbnVsbDtcblxuICAgIC8vIEZhaWwgZWFybHkgaWYgaXQncyBub3QgYSBicm93c2VyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8ICF3aW5kb3cubmF2aWdhdG9yKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdOb3QgYSBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3guXG4gICAgaWYgKG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2ZpcmVmb3gnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0ZpcmVmb3hcXC8oWzAtOV0rKVxcLi8sIDEpO1xuICAgICAgcmVzdWx0Lm1pblZlcnNpb24gPSAzMTtcblxuICAgIC8vIGFsbCB3ZWJraXQtYmFzZWQgYnJvd3NlcnNcbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEpIHtcbiAgICAgIC8vIENocm9tZSwgQ2hyb21pdW0sIFdlYnZpZXcsIE9wZXJhLCBhbGwgdXNlIHRoZSBjaHJvbWUgc2hpbSBmb3Igbm93XG4gICAgICBpZiAod2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIHJlc3VsdC5icm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9DaHJvbShlfGl1bSlcXC8oWzAtOV0rKVxcLi8sIDIpO1xuICAgICAgICByZXN1bHQubWluVmVyc2lvbiA9IDM4O1xuXG4gICAgICAvLyBTYWZhcmkgb3IgdW5rbm93biB3ZWJraXQtYmFzZWRcbiAgICAgIC8vIGZvciB0aGUgdGltZSBiZWluZyBTYWZhcmkgaGFzIHN1cHBvcnQgZm9yIE1lZGlhU3RyZWFtcyBidXQgbm90IHdlYlJUQ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2FmYXJpIFVBIHN1YnN0cmluZ3Mgb2YgaW50ZXJlc3QgZm9yIHJlZmVyZW5jZTpcbiAgICAgICAgLy8gLSB3ZWJraXQgdmVyc2lvbjogICAgICAgICAgIEFwcGxlV2ViS2l0LzYwMi4xLjI1IChhbHNvIHVzZWQgaW4gT3AsQ3IpXG4gICAgICAgIC8vIC0gc2FmYXJpIFVJIHZlcnNpb246ICAgICAgICBWZXJzaW9uLzkuMC4zICh1bmlxdWUgdG8gU2FmYXJpKVxuICAgICAgICAvLyAtIHNhZmFyaSBVSSB3ZWJraXQgdmVyc2lvbjogU2FmYXJpLzYwMS40LjQgKGFsc28gdXNlZCBpbiBPcCxDcilcbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgdGhlIHdlYmtpdCB2ZXJzaW9uIGFuZCBzYWZhcmkgVUkgd2Via2l0IHZlcnNpb25zIGFyZSBlcXVhbHMsXG4gICAgICAgIC8vIC4uLiB0aGlzIGlzIGEgc3RhYmxlIHZlcnNpb24uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIG9ubHkgdGhlIGludGVybmFsIHdlYmtpdCB2ZXJzaW9uIGlzIGltcG9ydGFudCB0b2RheSB0byBrbm93IGlmXG4gICAgICAgIC8vIG1lZGlhIHN0cmVhbXMgYXJlIHN1cHBvcnRlZFxuICAgICAgICAvL1xuICAgICAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVmVyc2lvblxcLyhcXGQrKS4oXFxkKykvKSkge1xuICAgICAgICAgIHJlc3VsdC5icm93c2VyID0gJ3NhZmFyaSc7XG4gICAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICAvQXBwbGVXZWJLaXRcXC8oWzAtOV0rKVxcLi8sIDEpO1xuICAgICAgICAgIHJlc3VsdC5taW5WZXJzaW9uID0gNjAyO1xuXG4gICAgICAgIC8vIHVua25vd24gd2Via2l0LWJhc2VkIGJyb3dzZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdVbnN1cHBvcnRlZCB3ZWJraXQtYmFzZWQgYnJvd3NlciAnICtcbiAgICAgICAgICAgICAgJ3dpdGggR1VNIHN1cHBvcnQgYnV0IG5vIFdlYlJUQyBzdXBwb3J0Lic7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgLy8gRWRnZS5cbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci5tZWRpYURldmljZXMgJiZcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRWRnZVxcLyhcXGQrKS4oXFxkKykkLykpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2VkZ2UnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0VkZ2VcXC8oXFxkKykuKFxcZCspJC8sIDIpO1xuICAgICAgcmVzdWx0Lm1pblZlcnNpb24gPSAxMDU0NztcblxuICAgIC8vIERlZmF1bHQgZmFsbHRocm91Z2g6IG5vdCBzdXBwb3J0ZWQuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIHN1cHBvcnRlZCBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIFdhcm4gaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gbWluVmVyc2lvbi5cbiAgICBpZiAocmVzdWx0LnZlcnNpb24gPCByZXN1bHQubWluVmVyc2lvbikge1xuICAgICAgdXRpbHMubG9nKCdCcm93c2VyOiAnICsgcmVzdWx0LmJyb3dzZXIgKyAnIFZlcnNpb246ICcgKyByZXN1bHQudmVyc2lvbiArXG4gICAgICAgICAgJyA8IG1pbmltdW0gc3VwcG9ydGVkIHZlcnNpb246ICcgKyByZXN1bHQubWluVmVyc2lvbiArXG4gICAgICAgICAgJ1xcbiBzb21lIHRoaW5ncyBtaWdodCBub3Qgd29yayEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuXG4vLyBFeHBvcnQuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9nOiB1dGlscy5sb2csXG4gIGRpc2FibGVMb2c6IHV0aWxzLmRpc2FibGVMb2csXG4gIGJyb3dzZXJEZXRhaWxzOiB1dGlscy5kZXRlY3RCcm93c2VyKCksXG4gIGV4dHJhY3RWZXJzaW9uOiB1dGlscy5leHRyYWN0VmVyc2lvblxufTtcbiIsInZhciBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKTtcbmxldCBVTklYU29ja2V0SGFuZGxlclxuaWYoIWlzQnJvd3Nlcikge1xuXHR2YXIgUSA9IHJlcXVpcmUoJ3EnKTtcblx0VU5JWFNvY2tldEhhbmRsZXIgPSByZXF1aXJlKCcuL1VOSVhTb2NrZXRIYW5kbGVyJylcbn1cbmVsc2UgeyB2YXIgUSA9IHdpbmRvdy5ROyB9XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gZmFsc2U7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBEaXlhTm9kZSgpe1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuXHR0aGlzLl91c2VyID0gbnVsbDtcblx0dGhpcy5fYXV0aGVudGljYXRlZCA9IG51bGw7XG5cdHRoaXMuX3Bhc3MgPSBudWxsO1xuXG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHR0aGlzLl9hZGRyID0gbnVsbDtcblx0dGhpcy5fc29ja2V0ID0gbnVsbDtcblx0dGhpcy5fbmV4dElkID0gMDtcblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcblx0dGhpcy5fcGVuZGluZ01lc3NhZ2VzID0gW107XG5cdHRoaXMuX3BlZXJzID0gW107XG5cdHRoaXMuX3JlY29ubmVjdFRpbWVvdXQgPSAxMDAwO1xuXHR0aGlzLl9jb25uZWN0VGltZW91dCA9IDUwMDA7XG59XG5pbmhlcml0cyhEaXlhTm9kZSwgRXZlbnRFbWl0dGVyKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vIFB1YmxpYyBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUudXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcblx0aWYodXNlcikgdGhpcy5fdXNlciA9IHVzZXI7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3VzZXI7XG59O1xuRGl5YU5vZGUucHJvdG90eXBlLmF1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbihhdXRoZW50aWNhdGVkKSB7XG5cdGlmKGF1dGhlbnRpY2F0ZWQgIT09IHVuZGVmaW5lZCkgdGhpcy5fYXV0aGVudGljYXRlZCA9IGF1dGhlbnRpY2F0ZWQ7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX2F1dGhlbnRpY2F0ZWQ7XG59O1xuRGl5YU5vZGUucHJvdG90eXBlLnBhc3MgPSBmdW5jdGlvbihwYXNzKSB7XG5cdGlmKHBhc3MgIT09IHVuZGVmaW5lZCkgdGhpcy5fcGFzcyA9IHBhc3M7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3Bhc3M7XG59O1xuRGl5YU5vZGUucHJvdG90eXBlLmFkZHIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2FkZHI7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUucGVlcnMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5fcGVlcnM7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2VsZiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fc2VsZjsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5zZXRTZWN1cmVkID0gZnVuY3Rpb24oYlNlY3VyZWQpIHsgdGhpcy5fc2VjdXJlZCA9IGJTZWN1cmVkICE9PSBmYWxzZTsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5zZXRXU29ja2V0ID0gZnVuY3Rpb24oV1NvY2tldCkge3RoaXMuX1dTb2NrZXQgPSBXU29ja2V0O31cblxuXG5cbi8qKiBAcmV0dXJuIHtQcm9taXNlPFN0cmluZz59IHRoZSBjb25uZWN0ZWQgcGVlciBuYW1lICovXG5EaXlhTm9kZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChhZGRyLCBXU29ja2V0KSB7XG5cdHRoaXMuYkRvbnRSZWNvbm5lY3QgPSBmYWxzZVxuXG5cdC8vIEhhbmRsZSBsb2NhbCBjbGllbnRzIG9uIFVOSVggc29ja2V0c1xuXHRpZiAoYWRkci5zdGFydHNXaXRoKCd1bml4Oi8vJykpIHtcblx0XHQvLyBJZiB3ZSd2ZSB0cnlpbmcgdG8gY29ubmVjdCB0byB0aGUgc2FtZSBhZGRyZXNzIHdlJ3JlIGFscmVhZHkgY29ubmVjdGVkIHRvXG5cdFx0aWYgKHRoaXMuX2FkZHIgPT09IGFkZHIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGBbU0RLL0RpeWFOb2RlXSBBZGRyZXNzIGlzIGlkZW50aWNhbCB0byBvdXIgYWRkcmVzcy4uLmApXG5cdFx0XHRpZiAodGhpcy5fc3RhdHVzID09PSAnb3BlbmVkJykge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgW1NESy9EaXlhTm9kZV0gLi4uIGFuZCB0aGUgY29ubmVjdGlvbiBpcyBzdGlsbCBvcGVuZW5lZCwgcmV0dXJuaW5nIGl0LmApXG5cdFx0XHRcdHJldHVybiBRKHRoaXMuc2VsZigpKVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5fY29ubmVjdGlvbkRlZmVycmVkICYmIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlICYmIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlLmlzUGVuZGluZygpKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBbU0RLL0RpeWFOb2RlXS4uLiBhbmQgdGhlIGNvbm5lY3Rpb24gaXMgcGVuZGluZywgc28gcmV0dXJuaW5nIHRoZSBwZW5kaW5nIGNvbm5lY3Rpb24uYClcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuY2xvc2UoKVxuXHRcdC50aGVuKCBfID0+IHtcblx0XHRcdHRoaXMuX2FkZHIgPSBhZGRyXG5cdFx0XHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgPSBRLmRlZmVyKClcblx0XHRcdExvZ2dlci5sb2coJ2QxOiBjb25uZWN0IHRvICcgKyB0aGlzLl9hZGRyKVxuXHRcdFx0bGV0IHNvY2sgPSBuZXcgVU5JWFNvY2tldEhhbmRsZXIodGhpcy5fYWRkci5zdWJzdHIoJ3VuaXg6Ly8nLmxlbmd0aCksIHRoaXMuX2Nvbm5lY3RUaW1lb3V0KVxuXG5cdFx0XHRpZiAoIXRoaXMuX3NvY2tldEhhbmRsZXIpXG5cdFx0XHRcdHRoaXMuX3NvY2tldEhhbmRsZXIgPSBzb2NrXG5cblx0XHRcdHRoaXMuX29ub3BlbmluZygpXG5cblx0XHRcdHNvY2sub24oJ29wZW4nLCBfID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnW1NESy9EaXlhTm9kZV0gU29ja2V0IHJlc3BvbmRlZCBidXQgYWxyZWFkeSBjb25uZWN0ZWQgdG8gYSBkaWZmZXJlbnQgb25lJylcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJ1xuXHRcdFx0XHR0aGlzLl9zZXR1cFBpbmdSZXNwb25zZSgpXG5cdFx0XHR9KVxuXG5cdFx0XHRzb2NrLm9uKCdjbG9zaW5nJywgXyA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLl9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR0aGlzLl9vbmNsb3NpbmcoKVxuXHRcdFx0fSlcblxuXHRcdFx0c29jay5vbignY2xvc2UnLCBfID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHRoaXMuX3NvY2tldEhhbmRsZXIgPSBudWxsXG5cdFx0XHRcdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnXG5cdFx0XHRcdHRoaXMuX3N0b3BQaW5nUmVzcG9uc2UoKVxuXHRcdFx0XHR0aGlzLl9vbmNsb3NlKClcblxuXHRcdFx0XHRpZiAodGhpcy5fY29ubmVjdGlvbkRlZmVycmVkKSB7XG5cdFx0XHRcdFx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKVxuXHRcdFx0XHRcdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGxcblx0XHRcdFx0fVxuXHRcdFx0fSlcblxuXHRcdFx0c29jay5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLl9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR0aGlzLl9vbmVycm9yKGVycm9yKVxuXHRcdFx0fSlcblxuXHRcdFx0c29jay5vbigndGltZW91dCcsIF8gPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5fc29ja2V0SGFuZGxlciAhPT0gc29jaylcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0dGhpcy5fc29ja2V0SGFuZGxlciA9IG51bGxcblx0XHRcdFx0dGhpcy5fc3RhdHVzID0gJ2Nsb3NlZCdcblx0XHRcdFx0aWYgKHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCkge1xuXHRcdFx0XHRcdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5yZWplY3QoXCJjbG9zZWRcIilcblx0XHRcdFx0XHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cblx0XHRcdHNvY2sub24oJ21lc3NhZ2UnLCB0aGlzLl9vbm1lc3NhZ2UuYmluZCh0aGlzKSlcblxuXHRcdFx0cmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlXG5cdFx0fSlcblx0fVxuXG5cdGlmIChXU29ja2V0ICE9PSB1bmRlZmluZWQpXG5cdFx0dGhpcy5fV1NvY2tldCA9IFdTb2NrZXRcblx0ZWxzZSBpZiAodGhpcy5fV1NvY2tldCA9PT0gdW5kZWZpbmVkKVxuXHRcdHRoaXMuX1dTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0XG5cblx0V1NvY2tldCA9IHRoaXMuX1dTb2NrZXRcblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYgKGFkZHIuc3RhcnRzV2l0aChcIndzOi8vXCIpICYmIHRoaXMuX3NlY3VyZWQpXG5cdFx0cmV0dXJuIFEucmVqZWN0KFwiUGxlYXNlIHVzZSBhIHNlY3VyZWQgY29ubmVjdGlvbiAoXCIgKyBhZGRyICsgXCIpXCIpXG5cblx0aWYgKGFkZHIuc3RhcnRzV2l0aChcIndzczovL1wiKSAmJiB0aGlzLl9zZWN1cmVkID09PSBmYWxzZSlcblx0XHRyZXR1cm4gUS5yZWplY3QoXCJQbGVhc2UgdXNlIGEgbm9uLXNlY3VyZWQgY29ubmVjdGlvbiAoXCIgKyBhZGRyICsgXCIpXCIpXG5cblx0aWYgKCFhZGRyLnN0YXJ0c1dpdGgoXCJ3czovL1wiKSAmJiAhYWRkci5zdGFydHNXaXRoKFwid3NzOi8vXCIpKSB7XG5cdFx0aWYgKHRoaXMuX3NlY3VyZWQpXG5cdFx0XHRhZGRyID0gXCJ3c3M6Ly9cIiArIGFkZHJcblx0XHRlbHNlXG5cdFx0XHRhZGRyID0gXCJ3czovL1wiICsgYWRkclxuXHR9XG5cblx0aWYgKHRoaXMuX2FkZHIgPT09IGFkZHIpIHtcblx0XHRpZiAodGhpcy5fc3RhdHVzID09PSAnb3BlbmVkJylcblx0XHRcdHJldHVybiBRKHRoaXMuc2VsZigpKVxuXHRcdGVsc2UgaWYgKHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSAmJiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZS5pc1BlbmRpbmcoKSlcblx0XHRcdHJldHVybiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZVxuXHR9XG5cblx0cmV0dXJuIHRoaXMuY2xvc2UoKVxuXHQudGhlbiggXyA9PiB7XG5cdFx0dGhpcy5fYWRkciA9IGFkZHJcblx0XHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgPSBRLmRlZmVyKClcblx0XHRMb2dnZXIubG9nKCdkMTogY29ubmVjdCB0byAnICsgdGhpcy5fYWRkcilcblx0XHR2YXIgc29jayA9IG5ldyBTb2NrZXRIYW5kbGVyKFdTb2NrZXQsIHRoaXMuX2FkZHIsIHRoaXMuX2Nvbm5lY3RUaW1lb3V0KVxuXG5cdFx0aWYgKCF0aGlzLl9zb2NrZXRIYW5kbGVyKVxuXHRcdFx0dGhpcy5fc29ja2V0SGFuZGxlciA9IHNvY2tcblxuXHRcdHRoaXMuX29ub3BlbmluZygpXG5cblx0XHRzb2NrLm9uKCdvcGVuJywgXyA9PiB7XG5cdFx0XHRpZiAodGhpcy5fc29ja2V0SGFuZGxlciAhPT0gc29jaykge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIltkMV0gV2Vic29ja2V0IHJlc3BvbmRlZCBidXQgYWxyZWFkeSBjb25uZWN0ZWQgdG8gYSBkaWZmZXJlbnQgb25lXCIpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0dGhpcy5fc29ja2V0SGFuZGxlciA9IHNvY2tcblx0XHRcdHRoaXMuX3N0YXR1cyA9ICdvcGVuZWQnXG5cdFx0XHR0aGlzLl9zZXR1cFBpbmdSZXNwb25zZSgpXG5cdFx0fSlcblxuXHRcdHNvY2sub24oJ2Nsb3NpbmcnLCBfID0+IHtcblx0XHRcdGlmICh0aGlzLl9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdHRoaXMuX29uY2xvc2luZygpXG5cdFx0fSlcblxuXHRcdHNvY2sub24oJ2Nsb3NlJywgXyA9PiB7XG5cdFx0XHRpZiAodGhpcy5fc29ja2V0SGFuZGxlciAhPT0gc29jaylcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR0aGlzLl9zb2NrZXRIYW5kbGVyID0gbnVsbFxuXHRcdFx0dGhpcy5fc3RhdHVzID0gJ2Nsb3NlZCdcblx0XHRcdHRoaXMuX3N0b3BQaW5nUmVzcG9uc2UoKVxuXHRcdFx0dGhpcy5fb25jbG9zZSgpXG5cblx0XHRcdGlmICh0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQpIHtcblx0XHRcdFx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKVxuXHRcdFx0XHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdHNvY2sub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0dGhpcy5fb25lcnJvcihlcnJvcilcblx0XHR9KVxuXG5cdFx0c29jay5vbigndGltZW91dCcsIF8gPT4ge1xuXHRcdFx0aWYgKHRoaXMuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0dGhpcy5fc29ja2V0SGFuZGxlciA9IG51bGxcblx0XHRcdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnXG5cdFx0XHRpZiAodGhpcy5fY29ubmVjdGlvbkRlZmVycmVkKSB7XG5cdFx0XHRcdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5yZWplY3QoXCJjbG9zZWRcIilcblx0XHRcdFx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbFxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHRzb2NrLm9uKCdtZXNzYWdlJywgdGhpcy5fb25tZXNzYWdlLmJpbmQodGhpcykpXG5cblx0XHRyZXR1cm4gdGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2Vcblx0fSlcbn1cblxuRGl5YU5vZGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5iRG9udFJlY29ubmVjdCA9IHRydWVcblx0cmV0dXJuIHRoaXMuY2xvc2UoKVxufVxuXG5EaXlhTm9kZS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLl9zdG9wUGluZ1Jlc3BvbnNlKCk7XG5cdGlmKHRoaXMuX3NvY2tldEhhbmRsZXIpIHJldHVybiB0aGlzLl9zb2NrZXRIYW5kbGVyLmNsb3NlKCk7XG5cdGVsc2UgcmV0dXJuIFEoKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiAodGhpcy5fc29ja2V0SGFuZGxlciAmJiB0aGlzLl9zb2NrZXRIYW5kbGVyLmlzQ29ubmVjdGVkKCkpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrLCB0aW1lb3V0LCBvcHRpb25zKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRpZighb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkUmVxdWVzdCc7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdGlmKCFwYXJhbXMuc2VydmljZSkge1xuXHRcdExvZ2dlci5lcnJvcignTm8gc2VydmljZSBkZWZpbmVkIGZvciByZXF1ZXN0ICEnKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2UocGFyYW1zLCBcIlJlcXVlc3RcIik7XG5cdHRoaXMuX2FwcGVuZE1lc3NhZ2UobWVzc2FnZSwgY2FsbGJhY2spO1xuXHRpZih0eXBlb2Ygb3B0aW9ucy5jYWxsYmFja19wYXJ0aWFsID09PSAnZnVuY3Rpb24nKSB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZS5pZF0uY2FsbGJhY2tfcGFydGlhbCA9IG9wdGlvbnMuY2FsbGJhY2tfcGFydGlhbDtcblx0bWVzc2FnZS5vcHRpb25zID0gb3B0aW9ucztcblxuXHRpZighaXNOYU4odGltZW91dCkgJiYgdGltZW91dCA+IDApe1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdHZhciBoYW5kbGVyID0gdGhhdC5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHRcdGlmKGhhbmRsZXIpIHRoYXQuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsICdUaW1lb3V0IGV4Y2VlZGVkICgnK3RpbWVvdXQrJ21zKSAhJyk7XG5cdFx0fSwgdGltZW91dCk7XG5cdH1cblxuXHRpZighdGhpcy5fc2VuZChtZXNzYWdlKSl7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3Qgc2VuZCByZXF1ZXN0ICEnKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrKXtcblx0aWYocGFyYW1zLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcblx0XHR2YXIgX3BhcmFtcyA9IHBhcmFtcy5zcGxpdChcIi5cIik7XG5cdFx0aWYoX3BhcmFtcy5sZW5ndGghPTIpIHRocm93ICdNYWxmb3JtZWRSZXF1ZXN0Jztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0aWYoIXBhcmFtcy5zZXJ2aWNlKXtcblx0XHRMb2dnZXIuZXJyb3IoJ05vIHNlcnZpY2UgZGVmaW5lZCBmb3Igc3Vic2NyaXB0aW9uICEnKTtcblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHR2YXIgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2UocGFyYW1zLCBcIlN1YnNjcmlwdGlvblwiKTtcblx0dGhpcy5fYXBwZW5kTWVzc2FnZShtZXNzYWdlLCBjYWxsYmFjayk7XG5cblx0aWYoIXRoaXMuX3NlbmQobWVzc2FnZSkpe1xuXHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0TG9nZ2VyLmVycm9yKCdDYW5ub3Qgc2VuZCBzdWJzY3JpcHRpb24gIScpO1xuXHRcdHJldHVybiAtMTtcblx0fVxuXG5cdHJldHVybiBtZXNzYWdlLmlkO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24oc3ViSWQpe1xuXHRpZih0aGlzLl9wZW5kaW5nTWVzc2FnZXNbc3ViSWRdICYmIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1tzdWJJZF0udHlwZSA9PT0gXCJTdWJzY3JpcHRpb25cIil7XG5cdFx0dmFyIHN1YnNjcmlwdGlvbiA9IHRoaXMuX3JlbW92ZU1lc3NhZ2Uoc3ViSWQpO1xuXG5cdFx0dmFyIG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKHtcblx0XHRcdHRhcmdldDogc3Vic2NyaXB0aW9uLnRhcmdldCxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c3ViSWQ6IHN1YklkXG5cdFx0XHR9XG5cdFx0fSwgXCJVbnN1YnNjcmliZVwiKTtcblxuXHRcdGlmKCF0aGlzLl9zZW5kKG1lc3NhZ2UpKXtcblx0XHRcdExvZ2dlci5lcnJvcignQ2Fubm90IHNlbmQgdW5zdWJzY3JpYmUgIScpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8gSW50ZXJuYWwgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fYXBwZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGNhbGxiYWNrKXtcblx0dGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdID0ge1xuXHRcdGNhbGxiYWNrOiBjYWxsYmFjayxcblx0XHR0eXBlOiBtZXNzYWdlLnR5cGUsXG5cdFx0dGFyZ2V0OiBtZXNzYWdlLnRhcmdldFxuXHR9O1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9yZW1vdmVNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZUlkKXtcblx0dmFyIGhhbmRsZXIgPSB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZUlkXTtcblx0aWYoaGFuZGxlcil7XG5cdFx0ZGVsZXRlIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlSWRdO1xuXHRcdHJldHVybiBoYW5kbGVyO1xuXHR9ZWxzZXtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9jbGVhck1lc3NhZ2VzID0gZnVuY3Rpb24oZXJyLCBkYXRhKXtcblx0Zm9yKHZhciBtZXNzYWdlSWQgaW4gdGhpcy5fcGVuZGluZ01lc3NhZ2VzKXtcblx0XHR2YXIgaGFuZGxlciA9IHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZUlkKTtcblx0XHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBlcnIsIGRhdGEpO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2NsZWFyUGVlcnMgPSBmdW5jdGlvbigpe1xuXHR3aGlsZSh0aGlzLl9wZWVycy5sZW5ndGgpIHRoaXMuZW1pdCgncGVlci1kaXNjb25uZWN0ZWQnLCB0aGlzLl9wZWVycy5wb3AoKSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2dldE1lc3NhZ2VIYW5kbGVyID0gZnVuY3Rpb24obWVzc2FnZUlkKXtcblx0dmFyIGhhbmRsZXIgPSB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZUlkXTtcblx0cmV0dXJuIGhhbmRsZXIgPyBoYW5kbGVyIDogbnVsbDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fbm90aWZ5TGlzdGVuZXIgPSBmdW5jdGlvbihoYW5kbGVyLCBlcnJvciwgZGF0YSl7XG5cdGlmKGhhbmRsZXIgJiYgdHlwZW9mIGhhbmRsZXIuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRlcnJvciA9IGVycm9yID8gZXJyb3IgOiBudWxsO1xuXHRcdGRhdGEgPSBkYXRhID8gZGF0YSA6IG51bGw7XG5cdFx0dHJ5IHtcblx0XHRcdGhhbmRsZXIuY2FsbGJhY2soZXJyb3IsIGRhdGEpO1xuXHRcdH0gY2F0Y2goZSkgeyBjb25zb2xlLmxvZygnW0Vycm9yIGluIFJlcXVlc3QgY2FsbGJhY2tdICcgKyBlLnN0YWNrID8gZS5zdGFjayA6IGUpO31cblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zZW5kID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcblx0cmV0dXJuIHRoaXMuX3NvY2tldEhhbmRsZXIgJiYgdGhpcy5fc29ja2V0SGFuZGxlci5zZW5kKG1lc3NhZ2UpXG59XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fc2V0dXBQaW5nUmVzcG9uc2UgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5fcGluZ1RpbWVvdXQgPSAxNTAwMDtcblx0dGhpcy5fbGFzdFBpbmcgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuXHRmdW5jdGlvbiBjaGVja1BpbmcoKXtcblx0XHR2YXIgY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdGlmKGN1clRpbWUgLSB0aGF0Ll9sYXN0UGluZyA+IHRoYXQuX3BpbmdUaW1lb3V0KXtcblx0XHRcdHRoYXQuX2ZvcmNlQ2xvc2UoKTtcblx0XHRcdExvZ2dlci5sb2coXCJkMTogIHRpbWVkIG91dCAhXCIpO1xuXHRcdH1lbHNle1xuXHRcdFx0TG9nZ2VyLmxvZyhcImQxOiBsYXN0IHBpbmcgb2tcIik7XG5cdFx0XHR0aGF0Ll9waW5nU2V0VGltZW91dElkID0gc2V0VGltZW91dChjaGVja1BpbmcsIE1hdGgucm91bmQodGhhdC5fcGluZ1RpbWVvdXQgLyAyLjEpKTtcblx0XHR9XG5cdH1cblxuXHRjaGVja1BpbmcoKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fc3RvcFBpbmdSZXNwb25zZSA9IGZ1bmN0aW9uKCl7XG5cdGNsZWFyVGltZW91dCh0aGlzLl9waW5nU2V0VGltZW91dElkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fZm9yY2VDbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuX3NvY2tldEhhbmRsZXIuY2xvc2UoKTtcblx0dGhpcy5fb25jbG9zZSgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIFNvY2tldCBldmVudCBoYW5kbGVycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25tZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdGlmKGlzTmFOKG1lc3NhZ2UuaWQpKSByZXR1cm4gdGhpcy5faGFuZGxlSW50ZXJuYWxNZXNzYWdlKG1lc3NhZ2UpO1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKG1lc3NhZ2UuaWQpO1xuXHRpZighaGFuZGxlcikgcmV0dXJuO1xuXHRzd2l0Y2goaGFuZGxlci50eXBlKXtcblx0XHRjYXNlIFwiUmVxdWVzdFwiOlxuXHRcdFx0dGhpcy5faGFuZGxlUmVxdWVzdChoYW5kbGVyLCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJTdWJzY3JpcHRpb25cIjpcblx0XHRcdHRoaXMuX2hhbmRsZVN1YnNjcmlwdGlvbihoYW5kbGVyLCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX29ub3BlbmluZyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmVtaXQoJ29wZW5pbmcnLCB0aGlzKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25lcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG5cdHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoZXJyb3IpKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25jbG9zaW5nID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZW1pdCgnY2xvc2luZycsIHRoaXMpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbmNsb3NlID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuX2NsZWFyTWVzc2FnZXMoJ1BlZXJEaXNjb25uZWN0ZWQnKTtcblx0dGhpcy5fY2xlYXJQZWVycygpO1xuXG5cdGlmKCF0aGlzLmJEb250UmVjb25uZWN0KSB7XG5cdFx0TG9nZ2VyLmxvZygnZDE6IGNvbm5lY3Rpb24gbG9zdCwgdHJ5IHJlY29ubmVjdGluZycpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdHRoYXQuY29ubmVjdCh0aGF0Ll9hZGRyLCB0aGF0Ll9XU29ja2V0KS5jYXRjaChmdW5jdGlvbihlcnIpe30pO1xuXHRcdH0sIHRoYXQuX3JlY29ubmVjdFRpbWVvdXQpO1xuXHR9XG5cdHRoaXMuZW1pdCgnY2xvc2UnLCB0aGlzLl9hZGRyKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLyBQcm90b2NvbCBldmVudCBoYW5kbGVycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVJbnRlcm5hbE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0c3dpdGNoKG1lc3NhZ2UudHlwZSl7XG5cdFx0Y2FzZSBcIlBlZXJDb25uZWN0ZWRcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVBlZXJDb25uZWN0ZWQobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiUGVlckRpc2Nvbm5lY3RlZFwiOlxuXHRcdFx0dGhpcy5faGFuZGxlUGVlckRpc2Nvbm5lY3RlZChtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJIYW5kc2hha2VcIjpcblx0XHRcdHRoaXMuX2hhbmRsZUhhbmRzaGFrZShtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJQaW5nXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVQaW5nKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGluZyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG5cdG1lc3NhZ2UudHlwZSA9IFwiUG9uZ1wiXG5cdHRoaXMuX2xhc3RQaW5nID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblx0dGhpcy5fc2VuZChtZXNzYWdlKVxufVxuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZUhhbmRzaGFrZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXG5cdGlmKG1lc3NhZ2UucGVlcnMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgbWVzc2FnZS5zZWxmICE9PSAnc3RyaW5nJyl7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTWlzc2luZyBhcmd1bWVudHMgZm9yIEhhbmRzaGFrZSBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblxuXHR0aGlzLl9zZWxmID0gbWVzc2FnZS5zZWxmO1xuXG5cdGZvcih2YXIgaT0wO2k8bWVzc2FnZS5wZWVycy5sZW5ndGg7IGkrKyl7XG5cdFx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJzW2ldKTtcblx0XHR0aGlzLmVtaXQoJ3BlZXItY29ubmVjdGVkJywgbWVzc2FnZS5wZWVyc1tpXSk7XG5cdH1cblxuXHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucmVzb2x2ZSh0aGlzLnNlbGYoKSk7XG5cdHRoaXMuZW1pdCgnb3BlbicsIHRoaXMuX2FkZHIpO1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckNvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckNvbm5lY3RlZCBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9BZGQgcGVlciB0byB0aGUgbGlzdCBvZiByZWFjaGFibGUgcGVlcnNcblx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJJZCk7XG5cblx0dGhpcy5lbWl0KCdwZWVyLWNvbm5lY3RlZCcsIG1lc3NhZ2UucGVlcklkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckRpc2Nvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckRpc2Nvbm5lY3RlZCBNZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9HbyB0aHJvdWdoIGFsbCBwZW5kaW5nIG1lc3NhZ2VzIGFuZCBub3RpZnkgdGhlIG9uZXMgdGhhdCBhcmUgdGFyZ2V0ZWRcblx0Ly9hdCB0aGUgZGlzY29ubmVjdGVkIHBlZXIgdGhhdCBpdCBkaXNjb25uZWN0ZWQgYW5kIHRoZXJlZm9yZSB0aGUgY29tbWFuZFxuXHQvL2Nhbm5vdCBiZSBmdWxmaWxsZWRcblx0Zm9yKHZhciBtZXNzYWdlSWQgaW4gdGhpcy5fcGVuZGluZ01lc3NhZ2VzKXtcblx0XHR2YXIgaGFuZGxlciA9IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKG1lc3NhZ2VJZCk7XG5cdFx0aWYoaGFuZGxlciAmJiBoYW5kbGVyLnRhcmdldCA9PT0gbWVzc2FnZS5wZWVySWQpIHtcblx0XHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZUlkKTtcblx0XHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsICdQZWVyRGlzY29ubmVjdGVkJywgbnVsbCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9SZW1vdmUgcGVlciBmcm9tIGxpc3Qgb2YgcmVhY2hhYmxlIHBlZXJzXG5cdGZvcih2YXIgaT10aGlzLl9wZWVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG5cdFx0aWYodGhpcy5fcGVlcnNbaV0gPT09IG1lc3NhZ2UucGVlcklkKXtcblx0XHRcdHRoaXMuX3BlZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRoaXMuZW1pdCgncGVlci1kaXNjb25uZWN0ZWQnLCBtZXNzYWdlLnBlZXJJZCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVJlcXVlc3QgPSBmdW5jdGlvbihoYW5kbGVyLCBtZXNzYWdlKXtcblx0aWYobWVzc2FnZS50eXBlID09PSAnUGFydGlhbEFuc3dlcicpIHtcblx0XHRpZih0eXBlb2YgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHZhciBlcnJvciA9IG1lc3NhZ2UuZXJyb3IgPyBtZXNzYWdlLmVycm9yIDogbnVsbDtcblx0XHRcdHZhciBkYXRhID0gbWVzc2FnZS5kYXRhID8gbWVzc2FnZS5kYXRhIDogbnVsbDtcblx0XHRcdHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsKGVycm9yLCBkYXRhKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEpO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKGhhbmRsZXIsIG1lc3NhZ2Upe1xuXHQvL3JlbW92ZSBzdWJzY3JpcHRpb24gaWYgaXQgd2FzIGNsb3NlZCBmcm9tIG5vZGVcblx0aWYobWVzc2FnZS5yZXN1bHQgPT09IFwiY2xvc2VkXCIpIHtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdG1lc3NhZ2UuZXJyb3IgPSAnU3Vic2NyaXB0aW9uQ2xvc2VkJztcblx0fVxuXHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEgPyBtZXNzYWdlLmRhdGEgOiBudWxsKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU29ja2V0SGFuZGxlciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBTb2NrZXRIYW5kbGVyKFdTb2NrZXQsIGFkZHIsIHRpbWVvdXQpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmFkZHIgPSBhZGRyO1xuXG5cdGlmKFdTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSBXU29ja2V0O1xuXHRlbHNlIGlmKCF0aGlzLl9XU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gd2luZG93LldlYlNvY2tldDtcblx0V1NvY2tldCA9IHRoaXMuX1dTb2NrZXQ7XG5cblx0dGhpcy5fc3RhdHVzID0gJ29wZW5pbmcnO1xuXG5cdHRyeSB7XG5cdFx0dGhpcy5fc29ja2V0ID0gYWRkci5pbmRleE9mKFwid3NzOi8vXCIpPT09MCA/IG5ldyBXU29ja2V0KGFkZHIsIHVuZGVmaW5lZCwge3JlamVjdFVuYXV0aG9yaXplZDpmYWxzZX0pIDogbmV3IFdTb2NrZXQoYWRkcik7XG5cblx0XHR0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2sgPSB0aGlzLl9vbm9wZW4uYmluZCh0aGlzKTtcblx0XHR0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrID0gdGhpcy5fb25jbG9zZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayA9IHRoaXMuX29ubWVzc2FnZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldEVycm9yQ2FsbGJhY2sgPSB0aGlzLl9vbmVycm9yLmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJyx0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fc29ja2V0RXJyb3JDYWxsYmFjayk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBlcnJvciA6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0dGhhdC5fc29ja2V0LmNsb3NlKCk7XG5cdFx0fSk7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgPT09ICdvcGVuZWQnKSByZXR1cm47XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgIT09ICdjbG9zZWQnKXtcblx0XHRcdFx0TG9nZ2VyLmxvZygnZDE6ICcgKyB0aGF0LmFkZHIgKyAnIHRpbWVkIG91dCB3aGlsZSBjb25uZWN0aW5nJyk7XG5cdFx0XHRcdHRoYXQuY2xvc2UoKTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lb3V0JywgdGhhdC5fc29ja2V0KTtcblx0XHRcdH1cblx0XHR9LCB0aW1lb3V0KTtcblxuXHR9IGNhdGNoKGUpIHtcblx0XHRMb2dnZXIuZXJyb3IoZS5zdGFjayk7XG5cdFx0dGhhdC5jbG9zZSgpO1xuXHRcdHRocm93IGU7XG5cdH1cbn07XG5pbmhlcml0cyhTb2NrZXRIYW5kbGVyLCBFdmVudEVtaXR0ZXIpO1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpIHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpO1xuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2luZyc7XG5cdHRoaXMuZW1pdCgnY2xvc2luZycsIHRoaXMuX3NvY2tldCk7XG5cdGlmKHRoaXMuX3NvY2tldCkgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG5cdHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdHRyeSB7XG5cdFx0dmFyIGRhdGEgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcblx0fSBjYXRjaChlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3Qgc2VyaWFsaXplIG1lc3NhZ2UnKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR0cnkge1xuXHRcdHRoaXMuX3NvY2tldC5zZW5kKGRhdGEpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlbmQgbWVzc2FnZScpO1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3NvY2tldC5yZWFkeVN0YXRlID09IHRoaXMuX1dTb2NrZXQuT1BFTiAmJiB0aGlzLl9zdGF0dXMgPT09ICdvcGVuZWQnO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuX29ub3BlbiA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5lbWl0KCdvcGVuJywgdGhpcy5fc29ja2V0KTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHR0aGlzLnVucmVnaXN0ZXJDYWxsYmFja3MoKTtcblx0dGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX3NvY2tldCk7XG5cdGlmKHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSkgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnJlc29sdmUoKTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihldnQpIHtcblx0dHJ5IHtcblx0XHR2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpO1xuXHRcdHRoaXMuZW1pdCgnbWVzc2FnZScsIG1lc3NhZ2UpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBjYW5ub3QgcGFyc2UgbWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0dGhyb3cgZXJyO1xuXHR9XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25lcnJvciA9IGZ1bmN0aW9uKGV2dCkge1xuXHR0aGlzLmVtaXQoJ2Vycm9yJywgZXZ0KTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLnVucmVnaXN0ZXJDYWxsYmFja3MgPSBmdW5jdGlvbigpIHtcblx0aWYodGhpcy5fc29ja2V0ICYmICh0eXBlb2YgdGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpKXtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgdGhpcy5fc29ja2V0Q2xvc2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLl9zb2NrZXRNZXNzYWdlQ2FsbGJhY2spO1xuXHR9IGVsc2UgaWYodGhpcy5fc29ja2V0ICYmICh0eXBlb2YgdGhpcy5fc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykpe1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2NyZWF0ZU1lc3NhZ2UgPSBmdW5jdGlvbihwYXJhbXMsIHR5cGUpe1xuXHRpZighcGFyYW1zIHx8ICF0eXBlIHx8ICh0eXBlICE9PSBcIlJlcXVlc3RcIiAmJiB0eXBlICE9PSBcIlN1YnNjcmlwdGlvblwiICYmIHR5cGUgIT09IFwiVW5zdWJzY3JpYmVcIikpe1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR0eXBlOiB0eXBlLFxuXHRcdGlkOiB0aGlzLl9nZW5lcmF0ZUlkKCksXG5cdFx0c2VydmljZTogcGFyYW1zLnNlcnZpY2UsXG5cdFx0dGFyZ2V0OiBwYXJhbXMudGFyZ2V0LFxuXHRcdGZ1bmM6IHBhcmFtcy5mdW5jLFxuXHRcdG9iajogcGFyYW1zLm9iaixcblx0XHRkYXRhOiBwYXJhbXMuZGF0YSxcblx0XHRidXM6IHBhcmFtcy5idXMsXG5cdH07XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2dlbmVyYXRlSWQgPSBmdW5jdGlvbigpe1xuXHR2YXIgaWQgPSB0aGlzLl9uZXh0SWQ7XG5cdHRoaXMuX25leHRJZCsrO1xuXHRyZXR1cm4gaWQ7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBEaXlhTm9kZTtcbiIsInZhciBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKTtcbmlmKCFpc0Jyb3dzZXIpIHsgdmFyIFEgPSByZXF1aXJlKCdxJyk7IH1cbmVsc2UgeyB2YXIgUSA9IHdpbmRvdy5ROyB9XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG52YXIgRGl5YU5vZGUgPSByZXF1aXJlKCcuL0RpeWFOb2RlJyk7XG5cbnZhciBJUF9SRUdFWCA9IC9eKDI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPylcXC4oMjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLigyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pXFwuKDI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPykkLztcblxuLy8vLy8vLy8vLy8vLy9cbi8vICBEMSBBUEkgIC8vXG4vLy8vLy8vLy8vLy8vL1xuXG5cblxuZnVuY3Rpb24gbmV3SW5zdGFuY2UgKCkge1xuXG5cdHZhciBjb25uZWN0aW9uID0gbmV3IERpeWFOb2RlKCk7XG5cblx0dmFyIGQxaW5zdCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuXHRcdHJldHVybiBuZXcgRGl5YVNlbGVjdG9yKHNlbGVjdG9yLCBjb25uZWN0aW9uKTtcblx0fVxuXG5cdGQxaW5zdC5EaXlhTm9kZSA9IERpeWFOb2RlO1xuXHRkMWluc3QuRGl5YVNlbGVjdG9yID0gRGl5YVNlbGVjdG9yO1xuXG5cdGQxaW5zdC5jb25uZWN0ID0gZnVuY3Rpb24oYWRkciwgV1NvY2tldCl7XG5cdFx0cmV0dXJuIGNvbm5lY3Rpb24uY29ubmVjdChhZGRyLCBXU29ja2V0KTtcblx0fTtcblxuXHRkMWluc3QuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGNvbm5lY3Rpb24uZGlzY29ubmVjdCgpO1xuXHR9O1xuXG5cdGQxaW5zdC5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uKCkge1x0cmV0dXJuIGNvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKTt9O1xuXHRkMWluc3QucGVlcnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24ucGVlcnMoKTt9O1xuXHRkMWluc3Quc2VsZiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5zZWxmKCk7IH07XG5cdGQxaW5zdC5hZGRyID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLmFkZHIoKTsgfTtcblx0ZDFpbnN0LnVzZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24udXNlcigpOyB9O1xuXHRkMWluc3QucGFzcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5wYXNzKCk7IH07XG5cdGQxaW5zdC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24uYXV0aGVudGljYXRlZCgpOyB9O1xuXG5cdGQxaW5zdC5wYXJzZVBlZXIgPSBmdW5jdGlvbihhZGRyU3RyKSB7XG5cdFx0dmFyIHBlZXIgPSB7fTtcblxuXHRcdC8vIDxub3RoaW5nPiAtPiB3c3M6Ly9sb2NhbGhvc3QvYXBpXG5cdFx0aWYoIWFkZHJTdHIgfHwgYWRkclN0ciA9PT0gXCJcIikge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9sb2NhbGhvc3QvYXBpXCI7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL2xvY2FsaG9zdC9uZXRcIjtcblx0XHR9XG5cdFx0Ly8gMTIzNCAtPiB3czovL2xvY2FsaG9zdDoxMjM0XG5cdFx0ZWxzZSBpZigvXlswLTldKiQvLnRlc3QoYWRkclN0cikpIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3M6Ly9sb2NhbGhvc3Q6XCIrYWRkclN0cjtcblx0XHR9XG5cdFx0Ly8gJ2xvY2FsaG9zdCcgYWxvbmUgLT4gVU5JWCBzb2NrZXQgL3Zhci9ydW4vZGl5YS9kaXlhLW5vZGUuc29ja1xuXHRcdGVsc2UgaWYgKGFkZHJTdHIgPT09ICdsb2NhbGhvc3QnKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSAndW5peDovLy92YXIvcnVuL2RpeWEvZGl5YS1ub2RlLnNvY2snXG5cdFx0fVxuXHRcdC8vIDEwLjQyLjAuMSAtPiB3c3M6Ly8xMC40Mi4wLjEvYXBpXG5cdFx0Ly8gICAgICAgICAgLT4gd3NzOi8vMTAuMjQuMC4xL25ldFxuXHRcdGVsc2UgaWYgKElQX1JFR0VYLnRlc3QoYWRkclN0cikpIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3NzOi8vXCIrYWRkclN0citcIi9hcGlcIjtcblx0XHRcdHBlZXIuYWRkck5ldCA9IFwid3NzOi8vXCIrYWRkclN0citcIi9uZXRcIjtcblx0XHR9XG5cdFx0Ly8gMTAuNDIuMC4xOjEyMzQgLT4gd3M6Ly8xMC40Mi4wLjE6MTIzNFxuXHQgICAgICAgXHRlbHNlIGlmIChJUF9SRUdFWC50ZXN0KGFkZHJTdHIuc3BsaXQoJzonKVswXSkgJiYgL15bMC05XSokLy50ZXN0KGFkZHJTdHIuc3BsaXQoJzonKVsxXSkpIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3M6Ly9cIithZGRyU3RyO1xuXHRcdH1cblx0XHQvLyB3c3M6Ly9zb21lYWRkcmVzcy5jb20vc3R1ZmYgLT4gd3NzOi8vc29tZWFkZHJlc3MuY29tL3N0dWZmXG5cdFx0Ly8gd3M6Ly9zb21lYWRkcmVzcy5jb20vc3R1ZmYgLT4gd3M6Ly9zb21lYWRkcmVzcy5jb20vc3R1ZmZcblx0XHRlbHNlIGlmIChhZGRyU3RyLmluZGV4T2YoXCJ3c3M6Ly9cIikgPT09IDAgfHwgYWRkclN0ci5pbmRleE9mKFwid3M6Ly9cIikgPT09IDApIHtcblx0XHRcdHBlZXIuYWRkciA9IGFkZHJTdHI7XG5cdFx0fVxuXHRcdC8vIHNvbWVkb21haW4vc29tZXNpdGUgLT4gXCJ3c3M6Ly9zb21lZG9tYWluL3NvbWVzaXRlL2FwaVxuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgLT4gXCJ3c3M6Ly9zb21lZG9tYWluL3NvbWVzaXRlL25ldFxuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgLT4gc29tZXNpdGVcblx0XHRlbHNlIGlmKGFkZHJTdHIuc3BsaXQoJy8nKS5sZW5ndGggPT09IDIpIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3NzOi8vXCIgKyBhZGRyU3RyICsgJy9hcGknO1xuXHRcdFx0cGVlci5hZGRyTmV0ID0gXCJ3c3M6Ly9cIiArIGFkZHJTdHIgKyAnL25ldCc7XG5cdFx0XHRwZWVyLm5hbWUgPSBhZGRyU3RyLnNwbGl0KCcvJylbMV07XG5cdFx0fVxuXHRcdC8vIHNvbWVkb21haW4vc29tZXNpdGUvYXBpIC0+IFwid3NzOi8vc29tZWRvbWFpbi9zb21lc2l0ZS9hcGlcIlxuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgIC0+IFwid3NzOi8vc29tZWRvbWFpbi9zb21lc2l0ZS9uZXRcIlxuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgICAgIC0+IHNvbWVzaXRlXG5cdFx0ZWxzZSBpZihhZGRyU3RyLnNwbGl0KCcvJykubGVuZ3RoID09PSAzICYmIGFkZHJTdHIuc3BsaXQoJy8nKVsyXSA9PT0gXCJhcGlcIikge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9cIithZGRyU3RyO1xuXHRcdFx0cGVlci5hZGRyTmV0ID0gXCJ3c3M6Ly9cIithZGRyU3RyLnN1YnN0cigwLCBhZGRyU3RyLmxlbmd0aCAtIDQpO1xuXHRcdFx0cGVlci5uYW1lID0gYWRkclN0ci5zcGxpdCgnLycpWzFdO1xuXHRcdH1cblx0XHQvLyBzb21lc2l0ZSAtPiBcIndzczovL3BhcnRuZXJpbmctY2xvdWQuY29tL3NvbWVzaXRlL2FwaVwiXG5cdFx0Ly8gICAgICAgICAgLT4gXCJ3c3M6Ly9wYXJ0bmVyaW5nLWNsb3VkLmNvbS9zb21lc2l0ZS9uZXRcIlxuXHRcdC8vICAgICAgICAgIC0+IHNvbWVzaXRlXG5cdFx0ZWxzZSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzczovL3BhcnRuZXJpbmctY2xvdWQuY29tL1wiK2FkZHJTdHIrXCIvYXBpXCI7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL3BhcnRuZXJpbmctY2xvdWQuY29tL1wiK2FkZHJTdHIrXCIvbmV0XCI7XG5cdFx0XHRwZWVyLm5hbWUgPSBhZGRyU3RyO1xuXHRcdH1cblxuXHRcdHJldHVybiBwZWVyO1xuXHR9O1xuXG5cblx0LyoqIFRyeSB0byBjb25uZWN0IHRvIHRoZSBnaXZlbiBzZXJ2ZXJzIGxpc3QgaW4gdGhlIGxpc3Qgb3JkZXIsIHVudGlsIGZpbmRpbmcgYW4gYXZhaWxhYmxlIG9uZSAqL1xuXHRkMWluc3QudHJ5Q29ubmVjdCA9IGZ1bmN0aW9uKHNlcnZlcnMsIFdTb2NrZXQpe1xuXHRcdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0XHRmdW5jdGlvbiB0YyhpKSB7XG5cdFx0XHRkMWluc3QuY29ubmVjdChzZXJ2ZXJzW2ldLCBXU29ja2V0KS50aGVuKGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShzZXJ2ZXJzW2ldKTtcblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRkMWluc3QuZGlzY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHRcdGlmKGk8c2VydmVycy5sZW5ndGgpIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7dGMoaSk7fSwgMTAwKTtcblx0XHRcdFx0XHRlbHNlIHJldHVybiBkZWZlcnJlZC5yZWplY3QoXCJUaW1lb3V0XCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0YygwKTtcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdGQxaW5zdC5jdXJyZW50U2VydmVyID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gY29ubmVjdGlvbi5fYWRkcjtcblx0fTtcblxuXHRkMWluc3Qub24gPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuXHRcdGNvbm5lY3Rpb24ub24oZXZlbnQsIGNhbGxiYWNrKTtcblx0XHRyZXR1cm4gZDFpbnN0O1xuXHR9O1xuXG5cdGQxaW5zdC5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjayl7XG5cdFx0Y29ubmVjdGlvbi5yZW1vdmVMaXN0ZW5lcihldmVudCwgY2FsbGJhY2spO1xuXHRcdHJldHVybiBkMWluc3Q7XG5cdH07XG5cblx0LyoqIFNob3J0aGFuZCBmdW5jdGlvbiB0byBjb25uZWN0IGFuZCBsb2dpbiB3aXRoIHRoZSBnaXZlbiAodXNlcixwYXNzd29yZCkgKi9cblx0ZDFpbnN0LmNvbm5lY3RBc1VzZXIgPSBmdW5jdGlvbihpcCwgdXNlciwgcGFzc3dvcmQsIFdTb2NrZXQpIHtcblx0XHRyZXR1cm4gZDFpbnN0LmNvbm5lY3QoaXAsIFdTb2NrZXQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiBkMWluc3QoXCIjc2VsZlwiKS5hdXRoKHVzZXIsIHBhc3N3b3JkKTtcblx0XHR9KTtcblx0fTtcblxuXHRkMWluc3QuZGVhdXRoZW50aWNhdGUgPSBmdW5jdGlvbigpeyBjb25uZWN0aW9uLmF1dGhlbnRpY2F0ZWQoZmFsc2UpOyBjb25uZWN0aW9uLnVzZXIobnVsbCk7IGNvbm5lY3Rpb24ucGFzcyhudWxsKTt9O1xuXHRkMWluc3Quc2V0U2VjdXJlZCA9IGZ1bmN0aW9uKGJTZWN1cmVkKSB7IGNvbm5lY3Rpb24uc2V0U2VjdXJlZChiU2VjdXJlZCk7IH07XG5cdGQxaW5zdC5pc1NlY3VyZWQgPSBmdW5jdGlvbigpIHtyZXR1cm4gY29ubmVjdGlvbi5fc2VjdXJlZDsgfVxuXHRkMWluc3Quc2V0V1NvY2tldCA9IGZ1bmN0aW9uKFdTb2NrZXQpIHsgY29ubmVjdGlvbi5zZXRXU29ja2V0KFdTb2NrZXQpOyB9XG5cblx0cmV0dXJuIGQxaW5zdDtcbn1cblxudmFyIGQxID0gbmV3SW5zdGFuY2UoKTtcbmQxLm5ld0luc3RhbmNlID0gbmV3SW5zdGFuY2U7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERpeWFTZWxlY3RvciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIERpeWFTZWxlY3RvcihzZWxlY3RvciwgY29ubmVjdGlvbil7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG5cdHRoaXMuX2Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuXHR0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLl9saXN0ZW5lckNvdW50ID0gMDtcblx0dGhpcy5fbGlzdGVuQ2FsbGJhY2sgPSBudWxsO1xuXHR0aGlzLl9jYWxsYmFja0F0dGFjaGVkID0gZmFsc2U7XG59XG5pbmhlcml0cyhEaXlhU2VsZWN0b3IsIEV2ZW50RW1pdHRlcik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBQdWJsaWMgQVBJIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnNlbGVjdCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fc2VsZWN0KCk7IH07XG5cblxuXG4vKipcbiAqIEFwcGx5IGNhbGxiYWNrIGNiIHRvIGVhY2ggc2VsZWN0ZWQgcGVlci4gUGVlcnMgYXJlIHNlbGVjdGVkXG4gKiBhY2NvcmRpbmcgdG8gdGhlIHJ1bGUgJ3NlbGVjdG9yJyBnaXZlbiB0byBjb25zdHJ1Y3Rvci4gU2VsZWN0b3IgY2FuXG4gKiBiZSBhIHBlZXJJZCwgYSByZWdFeCBmb3IgcGVlcklkcyBvZiBhbiBhcnJheSBvZiBwZWVySWRzLlxuICogQHBhcmFtcyBcdGNiXHRcdGNhbGxiYWNrIHRvIGJlIGFwcGxpZWRcbiAqIEByZXR1cm4gXHR0aGlzIFx0PERpeWFTZWxlY3Rvcj5cbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oY2Ipe1xuXHR2YXIgcGVlcnMgPSB0aGlzLl9zZWxlY3QoKTtcblx0Zm9yKHZhciBpPTA7IGk8cGVlcnMubGVuZ3RoOyBpKyspIGNiLmJpbmQodGhpcykocGVlcnNbaV0pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCByZXF1ZXN0IHRvIHNlbGVjdGVkIHBlZXJzICggc2VlIGVhY2goKSApIHRocm91Z2ggdGhlIGN1cnJlbnQgY29ubmVjdGlvbiAoRGl5YU5vZGUpLlxuICogQHBhcmFtIHtTdHJpbmcgfCBPYmplY3R9IHBhcmFtcyA6IGNhbiBiZSBzZXJ2aWNlLmZ1bmN0aW9uIG9yIHtzZXJ2aWNlOnNlcnZpY2UsIGZ1bmM6ZnVuY3Rpb24sIC4uLn1cbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgdGltZW91dCwgb3B0aW9ucyl7XG5cdGlmKCF0aGlzLl9jb25uZWN0aW9uKSByZXR1cm4gdGhpcztcblx0aWYoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblx0aWYocGFyYW1zLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcblx0XHR2YXIgX3BhcmFtcyA9IHBhcmFtcy5zcGxpdChcIi5cIik7XG5cdFx0aWYoX3BhcmFtcy5sZW5ndGghPTIpIHRocm93ICdNYWxmb3JtZWRSZXF1ZXN0Jztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0dmFyIG5iQW5zd2VycyA9IDA7XG5cdHZhciBuYkV4cGVjdGVkID0gdGhpcy5fc2VsZWN0KCkubGVuZ3RoO1xuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKHBlZXJJZCl7XG5cdFx0cGFyYW1zLnRhcmdldCA9IHBlZXJJZDtcblxuXHRcdHZhciBvcHRzID0ge307XG5cdFx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIG9wdHNbaV0gPSBvcHRpb25zW2ldO1xuXHRcdGlmKHR5cGVvZiBvcHRzLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIG9wdHMuY2FsbGJhY2tfcGFydGlhbCA9IGZ1bmN0aW9uKGVyciwgZGF0YSl7IG9wdGlvbnMuY2FsbGJhY2tfcGFydGlhbChwZWVySWQsIGVyciwgZGF0YSk7fVxuXG5cdFx0dGhpcy5fY29ubmVjdGlvbi5yZXF1ZXN0KHBhcmFtcywgZnVuY3Rpb24oZXJyLCBkYXRhKXtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpO1xuXHRcdFx0bmJBbnN3ZXJzKys7XG5cdFx0XHRpZihuYkFuc3dlcnMgPT0gbmJFeHBlY3RlZCAmJiBvcHRpb25zLmJOb3RpZnlXaGVuRmluaXNoZWQpIGNhbGxiYWNrKG51bGwsIGVyciwgXCIjI0VORCMjXCIpOyAvLyBUT0RPIDogRmluZCBhIGJldHRlciB3YXkgdG8gbm90aWZ5IHJlcXVlc3QgRU5EICEhXG5cdFx0fSwgdGltZW91dCwgb3B0cyk7XG5cdH0pO1xufTtcblxuXG4vLyBJTVBPUlRBTlQgISEhIEJ5IDMwLzExLzE1LCB0aGlzIG1ldGhvZCBkb2Vzbid0IHJldHVybiAndGhpcycgYW55bW9yZSwgYnV0IGEgU3Vic2NyaXB0aW9uIG9iamVjdCBpbnN0ZWFkXG4vKiBAcGFyYW0ge1N0cmluZyB8IE9iamVjdH0gcGFyYW1zIDogY2FuIGJlICdzZXJ2aWNlLmZ1bmN0aW9uJyBvciB7c2VydmljZTpzZXJ2aWNlLCBmdW5jOmZ1bmN0aW9uLCAuLi59ICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpe1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFN1YnNjcmlwdGlvbic7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdHJldHVybiBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpO1xufTtcblxuXG4vLyBJTVBPUlRBTlQgISEhIEJZIDMwLzExLzE1LCB0aGlzIG1ldGhvZCBkb2Vzbid0IHRha2Ugc3ViSWRzIGFzIGlucHV0IGFueW1vcmUuXG4vLyBQbGVhc2UgcHJvdmlkZSBhIHN1YnNjcmlwdGlvbiBpbnN0ZWFkICFcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24pe1xuXHRpZihBcnJheS5pc0FycmF5KHN1YnNjcmlwdGlvbikgfHwgIXN1YnNjcmlwdGlvbi5jbG9zZSkgcmV0dXJuIHRoaXMuX19vbGRfZGVwcmVjYXRlZF91bnN1YnNjcmliZShzdWJzY3JpcHRpb24pO1xuXHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG59O1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzd29yZCwgY2FsbGJhY2ssIHRpbWVvdXQpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXMpO1xuXG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdhdXRoJyxcblx0XHRmdW5jOiAnQXV0aGVudGljYXRlJyxcblx0XHRkYXRhOiB7XG5cdFx0XHR1c2VyOiB1c2VyLCAvLyBERVBSRUNBVEVELCBrZXB0IGZvciBub3cgZm9yIGJhY2t3YXJkIGNvbXBhdGlibGl0eSAod2lsbCBiZSBkcm9wcGVkKVxuXHRcdFx0dXNlcm5hbWU6IHVzZXIsIC8vIE5ldyBzeW50YXggc2luY2Ugc3dpdGNoaW5nIHRvIERCdXNcblx0XHRcdHBhc3N3b3JkOiBwYXNzd29yZFxuXHRcdH1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXG5cdFx0aWYoZXJyID09PSAnU2VydmljZU5vdEZvdW5kJyl7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHQvLyBkYXRhLmF1dGhlbnRpY2F0ZWQgaXMgREVQUkVDQVRFRCwga2VwdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuXHRcdGlmKCFlcnIgJiYgZGF0YSAmJiAoZGF0YSA9PT0gdHJ1ZSB8fCBkYXRhLmF1dGhlbnRpY2F0ZWQgPT09IHRydWUpKXtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24uYXV0aGVudGljYXRlZCh0cnVlKTtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24udXNlcih1c2VyKTtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24ucGFzcyhwYXNzd29yZCk7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlc29sdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhhdC5fY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKGZhbHNlKTtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdCgnQWNjZXNzRGVuaWVkJyk7XG5cdFx0fVxuXG5cdH0sIHRpbWVvdXQpO1xuXG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuXG5cbi8vIFByaXZhdGVzXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3NlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdG9yRnVuY3Rpb24pe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0aWYoIXRoaXMuX2Nvbm5lY3Rpb24pIHJldHVybiBbXTtcblx0cmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24ucGVlcnMoKS5maWx0ZXIoZnVuY3Rpb24ocGVlcklkKXtcblx0XHRyZXR1cm4gdGhhdC5fbWF0Y2godGhhdC5fc2VsZWN0b3IsIHBlZXJJZCk7XG5cdH0pO1xufTtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fbWF0Y2ggPSBmdW5jdGlvbihzZWxlY3Rvciwgc3RyKXtcblx0aWYoIXNlbGVjdG9yKSByZXR1cm4gZmFsc2U7XG5cdGlmKHNlbGVjdG9yID09PSBcIiNzZWxmXCIpIHsgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24gJiYgc3RyID09PSB0aGlzLl9jb25uZWN0aW9uLnNlbGYoKTsgfVxuXHRlbHNlIGlmKHNlbGVjdG9yLm5vdCkgcmV0dXJuICF0aGlzLl9tYXRjaChzZWxlY3Rvci5ub3QsIHN0cik7XG5cdGVsc2UgaWYoc2VsZWN0b3IuY29uc3RydWN0b3IubmFtZSA9PT0gJ1N0cmluZycpe1xuXHRcdHJldHVybiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKTtcblx0fSBlbHNlIGlmKHNlbGVjdG9yLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdSZWdFeHAnKXtcblx0XHRyZXR1cm4gbWF0Y2hSZWdFeHAoc2VsZWN0b3IsIHN0cik7XG5cdH0gZWxzZSBpZihBcnJheS5pc0FycmF5KHNlbGVjdG9yKSl7XG5cdFx0cmV0dXJuIG1hdGNoQXJyYXkoc2VsZWN0b3IsIHN0cik7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKXtcblx0cmV0dXJuIHNlbGVjdG9yID09PSBzdHI7XG59XG5cbmZ1bmN0aW9uIG1hdGNoUmVnRXhwKHNlbGVjdG9yLCBzdHIpe1xuXHRyZXR1cm4gc3RyLm1hdGNoKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hBcnJheShzZWxlY3Rvciwgc3RyKXtcblx0Zm9yKHZhciBpPTA7aTxzZWxlY3Rvci5sZW5ndGg7IGkrKyl7XG5cdFx0aWYoc2VsZWN0b3JbaV0gPT09IHN0cikgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG4vLyBPdmVycmlkZXMgRXZlbnRFbWl0dGVyJ3MgYmVoYXZpb3IgdG8gcHJveHkgYW5kIGZpbHRlciBldmVudHMgZnJvbSB0aGUgY29ubmVjdGlvblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fb24gPSBEaXlhU2VsZWN0b3IucHJvdG90eXBlLm9uO1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0XHRpZih0aGF0Ll9tYXRjaCh0aGF0Ll9zZWxlY3RvciwgcGVlcklkKSkgdGhhdC5lbWl0KHR5cGUsIHBlZXJJZCk7XG5cdH07XG5cdHRoaXMuX2Nvbm5lY3Rpb24ub24odHlwZSwgY2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyKTtcblx0dmFyIHJldCA9IHRoaXMuX29uKHR5cGUsIGNhbGxiYWNrKTtcblxuXHQvLyBIYW5kbGUgdGhlIHNwZWNpZmljIGNhc2Ugb2YgXCJwZWVyLWNvbm5lY3RlZFwiIGV2ZW50cywgaS5lLiwgbm90aWZ5IG9mIGFscmVhZHkgY29ubmVjdGVkIHBlZXJzXG5cdGlmKHR5cGUgPT09ICdwZWVyLWNvbm5lY3RlZCcgJiYgdGhpcy5fY29ubmVjdGlvbi5pc0Nvbm5lY3RlZCgpKSB7XG5cdFx0dmFyIHBlZXJzID0gdGhpcy5fY29ubmVjdGlvbi5wZWVycygpO1xuXHRcdGZvcih2YXIgaT0wO2k8cGVlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmKHRoaXMuX21hdGNoKHRoaXMuX3NlbGVjdG9yLCBwZWVyc1tpXSkpIGNhbGxiYWNrKHBlZXJzW2ldKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJldDtcbn07XG5cblxuLy8gT3ZlcnJpZGVzIEV2ZW50RW1pdHRlcidzIGJlaGF2aW9yIHRvIHByb3h5IGFuZCBmaWx0ZXIgZXZlbnRzIGZyb20gdGhlIGNvbm5lY3Rpb25cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3JlbW92ZUxpc3RlbmVyID0gRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaykge1xuXHRpZihjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpIHRoaXMuX2Nvbm5lY3Rpb24ucmVtb3ZlTGlzdGVuZXIodHlwZSwgY2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyKTtcblx0dGhpcy5fcmVtb3ZlTGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU1VCU0NSSVBUSU9OIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4vKipcbiogSGFuZGxlcyBhIHN1YnNjcmlwdGlvbiB0byBzb21lIERpeWFOb2RlIHNlcnZpY2UgZm9yIG11bHRpcGxlIG5vZGVzXG4qIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gc2VsZWN0b3JcbiovXG5mdW5jdGlvbiBTdWJzY3JpcHRpb24oc2VsZWN0b3IsIHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHRcdHRoaXMucGFyYW1zID0gcGFyYW1zO1xuXHRcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuc3ViSWRzID0gW107XG5cblx0XHR0aGlzLmRvU3Vic2NyaWJlID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdFx0XHR0aGF0LnN1Yklkcy5wdXNoKHRoYXQuX2FkZFN1YnNjcmlwdGlvbihwZWVySWQpKTtcblx0XHRcdHRoYXQuc3RhdGUgPSBcIm9wZW5cIjtcblx0XHR9O1xuXG5cdFx0aWYodGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5hdXRvKSB7XG5cdFx0XHR0aGlzLnNlbGVjdG9yLm9uKCdwZWVyLWNvbm5lY3RlZCcsIHRoaXMuZG9TdWJzY3JpYmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNlbGVjdG9yLmVhY2godGhpcy5kb1N1YnNjcmliZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG59O1xuXG5TdWJzY3JpcHRpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGZvcih2YXIgaSA9IDA7IGk8dGhpcy5zdWJJZHMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLnNlbGVjdG9yLl9jb25uZWN0aW9uLnVuc3Vic2NyaWJlKHRoaXMuc3ViSWRzW2ldKTtcblx0fVxuXHR0aGlzLnN1YklkcyA9IFtdO1xuXHR0aGlzLnNlbGVjdG9yLnJlbW92ZUxpc3RlbmVyKCdwZWVyLWNvbm5lY3RlZCcsIHRoaXMuZG9TdWJzY3JpYmUpO1xuXHR0aGlzLnN0YXRlID0gXCJjbG9zZWRcIjtcbn07XG5cblN1YnNjcmlwdGlvbi5wcm90b3R5cGUuX2FkZFN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBwYXJhbXMgPSB7fTtcblx0Zm9yKHZhciBrIGluIHRoaXMucGFyYW1zKSBwYXJhbXNba10gPSB0aGlzLnBhcmFtc1trXTtcblx0cGFyYW1zLnRhcmdldCA9IHBlZXJJZDtcblx0dmFyIHN1YklkID0gdGhpcy5zZWxlY3Rvci5fY29ubmVjdGlvbi5zdWJzY3JpYmUocGFyYW1zLCBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRcdHRoYXQuY2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpO1xuXHR9KTtcblx0aWYodGhpcy5vcHRpb25zICYmIEFycmF5LmlzQXJyYXkodGhpcy5vcHRpb25zLnN1YklkcykpXG5cdFx0dGhpcy5vcHRpb25zLnN1Yklkc1twZWVySWRdID0gc3ViSWQ7XG5cdHJldHVybiBzdWJJZDtcbn07XG5cblxuXG5cblxuLy8gTGVnYWN5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuLyoqIEBkZXByZWNhdGVkICAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbigpe307XG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX19vbGRfZGVwcmVjYXRlZF91bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1Yklkcykge1xuXHR0aGlzLmVhY2goZnVuY3Rpb24ocGVlcklkKXtcblx0XHR2YXIgc3ViSWQgPSBzdWJJZHNbcGVlcklkXTtcblx0XHRpZihzdWJJZCkgdGhpcy5fY29ubmVjdGlvbi51bnN1YnNjcmliZShzdWJJZCk7XG5cdH0pO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gZDE7XG4iLCIndXNlIHN0cmljdCc7XG5cbmxldCBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKVxuXG5pZiAoIWlzQnJvd3Nlcikge1xuXG5cdGNvbnN0IFEgICAgICAgICAgICA9IHJlcXVpcmUoJ3EnKVxuXHRjb25zdCBuZXQgICAgICAgICAgPSByZXF1aXJlICgnbmV0Jylcblx0Y29uc3QgSlNPTlNvY2tldCAgID0gcmVxdWlyZSAoJ2pzb24tc29ja2V0Jylcblx0Y29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSAoJ25vZGUtZXZlbnQtZW1pdHRlcicpXG5cblx0Y2xhc3MgVU5JWFNvY2tldEhhbmRsZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXHRcdGNvbnN0cnVjdG9yIChhZGRyLCBjb25uZWN0VGltZW91dCkge1xuXHRcdFx0c3VwZXIoKVxuXHRcdFx0dGhpcy5hZGRyID0gYWRkclxuXG5cdFx0XHR0aGlzLl9zb2NrZXQgPSBuZXcgSlNPTlNvY2tldChuZXcgbmV0LlNvY2tldCgpKVxuXHRcdFx0dGhpcy5fc29ja2V0LmNvbm5lY3QodGhpcy5hZGRyKVxuXG5cdFx0XHQvLyBTdG9yZSBjYWxsYmFjayBzbyB0aGF0IHdlIGNhbiB1bnJlZ2lzdGVyIHRoZW0gbGF0ZXJcblx0XHRcdHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayA9IHRoaXMuX29ub3Blbi5iaW5kKHRoaXMpXG5cdFx0XHR0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrID0gdGhpcy5fb25jbG9zZS5iaW5kKHRoaXMpXG5cdFx0XHR0aGlzLl9zb2NrZXRNZXNzYWdlQ2FsbGJhY2sgPSB0aGlzLl9vbm1lc3NhZ2UuYmluZCh0aGlzKVxuXHRcdFx0dGhpcy5fc29ja2V0RXJyb3JDYWxsYmFjayA9IHRoaXMuX29uZXJyb3IuYmluZCh0aGlzKVxuXG5cdFx0XHR0aGlzLl9zb2NrZXQub24oJ2Nvbm5lY3QnLCB0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2spXG5cdFx0XHR0aGlzLl9zb2NrZXQuX3NvY2tldC5vbignY2xvc2UnLHRoaXMuX3NvY2tldENsb3NlQ2FsbGJhY2spXG5cdFx0XHR0aGlzLl9zb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLl9zb2NrZXRNZXNzYWdlQ2FsbGJhY2spXG5cdFx0XHR0aGlzLl9zb2NrZXQuX3NvY2tldC5vbignZXJyb3InLCB0aGlzLl9zb2NrZXRFcnJvckNhbGxiYWNrKVxuXG5cdFx0XHQvLyBDcmVhdGUgdGltZW91dCB0byBhYm9yZCBjb25uZWN0aW9uZ1xuXHRcdFx0c2V0VGltZW91dChfID0+IHtcblx0XHRcdFx0Ly8gV2hlIG50aW1lIHRpbWVzIG91dCwgaWYgdGhlIHNvY2tldCBpcyBvcGVuZWQsIHNpbXBseSByZXR1cm5cblx0XHRcdFx0aWYgKHRoaXMuX3N0YXR1cyA9PT0gJ29wZW5lZCcpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdC8vIE90aGVyd2lzZSwgYWJvcmRcblx0XHRcdFx0aWYgKHRoaXMuX3N0YXR1cyAhPT0gJ2Nsb3NlZCcpe1xuXHRcdFx0XHRcdExvZ2dlci5sb2coJ2QxOiAnICsgdGhhdC5hZGRyICsgJyB0aW1lZCBvdXQgd2hpbGUgY29ubmVjdGluZycpXG5cdFx0XHRcdFx0dGhpcy5jbG9zZSgpXG5cdFx0XHRcdFx0dGhpcy5lbWl0KCd0aW1lb3V0JywgdGhpcy5fc29ja2V0KVxuXHRcdFx0XHR9XG5cdFx0XHR9LCBjb25uZWN0VGltZW91dClcblx0XHR9XG5cblx0XHRjbG9zZSAoKSB7XG5cdFx0XHRpZiAodGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkICYmIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2VcblxuXHRcdFx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpXG5cdFx0XHR0aGlzLl9zdGF0dXMgPSAnY2xvc2luZydcblxuXHRcdFx0dGhpcy5lbWl0KCdjbG9zaW5nJywgdGhpcy5fc29ja2V0KVxuXG5cdFx0XHRpZiAodGhpcy5fc29ja2V0KVxuXHRcdFx0XHR0aGlzLl9zb2NrZXQuZW5kKClcblxuXHRcdFx0cmV0dXJuIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2VuZCBhIEpTT04tZm9ybWF0dGVkIG1lc3NhZ2UgdGhyb3VnaCB0aGUgc29ja2V0XG5cdFx0ICogQHBhcmFtIHtKU09OfSBtc2cgVGhlIEpTT04gdG8gc2VuZCAoZG8gbm90IHN0cmluZ2lmeSBpdCwganNvbi1zb2NrZXQgd2lsbCBkbyBpdClcblx0XHQgKi9cblx0XHRzZW5kIChtc2cpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuX3NvY2tldC5zZW5kTWVzc2FnZShtc2cpXG5cdFx0XHR9IGNhdGNoKGVycil7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBzZW5kIG1lc3NhZ2U6ICcgKyBlcnIubWVzc2FnZSlcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fVxuXG5cdFx0aXNDb25uZWN0ZWQgKCkge1xuXHRcdFx0cmV0dXJuICF0aGlzLl9zb2NrZXQuaXNDbG9zZWQoKSAmJiB0aGlzLl9zdGF0dXMgPT09ICdvcGVuZWQnXG5cdFx0fVxuXG5cdFx0X29ub3BlbiAoKSB7XG5cdFx0XHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJ1xuXHRcdFx0dGhpcy5lbWl0KCdvcGVuJywgdGhpcy5fc29ja2V0KVxuXHRcdH1cblxuXHRcdF9vbmNsb3NlICgpIHtcblx0XHRcdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnXG5cdFx0XHR0aGlzLnVucmVnaXN0ZXJDYWxsYmFja3MoKVxuXHRcdFx0dGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX3NvY2tldClcblx0XHRcdGlmICh0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpXG5cdFx0XHRcdHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5yZXNvbHZlKClcblx0XHR9XG5cblx0XHRfb25tZXNzYWdlIChtc2cpIHtcblx0XHRcdC8vIFRoZSBtZXNzYWdlIGlzIGFscmVhZHkgYSBKU09OXG5cdFx0XHR0aGlzLmVtaXQoJ21lc3NhZ2UnLCBtc2cpXG5cdFx0fVxuXG5cdFx0X29uZXJyb3IgKGVycikge1xuXHRcdFx0dGhpcy5lbWl0KCdlcnJvcicsIGVycilcblx0XHR9XG5cblx0XHR1bnJlZ2lzdGVyQ2FsbGJhY2tzICgpIHtcblx0XHRcdGlmICh0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29wZW4nLCB0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2spXG5cdFx0XHRcdHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbG9zZScsIHRoaXMuX3NvY2tldENsb3NlQ2FsbGJhY2spXG5cdFx0XHRcdHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5fc29ja2V0TWVzc2FnZUNhbGxiYWNrKVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlQWxsTGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSkge1xuXHRcdFx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlQWxsTGlzdGVuZXJzKClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cyA9IFVOSVhTb2NrZXRIYW5kbGVyXG59XG4iLCJ2YXIgZDEgPSByZXF1aXJlKCcuL0RpeWFTZWxlY3Rvci5qcycpO1xuXG5yZXF1aXJlKCcuL3NlcnZpY2VzL3J0Yy9ydGMuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvaWVxL2llcS5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9wZWVyQXV0aC9QZWVyQXV0aC5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9tZXNoTmV0d29yay9NZXNoTmV0d29yay5qcycpO1xucmVxdWlyZSgnLi91dGlscy9lbmNvZGluZy9lbmNvZGluZy5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9zdGF0dXMvc3RhdHVzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZDE7XG4iLCIvKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuLyoqXG4gICBUb2RvIDpcbiAgIGNoZWNrIGVyciBmb3IgZWFjaCBkYXRhXG4gICBpbXByb3ZlIEFQSSA6IGdldERhdGEoc2Vuc29yTmFtZSwgZGF0YUNvbmZpZylcbiAgIHJldHVybiBhZGFwdGVkIHZlY3RvciBmb3IgZGlzcGxheSB3aXRoIEQzIHRvIHJlZHVjZSBjb2RlIGluIElITSA/XG4gICB1cGRhdGVEYXRhKHNlbnNvck5hbWUsIGRhdGFDb25maWcpXG4gICBzZXQgYW5kIGdldCBmb3IgdGhlIGRpZmZlcmVudCBkYXRhQ29uZmlnIHBhcmFtc1xuXG4qL1xuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cblxudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8gTG9nZ2luZyB1dGlsaXR5IG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgREVCVUcgPSB0cnVlO1xudmFyIExvZ2dlciA9IHtcblx0bG9nOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5sb2cobWVzc2FnZSk7XG5cdH0sXG5cblx0ZXJyb3I6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuXHR9XG59O1xuXG4vKipcbiAqXHRjYWxsYmFjayA6IGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBtb2RlbCB1cGRhdGVkXG4gKiAqL1xuZnVuY3Rpb24gSUVRKHNlbGVjdG9yKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cdHRoaXMuZGF0YU1vZGVsPXt9O1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbi8vXHR0aGF0LnN1YnNjcmlwdGlvbkVycm9yTnVtID0gMDtcblxuXHQvKioqIHN0cnVjdHVyZSBvZiBkYXRhIGNvbmZpZyAqKipcblx0XHQgY3JpdGVyaWEgOlxuXHRcdCAgIHRpbWU6IGFsbCAzIHRpbWUgY3JpdGVyaWEgc2hvdWxkIG5vdCBiZSBkZWZpbmVkIGF0IHRoZSBzYW1lIHRpbWUuIChyYW5nZSB3b3VsZCBiZSBnaXZlbiB1cClcblx0XHQgICAgIHN0YXJ0OiB7W251bGxdLHRpbWV9IChudWxsIG1lYW5zIG1vc3QgcmVjZW50KSAvLyBzdG9yZWQgYSBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIGVuZDoge1tudWxsXSwgdGltZX0gKG51bGwgbWVhbnMgbW9zdCBvbGRlc3QpIC8vIHN0b3JlZCBhcyBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIHJhbmdlOiB7W251bGxdLCB0aW1lfSAocmFuZ2Ugb2YgdGltZShwb3NpdGl2ZSkgKSAvLyBpbiBzIChudW0pXG5cdFx0ICAgcm9ib3Q6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgICBwbGFjZToge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCBvcGVyYXRvcjoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfSAtKCBtYXliZSBtb3kgc2hvdWxkIGJlIGRlZmF1bHRcblx0XHQgLi4uXG5cblx0XHQgc2Vuc29ycyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTZW5zb3JOYW1lfVxuXG5cdFx0IHNhbXBsaW5nOiB7W251bGxdIG9yIGludH1cblx0Ki9cblx0dGhpcy5kYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7XG5cdFx0XHRcdHN0YXJ0OiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbCxcblx0XHRcdHBsYWNlOiBudWxsXG5cdFx0fSxcblx0XHRvcGVyYXRvcjogJ2xhc3QnLFxuXHRcdHNlbnNvcnM6IG51bGwsXG5cdFx0c2FtcGxpbmc6IG51bGwgLy9zYW1wbGluZ1xuXHR9O1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDpcbiAqIHtcbiAqXHRcInNlbnNldXJYWFwiOiB7XG4gKlx0XHRcdGRhdGE6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRwbGFjZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHF1YWxpdHlJbmRleDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJhbmdlOiBbRkxPQVQsIEZMT0FUXSxcbiAqXHRcdFx0dW5pdDogc3RyaW5nLFxuICpcdFx0bGFiZWw6IHN0cmluZ1xuICpcdFx0fSxcbiAqXHQgLi4uIChcInNlbnNldXJzWVlcIilcbiAqIH1cbiAqL1xuSUVRLnByb3RvdHlwZS5nZXREYXRhTW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59O1xuSUVRLnByb3RvdHlwZS5nZXREYXRhUmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwucmFuZ2U7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tSUVRXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtJRVF9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuSUVRLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBzdGFydCBhbmQgZW5kLlxuICogSWYgcGFyYW0gZGVmaW5lZFxuICpcdEBwYXJhbSB7RGF0ZX0gbmV3VGltZVN0YXJ0IC8vIG1heSBiZSBudWxsXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lRW5kIC8vIG1heSBiZSBudWxsXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBJZiBubyBwYXJhbSBkZWZpbmVkOlxuICpcdEByZXR1cm4ge09iamVjdH0gVGltZSBvYmplY3Q6IGZpZWxkcyBzdGFydCBhbmQgZW5kLlxuICovXG5JRVEucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZVN0YXJ0LG5ld1RpbWVFbmQsIG5ld1JhbmdlKXtcblx0aWYobmV3VGltZVN0YXJ0IHx8IG5ld1RpbWVFbmQgfHwgbmV3UmFuZ2UpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5zdGFydCA9IG5ld1RpbWVTdGFydC5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuZW5kID0gbmV3VGltZUVuZC5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UgPSBuZXdSYW5nZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0OiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5zdGFydCksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzXG4gKiBTZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSBwbGFjZUlkcyBsaXN0IG9mIHBsYWNlIElkc1xuICogR2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2YgcGxhY2UgSWRzXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YVBsYWNlSWRzID0gZnVuY3Rpb24ocGxhY2VJZHMpe1xuXHRpZihwbGFjZUlkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZUlkID0gcGxhY2VJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2U7XG59O1xuLyoqXG4gKiBHZXQgZGF0YSBieSBzZW5zb3IgbmFtZS5cbiAqXHRAcGFyYW0ge0FycmF5W1N0cmluZ119IHNlbnNvck5hbWUgbGlzdCBvZiBzZW5zb3JzXG4gKi9cbklFUS5wcm90b3R5cGUuZ2V0RGF0YUJ5TmFtZSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzKXtcblx0dmFyIGRhdGE9W107XG5cdGZvcih2YXIgbiBpbiBzZW5zb3JOYW1lcykge1xuXHRcdGRhdGEucHVzaCh0aGlzLmRhdGFNb2RlbFtzZW5zb3JOYW1lc1tuXV0pO1xuXHR9XG5cdHJldHVybiBkYXRhO1xufTtcbi8qKlxuICogVXBkYXRlIGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cbklFUS5wcm90b3R5cGUudXBkYXRlRGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwiaWVxXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJzcGxSZXFcIixcblx0XHRcdGRhdGFDb25maWc6IHRoYXQuZGF0YUNvbmZpZ1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIltcIit0aGF0LmRhdGFDb25maWcuc2Vuc29ycytcIl0gUmVjdiBlcnI6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiVXBkYXRlRGF0YTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5kYXRhQ29uZmlnKSk7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJEYXRhIHJlcXVlc3QgZmFpbGVkIChcIitkYXRhLmhlYWRlci5lcnJvci5zdCtcIik6IFwiK2RhdGEuaGVhZGVyLmVycm9yLm1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XG5cdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHQvLyBMb2dnZXIubG9nKHRoYXQuZ2V0RGF0YU1vZGVsKCkpO1xuXG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoYXQpOyAvLyBiaW5kIGNhbGxiYWNrIHdpdGggSUVRXG5cdFx0Y2FsbGJhY2sodGhhdC5nZXREYXRhTW9kZWwoKSk7IC8vIGNhbGxiYWNrIGZ1bmNcblx0fSk7XG59O1xuXG5JRVEucHJvdG90eXBlLl9pc0RhdGFNb2RlbFdpdGhOYU4gPSBmdW5jdGlvbigpIHtcblx0dmFyIGRhdGFNb2RlbE5hTj1mYWxzZTtcblx0dmFyIHNlbnNvck5hbjtcblx0Zm9yKHZhciBuIGluIHRoaXMuZGF0YU1vZGVsKSB7XG5cdFx0c2Vuc29yTmFuID0gdGhpcy5kYXRhTW9kZWxbbl0uZGF0YS5yZWR1Y2UoZnVuY3Rpb24obmFuUHJlcyxkKSB7XG5cdFx0XHRyZXR1cm4gbmFuUHJlcyAmJiBpc05hTihkKTtcblx0XHR9LGZhbHNlKTtcblx0XHRkYXRhTW9kZWxOYU4gPSBkYXRhTW9kZWxOYU4gJiYgc2Vuc29yTmFuO1xuXHRcdExvZ2dlci5sb2cobitcIiB3aXRoIG5hbiA6IFwiK3NlbnNvck5hbitcIiAoXCIrZGF0YU1vZGVsTmFOK1wiKSAvIFwiK3RoaXMuZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoKTtcblx0fVxufTtcblxuSUVRLnByb3RvdHlwZS5nZXRDb25maW5lbWVudExldmVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuY29uZmluZW1lbnQ7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEFpclF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmFpclF1YWxpdHk7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEVudlF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmVudlF1YWxpdHk7XG59O1xuXG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIGRhdGEgdG8gY29uZmlndXJlIHN1YnNjcmlwdGlvblxuICogQHBhcmFtICBjYWxsYmFjayBjYWxsZWQgb24gYW5zd2VycyAoQHBhcmFtIDogZGF0YU1vZGVsKVxuICovXG5JRVEucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXG5cdC8qKiBkZWZhdWx0ICoqL1xuXHRkYXRhID0gZGF0YSB8fCB7fTtcblx0ZGF0YS50aW1lUmFuZ2UgPSBkYXRhLnRpbWVSYW5nZSAgfHwgJ2hvdXJzJztcblx0ZGF0YS5jYXQgPSBkYXRhLmNhdCB8fCAnaWVxJzsgLyogY2F0ZWdvcnkgKi9cblxuXHR2YXIgc3VicyA9IHRoaXMuc2VsZWN0b3Iuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiBcImllcVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVwiLFxuXHRcdGRhdGE6IGRhdGEsXG5cdFx0b2JqOiBkYXRhLmNhdCAvKiBwcm92aWRlIGNhdGVnb3J5IG9mIHNlbnNvciB0byBiZSB3YXRjaGVkLCBmaWx0ZXJlZCBhY2NvcmRpbmcgdG8gQ1JNICovXG5cdH0sIGZ1bmN0aW9uKGRuSWQsIGVyciwgZGF0YSl7XG5cdFx0aWYoZXJyKSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJXYXRjaElFUVJlY3ZFcnI6XCIrSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhlKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoYXQuc2VsZWN0b3IpO1xuXHRcdFx0Ly8gaWYoZXJyPT09XCJTdWJzY3JpcHRpb25DbG9zZWRcIikge1xuXHRcdFx0Ly8gXHR0aGF0LmNsb3NlU3Vic2NyaXB0aW9ucygpOyAvLyBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeVxuXHRcdFx0Ly8gXHR0aGF0LnN1YnNjcmlwdGlvbkVycm9yID0gdGhhdC5zdWJzY3JpcHRpb25FcnJvck51bSsxOyAvLyBpbmNyZWFzZSBlcnJvciBjb3VudGVyXG5cdFx0XHQvLyBcdHNldFRpbWVvdXQodGhhdC5zdWJzY3JpcHRpb25FcnJvck51bSo2MDAwMCwgdGhhdC53YXRjaChkYXRhLGNhbGxiYWNrKSk7IC8vIHRyeSBhZ2FpbiBsYXRlclxuXHRcdFx0Ly8gfVxuXHRcdFx0Ly8gZWxzZSB7XG5cdFx0XHQvLyBcdGNvbnNvbGUuZXJyb3IoXCJVbm1hbmFnZSBjYXNlcyA6IHNob3VsZCB0aGUgc3Vic2NyaXB0aW9uIGJlIHJlZ2VuZXJhdGVkID9cIik7XG5cdFx0XHQvLyB9XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJXYXRjaElFUTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5kYXRhQ29uZmlnKSk7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJEYXRhIHJlcXVlc3QgZmFpbGVkIChcIitkYXRhLmhlYWRlci5lcnJvci5zdCtcIik6IFwiK2RhdGEuaGVhZGVyLmVycm9yLm1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdHRoYXQuX2dldERhdGFNb2RlbEZyb21SZWN2KGRhdGEpO1xuLy9cdFx0dGhhdC5zdWJzY3JpcHRpb25FcnJvciA9IDA7IC8vIHJlc2V0IGVycm9yIGNvdW50ZXJcblxuXHRcdGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGF0KTsgLy8gYmluZCBjYWxsYmFjayB3aXRoIElFUVxuXHRcdGNhbGxiYWNrKHRoYXQuZ2V0RGF0YU1vZGVsKCkpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnMpO1xufTtcblxuLyoqXG4gKiBDbG9zZSBhbGwgc3Vic2NyaXB0aW9uc1xuICovXG5JRVEucHJvdG90eXBlLmNsb3NlU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgaSBpbiB0aGlzLnN1YnNjcmlwdGlvbnMpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaV0uY2xvc2UoKTtcblx0fVxuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPVtdO1xufTtcblxuLyoqXG4gKiByZXF1ZXN0IERhdGEgdG8gbWFrZSBDU1YgZmlsZVxuICovXG5JRVEucHJvdG90eXBlLmdldENTVkRhdGEgPSBmdW5jdGlvbihzZW5zb3JOYW1lcyxfZmlyc3REYXksY2FsbGJhY2spe1xuXHR2YXIgZmlyc3REYXkgPSBuZXcgRGF0ZShfZmlyc3REYXkpO1xuXHR2YXIgZGF0YUNvbmZpZyA9IHtcblx0XHRjcml0ZXJpYToge1xuXHRcdFx0dGltZTogeyBzdGFydDogZmlyc3REYXkuZ2V0VGltZSgpLCByYW5nZVVuaXQ6ICdob3VyJywgcmFuZ2U6IDE4MH0sIC8vIDM2MGggLT4gMTVkIC8vIDE4MGggLT4gN2pcblx0XHRcdHBsYWNlczogW10sXG5cdFx0XHRyb2JvdHM6IFtdXG5cdFx0fSxcblx0XHRzZW5zb3JzOiBzZW5zb3JOYW1lc1xuXHR9O1xuXG5cdHRoaXMudXBkYXRlRGF0YShjYWxsYmFjaywgZGF0YUNvbmZpZyk7XG59O1xuXG5cbi8qKlxuICogVXBkYXRlIGludGVybmFsIG1vZGVsIHdpdGggcmVjZWl2ZWQgZGF0YVxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgcmVjZWl2ZWQgZnJvbSBEaXlhTm9kZSBieSB3ZWJzb2NrZXRcbiAqIEByZXR1cm4ge1t0eXBlXX1cdFx0W2Rlc2NyaXB0aW9uXVxuICovXG5JRVEucHJvdG90eXBlLl9nZXREYXRhTW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgZGF0YU1vZGVsPW51bGw7XG5cblx0aWYoZGF0YS5lcnIgJiYgZGF0YS5lcnIuc3Q+MCkge1xuXHRcdExvZ2dlci5lcnJvcihkYXRhLmVyci5tc2cpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGRlbGV0ZSBkYXRhLmVycjtcblx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlcikge1xuXHRcdGZvciAodmFyIG4gaW4gZGF0YSkge1xuXHRcdFx0aWYobiAhPSBcImhlYWRlclwiICYmIG4gIT0gXCJlcnJcIikge1xuXG5cdFx0XHRcdGlmKGRhdGFbbl0uZXJyICYmIGRhdGFbbl0uZXJyLnN0PjApIHtcblx0XHRcdFx0XHRMb2dnZXIuZXJyb3IobitcIiB3YXMgaW4gZXJyb3I6IFwiK2RhdGFbbl0uZXJyLm1zZyk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighZGF0YU1vZGVsKVxuXHRcdFx0XHRcdGRhdGFNb2RlbD17fTtcblxuXHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGFic29sdXRlIHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZVJhbmdlPWRhdGFbbl0udGltZVJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBsYWJlbCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdW5pdCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHByZWNpc2lvbiAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucHJlY2lzaW9uPWRhdGFbbl0ucHJlY2lzaW9uO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBjYXRlZ29yaWVzICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5jYXRlZ29yeT1kYXRhW25dLmNhdGVnb3J5O1xuXG5cdFx0XHRcdC8qIHN1Z2dlc3RlZCB5IGRpc3BsYXkgcmFuZ2UgKi9cblx0XHRcdFx0ZGF0YU1vZGVsW25dLnpvb21SYW5nZSA9IFswLCAxMDBdO1xuXG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGluZGV4UmFuZ2UgKi9cblx0XHRcdFx0ZGF0YU1vZGVsW25dLnF1YWxpdHlDb25maWc9e1xuXHRcdFx0XHRcdC8qIGNvbmZvcnRSYW5nZTogZGF0YVtuXS5jb25mb3J0UmFuZ2UsICovXG5cdFx0XHRcdFx0aW5kZXhSYW5nZTogZGF0YVtuXS5pbmRleFJhbmdlXG5cdFx0XHRcdH07XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS50aW1lID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnRpbWUsJ2I2NCcsOCk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gKGRhdGFbbl0uZGF0YT90aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uZGF0YSwnYjY0Jyw0KTooZGF0YVtuXS5hdmc/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5kLCdiNjQnLDQpOm51bGwpKTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnF1YWxpdHlJbmRleCA9IChkYXRhW25dLmRhdGE/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmluZGV4LCdiNjQnLDQpOihkYXRhW25dLmF2Zz90aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uYXZnLmksJ2I2NCcsNCk6bnVsbCkpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucm9ib3RJZCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5yb2JvdElkLCdiNjQnLDQpO1xuXHRcdFx0XHRpZihkYXRhTW9kZWxbbl0ucm9ib3RJZCkge1xuXHRcdFx0XHRcdC8qKiBkaWNvIHJvYm90SWQgLT4gcm9ib3ROYW1lICoqL1xuXHRcdFx0XHRcdHZhciBkaWNvUm9ib3QgPSB7fTtcblx0XHRcdFx0XHRkYXRhLmhlYWRlci5yb2JvdHMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuXHRcdFx0XHRcdFx0ZGljb1JvYm90W2VsLmlkXT1lbC5uYW1lO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5yb2JvdElkID0gZGF0YU1vZGVsW25dLnJvYm90SWQubWFwKGZ1bmN0aW9uKGVsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZGljb1JvYm90W2VsXTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5wbGFjZUlkID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnBsYWNlSWQsJ2I2NCcsNCk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS54ID0gbnVsbDtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnkgPSBudWxsO1xuXG5cdFx0XHRcdGlmKGRhdGFbbl0uYXZnKVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5hdmcgPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uYXZnLmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uYXZnLmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLm1pbilcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ubWluID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLm1pbi5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLm1pbi5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5tYXgpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLm1heCA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5tYXguZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5tYXguaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0uc3RkZGV2KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5zdGRkZXYgPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uc3RkZGV2LmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uc3RkZGV2LmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLnN0ZGRldilcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uc3RkZGV2ID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS54KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS54ID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLngsJ2I2NCcsNCk7XG5cdFx0XHRcdGlmKGRhdGFbbl0ueSlcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ueSA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS55LCdiNjQnLDQpO1xuXHRcdFx0XHQvKipcblx0XHRcdFx0ICogY3VycmVudCBxdWFsaXR5IDogeydiJ2FkLCAnbSdlZGl1bSwgJ2cnb29kfVxuXHRcdFx0XHQgKiBldm9sdXRpb24gOiB7J3UncCwgJ2Qnb3duLCAncyd0YWJsZX1cblx0XHRcdFx0ICogZXZvbHV0aW9uIHF1YWxpdHkgOiB7J2InZXR0ZXIsICd3J29yc2UsICdzJ2FtZX1cblx0XHRcdFx0ICovXG5cdFx0XHRcdC8vLyBUT0RPXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS50cmVuZCA9ICdtc3MnO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRlbHNlIHtcblx0XHRMb2dnZXIuZXJyb3IoXCJObyBEYXRhIHRvIHJlYWQgb3IgaGVhZGVyIGlzIG1pc3NpbmcgIVwiKTtcblx0fVxuXHQvKiogbGlzdCByb2JvdHMgKiovXG4vL1x0ZGF0YU1vZGVsLnJvYm90cyA9IFt7bmFtZTogJ0QyUjInLCBpZDoxfV07XG5cdHRoaXMuZGF0YU1vZGVsPWRhdGFNb2RlbDtcblx0cmV0dXJuIGRhdGFNb2RlbDtcbn07XG5cblxuXG5cblxuLyoqIGNyZWF0ZSBJRVEgc2VydmljZSAqKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuSUVRID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIG5ldyBJRVEodGhpcyk7XG59O1xuIiwidmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciBkMSA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpO1xudmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cblxuXG5kMS5rbm93blBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBkMShcIiNzZWxmXCIpLmtub3duUGVlcnMoKTtcbn07XG5kMS5rcCA9IGQxLmtub3duUGVlcnM7XG5cblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmtub3duUGVlcnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdHRoaXMucmVxdWVzdCh7c2VydmljZTogJ21lc2hOZXR3b3JrJyxmdW5jOiAnTGlzdEtub3duUGVlcnMnfSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdHZhciBwZWVycyA9IFtdO1xuXHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdH0pO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuXG5cbmQxLmxpc3Rlbk1lc2hOZXR3b3JrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0cmV0dXJuIGQxKC8uKi8pLnN1YnNjcmliZSh7IHNlcnZpY2U6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdNZXNoTmV0d29yaycgfSwgY2FsbGJhY2ssIHthdXRvOiB0cnVlfSk7XG59O1xuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG5mdW5jdGlvbiBNZXNzYWdlKHNlcnZpY2UsIGZ1bmMsIG9iaiwgcGVybWFuZW50KXtcblxuXHR0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXHR0aGlzLmZ1bmMgPSBmdW5jO1xuXHR0aGlzLm9iaiA9IG9iajtcblx0XG5cdHRoaXMucGVybWFuZW50ID0gcGVybWFuZW50OyAvL0lmIHRoaXMgZmxhZyBpcyBvbiwgdGhlIGNvbW1hbmQgd2lsbCBzdGF5IG9uIHRoZSBjYWxsYmFjayBsaXN0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG59XG5cbk1lc3NhZ2UuYnVpbGRTaWduYXR1cmUgPSBmdW5jdGlvbihtc2cpe1xuXHRyZXR1cm4gbXNnLnNlcnZpY2UrJy4nK21zZy5mdW5jKycuJyttc2cub2JqO1xufVxuXG5cbk1lc3NhZ2UucHJvdG90eXBlLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnNlcnZpY2UrJy4nK3RoaXMuZnVuYysnLicrdGhpcy5vYmo7XG59XG5cbk1lc3NhZ2UucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbihkYXRhKXtcblx0cmV0dXJuIHtcblx0XHRzZXJ2aWNlOiB0aGlzLnNlcnZpY2UsXG5cdFx0ZnVuYzogdGhpcy5mdW5jLFxuXHRcdG9iajogdGhpcy5vYmosXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZTtcbiIsInZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgZDEgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKTtcbnZhciBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKTtcbmlmKCFpc0Jyb3dzZXIpIHsgdmFyIFEgPSByZXF1aXJlKCdxJyk7IH1cbmVsc2UgeyB2YXIgUSA9IHdpbmRvdy5ROyB9XG5cbmlmKHR5cGVvZiBJTkZPID09PSAndW5kZWZpbmVkJykgdmFyIElORk8gPSBmdW5jdGlvbihzKSB7IGNvbnNvbGUubG9nKHMpO31cbmlmKHR5cGVvZiBPSyA9PT0gJ3VuZGVmaW5lZCcpIHZhciBPSyA9IGZ1bmN0aW9uKHMpIHsgY29uc29sZS5sb2cocyk7fVxuXG5cblxuLyoqXG4qIEluc3RhbGxzIGEgbmV3IERpeWFOb2RlIGRldmljZSAod2l0aCBhZGRyZXNzICdpcCcpIGludG8gYW4gZXhpc3RpbmcgbmV0d29yaywgYnlcbiogY29udGFjdGluZyBhbiBleGlzdGluZyBEaXlhTm9kZSBkZXZpY2Ugd2l0aCBhZGRyZXNzICdib290c3RyYXBfaXAnIDpcbiogICAxKSBDb250YWN0IHRoZSBuZXcgbm9kZSB0byBnZXQgaXRzIHB1YmxpYyBrZXlcbiogICAyKSBBZGQgdGhpcyBwdWJsaWMga2V5IHRvIHRoZSBleGlzdGluZyBub2RlIFRydXN0ZWRQZWVycyBsaXN0XG4qICAgMykgQWRkIHRoZSBleGlzdGluZyBub2RlJ3MgcHVibGljIGtleSB0byB0aGUgbmV3IG5vZGUncyBUcnVzdGVkUGVlcnMgbGlzdFxuKiAgIDQpIEFzayB0aGUgbmV3IG5vZGUgdG8gam9pbiB0aGUgbmV0d29yayBieSBjYWxsaW5nIEBzZWV7ZDEoKS5qb2luKCl9XG4qXG4qIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyB0aGUgZ2l2ZW4gdXNlciB0byBoYXZlIHJvb3Qgcm9sZSBvbiBib3RoIG5vZGVzXG4qXG4qIEBwYXJhbSBpcCA6IHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBuZXcgZGV2aWNlXG4qIEBwYXJhbSB1c2VyIDogYSB1c2VybmFtZSB3aXRoIHJvb3Qgcm9sZSBvbiB0aGUgbmV3IGRldmljZVxuKiBAcGFyYW0gcGFzc3dvcmQgOiB0aGUgcGFzc3dvcmQgZm9yICd1c2VyJ1xuKiBAcGFyYW0gYm9vdHN0cmFwX2lwIDogdGhlIElQIGFkZHJlc3Mgb2YgdGhlIGJvb3RzdHJhcCBkZXZpY2VcbiogQHBhcmFtIGJvb3RzdHJhcF91c2VyIDogYSB1c2VyIGlkZW50aWZpZXIgd2l0aCByb290IHJvbGUgb24gdGhlIGJvb3N0cmFwIGRldmljZVxuKiBAcGFyYW0gYm9vdHN0cmFwX3Bhc3N3b3JkIDogdGhlIHBhc3N3b3JkIGZvciAnYm9vdHN0cmFwX3VzZXInXG4qIEBwYXJhbSBib290c3RyYXBfbmV0IDogdGhlIElQIGFkZHJlc3Mgd2hlcmUgdGhlIG5ldyBkZXZpY2Ugd2lsbCBjb25uZWN0IHRvIHRoZSBib29zdHJhcCBvbmVcbiogQHBhcmFtIGNhbGxiYWNrIDogb2YgdGhlIGZvcm0gY2FsbGJhY2sobmV3X3BlZXJfbmFtZSxib290c3RyYXBfcGVlcl9uYW1lLCBlcnIsIGRhdGEpXG4qL1xuZDEuaW5zdGFsbE5vZGVFeHQgPSBmdW5jdGlvbihpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spIHtcblx0aWYodHlwZW9mIGlwICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGlwIHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXAgIT09ICdzdHJpbmcnKSB0aHJvdyBcIltpbnN0YWxsTm9kZV0gYm9vdHN0cmFwX2lwIHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfbmV0ICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGJvb3RzdHJhcF9uZXQgc2hvdWxkIGJlIGFuIElQIGFkZHJlc3NcIjtcblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYm9vdHN0cmFwX2lwLmluZGV4T2YoXCJ3czovL1wiKSAhPT0gMCAmJiBib290c3RyYXBfaXAuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfaXAgPSBcIndzczovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHRcdGVsc2UgYm9vdHN0cmFwX2lwID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHR9XG5cdGlmKGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfbmV0ID0gXCJ3c3M6Ly9cIiArIGJvb3RzdHJhcF9uZXQ7XG5cdFx0ZWxzZSBib290c3RyYXBfbmV0ID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX25ldDtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKSB7XG5cdFx0ZDEoXCIjc2VsZlwiKS5qb2luKGJvb3RzdHJhcF9uZXQsIHRydWUsIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSl7XG5cdFx0XHRpZighZXJyKSBPSyhcIkpPSU5FRCAhISFcIik7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSk7XG5cdFx0fSk7XG5cdH1cblxuXHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpe1xuXHRcdGQxKFwiI3NlbGZcIikuZ2l2ZVB1YmxpY0tleShmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycj09PSdTZXJ2aWNlTm90Rm91bmQnKSB7XG5cdFx0XHRcdElORk8oXCJQZWVyIEF1dGhlbnRpY2F0aW9uIGRpc2FibGVkIC4uLiBkaXJlY3RseSBqb2luaW5nXCIpO1xuXHRcdFx0XHRqb2luKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZXJyKSByZXR1cm4gY2FsbGJhY2socGVlciwgbnVsbCwgZXJyLCBudWxsKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRJTkZPKFwiQWRkIHRydXN0ZWQgcGVlciAnXCIgKyBwZWVyICsgXCInIChpcD1cIiArIGlwICsgXCIpIHRvICdcIiArIGJvb3RzdHJhcF9pcCArIFwiJyB3aXRoIHB1YmxpYyBrZXlcXG5cIiArIGRhdGEucHVibGljX2tleSlcblx0XHRcdFx0ZDEuY29ubmVjdEFzVXNlcihib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKHBlZXIsIGRhdGEucHVibGljX2tleSwgZnVuY3Rpb24oYm9vdHN0cmFwX3BlZXIsIGVyciwgW2FscmVhZHlUcnVzdGVkLCBwdWJsaWNfa2V5XSkge1xuXG5cdFx0XHRcdFx0XHRpZihlcnIpIHJldHVybiBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBudWxsKTtcblx0XHRcdFx0XHRcdGlmKGFscmVhZHlUcnVzdGVkKSBJTkZPKHBlZXIgKyBcIiBhbHJlYWR5IHRydXN0ZWQgYnkgXCIgKyBib290c3RyYXBfcGVlcik7XG5cdFx0XHRcdFx0XHRlbHNlIElORk8oYm9vdHN0cmFwX3BlZXIgKyBcIihpcD1cIisgYm9vdHN0cmFwX2lwICtcIikgYWRkZWQgXCIgKyBwZWVyICsgXCIoaXA9XCIgKyBpcCArIFwiKSBhcyBhIFRydXN0ZWQgUGVlclwiKTtcblxuXHRcdFx0XHRcdFx0ZDEoJyNzZWxmJykuZ2l2ZVB1YmxpY0tleShmdW5jdGlvbihfLCBlcnIsIGRhdGEpIHtcblx0XHRcdFx0XHRcdFx0SU5GTyhcIkluIHJldHVybiwgYWRkIFwiICsgYm9vdHN0cmFwX3BlZXIgKyBcIiB0byBcIiArIHBlZXIgKyBcIiBhcyBhIFRydXN0ZWQgUGVlciB3aXRoIHB1YmxpYyBrZXkgXCIgKyBkYXRhLnB1YmxpY19rZXkpXG5cdFx0XHRcdFx0XHRcdGQxLmNvbm5lY3RBc1VzZXIoaXAsIHVzZXIsIHBhc3N3b3JkKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRcdFx0ZDEoXCIjc2VsZlwiKS5hZGRUcnVzdGVkUGVlcihib290c3RyYXBfcGVlciwgZGF0YS5wdWJsaWNfa2V5LCBmdW5jdGlvbihwZWVyLCBlcnIsIFthbHJlYWR5VHJ1c3RlZCwgcHVibGljX2tleV0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGVycikgY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgbnVsbCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlIGlmKGFscmVhZHlUcnVzdGVkKSBJTkZPKGJvb3RzdHJhcF9wZWVyICsgXCIgYWxyZWFkeSB0cnVzdGVkIGJ5IFwiICsgcGVlcik7XG5cdFx0XHRcdFx0XHRcdFx0XHRlbHNlIElORk8ocGVlciArIFwiKGlwPVwiKyBpcCArXCIpIGFkZGVkIFwiICsgYm9vdHN0cmFwX3BlZXIgKyBcIihpcD1cIisgYm9vdHN0cmFwX2lwICtcIikgYXMgYSBUcnVzdGVkIFBlZXJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBPbmNlIEtleXMgaGF2ZSBiZWVuIGV4Y2hhbmdlZCBhc2sgdG8gam9pbiB0aGUgbmV0d29ya1xuXHRcdFx0XHRcdFx0XHRcdFx0T0soXCJLRVlTIE9LICEgTm93LCBsZXQgXCIrcGVlcitcIihpcD1cIitpcCtcIikgam9pbiB0aGUgbmV0d29yayB2aWEgXCIrYm9vdHN0cmFwX3BlZXIrXCIoaXA9XCIrYm9vdHN0cmFwX25ldCtcIikgLi4uXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGpvaW4ocGVlciwgYm9vdHN0cmFwX3BlZXIpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcbn1cblxuXG4vKiogU2hvcnQgdmVyc2lvbiBvZiBAc2Vle2QxLmluc3RhbGxOb2RlRXh0fSAqL1xuZDEuaW5zdGFsbE5vZGUgPSBmdW5jdGlvbihib290c3RyYXBfaXAsIGJvb3RzdHJhcF9uZXQsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGlwID0gZDEuYWRkcigpO1xuXHRcdHZhciB1c2VyID0gZDEudXNlcigpO1xuXHRcdHZhciBwYXNzd29yZCA9IGQxLnBhc3MoKTtcblx0XHR2YXIgYm9vdHN0cmFwX3VzZXIgPSB1c2VyO1xuXHRcdHZhciBib290c3RyYXBfcGFzc3dvcmQgPSBwYXNzd29yZDtcblxuXHRcdGNvbnNvbGUubG9nIChgW2luc3RhbGxOb2RlXVxcbmlwOiR7aXB9YClcblxuXHRcdHJldHVybiBkMS5pbnN0YWxsTm9kZUV4dChpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spO1xufVxuXG5cblxuXG4vKipcbiAqIE1ha2UgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBqb2luIGFuIGV4aXN0aW5nIERpeWFOb2RlcyBNZXNoIE5ldHdvcmsgYnkgY29udGFjdGluZ1xuICogdGhlIGdpdmVuIGJvb3RzdHJhcCBwZWVycy5cbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGNvbnRhY3QgdG8gam9pbiB0aGUgTmV0d29ya1xuICogQHBhcmFtIHBlcm1hbmVudCA6IGlmIHRydWUsIHBlcm1hbmVudGx5IGFkZCB0aGUgYm9vdHN0cmFwIHBlZXJzIGFzIGF1dG9tYXRpYyBib290c3RyYXAgcGVlcnMgZm9yIHRoZSBzZWxlY3RlZCBub2Rlcy5cbiAqXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcHMsIHBlcm1hbmVudCwgY2FsbGJhY2spIHtcblx0aWYodHlwZW9mIGJvb3RzdHJhcF9pcHMgPT09ICdzdHJpbmcnKSBib290c3RyYXBfaXBzID0gWyBib290c3RyYXBfaXBzIF1cblxuXHRpZihib290c3RyYXBfaXBzLmNvbnN0cnVjdG9yICE9PSBBcnJheSlcblx0XHR0aHJvdyBcImpvaW4oKSA6IGJvb3RzdHJhcF9pcHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHBlZXJzIFVSSXNcIlxuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZSA6ICdtZXNoTmV0d29yaycsXG5cdFx0ZnVuYzogJ0pvaW4nLFxuXHRcdGRhdGE6IHtcblx0XHRcdGJvb3RzdHJhcF9pcHMsXG5cdFx0XHRwZXJtYW5lbnRcblx0XHR9XG5cdH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIilcblx0XHRcdFx0Y2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpXG5cdFx0fVxuXHQpXG59XG5cblxuLyoqXG4gKiBEaXNjb25uZWN0IHRoZSBzZWxlY3RlZCBEaXlhTm9kZXMgZnJvbSB0aGUgZ2l2ZW4gYm9vdHN0cmFwIHBlZXJzXG4gKlxuICogTk9URSA6IFRoaXMgb3BlcmF0aW9uIHJlcXVpcmVzIHJvb3Qgcm9sZVxuICpcbiAqIEBwYXJhbSBib290c3RyYXBfaXBzIDogYW4gYXJyYXkgb2YgYm9vdHN0cmFwIElQIGFkZHJlc3NlcyB0byBsZWF2ZVxuICogQHBhcmFtIGJQZXJtYW5lbnQgOiBpZiB0cnVlLCBwZXJtYW5lbnRseSByZW1vdmUgdGhlIGdpdmVuIHBlZXJzIGZyb20gdGhlIGF1dG9tYXRpYyBib290c3RyYXAgcGVlcnMgbGlzdFxuICpcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcHMsIGJQZXJtYW5lbnQsIGNhbGxiYWNrKXtcblx0aWYodHlwZW9mIGJvb3RzdHJhcF9pcHMgPT09ICdzdHJpbmcnKSBib290c3RyYXBfaXBzID0gWyBib290c3RyYXBfaXBzIF07XG5cdGlmKGJvb3RzdHJhcF9pcHMuY29uc3RydWN0b3IgIT09IEFycmF5KSB0aHJvdyBcImxlYXZlKCkgOiBib290c3RyYXBfaXBzIHNob3VsZCBiZSBhbiBhcnJheSBvZiBwZWVycyBVUklzXCI7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZSA6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdMZWF2ZScsIGRhdGE6IHsgYm9vdHN0cmFwX2lwczogYm9vdHN0cmFwX2lwcywgYlBlcm1hbmVudDogYlBlcm1hbmVudCB9fSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkgeyBpZih0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpO31cblx0KTtcbn07XG5cblxuLyoqXG4gKiBBc2sgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBmb3IgdGhlaXIgcHVibGljIGtleXNcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5naXZlUHVibGljS2V5ID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXHRyZXR1cm4gdGhpcy5yZXF1ZXN0KFxuXHRcdHsgc2VydmljZTogJ3BlZXJBdXRoJyxcdGZ1bmM6ICdHaXZlUHVibGljS2V5JyxcdGRhdGE6IHt9IH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe2NhbGxiYWNrKHBlZXJJZCxlcnIsZGF0YSk7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBBZGQgYSBuZXcgdHJ1c3RlZCBwZWVyIFJTQSBwdWJsaWMga2V5IHRvIHRoZSBzZWxlY3RlZCBEaXlhTm9kZXNcbiAqIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyByb290IHJvbGVcbiAqXG4gKiBAcGFyYW0gcGVlcl9uYW1lIDogdGhlIG5hbWUgb2YgdGhlIG5ldyB0cnVzdGVkIERpeWFOb2RlIHBlZXJcbiAqIEBwYXJhbSBwdWJsaWNfa2V5IDogdGhlIFJTQSBwdWJsaWMga2V5IG9mIHRoZSBuZXcgdHJ1c3RlZCBEaXlhTm9kZSBwZWVyXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYWRkVHJ1c3RlZFBlZXIgPSBmdW5jdGlvbihuYW1lLCBwdWJsaWNfa2V5LCBjYWxsYmFjaykge1xuXHRyZXR1cm4gdGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAncGVlckF1dGgnLFxuXHRcdGZ1bmM6ICdBZGRUcnVzdGVkUGVlcicsXG5cdFx0ZGF0YToge1xuXHRcdFx0cGVlcl9uYW1lOiBuYW1lLFxuXHRcdFx0cHVibGljX2tleTogcHVibGljX2tleVxuXHRcdH1cblx0fSxcblx0XHRmdW5jdGlvbiAocGVlcklkLGVycixkYXRhKSB7XG5cdFx0XHRjYWxsYmFjayAocGVlcklkLGVycixkYXRhKVxuXHRcdH1cblx0KVxufVxuXG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyB0cnVzdCB0aGUgZ2l2ZW4gcGVlcnNcbiAqIEBwYXJhbSBwZWVycyA6IGFuIGFycmF5IG9mIHBlZXIgbmFtZXNcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5hcmVUcnVzdGVkID0gZnVuY3Rpb24ocGVlcnMsIGNhbGxiYWNrKXtcblx0cmV0dXJuIHRoaXMucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnQXJlVHJ1c3RlZCcsXHRkYXRhOiB7IHBlZXJzOiBwZWVycyB9IH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdHZhciBhbGxUcnVzdGVkID0gZGF0YS50cnVzdGVkO1xuXHRcdFx0aWYoYWxsVHJ1c3RlZCkgeyBPSyhwZWVycyArIFwiIGFyZSB0cnVzdGVkIGJ5IFwiICsgcGVlcklkKTsgY2FsbGJhY2socGVlcklkLCB0cnVlKTsgfVxuXHRcdFx0ZWxzZSB7IEVSUihcIlNvbWUgcGVlcnMgaW4gXCIgKyBwZWVycyArIFwiIGFyZSB1bnRydXN0ZWQgYnkgXCIgKyBwZWVySWQpOyBjYWxsYmFjayhwZWVySWQsIGZhbHNlKTsgfVxuXHRcdH1cblx0KTtcbn07XG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmlzVHJ1c3RlZCA9IGZ1bmN0aW9uKHBlZXIsIGNhbGxiYWNrKSB7IHJldHVybiB0aGlzLmFyZVRydXN0ZWQoW3BlZXJdLCBjYWxsYmFjayk7IH1cblxuXG5kMS50cnVzdGVkUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRkMShcIiNzZWxmXCIpLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dldFRydXN0ZWRQZWVycycgfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHR2YXIgcGVlcnMgPSBbXTtcblx0XHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0XHR9XG5cdCk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcbmQxLnRwID0gZDEudHJ1c3RlZFBlZXJzOyAvLyBTaG9ydGhhbmRcblxuZDEuYmxhY2tsaXN0ZWRQZWVycyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdGQxKFwiI3NlbGZcIikucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnR2V0QmxhY2tsaXN0ZWRQZWVycycgfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHR2YXIgcGVlcnMgPSBbXTtcblx0XHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0XHR9XG5cdCk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcbmQxLmJwID0gZDEuYmxhY2tsaXN0ZWRQZWVyczsgLy8gU2hvcnRoYW5kXG4iLCJsZXQgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xubGV0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xubGV0IGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxucmVxdWlyZSgnd2VicnRjLWFkYXB0ZXInKTtcblxuLyppZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyl7XG5cdHZhciBSVENQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uO1xuXHR2YXIgUlRDSWNlQ2FuZGlkYXRlID0gd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cubW96UlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy53ZWJraXRSVENJY2VDYW5kaWRhdGU7XG5cdHZhciBSVENTZXNzaW9uRGVzY3JpcHRpb24gPSB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy5tb3pSVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93LndlYmtpdFJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcbn0qL1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vXG4vLyBDSEFOTkVMIC8vXG4vLy8vLy8vLy8vLy8vXG5cbi8qKiBIYW5kbGVzIGEgUlRDIGNoYW5uZWwgKGRhdGFjaGFubmVsIGFuZC9vciBzdHJlYW0pIHRvIGEgRGl5YU5vZGUgcGVlclxuICogIEBwYXJhbSBkbklkIDogdGhlIERpeWFOb2RlIHBlZXJJZFxuICogIEBwYXJhbSBuYW1lIDogdGhlIGNoYW5uZWwncyBuYW1lXG4gKiAgQHBhcmFtIGRhdGFjaGFubmVsX2NiIDogY2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBSVEMgZGF0YWNoYW5uZWwgaXMgb3BlbiBmb3IgdGhpcyBjaGFubmVsXG4gKiAgQHBhcmFtIHN0cmVhbV9jYiA6IGNhbGxiYWNrIGNhbGxlZCB3aGVuIGEgUlRDIHN0cmVhbSBpcyBvcGVuIGZvciB0aGlzIGNoYW5uZWxcbiAqL1xuZnVuY3Rpb24gQ2hhbm5lbChkbklkLCBuYW1lLCBkYXRhY2hhbm5lbF9jYiwgc3RyZWFtX2NiKSB7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXHR0aGlzLm5hbWUgPSBuYW1lO1xuXHR0aGlzLmRuSWQgPSBkbklkO1xuXG5cdHRoaXMuZnJlcXVlbmN5ID0gMjA7XG5cblx0dGhpcy5jaGFubmVsID0gdW5kZWZpbmVkO1xuXHR0aGlzLnN0cmVhbSA9IHVuZGVmaW5lZDtcblx0dGhpcy5vbmRhdGFjaGFubmVsID0gZGF0YWNoYW5uZWxfY2I7XG5cdHRoaXMub25zdHJlYW0gPSBzdHJlYW1fY2I7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG59XG5pbmhlcml0cyhDaGFubmVsLCBFdmVudEVtaXR0ZXIpO1xuXG4vKiogQmluZCBhbiBpbmNvbWluZyBSVEMgZGF0YWNoYW5uZWwgdG8gdGhpcyBjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5zZXREYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKGRhdGFjaGFubmVsKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmNoYW5uZWwgPSBkYXRhY2hhbm5lbDtcblx0dGhpcy5jaGFubmVsLmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRjb25zb2xlLmxvZyhcInNldCBkYXRhIGNoYW5uZWwgOlwiK3RoaXMubmFtZSk7XG5cdGRhdGFjaGFubmVsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdC8vIEZpcnN0IG1lc3NhZ2UgY2FycmllcyBjaGFubmVsIGRlc2NyaXB0aW9uIGhlYWRlclxuXHRcdHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KG1lc3NhZ2UuZGF0YSk7XG5cblx0XHR2YXIgdHlwZUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXcuZ2V0VWludDgoMCkpO1xuXHRcdGlmKHR5cGVDaGFyID09PSAnTycpIHRoYXQudHlwZSA9ICdpbnB1dCc7IC8vUHJvbWV0aGUgT3V0cHV0ID0gQ2xpZW50IElucHV0XG5cdFx0ZWxzZSBpZih0eXBlQ2hhciA9PT0gJ0knKSB0aGF0LnR5cGUgPSAnb3V0cHV0JzsgLy9Qcm9tZXRoZSBJbnB1dCA9IENsaWVudCBPdXRwdXRcblx0XHRlbHNlIHRocm93IFwiVW5yZWNub2duaXplZCBjaGFubmVsIHR5cGUgOiBcIiArIHR5cGVDaGFyO1xuXG5cdFx0dmFyIHNpemUgPSB2aWV3LmdldEludDMyKDEsdHJ1ZSk7XG5cdFx0aWYoIXNpemUpIHRocm93IFwiV3JvbmcgZGF0YWNoYW5uZWwgbWVzc2FnZSBzaXplXCI7XG5cdFx0dGhhdC5zaXplID0gc2l6ZTtcblx0XHR0aGF0Ll9idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpO1xuXG5cdFx0Ly8gU3Vic2VxdWVudCBtZXNzYWdlcyBhcmUgZm9yd2FyZGVkIHRvIGFwcHJvcHJpYXRlIGhhbmRsZXJzXG5cdFx0ZGF0YWNoYW5uZWwub25tZXNzYWdlID0gdGhhdC5fb25NZXNzYWdlLmJpbmQodGhhdCk7XG5cdFx0ZGF0YWNoYW5uZWwub25jbG9zZSA9IHRoYXQuX29uQ2xvc2UuYmluZCh0aGF0KTtcblxuXHRcdGlmKHR5cGVvZiB0aGF0Lm9uZGF0YWNoYW5uZWwgPT09ICdmdW5jdGlvbicpIHRoYXQub25kYXRhY2hhbm5lbCh0aGF0LmRuSWQsIHRoYXQpO1xuXG5cdFx0Y29uc29sZS5sb2coJ09wZW4gZGF0YWNoYW5uZWwgJyt0aGF0Lm5hbWUpO1xuXHR9XG59O1xuXG4vKiogQmluZCBhbiBpbmNvbWluZyBSVEMgc3RyZWFtIHRvIHRoaXMgY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUub25BZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcblx0dGhpcy5zdHJlYW0gPSBzdHJlYW07XG5cdGlmKHR5cGVvZiB0aGlzLm9uc3RyZWFtID09PSAnZnVuY3Rpb24nKSB0aGlzLm9uc3RyZWFtKHRoaXMuZG5JZCwgc3RyZWFtKTtcblx0ZWxzZSBjb25zb2xlLndhcm4oXCJJZ25vcmUgc3RyZWFtIFwiICsgc3RyZWFtLmlkKTtcblxuXHRjb25zb2xlLmxvZygnT3BlbiBzdHJlYW0gJyt0aGlzLm5hbWUpO1xufTtcblxuXG4vKiogQ2xvc2UgdGhpcyBjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcbn07XG5cbi8qKiBXcml0ZSBhIHNjYWxhciB2YWx1ZSB0byB0aGUgZ2l2ZW4gaW5kZXggb24gdGhlIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRpZihpbmRleCA8IDAgfHwgaW5kZXggPiB0aGlzLnNpemUgfHwgaXNOYU4odmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdHRoaXMuX2J1ZmZlcltpbmRleF0gPSB2YWx1ZTtcblx0dGhpcy5fcmVxdWVzdFNlbmQoKTtcblx0cmV0dXJuIHRydWU7XG59O1xuXG4vKiogV3JpdGUgYW4gYXJyYXkgb2YgdmFsdWVzIHRvIHRoZSBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLndyaXRlQWxsID0gZnVuY3Rpb24odmFsdWVzKXtcblx0aWYoIUFycmF5LmlzQXJyYXkodmFsdWVzKSB8fCB2YWx1ZXMubGVuZ3RoICE9PSB0aGlzLnNpemUpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpPHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGlmKGlzTmFOKHZhbHVlc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5fYnVmZmVyW2ldID0gdmFsdWVzW2ldO1xuICAgIH1cbiAgICB0aGlzLl9yZXF1ZXN0U2VuZCgpO1xufTtcblxuLyoqIEFzayB0byBzZW5kIHRoZSBpbnRlcm5hbCBkYXRhIGJ1ZmZlciB0aHJvdWdoIHRoZSBkYXRhY2hhbm5lbCBhdCB0aGUgZGVmaW5lZCBmcmVxdWVuY3kgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9yZXF1ZXN0U2VuZCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR2YXIgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RTZW5kVGltZXN0YW1wO1xuXHR2YXIgcGVyaW9kID0gMTAwMCAvIHRoaXMuZnJlcXVlbmN5O1xuXHRpZihlbGFwc2VkVGltZSA+PSBwZXJpb2QpIGRvU2VuZCgpO1xuXHRlbHNlIGlmKCF0aGlzLl9zZW5kUmVxdWVzdGVkKSB7XG5cdFx0dGhpcy5fc2VuZFJlcXVlc3RlZCA9IHRydWU7XG5cdFx0c2V0VGltZW91dChkb1NlbmQsIHBlcmlvZCAtIGVsYXBzZWRUaW1lKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRvU2VuZCgpIHtcblx0XHR0aGF0Ll9zZW5kUmVxdWVzdGVkID0gZmFsc2U7XG5cdFx0dGhhdC5fbGFzdFNlbmRUaW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHR2YXIgcmV0ID0gdGhhdC5fc2VuZCh0aGF0Ll9idWZmZXIpO1xuXHRcdC8vSWYgYXV0b3NlbmQgaXMgc2V0LCBhdXRvbWF0aWNhbGx5IHNlbmQgYnVmZmVyIGF0IHRoZSBnaXZlbiBmcmVxdWVuY3lcblx0XHRpZihyZXQgJiYgdGhhdC5hdXRvc2VuZCkgdGhhdC5fcmVxdWVzdFNlbmQoKTtcblx0fVxufTtcblxuLyoqIEFjdHVhbCBzZW5kIHRoZSBpbnRlcm5hbCBkYXRhIGJ1ZmZlciB0aHJvdWdoIHRoZSBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9zZW5kID0gZnVuY3Rpb24obXNnKXtcblx0aWYodGhpcy5jbG9zZWQgfHwgIXRoaXMuY2hhbm5lbCkgcmV0dXJuIGZhbHNlO1xuXHRlbHNlIGlmKHRoaXMuY2hhbm5lbC5yZWFkeVN0YXRlID09PSAnb3BlbicpIHtcblx0XHR0cnkge1xuXHRcdFx0dGhpcy5jaGFubmVsLnNlbmQobXNnKTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbcnRjLmNoYW5uZWwud3JpdGVdIGV4Y2VwdGlvbiBvY2N1cmVkIHdoaWxlIHNlbmRpbmcgZGF0YScpO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRlbHNlIHtcblx0XHRjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSB3YXJuaW5nIDogd2VicnRjIGRhdGFjaGFubmVsIHN0YXRlID0gJyt0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKiogQ2FsbGVkIHdoZW4gYSBtZXNzYWdlIGlzIHJlY2VpdmVkIGZyb20gdGhlIGNoYW5uZWwncyBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9vbk1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdHZhciB2YWxBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkobWVzc2FnZS5kYXRhKTtcblx0dGhpcy5lbWl0KCd2YWx1ZScsIHZhbEFycmF5KTtcbn07XG5cbi8qKiBDYWxsZWQgd2hlbiB0aGUgY2hhbm5lbCBpcyBjbG9zZWQgb24gdGhlIHJlbW90ZSBzaWRlICovXG5DaGFubmVsLnByb3RvdHlwZS5fb25DbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRjb25zb2xlLmxvZygnQ2xvc2UgZGF0YWNoYW5uZWwgJyt0aGlzLm5hbWUpO1xuXHR0aGlzLmVtaXQoJ2Nsb3NlJyk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFJUQyBQZWVyIGltcGxlbWVudGF0aW9uIC8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBBbiBSVEMgUGVlciBhc3NvY2lhdGVkIHRvIGEgc2luZ2xlIChEaXlhTm9kZSBwZWVySWQsIHByb21JZCkgY291cGxlLlxuICogQHBhcmFtIGRuSWQgOiBUaGUgRGl5YU5vZGUgcGVlcklkXG4gKiBAcGFyYW0gcnRjIDogVGhlIFJUQyBkaXlhLXNkayBpbnN0YW5jZVxuICogQHBhcmFtIGlkIDogdGhlIHByb21JZFxuICogQHBhcmFtIGNoYW5uZWxzIDogYW4gYXJyYXkgb2YgUlRDIGNoYW5uZWwgbmFtZXMgdG8gb3BlblxuICovXG5mdW5jdGlvbiBQZWVyKGRuSWQsIHJ0YywgaWQsIGNoYW5uZWxzKXtcblx0dGhpcy5kbiA9IGQxKGRuSWQpO1xuXHR0aGlzLmRuSWQgPSBkbklkO1xuXHR0aGlzLmlkID0gaWQ7XG5cdHRoaXMuY2hhbm5lbHMgPSBjaGFubmVscztcblx0dGhpcy5ydGMgPSBydGM7XG5cdHRoaXMucGVlciA9IG51bGw7XG5cblx0dGhpcy5zdHJlYW1zID0gW107XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59XG5cbi8qKiBJbml0aWF0ZSBhIFJUQyBjb25uZWN0aW9uIHRvIHRoaXMgUGVlciAqL1xuUGVlci5wcm90b3R5cGUuX2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLmRuLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogJ3J0YycsIGZ1bmM6ICdDb25uZWN0Jywgb2JqOiB0aGlzLmNoYW5uZWxzLCBkYXRhOiB7IHByb21JRDogdGhpcy5pZCB9XG5cdH0sIGZ1bmN0aW9uKGRpeWEsIGVyciwgZGF0YSl7XG5cdFx0aWYoZGF0YSkge1xuXHRcdFx0aWYoZGF0YS5ldmVudFR5cGUgPT09ICdUdXJuSW5mbycpIHRoYXQuX3R1cm5pbmZvID0gZGF0YS50dXJuO1xuXHRcdFx0ZWxzZSBpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZU9mZmVyJykgdGhhdC5fY3JlYXRlUGVlcihkYXRhKTtcblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdSZW1vdGVJQ0VDYW5kaWRhdGUnKSB0aGF0Ll9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUoZGF0YSk7XG5cdFx0fVxuXHR9KTtcblxuXHR0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGlmKCF0aGF0LmNvbm5lY3RlZCAmJiAhdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpOyB9LCA0MDAwMCk7XG59O1xuXG4vKiogUmVjb25uZWN0cyB0aGUgUlRDIHBlZXIgKi9cblBlZXIucHJvdG90eXBlLl9yZWNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLmNsb3NlKCk7XG5cblx0dGhpcy5wZWVyID0gbnVsbDtcblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59O1xuXG5cbi8qKiBDcmVhdGVzIGEgUlRDUGVlckNvbm5lY3Rpb24gaW4gcmVzcG9uc2UgdG8gYSBSZW1vdGVPZmZlciAqL1xuUGVlci5wcm90b3R5cGUuX2NyZWF0ZVBlZXIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBpY2VTZXJ2ZXJzID0gW107XG5cdGlmKHRoaXMuX3R1cm5pbmZvKSB7XG5cdFx0aWNlU2VydmVycy5wdXNoKHsgdXJsczogWyB0aGlzLl90dXJuaW5mby51cmwgXSwgdXNlcm5hbWU6IHRoaXMuX3R1cm5pbmZvLnVzZXJuYW1lLCBjcmVkZW50aWFsOiB0aGlzLl90dXJuaW5mby5wYXNzd29yZCB9KTtcblx0fSBlbHNlIHtcblx0XHRpY2VTZXJ2ZXJzLnB1c2goe3VybHM6IFsgXCJzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyXCIgXX0pO1xuXHR9XG5cblx0dmFyIGNvbmZpZyA9IHtcblx0XHRpY2VTZXJ2ZXJzOiBpY2VTZXJ2ZXJzLFxuXHRcdGljZVRyYW5zcG9ydFBvbGljeTogJ2FsbCdcblx0fTtcblxuXHR2YXIgY29uc3RyYWludHMgPSB7XG5cdFx0bWFuZGF0b3J5OiB7RHRsc1NydHBLZXlBZ3JlZW1lbnQ6IHRydWUsIE9mZmVyVG9SZWNlaXZlQXVkaW86IHRydWUsIE9mZmVyVG9SZWNlaXZlVmlkZW86dHJ1ZX1cblx0fVxuXG5cdGNvbnNvbGUubG9nKGNvbmZpZyk7XG5cdGNvbnNvbGUubG9nKGNvbnN0cmFpbnRzKTtcblxuXHR2YXIgcGVlciA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihjb25maWcsICBjb25zdHJhaW50cyk7XG5cdHRoaXMucGVlciA9IHBlZXI7XG5cblx0dGhpcy5zdHJlYW1zLmZvckVhY2goZnVuY3Rpb24ocykge1xuXHRcdHBlZXIuYWRkU3RyZWFtKHMpO1xuXHR9KTtcblxuXHRwZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe3NkcDogZGF0YS5zZHAsIHR5cGU6IGRhdGEudHlwZX0pKTtcblxuXHRwZWVyLmNyZWF0ZUFuc3dlcihmdW5jdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKXtcblx0XHRwZWVyLnNldExvY2FsRGVzY3JpcHRpb24oc2Vzc2lvbl9kZXNjcmlwdGlvbik7XG5cblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnQW5zd2VyJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0c2RwOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcCxcblx0XHRcdFx0dHlwZTogc2Vzc2lvbl9kZXNjcmlwdGlvbi50eXBlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZ1bmN0aW9uKGVycil7IGNvbnNvbGUubG9nKGVycik7IH0sXG5cdHsnbWFuZGF0b3J5JzogeyBPZmZlclRvUmVjZWl2ZUF1ZGlvOiB0cnVlLCBPZmZlclRvUmVjZWl2ZVZpZGVvOiB0cnVlfX0pO1xuXG5cdHBlZXIub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnY29ubmVjdGVkJyl7XG5cdFx0XHR0aGF0LmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0XHRpZih0aGF0LnN1YnNjcmlwdGlvbikgdGhhdC5zdWJzY3JpcHRpb24uY2xvc2UoKTtcblx0XHR9XG5cdFx0ZWxzZSBpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Rpc2Nvbm5lY3RlZCcgfHwgcGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjbG9zZWQnIHx8IHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZmFpbGVkJyl7XG5cdFx0XHRpZighdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpO1xuXHRcdH1cblx0fTtcblxuXHRwZWVyLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnSUNFQ2FuZGlkYXRlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiB0aGF0LmlkLFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25EYXRhQ2hhbm5lbCh0aGF0LmRuSWQsIGV2dC5jaGFubmVsKTtcblx0fTtcblxuXHRwZWVyLm9uYWRkc3RyZWFtID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0dGhhdC5jb25uZWN0ZWQgPSB0cnVlO1xuXHRcdHRoYXQucnRjLl9vbkFkZFN0cmVhbSh0aGF0LmRuSWQsIGV2dC5zdHJlYW0pO1xuXHR9O1xufTtcblxuXG5QZWVyLnByb3RvdHlwZS5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG5cdHRyeSB7XG5cdFx0Ly9jb25zb2xlLmxvZygncmVtb3RlIGljZSA6Jyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhLmNhbmRpZGF0ZS5jYW5kaWRhdGUpO1xuXHRcdHZhciBjYW5kaWRhdGUgPSBuZXcgUlRDSWNlQ2FuZGlkYXRlKGRhdGEuY2FuZGlkYXRlKTtcblx0XHR0aGlzLnBlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSwgZnVuY3Rpb24oKXt9LGZ1bmN0aW9uKGVycil7IGNvbnNvbGUuZXJyb3IoZXJyKTtcdH0pO1xuXHR9IGNhdGNoKGVycikgeyBjb25zb2xlLmVycm9yKGVycik7IH1cbn07XG5cbi8qKiBTZW5kIHRoZSBtYXBwaW5ncyBmcm9tIGNoYW5uZWwgbmFtZXMgdG8gc3RyZWFtIElEcyAqL1xuUGVlci5wcm90b3R5cGUuc2VuZENoYW5uZWxzU3RyZWFtc01hcHBpbmdzID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZG4ucmVxdWVzdCh7XG5cdFx0c2VydmljZTpcInJ0Y1wiLFxuXHRcdGZ1bmM6XCJDaGFubmVsc1N0cmVhbXNNYXBwaW5nc1wiLFxuXHRcdGRhdGE6e3BlZXJJZDowLCBtYXBwaW5nczp0aGlzLnJ0Y1t0aGlzLmRuSWRdLmNoYW5uZWxzQnlTdHJlYW19XG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0fSk7XG59O1xuXG4vKiogQWRkcyBhIGxvY2FsIHN0cmVhbSB0byB0aGlzIFBlZXIgKi9cblBlZXIucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR0aGlzLnNlbmRDaGFubmVsc1N0cmVhbXNNYXBwaW5ncygpO1xuXHRpZighdGhpcy5zdHJlYW1zLmZpbHRlcihmdW5jdGlvbihzKXtyZXR1cm4gc3RyZWFtLmlkID09PSBzO30pWzBdKSB0aGlzLnN0cmVhbXMucHVzaChzdHJlYW0pO1xuXHR0aGlzLl9yZWNvbm5lY3QoKTtcbn1cblxuUGVlci5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG5cdHRoaXMuc3RyZWFtcyA9IHRoaXMuc3RyZWFtcy5maWx0ZXIoZnVuY3Rpb24ocyl7cmV0dXJuIHN0cmVhbS5pZCAhPT0gczt9KTtcblx0aWYodGhpcy5wZWVyKSB0aGlzLnBlZXIucmVtb3ZlU3RyZWFtKHN0cmVhbSk7XG59XG5cblBlZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0aWYodGhpcy5zdWJzY3JpcHRpb24pIHRoaXMuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0SWQpO1xuXHRpZih0aGlzLnBlZXIpe1xuXHRcdHRyeXtcblx0XHRcdHRoaXMucGVlci5jbG9zZSgpO1xuXHRcdH1jYXRjaChlKXt9XG5cdFx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmNsb3NlZCA9IHRydWU7XG5cdH1cbn07XG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFJUQyBzZXJ2aWNlIGltcGxlbWVudGF0aW9uIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5cbmZ1bmN0aW9uIFJUQyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMgPSBbXTtcblx0dGhpcy5jaGFubmVsc0J5U3RyZWFtID0gW107XG59XG5cblJUQy5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24obmFtZV9yZWdleCwgdHlwZSwgb25kYXRhY2hhbm5lbF9jYWxsYmFjaywgb25hZGRzdHJlYW1fY2FsbGJhY2spe1xuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goe3JlZ2V4OiBuYW1lX3JlZ2V4LCB0eXBlOnR5cGUsIGNiOiBvbmRhdGFjaGFubmVsX2NhbGxiYWNrLCBzdHJlYW1fY2I6IG9uYWRkc3RyZWFtX2NhbGxiYWNrfSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqIFN0YXJ0IGxpc3RlbmluZyB0byBQZWVycyBjb25uZWN0aW9ucy5cbiAqIEEgJ1BlZXInIG9iamVjdCB3aWxsIGJlIGNyZWF0ZWQgZm9yIGVhY2ggRGl5YU5vZGUgcGVlcklkIGFuZCBlYWNoIHByb21JRFxuICovXG5SVEMucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblxuXHR0aGlzLnN1YnNjcmlwdGlvbiA9IHRoaXMuc2VsZWN0b3Iuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRmdW5jOiAnUGVlcnMnXG5cdH0sIGZ1bmN0aW9uKGRuSWQsIGVyciwgZGF0YSl7XG5cblx0XHRpZighdGhhdFtkbklkXSkgdGhhdC5fY3JlYXRlRGl5YU5vZGUoZG5JZCk7XG5cblx0XHRpZihlcnIgPT09ICdTdWJzY3JpcHRpb25DbG9zZWQnIHx8IGVyciA9PT0gJ1BlZXJEaXNjb25uZWN0ZWQnKXtcblx0XHRcdHRoYXQuX2Nsb3NlRGl5YU5vZGUoZG5JZCk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdGlmKGRhdGEgJiYgZGF0YS5ldmVudFR5cGUgJiYgZGF0YS5wcm9tSUQgIT09IHVuZGVmaW5lZCl7XG5cblx0XHRcdGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUGVlckNvbm5lY3RlZCcpe1xuXHRcdFx0XHRpZighdGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0pe1xuXHRcdFx0XHRcdHZhciBjaGFubmVscyA9IHRoYXQuX21hdGNoQ2hhbm5lbHMoZG5JZCwgZGF0YS5jaGFubmVscyk7XG5cdFx0XHRcdFx0aWYoY2hhbm5lbHMubGVuZ3RoID4gMCl7XG5cdFx0XHRcdFx0XHR0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSA9IG5ldyBQZWVyKGRuSWQsIHRoYXQsIGRhdGEucHJvbUlELCBjaGFubmVscyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQXV0b3JlY29ubmVjdCBkZWNsYXJlZCBzdHJlYW1zXG5cdFx0XHRcdFx0dGhhdC5jaGFubmVsc0J5U3RyZWFtLmZvckVhY2goZnVuY3Rpb24oY2JzKSB7XG5cdFx0XHRcdFx0XHR0aGF0LmFkZFN0cmVhbShjYnMuY2hhbm5lbCwgY2JzLm1lZGlhU3RyZWFtKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZih0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSkgdGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0uc2VuZENoYW5uZWxzU3RyZWFtc01hcHBpbmdzKCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUGVlckNsb3NlZCcpIHtcblx0XHRcdFx0aWYodGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0pIHtcblx0XHRcdFx0XHR0aGF0Ll9jbG9zZVBlZXIoZG5JZCwgZGF0YS5wcm9tSUQpO1xuXHRcdFx0XHRcdGlmKHR5cGVvZiB0aGF0Lm9uY2xvc2UgPT09ICdmdW5jdGlvbicpIHRoYXQub25jbG9zZShkbklkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sIHthdXRvOiB0cnVlfSk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5SVEMucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5zZWxlY3Rvci5lYWNoKGZ1bmN0aW9uKGRuSWQpe1xuXHRcdGlmKCF0aGF0W2RuSWRdKSByZXR1cm4gO1xuXHRcdGZvcih2YXIgcHJvbUlEIGluIHRoYXRbZG5JZF0ucGVlcnMpe1xuXHRcdFx0dGhhdC5fY2xvc2VQZWVyKGRuSWQsIHByb21JRCk7XG5cdFx0fVxuXHR9KTtcblxuXHRpZih0aGlzLnN1YnNjcmlwdGlvbikgdGhpcy5zdWJzY3JpcHRpb24uY2xvc2UoKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cblJUQy5wcm90b3R5cGUuX2NyZWF0ZURpeWFOb2RlID0gZnVuY3Rpb24oZG5JZCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzW2RuSWRdID0ge1xuXHRcdGRuSWQ6IGRuSWQsXG5cdFx0dXNlZENoYW5uZWxzOiBbXSxcblx0XHRyZXF1ZXN0ZWRDaGFubmVsczogW10sXG5cdFx0cGVlcnM6IFtdLFxuXHRcdGNoYW5uZWxzQnlTdHJlYW06IFtdXG5cdH1cblxuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLmZvckVhY2goZnVuY3Rpb24oYyl7dGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVscy5wdXNoKGMpfSk7XG59O1xuXG5SVEMucHJvdG90eXBlLl9jbG9zZURpeWFOb2RlID0gZnVuY3Rpb24oZG5JZCl7XG5cdGZvcih2YXIgcHJvbUlEIGluIHRoaXNbZG5JZF0ucGVlcnMpe1xuXHRcdHRoaXMuX2Nsb3NlUGVlcihkbklkLCBwcm9tSUQpO1xuXHR9XG5cblx0ZGVsZXRlIHRoaXNbZG5JZF07XG59O1xuXG5SVEMucHJvdG90eXBlLl9jbG9zZVBlZXIgPSBmdW5jdGlvbihkbklkLCBwcm9tSUQpe1xuXHRpZih0aGlzW2RuSWRdLnBlZXJzW3Byb21JRF0pe1xuXHRcdHZhciBwID0gdGhpc1tkbklkXS5wZWVyc1twcm9tSURdO1xuXHRcdHAuY2xvc2UoKTtcblxuXHRcdGZvcih2YXIgaT0wO2k8cC5jaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRkZWxldGUgdGhpc1tkbklkXS51c2VkQ2hhbm5lbHNbcC5jaGFubmVsc1tpXV07XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXNbZG5JZF0ucGVlcnNbcHJvbUlEXTtcblx0fVxufTtcblxuLyoqIE1hdGNoZXMgdGhlIGdpdmVuIHJlY2VpdmVkQ2hhbm5lbHMgcHJvcG9zZWQgYnkgdGhlIGdpdmVuIERpeWFOb2RlIHBlZXJJZFxuICogIGFnYWluc3QgdGhlIHJlcXVlc3RlZCBjaGFubmVscyBhbmQgY3JlYXRlcyBhIENoYW5uZWwgZm9yIGVhY2ggbWF0Y2hcbiAqL1xuUlRDLnByb3RvdHlwZS5fbWF0Y2hDaGFubmVscyA9IGZ1bmN0aW9uKGRuSWQsIHJlY2VpdmVkQ2hhbm5lbHMpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIGNoYW5uZWxzID0gW107XG5cblx0Zm9yKHZhciBpID0gMDsgaSA8IHJlY2VpdmVkQ2hhbm5lbHMubGVuZ3RoOyBpKyspe1xuXHRcdHZhciBuYW1lID0gcmVjZWl2ZWRDaGFubmVsc1tpXTtcblx0XHR2YXIgcmVtb3RlU3RyZWFtSWQgPSBuYW1lLnNwbGl0KFwiXzs6X1wiKVsxXTtcblx0XHRuYW1lID0gbmFtZS5zcGxpdChcIl87Ol9cIilbMF07XG5cblx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVscy5sZW5ndGg7IGorKyl7XG5cdFx0XHR2YXIgcmVxID0gdGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVsc1tqXTtcblxuXHRcdFx0aWYobmFtZSAmJiBuYW1lLm1hdGNoKHJlcS5yZWdleCkgJiYgIXRoYXRbZG5JZF0udXNlZENoYW5uZWxzW25hbWVdKXtcblx0XHRcdFx0dmFyIGNoYW5uZWwgPSBuZXcgQ2hhbm5lbChkbklkLCBuYW1lLCByZXEuY2IsIHJlcS5zdHJlYW1fY2IpO1xuXHRcdFx0XHR0aGF0W2RuSWRdLnVzZWRDaGFubmVsc1tuYW1lXSA9IGNoYW5uZWw7XG5cdFx0XHRcdGNoYW5uZWxzLnB1c2gobmFtZSk7XG5cblx0XHRcdFx0Ly8gSWYgYSBzdHJlYW0gaWQgaXMgcHJvdmlkZWQgZm9yIHRoZSBjaGFubmVsLCByZWdpc3RlciB0aGUgbWFwcGluZ1xuXHRcdFx0XHRpZihyZW1vdGVTdHJlYW1JZCkge1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLnN0cmVhbSAhPT0gcmVtb3RlU3RyZWFtSWQgJiYgY2JzLmNoYW5uZWwgIT09IGNoYW5uZWw7IH0pO1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtzdHJlYW06cmVtb3RlU3RyZWFtSWQsIGNoYW5uZWw6Y2hhbm5lbH0pO1xuXHRcdFx0XHRcdGNoYW5uZWwuc3RyZWFtSWQgPSBzdHJlYW1JZDtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgbG9jYWxTdHJlYW1JZCA9IHRoYXQuY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgPT09IG5hbWU7IH0pWzBdO1xuXHRcdFx0XHRpZihsb2NhbFN0cmVhbUlkKSB7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuc3RyZWFtICE9PSBsb2NhbFN0cmVhbUlkICYmIGNicy5jaGFubmVsICE9PSBuYW1lOyB9KTtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7c3RyZWFtOmxvY2FsU3RyZWFtSWQsIGNoYW5uZWw6bmFtZX0pO1xuXHRcdFx0XHRcdGNoYW5uZWwubG9jYWxTdHJlYW1JZCA9IGxvY2FsU3RyZWFtSWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gIGNoYW5uZWxzO1xufTtcblxuXG4vKiogQ2FsbGVkIHVwb24gUlRDIGRhdGFjaGFubmVscyBjb25uZWN0aW9ucyAqL1xuUlRDLnByb3RvdHlwZS5fb25EYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKGRuSWQsIGRhdGFjaGFubmVsKXtcblx0aWYoIXRoaXNbZG5JZF0pIHJldHVybiBjb25zb2xlLndhcm4oXCJUcmllZCB0byBvcGVuIGEgZGF0YSBjaGFubmVsIG9uIGEgY2xvc2VkIHBlZXJcIik7XG5cdHZhciBjaGFubmVsID0gdGhpc1tkbklkXS51c2VkQ2hhbm5lbHNbZGF0YWNoYW5uZWwubGFiZWxdO1xuXG5cdGlmKCFjaGFubmVsKXtcblx0XHRjb25zb2xlLmxvZyhcIkRhdGFjaGFubmVsIFwiK2RhdGFjaGFubmVsLmxhYmVsK1wiIHVubWF0Y2hlZCwgY2xvc2luZyAhXCIpO1xuXHRcdGRhdGFjaGFubmVsLmNsb3NlKCk7XG5cdFx0cmV0dXJuIDtcblx0fVxuXHRjaGFubmVsLnNldERhdGFDaGFubmVsKGRhdGFjaGFubmVsKTtcbn07XG5cbi8qKiBDYWxsZWQgdXBvbiBSVEMgc3RyZWFtIGNoYW5uZWwgY29ubmVjdGlvbnMgKi9cblJUQy5wcm90b3R5cGUuX29uQWRkU3RyZWFtID0gZnVuY3Rpb24oZG5JZCwgc3RyZWFtKSB7XG5cdGlmKCF0aGlzW2RuSWRdKSByZXR1cm4gY29uc29sZS53YXJuKFwiVHJpZWQgdG8gb3BlbiBhIHN0cmVhbSBvbiBhIGNsb3NlZCBwZWVyXCIpO1xuXG5cdHZhciBjaGFubmVsID0gdGhpc1tkbklkXS51c2VkQ2hhbm5lbHNbc3RyZWFtLmlkXTtcblxuXHRpZighY2hhbm5lbCl7XG5cdFx0Y29uc29sZS53YXJuKFwiU3RyZWFtIENoYW5uZWwgXCIrIHN0cmVhbS5pZCArXCIgdW5tYXRjaGVkLCBjbG9zaW5nICFcIik7XG5cdFx0c3RyZWFtLmNsb3NlKCk7XG5cdFx0cmV0dXJuIDtcblx0fVxuXHRjaGFubmVsLm9uQWRkU3RyZWFtKHN0cmVhbSk7XG59O1xuXG4vKiogQWRkIGEgbG9jYWwgc3RyZWFtIHRvIGJlIHNlbnQgdGhyb3VnaCB0aGUgZ2l2ZW4gUlRDIGNoYW5uZWwgKi9cblJUQy5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oY2hhbm5lbCwgc3RyZWFtKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvLyBSZWdpc3RlciB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nXG5cdHRoaXMuY2hhbm5lbHNCeVN0cmVhbSA9IHRoaXMuY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcbiBcdHRoaXMuY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtjaGFubmVsOmNoYW5uZWwsIHN0cmVhbTpzdHJlYW0uaWQsIG1lZGlhU3RyZWFtOnN0cmVhbX0pO1xuXG5cdGNvbnNvbGUubG9nKFwiT3BlbiBsb2NhbCBzdHJlYW0gXCIgKyBjaGFubmVsKTtcblxuXHQvLyBTZW5kIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmcgdG8gYWxsIGNvbm5lY3RlZCBQZWVyc1xuXHR0aGlzLnNlbGVjdG9yLmVhY2goZnVuY3Rpb24oZG5JZCl7XG5cdFx0aWYoIXRoYXRbZG5JZF0pIHJldHVybiA7XG5cdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuXHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtjaGFubmVsOmNoYW5uZWwsIHN0cmVhbTpzdHJlYW0uaWR9KTtcblx0XHRmb3IodmFyIHByb21JRCBpbiB0aGF0W2RuSWRdLnBlZXJzKXtcblx0XHRcdHRoYXRbZG5JZF0ucGVlcnNbcHJvbUlEXS5hZGRTdHJlYW0oc3RyZWFtKTtcblx0XHR9XG5cdH0pO1xuXG59O1xuXG5SVEMucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKGNoYW5uZWwsIHN0cmVhbSkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0Ly8gUmVnaXN0ZXIgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZ1xuXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGlzLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG5cblx0Y29uc29sZS5sb2coXCJDbG9zZSBsb2NhbCBzdHJlYW0gXCIgKyBjaGFubmVsKTtcblxuXHQvLyBTZW5kIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmcgdG8gYWxsIGNvbm5lY3RlZCBQZWVyc1xuXHR0aGlzLnNlbGVjdG9yLmVhY2goZnVuY3Rpb24oZG5JZCl7XG5cdFx0aWYoIXRoYXRbZG5JZF0pIHJldHVybiA7XG5cdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuXHRcdGZvcih2YXIgcHJvbUlEIGluIHRoYXRbZG5JZF0ucGVlcnMpe1xuXHRcdFx0dGhhdFtkbklkXS5wZWVyc1twcm9tSURdLnJlbW92ZVN0cmVhbShzdHJlYW0pO1xuXHRcdH1cblx0fSk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJ0YyA9IGZ1bmN0aW9uKCl7IHJldHVybiBuZXcgUlRDKHRoaXMpO307XG4iLCIvKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gdHJ1ZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLyoqXG4gKlx0Y2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIFN0YXR1cyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcblxuXHQvKiogbW9kZWwgb2Ygcm9ib3QgOiBhdmFpbGFibGUgcGFydHMgYW5kIHN0YXR1cyAqKi9cblx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdHRoaXMuX3JvYm90TW9kZWxJbml0ID0gZmFsc2U7XG5cblx0LyoqKiBzdHJ1Y3R1cmUgb2YgZGF0YSBjb25maWcgKioqXG5cdFx0IGNyaXRlcmlhIDpcblx0XHQgICB0aW1lOiBhbGwgMyB0aW1lIGNyaXRlcmlhIHNob3VsZCBub3QgYmUgZGVmaW5lZCBhdCB0aGUgc2FtZSB0aW1lLiAocmFuZ2Ugd291bGQgYmUgZ2l2ZW4gdXApXG5cdFx0ICAgICBiZWc6IHtbbnVsbF0sdGltZX0gKG51bGwgbWVhbnMgbW9zdCByZWNlbnQpIC8vIHN0b3JlZCBhIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgZW5kOiB7W251bGxdLCB0aW1lfSAobnVsbCBtZWFucyBtb3N0IG9sZGVzdCkgLy8gc3RvcmVkIGFzIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgcmFuZ2U6IHtbbnVsbF0sIHRpbWV9IChyYW5nZSBvZiB0aW1lKHBvc2l0aXZlKSApIC8vIGluIHMgKG51bSlcblx0XHQgICByb2JvdDoge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCAgIHBsYWNlOiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0IG9wZXJhdG9yOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9IC0oIG1heWJlIG1veSBzaG91bGQgYmUgZGVmYXVsdFxuXHRcdCAuLi5cblxuXHRcdCBwYXJ0cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBQYXJ0c0lkfSB0byBnZXQgZXJyb3JzXG5cdFx0IHN0YXR1cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTdGF0dXNOYW1lfSB0byBnZXQgc3RhdHVzXG5cblx0XHQgc2FtcGxpbmc6IHtbbnVsbF0gb3IgaW50fVxuXHQqL1xuXHR0aGlzLmRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHtcblx0XHRcdFx0YmVnOiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbFxuXHRcdH0sXG5cdFx0b3BlcmF0b3I6ICdsYXN0Jyxcblx0XHRwYXJ0czogbnVsbCxcblx0XHRzdGF0dXM6IG51bGxcblx0fTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG4vKipcbiAqIEdldCByb2JvdE1vZGVsIDpcbiAqIHtcbiAqICBwYXJ0czoge1xuICpcdFx0XCJwYXJ0WFhcIjoge1xuICogXHRcdFx0IGVycm9yc0Rlc2NyOiB7IGVuY291bnRlcmVkIGVycm9ycyBpbmRleGVkIGJ5IGVycm9ySWRzPjAgfVxuICpcdFx0XHRcdD4gQ29uZmlnIG9mIGVycm9ycyA6XG4gKlx0XHRcdFx0XHRjcml0TGV2ZWw6IEZMT0FULCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqIFx0XHRcdFx0XHRtc2c6IFNUUklORyxcbiAqXHRcdFx0XHRcdHN0b3BTZXJ2aWNlSWQ6IFNUUklORyxcbiAqXHRcdFx0XHRcdHJ1blNjcmlwdDogU2VxdWVsaXplLlNUUklORyxcbiAqXHRcdFx0XHRcdG1pc3Npb25NYXNrOiBTZXF1ZWxpemUuSU5URUdFUixcbiAqXHRcdFx0XHRcdHJ1bkxldmVsOiBTZXF1ZWxpemUuSU5URUdFUlxuICpcdFx0XHRlcnJvcjpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHR9LFxuICpcdCBcdC4uLiAoXCJQYXJ0WVlcIilcbiAqICB9LFxuICogIHN0YXR1czoge1xuICpcdFx0XCJzdGF0dXNYWFwiOiB7XG4gKlx0XHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHRcdHRpbWU6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRcdHJvYm90OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHRcdFx0cmFuZ2U6IFtGTE9BVCwgRkxPQVRdLFxuICpcdFx0XHRcdGxhYmVsOiBzdHJpbmdcbiAqXHRcdFx0fSxcbiAqXHQgXHQuLi4gKFwiU3RhdHVzWVlcIilcbiAqICB9XG4gKiB9XG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0Um9ib3RNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnJvYm90TW9kZWw7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tU3RhdHVzXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtTdGF0dXN9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBiZWcgYW5kIGVuZC5cbiAqIElmIHBhcmFtIGRlZmluZWRcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVCZWcgLy8gbWF5IGJlIG51bGxcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVFbmQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcmV0dXJuIHtTdGF0dXN9IHRoaXNcbiAqIElmIG5vIHBhcmFtIGRlZmluZWQ6XG4gKlx0QHJldHVybiB7T2JqZWN0fSBUaW1lIG9iamVjdDogZmllbGRzIGJlZyBhbmQgZW5kLlxuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZUJlZyxuZXdUaW1lRW5kLCBuZXdSYW5nZSl7XG5cdGlmKG5ld1RpbWVCZWcgfHwgbmV3VGltZUVuZCB8fCBuZXdSYW5nZSkge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyA9IG5ld1RpbWVCZWcuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCA9IG5ld1RpbWVFbmQuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlID0gbmV3UmFuZ2U7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB7XG5cdFx0XHRiZWc6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzIC8vIG5vdCByZWxldmFudD8sIG5vdCBpbXBsZW1lbnRlZCB5ZXRcbiAqIFNldCBwbGFjZSBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHBsYWNlSWRzIGxpc3Qgb2YgcGxhY2UgSWRzXG4gKiBHZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiBwbGFjZSBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUGxhY2VJZHMgPSBmdW5jdGlvbihwbGFjZUlkcyl7XG5cdGlmKHBsYWNlSWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnBsYWNlSWQgPSBwbGFjZUlkcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZTtcbn07XG4vKipcbiAqIEdldCBkYXRhIGJ5IHNlbnNvciBuYW1lLlxuICpcdEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gc2Vuc29yTmFtZSBsaXN0IG9mIHNlbnNvcnNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5nZXREYXRhQnlOYW1lID0gZnVuY3Rpb24oc2Vuc29yTmFtZXMpe1xuXHR2YXIgZGF0YT1bXTtcblx0Zm9yKHZhciBuIGluIHNlbnNvck5hbWVzKSB7XG5cdFx0ZGF0YS5wdXNoKHRoaXMuZGF0YU1vZGVsW3NlbnNvck5hbWVzW25dXSk7XG5cdH1cblx0cmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byBlcnJvci9zdGF0dXMgdXBkYXRlc1xuICovXG5TdGF0dXMucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24ocm9ib3ROYW1lcywgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKHJvYm90TmFtZXMpO1xuXG5cdHZhciBzdWJzID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdzdGF0dXMnLFxuXHRcdGZ1bmM6ICdTdGF0dXMnLFxuXHRcdGRhdGE6IHJvYm90TmFtZXNcblx0fSwgZnVuY3Rpb24gKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cocGVlcklkKTtcblx0XHQvLyBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdC8vIGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdGlmIChlcnIgfHwgKGRhdGEmJmRhdGEuZXJyJmRhdGEuZXJyLnN0KSApIHtcblx0XHRcdExvZ2dlci5lcnJvciggXCJTdGF0dXNTdWJzY3JpYmU6XCIrKGVycj9lcnI6XCJcIikrXCJcXG5cIisoZGF0YSYmZGF0YS5lcnI/ZGF0YS5lcnI6XCJcIikgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlclxuXHRcdFx0ICAgJiYgZGF0YS5oZWFkZXIudHlwZSA9PT0gXCJpbml0XCIpIHtcblx0XHRcdFx0Ly8gaW5pdGlhbGlzYXRpb24gb2Ygcm9ib3QgbW9kZWxcblx0XHRcdFx0dGhhdC5yb2JvdE1vZGVsSW5pdCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdGlmKHRoYXQucm9ib3RNb2RlbEluaXQpIHtcblx0XHRcdFx0dGhhdC5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2MihkYXRhKTtcblx0XHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHRcdGNhbGxiYWNrKHRoYXQucm9ib3RNb2RlbCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gRXJyb3Jcblx0XHRcdFx0TG9nZ2VyLmVycm9yKFwiUm9ib3QgbW9kZWwgaGFzIG5vdCBiZWVuIGluaXRpYWxpc2VkLCBjYW5ub3QgYmUgdXBkYXRlZFwiKTtcblx0XHRcdFx0Ly8vIFRPRE8gdW5zdWJzY3JpYmVcblx0XHRcdH1cblx0XHR9XG5cdH0sIHsgYXV0bzogdHJ1ZSB9KTtcblx0dGhpcy5zdWJzY3JpcHRpb25zLnB1c2goc3Vicyk7XG59O1xuXG4vKipcbiAqIENsb3NlIGFsbCBzdWJzY3JpcHRpb25zXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuY2xvc2VTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oKXtcblx0Zm9yKHZhciBpIGluIHRoaXMuc3Vic2NyaXB0aW9ucykge1xuXHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tpXS5jbG9zZSgpO1xuXHR9XG5cdHRoaXMuc3Vic2NyaXB0aW9ucyA9W107XG59O1xuXG5cbi8qKlxuICogR2V0IGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0dmFyIGRhdGFNb2RlbCA9IHt9O1xuXHRpZihkYXRhQ29uZmlnKVxuXHRcdHRoaXMuRGF0YUNvbmZpZyhkYXRhQ29uZmlnKTtcblx0Ly8gY29uc29sZS5sb2coXCJSZXF1ZXN0OiBcIitKU09OLnN0cmluZ2lmeShkYXRhQ29uZmlnKSk7XG5cdHRoaXMuc2VsZWN0b3IucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJzdGF0dXNcIixcblx0XHRmdW5jOiBcIkRhdGFSZXF1ZXN0XCIsXG5cdFx0ZGF0YToge1xuXHRcdFx0dHlwZTpcInNwbFJlcVwiLFxuXHRcdFx0ZGF0YUNvbmZpZzogdGhhdC5kYXRhQ29uZmlnXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1wiK3RoYXQuZGF0YUNvbmZpZy5zZW5zb3JzK1wiXSBSZWN2IGVycjogXCIrSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJVcGRhdGVEYXRhOlxcblwiK0pTT04uc3RyaW5naWZ5KGRhdGEuaGVhZGVyLnJlcUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL0xvZ2dlci5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRkYXRhTW9kZWwgPSB0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcblxuXHRcdExvZ2dlci5sb2codGhhdC5nZXREYXRhTW9kZWwoKSk7XG5cblx0XHRjYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhhdCk7IC8vIGJpbmQgY2FsbGJhY2sgd2l0aCBTdGF0dXNcblx0XHRjYWxsYmFjayhkYXRhTW9kZWwpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xufTtcblxuXG4vKipcbiAqIFVwZGF0ZSBpbnRlcm5hbCByb2JvdCBtb2RlbCB3aXRoIHJlY2VpdmVkIGRhdGEgKHZlcnNpb24gMilcbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBkYXRhIHJlY2VpdmVkIGZyb20gRGl5YU5vZGUgYnkgd2Vic29ja2V0XG4gKiBAcmV0dXJuIHtbdHlwZV19XHRcdFtkZXNjcmlwdGlvbl1cbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2MiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgcm9ib3Q7XG5cdHZhciBkYXRhUm9ib3RzID0gZGF0YS5yb2JvdHM7XG5cdHZhciBkYXRhUGFydHMgPSBkYXRhLnBhcnRMaXN0O1xuXG5cdGlmKCF0aGlzLnJvYm90TW9kZWwpXG5cdFx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdC8vIGNvbnNvbGUubG9nKFwiX2dldFJvYm90TW9kZWxGcm9tUmVjdlwiKTtcblx0Ly8gY29uc29sZS5sb2codGhpcy5yb2JvdE1vZGVsKTtcblxuXHRmb3IodmFyIG4gaW4gdGhpcy5yb2JvdE1vZGVsKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cobik7XG5cdFx0dGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzID0ge307IC8vIHJlc2V0IHBhcnRzXG5cdH1cblxuXHRmb3IodmFyIG4gaW4gZGF0YVJvYm90cykge1xuXHRcdGlmKCF0aGlzLnJvYm90TW9kZWxbbl0pXG5cdFx0XHR0aGlzLnJvYm90TW9kZWxbbl09e307XG5cdFx0dGhpcy5yb2JvdE1vZGVsW25dLnJvYm90ID0gZGF0YVJvYm90c1tuXS5yb2JvdDtcblxuXHRcdC8vIGlmKHRoaXMucm9ib3RNb2RlbC5sZW5ndGg8ZGF0YS5sZW5ndGgpIHtcblx0XHQvLyBcdHRoaXMucm9ib3RNb2RlbC5wdXNoKHtyb2JvdDogZGF0YVswXS5yb2JvdHN9KTtcblx0XHQvLyB9XG5cblx0XHQvKiogZXh0cmFjdCBwYXJ0cyBpbmZvICoqL1xuXHRcdGlmKGRhdGFSb2JvdHNbbl0gJiYgZGF0YVJvYm90c1tuXS5wYXJ0cykge1xuXHRcdFx0dmFyIHBhcnRzID0gZGF0YVJvYm90c1tuXS5wYXJ0cztcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cyA9IHt9O1xuXHRcdFx0dmFyIHJQYXJ0cyA9IHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cztcblx0XHRcdC8vIGZvcih2YXIgcSBpbiByUGFydHMpIHtcblx0XHRcdC8vIFx0LyoqIHBhcnRbcV0gd2FzIG5vdCBzZW50IGJlY2F1c2Ugbm8gZXJyb3IgKiovXG5cdFx0XHQvLyBcdGlmKCFwYXJ0c1txXVxuXHRcdFx0Ly8gXHQgICAmJnJQYXJ0c1txXS5ldnRzJiZyUGFydHNbcV0uZXZ0cy5jb2RlKSB7XG5cdFx0XHQvLyBcdFx0clBhcnRzW3FdLmV2dHMgPSB7XG5cdFx0XHQvLyBcdFx0XHRjb2RlOiAwLFxuXHRcdFx0Ly8gXHRcdFx0Y29kZVJlZjogMCxcblx0XHRcdC8vIFx0XHRcdHRpbWU6IERhdGUubm93KCkgLyoqIHVwZGF0ZSAqKi9cblx0XHRcdC8vIFx0XHR9O1xuXHRcdFx0Ly8gXHR9XG5cdFx0XHQvLyB9XG5cdFx0XHRmb3IgKHZhciBwIGluIHBhcnRzKSB7XG5cdFx0XHRcdGlmKCFyUGFydHNbcF0pIHtcblx0XHRcdFx0XHRyUGFydHNbcF09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocGFydHNbcF0pIHtcblx0XHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGNhdGVnb3J5ICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmNhdGVnb3J5PWRhdGFQYXJ0c1twXS5jYXRlZ29yeTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBuYW1lICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLm5hbWU9ZGF0YVBhcnRzW3BdLm5hbWU7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbGFiZWwgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubGFiZWw9ZGF0YVBhcnRzW3BdLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciB0aW1lICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0pO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy50aW1lKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0udGltZSk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLmNvZGUpO1xuXG5cdFx0XHRcdFx0LyoqIHVwZGF0ZSBlcnJvckxpc3QgKiovXG5cdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3QpXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0PXt9O1xuXHRcdFx0XHRcdGZvciggdmFyIGVsIGluIGRhdGFQYXJ0c1twXS5lcnJvckxpc3QgKVxuXHRcdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3RbZWxdKVxuXHRcdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0W2VsXSA9IGRhdGFQYXJ0c1twXS5lcnJvckxpc3RbZWxdO1xuXHRcdFx0XHRcdHZhciBldnRzX3RtcCA9IHtcblx0XHRcdFx0XHRcdHRpbWU6IHRoaXMuX2NvZGVyLmZyb20ocGFydHNbcF0udGltZSksXG5cdFx0XHRcdFx0XHRjb2RlOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmNvZGUpLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5jb2RlUmVmKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0LyoqIGlmIHJlY2VpdmVkIGxpc3Qgb2YgZXZlbnRzICoqL1xuXHRcdFx0XHRcdGlmKEFycmF5LmlzQXJyYXkoZXZ0c190bXAuY29kZSkgfHwgQXJyYXkuaXNBcnJheShldnRzX3RtcC50aW1lKVxuXHRcdFx0XHRcdCAgIHx8IEFycmF5LmlzQXJyYXkoZXZ0c190bXAuY29kZVJlZikpIHtcblx0XHRcdFx0XHRcdGlmKGV2dHNfdG1wLmNvZGUubGVuZ3RoID09PSBldnRzX3RtcC5jb2RlUmVmLmxlbmd0aFxuXHRcdFx0XHRcdFx0ICAgJiYgZXZ0c190bXAuY29kZS5sZW5ndGggPT09IGV2dHNfdG1wLnRpbWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdC8qKiBidWlsZCBsaXN0IG9mIGV2ZW50cyAqKi9cblx0XHRcdFx0XHRcdFx0clBhcnRzW3BdLmV2dHMgPSBbXTtcblx0XHRcdFx0XHRcdFx0Zm9yKHZhciBpPTA7IGk8ZXZ0c190bXAuY29kZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0dGltZTogZXZ0c190bXAudGltZVtpXSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvZGU6IGV2dHNfdG1wLmNvZGVbaV0sXG5cdFx0XHRcdFx0XHRcdFx0XHRjb2RlUmVmOiBldnRzX3RtcC5jb2RlUmVmW2ldfSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgTG9nZ2VyLmVycm9yKFwiU3RhdHVzOkluY29uc2lzdGFudCBsZW5ndGhzIG9mIGJ1ZmZlcnMgKHRpbWUvY29kZS9jb2RlUmVmKVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7IC8qKiBqdXN0IGluIGNhc2UsIHRvIHByb3ZpZGUgYmFja3dhcmQgY29tcGF0aWJpbGl0eSAqKi9cblx0XHRcdFx0XHRcdC8qKiBzZXQgcmVjZWl2ZWQgZXZlbnQgKiovXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXZ0cyA9IFt7XG5cdFx0XHRcdFx0XHRcdHRpbWU6IGV2dHNfdG1wLnRpbWUsXG5cdFx0XHRcdFx0XHRcdGNvZGU6IGV2dHNfdG1wLmNvZGUsXG5cdFx0XHRcdFx0XHRcdGNvZGVSZWY6IGV2dHNfdG1wLmNvZGVSZWZ9XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gY29uc29sZS5sb2coclBhcnRzW3BdLmVycm9yKTtcblx0XHRcdH1cblx0XHRcdC8vIGNvbnNvbGUubG9nKCdwYXJ0cywgclBhcnRzJyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0cyk7XG4gXHRcdC8vIFx0Y29uc29sZS5sb2coclBhcnRzKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJObyBwYXJ0cyB0byByZWFkIGZvciByb2JvdCBcIitkYXRhW25dLm5hbWUpO1xuXHRcdH1cblx0fVxufTtcblxuXG4vKipcbiAqIFVwZGF0ZSBpbnRlcm5hbCByb2JvdCBtb2RlbCB3aXRoIHJlY2VpdmVkIGRhdGFcbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBkYXRhIHJlY2VpdmVkIGZyb20gRGl5YU5vZGUgYnkgd2Vic29ja2V0XG4gKiBAcmV0dXJuIHtbdHlwZV19XHRcdFtkZXNjcmlwdGlvbl1cbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciByb2JvdDtcblxuXHRpZighdGhpcy5yb2JvdE1vZGVsKVxuXHRcdHRoaXMucm9ib3RNb2RlbCA9IFtdO1xuXHQvLyBjb25zb2xlLmxvZyhcIl9nZXRSb2JvdE1vZGVsRnJvbVJlY3ZcIik7XG5cdC8vIGNvbnNvbGUubG9nKHRoaXMucm9ib3RNb2RlbCk7XG5cblx0LyoqIE9ubHkgb25lIHJvYm90IGlzIG1hbmFnZSBhdCB0aGUgc2FtZSB0aW1lIGN1cnJlbnRseSAqKi9cblx0Zm9yKHZhciBuIGluIGRhdGEpIHtcblx0XHRpZighdGhpcy5yb2JvdE1vZGVsW25dKVxuXHRcdFx0dGhpcy5yb2JvdE1vZGVsW25dPXt9O1xuXHRcdHRoaXMucm9ib3RNb2RlbFtuXS5yb2JvdCA9IGRhdGFbbl0ucm9ib3Q7XG5cblx0XHQvLyBpZih0aGlzLnJvYm90TW9kZWwubGVuZ3RoPGRhdGEubGVuZ3RoKSB7XG5cdFx0Ly8gXHR0aGlzLnJvYm90TW9kZWwucHVzaCh7cm9ib3Q6IGRhdGFbMF0ucm9ib3RzfSk7XG5cdFx0Ly8gfVxuXG5cdFx0LyoqIGV4dHJhY3QgcGFydHMgaW5mbyAqKi9cblx0XHRpZihkYXRhW25dICYmIGRhdGFbbl0ucGFydHMpIHtcblx0XHRcdGlmKCF0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMpXG5cdFx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cyA9IHt9O1xuXHRcdFx0dmFyIHBhcnRzID0gZGF0YVtuXS5wYXJ0cztcblx0XHRcdHZhciByUGFydHMgPSB0aGlzLnJvYm90TW9kZWxbbl0ucGFydHM7XG5cdFx0XHRmb3IodmFyIHEgaW4gclBhcnRzKSB7XG5cdFx0XHRcdC8qKiBwYXJ0W3FdIHdhcyBub3Qgc2VudCBiZWNhdXNlIG5vIGVycm9yICoqL1xuXHRcdFx0XHRpZighcGFydHNbcV1cblx0XHRcdFx0ICAgJiZyUGFydHNbcV0uZXZ0cyYmclBhcnRzW3FdLmV2dHMuY29kZSkge1xuXHRcdFx0XHRcdHJQYXJ0c1txXS5ldnRzID0ge1xuXHRcdFx0XHRcdFx0Y29kZTogWzBdLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogWzBdLFxuXHRcdFx0XHRcdFx0dGltZTogW0RhdGUubm93KCldIC8qKiB1cGRhdGUgKiovXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgcCBpbiBwYXJ0cykge1xuXHRcdFx0XHRpZihwYXJ0c1twXSYmcGFydHNbcF0uZXJyICYmIHBhcnRzW3BdLmVyci5zdD4wKSB7XG5cdFx0XHRcdFx0TG9nZ2VyLmVycm9yKFwiUGFydHMgXCIrcCtcIiB3YXMgaW4gZXJyb3I6IFwiK2RhdGFbcF0uZXJyLm1zZyk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoIXJQYXJ0c1twXSkge1xuXHRcdFx0XHRcdHJQYXJ0c1twXT17fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihwYXJ0c1twXSkge1xuXHRcdFx0XHRcdC8vIExvZ2dlci5sb2cobik7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgY2F0ZWdvcnkgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0uY2F0ZWdvcnk9cGFydHNbcF0uY2F0ZWdvcnk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbmFtZSAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5uYW1lPXBhcnRzW3BdLm5hbWU7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbGFiZWwgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubGFiZWw9cGFydHNbcF0ubGFiZWw7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yIHRpbWUgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLnRpbWUpO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS50aW1lKTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZXJyb3IgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXS5lcnJvcnMuY29kZSk7XG5cblx0XHRcdFx0XHQvKiogdXBkYXRlIGVycm9yTGlzdCAqKi9cblx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdClcblx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3Q9e307XG5cdFx0XHRcdFx0Zm9yKCB2YXIgZWwgaW4gcGFydHNbcF0uZXJyb3JMaXN0IClcblx0XHRcdFx0XHRcdGlmKCFyUGFydHNbcF0uZXJyb3JMaXN0W2VsXSlcblx0XHRcdFx0XHRcdFx0clBhcnRzW3BdLmVycm9yTGlzdFtlbF0gPSBwYXJ0c1twXS5lcnJvckxpc3RbZWxdO1xuXG5cdFx0XHRcdFx0clBhcnRzW3BdLmV2dHMgPSB7XG5cdFx0XHRcdFx0XHRjb2RlOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmV2dHMuY29kZSksXG5cdFx0XHRcdFx0XHRjb2RlUmVmOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmV2dHMuY29kZVJlZiksXG5cdFx0XHRcdFx0XHR0aW1lOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmV2dHMudGltZSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS5lcnJvcik7XG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZygncGFydHMsIHJQYXJ0cycpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHMpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coclBhcnRzKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJObyBwYXJ0cyB0byByZWFkIGZvciByb2JvdCBcIitkYXRhW25dLm5hbWUpO1xuXHRcdH1cblx0fVxufTtcblxuLyoqIGNyZWF0ZSBTdGF0dXMgc2VydmljZSAqKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuU3RhdHVzID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIG5ldyBTdGF0dXModGhpcyk7XG59O1xuXG4vKipcbiAqIFNldCBvbiBzdGF0dXNcbiAqIEBwYXJhbSByb2JvdE5hbWUgdG8gZmluZCBzdGF0dXMgdG8gbW9kaWZ5XG4gKiBAcGFyYW0gcGFydE5hbWUgXHR0byBmaW5kIHN0YXR1cyB0byBtb2RpZnlcbiAqIEBwYXJhbSBjb2RlXHRcdG5ld0NvZGVcbiAqIEBwYXJhbSBzb3VyY2VcdFx0c291cmNlXG4gKiBAcGFyYW0gY2FsbGJhY2tcdFx0cmV0dXJuIGNhbGxiYWNrICg8Ym9vbD5zdWNjZXNzKVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnNldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNvZGUsIHNvdXJjZSwgY2FsbGJhY2spIHtcblx0dmFyIGZ1bmNOYW1lID0gXCJTZXRTdGF0dXNfXCIrcGFydE5hbWU7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6ZnVuY05hbWUsZGF0YToge3JvYm90TmFtZTogcm9ib3ROYW1lLCBzdGF0dXNDb2RlOiBjb2RlLCBwYXJ0TmFtZTogcGFydE5hbWUsIHNvdXJjZTogc291cmNlfDF9fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjayh0cnVlKTtcblx0XHRcdH1cblx0XHR9KTtcbn07XG5cbi8qKlxuICogR2V0IG9uZSBzdGF0dXNcbiAqIEBwYXJhbSByb2JvdE5hbWUgdG8gZ2V0IHN0YXR1c1xuICogQHBhcmFtIHBhcnROYW1lIFx0dG8gZ2V0IHN0YXR1c1xuICogQHBhcmFtIGNhbGxiYWNrXHRcdHJldHVybiBjYWxsYmFjaygtMSBpZiBub3QgZm91bmQvZGF0YSBvdGhlcndpc2UpXG4gKiBAcGFyYW0gX2Z1bGwgXHRtb3JlIGRhdGEgYWJvdXQgc3RhdHVzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZ2V0U3RhdHVzID0gZnVuY3Rpb24ocm9ib3ROYW1lLCBwYXJ0TmFtZSwgY2FsbGJhY2ssIF9mdWxsKSB7XG5cdHZhciBmdWxsPV9mdWxsfHxmYWxzZTtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlOlwic3RhdHVzXCIsZnVuYzpcIkdldFN0YXR1c1wiLGRhdGE6IHtyb2JvdE5hbWU6IHJvYm90TmFtZSwgcGFydE5hbWU6IHBhcnROYW1lLCBmdWxsOiBmdWxsfX0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKC0xKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2soZGF0YSk7XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuIiwiLyogbWF5YS1jbGllbnRcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqXHQzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjaGFubmVsIGVuY29kaW5nXG4gKiAtIGJhc2U2NCBjb2RpbmdcbiAqIC0gbm9uZVxuICogRGF0YSBmb3JtYXQgOlxuICpcdFx0dDogeydiNjQnLCdub25lJ31cbiAqXHRcdGI6IDxpZiBiNjQ+IHs0LDh9XG4gKlx0XHRkOiBlbmNvZGVkIGRhdGEge2J1ZmZlciBvciBBcnJheX1cbiAqXHRcdHM6IHNpemVcbiAqL1xuXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZS02NCcpO1xuXG4vKipcbiAqIERlZmF1bHQgOiBubyBlbmNvZGluZ1xuICogKi9cbmZ1bmN0aW9uIE5vQ29kaW5nKCl7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qXG4qL1xuTm9Db2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKGRhdGEuZCA9PT0gJ251bWJlcicgfHwgQXJyYXkuaXNBcnJheShkYXRhLmQpKVxuXHRcdHJldHVybiBkYXRhLmQ7XG5cdGVsc2Vcblx0XHRyZXR1cm4gZGF0YTtcbn07XG5cbi8qKlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5KSB7XG5cdHJldHVybiB7XG5cdFx0dDogJ25vJywgLyogdHlwZSAqL1xuXHRcdGQ6IGFycmF5LCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoXG5cdH07XG59O1xuXG5cblxuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgYmFzZTY0IGVuY29kaW5nXG4gKiBFZmZlY3RpdmUgZm9yIHN0cmluZyBiYXNlZCBjaGFubmVscyAobGlrZSBKU09OIGJhc2VkIFdTKVxuICogKi9cbmZ1bmN0aW9uIEJhc2U2NENvZGluZygpe1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgICBVdGlsaXR5IGZ1bmN0aW9ucyAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qXFxcbiB8KnxcbiB8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcbiB8KnxcbiB8KnwgIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvRMOpY29kZXJfZW5jb2Rlcl9lbl9iYXNlNjRcbiB8KnxcbiBcXCovXG4vKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cbnZhciBiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0bkNociAtIDY1XG5cdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0bkNociAtIDcxXG5cdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRuQ2hyICsgNFxuXHRcdDogbkNociA9PT0gNDMgP1xuXHRcdDYyXG5cdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0NjNcblx0XHQ6XHQwO1xufTtcblxuLyoqXG4gKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjRcdFx0YmFzZTY0IGNvZGVkIHN0cmluZ1xuICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9XHRcdFx0XHR0YWIgb2YgZGVjb2RlZCBieXRlc1xuICovXG52YXIgYmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHR2YXJcblx0c0I2NEVuYyA9IHNCYXNlNjQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csIFwiXCIpLCBuSW5MZW4gPSBzQjY0RW5jLmxlbmd0aCxcblx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRmb3IgKHZhciBuTW9kMywgbk1vZDQsIG5VaW50MjQgPSAwLCBuT3V0SWR4ID0gMCwgbkluSWR4ID0gMDsgbkluSWR4IDwgbkluTGVuOyBuSW5JZHgrKykge1xuXHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0aWYgKG5Nb2Q0ID09PSAzIHx8IG5JbkxlbiAtIG5JbklkeCA9PT0gMSkge1xuXHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0fVxuXHRcdFx0blVpbnQyNCA9IDA7XG5cdFx0fVxuXHR9XG5cdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdHJldHVybiBidWZmZXI7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgIEludGVyZmFjZSBmdW5jdGlvbnMgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4qIENvbnZlcnQgYnVmZmVyIGNvZGVkIGluIGJhc2U2NCBhbmQgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5XG4qIGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBhcnJheVxuKiBAcGFyYW0gYnVmZmVyIGluIGJhc2U2NFxuKiBAcGFyYW0gYnl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggbnVtYmVyICg0IG9yIDgpXG4qIEByZXR1cm4gYXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0KS4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdHZhciBieXRlQ29kaW5nID0gZGF0YS5iO1xuXG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyogZGVjb2RlIGRhdGEgdG8gYXJyYXkgb2YgYnl0ZSAqL1xuXHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YS5kLCBkYXRhLmIpO1xuXHQvKiBwYXJzZSBkYXRhIHRvIGZsb2F0IGFycmF5ICovXG5cdHZhciBmQXJyYXk9bnVsbDtcblx0c3dpdGNoKGRhdGEuYikge1xuXHRjYXNlIDQ6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0NjRBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRkZWZhdWx0OlxuXHRcdGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBieXRlQ29kaW5nISBTaG91bGQgbm90IGhhcHBlbiEhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qIHBhcnNlIGZBcnJheSBpbnRvIG5vcm1hbCBhcnJheSAqL1xuXHR2YXIgdGFiID0gW10uc2xpY2UuY2FsbChmQXJyYXkpO1xuXG5cdGlmKGRhdGEucyAhPT0gdGFiLmxlbmd0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCB3aGVuIGRlY29kaW5nICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRhYjtcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGFycmF5IGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieSBieXRlQ29kaW5nIGJ5dGVzIGludG8gYnVmZmVyIGNvZGVkIGluIGJhc2U2NFxuKiBAcGFyYW0gXHR7QXJyYXk8RmxvYXQ+fSBcdGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCBiaXRzKVxuKiBAcGFyYW0gXHR7aW50ZWdlcn0gXHRieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBmbG9hdCAoNCBvciA4KVxuKiBAcmV0dXJuICBcdHtTdHJpbmd9IFx0YnVmZmVyIGluIGJhc2U2NC4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIGJ5dGVDb2RpbmcpIHtcblx0LyogY2hlY2sgYnl0ZSBjb2RpbmcgKi9cblx0aWYoYnl0ZUNvZGluZyAhPT0gNCAmJiBieXRlQ29kaW5nICE9PSA4KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKioqIGNhc2UgQXJyYXlCdWZmZXIgKioqL1xuXHR2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGFycmF5Lmxlbmd0aCpieXRlQ29kaW5nKTtcblx0c3dpdGNoKGJ5dGVDb2RpbmcpIHtcblx0Y2FzZSA0OlxuXHRcdHZhciBidWYzMiA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKTtcblx0XHRidWYzMi5zZXQoYXJyYXkpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0dmFyIGJ1ZjY0ID0gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuXHRcdGJ1ZjY0LnNldChhcnJheSk7XG5cdFx0YnJlYWs7XG5cdH1cblx0dmFyIGJ1ZmZDaGFyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblx0dmFyIGJ1ZmZDaGFyQ29kZWQgPSBuZXcgQXJyYXkoYnVmZkNoYXIubGVuZ3RoKTtcblx0Zm9yKHZhciBuID0wOyBuPGJ1ZmZDaGFyLmxlbmd0aDsgbisrKSB7XG5cdFx0YnVmZkNoYXJDb2RlZFtuXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZkNoYXJbbl0pO1xuXHR9XG5cdHZhciBzdHIgPSBuZXcgU3RyaW5nKGJ1ZmZDaGFyQ29kZWQuam9pbignJykpO1xuXHR2YXIgYjY0QnVmZiA9IGJhc2U2NC5lbmNvZGUoc3RyKTtcblx0cmV0dXJuIHtcblx0XHR0OiAnYjY0JywgLyogdHlwZSAqL1xuXHRcdGI6IGJ5dGVDb2RpbmcsIC8qIGJ5dGVDb2RpbmcgKi9cblx0XHRkOiBiNjRCdWZmLCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoIC8qIHNpemUgKi9cblx0fTtcbn07XG5cblxuXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjb21tIGVuY29kaW5nXG4gKiAqL1xuZnVuY3Rpb24gQ29kaW5nSGFuZGxlcigpe1xuXHR0aGlzLmI2NCA9IG5ldyBCYXNlNjRDb2RpbmcoKTtcblx0dGhpcy5ub25lID0gbmV3IE5vQ29kaW5nKCk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKHR5cGVvZiBkYXRhID09ICd1bmRlZmluZWQnIHx8IGRhdGE9PW51bGwpXG5cdFx0cmV0dXJuIG51bGw7XG5cdHN3aXRjaChkYXRhLnQpIHtcblx0Y2FzZSAnYjY0Jzpcblx0XHRyZXR1cm4gdGhpcy5iNjQuZnJvbShkYXRhKTtcblx0ZGVmYXVsdDpcblx0XHRyZXR1cm4gdGhpcy5ub25lLmZyb20oZGF0YSk7XG5cdH1cbn07XG5cblxuQ29kaW5nSGFuZGxlci5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihhcnJheSwgdHlwZSwgYnl0ZUNvZGluZykge1xuXHRpZih0eXBlb2YgYXJyYXkgPT09ICdudW1iZXInKSB7XG5cdFx0YXJyYXk9W2FycmF5XTtcblx0fVxuXHRpZighQXJyYXkuaXNBcnJheShhcnJheSkpe1xuXHRcdGNvbnNvbGUubG9nKFwiQ29kaW5nSGFuZGxlci50byBvbmx5IGFjY2VwdHMgYXJyYXkgIVwiKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHN3aXRjaCh0eXBlKSB7XG5cdGNhc2UgJ2I2NCc6XG5cdFx0cmV0dXJuIHRoaXMuYjY0LnRvKGFycmF5LCBieXRlQ29kaW5nKTtcblx0Y2FzZSAnbm8nOlxuXHRkZWZhdWx0OlxuXHRcdHJldHVybiB0aGlzLm5vbmUudG8oYXJyYXkpO1xuXHR9XG59O1xuXG5cbi8qKiBBZGQgYmFzZTY0IGhhbmRsZXIgdG8gRGl5YVNlbGVjdG9yICoqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbmV3IENvZGluZ0hhbmRsZXIoKTtcbn07XG4iXX0=
