!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.d1=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9iYXNlLTY0L2Jhc2U2NC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qISBodHRwOi8vbXRocy5iZS9iYXNlNjQgdjAuMS4wIGJ5IEBtYXRoaWFzIHwgTUlUIGxpY2Vuc2UgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlcyBgZXhwb3J0c2AuXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuXG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSwgYW5kIHVzZVxuXHQvLyBpdCBhcyBgcm9vdGAuXG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIEludmFsaWRDaGFyYWN0ZXJFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9O1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yO1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZENoYXJhY3RlckVycm9yJztcblxuXHR2YXIgZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0Ly8gTm90ZTogdGhlIGVycm9yIG1lc3NhZ2VzIHVzZWQgdGhyb3VnaG91dCB0aGlzIGZpbGUgbWF0Y2ggdGhvc2UgdXNlZCBieVxuXHRcdC8vIHRoZSBuYXRpdmUgYGF0b2JgL2BidG9hYCBpbXBsZW1lbnRhdGlvbiBpbiBDaHJvbWl1bS5cblx0XHR0aHJvdyBuZXcgSW52YWxpZENoYXJhY3RlckVycm9yKG1lc3NhZ2UpO1xuXHR9O1xuXG5cdHZhciBUQUJMRSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC9jb21tb24tbWljcm9zeW50YXhlcy5odG1sI3NwYWNlLWNoYXJhY3RlclxuXHR2YXIgUkVHRVhfU1BBQ0VfQ0hBUkFDVEVSUyA9IC9bXFx0XFxuXFxmXFxyIF0vZztcblxuXHQvLyBgZGVjb2RlYCBpcyBkZXNpZ25lZCB0byBiZSBmdWxseSBjb21wYXRpYmxlIHdpdGggYGF0b2JgIGFzIGRlc2NyaWJlZCBpbiB0aGVcblx0Ly8gSFRNTCBTdGFuZGFyZC4gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC93ZWJhcHBhcGlzLmh0bWwjZG9tLXdpbmRvd2Jhc2U2NC1hdG9iXG5cdC8vIFRoZSBvcHRpbWl6ZWQgYmFzZTY0LWRlY29kaW5nIGFsZ29yaXRobSB1c2VkIGlzIGJhc2VkIG9uIEBhdGvigJlzIGV4Y2VsbGVudFxuXHQvLyBpbXBsZW1lbnRhdGlvbi4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYXRrLzEwMjAzOTZcblx0dmFyIGRlY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpXG5cdFx0XHQucmVwbGFjZShSRUdFWF9TUEFDRV9DSEFSQUNURVJTLCAnJyk7XG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0XHRpZiAobGVuZ3RoICUgNCA9PSAwKSB7XG5cdFx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UoLz09PyQvLCAnJyk7XG5cdFx0XHRsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdGxlbmd0aCAlIDQgPT0gMSB8fFxuXHRcdFx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvQyNhbHBoYW51bWVyaWMtYXNjaWktY2hhcmFjdGVyc1xuXHRcdFx0L1teK2EtekEtWjAtOS9dLy50ZXN0KGlucHV0KVxuXHRcdCkge1xuXHRcdFx0ZXJyb3IoXG5cdFx0XHRcdCdJbnZhbGlkIGNoYXJhY3RlcjogdGhlIHN0cmluZyB0byBiZSBkZWNvZGVkIGlzIG5vdCBjb3JyZWN0bHkgZW5jb2RlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgYml0Q291bnRlciA9IDA7XG5cdFx0dmFyIGJpdFN0b3JhZ2U7XG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0dmFyIHBvc2l0aW9uID0gLTE7XG5cdFx0d2hpbGUgKCsrcG9zaXRpb24gPCBsZW5ndGgpIHtcblx0XHRcdGJ1ZmZlciA9IFRBQkxFLmluZGV4T2YoaW5wdXQuY2hhckF0KHBvc2l0aW9uKSk7XG5cdFx0XHRiaXRTdG9yYWdlID0gYml0Q291bnRlciAlIDQgPyBiaXRTdG9yYWdlICogNjQgKyBidWZmZXIgOiBidWZmZXI7XG5cdFx0XHQvLyBVbmxlc3MgdGhpcyBpcyB0aGUgZmlyc3Qgb2YgYSBncm91cCBvZiA0IGNoYXJhY3RlcnPigKZcblx0XHRcdGlmIChiaXRDb3VudGVyKysgJSA0KSB7XG5cdFx0XHRcdC8vIOKApmNvbnZlcnQgdGhlIGZpcnN0IDggYml0cyB0byBhIHNpbmdsZSBBU0NJSSBjaGFyYWN0ZXIuXG5cdFx0XHRcdG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuXHRcdFx0XHRcdDB4RkYgJiBiaXRTdG9yYWdlID4+ICgtMiAqIGJpdENvdW50ZXIgJiA2KVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdC8vIGBlbmNvZGVgIGlzIGRlc2lnbmVkIHRvIGJlIGZ1bGx5IGNvbXBhdGlibGUgd2l0aCBgYnRvYWAgYXMgZGVzY3JpYmVkIGluIHRoZVxuXHQvLyBIVE1MIFN0YW5kYXJkOiBodHRwOi8vd2hhdHdnLm9yZy9odG1sL3dlYmFwcGFwaXMuaHRtbCNkb20td2luZG93YmFzZTY0LWJ0b2Fcblx0dmFyIGVuY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpO1xuXHRcdGlmICgvW15cXDAtXFx4RkZdLy50ZXN0KGlucHV0KSkge1xuXHRcdFx0Ly8gTm90ZTogbm8gbmVlZCB0byBzcGVjaWFsLWNhc2UgYXN0cmFsIHN5bWJvbHMgaGVyZSwgYXMgc3Vycm9nYXRlcyBhcmVcblx0XHRcdC8vIG1hdGNoZWQsIGFuZCB0aGUgaW5wdXQgaXMgc3VwcG9zZWQgdG8gb25seSBjb250YWluIEFTQ0lJIGFueXdheS5cblx0XHRcdGVycm9yKFxuXHRcdFx0XHQnVGhlIHN0cmluZyB0byBiZSBlbmNvZGVkIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3V0c2lkZSBvZiB0aGUgJyArXG5cdFx0XHRcdCdMYXRpbjEgcmFuZ2UuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIHBhZGRpbmcgPSBpbnB1dC5sZW5ndGggJSAzO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR2YXIgcG9zaXRpb24gPSAtMTtcblx0XHR2YXIgYTtcblx0XHR2YXIgYjtcblx0XHR2YXIgYztcblx0XHR2YXIgZDtcblx0XHR2YXIgYnVmZmVyO1xuXHRcdC8vIE1ha2Ugc3VyZSBhbnkgcGFkZGluZyBpcyBoYW5kbGVkIG91dHNpZGUgb2YgdGhlIGxvb3AuXG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aCAtIHBhZGRpbmc7XG5cblx0XHR3aGlsZSAoKytwb3NpdGlvbiA8IGxlbmd0aCkge1xuXHRcdFx0Ly8gUmVhZCB0aHJlZSBieXRlcywgaS5lLiAyNCBiaXRzLlxuXHRcdFx0YSA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pIDw8IDE2O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbikgPDwgODtcblx0XHRcdGMgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pO1xuXHRcdFx0YnVmZmVyID0gYSArIGIgKyBjO1xuXHRcdFx0Ly8gVHVybiB0aGUgMjQgYml0cyBpbnRvIGZvdXIgY2h1bmtzIG9mIDYgYml0cyBlYWNoLCBhbmQgYXBwZW5kIHRoZVxuXHRcdFx0Ly8gbWF0Y2hpbmcgY2hhcmFjdGVyIGZvciBlYWNoIG9mIHRoZW0gdG8gdGhlIG91dHB1dC5cblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTggJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTIgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gNiAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciAmIDB4M0YpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmIChwYWRkaW5nID09IDIpIHtcblx0XHRcdGEgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA8PCA4O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbik7XG5cdFx0XHRidWZmZXIgPSBhICsgYjtcblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTApICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPj4gNCkgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDIpICYgMHgzRikgK1xuXHRcdFx0XHQnPSdcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChwYWRkaW5nID09IDEpIHtcblx0XHRcdGJ1ZmZlciA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pO1xuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAyKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDQpICYgMHgzRikgK1xuXHRcdFx0XHQnPT0nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH07XG5cblx0dmFyIGJhc2U2NCA9IHtcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J3ZlcnNpb24nOiAnMC4xLjAnXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gYmFzZTY0O1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gYmFzZTY0O1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYmFzZTY0KSB7XG5cdFx0XHRcdGJhc2U2NC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gYmFzZTY0W2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QuYmFzZTY0ID0gYmFzZTY0O1xuXHR9XG5cbn0odGhpcykpO1xuIl19
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

},{}],5:[function(require,module,exports){
module.exports=require(2)
},{"/home/robecast/Projets/diya-sdk/node_modules/inherits/inherits_browser.js":2}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiJdfQ==
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
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }

var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = false;
var Logger = {
	log: function(message){
		if(DEBUG) console.log(message);
	},

	error: function(message){
		if(DEBUG) console.error(message);
	}
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////


function DiyaNode(){
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

DiyaNode.prototype.user = function(user) { 
	if(user) this._user = user;
	else return this._user; 
};
DiyaNode.prototype.authenticated = function(authenticated) { 
	if(authenticated !== undefined) this._authenticated = authenticated;
	else return this._authenticated; 
};
DiyaNode.prototype.pass = function(pass) { 
	if(pass !== undefined) this._pass = pass;
	else return this._pass; 
};
DiyaNode.prototype.addr = function() { return this._addr; };
DiyaNode.prototype.peers = function(){ return this._peers; };
DiyaNode.prototype.self = function() { return this._self; };
DiyaNode.prototype.setSecured = function(bSecured) { this._secured = bSecured !== false; };
DiyaNode.prototype.setWSocket = function(WSocket) {this._WSocket = WSocket;}



/** @return {Promise<String>} the connected peer name */
DiyaNode.prototype.connect = function(addr, WSocket){
	var that = this;
	this.bDontReconnect = false;

	if(WSocket) this._WSocket = WSocket;
	else if(!this._WSocket) this._WSocket = window.WebSocket;
	WSocket = this._WSocket;

	// Check and Format URI (FQDN)
	if(addr.indexOf("ws://") === 0 && this._secured) return Q.reject("Please use a secured connection (" + addr + ")");
	if(addr.indexOf("wss://") === 0 && this._secured === false) return Q.reject("Please use a non-secured connection (" + addr + ")");
	if(addr.indexOf("ws://") !== 0 && addr.indexOf("wss://") !== 0) {
		if(this._secured) addr = "wss://" + addr;
		else addr = "ws://" + addr;
	}


	if(this._addr === addr){
		if(this._status === 'opened')
			return Q(this.self());
		else if(this._connectionDeferred && this._connectionDeferred.promise && this._connectionDeferred.promise.isPending())
			return this._connectionDeferred.promise;
	}

	return this.close().then(function(){
		that._addr = addr;
		that._connectionDeferred = Q.defer();
		Logger.log('d1: connect to ' + that._addr);
		var sock = new SocketHandler(WSocket, that._addr, that._connectTimeout);

		if(!that._socketHandler) that._socketHandler = sock;

		that._onopening();

		sock.on('open', function(){
			if(that._socketHandler !== sock) {
				console.log("[d1] Websocket responded but already connected to a different one");
				return;
			}
			that._socketHandler = sock;
			that._status = 'opened';
			that._setupPingResponse();
		});

		sock.on('closing', function() {
			if(that._socketHandler !== sock) return ;
			that._onclosing();
		});

		sock.on('close', function() {
			if(that._socketHandler !== sock) return;
			that._socketHandler = null;
			that._status = 'closed';
			that._stopPingResponse();
			that._onclose();
			if(that._connectionDeferred) { that._connectionDeferred.reject("closed"); that._connectionDeferred = null;}
		});

		sock.on('error', function(error) {
			if(that._socketHandler !== sock) return;
			that._onerror(error);
		});

		sock.on('timeout', function() {
			if(that._socketHandler !== sock) return;
			that._socketHandler = null;
			that._status = 'closed';
			if(that._connectionDeferred) { that._connectionDeferred.reject("closed"); that._connectionDeferred = null;}
		})

		sock.on('message', function(message) { that._onmessage(message); });

		return that._connectionDeferred.promise;
	});
};

DiyaNode.prototype.disconnect = function() {
	this.bDontReconnect = true;
	return this.close();
};


DiyaNode.prototype.close = function(){
	this._stopPingResponse();
	if(this._socketHandler) return this._socketHandler.close();
	else return Q();
};

DiyaNode.prototype.isConnected = function(){
	return (this._socketHandler && this._socketHandler.isConnected());
};

DiyaNode.prototype.request = function(params, callback, timeout, options){
	var that = this;
	if(!options) options = {};

	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedRequest';
		params = {service:_params[0], func:_params[1]};
	}

	if(!params.service) {
		Logger.error('No service defined for request !');
		return false;
	}

	var message = this._createMessage(params, "Request");
	this._appendMessage(message, callback);
	if(typeof options.callback_partial === 'function') this._pendingMessages[message.id].callback_partial = options.callback_partial;
	message.options = options;

	if(!isNaN(timeout) && timeout > 0){
		setTimeout(function(){
			var handler = that._removeMessage(message.id);
			if(handler) that._notifyListener(handler, 'Timeout exceeded ('+timeout+'ms) !');
		}, timeout);
	}

	if(!this._send(message)){
		this._removeMessage(message.id);
		console.error('Cannot send request !');
		return false;
	}

	return true;
};

DiyaNode.prototype.subscribe = function(params, callback){
	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedRequest';
		params = {service:_params[0], func:_params[1]};
	}

	if(!params.service){
		Logger.error('No service defined for subscription !');
		return -1;
	}

	var message = this._createMessage(params, "Subscription");
	this._appendMessage(message, callback);

	if(!this._send(message)){
		this._removeMessage(message.id);
		Logger.error('Cannot send subscription !');
		return -1;
	}

	return message.id;
};

DiyaNode.prototype.unsubscribe = function(subId){
	if(this._pendingMessages[subId] && this._pendingMessages[subId].type === "Subscription"){
		var subscription = this._removeMessage(subId);

		var message = this._createMessage({
			target: subscription.target,
			data: {
				subId: subId
			}
		}, "Unsubscribe");

		if(!this._send(message)){
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

DiyaNode.prototype._appendMessage = function(message, callback){
	this._pendingMessages[message.id] = {
		callback: callback,
		type: message.type,
		target: message.target
	};
};

DiyaNode.prototype._removeMessage = function(messageId){
	var handler = this._pendingMessages[messageId];
	if(handler){
		delete this._pendingMessages[messageId];
		return handler;
	}else{
		return null;
	}
};

DiyaNode.prototype._clearMessages = function(err, data){
	for(var messageId in this._pendingMessages){
		var handler = this._removeMessage(messageId);
		this._notifyListener(handler, err, data);
	}
};

DiyaNode.prototype._clearPeers = function(){
	while(this._peers.length) this.emit('peer-disconnected', this._peers.pop());
};

DiyaNode.prototype._getMessageHandler = function(messageId){
	var handler = this._pendingMessages[messageId];
	return handler ? handler : null;
};

DiyaNode.prototype._notifyListener = function(handler, error, data){
	if(handler && typeof handler.callback === 'function') {
		error = error ? error : null;
		data = data ? data : null;
		try {
			handler.callback(error, data);
		} catch(e) { console.log('[Error in Request callback] ' + e.stack ? e.stack : e);}
	}
};

DiyaNode.prototype._send = function(message){
	return this._socketHandler && this._socketHandler.send(message);
};

DiyaNode.prototype._setupPingResponse = function(){
	var that = this;

	this._pingTimeout = 15000;
	this._lastPing = new Date().getTime();

	function checkPing(){
		var curTime = new Date().getTime();
		if(curTime - that._lastPing > that._pingTimeout){
			that._forceClose();
			Logger.log("d1:  timed out !");
		}else{
			Logger.log("d1: last ping ok");
			that._pingSetTimeoutId = setTimeout(checkPing, Math.round(that._pingTimeout / 2.1));
		}
	}

	checkPing();
};

DiyaNode.prototype._stopPingResponse = function(){
	clearTimeout(this._pingSetTimeoutId);
};

DiyaNode.prototype._forceClose = function(){
	this._socketHandler.close();
	this._onclose();
};

///////////////////////////////////////////////////////////////
/////////////////// Socket event handlers /////////////////////
///////////////////////////////////////////////////////////////


DiyaNode.prototype._onmessage = function(message){
	if(isNaN(message.id)) return this._handleInternalMessage(message);
	var handler = this._getMessageHandler(message.id);
	if(!handler) return;
	switch(handler.type){
		case "Request":
			this._handleRequest(handler, message);
			break;
		case "Subscription":
			this._handleSubscription(handler, message);
			break;
	}
};

DiyaNode.prototype._onopening = function() {
	this.emit('opening', this);
};

DiyaNode.prototype._onerror = function(error) {
	this.emit('error', new Error(error));
};

DiyaNode.prototype._onclosing = function() {
	this.emit('closing', this);
};

DiyaNode.prototype._onclose = function(){
	var that = this;

	this._clearMessages('PeerDisconnected');
	this._clearPeers();

	if(!this.bDontReconnect) {
		Logger.log('d1: connection lost, try reconnecting');
		setTimeout(function(){
			that.connect(that._addr, that._WSocket).catch(function(err){});
		}, that._reconnectTimeout);
	}	
	this.emit('close', this._addr);
};

/////////////////////////////////////////////////////////////
/////////////// Protocol event handlers /////////////////////
/////////////////////////////////////////////////////////////

DiyaNode.prototype._handleInternalMessage = function(message){
	switch(message.type){
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

DiyaNode.prototype._handlePing = function(message){
	message.type = "Pong";
	this._lastPing = new Date().getTime();
	this._send(message);
};

DiyaNode.prototype._handleHandshake = function(message){

	if(message.peers === undefined || typeof message.self !== 'string'){
		Logger.error("Missing arguments for Handshake message, dropping...");
		return ;
	}


	this._self = message.self;

	for(var i=0;i<message.peers.length; i++){
		this._peers.push(message.peers[i]);
		this.emit('peer-connected', message.peers[i]);
	}

	this._connectionDeferred.resolve(this.self());
	this.emit('open', this._addr);
	this._status = 'opened';
	this._connectionDeferred = null;
};

DiyaNode.prototype._handlePeerConnected = function(message){
	if(message.peerId === undefined){
		Logger.error("Missing arguments for PeerConnected message, dropping...");
		return ;
	}

	//Add peer to the list of reachable peers
	this._peers.push(message.peerId);

	this.emit('peer-connected', message.peerId);
};

DiyaNode.prototype._handlePeerDisconnected = function(message){
	if(message.peerId === undefined){
		Logger.error("Missing arguments for PeerDisconnected Message, dropping...");
		return ;
	}

	//Go through all pending messages and notify the ones that are targeted
	//at the disconnected peer that it disconnected and therefore the command
	//cannot be fulfilled
	for(var messageId in this._pendingMessages){
		var handler = this._getMessageHandler(messageId);
		if(handler && handler.target === message.peerId) {
			this._removeMessage(messageId);
			this._notifyListener(handler, 'PeerDisconnected', null);
		}
	}

	//Remove peer from list of reachable peers
	for(var i=this._peers.length - 1; i >= 0; i--){
		if(this._peers[i] === message.peerId){
			this._peers.splice(i, 1);
			break;
		}
	}

	this.emit('peer-disconnected', message.peerId);
};

DiyaNode.prototype._handleRequest = function(handler, message){
	if(message.type === 'PartialAnswer') {
		if(typeof this._pendingMessages[message.id].callback_partial === 'function') {
			var error = message.error ? message.error : null;
			var data = message.data ? message.data : null;
			this._pendingMessages[message.id].callback_partial(error, data);
		}
	} else {
		this._removeMessage(message.id);
		this._notifyListener(handler, message.error, message.data);
	}
};

DiyaNode.prototype._handleSubscription = function(handler, message){
	//remove subscription if it was closed from node
	if(message.result === "closed") {
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

	if(WSocket) this._WSocket = WSocket;
	else if(!this._WSocket) this._WSocket = window.WebSocket;
	WSocket = this._WSocket;

	this._status = 'opening';

	try {
		this._socket = addr.indexOf("wss://")===0 ? new WSocket(addr, undefined, {rejectUnauthorized:false}) : new WSocket(addr);

		this._socketOpenCallback = this._onopen.bind(this);
		this._socketCloseCallback = this._onclose.bind(this);
		this._socketMessageCallback = this._onmessage.bind(this);
		this._socketErrorCallback = this._onerror.bind(this);

		this._socket.addEventListener('open', this._socketOpenCallback);
		this._socket.addEventListener('close',this._socketCloseCallback);
		this._socket.addEventListener('message', this._socketMessageCallback);
		this._socket.addEventListener('error', this._socketErrorCallback);

		this._socket.addEventListener('error', function(err){
			Logger.error("[WS] error : "+JSON.stringify(err));
			that._socket.close();
		});

		setTimeout(function(){
			if(that._status === 'opened') return;
			if(that._status !== 'closed'){
				Logger.log('d1: ' + that.addr + ' timed out while connecting');
				that.close();
				that.emit('timeout', that._socket);
			}
		}, timeout);

	} catch(e) {
		Logger.error(e.stack);
		that.close();
		throw e;
	}
};
inherits(SocketHandler, EventEmitter);

SocketHandler.prototype.close = function() {
	if(this._disconnectionDeferred && this._disconnectionDeferred.promise) return this._disconnectionDeferred.promise;
	this._disconnectionDeferred = Q.defer();
	this._status = 'closing';
	this.emit('closing', this._socket);
	if(this._socket) this._socket.close();
	return this._disconnectionDeferred.promise;
};

SocketHandler.prototype.send = function(message) {
	try {
		var data = JSON.stringify(message);
	} catch(err) {
		console.error('Cannot serialize message');
		return false;
	}

	try {
		this._socket.send(data);
	} catch(err){
		console.error('Cannot send message');
		console.error(err);
		return false;
	}

	return true;
}

SocketHandler.prototype.isConnected = function() {
	return this._socket.readyState == this._WSocket.OPEN && this._status === 'opened';
};

SocketHandler.prototype._onopen = function() {
	this._status = 'opened';
	this.emit('open', this._socket);
};

SocketHandler.prototype._onclose = function(evt) {
	this._status = 'closed';
	this.unregisterCallbacks();
	this.emit('close', this._socket);
	if(this._disconnectionDeferred && this._disconnectionDeferred.promise) this._disconnectionDeferred.resolve();
};

SocketHandler.prototype._onmessage = function(evt) {
	try {
		var message = JSON.parse(evt.data);
		this.emit('message', message);
	} catch(err){
		Logger.error("[WS] cannot parse message, dropping...");
		throw err;
	}
};

SocketHandler.prototype._onerror = function(evt) {
	this.emit('error', evt);
};

SocketHandler.prototype.unregisterCallbacks = function() {
	if(this._socket && (typeof this._socket.removeEventListener === 'function')){
		this._socket.removeEventListener('open', this._socketOpenCallback);
		this._socket.removeEventListener('close', this._socketCloseCallback);
		this._socket.removeEventListener('message', this._socketMessageCallback);
	} else if(this._socket && (typeof this._socket.removeAllListeners === 'function')){
		this._socket.removeAllListeners();
	}
};

///////////////////////////////////////////////////////////////
////////////////////// Utility methods ////////////////////////
///////////////////////////////////////////////////////////////

DiyaNode.prototype._createMessage = function(params, type){
	if(!params || !type || (type !== "Request" && type !== "Subscription" && type !== "Unsubscribe")){
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

DiyaNode.prototype._generateId = function(){
	var id = this._nextId;
	this._nextId++;
	return id;
};



module.exports = DiyaNode;

},{"inherits":2,"node-event-emitter":3,"q":undefined}],18:[function(require,module,exports){
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
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

//////////////
//  D1 API  //
//////////////



function newInstance () {

	var connection = new DiyaNode();

	var d1inst = function (selector) {
		return new DiyaSelector(selector, connection);
	}

	d1inst.DiyaNode = DiyaNode;
	d1inst.DiyaSelector = DiyaSelector;

	d1inst.connect = function(addr, WSocket){
		return connection.connect(addr, WSocket);
	};

	d1inst.disconnect = function(){
		return connection.disconnect();
	};

	d1inst.isConnected = function() {	return connection.isConnected();};
	d1inst.peers = function() { return connection.peers();};
	d1inst.self = function() { return connection.self(); };
	d1inst.addr = function() { return connection.addr(); };
	d1inst.user = function() { return connection.user(); };
	d1inst.pass = function() { return connection.pass(); };
	d1inst.isAuthenticated = function() { return connection.authenticated(); };

	d1inst.parsePeer = function(addrStr) {
		var peer = {};

		// <nothing> -> wss://localhost/api
		if(!addrStr || addrStr === "") {
			peer.addr = "wss://localhost/api";
			peer.addrNet = "wss://localhost/net";
		}
		// 1234 -> ws://localhost:1234
		else if(/^[0-9]*$/.test(addrStr)) {
			peer.addr = "ws://localhost:"+addrStr;
		}
		// 10.42.0.1 -> wss://10.42.0.1/api
		//          -> wss://10.24.0.1/net
		else if (IP_REGEX.test(addrStr)) {
			peer.addr = "wss://"+addrStr+"/api";
			peer.addrNet = "wss://"+addrStr+"/net";
		}
		// 10.42.0.1:1234 -> ws://10.42.0.1:1234
	       	else if (IP_REGEX.test(addrStr.split(':')[0]) && /^[0-9]*$/.test(addrStr.split(':')[1])) {
			peer.addr = "ws://"+addrStr;
		}
		// wss://someaddress.com/stuff -> wss://someaddress.com/stuff
		// ws://someaddress.com/stuff -> ws://someaddress.com/stuff
		else if (addrStr.indexOf("wss://") === 0 || addrStr.indexOf("ws://") === 0) {
			peer.addr = addrStr;
		}
		// somedomain/somesite -> "wss://somedomain/somesite/api
		//                     -> "wss://somedomain/somesite/net
		//                     -> somesite
		else if(addrStr.split('/').length === 2) {
			peer.addr = "wss://" + addrStr + '/api';
			peer.addrNet = "wss://" + addrStr + '/net';
			peer.name = addrStr.split('/')[1];
		}
		// somedomain/somesite/api -> "wss://somedomain/somesite/api"
		//                         -> "wss://somedomain/somesite/net"
		//                         -> somesite
		else if(addrStr.split('/').length === 3 && addrStr.split('/')[2] === "api") {
			peer.addr = "wss://"+addrStr;
			peer.addrNet = "wss://"+addrStr.substr(0, addrStr.length - 4);
			peer.name = addrStr.split('/')[1];
		}
		// somesite -> "wss://partnering-cloud.com/somesite/api"
		//          -> "wss://partnering-cloud.com/somesite/net"
		//          -> somesite
		else {
			peer.addr = "wss://partnering-cloud.com/"+addrStr+"/api";
			peer.addrNet = "wss://partnering-cloud.com/"+addrStr+"/net";
			peer.name = addrStr;
		}

		return peer;
	};


	/** Try to connect to the given servers list in the list order, until finding an available one */
	d1inst.tryConnect = function(servers, WSocket){
		var deferred = Q.defer();
		function tc(i) {
			d1inst.connect(servers[i], WSocket).then(function(e){
				return deferred.resolve(servers[i]);
			}).catch(function(e){
				d1inst.disconnect().then(function() {
					i++;
					if(i<servers.length) setTimeout(function() {tc(i);}, 100);
					else return deferred.reject("Timeout");
				});
			});
		}
		tc(0);
		return deferred.promise;
	}

	d1inst.currentServer = function(){
		return connection._addr;
	};

	d1inst.on = function(event, callback){
		connection.on(event, callback);
		return d1inst;
	};

	d1inst.removeListener = function(event, callback){
		connection.removeListener(event, callback);
		return d1inst;
	};

	/** Shorthand function to connect and login with the given (user,password) */
	d1inst.connectAsUser = function(ip, user, password, WSocket) {
		return d1inst.connect(ip, WSocket).then(function(){
			return d1inst("#self").auth(user, password);
		});
	};

	d1inst.deauthenticate = function(){ connection.authenticated(false); connection.user(null); connection.pass(null);};
	d1inst.setSecured = function(bSecured) { connection.setSecured(bSecured); };
	d1inst.isSecured = function() {return connection._secured; }
	d1inst.setWSocket = function(WSocket) { connection.setWSocket(WSocket); }


	/** Self-authenticate the local DiyaNode bound to port <port>, using its RSA signature */
	d1inst.selfConnect = function(port, signature, WSocket) {
		return d1inst.connect('ws://localhost:' + port, WSocket)
		.then(function() {
			var deferred = Q.defer();
			d1inst("#self").request({
				service: 'peerAuth',
				func: 'SelfAuthenticate',
				data: {	signature: signature }
			}, function(peerId, err, data){
				if(err) return deferred.reject(err);
				if(data && data.authenticated){
					connection.authenticated(true);
					connection.user("#DiyaNode#"+peerId);
					deferred.resolve();
				} else {
					connection.authenticated(false);
					deferred.reject('AccessDenied');
				}
			});
			return deferred.promise;
		});
	}

	return d1inst;
}

var d1 = newInstance();
d1.newInstance = newInstance;



//////////////////
// DiyaSelector //
//////////////////

function DiyaSelector(selector, connection){
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

DiyaSelector.prototype.select = function() { return this._select(); };



/**
 * Apply callback cb to each selected peer. Peers are selected
 * according to the rule 'selector' given to constructor. Selector can
 * be a peerId, a regEx for peerIds of an array of peerIds.
 * @params 	cb		callback to be applied
 * @return 	this 	<DiyaSelector>
 */
DiyaSelector.prototype.each = function(cb){
	var peers = this._select();
	for(var i=0; i<peers.length; i++) cb.bind(this)(peers[i]);
	return this;
};

/**
 * Send request to selected peers ( see each() ) through the current connection (DiyaNode).
 * @param {String | Object} params : can be service.function or {service:service, func:function, ...}
 */
DiyaSelector.prototype.request = function(params, callback, timeout, options){
	if(!this._connection) return this;
	if(!options) options = {};
	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedRequest';
		params = {service:_params[0], func:_params[1]};
	}

	var nbAnswers = 0;
	var nbExpected = this._select().length;
	if (nbExpected === 0 && options.bNotifyWhenFinished) callback(null, null, "##END##");
	return this.each(function(peerId){
		params.target = peerId;

		var opts = {};
		for(var i in options) opts[i] = options[i];
		if(typeof opts.callback_partial === 'function') opts.callback_partial = function(err, data){ options.callback_partial(peerId, err, data);}

		this._connection.request(params, function(err, data){
			if(typeof callback === 'function') callback(peerId, err, data);
			nbAnswers++;
			if(nbAnswers == nbExpected && options.bNotifyWhenFinished) callback(null, err, "##END##"); // TODO : Find a better way to notify request END !!
		}, timeout, opts);
	});
};


// IMPORTANT !!! By 30/11/15, this method doesn't return 'this' anymore, but a Subscription object instead
/* @param {String | Object} params : can be 'service.function' or {service:service, func:function, ...} */
DiyaSelector.prototype.subscribe = function(params, callback, options){
	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedSubscription';
		params = {service:_params[0], func:_params[1]};
	}

	return new Subscription(this, params, callback, options);
};


// IMPORTANT !!! BY 30/11/15, this method doesn't take subIds as input anymore.
// Please provide a subscription instead !
DiyaSelector.prototype.unsubscribe = function(subscription){
	if(Array.isArray(subscription) || !subscription.close) return this.__old_deprecated_unsubscribe(subscription);
	return subscription.close();
};

DiyaSelector.prototype.auth = function(user, password, callback, timeout){
	var that = this;
	if(typeof callback === 'function') callback = callback.bind(this);

	var deferred = Q.defer();

	this.request({
		service: 'auth',
		func: 'Authenticate',
		data: {
			user: user, // DEPRECATED, kept for now for backward compatiblity (will be dropped)
			username: user, // New syntax since switching to DBus
			password: password
		}
	}, function(peerId, err, data){

		if(err === 'ServiceNotFound'){
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.reject(err);
			return ;
		}

		// data.authenticated is DEPRECATED, kept for backward compatibility
		if(!err && data && (data === true || data.authenticated === true)){
			that._connection.authenticated(true);
			that._connection.user(user);
			that._connection.pass(password);
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.resolve();
		} else {
			that._connection.authenticated(false);
			if(typeof callback === 'function') callback(peerId, false);
			else deferred.reject('AccessDenied');
		}

	}, timeout);

	return deferred.promise;
};



// Privates

DiyaSelector.prototype._select = function(selectorFunction){
	var that = this;

	if(!this._connection) return [];
	return this._connection.peers().filter(function(peerId){
		return that._match(that._selector, peerId);
	});
};

DiyaSelector.prototype._match = function(selector, str){
	if(!selector) return false;
	if(selector === "#self") { return this._connection && str === this._connection.self(); }
	else if(selector.not) return !this._match(selector.not, str);
	else if(selector.constructor.name === 'String'){
		return matchString(selector, str);
	} else if(selector.constructor.name === 'RegExp'){
		return matchRegExp(selector, str);
	} else if(Array.isArray(selector)){
		return matchArray(selector, str);
	}
	return false;
}

function matchString(selector, str){
	return selector === str;
}

function matchRegExp(selector, str){
	return str.match(selector);
}

function matchArray(selector, str){
	for(var i=0;i<selector.length; i++){
		if(selector[i] === str) return true;
	}
	return false;
}

// Overrides EventEmitter's behavior to proxy and filter events from the connection
DiyaSelector.prototype._on = DiyaSelector.prototype.on;
DiyaSelector.prototype.on = function(type, callback){
	var that = this;
	callback.___DiyaSelector_hidden_wrapper = function(peerId) {
		if(that._match(that._selector, peerId)) that.emit(type, peerId);
	};
	this._connection.on(type, callback.___DiyaSelector_hidden_wrapper);
	var ret = this._on(type, callback);

	// Handle the specific case of "peer-connected" events, i.e., notify of already connected peers
	if(type === 'peer-connected' && this._connection.isConnected()) {
		var peers = this._connection.peers();
		for(var i=0;i<peers.length; i++) {
			if(this._match(this._selector, peers[i])) callback(peers[i]);
		}
	}
	return ret;
};


// Overrides EventEmitter's behavior to proxy and filter events from the connection
DiyaSelector.prototype._removeListener = DiyaSelector.prototype.removeListener;
DiyaSelector.prototype.removeListener = function(type, callback) {
	if(callback.___DiyaSelector_hidden_wrapper) this._connection.removeListener(type, callback.___DiyaSelector_hidden_wrapper);
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

		this.doSubscribe = function(peerId) {
			that.subIds.push(that._addSubscription(peerId));
			that.state = "open";
		};

		if(this.options && this.options.auto) {
			this.selector.on('peer-connected', this.doSubscribe);
		} else {
			this.selector.each(this.doSubscribe);
		}

		return this;
};

Subscription.prototype.close = function() {
	for(var i = 0; i<this.subIds.length; i++) {
		this.selector._connection.unsubscribe(this.subIds[i]);
	}
	this.subIds = [];
	this.selector.removeListener('peer-connected', this.doSubscribe);
	this.state = "closed";
};

Subscription.prototype._addSubscription = function(peerId) {
	var that = this;
	params = {};
	for(var k in this.params) params[k] = this.params[k];
	params.target = peerId;
	var subId = this.selector._connection.subscribe(params, function(err, data){
		that.callback(peerId, err, data);
	});
	if(this.options && Array.isArray(this.options.subIds))
		this.options.subIds[peerId] = subId;
	return subId;
};





// Legacy --------------------------------------------


/** @deprecated  */
DiyaSelector.prototype.listen = function(){};

DiyaSelector.prototype.__old_deprecated_unsubscribe = function(subIds) {
	this.each(function(peerId){
		var subId = subIds[peerId];
		if(subId) this._connection.unsubscribe(subId);
	});
	return this;
}



// -------------------------------------



module.exports = d1;

},{"./DiyaNode":17,"inherits":2,"node-event-emitter":3,"q":undefined}],19:[function(require,module,exports){
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

// require('./services/timer/timer.js');
require('./services/rtc/rtc.js');
//require('./services/explorer/explorer.js');
//require('./services/pico/pico.js');
//require('./services/viewer_explorer/viewer_explorer.js');
require('./services/ieq/ieq.js');
//require('./services/networkId/NetworkId.js');
require('./services/maps/maps.js');
require('./services/peerAuth/PeerAuth.js');
require('./services/meshNetwork/MeshNetwork.js');
//require('./services/verbose/Verbose.js');
require('./utils/encoding/encoding.js');
require('./services/status/status.js');

module.exports = d1;

},{"./DiyaSelector.js":18,"./services/ieq/ieq.js":20,"./services/maps/maps.js":21,"./services/meshNetwork/MeshNetwork.js":22,"./services/peerAuth/PeerAuth.js":24,"./services/rtc/rtc.js":25,"./services/status/status.js":26,"./utils/encoding/encoding.js":27}],20:[function(require,module,exports){
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
	log: function(message){
		if(DEBUG) console.log(message);
	},

	error: function(message){
		if(DEBUG) console.error(message);
	}
};

/**
 * IEQ API handler
 */
function IEQ(selector){
	var that = this;
	this.selector = selector;
	this.dataModel={};
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
IEQ.prototype.getDataModel = function(){
	return this.dataModel;
};
IEQ.prototype.getDataRange = function(){
	return this.dataModel.range;
};

/**
 * @param {Object} dataConfig config for data request
 * if dataConfig is define : set and return this
 *	 @return {IEQ} this
 * else
 *	 @return {Object} current dataConfig
 */
IEQ.prototype.DataConfig = function(newDataConfig){
	if(newDataConfig) {
		this.dataConfig=newDataConfig;
		return this;
	}
	else
		return this.dataConfig;
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
IEQ.prototype.DataOperator = function(newOperator){
	if(newOperator) {
		this.dataConfig.operator = newOperator;
		return this;
	}
	else
		return this.dataConfig.operator;
};
/**
 * Depends on numSamples
 * @param {int} number of samples in dataModel
 * if defined : set number of samples
 *	@return {IEQ} this
 * else
 *	@return {int} number of samples
 **/
IEQ.prototype.DataSampling = function(numSamples){
	if(numSamples) {
		this.dataConfig.sampling = numSamples;
		return this;
	}
	else
		return this.dataConfig.sampling;
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
IEQ.prototype.DataTime = function(newTimeStart,newTimeEnd, newRange){
	if(newTimeStart || newTimeEnd || newRange) {
		this.dataConfig.criteria.time.start = newTimeStart.getTime();
		this.dataConfig.criteria.time.end = newTimeEnd.getTime();
		this.dataConfig.criteria.time.range = newRange;
		return this;
	}
	else
		return {
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
IEQ.prototype.DataRobotIds = function(robotIds){
	if(robotIds) {
		this.dataConfig.criteria.robot = robotIds;
		return this;
	}
	else
		return this.dataConfig.criteria.robot;
};
/**
 * Depends on placeIds
 * Set place criteria.
 *	@param {Array[Int]} placeIds list of place Ids
 * Get place criteria.
 *	@return {Array[Int]} list of place Ids
 */
IEQ.prototype.DataPlaceIds = function(placeIds){
	if(placeIds) {
		this.dataConfig.criteria.placeId = placeIds;
		return this;
	}
	else
		return this.dataConfig.criteria.place;
};
/**
 * Get data by sensor name.
 *	@param {Array[String]} sensorName list of sensors
 */



IEQ.prototype.getDataByName = function(sensorNames){
	var data=[];
	for(var n in sensorNames) {
		data.push(this.dataModel[sensorNames[n]]);
	}
	return data;
};
/**
 * Update data given dataConfig.
 * @param {func} callback : called after update
 * TODO USE PROMISE
 */






IEQ.prototype.updateData = function(callback, dataConfig){
	var that=this;

	if(dataConfig)
		this.DataConfig(dataConfig);
	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "ieq",
		func: "DataRequest",
		data: {
			type:"splReq",
			dataConfig: that.dataConfig
		}
	}, function(dnId, err, data){
		if(err) {
			Logger.error("["+that.dataConfig.sensors+"] Recv err: "+JSON.stringify(err));
			return;
		}
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("UpdateData:\n"+JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
			return;
		}
		that._getDataModelFromRecv(data);

		// Logger.log(that.getDataModel());

		callback = callback.bind(that); // bind callback with IEQ
		callback(that.getDataModel()); // callback func
	});
};

IEQ.prototype._isDataModelWithNaN = function() {
	var dataModelNaN=false;
	var sensorNan;
	for(var n in this.dataModel) {
		sensorNan = this.dataModel[n].data.reduce(function(nanPres,d) {
			return nanPres && isNaN(d);
		},false);
		dataModelNaN = dataModelNaN && sensorNan;
		Logger.log(n+" with nan : "+sensorNan+" ("+dataModelNaN+") / "+this.dataModel[n].data.length);
	}
};

IEQ.prototype.getConfinementLevel = function(){
	return this.confinement;
};

IEQ.prototype.getAirQualityLevel = function(){
	return this.airQuality;
};

IEQ.prototype.getEnvQualityLevel = function(){
	return this.envQuality;
};



/**
 * Update internal model with received data
 * @param  data to configure subscription
 * @param  callback called on answers (@param : dataModel)
 */
IEQ.prototype.watch = function(config, callback){
	var that = this;

	/** default **/
	config = config || {};
	config.timeRange = config.timeRange  || 'hours';
	config.cat = config.cat || 'ieq'; /* category */

	var subs = this.selector.subscribe({
		service: "ieq",
		func: "Data",
		data: config,
		obj: config.cat /* provide category of sensor to be watched, filtered according to CRM */
	}, function(dnId, err, data){
		if(err) {
			Logger.error("WatchIEQRecvErr:"+JSON.stringify(err));
			that.closeSubscriptions(); // should not be necessary
			that.subscriptionReqPeriod = that.subscriptionReqPeriod+1000||1000; // increase delay by 1 sec
			if(that.subscriptionReqPeriod > 300000) that.subscriptionReqPeriod=300000; // max 5min
			setTimeout(function() {	that.watch(config,callback); }, that.subscriptionReqPeriod); // try again later
			return;
		}
		that.subscriptionReqPeriod=0; // reset period on subscription requests
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("WatchIEQ:\n"+JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
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
IEQ.prototype.closeSubscriptions = function(){
	for(var i in this.subscriptions) {
		this.subscriptions[i].close();
	}
	this.subscriptions =[];
};

/**
 * request Data to make CSV file
 */
IEQ.prototype.getCSVData = function(sensorNames,_firstDay,callback){
	var firstDay = new Date(_firstDay);
	var dataConfig = {
		criteria: {
			time: { start: firstDay.getTime(), rangeUnit: 'hour', range: 180}, // 360h -> 15d // 180h -> 7j
			places: [],
			robots: []
		},
		sensors: sensorNames
	};
	this.updateData(callback, dataConfig);
};


IEQ.prototype.getHeatMapData = function(sensorNames,time, sample, callback){
	//var startParse = new Date(startEpoch);
	//var endParse = new Date(endEpoch);
	if (!sample) sample='minute';
	var dataConfig = {
		criteria: {
			time: {start: time.startEpoch, end: time.endEpoch, sampling: sample}, // 360h -> 15d // 180h -> 7j
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
IEQ.prototype._getDataModelFromRecv = function(data){
	var dataModel=null;
//	console.log('getDataModel');
//	console.log(data);

	if(data.err && data.err.st>0) {
		Logger.error(data.err.msg);
		return null;
	}
	delete data.err;
	if(data && data.header) {
		for (var n in data) {
			if(n != "header" && n != "err") {

				if(data[n].err && data[n].err.st>0) {
					Logger.error(n+" was in error: "+data[n].err.msg);
					continue;
				}

				if(!dataModel)
					dataModel={};

				// Logger.log(n);
				if(!dataModel[n]) {
					dataModel[n]={};
				}
				/* update data absolute range */
				dataModel[n].range=data[n].range;
				/* update data range */
				dataModel[n].timeRange=data[n].timeRange;
				/* update data label */
				dataModel[n].label=data[n].label;
				/* update data unit */
				dataModel[n].unit=data[n].unit;
				/* update data precision */
				dataModel[n].precision=data[n].precision;
				/* update data categories */
				dataModel[n].category=data[n].category;
				/* suggested y display range */
				dataModel[n].zoomRange = [0, 100];
				// update sensor confort range
				dataModel[n].confortRange = data[n].confortRange;

				/* update data indexRange */
				dataModel[n].qualityConfig={
					/* confortRange: data[n].confortRange, */
					indexRange: data[n].indexRange
				};
				dataModel[n].time = this._coder.from(data[n].time,'b64',8);
				dataModel[n].data = (data[n].data?this._coder.from(data[n].data,'b64',4):(data[n].avg?this._coder.from(data[n].avg.d,'b64',4):null));
				dataModel[n].qualityIndex = (data[n].data?this._coder.from(data[n].index,'b64',4):(data[n].avg?this._coder.from(data[n].avg.i,'b64',4):null));
				dataModel[n].robotId = this._coder.from(data[n].robotId,'b64',4);
				if(dataModel[n].robotId) {
					/** dico robotId -> robotName **/
					var dicoRobot = {};
					data.header.robots.forEach(function(el) {
						dicoRobot[el.id]=el.name;
					});
					dataModel[n].robotId = dataModel[n].robotId.map(function(el) {
						return dicoRobot[el];
					});
				}

				dataModel[n].placeId = this._coder.from(data[n].placeId,'b64',4);
				dataModel[n].x = null;
				dataModel[n].y = null;

				if(data[n].avg)
					dataModel[n].avg = {
						d: this._coder.from(data[n].avg.d,'b64',4),
						i: this._coder.from(data[n].avg.i,'b64',4)
					};
				if(data[n].min)
					dataModel[n].min = {
						d: this._coder.from(data[n].min.d,'b64',4),
						i: this._coder.from(data[n].min.i,'b64',4)
					};
				if(data[n].max)
					dataModel[n].max = {
						d: this._coder.from(data[n].max.d,'b64',4),
						i: this._coder.from(data[n].max.i,'b64',4)
					};
				if(data[n].stddev)
					dataModel[n].stddev = {
						d: this._coder.from(data[n].stddev.d,'b64',4),
						i: this._coder.from(data[n].stddev.i,'b64',4)
					};
				if(data[n].stddev)
					dataModel[n].stddev = {
						d: this._coder.from(data[n].stddev.d,'b64',4),
						i: this._coder.from(data[n].stddev.i,'b64',4)
					};
				if(data[n].x)
					dataModel[n].x = this._coder.from(data[n].x,'b64',4);
				if(data[n].y)
					dataModel[n].y = this._coder.from(data[n].y,'b64',4);
				/**
				 * current quality : {'b'ad, 'm'edium, 'g'ood}
				 * evolution : {'u'p, 'd'own, 's'table}
				 * evolution quality : {'b'etter, 'w'orse, 's'ame}
				 */
				/// TODO
				dataModel[n].trend = 'mss';
			}
		}
	}
	else {
		Logger.error("No Data to read or header is missing !");
	}
	/** list robots **/
//	dataModel.robots = [{name: 'D2R2', id:1}];
	this.dataModel=dataModel;
	return dataModel;
};





/** create IEQ service **/
DiyaSelector.prototype.IEQ = function(){
	return new IEQ(this);
};

},{"../../DiyaSelector":18,"../message":23,"util":7}],21:[function(require,module,exports){
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





EventEmitter = require('node-event-emitter');

function LOG(msg){
	//console.log(msg);
}

/**
 * Constructor
 *
 * @param map {String} map's name
 */
function Maps(peerIds) {


	this._peerIds = JSON.parse(JSON.stringify(peerIds));
	this._subIds = {}; // list of subscription Id (for unsubscription purpose) e.g {peerId0: subId0, ...}

	// list of registered place by Diya
	this._diyas = {};

	// get a list of Diya from selector and sort it
	this.listDiya = this._peerIds;
}
inherits(Maps, EventEmitter);

/////////////////////////////////////////
//// Static functions ///////////////////
/////////////////////////////////////////


/**
 * static function, get current place from diyanode
 *
 * @param selector {RegExp/String/Array<String>} selector of DiyaNode (also robot)
 * @param map {String} map's name
 * @param func {function()} callback function with return peerId, error and data ({ mapId, label, neuronId,  x, y})
 */
DiyaSelector.prototype.getCurrentPlace = function( peerId, func) {
	this.request({
		service: 'maps',
		func: 'GetCurrentPlace',
		obj: [ peerId ]
	}, function(peerId, err, data) {
		func(peerId, err, data);
	});
};

////////////////////∕∕∕∕∕∕/////////////////////////////////////////////∕∕∕∕∕∕///
//// Internal functions ///////////////////////////////////////////////∕∕∕∕∕∕///
////////////////////∕∕∕∕∕∕/////////////////////////////////////////////∕∕∕∕∕∕///

/**
 * round float to six decimals to compare, as the number in js is encoded in
 * IEEE 754 standard ~ around 16 decimal digits precision, we limit to 6 for
 * easier comparision and error due to arithmetic operation
 */
Maps.prototype._round = function (val) {
	// rouding to six decimals
	return Math.round(parseFloat(val) * 1000000) / 1000000;
};

/**
 * check equal with rounding
 */
Maps.prototype._isFloatEqual = function (val1, val2) {
	// rouding to two decimals
	return this._round(val1) === this._round(val2);
};

/**
 * check if map is modified by compare with internal list
 */
Maps.prototype.mapIsModified = function(peerId, map_info) {
	// double check
	map_info.scale = Array.isArray(map_info.scale) ? map_info.scale[0] : map_info.scale

	// ugly code but quick compare to loop
	return !(this._isFloatEqual(this._diyas[peerId].path.scale, map_info.scale) &&
				this._isFloatEqual(this._diyas[peerId].path.rotate, map_info.rotate) &&
				this._isFloatEqual(this._diyas[peerId].path.translate[0], map_info.translate[0]) &&
				this._isFloatEqual(this._diyas[peerId].path.translate[1], map_info.translate[1]) &&
				this._isFloatEqual(this._diyas[peerId].path.ratio, map_info.ratio));
}

/**
 * check if place is modified by compare with internal list
 */
Maps.prototype.placeIsModified = function(peerId, place_info) {
	// ugly code but quick compare to loop
	return !(this._isFloatEqual(this._diyas[peerId].places[place_info.id].x, place_info.x) &&
				this._isFloatEqual(this._diyas[peerId].places[place_info.id].y, place_info.y));
}

// /**
//  * add a Diya when selector changed and had new Diya
//  *
//  * @param peerId {String} peerId of DiyaNode (also robot)
//  * @param color {d3_rgb} d3 color
//  */
// Maps.prototype.addPeer = function(peerId) {
// 	this._diyas[peerId] = {
// 		mapId: null,
// 		path: null, // {translate: [], scale: null, rotate: null},
// 		places: {},
// 		mapIsModified: false,
// 	};
// }

/**
 * remove a Diya when there is a problem in listen map (subscription)
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 */
Maps.prototype.removePeer = function(peerId) {
	if (this._diyas[peerId]) {
		// remove
		delete this._diyas[peerId];
		this.emit("peer-unsubscribed", peerId);
	}

	// neccessary? if diyanode reconnect?
	if (this._subIds[peerId] !== null && !isNaN(this._subIds[peerId])) {
		// existed subscription ??
		// unsubscribe
		d1(peerId).unsubscribe(this._subIds);
		delete this._subIds[peerId];
	}
};

/**
 * connect to service map
 */
Maps.prototype.connect = function() {
	var that = this;
	// options for subscription
	var options = {
		auto: true, // auto resubscribe?
		subIds: [] // in fact, it is a list, but the code in DiyaSelector check for array
	};

	// subscribe for map service
	this.subMap = d1("#self").subscribe({
		service: 'maps',
		func: 'Robots',
		obj: this._peerIds
	}, function(peerId, err, data) {
		if (err || data.error) {
			LOG("Maps: fail to get info from map, error:", err || data.error, "!"); // mostly PeerDisconnected

			// remove that peer
			//that.removePeer(peerId);//...
			return;
		}

		if (data == null) return ;

		peerId = data.peerId;

		if(!peerId){
			LOG("Maps: received info without a peerId");
			return ;
		}

		if (!Array.isArray(data.places)) { // winner, this isn't 1st message
			data.places = [];
		}

		// data.place is current place
		if (data.place !== undefined) {
			data.places.push(data.place); // may be null ...
		}

		var map_info = null, places_info = [];

		if(data.type === 'MapInfo'){
			// data : {id, name, places, rotate, scale, tx, ty, ratio}
			if (that._diyas[peerId] == null) {
				that._diyas[peerId] = {
					path: {
						translate: [data.tx, data.ty],
						scale: data.scale,
						rotate: data.rotate,
						ratio: data.ratio
					},
					places: {}
				};
			} else {
				if (that._diyas[peerId].path == null) {
					that._diyas[peerId].path = {};
				}
				that._diyas[peerId].path.translate = [data.tx, data.ty];
				that._diyas[peerId].path.scale = data.scale;
				that._diyas[peerId].path.rotate = data.rotate;
				that._diyas[peerId].path.ratio = data.ratio;
				if (that._diyas[peerId].places == null) {
					that._diyas[peerId].places = {};
				}
			}
			map_info = {
				id: data.id,
				name: data.name,
				rotate: data.rotate,
				scale: data.scale,
				translate: [data.tx, data.ty],
				ratio: data.ratio
			};
		}

		// save data values
		data.places.map(function(place) {
			if (place) { // null if currentplace isn't init in DiyaNode
				// place { mapId, label, neuronId,  x, y}

				// neuronId (also place 's Id)
				var id = place.neuronId;

				// Update internal list
				// convert from Diya parameter (0..1 km) to diya-map (0..100000)
				place = {
					id: id,
					label: place.label,
					x: place.x,
					y: place.y,
					t: 360 * place.t
				};

				if (that._diyas[peerId].places[id] == null) { // nonexistent place
					// if is null or undefined
					that._diyas[peerId].places[id] = place; // save it
				}

				places_info.push(Object.create(place));// create a copy to send to user

				// save base place (first known place, also first element of places array)
				// useless at the moment
				// if (!that._diyas[peerId].basePlace) that._diyas[peerId].basePlace = place;
			} else { // current place is null
				places_info.push(null);
			}
		});

		if (places_info.length === 0) places_info = null;

		that.emit("peer-subscribed",peerId, map_info, places_info);
	}, options);

	for (var peerId in options.subIds) {
		if (this._subIds[peerId] !== null && !isNaN(this._subIds[peerId])) {
			// existed subscription ??
			d1("#self").unsubscribe(this._subIds)
			delete this._subIds[peerId];
			LOG("Maps: bug: existed subscription ??")
		} else {
			// save subId for later unsubscription
			this._subIds[peerId] = options.subIds[peerId];
		}
	}

	return this;
}

/**
 * disconnect from service map, free everything so it is safe to garbage collecte this service
 */
Maps.prototype.disconnect = function() {
	var that = this;
	if(this.subMap)
		this.subMap.close();
	for(var peerId in this._diyas){
		that.emit("peer-unsubscribed", peerId);
	}
	this._diyas = {};// delete ?
}

/**
 * save map
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param map_info {Object} ({rotate, scale, translate})
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.saveMap = function (targetPeerId, map_info, cb) {
	var _map_info = Object.create(map_info); // create a duplicate of map_info
	var that = this;
	// save map's info
	_map_info.scale = Array.isArray(_map_info.scale) ? _map_info.scale[0] : _map_info.scale

	if (this.mapIsModified(targetPeerId, _map_info)) {
		d1("#self").request({
			service: 'maps',
			func: 'UpdateMap',
			obj: [ targetPeerId ],
			data: {
				scale: _map_info.scale,
				tx: _map_info.translate[0],
				ty: _map_info.translate[1],
				rotate: _map_info.rotate,
				ratio: _map_info.ratio
			}
		}, function(peerId, err, data) {
			if (err != null) {
				that._diyas[targetPeerId].path.scale = _map_info.scale;
				that._diyas[targetPeerId].path.rotate = _map_info.rotate;
				that._diyas[targetPeerId].path.translate[0] = _map_info.translate[0];
				that._diyas[targetPeerId].path.translate[1] = _map_info.translate[1];
			}
			if (cb) cb(err);
		});
	} else {
		if (cb) cb(new Error("No change to map '" + this._map + "'!"));
	}
}

/**
 * update every places
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param place_info {Object} ({ id, x, y})
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.savePlace = function (targetPeerId, place_info, cb) {
	// save map's info
	var that = this;
	var error = "";

	var _place_info = Object.create(place_info);

	// save place
	if (this.placeIsModified(targetPeerId, _place_info)) {
		d1("#self").request({
			service: 'maps',
			func: 'UpdatePlace',
			obj: [ targetPeerId ],
			data: {
				neuronId: _place_info.id,
				x: _place_info.x,
				y: _place_info.y
			}
		}, function(peerId, err, data) {
			if (err != null) {
				that._diyas[targetPeerId].places[_place_info.id].x = _place_info.x;
				that._diyas[targetPeerId].places[_place_info.id].y = _place_info.y;
			}
			if (cb) cb(err);
		});
	} else {
		if (cb) cb(new Error("No change to place n " + _place_info.id + "!"));
	}
}

/**
 * delete every saved places of Diya (choosen in selector)
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.clearPlaces = function(targetPeerId, cb) {
	var that = this;

	d1("#self").request({
		service: 'maps',
		func: 'ClearMap',
		obj: [ targetPeerId ]
	}, function(peerId, err, data) {
		if (err != null) {
			// delete from internal list
			that._diyas[targetPeerId].places = {};
		}
		if (cb) cb(err);
	});
}

// export it as module of DiyaSelector
DiyaSelector.prototype.maps = function(peerIds) {
	var maps = new Maps(peerIds);

	return maps;
}

},{"node-event-emitter":3}],22:[function(require,module,exports){
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
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }


d1.knownPeers = function() {
	return d1("#self").knownPeers();
};
d1.kp = d1.knownPeers;



DiyaSelector.prototype.knownPeers = function(callback) {
	var deferred = Q.defer();
	this.request({service: 'meshNetwork',func: 'ListKnownPeers'}, function(peerId, err, data){
		if(err) return deferred.reject(err);
		var peers = [];
		for(var i=0; i<data.peers.length; i++) peers.push(data.peers[i].name);
		return deferred.resolve(peers);
	});
	return deferred.promise;
}



d1.listenMeshNetwork = function(callback) {
	return d1(/.*/).subscribe({ service: 'meshNetwork', func: 'MeshNetwork' }, callback, {auto: true});
};

},{"../../DiyaSelector":18,"q":undefined}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }

if(typeof INFO === 'undefined') INFO = function(s) { console.log(s);}
if(typeof OK === 'undefined') OK = function(s) { console.log(s);}



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
d1.installNodeExt = function(ip, user, password, bootstrap_ip, bootstrap_user, bootstrap_password, bootstrap_net, callback) {
	if(typeof ip !== 'string') throw "[installNode] ip should be an IP address";
	if(typeof bootstrap_ip !== 'string') throw "[installNode] bootstrap_ip should be an IP address";
	if(typeof bootstrap_net !== 'string') throw "[installNode] bootstrap_net should be an IP address";


	// Check and Format URI (FQDN)
	if(bootstrap_ip.indexOf("ws://") !== 0 && bootstrap_ip.indexOf("wss://") !== 0) {
		if(d1.isSecured()) bootstrap_ip = "wss://" + bootstrap_ip;
		else bootstrap_ip = "ws://" + bootstrap_ip;
	}
	if(bootstrap_net.indexOf("ws://") !== 0 && bootstrap_net.indexOf("wss://") !== 0) {
		if(d1.isSecured()) bootstrap_net = "wss://" + bootstrap_net;
		else bootstrap_net = "ws://" + bootstrap_net;
	}



	function join(peer, bootstrap_peer) {
		d1("#self").join(bootstrap_net, true, function(peer, err, data){
			if(!err) OK("JOINED !!!");
			return callback(peer, bootstrap_peer, err, data);
		});
	}

	d1.connectAsUser(ip, user, password).then(function(peer, err, data){
		d1("#self").givePublicKey(function(peer, err, data) {
			if(err==='ServiceNotFound') {
				INFO("Peer Authentication disabled ... directly joining");
				join();
				return;
			}
			else if(err) return callback(peer, null, err, null);
			else {
				INFO("Add trusted peer " + peer + "(ip=" + ip + ") to " + bootstrap_ip + " with public key " + data.public_key.slice(0,20));
				d1.connectAsUser(bootstrap_ip, bootstrap_user, bootstrap_password).then(function(){
					d1("#self").addTrustedPeer(peer, data.public_key, function(bootstrap_peer, err, data) {

						if(err) return callback(peer, bootstrap_peer, err, null);
						if(data.alreadyTrusted) INFO(peer + " already trusted by " + bootstrap_peer);
						else INFO(bootstrap_peer + "(ip="+ bootstrap_ip +") added " + peer + "(ip=" + ip + ") as a Trusted Peer");

						INFO("In return, add " + bootstrap_peer + " to " + peer + " as a Trusted Peer with public key " + data.public_key.slice(0,20));
						d1.connectAsUser(ip, user, password).then(function(){
							d1("#self").addTrustedPeer(bootstrap_peer, data.public_key, function(peer, err, data) {
								if(err) callback(peer, bootstrap_peer, err, null);
								else if(data.alreadyTrusted) INFO(bootstrap_peer + " already trusted by " + peer);
								else INFO(peer + "(ip="+ ip +") added " + bootstrap_peer + "(ip="+ bootstrap_ip +") as a Trusted Peer");
								// Once Keys have been exchanged ask to join the network
								OK("KEYS OK ! Now, let "+peer+"(ip="+ip+") join the network via "+bootstrap_peer+"(ip="+bootstrap_net+") ...");
								return join(peer, bootstrap_peer);
							});
						});
					});
				});
			}
		});
	});
}


/** Short version of @see{d1.installNodeExt} */
d1.installNode = function(bootstrap_ip, bootstrap_net, callback) {
		var ip = d1.addr();
		var user = d1.user();
		var password = d1.pass();
		var bootstrap_user = user;
		var bootstrap_password = password;
		return d1.installNodeExt(ip, user, password, bootstrap_ip, bootstrap_user, bootstrap_password, bootstrap_net, callback);
}




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
DiyaSelector.prototype.join = function(bootstrap_ips, bPermanent, callback){
	if(typeof bootstrap_ips === 'string') bootstrap_ips = [ bootstrap_ips ];
	if(bootstrap_ips.constructor !== Array) throw "join() : bootstrap_ips should be an array of peers URIs";
	this.request(
		{service : 'meshNetwork', func: 'Join', data: { bootstrap_ips: bootstrap_ips, bPermanent: bPermanent }},
		function(peerId, err, data) { if(typeof callback === "function") callback(peerId, err, data);}
	);
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
DiyaSelector.prototype.leave = function(bootstrap_ips, bPermanent, callback){
	if(typeof bootstrap_ips === 'string') bootstrap_ips = [ bootstrap_ips ];
	if(bootstrap_ips.constructor !== Array) throw "leave() : bootstrap_ips should be an array of peers URIs";
	this.request(
		{service : 'meshNetwork', func: 'Leave', data: { bootstrap_ips: bootstrap_ips, bPermanent: bPermanent }},
		function(peerId, err, data) { if(typeof callback === "function") callback(peerId, err, data);}
	);
};


/**
 * Ask the selected DiyaNodes for their public keys
 */
DiyaSelector.prototype.givePublicKey = function(callback){
	return this.request(
		{ service: 'peerAuth',	func: 'GivePublicKey',	data: {} },
		function(peerId, err, data){callback(peerId,err,data);
	});
};

/**
 * Add a new trusted peer RSA public key to the selected DiyaNodes
 * NOTE : This operation requires root role
 *
 * @param name : the name of the new trusted DiyaNode peer
 * @param public_key : the RSA public key of the new trusted DiyaNode peer
 */
DiyaSelector.prototype.addTrustedPeer = function(name, public_key, callback){
	return this.request({ service: 'peerAuth',	func: 'AddTrustedPeer',	data: { name: name, public_key: public_key }},
		function(peerId,err,data){callback(peerId,err,data);}
	);
};


/**
 * Check if the selected DiyaNodes trust the given peers
 * @param peers : an array of peer names
 */
DiyaSelector.prototype.areTrusted = function(peers, callback){
	return this.request(
		{ service: 'peerAuth',	func: 'AreTrusted',	data: { peers: peers } },
		function(peerId, err, data) {
			var allTrusted = data.trusted;
			if(allTrusted) { OK(peers + " are trusted by " + peerId); callback(peerId, true); }
			else { ERR("Some peers in " + peers + " are untrusted by " + peerId); callback(peerId, false); }
		}
	);
};
DiyaSelector.prototype.isTrusted = function(peer, callback) { return this.areTrusted([peer], callback); }


d1.trustedPeers = function() {
	var deferred = Q.defer();
	d1("#self").request(
		{ service: 'peerAuth',	func: 'GetTrustedPeers' },
		function(peerId, err, data) {
			if(err) return deferred.reject(err);
			var peers = [];
			for(var i=0; i<data.peers.length; i++) peers.push(data.peers[i].name);
			return deferred.resolve(peers);
		}
	);
	return deferred.promise;
};
d1.tp = d1.trustedPeers; // Shorthand

d1.blacklistedPeers = function() {
	var deferred = Q.defer();
	d1("#self").request(
		{ service: 'peerAuth',	func: 'GetBlacklistedPeers' },
		function(peerId, err, data) {
			if(err) return deferred.reject(err);
			var peers = [];
			for(var i=0; i<data.peers.length; i++) peers.push(data.peers[i].name);
			return deferred.resolve(peers);
		}
	);
	return deferred.promise;
};
d1.bp = d1.blacklistedPeers; // Shorthand

},{"../../DiyaSelector":18,"q":undefined}],25:[function(require,module,exports){
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





DiyaSelector = require('../../DiyaSelector').DiyaSelector;
EventEmitter = require('node-event-emitter');
inherits = require('inherits');

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
Channel.prototype.setDataChannel = function(datachannel){
	var that = this;
	this.channel = datachannel;
	this.channel.binaryType = 'arraybuffer';
	console.log("set data channel :"+this.name);
	datachannel.onmessage = function(message){
		// First message carries channel description header
		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if(typeChar === 'O') that.type = 'input'; //Promethe Output = Client Input
		else if(typeChar === 'I') that.type = 'output'; //Promethe Input = Client Output
		else throw "Unrecnognized channel type : " + typeChar;

		var size = view.getInt32(1,true);
		if(!size) throw "Wrong datachannel message size";
		that.size = size;
		that._buffer = new Float32Array(size);

		// Subsequent messages are forwarded to appropriate handlers
		datachannel.onmessage = that._onMessage.bind(that);
		datachannel.onclose = that._onClose.bind(that);

		if(typeof that.ondatachannel === 'function') that.ondatachannel(that.dnId, that);

		console.log('Open datachannel '+that.name);
	}
};

/** Bind an incoming RTC stream to this channel */
Channel.prototype.onAddStream = function(stream) {
	this.stream = stream;
	if(typeof this.onstream === 'function') this.onstream(this.dnId, stream);
	else console.warn("Ignore stream " + stream.id);

	console.log('Open stream '+this.name);
};


/** Close this channel */
Channel.prototype.close = function(){
	this.closed = true;
};

/** Write a scalar value to the given index on the RTC datachannel */
Channel.prototype.write = function(index, value){
	if(index < 0 || index > this.size || isNaN(value)) return false;
	this._buffer[index] = value;
	this._requestSend();
	return true;
};

/** Write an array of values to the RTC datachannel */
Channel.prototype.writeAll = function(values){
	if(!Array.isArray(values) || values.length !== this.size)
        return false;

    for (var i = 0; i<values.length; i++){
        if(isNaN(values[i])) return false;
        this._buffer[i] = values[i];
    }
    this._requestSend();
};

/** Ask to send the internal data buffer through the datachannel at the defined frequency */
Channel.prototype._requestSend = function(){
	var that = this;

	var elapsedTime = new Date().getTime() - this._lastSendTimestamp;
	var period = 1000 / this.frequency;
	if(elapsedTime >= period) doSend();
	else if(!this._sendRequested) {
		this._sendRequested = true;
		setTimeout(doSend, period - elapsedTime);
	}

	function doSend() {
		that._sendRequested = false;
		that._lastSendTimestamp = new Date().getTime();
		var ret = that._send(that._buffer);
		//If autosend is set, automatically send buffer at the given frequency
		if(ret && that.autosend) that._requestSend();
	}
};

/** Actual send the internal data buffer through the RTC datachannel */
Channel.prototype._send = function(msg){
	if(this.closed || !this.channel) return false;
	else if(this.channel.readyState === 'open') {
		try {
			this.channel.send(msg);
		} catch(e) {
			console.log('[rtc.channel.write] exception occured while sending data');
		}
		return true;
	}
	else {
		console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
		return false;
	}
};

/** Called when a message is received from the channel's RTC datachannel */
Channel.prototype._onMessage = function(message) {
	var valArray = new Float32Array(message.data);
	this.emit('value', valArray);
};

/** Called when the channel is closed on the remote side */
Channel.prototype._onClose = function() {
	console.log('Close datachannel '+this.name);
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
function Peer(dnId, rtc, id, channels){
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
Peer.prototype._connect = function(){
	var that = this;

	this.subscription = this.dn.subscribe({
		service: 'rtc', func: 'Connect', obj: this.channels, data: { promID: this.id }
	}, function(diya, err, data){
		if(data) {
			if(data.eventType === 'TurnInfo') that._turninfo = data.turn;
			else if(data.eventType === 'RemoteOffer') that._createPeer(data);
			else if(data.eventType === 'RemoteICECandidate') that._addRemoteICECandidate(data);
		}
	});

	this._timeoutId = setTimeout(function(){ if(!that.connected && !that.closed) that._reconnect(); }, 40000);
};

/** Reconnects the RTC peer */
Peer.prototype._reconnect = function(){
	this.close();

	this.peer = null;
	this.connected = false;
	this.closed = false;

	this._connect();
};


/** Creates a RTCPeerConnection in response to a RemoteOffer */
Peer.prototype._createPeer = function(data){
	var that = this;

	var iceServers = [];
	if(this._turninfo) {
		if (!Array.isArray(this._turninfo)) {
			iceServers.push({ 
				urls: [ this._turninfo.url ], 
				username: this._turninfo.username, 
				credential: this._turninfo.password 
			});
		} else {
			iceServers = this._turninfo.map(function(turn) { 
				return { 
					urls: [ turn.url ], 
					username: turn.username, 
					credential: turn.password 
				} 
			});
		}
	} else {
		iceServers.push({urls: [ "stun:stun.l.google.com:19302" ]});
	}
	
	var config = {
		iceServers: iceServers,
		iceTransportPolicy: 'all'
	};

	var constraints = {
		mandatory: {DtlsSrtpKeyAgreement: true, OfferToReceiveAudio: true, OfferToReceiveVideo:true}
	}
	
	var peer = new RTCPeerConnection(config,  constraints);
	this.peer = peer;

	this.streams.forEach(function(s) {
		peer.addStream(s);
	});

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
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
	},
	function(err){ console.log(err); },
	{'mandatory': { OfferToReceiveAudio: true, OfferToReceiveVideo: true}});

	peer.oniceconnectionstatechange = function(){
		if(peer.iceConnectionState === 'connected'){
			that.connected = true;
			if(that.subscription) that.subscription.close();
		}
		else if(peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'closed' || peer.iceConnectionState === 'failed'){
			if(!that.closed) that._reconnect();
		}
	};

	peer.onicecandidate = function(evt){
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

	peer.ondatachannel = function(evt){
		that.connected = true;
		that.rtc._onDataChannel(that.dnId, evt.channel);
	};

	peer.onaddstream = function(evt) {
		that.connected = true;
		that.rtc._onAddStream(that.dnId, evt.stream);
	};
};


Peer.prototype._addRemoteICECandidate = function(data){
	try {
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate, function(){},function(err){ console.error(err);	});
	} catch(err) { console.error(err); }
};

/** Send the mappings from channel names to stream IDs */
Peer.prototype.sendChannelsStreamsMappings = function() {
	this.dn.request({
		service:"rtc",
		func:"ChannelsStreamsMappings",
		data:{peerId:0, mappings:this.rtc[this.dnId].channelsByStream}
	}, function(peerId, err, data){
		if(err) console.error(err);
	});
};

/** Adds a local stream to this Peer */
Peer.prototype.addStream = function(stream) {
	this.sendChannelsStreamsMappings();
	if(!this.streams.filter(function(s){return stream.id === s;})[0]) this.streams.push(stream);
	this._reconnect();
}

Peer.prototype.removeStream = function(stream) {
	this.streams = this.streams.filter(function(s){return stream.id !== s;});
	if(this.peer) this.peer.removeStream(stream);
}

Peer.prototype.close = function(){
	if(this.subscription) this.subscription.close();
	clearTimeout(this._timeoutId);
	if(this.peer){
		try{
			this.peer.close();
		}catch(e){}
		this.connected = false;
		this.closed = true;
	}
};




//////////////////////////////////////////////////////////////////////////////
/////////////////////////// RTC service implementation ///////////////////////
//////////////////////////////////////////////////////////////////////////////



function RTC(selector){
	var that = this;
	this.selector = selector;

	this.requestedChannels = [];
	this.channelsByStream = [];
}

RTC.prototype.use = function(name_regex, type, ondatachannel_callback, onaddstream_callback){
	this.requestedChannels.push({regex: name_regex, type:type, cb: ondatachannel_callback, stream_cb: onaddstream_callback});
	return this;
};

/** Start listening to Peers connections.
 * A 'Peer' object will be created for each DiyaNode peerId and each promID
 */
RTC.prototype.connect = function(){
	var that = this;


	this.subscription = this.selector.subscribe({
		service: 'rtc',
		func: 'Peers'
	}, function(dnId, err, data){

		if(!that[dnId]) that._createDiyaNode(dnId);

		if(err === 'SubscriptionClosed' || err === 'PeerDisconnected'){
			that._closeDiyaNode(dnId);
			return ;
		}

		if(data && data.eventType && data.promID !== undefined){

			if(data.eventType === 'PeerConnected'){
				if(!that[dnId].peers[data.promID]){
					var channels = that._matchChannels(dnId, data.channels);
					if(channels.length > 0){
						that[dnId].peers[data.promID] = new Peer(dnId, that, data.promID, channels);
					}

					// Autoreconnect declared streams
					that.channelsByStream.forEach(function(cbs) {
						that.addStream(cbs.channel, cbs.mediaStream);
					});
				}
				if(that[dnId].peers[data.promID]) that[dnId].peers[data.promID].sendChannelsStreamsMappings();
			}
			else if(data.eventType === 'PeerClosed') {
				if(that[dnId].peers[data.promID]) {
					that._closePeer(dnId, data.promID);
					if(typeof that.onclose === 'function') that.onclose(dnId);
				}
			}

		}

	}, {auto: true});

	return this;
};

RTC.prototype.disconnect = function(){
	var that = this;

	this.selector.each(function(dnId){
		if(!that[dnId]) return ;
		for(var promID in that[dnId].peers){
			that._closePeer(dnId, promID);
		}
	});

	if(this.subscription) this.subscription.close();
	return this;
};


RTC.prototype._createDiyaNode = function(dnId){
	var that = this;

	this[dnId] = {
		dnId: dnId,
		usedChannels: [],
		requestedChannels: [],
		peers: [],
		channelsByStream: []
	}

	this.requestedChannels.forEach(function(c){that[dnId].requestedChannels.push(c)});
};

RTC.prototype._closeDiyaNode = function(dnId){
	for(var promID in this[dnId].peers){
		this._closePeer(dnId, promID);
	}

	delete this[dnId];
};

RTC.prototype._closePeer = function(dnId, promID){
	if(this[dnId].peers[promID]){
		var p = this[dnId].peers[promID];
		p.close();

		for(var i=0;i<p.channels.length; i++){
			delete this[dnId].usedChannels[p.channels[i]];
		}

		delete this[dnId].peers[promID];
	}
};

/** Matches the given receivedChannels proposed by the given DiyaNode peerId
 *  against the requested channels and creates a Channel for each match
 */
RTC.prototype._matchChannels = function(dnId, receivedChannels){
	var that = this;

	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];
		var remoteStreamId = name.split("_;:_")[1];
		name = name.split("_;:_")[0];

		for(var j = 0; j < that[dnId].requestedChannels.length; j++){
			var req = that[dnId].requestedChannels[j];

			if(name && name.match(req.regex) && !that[dnId].usedChannels[name]){
				var channel = new Channel(dnId, name, req.cb, req.stream_cb);
				that[dnId].usedChannels[name] = channel;
				channels.push(name);

				// If a stream id is provided for the channel, register the mapping
				if(remoteStreamId) {
					that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.stream !== remoteStreamId && cbs.channel !== channel; });
					that[dnId].channelsByStream.push({stream:remoteStreamId, channel:channel});
					channel.streamId = streamId;
				}
				var localStreamId = that.channelsByStream.filter(function(cbs){return cbs.channel === name; })[0];
				if(localStreamId) {
					that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.stream !== localStreamId && cbs.channel !== name; });
					that[dnId].channelsByStream.push({stream:localStreamId, channel:name});
					channel.localStreamId = localStreamId;
				}
			}
		}
	}

	return  channels;
};


/** Called upon RTC datachannels connections */
RTC.prototype._onDataChannel = function(dnId, datachannel){
	if(!this[dnId]) return console.warn("Tried to open a data channel on a closed peer");
	var channel = this[dnId].usedChannels[datachannel.label];

	if(!channel){
		console.log("Datachannel "+datachannel.label+" unmatched, closing !");
		datachannel.close();
		return ;
	}
	channel.setDataChannel(datachannel);
};

/** Called upon RTC stream channel connections */
RTC.prototype._onAddStream = function(dnId, stream) {
	if(!this[dnId]) return console.warn("Tried to open a stream on a closed peer");

	var channel = this[dnId].usedChannels[stream.id];

	if(!channel){
		console.warn("Stream Channel "+ stream.id +" unmatched, closing !");
		stream.close();
		return ;
	}
	channel.onAddStream(stream);
};

/** Add a local stream to be sent through the given RTC channel */
RTC.prototype.addStream = function(channel, stream) {
	var that = this;

	// Register the channel<->stream mapping
	this.channelsByStream = this.channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });
 	this.channelsByStream.push({channel:channel, stream:stream.id, mediaStream:stream});

	console.log("Open local stream " + channel);

	// Send the channel<->stream mapping to all connected Peers
	this.selector.each(function(dnId){
		if(!that[dnId]) return ;
		that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });
		that[dnId].channelsByStream.push({channel:channel, stream:stream.id});
		for(var promID in that[dnId].peers){
			that[dnId].peers[promID].addStream(stream);
		}
	});

};

RTC.prototype.removeStream = function(channel, stream) {
	var that = this;

	// Register the channel<->stream mapping
	this.channelsByStream = this.channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });

	console.log("Close local stream " + channel);

	// Send the channel<->stream mapping to all connected Peers
	this.selector.each(function(dnId){
		if(!that[dnId]) return ;
		that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });
		for(var promID in that[dnId].peers){
			that[dnId].peers[promID].removeStream(stream);
		}
	});
};


////////////////////////

DiyaSelector.prototype.rtc = function(){ return new RTC(this);};

},{"../../DiyaSelector":18,"inherits":2,"node-event-emitter":3,"webrtc-adapter":8}],26:[function(require,module,exports){
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
	log: function(message){
		if(DEBUG) console.log(message);
	},

	error: function(message){
		if(DEBUG) console.error(message);
	}
};

/**
 *	callback : function called after model updated
 * */
function Status(selector){
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
Status.prototype.getRobotModel = function(){
	return this.robotModel;
};

/**
 * @param {Object} dataConfig config for data request
 * if dataConfig is define : set and return this
 *	 @return {Status} this
 * else
 *	 @return {Object} current dataConfig
 */
Status.prototype.DataConfig = function(newDataConfig){
	if(newDataConfig) {
		this.dataConfig=newDataConfig;
		return this;
	}
	else
		return this.dataConfig;
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
Status.prototype.DataOperator = function(newOperator){
	if(newOperator) {
		this.dataConfig.operator = newOperator;
		return this;
	}
	else
		return this.dataConfig.operator;
};
/**
 * Depends on numSamples
 * @param {int} number of samples in dataModel
 * if defined : set number of samples
 *	@return {Status} this
 * else
 *	@return {int} number of samples
 **/
Status.prototype.DataSampling = function(numSamples){
	if(numSamples) {
		this.dataConfig.sampling = numSamples;
		return this;
	}
	else
		return this.dataConfig.sampling;
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
Status.prototype.DataTime = function(newTimeBeg,newTimeEnd, newRange){
	if(newTimeBeg || newTimeEnd || newRange) {
		this.dataConfig.criteria.time.beg = newTimeBeg.getTime();
		this.dataConfig.criteria.time.end = newTimeEnd.getTime();
		this.dataConfig.criteria.time.range = newRange;
		return this;
	}
	else
		return {
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
Status.prototype.DataRobotIds = function(robotIds){
	if(robotIds) {
		this.dataConfig.criteria.robot = robotIds;
		return this;
	}
	else
		return this.dataConfig.criteria.robot;
};
/**
 * Depends on placeIds // not relevant?, not implemented yet
 * Set place criteria.
 *	@param {Array[Int]} placeIds list of place Ids
 * Get place criteria.
 *	@return {Array[Int]} list of place Ids
 */
Status.prototype.DataPlaceIds = function(placeIds){
	if(placeIds) {
		this.dataConfig.criteria.placeId = placeIds;
		return this;
	}
	else
		return this.dataConfig.criteria.place;
};
/**
 * Get data by sensor name.
 *	@param {Array[String]} sensorName list of sensors
 */
Status.prototype.getDataByName = function(sensorNames){
	var data=[];
	for(var n in sensorNames) {
		data.push(this.dataModel[sensorNames[n]]);
	}
	return data;
};

/**
 * Subscribe to error/status updates
 */
Status.prototype.watch = function(robotNames, callback){
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
			Logger.error( "StatusSubscribe:"+err );
			that.closeSubscriptions(); // should not be necessary
			that.subscriptionReqPeriod = that.subscriptionReqPeriod+1000||1000; // increase delay by 1 sec
			if(that.subscriptionReqPeriod > 60000) that.subscriptionReqPeriod=60000; // max 1min
			setTimeout(function() {	that.watch(data,callback); }, that.subscriptionReqPeriod); // try again later
			return;
		}
		that.subscriptionReqPeriod=0; // reset period on subscription requests
		if (data&&data.err&&data.err.st) {
			Logger.error( "WatchStatusErr:"+JSON.stringify(data.err));
		} else {
			that._getRobotModelFromRecv2(data);
			if(typeof callback === 'function')
				callback(that.robotModel);
		}
	});
	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
Status.prototype.closeSubscriptions = function(){
	for(var i in this.subscriptions) {
		this.subscriptions[i].close();
	}
	this.subscriptions =[];
	this.robotModel = [];
};


/**
 * Get data given dataConfig.
 * @param {func} callback : called after update
 * TODO USE PROMISE
 */
Status.prototype.getData = function(callback, dataConfig){
	var that=this;
	var dataModel = {};
	if(dataConfig)
		this.DataConfig(dataConfig);
	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "status",
		func: "DataRequest",
		data: {
			type:"splReq",
			dataConfig: that.dataConfig
		}
	}, function(dnId, err, data){
		if(err) {
			Logger.error("["+that.dataConfig.sensors+"] Recv err: "+JSON.stringify(err));
			return;
		}
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("UpdateData:\n"+JSON.stringify(data.header.reqConfig));
			Logger.error("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
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
Status.prototype._getRobotModelFromRecv2 = function(data){
	var robot;
	var dataRobots = data.robots;
	var dataParts = data.partList;
	if(!this.robotModel)
		this.robotModel = [];
	// console.log("_getRobotModelFromRecv");
	// console.log(this.robotModel);

	for(var n in this.robotModel) {
		// console.log(n);
		this.robotModel[n].parts = {}; // reset parts
	}

	for(var n in dataRobots) {
		if(!this.robotModel[n])
			this.robotModel[n]={};
		this.robotModel[n].robot = dataRobots[n].robot;

		// if(this.robotModel.length<data.length) {
		// 	this.robotModel.push({robot: data[0].robots});
		// }

		/** extract parts info **/
		if(dataRobots[n] && dataRobots[n].parts) {
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
				if(!rParts[p]) {
					rParts[p]={};
				}
				if(parts[p]) {
					// Logger.log(n);
					/* update part category */
					rParts[p].category=dataParts[p].category;
					/* update part name */
					rParts[p].name=dataParts[p].name;
					/* update part label */
					rParts[p].label=dataParts[p].label;
					/* update error time */
					// console.log(parts[p]);
					// console.log(parts[p].errors.time);
					// console.log(rParts[p].time);
					/* update error */
					// console.log(parts[p].errors.code);

					/** update errorList **/
					if(!rParts[p].errorList)
						rParts[p].errorList={};
					for( var el in dataParts[p].errorList )
						if(!rParts[p].errorList[el])
							rParts[p].errorList[el] = dataParts[p].errorList[el];
					var evts_tmp = {
						time: this._coder.from(parts[p].time),
						code: this._coder.from(parts[p].code),
						codeRef: this._coder.from(parts[p].codeRef)
					};
					/** if received list of events **/
					if(Array.isArray(evts_tmp.code) || Array.isArray(evts_tmp.time)
					   || Array.isArray(evts_tmp.codeRef)) {
						if(evts_tmp.code.length === evts_tmp.codeRef.length
						   && evts_tmp.code.length === evts_tmp.time.length) {
							/** build list of events **/
							rParts[p].evts = [];
							for(var i=0; i<evts_tmp.code.length; i++) {
								rParts[p].evts.push({
									time: evts_tmp.time[i],
									code: evts_tmp.code[i],
									codeRef: evts_tmp.codeRef[i]});
							}
						}
						else Logger.error("Status:Inconsistant lengths of buffers (time/code/codeRef)");
					}
					else { /** just in case, to provide backward compatibility **/
						/** set received event **/
						rParts[p].evts = [{
							time: evts_tmp.time,
							code: evts_tmp.code,
							codeRef: evts_tmp.codeRef}];
					}
				}
				// console.log(rParts[p].error);
			}
			// console.log('parts, rParts');
			// console.log(parts);
 		// 	console.log(rParts);
		}
		else {
			Logger.error("No parts to read for robot "+data[n].name);
		}
	}
};


/**
 * Update internal robot model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
Status.prototype._getRobotModelFromRecv = function(data){
	var robot;

	if(!this.robotModel)
		this.robotModel = [];
	// console.log("_getRobotModelFromRecv");
	// console.log(this.robotModel);

	/** Only one robot is manage at the same time currently **/
	for(var n in data) {
		if(!this.robotModel[n])
			this.robotModel[n]={};
		this.robotModel[n].robot = data[n].robot;

		// if(this.robotModel.length<data.length) {
		// 	this.robotModel.push({robot: data[0].robots});
		// }

		/** extract parts info **/
		if(data[n] && data[n].parts) {
			if(!this.robotModel[n].parts)
				this.robotModel[n].parts = {};
			var parts = data[n].parts;
			var rParts = this.robotModel[n].parts;
			for(var q in rParts) {
				/** part[q] was not sent because no error **/
				if(!parts[q]
				   &&rParts[q].evts&&rParts[q].evts.code) {
					rParts[q].evts = {
						code: [0],
						codeRef: [0],
						time: [Date.now()] /** update **/
					};
				}
			}
			for (var p in parts) {
				if(parts[p]&&parts[p].err && parts[p].err.st>0) {
					Logger.error("Parts "+p+" was in error: "+data[p].err.msg);
					continue;
				}
				if(!rParts[p]) {
					rParts[p]={};
				}
				if(parts[p]) {
					// Logger.log(n);
					/* update part category */
					rParts[p].category=parts[p].category;
					/* update part name */
					rParts[p].name=parts[p].name;
					/* update part label */
					rParts[p].label=parts[p].label;
					/* update error time */
					// console.log(parts[p]);
					// console.log(parts[p].errors.time);
					// console.log(rParts[p].time);
					/* update error */
					// console.log(parts[p].errors.code);

					/** update errorList **/
					if(!rParts[p].errorList)
						rParts[p].errorList={};
					for( var el in parts[p].errorList )
						if(!rParts[p].errorList[el])
							rParts[p].errorList[el] = parts[p].errorList[el];

					rParts[p].evts = {
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
		}
		else {
			Logger.error("No parts to read for robot "+data[n].name);
		}
	}
};

/** create Status service **/
DiyaSelector.prototype.Status = function(){
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
DiyaSelector.prototype.setStatus = function(robotName, partName, code, source, callback) {
	var funcName = "SetStatus_"+partName;
	this.request(
		{service:"status",func:funcName,data: {robotName: robotName, statusCode: code, partName: partName, source: source|1}}, function(peerId, err, data) {
			if(err) {
				if(callback) callback(false);
			}
			else {
				if(callback) callback(true);
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
DiyaSelector.prototype.getStatus = function(robotName, partName, callback, _full) {
	var full=_full||false;
	this.request(
		{service:"status",func:"GetStatus",data: {robotName: robotName, partName: partName, full: full}}, function(peerId, err, data) {
			if(err) {
				if(callback) callback(-1);
			}
			else {
				if(callback) callback(data);
			}
		});
};

},{"../../DiyaSelector":18,"../message":23,"util":7}],27:[function(require,module,exports){
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
function NoCoding(){
	return this;
};

/**
*
*/
NoCoding.prototype.from = function(data) {
	if(data.d === 'number' || Array.isArray(data.d))
		return data.d;
	else
		return data;
};

/**
*/
NoCoding.prototype.to = function(array) {
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
function Base64Coding(){
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
var b64ToUint6 = function(nChr) {
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
 * @param  {String} sBase64		base64 coded string
 * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
 * @return {Uint8Array}				tab of decoded bytes
 */
var base64DecToArr = function(sBase64, nBlocksSize) {
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
Base64Coding.prototype.from = function(data) {
	var byteCoding = data.b;

	/* check byte coding */
	if(byteCoding !== 4 && byteCoding !== 8) {
		return null;
	}

	/* decode data to array of byte */
	var buf = base64DecToArr(data.d, data.b);
	/* parse data to float array */
	var fArray=null;
	switch(data.b) {
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

	if(data.s !== tab.length) {
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
Base64Coding.prototype.to = function(array, byteCoding) {
	/* check byte coding */
	if(byteCoding !== 4 && byteCoding !== 8) {
		return null;
	}

	/*** case ArrayBuffer ***/
	var buffer = new ArrayBuffer(array.length*byteCoding);
	switch(byteCoding) {
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
	for(var n =0; n<buffChar.length; n++) {
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
function CodingHandler(){
	this.b64 = new Base64Coding();
	this.none = new NoCoding();

	return this;
};


CodingHandler.prototype.from = function(data) {
	if(typeof data == 'undefined' || data==null)
		return null;
	switch(data.t) {
	case 'b64':
		return this.b64.from(data);
	default:
		return this.none.from(data);
	}
};


CodingHandler.prototype.to = function(array, type, byteCoding) {
	if(typeof array === 'number') {
		array=[array];
	}
	if(!Array.isArray(array)){
		console.log("CodingHandler.to only accepts array !");
		return null;
	}

	switch(type) {
	case 'b64':
		return this.b64.to(array, byteCoding);
	case 'no':
	default:
		return this.none.to(array);
	}
};


/** Add base64 handler to DiyaSelector **/
DiyaSelector.prototype.encode = function(){
	return new CodingHandler();
};

},{"../../DiyaSelector":18,"base-64":1}]},{},[19])(19)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9iYXNlLTY0L2Jhc2U2NC5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9ub2RlLWV2ZW50LWVtaXR0ZXIvaW5kZXguanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2FkYXB0ZXJfY29yZS5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9jaHJvbWUvY2hyb21lX3NoaW0uanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvY2hyb21lL2dldHVzZXJtZWRpYS5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9lZGdlL2VkZ2Vfc2RwLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZWRnZV9zaGltLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZmlyZWZveF9zaGltLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZ2V0dXNlcm1lZGlhLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL3NhZmFyaS9zYWZhcmlfc2hpbS5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy91dGlscy5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvc3JjL0RpeWFOb2RlLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvRGl5YVNlbGVjdG9yLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9pZXEvaWVxLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvbWFwcy9tYXBzLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzaE5ldHdvcmsvTWVzaE5ldHdvcmsuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9tZXNzYWdlLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvcGVlckF1dGgvUGVlckF1dGguanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvc3RhdHVzL3N0YXR1cy5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvc3JjL3V0aWxzL2VuY29kaW5nL2VuY29kaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2tCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzE3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9vQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9kQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNobUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3prQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKiEgaHR0cDovL210aHMuYmUvYmFzZTY0IHYwLjEuMCBieSBAbWF0aGlhcyB8IE1JVCBsaWNlbnNlICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgLlxuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLlxuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgLCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUsIGFuZCB1c2Vcblx0Ly8gaXQgYXMgYHJvb3RgLlxuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBJbnZhbGlkQ2hhcmFjdGVyRXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0fTtcblx0SW52YWxpZENoYXJhY3RlckVycm9yLnByb3RvdHlwZSA9IG5ldyBFcnJvcjtcblx0SW52YWxpZENoYXJhY3RlckVycm9yLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cblx0dmFyIGVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdC8vIE5vdGU6IHRoZSBlcnJvciBtZXNzYWdlcyB1c2VkIHRocm91Z2hvdXQgdGhpcyBmaWxlIG1hdGNoIHRob3NlIHVzZWQgYnlcblx0XHQvLyB0aGUgbmF0aXZlIGBhdG9iYC9gYnRvYWAgaW1wbGVtZW50YXRpb24gaW4gQ2hyb21pdW0uXG5cdFx0dGhyb3cgbmV3IEludmFsaWRDaGFyYWN0ZXJFcnJvcihtZXNzYWdlKTtcblx0fTtcblxuXHR2YXIgVEFCTEUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cdC8vIGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvY29tbW9uLW1pY3Jvc3ludGF4ZXMuaHRtbCNzcGFjZS1jaGFyYWN0ZXJcblx0dmFyIFJFR0VYX1NQQUNFX0NIQVJBQ1RFUlMgPSAvW1xcdFxcblxcZlxcciBdL2c7XG5cblx0Ly8gYGRlY29kZWAgaXMgZGVzaWduZWQgdG8gYmUgZnVsbHkgY29tcGF0aWJsZSB3aXRoIGBhdG9iYCBhcyBkZXNjcmliZWQgaW4gdGhlXG5cdC8vIEhUTUwgU3RhbmRhcmQuIGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvd2ViYXBwYXBpcy5odG1sI2RvbS13aW5kb3diYXNlNjQtYXRvYlxuXHQvLyBUaGUgb3B0aW1pemVkIGJhc2U2NC1kZWNvZGluZyBhbGdvcml0aG0gdXNlZCBpcyBiYXNlZCBvbiBAYXRr4oCZcyBleGNlbGxlbnRcblx0Ly8gaW1wbGVtZW50YXRpb24uIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2F0ay8xMDIwMzk2XG5cdHZhciBkZWNvZGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdGlucHV0ID0gU3RyaW5nKGlucHV0KVxuXHRcdFx0LnJlcGxhY2UoUkVHRVhfU1BBQ0VfQ0hBUkFDVEVSUywgJycpO1xuXHRcdHZhciBsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdFx0aWYgKGxlbmd0aCAlIDQgPT0gMCkge1xuXHRcdFx0aW5wdXQgPSBpbnB1dC5yZXBsYWNlKC89PT8kLywgJycpO1xuXHRcdFx0bGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRsZW5ndGggJSA0ID09IDEgfHxcblx0XHRcdC8vIGh0dHA6Ly93aGF0d2cub3JnL0MjYWxwaGFudW1lcmljLWFzY2lpLWNoYXJhY3RlcnNcblx0XHRcdC9bXithLXpBLVowLTkvXS8udGVzdChpbnB1dClcblx0XHQpIHtcblx0XHRcdGVycm9yKFxuXHRcdFx0XHQnSW52YWxpZCBjaGFyYWN0ZXI6IHRoZSBzdHJpbmcgdG8gYmUgZGVjb2RlZCBpcyBub3QgY29ycmVjdGx5IGVuY29kZWQuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIGJpdENvdW50ZXIgPSAwO1xuXHRcdHZhciBiaXRTdG9yYWdlO1xuXHRcdHZhciBidWZmZXI7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdHZhciBwb3NpdGlvbiA9IC0xO1xuXHRcdHdoaWxlICgrK3Bvc2l0aW9uIDwgbGVuZ3RoKSB7XG5cdFx0XHRidWZmZXIgPSBUQUJMRS5pbmRleE9mKGlucHV0LmNoYXJBdChwb3NpdGlvbikpO1xuXHRcdFx0Yml0U3RvcmFnZSA9IGJpdENvdW50ZXIgJSA0ID8gYml0U3RvcmFnZSAqIDY0ICsgYnVmZmVyIDogYnVmZmVyO1xuXHRcdFx0Ly8gVW5sZXNzIHRoaXMgaXMgdGhlIGZpcnN0IG9mIGEgZ3JvdXAgb2YgNCBjaGFyYWN0ZXJz4oCmXG5cdFx0XHRpZiAoYml0Q291bnRlcisrICUgNCkge1xuXHRcdFx0XHQvLyDigKZjb252ZXJ0IHRoZSBmaXJzdCA4IGJpdHMgdG8gYSBzaW5nbGUgQVNDSUkgY2hhcmFjdGVyLlxuXHRcdFx0XHRvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShcblx0XHRcdFx0XHQweEZGICYgYml0U3RvcmFnZSA+PiAoLTIgKiBiaXRDb3VudGVyICYgNilcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHQvLyBgZW5jb2RlYCBpcyBkZXNpZ25lZCB0byBiZSBmdWxseSBjb21wYXRpYmxlIHdpdGggYGJ0b2FgIGFzIGRlc2NyaWJlZCBpbiB0aGVcblx0Ly8gSFRNTCBTdGFuZGFyZDogaHR0cDovL3doYXR3Zy5vcmcvaHRtbC93ZWJhcHBhcGlzLmh0bWwjZG9tLXdpbmRvd2Jhc2U2NC1idG9hXG5cdHZhciBlbmNvZGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdGlucHV0ID0gU3RyaW5nKGlucHV0KTtcblx0XHRpZiAoL1teXFwwLVxceEZGXS8udGVzdChpbnB1dCkpIHtcblx0XHRcdC8vIE5vdGU6IG5vIG5lZWQgdG8gc3BlY2lhbC1jYXNlIGFzdHJhbCBzeW1ib2xzIGhlcmUsIGFzIHN1cnJvZ2F0ZXMgYXJlXG5cdFx0XHQvLyBtYXRjaGVkLCBhbmQgdGhlIGlucHV0IGlzIHN1cHBvc2VkIHRvIG9ubHkgY29udGFpbiBBU0NJSSBhbnl3YXkuXG5cdFx0XHRlcnJvcihcblx0XHRcdFx0J1RoZSBzdHJpbmcgdG8gYmUgZW5jb2RlZCBjb250YWlucyBjaGFyYWN0ZXJzIG91dHNpZGUgb2YgdGhlICcgK1xuXHRcdFx0XHQnTGF0aW4xIHJhbmdlLidcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHZhciBwYWRkaW5nID0gaW5wdXQubGVuZ3RoICUgMztcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0dmFyIHBvc2l0aW9uID0gLTE7XG5cdFx0dmFyIGE7XG5cdFx0dmFyIGI7XG5cdFx0dmFyIGM7XG5cdFx0dmFyIGQ7XG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHQvLyBNYWtlIHN1cmUgYW55IHBhZGRpbmcgaXMgaGFuZGxlZCBvdXRzaWRlIG9mIHRoZSBsb29wLlxuXHRcdHZhciBsZW5ndGggPSBpbnB1dC5sZW5ndGggLSBwYWRkaW5nO1xuXG5cdFx0d2hpbGUgKCsrcG9zaXRpb24gPCBsZW5ndGgpIHtcblx0XHRcdC8vIFJlYWQgdGhyZWUgYnl0ZXMsIGkuZS4gMjQgYml0cy5cblx0XHRcdGEgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA8PCAxNjtcblx0XHRcdGIgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pIDw8IDg7XG5cdFx0XHRjID0gaW5wdXQuY2hhckNvZGVBdCgrK3Bvc2l0aW9uKTtcblx0XHRcdGJ1ZmZlciA9IGEgKyBiICsgYztcblx0XHRcdC8vIFR1cm4gdGhlIDI0IGJpdHMgaW50byBmb3VyIGNodW5rcyBvZiA2IGJpdHMgZWFjaCwgYW5kIGFwcGVuZCB0aGVcblx0XHRcdC8vIG1hdGNoaW5nIGNoYXJhY3RlciBmb3IgZWFjaCBvZiB0aGVtIHRvIHRoZSBvdXRwdXQuXG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDE4ICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDEyICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDYgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgJiAweDNGKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAocGFkZGluZyA9PSAyKSB7XG5cdFx0XHRhID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikgPDwgODtcblx0XHRcdGIgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pO1xuXHRcdFx0YnVmZmVyID0gYSArIGI7XG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDEwKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyID4+IDQpICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA8PCAyKSAmIDB4M0YpICtcblx0XHRcdFx0Jz0nXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAocGFkZGluZyA9PSAxKSB7XG5cdFx0XHRidWZmZXIgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA8PCA0KSAmIDB4M0YpICtcblx0XHRcdFx0Jz09J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdHZhciBiYXNlNjQgPSB7XG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCd2ZXJzaW9uJzogJzAuMS4wJ1xuXHR9O1xuXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGJhc2U2NDtcblx0XHR9KTtcblx0fVx0ZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IGJhc2U2NDtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yICh2YXIga2V5IGluIGJhc2U2NCkge1xuXHRcdFx0XHRiYXNlNjQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IGJhc2U2NFtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LmJhc2U2NCA9IGJhc2U2NDtcblx0fVxuXG59KHRoaXMpKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5aVlYTmxMVFkwTDJKaGMyVTJOQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxSVNCb2RIUndPaTh2YlhSb2N5NWlaUzlpWVhObE5qUWdkakF1TVM0d0lHSjVJRUJ0WVhSb2FXRnpJSHdnVFVsVUlHeHBZMlZ1YzJVZ0tpOWNianNvWm5WdVkzUnBiMjRvY205dmRDa2dlMXh1WEc1Y2RDOHZJRVJsZEdWamRDQm1jbVZsSUhaaGNtbGhZbXhsY3lCZ1pYaHdiM0owYzJBdVhHNWNkSFpoY2lCbWNtVmxSWGh3YjNKMGN5QTlJSFI1Y0dWdlppQmxlSEJ2Y25SeklEMDlJQ2R2WW1wbFkzUW5JQ1ltSUdWNGNHOXlkSE03WEc1Y2JseDBMeThnUkdWMFpXTjBJR1p5WldVZ2RtRnlhV0ZpYkdVZ1lHMXZaSFZzWldBdVhHNWNkSFpoY2lCbWNtVmxUVzlrZFd4bElEMGdkSGx3Wlc5bUlHMXZaSFZzWlNBOVBTQW5iMkpxWldOMEp5QW1KaUJ0YjJSMWJHVWdKaVpjYmx4MFhIUnRiMlIxYkdVdVpYaHdiM0owY3lBOVBTQm1jbVZsUlhod2IzSjBjeUFtSmlCdGIyUjFiR1U3WEc1Y2JseDBMeThnUkdWMFpXTjBJR1p5WldVZ2RtRnlhV0ZpYkdVZ1lHZHNiMkpoYkdBc0lHWnliMjBnVG05a1pTNXFjeUJ2Y2lCQ2NtOTNjMlZ5YVdacFpXUWdZMjlrWlN3Z1lXNWtJSFZ6WlZ4dVhIUXZMeUJwZENCaGN5QmdjbTl2ZEdBdVhHNWNkSFpoY2lCbWNtVmxSMnh2WW1Gc0lEMGdkSGx3Wlc5bUlHZHNiMkpoYkNBOVBTQW5iMkpxWldOMEp5QW1KaUJuYkc5aVlXdzdYRzVjZEdsbUlDaG1jbVZsUjJ4dlltRnNMbWRzYjJKaGJDQTlQVDBnWm5KbFpVZHNiMkpoYkNCOGZDQm1jbVZsUjJ4dlltRnNMbmRwYm1SdmR5QTlQVDBnWm5KbFpVZHNiMkpoYkNrZ2UxeHVYSFJjZEhKdmIzUWdQU0JtY21WbFIyeHZZbUZzTzF4dVhIUjlYRzVjYmx4MEx5b3RMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMU292WEc1Y2JseDBkbUZ5SUVsdWRtRnNhV1JEYUdGeVlXTjBaWEpGY25KdmNpQTlJR1oxYm1OMGFXOXVLRzFsYzNOaFoyVXBJSHRjYmx4MFhIUjBhR2x6TG0xbGMzTmhaMlVnUFNCdFpYTnpZV2RsTzF4dVhIUjlPMXh1WEhSSmJuWmhiR2xrUTJoaGNtRmpkR1Z5UlhKeWIzSXVjSEp2ZEc5MGVYQmxJRDBnYm1WM0lFVnljbTl5TzF4dVhIUkpiblpoYkdsa1EyaGhjbUZqZEdWeVJYSnliM0l1Y0hKdmRHOTBlWEJsTG01aGJXVWdQU0FuU1c1MllXeHBaRU5vWVhKaFkzUmxja1Z5Y205eUp6dGNibHh1WEhSMllYSWdaWEp5YjNJZ1BTQm1kVzVqZEdsdmJpaHRaWE56WVdkbEtTQjdYRzVjZEZ4MEx5OGdUbTkwWlRvZ2RHaGxJR1Z5Y205eUlHMWxjM05oWjJWeklIVnpaV1FnZEdoeWIzVm5hRzkxZENCMGFHbHpJR1pwYkdVZ2JXRjBZMmdnZEdodmMyVWdkWE5sWkNCaWVWeHVYSFJjZEM4dklIUm9aU0J1WVhScGRtVWdZR0YwYjJKZ0wyQmlkRzloWUNCcGJYQnNaVzFsYm5SaGRHbHZiaUJwYmlCRGFISnZiV2wxYlM1Y2JseDBYSFIwYUhKdmR5QnVaWGNnU1c1MllXeHBaRU5vWVhKaFkzUmxja1Z5Y205eUtHMWxjM05oWjJVcE8xeHVYSFI5TzF4dVhHNWNkSFpoY2lCVVFVSk1SU0E5SUNkQlFrTkVSVVpIU0VsS1MweE5UazlRVVZKVFZGVldWMWhaV21GaVkyUmxabWRvYVdwcmJHMXViM0J4Y25OMGRYWjNlSGw2TURFeU16UTFOamM0T1Nzdkp6dGNibHgwTHk4Z2FIUjBjRG92TDNkb1lYUjNaeTV2Y21jdmFIUnRiQzlqYjIxdGIyNHRiV2xqY205emVXNTBZWGhsY3k1b2RHMXNJM053WVdObExXTm9ZWEpoWTNSbGNseHVYSFIyWVhJZ1VrVkhSVmhmVTFCQlEwVmZRMGhCVWtGRFZFVlNVeUE5SUM5YlhGeDBYRnh1WEZ4bVhGeHlJRjB2Wnp0Y2JseHVYSFF2THlCZ1pHVmpiMlJsWUNCcGN5QmtaWE5wWjI1bFpDQjBieUJpWlNCbWRXeHNlU0JqYjIxd1lYUnBZbXhsSUhkcGRHZ2dZR0YwYjJKZ0lHRnpJR1JsYzJOeWFXSmxaQ0JwYmlCMGFHVmNibHgwTHk4Z1NGUk5UQ0JUZEdGdVpHRnlaQzRnYUhSMGNEb3ZMM2RvWVhSM1p5NXZjbWN2YUhSdGJDOTNaV0poY0hCaGNHbHpMbWgwYld3alpHOXRMWGRwYm1SdmQySmhjMlUyTkMxaGRHOWlYRzVjZEM4dklGUm9aU0J2Y0hScGJXbDZaV1FnWW1GelpUWTBMV1JsWTI5a2FXNW5JR0ZzWjI5eWFYUm9iU0IxYzJWa0lHbHpJR0poYzJWa0lHOXVJRUJoZEd2aWdKbHpJR1Y0WTJWc2JHVnVkRnh1WEhRdkx5QnBiWEJzWlcxbGJuUmhkR2x2Ymk0Z2FIUjBjSE02THk5bmFYTjBMbWRwZEdoMVlpNWpiMjB2WVhSckx6RXdNakF6T1RaY2JseDBkbUZ5SUdSbFkyOWtaU0E5SUdaMWJtTjBhVzl1S0dsdWNIVjBLU0I3WEc1Y2RGeDBhVzV3ZFhRZ1BTQlRkSEpwYm1jb2FXNXdkWFFwWEc1Y2RGeDBYSFF1Y21Wd2JHRmpaU2hTUlVkRldGOVRVRUZEUlY5RFNFRlNRVU5VUlZKVExDQW5KeWs3WEc1Y2RGeDBkbUZ5SUd4bGJtZDBhQ0E5SUdsdWNIVjBMbXhsYm1kMGFEdGNibHgwWEhScFppQW9iR1Z1WjNSb0lDVWdOQ0E5UFNBd0tTQjdYRzVjZEZ4MFhIUnBibkIxZENBOUlHbHVjSFYwTG5KbGNHeGhZMlVvTHowOVB5UXZMQ0FuSnlrN1hHNWNkRngwWEhSc1pXNW5kR2dnUFNCcGJuQjFkQzVzWlc1bmRHZzdYRzVjZEZ4MGZWeHVYSFJjZEdsbUlDaGNibHgwWEhSY2RHeGxibWQwYUNBbElEUWdQVDBnTVNCOGZGeHVYSFJjZEZ4MEx5OGdhSFIwY0RvdkwzZG9ZWFIzWnk1dmNtY3ZReU5oYkhCb1lXNTFiV1Z5YVdNdFlYTmphV2t0WTJoaGNtRmpkR1Z5YzF4dVhIUmNkRngwTDF0ZUsyRXRla0V0V2pBdE9TOWRMeTUwWlhOMEtHbHVjSFYwS1Z4dVhIUmNkQ2tnZTF4dVhIUmNkRngwWlhKeWIzSW9YRzVjZEZ4MFhIUmNkQ2RKYm5aaGJHbGtJR05vWVhKaFkzUmxjam9nZEdobElITjBjbWx1WnlCMGJ5QmlaU0JrWldOdlpHVmtJR2x6SUc1dmRDQmpiM0p5WldOMGJIa2daVzVqYjJSbFpDNG5YRzVjZEZ4MFhIUXBPMXh1WEhSY2RIMWNibHgwWEhSMllYSWdZbWwwUTI5MWJuUmxjaUE5SURBN1hHNWNkRngwZG1GeUlHSnBkRk4wYjNKaFoyVTdYRzVjZEZ4MGRtRnlJR0oxWm1abGNqdGNibHgwWEhSMllYSWdiM1YwY0hWMElEMGdKeWM3WEc1Y2RGeDBkbUZ5SUhCdmMybDBhVzl1SUQwZ0xURTdYRzVjZEZ4MGQyaHBiR1VnS0NzcmNHOXphWFJwYjI0Z1BDQnNaVzVuZEdncElIdGNibHgwWEhSY2RHSjFabVpsY2lBOUlGUkJRa3hGTG1sdVpHVjRUMllvYVc1d2RYUXVZMmhoY2tGMEtIQnZjMmwwYVc5dUtTazdYRzVjZEZ4MFhIUmlhWFJUZEc5eVlXZGxJRDBnWW1sMFEyOTFiblJsY2lBbElEUWdQeUJpYVhSVGRHOXlZV2RsSUNvZ05qUWdLeUJpZFdabVpYSWdPaUJpZFdabVpYSTdYRzVjZEZ4MFhIUXZMeUJWYm14bGMzTWdkR2hwY3lCcGN5QjBhR1VnWm1seWMzUWdiMllnWVNCbmNtOTFjQ0J2WmlBMElHTm9ZWEpoWTNSbGNuUGlnS1pjYmx4MFhIUmNkR2xtSUNoaWFYUkRiM1Z1ZEdWeUt5c2dKU0EwS1NCN1hHNWNkRngwWEhSY2RDOHZJT0tBcG1OdmJuWmxjblFnZEdobElHWnBjbk4wSURnZ1ltbDBjeUIwYnlCaElITnBibWRzWlNCQlUwTkpTU0JqYUdGeVlXTjBaWEl1WEc1Y2RGeDBYSFJjZEc5MWRIQjFkQ0FyUFNCVGRISnBibWN1Wm5KdmJVTm9ZWEpEYjJSbEtGeHVYSFJjZEZ4MFhIUmNkREI0UmtZZ0ppQmlhWFJUZEc5eVlXZGxJRDQrSUNndE1pQXFJR0pwZEVOdmRXNTBaWElnSmlBMktWeHVYSFJjZEZ4MFhIUXBPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMWNibHgwWEhSeVpYUjFjbTRnYjNWMGNIVjBPMXh1WEhSOU8xeHVYRzVjZEM4dklHQmxibU52WkdWZ0lHbHpJR1JsYzJsbmJtVmtJSFJ2SUdKbElHWjFiR3g1SUdOdmJYQmhkR2xpYkdVZ2QybDBhQ0JnWW5SdllXQWdZWE1nWkdWelkzSnBZbVZrSUdsdUlIUm9aVnh1WEhRdkx5QklWRTFNSUZOMFlXNWtZWEprT2lCb2RIUndPaTh2ZDJoaGRIZG5MbTl5Wnk5b2RHMXNMM2RsWW1Gd2NHRndhWE11YUhSdGJDTmtiMjB0ZDJsdVpHOTNZbUZ6WlRZMExXSjBiMkZjYmx4MGRtRnlJR1Z1WTI5a1pTQTlJR1oxYm1OMGFXOXVLR2x1Y0hWMEtTQjdYRzVjZEZ4MGFXNXdkWFFnUFNCVGRISnBibWNvYVc1d2RYUXBPMXh1WEhSY2RHbG1JQ2d2VzE1Y1hEQXRYRng0UmtaZEx5NTBaWE4wS0dsdWNIVjBLU2tnZTF4dVhIUmNkRngwTHk4Z1RtOTBaVG9nYm04Z2JtVmxaQ0IwYnlCemNHVmphV0ZzTFdOaGMyVWdZWE4wY21Gc0lITjViV0p2YkhNZ2FHVnlaU3dnWVhNZ2MzVnljbTluWVhSbGN5QmhjbVZjYmx4MFhIUmNkQzh2SUcxaGRHTm9aV1FzSUdGdVpDQjBhR1VnYVc1d2RYUWdhWE1nYzNWd2NHOXpaV1FnZEc4Z2IyNXNlU0JqYjI1MFlXbHVJRUZUUTBsSklHRnVlWGRoZVM1Y2JseDBYSFJjZEdWeWNtOXlLRnh1WEhSY2RGeDBYSFFuVkdobElITjBjbWx1WnlCMGJ5QmlaU0JsYm1OdlpHVmtJR052Ym5SaGFXNXpJR05vWVhKaFkzUmxjbk1nYjNWMGMybGtaU0J2WmlCMGFHVWdKeUFyWEc1Y2RGeDBYSFJjZENkTVlYUnBiakVnY21GdVoyVXVKMXh1WEhSY2RGeDBLVHRjYmx4MFhIUjlYRzVjZEZ4MGRtRnlJSEJoWkdScGJtY2dQU0JwYm5CMWRDNXNaVzVuZEdnZ0pTQXpPMXh1WEhSY2RIWmhjaUJ2ZFhSd2RYUWdQU0FuSnp0Y2JseDBYSFIyWVhJZ2NHOXphWFJwYjI0Z1BTQXRNVHRjYmx4MFhIUjJZWElnWVR0Y2JseDBYSFIyWVhJZ1lqdGNibHgwWEhSMllYSWdZenRjYmx4MFhIUjJZWElnWkR0Y2JseDBYSFIyWVhJZ1luVm1abVZ5TzF4dVhIUmNkQzh2SUUxaGEyVWdjM1Z5WlNCaGJua2djR0ZrWkdsdVp5QnBjeUJvWVc1a2JHVmtJRzkxZEhOcFpHVWdiMllnZEdobElHeHZiM0F1WEc1Y2RGeDBkbUZ5SUd4bGJtZDBhQ0E5SUdsdWNIVjBMbXhsYm1kMGFDQXRJSEJoWkdScGJtYzdYRzVjYmx4MFhIUjNhR2xzWlNBb0t5dHdiM05wZEdsdmJpQThJR3hsYm1kMGFDa2dlMXh1WEhSY2RGeDBMeThnVW1WaFpDQjBhSEpsWlNCaWVYUmxjeXdnYVM1bExpQXlOQ0JpYVhSekxseHVYSFJjZEZ4MFlTQTlJR2x1Y0hWMExtTm9ZWEpEYjJSbFFYUW9jRzl6YVhScGIyNHBJRHc4SURFMk8xeHVYSFJjZEZ4MFlpQTlJR2x1Y0hWMExtTm9ZWEpEYjJSbFFYUW9LeXR3YjNOcGRHbHZiaWtnUER3Z09EdGNibHgwWEhSY2RHTWdQU0JwYm5CMWRDNWphR0Z5UTI5a1pVRjBLQ3NyY0c5emFYUnBiMjRwTzF4dVhIUmNkRngwWW5WbVptVnlJRDBnWVNBcklHSWdLeUJqTzF4dVhIUmNkRngwTHk4Z1ZIVnliaUIwYUdVZ01qUWdZbWwwY3lCcGJuUnZJR1p2ZFhJZ1kyaDFibXR6SUc5bUlEWWdZbWwwY3lCbFlXTm9MQ0JoYm1RZ1lYQndaVzVrSUhSb1pWeHVYSFJjZEZ4MEx5OGdiV0YwWTJocGJtY2dZMmhoY21GamRHVnlJR1p2Y2lCbFlXTm9JRzltSUhSb1pXMGdkRzhnZEdobElHOTFkSEIxZEM1Y2JseDBYSFJjZEc5MWRIQjFkQ0FyUFNBb1hHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTVRnZ0ppQXdlRE5HS1NBclhHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTVRJZ0ppQXdlRE5HS1NBclhHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTmlBbUlEQjRNMFlwSUN0Y2JseDBYSFJjZEZ4MFZFRkNURVV1WTJoaGNrRjBLR0oxWm1abGNpQW1JREI0TTBZcFhHNWNkRngwWEhRcE8xeHVYSFJjZEgxY2JseHVYSFJjZEdsbUlDaHdZV1JrYVc1bklEMDlJRElwSUh0Y2JseDBYSFJjZEdFZ1BTQnBibkIxZEM1amFHRnlRMjlrWlVGMEtIQnZjMmwwYVc5dUtTQThQQ0E0TzF4dVhIUmNkRngwWWlBOUlHbHVjSFYwTG1Ob1lYSkRiMlJsUVhRb0t5dHdiM05wZEdsdmJpazdYRzVjZEZ4MFhIUmlkV1ptWlhJZ1BTQmhJQ3NnWWp0Y2JseDBYSFJjZEc5MWRIQjFkQ0FyUFNBb1hHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTVRBcElDdGNibHgwWEhSY2RGeDBWRUZDVEVVdVkyaGhja0YwS0NoaWRXWm1aWElnUGo0Z05Da2dKaUF3ZUROR0tTQXJYRzVjZEZ4MFhIUmNkRlJCUWt4RkxtTm9ZWEpCZENnb1luVm1abVZ5SUR3OElESXBJQ1lnTUhnelJpa2dLMXh1WEhSY2RGeDBYSFFuUFNkY2JseDBYSFJjZENrN1hHNWNkRngwZlNCbGJITmxJR2xtSUNod1lXUmthVzVuSUQwOUlERXBJSHRjYmx4MFhIUmNkR0oxWm1abGNpQTlJR2x1Y0hWMExtTm9ZWEpEYjJSbFFYUW9jRzl6YVhScGIyNHBPMXh1WEhSY2RGeDBiM1YwY0hWMElDczlJQ2hjYmx4MFhIUmNkRngwVkVGQ1RFVXVZMmhoY2tGMEtHSjFabVpsY2lBK1BpQXlLU0FyWEc1Y2RGeDBYSFJjZEZSQlFreEZMbU5vWVhKQmRDZ29ZblZtWm1WeUlEdzhJRFFwSUNZZ01IZ3pSaWtnSzF4dVhIUmNkRngwWEhRblBUMG5YRzVjZEZ4MFhIUXBPMXh1WEhSY2RIMWNibHh1WEhSY2RISmxkSFZ5YmlCdmRYUndkWFE3WEc1Y2RIMDdYRzVjYmx4MGRtRnlJR0poYzJVMk5DQTlJSHRjYmx4MFhIUW5aVzVqYjJSbEp6b2daVzVqYjJSbExGeHVYSFJjZENka1pXTnZaR1VuT2lCa1pXTnZaR1VzWEc1Y2RGeDBKM1psY25OcGIyNG5PaUFuTUM0eExqQW5YRzVjZEgwN1hHNWNibHgwTHk4Z1UyOXRaU0JCVFVRZ1luVnBiR1FnYjNCMGFXMXBlbVZ5Y3l3Z2JHbHJaU0J5TG1wekxDQmphR1ZqYXlCbWIzSWdjM0JsWTJsbWFXTWdZMjl1WkdsMGFXOXVJSEJoZEhSbGNtNXpYRzVjZEM4dklHeHBhMlVnZEdobElHWnZiR3h2ZDJsdVp6cGNibHgwYVdZZ0tGeHVYSFJjZEhSNWNHVnZaaUJrWldacGJtVWdQVDBnSjJaMWJtTjBhVzl1SnlBbUpseHVYSFJjZEhSNWNHVnZaaUJrWldacGJtVXVZVzFrSUQwOUlDZHZZbXBsWTNRbklDWW1YRzVjZEZ4MFpHVm1hVzVsTG1GdFpGeHVYSFFwSUh0Y2JseDBYSFJrWldacGJtVW9ablZ1WTNScGIyNG9LU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdZbUZ6WlRZME8xeHVYSFJjZEgwcE8xeHVYSFI5WEhSbGJITmxJR2xtSUNobWNtVmxSWGh3YjNKMGN5QW1KaUFoWm5KbFpVVjRjRzl5ZEhNdWJtOWtaVlI1Y0dVcElIdGNibHgwWEhScFppQW9abkpsWlUxdlpIVnNaU2tnZXlBdkx5QnBiaUJPYjJSbExtcHpJRzl5SUZKcGJtZHZTbE1nZGpBdU9DNHdLMXh1WEhSY2RGeDBabkpsWlUxdlpIVnNaUzVsZUhCdmNuUnpJRDBnWW1GelpUWTBPMXh1WEhSY2RIMGdaV3h6WlNCN0lDOHZJR2x1SUU1aGNuZG9ZV3dnYjNJZ1VtbHVaMjlLVXlCMk1DNDNMakF0WEc1Y2RGeDBYSFJtYjNJZ0tIWmhjaUJyWlhrZ2FXNGdZbUZ6WlRZMEtTQjdYRzVjZEZ4MFhIUmNkR0poYzJVMk5DNW9ZWE5QZDI1UWNtOXdaWEowZVNoclpYa3BJQ1ltSUNobWNtVmxSWGh3YjNKMGMxdHJaWGxkSUQwZ1ltRnpaVFkwVzJ0bGVWMHBPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMWNibHgwZlNCbGJITmxJSHNnTHk4Z2FXNGdVbWhwYm04Z2IzSWdZU0IzWldJZ1luSnZkM05sY2x4dVhIUmNkSEp2YjNRdVltRnpaVFkwSUQwZ1ltRnpaVFkwTzF4dVhIUjlYRzVjYm4wb2RHaHBjeWtwTzF4dUlsMTkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnNcbiAqL1xuXG52YXIgdXRpbCA9IHt9O1xuXG51dGlsLmlzT2JqZWN0ID0gZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbnV0aWwuaXNOdW1iZXIgPSBmdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG51dGlsLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cblxudXRpbC5pc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpe1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuXG4vKipcbiAqIEV2ZW50RW1pdHRlciBjbGFzc1xuICovXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgRXZlbnRFbWl0dGVyLmluaXQuY2FsbCh0aGlzKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuRXZlbnRFbWl0dGVyLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufTtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIXV0aWwuaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJyAmJiAhdGhpcy5fZXZlbnRzLmVycm9yKSB7XG4gICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAodXRpbC5pc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIHV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAodXRpbC5pc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuXG4gICAgICBpZiAodXRpbC5pc0Z1bmN0aW9uKGNvbnNvbGUuZXJyb3IpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgfVxuICAgICAgaWYgKHV0aWwuaXNGdW5jdGlvbihjb25zb2xlLnRyYWNlKSlcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKHV0aWwuaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmICh1dGlsLmlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAodXRpbC5pc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5MWRHbHNMM1YwYVd3dWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4dklFTnZjSGx5YVdkb2RDQktiM2xsYm5Rc0lFbHVZeTRnWVc1a0lHOTBhR1Z5SUU1dlpHVWdZMjl1ZEhKcFluVjBiM0p6TGx4dUx5OWNiaTh2SUZCbGNtMXBjM05wYjI0Z2FYTWdhR1Z5WldKNUlHZHlZVzUwWldRc0lHWnlaV1VnYjJZZ1kyaGhjbWRsTENCMGJ5QmhibmtnY0dWeWMyOXVJRzlpZEdGcGJtbHVaeUJoWEc0dkx5QmpiM0I1SUc5bUlIUm9hWE1nYzI5bWRIZGhjbVVnWVc1a0lHRnpjMjlqYVdGMFpXUWdaRzlqZFcxbGJuUmhkR2x2YmlCbWFXeGxjeUFvZEdobFhHNHZMeUJjSWxOdlpuUjNZWEpsWENJcExDQjBieUJrWldGc0lHbHVJSFJvWlNCVGIyWjBkMkZ5WlNCM2FYUm9iM1YwSUhKbGMzUnlhV04wYVc5dUxDQnBibU5zZFdScGJtZGNiaTh2SUhkcGRHaHZkWFFnYkdsdGFYUmhkR2x2YmlCMGFHVWdjbWxuYUhSeklIUnZJSFZ6WlN3Z1kyOXdlU3dnYlc5a2FXWjVMQ0J0WlhKblpTd2djSFZpYkdsemFDeGNiaTh2SUdScGMzUnlhV0oxZEdVc0lITjFZbXhwWTJWdWMyVXNJR0Z1WkM5dmNpQnpaV3hzSUdOdmNHbGxjeUJ2WmlCMGFHVWdVMjltZEhkaGNtVXNJR0Z1WkNCMGJ5QndaWEp0YVhSY2JpOHZJSEJsY25OdmJuTWdkRzhnZDJodmJTQjBhR1VnVTI5bWRIZGhjbVVnYVhNZ1puVnlibWx6YUdWa0lIUnZJR1J2SUhOdkxDQnpkV0pxWldOMElIUnZJSFJvWlZ4dUx5OGdabTlzYkc5M2FXNW5JR052Ym1ScGRHbHZibk02WEc0dkwxeHVMeThnVkdobElHRmliM1psSUdOdmNIbHlhV2RvZENCdWIzUnBZMlVnWVc1a0lIUm9hWE1nY0dWeWJXbHpjMmx2YmlCdWIzUnBZMlVnYzJoaGJHd2dZbVVnYVc1amJIVmtaV1JjYmk4dklHbHVJR0ZzYkNCamIzQnBaWE1nYjNJZ2MzVmljM1JoYm5ScFlXd2djRzl5ZEdsdmJuTWdiMllnZEdobElGTnZablIzWVhKbExseHVMeTljYmk4dklGUklSU0JUVDBaVVYwRlNSU0JKVXlCUVVrOVdTVVJGUkNCY0lrRlRJRWxUWENJc0lGZEpWRWhQVlZRZ1YwRlNVa0ZPVkZrZ1QwWWdRVTVaSUV0SlRrUXNJRVZZVUZKRlUxTmNiaTh2SUU5U0lFbE5VRXhKUlVRc0lFbE9RMHhWUkVsT1J5QkNWVlFnVGs5VUlFeEpUVWxVUlVRZ1ZFOGdWRWhGSUZkQlVsSkJUbFJKUlZNZ1QwWmNiaTh2SUUxRlVrTklRVTVVUVVKSlRFbFVXU3dnUmtsVVRrVlRVeUJHVDFJZ1FTQlFRVkpVU1VOVlRFRlNJRkJWVWxCUFUwVWdRVTVFSUU1UFRrbE9SbEpKVGtkRlRVVk9WQzRnU1U1Y2JpOHZJRTVQSUVWV1JVNVVJRk5JUVV4TUlGUklSU0JCVlZSSVQxSlRJRTlTSUVOUFVGbFNTVWRJVkNCSVQweEVSVkpUSUVKRklFeEpRVUpNUlNCR1QxSWdRVTVaSUVOTVFVbE5MRnh1THk4Z1JFRk5RVWRGVXlCUFVpQlBWRWhGVWlCTVNVRkNTVXhKVkZrc0lGZElSVlJJUlZJZ1NVNGdRVTRnUVVOVVNVOU9JRTlHSUVOUFRsUlNRVU5VTENCVVQxSlVJRTlTWEc0dkx5QlBWRWhGVWxkSlUwVXNJRUZTU1ZOSlRrY2dSbEpQVFN3Z1QxVlVJRTlHSUU5U0lFbE9JRU5QVGs1RlExUkpUMDRnVjBsVVNDQlVTRVVnVTA5R1ZGZEJVa1VnVDFJZ1ZFaEZYRzR2THlCVlUwVWdUMUlnVDFSSVJWSWdSRVZCVEVsT1IxTWdTVTRnVkVoRklGTlBSbFJYUVZKRkxseHVYRzUyWVhJZ1ptOXliV0YwVW1WblJYaHdJRDBnTHlWYmMyUnFKVjB2Wnp0Y2JtVjRjRzl5ZEhNdVptOXliV0YwSUQwZ1puVnVZM1JwYjI0b1ppa2dlMXh1SUNCcFppQW9JV2x6VTNSeWFXNW5LR1lwS1NCN1hHNGdJQ0FnZG1GeUlHOWlhbVZqZEhNZ1BTQmJYVHRjYmlBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ2IySnFaV04wY3k1d2RYTm9LR2x1YzNCbFkzUW9ZWEpuZFcxbGJuUnpXMmxkS1NrN1hHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQnZZbXBsWTNSekxtcHZhVzRvSnlBbktUdGNiaUFnZlZ4dVhHNGdJSFpoY2lCcElEMGdNVHRjYmlBZ2RtRnlJR0Z5WjNNZ1BTQmhjbWQxYldWdWRITTdYRzRnSUhaaGNpQnNaVzRnUFNCaGNtZHpMbXhsYm1kMGFEdGNiaUFnZG1GeUlITjBjaUE5SUZOMGNtbHVaeWhtS1M1eVpYQnNZV05sS0dadmNtMWhkRkpsWjBWNGNDd2dablZ1WTNScGIyNG9lQ2tnZTF4dUlDQWdJR2xtSUNoNElEMDlQU0FuSlNVbktTQnlaWFIxY200Z0p5VW5PMXh1SUNBZ0lHbG1JQ2hwSUQ0OUlHeGxiaWtnY21WMGRYSnVJSGc3WEc0Z0lDQWdjM2RwZEdOb0lDaDRLU0I3WEc0Z0lDQWdJQ0JqWVhObElDY2xjeWM2SUhKbGRIVnliaUJUZEhKcGJtY29ZWEpuYzF0cEt5dGRLVHRjYmlBZ0lDQWdJR05oYzJVZ0p5VmtKem9nY21WMGRYSnVJRTUxYldKbGNpaGhjbWR6VzJrcksxMHBPMXh1SUNBZ0lDQWdZMkZ6WlNBbkpXb25PbHh1SUNBZ0lDQWdJQ0IwY25rZ2UxeHVJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQktVMDlPTG5OMGNtbHVaMmxtZVNoaGNtZHpXMmtySzEwcE8xeHVJQ0FnSUNBZ0lDQjlJR05oZEdOb0lDaGZLU0I3WEc0Z0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUNkYlEybHlZM1ZzWVhKZEp6dGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdaR1ZtWVhWc2REcGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIZzdYRzRnSUNBZ2ZWeHVJQ0I5S1R0Y2JpQWdabTl5SUNoMllYSWdlQ0E5SUdGeVozTmJhVjA3SUdrZ1BDQnNaVzQ3SUhnZ1BTQmhjbWR6V3lzcmFWMHBJSHRjYmlBZ0lDQnBaaUFvYVhOT2RXeHNLSGdwSUh4OElDRnBjMDlpYW1WamRDaDRLU2tnZTF4dUlDQWdJQ0FnYzNSeUlDczlJQ2NnSnlBcklIZzdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhOMGNpQXJQU0FuSUNjZ0t5QnBibk53WldOMEtIZ3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dUlDQnlaWFIxY200Z2MzUnlPMXh1ZlR0Y2JseHVYRzR2THlCTllYSnJJSFJvWVhRZ1lTQnRaWFJvYjJRZ2MyaHZkV3hrSUc1dmRDQmlaU0IxYzJWa0xseHVMeThnVW1WMGRYSnVjeUJoSUcxdlpHbG1hV1ZrSUdaMWJtTjBhVzl1SUhkb2FXTm9JSGRoY201eklHOXVZMlVnWW5rZ1pHVm1ZWFZzZEM1Y2JpOHZJRWxtSUMwdGJtOHRaR1Z3Y21WallYUnBiMjRnYVhNZ2MyVjBMQ0IwYUdWdUlHbDBJR2x6SUdFZ2JtOHRiM0F1WEc1bGVIQnZjblJ6TG1SbGNISmxZMkYwWlNBOUlHWjFibU4wYVc5dUtHWnVMQ0J0YzJjcElIdGNiaUFnTHk4Z1FXeHNiM2NnWm05eUlHUmxjSEpsWTJGMGFXNW5JSFJvYVc1bmN5QnBiaUIwYUdVZ2NISnZZMlZ6Y3lCdlppQnpkR0Z5ZEdsdVp5QjFjQzVjYmlBZ2FXWWdLR2x6Vlc1a1pXWnBibVZrS0dkc2IySmhiQzV3Y205alpYTnpLU2tnZTF4dUlDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmxlSEJ2Y25SekxtUmxjSEpsWTJGMFpTaG1iaXdnYlhObktTNWhjSEJzZVNoMGFHbHpMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJSDA3WEc0Z0lIMWNibHh1SUNCcFppQW9jSEp2WTJWemN5NXViMFJsY0hKbFkyRjBhVzl1SUQwOVBTQjBjblZsS1NCN1hHNGdJQ0FnY21WMGRYSnVJR1p1TzF4dUlDQjlYRzVjYmlBZ2RtRnlJSGRoY201bFpDQTlJR1poYkhObE8xeHVJQ0JtZFc1amRHbHZiaUJrWlhCeVpXTmhkR1ZrS0NrZ2UxeHVJQ0FnSUdsbUlDZ2hkMkZ5Ym1Wa0tTQjdYRzRnSUNBZ0lDQnBaaUFvY0hKdlkyVnpjeTUwYUhKdmQwUmxjSEpsWTJGMGFXOXVLU0I3WEc0Z0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWh0YzJjcE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaHdjbTlqWlhOekxuUnlZV05sUkdWd2NtVmpZWFJwYjI0cElIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNTBjbUZqWlNodGMyY3BPMXh1SUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2lodGMyY3BPMXh1SUNBZ0lDQWdmVnh1SUNBZ0lDQWdkMkZ5Ym1Wa0lEMGdkSEoxWlR0Y2JpQWdJQ0I5WEc0Z0lDQWdjbVYwZFhKdUlHWnVMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozVnRaVzUwY3lrN1hHNGdJSDFjYmx4dUlDQnlaWFIxY200Z1pHVndjbVZqWVhSbFpEdGNibjA3WEc1Y2JseHVkbUZ5SUdSbFluVm5jeUE5SUh0OU8xeHVkbUZ5SUdSbFluVm5SVzUyYVhKdmJqdGNibVY0Y0c5eWRITXVaR1ZpZFdkc2IyY2dQU0JtZFc1amRHbHZiaWh6WlhRcElIdGNiaUFnYVdZZ0tHbHpWVzVrWldacGJtVmtLR1JsWW5WblJXNTJhWEp2YmlrcFhHNGdJQ0FnWkdWaWRXZEZiblpwY205dUlEMGdjSEp2WTJWemN5NWxibll1VGs5RVJWOUVSVUpWUnlCOGZDQW5KenRjYmlBZ2MyVjBJRDBnYzJWMExuUnZWWEJ3WlhKRFlYTmxLQ2s3WEc0Z0lHbG1JQ2doWkdWaWRXZHpXM05sZEYwcElIdGNiaUFnSUNCcFppQW9ibVYzSUZKbFowVjRjQ2duWEZ4Y1hHSW5JQ3NnYzJWMElDc2dKMXhjWEZ4aUp5d2dKMmtuS1M1MFpYTjBLR1JsWW5WblJXNTJhWEp2YmlrcElIdGNiaUFnSUNBZ0lIWmhjaUJ3YVdRZ1BTQndjbTlqWlhOekxuQnBaRHRjYmlBZ0lDQWdJR1JsWW5WbmMxdHpaWFJkSUQwZ1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCdGMyY2dQU0JsZUhCdmNuUnpMbVp2Y20xaGRDNWhjSEJzZVNobGVIQnZjblJ6TENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0NjbGN5QWxaRG9nSlhNbkxDQnpaWFFzSUhCcFpDd2diWE5uS1R0Y2JpQWdJQ0FnSUgwN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJR1JsWW5WbmMxdHpaWFJkSUQwZ1puVnVZM1JwYjI0b0tTQjdmVHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdjbVYwZFhKdUlHUmxZblZuYzF0elpYUmRPMXh1ZlR0Y2JseHVYRzR2S2lwY2JpQXFJRVZqYUc5eklIUm9aU0IyWVd4MVpTQnZaaUJoSUhaaGJIVmxMaUJVY25seklIUnZJSEJ5YVc1MElIUm9aU0IyWVd4MVpTQnZkWFJjYmlBcUlHbHVJSFJvWlNCaVpYTjBJSGRoZVNCd2IzTnphV0pzWlNCbmFYWmxiaUIwYUdVZ1pHbG1abVZ5Wlc1MElIUjVjR1Z6TGx4dUlDcGNiaUFxSUVCd1lYSmhiU0I3VDJKcVpXTjBmU0J2WW1vZ1ZHaGxJRzlpYW1WamRDQjBieUJ3Y21sdWRDQnZkWFF1WEc0Z0tpQkFjR0Z5WVcwZ2UwOWlhbVZqZEgwZ2IzQjBjeUJQY0hScGIyNWhiQ0J2Y0hScGIyNXpJRzlpYW1WamRDQjBhR0YwSUdGc2RHVnljeUIwYUdVZ2IzVjBjSFYwTGx4dUlDb3ZYRzR2S2lCc1pXZGhZM2s2SUc5aWFpd2djMmh2ZDBocFpHUmxiaXdnWkdWd2RHZ3NJR052Ykc5eWN5b3ZYRzVtZFc1amRHbHZiaUJwYm5Od1pXTjBLRzlpYWl3Z2IzQjBjeWtnZTF4dUlDQXZMeUJrWldaaGRXeDBJRzl3ZEdsdmJuTmNiaUFnZG1GeUlHTjBlQ0E5SUh0Y2JpQWdJQ0J6WldWdU9pQmJYU3hjYmlBZ0lDQnpkSGxzYVhwbE9pQnpkSGxzYVhwbFRtOURiMnh2Y2x4dUlDQjlPMXh1SUNBdkx5QnNaV2RoWTNrdUxpNWNiaUFnYVdZZ0tHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ1BqMGdNeWtnWTNSNExtUmxjSFJvSUQwZ1lYSm5kVzFsYm5Seld6SmRPMXh1SUNCcFppQW9ZWEpuZFcxbGJuUnpMbXhsYm1kMGFDQStQU0EwS1NCamRIZ3VZMjlzYjNKeklEMGdZWEpuZFcxbGJuUnpXek5kTzF4dUlDQnBaaUFvYVhOQ2IyOXNaV0Z1S0c5d2RITXBLU0I3WEc0Z0lDQWdMeThnYkdWbllXTjVMaTR1WEc0Z0lDQWdZM1I0TG5Ob2IzZElhV1JrWlc0Z1BTQnZjSFJ6TzF4dUlDQjlJR1ZzYzJVZ2FXWWdLRzl3ZEhNcElIdGNiaUFnSUNBdkx5Qm5iM1FnWVc0Z1hDSnZjSFJwYjI1elhDSWdiMkpxWldOMFhHNGdJQ0FnWlhod2IzSjBjeTVmWlhoMFpXNWtLR04wZUN3Z2IzQjBjeWs3WEc0Z0lIMWNiaUFnTHk4Z2MyVjBJR1JsWm1GMWJIUWdiM0IwYVc5dWMxeHVJQ0JwWmlBb2FYTlZibVJsWm1sdVpXUW9ZM1I0TG5Ob2IzZElhV1JrWlc0cEtTQmpkSGd1YzJodmQwaHBaR1JsYmlBOUlHWmhiSE5sTzF4dUlDQnBaaUFvYVhOVmJtUmxabWx1WldRb1kzUjRMbVJsY0hSb0tTa2dZM1I0TG1SbGNIUm9JRDBnTWp0Y2JpQWdhV1lnS0dselZXNWtaV1pwYm1Wa0tHTjBlQzVqYjJ4dmNuTXBLU0JqZEhndVkyOXNiM0p6SUQwZ1ptRnNjMlU3WEc0Z0lHbG1JQ2hwYzFWdVpHVm1hVzVsWkNoamRIZ3VZM1Z6ZEc5dFNXNXpjR1ZqZENrcElHTjBlQzVqZFhOMGIyMUpibk53WldOMElEMGdkSEoxWlR0Y2JpQWdhV1lnS0dOMGVDNWpiMnh2Y25NcElHTjBlQzV6ZEhsc2FYcGxJRDBnYzNSNWJHbDZaVmRwZEdoRGIyeHZjanRjYmlBZ2NtVjBkWEp1SUdadmNtMWhkRlpoYkhWbEtHTjBlQ3dnYjJKcUxDQmpkSGd1WkdWd2RHZ3BPMXh1ZlZ4dVpYaHdiM0owY3k1cGJuTndaV04wSUQwZ2FXNXpjR1ZqZER0Y2JseHVYRzR2THlCb2RIUndPaTh2Wlc0dWQybHJhWEJsWkdsaExtOXlaeTkzYVd0cEwwRk9VMGxmWlhOallYQmxYMk52WkdValozSmhjR2hwWTNOY2JtbHVjM0JsWTNRdVkyOXNiM0p6SUQwZ2UxeHVJQ0FuWW05c1pDY2dPaUJiTVN3Z01qSmRMRnh1SUNBbmFYUmhiR2xqSnlBNklGc3pMQ0F5TTEwc1hHNGdJQ2QxYm1SbGNteHBibVVuSURvZ1d6UXNJREkwWFN4Y2JpQWdKMmx1ZG1WeWMyVW5JRG9nV3pjc0lESTNYU3hjYmlBZ0ozZG9hWFJsSnlBNklGc3pOeXdnTXpsZExGeHVJQ0FuWjNKbGVTY2dPaUJiT1RBc0lETTVYU3hjYmlBZ0oySnNZV05ySnlBNklGc3pNQ3dnTXpsZExGeHVJQ0FuWW14MVpTY2dPaUJiTXpRc0lETTVYU3hjYmlBZ0oyTjVZVzRuSURvZ1d6TTJMQ0F6T1Ywc1hHNGdJQ2RuY21WbGJpY2dPaUJiTXpJc0lETTVYU3hjYmlBZ0oyMWhaMlZ1ZEdFbklEb2dXek0xTENBek9WMHNYRzRnSUNkeVpXUW5JRG9nV3pNeExDQXpPVjBzWEc0Z0lDZDVaV3hzYjNjbklEb2dXek16TENBek9WMWNibjA3WEc1Y2JpOHZJRVJ2YmlkMElIVnpaU0FuWW14MVpTY2dibTkwSUhacGMybGliR1VnYjI0Z1kyMWtMbVY0WlZ4dWFXNXpjR1ZqZEM1emRIbHNaWE1nUFNCN1hHNGdJQ2R6Y0dWamFXRnNKem9nSjJONVlXNG5MRnh1SUNBbmJuVnRZbVZ5SnpvZ0ozbGxiR3h2ZHljc1hHNGdJQ2RpYjI5c1pXRnVKem9nSjNsbGJHeHZkeWNzWEc0Z0lDZDFibVJsWm1sdVpXUW5PaUFuWjNKbGVTY3NYRzRnSUNkdWRXeHNKem9nSjJKdmJHUW5MRnh1SUNBbmMzUnlhVzVuSnpvZ0oyZHlaV1Z1Snl4Y2JpQWdKMlJoZEdVbk9pQW5iV0ZuWlc1MFlTY3NYRzRnSUM4dklGd2libUZ0WlZ3aU9pQnBiblJsYm5ScGIyNWhiR3g1SUc1dmRDQnpkSGxzYVc1blhHNGdJQ2R5WldkbGVIQW5PaUFuY21Wa0oxeHVmVHRjYmx4dVhHNW1kVzVqZEdsdmJpQnpkSGxzYVhwbFYybDBhRU52Ykc5eUtITjBjaXdnYzNSNWJHVlVlWEJsS1NCN1hHNGdJSFpoY2lCemRIbHNaU0E5SUdsdWMzQmxZM1F1YzNSNWJHVnpXM04wZVd4bFZIbHdaVjA3WEc1Y2JpQWdhV1lnS0hOMGVXeGxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlDZGNYSFV3TURGaVd5Y2dLeUJwYm5Od1pXTjBMbU52Ykc5eWMxdHpkSGxzWlYxYk1GMGdLeUFuYlNjZ0t5QnpkSElnSzF4dUlDQWdJQ0FnSUNBZ0lDQW5YRngxTURBeFlsc25JQ3NnYVc1emNHVmpkQzVqYjJ4dmNuTmJjM1I1YkdWZFd6RmRJQ3NnSjIwbk8xeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lISmxkSFZ5YmlCemRISTdYRzRnSUgxY2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCemRIbHNhWHBsVG05RGIyeHZjaWh6ZEhJc0lITjBlV3hsVkhsd1pTa2dlMXh1SUNCeVpYUjFjbTRnYzNSeU8xeHVmVnh1WEc1Y2JtWjFibU4wYVc5dUlHRnljbUY1Vkc5SVlYTm9LR0Z5Y21GNUtTQjdYRzRnSUhaaGNpQm9ZWE5vSUQwZ2UzMDdYRzVjYmlBZ1lYSnlZWGt1Wm05eVJXRmphQ2htZFc1amRHbHZiaWgyWVd3c0lHbGtlQ2tnZTF4dUlDQWdJR2hoYzJoYmRtRnNYU0E5SUhSeWRXVTdYRzRnSUgwcE8xeHVYRzRnSUhKbGRIVnliaUJvWVhOb08xeHVmVnh1WEc1Y2JtWjFibU4wYVc5dUlHWnZjbTFoZEZaaGJIVmxLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5a2dlMXh1SUNBdkx5QlFjbTkyYVdSbElHRWdhRzl2YXlCbWIzSWdkWE5sY2kxemNHVmphV1pwWldRZ2FXNXpjR1ZqZENCbWRXNWpkR2x2Ym5NdVhHNGdJQzh2SUVOb1pXTnJJSFJvWVhRZ2RtRnNkV1VnYVhNZ1lXNGdiMkpxWldOMElIZHBkR2dnWVc0Z2FXNXpjR1ZqZENCbWRXNWpkR2x2YmlCdmJpQnBkRnh1SUNCcFppQW9ZM1I0TG1OMWMzUnZiVWx1YzNCbFkzUWdKaVpjYmlBZ0lDQWdJSFpoYkhWbElDWW1YRzRnSUNBZ0lDQnBjMFoxYm1OMGFXOXVLSFpoYkhWbExtbHVjM0JsWTNRcElDWW1YRzRnSUNBZ0lDQXZMeUJHYVd4MFpYSWdiM1YwSUhSb1pTQjFkR2xzSUcxdlpIVnNaU3dnYVhRbmN5QnBibk53WldOMElHWjFibU4wYVc5dUlHbHpJSE53WldOcFlXeGNiaUFnSUNBZ0lIWmhiSFZsTG1sdWMzQmxZM1FnSVQwOUlHVjRjRzl5ZEhNdWFXNXpjR1ZqZENBbUpseHVJQ0FnSUNBZ0x5OGdRV3h6YnlCbWFXeDBaWElnYjNWMElHRnVlU0J3Y205MGIzUjVjR1VnYjJKcVpXTjBjeUIxYzJsdVp5QjBhR1VnWTJseVkzVnNZWElnWTJobFkyc3VYRzRnSUNBZ0lDQWhLSFpoYkhWbExtTnZibk4wY25WamRHOXlJQ1ltSUhaaGJIVmxMbU52Ym5OMGNuVmpkRzl5TG5CeWIzUnZkSGx3WlNBOVBUMGdkbUZzZFdVcEtTQjdYRzRnSUNBZ2RtRnlJSEpsZENBOUlIWmhiSFZsTG1sdWMzQmxZM1FvY21WamRYSnpaVlJwYldWekxDQmpkSGdwTzF4dUlDQWdJR2xtSUNnaGFYTlRkSEpwYm1jb2NtVjBLU2tnZTF4dUlDQWdJQ0FnY21WMElEMGdabTl5YldGMFZtRnNkV1VvWTNSNExDQnlaWFFzSUhKbFkzVnljMlZVYVcxbGN5azdYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUJ5WlhRN1hHNGdJSDFjYmx4dUlDQXZMeUJRY21sdGFYUnBkbVVnZEhsd1pYTWdZMkZ1Ym05MElHaGhkbVVnY0hKdmNHVnlkR2xsYzF4dUlDQjJZWElnY0hKcGJXbDBhWFpsSUQwZ1ptOXliV0YwVUhKcGJXbDBhWFpsS0dOMGVDd2dkbUZzZFdVcE8xeHVJQ0JwWmlBb2NISnBiV2wwYVhabEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUhCeWFXMXBkR2wyWlR0Y2JpQWdmVnh1WEc0Z0lDOHZJRXh2YjJzZ2RYQWdkR2hsSUd0bGVYTWdiMllnZEdobElHOWlhbVZqZEM1Y2JpQWdkbUZ5SUd0bGVYTWdQU0JQWW1wbFkzUXVhMlY1Y3loMllXeDFaU2s3WEc0Z0lIWmhjaUIyYVhOcFlteGxTMlY1Y3lBOUlHRnljbUY1Vkc5SVlYTm9LR3RsZVhNcE8xeHVYRzRnSUdsbUlDaGpkSGd1YzJodmQwaHBaR1JsYmlrZ2UxeHVJQ0FnSUd0bGVYTWdQU0JQWW1wbFkzUXVaMlYwVDNkdVVISnZjR1Z5ZEhsT1lXMWxjeWgyWVd4MVpTazdYRzRnSUgxY2JseHVJQ0F2THlCSlJTQmtiMlZ6YmlkMElHMWhhMlVnWlhKeWIzSWdabWxsYkdSeklHNXZiaTFsYm5WdFpYSmhZbXhsWEc0Z0lDOHZJR2gwZEhBNkx5OXRjMlJ1TG0xcFkzSnZjMjltZEM1amIyMHZaVzR0ZFhNdmJHbGljbUZ5ZVM5cFpTOWtkM2MxTW5OaWRDaDJQWFp6TGprMEtTNWhjM0I0WEc0Z0lHbG1JQ2hwYzBWeWNtOXlLSFpoYkhWbEtWeHVJQ0FnSUNBZ0ppWWdLR3RsZVhNdWFXNWtaWGhQWmlnbmJXVnpjMkZuWlNjcElENDlJREFnZkh3Z2EyVjVjeTVwYm1SbGVFOW1LQ2RrWlhOamNtbHdkR2x2YmljcElENDlJREFwS1NCN1hHNGdJQ0FnY21WMGRYSnVJR1p2Y20xaGRFVnljbTl5S0haaGJIVmxLVHRjYmlBZ2ZWeHVYRzRnSUM4dklGTnZiV1VnZEhsd1pTQnZaaUJ2WW1wbFkzUWdkMmwwYUc5MWRDQndjbTl3WlhKMGFXVnpJR05oYmlCaVpTQnphRzl5ZEdOMWRIUmxaQzVjYmlBZ2FXWWdLR3RsZVhNdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdhV1lnS0dselJuVnVZM1JwYjI0b2RtRnNkV1VwS1NCN1hHNGdJQ0FnSUNCMllYSWdibUZ0WlNBOUlIWmhiSFZsTG01aGJXVWdQeUFuT2lBbklDc2dkbUZzZFdVdWJtRnRaU0E2SUNjbk8xeHVJQ0FnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDZGJSblZ1WTNScGIyNG5JQ3NnYm1GdFpTQXJJQ2RkSnl3Z0ozTndaV05wWVd3bktUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tHbHpVbVZuUlhod0tIWmhiSFZsS1NrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtGSmxaMFY0Y0M1d2NtOTBiM1I1Y0dVdWRHOVRkSEpwYm1jdVkyRnNiQ2gyWVd4MVpTa3NJQ2R5WldkbGVIQW5LVHRjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR2x6UkdGMFpTaDJZV3gxWlNrcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTaEVZWFJsTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnk1allXeHNLSFpoYkhWbEtTd2dKMlJoZEdVbktUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tHbHpSWEp5YjNJb2RtRnNkV1VwS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnWm05eWJXRjBSWEp5YjNJb2RtRnNkV1VwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUhaaGNpQmlZWE5sSUQwZ0p5Y3NJR0Z5Y21GNUlEMGdabUZzYzJVc0lHSnlZV05sY3lBOUlGc25leWNzSUNkOUoxMDdYRzVjYmlBZ0x5OGdUV0ZyWlNCQmNuSmhlU0J6WVhrZ2RHaGhkQ0IwYUdWNUlHRnlaU0JCY25KaGVWeHVJQ0JwWmlBb2FYTkJjbkpoZVNoMllXeDFaU2twSUh0Y2JpQWdJQ0JoY25KaGVTQTlJSFJ5ZFdVN1hHNGdJQ0FnWW5KaFkyVnpJRDBnV3lkYkp5d2dKMTBuWFR0Y2JpQWdmVnh1WEc0Z0lDOHZJRTFoYTJVZ1puVnVZM1JwYjI1eklITmhlU0IwYUdGMElIUm9aWGtnWVhKbElHWjFibU4wYVc5dWMxeHVJQ0JwWmlBb2FYTkdkVzVqZEdsdmJpaDJZV3gxWlNrcElIdGNiaUFnSUNCMllYSWdiaUE5SUhaaGJIVmxMbTVoYldVZ1B5QW5PaUFuSUNzZ2RtRnNkV1V1Ym1GdFpTQTZJQ2NuTzF4dUlDQWdJR0poYzJVZ1BTQW5JRnRHZFc1amRHbHZiaWNnS3lCdUlDc2dKMTBuTzF4dUlDQjlYRzVjYmlBZ0x5OGdUV0ZyWlNCU1pXZEZlSEJ6SUhOaGVTQjBhR0YwSUhSb1pYa2dZWEpsSUZKbFowVjRjSE5jYmlBZ2FXWWdLR2x6VW1WblJYaHdLSFpoYkhWbEtTa2dlMXh1SUNBZ0lHSmhjMlVnUFNBbklDY2dLeUJTWldkRmVIQXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwTzF4dUlDQjlYRzVjYmlBZ0x5OGdUV0ZyWlNCa1lYUmxjeUIzYVhSb0lIQnliM0JsY25ScFpYTWdabWx5YzNRZ2MyRjVJSFJvWlNCa1lYUmxYRzRnSUdsbUlDaHBjMFJoZEdVb2RtRnNkV1VwS1NCN1hHNGdJQ0FnWW1GelpTQTlJQ2NnSnlBcklFUmhkR1V1Y0hKdmRHOTBlWEJsTG5SdlZWUkRVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBPMXh1SUNCOVhHNWNiaUFnTHk4Z1RXRnJaU0JsY25KdmNpQjNhWFJvSUcxbGMzTmhaMlVnWm1seWMzUWdjMkY1SUhSb1pTQmxjbkp2Y2x4dUlDQnBaaUFvYVhORmNuSnZjaWgyWVd4MVpTa3BJSHRjYmlBZ0lDQmlZWE5sSUQwZ0p5QW5JQ3NnWm05eWJXRjBSWEp5YjNJb2RtRnNkV1VwTzF4dUlDQjlYRzVjYmlBZ2FXWWdLR3RsZVhNdWJHVnVaM1JvSUQwOVBTQXdJQ1ltSUNnaFlYSnlZWGtnZkh3Z2RtRnNkV1V1YkdWdVozUm9JRDA5SURBcEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdKeVlXTmxjMXN3WFNBcklHSmhjMlVnS3lCaWNtRmpaWE5iTVYwN1hHNGdJSDFjYmx4dUlDQnBaaUFvY21WamRYSnpaVlJwYldWeklEd2dNQ2tnZTF4dUlDQWdJR2xtSUNocGMxSmxaMFY0Y0NoMllXeDFaU2twSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNoU1pXZEZlSEF1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcExDQW5jbVZuWlhod0p5azdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNnblcwOWlhbVZqZEYwbkxDQW5jM0JsWTJsaGJDY3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJR04wZUM1elpXVnVMbkIxYzJnb2RtRnNkV1VwTzF4dVhHNGdJSFpoY2lCdmRYUndkWFE3WEc0Z0lHbG1JQ2hoY25KaGVTa2dlMXh1SUNBZ0lHOTFkSEIxZENBOUlHWnZjbTFoZEVGeWNtRjVLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5d2dkbWx6YVdKc1pVdGxlWE1zSUd0bGVYTXBPMXh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJRzkxZEhCMWRDQTlJR3RsZVhNdWJXRndLR1oxYm1OMGFXOXVLR3RsZVNrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUdadmNtMWhkRkJ5YjNCbGNuUjVLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5d2dkbWx6YVdKc1pVdGxlWE1zSUd0bGVTd2dZWEp5WVhrcE8xeHVJQ0FnSUgwcE8xeHVJQ0I5WEc1Y2JpQWdZM1I0TG5ObFpXNHVjRzl3S0NrN1hHNWNiaUFnY21WMGRYSnVJSEpsWkhWalpWUnZVMmx1WjJ4bFUzUnlhVzVuS0c5MWRIQjFkQ3dnWW1GelpTd2dZbkpoWTJWektUdGNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQm1iM0p0WVhSUWNtbHRhWFJwZG1Vb1kzUjRMQ0IyWVd4MVpTa2dlMXh1SUNCcFppQW9hWE5WYm1SbFptbHVaV1FvZG1Gc2RXVXBLVnh1SUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTZ25kVzVrWldacGJtVmtKeXdnSjNWdVpHVm1hVzVsWkNjcE8xeHVJQ0JwWmlBb2FYTlRkSEpwYm1jb2RtRnNkV1VwS1NCN1hHNGdJQ0FnZG1GeUlITnBiWEJzWlNBOUlDZGNYQ2NuSUNzZ1NsTlBUaTV6ZEhKcGJtZHBabmtvZG1Gc2RXVXBMbkpsY0d4aFkyVW9MMTVjSW54Y0lpUXZaeXdnSnljcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXVjbVZ3YkdGalpTZ3ZKeTluTENCY0lseGNYRnduWENJcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXVjbVZ3YkdGalpTZ3ZYRnhjWEZ3aUwyY3NJQ2RjSWljcElDc2dKMXhjSnljN1hHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0hOcGJYQnNaU3dnSjNOMGNtbHVaeWNwTzF4dUlDQjlYRzRnSUdsbUlDaHBjMDUxYldKbGNpaDJZV3gxWlNrcFhHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NjbklDc2dkbUZzZFdVc0lDZHVkVzFpWlhJbktUdGNiaUFnYVdZZ0tHbHpRbTl2YkdWaGJpaDJZV3gxWlNrcFhHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NjbklDc2dkbUZzZFdVc0lDZGliMjlzWldGdUp5azdYRzRnSUM4dklFWnZjaUJ6YjIxbElISmxZWE52YmlCMGVYQmxiMllnYm5Wc2JDQnBjeUJjSW05aWFtVmpkRndpTENCemJ5QnpjR1ZqYVdGc0lHTmhjMlVnYUdWeVpTNWNiaUFnYVdZZ0tHbHpUblZzYkNoMllXeDFaU2twWEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2R1ZFd4c0p5d2dKMjUxYkd3bktUdGNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQm1iM0p0WVhSRmNuSnZjaWgyWVd4MVpTa2dlMXh1SUNCeVpYUjFjbTRnSjFzbklDc2dSWEp5YjNJdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBJQ3NnSjEwbk8xeHVmVnh1WEc1Y2JtWjFibU4wYVc5dUlHWnZjbTFoZEVGeWNtRjVLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5d2dkbWx6YVdKc1pVdGxlWE1zSUd0bGVYTXBJSHRjYmlBZ2RtRnlJRzkxZEhCMWRDQTlJRnRkTzF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTUN3Z2JDQTlJSFpoYkhWbExteGxibWQwYURzZ2FTQThJR3c3SUNzcmFTa2dlMXh1SUNBZ0lHbG1JQ2hvWVhOUGQyNVFjbTl3WlhKMGVTaDJZV3gxWlN3Z1UzUnlhVzVuS0drcEtTa2dlMXh1SUNBZ0lDQWdiM1YwY0hWMExuQjFjMmdvWm05eWJXRjBVSEp2Y0dWeWRIa29ZM1I0TENCMllXeDFaU3dnY21WamRYSnpaVlJwYldWekxDQjJhWE5wWW14bFMyVjVjeXhjYmlBZ0lDQWdJQ0FnSUNCVGRISnBibWNvYVNrc0lIUnlkV1VwS1R0Y2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdiM1YwY0hWMExuQjFjMmdvSnljcE8xeHVJQ0FnSUgxY2JpQWdmVnh1SUNCclpYbHpMbVp2Y2tWaFkyZ29ablZ1WTNScGIyNG9hMlY1S1NCN1hHNGdJQ0FnYVdZZ0tDRnJaWGt1YldGMFkyZ29MMTVjWEdRckpDOHBLU0I3WEc0Z0lDQWdJQ0J2ZFhSd2RYUXVjSFZ6YUNobWIzSnRZWFJRY205d1pYSjBlU2hqZEhnc0lIWmhiSFZsTENCeVpXTjFjbk5sVkdsdFpYTXNJSFpwYzJsaWJHVkxaWGx6TEZ4dUlDQWdJQ0FnSUNBZ0lHdGxlU3dnZEhKMVpTa3BPMXh1SUNBZ0lIMWNiaUFnZlNrN1hHNGdJSEpsZEhWeWJpQnZkWFJ3ZFhRN1hHNTlYRzVjYmx4dVpuVnVZM1JwYjI0Z1ptOXliV0YwVUhKdmNHVnlkSGtvWTNSNExDQjJZV3gxWlN3Z2NtVmpkWEp6WlZScGJXVnpMQ0IyYVhOcFlteGxTMlY1Y3l3Z2EyVjVMQ0JoY25KaGVTa2dlMXh1SUNCMllYSWdibUZ0WlN3Z2MzUnlMQ0JrWlhOak8xeHVJQ0JrWlhOaklEMGdUMkpxWldOMExtZGxkRTkzYmxCeWIzQmxjblI1UkdWelkzSnBjSFJ2Y2loMllXeDFaU3dnYTJWNUtTQjhmQ0I3SUhaaGJIVmxPaUIyWVd4MVpWdHJaWGxkSUgwN1hHNGdJR2xtSUNoa1pYTmpMbWRsZENrZ2UxeHVJQ0FnSUdsbUlDaGtaWE5qTG5ObGRDa2dlMXh1SUNBZ0lDQWdjM1J5SUQwZ1kzUjRMbk4wZVd4cGVtVW9KMXRIWlhSMFpYSXZVMlYwZEdWeVhTY3NJQ2R6Y0dWamFXRnNKeWs3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lITjBjaUE5SUdOMGVDNXpkSGxzYVhwbEtDZGJSMlYwZEdWeVhTY3NJQ2R6Y0dWamFXRnNKeWs3WEc0Z0lDQWdmVnh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJR2xtSUNoa1pYTmpMbk5sZENrZ2UxeHVJQ0FnSUNBZ2MzUnlJRDBnWTNSNExuTjBlV3hwZW1Vb0oxdFRaWFIwWlhKZEp5d2dKM053WldOcFlXd25LVHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdhV1lnS0NGb1lYTlBkMjVRY205d1pYSjBlU2gyYVhOcFlteGxTMlY1Y3l3Z2EyVjVLU2tnZTF4dUlDQWdJRzVoYldVZ1BTQW5XeWNnS3lCclpYa2dLeUFuWFNjN1hHNGdJSDFjYmlBZ2FXWWdLQ0Z6ZEhJcElIdGNiaUFnSUNCcFppQW9ZM1I0TG5ObFpXNHVhVzVrWlhoUFppaGtaWE5qTG5aaGJIVmxLU0E4SURBcElIdGNiaUFnSUNBZ0lHbG1JQ2hwYzA1MWJHd29jbVZqZFhKelpWUnBiV1Z6S1NrZ2UxeHVJQ0FnSUNBZ0lDQnpkSElnUFNCbWIzSnRZWFJXWVd4MVpTaGpkSGdzSUdSbGMyTXVkbUZzZFdVc0lHNTFiR3dwTzF4dUlDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnYzNSeUlEMGdabTl5YldGMFZtRnNkV1VvWTNSNExDQmtaWE5qTG5aaGJIVmxMQ0J5WldOMWNuTmxWR2x0WlhNZ0xTQXhLVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQWdJR2xtSUNoemRISXVhVzVrWlhoUFppZ25YRnh1SnlrZ1BpQXRNU2tnZTF4dUlDQWdJQ0FnSUNCcFppQW9ZWEp5WVhrcElIdGNiaUFnSUNBZ0lDQWdJQ0J6ZEhJZ1BTQnpkSEl1YzNCc2FYUW9KMXhjYmljcExtMWhjQ2htZFc1amRHbHZiaWhzYVc1bEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnSnlBZ0p5QXJJR3hwYm1VN1hHNGdJQ0FnSUNBZ0lDQWdmU2t1YW05cGJpZ25YRnh1SnlrdWMzVmljM1J5S0RJcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJSE4wY2lBOUlDZGNYRzRuSUNzZ2MzUnlMbk53YkdsMEtDZGNYRzRuS1M1dFlYQW9ablZ1WTNScGIyNG9iR2x1WlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ2NnSUNBbklDc2diR2x1WlR0Y2JpQWdJQ0FnSUNBZ0lDQjlLUzVxYjJsdUtDZGNYRzRuS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0J6ZEhJZ1BTQmpkSGd1YzNSNWJHbDZaU2duVzBOcGNtTjFiR0Z5WFNjc0lDZHpjR1ZqYVdGc0p5azdYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lHbG1JQ2hwYzFWdVpHVm1hVzVsWkNodVlXMWxLU2tnZTF4dUlDQWdJR2xtSUNoaGNuSmhlU0FtSmlCclpYa3ViV0YwWTJnb0wxNWNYR1FySkM4cEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2MzUnlPMXh1SUNBZ0lIMWNiaUFnSUNCdVlXMWxJRDBnU2xOUFRpNXpkSEpwYm1kcFpua29KeWNnS3lCclpYa3BPMXh1SUNBZ0lHbG1JQ2h1WVcxbExtMWhkR05vS0M5ZVhDSW9XMkV0ZWtFdFdsOWRXMkV0ZWtFdFdsOHdMVGxkS2lsY0lpUXZLU2tnZTF4dUlDQWdJQ0FnYm1GdFpTQTlJRzVoYldVdWMzVmljM1J5S0RFc0lHNWhiV1V1YkdWdVozUm9JQzBnTWlrN1hHNGdJQ0FnSUNCdVlXMWxJRDBnWTNSNExuTjBlV3hwZW1Vb2JtRnRaU3dnSjI1aGJXVW5LVHRjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2JtRnRaU0E5SUc1aGJXVXVjbVZ3YkdGalpTZ3ZKeTluTENCY0lseGNYRnduWENJcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDNXlaWEJzWVdObEtDOWNYRnhjWENJdlp5d2dKMXdpSnlsY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0xuSmxjR3hoWTJVb0x5aGVYQ0o4WENJa0tTOW5MQ0JjSWlkY0lpazdYRzRnSUNBZ0lDQnVZVzFsSUQwZ1kzUjRMbk4wZVd4cGVtVW9ibUZ0WlN3Z0ozTjBjbWx1WnljcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCdVlXMWxJQ3NnSnpvZ0p5QXJJSE4wY2p0Y2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCeVpXUjFZMlZVYjFOcGJtZHNaVk4wY21sdVp5aHZkWFJ3ZFhRc0lHSmhjMlVzSUdKeVlXTmxjeWtnZTF4dUlDQjJZWElnYm5WdFRHbHVaWE5GYzNRZ1BTQXdPMXh1SUNCMllYSWdiR1Z1WjNSb0lEMGdiM1YwY0hWMExuSmxaSFZqWlNobWRXNWpkR2x2Ymlod2NtVjJMQ0JqZFhJcElIdGNiaUFnSUNCdWRXMU1hVzVsYzBWemRDc3JPMXh1SUNBZ0lHbG1JQ2hqZFhJdWFXNWtaWGhQWmlnblhGeHVKeWtnUGowZ01Da2diblZ0VEdsdVpYTkZjM1FyS3p0Y2JpQWdJQ0J5WlhSMWNtNGdjSEpsZGlBcklHTjFjaTV5WlhCc1lXTmxLQzljWEhVd01ERmlYRnhiWEZ4a1hGeGtQMjB2Wnl3Z0p5Y3BMbXhsYm1kMGFDQXJJREU3WEc0Z0lIMHNJREFwTzF4dVhHNGdJR2xtSUNoc1pXNW5kR2dnUGlBMk1Da2dlMXh1SUNBZ0lISmxkSFZ5YmlCaWNtRmpaWE5iTUYwZ0sxeHVJQ0FnSUNBZ0lDQWdJQ0FvWW1GelpTQTlQVDBnSnljZ1B5QW5KeUE2SUdKaGMyVWdLeUFuWEZ4dUlDY3BJQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0p5QW5JQ3RjYmlBZ0lDQWdJQ0FnSUNBZ2IzVjBjSFYwTG1wdmFXNG9KeXhjWEc0Z0lDY3BJQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0p5QW5JQ3RjYmlBZ0lDQWdJQ0FnSUNBZ1luSmhZMlZ6V3pGZE8xeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlHSnlZV05sYzFzd1hTQXJJR0poYzJVZ0t5QW5JQ2NnS3lCdmRYUndkWFF1YW05cGJpZ25MQ0FuS1NBcklDY2dKeUFySUdKeVlXTmxjMXN4WFR0Y2JuMWNibHh1WEc0dkx5Qk9UMVJGT2lCVWFHVnpaU0IwZVhCbElHTm9aV05yYVc1bklHWjFibU4wYVc5dWN5QnBiblJsYm5ScGIyNWhiR3g1SUdSdmJpZDBJSFZ6WlNCZ2FXNXpkR0Z1WTJWdlptQmNiaTh2SUdKbFkyRjFjMlVnYVhRZ2FYTWdabkpoWjJsc1pTQmhibVFnWTJGdUlHSmxJR1ZoYzJsc2VTQm1ZV3RsWkNCM2FYUm9JR0JQWW1wbFkzUXVZM0psWVhSbEtDbGdMbHh1Wm5WdVkzUnBiMjRnYVhOQmNuSmhlU2hoY2lrZ2UxeHVJQ0J5WlhSMWNtNGdRWEp5WVhrdWFYTkJjbkpoZVNoaGNpazdYRzU5WEc1bGVIQnZjblJ6TG1selFYSnlZWGtnUFNCcGMwRnljbUY1TzF4dVhHNW1kVzVqZEdsdmJpQnBjMEp2YjJ4bFlXNG9ZWEpuS1NCN1hHNGdJSEpsZEhWeWJpQjBlWEJsYjJZZ1lYSm5JRDA5UFNBblltOXZiR1ZoYmljN1hHNTlYRzVsZUhCdmNuUnpMbWx6UW05dmJHVmhiaUE5SUdselFtOXZiR1ZoYmp0Y2JseHVablZ1WTNScGIyNGdhWE5PZFd4c0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z1lYSm5JRDA5UFNCdWRXeHNPMXh1ZlZ4dVpYaHdiM0owY3k1cGMwNTFiR3dnUFNCcGMwNTFiR3c3WEc1Y2JtWjFibU4wYVc5dUlHbHpUblZzYkU5eVZXNWtaV1pwYm1Wa0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z1lYSm5JRDA5SUc1MWJHdzdYRzU5WEc1bGVIQnZjblJ6TG1selRuVnNiRTl5Vlc1a1pXWnBibVZrSUQwZ2FYTk9kV3hzVDNKVmJtUmxabWx1WldRN1hHNWNibVoxYm1OMGFXOXVJR2x6VG5WdFltVnlLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0oyNTFiV0psY2ljN1hHNTlYRzVsZUhCdmNuUnpMbWx6VG5WdFltVnlJRDBnYVhOT2RXMWlaWEk3WEc1Y2JtWjFibU4wYVc5dUlHbHpVM1J5YVc1bktHRnlaeWtnZTF4dUlDQnlaWFIxY200Z2RIbHdaVzltSUdGeVp5QTlQVDBnSjNOMGNtbHVaeWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpVM1J5YVc1bklEMGdhWE5UZEhKcGJtYzdYRzVjYm1aMWJtTjBhVzl1SUdselUzbHRZbTlzS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKM041YldKdmJDYzdYRzU5WEc1bGVIQnZjblJ6TG1selUzbHRZbTlzSUQwZ2FYTlRlVzFpYjJ3N1hHNWNibVoxYm1OMGFXOXVJR2x6Vlc1a1pXWnBibVZrS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnWVhKbklEMDlQU0IyYjJsa0lEQTdYRzU5WEc1bGVIQnZjblJ6TG1selZXNWtaV1pwYm1Wa0lEMGdhWE5WYm1SbFptbHVaV1E3WEc1Y2JtWjFibU4wYVc5dUlHbHpVbVZuUlhod0tISmxLU0I3WEc0Z0lISmxkSFZ5YmlCcGMwOWlhbVZqZENoeVpTa2dKaVlnYjJKcVpXTjBWRzlUZEhKcGJtY29jbVVwSUQwOVBTQW5XMjlpYW1WamRDQlNaV2RGZUhCZEp6dGNibjFjYm1WNGNHOXlkSE11YVhOU1pXZEZlSEFnUFNCcGMxSmxaMFY0Y0R0Y2JseHVablZ1WTNScGIyNGdhWE5QWW1wbFkzUW9ZWEpuS1NCN1hHNGdJSEpsZEhWeWJpQjBlWEJsYjJZZ1lYSm5JRDA5UFNBbmIySnFaV04wSnlBbUppQmhjbWNnSVQwOUlHNTFiR3c3WEc1OVhHNWxlSEJ2Y25SekxtbHpUMkpxWldOMElEMGdhWE5QWW1wbFkzUTdYRzVjYm1aMWJtTjBhVzl1SUdselJHRjBaU2hrS1NCN1hHNGdJSEpsZEhWeWJpQnBjMDlpYW1WamRDaGtLU0FtSmlCdlltcGxZM1JVYjFOMGNtbHVaeWhrS1NBOVBUMGdKMXR2WW1wbFkzUWdSR0YwWlYwbk8xeHVmVnh1Wlhod2IzSjBjeTVwYzBSaGRHVWdQU0JwYzBSaGRHVTdYRzVjYm1aMWJtTjBhVzl1SUdselJYSnliM0lvWlNrZ2UxeHVJQ0J5WlhSMWNtNGdhWE5QWW1wbFkzUW9aU2tnSmlaY2JpQWdJQ0FnSUNodlltcGxZM1JVYjFOMGNtbHVaeWhsS1NBOVBUMGdKMXR2WW1wbFkzUWdSWEp5YjNKZEp5QjhmQ0JsSUdsdWMzUmhibU5sYjJZZ1JYSnliM0lwTzF4dWZWeHVaWGh3YjNKMGN5NXBjMFZ5Y205eUlEMGdhWE5GY25KdmNqdGNibHh1Wm5WdVkzUnBiMjRnYVhOR2RXNWpkR2x2YmloaGNtY3BJSHRjYmlBZ2NtVjBkWEp1SUhSNWNHVnZaaUJoY21jZ1BUMDlJQ2RtZFc1amRHbHZiaWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpSblZ1WTNScGIyNGdQU0JwYzBaMWJtTjBhVzl1TzF4dVhHNW1kVzVqZEdsdmJpQnBjMUJ5YVcxcGRHbDJaU2hoY21jcElIdGNiaUFnY21WMGRYSnVJR0Z5WnlBOVBUMGdiblZzYkNCOGZGeHVJQ0FnSUNBZ0lDQWdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0oySnZiMnhsWVc0bklIeDhYRzRnSUNBZ0lDQWdJQ0IwZVhCbGIyWWdZWEpuSUQwOVBTQW5iblZ0WW1WeUp5QjhmRnh1SUNBZ0lDQWdJQ0FnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKM04wY21sdVp5Y2dmSHhjYmlBZ0lDQWdJQ0FnSUhSNWNHVnZaaUJoY21jZ1BUMDlJQ2R6ZVcxaWIyd25JSHg4SUNBdkx5QkZVellnYzNsdFltOXNYRzRnSUNBZ0lDQWdJQ0IwZVhCbGIyWWdZWEpuSUQwOVBTQW5kVzVrWldacGJtVmtKenRjYm4xY2JtVjRjRzl5ZEhNdWFYTlFjbWx0YVhScGRtVWdQU0JwYzFCeWFXMXBkR2wyWlR0Y2JseHVaWGh3YjNKMGN5NXBjMEoxWm1abGNpQTlJSEpsY1hWcGNtVW9KeTR2YzNWd2NHOXlkQzlwYzBKMVptWmxjaWNwTzF4dVhHNW1kVzVqZEdsdmJpQnZZbXBsWTNSVWIxTjBjbWx1WnlodktTQjdYRzRnSUhKbGRIVnliaUJQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2J5azdYRzU5WEc1Y2JseHVablZ1WTNScGIyNGdjR0ZrS0c0cElIdGNiaUFnY21WMGRYSnVJRzRnUENBeE1DQS9JQ2N3SnlBcklHNHVkRzlUZEhKcGJtY29NVEFwSURvZ2JpNTBiMU4wY21sdVp5Z3hNQ2s3WEc1OVhHNWNibHh1ZG1GeUlHMXZiblJvY3lBOUlGc25TbUZ1Snl3Z0owWmxZaWNzSUNkTllYSW5MQ0FuUVhCeUp5d2dKMDFoZVNjc0lDZEtkVzRuTENBblNuVnNKeXdnSjBGMVp5Y3NJQ2RUWlhBbkxGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBblQyTjBKeXdnSjA1dmRpY3NJQ2RFWldNblhUdGNibHh1THk4Z01qWWdSbVZpSURFMk9qRTVPak0wWEc1bWRXNWpkR2x2YmlCMGFXMWxjM1JoYlhBb0tTQjdYRzRnSUhaaGNpQmtJRDBnYm1WM0lFUmhkR1VvS1R0Y2JpQWdkbUZ5SUhScGJXVWdQU0JiY0dGa0tHUXVaMlYwU0c5MWNuTW9LU2tzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSEJoWkNoa0xtZGxkRTFwYm5WMFpYTW9LU2tzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSEJoWkNoa0xtZGxkRk5sWTI5dVpITW9LU2xkTG1wdmFXNG9Kem9uS1R0Y2JpQWdjbVYwZFhKdUlGdGtMbWRsZEVSaGRHVW9LU3dnYlc5dWRHaHpXMlF1WjJWMFRXOXVkR2dvS1Ywc0lIUnBiV1ZkTG1wdmFXNG9KeUFuS1R0Y2JuMWNibHh1WEc0dkx5QnNiMmNnYVhNZ2FuVnpkQ0JoSUhSb2FXNGdkM0poY0hCbGNpQjBieUJqYjI1emIyeGxMbXh2WnlCMGFHRjBJSEJ5WlhCbGJtUnpJR0VnZEdsdFpYTjBZVzF3WEc1bGVIQnZjblJ6TG14dlp5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQmpiMjV6YjJ4bExteHZaeWduSlhNZ0xTQWxjeWNzSUhScGJXVnpkR0Z0Y0NncExDQmxlSEJ2Y25SekxtWnZjbTFoZEM1aGNIQnNlU2hsZUhCdmNuUnpMQ0JoY21kMWJXVnVkSE1wS1R0Y2JuMDdYRzVjYmx4dUx5b3FYRzRnS2lCSmJtaGxjbWwwSUhSb1pTQndjbTkwYjNSNWNHVWdiV1YwYUc5a2N5Qm1jbTl0SUc5dVpTQmpiMjV6ZEhKMVkzUnZjaUJwYm5SdklHRnViM1JvWlhJdVhHNGdLbHh1SUNvZ1ZHaGxJRVoxYm1OMGFXOXVMbkJ5YjNSdmRIbHdaUzVwYm1obGNtbDBjeUJtY205dElHeGhibWN1YW5NZ2NtVjNjbWwwZEdWdUlHRnpJR0VnYzNSaGJtUmhiRzl1WlZ4dUlDb2dablZ1WTNScGIyNGdLRzV2ZENCdmJpQkdkVzVqZEdsdmJpNXdjbTkwYjNSNWNHVXBMaUJPVDFSRk9pQkpaaUIwYUdseklHWnBiR1VnYVhNZ2RHOGdZbVVnYkc5aFpHVmtYRzRnS2lCa2RYSnBibWNnWW05dmRITjBjbUZ3Y0dsdVp5QjBhR2x6SUdaMWJtTjBhVzl1SUc1bFpXUnpJSFJ2SUdKbElISmxkM0pwZEhSbGJpQjFjMmx1WnlCemIyMWxJRzVoZEdsMlpWeHVJQ29nWm5WdVkzUnBiMjV6SUdGeklIQnliM1J2ZEhsd1pTQnpaWFIxY0NCMWMybHVaeUJ1YjNKdFlXd2dTbUYyWVZOamNtbHdkQ0JrYjJWeklHNXZkQ0IzYjNKcklHRnpYRzRnS2lCbGVIQmxZM1JsWkNCa2RYSnBibWNnWW05dmRITjBjbUZ3Y0dsdVp5QW9jMlZsSUcxcGNuSnZjaTVxY3lCcGJpQnlNVEUwT1RBektTNWNiaUFxWEc0Z0tpQkFjR0Z5WVcwZ2UyWjFibU4wYVc5dWZTQmpkRzl5SUVOdmJuTjBjblZqZEc5eUlHWjFibU4wYVc5dUlIZG9hV05vSUc1bFpXUnpJSFJ2SUdsdWFHVnlhWFFnZEdobFhHNGdLaUFnSUNBZ2NISnZkRzkwZVhCbExseHVJQ29nUUhCaGNtRnRJSHRtZFc1amRHbHZibjBnYzNWd1pYSkRkRzl5SUVOdmJuTjBjblZqZEc5eUlHWjFibU4wYVc5dUlIUnZJR2x1YUdWeWFYUWdjSEp2ZEc5MGVYQmxJR1p5YjIwdVhHNGdLaTljYm1WNGNHOXlkSE11YVc1b1pYSnBkSE1nUFNCeVpYRjFhWEpsS0NkcGJtaGxjbWwwY3ljcE8xeHVYRzVsZUhCdmNuUnpMbDlsZUhSbGJtUWdQU0JtZFc1amRHbHZiaWh2Y21sbmFXNHNJR0ZrWkNrZ2UxeHVJQ0F2THlCRWIyNG5kQ0JrYnlCaGJubDBhR2x1WnlCcFppQmhaR1FnYVhOdUozUWdZVzRnYjJKcVpXTjBYRzRnSUdsbUlDZ2hZV1JrSUh4OElDRnBjMDlpYW1WamRDaGhaR1FwS1NCeVpYUjFjbTRnYjNKcFoybHVPMXh1WEc0Z0lIWmhjaUJyWlhseklEMGdUMkpxWldOMExtdGxlWE1vWVdSa0tUdGNiaUFnZG1GeUlHa2dQU0JyWlhsekxteGxibWQwYUR0Y2JpQWdkMmhwYkdVZ0tHa3RMU2tnZTF4dUlDQWdJRzl5YVdkcGJsdHJaWGx6VzJsZFhTQTlJR0ZrWkZ0clpYbHpXMmxkWFR0Y2JpQWdmVnh1SUNCeVpYUjFjbTRnYjNKcFoybHVPMXh1ZlR0Y2JseHVablZ1WTNScGIyNGdhR0Z6VDNkdVVISnZjR1Z5ZEhrb2IySnFMQ0J3Y205d0tTQjdYRzRnSUhKbGRIVnliaUJQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMbWhoYzA5M2JsQnliM0JsY25SNUxtTmhiR3dvYjJKcUxDQndjbTl3S1R0Y2JuMWNiaUpkZlE9PSIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIFNoaW1taW5nIHN0YXJ0cyBoZXJlLlxuKGZ1bmN0aW9uKCkge1xuICAvLyBVdGlscy5cbiAgdmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuL3V0aWxzJykubG9nO1xuICB2YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG4gIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJEZXRhaWxzID0gYnJvd3NlckRldGFpbHM7XG4gIG1vZHVsZS5leHBvcnRzLmV4dHJhY3RWZXJzaW9uID0gcmVxdWlyZSgnLi91dGlscycpLmV4dHJhY3RWZXJzaW9uO1xuICBtb2R1bGUuZXhwb3J0cy5kaXNhYmxlTG9nID0gcmVxdWlyZSgnLi91dGlscycpLmRpc2FibGVMb2c7XG5cbiAgLy8gQ29tbWVudCBvdXQgdGhlIGxpbmUgYmVsb3cgaWYgeW91IHdhbnQgbG9nZ2luZyB0byBvY2N1ciwgaW5jbHVkaW5nIGxvZ2dpbmdcbiAgLy8gZm9yIHRoZSBzd2l0Y2ggc3RhdGVtZW50IGJlbG93LiBDYW4gYWxzbyBiZSB0dXJuZWQgb24gaW4gdGhlIGJyb3dzZXIgdmlhXG4gIC8vIGFkYXB0ZXIuZGlzYWJsZUxvZyhmYWxzZSksIGJ1dCB0aGVuIGxvZ2dpbmcgZnJvbSB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvd1xuICAvLyB3aWxsIG5vdCBhcHBlYXIuXG4gIHJlcXVpcmUoJy4vdXRpbHMnKS5kaXNhYmxlTG9nKHRydWUpO1xuXG4gIC8vIEJyb3dzZXIgc2hpbXMuXG4gIHZhciBjaHJvbWVTaGltID0gcmVxdWlyZSgnLi9jaHJvbWUvY2hyb21lX3NoaW0nKSB8fCBudWxsO1xuICB2YXIgZWRnZVNoaW0gPSByZXF1aXJlKCcuL2VkZ2UvZWRnZV9zaGltJykgfHwgbnVsbDtcbiAgdmFyIGZpcmVmb3hTaGltID0gcmVxdWlyZSgnLi9maXJlZm94L2ZpcmVmb3hfc2hpbScpIHx8IG51bGw7XG4gIHZhciBzYWZhcmlTaGltID0gcmVxdWlyZSgnLi9zYWZhcmkvc2FmYXJpX3NoaW0nKSB8fCBudWxsO1xuXG4gIC8vIFNoaW0gYnJvd3NlciBpZiBmb3VuZC5cbiAgc3dpdGNoIChicm93c2VyRGV0YWlscy5icm93c2VyKSB7XG4gICAgY2FzZSAnb3BlcmEnOiAvLyBmYWxsdGhyb3VnaCBhcyBpdCB1c2VzIGNocm9tZSBzaGltc1xuICAgIGNhc2UgJ2Nocm9tZSc6XG4gICAgICBpZiAoIWNocm9tZVNoaW0gfHwgIWNocm9tZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ0Nocm9tZSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBjaHJvbWUuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBjaHJvbWVTaGltO1xuXG4gICAgICBjaHJvbWVTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbU9uVHJhY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpcmVmb3gnOlxuICAgICAgaWYgKCFmaXJlZm94U2hpbSB8fCAhZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ0ZpcmVmb3ggc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZmlyZWZveC4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGZpcmVmb3hTaGltO1xuXG4gICAgICBmaXJlZm94U2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltU291cmNlT2JqZWN0KCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1PblRyYWNrKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlZGdlJzpcbiAgICAgIGlmICghZWRnZVNoaW0gfHwgIWVkZ2VTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdNUyBlZGdlIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGVkZ2UuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBlZGdlU2hpbTtcblxuICAgICAgZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzYWZhcmknOlxuICAgICAgaWYgKCFzYWZhcmlTaGltKSB7XG4gICAgICAgIGxvZ2dpbmcoJ1NhZmFyaSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBzYWZhcmkuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBzYWZhcmlTaGltO1xuXG4gICAgICBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2dnaW5nKCdVbnN1cHBvcnRlZCBicm93c2VyIScpO1xuICB9XG59KSgpO1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykubG9nO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGNocm9tZVNoaW0gPSB7XG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmICEoJ29udHJhY2snIGluXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIC8vIG9uYWRkc3RyZWFtIGRvZXMgbm90IGZpcmUgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIHRvIGFuIGV4aXN0aW5nXG4gICAgICAgICAgICAvLyBzdHJlYW0uIEJ1dCBzdHJlYW0ub25hZGR0cmFjayBpcyBpbXBsZW1lbnRlZCBzbyB3ZSB1c2UgdGhhdC5cbiAgICAgICAgICAgIGUuc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24odGUpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRlLnRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdGUudHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAod2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcbiAgICAgICAgISgnc3JjT2JqZWN0JyBpbiB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIC8vIFNoaW0gdGhlIHNyY09iamVjdCBwcm9wZXJ0eSwgb25jZSwgd2hlbiBIVE1MTWVkaWFFbGVtZW50IGlzIGZvdW5kLlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjT2JqZWN0Jywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIC8vIFVzZSBfc3JjT2JqZWN0IGFzIGEgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgdGhpcyBzaGltXG4gICAgICAgICAgICB0aGlzLl9zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgICBpZiAodGhpcy5zcmMpIHtcbiAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnNyYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghc3RyZWFtKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3JjID0gJyc7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byByZWNyZWF0ZSB0aGUgYmxvYiB1cmwgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIG9yXG4gICAgICAgICAgICAvLyByZW1vdmVkLiBEb2luZyBpdCBtYW51YWxseSBzaW5jZSB3ZSB3YW50IHRvIGF2b2lkIGEgcmVjdXJzaW9uLlxuICAgICAgICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLnNyYykge1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoc2VsZi5zcmMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcigncmVtb3ZldHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgIC8vIFRyYW5zbGF0ZSBpY2VUcmFuc3BvcnRQb2xpY3kgdG8gaWNlVHJhbnNwb3J0cyxcbiAgICAgIC8vIHNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3dlYnJ0Yy9pc3N1ZXMvZGV0YWlsP2lkPTQ4NjlcbiAgICAgIGxvZ2dpbmcoJ1BlZXJDb25uZWN0aW9uJyk7XG4gICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgIHBjQ29uZmlnLmljZVRyYW5zcG9ydHMgPSBwY0NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3k7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYyA9IG5ldyB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cyk7XG4gICAgICB2YXIgb3JpZ0dldFN0YXRzID0gcGMuZ2V0U3RhdHMuYmluZChwYyk7XG4gICAgICBwYy5nZXRTdGF0cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICAvLyBJZiBzZWxlY3RvciBpcyBhIGZ1bmN0aW9uIHRoZW4gd2UgYXJlIGluIHRoZSBvbGQgc3R5bGUgc3RhdHMgc28ganVzdFxuICAgICAgICAvLyBwYXNzIGJhY2sgdGhlIG9yaWdpbmFsIGdldFN0YXRzIGZvcm1hdCB0byBhdm9pZCBicmVha2luZyBvbGQgdXNlcnMuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpeENocm9tZVN0YXRzXyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgdmFyIHN0YW5kYXJkUmVwb3J0ID0ge307XG4gICAgICAgICAgdmFyIHJlcG9ydHMgPSByZXNwb25zZS5yZXN1bHQoKTtcbiAgICAgICAgICByZXBvcnRzLmZvckVhY2goZnVuY3Rpb24ocmVwb3J0KSB7XG4gICAgICAgICAgICB2YXIgc3RhbmRhcmRTdGF0cyA9IHtcbiAgICAgICAgICAgICAgaWQ6IHJlcG9ydC5pZCxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiByZXBvcnQudGltZXN0YW1wLFxuICAgICAgICAgICAgICB0eXBlOiByZXBvcnQudHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcG9ydC5uYW1lcygpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgICBzdGFuZGFyZFN0YXRzW25hbWVdID0gcmVwb3J0LnN0YXQobmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0YW5kYXJkUmVwb3J0W3N0YW5kYXJkU3RhdHMuaWRdID0gc3RhbmRhcmRTdGF0cztcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBzdGFuZGFyZFJlcG9ydDtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgdmFyIHN1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGFyZ3NbMV0oZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKSk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMuYXBwbHkodGhpcywgW3N1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfLFxuICAgICAgICAgICAgICBhcmd1bWVudHNbMF1dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHByb21pc2Utc3VwcG9ydFxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAxICYmIHR5cGVvZiBzZWxlY3RvciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9yaWdHZXRTdGF0cy5hcHBseShzZWxmLFxuICAgICAgICAgICAgICAgIFtmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZS5hcHBseShudWxsLCBbZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKV0pO1xuICAgICAgICAgICAgICAgIH0sIHJlamVjdF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcmlnR2V0U3RhdHMuYXBwbHkoc2VsZiwgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcGM7XG4gICAgfTtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cbiAgICBpZiAod2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGFkZCBwcm9taXNlIHN1cHBvcnRcbiAgICBbJ2NyZWF0ZU9mZmVyJywgJ2NyZWF0ZUFuc3dlciddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSB8fCAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1swXSkgPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkoc2VsZiwgW3Jlc29sdmUsIHJlamVjdCwgb3B0c10pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgICAgIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGFyZ3NbMF0gPSBuZXcgKChtZXRob2QgPT09ICdhZGRJY2VDYW5kaWRhdGUnKT9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3NbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkoc2VsZiwgW2FyZ3NbMF0sXG4gICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgICAgICAgIGFyZ3NbMV0uYXBwbHkobnVsbCwgW10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgICAgICAgIGFyZ3NbMl0uYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgfSxcblxuICAvLyBBdHRhY2ggYSBtZWRpYSBzdHJlYW0gdG8gYW4gZWxlbWVudC5cbiAgYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKGVsZW1lbnQsIHN0cmVhbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIGF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uID49IDQzKSB7XG4gICAgICBlbGVtZW50LnNyY09iamVjdCA9IHN0cmVhbTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtZW50LnNyYyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGVsZW1lbnQuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnaW5nKCdFcnJvciBhdHRhY2hpbmcgc3RyZWFtIHRvIGVsZW1lbnQuJyk7XG4gICAgfVxuICB9LFxuXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHRvLCBmcm9tKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgcmVhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA+PSA0Mykge1xuICAgICAgdG8uc3JjT2JqZWN0ID0gZnJvbS5zcmNPYmplY3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvLnNyYyA9IGZyb20uc3JjO1xuICAgIH1cbiAgfVxufTtcblxuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbU9uVHJhY2s6IGNocm9tZVNoaW0uc2hpbU9uVHJhY2ssXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCxcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKSxcbiAgYXR0YWNoTWVkaWFTdHJlYW06IGNocm9tZVNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGNocm9tZVNoaW0ucmVhdHRhY2hNZWRpYVN0cmVhbVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmxvZztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvbnN0cmFpbnRzVG9DaHJvbWVfID0gZnVuY3Rpb24oYykge1xuICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5tYW5kYXRvcnkgfHwgYy5vcHRpb25hbCkge1xuICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIHZhciBjYyA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVxdWlyZScgfHwga2V5ID09PSAnYWR2YW5jZWQnIHx8IGtleSA9PT0gJ21lZGlhU291cmNlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgciA9ICh0eXBlb2YgY1trZXldID09PSAnb2JqZWN0JykgPyBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xuICAgICAgICByLm1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgIH1cbiAgICAgIHZhciBvbGRuYW1lXyA9IGZ1bmN0aW9uKHByZWZpeCwgbmFtZSkge1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmFtZSA9PT0gJ2RldmljZUlkJykgPyAnc291cmNlSWQnIDogbmFtZTtcbiAgICAgIH07XG4gICAgICBpZiAoci5pZGVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNjLm9wdGlvbmFsID0gY2Mub3B0aW9uYWwgfHwgW107XG4gICAgICAgIHZhciBvYyA9IHt9O1xuICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJ21pbicsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgICBvYyA9IHt9O1xuICAgICAgICAgIG9jW29sZG5hbWVfKCdtYXgnLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJycsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygci5leGFjdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xuICAgICAgICBjYy5tYW5kYXRvcnlbb2xkbmFtZV8oJycsIGtleSldID0gci5leGFjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFsnbWluJywgJ21heCddLmZvckVhY2goZnVuY3Rpb24obWl4KSB7XG4gICAgICAgICAgaWYgKHJbbWl4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjYy5tYW5kYXRvcnkgPSBjYy5tYW5kYXRvcnkgfHwge307XG4gICAgICAgICAgICBjYy5tYW5kYXRvcnlbb2xkbmFtZV8obWl4LCBrZXkpXSA9IHJbbWl4XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChjLmFkdmFuY2VkKSB7XG4gICAgICBjYy5vcHRpb25hbCA9IChjYy5vcHRpb25hbCB8fCBbXSkuY29uY2F0KGMuYWR2YW5jZWQpO1xuICAgIH1cbiAgICByZXR1cm4gY2M7XG4gIH07XG5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgaWYgKGNvbnN0cmFpbnRzLmF1ZGlvKSB7XG4gICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICB9XG4gICAgaWYgKGNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICB9XG4gICAgbG9nZ2luZygnY2hyb21lOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICByZXR1cm4gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYShjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKTtcbiAgfTtcbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGdldFVzZXJNZWRpYV87XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYShjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge1xuICAgICAgZ2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGVudW1lcmF0ZURldmljZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIHZhciBraW5kcyA9IHthdWRpbzogJ2F1ZGlvaW5wdXQnLCB2aWRlbzogJ3ZpZGVvaW5wdXQnfTtcbiAgICAgICAgICByZXR1cm4gTWVkaWFTdHJlYW1UcmFjay5nZXRTb3VyY2VzKGZ1bmN0aW9uKGRldmljZXMpIHtcbiAgICAgICAgICAgIHJlc29sdmUoZGV2aWNlcy5tYXAoZnVuY3Rpb24oZGV2aWNlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7bGFiZWw6IGRldmljZS5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICBraW5kOiBraW5kc1tkZXZpY2Uua2luZF0sXG4gICAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQ6IGRldmljZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICBncm91cElkOiAnJ307XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBBIHNoaW0gZm9yIGdldFVzZXJNZWRpYSBtZXRob2Qgb24gdGhlIG1lZGlhRGV2aWNlcyBvYmplY3QuXG4gIC8vIFRPRE8oS2FwdGVuSmFuc3NvbikgcmVtb3ZlIG9uY2UgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIHN0YWJsZS5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSkge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICAgIHJldHVybiBnZXRVc2VyTWVkaWFQcm9taXNlXyhjb25zdHJhaW50cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFdmVuIHRob3VnaCBDaHJvbWUgNDUgaGFzIG5hdmlnYXRvci5tZWRpYURldmljZXMgYW5kIGEgZ2V0VXNlck1lZGlhXG4gICAgLy8gZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIFByb21pc2UsIGl0IGRvZXMgbm90IGFjY2VwdCBzcGVjLXN0eWxlXG4gICAgLy8gY29uc3RyYWludHMuXG4gICAgdmFyIG9yaWdHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmIChjKSB7XG4gICAgICAgIGxvZ2dpbmcoJ3NwZWM6ICAgJyArIEpTT04uc3RyaW5naWZ5KGMpKTsgLy8gd2hpdGVzcGFjZSBmb3IgYWxpZ25tZW50XG4gICAgICAgIGMuYXVkaW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjLmF1ZGlvKTtcbiAgICAgICAgYy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGMudmlkZW8pO1xuICAgICAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3JpZ0dldFVzZXJNZWRpYShjKTtcbiAgICB9LmJpbmQodGhpcyk7XG4gIH1cblxuICAvLyBEdW1teSBkZXZpY2VjaGFuZ2UgZXZlbnQgbWV0aG9kcy5cbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgbG9nZ2luZygnRHVtbXkgbWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgY2FsbGVkLicpO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gU0RQIGhlbHBlcnMuXG52YXIgU0RQVXRpbHMgPSB7fTtcblxuLy8gR2VuZXJhdGUgYW4gYWxwaGFudW1lcmljIGlkZW50aWZpZXIgZm9yIGNuYW1lIG9yIG1pZHMuXG4vLyBUT0RPOiB1c2UgVVVJRHMgaW5zdGVhZD8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgMTApO1xufTtcblxuLy8gVGhlIFJUQ1AgQ05BTUUgdXNlZCBieSBhbGwgcGVlcmNvbm5lY3Rpb25zIGZyb20gdGhlIHNhbWUgSlMuXG5TRFBVdGlscy5sb2NhbENOYW1lID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbi8vIFNwbGl0cyBTRFAgaW50byBsaW5lcywgZGVhbGluZyB3aXRoIGJvdGggQ1JMRiBhbmQgTEYuXG5TRFBVdGlscy5zcGxpdExpbmVzID0gZnVuY3Rpb24oYmxvYikge1xuICByZXR1cm4gYmxvYi50cmltKCkuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUudHJpbSgpO1xuICB9KTtcbn07XG4vLyBTcGxpdHMgU0RQIGludG8gc2Vzc2lvbnBhcnQgYW5kIG1lZGlhc2VjdGlvbnMuIEVuc3VyZXMgQ1JMRi5cblNEUFV0aWxzLnNwbGl0U2VjdGlvbnMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHZhciBwYXJ0cyA9IGJsb2Iuc3BsaXQoJ1xcbm09Jyk7XG4gIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCwgaW5kZXgpIHtcbiAgICByZXR1cm4gKGluZGV4ID4gMCA/ICdtPScgKyBwYXJ0IDogcGFydCkudHJpbSgpICsgJ1xcclxcbic7XG4gIH0pO1xufTtcblxuLy8gUmV0dXJucyBsaW5lcyB0aGF0IHN0YXJ0IHdpdGggYSBjZXJ0YWluIHByZWZpeC5cblNEUFV0aWxzLm1hdGNoUHJlZml4ID0gZnVuY3Rpb24oYmxvYiwgcHJlZml4KSB7XG4gIHJldHVybiBTRFBVdGlscy5zcGxpdExpbmVzKGJsb2IpLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUuaW5kZXhPZihwcmVmaXgpID09PSAwO1xuICB9KTtcbn07XG5cbi8vIFBhcnNlcyBhbiBJQ0UgY2FuZGlkYXRlIGxpbmUuIFNhbXBsZSBpbnB1dDpcbi8vIGNhbmRpZGF0ZTo3MDI3ODYzNTAgMiB1ZHAgNDE4MTk5MDIgOC44LjguOCA2MDc2OSB0eXAgcmVsYXkgcmFkZHIgOC44LjguOFxuLy8gcnBvcnQgNTU5OTZcIlxuU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cztcbiAgLy8gUGFyc2UgYm90aCB2YXJpYW50cy5cbiAgaWYgKGxpbmUuaW5kZXhPZignYT1jYW5kaWRhdGU6JykgPT09IDApIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEyKS5zcGxpdCgnICcpO1xuICB9IGVsc2Uge1xuICAgIHBhcnRzID0gbGluZS5zdWJzdHJpbmcoMTApLnNwbGl0KCcgJyk7XG4gIH1cblxuICB2YXIgY2FuZGlkYXRlID0ge1xuICAgIGZvdW5kYXRpb246IHBhcnRzWzBdLFxuICAgIGNvbXBvbmVudDogcGFydHNbMV0sXG4gICAgcHJvdG9jb2w6IHBhcnRzWzJdLnRvTG93ZXJDYXNlKCksXG4gICAgcHJpb3JpdHk6IHBhcnNlSW50KHBhcnRzWzNdLCAxMCksXG4gICAgaXA6IHBhcnRzWzRdLFxuICAgIHBvcnQ6IHBhcnNlSW50KHBhcnRzWzVdLCAxMCksXG4gICAgLy8gc2tpcCBwYXJ0c1s2XSA9PSAndHlwJ1xuICAgIHR5cGU6IHBhcnRzWzddXG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHN3aXRjaCAocGFydHNbaV0pIHtcbiAgICAgIGNhc2UgJ3JhZGRyJzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jwb3J0JzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRQb3J0ID0gcGFyc2VJbnQocGFydHNbaSArIDFdLCAxMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndGNwdHlwZSc6XG4gICAgICAgIGNhbmRpZGF0ZS50Y3BUeXBlID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vIFVua25vd24gZXh0ZW5zaW9ucyBhcmUgc2lsZW50bHkgaWdub3JlZC5cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBjYW5kaWRhdGU7XG59O1xuXG4vLyBUcmFuc2xhdGVzIGEgY2FuZGlkYXRlIG9iamVjdCBpbnRvIFNEUCBjYW5kaWRhdGUgYXR0cmlidXRlLlxuU0RQVXRpbHMud3JpdGVDYW5kaWRhdGUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgdmFyIHNkcCA9IFtdO1xuICBzZHAucHVzaChjYW5kaWRhdGUuZm91bmRhdGlvbik7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5jb21wb25lbnQpO1xuICBzZHAucHVzaChjYW5kaWRhdGUucHJvdG9jb2wudG9VcHBlckNhc2UoKSk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wcmlvcml0eSk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5pcCk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wb3J0KTtcblxuICB2YXIgdHlwZSA9IGNhbmRpZGF0ZS50eXBlO1xuICBzZHAucHVzaCgndHlwJyk7XG4gIHNkcC5wdXNoKHR5cGUpO1xuICBpZiAodHlwZSAhPT0gJ2hvc3QnICYmIGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyAmJlxuICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRQb3J0KSB7XG4gICAgc2RwLnB1c2goJ3JhZGRyJyk7XG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzKTsgLy8gd2FzOiByZWxBZGRyXG4gICAgc2RwLnB1c2goJ3Jwb3J0Jyk7XG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnJlbGF0ZWRQb3J0KTsgLy8gd2FzOiByZWxQb3J0XG4gIH1cbiAgaWYgKGNhbmRpZGF0ZS50Y3BUeXBlICYmIGNhbmRpZGF0ZS5wcm90b2NvbC50b0xvd2VyQ2FzZSgpID09PSAndGNwJykge1xuICAgIHNkcC5wdXNoKCd0Y3B0eXBlJyk7XG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnRjcFR5cGUpO1xuICB9XG4gIHJldHVybiAnY2FuZGlkYXRlOicgKyBzZHAuam9pbignICcpO1xufTtcblxuLy8gUGFyc2VzIGFuIHJ0cG1hcCBsaW5lLCByZXR1cm5zIFJUQ1J0cENvZGRlY1BhcmFtZXRlcnMuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRwbWFwOjExMSBvcHVzLzQ4MDAwLzJcblNEUFV0aWxzLnBhcnNlUnRwTWFwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cig5KS5zcGxpdCgnICcpO1xuICB2YXIgcGFyc2VkID0ge1xuICAgIHBheWxvYWRUeXBlOiBwYXJzZUludChwYXJ0cy5zaGlmdCgpLCAxMCkgLy8gd2FzOiBpZFxuICB9O1xuXG4gIHBhcnRzID0gcGFydHNbMF0uc3BsaXQoJy8nKTtcblxuICBwYXJzZWQubmFtZSA9IHBhcnRzWzBdO1xuICBwYXJzZWQuY2xvY2tSYXRlID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKTsgLy8gd2FzOiBjbG9ja3JhdGVcbiAgLy8gd2FzOiBjaGFubmVsc1xuICBwYXJzZWQubnVtQ2hhbm5lbHMgPSBwYXJ0cy5sZW5ndGggPT09IDMgPyBwYXJzZUludChwYXJ0c1syXSwgMTApIDogMTtcbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cbi8vIEdlbmVyYXRlIGFuIGE9cnRwbWFwIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3Jcbi8vIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRwTWFwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICByZXR1cm4gJ2E9cnRwbWFwOicgKyBwdCArICcgJyArIGNvZGVjLm5hbWUgKyAnLycgKyBjb2RlYy5jbG9ja1JhdGUgK1xuICAgICAgKGNvZGVjLm51bUNoYW5uZWxzICE9PSAxID8gJy8nICsgY29kZWMubnVtQ2hhbm5lbHMgOiAnJykgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBhPWV4dG1hcCBsaW5lIChoZWFkZXJleHRlbnNpb24gZnJvbSBSRkMgNTI4NSkuIFNhbXBsZSBpbnB1dDpcbi8vIGE9ZXh0bWFwOjIgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxuU0RQVXRpbHMucGFyc2VFeHRtYXAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDkpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgaWQ6IHBhcnNlSW50KHBhcnRzWzBdLCAxMCksXG4gICAgdXJpOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gR2VuZXJhdGVzIGE9ZXh0bWFwIGxpbmUgZnJvbSBSVENSdHBIZWFkZXJFeHRlbnNpb25QYXJhbWV0ZXJzIG9yXG4vLyBSVENSdHBIZWFkZXJFeHRlbnNpb24uXG5TRFBVdGlscy53cml0ZUV4dG1hcCA9IGZ1bmN0aW9uKGhlYWRlckV4dGVuc2lvbikge1xuICByZXR1cm4gJ2E9ZXh0bWFwOicgKyAoaGVhZGVyRXh0ZW5zaW9uLmlkIHx8IGhlYWRlckV4dGVuc2lvbi5wcmVmZXJyZWRJZCkgK1xuICAgICAgICcgJyArIGhlYWRlckV4dGVuc2lvbi51cmkgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBmdG1wIGxpbmUsIHJldHVybnMgZGljdGlvbmFyeS4gU2FtcGxlIGlucHV0OlxuLy8gYT1mbXRwOjk2IHZicj1vbjtjbmc9b25cbi8vIEFsc28gZGVhbHMgd2l0aCB2YnI9b247IGNuZz1vblxuU0RQVXRpbHMucGFyc2VGbXRwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrdjtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnOycpO1xuICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAga3YgPSBwYXJ0c1tqXS50cmltKCkuc3BsaXQoJz0nKTtcbiAgICBwYXJzZWRba3ZbMF0udHJpbSgpXSA9IGt2WzFdO1xuICB9XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZXMgYW4gYT1mdG1wIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVGbXRwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmUgPSAnJztcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICBpZiAoY29kZWMucGFyYW1ldGVycyAmJiBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5sZW5ndGgpIHtcbiAgICB2YXIgcGFyYW1zID0gW107XG4gICAgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykuZm9yRWFjaChmdW5jdGlvbihwYXJhbSkge1xuICAgICAgcGFyYW1zLnB1c2gocGFyYW0gKyAnPScgKyBjb2RlYy5wYXJhbWV0ZXJzW3BhcmFtXSk7XG4gICAgfSk7XG4gICAgbGluZSArPSAnYT1mbXRwOicgKyBwdCArICcgJyArIHBhcmFtcy5qb2luKCc7JykgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gbGluZTtcbn07XG5cbi8vIFBhcnNlcyBhbiBydGNwLWZiIGxpbmUsIHJldHVybnMgUlRDUFJ0Y3BGZWVkYmFjayBvYmplY3QuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRjcC1mYjo5OCBuYWNrIHJwc2lcblNEUFV0aWxzLnBhcnNlUnRjcEZiID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogcGFydHMuc2hpZnQoKSxcbiAgICBwYXJhbWV0ZXI6IHBhcnRzLmpvaW4oJyAnKVxuICB9O1xufTtcbi8vIEdlbmVyYXRlIGE9cnRjcC1mYiBsaW5lcyBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0Y3BGYiA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBsaW5lcyA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5ydGNwRmVlZGJhY2sgJiYgY29kZWMucnRjcEZlZWRiYWNrLmxlbmd0aCkge1xuICAgIC8vIEZJWE1FOiBzcGVjaWFsIGhhbmRsaW5nIGZvciB0cnItaW50P1xuICAgIGNvZGVjLnJ0Y3BGZWVkYmFjay5mb3JFYWNoKGZ1bmN0aW9uKGZiKSB7XG4gICAgICBsaW5lcyArPSAnYT1ydGNwLWZiOicgKyBwdCArICcgJyArIGZiLnR5cGUgKyAnICcgKyBmYi5wYXJhbWV0ZXIgK1xuICAgICAgICAgICdcXHJcXG4nO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBsaW5lcztcbn07XG5cbi8vIFBhcnNlcyBhbiBSRkMgNTU3NiBzc3JjIG1lZGlhIGF0dHJpYnV0ZS4gU2FtcGxlIGlucHV0OlxuLy8gYT1zc3JjOjM3MzU5Mjg1NTkgY25hbWU6c29tZXRoaW5nXG5TRFBVdGlscy5wYXJzZVNzcmNNZWRpYSA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHNwID0gbGluZS5pbmRleE9mKCcgJyk7XG4gIHZhciBwYXJ0cyA9IHtcbiAgICBzc3JjOiBwYXJzZUludChsaW5lLnN1YnN0cig3LCBzcCAtIDcpLCAxMClcbiAgfTtcbiAgdmFyIGNvbG9uID0gbGluZS5pbmRleE9mKCc6Jywgc3ApO1xuICBpZiAoY29sb24gPiAtMSkge1xuICAgIHBhcnRzLmF0dHJpYnV0ZSA9IGxpbmUuc3Vic3RyKHNwICsgMSwgY29sb24gLSBzcCAtIDEpO1xuICAgIHBhcnRzLnZhbHVlID0gbGluZS5zdWJzdHIoY29sb24gKyAxKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEpO1xuICB9XG4gIHJldHVybiBwYXJ0cztcbn07XG5cbi8vIEV4dHJhY3RzIERUTFMgcGFyYW1ldGVycyBmcm9tIFNEUCBtZWRpYSBzZWN0aW9uIG9yIHNlc3Npb25wYXJ0LlxuLy8gRklYTUU6IGZvciBjb25zaXN0ZW5jeSB3aXRoIG90aGVyIGZ1bmN0aW9ucyB0aGlzIHNob3VsZCBvbmx5XG4vLyAgIGdldCB0aGUgZmluZ2VycHJpbnQgbGluZSBhcyBpbnB1dC4gU2VlIGFsc28gZ2V0SWNlUGFyYW1ldGVycy5cblNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cbiAgbGluZXMgPSBsaW5lcy5jb25jYXQoU0RQVXRpbHMuc3BsaXRMaW5lcyhzZXNzaW9ucGFydCkpO1xuICB2YXIgZnBMaW5lID0gbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWZpbmdlcnByaW50OicpID09PSAwO1xuICB9KVswXS5zdWJzdHIoMTQpO1xuICAvLyBOb3RlOiBhPXNldHVwIGxpbmUgaXMgaWdub3JlZCBzaW5jZSB3ZSB1c2UgdGhlICdhdXRvJyByb2xlLlxuICB2YXIgZHRsc1BhcmFtZXRlcnMgPSB7XG4gICAgcm9sZTogJ2F1dG8nLFxuICAgIGZpbmdlcnByaW50czogW3tcbiAgICAgIGFsZ29yaXRobTogZnBMaW5lLnNwbGl0KCcgJylbMF0sXG4gICAgICB2YWx1ZTogZnBMaW5lLnNwbGl0KCcgJylbMV1cbiAgICB9XVxuICB9O1xuICByZXR1cm4gZHRsc1BhcmFtZXRlcnM7XG59O1xuXG4vLyBTZXJpYWxpemVzIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR1cFR5cGUpIHtcbiAgdmFyIHNkcCA9ICdhPXNldHVwOicgKyBzZXR1cFR5cGUgKyAnXFxyXFxuJztcbiAgcGFyYW1zLmZpbmdlcnByaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGZwKSB7XG4gICAgc2RwICs9ICdhPWZpbmdlcnByaW50OicgKyBmcC5hbGdvcml0aG0gKyAnICcgKyBmcC52YWx1ZSArICdcXHJcXG4nO1xuICB9KTtcbiAgcmV0dXJuIHNkcDtcbn07XG4vLyBQYXJzZXMgSUNFIGluZm9ybWF0aW9uIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBpY2UtdWZyYWcgYW5kIGljZS1wd2QgbGluZXMgYXMgaW5wdXQuXG5TRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cbiAgbGluZXMgPSBsaW5lcy5jb25jYXQoU0RQVXRpbHMuc3BsaXRMaW5lcyhzZXNzaW9ucGFydCkpO1xuICB2YXIgaWNlUGFyYW1ldGVycyA9IHtcbiAgICB1c2VybmFtZUZyYWdtZW50OiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtdWZyYWc6JykgPT09IDA7XG4gICAgfSlbMF0uc3Vic3RyKDEyKSxcbiAgICBwYXNzd29yZDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9aWNlLXB3ZDonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTApXG4gIH07XG4gIHJldHVybiBpY2VQYXJhbWV0ZXJzO1xufTtcblxuLy8gU2VyaWFsaXplcyBJQ0UgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgcmV0dXJuICdhPWljZS11ZnJhZzonICsgcGFyYW1zLnVzZXJuYW1lRnJhZ21lbnQgKyAnXFxyXFxuJyArXG4gICAgICAnYT1pY2UtcHdkOicgKyBwYXJhbXMucGFzc3dvcmQgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgUlRDUnRwUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgZGVzY3JpcHRpb24gPSB7XG4gICAgY29kZWNzOiBbXSxcbiAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICBmZWNNZWNoYW5pc21zOiBbXSxcbiAgICBydGNwOiBbXVxuICB9O1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBtbGluZSA9IGxpbmVzWzBdLnNwbGl0KCcgJyk7XG4gIGZvciAodmFyIGkgPSAzOyBpIDwgbWxpbmUubGVuZ3RoOyBpKyspIHsgLy8gZmluZCBhbGwgY29kZWNzIGZyb20gbWxpbmVbMy4uXVxuICAgIHZhciBwdCA9IG1saW5lW2ldO1xuICAgIHZhciBydHBtYXBsaW5lID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRwbWFwOicgKyBwdCArICcgJylbMF07XG4gICAgaWYgKHJ0cG1hcGxpbmUpIHtcbiAgICAgIHZhciBjb2RlYyA9IFNEUFV0aWxzLnBhcnNlUnRwTWFwKHJ0cG1hcGxpbmUpO1xuICAgICAgdmFyIGZtdHBzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1mbXRwOicgKyBwdCArICcgJyk7XG4gICAgICAvLyBPbmx5IHRoZSBmaXJzdCBhPWZtdHA6PHB0PiBpcyBjb25zaWRlcmVkLlxuICAgICAgY29kZWMucGFyYW1ldGVycyA9IGZtdHBzLmxlbmd0aCA/IFNEUFV0aWxzLnBhcnNlRm10cChmbXRwc1swXSkgOiB7fTtcbiAgICAgIGNvZGVjLnJ0Y3BGZWVkYmFjayA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1mYjonICsgcHQgKyAnICcpXG4gICAgICAgIC5tYXAoU0RQVXRpbHMucGFyc2VSdGNwRmIpO1xuICAgICAgZGVzY3JpcHRpb24uY29kZWNzLnB1c2goY29kZWMpO1xuICAgICAgLy8gcGFyc2UgRkVDIG1lY2hhbmlzbXMgZnJvbSBydHBtYXAgbGluZXMuXG4gICAgICBzd2l0Y2ggKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICBjYXNlICdSRUQnOlxuICAgICAgICBjYXNlICdVTFBGRUMnOlxuICAgICAgICAgIGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMucHVzaChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiAvLyBvbmx5IFJFRCBhbmQgVUxQRkVDIGFyZSByZWNvZ25pemVkIGFzIEZFQyBtZWNoYW5pc21zLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWV4dG1hcDonKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBkZXNjcmlwdGlvbi5oZWFkZXJFeHRlbnNpb25zLnB1c2goU0RQVXRpbHMucGFyc2VFeHRtYXAobGluZSkpO1xuICB9KTtcbiAgLy8gRklYTUU6IHBhcnNlIHJ0Y3AuXG4gIHJldHVybiBkZXNjcmlwdGlvbjtcbn07XG5cbi8vIEdlbmVyYXRlcyBwYXJ0cyBvZiB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gZGVzY3JpYmluZyB0aGUgY2FwYWJpbGl0aWVzIC9cbi8vIHBhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uID0gZnVuY3Rpb24oa2luZCwgY2Fwcykge1xuICB2YXIgc2RwID0gJyc7XG5cbiAgLy8gQnVpbGQgdGhlIG1saW5lLlxuICBzZHAgKz0gJ209JyArIGtpbmQgKyAnICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5sZW5ndGggPiAwID8gJzknIDogJzAnOyAvLyByZWplY3QgaWYgbm8gY29kZWNzLlxuICBzZHAgKz0gJyBVRFAvVExTL1JUUC9TQVZQRiAnO1xuICBzZHAgKz0gY2Fwcy5jb2RlY3MubWFwKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVjLnBheWxvYWRUeXBlO1xuICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcblxuICBzZHAgKz0gJ2M9SU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuICBzZHAgKz0gJ2E9cnRjcDo5IElOIElQNCAwLjAuMC4wXFxyXFxuJztcblxuICAvLyBBZGQgYT1ydHBtYXAgbGluZXMgZm9yIGVhY2ggY29kZWMuIEFsc28gZm10cCBhbmQgcnRjcC1mYi5cbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZVJ0cE1hcChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRm10cChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRjcEZiKGNvZGVjKTtcbiAgfSk7XG4gIC8vIEZJWE1FOiBhZGQgaGVhZGVyRXh0ZW5zaW9ucywgZmVjTWVjaGFuaXNtxZ8gYW5kIHJ0Y3AuXG4gIHNkcCArPSAnYT1ydGNwLW11eFxcclxcbic7XG4gIHJldHVybiBzZHA7XG59O1xuXG4vLyBQYXJzZXMgdGhlIFNEUCBtZWRpYSBzZWN0aW9uIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mXG4vLyBSVENSdHBFbmNvZGluZ1BhcmFtZXRlcnMuXG5TRFBVdGlscy5wYXJzZVJ0cEVuY29kaW5nUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgZW5jb2RpbmdQYXJhbWV0ZXJzID0gW107XG4gIHZhciBkZXNjcmlwdGlvbiA9IFNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuICB2YXIgaGFzUmVkID0gZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5pbmRleE9mKCdSRUQnKSAhPT0gLTE7XG4gIHZhciBoYXNVbHBmZWMgPSBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLmluZGV4T2YoJ1VMUEZFQycpICE9PSAtMTtcblxuICAvLyBmaWx0ZXIgYT1zc3JjOi4uLiBjbmFtZTosIGlnbm9yZSBQbGFuQi1tc2lkXG4gIHZhciBzc3JjcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gIH0pXG4gIC5maWx0ZXIoZnVuY3Rpb24ocGFydHMpIHtcbiAgICByZXR1cm4gcGFydHMuYXR0cmlidXRlID09PSAnY25hbWUnO1xuICB9KTtcbiAgdmFyIHByaW1hcnlTc3JjID0gc3NyY3MubGVuZ3RoID4gMCAmJiBzc3Jjc1swXS5zc3JjO1xuICB2YXIgc2Vjb25kYXJ5U3NyYztcblxuICB2YXIgZmxvd3MgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmMtZ3JvdXA6RklEJylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnICcpO1xuICAgIHBhcnRzLnNoaWZ0KCk7XG4gICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocGFydCwgMTApO1xuICAgIH0pO1xuICB9KTtcbiAgaWYgKGZsb3dzLmxlbmd0aCA+IDAgJiYgZmxvd3NbMF0ubGVuZ3RoID4gMSAmJiBmbG93c1swXVswXSA9PT0gcHJpbWFyeVNzcmMpIHtcbiAgICBzZWNvbmRhcnlTc3JjID0gZmxvd3NbMF1bMV07XG4gIH1cblxuICBkZXNjcmlwdGlvbi5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIGlmIChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdSVFgnICYmIGNvZGVjLnBhcmFtZXRlcnMuYXB0KSB7XG4gICAgICB2YXIgZW5jUGFyYW0gPSB7XG4gICAgICAgIHNzcmM6IHByaW1hcnlTc3JjLFxuICAgICAgICBjb2RlY1BheWxvYWRUeXBlOiBwYXJzZUludChjb2RlYy5wYXJhbWV0ZXJzLmFwdCwgMTApLFxuICAgICAgICBydHg6IHtcbiAgICAgICAgICBzc3JjOiBzZWNvbmRhcnlTc3JjXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaChlbmNQYXJhbSk7XG4gICAgICBpZiAoaGFzUmVkKSB7XG4gICAgICAgIGVuY1BhcmFtID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShlbmNQYXJhbSkpO1xuICAgICAgICBlbmNQYXJhbS5mZWMgPSB7XG4gICAgICAgICAgc3NyYzogc2Vjb25kYXJ5U3NyYyxcbiAgICAgICAgICBtZWNoYW5pc206IGhhc1VscGZlYyA/ICdyZWQrdWxwZmVjJyA6ICdyZWQnXG4gICAgICAgIH07XG4gICAgICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKGVuY1BhcmFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAoZW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMCAmJiBwcmltYXJ5U3NyYykge1xuICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKHtcbiAgICAgIHNzcmM6IHByaW1hcnlTc3JjXG4gICAgfSk7XG4gIH1cblxuICAvLyB3ZSBzdXBwb3J0IGJvdGggYj1BUyBhbmQgYj1USUFTIGJ1dCBpbnRlcnByZXQgQVMgYXMgVElBUy5cbiAgdmFyIGJhbmR3aWR0aCA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2I9Jyk7XG4gIGlmIChiYW5kd2lkdGgubGVuZ3RoKSB7XG4gICAgaWYgKGJhbmR3aWR0aFswXS5pbmRleE9mKCdiPVRJQVM6JykgPT09IDApIHtcbiAgICAgIGJhbmR3aWR0aCA9IHBhcnNlSW50KGJhbmR3aWR0aFswXS5zdWJzdHIoNyksIDEwKTtcbiAgICB9IGVsc2UgaWYgKGJhbmR3aWR0aFswXS5pbmRleE9mKCdiPUFTOicpID09PSAwKSB7XG4gICAgICBiYW5kd2lkdGggPSBwYXJzZUludChiYW5kd2lkdGhbMF0uc3Vic3RyKDUpLCAxMCk7XG4gICAgfVxuICAgIGVuY29kaW5nUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgcGFyYW1zLm1heEJpdHJhdGUgPSBiYW5kd2lkdGg7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGVuY29kaW5nUGFyYW1ldGVycztcbn07XG5cblNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIEZJWE1FOiBzZXNzLWlkIHNob3VsZCBiZSBhbiBOVFAgdGltZXN0YW1wLlxuICByZXR1cm4gJ3Y9MFxcclxcbicgK1xuICAgICAgJ289dGhpc2lzYWRhcHRlcm9ydGMgODE2OTYzOTkxNTY0Njk0MzEzNyAyIElOIElQNCAxMjcuMC4wLjFcXHJcXG4nICtcbiAgICAgICdzPS1cXHJcXG4nICtcbiAgICAgICd0PTAgMFxcclxcbic7XG59O1xuXG5TRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbiA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLCBjYXBzLCB0eXBlLCBzdHJlYW0pIHtcbiAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24odHJhbnNjZWl2ZXIua2luZCwgY2Fwcyk7XG5cbiAgLy8gTWFwIElDRSBwYXJhbWV0ZXJzICh1ZnJhZywgcHdkKSB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMoXG4gICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5nZXRMb2NhbFBhcmFtZXRlcnMoKSk7XG5cbiAgLy8gTWFwIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5nZXRMb2NhbFBhcmFtZXRlcnMoKSxcbiAgICAgIHR5cGUgPT09ICdvZmZlcicgPyAnYWN0cGFzcycgOiAnYWN0aXZlJyk7XG5cbiAgc2RwICs9ICdhPW1pZDonICsgdHJhbnNjZWl2ZXIubWlkICsgJ1xcclxcbic7XG5cbiAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlciAmJiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgIHNkcCArPSAnYT1zZW5kcmVjdlxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgc2RwICs9ICdhPXNlbmRvbmx5XFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgIHNkcCArPSAnYT1yZWN2b25seVxcclxcbic7XG4gIH0gZWxzZSB7XG4gICAgc2RwICs9ICdhPWluYWN0aXZlXFxyXFxuJztcbiAgfVxuXG4gIC8vIEZJWE1FOiBmb3IgUlRYIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlIFNTUkNzLiBOb3QgaW1wbGVtZW50ZWQgaW4gRWRnZSB5ZXQuXG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICB2YXIgbXNpZCA9ICdtc2lkOicgKyBzdHJlYW0uaWQgKyAnICcgK1xuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIudHJhY2suaWQgKyAnXFxyXFxuJztcbiAgICBzZHAgKz0gJ2E9JyArIG1zaWQ7XG4gICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAgICcgJyArIG1zaWQ7XG4gIH1cbiAgLy8gRklYTUU6IHRoaXMgc2hvdWxkIGJlIHdyaXR0ZW4gYnkgd3JpdGVSdHBEZXNjcmlwdGlvbi5cbiAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XG4gIHJldHVybiBzZHA7XG59O1xuXG4vLyBHZXRzIHRoZSBkaXJlY3Rpb24gZnJvbSB0aGUgbWVkaWFTZWN0aW9uIG9yIHRoZSBzZXNzaW9ucGFydC5cblNEUFV0aWxzLmdldERpcmVjdGlvbiA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgLy8gTG9vayBmb3Igc2VuZHJlY3YsIHNlbmRvbmx5LCByZWN2b25seSwgaW5hY3RpdmUsIGRlZmF1bHQgdG8gc2VuZHJlY3YuXG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAobGluZXNbaV0pIHtcbiAgICAgIGNhc2UgJ2E9c2VuZHJlY3YnOlxuICAgICAgY2FzZSAnYT1zZW5kb25seSc6XG4gICAgICBjYXNlICdhPXJlY3Zvbmx5JzpcbiAgICAgIGNhc2UgJ2E9aW5hY3RpdmUnOlxuICAgICAgICByZXR1cm4gbGluZXNbaV0uc3Vic3RyKDIpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gRklYTUU6IFdoYXQgc2hvdWxkIGhhcHBlbiBoZXJlP1xuICAgIH1cbiAgfVxuICBpZiAoc2Vzc2lvbnBhcnQpIHtcbiAgICByZXR1cm4gU0RQVXRpbHMuZ2V0RGlyZWN0aW9uKHNlc3Npb25wYXJ0KTtcbiAgfVxuICByZXR1cm4gJ3NlbmRyZWN2Jztcbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gU0RQVXRpbHM7XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNEUFV0aWxzID0gcmVxdWlyZSgnLi9lZGdlX3NkcCcpO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscycpLmxvZztcblxudmFyIGVkZ2VTaGltID0ge1xuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh3aW5kb3cuUlRDSWNlR2F0aGVyZXIpIHtcbiAgICAgIC8vIE9SVEMgZGVmaW5lcyBhbiBSVENJY2VDYW5kaWRhdGUgb2JqZWN0IGJ1dCBubyBjb25zdHJ1Y3Rvci5cbiAgICAgIC8vIE5vdCBpbXBsZW1lbnRlZCBpbiBFZGdlLlxuICAgICAgaWYgKCF3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlKSB7XG4gICAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBPUlRDIGRvZXMgbm90IGhhdmUgYSBzZXNzaW9uIGRlc2NyaXB0aW9uIG9iamVjdCBidXRcbiAgICAgIC8vIG90aGVyIGJyb3dzZXJzIChpLmUuIENocm9tZSkgdGhhdCB3aWxsIHN1cHBvcnQgYm90aCBQQyBhbmQgT1JUQ1xuICAgICAgLy8gaW4gdGhlIGZ1dHVyZSBtaWdodCBoYXZlIHRoaXMgZGVmaW5lZCBhbHJlYWR5LlxuICAgICAgaWYgKCF3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKSB7XG4gICAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBfZXZlbnRUYXJnZXQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBbJ2FkZEV2ZW50TGlzdGVuZXInLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdkaXNwYXRjaEV2ZW50J11cbiAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIHNlbGZbbWV0aG9kXSA9IF9ldmVudFRhcmdldFttZXRob2RdLmJpbmQoX2V2ZW50VGFyZ2V0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgdGhpcy5vbmljZWNhbmRpZGF0ZSA9IG51bGw7XG4gICAgICB0aGlzLm9uYWRkc3RyZWFtID0gbnVsbDtcbiAgICAgIHRoaXMub250cmFjayA9IG51bGw7XG4gICAgICB0aGlzLm9ucmVtb3Zlc3RyZWFtID0gbnVsbDtcbiAgICAgIHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZCA9IG51bGw7XG4gICAgICB0aGlzLm9uZGF0YWNoYW5uZWwgPSBudWxsO1xuXG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcyA9IFtdO1xuICAgICAgdGhpcy5yZW1vdGVTdHJlYW1zID0gW107XG4gICAgICB0aGlzLmdldExvY2FsU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5sb2NhbFN0cmVhbXM7XG4gICAgICB9O1xuICAgICAgdGhpcy5nZXRSZW1vdGVTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnJlbW90ZVN0cmVhbXM7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvY2FsRGVzY3JpcHRpb24gPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHNkcDogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbiA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgc2RwOiAnJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gJ3N0YWJsZSc7XG4gICAgICB0aGlzLmljZUNvbm5lY3Rpb25TdGF0ZSA9ICduZXcnO1xuICAgICAgdGhpcy5pY2VHYXRoZXJpbmdTdGF0ZSA9ICduZXcnO1xuXG4gICAgICB0aGlzLmljZU9wdGlvbnMgPSB7XG4gICAgICAgIGdhdGhlclBvbGljeTogJ2FsbCcsXG4gICAgICAgIGljZVNlcnZlcnM6IFtdXG4gICAgICB9O1xuICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgIHN3aXRjaCAoY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICAgIGNhc2UgJ2FsbCc6XG4gICAgICAgICAgY2FzZSAncmVsYXknOlxuICAgICAgICAgICAgdGhpcy5pY2VPcHRpb25zLmdhdGhlclBvbGljeSA9IGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3k7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW1vdmUgb25jZSBpbXBsZW1lbnRhdGlvbiBhbmQgc3BlYyBoYXZlIGFkZGVkIHRoaXMuXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpY2VUcmFuc3BvcnRQb2xpY3kgXCJub25lXCIgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBkb24ndCBzZXQgaWNlVHJhbnNwb3J0UG9saWN5LlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgLy8gRWRnZSBkb2VzIG5vdCBsaWtlXG4gICAgICAgIC8vIDEpIHN0dW46XG4gICAgICAgIC8vIDIpIHR1cm46IHRoYXQgZG9lcyBub3QgaGF2ZSBhbGwgb2YgdHVybjpob3N0OnBvcnQ/dHJhbnNwb3J0PXVkcFxuICAgICAgICB0aGlzLmljZU9wdGlvbnMuaWNlU2VydmVycyA9IGNvbmZpZy5pY2VTZXJ2ZXJzLmZpbHRlcihmdW5jdGlvbihzZXJ2ZXIpIHtcbiAgICAgICAgICBpZiAoc2VydmVyICYmIHNlcnZlci51cmxzKSB7XG4gICAgICAgICAgICBzZXJ2ZXIudXJscyA9IHNlcnZlci51cmxzLmZpbHRlcihmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVybC5pbmRleE9mKCd0dXJuOicpID09PSAwICYmXG4gICAgICAgICAgICAgICAgICB1cmwuaW5kZXhPZigndHJhbnNwb3J0PXVkcCcpICE9PSAtMTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgcmV0dXJuICEhc2VydmVyLnVybHM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBlci10cmFjayBpY2VHYXRoZXJzLCBpY2VUcmFuc3BvcnRzLCBkdGxzVHJhbnNwb3J0cywgcnRwU2VuZGVycywgLi4uXG4gICAgICAvLyBldmVyeXRoaW5nIHRoYXQgaXMgbmVlZGVkIHRvIGRlc2NyaWJlIGEgU0RQIG0tbGluZS5cbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzID0gW107XG5cbiAgICAgIC8vIHNpbmNlIHRoZSBpY2VHYXRoZXJlciBpcyBjdXJyZW50bHkgY3JlYXRlZCBpbiBjcmVhdGVPZmZlciBidXQgd2VcbiAgICAgIC8vIG11c3Qgbm90IGVtaXQgY2FuZGlkYXRlcyB1bnRpbCBhZnRlciBzZXRMb2NhbERlc2NyaXB0aW9uIHdlIGJ1ZmZlclxuICAgICAgLy8gdGhlbSBpbiB0aGlzIGFycmF5LlxuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAvLyBGSVhNRTogbmVlZCB0byBhcHBseSBpY2UgY2FuZGlkYXRlcyBpbiBhIHdheSB3aGljaCBpcyBhc3luYyBidXRcbiAgICAgIC8vIGluLW9yZGVyXG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZW5kID0gIWV2ZW50LmNhbmRpZGF0ZSB8fCBPYmplY3Qua2V5cyhldmVudC5jYW5kaWRhdGUpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgc2VjdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChzZWN0aW9uc1tqXS5pbmRleE9mKCdcXHJcXG5hPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHNlY3Rpb25zW2pdICs9ICdhPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZS5pbmRleE9mKCd0eXAgZW5kT2ZDYW5kaWRhdGVzJylcbiAgICAgICAgICAgID09PSAtMSkge1xuICAgICAgICAgIHNlY3Rpb25zW2V2ZW50LmNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICsgMV0gKz1cbiAgICAgICAgICAgICAgJ2E9JyArIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgKyAnXFxyXFxuJztcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwID0gc2VjdGlvbnMuam9pbignJyk7XG4gICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFldmVudC5jYW5kaWRhdGUgJiYgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIHZhciBjb21wbGV0ZSA9IHNlbGYudHJhbnNjZWl2ZXJzLmV2ZXJ5KGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAvLyBDbG9uZSBpcyBuZWNlc3NhcnkgZm9yIGxvY2FsIGRlbW9zIG1vc3RseSwgYXR0YWNoaW5nIGRpcmVjdGx5XG4gICAgICAvLyB0byB0d28gZGlmZmVyZW50IHNlbmRlcnMgZG9lcyBub3Qgd29yayAoYnVpbGQgMTA1NDcpLlxuICAgICAgdGhpcy5sb2NhbFN0cmVhbXMucHVzaChzdHJlYW0uY2xvbmUoKSk7XG4gICAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgdmFyIGlkeCA9IHRoaXMubG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKTtcbiAgICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgICB0aGlzLmxvY2FsU3RyZWFtcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgdGhpcy5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lcyB0aGUgaW50ZXJzZWN0aW9uIG9mIGxvY2FsIGFuZCByZW1vdGUgY2FwYWJpbGl0aWVzLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2dldENvbW1vbkNhcGFiaWxpdGllcyA9XG4gICAgICAgIGZ1bmN0aW9uKGxvY2FsQ2FwYWJpbGl0aWVzLCByZW1vdGVDYXBhYmlsaXRpZXMpIHtcbiAgICAgICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0ge1xuICAgICAgICAgICAgY29kZWNzOiBbXSxcbiAgICAgICAgICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxuICAgICAgICAgICAgZmVjTWVjaGFuaXNtczogW11cbiAgICAgICAgICB9O1xuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGxDb2RlYykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciByQ29kZWMgPSByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzW2ldO1xuICAgICAgICAgICAgICBpZiAobENvZGVjLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gckNvZGVjLm5hbWUudG9Mb3dlckNhc2UoKSAmJlxuICAgICAgICAgICAgICAgICAgbENvZGVjLmNsb2NrUmF0ZSA9PT0gckNvZGVjLmNsb2NrUmF0ZSAmJlxuICAgICAgICAgICAgICAgICAgbENvZGVjLm51bUNoYW5uZWxzID09PSByQ29kZWMubnVtQ2hhbm5lbHMpIHtcbiAgICAgICAgICAgICAgICAvLyBwdXNoIHJDb2RlYyBzbyB3ZSByZXBseSB3aXRoIG9mZmVyZXIgcGF5bG9hZCB0eXBlXG4gICAgICAgICAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmNvZGVjcy5wdXNoKHJDb2RlYyk7XG5cbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWxzbyBuZWVkIHRvIGRldGVybWluZSBpbnRlcnNlY3Rpb24gYmV0d2VlblxuICAgICAgICAgICAgICAgIC8vIC5ydGNwRmVlZGJhY2sgYW5kIC5wYXJhbWV0ZXJzXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obEhlYWRlckV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3RlQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgaSsrKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgckhlYWRlckV4dGVuc2lvbiA9IHJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgaWYgKGxIZWFkZXJFeHRlbnNpb24udXJpID09PSBySGVhZGVyRXh0ZW5zaW9uLnVyaSkge1xuICAgICAgICAgICAgICAgICAgICBjb21tb25DYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5wdXNoKHJIZWFkZXJFeHRlbnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gRklYTUU6IGZlY01lY2hhbmlzbXNcbiAgICAgICAgICByZXR1cm4gY29tbW9uQ2FwYWJpbGl0aWVzO1xuICAgICAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIElDRSBnYXRoZXJlciwgSUNFIHRyYW5zcG9ydCBhbmQgRFRMUyB0cmFuc3BvcnQuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMgPVxuICAgICAgICBmdW5jdGlvbihtaWQsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIGljZUdhdGhlcmVyID0gbmV3IFJUQ0ljZUdhdGhlcmVyKHNlbGYuaWNlT3B0aW9ucyk7XG4gICAgICAgICAgdmFyIGljZVRyYW5zcG9ydCA9IG5ldyBSVENJY2VUcmFuc3BvcnQoaWNlR2F0aGVyZXIpO1xuICAgICAgICAgIGljZUdhdGhlcmVyLm9ubG9jYWxjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJyk7XG4gICAgICAgICAgICBldmVudC5jYW5kaWRhdGUgPSB7c2RwTWlkOiBtaWQsIHNkcE1MaW5lSW5kZXg6IHNkcE1MaW5lSW5kZXh9O1xuXG4gICAgICAgICAgICB2YXIgY2FuZCA9IGV2dC5jYW5kaWRhdGU7XG4gICAgICAgICAgICB2YXIgZW5kID0gIWNhbmQgfHwgT2JqZWN0LmtleXMoY2FuZCkubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgLy8gRWRnZSBlbWl0cyBhbiBlbXB0eSBvYmplY3QgZm9yIFJUQ0ljZUNhbmRpZGF0ZUNvbXBsZXRl4oClXG4gICAgICAgICAgICBpZiAoZW5kKSB7XG4gICAgICAgICAgICAgIC8vIHBvbHlmaWxsIHNpbmNlIFJUQ0ljZUdhdGhlcmVyLnN0YXRlIGlzIG5vdCBpbXBsZW1lbnRlZCBpblxuICAgICAgICAgICAgICAvLyBFZGdlIDEwNTQ3IHlldC5cbiAgICAgICAgICAgICAgaWYgKGljZUdhdGhlcmVyLnN0YXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpY2VHYXRoZXJlci5zdGF0ZSA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gRW1pdCBhIGNhbmRpZGF0ZSB3aXRoIHR5cGUgZW5kT2ZDYW5kaWRhdGVzIHRvIG1ha2UgdGhlIHNhbXBsZXNcbiAgICAgICAgICAgICAgLy8gd29yay4gRWRnZSByZXF1aXJlcyBhZGRJY2VDYW5kaWRhdGUgd2l0aCB0aGlzIGVtcHR5IGNhbmRpZGF0ZVxuICAgICAgICAgICAgICAvLyB0byBzdGFydCBjaGVja2luZy4gVGhlIHJlYWwgc29sdXRpb24gaXMgdG8gc2lnbmFsXG4gICAgICAgICAgICAgIC8vIGVuZC1vZi1jYW5kaWRhdGVzIHRvIHRoZSBvdGhlciBzaWRlIHdoZW4gZ2V0dGluZyB0aGUgbnVsbFxuICAgICAgICAgICAgICAvLyBjYW5kaWRhdGUgYnV0IHNvbWUgYXBwcyAobGlrZSB0aGUgc2FtcGxlcykgZG9uJ3QgZG8gdGhhdC5cbiAgICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSA9XG4gICAgICAgICAgICAgICAgICAnY2FuZGlkYXRlOjEgMSB1ZHAgMSAwLjAuMC4wIDkgdHlwIGVuZE9mQ2FuZGlkYXRlcyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBSVENJY2VDYW5kaWRhdGUgZG9lc24ndCBoYXZlIGEgY29tcG9uZW50LCBuZWVkcyB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICBjYW5kLmNvbXBvbmVudCA9IGljZVRyYW5zcG9ydC5jb21wb25lbnQgPT09ICdSVENQJyA/IDIgOiAxO1xuICAgICAgICAgICAgICBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlID0gU0RQVXRpbHMud3JpdGVDYW5kaWRhdGUoY2FuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21wbGV0ZSA9IHNlbGYudHJhbnNjZWl2ZXJzLmV2ZXJ5KGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5pY2VHYXRoZXJlciAmJlxuICAgICAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEVtaXQgY2FuZGlkYXRlIGlmIGxvY2FsRGVzY3JpcHRpb24gaXMgc2V0LlxuICAgICAgICAgICAgLy8gQWxzbyBlbWl0cyBudWxsIGNhbmRpZGF0ZSB3aGVuIGFsbCBnYXRoZXJlcnMgYXJlIGNvbXBsZXRlLlxuICAgICAgICAgICAgc3dpdGNoIChzZWxmLmljZUdhdGhlcmluZ1N0YXRlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ25ldyc6XG4gICAgICAgICAgICAgICAgc2VsZi5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChlbmQgJiYgY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnZ2F0aGVyaW5nJzpcbiAgICAgICAgICAgICAgICBzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnY29tcGxldGUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnY29tcGxldGUnOlxuICAgICAgICAgICAgICAgIC8vIHNob3VsZCBub3QgaGFwcGVuLi4uIGN1cnJlbnRseSFcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDogLy8gbm8tb3AuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpY2VUcmFuc3BvcnQub25pY2VzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gbmV3IFJUQ0R0bHNUcmFuc3BvcnQoaWNlVHJhbnNwb3J0KTtcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0Lm9uZHRsc3N0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGR0bHNUcmFuc3BvcnQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb25lcnJvciBkb2VzIG5vdCBzZXQgc3RhdGUgdG8gZmFpbGVkIGJ5IGl0c2VsZi5cbiAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhdGUgPSAnZmFpbGVkJztcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWNlR2F0aGVyZXI6IGljZUdhdGhlcmVyLFxuICAgICAgICAgICAgaWNlVHJhbnNwb3J0OiBpY2VUcmFuc3BvcnQsXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiBkdGxzVHJhbnNwb3J0XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgIC8vIFN0YXJ0IHRoZSBSVFAgU2VuZGVyIGFuZCBSZWNlaXZlciBmb3IgYSB0cmFuc2NlaXZlci5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl90cmFuc2NlaXZlID0gZnVuY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICAgIHNlbmQsIHJlY3YpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB0aGlzLl9nZXRDb21tb25DYXBhYmlsaXRpZXModHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzKTtcbiAgICAgIGlmIChzZW5kICYmIHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgICAgICBwYXJhbXMuZW5jb2RpbmdzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgcGFyYW1zLnJ0Y3AgPSB7XG4gICAgICAgICAgY25hbWU6IFNEUFV0aWxzLmxvY2FsQ05hbWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc2VuZChwYXJhbXMpO1xuICAgICAgfVxuICAgICAgaWYgKHJlY3YgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiB0cmFuc2NlaXZlci5jbmFtZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbXMucnRjcC5zc3JjID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnJlY2VpdmUocGFyYW1zKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID1cbiAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydDtcbiAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xuICAgICAgICAgICAgLy8gRklYTUU6IFdoYXQgd2FzIHRoZSBwdXJwb3NlIG9mIHRoaXMgZW1wdHkgaWYgc3RhdGVtZW50P1xuICAgICAgICAgICAgLy8gaWYgKCF0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgICAgICAgIC8vIFZFUlkgbGltaXRlZCBzdXBwb3J0IGZvciBTRFAgbXVuZ2luZy4gTGltaXRlZCB0bzpcbiAgICAgICAgICAgICAgLy8gKiBjaGFuZ2luZyB0aGUgb3JkZXIgb2YgY29kZWNzXG4gICAgICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhcHMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9wZW5kaW5nT2ZmZXJbc2RwTUxpbmVJbmRleF0ubG9jYWxDYXBhYmlsaXRpZXMgPSBjYXBzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy50cmFuc2NlaXZlcnMgPSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJykge1xuICAgICAgICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYucmVtb3RlRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcbiAgICAgICAgICAgICAgdmFyIGljZVRyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgdmFyIHJlbW90ZUNhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWVkaWFTZWN0aW9uLnNwbGl0KCdcXG4nLCAxKVswXVxuICAgICAgICAgICAgICAgICAgLnNwbGl0KCcgJywgMilbMV0gPT09ICcwJztcblxuICAgICAgICAgICAgICBpZiAoIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUljZVBhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzKFxuICAgICAgICAgICAgICAgICAgICBtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc3RhcnQoaWNlR2F0aGVyZXIsIHJlbW90ZUljZVBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICdjb250cm9sbGVkJyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyhcbiAgICAgICAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJzZWN0aW9uIG9mIGNhcGFiaWxpdGllcy5cbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gc2VsZi5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIFJUQ1J0cFNlbmRlci4gVGhlIFJUQ1J0cFJlY2VpdmVyIGZvciB0aGlzXG4gICAgICAgICAgICAgICAgLy8gdHJhbnNjZWl2ZXIgaGFzIGFscmVhZHkgYmVlbiBzdGFydGVkIGluIHNldFJlbW90ZURlc2NyaXB0aW9uLlxuICAgICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jb2RlY3MubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmxvY2FsRGVzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgICAgICAgc2RwOiBkZXNjcmlwdGlvbi5zZHBcbiAgICAgICAgICB9O1xuICAgICAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnb2ZmZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnaGF2ZS1sb2NhbC1vZmZlcicpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdzdGFibGUnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICAgICAgICAgJ1wiJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgYSBzdWNjZXNzIGNhbGxiYWNrIHdhcyBwcm92aWRlZCwgZW1pdCBJQ0UgY2FuZGlkYXRlcyBhZnRlciBpdFxuICAgICAgICAgIC8vIGhhcyBiZWVuIGV4ZWN1dGVkLiBPdGhlcndpc2UsIGVtaXQgY2FsbGJhY2sgYWZ0ZXIgdGhlIFByb21pc2UgaXNcbiAgICAgICAgICAvLyByZXNvbHZlZC5cbiAgICAgICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICAgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYiA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICBpZiAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9PT0gJ25ldycpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBwID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgcC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFoYXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9PT0gJ25ldycpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gVXN1YWxseSBjYW5kaWRhdGVzIHdpbGwgYmUgZW1pdHRlZCBlYXJsaWVyLlxuICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzLmJpbmQoc2VsZiksIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uID1cbiAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIHN0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICAgIHZhciByZWNlaXZlckxpc3QgPSBbXTtcbiAgICAgICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKGRlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgdmFyIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgdmFyIG1saW5lID0gbGluZXNbMF0uc3Vic3RyKDIpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB2YXIga2luZCA9IG1saW5lWzBdO1xuICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWxpbmVbMV0gPT09ICcwJztcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBTRFBVdGlscy5nZXREaXJlY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2NlaXZlcjtcbiAgICAgICAgICAgIHZhciBpY2VHYXRoZXJlcjtcbiAgICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgIHZhciBydHBTZW5kZXI7XG4gICAgICAgICAgICB2YXIgcnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzO1xuXG4gICAgICAgICAgICB2YXIgdHJhY2s7XG4gICAgICAgICAgICAvLyBGSVhNRTogZW5zdXJlIHRoZSBtZWRpYVNlY3Rpb24gaGFzIHJ0Y3AtbXV4IHNldC5cbiAgICAgICAgICAgIHZhciByZW1vdGVDYXBhYmlsaXRpZXMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgaWYgKCFyZWplY3RlZCkge1xuICAgICAgICAgICAgICByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgICAgICAgU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcblxuICAgICAgICAgICAgdmFyIG1pZCA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9bWlkOicpO1xuICAgICAgICAgICAgaWYgKG1pZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgbWlkID0gbWlkWzBdLnN1YnN0cig2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1pZCA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY25hbWU7XG4gICAgICAgICAgICAvLyBHZXRzIHRoZSBmaXJzdCBTU1JDLiBOb3RlIHRoYXQgd2l0aCBSVFggdGhlcmUgbWlnaHQgYmUgbXVsdGlwbGVcbiAgICAgICAgICAgIC8vIFNTUkNzLlxuICAgICAgICAgICAgdmFyIHJlbW90ZVNzcmMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgICAgICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChyZW1vdGVTc3JjKSB7XG4gICAgICAgICAgICAgIGNuYW1lID0gcmVtb3RlU3NyYy52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgJ2E9ZW5kLW9mLWNhbmRpZGF0ZXMnKS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgdmFyIGNhbmRzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1jYW5kaWRhdGU6JylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbmQuY29tcG9uZW50ID09PSAnMSc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJyAmJiAhcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSBzZWxmLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyhtaWQsXG4gICAgICAgICAgICAgICAgICBzZHBNTGluZUluZGV4KTtcbiAgICAgICAgICAgICAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzID0gUlRDUnRwUmVjZWl2ZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xuICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gW3tcbiAgICAgICAgICAgICAgICBzc3JjOiAoMiAqIHNkcE1MaW5lSW5kZXggKyAyKSAqIDEwMDFcbiAgICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgICAgcnRwUmVjZWl2ZXIgPSBuZXcgUlRDUnRwUmVjZWl2ZXIodHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LCBraW5kKTtcblxuICAgICAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xuICAgICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyXSk7XG4gICAgICAgICAgICAgIC8vIEZJWE1FOiBub3QgY29ycmVjdCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBzdHJlYW1zIGJ1dCB0aGF0IGlzXG4gICAgICAgICAgICAgIC8vIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkIGluIHRoaXMgc2hpbS5cbiAgICAgICAgICAgICAgc3RyZWFtLmFkZFRyYWNrKHRyYWNrKTtcblxuICAgICAgICAgICAgICAvLyBGSVhNRTogbG9vayBhdCBkaXJlY3Rpb24uXG4gICAgICAgICAgICAgIGlmIChzZWxmLmxvY2FsU3RyZWFtcy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICBzZWxmLmxvY2FsU3RyZWFtc1swXS5nZXRUcmFja3MoKS5sZW5ndGggPj0gc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBhY3R1YWxseSBtb3JlIGNvbXBsaWNhdGVkLCBuZWVkcyB0byBtYXRjaCB0eXBlcyBldGNcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWx0cmFjayA9IHNlbGYubG9jYWxTdHJlYW1zWzBdXG4gICAgICAgICAgICAgICAgICAgIC5nZXRUcmFja3MoKVtzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgICBydHBTZW5kZXIgPSBuZXcgUlRDUnRwU2VuZGVyKGxvY2FsdHJhY2ssXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNwb3J0cy5pY2VHYXRoZXJlcixcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllczogbG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiByZW1vdGVDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgICAgcnRwU2VuZGVyOiBydHBTZW5kZXIsXG4gICAgICAgICAgICAgICAgcnRwUmVjZWl2ZXI6IHJ0cFJlY2VpdmVyLFxuICAgICAgICAgICAgICAgIGtpbmQ6IGtpbmQsXG4gICAgICAgICAgICAgICAgbWlkOiBtaWQsXG4gICAgICAgICAgICAgICAgY25hbWU6IGNuYW1lLFxuICAgICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVyczogcmVjdkVuY29kaW5nUGFyYW1ldGVyc1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgUlRDUnRwUmVjZWl2ZXIgbm93LiBUaGUgUlRQU2VuZGVyIGlzIHN0YXJ0ZWQgaW5cbiAgICAgICAgICAgICAgLy8gc2V0TG9jYWxEZXNjcmlwdGlvbi5cbiAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZShzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSxcbiAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdhbnN3ZXInICYmICFyZWplY3RlZCkge1xuICAgICAgICAgICAgICB0cmFuc2NlaXZlciA9IHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICAgICAgICBpY2VHYXRoZXJlciA9IHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyO1xuICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgICBydHBTZW5kZXIgPSB0cmFuc2NlaXZlci5ydHBTZW5kZXI7XG4gICAgICAgICAgICAgIHJ0cFJlY2VpdmVyID0gdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzO1xuXG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVtb3RlQ2FwYWJpbGl0aWVzID1cbiAgICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uY25hbWUgPSBjbmFtZTtcblxuICAgICAgICAgICAgICBpZiAoaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc3RhcnQoaWNlR2F0aGVyZXIsIHJlbW90ZUljZVBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAnY29udHJvbGxpbmcnKTtcbiAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgICAgc2VsZi5fdHJhbnNjZWl2ZSh0cmFuc2NlaXZlcixcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdyZWN2b25seScsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKTtcblxuICAgICAgICAgICAgICBpZiAocnRwUmVjZWl2ZXIgJiZcbiAgICAgICAgICAgICAgICAgIChkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKSkge1xuICAgICAgICAgICAgICAgIHRyYWNrID0gcnRwUmVjZWl2ZXIudHJhY2s7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlcl0pO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFjdHVhbGx5IHRoZSByZWNlaXZlciBzaG91bGQgYmUgY3JlYXRlZCBsYXRlci5cbiAgICAgICAgICAgICAgICBkZWxldGUgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgICAgICAgc2RwOiBkZXNjcmlwdGlvbi5zZHBcbiAgICAgICAgICB9O1xuICAgICAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnb2ZmZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnaGF2ZS1yZW1vdGUtb2ZmZXInKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbnN3ZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICtcbiAgICAgICAgICAgICAgICAgICdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyZWFtLmdldFRyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VsZi5yZW1vdGVTdHJlYW1zLnB1c2goc3RyZWFtKTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2FkZHN0cmVhbScpO1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW0gPSBzdHJlYW07XG4gICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgIGlmIChzZWxmLm9uYWRkc3RyZWFtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLm9uYWRkc3RyZWFtKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJhY2sgPSBpdGVtWzBdO1xuICAgICAgICAgICAgICAgIHZhciByZWNlaXZlciA9IGl0ZW1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHRyYWNrRXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQucmVjZWl2ZXIgPSByZWNlaXZlcjtcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnN0cmVhbXMgPSBbc3RyZWFtXTtcbiAgICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9udHJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9udHJhY2sodHJhY2tFdmVudCk7XG4gICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMV0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIC8qIG5vdCB5ZXRcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICAqL1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0KSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydCkge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBGSVhNRTogY2xlYW4gdXAgdHJhY2tzLCBsb2NhbCBzdHJlYW1zLCByZW1vdGUgc3RyZWFtcywgZXRjXG4gICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnY2xvc2VkJyk7XG4gICAgfTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2lnbmFsaW5nIHN0YXRlLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlID1cbiAgICAgICAgZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICAgICAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdzaWduYWxpbmdzdGF0ZWNoYW5nZScpO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgaWYgKHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBmaXJlIHRoZSBuZWdvdGlhdGlvbm5lZWRlZCBldmVudC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCA9XG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIEZpcmUgYXdheSAoZm9yIG5vdykuXG4gICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcpO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgaWYgKHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIGNvbm5lY3Rpb24gc3RhdGUuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlQ29ubmVjdGlvblN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgbmV3U3RhdGU7XG4gICAgICB2YXIgc3RhdGVzID0ge1xuICAgICAgICAnbmV3JzogMCxcbiAgICAgICAgY2xvc2VkOiAwLFxuICAgICAgICBjb25uZWN0aW5nOiAwLFxuICAgICAgICBjaGVja2luZzogMCxcbiAgICAgICAgY29ubmVjdGVkOiAwLFxuICAgICAgICBjb21wbGV0ZWQ6IDAsXG4gICAgICAgIGZhaWxlZDogMFxuICAgICAgfTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgc3RhdGVzW3RyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdGF0ZV0rKztcbiAgICAgICAgc3RhdGVzW3RyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgICB9KTtcbiAgICAgIC8vIElDRVRyYW5zcG9ydC5jb21wbGV0ZWQgYW5kIGNvbm5lY3RlZCBhcmUgdGhlIHNhbWUgZm9yIHRoaXMgcHVycG9zZS5cbiAgICAgIHN0YXRlcy5jb25uZWN0ZWQgKz0gc3RhdGVzLmNvbXBsZXRlZDtcblxuICAgICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICAgIGlmIChzdGF0ZXMuZmFpbGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdmYWlsZWQnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGluZyA+IDAgfHwgc3RhdGVzLmNoZWNraW5nID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdjb25uZWN0aW5nJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmRpc2Nvbm5lY3RlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnZGlzY29ubmVjdGVkJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLm5ldyA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmNvbm5lY3RlZCA+IDAgfHwgc3RhdGVzLmNvbXBsZXRlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld1N0YXRlICE9PSBzZWxmLmljZUNvbm5lY3Rpb25TdGF0ZSkge1xuICAgICAgICBzZWxmLmljZUNvbm5lY3Rpb25TdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBpZiAodGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlT2ZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGlmICh0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmVhdGVPZmZlciBjYWxsZWQgd2hpbGUgdGhlcmUgaXMgYSBwZW5kaW5nIG9mZmVyLicpO1xuICAgICAgfVxuICAgICAgdmFyIG9mZmVyT3B0aW9ucztcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb2ZmZXJPcHRpb25zID0gYXJndW1lbnRzWzBdO1xuICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIG9mZmVyT3B0aW9ucyA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRyYWNrcyA9IFtdO1xuICAgICAgdmFyIG51bUF1ZGlvVHJhY2tzID0gMDtcbiAgICAgIHZhciBudW1WaWRlb1RyYWNrcyA9IDA7XG4gICAgICAvLyBEZWZhdWx0IHRvIHNlbmRyZWN2LlxuICAgICAgaWYgKHRoaXMubG9jYWxTdHJlYW1zLmxlbmd0aCkge1xuICAgICAgICBudW1BdWRpb1RyYWNrcyA9IHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldEF1ZGlvVHJhY2tzKCkubGVuZ3RoO1xuICAgICAgICBudW1WaWRlb1RyYWNrcyA9IHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldFZpZGVvVHJhY2tzKCkubGVuZ3RoO1xuICAgICAgfVxuICAgICAgLy8gRGV0ZXJtaW5lIG51bWJlciBvZiBhdWRpbyBhbmQgdmlkZW8gdHJhY2tzIHdlIG5lZWQgdG8gc2VuZC9yZWN2LlxuICAgICAgaWYgKG9mZmVyT3B0aW9ucykge1xuICAgICAgICAvLyBSZWplY3QgQ2hyb21lIGxlZ2FjeSBjb25zdHJhaW50cy5cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5tYW5kYXRvcnkgfHwgb2ZmZXJPcHRpb25zLm9wdGlvbmFsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgJ0xlZ2FjeSBtYW5kYXRvcnkvb3B0aW9uYWwgY29uc3RyYWludHMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID0gb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW87XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcyA9IG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5sb2NhbFN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIFB1c2ggbG9jYWwgc3RyZWFtcy5cbiAgICAgICAgdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IHRyYWNrLmtpbmQsXG4gICAgICAgICAgICB0cmFjazogdHJhY2ssXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJhY2sua2luZCA9PT0gJ2F1ZGlvJyA/XG4gICAgICAgICAgICAgICAgbnVtQXVkaW9UcmFja3MgPiAwIDogbnVtVmlkZW9UcmFja3MgPiAwXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHRyYWNrLmtpbmQgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XG4gICAgICAgICAgfSBlbHNlIGlmICh0cmFjay5raW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgICBudW1WaWRlb1RyYWNrcy0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAvLyBDcmVhdGUgTS1saW5lcyBmb3IgcmVjdm9ubHkgc3RyZWFtcy5cbiAgICAgIHdoaWxlIChudW1BdWRpb1RyYWNrcyA+IDAgfHwgbnVtVmlkZW9UcmFja3MgPiAwKSB7XG4gICAgICAgIGlmIChudW1BdWRpb1RyYWNrcyA+IDApIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiAnYXVkaW8nLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcy0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1WaWRlb1RyYWNrcyA+IDApIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiAndmlkZW8nLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcy0tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSgpO1xuICAgICAgdmFyIHRyYW5zY2VpdmVycyA9IFtdO1xuICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24obWxpbmUsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgLy8gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhbiBpY2UgZ2F0aGVyZXIsIGljZSB0cmFuc3BvcnQsXG4gICAgICAgIC8vIGR0bHMgdHJhbnNwb3J0LCBwb3RlbnRpYWxseSBydHBzZW5kZXIgYW5kIHJ0cHJlY2VpdmVyLlxuICAgICAgICB2YXIgdHJhY2sgPSBtbGluZS50cmFjaztcbiAgICAgICAgdmFyIGtpbmQgPSBtbGluZS5raW5kO1xuICAgICAgICB2YXIgbWlkID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbiAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSBzZWxmLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyhtaWQsIHNkcE1MaW5lSW5kZXgpO1xuXG4gICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcyA9IFJUQ1J0cFNlbmRlci5nZXRDYXBhYmlsaXRpZXMoa2luZCk7XG4gICAgICAgIHZhciBydHBTZW5kZXI7XG4gICAgICAgIHZhciBydHBSZWNlaXZlcjtcblxuICAgICAgICAvLyBnZW5lcmF0ZSBhbiBzc3JjIG5vdywgdG8gYmUgdXNlZCBsYXRlciBpbiBydHBTZW5kZXIuc2VuZFxuICAgICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMSkgKiAxMDAxXG4gICAgICAgIH1dO1xuICAgICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgICBydHBTZW5kZXIgPSBuZXcgUlRDUnRwU2VuZGVyKHRyYWNrLCB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1saW5lLndhbnRSZWNlaXZlKSB7XG4gICAgICAgICAgcnRwUmVjZWl2ZXIgPSBuZXcgUlRDUnRwUmVjZWl2ZXIodHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LCBraW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNwb3J0cy5pY2VHYXRoZXJlcixcbiAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LFxuICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCxcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllczogbG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiBudWxsLFxuICAgICAgICAgIHJ0cFNlbmRlcjogcnRwU2VuZGVyLFxuICAgICAgICAgIHJ0cFJlY2VpdmVyOiBydHBSZWNlaXZlcixcbiAgICAgICAgICBraW5kOiBraW5kLFxuICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMsXG4gICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVyczogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSB0cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgIHNkcCArPSBTRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbih0cmFuc2NlaXZlcixcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLCAnb2ZmZXInLCBzZWxmLmxvY2FsU3RyZWFtc1swXSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fcGVuZGluZ09mZmVyID0gdHJhbnNjZWl2ZXJzO1xuICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJ29mZmVyJyxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMF0sIDAsIGRlc2MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlKCk7XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0gc2VsZi5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICAgIHNkcCArPSBTRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbih0cmFuc2NlaXZlciwgY29tbW9uQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgJ2Fuc3dlcicsIHNlbGYubG9jYWxTdHJlYW1zWzBdKTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnYW5zd2VyJyxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMF0sIDAsIGRlc2MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgIHZhciBtTGluZUluZGV4ID0gY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXg7XG4gICAgICBpZiAoY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMudHJhbnNjZWl2ZXJzW2ldLm1pZCA9PT0gY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICAgICAgbUxpbmVJbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciB0cmFuc2NlaXZlciA9IHRoaXMudHJhbnNjZWl2ZXJzW21MaW5lSW5kZXhdO1xuICAgICAgaWYgKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHZhciBjYW5kID0gT2JqZWN0LmtleXMoY2FuZGlkYXRlLmNhbmRpZGF0ZSkubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kaWRhdGUuY2FuZGlkYXRlKSA6IHt9O1xuICAgICAgICAvLyBJZ25vcmUgQ2hyb21lJ3MgaW52YWxpZCBjYW5kaWRhdGVzIHNpbmNlIEVkZ2UgZG9lcyBub3QgbGlrZSB0aGVtLlxuICAgICAgICBpZiAoY2FuZC5wcm90b2NvbCA9PT0gJ3RjcCcgJiYgY2FuZC5wb3J0ID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIElnbm9yZSBSVENQIGNhbmRpZGF0ZXMsIHdlIGFzc3VtZSBSVENQLU1VWC5cbiAgICAgICAgaWYgKGNhbmQuY29tcG9uZW50ICE9PSAnMScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQSBkaXJ0eSBoYWNrIHRvIG1ha2Ugc2FtcGxlcyB3b3JrLlxuICAgICAgICBpZiAoY2FuZC50eXBlID09PSAnZW5kT2ZDYW5kaWRhdGVzJykge1xuICAgICAgICAgIGNhbmQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuYWRkUmVtb3RlQ2FuZGlkYXRlKGNhbmQpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnModGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICBzZWN0aW9uc1ttTGluZUluZGV4ICsgMV0gKz0gKGNhbmQudHlwZSA/IGNhbmRpZGF0ZS5jYW5kaWRhdGUudHJpbSgpXG4gICAgICAgICAgICA6ICdhPWVuZC1vZi1jYW5kaWRhdGVzJykgKyAnXFxyXFxuJztcbiAgICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHAgPSBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgIH1cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1sxXSwgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICBbJ3J0cFNlbmRlcicsICdydHBSZWNlaXZlcicsICdpY2VHYXRoZXJlcicsICdpY2VUcmFuc3BvcnQnLFxuICAgICAgICAgICAgJ2R0bHNUcmFuc3BvcnQnXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgICBpZiAodHJhbnNjZWl2ZXJbbWV0aG9kXSkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2godHJhbnNjZWl2ZXJbbWV0aG9kXS5nZXRTdGF0cygpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHZhciBjYiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICBhcmd1bWVudHNbMV07XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICByZXMuZm9yRWFjaChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICByZXN1bHRzW2lkXSA9IHJlc3VsdFtpZF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNiLCAwLCByZXN1bHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIC8vIEF0dGFjaCBhIG1lZGlhIHN0cmVhbSB0byBhbiBlbGVtZW50LlxuICBhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24oZWxlbWVudCwgc3RyZWFtKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgZWxlbWVudC5zcmNPYmplY3QgPSBzdHJlYW07XG4gIH0sXG5cbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24odG8sIGZyb20pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCByZWF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIHRvLnNyY09iamVjdCA9IGZyb20uc3JjT2JqZWN0O1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBlZGdlU2hpbS5hdHRhY2hNZWRpYVN0cmVhbSxcbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZWRnZVNoaW0ucmVhdHRhY2hNZWRpYVN0cmVhbVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4uL3V0aWxzJykubG9nO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGZpcmVmb3hTaGltID0ge1xuICBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJiAhKCdvbnRyYWNrJyBpblxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdvbnRyYWNrJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9vbnRyYWNrO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEZpcmVmb3ggaGFzIHN1cHBvcnRlZCBtb3pTcmNPYmplY3Qgc2luY2UgRkYyMiwgdW5wcmVmaXhlZCBpbiA0Mi5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudCAmJlxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUsICdzcmNPYmplY3QnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1velNyY09iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGlzLm1velNyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKSB7XG4gICAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgICAgICAvLyAudXJscyBpcyBub3Qgc3VwcG9ydGVkIGluIEZGIDwgMzguXG4gICAgICAgICAgLy8gY3JlYXRlIFJUQ0ljZVNlcnZlcnMgd2l0aCBhIHNpbmdsZSB1cmwuXG4gICAgICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgICAgIHZhciBuZXdJY2VTZXJ2ZXJzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBjQ29uZmlnLmljZVNlcnZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHNlcnZlciA9IHBjQ29uZmlnLmljZVNlcnZlcnNbaV07XG4gICAgICAgICAgICAgIGlmIChzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybHMnKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2VydmVyLnVybHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBuZXdTZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmVyLnVybHNbal1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBpZiAoc2VydmVyLnVybHNbal0uaW5kZXhPZigndHVybicpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1NlcnZlci51c2VybmFtZSA9IHNlcnZlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLmNyZWRlbnRpYWwgPSBzZXJ2ZXIuY3JlZGVudGlhbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChuZXdTZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gocGNDb25maWcuaWNlU2VydmVyc1tpXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBjQ29uZmlnLmljZVNlcnZlcnMgPSBuZXdJY2VTZXJ2ZXJzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IG1velJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gbW96UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgICAgaWYgKG1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBtb3pSVENTZXNzaW9uRGVzY3JpcHRpb247XG4gICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gbW96UlRDSWNlQ2FuZGlkYXRlO1xuICAgIH1cblxuICAgIC8vIHNoaW0gYXdheSBuZWVkIGZvciBvYnNvbGV0ZSBSVENJY2VDYW5kaWRhdGUvUlRDU2Vzc2lvbkRlc2NyaXB0aW9uLlxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpP1xuICAgICAgICAgICAgICAgIFJUQ0ljZUNhbmRpZGF0ZSA6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbikoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgfSxcblxuICBzaGltR2V0VXNlck1lZGlhOiBmdW5jdGlvbigpIHtcbiAgICAvLyBnZXRVc2VyTWVkaWEgY29uc3RyYWludHMgc2hpbS5cbiAgICB2YXIgZ2V0VXNlck1lZGlhXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICAgIHZhciBjb25zdHJhaW50c1RvRkYzN18gPSBmdW5jdGlvbihjKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5yZXF1aXJlKSB7XG4gICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcXVpcmUgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVxdWlyZScgfHwga2V5ID09PSAnYWR2YW5jZWQnIHx8XG4gICAgICAgICAgICAgIGtleSA9PT0gJ21lZGlhU291cmNlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgciA9IGNba2V5XSA9ICh0eXBlb2YgY1trZXldID09PSAnb2JqZWN0JykgP1xuICAgICAgICAgICAgICBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICAgICAgaWYgKHIubWluICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgci5tYXggIT09IHVuZGVmaW5lZCB8fCByLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlcXVpcmUucHVzaChrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgIHIuIG1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNba2V5XSA9IHIuZXhhY3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgci5leGFjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYy5hZHZhbmNlZCA9IGMuYWR2YW5jZWQgfHwgW107XG4gICAgICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgb2Nba2V5XSA9IHttaW46IHIuaWRlYWwsIG1heDogci5pZGVhbH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvY1trZXldID0gci5pZGVhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMuYWR2YW5jZWQucHVzaChvYyk7XG4gICAgICAgICAgICBkZWxldGUgci5pZGVhbDtcbiAgICAgICAgICAgIGlmICghT2JqZWN0LmtleXMocikubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGRlbGV0ZSBjW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlcXVpcmUubGVuZ3RoKSB7XG4gICAgICAgICAgYy5yZXF1aXJlID0gcmVxdWlyZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICAgIH07XG4gICAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgICAgbG9nZ2luZygnc3BlYzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2luZygnZmYzNzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYShjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKTtcbiAgICB9O1xuXG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGdldFVzZXJNZWRpYV87XG5cbiAgICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFNoaW0gZm9yIG1lZGlhRGV2aWNlcyBvbiBvbGRlciB2ZXJzaW9ucy5cbiAgICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH0sXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9XG4gICAgICB9O1xuICAgIH1cbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPVxuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHZhciBpbmZvcyA9IFtcbiAgICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXG4gICAgICAgICAgICAgIHtraW5kOiAndmlkZW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQxKSB7XG4gICAgICAvLyBXb3JrIGFyb3VuZCBodHRwOi8vYnVnemlsLmxhLzExNjk2NjVcbiAgICAgIHZhciBvcmdFbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMuYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gb3JnRW51bWVyYXRlRGV2aWNlcygpLnRoZW4odW5kZWZpbmVkLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQXR0YWNoIGEgbWVkaWEgc3RyZWFtIHRvIGFuIGVsZW1lbnQuXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbihlbGVtZW50LCBzdHJlYW0pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCBhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICBlbGVtZW50LnNyY09iamVjdCA9IHN0cmVhbTtcbiAgfSxcblxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbih0bywgZnJvbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIHJlYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgdG8uc3JjT2JqZWN0ID0gZnJvbS5zcmNPYmplY3Q7XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltT25UcmFjazogZmlyZWZveFNoaW0uc2hpbU9uVHJhY2ssXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZpcmVmb3hTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpLFxuICBhdHRhY2hNZWRpYVN0cmVhbTogZmlyZWZveFNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZpcmVmb3hTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIC8vIGdldFVzZXJNZWRpYSBjb25zdHJhaW50cyBzaGltLlxuICB2YXIgZ2V0VXNlck1lZGlhXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICB2YXIgY29uc3RyYWludHNUb0ZGMzdfID0gZnVuY3Rpb24oYykge1xuICAgICAgaWYgKHR5cGVvZiBjICE9PSAnb2JqZWN0JyB8fCBjLnJlcXVpcmUpIHtcbiAgICAgICAgcmV0dXJuIGM7XG4gICAgICB9XG4gICAgICB2YXIgcmVxdWlyZSA9IFtdO1xuICAgICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSBjW2tleV0gPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID9cbiAgICAgICAgICAgIGNba2V5XSA6IHtpZGVhbDogY1trZXldfTtcbiAgICAgICAgaWYgKHIubWluICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIHIubWF4ICE9PSB1bmRlZmluZWQgfHwgci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmVxdWlyZS5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHIuIG1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY1trZXldID0gci5leGFjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIHIuZXhhY3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGMuYWR2YW5jZWQgPSBjLmFkdmFuY2VkIHx8IFtdO1xuICAgICAgICAgIHZhciBvYyA9IHt9O1xuICAgICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIG9jW2tleV0gPSB7bWluOiByLmlkZWFsLCBtYXg6IHIuaWRlYWx9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvY1trZXldID0gci5pZGVhbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYy5hZHZhbmNlZC5wdXNoKG9jKTtcbiAgICAgICAgICBkZWxldGUgci5pZGVhbDtcbiAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHIpLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVsZXRlIGNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHJlcXVpcmUubGVuZ3RoKSB7XG4gICAgICAgIGMucmVxdWlyZSA9IHJlcXVpcmU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYztcbiAgICB9O1xuICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgIGxvZ2dpbmcoJ3NwZWM6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgaWYgKGNvbnN0cmFpbnRzLmF1ZGlvKSB7XG4gICAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdmZjM3OiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH07XG5cbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IGdldFVzZXJNZWRpYV87XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYShjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaGltIGZvciBtZWRpYURldmljZXMgb24gb2xkZXIgdmVyc2lvbnMuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH1cbiAgICB9O1xuICB9XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGluZm9zID0gW1xuICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXG4gICAgICAgICAgICB7a2luZDogJ3ZpZGVvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfVxuICAgICAgICAgIF07XG4gICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQxKSB7XG4gICAgLy8gV29yayBhcm91bmQgaHR0cDovL2J1Z3ppbC5sYS8xMTY5NjY1XG4gICAgdmFyIG9yZ0VudW1lcmF0ZURldmljZXMgPVxuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMuYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBvcmdFbnVtZXJhdGVEZXZpY2VzKCkudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgc2FmYXJpU2hpbSA9IHtcbiAgLy8gVE9ETzogRHJBbGV4LCBzaG91bGQgYmUgaGVyZSwgZG91YmxlIGNoZWNrIGFnYWluc3QgTGF5b3V0VGVzdHNcbiAgLy8gc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIC8vIFRPRE86IERyQWxleFxuICAvLyBhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24oZWxlbWVudCwgc3RyZWFtKSB7IH0sXG4gIC8vIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHRvLCBmcm9tKSB7IH0sXG5cbiAgLy8gVE9ETzogb25jZSB0aGUgYmFjay1lbmQgZm9yIHRoZSBtYWMgcG9ydCBpcyBkb25lLCBhZGQuXG4gIC8vIFRPRE86IGNoZWNrIGZvciB3ZWJraXRHVEsrXG4gIC8vIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7IH0sXG5cbiAgc2hpbUdldFVzZXJNZWRpYTogZnVuY3Rpb24oKSB7XG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWE7XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltR2V0VXNlck1lZGlhOiBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWFcbiAgLy8gVE9ET1xuICAvLyBzaGltT25UcmFjazogc2FmYXJpU2hpbS5zaGltT25UcmFjayxcbiAgLy8gc2hpbVBlZXJDb25uZWN0aW9uOiBzYWZhcmlTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgLy8gYXR0YWNoTWVkaWFTdHJlYW06IHNhZmFyaVNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIC8vIHJlYXR0YWNoTWVkaWFTdHJlYW06IHNhZmFyaVNoaW0ucmVhdHRhY2hNZWRpYVN0cmVhbVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nRGlzYWJsZWRfID0gZmFsc2U7XG5cbi8vIFV0aWxpdHkgbWV0aG9kcy5cbnZhciB1dGlscyA9IHtcbiAgZGlzYWJsZUxvZzogZnVuY3Rpb24oYm9vbCkge1xuICAgIGlmICh0eXBlb2YgYm9vbCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcmd1bWVudCB0eXBlOiAnICsgdHlwZW9mIGJvb2wgK1xuICAgICAgICAgICcuIFBsZWFzZSB1c2UgYSBib29sZWFuLicpO1xuICAgIH1cbiAgICBsb2dEaXNhYmxlZF8gPSBib29sO1xuICAgIHJldHVybiAoYm9vbCkgPyAnYWRhcHRlci5qcyBsb2dnaW5nIGRpc2FibGVkJyA6XG4gICAgICAgICdhZGFwdGVyLmpzIGxvZ2dpbmcgZW5hYmxlZCc7XG4gIH0sXG5cbiAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChsb2dEaXNhYmxlZF8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgYnJvd3NlciB2ZXJzaW9uIG91dCBvZiB0aGUgcHJvdmlkZWQgdXNlciBhZ2VudCBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7IXN0cmluZ30gdWFzdHJpbmcgdXNlckFnZW50IHN0cmluZy5cbiAgICogQHBhcmFtIHshc3RyaW5nfSBleHByIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIGFzIG1hdGNoIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0geyFudW1iZXJ9IHBvcyBwb3NpdGlvbiBpbiB0aGUgdmVyc2lvbiBzdHJpbmcgdG8gYmUgcmV0dXJuZWQuXG4gICAqIEByZXR1cm4geyFudW1iZXJ9IGJyb3dzZXIgdmVyc2lvbi5cbiAgICovXG4gIGV4dHJhY3RWZXJzaW9uOiBmdW5jdGlvbih1YXN0cmluZywgZXhwciwgcG9zKSB7XG4gICAgdmFyIG1hdGNoID0gdWFzdHJpbmcubWF0Y2goZXhwcik7XG4gICAgcmV0dXJuIG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+PSBwb3MgJiYgcGFyc2VJbnQobWF0Y2hbcG9zXSwgMTApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBCcm93c2VyIGRldGVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHJlc3VsdCBjb250YWluaW5nIGJyb3dzZXIsIHZlcnNpb24gYW5kIG1pblZlcnNpb25cbiAgICogICAgIHByb3BlcnRpZXMuXG4gICAqL1xuICBkZXRlY3RCcm93c2VyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBSZXR1cm5lZCByZXN1bHQgb2JqZWN0LlxuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICByZXN1bHQuYnJvd3NlciA9IG51bGw7XG4gICAgcmVzdWx0LnZlcnNpb24gPSBudWxsO1xuICAgIHJlc3VsdC5taW5WZXJzaW9uID0gbnVsbDtcblxuICAgIC8vIEZhaWwgZWFybHkgaWYgaXQncyBub3QgYSBicm93c2VyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8ICF3aW5kb3cubmF2aWdhdG9yKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdOb3QgYSBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3guXG4gICAgaWYgKG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2ZpcmVmb3gnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0ZpcmVmb3hcXC8oWzAtOV0rKVxcLi8sIDEpO1xuICAgICAgcmVzdWx0Lm1pblZlcnNpb24gPSAzMTtcblxuICAgIC8vIGFsbCB3ZWJraXQtYmFzZWQgYnJvd3NlcnNcbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEpIHtcbiAgICAgIC8vIENocm9tZSwgQ2hyb21pdW0sIFdlYnZpZXcsIE9wZXJhLCBhbGwgdXNlIHRoZSBjaHJvbWUgc2hpbSBmb3Igbm93XG4gICAgICBpZiAod2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIHJlc3VsdC5icm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9DaHJvbShlfGl1bSlcXC8oWzAtOV0rKVxcLi8sIDIpO1xuICAgICAgICByZXN1bHQubWluVmVyc2lvbiA9IDM4O1xuXG4gICAgICAvLyBTYWZhcmkgb3IgdW5rbm93biB3ZWJraXQtYmFzZWRcbiAgICAgIC8vIGZvciB0aGUgdGltZSBiZWluZyBTYWZhcmkgaGFzIHN1cHBvcnQgZm9yIE1lZGlhU3RyZWFtcyBidXQgbm90IHdlYlJUQ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2FmYXJpIFVBIHN1YnN0cmluZ3Mgb2YgaW50ZXJlc3QgZm9yIHJlZmVyZW5jZTpcbiAgICAgICAgLy8gLSB3ZWJraXQgdmVyc2lvbjogICAgICAgICAgIEFwcGxlV2ViS2l0LzYwMi4xLjI1IChhbHNvIHVzZWQgaW4gT3AsQ3IpXG4gICAgICAgIC8vIC0gc2FmYXJpIFVJIHZlcnNpb246ICAgICAgICBWZXJzaW9uLzkuMC4zICh1bmlxdWUgdG8gU2FmYXJpKVxuICAgICAgICAvLyAtIHNhZmFyaSBVSSB3ZWJraXQgdmVyc2lvbjogU2FmYXJpLzYwMS40LjQgKGFsc28gdXNlZCBpbiBPcCxDcilcbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgdGhlIHdlYmtpdCB2ZXJzaW9uIGFuZCBzYWZhcmkgVUkgd2Via2l0IHZlcnNpb25zIGFyZSBlcXVhbHMsXG4gICAgICAgIC8vIC4uLiB0aGlzIGlzIGEgc3RhYmxlIHZlcnNpb24uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIG9ubHkgdGhlIGludGVybmFsIHdlYmtpdCB2ZXJzaW9uIGlzIGltcG9ydGFudCB0b2RheSB0byBrbm93IGlmXG4gICAgICAgIC8vIG1lZGlhIHN0cmVhbXMgYXJlIHN1cHBvcnRlZFxuICAgICAgICAvL1xuICAgICAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVmVyc2lvblxcLyhcXGQrKS4oXFxkKykvKSkge1xuICAgICAgICAgIHJlc3VsdC5icm93c2VyID0gJ3NhZmFyaSc7XG4gICAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICAvQXBwbGVXZWJLaXRcXC8oWzAtOV0rKVxcLi8sIDEpO1xuICAgICAgICAgIHJlc3VsdC5taW5WZXJzaW9uID0gNjAyO1xuXG4gICAgICAgIC8vIHVua25vd24gd2Via2l0LWJhc2VkIGJyb3dzZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdVbnN1cHBvcnRlZCB3ZWJraXQtYmFzZWQgYnJvd3NlciAnICtcbiAgICAgICAgICAgICAgJ3dpdGggR1VNIHN1cHBvcnQgYnV0IG5vIFdlYlJUQyBzdXBwb3J0Lic7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgLy8gRWRnZS5cbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci5tZWRpYURldmljZXMgJiZcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRWRnZVxcLyhcXGQrKS4oXFxkKykkLykpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2VkZ2UnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0VkZ2VcXC8oXFxkKykuKFxcZCspJC8sIDIpO1xuICAgICAgcmVzdWx0Lm1pblZlcnNpb24gPSAxMDU0NztcblxuICAgIC8vIERlZmF1bHQgZmFsbHRocm91Z2g6IG5vdCBzdXBwb3J0ZWQuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIHN1cHBvcnRlZCBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIFdhcm4gaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gbWluVmVyc2lvbi5cbiAgICBpZiAocmVzdWx0LnZlcnNpb24gPCByZXN1bHQubWluVmVyc2lvbikge1xuICAgICAgdXRpbHMubG9nKCdCcm93c2VyOiAnICsgcmVzdWx0LmJyb3dzZXIgKyAnIFZlcnNpb246ICcgKyByZXN1bHQudmVyc2lvbiArXG4gICAgICAgICAgJyA8IG1pbmltdW0gc3VwcG9ydGVkIHZlcnNpb246ICcgKyByZXN1bHQubWluVmVyc2lvbiArXG4gICAgICAgICAgJ1xcbiBzb21lIHRoaW5ncyBtaWdodCBub3Qgd29yayEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuXG4vLyBFeHBvcnQuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9nOiB1dGlscy5sb2csXG4gIGRpc2FibGVMb2c6IHV0aWxzLmRpc2FibGVMb2csXG4gIGJyb3dzZXJEZXRhaWxzOiB1dGlscy5kZXRlY3RCcm93c2VyKCksXG4gIGV4dHJhY3RWZXJzaW9uOiB1dGlscy5leHRyYWN0VmVyc2lvblxufTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG52YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IGZhbHNlO1xudmFyIExvZ2dlciA9IHtcblx0bG9nOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5sb2cobWVzc2FnZSk7XG5cdH0sXG5cblx0ZXJyb3I6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gRGl5YU5vZGUoKXtcblx0RXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cblx0dGhpcy5fdXNlciA9IG51bGw7XG5cdHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBudWxsO1xuXHR0aGlzLl9wYXNzID0gbnVsbDtcblxuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2VkJztcblx0dGhpcy5fYWRkciA9IG51bGw7XG5cdHRoaXMuX3NvY2tldCA9IG51bGw7XG5cdHRoaXMuX25leHRJZCA9IDA7XG5cdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7XG5cdHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7XG5cdHRoaXMuX3BlbmRpbmdNZXNzYWdlcyA9IFtdO1xuXHR0aGlzLl9wZWVycyA9IFtdO1xuXHR0aGlzLl9yZWNvbm5lY3RUaW1lb3V0ID0gMTAwMDtcblx0dGhpcy5fY29ubmVjdFRpbWVvdXQgPSA1MDAwO1xufVxuaW5oZXJpdHMoRGl5YU5vZGUsIEV2ZW50RW1pdHRlcik7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLyBQdWJsaWMgQVBJIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLnVzZXIgPSBmdW5jdGlvbih1c2VyKSB7IFxuXHRpZih1c2VyKSB0aGlzLl91c2VyID0gdXNlcjtcblx0ZWxzZSByZXR1cm4gdGhpcy5fdXNlcjsgXG59O1xuRGl5YU5vZGUucHJvdG90eXBlLmF1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbihhdXRoZW50aWNhdGVkKSB7IFxuXHRpZihhdXRoZW50aWNhdGVkICE9PSB1bmRlZmluZWQpIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBhdXRoZW50aWNhdGVkO1xuXHRlbHNlIHJldHVybiB0aGlzLl9hdXRoZW50aWNhdGVkOyBcbn07XG5EaXlhTm9kZS5wcm90b3R5cGUucGFzcyA9IGZ1bmN0aW9uKHBhc3MpIHsgXG5cdGlmKHBhc3MgIT09IHVuZGVmaW5lZCkgdGhpcy5fcGFzcyA9IHBhc3M7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3Bhc3M7IFxufTtcbkRpeWFOb2RlLnByb3RvdHlwZS5hZGRyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9hZGRyOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnBlZXJzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuX3BlZXJzOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnNlbGYgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3NlbGY7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2V0U2VjdXJlZCA9IGZ1bmN0aW9uKGJTZWN1cmVkKSB7IHRoaXMuX3NlY3VyZWQgPSBiU2VjdXJlZCAhPT0gZmFsc2U7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2V0V1NvY2tldCA9IGZ1bmN0aW9uKFdTb2NrZXQpIHt0aGlzLl9XU29ja2V0ID0gV1NvY2tldDt9XG5cblxuXG4vKiogQHJldHVybiB7UHJvbWlzZTxTdHJpbmc+fSB0aGUgY29ubmVjdGVkIHBlZXIgbmFtZSAqL1xuRGl5YU5vZGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbihhZGRyLCBXU29ja2V0KXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmJEb250UmVjb25uZWN0ID0gZmFsc2U7XG5cblx0aWYoV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IFdTb2NrZXQ7XG5cdGVsc2UgaWYoIXRoaXMuX1dTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0O1xuXHRXU29ja2V0ID0gdGhpcy5fV1NvY2tldDtcblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYWRkci5pbmRleE9mKFwid3M6Ly9cIikgPT09IDAgJiYgdGhpcy5fc2VjdXJlZCkgcmV0dXJuIFEucmVqZWN0KFwiUGxlYXNlIHVzZSBhIHNlY3VyZWQgY29ubmVjdGlvbiAoXCIgKyBhZGRyICsgXCIpXCIpO1xuXHRpZihhZGRyLmluZGV4T2YoXCJ3c3M6Ly9cIikgPT09IDAgJiYgdGhpcy5fc2VjdXJlZCA9PT0gZmFsc2UpIHJldHVybiBRLnJlamVjdChcIlBsZWFzZSB1c2UgYSBub24tc2VjdXJlZCBjb25uZWN0aW9uIChcIiArIGFkZHIgKyBcIilcIik7XG5cdGlmKGFkZHIuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGFkZHIuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKHRoaXMuX3NlY3VyZWQpIGFkZHIgPSBcIndzczovL1wiICsgYWRkcjtcblx0XHRlbHNlIGFkZHIgPSBcIndzOi8vXCIgKyBhZGRyO1xuXHR9XG5cblxuXHRpZih0aGlzLl9hZGRyID09PSBhZGRyKXtcblx0XHRpZih0aGlzLl9zdGF0dXMgPT09ICdvcGVuZWQnKVxuXHRcdFx0cmV0dXJuIFEodGhpcy5zZWxmKCkpO1xuXHRcdGVsc2UgaWYodGhpcy5fY29ubmVjdGlvbkRlZmVycmVkICYmIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlICYmIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlLmlzUGVuZGluZygpKVxuXHRcdFx0cmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuY2xvc2UoKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0dGhhdC5fYWRkciA9IGFkZHI7XG5cdFx0dGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRcdExvZ2dlci5sb2coJ2QxOiBjb25uZWN0IHRvICcgKyB0aGF0Ll9hZGRyKTtcblx0XHR2YXIgc29jayA9IG5ldyBTb2NrZXRIYW5kbGVyKFdTb2NrZXQsIHRoYXQuX2FkZHIsIHRoYXQuX2Nvbm5lY3RUaW1lb3V0KTtcblxuXHRcdGlmKCF0aGF0Ll9zb2NrZXRIYW5kbGVyKSB0aGF0Ll9zb2NrZXRIYW5kbGVyID0gc29jaztcblxuXHRcdHRoYXQuX29ub3BlbmluZygpO1xuXG5cdFx0c29jay5vbignb3BlbicsIGZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGF0Ll9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiW2QxXSBXZWJzb2NrZXQgcmVzcG9uZGVkIGJ1dCBhbHJlYWR5IGNvbm5lY3RlZCB0byBhIGRpZmZlcmVudCBvbmVcIik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBzb2NrO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ29wZW5lZCc7XG5cdFx0XHR0aGF0Ll9zZXR1cFBpbmdSZXNwb25zZSgpO1xuXHRcdH0pO1xuXG5cdFx0c29jay5vbignY2xvc2luZycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhhdC5fc29ja2V0SGFuZGxlciAhPT0gc29jaykgcmV0dXJuIDtcblx0XHRcdHRoYXQuX29uY2xvc2luZygpO1xuXHRcdH0pO1xuXG5cdFx0c29jay5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdFx0XHR0aGF0Ll9zdG9wUGluZ1Jlc3BvbnNlKCk7XG5cdFx0XHR0aGF0Ll9vbmNsb3NlKCk7XG5cdFx0XHRpZih0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQpIHsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKTsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDt9XG5cdFx0fSk7XG5cblx0XHRzb2NrLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRpZih0aGF0Ll9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKSByZXR1cm47XG5cdFx0XHR0aGF0Ll9vbmVycm9yKGVycm9yKTtcblx0XHR9KTtcblxuXHRcdHNvY2sub24oJ3RpbWVvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdFx0XHRpZih0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQpIHsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKTsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDt9XG5cdFx0fSlcblxuXHRcdHNvY2sub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihtZXNzYWdlKSB7IHRoYXQuX29ubWVzc2FnZShtZXNzYWdlKTsgfSk7XG5cblx0XHRyZXR1cm4gdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG5cdH0pO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5iRG9udFJlY29ubmVjdCA9IHRydWU7XG5cdHJldHVybiB0aGlzLmNsb3NlKCk7XG59O1xuXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuX3N0b3BQaW5nUmVzcG9uc2UoKTtcblx0aWYodGhpcy5fc29ja2V0SGFuZGxlcikgcmV0dXJuIHRoaXMuX3NvY2tldEhhbmRsZXIuY2xvc2UoKTtcblx0ZWxzZSByZXR1cm4gUSgpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuICh0aGlzLl9zb2NrZXRIYW5kbGVyICYmIHRoaXMuX3NvY2tldEhhbmRsZXIuaXNDb25uZWN0ZWQoKSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIHRpbWVvdXQsIG9wdGlvbnMpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cblx0aWYocGFyYW1zLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcblx0XHR2YXIgX3BhcmFtcyA9IHBhcmFtcy5zcGxpdChcIi5cIik7XG5cdFx0aWYoX3BhcmFtcy5sZW5ndGghPTIpIHRocm93ICdNYWxmb3JtZWRSZXF1ZXN0Jztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0aWYoIXBhcmFtcy5zZXJ2aWNlKSB7XG5cdFx0TG9nZ2VyLmVycm9yKCdObyBzZXJ2aWNlIGRlZmluZWQgZm9yIHJlcXVlc3QgIScpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShwYXJhbXMsIFwiUmVxdWVzdFwiKTtcblx0dGhpcy5fYXBwZW5kTWVzc2FnZShtZXNzYWdlLCBjYWxsYmFjayk7XG5cdGlmKHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsID0gb3B0aW9ucy5jYWxsYmFja19wYXJ0aWFsO1xuXHRtZXNzYWdlLm9wdGlvbnMgPSBvcHRpb25zO1xuXG5cdGlmKCFpc05hTih0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCl7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGhhbmRsZXIgPSB0aGF0Ll9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdFx0aWYoaGFuZGxlcikgdGhhdC5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgJ1RpbWVvdXQgZXhjZWVkZWQgKCcrdGltZW91dCsnbXMpICEnKTtcblx0XHR9LCB0aW1lb3V0KTtcblx0fVxuXG5cdGlmKCF0aGlzLl9zZW5kKG1lc3NhZ2UpKXtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBzZW5kIHJlcXVlc3QgIScpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2spe1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHRpZighcGFyYW1zLnNlcnZpY2Upe1xuXHRcdExvZ2dlci5lcnJvcignTm8gc2VydmljZSBkZWZpbmVkIGZvciBzdWJzY3JpcHRpb24gIScpO1xuXHRcdHJldHVybiAtMTtcblx0fVxuXG5cdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShwYXJhbXMsIFwiU3Vic2NyaXB0aW9uXCIpO1xuXHR0aGlzLl9hcHBlbmRNZXNzYWdlKG1lc3NhZ2UsIGNhbGxiYWNrKTtcblxuXHRpZighdGhpcy5fc2VuZChtZXNzYWdlKSl7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHRMb2dnZXIuZXJyb3IoJ0Nhbm5vdCBzZW5kIHN1YnNjcmlwdGlvbiAhJyk7XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0cmV0dXJuIG1lc3NhZ2UuaWQ7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJJZCl7XG5cdGlmKHRoaXMuX3BlbmRpbmdNZXNzYWdlc1tzdWJJZF0gJiYgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW3N1YklkXS50eXBlID09PSBcIlN1YnNjcmlwdGlvblwiKXtcblx0XHR2YXIgc3Vic2NyaXB0aW9uID0gdGhpcy5fcmVtb3ZlTWVzc2FnZShzdWJJZCk7XG5cblx0XHR2YXIgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2Uoe1xuXHRcdFx0dGFyZ2V0OiBzdWJzY3JpcHRpb24udGFyZ2V0LFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRzdWJJZDogc3ViSWRcblx0XHRcdH1cblx0XHR9LCBcIlVuc3Vic2NyaWJlXCIpO1xuXG5cdFx0aWYoIXRoaXMuX3NlbmQobWVzc2FnZSkpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKCdDYW5ub3Qgc2VuZCB1bnN1YnNjcmliZSAhJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLyBJbnRlcm5hbCBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLl9hcHBlbmRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgY2FsbGJhY2spe1xuXHR0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZS5pZF0gPSB7XG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdHR5cGU6IG1lc3NhZ2UudHlwZSxcblx0XHR0YXJnZXQ6IG1lc3NhZ2UudGFyZ2V0XG5cdH07XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3JlbW92ZU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlSWQpe1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlSWRdO1xuXHRpZihoYW5kbGVyKXtcblx0XHRkZWxldGUgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdFx0cmV0dXJuIGhhbmRsZXI7XG5cdH1lbHNle1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2NsZWFyTWVzc2FnZXMgPSBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRmb3IodmFyIG1lc3NhZ2VJZCBpbiB0aGlzLl9wZW5kaW5nTWVzc2FnZXMpe1xuXHRcdHZhciBoYW5kbGVyID0gdGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlSWQpO1xuXHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsIGVyciwgZGF0YSk7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY2xlYXJQZWVycyA9IGZ1bmN0aW9uKCl7XG5cdHdoaWxlKHRoaXMuX3BlZXJzLmxlbmd0aCkgdGhpcy5lbWl0KCdwZWVyLWRpc2Nvbm5lY3RlZCcsIHRoaXMuX3BlZXJzLnBvcCgpKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fZ2V0TWVzc2FnZUhhbmRsZXIgPSBmdW5jdGlvbihtZXNzYWdlSWQpe1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlSWRdO1xuXHRyZXR1cm4gaGFuZGxlciA/IGhhbmRsZXIgOiBudWxsO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9ub3RpZnlMaXN0ZW5lciA9IGZ1bmN0aW9uKGhhbmRsZXIsIGVycm9yLCBkYXRhKXtcblx0aWYoaGFuZGxlciAmJiB0eXBlb2YgaGFuZGxlci5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGVycm9yID0gZXJyb3IgPyBlcnJvciA6IG51bGw7XG5cdFx0ZGF0YSA9IGRhdGEgPyBkYXRhIDogbnVsbDtcblx0XHR0cnkge1xuXHRcdFx0aGFuZGxlci5jYWxsYmFjayhlcnJvciwgZGF0YSk7XG5cdFx0fSBjYXRjaChlKSB7IGNvbnNvbGUubG9nKCdbRXJyb3IgaW4gUmVxdWVzdCBjYWxsYmFja10gJyArIGUuc3RhY2sgPyBlLnN0YWNrIDogZSk7fVxuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0cmV0dXJuIHRoaXMuX3NvY2tldEhhbmRsZXIgJiYgdGhpcy5fc29ja2V0SGFuZGxlci5zZW5kKG1lc3NhZ2UpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zZXR1cFBpbmdSZXNwb25zZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLl9waW5nVGltZW91dCA9IDE1MDAwO1xuXHR0aGlzLl9sYXN0UGluZyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG5cdGZ1bmN0aW9uIGNoZWNrUGluZygpe1xuXHRcdHZhciBjdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0aWYoY3VyVGltZSAtIHRoYXQuX2xhc3RQaW5nID4gdGhhdC5fcGluZ1RpbWVvdXQpe1xuXHRcdFx0dGhhdC5fZm9yY2VDbG9zZSgpO1xuXHRcdFx0TG9nZ2VyLmxvZyhcImQxOiAgdGltZWQgb3V0ICFcIik7XG5cdFx0fWVsc2V7XG5cdFx0XHRMb2dnZXIubG9nKFwiZDE6IGxhc3QgcGluZyBva1wiKTtcblx0XHRcdHRoYXQuX3BpbmdTZXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGNoZWNrUGluZywgTWF0aC5yb3VuZCh0aGF0Ll9waW5nVGltZW91dCAvIDIuMSkpO1xuXHRcdH1cblx0fVxuXG5cdGNoZWNrUGluZygpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zdG9wUGluZ1Jlc3BvbnNlID0gZnVuY3Rpb24oKXtcblx0Y2xlYXJUaW1lb3V0KHRoaXMuX3BpbmdTZXRUaW1lb3V0SWQpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9mb3JjZUNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc29ja2V0SGFuZGxlci5jbG9zZSgpO1xuXHR0aGlzLl9vbmNsb3NlKCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8gU29ja2V0IGV2ZW50IGhhbmRsZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0aWYoaXNOYU4obWVzc2FnZS5pZCkpIHJldHVybiB0aGlzLl9oYW5kbGVJbnRlcm5hbE1lc3NhZ2UobWVzc2FnZSk7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIobWVzc2FnZS5pZCk7XG5cdGlmKCFoYW5kbGVyKSByZXR1cm47XG5cdHN3aXRjaChoYW5kbGVyLnR5cGUpe1xuXHRcdGNhc2UgXCJSZXF1ZXN0XCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVSZXF1ZXN0KGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlN1YnNjcmlwdGlvblwiOlxuXHRcdFx0dGhpcy5faGFuZGxlU3Vic2NyaXB0aW9uKGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25vcGVuaW5nID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZW1pdCgnb3BlbmluZycsIHRoaXMpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbmVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcblx0dGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcihlcnJvcikpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbmNsb3NpbmcgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5lbWl0KCdjbG9zaW5nJywgdGhpcyk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX29uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5fY2xlYXJNZXNzYWdlcygnUGVlckRpc2Nvbm5lY3RlZCcpO1xuXHR0aGlzLl9jbGVhclBlZXJzKCk7XG5cblx0aWYoIXRoaXMuYkRvbnRSZWNvbm5lY3QpIHtcblx0XHRMb2dnZXIubG9nKCdkMTogY29ubmVjdGlvbiBsb3N0LCB0cnkgcmVjb25uZWN0aW5nJyk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dGhhdC5jb25uZWN0KHRoYXQuX2FkZHIsIHRoYXQuX1dTb2NrZXQpLmNhdGNoKGZ1bmN0aW9uKGVycil7fSk7XG5cdFx0fSwgdGhhdC5fcmVjb25uZWN0VGltZW91dCk7XG5cdH1cdFxuXHR0aGlzLmVtaXQoJ2Nsb3NlJywgdGhpcy5fYWRkcik7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8gUHJvdG9jb2wgZXZlbnQgaGFuZGxlcnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlSW50ZXJuYWxNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdHN3aXRjaChtZXNzYWdlLnR5cGUpe1xuXHRcdGNhc2UgXCJQZWVyQ29ubmVjdGVkXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVQZWVyQ29ubmVjdGVkKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlBlZXJEaXNjb25uZWN0ZWRcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVBlZXJEaXNjb25uZWN0ZWQobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiSGFuZHNoYWtlXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVIYW5kc2hha2UobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiUGluZ1wiOlxuXHRcdFx0dGhpcy5faGFuZGxlUGluZyhtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVBpbmcgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0bWVzc2FnZS50eXBlID0gXCJQb25nXCI7XG5cdHRoaXMuX2xhc3RQaW5nID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdHRoaXMuX3NlbmQobWVzc2FnZSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZUhhbmRzaGFrZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXG5cdGlmKG1lc3NhZ2UucGVlcnMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgbWVzc2FnZS5zZWxmICE9PSAnc3RyaW5nJyl7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTWlzc2luZyBhcmd1bWVudHMgZm9yIEhhbmRzaGFrZSBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblxuXHR0aGlzLl9zZWxmID0gbWVzc2FnZS5zZWxmO1xuXG5cdGZvcih2YXIgaT0wO2k8bWVzc2FnZS5wZWVycy5sZW5ndGg7IGkrKyl7XG5cdFx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJzW2ldKTtcblx0XHR0aGlzLmVtaXQoJ3BlZXItY29ubmVjdGVkJywgbWVzc2FnZS5wZWVyc1tpXSk7XG5cdH1cblxuXHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucmVzb2x2ZSh0aGlzLnNlbGYoKSk7XG5cdHRoaXMuZW1pdCgnb3BlbicsIHRoaXMuX2FkZHIpO1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckNvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckNvbm5lY3RlZCBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9BZGQgcGVlciB0byB0aGUgbGlzdCBvZiByZWFjaGFibGUgcGVlcnNcblx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJJZCk7XG5cblx0dGhpcy5lbWl0KCdwZWVyLWNvbm5lY3RlZCcsIG1lc3NhZ2UucGVlcklkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckRpc2Nvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckRpc2Nvbm5lY3RlZCBNZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9HbyB0aHJvdWdoIGFsbCBwZW5kaW5nIG1lc3NhZ2VzIGFuZCBub3RpZnkgdGhlIG9uZXMgdGhhdCBhcmUgdGFyZ2V0ZWRcblx0Ly9hdCB0aGUgZGlzY29ubmVjdGVkIHBlZXIgdGhhdCBpdCBkaXNjb25uZWN0ZWQgYW5kIHRoZXJlZm9yZSB0aGUgY29tbWFuZFxuXHQvL2Nhbm5vdCBiZSBmdWxmaWxsZWRcblx0Zm9yKHZhciBtZXNzYWdlSWQgaW4gdGhpcy5fcGVuZGluZ01lc3NhZ2VzKXtcblx0XHR2YXIgaGFuZGxlciA9IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKG1lc3NhZ2VJZCk7XG5cdFx0aWYoaGFuZGxlciAmJiBoYW5kbGVyLnRhcmdldCA9PT0gbWVzc2FnZS5wZWVySWQpIHtcblx0XHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZUlkKTtcblx0XHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsICdQZWVyRGlzY29ubmVjdGVkJywgbnVsbCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9SZW1vdmUgcGVlciBmcm9tIGxpc3Qgb2YgcmVhY2hhYmxlIHBlZXJzXG5cdGZvcih2YXIgaT10aGlzLl9wZWVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG5cdFx0aWYodGhpcy5fcGVlcnNbaV0gPT09IG1lc3NhZ2UucGVlcklkKXtcblx0XHRcdHRoaXMuX3BlZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRoaXMuZW1pdCgncGVlci1kaXNjb25uZWN0ZWQnLCBtZXNzYWdlLnBlZXJJZCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVJlcXVlc3QgPSBmdW5jdGlvbihoYW5kbGVyLCBtZXNzYWdlKXtcblx0aWYobWVzc2FnZS50eXBlID09PSAnUGFydGlhbEFuc3dlcicpIHtcblx0XHRpZih0eXBlb2YgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHZhciBlcnJvciA9IG1lc3NhZ2UuZXJyb3IgPyBtZXNzYWdlLmVycm9yIDogbnVsbDtcblx0XHRcdHZhciBkYXRhID0gbWVzc2FnZS5kYXRhID8gbWVzc2FnZS5kYXRhIDogbnVsbDtcblx0XHRcdHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsKGVycm9yLCBkYXRhKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEpO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKGhhbmRsZXIsIG1lc3NhZ2Upe1xuXHQvL3JlbW92ZSBzdWJzY3JpcHRpb24gaWYgaXQgd2FzIGNsb3NlZCBmcm9tIG5vZGVcblx0aWYobWVzc2FnZS5yZXN1bHQgPT09IFwiY2xvc2VkXCIpIHtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdG1lc3NhZ2UuZXJyb3IgPSAnU3Vic2NyaXB0aW9uQ2xvc2VkJztcblx0fVxuXHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEgPyBtZXNzYWdlLmRhdGEgOiBudWxsKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU29ja2V0SGFuZGxlciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBTb2NrZXRIYW5kbGVyKFdTb2NrZXQsIGFkZHIsIHRpbWVvdXQpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmFkZHIgPSBhZGRyO1xuXG5cdGlmKFdTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSBXU29ja2V0O1xuXHRlbHNlIGlmKCF0aGlzLl9XU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gd2luZG93LldlYlNvY2tldDtcblx0V1NvY2tldCA9IHRoaXMuX1dTb2NrZXQ7XG5cblx0dGhpcy5fc3RhdHVzID0gJ29wZW5pbmcnO1xuXG5cdHRyeSB7XG5cdFx0dGhpcy5fc29ja2V0ID0gYWRkci5pbmRleE9mKFwid3NzOi8vXCIpPT09MCA/IG5ldyBXU29ja2V0KGFkZHIsIHVuZGVmaW5lZCwge3JlamVjdFVuYXV0aG9yaXplZDpmYWxzZX0pIDogbmV3IFdTb2NrZXQoYWRkcik7XG5cblx0XHR0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2sgPSB0aGlzLl9vbm9wZW4uYmluZCh0aGlzKTtcblx0XHR0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrID0gdGhpcy5fb25jbG9zZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayA9IHRoaXMuX29ubWVzc2FnZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldEVycm9yQ2FsbGJhY2sgPSB0aGlzLl9vbmVycm9yLmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJyx0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fc29ja2V0RXJyb3JDYWxsYmFjayk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBlcnJvciA6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0dGhhdC5fc29ja2V0LmNsb3NlKCk7XG5cdFx0fSk7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgPT09ICdvcGVuZWQnKSByZXR1cm47XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgIT09ICdjbG9zZWQnKXtcblx0XHRcdFx0TG9nZ2VyLmxvZygnZDE6ICcgKyB0aGF0LmFkZHIgKyAnIHRpbWVkIG91dCB3aGlsZSBjb25uZWN0aW5nJyk7XG5cdFx0XHRcdHRoYXQuY2xvc2UoKTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lb3V0JywgdGhhdC5fc29ja2V0KTtcblx0XHRcdH1cblx0XHR9LCB0aW1lb3V0KTtcblxuXHR9IGNhdGNoKGUpIHtcblx0XHRMb2dnZXIuZXJyb3IoZS5zdGFjayk7XG5cdFx0dGhhdC5jbG9zZSgpO1xuXHRcdHRocm93IGU7XG5cdH1cbn07XG5pbmhlcml0cyhTb2NrZXRIYW5kbGVyLCBFdmVudEVtaXR0ZXIpO1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpIHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpO1xuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2luZyc7XG5cdHRoaXMuZW1pdCgnY2xvc2luZycsIHRoaXMuX3NvY2tldCk7XG5cdGlmKHRoaXMuX3NvY2tldCkgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG5cdHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdHRyeSB7XG5cdFx0dmFyIGRhdGEgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcblx0fSBjYXRjaChlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3Qgc2VyaWFsaXplIG1lc3NhZ2UnKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR0cnkge1xuXHRcdHRoaXMuX3NvY2tldC5zZW5kKGRhdGEpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlbmQgbWVzc2FnZScpO1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3NvY2tldC5yZWFkeVN0YXRlID09IHRoaXMuX1dTb2NrZXQuT1BFTiAmJiB0aGlzLl9zdGF0dXMgPT09ICdvcGVuZWQnO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuX29ub3BlbiA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5lbWl0KCdvcGVuJywgdGhpcy5fc29ja2V0KTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHR0aGlzLnVucmVnaXN0ZXJDYWxsYmFja3MoKTtcblx0dGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX3NvY2tldCk7XG5cdGlmKHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSkgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnJlc29sdmUoKTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihldnQpIHtcblx0dHJ5IHtcblx0XHR2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpO1xuXHRcdHRoaXMuZW1pdCgnbWVzc2FnZScsIG1lc3NhZ2UpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBjYW5ub3QgcGFyc2UgbWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0dGhyb3cgZXJyO1xuXHR9XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25lcnJvciA9IGZ1bmN0aW9uKGV2dCkge1xuXHR0aGlzLmVtaXQoJ2Vycm9yJywgZXZ0KTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLnVucmVnaXN0ZXJDYWxsYmFja3MgPSBmdW5jdGlvbigpIHtcblx0aWYodGhpcy5fc29ja2V0ICYmICh0eXBlb2YgdGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpKXtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgdGhpcy5fc29ja2V0Q2xvc2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLl9zb2NrZXRNZXNzYWdlQ2FsbGJhY2spO1xuXHR9IGVsc2UgaWYodGhpcy5fc29ja2V0ICYmICh0eXBlb2YgdGhpcy5fc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykpe1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2NyZWF0ZU1lc3NhZ2UgPSBmdW5jdGlvbihwYXJhbXMsIHR5cGUpe1xuXHRpZighcGFyYW1zIHx8ICF0eXBlIHx8ICh0eXBlICE9PSBcIlJlcXVlc3RcIiAmJiB0eXBlICE9PSBcIlN1YnNjcmlwdGlvblwiICYmIHR5cGUgIT09IFwiVW5zdWJzY3JpYmVcIikpe1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR0eXBlOiB0eXBlLFxuXHRcdGlkOiB0aGlzLl9nZW5lcmF0ZUlkKCksXG5cdFx0c2VydmljZTogcGFyYW1zLnNlcnZpY2UsXG5cdFx0dGFyZ2V0OiBwYXJhbXMudGFyZ2V0LFxuXHRcdGZ1bmM6IHBhcmFtcy5mdW5jLFxuXHRcdG9iajogcGFyYW1zLm9iaixcblx0XHRkYXRhOiBwYXJhbXMuZGF0YVxuXHR9O1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9nZW5lcmF0ZUlkID0gZnVuY3Rpb24oKXtcblx0dmFyIGlkID0gdGhpcy5fbmV4dElkO1xuXHR0aGlzLl9uZXh0SWQrKztcblx0cmV0dXJuIGlkO1xufTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGl5YU5vZGU7XG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cblxudmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbnZhciBEaXlhTm9kZSA9IHJlcXVpcmUoJy4vRGl5YU5vZGUnKTtcblxudmFyIElQX1JFR0VYID0gL14oMjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLigyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pXFwuKDI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPylcXC4oMjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KSQvO1xuXG4vLy8vLy8vLy8vLy8vL1xuLy8gIEQxIEFQSSAgLy9cbi8vLy8vLy8vLy8vLy8vXG5cblxuXG5mdW5jdGlvbiBuZXdJbnN0YW5jZSAoKSB7XG5cblx0dmFyIGNvbm5lY3Rpb24gPSBuZXcgRGl5YU5vZGUoKTtcblxuXHR2YXIgZDFpbnN0ID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cdFx0cmV0dXJuIG5ldyBEaXlhU2VsZWN0b3Ioc2VsZWN0b3IsIGNvbm5lY3Rpb24pO1xuXHR9XG5cblx0ZDFpbnN0LkRpeWFOb2RlID0gRGl5YU5vZGU7XG5cdGQxaW5zdC5EaXlhU2VsZWN0b3IgPSBEaXlhU2VsZWN0b3I7XG5cblx0ZDFpbnN0LmNvbm5lY3QgPSBmdW5jdGlvbihhZGRyLCBXU29ja2V0KXtcblx0XHRyZXR1cm4gY29ubmVjdGlvbi5jb25uZWN0KGFkZHIsIFdTb2NrZXQpO1xuXHR9O1xuXG5cdGQxaW5zdC5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gY29ubmVjdGlvbi5kaXNjb25uZWN0KCk7XG5cdH07XG5cblx0ZDFpbnN0LmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKSB7XHRyZXR1cm4gY29ubmVjdGlvbi5pc0Nvbm5lY3RlZCgpO307XG5cdGQxaW5zdC5wZWVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5wZWVycygpO307XG5cdGQxaW5zdC5zZWxmID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLnNlbGYoKTsgfTtcblx0ZDFpbnN0LmFkZHIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24uYWRkcigpOyB9O1xuXHRkMWluc3QudXNlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi51c2VyKCk7IH07XG5cdGQxaW5zdC5wYXNzID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLnBhc3MoKTsgfTtcblx0ZDFpbnN0LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKCk7IH07XG5cblx0ZDFpbnN0LnBhcnNlUGVlciA9IGZ1bmN0aW9uKGFkZHJTdHIpIHtcblx0XHR2YXIgcGVlciA9IHt9O1xuXG5cdFx0Ly8gPG5vdGhpbmc+IC0+IHdzczovL2xvY2FsaG9zdC9hcGlcblx0XHRpZighYWRkclN0ciB8fCBhZGRyU3RyID09PSBcIlwiKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzczovL2xvY2FsaG9zdC9hcGlcIjtcblx0XHRcdHBlZXIuYWRkck5ldCA9IFwid3NzOi8vbG9jYWxob3N0L25ldFwiO1xuXHRcdH1cblx0XHQvLyAxMjM0IC0+IHdzOi8vbG9jYWxob3N0OjEyMzRcblx0XHRlbHNlIGlmKC9eWzAtOV0qJC8udGVzdChhZGRyU3RyKSkge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3czovL2xvY2FsaG9zdDpcIithZGRyU3RyO1xuXHRcdH1cblx0XHQvLyAxMC40Mi4wLjEgLT4gd3NzOi8vMTAuNDIuMC4xL2FwaVxuXHRcdC8vICAgICAgICAgIC0+IHdzczovLzEwLjI0LjAuMS9uZXRcblx0XHRlbHNlIGlmIChJUF9SRUdFWC50ZXN0KGFkZHJTdHIpKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzczovL1wiK2FkZHJTdHIrXCIvYXBpXCI7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL1wiK2FkZHJTdHIrXCIvbmV0XCI7XG5cdFx0fVxuXHRcdC8vIDEwLjQyLjAuMToxMjM0IC0+IHdzOi8vMTAuNDIuMC4xOjEyMzRcblx0ICAgICAgIFx0ZWxzZSBpZiAoSVBfUkVHRVgudGVzdChhZGRyU3RyLnNwbGl0KCc6JylbMF0pICYmIC9eWzAtOV0qJC8udGVzdChhZGRyU3RyLnNwbGl0KCc6JylbMV0pKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzOi8vXCIrYWRkclN0cjtcblx0XHR9XG5cdFx0Ly8gd3NzOi8vc29tZWFkZHJlc3MuY29tL3N0dWZmIC0+IHdzczovL3NvbWVhZGRyZXNzLmNvbS9zdHVmZlxuXHRcdC8vIHdzOi8vc29tZWFkZHJlc3MuY29tL3N0dWZmIC0+IHdzOi8vc29tZWFkZHJlc3MuY29tL3N0dWZmXG5cdFx0ZWxzZSBpZiAoYWRkclN0ci5pbmRleE9mKFwid3NzOi8vXCIpID09PSAwIHx8IGFkZHJTdHIuaW5kZXhPZihcIndzOi8vXCIpID09PSAwKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBhZGRyU3RyO1xuXHRcdH1cblx0XHQvLyBzb21lZG9tYWluL3NvbWVzaXRlIC0+IFwid3NzOi8vc29tZWRvbWFpbi9zb21lc2l0ZS9hcGlcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgIC0+IFwid3NzOi8vc29tZWRvbWFpbi9zb21lc2l0ZS9uZXRcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgIC0+IHNvbWVzaXRlXG5cdFx0ZWxzZSBpZihhZGRyU3RyLnNwbGl0KCcvJykubGVuZ3RoID09PSAyKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzczovL1wiICsgYWRkclN0ciArICcvYXBpJztcblx0XHRcdHBlZXIuYWRkck5ldCA9IFwid3NzOi8vXCIgKyBhZGRyU3RyICsgJy9uZXQnO1xuXHRcdFx0cGVlci5uYW1lID0gYWRkclN0ci5zcGxpdCgnLycpWzFdO1xuXHRcdH1cblx0XHQvLyBzb21lZG9tYWluL3NvbWVzaXRlL2FwaSAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvYXBpXCJcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICAgICAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvbmV0XCJcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICAgICAtPiBzb21lc2l0ZVxuXHRcdGVsc2UgaWYoYWRkclN0ci5zcGxpdCgnLycpLmxlbmd0aCA9PT0gMyAmJiBhZGRyU3RyLnNwbGl0KCcvJylbMl0gPT09IFwiYXBpXCIpIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3NzOi8vXCIrYWRkclN0cjtcblx0XHRcdHBlZXIuYWRkck5ldCA9IFwid3NzOi8vXCIrYWRkclN0ci5zdWJzdHIoMCwgYWRkclN0ci5sZW5ndGggLSA0KTtcblx0XHRcdHBlZXIubmFtZSA9IGFkZHJTdHIuc3BsaXQoJy8nKVsxXTtcblx0XHR9XG5cdFx0Ly8gc29tZXNpdGUgLT4gXCJ3c3M6Ly9wYXJ0bmVyaW5nLWNsb3VkLmNvbS9zb21lc2l0ZS9hcGlcIlxuXHRcdC8vICAgICAgICAgIC0+IFwid3NzOi8vcGFydG5lcmluZy1jbG91ZC5jb20vc29tZXNpdGUvbmV0XCJcblx0XHQvLyAgICAgICAgICAtPiBzb21lc2l0ZVxuXHRcdGVsc2Uge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9wYXJ0bmVyaW5nLWNsb3VkLmNvbS9cIithZGRyU3RyK1wiL2FwaVwiO1xuXHRcdFx0cGVlci5hZGRyTmV0ID0gXCJ3c3M6Ly9wYXJ0bmVyaW5nLWNsb3VkLmNvbS9cIithZGRyU3RyK1wiL25ldFwiO1xuXHRcdFx0cGVlci5uYW1lID0gYWRkclN0cjtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGVlcjtcblx0fTtcblxuXG5cdC8qKiBUcnkgdG8gY29ubmVjdCB0byB0aGUgZ2l2ZW4gc2VydmVycyBsaXN0IGluIHRoZSBsaXN0IG9yZGVyLCB1bnRpbCBmaW5kaW5nIGFuIGF2YWlsYWJsZSBvbmUgKi9cblx0ZDFpbnN0LnRyeUNvbm5lY3QgPSBmdW5jdGlvbihzZXJ2ZXJzLCBXU29ja2V0KXtcblx0XHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdFx0ZnVuY3Rpb24gdGMoaSkge1xuXHRcdFx0ZDFpbnN0LmNvbm5lY3Qoc2VydmVyc1tpXSwgV1NvY2tldCkudGhlbihmdW5jdGlvbihlKXtcblx0XHRcdFx0cmV0dXJuIGRlZmVycmVkLnJlc29sdmUoc2VydmVyc1tpXSk7XG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbihlKXtcblx0XHRcdFx0ZDFpbnN0LmRpc2Nvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRpZihpPHNlcnZlcnMubGVuZ3RoKSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge3RjKGkpO30sIDEwMCk7XG5cdFx0XHRcdFx0ZWxzZSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KFwiVGltZW91dFwiKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGMoMCk7XG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRkMWluc3QuY3VycmVudFNlcnZlciA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGNvbm5lY3Rpb24uX2FkZHI7XG5cdH07XG5cblx0ZDFpbnN0Lm9uID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKXtcblx0XHRjb25uZWN0aW9uLm9uKGV2ZW50LCBjYWxsYmFjayk7XG5cdFx0cmV0dXJuIGQxaW5zdDtcblx0fTtcblxuXHRkMWluc3QucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuXHRcdGNvbm5lY3Rpb24ucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTtcblx0XHRyZXR1cm4gZDFpbnN0O1xuXHR9O1xuXG5cdC8qKiBTaG9ydGhhbmQgZnVuY3Rpb24gdG8gY29ubmVjdCBhbmQgbG9naW4gd2l0aCB0aGUgZ2l2ZW4gKHVzZXIscGFzc3dvcmQpICovXG5cdGQxaW5zdC5jb25uZWN0QXNVc2VyID0gZnVuY3Rpb24oaXAsIHVzZXIsIHBhc3N3b3JkLCBXU29ja2V0KSB7XG5cdFx0cmV0dXJuIGQxaW5zdC5jb25uZWN0KGlwLCBXU29ja2V0KS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gZDFpbnN0KFwiI3NlbGZcIikuYXV0aCh1c2VyLCBwYXNzd29yZCk7XG5cdFx0fSk7XG5cdH07XG5cblx0ZDFpbnN0LmRlYXV0aGVudGljYXRlID0gZnVuY3Rpb24oKXsgY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKGZhbHNlKTsgY29ubmVjdGlvbi51c2VyKG51bGwpOyBjb25uZWN0aW9uLnBhc3MobnVsbCk7fTtcblx0ZDFpbnN0LnNldFNlY3VyZWQgPSBmdW5jdGlvbihiU2VjdXJlZCkgeyBjb25uZWN0aW9uLnNldFNlY3VyZWQoYlNlY3VyZWQpOyB9O1xuXHRkMWluc3QuaXNTZWN1cmVkID0gZnVuY3Rpb24oKSB7cmV0dXJuIGNvbm5lY3Rpb24uX3NlY3VyZWQ7IH1cblx0ZDFpbnN0LnNldFdTb2NrZXQgPSBmdW5jdGlvbihXU29ja2V0KSB7IGNvbm5lY3Rpb24uc2V0V1NvY2tldChXU29ja2V0KTsgfVxuXG5cblx0LyoqIFNlbGYtYXV0aGVudGljYXRlIHRoZSBsb2NhbCBEaXlhTm9kZSBib3VuZCB0byBwb3J0IDxwb3J0PiwgdXNpbmcgaXRzIFJTQSBzaWduYXR1cmUgKi9cblx0ZDFpbnN0LnNlbGZDb25uZWN0ID0gZnVuY3Rpb24ocG9ydCwgc2lnbmF0dXJlLCBXU29ja2V0KSB7XG5cdFx0cmV0dXJuIGQxaW5zdC5jb25uZWN0KCd3czovL2xvY2FsaG9zdDonICsgcG9ydCwgV1NvY2tldClcblx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0XHRcdGQxaW5zdChcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0XHRzZXJ2aWNlOiAncGVlckF1dGgnLFxuXHRcdFx0XHRmdW5jOiAnU2VsZkF1dGhlbnRpY2F0ZScsXG5cdFx0XHRcdGRhdGE6IHtcdHNpZ25hdHVyZTogc2lnbmF0dXJlIH1cblx0XHRcdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHRcdGlmKGRhdGEgJiYgZGF0YS5hdXRoZW50aWNhdGVkKXtcblx0XHRcdFx0XHRjb25uZWN0aW9uLmF1dGhlbnRpY2F0ZWQodHJ1ZSk7XG5cdFx0XHRcdFx0Y29ubmVjdGlvbi51c2VyKFwiI0RpeWFOb2RlI1wiK3BlZXJJZCk7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbm5lY3Rpb24uYXV0aGVudGljYXRlZChmYWxzZSk7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KCdBY2Nlc3NEZW5pZWQnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBkMWluc3Q7XG59XG5cbnZhciBkMSA9IG5ld0luc3RhbmNlKCk7XG5kMS5uZXdJbnN0YW5jZSA9IG5ld0luc3RhbmNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBEaXlhU2VsZWN0b3IgLy9cbi8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBEaXlhU2VsZWN0b3Ioc2VsZWN0b3IsIGNvbm5lY3Rpb24pe1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuXHR0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcblx0dGhpcy5fc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0dGhpcy5fbGlzdGVuZXJDb3VudCA9IDA7XG5cdHRoaXMuX2xpc3RlbkNhbGxiYWNrID0gbnVsbDtcblx0dGhpcy5fY2FsbGJhY2tBdHRhY2hlZCA9IGZhbHNlO1xufVxuaW5oZXJpdHMoRGl5YVNlbGVjdG9yLCBFdmVudEVtaXR0ZXIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gUHVibGljIEFQSSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3NlbGVjdCgpOyB9O1xuXG5cblxuLyoqXG4gKiBBcHBseSBjYWxsYmFjayBjYiB0byBlYWNoIHNlbGVjdGVkIHBlZXIuIFBlZXJzIGFyZSBzZWxlY3RlZFxuICogYWNjb3JkaW5nIHRvIHRoZSBydWxlICdzZWxlY3RvcicgZ2l2ZW4gdG8gY29uc3RydWN0b3IuIFNlbGVjdG9yIGNhblxuICogYmUgYSBwZWVySWQsIGEgcmVnRXggZm9yIHBlZXJJZHMgb2YgYW4gYXJyYXkgb2YgcGVlcklkcy5cbiAqIEBwYXJhbXMgXHRjYlx0XHRjYWxsYmFjayB0byBiZSBhcHBsaWVkXG4gKiBAcmV0dXJuIFx0dGhpcyBcdDxEaXlhU2VsZWN0b3I+XG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGNiKXtcblx0dmFyIHBlZXJzID0gdGhpcy5fc2VsZWN0KCk7XG5cdGZvcih2YXIgaT0wOyBpPHBlZXJzLmxlbmd0aDsgaSsrKSBjYi5iaW5kKHRoaXMpKHBlZXJzW2ldKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgcmVxdWVzdCB0byBzZWxlY3RlZCBwZWVycyAoIHNlZSBlYWNoKCkgKSB0aHJvdWdoIHRoZSBjdXJyZW50IGNvbm5lY3Rpb24gKERpeWFOb2RlKS5cbiAqIEBwYXJhbSB7U3RyaW5nIHwgT2JqZWN0fSBwYXJhbXMgOiBjYW4gYmUgc2VydmljZS5mdW5jdGlvbiBvciB7c2VydmljZTpzZXJ2aWNlLCBmdW5jOmZ1bmN0aW9uLCAuLi59XG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIHRpbWVvdXQsIG9wdGlvbnMpe1xuXHRpZighdGhpcy5fY29ubmVjdGlvbikgcmV0dXJuIHRoaXM7XG5cdGlmKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkUmVxdWVzdCc7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdHZhciBuYkFuc3dlcnMgPSAwO1xuXHR2YXIgbmJFeHBlY3RlZCA9IHRoaXMuX3NlbGVjdCgpLmxlbmd0aDtcblx0aWYgKG5iRXhwZWN0ZWQgPT09IDAgJiYgb3B0aW9ucy5iTm90aWZ5V2hlbkZpbmlzaGVkKSBjYWxsYmFjayhudWxsLCBudWxsLCBcIiMjRU5EIyNcIik7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24ocGVlcklkKXtcblx0XHRwYXJhbXMudGFyZ2V0ID0gcGVlcklkO1xuXG5cdFx0dmFyIG9wdHMgPSB7fTtcblx0XHRmb3IodmFyIGkgaW4gb3B0aW9ucykgb3B0c1tpXSA9IG9wdGlvbnNbaV07XG5cdFx0aWYodHlwZW9mIG9wdHMuY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykgb3B0cy5jYWxsYmFja19wYXJ0aWFsID0gZnVuY3Rpb24oZXJyLCBkYXRhKXsgb3B0aW9ucy5jYWxsYmFja19wYXJ0aWFsKHBlZXJJZCwgZXJyLCBkYXRhKTt9XG5cblx0XHR0aGlzLl9jb25uZWN0aW9uLnJlcXVlc3QocGFyYW1zLCBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7XG5cdFx0XHRuYkFuc3dlcnMrKztcblx0XHRcdGlmKG5iQW5zd2VycyA9PSBuYkV4cGVjdGVkICYmIG9wdGlvbnMuYk5vdGlmeVdoZW5GaW5pc2hlZCkgY2FsbGJhY2sobnVsbCwgZXJyLCBcIiMjRU5EIyNcIik7IC8vIFRPRE8gOiBGaW5kIGEgYmV0dGVyIHdheSB0byBub3RpZnkgcmVxdWVzdCBFTkQgISFcblx0XHR9LCB0aW1lb3V0LCBvcHRzKTtcblx0fSk7XG59O1xuXG5cbi8vIElNUE9SVEFOVCAhISEgQnkgMzAvMTEvMTUsIHRoaXMgbWV0aG9kIGRvZXNuJ3QgcmV0dXJuICd0aGlzJyBhbnltb3JlLCBidXQgYSBTdWJzY3JpcHRpb24gb2JqZWN0IGluc3RlYWRcbi8qIEBwYXJhbSB7U3RyaW5nIHwgT2JqZWN0fSBwYXJhbXMgOiBjYW4gYmUgJ3NlcnZpY2UuZnVuY3Rpb24nIG9yIHtzZXJ2aWNlOnNlcnZpY2UsIGZ1bmM6ZnVuY3Rpb24sIC4uLn0gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucyl7XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkU3Vic2NyaXB0aW9uJztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0cmV0dXJuIG5ldyBTdWJzY3JpcHRpb24odGhpcywgcGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucyk7XG59O1xuXG5cbi8vIElNUE9SVEFOVCAhISEgQlkgMzAvMTEvMTUsIHRoaXMgbWV0aG9kIGRvZXNuJ3QgdGFrZSBzdWJJZHMgYXMgaW5wdXQgYW55bW9yZS5cbi8vIFBsZWFzZSBwcm92aWRlIGEgc3Vic2NyaXB0aW9uIGluc3RlYWQgIVxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbil7XG5cdGlmKEFycmF5LmlzQXJyYXkoc3Vic2NyaXB0aW9uKSB8fCAhc3Vic2NyaXB0aW9uLmNsb3NlKSByZXR1cm4gdGhpcy5fX29sZF9kZXByZWNhdGVkX3Vuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbik7XG5cdHJldHVybiBzdWJzY3JpcHRpb24uY2xvc2UoKTtcbn07XG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3N3b3JkLCBjYWxsYmFjaywgdGltZW91dCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhpcyk7XG5cblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ2F1dGgnLFxuXHRcdGZ1bmM6ICdBdXRoZW50aWNhdGUnLFxuXHRcdGRhdGE6IHtcblx0XHRcdHVzZXI6IHVzZXIsIC8vIERFUFJFQ0FURUQsIGtlcHQgZm9yIG5vdyBmb3IgYmFja3dhcmQgY29tcGF0aWJsaXR5ICh3aWxsIGJlIGRyb3BwZWQpXG5cdFx0XHR1c2VybmFtZTogdXNlciwgLy8gTmV3IHN5bnRheCBzaW5jZSBzd2l0Y2hpbmcgdG8gREJ1c1xuXHRcdFx0cGFzc3dvcmQ6IHBhc3N3b3JkXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cblx0XHRpZihlcnIgPT09ICdTZXJ2aWNlTm90Rm91bmQnKXtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCB0cnVlKTtcblx0XHRcdGVsc2UgZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdC8vIGRhdGEuYXV0aGVudGljYXRlZCBpcyBERVBSRUNBVEVELCBrZXB0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG5cdFx0aWYoIWVyciAmJiBkYXRhICYmIChkYXRhID09PSB0cnVlIHx8IGRhdGEuYXV0aGVudGljYXRlZCA9PT0gdHJ1ZSkpe1xuXHRcdFx0dGhhdC5fY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKHRydWUpO1xuXHRcdFx0dGhhdC5fY29ubmVjdGlvbi51c2VyKHVzZXIpO1xuXHRcdFx0dGhhdC5fY29ubmVjdGlvbi5wYXNzKHBhc3N3b3JkKTtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCB0cnVlKTtcblx0XHRcdGVsc2UgZGVmZXJyZWQucmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGF0Ll9jb25uZWN0aW9uLmF1dGhlbnRpY2F0ZWQoZmFsc2UpO1xuXHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhwZWVySWQsIGZhbHNlKTtcblx0XHRcdGVsc2UgZGVmZXJyZWQucmVqZWN0KCdBY2Nlc3NEZW5pZWQnKTtcblx0XHR9XG5cblx0fSwgdGltZW91dCk7XG5cblx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5cblxuLy8gUHJpdmF0ZXNcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fc2VsZWN0ID0gZnVuY3Rpb24oc2VsZWN0b3JGdW5jdGlvbil7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHRpZighdGhpcy5fY29ubmVjdGlvbikgcmV0dXJuIFtdO1xuXHRyZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5wZWVycygpLmZpbHRlcihmdW5jdGlvbihwZWVySWQpe1xuXHRcdHJldHVybiB0aGF0Ll9tYXRjaCh0aGF0Ll9zZWxlY3RvciwgcGVlcklkKTtcblx0fSk7XG59O1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLl9tYXRjaCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBzdHIpe1xuXHRpZighc2VsZWN0b3IpIHJldHVybiBmYWxzZTtcblx0aWYoc2VsZWN0b3IgPT09IFwiI3NlbGZcIikgeyByZXR1cm4gdGhpcy5fY29ubmVjdGlvbiAmJiBzdHIgPT09IHRoaXMuX2Nvbm5lY3Rpb24uc2VsZigpOyB9XG5cdGVsc2UgaWYoc2VsZWN0b3Iubm90KSByZXR1cm4gIXRoaXMuX21hdGNoKHNlbGVjdG9yLm5vdCwgc3RyKTtcblx0ZWxzZSBpZihzZWxlY3Rvci5jb25zdHJ1Y3Rvci5uYW1lID09PSAnU3RyaW5nJyl7XG5cdFx0cmV0dXJuIG1hdGNoU3RyaW5nKHNlbGVjdG9yLCBzdHIpO1xuXHR9IGVsc2UgaWYoc2VsZWN0b3IuY29uc3RydWN0b3IubmFtZSA9PT0gJ1JlZ0V4cCcpe1xuXHRcdHJldHVybiBtYXRjaFJlZ0V4cChzZWxlY3Rvciwgc3RyKTtcblx0fSBlbHNlIGlmKEFycmF5LmlzQXJyYXkoc2VsZWN0b3IpKXtcblx0XHRyZXR1cm4gbWF0Y2hBcnJheShzZWxlY3Rvciwgc3RyKTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG1hdGNoU3RyaW5nKHNlbGVjdG9yLCBzdHIpe1xuXHRyZXR1cm4gc2VsZWN0b3IgPT09IHN0cjtcbn1cblxuZnVuY3Rpb24gbWF0Y2hSZWdFeHAoc2VsZWN0b3IsIHN0cil7XG5cdHJldHVybiBzdHIubWF0Y2goc2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBtYXRjaEFycmF5KHNlbGVjdG9yLCBzdHIpe1xuXHRmb3IodmFyIGk9MDtpPHNlbGVjdG9yLmxlbmd0aDsgaSsrKXtcblx0XHRpZihzZWxlY3RvcltpXSA9PT0gc3RyKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbi8vIE92ZXJyaWRlcyBFdmVudEVtaXR0ZXIncyBiZWhhdmlvciB0byBwcm94eSBhbmQgZmlsdGVyIGV2ZW50cyBmcm9tIHRoZSBjb25uZWN0aW9uXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLl9vbiA9IERpeWFTZWxlY3Rvci5wcm90b3R5cGUub247XG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlciA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHRcdGlmKHRoYXQuX21hdGNoKHRoYXQuX3NlbGVjdG9yLCBwZWVySWQpKSB0aGF0LmVtaXQodHlwZSwgcGVlcklkKTtcblx0fTtcblx0dGhpcy5fY29ubmVjdGlvbi5vbih0eXBlLCBjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpO1xuXHR2YXIgcmV0ID0gdGhpcy5fb24odHlwZSwgY2FsbGJhY2spO1xuXG5cdC8vIEhhbmRsZSB0aGUgc3BlY2lmaWMgY2FzZSBvZiBcInBlZXItY29ubmVjdGVkXCIgZXZlbnRzLCBpLmUuLCBub3RpZnkgb2YgYWxyZWFkeSBjb25uZWN0ZWQgcGVlcnNcblx0aWYodHlwZSA9PT0gJ3BlZXItY29ubmVjdGVkJyAmJiB0aGlzLl9jb25uZWN0aW9uLmlzQ29ubmVjdGVkKCkpIHtcblx0XHR2YXIgcGVlcnMgPSB0aGlzLl9jb25uZWN0aW9uLnBlZXJzKCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxwZWVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYodGhpcy5fbWF0Y2godGhpcy5fc2VsZWN0b3IsIHBlZXJzW2ldKSkgY2FsbGJhY2socGVlcnNbaV0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmV0O1xufTtcblxuXG4vLyBPdmVycmlkZXMgRXZlbnRFbWl0dGVyJ3MgYmVoYXZpb3IgdG8gcHJveHkgYW5kIGZpbHRlciBldmVudHMgZnJvbSB0aGUgY29ubmVjdGlvblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fcmVtb3ZlTGlzdGVuZXIgPSBEaXlhU2VsZWN0b3IucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKSB7XG5cdGlmKGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlcikgdGhpcy5fY29ubmVjdGlvbi5yZW1vdmVMaXN0ZW5lcih0eXBlLCBjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpO1xuXHR0aGlzLl9yZW1vdmVMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBTVUJTQ1JJUFRJT04gLy9cbi8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8qKlxuKiBIYW5kbGVzIGEgc3Vic2NyaXB0aW9uIHRvIHNvbWUgRGl5YU5vZGUgc2VydmljZSBmb3IgbXVsdGlwbGUgbm9kZXNcbiogYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBzZWxlY3RvclxuKi9cbmZ1bmN0aW9uIFN1YnNjcmlwdGlvbihzZWxlY3RvciwgcGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucykge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cdFx0dGhpcy5wYXJhbXMgPSBwYXJhbXM7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0dGhpcy5zdWJJZHMgPSBbXTtcblxuXHRcdHRoaXMuZG9TdWJzY3JpYmUgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0XHRcdHRoYXQuc3ViSWRzLnB1c2godGhhdC5fYWRkU3Vic2NyaXB0aW9uKHBlZXJJZCkpO1xuXHRcdFx0dGhhdC5zdGF0ZSA9IFwib3BlblwiO1xuXHRcdH07XG5cblx0XHRpZih0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmF1dG8pIHtcblx0XHRcdHRoaXMuc2VsZWN0b3Iub24oJ3BlZXItY29ubmVjdGVkJywgdGhpcy5kb1N1YnNjcmliZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2VsZWN0b3IuZWFjaCh0aGlzLmRvU3Vic2NyaWJlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcbn07XG5cblN1YnNjcmlwdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0Zm9yKHZhciBpID0gMDsgaTx0aGlzLnN1Yklkcy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMuc2VsZWN0b3IuX2Nvbm5lY3Rpb24udW5zdWJzY3JpYmUodGhpcy5zdWJJZHNbaV0pO1xuXHR9XG5cdHRoaXMuc3ViSWRzID0gW107XG5cdHRoaXMuc2VsZWN0b3IucmVtb3ZlTGlzdGVuZXIoJ3BlZXItY29ubmVjdGVkJywgdGhpcy5kb1N1YnNjcmliZSk7XG5cdHRoaXMuc3RhdGUgPSBcImNsb3NlZFwiO1xufTtcblxuU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5fYWRkU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0cGFyYW1zID0ge307XG5cdGZvcih2YXIgayBpbiB0aGlzLnBhcmFtcykgcGFyYW1zW2tdID0gdGhpcy5wYXJhbXNba107XG5cdHBhcmFtcy50YXJnZXQgPSBwZWVySWQ7XG5cdHZhciBzdWJJZCA9IHRoaXMuc2VsZWN0b3IuX2Nvbm5lY3Rpb24uc3Vic2NyaWJlKHBhcmFtcywgZnVuY3Rpb24oZXJyLCBkYXRhKXtcblx0XHR0aGF0LmNhbGxiYWNrKHBlZXJJZCwgZXJyLCBkYXRhKTtcblx0fSk7XG5cdGlmKHRoaXMub3B0aW9ucyAmJiBBcnJheS5pc0FycmF5KHRoaXMub3B0aW9ucy5zdWJJZHMpKVxuXHRcdHRoaXMub3B0aW9ucy5zdWJJZHNbcGVlcklkXSA9IHN1YklkO1xuXHRyZXR1cm4gc3ViSWQ7XG59O1xuXG5cblxuXG5cbi8vIExlZ2FjeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbi8qKiBAZGVwcmVjYXRlZCAgKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oKXt9O1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLl9fb2xkX2RlcHJlY2F0ZWRfdW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJJZHMpIHtcblx0dGhpcy5lYWNoKGZ1bmN0aW9uKHBlZXJJZCl7XG5cdFx0dmFyIHN1YklkID0gc3ViSWRzW3BlZXJJZF07XG5cdFx0aWYoc3ViSWQpIHRoaXMuX2Nvbm5lY3Rpb24udW5zdWJzY3JpYmUoc3ViSWQpO1xuXHR9KTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGQxO1xuIiwiLypcbiAqIENvcHlyaWdodCA6IFBhcnRuZXJpbmcgMy4wICgyMDA3LTIwMTYpXG4gKiBBdXRob3IgOiBTeWx2YWluIE1haMOpIDxzeWx2YWluLm1haGVAcGFydG5lcmluZy5mcj5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBkaXlhLXNkay5cbiAqXG4gKiBkaXlhLXNkayBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBkaXlhLXNkayBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBkaXlhLXNkay4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5cblxuXG5cbnZhciBkMSA9IHJlcXVpcmUoJy4vRGl5YVNlbGVjdG9yLmpzJyk7XG5cbi8vIHJlcXVpcmUoJy4vc2VydmljZXMvdGltZXIvdGltZXIuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvcnRjL3J0Yy5qcycpO1xuLy9yZXF1aXJlKCcuL3NlcnZpY2VzL2V4cGxvcmVyL2V4cGxvcmVyLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvcGljby9waWNvLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvdmlld2VyX2V4cGxvcmVyL3ZpZXdlcl9leHBsb3Jlci5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9pZXEvaWVxLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvbmV0d29ya0lkL05ldHdvcmtJZC5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9tYXBzL21hcHMuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvcGVlckF1dGgvUGVlckF1dGguanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvbWVzaE5ldHdvcmsvTWVzaE5ldHdvcmsuanMnKTtcbi8vcmVxdWlyZSgnLi9zZXJ2aWNlcy92ZXJib3NlL1ZlcmJvc2UuanMnKTtcbnJlcXVpcmUoJy4vdXRpbHMvZW5jb2RpbmcvZW5jb2RpbmcuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvc3RhdHVzL3N0YXR1cy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGQxO1xuIiwiLypcbiAqIENvcHlyaWdodCA6IFBhcnRuZXJpbmcgMy4wICgyMDA3LTIwMTYpXG4gKiBBdXRob3IgOiBTeWx2YWluIE1haMOpIDxzeWx2YWluLm1haGVAcGFydG5lcmluZy5mcj5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBkaXlhLXNkay5cbiAqXG4gKiBkaXlhLXNkayBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBkaXlhLXNkayBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBkaXlhLXNkay4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5cblxuXG5cbi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAgIFRvZG8gOlxuICAgY2hlY2sgZXJyIGZvciBlYWNoIGRhdGFcbiAgIGltcHJvdmUgQVBJIDogZ2V0RGF0YShzZW5zb3JOYW1lLCBkYXRhQ29uZmlnKVxuICAgdXBkYXRlRGF0YShzZW5zb3JOYW1lLCBkYXRhQ29uZmlnKVxuICAgc2V0IGFuZCBnZXQgZm9yIHRoZSBkaWZmZXJlbnQgZGF0YUNvbmZpZyBwYXJhbXNcblxuKi9cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gdHJ1ZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLyoqXG4gKiBJRVEgQVBJIGhhbmRsZXJcbiAqL1xuZnVuY3Rpb24gSUVRKHNlbGVjdG9yKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cdHRoaXMuZGF0YU1vZGVsPXt9O1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbi8vXHR0aGF0LnN1YnNjcmlwdGlvbkVycm9yTnVtID0gMDtcblxuXHQvKioqIHN0cnVjdHVyZSBvZiBkYXRhIGNvbmZpZyAqKipcblx0XHQgY3JpdGVyaWEgOlxuXHRcdCAgIHRpbWU6IGFsbCAzIHRpbWUgY3JpdGVyaWEgc2hvdWxkIG5vdCBiZSBkZWZpbmVkIGF0IHRoZSBzYW1lIHRpbWUuIChyYW5nZSB3b3VsZCBiZSBnaXZlbiB1cClcblx0XHQgICAgIHN0YXJ0OiB7W251bGxdLHRpbWV9IChudWxsIG1lYW5zIG1vc3QgcmVjZW50KSAvLyBzdG9yZWQgYSBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIGVuZDoge1tudWxsXSwgdGltZX0gKG51bGwgbWVhbnMgbW9zdCBvbGRlc3QpIC8vIHN0b3JlZCBhcyBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIHJhbmdlOiB7W251bGxdLCB0aW1lfSAocmFuZ2Ugb2YgdGltZShwb3NpdGl2ZSkgKSAvLyBpbiBzIChudW0pXG5cdFx0ICAgcm9ib3Q6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgICBwbGFjZToge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCBvcGVyYXRvcjoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfSAtKCBtYXliZSBtb3kgc2hvdWxkIGJlIGRlZmF1bHRcblx0XHQgLi4uXG5cblx0XHQgc2Vuc29ycyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTZW5zb3JOYW1lfVxuXG5cdFx0IHNhbXBsaW5nOiB7W251bGxdIG9yIGludH1cblx0Ki9cblx0dGhpcy5kYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7XG5cdFx0XHRcdHN0YXJ0OiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbCxcblx0XHRcdHBsYWNlOiBudWxsXG5cdFx0fSxcblx0XHRvcGVyYXRvcjogJ2xhc3QnLFxuXHRcdHNlbnNvcnM6IG51bGwsXG5cdFx0c2FtcGxpbmc6IG51bGwgLy9zYW1wbGluZ1xuXHR9O1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDpcbiAqIHtcbiAqXHRcInNlbnNldXJYWFwiOiB7XG4gKlx0XHRcdGRhdGE6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRwbGFjZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHF1YWxpdHlJbmRleDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJhbmdlOiBbRkxPQVQsIEZMT0FUXSxcbiAqXHRcdFx0dW5pdDogc3RyaW5nLFxuICpcdFx0bGFiZWw6IHN0cmluZ1xuICpcdFx0fSxcbiAqXHQgLi4uIChcInNlbnNldXJzWVlcIilcbiAqIH1cbiAqL1xuSUVRLnByb3RvdHlwZS5nZXREYXRhTW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59O1xuSUVRLnByb3RvdHlwZS5nZXREYXRhUmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwucmFuZ2U7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tSUVRXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtJRVF9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuSUVRLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBzdGFydCBhbmQgZW5kLlxuICogSWYgcGFyYW0gZGVmaW5lZFxuICpcdEBwYXJhbSB7RGF0ZX0gbmV3VGltZVN0YXJ0IC8vIG1heSBiZSBudWxsXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lRW5kIC8vIG1heSBiZSBudWxsXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBJZiBubyBwYXJhbSBkZWZpbmVkOlxuICpcdEByZXR1cm4ge09iamVjdH0gVGltZSBvYmplY3Q6IGZpZWxkcyBzdGFydCBhbmQgZW5kLlxuICovXG5JRVEucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZVN0YXJ0LG5ld1RpbWVFbmQsIG5ld1JhbmdlKXtcblx0aWYobmV3VGltZVN0YXJ0IHx8IG5ld1RpbWVFbmQgfHwgbmV3UmFuZ2UpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5zdGFydCA9IG5ld1RpbWVTdGFydC5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuZW5kID0gbmV3VGltZUVuZC5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UgPSBuZXdSYW5nZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0OiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5zdGFydCksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzXG4gKiBTZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSBwbGFjZUlkcyBsaXN0IG9mIHBsYWNlIElkc1xuICogR2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2YgcGxhY2UgSWRzXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YVBsYWNlSWRzID0gZnVuY3Rpb24ocGxhY2VJZHMpe1xuXHRpZihwbGFjZUlkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZUlkID0gcGxhY2VJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2U7XG59O1xuLyoqXG4gKiBHZXQgZGF0YSBieSBzZW5zb3IgbmFtZS5cbiAqXHRAcGFyYW0ge0FycmF5W1N0cmluZ119IHNlbnNvck5hbWUgbGlzdCBvZiBzZW5zb3JzXG4gKi9cblxuXG5cbklFUS5wcm90b3R5cGUuZ2V0RGF0YUJ5TmFtZSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzKXtcblx0dmFyIGRhdGE9W107XG5cdGZvcih2YXIgbiBpbiBzZW5zb3JOYW1lcykge1xuXHRcdGRhdGEucHVzaCh0aGlzLmRhdGFNb2RlbFtzZW5zb3JOYW1lc1tuXV0pO1xuXHR9XG5cdHJldHVybiBkYXRhO1xufTtcbi8qKlxuICogVXBkYXRlIGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cblxuXG5cblxuXG5cbklFUS5wcm90b3R5cGUudXBkYXRlRGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblxuXHRpZihkYXRhQ29uZmlnKVxuXHRcdHRoaXMuRGF0YUNvbmZpZyhkYXRhQ29uZmlnKTtcblx0Ly8gY29uc29sZS5sb2coXCJSZXF1ZXN0OiBcIitKU09OLnN0cmluZ2lmeShkYXRhQ29uZmlnKSk7XG5cdHRoaXMuc2VsZWN0b3IucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJpZXFcIixcblx0XHRmdW5jOiBcIkRhdGFSZXF1ZXN0XCIsXG5cdFx0ZGF0YToge1xuXHRcdFx0dHlwZTpcInNwbFJlcVwiLFxuXHRcdFx0ZGF0YUNvbmZpZzogdGhhdC5kYXRhQ29uZmlnXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1wiK3RoYXQuZGF0YUNvbmZpZy5zZW5zb3JzK1wiXSBSZWN2IGVycjogXCIrSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJVcGRhdGVEYXRhOlxcblwiK0pTT04uc3RyaW5naWZ5KGRhdGEuaGVhZGVyLmRhdGFDb25maWcpKTtcblx0XHRcdExvZ2dlci5lcnJvcihcIkRhdGEgcmVxdWVzdCBmYWlsZWQgKFwiK2RhdGEuaGVhZGVyLmVycm9yLnN0K1wiKTogXCIrZGF0YS5oZWFkZXIuZXJyb3IubXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHQvLyBMb2dnZXIubG9nKHRoYXQuZ2V0RGF0YU1vZGVsKCkpO1xuXG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoYXQpOyAvLyBiaW5kIGNhbGxiYWNrIHdpdGggSUVRXG5cdFx0Y2FsbGJhY2sodGhhdC5nZXREYXRhTW9kZWwoKSk7IC8vIGNhbGxiYWNrIGZ1bmNcblx0fSk7XG59O1xuXG5JRVEucHJvdG90eXBlLl9pc0RhdGFNb2RlbFdpdGhOYU4gPSBmdW5jdGlvbigpIHtcblx0dmFyIGRhdGFNb2RlbE5hTj1mYWxzZTtcblx0dmFyIHNlbnNvck5hbjtcblx0Zm9yKHZhciBuIGluIHRoaXMuZGF0YU1vZGVsKSB7XG5cdFx0c2Vuc29yTmFuID0gdGhpcy5kYXRhTW9kZWxbbl0uZGF0YS5yZWR1Y2UoZnVuY3Rpb24obmFuUHJlcyxkKSB7XG5cdFx0XHRyZXR1cm4gbmFuUHJlcyAmJiBpc05hTihkKTtcblx0XHR9LGZhbHNlKTtcblx0XHRkYXRhTW9kZWxOYU4gPSBkYXRhTW9kZWxOYU4gJiYgc2Vuc29yTmFuO1xuXHRcdExvZ2dlci5sb2cobitcIiB3aXRoIG5hbiA6IFwiK3NlbnNvck5hbitcIiAoXCIrZGF0YU1vZGVsTmFOK1wiKSAvIFwiK3RoaXMuZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoKTtcblx0fVxufTtcblxuSUVRLnByb3RvdHlwZS5nZXRDb25maW5lbWVudExldmVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuY29uZmluZW1lbnQ7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEFpclF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmFpclF1YWxpdHk7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEVudlF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmVudlF1YWxpdHk7XG59O1xuXG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIGRhdGEgdG8gY29uZmlndXJlIHN1YnNjcmlwdGlvblxuICogQHBhcmFtICBjYWxsYmFjayBjYWxsZWQgb24gYW5zd2VycyAoQHBhcmFtIDogZGF0YU1vZGVsKVxuICovXG5JRVEucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24oY29uZmlnLCBjYWxsYmFjayl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvKiogZGVmYXVsdCAqKi9cblx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXHRjb25maWcudGltZVJhbmdlID0gY29uZmlnLnRpbWVSYW5nZSAgfHwgJ2hvdXJzJztcblx0Y29uZmlnLmNhdCA9IGNvbmZpZy5jYXQgfHwgJ2llcSc7IC8qIGNhdGVnb3J5ICovXG5cblx0dmFyIHN1YnMgPSB0aGlzLnNlbGVjdG9yLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogXCJpZXFcIixcblx0XHRmdW5jOiBcIkRhdGFcIixcblx0XHRkYXRhOiBjb25maWcsXG5cdFx0b2JqOiBjb25maWcuY2F0IC8qIHByb3ZpZGUgY2F0ZWdvcnkgb2Ygc2Vuc29yIHRvIGJlIHdhdGNoZWQsIGZpbHRlcmVkIGFjY29yZGluZyB0byBDUk0gKi9cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIldhdGNoSUVRUmVjdkVycjpcIitKU09OLnN0cmluZ2lmeShlcnIpKTtcblx0XHRcdHRoYXQuY2xvc2VTdWJzY3JpcHRpb25zKCk7IC8vIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5XG5cdFx0XHR0aGF0LnN1YnNjcmlwdGlvblJlcVBlcmlvZCA9IHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kKzEwMDB8fDEwMDA7IC8vIGluY3JlYXNlIGRlbGF5IGJ5IDEgc2VjXG5cdFx0XHRpZih0aGF0LnN1YnNjcmlwdGlvblJlcVBlcmlvZCA+IDMwMDAwMCkgdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2Q9MzAwMDAwOyAvLyBtYXggNW1pblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcdHRoYXQud2F0Y2goY29uZmlnLGNhbGxiYWNrKTsgfSwgdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2QpOyAvLyB0cnkgYWdhaW4gbGF0ZXJcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2Q9MDsgLy8gcmVzZXQgcGVyaW9kIG9uIHN1YnNjcmlwdGlvbiByZXF1ZXN0c1xuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJXYXRjaElFUTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5kYXRhQ29uZmlnKSk7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJEYXRhIHJlcXVlc3QgZmFpbGVkIChcIitkYXRhLmhlYWRlci5lcnJvci5zdCtcIik6IFwiK2RhdGEuaGVhZGVyLmVycm9yLm1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHQvL1x0Y29uc29sZS5sb2coJ3dhdGNoJyk7XG5cdC8vXHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHR0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcbi8vXHRcdHRoYXQuc3Vic2NyaXB0aW9uRXJyb3IgPSAwOyAvLyByZXNldCBlcnJvciBjb3VudGVyXG5cblx0XHRjYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhhdCk7IC8vIGJpbmQgY2FsbGJhY2sgd2l0aCBJRVFcblx0XHRjYWxsYmFjayh0aGF0LmdldERhdGFNb2RlbCgpKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHR9KTtcblxuXHR0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChzdWJzKTtcbn07XG5cbi8qKlxuICogQ2xvc2UgYWxsIHN1YnNjcmlwdGlvbnNcbiAqL1xuSUVRLnByb3RvdHlwZS5jbG9zZVN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbigpe1xuXHRmb3IodmFyIGkgaW4gdGhpcy5zdWJzY3JpcHRpb25zKSB7XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zW2ldLmNsb3NlKCk7XG5cdH1cblx0dGhpcy5zdWJzY3JpcHRpb25zID1bXTtcbn07XG5cbi8qKlxuICogcmVxdWVzdCBEYXRhIHRvIG1ha2UgQ1NWIGZpbGVcbiAqL1xuSUVRLnByb3RvdHlwZS5nZXRDU1ZEYXRhID0gZnVuY3Rpb24oc2Vuc29yTmFtZXMsX2ZpcnN0RGF5LGNhbGxiYWNrKXtcblx0dmFyIGZpcnN0RGF5ID0gbmV3IERhdGUoX2ZpcnN0RGF5KTtcblx0dmFyIGRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHsgc3RhcnQ6IGZpcnN0RGF5LmdldFRpbWUoKSwgcmFuZ2VVbml0OiAnaG91cicsIHJhbmdlOiAxODB9LCAvLyAzNjBoIC0+IDE1ZCAvLyAxODBoIC0+IDdqXG5cdFx0XHRwbGFjZXM6IFtdLFxuXHRcdFx0cm9ib3RzOiBbXVxuXHRcdH0sXG5cdFx0c2Vuc29yczogc2Vuc29yTmFtZXNcblx0fTtcblx0dGhpcy51cGRhdGVEYXRhKGNhbGxiYWNrLCBkYXRhQ29uZmlnKTtcbn07XG5cblxuSUVRLnByb3RvdHlwZS5nZXRIZWF0TWFwRGF0YSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzLHRpbWUsIHNhbXBsZSwgY2FsbGJhY2spe1xuXHQvL3ZhciBzdGFydFBhcnNlID0gbmV3IERhdGUoc3RhcnRFcG9jaCk7XG5cdC8vdmFyIGVuZFBhcnNlID0gbmV3IERhdGUoZW5kRXBvY2gpO1xuXHRpZiAoIXNhbXBsZSkgc2FtcGxlPSdtaW51dGUnO1xuXHR2YXIgZGF0YUNvbmZpZyA9IHtcblx0XHRjcml0ZXJpYToge1xuXHRcdFx0dGltZToge3N0YXJ0OiB0aW1lLnN0YXJ0RXBvY2gsIGVuZDogdGltZS5lbmRFcG9jaCwgc2FtcGxpbmc6IHNhbXBsZX0sIC8vIDM2MGggLT4gMTVkIC8vIDE4MGggLT4gN2pcblx0XHRcdHBsYWNlczogW10sXG5cdFx0XHRyb2JvdHM6IFtdXG5cdFx0fSxcblx0XHRzZW5zb3JzOiBzZW5zb3JOYW1lc1xuXHR9O1xuXHR0aGlzLnVwZGF0ZURhdGEoY2FsbGJhY2ssIGRhdGFDb25maWcpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cbklFUS5wcm90b3R5cGUuX2dldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9bnVsbDtcbi8vXHRjb25zb2xlLmxvZygnZ2V0RGF0YU1vZGVsJyk7XG4vL1x0Y29uc29sZS5sb2coZGF0YSk7XG5cblx0aWYoZGF0YS5lcnIgJiYgZGF0YS5lcnIuc3Q+MCkge1xuXHRcdExvZ2dlci5lcnJvcihkYXRhLmVyci5tc2cpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGRlbGV0ZSBkYXRhLmVycjtcblx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlcikge1xuXHRcdGZvciAodmFyIG4gaW4gZGF0YSkge1xuXHRcdFx0aWYobiAhPSBcImhlYWRlclwiICYmIG4gIT0gXCJlcnJcIikge1xuXG5cdFx0XHRcdGlmKGRhdGFbbl0uZXJyICYmIGRhdGFbbl0uZXJyLnN0PjApIHtcblx0XHRcdFx0XHRMb2dnZXIuZXJyb3IobitcIiB3YXMgaW4gZXJyb3I6IFwiK2RhdGFbbl0uZXJyLm1zZyk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighZGF0YU1vZGVsKVxuXHRcdFx0XHRcdGRhdGFNb2RlbD17fTtcblxuXHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGFic29sdXRlIHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZVJhbmdlPWRhdGFbbl0udGltZVJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBsYWJlbCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdW5pdCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHByZWNpc2lvbiAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucHJlY2lzaW9uPWRhdGFbbl0ucHJlY2lzaW9uO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBjYXRlZ29yaWVzICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5jYXRlZ29yeT1kYXRhW25dLmNhdGVnb3J5O1xuXHRcdFx0XHQvKiBzdWdnZXN0ZWQgeSBkaXNwbGF5IHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS56b29tUmFuZ2UgPSBbMCwgMTAwXTtcblx0XHRcdFx0Ly8gdXBkYXRlIHNlbnNvciBjb25mb3J0IHJhbmdlXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5jb25mb3J0UmFuZ2UgPSBkYXRhW25dLmNvbmZvcnRSYW5nZTtcblxuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBpbmRleFJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5Q29uZmlnPXtcblx0XHRcdFx0XHQvKiBjb25mb3J0UmFuZ2U6IGRhdGFbbl0uY29uZm9ydFJhbmdlLCAqL1xuXHRcdFx0XHRcdGluZGV4UmFuZ2U6IGRhdGFbbl0uaW5kZXhSYW5nZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZSA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS50aW1lLCdiNjQnLDgpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IChkYXRhW25dLmRhdGE/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmRhdGEsJ2I2NCcsNCk6KGRhdGFbbl0uYXZnP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5hdmcuZCwnYjY0Jyw0KTpudWxsKSk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5SW5kZXggPSAoZGF0YVtuXS5kYXRhP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5pbmRleCwnYjY0Jyw0KTooZGF0YVtuXS5hdmc/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpOm51bGwpKTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnJvYm90SWQgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ucm9ib3RJZCwnYjY0Jyw0KTtcblx0XHRcdFx0aWYoZGF0YU1vZGVsW25dLnJvYm90SWQpIHtcblx0XHRcdFx0XHQvKiogZGljbyByb2JvdElkIC0+IHJvYm90TmFtZSAqKi9cblx0XHRcdFx0XHR2YXIgZGljb1JvYm90ID0ge307XG5cdFx0XHRcdFx0ZGF0YS5oZWFkZXIucm9ib3RzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcblx0XHRcdFx0XHRcdGRpY29Sb2JvdFtlbC5pZF09ZWwubmFtZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ucm9ib3RJZCA9IGRhdGFNb2RlbFtuXS5yb2JvdElkLm1hcChmdW5jdGlvbihlbCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGRpY29Sb2JvdFtlbF07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucGxhY2VJZCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5wbGFjZUlkLCdiNjQnLDQpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IG51bGw7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS55ID0gbnVsbDtcblxuXHRcdFx0XHRpZihkYXRhW25dLmF2Zylcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uYXZnID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5taW4pXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLm1pbiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ubWF4KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5tYXggPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLnN0ZGRldilcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uc3RkZGV2ID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5zdGRkZXYpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnN0ZGRldiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ueClcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS54LCdiNjQnLDQpO1xuXHRcdFx0XHRpZihkYXRhW25dLnkpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnkgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ueSwnYjY0Jyw0KTtcblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIGN1cnJlbnQgcXVhbGl0eSA6IHsnYidhZCwgJ20nZWRpdW0sICdnJ29vZH1cblx0XHRcdFx0ICogZXZvbHV0aW9uIDogeyd1J3AsICdkJ293biwgJ3MndGFibGV9XG5cdFx0XHRcdCAqIGV2b2x1dGlvbiBxdWFsaXR5IDogeydiJ2V0dGVyLCAndydvcnNlLCAncydhbWV9XG5cdFx0XHRcdCAqL1xuXHRcdFx0XHQvLy8gVE9ET1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udHJlbmQgPSAnbXNzJztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSB7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTm8gRGF0YSB0byByZWFkIG9yIGhlYWRlciBpcyBtaXNzaW5nICFcIik7XG5cdH1cblx0LyoqIGxpc3Qgcm9ib3RzICoqL1xuLy9cdGRhdGFNb2RlbC5yb2JvdHMgPSBbe25hbWU6ICdEMlIyJywgaWQ6MX1dO1xuXHR0aGlzLmRhdGFNb2RlbD1kYXRhTW9kZWw7XG5cdHJldHVybiBkYXRhTW9kZWw7XG59O1xuXG5cblxuXG5cbi8qKiBjcmVhdGUgSUVRIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLklFUSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgSUVRKHRoaXMpO1xufTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcblxuZnVuY3Rpb24gTE9HKG1zZyl7XG5cdC8vY29uc29sZS5sb2cobXNnKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSBtYXAge1N0cmluZ30gbWFwJ3MgbmFtZVxuICovXG5mdW5jdGlvbiBNYXBzKHBlZXJJZHMpIHtcblxuXG5cdHRoaXMuX3BlZXJJZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBlZXJJZHMpKTtcblx0dGhpcy5fc3ViSWRzID0ge307IC8vIGxpc3Qgb2Ygc3Vic2NyaXB0aW9uIElkIChmb3IgdW5zdWJzY3JpcHRpb24gcHVycG9zZSkgZS5nIHtwZWVySWQwOiBzdWJJZDAsIC4uLn1cblxuXHQvLyBsaXN0IG9mIHJlZ2lzdGVyZWQgcGxhY2UgYnkgRGl5YVxuXHR0aGlzLl9kaXlhcyA9IHt9O1xuXG5cdC8vIGdldCBhIGxpc3Qgb2YgRGl5YSBmcm9tIHNlbGVjdG9yIGFuZCBzb3J0IGl0XG5cdHRoaXMubGlzdERpeWEgPSB0aGlzLl9wZWVySWRzO1xufVxuaW5oZXJpdHMoTWFwcywgRXZlbnRFbWl0dGVyKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8gU3RhdGljIGZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8qKlxuICogc3RhdGljIGZ1bmN0aW9uLCBnZXQgY3VycmVudCBwbGFjZSBmcm9tIGRpeWFub2RlXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yIHtSZWdFeHAvU3RyaW5nL0FycmF5PFN0cmluZz59IHNlbGVjdG9yIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIG1hcCB7U3RyaW5nfSBtYXAncyBuYW1lXG4gKiBAcGFyYW0gZnVuYyB7ZnVuY3Rpb24oKX0gY2FsbGJhY2sgZnVuY3Rpb24gd2l0aCByZXR1cm4gcGVlcklkLCBlcnJvciBhbmQgZGF0YSAoeyBtYXBJZCwgbGFiZWwsIG5ldXJvbklkLCAgeCwgeX0pXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZ2V0Q3VycmVudFBsYWNlID0gZnVuY3Rpb24oIHBlZXJJZCwgZnVuYykge1xuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdtYXBzJyxcblx0XHRmdW5jOiAnR2V0Q3VycmVudFBsYWNlJyxcblx0XHRvYmo6IFsgcGVlcklkIF1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRmdW5jKHBlZXJJZCwgZXJyLCBkYXRhKTtcblx0fSk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vL1xuLy8vLyBJbnRlcm5hbCBmdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vXG5cbi8qKlxuICogcm91bmQgZmxvYXQgdG8gc2l4IGRlY2ltYWxzIHRvIGNvbXBhcmUsIGFzIHRoZSBudW1iZXIgaW4ganMgaXMgZW5jb2RlZCBpblxuICogSUVFRSA3NTQgc3RhbmRhcmQgfiBhcm91bmQgMTYgZGVjaW1hbCBkaWdpdHMgcHJlY2lzaW9uLCB3ZSBsaW1pdCB0byA2IGZvclxuICogZWFzaWVyIGNvbXBhcmlzaW9uIGFuZCBlcnJvciBkdWUgdG8gYXJpdGhtZXRpYyBvcGVyYXRpb25cbiAqL1xuTWFwcy5wcm90b3R5cGUuX3JvdW5kID0gZnVuY3Rpb24gKHZhbCkge1xuXHQvLyByb3VkaW5nIHRvIHNpeCBkZWNpbWFsc1xuXHRyZXR1cm4gTWF0aC5yb3VuZChwYXJzZUZsb2F0KHZhbCkgKiAxMDAwMDAwKSAvIDEwMDAwMDA7XG59O1xuXG4vKipcbiAqIGNoZWNrIGVxdWFsIHdpdGggcm91bmRpbmdcbiAqL1xuTWFwcy5wcm90b3R5cGUuX2lzRmxvYXRFcXVhbCA9IGZ1bmN0aW9uICh2YWwxLCB2YWwyKSB7XG5cdC8vIHJvdWRpbmcgdG8gdHdvIGRlY2ltYWxzXG5cdHJldHVybiB0aGlzLl9yb3VuZCh2YWwxKSA9PT0gdGhpcy5fcm91bmQodmFsMik7XG59O1xuXG4vKipcbiAqIGNoZWNrIGlmIG1hcCBpcyBtb2RpZmllZCBieSBjb21wYXJlIHdpdGggaW50ZXJuYWwgbGlzdFxuICovXG5NYXBzLnByb3RvdHlwZS5tYXBJc01vZGlmaWVkID0gZnVuY3Rpb24ocGVlcklkLCBtYXBfaW5mbykge1xuXHQvLyBkb3VibGUgY2hlY2tcblx0bWFwX2luZm8uc2NhbGUgPSBBcnJheS5pc0FycmF5KG1hcF9pbmZvLnNjYWxlKSA/IG1hcF9pbmZvLnNjYWxlWzBdIDogbWFwX2luZm8uc2NhbGVcblxuXHQvLyB1Z2x5IGNvZGUgYnV0IHF1aWNrIGNvbXBhcmUgdG8gbG9vcFxuXHRyZXR1cm4gISh0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnNjYWxlLCBtYXBfaW5mby5zY2FsZSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC5yb3RhdGUsIG1hcF9pbmZvLnJvdGF0ZSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC50cmFuc2xhdGVbMF0sIG1hcF9pbmZvLnRyYW5zbGF0ZVswXSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC50cmFuc2xhdGVbMV0sIG1hcF9pbmZvLnRyYW5zbGF0ZVsxXSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC5yYXRpbywgbWFwX2luZm8ucmF0aW8pKTtcbn1cblxuLyoqXG4gKiBjaGVjayBpZiBwbGFjZSBpcyBtb2RpZmllZCBieSBjb21wYXJlIHdpdGggaW50ZXJuYWwgbGlzdFxuICovXG5NYXBzLnByb3RvdHlwZS5wbGFjZUlzTW9kaWZpZWQgPSBmdW5jdGlvbihwZWVySWQsIHBsYWNlX2luZm8pIHtcblx0Ly8gdWdseSBjb2RlIGJ1dCBxdWljayBjb21wYXJlIHRvIGxvb3Bcblx0cmV0dXJuICEodGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW3BsYWNlX2luZm8uaWRdLngsIHBsYWNlX2luZm8ueCkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW3BsYWNlX2luZm8uaWRdLnksIHBsYWNlX2luZm8ueSkpO1xufVxuXG4vLyAvKipcbi8vICAqIGFkZCBhIERpeWEgd2hlbiBzZWxlY3RvciBjaGFuZ2VkIGFuZCBoYWQgbmV3IERpeWFcbi8vICAqXG4vLyAgKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbi8vICAqIEBwYXJhbSBjb2xvciB7ZDNfcmdifSBkMyBjb2xvclxuLy8gICovXG4vLyBNYXBzLnByb3RvdHlwZS5hZGRQZWVyID0gZnVuY3Rpb24ocGVlcklkKSB7XG4vLyBcdHRoaXMuX2RpeWFzW3BlZXJJZF0gPSB7XG4vLyBcdFx0bWFwSWQ6IG51bGwsXG4vLyBcdFx0cGF0aDogbnVsbCwgLy8ge3RyYW5zbGF0ZTogW10sIHNjYWxlOiBudWxsLCByb3RhdGU6IG51bGx9LFxuLy8gXHRcdHBsYWNlczoge30sXG4vLyBcdFx0bWFwSXNNb2RpZmllZDogZmFsc2UsXG4vLyBcdH07XG4vLyB9XG5cbi8qKlxuICogcmVtb3ZlIGEgRGl5YSB3aGVuIHRoZXJlIGlzIGEgcHJvYmxlbSBpbiBsaXN0ZW4gbWFwIChzdWJzY3JpcHRpb24pXG4gKlxuICogQHBhcmFtIHBlZXJJZCB7U3RyaW5nfSBwZWVySWQgb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKi9cbk1hcHMucHJvdG90eXBlLnJlbW92ZVBlZXIgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0aWYgKHRoaXMuX2RpeWFzW3BlZXJJZF0pIHtcblx0XHQvLyByZW1vdmVcblx0XHRkZWxldGUgdGhpcy5fZGl5YXNbcGVlcklkXTtcblx0XHR0aGlzLmVtaXQoXCJwZWVyLXVuc3Vic2NyaWJlZFwiLCBwZWVySWQpO1xuXHR9XG5cblx0Ly8gbmVjY2Vzc2FyeT8gaWYgZGl5YW5vZGUgcmVjb25uZWN0P1xuXHRpZiAodGhpcy5fc3ViSWRzW3BlZXJJZF0gIT09IG51bGwgJiYgIWlzTmFOKHRoaXMuX3N1Yklkc1twZWVySWRdKSkge1xuXHRcdC8vIGV4aXN0ZWQgc3Vic2NyaXB0aW9uID8/XG5cdFx0Ly8gdW5zdWJzY3JpYmVcblx0XHRkMShwZWVySWQpLnVuc3Vic2NyaWJlKHRoaXMuX3N1Yklkcyk7XG5cdFx0ZGVsZXRlIHRoaXMuX3N1Yklkc1twZWVySWRdO1xuXHR9XG59O1xuXG4vKipcbiAqIGNvbm5lY3QgdG8gc2VydmljZSBtYXBcbiAqL1xuTWFwcy5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIG9wdGlvbnMgZm9yIHN1YnNjcmlwdGlvblxuXHR2YXIgb3B0aW9ucyA9IHtcblx0XHRhdXRvOiB0cnVlLCAvLyBhdXRvIHJlc3Vic2NyaWJlP1xuXHRcdHN1YklkczogW10gLy8gaW4gZmFjdCwgaXQgaXMgYSBsaXN0LCBidXQgdGhlIGNvZGUgaW4gRGl5YVNlbGVjdG9yIGNoZWNrIGZvciBhcnJheVxuXHR9O1xuXG5cdC8vIHN1YnNjcmliZSBmb3IgbWFwIHNlcnZpY2Vcblx0dGhpcy5zdWJNYXAgPSBkMShcIiNzZWxmXCIpLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdGZ1bmM6ICdSb2JvdHMnLFxuXHRcdG9iajogdGhpcy5fcGVlcklkc1xuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdGlmIChlcnIgfHwgZGF0YS5lcnJvcikge1xuXHRcdFx0TE9HKFwiTWFwczogZmFpbCB0byBnZXQgaW5mbyBmcm9tIG1hcCwgZXJyb3I6XCIsIGVyciB8fCBkYXRhLmVycm9yLCBcIiFcIik7IC8vIG1vc3RseSBQZWVyRGlzY29ubmVjdGVkXG5cblx0XHRcdC8vIHJlbW92ZSB0aGF0IHBlZXJcblx0XHRcdC8vdGhhdC5yZW1vdmVQZWVyKHBlZXJJZCk7Ly8uLi5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoZGF0YSA9PSBudWxsKSByZXR1cm4gO1xuXG5cdFx0cGVlcklkID0gZGF0YS5wZWVySWQ7XG5cblx0XHRpZighcGVlcklkKXtcblx0XHRcdExPRyhcIk1hcHM6IHJlY2VpdmVkIGluZm8gd2l0aG91dCBhIHBlZXJJZFwiKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGRhdGEucGxhY2VzKSkgeyAvLyB3aW5uZXIsIHRoaXMgaXNuJ3QgMXN0IG1lc3NhZ2Vcblx0XHRcdGRhdGEucGxhY2VzID0gW107XG5cdFx0fVxuXG5cdFx0Ly8gZGF0YS5wbGFjZSBpcyBjdXJyZW50IHBsYWNlXG5cdFx0aWYgKGRhdGEucGxhY2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0ZGF0YS5wbGFjZXMucHVzaChkYXRhLnBsYWNlKTsgLy8gbWF5IGJlIG51bGwgLi4uXG5cdFx0fVxuXG5cdFx0dmFyIG1hcF9pbmZvID0gbnVsbCwgcGxhY2VzX2luZm8gPSBbXTtcblxuXHRcdGlmKGRhdGEudHlwZSA9PT0gJ01hcEluZm8nKXtcblx0XHRcdC8vIGRhdGEgOiB7aWQsIG5hbWUsIHBsYWNlcywgcm90YXRlLCBzY2FsZSwgdHgsIHR5LCByYXRpb31cblx0XHRcdGlmICh0aGF0Ll9kaXlhc1twZWVySWRdID09IG51bGwpIHtcblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXSA9IHtcblx0XHRcdFx0XHRwYXRoOiB7XG5cdFx0XHRcdFx0XHR0cmFuc2xhdGU6IFtkYXRhLnR4LCBkYXRhLnR5XSxcblx0XHRcdFx0XHRcdHNjYWxlOiBkYXRhLnNjYWxlLFxuXHRcdFx0XHRcdFx0cm90YXRlOiBkYXRhLnJvdGF0ZSxcblx0XHRcdFx0XHRcdHJhdGlvOiBkYXRhLnJhdGlvXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwbGFjZXM6IHt9XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAodGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoID09IG51bGwpIHtcblx0XHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGggPSB7fTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGgudHJhbnNsYXRlID0gW2RhdGEudHgsIGRhdGEudHldO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGguc2NhbGUgPSBkYXRhLnNjYWxlO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGgucm90YXRlID0gZGF0YS5yb3RhdGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC5yYXRpbyA9IGRhdGEucmF0aW87XG5cdFx0XHRcdGlmICh0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlcyA9PSBudWxsKSB7XG5cdFx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wbGFjZXMgPSB7fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bWFwX2luZm8gPSB7XG5cdFx0XHRcdGlkOiBkYXRhLmlkLFxuXHRcdFx0XHRuYW1lOiBkYXRhLm5hbWUsXG5cdFx0XHRcdHJvdGF0ZTogZGF0YS5yb3RhdGUsXG5cdFx0XHRcdHNjYWxlOiBkYXRhLnNjYWxlLFxuXHRcdFx0XHR0cmFuc2xhdGU6IFtkYXRhLnR4LCBkYXRhLnR5XSxcblx0XHRcdFx0cmF0aW86IGRhdGEucmF0aW9cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gc2F2ZSBkYXRhIHZhbHVlc1xuXHRcdGRhdGEucGxhY2VzLm1hcChmdW5jdGlvbihwbGFjZSkge1xuXHRcdFx0aWYgKHBsYWNlKSB7IC8vIG51bGwgaWYgY3VycmVudHBsYWNlIGlzbid0IGluaXQgaW4gRGl5YU5vZGVcblx0XHRcdFx0Ly8gcGxhY2UgeyBtYXBJZCwgbGFiZWwsIG5ldXJvbklkLCAgeCwgeX1cblxuXHRcdFx0XHQvLyBuZXVyb25JZCAoYWxzbyBwbGFjZSAncyBJZClcblx0XHRcdFx0dmFyIGlkID0gcGxhY2UubmV1cm9uSWQ7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIGludGVybmFsIGxpc3Rcblx0XHRcdFx0Ly8gY29udmVydCBmcm9tIERpeWEgcGFyYW1ldGVyICgwLi4xIGttKSB0byBkaXlhLW1hcCAoMC4uMTAwMDAwKVxuXHRcdFx0XHRwbGFjZSA9IHtcblx0XHRcdFx0XHRpZDogaWQsXG5cdFx0XHRcdFx0bGFiZWw6IHBsYWNlLmxhYmVsLFxuXHRcdFx0XHRcdHg6IHBsYWNlLngsXG5cdFx0XHRcdFx0eTogcGxhY2UueSxcblx0XHRcdFx0XHR0OiAzNjAgKiBwbGFjZS50XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW2lkXSA9PSBudWxsKSB7IC8vIG5vbmV4aXN0ZW50IHBsYWNlXG5cdFx0XHRcdFx0Ly8gaWYgaXMgbnVsbCBvciB1bmRlZmluZWRcblx0XHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlc1tpZF0gPSBwbGFjZTsgLy8gc2F2ZSBpdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cGxhY2VzX2luZm8ucHVzaChPYmplY3QuY3JlYXRlKHBsYWNlKSk7Ly8gY3JlYXRlIGEgY29weSB0byBzZW5kIHRvIHVzZXJcblxuXHRcdFx0XHQvLyBzYXZlIGJhc2UgcGxhY2UgKGZpcnN0IGtub3duIHBsYWNlLCBhbHNvIGZpcnN0IGVsZW1lbnQgb2YgcGxhY2VzIGFycmF5KVxuXHRcdFx0XHQvLyB1c2VsZXNzIGF0IHRoZSBtb21lbnRcblx0XHRcdFx0Ly8gaWYgKCF0aGF0Ll9kaXlhc1twZWVySWRdLmJhc2VQbGFjZSkgdGhhdC5fZGl5YXNbcGVlcklkXS5iYXNlUGxhY2UgPSBwbGFjZTtcblx0XHRcdH0gZWxzZSB7IC8vIGN1cnJlbnQgcGxhY2UgaXMgbnVsbFxuXHRcdFx0XHRwbGFjZXNfaW5mby5wdXNoKG51bGwpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKHBsYWNlc19pbmZvLmxlbmd0aCA9PT0gMCkgcGxhY2VzX2luZm8gPSBudWxsO1xuXG5cdFx0dGhhdC5lbWl0KFwicGVlci1zdWJzY3JpYmVkXCIscGVlcklkLCBtYXBfaW5mbywgcGxhY2VzX2luZm8pO1xuXHR9LCBvcHRpb25zKTtcblxuXHRmb3IgKHZhciBwZWVySWQgaW4gb3B0aW9ucy5zdWJJZHMpIHtcblx0XHRpZiAodGhpcy5fc3ViSWRzW3BlZXJJZF0gIT09IG51bGwgJiYgIWlzTmFOKHRoaXMuX3N1Yklkc1twZWVySWRdKSkge1xuXHRcdFx0Ly8gZXhpc3RlZCBzdWJzY3JpcHRpb24gPz9cblx0XHRcdGQxKFwiI3NlbGZcIikudW5zdWJzY3JpYmUodGhpcy5fc3ViSWRzKVxuXHRcdFx0ZGVsZXRlIHRoaXMuX3N1Yklkc1twZWVySWRdO1xuXHRcdFx0TE9HKFwiTWFwczogYnVnOiBleGlzdGVkIHN1YnNjcmlwdGlvbiA/P1wiKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBzYXZlIHN1YklkIGZvciBsYXRlciB1bnN1YnNjcmlwdGlvblxuXHRcdFx0dGhpcy5fc3ViSWRzW3BlZXJJZF0gPSBvcHRpb25zLnN1Yklkc1twZWVySWRdO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIGRpc2Nvbm5lY3QgZnJvbSBzZXJ2aWNlIG1hcCwgZnJlZSBldmVyeXRoaW5nIHNvIGl0IGlzIHNhZmUgdG8gZ2FyYmFnZSBjb2xsZWN0ZSB0aGlzIHNlcnZpY2VcbiAqL1xuTWFwcy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKHRoaXMuc3ViTWFwKVxuXHRcdHRoaXMuc3ViTWFwLmNsb3NlKCk7XG5cdGZvcih2YXIgcGVlcklkIGluIHRoaXMuX2RpeWFzKXtcblx0XHR0aGF0LmVtaXQoXCJwZWVyLXVuc3Vic2NyaWJlZFwiLCBwZWVySWQpO1xuXHR9XG5cdHRoaXMuX2RpeWFzID0ge307Ly8gZGVsZXRlID9cbn1cblxuLyoqXG4gKiBzYXZlIG1hcFxuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIG1hcF9pbmZvIHtPYmplY3R9ICh7cm90YXRlLCBzY2FsZSwgdHJhbnNsYXRlfSlcbiAqIEBwYXJhbSBjYiB7RnVuY3Rpb259IGNhbGxiYWNrIHdpdGggZXJyb3IgYXMgYXJndW1lbnRcbiAqL1xuTWFwcy5wcm90b3R5cGUuc2F2ZU1hcCA9IGZ1bmN0aW9uICh0YXJnZXRQZWVySWQsIG1hcF9pbmZvLCBjYikge1xuXHR2YXIgX21hcF9pbmZvID0gT2JqZWN0LmNyZWF0ZShtYXBfaW5mbyk7IC8vIGNyZWF0ZSBhIGR1cGxpY2F0ZSBvZiBtYXBfaW5mb1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIHNhdmUgbWFwJ3MgaW5mb1xuXHRfbWFwX2luZm8uc2NhbGUgPSBBcnJheS5pc0FycmF5KF9tYXBfaW5mby5zY2FsZSkgPyBfbWFwX2luZm8uc2NhbGVbMF0gOiBfbWFwX2luZm8uc2NhbGVcblxuXHRpZiAodGhpcy5tYXBJc01vZGlmaWVkKHRhcmdldFBlZXJJZCwgX21hcF9pbmZvKSkge1xuXHRcdGQxKFwiI3NlbGZcIikucmVxdWVzdCh7XG5cdFx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0XHRmdW5jOiAnVXBkYXRlTWFwJyxcblx0XHRcdG9iajogWyB0YXJnZXRQZWVySWQgXSxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c2NhbGU6IF9tYXBfaW5mby5zY2FsZSxcblx0XHRcdFx0dHg6IF9tYXBfaW5mby50cmFuc2xhdGVbMF0sXG5cdFx0XHRcdHR5OiBfbWFwX2luZm8udHJhbnNsYXRlWzFdLFxuXHRcdFx0XHRyb3RhdGU6IF9tYXBfaW5mby5yb3RhdGUsXG5cdFx0XHRcdHJhdGlvOiBfbWFwX2luZm8ucmF0aW9cblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGF0aC5zY2FsZSA9IF9tYXBfaW5mby5zY2FsZTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbdGFyZ2V0UGVlcklkXS5wYXRoLnJvdGF0ZSA9IF9tYXBfaW5mby5yb3RhdGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGF0aC50cmFuc2xhdGVbMF0gPSBfbWFwX2luZm8udHJhbnNsYXRlWzBdO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBhdGgudHJhbnNsYXRlWzFdID0gX21hcF9pbmZvLnRyYW5zbGF0ZVsxXTtcblx0XHRcdH1cblx0XHRcdGlmIChjYikgY2IoZXJyKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRpZiAoY2IpIGNiKG5ldyBFcnJvcihcIk5vIGNoYW5nZSB0byBtYXAgJ1wiICsgdGhpcy5fbWFwICsgXCInIVwiKSk7XG5cdH1cbn1cblxuLyoqXG4gKiB1cGRhdGUgZXZlcnkgcGxhY2VzXG4gKlxuICogQHBhcmFtIHBlZXJJZCB7U3RyaW5nfSBwZWVySWQgb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKiBAcGFyYW0gcGxhY2VfaW5mbyB7T2JqZWN0fSAoeyBpZCwgeCwgeX0pXG4gKiBAcGFyYW0gY2Ige0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIGVycm9yIGFzIGFyZ3VtZW50XG4gKi9cbk1hcHMucHJvdG90eXBlLnNhdmVQbGFjZSA9IGZ1bmN0aW9uICh0YXJnZXRQZWVySWQsIHBsYWNlX2luZm8sIGNiKSB7XG5cdC8vIHNhdmUgbWFwJ3MgaW5mb1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBlcnJvciA9IFwiXCI7XG5cblx0dmFyIF9wbGFjZV9pbmZvID0gT2JqZWN0LmNyZWF0ZShwbGFjZV9pbmZvKTtcblxuXHQvLyBzYXZlIHBsYWNlXG5cdGlmICh0aGlzLnBsYWNlSXNNb2RpZmllZCh0YXJnZXRQZWVySWQsIF9wbGFjZV9pbmZvKSkge1xuXHRcdGQxKFwiI3NlbGZcIikucmVxdWVzdCh7XG5cdFx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0XHRmdW5jOiAnVXBkYXRlUGxhY2UnLFxuXHRcdFx0b2JqOiBbIHRhcmdldFBlZXJJZCBdLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRuZXVyb25JZDogX3BsYWNlX2luZm8uaWQsXG5cdFx0XHRcdHg6IF9wbGFjZV9pbmZvLngsXG5cdFx0XHRcdHk6IF9wbGFjZV9pbmZvLnlcblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGxhY2VzW19wbGFjZV9pbmZvLmlkXS54ID0gX3BsYWNlX2luZm8ueDtcblx0XHRcdFx0dGhhdC5fZGl5YXNbdGFyZ2V0UGVlcklkXS5wbGFjZXNbX3BsYWNlX2luZm8uaWRdLnkgPSBfcGxhY2VfaW5mby55O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNiKSBjYihlcnIpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGlmIChjYikgY2IobmV3IEVycm9yKFwiTm8gY2hhbmdlIHRvIHBsYWNlIG4gXCIgKyBfcGxhY2VfaW5mby5pZCArIFwiIVwiKSk7XG5cdH1cbn1cblxuLyoqXG4gKiBkZWxldGUgZXZlcnkgc2F2ZWQgcGxhY2VzIG9mIERpeWEgKGNob29zZW4gaW4gc2VsZWN0b3IpXG4gKlxuICogQHBhcmFtIHBlZXJJZCB7U3RyaW5nfSBwZWVySWQgb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKiBAcGFyYW0gY2Ige0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIGVycm9yIGFzIGFyZ3VtZW50XG4gKi9cbk1hcHMucHJvdG90eXBlLmNsZWFyUGxhY2VzID0gZnVuY3Rpb24odGFyZ2V0UGVlcklkLCBjYikge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0ZDEoXCIjc2VsZlwiKS5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0ZnVuYzogJ0NsZWFyTWFwJyxcblx0XHRvYmo6IFsgdGFyZ2V0UGVlcklkIF1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRpZiAoZXJyICE9IG51bGwpIHtcblx0XHRcdC8vIGRlbGV0ZSBmcm9tIGludGVybmFsIGxpc3Rcblx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGxhY2VzID0ge307XG5cdFx0fVxuXHRcdGlmIChjYikgY2IoZXJyKTtcblx0fSk7XG59XG5cbi8vIGV4cG9ydCBpdCBhcyBtb2R1bGUgb2YgRGl5YVNlbGVjdG9yXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLm1hcHMgPSBmdW5jdGlvbihwZWVySWRzKSB7XG5cdHZhciBtYXBzID0gbmV3IE1hcHMocGVlcklkcyk7XG5cblx0cmV0dXJuIG1hcHM7XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciBkMSA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpO1xudmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cblxuXG5kMS5rbm93blBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBkMShcIiNzZWxmXCIpLmtub3duUGVlcnMoKTtcbn07XG5kMS5rcCA9IGQxLmtub3duUGVlcnM7XG5cblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmtub3duUGVlcnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdHRoaXMucmVxdWVzdCh7c2VydmljZTogJ21lc2hOZXR3b3JrJyxmdW5jOiAnTGlzdEtub3duUGVlcnMnfSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdHZhciBwZWVycyA9IFtdO1xuXHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdH0pO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuXG5cbmQxLmxpc3Rlbk1lc2hOZXR3b3JrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0cmV0dXJuIGQxKC8uKi8pLnN1YnNjcmliZSh7IHNlcnZpY2U6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdNZXNoTmV0d29yaycgfSwgY2FsbGJhY2ssIHthdXRvOiB0cnVlfSk7XG59O1xuIiwiLypcbiAqIENvcHlyaWdodCA6IFBhcnRuZXJpbmcgMy4wICgyMDA3LTIwMTYpXG4gKiBBdXRob3IgOiBTeWx2YWluIE1haMOpIDxzeWx2YWluLm1haGVAcGFydG5lcmluZy5mcj5cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBkaXlhLXNkay5cbiAqXG4gKiBkaXlhLXNkayBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBkaXlhLXNkayBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBkaXlhLXNkay4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5cblxuXG5cbi8qIG1heWEtY2xpZW50XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICogIDMuMCBvZiB0aGUgTGljZW5zZSBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG5cblxuZnVuY3Rpb24gTWVzc2FnZShzZXJ2aWNlLCBmdW5jLCBvYmosIHBlcm1hbmVudCl7XG5cblx0dGhpcy5zZXJ2aWNlID0gc2VydmljZTtcblx0dGhpcy5mdW5jID0gZnVuYztcblx0dGhpcy5vYmogPSBvYmo7XG5cdFxuXHR0aGlzLnBlcm1hbmVudCA9IHBlcm1hbmVudDsgLy9JZiB0aGlzIGZsYWcgaXMgb24sIHRoZSBjb21tYW5kIHdpbGwgc3RheSBvbiB0aGUgY2FsbGJhY2sgbGlzdCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xufVxuXG5NZXNzYWdlLmJ1aWxkU2lnbmF0dXJlID0gZnVuY3Rpb24obXNnKXtcblx0cmV0dXJuIG1zZy5zZXJ2aWNlKycuJyttc2cuZnVuYysnLicrbXNnLm9iajtcbn1cblxuXG5NZXNzYWdlLnByb3RvdHlwZS5zaWduYXR1cmUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5zZXJ2aWNlKycuJyt0aGlzLmZ1bmMrJy4nK3RoaXMub2JqO1xufVxuXG5NZXNzYWdlLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24oZGF0YSl7XG5cdHJldHVybiB7XG5cdFx0c2VydmljZTogdGhpcy5zZXJ2aWNlLFxuXHRcdGZ1bmM6IHRoaXMuZnVuYyxcblx0XHRvYmo6IHRoaXMub2JqLFxuXHRcdGRhdGE6IGRhdGFcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2U7XG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciBkMSA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpO1xudmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cblxuaWYodHlwZW9mIElORk8gPT09ICd1bmRlZmluZWQnKSBJTkZPID0gZnVuY3Rpb24ocykgeyBjb25zb2xlLmxvZyhzKTt9XG5pZih0eXBlb2YgT0sgPT09ICd1bmRlZmluZWQnKSBPSyA9IGZ1bmN0aW9uKHMpIHsgY29uc29sZS5sb2cocyk7fVxuXG5cblxuLyoqXG4qIEluc3RhbGxzIGEgbmV3IERpeWFOb2RlIGRldmljZSAod2l0aCBhZGRyZXNzICdpcCcpIGludG8gYW4gZXhpc3RpbmcgbmV0d29yaywgYnlcbiogY29udGFjdGluZyBhbiBleGlzdGluZyBEaXlhTm9kZSBkZXZpY2Ugd2l0aCBhZGRyZXNzICdib290c3RyYXBfaXAnIDpcbiogICAxKSBDb250YWN0IHRoZSBuZXcgbm9kZSB0byBnZXQgaXRzIHB1YmxpYyBrZXlcbiogICAyKSBBZGQgdGhpcyBwdWJsaWMga2V5IHRvIHRoZSBleGlzdGluZyBub2RlIFRydXN0ZWRQZWVycyBsaXN0XG4qICAgMykgQWRkIHRoZSBleGlzdGluZyBub2RlJ3MgcHVibGljIGtleSB0byB0aGUgbmV3IG5vZGUncyBUcnVzdGVkUGVlcnMgbGlzdFxuKiAgIDQpIEFzayB0aGUgbmV3IG5vZGUgdG8gam9pbiB0aGUgbmV0d29yayBieSBjYWxsaW5nIEBzZWV7ZDEoKS5qb2luKCl9XG4qXG4qIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyB0aGUgZ2l2ZW4gdXNlciB0byBoYXZlIHJvb3Qgcm9sZSBvbiBib3RoIG5vZGVzXG4qXG4qIEBwYXJhbSBpcCA6IHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBuZXcgZGV2aWNlXG4qIEBwYXJhbSB1c2VyIDogYSB1c2VybmFtZSB3aXRoIHJvb3Qgcm9sZSBvbiB0aGUgbmV3IGRldmljZVxuKiBAcGFyYW0gcGFzc3dvcmQgOiB0aGUgcGFzc3dvcmQgZm9yICd1c2VyJ1xuKiBAcGFyYW0gYm9vdHN0cmFwX2lwIDogdGhlIElQIGFkZHJlc3Mgb2YgdGhlIGJvb3RzdHJhcCBkZXZpY2VcbiogQHBhcmFtIGJvb3RzdHJhcF91c2VyIDogYSB1c2VyIGlkZW50aWZpZXIgd2l0aCByb290IHJvbGUgb24gdGhlIGJvb3N0cmFwIGRldmljZVxuKiBAcGFyYW0gYm9vdHN0cmFwX3Bhc3N3b3JkIDogdGhlIHBhc3N3b3JkIGZvciAnYm9vdHN0cmFwX3VzZXInXG4qIEBwYXJhbSBib290c3RyYXBfbmV0IDogdGhlIElQIGFkZHJlc3Mgd2hlcmUgdGhlIG5ldyBkZXZpY2Ugd2lsbCBjb25uZWN0IHRvIHRoZSBib29zdHJhcCBvbmVcbiogQHBhcmFtIGNhbGxiYWNrIDogb2YgdGhlIGZvcm0gY2FsbGJhY2sobmV3X3BlZXJfbmFtZSxib290c3RyYXBfcGVlcl9uYW1lLCBlcnIsIGRhdGEpXG4qL1xuZDEuaW5zdGFsbE5vZGVFeHQgPSBmdW5jdGlvbihpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spIHtcblx0aWYodHlwZW9mIGlwICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGlwIHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXAgIT09ICdzdHJpbmcnKSB0aHJvdyBcIltpbnN0YWxsTm9kZV0gYm9vdHN0cmFwX2lwIHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfbmV0ICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGJvb3RzdHJhcF9uZXQgc2hvdWxkIGJlIGFuIElQIGFkZHJlc3NcIjtcblxuXG5cdC8vIENoZWNrIGFuZCBGb3JtYXQgVVJJIChGUUROKVxuXHRpZihib290c3RyYXBfaXAuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGJvb3RzdHJhcF9pcC5pbmRleE9mKFwid3NzOi8vXCIpICE9PSAwKSB7XG5cdFx0aWYoZDEuaXNTZWN1cmVkKCkpIGJvb3RzdHJhcF9pcCA9IFwid3NzOi8vXCIgKyBib290c3RyYXBfaXA7XG5cdFx0ZWxzZSBib290c3RyYXBfaXAgPSBcIndzOi8vXCIgKyBib290c3RyYXBfaXA7XG5cdH1cblx0aWYoYm9vdHN0cmFwX25ldC5pbmRleE9mKFwid3M6Ly9cIikgIT09IDAgJiYgYm9vdHN0cmFwX25ldC5pbmRleE9mKFwid3NzOi8vXCIpICE9PSAwKSB7XG5cdFx0aWYoZDEuaXNTZWN1cmVkKCkpIGJvb3RzdHJhcF9uZXQgPSBcIndzczovL1wiICsgYm9vdHN0cmFwX25ldDtcblx0XHRlbHNlIGJvb3RzdHJhcF9uZXQgPSBcIndzOi8vXCIgKyBib290c3RyYXBfbmV0O1xuXHR9XG5cblxuXG5cdGZ1bmN0aW9uIGpvaW4ocGVlciwgYm9vdHN0cmFwX3BlZXIpIHtcblx0XHRkMShcIiNzZWxmXCIpLmpvaW4oYm9vdHN0cmFwX25ldCwgdHJ1ZSwgZnVuY3Rpb24ocGVlciwgZXJyLCBkYXRhKXtcblx0XHRcdGlmKCFlcnIpIE9LKFwiSk9JTkVEICEhIVwiKTtcblx0XHRcdHJldHVybiBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBkYXRhKTtcblx0XHR9KTtcblx0fVxuXG5cdGQxLmNvbm5lY3RBc1VzZXIoaXAsIHVzZXIsIHBhc3N3b3JkKS50aGVuKGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSl7XG5cdFx0ZDEoXCIjc2VsZlwiKS5naXZlUHVibGljS2V5KGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyPT09J1NlcnZpY2VOb3RGb3VuZCcpIHtcblx0XHRcdFx0SU5GTyhcIlBlZXIgQXV0aGVudGljYXRpb24gZGlzYWJsZWQgLi4uIGRpcmVjdGx5IGpvaW5pbmdcIik7XG5cdFx0XHRcdGpvaW4oKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihlcnIpIHJldHVybiBjYWxsYmFjayhwZWVyLCBudWxsLCBlcnIsIG51bGwpO1xuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdElORk8oXCJBZGQgdHJ1c3RlZCBwZWVyIFwiICsgcGVlciArIFwiKGlwPVwiICsgaXAgKyBcIikgdG8gXCIgKyBib290c3RyYXBfaXAgKyBcIiB3aXRoIHB1YmxpYyBrZXkgXCIgKyBkYXRhLnB1YmxpY19rZXkuc2xpY2UoMCwyMCkpO1xuXHRcdFx0XHRkMS5jb25uZWN0QXNVc2VyKGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGQxKFwiI3NlbGZcIikuYWRkVHJ1c3RlZFBlZXIocGVlciwgZGF0YS5wdWJsaWNfa2V5LCBmdW5jdGlvbihib290c3RyYXBfcGVlciwgZXJyLCBkYXRhKSB7XG5cblx0XHRcdFx0XHRcdGlmKGVycikgcmV0dXJuIGNhbGxiYWNrKHBlZXIsIGJvb3RzdHJhcF9wZWVyLCBlcnIsIG51bGwpO1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5hbHJlYWR5VHJ1c3RlZCkgSU5GTyhwZWVyICsgXCIgYWxyZWFkeSB0cnVzdGVkIGJ5IFwiICsgYm9vdHN0cmFwX3BlZXIpO1xuXHRcdFx0XHRcdFx0ZWxzZSBJTkZPKGJvb3RzdHJhcF9wZWVyICsgXCIoaXA9XCIrIGJvb3RzdHJhcF9pcCArXCIpIGFkZGVkIFwiICsgcGVlciArIFwiKGlwPVwiICsgaXAgKyBcIikgYXMgYSBUcnVzdGVkIFBlZXJcIik7XG5cblx0XHRcdFx0XHRcdElORk8oXCJJbiByZXR1cm4sIGFkZCBcIiArIGJvb3RzdHJhcF9wZWVyICsgXCIgdG8gXCIgKyBwZWVyICsgXCIgYXMgYSBUcnVzdGVkIFBlZXIgd2l0aCBwdWJsaWMga2V5IFwiICsgZGF0YS5wdWJsaWNfa2V5LnNsaWNlKDAsMjApKTtcblx0XHRcdFx0XHRcdGQxLmNvbm5lY3RBc1VzZXIoaXAsIHVzZXIsIHBhc3N3b3JkKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRcdGQxKFwiI3NlbGZcIikuYWRkVHJ1c3RlZFBlZXIoYm9vdHN0cmFwX3BlZXIsIGRhdGEucHVibGljX2tleSwgZnVuY3Rpb24ocGVlciwgZXJyLCBkYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYoZXJyKSBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBudWxsKTtcblx0XHRcdFx0XHRcdFx0XHRlbHNlIGlmKGRhdGEuYWxyZWFkeVRydXN0ZWQpIElORk8oYm9vdHN0cmFwX3BlZXIgKyBcIiBhbHJlYWR5IHRydXN0ZWQgYnkgXCIgKyBwZWVyKTtcblx0XHRcdFx0XHRcdFx0XHRlbHNlIElORk8ocGVlciArIFwiKGlwPVwiKyBpcCArXCIpIGFkZGVkIFwiICsgYm9vdHN0cmFwX3BlZXIgKyBcIihpcD1cIisgYm9vdHN0cmFwX2lwICtcIikgYXMgYSBUcnVzdGVkIFBlZXJcIik7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT25jZSBLZXlzIGhhdmUgYmVlbiBleGNoYW5nZWQgYXNrIHRvIGpvaW4gdGhlIG5ldHdvcmtcblx0XHRcdFx0XHRcdFx0XHRPSyhcIktFWVMgT0sgISBOb3csIGxldCBcIitwZWVyK1wiKGlwPVwiK2lwK1wiKSBqb2luIHRoZSBuZXR3b3JrIHZpYSBcIitib290c3RyYXBfcGVlcitcIihpcD1cIitib290c3RyYXBfbmV0K1wiKSAuLi5cIik7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGpvaW4ocGVlciwgYm9vdHN0cmFwX3BlZXIpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59XG5cblxuLyoqIFNob3J0IHZlcnNpb24gb2YgQHNlZXtkMS5pbnN0YWxsTm9kZUV4dH0gKi9cbmQxLmluc3RhbGxOb2RlID0gZnVuY3Rpb24oYm9vdHN0cmFwX2lwLCBib290c3RyYXBfbmV0LCBjYWxsYmFjaykge1xuXHRcdHZhciBpcCA9IGQxLmFkZHIoKTtcblx0XHR2YXIgdXNlciA9IGQxLnVzZXIoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSBkMS5wYXNzKCk7XG5cdFx0dmFyIGJvb3RzdHJhcF91c2VyID0gdXNlcjtcblx0XHR2YXIgYm9vdHN0cmFwX3Bhc3N3b3JkID0gcGFzc3dvcmQ7XG5cdFx0cmV0dXJuIGQxLmluc3RhbGxOb2RlRXh0KGlwLCB1c2VyLCBwYXNzd29yZCwgYm9vdHN0cmFwX2lwLCBib290c3RyYXBfdXNlciwgYm9vdHN0cmFwX3Bhc3N3b3JkLCBib290c3RyYXBfbmV0LCBjYWxsYmFjayk7XG59XG5cblxuXG5cbi8qKlxuICogTWFrZSB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGpvaW4gYW4gZXhpc3RpbmcgRGl5YU5vZGVzIE1lc2ggTmV0d29yayBieSBjb250YWN0aW5nXG4gKiB0aGUgZ2l2ZW4gYm9vdHN0cmFwIHBlZXJzLlxuICpcbiAqIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyByb290IHJvbGVcbiAqXG4gKiBAcGFyYW0gYm9vdHN0cmFwX2lwcyA6IGFuIGFycmF5IG9mIGJvb3RzdHJhcCBJUCBhZGRyZXNzZXMgdG8gY29udGFjdCB0byBqb2luIHRoZSBOZXR3b3JrXG4gKiBAcGFyYW0gYlBlcm1hbmVudCA6IGlmIHRydWUsIHBlcm1hbmVudGx5IGFkZCB0aGUgYm9vdHN0cmFwIHBlZXJzIGFzIGF1dG9tYXRpYyBib290c3RyYXAgcGVlcnMgZm9yIHRoZSBzZWxlY3RlZCBub2Rlcy5cbiAqXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcHMsIGJQZXJtYW5lbnQsIGNhbGxiYWNrKXtcblx0aWYodHlwZW9mIGJvb3RzdHJhcF9pcHMgPT09ICdzdHJpbmcnKSBib290c3RyYXBfaXBzID0gWyBib290c3RyYXBfaXBzIF07XG5cdGlmKGJvb3RzdHJhcF9pcHMuY29uc3RydWN0b3IgIT09IEFycmF5KSB0aHJvdyBcImpvaW4oKSA6IGJvb3RzdHJhcF9pcHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHBlZXJzIFVSSXNcIjtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlIDogJ21lc2hOZXR3b3JrJywgZnVuYzogJ0pvaW4nLCBkYXRhOiB7IGJvb3RzdHJhcF9pcHM6IGJvb3RzdHJhcF9pcHMsIGJQZXJtYW5lbnQ6IGJQZXJtYW5lbnQgfX0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHsgaWYodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrKHBlZXJJZCwgZXJyLCBkYXRhKTt9XG5cdCk7XG59O1xuXG5cbi8qKlxuICogRGlzY29ubmVjdCB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGZyb20gdGhlIGdpdmVuIGJvb3RzdHJhcCBwZWVyc1xuICpcbiAqIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyByb290IHJvbGVcbiAqXG4gKiBAcGFyYW0gYm9vdHN0cmFwX2lwcyA6IGFuIGFycmF5IG9mIGJvb3RzdHJhcCBJUCBhZGRyZXNzZXMgdG8gbGVhdmVcbiAqIEBwYXJhbSBiUGVybWFuZW50IDogaWYgdHJ1ZSwgcGVybWFuZW50bHkgcmVtb3ZlIHRoZSBnaXZlbiBwZWVycyBmcm9tIHRoZSBhdXRvbWF0aWMgYm9vdHN0cmFwIHBlZXJzIGxpc3RcbiAqXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbihib290c3RyYXBfaXBzLCBiUGVybWFuZW50LCBjYWxsYmFjayl7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXBzID09PSAnc3RyaW5nJykgYm9vdHN0cmFwX2lwcyA9IFsgYm9vdHN0cmFwX2lwcyBdO1xuXHRpZihib290c3RyYXBfaXBzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkgdGhyb3cgXCJsZWF2ZSgpIDogYm9vdHN0cmFwX2lwcyBzaG91bGQgYmUgYW4gYXJyYXkgb2YgcGVlcnMgVVJJc1wiO1xuXHR0aGlzLnJlcXVlc3QoXG5cdFx0e3NlcnZpY2UgOiAnbWVzaE5ldHdvcmsnLCBmdW5jOiAnTGVhdmUnLCBkYXRhOiB7IGJvb3RzdHJhcF9pcHM6IGJvb3RzdHJhcF9pcHMsIGJQZXJtYW5lbnQ6IGJQZXJtYW5lbnQgfX0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHsgaWYodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrKHBlZXJJZCwgZXJyLCBkYXRhKTt9XG5cdCk7XG59O1xuXG5cbi8qKlxuICogQXNrIHRoZSBzZWxlY3RlZCBEaXlhTm9kZXMgZm9yIHRoZWlyIHB1YmxpYyBrZXlzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZ2l2ZVB1YmxpY0tleSA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblx0cmV0dXJuIHRoaXMucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnR2l2ZVB1YmxpY0tleScsXHRkYXRhOiB7fSB9LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtjYWxsYmFjayhwZWVySWQsZXJyLGRhdGEpO1xuXHR9KTtcbn07XG5cbi8qKlxuICogQWRkIGEgbmV3IHRydXN0ZWQgcGVlciBSU0EgcHVibGljIGtleSB0byB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIG5hbWUgOiB0aGUgbmFtZSBvZiB0aGUgbmV3IHRydXN0ZWQgRGl5YU5vZGUgcGVlclxuICogQHBhcmFtIHB1YmxpY19rZXkgOiB0aGUgUlNBIHB1YmxpYyBrZXkgb2YgdGhlIG5ldyB0cnVzdGVkIERpeWFOb2RlIHBlZXJcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5hZGRUcnVzdGVkUGVlciA9IGZ1bmN0aW9uKG5hbWUsIHB1YmxpY19rZXksIGNhbGxiYWNrKXtcblx0cmV0dXJuIHRoaXMucmVxdWVzdCh7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnQWRkVHJ1c3RlZFBlZXInLFx0ZGF0YTogeyBuYW1lOiBuYW1lLCBwdWJsaWNfa2V5OiBwdWJsaWNfa2V5IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCxlcnIsZGF0YSl7Y2FsbGJhY2socGVlcklkLGVycixkYXRhKTt9XG5cdCk7XG59O1xuXG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyB0cnVzdCB0aGUgZ2l2ZW4gcGVlcnNcbiAqIEBwYXJhbSBwZWVycyA6IGFuIGFycmF5IG9mIHBlZXIgbmFtZXNcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5hcmVUcnVzdGVkID0gZnVuY3Rpb24ocGVlcnMsIGNhbGxiYWNrKXtcblx0cmV0dXJuIHRoaXMucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnQXJlVHJ1c3RlZCcsXHRkYXRhOiB7IHBlZXJzOiBwZWVycyB9IH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdHZhciBhbGxUcnVzdGVkID0gZGF0YS50cnVzdGVkO1xuXHRcdFx0aWYoYWxsVHJ1c3RlZCkgeyBPSyhwZWVycyArIFwiIGFyZSB0cnVzdGVkIGJ5IFwiICsgcGVlcklkKTsgY2FsbGJhY2socGVlcklkLCB0cnVlKTsgfVxuXHRcdFx0ZWxzZSB7IEVSUihcIlNvbWUgcGVlcnMgaW4gXCIgKyBwZWVycyArIFwiIGFyZSB1bnRydXN0ZWQgYnkgXCIgKyBwZWVySWQpOyBjYWxsYmFjayhwZWVySWQsIGZhbHNlKTsgfVxuXHRcdH1cblx0KTtcbn07XG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmlzVHJ1c3RlZCA9IGZ1bmN0aW9uKHBlZXIsIGNhbGxiYWNrKSB7IHJldHVybiB0aGlzLmFyZVRydXN0ZWQoW3BlZXJdLCBjYWxsYmFjayk7IH1cblxuXG5kMS50cnVzdGVkUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRkMShcIiNzZWxmXCIpLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dldFRydXN0ZWRQZWVycycgfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHR2YXIgcGVlcnMgPSBbXTtcblx0XHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0XHR9XG5cdCk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcbmQxLnRwID0gZDEudHJ1c3RlZFBlZXJzOyAvLyBTaG9ydGhhbmRcblxuZDEuYmxhY2tsaXN0ZWRQZWVycyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdGQxKFwiI3NlbGZcIikucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnR2V0QmxhY2tsaXN0ZWRQZWVycycgfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHR2YXIgcGVlcnMgPSBbXTtcblx0XHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0XHR9XG5cdCk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcbmQxLmJwID0gZDEuYmxhY2tsaXN0ZWRQZWVyczsgLy8gU2hvcnRoYW5kXG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cblxuRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbnJlcXVpcmUoJ3dlYnJ0Yy1hZGFwdGVyJyk7XG5cbi8qaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpe1xuXHR2YXIgUlRDUGVlckNvbm5lY3Rpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbjtcblx0dmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgfHwgd2luZG93Lm1velJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cud2Via2l0UlRDSWNlQ2FuZGlkYXRlO1xuXHR2YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cubW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENTZXNzaW9uRGVzY3JpcHRpb247XG59Ki9cblxuXG5cblxuLy8vLy8vLy8vLy8vL1xuLy8gQ0hBTk5FTCAvL1xuLy8vLy8vLy8vLy8vL1xuXG4vKiogSGFuZGxlcyBhIFJUQyBjaGFubmVsIChkYXRhY2hhbm5lbCBhbmQvb3Igc3RyZWFtKSB0byBhIERpeWFOb2RlIHBlZXJcbiAqICBAcGFyYW0gZG5JZCA6IHRoZSBEaXlhTm9kZSBwZWVySWRcbiAqICBAcGFyYW0gbmFtZSA6IHRoZSBjaGFubmVsJ3MgbmFtZVxuICogIEBwYXJhbSBkYXRhY2hhbm5lbF9jYiA6IGNhbGxiYWNrIGNhbGxlZCB3aGVuIGEgUlRDIGRhdGFjaGFubmVsIGlzIG9wZW4gZm9yIHRoaXMgY2hhbm5lbFxuICogIEBwYXJhbSBzdHJlYW1fY2IgOiBjYWxsYmFjayBjYWxsZWQgd2hlbiBhIFJUQyBzdHJlYW0gaXMgb3BlbiBmb3IgdGhpcyBjaGFubmVsXG4gKi9cbmZ1bmN0aW9uIENoYW5uZWwoZG5JZCwgbmFtZSwgZGF0YWNoYW5uZWxfY2IsIHN0cmVhbV9jYikge1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblx0dGhpcy5uYW1lID0gbmFtZTtcblx0dGhpcy5kbklkID0gZG5JZDtcblxuXHR0aGlzLmZyZXF1ZW5jeSA9IDIwO1xuXG5cdHRoaXMuY2hhbm5lbCA9IHVuZGVmaW5lZDtcblx0dGhpcy5zdHJlYW0gPSB1bmRlZmluZWQ7XG5cdHRoaXMub25kYXRhY2hhbm5lbCA9IGRhdGFjaGFubmVsX2NiO1xuXHR0aGlzLm9uc3RyZWFtID0gc3RyZWFtX2NiO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xufVxuaW5oZXJpdHMoQ2hhbm5lbCwgRXZlbnRFbWl0dGVyKTtcblxuLyoqIEJpbmQgYW4gaW5jb21pbmcgUlRDIGRhdGFjaGFubmVsIHRvIHRoaXMgY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuc2V0RGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5jaGFubmVsID0gZGF0YWNoYW5uZWw7XG5cdHRoaXMuY2hhbm5lbC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0Y29uc29sZS5sb2coXCJzZXQgZGF0YSBjaGFubmVsIDpcIit0aGlzLm5hbWUpO1xuXHRkYXRhY2hhbm5lbC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHQvLyBGaXJzdCBtZXNzYWdlIGNhcnJpZXMgY2hhbm5lbCBkZXNjcmlwdGlvbiBoZWFkZXJcblx0XHR2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhtZXNzYWdlLmRhdGEpO1xuXG5cdFx0dmFyIHR5cGVDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3LmdldFVpbnQ4KDApKTtcblx0XHRpZih0eXBlQ2hhciA9PT0gJ08nKSB0aGF0LnR5cGUgPSAnaW5wdXQnOyAvL1Byb21ldGhlIE91dHB1dCA9IENsaWVudCBJbnB1dFxuXHRcdGVsc2UgaWYodHlwZUNoYXIgPT09ICdJJykgdGhhdC50eXBlID0gJ291dHB1dCc7IC8vUHJvbWV0aGUgSW5wdXQgPSBDbGllbnQgT3V0cHV0XG5cdFx0ZWxzZSB0aHJvdyBcIlVucmVjbm9nbml6ZWQgY2hhbm5lbCB0eXBlIDogXCIgKyB0eXBlQ2hhcjtcblxuXHRcdHZhciBzaXplID0gdmlldy5nZXRJbnQzMigxLHRydWUpO1xuXHRcdGlmKCFzaXplKSB0aHJvdyBcIldyb25nIGRhdGFjaGFubmVsIG1lc3NhZ2Ugc2l6ZVwiO1xuXHRcdHRoYXQuc2l6ZSA9IHNpemU7XG5cdFx0dGhhdC5fYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblxuXHRcdC8vIFN1YnNlcXVlbnQgbWVzc2FnZXMgYXJlIGZvcndhcmRlZCB0byBhcHByb3ByaWF0ZSBoYW5kbGVyc1xuXHRcdGRhdGFjaGFubmVsLm9ubWVzc2FnZSA9IHRoYXQuX29uTWVzc2FnZS5iaW5kKHRoYXQpO1xuXHRcdGRhdGFjaGFubmVsLm9uY2xvc2UgPSB0aGF0Ll9vbkNsb3NlLmJpbmQodGhhdCk7XG5cblx0XHRpZih0eXBlb2YgdGhhdC5vbmRhdGFjaGFubmVsID09PSAnZnVuY3Rpb24nKSB0aGF0Lm9uZGF0YWNoYW5uZWwodGhhdC5kbklkLCB0aGF0KTtcblxuXHRcdGNvbnNvbGUubG9nKCdPcGVuIGRhdGFjaGFubmVsICcrdGhhdC5uYW1lKTtcblx0fVxufTtcblxuLyoqIEJpbmQgYW4gaW5jb21pbmcgUlRDIHN0cmVhbSB0byB0aGlzIGNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLm9uQWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG5cdHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuXHRpZih0eXBlb2YgdGhpcy5vbnN0cmVhbSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5vbnN0cmVhbSh0aGlzLmRuSWQsIHN0cmVhbSk7XG5cdGVsc2UgY29uc29sZS53YXJuKFwiSWdub3JlIHN0cmVhbSBcIiArIHN0cmVhbS5pZCk7XG5cblx0Y29uc29sZS5sb2coJ09wZW4gc3RyZWFtICcrdGhpcy5uYW1lKTtcbn07XG5cblxuLyoqIENsb3NlIHRoaXMgY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLmNsb3NlZCA9IHRydWU7XG59O1xuXG4vKiogV3JpdGUgYSBzY2FsYXIgdmFsdWUgdG8gdGhlIGdpdmVuIGluZGV4IG9uIHRoZSBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0aWYoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5zaXplIHx8IGlzTmFOKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuXHR0aGlzLl9idWZmZXJbaW5kZXhdID0gdmFsdWU7XG5cdHRoaXMuX3JlcXVlc3RTZW5kKCk7XG5cdHJldHVybiB0cnVlO1xufTtcblxuLyoqIFdyaXRlIGFuIGFycmF5IG9mIHZhbHVlcyB0byB0aGUgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS53cml0ZUFsbCA9IGZ1bmN0aW9uKHZhbHVlcyl7XG5cdGlmKCFBcnJheS5pc0FycmF5KHZhbHVlcykgfHwgdmFsdWVzLmxlbmd0aCAhPT0gdGhpcy5zaXplKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaTx2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBpZihpc05hTih2YWx1ZXNbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMuX2J1ZmZlcltpXSA9IHZhbHVlc1tpXTtcbiAgICB9XG4gICAgdGhpcy5fcmVxdWVzdFNlbmQoKTtcbn07XG5cbi8qKiBBc2sgdG8gc2VuZCB0aGUgaW50ZXJuYWwgZGF0YSBidWZmZXIgdGhyb3VnaCB0aGUgZGF0YWNoYW5uZWwgYXQgdGhlIGRlZmluZWQgZnJlcXVlbmN5ICovXG5DaGFubmVsLnByb3RvdHlwZS5fcmVxdWVzdFNlbmQgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2VuZFRpbWVzdGFtcDtcblx0dmFyIHBlcmlvZCA9IDEwMDAgLyB0aGlzLmZyZXF1ZW5jeTtcblx0aWYoZWxhcHNlZFRpbWUgPj0gcGVyaW9kKSBkb1NlbmQoKTtcblx0ZWxzZSBpZighdGhpcy5fc2VuZFJlcXVlc3RlZCkge1xuXHRcdHRoaXMuX3NlbmRSZXF1ZXN0ZWQgPSB0cnVlO1xuXHRcdHNldFRpbWVvdXQoZG9TZW5kLCBwZXJpb2QgLSBlbGFwc2VkVGltZSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb1NlbmQoKSB7XG5cdFx0dGhhdC5fc2VuZFJlcXVlc3RlZCA9IGZhbHNlO1xuXHRcdHRoYXQuX2xhc3RTZW5kVGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0dmFyIHJldCA9IHRoYXQuX3NlbmQodGhhdC5fYnVmZmVyKTtcblx0XHQvL0lmIGF1dG9zZW5kIGlzIHNldCwgYXV0b21hdGljYWxseSBzZW5kIGJ1ZmZlciBhdCB0aGUgZ2l2ZW4gZnJlcXVlbmN5XG5cdFx0aWYocmV0ICYmIHRoYXQuYXV0b3NlbmQpIHRoYXQuX3JlcXVlc3RTZW5kKCk7XG5cdH1cbn07XG5cbi8qKiBBY3R1YWwgc2VuZCB0aGUgaW50ZXJuYWwgZGF0YSBidWZmZXIgdGhyb3VnaCB0aGUgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5fc2VuZCA9IGZ1bmN0aW9uKG1zZyl7XG5cdGlmKHRoaXMuY2xvc2VkIHx8ICF0aGlzLmNoYW5uZWwpIHJldHVybiBmYWxzZTtcblx0ZWxzZSBpZih0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSA9PT0gJ29wZW4nKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMuY2hhbm5lbC5zZW5kKG1zZyk7XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSBleGNlcHRpb24gb2NjdXJlZCB3aGlsZSBzZW5kaW5nIGRhdGEnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gd2FybmluZyA6IHdlYnJ0YyBkYXRhY2hhbm5lbCBzdGF0ZSA9ICcrdGhpcy5jaGFubmVsLnJlYWR5U3RhdGUpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqIENhbGxlZCB3aGVuIGEgbWVzc2FnZSBpcyByZWNlaXZlZCBmcm9tIHRoZSBjaGFubmVsJ3MgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5fb25NZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHR2YXIgdmFsQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KG1lc3NhZ2UuZGF0YSk7XG5cdHRoaXMuZW1pdCgndmFsdWUnLCB2YWxBcnJheSk7XG59O1xuXG4vKiogQ2FsbGVkIHdoZW4gdGhlIGNoYW5uZWwgaXMgY2xvc2VkIG9uIHRoZSByZW1vdGUgc2lkZSAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX29uQ2xvc2UgPSBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coJ0Nsb3NlIGRhdGFjaGFubmVsICcrdGhpcy5uYW1lKTtcblx0dGhpcy5lbWl0KCdjbG9zZScpO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLyBSVEMgUGVlciBpbXBsZW1lbnRhdGlvbiAvLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogQW4gUlRDIFBlZXIgYXNzb2NpYXRlZCB0byBhIHNpbmdsZSAoRGl5YU5vZGUgcGVlcklkLCBwcm9tSWQpIGNvdXBsZS5cbiAqIEBwYXJhbSBkbklkIDogVGhlIERpeWFOb2RlIHBlZXJJZFxuICogQHBhcmFtIHJ0YyA6IFRoZSBSVEMgZGl5YS1zZGsgaW5zdGFuY2VcbiAqIEBwYXJhbSBpZCA6IHRoZSBwcm9tSWRcbiAqIEBwYXJhbSBjaGFubmVscyA6IGFuIGFycmF5IG9mIFJUQyBjaGFubmVsIG5hbWVzIHRvIG9wZW5cbiAqL1xuZnVuY3Rpb24gUGVlcihkbklkLCBydGMsIGlkLCBjaGFubmVscyl7XG5cdHRoaXMuZG4gPSBkMShkbklkKTtcblx0dGhpcy5kbklkID0gZG5JZDtcblx0dGhpcy5pZCA9IGlkO1xuXHR0aGlzLmNoYW5uZWxzID0gY2hhbm5lbHM7XG5cdHRoaXMucnRjID0gcnRjO1xuXHR0aGlzLnBlZXIgPSBudWxsO1xuXG5cdHRoaXMuc3RyZWFtcyA9IFtdO1xuXG5cdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cblx0dGhpcy5fY29ubmVjdCgpO1xufVxuXG4vKiogSW5pdGlhdGUgYSBSVEMgY29ubmVjdGlvbiB0byB0aGlzIFBlZXIgKi9cblBlZXIucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5kbi5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdydGMnLCBmdW5jOiAnQ29ubmVjdCcsIG9iajogdGhpcy5jaGFubmVscywgZGF0YTogeyBwcm9tSUQ6IHRoaXMuaWQgfVxuXHR9LCBmdW5jdGlvbihkaXlhLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGRhdGEpIHtcblx0XHRcdGlmKGRhdGEuZXZlbnRUeXBlID09PSAnVHVybkluZm8nKSB0aGF0Ll90dXJuaW5mbyA9IGRhdGEudHVybjtcblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdSZW1vdGVPZmZlcicpIHRoYXQuX2NyZWF0ZVBlZXIoZGF0YSk7XG5cdFx0XHRlbHNlIGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUmVtb3RlSUNFQ2FuZGlkYXRlJykgdGhhdC5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlKGRhdGEpO1xuXHRcdH1cblx0fSk7XG5cblx0dGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBpZighdGhhdC5jb25uZWN0ZWQgJiYgIXRoYXQuY2xvc2VkKSB0aGF0Ll9yZWNvbm5lY3QoKTsgfSwgNDAwMDApO1xufTtcblxuLyoqIFJlY29ubmVjdHMgdGhlIFJUQyBwZWVyICovXG5QZWVyLnByb3RvdHlwZS5fcmVjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5jbG9zZSgpO1xuXG5cdHRoaXMucGVlciA9IG51bGw7XG5cdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cblx0dGhpcy5fY29ubmVjdCgpO1xufTtcblxuXG4vKiogQ3JlYXRlcyBhIFJUQ1BlZXJDb25uZWN0aW9uIGluIHJlc3BvbnNlIHRvIGEgUmVtb3RlT2ZmZXIgKi9cblBlZXIucHJvdG90eXBlLl9jcmVhdGVQZWVyID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR2YXIgaWNlU2VydmVycyA9IFtdO1xuXHRpZih0aGlzLl90dXJuaW5mbykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheSh0aGlzLl90dXJuaW5mbykpIHtcblx0XHRcdGljZVNlcnZlcnMucHVzaCh7IFxuXHRcdFx0XHR1cmxzOiBbIHRoaXMuX3R1cm5pbmZvLnVybCBdLCBcblx0XHRcdFx0dXNlcm5hbWU6IHRoaXMuX3R1cm5pbmZvLnVzZXJuYW1lLCBcblx0XHRcdFx0Y3JlZGVudGlhbDogdGhpcy5fdHVybmluZm8ucGFzc3dvcmQgXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWNlU2VydmVycyA9IHRoaXMuX3R1cm5pbmZvLm1hcChmdW5jdGlvbih0dXJuKSB7IFxuXHRcdFx0XHRyZXR1cm4geyBcblx0XHRcdFx0XHR1cmxzOiBbIHR1cm4udXJsIF0sIFxuXHRcdFx0XHRcdHVzZXJuYW1lOiB0dXJuLnVzZXJuYW1lLCBcblx0XHRcdFx0XHRjcmVkZW50aWFsOiB0dXJuLnBhc3N3b3JkIFxuXHRcdFx0XHR9IFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGljZVNlcnZlcnMucHVzaCh7dXJsczogWyBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIiBdfSk7XG5cdH1cblx0XG5cdHZhciBjb25maWcgPSB7XG5cdFx0aWNlU2VydmVyczogaWNlU2VydmVycyxcblx0XHRpY2VUcmFuc3BvcnRQb2xpY3k6ICdhbGwnXG5cdH07XG5cblx0dmFyIGNvbnN0cmFpbnRzID0ge1xuXHRcdG1hbmRhdG9yeToge0R0bHNTcnRwS2V5QWdyZWVtZW50OiB0cnVlLCBPZmZlclRvUmVjZWl2ZUF1ZGlvOiB0cnVlLCBPZmZlclRvUmVjZWl2ZVZpZGVvOnRydWV9XG5cdH1cblx0XG5cdHZhciBwZWVyID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKGNvbmZpZywgIGNvbnN0cmFpbnRzKTtcblx0dGhpcy5wZWVyID0gcGVlcjtcblxuXHR0aGlzLnN0cmVhbXMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG5cdFx0cGVlci5hZGRTdHJlYW0ocyk7XG5cdH0pO1xuXG5cdHBlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7c2RwOiBkYXRhLnNkcCwgdHlwZTogZGF0YS50eXBlfSkpO1xuXG5cdHBlZXIuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRcdC8vZmF2b3IgVlA5IGluc3RlYWQgb2YgVlA4XG5cdFx0c2Vzc2lvbl9kZXNjcmlwdGlvbi5zZHAgPSBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcC5yZXBsYWNlKC9TQVZQRiAxMDAgMTAxL2csICdTQVZQRiAxMDEgMTAwJyk7XG5cblx0XHRwZWVyLnNldExvY2FsRGVzY3JpcHRpb24oc2Vzc2lvbl9kZXNjcmlwdGlvbik7XG5cblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnQW5zd2VyJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0c2RwOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcCxcblx0XHRcdFx0dHlwZTogc2Vzc2lvbl9kZXNjcmlwdGlvbi50eXBlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZ1bmN0aW9uKGVycil7IGNvbnNvbGUubG9nKGVycik7IH0sXG5cdHsnbWFuZGF0b3J5JzogeyBPZmZlclRvUmVjZWl2ZUF1ZGlvOiB0cnVlLCBPZmZlclRvUmVjZWl2ZVZpZGVvOiB0cnVlfX0pO1xuXG5cdHBlZXIub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnY29ubmVjdGVkJyl7XG5cdFx0XHR0aGF0LmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0XHRpZih0aGF0LnN1YnNjcmlwdGlvbikgdGhhdC5zdWJzY3JpcHRpb24uY2xvc2UoKTtcblx0XHR9XG5cdFx0ZWxzZSBpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Rpc2Nvbm5lY3RlZCcgfHwgcGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjbG9zZWQnIHx8IHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZmFpbGVkJyl7XG5cdFx0XHRpZighdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpO1xuXHRcdH1cblx0fTtcblxuXHRwZWVyLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnSUNFQ2FuZGlkYXRlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiB0aGF0LmlkLFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25EYXRhQ2hhbm5lbCh0aGF0LmRuSWQsIGV2dC5jaGFubmVsKTtcblx0fTtcblxuXHRwZWVyLm9uYWRkc3RyZWFtID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0dGhhdC5jb25uZWN0ZWQgPSB0cnVlO1xuXHRcdHRoYXQucnRjLl9vbkFkZFN0cmVhbSh0aGF0LmRuSWQsIGV2dC5zdHJlYW0pO1xuXHR9O1xufTtcblxuXG5QZWVyLnByb3RvdHlwZS5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG5cdHRyeSB7XG5cdFx0dmFyIGNhbmRpZGF0ZSA9IG5ldyBSVENJY2VDYW5kaWRhdGUoZGF0YS5jYW5kaWRhdGUpO1xuXHRcdHRoaXMucGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLCBmdW5jdGlvbigpe30sZnVuY3Rpb24oZXJyKXsgY29uc29sZS5lcnJvcihlcnIpO1x0fSk7XG5cdH0gY2F0Y2goZXJyKSB7IGNvbnNvbGUuZXJyb3IoZXJyKTsgfVxufTtcblxuLyoqIFNlbmQgdGhlIG1hcHBpbmdzIGZyb20gY2hhbm5lbCBuYW1lcyB0byBzdHJlYW0gSURzICovXG5QZWVyLnByb3RvdHlwZS5zZW5kQ2hhbm5lbHNTdHJlYW1zTWFwcGluZ3MgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5kbi5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOlwicnRjXCIsXG5cdFx0ZnVuYzpcIkNoYW5uZWxzU3RyZWFtc01hcHBpbmdzXCIsXG5cdFx0ZGF0YTp7cGVlcklkOjAsIG1hcHBpbmdzOnRoaXMucnRjW3RoaXMuZG5JZF0uY2hhbm5lbHNCeVN0cmVhbX1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikgY29uc29sZS5lcnJvcihlcnIpO1xuXHR9KTtcbn07XG5cbi8qKiBBZGRzIGEgbG9jYWwgc3RyZWFtIHRvIHRoaXMgUGVlciAqL1xuUGVlci5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG5cdHRoaXMuc2VuZENoYW5uZWxzU3RyZWFtc01hcHBpbmdzKCk7XG5cdGlmKCF0aGlzLnN0cmVhbXMuZmlsdGVyKGZ1bmN0aW9uKHMpe3JldHVybiBzdHJlYW0uaWQgPT09IHM7fSlbMF0pIHRoaXMuc3RyZWFtcy5wdXNoKHN0cmVhbSk7XG5cdHRoaXMuX3JlY29ubmVjdCgpO1xufVxuXG5QZWVyLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcblx0dGhpcy5zdHJlYW1zID0gdGhpcy5zdHJlYW1zLmZpbHRlcihmdW5jdGlvbihzKXtyZXR1cm4gc3RyZWFtLmlkICE9PSBzO30pO1xuXHRpZih0aGlzLnBlZXIpIHRoaXMucGVlci5yZW1vdmVTdHJlYW0oc3RyZWFtKTtcbn1cblxuUGVlci5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHRpZih0aGlzLnN1YnNjcmlwdGlvbikgdGhpcy5zdWJzY3JpcHRpb24uY2xvc2UoKTtcblx0Y2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRJZCk7XG5cdGlmKHRoaXMucGVlcil7XG5cdFx0dHJ5e1xuXHRcdFx0dGhpcy5wZWVyLmNsb3NlKCk7XG5cdFx0fWNhdGNoKGUpe31cblx0XHR0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY2xvc2VkID0gdHJ1ZTtcblx0fVxufTtcblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gUlRDIHNlcnZpY2UgaW1wbGVtZW50YXRpb24gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cblxuZnVuY3Rpb24gUlRDKHNlbGVjdG9yKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscyA9IFtdO1xuXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0gPSBbXTtcbn1cblxuUlRDLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihuYW1lX3JlZ2V4LCB0eXBlLCBvbmRhdGFjaGFubmVsX2NhbGxiYWNrLCBvbmFkZHN0cmVhbV9jYWxsYmFjayl7XG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMucHVzaCh7cmVnZXg6IG5hbWVfcmVnZXgsIHR5cGU6dHlwZSwgY2I6IG9uZGF0YWNoYW5uZWxfY2FsbGJhY2ssIHN0cmVhbV9jYjogb25hZGRzdHJlYW1fY2FsbGJhY2t9KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKiogU3RhcnQgbGlzdGVuaW5nIHRvIFBlZXJzIGNvbm5lY3Rpb25zLlxuICogQSAnUGVlcicgb2JqZWN0IHdpbGwgYmUgY3JlYXRlZCBmb3IgZWFjaCBEaXlhTm9kZSBwZWVySWQgYW5kIGVhY2ggcHJvbUlEXG4gKi9cblJUQy5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXG5cdHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdQZWVycydcblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblxuXHRcdGlmKCF0aGF0W2RuSWRdKSB0aGF0Ll9jcmVhdGVEaXlhTm9kZShkbklkKTtcblxuXHRcdGlmKGVyciA9PT0gJ1N1YnNjcmlwdGlvbkNsb3NlZCcgfHwgZXJyID09PSAnUGVlckRpc2Nvbm5lY3RlZCcpe1xuXHRcdFx0dGhhdC5fY2xvc2VEaXlhTm9kZShkbklkKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0aWYoZGF0YSAmJiBkYXRhLmV2ZW50VHlwZSAmJiBkYXRhLnByb21JRCAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0aWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ29ubmVjdGVkJyl7XG5cdFx0XHRcdGlmKCF0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSl7XG5cdFx0XHRcdFx0dmFyIGNoYW5uZWxzID0gdGhhdC5fbWF0Y2hDaGFubmVscyhkbklkLCBkYXRhLmNoYW5uZWxzKTtcblx0XHRcdFx0XHRpZihjaGFubmVscy5sZW5ndGggPiAwKXtcblx0XHRcdFx0XHRcdHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdID0gbmV3IFBlZXIoZG5JZCwgdGhhdCwgZGF0YS5wcm9tSUQsIGNoYW5uZWxzKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBBdXRvcmVjb25uZWN0IGRlY2xhcmVkIHN0cmVhbXNcblx0XHRcdFx0XHR0aGF0LmNoYW5uZWxzQnlTdHJlYW0uZm9yRWFjaChmdW5jdGlvbihjYnMpIHtcblx0XHRcdFx0XHRcdHRoYXQuYWRkU3RyZWFtKGNicy5jaGFubmVsLCBjYnMubWVkaWFTdHJlYW0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdKSB0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXS5zZW5kQ2hhbm5lbHNTdHJlYW1zTWFwcGluZ3MoKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ2xvc2VkJykge1xuXHRcdFx0XHRpZih0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSkge1xuXHRcdFx0XHRcdHRoYXQuX2Nsb3NlUGVlcihkbklkLCBkYXRhLnByb21JRCk7XG5cdFx0XHRcdFx0aWYodHlwZW9mIHRoYXQub25jbG9zZSA9PT0gJ2Z1bmN0aW9uJykgdGhhdC5vbmNsb3NlKGRuSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSwge2F1dG86IHRydWV9KTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblJUQy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLnNlbGVjdG9yLmVhY2goZnVuY3Rpb24oZG5JZCl7XG5cdFx0aWYoIXRoYXRbZG5JZF0pIHJldHVybiA7XG5cdFx0Zm9yKHZhciBwcm9tSUQgaW4gdGhhdFtkbklkXS5wZWVycyl7XG5cdFx0XHR0aGF0Ll9jbG9zZVBlZXIoZG5JZCwgcHJvbUlEKTtcblx0XHR9XG5cdH0pO1xuXG5cdGlmKHRoaXMuc3Vic2NyaXB0aW9uKSB0aGlzLnN1YnNjcmlwdGlvbi5jbG9zZSgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuUlRDLnByb3RvdHlwZS5fY3JlYXRlRGl5YU5vZGUgPSBmdW5jdGlvbihkbklkKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXNbZG5JZF0gPSB7XG5cdFx0ZG5JZDogZG5JZCxcblx0XHR1c2VkQ2hhbm5lbHM6IFtdLFxuXHRcdHJlcXVlc3RlZENoYW5uZWxzOiBbXSxcblx0XHRwZWVyczogW10sXG5cdFx0Y2hhbm5lbHNCeVN0cmVhbTogW11cblx0fVxuXG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMuZm9yRWFjaChmdW5jdGlvbihjKXt0aGF0W2RuSWRdLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goYyl9KTtcbn07XG5cblJUQy5wcm90b3R5cGUuX2Nsb3NlRGl5YU5vZGUgPSBmdW5jdGlvbihkbklkKXtcblx0Zm9yKHZhciBwcm9tSUQgaW4gdGhpc1tkbklkXS5wZWVycyl7XG5cdFx0dGhpcy5fY2xvc2VQZWVyKGRuSWQsIHByb21JRCk7XG5cdH1cblxuXHRkZWxldGUgdGhpc1tkbklkXTtcbn07XG5cblJUQy5wcm90b3R5cGUuX2Nsb3NlUGVlciA9IGZ1bmN0aW9uKGRuSWQsIHByb21JRCl7XG5cdGlmKHRoaXNbZG5JZF0ucGVlcnNbcHJvbUlEXSl7XG5cdFx0dmFyIHAgPSB0aGlzW2RuSWRdLnBlZXJzW3Byb21JRF07XG5cdFx0cC5jbG9zZSgpO1xuXG5cdFx0Zm9yKHZhciBpPTA7aTxwLmNoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHRcdGRlbGV0ZSB0aGlzW2RuSWRdLnVzZWRDaGFubmVsc1twLmNoYW5uZWxzW2ldXTtcblx0XHR9XG5cblx0XHRkZWxldGUgdGhpc1tkbklkXS5wZWVyc1twcm9tSURdO1xuXHR9XG59O1xuXG4vKiogTWF0Y2hlcyB0aGUgZ2l2ZW4gcmVjZWl2ZWRDaGFubmVscyBwcm9wb3NlZCBieSB0aGUgZ2l2ZW4gRGl5YU5vZGUgcGVlcklkXG4gKiAgYWdhaW5zdCB0aGUgcmVxdWVzdGVkIGNoYW5uZWxzIGFuZCBjcmVhdGVzIGEgQ2hhbm5lbCBmb3IgZWFjaCBtYXRjaFxuICovXG5SVEMucHJvdG90eXBlLl9tYXRjaENoYW5uZWxzID0gZnVuY3Rpb24oZG5JZCwgcmVjZWl2ZWRDaGFubmVscyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR2YXIgY2hhbm5lbHMgPSBbXTtcblxuXHRmb3IodmFyIGkgPSAwOyBpIDwgcmVjZWl2ZWRDaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIG5hbWUgPSByZWNlaXZlZENoYW5uZWxzW2ldO1xuXHRcdHZhciByZW1vdGVTdHJlYW1JZCA9IG5hbWUuc3BsaXQoXCJfOzpfXCIpWzFdO1xuXHRcdG5hbWUgPSBuYW1lLnNwbGl0KFwiXzs6X1wiKVswXTtcblxuXHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGF0W2RuSWRdLnJlcXVlc3RlZENoYW5uZWxzLmxlbmd0aDsgaisrKXtcblx0XHRcdHZhciByZXEgPSB0aGF0W2RuSWRdLnJlcXVlc3RlZENoYW5uZWxzW2pdO1xuXG5cdFx0XHRpZihuYW1lICYmIG5hbWUubWF0Y2gocmVxLnJlZ2V4KSAmJiAhdGhhdFtkbklkXS51c2VkQ2hhbm5lbHNbbmFtZV0pe1xuXHRcdFx0XHR2YXIgY2hhbm5lbCA9IG5ldyBDaGFubmVsKGRuSWQsIG5hbWUsIHJlcS5jYiwgcmVxLnN0cmVhbV9jYik7XG5cdFx0XHRcdHRoYXRbZG5JZF0udXNlZENoYW5uZWxzW25hbWVdID0gY2hhbm5lbDtcblx0XHRcdFx0Y2hhbm5lbHMucHVzaChuYW1lKTtcblxuXHRcdFx0XHQvLyBJZiBhIHN0cmVhbSBpZCBpcyBwcm92aWRlZCBmb3IgdGhlIGNoYW5uZWwsIHJlZ2lzdGVyIHRoZSBtYXBwaW5nXG5cdFx0XHRcdGlmKHJlbW90ZVN0cmVhbUlkKSB7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuc3RyZWFtICE9PSByZW1vdGVTdHJlYW1JZCAmJiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbDsgfSk7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLnB1c2goe3N0cmVhbTpyZW1vdGVTdHJlYW1JZCwgY2hhbm5lbDpjaGFubmVsfSk7XG5cdFx0XHRcdFx0Y2hhbm5lbC5zdHJlYW1JZCA9IHN0cmVhbUlkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBsb2NhbFN0cmVhbUlkID0gdGhhdC5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCA9PT0gbmFtZTsgfSlbMF07XG5cdFx0XHRcdGlmKGxvY2FsU3RyZWFtSWQpIHtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5zdHJlYW0gIT09IGxvY2FsU3RyZWFtSWQgJiYgY2JzLmNoYW5uZWwgIT09IG5hbWU7IH0pO1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtzdHJlYW06bG9jYWxTdHJlYW1JZCwgY2hhbm5lbDpuYW1lfSk7XG5cdFx0XHRcdFx0Y2hhbm5lbC5sb2NhbFN0cmVhbUlkID0gbG9jYWxTdHJlYW1JZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiAgY2hhbm5lbHM7XG59O1xuXG5cbi8qKiBDYWxsZWQgdXBvbiBSVEMgZGF0YWNoYW5uZWxzIGNvbm5lY3Rpb25zICovXG5SVEMucHJvdG90eXBlLl9vbkRhdGFDaGFubmVsID0gZnVuY3Rpb24oZG5JZCwgZGF0YWNoYW5uZWwpe1xuXHRpZighdGhpc1tkbklkXSkgcmV0dXJuIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIG9wZW4gYSBkYXRhIGNoYW5uZWwgb24gYSBjbG9zZWQgcGVlclwiKTtcblx0dmFyIGNoYW5uZWwgPSB0aGlzW2RuSWRdLnVzZWRDaGFubmVsc1tkYXRhY2hhbm5lbC5sYWJlbF07XG5cblx0aWYoIWNoYW5uZWwpe1xuXHRcdGNvbnNvbGUubG9nKFwiRGF0YWNoYW5uZWwgXCIrZGF0YWNoYW5uZWwubGFiZWwrXCIgdW5tYXRjaGVkLCBjbG9zaW5nICFcIik7XG5cdFx0ZGF0YWNoYW5uZWwuY2xvc2UoKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cdGNoYW5uZWwuc2V0RGF0YUNoYW5uZWwoZGF0YWNoYW5uZWwpO1xufTtcblxuLyoqIENhbGxlZCB1cG9uIFJUQyBzdHJlYW0gY2hhbm5lbCBjb25uZWN0aW9ucyAqL1xuUlRDLnByb3RvdHlwZS5fb25BZGRTdHJlYW0gPSBmdW5jdGlvbihkbklkLCBzdHJlYW0pIHtcblx0aWYoIXRoaXNbZG5JZF0pIHJldHVybiBjb25zb2xlLndhcm4oXCJUcmllZCB0byBvcGVuIGEgc3RyZWFtIG9uIGEgY2xvc2VkIHBlZXJcIik7XG5cblx0dmFyIGNoYW5uZWwgPSB0aGlzW2RuSWRdLnVzZWRDaGFubmVsc1tzdHJlYW0uaWRdO1xuXG5cdGlmKCFjaGFubmVsKXtcblx0XHRjb25zb2xlLndhcm4oXCJTdHJlYW0gQ2hhbm5lbCBcIisgc3RyZWFtLmlkICtcIiB1bm1hdGNoZWQsIGNsb3NpbmcgIVwiKTtcblx0XHRzdHJlYW0uY2xvc2UoKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cdGNoYW5uZWwub25BZGRTdHJlYW0oc3RyZWFtKTtcbn07XG5cbi8qKiBBZGQgYSBsb2NhbCBzdHJlYW0gdG8gYmUgc2VudCB0aHJvdWdoIHRoZSBnaXZlbiBSVEMgY2hhbm5lbCAqL1xuUlRDLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihjaGFubmVsLCBzdHJlYW0pIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8vIFJlZ2lzdGVyIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmdcblx0dGhpcy5jaGFubmVsc0J5U3RyZWFtID0gdGhpcy5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuIFx0dGhpcy5jaGFubmVsc0J5U3RyZWFtLnB1c2goe2NoYW5uZWw6Y2hhbm5lbCwgc3RyZWFtOnN0cmVhbS5pZCwgbWVkaWFTdHJlYW06c3RyZWFtfSk7XG5cblx0Y29uc29sZS5sb2coXCJPcGVuIGxvY2FsIHN0cmVhbSBcIiArIGNoYW5uZWwpO1xuXG5cdC8vIFNlbmQgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZyB0byBhbGwgY29ubmVjdGVkIFBlZXJzXG5cdHRoaXMuc2VsZWN0b3IuZWFjaChmdW5jdGlvbihkbklkKXtcblx0XHRpZighdGhhdFtkbklkXSkgcmV0dXJuIDtcblx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG5cdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLnB1c2goe2NoYW5uZWw6Y2hhbm5lbCwgc3RyZWFtOnN0cmVhbS5pZH0pO1xuXHRcdGZvcih2YXIgcHJvbUlEIGluIHRoYXRbZG5JZF0ucGVlcnMpe1xuXHRcdFx0dGhhdFtkbklkXS5wZWVyc1twcm9tSURdLmFkZFN0cmVhbShzdHJlYW0pO1xuXHRcdH1cblx0fSk7XG5cbn07XG5cblJUQy5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oY2hhbm5lbCwgc3RyZWFtKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvLyBSZWdpc3RlciB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nXG5cdHRoaXMuY2hhbm5lbHNCeVN0cmVhbSA9IHRoaXMuY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcblxuXHRjb25zb2xlLmxvZyhcIkNsb3NlIGxvY2FsIHN0cmVhbSBcIiArIGNoYW5uZWwpO1xuXG5cdC8vIFNlbmQgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZyB0byBhbGwgY29ubmVjdGVkIFBlZXJzXG5cdHRoaXMuc2VsZWN0b3IuZWFjaChmdW5jdGlvbihkbklkKXtcblx0XHRpZighdGhhdFtkbklkXSkgcmV0dXJuIDtcblx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG5cdFx0Zm9yKHZhciBwcm9tSUQgaW4gdGhhdFtkbklkXS5wZWVycyl7XG5cdFx0XHR0aGF0W2RuSWRdLnBlZXJzW3Byb21JRF0ucmVtb3ZlU3RyZWFtKHN0cmVhbSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUucnRjID0gZnVuY3Rpb24oKXsgcmV0dXJuIG5ldyBSVEModGhpcyk7fTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgOiBQYXJ0bmVyaW5nIDMuMCAoMjAwNy0yMDE2KVxuICogQXV0aG9yIDogU3lsdmFpbiBNYWjDqSA8c3lsdmFpbi5tYWhlQHBhcnRuZXJpbmcuZnI+XG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZGl5YS1zZGsuXG4gKlxuICogZGl5YS1zZGsgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogZGl5YS1zZGsgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggZGl5YS1zZGsuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuXG5cblxuXG4vKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gdHJ1ZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLyoqXG4gKlx0Y2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIFN0YXR1cyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcblxuXHQvKiogbW9kZWwgb2Ygcm9ib3QgOiBhdmFpbGFibGUgcGFydHMgYW5kIHN0YXR1cyAqKi9cblx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdHRoaXMuX3JvYm90TW9kZWxJbml0ID0gZmFsc2U7XG5cblx0LyoqKiBzdHJ1Y3R1cmUgb2YgZGF0YSBjb25maWcgKioqXG5cdFx0IGNyaXRlcmlhIDpcblx0XHQgICB0aW1lOiBhbGwgMyB0aW1lIGNyaXRlcmlhIHNob3VsZCBub3QgYmUgZGVmaW5lZCBhdCB0aGUgc2FtZSB0aW1lLiAocmFuZ2Ugd291bGQgYmUgZ2l2ZW4gdXApXG5cdFx0ICAgICBiZWc6IHtbbnVsbF0sdGltZX0gKG51bGwgbWVhbnMgbW9zdCByZWNlbnQpIC8vIHN0b3JlZCBhIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgZW5kOiB7W251bGxdLCB0aW1lfSAobnVsbCBtZWFucyBtb3N0IG9sZGVzdCkgLy8gc3RvcmVkIGFzIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgcmFuZ2U6IHtbbnVsbF0sIHRpbWV9IChyYW5nZSBvZiB0aW1lKHBvc2l0aXZlKSApIC8vIGluIHMgKG51bSlcblx0XHQgICByb2JvdDoge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCAgIHBsYWNlOiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0IG9wZXJhdG9yOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9IC0oIG1heWJlIG1veSBzaG91bGQgYmUgZGVmYXVsdFxuXHRcdCAuLi5cblxuXHRcdCBwYXJ0cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBQYXJ0c0lkfSB0byBnZXQgZXJyb3JzXG5cdFx0IHN0YXR1cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTdGF0dXNOYW1lfSB0byBnZXQgc3RhdHVzXG5cblx0XHQgc2FtcGxpbmc6IHtbbnVsbF0gb3IgaW50fVxuXHQqL1xuXHR0aGlzLmRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHtcblx0XHRcdFx0YmVnOiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbFxuXHRcdH0sXG5cdFx0b3BlcmF0b3I6ICdsYXN0Jyxcblx0XHRwYXJ0czogbnVsbCxcblx0XHRzdGF0dXM6IG51bGxcblx0fTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG4vKipcbiAqIEdldCByb2JvdE1vZGVsIDpcbiAqIHtcbiAqICBwYXJ0czoge1xuICpcdFx0XCJwYXJ0WFhcIjoge1xuICogXHRcdFx0IGVycm9yc0Rlc2NyOiB7IGVuY291bnRlcmVkIGVycm9ycyBpbmRleGVkIGJ5IGVycm9ySWRzPjAgfVxuICpcdFx0XHRcdD4gQ29uZmlnIG9mIGVycm9ycyA6XG4gKlx0XHRcdFx0XHRjcml0TGV2ZWw6IEZMT0FULCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqIFx0XHRcdFx0XHRtc2c6IFNUUklORyxcbiAqXHRcdFx0XHRcdHN0b3BTZXJ2aWNlSWQ6IFNUUklORyxcbiAqXHRcdFx0XHRcdHJ1blNjcmlwdDogU2VxdWVsaXplLlNUUklORyxcbiAqXHRcdFx0XHRcdG1pc3Npb25NYXNrOiBTZXF1ZWxpemUuSU5URUdFUixcbiAqXHRcdFx0XHRcdHJ1bkxldmVsOiBTZXF1ZWxpemUuSU5URUdFUlxuICpcdFx0XHRlcnJvcjpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHR9LFxuICpcdCBcdC4uLiAoXCJQYXJ0WVlcIilcbiAqICB9LFxuICogIHN0YXR1czoge1xuICpcdFx0XCJzdGF0dXNYWFwiOiB7XG4gKlx0XHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHRcdHRpbWU6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRcdHJvYm90OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHRcdFx0cmFuZ2U6IFtGTE9BVCwgRkxPQVRdLFxuICpcdFx0XHRcdGxhYmVsOiBzdHJpbmdcbiAqXHRcdFx0fSxcbiAqXHQgXHQuLi4gKFwiU3RhdHVzWVlcIilcbiAqICB9XG4gKiB9XG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0Um9ib3RNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnJvYm90TW9kZWw7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tU3RhdHVzXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtTdGF0dXN9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBiZWcgYW5kIGVuZC5cbiAqIElmIHBhcmFtIGRlZmluZWRcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVCZWcgLy8gbWF5IGJlIG51bGxcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVFbmQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcmV0dXJuIHtTdGF0dXN9IHRoaXNcbiAqIElmIG5vIHBhcmFtIGRlZmluZWQ6XG4gKlx0QHJldHVybiB7T2JqZWN0fSBUaW1lIG9iamVjdDogZmllbGRzIGJlZyBhbmQgZW5kLlxuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZUJlZyxuZXdUaW1lRW5kLCBuZXdSYW5nZSl7XG5cdGlmKG5ld1RpbWVCZWcgfHwgbmV3VGltZUVuZCB8fCBuZXdSYW5nZSkge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyA9IG5ld1RpbWVCZWcuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCA9IG5ld1RpbWVFbmQuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlID0gbmV3UmFuZ2U7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB7XG5cdFx0XHRiZWc6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzIC8vIG5vdCByZWxldmFudD8sIG5vdCBpbXBsZW1lbnRlZCB5ZXRcbiAqIFNldCBwbGFjZSBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHBsYWNlSWRzIGxpc3Qgb2YgcGxhY2UgSWRzXG4gKiBHZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiBwbGFjZSBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUGxhY2VJZHMgPSBmdW5jdGlvbihwbGFjZUlkcyl7XG5cdGlmKHBsYWNlSWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnBsYWNlSWQgPSBwbGFjZUlkcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZTtcbn07XG4vKipcbiAqIEdldCBkYXRhIGJ5IHNlbnNvciBuYW1lLlxuICpcdEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gc2Vuc29yTmFtZSBsaXN0IG9mIHNlbnNvcnNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5nZXREYXRhQnlOYW1lID0gZnVuY3Rpb24oc2Vuc29yTmFtZXMpe1xuXHR2YXIgZGF0YT1bXTtcblx0Zm9yKHZhciBuIGluIHNlbnNvck5hbWVzKSB7XG5cdFx0ZGF0YS5wdXNoKHRoaXMuZGF0YU1vZGVsW3NlbnNvck5hbWVzW25dXSk7XG5cdH1cblx0cmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byBlcnJvci9zdGF0dXMgdXBkYXRlc1xuICovXG5TdGF0dXMucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24ocm9ib3ROYW1lcywgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKHJvYm90TmFtZXMpO1xuXG5cdHZhciBzdWJzID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdzdGF0dXMnLFxuXHRcdGZ1bmM6ICdTdGF0dXMnLFxuXHRcdGRhdGE6IHJvYm90TmFtZXNcblx0fSwgZnVuY3Rpb24gKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cocGVlcklkKTtcblx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoIFwiU3RhdHVzU3Vic2NyaWJlOlwiK2VyciApO1xuXHRcdFx0dGhhdC5jbG9zZVN1YnNjcmlwdGlvbnMoKTsgLy8gc2hvdWxkIG5vdCBiZSBuZWNlc3Nhcnlcblx0XHRcdHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID0gdGhhdC5zdWJzY3JpcHRpb25SZXFQZXJpb2QrMTAwMHx8MTAwMDsgLy8gaW5jcmVhc2UgZGVsYXkgYnkgMSBzZWNcblx0XHRcdGlmKHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kID4gNjAwMDApIHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kPTYwMDAwOyAvLyBtYXggMW1pblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcdHRoYXQud2F0Y2goZGF0YSxjYWxsYmFjayk7IH0sIHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kKTsgLy8gdHJ5IGFnYWluIGxhdGVyXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoYXQuc3Vic2NyaXB0aW9uUmVxUGVyaW9kPTA7IC8vIHJlc2V0IHBlcmlvZCBvbiBzdWJzY3JpcHRpb24gcmVxdWVzdHNcblx0XHRpZiAoZGF0YSYmZGF0YS5lcnImJmRhdGEuZXJyLnN0KSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoIFwiV2F0Y2hTdGF0dXNFcnI6XCIrSlNPTi5zdHJpbmdpZnkoZGF0YS5lcnIpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhhdC5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2MihkYXRhKTtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJylcblx0XHRcdFx0Y2FsbGJhY2sodGhhdC5yb2JvdE1vZGVsKTtcblx0XHR9XG5cdH0pO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChzdWJzKTtcbn07XG5cbi8qKlxuICogQ2xvc2UgYWxsIHN1YnNjcmlwdGlvbnNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5jbG9zZVN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbigpe1xuXHRmb3IodmFyIGkgaW4gdGhpcy5zdWJzY3JpcHRpb25zKSB7XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zW2ldLmNsb3NlKCk7XG5cdH1cblx0dGhpcy5zdWJzY3JpcHRpb25zID1bXTtcblx0dGhpcy5yb2JvdE1vZGVsID0gW107XG59O1xuXG5cbi8qKlxuICogR2V0IGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0dmFyIGRhdGFNb2RlbCA9IHt9O1xuXHRpZihkYXRhQ29uZmlnKVxuXHRcdHRoaXMuRGF0YUNvbmZpZyhkYXRhQ29uZmlnKTtcblx0Ly8gY29uc29sZS5sb2coXCJSZXF1ZXN0OiBcIitKU09OLnN0cmluZ2lmeShkYXRhQ29uZmlnKSk7XG5cdHRoaXMuc2VsZWN0b3IucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJzdGF0dXNcIixcblx0XHRmdW5jOiBcIkRhdGFSZXF1ZXN0XCIsXG5cdFx0ZGF0YToge1xuXHRcdFx0dHlwZTpcInNwbFJlcVwiLFxuXHRcdFx0ZGF0YUNvbmZpZzogdGhhdC5kYXRhQ29uZmlnXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1wiK3RoYXQuZGF0YUNvbmZpZy5zZW5zb3JzK1wiXSBSZWN2IGVycjogXCIrSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJVcGRhdGVEYXRhOlxcblwiK0pTT04uc3RyaW5naWZ5KGRhdGEuaGVhZGVyLnJlcUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL0xvZ2dlci5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRkYXRhTW9kZWwgPSB0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcblxuXHRcdExvZ2dlci5sb2codGhhdC5nZXREYXRhTW9kZWwoKSk7XG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoYXQpOyAvLyBiaW5kIGNhbGxiYWNrIHdpdGggU3RhdHVzXG5cdFx0Y2FsbGJhY2soZGF0YU1vZGVsKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHR9KTtcbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgcm9ib3QgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhICh2ZXJzaW9uIDIpXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuX2dldFJvYm90TW9kZWxGcm9tUmVjdjIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHJvYm90O1xuXHR2YXIgZGF0YVJvYm90cyA9IGRhdGEucm9ib3RzO1xuXHR2YXIgZGF0YVBhcnRzID0gZGF0YS5wYXJ0TGlzdDtcblx0aWYoIXRoaXMucm9ib3RNb2RlbClcblx0XHR0aGlzLnJvYm90TW9kZWwgPSBbXTtcblx0Ly8gY29uc29sZS5sb2coXCJfZ2V0Um9ib3RNb2RlbEZyb21SZWN2XCIpO1xuXHQvLyBjb25zb2xlLmxvZyh0aGlzLnJvYm90TW9kZWwpO1xuXG5cdGZvcih2YXIgbiBpbiB0aGlzLnJvYm90TW9kZWwpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMgPSB7fTsgLy8gcmVzZXQgcGFydHNcblx0fVxuXG5cdGZvcih2YXIgbiBpbiBkYXRhUm9ib3RzKSB7XG5cdFx0aWYoIXRoaXMucm9ib3RNb2RlbFtuXSlcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXT17fTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucm9ib3QgPSBkYXRhUm9ib3RzW25dLnJvYm90O1xuXG5cdFx0Ly8gaWYodGhpcy5yb2JvdE1vZGVsLmxlbmd0aDxkYXRhLmxlbmd0aCkge1xuXHRcdC8vIFx0dGhpcy5yb2JvdE1vZGVsLnB1c2goe3JvYm90OiBkYXRhWzBdLnJvYm90c30pO1xuXHRcdC8vIH1cblxuXHRcdC8qKiBleHRyYWN0IHBhcnRzIGluZm8gKiovXG5cdFx0aWYoZGF0YVJvYm90c1tuXSAmJiBkYXRhUm9ib3RzW25dLnBhcnRzKSB7XG5cdFx0XHR2YXIgcGFydHMgPSBkYXRhUm9ib3RzW25dLnBhcnRzO1xuXHRcdFx0dGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzID0ge307XG5cdFx0XHR2YXIgclBhcnRzID0gdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzO1xuXHRcdFx0Ly8gZm9yKHZhciBxIGluIHJQYXJ0cykge1xuXHRcdFx0Ly8gXHQvKiogcGFydFtxXSB3YXMgbm90IHNlbnQgYmVjYXVzZSBubyBlcnJvciAqKi9cblx0XHRcdC8vIFx0aWYoIXBhcnRzW3FdXG5cdFx0XHQvLyBcdCAgICYmclBhcnRzW3FdLmV2dHMmJnJQYXJ0c1txXS5ldnRzLmNvZGUpIHtcblx0XHRcdC8vIFx0XHRyUGFydHNbcV0uZXZ0cyA9IHtcblx0XHRcdC8vIFx0XHRcdGNvZGU6IDAsXG5cdFx0XHQvLyBcdFx0XHRjb2RlUmVmOiAwLFxuXHRcdFx0Ly8gXHRcdFx0dGltZTogRGF0ZS5ub3coKSAvKiogdXBkYXRlICoqL1xuXHRcdFx0Ly8gXHRcdH07XG5cdFx0XHQvLyBcdH1cblx0XHRcdC8vIH1cblx0XHRcdGZvciAodmFyIHAgaW4gcGFydHMpIHtcblx0XHRcdFx0aWYoIXJQYXJ0c1twXSkge1xuXHRcdFx0XHRcdHJQYXJ0c1twXT17fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihwYXJ0c1twXSkge1xuXHRcdFx0XHRcdC8vIExvZ2dlci5sb2cobik7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgY2F0ZWdvcnkgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0uY2F0ZWdvcnk9ZGF0YVBhcnRzW3BdLmNhdGVnb3J5O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IG5hbWUgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubmFtZT1kYXRhUGFydHNbcF0ubmFtZTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBsYWJlbCAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5sYWJlbD1kYXRhUGFydHNbcF0ubGFiZWw7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yIHRpbWUgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLnRpbWUpO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS50aW1lKTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZXJyb3IgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXS5lcnJvcnMuY29kZSk7XG5cblx0XHRcdFx0XHQvKiogdXBkYXRlIGVycm9yTGlzdCAqKi9cblx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdClcblx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3Q9e307XG5cdFx0XHRcdFx0Zm9yKCB2YXIgZWwgaW4gZGF0YVBhcnRzW3BdLmVycm9yTGlzdCApXG5cdFx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdFtlbF0pXG5cdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3RbZWxdID0gZGF0YVBhcnRzW3BdLmVycm9yTGlzdFtlbF07XG5cdFx0XHRcdFx0dmFyIGV2dHNfdG1wID0ge1xuXHRcdFx0XHRcdFx0dGltZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS50aW1lKSxcblx0XHRcdFx0XHRcdGNvZGU6IHRoaXMuX2NvZGVyLmZyb20ocGFydHNbcF0uY29kZSksXG5cdFx0XHRcdFx0XHRjb2RlUmVmOiB0aGlzLl9jb2Rlci5mcm9tKHBhcnRzW3BdLmNvZGVSZWYpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHQvKiogaWYgcmVjZWl2ZWQgbGlzdCBvZiBldmVudHMgKiovXG5cdFx0XHRcdFx0aWYoQXJyYXkuaXNBcnJheShldnRzX3RtcC5jb2RlKSB8fCBBcnJheS5pc0FycmF5KGV2dHNfdG1wLnRpbWUpXG5cdFx0XHRcdFx0ICAgfHwgQXJyYXkuaXNBcnJheShldnRzX3RtcC5jb2RlUmVmKSkge1xuXHRcdFx0XHRcdFx0aWYoZXZ0c190bXAuY29kZS5sZW5ndGggPT09IGV2dHNfdG1wLmNvZGVSZWYubGVuZ3RoXG5cdFx0XHRcdFx0XHQgICAmJiBldnRzX3RtcC5jb2RlLmxlbmd0aCA9PT0gZXZ0c190bXAudGltZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0LyoqIGJ1aWxkIGxpc3Qgb2YgZXZlbnRzICoqL1xuXHRcdFx0XHRcdFx0XHRyUGFydHNbcF0uZXZ0cyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRmb3IodmFyIGk9MDsgaTxldnRzX3RtcC5jb2RlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0clBhcnRzW3BdLmV2dHMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aW1lOiBldnRzX3RtcC50aW1lW2ldLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29kZTogZXZ0c190bXAuY29kZVtpXSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvZGVSZWY6IGV2dHNfdG1wLmNvZGVSZWZbaV19KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBMb2dnZXIuZXJyb3IoXCJTdGF0dXM6SW5jb25zaXN0YW50IGxlbmd0aHMgb2YgYnVmZmVycyAodGltZS9jb2RlL2NvZGVSZWYpXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHsgLyoqIGp1c3QgaW4gY2FzZSwgdG8gcHJvdmlkZSBiYWNrd2FyZCBjb21wYXRpYmlsaXR5ICoqL1xuXHRcdFx0XHRcdFx0LyoqIHNldCByZWNlaXZlZCBldmVudCAqKi9cblx0XHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzID0gW3tcblx0XHRcdFx0XHRcdFx0dGltZTogZXZ0c190bXAudGltZSxcblx0XHRcdFx0XHRcdFx0Y29kZTogZXZ0c190bXAuY29kZSxcblx0XHRcdFx0XHRcdFx0Y29kZVJlZjogZXZ0c190bXAuY29kZVJlZn1dO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ3BhcnRzLCByUGFydHMnKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzKTtcbiBcdFx0Ly8gXHRjb25zb2xlLmxvZyhyUGFydHMpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIk5vIHBhcnRzIHRvIHJlYWQgZm9yIHJvYm90IFwiK2RhdGFbbl0ubmFtZSk7XG5cdFx0fVxuXHR9XG59O1xuXG5cbi8qKlxuICogVXBkYXRlIGludGVybmFsIHJvYm90IG1vZGVsIHdpdGggcmVjZWl2ZWQgZGF0YVxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgcmVjZWl2ZWQgZnJvbSBEaXlhTm9kZSBieSB3ZWJzb2NrZXRcbiAqIEByZXR1cm4ge1t0eXBlXX1cdFx0W2Rlc2NyaXB0aW9uXVxuICovXG5TdGF0dXMucHJvdG90eXBlLl9nZXRSb2JvdE1vZGVsRnJvbVJlY3YgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHJvYm90O1xuXG5cdGlmKCF0aGlzLnJvYm90TW9kZWwpXG5cdFx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdC8vIGNvbnNvbGUubG9nKFwiX2dldFJvYm90TW9kZWxGcm9tUmVjdlwiKTtcblx0Ly8gY29uc29sZS5sb2codGhpcy5yb2JvdE1vZGVsKTtcblxuXHQvKiogT25seSBvbmUgcm9ib3QgaXMgbWFuYWdlIGF0IHRoZSBzYW1lIHRpbWUgY3VycmVudGx5ICoqL1xuXHRmb3IodmFyIG4gaW4gZGF0YSkge1xuXHRcdGlmKCF0aGlzLnJvYm90TW9kZWxbbl0pXG5cdFx0XHR0aGlzLnJvYm90TW9kZWxbbl09e307XG5cdFx0dGhpcy5yb2JvdE1vZGVsW25dLnJvYm90ID0gZGF0YVtuXS5yb2JvdDtcblxuXHRcdC8vIGlmKHRoaXMucm9ib3RNb2RlbC5sZW5ndGg8ZGF0YS5sZW5ndGgpIHtcblx0XHQvLyBcdHRoaXMucm9ib3RNb2RlbC5wdXNoKHtyb2JvdDogZGF0YVswXS5yb2JvdHN9KTtcblx0XHQvLyB9XG5cblx0XHQvKiogZXh0cmFjdCBwYXJ0cyBpbmZvICoqL1xuXHRcdGlmKGRhdGFbbl0gJiYgZGF0YVtuXS5wYXJ0cykge1xuXHRcdFx0aWYoIXRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cylcblx0XHRcdFx0dGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzID0ge307XG5cdFx0XHR2YXIgcGFydHMgPSBkYXRhW25dLnBhcnRzO1xuXHRcdFx0dmFyIHJQYXJ0cyA9IHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cztcblx0XHRcdGZvcih2YXIgcSBpbiByUGFydHMpIHtcblx0XHRcdFx0LyoqIHBhcnRbcV0gd2FzIG5vdCBzZW50IGJlY2F1c2Ugbm8gZXJyb3IgKiovXG5cdFx0XHRcdGlmKCFwYXJ0c1txXVxuXHRcdFx0XHQgICAmJnJQYXJ0c1txXS5ldnRzJiZyUGFydHNbcV0uZXZ0cy5jb2RlKSB7XG5cdFx0XHRcdFx0clBhcnRzW3FdLmV2dHMgPSB7XG5cdFx0XHRcdFx0XHRjb2RlOiBbMF0sXG5cdFx0XHRcdFx0XHRjb2RlUmVmOiBbMF0sXG5cdFx0XHRcdFx0XHR0aW1lOiBbRGF0ZS5ub3coKV0gLyoqIHVwZGF0ZSAqKi9cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBwIGluIHBhcnRzKSB7XG5cdFx0XHRcdGlmKHBhcnRzW3BdJiZwYXJ0c1twXS5lcnIgJiYgcGFydHNbcF0uZXJyLnN0PjApIHtcblx0XHRcdFx0XHRMb2dnZXIuZXJyb3IoXCJQYXJ0cyBcIitwK1wiIHdhcyBpbiBlcnJvcjogXCIrZGF0YVtwXS5lcnIubXNnKTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZighclBhcnRzW3BdKSB7XG5cdFx0XHRcdFx0clBhcnRzW3BdPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHBhcnRzW3BdKSB7XG5cdFx0XHRcdFx0Ly8gTG9nZ2VyLmxvZyhuKTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBjYXRlZ29yeSAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5jYXRlZ29yeT1wYXJ0c1twXS5jYXRlZ29yeTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBuYW1lICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLm5hbWU9cGFydHNbcF0ubmFtZTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBsYWJlbCAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5sYWJlbD1wYXJ0c1twXS5sYWJlbDtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZXJyb3IgdGltZSAqL1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXS5lcnJvcnMudGltZSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coclBhcnRzW3BdLnRpbWUpO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciAqL1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy5jb2RlKTtcblxuXHRcdFx0XHRcdC8qKiB1cGRhdGUgZXJyb3JMaXN0ICoqL1xuXHRcdFx0XHRcdGlmKCFyUGFydHNbcF0uZXJyb3JMaXN0KVxuXHRcdFx0XHRcdFx0clBhcnRzW3BdLmVycm9yTGlzdD17fTtcblx0XHRcdFx0XHRmb3IoIHZhciBlbCBpbiBwYXJ0c1twXS5lcnJvckxpc3QgKVxuXHRcdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3RbZWxdKVxuXHRcdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0W2VsXSA9IHBhcnRzW3BdLmVycm9yTGlzdFtlbF07XG5cblx0XHRcdFx0XHRyUGFydHNbcF0uZXZ0cyA9IHtcblx0XHRcdFx0XHRcdGNvZGU6IHRoaXMuX2NvZGVyLmZyb20ocGFydHNbcF0uZXZ0cy5jb2RlKSxcblx0XHRcdFx0XHRcdGNvZGVSZWY6IHRoaXMuX2NvZGVyLmZyb20ocGFydHNbcF0uZXZ0cy5jb2RlUmVmKSxcblx0XHRcdFx0XHRcdHRpbWU6IHRoaXMuX2NvZGVyLmZyb20ocGFydHNbcF0uZXZ0cy50aW1lKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gY29uc29sZS5sb2coclBhcnRzW3BdLmVycm9yKTtcblx0XHRcdH1cblx0XHRcdC8vIGNvbnNvbGUubG9nKCdwYXJ0cywgclBhcnRzJyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0cyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHMpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIk5vIHBhcnRzIHRvIHJlYWQgZm9yIHJvYm90IFwiK2RhdGFbbl0ubmFtZSk7XG5cdFx0fVxuXHR9XG59O1xuXG4vKiogY3JlYXRlIFN0YXR1cyBzZXJ2aWNlICoqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5TdGF0dXMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbmV3IFN0YXR1cyh0aGlzKTtcbn07XG5cbi8qKlxuICogU2V0IG9uIHN0YXR1c1xuICogQHBhcmFtIHJvYm90TmFtZSB0byBmaW5kIHN0YXR1cyB0byBtb2RpZnlcbiAqIEBwYXJhbSBwYXJ0TmFtZSBcdHRvIGZpbmQgc3RhdHVzIHRvIG1vZGlmeVxuICogQHBhcmFtIGNvZGVcdFx0bmV3Q29kZVxuICogQHBhcmFtIHNvdXJjZVx0XHRzb3VyY2VcbiAqIEBwYXJhbSBjYWxsYmFja1x0XHRyZXR1cm4gY2FsbGJhY2sgKDxib29sPnN1Y2Nlc3MpXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuc2V0U3RhdHVzID0gZnVuY3Rpb24ocm9ib3ROYW1lLCBwYXJ0TmFtZSwgY29kZSwgc291cmNlLCBjYWxsYmFjaykge1xuXHR2YXIgZnVuY05hbWUgPSBcIlNldFN0YXR1c19cIitwYXJ0TmFtZTtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlOlwic3RhdHVzXCIsZnVuYzpmdW5jTmFtZSxkYXRhOiB7cm9ib3ROYW1lOiByb2JvdE5hbWUsIHN0YXR1c0NvZGU6IGNvZGUsIHBhcnROYW1lOiBwYXJ0TmFtZSwgc291cmNlOiBzb3VyY2V8MX19LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjayhmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKHRydWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBHZXQgb25lIHN0YXR1c1xuICogQHBhcmFtIHJvYm90TmFtZSB0byBnZXQgc3RhdHVzXG4gKiBAcGFyYW0gcGFydE5hbWUgXHR0byBnZXQgc3RhdHVzXG4gKiBAcGFyYW0gY2FsbGJhY2tcdFx0cmV0dXJuIGNhbGxiYWNrKC0xIGlmIG5vdCBmb3VuZC9kYXRhIG90aGVyd2lzZSlcbiAqIEBwYXJhbSBfZnVsbCBcdG1vcmUgZGF0YSBhYm91dCBzdGF0dXNcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5nZXRTdGF0dXMgPSBmdW5jdGlvbihyb2JvdE5hbWUsIHBhcnROYW1lLCBjYWxsYmFjaywgX2Z1bGwpIHtcblx0dmFyIGZ1bGw9X2Z1bGx8fGZhbHNlO1xuXHR0aGlzLnJlcXVlc3QoXG5cdFx0e3NlcnZpY2U6XCJzdGF0dXNcIixmdW5jOlwiR2V0U3RhdHVzXCIsZGF0YToge3JvYm90TmFtZTogcm9ib3ROYW1lLCBwYXJ0TmFtZTogcGFydE5hbWUsIGZ1bGw6IGZ1bGx9fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2soLTEpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjayhkYXRhKTtcblx0XHRcdH1cblx0XHR9KTtcbn07XG4iLCIvKlxuICogQ29weXJpZ2h0IDogUGFydG5lcmluZyAzLjAgKDIwMDctMjAxNilcbiAqIEF1dGhvciA6IFN5bHZhaW4gTWFow6kgPHN5bHZhaW4ubWFoZUBwYXJ0bmVyaW5nLmZyPlxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGRpeWEtc2RrLlxuICpcbiAqIGRpeWEtc2RrIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGRpeWEtc2RrIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIGRpeWEtc2RrLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cblxuXG5cblxuLyogbWF5YS1jbGllbnRcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqXHQzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjaGFubmVsIGVuY29kaW5nXG4gKiAtIGJhc2U2NCBjb2RpbmdcbiAqIC0gbm9uZVxuICogRGF0YSBmb3JtYXQgOlxuICpcdFx0dDogeydiNjQnLCdub25lJ31cbiAqXHRcdGI6IDxpZiBiNjQ+IHs0LDh9XG4gKlx0XHRkOiBlbmNvZGVkIGRhdGEge2J1ZmZlciBvciBBcnJheX1cbiAqXHRcdHM6IHNpemVcbiAqL1xuXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZS02NCcpO1xuXG4vKipcbiAqIERlZmF1bHQgOiBubyBlbmNvZGluZ1xuICogKi9cbmZ1bmN0aW9uIE5vQ29kaW5nKCl7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qXG4qL1xuTm9Db2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKGRhdGEuZCA9PT0gJ251bWJlcicgfHwgQXJyYXkuaXNBcnJheShkYXRhLmQpKVxuXHRcdHJldHVybiBkYXRhLmQ7XG5cdGVsc2Vcblx0XHRyZXR1cm4gZGF0YTtcbn07XG5cbi8qKlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5KSB7XG5cdHJldHVybiB7XG5cdFx0dDogJ25vJywgLyogdHlwZSAqL1xuXHRcdGQ6IGFycmF5LCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoXG5cdH07XG59O1xuXG5cblxuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgYmFzZTY0IGVuY29kaW5nXG4gKiBFZmZlY3RpdmUgZm9yIHN0cmluZyBiYXNlZCBjaGFubmVscyAobGlrZSBKU09OIGJhc2VkIFdTKVxuICogKi9cbmZ1bmN0aW9uIEJhc2U2NENvZGluZygpe1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgICBVdGlsaXR5IGZ1bmN0aW9ucyAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qXFxcbiB8KnxcbiB8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcbiB8KnxcbiB8KnwgIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvRMOpY29kZXJfZW5jb2Rlcl9lbl9iYXNlNjRcbiB8KnxcbiBcXCovXG4vKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cbnZhciBiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0bkNociAtIDY1XG5cdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0bkNociAtIDcxXG5cdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRuQ2hyICsgNFxuXHRcdDogbkNociA9PT0gNDMgP1xuXHRcdDYyXG5cdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0NjNcblx0XHQ6XHQwO1xufTtcblxuLyoqXG4gKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjRcdFx0YmFzZTY0IGNvZGVkIHN0cmluZ1xuICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9XHRcdFx0XHR0YWIgb2YgZGVjb2RlZCBieXRlc1xuICovXG52YXIgYmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHR2YXJcblx0c0I2NEVuYyA9IHNCYXNlNjQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csIFwiXCIpLCBuSW5MZW4gPSBzQjY0RW5jLmxlbmd0aCxcblx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRmb3IgKHZhciBuTW9kMywgbk1vZDQsIG5VaW50MjQgPSAwLCBuT3V0SWR4ID0gMCwgbkluSWR4ID0gMDsgbkluSWR4IDwgbkluTGVuOyBuSW5JZHgrKykge1xuXHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0aWYgKG5Nb2Q0ID09PSAzIHx8IG5JbkxlbiAtIG5JbklkeCA9PT0gMSkge1xuXHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0fVxuXHRcdFx0blVpbnQyNCA9IDA7XG5cdFx0fVxuXHR9XG5cdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdHJldHVybiBidWZmZXI7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgIEludGVyZmFjZSBmdW5jdGlvbnMgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4qIENvbnZlcnQgYnVmZmVyIGNvZGVkIGluIGJhc2U2NCBhbmQgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5XG4qIGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBhcnJheVxuKiBAcGFyYW0gYnVmZmVyIGluIGJhc2U2NFxuKiBAcGFyYW0gYnl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggbnVtYmVyICg0IG9yIDgpXG4qIEByZXR1cm4gYXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0KS4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdHZhciBieXRlQ29kaW5nID0gZGF0YS5iO1xuXG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyogZGVjb2RlIGRhdGEgdG8gYXJyYXkgb2YgYnl0ZSAqL1xuXHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YS5kLCBkYXRhLmIpO1xuXHQvKiBwYXJzZSBkYXRhIHRvIGZsb2F0IGFycmF5ICovXG5cdHZhciBmQXJyYXk9bnVsbDtcblx0c3dpdGNoKGRhdGEuYikge1xuXHRjYXNlIDQ6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0NjRBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRkZWZhdWx0OlxuXHRcdGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBieXRlQ29kaW5nISBTaG91bGQgbm90IGhhcHBlbiEhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qIHBhcnNlIGZBcnJheSBpbnRvIG5vcm1hbCBhcnJheSAqL1xuXHR2YXIgdGFiID0gW10uc2xpY2UuY2FsbChmQXJyYXkpO1xuXG5cdGlmKGRhdGEucyAhPT0gdGFiLmxlbmd0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCB3aGVuIGRlY29kaW5nICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRhYjtcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGFycmF5IGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieSBieXRlQ29kaW5nIGJ5dGVzIGludG8gYnVmZmVyIGNvZGVkIGluIGJhc2U2NFxuKiBAcGFyYW0gXHR7QXJyYXk8RmxvYXQ+fSBcdGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCBiaXRzKVxuKiBAcGFyYW0gXHR7aW50ZWdlcn0gXHRieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBmbG9hdCAoNCBvciA4KVxuKiBAcmV0dXJuICBcdHtTdHJpbmd9IFx0YnVmZmVyIGluIGJhc2U2NC4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIGJ5dGVDb2RpbmcpIHtcblx0LyogY2hlY2sgYnl0ZSBjb2RpbmcgKi9cblx0aWYoYnl0ZUNvZGluZyAhPT0gNCAmJiBieXRlQ29kaW5nICE9PSA4KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKioqIGNhc2UgQXJyYXlCdWZmZXIgKioqL1xuXHR2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGFycmF5Lmxlbmd0aCpieXRlQ29kaW5nKTtcblx0c3dpdGNoKGJ5dGVDb2RpbmcpIHtcblx0Y2FzZSA0OlxuXHRcdHZhciBidWYzMiA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKTtcblx0XHRidWYzMi5zZXQoYXJyYXkpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0dmFyIGJ1ZjY0ID0gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuXHRcdGJ1ZjY0LnNldChhcnJheSk7XG5cdFx0YnJlYWs7XG5cdH1cblx0dmFyIGJ1ZmZDaGFyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblx0dmFyIGJ1ZmZDaGFyQ29kZWQgPSBuZXcgQXJyYXkoYnVmZkNoYXIubGVuZ3RoKTtcblx0Zm9yKHZhciBuID0wOyBuPGJ1ZmZDaGFyLmxlbmd0aDsgbisrKSB7XG5cdFx0YnVmZkNoYXJDb2RlZFtuXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZkNoYXJbbl0pO1xuXHR9XG5cdHZhciBzdHIgPSBuZXcgU3RyaW5nKGJ1ZmZDaGFyQ29kZWQuam9pbignJykpO1xuXHR2YXIgYjY0QnVmZiA9IGJhc2U2NC5lbmNvZGUoc3RyKTtcblx0cmV0dXJuIHtcblx0XHR0OiAnYjY0JywgLyogdHlwZSAqL1xuXHRcdGI6IGJ5dGVDb2RpbmcsIC8qIGJ5dGVDb2RpbmcgKi9cblx0XHRkOiBiNjRCdWZmLCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoIC8qIHNpemUgKi9cblx0fTtcbn07XG5cblxuXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjb21tIGVuY29kaW5nXG4gKiAqL1xuZnVuY3Rpb24gQ29kaW5nSGFuZGxlcigpe1xuXHR0aGlzLmI2NCA9IG5ldyBCYXNlNjRDb2RpbmcoKTtcblx0dGhpcy5ub25lID0gbmV3IE5vQ29kaW5nKCk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKHR5cGVvZiBkYXRhID09ICd1bmRlZmluZWQnIHx8IGRhdGE9PW51bGwpXG5cdFx0cmV0dXJuIG51bGw7XG5cdHN3aXRjaChkYXRhLnQpIHtcblx0Y2FzZSAnYjY0Jzpcblx0XHRyZXR1cm4gdGhpcy5iNjQuZnJvbShkYXRhKTtcblx0ZGVmYXVsdDpcblx0XHRyZXR1cm4gdGhpcy5ub25lLmZyb20oZGF0YSk7XG5cdH1cbn07XG5cblxuQ29kaW5nSGFuZGxlci5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihhcnJheSwgdHlwZSwgYnl0ZUNvZGluZykge1xuXHRpZih0eXBlb2YgYXJyYXkgPT09ICdudW1iZXInKSB7XG5cdFx0YXJyYXk9W2FycmF5XTtcblx0fVxuXHRpZighQXJyYXkuaXNBcnJheShhcnJheSkpe1xuXHRcdGNvbnNvbGUubG9nKFwiQ29kaW5nSGFuZGxlci50byBvbmx5IGFjY2VwdHMgYXJyYXkgIVwiKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHN3aXRjaCh0eXBlKSB7XG5cdGNhc2UgJ2I2NCc6XG5cdFx0cmV0dXJuIHRoaXMuYjY0LnRvKGFycmF5LCBieXRlQ29kaW5nKTtcblx0Y2FzZSAnbm8nOlxuXHRkZWZhdWx0OlxuXHRcdHJldHVybiB0aGlzLm5vbmUudG8oYXJyYXkpO1xuXHR9XG59O1xuXG5cbi8qKiBBZGQgYmFzZTY0IGhhbmRsZXIgdG8gRGl5YVNlbGVjdG9yICoqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbmV3IENvZGluZ0hhbmRsZXIoKTtcbn07XG4iXX0=
