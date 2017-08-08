!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.d1=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9kZWJ1Zy9zcmMvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcbmV4cG9ydHMuc3RvcmFnZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWVcbiAgICAgICAgICAgICAgICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWUuc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgPyBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICAgICAgICAgICAgICAgICAgOiBsb2NhbHN0b3JhZ2UoKTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxuZXhwb3J0cy5jb2xvcnMgPSBbXG4gICdsaWdodHNlYWdyZWVuJyxcbiAgJ2ZvcmVzdGdyZWVuJyxcbiAgJ2dvbGRlbnJvZCcsXG4gICdkb2RnZXJibHVlJyxcbiAgJ2RhcmtvcmNoaWQnLFxuICAnY3JpbXNvbidcbl07XG5cbi8qKlxuICogQ3VycmVudGx5IG9ubHkgV2ViS2l0LWJhc2VkIFdlYiBJbnNwZWN0b3JzLCBGaXJlZm94ID49IHYzMSxcbiAqIGFuZCB0aGUgRmlyZWJ1ZyBleHRlbnNpb24gKGFueSBGaXJlZm94IHZlcnNpb24pIGFyZSBrbm93blxuICogdG8gc3VwcG9ydCBcIiVjXCIgQ1NTIGN1c3RvbWl6YXRpb25zLlxuICpcbiAqIFRPRE86IGFkZCBhIGBsb2NhbFN0b3JhZ2VgIHZhcmlhYmxlIHRvIGV4cGxpY2l0bHkgZW5hYmxlL2Rpc2FibGUgY29sb3JzXG4gKi9cblxuZnVuY3Rpb24gdXNlQ29sb3JzKCkge1xuICAvLyBOQjogSW4gYW4gRWxlY3Ryb24gcHJlbG9hZCBzY3JpcHQsIGRvY3VtZW50IHdpbGwgYmUgZGVmaW5lZCBidXQgbm90IGZ1bGx5XG4gIC8vIGluaXRpYWxpemVkLiBTaW5jZSB3ZSBrbm93IHdlJ3JlIGluIENocm9tZSwgd2UnbGwganVzdCBkZXRlY3QgdGhpcyBjYXNlXG4gIC8vIGV4cGxpY2l0bHlcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wcm9jZXNzICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iXX0=
},{"./debug":2,"_process":5}],2:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":3}],3:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
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

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require('debug')('diya-sdk:DiyaNode');
var debugInput = require('debug')('diya-sdk:DiyaNode:msg:in');
var debugOutput = require('debug')('diya-sdk:DiyaNode:msg:out');

var EventEmitter = require('node-event-emitter');

