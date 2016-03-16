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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiJdfQ==
},{"./support/isBuffer":3,"_process":2,"inherits":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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


DiyaNode.prototype.addr = function() { return this._addr; };
DiyaNode.prototype.peers = function(){ return this._peers; };
DiyaNode.prototype.self = function() { return this._self; };
DiyaNode.prototype.setSecured = function(bSecured) { this._secured = bSecured !== false; };
DiyaNode.prototype.setWSocket = function(WSocket) {this._WSocket = WSocket;}



/** @return {Promise<String>} the connected peer name */
DiyaNode.prototype.connect = function(addr, WSocket){
	var that = this;
	this.bDontReconnected = false;

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

		sock.on('open', function(){
			if(that._socketHandler !== sock) {
				console.log("[d1] Websocket responded but already connected to a different one");
				return;
			}
			that._socketHandler = sock;
			that._status = 'opened';
			that._setupPingResponse();
		});

		sock.on('close', function() {
			if(that._socketHandler !== sock) return;
			that._socketHandler = null;
			that._status = 'closed';
			that._stopPingResponse();
			that._onclose();
			if(that._connectionDeferred) { that._connectionDeferred.reject("closed"); that._connectionDeferred = null;}
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
	this.bDontReconnected = true;
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
	return this._socketHandler.send(message);
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

DiyaNode.prototype._onclose = function(){
	var that = this;

	this._clearMessages('PeerDisconnected');
	this._clearPeers();

	Logger.log('d1: connection lost, try reconnecting');
	setTimeout(function(){
		that.connect(that._addr, that._WSocket).catch(function(err){});
	}, that._reconnectTimeout);

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

		this._socket.addEventListener('open', this._socketOpenCallback);
		this._socket.addEventListener('close',this._socketCloseCallback);
		this._socket.addEventListener('message', this._socketMessageCallback);

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

SocketHandler.prototype._onclose = function() {
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

},{"inherits":5,"node-event-emitter":6,"q":undefined}],8:[function(require,module,exports){
var isBrowser = !(typeof window === 'undefined');
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var connection = new DiyaNode();
var connectionEvents = new EventEmitter();
var _user = null;
var _pass = null;
var _authenticated = false;


//////////////
//  D1 API  //
//////////////


function d1(selector){
	return new DiyaSelector(selector);
}

d1.DiyaNode = DiyaNode;
d1.DiyaSelector = DiyaSelector;

d1.connect = function(addr, WSocket){
	return connection.connect(addr, WSocket);
};

d1.disconnect = function(){
	return connection.disconnect();
};

d1.isConnected = function() {	return connection.isConnected();};
d1.peers = function() { return connection.peers();};
d1.self = function() { return connection.self(); };
d1.addr = function() { return connection.addr(); };
d1.user = function() { return _user; };
d1.pass = function() { return _pass; };
d1.isAuthenticated = function() { return _authenticated; }


/** Try to connect to the given servers list in the list order, until finding an available one */
d1.tryConnect = function(servers, WSocket){
	var deferred = Q.defer();
	function tc(i) {
		d1.connect(servers[i], WSocket).then(function(e){
			return deferred.resolve(servers[i]);
		}).catch(function(e){
			d1.disconnect().then(function() {
				i++;
				if(i<servers.length) setTimeout(function() {tc(i);}, 100);
				else return deferred.reject("Timeout");
			});
		});
	}
	tc(0);
	return deferred.promise;
}

d1.currentServer = function(){
	return connection._addr;
};

d1.on = function(event, callback){
	connection.on(event, callback);
	return d1;
};

d1.removeListener = function(event, callback){
	connection.removeListener(event, callback);
	return d1;
};

/** Shorthand function to connect and login with the given (user,password) */
d1.connectAsUser = function(ip, user, password, WSocket) {
	return d1.connect(ip, WSocket).then(function(){
		return d1("#self").auth(user, password);
	});
};

d1.deauthenticate = function(){ _authenticated = false; _user = null; _pass = null;};
d1.setSecured = function(bSecured) { connection.setSecured(bSecured); };
d1.isSecured = function() {return connection._secured; }
d1.setWSocket = function(WSocket) { connection.setWSocket(WSocket); }


/** Self-authenticate the local DiyaNode bound to port <port>, using its RSA signature */
d1.selfConnect = function(port, signature, WSocket) {
	return d1.connect('ws://localhost:' + port, WSocket)
		.then(function() {
			var deferred = Q.defer();
			d1("#self").request({
				service: 'peerAuth',
				func: 'SelfAuthenticate',
				data: {	signature: signature }
			}, function(peerId, err, data){
				if(err) return deferred.reject(err);
				if(data && data.authenticated){
					_authenticated = true;
					_user = "#DiyaNode#"+peerId;
					deferred.resolve();
				} else {
					_authenticated = false;
					deferred.reject('AccessDenied');
				}
			});
			return deferred.promise;
	});
}



//////////////////
// DiyaSelector //
//////////////////

function DiyaSelector(selector){
	EventEmitter.call(this);

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
	if(!connection) return this;
	if(!options) options = {};
	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedRequest';
		params = {service:_params[0], func:_params[1]};
	}

	var nbAnswers = 0;
	var nbExpected = this._select().length;
	return this.each(function(peerId){
		params.target = peerId;

		var opts = {};
		for(var i in options) opts[i] = options[i];
		if(typeof opts.callback_partial === 'function') opts.callback_partial = function(err, data){ options.callback_partial(peerId, err, data);}

		connection.request(params, function(err, data){
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
	if(typeof callback === 'function') callback = callback.bind(this);

	var deferred = Q.defer();

	this.request({
		service: 'auth',
		func: 'Authenticate',
		data: {
			user: user,
			password: password
		}
	}, function(peerId, err, data){

		if(err === 'ServiceNotFound'){
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.reject(err);
			return ;
		}

		if(!err && data && data.authenticated){
			_authenticated = true;
			_user = user;
			_pass = password;
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.resolve();
		} else {
			_authenticated = false;
			if(typeof callback === 'function') callback(peerId, false);
			else deferred.reject('AccessDenied');
		}

	}, timeout);

	return deferred.promise;
};



// Privates

DiyaSelector.prototype._select = function(selectorFunction){
	var that = this;

	if(!connection) return [];
	return connection.peers().filter(function(peerId){
		return match(that._selector, peerId);
	});
};

function match(selector, str){
	if(!selector) return false;
	if(selector === "#self") return connection && str===connection.self();
	else if(selector.not) return !match(selector.not, str);
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
	callback.___DiyaSelector_hidden_wrapper = function(peerId) {
		if(match(this._selector, peerId)) this.emit(type, peerId);
	};
	connection.on(type, callback.___DiyaSelector_hidden_wrapper);
	var ret = this._on(type, callback);

	// Handle the specific case of "peer-connected" events, i.e., notify of already connected peers
	if(type === 'peer-connected' && connection.isConnected()) {
		var peers = connection.peers();
		for(var i=0;i<peers.length; i++) {
			if(match(this._selector, peers[i])) callback(peers[i]);
		}
	}
	return ret;
};


// Overrides EventEmitter's behavior to proxy and filter events from the connection
DiyaSelector.prototype._removeListener = DiyaSelector.prototype.removeListener;
DiyaSelector.prototype.removeListener = function(type, callback) {
	if(callback.___DiyaSelector_hidden_wrapper) connection.removeListener(type, callback.___DiyaSelector_hidden_wrapper);
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
		connection.unsubscribe(this.subIds[i]);
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
	var subId = connection.subscribe(params, function(err, data){
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
		if(subId) connection.unsubscribe(subId);
	});
	return this;
}



// -------------------------------------



module.exports = d1;

},{"./DiyaNode":7,"inherits":5,"node-event-emitter":6,"q":undefined}],9:[function(require,module,exports){
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

},{"./DiyaSelector.js":8,"./services/ieq/ieq.js":10,"./services/maps/maps.js":11,"./services/meshNetwork/MeshNetwork.js":12,"./services/peerAuth/PeerAuth.js":14,"./services/rtc/rtc.js":15,"./services/status/status.js":16,"./utils/encoding/encoding.js":17}],10:[function(require,module,exports){
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
function IEQ(selector){
	var that = this;
	this.selector = selector;
	this.dataModel={};
	this._coder = selector.encode();
	this.subscriptions = [];


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

		 sensors : {[null] or ArrayOf SensorName}

		 sampling: {[null] or int}
	*/
	this.dataConfig = {
		criteria: {
			time: {
				beg: null,
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
 * Set or get data time criteria beg and end.
 * If param defined
 *	@param {Date} newTimeBeg // may be null
 *	@param {Date} newTimeEnd // may be null
 *	@return {IEQ} this
 * If no param defined:
 *	@return {Object} Time object: fields beg and end.
 */
IEQ.prototype.DataTime = function(newTimeBeg,newTimeEnd, newRange){
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

		// console.log(data);
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
IEQ.prototype.watch = function(data, callback){
	var that = this;
	// console.log("Request: "+JSON.stringify(dataConfig));

	/// TODO
	data = data || {timeRange: 'hours'};

	var subs = this.selector.subscribe({
		service: "ieq",
		func: "Data",
		data: data
	}, function(dnId, err, data){
		if(err) {
			Logger.error("WatchIEQRecvErr:"+JSON.stringify(err));
			return;
		}
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("WatchIEQ:\n"+JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
			return;
		}
		// console.log(data);
		that._getDataModelFromRecv(data);

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
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
IEQ.prototype._getDataModelFromRecv = function(data){
	var dataModel=null;

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

				/* suggested y display range */
				dataModel[n].zoomRange = [0, 100];

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

},{"../../DiyaSelector":8,"../message":13,"util":4}],11:[function(require,module,exports){
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
	d1("#self").subscribe({
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
	d1("#self").unsubscribe(this._subIds);
	for(var peerId in this._diyas){
		that.emit("peer-unsubscribed", peerId);
	}
	this._diyas = {};// delete ?
	this.removeAllListeners();
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

},{"node-event-emitter":6}],12:[function(require,module,exports){
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

},{"../../DiyaSelector":8,"q":undefined}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"../../DiyaSelector":8,"q":undefined}],15:[function(require,module,exports){
DiyaSelector = require('../../DiyaSelector').DiyaSelector;
EventEmitter = require('node-event-emitter');
inherits = require('inherits');


if(typeof window !== 'undefined'){
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
}




/////////////
// CHANNEL //
/////////////

/** Handles a RTC channel (datachannel and/or stream) to a DiyaNode peer
 *  @param dnId : the DiyaNode peerId
 *  @param name : the channel's name
 *  @param datachannel_cb : callback called when a RTC datachannel is open for this channel
 *  @param stream_cb : callback called when a RTC stream is open for this channel
 */
function Channel(dnId, name, datachannel_cb, stream_cb){
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
			if(data.eventType === 'RemoteOffer') that._createPeer(data);
			else if(data.eventType === 'RemoteICECandidate') that._addRemoteICECandidate(data);
		}
	});

	this._timeoutId = setTimeout(function(){ if(!that.connected && !that.closed) that._reconnect(); }, 10000);
};

/** Reconnects the RTC peer */
Peer.prototype._reconnect = function(){
	this.close();

	this.peer = null;
	this.connected = false;
	this.closed = false;

	this._connect();
};

var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

/** Creates a RTCPeerConnection in response to a RemoteOffer */
Peer.prototype._createPeer = function(data){
	var that = this;

	var peer = new RTCPeerConnection(servers,  {mandatory: {DtlsSrtpKeyAgreement: true, EnableDtlsSrtp: true, OfferToReceiveAudio: true, OfferToReceiveVideo:true}});
	this.peer = peer;

	this.streams.forEach(function(s) {
		peer.addStream(s);
	});

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
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
		else if(peer.iceConnectionState === 'disconnected'){
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
		console.error("sfudsduidfgufdsywgwdsuygdw!!!!");
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

},{"../../DiyaSelector":8,"inherits":5,"node-event-emitter":6}],16:[function(require,module,exports){
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
		// console.log(err);
		// console.log(data);
		if (err || (data&&data.err&data.err.st) ) {
			Logger.error( "StatusSubscribe:"+(err?err:"")+"\n"+(data&&data.err?data.err:"") );
		} else {
			if(data && data.header
			   && data.header.type === "init") {
				// initialisation of robot model
				that.robotModelInit = true;
			}
			// console.log(data);
			if(that.robotModelInit) {
				that._getRobotModelFromRecv2(data);
				if(typeof callback === 'function')
					callback(that.robotModel);
			}
			else {
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
Status.prototype.closeSubscriptions = function(){
	for(var i in this.subscriptions) {
		this.subscriptions[i].close();
	}
	this.subscriptions =[];
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

	/** Only one robot is manage at the same time currently **/
	for(var n in dataRobots) {
		if(!this.robotModel[n])
			this.robotModel[n]={};
		this.robotModel[n].robot = dataRobots[n].robot;

		// if(this.robotModel.length<data.length) {
		// 	this.robotModel.push({robot: data[0].robots});
		// }

		/** extract parts info **/
		if(dataRobots[n] && dataRobots[n].parts) {
			if(!this.robotModel[n].parts)
				this.robotModel[n].parts = {};
			var parts = dataRobots[n].parts;
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

					rParts[p].evts = {
						code: parts[p].code,
						codeRef: parts[p].codeRef,
						time: parts[p].time
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
 * @param callback		return callback (<bool>success)
 */
DiyaSelector.prototype.setStatus = function(robotName, partName, code, source, callback) {
	var funcName = "SetStatus_"+partName;
	this.request(
		{service:"status",func:funcName,data: {robotName: robotName, statusCode: code, source: source|1}}, function(peerId, err, data) {
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

},{"../../DiyaSelector":8,"../message":13,"util":4}],17:[function(require,module,exports){
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
 * Effective for string based channels (like JSON based WS)
 * */
function NoCoding(){
	return this;
};

/**
* Convert buffer coded in base64 and containing numbers coded by
* byteCoding bytes into array
* @param buffer in base64
* @param byteCoding number of bytes for each number (4 or 8)
* @return array of float (32 or 64). null if could not convert.
*/
NoCoding.prototype.from = function(data) {
	return data.d;
};

/**
* Convert array containing numbers coded by byteCoding bytes into buffer coded in base64
* @param 	{Array<Float>} 	array of float (32 or 64 bits)
* @param 	{integer} 	byteCoding number of bytes for each float (4 or 8)
* @return  	{String} 	buffer in base64. null if could not convert.
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
	var str = String.fromCharCode.apply(null, buffChar);
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
	if(!data || data===null)
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

},{"../../DiyaSelector":8,"base-64":1}]},{},[9])(9)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9qZmVsbHVzL3AvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jhc2UtNjQvYmFzZTY0LmpzIiwiL2hvbWUvamZlbGx1cy9wL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9qZmVsbHVzL3AvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCIvaG9tZS9qZmVsbHVzL3AvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIi9ob21lL2pmZWxsdXMvcC9kaXlhLXNkay9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL2pmZWxsdXMvcC9kaXlhLXNkay9ub2RlX21vZHVsZXMvbm9kZS1ldmVudC1lbWl0dGVyL2luZGV4LmpzIiwiL2hvbWUvamZlbGx1cy9wL2RpeWEtc2RrL3NyYy9EaXlhTm9kZS5qcyIsIi9ob21lL2pmZWxsdXMvcC9kaXlhLXNkay9zcmMvRGl5YVNlbGVjdG9yLmpzIiwiL2hvbWUvamZlbGx1cy9wL2RpeWEtc2RrL3NyYy9kaXlhLXNkay5qcyIsIi9ob21lL2pmZWxsdXMvcC9kaXlhLXNkay9zcmMvc2VydmljZXMvaWVxL2llcS5qcyIsIi9ob21lL2pmZWxsdXMvcC9kaXlhLXNkay9zcmMvc2VydmljZXMvbWFwcy9tYXBzLmpzIiwiL2hvbWUvamZlbGx1cy9wL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9tZXNoTmV0d29yay9NZXNoTmV0d29yay5qcyIsIi9ob21lL2pmZWxsdXMvcC9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzc2FnZS5qcyIsIi9ob21lL2pmZWxsdXMvcC9kaXlhLXNkay9zcmMvc2VydmljZXMvcGVlckF1dGgvUGVlckF1dGguanMiLCIvaG9tZS9qZmVsbHVzL3AvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3J0Yy9ydGMuanMiLCIvaG9tZS9qZmVsbHVzL3AvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3N0YXR1cy9zdGF0dXMuanMiLCIvaG9tZS9qZmVsbHVzL3AvZGl5YS1zZGsvc3JjL3V0aWxzL2VuY29kaW5nL2VuY29kaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0aUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKiEgaHR0cDovL210aHMuYmUvYmFzZTY0IHYwLjEuMCBieSBAbWF0aGlhcyB8IE1JVCBsaWNlbnNlICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgLlxuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLlxuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgLCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUsIGFuZCB1c2Vcblx0Ly8gaXQgYXMgYHJvb3RgLlxuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBJbnZhbGlkQ2hhcmFjdGVyRXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0fTtcblx0SW52YWxpZENoYXJhY3RlckVycm9yLnByb3RvdHlwZSA9IG5ldyBFcnJvcjtcblx0SW52YWxpZENoYXJhY3RlckVycm9yLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cblx0dmFyIGVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdC8vIE5vdGU6IHRoZSBlcnJvciBtZXNzYWdlcyB1c2VkIHRocm91Z2hvdXQgdGhpcyBmaWxlIG1hdGNoIHRob3NlIHVzZWQgYnlcblx0XHQvLyB0aGUgbmF0aXZlIGBhdG9iYC9gYnRvYWAgaW1wbGVtZW50YXRpb24gaW4gQ2hyb21pdW0uXG5cdFx0dGhyb3cgbmV3IEludmFsaWRDaGFyYWN0ZXJFcnJvcihtZXNzYWdlKTtcblx0fTtcblxuXHR2YXIgVEFCTEUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cdC8vIGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvY29tbW9uLW1pY3Jvc3ludGF4ZXMuaHRtbCNzcGFjZS1jaGFyYWN0ZXJcblx0dmFyIFJFR0VYX1NQQUNFX0NIQVJBQ1RFUlMgPSAvW1xcdFxcblxcZlxcciBdL2c7XG5cblx0Ly8gYGRlY29kZWAgaXMgZGVzaWduZWQgdG8gYmUgZnVsbHkgY29tcGF0aWJsZSB3aXRoIGBhdG9iYCBhcyBkZXNjcmliZWQgaW4gdGhlXG5cdC8vIEhUTUwgU3RhbmRhcmQuIGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvd2ViYXBwYXBpcy5odG1sI2RvbS13aW5kb3diYXNlNjQtYXRvYlxuXHQvLyBUaGUgb3B0aW1pemVkIGJhc2U2NC1kZWNvZGluZyBhbGdvcml0aG0gdXNlZCBpcyBiYXNlZCBvbiBAYXRr4oCZcyBleGNlbGxlbnRcblx0Ly8gaW1wbGVtZW50YXRpb24uIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2F0ay8xMDIwMzk2XG5cdHZhciBkZWNvZGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdGlucHV0ID0gU3RyaW5nKGlucHV0KVxuXHRcdFx0LnJlcGxhY2UoUkVHRVhfU1BBQ0VfQ0hBUkFDVEVSUywgJycpO1xuXHRcdHZhciBsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdFx0aWYgKGxlbmd0aCAlIDQgPT0gMCkge1xuXHRcdFx0aW5wdXQgPSBpbnB1dC5yZXBsYWNlKC89PT8kLywgJycpO1xuXHRcdFx0bGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRsZW5ndGggJSA0ID09IDEgfHxcblx0XHRcdC8vIGh0dHA6Ly93aGF0d2cub3JnL0MjYWxwaGFudW1lcmljLWFzY2lpLWNoYXJhY3RlcnNcblx0XHRcdC9bXithLXpBLVowLTkvXS8udGVzdChpbnB1dClcblx0XHQpIHtcblx0XHRcdGVycm9yKFxuXHRcdFx0XHQnSW52YWxpZCBjaGFyYWN0ZXI6IHRoZSBzdHJpbmcgdG8gYmUgZGVjb2RlZCBpcyBub3QgY29ycmVjdGx5IGVuY29kZWQuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIGJpdENvdW50ZXIgPSAwO1xuXHRcdHZhciBiaXRTdG9yYWdlO1xuXHRcdHZhciBidWZmZXI7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdHZhciBwb3NpdGlvbiA9IC0xO1xuXHRcdHdoaWxlICgrK3Bvc2l0aW9uIDwgbGVuZ3RoKSB7XG5cdFx0XHRidWZmZXIgPSBUQUJMRS5pbmRleE9mKGlucHV0LmNoYXJBdChwb3NpdGlvbikpO1xuXHRcdFx0Yml0U3RvcmFnZSA9IGJpdENvdW50ZXIgJSA0ID8gYml0U3RvcmFnZSAqIDY0ICsgYnVmZmVyIDogYnVmZmVyO1xuXHRcdFx0Ly8gVW5sZXNzIHRoaXMgaXMgdGhlIGZpcnN0IG9mIGEgZ3JvdXAgb2YgNCBjaGFyYWN0ZXJz4oCmXG5cdFx0XHRpZiAoYml0Q291bnRlcisrICUgNCkge1xuXHRcdFx0XHQvLyDigKZjb252ZXJ0IHRoZSBmaXJzdCA4IGJpdHMgdG8gYSBzaW5nbGUgQVNDSUkgY2hhcmFjdGVyLlxuXHRcdFx0XHRvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShcblx0XHRcdFx0XHQweEZGICYgYml0U3RvcmFnZSA+PiAoLTIgKiBiaXRDb3VudGVyICYgNilcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHQvLyBgZW5jb2RlYCBpcyBkZXNpZ25lZCB0byBiZSBmdWxseSBjb21wYXRpYmxlIHdpdGggYGJ0b2FgIGFzIGRlc2NyaWJlZCBpbiB0aGVcblx0Ly8gSFRNTCBTdGFuZGFyZDogaHR0cDovL3doYXR3Zy5vcmcvaHRtbC93ZWJhcHBhcGlzLmh0bWwjZG9tLXdpbmRvd2Jhc2U2NC1idG9hXG5cdHZhciBlbmNvZGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdGlucHV0ID0gU3RyaW5nKGlucHV0KTtcblx0XHRpZiAoL1teXFwwLVxceEZGXS8udGVzdChpbnB1dCkpIHtcblx0XHRcdC8vIE5vdGU6IG5vIG5lZWQgdG8gc3BlY2lhbC1jYXNlIGFzdHJhbCBzeW1ib2xzIGhlcmUsIGFzIHN1cnJvZ2F0ZXMgYXJlXG5cdFx0XHQvLyBtYXRjaGVkLCBhbmQgdGhlIGlucHV0IGlzIHN1cHBvc2VkIHRvIG9ubHkgY29udGFpbiBBU0NJSSBhbnl3YXkuXG5cdFx0XHRlcnJvcihcblx0XHRcdFx0J1RoZSBzdHJpbmcgdG8gYmUgZW5jb2RlZCBjb250YWlucyBjaGFyYWN0ZXJzIG91dHNpZGUgb2YgdGhlICcgK1xuXHRcdFx0XHQnTGF0aW4xIHJhbmdlLidcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHZhciBwYWRkaW5nID0gaW5wdXQubGVuZ3RoICUgMztcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0dmFyIHBvc2l0aW9uID0gLTE7XG5cdFx0dmFyIGE7XG5cdFx0dmFyIGI7XG5cdFx0dmFyIGM7XG5cdFx0dmFyIGQ7XG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHQvLyBNYWtlIHN1cmUgYW55IHBhZGRpbmcgaXMgaGFuZGxlZCBvdXRzaWRlIG9mIHRoZSBsb29wLlxuXHRcdHZhciBsZW5ndGggPSBpbnB1dC5sZW5ndGggLSBwYWRkaW5nO1xuXG5cdFx0d2hpbGUgKCsrcG9zaXRpb24gPCBsZW5ndGgpIHtcblx0XHRcdC8vIFJlYWQgdGhyZWUgYnl0ZXMsIGkuZS4gMjQgYml0cy5cblx0XHRcdGEgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA8PCAxNjtcblx0XHRcdGIgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pIDw8IDg7XG5cdFx0XHRjID0gaW5wdXQuY2hhckNvZGVBdCgrK3Bvc2l0aW9uKTtcblx0XHRcdGJ1ZmZlciA9IGEgKyBiICsgYztcblx0XHRcdC8vIFR1cm4gdGhlIDI0IGJpdHMgaW50byBmb3VyIGNodW5rcyBvZiA2IGJpdHMgZWFjaCwgYW5kIGFwcGVuZCB0aGVcblx0XHRcdC8vIG1hdGNoaW5nIGNoYXJhY3RlciBmb3IgZWFjaCBvZiB0aGVtIHRvIHRoZSBvdXRwdXQuXG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDE4ICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDEyICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDYgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgJiAweDNGKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAocGFkZGluZyA9PSAyKSB7XG5cdFx0XHRhID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikgPDwgODtcblx0XHRcdGIgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pO1xuXHRcdFx0YnVmZmVyID0gYSArIGI7XG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDEwKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyID4+IDQpICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA8PCAyKSAmIDB4M0YpICtcblx0XHRcdFx0Jz0nXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAocGFkZGluZyA9PSAxKSB7XG5cdFx0XHRidWZmZXIgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA8PCA0KSAmIDB4M0YpICtcblx0XHRcdFx0Jz09J1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdHZhciBiYXNlNjQgPSB7XG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCd2ZXJzaW9uJzogJzAuMS4wJ1xuXHR9O1xuXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGJhc2U2NDtcblx0XHR9KTtcblx0fVx0ZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IGJhc2U2NDtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yICh2YXIga2V5IGluIGJhc2U2NCkge1xuXHRcdFx0XHRiYXNlNjQuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IGJhc2U2NFtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LmJhc2U2NCA9IGJhc2U2NDtcblx0fVxuXG59KHRoaXMpKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5aVlYTmxMVFkwTDJKaGMyVTJOQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxSVNCb2RIUndPaTh2YlhSb2N5NWlaUzlpWVhObE5qUWdkakF1TVM0d0lHSjVJRUJ0WVhSb2FXRnpJSHdnVFVsVUlHeHBZMlZ1YzJVZ0tpOWNianNvWm5WdVkzUnBiMjRvY205dmRDa2dlMXh1WEc1Y2RDOHZJRVJsZEdWamRDQm1jbVZsSUhaaGNtbGhZbXhsY3lCZ1pYaHdiM0owYzJBdVhHNWNkSFpoY2lCbWNtVmxSWGh3YjNKMGN5QTlJSFI1Y0dWdlppQmxlSEJ2Y25SeklEMDlJQ2R2WW1wbFkzUW5JQ1ltSUdWNGNHOXlkSE03WEc1Y2JseDBMeThnUkdWMFpXTjBJR1p5WldVZ2RtRnlhV0ZpYkdVZ1lHMXZaSFZzWldBdVhHNWNkSFpoY2lCbWNtVmxUVzlrZFd4bElEMGdkSGx3Wlc5bUlHMXZaSFZzWlNBOVBTQW5iMkpxWldOMEp5QW1KaUJ0YjJSMWJHVWdKaVpjYmx4MFhIUnRiMlIxYkdVdVpYaHdiM0owY3lBOVBTQm1jbVZsUlhod2IzSjBjeUFtSmlCdGIyUjFiR1U3WEc1Y2JseDBMeThnUkdWMFpXTjBJR1p5WldVZ2RtRnlhV0ZpYkdVZ1lHZHNiMkpoYkdBc0lHWnliMjBnVG05a1pTNXFjeUJ2Y2lCQ2NtOTNjMlZ5YVdacFpXUWdZMjlrWlN3Z1lXNWtJSFZ6WlZ4dVhIUXZMeUJwZENCaGN5QmdjbTl2ZEdBdVhHNWNkSFpoY2lCbWNtVmxSMnh2WW1Gc0lEMGdkSGx3Wlc5bUlHZHNiMkpoYkNBOVBTQW5iMkpxWldOMEp5QW1KaUJuYkc5aVlXdzdYRzVjZEdsbUlDaG1jbVZsUjJ4dlltRnNMbWRzYjJKaGJDQTlQVDBnWm5KbFpVZHNiMkpoYkNCOGZDQm1jbVZsUjJ4dlltRnNMbmRwYm1SdmR5QTlQVDBnWm5KbFpVZHNiMkpoYkNrZ2UxeHVYSFJjZEhKdmIzUWdQU0JtY21WbFIyeHZZbUZzTzF4dVhIUjlYRzVjYmx4MEx5b3RMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMU292WEc1Y2JseDBkbUZ5SUVsdWRtRnNhV1JEYUdGeVlXTjBaWEpGY25KdmNpQTlJR1oxYm1OMGFXOXVLRzFsYzNOaFoyVXBJSHRjYmx4MFhIUjBhR2x6TG0xbGMzTmhaMlVnUFNCdFpYTnpZV2RsTzF4dVhIUjlPMXh1WEhSSmJuWmhiR2xrUTJoaGNtRmpkR1Z5UlhKeWIzSXVjSEp2ZEc5MGVYQmxJRDBnYm1WM0lFVnljbTl5TzF4dVhIUkpiblpoYkdsa1EyaGhjbUZqZEdWeVJYSnliM0l1Y0hKdmRHOTBlWEJsTG01aGJXVWdQU0FuU1c1MllXeHBaRU5vWVhKaFkzUmxja1Z5Y205eUp6dGNibHh1WEhSMllYSWdaWEp5YjNJZ1BTQm1kVzVqZEdsdmJpaHRaWE56WVdkbEtTQjdYRzVjZEZ4MEx5OGdUbTkwWlRvZ2RHaGxJR1Z5Y205eUlHMWxjM05oWjJWeklIVnpaV1FnZEdoeWIzVm5hRzkxZENCMGFHbHpJR1pwYkdVZ2JXRjBZMmdnZEdodmMyVWdkWE5sWkNCaWVWeHVYSFJjZEM4dklIUm9aU0J1WVhScGRtVWdZR0YwYjJKZ0wyQmlkRzloWUNCcGJYQnNaVzFsYm5SaGRHbHZiaUJwYmlCRGFISnZiV2wxYlM1Y2JseDBYSFIwYUhKdmR5QnVaWGNnU1c1MllXeHBaRU5vWVhKaFkzUmxja1Z5Y205eUtHMWxjM05oWjJVcE8xeHVYSFI5TzF4dVhHNWNkSFpoY2lCVVFVSk1SU0E5SUNkQlFrTkVSVVpIU0VsS1MweE5UazlRVVZKVFZGVldWMWhaV21GaVkyUmxabWRvYVdwcmJHMXViM0J4Y25OMGRYWjNlSGw2TURFeU16UTFOamM0T1Nzdkp6dGNibHgwTHk4Z2FIUjBjRG92TDNkb1lYUjNaeTV2Y21jdmFIUnRiQzlqYjIxdGIyNHRiV2xqY205emVXNTBZWGhsY3k1b2RHMXNJM053WVdObExXTm9ZWEpoWTNSbGNseHVYSFIyWVhJZ1VrVkhSVmhmVTFCQlEwVmZRMGhCVWtGRFZFVlNVeUE5SUM5YlhGeDBYRnh1WEZ4bVhGeHlJRjB2Wnp0Y2JseHVYSFF2THlCZ1pHVmpiMlJsWUNCcGN5QmtaWE5wWjI1bFpDQjBieUJpWlNCbWRXeHNlU0JqYjIxd1lYUnBZbXhsSUhkcGRHZ2dZR0YwYjJKZ0lHRnpJR1JsYzJOeWFXSmxaQ0JwYmlCMGFHVmNibHgwTHk4Z1NGUk5UQ0JUZEdGdVpHRnlaQzRnYUhSMGNEb3ZMM2RvWVhSM1p5NXZjbWN2YUhSdGJDOTNaV0poY0hCaGNHbHpMbWgwYld3alpHOXRMWGRwYm1SdmQySmhjMlUyTkMxaGRHOWlYRzVjZEM4dklGUm9aU0J2Y0hScGJXbDZaV1FnWW1GelpUWTBMV1JsWTI5a2FXNW5JR0ZzWjI5eWFYUm9iU0IxYzJWa0lHbHpJR0poYzJWa0lHOXVJRUJoZEd2aWdKbHpJR1Y0WTJWc2JHVnVkRnh1WEhRdkx5QnBiWEJzWlcxbGJuUmhkR2x2Ymk0Z2FIUjBjSE02THk5bmFYTjBMbWRwZEdoMVlpNWpiMjB2WVhSckx6RXdNakF6T1RaY2JseDBkbUZ5SUdSbFkyOWtaU0E5SUdaMWJtTjBhVzl1S0dsdWNIVjBLU0I3WEc1Y2RGeDBhVzV3ZFhRZ1BTQlRkSEpwYm1jb2FXNXdkWFFwWEc1Y2RGeDBYSFF1Y21Wd2JHRmpaU2hTUlVkRldGOVRVRUZEUlY5RFNFRlNRVU5VUlZKVExDQW5KeWs3WEc1Y2RGeDBkbUZ5SUd4bGJtZDBhQ0E5SUdsdWNIVjBMbXhsYm1kMGFEdGNibHgwWEhScFppQW9iR1Z1WjNSb0lDVWdOQ0E5UFNBd0tTQjdYRzVjZEZ4MFhIUnBibkIxZENBOUlHbHVjSFYwTG5KbGNHeGhZMlVvTHowOVB5UXZMQ0FuSnlrN1hHNWNkRngwWEhSc1pXNW5kR2dnUFNCcGJuQjFkQzVzWlc1bmRHZzdYRzVjZEZ4MGZWeHVYSFJjZEdsbUlDaGNibHgwWEhSY2RHeGxibWQwYUNBbElEUWdQVDBnTVNCOGZGeHVYSFJjZEZ4MEx5OGdhSFIwY0RvdkwzZG9ZWFIzWnk1dmNtY3ZReU5oYkhCb1lXNTFiV1Z5YVdNdFlYTmphV2t0WTJoaGNtRmpkR1Z5YzF4dVhIUmNkRngwTDF0ZUsyRXRla0V0V2pBdE9TOWRMeTUwWlhOMEtHbHVjSFYwS1Z4dVhIUmNkQ2tnZTF4dVhIUmNkRngwWlhKeWIzSW9YRzVjZEZ4MFhIUmNkQ2RKYm5aaGJHbGtJR05vWVhKaFkzUmxjam9nZEdobElITjBjbWx1WnlCMGJ5QmlaU0JrWldOdlpHVmtJR2x6SUc1dmRDQmpiM0p5WldOMGJIa2daVzVqYjJSbFpDNG5YRzVjZEZ4MFhIUXBPMXh1WEhSY2RIMWNibHgwWEhSMllYSWdZbWwwUTI5MWJuUmxjaUE5SURBN1hHNWNkRngwZG1GeUlHSnBkRk4wYjNKaFoyVTdYRzVjZEZ4MGRtRnlJR0oxWm1abGNqdGNibHgwWEhSMllYSWdiM1YwY0hWMElEMGdKeWM3WEc1Y2RGeDBkbUZ5SUhCdmMybDBhVzl1SUQwZ0xURTdYRzVjZEZ4MGQyaHBiR1VnS0NzcmNHOXphWFJwYjI0Z1BDQnNaVzVuZEdncElIdGNibHgwWEhSY2RHSjFabVpsY2lBOUlGUkJRa3hGTG1sdVpHVjRUMllvYVc1d2RYUXVZMmhoY2tGMEtIQnZjMmwwYVc5dUtTazdYRzVjZEZ4MFhIUmlhWFJUZEc5eVlXZGxJRDBnWW1sMFEyOTFiblJsY2lBbElEUWdQeUJpYVhSVGRHOXlZV2RsSUNvZ05qUWdLeUJpZFdabVpYSWdPaUJpZFdabVpYSTdYRzVjZEZ4MFhIUXZMeUJWYm14bGMzTWdkR2hwY3lCcGN5QjBhR1VnWm1seWMzUWdiMllnWVNCbmNtOTFjQ0J2WmlBMElHTm9ZWEpoWTNSbGNuUGlnS1pjYmx4MFhIUmNkR2xtSUNoaWFYUkRiM1Z1ZEdWeUt5c2dKU0EwS1NCN1hHNWNkRngwWEhSY2RDOHZJT0tBcG1OdmJuWmxjblFnZEdobElHWnBjbk4wSURnZ1ltbDBjeUIwYnlCaElITnBibWRzWlNCQlUwTkpTU0JqYUdGeVlXTjBaWEl1WEc1Y2RGeDBYSFJjZEc5MWRIQjFkQ0FyUFNCVGRISnBibWN1Wm5KdmJVTm9ZWEpEYjJSbEtGeHVYSFJjZEZ4MFhIUmNkREI0UmtZZ0ppQmlhWFJUZEc5eVlXZGxJRDQrSUNndE1pQXFJR0pwZEVOdmRXNTBaWElnSmlBMktWeHVYSFJjZEZ4MFhIUXBPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMWNibHgwWEhSeVpYUjFjbTRnYjNWMGNIVjBPMXh1WEhSOU8xeHVYRzVjZEM4dklHQmxibU52WkdWZ0lHbHpJR1JsYzJsbmJtVmtJSFJ2SUdKbElHWjFiR3g1SUdOdmJYQmhkR2xpYkdVZ2QybDBhQ0JnWW5SdllXQWdZWE1nWkdWelkzSnBZbVZrSUdsdUlIUm9aVnh1WEhRdkx5QklWRTFNSUZOMFlXNWtZWEprT2lCb2RIUndPaTh2ZDJoaGRIZG5MbTl5Wnk5b2RHMXNMM2RsWW1Gd2NHRndhWE11YUhSdGJDTmtiMjB0ZDJsdVpHOTNZbUZ6WlRZMExXSjBiMkZjYmx4MGRtRnlJR1Z1WTI5a1pTQTlJR1oxYm1OMGFXOXVLR2x1Y0hWMEtTQjdYRzVjZEZ4MGFXNXdkWFFnUFNCVGRISnBibWNvYVc1d2RYUXBPMXh1WEhSY2RHbG1JQ2d2VzE1Y1hEQXRYRng0UmtaZEx5NTBaWE4wS0dsdWNIVjBLU2tnZTF4dVhIUmNkRngwTHk4Z1RtOTBaVG9nYm04Z2JtVmxaQ0IwYnlCemNHVmphV0ZzTFdOaGMyVWdZWE4wY21Gc0lITjViV0p2YkhNZ2FHVnlaU3dnWVhNZ2MzVnljbTluWVhSbGN5QmhjbVZjYmx4MFhIUmNkQzh2SUcxaGRHTm9aV1FzSUdGdVpDQjBhR1VnYVc1d2RYUWdhWE1nYzNWd2NHOXpaV1FnZEc4Z2IyNXNlU0JqYjI1MFlXbHVJRUZUUTBsSklHRnVlWGRoZVM1Y2JseDBYSFJjZEdWeWNtOXlLRnh1WEhSY2RGeDBYSFFuVkdobElITjBjbWx1WnlCMGJ5QmlaU0JsYm1OdlpHVmtJR052Ym5SaGFXNXpJR05vWVhKaFkzUmxjbk1nYjNWMGMybGtaU0J2WmlCMGFHVWdKeUFyWEc1Y2RGeDBYSFJjZENkTVlYUnBiakVnY21GdVoyVXVKMXh1WEhSY2RGeDBLVHRjYmx4MFhIUjlYRzVjZEZ4MGRtRnlJSEJoWkdScGJtY2dQU0JwYm5CMWRDNXNaVzVuZEdnZ0pTQXpPMXh1WEhSY2RIWmhjaUJ2ZFhSd2RYUWdQU0FuSnp0Y2JseDBYSFIyWVhJZ2NHOXphWFJwYjI0Z1BTQXRNVHRjYmx4MFhIUjJZWElnWVR0Y2JseDBYSFIyWVhJZ1lqdGNibHgwWEhSMllYSWdZenRjYmx4MFhIUjJZWElnWkR0Y2JseDBYSFIyWVhJZ1luVm1abVZ5TzF4dVhIUmNkQzh2SUUxaGEyVWdjM1Z5WlNCaGJua2djR0ZrWkdsdVp5QnBjeUJvWVc1a2JHVmtJRzkxZEhOcFpHVWdiMllnZEdobElHeHZiM0F1WEc1Y2RGeDBkbUZ5SUd4bGJtZDBhQ0E5SUdsdWNIVjBMbXhsYm1kMGFDQXRJSEJoWkdScGJtYzdYRzVjYmx4MFhIUjNhR2xzWlNBb0t5dHdiM05wZEdsdmJpQThJR3hsYm1kMGFDa2dlMXh1WEhSY2RGeDBMeThnVW1WaFpDQjBhSEpsWlNCaWVYUmxjeXdnYVM1bExpQXlOQ0JpYVhSekxseHVYSFJjZEZ4MFlTQTlJR2x1Y0hWMExtTm9ZWEpEYjJSbFFYUW9jRzl6YVhScGIyNHBJRHc4SURFMk8xeHVYSFJjZEZ4MFlpQTlJR2x1Y0hWMExtTm9ZWEpEYjJSbFFYUW9LeXR3YjNOcGRHbHZiaWtnUER3Z09EdGNibHgwWEhSY2RHTWdQU0JwYm5CMWRDNWphR0Z5UTI5a1pVRjBLQ3NyY0c5emFYUnBiMjRwTzF4dVhIUmNkRngwWW5WbVptVnlJRDBnWVNBcklHSWdLeUJqTzF4dVhIUmNkRngwTHk4Z1ZIVnliaUIwYUdVZ01qUWdZbWwwY3lCcGJuUnZJR1p2ZFhJZ1kyaDFibXR6SUc5bUlEWWdZbWwwY3lCbFlXTm9MQ0JoYm1RZ1lYQndaVzVrSUhSb1pWeHVYSFJjZEZ4MEx5OGdiV0YwWTJocGJtY2dZMmhoY21GamRHVnlJR1p2Y2lCbFlXTm9JRzltSUhSb1pXMGdkRzhnZEdobElHOTFkSEIxZEM1Y2JseDBYSFJjZEc5MWRIQjFkQ0FyUFNBb1hHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTVRnZ0ppQXdlRE5HS1NBclhHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTVRJZ0ppQXdlRE5HS1NBclhHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTmlBbUlEQjRNMFlwSUN0Y2JseDBYSFJjZEZ4MFZFRkNURVV1WTJoaGNrRjBLR0oxWm1abGNpQW1JREI0TTBZcFhHNWNkRngwWEhRcE8xeHVYSFJjZEgxY2JseHVYSFJjZEdsbUlDaHdZV1JrYVc1bklEMDlJRElwSUh0Y2JseDBYSFJjZEdFZ1BTQnBibkIxZEM1amFHRnlRMjlrWlVGMEtIQnZjMmwwYVc5dUtTQThQQ0E0TzF4dVhIUmNkRngwWWlBOUlHbHVjSFYwTG1Ob1lYSkRiMlJsUVhRb0t5dHdiM05wZEdsdmJpazdYRzVjZEZ4MFhIUmlkV1ptWlhJZ1BTQmhJQ3NnWWp0Y2JseDBYSFJjZEc5MWRIQjFkQ0FyUFNBb1hHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2hpZFdabVpYSWdQajRnTVRBcElDdGNibHgwWEhSY2RGeDBWRUZDVEVVdVkyaGhja0YwS0NoaWRXWm1aWElnUGo0Z05Da2dKaUF3ZUROR0tTQXJYRzVjZEZ4MFhIUmNkRlJCUWt4RkxtTm9ZWEpCZENnb1luVm1abVZ5SUR3OElESXBJQ1lnTUhnelJpa2dLMXh1WEhSY2RGeDBYSFFuUFNkY2JseDBYSFJjZENrN1hHNWNkRngwZlNCbGJITmxJR2xtSUNod1lXUmthVzVuSUQwOUlERXBJSHRjYmx4MFhIUmNkR0oxWm1abGNpQTlJR2x1Y0hWMExtTm9ZWEpEYjJSbFFYUW9jRzl6YVhScGIyNHBPMXh1WEhSY2RGeDBiM1YwY0hWMElDczlJQ2hjYmx4MFhIUmNkRngwVkVGQ1RFVXVZMmhoY2tGMEtHSjFabVpsY2lBK1BpQXlLU0FyWEc1Y2RGeDBYSFJjZEZSQlFreEZMbU5vWVhKQmRDZ29ZblZtWm1WeUlEdzhJRFFwSUNZZ01IZ3pSaWtnSzF4dVhIUmNkRngwWEhRblBUMG5YRzVjZEZ4MFhIUXBPMXh1WEhSY2RIMWNibHh1WEhSY2RISmxkSFZ5YmlCdmRYUndkWFE3WEc1Y2RIMDdYRzVjYmx4MGRtRnlJR0poYzJVMk5DQTlJSHRjYmx4MFhIUW5aVzVqYjJSbEp6b2daVzVqYjJSbExGeHVYSFJjZENka1pXTnZaR1VuT2lCa1pXTnZaR1VzWEc1Y2RGeDBKM1psY25OcGIyNG5PaUFuTUM0eExqQW5YRzVjZEgwN1hHNWNibHgwTHk4Z1UyOXRaU0JCVFVRZ1luVnBiR1FnYjNCMGFXMXBlbVZ5Y3l3Z2JHbHJaU0J5TG1wekxDQmphR1ZqYXlCbWIzSWdjM0JsWTJsbWFXTWdZMjl1WkdsMGFXOXVJSEJoZEhSbGNtNXpYRzVjZEM4dklHeHBhMlVnZEdobElHWnZiR3h2ZDJsdVp6cGNibHgwYVdZZ0tGeHVYSFJjZEhSNWNHVnZaaUJrWldacGJtVWdQVDBnSjJaMWJtTjBhVzl1SnlBbUpseHVYSFJjZEhSNWNHVnZaaUJrWldacGJtVXVZVzFrSUQwOUlDZHZZbXBsWTNRbklDWW1YRzVjZEZ4MFpHVm1hVzVsTG1GdFpGeHVYSFFwSUh0Y2JseDBYSFJrWldacGJtVW9ablZ1WTNScGIyNG9LU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdZbUZ6WlRZME8xeHVYSFJjZEgwcE8xeHVYSFI5WEhSbGJITmxJR2xtSUNobWNtVmxSWGh3YjNKMGN5QW1KaUFoWm5KbFpVVjRjRzl5ZEhNdWJtOWtaVlI1Y0dVcElIdGNibHgwWEhScFppQW9abkpsWlUxdlpIVnNaU2tnZXlBdkx5QnBiaUJPYjJSbExtcHpJRzl5SUZKcGJtZHZTbE1nZGpBdU9DNHdLMXh1WEhSY2RGeDBabkpsWlUxdlpIVnNaUzVsZUhCdmNuUnpJRDBnWW1GelpUWTBPMXh1WEhSY2RIMGdaV3h6WlNCN0lDOHZJR2x1SUU1aGNuZG9ZV3dnYjNJZ1VtbHVaMjlLVXlCMk1DNDNMakF0WEc1Y2RGeDBYSFJtYjNJZ0tIWmhjaUJyWlhrZ2FXNGdZbUZ6WlRZMEtTQjdYRzVjZEZ4MFhIUmNkR0poYzJVMk5DNW9ZWE5QZDI1UWNtOXdaWEowZVNoclpYa3BJQ1ltSUNobWNtVmxSWGh3YjNKMGMxdHJaWGxkSUQwZ1ltRnpaVFkwVzJ0bGVWMHBPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMWNibHgwZlNCbGJITmxJSHNnTHk4Z2FXNGdVbWhwYm04Z2IzSWdZU0IzWldJZ1luSnZkM05sY2x4dVhIUmNkSEp2YjNRdVltRnpaVFkwSUQwZ1ltRnpaVFkwTzF4dVhIUjlYRzVjYm4wb2RHaHBjeWtwTzF4dUlsMTkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlhV1o1TDI1dlpHVmZiVzlrZFd4bGN5OTFkR2xzTDNWMGFXd3Vhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHZJRU52Y0hseWFXZG9kQ0JLYjNsbGJuUXNJRWx1WXk0Z1lXNWtJRzkwYUdWeUlFNXZaR1VnWTI5dWRISnBZblYwYjNKekxseHVMeTljYmk4dklGQmxjbTFwYzNOcGIyNGdhWE1nYUdWeVpXSjVJR2R5WVc1MFpXUXNJR1p5WldVZ2IyWWdZMmhoY21kbExDQjBieUJoYm5rZ2NHVnljMjl1SUc5aWRHRnBibWx1WnlCaFhHNHZMeUJqYjNCNUlHOW1JSFJvYVhNZ2MyOW1kSGRoY21VZ1lXNWtJR0Z6YzI5amFXRjBaV1FnWkc5amRXMWxiblJoZEdsdmJpQm1hV3hsY3lBb2RHaGxYRzR2THlCY0lsTnZablIzWVhKbFhDSXBMQ0IwYnlCa1pXRnNJR2x1SUhSb1pTQlRiMlowZDJGeVpTQjNhWFJvYjNWMElISmxjM1J5YVdOMGFXOXVMQ0JwYm1Oc2RXUnBibWRjYmk4dklIZHBkR2h2ZFhRZ2JHbHRhWFJoZEdsdmJpQjBhR1VnY21sbmFIUnpJSFJ2SUhWelpTd2dZMjl3ZVN3Z2JXOWthV1o1TENCdFpYSm5aU3dnY0hWaWJHbHphQ3hjYmk4dklHUnBjM1J5YVdKMWRHVXNJSE4xWW14cFkyVnVjMlVzSUdGdVpDOXZjaUJ6Wld4c0lHTnZjR2xsY3lCdlppQjBhR1VnVTI5bWRIZGhjbVVzSUdGdVpDQjBieUJ3WlhKdGFYUmNiaTh2SUhCbGNuTnZibk1nZEc4Z2QyaHZiU0IwYUdVZ1UyOW1kSGRoY21VZ2FYTWdablZ5Ym1semFHVmtJSFJ2SUdSdklITnZMQ0J6ZFdKcVpXTjBJSFJ2SUhSb1pWeHVMeThnWm05c2JHOTNhVzVuSUdOdmJtUnBkR2x2Ym5NNlhHNHZMMXh1THk4Z1ZHaGxJR0ZpYjNabElHTnZjSGx5YVdkb2RDQnViM1JwWTJVZ1lXNWtJSFJvYVhNZ2NHVnliV2x6YzJsdmJpQnViM1JwWTJVZ2MyaGhiR3dnWW1VZ2FXNWpiSFZrWldSY2JpOHZJR2x1SUdGc2JDQmpiM0JwWlhNZ2IzSWdjM1ZpYzNSaGJuUnBZV3dnY0c5eWRHbHZibk1nYjJZZ2RHaGxJRk52Wm5SM1lYSmxMbHh1THk5Y2JpOHZJRlJJUlNCVFQwWlVWMEZTUlNCSlV5QlFVazlXU1VSRlJDQmNJa0ZUSUVsVFhDSXNJRmRKVkVoUFZWUWdWMEZTVWtGT1ZGa2dUMFlnUVU1WklFdEpUa1FzSUVWWVVGSkZVMU5jYmk4dklFOVNJRWxOVUV4SlJVUXNJRWxPUTB4VlJFbE9SeUJDVlZRZ1RrOVVJRXhKVFVsVVJVUWdWRThnVkVoRklGZEJVbEpCVGxSSlJWTWdUMFpjYmk4dklFMUZVa05JUVU1VVFVSkpURWxVV1N3Z1JrbFVUa1ZUVXlCR1QxSWdRU0JRUVZKVVNVTlZURUZTSUZCVlVsQlBVMFVnUVU1RUlFNVBUa2xPUmxKSlRrZEZUVVZPVkM0Z1NVNWNiaTh2SUU1UElFVldSVTVVSUZOSVFVeE1JRlJJUlNCQlZWUklUMUpUSUU5U0lFTlBVRmxTU1VkSVZDQklUMHhFUlZKVElFSkZJRXhKUVVKTVJTQkdUMUlnUVU1WklFTk1RVWxOTEZ4dUx5OGdSRUZOUVVkRlV5QlBVaUJQVkVoRlVpQk1TVUZDU1V4SlZGa3NJRmRJUlZSSVJWSWdTVTRnUVU0Z1FVTlVTVTlPSUU5R0lFTlBUbFJTUVVOVUxDQlVUMUpVSUU5U1hHNHZMeUJQVkVoRlVsZEpVMFVzSUVGU1NWTkpUa2NnUmxKUFRTd2dUMVZVSUU5R0lFOVNJRWxPSUVOUFRrNUZRMVJKVDA0Z1YwbFVTQ0JVU0VVZ1UwOUdWRmRCVWtVZ1QxSWdWRWhGWEc0dkx5QlZVMFVnVDFJZ1QxUklSVklnUkVWQlRFbE9SMU1nU1U0Z1ZFaEZJRk5QUmxSWFFWSkZMbHh1WEc1MllYSWdabTl5YldGMFVtVm5SWGh3SUQwZ0x5VmJjMlJxSlYwdlp6dGNibVY0Y0c5eWRITXVabTl5YldGMElEMGdablZ1WTNScGIyNG9aaWtnZTF4dUlDQnBaaUFvSVdselUzUnlhVzVuS0dZcEtTQjdYRzRnSUNBZ2RtRnlJRzlpYW1WamRITWdQU0JiWFR0Y2JpQWdJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUdGeVozVnRaVzUwY3k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lDQWdiMkpxWldOMGN5NXdkWE5vS0dsdWMzQmxZM1FvWVhKbmRXMWxiblJ6VzJsZEtTazdYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUJ2WW1wbFkzUnpMbXB2YVc0b0p5QW5LVHRjYmlBZ2ZWeHVYRzRnSUhaaGNpQnBJRDBnTVR0Y2JpQWdkbUZ5SUdGeVozTWdQU0JoY21kMWJXVnVkSE03WEc0Z0lIWmhjaUJzWlc0Z1BTQmhjbWR6TG14bGJtZDBhRHRjYmlBZ2RtRnlJSE4wY2lBOUlGTjBjbWx1WnlobUtTNXlaWEJzWVdObEtHWnZjbTFoZEZKbFowVjRjQ3dnWm5WdVkzUnBiMjRvZUNrZ2UxeHVJQ0FnSUdsbUlDaDRJRDA5UFNBbkpTVW5LU0J5WlhSMWNtNGdKeVVuTzF4dUlDQWdJR2xtSUNocElENDlJR3hsYmlrZ2NtVjBkWEp1SUhnN1hHNGdJQ0FnYzNkcGRHTm9JQ2g0S1NCN1hHNGdJQ0FnSUNCallYTmxJQ2NsY3ljNklISmxkSFZ5YmlCVGRISnBibWNvWVhKbmMxdHBLeXRkS1R0Y2JpQWdJQ0FnSUdOaGMyVWdKeVZrSnpvZ2NtVjBkWEp1SUU1MWJXSmxjaWhoY21kelcya3JLMTBwTzF4dUlDQWdJQ0FnWTJGelpTQW5KV29uT2x4dUlDQWdJQ0FnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJLVTA5T0xuTjBjbWx1WjJsbWVTaGhjbWR6VzJrcksxMHBPMXh1SUNBZ0lDQWdJQ0I5SUdOaGRHTm9JQ2hmS1NCN1hHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlDZGJRMmx5WTNWc1lYSmRKenRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSGc3WEc0Z0lDQWdmVnh1SUNCOUtUdGNiaUFnWm05eUlDaDJZWElnZUNBOUlHRnlaM05iYVYwN0lHa2dQQ0JzWlc0N0lIZ2dQU0JoY21keld5c3JhVjBwSUh0Y2JpQWdJQ0JwWmlBb2FYTk9kV3hzS0hncElIeDhJQ0ZwYzA5aWFtVmpkQ2g0S1NrZ2UxeHVJQ0FnSUNBZ2MzUnlJQ3M5SUNjZ0p5QXJJSGc3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lITjBjaUFyUFNBbklDY2dLeUJwYm5Od1pXTjBLSGdwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdjM1J5TzF4dWZUdGNibHh1WEc0dkx5Qk5ZWEpySUhSb1lYUWdZU0J0WlhSb2IyUWdjMmh2ZFd4a0lHNXZkQ0JpWlNCMWMyVmtMbHh1THk4Z1VtVjBkWEp1Y3lCaElHMXZaR2xtYVdWa0lHWjFibU4wYVc5dUlIZG9hV05vSUhkaGNtNXpJRzl1WTJVZ1lua2daR1ZtWVhWc2RDNWNiaTh2SUVsbUlDMHRibTh0WkdWd2NtVmpZWFJwYjI0Z2FYTWdjMlYwTENCMGFHVnVJR2wwSUdseklHRWdibTh0YjNBdVhHNWxlSEJ2Y25SekxtUmxjSEpsWTJGMFpTQTlJR1oxYm1OMGFXOXVLR1p1TENCdGMyY3BJSHRjYmlBZ0x5OGdRV3hzYjNjZ1ptOXlJR1JsY0hKbFkyRjBhVzVuSUhSb2FXNW5jeUJwYmlCMGFHVWdjSEp2WTJWemN5QnZaaUJ6ZEdGeWRHbHVaeUIxY0M1Y2JpQWdhV1lnS0dselZXNWtaV1pwYm1Wa0tHZHNiMkpoYkM1d2NtOWpaWE56S1NrZ2UxeHVJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaWdwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJsZUhCdmNuUnpMbVJsY0hKbFkyRjBaU2htYml3Z2JYTm5LUzVoY0hCc2VTaDBhR2x6TENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUgwN1hHNGdJSDFjYmx4dUlDQnBaaUFvY0hKdlkyVnpjeTV1YjBSbGNISmxZMkYwYVc5dUlEMDlQU0IwY25WbEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdadU8xeHVJQ0I5WEc1Y2JpQWdkbUZ5SUhkaGNtNWxaQ0E5SUdaaGJITmxPMXh1SUNCbWRXNWpkR2x2YmlCa1pYQnlaV05oZEdWa0tDa2dlMXh1SUNBZ0lHbG1JQ2doZDJGeWJtVmtLU0I3WEc0Z0lDQWdJQ0JwWmlBb2NISnZZMlZ6Y3k1MGFISnZkMFJsY0hKbFkyRjBhVzl1S1NCN1hHNGdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lodGMyY3BPMXh1SUNBZ0lDQWdmU0JsYkhObElHbG1JQ2h3Y205alpYTnpMblJ5WVdObFJHVndjbVZqWVhScGIyNHBJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzUwY21GalpTaHRjMmNwTzF4dUlDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpaHRjMmNwTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJQ0FnZDJGeWJtVmtJRDBnZEhKMVpUdGNiaUFnSUNCOVhHNGdJQ0FnY21WMGRYSnVJR1p1TG1Gd2NHeDVLSFJvYVhNc0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUgxY2JseHVJQ0J5WlhSMWNtNGdaR1Z3Y21WallYUmxaRHRjYm4wN1hHNWNibHh1ZG1GeUlHUmxZblZuY3lBOUlIdDlPMXh1ZG1GeUlHUmxZblZuUlc1MmFYSnZianRjYm1WNGNHOXlkSE11WkdWaWRXZHNiMmNnUFNCbWRXNWpkR2x2YmloelpYUXBJSHRjYmlBZ2FXWWdLR2x6Vlc1a1pXWnBibVZrS0dSbFluVm5SVzUyYVhKdmJpa3BYRzRnSUNBZ1pHVmlkV2RGYm5acGNtOXVJRDBnY0hKdlkyVnpjeTVsYm5ZdVRrOUVSVjlFUlVKVlJ5QjhmQ0FuSnp0Y2JpQWdjMlYwSUQwZ2MyVjBMblJ2VlhCd1pYSkRZWE5sS0NrN1hHNGdJR2xtSUNnaFpHVmlkV2R6VzNObGRGMHBJSHRjYmlBZ0lDQnBaaUFvYm1WM0lGSmxaMFY0Y0NnblhGeGNYR0luSUNzZ2MyVjBJQ3NnSjF4Y1hGeGlKeXdnSjJrbktTNTBaWE4wS0dSbFluVm5SVzUyYVhKdmJpa3BJSHRjYmlBZ0lDQWdJSFpoY2lCd2FXUWdQU0J3Y205alpYTnpMbkJwWkR0Y2JpQWdJQ0FnSUdSbFluVm5jMXR6WlhSZElEMGdablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQnRjMmNnUFNCbGVIQnZjblJ6TG1admNtMWhkQzVoY0hCc2VTaGxlSEJ2Y25SekxDQmhjbWQxYldWdWRITXBPMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtDY2xjeUFsWkRvZ0pYTW5MQ0J6WlhRc0lIQnBaQ3dnYlhObktUdGNiaUFnSUNBZ0lIMDdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUdSbFluVm5jMXR6WlhSZElEMGdablZ1WTNScGIyNG9LU0I3ZlR0Y2JpQWdJQ0I5WEc0Z0lIMWNiaUFnY21WMGRYSnVJR1JsWW5WbmMxdHpaWFJkTzF4dWZUdGNibHh1WEc0dktpcGNiaUFxSUVWamFHOXpJSFJvWlNCMllXeDFaU0J2WmlCaElIWmhiSFZsTGlCVWNubHpJSFJ2SUhCeWFXNTBJSFJvWlNCMllXeDFaU0J2ZFhSY2JpQXFJR2x1SUhSb1pTQmlaWE4wSUhkaGVTQndiM056YVdKc1pTQm5hWFpsYmlCMGFHVWdaR2xtWm1WeVpXNTBJSFI1Y0dWekxseHVJQ3BjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdlltb2dWR2hsSUc5aWFtVmpkQ0IwYnlCd2NtbHVkQ0J2ZFhRdVhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiM0IwY3lCUGNIUnBiMjVoYkNCdmNIUnBiMjV6SUc5aWFtVmpkQ0IwYUdGMElHRnNkR1Z5Y3lCMGFHVWdiM1YwY0hWMExseHVJQ292WEc0dktpQnNaV2RoWTNrNklHOWlhaXdnYzJodmQwaHBaR1JsYml3Z1pHVndkR2dzSUdOdmJHOXljeW92WEc1bWRXNWpkR2x2YmlCcGJuTndaV04wS0c5aWFpd2diM0IwY3lrZ2UxeHVJQ0F2THlCa1pXWmhkV3gwSUc5d2RHbHZibk5jYmlBZ2RtRnlJR04wZUNBOUlIdGNiaUFnSUNCelpXVnVPaUJiWFN4Y2JpQWdJQ0J6ZEhsc2FYcGxPaUJ6ZEhsc2FYcGxUbTlEYjJ4dmNseHVJQ0I5TzF4dUlDQXZMeUJzWldkaFkza3VMaTVjYmlBZ2FXWWdLR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZ2dQajBnTXlrZ1kzUjRMbVJsY0hSb0lEMGdZWEpuZFcxbGJuUnpXekpkTzF4dUlDQnBaaUFvWVhKbmRXMWxiblJ6TG14bGJtZDBhQ0ErUFNBMEtTQmpkSGd1WTI5c2IzSnpJRDBnWVhKbmRXMWxiblJ6V3pOZE8xeHVJQ0JwWmlBb2FYTkNiMjlzWldGdUtHOXdkSE1wS1NCN1hHNGdJQ0FnTHk4Z2JHVm5ZV041TGk0dVhHNGdJQ0FnWTNSNExuTm9iM2RJYVdSa1pXNGdQU0J2Y0hSek8xeHVJQ0I5SUdWc2MyVWdhV1lnS0c5d2RITXBJSHRjYmlBZ0lDQXZMeUJuYjNRZ1lXNGdYQ0p2Y0hScGIyNXpYQ0lnYjJKcVpXTjBYRzRnSUNBZ1pYaHdiM0owY3k1ZlpYaDBaVzVrS0dOMGVDd2diM0IwY3lrN1hHNGdJSDFjYmlBZ0x5OGdjMlYwSUdSbFptRjFiSFFnYjNCMGFXOXVjMXh1SUNCcFppQW9hWE5WYm1SbFptbHVaV1FvWTNSNExuTm9iM2RJYVdSa1pXNHBLU0JqZEhndWMyaHZkMGhwWkdSbGJpQTlJR1poYkhObE8xeHVJQ0JwWmlBb2FYTlZibVJsWm1sdVpXUW9ZM1I0TG1SbGNIUm9LU2tnWTNSNExtUmxjSFJvSUQwZ01qdGNiaUFnYVdZZ0tHbHpWVzVrWldacGJtVmtLR04wZUM1amIyeHZjbk1wS1NCamRIZ3VZMjlzYjNKeklEMGdabUZzYzJVN1hHNGdJR2xtSUNocGMxVnVaR1ZtYVc1bFpDaGpkSGd1WTNWemRHOXRTVzV6Y0dWamRDa3BJR04wZUM1amRYTjBiMjFKYm5Od1pXTjBJRDBnZEhKMVpUdGNiaUFnYVdZZ0tHTjBlQzVqYjJ4dmNuTXBJR04wZUM1emRIbHNhWHBsSUQwZ2MzUjViR2w2WlZkcGRHaERiMnh2Y2p0Y2JpQWdjbVYwZFhKdUlHWnZjbTFoZEZaaGJIVmxLR04wZUN3Z2IySnFMQ0JqZEhndVpHVndkR2dwTzF4dWZWeHVaWGh3YjNKMGN5NXBibk53WldOMElEMGdhVzV6Y0dWamREdGNibHh1WEc0dkx5Qm9kSFJ3T2k4dlpXNHVkMmxyYVhCbFpHbGhMbTl5Wnk5M2FXdHBMMEZPVTBsZlpYTmpZWEJsWDJOdlpHVWpaM0poY0docFkzTmNibWx1YzNCbFkzUXVZMjlzYjNKeklEMGdlMXh1SUNBblltOXNaQ2NnT2lCYk1Td2dNakpkTEZ4dUlDQW5hWFJoYkdsakp5QTZJRnN6TENBeU0xMHNYRzRnSUNkMWJtUmxjbXhwYm1VbklEb2dXelFzSURJMFhTeGNiaUFnSjJsdWRtVnljMlVuSURvZ1d6Y3NJREkzWFN4Y2JpQWdKM2RvYVhSbEp5QTZJRnN6Tnl3Z016bGRMRnh1SUNBblozSmxlU2NnT2lCYk9UQXNJRE01WFN4Y2JpQWdKMkpzWVdOckp5QTZJRnN6TUN3Z016bGRMRnh1SUNBbllteDFaU2NnT2lCYk16UXNJRE01WFN4Y2JpQWdKMk41WVc0bklEb2dXek0yTENBek9WMHNYRzRnSUNkbmNtVmxiaWNnT2lCYk16SXNJRE01WFN4Y2JpQWdKMjFoWjJWdWRHRW5JRG9nV3pNMUxDQXpPVjBzWEc0Z0lDZHlaV1FuSURvZ1d6TXhMQ0F6T1Ywc1hHNGdJQ2Q1Wld4c2IzY25JRG9nV3pNekxDQXpPVjFjYm4wN1hHNWNiaTh2SUVSdmJpZDBJSFZ6WlNBbllteDFaU2NnYm05MElIWnBjMmxpYkdVZ2IyNGdZMjFrTG1WNFpWeHVhVzV6Y0dWamRDNXpkSGxzWlhNZ1BTQjdYRzRnSUNkemNHVmphV0ZzSnpvZ0oyTjVZVzRuTEZ4dUlDQW5iblZ0WW1WeUp6b2dKM2xsYkd4dmR5Y3NYRzRnSUNkaWIyOXNaV0Z1SnpvZ0ozbGxiR3h2ZHljc1hHNGdJQ2QxYm1SbFptbHVaV1FuT2lBblozSmxlU2NzWEc0Z0lDZHVkV3hzSnpvZ0oySnZiR1FuTEZ4dUlDQW5jM1J5YVc1bkp6b2dKMmR5WldWdUp5eGNiaUFnSjJSaGRHVW5PaUFuYldGblpXNTBZU2NzWEc0Z0lDOHZJRndpYm1GdFpWd2lPaUJwYm5SbGJuUnBiMjVoYkd4NUlHNXZkQ0J6ZEhsc2FXNW5YRzRnSUNkeVpXZGxlSEFuT2lBbmNtVmtKMXh1ZlR0Y2JseHVYRzVtZFc1amRHbHZiaUJ6ZEhsc2FYcGxWMmwwYUVOdmJHOXlLSE4wY2l3Z2MzUjViR1ZVZVhCbEtTQjdYRzRnSUhaaGNpQnpkSGxzWlNBOUlHbHVjM0JsWTNRdWMzUjViR1Z6VzNOMGVXeGxWSGx3WlYwN1hHNWNiaUFnYVdZZ0tITjBlV3hsS1NCN1hHNGdJQ0FnY21WMGRYSnVJQ2RjWEhVd01ERmlXeWNnS3lCcGJuTndaV04wTG1OdmJHOXljMXR6ZEhsc1pWMWJNRjBnS3lBbmJTY2dLeUJ6ZEhJZ0sxeHVJQ0FnSUNBZ0lDQWdJQ0FuWEZ4MU1EQXhZbHNuSUNzZ2FXNXpjR1ZqZEM1amIyeHZjbk5iYzNSNWJHVmRXekZkSUNzZ0oyMG5PMXh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJSEpsZEhWeWJpQnpkSEk3WEc0Z0lIMWNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQnpkSGxzYVhwbFRtOURiMnh2Y2loemRISXNJSE4wZVd4bFZIbHdaU2tnZTF4dUlDQnlaWFIxY200Z2MzUnlPMXh1ZlZ4dVhHNWNibVoxYm1OMGFXOXVJR0Z5Y21GNVZHOUlZWE5vS0dGeWNtRjVLU0I3WEc0Z0lIWmhjaUJvWVhOb0lEMGdlMzA3WEc1Y2JpQWdZWEp5WVhrdVptOXlSV0ZqYUNobWRXNWpkR2x2YmloMllXd3NJR2xrZUNrZ2UxeHVJQ0FnSUdoaGMyaGJkbUZzWFNBOUlIUnlkV1U3WEc0Z0lIMHBPMXh1WEc0Z0lISmxkSFZ5YmlCb1lYTm9PMXh1ZlZ4dVhHNWNibVoxYm1OMGFXOXVJR1p2Y20xaGRGWmhiSFZsS0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeWtnZTF4dUlDQXZMeUJRY205MmFXUmxJR0VnYUc5dmF5Qm1iM0lnZFhObGNpMXpjR1ZqYVdacFpXUWdhVzV6Y0dWamRDQm1kVzVqZEdsdmJuTXVYRzRnSUM4dklFTm9aV05ySUhSb1lYUWdkbUZzZFdVZ2FYTWdZVzRnYjJKcVpXTjBJSGRwZEdnZ1lXNGdhVzV6Y0dWamRDQm1kVzVqZEdsdmJpQnZiaUJwZEZ4dUlDQnBaaUFvWTNSNExtTjFjM1J2YlVsdWMzQmxZM1FnSmlaY2JpQWdJQ0FnSUhaaGJIVmxJQ1ltWEc0Z0lDQWdJQ0JwYzBaMWJtTjBhVzl1S0haaGJIVmxMbWx1YzNCbFkzUXBJQ1ltWEc0Z0lDQWdJQ0F2THlCR2FXeDBaWElnYjNWMElIUm9aU0IxZEdsc0lHMXZaSFZzWlN3Z2FYUW5jeUJwYm5Od1pXTjBJR1oxYm1OMGFXOXVJR2x6SUhOd1pXTnBZV3hjYmlBZ0lDQWdJSFpoYkhWbExtbHVjM0JsWTNRZ0lUMDlJR1Y0Y0c5eWRITXVhVzV6Y0dWamRDQW1KbHh1SUNBZ0lDQWdMeThnUVd4emJ5Qm1hV3gwWlhJZ2IzVjBJR0Z1ZVNCd2NtOTBiM1I1Y0dVZ2IySnFaV04wY3lCMWMybHVaeUIwYUdVZ1kybHlZM1ZzWVhJZ1kyaGxZMnN1WEc0Z0lDQWdJQ0FoS0haaGJIVmxMbU52Ym5OMGNuVmpkRzl5SUNZbUlIWmhiSFZsTG1OdmJuTjBjblZqZEc5eUxuQnliM1J2ZEhsd1pTQTlQVDBnZG1Gc2RXVXBLU0I3WEc0Z0lDQWdkbUZ5SUhKbGRDQTlJSFpoYkhWbExtbHVjM0JsWTNRb2NtVmpkWEp6WlZScGJXVnpMQ0JqZEhncE8xeHVJQ0FnSUdsbUlDZ2hhWE5UZEhKcGJtY29jbVYwS1NrZ2UxeHVJQ0FnSUNBZ2NtVjBJRDBnWm05eWJXRjBWbUZzZFdVb1kzUjRMQ0J5WlhRc0lISmxZM1Z5YzJWVWFXMWxjeWs3WEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCeVpYUTdYRzRnSUgxY2JseHVJQ0F2THlCUWNtbHRhWFJwZG1VZ2RIbHdaWE1nWTJGdWJtOTBJR2hoZG1VZ2NISnZjR1Z5ZEdsbGMxeHVJQ0IyWVhJZ2NISnBiV2wwYVhabElEMGdabTl5YldGMFVISnBiV2wwYVhabEtHTjBlQ3dnZG1Gc2RXVXBPMXh1SUNCcFppQW9jSEpwYldsMGFYWmxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlIQnlhVzFwZEdsMlpUdGNiaUFnZlZ4dVhHNGdJQzh2SUV4dmIyc2dkWEFnZEdobElHdGxlWE1nYjJZZ2RHaGxJRzlpYW1WamRDNWNiaUFnZG1GeUlHdGxlWE1nUFNCUFltcGxZM1F1YTJWNWN5aDJZV3gxWlNrN1hHNGdJSFpoY2lCMmFYTnBZbXhsUzJWNWN5QTlJR0Z5Y21GNVZHOUlZWE5vS0d0bGVYTXBPMXh1WEc0Z0lHbG1JQ2hqZEhndWMyaHZkMGhwWkdSbGJpa2dlMXh1SUNBZ0lHdGxlWE1nUFNCUFltcGxZM1F1WjJWMFQzZHVVSEp2Y0dWeWRIbE9ZVzFsY3loMllXeDFaU2s3WEc0Z0lIMWNibHh1SUNBdkx5QkpSU0JrYjJWemJpZDBJRzFoYTJVZ1pYSnliM0lnWm1sbGJHUnpJRzV2YmkxbGJuVnRaWEpoWW14bFhHNGdJQzh2SUdoMGRIQTZMeTl0YzJSdUxtMXBZM0p2YzI5bWRDNWpiMjB2Wlc0dGRYTXZiR2xpY21GeWVTOXBaUzlrZDNjMU1uTmlkQ2gyUFhaekxqazBLUzVoYzNCNFhHNGdJR2xtSUNocGMwVnljbTl5S0haaGJIVmxLVnh1SUNBZ0lDQWdKaVlnS0d0bGVYTXVhVzVrWlhoUFppZ25iV1Z6YzJGblpTY3BJRDQ5SURBZ2ZId2dhMlY1Y3k1cGJtUmxlRTltS0Nka1pYTmpjbWx3ZEdsdmJpY3BJRDQ5SURBcEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdadmNtMWhkRVZ5Y205eUtIWmhiSFZsS1R0Y2JpQWdmVnh1WEc0Z0lDOHZJRk52YldVZ2RIbHdaU0J2WmlCdlltcGxZM1FnZDJsMGFHOTFkQ0J3Y205d1pYSjBhV1Z6SUdOaGJpQmlaU0J6YUc5eWRHTjFkSFJsWkM1Y2JpQWdhV1lnS0d0bGVYTXViR1Z1WjNSb0lEMDlQU0F3S1NCN1hHNGdJQ0FnYVdZZ0tHbHpSblZ1WTNScGIyNG9kbUZzZFdVcEtTQjdYRzRnSUNBZ0lDQjJZWElnYm1GdFpTQTlJSFpoYkhWbExtNWhiV1VnUHlBbk9pQW5JQ3NnZG1Gc2RXVXVibUZ0WlNBNklDY25PMXh1SUNBZ0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2RiUm5WdVkzUnBiMjRuSUNzZ2JtRnRaU0FySUNkZEp5d2dKM053WldOcFlXd25LVHRjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR2x6VW1WblJYaHdLSFpoYkhWbEtTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLRkpsWjBWNGNDNXdjbTkwYjNSNWNHVXVkRzlUZEhKcGJtY3VZMkZzYkNoMllXeDFaU2tzSUNkeVpXZGxlSEFuS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0dselJHRjBaU2gyWVd4MVpTa3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2hFWVhSbExuQnliM1J2ZEhsd1pTNTBiMU4wY21sdVp5NWpZV3hzS0haaGJIVmxLU3dnSjJSaGRHVW5LVHRjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR2x6UlhKeWIzSW9kbUZzZFdVcEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z1ptOXliV0YwUlhKeWIzSW9kbUZzZFdVcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lIWmhjaUJpWVhObElEMGdKeWNzSUdGeWNtRjVJRDBnWm1Gc2MyVXNJR0p5WVdObGN5QTlJRnNuZXljc0lDZDlKMTA3WEc1Y2JpQWdMeThnVFdGclpTQkJjbkpoZVNCellYa2dkR2hoZENCMGFHVjVJR0Z5WlNCQmNuSmhlVnh1SUNCcFppQW9hWE5CY25KaGVTaDJZV3gxWlNrcElIdGNiaUFnSUNCaGNuSmhlU0E5SUhSeWRXVTdYRzRnSUNBZ1luSmhZMlZ6SUQwZ1d5ZGJKeXdnSjEwblhUdGNiaUFnZlZ4dVhHNGdJQzh2SUUxaGEyVWdablZ1WTNScGIyNXpJSE5oZVNCMGFHRjBJSFJvWlhrZ1lYSmxJR1oxYm1OMGFXOXVjMXh1SUNCcFppQW9hWE5HZFc1amRHbHZiaWgyWVd4MVpTa3BJSHRjYmlBZ0lDQjJZWElnYmlBOUlIWmhiSFZsTG01aGJXVWdQeUFuT2lBbklDc2dkbUZzZFdVdWJtRnRaU0E2SUNjbk8xeHVJQ0FnSUdKaGMyVWdQU0FuSUZ0R2RXNWpkR2x2YmljZ0t5QnVJQ3NnSjEwbk8xeHVJQ0I5WEc1Y2JpQWdMeThnVFdGclpTQlNaV2RGZUhCeklITmhlU0IwYUdGMElIUm9aWGtnWVhKbElGSmxaMFY0Y0hOY2JpQWdhV1lnS0dselVtVm5SWGh3S0haaGJIVmxLU2tnZTF4dUlDQWdJR0poYzJVZ1BTQW5JQ2NnS3lCU1pXZEZlSEF1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcE8xeHVJQ0I5WEc1Y2JpQWdMeThnVFdGclpTQmtZWFJsY3lCM2FYUm9JSEJ5YjNCbGNuUnBaWE1nWm1seWMzUWdjMkY1SUhSb1pTQmtZWFJsWEc0Z0lHbG1JQ2hwYzBSaGRHVW9kbUZzZFdVcEtTQjdYRzRnSUNBZ1ltRnpaU0E5SUNjZ0p5QXJJRVJoZEdVdWNISnZkRzkwZVhCbExuUnZWVlJEVTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwTzF4dUlDQjlYRzVjYmlBZ0x5OGdUV0ZyWlNCbGNuSnZjaUIzYVhSb0lHMWxjM05oWjJVZ1ptbHljM1FnYzJGNUlIUm9aU0JsY25KdmNseHVJQ0JwWmlBb2FYTkZjbkp2Y2loMllXeDFaU2twSUh0Y2JpQWdJQ0JpWVhObElEMGdKeUFuSUNzZ1ptOXliV0YwUlhKeWIzSW9kbUZzZFdVcE8xeHVJQ0I5WEc1Y2JpQWdhV1lnS0d0bGVYTXViR1Z1WjNSb0lEMDlQU0F3SUNZbUlDZ2hZWEp5WVhrZ2ZId2dkbUZzZFdVdWJHVnVaM1JvSUQwOUlEQXBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHSnlZV05sYzFzd1hTQXJJR0poYzJVZ0t5QmljbUZqWlhOYk1WMDdYRzRnSUgxY2JseHVJQ0JwWmlBb2NtVmpkWEp6WlZScGJXVnpJRHdnTUNrZ2UxeHVJQ0FnSUdsbUlDaHBjMUpsWjBWNGNDaDJZV3gxWlNrcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTaFNaV2RGZUhBdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBMQ0FuY21WblpYaHdKeWs3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTZ25XMDlpYW1WamRGMG5MQ0FuYzNCbFkybGhiQ2NwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUdOMGVDNXpaV1Z1TG5CMWMyZ29kbUZzZFdVcE8xeHVYRzRnSUhaaGNpQnZkWFJ3ZFhRN1hHNGdJR2xtSUNoaGNuSmhlU2tnZTF4dUlDQWdJRzkxZEhCMWRDQTlJR1p2Y20xaGRFRnljbUY1S0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeXdnZG1semFXSnNaVXRsZVhNc0lHdGxlWE1wTzF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUc5MWRIQjFkQ0E5SUd0bGVYTXViV0Z3S0daMWJtTjBhVzl1S0d0bGVTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHWnZjbTFoZEZCeWIzQmxjblI1S0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeXdnZG1semFXSnNaVXRsZVhNc0lHdGxlU3dnWVhKeVlYa3BPMXh1SUNBZ0lIMHBPMXh1SUNCOVhHNWNiaUFnWTNSNExuTmxaVzR1Y0c5d0tDazdYRzVjYmlBZ2NtVjBkWEp1SUhKbFpIVmpaVlJ2VTJsdVoyeGxVM1J5YVc1bktHOTFkSEIxZEN3Z1ltRnpaU3dnWW5KaFkyVnpLVHRjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJtYjNKdFlYUlFjbWx0YVhScGRtVW9ZM1I0TENCMllXeDFaU2tnZTF4dUlDQnBaaUFvYVhOVmJtUmxabWx1WldRb2RtRnNkV1VwS1Z4dUlDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2duZFc1a1pXWnBibVZrSnl3Z0ozVnVaR1ZtYVc1bFpDY3BPMXh1SUNCcFppQW9hWE5UZEhKcGJtY29kbUZzZFdVcEtTQjdYRzRnSUNBZ2RtRnlJSE5wYlhCc1pTQTlJQ2RjWENjbklDc2dTbE5QVGk1emRISnBibWRwWm5rb2RtRnNkV1VwTG5KbGNHeGhZMlVvTDE1Y0lueGNJaVF2Wnl3Z0p5Y3BYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F1Y21Wd2JHRmpaU2d2Snk5bkxDQmNJbHhjWEZ3blhDSXBYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F1Y21Wd2JHRmpaU2d2WEZ4Y1hGd2lMMmNzSUNkY0lpY3BJQ3NnSjF4Y0p5YzdYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtITnBiWEJzWlN3Z0ozTjBjbWx1WnljcE8xeHVJQ0I5WEc0Z0lHbG1JQ2hwYzA1MWJXSmxjaWgyWVd4MVpTa3BYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDY25JQ3NnZG1Gc2RXVXNJQ2R1ZFcxaVpYSW5LVHRjYmlBZ2FXWWdLR2x6UW05dmJHVmhiaWgyWVd4MVpTa3BYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDY25JQ3NnZG1Gc2RXVXNJQ2RpYjI5c1pXRnVKeWs3WEc0Z0lDOHZJRVp2Y2lCemIyMWxJSEpsWVhOdmJpQjBlWEJsYjJZZ2JuVnNiQ0JwY3lCY0ltOWlhbVZqZEZ3aUxDQnpieUJ6Y0dWamFXRnNJR05oYzJVZ2FHVnlaUzVjYmlBZ2FXWWdLR2x6VG5Wc2JDaDJZV3gxWlNrcFhHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NkdWRXeHNKeXdnSjI1MWJHd25LVHRjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJtYjNKdFlYUkZjbkp2Y2loMllXeDFaU2tnZTF4dUlDQnlaWFIxY200Z0oxc25JQ3NnUlhKeWIzSXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwSUNzZ0oxMG5PMXh1ZlZ4dVhHNWNibVoxYm1OMGFXOXVJR1p2Y20xaGRFRnljbUY1S0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeXdnZG1semFXSnNaVXRsZVhNc0lHdGxlWE1wSUh0Y2JpQWdkbUZ5SUc5MWRIQjFkQ0E5SUZ0ZE8xeHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Dd2diQ0E5SUhaaGJIVmxMbXhsYm1kMGFEc2dhU0E4SUd3N0lDc3JhU2tnZTF4dUlDQWdJR2xtSUNob1lYTlBkMjVRY205d1pYSjBlU2gyWVd4MVpTd2dVM1J5YVc1bktHa3BLU2tnZTF4dUlDQWdJQ0FnYjNWMGNIVjBMbkIxYzJnb1ptOXliV0YwVUhKdmNHVnlkSGtvWTNSNExDQjJZV3gxWlN3Z2NtVmpkWEp6WlZScGJXVnpMQ0IyYVhOcFlteGxTMlY1Y3l4Y2JpQWdJQ0FnSUNBZ0lDQlRkSEpwYm1jb2FTa3NJSFJ5ZFdVcEtUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnYjNWMGNIVjBMbkIxYzJnb0p5Y3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dUlDQnJaWGx6TG1admNrVmhZMmdvWm5WdVkzUnBiMjRvYTJWNUtTQjdYRzRnSUNBZ2FXWWdLQ0ZyWlhrdWJXRjBZMmdvTDE1Y1hHUXJKQzhwS1NCN1hHNGdJQ0FnSUNCdmRYUndkWFF1Y0hWemFDaG1iM0p0WVhSUWNtOXdaWEowZVNoamRIZ3NJSFpoYkhWbExDQnlaV04xY25ObFZHbHRaWE1zSUhacGMybGliR1ZMWlhsekxGeHVJQ0FnSUNBZ0lDQWdJR3RsZVN3Z2RISjFaU2twTzF4dUlDQWdJSDFjYmlBZ2ZTazdYRzRnSUhKbGRIVnliaUJ2ZFhSd2RYUTdYRzU5WEc1Y2JseHVablZ1WTNScGIyNGdabTl5YldGMFVISnZjR1Z5ZEhrb1kzUjRMQ0IyWVd4MVpTd2djbVZqZFhKelpWUnBiV1Z6TENCMmFYTnBZbXhsUzJWNWN5d2dhMlY1TENCaGNuSmhlU2tnZTF4dUlDQjJZWElnYm1GdFpTd2djM1J5TENCa1pYTmpPMXh1SUNCa1pYTmpJRDBnVDJKcVpXTjBMbWRsZEU5M2JsQnliM0JsY25SNVJHVnpZM0pwY0hSdmNpaDJZV3gxWlN3Z2EyVjVLU0I4ZkNCN0lIWmhiSFZsT2lCMllXeDFaVnRyWlhsZElIMDdYRzRnSUdsbUlDaGtaWE5qTG1kbGRDa2dlMXh1SUNBZ0lHbG1JQ2hrWlhOakxuTmxkQ2tnZTF4dUlDQWdJQ0FnYzNSeUlEMGdZM1I0TG5OMGVXeHBlbVVvSjF0SFpYUjBaWEl2VTJWMGRHVnlYU2NzSUNkemNHVmphV0ZzSnlrN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJSE4wY2lBOUlHTjBlQzV6ZEhsc2FYcGxLQ2RiUjJWMGRHVnlYU2NzSUNkemNHVmphV0ZzSnlrN1hHNGdJQ0FnZlZ4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUdsbUlDaGtaWE5qTG5ObGRDa2dlMXh1SUNBZ0lDQWdjM1J5SUQwZ1kzUjRMbk4wZVd4cGVtVW9KMXRUWlhSMFpYSmRKeXdnSjNOd1pXTnBZV3duS1R0Y2JpQWdJQ0I5WEc0Z0lIMWNiaUFnYVdZZ0tDRm9ZWE5QZDI1UWNtOXdaWEowZVNoMmFYTnBZbXhsUzJWNWN5d2dhMlY1S1NrZ2UxeHVJQ0FnSUc1aGJXVWdQU0FuV3ljZ0t5QnJaWGtnS3lBblhTYzdYRzRnSUgxY2JpQWdhV1lnS0NGemRISXBJSHRjYmlBZ0lDQnBaaUFvWTNSNExuTmxaVzR1YVc1a1pYaFBaaWhrWlhOakxuWmhiSFZsS1NBOElEQXBJSHRjYmlBZ0lDQWdJR2xtSUNocGMwNTFiR3dvY21WamRYSnpaVlJwYldWektTa2dlMXh1SUNBZ0lDQWdJQ0J6ZEhJZ1BTQm1iM0p0WVhSV1lXeDFaU2hqZEhnc0lHUmxjMk11ZG1Gc2RXVXNJRzUxYkd3cE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ2MzUnlJRDBnWm05eWJXRjBWbUZzZFdVb1kzUjRMQ0JrWlhOakxuWmhiSFZsTENCeVpXTjFjbk5sVkdsdFpYTWdMU0F4S1R0Y2JpQWdJQ0FnSUgxY2JpQWdJQ0FnSUdsbUlDaHpkSEl1YVc1a1pYaFBaaWduWEZ4dUp5a2dQaUF0TVNrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvWVhKeVlYa3BJSHRjYmlBZ0lDQWdJQ0FnSUNCemRISWdQU0J6ZEhJdWMzQnNhWFFvSjF4Y2JpY3BMbTFoY0NobWRXNWpkR2x2Ymloc2FXNWxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z0p5QWdKeUFySUd4cGJtVTdYRzRnSUNBZ0lDQWdJQ0FnZlNrdWFtOXBiaWduWEZ4dUp5a3VjM1ZpYzNSeUtESXBPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUhOMGNpQTlJQ2RjWEc0bklDc2djM1J5TG5Od2JHbDBLQ2RjWEc0bktTNXRZWEFvWm5WdVkzUnBiMjRvYkdsdVpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUNjZ0lDQW5JQ3NnYkdsdVpUdGNiaUFnSUNBZ0lDQWdJQ0I5S1M1cWIybHVLQ2RjWEc0bktUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmVnh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNCemRISWdQU0JqZEhndWMzUjViR2w2WlNnblcwTnBjbU4xYkdGeVhTY3NJQ2R6Y0dWamFXRnNKeWs3WEc0Z0lDQWdmVnh1SUNCOVhHNGdJR2xtSUNocGMxVnVaR1ZtYVc1bFpDaHVZVzFsS1NrZ2UxeHVJQ0FnSUdsbUlDaGhjbkpoZVNBbUppQnJaWGt1YldGMFkyZ29MMTVjWEdRckpDOHBLU0I3WEc0Z0lDQWdJQ0J5WlhSMWNtNGdjM1J5TzF4dUlDQWdJSDFjYmlBZ0lDQnVZVzFsSUQwZ1NsTlBUaTV6ZEhKcGJtZHBabmtvSnljZ0t5QnJaWGtwTzF4dUlDQWdJR2xtSUNodVlXMWxMbTFoZEdOb0tDOWVYQ0lvVzJFdGVrRXRXbDlkVzJFdGVrRXRXbDh3TFRsZEtpbGNJaVF2S1NrZ2UxeHVJQ0FnSUNBZ2JtRnRaU0E5SUc1aGJXVXVjM1ZpYzNSeUtERXNJRzVoYldVdWJHVnVaM1JvSUMwZ01pazdYRzRnSUNBZ0lDQnVZVzFsSUQwZ1kzUjRMbk4wZVd4cGVtVW9ibUZ0WlN3Z0oyNWhiV1VuS1R0Y2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdibUZ0WlNBOUlHNWhiV1V1Y21Wd2JHRmpaU2d2Snk5bkxDQmNJbHhjWEZ3blhDSXBYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQzV5WlhCc1lXTmxLQzljWEZ4Y1hDSXZaeXdnSjF3aUp5bGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdMbkpsY0d4aFkyVW9MeWhlWENKOFhDSWtLUzluTENCY0lpZGNJaWs3WEc0Z0lDQWdJQ0J1WVcxbElEMGdZM1I0TG5OMGVXeHBlbVVvYm1GdFpTd2dKM04wY21sdVp5Y3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQnVZVzFsSUNzZ0p6b2dKeUFySUhOMGNqdGNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQnlaV1IxWTJWVWIxTnBibWRzWlZOMGNtbHVaeWh2ZFhSd2RYUXNJR0poYzJVc0lHSnlZV05sY3lrZ2UxeHVJQ0IyWVhJZ2JuVnRUR2x1WlhORmMzUWdQU0F3TzF4dUlDQjJZWElnYkdWdVozUm9JRDBnYjNWMGNIVjBMbkpsWkhWalpTaG1kVzVqZEdsdmJpaHdjbVYyTENCamRYSXBJSHRjYmlBZ0lDQnVkVzFNYVc1bGMwVnpkQ3NyTzF4dUlDQWdJR2xtSUNoamRYSXVhVzVrWlhoUFppZ25YRnh1SnlrZ1BqMGdNQ2tnYm5WdFRHbHVaWE5GYzNRckt6dGNiaUFnSUNCeVpYUjFjbTRnY0hKbGRpQXJJR04xY2k1eVpYQnNZV05sS0M5Y1hIVXdNREZpWEZ4YlhGeGtYRnhrUDIwdlp5d2dKeWNwTG14bGJtZDBhQ0FySURFN1hHNGdJSDBzSURBcE8xeHVYRzRnSUdsbUlDaHNaVzVuZEdnZ1BpQTJNQ2tnZTF4dUlDQWdJSEpsZEhWeWJpQmljbUZqWlhOYk1GMGdLMXh1SUNBZ0lDQWdJQ0FnSUNBb1ltRnpaU0E5UFQwZ0p5Y2dQeUFuSnlBNklHSmhjMlVnS3lBblhGeHVJQ2NwSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdKeUFuSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdiM1YwY0hWMExtcHZhVzRvSnl4Y1hHNGdJQ2NwSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdKeUFuSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdZbkpoWTJWeld6RmRPMXh1SUNCOVhHNWNiaUFnY21WMGRYSnVJR0p5WVdObGMxc3dYU0FySUdKaGMyVWdLeUFuSUNjZ0t5QnZkWFJ3ZFhRdWFtOXBiaWduTENBbktTQXJJQ2NnSnlBcklHSnlZV05sYzFzeFhUdGNibjFjYmx4dVhHNHZMeUJPVDFSRk9pQlVhR1Z6WlNCMGVYQmxJR05vWldOcmFXNW5JR1oxYm1OMGFXOXVjeUJwYm5SbGJuUnBiMjVoYkd4NUlHUnZiaWQwSUhWelpTQmdhVzV6ZEdGdVkyVnZabUJjYmk4dklHSmxZMkYxYzJVZ2FYUWdhWE1nWm5KaFoybHNaU0JoYm1RZ1kyRnVJR0psSUdWaGMybHNlU0JtWVd0bFpDQjNhWFJvSUdCUFltcGxZM1F1WTNKbFlYUmxLQ2xnTGx4dVpuVnVZM1JwYjI0Z2FYTkJjbkpoZVNoaGNpa2dlMXh1SUNCeVpYUjFjbTRnUVhKeVlYa3VhWE5CY25KaGVTaGhjaWs3WEc1OVhHNWxlSEJ2Y25SekxtbHpRWEp5WVhrZ1BTQnBjMEZ5Y21GNU8xeHVYRzVtZFc1amRHbHZiaUJwYzBKdmIyeGxZVzRvWVhKbktTQjdYRzRnSUhKbGRIVnliaUIwZVhCbGIyWWdZWEpuSUQwOVBTQW5ZbTl2YkdWaGJpYzdYRzU5WEc1bGVIQnZjblJ6TG1selFtOXZiR1ZoYmlBOUlHbHpRbTl2YkdWaGJqdGNibHh1Wm5WdVkzUnBiMjRnYVhOT2RXeHNLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdZWEpuSUQwOVBTQnVkV3hzTzF4dWZWeHVaWGh3YjNKMGN5NXBjMDUxYkd3Z1BTQnBjMDUxYkd3N1hHNWNibVoxYm1OMGFXOXVJR2x6VG5Wc2JFOXlWVzVrWldacGJtVmtLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdZWEpuSUQwOUlHNTFiR3c3WEc1OVhHNWxlSEJ2Y25SekxtbHpUblZzYkU5eVZXNWtaV1pwYm1Wa0lEMGdhWE5PZFd4c1QzSlZibVJsWm1sdVpXUTdYRzVjYm1aMWJtTjBhVzl1SUdselRuVnRZbVZ5S0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKMjUxYldKbGNpYzdYRzU5WEc1bGVIQnZjblJ6TG1selRuVnRZbVZ5SUQwZ2FYTk9kVzFpWlhJN1hHNWNibVoxYm1OMGFXOXVJR2x6VTNSeWFXNW5LR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0ozTjBjbWx1WnljN1hHNTlYRzVsZUhCdmNuUnpMbWx6VTNSeWFXNW5JRDBnYVhOVGRISnBibWM3WEc1Y2JtWjFibU4wYVc5dUlHbHpVM2x0WW05c0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z2RIbHdaVzltSUdGeVp5QTlQVDBnSjNONWJXSnZiQ2M3WEc1OVhHNWxlSEJ2Y25SekxtbHpVM2x0WW05c0lEMGdhWE5UZVcxaWIydzdYRzVjYm1aMWJtTjBhVzl1SUdselZXNWtaV1pwYm1Wa0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z1lYSm5JRDA5UFNCMmIybGtJREE3WEc1OVhHNWxlSEJ2Y25SekxtbHpWVzVrWldacGJtVmtJRDBnYVhOVmJtUmxabWx1WldRN1hHNWNibVoxYm1OMGFXOXVJR2x6VW1WblJYaHdLSEpsS1NCN1hHNGdJSEpsZEhWeWJpQnBjMDlpYW1WamRDaHlaU2tnSmlZZ2IySnFaV04wVkc5VGRISnBibWNvY21VcElEMDlQU0FuVzI5aWFtVmpkQ0JTWldkRmVIQmRKenRjYm4xY2JtVjRjRzl5ZEhNdWFYTlNaV2RGZUhBZ1BTQnBjMUpsWjBWNGNEdGNibHh1Wm5WdVkzUnBiMjRnYVhOUFltcGxZM1FvWVhKbktTQjdYRzRnSUhKbGRIVnliaUIwZVhCbGIyWWdZWEpuSUQwOVBTQW5iMkpxWldOMEp5QW1KaUJoY21jZ0lUMDlJRzUxYkd3N1hHNTlYRzVsZUhCdmNuUnpMbWx6VDJKcVpXTjBJRDBnYVhOUFltcGxZM1E3WEc1Y2JtWjFibU4wYVc5dUlHbHpSR0YwWlNoa0tTQjdYRzRnSUhKbGRIVnliaUJwYzA5aWFtVmpkQ2hrS1NBbUppQnZZbXBsWTNSVWIxTjBjbWx1Wnloa0tTQTlQVDBnSjF0dlltcGxZM1FnUkdGMFpWMG5PMXh1ZlZ4dVpYaHdiM0owY3k1cGMwUmhkR1VnUFNCcGMwUmhkR1U3WEc1Y2JtWjFibU4wYVc5dUlHbHpSWEp5YjNJb1pTa2dlMXh1SUNCeVpYUjFjbTRnYVhOUFltcGxZM1FvWlNrZ0ppWmNiaUFnSUNBZ0lDaHZZbXBsWTNSVWIxTjBjbWx1WnlobEtTQTlQVDBnSjF0dlltcGxZM1FnUlhKeWIzSmRKeUI4ZkNCbElHbHVjM1JoYm1ObGIyWWdSWEp5YjNJcE8xeHVmVnh1Wlhod2IzSjBjeTVwYzBWeWNtOXlJRDBnYVhORmNuSnZjanRjYmx4dVpuVnVZM1JwYjI0Z2FYTkdkVzVqZEdsdmJpaGhjbWNwSUh0Y2JpQWdjbVYwZFhKdUlIUjVjR1Z2WmlCaGNtY2dQVDA5SUNkbWRXNWpkR2x2YmljN1hHNTlYRzVsZUhCdmNuUnpMbWx6Um5WdVkzUnBiMjRnUFNCcGMwWjFibU4wYVc5dU8xeHVYRzVtZFc1amRHbHZiaUJwYzFCeWFXMXBkR2wyWlNoaGNtY3BJSHRjYmlBZ2NtVjBkWEp1SUdGeVp5QTlQVDBnYm5Wc2JDQjhmRnh1SUNBZ0lDQWdJQ0FnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKMkp2YjJ4bFlXNG5JSHg4WEc0Z0lDQWdJQ0FnSUNCMGVYQmxiMllnWVhKbklEMDlQU0FuYm5WdFltVnlKeUI4ZkZ4dUlDQWdJQ0FnSUNBZ2RIbHdaVzltSUdGeVp5QTlQVDBnSjNOMGNtbHVaeWNnZkh4Y2JpQWdJQ0FnSUNBZ0lIUjVjR1Z2WmlCaGNtY2dQVDA5SUNkemVXMWliMnduSUh4OElDQXZMeUJGVXpZZ2MzbHRZbTlzWEc0Z0lDQWdJQ0FnSUNCMGVYQmxiMllnWVhKbklEMDlQU0FuZFc1a1pXWnBibVZrSnp0Y2JuMWNibVY0Y0c5eWRITXVhWE5RY21sdGFYUnBkbVVnUFNCcGMxQnlhVzFwZEdsMlpUdGNibHh1Wlhod2IzSjBjeTVwYzBKMVptWmxjaUE5SUhKbGNYVnBjbVVvSnk0dmMzVndjRzl5ZEM5cGMwSjFabVpsY2ljcE8xeHVYRzVtZFc1amRHbHZiaUJ2WW1wbFkzUlViMU4wY21sdVp5aHZLU0I3WEc0Z0lISmxkSFZ5YmlCUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29ieWs3WEc1OVhHNWNibHh1Wm5WdVkzUnBiMjRnY0dGa0tHNHBJSHRjYmlBZ2NtVjBkWEp1SUc0Z1BDQXhNQ0EvSUNjd0p5QXJJRzR1ZEc5VGRISnBibWNvTVRBcElEb2diaTUwYjFOMGNtbHVaeWd4TUNrN1hHNTlYRzVjYmx4dWRtRnlJRzF2Ym5Sb2N5QTlJRnNuU21GdUp5d2dKMFpsWWljc0lDZE5ZWEluTENBblFYQnlKeXdnSjAxaGVTY3NJQ2RLZFc0bkxDQW5TblZzSnl3Z0owRjFaeWNzSUNkVFpYQW5MRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQW5UMk4wSnl3Z0owNXZkaWNzSUNkRVpXTW5YVHRjYmx4dUx5OGdNallnUm1WaUlERTJPakU1T2pNMFhHNW1kVzVqZEdsdmJpQjBhVzFsYzNSaGJYQW9LU0I3WEc0Z0lIWmhjaUJrSUQwZ2JtVjNJRVJoZEdVb0tUdGNiaUFnZG1GeUlIUnBiV1VnUFNCYmNHRmtLR1F1WjJWMFNHOTFjbk1vS1Nrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUhCaFpDaGtMbWRsZEUxcGJuVjBaWE1vS1Nrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUhCaFpDaGtMbWRsZEZObFkyOXVaSE1vS1NsZExtcHZhVzRvSnpvbktUdGNiaUFnY21WMGRYSnVJRnRrTG1kbGRFUmhkR1VvS1N3Z2JXOXVkR2h6VzJRdVoyVjBUVzl1ZEdnb0tWMHNJSFJwYldWZExtcHZhVzRvSnlBbktUdGNibjFjYmx4dVhHNHZMeUJzYjJjZ2FYTWdhblZ6ZENCaElIUm9hVzRnZDNKaGNIQmxjaUIwYnlCamIyNXpiMnhsTG14dlp5QjBhR0YwSUhCeVpYQmxibVJ6SUdFZ2RHbHRaWE4wWVcxd1hHNWxlSEJ2Y25SekxteHZaeUE5SUdaMWJtTjBhVzl1S0NrZ2UxeHVJQ0JqYjI1emIyeGxMbXh2WnlnbkpYTWdMU0FsY3ljc0lIUnBiV1Z6ZEdGdGNDZ3BMQ0JsZUhCdmNuUnpMbVp2Y20xaGRDNWhjSEJzZVNobGVIQnZjblJ6TENCaGNtZDFiV1Z1ZEhNcEtUdGNibjA3WEc1Y2JseHVMeW9xWEc0Z0tpQkpibWhsY21sMElIUm9aU0J3Y205MGIzUjVjR1VnYldWMGFHOWtjeUJtY205dElHOXVaU0JqYjI1emRISjFZM1J2Y2lCcGJuUnZJR0Z1YjNSb1pYSXVYRzRnS2x4dUlDb2dWR2hsSUVaMWJtTjBhVzl1TG5CeWIzUnZkSGx3WlM1cGJtaGxjbWwwY3lCbWNtOXRJR3hoYm1jdWFuTWdjbVYzY21sMGRHVnVJR0Z6SUdFZ2MzUmhibVJoYkc5dVpWeHVJQ29nWm5WdVkzUnBiMjRnS0c1dmRDQnZiaUJHZFc1amRHbHZiaTV3Y205MGIzUjVjR1VwTGlCT1QxUkZPaUJKWmlCMGFHbHpJR1pwYkdVZ2FYTWdkRzhnWW1VZ2JHOWhaR1ZrWEc0Z0tpQmtkWEpwYm1jZ1ltOXZkSE4wY21Gd2NHbHVaeUIwYUdseklHWjFibU4wYVc5dUlHNWxaV1J6SUhSdklHSmxJSEpsZDNKcGRIUmxiaUIxYzJsdVp5QnpiMjFsSUc1aGRHbDJaVnh1SUNvZ1puVnVZM1JwYjI1eklHRnpJSEJ5YjNSdmRIbHdaU0J6WlhSMWNDQjFjMmx1WnlCdWIzSnRZV3dnU21GMllWTmpjbWx3ZENCa2IyVnpJRzV2ZENCM2IzSnJJR0Z6WEc0Z0tpQmxlSEJsWTNSbFpDQmtkWEpwYm1jZ1ltOXZkSE4wY21Gd2NHbHVaeUFvYzJWbElHMXBjbkp2Y2k1cWN5QnBiaUJ5TVRFME9UQXpLUzVjYmlBcVhHNGdLaUJBY0dGeVlXMGdlMloxYm1OMGFXOXVmU0JqZEc5eUlFTnZibk4wY25WamRHOXlJR1oxYm1OMGFXOXVJSGRvYVdOb0lHNWxaV1J6SUhSdklHbHVhR1Z5YVhRZ2RHaGxYRzRnS2lBZ0lDQWdjSEp2ZEc5MGVYQmxMbHh1SUNvZ1FIQmhjbUZ0SUh0bWRXNWpkR2x2Ym4wZ2MzVndaWEpEZEc5eUlFTnZibk4wY25WamRHOXlJR1oxYm1OMGFXOXVJSFJ2SUdsdWFHVnlhWFFnY0hKdmRHOTBlWEJsSUdaeWIyMHVYRzRnS2k5Y2JtVjRjRzl5ZEhNdWFXNW9aWEpwZEhNZ1BTQnlaWEYxYVhKbEtDZHBibWhsY21sMGN5Y3BPMXh1WEc1bGVIQnZjblJ6TGw5bGVIUmxibVFnUFNCbWRXNWpkR2x2YmlodmNtbG5hVzRzSUdGa1pDa2dlMXh1SUNBdkx5QkViMjRuZENCa2J5QmhibmwwYUdsdVp5QnBaaUJoWkdRZ2FYTnVKM1FnWVc0Z2IySnFaV04wWEc0Z0lHbG1JQ2doWVdSa0lIeDhJQ0ZwYzA5aWFtVmpkQ2hoWkdRcEtTQnlaWFIxY200Z2IzSnBaMmx1TzF4dVhHNGdJSFpoY2lCclpYbHpJRDBnVDJKcVpXTjBMbXRsZVhNb1lXUmtLVHRjYmlBZ2RtRnlJR2tnUFNCclpYbHpMbXhsYm1kMGFEdGNiaUFnZDJocGJHVWdLR2t0TFNrZ2UxeHVJQ0FnSUc5eWFXZHBibHRyWlhselcybGRYU0E5SUdGa1pGdHJaWGx6VzJsZFhUdGNiaUFnZlZ4dUlDQnlaWFIxY200Z2IzSnBaMmx1TzF4dWZUdGNibHh1Wm5WdVkzUnBiMjRnYUdGelQzZHVVSEp2Y0dWeWRIa29iMkpxTENCd2NtOXdLU0I3WEc0Z0lISmxkSFZ5YmlCUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG1oaGMwOTNibEJ5YjNCbGNuUjVMbU5oYkd3b2IySnFMQ0J3Y205d0tUdGNibjFjYmlKZGZRPT0iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnNcbiAqL1xuXG52YXIgdXRpbCA9IHt9O1xuXG51dGlsLmlzT2JqZWN0ID0gZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbnV0aWwuaXNOdW1iZXIgPSBmdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG51dGlsLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cblxudXRpbC5pc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpe1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuXG4vKipcbiAqIEV2ZW50RW1pdHRlciBjbGFzc1xuICovXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgRXZlbnRFbWl0dGVyLmluaXQuY2FsbCh0aGlzKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuRXZlbnRFbWl0dGVyLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufTtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIXV0aWwuaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJyAmJiAhdGhpcy5fZXZlbnRzLmVycm9yKSB7XG4gICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAodXRpbC5pc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIHV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAodXRpbC5pc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuXG4gICAgICBpZiAodXRpbC5pc0Z1bmN0aW9uKGNvbnNvbGUuZXJyb3IpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgfVxuICAgICAgaWYgKHV0aWwuaXNGdW5jdGlvbihjb25zb2xlLnRyYWNlKSlcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKHV0aWwuaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmICh1dGlsLmlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAodXRpbC5pc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuIiwidmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cblxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8gTG9nZ2luZyB1dGlsaXR5IG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgREVCVUcgPSBmYWxzZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIERpeWFOb2RlKCl7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHR0aGlzLl9hZGRyID0gbnVsbDtcblx0dGhpcy5fc29ja2V0ID0gbnVsbDtcblx0dGhpcy5fbmV4dElkID0gMDtcblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcblx0dGhpcy5fcGVuZGluZ01lc3NhZ2VzID0gW107XG5cdHRoaXMuX3BlZXJzID0gW107XG5cdHRoaXMuX3JlY29ubmVjdFRpbWVvdXQgPSAxMDAwO1xuXHR0aGlzLl9jb25uZWN0VGltZW91dCA9IDUwMDA7XG59XG5pbmhlcml0cyhEaXlhTm9kZSwgRXZlbnRFbWl0dGVyKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vIFB1YmxpYyBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5hZGRyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9hZGRyOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnBlZXJzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuX3BlZXJzOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnNlbGYgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3NlbGY7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2V0U2VjdXJlZCA9IGZ1bmN0aW9uKGJTZWN1cmVkKSB7IHRoaXMuX3NlY3VyZWQgPSBiU2VjdXJlZCAhPT0gZmFsc2U7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2V0V1NvY2tldCA9IGZ1bmN0aW9uKFdTb2NrZXQpIHt0aGlzLl9XU29ja2V0ID0gV1NvY2tldDt9XG5cblxuXG4vKiogQHJldHVybiB7UHJvbWlzZTxTdHJpbmc+fSB0aGUgY29ubmVjdGVkIHBlZXIgbmFtZSAqL1xuRGl5YU5vZGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbihhZGRyLCBXU29ja2V0KXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmJEb250UmVjb25uZWN0ZWQgPSBmYWxzZTtcblxuXHRpZihXU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gV1NvY2tldDtcblx0ZWxzZSBpZighdGhpcy5fV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQ7XG5cdFdTb2NrZXQgPSB0aGlzLl9XU29ja2V0O1xuXG5cdC8vIENoZWNrIGFuZCBGb3JtYXQgVVJJIChGUUROKVxuXHRpZihhZGRyLmluZGV4T2YoXCJ3czovL1wiKSA9PT0gMCAmJiB0aGlzLl9zZWN1cmVkKSByZXR1cm4gUS5yZWplY3QoXCJQbGVhc2UgdXNlIGEgc2VjdXJlZCBjb25uZWN0aW9uIChcIiArIGFkZHIgKyBcIilcIik7XG5cdGlmKGFkZHIuaW5kZXhPZihcIndzczovL1wiKSA9PT0gMCAmJiB0aGlzLl9zZWN1cmVkID09PSBmYWxzZSkgcmV0dXJuIFEucmVqZWN0KFwiUGxlYXNlIHVzZSBhIG5vbi1zZWN1cmVkIGNvbm5lY3Rpb24gKFwiICsgYWRkciArIFwiKVwiKTtcblx0aWYoYWRkci5pbmRleE9mKFwid3M6Ly9cIikgIT09IDAgJiYgYWRkci5pbmRleE9mKFwid3NzOi8vXCIpICE9PSAwKSB7XG5cdFx0aWYodGhpcy5fc2VjdXJlZCkgYWRkciA9IFwid3NzOi8vXCIgKyBhZGRyO1xuXHRcdGVsc2UgYWRkciA9IFwid3M6Ly9cIiArIGFkZHI7XG5cdH1cblxuXG5cdGlmKHRoaXMuX2FkZHIgPT09IGFkZHIpe1xuXHRcdGlmKHRoaXMuX3N0YXR1cyA9PT0gJ29wZW5lZCcpXG5cdFx0XHRyZXR1cm4gUSh0aGlzLnNlbGYoKSk7XG5cdFx0ZWxzZSBpZih0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UgJiYgdGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UuaXNQZW5kaW5nKCkpXG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRyZXR1cm4gdGhpcy5jbG9zZSgpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHR0aGF0Ll9hZGRyID0gYWRkcjtcblx0XHR0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdFx0TG9nZ2VyLmxvZygnZDE6IGNvbm5lY3QgdG8gJyArIHRoYXQuX2FkZHIpO1xuXHRcdHZhciBzb2NrID0gbmV3IFNvY2tldEhhbmRsZXIoV1NvY2tldCwgdGhhdC5fYWRkciwgdGhhdC5fY29ubmVjdFRpbWVvdXQpO1xuXG5cdFx0aWYoIXRoYXQuX3NvY2tldEhhbmRsZXIpIHRoYXQuX3NvY2tldEhhbmRsZXIgPSBzb2NrO1xuXG5cdFx0c29jay5vbignb3BlbicsIGZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGF0Ll9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiW2QxXSBXZWJzb2NrZXQgcmVzcG9uZGVkIGJ1dCBhbHJlYWR5IGNvbm5lY3RlZCB0byBhIGRpZmZlcmVudCBvbmVcIik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBzb2NrO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ29wZW5lZCc7XG5cdFx0XHR0aGF0Ll9zZXR1cFBpbmdSZXNwb25zZSgpO1xuXHRcdH0pO1xuXG5cdFx0c29jay5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdFx0XHR0aGF0Ll9zdG9wUGluZ1Jlc3BvbnNlKCk7XG5cdFx0XHR0aGF0Ll9vbmNsb3NlKCk7XG5cdFx0XHRpZih0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQpIHsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKTsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDt9XG5cdFx0fSk7XG5cblx0XHRzb2NrLm9uKCd0aW1lb3V0JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGF0Ll9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKSByZXR1cm47XG5cdFx0XHR0aGF0Ll9zb2NrZXRIYW5kbGVyID0gbnVsbDtcblx0XHRcdHRoYXQuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHRcdFx0aWYodGhhdC5fY29ubmVjdGlvbkRlZmVycmVkKSB7IHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZC5yZWplY3QoXCJjbG9zZWRcIik7IHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7fVxuXHRcdH0pXG5cblx0XHRzb2NrLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24obWVzc2FnZSkgeyB0aGF0Ll9vbm1lc3NhZ2UobWVzc2FnZSk7IH0pO1xuXG5cdFx0cmV0dXJuIHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlO1xuXHR9KTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuYkRvbnRSZWNvbm5lY3RlZCA9IHRydWU7XG5cdHJldHVybiB0aGlzLmNsb3NlKCk7XG59O1xuXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuX3N0b3BQaW5nUmVzcG9uc2UoKTtcblx0aWYodGhpcy5fc29ja2V0SGFuZGxlcikgcmV0dXJuIHRoaXMuX3NvY2tldEhhbmRsZXIuY2xvc2UoKTtcblx0ZWxzZSByZXR1cm4gUSgpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuICh0aGlzLl9zb2NrZXRIYW5kbGVyICYmIHRoaXMuX3NvY2tldEhhbmRsZXIuaXNDb25uZWN0ZWQoKSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIHRpbWVvdXQsIG9wdGlvbnMpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cblx0aWYocGFyYW1zLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcblx0XHR2YXIgX3BhcmFtcyA9IHBhcmFtcy5zcGxpdChcIi5cIik7XG5cdFx0aWYoX3BhcmFtcy5sZW5ndGghPTIpIHRocm93ICdNYWxmb3JtZWRSZXF1ZXN0Jztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0aWYoIXBhcmFtcy5zZXJ2aWNlKSB7XG5cdFx0TG9nZ2VyLmVycm9yKCdObyBzZXJ2aWNlIGRlZmluZWQgZm9yIHJlcXVlc3QgIScpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShwYXJhbXMsIFwiUmVxdWVzdFwiKTtcblx0dGhpcy5fYXBwZW5kTWVzc2FnZShtZXNzYWdlLCBjYWxsYmFjayk7XG5cdGlmKHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsID0gb3B0aW9ucy5jYWxsYmFja19wYXJ0aWFsO1xuXHRtZXNzYWdlLm9wdGlvbnMgPSBvcHRpb25zO1xuXG5cdGlmKCFpc05hTih0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCl7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGhhbmRsZXIgPSB0aGF0Ll9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdFx0aWYoaGFuZGxlcikgdGhhdC5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgJ1RpbWVvdXQgZXhjZWVkZWQgKCcrdGltZW91dCsnbXMpICEnKTtcblx0XHR9LCB0aW1lb3V0KTtcblx0fVxuXG5cdGlmKCF0aGlzLl9zZW5kKG1lc3NhZ2UpKXtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBzZW5kIHJlcXVlc3QgIScpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2spe1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHRpZighcGFyYW1zLnNlcnZpY2Upe1xuXHRcdExvZ2dlci5lcnJvcignTm8gc2VydmljZSBkZWZpbmVkIGZvciBzdWJzY3JpcHRpb24gIScpO1xuXHRcdHJldHVybiAtMTtcblx0fVxuXG5cdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShwYXJhbXMsIFwiU3Vic2NyaXB0aW9uXCIpO1xuXHR0aGlzLl9hcHBlbmRNZXNzYWdlKG1lc3NhZ2UsIGNhbGxiYWNrKTtcblxuXHRpZighdGhpcy5fc2VuZChtZXNzYWdlKSl7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHRMb2dnZXIuZXJyb3IoJ0Nhbm5vdCBzZW5kIHN1YnNjcmlwdGlvbiAhJyk7XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0cmV0dXJuIG1lc3NhZ2UuaWQ7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJJZCl7XG5cdGlmKHRoaXMuX3BlbmRpbmdNZXNzYWdlc1tzdWJJZF0gJiYgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW3N1YklkXS50eXBlID09PSBcIlN1YnNjcmlwdGlvblwiKXtcblx0XHR2YXIgc3Vic2NyaXB0aW9uID0gdGhpcy5fcmVtb3ZlTWVzc2FnZShzdWJJZCk7XG5cblx0XHR2YXIgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2Uoe1xuXHRcdFx0dGFyZ2V0OiBzdWJzY3JpcHRpb24udGFyZ2V0LFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRzdWJJZDogc3ViSWRcblx0XHRcdH1cblx0XHR9LCBcIlVuc3Vic2NyaWJlXCIpO1xuXG5cdFx0aWYoIXRoaXMuX3NlbmQobWVzc2FnZSkpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKCdDYW5ub3Qgc2VuZCB1bnN1YnNjcmliZSAhJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLyBJbnRlcm5hbCBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLl9hcHBlbmRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgY2FsbGJhY2spe1xuXHR0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZS5pZF0gPSB7XG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdHR5cGU6IG1lc3NhZ2UudHlwZSxcblx0XHR0YXJnZXQ6IG1lc3NhZ2UudGFyZ2V0XG5cdH07XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3JlbW92ZU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlSWQpe1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlSWRdO1xuXHRpZihoYW5kbGVyKXtcblx0XHRkZWxldGUgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdFx0cmV0dXJuIGhhbmRsZXI7XG5cdH1lbHNle1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2NsZWFyTWVzc2FnZXMgPSBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRmb3IodmFyIG1lc3NhZ2VJZCBpbiB0aGlzLl9wZW5kaW5nTWVzc2FnZXMpe1xuXHRcdHZhciBoYW5kbGVyID0gdGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlSWQpO1xuXHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsIGVyciwgZGF0YSk7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY2xlYXJQZWVycyA9IGZ1bmN0aW9uKCl7XG5cdHdoaWxlKHRoaXMuX3BlZXJzLmxlbmd0aCkgdGhpcy5lbWl0KCdwZWVyLWRpc2Nvbm5lY3RlZCcsIHRoaXMuX3BlZXJzLnBvcCgpKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fZ2V0TWVzc2FnZUhhbmRsZXIgPSBmdW5jdGlvbihtZXNzYWdlSWQpe1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlSWRdO1xuXHRyZXR1cm4gaGFuZGxlciA/IGhhbmRsZXIgOiBudWxsO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9ub3RpZnlMaXN0ZW5lciA9IGZ1bmN0aW9uKGhhbmRsZXIsIGVycm9yLCBkYXRhKXtcblx0aWYoaGFuZGxlciAmJiB0eXBlb2YgaGFuZGxlci5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGVycm9yID0gZXJyb3IgPyBlcnJvciA6IG51bGw7XG5cdFx0ZGF0YSA9IGRhdGEgPyBkYXRhIDogbnVsbDtcblx0XHR0cnkge1xuXHRcdFx0aGFuZGxlci5jYWxsYmFjayhlcnJvciwgZGF0YSk7XG5cdFx0fSBjYXRjaChlKSB7IGNvbnNvbGUubG9nKCdbRXJyb3IgaW4gUmVxdWVzdCBjYWxsYmFja10gJyArIGUuc3RhY2sgPyBlLnN0YWNrIDogZSk7fVxuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0cmV0dXJuIHRoaXMuX3NvY2tldEhhbmRsZXIuc2VuZChtZXNzYWdlKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fc2V0dXBQaW5nUmVzcG9uc2UgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5fcGluZ1RpbWVvdXQgPSAxNTAwMDtcblx0dGhpcy5fbGFzdFBpbmcgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuXHRmdW5jdGlvbiBjaGVja1BpbmcoKXtcblx0XHR2YXIgY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdGlmKGN1clRpbWUgLSB0aGF0Ll9sYXN0UGluZyA+IHRoYXQuX3BpbmdUaW1lb3V0KXtcblx0XHRcdHRoYXQuX2ZvcmNlQ2xvc2UoKTtcblx0XHRcdExvZ2dlci5sb2coXCJkMTogIHRpbWVkIG91dCAhXCIpO1xuXHRcdH1lbHNle1xuXHRcdFx0TG9nZ2VyLmxvZyhcImQxOiBsYXN0IHBpbmcgb2tcIik7XG5cdFx0XHR0aGF0Ll9waW5nU2V0VGltZW91dElkID0gc2V0VGltZW91dChjaGVja1BpbmcsIE1hdGgucm91bmQodGhhdC5fcGluZ1RpbWVvdXQgLyAyLjEpKTtcblx0XHR9XG5cdH1cblxuXHRjaGVja1BpbmcoKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fc3RvcFBpbmdSZXNwb25zZSA9IGZ1bmN0aW9uKCl7XG5cdGNsZWFyVGltZW91dCh0aGlzLl9waW5nU2V0VGltZW91dElkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fZm9yY2VDbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuX3NvY2tldEhhbmRsZXIuY2xvc2UoKTtcblx0dGhpcy5fb25jbG9zZSgpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIFNvY2tldCBldmVudCBoYW5kbGVycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25tZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdGlmKGlzTmFOKG1lc3NhZ2UuaWQpKSByZXR1cm4gdGhpcy5faGFuZGxlSW50ZXJuYWxNZXNzYWdlKG1lc3NhZ2UpO1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKG1lc3NhZ2UuaWQpO1xuXHRpZighaGFuZGxlcikgcmV0dXJuO1xuXHRzd2l0Y2goaGFuZGxlci50eXBlKXtcblx0XHRjYXNlIFwiUmVxdWVzdFwiOlxuXHRcdFx0dGhpcy5faGFuZGxlUmVxdWVzdChoYW5kbGVyLCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJTdWJzY3JpcHRpb25cIjpcblx0XHRcdHRoaXMuX2hhbmRsZVN1YnNjcmlwdGlvbihoYW5kbGVyLCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX29uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5fY2xlYXJNZXNzYWdlcygnUGVlckRpc2Nvbm5lY3RlZCcpO1xuXHR0aGlzLl9jbGVhclBlZXJzKCk7XG5cblx0TG9nZ2VyLmxvZygnZDE6IGNvbm5lY3Rpb24gbG9zdCwgdHJ5IHJlY29ubmVjdGluZycpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0dGhhdC5jb25uZWN0KHRoYXQuX2FkZHIsIHRoYXQuX1dTb2NrZXQpLmNhdGNoKGZ1bmN0aW9uKGVycil7fSk7XG5cdH0sIHRoYXQuX3JlY29ubmVjdFRpbWVvdXQpO1xuXG5cdHRoaXMuZW1pdCgnY2xvc2UnLCB0aGlzLl9hZGRyKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLyBQcm90b2NvbCBldmVudCBoYW5kbGVycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVJbnRlcm5hbE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0c3dpdGNoKG1lc3NhZ2UudHlwZSl7XG5cdFx0Y2FzZSBcIlBlZXJDb25uZWN0ZWRcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVBlZXJDb25uZWN0ZWQobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiUGVlckRpc2Nvbm5lY3RlZFwiOlxuXHRcdFx0dGhpcy5faGFuZGxlUGVlckRpc2Nvbm5lY3RlZChtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJIYW5kc2hha2VcIjpcblx0XHRcdHRoaXMuX2hhbmRsZUhhbmRzaGFrZShtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJQaW5nXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVQaW5nKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGluZyA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRtZXNzYWdlLnR5cGUgPSBcIlBvbmdcIjtcblx0dGhpcy5fbGFzdFBpbmcgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0dGhpcy5fc2VuZChtZXNzYWdlKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlSGFuZHNoYWtlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cblx0aWYobWVzc2FnZS5wZWVycyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBtZXNzYWdlLnNlbGYgIT09ICdzdHJpbmcnKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgSGFuZHNoYWtlIG1lc3NhZ2UsIGRyb3BwaW5nLi4uXCIpO1xuXHRcdHJldHVybiA7XG5cdH1cblxuXG5cdHRoaXMuX3NlbGYgPSBtZXNzYWdlLnNlbGY7XG5cblx0Zm9yKHZhciBpPTA7aTxtZXNzYWdlLnBlZXJzLmxlbmd0aDsgaSsrKXtcblx0XHR0aGlzLl9wZWVycy5wdXNoKG1lc3NhZ2UucGVlcnNbaV0pO1xuXHRcdHRoaXMuZW1pdCgncGVlci1jb25uZWN0ZWQnLCBtZXNzYWdlLnBlZXJzW2ldKTtcblx0fVxuXG5cdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5yZXNvbHZlKHRoaXMuc2VsZigpKTtcblx0dGhpcy5lbWl0KCdvcGVuJywgdGhpcy5fYWRkcik7XG5cdHRoaXMuX3N0YXR1cyA9ICdvcGVuZWQnO1xuXHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVQZWVyQ29ubmVjdGVkID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdGlmKG1lc3NhZ2UucGVlcklkID09PSB1bmRlZmluZWQpe1xuXHRcdExvZ2dlci5lcnJvcihcIk1pc3NpbmcgYXJndW1lbnRzIGZvciBQZWVyQ29ubmVjdGVkIG1lc3NhZ2UsIGRyb3BwaW5nLi4uXCIpO1xuXHRcdHJldHVybiA7XG5cdH1cblxuXHQvL0FkZCBwZWVyIHRvIHRoZSBsaXN0IG9mIHJlYWNoYWJsZSBwZWVyc1xuXHR0aGlzLl9wZWVycy5wdXNoKG1lc3NhZ2UucGVlcklkKTtcblxuXHR0aGlzLmVtaXQoJ3BlZXItY29ubmVjdGVkJywgbWVzc2FnZS5wZWVySWQpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVQZWVyRGlzY29ubmVjdGVkID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdGlmKG1lc3NhZ2UucGVlcklkID09PSB1bmRlZmluZWQpe1xuXHRcdExvZ2dlci5lcnJvcihcIk1pc3NpbmcgYXJndW1lbnRzIGZvciBQZWVyRGlzY29ubmVjdGVkIE1lc3NhZ2UsIGRyb3BwaW5nLi4uXCIpO1xuXHRcdHJldHVybiA7XG5cdH1cblxuXHQvL0dvIHRocm91Z2ggYWxsIHBlbmRpbmcgbWVzc2FnZXMgYW5kIG5vdGlmeSB0aGUgb25lcyB0aGF0IGFyZSB0YXJnZXRlZFxuXHQvL2F0IHRoZSBkaXNjb25uZWN0ZWQgcGVlciB0aGF0IGl0IGRpc2Nvbm5lY3RlZCBhbmQgdGhlcmVmb3JlIHRoZSBjb21tYW5kXG5cdC8vY2Fubm90IGJlIGZ1bGZpbGxlZFxuXHRmb3IodmFyIG1lc3NhZ2VJZCBpbiB0aGlzLl9wZW5kaW5nTWVzc2FnZXMpe1xuXHRcdHZhciBoYW5kbGVyID0gdGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIobWVzc2FnZUlkKTtcblx0XHRpZihoYW5kbGVyICYmIGhhbmRsZXIudGFyZ2V0ID09PSBtZXNzYWdlLnBlZXJJZCkge1xuXHRcdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlSWQpO1xuXHRcdFx0dGhpcy5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgJ1BlZXJEaXNjb25uZWN0ZWQnLCBudWxsKTtcblx0XHR9XG5cdH1cblxuXHQvL1JlbW92ZSBwZWVyIGZyb20gbGlzdCBvZiByZWFjaGFibGUgcGVlcnNcblx0Zm9yKHZhciBpPXRoaXMuX3BlZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcblx0XHRpZih0aGlzLl9wZWVyc1tpXSA9PT0gbWVzc2FnZS5wZWVySWQpe1xuXHRcdFx0dGhpcy5fcGVlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dGhpcy5lbWl0KCdwZWVyLWRpc2Nvbm5lY3RlZCcsIG1lc3NhZ2UucGVlcklkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUmVxdWVzdCA9IGZ1bmN0aW9uKGhhbmRsZXIsIG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnR5cGUgPT09ICdQYXJ0aWFsQW5zd2VyJykge1xuXHRcdGlmKHR5cGVvZiB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZS5pZF0uY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dmFyIGVycm9yID0gbWVzc2FnZS5lcnJvciA/IG1lc3NhZ2UuZXJyb3IgOiBudWxsO1xuXHRcdFx0dmFyIGRhdGEgPSBtZXNzYWdlLmRhdGEgPyBtZXNzYWdlLmRhdGEgOiBudWxsO1xuXHRcdFx0dGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwoZXJyb3IsIGRhdGEpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsIG1lc3NhZ2UuZXJyb3IsIG1lc3NhZ2UuZGF0YSk7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24oaGFuZGxlciwgbWVzc2FnZSl7XG5cdC8vcmVtb3ZlIHN1YnNjcmlwdGlvbiBpZiBpdCB3YXMgY2xvc2VkIGZyb20gbm9kZVxuXHRpZihtZXNzYWdlLnJlc3VsdCA9PT0gXCJjbG9zZWRcIikge1xuXHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0bWVzc2FnZS5lcnJvciA9ICdTdWJzY3JpcHRpb25DbG9zZWQnO1xuXHR9XG5cdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsIG1lc3NhZ2UuZXJyb3IsIG1lc3NhZ2UuZGF0YSA/IG1lc3NhZ2UuZGF0YSA6IG51bGwpO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBTb2NrZXRIYW5kbGVyIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIFNvY2tldEhhbmRsZXIoV1NvY2tldCwgYWRkciwgdGltZW91dCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuYWRkciA9IGFkZHI7XG5cblx0aWYoV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IFdTb2NrZXQ7XG5cdGVsc2UgaWYoIXRoaXMuX1dTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0O1xuXHRXU29ja2V0ID0gdGhpcy5fV1NvY2tldDtcblxuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmluZyc7XG5cblx0XHR0cnkge1xuXHRcdFx0dGhpcy5fc29ja2V0ID0gYWRkci5pbmRleE9mKFwid3NzOi8vXCIpPT09MCA/IG5ldyBXU29ja2V0KGFkZHIsIHVuZGVmaW5lZCwge3JlamVjdFVuYXV0aG9yaXplZDpmYWxzZX0pIDogbmV3IFdTb2NrZXQoYWRkcik7XG5cblx0XHR0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2sgPSB0aGlzLl9vbm9wZW4uYmluZCh0aGlzKTtcblx0XHR0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrID0gdGhpcy5fb25jbG9zZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayA9IHRoaXMuX29ubWVzc2FnZS5iaW5kKHRoaXMpO1xuXG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCB0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2spO1xuXHRcdHRoaXMuX3NvY2tldC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsdGhpcy5fc29ja2V0Q2xvc2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLl9zb2NrZXRNZXNzYWdlQ2FsbGJhY2spO1xuXG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oZXJyKXtcblx0XHRcdExvZ2dlci5lcnJvcihcIltXU10gZXJyb3IgOiBcIitKU09OLnN0cmluZ2lmeShlcnIpKTtcblx0XHRcdHRoYXQuX3NvY2tldC5jbG9zZSgpO1xuXHRcdH0pO1xuXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0aWYodGhhdC5fc3RhdHVzID09PSAnb3BlbmVkJykgcmV0dXJuO1xuXHRcdFx0aWYodGhhdC5fc3RhdHVzICE9PSAnY2xvc2VkJyl7XG5cdFx0XHRcdExvZ2dlci5sb2coJ2QxOiAnICsgdGhhdC5hZGRyICsgJyB0aW1lZCBvdXQgd2hpbGUgY29ubmVjdGluZycpO1xuXHRcdFx0XHR0aGF0LmNsb3NlKCk7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZW91dCcsIHRoYXQuX3NvY2tldCk7XG5cdFx0XHR9XG5cdFx0fSwgdGltZW91dCk7XG5cblx0fSBjYXRjaChlKSB7XG5cdFx0TG9nZ2VyLmVycm9yKGUuc3RhY2spO1xuXHRcdHRoYXQuY2xvc2UoKTtcblx0XHR0aHJvdyBlO1xuXHR9XG59O1xuaW5oZXJpdHMoU29ja2V0SGFuZGxlciwgRXZlbnRFbWl0dGVyKTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0aWYodGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkICYmIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlKSByZXR1cm4gdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG5cdHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0dGhpcy5fc3RhdHVzID0gJ2Nsb3NpbmcnO1xuXHRpZih0aGlzLl9zb2NrZXQpIHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuXHRyZXR1cm4gdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHR0cnkge1xuXHRcdHZhciBkYXRhID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG5cdH0gY2F0Y2goZXJyKSB7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlcmlhbGl6ZSBtZXNzYWdlJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dHJ5IHtcblx0XHR0aGlzLl9zb2NrZXQuc2VuZChkYXRhKTtcblx0fSBjYXRjaChlcnIpe1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBzZW5kIG1lc3NhZ2UnKTtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9zb2NrZXQucmVhZHlTdGF0ZSA9PSB0aGlzLl9XU29ja2V0Lk9QRU4gJiYgdGhpcy5fc3RhdHVzID09PSAnb3BlbmVkJztcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbm9wZW4gPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fc3RhdHVzID0gJ29wZW5lZCc7XG5cdHRoaXMuZW1pdCgnb3BlbicsIHRoaXMuX3NvY2tldCk7XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2VkJztcblx0dGhpcy51bnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG5cdHRoaXMuZW1pdCgnY2xvc2UnLCB0aGlzLl9zb2NrZXQpO1xuXHRpZih0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5yZXNvbHZlKCk7XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25tZXNzYWdlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdHRyeSB7XG5cdFx0dmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2dC5kYXRhKTtcblx0XHR0aGlzLmVtaXQoJ21lc3NhZ2UnLCBtZXNzYWdlKTtcblx0fSBjYXRjaChlcnIpe1xuXHRcdExvZ2dlci5lcnJvcihcIltXU10gY2Fubm90IHBhcnNlIG1lc3NhZ2UsIGRyb3BwaW5nLi4uXCIpO1xuXHRcdHRocm93IGVycjtcblx0fVxufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUudW5yZWdpc3RlckNhbGxiYWNrcyA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykpe1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgdGhpcy5fc29ja2V0T3BlbkNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cdH0gZWxzZSBpZih0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlQWxsTGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSl7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycygpO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gVXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY3JlYXRlTWVzc2FnZSA9IGZ1bmN0aW9uKHBhcmFtcywgdHlwZSl7XG5cdGlmKCFwYXJhbXMgfHwgIXR5cGUgfHwgKHR5cGUgIT09IFwiUmVxdWVzdFwiICYmIHR5cGUgIT09IFwiU3Vic2NyaXB0aW9uXCIgJiYgdHlwZSAhPT0gXCJVbnN1YnNjcmliZVwiKSl7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IHR5cGUsXG5cdFx0aWQ6IHRoaXMuX2dlbmVyYXRlSWQoKSxcblx0XHRzZXJ2aWNlOiBwYXJhbXMuc2VydmljZSxcblx0XHR0YXJnZXQ6IHBhcmFtcy50YXJnZXQsXG5cdFx0ZnVuYzogcGFyYW1zLmZ1bmMsXG5cdFx0b2JqOiBwYXJhbXMub2JqLFxuXHRcdGRhdGE6IHBhcmFtcy5kYXRhXG5cdH07XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2dlbmVyYXRlSWQgPSBmdW5jdGlvbigpe1xuXHR2YXIgaWQgPSB0aGlzLl9uZXh0SWQ7XG5cdHRoaXMuX25leHRJZCsrO1xuXHRyZXR1cm4gaWQ7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBEaXlhTm9kZTtcbiIsInZhciBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKTtcbmlmKCFpc0Jyb3dzZXIpIHsgdmFyIFEgPSByZXF1aXJlKCdxJyk7IH1cbmVsc2UgeyB2YXIgUSA9IHdpbmRvdy5ROyB9XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG52YXIgRGl5YU5vZGUgPSByZXF1aXJlKCcuL0RpeWFOb2RlJyk7XG5cbnZhciBjb25uZWN0aW9uID0gbmV3IERpeWFOb2RlKCk7XG52YXIgY29ubmVjdGlvbkV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbnZhciBfdXNlciA9IG51bGw7XG52YXIgX3Bhc3MgPSBudWxsO1xudmFyIF9hdXRoZW50aWNhdGVkID0gZmFsc2U7XG5cblxuLy8vLy8vLy8vLy8vLy9cbi8vICBEMSBBUEkgIC8vXG4vLy8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIGQxKHNlbGVjdG9yKXtcblx0cmV0dXJuIG5ldyBEaXlhU2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5kMS5EaXlhTm9kZSA9IERpeWFOb2RlO1xuZDEuRGl5YVNlbGVjdG9yID0gRGl5YVNlbGVjdG9yO1xuXG5kMS5jb25uZWN0ID0gZnVuY3Rpb24oYWRkciwgV1NvY2tldCl7XG5cdHJldHVybiBjb25uZWN0aW9uLmNvbm5lY3QoYWRkciwgV1NvY2tldCk7XG59O1xuXG5kMS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIGNvbm5lY3Rpb24uZGlzY29ubmVjdCgpO1xufTtcblxuZDEuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpIHtcdHJldHVybiBjb25uZWN0aW9uLmlzQ29ubmVjdGVkKCk7fTtcbmQxLnBlZXJzID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLnBlZXJzKCk7fTtcbmQxLnNlbGYgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24uc2VsZigpOyB9O1xuZDEuYWRkciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5hZGRyKCk7IH07XG5kMS51c2VyID0gZnVuY3Rpb24oKSB7IHJldHVybiBfdXNlcjsgfTtcbmQxLnBhc3MgPSBmdW5jdGlvbigpIHsgcmV0dXJuIF9wYXNzOyB9O1xuZDEuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7IHJldHVybiBfYXV0aGVudGljYXRlZDsgfVxuXG5cbi8qKiBUcnkgdG8gY29ubmVjdCB0byB0aGUgZ2l2ZW4gc2VydmVycyBsaXN0IGluIHRoZSBsaXN0IG9yZGVyLCB1bnRpbCBmaW5kaW5nIGFuIGF2YWlsYWJsZSBvbmUgKi9cbmQxLnRyeUNvbm5lY3QgPSBmdW5jdGlvbihzZXJ2ZXJzLCBXU29ja2V0KXtcblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRmdW5jdGlvbiB0YyhpKSB7XG5cdFx0ZDEuY29ubmVjdChzZXJ2ZXJzW2ldLCBXU29ja2V0KS50aGVuKGZ1bmN0aW9uKGUpe1xuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnJlc29sdmUoc2VydmVyc1tpXSk7XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZSl7XG5cdFx0XHRkMS5kaXNjb25uZWN0KCkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0aSsrO1xuXHRcdFx0XHRpZihpPHNlcnZlcnMubGVuZ3RoKSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge3RjKGkpO30sIDEwMCk7XG5cdFx0XHRcdGVsc2UgcmV0dXJuIGRlZmVycmVkLnJlamVjdChcIlRpbWVvdXRcIik7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXHR0YygwKTtcblx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmQxLmN1cnJlbnRTZXJ2ZXIgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gY29ubmVjdGlvbi5fYWRkcjtcbn07XG5cbmQxLm9uID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKXtcblx0Y29ubmVjdGlvbi5vbihldmVudCwgY2FsbGJhY2spO1xuXHRyZXR1cm4gZDE7XG59O1xuXG5kMS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjayl7XG5cdGNvbm5lY3Rpb24ucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTtcblx0cmV0dXJuIGQxO1xufTtcblxuLyoqIFNob3J0aGFuZCBmdW5jdGlvbiB0byBjb25uZWN0IGFuZCBsb2dpbiB3aXRoIHRoZSBnaXZlbiAodXNlcixwYXNzd29yZCkgKi9cbmQxLmNvbm5lY3RBc1VzZXIgPSBmdW5jdGlvbihpcCwgdXNlciwgcGFzc3dvcmQsIFdTb2NrZXQpIHtcblx0cmV0dXJuIGQxLmNvbm5lY3QoaXAsIFdTb2NrZXQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gZDEoXCIjc2VsZlwiKS5hdXRoKHVzZXIsIHBhc3N3b3JkKTtcblx0fSk7XG59O1xuXG5kMS5kZWF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uKCl7IF9hdXRoZW50aWNhdGVkID0gZmFsc2U7IF91c2VyID0gbnVsbDsgX3Bhc3MgPSBudWxsO307XG5kMS5zZXRTZWN1cmVkID0gZnVuY3Rpb24oYlNlY3VyZWQpIHsgY29ubmVjdGlvbi5zZXRTZWN1cmVkKGJTZWN1cmVkKTsgfTtcbmQxLmlzU2VjdXJlZCA9IGZ1bmN0aW9uKCkge3JldHVybiBjb25uZWN0aW9uLl9zZWN1cmVkOyB9XG5kMS5zZXRXU29ja2V0ID0gZnVuY3Rpb24oV1NvY2tldCkgeyBjb25uZWN0aW9uLnNldFdTb2NrZXQoV1NvY2tldCk7IH1cblxuXG4vKiogU2VsZi1hdXRoZW50aWNhdGUgdGhlIGxvY2FsIERpeWFOb2RlIGJvdW5kIHRvIHBvcnQgPHBvcnQ+LCB1c2luZyBpdHMgUlNBIHNpZ25hdHVyZSAqL1xuZDEuc2VsZkNvbm5lY3QgPSBmdW5jdGlvbihwb3J0LCBzaWduYXR1cmUsIFdTb2NrZXQpIHtcblx0cmV0dXJuIGQxLmNvbm5lY3QoJ3dzOi8vbG9jYWxob3N0OicgKyBwb3J0LCBXU29ja2V0KVxuXHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRcdFx0ZDEoXCIjc2VsZlwiKS5yZXF1ZXN0KHtcblx0XHRcdFx0c2VydmljZTogJ3BlZXJBdXRoJyxcblx0XHRcdFx0ZnVuYzogJ1NlbGZBdXRoZW50aWNhdGUnLFxuXHRcdFx0XHRkYXRhOiB7XHRzaWduYXR1cmU6IHNpZ25hdHVyZSB9XG5cdFx0XHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cdFx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0XHRpZihkYXRhICYmIGRhdGEuYXV0aGVudGljYXRlZCl7XG5cdFx0XHRcdFx0X2F1dGhlbnRpY2F0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdF91c2VyID0gXCIjRGl5YU5vZGUjXCIrcGVlcklkO1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfYXV0aGVudGljYXRlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdCgnQWNjZXNzRGVuaWVkJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdH0pO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBEaXlhU2VsZWN0b3IgLy9cbi8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBEaXlhU2VsZWN0b3Ioc2VsZWN0b3Ipe1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuXHR0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLl9saXN0ZW5lckNvdW50ID0gMDtcblx0dGhpcy5fbGlzdGVuQ2FsbGJhY2sgPSBudWxsO1xuXHR0aGlzLl9jYWxsYmFja0F0dGFjaGVkID0gZmFsc2U7XG59XG5pbmhlcml0cyhEaXlhU2VsZWN0b3IsIEV2ZW50RW1pdHRlcik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBQdWJsaWMgQVBJIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnNlbGVjdCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fc2VsZWN0KCk7IH07XG5cblxuXG4vKipcbiAqIEFwcGx5IGNhbGxiYWNrIGNiIHRvIGVhY2ggc2VsZWN0ZWQgcGVlci4gUGVlcnMgYXJlIHNlbGVjdGVkXG4gKiBhY2NvcmRpbmcgdG8gdGhlIHJ1bGUgJ3NlbGVjdG9yJyBnaXZlbiB0byBjb25zdHJ1Y3Rvci4gU2VsZWN0b3IgY2FuXG4gKiBiZSBhIHBlZXJJZCwgYSByZWdFeCBmb3IgcGVlcklkcyBvZiBhbiBhcnJheSBvZiBwZWVySWRzLlxuICogQHBhcmFtcyBcdGNiXHRcdGNhbGxiYWNrIHRvIGJlIGFwcGxpZWRcbiAqIEByZXR1cm4gXHR0aGlzIFx0PERpeWFTZWxlY3Rvcj5cbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24oY2Ipe1xuXHR2YXIgcGVlcnMgPSB0aGlzLl9zZWxlY3QoKTtcblx0Zm9yKHZhciBpPTA7IGk8cGVlcnMubGVuZ3RoOyBpKyspIGNiLmJpbmQodGhpcykocGVlcnNbaV0pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCByZXF1ZXN0IHRvIHNlbGVjdGVkIHBlZXJzICggc2VlIGVhY2goKSApIHRocm91Z2ggdGhlIGN1cnJlbnQgY29ubmVjdGlvbiAoRGl5YU5vZGUpLlxuICogQHBhcmFtIHtTdHJpbmcgfCBPYmplY3R9IHBhcmFtcyA6IGNhbiBiZSBzZXJ2aWNlLmZ1bmN0aW9uIG9yIHtzZXJ2aWNlOnNlcnZpY2UsIGZ1bmM6ZnVuY3Rpb24sIC4uLn1cbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgdGltZW91dCwgb3B0aW9ucyl7XG5cdGlmKCFjb25uZWN0aW9uKSByZXR1cm4gdGhpcztcblx0aWYoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblx0aWYocGFyYW1zLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcblx0XHR2YXIgX3BhcmFtcyA9IHBhcmFtcy5zcGxpdChcIi5cIik7XG5cdFx0aWYoX3BhcmFtcy5sZW5ndGghPTIpIHRocm93ICdNYWxmb3JtZWRSZXF1ZXN0Jztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0dmFyIG5iQW5zd2VycyA9IDA7XG5cdHZhciBuYkV4cGVjdGVkID0gdGhpcy5fc2VsZWN0KCkubGVuZ3RoO1xuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKHBlZXJJZCl7XG5cdFx0cGFyYW1zLnRhcmdldCA9IHBlZXJJZDtcblxuXHRcdHZhciBvcHRzID0ge307XG5cdFx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIG9wdHNbaV0gPSBvcHRpb25zW2ldO1xuXHRcdGlmKHR5cGVvZiBvcHRzLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIG9wdHMuY2FsbGJhY2tfcGFydGlhbCA9IGZ1bmN0aW9uKGVyciwgZGF0YSl7IG9wdGlvbnMuY2FsbGJhY2tfcGFydGlhbChwZWVySWQsIGVyciwgZGF0YSk7fVxuXG5cdFx0Y29ubmVjdGlvbi5yZXF1ZXN0KHBhcmFtcywgZnVuY3Rpb24oZXJyLCBkYXRhKXtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpO1xuXHRcdFx0bmJBbnN3ZXJzKys7XG5cdFx0XHRpZihuYkFuc3dlcnMgPT0gbmJFeHBlY3RlZCAmJiBvcHRpb25zLmJOb3RpZnlXaGVuRmluaXNoZWQpIGNhbGxiYWNrKG51bGwsIGVyciwgXCIjI0VORCMjXCIpOyAvLyBUT0RPIDogRmluZCBhIGJldHRlciB3YXkgdG8gbm90aWZ5IHJlcXVlc3QgRU5EICEhXG5cdFx0fSwgdGltZW91dCwgb3B0cyk7XG5cdH0pO1xufTtcblxuXG4vLyBJTVBPUlRBTlQgISEhIEJ5IDMwLzExLzE1LCB0aGlzIG1ldGhvZCBkb2Vzbid0IHJldHVybiAndGhpcycgYW55bW9yZSwgYnV0IGEgU3Vic2NyaXB0aW9uIG9iamVjdCBpbnN0ZWFkXG4vKiBAcGFyYW0ge1N0cmluZyB8IE9iamVjdH0gcGFyYW1zIDogY2FuIGJlICdzZXJ2aWNlLmZ1bmN0aW9uJyBvciB7c2VydmljZTpzZXJ2aWNlLCBmdW5jOmZ1bmN0aW9uLCAuLi59ICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpe1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFN1YnNjcmlwdGlvbic7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdHJldHVybiBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpO1xufTtcblxuXG4vLyBJTVBPUlRBTlQgISEhIEJZIDMwLzExLzE1LCB0aGlzIG1ldGhvZCBkb2Vzbid0IHRha2Ugc3ViSWRzIGFzIGlucHV0IGFueW1vcmUuXG4vLyBQbGVhc2UgcHJvdmlkZSBhIHN1YnNjcmlwdGlvbiBpbnN0ZWFkICFcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24pe1xuXHRpZihBcnJheS5pc0FycmF5KHN1YnNjcmlwdGlvbikgfHwgIXN1YnNjcmlwdGlvbi5jbG9zZSkgcmV0dXJuIHRoaXMuX19vbGRfZGVwcmVjYXRlZF91bnN1YnNjcmliZShzdWJzY3JpcHRpb24pO1xuXHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG59O1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzd29yZCwgY2FsbGJhY2ssIHRpbWVvdXQpe1xuXHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGlzKTtcblxuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cblx0dGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAnYXV0aCcsXG5cdFx0ZnVuYzogJ0F1dGhlbnRpY2F0ZScsXG5cdFx0ZGF0YToge1xuXHRcdFx0dXNlcjogdXNlcixcblx0XHRcdHBhc3N3b3JkOiBwYXNzd29yZFxuXHRcdH1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXG5cdFx0aWYoZXJyID09PSAnU2VydmljZU5vdEZvdW5kJyl7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHRpZighZXJyICYmIGRhdGEgJiYgZGF0YS5hdXRoZW50aWNhdGVkKXtcblx0XHRcdF9hdXRoZW50aWNhdGVkID0gdHJ1ZTtcblx0XHRcdF91c2VyID0gdXNlcjtcblx0XHRcdF9wYXNzID0gcGFzc3dvcmQ7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlc29sdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2F1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdCgnQWNjZXNzRGVuaWVkJyk7XG5cdFx0fVxuXG5cdH0sIHRpbWVvdXQpO1xuXG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuXG5cbi8vIFByaXZhdGVzXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3NlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdG9yRnVuY3Rpb24pe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0aWYoIWNvbm5lY3Rpb24pIHJldHVybiBbXTtcblx0cmV0dXJuIGNvbm5lY3Rpb24ucGVlcnMoKS5maWx0ZXIoZnVuY3Rpb24ocGVlcklkKXtcblx0XHRyZXR1cm4gbWF0Y2godGhhdC5fc2VsZWN0b3IsIHBlZXJJZCk7XG5cdH0pO1xufTtcblxuZnVuY3Rpb24gbWF0Y2goc2VsZWN0b3IsIHN0cil7XG5cdGlmKCFzZWxlY3RvcikgcmV0dXJuIGZhbHNlO1xuXHRpZihzZWxlY3RvciA9PT0gXCIjc2VsZlwiKSByZXR1cm4gY29ubmVjdGlvbiAmJiBzdHI9PT1jb25uZWN0aW9uLnNlbGYoKTtcblx0ZWxzZSBpZihzZWxlY3Rvci5ub3QpIHJldHVybiAhbWF0Y2goc2VsZWN0b3Iubm90LCBzdHIpO1xuXHRlbHNlIGlmKHNlbGVjdG9yLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTdHJpbmcnKXtcblx0XHRyZXR1cm4gbWF0Y2hTdHJpbmcoc2VsZWN0b3IsIHN0cik7XG5cdH0gZWxzZSBpZihzZWxlY3Rvci5jb25zdHJ1Y3Rvci5uYW1lID09PSAnUmVnRXhwJyl7XG5cdFx0cmV0dXJuIG1hdGNoUmVnRXhwKHNlbGVjdG9yLCBzdHIpO1xuXHR9IGVsc2UgaWYoQXJyYXkuaXNBcnJheShzZWxlY3Rvcikpe1xuXHRcdHJldHVybiBtYXRjaEFycmF5KHNlbGVjdG9yLCBzdHIpO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hTdHJpbmcoc2VsZWN0b3IsIHN0cil7XG5cdHJldHVybiBzZWxlY3RvciA9PT0gc3RyO1xufVxuXG5mdW5jdGlvbiBtYXRjaFJlZ0V4cChzZWxlY3Rvciwgc3RyKXtcblx0cmV0dXJuIHN0ci5tYXRjaChzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIG1hdGNoQXJyYXkoc2VsZWN0b3IsIHN0cil7XG5cdGZvcih2YXIgaT0wO2k8c2VsZWN0b3IubGVuZ3RoOyBpKyspe1xuXHRcdGlmKHNlbGVjdG9yW2ldID09PSBzdHIpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuLy8gT3ZlcnJpZGVzIEV2ZW50RW1pdHRlcidzIGJlaGF2aW9yIHRvIHByb3h5IGFuZCBmaWx0ZXIgZXZlbnRzIGZyb20gdGhlIGNvbm5lY3Rpb25cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX29uID0gRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5vbjtcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUub24gPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjayl7XG5cdGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlciA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHRcdGlmKG1hdGNoKHRoaXMuX3NlbGVjdG9yLCBwZWVySWQpKSB0aGlzLmVtaXQodHlwZSwgcGVlcklkKTtcblx0fTtcblx0Y29ubmVjdGlvbi5vbih0eXBlLCBjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpO1xuXHR2YXIgcmV0ID0gdGhpcy5fb24odHlwZSwgY2FsbGJhY2spO1xuXG5cdC8vIEhhbmRsZSB0aGUgc3BlY2lmaWMgY2FzZSBvZiBcInBlZXItY29ubmVjdGVkXCIgZXZlbnRzLCBpLmUuLCBub3RpZnkgb2YgYWxyZWFkeSBjb25uZWN0ZWQgcGVlcnNcblx0aWYodHlwZSA9PT0gJ3BlZXItY29ubmVjdGVkJyAmJiBjb25uZWN0aW9uLmlzQ29ubmVjdGVkKCkpIHtcblx0XHR2YXIgcGVlcnMgPSBjb25uZWN0aW9uLnBlZXJzKCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxwZWVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYobWF0Y2godGhpcy5fc2VsZWN0b3IsIHBlZXJzW2ldKSkgY2FsbGJhY2socGVlcnNbaV0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmV0O1xufTtcblxuXG4vLyBPdmVycmlkZXMgRXZlbnRFbWl0dGVyJ3MgYmVoYXZpb3IgdG8gcHJveHkgYW5kIGZpbHRlciBldmVudHMgZnJvbSB0aGUgY29ubmVjdGlvblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fcmVtb3ZlTGlzdGVuZXIgPSBEaXlhU2VsZWN0b3IucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKSB7XG5cdGlmKGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlcikgY29ubmVjdGlvbi5yZW1vdmVMaXN0ZW5lcih0eXBlLCBjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpO1xuXHR0aGlzLl9yZW1vdmVMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBTVUJTQ1JJUFRJT04gLy9cbi8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8qKlxuKiBIYW5kbGVzIGEgc3Vic2NyaXB0aW9uIHRvIHNvbWUgRGl5YU5vZGUgc2VydmljZSBmb3IgbXVsdGlwbGUgbm9kZXNcbiogYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBzZWxlY3RvclxuKi9cbmZ1bmN0aW9uIFN1YnNjcmlwdGlvbihzZWxlY3RvciwgcGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucykge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cdFx0dGhpcy5wYXJhbXMgPSBwYXJhbXM7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0dGhpcy5zdWJJZHMgPSBbXTtcblxuXHRcdHRoaXMuZG9TdWJzY3JpYmUgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0XHRcdHRoYXQuc3ViSWRzLnB1c2godGhhdC5fYWRkU3Vic2NyaXB0aW9uKHBlZXJJZCkpO1xuXHRcdFx0dGhhdC5zdGF0ZSA9IFwib3BlblwiO1xuXHRcdH07XG5cblx0XHRpZih0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmF1dG8pIHtcblx0XHRcdHRoaXMuc2VsZWN0b3Iub24oJ3BlZXItY29ubmVjdGVkJywgdGhpcy5kb1N1YnNjcmliZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2VsZWN0b3IuZWFjaCh0aGlzLmRvU3Vic2NyaWJlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcbn07XG5cblN1YnNjcmlwdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0Zm9yKHZhciBpID0gMDsgaTx0aGlzLnN1Yklkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbm5lY3Rpb24udW5zdWJzY3JpYmUodGhpcy5zdWJJZHNbaV0pO1xuXHR9XG5cdHRoaXMuc3ViSWRzID0gW107XG5cdHRoaXMuc2VsZWN0b3IucmVtb3ZlTGlzdGVuZXIoJ3BlZXItY29ubmVjdGVkJywgdGhpcy5kb1N1YnNjcmliZSk7XG5cdHRoaXMuc3RhdGUgPSBcImNsb3NlZFwiO1xufTtcblxuU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5fYWRkU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0cGFyYW1zID0ge307XG5cdGZvcih2YXIgayBpbiB0aGlzLnBhcmFtcykgcGFyYW1zW2tdID0gdGhpcy5wYXJhbXNba107XG5cdHBhcmFtcy50YXJnZXQgPSBwZWVySWQ7XG5cdHZhciBzdWJJZCA9IGNvbm5lY3Rpb24uc3Vic2NyaWJlKHBhcmFtcywgZnVuY3Rpb24oZXJyLCBkYXRhKXtcblx0XHR0aGF0LmNhbGxiYWNrKHBlZXJJZCwgZXJyLCBkYXRhKTtcblx0fSk7XG5cdGlmKHRoaXMub3B0aW9ucyAmJiBBcnJheS5pc0FycmF5KHRoaXMub3B0aW9ucy5zdWJJZHMpKVxuXHRcdHRoaXMub3B0aW9ucy5zdWJJZHNbcGVlcklkXSA9IHN1YklkO1xuXHRyZXR1cm4gc3ViSWQ7XG59O1xuXG5cblxuXG5cbi8vIExlZ2FjeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbi8qKiBAZGVwcmVjYXRlZCAgKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oKXt9O1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLl9fb2xkX2RlcHJlY2F0ZWRfdW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJJZHMpIHtcblx0dGhpcy5lYWNoKGZ1bmN0aW9uKHBlZXJJZCl7XG5cdFx0dmFyIHN1YklkID0gc3ViSWRzW3BlZXJJZF07XG5cdFx0aWYoc3ViSWQpIGNvbm5lY3Rpb24udW5zdWJzY3JpYmUoc3ViSWQpO1xuXHR9KTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGQxO1xuIiwidmFyIGQxID0gcmVxdWlyZSgnLi9EaXlhU2VsZWN0b3IuanMnKTtcblxuLy8gcmVxdWlyZSgnLi9zZXJ2aWNlcy90aW1lci90aW1lci5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9ydGMvcnRjLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvZXhwbG9yZXIvZXhwbG9yZXIuanMnKTtcbi8vcmVxdWlyZSgnLi9zZXJ2aWNlcy9waWNvL3BpY28uanMnKTtcbi8vcmVxdWlyZSgnLi9zZXJ2aWNlcy92aWV3ZXJfZXhwbG9yZXIvdmlld2VyX2V4cGxvcmVyLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL2llcS9pZXEuanMnKTtcbi8vcmVxdWlyZSgnLi9zZXJ2aWNlcy9uZXR3b3JrSWQvTmV0d29ya0lkLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL21hcHMvbWFwcy5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9wZWVyQXV0aC9QZWVyQXV0aC5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9tZXNoTmV0d29yay9NZXNoTmV0d29yay5qcycpO1xuLy9yZXF1aXJlKCcuL3NlcnZpY2VzL3ZlcmJvc2UvVmVyYm9zZS5qcycpO1xucmVxdWlyZSgnLi91dGlscy9lbmNvZGluZy9lbmNvZGluZy5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9zdGF0dXMvc3RhdHVzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZDE7XG4iLCIvKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuLyoqXG4gICBUb2RvIDpcbiAgIGNoZWNrIGVyciBmb3IgZWFjaCBkYXRhXG4gICBpbXByb3ZlIEFQSSA6IGdldERhdGEoc2Vuc29yTmFtZSwgZGF0YUNvbmZpZylcbiAgIHJldHVybiBhZGFwdGVkIHZlY3RvciBmb3IgZGlzcGxheSB3aXRoIEQzIHRvIHJlZHVjZSBjb2RlIGluIElITSA/XG4gICB1cGRhdGVEYXRhKHNlbnNvck5hbWUsIGRhdGFDb25maWcpXG4gICBzZXQgYW5kIGdldCBmb3IgdGhlIGRpZmZlcmVudCBkYXRhQ29uZmlnIHBhcmFtc1xuXG4qL1xuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cblxudmFyIE1lc3NhZ2UgPSByZXF1aXJlKCcuLi9tZXNzYWdlJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8gTG9nZ2luZyB1dGlsaXR5IG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgREVCVUcgPSB0cnVlO1xudmFyIExvZ2dlciA9IHtcblx0bG9nOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5sb2cobWVzc2FnZSk7XG5cdH0sXG5cblx0ZXJyb3I6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuXHR9XG59O1xuXG4vKipcbiAqXHRjYWxsYmFjayA6IGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBtb2RlbCB1cGRhdGVkXG4gKiAqL1xuZnVuY3Rpb24gSUVRKHNlbGVjdG9yKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cdHRoaXMuZGF0YU1vZGVsPXt9O1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcblxuXG5cdC8qKiogc3RydWN0dXJlIG9mIGRhdGEgY29uZmlnICoqKlxuXHRcdCBjcml0ZXJpYSA6XG5cdFx0ICAgdGltZTogYWxsIDMgdGltZSBjcml0ZXJpYSBzaG91bGQgbm90IGJlIGRlZmluZWQgYXQgdGhlIHNhbWUgdGltZS4gKHJhbmdlIHdvdWxkIGJlIGdpdmVuIHVwKVxuXHRcdCAgICAgYmVnOiB7W251bGxdLHRpbWV9IChudWxsIG1lYW5zIG1vc3QgcmVjZW50KSAvLyBzdG9yZWQgYSBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIGVuZDoge1tudWxsXSwgdGltZX0gKG51bGwgbWVhbnMgbW9zdCBvbGRlc3QpIC8vIHN0b3JlZCBhcyBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIHJhbmdlOiB7W251bGxdLCB0aW1lfSAocmFuZ2Ugb2YgdGltZShwb3NpdGl2ZSkgKSAvLyBpbiBzIChudW0pXG5cdFx0ICAgcm9ib3Q6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgICBwbGFjZToge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCBvcGVyYXRvcjoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfSAtKCBtYXliZSBtb3kgc2hvdWxkIGJlIGRlZmF1bHRcblx0XHQgLi4uXG5cblx0XHQgc2Vuc29ycyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTZW5zb3JOYW1lfVxuXG5cdFx0IHNhbXBsaW5nOiB7W251bGxdIG9yIGludH1cblx0Ki9cblx0dGhpcy5kYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7XG5cdFx0XHRcdGJlZzogbnVsbCxcblx0XHRcdFx0ZW5kOiBudWxsLFxuXHRcdFx0XHRyYW5nZTogbnVsbCAvLyBpbiBzXG5cdFx0XHR9LFxuXHRcdFx0cm9ib3Q6IG51bGwsXG5cdFx0XHRwbGFjZTogbnVsbFxuXHRcdH0sXG5cdFx0b3BlcmF0b3I6ICdsYXN0Jyxcblx0XHRzZW5zb3JzOiBudWxsLFxuXHRcdHNhbXBsaW5nOiBudWxsIC8vc2FtcGxpbmdcblx0fTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGRhdGFNb2RlbCA6XG4gKiB7XG4gKlx0XCJzZW5zZXVyWFhcIjoge1xuICpcdFx0XHRkYXRhOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0dGltZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJvYm90OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cGxhY2U6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRxdWFsaXR5SW5kZXg6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRyYW5nZTogW0ZMT0FULCBGTE9BVF0sXG4gKlx0XHRcdHVuaXQ6IHN0cmluZyxcbiAqXHRcdGxhYmVsOiBzdHJpbmdcbiAqXHRcdH0sXG4gKlx0IC4uLiAoXCJzZW5zZXVyc1lZXCIpXG4gKiB9XG4gKi9cbklFUS5wcm90b3R5cGUuZ2V0RGF0YU1vZGVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsO1xufTtcbklFUS5wcm90b3R5cGUuZ2V0RGF0YVJhbmdlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuZGF0YU1vZGVsLnJhbmdlO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YUNvbmZpZyBjb25maWcgZm9yIGRhdGEgcmVxdWVzdFxuICogaWYgZGF0YUNvbmZpZyBpcyBkZWZpbmUgOiBzZXQgYW5kIHJldHVybiB0aGlzXG4gKlx0IEByZXR1cm4ge0lFUX0gdGhpc1xuICogZWxzZVxuICpcdCBAcmV0dXJuIHtPYmplY3R9IGN1cnJlbnQgZGF0YUNvbmZpZ1xuICovXG5JRVEucHJvdG90eXBlLkRhdGFDb25maWcgPSBmdW5jdGlvbihuZXdEYXRhQ29uZmlnKXtcblx0aWYobmV3RGF0YUNvbmZpZykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZz1uZXdEYXRhQ29uZmlnO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnO1xufTtcbi8qKlxuICogVE8gQkUgSU1QTEVNRU5URUQgOiBvcGVyYXRvciBtYW5hZ2VtZW50IGluIEROLUlFUVxuICogQHBhcmFtICB7U3RyaW5nfVx0IG5ld09wZXJhdG9yIDoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfVxuICogQHJldHVybiB7SUVRfSB0aGlzIC0gY2hhaW5hYmxlXG4gKiBTZXQgb3BlcmF0b3IgY3JpdGVyaWEuXG4gKiBEZXBlbmRzIG9uIG5ld09wZXJhdG9yXG4gKlx0QHBhcmFtIHtTdHJpbmd9IG5ld09wZXJhdG9yXG4gKlx0QHJldHVybiB0aGlzXG4gKiBHZXQgb3BlcmF0b3IgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7U3RyaW5nfSBvcGVyYXRvclxuICovXG5JRVEucHJvdG90eXBlLkRhdGFPcGVyYXRvciA9IGZ1bmN0aW9uKG5ld09wZXJhdG9yKXtcblx0aWYobmV3T3BlcmF0b3IpIHtcblx0XHR0aGlzLmRhdGFDb25maWcub3BlcmF0b3IgPSBuZXdPcGVyYXRvcjtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvcjtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gbnVtU2FtcGxlc1xuICogQHBhcmFtIHtpbnR9IG51bWJlciBvZiBzYW1wbGVzIGluIGRhdGFNb2RlbFxuICogaWYgZGVmaW5lZCA6IHNldCBudW1iZXIgb2Ygc2FtcGxlc1xuICpcdEByZXR1cm4ge0lFUX0gdGhpc1xuICogZWxzZVxuICpcdEByZXR1cm4ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXNcbiAqKi9cbklFUS5wcm90b3R5cGUuRGF0YVNhbXBsaW5nID0gZnVuY3Rpb24obnVtU2FtcGxlcyl7XG5cdGlmKG51bVNhbXBsZXMpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuc2FtcGxpbmcgPSBudW1TYW1wbGVzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLnNhbXBsaW5nO1xufTtcbi8qKlxuICogU2V0IG9yIGdldCBkYXRhIHRpbWUgY3JpdGVyaWEgYmVnIGFuZCBlbmQuXG4gKiBJZiBwYXJhbSBkZWZpbmVkXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lQmVnIC8vIG1heSBiZSBudWxsXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lRW5kIC8vIG1heSBiZSBudWxsXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBJZiBubyBwYXJhbSBkZWZpbmVkOlxuICpcdEByZXR1cm4ge09iamVjdH0gVGltZSBvYmplY3Q6IGZpZWxkcyBiZWcgYW5kIGVuZC5cbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhVGltZSA9IGZ1bmN0aW9uKG5ld1RpbWVCZWcsbmV3VGltZUVuZCwgbmV3UmFuZ2Upe1xuXHRpZihuZXdUaW1lQmVnIHx8IG5ld1RpbWVFbmQgfHwgbmV3UmFuZ2UpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5iZWcgPSBuZXdUaW1lQmVnLmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5lbmQgPSBuZXdUaW1lRW5kLmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5yYW5nZSA9IG5ld1JhbmdlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4ge1xuXHRcdFx0YmVnOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5iZWcpLFxuXHRcdFx0ZW5kOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5lbmQpLFxuXHRcdFx0cmFuZ2U6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlKVxuXHRcdH07XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHJvYm90SWRzXG4gKiBTZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSByb2JvdElkcyBsaXN0IG9mIHJvYm90IElkc1xuICogR2V0IHJvYm90IGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YVJvYm90SWRzID0gZnVuY3Rpb24ocm9ib3RJZHMpe1xuXHRpZihyb2JvdElkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5yb2JvdCA9IHJvYm90SWRzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90O1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBwbGFjZUlkc1xuICogU2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEBwYXJhbSB7QXJyYXlbSW50XX0gcGxhY2VJZHMgbGlzdCBvZiBwbGFjZSBJZHNcbiAqIEdldCBwbGFjZSBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtBcnJheVtJbnRdfSBsaXN0IG9mIHBsYWNlIElkc1xuICovXG5JRVEucHJvdG90eXBlLkRhdGFQbGFjZUlkcyA9IGZ1bmN0aW9uKHBsYWNlSWRzKXtcblx0aWYocGxhY2VJZHMpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2VJZCA9IHBsYWNlSWRzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnBsYWNlO1xufTtcbi8qKlxuICogR2V0IGRhdGEgYnkgc2Vuc29yIG5hbWUuXG4gKlx0QHBhcmFtIHtBcnJheVtTdHJpbmddfSBzZW5zb3JOYW1lIGxpc3Qgb2Ygc2Vuc29yc1xuICovXG5JRVEucHJvdG90eXBlLmdldERhdGFCeU5hbWUgPSBmdW5jdGlvbihzZW5zb3JOYW1lcyl7XG5cdHZhciBkYXRhPVtdO1xuXHRmb3IodmFyIG4gaW4gc2Vuc29yTmFtZXMpIHtcblx0XHRkYXRhLnB1c2godGhpcy5kYXRhTW9kZWxbc2Vuc29yTmFtZXNbbl1dKTtcblx0fVxuXHRyZXR1cm4gZGF0YTtcbn07XG4vKipcbiAqIFVwZGF0ZSBkYXRhIGdpdmVuIGRhdGFDb25maWcuXG4gKiBAcGFyYW0ge2Z1bmN9IGNhbGxiYWNrIDogY2FsbGVkIGFmdGVyIHVwZGF0ZVxuICogVE9ETyBVU0UgUFJPTUlTRVxuICovXG5JRVEucHJvdG90eXBlLnVwZGF0ZURhdGEgPSBmdW5jdGlvbihjYWxsYmFjaywgZGF0YUNvbmZpZyl7XG5cdHZhciB0aGF0PXRoaXM7XG5cdGlmKGRhdGFDb25maWcpXG5cdFx0dGhpcy5EYXRhQ29uZmlnKGRhdGFDb25maWcpO1xuXHQvLyBjb25zb2xlLmxvZyhcIlJlcXVlc3Q6IFwiK0pTT04uc3RyaW5naWZ5KGRhdGFDb25maWcpKTtcblx0dGhpcy5zZWxlY3Rvci5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiBcImllcVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVJlcXVlc3RcIixcblx0XHRkYXRhOiB7XG5cdFx0XHR0eXBlOlwic3BsUmVxXCIsXG5cdFx0XHRkYXRhQ29uZmlnOiB0aGF0LmRhdGFDb25maWdcblx0XHR9XG5cdH0sIGZ1bmN0aW9uKGRuSWQsIGVyciwgZGF0YSl7XG5cdFx0aWYoZXJyKSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJbXCIrdGhhdC5kYXRhQ29uZmlnLnNlbnNvcnMrXCJdIFJlY3YgZXJyOiBcIitKU09OLnN0cmluZ2lmeShlcnIpKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYoZGF0YS5oZWFkZXIuZXJyb3IpIHtcblx0XHRcdC8vIFRPRE8gOiBjaGVjay91c2UgZXJyIHN0YXR1cyBhbmQgYWRhcHQgYmVoYXZpb3IgYWNjb3JkaW5nbHlcblx0XHRcdExvZ2dlci5lcnJvcihcIlVwZGF0ZURhdGE6XFxuXCIrSlNPTi5zdHJpbmdpZnkoZGF0YS5oZWFkZXIuZGF0YUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdHRoYXQuX2dldERhdGFNb2RlbEZyb21SZWN2KGRhdGEpO1xuXG5cdFx0Ly8gTG9nZ2VyLmxvZyh0aGF0LmdldERhdGFNb2RlbCgpKTtcblxuXHRcdGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGF0KTsgLy8gYmluZCBjYWxsYmFjayB3aXRoIElFUVxuXHRcdGNhbGxiYWNrKHRoYXQuZ2V0RGF0YU1vZGVsKCkpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xufTtcblxuSUVRLnByb3RvdHlwZS5faXNEYXRhTW9kZWxXaXRoTmFOID0gZnVuY3Rpb24oKSB7XG5cdHZhciBkYXRhTW9kZWxOYU49ZmFsc2U7XG5cdHZhciBzZW5zb3JOYW47XG5cdGZvcih2YXIgbiBpbiB0aGlzLmRhdGFNb2RlbCkge1xuXHRcdHNlbnNvck5hbiA9IHRoaXMuZGF0YU1vZGVsW25dLmRhdGEucmVkdWNlKGZ1bmN0aW9uKG5hblByZXMsZCkge1xuXHRcdFx0cmV0dXJuIG5hblByZXMgJiYgaXNOYU4oZCk7XG5cdFx0fSxmYWxzZSk7XG5cdFx0ZGF0YU1vZGVsTmFOID0gZGF0YU1vZGVsTmFOICYmIHNlbnNvck5hbjtcblx0XHRMb2dnZXIubG9nKG4rXCIgd2l0aCBuYW4gOiBcIitzZW5zb3JOYW4rXCIgKFwiK2RhdGFNb2RlbE5hTitcIikgLyBcIit0aGlzLmRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCk7XG5cdH1cbn07XG5cbklFUS5wcm90b3R5cGUuZ2V0Q29uZmluZW1lbnRMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmNvbmZpbmVtZW50O1xufTtcblxuSUVRLnByb3RvdHlwZS5nZXRBaXJRdWFsaXR5TGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5haXJRdWFsaXR5O1xufTtcblxuSUVRLnByb3RvdHlwZS5nZXRFbnZRdWFsaXR5TGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5lbnZRdWFsaXR5O1xufTtcblxuXG5cbi8qKlxuICogVXBkYXRlIGludGVybmFsIG1vZGVsIHdpdGggcmVjZWl2ZWQgZGF0YVxuICogQHBhcmFtICBkYXRhIHRvIGNvbmZpZ3VyZSBzdWJzY3JpcHRpb25cbiAqIEBwYXJhbSAgY2FsbGJhY2sgY2FsbGVkIG9uIGFuc3dlcnMgKEBwYXJhbSA6IGRhdGFNb2RlbClcbiAqL1xuSUVRLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHQvLyBjb25zb2xlLmxvZyhcIlJlcXVlc3Q6IFwiK0pTT04uc3RyaW5naWZ5KGRhdGFDb25maWcpKTtcblxuXHQvLy8gVE9ET1xuXHRkYXRhID0gZGF0YSB8fCB7dGltZVJhbmdlOiAnaG91cnMnfTtcblxuXHR2YXIgc3VicyA9IHRoaXMuc2VsZWN0b3Iuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiBcImllcVwiLFxuXHRcdGZ1bmM6IFwiRGF0YVwiLFxuXHRcdGRhdGE6IGRhdGFcblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIldhdGNoSUVRUmVjdkVycjpcIitKU09OLnN0cmluZ2lmeShlcnIpKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYoZGF0YS5oZWFkZXIuZXJyb3IpIHtcblx0XHRcdC8vIFRPRE8gOiBjaGVjay91c2UgZXJyIHN0YXR1cyBhbmQgYWRhcHQgYmVoYXZpb3IgYWNjb3JkaW5nbHlcblx0XHRcdExvZ2dlci5lcnJvcihcIldhdGNoSUVROlxcblwiK0pTT04uc3RyaW5naWZ5KGRhdGEuaGVhZGVyLmRhdGFDb25maWcpKTtcblx0XHRcdExvZ2dlci5lcnJvcihcIkRhdGEgcmVxdWVzdCBmYWlsZWQgKFwiK2RhdGEuaGVhZGVyLmVycm9yLnN0K1wiKTogXCIrZGF0YS5oZWFkZXIuZXJyb3IubXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XG5cdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHRjYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhhdCk7IC8vIGJpbmQgY2FsbGJhY2sgd2l0aCBJRVFcblx0XHRjYWxsYmFjayh0aGF0LmdldERhdGFNb2RlbCgpKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHR9KTtcblxuXHR0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChzdWJzKTtcbn07XG5cbi8qKlxuICogQ2xvc2UgYWxsIHN1YnNjcmlwdGlvbnNcbiAqL1xuSUVRLnByb3RvdHlwZS5jbG9zZVN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbigpe1xuXHRmb3IodmFyIGkgaW4gdGhpcy5zdWJzY3JpcHRpb25zKSB7XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zW2ldLmNsb3NlKCk7XG5cdH1cblx0dGhpcy5zdWJzY3JpcHRpb25zID1bXTtcbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cbklFUS5wcm90b3R5cGUuX2dldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9bnVsbDtcblxuXHRpZihkYXRhLmVyciAmJiBkYXRhLmVyci5zdD4wKSB7XG5cdFx0TG9nZ2VyLmVycm9yKGRhdGEuZXJyLm1zZyk7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0ZGVsZXRlIGRhdGEuZXJyO1xuXHRpZihkYXRhICYmIGRhdGEuaGVhZGVyKSB7XG5cdFx0Zm9yICh2YXIgbiBpbiBkYXRhKSB7XG5cdFx0XHRpZihuICE9IFwiaGVhZGVyXCIgJiYgbiAhPSBcImVyclwiKSB7XG5cblx0XHRcdFx0aWYoZGF0YVtuXS5lcnIgJiYgZGF0YVtuXS5lcnIuc3Q+MCkge1xuXHRcdFx0XHRcdExvZ2dlci5lcnJvcihuK1wiIHdhcyBpbiBlcnJvcjogXCIrZGF0YVtuXS5lcnIubXNnKTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCFkYXRhTW9kZWwpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsPXt9O1xuXG5cdFx0XHRcdC8vIExvZ2dlci5sb2cobik7XG5cdFx0XHRcdGlmKCFkYXRhTW9kZWxbbl0pIHtcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgYWJzb2x1dGUgcmFuZ2UgKi9cblx0XHRcdFx0ZGF0YU1vZGVsW25dLnJhbmdlPWRhdGFbbl0ucmFuZ2U7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS50aW1lUmFuZ2U9ZGF0YVtuXS50aW1lUmFuZ2U7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGxhYmVsICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5sYWJlbD1kYXRhW25dLmxhYmVsO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSB1bml0ICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS51bml0PWRhdGFbbl0udW5pdDtcblxuXHRcdFx0XHQvKiBzdWdnZXN0ZWQgeSBkaXNwbGF5IHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS56b29tUmFuZ2UgPSBbMCwgMTAwXTtcblxuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBpbmRleFJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5Q29uZmlnPXtcblx0XHRcdFx0XHQvKiBjb25mb3J0UmFuZ2U6IGRhdGFbbl0uY29uZm9ydFJhbmdlLCAqL1xuXHRcdFx0XHRcdGluZGV4UmFuZ2U6IGRhdGFbbl0uaW5kZXhSYW5nZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZSA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS50aW1lLCdiNjQnLDgpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IChkYXRhW25dLmRhdGE/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmRhdGEsJ2I2NCcsNCk6KGRhdGFbbl0uYXZnP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5hdmcuZCwnYjY0Jyw0KTpudWxsKSk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5SW5kZXggPSAoZGF0YVtuXS5kYXRhP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5pbmRleCwnYjY0Jyw0KTooZGF0YVtuXS5hdmc/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpOm51bGwpKTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnJvYm90SWQgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ucm9ib3RJZCwnYjY0Jyw0KTtcblx0XHRcdFx0aWYoZGF0YU1vZGVsW25dLnJvYm90SWQpIHtcblx0XHRcdFx0XHQvKiogZGljbyByb2JvdElkIC0+IHJvYm90TmFtZSAqKi9cblx0XHRcdFx0XHR2YXIgZGljb1JvYm90ID0ge307XG5cdFx0XHRcdFx0ZGF0YS5oZWFkZXIucm9ib3RzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcblx0XHRcdFx0XHRcdGRpY29Sb2JvdFtlbC5pZF09ZWwubmFtZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ucm9ib3RJZCA9IGRhdGFNb2RlbFtuXS5yb2JvdElkLm1hcChmdW5jdGlvbihlbCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGRpY29Sb2JvdFtlbF07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucGxhY2VJZCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5wbGFjZUlkLCdiNjQnLDQpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IG51bGw7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS55ID0gbnVsbDtcblxuXHRcdFx0XHRpZihkYXRhW25dLmF2Zylcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uYXZnID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5taW4pXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLm1pbiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ubWF4KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5tYXggPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLnN0ZGRldilcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uc3RkZGV2ID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5zdGRkZXYpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnN0ZGRldiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ueClcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS54LCdiNjQnLDQpO1xuXHRcdFx0XHRpZihkYXRhW25dLnkpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnkgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ueSwnYjY0Jyw0KTtcblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIGN1cnJlbnQgcXVhbGl0eSA6IHsnYidhZCwgJ20nZWRpdW0sICdnJ29vZH1cblx0XHRcdFx0ICogZXZvbHV0aW9uIDogeyd1J3AsICdkJ293biwgJ3MndGFibGV9XG5cdFx0XHRcdCAqIGV2b2x1dGlvbiBxdWFsaXR5IDogeydiJ2V0dGVyLCAndydvcnNlLCAncydhbWV9XG5cdFx0XHRcdCAqL1xuXHRcdFx0XHQvLy8gVE9ET1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udHJlbmQgPSAnbXNzJztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSB7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTm8gRGF0YSB0byByZWFkIG9yIGhlYWRlciBpcyBtaXNzaW5nICFcIik7XG5cdH1cblx0LyoqIGxpc3Qgcm9ib3RzICoqL1xuLy9cdGRhdGFNb2RlbC5yb2JvdHMgPSBbe25hbWU6ICdEMlIyJywgaWQ6MX1dO1xuXHR0aGlzLmRhdGFNb2RlbD1kYXRhTW9kZWw7XG5cdHJldHVybiBkYXRhTW9kZWw7XG59O1xuXG5cblxuXG5cbi8qKiBjcmVhdGUgSUVRIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLklFUSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgSUVRKHRoaXMpO1xufTtcbiIsIkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xuXG5mdW5jdGlvbiBMT0cobXNnKXtcblx0Ly9jb25zb2xlLmxvZyhtc2cpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIG1hcCB7U3RyaW5nfSBtYXAncyBuYW1lXG4gKi9cbmZ1bmN0aW9uIE1hcHMocGVlcklkcykge1xuXG5cblx0dGhpcy5fcGVlcklkcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocGVlcklkcykpO1xuXHR0aGlzLl9zdWJJZHMgPSB7fTsgLy8gbGlzdCBvZiBzdWJzY3JpcHRpb24gSWQgKGZvciB1bnN1YnNjcmlwdGlvbiBwdXJwb3NlKSBlLmcge3BlZXJJZDA6IHN1YklkMCwgLi4ufVxuXG5cdC8vIGxpc3Qgb2YgcmVnaXN0ZXJlZCBwbGFjZSBieSBEaXlhXG5cdHRoaXMuX2RpeWFzID0ge307XG5cblx0Ly8gZ2V0IGEgbGlzdCBvZiBEaXlhIGZyb20gc2VsZWN0b3IgYW5kIHNvcnQgaXRcblx0dGhpcy5saXN0RGl5YSA9IHRoaXMuX3BlZXJJZHM7XG59XG5pbmhlcml0cyhNYXBzLCBFdmVudEVtaXR0ZXIpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLyBTdGF0aWMgZnVuY3Rpb25zIC8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4gKiBzdGF0aWMgZnVuY3Rpb24sIGdldCBjdXJyZW50IHBsYWNlIGZyb20gZGl5YW5vZGVcbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3Ige1JlZ0V4cC9TdHJpbmcvQXJyYXk8U3RyaW5nPn0gc2VsZWN0b3Igb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKiBAcGFyYW0gbWFwIHtTdHJpbmd9IG1hcCdzIG5hbWVcbiAqIEBwYXJhbSBmdW5jIHtmdW5jdGlvbigpfSBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIHJldHVybiBwZWVySWQsIGVycm9yIGFuZCBkYXRhICh7IG1hcElkLCBsYWJlbCwgbmV1cm9uSWQsICB4LCB5fSlcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5nZXRDdXJyZW50UGxhY2UgPSBmdW5jdGlvbiggcGVlcklkLCBmdW5jKSB7XG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdGZ1bmM6ICdHZXRDdXJyZW50UGxhY2UnLFxuXHRcdG9iajogWyBwZWVySWQgXVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdGZ1bmMocGVlcklkLCBlcnIsIGRhdGEpO1xuXHR9KTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vXG4vLy8vIEludGVybmFsIGZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy9cblxuLyoqXG4gKiByb3VuZCBmbG9hdCB0byBzaXggZGVjaW1hbHMgdG8gY29tcGFyZSwgYXMgdGhlIG51bWJlciBpbiBqcyBpcyBlbmNvZGVkIGluXG4gKiBJRUVFIDc1NCBzdGFuZGFyZCB+IGFyb3VuZCAxNiBkZWNpbWFsIGRpZ2l0cyBwcmVjaXNpb24sIHdlIGxpbWl0IHRvIDYgZm9yXG4gKiBlYXNpZXIgY29tcGFyaXNpb24gYW5kIGVycm9yIGR1ZSB0byBhcml0aG1ldGljIG9wZXJhdGlvblxuICovXG5NYXBzLnByb3RvdHlwZS5fcm91bmQgPSBmdW5jdGlvbiAodmFsKSB7XG5cdC8vIHJvdWRpbmcgdG8gc2l4IGRlY2ltYWxzXG5cdHJldHVybiBNYXRoLnJvdW5kKHBhcnNlRmxvYXQodmFsKSAqIDEwMDAwMDApIC8gMTAwMDAwMDtcbn07XG5cbi8qKlxuICogY2hlY2sgZXF1YWwgd2l0aCByb3VuZGluZ1xuICovXG5NYXBzLnByb3RvdHlwZS5faXNGbG9hdEVxdWFsID0gZnVuY3Rpb24gKHZhbDEsIHZhbDIpIHtcblx0Ly8gcm91ZGluZyB0byB0d28gZGVjaW1hbHNcblx0cmV0dXJuIHRoaXMuX3JvdW5kKHZhbDEpID09PSB0aGlzLl9yb3VuZCh2YWwyKTtcbn07XG5cbi8qKlxuICogY2hlY2sgaWYgbWFwIGlzIG1vZGlmaWVkIGJ5IGNvbXBhcmUgd2l0aCBpbnRlcm5hbCBsaXN0XG4gKi9cbk1hcHMucHJvdG90eXBlLm1hcElzTW9kaWZpZWQgPSBmdW5jdGlvbihwZWVySWQsIG1hcF9pbmZvKSB7XG5cdC8vIGRvdWJsZSBjaGVja1xuXHRtYXBfaW5mby5zY2FsZSA9IEFycmF5LmlzQXJyYXkobWFwX2luZm8uc2NhbGUpID8gbWFwX2luZm8uc2NhbGVbMF0gOiBtYXBfaW5mby5zY2FsZVxuXG5cdC8vIHVnbHkgY29kZSBidXQgcXVpY2sgY29tcGFyZSB0byBsb29wXG5cdHJldHVybiAhKHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBhdGguc2NhbGUsIG1hcF9pbmZvLnNjYWxlKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnJvdGF0ZSwgbWFwX2luZm8ucm90YXRlKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnRyYW5zbGF0ZVswXSwgbWFwX2luZm8udHJhbnNsYXRlWzBdKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnRyYW5zbGF0ZVsxXSwgbWFwX2luZm8udHJhbnNsYXRlWzFdKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnJhdGlvLCBtYXBfaW5mby5yYXRpbykpO1xufVxuXG4vKipcbiAqIGNoZWNrIGlmIHBsYWNlIGlzIG1vZGlmaWVkIGJ5IGNvbXBhcmUgd2l0aCBpbnRlcm5hbCBsaXN0XG4gKi9cbk1hcHMucHJvdG90eXBlLnBsYWNlSXNNb2RpZmllZCA9IGZ1bmN0aW9uKHBlZXJJZCwgcGxhY2VfaW5mbykge1xuXHQvLyB1Z2x5IGNvZGUgYnV0IHF1aWNrIGNvbXBhcmUgdG8gbG9vcFxuXHRyZXR1cm4gISh0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wbGFjZXNbcGxhY2VfaW5mby5pZF0ueCwgcGxhY2VfaW5mby54KSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wbGFjZXNbcGxhY2VfaW5mby5pZF0ueSwgcGxhY2VfaW5mby55KSk7XG59XG5cbi8vIC8qKlxuLy8gICogYWRkIGEgRGl5YSB3aGVuIHNlbGVjdG9yIGNoYW5nZWQgYW5kIGhhZCBuZXcgRGl5YVxuLy8gICpcbi8vICAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuLy8gICogQHBhcmFtIGNvbG9yIHtkM19yZ2J9IGQzIGNvbG9yXG4vLyAgKi9cbi8vIE1hcHMucHJvdG90eXBlLmFkZFBlZXIgPSBmdW5jdGlvbihwZWVySWQpIHtcbi8vIFx0dGhpcy5fZGl5YXNbcGVlcklkXSA9IHtcbi8vIFx0XHRtYXBJZDogbnVsbCxcbi8vIFx0XHRwYXRoOiBudWxsLCAvLyB7dHJhbnNsYXRlOiBbXSwgc2NhbGU6IG51bGwsIHJvdGF0ZTogbnVsbH0sXG4vLyBcdFx0cGxhY2VzOiB7fSxcbi8vIFx0XHRtYXBJc01vZGlmaWVkOiBmYWxzZSxcbi8vIFx0fTtcbi8vIH1cblxuLyoqXG4gKiByZW1vdmUgYSBEaXlhIHdoZW4gdGhlcmUgaXMgYSBwcm9ibGVtIGluIGxpc3RlbiBtYXAgKHN1YnNjcmlwdGlvbilcbiAqXG4gKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbiAqL1xuTWFwcy5wcm90b3R5cGUucmVtb3ZlUGVlciA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHRpZiAodGhpcy5fZGl5YXNbcGVlcklkXSkge1xuXHRcdC8vIHJlbW92ZVxuXHRcdGRlbGV0ZSB0aGlzLl9kaXlhc1twZWVySWRdO1xuXHRcdHRoaXMuZW1pdChcInBlZXItdW5zdWJzY3JpYmVkXCIsIHBlZXJJZCk7XG5cdH1cblxuXHQvLyBuZWNjZXNzYXJ5PyBpZiBkaXlhbm9kZSByZWNvbm5lY3Q/XG5cdGlmICh0aGlzLl9zdWJJZHNbcGVlcklkXSAhPT0gbnVsbCAmJiAhaXNOYU4odGhpcy5fc3ViSWRzW3BlZXJJZF0pKSB7XG5cdFx0Ly8gZXhpc3RlZCBzdWJzY3JpcHRpb24gPz9cblx0XHQvLyB1bnN1YnNjcmliZVxuXHRcdGQxKHBlZXJJZCkudW5zdWJzY3JpYmUodGhpcy5fc3ViSWRzKTtcblx0XHRkZWxldGUgdGhpcy5fc3ViSWRzW3BlZXJJZF07XG5cdH1cbn07XG5cbi8qKlxuICogY29ubmVjdCB0byBzZXJ2aWNlIG1hcFxuICovXG5NYXBzLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvLyBvcHRpb25zIGZvciBzdWJzY3JpcHRpb25cblx0dmFyIG9wdGlvbnMgPSB7XG5cdFx0YXV0bzogdHJ1ZSwgLy8gYXV0byByZXN1YnNjcmliZT9cblx0XHRzdWJJZHM6IFtdIC8vIGluIGZhY3QsIGl0IGlzIGEgbGlzdCwgYnV0IHRoZSBjb2RlIGluIERpeWFTZWxlY3RvciBjaGVjayBmb3IgYXJyYXlcblx0fTtcblxuXHQvLyBzdWJzY3JpYmUgZm9yIG1hcCBzZXJ2aWNlXG5cdGQxKFwiI3NlbGZcIikuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0ZnVuYzogJ1JvYm90cycsXG5cdFx0b2JqOiB0aGlzLl9wZWVySWRzXG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0aWYgKGVyciB8fCBkYXRhLmVycm9yKSB7XG5cdFx0XHRMT0coXCJNYXBzOiBmYWlsIHRvIGdldCBpbmZvIGZyb20gbWFwLCBlcnJvcjpcIiwgZXJyIHx8IGRhdGEuZXJyb3IsIFwiIVwiKTsgLy8gbW9zdGx5IFBlZXJEaXNjb25uZWN0ZWRcblxuXHRcdFx0Ly8gcmVtb3ZlIHRoYXQgcGVlclxuXHRcdFx0Ly90aGF0LnJlbW92ZVBlZXIocGVlcklkKTsvLy4uLlxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChkYXRhID09IG51bGwpIHJldHVybiA7XG5cblx0XHRwZWVySWQgPSBkYXRhLnBlZXJJZDtcblxuXHRcdGlmKCFwZWVySWQpe1xuXHRcdFx0TE9HKFwiTWFwczogcmVjZWl2ZWQgaW5mbyB3aXRob3V0IGEgcGVlcklkXCIpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZGF0YS5wbGFjZXMpKSB7IC8vIHdpbm5lciwgdGhpcyBpc24ndCAxc3QgbWVzc2FnZVxuXHRcdFx0ZGF0YS5wbGFjZXMgPSBbXTtcblx0XHR9XG5cblx0XHQvLyBkYXRhLnBsYWNlIGlzIGN1cnJlbnQgcGxhY2Vcblx0XHRpZiAoZGF0YS5wbGFjZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRkYXRhLnBsYWNlcy5wdXNoKGRhdGEucGxhY2UpOyAvLyBtYXkgYmUgbnVsbCAuLi5cblx0XHR9XG5cblx0XHR2YXIgbWFwX2luZm8gPSBudWxsLCBwbGFjZXNfaW5mbyA9IFtdO1xuXG5cdFx0aWYoZGF0YS50eXBlID09PSAnTWFwSW5mbycpe1xuXHRcdFx0Ly8gZGF0YSA6IHtpZCwgbmFtZSwgcGxhY2VzLCByb3RhdGUsIHNjYWxlLCB0eCwgdHksIHJhdGlvfVxuXHRcdFx0aWYgKHRoYXQuX2RpeWFzW3BlZXJJZF0gPT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdID0ge1xuXHRcdFx0XHRcdHBhdGg6IHtcblx0XHRcdFx0XHRcdHRyYW5zbGF0ZTogW2RhdGEudHgsIGRhdGEudHldLFxuXHRcdFx0XHRcdFx0c2NhbGU6IGRhdGEuc2NhbGUsXG5cdFx0XHRcdFx0XHRyb3RhdGU6IGRhdGEucm90YXRlLFxuXHRcdFx0XHRcdFx0cmF0aW86IGRhdGEucmF0aW9cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHBsYWNlczoge31cblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICh0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGggPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aCA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC50cmFuc2xhdGUgPSBbZGF0YS50eCwgZGF0YS50eV07XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC5zY2FsZSA9IGRhdGEuc2NhbGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC5yb3RhdGUgPSBkYXRhLnJvdGF0ZTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoLnJhdGlvID0gZGF0YS5yYXRpbztcblx0XHRcdFx0aWYgKHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzID09IG51bGwpIHtcblx0XHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlcyA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRtYXBfaW5mbyA9IHtcblx0XHRcdFx0aWQ6IGRhdGEuaWQsXG5cdFx0XHRcdG5hbWU6IGRhdGEubmFtZSxcblx0XHRcdFx0cm90YXRlOiBkYXRhLnJvdGF0ZSxcblx0XHRcdFx0c2NhbGU6IGRhdGEuc2NhbGUsXG5cdFx0XHRcdHRyYW5zbGF0ZTogW2RhdGEudHgsIGRhdGEudHldLFxuXHRcdFx0XHRyYXRpbzogZGF0YS5yYXRpb1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBzYXZlIGRhdGEgdmFsdWVzXG5cdFx0ZGF0YS5wbGFjZXMubWFwKGZ1bmN0aW9uKHBsYWNlKSB7XG5cdFx0XHRpZiAocGxhY2UpIHsgLy8gbnVsbCBpZiBjdXJyZW50cGxhY2UgaXNuJ3QgaW5pdCBpbiBEaXlhTm9kZVxuXHRcdFx0XHQvLyBwbGFjZSB7IG1hcElkLCBsYWJlbCwgbmV1cm9uSWQsICB4LCB5fVxuXG5cdFx0XHRcdC8vIG5ldXJvbklkIChhbHNvIHBsYWNlICdzIElkKVxuXHRcdFx0XHR2YXIgaWQgPSBwbGFjZS5uZXVyb25JZDtcblxuXHRcdFx0XHQvLyBVcGRhdGUgaW50ZXJuYWwgbGlzdFxuXHRcdFx0XHQvLyBjb252ZXJ0IGZyb20gRGl5YSBwYXJhbWV0ZXIgKDAuLjEga20pIHRvIGRpeWEtbWFwICgwLi4xMDAwMDApXG5cdFx0XHRcdHBsYWNlID0ge1xuXHRcdFx0XHRcdGlkOiBpZCxcblx0XHRcdFx0XHRsYWJlbDogcGxhY2UubGFiZWwsXG5cdFx0XHRcdFx0eDogcGxhY2UueCxcblx0XHRcdFx0XHR5OiBwbGFjZS55LFxuXHRcdFx0XHRcdHQ6IDM2MCAqIHBsYWNlLnRcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAodGhhdC5fZGl5YXNbcGVlcklkXS5wbGFjZXNbaWRdID09IG51bGwpIHsgLy8gbm9uZXhpc3RlbnQgcGxhY2Vcblx0XHRcdFx0XHQvLyBpZiBpcyBudWxsIG9yIHVuZGVmaW5lZFxuXHRcdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW2lkXSA9IHBsYWNlOyAvLyBzYXZlIGl0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwbGFjZXNfaW5mby5wdXNoKE9iamVjdC5jcmVhdGUocGxhY2UpKTsvLyBjcmVhdGUgYSBjb3B5IHRvIHNlbmQgdG8gdXNlclxuXG5cdFx0XHRcdC8vIHNhdmUgYmFzZSBwbGFjZSAoZmlyc3Qga25vd24gcGxhY2UsIGFsc28gZmlyc3QgZWxlbWVudCBvZiBwbGFjZXMgYXJyYXkpXG5cdFx0XHRcdC8vIHVzZWxlc3MgYXQgdGhlIG1vbWVudFxuXHRcdFx0XHQvLyBpZiAoIXRoYXQuX2RpeWFzW3BlZXJJZF0uYmFzZVBsYWNlKSB0aGF0Ll9kaXlhc1twZWVySWRdLmJhc2VQbGFjZSA9IHBsYWNlO1xuXHRcdFx0fSBlbHNlIHsgLy8gY3VycmVudCBwbGFjZSBpcyBudWxsXG5cdFx0XHRcdHBsYWNlc19pbmZvLnB1c2gobnVsbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAocGxhY2VzX2luZm8ubGVuZ3RoID09PSAwKSBwbGFjZXNfaW5mbyA9IG51bGw7XG5cblx0XHR0aGF0LmVtaXQoXCJwZWVyLXN1YnNjcmliZWRcIixwZWVySWQsIG1hcF9pbmZvLCBwbGFjZXNfaW5mbyk7XG5cdH0sIG9wdGlvbnMpO1xuXG5cdGZvciAodmFyIHBlZXJJZCBpbiBvcHRpb25zLnN1Yklkcykge1xuXHRcdGlmICh0aGlzLl9zdWJJZHNbcGVlcklkXSAhPT0gbnVsbCAmJiAhaXNOYU4odGhpcy5fc3ViSWRzW3BlZXJJZF0pKSB7XG5cdFx0XHQvLyBleGlzdGVkIHN1YnNjcmlwdGlvbiA/P1xuXHRcdFx0ZDEoXCIjc2VsZlwiKS51bnN1YnNjcmliZSh0aGlzLl9zdWJJZHMpXG5cdFx0XHRkZWxldGUgdGhpcy5fc3ViSWRzW3BlZXJJZF07XG5cdFx0XHRMT0coXCJNYXBzOiBidWc6IGV4aXN0ZWQgc3Vic2NyaXB0aW9uID8/XCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHNhdmUgc3ViSWQgZm9yIGxhdGVyIHVuc3Vic2NyaXB0aW9uXG5cdFx0XHR0aGlzLl9zdWJJZHNbcGVlcklkXSA9IG9wdGlvbnMuc3ViSWRzW3BlZXJJZF07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogZGlzY29ubmVjdCBmcm9tIHNlcnZpY2UgbWFwLCBmcmVlIGV2ZXJ5dGhpbmcgc28gaXQgaXMgc2FmZSB0byBnYXJiYWdlIGNvbGxlY3RlIHRoaXMgc2VydmljZVxuICovXG5NYXBzLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0ZDEoXCIjc2VsZlwiKS51bnN1YnNjcmliZSh0aGlzLl9zdWJJZHMpO1xuXHRmb3IodmFyIHBlZXJJZCBpbiB0aGlzLl9kaXlhcyl7XG5cdFx0dGhhdC5lbWl0KFwicGVlci11bnN1YnNjcmliZWRcIiwgcGVlcklkKTtcblx0fVxuXHR0aGlzLl9kaXlhcyA9IHt9Oy8vIGRlbGV0ZSA/XG5cdHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG59XG5cbi8qKlxuICogc2F2ZSBtYXBcbiAqXG4gKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbiAqIEBwYXJhbSBtYXBfaW5mbyB7T2JqZWN0fSAoe3JvdGF0ZSwgc2NhbGUsIHRyYW5zbGF0ZX0pXG4gKiBAcGFyYW0gY2Ige0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIGVycm9yIGFzIGFyZ3VtZW50XG4gKi9cbk1hcHMucHJvdG90eXBlLnNhdmVNYXAgPSBmdW5jdGlvbiAodGFyZ2V0UGVlcklkLCBtYXBfaW5mbywgY2IpIHtcblx0dmFyIF9tYXBfaW5mbyA9IE9iamVjdC5jcmVhdGUobWFwX2luZm8pOyAvLyBjcmVhdGUgYSBkdXBsaWNhdGUgb2YgbWFwX2luZm9cblx0dmFyIHRoYXQgPSB0aGlzO1xuXHQvLyBzYXZlIG1hcCdzIGluZm9cblx0X21hcF9pbmZvLnNjYWxlID0gQXJyYXkuaXNBcnJheShfbWFwX2luZm8uc2NhbGUpID8gX21hcF9pbmZvLnNjYWxlWzBdIDogX21hcF9pbmZvLnNjYWxlXG5cblx0aWYgKHRoaXMubWFwSXNNb2RpZmllZCh0YXJnZXRQZWVySWQsIF9tYXBfaW5mbykpIHtcblx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdFx0ZnVuYzogJ1VwZGF0ZU1hcCcsXG5cdFx0XHRvYmo6IFsgdGFyZ2V0UGVlcklkIF0sXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHNjYWxlOiBfbWFwX2luZm8uc2NhbGUsXG5cdFx0XHRcdHR4OiBfbWFwX2luZm8udHJhbnNsYXRlWzBdLFxuXHRcdFx0XHR0eTogX21hcF9pbmZvLnRyYW5zbGF0ZVsxXSxcblx0XHRcdFx0cm90YXRlOiBfbWFwX2luZm8ucm90YXRlLFxuXHRcdFx0XHRyYXRpbzogX21hcF9pbmZvLnJhdGlvXG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBhdGguc2NhbGUgPSBfbWFwX2luZm8uc2NhbGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGF0aC5yb3RhdGUgPSBfbWFwX2luZm8ucm90YXRlO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBhdGgudHJhbnNsYXRlWzBdID0gX21hcF9pbmZvLnRyYW5zbGF0ZVswXTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbdGFyZ2V0UGVlcklkXS5wYXRoLnRyYW5zbGF0ZVsxXSA9IF9tYXBfaW5mby50cmFuc2xhdGVbMV07XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2IpIGNiKGVycik7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGNiKSBjYihuZXcgRXJyb3IoXCJObyBjaGFuZ2UgdG8gbWFwICdcIiArIHRoaXMuX21hcCArIFwiJyFcIikpO1xuXHR9XG59XG5cbi8qKlxuICogdXBkYXRlIGV2ZXJ5IHBsYWNlc1xuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIHBsYWNlX2luZm8ge09iamVjdH0gKHsgaWQsIHgsIHl9KVxuICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCBlcnJvciBhcyBhcmd1bWVudFxuICovXG5NYXBzLnByb3RvdHlwZS5zYXZlUGxhY2UgPSBmdW5jdGlvbiAodGFyZ2V0UGVlcklkLCBwbGFjZV9pbmZvLCBjYikge1xuXHQvLyBzYXZlIG1hcCdzIGluZm9cblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgZXJyb3IgPSBcIlwiO1xuXG5cdHZhciBfcGxhY2VfaW5mbyA9IE9iamVjdC5jcmVhdGUocGxhY2VfaW5mbyk7XG5cblx0Ly8gc2F2ZSBwbGFjZVxuXHRpZiAodGhpcy5wbGFjZUlzTW9kaWZpZWQodGFyZ2V0UGVlcklkLCBfcGxhY2VfaW5mbykpIHtcblx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdFx0ZnVuYzogJ1VwZGF0ZVBsYWNlJyxcblx0XHRcdG9iajogWyB0YXJnZXRQZWVySWQgXSxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0bmV1cm9uSWQ6IF9wbGFjZV9pbmZvLmlkLFxuXHRcdFx0XHR4OiBfcGxhY2VfaW5mby54LFxuXHRcdFx0XHR5OiBfcGxhY2VfaW5mby55XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBsYWNlc1tfcGxhY2VfaW5mby5pZF0ueCA9IF9wbGFjZV9pbmZvLng7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGxhY2VzW19wbGFjZV9pbmZvLmlkXS55ID0gX3BsYWNlX2luZm8ueTtcblx0XHRcdH1cblx0XHRcdGlmIChjYikgY2IoZXJyKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRpZiAoY2IpIGNiKG5ldyBFcnJvcihcIk5vIGNoYW5nZSB0byBwbGFjZSBuIFwiICsgX3BsYWNlX2luZm8uaWQgKyBcIiFcIikpO1xuXHR9XG59XG5cbi8qKlxuICogZGVsZXRlIGV2ZXJ5IHNhdmVkIHBsYWNlcyBvZiBEaXlhIChjaG9vc2VuIGluIHNlbGVjdG9yKVxuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCBlcnJvciBhcyBhcmd1bWVudFxuICovXG5NYXBzLnByb3RvdHlwZS5jbGVhclBsYWNlcyA9IGZ1bmN0aW9uKHRhcmdldFBlZXJJZCwgY2IpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdGQxKFwiI3NlbGZcIikucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdGZ1bmM6ICdDbGVhck1hcCcsXG5cdFx0b2JqOiBbIHRhcmdldFBlZXJJZCBdXG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHQvLyBkZWxldGUgZnJvbSBpbnRlcm5hbCBsaXN0XG5cdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBsYWNlcyA9IHt9O1xuXHRcdH1cblx0XHRpZiAoY2IpIGNiKGVycik7XG5cdH0pO1xufVxuXG4vLyBleHBvcnQgaXQgYXMgbW9kdWxlIG9mIERpeWFTZWxlY3RvclxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5tYXBzID0gZnVuY3Rpb24ocGVlcklkcykge1xuXHR2YXIgbWFwcyA9IG5ldyBNYXBzKHBlZXJJZHMpO1xuXG5cdHJldHVybiBtYXBzO1xufVxuIiwidmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciBkMSA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpO1xudmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cblxuXG5kMS5rbm93blBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBkMShcIiNzZWxmXCIpLmtub3duUGVlcnMoKTtcbn07XG5kMS5rcCA9IGQxLmtub3duUGVlcnM7XG5cblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmtub3duUGVlcnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdHRoaXMucmVxdWVzdCh7c2VydmljZTogJ21lc2hOZXR3b3JrJyxmdW5jOiAnTGlzdEtub3duUGVlcnMnfSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdHZhciBwZWVycyA9IFtdO1xuXHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdH0pO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuXG5cbmQxLmxpc3Rlbk1lc2hOZXR3b3JrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0cmV0dXJuIGQxKC8uKi8pLnN1YnNjcmliZSh7IHNlcnZpY2U6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdNZXNoTmV0d29yaycgfSwgY2FsbGJhY2ssIHthdXRvOiB0cnVlfSk7XG59O1xuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG5mdW5jdGlvbiBNZXNzYWdlKHNlcnZpY2UsIGZ1bmMsIG9iaiwgcGVybWFuZW50KXtcblxuXHR0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXHR0aGlzLmZ1bmMgPSBmdW5jO1xuXHR0aGlzLm9iaiA9IG9iajtcblx0XG5cdHRoaXMucGVybWFuZW50ID0gcGVybWFuZW50OyAvL0lmIHRoaXMgZmxhZyBpcyBvbiwgdGhlIGNvbW1hbmQgd2lsbCBzdGF5IG9uIHRoZSBjYWxsYmFjayBsaXN0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG59XG5cbk1lc3NhZ2UuYnVpbGRTaWduYXR1cmUgPSBmdW5jdGlvbihtc2cpe1xuXHRyZXR1cm4gbXNnLnNlcnZpY2UrJy4nK21zZy5mdW5jKycuJyttc2cub2JqO1xufVxuXG5cbk1lc3NhZ2UucHJvdG90eXBlLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnNlcnZpY2UrJy4nK3RoaXMuZnVuYysnLicrdGhpcy5vYmo7XG59XG5cbk1lc3NhZ2UucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbihkYXRhKXtcblx0cmV0dXJuIHtcblx0XHRzZXJ2aWNlOiB0aGlzLnNlcnZpY2UsXG5cdFx0ZnVuYzogdGhpcy5mdW5jLFxuXHRcdG9iajogdGhpcy5vYmosXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZTtcbiIsInZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgZDEgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKTtcbnZhciBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKTtcbmlmKCFpc0Jyb3dzZXIpIHsgdmFyIFEgPSByZXF1aXJlKCdxJyk7IH1cbmVsc2UgeyB2YXIgUSA9IHdpbmRvdy5ROyB9XG5cbmlmKHR5cGVvZiBJTkZPID09PSAndW5kZWZpbmVkJykgSU5GTyA9IGZ1bmN0aW9uKHMpIHsgY29uc29sZS5sb2cocyk7fVxuaWYodHlwZW9mIE9LID09PSAndW5kZWZpbmVkJykgT0sgPSBmdW5jdGlvbihzKSB7IGNvbnNvbGUubG9nKHMpO31cblxuXG5cbi8qKlxuKiBJbnN0YWxscyBhIG5ldyBEaXlhTm9kZSBkZXZpY2UgKHdpdGggYWRkcmVzcyAnaXAnKSBpbnRvIGFuIGV4aXN0aW5nIG5ldHdvcmssIGJ5XG4qIGNvbnRhY3RpbmcgYW4gZXhpc3RpbmcgRGl5YU5vZGUgZGV2aWNlIHdpdGggYWRkcmVzcyAnYm9vdHN0cmFwX2lwJyA6XG4qICAgMSkgQ29udGFjdCB0aGUgbmV3IG5vZGUgdG8gZ2V0IGl0cyBwdWJsaWMga2V5XG4qICAgMikgQWRkIHRoaXMgcHVibGljIGtleSB0byB0aGUgZXhpc3Rpbmcgbm9kZSBUcnVzdGVkUGVlcnMgbGlzdFxuKiAgIDMpIEFkZCB0aGUgZXhpc3Rpbmcgbm9kZSdzIHB1YmxpYyBrZXkgdG8gdGhlIG5ldyBub2RlJ3MgVHJ1c3RlZFBlZXJzIGxpc3RcbiogICA0KSBBc2sgdGhlIG5ldyBub2RlIHRvIGpvaW4gdGhlIG5ldHdvcmsgYnkgY2FsbGluZyBAc2Vle2QxKCkuam9pbigpfVxuKlxuKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgdGhlIGdpdmVuIHVzZXIgdG8gaGF2ZSByb290IHJvbGUgb24gYm90aCBub2Rlc1xuKlxuKiBAcGFyYW0gaXAgOiB0aGUgSVAgYWRkcmVzcyBvZiB0aGUgbmV3IGRldmljZVxuKiBAcGFyYW0gdXNlciA6IGEgdXNlcm5hbWUgd2l0aCByb290IHJvbGUgb24gdGhlIG5ldyBkZXZpY2VcbiogQHBhcmFtIHBhc3N3b3JkIDogdGhlIHBhc3N3b3JkIGZvciAndXNlcidcbiogQHBhcmFtIGJvb3RzdHJhcF9pcCA6IHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBib290c3RyYXAgZGV2aWNlXG4qIEBwYXJhbSBib290c3RyYXBfdXNlciA6IGEgdXNlciBpZGVudGlmaWVyIHdpdGggcm9vdCByb2xlIG9uIHRoZSBib29zdHJhcCBkZXZpY2VcbiogQHBhcmFtIGJvb3RzdHJhcF9wYXNzd29yZCA6IHRoZSBwYXNzd29yZCBmb3IgJ2Jvb3RzdHJhcF91c2VyJ1xuKiBAcGFyYW0gYm9vdHN0cmFwX25ldCA6IHRoZSBJUCBhZGRyZXNzIHdoZXJlIHRoZSBuZXcgZGV2aWNlIHdpbGwgY29ubmVjdCB0byB0aGUgYm9vc3RyYXAgb25lXG4qIEBwYXJhbSBjYWxsYmFjayA6IG9mIHRoZSBmb3JtIGNhbGxiYWNrKG5ld19wZWVyX25hbWUsYm9vdHN0cmFwX3BlZXJfbmFtZSwgZXJyLCBkYXRhKVxuKi9cbmQxLmluc3RhbGxOb2RlRXh0ID0gZnVuY3Rpb24oaXAsIHVzZXIsIHBhc3N3b3JkLCBib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQsIGJvb3RzdHJhcF9uZXQsIGNhbGxiYWNrKSB7XG5cdGlmKHR5cGVvZiBpcCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBpcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGJvb3RzdHJhcF9pcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX25ldCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBib290c3RyYXBfbmV0IHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYm9vdHN0cmFwX2lwLmluZGV4T2YoXCJ3czovL1wiKSAhPT0gMCAmJiBib290c3RyYXBfaXAuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfaXAgPSBcIndzczovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHRcdGVsc2UgYm9vdHN0cmFwX2lwID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHR9XG5cdGlmKGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfbmV0ID0gXCJ3c3M6Ly9cIiArIGJvb3RzdHJhcF9uZXQ7XG5cdFx0ZWxzZSBib290c3RyYXBfbmV0ID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX25ldDtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKSB7XG5cdFx0ZDEoXCIjc2VsZlwiKS5qb2luKGJvb3RzdHJhcF9uZXQsIHRydWUsIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSl7XG5cdFx0XHRpZighZXJyKSBPSyhcIkpPSU5FRCAhISFcIik7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSk7XG5cdFx0fSk7XG5cdH1cblxuXHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpe1xuXHRcdGQxKFwiI3NlbGZcIikuZ2l2ZVB1YmxpY0tleShmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycj09PSdTZXJ2aWNlTm90Rm91bmQnKSB7XG5cdFx0XHRcdElORk8oXCJQZWVyIEF1dGhlbnRpY2F0aW9uIGRpc2FibGVkIC4uLiBkaXJlY3RseSBqb2luaW5nXCIpO1xuXHRcdFx0XHRqb2luKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZXJyKSByZXR1cm4gY2FsbGJhY2socGVlciwgbnVsbCwgZXJyLCBudWxsKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRJTkZPKFwiQWRkIHRydXN0ZWQgcGVlciBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIHRvIFwiICsgYm9vdHN0cmFwX2lwICsgXCIgd2l0aCBwdWJsaWMga2V5IFwiICsgZGF0YS5wdWJsaWNfa2V5LnNsaWNlKDAsMjApKTtcblx0XHRcdFx0ZDEuY29ubmVjdEFzVXNlcihib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKHBlZXIsIGRhdGEucHVibGljX2tleSwgZnVuY3Rpb24oYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSkge1xuXG5cdFx0XHRcdFx0XHRpZihlcnIpIHJldHVybiBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBudWxsKTtcblx0XHRcdFx0XHRcdGlmKGRhdGEuYWxyZWFkeVRydXN0ZWQpIElORk8ocGVlciArIFwiIGFscmVhZHkgdHJ1c3RlZCBieSBcIiArIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdGVsc2UgSU5GTyhib290c3RyYXBfcGVlciArIFwiKGlwPVwiKyBib290c3RyYXBfaXAgK1wiKSBhZGRlZCBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXG5cdFx0XHRcdFx0XHRJTkZPKFwiSW4gcmV0dXJuLCBhZGQgXCIgKyBib290c3RyYXBfcGVlciArIFwiIHRvIFwiICsgcGVlciArIFwiIGFzIGEgVHJ1c3RlZCBQZWVyIHdpdGggcHVibGljIGtleSBcIiArIGRhdGEucHVibGljX2tleS5zbGljZSgwLDIwKSk7XG5cdFx0XHRcdFx0XHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKGJvb3RzdHJhcF9wZWVyLCBkYXRhLnB1YmxpY19rZXksIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKGVycikgY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgbnVsbCk7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZihkYXRhLmFscmVhZHlUcnVzdGVkKSBJTkZPKGJvb3RzdHJhcF9wZWVyICsgXCIgYWxyZWFkeSB0cnVzdGVkIGJ5IFwiICsgcGVlcik7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBJTkZPKHBlZXIgKyBcIihpcD1cIisgaXAgK1wiKSBhZGRlZCBcIiArIGJvb3RzdHJhcF9wZWVyICsgXCIoaXA9XCIrIGJvb3RzdHJhcF9pcCArXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vIE9uY2UgS2V5cyBoYXZlIGJlZW4gZXhjaGFuZ2VkIGFzayB0byBqb2luIHRoZSBuZXR3b3JrXG5cdFx0XHRcdFx0XHRcdFx0T0soXCJLRVlTIE9LICEgTm93LCBsZXQgXCIrcGVlcitcIihpcD1cIitpcCtcIikgam9pbiB0aGUgbmV0d29yayB2aWEgXCIrYm9vdHN0cmFwX3BlZXIrXCIoaXA9XCIrYm9vdHN0cmFwX25ldCtcIikgLi4uXCIpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5cbi8qKiBTaG9ydCB2ZXJzaW9uIG9mIEBzZWV7ZDEuaW5zdGFsbE5vZGVFeHR9ICovXG5kMS5pbnN0YWxsTm9kZSA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spIHtcblx0XHR2YXIgaXAgPSBkMS5hZGRyKCk7XG5cdFx0dmFyIHVzZXIgPSBkMS51c2VyKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gZDEucGFzcygpO1xuXHRcdHZhciBib290c3RyYXBfdXNlciA9IHVzZXI7XG5cdFx0dmFyIGJvb3RzdHJhcF9wYXNzd29yZCA9IHBhc3N3b3JkO1xuXHRcdHJldHVybiBkMS5pbnN0YWxsTm9kZUV4dChpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spO1xufVxuXG5cblxuXG4vKipcbiAqIE1ha2UgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBqb2luIGFuIGV4aXN0aW5nIERpeWFOb2RlcyBNZXNoIE5ldHdvcmsgYnkgY29udGFjdGluZ1xuICogdGhlIGdpdmVuIGJvb3RzdHJhcCBwZWVycy5cbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGNvbnRhY3QgdG8gam9pbiB0aGUgTmV0d29ya1xuICogQHBhcmFtIGJQZXJtYW5lbnQgOiBpZiB0cnVlLCBwZXJtYW5lbnRseSBhZGQgdGhlIGJvb3RzdHJhcCBwZWVycyBhcyBhdXRvbWF0aWMgYm9vdHN0cmFwIHBlZXJzIGZvciB0aGUgc2VsZWN0ZWQgbm9kZXMuXG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbihib290c3RyYXBfaXBzLCBiUGVybWFuZW50LCBjYWxsYmFjayl7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXBzID09PSAnc3RyaW5nJykgYm9vdHN0cmFwX2lwcyA9IFsgYm9vdHN0cmFwX2lwcyBdO1xuXHRpZihib290c3RyYXBfaXBzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkgdGhyb3cgXCJqb2luKCkgOiBib290c3RyYXBfaXBzIHNob3VsZCBiZSBhbiBhcnJheSBvZiBwZWVycyBVUklzXCI7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZSA6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdKb2luJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIERpc2Nvbm5lY3QgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBmcm9tIHRoZSBnaXZlbiBib290c3RyYXAgcGVlcnNcbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGxlYXZlXG4gKiBAcGFyYW0gYlBlcm1hbmVudCA6IGlmIHRydWUsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGUgZ2l2ZW4gcGVlcnMgZnJvbSB0aGUgYXV0b21hdGljIGJvb3RzdHJhcCBwZWVycyBsaXN0XG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24oYm9vdHN0cmFwX2lwcywgYlBlcm1hbmVudCwgY2FsbGJhY2spe1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwcyA9PT0gJ3N0cmluZycpIGJvb3RzdHJhcF9pcHMgPSBbIGJvb3RzdHJhcF9pcHMgXTtcblx0aWYoYm9vdHN0cmFwX2lwcy5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHRocm93IFwibGVhdmUoKSA6IGJvb3RzdHJhcF9pcHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHBlZXJzIFVSSXNcIjtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlIDogJ21lc2hOZXR3b3JrJywgZnVuYzogJ0xlYXZlJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIEFzayB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGZvciB0aGVpciBwdWJsaWMga2V5c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdpdmVQdWJsaWNLZXkgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dpdmVQdWJsaWNLZXknLFx0ZGF0YToge30gfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7Y2FsbGJhY2socGVlcklkLGVycixkYXRhKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIEFkZCBhIG5ldyB0cnVzdGVkIHBlZXIgUlNBIHB1YmxpYyBrZXkgdG8gdGhlIHNlbGVjdGVkIERpeWFOb2Rlc1xuICogTk9URSA6IFRoaXMgb3BlcmF0aW9uIHJlcXVpcmVzIHJvb3Qgcm9sZVxuICpcbiAqIEBwYXJhbSBuYW1lIDogdGhlIG5hbWUgb2YgdGhlIG5ldyB0cnVzdGVkIERpeWFOb2RlIHBlZXJcbiAqIEBwYXJhbSBwdWJsaWNfa2V5IDogdGhlIFJTQSBwdWJsaWMga2V5IG9mIHRoZSBuZXcgdHJ1c3RlZCBEaXlhTm9kZSBwZWVyXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYWRkVHJ1c3RlZFBlZXIgPSBmdW5jdGlvbihuYW1lLCBwdWJsaWNfa2V5LCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoeyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FkZFRydXN0ZWRQZWVyJyxcdGRhdGE6IHsgbmFtZTogbmFtZSwgcHVibGljX2tleTogcHVibGljX2tleSB9fSxcblx0XHRmdW5jdGlvbihwZWVySWQsZXJyLGRhdGEpe2NhbGxiYWNrKHBlZXJJZCxlcnIsZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBzZWxlY3RlZCBEaXlhTm9kZXMgdHJ1c3QgdGhlIGdpdmVuIHBlZXJzXG4gKiBAcGFyYW0gcGVlcnMgOiBhbiBhcnJheSBvZiBwZWVyIG5hbWVzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYXJlVHJ1c3RlZCA9IGZ1bmN0aW9uKHBlZXJzLCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FyZVRydXN0ZWQnLFx0ZGF0YTogeyBwZWVyczogcGVlcnMgfSB9LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHR2YXIgYWxsVHJ1c3RlZCA9IGRhdGEudHJ1c3RlZDtcblx0XHRcdGlmKGFsbFRydXN0ZWQpIHsgT0socGVlcnMgKyBcIiBhcmUgdHJ1c3RlZCBieSBcIiArIHBlZXJJZCk7IGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7IH1cblx0XHRcdGVsc2UgeyBFUlIoXCJTb21lIHBlZXJzIGluIFwiICsgcGVlcnMgKyBcIiBhcmUgdW50cnVzdGVkIGJ5IFwiICsgcGVlcklkKTsgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7IH1cblx0XHR9XG5cdCk7XG59O1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5pc1RydXN0ZWQgPSBmdW5jdGlvbihwZWVyLCBjYWxsYmFjaykgeyByZXR1cm4gdGhpcy5hcmVUcnVzdGVkKFtwZWVyXSwgY2FsbGJhY2spOyB9XG5cblxuZDEudHJ1c3RlZFBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0ZDEoXCIjc2VsZlwiKS5yZXF1ZXN0KFxuXHRcdHsgc2VydmljZTogJ3BlZXJBdXRoJyxcdGZ1bmM6ICdHZXRUcnVzdGVkUGVlcnMnIH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0dmFyIHBlZXJzID0gW107XG5cdFx0XHRmb3IodmFyIGk9MDsgaTxkYXRhLnBlZXJzLmxlbmd0aDsgaSsrKSBwZWVycy5wdXNoKGRhdGEucGVlcnNbaV0ubmFtZSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5kMS50cCA9IGQxLnRydXN0ZWRQZWVyczsgLy8gU2hvcnRoYW5kXG5cbmQxLmJsYWNrbGlzdGVkUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRkMShcIiNzZWxmXCIpLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dldEJsYWNrbGlzdGVkUGVlcnMnIH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0dmFyIHBlZXJzID0gW107XG5cdFx0XHRmb3IodmFyIGk9MDsgaTxkYXRhLnBlZXJzLmxlbmd0aDsgaSsrKSBwZWVycy5wdXNoKGRhdGEucGVlcnNbaV0ubmFtZSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5kMS5icCA9IGQxLmJsYWNrbGlzdGVkUGVlcnM7IC8vIFNob3J0aGFuZFxuIiwiRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cblxuaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpe1xuXHR2YXIgUlRDUGVlckNvbm5lY3Rpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbjtcblx0dmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgfHwgd2luZG93Lm1velJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cud2Via2l0UlRDSWNlQ2FuZGlkYXRlO1xuXHR2YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cubW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENTZXNzaW9uRGVzY3JpcHRpb247XG59XG5cblxuXG5cbi8vLy8vLy8vLy8vLy9cbi8vIENIQU5ORUwgLy9cbi8vLy8vLy8vLy8vLy9cblxuLyoqIEhhbmRsZXMgYSBSVEMgY2hhbm5lbCAoZGF0YWNoYW5uZWwgYW5kL29yIHN0cmVhbSkgdG8gYSBEaXlhTm9kZSBwZWVyXG4gKiAgQHBhcmFtIGRuSWQgOiB0aGUgRGl5YU5vZGUgcGVlcklkXG4gKiAgQHBhcmFtIG5hbWUgOiB0aGUgY2hhbm5lbCdzIG5hbWVcbiAqICBAcGFyYW0gZGF0YWNoYW5uZWxfY2IgOiBjYWxsYmFjayBjYWxsZWQgd2hlbiBhIFJUQyBkYXRhY2hhbm5lbCBpcyBvcGVuIGZvciB0aGlzIGNoYW5uZWxcbiAqICBAcGFyYW0gc3RyZWFtX2NiIDogY2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBSVEMgc3RyZWFtIGlzIG9wZW4gZm9yIHRoaXMgY2hhbm5lbFxuICovXG5mdW5jdGlvbiBDaGFubmVsKGRuSWQsIG5hbWUsIGRhdGFjaGFubmVsX2NiLCBzdHJlYW1fY2Ipe1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblx0dGhpcy5uYW1lID0gbmFtZTtcblx0dGhpcy5kbklkID0gZG5JZDtcblxuXHR0aGlzLmZyZXF1ZW5jeSA9IDIwO1xuXG5cdHRoaXMuY2hhbm5lbCA9IHVuZGVmaW5lZDtcblx0dGhpcy5zdHJlYW0gPSB1bmRlZmluZWQ7XG5cdHRoaXMub25kYXRhY2hhbm5lbCA9IGRhdGFjaGFubmVsX2NiO1xuXHR0aGlzLm9uc3RyZWFtID0gc3RyZWFtX2NiO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xufVxuaW5oZXJpdHMoQ2hhbm5lbCwgRXZlbnRFbWl0dGVyKTtcblxuLyoqIEJpbmQgYW4gaW5jb21pbmcgUlRDIGRhdGFjaGFubmVsIHRvIHRoaXMgY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuc2V0RGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5jaGFubmVsID0gZGF0YWNoYW5uZWw7XG5cdHRoaXMuY2hhbm5lbC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0ZGF0YWNoYW5uZWwub25tZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0Ly8gRmlyc3QgbWVzc2FnZSBjYXJyaWVzIGNoYW5uZWwgZGVzY3JpcHRpb24gaGVhZGVyXG5cdFx0dmFyIHZpZXcgPSBuZXcgRGF0YVZpZXcobWVzc2FnZS5kYXRhKTtcblxuXHRcdHZhciB0eXBlQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlldy5nZXRVaW50OCgwKSk7XG5cdFx0aWYodHlwZUNoYXIgPT09ICdPJykgdGhhdC50eXBlID0gJ2lucHV0JzsgLy9Qcm9tZXRoZSBPdXRwdXQgPSBDbGllbnQgSW5wdXRcblx0XHRlbHNlIGlmKHR5cGVDaGFyID09PSAnSScpIHRoYXQudHlwZSA9ICdvdXRwdXQnOyAvL1Byb21ldGhlIElucHV0ID0gQ2xpZW50IE91dHB1dFxuXHRcdGVsc2UgdGhyb3cgXCJVbnJlY25vZ25pemVkIGNoYW5uZWwgdHlwZSA6IFwiICsgdHlwZUNoYXI7XG5cblx0XHR2YXIgc2l6ZSA9IHZpZXcuZ2V0SW50MzIoMSx0cnVlKTtcblx0XHRpZighc2l6ZSkgdGhyb3cgXCJXcm9uZyBkYXRhY2hhbm5lbCBtZXNzYWdlIHNpemVcIjtcblx0XHR0aGF0LnNpemUgPSBzaXplO1xuXHRcdHRoYXQuX2J1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSk7XG5cblx0XHQvLyBTdWJzZXF1ZW50IG1lc3NhZ2VzIGFyZSBmb3J3YXJkZWQgdG8gYXBwcm9wcmlhdGUgaGFuZGxlcnNcblx0XHRkYXRhY2hhbm5lbC5vbm1lc3NhZ2UgPSB0aGF0Ll9vbk1lc3NhZ2UuYmluZCh0aGF0KTtcblx0XHRkYXRhY2hhbm5lbC5vbmNsb3NlID0gdGhhdC5fb25DbG9zZS5iaW5kKHRoYXQpO1xuXG5cdFx0aWYodHlwZW9mIHRoYXQub25kYXRhY2hhbm5lbCA9PT0gJ2Z1bmN0aW9uJykgdGhhdC5vbmRhdGFjaGFubmVsKHRoYXQuZG5JZCwgdGhhdCk7XG5cblx0XHRjb25zb2xlLmxvZygnT3BlbiBkYXRhY2hhbm5lbCAnK3RoYXQubmFtZSk7XG5cdH1cbn07XG5cbi8qKiBCaW5kIGFuIGluY29taW5nIFJUQyBzdHJlYW0gdG8gdGhpcyBjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5vbkFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR0aGlzLnN0cmVhbSA9IHN0cmVhbTtcblx0aWYodHlwZW9mIHRoaXMub25zdHJlYW0gPT09ICdmdW5jdGlvbicpIHRoaXMub25zdHJlYW0odGhpcy5kbklkLCBzdHJlYW0pO1xuXHRlbHNlIGNvbnNvbGUud2FybihcIklnbm9yZSBzdHJlYW0gXCIgKyBzdHJlYW0uaWQpO1xuXG5cdGNvbnNvbGUubG9nKCdPcGVuIHN0cmVhbSAnK3RoaXMubmFtZSk7XG59O1xuXG5cbi8qKiBDbG9zZSB0aGlzIGNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5jbG9zZWQgPSB0cnVlO1xufTtcblxuLyoqIFdyaXRlIGEgc2NhbGFyIHZhbHVlIHRvIHRoZSBnaXZlbiBpbmRleCBvbiB0aGUgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSl7XG5cdGlmKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMuc2l6ZSB8fCBpc05hTih2YWx1ZSkpIHJldHVybiBmYWxzZTtcblx0dGhpcy5fYnVmZmVyW2luZGV4XSA9IHZhbHVlO1xuXHR0aGlzLl9yZXF1ZXN0U2VuZCgpO1xuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKiBXcml0ZSBhbiBhcnJheSBvZiB2YWx1ZXMgdG8gdGhlIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUud3JpdGVBbGwgPSBmdW5jdGlvbih2YWx1ZXMpe1xuXHRpZighQXJyYXkuaXNBcnJheSh2YWx1ZXMpIHx8IHZhbHVlcy5sZW5ndGggIT09IHRoaXMuc2l6ZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8dmFsdWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYoaXNOYU4odmFsdWVzW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLl9idWZmZXJbaV0gPSB2YWx1ZXNbaV07XG4gICAgfVxuICAgIHRoaXMuX3JlcXVlc3RTZW5kKCk7XG59O1xuXG4vKiogQXNrIHRvIHNlbmQgdGhlIGludGVybmFsIGRhdGEgYnVmZmVyIHRocm91Z2ggdGhlIGRhdGFjaGFubmVsIGF0IHRoZSBkZWZpbmVkIGZyZXF1ZW5jeSAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX3JlcXVlc3RTZW5kID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5fbGFzdFNlbmRUaW1lc3RhbXA7XG5cdHZhciBwZXJpb2QgPSAxMDAwIC8gdGhpcy5mcmVxdWVuY3k7XG5cdGlmKGVsYXBzZWRUaW1lID49IHBlcmlvZCkgZG9TZW5kKCk7XG5cdGVsc2UgaWYoIXRoaXMuX3NlbmRSZXF1ZXN0ZWQpIHtcblx0XHR0aGlzLl9zZW5kUmVxdWVzdGVkID0gdHJ1ZTtcblx0XHRzZXRUaW1lb3V0KGRvU2VuZCwgcGVyaW9kIC0gZWxhcHNlZFRpbWUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZG9TZW5kKCkge1xuXHRcdHRoYXQuX3NlbmRSZXF1ZXN0ZWQgPSBmYWxzZTtcblx0XHR0aGF0Ll9sYXN0U2VuZFRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdHZhciByZXQgPSB0aGF0Ll9zZW5kKHRoYXQuX2J1ZmZlcik7XG5cdFx0Ly9JZiBhdXRvc2VuZCBpcyBzZXQsIGF1dG9tYXRpY2FsbHkgc2VuZCBidWZmZXIgYXQgdGhlIGdpdmVuIGZyZXF1ZW5jeVxuXHRcdGlmKHJldCAmJiB0aGF0LmF1dG9zZW5kKSB0aGF0Ll9yZXF1ZXN0U2VuZCgpO1xuXHR9XG59O1xuXG4vKiogQWN0dWFsIHNlbmQgdGhlIGludGVybmFsIGRhdGEgYnVmZmVyIHRocm91Z2ggdGhlIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbihtc2cpe1xuXHRpZih0aGlzLmNsb3NlZCB8fCAhdGhpcy5jaGFubmVsKSByZXR1cm4gZmFsc2U7XG5cdGVsc2UgaWYodGhpcy5jaGFubmVsLnJlYWR5U3RhdGUgPT09ICdvcGVuJykge1xuXHRcdHRyeSB7XG5cdFx0XHR0aGlzLmNoYW5uZWwuc2VuZChtc2cpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gZXhjZXB0aW9uIG9jY3VyZWQgd2hpbGUgc2VuZGluZyBkYXRhJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGNvbnNvbGUubG9nKCdbcnRjLmNoYW5uZWwud3JpdGVdIHdhcm5pbmcgOiB3ZWJydGMgZGF0YWNoYW5uZWwgc3RhdGUgPSAnK3RoaXMuY2hhbm5lbC5yZWFkeVN0YXRlKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKiBDYWxsZWQgd2hlbiBhIG1lc3NhZ2UgaXMgcmVjZWl2ZWQgZnJvbSB0aGUgY2hhbm5lbCdzIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX29uTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0dmFyIHZhbEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShtZXNzYWdlLmRhdGEpO1xuXHR0aGlzLmVtaXQoJ3ZhbHVlJywgdmFsQXJyYXkpO1xufTtcblxuLyoqIENhbGxlZCB3aGVuIHRoZSBjaGFubmVsIGlzIGNsb3NlZCBvbiB0aGUgcmVtb3RlIHNpZGUgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9vbkNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKCdDbG9zZSBkYXRhY2hhbm5lbCAnK3RoaXMubmFtZSk7XG5cdHRoaXMuZW1pdCgnY2xvc2UnKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8gUlRDIFBlZXIgaW1wbGVtZW50YXRpb24gLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIEFuIFJUQyBQZWVyIGFzc29jaWF0ZWQgdG8gYSBzaW5nbGUgKERpeWFOb2RlIHBlZXJJZCwgcHJvbUlkKSBjb3VwbGUuXG4gKiBAcGFyYW0gZG5JZCA6IFRoZSBEaXlhTm9kZSBwZWVySWRcbiAqIEBwYXJhbSBydGMgOiBUaGUgUlRDIGRpeWEtc2RrIGluc3RhbmNlXG4gKiBAcGFyYW0gaWQgOiB0aGUgcHJvbUlkXG4gKiBAcGFyYW0gY2hhbm5lbHMgOiBhbiBhcnJheSBvZiBSVEMgY2hhbm5lbCBuYW1lcyB0byBvcGVuXG4gKi9cbmZ1bmN0aW9uIFBlZXIoZG5JZCwgcnRjLCBpZCwgY2hhbm5lbHMpe1xuXHR0aGlzLmRuID0gZDEoZG5JZCk7XG5cdHRoaXMuZG5JZCA9IGRuSWQ7XG5cdHRoaXMuaWQgPSBpZDtcblx0dGhpcy5jaGFubmVscyA9IGNoYW5uZWxzO1xuXHR0aGlzLnJ0YyA9IHJ0Yztcblx0dGhpcy5wZWVyID0gbnVsbDtcblxuXHR0aGlzLnN0cmVhbXMgPSBbXTtcblxuXHR0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xuXG5cdHRoaXMuX2Nvbm5lY3QoKTtcbn1cblxuLyoqIEluaXRpYXRlIGEgUlRDIGNvbm5lY3Rpb24gdG8gdGhpcyBQZWVyICovXG5QZWVyLnByb3RvdHlwZS5fY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLnN1YnNjcmlwdGlvbiA9IHRoaXMuZG4uc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAncnRjJywgZnVuYzogJ0Nvbm5lY3QnLCBvYmo6IHRoaXMuY2hhbm5lbHMsIGRhdGE6IHsgcHJvbUlEOiB0aGlzLmlkIH1cblx0fSwgZnVuY3Rpb24oZGl5YSwgZXJyLCBkYXRhKXtcblx0XHRpZihkYXRhKSB7XG5cdFx0XHRpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZU9mZmVyJykgdGhhdC5fY3JlYXRlUGVlcihkYXRhKTtcblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdSZW1vdGVJQ0VDYW5kaWRhdGUnKSB0aGF0Ll9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUoZGF0YSk7XG5cdFx0fVxuXHR9KTtcblxuXHR0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGlmKCF0aGF0LmNvbm5lY3RlZCAmJiAhdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpOyB9LCAxMDAwMCk7XG59O1xuXG4vKiogUmVjb25uZWN0cyB0aGUgUlRDIHBlZXIgKi9cblBlZXIucHJvdG90eXBlLl9yZWNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLmNsb3NlKCk7XG5cblx0dGhpcy5wZWVyID0gbnVsbDtcblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59O1xuXG52YXIgc2VydmVycyA9IHtcImljZVNlcnZlcnNcIjogW3tcInVybFwiOiBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIn1dfTtcblxuLyoqIENyZWF0ZXMgYSBSVENQZWVyQ29ubmVjdGlvbiBpbiByZXNwb25zZSB0byBhIFJlbW90ZU9mZmVyICovXG5QZWVyLnByb3RvdHlwZS5fY3JlYXRlUGVlciA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIHBlZXIgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oc2VydmVycywgIHttYW5kYXRvcnk6IHtEdGxzU3J0cEtleUFncmVlbWVudDogdHJ1ZSwgRW5hYmxlRHRsc1NydHA6IHRydWUsIE9mZmVyVG9SZWNlaXZlQXVkaW86IHRydWUsIE9mZmVyVG9SZWNlaXZlVmlkZW86dHJ1ZX19KTtcblx0dGhpcy5wZWVyID0gcGVlcjtcblxuXHR0aGlzLnN0cmVhbXMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG5cdFx0cGVlci5hZGRTdHJlYW0ocyk7XG5cdH0pO1xuXG5cdHBlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7c2RwOiBkYXRhLnNkcCwgdHlwZTogZGF0YS50eXBlfSkpO1xuXG5cdHBlZXIuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRcdHBlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKTtcblxuXHRcdHRoYXQuZG4ucmVxdWVzdCh7XG5cdFx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRcdGZ1bmM6ICdBbnN3ZXInLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRwcm9tSUQ6IGRhdGEucHJvbUlELFxuXHRcdFx0XHRwZWVySWQ6IGRhdGEucGVlcklkLFxuXHRcdFx0XHRzZHA6IHNlc3Npb25fZGVzY3JpcHRpb24uc2RwLFxuXHRcdFx0XHR0eXBlOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnR5cGVcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0ZnVuY3Rpb24oZXJyKXsgY29uc29sZS5sb2coZXJyKTsgfSxcblx0eydtYW5kYXRvcnknOiB7IE9mZmVyVG9SZWNlaXZlQXVkaW86IHRydWUsIE9mZmVyVG9SZWNlaXZlVmlkZW86IHRydWV9fSk7XG5cblx0cGVlci5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjb25uZWN0ZWQnKXtcblx0XHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHRcdGlmKHRoYXQuc3Vic2NyaXB0aW9uKSB0aGF0LnN1YnNjcmlwdGlvbi5jbG9zZSgpO1xuXHRcdH1cblx0XHRlbHNlIGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZGlzY29ubmVjdGVkJyl7XG5cdFx0XHRpZighdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpO1xuXHRcdH1cblx0fTtcblxuXHRwZWVyLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnSUNFQ2FuZGlkYXRlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiB0aGF0LmlkLFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25EYXRhQ2hhbm5lbCh0aGF0LmRuSWQsIGV2dC5jaGFubmVsKTtcblx0fTtcblxuXHRwZWVyLm9uYWRkc3RyZWFtID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0Y29uc29sZS5lcnJvcihcInNmdWRzZHVpZGZndWZkc3l3Z3dkc3V5Z2R3ISEhIVwiKTtcblx0XHR0aGF0LmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0dGhhdC5ydGMuX29uQWRkU3RyZWFtKHRoYXQuZG5JZCwgZXZ0LnN0cmVhbSk7XG5cdH07XG59O1xuXG5cblBlZXIucHJvdG90eXBlLl9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUgPSBmdW5jdGlvbihkYXRhKXtcblx0dHJ5IHtcblx0XHR2YXIgY2FuZGlkYXRlID0gbmV3IFJUQ0ljZUNhbmRpZGF0ZShkYXRhLmNhbmRpZGF0ZSk7XG5cdFx0dGhpcy5wZWVyLmFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGUsIGZ1bmN0aW9uKCl7fSxmdW5jdGlvbihlcnIpeyBjb25zb2xlLmVycm9yKGVycik7XHR9KTtcblx0fSBjYXRjaChlcnIpIHsgY29uc29sZS5lcnJvcihlcnIpOyB9XG59O1xuXG4vKiogU2VuZCB0aGUgbWFwcGluZ3MgZnJvbSBjaGFubmVsIG5hbWVzIHRvIHN0cmVhbSBJRHMgKi9cblBlZXIucHJvdG90eXBlLnNlbmRDaGFubmVsc1N0cmVhbXNNYXBwaW5ncyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmRuLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6XCJydGNcIixcblx0XHRmdW5jOlwiQ2hhbm5lbHNTdHJlYW1zTWFwcGluZ3NcIixcblx0XHRkYXRhOntwZWVySWQ6MCwgbWFwcGluZ3M6dGhpcy5ydGNbdGhpcy5kbklkXS5jaGFubmVsc0J5U3RyZWFtfVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cdFx0aWYoZXJyKSBjb25zb2xlLmVycm9yKGVycik7XG5cdH0pO1xufTtcblxuLyoqIEFkZHMgYSBsb2NhbCBzdHJlYW0gdG8gdGhpcyBQZWVyICovXG5QZWVyLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcblx0dGhpcy5zZW5kQ2hhbm5lbHNTdHJlYW1zTWFwcGluZ3MoKTtcblx0aWYoIXRoaXMuc3RyZWFtcy5maWx0ZXIoZnVuY3Rpb24ocyl7cmV0dXJuIHN0cmVhbS5pZCA9PT0gczt9KVswXSkgdGhpcy5zdHJlYW1zLnB1c2goc3RyZWFtKTtcblx0dGhpcy5fcmVjb25uZWN0KCk7XG59XG5cblBlZXIucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR0aGlzLnN0cmVhbXMgPSB0aGlzLnN0cmVhbXMuZmlsdGVyKGZ1bmN0aW9uKHMpe3JldHVybiBzdHJlYW0uaWQgIT09IHM7fSk7XG5cdGlmKHRoaXMucGVlcikgdGhpcy5wZWVyLnJlbW92ZVN0cmVhbShzdHJlYW0pO1xufVxuXG5QZWVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKHRoaXMuc3Vic2NyaXB0aW9uKSB0aGlzLnN1YnNjcmlwdGlvbi5jbG9zZSgpO1xuXHRjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dElkKTtcblx0aWYodGhpcy5wZWVyKXtcblx0XHR0cnl7XG5cdFx0XHR0aGlzLnBlZXIuY2xvc2UoKTtcblx0XHR9Y2F0Y2goZSl7fVxuXHRcdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5jbG9zZWQgPSB0cnVlO1xuXHR9XG59O1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBSVEMgc2VydmljZSBpbXBsZW1lbnRhdGlvbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG5mdW5jdGlvbiBSVEMoc2VsZWN0b3Ipe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcblxuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzID0gW107XG5cdHRoaXMuY2hhbm5lbHNCeVN0cmVhbSA9IFtdO1xufVxuXG5SVEMucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKG5hbWVfcmVnZXgsIHR5cGUsIG9uZGF0YWNoYW5uZWxfY2FsbGJhY2ssIG9uYWRkc3RyZWFtX2NhbGxiYWNrKXtcblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscy5wdXNoKHtyZWdleDogbmFtZV9yZWdleCwgdHlwZTp0eXBlLCBjYjogb25kYXRhY2hhbm5lbF9jYWxsYmFjaywgc3RyZWFtX2NiOiBvbmFkZHN0cmVhbV9jYWxsYmFja30pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKiBTdGFydCBsaXN0ZW5pbmcgdG8gUGVlcnMgY29ubmVjdGlvbnMuXG4gKiBBICdQZWVyJyBvYmplY3Qgd2lsbCBiZSBjcmVhdGVkIGZvciBlYWNoIERpeWFOb2RlIHBlZXJJZCBhbmQgZWFjaCBwcm9tSURcbiAqL1xuUlRDLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cblx0dGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLnNlbGVjdG9yLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogJ3J0YycsXG5cdFx0ZnVuYzogJ1BlZXJzJ1xuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXG5cdFx0aWYoIXRoYXRbZG5JZF0pIHRoYXQuX2NyZWF0ZURpeWFOb2RlKGRuSWQpO1xuXG5cdFx0aWYoZXJyID09PSAnU3Vic2NyaXB0aW9uQ2xvc2VkJyB8fCBlcnIgPT09ICdQZWVyRGlzY29ubmVjdGVkJyl7XG5cdFx0XHR0aGF0Ll9jbG9zZURpeWFOb2RlKGRuSWQpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHRpZihkYXRhICYmIGRhdGEuZXZlbnRUeXBlICYmIGRhdGEucHJvbUlEICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1BlZXJDb25uZWN0ZWQnKXtcblx0XHRcdFx0aWYoIXRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdKXtcblx0XHRcdFx0XHR2YXIgY2hhbm5lbHMgPSB0aGF0Ll9tYXRjaENoYW5uZWxzKGRuSWQsIGRhdGEuY2hhbm5lbHMpO1xuXHRcdFx0XHRcdGlmKGNoYW5uZWxzLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRcdFx0dGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0gPSBuZXcgUGVlcihkbklkLCB0aGF0LCBkYXRhLnByb21JRCwgY2hhbm5lbHMpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEF1dG9yZWNvbm5lY3QgZGVjbGFyZWQgc3RyZWFtc1xuXHRcdFx0XHRcdHRoYXQuY2hhbm5lbHNCeVN0cmVhbS5mb3JFYWNoKGZ1bmN0aW9uKGNicykge1xuXHRcdFx0XHRcdFx0dGhhdC5hZGRTdHJlYW0oY2JzLmNoYW5uZWwsIGNicy5tZWRpYVN0cmVhbSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0pIHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdLnNlbmRDaGFubmVsc1N0cmVhbXNNYXBwaW5ncygpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1BlZXJDbG9zZWQnKSB7XG5cdFx0XHRcdGlmKHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdKSB7XG5cdFx0XHRcdFx0dGhhdC5fY2xvc2VQZWVyKGRuSWQsIGRhdGEucHJvbUlEKTtcblx0XHRcdFx0XHRpZih0eXBlb2YgdGhhdC5vbmNsb3NlID09PSAnZnVuY3Rpb24nKSB0aGF0Lm9uY2xvc2UoZG5JZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LCB7YXV0bzogdHJ1ZX0pO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuUlRDLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc2VsZWN0b3IuZWFjaChmdW5jdGlvbihkbklkKXtcblx0XHRpZighdGhhdFtkbklkXSkgcmV0dXJuIDtcblx0XHRmb3IodmFyIHByb21JRCBpbiB0aGF0W2RuSWRdLnBlZXJzKXtcblx0XHRcdHRoYXQuX2Nsb3NlUGVlcihkbklkLCBwcm9tSUQpO1xuXHRcdH1cblx0fSk7XG5cblx0aWYodGhpcy5zdWJzY3JpcHRpb24pIHRoaXMuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuXG5SVEMucHJvdG90eXBlLl9jcmVhdGVEaXlhTm9kZSA9IGZ1bmN0aW9uKGRuSWQpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpc1tkbklkXSA9IHtcblx0XHRkbklkOiBkbklkLFxuXHRcdHVzZWRDaGFubmVsczogW10sXG5cdFx0cmVxdWVzdGVkQ2hhbm5lbHM6IFtdLFxuXHRcdHBlZXJzOiBbXSxcblx0XHRjaGFubmVsc0J5U3RyZWFtOiBbXVxuXHR9XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGMpe3RoYXRbZG5JZF0ucmVxdWVzdGVkQ2hhbm5lbHMucHVzaChjKX0pO1xufTtcblxuUlRDLnByb3RvdHlwZS5fY2xvc2VEaXlhTm9kZSA9IGZ1bmN0aW9uKGRuSWQpe1xuXHRmb3IodmFyIHByb21JRCBpbiB0aGlzW2RuSWRdLnBlZXJzKXtcblx0XHR0aGlzLl9jbG9zZVBlZXIoZG5JZCwgcHJvbUlEKTtcblx0fVxuXG5cdGRlbGV0ZSB0aGlzW2RuSWRdO1xufTtcblxuUlRDLnByb3RvdHlwZS5fY2xvc2VQZWVyID0gZnVuY3Rpb24oZG5JZCwgcHJvbUlEKXtcblx0aWYodGhpc1tkbklkXS5wZWVyc1twcm9tSURdKXtcblx0XHR2YXIgcCA9IHRoaXNbZG5JZF0ucGVlcnNbcHJvbUlEXTtcblx0XHRwLmNsb3NlKCk7XG5cblx0XHRmb3IodmFyIGk9MDtpPHAuY2hhbm5lbHMubGVuZ3RoOyBpKyspe1xuXHRcdFx0ZGVsZXRlIHRoaXNbZG5JZF0udXNlZENoYW5uZWxzW3AuY2hhbm5lbHNbaV1dO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzW2RuSWRdLnBlZXJzW3Byb21JRF07XG5cdH1cbn07XG5cbi8qKiBNYXRjaGVzIHRoZSBnaXZlbiByZWNlaXZlZENoYW5uZWxzIHByb3Bvc2VkIGJ5IHRoZSBnaXZlbiBEaXlhTm9kZSBwZWVySWRcbiAqICBhZ2FpbnN0IHRoZSByZXF1ZXN0ZWQgY2hhbm5lbHMgYW5kIGNyZWF0ZXMgYSBDaGFubmVsIGZvciBlYWNoIG1hdGNoXG4gKi9cblJUQy5wcm90b3R5cGUuX21hdGNoQ2hhbm5lbHMgPSBmdW5jdGlvbihkbklkLCByZWNlaXZlZENoYW5uZWxzKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBjaGFubmVscyA9IFtdO1xuXG5cdGZvcih2YXIgaSA9IDA7IGkgPCByZWNlaXZlZENoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgbmFtZSA9IHJlY2VpdmVkQ2hhbm5lbHNbaV07XG5cdFx0dmFyIHJlbW90ZVN0cmVhbUlkID0gbmFtZS5zcGxpdChcIl87Ol9cIilbMV07XG5cdFx0bmFtZSA9IG5hbWUuc3BsaXQoXCJfOzpfXCIpWzBdO1xuXG5cdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRoYXRbZG5JZF0ucmVxdWVzdGVkQ2hhbm5lbHMubGVuZ3RoOyBqKyspe1xuXHRcdFx0dmFyIHJlcSA9IHRoYXRbZG5JZF0ucmVxdWVzdGVkQ2hhbm5lbHNbal07XG5cblx0XHRcdGlmKG5hbWUgJiYgbmFtZS5tYXRjaChyZXEucmVnZXgpICYmICF0aGF0W2RuSWRdLnVzZWRDaGFubmVsc1tuYW1lXSl7XG5cdFx0XHRcdHZhciBjaGFubmVsID0gbmV3IENoYW5uZWwoZG5JZCwgbmFtZSwgcmVxLmNiLCByZXEuc3RyZWFtX2NiKTtcblx0XHRcdFx0dGhhdFtkbklkXS51c2VkQ2hhbm5lbHNbbmFtZV0gPSBjaGFubmVsO1xuXHRcdFx0XHRjaGFubmVscy5wdXNoKG5hbWUpO1xuXG5cdFx0XHRcdC8vIElmIGEgc3RyZWFtIGlkIGlzIHByb3ZpZGVkIGZvciB0aGUgY2hhbm5lbCwgcmVnaXN0ZXIgdGhlIG1hcHBpbmdcblx0XHRcdFx0aWYocmVtb3RlU3RyZWFtSWQpIHtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5zdHJlYW0gIT09IHJlbW90ZVN0cmVhbUlkICYmIGNicy5jaGFubmVsICE9PSBjaGFubmVsOyB9KTtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7c3RyZWFtOnJlbW90ZVN0cmVhbUlkLCBjaGFubmVsOmNoYW5uZWx9KTtcblx0XHRcdFx0XHRjaGFubmVsLnN0cmVhbUlkID0gc3RyZWFtSWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGxvY2FsU3RyZWFtSWQgPSB0aGF0LmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsID09PSBuYW1lOyB9KVswXTtcblx0XHRcdFx0aWYobG9jYWxTdHJlYW1JZCkge1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLnN0cmVhbSAhPT0gbG9jYWxTdHJlYW1JZCAmJiBjYnMuY2hhbm5lbCAhPT0gbmFtZTsgfSk7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLnB1c2goe3N0cmVhbTpsb2NhbFN0cmVhbUlkLCBjaGFubmVsOm5hbWV9KTtcblx0XHRcdFx0XHRjaGFubmVsLmxvY2FsU3RyZWFtSWQgPSBsb2NhbFN0cmVhbUlkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuICBjaGFubmVscztcbn07XG5cblxuLyoqIENhbGxlZCB1cG9uIFJUQyBkYXRhY2hhbm5lbHMgY29ubmVjdGlvbnMgKi9cblJUQy5wcm90b3R5cGUuX29uRGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkbklkLCBkYXRhY2hhbm5lbCl7XG5cdGlmKCF0aGlzW2RuSWRdKSByZXR1cm4gY29uc29sZS53YXJuKFwiVHJpZWQgdG8gb3BlbiBhIGRhdGEgY2hhbm5lbCBvbiBhIGNsb3NlZCBwZWVyXCIpO1xuXHR2YXIgY2hhbm5lbCA9IHRoaXNbZG5JZF0udXNlZENoYW5uZWxzW2RhdGFjaGFubmVsLmxhYmVsXTtcblxuXHRpZighY2hhbm5lbCl7XG5cdFx0Y29uc29sZS5sb2coXCJEYXRhY2hhbm5lbCBcIitkYXRhY2hhbm5lbC5sYWJlbCtcIiB1bm1hdGNoZWQsIGNsb3NpbmcgIVwiKTtcblx0XHRkYXRhY2hhbm5lbC5jbG9zZSgpO1xuXHRcdHJldHVybiA7XG5cdH1cblx0Y2hhbm5lbC5zZXREYXRhQ2hhbm5lbChkYXRhY2hhbm5lbCk7XG59O1xuXG4vKiogQ2FsbGVkIHVwb24gUlRDIHN0cmVhbSBjaGFubmVsIGNvbm5lY3Rpb25zICovXG5SVEMucHJvdG90eXBlLl9vbkFkZFN0cmVhbSA9IGZ1bmN0aW9uKGRuSWQsIHN0cmVhbSkge1xuXHRpZighdGhpc1tkbklkXSkgcmV0dXJuIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIG9wZW4gYSBzdHJlYW0gb24gYSBjbG9zZWQgcGVlclwiKTtcblxuXHR2YXIgY2hhbm5lbCA9IHRoaXNbZG5JZF0udXNlZENoYW5uZWxzW3N0cmVhbS5pZF07XG5cblx0aWYoIWNoYW5uZWwpe1xuXHRcdGNvbnNvbGUud2FybihcIlN0cmVhbSBDaGFubmVsIFwiKyBzdHJlYW0uaWQgK1wiIHVubWF0Y2hlZCwgY2xvc2luZyAhXCIpO1xuXHRcdHN0cmVhbS5jbG9zZSgpO1xuXHRcdHJldHVybiA7XG5cdH1cblx0Y2hhbm5lbC5vbkFkZFN0cmVhbShzdHJlYW0pO1xufTtcblxuLyoqIEFkZCBhIGxvY2FsIHN0cmVhbSB0byBiZSBzZW50IHRocm91Z2ggdGhlIGdpdmVuIFJUQyBjaGFubmVsICovXG5SVEMucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKGNoYW5uZWwsIHN0cmVhbSkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0Ly8gUmVnaXN0ZXIgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZ1xuXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGlzLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG4gXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7Y2hhbm5lbDpjaGFubmVsLCBzdHJlYW06c3RyZWFtLmlkLCBtZWRpYVN0cmVhbTpzdHJlYW19KTtcblxuXHRjb25zb2xlLmxvZyhcIk9wZW4gbG9jYWwgc3RyZWFtIFwiICsgY2hhbm5lbCk7XG5cblx0Ly8gU2VuZCB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nIHRvIGFsbCBjb25uZWN0ZWQgUGVlcnNcblx0dGhpcy5zZWxlY3Rvci5lYWNoKGZ1bmN0aW9uKGRuSWQpe1xuXHRcdGlmKCF0aGF0W2RuSWRdKSByZXR1cm4gO1xuXHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcblx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7Y2hhbm5lbDpjaGFubmVsLCBzdHJlYW06c3RyZWFtLmlkfSk7XG5cdFx0Zm9yKHZhciBwcm9tSUQgaW4gdGhhdFtkbklkXS5wZWVycyl7XG5cdFx0XHR0aGF0W2RuSWRdLnBlZXJzW3Byb21JRF0uYWRkU3RyZWFtKHN0cmVhbSk7XG5cdFx0fVxuXHR9KTtcblxufTtcblxuUlRDLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihjaGFubmVsLCBzdHJlYW0pIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8vIFJlZ2lzdGVyIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmdcblx0dGhpcy5jaGFubmVsc0J5U3RyZWFtID0gdGhpcy5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuXG5cdGNvbnNvbGUubG9nKFwiQ2xvc2UgbG9jYWwgc3RyZWFtIFwiICsgY2hhbm5lbCk7XG5cblx0Ly8gU2VuZCB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nIHRvIGFsbCBjb25uZWN0ZWQgUGVlcnNcblx0dGhpcy5zZWxlY3Rvci5lYWNoKGZ1bmN0aW9uKGRuSWQpe1xuXHRcdGlmKCF0aGF0W2RuSWRdKSByZXR1cm4gO1xuXHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcblx0XHRmb3IodmFyIHByb21JRCBpbiB0aGF0W2RuSWRdLnBlZXJzKXtcblx0XHRcdHRoYXRbZG5JZF0ucGVlcnNbcHJvbUlEXS5yZW1vdmVTdHJlYW0oc3RyZWFtKTtcblx0XHR9XG5cdH0pO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5ydGMgPSBmdW5jdGlvbigpeyByZXR1cm4gbmV3IFJUQyh0aGlzKTt9O1xuIiwiLyogbWF5YS1jbGllbnRcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqXHQzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IHRydWU7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8qKlxuICpcdGNhbGxiYWNrIDogZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1vZGVsIHVwZGF0ZWRcbiAqICovXG5mdW5jdGlvbiBTdGF0dXMoc2VsZWN0b3Ipe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0dGhpcy5fY29kZXIgPSBzZWxlY3Rvci5lbmNvZGUoKTtcblx0dGhpcy5zdWJzY3JpcHRpb25zID0gW107XG5cblx0LyoqIG1vZGVsIG9mIHJvYm90IDogYXZhaWxhYmxlIHBhcnRzIGFuZCBzdGF0dXMgKiovXG5cdHRoaXMucm9ib3RNb2RlbCA9IFtdO1xuXHR0aGlzLl9yb2JvdE1vZGVsSW5pdCA9IGZhbHNlO1xuXG5cdC8qKiogc3RydWN0dXJlIG9mIGRhdGEgY29uZmlnICoqKlxuXHRcdCBjcml0ZXJpYSA6XG5cdFx0ICAgdGltZTogYWxsIDMgdGltZSBjcml0ZXJpYSBzaG91bGQgbm90IGJlIGRlZmluZWQgYXQgdGhlIHNhbWUgdGltZS4gKHJhbmdlIHdvdWxkIGJlIGdpdmVuIHVwKVxuXHRcdCAgICAgYmVnOiB7W251bGxdLHRpbWV9IChudWxsIG1lYW5zIG1vc3QgcmVjZW50KSAvLyBzdG9yZWQgYSBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIGVuZDoge1tudWxsXSwgdGltZX0gKG51bGwgbWVhbnMgbW9zdCBvbGRlc3QpIC8vIHN0b3JlZCBhcyBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIHJhbmdlOiB7W251bGxdLCB0aW1lfSAocmFuZ2Ugb2YgdGltZShwb3NpdGl2ZSkgKSAvLyBpbiBzIChudW0pXG5cdFx0ICAgcm9ib3Q6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgICBwbGFjZToge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCBvcGVyYXRvcjoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfSAtKCBtYXliZSBtb3kgc2hvdWxkIGJlIGRlZmF1bHRcblx0XHQgLi4uXG5cblx0XHQgcGFydHMgOiB7W251bGxdIG9yIEFycmF5T2YgUGFydHNJZH0gdG8gZ2V0IGVycm9yc1xuXHRcdCBzdGF0dXMgOiB7W251bGxdIG9yIEFycmF5T2YgU3RhdHVzTmFtZX0gdG8gZ2V0IHN0YXR1c1xuXG5cdFx0IHNhbXBsaW5nOiB7W251bGxdIG9yIGludH1cblx0Ki9cblx0dGhpcy5kYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7XG5cdFx0XHRcdGJlZzogbnVsbCxcblx0XHRcdFx0ZW5kOiBudWxsLFxuXHRcdFx0XHRyYW5nZTogbnVsbCAvLyBpbiBzXG5cdFx0XHR9LFxuXHRcdFx0cm9ib3Q6IG51bGxcblx0XHR9LFxuXHRcdG9wZXJhdG9yOiAnbGFzdCcsXG5cdFx0cGFydHM6IG51bGwsXG5cdFx0c3RhdHVzOiBudWxsXG5cdH07XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuLyoqXG4gKiBHZXQgcm9ib3RNb2RlbCA6XG4gKiB7XG4gKiAgcGFydHM6IHtcbiAqXHRcdFwicGFydFhYXCI6IHtcbiAqIFx0XHRcdCBlcnJvcnNEZXNjcjogeyBlbmNvdW50ZXJlZCBlcnJvcnMgaW5kZXhlZCBieSBlcnJvcklkcz4wIH1cbiAqXHRcdFx0XHQ+IENvbmZpZyBvZiBlcnJvcnMgOlxuICpcdFx0XHRcdFx0Y3JpdExldmVsOiBGTE9BVCwgLy8gY291bGQgYmUgaW50Li4uXG4gKiBcdFx0XHRcdFx0bXNnOiBTVFJJTkcsXG4gKlx0XHRcdFx0XHRzdG9wU2VydmljZUlkOiBTVFJJTkcsXG4gKlx0XHRcdFx0XHRydW5TY3JpcHQ6IFNlcXVlbGl6ZS5TVFJJTkcsXG4gKlx0XHRcdFx0XHRtaXNzaW9uTWFzazogU2VxdWVsaXplLklOVEVHRVIsXG4gKlx0XHRcdFx0XHRydW5MZXZlbDogU2VxdWVsaXplLklOVEVHRVJcbiAqXHRcdFx0ZXJyb3I6W0ZMT0FULCAuLi5dLCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqXHRcdFx0dGltZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJvYm90OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0Ly8vIHBsYWNlOltGTE9BVCwgLi4uXSwgbm90IGltcGxlbWVudGVkIHlldFxuICpcdFx0fSxcbiAqXHQgXHQuLi4gKFwiUGFydFlZXCIpXG4gKiAgfSxcbiAqICBzdGF0dXM6IHtcbiAqXHRcdFwic3RhdHVzWFhcIjoge1xuICpcdFx0XHRcdGRhdGE6W0ZMT0FULCAuLi5dLCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqXHRcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0XHRyb2JvdDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdFx0Ly8vIHBsYWNlOltGTE9BVCwgLi4uXSwgbm90IGltcGxlbWVudGVkIHlldFxuICpcdFx0XHRcdHJhbmdlOiBbRkxPQVQsIEZMT0FUXSxcbiAqXHRcdFx0XHRsYWJlbDogc3RyaW5nXG4gKlx0XHRcdH0sXG4gKlx0IFx0Li4uIChcIlN0YXR1c1lZXCIpXG4gKiAgfVxuICogfVxuICovXG5TdGF0dXMucHJvdG90eXBlLmdldFJvYm90TW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5yb2JvdE1vZGVsO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YUNvbmZpZyBjb25maWcgZm9yIGRhdGEgcmVxdWVzdFxuICogaWYgZGF0YUNvbmZpZyBpcyBkZWZpbmUgOiBzZXQgYW5kIHJldHVybiB0aGlzXG4gKlx0IEByZXR1cm4ge1N0YXR1c30gdGhpc1xuICogZWxzZVxuICpcdCBAcmV0dXJuIHtPYmplY3R9IGN1cnJlbnQgZGF0YUNvbmZpZ1xuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFDb25maWcgPSBmdW5jdGlvbihuZXdEYXRhQ29uZmlnKXtcblx0aWYobmV3RGF0YUNvbmZpZykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZz1uZXdEYXRhQ29uZmlnO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnO1xufTtcbi8qKlxuICogVE8gQkUgSU1QTEVNRU5URUQgOiBvcGVyYXRvciBtYW5hZ2VtZW50IGluIEROLVN0YXR1c1xuICogQHBhcmFtICB7U3RyaW5nfVx0IG5ld09wZXJhdG9yIDoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfVxuICogQHJldHVybiB7U3RhdHVzfSB0aGlzIC0gY2hhaW5hYmxlXG4gKiBTZXQgb3BlcmF0b3IgY3JpdGVyaWEuXG4gKiBEZXBlbmRzIG9uIG5ld09wZXJhdG9yXG4gKlx0QHBhcmFtIHtTdHJpbmd9IG5ld09wZXJhdG9yXG4gKlx0QHJldHVybiB0aGlzXG4gKiBHZXQgb3BlcmF0b3IgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7U3RyaW5nfSBvcGVyYXRvclxuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFPcGVyYXRvciA9IGZ1bmN0aW9uKG5ld09wZXJhdG9yKXtcblx0aWYobmV3T3BlcmF0b3IpIHtcblx0XHR0aGlzLmRhdGFDb25maWcub3BlcmF0b3IgPSBuZXdPcGVyYXRvcjtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvcjtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gbnVtU2FtcGxlc1xuICogQHBhcmFtIHtpbnR9IG51bWJlciBvZiBzYW1wbGVzIGluIGRhdGFNb2RlbFxuICogaWYgZGVmaW5lZCA6IHNldCBudW1iZXIgb2Ygc2FtcGxlc1xuICpcdEByZXR1cm4ge1N0YXR1c30gdGhpc1xuICogZWxzZVxuICpcdEByZXR1cm4ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXNcbiAqKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YVNhbXBsaW5nID0gZnVuY3Rpb24obnVtU2FtcGxlcyl7XG5cdGlmKG51bVNhbXBsZXMpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuc2FtcGxpbmcgPSBudW1TYW1wbGVzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLnNhbXBsaW5nO1xufTtcbi8qKlxuICogU2V0IG9yIGdldCBkYXRhIHRpbWUgY3JpdGVyaWEgYmVnIGFuZCBlbmQuXG4gKiBJZiBwYXJhbSBkZWZpbmVkXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lQmVnIC8vIG1heSBiZSBudWxsXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lRW5kIC8vIG1heSBiZSBudWxsXG4gKlx0QHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBJZiBubyBwYXJhbSBkZWZpbmVkOlxuICpcdEByZXR1cm4ge09iamVjdH0gVGltZSBvYmplY3Q6IGZpZWxkcyBiZWcgYW5kIGVuZC5cbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhVGltZSA9IGZ1bmN0aW9uKG5ld1RpbWVCZWcsbmV3VGltZUVuZCwgbmV3UmFuZ2Upe1xuXHRpZihuZXdUaW1lQmVnIHx8IG5ld1RpbWVFbmQgfHwgbmV3UmFuZ2UpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5iZWcgPSBuZXdUaW1lQmVnLmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5lbmQgPSBuZXdUaW1lRW5kLmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5yYW5nZSA9IG5ld1JhbmdlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4ge1xuXHRcdFx0YmVnOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5iZWcpLFxuXHRcdFx0ZW5kOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5lbmQpLFxuXHRcdFx0cmFuZ2U6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlKVxuXHRcdH07XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHJvYm90SWRzXG4gKiBTZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSByb2JvdElkcyBsaXN0IG9mIHJvYm90IElkc1xuICogR2V0IHJvYm90IGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YVJvYm90SWRzID0gZnVuY3Rpb24ocm9ib3RJZHMpe1xuXHRpZihyb2JvdElkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5yb2JvdCA9IHJvYm90SWRzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90O1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBwbGFjZUlkcyAvLyBub3QgcmVsZXZhbnQ/LCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKiBTZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSBwbGFjZUlkcyBsaXN0IG9mIHBsYWNlIElkc1xuICogR2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2YgcGxhY2UgSWRzXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YVBsYWNlSWRzID0gZnVuY3Rpb24ocGxhY2VJZHMpe1xuXHRpZihwbGFjZUlkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZUlkID0gcGxhY2VJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2U7XG59O1xuLyoqXG4gKiBHZXQgZGF0YSBieSBzZW5zb3IgbmFtZS5cbiAqXHRAcGFyYW0ge0FycmF5W1N0cmluZ119IHNlbnNvck5hbWUgbGlzdCBvZiBzZW5zb3JzXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0RGF0YUJ5TmFtZSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzKXtcblx0dmFyIGRhdGE9W107XG5cdGZvcih2YXIgbiBpbiBzZW5zb3JOYW1lcykge1xuXHRcdGRhdGEucHVzaCh0aGlzLmRhdGFNb2RlbFtzZW5zb3JOYW1lc1tuXV0pO1xuXHR9XG5cdHJldHVybiBkYXRhO1xufTtcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gZXJyb3Ivc3RhdHVzIHVwZGF0ZXNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKHJvYm90TmFtZXMsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHQvLyBjb25zb2xlLmxvZyhyb2JvdE5hbWVzKTtcblxuXHR2YXIgc3VicyA9IHRoaXMuc2VsZWN0b3Iuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAnc3RhdHVzJyxcblx0XHRmdW5jOiAnU3RhdHVzJyxcblx0XHRkYXRhOiByb2JvdE5hbWVzXG5cdH0sIGZ1bmN0aW9uIChwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdC8vIGNvbnNvbGUubG9nKHBlZXJJZCk7XG5cdFx0Ly8gY29uc29sZS5sb2coZXJyKTtcblx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRpZiAoZXJyIHx8IChkYXRhJiZkYXRhLmVyciZkYXRhLmVyci5zdCkgKSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoIFwiU3RhdHVzU3Vic2NyaWJlOlwiKyhlcnI/ZXJyOlwiXCIpK1wiXFxuXCIrKGRhdGEmJmRhdGEuZXJyP2RhdGEuZXJyOlwiXCIpICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKGRhdGEgJiYgZGF0YS5oZWFkZXJcblx0XHRcdCAgICYmIGRhdGEuaGVhZGVyLnR5cGUgPT09IFwiaW5pdFwiKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpc2F0aW9uIG9mIHJvYm90IG1vZGVsXG5cdFx0XHRcdHRoYXQucm9ib3RNb2RlbEluaXQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRpZih0aGF0LnJvYm90TW9kZWxJbml0KSB7XG5cdFx0XHRcdHRoYXQuX2dldFJvYm90TW9kZWxGcm9tUmVjdjIoZGF0YSk7XG5cdFx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJylcblx0XHRcdFx0XHRjYWxsYmFjayh0aGF0LnJvYm90TW9kZWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdC8vIEVycm9yXG5cdFx0XHRcdExvZ2dlci5lcnJvcihcIlJvYm90IG1vZGVsIGhhcyBub3QgYmVlbiBpbml0aWFsaXNlZCwgY2Fubm90IGJlIHVwZGF0ZWRcIik7XG5cdFx0XHRcdC8vLyBUT0RPIHVuc3Vic2NyaWJlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LCB7IGF1dG86IHRydWUgfSk7XG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnMpO1xufTtcblxuLyoqXG4gKiBDbG9zZSBhbGwgc3Vic2NyaXB0aW9uc1xuICovXG5TdGF0dXMucHJvdG90eXBlLmNsb3NlU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgaSBpbiB0aGlzLnN1YnNjcmlwdGlvbnMpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaV0uY2xvc2UoKTtcblx0fVxuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPVtdO1xufTtcblxuXG4vKipcbiAqIEdldCBkYXRhIGdpdmVuIGRhdGFDb25maWcuXG4gKiBAcGFyYW0ge2Z1bmN9IGNhbGxiYWNrIDogY2FsbGVkIGFmdGVyIHVwZGF0ZVxuICogVE9ETyBVU0UgUFJPTUlTRVxuICovXG5TdGF0dXMucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbihjYWxsYmFjaywgZGF0YUNvbmZpZyl7XG5cdHZhciB0aGF0PXRoaXM7XG5cdHZhciBkYXRhTW9kZWwgPSB7fTtcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwic3RhdHVzXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJzcGxSZXFcIixcblx0XHRcdGRhdGFDb25maWc6IHRoYXQuZGF0YUNvbmZpZ1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIltcIit0aGF0LmRhdGFDb25maWcuc2Vuc29ycytcIl0gUmVjdiBlcnI6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiVXBkYXRlRGF0YTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5yZXFDb25maWcpKTtcblx0XHRcdExvZ2dlci5lcnJvcihcIkRhdGEgcmVxdWVzdCBmYWlsZWQgKFwiK2RhdGEuaGVhZGVyLmVycm9yLnN0K1wiKTogXCIrZGF0YS5oZWFkZXIuZXJyb3IubXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly9Mb2dnZXIubG9nKEpTT04uc3RyaW5naWZ5KHRoYXQuZGF0YU1vZGVsKSk7XG5cdFx0ZGF0YU1vZGVsID0gdGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHRMb2dnZXIubG9nKHRoYXQuZ2V0RGF0YU1vZGVsKCkpO1xuXG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoYXQpOyAvLyBiaW5kIGNhbGxiYWNrIHdpdGggU3RhdHVzXG5cdFx0Y2FsbGJhY2soZGF0YU1vZGVsKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHR9KTtcbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgcm9ib3QgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhICh2ZXJzaW9uIDIpXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuX2dldFJvYm90TW9kZWxGcm9tUmVjdjIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHJvYm90O1xuXHR2YXIgZGF0YVJvYm90cyA9IGRhdGEucm9ib3RzO1xuXHR2YXIgZGF0YVBhcnRzID0gZGF0YS5wYXJ0TGlzdDtcblxuXHRpZighdGhpcy5yb2JvdE1vZGVsKVxuXHRcdHRoaXMucm9ib3RNb2RlbCA9IFtdO1xuXHQvLyBjb25zb2xlLmxvZyhcIl9nZXRSb2JvdE1vZGVsRnJvbVJlY3ZcIik7XG5cdC8vIGNvbnNvbGUubG9nKHRoaXMucm9ib3RNb2RlbCk7XG5cblx0LyoqIE9ubHkgb25lIHJvYm90IGlzIG1hbmFnZSBhdCB0aGUgc2FtZSB0aW1lIGN1cnJlbnRseSAqKi9cblx0Zm9yKHZhciBuIGluIGRhdGFSb2JvdHMpIHtcblx0XHRpZighdGhpcy5yb2JvdE1vZGVsW25dKVxuXHRcdFx0dGhpcy5yb2JvdE1vZGVsW25dPXt9O1xuXHRcdHRoaXMucm9ib3RNb2RlbFtuXS5yb2JvdCA9IGRhdGFSb2JvdHNbbl0ucm9ib3Q7XG5cblx0XHQvLyBpZih0aGlzLnJvYm90TW9kZWwubGVuZ3RoPGRhdGEubGVuZ3RoKSB7XG5cdFx0Ly8gXHR0aGlzLnJvYm90TW9kZWwucHVzaCh7cm9ib3Q6IGRhdGFbMF0ucm9ib3RzfSk7XG5cdFx0Ly8gfVxuXG5cdFx0LyoqIGV4dHJhY3QgcGFydHMgaW5mbyAqKi9cblx0XHRpZihkYXRhUm9ib3RzW25dICYmIGRhdGFSb2JvdHNbbl0ucGFydHMpIHtcblx0XHRcdGlmKCF0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMpXG5cdFx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cyA9IHt9O1xuXHRcdFx0dmFyIHBhcnRzID0gZGF0YVJvYm90c1tuXS5wYXJ0cztcblx0XHRcdHZhciByUGFydHMgPSB0aGlzLnJvYm90TW9kZWxbbl0ucGFydHM7XG5cdFx0XHQvLyBmb3IodmFyIHEgaW4gclBhcnRzKSB7XG5cdFx0XHQvLyBcdC8qKiBwYXJ0W3FdIHdhcyBub3Qgc2VudCBiZWNhdXNlIG5vIGVycm9yICoqL1xuXHRcdFx0Ly8gXHRpZighcGFydHNbcV1cblx0XHRcdC8vIFx0ICAgJiZyUGFydHNbcV0uZXZ0cyYmclBhcnRzW3FdLmV2dHMuY29kZSkge1xuXHRcdFx0Ly8gXHRcdHJQYXJ0c1txXS5ldnRzID0ge1xuXHRcdFx0Ly8gXHRcdFx0Y29kZTogMCxcblx0XHRcdC8vIFx0XHRcdGNvZGVSZWY6IDAsXG5cdFx0XHQvLyBcdFx0XHR0aW1lOiBEYXRlLm5vdygpIC8qKiB1cGRhdGUgKiovXG5cdFx0XHQvLyBcdFx0fTtcblx0XHRcdC8vIFx0fVxuXHRcdFx0Ly8gfVxuXHRcdFx0Zm9yICh2YXIgcCBpbiBwYXJ0cykge1xuXHRcdFx0XHRpZighclBhcnRzW3BdKSB7XG5cdFx0XHRcdFx0clBhcnRzW3BdPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHBhcnRzW3BdKSB7XG5cdFx0XHRcdFx0Ly8gTG9nZ2VyLmxvZyhuKTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBjYXRlZ29yeSAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5jYXRlZ29yeT1kYXRhUGFydHNbcF0uY2F0ZWdvcnk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbmFtZSAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5uYW1lPWRhdGFQYXJ0c1twXS5uYW1lO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGxhYmVsICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmxhYmVsPWRhdGFQYXJ0c1twXS5sYWJlbDtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZXJyb3IgdGltZSAqL1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXS5lcnJvcnMudGltZSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coclBhcnRzW3BdLnRpbWUpO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciAqL1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy5jb2RlKTtcblxuXHRcdFx0XHRcdC8qKiB1cGRhdGUgZXJyb3JMaXN0ICoqL1xuXHRcdFx0XHRcdGlmKCFyUGFydHNbcF0uZXJyb3JMaXN0KVxuXHRcdFx0XHRcdFx0clBhcnRzW3BdLmVycm9yTGlzdD17fTtcblx0XHRcdFx0XHRmb3IoIHZhciBlbCBpbiBkYXRhUGFydHNbcF0uZXJyb3JMaXN0IClcblx0XHRcdFx0XHRcdGlmKCFyUGFydHNbcF0uZXJyb3JMaXN0W2VsXSlcblx0XHRcdFx0XHRcdFx0clBhcnRzW3BdLmVycm9yTGlzdFtlbF0gPSBkYXRhUGFydHNbcF0uZXJyb3JMaXN0W2VsXTtcblxuXHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzID0ge1xuXHRcdFx0XHRcdFx0Y29kZTogcGFydHNbcF0uY29kZSxcblx0XHRcdFx0XHRcdGNvZGVSZWY6IHBhcnRzW3BdLmNvZGVSZWYsXG5cdFx0XHRcdFx0XHR0aW1lOiBwYXJ0c1twXS50aW1lXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ3BhcnRzLCByUGFydHMnKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0cyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiTm8gcGFydHMgdG8gcmVhZCBmb3Igcm9ib3QgXCIrZGF0YVtuXS5uYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgcm9ib3QgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuX2dldFJvYm90TW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgcm9ib3Q7XG5cblx0aWYoIXRoaXMucm9ib3RNb2RlbClcblx0XHR0aGlzLnJvYm90TW9kZWwgPSBbXTtcblx0Ly8gY29uc29sZS5sb2coXCJfZ2V0Um9ib3RNb2RlbEZyb21SZWN2XCIpO1xuXHQvLyBjb25zb2xlLmxvZyh0aGlzLnJvYm90TW9kZWwpO1xuXG5cdC8qKiBPbmx5IG9uZSByb2JvdCBpcyBtYW5hZ2UgYXQgdGhlIHNhbWUgdGltZSBjdXJyZW50bHkgKiovXG5cdGZvcih2YXIgbiBpbiBkYXRhKSB7XG5cdFx0aWYoIXRoaXMucm9ib3RNb2RlbFtuXSlcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXT17fTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucm9ib3QgPSBkYXRhW25dLnJvYm90O1xuXG5cdFx0Ly8gaWYodGhpcy5yb2JvdE1vZGVsLmxlbmd0aDxkYXRhLmxlbmd0aCkge1xuXHRcdC8vIFx0dGhpcy5yb2JvdE1vZGVsLnB1c2goe3JvYm90OiBkYXRhWzBdLnJvYm90c30pO1xuXHRcdC8vIH1cblxuXHRcdC8qKiBleHRyYWN0IHBhcnRzIGluZm8gKiovXG5cdFx0aWYoZGF0YVtuXSAmJiBkYXRhW25dLnBhcnRzKSB7XG5cdFx0XHRpZighdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzKVxuXHRcdFx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMgPSB7fTtcblx0XHRcdHZhciBwYXJ0cyA9IGRhdGFbbl0ucGFydHM7XG5cdFx0XHR2YXIgclBhcnRzID0gdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzO1xuXHRcdFx0Zm9yKHZhciBxIGluIHJQYXJ0cykge1xuXHRcdFx0XHQvKiogcGFydFtxXSB3YXMgbm90IHNlbnQgYmVjYXVzZSBubyBlcnJvciAqKi9cblx0XHRcdFx0aWYoIXBhcnRzW3FdXG5cdFx0XHRcdCAgICYmclBhcnRzW3FdLmV2dHMmJnJQYXJ0c1txXS5ldnRzLmNvZGUpIHtcblx0XHRcdFx0XHRyUGFydHNbcV0uZXZ0cyA9IHtcblx0XHRcdFx0XHRcdGNvZGU6IFswXSxcblx0XHRcdFx0XHRcdGNvZGVSZWY6IFswXSxcblx0XHRcdFx0XHRcdHRpbWU6IFtEYXRlLm5vdygpXSAvKiogdXBkYXRlICoqL1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHAgaW4gcGFydHMpIHtcblx0XHRcdFx0aWYocGFydHNbcF0mJnBhcnRzW3BdLmVyciAmJiBwYXJ0c1twXS5lcnIuc3Q+MCkge1xuXHRcdFx0XHRcdExvZ2dlci5lcnJvcihcIlBhcnRzIFwiK3ArXCIgd2FzIGluIGVycm9yOiBcIitkYXRhW3BdLmVyci5tc2cpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFyUGFydHNbcF0pIHtcblx0XHRcdFx0XHRyUGFydHNbcF09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocGFydHNbcF0pIHtcblx0XHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGNhdGVnb3J5ICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmNhdGVnb3J5PXBhcnRzW3BdLmNhdGVnb3J5O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IG5hbWUgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubmFtZT1wYXJ0c1twXS5uYW1lO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGxhYmVsICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmxhYmVsPXBhcnRzW3BdLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciB0aW1lICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0pO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy50aW1lKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0udGltZSk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLmNvZGUpO1xuXG5cdFx0XHRcdFx0LyoqIHVwZGF0ZSBlcnJvckxpc3QgKiovXG5cdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3QpXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0PXt9O1xuXHRcdFx0XHRcdGZvciggdmFyIGVsIGluIHBhcnRzW3BdLmVycm9yTGlzdCApXG5cdFx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdFtlbF0pXG5cdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3RbZWxdID0gcGFydHNbcF0uZXJyb3JMaXN0W2VsXTtcblxuXHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzID0ge1xuXHRcdFx0XHRcdFx0Y29kZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGUpLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGVSZWYpLFxuXHRcdFx0XHRcdFx0dGltZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLnRpbWUpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ3BhcnRzLCByUGFydHMnKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0cyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiTm8gcGFydHMgdG8gcmVhZCBmb3Igcm9ib3QgXCIrZGF0YVtuXS5uYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKiBjcmVhdGUgU3RhdHVzIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLlN0YXR1cyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgU3RhdHVzKHRoaXMpO1xufTtcblxuLyoqXG4gKiBTZXQgb24gc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGZpbmQgc3RhdHVzIHRvIG1vZGlmeVxuICogQHBhcmFtIHBhcnROYW1lIFx0dG8gZmluZCBzdGF0dXMgdG8gbW9kaWZ5XG4gKiBAcGFyYW0gY29kZVx0XHRuZXdDb2RlXG4gKiBAcGFyYW0gY2FsbGJhY2tcdFx0cmV0dXJuIGNhbGxiYWNrICg8Ym9vbD5zdWNjZXNzKVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnNldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNvZGUsIHNvdXJjZSwgY2FsbGJhY2spIHtcblx0dmFyIGZ1bmNOYW1lID0gXCJTZXRTdGF0dXNfXCIrcGFydE5hbWU7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6ZnVuY05hbWUsZGF0YToge3JvYm90TmFtZTogcm9ib3ROYW1lLCBzdGF0dXNDb2RlOiBjb2RlLCBzb3VyY2U6IHNvdXJjZXwxfX0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2sodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEdldCBvbmUgc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBwYXJ0TmFtZSBcdHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBjYWxsYmFja1x0XHRyZXR1cm4gY2FsbGJhY2soLTEgaWYgbm90IGZvdW5kL2RhdGEgb3RoZXJ3aXNlKVxuICogQHBhcmFtIF9mdWxsIFx0bW9yZSBkYXRhIGFib3V0IHN0YXR1c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNhbGxiYWNrLCBfZnVsbCkge1xuXHR2YXIgZnVsbD1fZnVsbHx8ZmFsc2U7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6XCJHZXRTdGF0dXNcIixkYXRhOiB7cm9ib3ROYW1lOiByb2JvdE5hbWUsIHBhcnROYW1lOiBwYXJ0TmFtZSwgZnVsbDogZnVsbH19LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjaygtMSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGRhdGEpO1xuXHRcdFx0fVxuXHRcdH0pO1xufTtcbiIsIi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgY2hhbm5lbCBlbmNvZGluZ1xuICogLSBiYXNlNjQgY29kaW5nXG4gKiAtIG5vbmVcbiAqIERhdGEgZm9ybWF0IDpcbiAqXHRcdHQ6IHsnYjY0Jywnbm9uZSd9XG4gKlx0XHRiOiA8aWYgYjY0PiB7NCw4fVxuICpcdFx0ZDogZW5jb2RlZCBkYXRhIHtidWZmZXIgb3IgQXJyYXl9XG4gKlx0XHRzOiBzaXplXG4gKi9cblxuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2UtNjQnKTtcblxuLyoqXG4gKiBEZWZhdWx0IDogbm8gZW5jb2RpbmdcbiAqIEVmZmVjdGl2ZSBmb3Igc3RyaW5nIGJhc2VkIGNoYW5uZWxzIChsaWtlIEpTT04gYmFzZWQgV1MpXG4gKiAqL1xuZnVuY3Rpb24gTm9Db2RpbmcoKXtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQ29udmVydCBidWZmZXIgY29kZWQgaW4gYmFzZTY0IGFuZCBjb250YWluaW5nIG51bWJlcnMgY29kZWQgYnlcbiogYnl0ZUNvZGluZyBieXRlcyBpbnRvIGFycmF5XG4qIEBwYXJhbSBidWZmZXIgaW4gYmFzZTY0XG4qIEBwYXJhbSBieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBudW1iZXIgKDQgb3IgOClcbiogQHJldHVybiBhcnJheSBvZiBmbG9hdCAoMzIgb3IgNjQpLiBudWxsIGlmIGNvdWxkIG5vdCBjb252ZXJ0LlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHRyZXR1cm4gZGF0YS5kO1xufTtcblxuLyoqXG4qIENvbnZlcnQgYXJyYXkgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5IGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBidWZmZXIgY29kZWQgaW4gYmFzZTY0XG4qIEBwYXJhbSBcdHtBcnJheTxGbG9hdD59IFx0YXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0IGJpdHMpXG4qIEBwYXJhbSBcdHtpbnRlZ2VyfSBcdGJ5dGVDb2RpbmcgbnVtYmVyIG9mIGJ5dGVzIGZvciBlYWNoIGZsb2F0ICg0IG9yIDgpXG4qIEByZXR1cm4gIFx0e1N0cmluZ30gXHRidWZmZXIgaW4gYmFzZTY0LiBudWxsIGlmIGNvdWxkIG5vdCBjb252ZXJ0LlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5KSB7XG5cdHJldHVybiB7XG5cdFx0dDogJ25vJywgLyogdHlwZSAqL1xuXHRcdGQ6IGFycmF5LCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoXG5cdH07XG59O1xuXG5cblxuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgYmFzZTY0IGVuY29kaW5nXG4gKiBFZmZlY3RpdmUgZm9yIHN0cmluZyBiYXNlZCBjaGFubmVscyAobGlrZSBKU09OIGJhc2VkIFdTKVxuICogKi9cbmZ1bmN0aW9uIEJhc2U2NENvZGluZygpe1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgICBVdGlsaXR5IGZ1bmN0aW9ucyAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qXFxcbiB8KnxcbiB8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcbiB8KnxcbiB8KnwgIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvRMOpY29kZXJfZW5jb2Rlcl9lbl9iYXNlNjRcbiB8KnxcbiBcXCovXG4vKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cbnZhciBiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0bkNociAtIDY1XG5cdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0bkNociAtIDcxXG5cdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRuQ2hyICsgNFxuXHRcdDogbkNociA9PT0gNDMgP1xuXHRcdDYyXG5cdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0NjNcblx0XHQ6XHQwO1xufTtcblxuLyoqXG4gKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjRcdFx0YmFzZTY0IGNvZGVkIHN0cmluZ1xuICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9XHRcdFx0XHR0YWIgb2YgZGVjb2RlZCBieXRlc1xuICovXG52YXIgYmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHR2YXJcblx0c0I2NEVuYyA9IHNCYXNlNjQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csIFwiXCIpLCBuSW5MZW4gPSBzQjY0RW5jLmxlbmd0aCxcblx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRmb3IgKHZhciBuTW9kMywgbk1vZDQsIG5VaW50MjQgPSAwLCBuT3V0SWR4ID0gMCwgbkluSWR4ID0gMDsgbkluSWR4IDwgbkluTGVuOyBuSW5JZHgrKykge1xuXHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0aWYgKG5Nb2Q0ID09PSAzIHx8IG5JbkxlbiAtIG5JbklkeCA9PT0gMSkge1xuXHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0fVxuXHRcdFx0blVpbnQyNCA9IDA7XG5cdFx0fVxuXHR9XG5cdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdHJldHVybiBidWZmZXI7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgIEludGVyZmFjZSBmdW5jdGlvbnMgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4qIENvbnZlcnQgYnVmZmVyIGNvZGVkIGluIGJhc2U2NCBhbmQgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5XG4qIGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBhcnJheVxuKiBAcGFyYW0gYnVmZmVyIGluIGJhc2U2NFxuKiBAcGFyYW0gYnl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggbnVtYmVyICg0IG9yIDgpXG4qIEByZXR1cm4gYXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0KS4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdHZhciBieXRlQ29kaW5nID0gZGF0YS5iO1xuXG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyogZGVjb2RlIGRhdGEgdG8gYXJyYXkgb2YgYnl0ZSAqL1xuXHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YS5kLCBkYXRhLmIpO1xuXHQvKiBwYXJzZSBkYXRhIHRvIGZsb2F0IGFycmF5ICovXG5cdHZhciBmQXJyYXk9bnVsbDtcblx0c3dpdGNoKGRhdGEuYikge1xuXHRjYXNlIDQ6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0NjRBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRkZWZhdWx0OlxuXHRcdGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBieXRlQ29kaW5nISBTaG91bGQgbm90IGhhcHBlbiEhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qIHBhcnNlIGZBcnJheSBpbnRvIG5vcm1hbCBhcnJheSAqL1xuXHR2YXIgdGFiID0gW10uc2xpY2UuY2FsbChmQXJyYXkpO1xuXG5cdGlmKGRhdGEucyAhPT0gdGFiLmxlbmd0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCB3aGVuIGRlY29kaW5nICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRhYjtcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGFycmF5IGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieSBieXRlQ29kaW5nIGJ5dGVzIGludG8gYnVmZmVyIGNvZGVkIGluIGJhc2U2NFxuKiBAcGFyYW0gXHR7QXJyYXk8RmxvYXQ+fSBcdGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCBiaXRzKVxuKiBAcGFyYW0gXHR7aW50ZWdlcn0gXHRieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBmbG9hdCAoNCBvciA4KVxuKiBAcmV0dXJuICBcdHtTdHJpbmd9IFx0YnVmZmVyIGluIGJhc2U2NC4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIGJ5dGVDb2RpbmcpIHtcblx0LyogY2hlY2sgYnl0ZSBjb2RpbmcgKi9cblx0aWYoYnl0ZUNvZGluZyAhPT0gNCAmJiBieXRlQ29kaW5nICE9PSA4KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKioqIGNhc2UgQXJyYXlCdWZmZXIgKioqL1xuXHR2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGFycmF5Lmxlbmd0aCpieXRlQ29kaW5nKTtcblx0c3dpdGNoKGJ5dGVDb2RpbmcpIHtcblx0Y2FzZSA0OlxuXHRcdHZhciBidWYzMiA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKTtcblx0XHRidWYzMi5zZXQoYXJyYXkpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0dmFyIGJ1ZjY0ID0gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuXHRcdGJ1ZjY0LnNldChhcnJheSk7XG5cdFx0YnJlYWs7XG5cdH1cblx0dmFyIGJ1ZmZDaGFyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblx0dmFyIHN0ciA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgYnVmZkNoYXIpO1xuXHR2YXIgYjY0QnVmZiA9IGJhc2U2NC5lbmNvZGUoc3RyKTtcblx0cmV0dXJuIHtcblx0XHR0OiAnYjY0JywgLyogdHlwZSAqL1xuXHRcdGI6IGJ5dGVDb2RpbmcsIC8qIGJ5dGVDb2RpbmcgKi9cblx0XHRkOiBiNjRCdWZmLCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoIC8qIHNpemUgKi9cblx0fTtcbn07XG5cblxuXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjb21tIGVuY29kaW5nXG4gKiAqL1xuZnVuY3Rpb24gQ29kaW5nSGFuZGxlcigpe1xuXHR0aGlzLmI2NCA9IG5ldyBCYXNlNjRDb2RpbmcoKTtcblx0dGhpcy5ub25lID0gbmV3IE5vQ29kaW5nKCk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKCFkYXRhIHx8IGRhdGE9PT1udWxsKVxuXHRcdHJldHVybiBudWxsO1xuXHRzd2l0Y2goZGF0YS50KSB7XG5cdGNhc2UgJ2I2NCc6XG5cdFx0cmV0dXJuIHRoaXMuYjY0LmZyb20oZGF0YSk7XG5cdGRlZmF1bHQ6XG5cdFx0cmV0dXJuIHRoaXMubm9uZS5mcm9tKGRhdGEpO1xuXHR9XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIHR5cGUsIGJ5dGVDb2RpbmcpIHtcblx0aWYodHlwZW9mIGFycmF5ID09PSAnbnVtYmVyJykge1xuXHRcdGFycmF5PVthcnJheV07XG5cdH1cblx0aWYoIUFycmF5LmlzQXJyYXkoYXJyYXkpKXtcblx0XHRjb25zb2xlLmxvZyhcIkNvZGluZ0hhbmRsZXIudG8gb25seSBhY2NlcHRzIGFycmF5ICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRzd2l0Y2godHlwZSkge1xuXHRjYXNlICdiNjQnOlxuXHRcdHJldHVybiB0aGlzLmI2NC50byhhcnJheSwgYnl0ZUNvZGluZyk7XG5cdGNhc2UgJ25vJzpcblx0ZGVmYXVsdDpcblx0XHRyZXR1cm4gdGhpcy5ub25lLnRvKGFycmF5KTtcblx0fVxufTtcblxuXG4vKiogQWRkIGJhc2U2NCBoYW5kbGVyIHRvIERpeWFTZWxlY3RvciAqKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIG5ldyBDb2RpbmdIYW5kbGVyKCk7XG59O1xuIl19
