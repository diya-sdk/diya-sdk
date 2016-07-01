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
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
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
},{"./support/isBuffer":5,"_process":4,"inherits":2}],7:[function(require,module,exports){
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

},{"./chrome/chrome_shim":8,"./edge/edge_shim":11,"./firefox/firefox_shim":12,"./safari/safari_shim":14,"./utils":15}],8:[function(require,module,exports){
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

},{"../utils.js":15,"./getusermedia":9}],9:[function(require,module,exports){
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

},{"../utils.js":15}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"../utils":15,"./edge_sdp":10}],12:[function(require,module,exports){
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

},{"../utils":15,"./getusermedia":13}],13:[function(require,module,exports){
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

},{"../utils":15}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"inherits":2,"node-event-emitter":3,"q":undefined}],17:[function(require,module,exports){
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

},{"./DiyaNode":16,"inherits":2,"node-event-emitter":3,"q":undefined}],18:[function(require,module,exports){
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

},{"./DiyaSelector.js":17,"./services/ieq/ieq.js":19,"./services/maps/maps.js":20,"./services/meshNetwork/MeshNetwork.js":21,"./services/peerAuth/PeerAuth.js":23,"./services/rtc/rtc.js":24,"./services/status/status.js":25,"./utils/encoding/encoding.js":26}],19:[function(require,module,exports){
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
 * request Data to make CSV file
 */
IEQ.prototype.getCSVData = function(sensorNames,callback){
	var dataConfig = {
		criteria: {
			time: { rangeUnit: 'hour', range: 180}, // 360h -> 15d // 180h -> 7j
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

},{"../../DiyaSelector":17,"../message":22,"util":6}],20:[function(require,module,exports){
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

},{"node-event-emitter":3}],21:[function(require,module,exports){
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

},{"../../DiyaSelector":17,"q":undefined}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"../../DiyaSelector":17,"q":undefined}],24:[function(require,module,exports){
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
		iceServers.push({ urls: [ this._turninfo.url ], username: this._turninfo.username, credential: this._turninfo.password });
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
	
	console.log(config);
	console.log(constraints);

	var peer = new RTCPeerConnection(config,  constraints);
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
		//console.log('remote ice :');
		//console.log(data.candidate.candidate);
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

},{"../../DiyaSelector":17,"inherits":2,"node-event-emitter":3,"webrtc-adapter":7}],25:[function(require,module,exports){
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
			var pastParts = dataRobots[n].pastParts;
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

					rParts[p].evts = {
						code: parts[p].code,
						codeRef: parts[p].codeRef,
						time: parts[p].time
					};
					rParts[p].lastEvts = pastParts[p];
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

},{"../../DiyaSelector":17,"../message":22,"util":6}],26:[function(require,module,exports){
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

},{"../../DiyaSelector":17,"base-64":1}]},{},[18])(18)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9iYXNlLTY0L2Jhc2U2NC5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9ub2RlLWV2ZW50LWVtaXR0ZXIvaW5kZXguanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2FkYXB0ZXJfY29yZS5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9jaHJvbWUvY2hyb21lX3NoaW0uanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL25vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvY2hyb21lL2dldHVzZXJtZWRpYS5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9lZGdlL2VkZ2Vfc2RwLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZWRnZV9zaGltLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZmlyZWZveF9zaGltLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZ2V0dXNlcm1lZGlhLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL3NhZmFyaS9zYWZhcmlfc2hpbS5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy91dGlscy5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvc3JjL0RpeWFOb2RlLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvRGl5YVNlbGVjdG9yLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9pZXEvaWVxLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvbWFwcy9tYXBzLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzaE5ldHdvcmsvTWVzaE5ldHdvcmsuanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9tZXNzYWdlLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvcGVlckF1dGgvUGVlckF1dGguanMiLCIvaG9tZS9yb2JlY2FzdC9Qcm9qZXRzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvcm9iZWNhc3QvUHJvamV0cy9kaXlhLXNkay9zcmMvc2VydmljZXMvc3RhdHVzL3N0YXR1cy5qcyIsIi9ob21lL3JvYmVjYXN0L1Byb2pldHMvZGl5YS1zZGsvc3JjL3V0aWxzL2VuY29kaW5nL2VuY29kaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyohIGh0dHA6Ly9tdGhzLmJlL2Jhc2U2NCB2MC4xLjAgYnkgQG1hdGhpYXMgfCBNSVQgbGljZW5zZSAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYC5cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC5cblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLCBhbmQgdXNlXG5cdC8vIGl0IGFzIGByb290YC5cblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgSW52YWxpZENoYXJhY3RlckVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH07XG5cdEludmFsaWRDaGFyYWN0ZXJFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3I7XG5cdEludmFsaWRDaGFyYWN0ZXJFcnJvci5wcm90b3R5cGUubmFtZSA9ICdJbnZhbGlkQ2hhcmFjdGVyRXJyb3InO1xuXG5cdHZhciBlcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHQvLyBOb3RlOiB0aGUgZXJyb3IgbWVzc2FnZXMgdXNlZCB0aHJvdWdob3V0IHRoaXMgZmlsZSBtYXRjaCB0aG9zZSB1c2VkIGJ5XG5cdFx0Ly8gdGhlIG5hdGl2ZSBgYXRvYmAvYGJ0b2FgIGltcGxlbWVudGF0aW9uIGluIENocm9taXVtLlxuXHRcdHRocm93IG5ldyBJbnZhbGlkQ2hhcmFjdGVyRXJyb3IobWVzc2FnZSk7XG5cdH07XG5cblx0dmFyIFRBQkxFID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXHQvLyBodHRwOi8vd2hhdHdnLm9yZy9odG1sL2NvbW1vbi1taWNyb3N5bnRheGVzLmh0bWwjc3BhY2UtY2hhcmFjdGVyXG5cdHZhciBSRUdFWF9TUEFDRV9DSEFSQUNURVJTID0gL1tcXHRcXG5cXGZcXHIgXS9nO1xuXG5cdC8vIGBkZWNvZGVgIGlzIGRlc2lnbmVkIHRvIGJlIGZ1bGx5IGNvbXBhdGlibGUgd2l0aCBgYXRvYmAgYXMgZGVzY3JpYmVkIGluIHRoZVxuXHQvLyBIVE1MIFN0YW5kYXJkLiBodHRwOi8vd2hhdHdnLm9yZy9odG1sL3dlYmFwcGFwaXMuaHRtbCNkb20td2luZG93YmFzZTY0LWF0b2Jcblx0Ly8gVGhlIG9wdGltaXplZCBiYXNlNjQtZGVjb2RpbmcgYWxnb3JpdGhtIHVzZWQgaXMgYmFzZWQgb24gQGF0a+KAmXMgZXhjZWxsZW50XG5cdC8vIGltcGxlbWVudGF0aW9uLiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9hdGsvMTAyMDM5NlxuXHR2YXIgZGVjb2RlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHRpbnB1dCA9IFN0cmluZyhpbnB1dClcblx0XHRcdC5yZXBsYWNlKFJFR0VYX1NQQUNFX0NIQVJBQ1RFUlMsICcnKTtcblx0XHR2YXIgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXHRcdGlmIChsZW5ndGggJSA0ID09IDApIHtcblx0XHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZSgvPT0/JC8sICcnKTtcblx0XHRcdGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0XHR9XG5cdFx0aWYgKFxuXHRcdFx0bGVuZ3RoICUgNCA9PSAxIHx8XG5cdFx0XHQvLyBodHRwOi8vd2hhdHdnLm9yZy9DI2FscGhhbnVtZXJpYy1hc2NpaS1jaGFyYWN0ZXJzXG5cdFx0XHQvW14rYS16QS1aMC05L10vLnRlc3QoaW5wdXQpXG5cdFx0KSB7XG5cdFx0XHRlcnJvcihcblx0XHRcdFx0J0ludmFsaWQgY2hhcmFjdGVyOiB0aGUgc3RyaW5nIHRvIGJlIGRlY29kZWQgaXMgbm90IGNvcnJlY3RseSBlbmNvZGVkLidcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHZhciBiaXRDb3VudGVyID0gMDtcblx0XHR2YXIgYml0U3RvcmFnZTtcblx0XHR2YXIgYnVmZmVyO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR2YXIgcG9zaXRpb24gPSAtMTtcblx0XHR3aGlsZSAoKytwb3NpdGlvbiA8IGxlbmd0aCkge1xuXHRcdFx0YnVmZmVyID0gVEFCTEUuaW5kZXhPZihpbnB1dC5jaGFyQXQocG9zaXRpb24pKTtcblx0XHRcdGJpdFN0b3JhZ2UgPSBiaXRDb3VudGVyICUgNCA/IGJpdFN0b3JhZ2UgKiA2NCArIGJ1ZmZlciA6IGJ1ZmZlcjtcblx0XHRcdC8vIFVubGVzcyB0aGlzIGlzIHRoZSBmaXJzdCBvZiBhIGdyb3VwIG9mIDQgY2hhcmFjdGVyc+KAplxuXHRcdFx0aWYgKGJpdENvdW50ZXIrKyAlIDQpIHtcblx0XHRcdFx0Ly8g4oCmY29udmVydCB0aGUgZmlyc3QgOCBiaXRzIHRvIGEgc2luZ2xlIEFTQ0lJIGNoYXJhY3Rlci5cblx0XHRcdFx0b3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoXG5cdFx0XHRcdFx0MHhGRiAmIGJpdFN0b3JhZ2UgPj4gKC0yICogYml0Q291bnRlciAmIDYpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH07XG5cblx0Ly8gYGVuY29kZWAgaXMgZGVzaWduZWQgdG8gYmUgZnVsbHkgY29tcGF0aWJsZSB3aXRoIGBidG9hYCBhcyBkZXNjcmliZWQgaW4gdGhlXG5cdC8vIEhUTUwgU3RhbmRhcmQ6IGh0dHA6Ly93aGF0d2cub3JnL2h0bWwvd2ViYXBwYXBpcy5odG1sI2RvbS13aW5kb3diYXNlNjQtYnRvYVxuXHR2YXIgZW5jb2RlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHRpbnB1dCA9IFN0cmluZyhpbnB1dCk7XG5cdFx0aWYgKC9bXlxcMC1cXHhGRl0vLnRlc3QoaW5wdXQpKSB7XG5cdFx0XHQvLyBOb3RlOiBubyBuZWVkIHRvIHNwZWNpYWwtY2FzZSBhc3RyYWwgc3ltYm9scyBoZXJlLCBhcyBzdXJyb2dhdGVzIGFyZVxuXHRcdFx0Ly8gbWF0Y2hlZCwgYW5kIHRoZSBpbnB1dCBpcyBzdXBwb3NlZCB0byBvbmx5IGNvbnRhaW4gQVNDSUkgYW55d2F5LlxuXHRcdFx0ZXJyb3IoXG5cdFx0XHRcdCdUaGUgc3RyaW5nIHRvIGJlIGVuY29kZWQgY29udGFpbnMgY2hhcmFjdGVycyBvdXRzaWRlIG9mIHRoZSAnICtcblx0XHRcdFx0J0xhdGluMSByYW5nZS4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgcGFkZGluZyA9IGlucHV0Lmxlbmd0aCAlIDM7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdHZhciBwb3NpdGlvbiA9IC0xO1xuXHRcdHZhciBhO1xuXHRcdHZhciBiO1xuXHRcdHZhciBjO1xuXHRcdHZhciBkO1xuXHRcdHZhciBidWZmZXI7XG5cdFx0Ly8gTWFrZSBzdXJlIGFueSBwYWRkaW5nIGlzIGhhbmRsZWQgb3V0c2lkZSBvZiB0aGUgbG9vcC5cblx0XHR2YXIgbGVuZ3RoID0gaW5wdXQubGVuZ3RoIC0gcGFkZGluZztcblxuXHRcdHdoaWxlICgrK3Bvc2l0aW9uIDwgbGVuZ3RoKSB7XG5cdFx0XHQvLyBSZWFkIHRocmVlIGJ5dGVzLCBpLmUuIDI0IGJpdHMuXG5cdFx0XHRhID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbikgPDwgMTY7XG5cdFx0XHRiID0gaW5wdXQuY2hhckNvZGVBdCgrK3Bvc2l0aW9uKSA8PCA4O1xuXHRcdFx0YyA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbik7XG5cdFx0XHRidWZmZXIgPSBhICsgYiArIGM7XG5cdFx0XHQvLyBUdXJuIHRoZSAyNCBiaXRzIGludG8gZm91ciBjaHVua3Mgb2YgNiBiaXRzIGVhY2gsIGFuZCBhcHBlbmQgdGhlXG5cdFx0XHQvLyBtYXRjaGluZyBjaGFyYWN0ZXIgZm9yIGVhY2ggb2YgdGhlbSB0byB0aGUgb3V0cHV0LlxuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAxOCAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAxMiAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiA2ICYgMHgzRikgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyICYgMHgzRilcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHBhZGRpbmcgPT0gMikge1xuXHRcdFx0YSA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pIDw8IDg7XG5cdFx0XHRiID0gaW5wdXQuY2hhckNvZGVBdCgrK3Bvc2l0aW9uKTtcblx0XHRcdGJ1ZmZlciA9IGEgKyBiO1xuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAxMCkgK1xuXHRcdFx0XHRUQUJMRS5jaGFyQXQoKGJ1ZmZlciA+PiA0KSAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPDwgMikgJiAweDNGKSArXG5cdFx0XHRcdCc9J1xuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKHBhZGRpbmcgPT0gMSkge1xuXHRcdFx0YnVmZmVyID0gaW5wdXQuY2hhckNvZGVBdChwb3NpdGlvbik7XG5cdFx0XHRvdXRwdXQgKz0gKFxuXHRcdFx0XHRUQUJMRS5jaGFyQXQoYnVmZmVyID4+IDIpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPDwgNCkgJiAweDNGKSArXG5cdFx0XHRcdCc9PSdcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHR2YXIgYmFzZTY0ID0ge1xuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQndmVyc2lvbic6ICcwLjEuMCdcblx0fTtcblxuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBiYXNlNjQ7XG5cdFx0fSk7XG5cdH1cdGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7IC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBiYXNlNjQ7XG5cdFx0fSBlbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAodmFyIGtleSBpbiBiYXNlNjQpIHtcblx0XHRcdFx0YmFzZTY0Lmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBiYXNlNjRba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5iYXNlNjQgPSBiYXNlNjQ7XG5cdH1cblxufSh0aGlzKSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OWlZWE5sTFRZMEwySmhjMlUyTkM1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4cUlTQm9kSFJ3T2k4dmJYUm9jeTVpWlM5aVlYTmxOalFnZGpBdU1TNHdJR0o1SUVCdFlYUm9hV0Z6SUh3Z1RVbFVJR3hwWTJWdWMyVWdLaTljYmpzb1puVnVZM1JwYjI0b2NtOXZkQ2tnZTF4dVhHNWNkQzh2SUVSbGRHVmpkQ0JtY21WbElIWmhjbWxoWW14bGN5QmdaWGh3YjNKMGMyQXVYRzVjZEhaaGNpQm1jbVZsUlhod2IzSjBjeUE5SUhSNWNHVnZaaUJsZUhCdmNuUnpJRDA5SUNkdlltcGxZM1FuSUNZbUlHVjRjRzl5ZEhNN1hHNWNibHgwTHk4Z1JHVjBaV04wSUdaeVpXVWdkbUZ5YVdGaWJHVWdZRzF2WkhWc1pXQXVYRzVjZEhaaGNpQm1jbVZsVFc5a2RXeGxJRDBnZEhsd1pXOW1JRzF2WkhWc1pTQTlQU0FuYjJKcVpXTjBKeUFtSmlCdGIyUjFiR1VnSmlaY2JseDBYSFJ0YjJSMWJHVXVaWGh3YjNKMGN5QTlQU0JtY21WbFJYaHdiM0owY3lBbUppQnRiMlIxYkdVN1hHNWNibHgwTHk4Z1JHVjBaV04wSUdaeVpXVWdkbUZ5YVdGaWJHVWdZR2RzYjJKaGJHQXNJR1p5YjIwZ1RtOWtaUzVxY3lCdmNpQkNjbTkzYzJWeWFXWnBaV1FnWTI5a1pTd2dZVzVrSUhWelpWeHVYSFF2THlCcGRDQmhjeUJnY205dmRHQXVYRzVjZEhaaGNpQm1jbVZsUjJ4dlltRnNJRDBnZEhsd1pXOW1JR2RzYjJKaGJDQTlQU0FuYjJKcVpXTjBKeUFtSmlCbmJHOWlZV3c3WEc1Y2RHbG1JQ2htY21WbFIyeHZZbUZzTG1kc2IySmhiQ0E5UFQwZ1puSmxaVWRzYjJKaGJDQjhmQ0JtY21WbFIyeHZZbUZzTG5kcGJtUnZkeUE5UFQwZ1puSmxaVWRzYjJKaGJDa2dlMXh1WEhSY2RISnZiM1FnUFNCbWNtVmxSMnh2WW1Gc08xeHVYSFI5WEc1Y2JseDBMeW90TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFNvdlhHNWNibHgwZG1GeUlFbHVkbUZzYVdSRGFHRnlZV04wWlhKRmNuSnZjaUE5SUdaMWJtTjBhVzl1S0cxbGMzTmhaMlVwSUh0Y2JseDBYSFIwYUdsekxtMWxjM05oWjJVZ1BTQnRaWE56WVdkbE8xeHVYSFI5TzF4dVhIUkpiblpoYkdsa1EyaGhjbUZqZEdWeVJYSnliM0l1Y0hKdmRHOTBlWEJsSUQwZ2JtVjNJRVZ5Y205eU8xeHVYSFJKYm5aaGJHbGtRMmhoY21GamRHVnlSWEp5YjNJdWNISnZkRzkwZVhCbExtNWhiV1VnUFNBblNXNTJZV3hwWkVOb1lYSmhZM1JsY2tWeWNtOXlKenRjYmx4dVhIUjJZWElnWlhKeWIzSWdQU0JtZFc1amRHbHZiaWh0WlhOellXZGxLU0I3WEc1Y2RGeDBMeThnVG05MFpUb2dkR2hsSUdWeWNtOXlJRzFsYzNOaFoyVnpJSFZ6WldRZ2RHaHliM1ZuYUc5MWRDQjBhR2x6SUdacGJHVWdiV0YwWTJnZ2RHaHZjMlVnZFhObFpDQmllVnh1WEhSY2RDOHZJSFJvWlNCdVlYUnBkbVVnWUdGMGIySmdMMkJpZEc5aFlDQnBiWEJzWlcxbGJuUmhkR2x2YmlCcGJpQkRhSEp2YldsMWJTNWNibHgwWEhSMGFISnZkeUJ1WlhjZ1NXNTJZV3hwWkVOb1lYSmhZM1JsY2tWeWNtOXlLRzFsYzNOaFoyVXBPMXh1WEhSOU8xeHVYRzVjZEhaaGNpQlVRVUpNUlNBOUlDZEJRa05FUlVaSFNFbEtTMHhOVGs5UVVWSlRWRlZXVjFoWldtRmlZMlJsWm1kb2FXcHJiRzF1YjNCeGNuTjBkWFozZUhsNk1ERXlNelExTmpjNE9Tc3ZKenRjYmx4MEx5OGdhSFIwY0RvdkwzZG9ZWFIzWnk1dmNtY3ZhSFJ0YkM5amIyMXRiMjR0YldsamNtOXplVzUwWVhobGN5NW9kRzFzSTNOd1lXTmxMV05vWVhKaFkzUmxjbHh1WEhSMllYSWdVa1ZIUlZoZlUxQkJRMFZmUTBoQlVrRkRWRVZTVXlBOUlDOWJYRngwWEZ4dVhGeG1YRnh5SUYwdlp6dGNibHh1WEhRdkx5QmdaR1ZqYjJSbFlDQnBjeUJrWlhOcFoyNWxaQ0IwYnlCaVpTQm1kV3hzZVNCamIyMXdZWFJwWW14bElIZHBkR2dnWUdGMGIySmdJR0Z6SUdSbGMyTnlhV0psWkNCcGJpQjBhR1ZjYmx4MEx5OGdTRlJOVENCVGRHRnVaR0Z5WkM0Z2FIUjBjRG92TDNkb1lYUjNaeTV2Y21jdmFIUnRiQzkzWldKaGNIQmhjR2x6TG1oMGJXd2paRzl0TFhkcGJtUnZkMkpoYzJVMk5DMWhkRzlpWEc1Y2RDOHZJRlJvWlNCdmNIUnBiV2w2WldRZ1ltRnpaVFkwTFdSbFkyOWthVzVuSUdGc1oyOXlhWFJvYlNCMWMyVmtJR2x6SUdKaGMyVmtJRzl1SUVCaGRHdmlnSmx6SUdWNFkyVnNiR1Z1ZEZ4dVhIUXZMeUJwYlhCc1pXMWxiblJoZEdsdmJpNGdhSFIwY0hNNkx5OW5hWE4wTG1kcGRHaDFZaTVqYjIwdllYUnJMekV3TWpBek9UWmNibHgwZG1GeUlHUmxZMjlrWlNBOUlHWjFibU4wYVc5dUtHbHVjSFYwS1NCN1hHNWNkRngwYVc1d2RYUWdQU0JUZEhKcGJtY29hVzV3ZFhRcFhHNWNkRngwWEhRdWNtVndiR0ZqWlNoU1JVZEZXRjlUVUVGRFJWOURTRUZTUVVOVVJWSlRMQ0FuSnlrN1hHNWNkRngwZG1GeUlHeGxibWQwYUNBOUlHbHVjSFYwTG14bGJtZDBhRHRjYmx4MFhIUnBaaUFvYkdWdVozUm9JQ1VnTkNBOVBTQXdLU0I3WEc1Y2RGeDBYSFJwYm5CMWRDQTlJR2x1Y0hWMExuSmxjR3hoWTJVb0x6MDlQeVF2TENBbkp5azdYRzVjZEZ4MFhIUnNaVzVuZEdnZ1BTQnBibkIxZEM1c1pXNW5kR2c3WEc1Y2RGeDBmVnh1WEhSY2RHbG1JQ2hjYmx4MFhIUmNkR3hsYm1kMGFDQWxJRFFnUFQwZ01TQjhmRnh1WEhSY2RGeDBMeThnYUhSMGNEb3ZMM2RvWVhSM1p5NXZjbWN2UXlOaGJIQm9ZVzUxYldWeWFXTXRZWE5qYVdrdFkyaGhjbUZqZEdWeWMxeHVYSFJjZEZ4MEwxdGVLMkV0ZWtFdFdqQXRPUzlkTHk1MFpYTjBLR2x1Y0hWMEtWeHVYSFJjZENrZ2UxeHVYSFJjZEZ4MFpYSnliM0lvWEc1Y2RGeDBYSFJjZENkSmJuWmhiR2xrSUdOb1lYSmhZM1JsY2pvZ2RHaGxJSE4wY21sdVp5QjBieUJpWlNCa1pXTnZaR1ZrSUdseklHNXZkQ0JqYjNKeVpXTjBiSGtnWlc1amIyUmxaQzRuWEc1Y2RGeDBYSFFwTzF4dVhIUmNkSDFjYmx4MFhIUjJZWElnWW1sMFEyOTFiblJsY2lBOUlEQTdYRzVjZEZ4MGRtRnlJR0pwZEZOMGIzSmhaMlU3WEc1Y2RGeDBkbUZ5SUdKMVptWmxjanRjYmx4MFhIUjJZWElnYjNWMGNIVjBJRDBnSnljN1hHNWNkRngwZG1GeUlIQnZjMmwwYVc5dUlEMGdMVEU3WEc1Y2RGeDBkMmhwYkdVZ0tDc3JjRzl6YVhScGIyNGdQQ0JzWlc1bmRHZ3BJSHRjYmx4MFhIUmNkR0oxWm1abGNpQTlJRlJCUWt4RkxtbHVaR1Y0VDJZb2FXNXdkWFF1WTJoaGNrRjBLSEJ2YzJsMGFXOXVLU2s3WEc1Y2RGeDBYSFJpYVhSVGRHOXlZV2RsSUQwZ1ltbDBRMjkxYm5SbGNpQWxJRFFnUHlCaWFYUlRkRzl5WVdkbElDb2dOalFnS3lCaWRXWm1aWElnT2lCaWRXWm1aWEk3WEc1Y2RGeDBYSFF2THlCVmJteGxjM01nZEdocGN5QnBjeUIwYUdVZ1ptbHljM1FnYjJZZ1lTQm5jbTkxY0NCdlppQTBJR05vWVhKaFkzUmxjblBpZ0taY2JseDBYSFJjZEdsbUlDaGlhWFJEYjNWdWRHVnlLeXNnSlNBMEtTQjdYRzVjZEZ4MFhIUmNkQzh2SU9LQXBtTnZiblpsY25RZ2RHaGxJR1pwY25OMElEZ2dZbWwwY3lCMGJ5QmhJSE5wYm1kc1pTQkJVME5KU1NCamFHRnlZV04wWlhJdVhHNWNkRngwWEhSY2RHOTFkSEIxZENBclBTQlRkSEpwYm1jdVpuSnZiVU5vWVhKRGIyUmxLRnh1WEhSY2RGeDBYSFJjZERCNFJrWWdKaUJpYVhSVGRHOXlZV2RsSUQ0K0lDZ3RNaUFxSUdKcGRFTnZkVzUwWlhJZ0ppQTJLVnh1WEhSY2RGeDBYSFFwTzF4dVhIUmNkRngwZlZ4dVhIUmNkSDFjYmx4MFhIUnlaWFIxY200Z2IzVjBjSFYwTzF4dVhIUjlPMXh1WEc1Y2RDOHZJR0JsYm1OdlpHVmdJR2x6SUdSbGMybG5ibVZrSUhSdklHSmxJR1oxYkd4NUlHTnZiWEJoZEdsaWJHVWdkMmwwYUNCZ1luUnZZV0FnWVhNZ1pHVnpZM0pwWW1Wa0lHbHVJSFJvWlZ4dVhIUXZMeUJJVkUxTUlGTjBZVzVrWVhKa09pQm9kSFJ3T2k4dmQyaGhkSGRuTG05eVp5OW9kRzFzTDNkbFltRndjR0Z3YVhNdWFIUnRiQ05rYjIwdGQybHVaRzkzWW1GelpUWTBMV0owYjJGY2JseDBkbUZ5SUdWdVkyOWtaU0E5SUdaMWJtTjBhVzl1S0dsdWNIVjBLU0I3WEc1Y2RGeDBhVzV3ZFhRZ1BTQlRkSEpwYm1jb2FXNXdkWFFwTzF4dVhIUmNkR2xtSUNndlcxNWNYREF0WEZ4NFJrWmRMeTUwWlhOMEtHbHVjSFYwS1NrZ2UxeHVYSFJjZEZ4MEx5OGdUbTkwWlRvZ2JtOGdibVZsWkNCMGJ5QnpjR1ZqYVdGc0xXTmhjMlVnWVhOMGNtRnNJSE41YldKdmJITWdhR1Z5WlN3Z1lYTWdjM1Z5Y205bllYUmxjeUJoY21WY2JseDBYSFJjZEM4dklHMWhkR05vWldRc0lHRnVaQ0IwYUdVZ2FXNXdkWFFnYVhNZ2MzVndjRzl6WldRZ2RHOGdiMjVzZVNCamIyNTBZV2x1SUVGVFEwbEpJR0Z1ZVhkaGVTNWNibHgwWEhSY2RHVnljbTl5S0Z4dVhIUmNkRngwWEhRblZHaGxJSE4wY21sdVp5QjBieUJpWlNCbGJtTnZaR1ZrSUdOdmJuUmhhVzV6SUdOb1lYSmhZM1JsY25NZ2IzVjBjMmxrWlNCdlppQjBhR1VnSnlBclhHNWNkRngwWEhSY2RDZE1ZWFJwYmpFZ2NtRnVaMlV1SjF4dVhIUmNkRngwS1R0Y2JseDBYSFI5WEc1Y2RGeDBkbUZ5SUhCaFpHUnBibWNnUFNCcGJuQjFkQzVzWlc1bmRHZ2dKU0F6TzF4dVhIUmNkSFpoY2lCdmRYUndkWFFnUFNBbkp6dGNibHgwWEhSMllYSWdjRzl6YVhScGIyNGdQU0F0TVR0Y2JseDBYSFIyWVhJZ1lUdGNibHgwWEhSMllYSWdZanRjYmx4MFhIUjJZWElnWXp0Y2JseDBYSFIyWVhJZ1pEdGNibHgwWEhSMllYSWdZblZtWm1WeU8xeHVYSFJjZEM4dklFMWhhMlVnYzNWeVpTQmhibmtnY0dGa1pHbHVaeUJwY3lCb1lXNWtiR1ZrSUc5MWRITnBaR1VnYjJZZ2RHaGxJR3h2YjNBdVhHNWNkRngwZG1GeUlHeGxibWQwYUNBOUlHbHVjSFYwTG14bGJtZDBhQ0F0SUhCaFpHUnBibWM3WEc1Y2JseDBYSFIzYUdsc1pTQW9LeXR3YjNOcGRHbHZiaUE4SUd4bGJtZDBhQ2tnZTF4dVhIUmNkRngwTHk4Z1VtVmhaQ0IwYUhKbFpTQmllWFJsY3l3Z2FTNWxMaUF5TkNCaWFYUnpMbHh1WEhSY2RGeDBZU0E5SUdsdWNIVjBMbU5vWVhKRGIyUmxRWFFvY0c5emFYUnBiMjRwSUR3OElERTJPMXh1WEhSY2RGeDBZaUE5SUdsdWNIVjBMbU5vWVhKRGIyUmxRWFFvS3l0d2IzTnBkR2x2YmlrZ1BEd2dPRHRjYmx4MFhIUmNkR01nUFNCcGJuQjFkQzVqYUdGeVEyOWtaVUYwS0NzcmNHOXphWFJwYjI0cE8xeHVYSFJjZEZ4MFluVm1abVZ5SUQwZ1lTQXJJR0lnS3lCak8xeHVYSFJjZEZ4MEx5OGdWSFZ5YmlCMGFHVWdNalFnWW1sMGN5QnBiblJ2SUdadmRYSWdZMmgxYm10eklHOW1JRFlnWW1sMGN5QmxZV05vTENCaGJtUWdZWEJ3Wlc1a0lIUm9aVnh1WEhSY2RGeDBMeThnYldGMFkyaHBibWNnWTJoaGNtRmpkR1Z5SUdadmNpQmxZV05vSUc5bUlIUm9aVzBnZEc4Z2RHaGxJRzkxZEhCMWRDNWNibHgwWEhSY2RHOTFkSEIxZENBclBTQW9YRzVjZEZ4MFhIUmNkRlJCUWt4RkxtTm9ZWEpCZENoaWRXWm1aWElnUGo0Z01UZ2dKaUF3ZUROR0tTQXJYRzVjZEZ4MFhIUmNkRlJCUWt4RkxtTm9ZWEpCZENoaWRXWm1aWElnUGo0Z01USWdKaUF3ZUROR0tTQXJYRzVjZEZ4MFhIUmNkRlJCUWt4RkxtTm9ZWEpCZENoaWRXWm1aWElnUGo0Z05pQW1JREI0TTBZcElDdGNibHgwWEhSY2RGeDBWRUZDVEVVdVkyaGhja0YwS0dKMVptWmxjaUFtSURCNE0wWXBYRzVjZEZ4MFhIUXBPMXh1WEhSY2RIMWNibHh1WEhSY2RHbG1JQ2h3WVdSa2FXNW5JRDA5SURJcElIdGNibHgwWEhSY2RHRWdQU0JwYm5CMWRDNWphR0Z5UTI5a1pVRjBLSEJ2YzJsMGFXOXVLU0E4UENBNE8xeHVYSFJjZEZ4MFlpQTlJR2x1Y0hWMExtTm9ZWEpEYjJSbFFYUW9LeXR3YjNOcGRHbHZiaWs3WEc1Y2RGeDBYSFJpZFdabVpYSWdQU0JoSUNzZ1lqdGNibHgwWEhSY2RHOTFkSEIxZENBclBTQW9YRzVjZEZ4MFhIUmNkRlJCUWt4RkxtTm9ZWEpCZENoaWRXWm1aWElnUGo0Z01UQXBJQ3RjYmx4MFhIUmNkRngwVkVGQ1RFVXVZMmhoY2tGMEtDaGlkV1ptWlhJZ1BqNGdOQ2tnSmlBd2VETkdLU0FyWEc1Y2RGeDBYSFJjZEZSQlFreEZMbU5vWVhKQmRDZ29ZblZtWm1WeUlEdzhJRElwSUNZZ01IZ3pSaWtnSzF4dVhIUmNkRngwWEhRblBTZGNibHgwWEhSY2RDazdYRzVjZEZ4MGZTQmxiSE5sSUdsbUlDaHdZV1JrYVc1bklEMDlJREVwSUh0Y2JseDBYSFJjZEdKMVptWmxjaUE5SUdsdWNIVjBMbU5vWVhKRGIyUmxRWFFvY0c5emFYUnBiMjRwTzF4dVhIUmNkRngwYjNWMGNIVjBJQ3M5SUNoY2JseDBYSFJjZEZ4MFZFRkNURVV1WTJoaGNrRjBLR0oxWm1abGNpQStQaUF5S1NBclhHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2dvWW5WbVptVnlJRHc4SURRcElDWWdNSGd6UmlrZ0sxeHVYSFJjZEZ4MFhIUW5QVDBuWEc1Y2RGeDBYSFFwTzF4dVhIUmNkSDFjYmx4dVhIUmNkSEpsZEhWeWJpQnZkWFJ3ZFhRN1hHNWNkSDA3WEc1Y2JseDBkbUZ5SUdKaGMyVTJOQ0E5SUh0Y2JseDBYSFFuWlc1amIyUmxKem9nWlc1amIyUmxMRnh1WEhSY2RDZGtaV052WkdVbk9pQmtaV052WkdVc1hHNWNkRngwSjNabGNuTnBiMjRuT2lBbk1DNHhMakFuWEc1Y2RIMDdYRzVjYmx4MEx5OGdVMjl0WlNCQlRVUWdZblZwYkdRZ2IzQjBhVzFwZW1WeWN5d2diR2xyWlNCeUxtcHpMQ0JqYUdWamF5Qm1iM0lnYzNCbFkybG1hV01nWTI5dVpHbDBhVzl1SUhCaGRIUmxjbTV6WEc1Y2RDOHZJR3hwYTJVZ2RHaGxJR1p2Ykd4dmQybHVaenBjYmx4MGFXWWdLRnh1WEhSY2RIUjVjR1Z2WmlCa1pXWnBibVVnUFQwZ0oyWjFibU4wYVc5dUp5QW1KbHh1WEhSY2RIUjVjR1Z2WmlCa1pXWnBibVV1WVcxa0lEMDlJQ2R2WW1wbFkzUW5JQ1ltWEc1Y2RGeDBaR1ZtYVc1bExtRnRaRnh1WEhRcElIdGNibHgwWEhSa1pXWnBibVVvWm5WdVkzUnBiMjRvS1NCN1hHNWNkRngwWEhSeVpYUjFjbTRnWW1GelpUWTBPMXh1WEhSY2RIMHBPMXh1WEhSOVhIUmxiSE5sSUdsbUlDaG1jbVZsUlhod2IzSjBjeUFtSmlBaFpuSmxaVVY0Y0c5eWRITXVibTlrWlZSNWNHVXBJSHRjYmx4MFhIUnBaaUFvWm5KbFpVMXZaSFZzWlNrZ2V5QXZMeUJwYmlCT2IyUmxMbXB6SUc5eUlGSnBibWR2U2xNZ2RqQXVPQzR3SzF4dVhIUmNkRngwWm5KbFpVMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1ltRnpaVFkwTzF4dVhIUmNkSDBnWld4elpTQjdJQzh2SUdsdUlFNWhjbmRvWVd3Z2IzSWdVbWx1WjI5S1V5QjJNQzQzTGpBdFhHNWNkRngwWEhSbWIzSWdLSFpoY2lCclpYa2dhVzRnWW1GelpUWTBLU0I3WEc1Y2RGeDBYSFJjZEdKaGMyVTJOQzVvWVhOUGQyNVFjbTl3WlhKMGVTaHJaWGtwSUNZbUlDaG1jbVZsUlhod2IzSjBjMXRyWlhsZElEMGdZbUZ6WlRZMFcydGxlVjBwTzF4dVhIUmNkRngwZlZ4dVhIUmNkSDFjYmx4MGZTQmxiSE5sSUhzZ0x5OGdhVzRnVW1ocGJtOGdiM0lnWVNCM1pXSWdZbkp2ZDNObGNseHVYSFJjZEhKdmIzUXVZbUZ6WlRZMElEMGdZbUZ6WlRZME8xeHVYSFI5WEc1Y2JuMG9kR2hwY3lrcE8xeHVJbDE5IiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zXG4gKi9cblxudmFyIHV0aWwgPSB7fTtcblxudXRpbC5pc09iamVjdCA9IGZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG51dGlsLmlzTnVtYmVyID0gZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxudXRpbC5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5cbnV0aWwuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKXtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cblxuLyoqXG4gKiBFdmVudEVtaXR0ZXIgY2xhc3NcbiAqL1xuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF1dGlsLmlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicgJiYgIXRoaXMuX2V2ZW50cy5lcnJvcikge1xuICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICB1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmICh1dGlsLmlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcblxuICAgICAgaWYgKHV0aWwuaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIH1cbiAgICAgIGlmICh1dGlsLmlzRnVuY3Rpb24oY29uc29sZS50cmFjZSkpXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICh1dGlsLmlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAodXRpbC5pc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OTFkR2xzTDNWMGFXd3Vhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHZJRU52Y0hseWFXZG9kQ0JLYjNsbGJuUXNJRWx1WXk0Z1lXNWtJRzkwYUdWeUlFNXZaR1VnWTI5dWRISnBZblYwYjNKekxseHVMeTljYmk4dklGQmxjbTFwYzNOcGIyNGdhWE1nYUdWeVpXSjVJR2R5WVc1MFpXUXNJR1p5WldVZ2IyWWdZMmhoY21kbExDQjBieUJoYm5rZ2NHVnljMjl1SUc5aWRHRnBibWx1WnlCaFhHNHZMeUJqYjNCNUlHOW1JSFJvYVhNZ2MyOW1kSGRoY21VZ1lXNWtJR0Z6YzI5amFXRjBaV1FnWkc5amRXMWxiblJoZEdsdmJpQm1hV3hsY3lBb2RHaGxYRzR2THlCY0lsTnZablIzWVhKbFhDSXBMQ0IwYnlCa1pXRnNJR2x1SUhSb1pTQlRiMlowZDJGeVpTQjNhWFJvYjNWMElISmxjM1J5YVdOMGFXOXVMQ0JwYm1Oc2RXUnBibWRjYmk4dklIZHBkR2h2ZFhRZ2JHbHRhWFJoZEdsdmJpQjBhR1VnY21sbmFIUnpJSFJ2SUhWelpTd2dZMjl3ZVN3Z2JXOWthV1o1TENCdFpYSm5aU3dnY0hWaWJHbHphQ3hjYmk4dklHUnBjM1J5YVdKMWRHVXNJSE4xWW14cFkyVnVjMlVzSUdGdVpDOXZjaUJ6Wld4c0lHTnZjR2xsY3lCdlppQjBhR1VnVTI5bWRIZGhjbVVzSUdGdVpDQjBieUJ3WlhKdGFYUmNiaTh2SUhCbGNuTnZibk1nZEc4Z2QyaHZiU0IwYUdVZ1UyOW1kSGRoY21VZ2FYTWdablZ5Ym1semFHVmtJSFJ2SUdSdklITnZMQ0J6ZFdKcVpXTjBJSFJ2SUhSb1pWeHVMeThnWm05c2JHOTNhVzVuSUdOdmJtUnBkR2x2Ym5NNlhHNHZMMXh1THk4Z1ZHaGxJR0ZpYjNabElHTnZjSGx5YVdkb2RDQnViM1JwWTJVZ1lXNWtJSFJvYVhNZ2NHVnliV2x6YzJsdmJpQnViM1JwWTJVZ2MyaGhiR3dnWW1VZ2FXNWpiSFZrWldSY2JpOHZJR2x1SUdGc2JDQmpiM0JwWlhNZ2IzSWdjM1ZpYzNSaGJuUnBZV3dnY0c5eWRHbHZibk1nYjJZZ2RHaGxJRk52Wm5SM1lYSmxMbHh1THk5Y2JpOHZJRlJJUlNCVFQwWlVWMEZTUlNCSlV5QlFVazlXU1VSRlJDQmNJa0ZUSUVsVFhDSXNJRmRKVkVoUFZWUWdWMEZTVWtGT1ZGa2dUMFlnUVU1WklFdEpUa1FzSUVWWVVGSkZVMU5jYmk4dklFOVNJRWxOVUV4SlJVUXNJRWxPUTB4VlJFbE9SeUJDVlZRZ1RrOVVJRXhKVFVsVVJVUWdWRThnVkVoRklGZEJVbEpCVGxSSlJWTWdUMFpjYmk4dklFMUZVa05JUVU1VVFVSkpURWxVV1N3Z1JrbFVUa1ZUVXlCR1QxSWdRU0JRUVZKVVNVTlZURUZTSUZCVlVsQlBVMFVnUVU1RUlFNVBUa2xPUmxKSlRrZEZUVVZPVkM0Z1NVNWNiaTh2SUU1UElFVldSVTVVSUZOSVFVeE1JRlJJUlNCQlZWUklUMUpUSUU5U0lFTlBVRmxTU1VkSVZDQklUMHhFUlZKVElFSkZJRXhKUVVKTVJTQkdUMUlnUVU1WklFTk1RVWxOTEZ4dUx5OGdSRUZOUVVkRlV5QlBVaUJQVkVoRlVpQk1TVUZDU1V4SlZGa3NJRmRJUlZSSVJWSWdTVTRnUVU0Z1FVTlVTVTlPSUU5R0lFTlBUbFJTUVVOVUxDQlVUMUpVSUU5U1hHNHZMeUJQVkVoRlVsZEpVMFVzSUVGU1NWTkpUa2NnUmxKUFRTd2dUMVZVSUU5R0lFOVNJRWxPSUVOUFRrNUZRMVJKVDA0Z1YwbFVTQ0JVU0VVZ1UwOUdWRmRCVWtVZ1QxSWdWRWhGWEc0dkx5QlZVMFVnVDFJZ1QxUklSVklnUkVWQlRFbE9SMU1nU1U0Z1ZFaEZJRk5QUmxSWFFWSkZMbHh1WEc1MllYSWdabTl5YldGMFVtVm5SWGh3SUQwZ0x5VmJjMlJxSlYwdlp6dGNibVY0Y0c5eWRITXVabTl5YldGMElEMGdablZ1WTNScGIyNG9aaWtnZTF4dUlDQnBaaUFvSVdselUzUnlhVzVuS0dZcEtTQjdYRzRnSUNBZ2RtRnlJRzlpYW1WamRITWdQU0JiWFR0Y2JpQWdJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUdGeVozVnRaVzUwY3k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lDQWdiMkpxWldOMGN5NXdkWE5vS0dsdWMzQmxZM1FvWVhKbmRXMWxiblJ6VzJsZEtTazdYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUJ2WW1wbFkzUnpMbXB2YVc0b0p5QW5LVHRjYmlBZ2ZWeHVYRzRnSUhaaGNpQnBJRDBnTVR0Y2JpQWdkbUZ5SUdGeVozTWdQU0JoY21kMWJXVnVkSE03WEc0Z0lIWmhjaUJzWlc0Z1BTQmhjbWR6TG14bGJtZDBhRHRjYmlBZ2RtRnlJSE4wY2lBOUlGTjBjbWx1WnlobUtTNXlaWEJzWVdObEtHWnZjbTFoZEZKbFowVjRjQ3dnWm5WdVkzUnBiMjRvZUNrZ2UxeHVJQ0FnSUdsbUlDaDRJRDA5UFNBbkpTVW5LU0J5WlhSMWNtNGdKeVVuTzF4dUlDQWdJR2xtSUNocElENDlJR3hsYmlrZ2NtVjBkWEp1SUhnN1hHNGdJQ0FnYzNkcGRHTm9JQ2g0S1NCN1hHNGdJQ0FnSUNCallYTmxJQ2NsY3ljNklISmxkSFZ5YmlCVGRISnBibWNvWVhKbmMxdHBLeXRkS1R0Y2JpQWdJQ0FnSUdOaGMyVWdKeVZrSnpvZ2NtVjBkWEp1SUU1MWJXSmxjaWhoY21kelcya3JLMTBwTzF4dUlDQWdJQ0FnWTJGelpTQW5KV29uT2x4dUlDQWdJQ0FnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJLVTA5T0xuTjBjbWx1WjJsbWVTaGhjbWR6VzJrcksxMHBPMXh1SUNBZ0lDQWdJQ0I5SUdOaGRHTm9JQ2hmS1NCN1hHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlDZGJRMmx5WTNWc1lYSmRKenRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSGc3WEc0Z0lDQWdmVnh1SUNCOUtUdGNiaUFnWm05eUlDaDJZWElnZUNBOUlHRnlaM05iYVYwN0lHa2dQQ0JzWlc0N0lIZ2dQU0JoY21keld5c3JhVjBwSUh0Y2JpQWdJQ0JwWmlBb2FYTk9kV3hzS0hncElIeDhJQ0ZwYzA5aWFtVmpkQ2g0S1NrZ2UxeHVJQ0FnSUNBZ2MzUnlJQ3M5SUNjZ0p5QXJJSGc3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lITjBjaUFyUFNBbklDY2dLeUJwYm5Od1pXTjBLSGdwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdjM1J5TzF4dWZUdGNibHh1WEc0dkx5Qk5ZWEpySUhSb1lYUWdZU0J0WlhSb2IyUWdjMmh2ZFd4a0lHNXZkQ0JpWlNCMWMyVmtMbHh1THk4Z1VtVjBkWEp1Y3lCaElHMXZaR2xtYVdWa0lHWjFibU4wYVc5dUlIZG9hV05vSUhkaGNtNXpJRzl1WTJVZ1lua2daR1ZtWVhWc2RDNWNiaTh2SUVsbUlDMHRibTh0WkdWd2NtVmpZWFJwYjI0Z2FYTWdjMlYwTENCMGFHVnVJR2wwSUdseklHRWdibTh0YjNBdVhHNWxlSEJ2Y25SekxtUmxjSEpsWTJGMFpTQTlJR1oxYm1OMGFXOXVLR1p1TENCdGMyY3BJSHRjYmlBZ0x5OGdRV3hzYjNjZ1ptOXlJR1JsY0hKbFkyRjBhVzVuSUhSb2FXNW5jeUJwYmlCMGFHVWdjSEp2WTJWemN5QnZaaUJ6ZEdGeWRHbHVaeUIxY0M1Y2JpQWdhV1lnS0dselZXNWtaV1pwYm1Wa0tHZHNiMkpoYkM1d2NtOWpaWE56S1NrZ2UxeHVJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaWdwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJsZUhCdmNuUnpMbVJsY0hKbFkyRjBaU2htYml3Z2JYTm5LUzVoY0hCc2VTaDBhR2x6TENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUgwN1hHNGdJSDFjYmx4dUlDQnBaaUFvY0hKdlkyVnpjeTV1YjBSbGNISmxZMkYwYVc5dUlEMDlQU0IwY25WbEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdadU8xeHVJQ0I5WEc1Y2JpQWdkbUZ5SUhkaGNtNWxaQ0E5SUdaaGJITmxPMXh1SUNCbWRXNWpkR2x2YmlCa1pYQnlaV05oZEdWa0tDa2dlMXh1SUNBZ0lHbG1JQ2doZDJGeWJtVmtLU0I3WEc0Z0lDQWdJQ0JwWmlBb2NISnZZMlZ6Y3k1MGFISnZkMFJsY0hKbFkyRjBhVzl1S1NCN1hHNGdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lodGMyY3BPMXh1SUNBZ0lDQWdmU0JsYkhObElHbG1JQ2h3Y205alpYTnpMblJ5WVdObFJHVndjbVZqWVhScGIyNHBJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzUwY21GalpTaHRjMmNwTzF4dUlDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVsY25KdmNpaHRjMmNwTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJQ0FnZDJGeWJtVmtJRDBnZEhKMVpUdGNiaUFnSUNCOVhHNGdJQ0FnY21WMGRYSnVJR1p1TG1Gd2NHeDVLSFJvYVhNc0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUgxY2JseHVJQ0J5WlhSMWNtNGdaR1Z3Y21WallYUmxaRHRjYm4wN1hHNWNibHh1ZG1GeUlHUmxZblZuY3lBOUlIdDlPMXh1ZG1GeUlHUmxZblZuUlc1MmFYSnZianRjYm1WNGNHOXlkSE11WkdWaWRXZHNiMmNnUFNCbWRXNWpkR2x2YmloelpYUXBJSHRjYmlBZ2FXWWdLR2x6Vlc1a1pXWnBibVZrS0dSbFluVm5SVzUyYVhKdmJpa3BYRzRnSUNBZ1pHVmlkV2RGYm5acGNtOXVJRDBnY0hKdlkyVnpjeTVsYm5ZdVRrOUVSVjlFUlVKVlJ5QjhmQ0FuSnp0Y2JpQWdjMlYwSUQwZ2MyVjBMblJ2VlhCd1pYSkRZWE5sS0NrN1hHNGdJR2xtSUNnaFpHVmlkV2R6VzNObGRGMHBJSHRjYmlBZ0lDQnBaaUFvYm1WM0lGSmxaMFY0Y0NnblhGeGNYR0luSUNzZ2MyVjBJQ3NnSjF4Y1hGeGlKeXdnSjJrbktTNTBaWE4wS0dSbFluVm5SVzUyYVhKdmJpa3BJSHRjYmlBZ0lDQWdJSFpoY2lCd2FXUWdQU0J3Y205alpYTnpMbkJwWkR0Y2JpQWdJQ0FnSUdSbFluVm5jMXR6WlhSZElEMGdablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQnRjMmNnUFNCbGVIQnZjblJ6TG1admNtMWhkQzVoY0hCc2VTaGxlSEJ2Y25SekxDQmhjbWQxYldWdWRITXBPMXh1SUNBZ0lDQWdJQ0JqYjI1emIyeGxMbVZ5Y205eUtDY2xjeUFsWkRvZ0pYTW5MQ0J6WlhRc0lIQnBaQ3dnYlhObktUdGNiaUFnSUNBZ0lIMDdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUdSbFluVm5jMXR6WlhSZElEMGdablZ1WTNScGIyNG9LU0I3ZlR0Y2JpQWdJQ0I5WEc0Z0lIMWNiaUFnY21WMGRYSnVJR1JsWW5WbmMxdHpaWFJkTzF4dWZUdGNibHh1WEc0dktpcGNiaUFxSUVWamFHOXpJSFJvWlNCMllXeDFaU0J2WmlCaElIWmhiSFZsTGlCVWNubHpJSFJ2SUhCeWFXNTBJSFJvWlNCMllXeDFaU0J2ZFhSY2JpQXFJR2x1SUhSb1pTQmlaWE4wSUhkaGVTQndiM056YVdKc1pTQm5hWFpsYmlCMGFHVWdaR2xtWm1WeVpXNTBJSFI1Y0dWekxseHVJQ3BjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdlltb2dWR2hsSUc5aWFtVmpkQ0IwYnlCd2NtbHVkQ0J2ZFhRdVhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiM0IwY3lCUGNIUnBiMjVoYkNCdmNIUnBiMjV6SUc5aWFtVmpkQ0IwYUdGMElHRnNkR1Z5Y3lCMGFHVWdiM1YwY0hWMExseHVJQ292WEc0dktpQnNaV2RoWTNrNklHOWlhaXdnYzJodmQwaHBaR1JsYml3Z1pHVndkR2dzSUdOdmJHOXljeW92WEc1bWRXNWpkR2x2YmlCcGJuTndaV04wS0c5aWFpd2diM0IwY3lrZ2UxeHVJQ0F2THlCa1pXWmhkV3gwSUc5d2RHbHZibk5jYmlBZ2RtRnlJR04wZUNBOUlIdGNiaUFnSUNCelpXVnVPaUJiWFN4Y2JpQWdJQ0J6ZEhsc2FYcGxPaUJ6ZEhsc2FYcGxUbTlEYjJ4dmNseHVJQ0I5TzF4dUlDQXZMeUJzWldkaFkza3VMaTVjYmlBZ2FXWWdLR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZ2dQajBnTXlrZ1kzUjRMbVJsY0hSb0lEMGdZWEpuZFcxbGJuUnpXekpkTzF4dUlDQnBaaUFvWVhKbmRXMWxiblJ6TG14bGJtZDBhQ0ErUFNBMEtTQmpkSGd1WTI5c2IzSnpJRDBnWVhKbmRXMWxiblJ6V3pOZE8xeHVJQ0JwWmlBb2FYTkNiMjlzWldGdUtHOXdkSE1wS1NCN1hHNGdJQ0FnTHk4Z2JHVm5ZV041TGk0dVhHNGdJQ0FnWTNSNExuTm9iM2RJYVdSa1pXNGdQU0J2Y0hSek8xeHVJQ0I5SUdWc2MyVWdhV1lnS0c5d2RITXBJSHRjYmlBZ0lDQXZMeUJuYjNRZ1lXNGdYQ0p2Y0hScGIyNXpYQ0lnYjJKcVpXTjBYRzRnSUNBZ1pYaHdiM0owY3k1ZlpYaDBaVzVrS0dOMGVDd2diM0IwY3lrN1hHNGdJSDFjYmlBZ0x5OGdjMlYwSUdSbFptRjFiSFFnYjNCMGFXOXVjMXh1SUNCcFppQW9hWE5WYm1SbFptbHVaV1FvWTNSNExuTm9iM2RJYVdSa1pXNHBLU0JqZEhndWMyaHZkMGhwWkdSbGJpQTlJR1poYkhObE8xeHVJQ0JwWmlBb2FYTlZibVJsWm1sdVpXUW9ZM1I0TG1SbGNIUm9LU2tnWTNSNExtUmxjSFJvSUQwZ01qdGNiaUFnYVdZZ0tHbHpWVzVrWldacGJtVmtLR04wZUM1amIyeHZjbk1wS1NCamRIZ3VZMjlzYjNKeklEMGdabUZzYzJVN1hHNGdJR2xtSUNocGMxVnVaR1ZtYVc1bFpDaGpkSGd1WTNWemRHOXRTVzV6Y0dWamRDa3BJR04wZUM1amRYTjBiMjFKYm5Od1pXTjBJRDBnZEhKMVpUdGNiaUFnYVdZZ0tHTjBlQzVqYjJ4dmNuTXBJR04wZUM1emRIbHNhWHBsSUQwZ2MzUjViR2w2WlZkcGRHaERiMnh2Y2p0Y2JpQWdjbVYwZFhKdUlHWnZjbTFoZEZaaGJIVmxLR04wZUN3Z2IySnFMQ0JqZEhndVpHVndkR2dwTzF4dWZWeHVaWGh3YjNKMGN5NXBibk53WldOMElEMGdhVzV6Y0dWamREdGNibHh1WEc0dkx5Qm9kSFJ3T2k4dlpXNHVkMmxyYVhCbFpHbGhMbTl5Wnk5M2FXdHBMMEZPVTBsZlpYTmpZWEJsWDJOdlpHVWpaM0poY0docFkzTmNibWx1YzNCbFkzUXVZMjlzYjNKeklEMGdlMXh1SUNBblltOXNaQ2NnT2lCYk1Td2dNakpkTEZ4dUlDQW5hWFJoYkdsakp5QTZJRnN6TENBeU0xMHNYRzRnSUNkMWJtUmxjbXhwYm1VbklEb2dXelFzSURJMFhTeGNiaUFnSjJsdWRtVnljMlVuSURvZ1d6Y3NJREkzWFN4Y2JpQWdKM2RvYVhSbEp5QTZJRnN6Tnl3Z016bGRMRnh1SUNBblozSmxlU2NnT2lCYk9UQXNJRE01WFN4Y2JpQWdKMkpzWVdOckp5QTZJRnN6TUN3Z016bGRMRnh1SUNBbllteDFaU2NnT2lCYk16UXNJRE01WFN4Y2JpQWdKMk41WVc0bklEb2dXek0yTENBek9WMHNYRzRnSUNkbmNtVmxiaWNnT2lCYk16SXNJRE01WFN4Y2JpQWdKMjFoWjJWdWRHRW5JRG9nV3pNMUxDQXpPVjBzWEc0Z0lDZHlaV1FuSURvZ1d6TXhMQ0F6T1Ywc1hHNGdJQ2Q1Wld4c2IzY25JRG9nV3pNekxDQXpPVjFjYm4wN1hHNWNiaTh2SUVSdmJpZDBJSFZ6WlNBbllteDFaU2NnYm05MElIWnBjMmxpYkdVZ2IyNGdZMjFrTG1WNFpWeHVhVzV6Y0dWamRDNXpkSGxzWlhNZ1BTQjdYRzRnSUNkemNHVmphV0ZzSnpvZ0oyTjVZVzRuTEZ4dUlDQW5iblZ0WW1WeUp6b2dKM2xsYkd4dmR5Y3NYRzRnSUNkaWIyOXNaV0Z1SnpvZ0ozbGxiR3h2ZHljc1hHNGdJQ2QxYm1SbFptbHVaV1FuT2lBblozSmxlU2NzWEc0Z0lDZHVkV3hzSnpvZ0oySnZiR1FuTEZ4dUlDQW5jM1J5YVc1bkp6b2dKMmR5WldWdUp5eGNiaUFnSjJSaGRHVW5PaUFuYldGblpXNTBZU2NzWEc0Z0lDOHZJRndpYm1GdFpWd2lPaUJwYm5SbGJuUnBiMjVoYkd4NUlHNXZkQ0J6ZEhsc2FXNW5YRzRnSUNkeVpXZGxlSEFuT2lBbmNtVmtKMXh1ZlR0Y2JseHVYRzVtZFc1amRHbHZiaUJ6ZEhsc2FYcGxWMmwwYUVOdmJHOXlLSE4wY2l3Z2MzUjViR1ZVZVhCbEtTQjdYRzRnSUhaaGNpQnpkSGxzWlNBOUlHbHVjM0JsWTNRdWMzUjViR1Z6VzNOMGVXeGxWSGx3WlYwN1hHNWNiaUFnYVdZZ0tITjBlV3hsS1NCN1hHNGdJQ0FnY21WMGRYSnVJQ2RjWEhVd01ERmlXeWNnS3lCcGJuTndaV04wTG1OdmJHOXljMXR6ZEhsc1pWMWJNRjBnS3lBbmJTY2dLeUJ6ZEhJZ0sxeHVJQ0FnSUNBZ0lDQWdJQ0FuWEZ4MU1EQXhZbHNuSUNzZ2FXNXpjR1ZqZEM1amIyeHZjbk5iYzNSNWJHVmRXekZkSUNzZ0oyMG5PMXh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJSEpsZEhWeWJpQnpkSEk3WEc0Z0lIMWNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQnpkSGxzYVhwbFRtOURiMnh2Y2loemRISXNJSE4wZVd4bFZIbHdaU2tnZTF4dUlDQnlaWFIxY200Z2MzUnlPMXh1ZlZ4dVhHNWNibVoxYm1OMGFXOXVJR0Z5Y21GNVZHOUlZWE5vS0dGeWNtRjVLU0I3WEc0Z0lIWmhjaUJvWVhOb0lEMGdlMzA3WEc1Y2JpQWdZWEp5WVhrdVptOXlSV0ZqYUNobWRXNWpkR2x2YmloMllXd3NJR2xrZUNrZ2UxeHVJQ0FnSUdoaGMyaGJkbUZzWFNBOUlIUnlkV1U3WEc0Z0lIMHBPMXh1WEc0Z0lISmxkSFZ5YmlCb1lYTm9PMXh1ZlZ4dVhHNWNibVoxYm1OMGFXOXVJR1p2Y20xaGRGWmhiSFZsS0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeWtnZTF4dUlDQXZMeUJRY205MmFXUmxJR0VnYUc5dmF5Qm1iM0lnZFhObGNpMXpjR1ZqYVdacFpXUWdhVzV6Y0dWamRDQm1kVzVqZEdsdmJuTXVYRzRnSUM4dklFTm9aV05ySUhSb1lYUWdkbUZzZFdVZ2FYTWdZVzRnYjJKcVpXTjBJSGRwZEdnZ1lXNGdhVzV6Y0dWamRDQm1kVzVqZEdsdmJpQnZiaUJwZEZ4dUlDQnBaaUFvWTNSNExtTjFjM1J2YlVsdWMzQmxZM1FnSmlaY2JpQWdJQ0FnSUhaaGJIVmxJQ1ltWEc0Z0lDQWdJQ0JwYzBaMWJtTjBhVzl1S0haaGJIVmxMbWx1YzNCbFkzUXBJQ1ltWEc0Z0lDQWdJQ0F2THlCR2FXeDBaWElnYjNWMElIUm9aU0IxZEdsc0lHMXZaSFZzWlN3Z2FYUW5jeUJwYm5Od1pXTjBJR1oxYm1OMGFXOXVJR2x6SUhOd1pXTnBZV3hjYmlBZ0lDQWdJSFpoYkhWbExtbHVjM0JsWTNRZ0lUMDlJR1Y0Y0c5eWRITXVhVzV6Y0dWamRDQW1KbHh1SUNBZ0lDQWdMeThnUVd4emJ5Qm1hV3gwWlhJZ2IzVjBJR0Z1ZVNCd2NtOTBiM1I1Y0dVZ2IySnFaV04wY3lCMWMybHVaeUIwYUdVZ1kybHlZM1ZzWVhJZ1kyaGxZMnN1WEc0Z0lDQWdJQ0FoS0haaGJIVmxMbU52Ym5OMGNuVmpkRzl5SUNZbUlIWmhiSFZsTG1OdmJuTjBjblZqZEc5eUxuQnliM1J2ZEhsd1pTQTlQVDBnZG1Gc2RXVXBLU0I3WEc0Z0lDQWdkbUZ5SUhKbGRDQTlJSFpoYkhWbExtbHVjM0JsWTNRb2NtVmpkWEp6WlZScGJXVnpMQ0JqZEhncE8xeHVJQ0FnSUdsbUlDZ2hhWE5UZEhKcGJtY29jbVYwS1NrZ2UxeHVJQ0FnSUNBZ2NtVjBJRDBnWm05eWJXRjBWbUZzZFdVb1kzUjRMQ0J5WlhRc0lISmxZM1Z5YzJWVWFXMWxjeWs3WEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCeVpYUTdYRzRnSUgxY2JseHVJQ0F2THlCUWNtbHRhWFJwZG1VZ2RIbHdaWE1nWTJGdWJtOTBJR2hoZG1VZ2NISnZjR1Z5ZEdsbGMxeHVJQ0IyWVhJZ2NISnBiV2wwYVhabElEMGdabTl5YldGMFVISnBiV2wwYVhabEtHTjBlQ3dnZG1Gc2RXVXBPMXh1SUNCcFppQW9jSEpwYldsMGFYWmxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlIQnlhVzFwZEdsMlpUdGNiaUFnZlZ4dVhHNGdJQzh2SUV4dmIyc2dkWEFnZEdobElHdGxlWE1nYjJZZ2RHaGxJRzlpYW1WamRDNWNiaUFnZG1GeUlHdGxlWE1nUFNCUFltcGxZM1F1YTJWNWN5aDJZV3gxWlNrN1hHNGdJSFpoY2lCMmFYTnBZbXhsUzJWNWN5QTlJR0Z5Y21GNVZHOUlZWE5vS0d0bGVYTXBPMXh1WEc0Z0lHbG1JQ2hqZEhndWMyaHZkMGhwWkdSbGJpa2dlMXh1SUNBZ0lHdGxlWE1nUFNCUFltcGxZM1F1WjJWMFQzZHVVSEp2Y0dWeWRIbE9ZVzFsY3loMllXeDFaU2s3WEc0Z0lIMWNibHh1SUNBdkx5QkpSU0JrYjJWemJpZDBJRzFoYTJVZ1pYSnliM0lnWm1sbGJHUnpJRzV2YmkxbGJuVnRaWEpoWW14bFhHNGdJQzh2SUdoMGRIQTZMeTl0YzJSdUxtMXBZM0p2YzI5bWRDNWpiMjB2Wlc0dGRYTXZiR2xpY21GeWVTOXBaUzlrZDNjMU1uTmlkQ2gyUFhaekxqazBLUzVoYzNCNFhHNGdJR2xtSUNocGMwVnljbTl5S0haaGJIVmxLVnh1SUNBZ0lDQWdKaVlnS0d0bGVYTXVhVzVrWlhoUFppZ25iV1Z6YzJGblpTY3BJRDQ5SURBZ2ZId2dhMlY1Y3k1cGJtUmxlRTltS0Nka1pYTmpjbWx3ZEdsdmJpY3BJRDQ5SURBcEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdadmNtMWhkRVZ5Y205eUtIWmhiSFZsS1R0Y2JpQWdmVnh1WEc0Z0lDOHZJRk52YldVZ2RIbHdaU0J2WmlCdlltcGxZM1FnZDJsMGFHOTFkQ0J3Y205d1pYSjBhV1Z6SUdOaGJpQmlaU0J6YUc5eWRHTjFkSFJsWkM1Y2JpQWdhV1lnS0d0bGVYTXViR1Z1WjNSb0lEMDlQU0F3S1NCN1hHNGdJQ0FnYVdZZ0tHbHpSblZ1WTNScGIyNG9kbUZzZFdVcEtTQjdYRzRnSUNBZ0lDQjJZWElnYm1GdFpTQTlJSFpoYkhWbExtNWhiV1VnUHlBbk9pQW5JQ3NnZG1Gc2RXVXVibUZ0WlNBNklDY25PMXh1SUNBZ0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2RiUm5WdVkzUnBiMjRuSUNzZ2JtRnRaU0FySUNkZEp5d2dKM053WldOcFlXd25LVHRjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR2x6VW1WblJYaHdLSFpoYkhWbEtTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLRkpsWjBWNGNDNXdjbTkwYjNSNWNHVXVkRzlUZEhKcGJtY3VZMkZzYkNoMllXeDFaU2tzSUNkeVpXZGxlSEFuS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0dselJHRjBaU2gyWVd4MVpTa3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2hFWVhSbExuQnliM1J2ZEhsd1pTNTBiMU4wY21sdVp5NWpZV3hzS0haaGJIVmxLU3dnSjJSaGRHVW5LVHRjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR2x6UlhKeWIzSW9kbUZzZFdVcEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z1ptOXliV0YwUlhKeWIzSW9kbUZzZFdVcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lIWmhjaUJpWVhObElEMGdKeWNzSUdGeWNtRjVJRDBnWm1Gc2MyVXNJR0p5WVdObGN5QTlJRnNuZXljc0lDZDlKMTA3WEc1Y2JpQWdMeThnVFdGclpTQkJjbkpoZVNCellYa2dkR2hoZENCMGFHVjVJR0Z5WlNCQmNuSmhlVnh1SUNCcFppQW9hWE5CY25KaGVTaDJZV3gxWlNrcElIdGNiaUFnSUNCaGNuSmhlU0E5SUhSeWRXVTdYRzRnSUNBZ1luSmhZMlZ6SUQwZ1d5ZGJKeXdnSjEwblhUdGNiaUFnZlZ4dVhHNGdJQzh2SUUxaGEyVWdablZ1WTNScGIyNXpJSE5oZVNCMGFHRjBJSFJvWlhrZ1lYSmxJR1oxYm1OMGFXOXVjMXh1SUNCcFppQW9hWE5HZFc1amRHbHZiaWgyWVd4MVpTa3BJSHRjYmlBZ0lDQjJZWElnYmlBOUlIWmhiSFZsTG01aGJXVWdQeUFuT2lBbklDc2dkbUZzZFdVdWJtRnRaU0E2SUNjbk8xeHVJQ0FnSUdKaGMyVWdQU0FuSUZ0R2RXNWpkR2x2YmljZ0t5QnVJQ3NnSjEwbk8xeHVJQ0I5WEc1Y2JpQWdMeThnVFdGclpTQlNaV2RGZUhCeklITmhlU0IwYUdGMElIUm9aWGtnWVhKbElGSmxaMFY0Y0hOY2JpQWdhV1lnS0dselVtVm5SWGh3S0haaGJIVmxLU2tnZTF4dUlDQWdJR0poYzJVZ1BTQW5JQ2NnS3lCU1pXZEZlSEF1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcE8xeHVJQ0I5WEc1Y2JpQWdMeThnVFdGclpTQmtZWFJsY3lCM2FYUm9JSEJ5YjNCbGNuUnBaWE1nWm1seWMzUWdjMkY1SUhSb1pTQmtZWFJsWEc0Z0lHbG1JQ2hwYzBSaGRHVW9kbUZzZFdVcEtTQjdYRzRnSUNBZ1ltRnpaU0E5SUNjZ0p5QXJJRVJoZEdVdWNISnZkRzkwZVhCbExuUnZWVlJEVTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwTzF4dUlDQjlYRzVjYmlBZ0x5OGdUV0ZyWlNCbGNuSnZjaUIzYVhSb0lHMWxjM05oWjJVZ1ptbHljM1FnYzJGNUlIUm9aU0JsY25KdmNseHVJQ0JwWmlBb2FYTkZjbkp2Y2loMllXeDFaU2twSUh0Y2JpQWdJQ0JpWVhObElEMGdKeUFuSUNzZ1ptOXliV0YwUlhKeWIzSW9kbUZzZFdVcE8xeHVJQ0I5WEc1Y2JpQWdhV1lnS0d0bGVYTXViR1Z1WjNSb0lEMDlQU0F3SUNZbUlDZ2hZWEp5WVhrZ2ZId2dkbUZzZFdVdWJHVnVaM1JvSUQwOUlEQXBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHSnlZV05sYzFzd1hTQXJJR0poYzJVZ0t5QmljbUZqWlhOYk1WMDdYRzRnSUgxY2JseHVJQ0JwWmlBb2NtVmpkWEp6WlZScGJXVnpJRHdnTUNrZ2UxeHVJQ0FnSUdsbUlDaHBjMUpsWjBWNGNDaDJZV3gxWlNrcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTaFNaV2RGZUhBdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBMQ0FuY21WblpYaHdKeWs3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTZ25XMDlpYW1WamRGMG5MQ0FuYzNCbFkybGhiQ2NwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUdOMGVDNXpaV1Z1TG5CMWMyZ29kbUZzZFdVcE8xeHVYRzRnSUhaaGNpQnZkWFJ3ZFhRN1hHNGdJR2xtSUNoaGNuSmhlU2tnZTF4dUlDQWdJRzkxZEhCMWRDQTlJR1p2Y20xaGRFRnljbUY1S0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeXdnZG1semFXSnNaVXRsZVhNc0lHdGxlWE1wTzF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUc5MWRIQjFkQ0E5SUd0bGVYTXViV0Z3S0daMWJtTjBhVzl1S0d0bGVTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHWnZjbTFoZEZCeWIzQmxjblI1S0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeXdnZG1semFXSnNaVXRsZVhNc0lHdGxlU3dnWVhKeVlYa3BPMXh1SUNBZ0lIMHBPMXh1SUNCOVhHNWNiaUFnWTNSNExuTmxaVzR1Y0c5d0tDazdYRzVjYmlBZ2NtVjBkWEp1SUhKbFpIVmpaVlJ2VTJsdVoyeGxVM1J5YVc1bktHOTFkSEIxZEN3Z1ltRnpaU3dnWW5KaFkyVnpLVHRjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJtYjNKdFlYUlFjbWx0YVhScGRtVW9ZM1I0TENCMllXeDFaU2tnZTF4dUlDQnBaaUFvYVhOVmJtUmxabWx1WldRb2RtRnNkV1VwS1Z4dUlDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2duZFc1a1pXWnBibVZrSnl3Z0ozVnVaR1ZtYVc1bFpDY3BPMXh1SUNCcFppQW9hWE5UZEhKcGJtY29kbUZzZFdVcEtTQjdYRzRnSUNBZ2RtRnlJSE5wYlhCc1pTQTlJQ2RjWENjbklDc2dTbE5QVGk1emRISnBibWRwWm5rb2RtRnNkV1VwTG5KbGNHeGhZMlVvTDE1Y0lueGNJaVF2Wnl3Z0p5Y3BYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F1Y21Wd2JHRmpaU2d2Snk5bkxDQmNJbHhjWEZ3blhDSXBYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F1Y21Wd2JHRmpaU2d2WEZ4Y1hGd2lMMmNzSUNkY0lpY3BJQ3NnSjF4Y0p5YzdYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtITnBiWEJzWlN3Z0ozTjBjbWx1WnljcE8xeHVJQ0I5WEc0Z0lHbG1JQ2hwYzA1MWJXSmxjaWgyWVd4MVpTa3BYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDY25JQ3NnZG1Gc2RXVXNJQ2R1ZFcxaVpYSW5LVHRjYmlBZ2FXWWdLR2x6UW05dmJHVmhiaWgyWVd4MVpTa3BYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDY25JQ3NnZG1Gc2RXVXNJQ2RpYjI5c1pXRnVKeWs3WEc0Z0lDOHZJRVp2Y2lCemIyMWxJSEpsWVhOdmJpQjBlWEJsYjJZZ2JuVnNiQ0JwY3lCY0ltOWlhbVZqZEZ3aUxDQnpieUJ6Y0dWamFXRnNJR05oYzJVZ2FHVnlaUzVjYmlBZ2FXWWdLR2x6VG5Wc2JDaDJZV3gxWlNrcFhHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NkdWRXeHNKeXdnSjI1MWJHd25LVHRjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJtYjNKdFlYUkZjbkp2Y2loMllXeDFaU2tnZTF4dUlDQnlaWFIxY200Z0oxc25JQ3NnUlhKeWIzSXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwSUNzZ0oxMG5PMXh1ZlZ4dVhHNWNibVoxYm1OMGFXOXVJR1p2Y20xaGRFRnljbUY1S0dOMGVDd2dkbUZzZFdVc0lISmxZM1Z5YzJWVWFXMWxjeXdnZG1semFXSnNaVXRsZVhNc0lHdGxlWE1wSUh0Y2JpQWdkbUZ5SUc5MWRIQjFkQ0E5SUZ0ZE8xeHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Dd2diQ0E5SUhaaGJIVmxMbXhsYm1kMGFEc2dhU0E4SUd3N0lDc3JhU2tnZTF4dUlDQWdJR2xtSUNob1lYTlBkMjVRY205d1pYSjBlU2gyWVd4MVpTd2dVM1J5YVc1bktHa3BLU2tnZTF4dUlDQWdJQ0FnYjNWMGNIVjBMbkIxYzJnb1ptOXliV0YwVUhKdmNHVnlkSGtvWTNSNExDQjJZV3gxWlN3Z2NtVmpkWEp6WlZScGJXVnpMQ0IyYVhOcFlteGxTMlY1Y3l4Y2JpQWdJQ0FnSUNBZ0lDQlRkSEpwYm1jb2FTa3NJSFJ5ZFdVcEtUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnYjNWMGNIVjBMbkIxYzJnb0p5Y3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dUlDQnJaWGx6TG1admNrVmhZMmdvWm5WdVkzUnBiMjRvYTJWNUtTQjdYRzRnSUNBZ2FXWWdLQ0ZyWlhrdWJXRjBZMmdvTDE1Y1hHUXJKQzhwS1NCN1hHNGdJQ0FnSUNCdmRYUndkWFF1Y0hWemFDaG1iM0p0WVhSUWNtOXdaWEowZVNoamRIZ3NJSFpoYkhWbExDQnlaV04xY25ObFZHbHRaWE1zSUhacGMybGliR1ZMWlhsekxGeHVJQ0FnSUNBZ0lDQWdJR3RsZVN3Z2RISjFaU2twTzF4dUlDQWdJSDFjYmlBZ2ZTazdYRzRnSUhKbGRIVnliaUJ2ZFhSd2RYUTdYRzU5WEc1Y2JseHVablZ1WTNScGIyNGdabTl5YldGMFVISnZjR1Z5ZEhrb1kzUjRMQ0IyWVd4MVpTd2djbVZqZFhKelpWUnBiV1Z6TENCMmFYTnBZbXhsUzJWNWN5d2dhMlY1TENCaGNuSmhlU2tnZTF4dUlDQjJZWElnYm1GdFpTd2djM1J5TENCa1pYTmpPMXh1SUNCa1pYTmpJRDBnVDJKcVpXTjBMbWRsZEU5M2JsQnliM0JsY25SNVJHVnpZM0pwY0hSdmNpaDJZV3gxWlN3Z2EyVjVLU0I4ZkNCN0lIWmhiSFZsT2lCMllXeDFaVnRyWlhsZElIMDdYRzRnSUdsbUlDaGtaWE5qTG1kbGRDa2dlMXh1SUNBZ0lHbG1JQ2hrWlhOakxuTmxkQ2tnZTF4dUlDQWdJQ0FnYzNSeUlEMGdZM1I0TG5OMGVXeHBlbVVvSjF0SFpYUjBaWEl2VTJWMGRHVnlYU2NzSUNkemNHVmphV0ZzSnlrN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJSE4wY2lBOUlHTjBlQzV6ZEhsc2FYcGxLQ2RiUjJWMGRHVnlYU2NzSUNkemNHVmphV0ZzSnlrN1hHNGdJQ0FnZlZ4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUdsbUlDaGtaWE5qTG5ObGRDa2dlMXh1SUNBZ0lDQWdjM1J5SUQwZ1kzUjRMbk4wZVd4cGVtVW9KMXRUWlhSMFpYSmRKeXdnSjNOd1pXTnBZV3duS1R0Y2JpQWdJQ0I5WEc0Z0lIMWNiaUFnYVdZZ0tDRm9ZWE5QZDI1UWNtOXdaWEowZVNoMmFYTnBZbXhsUzJWNWN5d2dhMlY1S1NrZ2UxeHVJQ0FnSUc1aGJXVWdQU0FuV3ljZ0t5QnJaWGtnS3lBblhTYzdYRzRnSUgxY2JpQWdhV1lnS0NGemRISXBJSHRjYmlBZ0lDQnBaaUFvWTNSNExuTmxaVzR1YVc1a1pYaFBaaWhrWlhOakxuWmhiSFZsS1NBOElEQXBJSHRjYmlBZ0lDQWdJR2xtSUNocGMwNTFiR3dvY21WamRYSnpaVlJwYldWektTa2dlMXh1SUNBZ0lDQWdJQ0J6ZEhJZ1BTQm1iM0p0WVhSV1lXeDFaU2hqZEhnc0lHUmxjMk11ZG1Gc2RXVXNJRzUxYkd3cE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ2MzUnlJRDBnWm05eWJXRjBWbUZzZFdVb1kzUjRMQ0JrWlhOakxuWmhiSFZsTENCeVpXTjFjbk5sVkdsdFpYTWdMU0F4S1R0Y2JpQWdJQ0FnSUgxY2JpQWdJQ0FnSUdsbUlDaHpkSEl1YVc1a1pYaFBaaWduWEZ4dUp5a2dQaUF0TVNrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvWVhKeVlYa3BJSHRjYmlBZ0lDQWdJQ0FnSUNCemRISWdQU0J6ZEhJdWMzQnNhWFFvSjF4Y2JpY3BMbTFoY0NobWRXNWpkR2x2Ymloc2FXNWxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z0p5QWdKeUFySUd4cGJtVTdYRzRnSUNBZ0lDQWdJQ0FnZlNrdWFtOXBiaWduWEZ4dUp5a3VjM1ZpYzNSeUtESXBPMXh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUhOMGNpQTlJQ2RjWEc0bklDc2djM1J5TG5Od2JHbDBLQ2RjWEc0bktTNXRZWEFvWm5WdVkzUnBiMjRvYkdsdVpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUNjZ0lDQW5JQ3NnYkdsdVpUdGNiaUFnSUNBZ0lDQWdJQ0I5S1M1cWIybHVLQ2RjWEc0bktUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmVnh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNCemRISWdQU0JqZEhndWMzUjViR2w2WlNnblcwTnBjbU4xYkdGeVhTY3NJQ2R6Y0dWamFXRnNKeWs3WEc0Z0lDQWdmVnh1SUNCOVhHNGdJR2xtSUNocGMxVnVaR1ZtYVc1bFpDaHVZVzFsS1NrZ2UxeHVJQ0FnSUdsbUlDaGhjbkpoZVNBbUppQnJaWGt1YldGMFkyZ29MMTVjWEdRckpDOHBLU0I3WEc0Z0lDQWdJQ0J5WlhSMWNtNGdjM1J5TzF4dUlDQWdJSDFjYmlBZ0lDQnVZVzFsSUQwZ1NsTlBUaTV6ZEhKcGJtZHBabmtvSnljZ0t5QnJaWGtwTzF4dUlDQWdJR2xtSUNodVlXMWxMbTFoZEdOb0tDOWVYQ0lvVzJFdGVrRXRXbDlkVzJFdGVrRXRXbDh3TFRsZEtpbGNJaVF2S1NrZ2UxeHVJQ0FnSUNBZ2JtRnRaU0E5SUc1aGJXVXVjM1ZpYzNSeUtERXNJRzVoYldVdWJHVnVaM1JvSUMwZ01pazdYRzRnSUNBZ0lDQnVZVzFsSUQwZ1kzUjRMbk4wZVd4cGVtVW9ibUZ0WlN3Z0oyNWhiV1VuS1R0Y2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdibUZ0WlNBOUlHNWhiV1V1Y21Wd2JHRmpaU2d2Snk5bkxDQmNJbHhjWEZ3blhDSXBYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQzV5WlhCc1lXTmxLQzljWEZ4Y1hDSXZaeXdnSjF3aUp5bGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdMbkpsY0d4aFkyVW9MeWhlWENKOFhDSWtLUzluTENCY0lpZGNJaWs3WEc0Z0lDQWdJQ0J1WVcxbElEMGdZM1I0TG5OMGVXeHBlbVVvYm1GdFpTd2dKM04wY21sdVp5Y3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQnVZVzFsSUNzZ0p6b2dKeUFySUhOMGNqdGNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQnlaV1IxWTJWVWIxTnBibWRzWlZOMGNtbHVaeWh2ZFhSd2RYUXNJR0poYzJVc0lHSnlZV05sY3lrZ2UxeHVJQ0IyWVhJZ2JuVnRUR2x1WlhORmMzUWdQU0F3TzF4dUlDQjJZWElnYkdWdVozUm9JRDBnYjNWMGNIVjBMbkpsWkhWalpTaG1kVzVqZEdsdmJpaHdjbVYyTENCamRYSXBJSHRjYmlBZ0lDQnVkVzFNYVc1bGMwVnpkQ3NyTzF4dUlDQWdJR2xtSUNoamRYSXVhVzVrWlhoUFppZ25YRnh1SnlrZ1BqMGdNQ2tnYm5WdFRHbHVaWE5GYzNRckt6dGNiaUFnSUNCeVpYUjFjbTRnY0hKbGRpQXJJR04xY2k1eVpYQnNZV05sS0M5Y1hIVXdNREZpWEZ4YlhGeGtYRnhrUDIwdlp5d2dKeWNwTG14bGJtZDBhQ0FySURFN1hHNGdJSDBzSURBcE8xeHVYRzRnSUdsbUlDaHNaVzVuZEdnZ1BpQTJNQ2tnZTF4dUlDQWdJSEpsZEhWeWJpQmljbUZqWlhOYk1GMGdLMXh1SUNBZ0lDQWdJQ0FnSUNBb1ltRnpaU0E5UFQwZ0p5Y2dQeUFuSnlBNklHSmhjMlVnS3lBblhGeHVJQ2NwSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdKeUFuSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdiM1YwY0hWMExtcHZhVzRvSnl4Y1hHNGdJQ2NwSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdKeUFuSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdZbkpoWTJWeld6RmRPMXh1SUNCOVhHNWNiaUFnY21WMGRYSnVJR0p5WVdObGMxc3dYU0FySUdKaGMyVWdLeUFuSUNjZ0t5QnZkWFJ3ZFhRdWFtOXBiaWduTENBbktTQXJJQ2NnSnlBcklHSnlZV05sYzFzeFhUdGNibjFjYmx4dVhHNHZMeUJPVDFSRk9pQlVhR1Z6WlNCMGVYQmxJR05vWldOcmFXNW5JR1oxYm1OMGFXOXVjeUJwYm5SbGJuUnBiMjVoYkd4NUlHUnZiaWQwSUhWelpTQmdhVzV6ZEdGdVkyVnZabUJjYmk4dklHSmxZMkYxYzJVZ2FYUWdhWE1nWm5KaFoybHNaU0JoYm1RZ1kyRnVJR0psSUdWaGMybHNlU0JtWVd0bFpDQjNhWFJvSUdCUFltcGxZM1F1WTNKbFlYUmxLQ2xnTGx4dVpuVnVZM1JwYjI0Z2FYTkJjbkpoZVNoaGNpa2dlMXh1SUNCeVpYUjFjbTRnUVhKeVlYa3VhWE5CY25KaGVTaGhjaWs3WEc1OVhHNWxlSEJ2Y25SekxtbHpRWEp5WVhrZ1BTQnBjMEZ5Y21GNU8xeHVYRzVtZFc1amRHbHZiaUJwYzBKdmIyeGxZVzRvWVhKbktTQjdYRzRnSUhKbGRIVnliaUIwZVhCbGIyWWdZWEpuSUQwOVBTQW5ZbTl2YkdWaGJpYzdYRzU5WEc1bGVIQnZjblJ6TG1selFtOXZiR1ZoYmlBOUlHbHpRbTl2YkdWaGJqdGNibHh1Wm5WdVkzUnBiMjRnYVhOT2RXeHNLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdZWEpuSUQwOVBTQnVkV3hzTzF4dWZWeHVaWGh3YjNKMGN5NXBjMDUxYkd3Z1BTQnBjMDUxYkd3N1hHNWNibVoxYm1OMGFXOXVJR2x6VG5Wc2JFOXlWVzVrWldacGJtVmtLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdZWEpuSUQwOUlHNTFiR3c3WEc1OVhHNWxlSEJ2Y25SekxtbHpUblZzYkU5eVZXNWtaV1pwYm1Wa0lEMGdhWE5PZFd4c1QzSlZibVJsWm1sdVpXUTdYRzVjYm1aMWJtTjBhVzl1SUdselRuVnRZbVZ5S0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKMjUxYldKbGNpYzdYRzU5WEc1bGVIQnZjblJ6TG1selRuVnRZbVZ5SUQwZ2FYTk9kVzFpWlhJN1hHNWNibVoxYm1OMGFXOXVJR2x6VTNSeWFXNW5LR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0ozTjBjbWx1WnljN1hHNTlYRzVsZUhCdmNuUnpMbWx6VTNSeWFXNW5JRDBnYVhOVGRISnBibWM3WEc1Y2JtWjFibU4wYVc5dUlHbHpVM2x0WW05c0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z2RIbHdaVzltSUdGeVp5QTlQVDBnSjNONWJXSnZiQ2M3WEc1OVhHNWxlSEJ2Y25SekxtbHpVM2x0WW05c0lEMGdhWE5UZVcxaWIydzdYRzVjYm1aMWJtTjBhVzl1SUdselZXNWtaV1pwYm1Wa0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z1lYSm5JRDA5UFNCMmIybGtJREE3WEc1OVhHNWxlSEJ2Y25SekxtbHpWVzVrWldacGJtVmtJRDBnYVhOVmJtUmxabWx1WldRN1hHNWNibVoxYm1OMGFXOXVJR2x6VW1WblJYaHdLSEpsS1NCN1hHNGdJSEpsZEhWeWJpQnBjMDlpYW1WamRDaHlaU2tnSmlZZ2IySnFaV04wVkc5VGRISnBibWNvY21VcElEMDlQU0FuVzI5aWFtVmpkQ0JTWldkRmVIQmRKenRjYm4xY2JtVjRjRzl5ZEhNdWFYTlNaV2RGZUhBZ1BTQnBjMUpsWjBWNGNEdGNibHh1Wm5WdVkzUnBiMjRnYVhOUFltcGxZM1FvWVhKbktTQjdYRzRnSUhKbGRIVnliaUIwZVhCbGIyWWdZWEpuSUQwOVBTQW5iMkpxWldOMEp5QW1KaUJoY21jZ0lUMDlJRzUxYkd3N1hHNTlYRzVsZUhCdmNuUnpMbWx6VDJKcVpXTjBJRDBnYVhOUFltcGxZM1E3WEc1Y2JtWjFibU4wYVc5dUlHbHpSR0YwWlNoa0tTQjdYRzRnSUhKbGRIVnliaUJwYzA5aWFtVmpkQ2hrS1NBbUppQnZZbXBsWTNSVWIxTjBjbWx1Wnloa0tTQTlQVDBnSjF0dlltcGxZM1FnUkdGMFpWMG5PMXh1ZlZ4dVpYaHdiM0owY3k1cGMwUmhkR1VnUFNCcGMwUmhkR1U3WEc1Y2JtWjFibU4wYVc5dUlHbHpSWEp5YjNJb1pTa2dlMXh1SUNCeVpYUjFjbTRnYVhOUFltcGxZM1FvWlNrZ0ppWmNiaUFnSUNBZ0lDaHZZbXBsWTNSVWIxTjBjbWx1WnlobEtTQTlQVDBnSjF0dlltcGxZM1FnUlhKeWIzSmRKeUI4ZkNCbElHbHVjM1JoYm1ObGIyWWdSWEp5YjNJcE8xeHVmVnh1Wlhod2IzSjBjeTVwYzBWeWNtOXlJRDBnYVhORmNuSnZjanRjYmx4dVpuVnVZM1JwYjI0Z2FYTkdkVzVqZEdsdmJpaGhjbWNwSUh0Y2JpQWdjbVYwZFhKdUlIUjVjR1Z2WmlCaGNtY2dQVDA5SUNkbWRXNWpkR2x2YmljN1hHNTlYRzVsZUhCdmNuUnpMbWx6Um5WdVkzUnBiMjRnUFNCcGMwWjFibU4wYVc5dU8xeHVYRzVtZFc1amRHbHZiaUJwYzFCeWFXMXBkR2wyWlNoaGNtY3BJSHRjYmlBZ2NtVjBkWEp1SUdGeVp5QTlQVDBnYm5Wc2JDQjhmRnh1SUNBZ0lDQWdJQ0FnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKMkp2YjJ4bFlXNG5JSHg4WEc0Z0lDQWdJQ0FnSUNCMGVYQmxiMllnWVhKbklEMDlQU0FuYm5WdFltVnlKeUI4ZkZ4dUlDQWdJQ0FnSUNBZ2RIbHdaVzltSUdGeVp5QTlQVDBnSjNOMGNtbHVaeWNnZkh4Y2JpQWdJQ0FnSUNBZ0lIUjVjR1Z2WmlCaGNtY2dQVDA5SUNkemVXMWliMnduSUh4OElDQXZMeUJGVXpZZ2MzbHRZbTlzWEc0Z0lDQWdJQ0FnSUNCMGVYQmxiMllnWVhKbklEMDlQU0FuZFc1a1pXWnBibVZrSnp0Y2JuMWNibVY0Y0c5eWRITXVhWE5RY21sdGFYUnBkbVVnUFNCcGMxQnlhVzFwZEdsMlpUdGNibHh1Wlhod2IzSjBjeTVwYzBKMVptWmxjaUE5SUhKbGNYVnBjbVVvSnk0dmMzVndjRzl5ZEM5cGMwSjFabVpsY2ljcE8xeHVYRzVtZFc1amRHbHZiaUJ2WW1wbFkzUlViMU4wY21sdVp5aHZLU0I3WEc0Z0lISmxkSFZ5YmlCUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29ieWs3WEc1OVhHNWNibHh1Wm5WdVkzUnBiMjRnY0dGa0tHNHBJSHRjYmlBZ2NtVjBkWEp1SUc0Z1BDQXhNQ0EvSUNjd0p5QXJJRzR1ZEc5VGRISnBibWNvTVRBcElEb2diaTUwYjFOMGNtbHVaeWd4TUNrN1hHNTlYRzVjYmx4dWRtRnlJRzF2Ym5Sb2N5QTlJRnNuU21GdUp5d2dKMFpsWWljc0lDZE5ZWEluTENBblFYQnlKeXdnSjAxaGVTY3NJQ2RLZFc0bkxDQW5TblZzSnl3Z0owRjFaeWNzSUNkVFpYQW5MRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQW5UMk4wSnl3Z0owNXZkaWNzSUNkRVpXTW5YVHRjYmx4dUx5OGdNallnUm1WaUlERTJPakU1T2pNMFhHNW1kVzVqZEdsdmJpQjBhVzFsYzNSaGJYQW9LU0I3WEc0Z0lIWmhjaUJrSUQwZ2JtVjNJRVJoZEdVb0tUdGNiaUFnZG1GeUlIUnBiV1VnUFNCYmNHRmtLR1F1WjJWMFNHOTFjbk1vS1Nrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUhCaFpDaGtMbWRsZEUxcGJuVjBaWE1vS1Nrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUhCaFpDaGtMbWRsZEZObFkyOXVaSE1vS1NsZExtcHZhVzRvSnpvbktUdGNiaUFnY21WMGRYSnVJRnRrTG1kbGRFUmhkR1VvS1N3Z2JXOXVkR2h6VzJRdVoyVjBUVzl1ZEdnb0tWMHNJSFJwYldWZExtcHZhVzRvSnlBbktUdGNibjFjYmx4dVhHNHZMeUJzYjJjZ2FYTWdhblZ6ZENCaElIUm9hVzRnZDNKaGNIQmxjaUIwYnlCamIyNXpiMnhsTG14dlp5QjBhR0YwSUhCeVpYQmxibVJ6SUdFZ2RHbHRaWE4wWVcxd1hHNWxlSEJ2Y25SekxteHZaeUE5SUdaMWJtTjBhVzl1S0NrZ2UxeHVJQ0JqYjI1emIyeGxMbXh2WnlnbkpYTWdMU0FsY3ljc0lIUnBiV1Z6ZEdGdGNDZ3BMQ0JsZUhCdmNuUnpMbVp2Y20xaGRDNWhjSEJzZVNobGVIQnZjblJ6TENCaGNtZDFiV1Z1ZEhNcEtUdGNibjA3WEc1Y2JseHVMeW9xWEc0Z0tpQkpibWhsY21sMElIUm9aU0J3Y205MGIzUjVjR1VnYldWMGFHOWtjeUJtY205dElHOXVaU0JqYjI1emRISjFZM1J2Y2lCcGJuUnZJR0Z1YjNSb1pYSXVYRzRnS2x4dUlDb2dWR2hsSUVaMWJtTjBhVzl1TG5CeWIzUnZkSGx3WlM1cGJtaGxjbWwwY3lCbWNtOXRJR3hoYm1jdWFuTWdjbVYzY21sMGRHVnVJR0Z6SUdFZ2MzUmhibVJoYkc5dVpWeHVJQ29nWm5WdVkzUnBiMjRnS0c1dmRDQnZiaUJHZFc1amRHbHZiaTV3Y205MGIzUjVjR1VwTGlCT1QxUkZPaUJKWmlCMGFHbHpJR1pwYkdVZ2FYTWdkRzhnWW1VZ2JHOWhaR1ZrWEc0Z0tpQmtkWEpwYm1jZ1ltOXZkSE4wY21Gd2NHbHVaeUIwYUdseklHWjFibU4wYVc5dUlHNWxaV1J6SUhSdklHSmxJSEpsZDNKcGRIUmxiaUIxYzJsdVp5QnpiMjFsSUc1aGRHbDJaVnh1SUNvZ1puVnVZM1JwYjI1eklHRnpJSEJ5YjNSdmRIbHdaU0J6WlhSMWNDQjFjMmx1WnlCdWIzSnRZV3dnU21GMllWTmpjbWx3ZENCa2IyVnpJRzV2ZENCM2IzSnJJR0Z6WEc0Z0tpQmxlSEJsWTNSbFpDQmtkWEpwYm1jZ1ltOXZkSE4wY21Gd2NHbHVaeUFvYzJWbElHMXBjbkp2Y2k1cWN5QnBiaUJ5TVRFME9UQXpLUzVjYmlBcVhHNGdLaUJBY0dGeVlXMGdlMloxYm1OMGFXOXVmU0JqZEc5eUlFTnZibk4wY25WamRHOXlJR1oxYm1OMGFXOXVJSGRvYVdOb0lHNWxaV1J6SUhSdklHbHVhR1Z5YVhRZ2RHaGxYRzRnS2lBZ0lDQWdjSEp2ZEc5MGVYQmxMbHh1SUNvZ1FIQmhjbUZ0SUh0bWRXNWpkR2x2Ym4wZ2MzVndaWEpEZEc5eUlFTnZibk4wY25WamRHOXlJR1oxYm1OMGFXOXVJSFJ2SUdsdWFHVnlhWFFnY0hKdmRHOTBlWEJsSUdaeWIyMHVYRzRnS2k5Y2JtVjRjRzl5ZEhNdWFXNW9aWEpwZEhNZ1BTQnlaWEYxYVhKbEtDZHBibWhsY21sMGN5Y3BPMXh1WEc1bGVIQnZjblJ6TGw5bGVIUmxibVFnUFNCbWRXNWpkR2x2YmlodmNtbG5hVzRzSUdGa1pDa2dlMXh1SUNBdkx5QkViMjRuZENCa2J5QmhibmwwYUdsdVp5QnBaaUJoWkdRZ2FYTnVKM1FnWVc0Z2IySnFaV04wWEc0Z0lHbG1JQ2doWVdSa0lIeDhJQ0ZwYzA5aWFtVmpkQ2hoWkdRcEtTQnlaWFIxY200Z2IzSnBaMmx1TzF4dVhHNGdJSFpoY2lCclpYbHpJRDBnVDJKcVpXTjBMbXRsZVhNb1lXUmtLVHRjYmlBZ2RtRnlJR2tnUFNCclpYbHpMbXhsYm1kMGFEdGNiaUFnZDJocGJHVWdLR2t0TFNrZ2UxeHVJQ0FnSUc5eWFXZHBibHRyWlhselcybGRYU0E5SUdGa1pGdHJaWGx6VzJsZFhUdGNiaUFnZlZ4dUlDQnlaWFIxY200Z2IzSnBaMmx1TzF4dWZUdGNibHh1Wm5WdVkzUnBiMjRnYUdGelQzZHVVSEp2Y0dWeWRIa29iMkpxTENCd2NtOXdLU0I3WEc0Z0lISmxkSFZ5YmlCUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG1oaGMwOTNibEJ5YjNCbGNuUjVMbU5oYkd3b2IySnFMQ0J3Y205d0tUdGNibjFjYmlKZGZRPT0iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBTaGltbWluZyBzdGFydHMgaGVyZS5cbihmdW5jdGlvbigpIHtcbiAgLy8gVXRpbHMuXG4gIHZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi91dGlscycpLmxvZztcbiAgdmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICBtb2R1bGUuZXhwb3J0cy5icm93c2VyRGV0YWlscyA9IGJyb3dzZXJEZXRhaWxzO1xuICBtb2R1bGUuZXhwb3J0cy5leHRyYWN0VmVyc2lvbiA9IHJlcXVpcmUoJy4vdXRpbHMnKS5leHRyYWN0VmVyc2lvbjtcbiAgbW9kdWxlLmV4cG9ydHMuZGlzYWJsZUxvZyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5kaXNhYmxlTG9nO1xuXG4gIC8vIENvbW1lbnQgb3V0IHRoZSBsaW5lIGJlbG93IGlmIHlvdSB3YW50IGxvZ2dpbmcgdG8gb2NjdXIsIGluY2x1ZGluZyBsb2dnaW5nXG4gIC8vIGZvciB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvdy4gQ2FuIGFsc28gYmUgdHVybmVkIG9uIGluIHRoZSBicm93c2VyIHZpYVxuICAvLyBhZGFwdGVyLmRpc2FibGVMb2coZmFsc2UpLCBidXQgdGhlbiBsb2dnaW5nIGZyb20gdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3dcbiAgLy8gd2lsbCBub3QgYXBwZWFyLlxuICByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZyh0cnVlKTtcblxuICAvLyBCcm93c2VyIHNoaW1zLlxuICB2YXIgY2hyb21lU2hpbSA9IHJlcXVpcmUoJy4vY2hyb21lL2Nocm9tZV9zaGltJykgfHwgbnVsbDtcbiAgdmFyIGVkZ2VTaGltID0gcmVxdWlyZSgnLi9lZGdlL2VkZ2Vfc2hpbScpIHx8IG51bGw7XG4gIHZhciBmaXJlZm94U2hpbSA9IHJlcXVpcmUoJy4vZmlyZWZveC9maXJlZm94X3NoaW0nKSB8fCBudWxsO1xuICB2YXIgc2FmYXJpU2hpbSA9IHJlcXVpcmUoJy4vc2FmYXJpL3NhZmFyaV9zaGltJykgfHwgbnVsbDtcblxuICAvLyBTaGltIGJyb3dzZXIgaWYgZm91bmQuXG4gIHN3aXRjaCAoYnJvd3NlckRldGFpbHMuYnJvd3Nlcikge1xuICAgIGNhc2UgJ29wZXJhJzogLy8gZmFsbHRocm91Z2ggYXMgaXQgdXNlcyBjaHJvbWUgc2hpbXNcbiAgICBjYXNlICdjaHJvbWUnOlxuICAgICAgaWYgKCFjaHJvbWVTaGltIHx8ICFjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdDaHJvbWUgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgY2hyb21lLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gY2hyb21lU2hpbTtcblxuICAgICAgY2hyb21lU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1Tb3VyY2VPYmplY3QoKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1PblRyYWNrKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmaXJlZm94JzpcbiAgICAgIGlmICghZmlyZWZveFNoaW0gfHwgIWZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdGaXJlZm94IHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGZpcmVmb3guJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBmaXJlZm94U2hpbTtcblxuICAgICAgZmlyZWZveFNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbVNvdXJjZU9iamVjdCgpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltT25UcmFjaygpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZWRnZSc6XG4gICAgICBpZiAoIWVkZ2VTaGltIHx8ICFlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnTVMgZWRnZSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBlZGdlLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gZWRnZVNoaW07XG5cbiAgICAgIGVkZ2VTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2FmYXJpJzpcbiAgICAgIGlmICghc2FmYXJpU2hpbSkge1xuICAgICAgICBsb2dnaW5nKCdTYWZhcmkgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgc2FmYXJpLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gc2FmYXJpU2hpbTtcblxuICAgICAgc2FmYXJpU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbG9nZ2luZygnVW5zdXBwb3J0ZWQgYnJvd3NlciEnKTtcbiAgfVxufSkoKTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykuYnJvd3NlckRldGFpbHM7XG5cbnZhciBjaHJvbWVTaGltID0ge1xuICBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJiAhKCdvbnRyYWNrJyBpblxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdvbnRyYWNrJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9vbnRyYWNrO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgaWYgKHRoaXMuX29udHJhY2spIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayA9IGYpO1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAvLyBvbmFkZHN0cmVhbSBkb2VzIG5vdCBmaXJlIHdoZW4gYSB0cmFjayBpcyBhZGRlZCB0byBhbiBleGlzdGluZ1xuICAgICAgICAgICAgLy8gc3RyZWFtLiBCdXQgc3RyZWFtLm9uYWRkdHJhY2sgaXMgaW1wbGVtZW50ZWQgc28gd2UgdXNlIHRoYXQuXG4gICAgICAgICAgICBlLnN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdhZGR0cmFjaycsIGZ1bmN0aW9uKHRlKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0ZS50cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRlLnRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGUuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICEoJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NyY09iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAvLyBVc2UgX3NyY09iamVjdCBhcyBhIHByaXZhdGUgcHJvcGVydHkgZm9yIHRoaXMgc2hpbVxuICAgICAgICAgICAgdGhpcy5fc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3JjKSB7XG4gICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5zcmMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXN0cmVhbSkge1xuICAgICAgICAgICAgICB0aGlzLnNyYyA9ICcnO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gcmVjcmVhdGUgdGhlIGJsb2IgdXJsIHdoZW4gYSB0cmFjayBpcyBhZGRlZCBvclxuICAgICAgICAgICAgLy8gcmVtb3ZlZC4gRG9pbmcgaXQgbWFudWFsbHkgc2luY2Ugd2Ugd2FudCB0byBhdm9pZCBhIHJlY3Vyc2lvbi5cbiAgICAgICAgICAgIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdhZGR0cmFjaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5zcmMpIHtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHNlbGYuc3JjKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ3JlbW92ZXRyYWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLnNyYykge1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoc2VsZi5zcmMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAvLyBUaGUgUlRDUGVlckNvbm5lY3Rpb24gb2JqZWN0LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKSB7XG4gICAgICAvLyBUcmFuc2xhdGUgaWNlVHJhbnNwb3J0UG9saWN5IHRvIGljZVRyYW5zcG9ydHMsXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD00ODY5XG4gICAgICBsb2dnaW5nKCdQZWVyQ29ubmVjdGlvbicpO1xuICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICBwY0NvbmZpZy5pY2VUcmFuc3BvcnRzID0gcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5O1xuICAgICAgfVxuXG4gICAgICB2YXIgcGMgPSBuZXcgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpO1xuICAgICAgdmFyIG9yaWdHZXRTdGF0cyA9IHBjLmdldFN0YXRzLmJpbmQocGMpO1xuICAgICAgcGMuZ2V0U3RhdHMgPSBmdW5jdGlvbihzZWxlY3Rvciwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgLy8gSWYgc2VsZWN0b3IgaXMgYSBmdW5jdGlvbiB0aGVuIHdlIGFyZSBpbiB0aGUgb2xkIHN0eWxlIHN0YXRzIHNvIGp1c3RcbiAgICAgICAgLy8gcGFzcyBiYWNrIHRoZSBvcmlnaW5hbCBnZXRTdGF0cyBmb3JtYXQgdG8gYXZvaWQgYnJlYWtpbmcgb2xkIHVzZXJzLlxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdHZXRTdGF0cyhzZWxlY3Rvciwgc3VjY2Vzc0NhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXhDaHJvbWVTdGF0c18gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIHZhciBzdGFuZGFyZFJlcG9ydCA9IHt9O1xuICAgICAgICAgIHZhciByZXBvcnRzID0gcmVzcG9uc2UucmVzdWx0KCk7XG4gICAgICAgICAgcmVwb3J0cy5mb3JFYWNoKGZ1bmN0aW9uKHJlcG9ydCkge1xuICAgICAgICAgICAgdmFyIHN0YW5kYXJkU3RhdHMgPSB7XG4gICAgICAgICAgICAgIGlkOiByZXBvcnQuaWQsXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogcmVwb3J0LnRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgdHlwZTogcmVwb3J0LnR5cGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXBvcnQubmFtZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgICAgc3RhbmRhcmRTdGF0c1tuYW1lXSA9IHJlcG9ydC5zdGF0KG5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGFuZGFyZFJlcG9ydFtzdGFuZGFyZFN0YXRzLmlkXSA9IHN0YW5kYXJkU3RhdHM7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gc3RhbmRhcmRSZXBvcnQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuICAgICAgICAgIHZhciBzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBhcmdzWzFdKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzLmFwcGx5KHRoaXMsIFtzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyxcbiAgICAgICAgICAgICAgYXJndW1lbnRzWzBdXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcm9taXNlLXN1cHBvcnRcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvcmlnR2V0U3RhdHMuYXBwbHkoc2VsZixcbiAgICAgICAgICAgICAgICBbZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUuYXBwbHkobnVsbCwgW2ZpeENocm9tZVN0YXRzXyhyZXNwb25zZSldKTtcbiAgICAgICAgICAgICAgICB9LCByZWplY3RdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JpZ0dldFN0YXRzLmFwcGx5KHNlbGYsIFtyZXNvbHZlLCByZWplY3RdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHBjO1xuICAgIH07XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcblxuICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXG4gICAgaWYgKHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGUpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBhZGQgcHJvbWlzZSBzdXBwb3J0XG4gICAgWydjcmVhdGVPZmZlcicsICdjcmVhdGVBbnN3ZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEgfHwgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMF0pID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICB2YXIgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFtyZXNvbHZlLCByZWplY3QsIG9wdHNdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBhcmdzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJyk/XG4gICAgICAgICAgICAgICAgUlRDSWNlQ2FuZGlkYXRlIDogUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKShhcmdzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFthcmdzWzBdLFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhcmdzWzFdLmFwcGx5KG51bGwsIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhcmdzWzJdLmFwcGx5KG51bGwsIFtlcnJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gIH0sXG5cbiAgLy8gQXR0YWNoIGEgbWVkaWEgc3RyZWFtIHRvIGFuIGVsZW1lbnQuXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbihlbGVtZW50LCBzdHJlYW0pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCBhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA+PSA0Mykge1xuICAgICAgZWxlbWVudC5zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZWxlbWVudC5zcmMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBlbGVtZW50LnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2luZygnRXJyb3IgYXR0YWNoaW5nIHN0cmVhbSB0byBlbGVtZW50LicpO1xuICAgIH1cbiAgfSxcblxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbih0bywgZnJvbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIHJlYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPj0gNDMpIHtcbiAgICAgIHRvLnNyY09iamVjdCA9IGZyb20uc3JjT2JqZWN0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0by5zcmMgPSBmcm9tLnNyYztcbiAgICB9XG4gIH1cbn07XG5cblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1PblRyYWNrOiBjaHJvbWVTaGltLnNoaW1PblRyYWNrLFxuICBzaGltU291cmNlT2JqZWN0OiBjaHJvbWVTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJyksXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBjaHJvbWVTaGltLmF0dGFjaE1lZGlhU3RyZWFtLFxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBjaHJvbWVTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5sb2c7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb25zdHJhaW50c1RvQ2hyb21lXyA9IGZ1bmN0aW9uKGMpIHtcbiAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMubWFuZGF0b3J5IHx8IGMub3B0aW9uYWwpIHtcbiAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICB2YXIgY2MgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHIgPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID8gY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgci5taW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICB9XG4gICAgICB2YXIgb2xkbmFtZV8gPSBmdW5jdGlvbihwcmVmaXgsIG5hbWUpIHtcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIHJldHVybiBwcmVmaXggKyBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5hbWUgPT09ICdkZXZpY2VJZCcpID8gJ3NvdXJjZUlkJyA6IG5hbWU7XG4gICAgICB9O1xuICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYy5vcHRpb25hbCA9IGNjLm9wdGlvbmFsIHx8IFtdO1xuICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgaWYgKHR5cGVvZiByLmlkZWFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCdtaW4nLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgICAgb2MgPSB7fTtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWF4Jywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgIT09ICdudW1iZXInKSB7XG4gICAgICAgIGNjLm1hbmRhdG9yeSA9IGNjLm1hbmRhdG9yeSB8fCB7fTtcbiAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuZXhhY3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBbJ21pbicsICdtYXgnXS5mb3JFYWNoKGZ1bmN0aW9uKG1peCkge1xuICAgICAgICAgIGlmIChyW21peF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKG1peCwga2V5KV0gPSByW21peF07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYy5hZHZhbmNlZCkge1xuICAgICAgY2Mub3B0aW9uYWwgPSAoY2Mub3B0aW9uYWwgfHwgW10pLmNvbmNhdChjLmFkdmFuY2VkKTtcbiAgICB9XG4gICAgcmV0dXJuIGNjO1xuICB9O1xuXG4gIHZhciBnZXRVc2VyTWVkaWFfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgY29uc3RyYWludHMuYXVkaW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgfVxuICAgIGlmIChjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgfVxuICAgIGxvZ2dpbmcoJ2Nocm9tZTogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgcmV0dXJuIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH07XG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdCBvZiBnZXRVc2VyTWVkaWEgYXMgYSBQcm9taXNlLlxuICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyA9IHtcbiAgICAgIGdldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICBlbnVtZXJhdGVEZXZpY2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICB2YXIga2luZHMgPSB7YXVkaW86ICdhdWRpb2lucHV0JywgdmlkZW86ICd2aWRlb2lucHV0J307XG4gICAgICAgICAgcmV0dXJuIE1lZGlhU3RyZWFtVHJhY2suZ2V0U291cmNlcyhmdW5jdGlvbihkZXZpY2VzKSB7XG4gICAgICAgICAgICByZXNvbHZlKGRldmljZXMubWFwKGZ1bmN0aW9uKGRldmljZSkge1xuICAgICAgICAgICAgICByZXR1cm4ge2xhYmVsOiBkZXZpY2UubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAga2luZDoga2luZHNbZGV2aWNlLmtpbmRdLFxuICAgICAgICAgICAgICAgICAgICAgIGRldmljZUlkOiBkZXZpY2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JvdXBJZDogJyd9O1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQSBzaGltIGZvciBnZXRVc2VyTWVkaWEgbWV0aG9kIG9uIHRoZSBtZWRpYURldmljZXMgb2JqZWN0LlxuICAvLyBUT0RPKEthcHRlbkphbnNzb24pIHJlbW92ZSBvbmNlIGltcGxlbWVudGVkIGluIENocm9tZSBzdGFibGUuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgICByZXR1cm4gZ2V0VXNlck1lZGlhUHJvbWlzZV8oY29uc3RyYWludHMpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gRXZlbiB0aG91Z2ggQ2hyb21lIDQ1IGhhcyBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzIGFuZCBhIGdldFVzZXJNZWRpYVxuICAgIC8vIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBQcm9taXNlLCBpdCBkb2VzIG5vdCBhY2NlcHQgc3BlYy1zdHlsZVxuICAgIC8vIGNvbnN0cmFpbnRzLlxuICAgIHZhciBvcmlnR2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEuXG4gICAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjKSB7XG4gICAgICBpZiAoYykge1xuICAgICAgICBsb2dnaW5nKCdzcGVjOiAgICcgKyBKU09OLnN0cmluZ2lmeShjKSk7IC8vIHdoaXRlc3BhY2UgZm9yIGFsaWdubWVudFxuICAgICAgICBjLmF1ZGlvID0gY29uc3RyYWludHNUb0Nocm9tZV8oYy5hdWRpbyk7XG4gICAgICAgIGMudmlkZW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjLnZpZGVvKTtcbiAgICAgICAgbG9nZ2luZygnY2hyb21lOiAnICsgSlNPTi5zdHJpbmdpZnkoYykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLy8gRHVtbXkgZGV2aWNlY2hhbmdlIGV2ZW50IG1ldGhvZHMuXG4gIC8vIFRPRE8oS2FwdGVuSmFuc3NvbikgcmVtb3ZlIG9uY2UgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIHN0YWJsZS5cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb2dnaW5nKCdEdW1teSBtZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciBjYWxsZWQuJyk7XG4gICAgfTtcbiAgfVxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbi8vIFNEUCBoZWxwZXJzLlxudmFyIFNEUFV0aWxzID0ge307XG5cbi8vIEdlbmVyYXRlIGFuIGFscGhhbnVtZXJpYyBpZGVudGlmaWVyIGZvciBjbmFtZSBvciBtaWRzLlxuLy8gVE9ETzogdXNlIFVVSURzIGluc3RlYWQ/IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZC85ODI4ODNcblNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDEwKTtcbn07XG5cbi8vIFRoZSBSVENQIENOQU1FIHVzZWQgYnkgYWxsIHBlZXJjb25uZWN0aW9ucyBmcm9tIHRoZSBzYW1lIEpTLlxuU0RQVXRpbHMubG9jYWxDTmFtZSA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuXG4vLyBTcGxpdHMgU0RQIGludG8gbGluZXMsIGRlYWxpbmcgd2l0aCBib3RoIENSTEYgYW5kIExGLlxuU0RQVXRpbHMuc3BsaXRMaW5lcyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgcmV0dXJuIGJsb2IudHJpbSgpLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBsaW5lLnRyaW0oKTtcbiAgfSk7XG59O1xuLy8gU3BsaXRzIFNEUCBpbnRvIHNlc3Npb25wYXJ0IGFuZCBtZWRpYXNlY3Rpb25zLiBFbnN1cmVzIENSTEYuXG5TRFBVdGlscy5zcGxpdFNlY3Rpb25zID0gZnVuY3Rpb24oYmxvYikge1xuICB2YXIgcGFydHMgPSBibG9iLnNwbGl0KCdcXG5tPScpO1xuICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uKHBhcnQsIGluZGV4KSB7XG4gICAgcmV0dXJuIChpbmRleCA+IDAgPyAnbT0nICsgcGFydCA6IHBhcnQpLnRyaW0oKSArICdcXHJcXG4nO1xuICB9KTtcbn07XG5cbi8vIFJldHVybnMgbGluZXMgdGhhdCBzdGFydCB3aXRoIGEgY2VydGFpbiBwcmVmaXguXG5TRFBVdGlscy5tYXRjaFByZWZpeCA9IGZ1bmN0aW9uKGJsb2IsIHByZWZpeCkge1xuICByZXR1cm4gU0RQVXRpbHMuc3BsaXRMaW5lcyhibG9iKS5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBsaW5lLmluZGV4T2YocHJlZml4KSA9PT0gMDtcbiAgfSk7XG59O1xuXG4vLyBQYXJzZXMgYW4gSUNFIGNhbmRpZGF0ZSBsaW5lLiBTYW1wbGUgaW5wdXQ6XG4vLyBjYW5kaWRhdGU6NzAyNzg2MzUwIDIgdWRwIDQxODE5OTAyIDguOC44LjggNjA3NjkgdHlwIHJlbGF5IHJhZGRyIDguOC44Ljhcbi8vIHJwb3J0IDU1OTk2XCJcblNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHM7XG4gIC8vIFBhcnNlIGJvdGggdmFyaWFudHMuXG4gIGlmIChsaW5lLmluZGV4T2YoJ2E9Y2FuZGlkYXRlOicpID09PSAwKSB7XG4gICAgcGFydHMgPSBsaW5lLnN1YnN0cmluZygxMikuc3BsaXQoJyAnKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEwKS5zcGxpdCgnICcpO1xuICB9XG5cbiAgdmFyIGNhbmRpZGF0ZSA9IHtcbiAgICBmb3VuZGF0aW9uOiBwYXJ0c1swXSxcbiAgICBjb21wb25lbnQ6IHBhcnRzWzFdLFxuICAgIHByb3RvY29sOiBwYXJ0c1syXS50b0xvd2VyQ2FzZSgpLFxuICAgIHByaW9yaXR5OiBwYXJzZUludChwYXJ0c1szXSwgMTApLFxuICAgIGlwOiBwYXJ0c1s0XSxcbiAgICBwb3J0OiBwYXJzZUludChwYXJ0c1s1XSwgMTApLFxuICAgIC8vIHNraXAgcGFydHNbNl0gPT0gJ3R5cCdcbiAgICB0eXBlOiBwYXJ0c1s3XVxuICB9O1xuXG4gIGZvciAodmFyIGkgPSA4OyBpIDwgcGFydHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBzd2l0Y2ggKHBhcnRzW2ldKSB7XG4gICAgICBjYXNlICdyYWRkcic6XG4gICAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyA9IHBhcnRzW2kgKyAxXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdycG9ydCc6XG4gICAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCA9IHBhcnNlSW50KHBhcnRzW2kgKyAxXSwgMTApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RjcHR5cGUnOlxuICAgICAgICBjYW5kaWRhdGUudGNwVHlwZSA9IHBhcnRzW2kgKyAxXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiAvLyBVbmtub3duIGV4dGVuc2lvbnMgYXJlIHNpbGVudGx5IGlnbm9yZWQuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2FuZGlkYXRlO1xufTtcblxuLy8gVHJhbnNsYXRlcyBhIGNhbmRpZGF0ZSBvYmplY3QgaW50byBTRFAgY2FuZGlkYXRlIGF0dHJpYnV0ZS5cblNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gIHZhciBzZHAgPSBbXTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmZvdW5kYXRpb24pO1xuICBzZHAucHVzaChjYW5kaWRhdGUuY29tcG9uZW50KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByb3RvY29sLnRvVXBwZXJDYXNlKCkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUucHJpb3JpdHkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUuaXApO1xuICBzZHAucHVzaChjYW5kaWRhdGUucG9ydCk7XG5cbiAgdmFyIHR5cGUgPSBjYW5kaWRhdGUudHlwZTtcbiAgc2RwLnB1c2goJ3R5cCcpO1xuICBzZHAucHVzaCh0eXBlKTtcbiAgaWYgKHR5cGUgIT09ICdob3N0JyAmJiBjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MgJiZcbiAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCkge1xuICAgIHNkcC5wdXNoKCdyYWRkcicpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyk7IC8vIHdhczogcmVsQWRkclxuICAgIHNkcC5wdXNoKCdycG9ydCcpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCk7IC8vIHdhczogcmVsUG9ydFxuICB9XG4gIGlmIChjYW5kaWRhdGUudGNwVHlwZSAmJiBjYW5kaWRhdGUucHJvdG9jb2wudG9Mb3dlckNhc2UoKSA9PT0gJ3RjcCcpIHtcbiAgICBzZHAucHVzaCgndGNwdHlwZScpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS50Y3BUeXBlKTtcbiAgfVxuICByZXR1cm4gJ2NhbmRpZGF0ZTonICsgc2RwLmpvaW4oJyAnKTtcbn07XG5cbi8vIFBhcnNlcyBhbiBydHBtYXAgbGluZSwgcmV0dXJucyBSVENSdHBDb2RkZWNQYXJhbWV0ZXJzLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXJ0cG1hcDoxMTEgb3B1cy80ODAwMC8yXG5TRFBVdGlscy5wYXJzZVJ0cE1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgdmFyIHBhcnNlZCA9IHtcbiAgICBwYXlsb2FkVHlwZTogcGFyc2VJbnQocGFydHMuc2hpZnQoKSwgMTApIC8vIHdhczogaWRcbiAgfTtcblxuICBwYXJ0cyA9IHBhcnRzWzBdLnNwbGl0KCcvJyk7XG5cbiAgcGFyc2VkLm5hbWUgPSBwYXJ0c1swXTtcbiAgcGFyc2VkLmNsb2NrUmF0ZSA9IHBhcnNlSW50KHBhcnRzWzFdLCAxMCk7IC8vIHdhczogY2xvY2tyYXRlXG4gIC8vIHdhczogY2hhbm5lbHNcbiAgcGFyc2VkLm51bUNoYW5uZWxzID0gcGFydHMubGVuZ3RoID09PSAzID8gcGFyc2VJbnQocGFydHNbMl0sIDEwKSA6IDE7XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZSBhbiBhPXJ0cG1hcCBsaW5lIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yXG4vLyBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cE1hcCA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgcmV0dXJuICdhPXJ0cG1hcDonICsgcHQgKyAnICcgKyBjb2RlYy5uYW1lICsgJy8nICsgY29kZWMuY2xvY2tSYXRlICtcbiAgICAgIChjb2RlYy5udW1DaGFubmVscyAhPT0gMSA/ICcvJyArIGNvZGVjLm51bUNoYW5uZWxzIDogJycpICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgYW4gYT1leHRtYXAgbGluZSAoaGVhZGVyZXh0ZW5zaW9uIGZyb20gUkZDIDUyODUpLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWV4dG1hcDoyIHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcblNEUFV0aWxzLnBhcnNlRXh0bWFwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cig5KS5zcGxpdCgnICcpO1xuICByZXR1cm4ge1xuICAgIGlkOiBwYXJzZUludChwYXJ0c1swXSwgMTApLFxuICAgIHVyaTogcGFydHNbMV1cbiAgfTtcbn07XG5cbi8vIEdlbmVyYXRlcyBhPWV4dG1hcCBsaW5lIGZyb20gUlRDUnRwSGVhZGVyRXh0ZW5zaW9uUGFyYW1ldGVycyBvclxuLy8gUlRDUnRwSGVhZGVyRXh0ZW5zaW9uLlxuU0RQVXRpbHMud3JpdGVFeHRtYXAgPSBmdW5jdGlvbihoZWFkZXJFeHRlbnNpb24pIHtcbiAgcmV0dXJuICdhPWV4dG1hcDonICsgKGhlYWRlckV4dGVuc2lvbi5pZCB8fCBoZWFkZXJFeHRlbnNpb24ucHJlZmVycmVkSWQpICtcbiAgICAgICAnICcgKyBoZWFkZXJFeHRlbnNpb24udXJpICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgYW4gZnRtcCBsaW5lLCByZXR1cm5zIGRpY3Rpb25hcnkuIFNhbXBsZSBpbnB1dDpcbi8vIGE9Zm10cDo5NiB2YnI9b247Y25nPW9uXG4vLyBBbHNvIGRlYWxzIHdpdGggdmJyPW9uOyBjbmc9b25cblNEUFV0aWxzLnBhcnNlRm10cCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga3Y7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKGxpbmUuaW5kZXhPZignICcpICsgMSkuc3BsaXQoJzsnKTtcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJ0cy5sZW5ndGg7IGorKykge1xuICAgIGt2ID0gcGFydHNbal0udHJpbSgpLnNwbGl0KCc9Jyk7XG4gICAgcGFyc2VkW2t2WzBdLnRyaW0oKV0gPSBrdlsxXTtcbiAgfVxuICByZXR1cm4gcGFyc2VkO1xufTtcblxuLy8gR2VuZXJhdGVzIGFuIGE9ZnRtcCBsaW5lIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlRm10cCA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBsaW5lID0gJyc7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgaWYgKGNvZGVjLnBhcmFtZXRlcnMgJiYgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykubGVuZ3RoKSB7XG4gICAgdmFyIHBhcmFtcyA9IFtdO1xuICAgIE9iamVjdC5rZXlzKGNvZGVjLnBhcmFtZXRlcnMpLmZvckVhY2goZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgIHBhcmFtcy5wdXNoKHBhcmFtICsgJz0nICsgY29kZWMucGFyYW1ldGVyc1twYXJhbV0pO1xuICAgIH0pO1xuICAgIGxpbmUgKz0gJ2E9Zm10cDonICsgcHQgKyAnICcgKyBwYXJhbXMuam9pbignOycpICsgJ1xcclxcbic7XG4gIH1cbiAgcmV0dXJuIGxpbmU7XG59O1xuXG4vLyBQYXJzZXMgYW4gcnRjcC1mYiBsaW5lLCByZXR1cm5zIFJUQ1BSdGNwRmVlZGJhY2sgb2JqZWN0LiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXJ0Y3AtZmI6OTggbmFjayBycHNpXG5TRFBVdGlscy5wYXJzZVJ0Y3BGYiA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnICcpO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IHBhcnRzLnNoaWZ0KCksXG4gICAgcGFyYW1ldGVyOiBwYXJ0cy5qb2luKCcgJylcbiAgfTtcbn07XG4vLyBHZW5lcmF0ZSBhPXJ0Y3AtZmIgbGluZXMgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVSdGNwRmIgPSBmdW5jdGlvbihjb2RlYykge1xuICB2YXIgbGluZXMgPSAnJztcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICBpZiAoY29kZWMucnRjcEZlZWRiYWNrICYmIGNvZGVjLnJ0Y3BGZWVkYmFjay5sZW5ndGgpIHtcbiAgICAvLyBGSVhNRTogc3BlY2lhbCBoYW5kbGluZyBmb3IgdHJyLWludD9cbiAgICBjb2RlYy5ydGNwRmVlZGJhY2suZm9yRWFjaChmdW5jdGlvbihmYikge1xuICAgICAgbGluZXMgKz0gJ2E9cnRjcC1mYjonICsgcHQgKyAnICcgKyBmYi50eXBlICsgJyAnICsgZmIucGFyYW1ldGVyICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbGluZXM7XG59O1xuXG4vLyBQYXJzZXMgYW4gUkZDIDU1NzYgc3NyYyBtZWRpYSBhdHRyaWJ1dGUuIFNhbXBsZSBpbnB1dDpcbi8vIGE9c3NyYzozNzM1OTI4NTU5IGNuYW1lOnNvbWV0aGluZ1xuU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBzcCA9IGxpbmUuaW5kZXhPZignICcpO1xuICB2YXIgcGFydHMgPSB7XG4gICAgc3NyYzogcGFyc2VJbnQobGluZS5zdWJzdHIoNywgc3AgLSA3KSwgMTApXG4gIH07XG4gIHZhciBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicsIHNwKTtcbiAgaWYgKGNvbG9uID4gLTEpIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEsIGNvbG9uIC0gc3AgLSAxKTtcbiAgICBwYXJ0cy52YWx1ZSA9IGxpbmUuc3Vic3RyKGNvbG9uICsgMSk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHMuYXR0cmlidXRlID0gbGluZS5zdWJzdHIoc3AgKyAxKTtcbiAgfVxuICByZXR1cm4gcGFydHM7XG59O1xuXG4vLyBFeHRyYWN0cyBEVExTIHBhcmFtZXRlcnMgZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxuLy8gICBnZXQgdGhlIGZpbmdlcnByaW50IGxpbmUgYXMgaW5wdXQuIFNlZSBhbHNvIGdldEljZVBhcmFtZXRlcnMuXG5TRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAvLyBTZWFyY2ggaW4gc2Vzc2lvbiBwYXJ0LCB0b28uXG4gIGxpbmVzID0gbGluZXMuY29uY2F0KFNEUFV0aWxzLnNwbGl0TGluZXMoc2Vzc2lvbnBhcnQpKTtcbiAgdmFyIGZwTGluZSA9IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1maW5nZXJwcmludDonKSA9PT0gMDtcbiAgfSlbMF0uc3Vic3RyKDE0KTtcbiAgLy8gTm90ZTogYT1zZXR1cCBsaW5lIGlzIGlnbm9yZWQgc2luY2Ugd2UgdXNlIHRoZSAnYXV0bycgcm9sZS5cbiAgdmFyIGR0bHNQYXJhbWV0ZXJzID0ge1xuICAgIHJvbGU6ICdhdXRvJyxcbiAgICBmaW5nZXJwcmludHM6IFt7XG4gICAgICBhbGdvcml0aG06IGZwTGluZS5zcGxpdCgnICcpWzBdLFxuICAgICAgdmFsdWU6IGZwTGluZS5zcGxpdCgnICcpWzFdXG4gICAgfV1cbiAgfTtcbiAgcmV0dXJuIGR0bHNQYXJhbWV0ZXJzO1xufTtcblxuLy8gU2VyaWFsaXplcyBEVExTIHBhcmFtZXRlcnMgdG8gU0RQLlxuU0RQVXRpbHMud3JpdGVEdGxzUGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dXBUeXBlKSB7XG4gIHZhciBzZHAgPSAnYT1zZXR1cDonICsgc2V0dXBUeXBlICsgJ1xcclxcbic7XG4gIHBhcmFtcy5maW5nZXJwcmludHMuZm9yRWFjaChmdW5jdGlvbihmcCkge1xuICAgIHNkcCArPSAnYT1maW5nZXJwcmludDonICsgZnAuYWxnb3JpdGhtICsgJyAnICsgZnAudmFsdWUgKyAnXFxyXFxuJztcbiAgfSk7XG4gIHJldHVybiBzZHA7XG59O1xuLy8gUGFyc2VzIElDRSBpbmZvcm1hdGlvbiBmcm9tIFNEUCBtZWRpYSBzZWN0aW9uIG9yIHNlc3Npb25wYXJ0LlxuLy8gRklYTUU6IGZvciBjb25zaXN0ZW5jeSB3aXRoIG90aGVyIGZ1bmN0aW9ucyB0aGlzIHNob3VsZCBvbmx5XG4vLyAgIGdldCB0aGUgaWNlLXVmcmFnIGFuZCBpY2UtcHdkIGxpbmVzIGFzIGlucHV0LlxuU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAvLyBTZWFyY2ggaW4gc2Vzc2lvbiBwYXJ0LCB0b28uXG4gIGxpbmVzID0gbGluZXMuY29uY2F0KFNEUFV0aWxzLnNwbGl0TGluZXMoc2Vzc2lvbnBhcnQpKTtcbiAgdmFyIGljZVBhcmFtZXRlcnMgPSB7XG4gICAgdXNlcm5hbWVGcmFnbWVudDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9aWNlLXVmcmFnOicpID09PSAwO1xuICAgIH0pWzBdLnN1YnN0cigxMiksXG4gICAgcGFzc3dvcmQ6IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWljZS1wd2Q6JykgPT09IDA7XG4gICAgfSlbMF0uc3Vic3RyKDEwKVxuICB9O1xuICByZXR1cm4gaWNlUGFyYW1ldGVycztcbn07XG5cbi8vIFNlcmlhbGl6ZXMgSUNFIHBhcmFtZXRlcnMgdG8gU0RQLlxuU0RQVXRpbHMud3JpdGVJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gIHJldHVybiAnYT1pY2UtdWZyYWc6JyArIHBhcmFtcy51c2VybmFtZUZyYWdtZW50ICsgJ1xcclxcbicgK1xuICAgICAgJ2E9aWNlLXB3ZDonICsgcGFyYW1zLnBhc3N3b3JkICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgdGhlIFNEUCBtZWRpYSBzZWN0aW9uIGFuZCByZXR1cm5zIFJUQ1J0cFBhcmFtZXRlcnMuXG5TRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGRlc2NyaXB0aW9uID0ge1xuICAgIGNvZGVjczogW10sXG4gICAgaGVhZGVyRXh0ZW5zaW9uczogW10sXG4gICAgZmVjTWVjaGFuaXNtczogW10sXG4gICAgcnRjcDogW11cbiAgfTtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICB2YXIgbWxpbmUgPSBsaW5lc1swXS5zcGxpdCgnICcpO1xuICBmb3IgKHZhciBpID0gMzsgaSA8IG1saW5lLmxlbmd0aDsgaSsrKSB7IC8vIGZpbmQgYWxsIGNvZGVjcyBmcm9tIG1saW5lWzMuLl1cbiAgICB2YXIgcHQgPSBtbGluZVtpXTtcbiAgICB2YXIgcnRwbWFwbGluZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICBtZWRpYVNlY3Rpb24sICdhPXJ0cG1hcDonICsgcHQgKyAnICcpWzBdO1xuICAgIGlmIChydHBtYXBsaW5lKSB7XG4gICAgICB2YXIgY29kZWMgPSBTRFBVdGlscy5wYXJzZVJ0cE1hcChydHBtYXBsaW5lKTtcbiAgICAgIHZhciBmbXRwcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9Zm10cDonICsgcHQgKyAnICcpO1xuICAgICAgLy8gT25seSB0aGUgZmlyc3QgYT1mbXRwOjxwdD4gaXMgY29uc2lkZXJlZC5cbiAgICAgIGNvZGVjLnBhcmFtZXRlcnMgPSBmbXRwcy5sZW5ndGggPyBTRFBVdGlscy5wYXJzZUZtdHAoZm10cHNbMF0pIDoge307XG4gICAgICBjb2RlYy5ydGNwRmVlZGJhY2sgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgICBtZWRpYVNlY3Rpb24sICdhPXJ0Y3AtZmI6JyArIHB0ICsgJyAnKVxuICAgICAgICAubWFwKFNEUFV0aWxzLnBhcnNlUnRjcEZiKTtcbiAgICAgIGRlc2NyaXB0aW9uLmNvZGVjcy5wdXNoKGNvZGVjKTtcbiAgICAgIC8vIHBhcnNlIEZFQyBtZWNoYW5pc21zIGZyb20gcnRwbWFwIGxpbmVzLlxuICAgICAgc3dpdGNoIChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnUkVEJzpcbiAgICAgICAgY2FzZSAnVUxQRkVDJzpcbiAgICAgICAgICBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLnB1c2goY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDogLy8gb25seSBSRUQgYW5kIFVMUEZFQyBhcmUgcmVjb2duaXplZCBhcyBGRUMgbWVjaGFuaXNtcy5cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1leHRtYXA6JykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgZGVzY3JpcHRpb24uaGVhZGVyRXh0ZW5zaW9ucy5wdXNoKFNEUFV0aWxzLnBhcnNlRXh0bWFwKGxpbmUpKTtcbiAgfSk7XG4gIC8vIEZJWE1FOiBwYXJzZSBydGNwLlxuICByZXR1cm4gZGVzY3JpcHRpb247XG59O1xuXG4vLyBHZW5lcmF0ZXMgcGFydHMgb2YgdGhlIFNEUCBtZWRpYSBzZWN0aW9uIGRlc2NyaWJpbmcgdGhlIGNhcGFiaWxpdGllcyAvXG4vLyBwYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVSdHBEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGtpbmQsIGNhcHMpIHtcbiAgdmFyIHNkcCA9ICcnO1xuXG4gIC8vIEJ1aWxkIHRoZSBtbGluZS5cbiAgc2RwICs9ICdtPScgKyBraW5kICsgJyAnO1xuICBzZHAgKz0gY2Fwcy5jb2RlY3MubGVuZ3RoID4gMCA/ICc5JyA6ICcwJzsgLy8gcmVqZWN0IGlmIG5vIGNvZGVjcy5cbiAgc2RwICs9ICcgVURQL1RMUy9SVFAvU0FWUEYgJztcbiAgc2RwICs9IGNhcHMuY29kZWNzLm1hcChmdW5jdGlvbihjb2RlYykge1xuICAgIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gICAgfVxuICAgIHJldHVybiBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgfSkuam9pbignICcpICsgJ1xcclxcbic7XG5cbiAgc2RwICs9ICdjPUlOIElQNCAwLjAuMC4wXFxyXFxuJztcbiAgc2RwICs9ICdhPXJ0Y3A6OSBJTiBJUDQgMC4wLjAuMFxcclxcbic7XG5cbiAgLy8gQWRkIGE9cnRwbWFwIGxpbmVzIGZvciBlYWNoIGNvZGVjLiBBbHNvIGZtdHAgYW5kIHJ0Y3AtZmIuXG4gIGNhcHMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVSdHBNYXAoY29kZWMpO1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZUZtdHAoY29kZWMpO1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZVJ0Y3BGYihjb2RlYyk7XG4gIH0pO1xuICAvLyBGSVhNRTogYWRkIGhlYWRlckV4dGVuc2lvbnMsIGZlY01lY2hhbmlzbcWfIGFuZCBydGNwLlxuICBzZHAgKz0gJ2E9cnRjcC1tdXhcXHJcXG4nO1xuICByZXR1cm4gc2RwO1xufTtcblxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBhbiBhcnJheSBvZlxuLy8gUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzLlxuU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGVuY29kaW5nUGFyYW1ldGVycyA9IFtdO1xuICB2YXIgZGVzY3JpcHRpb24gPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIGhhc1JlZCA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignUkVEJykgIT09IC0xO1xuICB2YXIgaGFzVWxwZmVjID0gZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5pbmRleE9mKCdVTFBGRUMnKSAhPT0gLTE7XG5cbiAgLy8gZmlsdGVyIGE9c3NyYzouLi4gY25hbWU6LCBpZ25vcmUgUGxhbkItbXNpZFxuICB2YXIgc3NyY3MgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICB9KVxuICAuZmlsdGVyKGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgcmV0dXJuIHBhcnRzLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgfSk7XG4gIHZhciBwcmltYXJ5U3NyYyA9IHNzcmNzLmxlbmd0aCA+IDAgJiYgc3NyY3NbMF0uc3NyYztcbiAgdmFyIHNlY29uZGFyeVNzcmM7XG5cbiAgdmFyIGZsb3dzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjLWdyb3VwOkZJRCcpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJyAnKTtcbiAgICBwYXJ0cy5zaGlmdCgpO1xuICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHBhcnQsIDEwKTtcbiAgICB9KTtcbiAgfSk7XG4gIGlmIChmbG93cy5sZW5ndGggPiAwICYmIGZsb3dzWzBdLmxlbmd0aCA+IDEgJiYgZmxvd3NbMF1bMF0gPT09IHByaW1hcnlTc3JjKSB7XG4gICAgc2Vjb25kYXJ5U3NyYyA9IGZsb3dzWzBdWzFdO1xuICB9XG5cbiAgZGVzY3JpcHRpb24uY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnUlRYJyAmJiBjb2RlYy5wYXJhbWV0ZXJzLmFwdCkge1xuICAgICAgdmFyIGVuY1BhcmFtID0ge1xuICAgICAgICBzc3JjOiBwcmltYXJ5U3NyYyxcbiAgICAgICAgY29kZWNQYXlsb2FkVHlwZTogcGFyc2VJbnQoY29kZWMucGFyYW1ldGVycy5hcHQsIDEwKSxcbiAgICAgICAgcnR4OiB7XG4gICAgICAgICAgc3NyYzogc2Vjb25kYXJ5U3NyY1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgaWYgKGhhc1JlZCkge1xuICAgICAgICBlbmNQYXJhbSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZW5jUGFyYW0pKTtcbiAgICAgICAgZW5jUGFyYW0uZmVjID0ge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmMsXG4gICAgICAgICAgbWVjaGFuaXNtOiBoYXNVbHBmZWMgPyAncmVkK3VscGZlYycgOiAncmVkJ1xuICAgICAgICB9O1xuICAgICAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaChlbmNQYXJhbSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGggPT09IDAgJiYgcHJpbWFyeVNzcmMpIHtcbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaCh7XG4gICAgICBzc3JjOiBwcmltYXJ5U3NyY1xuICAgIH0pO1xuICB9XG5cbiAgLy8gd2Ugc3VwcG9ydCBib3RoIGI9QVMgYW5kIGI9VElBUyBidXQgaW50ZXJwcmV0IEFTIGFzIFRJQVMuXG4gIHZhciBiYW5kd2lkdGggPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdiPScpO1xuICBpZiAoYmFuZHdpZHRoLmxlbmd0aCkge1xuICAgIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1USUFTOicpID09PSAwKSB7XG4gICAgICBiYW5kd2lkdGggPSBwYXJzZUludChiYW5kd2lkdGhbMF0uc3Vic3RyKDcpLCAxMCk7XG4gICAgfSBlbHNlIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1BUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig1KSwgMTApO1xuICAgIH1cbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHBhcmFtcy5tYXhCaXRyYXRlID0gYmFuZHdpZHRoO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBlbmNvZGluZ1BhcmFtZXRlcnM7XG59O1xuXG5TRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBGSVhNRTogc2Vzcy1pZCBzaG91bGQgYmUgYW4gTlRQIHRpbWVzdGFtcC5cbiAgcmV0dXJuICd2PTBcXHJcXG4nICtcbiAgICAgICdvPXRoaXNpc2FkYXB0ZXJvcnRjIDgxNjk2Mzk5MTU2NDY5NDMxMzcgMiBJTiBJUDQgMTI3LjAuMC4xXFxyXFxuJyArXG4gICAgICAncz0tXFxyXFxuJyArXG4gICAgICAndD0wIDBcXHJcXG4nO1xufTtcblxuU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24gPSBmdW5jdGlvbih0cmFuc2NlaXZlciwgY2FwcywgdHlwZSwgc3RyZWFtKSB7XG4gIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uKHRyYW5zY2VpdmVyLmtpbmQsIGNhcHMpO1xuXG4gIC8vIE1hcCBJQ0UgcGFyYW1ldGVycyAodWZyYWcsIHB3ZCkgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVJY2VQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuZ2V0TG9jYWxQYXJhbWV0ZXJzKCkpO1xuXG4gIC8vIE1hcCBEVExTIHBhcmFtZXRlcnMgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVEdGxzUGFyYW1ldGVycyhcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuZ2V0TG9jYWxQYXJhbWV0ZXJzKCksXG4gICAgICB0eXBlID09PSAnb2ZmZXInID8gJ2FjdHBhc3MnIDogJ2FjdGl2ZScpO1xuXG4gIHNkcCArPSAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xuXG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZHJlY3ZcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIHNkcCArPSAnYT1zZW5kb25seVxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9cmVjdm9ubHlcXHJcXG4nO1xuICB9IGVsc2Uge1xuICAgIHNkcCArPSAnYT1pbmFjdGl2ZVxcclxcbic7XG4gIH1cblxuICAvLyBGSVhNRTogZm9yIFJUWCB0aGVyZSBtaWdodCBiZSBtdWx0aXBsZSBTU1JDcy4gTm90IGltcGxlbWVudGVkIGluIEVkZ2UgeWV0LlxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgdmFyIG1zaWQgPSAnbXNpZDonICsgc3RyZWFtLmlkICsgJyAnICtcbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnRyYWNrLmlkICsgJ1xcclxcbic7XG4gICAgc2RwICs9ICdhPScgKyBtc2lkO1xuICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgICAnICcgKyBtc2lkO1xuICB9XG4gIC8vIEZJWE1FOiB0aGlzIHNob3VsZCBiZSB3cml0dGVuIGJ5IHdyaXRlUnRwRGVzY3JpcHRpb24uXG4gIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgJyBjbmFtZTonICsgU0RQVXRpbHMubG9jYWxDTmFtZSArICdcXHJcXG4nO1xuICByZXR1cm4gc2RwO1xufTtcblxuLy8gR2V0cyB0aGUgZGlyZWN0aW9uIGZyb20gdGhlIG1lZGlhU2VjdGlvbiBvciB0aGUgc2Vzc2lvbnBhcnQuXG5TRFBVdGlscy5nZXREaXJlY3Rpb24gPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIC8vIExvb2sgZm9yIHNlbmRyZWN2LCBzZW5kb25seSwgcmVjdm9ubHksIGluYWN0aXZlLCBkZWZhdWx0IHRvIHNlbmRyZWN2LlxuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzd2l0Y2ggKGxpbmVzW2ldKSB7XG4gICAgICBjYXNlICdhPXNlbmRyZWN2JzpcbiAgICAgIGNhc2UgJ2E9c2VuZG9ubHknOlxuICAgICAgY2FzZSAnYT1yZWN2b25seSc6XG4gICAgICBjYXNlICdhPWluYWN0aXZlJzpcbiAgICAgICAgcmV0dXJuIGxpbmVzW2ldLnN1YnN0cigyKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIEZJWE1FOiBXaGF0IHNob3VsZCBoYXBwZW4gaGVyZT9cbiAgICB9XG4gIH1cbiAgaWYgKHNlc3Npb25wYXJ0KSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLmdldERpcmVjdGlvbihzZXNzaW9ucGFydCk7XG4gIH1cbiAgcmV0dXJuICdzZW5kcmVjdic7XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IFNEUFV0aWxzO1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTRFBVdGlscyA9IHJlcXVpcmUoJy4vZWRnZV9zZHAnKTtcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5sb2c7XG5cbnZhciBlZGdlU2hpbSA9IHtcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAod2luZG93LlJUQ0ljZUdhdGhlcmVyKSB7XG4gICAgICAvLyBPUlRDIGRlZmluZXMgYW4gUlRDSWNlQ2FuZGlkYXRlIG9iamVjdCBidXQgbm8gY29uc3RydWN0b3IuXG4gICAgICAvLyBOb3QgaW1wbGVtZW50ZWQgaW4gRWRnZS5cbiAgICAgIGlmICghd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSkge1xuICAgICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgIHJldHVybiBhcmdzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gT1JUQyBkb2VzIG5vdCBoYXZlIGEgc2Vzc2lvbiBkZXNjcmlwdGlvbiBvYmplY3QgYnV0XG4gICAgICAvLyBvdGhlciBicm93c2VycyAoaS5lLiBDaHJvbWUpIHRoYXQgd2lsbCBzdXBwb3J0IGJvdGggUEMgYW5kIE9SVENcbiAgICAgIC8vIGluIHRoZSBmdXR1cmUgbWlnaHQgaGF2ZSB0aGlzIGRlZmluZWQgYWxyZWFkeS5cbiAgICAgIGlmICghd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbikge1xuICAgICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgIHJldHVybiBhcmdzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgX2V2ZW50VGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgWydhZGRFdmVudExpc3RlbmVyJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAnZGlzcGF0Y2hFdmVudCddXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBzZWxmW21ldGhvZF0gPSBfZXZlbnRUYXJnZXRbbWV0aG9kXS5iaW5kKF9ldmVudFRhcmdldCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgIHRoaXMub25pY2VjYW5kaWRhdGUgPSBudWxsO1xuICAgICAgdGhpcy5vbmFkZHN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9udHJhY2sgPSBudWxsO1xuICAgICAgdGhpcy5vbnJlbW92ZXN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQgPSBudWxsO1xuICAgICAgdGhpcy5vbmRhdGFjaGFubmVsID0gbnVsbDtcblxuICAgICAgdGhpcy5sb2NhbFN0cmVhbXMgPSBbXTtcbiAgICAgIHRoaXMucmVtb3RlU3RyZWFtcyA9IFtdO1xuICAgICAgdGhpcy5nZXRMb2NhbFN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYubG9jYWxTdHJlYW1zO1xuICAgICAgfTtcbiAgICAgIHRoaXMuZ2V0UmVtb3RlU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5yZW1vdGVTdHJlYW1zO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICcnLFxuICAgICAgICBzZHA6ICcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24gPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHNkcDogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zaWduYWxpbmdTdGF0ZSA9ICdzdGFibGUnO1xuICAgICAgdGhpcy5pY2VDb25uZWN0aW9uU3RhdGUgPSAnbmV3JztcbiAgICAgIHRoaXMuaWNlR2F0aGVyaW5nU3RhdGUgPSAnbmV3JztcblxuICAgICAgdGhpcy5pY2VPcHRpb25zID0ge1xuICAgICAgICBnYXRoZXJQb2xpY3k6ICdhbGwnLFxuICAgICAgICBpY2VTZXJ2ZXJzOiBbXVxuICAgICAgfTtcbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICBzd2l0Y2ggKGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgICBjYXNlICdhbGwnOlxuICAgICAgICAgIGNhc2UgJ3JlbGF5JzpcbiAgICAgICAgICAgIHRoaXMuaWNlT3B0aW9ucy5nYXRoZXJQb2xpY3kgPSBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAvLyBGSVhNRTogcmVtb3ZlIG9uY2UgaW1wbGVtZW50YXRpb24gYW5kIHNwZWMgaGF2ZSBhZGRlZCB0aGlzLlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaWNlVHJhbnNwb3J0UG9saWN5IFwibm9uZVwiIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gZG9uJ3Qgc2V0IGljZVRyYW5zcG9ydFBvbGljeS5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5pY2VTZXJ2ZXJzKSB7XG4gICAgICAgIC8vIEVkZ2UgZG9lcyBub3QgbGlrZVxuICAgICAgICAvLyAxKSBzdHVuOlxuICAgICAgICAvLyAyKSB0dXJuOiB0aGF0IGRvZXMgbm90IGhhdmUgYWxsIG9mIHR1cm46aG9zdDpwb3J0P3RyYW5zcG9ydD11ZHBcbiAgICAgICAgdGhpcy5pY2VPcHRpb25zLmljZVNlcnZlcnMgPSBjb25maWcuaWNlU2VydmVycy5maWx0ZXIoZnVuY3Rpb24oc2VydmVyKSB7XG4gICAgICAgICAgaWYgKHNlcnZlciAmJiBzZXJ2ZXIudXJscykge1xuICAgICAgICAgICAgc2VydmVyLnVybHMgPSBzZXJ2ZXIudXJscy5maWx0ZXIoZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICAgIHJldHVybiB1cmwuaW5kZXhPZigndHVybjonKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgdXJsLmluZGV4T2YoJ3RyYW5zcG9ydD11ZHAnKSAhPT0gLTE7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIHJldHVybiAhIXNlcnZlci51cmxzO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBwZXItdHJhY2sgaWNlR2F0aGVycywgaWNlVHJhbnNwb3J0cywgZHRsc1RyYW5zcG9ydHMsIHJ0cFNlbmRlcnMsIC4uLlxuICAgICAgLy8gZXZlcnl0aGluZyB0aGF0IGlzIG5lZWRlZCB0byBkZXNjcmliZSBhIFNEUCBtLWxpbmUuXG4gICAgICB0aGlzLnRyYW5zY2VpdmVycyA9IFtdO1xuXG4gICAgICAvLyBzaW5jZSB0aGUgaWNlR2F0aGVyZXIgaXMgY3VycmVudGx5IGNyZWF0ZWQgaW4gY3JlYXRlT2ZmZXIgYnV0IHdlXG4gICAgICAvLyBtdXN0IG5vdCBlbWl0IGNhbmRpZGF0ZXMgdW50aWwgYWZ0ZXIgc2V0TG9jYWxEZXNjcmlwdGlvbiB3ZSBidWZmZXJcbiAgICAgIC8vIHRoZW0gaW4gdGhpcyBhcnJheS5cbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlciA9IFtdO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYubG9jYWxEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgLy8gRklYTUU6IG5lZWQgdG8gYXBwbHkgaWNlIGNhbmRpZGF0ZXMgaW4gYSB3YXkgd2hpY2ggaXMgYXN5bmMgYnV0XG4gICAgICAvLyBpbi1vcmRlclxuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGVuZCA9ICFldmVudC5jYW5kaWRhdGUgfHwgT2JqZWN0LmtleXMoZXZlbnQuY2FuZGlkYXRlKS5sZW5ndGggPT09IDA7XG4gICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHNlY3Rpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnNbal0uaW5kZXhPZignXFxyXFxuYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbicpID09PSAtMSkge1xuICAgICAgICAgICAgICBzZWN0aW9uc1tqXSArPSAnYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUuaW5kZXhPZigndHlwIGVuZE9mQ2FuZGlkYXRlcycpXG4gICAgICAgICAgICA9PT0gLTEpIHtcbiAgICAgICAgICBzZWN0aW9uc1tldmVudC5jYW5kaWRhdGUuc2RwTUxpbmVJbmRleCArIDFdICs9XG4gICAgICAgICAgICAgICdhPScgKyBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlICsgJ1xcclxcbic7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZXZlbnQuY2FuZGlkYXRlICYmIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICB2YXIgY29tcGxldGUgPSBzZWxmLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyICYmXG4gICAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdjb21wbGV0ZWQnO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlciA9IFtdO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgLy8gQ2xvbmUgaXMgbmVjZXNzYXJ5IGZvciBsb2NhbCBkZW1vcyBtb3N0bHksIGF0dGFjaGluZyBkaXJlY3RseVxuICAgICAgLy8gdG8gdHdvIGRpZmZlcmVudCBzZW5kZXJzIGRvZXMgbm90IHdvcmsgKGJ1aWxkIDEwNTQ3KS5cbiAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnB1c2goc3RyZWFtLmNsb25lKCkpO1xuICAgICAgdGhpcy5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHZhciBpZHggPSB0aGlzLmxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSk7XG4gICAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0cmVhbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIHRoaXMuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIERldGVybWluZXMgdGhlIGludGVyc2VjdGlvbiBvZiBsb2NhbCBhbmQgcmVtb3RlIGNhcGFiaWxpdGllcy5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9nZXRDb21tb25DYXBhYmlsaXRpZXMgPVxuICAgICAgICBmdW5jdGlvbihsb2NhbENhcGFiaWxpdGllcywgcmVtb3RlQ2FwYWJpbGl0aWVzKSB7XG4gICAgICAgICAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IHtcbiAgICAgICAgICAgIGNvZGVjczogW10sXG4gICAgICAgICAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICAgICAgICAgIGZlY01lY2hhbmlzbXM6IFtdXG4gICAgICAgICAgfTtcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihsQ29kZWMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgckNvZGVjID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjc1tpXTtcbiAgICAgICAgICAgICAgaWYgKGxDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IHJDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICAgIGxDb2RlYy5jbG9ja1JhdGUgPT09IHJDb2RlYy5jbG9ja1JhdGUgJiZcbiAgICAgICAgICAgICAgICAgIGxDb2RlYy5udW1DaGFubmVscyA9PT0gckNvZGVjLm51bUNoYW5uZWxzKSB7XG4gICAgICAgICAgICAgICAgLy8gcHVzaCByQ29kZWMgc28gd2UgcmVwbHkgd2l0aCBvZmZlcmVyIHBheWxvYWQgdHlwZVxuICAgICAgICAgICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5jb2RlY3MucHVzaChyQ29kZWMpO1xuXG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFsc28gbmVlZCB0byBkZXRlcm1pbmUgaW50ZXJzZWN0aW9uIGJldHdlZW5cbiAgICAgICAgICAgICAgICAvLyAucnRjcEZlZWRiYWNrIGFuZCAucGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zXG4gICAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGxIZWFkZXJFeHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgIGkrKykge1xuICAgICAgICAgICAgICAgICAgdmFyIHJIZWFkZXJFeHRlbnNpb24gPSByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgIGlmIChsSGVhZGVyRXh0ZW5zaW9uLnVyaSA9PT0gckhlYWRlckV4dGVuc2lvbi51cmkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMucHVzaChySGVhZGVyRXh0ZW5zaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEZJWE1FOiBmZWNNZWNoYW5pc21zXG4gICAgICAgICAgcmV0dXJuIGNvbW1vbkNhcGFiaWxpdGllcztcbiAgICAgICAgfTtcblxuICAgIC8vIENyZWF0ZSBJQ0UgZ2F0aGVyZXIsIElDRSB0cmFuc3BvcnQgYW5kIERUTFMgdHJhbnNwb3J0LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzID1cbiAgICAgICAgZnVuY3Rpb24obWlkLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBpY2VHYXRoZXJlciA9IG5ldyBSVENJY2VHYXRoZXJlcihzZWxmLmljZU9wdGlvbnMpO1xuICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQgPSBuZXcgUlRDSWNlVHJhbnNwb3J0KGljZUdhdGhlcmVyKTtcbiAgICAgICAgICBpY2VHYXRoZXJlci5vbmxvY2FsY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpO1xuICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlID0ge3NkcE1pZDogbWlkLCBzZHBNTGluZUluZGV4OiBzZHBNTGluZUluZGV4fTtcblxuICAgICAgICAgICAgdmFyIGNhbmQgPSBldnQuY2FuZGlkYXRlO1xuICAgICAgICAgICAgdmFyIGVuZCA9ICFjYW5kIHx8IE9iamVjdC5rZXlzKGNhbmQpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIC8vIEVkZ2UgZW1pdHMgYW4gZW1wdHkgb2JqZWN0IGZvciBSVENJY2VDYW5kaWRhdGVDb21wbGV0ZeKApVxuICAgICAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgICAgICAvLyBwb2x5ZmlsbCBzaW5jZSBSVENJY2VHYXRoZXJlci5zdGF0ZSBpcyBub3QgaW1wbGVtZW50ZWQgaW5cbiAgICAgICAgICAgICAgLy8gRWRnZSAxMDU0NyB5ZXQuXG4gICAgICAgICAgICAgIGlmIChpY2VHYXRoZXJlci5zdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWNlR2F0aGVyZXIuc3RhdGUgPSAnY29tcGxldGVkJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEVtaXQgYSBjYW5kaWRhdGUgd2l0aCB0eXBlIGVuZE9mQ2FuZGlkYXRlcyB0byBtYWtlIHRoZSBzYW1wbGVzXG4gICAgICAgICAgICAgIC8vIHdvcmsuIEVkZ2UgcmVxdWlyZXMgYWRkSWNlQ2FuZGlkYXRlIHdpdGggdGhpcyBlbXB0eSBjYW5kaWRhdGVcbiAgICAgICAgICAgICAgLy8gdG8gc3RhcnQgY2hlY2tpbmcuIFRoZSByZWFsIHNvbHV0aW9uIGlzIHRvIHNpZ25hbFxuICAgICAgICAgICAgICAvLyBlbmQtb2YtY2FuZGlkYXRlcyB0byB0aGUgb3RoZXIgc2lkZSB3aGVuIGdldHRpbmcgdGhlIG51bGxcbiAgICAgICAgICAgICAgLy8gY2FuZGlkYXRlIGJ1dCBzb21lIGFwcHMgKGxpa2UgdGhlIHNhbXBsZXMpIGRvbid0IGRvIHRoYXQuXG4gICAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgPVxuICAgICAgICAgICAgICAgICAgJ2NhbmRpZGF0ZToxIDEgdWRwIDEgMC4wLjAuMCA5IHR5cCBlbmRPZkNhbmRpZGF0ZXMnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gUlRDSWNlQ2FuZGlkYXRlIGRvZXNuJ3QgaGF2ZSBhIGNvbXBvbmVudCwgbmVlZHMgdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgY2FuZC5jb21wb25lbnQgPSBpY2VUcmFuc3BvcnQuY29tcG9uZW50ID09PSAnUlRDUCcgPyAyIDogMTtcbiAgICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSA9IFNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlKGNhbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY29tcGxldGUgPSBzZWxmLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLnN0YXRlID09PSAnY29tcGxldGVkJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBFbWl0IGNhbmRpZGF0ZSBpZiBsb2NhbERlc2NyaXB0aW9uIGlzIHNldC5cbiAgICAgICAgICAgIC8vIEFsc28gZW1pdHMgbnVsbCBjYW5kaWRhdGUgd2hlbiBhbGwgZ2F0aGVyZXJzIGFyZSBjb21wbGV0ZS5cbiAgICAgICAgICAgIHN3aXRjaCAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSkge1xuICAgICAgICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kICYmIGNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2dhdGhlcmluZyc6XG4gICAgICAgICAgICAgICAgc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUobmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2NvbXBsZXRlJzpcbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgbm90IGhhcHBlbi4uLiBjdXJyZW50bHkhXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG5vLW9wLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWNlVHJhbnNwb3J0Lm9uaWNlc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydCA9IG5ldyBSVENEdGxzVHJhbnNwb3J0KGljZVRyYW5zcG9ydCk7XG4gICAgICAgICAgZHRsc1RyYW5zcG9ydC5vbmR0bHNzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIG9uZXJyb3IgZG9lcyBub3Qgc2V0IHN0YXRlIHRvIGZhaWxlZCBieSBpdHNlbGYuXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGljZUdhdGhlcmVyOiBpY2VHYXRoZXJlcixcbiAgICAgICAgICAgIGljZVRyYW5zcG9ydDogaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogZHRsc1RyYW5zcG9ydFxuICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAvLyBTdGFydCB0aGUgUlRQIFNlbmRlciBhbmQgUmVjZWl2ZXIgZm9yIGEgdHJhbnNjZWl2ZXIuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdHJhbnNjZWl2ZSA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLFxuICAgICAgICBzZW5kLCByZWN2KSB7XG4gICAgICB2YXIgcGFyYW1zID0gdGhpcy5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcyk7XG4gICAgICBpZiAoc2VuZCAmJiB0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiBTRFBVdGlscy5sb2NhbENOYW1lXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHBhcmFtcy5ydGNwLnNzcmMgPSB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmM7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnNlbmQocGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWN2ICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICBwYXJhbXMucnRjcCA9IHtcbiAgICAgICAgICBjbmFtZTogdHJhbnNjZWl2ZXIuY25hbWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5yZWNlaXZlKHBhcmFtcyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0TG9jYWxEZXNjcmlwdGlvbiA9XG4gICAgICAgIGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBzZWN0aW9ucztcbiAgICAgICAgICB2YXIgc2Vzc2lvbnBhcnQ7XG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicpIHtcbiAgICAgICAgICAgIC8vIEZJWE1FOiBXaGF0IHdhcyB0aGUgcHVycG9zZSBvZiB0aGlzIGVtcHR5IGlmIHN0YXRlbWVudD9cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICAgICAgICAvLyBWRVJZIGxpbWl0ZWQgc3VwcG9ydCBmb3IgU0RQIG11bmdpbmcuIExpbWl0ZWQgdG86XG4gICAgICAgICAgICAgIC8vICogY2hhbmdpbmcgdGhlIG9yZGVyIG9mIGNvZGVjc1xuICAgICAgICAgICAgICBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoZGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBjYXBzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICAgICAgc2VsZi5fcGVuZGluZ09mZmVyW3NkcE1MaW5lSW5kZXhdLmxvY2FsQ2FwYWJpbGl0aWVzID0gY2FwcztcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHRoaXMudHJhbnNjZWl2ZXJzID0gdGhpcy5fcGVuZGluZ09mZmVyO1xuICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fcGVuZGluZ09mZmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicpIHtcbiAgICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhzZWxmLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgdmFyIGljZUdhdGhlcmVyID0gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHZhciByZW1vdGVDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHZhciByZWplY3RlZCA9IG1lZGlhU2VjdGlvbi5zcGxpdCgnXFxuJywgMSlbMF1cbiAgICAgICAgICAgICAgICAgIC5zcGxpdCgnICcsIDIpWzFdID09PSAnMCc7XG5cbiAgICAgICAgICAgICAgaWYgKCFyZWplY3RlZCkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhcbiAgICAgICAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAnY29udHJvbGxlZCcpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMoXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGludGVyc2VjdGlvbiBvZiBjYXBhYmlsaXRpZXMuXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHNlbGYuX2dldENvbW1vbkNhcGFiaWxpdGllcyhsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzKTtcblxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBTZW5kZXIuIFRoZSBSVENSdHBSZWNlaXZlciBmb3IgdGhpc1xuICAgICAgICAgICAgICAgIC8vIHRyYW5zY2VpdmVyIGhhcyBhbHJlYWR5IGJlZW4gc3RhcnRlZCBpbiBzZXRSZW1vdGVEZXNjcmlwdGlvbi5cbiAgICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY29kZWNzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgICAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ29mZmVyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtbG9jYWwtb2ZmZXInKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbnN3ZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICtcbiAgICAgICAgICAgICAgICAgICdcIicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIGEgc3VjY2VzcyBjYWxsYmFjayB3YXMgcHJvdmlkZWQsIGVtaXQgSUNFIGNhbmRpZGF0ZXMgYWZ0ZXIgaXRcbiAgICAgICAgICAvLyBoYXMgYmVlbiBleGVjdXRlZC4gT3RoZXJ3aXNlLCBlbWl0IGNhbGxiYWNrIGFmdGVyIHRoZSBQcm9taXNlIGlzXG4gICAgICAgICAgLy8gcmVzb2x2ZWQuXG4gICAgICAgICAgdmFyIGhhc0NhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbic7XG4gICAgICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2IgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgIHAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFVzdWFsbHkgY2FuZGlkYXRlcyB3aWxsIGJlIGVtaXR0ZWQgZWFybGllci5cbiAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcy5iaW5kKHNlbGYpLCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbiA9XG4gICAgICAgIGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBzdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgICB2YXIgcmVjZWl2ZXJMaXN0ID0gW107XG4gICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgIHZhciBtbGluZSA9IGxpbmVzWzBdLnN1YnN0cigyKS5zcGxpdCgnICcpO1xuICAgICAgICAgICAgdmFyIGtpbmQgPSBtbGluZVswXTtcbiAgICAgICAgICAgIHZhciByZWplY3RlZCA9IG1saW5lWzFdID09PSAnMCc7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gU0RQVXRpbHMuZ2V0RGlyZWN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNjZWl2ZXI7XG4gICAgICAgICAgICB2YXIgaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICB2YXIgcnRwU2VuZGVyO1xuICAgICAgICAgICAgdmFyIHJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgcmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgICAgICAgdmFyIHRyYWNrO1xuICAgICAgICAgICAgLy8gRklYTUU6IGVuc3VyZSB0aGUgbWVkaWFTZWN0aW9uIGhhcyBydGNwLW11eCBzZXQuXG4gICAgICAgICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICB2YXIgcmVtb3RlSWNlUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciByZW1vdGVEdGxzUGFyYW1ldGVycztcbiAgICAgICAgICAgIGlmICghcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgcmVtb3RlSWNlUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICByZW1vdGVEdGxzUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICAgIFNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1pZDonKTtcbiAgICAgICAgICAgIGlmIChtaWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG1pZCA9IG1pZFswXS5zdWJzdHIoNik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtaWQgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNuYW1lO1xuICAgICAgICAgICAgLy8gR2V0cyB0aGUgZmlyc3QgU1NSQy4gTm90ZSB0aGF0IHdpdGggUlRYIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlXG4gICAgICAgICAgICAvLyBTU1JDcy5cbiAgICAgICAgICAgIHZhciByZW1vdGVTc3JjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gICAgICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICBpZiAocmVtb3RlU3NyYykge1xuICAgICAgICAgICAgICBjbmFtZSA9IHJlbW90ZVNzcmMudmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpc0NvbXBsZXRlID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICdhPWVuZC1vZi1jYW5kaWRhdGVzJykubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIHZhciBjYW5kcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9Y2FuZGlkYXRlOicpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoY2FuZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjYW5kLmNvbXBvbmVudCA9PT0gJzEnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHZhciB0cmFuc3BvcnRzID0gc2VsZi5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMobWlkLFxuICAgICAgICAgICAgICAgICAgc2RwTUxpbmVJbmRleCk7XG4gICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IFJUQ1J0cFJlY2VpdmVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcbiAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMikgKiAxMDAxXG4gICAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICAgIHJ0cFJlY2VpdmVyID0gbmV3IFJUQ1J0cFJlY2VpdmVyKHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCwga2luZCk7XG5cbiAgICAgICAgICAgICAgdHJhY2sgPSBydHBSZWNlaXZlci50cmFjaztcbiAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlcl0pO1xuICAgICAgICAgICAgICAvLyBGSVhNRTogbm90IGNvcnJlY3Qgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgc3RyZWFtcyBidXQgdGhhdCBpc1xuICAgICAgICAgICAgICAvLyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiB0aGlzIHNoaW0uXG4gICAgICAgICAgICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG5cbiAgICAgICAgICAgICAgLy8gRklYTUU6IGxvb2sgYXQgZGlyZWN0aW9uLlxuICAgICAgICAgICAgICBpZiAoc2VsZi5sb2NhbFN0cmVhbXMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgc2VsZi5sb2NhbFN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkubGVuZ3RoID49IHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWN0dWFsbHkgbW9yZSBjb21wbGljYXRlZCwgbmVlZHMgdG8gbWF0Y2ggdHlwZXMgZXRjXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsdHJhY2sgPSBzZWxmLmxvY2FsU3RyZWFtc1swXVxuICAgICAgICAgICAgICAgICAgICAuZ2V0VHJhY2tzKClbc2RwTUxpbmVJbmRleF07XG4gICAgICAgICAgICAgICAgcnRwU2VuZGVyID0gbmV3IFJUQ1J0cFNlbmRlcihsb2NhbHRyYWNrLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gPSB7XG4gICAgICAgICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zcG9ydHMuaWNlR2F0aGVyZXIsXG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsXG4gICAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXM6IGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllczogcmVtb3RlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgIHJ0cFNlbmRlcjogcnRwU2VuZGVyLFxuICAgICAgICAgICAgICAgIHJ0cFJlY2VpdmVyOiBydHBSZWNlaXZlcixcbiAgICAgICAgICAgICAgICBraW5kOiBraW5kLFxuICAgICAgICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgICAgICAgIGNuYW1lOiBjbmFtZSxcbiAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzOiBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM6IHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIFJUQ1J0cFJlY2VpdmVyIG5vdy4gVGhlIFJUUFNlbmRlciBpcyBzdGFydGVkIGluXG4gICAgICAgICAgICAgIC8vIHNldExvY2FsRGVzY3JpcHRpb24uXG4gICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUoc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0sXG4gICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJyAmJiAhcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIgPSBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcbiAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgcnRwU2VuZGVyID0gdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xuICAgICAgICAgICAgICBydHBSZWNlaXZlciA9IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzID1cbiAgICAgICAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJlbW90ZUNhcGFiaWxpdGllcyA9XG4gICAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmNuYW1lID0gY25hbWU7XG5cbiAgICAgICAgICAgICAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgJ2NvbnRyb2xsaW5nJyk7XG4gICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuXG4gICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAncmVjdm9ubHknLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5Jyk7XG5cbiAgICAgICAgICAgICAgaWYgKHJ0cFJlY2VpdmVyICYmXG4gICAgICAgICAgICAgICAgICAoZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5JykpIHtcbiAgICAgICAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xuICAgICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5wdXNoKFt0cmFjaywgcnRwUmVjZWl2ZXJdKTtcbiAgICAgICAgICAgICAgICBzdHJlYW0uYWRkVHJhY2sodHJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBhY3R1YWxseSB0aGUgcmVjZWl2ZXIgc2hvdWxkIGJlIGNyZWF0ZWQgbGF0ZXIuXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgICAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ29mZmVyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtcmVtb3RlLW9mZmVyJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5zd2VyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ3N0YWJsZScpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Vuc3VwcG9ydGVkIHR5cGUgXCInICsgZGVzY3JpcHRpb24udHlwZSArXG4gICAgICAgICAgICAgICAgICAnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0cmVhbS5nZXRUcmFja3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGYucmVtb3RlU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdhZGRzdHJlYW0nKTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtID0gc3RyZWFtO1xuICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICBpZiAoc2VsZi5vbmFkZHN0cmVhbSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5vbmFkZHN0cmVhbShldmVudCk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZWNlaXZlckxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRyYWNrID0gaXRlbVswXTtcbiAgICAgICAgICAgICAgICB2YXIgcmVjZWl2ZXIgPSBpdGVtWzFdO1xuICAgICAgICAgICAgICAgIHZhciB0cmFja0V2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnJlY2VpdmVyID0gcmVjZWl2ZXI7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC5zdHJlYW1zID0gW3N0cmVhbV07XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbnRyYWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbnRyYWNrKHRyYWNrRXZlbnQpO1xuICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzFdLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAvKiBub3QgeWV0XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VHYXRoZXJlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCkge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gRklYTUU6IGNsZWFuIHVwIHRyYWNrcywgbG9jYWwgc3RyZWFtcywgcmVtb3RlIHN0cmVhbXMsIGV0Y1xuICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2Nsb3NlZCcpO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNpZ25hbGluZyBzdGF0ZS5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVTaWduYWxpbmdTdGF0ZSA9XG4gICAgICAgIGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgICAgICAgdGhpcy5zaWduYWxpbmdTdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnc2lnbmFsaW5nc3RhdGVjaGFuZ2UnKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgIGlmICh0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdG8gZmlyZSB0aGUgbmVnb3RpYXRpb25uZWVkZWQgZXZlbnQuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQgPVxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBGaXJlIGF3YXkgKGZvciBub3cpLlxuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnbmVnb3RpYXRpb25uZWVkZWQnKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgIGlmICh0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZChldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBjb25uZWN0aW9uIHN0YXRlLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIG5ld1N0YXRlO1xuICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgJ25ldyc6IDAsXG4gICAgICAgIGNsb3NlZDogMCxcbiAgICAgICAgY29ubmVjdGluZzogMCxcbiAgICAgICAgY2hlY2tpbmc6IDAsXG4gICAgICAgIGNvbm5lY3RlZDogMCxcbiAgICAgICAgY29tcGxldGVkOiAwLFxuICAgICAgICBmYWlsZWQ6IDBcbiAgICAgIH07XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LnN0YXRlXSsrO1xuICAgICAgfSk7XG4gICAgICAvLyBJQ0VUcmFuc3BvcnQuY29tcGxldGVkIGFuZCBjb25uZWN0ZWQgYXJlIHRoZSBzYW1lIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgICBzdGF0ZXMuY29ubmVjdGVkICs9IHN0YXRlcy5jb21wbGV0ZWQ7XG5cbiAgICAgIG5ld1N0YXRlID0gJ25ldyc7XG4gICAgICBpZiAoc3RhdGVzLmZhaWxlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnZmFpbGVkJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmNvbm5lY3RpbmcgPiAwIHx8IHN0YXRlcy5jaGVja2luZyA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGluZyc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5kaXNjb25uZWN0ZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5uZXcgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ25ldyc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0ZWQgPiAwIHx8IHN0YXRlcy5jb21wbGV0ZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdTdGF0ZSAhPT0gc2VsZi5pY2VDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgICAgc2VsZi5pY2VDb25uZWN0aW9uU3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZU9mZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAodGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlT2ZmZXIgY2FsbGVkIHdoaWxlIHRoZXJlIGlzIGEgcGVuZGluZyBvZmZlci4nKTtcbiAgICAgIH1cbiAgICAgIHZhciBvZmZlck9wdGlvbnM7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9mZmVyT3B0aW9ucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG5cbiAgICAgIHZhciB0cmFja3MgPSBbXTtcbiAgICAgIHZhciBudW1BdWRpb1RyYWNrcyA9IDA7XG4gICAgICB2YXIgbnVtVmlkZW9UcmFja3MgPSAwO1xuICAgICAgLy8gRGVmYXVsdCB0byBzZW5kcmVjdi5cbiAgICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgICAgbnVtQXVkaW9UcmFja3MgPSB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aDtcbiAgICAgICAgbnVtVmlkZW9UcmFja3MgPSB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIC8vIERldGVybWluZSBudW1iZXIgb2YgYXVkaW8gYW5kIHZpZGVvIHRyYWNrcyB3ZSBuZWVkIHRvIHNlbmQvcmVjdi5cbiAgICAgIGlmIChvZmZlck9wdGlvbnMpIHtcbiAgICAgICAgLy8gUmVqZWN0IENocm9tZSBsZWdhY3kgY29uc3RyYWludHMuXG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMubWFuZGF0b3J5IHx8IG9mZmVyT3B0aW9ucy5vcHRpb25hbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICdMZWdhY3kgbWFuZGF0b3J5L29wdGlvbmFsIGNvbnN0cmFpbnRzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcyA9IG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMubG9jYWxTdHJlYW1zLmxlbmd0aCkge1xuICAgICAgICAvLyBQdXNoIGxvY2FsIHN0cmVhbXMuXG4gICAgICAgIHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiB0cmFjay5raW5kLFxuICAgICAgICAgICAgdHJhY2s6IHRyYWNrLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRyYWNrLmtpbmQgPT09ICdhdWRpbycgP1xuICAgICAgICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID4gMCA6IG51bVZpZGVvVHJhY2tzID4gMFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh0cmFjay5raW5kID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgICBudW1BdWRpb1RyYWNrcy0tO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHJhY2sua2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgLy8gQ3JlYXRlIE0tbGluZXMgZm9yIHJlY3Zvbmx5IHN0cmVhbXMuXG4gICAgICB3aGlsZSAobnVtQXVkaW9UcmFja3MgPiAwIHx8IG51bVZpZGVvVHJhY2tzID4gMCkge1xuICAgICAgICBpZiAobnVtQXVkaW9UcmFja3MgPiAwKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogJ2F1ZGlvJyxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MtLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtVmlkZW9UcmFja3MgPiAwKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogJ3ZpZGVvJyxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUoKTtcbiAgICAgIHZhciB0cmFuc2NlaXZlcnMgPSBbXTtcbiAgICAgIHRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKG1saW5lLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgIC8vIEZvciBlYWNoIHRyYWNrLCBjcmVhdGUgYW4gaWNlIGdhdGhlcmVyLCBpY2UgdHJhbnNwb3J0LFxuICAgICAgICAvLyBkdGxzIHRyYW5zcG9ydCwgcG90ZW50aWFsbHkgcnRwc2VuZGVyIGFuZCBydHByZWNlaXZlci5cbiAgICAgICAgdmFyIHRyYWNrID0gbWxpbmUudHJhY2s7XG4gICAgICAgIHZhciBraW5kID0gbWxpbmUua2luZDtcbiAgICAgICAgdmFyIG1pZCA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuXG4gICAgICAgIHZhciB0cmFuc3BvcnRzID0gc2VsZi5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMobWlkLCBzZHBNTGluZUluZGV4KTtcblxuICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSBSVENSdHBTZW5kZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xuICAgICAgICB2YXIgcnRwU2VuZGVyO1xuICAgICAgICB2YXIgcnRwUmVjZWl2ZXI7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgYW4gc3NyYyBub3csIHRvIGJlIHVzZWQgbGF0ZXIgaW4gcnRwU2VuZGVyLnNlbmRcbiAgICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSBbe1xuICAgICAgICAgIHNzcmM6ICgyICogc2RwTUxpbmVJbmRleCArIDEpICogMTAwMVxuICAgICAgICB9XTtcbiAgICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgICAgcnRwU2VuZGVyID0gbmV3IFJUQ1J0cFNlbmRlcih0cmFjaywgdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtbGluZS53YW50UmVjZWl2ZSkge1xuICAgICAgICAgIHJ0cFJlY2VpdmVyID0gbmV3IFJUQ1J0cFJlY2VpdmVyKHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCwga2luZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gPSB7XG4gICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zcG9ydHMuaWNlR2F0aGVyZXIsXG4gICAgICAgICAgaWNlVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsXG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXM6IGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllczogbnVsbCxcbiAgICAgICAgICBydHBTZW5kZXI6IHJ0cFNlbmRlcixcbiAgICAgICAgICBydHBSZWNlaXZlcjogcnRwUmVjZWl2ZXIsXG4gICAgICAgICAga2luZDoga2luZCxcbiAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzOiBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLFxuICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gdHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcywgJ29mZmVyJywgc2VsZi5sb2NhbFN0cmVhbXNbMF0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BlbmRpbmdPZmZlciA9IHRyYW5zY2VpdmVycztcbiAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICdvZmZlcicsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzBdLCAwLCBkZXNjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSgpO1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJzZWN0aW9uIG9mIGNhcGFiaWxpdGllcy5cbiAgICAgICAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IHNlbGYuX2dldENvbW1vbkNhcGFiaWxpdGllcyhcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzKTtcblxuICAgICAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsIGNvbW1vbkNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICdhbnN3ZXInLCBzZWxmLmxvY2FsU3RyZWFtc1swXSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJ2Fuc3dlcicsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzBdLCAwLCBkZXNjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gICAgICB2YXIgbUxpbmVJbmRleCA9IGNhbmRpZGF0ZS5zZHBNTGluZUluZGV4O1xuICAgICAgaWYgKGNhbmRpZGF0ZS5zZHBNaWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zY2VpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICh0aGlzLnRyYW5zY2VpdmVyc1tpXS5taWQgPT09IGNhbmRpZGF0ZS5zZHBNaWQpIHtcbiAgICAgICAgICAgIG1MaW5lSW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgdHJhbnNjZWl2ZXIgPSB0aGlzLnRyYW5zY2VpdmVyc1ttTGluZUluZGV4XTtcbiAgICAgIGlmICh0cmFuc2NlaXZlcikge1xuICAgICAgICB2YXIgY2FuZCA9IE9iamVjdC5rZXlzKGNhbmRpZGF0ZS5jYW5kaWRhdGUpLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoY2FuZGlkYXRlLmNhbmRpZGF0ZSkgOiB7fTtcbiAgICAgICAgLy8gSWdub3JlIENocm9tZSdzIGludmFsaWQgY2FuZGlkYXRlcyBzaW5jZSBFZGdlIGRvZXMgbm90IGxpa2UgdGhlbS5cbiAgICAgICAgaWYgKGNhbmQucHJvdG9jb2wgPT09ICd0Y3AnICYmIGNhbmQucG9ydCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZ25vcmUgUlRDUCBjYW5kaWRhdGVzLCB3ZSBhc3N1bWUgUlRDUC1NVVguXG4gICAgICAgIGlmIChjYW5kLmNvbXBvbmVudCAhPT0gJzEnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEEgZGlydHkgaGFjayB0byBtYWtlIHNhbXBsZXMgd29yay5cbiAgICAgICAgaWYgKGNhbmQudHlwZSA9PT0gJ2VuZE9mQ2FuZGlkYXRlcycpIHtcbiAgICAgICAgICBjYW5kID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LmFkZFJlbW90ZUNhbmRpZGF0ZShjYW5kKTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHJlbW90ZURlc2NyaXB0aW9uLlxuICAgICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHRoaXMucmVtb3RlRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgc2VjdGlvbnNbbUxpbmVJbmRleCArIDFdICs9IChjYW5kLnR5cGUgPyBjYW5kaWRhdGUuY2FuZGlkYXRlLnRyaW0oKVxuICAgICAgICAgICAgOiAnYT1lbmQtb2YtY2FuZGlkYXRlcycpICsgJ1xcclxcbic7XG4gICAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24uc2RwID0gc2VjdGlvbnMuam9pbignJyk7XG4gICAgICB9XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMV0sIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgWydydHBTZW5kZXInLCAncnRwUmVjZWl2ZXInLCAnaWNlR2F0aGVyZXInLCAnaWNlVHJhbnNwb3J0JyxcbiAgICAgICAgICAgICdkdGxzVHJhbnNwb3J0J10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgICAgaWYgKHRyYW5zY2VpdmVyW21ldGhvZF0pIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYW5zY2VpdmVyW21ldGhvZF0uZ2V0U3RhdHMoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB2YXIgY2IgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgYXJndW1lbnRzWzFdO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhyZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1tpZF0gPSByZXN1bHRbaWRdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYiwgMCwgcmVzdWx0cyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICAvLyBBdHRhY2ggYSBtZWRpYSBzdHJlYW0gdG8gYW4gZWxlbWVudC5cbiAgYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKGVsZW1lbnQsIHN0cmVhbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIGF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIGVsZW1lbnQuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICB9LFxuXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHRvLCBmcm9tKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgcmVhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICB0by5zcmNPYmplY3QgPSBmcm9tLnNyY09iamVjdDtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBhdHRhY2hNZWRpYVN0cmVhbTogZWRnZVNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGVkZ2VTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG5cbnZhciBmaXJlZm94U2hpbSA9IHtcbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb250cmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX29udHJhY2spIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayA9IGYpO1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBzaGltU291cmNlT2JqZWN0OiBmdW5jdGlvbigpIHtcbiAgICAvLyBGaXJlZm94IGhhcyBzdXBwb3J0ZWQgbW96U3JjT2JqZWN0IHNpbmNlIEZGMjIsIHVucHJlZml4ZWQgaW4gNDIuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAod2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcbiAgICAgICAgISgnc3JjT2JqZWN0JyBpbiB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIC8vIFNoaW0gdGhlIHNyY09iamVjdCBwcm9wZXJ0eSwgb25jZSwgd2hlbiBIVE1MTWVkaWFFbGVtZW50IGlzIGZvdW5kLlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjT2JqZWN0Jywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3pTcmNPYmplY3Q7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdGhpcy5tb3pTcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAvLyBUaGUgUlRDUGVlckNvbm5lY3Rpb24gb2JqZWN0LlxuICAgIGlmICghd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xuICAgICAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICAgICAgLy8gLnVybHMgaXMgbm90IHN1cHBvcnRlZCBpbiBGRiA8IDM4LlxuICAgICAgICAgIC8vIGNyZWF0ZSBSVENJY2VTZXJ2ZXJzIHdpdGggYSBzaW5nbGUgdXJsLlxuICAgICAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VTZXJ2ZXJzKSB7XG4gICAgICAgICAgICB2YXIgbmV3SWNlU2VydmVycyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwY0NvbmZpZy5pY2VTZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldO1xuICAgICAgICAgICAgICBpZiAoc2VydmVyLmhhc093blByb3BlcnR5KCd1cmxzJykpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNlcnZlci51cmxzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgbmV3U2VydmVyID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZlci51cmxzW2pdXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgaWYgKHNlcnZlci51cmxzW2pdLmluZGV4T2YoJ3R1cm4nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdTZXJ2ZXIudXNlcm5hbWUgPSBzZXJ2ZXIudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld1NlcnZlci5jcmVkZW50aWFsID0gc2VydmVyLmNyZWRlbnRpYWw7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gobmV3U2VydmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKHBjQ29uZmlnLmljZVNlcnZlcnNbaV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwY0NvbmZpZy5pY2VTZXJ2ZXJzID0gbmV3SWNlU2VydmVycztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBtb3pSVENQZWVyQ29ubmVjdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cyk7XG4gICAgICB9O1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSA9IG1velJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcblxuICAgICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cbiAgICAgIGlmIChtb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbW96UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gbW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xuICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA9IG1velJUQ0ljZUNhbmRpZGF0ZTtcbiAgICB9XG5cbiAgICAvLyBzaGltIGF3YXkgbmVlZCBmb3Igb2Jzb2xldGUgUlRDSWNlQ2FuZGlkYXRlL1JUQ1Nlc3Npb25EZXNjcmlwdGlvbi5cbiAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgICAgIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcmd1bWVudHNbMF0gPSBuZXcgKChtZXRob2QgPT09ICdhZGRJY2VDYW5kaWRhdGUnKT9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gIH0sXG5cbiAgc2hpbUdldFVzZXJNZWRpYTogZnVuY3Rpb24oKSB7XG4gICAgLy8gZ2V0VXNlck1lZGlhIGNvbnN0cmFpbnRzIHNoaW0uXG4gICAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgICB2YXIgY29uc3RyYWludHNUb0ZGMzdfID0gZnVuY3Rpb24oYykge1xuICAgICAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMucmVxdWlyZSkge1xuICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXF1aXJlID0gW107XG4gICAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fFxuICAgICAgICAgICAgICBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHIgPSBjW2tleV0gPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID9cbiAgICAgICAgICAgICAgY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAgIHIubWF4ICE9PSB1bmRlZmluZWQgfHwgci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXF1aXJlLnB1c2goa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjW2tleV0gPSByLmV4YWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHIuZXhhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGMuYWR2YW5jZWQgPSBjLmFkdmFuY2VkIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG9jID0ge307XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgIG9jW2tleV0gPSB7bWluOiByLmlkZWFsLCBtYXg6IHIuaWRlYWx9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjLmFkdmFuY2VkLnB1c2gob2MpO1xuICAgICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XG4gICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHIpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBkZWxldGUgY1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xuICAgICAgICAgIGMucmVxdWlyZSA9IHJlcXVpcmU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgICB9O1xuICAgICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICAgIGxvZ2dpbmcoJ3NwZWM6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgICBpZiAoY29uc3RyYWludHMuYXVkaW8pIHtcbiAgICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dpbmcoJ2ZmMzc6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcik7XG4gICAgfTtcblxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gICAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYShjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBTaGltIGZvciBtZWRpYURldmljZXMgb24gb2xkZXIgdmVyc2lvbnMuXG4gICAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge2dldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfVxuICAgICAgfTtcbiAgICB9XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICB2YXIgaW5mb3MgPSBbXG4gICAgICAgICAgICAgIHtraW5kOiAnYXVkaW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9LFxuICAgICAgICAgICAgICB7a2luZDogJ3ZpZGVvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHJlc29sdmUoaW5mb3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0MSkge1xuICAgICAgLy8gV29yayBhcm91bmQgaHR0cDovL2J1Z3ppbC5sYS8xMTY5NjY1XG4gICAgICB2YXIgb3JnRW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzLmJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG9yZ0VudW1lcmF0ZURldmljZXMoKS50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIC8vIEF0dGFjaCBhIG1lZGlhIHN0cmVhbSB0byBhbiBlbGVtZW50LlxuICBhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24oZWxlbWVudCwgc3RyZWFtKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgZWxlbWVudC5zcmNPYmplY3QgPSBzdHJlYW07XG4gIH0sXG5cbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24odG8sIGZyb20pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCByZWF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIHRvLnNyY09iamVjdCA9IGZyb20uc3JjT2JqZWN0O1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbU9uVHJhY2s6IGZpcmVmb3hTaGltLnNoaW1PblRyYWNrLFxuICBzaGltU291cmNlT2JqZWN0OiBmaXJlZm94U2hpbS5zaGltU291cmNlT2JqZWN0LFxuICBzaGltUGVlckNvbm5lY3Rpb246IGZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKSxcbiAgYXR0YWNoTWVkaWFTdHJlYW06IGZpcmVmb3hTaGltLmF0dGFjaE1lZGlhU3RyZWFtLFxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBmaXJlZm94U2hpbS5yZWF0dGFjaE1lZGlhU3RyZWFtXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBnZXRVc2VyTWVkaWEgY29uc3RyYWludHMgc2hpbS5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgdmFyIGNvbnN0cmFpbnRzVG9GRjM3XyA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5yZXF1aXJlKSB7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfVxuICAgICAgdmFyIHJlcXVpcmUgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gY1trZXldID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/XG4gICAgICAgICAgICBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICByLm1heCAhPT0gdW5kZWZpbmVkIHx8IHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlcXVpcmUucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNba2V5XSA9IHIuZXhhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSByLmV4YWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjLmFkdmFuY2VkID0gYy5hZHZhbmNlZCB8fCBbXTtcbiAgICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBvY1trZXldID0ge21pbjogci5pZGVhbCwgbWF4OiByLmlkZWFsfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGMuYWR2YW5jZWQucHVzaChvYyk7XG4gICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XG4gICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhyKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xuICAgICAgICBjLnJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGM7XG4gICAgfTtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICBsb2dnaW5nKCdzcGVjOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgICB9XG4gICAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnZmYzNzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgfVxuICAgIHJldHVybiBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICB9O1xuXG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdCBvZiBnZXRVc2VyTWVkaWEgYXMgYSBQcm9taXNlLlxuICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hpbSBmb3IgbWVkaWFEZXZpY2VzIG9uIG9sZGVyIHZlcnNpb25zLlxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge2dldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfSxcbiAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9XG4gICAgfTtcbiAgfVxuICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPVxuICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIHZhciBpbmZvcyA9IFtcbiAgICAgICAgICAgIHtraW5kOiAnYXVkaW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9LFxuICAgICAgICAgICAge2tpbmQ6ICd2aWRlb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ31cbiAgICAgICAgICBdO1xuICAgICAgICAgIHJlc29sdmUoaW5mb3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0MSkge1xuICAgIC8vIFdvcmsgYXJvdW5kIGh0dHA6Ly9idWd6aWwubGEvMTE2OTY2NVxuICAgIHZhciBvcmdFbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzLmJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gb3JnRW51bWVyYXRlRGV2aWNlcygpLnRoZW4odW5kZWZpbmVkLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIHNhZmFyaVNoaW0gPSB7XG4gIC8vIFRPRE86IERyQWxleCwgc2hvdWxkIGJlIGhlcmUsIGRvdWJsZSBjaGVjayBhZ2FpbnN0IExheW91dFRlc3RzXG4gIC8vIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHsgfSxcblxuICAvLyBUT0RPOiBEckFsZXhcbiAgLy8gYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKGVsZW1lbnQsIHN0cmVhbSkgeyB9LFxuICAvLyByZWF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbih0bywgZnJvbSkgeyB9LFxuXG4gIC8vIFRPRE86IG9uY2UgdGhlIGJhY2stZW5kIGZvciB0aGUgbWFjIHBvcnQgaXMgZG9uZSwgYWRkLlxuICAvLyBUT0RPOiBjaGVjayBmb3Igd2Via2l0R1RLK1xuICAvLyBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIHNoaW1HZXRVc2VyTWVkaWE6IGZ1bmN0aW9uKCkge1xuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhO1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbUdldFVzZXJNZWRpYTogc2FmYXJpU2hpbS5zaGltR2V0VXNlck1lZGlhXG4gIC8vIFRPRE9cbiAgLy8gc2hpbU9uVHJhY2s6IHNhZmFyaVNoaW0uc2hpbU9uVHJhY2ssXG4gIC8vIHNoaW1QZWVyQ29ubmVjdGlvbjogc2FmYXJpU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIC8vIGF0dGFjaE1lZGlhU3RyZWFtOiBzYWZhcmlTaGltLmF0dGFjaE1lZGlhU3RyZWFtLFxuICAvLyByZWF0dGFjaE1lZGlhU3RyZWFtOiBzYWZhcmlTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ0Rpc2FibGVkXyA9IGZhbHNlO1xuXG4vLyBVdGlsaXR5IG1ldGhvZHMuXG52YXIgdXRpbHMgPSB7XG4gIGRpc2FibGVMb2c6IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJndW1lbnQgdHlwZTogJyArIHR5cGVvZiBib29sICtcbiAgICAgICAgICAnLiBQbGVhc2UgdXNlIGEgYm9vbGVhbi4nKTtcbiAgICB9XG4gICAgbG9nRGlzYWJsZWRfID0gYm9vbDtcbiAgICByZXR1cm4gKGJvb2wpID8gJ2FkYXB0ZXIuanMgbG9nZ2luZyBkaXNhYmxlZCcgOlxuICAgICAgICAnYWRhcHRlci5qcyBsb2dnaW5nIGVuYWJsZWQnO1xuICB9LFxuXG4gIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAobG9nRGlzYWJsZWRfKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IGJyb3dzZXIgdmVyc2lvbiBvdXQgb2YgdGhlIHByb3ZpZGVkIHVzZXIgYWdlbnQgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IHVhc3RyaW5nIHVzZXJBZ2VudCBzdHJpbmcuXG4gICAqIEBwYXJhbSB7IXN0cmluZ30gZXhwciBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCBhcyBtYXRjaCBjcml0ZXJpYS5cbiAgICogQHBhcmFtIHshbnVtYmVyfSBwb3MgcG9zaXRpb24gaW4gdGhlIHZlcnNpb24gc3RyaW5nIHRvIGJlIHJldHVybmVkLlxuICAgKiBAcmV0dXJuIHshbnVtYmVyfSBicm93c2VyIHZlcnNpb24uXG4gICAqL1xuICBleHRyYWN0VmVyc2lvbjogZnVuY3Rpb24odWFzdHJpbmcsIGV4cHIsIHBvcykge1xuICAgIHZhciBtYXRjaCA9IHVhc3RyaW5nLm1hdGNoKGV4cHIpO1xuICAgIHJldHVybiBtYXRjaCAmJiBtYXRjaC5sZW5ndGggPj0gcG9zICYmIHBhcnNlSW50KG1hdGNoW3Bvc10sIDEwKTtcbiAgfSxcblxuICAvKipcbiAgICogQnJvd3NlciBkZXRlY3Rvci5cbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSByZXN1bHQgY29udGFpbmluZyBicm93c2VyLCB2ZXJzaW9uIGFuZCBtaW5WZXJzaW9uXG4gICAqICAgICBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgZGV0ZWN0QnJvd3NlcjogZnVuY3Rpb24oKSB7XG4gICAgLy8gUmV0dXJuZWQgcmVzdWx0IG9iamVjdC5cbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgcmVzdWx0LmJyb3dzZXIgPSBudWxsO1xuICAgIHJlc3VsdC52ZXJzaW9uID0gbnVsbDtcbiAgICByZXN1bHQubWluVmVyc2lvbiA9IG51bGw7XG5cbiAgICAvLyBGYWlsIGVhcmx5IGlmIGl0J3Mgbm90IGEgYnJvd3NlclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAhd2luZG93Lm5hdmlnYXRvcikge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnTm90IGEgYnJvd3Nlci4nO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBGaXJlZm94LlxuICAgIGlmIChuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdmaXJlZm94JztcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9GaXJlZm94XFwvKFswLTldKylcXC4vLCAxKTtcbiAgICAgIHJlc3VsdC5taW5WZXJzaW9uID0gMzE7XG5cbiAgICAvLyBhbGwgd2Via2l0LWJhc2VkIGJyb3dzZXJzXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhKSB7XG4gICAgICAvLyBDaHJvbWUsIENocm9taXVtLCBXZWJ2aWV3LCBPcGVyYSwgYWxsIHVzZSB0aGUgY2hyb21lIHNoaW0gZm9yIG5vd1xuICAgICAgaWYgKHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvQ2hyb20oZXxpdW0pXFwvKFswLTldKylcXC4vLCAyKTtcbiAgICAgICAgcmVzdWx0Lm1pblZlcnNpb24gPSAzODtcblxuICAgICAgLy8gU2FmYXJpIG9yIHVua25vd24gd2Via2l0LWJhc2VkXG4gICAgICAvLyBmb3IgdGhlIHRpbWUgYmVpbmcgU2FmYXJpIGhhcyBzdXBwb3J0IGZvciBNZWRpYVN0cmVhbXMgYnV0IG5vdCB3ZWJSVENcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNhZmFyaSBVQSBzdWJzdHJpbmdzIG9mIGludGVyZXN0IGZvciByZWZlcmVuY2U6XG4gICAgICAgIC8vIC0gd2Via2l0IHZlcnNpb246ICAgICAgICAgICBBcHBsZVdlYktpdC82MDIuMS4yNSAoYWxzbyB1c2VkIGluIE9wLENyKVxuICAgICAgICAvLyAtIHNhZmFyaSBVSSB2ZXJzaW9uOiAgICAgICAgVmVyc2lvbi85LjAuMyAodW5pcXVlIHRvIFNhZmFyaSlcbiAgICAgICAgLy8gLSBzYWZhcmkgVUkgd2Via2l0IHZlcnNpb246IFNhZmFyaS82MDEuNC40IChhbHNvIHVzZWQgaW4gT3AsQ3IpXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIHRoZSB3ZWJraXQgdmVyc2lvbiBhbmQgc2FmYXJpIFVJIHdlYmtpdCB2ZXJzaW9ucyBhcmUgZXF1YWxzLFxuICAgICAgICAvLyAuLi4gdGhpcyBpcyBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgICAgICAvL1xuICAgICAgICAvLyBvbmx5IHRoZSBpbnRlcm5hbCB3ZWJraXQgdmVyc2lvbiBpcyBpbXBvcnRhbnQgdG9kYXkgdG8ga25vdyBpZlxuICAgICAgICAvLyBtZWRpYSBzdHJlYW1zIGFyZSBzdXBwb3J0ZWRcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oXFxkKykuKFxcZCspLykpIHtcbiAgICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdzYWZhcmknO1xuICAgICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgL0FwcGxlV2ViS2l0XFwvKFswLTldKylcXC4vLCAxKTtcbiAgICAgICAgICByZXN1bHQubWluVmVyc2lvbiA9IDYwMjtcblxuICAgICAgICAvLyB1bmtub3duIHdlYmtpdC1iYXNlZCBicm93c2VyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnVW5zdXBwb3J0ZWQgd2Via2l0LWJhc2VkIGJyb3dzZXIgJyArXG4gICAgICAgICAgICAgICd3aXRoIEdVTSBzdXBwb3J0IGJ1dCBubyBXZWJSVEMgc3VwcG9ydC4nO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIC8vIEVkZ2UuXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzICYmXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0VkZ2VcXC8oXFxkKykuKFxcZCspJC8pKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdlZGdlJztcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9FZGdlXFwvKFxcZCspLihcXGQrKSQvLCAyKTtcbiAgICAgIHJlc3VsdC5taW5WZXJzaW9uID0gMTA1NDc7XG5cbiAgICAvLyBEZWZhdWx0IGZhbGx0aHJvdWdoOiBub3Qgc3VwcG9ydGVkLlxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdOb3QgYSBzdXBwb3J0ZWQgYnJvd3Nlci4nO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBXYXJuIGlmIHZlcnNpb24gaXMgbGVzcyB0aGFuIG1pblZlcnNpb24uXG4gICAgaWYgKHJlc3VsdC52ZXJzaW9uIDwgcmVzdWx0Lm1pblZlcnNpb24pIHtcbiAgICAgIHV0aWxzLmxvZygnQnJvd3NlcjogJyArIHJlc3VsdC5icm93c2VyICsgJyBWZXJzaW9uOiAnICsgcmVzdWx0LnZlcnNpb24gK1xuICAgICAgICAgICcgPCBtaW5pbXVtIHN1cHBvcnRlZCB2ZXJzaW9uOiAnICsgcmVzdWx0Lm1pblZlcnNpb24gK1xuICAgICAgICAgICdcXG4gc29tZSB0aGluZ3MgbWlnaHQgbm90IHdvcmshJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufTtcblxuLy8gRXhwb3J0LlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZzogdXRpbHMubG9nLFxuICBkaXNhYmxlTG9nOiB1dGlscy5kaXNhYmxlTG9nLFxuICBicm93c2VyRGV0YWlsczogdXRpbHMuZGV0ZWN0QnJvd3NlcigpLFxuICBleHRyYWN0VmVyc2lvbjogdXRpbHMuZXh0cmFjdFZlcnNpb25cbn07XG4iLCJ2YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IGZhbHNlO1xudmFyIExvZ2dlciA9IHtcblx0bG9nOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5sb2cobWVzc2FnZSk7XG5cdH0sXG5cblx0ZXJyb3I6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gRGl5YU5vZGUoKXtcblx0RXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cblx0dGhpcy5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdHRoaXMuX2FkZHIgPSBudWxsO1xuXHR0aGlzLl9zb2NrZXQgPSBudWxsO1xuXHR0aGlzLl9uZXh0SWQgPSAwO1xuXHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO1xuXHR0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO1xuXHR0aGlzLl9wZW5kaW5nTWVzc2FnZXMgPSBbXTtcblx0dGhpcy5fcGVlcnMgPSBbXTtcblx0dGhpcy5fcmVjb25uZWN0VGltZW91dCA9IDEwMDA7XG5cdHRoaXMuX2Nvbm5lY3RUaW1lb3V0ID0gNTAwMDtcbn1cbmluaGVyaXRzKERpeWFOb2RlLCBFdmVudEVtaXR0ZXIpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8gUHVibGljIEFQSSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuRGl5YU5vZGUucHJvdG90eXBlLmFkZHIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2FkZHI7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUucGVlcnMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5fcGVlcnM7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2VsZiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fc2VsZjsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5zZXRTZWN1cmVkID0gZnVuY3Rpb24oYlNlY3VyZWQpIHsgdGhpcy5fc2VjdXJlZCA9IGJTZWN1cmVkICE9PSBmYWxzZTsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5zZXRXU29ja2V0ID0gZnVuY3Rpb24oV1NvY2tldCkge3RoaXMuX1dTb2NrZXQgPSBXU29ja2V0O31cblxuXG5cbi8qKiBAcmV0dXJuIHtQcm9taXNlPFN0cmluZz59IHRoZSBjb25uZWN0ZWQgcGVlciBuYW1lICovXG5EaXlhTm9kZS5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKGFkZHIsIFdTb2NrZXQpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuYkRvbnRSZWNvbm5lY3RlZCA9IGZhbHNlO1xuXG5cdGlmKFdTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSBXU29ja2V0O1xuXHRlbHNlIGlmKCF0aGlzLl9XU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gd2luZG93LldlYlNvY2tldDtcblx0V1NvY2tldCA9IHRoaXMuX1dTb2NrZXQ7XG5cblx0Ly8gQ2hlY2sgYW5kIEZvcm1hdCBVUkkgKEZRRE4pXG5cdGlmKGFkZHIuaW5kZXhPZihcIndzOi8vXCIpID09PSAwICYmIHRoaXMuX3NlY3VyZWQpIHJldHVybiBRLnJlamVjdChcIlBsZWFzZSB1c2UgYSBzZWN1cmVkIGNvbm5lY3Rpb24gKFwiICsgYWRkciArIFwiKVwiKTtcblx0aWYoYWRkci5pbmRleE9mKFwid3NzOi8vXCIpID09PSAwICYmIHRoaXMuX3NlY3VyZWQgPT09IGZhbHNlKSByZXR1cm4gUS5yZWplY3QoXCJQbGVhc2UgdXNlIGEgbm9uLXNlY3VyZWQgY29ubmVjdGlvbiAoXCIgKyBhZGRyICsgXCIpXCIpO1xuXHRpZihhZGRyLmluZGV4T2YoXCJ3czovL1wiKSAhPT0gMCAmJiBhZGRyLmluZGV4T2YoXCJ3c3M6Ly9cIikgIT09IDApIHtcblx0XHRpZih0aGlzLl9zZWN1cmVkKSBhZGRyID0gXCJ3c3M6Ly9cIiArIGFkZHI7XG5cdFx0ZWxzZSBhZGRyID0gXCJ3czovL1wiICsgYWRkcjtcblx0fVxuXG5cblx0aWYodGhpcy5fYWRkciA9PT0gYWRkcil7XG5cdFx0aWYodGhpcy5fc3RhdHVzID09PSAnb3BlbmVkJylcblx0XHRcdHJldHVybiBRKHRoaXMuc2VsZigpKTtcblx0XHRlbHNlIGlmKHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSAmJiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZS5pc1BlbmRpbmcoKSlcblx0XHRcdHJldHVybiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiB0aGlzLmNsb3NlKCkudGhlbihmdW5jdGlvbigpe1xuXHRcdHRoYXQuX2FkZHIgPSBhZGRyO1xuXHRcdHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0XHRMb2dnZXIubG9nKCdkMTogY29ubmVjdCB0byAnICsgdGhhdC5fYWRkcik7XG5cdFx0dmFyIHNvY2sgPSBuZXcgU29ja2V0SGFuZGxlcihXU29ja2V0LCB0aGF0Ll9hZGRyLCB0aGF0Ll9jb25uZWN0VGltZW91dCk7XG5cblx0XHRpZighdGhhdC5fc29ja2V0SGFuZGxlcikgdGhhdC5fc29ja2V0SGFuZGxlciA9IHNvY2s7XG5cblx0XHRzb2NrLm9uKCdvcGVuJywgZnVuY3Rpb24oKXtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJbZDFdIFdlYnNvY2tldCByZXNwb25kZWQgYnV0IGFscmVhZHkgY29ubmVjdGVkIHRvIGEgZGlmZmVyZW50IG9uZVwiKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhhdC5fc29ja2V0SGFuZGxlciA9IHNvY2s7XG5cdFx0XHR0aGF0Ll9zdGF0dXMgPSAnb3BlbmVkJztcblx0XHRcdHRoYXQuX3NldHVwUGluZ1Jlc3BvbnNlKCk7XG5cdFx0fSk7XG5cblx0XHRzb2NrLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhhdC5fc29ja2V0SGFuZGxlciAhPT0gc29jaykgcmV0dXJuO1xuXHRcdFx0dGhhdC5fc29ja2V0SGFuZGxlciA9IG51bGw7XG5cdFx0XHR0aGF0Ll9zdGF0dXMgPSAnY2xvc2VkJztcblx0XHRcdHRoYXQuX3N0b3BQaW5nUmVzcG9uc2UoKTtcblx0XHRcdHRoYXQuX29uY2xvc2UoKTtcblx0XHRcdGlmKHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZCkgeyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQucmVqZWN0KFwiY2xvc2VkXCIpOyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO31cblx0XHR9KTtcblxuXHRcdHNvY2sub24oJ3RpbWVvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdFx0XHRpZih0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQpIHsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKTsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDt9XG5cdFx0fSlcblxuXHRcdHNvY2sub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihtZXNzYWdlKSB7IHRoYXQuX29ubWVzc2FnZShtZXNzYWdlKTsgfSk7XG5cblx0XHRyZXR1cm4gdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG5cdH0pO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5iRG9udFJlY29ubmVjdGVkID0gdHJ1ZTtcblx0cmV0dXJuIHRoaXMuY2xvc2UoKTtcbn07XG5cblxuRGl5YU5vZGUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc3RvcFBpbmdSZXNwb25zZSgpO1xuXHRpZih0aGlzLl9zb2NrZXRIYW5kbGVyKSByZXR1cm4gdGhpcy5fc29ja2V0SGFuZGxlci5jbG9zZSgpO1xuXHRlbHNlIHJldHVybiBRKCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gKHRoaXMuX3NvY2tldEhhbmRsZXIgJiYgdGhpcy5fc29ja2V0SGFuZGxlci5pc0Nvbm5lY3RlZCgpKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgdGltZW91dCwgb3B0aW9ucyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHRpZighcGFyYW1zLnNlcnZpY2UpIHtcblx0XHRMb2dnZXIuZXJyb3IoJ05vIHNlcnZpY2UgZGVmaW5lZCBmb3IgcmVxdWVzdCAhJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKHBhcmFtcywgXCJSZXF1ZXN0XCIpO1xuXHR0aGlzLl9hcHBlbmRNZXNzYWdlKG1lc3NhZ2UsIGNhbGxiYWNrKTtcblx0aWYodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwgPSBvcHRpb25zLmNhbGxiYWNrX3BhcnRpYWw7XG5cdG1lc3NhZ2Uub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0aWYoIWlzTmFOKHRpbWVvdXQpICYmIHRpbWVvdXQgPiAwKXtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgaGFuZGxlciA9IHRoYXQuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0XHRpZihoYW5kbGVyKSB0aGF0Ll9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCAnVGltZW91dCBleGNlZWRlZCAoJyt0aW1lb3V0KydtcykgIScpO1xuXHRcdH0sIHRpbWVvdXQpO1xuXHR9XG5cblx0aWYoIXRoaXMuX3NlbmQobWVzc2FnZSkpe1xuXHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlbmQgcmVxdWVzdCAhJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjayl7XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkUmVxdWVzdCc7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdGlmKCFwYXJhbXMuc2VydmljZSl7XG5cdFx0TG9nZ2VyLmVycm9yKCdObyBzZXJ2aWNlIGRlZmluZWQgZm9yIHN1YnNjcmlwdGlvbiAhJyk7XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0dmFyIG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKHBhcmFtcywgXCJTdWJzY3JpcHRpb25cIik7XG5cdHRoaXMuX2FwcGVuZE1lc3NhZ2UobWVzc2FnZSwgY2FsbGJhY2spO1xuXG5cdGlmKCF0aGlzLl9zZW5kKG1lc3NhZ2UpKXtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdExvZ2dlci5lcnJvcignQ2Fubm90IHNlbmQgc3Vic2NyaXB0aW9uICEnKTtcblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHRyZXR1cm4gbWVzc2FnZS5pZDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YklkKXtcblx0aWYodGhpcy5fcGVuZGluZ01lc3NhZ2VzW3N1YklkXSAmJiB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbc3ViSWRdLnR5cGUgPT09IFwiU3Vic2NyaXB0aW9uXCIpe1xuXHRcdHZhciBzdWJzY3JpcHRpb24gPSB0aGlzLl9yZW1vdmVNZXNzYWdlKHN1YklkKTtcblxuXHRcdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZSh7XG5cdFx0XHR0YXJnZXQ6IHN1YnNjcmlwdGlvbi50YXJnZXQsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHN1YklkOiBzdWJJZFxuXHRcdFx0fVxuXHRcdH0sIFwiVW5zdWJzY3JpYmVcIik7XG5cblx0XHRpZighdGhpcy5fc2VuZChtZXNzYWdlKSl7XG5cdFx0XHRMb2dnZXIuZXJyb3IoJ0Nhbm5vdCBzZW5kIHVuc3Vic2NyaWJlICEnKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vIEludGVybmFsIG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2FwcGVuZE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCBjYWxsYmFjayl7XG5cdHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXSA9IHtcblx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0dHlwZTogbWVzc2FnZS50eXBlLFxuXHRcdHRhcmdldDogbWVzc2FnZS50YXJnZXRcblx0fTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fcmVtb3ZlTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCl7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdGlmKGhhbmRsZXIpe1xuXHRcdGRlbGV0ZSB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZUlkXTtcblx0XHRyZXR1cm4gaGFuZGxlcjtcblx0fWVsc2V7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY2xlYXJNZXNzYWdlcyA9IGZ1bmN0aW9uKGVyciwgZGF0YSl7XG5cdGZvcih2YXIgbWVzc2FnZUlkIGluIHRoaXMuX3BlbmRpbmdNZXNzYWdlcyl7XG5cdFx0dmFyIGhhbmRsZXIgPSB0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2VJZCk7XG5cdFx0dGhpcy5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgZXJyLCBkYXRhKTtcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9jbGVhclBlZXJzID0gZnVuY3Rpb24oKXtcblx0d2hpbGUodGhpcy5fcGVlcnMubGVuZ3RoKSB0aGlzLmVtaXQoJ3BlZXItZGlzY29ubmVjdGVkJywgdGhpcy5fcGVlcnMucG9wKCkpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9nZXRNZXNzYWdlSGFuZGxlciA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCl7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdHJldHVybiBoYW5kbGVyID8gaGFuZGxlciA6IG51bGw7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX25vdGlmeUxpc3RlbmVyID0gZnVuY3Rpb24oaGFuZGxlciwgZXJyb3IsIGRhdGEpe1xuXHRpZihoYW5kbGVyICYmIHR5cGVvZiBoYW5kbGVyLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0ZXJyb3IgPSBlcnJvciA/IGVycm9yIDogbnVsbDtcblx0XHRkYXRhID0gZGF0YSA/IGRhdGEgOiBudWxsO1xuXHRcdHRyeSB7XG5cdFx0XHRoYW5kbGVyLmNhbGxiYWNrKGVycm9yLCBkYXRhKTtcblx0XHR9IGNhdGNoKGUpIHsgY29uc29sZS5sb2coJ1tFcnJvciBpbiBSZXF1ZXN0IGNhbGxiYWNrXSAnICsgZS5zdGFjayA/IGUuc3RhY2sgOiBlKTt9XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fc2VuZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRyZXR1cm4gdGhpcy5fc29ja2V0SGFuZGxlci5zZW5kKG1lc3NhZ2UpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zZXR1cFBpbmdSZXNwb25zZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLl9waW5nVGltZW91dCA9IDE1MDAwO1xuXHR0aGlzLl9sYXN0UGluZyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG5cdGZ1bmN0aW9uIGNoZWNrUGluZygpe1xuXHRcdHZhciBjdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0aWYoY3VyVGltZSAtIHRoYXQuX2xhc3RQaW5nID4gdGhhdC5fcGluZ1RpbWVvdXQpe1xuXHRcdFx0dGhhdC5fZm9yY2VDbG9zZSgpO1xuXHRcdFx0TG9nZ2VyLmxvZyhcImQxOiAgdGltZWQgb3V0ICFcIik7XG5cdFx0fWVsc2V7XG5cdFx0XHRMb2dnZXIubG9nKFwiZDE6IGxhc3QgcGluZyBva1wiKTtcblx0XHRcdHRoYXQuX3BpbmdTZXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGNoZWNrUGluZywgTWF0aC5yb3VuZCh0aGF0Ll9waW5nVGltZW91dCAvIDIuMSkpO1xuXHRcdH1cblx0fVxuXG5cdGNoZWNrUGluZygpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zdG9wUGluZ1Jlc3BvbnNlID0gZnVuY3Rpb24oKXtcblx0Y2xlYXJUaW1lb3V0KHRoaXMuX3BpbmdTZXRUaW1lb3V0SWQpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9mb3JjZUNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc29ja2V0SGFuZGxlci5jbG9zZSgpO1xuXHR0aGlzLl9vbmNsb3NlKCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8gU29ja2V0IGV2ZW50IGhhbmRsZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0aWYoaXNOYU4obWVzc2FnZS5pZCkpIHJldHVybiB0aGlzLl9oYW5kbGVJbnRlcm5hbE1lc3NhZ2UobWVzc2FnZSk7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIobWVzc2FnZS5pZCk7XG5cdGlmKCFoYW5kbGVyKSByZXR1cm47XG5cdHN3aXRjaChoYW5kbGVyLnR5cGUpe1xuXHRcdGNhc2UgXCJSZXF1ZXN0XCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVSZXF1ZXN0KGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlN1YnNjcmlwdGlvblwiOlxuXHRcdFx0dGhpcy5faGFuZGxlU3Vic2NyaXB0aW9uKGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLl9jbGVhck1lc3NhZ2VzKCdQZWVyRGlzY29ubmVjdGVkJyk7XG5cdHRoaXMuX2NsZWFyUGVlcnMoKTtcblxuXHRMb2dnZXIubG9nKCdkMTogY29ubmVjdGlvbiBsb3N0LCB0cnkgcmVjb25uZWN0aW5nJyk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHR0aGF0LmNvbm5lY3QodGhhdC5fYWRkciwgdGhhdC5fV1NvY2tldCkuY2F0Y2goZnVuY3Rpb24oZXJyKXt9KTtcblx0fSwgdGhhdC5fcmVjb25uZWN0VGltZW91dCk7XG5cblx0dGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX2FkZHIpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vIFByb3RvY29sIGV2ZW50IGhhbmRsZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZUludGVybmFsTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRzd2l0Y2gobWVzc2FnZS50eXBlKXtcblx0XHRjYXNlIFwiUGVlckNvbm5lY3RlZFwiOlxuXHRcdFx0dGhpcy5faGFuZGxlUGVlckNvbm5lY3RlZChtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJQZWVyRGlzY29ubmVjdGVkXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVQZWVyRGlzY29ubmVjdGVkKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkhhbmRzaGFrZVwiOlxuXHRcdFx0dGhpcy5faGFuZGxlSGFuZHNoYWtlKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlBpbmdcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVBpbmcobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVQaW5nID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdG1lc3NhZ2UudHlwZSA9IFwiUG9uZ1wiO1xuXHR0aGlzLl9sYXN0UGluZyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHR0aGlzLl9zZW5kKG1lc3NhZ2UpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVIYW5kc2hha2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblxuXHRpZihtZXNzYWdlLnBlZXJzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG1lc3NhZ2Uuc2VsZiAhPT0gJ3N0cmluZycpe1xuXHRcdExvZ2dlci5lcnJvcihcIk1pc3NpbmcgYXJndW1lbnRzIGZvciBIYW5kc2hha2UgbWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0cmV0dXJuIDtcblx0fVxuXG5cblx0dGhpcy5fc2VsZiA9IG1lc3NhZ2Uuc2VsZjtcblxuXHRmb3IodmFyIGk9MDtpPG1lc3NhZ2UucGVlcnMubGVuZ3RoOyBpKyspe1xuXHRcdHRoaXMuX3BlZXJzLnB1c2gobWVzc2FnZS5wZWVyc1tpXSk7XG5cdFx0dGhpcy5lbWl0KCdwZWVyLWNvbm5lY3RlZCcsIG1lc3NhZ2UucGVlcnNbaV0pO1xuXHR9XG5cblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkLnJlc29sdmUodGhpcy5zZWxmKCkpO1xuXHR0aGlzLmVtaXQoJ29wZW4nLCB0aGlzLl9hZGRyKTtcblx0dGhpcy5fc3RhdHVzID0gJ29wZW5lZCc7XG5cdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVBlZXJDb25uZWN0ZWQgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0aWYobWVzc2FnZS5wZWVySWQgPT09IHVuZGVmaW5lZCl7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTWlzc2luZyBhcmd1bWVudHMgZm9yIFBlZXJDb25uZWN0ZWQgbWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0cmV0dXJuIDtcblx0fVxuXG5cdC8vQWRkIHBlZXIgdG8gdGhlIGxpc3Qgb2YgcmVhY2hhYmxlIHBlZXJzXG5cdHRoaXMuX3BlZXJzLnB1c2gobWVzc2FnZS5wZWVySWQpO1xuXG5cdHRoaXMuZW1pdCgncGVlci1jb25uZWN0ZWQnLCBtZXNzYWdlLnBlZXJJZCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVBlZXJEaXNjb25uZWN0ZWQgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0aWYobWVzc2FnZS5wZWVySWQgPT09IHVuZGVmaW5lZCl7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTWlzc2luZyBhcmd1bWVudHMgZm9yIFBlZXJEaXNjb25uZWN0ZWQgTWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0cmV0dXJuIDtcblx0fVxuXG5cdC8vR28gdGhyb3VnaCBhbGwgcGVuZGluZyBtZXNzYWdlcyBhbmQgbm90aWZ5IHRoZSBvbmVzIHRoYXQgYXJlIHRhcmdldGVkXG5cdC8vYXQgdGhlIGRpc2Nvbm5lY3RlZCBwZWVyIHRoYXQgaXQgZGlzY29ubmVjdGVkIGFuZCB0aGVyZWZvcmUgdGhlIGNvbW1hbmRcblx0Ly9jYW5ub3QgYmUgZnVsZmlsbGVkXG5cdGZvcih2YXIgbWVzc2FnZUlkIGluIHRoaXMuX3BlbmRpbmdNZXNzYWdlcyl7XG5cdFx0dmFyIGhhbmRsZXIgPSB0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcihtZXNzYWdlSWQpO1xuXHRcdGlmKGhhbmRsZXIgJiYgaGFuZGxlci50YXJnZXQgPT09IG1lc3NhZ2UucGVlcklkKSB7XG5cdFx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2VJZCk7XG5cdFx0XHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCAnUGVlckRpc2Nvbm5lY3RlZCcsIG51bGwpO1xuXHRcdH1cblx0fVxuXG5cdC8vUmVtb3ZlIHBlZXIgZnJvbSBsaXN0IG9mIHJlYWNoYWJsZSBwZWVyc1xuXHRmb3IodmFyIGk9dGhpcy5fcGVlcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuXHRcdGlmKHRoaXMuX3BlZXJzW2ldID09PSBtZXNzYWdlLnBlZXJJZCl7XG5cdFx0XHR0aGlzLl9wZWVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0aGlzLmVtaXQoJ3BlZXItZGlzY29ubmVjdGVkJywgbWVzc2FnZS5wZWVySWQpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVSZXF1ZXN0ID0gZnVuY3Rpb24oaGFuZGxlciwgbWVzc2FnZSl7XG5cdGlmKG1lc3NhZ2UudHlwZSA9PT0gJ1BhcnRpYWxBbnN3ZXInKSB7XG5cdFx0aWYodHlwZW9mIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR2YXIgZXJyb3IgPSBtZXNzYWdlLmVycm9yID8gbWVzc2FnZS5lcnJvciA6IG51bGw7XG5cdFx0XHR2YXIgZGF0YSA9IG1lc3NhZ2UuZGF0YSA/IG1lc3NhZ2UuZGF0YSA6IG51bGw7XG5cdFx0XHR0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZS5pZF0uY2FsbGJhY2tfcGFydGlhbChlcnJvciwgZGF0YSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0dGhpcy5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgbWVzc2FnZS5lcnJvciwgbWVzc2FnZS5kYXRhKTtcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVTdWJzY3JpcHRpb24gPSBmdW5jdGlvbihoYW5kbGVyLCBtZXNzYWdlKXtcblx0Ly9yZW1vdmUgc3Vic2NyaXB0aW9uIGlmIGl0IHdhcyBjbG9zZWQgZnJvbSBub2RlXG5cdGlmKG1lc3NhZ2UucmVzdWx0ID09PSBcImNsb3NlZFwiKSB7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHRtZXNzYWdlLmVycm9yID0gJ1N1YnNjcmlwdGlvbkNsb3NlZCc7XG5cdH1cblx0dGhpcy5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgbWVzc2FnZS5lcnJvciwgbWVzc2FnZS5kYXRhID8gbWVzc2FnZS5kYXRhIDogbnVsbCk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFNvY2tldEhhbmRsZXIgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gU29ja2V0SGFuZGxlcihXU29ja2V0LCBhZGRyLCB0aW1lb3V0KSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5hZGRyID0gYWRkcjtcblxuXHRpZihXU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gV1NvY2tldDtcblx0ZWxzZSBpZighdGhpcy5fV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQ7XG5cdFdTb2NrZXQgPSB0aGlzLl9XU29ja2V0O1xuXG5cdHRoaXMuX3N0YXR1cyA9ICdvcGVuaW5nJztcblxuXHRcdHRyeSB7XG5cdFx0XHR0aGlzLl9zb2NrZXQgPSBhZGRyLmluZGV4T2YoXCJ3c3M6Ly9cIik9PT0wID8gbmV3IFdTb2NrZXQoYWRkciwgdW5kZWZpbmVkLCB7cmVqZWN0VW5hdXRob3JpemVkOmZhbHNlfSkgOiBuZXcgV1NvY2tldChhZGRyKTtcblxuXHRcdHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayA9IHRoaXMuX29ub3Blbi5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldENsb3NlQ2FsbGJhY2sgPSB0aGlzLl9vbmNsb3NlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5fc29ja2V0TWVzc2FnZUNhbGxiYWNrID0gdGhpcy5fb25tZXNzYWdlLmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJyx0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBlcnJvciA6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0dGhhdC5fc29ja2V0LmNsb3NlKCk7XG5cdFx0fSk7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgPT09ICdvcGVuZWQnKSByZXR1cm47XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgIT09ICdjbG9zZWQnKXtcblx0XHRcdFx0TG9nZ2VyLmxvZygnZDE6ICcgKyB0aGF0LmFkZHIgKyAnIHRpbWVkIG91dCB3aGlsZSBjb25uZWN0aW5nJyk7XG5cdFx0XHRcdHRoYXQuY2xvc2UoKTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lb3V0JywgdGhhdC5fc29ja2V0KTtcblx0XHRcdH1cblx0XHR9LCB0aW1lb3V0KTtcblxuXHR9IGNhdGNoKGUpIHtcblx0XHRMb2dnZXIuZXJyb3IoZS5zdGFjayk7XG5cdFx0dGhhdC5jbG9zZSgpO1xuXHRcdHRocm93IGU7XG5cdH1cbn07XG5pbmhlcml0cyhTb2NrZXRIYW5kbGVyLCBFdmVudEVtaXR0ZXIpO1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpIHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpO1xuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2luZyc7XG5cdGlmKHRoaXMuX3NvY2tldCkgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG5cdHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdHRyeSB7XG5cdFx0dmFyIGRhdGEgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcblx0fSBjYXRjaChlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3Qgc2VyaWFsaXplIG1lc3NhZ2UnKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR0cnkge1xuXHRcdHRoaXMuX3NvY2tldC5zZW5kKGRhdGEpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlbmQgbWVzc2FnZScpO1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3NvY2tldC5yZWFkeVN0YXRlID09IHRoaXMuX1dTb2NrZXQuT1BFTiAmJiB0aGlzLl9zdGF0dXMgPT09ICdvcGVuZWQnO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuX29ub3BlbiA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5lbWl0KCdvcGVuJywgdGhpcy5fc29ja2V0KTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHR0aGlzLnVucmVnaXN0ZXJDYWxsYmFja3MoKTtcblx0dGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX3NvY2tldCk7XG5cdGlmKHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSkgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnJlc29sdmUoKTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihldnQpIHtcblx0dHJ5IHtcblx0XHR2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpO1xuXHRcdHRoaXMuZW1pdCgnbWVzc2FnZScsIG1lc3NhZ2UpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBjYW5ub3QgcGFyc2UgbWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0dGhyb3cgZXJyO1xuXHR9XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS51bnJlZ2lzdGVyQ2FsbGJhY2tzID0gZnVuY3Rpb24oKSB7XG5cdGlmKHRoaXMuX3NvY2tldCAmJiAodHlwZW9mIHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSl7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29wZW4nLCB0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2spO1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbG9zZScsIHRoaXMuX3NvY2tldENsb3NlQ2FsbGJhY2spO1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5fc29ja2V0TWVzc2FnZUNhbGxiYWNrKTtcblx0fSBlbHNlIGlmKHRoaXMuX3NvY2tldCAmJiAodHlwZW9mIHRoaXMuX3NvY2tldC5yZW1vdmVBbGxMaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpKXtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG5cdH1cbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBVdGlsaXR5IG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLl9jcmVhdGVNZXNzYWdlID0gZnVuY3Rpb24ocGFyYW1zLCB0eXBlKXtcblx0aWYoIXBhcmFtcyB8fCAhdHlwZSB8fCAodHlwZSAhPT0gXCJSZXF1ZXN0XCIgJiYgdHlwZSAhPT0gXCJTdWJzY3JpcHRpb25cIiAmJiB0eXBlICE9PSBcIlVuc3Vic2NyaWJlXCIpKXtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0dHlwZTogdHlwZSxcblx0XHRpZDogdGhpcy5fZ2VuZXJhdGVJZCgpLFxuXHRcdHNlcnZpY2U6IHBhcmFtcy5zZXJ2aWNlLFxuXHRcdHRhcmdldDogcGFyYW1zLnRhcmdldCxcblx0XHRmdW5jOiBwYXJhbXMuZnVuYyxcblx0XHRvYmo6IHBhcmFtcy5vYmosXG5cdFx0ZGF0YTogcGFyYW1zLmRhdGFcblx0fTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fZ2VuZXJhdGVJZCA9IGZ1bmN0aW9uKCl7XG5cdHZhciBpZCA9IHRoaXMuX25leHRJZDtcblx0dGhpcy5fbmV4dElkKys7XG5cdHJldHVybiBpZDtcbn07XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERpeWFOb2RlO1xuIiwidmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbnZhciBEaXlhTm9kZSA9IHJlcXVpcmUoJy4vRGl5YU5vZGUnKTtcblxudmFyIGNvbm5lY3Rpb24gPSBuZXcgRGl5YU5vZGUoKTtcbnZhciBjb25uZWN0aW9uRXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xudmFyIF91c2VyID0gbnVsbDtcbnZhciBfcGFzcyA9IG51bGw7XG52YXIgX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcblxuXG4vLy8vLy8vLy8vLy8vL1xuLy8gIEQxIEFQSSAgLy9cbi8vLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gZDEoc2VsZWN0b3Ipe1xuXHRyZXR1cm4gbmV3IERpeWFTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmQxLkRpeWFOb2RlID0gRGl5YU5vZGU7XG5kMS5EaXlhU2VsZWN0b3IgPSBEaXlhU2VsZWN0b3I7XG5cbmQxLmNvbm5lY3QgPSBmdW5jdGlvbihhZGRyLCBXU29ja2V0KXtcblx0cmV0dXJuIGNvbm5lY3Rpb24uY29ubmVjdChhZGRyLCBXU29ja2V0KTtcbn07XG5cbmQxLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gY29ubmVjdGlvbi5kaXNjb25uZWN0KCk7XG59O1xuXG5kMS5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uKCkge1x0cmV0dXJuIGNvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKTt9O1xuZDEucGVlcnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24ucGVlcnMoKTt9O1xuZDEuc2VsZiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5zZWxmKCk7IH07XG5kMS5hZGRyID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLmFkZHIoKTsgfTtcbmQxLnVzZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIF91c2VyOyB9O1xuZDEucGFzcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gX3Bhc3M7IH07XG5kMS5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIF9hdXRoZW50aWNhdGVkOyB9XG5cblxuLyoqIFRyeSB0byBjb25uZWN0IHRvIHRoZSBnaXZlbiBzZXJ2ZXJzIGxpc3QgaW4gdGhlIGxpc3Qgb3JkZXIsIHVudGlsIGZpbmRpbmcgYW4gYXZhaWxhYmxlIG9uZSAqL1xuZDEudHJ5Q29ubmVjdCA9IGZ1bmN0aW9uKHNlcnZlcnMsIFdTb2NrZXQpe1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdGZ1bmN0aW9uIHRjKGkpIHtcblx0XHRkMS5jb25uZWN0KHNlcnZlcnNbaV0sIFdTb2NrZXQpLnRoZW4oZnVuY3Rpb24oZSl7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShzZXJ2ZXJzW2ldKTtcblx0XHR9KS5jYXRjaChmdW5jdGlvbihlKXtcblx0XHRcdGQxLmRpc2Nvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpKys7XG5cdFx0XHRcdGlmKGk8c2VydmVycy5sZW5ndGgpIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7dGMoaSk7fSwgMTAwKTtcblx0XHRcdFx0ZWxzZSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KFwiVGltZW91dFwiKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cdHRjKDApO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZDEuY3VycmVudFNlcnZlciA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBjb25uZWN0aW9uLl9hZGRyO1xufTtcblxuZDEub24gPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuXHRjb25uZWN0aW9uLm9uKGV2ZW50LCBjYWxsYmFjayk7XG5cdHJldHVybiBkMTtcbn07XG5cbmQxLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKXtcblx0Y29ubmVjdGlvbi5yZW1vdmVMaXN0ZW5lcihldmVudCwgY2FsbGJhY2spO1xuXHRyZXR1cm4gZDE7XG59O1xuXG4vKiogU2hvcnRoYW5kIGZ1bmN0aW9uIHRvIGNvbm5lY3QgYW5kIGxvZ2luIHdpdGggdGhlIGdpdmVuICh1c2VyLHBhc3N3b3JkKSAqL1xuZDEuY29ubmVjdEFzVXNlciA9IGZ1bmN0aW9uKGlwLCB1c2VyLCBwYXNzd29yZCwgV1NvY2tldCkge1xuXHRyZXR1cm4gZDEuY29ubmVjdChpcCwgV1NvY2tldCkudGhlbihmdW5jdGlvbigpe1xuXHRcdHJldHVybiBkMShcIiNzZWxmXCIpLmF1dGgodXNlciwgcGFzc3dvcmQpO1xuXHR9KTtcbn07XG5cbmQxLmRlYXV0aGVudGljYXRlID0gZnVuY3Rpb24oKXsgX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZTsgX3VzZXIgPSBudWxsOyBfcGFzcyA9IG51bGw7fTtcbmQxLnNldFNlY3VyZWQgPSBmdW5jdGlvbihiU2VjdXJlZCkgeyBjb25uZWN0aW9uLnNldFNlY3VyZWQoYlNlY3VyZWQpOyB9O1xuZDEuaXNTZWN1cmVkID0gZnVuY3Rpb24oKSB7cmV0dXJuIGNvbm5lY3Rpb24uX3NlY3VyZWQ7IH1cbmQxLnNldFdTb2NrZXQgPSBmdW5jdGlvbihXU29ja2V0KSB7IGNvbm5lY3Rpb24uc2V0V1NvY2tldChXU29ja2V0KTsgfVxuXG5cbi8qKiBTZWxmLWF1dGhlbnRpY2F0ZSB0aGUgbG9jYWwgRGl5YU5vZGUgYm91bmQgdG8gcG9ydCA8cG9ydD4sIHVzaW5nIGl0cyBSU0Egc2lnbmF0dXJlICovXG5kMS5zZWxmQ29ubmVjdCA9IGZ1bmN0aW9uKHBvcnQsIHNpZ25hdHVyZSwgV1NvY2tldCkge1xuXHRyZXR1cm4gZDEuY29ubmVjdCgnd3M6Ly9sb2NhbGhvc3Q6JyArIHBvcnQsIFdTb2NrZXQpXG5cdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdFx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0XHRzZXJ2aWNlOiAncGVlckF1dGgnLFxuXHRcdFx0XHRmdW5jOiAnU2VsZkF1dGhlbnRpY2F0ZScsXG5cdFx0XHRcdGRhdGE6IHtcdHNpZ25hdHVyZTogc2lnbmF0dXJlIH1cblx0XHRcdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHRcdGlmKGRhdGEgJiYgZGF0YS5hdXRoZW50aWNhdGVkKXtcblx0XHRcdFx0XHRfYXV0aGVudGljYXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0X3VzZXIgPSBcIiNEaXlhTm9kZSNcIitwZWVySWQ7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9hdXRoZW50aWNhdGVkID0gZmFsc2U7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KCdBY2Nlc3NEZW5pZWQnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fSk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERpeWFTZWxlY3RvciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIERpeWFTZWxlY3RvcihzZWxlY3Rvcil7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG5cdHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG5cdHRoaXMuX2xpc3RlbmVyQ291bnQgPSAwO1xuXHR0aGlzLl9saXN0ZW5DYWxsYmFjayA9IG51bGw7XG5cdHRoaXMuX2NhbGxiYWNrQXR0YWNoZWQgPSBmYWxzZTtcbn1cbmluaGVyaXRzKERpeWFTZWxlY3RvciwgRXZlbnRFbWl0dGVyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFB1YmxpYyBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9zZWxlY3QoKTsgfTtcblxuXG5cbi8qKlxuICogQXBwbHkgY2FsbGJhY2sgY2IgdG8gZWFjaCBzZWxlY3RlZCBwZWVyLiBQZWVycyBhcmUgc2VsZWN0ZWRcbiAqIGFjY29yZGluZyB0byB0aGUgcnVsZSAnc2VsZWN0b3InIGdpdmVuIHRvIGNvbnN0cnVjdG9yLiBTZWxlY3RvciBjYW5cbiAqIGJlIGEgcGVlcklkLCBhIHJlZ0V4IGZvciBwZWVySWRzIG9mIGFuIGFycmF5IG9mIHBlZXJJZHMuXG4gKiBAcGFyYW1zIFx0Y2JcdFx0Y2FsbGJhY2sgdG8gYmUgYXBwbGllZFxuICogQHJldHVybiBcdHRoaXMgXHQ8RGl5YVNlbGVjdG9yPlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihjYil7XG5cdHZhciBwZWVycyA9IHRoaXMuX3NlbGVjdCgpO1xuXHRmb3IodmFyIGk9MDsgaTxwZWVycy5sZW5ndGg7IGkrKykgY2IuYmluZCh0aGlzKShwZWVyc1tpXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIHJlcXVlc3QgdG8gc2VsZWN0ZWQgcGVlcnMgKCBzZWUgZWFjaCgpICkgdGhyb3VnaCB0aGUgY3VycmVudCBjb25uZWN0aW9uIChEaXlhTm9kZSkuXG4gKiBAcGFyYW0ge1N0cmluZyB8IE9iamVjdH0gcGFyYW1zIDogY2FuIGJlIHNlcnZpY2UuZnVuY3Rpb24gb3Ige3NlcnZpY2U6c2VydmljZSwgZnVuYzpmdW5jdGlvbiwgLi4ufVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrLCB0aW1lb3V0LCBvcHRpb25zKXtcblx0aWYoIWNvbm5lY3Rpb24pIHJldHVybiB0aGlzO1xuXHRpZighb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHR2YXIgbmJBbnN3ZXJzID0gMDtcblx0dmFyIG5iRXhwZWN0ZWQgPSB0aGlzLl9zZWxlY3QoKS5sZW5ndGg7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24ocGVlcklkKXtcblx0XHRwYXJhbXMudGFyZ2V0ID0gcGVlcklkO1xuXG5cdFx0dmFyIG9wdHMgPSB7fTtcblx0XHRmb3IodmFyIGkgaW4gb3B0aW9ucykgb3B0c1tpXSA9IG9wdGlvbnNbaV07XG5cdFx0aWYodHlwZW9mIG9wdHMuY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykgb3B0cy5jYWxsYmFja19wYXJ0aWFsID0gZnVuY3Rpb24oZXJyLCBkYXRhKXsgb3B0aW9ucy5jYWxsYmFja19wYXJ0aWFsKHBlZXJJZCwgZXJyLCBkYXRhKTt9XG5cblx0XHRjb25uZWN0aW9uLnJlcXVlc3QocGFyYW1zLCBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7XG5cdFx0XHRuYkFuc3dlcnMrKztcblx0XHRcdGlmKG5iQW5zd2VycyA9PSBuYkV4cGVjdGVkICYmIG9wdGlvbnMuYk5vdGlmeVdoZW5GaW5pc2hlZCkgY2FsbGJhY2sobnVsbCwgZXJyLCBcIiMjRU5EIyNcIik7IC8vIFRPRE8gOiBGaW5kIGEgYmV0dGVyIHdheSB0byBub3RpZnkgcmVxdWVzdCBFTkQgISFcblx0XHR9LCB0aW1lb3V0LCBvcHRzKTtcblx0fSk7XG59O1xuXG5cbi8vIElNUE9SVEFOVCAhISEgQnkgMzAvMTEvMTUsIHRoaXMgbWV0aG9kIGRvZXNuJ3QgcmV0dXJuICd0aGlzJyBhbnltb3JlLCBidXQgYSBTdWJzY3JpcHRpb24gb2JqZWN0IGluc3RlYWRcbi8qIEBwYXJhbSB7U3RyaW5nIHwgT2JqZWN0fSBwYXJhbXMgOiBjYW4gYmUgJ3NlcnZpY2UuZnVuY3Rpb24nIG9yIHtzZXJ2aWNlOnNlcnZpY2UsIGZ1bmM6ZnVuY3Rpb24sIC4uLn0gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucyl7XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkU3Vic2NyaXB0aW9uJztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0cmV0dXJuIG5ldyBTdWJzY3JpcHRpb24odGhpcywgcGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucyk7XG59O1xuXG5cbi8vIElNUE9SVEFOVCAhISEgQlkgMzAvMTEvMTUsIHRoaXMgbWV0aG9kIGRvZXNuJ3QgdGFrZSBzdWJJZHMgYXMgaW5wdXQgYW55bW9yZS5cbi8vIFBsZWFzZSBwcm92aWRlIGEgc3Vic2NyaXB0aW9uIGluc3RlYWQgIVxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbil7XG5cdGlmKEFycmF5LmlzQXJyYXkoc3Vic2NyaXB0aW9uKSB8fCAhc3Vic2NyaXB0aW9uLmNsb3NlKSByZXR1cm4gdGhpcy5fX29sZF9kZXByZWNhdGVkX3Vuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbik7XG5cdHJldHVybiBzdWJzY3JpcHRpb24uY2xvc2UoKTtcbn07XG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3N3b3JkLCBjYWxsYmFjaywgdGltZW91dCl7XG5cdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXMpO1xuXG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdhdXRoJyxcblx0XHRmdW5jOiAnQXV0aGVudGljYXRlJyxcblx0XHRkYXRhOiB7XG5cdFx0XHR1c2VyOiB1c2VyLFxuXHRcdFx0cGFzc3dvcmQ6IHBhc3N3b3JkXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cblx0XHRpZihlcnIgPT09ICdTZXJ2aWNlTm90Rm91bmQnKXtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCB0cnVlKTtcblx0XHRcdGVsc2UgZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdGlmKCFlcnIgJiYgZGF0YSAmJiBkYXRhLmF1dGhlbnRpY2F0ZWQpe1xuXHRcdFx0X2F1dGhlbnRpY2F0ZWQgPSB0cnVlO1xuXHRcdFx0X3VzZXIgPSB1c2VyO1xuXHRcdFx0X3Bhc3MgPSBwYXNzd29yZDtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCB0cnVlKTtcblx0XHRcdGVsc2UgZGVmZXJyZWQucmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRfYXV0aGVudGljYXRlZCA9IGZhbHNlO1xuXHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhwZWVySWQsIGZhbHNlKTtcblx0XHRcdGVsc2UgZGVmZXJyZWQucmVqZWN0KCdBY2Nlc3NEZW5pZWQnKTtcblx0XHR9XG5cblx0fSwgdGltZW91dCk7XG5cblx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5cblxuLy8gUHJpdmF0ZXNcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fc2VsZWN0ID0gZnVuY3Rpb24oc2VsZWN0b3JGdW5jdGlvbil7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHRpZighY29ubmVjdGlvbikgcmV0dXJuIFtdO1xuXHRyZXR1cm4gY29ubmVjdGlvbi5wZWVycygpLmZpbHRlcihmdW5jdGlvbihwZWVySWQpe1xuXHRcdHJldHVybiBtYXRjaCh0aGF0Ll9zZWxlY3RvciwgcGVlcklkKTtcblx0fSk7XG59O1xuXG5mdW5jdGlvbiBtYXRjaChzZWxlY3Rvciwgc3RyKXtcblx0aWYoIXNlbGVjdG9yKSByZXR1cm4gZmFsc2U7XG5cdGlmKHNlbGVjdG9yID09PSBcIiNzZWxmXCIpIHJldHVybiBjb25uZWN0aW9uICYmIHN0cj09PWNvbm5lY3Rpb24uc2VsZigpO1xuXHRlbHNlIGlmKHNlbGVjdG9yLm5vdCkgcmV0dXJuICFtYXRjaChzZWxlY3Rvci5ub3QsIHN0cik7XG5cdGVsc2UgaWYoc2VsZWN0b3IuY29uc3RydWN0b3IubmFtZSA9PT0gJ1N0cmluZycpe1xuXHRcdHJldHVybiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKTtcblx0fSBlbHNlIGlmKHNlbGVjdG9yLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdSZWdFeHAnKXtcblx0XHRyZXR1cm4gbWF0Y2hSZWdFeHAoc2VsZWN0b3IsIHN0cik7XG5cdH0gZWxzZSBpZihBcnJheS5pc0FycmF5KHNlbGVjdG9yKSl7XG5cdFx0cmV0dXJuIG1hdGNoQXJyYXkoc2VsZWN0b3IsIHN0cik7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKXtcblx0cmV0dXJuIHNlbGVjdG9yID09PSBzdHI7XG59XG5cbmZ1bmN0aW9uIG1hdGNoUmVnRXhwKHNlbGVjdG9yLCBzdHIpe1xuXHRyZXR1cm4gc3RyLm1hdGNoKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hBcnJheShzZWxlY3Rvciwgc3RyKXtcblx0Zm9yKHZhciBpPTA7aTxzZWxlY3Rvci5sZW5ndGg7IGkrKyl7XG5cdFx0aWYoc2VsZWN0b3JbaV0gPT09IHN0cikgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG4vLyBPdmVycmlkZXMgRXZlbnRFbWl0dGVyJ3MgYmVoYXZpb3IgdG8gcHJveHkgYW5kIGZpbHRlciBldmVudHMgZnJvbSB0aGUgY29ubmVjdGlvblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fb24gPSBEaXlhU2VsZWN0b3IucHJvdG90eXBlLm9uO1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKXtcblx0Y2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdFx0aWYobWF0Y2godGhpcy5fc2VsZWN0b3IsIHBlZXJJZCkpIHRoaXMuZW1pdCh0eXBlLCBwZWVySWQpO1xuXHR9O1xuXHRjb25uZWN0aW9uLm9uKHR5cGUsIGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlcik7XG5cdHZhciByZXQgPSB0aGlzLl9vbih0eXBlLCBjYWxsYmFjayk7XG5cblx0Ly8gSGFuZGxlIHRoZSBzcGVjaWZpYyBjYXNlIG9mIFwicGVlci1jb25uZWN0ZWRcIiBldmVudHMsIGkuZS4sIG5vdGlmeSBvZiBhbHJlYWR5IGNvbm5lY3RlZCBwZWVyc1xuXHRpZih0eXBlID09PSAncGVlci1jb25uZWN0ZWQnICYmIGNvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKSkge1xuXHRcdHZhciBwZWVycyA9IGNvbm5lY3Rpb24ucGVlcnMoKTtcblx0XHRmb3IodmFyIGk9MDtpPHBlZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZihtYXRjaCh0aGlzLl9zZWxlY3RvciwgcGVlcnNbaV0pKSBjYWxsYmFjayhwZWVyc1tpXSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXQ7XG59O1xuXG5cbi8vIE92ZXJyaWRlcyBFdmVudEVtaXR0ZXIncyBiZWhhdmlvciB0byBwcm94eSBhbmQgZmlsdGVyIGV2ZW50cyBmcm9tIHRoZSBjb25uZWN0aW9uXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLl9yZW1vdmVMaXN0ZW5lciA9IERpeWFTZWxlY3Rvci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2spIHtcblx0aWYoY2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyKSBjb25uZWN0aW9uLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlcik7XG5cdHRoaXMuX3JlbW92ZUxpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFNVQlNDUklQVElPTiAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4qIEhhbmRsZXMgYSBzdWJzY3JpcHRpb24gdG8gc29tZSBEaXlhTm9kZSBzZXJ2aWNlIGZvciBtdWx0aXBsZSBub2Rlc1xuKiBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIHNlbGVjdG9yXG4qL1xuZnVuY3Rpb24gU3Vic2NyaXB0aW9uKHNlbGVjdG9yLCBwYXJhbXMsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0XHR0aGlzLnBhcmFtcyA9IHBhcmFtcztcblx0XHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblx0XHR0aGlzLnN1YklkcyA9IFtdO1xuXG5cdFx0dGhpcy5kb1N1YnNjcmliZSA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHRcdFx0dGhhdC5zdWJJZHMucHVzaCh0aGF0Ll9hZGRTdWJzY3JpcHRpb24ocGVlcklkKSk7XG5cdFx0XHR0aGF0LnN0YXRlID0gXCJvcGVuXCI7XG5cdFx0fTtcblxuXHRcdGlmKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuYXV0bykge1xuXHRcdFx0dGhpcy5zZWxlY3Rvci5vbigncGVlci1jb25uZWN0ZWQnLCB0aGlzLmRvU3Vic2NyaWJlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZWxlY3Rvci5lYWNoKHRoaXMuZG9TdWJzY3JpYmUpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xufTtcblxuU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRmb3IodmFyIGkgPSAwOyBpPHRoaXMuc3ViSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29ubmVjdGlvbi51bnN1YnNjcmliZSh0aGlzLnN1Yklkc1tpXSk7XG5cdH1cblx0dGhpcy5zdWJJZHMgPSBbXTtcblx0dGhpcy5zZWxlY3Rvci5yZW1vdmVMaXN0ZW5lcigncGVlci1jb25uZWN0ZWQnLCB0aGlzLmRvU3Vic2NyaWJlKTtcblx0dGhpcy5zdGF0ZSA9IFwiY2xvc2VkXCI7XG59O1xuXG5TdWJzY3JpcHRpb24ucHJvdG90eXBlLl9hZGRTdWJzY3JpcHRpb24gPSBmdW5jdGlvbihwZWVySWQpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRwYXJhbXMgPSB7fTtcblx0Zm9yKHZhciBrIGluIHRoaXMucGFyYW1zKSBwYXJhbXNba10gPSB0aGlzLnBhcmFtc1trXTtcblx0cGFyYW1zLnRhcmdldCA9IHBlZXJJZDtcblx0dmFyIHN1YklkID0gY29ubmVjdGlvbi5zdWJzY3JpYmUocGFyYW1zLCBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRcdHRoYXQuY2FsbGJhY2socGVlcklkLCBlcnIsIGRhdGEpO1xuXHR9KTtcblx0aWYodGhpcy5vcHRpb25zICYmIEFycmF5LmlzQXJyYXkodGhpcy5vcHRpb25zLnN1YklkcykpXG5cdFx0dGhpcy5vcHRpb25zLnN1Yklkc1twZWVySWRdID0gc3ViSWQ7XG5cdHJldHVybiBzdWJJZDtcbn07XG5cblxuXG5cblxuLy8gTGVnYWN5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuLyoqIEBkZXByZWNhdGVkICAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbigpe307XG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX19vbGRfZGVwcmVjYXRlZF91bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1Yklkcykge1xuXHR0aGlzLmVhY2goZnVuY3Rpb24ocGVlcklkKXtcblx0XHR2YXIgc3ViSWQgPSBzdWJJZHNbcGVlcklkXTtcblx0XHRpZihzdWJJZCkgY29ubmVjdGlvbi51bnN1YnNjcmliZShzdWJJZCk7XG5cdH0pO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gZDE7XG4iLCJ2YXIgZDEgPSByZXF1aXJlKCcuL0RpeWFTZWxlY3Rvci5qcycpO1xuXG4vLyByZXF1aXJlKCcuL3NlcnZpY2VzL3RpbWVyL3RpbWVyLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL3J0Yy9ydGMuanMnKTtcbi8vcmVxdWlyZSgnLi9zZXJ2aWNlcy9leHBsb3Jlci9leHBsb3Jlci5qcycpO1xuLy9yZXF1aXJlKCcuL3NlcnZpY2VzL3BpY28vcGljby5qcycpO1xuLy9yZXF1aXJlKCcuL3NlcnZpY2VzL3ZpZXdlcl9leHBsb3Jlci92aWV3ZXJfZXhwbG9yZXIuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvaWVxL2llcS5qcycpO1xuLy9yZXF1aXJlKCcuL3NlcnZpY2VzL25ldHdvcmtJZC9OZXR3b3JrSWQuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvbWFwcy9tYXBzLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL3BlZXJBdXRoL1BlZXJBdXRoLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL21lc2hOZXR3b3JrL01lc2hOZXR3b3JrLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvdmVyYm9zZS9WZXJib3NlLmpzJyk7XG5yZXF1aXJlKCcuL3V0aWxzL2VuY29kaW5nL2VuY29kaW5nLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL3N0YXR1cy9zdGF0dXMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkMTtcbiIsIi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAgIFRvZG8gOlxuICAgY2hlY2sgZXJyIGZvciBlYWNoIGRhdGFcbiAgIGltcHJvdmUgQVBJIDogZ2V0RGF0YShzZW5zb3JOYW1lLCBkYXRhQ29uZmlnKVxuICAgcmV0dXJuIGFkYXB0ZWQgdmVjdG9yIGZvciBkaXNwbGF5IHdpdGggRDMgdG8gcmVkdWNlIGNvZGUgaW4gSUhNID9cbiAgIHVwZGF0ZURhdGEoc2Vuc29yTmFtZSwgZGF0YUNvbmZpZylcbiAgIHNldCBhbmQgZ2V0IGZvciB0aGUgZGlmZmVyZW50IGRhdGFDb25maWcgcGFyYW1zXG5cbiovXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IHRydWU7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8qKlxuICpcdGNhbGxiYWNrIDogZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1vZGVsIHVwZGF0ZWRcbiAqICovXG5mdW5jdGlvbiBJRVEoc2VsZWN0b3Ipe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0dGhpcy5kYXRhTW9kZWw9e307XG5cdHRoaXMuX2NvZGVyID0gc2VsZWN0b3IuZW5jb2RlKCk7XG5cdHRoaXMuc3Vic2NyaXB0aW9ucyA9IFtdO1xuXG5cblx0LyoqKiBzdHJ1Y3R1cmUgb2YgZGF0YSBjb25maWcgKioqXG5cdFx0IGNyaXRlcmlhIDpcblx0XHQgICB0aW1lOiBhbGwgMyB0aW1lIGNyaXRlcmlhIHNob3VsZCBub3QgYmUgZGVmaW5lZCBhdCB0aGUgc2FtZSB0aW1lLiAocmFuZ2Ugd291bGQgYmUgZ2l2ZW4gdXApXG5cdFx0ICAgICBiZWc6IHtbbnVsbF0sdGltZX0gKG51bGwgbWVhbnMgbW9zdCByZWNlbnQpIC8vIHN0b3JlZCBhIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgZW5kOiB7W251bGxdLCB0aW1lfSAobnVsbCBtZWFucyBtb3N0IG9sZGVzdCkgLy8gc3RvcmVkIGFzIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgcmFuZ2U6IHtbbnVsbF0sIHRpbWV9IChyYW5nZSBvZiB0aW1lKHBvc2l0aXZlKSApIC8vIGluIHMgKG51bSlcblx0XHQgICByb2JvdDoge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCAgIHBsYWNlOiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0IG9wZXJhdG9yOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9IC0oIG1heWJlIG1veSBzaG91bGQgYmUgZGVmYXVsdFxuXHRcdCAuLi5cblxuXHRcdCBzZW5zb3JzIDoge1tudWxsXSBvciBBcnJheU9mIFNlbnNvck5hbWV9XG5cblx0XHQgc2FtcGxpbmc6IHtbbnVsbF0gb3IgaW50fVxuXHQqL1xuXHR0aGlzLmRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHtcblx0XHRcdFx0YmVnOiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbCxcblx0XHRcdHBsYWNlOiBudWxsXG5cdFx0fSxcblx0XHRvcGVyYXRvcjogJ2xhc3QnLFxuXHRcdHNlbnNvcnM6IG51bGwsXG5cdFx0c2FtcGxpbmc6IG51bGwgLy9zYW1wbGluZ1xuXHR9O1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDpcbiAqIHtcbiAqXHRcInNlbnNldXJYWFwiOiB7XG4gKlx0XHRcdGRhdGE6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRwbGFjZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHF1YWxpdHlJbmRleDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJhbmdlOiBbRkxPQVQsIEZMT0FUXSxcbiAqXHRcdFx0dW5pdDogc3RyaW5nLFxuICpcdFx0bGFiZWw6IHN0cmluZ1xuICpcdFx0fSxcbiAqXHQgLi4uIChcInNlbnNldXJzWVlcIilcbiAqIH1cbiAqL1xuSUVRLnByb3RvdHlwZS5nZXREYXRhTW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59O1xuSUVRLnByb3RvdHlwZS5nZXREYXRhUmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwucmFuZ2U7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tSUVRXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtJRVF9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuSUVRLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBiZWcgYW5kIGVuZC5cbiAqIElmIHBhcmFtIGRlZmluZWRcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVCZWcgLy8gbWF5IGJlIG51bGxcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVFbmQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcmV0dXJuIHtJRVF9IHRoaXNcbiAqIElmIG5vIHBhcmFtIGRlZmluZWQ6XG4gKlx0QHJldHVybiB7T2JqZWN0fSBUaW1lIG9iamVjdDogZmllbGRzIGJlZyBhbmQgZW5kLlxuICovXG5JRVEucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZUJlZyxuZXdUaW1lRW5kLCBuZXdSYW5nZSl7XG5cdGlmKG5ld1RpbWVCZWcgfHwgbmV3VGltZUVuZCB8fCBuZXdSYW5nZSkge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyA9IG5ld1RpbWVCZWcuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCA9IG5ld1RpbWVFbmQuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlID0gbmV3UmFuZ2U7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB7XG5cdFx0XHRiZWc6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzXG4gKiBTZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSBwbGFjZUlkcyBsaXN0IG9mIHBsYWNlIElkc1xuICogR2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2YgcGxhY2UgSWRzXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YVBsYWNlSWRzID0gZnVuY3Rpb24ocGxhY2VJZHMpe1xuXHRpZihwbGFjZUlkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZUlkID0gcGxhY2VJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2U7XG59O1xuLyoqXG4gKiBHZXQgZGF0YSBieSBzZW5zb3IgbmFtZS5cbiAqXHRAcGFyYW0ge0FycmF5W1N0cmluZ119IHNlbnNvck5hbWUgbGlzdCBvZiBzZW5zb3JzXG4gKi9cbklFUS5wcm90b3R5cGUuZ2V0RGF0YUJ5TmFtZSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzKXtcblx0dmFyIGRhdGE9W107XG5cdGZvcih2YXIgbiBpbiBzZW5zb3JOYW1lcykge1xuXHRcdGRhdGEucHVzaCh0aGlzLmRhdGFNb2RlbFtzZW5zb3JOYW1lc1tuXV0pO1xuXHR9XG5cdHJldHVybiBkYXRhO1xufTtcbi8qKlxuICogVXBkYXRlIGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cbklFUS5wcm90b3R5cGUudXBkYXRlRGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwiaWVxXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJzcGxSZXFcIixcblx0XHRcdGRhdGFDb25maWc6IHRoYXQuZGF0YUNvbmZpZ1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIltcIit0aGF0LmRhdGFDb25maWcuc2Vuc29ycytcIl0gUmVjdiBlcnI6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiVXBkYXRlRGF0YTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5kYXRhQ29uZmlnKSk7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJEYXRhIHJlcXVlc3QgZmFpbGVkIChcIitkYXRhLmhlYWRlci5lcnJvci5zdCtcIik6IFwiK2RhdGEuaGVhZGVyLmVycm9yLm1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XG5cdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHQvLyBMb2dnZXIubG9nKHRoYXQuZ2V0RGF0YU1vZGVsKCkpO1xuXG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoYXQpOyAvLyBiaW5kIGNhbGxiYWNrIHdpdGggSUVRXG5cdFx0Y2FsbGJhY2sodGhhdC5nZXREYXRhTW9kZWwoKSk7IC8vIGNhbGxiYWNrIGZ1bmNcblx0fSk7XG59O1xuXG5JRVEucHJvdG90eXBlLl9pc0RhdGFNb2RlbFdpdGhOYU4gPSBmdW5jdGlvbigpIHtcblx0dmFyIGRhdGFNb2RlbE5hTj1mYWxzZTtcblx0dmFyIHNlbnNvck5hbjtcblx0Zm9yKHZhciBuIGluIHRoaXMuZGF0YU1vZGVsKSB7XG5cdFx0c2Vuc29yTmFuID0gdGhpcy5kYXRhTW9kZWxbbl0uZGF0YS5yZWR1Y2UoZnVuY3Rpb24obmFuUHJlcyxkKSB7XG5cdFx0XHRyZXR1cm4gbmFuUHJlcyAmJiBpc05hTihkKTtcblx0XHR9LGZhbHNlKTtcblx0XHRkYXRhTW9kZWxOYU4gPSBkYXRhTW9kZWxOYU4gJiYgc2Vuc29yTmFuO1xuXHRcdExvZ2dlci5sb2cobitcIiB3aXRoIG5hbiA6IFwiK3NlbnNvck5hbitcIiAoXCIrZGF0YU1vZGVsTmFOK1wiKSAvIFwiK3RoaXMuZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoKTtcblx0fVxufTtcblxuSUVRLnByb3RvdHlwZS5nZXRDb25maW5lbWVudExldmVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuY29uZmluZW1lbnQ7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEFpclF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmFpclF1YWxpdHk7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEVudlF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmVudlF1YWxpdHk7XG59O1xuXG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIGRhdGEgdG8gY29uZmlndXJlIHN1YnNjcmlwdGlvblxuICogQHBhcmFtICBjYWxsYmFjayBjYWxsZWQgb24gYW5zd2VycyAoQHBhcmFtIDogZGF0YU1vZGVsKVxuICovXG5JRVEucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXG5cdC8vLyBUT0RPXG5cdGRhdGEgPSBkYXRhIHx8IHt0aW1lUmFuZ2U6ICdob3Vycyd9O1xuXG5cdHZhciBzdWJzID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6IFwiaWVxXCIsXG5cdFx0ZnVuYzogXCJEYXRhXCIsXG5cdFx0ZGF0YTogZGF0YVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiV2F0Y2hJRVFSZWN2RXJyOlwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiV2F0Y2hJRVE6XFxuXCIrSlNPTi5zdHJpbmdpZnkoZGF0YS5oZWFkZXIuZGF0YUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHR0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcblxuXHRcdGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGF0KTsgLy8gYmluZCBjYWxsYmFjayB3aXRoIElFUVxuXHRcdGNhbGxiYWNrKHRoYXQuZ2V0RGF0YU1vZGVsKCkpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnMpO1xufTtcblxuLyoqXG4gKiBDbG9zZSBhbGwgc3Vic2NyaXB0aW9uc1xuICovXG5JRVEucHJvdG90eXBlLmNsb3NlU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgaSBpbiB0aGlzLnN1YnNjcmlwdGlvbnMpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaV0uY2xvc2UoKTtcblx0fVxuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPVtdO1xufTtcblxuLyoqXG4gKiByZXF1ZXN0IERhdGEgdG8gbWFrZSBDU1YgZmlsZVxuICovXG5JRVEucHJvdG90eXBlLmdldENTVkRhdGEgPSBmdW5jdGlvbihzZW5zb3JOYW1lcyxjYWxsYmFjayl7XG5cdHZhciBkYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7IHJhbmdlVW5pdDogJ2hvdXInLCByYW5nZTogMTgwfSwgLy8gMzYwaCAtPiAxNWQgLy8gMTgwaCAtPiA3alxuXHRcdFx0cGxhY2VzOiBbXSxcblx0XHRcdHJvYm90czogW11cblx0XHR9LFxuXHRcdHNlbnNvcnM6IHNlbnNvck5hbWVzXG5cdH07XG5cblx0dGhpcy51cGRhdGVEYXRhKGNhbGxiYWNrLCBkYXRhQ29uZmlnKTtcbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cbklFUS5wcm90b3R5cGUuX2dldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9bnVsbDtcblxuXHRpZihkYXRhLmVyciAmJiBkYXRhLmVyci5zdD4wKSB7XG5cdFx0TG9nZ2VyLmVycm9yKGRhdGEuZXJyLm1zZyk7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0ZGVsZXRlIGRhdGEuZXJyO1xuXHRpZihkYXRhICYmIGRhdGEuaGVhZGVyKSB7XG5cdFx0Zm9yICh2YXIgbiBpbiBkYXRhKSB7XG5cdFx0XHRpZihuICE9IFwiaGVhZGVyXCIgJiYgbiAhPSBcImVyclwiKSB7XG5cblx0XHRcdFx0aWYoZGF0YVtuXS5lcnIgJiYgZGF0YVtuXS5lcnIuc3Q+MCkge1xuXHRcdFx0XHRcdExvZ2dlci5lcnJvcihuK1wiIHdhcyBpbiBlcnJvcjogXCIrZGF0YVtuXS5lcnIubXNnKTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCFkYXRhTW9kZWwpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsPXt9O1xuXG5cdFx0XHRcdC8vIExvZ2dlci5sb2cobik7XG5cdFx0XHRcdGlmKCFkYXRhTW9kZWxbbl0pIHtcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgYWJzb2x1dGUgcmFuZ2UgKi9cblx0XHRcdFx0ZGF0YU1vZGVsW25dLnJhbmdlPWRhdGFbbl0ucmFuZ2U7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS50aW1lUmFuZ2U9ZGF0YVtuXS50aW1lUmFuZ2U7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGxhYmVsICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5sYWJlbD1kYXRhW25dLmxhYmVsO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSB1bml0ICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS51bml0PWRhdGFbbl0udW5pdDtcblxuXHRcdFx0XHQvKiBzdWdnZXN0ZWQgeSBkaXNwbGF5IHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS56b29tUmFuZ2UgPSBbMCwgMTAwXTtcblxuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBpbmRleFJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5Q29uZmlnPXtcblx0XHRcdFx0XHQvKiBjb25mb3J0UmFuZ2U6IGRhdGFbbl0uY29uZm9ydFJhbmdlLCAqL1xuXHRcdFx0XHRcdGluZGV4UmFuZ2U6IGRhdGFbbl0uaW5kZXhSYW5nZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZSA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS50aW1lLCdiNjQnLDgpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0uZGF0YSA9IChkYXRhW25dLmRhdGE/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmRhdGEsJ2I2NCcsNCk6KGRhdGFbbl0uYXZnP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5hdmcuZCwnYjY0Jyw0KTpudWxsKSk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5SW5kZXggPSAoZGF0YVtuXS5kYXRhP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5pbmRleCwnYjY0Jyw0KTooZGF0YVtuXS5hdmc/dGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpOm51bGwpKTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnJvYm90SWQgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ucm9ib3RJZCwnYjY0Jyw0KTtcblx0XHRcdFx0aWYoZGF0YU1vZGVsW25dLnJvYm90SWQpIHtcblx0XHRcdFx0XHQvKiogZGljbyByb2JvdElkIC0+IHJvYm90TmFtZSAqKi9cblx0XHRcdFx0XHR2YXIgZGljb1JvYm90ID0ge307XG5cdFx0XHRcdFx0ZGF0YS5oZWFkZXIucm9ib3RzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcblx0XHRcdFx0XHRcdGRpY29Sb2JvdFtlbC5pZF09ZWwubmFtZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ucm9ib3RJZCA9IGRhdGFNb2RlbFtuXS5yb2JvdElkLm1hcChmdW5jdGlvbihlbCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGRpY29Sb2JvdFtlbF07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucGxhY2VJZCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5wbGFjZUlkLCdiNjQnLDQpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IG51bGw7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS55ID0gbnVsbDtcblxuXHRcdFx0XHRpZihkYXRhW25dLmF2Zylcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uYXZnID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmF2Zy5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5taW4pXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLm1pbiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5taW4uaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ubWF4KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5tYXggPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWF4LmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLnN0ZGRldilcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0uc3RkZGV2ID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnN0ZGRldi5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5zdGRkZXYpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnN0ZGRldiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ueClcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ueCA9IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS54LCdiNjQnLDQpO1xuXHRcdFx0XHRpZihkYXRhW25dLnkpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnkgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ueSwnYjY0Jyw0KTtcblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIGN1cnJlbnQgcXVhbGl0eSA6IHsnYidhZCwgJ20nZWRpdW0sICdnJ29vZH1cblx0XHRcdFx0ICogZXZvbHV0aW9uIDogeyd1J3AsICdkJ293biwgJ3MndGFibGV9XG5cdFx0XHRcdCAqIGV2b2x1dGlvbiBxdWFsaXR5IDogeydiJ2V0dGVyLCAndydvcnNlLCAncydhbWV9XG5cdFx0XHRcdCAqL1xuXHRcdFx0XHQvLy8gVE9ET1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udHJlbmQgPSAnbXNzJztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSB7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTm8gRGF0YSB0byByZWFkIG9yIGhlYWRlciBpcyBtaXNzaW5nICFcIik7XG5cdH1cblx0LyoqIGxpc3Qgcm9ib3RzICoqL1xuLy9cdGRhdGFNb2RlbC5yb2JvdHMgPSBbe25hbWU6ICdEMlIyJywgaWQ6MX1dO1xuXHR0aGlzLmRhdGFNb2RlbD1kYXRhTW9kZWw7XG5cdHJldHVybiBkYXRhTW9kZWw7XG59O1xuXG5cblxuXG5cbi8qKiBjcmVhdGUgSUVRIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLklFUSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgSUVRKHRoaXMpO1xufTtcbiIsIkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xuXG5mdW5jdGlvbiBMT0cobXNnKXtcblx0Ly9jb25zb2xlLmxvZyhtc2cpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIG1hcCB7U3RyaW5nfSBtYXAncyBuYW1lXG4gKi9cbmZ1bmN0aW9uIE1hcHMocGVlcklkcykge1xuXG5cblx0dGhpcy5fcGVlcklkcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocGVlcklkcykpO1xuXHR0aGlzLl9zdWJJZHMgPSB7fTsgLy8gbGlzdCBvZiBzdWJzY3JpcHRpb24gSWQgKGZvciB1bnN1YnNjcmlwdGlvbiBwdXJwb3NlKSBlLmcge3BlZXJJZDA6IHN1YklkMCwgLi4ufVxuXG5cdC8vIGxpc3Qgb2YgcmVnaXN0ZXJlZCBwbGFjZSBieSBEaXlhXG5cdHRoaXMuX2RpeWFzID0ge307XG5cblx0Ly8gZ2V0IGEgbGlzdCBvZiBEaXlhIGZyb20gc2VsZWN0b3IgYW5kIHNvcnQgaXRcblx0dGhpcy5saXN0RGl5YSA9IHRoaXMuX3BlZXJJZHM7XG59XG5pbmhlcml0cyhNYXBzLCBFdmVudEVtaXR0ZXIpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLyBTdGF0aWMgZnVuY3Rpb25zIC8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4gKiBzdGF0aWMgZnVuY3Rpb24sIGdldCBjdXJyZW50IHBsYWNlIGZyb20gZGl5YW5vZGVcbiAqXG4gKiBAcGFyYW0gc2VsZWN0b3Ige1JlZ0V4cC9TdHJpbmcvQXJyYXk8U3RyaW5nPn0gc2VsZWN0b3Igb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKiBAcGFyYW0gbWFwIHtTdHJpbmd9IG1hcCdzIG5hbWVcbiAqIEBwYXJhbSBmdW5jIHtmdW5jdGlvbigpfSBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIHJldHVybiBwZWVySWQsIGVycm9yIGFuZCBkYXRhICh7IG1hcElkLCBsYWJlbCwgbmV1cm9uSWQsICB4LCB5fSlcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5nZXRDdXJyZW50UGxhY2UgPSBmdW5jdGlvbiggcGVlcklkLCBmdW5jKSB7XG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdGZ1bmM6ICdHZXRDdXJyZW50UGxhY2UnLFxuXHRcdG9iajogWyBwZWVySWQgXVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdGZ1bmMocGVlcklkLCBlcnIsIGRhdGEpO1xuXHR9KTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vXG4vLy8vIEludGVybmFsIGZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy9cblxuLyoqXG4gKiByb3VuZCBmbG9hdCB0byBzaXggZGVjaW1hbHMgdG8gY29tcGFyZSwgYXMgdGhlIG51bWJlciBpbiBqcyBpcyBlbmNvZGVkIGluXG4gKiBJRUVFIDc1NCBzdGFuZGFyZCB+IGFyb3VuZCAxNiBkZWNpbWFsIGRpZ2l0cyBwcmVjaXNpb24sIHdlIGxpbWl0IHRvIDYgZm9yXG4gKiBlYXNpZXIgY29tcGFyaXNpb24gYW5kIGVycm9yIGR1ZSB0byBhcml0aG1ldGljIG9wZXJhdGlvblxuICovXG5NYXBzLnByb3RvdHlwZS5fcm91bmQgPSBmdW5jdGlvbiAodmFsKSB7XG5cdC8vIHJvdWRpbmcgdG8gc2l4IGRlY2ltYWxzXG5cdHJldHVybiBNYXRoLnJvdW5kKHBhcnNlRmxvYXQodmFsKSAqIDEwMDAwMDApIC8gMTAwMDAwMDtcbn07XG5cbi8qKlxuICogY2hlY2sgZXF1YWwgd2l0aCByb3VuZGluZ1xuICovXG5NYXBzLnByb3RvdHlwZS5faXNGbG9hdEVxdWFsID0gZnVuY3Rpb24gKHZhbDEsIHZhbDIpIHtcblx0Ly8gcm91ZGluZyB0byB0d28gZGVjaW1hbHNcblx0cmV0dXJuIHRoaXMuX3JvdW5kKHZhbDEpID09PSB0aGlzLl9yb3VuZCh2YWwyKTtcbn07XG5cbi8qKlxuICogY2hlY2sgaWYgbWFwIGlzIG1vZGlmaWVkIGJ5IGNvbXBhcmUgd2l0aCBpbnRlcm5hbCBsaXN0XG4gKi9cbk1hcHMucHJvdG90eXBlLm1hcElzTW9kaWZpZWQgPSBmdW5jdGlvbihwZWVySWQsIG1hcF9pbmZvKSB7XG5cdC8vIGRvdWJsZSBjaGVja1xuXHRtYXBfaW5mby5zY2FsZSA9IEFycmF5LmlzQXJyYXkobWFwX2luZm8uc2NhbGUpID8gbWFwX2luZm8uc2NhbGVbMF0gOiBtYXBfaW5mby5zY2FsZVxuXG5cdC8vIHVnbHkgY29kZSBidXQgcXVpY2sgY29tcGFyZSB0byBsb29wXG5cdHJldHVybiAhKHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBhdGguc2NhbGUsIG1hcF9pbmZvLnNjYWxlKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnJvdGF0ZSwgbWFwX2luZm8ucm90YXRlKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnRyYW5zbGF0ZVswXSwgbWFwX2luZm8udHJhbnNsYXRlWzBdKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnRyYW5zbGF0ZVsxXSwgbWFwX2luZm8udHJhbnNsYXRlWzFdKSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnJhdGlvLCBtYXBfaW5mby5yYXRpbykpO1xufVxuXG4vKipcbiAqIGNoZWNrIGlmIHBsYWNlIGlzIG1vZGlmaWVkIGJ5IGNvbXBhcmUgd2l0aCBpbnRlcm5hbCBsaXN0XG4gKi9cbk1hcHMucHJvdG90eXBlLnBsYWNlSXNNb2RpZmllZCA9IGZ1bmN0aW9uKHBlZXJJZCwgcGxhY2VfaW5mbykge1xuXHQvLyB1Z2x5IGNvZGUgYnV0IHF1aWNrIGNvbXBhcmUgdG8gbG9vcFxuXHRyZXR1cm4gISh0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wbGFjZXNbcGxhY2VfaW5mby5pZF0ueCwgcGxhY2VfaW5mby54KSAmJlxuXHRcdFx0XHR0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wbGFjZXNbcGxhY2VfaW5mby5pZF0ueSwgcGxhY2VfaW5mby55KSk7XG59XG5cbi8vIC8qKlxuLy8gICogYWRkIGEgRGl5YSB3aGVuIHNlbGVjdG9yIGNoYW5nZWQgYW5kIGhhZCBuZXcgRGl5YVxuLy8gICpcbi8vICAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuLy8gICogQHBhcmFtIGNvbG9yIHtkM19yZ2J9IGQzIGNvbG9yXG4vLyAgKi9cbi8vIE1hcHMucHJvdG90eXBlLmFkZFBlZXIgPSBmdW5jdGlvbihwZWVySWQpIHtcbi8vIFx0dGhpcy5fZGl5YXNbcGVlcklkXSA9IHtcbi8vIFx0XHRtYXBJZDogbnVsbCxcbi8vIFx0XHRwYXRoOiBudWxsLCAvLyB7dHJhbnNsYXRlOiBbXSwgc2NhbGU6IG51bGwsIHJvdGF0ZTogbnVsbH0sXG4vLyBcdFx0cGxhY2VzOiB7fSxcbi8vIFx0XHRtYXBJc01vZGlmaWVkOiBmYWxzZSxcbi8vIFx0fTtcbi8vIH1cblxuLyoqXG4gKiByZW1vdmUgYSBEaXlhIHdoZW4gdGhlcmUgaXMgYSBwcm9ibGVtIGluIGxpc3RlbiBtYXAgKHN1YnNjcmlwdGlvbilcbiAqXG4gKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbiAqL1xuTWFwcy5wcm90b3R5cGUucmVtb3ZlUGVlciA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHRpZiAodGhpcy5fZGl5YXNbcGVlcklkXSkge1xuXHRcdC8vIHJlbW92ZVxuXHRcdGRlbGV0ZSB0aGlzLl9kaXlhc1twZWVySWRdO1xuXHRcdHRoaXMuZW1pdChcInBlZXItdW5zdWJzY3JpYmVkXCIsIHBlZXJJZCk7XG5cdH1cblxuXHQvLyBuZWNjZXNzYXJ5PyBpZiBkaXlhbm9kZSByZWNvbm5lY3Q/XG5cdGlmICh0aGlzLl9zdWJJZHNbcGVlcklkXSAhPT0gbnVsbCAmJiAhaXNOYU4odGhpcy5fc3ViSWRzW3BlZXJJZF0pKSB7XG5cdFx0Ly8gZXhpc3RlZCBzdWJzY3JpcHRpb24gPz9cblx0XHQvLyB1bnN1YnNjcmliZVxuXHRcdGQxKHBlZXJJZCkudW5zdWJzY3JpYmUodGhpcy5fc3ViSWRzKTtcblx0XHRkZWxldGUgdGhpcy5fc3ViSWRzW3BlZXJJZF07XG5cdH1cbn07XG5cbi8qKlxuICogY29ubmVjdCB0byBzZXJ2aWNlIG1hcFxuICovXG5NYXBzLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvLyBvcHRpb25zIGZvciBzdWJzY3JpcHRpb25cblx0dmFyIG9wdGlvbnMgPSB7XG5cdFx0YXV0bzogdHJ1ZSwgLy8gYXV0byByZXN1YnNjcmliZT9cblx0XHRzdWJJZHM6IFtdIC8vIGluIGZhY3QsIGl0IGlzIGEgbGlzdCwgYnV0IHRoZSBjb2RlIGluIERpeWFTZWxlY3RvciBjaGVjayBmb3IgYXJyYXlcblx0fTtcblxuXHQvLyBzdWJzY3JpYmUgZm9yIG1hcCBzZXJ2aWNlXG5cdGQxKFwiI3NlbGZcIikuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0ZnVuYzogJ1JvYm90cycsXG5cdFx0b2JqOiB0aGlzLl9wZWVySWRzXG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0aWYgKGVyciB8fCBkYXRhLmVycm9yKSB7XG5cdFx0XHRMT0coXCJNYXBzOiBmYWlsIHRvIGdldCBpbmZvIGZyb20gbWFwLCBlcnJvcjpcIiwgZXJyIHx8IGRhdGEuZXJyb3IsIFwiIVwiKTsgLy8gbW9zdGx5IFBlZXJEaXNjb25uZWN0ZWRcblxuXHRcdFx0Ly8gcmVtb3ZlIHRoYXQgcGVlclxuXHRcdFx0Ly90aGF0LnJlbW92ZVBlZXIocGVlcklkKTsvLy4uLlxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChkYXRhID09IG51bGwpIHJldHVybiA7XG5cblx0XHRwZWVySWQgPSBkYXRhLnBlZXJJZDtcblxuXHRcdGlmKCFwZWVySWQpe1xuXHRcdFx0TE9HKFwiTWFwczogcmVjZWl2ZWQgaW5mbyB3aXRob3V0IGEgcGVlcklkXCIpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZGF0YS5wbGFjZXMpKSB7IC8vIHdpbm5lciwgdGhpcyBpc24ndCAxc3QgbWVzc2FnZVxuXHRcdFx0ZGF0YS5wbGFjZXMgPSBbXTtcblx0XHR9XG5cblx0XHQvLyBkYXRhLnBsYWNlIGlzIGN1cnJlbnQgcGxhY2Vcblx0XHRpZiAoZGF0YS5wbGFjZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRkYXRhLnBsYWNlcy5wdXNoKGRhdGEucGxhY2UpOyAvLyBtYXkgYmUgbnVsbCAuLi5cblx0XHR9XG5cblx0XHR2YXIgbWFwX2luZm8gPSBudWxsLCBwbGFjZXNfaW5mbyA9IFtdO1xuXG5cdFx0aWYoZGF0YS50eXBlID09PSAnTWFwSW5mbycpe1xuXHRcdFx0Ly8gZGF0YSA6IHtpZCwgbmFtZSwgcGxhY2VzLCByb3RhdGUsIHNjYWxlLCB0eCwgdHksIHJhdGlvfVxuXHRcdFx0aWYgKHRoYXQuX2RpeWFzW3BlZXJJZF0gPT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdID0ge1xuXHRcdFx0XHRcdHBhdGg6IHtcblx0XHRcdFx0XHRcdHRyYW5zbGF0ZTogW2RhdGEudHgsIGRhdGEudHldLFxuXHRcdFx0XHRcdFx0c2NhbGU6IGRhdGEuc2NhbGUsXG5cdFx0XHRcdFx0XHRyb3RhdGU6IGRhdGEucm90YXRlLFxuXHRcdFx0XHRcdFx0cmF0aW86IGRhdGEucmF0aW9cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHBsYWNlczoge31cblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICh0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGggPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aCA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC50cmFuc2xhdGUgPSBbZGF0YS50eCwgZGF0YS50eV07XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC5zY2FsZSA9IGRhdGEuc2NhbGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC5yb3RhdGUgPSBkYXRhLnJvdGF0ZTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoLnJhdGlvID0gZGF0YS5yYXRpbztcblx0XHRcdFx0aWYgKHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzID09IG51bGwpIHtcblx0XHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlcyA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRtYXBfaW5mbyA9IHtcblx0XHRcdFx0aWQ6IGRhdGEuaWQsXG5cdFx0XHRcdG5hbWU6IGRhdGEubmFtZSxcblx0XHRcdFx0cm90YXRlOiBkYXRhLnJvdGF0ZSxcblx0XHRcdFx0c2NhbGU6IGRhdGEuc2NhbGUsXG5cdFx0XHRcdHRyYW5zbGF0ZTogW2RhdGEudHgsIGRhdGEudHldLFxuXHRcdFx0XHRyYXRpbzogZGF0YS5yYXRpb1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBzYXZlIGRhdGEgdmFsdWVzXG5cdFx0ZGF0YS5wbGFjZXMubWFwKGZ1bmN0aW9uKHBsYWNlKSB7XG5cdFx0XHRpZiAocGxhY2UpIHsgLy8gbnVsbCBpZiBjdXJyZW50cGxhY2UgaXNuJ3QgaW5pdCBpbiBEaXlhTm9kZVxuXHRcdFx0XHQvLyBwbGFjZSB7IG1hcElkLCBsYWJlbCwgbmV1cm9uSWQsICB4LCB5fVxuXG5cdFx0XHRcdC8vIG5ldXJvbklkIChhbHNvIHBsYWNlICdzIElkKVxuXHRcdFx0XHR2YXIgaWQgPSBwbGFjZS5uZXVyb25JZDtcblxuXHRcdFx0XHQvLyBVcGRhdGUgaW50ZXJuYWwgbGlzdFxuXHRcdFx0XHQvLyBjb252ZXJ0IGZyb20gRGl5YSBwYXJhbWV0ZXIgKDAuLjEga20pIHRvIGRpeWEtbWFwICgwLi4xMDAwMDApXG5cdFx0XHRcdHBsYWNlID0ge1xuXHRcdFx0XHRcdGlkOiBpZCxcblx0XHRcdFx0XHRsYWJlbDogcGxhY2UubGFiZWwsXG5cdFx0XHRcdFx0eDogcGxhY2UueCxcblx0XHRcdFx0XHR5OiBwbGFjZS55LFxuXHRcdFx0XHRcdHQ6IDM2MCAqIHBsYWNlLnRcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAodGhhdC5fZGl5YXNbcGVlcklkXS5wbGFjZXNbaWRdID09IG51bGwpIHsgLy8gbm9uZXhpc3RlbnQgcGxhY2Vcblx0XHRcdFx0XHQvLyBpZiBpcyBudWxsIG9yIHVuZGVmaW5lZFxuXHRcdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW2lkXSA9IHBsYWNlOyAvLyBzYXZlIGl0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwbGFjZXNfaW5mby5wdXNoKE9iamVjdC5jcmVhdGUocGxhY2UpKTsvLyBjcmVhdGUgYSBjb3B5IHRvIHNlbmQgdG8gdXNlclxuXG5cdFx0XHRcdC8vIHNhdmUgYmFzZSBwbGFjZSAoZmlyc3Qga25vd24gcGxhY2UsIGFsc28gZmlyc3QgZWxlbWVudCBvZiBwbGFjZXMgYXJyYXkpXG5cdFx0XHRcdC8vIHVzZWxlc3MgYXQgdGhlIG1vbWVudFxuXHRcdFx0XHQvLyBpZiAoIXRoYXQuX2RpeWFzW3BlZXJJZF0uYmFzZVBsYWNlKSB0aGF0Ll9kaXlhc1twZWVySWRdLmJhc2VQbGFjZSA9IHBsYWNlO1xuXHRcdFx0fSBlbHNlIHsgLy8gY3VycmVudCBwbGFjZSBpcyBudWxsXG5cdFx0XHRcdHBsYWNlc19pbmZvLnB1c2gobnVsbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAocGxhY2VzX2luZm8ubGVuZ3RoID09PSAwKSBwbGFjZXNfaW5mbyA9IG51bGw7XG5cblx0XHR0aGF0LmVtaXQoXCJwZWVyLXN1YnNjcmliZWRcIixwZWVySWQsIG1hcF9pbmZvLCBwbGFjZXNfaW5mbyk7XG5cdH0sIG9wdGlvbnMpO1xuXG5cdGZvciAodmFyIHBlZXJJZCBpbiBvcHRpb25zLnN1Yklkcykge1xuXHRcdGlmICh0aGlzLl9zdWJJZHNbcGVlcklkXSAhPT0gbnVsbCAmJiAhaXNOYU4odGhpcy5fc3ViSWRzW3BlZXJJZF0pKSB7XG5cdFx0XHQvLyBleGlzdGVkIHN1YnNjcmlwdGlvbiA/P1xuXHRcdFx0ZDEoXCIjc2VsZlwiKS51bnN1YnNjcmliZSh0aGlzLl9zdWJJZHMpXG5cdFx0XHRkZWxldGUgdGhpcy5fc3ViSWRzW3BlZXJJZF07XG5cdFx0XHRMT0coXCJNYXBzOiBidWc6IGV4aXN0ZWQgc3Vic2NyaXB0aW9uID8/XCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHNhdmUgc3ViSWQgZm9yIGxhdGVyIHVuc3Vic2NyaXB0aW9uXG5cdFx0XHR0aGlzLl9zdWJJZHNbcGVlcklkXSA9IG9wdGlvbnMuc3ViSWRzW3BlZXJJZF07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogZGlzY29ubmVjdCBmcm9tIHNlcnZpY2UgbWFwLCBmcmVlIGV2ZXJ5dGhpbmcgc28gaXQgaXMgc2FmZSB0byBnYXJiYWdlIGNvbGxlY3RlIHRoaXMgc2VydmljZVxuICovXG5NYXBzLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0ZDEoXCIjc2VsZlwiKS51bnN1YnNjcmliZSh0aGlzLl9zdWJJZHMpO1xuXHRmb3IodmFyIHBlZXJJZCBpbiB0aGlzLl9kaXlhcyl7XG5cdFx0dGhhdC5lbWl0KFwicGVlci11bnN1YnNjcmliZWRcIiwgcGVlcklkKTtcblx0fVxuXHR0aGlzLl9kaXlhcyA9IHt9Oy8vIGRlbGV0ZSA/XG5cdHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG59XG5cbi8qKlxuICogc2F2ZSBtYXBcbiAqXG4gKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbiAqIEBwYXJhbSBtYXBfaW5mbyB7T2JqZWN0fSAoe3JvdGF0ZSwgc2NhbGUsIHRyYW5zbGF0ZX0pXG4gKiBAcGFyYW0gY2Ige0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIGVycm9yIGFzIGFyZ3VtZW50XG4gKi9cbk1hcHMucHJvdG90eXBlLnNhdmVNYXAgPSBmdW5jdGlvbiAodGFyZ2V0UGVlcklkLCBtYXBfaW5mbywgY2IpIHtcblx0dmFyIF9tYXBfaW5mbyA9IE9iamVjdC5jcmVhdGUobWFwX2luZm8pOyAvLyBjcmVhdGUgYSBkdXBsaWNhdGUgb2YgbWFwX2luZm9cblx0dmFyIHRoYXQgPSB0aGlzO1xuXHQvLyBzYXZlIG1hcCdzIGluZm9cblx0X21hcF9pbmZvLnNjYWxlID0gQXJyYXkuaXNBcnJheShfbWFwX2luZm8uc2NhbGUpID8gX21hcF9pbmZvLnNjYWxlWzBdIDogX21hcF9pbmZvLnNjYWxlXG5cblx0aWYgKHRoaXMubWFwSXNNb2RpZmllZCh0YXJnZXRQZWVySWQsIF9tYXBfaW5mbykpIHtcblx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdFx0ZnVuYzogJ1VwZGF0ZU1hcCcsXG5cdFx0XHRvYmo6IFsgdGFyZ2V0UGVlcklkIF0sXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHNjYWxlOiBfbWFwX2luZm8uc2NhbGUsXG5cdFx0XHRcdHR4OiBfbWFwX2luZm8udHJhbnNsYXRlWzBdLFxuXHRcdFx0XHR0eTogX21hcF9pbmZvLnRyYW5zbGF0ZVsxXSxcblx0XHRcdFx0cm90YXRlOiBfbWFwX2luZm8ucm90YXRlLFxuXHRcdFx0XHRyYXRpbzogX21hcF9pbmZvLnJhdGlvXG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBhdGguc2NhbGUgPSBfbWFwX2luZm8uc2NhbGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGF0aC5yb3RhdGUgPSBfbWFwX2luZm8ucm90YXRlO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBhdGgudHJhbnNsYXRlWzBdID0gX21hcF9pbmZvLnRyYW5zbGF0ZVswXTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbdGFyZ2V0UGVlcklkXS5wYXRoLnRyYW5zbGF0ZVsxXSA9IF9tYXBfaW5mby50cmFuc2xhdGVbMV07XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2IpIGNiKGVycik7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGNiKSBjYihuZXcgRXJyb3IoXCJObyBjaGFuZ2UgdG8gbWFwICdcIiArIHRoaXMuX21hcCArIFwiJyFcIikpO1xuXHR9XG59XG5cbi8qKlxuICogdXBkYXRlIGV2ZXJ5IHBsYWNlc1xuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIHBsYWNlX2luZm8ge09iamVjdH0gKHsgaWQsIHgsIHl9KVxuICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCBlcnJvciBhcyBhcmd1bWVudFxuICovXG5NYXBzLnByb3RvdHlwZS5zYXZlUGxhY2UgPSBmdW5jdGlvbiAodGFyZ2V0UGVlcklkLCBwbGFjZV9pbmZvLCBjYikge1xuXHQvLyBzYXZlIG1hcCdzIGluZm9cblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgZXJyb3IgPSBcIlwiO1xuXG5cdHZhciBfcGxhY2VfaW5mbyA9IE9iamVjdC5jcmVhdGUocGxhY2VfaW5mbyk7XG5cblx0Ly8gc2F2ZSBwbGFjZVxuXHRpZiAodGhpcy5wbGFjZUlzTW9kaWZpZWQodGFyZ2V0UGVlcklkLCBfcGxhY2VfaW5mbykpIHtcblx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdFx0ZnVuYzogJ1VwZGF0ZVBsYWNlJyxcblx0XHRcdG9iajogWyB0YXJnZXRQZWVySWQgXSxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0bmV1cm9uSWQ6IF9wbGFjZV9pbmZvLmlkLFxuXHRcdFx0XHR4OiBfcGxhY2VfaW5mby54LFxuXHRcdFx0XHR5OiBfcGxhY2VfaW5mby55XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBsYWNlc1tfcGxhY2VfaW5mby5pZF0ueCA9IF9wbGFjZV9pbmZvLng7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGxhY2VzW19wbGFjZV9pbmZvLmlkXS55ID0gX3BsYWNlX2luZm8ueTtcblx0XHRcdH1cblx0XHRcdGlmIChjYikgY2IoZXJyKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRpZiAoY2IpIGNiKG5ldyBFcnJvcihcIk5vIGNoYW5nZSB0byBwbGFjZSBuIFwiICsgX3BsYWNlX2luZm8uaWQgKyBcIiFcIikpO1xuXHR9XG59XG5cbi8qKlxuICogZGVsZXRlIGV2ZXJ5IHNhdmVkIHBsYWNlcyBvZiBEaXlhIChjaG9vc2VuIGluIHNlbGVjdG9yKVxuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCBlcnJvciBhcyBhcmd1bWVudFxuICovXG5NYXBzLnByb3RvdHlwZS5jbGVhclBsYWNlcyA9IGZ1bmN0aW9uKHRhcmdldFBlZXJJZCwgY2IpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdGQxKFwiI3NlbGZcIikucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdGZ1bmM6ICdDbGVhck1hcCcsXG5cdFx0b2JqOiBbIHRhcmdldFBlZXJJZCBdXG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHQvLyBkZWxldGUgZnJvbSBpbnRlcm5hbCBsaXN0XG5cdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBsYWNlcyA9IHt9O1xuXHRcdH1cblx0XHRpZiAoY2IpIGNiKGVycik7XG5cdH0pO1xufVxuXG4vLyBleHBvcnQgaXQgYXMgbW9kdWxlIG9mIERpeWFTZWxlY3RvclxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5tYXBzID0gZnVuY3Rpb24ocGVlcklkcykge1xuXHR2YXIgbWFwcyA9IG5ldyBNYXBzKHBlZXJJZHMpO1xuXG5cdHJldHVybiBtYXBzO1xufVxuIiwidmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciBkMSA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpO1xudmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cblxuXG5kMS5rbm93blBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBkMShcIiNzZWxmXCIpLmtub3duUGVlcnMoKTtcbn07XG5kMS5rcCA9IGQxLmtub3duUGVlcnM7XG5cblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmtub3duUGVlcnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdHRoaXMucmVxdWVzdCh7c2VydmljZTogJ21lc2hOZXR3b3JrJyxmdW5jOiAnTGlzdEtub3duUGVlcnMnfSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdHZhciBwZWVycyA9IFtdO1xuXHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdH0pO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuXG5cbmQxLmxpc3Rlbk1lc2hOZXR3b3JrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0cmV0dXJuIGQxKC8uKi8pLnN1YnNjcmliZSh7IHNlcnZpY2U6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdNZXNoTmV0d29yaycgfSwgY2FsbGJhY2ssIHthdXRvOiB0cnVlfSk7XG59O1xuIiwiLyogbWF5YS1jbGllbnRcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKiAgMy4wIG9mIHRoZSBMaWNlbnNlIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cblxuXG5mdW5jdGlvbiBNZXNzYWdlKHNlcnZpY2UsIGZ1bmMsIG9iaiwgcGVybWFuZW50KXtcblxuXHR0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuXHR0aGlzLmZ1bmMgPSBmdW5jO1xuXHR0aGlzLm9iaiA9IG9iajtcblx0XG5cdHRoaXMucGVybWFuZW50ID0gcGVybWFuZW50OyAvL0lmIHRoaXMgZmxhZyBpcyBvbiwgdGhlIGNvbW1hbmQgd2lsbCBzdGF5IG9uIHRoZSBjYWxsYmFjayBsaXN0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG59XG5cbk1lc3NhZ2UuYnVpbGRTaWduYXR1cmUgPSBmdW5jdGlvbihtc2cpe1xuXHRyZXR1cm4gbXNnLnNlcnZpY2UrJy4nK21zZy5mdW5jKycuJyttc2cub2JqO1xufVxuXG5cbk1lc3NhZ2UucHJvdG90eXBlLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnNlcnZpY2UrJy4nK3RoaXMuZnVuYysnLicrdGhpcy5vYmo7XG59XG5cbk1lc3NhZ2UucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbihkYXRhKXtcblx0cmV0dXJuIHtcblx0XHRzZXJ2aWNlOiB0aGlzLnNlcnZpY2UsXG5cdFx0ZnVuYzogdGhpcy5mdW5jLFxuXHRcdG9iajogdGhpcy5vYmosXG5cdFx0ZGF0YTogZGF0YVxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZTtcbiIsInZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgZDEgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKTtcbnZhciBpc0Jyb3dzZXIgPSAhKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKTtcbmlmKCFpc0Jyb3dzZXIpIHsgdmFyIFEgPSByZXF1aXJlKCdxJyk7IH1cbmVsc2UgeyB2YXIgUSA9IHdpbmRvdy5ROyB9XG5cbmlmKHR5cGVvZiBJTkZPID09PSAndW5kZWZpbmVkJykgSU5GTyA9IGZ1bmN0aW9uKHMpIHsgY29uc29sZS5sb2cocyk7fVxuaWYodHlwZW9mIE9LID09PSAndW5kZWZpbmVkJykgT0sgPSBmdW5jdGlvbihzKSB7IGNvbnNvbGUubG9nKHMpO31cblxuXG5cbi8qKlxuKiBJbnN0YWxscyBhIG5ldyBEaXlhTm9kZSBkZXZpY2UgKHdpdGggYWRkcmVzcyAnaXAnKSBpbnRvIGFuIGV4aXN0aW5nIG5ldHdvcmssIGJ5XG4qIGNvbnRhY3RpbmcgYW4gZXhpc3RpbmcgRGl5YU5vZGUgZGV2aWNlIHdpdGggYWRkcmVzcyAnYm9vdHN0cmFwX2lwJyA6XG4qICAgMSkgQ29udGFjdCB0aGUgbmV3IG5vZGUgdG8gZ2V0IGl0cyBwdWJsaWMga2V5XG4qICAgMikgQWRkIHRoaXMgcHVibGljIGtleSB0byB0aGUgZXhpc3Rpbmcgbm9kZSBUcnVzdGVkUGVlcnMgbGlzdFxuKiAgIDMpIEFkZCB0aGUgZXhpc3Rpbmcgbm9kZSdzIHB1YmxpYyBrZXkgdG8gdGhlIG5ldyBub2RlJ3MgVHJ1c3RlZFBlZXJzIGxpc3RcbiogICA0KSBBc2sgdGhlIG5ldyBub2RlIHRvIGpvaW4gdGhlIG5ldHdvcmsgYnkgY2FsbGluZyBAc2Vle2QxKCkuam9pbigpfVxuKlxuKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgdGhlIGdpdmVuIHVzZXIgdG8gaGF2ZSByb290IHJvbGUgb24gYm90aCBub2Rlc1xuKlxuKiBAcGFyYW0gaXAgOiB0aGUgSVAgYWRkcmVzcyBvZiB0aGUgbmV3IGRldmljZVxuKiBAcGFyYW0gdXNlciA6IGEgdXNlcm5hbWUgd2l0aCByb290IHJvbGUgb24gdGhlIG5ldyBkZXZpY2VcbiogQHBhcmFtIHBhc3N3b3JkIDogdGhlIHBhc3N3b3JkIGZvciAndXNlcidcbiogQHBhcmFtIGJvb3RzdHJhcF9pcCA6IHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBib290c3RyYXAgZGV2aWNlXG4qIEBwYXJhbSBib290c3RyYXBfdXNlciA6IGEgdXNlciBpZGVudGlmaWVyIHdpdGggcm9vdCByb2xlIG9uIHRoZSBib29zdHJhcCBkZXZpY2VcbiogQHBhcmFtIGJvb3RzdHJhcF9wYXNzd29yZCA6IHRoZSBwYXNzd29yZCBmb3IgJ2Jvb3RzdHJhcF91c2VyJ1xuKiBAcGFyYW0gYm9vdHN0cmFwX25ldCA6IHRoZSBJUCBhZGRyZXNzIHdoZXJlIHRoZSBuZXcgZGV2aWNlIHdpbGwgY29ubmVjdCB0byB0aGUgYm9vc3RyYXAgb25lXG4qIEBwYXJhbSBjYWxsYmFjayA6IG9mIHRoZSBmb3JtIGNhbGxiYWNrKG5ld19wZWVyX25hbWUsYm9vdHN0cmFwX3BlZXJfbmFtZSwgZXJyLCBkYXRhKVxuKi9cbmQxLmluc3RhbGxOb2RlRXh0ID0gZnVuY3Rpb24oaXAsIHVzZXIsIHBhc3N3b3JkLCBib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQsIGJvb3RzdHJhcF9uZXQsIGNhbGxiYWNrKSB7XG5cdGlmKHR5cGVvZiBpcCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBpcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGJvb3RzdHJhcF9pcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX25ldCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBib290c3RyYXBfbmV0IHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYm9vdHN0cmFwX2lwLmluZGV4T2YoXCJ3czovL1wiKSAhPT0gMCAmJiBib290c3RyYXBfaXAuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfaXAgPSBcIndzczovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHRcdGVsc2UgYm9vdHN0cmFwX2lwID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHR9XG5cdGlmKGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfbmV0ID0gXCJ3c3M6Ly9cIiArIGJvb3RzdHJhcF9uZXQ7XG5cdFx0ZWxzZSBib290c3RyYXBfbmV0ID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX25ldDtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKSB7XG5cdFx0ZDEoXCIjc2VsZlwiKS5qb2luKGJvb3RzdHJhcF9uZXQsIHRydWUsIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSl7XG5cdFx0XHRpZighZXJyKSBPSyhcIkpPSU5FRCAhISFcIik7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSk7XG5cdFx0fSk7XG5cdH1cblxuXHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpe1xuXHRcdGQxKFwiI3NlbGZcIikuZ2l2ZVB1YmxpY0tleShmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycj09PSdTZXJ2aWNlTm90Rm91bmQnKSB7XG5cdFx0XHRcdElORk8oXCJQZWVyIEF1dGhlbnRpY2F0aW9uIGRpc2FibGVkIC4uLiBkaXJlY3RseSBqb2luaW5nXCIpO1xuXHRcdFx0XHRqb2luKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZXJyKSByZXR1cm4gY2FsbGJhY2socGVlciwgbnVsbCwgZXJyLCBudWxsKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRJTkZPKFwiQWRkIHRydXN0ZWQgcGVlciBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIHRvIFwiICsgYm9vdHN0cmFwX2lwICsgXCIgd2l0aCBwdWJsaWMga2V5IFwiICsgZGF0YS5wdWJsaWNfa2V5LnNsaWNlKDAsMjApKTtcblx0XHRcdFx0ZDEuY29ubmVjdEFzVXNlcihib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKHBlZXIsIGRhdGEucHVibGljX2tleSwgZnVuY3Rpb24oYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSkge1xuXG5cdFx0XHRcdFx0XHRpZihlcnIpIHJldHVybiBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBudWxsKTtcblx0XHRcdFx0XHRcdGlmKGRhdGEuYWxyZWFkeVRydXN0ZWQpIElORk8ocGVlciArIFwiIGFscmVhZHkgdHJ1c3RlZCBieSBcIiArIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdGVsc2UgSU5GTyhib290c3RyYXBfcGVlciArIFwiKGlwPVwiKyBib290c3RyYXBfaXAgK1wiKSBhZGRlZCBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXG5cdFx0XHRcdFx0XHRJTkZPKFwiSW4gcmV0dXJuLCBhZGQgXCIgKyBib290c3RyYXBfcGVlciArIFwiIHRvIFwiICsgcGVlciArIFwiIGFzIGEgVHJ1c3RlZCBQZWVyIHdpdGggcHVibGljIGtleSBcIiArIGRhdGEucHVibGljX2tleS5zbGljZSgwLDIwKSk7XG5cdFx0XHRcdFx0XHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKGJvb3RzdHJhcF9wZWVyLCBkYXRhLnB1YmxpY19rZXksIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKGVycikgY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgbnVsbCk7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZihkYXRhLmFscmVhZHlUcnVzdGVkKSBJTkZPKGJvb3RzdHJhcF9wZWVyICsgXCIgYWxyZWFkeSB0cnVzdGVkIGJ5IFwiICsgcGVlcik7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBJTkZPKHBlZXIgKyBcIihpcD1cIisgaXAgK1wiKSBhZGRlZCBcIiArIGJvb3RzdHJhcF9wZWVyICsgXCIoaXA9XCIrIGJvb3RzdHJhcF9pcCArXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vIE9uY2UgS2V5cyBoYXZlIGJlZW4gZXhjaGFuZ2VkIGFzayB0byBqb2luIHRoZSBuZXR3b3JrXG5cdFx0XHRcdFx0XHRcdFx0T0soXCJLRVlTIE9LICEgTm93LCBsZXQgXCIrcGVlcitcIihpcD1cIitpcCtcIikgam9pbiB0aGUgbmV0d29yayB2aWEgXCIrYm9vdHN0cmFwX3BlZXIrXCIoaXA9XCIrYm9vdHN0cmFwX25ldCtcIikgLi4uXCIpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5cbi8qKiBTaG9ydCB2ZXJzaW9uIG9mIEBzZWV7ZDEuaW5zdGFsbE5vZGVFeHR9ICovXG5kMS5pbnN0YWxsTm9kZSA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spIHtcblx0XHR2YXIgaXAgPSBkMS5hZGRyKCk7XG5cdFx0dmFyIHVzZXIgPSBkMS51c2VyKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gZDEucGFzcygpO1xuXHRcdHZhciBib290c3RyYXBfdXNlciA9IHVzZXI7XG5cdFx0dmFyIGJvb3RzdHJhcF9wYXNzd29yZCA9IHBhc3N3b3JkO1xuXHRcdHJldHVybiBkMS5pbnN0YWxsTm9kZUV4dChpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spO1xufVxuXG5cblxuXG4vKipcbiAqIE1ha2UgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBqb2luIGFuIGV4aXN0aW5nIERpeWFOb2RlcyBNZXNoIE5ldHdvcmsgYnkgY29udGFjdGluZ1xuICogdGhlIGdpdmVuIGJvb3RzdHJhcCBwZWVycy5cbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGNvbnRhY3QgdG8gam9pbiB0aGUgTmV0d29ya1xuICogQHBhcmFtIGJQZXJtYW5lbnQgOiBpZiB0cnVlLCBwZXJtYW5lbnRseSBhZGQgdGhlIGJvb3RzdHJhcCBwZWVycyBhcyBhdXRvbWF0aWMgYm9vdHN0cmFwIHBlZXJzIGZvciB0aGUgc2VsZWN0ZWQgbm9kZXMuXG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbihib290c3RyYXBfaXBzLCBiUGVybWFuZW50LCBjYWxsYmFjayl7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXBzID09PSAnc3RyaW5nJykgYm9vdHN0cmFwX2lwcyA9IFsgYm9vdHN0cmFwX2lwcyBdO1xuXHRpZihib290c3RyYXBfaXBzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkgdGhyb3cgXCJqb2luKCkgOiBib290c3RyYXBfaXBzIHNob3VsZCBiZSBhbiBhcnJheSBvZiBwZWVycyBVUklzXCI7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZSA6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdKb2luJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIERpc2Nvbm5lY3QgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBmcm9tIHRoZSBnaXZlbiBib290c3RyYXAgcGVlcnNcbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGxlYXZlXG4gKiBAcGFyYW0gYlBlcm1hbmVudCA6IGlmIHRydWUsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGUgZ2l2ZW4gcGVlcnMgZnJvbSB0aGUgYXV0b21hdGljIGJvb3RzdHJhcCBwZWVycyBsaXN0XG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24oYm9vdHN0cmFwX2lwcywgYlBlcm1hbmVudCwgY2FsbGJhY2spe1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwcyA9PT0gJ3N0cmluZycpIGJvb3RzdHJhcF9pcHMgPSBbIGJvb3RzdHJhcF9pcHMgXTtcblx0aWYoYm9vdHN0cmFwX2lwcy5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHRocm93IFwibGVhdmUoKSA6IGJvb3RzdHJhcF9pcHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHBlZXJzIFVSSXNcIjtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlIDogJ21lc2hOZXR3b3JrJywgZnVuYzogJ0xlYXZlJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIEFzayB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGZvciB0aGVpciBwdWJsaWMga2V5c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdpdmVQdWJsaWNLZXkgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dpdmVQdWJsaWNLZXknLFx0ZGF0YToge30gfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7Y2FsbGJhY2socGVlcklkLGVycixkYXRhKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIEFkZCBhIG5ldyB0cnVzdGVkIHBlZXIgUlNBIHB1YmxpYyBrZXkgdG8gdGhlIHNlbGVjdGVkIERpeWFOb2Rlc1xuICogTk9URSA6IFRoaXMgb3BlcmF0aW9uIHJlcXVpcmVzIHJvb3Qgcm9sZVxuICpcbiAqIEBwYXJhbSBuYW1lIDogdGhlIG5hbWUgb2YgdGhlIG5ldyB0cnVzdGVkIERpeWFOb2RlIHBlZXJcbiAqIEBwYXJhbSBwdWJsaWNfa2V5IDogdGhlIFJTQSBwdWJsaWMga2V5IG9mIHRoZSBuZXcgdHJ1c3RlZCBEaXlhTm9kZSBwZWVyXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYWRkVHJ1c3RlZFBlZXIgPSBmdW5jdGlvbihuYW1lLCBwdWJsaWNfa2V5LCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoeyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FkZFRydXN0ZWRQZWVyJyxcdGRhdGE6IHsgbmFtZTogbmFtZSwgcHVibGljX2tleTogcHVibGljX2tleSB9fSxcblx0XHRmdW5jdGlvbihwZWVySWQsZXJyLGRhdGEpe2NhbGxiYWNrKHBlZXJJZCxlcnIsZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBzZWxlY3RlZCBEaXlhTm9kZXMgdHJ1c3QgdGhlIGdpdmVuIHBlZXJzXG4gKiBAcGFyYW0gcGVlcnMgOiBhbiBhcnJheSBvZiBwZWVyIG5hbWVzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYXJlVHJ1c3RlZCA9IGZ1bmN0aW9uKHBlZXJzLCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FyZVRydXN0ZWQnLFx0ZGF0YTogeyBwZWVyczogcGVlcnMgfSB9LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHR2YXIgYWxsVHJ1c3RlZCA9IGRhdGEudHJ1c3RlZDtcblx0XHRcdGlmKGFsbFRydXN0ZWQpIHsgT0socGVlcnMgKyBcIiBhcmUgdHJ1c3RlZCBieSBcIiArIHBlZXJJZCk7IGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7IH1cblx0XHRcdGVsc2UgeyBFUlIoXCJTb21lIHBlZXJzIGluIFwiICsgcGVlcnMgKyBcIiBhcmUgdW50cnVzdGVkIGJ5IFwiICsgcGVlcklkKTsgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7IH1cblx0XHR9XG5cdCk7XG59O1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5pc1RydXN0ZWQgPSBmdW5jdGlvbihwZWVyLCBjYWxsYmFjaykgeyByZXR1cm4gdGhpcy5hcmVUcnVzdGVkKFtwZWVyXSwgY2FsbGJhY2spOyB9XG5cblxuZDEudHJ1c3RlZFBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0ZDEoXCIjc2VsZlwiKS5yZXF1ZXN0KFxuXHRcdHsgc2VydmljZTogJ3BlZXJBdXRoJyxcdGZ1bmM6ICdHZXRUcnVzdGVkUGVlcnMnIH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0dmFyIHBlZXJzID0gW107XG5cdFx0XHRmb3IodmFyIGk9MDsgaTxkYXRhLnBlZXJzLmxlbmd0aDsgaSsrKSBwZWVycy5wdXNoKGRhdGEucGVlcnNbaV0ubmFtZSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5kMS50cCA9IGQxLnRydXN0ZWRQZWVyczsgLy8gU2hvcnRoYW5kXG5cbmQxLmJsYWNrbGlzdGVkUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRkMShcIiNzZWxmXCIpLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dldEJsYWNrbGlzdGVkUGVlcnMnIH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0dmFyIHBlZXJzID0gW107XG5cdFx0XHRmb3IodmFyIGk9MDsgaTxkYXRhLnBlZXJzLmxlbmd0aDsgaSsrKSBwZWVycy5wdXNoKGRhdGEucGVlcnNbaV0ubmFtZSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5kMS5icCA9IGQxLmJsYWNrbGlzdGVkUGVlcnM7IC8vIFNob3J0aGFuZFxuIiwiRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbnJlcXVpcmUoJ3dlYnJ0Yy1hZGFwdGVyJyk7XG5cbi8qaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpe1xuXHR2YXIgUlRDUGVlckNvbm5lY3Rpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbjtcblx0dmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgfHwgd2luZG93Lm1velJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cud2Via2l0UlRDSWNlQ2FuZGlkYXRlO1xuXHR2YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cubW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy53ZWJraXRSVENTZXNzaW9uRGVzY3JpcHRpb247XG59Ki9cblxuXG5cblxuLy8vLy8vLy8vLy8vL1xuLy8gQ0hBTk5FTCAvL1xuLy8vLy8vLy8vLy8vL1xuXG4vKiogSGFuZGxlcyBhIFJUQyBjaGFubmVsIChkYXRhY2hhbm5lbCBhbmQvb3Igc3RyZWFtKSB0byBhIERpeWFOb2RlIHBlZXJcbiAqICBAcGFyYW0gZG5JZCA6IHRoZSBEaXlhTm9kZSBwZWVySWRcbiAqICBAcGFyYW0gbmFtZSA6IHRoZSBjaGFubmVsJ3MgbmFtZVxuICogIEBwYXJhbSBkYXRhY2hhbm5lbF9jYiA6IGNhbGxiYWNrIGNhbGxlZCB3aGVuIGEgUlRDIGRhdGFjaGFubmVsIGlzIG9wZW4gZm9yIHRoaXMgY2hhbm5lbFxuICogIEBwYXJhbSBzdHJlYW1fY2IgOiBjYWxsYmFjayBjYWxsZWQgd2hlbiBhIFJUQyBzdHJlYW0gaXMgb3BlbiBmb3IgdGhpcyBjaGFubmVsXG4gKi9cbmZ1bmN0aW9uIENoYW5uZWwoZG5JZCwgbmFtZSwgZGF0YWNoYW5uZWxfY2IsIHN0cmVhbV9jYikge1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblx0dGhpcy5uYW1lID0gbmFtZTtcblx0dGhpcy5kbklkID0gZG5JZDtcblxuXHR0aGlzLmZyZXF1ZW5jeSA9IDIwO1xuXG5cdHRoaXMuY2hhbm5lbCA9IHVuZGVmaW5lZDtcblx0dGhpcy5zdHJlYW0gPSB1bmRlZmluZWQ7XG5cdHRoaXMub25kYXRhY2hhbm5lbCA9IGRhdGFjaGFubmVsX2NiO1xuXHR0aGlzLm9uc3RyZWFtID0gc3RyZWFtX2NiO1xuXHR0aGlzLmNsb3NlZCA9IGZhbHNlO1xufVxuaW5oZXJpdHMoQ2hhbm5lbCwgRXZlbnRFbWl0dGVyKTtcblxuLyoqIEJpbmQgYW4gaW5jb21pbmcgUlRDIGRhdGFjaGFubmVsIHRvIHRoaXMgY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuc2V0RGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkYXRhY2hhbm5lbCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5jaGFubmVsID0gZGF0YWNoYW5uZWw7XG5cdHRoaXMuY2hhbm5lbC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcblx0Y29uc29sZS5sb2coXCJzZXQgZGF0YSBjaGFubmVsIDpcIit0aGlzLm5hbWUpO1xuXHRkYXRhY2hhbm5lbC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHQvLyBGaXJzdCBtZXNzYWdlIGNhcnJpZXMgY2hhbm5lbCBkZXNjcmlwdGlvbiBoZWFkZXJcblx0XHR2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhtZXNzYWdlLmRhdGEpO1xuXG5cdFx0dmFyIHR5cGVDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3LmdldFVpbnQ4KDApKTtcblx0XHRpZih0eXBlQ2hhciA9PT0gJ08nKSB0aGF0LnR5cGUgPSAnaW5wdXQnOyAvL1Byb21ldGhlIE91dHB1dCA9IENsaWVudCBJbnB1dFxuXHRcdGVsc2UgaWYodHlwZUNoYXIgPT09ICdJJykgdGhhdC50eXBlID0gJ291dHB1dCc7IC8vUHJvbWV0aGUgSW5wdXQgPSBDbGllbnQgT3V0cHV0XG5cdFx0ZWxzZSB0aHJvdyBcIlVucmVjbm9nbml6ZWQgY2hhbm5lbCB0eXBlIDogXCIgKyB0eXBlQ2hhcjtcblxuXHRcdHZhciBzaXplID0gdmlldy5nZXRJbnQzMigxLHRydWUpO1xuXHRcdGlmKCFzaXplKSB0aHJvdyBcIldyb25nIGRhdGFjaGFubmVsIG1lc3NhZ2Ugc2l6ZVwiO1xuXHRcdHRoYXQuc2l6ZSA9IHNpemU7XG5cdFx0dGhhdC5fYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblxuXHRcdC8vIFN1YnNlcXVlbnQgbWVzc2FnZXMgYXJlIGZvcndhcmRlZCB0byBhcHByb3ByaWF0ZSBoYW5kbGVyc1xuXHRcdGRhdGFjaGFubmVsLm9ubWVzc2FnZSA9IHRoYXQuX29uTWVzc2FnZS5iaW5kKHRoYXQpO1xuXHRcdGRhdGFjaGFubmVsLm9uY2xvc2UgPSB0aGF0Ll9vbkNsb3NlLmJpbmQodGhhdCk7XG5cblx0XHRpZih0eXBlb2YgdGhhdC5vbmRhdGFjaGFubmVsID09PSAnZnVuY3Rpb24nKSB0aGF0Lm9uZGF0YWNoYW5uZWwodGhhdC5kbklkLCB0aGF0KTtcblxuXHRcdGNvbnNvbGUubG9nKCdPcGVuIGRhdGFjaGFubmVsICcrdGhhdC5uYW1lKTtcblx0fVxufTtcblxuLyoqIEJpbmQgYW4gaW5jb21pbmcgUlRDIHN0cmVhbSB0byB0aGlzIGNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLm9uQWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG5cdHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuXHRpZih0eXBlb2YgdGhpcy5vbnN0cmVhbSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5vbnN0cmVhbSh0aGlzLmRuSWQsIHN0cmVhbSk7XG5cdGVsc2UgY29uc29sZS53YXJuKFwiSWdub3JlIHN0cmVhbSBcIiArIHN0cmVhbS5pZCk7XG5cblx0Y29uc29sZS5sb2coJ09wZW4gc3RyZWFtICcrdGhpcy5uYW1lKTtcbn07XG5cblxuLyoqIENsb3NlIHRoaXMgY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR0aGlzLmNsb3NlZCA9IHRydWU7XG59O1xuXG4vKiogV3JpdGUgYSBzY2FsYXIgdmFsdWUgdG8gdGhlIGdpdmVuIGluZGV4IG9uIHRoZSBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0aWYoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5zaXplIHx8IGlzTmFOKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuXHR0aGlzLl9idWZmZXJbaW5kZXhdID0gdmFsdWU7XG5cdHRoaXMuX3JlcXVlc3RTZW5kKCk7XG5cdHJldHVybiB0cnVlO1xufTtcblxuLyoqIFdyaXRlIGFuIGFycmF5IG9mIHZhbHVlcyB0byB0aGUgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS53cml0ZUFsbCA9IGZ1bmN0aW9uKHZhbHVlcyl7XG5cdGlmKCFBcnJheS5pc0FycmF5KHZhbHVlcykgfHwgdmFsdWVzLmxlbmd0aCAhPT0gdGhpcy5zaXplKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaTx2YWx1ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBpZihpc05hTih2YWx1ZXNbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMuX2J1ZmZlcltpXSA9IHZhbHVlc1tpXTtcbiAgICB9XG4gICAgdGhpcy5fcmVxdWVzdFNlbmQoKTtcbn07XG5cbi8qKiBBc2sgdG8gc2VuZCB0aGUgaW50ZXJuYWwgZGF0YSBidWZmZXIgdGhyb3VnaCB0aGUgZGF0YWNoYW5uZWwgYXQgdGhlIGRlZmluZWQgZnJlcXVlbmN5ICovXG5DaGFubmVsLnByb3RvdHlwZS5fcmVxdWVzdFNlbmQgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2VuZFRpbWVzdGFtcDtcblx0dmFyIHBlcmlvZCA9IDEwMDAgLyB0aGlzLmZyZXF1ZW5jeTtcblx0aWYoZWxhcHNlZFRpbWUgPj0gcGVyaW9kKSBkb1NlbmQoKTtcblx0ZWxzZSBpZighdGhpcy5fc2VuZFJlcXVlc3RlZCkge1xuXHRcdHRoaXMuX3NlbmRSZXF1ZXN0ZWQgPSB0cnVlO1xuXHRcdHNldFRpbWVvdXQoZG9TZW5kLCBwZXJpb2QgLSBlbGFwc2VkVGltZSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb1NlbmQoKSB7XG5cdFx0dGhhdC5fc2VuZFJlcXVlc3RlZCA9IGZhbHNlO1xuXHRcdHRoYXQuX2xhc3RTZW5kVGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0dmFyIHJldCA9IHRoYXQuX3NlbmQodGhhdC5fYnVmZmVyKTtcblx0XHQvL0lmIGF1dG9zZW5kIGlzIHNldCwgYXV0b21hdGljYWxseSBzZW5kIGJ1ZmZlciBhdCB0aGUgZ2l2ZW4gZnJlcXVlbmN5XG5cdFx0aWYocmV0ICYmIHRoYXQuYXV0b3NlbmQpIHRoYXQuX3JlcXVlc3RTZW5kKCk7XG5cdH1cbn07XG5cbi8qKiBBY3R1YWwgc2VuZCB0aGUgaW50ZXJuYWwgZGF0YSBidWZmZXIgdGhyb3VnaCB0aGUgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5fc2VuZCA9IGZ1bmN0aW9uKG1zZyl7XG5cdGlmKHRoaXMuY2xvc2VkIHx8ICF0aGlzLmNoYW5uZWwpIHJldHVybiBmYWxzZTtcblx0ZWxzZSBpZih0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSA9PT0gJ29wZW4nKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMuY2hhbm5lbC5zZW5kKG1zZyk7XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSBleGNlcHRpb24gb2NjdXJlZCB3aGlsZSBzZW5kaW5nIGRhdGEnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gd2FybmluZyA6IHdlYnJ0YyBkYXRhY2hhbm5lbCBzdGF0ZSA9ICcrdGhpcy5jaGFubmVsLnJlYWR5U3RhdGUpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqIENhbGxlZCB3aGVuIGEgbWVzc2FnZSBpcyByZWNlaXZlZCBmcm9tIHRoZSBjaGFubmVsJ3MgUlRDIGRhdGFjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5fb25NZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHR2YXIgdmFsQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KG1lc3NhZ2UuZGF0YSk7XG5cdHRoaXMuZW1pdCgndmFsdWUnLCB2YWxBcnJheSk7XG59O1xuXG4vKiogQ2FsbGVkIHdoZW4gdGhlIGNoYW5uZWwgaXMgY2xvc2VkIG9uIHRoZSByZW1vdGUgc2lkZSAqL1xuQ2hhbm5lbC5wcm90b3R5cGUuX29uQ2xvc2UgPSBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coJ0Nsb3NlIGRhdGFjaGFubmVsICcrdGhpcy5uYW1lKTtcblx0dGhpcy5lbWl0KCdjbG9zZScpO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLyBSVEMgUGVlciBpbXBsZW1lbnRhdGlvbiAvLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogQW4gUlRDIFBlZXIgYXNzb2NpYXRlZCB0byBhIHNpbmdsZSAoRGl5YU5vZGUgcGVlcklkLCBwcm9tSWQpIGNvdXBsZS5cbiAqIEBwYXJhbSBkbklkIDogVGhlIERpeWFOb2RlIHBlZXJJZFxuICogQHBhcmFtIHJ0YyA6IFRoZSBSVEMgZGl5YS1zZGsgaW5zdGFuY2VcbiAqIEBwYXJhbSBpZCA6IHRoZSBwcm9tSWRcbiAqIEBwYXJhbSBjaGFubmVscyA6IGFuIGFycmF5IG9mIFJUQyBjaGFubmVsIG5hbWVzIHRvIG9wZW5cbiAqL1xuZnVuY3Rpb24gUGVlcihkbklkLCBydGMsIGlkLCBjaGFubmVscyl7XG5cdHRoaXMuZG4gPSBkMShkbklkKTtcblx0dGhpcy5kbklkID0gZG5JZDtcblx0dGhpcy5pZCA9IGlkO1xuXHR0aGlzLmNoYW5uZWxzID0gY2hhbm5lbHM7XG5cdHRoaXMucnRjID0gcnRjO1xuXHR0aGlzLnBlZXIgPSBudWxsO1xuXG5cdHRoaXMuc3RyZWFtcyA9IFtdO1xuXG5cdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cblx0dGhpcy5fY29ubmVjdCgpO1xufVxuXG4vKiogSW5pdGlhdGUgYSBSVEMgY29ubmVjdGlvbiB0byB0aGlzIFBlZXIgKi9cblBlZXIucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5kbi5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdydGMnLCBmdW5jOiAnQ29ubmVjdCcsIG9iajogdGhpcy5jaGFubmVscywgZGF0YTogeyBwcm9tSUQ6IHRoaXMuaWQgfVxuXHR9LCBmdW5jdGlvbihkaXlhLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGRhdGEpIHtcblx0XHRcdGlmKGRhdGEuZXZlbnRUeXBlID09PSAnVHVybkluZm8nKSB0aGF0Ll90dXJuaW5mbyA9IGRhdGEudHVybjtcblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdSZW1vdGVPZmZlcicpIHRoYXQuX2NyZWF0ZVBlZXIoZGF0YSk7XG5cdFx0XHRlbHNlIGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUmVtb3RlSUNFQ2FuZGlkYXRlJykgdGhhdC5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlKGRhdGEpO1xuXHRcdH1cblx0fSk7XG5cblx0dGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpeyBpZighdGhhdC5jb25uZWN0ZWQgJiYgIXRoYXQuY2xvc2VkKSB0aGF0Ll9yZWNvbm5lY3QoKTsgfSwgNDAwMDApO1xufTtcblxuLyoqIFJlY29ubmVjdHMgdGhlIFJUQyBwZWVyICovXG5QZWVyLnByb3RvdHlwZS5fcmVjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5jbG9zZSgpO1xuXG5cdHRoaXMucGVlciA9IG51bGw7XG5cdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cblx0dGhpcy5fY29ubmVjdCgpO1xufTtcblxuXG4vKiogQ3JlYXRlcyBhIFJUQ1BlZXJDb25uZWN0aW9uIGluIHJlc3BvbnNlIHRvIGEgUmVtb3RlT2ZmZXIgKi9cblBlZXIucHJvdG90eXBlLl9jcmVhdGVQZWVyID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR2YXIgaWNlU2VydmVycyA9IFtdO1xuXHRpZih0aGlzLl90dXJuaW5mbykge1xuXHRcdGljZVNlcnZlcnMucHVzaCh7IHVybHM6IFsgdGhpcy5fdHVybmluZm8udXJsIF0sIHVzZXJuYW1lOiB0aGlzLl90dXJuaW5mby51c2VybmFtZSwgY3JlZGVudGlhbDogdGhpcy5fdHVybmluZm8ucGFzc3dvcmQgfSk7XG5cdH0gZWxzZSB7XG5cdFx0aWNlU2VydmVycy5wdXNoKHt1cmxzOiBbIFwic3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMlwiIF19KTtcblx0fVxuXHRcblx0dmFyIGNvbmZpZyA9IHtcblx0XHRpY2VTZXJ2ZXJzOiBpY2VTZXJ2ZXJzLFxuXHRcdGljZVRyYW5zcG9ydFBvbGljeTogJ2FsbCdcdFxuXHR9O1xuXG5cdHZhciBjb25zdHJhaW50cyA9IHtcblx0XHRtYW5kYXRvcnk6IHtEdGxzU3J0cEtleUFncmVlbWVudDogdHJ1ZSwgT2ZmZXJUb1JlY2VpdmVBdWRpbzogdHJ1ZSwgT2ZmZXJUb1JlY2VpdmVWaWRlbzp0cnVlfVxuXHR9XG5cdFxuXHRjb25zb2xlLmxvZyhjb25maWcpO1xuXHRjb25zb2xlLmxvZyhjb25zdHJhaW50cyk7XG5cblx0dmFyIHBlZXIgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oY29uZmlnLCAgY29uc3RyYWludHMpO1xuXHR0aGlzLnBlZXIgPSBwZWVyO1xuXG5cdHRoaXMuc3RyZWFtcy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcblx0XHRwZWVyLmFkZFN0cmVhbShzKTtcblx0fSk7XG5cblx0cGVlci5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtzZHA6IGRhdGEuc2RwLCB0eXBlOiBkYXRhLnR5cGV9KSk7XG5cblx0cGVlci5jcmVhdGVBbnN3ZXIoZnVuY3Rpb24oc2Vzc2lvbl9kZXNjcmlwdGlvbil7XG5cdFx0cGVlci5zZXRMb2NhbERlc2NyaXB0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pO1xuXG5cdFx0dGhhdC5kbi5yZXF1ZXN0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0Fuc3dlcicsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHByb21JRDogZGF0YS5wcm9tSUQsXG5cdFx0XHRcdHBlZXJJZDogZGF0YS5wZWVySWQsXG5cdFx0XHRcdHNkcDogc2Vzc2lvbl9kZXNjcmlwdGlvbi5zZHAsXG5cdFx0XHRcdHR5cGU6IHNlc3Npb25fZGVzY3JpcHRpb24udHlwZVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRmdW5jdGlvbihlcnIpeyBjb25zb2xlLmxvZyhlcnIpOyB9LFxuXHR7J21hbmRhdG9yeSc6IHsgT2ZmZXJUb1JlY2VpdmVBdWRpbzogdHJ1ZSwgT2ZmZXJUb1JlY2VpdmVWaWRlbzogdHJ1ZX19KTtcblxuXHRwZWVyLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcblx0XHRpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Nvbm5lY3RlZCcpe1xuXHRcdFx0dGhhdC5jb25uZWN0ZWQgPSB0cnVlO1xuXHRcdFx0aWYodGhhdC5zdWJzY3JpcHRpb24pIHRoYXQuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdkaXNjb25uZWN0ZWQnIHx8IHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnY2xvc2VkJyB8fCBwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2ZhaWxlZCcpe1xuXHRcdFx0aWYoIXRoYXQuY2xvc2VkKSB0aGF0Ll9yZWNvbm5lY3QoKTtcblx0XHR9XG5cdH07XG5cblx0cGVlci5vbmljZWNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGV2dCl7XG5cdFx0dGhhdC5kbi5yZXF1ZXN0KHtcblx0XHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdFx0ZnVuYzogJ0lDRUNhbmRpZGF0ZScsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHBlZXJJZDogZGF0YS5wZWVySWQsXG5cdFx0XHRcdHByb21JRDogdGhhdC5pZCxcblx0XHRcdFx0Y2FuZGlkYXRlOiBldnQuY2FuZGlkYXRlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cGVlci5vbmRhdGFjaGFubmVsID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0dGhhdC5ydGMuX29uRGF0YUNoYW5uZWwodGhhdC5kbklkLCBldnQuY2hhbm5lbCk7XG5cdH07XG5cblx0cGVlci5vbmFkZHN0cmVhbSA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25BZGRTdHJlYW0odGhhdC5kbklkLCBldnQuc3RyZWFtKTtcblx0fTtcbn07XG5cblxuUGVlci5wcm90b3R5cGUuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR0cnkge1xuXHRcdC8vY29uc29sZS5sb2coJ3JlbW90ZSBpY2UgOicpO1xuXHRcdC8vY29uc29sZS5sb2coZGF0YS5jYW5kaWRhdGUuY2FuZGlkYXRlKTtcblx0XHR2YXIgY2FuZGlkYXRlID0gbmV3IFJUQ0ljZUNhbmRpZGF0ZShkYXRhLmNhbmRpZGF0ZSk7XG5cdFx0dGhpcy5wZWVyLmFkZEljZUNhbmRpZGF0ZShjYW5kaWRhdGUsIGZ1bmN0aW9uKCl7fSxmdW5jdGlvbihlcnIpeyBjb25zb2xlLmVycm9yKGVycik7XHR9KTtcblx0fSBjYXRjaChlcnIpIHsgY29uc29sZS5lcnJvcihlcnIpOyB9XG59O1xuXG4vKiogU2VuZCB0aGUgbWFwcGluZ3MgZnJvbSBjaGFubmVsIG5hbWVzIHRvIHN0cmVhbSBJRHMgKi9cblBlZXIucHJvdG90eXBlLnNlbmRDaGFubmVsc1N0cmVhbXNNYXBwaW5ncyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmRuLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6XCJydGNcIixcblx0XHRmdW5jOlwiQ2hhbm5lbHNTdHJlYW1zTWFwcGluZ3NcIixcblx0XHRkYXRhOntwZWVySWQ6MCwgbWFwcGluZ3M6dGhpcy5ydGNbdGhpcy5kbklkXS5jaGFubmVsc0J5U3RyZWFtfVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cdFx0aWYoZXJyKSBjb25zb2xlLmVycm9yKGVycik7XG5cdH0pO1xufTtcblxuLyoqIEFkZHMgYSBsb2NhbCBzdHJlYW0gdG8gdGhpcyBQZWVyICovXG5QZWVyLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcblx0dGhpcy5zZW5kQ2hhbm5lbHNTdHJlYW1zTWFwcGluZ3MoKTtcblx0aWYoIXRoaXMuc3RyZWFtcy5maWx0ZXIoZnVuY3Rpb24ocyl7cmV0dXJuIHN0cmVhbS5pZCA9PT0gczt9KVswXSkgdGhpcy5zdHJlYW1zLnB1c2goc3RyZWFtKTtcblx0dGhpcy5fcmVjb25uZWN0KCk7XG59XG5cblBlZXIucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR0aGlzLnN0cmVhbXMgPSB0aGlzLnN0cmVhbXMuZmlsdGVyKGZ1bmN0aW9uKHMpe3JldHVybiBzdHJlYW0uaWQgIT09IHM7fSk7XG5cdGlmKHRoaXMucGVlcikgdGhpcy5wZWVyLnJlbW92ZVN0cmVhbShzdHJlYW0pO1xufVxuXG5QZWVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdGlmKHRoaXMuc3Vic2NyaXB0aW9uKSB0aGlzLnN1YnNjcmlwdGlvbi5jbG9zZSgpO1xuXHRjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dElkKTtcblx0aWYodGhpcy5wZWVyKXtcblx0XHR0cnl7XG5cdFx0XHR0aGlzLnBlZXIuY2xvc2UoKTtcblx0XHR9Y2F0Y2goZSl7fVxuXHRcdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5jbG9zZWQgPSB0cnVlO1xuXHR9XG59O1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBSVEMgc2VydmljZSBpbXBsZW1lbnRhdGlvbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG5mdW5jdGlvbiBSVEMoc2VsZWN0b3Ipe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcblxuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzID0gW107XG5cdHRoaXMuY2hhbm5lbHNCeVN0cmVhbSA9IFtdO1xufVxuXG5SVEMucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKG5hbWVfcmVnZXgsIHR5cGUsIG9uZGF0YWNoYW5uZWxfY2FsbGJhY2ssIG9uYWRkc3RyZWFtX2NhbGxiYWNrKXtcblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscy5wdXNoKHtyZWdleDogbmFtZV9yZWdleCwgdHlwZTp0eXBlLCBjYjogb25kYXRhY2hhbm5lbF9jYWxsYmFjaywgc3RyZWFtX2NiOiBvbmFkZHN0cmVhbV9jYWxsYmFja30pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKiBTdGFydCBsaXN0ZW5pbmcgdG8gUGVlcnMgY29ubmVjdGlvbnMuXG4gKiBBICdQZWVyJyBvYmplY3Qgd2lsbCBiZSBjcmVhdGVkIGZvciBlYWNoIERpeWFOb2RlIHBlZXJJZCBhbmQgZWFjaCBwcm9tSURcbiAqL1xuUlRDLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cblx0dGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLnNlbGVjdG9yLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogJ3J0YycsXG5cdFx0ZnVuYzogJ1BlZXJzJ1xuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXG5cdFx0aWYoIXRoYXRbZG5JZF0pIHRoYXQuX2NyZWF0ZURpeWFOb2RlKGRuSWQpO1xuXG5cdFx0aWYoZXJyID09PSAnU3Vic2NyaXB0aW9uQ2xvc2VkJyB8fCBlcnIgPT09ICdQZWVyRGlzY29ubmVjdGVkJyl7XG5cdFx0XHR0aGF0Ll9jbG9zZURpeWFOb2RlKGRuSWQpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHRpZihkYXRhICYmIGRhdGEuZXZlbnRUeXBlICYmIGRhdGEucHJvbUlEICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1BlZXJDb25uZWN0ZWQnKXtcblx0XHRcdFx0aWYoIXRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdKXtcblx0XHRcdFx0XHR2YXIgY2hhbm5lbHMgPSB0aGF0Ll9tYXRjaENoYW5uZWxzKGRuSWQsIGRhdGEuY2hhbm5lbHMpO1xuXHRcdFx0XHRcdGlmKGNoYW5uZWxzLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRcdFx0dGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0gPSBuZXcgUGVlcihkbklkLCB0aGF0LCBkYXRhLnByb21JRCwgY2hhbm5lbHMpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEF1dG9yZWNvbm5lY3QgZGVjbGFyZWQgc3RyZWFtc1xuXHRcdFx0XHRcdHRoYXQuY2hhbm5lbHNCeVN0cmVhbS5mb3JFYWNoKGZ1bmN0aW9uKGNicykge1xuXHRcdFx0XHRcdFx0dGhhdC5hZGRTdHJlYW0oY2JzLmNoYW5uZWwsIGNicy5tZWRpYVN0cmVhbSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0pIHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdLnNlbmRDaGFubmVsc1N0cmVhbXNNYXBwaW5ncygpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1BlZXJDbG9zZWQnKSB7XG5cdFx0XHRcdGlmKHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdKSB7XG5cdFx0XHRcdFx0dGhhdC5fY2xvc2VQZWVyKGRuSWQsIGRhdGEucHJvbUlEKTtcblx0XHRcdFx0XHRpZih0eXBlb2YgdGhhdC5vbmNsb3NlID09PSAnZnVuY3Rpb24nKSB0aGF0Lm9uY2xvc2UoZG5JZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LCB7YXV0bzogdHJ1ZX0pO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuUlRDLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc2VsZWN0b3IuZWFjaChmdW5jdGlvbihkbklkKXtcblx0XHRpZighdGhhdFtkbklkXSkgcmV0dXJuIDtcblx0XHRmb3IodmFyIHByb21JRCBpbiB0aGF0W2RuSWRdLnBlZXJzKXtcblx0XHRcdHRoYXQuX2Nsb3NlUGVlcihkbklkLCBwcm9tSUQpO1xuXHRcdH1cblx0fSk7XG5cblx0aWYodGhpcy5zdWJzY3JpcHRpb24pIHRoaXMuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuXG5SVEMucHJvdG90eXBlLl9jcmVhdGVEaXlhTm9kZSA9IGZ1bmN0aW9uKGRuSWQpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpc1tkbklkXSA9IHtcblx0XHRkbklkOiBkbklkLFxuXHRcdHVzZWRDaGFubmVsczogW10sXG5cdFx0cmVxdWVzdGVkQ2hhbm5lbHM6IFtdLFxuXHRcdHBlZXJzOiBbXSxcblx0XHRjaGFubmVsc0J5U3RyZWFtOiBbXVxuXHR9XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGMpe3RoYXRbZG5JZF0ucmVxdWVzdGVkQ2hhbm5lbHMucHVzaChjKX0pO1xufTtcblxuUlRDLnByb3RvdHlwZS5fY2xvc2VEaXlhTm9kZSA9IGZ1bmN0aW9uKGRuSWQpe1xuXHRmb3IodmFyIHByb21JRCBpbiB0aGlzW2RuSWRdLnBlZXJzKXtcblx0XHR0aGlzLl9jbG9zZVBlZXIoZG5JZCwgcHJvbUlEKTtcblx0fVxuXG5cdGRlbGV0ZSB0aGlzW2RuSWRdO1xufTtcblxuUlRDLnByb3RvdHlwZS5fY2xvc2VQZWVyID0gZnVuY3Rpb24oZG5JZCwgcHJvbUlEKXtcblx0aWYodGhpc1tkbklkXS5wZWVyc1twcm9tSURdKXtcblx0XHR2YXIgcCA9IHRoaXNbZG5JZF0ucGVlcnNbcHJvbUlEXTtcblx0XHRwLmNsb3NlKCk7XG5cblx0XHRmb3IodmFyIGk9MDtpPHAuY2hhbm5lbHMubGVuZ3RoOyBpKyspe1xuXHRcdFx0ZGVsZXRlIHRoaXNbZG5JZF0udXNlZENoYW5uZWxzW3AuY2hhbm5lbHNbaV1dO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzW2RuSWRdLnBlZXJzW3Byb21JRF07XG5cdH1cbn07XG5cbi8qKiBNYXRjaGVzIHRoZSBnaXZlbiByZWNlaXZlZENoYW5uZWxzIHByb3Bvc2VkIGJ5IHRoZSBnaXZlbiBEaXlhTm9kZSBwZWVySWRcbiAqICBhZ2FpbnN0IHRoZSByZXF1ZXN0ZWQgY2hhbm5lbHMgYW5kIGNyZWF0ZXMgYSBDaGFubmVsIGZvciBlYWNoIG1hdGNoXG4gKi9cblJUQy5wcm90b3R5cGUuX21hdGNoQ2hhbm5lbHMgPSBmdW5jdGlvbihkbklkLCByZWNlaXZlZENoYW5uZWxzKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBjaGFubmVscyA9IFtdO1xuXG5cdGZvcih2YXIgaSA9IDA7IGkgPCByZWNlaXZlZENoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgbmFtZSA9IHJlY2VpdmVkQ2hhbm5lbHNbaV07XG5cdFx0dmFyIHJlbW90ZVN0cmVhbUlkID0gbmFtZS5zcGxpdChcIl87Ol9cIilbMV07XG5cdFx0bmFtZSA9IG5hbWUuc3BsaXQoXCJfOzpfXCIpWzBdO1xuXG5cdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRoYXRbZG5JZF0ucmVxdWVzdGVkQ2hhbm5lbHMubGVuZ3RoOyBqKyspe1xuXHRcdFx0dmFyIHJlcSA9IHRoYXRbZG5JZF0ucmVxdWVzdGVkQ2hhbm5lbHNbal07XG5cblx0XHRcdGlmKG5hbWUgJiYgbmFtZS5tYXRjaChyZXEucmVnZXgpICYmICF0aGF0W2RuSWRdLnVzZWRDaGFubmVsc1tuYW1lXSl7XG5cdFx0XHRcdHZhciBjaGFubmVsID0gbmV3IENoYW5uZWwoZG5JZCwgbmFtZSwgcmVxLmNiLCByZXEuc3RyZWFtX2NiKTtcblx0XHRcdFx0dGhhdFtkbklkXS51c2VkQ2hhbm5lbHNbbmFtZV0gPSBjaGFubmVsO1xuXHRcdFx0XHRjaGFubmVscy5wdXNoKG5hbWUpO1xuXG5cdFx0XHRcdC8vIElmIGEgc3RyZWFtIGlkIGlzIHByb3ZpZGVkIGZvciB0aGUgY2hhbm5lbCwgcmVnaXN0ZXIgdGhlIG1hcHBpbmdcblx0XHRcdFx0aWYocmVtb3RlU3RyZWFtSWQpIHtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5zdHJlYW0gIT09IHJlbW90ZVN0cmVhbUlkICYmIGNicy5jaGFubmVsICE9PSBjaGFubmVsOyB9KTtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7c3RyZWFtOnJlbW90ZVN0cmVhbUlkLCBjaGFubmVsOmNoYW5uZWx9KTtcblx0XHRcdFx0XHRjaGFubmVsLnN0cmVhbUlkID0gc3RyZWFtSWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGxvY2FsU3RyZWFtSWQgPSB0aGF0LmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsID09PSBuYW1lOyB9KVswXTtcblx0XHRcdFx0aWYobG9jYWxTdHJlYW1JZCkge1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLnN0cmVhbSAhPT0gbG9jYWxTdHJlYW1JZCAmJiBjYnMuY2hhbm5lbCAhPT0gbmFtZTsgfSk7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLnB1c2goe3N0cmVhbTpsb2NhbFN0cmVhbUlkLCBjaGFubmVsOm5hbWV9KTtcblx0XHRcdFx0XHRjaGFubmVsLmxvY2FsU3RyZWFtSWQgPSBsb2NhbFN0cmVhbUlkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuICBjaGFubmVscztcbn07XG5cblxuLyoqIENhbGxlZCB1cG9uIFJUQyBkYXRhY2hhbm5lbHMgY29ubmVjdGlvbnMgKi9cblJUQy5wcm90b3R5cGUuX29uRGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkbklkLCBkYXRhY2hhbm5lbCl7XG5cdGlmKCF0aGlzW2RuSWRdKSByZXR1cm4gY29uc29sZS53YXJuKFwiVHJpZWQgdG8gb3BlbiBhIGRhdGEgY2hhbm5lbCBvbiBhIGNsb3NlZCBwZWVyXCIpO1xuXHR2YXIgY2hhbm5lbCA9IHRoaXNbZG5JZF0udXNlZENoYW5uZWxzW2RhdGFjaGFubmVsLmxhYmVsXTtcblxuXHRpZighY2hhbm5lbCl7XG5cdFx0Y29uc29sZS5sb2coXCJEYXRhY2hhbm5lbCBcIitkYXRhY2hhbm5lbC5sYWJlbCtcIiB1bm1hdGNoZWQsIGNsb3NpbmcgIVwiKTtcblx0XHRkYXRhY2hhbm5lbC5jbG9zZSgpO1xuXHRcdHJldHVybiA7XG5cdH1cblx0Y2hhbm5lbC5zZXREYXRhQ2hhbm5lbChkYXRhY2hhbm5lbCk7XG59O1xuXG4vKiogQ2FsbGVkIHVwb24gUlRDIHN0cmVhbSBjaGFubmVsIGNvbm5lY3Rpb25zICovXG5SVEMucHJvdG90eXBlLl9vbkFkZFN0cmVhbSA9IGZ1bmN0aW9uKGRuSWQsIHN0cmVhbSkge1xuXHRpZighdGhpc1tkbklkXSkgcmV0dXJuIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIG9wZW4gYSBzdHJlYW0gb24gYSBjbG9zZWQgcGVlclwiKTtcblxuXHR2YXIgY2hhbm5lbCA9IHRoaXNbZG5JZF0udXNlZENoYW5uZWxzW3N0cmVhbS5pZF07XG5cblx0aWYoIWNoYW5uZWwpe1xuXHRcdGNvbnNvbGUud2FybihcIlN0cmVhbSBDaGFubmVsIFwiKyBzdHJlYW0uaWQgK1wiIHVubWF0Y2hlZCwgY2xvc2luZyAhXCIpO1xuXHRcdHN0cmVhbS5jbG9zZSgpO1xuXHRcdHJldHVybiA7XG5cdH1cblx0Y2hhbm5lbC5vbkFkZFN0cmVhbShzdHJlYW0pO1xufTtcblxuLyoqIEFkZCBhIGxvY2FsIHN0cmVhbSB0byBiZSBzZW50IHRocm91Z2ggdGhlIGdpdmVuIFJUQyBjaGFubmVsICovXG5SVEMucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKGNoYW5uZWwsIHN0cmVhbSkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0Ly8gUmVnaXN0ZXIgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZ1xuXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGlzLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG4gXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7Y2hhbm5lbDpjaGFubmVsLCBzdHJlYW06c3RyZWFtLmlkLCBtZWRpYVN0cmVhbTpzdHJlYW19KTtcblxuXHRjb25zb2xlLmxvZyhcIk9wZW4gbG9jYWwgc3RyZWFtIFwiICsgY2hhbm5lbCk7XG5cblx0Ly8gU2VuZCB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nIHRvIGFsbCBjb25uZWN0ZWQgUGVlcnNcblx0dGhpcy5zZWxlY3Rvci5lYWNoKGZ1bmN0aW9uKGRuSWQpe1xuXHRcdGlmKCF0aGF0W2RuSWRdKSByZXR1cm4gO1xuXHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcblx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7Y2hhbm5lbDpjaGFubmVsLCBzdHJlYW06c3RyZWFtLmlkfSk7XG5cdFx0Zm9yKHZhciBwcm9tSUQgaW4gdGhhdFtkbklkXS5wZWVycyl7XG5cdFx0XHR0aGF0W2RuSWRdLnBlZXJzW3Byb21JRF0uYWRkU3RyZWFtKHN0cmVhbSk7XG5cdFx0fVxuXHR9KTtcblxufTtcblxuUlRDLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihjaGFubmVsLCBzdHJlYW0pIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8vIFJlZ2lzdGVyIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmdcblx0dGhpcy5jaGFubmVsc0J5U3RyZWFtID0gdGhpcy5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuXG5cdGNvbnNvbGUubG9nKFwiQ2xvc2UgbG9jYWwgc3RyZWFtIFwiICsgY2hhbm5lbCk7XG5cblx0Ly8gU2VuZCB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nIHRvIGFsbCBjb25uZWN0ZWQgUGVlcnNcblx0dGhpcy5zZWxlY3Rvci5lYWNoKGZ1bmN0aW9uKGRuSWQpe1xuXHRcdGlmKCF0aGF0W2RuSWRdKSByZXR1cm4gO1xuXHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcblx0XHRmb3IodmFyIHByb21JRCBpbiB0aGF0W2RuSWRdLnBlZXJzKXtcblx0XHRcdHRoYXRbZG5JZF0ucGVlcnNbcHJvbUlEXS5yZW1vdmVTdHJlYW0oc3RyZWFtKTtcblx0XHR9XG5cdH0pO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5ydGMgPSBmdW5jdGlvbigpeyByZXR1cm4gbmV3IFJUQyh0aGlzKTt9O1xuIiwiLyogbWF5YS1jbGllbnRcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqXHQzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IHRydWU7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8qKlxuICpcdGNhbGxiYWNrIDogZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1vZGVsIHVwZGF0ZWRcbiAqICovXG5mdW5jdGlvbiBTdGF0dXMoc2VsZWN0b3Ipe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0dGhpcy5fY29kZXIgPSBzZWxlY3Rvci5lbmNvZGUoKTtcblx0dGhpcy5zdWJzY3JpcHRpb25zID0gW107XG5cblx0LyoqIG1vZGVsIG9mIHJvYm90IDogYXZhaWxhYmxlIHBhcnRzIGFuZCBzdGF0dXMgKiovXG5cdHRoaXMucm9ib3RNb2RlbCA9IFtdO1xuXHR0aGlzLl9yb2JvdE1vZGVsSW5pdCA9IGZhbHNlO1xuXG5cdC8qKiogc3RydWN0dXJlIG9mIGRhdGEgY29uZmlnICoqKlxuXHRcdCBjcml0ZXJpYSA6XG5cdFx0ICAgdGltZTogYWxsIDMgdGltZSBjcml0ZXJpYSBzaG91bGQgbm90IGJlIGRlZmluZWQgYXQgdGhlIHNhbWUgdGltZS4gKHJhbmdlIHdvdWxkIGJlIGdpdmVuIHVwKVxuXHRcdCAgICAgYmVnOiB7W251bGxdLHRpbWV9IChudWxsIG1lYW5zIG1vc3QgcmVjZW50KSAvLyBzdG9yZWQgYSBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIGVuZDoge1tudWxsXSwgdGltZX0gKG51bGwgbWVhbnMgbW9zdCBvbGRlc3QpIC8vIHN0b3JlZCBhcyBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIHJhbmdlOiB7W251bGxdLCB0aW1lfSAocmFuZ2Ugb2YgdGltZShwb3NpdGl2ZSkgKSAvLyBpbiBzIChudW0pXG5cdFx0ICAgcm9ib3Q6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgICBwbGFjZToge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCBvcGVyYXRvcjoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfSAtKCBtYXliZSBtb3kgc2hvdWxkIGJlIGRlZmF1bHRcblx0XHQgLi4uXG5cblx0XHQgcGFydHMgOiB7W251bGxdIG9yIEFycmF5T2YgUGFydHNJZH0gdG8gZ2V0IGVycm9yc1xuXHRcdCBzdGF0dXMgOiB7W251bGxdIG9yIEFycmF5T2YgU3RhdHVzTmFtZX0gdG8gZ2V0IHN0YXR1c1xuXG5cdFx0IHNhbXBsaW5nOiB7W251bGxdIG9yIGludH1cblx0Ki9cblx0dGhpcy5kYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7XG5cdFx0XHRcdGJlZzogbnVsbCxcblx0XHRcdFx0ZW5kOiBudWxsLFxuXHRcdFx0XHRyYW5nZTogbnVsbCAvLyBpbiBzXG5cdFx0XHR9LFxuXHRcdFx0cm9ib3Q6IG51bGxcblx0XHR9LFxuXHRcdG9wZXJhdG9yOiAnbGFzdCcsXG5cdFx0cGFydHM6IG51bGwsXG5cdFx0c3RhdHVzOiBudWxsXG5cdH07XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuLyoqXG4gKiBHZXQgcm9ib3RNb2RlbCA6XG4gKiB7XG4gKiAgcGFydHM6IHtcbiAqXHRcdFwicGFydFhYXCI6IHtcbiAqIFx0XHRcdCBlcnJvcnNEZXNjcjogeyBlbmNvdW50ZXJlZCBlcnJvcnMgaW5kZXhlZCBieSBlcnJvcklkcz4wIH1cbiAqXHRcdFx0XHQ+IENvbmZpZyBvZiBlcnJvcnMgOlxuICpcdFx0XHRcdFx0Y3JpdExldmVsOiBGTE9BVCwgLy8gY291bGQgYmUgaW50Li4uXG4gKiBcdFx0XHRcdFx0bXNnOiBTVFJJTkcsXG4gKlx0XHRcdFx0XHRzdG9wU2VydmljZUlkOiBTVFJJTkcsXG4gKlx0XHRcdFx0XHRydW5TY3JpcHQ6IFNlcXVlbGl6ZS5TVFJJTkcsXG4gKlx0XHRcdFx0XHRtaXNzaW9uTWFzazogU2VxdWVsaXplLklOVEVHRVIsXG4gKlx0XHRcdFx0XHRydW5MZXZlbDogU2VxdWVsaXplLklOVEVHRVJcbiAqXHRcdFx0ZXJyb3I6W0ZMT0FULCAuLi5dLCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqXHRcdFx0dGltZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJvYm90OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0Ly8vIHBsYWNlOltGTE9BVCwgLi4uXSwgbm90IGltcGxlbWVudGVkIHlldFxuICpcdFx0fSxcbiAqXHQgXHQuLi4gKFwiUGFydFlZXCIpXG4gKiAgfSxcbiAqICBzdGF0dXM6IHtcbiAqXHRcdFwic3RhdHVzWFhcIjoge1xuICpcdFx0XHRcdGRhdGE6W0ZMT0FULCAuLi5dLCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqXHRcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0XHRyb2JvdDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdFx0Ly8vIHBsYWNlOltGTE9BVCwgLi4uXSwgbm90IGltcGxlbWVudGVkIHlldFxuICpcdFx0XHRcdHJhbmdlOiBbRkxPQVQsIEZMT0FUXSxcbiAqXHRcdFx0XHRsYWJlbDogc3RyaW5nXG4gKlx0XHRcdH0sXG4gKlx0IFx0Li4uIChcIlN0YXR1c1lZXCIpXG4gKiAgfVxuICogfVxuICovXG5TdGF0dXMucHJvdG90eXBlLmdldFJvYm90TW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5yb2JvdE1vZGVsO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YUNvbmZpZyBjb25maWcgZm9yIGRhdGEgcmVxdWVzdFxuICogaWYgZGF0YUNvbmZpZyBpcyBkZWZpbmUgOiBzZXQgYW5kIHJldHVybiB0aGlzXG4gKlx0IEByZXR1cm4ge1N0YXR1c30gdGhpc1xuICogZWxzZVxuICpcdCBAcmV0dXJuIHtPYmplY3R9IGN1cnJlbnQgZGF0YUNvbmZpZ1xuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFDb25maWcgPSBmdW5jdGlvbihuZXdEYXRhQ29uZmlnKXtcblx0aWYobmV3RGF0YUNvbmZpZykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZz1uZXdEYXRhQ29uZmlnO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnO1xufTtcbi8qKlxuICogVE8gQkUgSU1QTEVNRU5URUQgOiBvcGVyYXRvciBtYW5hZ2VtZW50IGluIEROLVN0YXR1c1xuICogQHBhcmFtICB7U3RyaW5nfVx0IG5ld09wZXJhdG9yIDoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfVxuICogQHJldHVybiB7U3RhdHVzfSB0aGlzIC0gY2hhaW5hYmxlXG4gKiBTZXQgb3BlcmF0b3IgY3JpdGVyaWEuXG4gKiBEZXBlbmRzIG9uIG5ld09wZXJhdG9yXG4gKlx0QHBhcmFtIHtTdHJpbmd9IG5ld09wZXJhdG9yXG4gKlx0QHJldHVybiB0aGlzXG4gKiBHZXQgb3BlcmF0b3IgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7U3RyaW5nfSBvcGVyYXRvclxuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFPcGVyYXRvciA9IGZ1bmN0aW9uKG5ld09wZXJhdG9yKXtcblx0aWYobmV3T3BlcmF0b3IpIHtcblx0XHR0aGlzLmRhdGFDb25maWcub3BlcmF0b3IgPSBuZXdPcGVyYXRvcjtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvcjtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gbnVtU2FtcGxlc1xuICogQHBhcmFtIHtpbnR9IG51bWJlciBvZiBzYW1wbGVzIGluIGRhdGFNb2RlbFxuICogaWYgZGVmaW5lZCA6IHNldCBudW1iZXIgb2Ygc2FtcGxlc1xuICpcdEByZXR1cm4ge1N0YXR1c30gdGhpc1xuICogZWxzZVxuICpcdEByZXR1cm4ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXNcbiAqKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YVNhbXBsaW5nID0gZnVuY3Rpb24obnVtU2FtcGxlcyl7XG5cdGlmKG51bVNhbXBsZXMpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuc2FtcGxpbmcgPSBudW1TYW1wbGVzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLnNhbXBsaW5nO1xufTtcbi8qKlxuICogU2V0IG9yIGdldCBkYXRhIHRpbWUgY3JpdGVyaWEgYmVnIGFuZCBlbmQuXG4gKiBJZiBwYXJhbSBkZWZpbmVkXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lQmVnIC8vIG1heSBiZSBudWxsXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lRW5kIC8vIG1heSBiZSBudWxsXG4gKlx0QHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBJZiBubyBwYXJhbSBkZWZpbmVkOlxuICpcdEByZXR1cm4ge09iamVjdH0gVGltZSBvYmplY3Q6IGZpZWxkcyBiZWcgYW5kIGVuZC5cbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhVGltZSA9IGZ1bmN0aW9uKG5ld1RpbWVCZWcsbmV3VGltZUVuZCwgbmV3UmFuZ2Upe1xuXHRpZihuZXdUaW1lQmVnIHx8IG5ld1RpbWVFbmQgfHwgbmV3UmFuZ2UpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5iZWcgPSBuZXdUaW1lQmVnLmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5lbmQgPSBuZXdUaW1lRW5kLmdldFRpbWUoKTtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5yYW5nZSA9IG5ld1JhbmdlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4ge1xuXHRcdFx0YmVnOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5iZWcpLFxuXHRcdFx0ZW5kOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5lbmQpLFxuXHRcdFx0cmFuZ2U6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlKVxuXHRcdH07XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHJvYm90SWRzXG4gKiBTZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSByb2JvdElkcyBsaXN0IG9mIHJvYm90IElkc1xuICogR2V0IHJvYm90IGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YVJvYm90SWRzID0gZnVuY3Rpb24ocm9ib3RJZHMpe1xuXHRpZihyb2JvdElkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5yb2JvdCA9IHJvYm90SWRzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90O1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBwbGFjZUlkcyAvLyBub3QgcmVsZXZhbnQ/LCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKiBTZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSBwbGFjZUlkcyBsaXN0IG9mIHBsYWNlIElkc1xuICogR2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2YgcGxhY2UgSWRzXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YVBsYWNlSWRzID0gZnVuY3Rpb24ocGxhY2VJZHMpe1xuXHRpZihwbGFjZUlkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZUlkID0gcGxhY2VJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2U7XG59O1xuLyoqXG4gKiBHZXQgZGF0YSBieSBzZW5zb3IgbmFtZS5cbiAqXHRAcGFyYW0ge0FycmF5W1N0cmluZ119IHNlbnNvck5hbWUgbGlzdCBvZiBzZW5zb3JzXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0RGF0YUJ5TmFtZSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzKXtcblx0dmFyIGRhdGE9W107XG5cdGZvcih2YXIgbiBpbiBzZW5zb3JOYW1lcykge1xuXHRcdGRhdGEucHVzaCh0aGlzLmRhdGFNb2RlbFtzZW5zb3JOYW1lc1tuXV0pO1xuXHR9XG5cdHJldHVybiBkYXRhO1xufTtcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gZXJyb3Ivc3RhdHVzIHVwZGF0ZXNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKHJvYm90TmFtZXMsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHQvLyBjb25zb2xlLmxvZyhyb2JvdE5hbWVzKTtcblxuXHR2YXIgc3VicyA9IHRoaXMuc2VsZWN0b3Iuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAnc3RhdHVzJyxcblx0XHRmdW5jOiAnU3RhdHVzJyxcblx0XHRkYXRhOiByb2JvdE5hbWVzXG5cdH0sIGZ1bmN0aW9uIChwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdC8vIGNvbnNvbGUubG9nKHBlZXJJZCk7XG5cdFx0Ly8gY29uc29sZS5sb2coZXJyKTtcblx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRpZiAoZXJyIHx8IChkYXRhJiZkYXRhLmVyciZkYXRhLmVyci5zdCkgKSB7XG5cdFx0XHRMb2dnZXIuZXJyb3IoIFwiU3RhdHVzU3Vic2NyaWJlOlwiKyhlcnI/ZXJyOlwiXCIpK1wiXFxuXCIrKGRhdGEmJmRhdGEuZXJyP2RhdGEuZXJyOlwiXCIpICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKGRhdGEgJiYgZGF0YS5oZWFkZXJcblx0XHRcdCAgICYmIGRhdGEuaGVhZGVyLnR5cGUgPT09IFwiaW5pdFwiKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpc2F0aW9uIG9mIHJvYm90IG1vZGVsXG5cdFx0XHRcdHRoYXQucm9ib3RNb2RlbEluaXQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRpZih0aGF0LnJvYm90TW9kZWxJbml0KSB7XG5cdFx0XHRcdHRoYXQuX2dldFJvYm90TW9kZWxGcm9tUmVjdjIoZGF0YSk7XG5cdFx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJylcblx0XHRcdFx0XHRjYWxsYmFjayh0aGF0LnJvYm90TW9kZWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdC8vIEVycm9yXG5cdFx0XHRcdExvZ2dlci5lcnJvcihcIlJvYm90IG1vZGVsIGhhcyBub3QgYmVlbiBpbml0aWFsaXNlZCwgY2Fubm90IGJlIHVwZGF0ZWRcIik7XG5cdFx0XHRcdC8vLyBUT0RPIHVuc3Vic2NyaWJlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LCB7IGF1dG86IHRydWUgfSk7XG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnMpO1xufTtcblxuLyoqXG4gKiBDbG9zZSBhbGwgc3Vic2NyaXB0aW9uc1xuICovXG5TdGF0dXMucHJvdG90eXBlLmNsb3NlU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgaSBpbiB0aGlzLnN1YnNjcmlwdGlvbnMpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaV0uY2xvc2UoKTtcblx0fVxuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPVtdO1xufTtcblxuXG4vKipcbiAqIEdldCBkYXRhIGdpdmVuIGRhdGFDb25maWcuXG4gKiBAcGFyYW0ge2Z1bmN9IGNhbGxiYWNrIDogY2FsbGVkIGFmdGVyIHVwZGF0ZVxuICogVE9ETyBVU0UgUFJPTUlTRVxuICovXG5TdGF0dXMucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbihjYWxsYmFjaywgZGF0YUNvbmZpZyl7XG5cdHZhciB0aGF0PXRoaXM7XG5cdHZhciBkYXRhTW9kZWwgPSB7fTtcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwic3RhdHVzXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJzcGxSZXFcIixcblx0XHRcdGRhdGFDb25maWc6IHRoYXQuZGF0YUNvbmZpZ1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIltcIit0aGF0LmRhdGFDb25maWcuc2Vuc29ycytcIl0gUmVjdiBlcnI6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiVXBkYXRlRGF0YTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5yZXFDb25maWcpKTtcblx0XHRcdExvZ2dlci5lcnJvcihcIkRhdGEgcmVxdWVzdCBmYWlsZWQgKFwiK2RhdGEuaGVhZGVyLmVycm9yLnN0K1wiKTogXCIrZGF0YS5oZWFkZXIuZXJyb3IubXNnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly9Mb2dnZXIubG9nKEpTT04uc3RyaW5naWZ5KHRoYXQuZGF0YU1vZGVsKSk7XG5cdFx0ZGF0YU1vZGVsID0gdGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHRMb2dnZXIubG9nKHRoYXQuZ2V0RGF0YU1vZGVsKCkpO1xuXG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoYXQpOyAvLyBiaW5kIGNhbGxiYWNrIHdpdGggU3RhdHVzXG5cdFx0Y2FsbGJhY2soZGF0YU1vZGVsKTsgLy8gY2FsbGJhY2sgZnVuY1xuXHR9KTtcbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgcm9ib3QgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhICh2ZXJzaW9uIDIpXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuX2dldFJvYm90TW9kZWxGcm9tUmVjdjIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHJvYm90O1xuXHR2YXIgZGF0YVJvYm90cyA9IGRhdGEucm9ib3RzO1xuXHR2YXIgZGF0YVBhcnRzID0gZGF0YS5wYXJ0TGlzdDtcblx0aWYoIXRoaXMucm9ib3RNb2RlbClcblx0XHR0aGlzLnJvYm90TW9kZWwgPSBbXTtcblx0Ly8gY29uc29sZS5sb2coXCJfZ2V0Um9ib3RNb2RlbEZyb21SZWN2XCIpO1xuXHQvLyBjb25zb2xlLmxvZyh0aGlzLnJvYm90TW9kZWwpO1xuXG5cdGZvcih2YXIgbiBpbiB0aGlzLnJvYm90TW9kZWwpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhuKTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMgPSB7fTsgLy8gcmVzZXQgcGFydHNcblx0fVxuXG5cdGZvcih2YXIgbiBpbiBkYXRhUm9ib3RzKSB7XG5cdFx0aWYoIXRoaXMucm9ib3RNb2RlbFtuXSlcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXT17fTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucm9ib3QgPSBkYXRhUm9ib3RzW25dLnJvYm90O1xuXG5cdFx0Ly8gaWYodGhpcy5yb2JvdE1vZGVsLmxlbmd0aDxkYXRhLmxlbmd0aCkge1xuXHRcdC8vIFx0dGhpcy5yb2JvdE1vZGVsLnB1c2goe3JvYm90OiBkYXRhWzBdLnJvYm90c30pO1xuXHRcdC8vIH1cblxuXHRcdC8qKiBleHRyYWN0IHBhcnRzIGluZm8gKiovXG5cdFx0aWYoZGF0YVJvYm90c1tuXSAmJiBkYXRhUm9ib3RzW25dLnBhcnRzKSB7XG5cdFx0XHR2YXIgcGFydHMgPSBkYXRhUm9ib3RzW25dLnBhcnRzO1xuXHRcdFx0dmFyIHBhc3RQYXJ0cyA9IGRhdGFSb2JvdHNbbl0ucGFzdFBhcnRzO1xuXHRcdFx0dGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzID0ge307XG5cdFx0XHR2YXIgclBhcnRzID0gdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzO1xuXHRcdFx0Ly8gZm9yKHZhciBxIGluIHJQYXJ0cykge1xuXHRcdFx0Ly8gXHQvKiogcGFydFtxXSB3YXMgbm90IHNlbnQgYmVjYXVzZSBubyBlcnJvciAqKi9cblx0XHRcdC8vIFx0aWYoIXBhcnRzW3FdXG5cdFx0XHQvLyBcdCAgICYmclBhcnRzW3FdLmV2dHMmJnJQYXJ0c1txXS5ldnRzLmNvZGUpIHtcblx0XHRcdC8vIFx0XHRyUGFydHNbcV0uZXZ0cyA9IHtcblx0XHRcdC8vIFx0XHRcdGNvZGU6IDAsXG5cdFx0XHQvLyBcdFx0XHRjb2RlUmVmOiAwLFxuXHRcdFx0Ly8gXHRcdFx0dGltZTogRGF0ZS5ub3coKSAvKiogdXBkYXRlICoqL1xuXHRcdFx0Ly8gXHRcdH07XG5cdFx0XHQvLyBcdH1cblx0XHRcdC8vIH1cblx0XHRcdGZvciAodmFyIHAgaW4gcGFydHMpIHtcblx0XHRcdFx0aWYoIXJQYXJ0c1twXSkge1xuXHRcdFx0XHRcdHJQYXJ0c1twXT17fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihwYXJ0c1twXSkge1xuXHRcdFx0XHRcdC8vIExvZ2dlci5sb2cobik7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgY2F0ZWdvcnkgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0uY2F0ZWdvcnk9ZGF0YVBhcnRzW3BdLmNhdGVnb3J5O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IG5hbWUgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubmFtZT1kYXRhUGFydHNbcF0ubmFtZTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBsYWJlbCAqL1xuXHRcdFx0XHRcdHJQYXJ0c1twXS5sYWJlbD1kYXRhUGFydHNbcF0ubGFiZWw7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yIHRpbWUgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXSk7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLnRpbWUpO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS50aW1lKTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgZXJyb3IgKi9cblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhwYXJ0c1twXS5lcnJvcnMuY29kZSk7XG5cblx0XHRcdFx0XHQvKiogdXBkYXRlIGVycm9yTGlzdCAqKi9cblx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdClcblx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3Q9e307XG5cdFx0XHRcdFx0Zm9yKCB2YXIgZWwgaW4gZGF0YVBhcnRzW3BdLmVycm9yTGlzdCApXG5cdFx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdFtlbF0pXG5cdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3RbZWxdID0gZGF0YVBhcnRzW3BdLmVycm9yTGlzdFtlbF07XG5cblx0XHRcdFx0XHRyUGFydHNbcF0uZXZ0cyA9IHtcblx0XHRcdFx0XHRcdGNvZGU6IHBhcnRzW3BdLmNvZGUsXG5cdFx0XHRcdFx0XHRjb2RlUmVmOiBwYXJ0c1twXS5jb2RlUmVmLFxuXHRcdFx0XHRcdFx0dGltZTogcGFydHNbcF0udGltZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0clBhcnRzW3BdLmxhc3RFdnRzID0gcGFzdFBhcnRzW3BdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS5lcnJvcik7XG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZygncGFydHMsIHJQYXJ0cycpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHMpO1xuIFx0XHQvLyBcdGNvbnNvbGUubG9nKHJQYXJ0cyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiTm8gcGFydHMgdG8gcmVhZCBmb3Igcm9ib3QgXCIrZGF0YVtuXS5uYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgcm9ib3QgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuX2dldFJvYm90TW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgcm9ib3Q7XG5cblx0aWYoIXRoaXMucm9ib3RNb2RlbClcblx0XHR0aGlzLnJvYm90TW9kZWwgPSBbXTtcblx0Ly8gY29uc29sZS5sb2coXCJfZ2V0Um9ib3RNb2RlbEZyb21SZWN2XCIpO1xuXHQvLyBjb25zb2xlLmxvZyh0aGlzLnJvYm90TW9kZWwpO1xuXG5cdC8qKiBPbmx5IG9uZSByb2JvdCBpcyBtYW5hZ2UgYXQgdGhlIHNhbWUgdGltZSBjdXJyZW50bHkgKiovXG5cdGZvcih2YXIgbiBpbiBkYXRhKSB7XG5cdFx0aWYoIXRoaXMucm9ib3RNb2RlbFtuXSlcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXT17fTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucm9ib3QgPSBkYXRhW25dLnJvYm90O1xuXG5cdFx0Ly8gaWYodGhpcy5yb2JvdE1vZGVsLmxlbmd0aDxkYXRhLmxlbmd0aCkge1xuXHRcdC8vIFx0dGhpcy5yb2JvdE1vZGVsLnB1c2goe3JvYm90OiBkYXRhWzBdLnJvYm90c30pO1xuXHRcdC8vIH1cblxuXHRcdC8qKiBleHRyYWN0IHBhcnRzIGluZm8gKiovXG5cdFx0aWYoZGF0YVtuXSAmJiBkYXRhW25dLnBhcnRzKSB7XG5cdFx0XHRpZighdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzKVxuXHRcdFx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMgPSB7fTtcblx0XHRcdHZhciBwYXJ0cyA9IGRhdGFbbl0ucGFydHM7XG5cdFx0XHR2YXIgclBhcnRzID0gdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzO1xuXHRcdFx0Zm9yKHZhciBxIGluIHJQYXJ0cykge1xuXHRcdFx0XHQvKiogcGFydFtxXSB3YXMgbm90IHNlbnQgYmVjYXVzZSBubyBlcnJvciAqKi9cblx0XHRcdFx0aWYoIXBhcnRzW3FdXG5cdFx0XHRcdCAgICYmclBhcnRzW3FdLmV2dHMmJnJQYXJ0c1txXS5ldnRzLmNvZGUpIHtcblx0XHRcdFx0XHRyUGFydHNbcV0uZXZ0cyA9IHtcblx0XHRcdFx0XHRcdGNvZGU6IFswXSxcblx0XHRcdFx0XHRcdGNvZGVSZWY6IFswXSxcblx0XHRcdFx0XHRcdHRpbWU6IFtEYXRlLm5vdygpXSAvKiogdXBkYXRlICoqL1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHAgaW4gcGFydHMpIHtcblx0XHRcdFx0aWYocGFydHNbcF0mJnBhcnRzW3BdLmVyciAmJiBwYXJ0c1twXS5lcnIuc3Q+MCkge1xuXHRcdFx0XHRcdExvZ2dlci5lcnJvcihcIlBhcnRzIFwiK3ArXCIgd2FzIGluIGVycm9yOiBcIitkYXRhW3BdLmVyci5tc2cpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFyUGFydHNbcF0pIHtcblx0XHRcdFx0XHRyUGFydHNbcF09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocGFydHNbcF0pIHtcblx0XHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGNhdGVnb3J5ICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmNhdGVnb3J5PXBhcnRzW3BdLmNhdGVnb3J5O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IG5hbWUgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubmFtZT1wYXJ0c1twXS5uYW1lO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGxhYmVsICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmxhYmVsPXBhcnRzW3BdLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciB0aW1lICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0pO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy50aW1lKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0udGltZSk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLmNvZGUpO1xuXG5cdFx0XHRcdFx0LyoqIHVwZGF0ZSBlcnJvckxpc3QgKiovXG5cdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3QpXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0PXt9O1xuXHRcdFx0XHRcdGZvciggdmFyIGVsIGluIHBhcnRzW3BdLmVycm9yTGlzdCApXG5cdFx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdFtlbF0pXG5cdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3RbZWxdID0gcGFydHNbcF0uZXJyb3JMaXN0W2VsXTtcblxuXHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzID0ge1xuXHRcdFx0XHRcdFx0Y29kZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGUpLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGVSZWYpLFxuXHRcdFx0XHRcdFx0dGltZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLnRpbWUpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ3BhcnRzLCByUGFydHMnKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0cyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiTm8gcGFydHMgdG8gcmVhZCBmb3Igcm9ib3QgXCIrZGF0YVtuXS5uYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKiBjcmVhdGUgU3RhdHVzIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLlN0YXR1cyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgU3RhdHVzKHRoaXMpO1xufTtcblxuLyoqXG4gKiBTZXQgb24gc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGZpbmQgc3RhdHVzIHRvIG1vZGlmeVxuICogQHBhcmFtIHBhcnROYW1lIFx0dG8gZmluZCBzdGF0dXMgdG8gbW9kaWZ5XG4gKiBAcGFyYW0gY29kZVx0XHRuZXdDb2RlXG4gKiBAcGFyYW0gc291cmNlXHRcdHNvdXJjZVxuICogQHBhcmFtIGNhbGxiYWNrXHRcdHJldHVybiBjYWxsYmFjayAoPGJvb2w+c3VjY2VzcylcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5zZXRTdGF0dXMgPSBmdW5jdGlvbihyb2JvdE5hbWUsIHBhcnROYW1lLCBjb2RlLCBzb3VyY2UsIGNhbGxiYWNrKSB7XG5cdHZhciBmdW5jTmFtZSA9IFwiU2V0U3RhdHVzX1wiK3BhcnROYW1lO1xuXHR0aGlzLnJlcXVlc3QoXG5cdFx0e3NlcnZpY2U6XCJzdGF0dXNcIixmdW5jOmZ1bmNOYW1lLGRhdGE6IHtyb2JvdE5hbWU6IHJvYm90TmFtZSwgc3RhdHVzQ29kZTogY29kZSwgcGFydE5hbWU6IHBhcnROYW1lLCBzb3VyY2U6IHNvdXJjZXwxfX0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2sodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEdldCBvbmUgc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBwYXJ0TmFtZSBcdHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBjYWxsYmFja1x0XHRyZXR1cm4gY2FsbGJhY2soLTEgaWYgbm90IGZvdW5kL2RhdGEgb3RoZXJ3aXNlKVxuICogQHBhcmFtIF9mdWxsIFx0bW9yZSBkYXRhIGFib3V0IHN0YXR1c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNhbGxiYWNrLCBfZnVsbCkge1xuXHR2YXIgZnVsbD1fZnVsbHx8ZmFsc2U7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6XCJHZXRTdGF0dXNcIixkYXRhOiB7cm9ib3ROYW1lOiByb2JvdE5hbWUsIHBhcnROYW1lOiBwYXJ0TmFtZSwgZnVsbDogZnVsbH19LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjaygtMSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGRhdGEpO1xuXHRcdFx0fVxuXHRcdH0pO1xufTtcbiIsIi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgY2hhbm5lbCBlbmNvZGluZ1xuICogLSBiYXNlNjQgY29kaW5nXG4gKiAtIG5vbmVcbiAqIERhdGEgZm9ybWF0IDpcbiAqXHRcdHQ6IHsnYjY0Jywnbm9uZSd9XG4gKlx0XHRiOiA8aWYgYjY0PiB7NCw4fVxuICpcdFx0ZDogZW5jb2RlZCBkYXRhIHtidWZmZXIgb3IgQXJyYXl9XG4gKlx0XHRzOiBzaXplXG4gKi9cblxuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2UtNjQnKTtcblxuLyoqXG4gKiBEZWZhdWx0IDogbm8gZW5jb2RpbmdcbiAqIEVmZmVjdGl2ZSBmb3Igc3RyaW5nIGJhc2VkIGNoYW5uZWxzIChsaWtlIEpTT04gYmFzZWQgV1MpXG4gKiAqL1xuZnVuY3Rpb24gTm9Db2RpbmcoKXtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQ29udmVydCBidWZmZXIgY29kZWQgaW4gYmFzZTY0IGFuZCBjb250YWluaW5nIG51bWJlcnMgY29kZWQgYnlcbiogYnl0ZUNvZGluZyBieXRlcyBpbnRvIGFycmF5XG4qIEBwYXJhbSBidWZmZXIgaW4gYmFzZTY0XG4qIEBwYXJhbSBieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBudW1iZXIgKDQgb3IgOClcbiogQHJldHVybiBhcnJheSBvZiBmbG9hdCAoMzIgb3IgNjQpLiBudWxsIGlmIGNvdWxkIG5vdCBjb252ZXJ0LlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHRyZXR1cm4gZGF0YS5kO1xufTtcblxuLyoqXG4qIENvbnZlcnQgYXJyYXkgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5IGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBidWZmZXIgY29kZWQgaW4gYmFzZTY0XG4qIEBwYXJhbSBcdHtBcnJheTxGbG9hdD59IFx0YXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0IGJpdHMpXG4qIEBwYXJhbSBcdHtpbnRlZ2VyfSBcdGJ5dGVDb2RpbmcgbnVtYmVyIG9mIGJ5dGVzIGZvciBlYWNoIGZsb2F0ICg0IG9yIDgpXG4qIEByZXR1cm4gIFx0e1N0cmluZ30gXHRidWZmZXIgaW4gYmFzZTY0LiBudWxsIGlmIGNvdWxkIG5vdCBjb252ZXJ0LlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5KSB7XG5cdHJldHVybiB7XG5cdFx0dDogJ25vJywgLyogdHlwZSAqL1xuXHRcdGQ6IGFycmF5LCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoXG5cdH07XG59O1xuXG5cblxuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgYmFzZTY0IGVuY29kaW5nXG4gKiBFZmZlY3RpdmUgZm9yIHN0cmluZyBiYXNlZCBjaGFubmVscyAobGlrZSBKU09OIGJhc2VkIFdTKVxuICogKi9cbmZ1bmN0aW9uIEJhc2U2NENvZGluZygpe1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgICBVdGlsaXR5IGZ1bmN0aW9ucyAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qXFxcbiB8KnxcbiB8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcbiB8KnxcbiB8KnwgIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvRMOpY29kZXJfZW5jb2Rlcl9lbl9iYXNlNjRcbiB8KnxcbiBcXCovXG4vKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cbnZhciBiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0bkNociAtIDY1XG5cdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0bkNociAtIDcxXG5cdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRuQ2hyICsgNFxuXHRcdDogbkNociA9PT0gNDMgP1xuXHRcdDYyXG5cdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0NjNcblx0XHQ6XHQwO1xufTtcblxuLyoqXG4gKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjRcdFx0YmFzZTY0IGNvZGVkIHN0cmluZ1xuICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9XHRcdFx0XHR0YWIgb2YgZGVjb2RlZCBieXRlc1xuICovXG52YXIgYmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHR2YXJcblx0c0I2NEVuYyA9IHNCYXNlNjQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csIFwiXCIpLCBuSW5MZW4gPSBzQjY0RW5jLmxlbmd0aCxcblx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRmb3IgKHZhciBuTW9kMywgbk1vZDQsIG5VaW50MjQgPSAwLCBuT3V0SWR4ID0gMCwgbkluSWR4ID0gMDsgbkluSWR4IDwgbkluTGVuOyBuSW5JZHgrKykge1xuXHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0aWYgKG5Nb2Q0ID09PSAzIHx8IG5JbkxlbiAtIG5JbklkeCA9PT0gMSkge1xuXHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0fVxuXHRcdFx0blVpbnQyNCA9IDA7XG5cdFx0fVxuXHR9XG5cdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdHJldHVybiBidWZmZXI7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgIEludGVyZmFjZSBmdW5jdGlvbnMgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4qIENvbnZlcnQgYnVmZmVyIGNvZGVkIGluIGJhc2U2NCBhbmQgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5XG4qIGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBhcnJheVxuKiBAcGFyYW0gYnVmZmVyIGluIGJhc2U2NFxuKiBAcGFyYW0gYnl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggbnVtYmVyICg0IG9yIDgpXG4qIEByZXR1cm4gYXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0KS4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdHZhciBieXRlQ29kaW5nID0gZGF0YS5iO1xuXG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyogZGVjb2RlIGRhdGEgdG8gYXJyYXkgb2YgYnl0ZSAqL1xuXHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YS5kLCBkYXRhLmIpO1xuXHQvKiBwYXJzZSBkYXRhIHRvIGZsb2F0IGFycmF5ICovXG5cdHZhciBmQXJyYXk9bnVsbDtcblx0c3dpdGNoKGRhdGEuYikge1xuXHRjYXNlIDQ6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0NjRBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRkZWZhdWx0OlxuXHRcdGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBieXRlQ29kaW5nISBTaG91bGQgbm90IGhhcHBlbiEhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qIHBhcnNlIGZBcnJheSBpbnRvIG5vcm1hbCBhcnJheSAqL1xuXHR2YXIgdGFiID0gW10uc2xpY2UuY2FsbChmQXJyYXkpO1xuXG5cdGlmKGRhdGEucyAhPT0gdGFiLmxlbmd0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCB3aGVuIGRlY29kaW5nICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRhYjtcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGFycmF5IGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieSBieXRlQ29kaW5nIGJ5dGVzIGludG8gYnVmZmVyIGNvZGVkIGluIGJhc2U2NFxuKiBAcGFyYW0gXHR7QXJyYXk8RmxvYXQ+fSBcdGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCBiaXRzKVxuKiBAcGFyYW0gXHR7aW50ZWdlcn0gXHRieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBmbG9hdCAoNCBvciA4KVxuKiBAcmV0dXJuICBcdHtTdHJpbmd9IFx0YnVmZmVyIGluIGJhc2U2NC4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIGJ5dGVDb2RpbmcpIHtcblx0LyogY2hlY2sgYnl0ZSBjb2RpbmcgKi9cblx0aWYoYnl0ZUNvZGluZyAhPT0gNCAmJiBieXRlQ29kaW5nICE9PSA4KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKioqIGNhc2UgQXJyYXlCdWZmZXIgKioqL1xuXHR2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGFycmF5Lmxlbmd0aCpieXRlQ29kaW5nKTtcblx0c3dpdGNoKGJ5dGVDb2RpbmcpIHtcblx0Y2FzZSA0OlxuXHRcdHZhciBidWYzMiA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKTtcblx0XHRidWYzMi5zZXQoYXJyYXkpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0dmFyIGJ1ZjY0ID0gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuXHRcdGJ1ZjY0LnNldChhcnJheSk7XG5cdFx0YnJlYWs7XG5cdH1cblx0dmFyIGJ1ZmZDaGFyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblx0dmFyIGJ1ZmZDaGFyQ29kZWQgPSBuZXcgQXJyYXkoYnVmZkNoYXIubGVuZ3RoKTtcblx0Zm9yKHZhciBuID0wOyBuPGJ1ZmZDaGFyLmxlbmd0aDsgbisrKSB7XG5cdFx0YnVmZkNoYXJDb2RlZFtuXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZkNoYXJbbl0pO1xuXHR9XG5cdHZhciBzdHIgPSBuZXcgU3RyaW5nKGJ1ZmZDaGFyQ29kZWQuam9pbignJykpO1xuXHR2YXIgYjY0QnVmZiA9IGJhc2U2NC5lbmNvZGUoc3RyKTtcblx0cmV0dXJuIHtcblx0XHR0OiAnYjY0JywgLyogdHlwZSAqL1xuXHRcdGI6IGJ5dGVDb2RpbmcsIC8qIGJ5dGVDb2RpbmcgKi9cblx0XHRkOiBiNjRCdWZmLCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoIC8qIHNpemUgKi9cblx0fTtcbn07XG5cblxuXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjb21tIGVuY29kaW5nXG4gKiAqL1xuZnVuY3Rpb24gQ29kaW5nSGFuZGxlcigpe1xuXHR0aGlzLmI2NCA9IG5ldyBCYXNlNjRDb2RpbmcoKTtcblx0dGhpcy5ub25lID0gbmV3IE5vQ29kaW5nKCk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKCFkYXRhIHx8IGRhdGE9PT1udWxsKVxuXHRcdHJldHVybiBudWxsO1xuXHRzd2l0Y2goZGF0YS50KSB7XG5cdGNhc2UgJ2I2NCc6XG5cdFx0cmV0dXJuIHRoaXMuYjY0LmZyb20oZGF0YSk7XG5cdGRlZmF1bHQ6XG5cdFx0cmV0dXJuIHRoaXMubm9uZS5mcm9tKGRhdGEpO1xuXHR9XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIHR5cGUsIGJ5dGVDb2RpbmcpIHtcblx0aWYodHlwZW9mIGFycmF5ID09PSAnbnVtYmVyJykge1xuXHRcdGFycmF5PVthcnJheV07XG5cdH1cblx0aWYoIUFycmF5LmlzQXJyYXkoYXJyYXkpKXtcblx0XHRjb25zb2xlLmxvZyhcIkNvZGluZ0hhbmRsZXIudG8gb25seSBhY2NlcHRzIGFycmF5ICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRzd2l0Y2godHlwZSkge1xuXHRjYXNlICdiNjQnOlxuXHRcdHJldHVybiB0aGlzLmI2NC50byhhcnJheSwgYnl0ZUNvZGluZyk7XG5cdGNhc2UgJ25vJzpcblx0ZGVmYXVsdDpcblx0XHRyZXR1cm4gdGhpcy5ub25lLnRvKGFycmF5KTtcblx0fVxufTtcblxuXG4vKiogQWRkIGJhc2U2NCBoYW5kbGVyIHRvIERpeWFTZWxlY3RvciAqKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIG5ldyBDb2RpbmdIYW5kbGVyKCk7XG59O1xuIl19