var DiyaNode = function (_EventEmitter) {
	_inherits(DiyaNode, _EventEmitter);

	function DiyaNode(addr) {
		_classCallCheck(this, DiyaNode);

		var _this = _possibleConstructorReturn(this, (DiyaNode.__proto__ || Object.getPrototypeOf(DiyaNode)).call(this));

		_this._addr = addr;
		_this._socket = new WebSocket(addr);
		_this._socket.addEventListener('open', function (evt) {
			return _this._onOpen(evt);
		});
		_this._socket.addEventListener('close', function (evt) {
			return _this._onClose(evt);
		});
		_this._socket.addEventListener('error', function (evt) {
			return _this._onError(evt);
		});
		_this._socket.addEventListener('message', function (evt) {
			return _this._onMessage(evt);
		});

		_this._msgCallbacks = new Map();
		_this._msgCount = 1;
		return _this;
	}

	////////////////////////////////////////////////////
	///////////////// DiyaNode API /////////////////////
	////////////////////////////////////////////////////

	_createClass(DiyaNode, [{
		key: 'request',
		value: function request(params, target, callback) {
			var _this2 = this;

			params.type = 'Request';

			var id = this._sendToPeer(params, target, function (data) {
				_this2._clearMessage(id);

				if (typeof callback === 'function') {
					callback(data);
				}
			});
		}
	}, {
		key: 'subscribe',
		value: function subscribe(params, target, callback) {
			params.type = 'Subscription';

			var id = this._sendToPeer(params, target, function (data) {
				if (typeof callback === 'function') {
					callback(data);
				}
			});

			return { target: target, id: id };
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(handle) {
			this._send({
				target: handle.target,
				subId: handle.id,
				type: 'Unsubscribe'
			});

			this._clearMessage(handle.id);
		}

		////////////////////////////////////////////////////
		/////////////// Socket events //////////////////////
		////////////////////////////////////////////////////

	}, {
		key: '_onOpen',
		value: function _onOpen() {
			debug('socket opened !');
		}
	}, {
		key: '_onClose',
		value: function _onClose() {
			debug('socket closed !');

			this.emit('close');
		}
	}, {
		key: '_onError',
		value: function _onError(err) {
			debug(err);
		}
	}, {
		key: '_onMessage',
		value: function _onMessage(evt) {
			debugInput(evt.data);
			var message = void 0;
			try {
				message = JSON.parse(evt.data);
			} catch (e) {
				return;
			}

			switch (message.type) {
				case "Handshake":
					this._handleHandshake(message);
					break;
				case "Ping":
					this._handlePing(message);
					break;
				case "Answer":
					this._handleAnswer(message);
					break;
			}
		}

		/////////////////////////////////////////////////////////
		////////////// Handling received message ////////////////
		/////////////////////////////////////////////////////////

	}, {
		key: '_handleHandshake',
		value: function _handleHandshake(message) {
			if (!Array.isArray(message.peers) || !message.peers.every(function (p) {
				return typeof p === 'string';
			}) || typeof message.self !== 'string') {
				this._protocolError(message);
				return;
			}

			this.peers = message.peers;
			this.self = message.self;

			this.emit('open');
		}
	}, {
		key: '_handlePing',
		value: function _handlePing(message) {
			this._send({
				type: 'Pong'
			});
		}
	}, {
		key: '_handleAnswer',
		value: function _handleAnswer(message) {
			if (isNaN(message.id)) {
				this._protocolError(message);
				return;
			}

			var callback = this._msgCallbacks.get(message.id);

			if (typeof callback !== 'function') {
				debug('No callback received for registered message, dropping...');
				return;
			}

			callback(message.data);
		}
	}, {
		key: '_protocolError',
		value: function _protocolError(message) {
			debug('protocol error in received message :');
			debug(message);
			debug("terminating connection...");

			this._socket.close();
		}

		////////////////////////////////////////////////////////////
		/////////////////////// sending messages ///////////////////
		////////////////////////////////////////////////////////////

	}, {
		key: '_sendToPeer',
		value: function _sendToPeer(message, target, callback) {
			if (typeof callback !== 'function') {
				debug('callback must be a function. dropping message...');
				return;
			}

			if (!this.peers.includes(target)) {
				debug('trying to send data to unknown peer ' + target + '. dropping message...');
				return;
			}

			var id = this._msgCount++;
			this._msgCallbacks.set(id, callback);
			message.target = target;
			message.id = id;

			this._send(message);
		}
	}, {
		key: '_clearMessage',
		value: function _clearMessage(id) {
			this._msgCallbacks.delete(id);
		}
	}, {
		key: '_send',
		value: function _send(message) {
			var data = void 0;
			try {
				data = JSON.stringify(message);
			} catch (err) {
				return;
			}

			debugOutput(data);
			this._socket.send(data);
		}
	}]);

	return DiyaNode;
}(EventEmitter);

module.exports = DiyaNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpeWFOb2RlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwicmVxdWlyZSIsImRlYnVnSW5wdXQiLCJkZWJ1Z091dHB1dCIsIkV2ZW50RW1pdHRlciIsIkRpeWFOb2RlIiwiYWRkciIsIl9hZGRyIiwiX3NvY2tldCIsIldlYlNvY2tldCIsImFkZEV2ZW50TGlzdGVuZXIiLCJfb25PcGVuIiwiZXZ0IiwiX29uQ2xvc2UiLCJfb25FcnJvciIsIl9vbk1lc3NhZ2UiLCJfbXNnQ2FsbGJhY2tzIiwiTWFwIiwiX21zZ0NvdW50IiwicGFyYW1zIiwidGFyZ2V0IiwiY2FsbGJhY2siLCJ0eXBlIiwiaWQiLCJfc2VuZFRvUGVlciIsIl9jbGVhck1lc3NhZ2UiLCJkYXRhIiwiaGFuZGxlIiwiX3NlbmQiLCJzdWJJZCIsImVtaXQiLCJlcnIiLCJtZXNzYWdlIiwiSlNPTiIsInBhcnNlIiwiZSIsIl9oYW5kbGVIYW5kc2hha2UiLCJfaGFuZGxlUGluZyIsIl9oYW5kbGVBbnN3ZXIiLCJBcnJheSIsImlzQXJyYXkiLCJwZWVycyIsImV2ZXJ5IiwicCIsInNlbGYiLCJfcHJvdG9jb2xFcnJvciIsImlzTmFOIiwiZ2V0IiwiY2xvc2UiLCJpbmNsdWRlcyIsInNldCIsImRlbGV0ZSIsInN0cmluZ2lmeSIsInNlbmQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OztBQUVBLElBQU1BLFFBQVFDLFFBQVMsT0FBVCxFQUFrQixtQkFBbEIsQ0FBZDtBQUNBLElBQU1DLGFBQWFELFFBQVMsT0FBVCxFQUFrQiwwQkFBbEIsQ0FBbkI7QUFDQSxJQUFNRSxjQUFjRixRQUFTLE9BQVQsRUFBa0IsMkJBQWxCLENBQXBCOztBQUVBLElBQU1HLGVBQWVILFFBQVMsb0JBQVQsQ0FBckI7O0lBRU1JLFE7OztBQUNMLG1CQUFhQyxJQUFiLEVBQW1CO0FBQUE7O0FBQUE7O0FBR2xCLFFBQUtDLEtBQUwsR0FBYUQsSUFBYjtBQUNBLFFBQUtFLE9BQUwsR0FBZSxJQUFJQyxTQUFKLENBQWVILElBQWYsQ0FBZjtBQUNBLFFBQUtFLE9BQUwsQ0FBYUUsZ0JBQWIsQ0FBOEIsTUFBOUIsRUFBc0M7QUFBQSxVQUFPLE1BQUtDLE9BQUwsQ0FBY0MsR0FBZCxDQUFQO0FBQUEsR0FBdEM7QUFDQSxRQUFLSixPQUFMLENBQWFFLGdCQUFiLENBQThCLE9BQTlCLEVBQXVDO0FBQUEsVUFBTyxNQUFLRyxRQUFMLENBQWVELEdBQWYsQ0FBUDtBQUFBLEdBQXZDO0FBQ0EsUUFBS0osT0FBTCxDQUFhRSxnQkFBYixDQUE4QixPQUE5QixFQUF1QztBQUFBLFVBQU8sTUFBS0ksUUFBTCxDQUFlRixHQUFmLENBQVA7QUFBQSxHQUF2QztBQUNBLFFBQUtKLE9BQUwsQ0FBYUUsZ0JBQWIsQ0FBOEIsU0FBOUIsRUFBeUM7QUFBQSxVQUFPLE1BQUtLLFVBQUwsQ0FBaUJILEdBQWpCLENBQVA7QUFBQSxHQUF6Qzs7QUFFQSxRQUFLSSxhQUFMLEdBQXFCLElBQUlDLEdBQUosRUFBckI7QUFDQSxRQUFLQyxTQUFMLEdBQWlCLENBQWpCO0FBWGtCO0FBWWxCOztBQUdEO0FBQ0E7QUFDQTs7OzswQkFFU0MsTSxFQUFRQyxNLEVBQVFDLFEsRUFBVTtBQUFBOztBQUNsQ0YsVUFBT0csSUFBUCxHQUFjLFNBQWQ7O0FBRUEsT0FBTUMsS0FBSyxLQUFLQyxXQUFMLENBQWtCTCxNQUFsQixFQUEwQkMsTUFBMUIsRUFBa0MsZ0JBQVE7QUFDcEQsV0FBS0ssYUFBTCxDQUFvQkYsRUFBcEI7O0FBRUEsUUFBSSxPQUFPRixRQUFQLEtBQW9CLFVBQXhCLEVBQW9DO0FBQ25DQSxjQUFVSyxJQUFWO0FBQ0E7QUFDRCxJQU5VLENBQVg7QUFPQTs7OzRCQUVVUCxNLEVBQVFDLE0sRUFBUUMsUSxFQUFVO0FBQ3BDRixVQUFPRyxJQUFQLEdBQWMsY0FBZDs7QUFFQSxPQUFNQyxLQUFLLEtBQUtDLFdBQUwsQ0FBa0JMLE1BQWxCLEVBQTBCQyxNQUExQixFQUFrQyxnQkFBUTtBQUNwRCxRQUFJLE9BQU9DLFFBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFDbkNBLGNBQVVLLElBQVY7QUFDQTtBQUNELElBSlUsQ0FBWDs7QUFNQSxVQUFPLEVBQUVOLGNBQUYsRUFBVUcsTUFBVixFQUFQO0FBQ0E7Ozs4QkFFWUksTSxFQUFRO0FBQ3BCLFFBQUtDLEtBQUwsQ0FBWTtBQUNYUixZQUFRTyxPQUFPUCxNQURKO0FBRVhTLFdBQU9GLE9BQU9KLEVBRkg7QUFHWEQsVUFBTTtBQUhLLElBQVo7O0FBTUEsUUFBS0csYUFBTCxDQUFvQkUsT0FBT0osRUFBM0I7QUFDQTs7QUFFRDtBQUNBO0FBQ0E7Ozs7NEJBRVc7QUFDVnZCLFNBQU8saUJBQVA7QUFDQTs7OzZCQUVXO0FBQ1hBLFNBQU8saUJBQVA7O0FBRUEsUUFBSzhCLElBQUwsQ0FBVyxPQUFYO0FBQ0E7OzsyQkFFU0MsRyxFQUFLO0FBQ2QvQixTQUFPK0IsR0FBUDtBQUNBOzs7NkJBRVduQixHLEVBQUs7QUFDaEJWLGNBQVlVLElBQUljLElBQWhCO0FBQ0EsT0FBSU0sZ0JBQUo7QUFDQSxPQUFJO0FBQUVBLGNBQVVDLEtBQUtDLEtBQUwsQ0FBWXRCLElBQUljLElBQWhCLENBQVY7QUFBaUMsSUFBdkMsQ0FBd0MsT0FBT1MsQ0FBUCxFQUFVO0FBQUU7QUFBUTs7QUFFNUQsV0FBUUgsUUFBUVYsSUFBaEI7QUFDQyxTQUFLLFdBQUw7QUFDQyxVQUFLYyxnQkFBTCxDQUF1QkosT0FBdkI7QUFDQTtBQUNELFNBQUssTUFBTDtBQUNDLFVBQUtLLFdBQUwsQ0FBa0JMLE9BQWxCO0FBQ0E7QUFDRCxTQUFLLFFBQUw7QUFDQyxVQUFLTSxhQUFMLENBQW9CTixPQUFwQjtBQUNBO0FBVEY7QUFXQTs7QUFFRDtBQUNBO0FBQ0E7Ozs7bUNBRWtCQSxPLEVBQVM7QUFDMUIsT0FBSSxDQUFDTyxNQUFNQyxPQUFOLENBQWVSLFFBQVFTLEtBQXZCLENBQUQsSUFDQSxDQUFDVCxRQUFRUyxLQUFSLENBQWNDLEtBQWQsQ0FBcUI7QUFBQSxXQUFLLE9BQU9DLENBQVAsS0FBYSxRQUFsQjtBQUFBLElBQXJCLENBREQsSUFFQSxPQUFPWCxRQUFRWSxJQUFmLEtBQXdCLFFBRjVCLEVBRXNDO0FBQ3JDLFNBQUtDLGNBQUwsQ0FBcUJiLE9BQXJCO0FBQ0E7QUFDQTs7QUFFRCxRQUFLUyxLQUFMLEdBQWFULFFBQVFTLEtBQXJCO0FBQ0EsUUFBS0csSUFBTCxHQUFZWixRQUFRWSxJQUFwQjs7QUFFQSxRQUFLZCxJQUFMLENBQVcsTUFBWDtBQUNBOzs7OEJBRVlFLE8sRUFBUztBQUNyQixRQUFLSixLQUFMLENBQVk7QUFDWE4sVUFBTTtBQURLLElBQVo7QUFHQTs7O2dDQUVjVSxPLEVBQVM7QUFDdkIsT0FBSWMsTUFBT2QsUUFBUVQsRUFBZixDQUFKLEVBQXVCO0FBQ3RCLFNBQUtzQixjQUFMLENBQXFCYixPQUFyQjtBQUNBO0FBQ0E7O0FBRUQsT0FBTVgsV0FBVyxLQUFLTCxhQUFMLENBQW1CK0IsR0FBbkIsQ0FBd0JmLFFBQVFULEVBQWhDLENBQWpCOztBQUVBLE9BQUksT0FBT0YsUUFBUCxLQUFvQixVQUF4QixFQUFvQztBQUNuQ3JCLFVBQU8sMERBQVA7QUFDQTtBQUNBOztBQUVEcUIsWUFBVVcsUUFBUU4sSUFBbEI7QUFDQTs7O2lDQUVlTSxPLEVBQVM7QUFDeEJoQztBQUNBQSxTQUFPZ0MsT0FBUDtBQUNBaEMsU0FBTywyQkFBUDs7QUFFQSxRQUFLUSxPQUFMLENBQWF3QyxLQUFiO0FBQ0E7O0FBRUQ7QUFDQTtBQUNBOzs7OzhCQUVhaEIsTyxFQUFTWixNLEVBQVFDLFEsRUFBVTtBQUN2QyxPQUFJLE9BQU9BLFFBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFDbkNyQixVQUFPLGtEQUFQO0FBQ0E7QUFDQTs7QUFFRCxPQUFJLENBQUMsS0FBS3lDLEtBQUwsQ0FBV1EsUUFBWCxDQUFxQjdCLE1BQXJCLENBQUwsRUFBbUM7QUFDbENwQixtREFBOENvQixNQUE5QztBQUNBO0FBQ0E7O0FBRUQsT0FBSUcsS0FBSyxLQUFLTCxTQUFMLEVBQVQ7QUFDQSxRQUFLRixhQUFMLENBQW1Ca0MsR0FBbkIsQ0FBd0IzQixFQUF4QixFQUE0QkYsUUFBNUI7QUFDQVcsV0FBUVosTUFBUixHQUFpQkEsTUFBakI7QUFDQVksV0FBUVQsRUFBUixHQUFhQSxFQUFiOztBQUVBLFFBQUtLLEtBQUwsQ0FBWUksT0FBWjtBQUNBOzs7Z0NBRWNULEUsRUFBSTtBQUNsQixRQUFLUCxhQUFMLENBQW1CbUMsTUFBbkIsQ0FBMkI1QixFQUEzQjtBQUNBOzs7d0JBRU1TLE8sRUFBUztBQUNmLE9BQUlOLGFBQUo7QUFDQSxPQUFJO0FBQUVBLFdBQU9PLEtBQUttQixTQUFMLENBQWdCcEIsT0FBaEIsQ0FBUDtBQUFpQyxJQUF2QyxDQUF3QyxPQUFPRCxHQUFQLEVBQVk7QUFBRTtBQUFROztBQUU5RDVCLGVBQWF1QixJQUFiO0FBQ0EsUUFBS2xCLE9BQUwsQ0FBYTZDLElBQWIsQ0FBbUIzQixJQUFuQjtBQUNBOzs7O0VBM0txQnRCLFk7O0FBOEt2QmtELE9BQU9DLE9BQVAsR0FBaUJsRCxRQUFqQiIsImZpbGUiOiJEaXlhTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5cbmNvbnN0IGRlYnVnID0gcmVxdWlyZSAoJ2RlYnVnJykoJ2RpeWEtc2RrOkRpeWFOb2RlJylcbmNvbnN0IGRlYnVnSW5wdXQgPSByZXF1aXJlICgnZGVidWcnKSgnZGl5YS1zZGs6RGl5YU5vZGU6bXNnOmluJylcbmNvbnN0IGRlYnVnT3V0cHV0ID0gcmVxdWlyZSAoJ2RlYnVnJykoJ2RpeWEtc2RrOkRpeWFOb2RlOm1zZzpvdXQnKVxuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlICgnbm9kZS1ldmVudC1lbWl0dGVyJylcblxuY2xhc3MgRGl5YU5vZGUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXHRjb25zdHJ1Y3RvciAoYWRkcikge1xuXHRcdHN1cGVyICgpXG5cblx0XHR0aGlzLl9hZGRyID0gYWRkclxuXHRcdHRoaXMuX3NvY2tldCA9IG5ldyBXZWJTb2NrZXQgKGFkZHIpXG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCBldnQgPT4gdGhpcy5fb25PcGVuIChldnQpKVxuXHRcdHRoaXMuX3NvY2tldC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGV2dCA9PiB0aGlzLl9vbkNsb3NlIChldnQpKVxuXHRcdHRoaXMuX3NvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGV2dCA9PiB0aGlzLl9vbkVycm9yIChldnQpKVxuXHRcdHRoaXMuX3NvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZXZ0ID0+IHRoaXMuX29uTWVzc2FnZSAoZXZ0KSlcblxuXHRcdHRoaXMuX21zZ0NhbGxiYWNrcyA9IG5ldyBNYXAgKClcblx0XHR0aGlzLl9tc2dDb3VudCA9IDFcblx0fVxuXG5cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vLy8vLy8vLyBEaXlhTm9kZSBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHRyZXF1ZXN0IChwYXJhbXMsIHRhcmdldCwgY2FsbGJhY2spIHtcblx0XHRwYXJhbXMudHlwZSA9ICdSZXF1ZXN0J1xuXG5cdFx0Y29uc3QgaWQgPSB0aGlzLl9zZW5kVG9QZWVyIChwYXJhbXMsIHRhcmdldCwgZGF0YSA9PiB7XG5cdFx0XHR0aGlzLl9jbGVhck1lc3NhZ2UgKGlkKVxuXG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdGNhbGxiYWNrIChkYXRhKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRzdWJzY3JpYmUgKHBhcmFtcywgdGFyZ2V0LCBjYWxsYmFjaykge1xuXHRcdHBhcmFtcy50eXBlID0gJ1N1YnNjcmlwdGlvbidcblxuXHRcdGNvbnN0IGlkID0gdGhpcy5fc2VuZFRvUGVlciAocGFyYW1zLCB0YXJnZXQsIGRhdGEgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRjYWxsYmFjayAoZGF0YSlcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0cmV0dXJuIHsgdGFyZ2V0LCBpZCB9XG5cdH1cblxuXHR1bnN1YnNjcmliZSAoaGFuZGxlKSB7XG5cdFx0dGhpcy5fc2VuZCAoe1xuXHRcdFx0dGFyZ2V0OiBoYW5kbGUudGFyZ2V0LFxuXHRcdFx0c3ViSWQ6IGhhbmRsZS5pZCxcblx0XHRcdHR5cGU6ICdVbnN1YnNjcmliZSdcblx0XHR9KVxuXG5cdFx0dGhpcy5fY2xlYXJNZXNzYWdlIChoYW5kbGUuaWQpXG5cdH1cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vLyBTb2NrZXQgZXZlbnRzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdF9vbk9wZW4gKCkge1xuXHRcdGRlYnVnICgnc29ja2V0IG9wZW5lZCAhJylcblx0fVxuXG5cdF9vbkNsb3NlICgpIHtcblx0XHRkZWJ1ZyAoJ3NvY2tldCBjbG9zZWQgIScpXG5cblx0XHR0aGlzLmVtaXQgKCdjbG9zZScpXG5cdH1cblxuXHRfb25FcnJvciAoZXJyKSB7XG5cdFx0ZGVidWcgKGVycilcblx0fVxuXG5cdF9vbk1lc3NhZ2UgKGV2dCkge1xuXHRcdGRlYnVnSW5wdXQgKGV2dC5kYXRhKVxuXHRcdGxldCBtZXNzYWdlXG5cdFx0dHJ5IHsgbWVzc2FnZSA9IEpTT04ucGFyc2UgKGV2dC5kYXRhKSB9IGNhdGNoIChlKSB7IHJldHVybiB9XG5cblx0XHRzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuXHRcdFx0Y2FzZSBcIkhhbmRzaGFrZVwiOlxuXHRcdFx0XHR0aGlzLl9oYW5kbGVIYW5kc2hha2UgKG1lc3NhZ2UpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIFwiUGluZ1wiOlxuXHRcdFx0XHR0aGlzLl9oYW5kbGVQaW5nIChtZXNzYWdlKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBcIkFuc3dlclwiOlxuXHRcdFx0XHR0aGlzLl9oYW5kbGVBbnN3ZXIgKG1lc3NhZ2UpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHR9XG5cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vIEhhbmRsaW5nIHJlY2VpdmVkIG1lc3NhZ2UgLy8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHRfaGFuZGxlSGFuZHNoYWtlIChtZXNzYWdlKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5IChtZXNzYWdlLnBlZXJzKSBcblx0XHRcdHx8ICFtZXNzYWdlLnBlZXJzLmV2ZXJ5IChwID0+IHR5cGVvZiBwID09PSAnc3RyaW5nJylcblx0XHRcdHx8IHR5cGVvZiBtZXNzYWdlLnNlbGYgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHR0aGlzLl9wcm90b2NvbEVycm9yIChtZXNzYWdlKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0dGhpcy5wZWVycyA9IG1lc3NhZ2UucGVlcnNcblx0XHR0aGlzLnNlbGYgPSBtZXNzYWdlLnNlbGZcblxuXHRcdHRoaXMuZW1pdCAoJ29wZW4nKVxuXHR9XG5cblx0X2hhbmRsZVBpbmcgKG1lc3NhZ2UpIHtcblx0XHR0aGlzLl9zZW5kICh7XG5cdFx0XHR0eXBlOiAnUG9uZydcblx0XHR9KVxuXHR9XG5cblx0X2hhbmRsZUFuc3dlciAobWVzc2FnZSkge1xuXHRcdGlmIChpc05hTiAobWVzc2FnZS5pZCkpe1xuXHRcdFx0dGhpcy5fcHJvdG9jb2xFcnJvciAobWVzc2FnZSlcdFxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgY2FsbGJhY2sgPSB0aGlzLl9tc2dDYWxsYmFja3MuZ2V0IChtZXNzYWdlLmlkKVxuXG5cdFx0aWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0ZGVidWcgKCdObyBjYWxsYmFjayByZWNlaXZlZCBmb3IgcmVnaXN0ZXJlZCBtZXNzYWdlLCBkcm9wcGluZy4uLicpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRjYWxsYmFjayAobWVzc2FnZS5kYXRhKVxuXHR9XG5cblx0X3Byb3RvY29sRXJyb3IgKG1lc3NhZ2UpIHtcblx0XHRkZWJ1ZyAoYHByb3RvY29sIGVycm9yIGluIHJlY2VpdmVkIG1lc3NhZ2UgOmApXG5cdFx0ZGVidWcgKG1lc3NhZ2UpXG5cdFx0ZGVidWcgKFwidGVybWluYXRpbmcgY29ubmVjdGlvbi4uLlwiKVxuXG5cdFx0dGhpcy5fc29ja2V0LmNsb3NlICgpXG5cdH1cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gc2VuZGluZyBtZXNzYWdlcyAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdF9zZW5kVG9QZWVyIChtZXNzYWdlLCB0YXJnZXQsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0ZGVidWcgKCdjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24uIGRyb3BwaW5nIG1lc3NhZ2UuLi4nKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnBlZXJzLmluY2x1ZGVzICh0YXJnZXQpKSB7XG5cdFx0XHRkZWJ1ZyAoYHRyeWluZyB0byBzZW5kIGRhdGEgdG8gdW5rbm93biBwZWVyICR7dGFyZ2V0fS4gZHJvcHBpbmcgbWVzc2FnZS4uLmApXG5cdFx0XHRyZXR1cm4gXG5cdFx0fVxuXG5cdFx0bGV0IGlkID0gdGhpcy5fbXNnQ291bnQgKytcblx0XHR0aGlzLl9tc2dDYWxsYmFja3Muc2V0IChpZCwgY2FsbGJhY2spXG5cdFx0bWVzc2FnZS50YXJnZXQgPSB0YXJnZXRcblx0XHRtZXNzYWdlLmlkID0gaWRcblxuXHRcdHRoaXMuX3NlbmQgKG1lc3NhZ2UpXG5cdH1cblxuXHRfY2xlYXJNZXNzYWdlIChpZCkge1xuXHRcdHRoaXMuX21zZ0NhbGxiYWNrcy5kZWxldGUgKGlkKVxuXHR9XG5cblx0X3NlbmQgKG1lc3NhZ2UpIHtcblx0XHRsZXQgZGF0YVxuXHRcdHRyeSB7IGRhdGEgPSBKU09OLnN0cmluZ2lmeSAobWVzc2FnZSkgfSBjYXRjaCAoZXJyKSB7IHJldHVybiB9XG5cdFx0XG5cdFx0ZGVidWdPdXRwdXQgKGRhdGEpXG5cdFx0dGhpcy5fc29ja2V0LnNlbmQgKGRhdGEpXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaXlhTm9kZVxuIl19
},{"debug":1,"node-event-emitter":4}],7:[function(require,module,exports){
'use strict';

module.exports = {
	DiyaNode: require('./DiyaNode')
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRpeWEtc2RrLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJEaXlhTm9kZSIsInJlcXVpcmUiXSwibWFwcGluZ3MiOiI7O0FBQUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDaEJDLFdBQVVDLFFBQVEsWUFBUjtBQURNLENBQWpCIiwiZmlsZSI6ImRpeWEtc2RrLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cdERpeWFOb2RlOiByZXF1aXJlKCcuL0RpeWFOb2RlJylcbn1cbiJdfQ==
},{"./DiyaNode":6}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2Jyb3dzZXIuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL21zL2luZGV4LmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL25vZGUtZXZlbnQtZW1pdHRlci9pbmRleC5qcyIsIi9ob21lL3N5bHZtYWhlL3dvcmtzcGFjZS9BcHBzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvRGl5YU5vZGUuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvZGl5YS1zZGsuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJ2xpZ2h0c2VhZ3JlZW4nLFxuICAnZm9yZXN0Z3JlZW4nLFxuICAnZ29sZGVucm9kJyxcbiAgJ2RvZGdlcmJsdWUnLFxuICAnZGFya29yY2hpZCcsXG4gICdjcmltc29uJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcbiAgLy8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2VcbiAgLy8gZXhwbGljaXRseVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaXMgd2Via2l0PyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNjQ1OTYwNi8zNzY3NzNcbiAgLy8gZG9jdW1lbnQgaXMgdW5kZWZpbmVkIGluIHJlYWN0LW5hdGl2ZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0LW5hdGl2ZS9wdWxsLzE2MzJcbiAgcmV0dXJuICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLldlYmtpdEFwcGVhcmFuY2UpIHx8XG4gICAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY29uc29sZSAmJiAod2luZG93LmNvbnNvbGUuZmlyZWJ1ZyB8fCAod2luZG93LmNvbnNvbGUuZXhjZXB0aW9uICYmIHdpbmRvdy5jb25zb2xlLnRhYmxlKSkpIHx8XG4gICAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLykgJiYgcGFyc2VJbnQoUmVnRXhwLiQxLCAxMCkgPj0gMzEpIHx8XG4gICAgLy8gZG91YmxlIGNoZWNrIHdlYmtpdCBpbiB1c2VyQWdlbnQganVzdCBpbiBjYXNlIHdlIGFyZSBpbiBhIHdvcmtlclxuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvYXBwbGV3ZWJraXRcXC8oXFxkKykvKSk7XG59XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odikge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuICdbVW5leHBlY3RlZEpTT05QYXJzZUVycm9yXTogJyArIGVyci5tZXNzYWdlO1xuICB9XG59O1xuXG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG4gIHZhciB1c2VDb2xvcnMgPSB0aGlzLnVzZUNvbG9ycztcblxuICBhcmdzWzBdID0gKHVzZUNvbG9ycyA/ICclYycgOiAnJylcbiAgICArIHRoaXMubmFtZXNwYWNlXG4gICAgKyAodXNlQ29sb3JzID8gJyAlYycgOiAnICcpXG4gICAgKyBhcmdzWzBdXG4gICAgKyAodXNlQ29sb3JzID8gJyVjICcgOiAnICcpXG4gICAgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cbiAgaWYgKCF1c2VDb2xvcnMpIHJldHVybjtcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3Muc3BsaWNlKDEsIDAsIGMsICdjb2xvcjogaW5oZXJpdCcpXG5cbiAgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RDID0gMDtcbiAgYXJnc1swXS5yZXBsYWNlKC8lW2EtekEtWiVdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgaWYgKCclJScgPT09IG1hdGNoKSByZXR1cm47XG4gICAgaW5kZXgrKztcbiAgICBpZiAoJyVjJyA9PT0gbWF0Y2gpIHtcbiAgICAgIC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuICAgICAgLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbiAgICAgIGxhc3RDID0gaW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG59XG5cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9hZCgpIHtcbiAgdmFyIHI7XG4gIHRyeSB7XG4gICAgciA9IGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZztcbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8vIElmIGRlYnVnIGlzbid0IHNldCBpbiBMUywgYW5kIHdlJ3JlIGluIEVsZWN0cm9uLCB0cnkgdG8gbG9hZCAkREVCVUdcbiAgaWYgKCFyICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAnZW52JyBpbiBwcm9jZXNzKSB7XG4gICAgciA9IHByb2Nlc3MuZW52LkRFQlVHO1xuICB9XG5cbiAgcmV0dXJuIHI7XG59XG5cbi8qKlxuICogRW5hYmxlIG5hbWVzcGFjZXMgbGlzdGVkIGluIGBsb2NhbFN0b3JhZ2UuZGVidWdgIGluaXRpYWxseS5cbiAqL1xuXG5leHBvcnRzLmVuYWJsZShsb2FkKCkpO1xuXG4vKipcbiAqIExvY2Fsc3RvcmFnZSBhdHRlbXB0cyB0byByZXR1cm4gdGhlIGxvY2Fsc3RvcmFnZS5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNhZmFyaSB0aHJvd3NcbiAqIHdoZW4gYSB1c2VyIGRpc2FibGVzIGNvb2tpZXMvbG9jYWxzdG9yYWdlXG4gKiBhbmQgeW91IGF0dGVtcHQgdG8gYWNjZXNzIGl0LlxuICpcbiAqIEByZXR1cm4ge0xvY2FsU3RvcmFnZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5a1pXSjFaeTl6Y21NdlluSnZkM05sY2k1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lJdktpcGNiaUFxSUZSb2FYTWdhWE1nZEdobElIZGxZaUJpY205M2MyVnlJR2x0Y0d4bGJXVnVkR0YwYVc5dUlHOW1JR0JrWldKMVp5Z3BZQzVjYmlBcVhHNGdLaUJGZUhCdmMyVWdZR1JsWW5WbktDbGdJR0Z6SUhSb1pTQnRiMlIxYkdVdVhHNGdLaTljYmx4dVpYaHdiM0owY3lBOUlHMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2NtVnhkV2x5WlNnbkxpOWtaV0oxWnljcE8xeHVaWGh3YjNKMGN5NXNiMmNnUFNCc2IyYzdYRzVsZUhCdmNuUnpMbVp2Y20xaGRFRnlaM01nUFNCbWIzSnRZWFJCY21kek8xeHVaWGh3YjNKMGN5NXpZWFpsSUQwZ2MyRjJaVHRjYm1WNGNHOXlkSE11Ykc5aFpDQTlJR3h2WVdRN1hHNWxlSEJ2Y25SekxuVnpaVU52Ykc5eWN5QTlJSFZ6WlVOdmJHOXljenRjYm1WNGNHOXlkSE11YzNSdmNtRm5aU0E5SUNkMWJtUmxabWx1WldRbklDRTlJSFI1Y0dWdlppQmphSEp2YldWY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNZbUlDZDFibVJsWm1sdVpXUW5JQ0U5SUhSNWNHVnZaaUJqYUhKdmJXVXVjM1J2Y21GblpWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQeUJqYUhKdmJXVXVjM1J2Y21GblpTNXNiMk5oYkZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ09pQnNiMk5oYkhOMGIzSmhaMlVvS1R0Y2JseHVMeW9xWEc0Z0tpQkRiMnh2Y25NdVhHNGdLaTljYmx4dVpYaHdiM0owY3k1amIyeHZjbk1nUFNCYlhHNGdJQ2RzYVdkb2RITmxZV2R5WldWdUp5eGNiaUFnSjJadmNtVnpkR2R5WldWdUp5eGNiaUFnSjJkdmJHUmxibkp2WkNjc1hHNGdJQ2RrYjJSblpYSmliSFZsSnl4Y2JpQWdKMlJoY210dmNtTm9hV1FuTEZ4dUlDQW5ZM0pwYlhOdmJpZGNibDA3WEc1Y2JpOHFLbHh1SUNvZ1EzVnljbVZ1ZEd4NUlHOXViSGtnVjJWaVMybDBMV0poYzJWa0lGZGxZaUJKYm5Od1pXTjBiM0p6TENCR2FYSmxabTk0SUQ0OUlIWXpNU3hjYmlBcUlHRnVaQ0IwYUdVZ1JtbHlaV0oxWnlCbGVIUmxibk5wYjI0Z0tHRnVlU0JHYVhKbFptOTRJSFpsY25OcGIyNHBJR0Z5WlNCcmJtOTNibHh1SUNvZ2RHOGdjM1Z3Y0c5eWRDQmNJaVZqWENJZ1ExTlRJR04xYzNSdmJXbDZZWFJwYjI1ekxseHVJQ3BjYmlBcUlGUlBSRTg2SUdGa1pDQmhJR0JzYjJOaGJGTjBiM0poWjJWZ0lIWmhjbWxoWW14bElIUnZJR1Y0Y0d4cFkybDBiSGtnWlc1aFlteGxMMlJwYzJGaWJHVWdZMjlzYjNKelhHNGdLaTljYmx4dVpuVnVZM1JwYjI0Z2RYTmxRMjlzYjNKektDa2dlMXh1SUNBdkx5Qk9Ram9nU1c0Z1lXNGdSV3hsWTNSeWIyNGdjSEpsYkc5aFpDQnpZM0pwY0hRc0lHUnZZM1Z0Wlc1MElIZHBiR3dnWW1VZ1pHVm1hVzVsWkNCaWRYUWdibTkwSUdaMWJHeDVYRzRnSUM4dklHbHVhWFJwWVd4cGVtVmtMaUJUYVc1alpTQjNaU0JyYm05M0lIZGxKM0psSUdsdUlFTm9jbTl0WlN3Z2QyVW5iR3dnYW5WemRDQmtaWFJsWTNRZ2RHaHBjeUJqWVhObFhHNGdJQzh2SUdWNGNHeHBZMmwwYkhsY2JpQWdhV1lnS0hSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUNkMWJtUmxabWx1WldRbklDWW1JSGRwYm1SdmR5NXdjbTlqWlhOeklDWW1JSGRwYm1SdmR5NXdjbTlqWlhOekxuUjVjR1VnUFQwOUlDZHlaVzVrWlhKbGNpY3BJSHRjYmlBZ0lDQnlaWFIxY200Z2RISjFaVHRjYmlBZ2ZWeHVYRzRnSUM4dklHbHpJSGRsWW10cGREOGdhSFIwY0RvdkwzTjBZV05yYjNabGNtWnNiM2N1WTI5dEwyRXZNVFkwTlRrMk1EWXZNemMyTnpjelhHNGdJQzh2SUdSdlkzVnRaVzUwSUdseklIVnVaR1ZtYVc1bFpDQnBiaUJ5WldGamRDMXVZWFJwZG1VNklHaDBkSEJ6T2k4dloybDBhSFZpTG1OdmJTOW1ZV05sWW05dmF5OXlaV0ZqZEMxdVlYUnBkbVV2Y0hWc2JDOHhOak15WEc0Z0lISmxkSFZ5YmlBb2RIbHdaVzltSUdSdlkzVnRaVzUwSUNFOVBTQW5kVzVrWldacGJtVmtKeUFtSmlCa2IyTjFiV1Z1ZEM1a2IyTjFiV1Z1ZEVWc1pXMWxiblFnSmlZZ1pHOWpkVzFsYm5RdVpHOWpkVzFsYm5SRmJHVnRaVzUwTG5OMGVXeGxJQ1ltSUdSdlkzVnRaVzUwTG1SdlkzVnRaVzUwUld4bGJXVnVkQzV6ZEhsc1pTNVhaV0pyYVhSQmNIQmxZWEpoYm1ObEtTQjhmRnh1SUNBZ0lDOHZJR2x6SUdacGNtVmlkV2MvSUdoMGRIQTZMeTl6ZEdGamEyOTJaWEptYkc5M0xtTnZiUzloTHpNNU9ERXlNQzh6TnpZM056TmNiaUFnSUNBb2RIbHdaVzltSUhkcGJtUnZkeUFoUFQwZ0ozVnVaR1ZtYVc1bFpDY2dKaVlnZDJsdVpHOTNMbU52Ym5OdmJHVWdKaVlnS0hkcGJtUnZkeTVqYjI1emIyeGxMbVpwY21WaWRXY2dmSHdnS0hkcGJtUnZkeTVqYjI1emIyeGxMbVY0WTJWd2RHbHZiaUFtSmlCM2FXNWtiM2N1WTI5dWMyOXNaUzUwWVdKc1pTa3BLU0I4ZkZ4dUlDQWdJQzh2SUdseklHWnBjbVZtYjNnZ1BqMGdkak14UDF4dUlDQWdJQzh2SUdoMGRIQnpPaTh2WkdWMlpXeHZjR1Z5TG0xdmVtbHNiR0V1YjNKbkwyVnVMVlZUTDJSdlkzTXZWRzl2YkhNdlYyVmlYME52Ym5OdmJHVWpVM1I1YkdsdVoxOXRaWE56WVdkbGMxeHVJQ0FnSUNoMGVYQmxiMllnYm1GMmFXZGhkRzl5SUNFOVBTQW5kVzVrWldacGJtVmtKeUFtSmlCdVlYWnBaMkYwYjNJdWRYTmxja0ZuWlc1MElDWW1JRzVoZG1sbllYUnZjaTUxYzJWeVFXZGxiblF1ZEc5TWIzZGxja05oYzJVb0tTNXRZWFJqYUNndlptbHlaV1p2ZUZ4Y0x5aGNYR1FyS1M4cElDWW1JSEJoY25ObFNXNTBLRkpsWjBWNGNDNGtNU3dnTVRBcElENDlJRE14S1NCOGZGeHVJQ0FnSUM4dklHUnZkV0pzWlNCamFHVmpheUIzWldKcmFYUWdhVzRnZFhObGNrRm5aVzUwSUdwMWMzUWdhVzRnWTJGelpTQjNaU0JoY21VZ2FXNGdZU0IzYjNKclpYSmNiaUFnSUNBb2RIbHdaVzltSUc1aGRtbG5ZWFJ2Y2lBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NnSmlZZ2JtRjJhV2RoZEc5eUxuVnpaWEpCWjJWdWRDQW1KaUJ1WVhacFoyRjBiM0l1ZFhObGNrRm5aVzUwTG5SdlRHOTNaWEpEWVhObEtDa3ViV0YwWTJnb0wyRndjR3hsZDJWaWEybDBYRnd2S0Z4Y1pDc3BMeWtwTzF4dWZWeHVYRzR2S2lwY2JpQXFJRTFoY0NBbGFpQjBieUJnU2xOUFRpNXpkSEpwYm1kcFpua29LV0FzSUhOcGJtTmxJRzV2SUZkbFlpQkpibk53WldOMGIzSnpJR1J2SUhSb1lYUWdZbmtnWkdWbVlYVnNkQzVjYmlBcUwxeHVYRzVsZUhCdmNuUnpMbVp2Y20xaGRIUmxjbk11YWlBOUlHWjFibU4wYVc5dUtIWXBJSHRjYmlBZ2RISjVJSHRjYmlBZ0lDQnlaWFIxY200Z1NsTlBUaTV6ZEhKcGJtZHBabmtvZGlrN1hHNGdJSDBnWTJGMFkyZ2dLR1Z5Y2lrZ2UxeHVJQ0FnSUhKbGRIVnliaUFuVzFWdVpYaHdaV04wWldSS1UwOU9VR0Z5YzJWRmNuSnZjbDA2SUNjZ0t5Qmxjbkl1YldWemMyRm5aVHRjYmlBZ2ZWeHVmVHRjYmx4dVhHNHZLaXBjYmlBcUlFTnZiRzl5YVhwbElHeHZaeUJoY21kMWJXVnVkSE1nYVdZZ1pXNWhZbXhsWkM1Y2JpQXFYRzRnS2lCQVlYQnBJSEIxWW14cFkxeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlHWnZjbTFoZEVGeVozTW9ZWEpuY3lrZ2UxeHVJQ0IyWVhJZ2RYTmxRMjlzYjNKeklEMGdkR2hwY3k1MWMyVkRiMnh2Y25NN1hHNWNiaUFnWVhKbmMxc3dYU0E5SUNoMWMyVkRiMnh2Y25NZ1B5QW5KV01uSURvZ0p5Y3BYRzRnSUNBZ0t5QjBhR2x6TG01aGJXVnpjR0ZqWlZ4dUlDQWdJQ3NnS0hWelpVTnZiRzl5Y3lBL0lDY2dKV01uSURvZ0p5QW5LVnh1SUNBZ0lDc2dZWEpuYzFzd1hWeHVJQ0FnSUNzZ0tIVnpaVU52Ykc5eWN5QS9JQ2NsWXlBbklEb2dKeUFuS1Z4dUlDQWdJQ3NnSnlzbklDc2daWGh3YjNKMGN5NW9kVzFoYm1sNlpTaDBhR2x6TG1ScFptWXBPMXh1WEc0Z0lHbG1JQ2doZFhObFEyOXNiM0p6S1NCeVpYUjFjbTQ3WEc1Y2JpQWdkbUZ5SUdNZ1BTQW5ZMjlzYjNJNklDY2dLeUIwYUdsekxtTnZiRzl5TzF4dUlDQmhjbWR6TG5Od2JHbGpaU2d4TENBd0xDQmpMQ0FuWTI5c2IzSTZJR2x1YUdWeWFYUW5LVnh1WEc0Z0lDOHZJSFJvWlNCbWFXNWhiQ0JjSWlWalhDSWdhWE1nYzI5dFpYZG9ZWFFnZEhKcFkydDVMQ0JpWldOaGRYTmxJSFJvWlhKbElHTnZkV3hrSUdKbElHOTBhR1Z5WEc0Z0lDOHZJR0Z5WjNWdFpXNTBjeUJ3WVhOelpXUWdaV2wwYUdWeUlHSmxabTl5WlNCdmNpQmhablJsY2lCMGFHVWdKV01zSUhOdklIZGxJRzVsWldRZ2RHOWNiaUFnTHk4Z1ptbG5kWEpsSUc5MWRDQjBhR1VnWTI5eWNtVmpkQ0JwYm1SbGVDQjBieUJwYm5ObGNuUWdkR2hsSUVOVFV5QnBiblJ2WEc0Z0lIWmhjaUJwYm1SbGVDQTlJREE3WEc0Z0lIWmhjaUJzWVhOMFF5QTlJREE3WEc0Z0lHRnlaM05iTUYwdWNtVndiR0ZqWlNndkpWdGhMWHBCTFZvbFhTOW5MQ0JtZFc1amRHbHZiaWh0WVhSamFDa2dlMXh1SUNBZ0lHbG1JQ2duSlNVbklEMDlQU0J0WVhSamFDa2djbVYwZFhKdU8xeHVJQ0FnSUdsdVpHVjRLeXM3WEc0Z0lDQWdhV1lnS0NjbFl5Y2dQVDA5SUcxaGRHTm9LU0I3WEc0Z0lDQWdJQ0F2THlCM1pTQnZibXg1SUdGeVpTQnBiblJsY21WemRHVmtJR2x1SUhSb1pTQXFiR0Z6ZENvZ0pXTmNiaUFnSUNBZ0lDOHZJQ2gwYUdVZ2RYTmxjaUJ0WVhrZ2FHRjJaU0J3Y205MmFXUmxaQ0IwYUdWcGNpQnZkMjRwWEc0Z0lDQWdJQ0JzWVhOMFF5QTlJR2x1WkdWNE8xeHVJQ0FnSUgxY2JpQWdmU2s3WEc1Y2JpQWdZWEpuY3k1emNHeHBZMlVvYkdGemRFTXNJREFzSUdNcE8xeHVmVnh1WEc0dktpcGNiaUFxSUVsdWRtOXJaWE1nWUdOdmJuTnZiR1V1Ykc5bktDbGdJSGRvWlc0Z1lYWmhhV3hoWW14bExseHVJQ29nVG04dGIzQWdkMmhsYmlCZ1kyOXVjMjlzWlM1c2IyZGdJR2x6SUc1dmRDQmhJRndpWm5WdVkzUnBiMjVjSWk1Y2JpQXFYRzRnS2lCQVlYQnBJSEIxWW14cFkxeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlHeHZaeWdwSUh0Y2JpQWdMeThnZEdocGN5Qm9ZV05yWlhKNUlHbHpJSEpsY1hWcGNtVmtJR1p2Y2lCSlJUZ3ZPU3dnZDJobGNtVmNiaUFnTHk4Z2RHaGxJR0JqYjI1emIyeGxMbXh2WjJBZ1puVnVZM1JwYjI0Z1pHOWxjMjRuZENCb1lYWmxJQ2RoY0hCc2VTZGNiaUFnY21WMGRYSnVJQ2R2WW1wbFkzUW5JRDA5UFNCMGVYQmxiMllnWTI5dWMyOXNaVnh1SUNBZ0lDWW1JR052Ym5OdmJHVXViRzluWEc0Z0lDQWdKaVlnUm5WdVkzUnBiMjR1Y0hKdmRHOTBlWEJsTG1Gd2NHeDVMbU5oYkd3b1kyOXVjMjlzWlM1c2IyY3NJR052Ym5OdmJHVXNJR0Z5WjNWdFpXNTBjeWs3WEc1OVhHNWNiaThxS2x4dUlDb2dVMkYyWlNCZ2JtRnRaWE53WVdObGMyQXVYRzRnS2x4dUlDb2dRSEJoY21GdElIdFRkSEpwYm1kOUlHNWhiV1Z6Y0dGalpYTmNiaUFxSUVCaGNHa2djSEpwZG1GMFpWeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlITmhkbVVvYm1GdFpYTndZV05sY3lrZ2UxeHVJQ0IwY25rZ2UxeHVJQ0FnSUdsbUlDaHVkV3hzSUQwOUlHNWhiV1Z6Y0dGalpYTXBJSHRjYmlBZ0lDQWdJR1Y0Y0c5eWRITXVjM1J2Y21GblpTNXlaVzF2ZG1WSmRHVnRLQ2RrWldKMVp5Y3BPMXh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNCbGVIQnZjblJ6TG5OMGIzSmhaMlV1WkdWaWRXY2dQU0J1WVcxbGMzQmhZMlZ6TzF4dUlDQWdJSDFjYmlBZ2ZTQmpZWFJqYUNobEtTQjdmVnh1ZlZ4dVhHNHZLaXBjYmlBcUlFeHZZV1FnWUc1aGJXVnpjR0ZqWlhOZ0xseHVJQ3BjYmlBcUlFQnlaWFIxY200Z2UxTjBjbWx1WjMwZ2NtVjBkWEp1Y3lCMGFHVWdjSEpsZG1sdmRYTnNlU0J3WlhKemFYTjBaV1FnWkdWaWRXY2diVzlrWlhOY2JpQXFJRUJoY0drZ2NISnBkbUYwWlZ4dUlDb3ZYRzVjYm1aMWJtTjBhVzl1SUd4dllXUW9LU0I3WEc0Z0lIWmhjaUJ5TzF4dUlDQjBjbmtnZTF4dUlDQWdJSElnUFNCbGVIQnZjblJ6TG5OMGIzSmhaMlV1WkdWaWRXYzdYRzRnSUgwZ1kyRjBZMmdvWlNrZ2UzMWNibHh1SUNBdkx5QkpaaUJrWldKMVp5QnBjMjRuZENCelpYUWdhVzRnVEZNc0lHRnVaQ0IzWlNkeVpTQnBiaUJGYkdWamRISnZiaXdnZEhKNUlIUnZJR3h2WVdRZ0pFUkZRbFZIWEc0Z0lHbG1JQ2doY2lBbUppQjBlWEJsYjJZZ2NISnZZMlZ6Y3lBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NnSmlZZ0oyVnVkaWNnYVc0Z2NISnZZMlZ6Y3lrZ2UxeHVJQ0FnSUhJZ1BTQndjbTlqWlhOekxtVnVkaTVFUlVKVlJ6dGNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQnlPMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFVnVZV0pzWlNCdVlXMWxjM0JoWTJWeklHeHBjM1JsWkNCcGJpQmdiRzlqWVd4VGRHOXlZV2RsTG1SbFluVm5ZQ0JwYm1sMGFXRnNiSGt1WEc0Z0tpOWNibHh1Wlhod2IzSjBjeTVsYm1GaWJHVW9iRzloWkNncEtUdGNibHh1THlvcVhHNGdLaUJNYjJOaGJITjBiM0poWjJVZ1lYUjBaVzF3ZEhNZ2RHOGdjbVYwZFhKdUlIUm9aU0JzYjJOaGJITjBiM0poWjJVdVhHNGdLbHh1SUNvZ1ZHaHBjeUJwY3lCdVpXTmxjM05oY25rZ1ltVmpZWFZ6WlNCellXWmhjbWtnZEdoeWIzZHpYRzRnS2lCM2FHVnVJR0VnZFhObGNpQmthWE5oWW14bGN5QmpiMjlyYVdWekwyeHZZMkZzYzNSdmNtRm5aVnh1SUNvZ1lXNWtJSGx2ZFNCaGRIUmxiWEIwSUhSdklHRmpZMlZ6Y3lCcGRDNWNiaUFxWEc0Z0tpQkFjbVYwZFhKdUlIdE1iMk5oYkZOMGIzSmhaMlY5WEc0Z0tpQkFZWEJwSUhCeWFYWmhkR1ZjYmlBcUwxeHVYRzVtZFc1amRHbHZiaUJzYjJOaGJITjBiM0poWjJVb0tTQjdYRzRnSUhSeWVTQjdYRzRnSUNBZ2NtVjBkWEp1SUhkcGJtUnZkeTVzYjJOaGJGTjBiM0poWjJVN1hHNGdJSDBnWTJGMFkyZ2dLR1VwSUh0OVhHNTlYRzRpWFgwPSIsIlxuLyoqXG4gKiBUaGlzIGlzIHRoZSBjb21tb24gbG9naWMgZm9yIGJvdGggdGhlIE5vZGUuanMgYW5kIHdlYiBicm93c2VyXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVEZWJ1Zy5kZWJ1ZyA9IGNyZWF0ZURlYnVnWydkZWZhdWx0J10gPSBjcmVhdGVEZWJ1ZztcbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZXhwb3J0cy5kaXNhYmxlID0gZGlzYWJsZTtcbmV4cG9ydHMuZW5hYmxlID0gZW5hYmxlO1xuZXhwb3J0cy5lbmFibGVkID0gZW5hYmxlZDtcbmV4cG9ydHMuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuICovXG5cbmV4cG9ydHMubmFtZXMgPSBbXTtcbmV4cG9ydHMuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBNYXAgb2Ygc3BlY2lhbCBcIiVuXCIgaGFuZGxpbmcgZnVuY3Rpb25zLCBmb3IgdGhlIGRlYnVnIFwiZm9ybWF0XCIgYXJndW1lbnQuXG4gKlxuICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXIgb3IgdXBwZXItY2FzZSBsZXR0ZXIsIGkuZS4gXCJuXCIgYW5kIFwiTlwiLlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycyA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzIGxvZyB0aW1lc3RhbXAuXG4gKi9cblxudmFyIHByZXZUaW1lO1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VsZWN0Q29sb3IobmFtZXNwYWNlKSB7XG4gIHZhciBoYXNoID0gMCwgaTtcblxuICBmb3IgKGkgaW4gbmFtZXNwYWNlKSB7XG4gICAgaGFzaCAgPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIG5hbWVzcGFjZS5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gIH1cblxuICByZXR1cm4gZXhwb3J0cy5jb2xvcnNbTWF0aC5hYnMoaGFzaCkgJSBleHBvcnRzLmNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lc3BhY2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1ZyhuYW1lc3BhY2UpIHtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcblxuICAvLyBlbnYtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gbG9naWMgZm9yIGRlYnVnIGluc3RhbmNlc1xuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGV4cG9ydHMuaW5pdCkge1xuICAgIGV4cG9ydHMuaW5pdChkZWJ1Zyk7XG4gIH1cblxuICByZXR1cm4gZGVidWc7XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgZXhwb3J0cy5uYW1lcyA9IFtdO1xuICBleHBvcnRzLnNraXBzID0gW107XG5cbiAgdmFyIHNwbGl0ID0gKHR5cGVvZiBuYW1lc3BhY2VzID09PSAnc3RyaW5nJyA/IG5hbWVzcGFjZXMgOiAnJykuc3BsaXQoL1tcXHMsXSsvKTtcbiAgdmFyIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZhbClcbiAgKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhcbiAgICBzdHJcbiAgKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCc7XG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICB9XG4gIGlmIChtcyA+PSBtKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncyc7XG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpIHx8XG4gICAgcGx1cmFsKG1zLCBoLCAnaG91cicpIHx8XG4gICAgcGx1cmFsKG1zLCBtLCAnbWludXRlJykgfHxcbiAgICBwbHVyYWwobXMsIHMsICdzZWNvbmQnKSB8fFxuICAgIG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lO1xuICB9XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zXG4gKi9cblxudmFyIHV0aWwgPSB7fTtcblxudXRpbC5pc09iamVjdCA9IGZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG51dGlsLmlzTnVtYmVyID0gZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxudXRpbC5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5cbnV0aWwuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKXtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cblxuLyoqXG4gKiBFdmVudEVtaXR0ZXIgY2xhc3NcbiAqL1xuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF1dGlsLmlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicgJiYgIXRoaXMuX2V2ZW50cy5lcnJvcikge1xuICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICB1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmICh1dGlsLmlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcblxuICAgICAgaWYgKHV0aWwuaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIH1cbiAgICAgIGlmICh1dGlsLmlzRnVuY3Rpb24oY29uc29sZS50cmFjZSkpXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICh1dGlsLmlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAodXRpbC5pc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnZGl5YS1zZGs6RGl5YU5vZGUnKTtcbnZhciBkZWJ1Z0lucHV0ID0gcmVxdWlyZSgnZGVidWcnKSgnZGl5YS1zZGs6RGl5YU5vZGU6bXNnOmluJyk7XG52YXIgZGVidWdPdXRwdXQgPSByZXF1aXJlKCdkZWJ1ZycpKCdkaXlhLXNkazpEaXlhTm9kZTptc2c6b3V0Jyk7XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcblxudmFyIERpeWFOb2RlID0gZnVuY3Rpb24gKF9FdmVudEVtaXR0ZXIpIHtcblx0X2luaGVyaXRzKERpeWFOb2RlLCBfRXZlbnRFbWl0dGVyKTtcblxuXHRmdW5jdGlvbiBEaXlhTm9kZShhZGRyKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIERpeWFOb2RlKTtcblxuXHRcdHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChEaXlhTm9kZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKERpeWFOb2RlKSkuY2FsbCh0aGlzKSk7XG5cblx0XHRfdGhpcy5fYWRkciA9IGFkZHI7XG5cdFx0X3RoaXMuX3NvY2tldCA9IG5ldyBXZWJTb2NrZXQoYWRkcik7XG5cdFx0X3RoaXMuX3NvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgZnVuY3Rpb24gKGV2dCkge1xuXHRcdFx0cmV0dXJuIF90aGlzLl9vbk9wZW4oZXZ0KTtcblx0XHR9KTtcblx0XHRfdGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgZnVuY3Rpb24gKGV2dCkge1xuXHRcdFx0cmV0dXJuIF90aGlzLl9vbkNsb3NlKGV2dCk7XG5cdFx0fSk7XG5cdFx0X3RoaXMuX3NvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChldnQpIHtcblx0XHRcdHJldHVybiBfdGhpcy5fb25FcnJvcihldnQpO1xuXHRcdH0pO1xuXHRcdF90aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldnQpIHtcblx0XHRcdHJldHVybiBfdGhpcy5fb25NZXNzYWdlKGV2dCk7XG5cdFx0fSk7XG5cblx0XHRfdGhpcy5fbXNnQ2FsbGJhY2tzID0gbmV3IE1hcCgpO1xuXHRcdF90aGlzLl9tc2dDb3VudCA9IDE7XG5cdFx0cmV0dXJuIF90aGlzO1xuXHR9XG5cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLy8vLy8vLy8vLy8vLy8vLyBEaXlhTm9kZSBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHRfY3JlYXRlQ2xhc3MoRGl5YU5vZGUsIFt7XG5cdFx0a2V5OiAncmVxdWVzdCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHJlcXVlc3QocGFyYW1zLCB0YXJnZXQsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdFx0cGFyYW1zLnR5cGUgPSAnUmVxdWVzdCc7XG5cblx0XHRcdHZhciBpZCA9IHRoaXMuX3NlbmRUb1BlZXIocGFyYW1zLCB0YXJnZXQsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdF90aGlzMi5fY2xlYXJNZXNzYWdlKGlkKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soZGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ3N1YnNjcmliZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHN1YnNjcmliZShwYXJhbXMsIHRhcmdldCwgY2FsbGJhY2spIHtcblx0XHRcdHBhcmFtcy50eXBlID0gJ1N1YnNjcmlwdGlvbic7XG5cblx0XHRcdHZhciBpZCA9IHRoaXMuX3NlbmRUb1BlZXIocGFyYW1zLCB0YXJnZXQsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRjYWxsYmFjayhkYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB7IHRhcmdldDogdGFyZ2V0LCBpZDogaWQgfTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICd1bnN1YnNjcmliZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGhhbmRsZSkge1xuXHRcdFx0dGhpcy5fc2VuZCh7XG5cdFx0XHRcdHRhcmdldDogaGFuZGxlLnRhcmdldCxcblx0XHRcdFx0c3ViSWQ6IGhhbmRsZS5pZCxcblx0XHRcdFx0dHlwZTogJ1Vuc3Vic2NyaWJlJ1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuX2NsZWFyTWVzc2FnZShoYW5kbGUuaWQpO1xuXHRcdH1cblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLy8gU29ja2V0IGV2ZW50cyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdH0sIHtcblx0XHRrZXk6ICdfb25PcGVuJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gX29uT3BlbigpIHtcblx0XHRcdGRlYnVnKCdzb2NrZXQgb3BlbmVkICEnKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdfb25DbG9zZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9vbkNsb3NlKCkge1xuXHRcdFx0ZGVidWcoJ3NvY2tldCBjbG9zZWQgIScpO1xuXG5cdFx0XHR0aGlzLmVtaXQoJ2Nsb3NlJyk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnX29uRXJyb3InLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBfb25FcnJvcihlcnIpIHtcblx0XHRcdGRlYnVnKGVycik7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnX29uTWVzc2FnZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9vbk1lc3NhZ2UoZXZ0KSB7XG5cdFx0XHRkZWJ1Z0lucHV0KGV2dC5kYXRhKTtcblx0XHRcdHZhciBtZXNzYWdlID0gdm9pZCAwO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0bWVzc2FnZSA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJIYW5kc2hha2VcIjpcblx0XHRcdFx0XHR0aGlzLl9oYW5kbGVIYW5kc2hha2UobWVzc2FnZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJQaW5nXCI6XG5cdFx0XHRcdFx0dGhpcy5faGFuZGxlUGluZyhtZXNzYWdlKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIkFuc3dlclwiOlxuXHRcdFx0XHRcdHRoaXMuX2hhbmRsZUFuc3dlcihtZXNzYWdlKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLyBIYW5kbGluZyByZWNlaXZlZCBtZXNzYWdlIC8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHR9LCB7XG5cdFx0a2V5OiAnX2hhbmRsZUhhbmRzaGFrZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVIYW5kc2hha2UobWVzc2FnZSkge1xuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UucGVlcnMpIHx8ICFtZXNzYWdlLnBlZXJzLmV2ZXJ5KGZ1bmN0aW9uIChwKSB7XG5cdFx0XHRcdHJldHVybiB0eXBlb2YgcCA9PT0gJ3N0cmluZyc7XG5cdFx0XHR9KSB8fCB0eXBlb2YgbWVzc2FnZS5zZWxmICE9PSAnc3RyaW5nJykge1xuXHRcdFx0XHR0aGlzLl9wcm90b2NvbEVycm9yKG1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMucGVlcnMgPSBtZXNzYWdlLnBlZXJzO1xuXHRcdFx0dGhpcy5zZWxmID0gbWVzc2FnZS5zZWxmO1xuXG5cdFx0XHR0aGlzLmVtaXQoJ29wZW4nKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdfaGFuZGxlUGluZycsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVQaW5nKG1lc3NhZ2UpIHtcblx0XHRcdHRoaXMuX3NlbmQoe1xuXHRcdFx0XHR0eXBlOiAnUG9uZydcblx0XHRcdH0pO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ19oYW5kbGVBbnN3ZXInLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBfaGFuZGxlQW5zd2VyKG1lc3NhZ2UpIHtcblx0XHRcdGlmIChpc05hTihtZXNzYWdlLmlkKSkge1xuXHRcdFx0XHR0aGlzLl9wcm90b2NvbEVycm9yKG1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjYWxsYmFjayA9IHRoaXMuX21zZ0NhbGxiYWNrcy5nZXQobWVzc2FnZS5pZCk7XG5cblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0ZGVidWcoJ05vIGNhbGxiYWNrIHJlY2VpdmVkIGZvciByZWdpc3RlcmVkIG1lc3NhZ2UsIGRyb3BwaW5nLi4uJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Y2FsbGJhY2sobWVzc2FnZS5kYXRhKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdfcHJvdG9jb2xFcnJvcicsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9wcm90b2NvbEVycm9yKG1lc3NhZ2UpIHtcblx0XHRcdGRlYnVnKCdwcm90b2NvbCBlcnJvciBpbiByZWNlaXZlZCBtZXNzYWdlIDonKTtcblx0XHRcdGRlYnVnKG1lc3NhZ2UpO1xuXHRcdFx0ZGVidWcoXCJ0ZXJtaW5hdGluZyBjb25uZWN0aW9uLi4uXCIpO1xuXG5cdFx0XHR0aGlzLl9zb2NrZXQuY2xvc2UoKTtcblx0XHR9XG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBzZW5kaW5nIG1lc3NhZ2VzIC8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHR9LCB7XG5cdFx0a2V5OiAnX3NlbmRUb1BlZXInLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBfc2VuZFRvUGVlcihtZXNzYWdlLCB0YXJnZXQsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdGRlYnVnKCdjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24uIGRyb3BwaW5nIG1lc3NhZ2UuLi4nKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXRoaXMucGVlcnMuaW5jbHVkZXModGFyZ2V0KSkge1xuXHRcdFx0XHRkZWJ1ZygndHJ5aW5nIHRvIHNlbmQgZGF0YSB0byB1bmtub3duIHBlZXIgJyArIHRhcmdldCArICcuIGRyb3BwaW5nIG1lc3NhZ2UuLi4nKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaWQgPSB0aGlzLl9tc2dDb3VudCsrO1xuXHRcdFx0dGhpcy5fbXNnQ2FsbGJhY2tzLnNldChpZCwgY2FsbGJhY2spO1xuXHRcdFx0bWVzc2FnZS50YXJnZXQgPSB0YXJnZXQ7XG5cdFx0XHRtZXNzYWdlLmlkID0gaWQ7XG5cblx0XHRcdHRoaXMuX3NlbmQobWVzc2FnZSk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnX2NsZWFyTWVzc2FnZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIF9jbGVhck1lc3NhZ2UoaWQpIHtcblx0XHRcdHRoaXMuX21zZ0NhbGxiYWNrcy5kZWxldGUoaWQpO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ19zZW5kJyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gX3NlbmQobWVzc2FnZSkge1xuXHRcdFx0dmFyIGRhdGEgPSB2b2lkIDA7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkYXRhID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWJ1Z091dHB1dChkYXRhKTtcblx0XHRcdHRoaXMuX3NvY2tldC5zZW5kKGRhdGEpO1xuXHRcdH1cblx0fV0pO1xuXG5cdHJldHVybiBEaXlhTm9kZTtcbn0oRXZlbnRFbWl0dGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaXlhTm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklrUnBlV0ZPYjJSbExtcHpJbDBzSW01aGJXVnpJanBiSW1SbFluVm5JaXdpY21WeGRXbHlaU0lzSW1SbFluVm5TVzV3ZFhRaUxDSmtaV0oxWjA5MWRIQjFkQ0lzSWtWMlpXNTBSVzFwZEhSbGNpSXNJa1JwZVdGT2IyUmxJaXdpWVdSa2NpSXNJbDloWkdSeUlpd2lYM052WTJ0bGRDSXNJbGRsWWxOdlkydGxkQ0lzSW1Ga1pFVjJaVzUwVEdsemRHVnVaWElpTENKZmIyNVBjR1Z1SWl3aVpYWjBJaXdpWDI5dVEyeHZjMlVpTENKZmIyNUZjbkp2Y2lJc0lsOXZiazFsYzNOaFoyVWlMQ0pmYlhOblEyRnNiR0poWTJ0eklpd2lUV0Z3SWl3aVgyMXpaME52ZFc1MElpd2ljR0Z5WVcxeklpd2lkR0Z5WjJWMElpd2lZMkZzYkdKaFkyc2lMQ0owZVhCbElpd2lhV1FpTENKZmMyVnVaRlJ2VUdWbGNpSXNJbDlqYkdWaGNrMWxjM05oWjJVaUxDSmtZWFJoSWl3aWFHRnVaR3hsSWl3aVgzTmxibVFpTENKemRXSkpaQ0lzSW1WdGFYUWlMQ0psY25JaUxDSnRaWE56WVdkbElpd2lTbE5QVGlJc0luQmhjbk5sSWl3aVpTSXNJbDlvWVc1a2JHVklZVzVrYzJoaGEyVWlMQ0pmYUdGdVpHeGxVR2x1WnlJc0lsOW9ZVzVrYkdWQmJuTjNaWElpTENKQmNuSmhlU0lzSW1selFYSnlZWGtpTENKd1pXVnljeUlzSW1WMlpYSjVJaXdpY0NJc0luTmxiR1lpTENKZmNISnZkRzlqYjJ4RmNuSnZjaUlzSW1selRtRk9JaXdpWjJWMElpd2lZMnh2YzJVaUxDSnBibU5zZFdSbGN5SXNJbk5sZENJc0ltUmxiR1YwWlNJc0luTjBjbWx1WjJsbWVTSXNJbk5sYm1RaUxDSnRiMlIxYkdVaUxDSmxlSEJ2Y25SeklsMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdPenM3T3pzN096dEJRVVZCTEVsQlFVMUJMRkZCUVZGRExGRkJRVk1zVDBGQlZDeEZRVUZyUWl4dFFrRkJiRUlzUTBGQlpEdEJRVU5CTEVsQlFVMURMR0ZCUVdGRUxGRkJRVk1zVDBGQlZDeEZRVUZyUWl3d1FrRkJiRUlzUTBGQmJrSTdRVUZEUVN4SlFVRk5SU3hqUVVGalJpeFJRVUZUTEU5QlFWUXNSVUZCYTBJc01rSkJRV3hDTEVOQlFYQkNPenRCUVVWQkxFbEJRVTFITEdWQlFXVklMRkZCUVZNc2IwSkJRVlFzUTBGQmNrSTdPMGxCUlUxSkxGRTdPenRCUVVOTUxHMUNRVUZoUXl4SlFVRmlMRVZCUVcxQ08wRkJRVUU3TzBGQlFVRTdPMEZCUjJ4Q0xGRkJRVXRETEV0QlFVd3NSMEZCWVVRc1NVRkJZanRCUVVOQkxGRkJRVXRGTEU5QlFVd3NSMEZCWlN4SlFVRkpReXhUUVVGS0xFTkJRV1ZJTEVsQlFXWXNRMEZCWmp0QlFVTkJMRkZCUVV0RkxFOUJRVXdzUTBGQllVVXNaMEpCUVdJc1EwRkJPRUlzVFVGQk9VSXNSVUZCYzBNN1FVRkJRU3hWUVVGUExFMUJRVXRETEU5QlFVd3NRMEZCWTBNc1IwRkJaQ3hEUVVGUU8wRkJRVUVzUjBGQmRFTTdRVUZEUVN4UlFVRkxTaXhQUVVGTUxFTkJRV0ZGTEdkQ1FVRmlMRU5CUVRoQ0xFOUJRVGxDTEVWQlFYVkRPMEZCUVVFc1ZVRkJUeXhOUVVGTFJ5eFJRVUZNTEVOQlFXVkVMRWRCUVdZc1EwRkJVRHRCUVVGQkxFZEJRWFpETzBGQlEwRXNVVUZCUzBvc1QwRkJUQ3hEUVVGaFJTeG5Ra0ZCWWl4RFFVRTRRaXhQUVVFNVFpeEZRVUYxUXp0QlFVRkJMRlZCUVU4c1RVRkJTMGtzVVVGQlRDeERRVUZsUml4SFFVRm1MRU5CUVZBN1FVRkJRU3hIUVVGMlF6dEJRVU5CTEZGQlFVdEtMRTlCUVV3c1EwRkJZVVVzWjBKQlFXSXNRMEZCT0VJc1UwRkJPVUlzUlVGQmVVTTdRVUZCUVN4VlFVRlBMRTFCUVV0TExGVkJRVXdzUTBGQmFVSklMRWRCUVdwQ0xFTkJRVkE3UVVGQlFTeEhRVUY2UXpzN1FVRkZRU3hSUVVGTFNTeGhRVUZNTEVkQlFYRkNMRWxCUVVsRExFZEJRVW9zUlVGQmNrSTdRVUZEUVN4UlFVRkxReXhUUVVGTUxFZEJRV2xDTEVOQlFXcENPMEZCV0d0Q08wRkJXV3hDT3p0QlFVZEVPMEZCUTBFN1FVRkRRVHM3T3pzd1FrRkZVME1zVFN4RlFVRlJReXhOTEVWQlFWRkRMRkVzUlVGQlZUdEJRVUZCT3p0QlFVTnNRMFlzVlVGQlQwY3NTVUZCVUN4SFFVRmpMRk5CUVdRN08wRkJSVUVzVDBGQlRVTXNTMEZCU3l4TFFVRkxReXhYUVVGTUxFTkJRV3RDVEN4TlFVRnNRaXhGUVVFd1FrTXNUVUZCTVVJc1JVRkJhME1zWjBKQlFWRTdRVUZEY0VRc1YwRkJTMHNzWVVGQlRDeERRVUZ2UWtZc1JVRkJjRUk3TzBGQlJVRXNVVUZCU1N4UFFVRlBSaXhSUVVGUUxFdEJRVzlDTEZWQlFYaENMRVZCUVc5RE8wRkJRMjVEUVN4alFVRlZTeXhKUVVGV08wRkJRMEU3UVVGRFJDeEpRVTVWTEVOQlFWZzdRVUZQUVRzN096UkNRVVZWVUN4TkxFVkJRVkZETEUwc1JVRkJVVU1zVVN4RlFVRlZPMEZCUTNCRFJpeFZRVUZQUnl4SlFVRlFMRWRCUVdNc1kwRkJaRHM3UVVGRlFTeFBRVUZOUXl4TFFVRkxMRXRCUVV0RExGZEJRVXdzUTBGQmEwSk1MRTFCUVd4Q0xFVkJRVEJDUXl4TlFVRXhRaXhGUVVGclF5eG5Ra0ZCVVR0QlFVTndSQ3hSUVVGSkxFOUJRVTlETEZGQlFWQXNTMEZCYjBJc1ZVRkJlRUlzUlVGQmIwTTdRVUZEYmtOQkxHTkJRVlZMTEVsQlFWWTdRVUZEUVR0QlFVTkVMRWxCU2xVc1EwRkJXRHM3UVVGTlFTeFZRVUZQTEVWQlFVVk9MR05CUVVZc1JVRkJWVWNzVFVGQlZpeEZRVUZRTzBGQlEwRTdPenM0UWtGRldVa3NUU3hGUVVGUk8wRkJRM0JDTEZGQlFVdERMRXRCUVV3c1EwRkJXVHRCUVVOWVVpeFpRVUZSVHl4UFFVRlBVQ3hOUVVSS08wRkJSVmhUTEZkQlFVOUdMRTlCUVU5S0xFVkJSa2c3UVVGSFdFUXNWVUZCVFR0QlFVaExMRWxCUVZvN08wRkJUVUVzVVVGQlMwY3NZVUZCVEN4RFFVRnZRa1VzVDBGQlQwb3NSVUZCTTBJN1FVRkRRVHM3UVVGRlJEdEJRVU5CTzBGQlEwRTdPenM3TkVKQlJWYzdRVUZEVm5aQ0xGTkJRVThzYVVKQlFWQTdRVUZEUVRzN096WkNRVVZYTzBGQlExaEJMRk5CUVU4c2FVSkJRVkE3TzBGQlJVRXNVVUZCU3poQ0xFbEJRVXdzUTBGQlZ5eFBRVUZZTzBGQlEwRTdPenN5UWtGRlUwTXNSeXhGUVVGTE8wRkJRMlF2UWl4VFFVRlBLMElzUjBGQlVEdEJRVU5CT3pzN05rSkJSVmR1UWl4SExFVkJRVXM3UVVGRGFFSldMR05CUVZsVkxFbEJRVWxqTEVsQlFXaENPMEZCUTBFc1QwRkJTVTBzWjBKQlFVbzdRVUZEUVN4UFFVRkpPMEZCUVVWQkxHTkJRVlZETEV0QlFVdERMRXRCUVV3c1EwRkJXWFJDTEVsQlFVbGpMRWxCUVdoQ0xFTkJRVlk3UVVGQmFVTXNTVUZCZGtNc1EwRkJkME1zVDBGQlQxTXNRMEZCVUN4RlFVRlZPMEZCUVVVN1FVRkJVVHM3UVVGRk5VUXNWMEZCVVVnc1VVRkJVVllzU1VGQmFFSTdRVUZEUXl4VFFVRkxMRmRCUVV3N1FVRkRReXhWUVVGTFl5eG5Ra0ZCVEN4RFFVRjFRa29zVDBGQmRrSTdRVUZEUVR0QlFVTkVMRk5CUVVzc1RVRkJURHRCUVVORExGVkJRVXRMTEZkQlFVd3NRMEZCYTBKTUxFOUJRV3hDTzBGQlEwRTdRVUZEUkN4VFFVRkxMRkZCUVV3N1FVRkRReXhWUVVGTFRTeGhRVUZNTEVOQlFXOUNUaXhQUVVGd1FqdEJRVU5CTzBGQlZFWTdRVUZYUVRzN1FVRkZSRHRCUVVOQk8wRkJRMEU3T3pzN2JVTkJSV3RDUVN4UExFVkJRVk03UVVGRE1VSXNUMEZCU1N4RFFVRkRUeXhOUVVGTlF5eFBRVUZPTEVOQlFXVlNMRkZCUVZGVExFdEJRWFpDTEVOQlFVUXNTVUZEUVN4RFFVRkRWQ3hSUVVGUlV5eExRVUZTTEVOQlFXTkRMRXRCUVdRc1EwRkJjVUk3UVVGQlFTeFhRVUZMTEU5QlFVOURMRU5CUVZBc1MwRkJZU3hSUVVGc1FqdEJRVUZCTEVsQlFYSkNMRU5CUkVRc1NVRkZRU3hQUVVGUFdDeFJRVUZSV1N4SlFVRm1MRXRCUVhkQ0xGRkJSalZDTEVWQlJYTkRPMEZCUTNKRExGTkJRVXRETEdOQlFVd3NRMEZCY1VKaUxFOUJRWEpDTzBGQlEwRTdRVUZEUVRzN1FVRkZSQ3hSUVVGTFV5eExRVUZNTEVkQlFXRlVMRkZCUVZGVExFdEJRWEpDTzBGQlEwRXNVVUZCUzBjc1NVRkJUQ3hIUVVGWldpeFJRVUZSV1N4SlFVRndRanM3UVVGRlFTeFJRVUZMWkN4SlFVRk1MRU5CUVZjc1RVRkJXRHRCUVVOQk96czdPRUpCUlZsRkxFOHNSVUZCVXp0QlFVTnlRaXhSUVVGTFNpeExRVUZNTEVOQlFWazdRVUZEV0U0c1ZVRkJUVHRCUVVSTExFbEJRVm83UVVGSFFUczdPMmREUVVWalZTeFBMRVZCUVZNN1FVRkRka0lzVDBGQlNXTXNUVUZCVDJRc1VVRkJVVlFzUlVGQlppeERRVUZLTEVWQlFYVkNPMEZCUTNSQ0xGTkJRVXR6UWl4alFVRk1MRU5CUVhGQ1lpeFBRVUZ5UWp0QlFVTkJPMEZCUTBFN08wRkJSVVFzVDBGQlRWZ3NWMEZCVnl4TFFVRkxUQ3hoUVVGTUxFTkJRVzFDSzBJc1IwRkJia0lzUTBGQmQwSm1MRkZCUVZGVUxFVkJRV2hETEVOQlFXcENPenRCUVVWQkxFOUJRVWtzVDBGQlQwWXNVVUZCVUN4TFFVRnZRaXhWUVVGNFFpeEZRVUZ2UXp0QlFVTnVRM0pDTEZWQlFVOHNNRVJCUVZBN1FVRkRRVHRCUVVOQk96dEJRVVZFY1VJc1dVRkJWVmNzVVVGQlVVNHNTVUZCYkVJN1FVRkRRVHM3TzJsRFFVVmxUU3hQTEVWQlFWTTdRVUZEZUVKb1F6dEJRVU5CUVN4VFFVRlBaME1zVDBGQlVEdEJRVU5CYUVNc1UwRkJUeXd5UWtGQlVEczdRVUZGUVN4UlFVRkxVU3hQUVVGTUxFTkJRV0YzUXl4TFFVRmlPMEZCUTBFN08wRkJSVVE3UVVGRFFUdEJRVU5CT3pzN096aENRVVZoYUVJc1R5eEZRVUZUV2l4TkxFVkJRVkZETEZFc1JVRkJWVHRCUVVOMlF5eFBRVUZKTEU5QlFVOUJMRkZCUVZBc1MwRkJiMElzVlVGQmVFSXNSVUZCYjBNN1FVRkRia055UWl4VlFVRlBMR3RFUVVGUU8wRkJRMEU3UVVGRFFUczdRVUZGUkN4UFFVRkpMRU5CUVVNc1MwRkJTM2xETEV0QlFVd3NRMEZCVjFFc1VVRkJXQ3hEUVVGeFFqZENMRTFCUVhKQ0xFTkJRVXdzUlVGQmJVTTdRVUZEYkVOd1FpeHRSRUZCT0VOdlFpeE5RVUU1UXp0QlFVTkJPMEZCUTBFN08wRkJSVVFzVDBGQlNVY3NTMEZCU3l4TFFVRkxUQ3hUUVVGTUxFVkJRVlE3UVVGRFFTeFJRVUZMUml4aFFVRk1MRU5CUVcxQ2EwTXNSMEZCYmtJc1EwRkJkMEl6UWl4RlFVRjRRaXhGUVVFMFFrWXNVVUZCTlVJN1FVRkRRVmNzVjBGQlVWb3NUVUZCVWl4SFFVRnBRa0VzVFVGQmFrSTdRVUZEUVZrc1YwRkJVVlFzUlVGQlVpeEhRVUZoUVN4RlFVRmlPenRCUVVWQkxGRkJRVXRMTEV0QlFVd3NRMEZCV1Vrc1QwRkJXanRCUVVOQk96czdaME5CUldOVUxFVXNSVUZCU1R0QlFVTnNRaXhSUVVGTFVDeGhRVUZNTEVOQlFXMUNiVU1zVFVGQmJrSXNRMEZCTWtJMVFpeEZRVUV6UWp0QlFVTkJPenM3ZDBKQlJVMVRMRThzUlVGQlV6dEJRVU5tTEU5QlFVbE9MR0ZCUVVvN1FVRkRRU3hQUVVGSk8wRkJRVVZCTEZkQlFVOVBMRXRCUVV0dFFpeFRRVUZNTEVOQlFXZENjRUlzVDBGQmFFSXNRMEZCVUR0QlFVRnBReXhKUVVGMlF5eERRVUYzUXl4UFFVRlBSQ3hIUVVGUUxFVkJRVms3UVVGQlJUdEJRVUZST3p0QlFVVTVSRFZDTEdWQlFXRjFRaXhKUVVGaU8wRkJRMEVzVVVGQlMyeENMRTlCUVV3c1EwRkJZVFpETEVsQlFXSXNRMEZCYlVJelFpeEpRVUZ1UWp0QlFVTkJPenM3TzBWQk0wdHhRblJDTEZrN08wRkJPRXQyUW10RUxFOUJRVTlETEU5QlFWQXNSMEZCYVVKc1JDeFJRVUZxUWlJc0ltWnBiR1VpT2lKRWFYbGhUbTlrWlM1cWN5SXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJbHdpZFhObElITjBjbWxqZEZ3aVhHNWNibU52Ym5OMElHUmxZblZuSUQwZ2NtVnhkV2x5WlNBb0oyUmxZblZuSnlrb0oyUnBlV0V0YzJSck9rUnBlV0ZPYjJSbEp5bGNibU52Ym5OMElHUmxZblZuU1c1d2RYUWdQU0J5WlhGMWFYSmxJQ2duWkdWaWRXY25LU2duWkdsNVlTMXpaR3M2UkdsNVlVNXZaR1U2YlhObk9tbHVKeWxjYm1OdmJuTjBJR1JsWW5WblQzVjBjSFYwSUQwZ2NtVnhkV2x5WlNBb0oyUmxZblZuSnlrb0oyUnBlV0V0YzJSck9rUnBlV0ZPYjJSbE9tMXpaenB2ZFhRbktWeHVYRzVqYjI1emRDQkZkbVZ1ZEVWdGFYUjBaWElnUFNCeVpYRjFhWEpsSUNnbmJtOWtaUzFsZG1WdWRDMWxiV2wwZEdWeUp5bGNibHh1WTJ4aGMzTWdSR2w1WVU1dlpHVWdaWGgwWlc1a2N5QkZkbVZ1ZEVWdGFYUjBaWElnZTF4dVhIUmpiMjV6ZEhKMVkzUnZjaUFvWVdSa2Npa2dlMXh1WEhSY2RITjFjR1Z5SUNncFhHNWNibHgwWEhSMGFHbHpMbDloWkdSeUlEMGdZV1JrY2x4dVhIUmNkSFJvYVhNdVgzTnZZMnRsZENBOUlHNWxkeUJYWldKVGIyTnJaWFFnS0dGa1pISXBYRzVjZEZ4MGRHaHBjeTVmYzI5amEyVjBMbUZrWkVWMlpXNTBUR2x6ZEdWdVpYSW9KMjl3Wlc0bkxDQmxkblFnUFQ0Z2RHaHBjeTVmYjI1UGNHVnVJQ2hsZG5RcEtWeHVYSFJjZEhSb2FYTXVYM052WTJ0bGRDNWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZGpiRzl6WlNjc0lHVjJkQ0E5UGlCMGFHbHpMbDl2YmtOc2IzTmxJQ2hsZG5RcEtWeHVYSFJjZEhSb2FYTXVYM052WTJ0bGRDNWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZGxjbkp2Y2ljc0lHVjJkQ0E5UGlCMGFHbHpMbDl2YmtWeWNtOXlJQ2hsZG5RcEtWeHVYSFJjZEhSb2FYTXVYM052WTJ0bGRDNWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZHRaWE56WVdkbEp5d2daWFowSUQwK0lIUm9hWE11WDI5dVRXVnpjMkZuWlNBb1pYWjBLU2xjYmx4dVhIUmNkSFJvYVhNdVgyMXpaME5oYkd4aVlXTnJjeUE5SUc1bGR5Qk5ZWEFnS0NsY2JseDBYSFIwYUdsekxsOXRjMmREYjNWdWRDQTlJREZjYmx4MGZWeHVYRzVjYmx4MEx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2TDF4dVhIUXZMeTh2THk4dkx5OHZMeTh2THk4dkx5QkVhWGxoVG05a1pTQkJVRWtnTHk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dlhHNWNkQzh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OWNibHh1WEhSeVpYRjFaWE4wSUNod1lYSmhiWE1zSUhSaGNtZGxkQ3dnWTJGc2JHSmhZMnNwSUh0Y2JseDBYSFJ3WVhKaGJYTXVkSGx3WlNBOUlDZFNaWEYxWlhOMEoxeHVYRzVjZEZ4MFkyOXVjM1FnYVdRZ1BTQjBhR2x6TGw5elpXNWtWRzlRWldWeUlDaHdZWEpoYlhNc0lIUmhjbWRsZEN3Z1pHRjBZU0E5UGlCN1hHNWNkRngwWEhSMGFHbHpMbDlqYkdWaGNrMWxjM05oWjJVZ0tHbGtLVnh1WEc1Y2RGeDBYSFJwWmlBb2RIbHdaVzltSUdOaGJHeGlZV05ySUQwOVBTQW5ablZ1WTNScGIyNG5LU0I3WEc1Y2RGeDBYSFJjZEdOaGJHeGlZV05ySUNoa1lYUmhLVnh1WEhSY2RGeDBmVnh1WEhSY2RIMHBYRzVjZEgxY2JseHVYSFJ6ZFdKelkzSnBZbVVnS0hCaGNtRnRjeXdnZEdGeVoyVjBMQ0JqWVd4c1ltRmpheWtnZTF4dVhIUmNkSEJoY21GdGN5NTBlWEJsSUQwZ0oxTjFZbk5qY21sd2RHbHZiaWRjYmx4dVhIUmNkR052Ym5OMElHbGtJRDBnZEdocGN5NWZjMlZ1WkZSdlVHVmxjaUFvY0dGeVlXMXpMQ0IwWVhKblpYUXNJR1JoZEdFZ1BUNGdlMXh1WEhSY2RGeDBhV1lnS0hSNWNHVnZaaUJqWVd4c1ltRmpheUE5UFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh1WEhSY2RGeDBYSFJqWVd4c1ltRmpheUFvWkdGMFlTbGNibHgwWEhSY2RIMWNibHgwWEhSOUtWeHVYRzVjZEZ4MGNtVjBkWEp1SUhzZ2RHRnlaMlYwTENCcFpDQjlYRzVjZEgxY2JseHVYSFIxYm5OMVluTmpjbWxpWlNBb2FHRnVaR3hsS1NCN1hHNWNkRngwZEdocGN5NWZjMlZ1WkNBb2UxeHVYSFJjZEZ4MGRHRnlaMlYwT2lCb1lXNWtiR1V1ZEdGeVoyVjBMRnh1WEhSY2RGeDBjM1ZpU1dRNklHaGhibVJzWlM1cFpDeGNibHgwWEhSY2RIUjVjR1U2SUNkVmJuTjFZbk5qY21saVpTZGNibHgwWEhSOUtWeHVYRzVjZEZ4MGRHaHBjeTVmWTJ4bFlYSk5aWE56WVdkbElDaG9ZVzVrYkdVdWFXUXBYRzVjZEgxY2JseHVYSFF2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZYRzVjZEM4dkx5OHZMeTh2THk4dkx5OHZMeUJUYjJOclpYUWdaWFpsYm5SeklDOHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTljYmx4MEx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2TDF4dVhHNWNkRjl2Yms5d1pXNGdLQ2tnZTF4dVhIUmNkR1JsWW5WbklDZ25jMjlqYTJWMElHOXdaVzVsWkNBaEp5bGNibHgwZlZ4dVhHNWNkRjl2YmtOc2IzTmxJQ2dwSUh0Y2JseDBYSFJrWldKMVp5QW9KM052WTJ0bGRDQmpiRzl6WldRZ0lTY3BYRzVjYmx4MFhIUjBhR2x6TG1WdGFYUWdLQ2RqYkc5elpTY3BYRzVjZEgxY2JseHVYSFJmYjI1RmNuSnZjaUFvWlhKeUtTQjdYRzVjZEZ4MFpHVmlkV2NnS0dWeWNpbGNibHgwZlZ4dVhHNWNkRjl2YmsxbGMzTmhaMlVnS0dWMmRDa2dlMXh1WEhSY2RHUmxZblZuU1c1d2RYUWdLR1YyZEM1a1lYUmhLVnh1WEhSY2RHeGxkQ0J0WlhOellXZGxYRzVjZEZ4MGRISjVJSHNnYldWemMyRm5aU0E5SUVwVFQwNHVjR0Z5YzJVZ0tHVjJkQzVrWVhSaEtTQjlJR05oZEdOb0lDaGxLU0I3SUhKbGRIVnliaUI5WEc1Y2JseDBYSFJ6ZDJsMFkyZ2dLRzFsYzNOaFoyVXVkSGx3WlNrZ2UxeHVYSFJjZEZ4MFkyRnpaU0JjSWtoaGJtUnphR0ZyWlZ3aU9seHVYSFJjZEZ4MFhIUjBhR2x6TGw5b1lXNWtiR1ZJWVc1a2MyaGhhMlVnS0cxbGMzTmhaMlVwWEc1Y2RGeDBYSFJjZEdKeVpXRnJYRzVjZEZ4MFhIUmpZWE5sSUZ3aVVHbHVaMXdpT2x4dVhIUmNkRngwWEhSMGFHbHpMbDlvWVc1a2JHVlFhVzVuSUNodFpYTnpZV2RsS1Z4dVhIUmNkRngwWEhSaWNtVmhhMXh1WEhSY2RGeDBZMkZ6WlNCY0lrRnVjM2RsY2x3aU9seHVYSFJjZEZ4MFhIUjBhR2x6TGw5b1lXNWtiR1ZCYm5OM1pYSWdLRzFsYzNOaFoyVXBYRzVjZEZ4MFhIUmNkR0p5WldGclhHNWNkRngwZlZ4dVhIUjlYRzVjYmx4MEx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZYRzVjZEM4dkx5OHZMeTh2THk4dkx5OHZJRWhoYm1Sc2FXNW5JSEpsWTJWcGRtVmtJRzFsYzNOaFoyVWdMeTh2THk4dkx5OHZMeTh2THk4dkwxeHVYSFF2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk5Y2JseHVYSFJmYUdGdVpHeGxTR0Z1WkhOb1lXdGxJQ2h0WlhOellXZGxLU0I3WEc1Y2RGeDBhV1lnS0NGQmNuSmhlUzVwYzBGeWNtRjVJQ2h0WlhOellXZGxMbkJsWlhKektTQmNibHgwWEhSY2RIeDhJQ0Z0WlhOellXZGxMbkJsWlhKekxtVjJaWEo1SUNod0lEMCtJSFI1Y0dWdlppQndJRDA5UFNBbmMzUnlhVzVuSnlsY2JseDBYSFJjZEh4OElIUjVjR1Z2WmlCdFpYTnpZV2RsTG5ObGJHWWdJVDA5SUNkemRISnBibWNuS1NCN1hHNWNkRngwWEhSMGFHbHpMbDl3Y205MGIyTnZiRVZ5Y205eUlDaHRaWE56WVdkbEtWeHVYSFJjZEZ4MGNtVjBkWEp1WEc1Y2RGeDBmVnh1WEc1Y2RGeDBkR2hwY3k1d1pXVnljeUE5SUcxbGMzTmhaMlV1Y0dWbGNuTmNibHgwWEhSMGFHbHpMbk5sYkdZZ1BTQnRaWE56WVdkbExuTmxiR1pjYmx4dVhIUmNkSFJvYVhNdVpXMXBkQ0FvSjI5d1pXNG5LVnh1WEhSOVhHNWNibHgwWDJoaGJtUnNaVkJwYm1jZ0tHMWxjM05oWjJVcElIdGNibHgwWEhSMGFHbHpMbDl6Wlc1a0lDaDdYRzVjZEZ4MFhIUjBlWEJsT2lBblVHOXVaeWRjYmx4MFhIUjlLVnh1WEhSOVhHNWNibHgwWDJoaGJtUnNaVUZ1YzNkbGNpQW9iV1Z6YzJGblpTa2dlMXh1WEhSY2RHbG1JQ2hwYzA1aFRpQW9iV1Z6YzJGblpTNXBaQ2twZTF4dVhIUmNkRngwZEdocGN5NWZjSEp2ZEc5amIyeEZjbkp2Y2lBb2JXVnpjMkZuWlNsY2RGeHVYSFJjZEZ4MGNtVjBkWEp1WEc1Y2RGeDBmVnh1WEc1Y2RGeDBZMjl1YzNRZ1kyRnNiR0poWTJzZ1BTQjBhR2x6TGw5dGMyZERZV3hzWW1GamEzTXVaMlYwSUNodFpYTnpZV2RsTG1sa0tWeHVYRzVjZEZ4MGFXWWdLSFI1Y0dWdlppQmpZV3hzWW1GamF5QWhQVDBnSjJaMWJtTjBhVzl1SnlrZ2UxeHVYSFJjZEZ4MFpHVmlkV2NnS0NkT2J5QmpZV3hzWW1GamF5QnlaV05sYVhabFpDQm1iM0lnY21WbmFYTjBaWEpsWkNCdFpYTnpZV2RsTENCa2NtOXdjR2x1Wnk0dUxpY3BYRzVjZEZ4MFhIUnlaWFIxY201Y2JseDBYSFI5WEc1Y2JseDBYSFJqWVd4c1ltRmpheUFvYldWemMyRm5aUzVrWVhSaEtWeHVYSFI5WEc1Y2JseDBYM0J5YjNSdlkyOXNSWEp5YjNJZ0tHMWxjM05oWjJVcElIdGNibHgwWEhSa1pXSjFaeUFvWUhCeWIzUnZZMjlzSUdWeWNtOXlJR2x1SUhKbFkyVnBkbVZrSUcxbGMzTmhaMlVnT21BcFhHNWNkRngwWkdWaWRXY2dLRzFsYzNOaFoyVXBYRzVjZEZ4MFpHVmlkV2NnS0Z3aWRHVnliV2x1WVhScGJtY2dZMjl1Ym1WamRHbHZiaTR1TGx3aUtWeHVYRzVjZEZ4MGRHaHBjeTVmYzI5amEyVjBMbU5zYjNObElDZ3BYRzVjZEgxY2JseHVYSFF2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OWNibHgwTHk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OGdjMlZ1WkdsdVp5QnRaWE56WVdkbGN5QXZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZYRzVjZEM4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMMXh1WEc1Y2RGOXpaVzVrVkc5UVpXVnlJQ2h0WlhOellXZGxMQ0IwWVhKblpYUXNJR05oYkd4aVlXTnJLU0I3WEc1Y2RGeDBhV1lnS0hSNWNHVnZaaUJqWVd4c1ltRmpheUFoUFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh1WEhSY2RGeDBaR1ZpZFdjZ0tDZGpZV3hzWW1GamF5QnRkWE4wSUdKbElHRWdablZ1WTNScGIyNHVJR1J5YjNCd2FXNW5JRzFsYzNOaFoyVXVMaTRuS1Z4dVhIUmNkRngwY21WMGRYSnVYRzVjZEZ4MGZWeHVYRzVjZEZ4MGFXWWdLQ0YwYUdsekxuQmxaWEp6TG1sdVkyeDFaR1Z6SUNoMFlYSm5aWFFwS1NCN1hHNWNkRngwWEhSa1pXSjFaeUFvWUhSeWVXbHVaeUIwYnlCelpXNWtJR1JoZEdFZ2RHOGdkVzVyYm05M2JpQndaV1Z5SUNSN2RHRnlaMlYwZlM0Z1pISnZjSEJwYm1jZ2JXVnpjMkZuWlM0dUxtQXBYRzVjZEZ4MFhIUnlaWFIxY200Z1hHNWNkRngwZlZ4dVhHNWNkRngwYkdWMElHbGtJRDBnZEdocGN5NWZiWE5uUTI5MWJuUWdLeXRjYmx4MFhIUjBhR2x6TGw5dGMyZERZV3hzWW1GamEzTXVjMlYwSUNocFpDd2dZMkZzYkdKaFkyc3BYRzVjZEZ4MGJXVnpjMkZuWlM1MFlYSm5aWFFnUFNCMFlYSm5aWFJjYmx4MFhIUnRaWE56WVdkbExtbGtJRDBnYVdSY2JseHVYSFJjZEhSb2FYTXVYM05sYm1RZ0tHMWxjM05oWjJVcFhHNWNkSDFjYmx4dVhIUmZZMnhsWVhKTlpYTnpZV2RsSUNocFpDa2dlMXh1WEhSY2RIUm9hWE11WDIxelowTmhiR3hpWVdOcmN5NWtaV3hsZEdVZ0tHbGtLVnh1WEhSOVhHNWNibHgwWDNObGJtUWdLRzFsYzNOaFoyVXBJSHRjYmx4MFhIUnNaWFFnWkdGMFlWeHVYSFJjZEhSeWVTQjdJR1JoZEdFZ1BTQktVMDlPTG5OMGNtbHVaMmxtZVNBb2JXVnpjMkZuWlNrZ2ZTQmpZWFJqYUNBb1pYSnlLU0I3SUhKbGRIVnliaUI5WEc1Y2RGeDBYRzVjZEZ4MFpHVmlkV2RQZFhSd2RYUWdLR1JoZEdFcFhHNWNkRngwZEdocGN5NWZjMjlqYTJWMExuTmxibVFnS0dSaGRHRXBYRzVjZEgxY2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JFYVhsaFRtOWtaVnh1SWwxOSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdERpeWFOb2RlOiByZXF1aXJlKCcuL0RpeWFOb2RlJylcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbVJwZVdFdGMyUnJMbXB6SWwwc0ltNWhiV1Z6SWpwYkltMXZaSFZzWlNJc0ltVjRjRzl5ZEhNaUxDSkVhWGxoVG05a1pTSXNJbkpsY1hWcGNtVWlYU3dpYldGd2NHbHVaM01pT2lJN08wRkJRVUZCTEU5QlFVOURMRTlCUVZBc1IwRkJhVUk3UVVGRGFFSkRMRmRCUVZWRExGRkJRVkVzV1VGQlVqdEJRVVJOTEVOQlFXcENJaXdpWm1sc1pTSTZJbVJwZVdFdGMyUnJMbXB6SWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCN1hHNWNkRVJwZVdGT2IyUmxPaUJ5WlhGMWFYSmxLQ2N1TDBScGVXRk9iMlJsSnlsY2JuMWNiaUpkZlE9PSJdfQ==
