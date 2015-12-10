!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.d1=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":2,"ieee754":3,"is-array":4}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiJdfQ==
},{"./support/isBuffer":6,"_process":5,"inherits":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== "undefined" ? window : self;

        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();

        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
            global.Q = previousQ;
            return this;
        };

    } else {
        throw new Error("This environment was not anticipated by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;
    // queue for late tasks, used by unhandled rejection tracking
    var laterQueue = [];

    function flush() {
        /* jshint loopfunc: true */
        var task, domain;

        while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }
            runSingle(task, domain);

        }
        while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task);
        }
        flushing = false;
    }
    // runs a single function in the async queue
    function runSingle(task, domain) {
        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process === "object" &&
        process.toString() === "[object process]" && process.nextTick) {
        // Ensure Q is in a real Node environment, with a `process.nextTick`.
        // To see through fake Node environments:
        // * Mocha test runner - exposes a `process` global without a `nextTick`
        // * Browserify - exposes a `process.nexTick` function that uses
        //   `setTimeout`. In this case `setImmediate` is preferred because
        //    it is faster. Browserify's `process.toString()` yields
        //   "[object Object]", while in a real Node environment
        //   `process.nextTick()` yields "[object process]".
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }
    // runs a task after all other tasks have been run
    // this is useful for unhandled rejection tracking that needs to happen
    // after all `then`d tasks have been run.
    nextTick.runAfter = function (task) {
        laterQueue.push(task);
        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };
    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function (resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function (answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var reportedUnhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }
    if (typeof process === "object" && typeof process.emit === "function") {
        Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
                process.emit("unhandledRejection", reason, promise);
                reportedUnhandledRejections.push(promise);
            }
        });
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        if (typeof process === "object" && typeof process.emit === "function") {
            Q.nextTick.runAfter(function () {
                var atReport = array_indexOf(reportedUnhandledRejections, promise);
                if (atReport !== -1) {
                    process.emit("rejectionHandled", unhandledReasons[at], promise);
                    reportedUnhandledRejections.splice(atReport, 1);
                }
            });
        }
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var pendingCount = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++pendingCount;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (pendingCount === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
    if (promises.length === 0) {
        return Q.resolve();
    }

    var deferred = Q.defer();
    var pendingCount = 0;
    array_reduce(promises, function (prev, current, index) {
        var promise = promises[index];

        pendingCount++;

        when(promise, onFulfilled, onRejected, onProgress);
        function onFulfilled(result) {
            deferred.resolve(result);
        }
        function onRejected() {
            pendingCount--;
            if (pendingCount === 0) {
                deferred.reject(new Error(
                    "Can't get fulfillment value from any promise, all " +
                    "promises were rejected."
                ));
            }
        }
        function onProgress(progress) {
            deferred.notify({
                index: index,
                value: progress
            });
        }
    }, undefined);

    return deferred.promise;
}

Promise.prototype.any = function () {
    return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

Q.noConflict = function() {
    throw new Error("Q.noConflict only works when Q is used as a global");
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,require('_process'))
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9xL3EuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdmltOnRzPTQ6c3RzPTQ6c3c9NDpcbi8qIVxuICpcbiAqIENvcHlyaWdodCAyMDA5LTIwMTIgS3JpcyBLb3dhbCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIE1JVFxuICogbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9yYXcvbWFzdGVyL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gUHJlZmVyIHdpbmRvdyBvdmVyIHNlbGYgZm9yIGFkZC1vbiBzY3JpcHRzLiBVc2Ugc2VsZiBmb3JcbiAgICAgICAgLy8gbm9uLXdpbmRvd2VkIGNvbnRleHRzLlxuICAgICAgICB2YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHNlbGY7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBgd2luZG93YCBvYmplY3QsIHNhdmUgdGhlIHByZXZpb3VzIFEgZ2xvYmFsXG4gICAgICAgIC8vIGFuZCBpbml0aWFsaXplIFEgYXMgYSBnbG9iYWwuXG4gICAgICAgIHZhciBwcmV2aW91c1EgPSBnbG9iYWwuUTtcbiAgICAgICAgZ2xvYmFsLlEgPSBkZWZpbml0aW9uKCk7XG5cbiAgICAgICAgLy8gQWRkIGEgbm9Db25mbGljdCBmdW5jdGlvbiBzbyBRIGNhbiBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICAgIC8vIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGdsb2JhbC5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBnbG9iYWwuUSA9IHByZXZpb3VzUTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBlbnZpcm9ubWVudCB3YXMgbm90IGFudGljaXBhdGVkIGJ5IFEuIFBsZWFzZSBmaWxlIGEgYnVnLlwiKTtcbiAgICB9XG5cbn0pKGZ1bmN0aW9uICgpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XG50cnkge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xufSBjYXRjaCAoZSkge1xuICAgIGhhc1N0YWNrcyA9ICEhZS5zdGFjaztcbn1cblxuLy8gQWxsIGNvZGUgYWZ0ZXIgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzIHJlcG9ydGVkXG4vLyBieSBRLlxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xudmFyIHFGaWxlTmFtZTtcblxuLy8gc2hpbXNcblxuLy8gdXNlZCBmb3IgZmFsbGJhY2sgaW4gXCJhbGxSZXNvbHZlZFwiXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG52YXIgbmV4dFRpY2sgPShmdW5jdGlvbiAoKSB7XG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGFza3MgKHNpbmdsZSwgd2l0aCBoZWFkIG5vZGUpXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbiAgICB2YXIgdGFpbCA9IGhlYWQ7XG4gICAgdmFyIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xuICAgIHZhciBpc05vZGVKUyA9IGZhbHNlO1xuICAgIC8vIHF1ZXVlIGZvciBsYXRlIHRhc2tzLCB1c2VkIGJ5IHVuaGFuZGxlZCByZWplY3Rpb24gdHJhY2tpbmdcbiAgICB2YXIgbGF0ZXJRdWV1ZSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuICAgICAgICB2YXIgdGFzaywgZG9tYWluO1xuXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICAgICAgaGVhZC50YXNrID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluID0gaGVhZC5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pO1xuXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGxhdGVyUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXNrID0gbGF0ZXJRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrKTtcbiAgICAgICAgfVxuICAgICAgICBmbHVzaGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBydW5zIGEgc2luZ2xlIGZ1bmN0aW9uIGluIHRoZSBhc3luYyBxdWV1ZVxuICAgIGZ1bmN0aW9uIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5leHRUaWNrID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgICAgICBkb21haW46IGlzTm9kZUpTICYmIHByb2Nlc3MuZG9tYWluLFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIHByb2Nlc3MudG9TdHJpbmcoKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgICAgICAvLyBFbnN1cmUgUSBpcyBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudCwgd2l0aCBhIGBwcm9jZXNzLm5leHRUaWNrYC5cbiAgICAgICAgLy8gVG8gc2VlIHRocm91Z2ggZmFrZSBOb2RlIGVudmlyb25tZW50czpcbiAgICAgICAgLy8gKiBNb2NoYSB0ZXN0IHJ1bm5lciAtIGV4cG9zZXMgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgXG4gICAgICAgIC8vICogQnJvd3NlcmlmeSAtIGV4cG9zZXMgYSBgcHJvY2Vzcy5uZXhUaWNrYCBmdW5jdGlvbiB0aGF0IHVzZXNcbiAgICAgICAgLy8gICBgc2V0VGltZW91dGAuIEluIHRoaXMgY2FzZSBgc2V0SW1tZWRpYXRlYCBpcyBwcmVmZXJyZWQgYmVjYXVzZVxuICAgICAgICAvLyAgICBpdCBpcyBmYXN0ZXIuIEJyb3dzZXJpZnkncyBgcHJvY2Vzcy50b1N0cmluZygpYCB5aWVsZHNcbiAgICAgICAgLy8gICBcIltvYmplY3QgT2JqZWN0XVwiLCB3aGlsZSBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudFxuICAgICAgICAvLyAgIGBwcm9jZXNzLm5leHRUaWNrKClgIHlpZWxkcyBcIltvYmplY3QgcHJvY2Vzc11cIi5cbiAgICAgICAgaXNOb2RlSlMgPSB0cnVlO1xuXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ub25ibG9ja2luZy5pby8yMDExLzA2L3dpbmRvd25leHR0aWNrLmh0bWxcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIFZlcnNpb24gNi4wLjUgKDg1MzYuMzAuMSkgaW50ZXJtaXR0ZW50bHkgY2Fubm90IGNyZWF0ZVxuICAgICAgICAvLyB3b3JraW5nIG1lc3NhZ2UgcG9ydHMgdGhlIGZpcnN0IHRpbWUgYSBwYWdlIGxvYWRzLlxuICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gcmVxdWVzdFBvcnRUaWNrO1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXF1ZXN0UG9ydFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBPcGVyYSByZXF1aXJlcyB1cyB0byBwcm92aWRlIGEgbWVzc2FnZSBwYXlsb2FkLCByZWdhcmRsZXNzIG9mXG4gICAgICAgICAgICAvLyB3aGV0aGVyIHdlIHVzZSBpdC5cbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICByZXF1ZXN0UG9ydFRpY2soKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG9sZCBicm93c2Vyc1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBydW5zIGEgdGFzayBhZnRlciBhbGwgb3RoZXIgdGFza3MgaGF2ZSBiZWVuIHJ1blxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGZvciB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nIHRoYXQgbmVlZHMgdG8gaGFwcGVuXG4gICAgLy8gYWZ0ZXIgYWxsIGB0aGVuYGQgdGFza3MgaGF2ZSBiZWVuIHJ1bi5cbiAgICBuZXh0VGljay5ydW5BZnRlciA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIGxhdGVyUXVldWUucHVzaCh0YXNrKTtcbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5leHRUaWNrO1xufSkoKTtcblxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxuLy8gbW9kaWZpY2F0aW9ucy5cbi8vIFRoZXJlIGlzIG5vIHNpdHVhdGlvbiB3aGVyZSB0aGlzIGlzIG5lY2Vzc2FyeS5cbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXG4vLyBkZWVwbHkgZnJvemVuIGFueXdheSwgYW5kIGlmIHlvdSBkb27igJl0IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsXG4vLyB0aGlzIGlzIGp1c3QgcGxhaW4gcGFyYW5vaWQuXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXG4vLyB0aGUgbWluaWZpZWQgY29kZSBieSByZWR1Y2luZyB4LmNhbGwoKSB0byBtZXJlbHkgeCgpXG4vLyBTZWUgTWFyayBNaWxsZXLigJlzIGV4cGxhbmF0aW9uIG9mIHdoYXQgdGhpcyBkb2VzLlxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGw7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGwuYXBwbHkoZiwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuLy8gVGhpcyBpcyBlcXVpdmFsZW50LCBidXQgc2xvd2VyOlxuLy8gdW5jdXJyeVRoaXMgPSBGdW5jdGlvbl9iaW5kLmJpbmQoRnVuY3Rpb25fYmluZC5jYWxsKTtcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXG5cbnZhciBhcnJheV9zbGljZSA9IHVuY3VycnlUaGlzKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG5cbnZhciBhcnJheV9yZWR1Y2UgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAvLyBjb25jZXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlLCBpZiBvbmUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBzZWVrIHRvIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXksIGFjY291bnRpbmdcbiAgICAgICAgICAgIC8vIGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCBpcyBpcyBhIHNwYXJzZSBhcnJheVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2lzID0gdGhpc1tpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkdWNlXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxuICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrKGJhc2lzLCB0aGlzW2luZGV4XSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBub3QgYSB2ZXJ5IGdvb2Qgc2hpbSwgYnV0IGdvb2QgZW5vdWdoIGZvciBvdXIgb25lIHVzZSBvZiBpdFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcCB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHNlbGYsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgY29sbGVjdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBpbmRleCwgc2VsZikpO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICByZXR1cm4gY29sbGVjdDtcbiAgICB9XG4pO1xuXG52YXIgb2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICByZXR1cm4gbmV3IFR5cGUoKTtcbn07XG5cbnZhciBvYmplY3RfaGFzT3duUHJvcGVydHkgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgb2JqZWN0X3RvU3RyaW5nID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBPYmplY3QodmFsdWUpO1xufVxuXG4vLyBnZW5lcmF0b3IgcmVsYXRlZCBzaGltc1xuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuZnVuY3Rpb24gaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikge1xuICAgIHJldHVybiAoXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxuICAgICAgICBleGNlcHRpb24gaW5zdGFuY2VvZiBRUmV0dXJuVmFsdWVcbiAgICApO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaGVscGVyIGFuZCBRLnJldHVybiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpblxuLy8gU3BpZGVyTW9ua2V5LlxudmFyIFFSZXR1cm5WYWx1ZTtcbmlmICh0eXBlb2YgUmV0dXJuVmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcbn0gZWxzZSB7XG4gICAgUVJldHVyblZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrICYmXG4gICAgICAgIGVycm9yLnN0YWNrLmluZGV4T2YoU1RBQ0tfSlVNUF9TRVBBUkFUT1IpID09PSAtMVxuICAgICkge1xuICAgICAgICB2YXIgc3RhY2tzID0gW107XG4gICAgICAgIGZvciAodmFyIHAgPSBwcm9taXNlOyAhIXA7IHAgPSBwLnNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHAuc3RhY2spIHtcbiAgICAgICAgICAgICAgICBzdGFja3MudW5zaGlmdChwLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGFja3MudW5zaGlmdChlcnJvci5zdGFjayk7XG5cbiAgICAgICAgdmFyIGNvbmNhdGVkU3RhY2tzID0gc3RhY2tzLmpvaW4oXCJcXG5cIiArIFNUQUNLX0pVTVBfU0VQQVJBVE9SICsgXCJcXG5cIik7XG4gICAgICAgIGVycm9yLnN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVyU3RhY2tTdHJpbmcoc3RhY2tTdHJpbmcpIHtcbiAgICB2YXIgbGluZXMgPSBzdGFja1N0cmluZy5zcGxpdChcIlxcblwiKTtcbiAgICB2YXIgZGVzaXJlZExpbmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2ldO1xuXG4gICAgICAgIGlmICghaXNJbnRlcm5hbEZyYW1lKGxpbmUpICYmICFpc05vZGVGcmFtZShsaW5lKSAmJiBsaW5lKSB7XG4gICAgICAgICAgICBkZXNpcmVkTGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzaXJlZExpbmVzLmpvaW4oXCJcXG5cIik7XG59XG5cbmZ1bmN0aW9uIGlzTm9kZUZyYW1lKHN0YWNrTGluZSkge1xuICAgIHJldHVybiBzdGFja0xpbmUuaW5kZXhPZihcIihtb2R1bGUuanM6XCIpICE9PSAtMSB8fFxuICAgICAgICAgICBzdGFja0xpbmUuaW5kZXhPZihcIihub2RlLmpzOlwiKSAhPT0gLTE7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpIHtcbiAgICAvLyBOYW1lZCBmdW5jdGlvbnM6IFwiYXQgZnVuY3Rpb25OYW1lIChmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlcilcIlxuICAgIC8vIEluIElFMTAgZnVuY3Rpb24gbmFtZSBjYW4gaGF2ZSBzcGFjZXMgKFwiQW5vbnltb3VzIGZ1bmN0aW9uXCIpIE9fb1xuICAgIHZhciBhdHRlbXB0MSA9IC9hdCAuKyBcXCgoLispOihcXGQrKTooPzpcXGQrKVxcKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDEpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MVsxXSwgTnVtYmVyKGF0dGVtcHQxWzJdKV07XG4gICAgfVxuXG4gICAgLy8gQW5vbnltb3VzIGZ1bmN0aW9uczogXCJhdCBmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQyID0gL2F0IChbXiBdKyk6KFxcZCspOig/OlxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mikge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQyWzFdLCBOdW1iZXIoYXR0ZW1wdDJbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBGaXJlZm94IHN0eWxlOiBcImZ1bmN0aW9uQGZpbGVuYW1lOmxpbmVOdW1iZXIgb3IgQGZpbGVuYW1lOmxpbmVOdW1iZXJcIlxuICAgIHZhciBhdHRlbXB0MyA9IC8uKkAoLispOihcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDMpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0M1sxXSwgTnVtYmVyKGF0dGVtcHQzWzJdKV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0ludGVybmFsRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgdmFyIGZpbGVOYW1lQW5kTGluZU51bWJlciA9IGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpO1xuXG4gICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBmaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICB2YXIgbGluZU51bWJlciA9IGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcblxuICAgIHJldHVybiBmaWxlTmFtZSA9PT0gcUZpbGVOYW1lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPj0gcVN0YXJ0aW5nTGluZSAmJlxuICAgICAgICBsaW5lTnVtYmVyIDw9IHFFbmRpbmdMaW5lO1xufVxuXG4vLyBkaXNjb3ZlciBvd24gZmlsZSBuYW1lIGFuZCBsaW5lIG51bWJlciByYW5nZSBmb3IgZmlsdGVyaW5nIHN0YWNrXG4vLyB0cmFjZXNcbmZ1bmN0aW9uIGNhcHR1cmVMaW5lKCkge1xuICAgIGlmICghaGFzU3RhY2tzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHZhciBsaW5lcyA9IGUuc3RhY2suc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIHZhciBmaXJzdExpbmUgPSBsaW5lc1swXS5pbmRleE9mKFwiQFwiKSA+IDAgPyBsaW5lc1sxXSA6IGxpbmVzWzJdO1xuICAgICAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKGZpcnN0TGluZSk7XG4gICAgICAgIGlmICghZmlsZU5hbWVBbmRMaW5lTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBxRmlsZU5hbWUgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMF07XG4gICAgICAgIHJldHVybiBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZXByZWNhdGUoY2FsbGJhY2ssIG5hbWUsIGFsdGVybmF0aXZlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICB0eXBlb2YgY29uc29sZS53YXJuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihuYW1lICsgXCIgaXMgZGVwcmVjYXRlZCwgdXNlIFwiICsgYWx0ZXJuYXRpdmUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGluc3RlYWQuXCIsIG5ldyBFcnJvcihcIlwiKS5zdGFjayk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8vIGVuZCBvZiBzaGltc1xuLy8gYmVnaW5uaW5nIG9mIHJlYWwgd29ya1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLCBwYXNzZXMgcHJvbWlzZXMgdGhyb3VnaCwgb3JcbiAqIGNvZXJjZXMgcHJvbWlzZXMgZnJvbSBkaWZmZXJlbnQgc3lzdGVtcy5cbiAqIEBwYXJhbSB2YWx1ZSBpbW1lZGlhdGUgcmVmZXJlbmNlIG9yIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gUSh2YWx1ZSkge1xuICAgIC8vIElmIHRoZSBvYmplY3QgaXMgYWxyZWFkeSBhIFByb21pc2UsIHJldHVybiBpdCBkaXJlY3RseS4gIFRoaXMgZW5hYmxlc1xuICAgIC8vIHRoZSByZXNvbHZlIGZ1bmN0aW9uIHRvIGJvdGggYmUgdXNlZCB0byBjcmVhdGVkIHJlZmVyZW5jZXMgZnJvbSBvYmplY3RzLFxuICAgIC8vIGJ1dCB0byB0b2xlcmFibHkgY29lcmNlIG5vbi1wcm9taXNlcyB0byBwcm9taXNlcy5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvLyBhc3NpbWlsYXRlIHRoZW5hYmxlc1xuICAgIGlmIChpc1Byb21pc2VBbGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvZXJjZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGwodmFsdWUpO1xuICAgIH1cbn1cblEucmVzb2x2ZSA9IFE7XG5cbi8qKlxuICogUGVyZm9ybXMgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm4gb2YgdGhlIGV2ZW50IGxvb3AuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0YXNrXG4gKi9cblEubmV4dFRpY2sgPSBuZXh0VGljaztcblxuLyoqXG4gKiBDb250cm9scyB3aGV0aGVyIG9yIG5vdCBsb25nIHN0YWNrIHRyYWNlcyB3aWxsIGJlIG9uXG4gKi9cblEubG9uZ1N0YWNrU3VwcG9ydCA9IGZhbHNlO1xuXG4vLyBlbmFibGUgbG9uZyBzdGFja3MgaWYgUV9ERUJVRyBpcyBzZXRcbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LlFfREVCVUcpIHtcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fSBvYmplY3QuXG4gKlxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcbiAqIHByb21pc2UuIFRvIGZ1bGZpbGwgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhbnkgdmFsdWUgdGhhdCBpc1xuICogbm90IGEgdGhlbmFibGUuIFRvIHJlamVjdCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGEgcmVqZWN0ZWRcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxuICogcHJvbWlzZSB0byBhbm90aGVyIHRoZW5hYmxlLCB0aHVzIHB1dHRpbmcgaXQgaW4gdGhlIHNhbWUgc3RhdGUsIGludm9rZVxuICogYHJlc29sdmVgIHdpdGggdGhhdCBvdGhlciB0aGVuYWJsZS5cbiAqL1xuUS5kZWZlciA9IGRlZmVyO1xuZnVuY3Rpb24gZGVmZXIoKSB7XG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxuICAgIC8vIGJlZW4gcmVzb2x2ZWQuICBJZiBpdCBpcyBcInVuZGVmaW5lZFwiLCBpdCBoYXMgYmVlbiByZXNvbHZlZC4gIEVhY2hcbiAgICAvLyBlbGVtZW50IG9mIHRoZSBtZXNzYWdlcyBhcnJheSBpcyBpdHNlbGYgYW4gYXJyYXkgb2YgY29tcGxldGUgYXJndW1lbnRzIHRvXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXG4gICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgYHJlc29sdmVgIGZ1bmN0aW9uIGJlY2F1c2UgaXQgaGFuZGxlcyBib3RoIGZ1bGx5XG4gICAgLy8gbm9uLXRoZW5hYmxlIHZhbHVlcyBhbmQgb3RoZXIgdGhlbmFibGVzIGdyYWNlZnVsbHkuXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9IG9iamVjdF9jcmVhdGUoZGVmZXIucHJvdG90eXBlKTtcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIG9wZXJhbmRzKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChvcGVyYW5kc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTk9URTogd2UgZG8gdGhlIGNoZWNrcyBmb3IgYHJlc29sdmVkUHJvbWlzZWAgaW4gZWFjaCBtZXRob2QsIGluc3RlYWQgb2ZcbiAgICAvLyBjb25zb2xpZGF0aW5nIHRoZW0gaW50byBgYmVjb21lYCwgc2luY2Ugb3RoZXJ3aXNlIHdlJ2QgY3JlYXRlIG5ld1xuICAgIC8vIHByb21pc2VzIHdpdGggdGhlIGxpbmVzIGBiZWNvbWUod2hhdGV2ZXIodmFsdWUpKWAuIFNlZSBlLmcuIEdILTI1Mi5cblxuICAgIGZ1bmN0aW9uIGJlY29tZShuZXdQcm9taXNlKSB7XG4gICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5ld1Byb21pc2U7XG4gICAgICAgIHByb21pc2Uuc291cmNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBhcnJheV9yZWR1Y2UobWVzc2FnZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ld1Byb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KG5ld1Byb21pc2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG5cbiAgICAgICAgbWVzc2FnZXMgPSB2b2lkIDA7XG4gICAgICAgIHByb2dyZXNzTGlzdGVuZXJzID0gdm9pZCAwO1xuICAgIH1cblxuICAgIGRlZmVycmVkLnByb21pc2UgPSBwcm9taXNlO1xuICAgIGRlZmVycmVkLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKFEodmFsdWUpKTtcbiAgICB9O1xuXG4gICAgZGVmZXJyZWQuZnVsZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUoZnVsZmlsbCh2YWx1ZSkpO1xuICAgIH07XG4gICAgZGVmZXJyZWQucmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUocmVqZWN0KHJlYXNvbikpO1xuICAgIH07XG4gICAgZGVmZXJyZWQubm90aWZ5ID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9ncmVzc0xpc3RlbmVycywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvZ3Jlc3NMaXN0ZW5lcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcihwcm9ncmVzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdm9pZCAwKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlZmVycmVkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBOb2RlLXN0eWxlIGNhbGxiYWNrIHRoYXQgd2lsbCByZXNvbHZlIG9yIHJlamVjdCB0aGUgZGVmZXJyZWRcbiAqIHByb21pc2UuXG4gKiBAcmV0dXJucyBhIG5vZGViYWNrXG4gKi9cbmRlZmVyLnByb3RvdHlwZS5tYWtlTm9kZVJlc29sdmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVycm9yLCB2YWx1ZSkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNlbGYucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG4vKipcbiAqIEBwYXJhbSByZXNvbHZlciB7RnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIG5vdGhpbmcgYW5kIGFjY2VwdHNcbiAqIHRoZSByZXNvbHZlLCByZWplY3QsIGFuZCBub3RpZnkgZnVuY3Rpb25zIGZvciBhIGRlZmVycmVkLlxuICogQHJldHVybnMgYSBwcm9taXNlIHRoYXQgbWF5IGJlIHJlc29sdmVkIHdpdGggdGhlIGdpdmVuIHJlc29sdmUgYW5kIHJlamVjdFxuICogZnVuY3Rpb25zLCBvciByZWplY3RlZCBieSBhIHRocm93biBleGNlcHRpb24gaW4gcmVzb2x2ZXJcbiAqL1xuUS5Qcm9taXNlID0gcHJvbWlzZTsgLy8gRVM2XG5RLnByb21pc2UgPSBwcm9taXNlO1xuZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlcikge1xuICAgIGlmICh0eXBlb2YgcmVzb2x2ZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVzb2x2ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QsIGRlZmVycmVkLm5vdGlmeSk7XG4gICAgfSBjYXRjaCAocmVhc29uKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxucHJvbWlzZS5yYWNlID0gcmFjZTsgLy8gRVM2XG5wcm9taXNlLmFsbCA9IGFsbDsgLy8gRVM2XG5wcm9taXNlLnJlamVjdCA9IHJlamVjdDsgLy8gRVM2XG5wcm9taXNlLnJlc29sdmUgPSBROyAvLyBFUzZcblxuLy8gWFhYIGV4cGVyaW1lbnRhbC4gIFRoaXMgbWV0aG9kIGlzIGEgd2F5IHRvIGRlbm90ZSB0aGF0IGEgbG9jYWwgdmFsdWUgaXNcbi8vIHNlcmlhbGl6YWJsZSBhbmQgc2hvdWxkIGJlIGltbWVkaWF0ZWx5IGRpc3BhdGNoZWQgdG8gYSByZW1vdGUgdXBvbiByZXF1ZXN0LFxuLy8gaW5zdGVhZCBvZiBwYXNzaW5nIGEgcmVmZXJlbmNlLlxuUS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSWYgdHdvIHByb21pc2VzIGV2ZW50dWFsbHkgZnVsZmlsbCB0byB0aGUgc2FtZSB2YWx1ZSwgcHJvbWlzZXMgdGhhdCB2YWx1ZSxcbiAqIGJ1dCBvdGhlcndpc2UgcmVqZWN0cy5cbiAqIEBwYXJhbSB4IHtBbnkqfVxuICogQHBhcmFtIHkge0FueSp9XG4gKiBAcmV0dXJucyB7QW55Kn0gYSBwcm9taXNlIGZvciB4IGFuZCB5IGlmIHRoZXkgYXJlIHRoZSBzYW1lLCBidXQgYSByZWplY3Rpb25cbiAqIG90aGVyd2lzZS5cbiAqXG4gKi9cblEuam9pbiA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgcmV0dXJuIFEoeCkuam9pbih5KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHJldHVybiBRKFt0aGlzLCB0aGF0XSkuc3ByZWFkKGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIGlmICh4ID09PSB5KSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBcIj09PVwiIHNob3VsZCBiZSBPYmplY3QuaXMgb3IgZXF1aXZcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXG4gKiBAcGFyYW0gYW5zd2VycyB7QXJyYXlbQW55Kl19IHByb21pc2VzIHRvIHJhY2VcbiAqIEByZXR1cm5zIHtBbnkqfSB0aGUgZmlyc3QgcHJvbWlzZSB0byBiZSBzZXR0bGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBTd2l0Y2ggdG8gdGhpcyBvbmNlIHdlIGNhbiBhc3N1bWUgYXQgbGVhc3QgRVM1XG4gICAgICAgIC8vIGFuc3dlclBzLmZvckVhY2goZnVuY3Rpb24gKGFuc3dlclApIHtcbiAgICAgICAgLy8gICAgIFEoYW5zd2VyUCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gVXNlIHRoaXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhbnN3ZXJQcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgUShhbnN3ZXJQc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnJhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihRLnJhY2UpO1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgUHJvbWlzZSB3aXRoIGEgcHJvbWlzZSBkZXNjcmlwdG9yIG9iamVjdCBhbmQgb3B0aW9uYWwgZmFsbGJhY2tcbiAqIGZ1bmN0aW9uLiAgVGhlIGRlc2NyaXB0b3IgY29udGFpbnMgbWV0aG9kcyBsaWtlIHdoZW4ocmVqZWN0ZWQpLCBnZXQobmFtZSksXG4gKiBzZXQobmFtZSwgdmFsdWUpLCBwb3N0KG5hbWUsIGFyZ3MpLCBhbmQgZGVsZXRlKG5hbWUpLCB3aGljaCBhbGxcbiAqIHJldHVybiBlaXRoZXIgYSB2YWx1ZSwgYSBwcm9taXNlIGZvciBhIHZhbHVlLCBvciBhIHJlamVjdGlvbi4gIFRoZSBmYWxsYmFja1xuICogYWNjZXB0cyB0aGUgb3BlcmF0aW9uIG5hbWUsIGEgcmVzb2x2ZXIsIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHMgdGhhdCB3b3VsZFxuICogaGF2ZSBiZWVuIGZvcndhcmRlZCB0byB0aGUgYXBwcm9wcmlhdGUgbWV0aG9kIGFib3ZlIGhhZCBhIG1ldGhvZCBiZWVuXG4gKiBwcm92aWRlZCB3aXRoIHRoZSBwcm9wZXIgbmFtZS4gIFRoZSBBUEkgbWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCB0aGUgbmF0dXJlXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LCBhcGFydCBmcm9tIHRoYXQgaXQgaXMgdXNhYmxlIHdoZXJlZXZlciBwcm9taXNlcyBhcmVcbiAqIGJvdWdodCBhbmQgc29sZC5cbiAqL1xuUS5tYWtlUHJvbWlzZSA9IFByb21pc2U7XG5mdW5jdGlvbiBQcm9taXNlKGRlc2NyaXB0b3IsIGZhbGxiYWNrLCBpbnNwZWN0KSB7XG4gICAgaWYgKGZhbGxiYWNrID09PSB2b2lkIDApIHtcbiAgICAgICAgZmFsbGJhY2sgPSBmdW5jdGlvbiAob3ApIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiUHJvbWlzZSBkb2VzIG5vdCBzdXBwb3J0IG9wZXJhdGlvbjogXCIgKyBvcFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChpbnNwZWN0ID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7c3RhdGU6IFwidW5rbm93blwifTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdG9yW29wXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRlc2NyaXB0b3Jbb3BdLmFwcGx5KHByb21pc2UsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFjay5jYWxsKHByb21pc2UsIG9wLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGluc3BlY3Q7XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZCBgdmFsdWVPZmAgYW5kIGBleGNlcHRpb25gIHN1cHBvcnRcbiAgICBpZiAoaW5zcGVjdCkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgIHByb21pc2UuZXhjZXB0aW9uID0gaW5zcGVjdGVkLnJlYXNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInBlbmRpbmdcIiB8fFxuICAgICAgICAgICAgICAgIGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IFByb21pc2VdXCI7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgZG9uZSA9IGZhbHNlOyAgIC8vIGVuc3VyZSB0aGUgdW50cnVzdGVkIHByb21pc2UgbWFrZXMgYXQgbW9zdCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2FsbCB0byBvbmUgb2YgdGhlIGNhbGxiYWNrc1xuXG4gICAgZnVuY3Rpb24gX2Z1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmdWxmaWxsZWQgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bGZpbGxlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0ZWQoZXhjZXB0aW9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGV4Y2VwdGlvbiwgc2VsZik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3RlZChleGNlcHRpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAobmV3RXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXdFeGNlcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHJvZ3Jlc3NlZCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHByb2dyZXNzZWQgPT09IFwiZnVuY3Rpb25cIiA/IHByb2dyZXNzZWQodmFsdWUpIDogdmFsdWU7XG4gICAgfVxuXG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfZnVsZmlsbGVkKHZhbHVlKSk7XG4gICAgICAgIH0sIFwid2hlblwiLCBbZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfcmVqZWN0ZWQoZXhjZXB0aW9uKSk7XG4gICAgICAgIH1dKTtcbiAgICB9KTtcblxuICAgIC8vIFByb2dyZXNzIHByb3BhZ2F0b3IgbmVlZCB0byBiZSBhdHRhY2hlZCBpbiB0aGUgY3VycmVudCB0aWNrLlxuICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKHZvaWQgMCwgXCJ3aGVuXCIsIFt2b2lkIDAsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbmV3VmFsdWU7XG4gICAgICAgIHZhciB0aHJldyA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBfcHJvZ3Jlc3NlZCh2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocmV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRocmV3KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5RLnRhcCA9IGZ1bmN0aW9uIChwcm9taXNlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRhcChjYWxsYmFjayk7XG59O1xuXG4vKipcbiAqIFdvcmtzIGFsbW9zdCBsaWtlIFwiZmluYWxseVwiLCBidXQgbm90IGNhbGxlZCBmb3IgcmVqZWN0aW9ucy5cbiAqIE9yaWdpbmFsIHJlc29sdXRpb24gdmFsdWUgaXMgcGFzc2VkIHRocm91Z2ggY2FsbGJhY2sgdW5hZmZlY3RlZC5cbiAqIENhbGxiYWNrIG1heSByZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBhd2FpdGVkIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7US5Qcm9taXNlfVxuICogQGV4YW1wbGVcbiAqIGRvU29tZXRoaW5nKClcbiAqICAgLnRoZW4oLi4uKVxuICogICAudGFwKGNvbnNvbGUubG9nKVxuICogICAudGhlbiguLi4pO1xuICovXG5Qcm9taXNlLnByb3RvdHlwZS50YXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKHZhbHVlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBvYnNlcnZlciBvbiBhIHByb21pc2UuXG4gKlxuICogR3VhcmFudGVlczpcbiAqXG4gKiAxLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxuICogMi4gdGhhdCBlaXRoZXIgdGhlIGZ1bGZpbGxlZCBjYWxsYmFjayBvciB0aGUgcmVqZWN0ZWQgY2FsbGJhY2sgd2lsbCBiZVxuICogICAgY2FsbGVkLCBidXQgbm90IGJvdGguXG4gKiAzLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBub3QgYmUgY2FsbGVkIGluIHRoaXMgdHVybi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgdG8gb2JzZXJ2ZVxuICogQHBhcmFtIGZ1bGZpbGxlZCAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHJlamVjdGVkICAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIHJlamVjdGlvbiBleGNlcHRpb25cbiAqIEBwYXJhbSBwcm9ncmVzc2VkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGludm9rZWQgY2FsbGJhY2tcbiAqL1xuUS53aGVuID0gd2hlbjtcbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbHVlOyB9KTtcbn07XG5cblEudGhlblJlc29sdmUgPSBmdW5jdGlvbiAocHJvbWlzZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyB0aHJvdyByZWFzb247IH0pO1xufTtcblxuUS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHByb21pc2UsIHJlYXNvbikge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZWplY3QocmVhc29uKTtcbn07XG5cbi8qKlxuICogSWYgYW4gb2JqZWN0IGlzIG5vdCBhIHByb21pc2UsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlLlxuICogSWYgYSBwcm9taXNlIGlzIHJlamVjdGVkLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZSB0b28uXG4gKiBJZiBpdOKAmXMgYSBmdWxmaWxsZWQgcHJvbWlzZSwgdGhlIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5lYXJlci5cbiAqIElmIGl04oCZcyBhIGRlZmVycmVkIHByb21pc2UgYW5kIHRoZSBkZWZlcnJlZCBoYXMgYmVlbiByZXNvbHZlZCwgdGhlXG4gKiByZXNvbHV0aW9uIGlzIFwibmVhcmVyXCIuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBtb3N0IHJlc29sdmVkIChuZWFyZXN0KSBmb3JtIG9mIHRoZSBvYmplY3RcbiAqL1xuXG4vLyBYWFggc2hvdWxkIHdlIHJlLWRvIHRoaXM/XG5RLm5lYXJlciA9IG5lYXJlcjtcbmZ1bmN0aW9uIG5lYXJlcih2YWx1ZSkge1xuICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSB2YWx1ZS5pbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHByb21pc2UuXG4gKiBPdGhlcndpc2UgaXQgaXMgYSBmdWxmaWxsZWQgdmFsdWUuXG4gKi9cblEuaXNQcm9taXNlID0gaXNQcm9taXNlO1xuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlO1xufVxuXG5RLmlzUHJvbWlzZUFsaWtlID0gaXNQcm9taXNlQWxpa2U7XG5mdW5jdGlvbiBpc1Byb21pc2VBbGlrZShvYmplY3QpIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwZW5kaW5nIHByb21pc2UsIG1lYW5pbmcgbm90XG4gKiBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG4gKi9cblEuaXNQZW5kaW5nID0gaXNQZW5kaW5nO1xuZnVuY3Rpb24gaXNQZW5kaW5nKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNQZW5kaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHZhbHVlIG9yIGZ1bGZpbGxlZFxuICogcHJvbWlzZS5cbiAqL1xuUS5pc0Z1bGZpbGxlZCA9IGlzRnVsZmlsbGVkO1xuZnVuY3Rpb24gaXNGdWxmaWxsZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuICFpc1Byb21pc2Uob2JqZWN0KSB8fCBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHJlamVjdGVkIHByb21pc2UuXG4gKi9cblEuaXNSZWplY3RlZCA9IGlzUmVqZWN0ZWQ7XG5mdW5jdGlvbiBpc1JlamVjdGVkKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59O1xuXG4vLy8vIEJFR0lOIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcblxuLy8gVGhpcyBwcm9taXNlIGxpYnJhcnkgY29uc3VtZXMgZXhjZXB0aW9ucyB0aHJvd24gaW4gaGFuZGxlcnMgc28gdGhleSBjYW4gYmVcbi8vIGhhbmRsZWQgYnkgYSBzdWJzZXF1ZW50IHByb21pc2UuICBUaGUgZXhjZXB0aW9ucyBnZXQgYWRkZWQgdG8gdGhpcyBhcnJheSB3aGVuXG4vLyB0aGV5IGFyZSBjcmVhdGVkLCBhbmQgcmVtb3ZlZCB3aGVuIHRoZXkgYXJlIGhhbmRsZWQuICBOb3RlIHRoYXQgaW4gRVM2IG9yXG4vLyBzaGltbWVkIGVudmlyb25tZW50cywgdGhpcyB3b3VsZCBuYXR1cmFsbHkgYmUgYSBgU2V0YC5cbnZhciB1bmhhbmRsZWRSZWFzb25zID0gW107XG52YXIgdW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcbiAgICB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aCA9IDA7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5sZW5ndGggPSAwO1xuXG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrUmVqZWN0aW9uKHByb21pc2UsIHJlYXNvbikge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW1pdChcInVuaGFuZGxlZFJlamVjdGlvblwiLCByZWFzb24sIHByb21pc2UpO1xuICAgICAgICAgICAgICAgIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgaWYgKHJlYXNvbiAmJiB0eXBlb2YgcmVhc29uLnN0YWNrICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChyZWFzb24uc3RhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChcIihubyBzdGFjaykgXCIgKyByZWFzb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdCA9IGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgaWYgKGF0ICE9PSAtMSkge1xuICAgICAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXRSZXBvcnQgPSBhcnJheV9pbmRleE9mKHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGF0UmVwb3J0ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmVtaXQoXCJyZWplY3Rpb25IYW5kbGVkXCIsIHVuaGFuZGxlZFJlYXNvbnNbYXRdLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdFJlcG9ydCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vKipcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcbiAqIHRyYW5zZmVycmVkIGF3YXkgZnJvbSB0aGlzIHByb2Nlc3Mgb3ZlciBhbnkgcHJvbWlzZVxuICogY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgcHJvbWlzZSBhIHdyYXBwaW5nIG9mIHRoYXQgb2JqZWN0IHRoYXRcbiAqIGFkZGl0aW9uYWxseSByZXNwb25kcyB0byB0aGUgXCJpc0RlZlwiIG1lc3NhZ2VcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXG4gKi9cblEubWFzdGVyID0gbWFzdGVyO1xuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJpc0RlZlwiOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwcmVhZHMgdGhlIHZhbHVlcyBvZiBhIHByb21pc2VkIGFycmF5IG9mIGFyZ3VtZW50cyBpbnRvIHRoZVxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gZnVsZmlsbGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdmFyaWFkaWMgYXJndW1lbnRzIGZyb20gdGhlXG4gKiBwcm9taXNlZCBhcnJheVxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxuICogaXMgcmVqZWN0ZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb3IgdGhyb3duIGV4Y2VwdGlvbiBvZlxuICogZWl0aGVyIGNhbGxiYWNrLlxuICovXG5RLnNwcmVhZCA9IHNwcmVhZDtcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS5zcHJlYWQoZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcbiAgICB9LCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIFRoZSBhc3luYyBmdW5jdGlvbiBpcyBhIGRlY29yYXRvciBmb3IgZ2VuZXJhdG9yIGZ1bmN0aW9ucywgdHVybmluZ1xuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XG4gKiBvZiB0aGUgbmV3ZXN0IEVDTUFTY3JpcHQgNiBkcmFmdHMsIHRoaXMgY29kZSBkb2VzIG5vdCBjYXVzZSBzeW50YXhcbiAqIGVycm9ycyBpbiBvbGRlciBlbmdpbmVzLiAgVGhpcyBjb2RlIHNob3VsZCBjb250aW51ZSB0byB3b3JrIGFuZCB3aWxsXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cbiAqXG4gKiBFUzYgZ2VuZXJhdG9ycyBhcmUgY3VycmVudGx5IHBhcnQgb2YgVjggdmVyc2lvbiAzLjE5IHdpdGggdGhlXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cbiAqIGZvciBsb25nZXIsIGJ1dCB1bmRlciBhbiBvbGRlciBQeXRob24taW5zcGlyZWQgZm9ybS4gIFRoaXMgZnVuY3Rpb25cbiAqIHdvcmtzIG9uIGJvdGgga2luZHMgb2YgZ2VuZXJhdG9ycy5cbiAqXG4gKiBEZWNvcmF0ZXMgYSBnZW5lcmF0b3IgZnVuY3Rpb24gc3VjaCB0aGF0OlxuICogIC0gaXQgbWF5IHlpZWxkIHByb21pc2VzXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcbiAqICAtIHRoZSB2YWx1ZSBvZiB0aGUgeWllbGQgZXhwcmVzc2lvbiB3aWxsIGJlIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqICAtIGl0IHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlICh3aGVuIHRoZSBnZW5lcmF0b3JcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcbiAqICAtIHRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqICAgIG9mIHRoZSBnZW5lcmF0b3Igb3IgdGhlIGZpcnN0IHJlamVjdGVkIHByb21pc2UgYW1vbmcgdGhvc2VcbiAqICAgIHlpZWxkZWQuXG4gKiAgLSBpZiBhbiBlcnJvciBpcyB0aHJvd24gaW4gdGhlIGdlbmVyYXRvciwgaXQgcHJvcGFnYXRlcyB0aHJvdWdoXG4gKiAgICBldmVyeSBmb2xsb3dpbmcgeWllbGQgdW50aWwgaXQgaXMgY2F1Z2h0LCBvciB1bnRpbCBpdCBlc2NhcGVzXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxuICogICAgcmVqZWN0aW9uIGZvciB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZGVjb3JhdGVkIGdlbmVyYXRvci5cbiAqL1xuUS5hc3luYyA9IGFzeW5jO1xuZnVuY3Rpb24gYXN5bmMobWFrZUdlbmVyYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwidGhyb3dcIiwgYXJnIGlzIGFuIGV4Y2VwdGlvblxuICAgICAgICBmdW5jdGlvbiBjb250aW51ZXIodmVyYiwgYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAvLyBVbnRpbCBWOCAzLjE5IC8gQ2hyb21pdW0gMjkgaXMgcmVsZWFzZWQsIFNwaWRlck1vbmtleSBpcyB0aGUgb25seVxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIFNNJ3MgZ2VuZXJhdG9ycyB1c2UgdGhlIFB5dGhvbi1pbnNwaXJlZCBzZW1hbnRpY3Mgb2ZcbiAgICAgICAgICAgIC8vIG91dGRhdGVkIEVTNiBkcmFmdHMuICBXZSB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgRVM2LCBidXQgd2UnZCBhbHNvXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIHN1cHBvcnQgUHl0aG9uLXN0eWxlIGdlbmVyYXRvcnMuICBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmVcbiAgICAgICAgICAgIC8vIHRoaXMgYmxvY2suXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU3RvcEl0ZXJhdGlvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIC8vIEVTNiBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcGlkZXJNb25rZXkgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShleGNlcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdCwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBtYWtlR2VuZXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJuZXh0XCIpO1xuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XG4gKiBjYWxscyB0aGUgZ2VuZXJhdG9yIGFuZCBhbHNvIGVuZHMgdGhlIHByb21pc2UgY2hhaW4sIHNvIHRoYXQgYW55XG4gKiB1bmhhbmRsZWQgZXJyb3JzIGFyZSB0aHJvd24gaW5zdGVhZCBvZiBmb3J3YXJkZWQgdG8gdGhlIGVycm9yXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cbiAqIGdlbmVyYXRvcnMgYXQgdGhlIHRvcC1sZXZlbCB0byB3b3JrIHdpdGggbGlicmFyaWVzLlxuICovXG5RLnNwYXduID0gc3Bhd247XG5mdW5jdGlvbiBzcGF3bihtYWtlR2VuZXJhdG9yKSB7XG4gICAgUS5kb25lKFEuYXN5bmMobWFrZUdlbmVyYXRvcikoKSk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBpbnRlcmZhY2Ugb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuLyoqXG4gKiBUaHJvd3MgYSBSZXR1cm5WYWx1ZSBleGNlcHRpb24gdG8gc3RvcCBhbiBhc3luY2hyb25vdXMgZ2VuZXJhdG9yLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cbiAqIHZhbHVlcyBpbiBvbGRlciBGaXJlZm94L1NwaWRlck1vbmtleS4gIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBFUzZcbiAqIGdlbmVyYXRvcnMgbGlrZSBDaHJvbWl1bSAyOSwganVzdCB1c2UgXCJyZXR1cm5cIiBpbiB5b3VyIGdlbmVyYXRvclxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgc3Vycm91bmRpbmcgZ2VuZXJhdG9yXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyBFUzYgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcbiAqIH0pXG4gKiAvLyBPbGRlciBTcGlkZXJNb25rZXkgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xuICogfSlcbiAqL1xuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XG5mdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IFFSZXR1cm5WYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXG4gKiBhcmUgc2V0dGxlZCBhbmQgcGFzc2VkIGFzIHZhbHVlcyAoYHRoaXNgIGlzIGFsc28gc2V0dGxlZCBhbmQgcGFzc2VkXG4gKiBhcyBhIHZhbHVlKS4gIEl0IHdpbGwgYWxzbyBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0IG9mIGEgZnVuY3Rpb24gaXNcbiAqIGFsd2F5cyBhIHByb21pc2UuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XG4gKiAgICAgcmV0dXJuIGEgKyBiO1xuICogfSk7XG4gKiBhZGQoUShhKSwgUShCKSk7XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXG4gKi9cblEucHJvbWlzZWQgPSBwcm9taXNlZDtcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNwcmVhZChbdGhpcywgYWxsKGFyZ3VtZW50cyldLCBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cbiAqIEBwYXJhbSBvYmplY3QqIHRoZSByZWNpcGllbnRcbiAqIEBwYXJhbSBvcCB0aGUgbmFtZSBvZiB0aGUgbWVzc2FnZSBvcGVyYXRpb24sIGUuZy4sIFwid2hlblwiLFxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIHJlc3VsdCB7UHJvbWlzZX0gYSBwcm9taXNlIGZvciB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb25cbiAqL1xuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuZnVuY3Rpb24gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2gob3AsIGFyZ3MpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uIChvcCwgYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZ2V0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5RLmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSAgICAgbmV3IHZhbHVlIG9mIHByb3BlcnR5XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZGVsZXRlXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5kZWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxuICogICAgICAgICAgICAgICAgICBpbnZvY2F0aW9uIGFyZ3VtZW50cyBmb3IgcHJvbWlzZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICBhcmUgdWx0aW1hdGVseSBiYWNrZWQgd2l0aCBgcmVzb2x2ZWAgdmFsdWVzLFxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcbiAqICAgICAgICAgICAgICAgICAgd2hlcmVpbiB0aGUgcG9zdGVkIHZhbHVlIGNhbiBiZSBhbnlcbiAqICAgICAgICAgICAgICAgICAgSlNPTiBzZXJpYWxpemFibGUgb2JqZWN0LlxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cbi8vIGJvdW5kIGxvY2FsbHkgYmVjYXVzZSBpdCBpcyB1c2VkIGJ5IG90aGVyIG1ldGhvZHNcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgaW52b2NhdGlvbiBhcmd1bWVudHNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIGFyZ3MgICAgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYXBwbHkgPSBmdW5jdGlvbiAob2JqZWN0LCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUVtcInRyeVwiXSA9XG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cyldKTtcbn07XG5cbi8qKlxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXG4gKiBwcm9taXNlIGFuZCB0aHJvd24gZXJyb3JzIGludG8gYSByZWplY3RlZCBvbmUuXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZiaW5kID0gZnVuY3Rpb24gKG9iamVjdCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxuICogb2JqZWN0IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxuICovXG5RLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkuICBJZiBhbnkgb2ZcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqL1xuLy8gQnkgTWFyayBNaWxsZXJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxuUS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHZhciBwZW5kaW5nQ291bnQgPSAwO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc25hcHNob3Q7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXG4gICAgICAgICAgICAgICAgKHNuYXBzaG90ID0gcHJvbWlzZS5pbnNwZWN0KCkpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKytwZW5kaW5nQ291bnQ7XG4gICAgICAgICAgICAgICAgd2hlbihcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLXBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogcHJvZ3Jlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGwodGhpcyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2Ugb2YgYW4gYXJyYXkuIFByaW9yIHJlamVjdGVkIHByb21pc2VzIGFyZVxuICogaWdub3JlZC4gIFJlamVjdHMgb25seSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxuICogQHBhcmFtIHtBcnJheSp9IGFuIGFycmF5IGNvbnRhaW5pbmcgdmFsdWVzIG9yIHByb21pc2VzIGZvciB2YWx1ZXNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2UsXG4gKiBvciBhIHJlamVjdGVkIHByb21pc2UgaWYgYWxsIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAqL1xuUS5hbnkgPSBhbnk7XG5cbmZ1bmN0aW9uIGFueShwcm9taXNlcykge1xuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFEucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICB2YXIgcGVuZGluZ0NvdW50ID0gMDtcbiAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50LCBpbmRleCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VzW2luZGV4XTtcblxuICAgICAgICBwZW5kaW5nQ291bnQrKztcblxuICAgICAgICB3aGVuKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcbiAgICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQocmVzdWx0KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpIHtcbiAgICAgICAgICAgIHBlbmRpbmdDb3VudC0tO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIFwiQ2FuJ3QgZ2V0IGZ1bGZpbGxtZW50IHZhbHVlIGZyb20gYW55IHByb21pc2UsIGFsbCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwicHJvbWlzZXMgd2VyZSByZWplY3RlZC5cIlxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9ncmVzc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB1bmRlZmluZWQpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYW55KHRoaXMpO1xufTtcblxuLyoqXG4gKiBXYWl0cyBmb3IgYWxsIHByb21pc2VzIHRvIGJlIHNldHRsZWQsIGVpdGhlciBmdWxmaWxsZWQgb3JcbiAqIHJlamVjdGVkLiAgVGhpcyBpcyBkaXN0aW5jdCBmcm9tIGBhbGxgIHNpbmNlIHRoYXQgd291bGQgc3RvcFxuICogd2FpdGluZyBhdCB0aGUgZmlyc3QgcmVqZWN0aW9uLiAgVGhlIHByb21pc2UgcmV0dXJuZWQgYnlcbiAqIGBhbGxSZXNvbHZlZGAgd2lsbCBuZXZlciBiZSByZWplY3RlZC5cbiAqIEBwYXJhbSBwcm9taXNlcyBhIHByb21pc2UgZm9yIGFuIGFycmF5IChvciBhbiBhcnJheSkgb2YgcHJvbWlzZXNcbiAqIChvciB2YWx1ZXMpXG4gKiBAcmV0dXJuIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqL1xuUS5hbGxSZXNvbHZlZCA9IGRlcHJlY2F0ZShhbGxSZXNvbHZlZCwgXCJhbGxSZXNvbHZlZFwiLCBcImFsbFNldHRsZWRcIik7XG5mdW5jdGlvbiBhbGxSZXNvbHZlZChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcHJvbWlzZXMgPSBhcnJheV9tYXAocHJvbWlzZXMsIFEpO1xuICAgICAgICByZXR1cm4gd2hlbihhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdoZW4ocHJvbWlzZSwgbm9vcCwgbm9vcCk7XG4gICAgICAgIH0pKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VzO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsUmVzb2x2ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbFJlc29sdmVkKHRoaXMpO1xufTtcblxuLyoqXG4gKiBAc2VlIFByb21pc2UjYWxsU2V0dGxlZFxuICovXG5RLmFsbFNldHRsZWQgPSBhbGxTZXR0bGVkO1xuZnVuY3Rpb24gYWxsU2V0dGxlZChwcm9taXNlcykge1xuICAgIHJldHVybiBRKHByb21pc2VzKS5hbGxTZXR0bGVkKCk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gYXJyYXkgb2YgcHJvbWlzZXMgaW50byBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZWlyIHN0YXRlcyAoYXNcbiAqIHJldHVybmVkIGJ5IGBpbnNwZWN0YCkgd2hlbiB0aGV5IGhhdmUgYWxsIHNldHRsZWQuXG4gKiBAcGFyYW0ge0FycmF5W0FueSpdfSB2YWx1ZXMgYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMge0FycmF5W1N0YXRlXX0gYW4gYXJyYXkgb2Ygc3RhdGVzIGZvciB0aGUgcmVzcGVjdGl2ZSB2YWx1ZXMuXG4gKi9cblByb21pc2UucHJvdG90eXBlLmFsbFNldHRsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcmV0dXJuIGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gUShwcm9taXNlKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlZ2FyZGxlc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UuaW5zcGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZWdhcmRsZXNzLCByZWdhcmRsZXNzKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBDYXB0dXJlcyB0aGUgZmFpbHVyZSBvZiBhIHByb21pc2UsIGdpdmluZyBhbiBvcG9ydHVuaXR5IHRvIHJlY292ZXJcbiAqIHdpdGggYSBjYWxsYmFjay4gIElmIHRoZSBnaXZlbiBwcm9taXNlIGlzIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gKiBwcm9taXNlIGlzIGZ1bGZpbGxlZC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBmdWxmaWxsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlmIHRoZVxuICogZ2l2ZW4gcHJvbWlzZSBpcyByZWplY3RlZFxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBjYWxsYmFja1xuICovXG5RLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cbi8qKlxuICogQXR0YWNoZXMgYSBsaXN0ZW5lciB0aGF0IGNhbiByZXNwb25kIHRvIHByb2dyZXNzIG5vdGlmaWNhdGlvbnMgZnJvbSBhXG4gKiBwcm9taXNlJ3Mgb3JpZ2luYXRpbmcgZGVmZXJyZWQuIFRoaXMgbGlzdGVuZXIgcmVjZWl2ZXMgdGhlIGV4YWN0IGFyZ3VtZW50c1xuICogcGFzc2VkIHRvIGBgZGVmZXJyZWQubm90aWZ5YGAuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gcmVjZWl2ZSBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybnMgdGhlIGdpdmVuIHByb21pc2UsIHVuY2hhbmdlZFxuICovXG5RLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5mdW5jdGlvbiBwcm9ncmVzcyhvYmplY3QsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uIChwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIGFuIG9wcG9ydHVuaXR5IHRvIG9ic2VydmUgdGhlIHNldHRsaW5nIG9mIGEgcHJvbWlzZSxcbiAqIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgcHJvbWlzZSBpcyBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuICBGb3J3YXJkc1xuICogdGhlIHJlc29sdXRpb24gdG8gdGhlIHJldHVybmVkIHByb21pc2Ugd2hlbiB0aGUgY2FsbGJhY2sgaXMgZG9uZS5cbiAqIFRoZSBjYWxsYmFjayBjYW4gcmV0dXJuIGEgcHJvbWlzZSB0byBkZWZlciBjb21wbGV0aW9uLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBvYnNlcnZlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlblxuICogcHJvbWlzZSwgdGFrZXMgbm8gYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSB3aGVuXG4gKiBgYGZpbmBgIGlzIGRvbmUuXG4gKi9cblEuZmluID0gLy8gWFhYIGxlZ2FjeVxuUVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdClbXCJmaW5hbGx5XCJdKGNhbGxiYWNrKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZpbiA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gUShjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVE9ETyBhdHRlbXB0IHRvIHJlY3ljbGUgdGhlIHJlamVjdGlvbiB3aXRoIFwidGhpc1wiLlxuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRlcm1pbmF0ZXMgYSBjaGFpbiBvZiBwcm9taXNlcywgZm9yY2luZyByZWplY3Rpb25zIHRvIGJlXG4gKiB0aHJvd24gYXMgZXhjZXB0aW9ucy5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBhdCB0aGUgZW5kIG9mIGEgY2hhaW4gb2YgcHJvbWlzZXNcbiAqIEByZXR1cm5zIG5vdGhpbmdcbiAqL1xuUS5kb25lID0gZnVuY3Rpb24gKG9iamVjdCwgZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRvbmUoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xuICAgIHZhciBvblVuaGFuZGxlZEVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIC8vIGZvcndhcmQgdG8gYSBmdXR1cmUgdHVybiBzbyB0aGF0IGBgd2hlbmBgXG4gICAgICAgIC8vIGRvZXMgbm90IGNhdGNoIGl0IGFuZCB0dXJuIGl0IGludG8gYSByZWplY3Rpb24uXG4gICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGVycm9yLCBwcm9taXNlKTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEF2b2lkIHVubmVjZXNzYXJ5IGBuZXh0VGlja2BpbmcgdmlhIGFuIHVubmVjZXNzYXJ5IGB3aGVuYC5cbiAgICB2YXIgcHJvbWlzZSA9IGZ1bGZpbGxlZCB8fCByZWplY3RlZCB8fCBwcm9ncmVzcyA/XG4gICAgICAgIHRoaXMudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykgOlxuICAgICAgICB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MgJiYgcHJvY2Vzcy5kb21haW4pIHtcbiAgICAgICAgb25VbmhhbmRsZWRFcnJvciA9IHByb2Nlc3MuZG9tYWluLmJpbmQob25VbmhhbmRsZWRFcnJvcik7XG4gICAgfVxuXG4gICAgcHJvbWlzZS50aGVuKHZvaWQgMCwgb25VbmhhbmRsZWRFcnJvcik7XG59O1xuXG4vKipcbiAqIENhdXNlcyBhIHByb21pc2UgdG8gYmUgcmVqZWN0ZWQgaWYgaXQgZG9lcyBub3QgZ2V0IGZ1bGZpbGxlZCBiZWZvcmVcbiAqIHNvbWUgbWlsbGlzZWNvbmRzIHRpbWUgb3V0LlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzIHRpbWVvdXRcbiAqIEBwYXJhbSB7QW55Kn0gY3VzdG9tIGVycm9yIG1lc3NhZ2Ugb3IgRXJyb3Igb2JqZWN0IChvcHRpb25hbClcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgaWYgaXQgaXNcbiAqIGZ1bGZpbGxlZCBiZWZvcmUgdGhlIHRpbWVvdXQsIG90aGVyd2lzZSByZWplY3RlZC5cbiAqL1xuUS50aW1lb3V0ID0gZnVuY3Rpb24gKG9iamVjdCwgbXMsIGVycm9yKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aW1lb3V0KG1zLCBlcnJvcik7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24gKG1zLCBlcnJvcikge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWVycm9yIHx8IFwic3RyaW5nXCIgPT09IHR5cGVvZiBlcnJvcikge1xuICAgICAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoZXJyb3IgfHwgXCJUaW1lZCBvdXQgYWZ0ZXIgXCIgKyBtcyArIFwiIG1zXCIpO1xuICAgICAgICAgICAgZXJyb3IuY29kZSA9IFwiRVRJTUVET1VUXCI7XG4gICAgICAgIH1cbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICB9LCBtcyk7XG5cbiAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9LCBkZWZlcnJlZC5ub3RpZnkpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZ2l2ZW4gdmFsdWUgKG9yIHByb21pc2VkIHZhbHVlKSwgc29tZVxuICogbWlsbGlzZWNvbmRzIGFmdGVyIGl0IHJlc29sdmVkLiBQYXNzZXMgcmVqZWN0aW9ucyBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kc1xuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBhZnRlciBtaWxsaXNlY29uZHNcbiAqIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UuXG4gKiBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSByZWplY3RzLCB0aGF0IGlzIHBhc3NlZCBpbW1lZGlhdGVseS5cbiAqL1xuUS5kZWxheSA9IGZ1bmN0aW9uIChvYmplY3QsIHRpbWVvdXQpIHtcbiAgICBpZiAodGltZW91dCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBvYmplY3Q7XG4gICAgICAgIG9iamVjdCA9IHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kZWxheSh0aW1lb3V0KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gKHRpbWVvdXQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGFzIGFuIGFycmF5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKlxuICogICAgICBRLm5mYXBwbHkoRlMucmVhZEZpbGUsIFtfX2ZpbGVuYW1lXSlcbiAqICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqICAgICAgfSlcbiAqXG4gKi9cblEubmZhcHBseSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYXJncykge1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgaW5kaXZpZHVhbGx5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmNhbGwoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpXG4gKiAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogfSlcbiAqXG4gKi9cblEubmZjYWxsID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZjYWxsID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBXcmFwcyBhIE5vZGVKUyBjb250aW51YXRpb24gcGFzc2luZyBmdW5jdGlvbiBhbmQgcmV0dXJucyBhbiBlcXVpdmFsZW50XG4gKiB2ZXJzaW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmJpbmQoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpKFwidXRmLThcIilcbiAqIC50aGVuKGNvbnNvbGUubG9nKVxuICogLmRvbmUoKVxuICovXG5RLm5mYmluZCA9XG5RLmRlbm9kZWlmeSA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIFEoY2FsbGJhY2spLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZiaW5kID1cblByb21pc2UucHJvdG90eXBlLmRlbm9kZWlmeSA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEuZGVub2RlaWZ5LmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG5RLm5iaW5kID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzcCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXNwLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIFEoYm91bmQpLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmJpbmQgPSBmdW5jdGlvbiAoLyp0aGlzcCwgLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDApO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5uYmluZC5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrIHdpdGggYSBnaXZlbiBhcnJheSBvZiBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZCBjYWxsYmFjay5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrXG4gKiB3aWxsIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLm5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkubnBvc3QobmFtZSwgYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLm5wb3N0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzIHx8IFtdKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2ssIGZvcndhcmRpbmcgdGhlIGdpdmVuIHZhcmlhZGljIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkXG4gKiBjYWxsYmFjayBhcmd1bWVudC5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSAuLi5hcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFjayB3aWxsXG4gKiBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblEubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUS5uaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5Qcm9taXNlLnByb3RvdHlwZS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5Qcm9taXNlLnByb3RvdHlwZS5uaW52b2tlID0gZnVuY3Rpb24gKG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogSWYgYSBmdW5jdGlvbiB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgYm90aCBOb2RlIGNvbnRpbnVhdGlvbi1wYXNzaW5nLXN0eWxlIGFuZFxuICogcHJvbWlzZS1yZXR1cm5pbmctc3R5bGUsIGl0IGNhbiBlbmQgaXRzIGludGVybmFsIHByb21pc2UgY2hhaW4gd2l0aFxuICogYG5vZGVpZnkobm9kZWJhY2spYCwgZm9yd2FyZGluZyB0aGUgb3B0aW9uYWwgbm9kZWJhY2sgYXJndW1lbnQuICBJZiB0aGUgdXNlclxuICogZWxlY3RzIHRvIHVzZSBhIG5vZGViYWNrLCB0aGUgcmVzdWx0IHdpbGwgYmUgc2VudCB0aGVyZS4gIElmIHRoZXkgZG8gbm90XG4gKiBwYXNzIGEgbm9kZWJhY2ssIHRoZXkgd2lsbCByZWNlaXZlIHRoZSByZXN1bHQgcHJvbWlzZS5cbiAqIEBwYXJhbSBvYmplY3QgYSByZXN1bHQgKG9yIGEgcHJvbWlzZSBmb3IgYSByZXN1bHQpXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBub2RlYmFjayBhIE5vZGUuanMtc3R5bGUgY2FsbGJhY2tcbiAqIEByZXR1cm5zIGVpdGhlciB0aGUgcHJvbWlzZSBvciBub3RoaW5nXG4gKi9cblEubm9kZWlmeSA9IG5vZGVpZnk7XG5mdW5jdGlvbiBub2RlaWZ5KG9iamVjdCwgbm9kZWJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5vZGVpZnkobm9kZWJhY2spO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKG5vZGViYWNrKSB7XG4gICAgaWYgKG5vZGViYWNrKSB7XG4gICAgICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5vZGViYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5vZGViYWNrKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59O1xuXG5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJRLm5vQ29uZmxpY3Qgb25seSB3b3JrcyB3aGVuIFEgaXMgdXNlZCBhcyBhIGdsb2JhbFwiKTtcbn07XG5cbi8vIEFsbCBjb2RlIGJlZm9yZSB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMuXG52YXIgcUVuZGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xuXG5yZXR1cm4gUTtcblxufSk7XG4iXX0=
},{"_process":5}],11:[function(require,module,exports){
var Q = require('q');
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
		this._socket = new WSocket(addr);
	} catch(e) {
		Logger.error(e.stack);
		return that.close();
	}

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
};
inherits(SocketHandler, EventEmitter);

SocketHandler.prototype.close = function() {
	if(this._disconnectionDeferred && this._disconnectionDeferred.promise) return this._disconnectionDeferred.promise;
	this._disconnectionDeferred = Q.defer();
	this._status = 'closing';
	this._socket.close();
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
	} catch(err){ Logger.error("[WS] cannot parse message, dropping..."); }
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
		token: params.token,
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

},{"inherits":8,"node-event-emitter":9,"q":10}],12:[function(require,module,exports){
var Q = require('q');
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var connection = new DiyaNode();
var connectionEvents = new EventEmitter();
var token = null;
var _user = null;
var _pass = null;


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
	token = null;
	return connection.disconnect();
};

d1.isConnected = function() {	return connection.isConnected();};
d1.peers = function() { return connection.peers();};
d1.self = function() { return connection.self(); };
d1.addr = function() { return connection.addr(); };
d1.user = function() { return _user; };
d1.pass = function() { return _pass; };
d1.isAuthenticated = function() {return token != null; }


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


/** Shorthand function to connect and login with the given (user,password) */
d1.connectAsUser = function(ip, user, password, WSocket) {
	return d1.connect(ip, WSocket).then(function(){
		return d1("#self").auth(user, password);
	});
}

d1.deauthenticate = function(){ 	token = null;};
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
				if(data && data.authenticated && data.token){
					token = data.token;
					_user = "#DiyaNode#"+peerId;
					deferred.resolve();
				} else deferred.reject('AccessDenied');
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
		params.token = token;

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

		if(!err && data && data.authenticated && data.token){
			token = data.token;
			_user = user;
			_pass = password;
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.resolve();
		} else {
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
	params.token = token;
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

},{"./DiyaNode":11,"inherits":8,"node-event-emitter":9,"q":10}],13:[function(require,module,exports){
var d1 = require('./DiyaSelector.js');

require('./services/timer/timer.js');
require('./services/rtc/rtc.js');
require('./services/explorer/explorer.js');
require('./services/pico/pico.js');
require('./services/viewer_explorer/viewer_explorer.js');
require('./services/ieq/ieq.js');
require('./services/networkId/NetworkId.js');
require('./services/maps/maps.js');
require('./services/peerAuth/PeerAuth.js');
require('./services/meshNetwork/MeshNetwork.js');
require('./services/verbose/Verbose.js');
require('./utils/encoding/encoding.js');
require('./services/status/status.js');

module.exports = d1;

},{"./DiyaSelector.js":12,"./services/explorer/explorer.js":14,"./services/ieq/ieq.js":15,"./services/maps/maps.js":16,"./services/meshNetwork/MeshNetwork.js":17,"./services/networkId/NetworkId.js":19,"./services/peerAuth/PeerAuth.js":20,"./services/pico/pico.js":21,"./services/rtc/rtc.js":22,"./services/status/status.js":23,"./services/timer/timer.js":24,"./services/verbose/Verbose.js":25,"./services/viewer_explorer/viewer_explorer.js":26,"./utils/encoding/encoding.js":27}],14:[function(require,module,exports){
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
DiyaSelector = require('../../DiyaSelector').DiyaSelector;

function explorer(node){
	var that = this;
	this.node = node;
	return this;
}

DiyaSelector.prototype.listFiles = function(file, callback){	//add a path in data to list files in THIS path
	this.request({
		service: 'explorer',
		func: 'ListFiles',
		 data: {elt: file}
	}, function(peerId, err, data){
     		
			if(data){
				callback(peerId, null, data);
			}
			else if(err){
				callback(peerId, err, null);
			}
		});
		return this;
};

DiyaSelector.prototype.openFile = function(file, type, callback){
		this.request({
			service: 'explorer',
			func: 'OpenFile',
			data:{
				file: file,
				type: type
			}
		}, function(peerId, err, data){
			callback(peerId, null, data);
		});

		return this;
};



var exp = {
		explorer: explorer
}

module.exports = exp;

},{"../../DiyaSelector":12}],15:[function(require,module,exports){
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
		//Logger.log(JSON.stringify(that.dataModel));
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
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
IEQ.prototype._getDataModelFromRecv = function(data){
	var dataModel=null;
	
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
				/* update data range */
				dataModel[n].range=data[n].range;
				/* update data range */
				dataModel[n].timeRange=data[n].timeRange;
				/* update data label */
				dataModel[n].label=data[n].label;
				/* update data unit */
				dataModel[n].unit=data[n].unit;
				/* update data indexRange */
				dataModel[n].qualityConfig={
					/* confortRange: data[n].confortRange, */
					indexRange: data[n].indexRange
				};
				dataModel[n].data = this._coder.from(data[n].data,'b64',4);
				dataModel[n].time = this._coder.from(data[n].time,'b64',8);
				dataModel[n].qualityIndex = this._coder.from(data[n].index,'b64',4);
				dataModel[n].robotId = this._coder.from(data[n].robotId,'b64',4);
				dataModel[n].placeId = this._coder.from(data[n].placeId,'b64',4);
			}
		}
	}
	else {
		Logger.error("No Data to read or header is missing !");
	}
	this.dataModel=dataModel;
	return dataModel;
};

/** create IEQ service **/
DiyaSelector.prototype.IEQ = function(){
	return new IEQ(this);
};

},{"../../DiyaSelector":12,"../message":18,"util":7}],16:[function(require,module,exports){
EventEmitter = require('node-event-emitter');

/**
 * Constructor
 *
 * @param map {String} map's name
 */
function Maps(peerIds) {


	this._peerIds = peerIds;
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
		func: 'ListenMap',
		obj: this._peerIds 
	}, function(peerId, err, data) {
		if (err || data.error) {
			console.log("Maps: fail to get info from map, error:", err || data.error, "!"); // mostly PeerDisconnected

			// remove that peer
			//that.removePeer(peerId);//...
			return;
		}

		if (data == null) return ;

		peerId = data.peerId;

		if(!peerId){
			console.log("Maps: received info without a peerId");       
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
			console.log("Maps: bug: existed subscription ??")
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
	this._diyas = {};// delete ?
	this._peerIds.forEach(function(peerId) {
		that.emit("peer-unsubscribed", peerId);
	});
	this.removeAllListeners();
}

/**
 * save map
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param map_info {Object} ({rotate, scale, translate})
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.saveMap = function (peerId, map_info, cb) {
	var _map_info = Object.create(map_info); // create a duplicate of map_info
	var that = this;
	// save map's info
	_map_info.scale = Array.isArray(_map_info.scale) ? _map_info.scale[0] : _map_info.scale

	if (this.mapIsModified(peerId, _map_info)) {
		d1("#self").request({
			service: 'maps',
			func: 'UpdateMap',
			obj: [ peerId ],
			data: {
				scale: _map_info.scale,
				tx: _map_info.translate[0],
				ty: _map_info.translate[1],
				rotate: _map_info.rotate,
				ratio: _map_info.ratio
			}
		}, function(peerId, err, data) {
			if (err != null) {
				that._diyas[peerId].path.scale = _map_info.scale;
				that._diyas[peerId].path.rotate = _map_info.rotate;
				that._diyas[peerId].path.translate[0] = _map_info.translate[0];
				that._diyas[peerId].path.translate[1] = _map_info.translate[1];
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
Maps.prototype.savePlace = function (peerId, place_info, cb) {
	// save map's info
	var that = this;
	var error = "";

	var _place_info = Object.create(place_info);

	// save place
	if (this.placeIsModified(peerId, _place_info)) {
		d1("#self").request({
			service: 'maps',
			func: 'UpdatePlace',
			obj: [ peerId ],
			data: {
				neuronId: _place_info.id,
				x: _place_info.x,
				y: _place_info.y
			}
		}, function(peerId, err, data) {
			if (err != null) {
				that._diyas[peerId].places[_place_info.id].x = _place_info.x;
				that._diyas[peerId].places[_place_info.id].y = _place_info.y;
			}
			if (cb) cb(err);
		});
	} else {
		if (cb) cb(new Error("No change to place n°" + _place_info.id + "!"));
	}
}

/**
 * delete every saved places of Diya (choosen in selector)
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.clearPlaces = function(peerId, cb) {
	var that = this;

	d1("#self").request({
		service: 'maps',
		func: 'ClearMap',
		obj: [ peerId ]
	}, function(peerId, err, data) {
		if (err != null) {
			// delete from internal list
			that._diyas[peerId].places = {};
		}
		if (cb) cb(err);
	});
}

// export it as module of DiyaSelector
DiyaSelector.prototype.maps = function(peerIds) {
	var maps = new Maps(peerIds);

	return maps;
}

},{"node-event-emitter":9}],17:[function(require,module,exports){
var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');
var Q = require('q');


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
	d1(/.*/).subscribe({ service: 'meshNetwork', func: 'SubscribeMeshNetwork' }, callback, {auto: true});
};

},{"../../DiyaSelector":12,"q":10}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
var DiyaSelector = require('../../DiyaSelector').DiyaSelector;



DiyaSelector.prototype.ip = function(iface, callback){
	return this.request({
		service: 'networkId',
		func: 'GetLocalIP',
		data: {
			iface: iface
		}
	}, function(peerId, err, data){
		callback(peerId, (!err && data && data.address) ? data.address : null);
	});
};

},{"../../DiyaSelector":12}],20:[function(require,module,exports){
var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');
var Q = require('q');

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

},{"../../DiyaSelector":12,"q":10}],21:[function(require,module,exports){
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

DiaSelector = require('../../DiyaSelector').DiyaSelector;

function pico(node){
	var that = this;
	this.node = node;
	return this;
}

//

DiyaSelector.prototype.power = function(){

	this.request({
		service: 'pico',
		func: 'Power'
	}, function(peerId, err, data){
		/*if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);*/

	});
}

DiyaSelector.prototype.zoom = function(callback){

	this.request({
		service: 'pico',
		func: 'Zoom'
	}, function(data){
		/*if(data.pico)
			callback(null,data.pico);
		if(data.error)
			callback(data.error,null);*/

	});
}


DiyaSelector.prototype.back = function(callback){

	this.request({
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


DiyaSelector.prototype.up = function(callback){

	this.request({
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


DiyaSelector.prototype.left = function(callback){

	this.request({
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


DiyaSelector.prototype.ok = function(callback){

	this.request({
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


DiyaSelector.prototype.right = function(callback){

	this.request({
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


DiyaSelector.prototype.down = function(callback){

	this.request({
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

DiyaSelector.prototype.prev = function(callback){

	this.request({
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

DiyaSelector.prototype.play = function(callback){

	this.request({
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
DiyaSelector.prototype.next = function(callback){

	this.request({
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

DiyaSelector.prototype.lumiDown = function(callback){

	this.request({
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

DiyaSelector.prototype.lumiUp = function(callback){

	this.request({
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

DiyaSelector.prototype.volumeDown = function(callback){

	this.request({
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


DiyaSelector.prototype.mute = function(callback){

	this.request({
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

DiyaSelector.prototype.volumeUp = function(callback){

	this.request({
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

DiyaSelector.prototype.display = function(callback){

	this.request({
		service: 'pico',
		func: 'Display',
		// data: req
	}, function(data){

	});
}



var exp = {
		pico: pico
}

module.exports = exp;

},{"../../DiyaSelector":12}],22:[function(require,module,exports){
DiyaSelector = require('../../DiyaSelector').DiyaSelector;
EventEmitter = require('node-event-emitter');
inherits = require('inherits');


if(typeof window !== 'undefined'){
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
}


function Channel(dnId, name, open_cb){
	EventEmitter.call(this);
	this.name = name;
	this.dnId = dnId;

	this.frequency = 20;

	this.channel = undefined;
	this.onopen = open_cb;
	this.closed = false;
}
inherits(Channel, EventEmitter);

Channel.prototype.setChannel = function(datachannel){
	var that = this;
	this.channel = datachannel;
	this.channel.binaryType = 'arraybuffer';
	this._negociate();

};

Channel.prototype.close = function(){
	this.closed = true;
};

Channel.prototype.write = function(index, value){
	if(index < 0 || index > this.size || isNaN(value)) return false;
	this._buffer[index] = value;
	this._requestSend();
	return true;
};

Channel.prototype.writeAll = function(values){
	if(!Array.isArray(values) || values.length !== this.size)
        return false;

    for (var i = 0; i<values.length; i++){
        if(isNaN(values[i])) return false;
        this._buffer[i] = values[i];
    }
    this._requestSend();
};

Channel.prototype._requestSend = function(){
	var that = this;

	var elapsedTime = new Date().getTime() - this._lastSendTimestamp;
	var period = 1000 / this.frequency;
	if(elapsedTime >= period){
		doSend();
	}else if(!this._sendRequested){
		this._sendRequested = true;
		setTimeout(doSend, period - elapsedTime);
	}

	function doSend(){
		that._sendRequested = false;
		that._lastSendTimestamp = new Date().getTime();
		var ret = that._send(that._buffer);
		//If autosend is set, automatically send buffer at the given frequency
		if(ret && that.autosend) that._requestSend();
	}
};

Channel.prototype._send = function(msg){
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
};

Channel.prototype._negociate = function(){
	var that = this;

	this.channel.onmessage = function(message){
		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if(typeChar === 'O'){
			//Input
			that.type = 'input'; //Promethe Output = Client Input
		}else if(typeChar === 'I'){
			//Output
			that.type = 'output'; //Promethe Input = Client Output
		}else{
			//Error
		}

		var size = view.getInt32(1,true);
		if(size != undefined){
			that.size = size;
			that._buffer = new Float32Array(size);
		}else{
			//error
		}

		that.channel.onmessage = that._onMessage.bind(that);

		that.channel.onclose = that._onClose.bind(that);

		if(typeof that.onopen === 'function') that.onopen(that.dnId, that);

		console.log('channel '+that.name+' negociated !')
	}
};

Channel.prototype._onMessage = function(message){
	var valArray = new Float32Array(message.data);
	this.emit('value', valArray);
};

Channel.prototype._onClose = function(){
	console.log('channel '+this.name+' closed !');
	this.emit('close');
};


//////////////////////////////////////////////////////////////////
///////////////////// RTC Peer implementation ////////////////////
//////////////////////////////////////////////////////////////////


function Peer(dnId, rtc, id, channels){
	this.dn = d1(dnId);
	this.dnId = dnId;
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

	this.subscription = this.dn.subscribe({
		service: 'rtc',
		func: 'Connect',
		obj: this.channels,
		data: {
			promID: this.id
		}
	},
	function(diya, err, data){
		if(data) that._handleNegociationMessage(data);
	});

	setTimeout(function(){
		if(!that.connected && !that.closed){
			that._reconnect();
		}
	}, 10000);
};

Peer.prototype._reconnect = function(){
	this.close();

	this.peer = null;
	this.connected = false;
	this.closed = false;

	this._connect();
};


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

	var peer = new RTCPeerConnection(servers,  {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});
	this.peer = peer;

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
	function(err){
		console.log("RTC: cannot create answer :");
		console.log(err);
	},
	{'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true}});

	peer.oniceconnectionstatechange = function(){
		console.log('RTC: state change('+that.id+':'+that.dnId+') : '+peer.iceConnectionState);
		if(peer.iceConnectionState === 'connected'){
			that.connected = true;
			if(that.subscription) that.subscription.close();
		}
		else if(peer.iceConnectionState === 'disconnected'){
			if(!that.closed) that._reconnect();
		}
	};

	peer.onicecandidate = function(evt){
		console.log("local candidate : ");
		console.log(evt.candidate);
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
};


Peer.prototype._addRemoteICECandidate = function(data){
	var that = this;
	
	console.log("remote candidate : ");
	console.log(data.candidate);

	try{
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate, function(){
			console.log("RTC: candidate added("+that.id+":"+that.dnId+") : "+that.peer.iceConnectionState);
		},function(err){
			console.error("RTC: cannot add RemoteICECandidate :");
			console.error(err);
		});
	}catch(err){
		console.error("RTC: cannot add RemoteICECandidate : ");
		console.error(err);
	}
};

Peer.prototype.close = function(){
	if(this.subscription) this.subscription.close();
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
}


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

RTC.prototype.use = function(name_regex, onopen_callback){
	this.requestedChannels.push({regex: name_regex, cb: onopen_callback});
	return this;
};

RTC.prototype.connect = function(){
	var that = this;

	this.subscription = this.selector.subscribe({
		service: 'rtc',
		func: 'ListenPeers'
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
				}
			}
			else if(data.eventType === 'PeerClosed'){
				if(that[dnId].peers[data.promID]){
					that._closePeer(dnId, data.promID);
					if(typeof that.onclose === 'function') that.onclose(dnId);
				}
			}

		}

	}, {auto: true});

	return this;
};

RTC.prototype._createDiyaNode = function(dnId){
	var that = this;

	this[dnId] = {
		dnId: dnId,
		usedChannels: [],
		requestedChannels: [],
		peers: []
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

RTC.prototype._matchChannels = function(dnId, receivedChannels){
	var that = this;

	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];

		for(var j = 0; j < that[dnId].requestedChannels.length; j++){
			var req = that[dnId].requestedChannels[j];

			if(name && name.match(req.regex) && !that[dnId].usedChannels[name]){
				that[dnId].usedChannels[name] = new Channel(dnId, name, req.cb);
				channels.push(name);
			}
		}
	}

	return  channels;
};


RTC.prototype._onDataChannel = function(dnId, datachannel){
	var channel = this[dnId].usedChannels[datachannel.label];

	if(!channel){
		console.log("Channel "+datachannel.label+" unmatched, closing !");
		datachannel.close();
		return ;
	}
	console.log("Channel "+datachannel.label+" created !");

	channel.setChannel(datachannel);
};



DiyaSelector.prototype.rtc = function(domNode, selectedNodes){
	var rtc = new RTC(this);

	if(domNode){
		createNeuronsFromDOM(domNode, selectedNodes, rtc);
	}

	return rtc;
};

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

function createNeuronsFromDOM(domNode, selectedNodes, rtc){
	if(!domNode || !domNode.querySelectorAll) return ;


	//Retrieve all tags which name starts with "neuron-"
	var neuronNodeList = domNode.querySelectorAll('*');
	var neuronNodes = [];
	for(var i=0;i<neuronNodeList.length; i++){
		if(isNeuronTag(neuronNodeList[i])){
			neuronNodes.push(neuronNodeList[i]);
			if(Array.isArray(selectedNodes)) selectedNodes.push(neuronNodeList[i]);
		}
	}

	//for each tag that has a name attribute, create a neuron associated with it
	neuronNodes.forEach(function(neuronNode){

		var channel = getChannel(neuronNode.attributes["name"].value);

		rtc.use(channel, function(dnId, neuron){
			neuronNode.setNeuron(dnId, neuron);
		});

	});

}


function isNeuronTag(node){
	return node.tagName.startsWith("NEURON-") &&
		node.attributes["name"] &&
		(typeof node.setNeuron === 'function');
}

function getChannel(name){
	return name.replace(/\s+/, "");
}

},{"../../DiyaSelector":12,"inherits":8,"node-event-emitter":9}],23:[function(require,module,exports){
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
Status.prototype.subscribe = function(robotNames, callback){
	var that = this;
	console.log(robotNames);
	this.selector.subscribe({
		service: 'status',
		func: 'ListenUpdates',
		data: robotNames
	}, function (peerId, err, data) {
		// console.log(peerId);
		// console.log(err);
		// console.log(data);
		if (err || (data&&data.err&data.err.st) ) {
			Logger.error( "StatusSubscribe:"+(err?err:"")+"\n"+(data&&data.err?data.err:"") );
		} else {
			if(data && data.header && data.header.reqConfig
			   && data.header.reqConfig.type === "init") {
				// initialisation of robot model
				that.robotModelInit = true;
			}
			if(that.robotModelInit) {
				that._getRobotModelFromRecv(data.robots);
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
			Logger.error("No parts to read for robot "+data[n].robot.name);
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

},{"../../DiyaSelector":12,"../message":18,"util":7}],24:[function(require,module,exports){
DiyaSelector = require('../../DiyaSelector').DiyaSelector;

DiyaSelector.prototype.time = function(loop, callback){
	if(loop){
		this.subscribe({
			service: 'timer',
			func: 'SubscribeTimer',
		}, callback, {auto: true});
	}else{
		this.request({
			service: 'timer',
			func: 'GetTime',
		}, callback);
	}
	return this;
};

},{"../../DiyaSelector":12}],25:[function(require,module,exports){
var util = require('util');
var d1 = require('../../DiyaSelector');


d1.verbose = function(bVerbose) {
  if(typeof bVerbose === 'undefined') bVerbose = true;
  var options = {subIds: []};
  if(bVerbose) {
    d1("#self").subscribe({
      service: 'maps',
      func: 'ListenMap',
      obj: [ this._map ]
    }, function(peerId, err, data) {
      if(err) console.log("[ERR] " + err);
      else console.log(data);
    }, options);
    _verbose_subIds = options.subIds;
  }
  else {
    d1("#self").unsubscribe(_verbose_subIds);
  }
}
var _verbose_subIds = [];

},{"../../DiyaSelector":12,"util":7}],26:[function(require,module,exports){
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
DiyaSelector = require('../../DiyaSelector').DiyaSelector;

function explorer(node){
	var that = this;
	this.node = node;
	return this;
}


DiyaSelector.prototype.listenViewers = function(callback){
		this.subscribe({
			service: 'explorer',
			func: 'ListenViewers',
			// data: { file: file}

		}, function(peerId, err, data){
			callback(peerId, null, data);
		});

		return this;
};

},{"../../DiyaSelector":12}],27:[function(require,module,exports){
(function (Buffer){
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

	/* write all samples in Buffer */
	var buf = new Buffer(array.length*byteCoding),i;
	switch(byteCoding) {
	case 4:
		for(i = 0; i < array.length; i++) {
			if(typeof array[i] !== 'number')
				return null;
			buf.writeFloatLE(array[i], i * byteCoding);
		}
		break;
	case 8:
		for(i = 0; i < array.length; i++) {
			if(typeof array[i] !== 'number')
				return null;
			buf.writeDoubleLE(array[i], i * byteCoding);
		}
		break;
	}

	/* convert Buffer to base64 string */
	var b64Buff = buf.toString('base64'); 
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


}).call(this,require("buffer").Buffer)
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9lbmNvZGluZy9lbmNvZGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiLyogbWF5YS1jbGllbnRcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqXHQzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjaGFubmVsIGVuY29kaW5nXG4gKiAtIGJhc2U2NCBjb2RpbmdcbiAqIC0gbm9uZVxuICogRGF0YSBmb3JtYXQgOiBcbiAqXHRcdHQ6IHsnYjY0Jywnbm9uZSd9XG4gKlx0XHRiOiA8aWYgYjY0PiB7NCw4fVxuICpcdFx0ZDogZW5jb2RlZCBkYXRhIHtidWZmZXIgb3IgQXJyYXl9XG4gKlx0XHRzOiBzaXplXG4gKi9cblxuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xuXG5cbi8qKlxuICogRGVmYXVsdCA6IG5vIGVuY29kaW5nXG4gKiBFZmZlY3RpdmUgZm9yIHN0cmluZyBiYXNlZCBjaGFubmVscyAobGlrZSBKU09OIGJhc2VkIFdTKVxuICogKi9cbmZ1bmN0aW9uIE5vQ29kaW5nKCl7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIENvbnZlcnQgYnVmZmVyIGNvZGVkIGluIGJhc2U2NCBhbmQgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5XG4qIGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBhcnJheVxuKiBAcGFyYW0gYnVmZmVyIGluIGJhc2U2NFxuKiBAcGFyYW0gYnl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggbnVtYmVyICg0IG9yIDgpXG4qIEByZXR1cm4gYXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0KS4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5Ob0NvZGluZy5wcm90b3R5cGUuZnJvbSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0cmV0dXJuIGRhdGEuZDtcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGFycmF5IGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieSBieXRlQ29kaW5nIGJ5dGVzIGludG8gYnVmZmVyIGNvZGVkIGluIGJhc2U2NFxuKiBAcGFyYW0gXHR7QXJyYXk8RmxvYXQ+fSBcdGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCBiaXRzKVxuKiBAcGFyYW0gXHR7aW50ZWdlcn0gXHRieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBmbG9hdCAoNCBvciA4KVxuKiBAcmV0dXJuICBcdHtTdHJpbmd9IFx0YnVmZmVyIGluIGJhc2U2NC4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5Ob0NvZGluZy5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihhcnJheSkge1xuXHRyZXR1cm4ge1xuXHRcdHQ6ICdubycsIC8qIHR5cGUgKi9cblx0XHRkOiBhcnJheSwgLyogZGF0YSAqL1xuXHRcdHM6IGFycmF5Lmxlbmd0aFxuXHR9O1xufTtcblxuXG5cblxuLyoqXG4gKiBNYW5hZ2VtZW50IG9mIGJhc2U2NCBlbmNvZGluZ1xuICogRWZmZWN0aXZlIGZvciBzdHJpbmcgYmFzZWQgY2hhbm5lbHMgKGxpa2UgSlNPTiBiYXNlZCBXUylcbiAqICovXG5mdW5jdGlvbiBCYXNlNjRDb2RpbmcoKXtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8gICAgVXRpbGl0eSBmdW5jdGlvbnMgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vKlxcXG4gfCp8XG4gfCp8ICB1dGlsaXRhaXJlcyBkZSBtYW5pcHVsYXRpb25zIGRlIGNoYcOubmVzIGJhc2UgNjQgLyBiaW5haXJlcyAvIFVURi04XG4gfCp8XG4gfCp8ICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL0TDqWNvZGVyX2VuY29kZXJfZW5fYmFzZTY0XG4gfCp8XG4gXFwqL1xuLyoqIERlY29kZXIgdW4gdGFibGVhdSBkJ29jdGV0cyBkZXB1aXMgdW5lIGNoYcOubmUgZW4gYmFzZTY0ICovXG52YXIgYjY0VG9VaW50NiA9IGZ1bmN0aW9uKG5DaHIpIHtcblx0cmV0dXJuIG5DaHIgPiA2NCAmJiBuQ2hyIDwgOTEgP1xuXHRcdG5DaHIgLSA2NVxuXHRcdDogbkNociA+IDk2ICYmIG5DaHIgPCAxMjMgP1xuXHRcdG5DaHIgLSA3MVxuXHRcdDogbkNociA+IDQ3ICYmIG5DaHIgPCA1OCA/XG5cdFx0bkNociArIDRcblx0XHQ6IG5DaHIgPT09IDQzID9cblx0XHQ2MlxuXHRcdDogbkNociA9PT0gNDcgP1xuXHRcdDYzXG5cdFx0Olx0MDtcbn07XG5cbi8qKlxuICogRGVjb2RlIGJhc2U2NCBzdHJpbmcgdG8gVUludDhBcnJheVxuICogQHBhcmFtICB7U3RyaW5nfSBzQmFzZTY0XHRcdGJhc2U2NCBjb2RlZCBzdHJpbmdcbiAqIEBwYXJhbSAge2ludH0gbkJsb2Nrc1NpemUgc2l6ZSBvZiBibG9ja3Mgb2YgYnl0ZXMgdG8gYmUgcmVhZC4gT3V0cHV0IGJ5dGVBcnJheSBsZW5ndGggd2lsbCBiZSBhIG11bHRpcGxlIG9mIHRoaXMgdmFsdWUuXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fVx0XHRcdFx0dGFiIG9mIGRlY29kZWQgYnl0ZXNcbiAqL1xudmFyIGJhc2U2NERlY1RvQXJyID0gZnVuY3Rpb24oc0Jhc2U2NCwgbkJsb2Nrc1NpemUpIHtcblx0dmFyXG5cdHNCNjRFbmMgPSBzQmFzZTY0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCBcIlwiKSwgbkluTGVuID0gc0I2NEVuYy5sZW5ndGgsXG5cdG5PdXRMZW4gPSBuQmxvY2tzU2l6ZSA/IE1hdGguY2VpbCgobkluTGVuICogMyArIDEgPj4gMikgLyBuQmxvY2tzU2l6ZSkgKiBuQmxvY2tzU2l6ZSA6IG5JbkxlbiAqIDMgKyAxID4+IDIsXG5cdGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihuT3V0TGVuKSwgdGFCeXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cblx0Zm9yICh2YXIgbk1vZDMsIG5Nb2Q0LCBuVWludDI0ID0gMCwgbk91dElkeCA9IDAsIG5JbklkeCA9IDA7IG5JbklkeCA8IG5JbkxlbjsgbkluSWR4KyspIHtcblx0XHRuTW9kNCA9IG5JbklkeCAmIDM7IC8qIG4gbW9kIDQgKi9cblx0XHRuVWludDI0IHw9IGI2NFRvVWludDYoc0I2NEVuYy5jaGFyQ29kZUF0KG5JbklkeCkpIDw8IDE4IC0gNiAqIG5Nb2Q0O1xuXHRcdGlmIChuTW9kNCA9PT0gMyB8fCBuSW5MZW4gLSBuSW5JZHggPT09IDEpIHtcblx0XHRcdGZvciAobk1vZDMgPSAwOyBuTW9kMyA8IDMgJiYgbk91dElkeCA8IG5PdXRMZW47IG5Nb2QzKyssIG5PdXRJZHgrKykge1xuXHRcdFx0XHR0YUJ5dGVzW25PdXRJZHhdID0gblVpbnQyNCA+Pj4gKDE2ID4+PiBuTW9kMyAmIDI0KSAmIDI1NTtcblx0XHRcdH1cblx0XHRcdG5VaW50MjQgPSAwO1xuXHRcdH1cblx0fVxuXHQvLyBjb25zb2xlLmxvZyhcInU4aW50IDogXCIrSlNPTi5zdHJpbmdpZnkodGFCeXRlcykpO1xuXHRyZXR1cm4gYnVmZmVyO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8gICBJbnRlcmZhY2UgZnVuY3Rpb25zICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8qKlxuKiBDb252ZXJ0IGJ1ZmZlciBjb2RlZCBpbiBiYXNlNjQgYW5kIGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieVxuKiBieXRlQ29kaW5nIGJ5dGVzIGludG8gYXJyYXlcbiogQHBhcmFtIGJ1ZmZlciBpbiBiYXNlNjRcbiogQHBhcmFtIGJ5dGVDb2RpbmcgbnVtYmVyIG9mIGJ5dGVzIGZvciBlYWNoIG51bWJlciAoNCBvciA4KVxuKiBAcmV0dXJuIGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCkuIG51bGwgaWYgY291bGQgbm90IGNvbnZlcnQuXG4qL1xuQmFzZTY0Q29kaW5nLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHR2YXIgYnl0ZUNvZGluZyA9IGRhdGEuYjtcblx0XG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyogZGVjb2RlIGRhdGEgdG8gYXJyYXkgb2YgYnl0ZSAqL1xuXHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YS5kLCBkYXRhLmIpO1xuXHQvKiBwYXJzZSBkYXRhIHRvIGZsb2F0IGFycmF5ICovXG5cdHZhciBmQXJyYXk9bnVsbDtcblx0c3dpdGNoKGRhdGEuYikge1xuXHRjYXNlIDQ6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0NjRBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRkZWZhdWx0OlxuXHRcdGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBieXRlQ29kaW5nISBTaG91bGQgbm90IGhhcHBlbiEhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qIHBhcnNlIGZBcnJheSBpbnRvIG5vcm1hbCBhcnJheSAqL1xuXHR2YXIgdGFiID0gW10uc2xpY2UuY2FsbChmQXJyYXkpO1xuXG5cdGlmKGRhdGEucyAhPT0gdGFiLmxlbmd0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCB3aGVuIGRlY29kaW5nICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRhYjtcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGFycmF5IGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieSBieXRlQ29kaW5nIGJ5dGVzIGludG8gYnVmZmVyIGNvZGVkIGluIGJhc2U2NFxuKiBAcGFyYW0gXHR7QXJyYXk8RmxvYXQ+fSBcdGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCBiaXRzKVxuKiBAcGFyYW0gXHR7aW50ZWdlcn0gXHRieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBmbG9hdCAoNCBvciA4KVxuKiBAcmV0dXJuICBcdHtTdHJpbmd9IFx0YnVmZmVyIGluIGJhc2U2NC4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIGJ5dGVDb2RpbmcpIHtcblx0LyogY2hlY2sgYnl0ZSBjb2RpbmcgKi9cblx0aWYoYnl0ZUNvZGluZyAhPT0gNCAmJiBieXRlQ29kaW5nICE9PSA4KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKiB3cml0ZSBhbGwgc2FtcGxlcyBpbiBCdWZmZXIgKi9cblx0dmFyIGJ1ZiA9IG5ldyBCdWZmZXIoYXJyYXkubGVuZ3RoKmJ5dGVDb2RpbmcpLGk7XG5cdHN3aXRjaChieXRlQ29kaW5nKSB7XG5cdGNhc2UgNDpcblx0XHRmb3IoaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYodHlwZW9mIGFycmF5W2ldICE9PSAnbnVtYmVyJylcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRidWYud3JpdGVGbG9hdExFKGFycmF5W2ldLCBpICogYnl0ZUNvZGluZyk7XG5cdFx0fVxuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0Zm9yKGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmKHR5cGVvZiBhcnJheVtpXSAhPT0gJ251bWJlcicpXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0YnVmLndyaXRlRG91YmxlTEUoYXJyYXlbaV0sIGkgKiBieXRlQ29kaW5nKTtcblx0XHR9XG5cdFx0YnJlYWs7XG5cdH1cblxuXHQvKiBjb252ZXJ0IEJ1ZmZlciB0byBiYXNlNjQgc3RyaW5nICovXG5cdHZhciBiNjRCdWZmID0gYnVmLnRvU3RyaW5nKCdiYXNlNjQnKTsgXG5cdHJldHVybiB7XG5cdFx0dDogJ2I2NCcsIC8qIHR5cGUgKi9cblx0XHRiOiBieXRlQ29kaW5nLCAvKiBieXRlQ29kaW5nICovXG5cdFx0ZDogYjY0QnVmZiwgLyogZGF0YSAqL1xuXHRcdHM6IGFycmF5Lmxlbmd0aCAvKiBzaXplICovXG5cdH07XG59O1xuXG5cblxuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgY29tbSBlbmNvZGluZ1xuICogKi9cbmZ1bmN0aW9uIENvZGluZ0hhbmRsZXIoKXtcblx0dGhpcy5iNjQgPSBuZXcgQmFzZTY0Q29kaW5nKCk7XG5cdHRoaXMubm9uZSA9IG5ldyBOb0NvZGluZygpO1xuXHRcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKCFkYXRhIHx8IGRhdGE9PT1udWxsKVxuXHRcdHJldHVybiBudWxsO1xuXHRzd2l0Y2goZGF0YS50KSB7XG5cdGNhc2UgJ2I2NCc6XG5cdFx0cmV0dXJuIHRoaXMuYjY0LmZyb20oZGF0YSk7XG5cdGRlZmF1bHQ6XG5cdFx0cmV0dXJuIHRoaXMubm9uZS5mcm9tKGRhdGEpO1x0XHRcblx0fVxufTtcblxuXG5Db2RpbmdIYW5kbGVyLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5LCB0eXBlLCBieXRlQ29kaW5nKSB7XG5cdGlmKHR5cGVvZiBhcnJheSA9PT0gJ251bWJlcicpIHtcblx0XHRhcnJheT1bYXJyYXldO1xuXHR9XG5cdGlmKCFBcnJheS5pc0FycmF5KGFycmF5KSl7XG5cdFx0Y29uc29sZS5sb2coXCJDb2RpbmdIYW5kbGVyLnRvIG9ubHkgYWNjZXB0cyBhcnJheSAhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHRzd2l0Y2godHlwZSkge1xuXHRjYXNlICdiNjQnOlxuXHRcdHJldHVybiB0aGlzLmI2NC50byhhcnJheSwgYnl0ZUNvZGluZyk7XG5cdGNhc2UgJ25vJzpcblx0ZGVmYXVsdDpcblx0XHRyZXR1cm4gdGhpcy5ub25lLnRvKGFycmF5KTtcdFx0XG5cdH1cbn07XG5cblxuLyoqIEFkZCBiYXNlNjQgaGFuZGxlciB0byBEaXlhU2VsZWN0b3IgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgQ29kaW5nSGFuZGxlcigpO1xufTtcblxuIl19
},{"../../DiyaSelector":12,"buffer":1}]},{},[13])(13)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaXMtYXJyYXkvaW5kZXguanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9ub2RlX21vZHVsZXMvbm9kZS1ldmVudC1lbWl0dGVyL2luZGV4LmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3EvcS5qcyIsIi9ob21lL3N5bHZtYWhlL3dvcmtzcGFjZS9BcHBzL2RpeWEtc2RrL3NyYy9EaXlhTm9kZS5qcyIsIi9ob21lL3N5bHZtYWhlL3dvcmtzcGFjZS9BcHBzL2RpeWEtc2RrL3NyYy9EaXlhU2VsZWN0b3IuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvc2VydmljZXMvZXhwbG9yZXIvZXhwbG9yZXIuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvc2VydmljZXMvaWVxL2llcS5qcyIsIi9ob21lL3N5bHZtYWhlL3dvcmtzcGFjZS9BcHBzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9tYXBzL21hcHMuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzaE5ldHdvcmsvTWVzaE5ldHdvcmsuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzc2FnZS5qcyIsIi9ob21lL3N5bHZtYWhlL3dvcmtzcGFjZS9BcHBzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9uZXR3b3JrSWQvTmV0d29ya0lkLmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3BlZXJBdXRoL1BlZXJBdXRoLmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3BpY28vcGljby5qcyIsIi9ob21lL3N5bHZtYWhlL3dvcmtzcGFjZS9BcHBzL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3N0YXR1cy9zdGF0dXMuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvc2VydmljZXMvdGltZXIvdGltZXIuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvc2VydmljZXMvdmVyYm9zZS9WZXJib3NlLmpzIiwiL2hvbWUvc3lsdm1haGUvd29ya3NwYWNlL0FwcHMvZGl5YS1zZGsvc3JjL3NlcnZpY2VzL3ZpZXdlcl9leHBsb3Jlci92aWV3ZXJfZXhwbG9yZXIuanMiLCIvaG9tZS9zeWx2bWFoZS93b3Jrc3BhY2UvQXBwcy9kaXlhLXNkay9zcmMvdXRpbHMvZW5jb2RpbmcvZW5jb2RpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2tCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuZ0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3piQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzLWFycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxudmFyIGtNYXhMZW5ndGggPSAweDNmZmZmZmZmXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIE5vdGU6XG4gKlxuICogLSBJbXBsZW1lbnRhdGlvbiBtdXN0IHN1cHBvcnQgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMuXG4gKiAgIEZpcmVmb3ggNC0yOSBsYWNrZWQgc3VwcG9ydCwgZml4ZWQgaW4gRmlyZWZveCAzMCsuXG4gKiAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG4gKlxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXkgd2lsbFxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgd2lsbCB3b3JrIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSAoZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgbmV3IFVpbnQ4QXJyYXkoMSkuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gc3ViamVjdCA+IDAgPyBzdWJqZWN0ID4+PiAwIDogMFxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcpXG4gICAgICBzdWJqZWN0ID0gYmFzZTY0Y2xlYW4oc3ViamVjdClcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JyAmJiBzdWJqZWN0ICE9PSBudWxsKSB7IC8vIGFzc3VtZSBvYmplY3QgaXMgYXJyYXktbGlrZVxuICAgIGlmIChzdWJqZWN0LnR5cGUgPT09ICdCdWZmZXInICYmIGlzQXJyYXkoc3ViamVjdC5kYXRhKSlcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0LmRhdGFcbiAgICBsZW5ndGggPSArc3ViamVjdC5sZW5ndGggPiAwID8gTWF0aC5mbG9vcigrc3ViamVjdC5sZW5ndGgpIDogMFxuICB9IGVsc2VcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHN0YXJ0IHdpdGggbnVtYmVyLCBidWZmZXIsIGFycmF5IG9yIHN0cmluZycpXG5cbiAgaWYgKHRoaXMubGVuZ3RoID4ga01heExlbmd0aClcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKylcbiAgICAgICAgYnVmW2ldID0gKChzdWJqZWN0W2ldICUgMjU2KSArIDI1NikgJSAyNTZcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuICYmIGFbaV0gPT09IGJbaV07IGkrKykge31cbiAgaWYgKGkgIT09IGxlbikge1xuICAgIHggPSBhW2ldXG4gICAgeSA9IGJbaV1cbiAgfVxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdFssIGxlbmd0aF0pJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0b3RhbExlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoID4+PiAxXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuQnVmZmVyLnByb3RvdHlwZS5sZW5ndGggPSB1bmRlZmluZWRcbkJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG5cbi8vIHRvU3RyaW5nKGVuY29kaW5nLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA9PT0gSW5maW5pdHkgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG4gIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmIChlbmQgPD0gc3RhcnQpIHJldHVybiAnJ1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSlcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKGIpIHtcbiAgaWYoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpXG4gICAgICBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpXG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihieXRlKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBiaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aCwgMilcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSB1dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBiaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBhc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuO1xuICAgIGlmIChzdGFydCA8IDApXG4gICAgICBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMClcbiAgICAgIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydClcbiAgICBlbmQgPSBzdGFydFxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpXG4gICAgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdidWZmZXIgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsdWUgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gdmFsdWVcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFR5cGVFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGlmICh0YXJnZXRfc3RhcnQgPCAwIHx8IHRhcmdldF9zdGFydCA+PSB0YXJnZXQubGVuZ3RoKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHNvdXJjZS5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiBzb3VyY2UubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXNbaV0gPSB2YWx1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSB1dGY4VG9CeXRlcyh2YWx1ZS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmVxdWFscyA9IEJQLmVxdWFsc1xuICBhcnIuY29tcGFyZSA9IEJQLmNvbXBhcmVcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLXpdL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKSB7XG4gICAgICBieXRlQXJyYXkucHVzaChiKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgsIHVuaXRTaXplKSB7XG4gIGlmICh1bml0U2l6ZSkgbGVuZ3RoIC09IGxlbmd0aCAlIHVuaXRTaXplO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cbiIsInZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsIlxuLyoqXG4gKiBpc0FycmF5XG4gKi9cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4vKipcbiAqIHRvU3RyaW5nXG4gKi9cblxudmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogV2hldGhlciBvciBub3QgdGhlIGdpdmVuIGB2YWxgXG4gKiBpcyBhbiBhcnJheS5cbiAqXG4gKiBleGFtcGxlOlxuICpcbiAqICAgICAgICBpc0FycmF5KFtdKTtcbiAqICAgICAgICAvLyA+IHRydWVcbiAqICAgICAgICBpc0FycmF5KGFyZ3VtZW50cyk7XG4gKiAgICAgICAgLy8gPiBmYWxzZVxuICogICAgICAgIGlzQXJyYXkoJycpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqXG4gKiBAcGFyYW0ge21peGVkfSB2YWxcbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5IHx8IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuICEhIHZhbCAmJiAnW29iamVjdCBBcnJheV0nID09IHN0ci5jYWxsKHZhbCk7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5aWNtOTNjMlZ5YVdaNUwyNXZaR1ZmYlc5a2RXeGxjeTkxZEdsc0wzVjBhV3d1YW5NaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaTh2SUVOdmNIbHlhV2RvZENCS2IzbGxiblFzSUVsdVl5NGdZVzVrSUc5MGFHVnlJRTV2WkdVZ1kyOXVkSEpwWW5WMGIzSnpMbHh1THk5Y2JpOHZJRkJsY20xcGMzTnBiMjRnYVhNZ2FHVnlaV0o1SUdkeVlXNTBaV1FzSUdaeVpXVWdiMllnWTJoaGNtZGxMQ0IwYnlCaGJua2djR1Z5YzI5dUlHOWlkR0ZwYm1sdVp5QmhYRzR2THlCamIzQjVJRzltSUhSb2FYTWdjMjltZEhkaGNtVWdZVzVrSUdGemMyOWphV0YwWldRZ1pHOWpkVzFsYm5SaGRHbHZiaUJtYVd4bGN5QW9kR2hsWEc0dkx5QmNJbE52Wm5SM1lYSmxYQ0lwTENCMGJ5QmtaV0ZzSUdsdUlIUm9aU0JUYjJaMGQyRnlaU0IzYVhSb2IzVjBJSEpsYzNSeWFXTjBhVzl1TENCcGJtTnNkV1JwYm1kY2JpOHZJSGRwZEdodmRYUWdiR2x0YVhSaGRHbHZiaUIwYUdVZ2NtbG5hSFJ6SUhSdklIVnpaU3dnWTI5d2VTd2diVzlrYVdaNUxDQnRaWEpuWlN3Z2NIVmliR2x6YUN4Y2JpOHZJR1JwYzNSeWFXSjFkR1VzSUhOMVlteHBZMlZ1YzJVc0lHRnVaQzl2Y2lCelpXeHNJR052Y0dsbGN5QnZaaUIwYUdVZ1UyOW1kSGRoY21Vc0lHRnVaQ0IwYnlCd1pYSnRhWFJjYmk4dklIQmxjbk52Ym5NZ2RHOGdkMmh2YlNCMGFHVWdVMjltZEhkaGNtVWdhWE1nWm5WeWJtbHphR1ZrSUhSdklHUnZJSE52TENCemRXSnFaV04wSUhSdklIUm9aVnh1THk4Z1ptOXNiRzkzYVc1bklHTnZibVJwZEdsdmJuTTZYRzR2TDF4dUx5OGdWR2hsSUdGaWIzWmxJR052Y0hseWFXZG9kQ0J1YjNScFkyVWdZVzVrSUhSb2FYTWdjR1Z5YldsemMybHZiaUJ1YjNScFkyVWdjMmhoYkd3Z1ltVWdhVzVqYkhWa1pXUmNiaTh2SUdsdUlHRnNiQ0JqYjNCcFpYTWdiM0lnYzNWaWMzUmhiblJwWVd3Z2NHOXlkR2x2Ym5NZ2IyWWdkR2hsSUZOdlpuUjNZWEpsTGx4dUx5OWNiaTh2SUZSSVJTQlRUMFpVVjBGU1JTQkpVeUJRVWs5V1NVUkZSQ0JjSWtGVElFbFRYQ0lzSUZkSlZFaFBWVlFnVjBGU1VrRk9WRmtnVDBZZ1FVNVpJRXRKVGtRc0lFVllVRkpGVTFOY2JpOHZJRTlTSUVsTlVFeEpSVVFzSUVsT1EweFZSRWxPUnlCQ1ZWUWdUazlVSUV4SlRVbFVSVVFnVkU4Z1ZFaEZJRmRCVWxKQlRsUkpSVk1nVDBaY2JpOHZJRTFGVWtOSVFVNVVRVUpKVEVsVVdTd2dSa2xVVGtWVFV5QkdUMUlnUVNCUVFWSlVTVU5WVEVGU0lGQlZVbEJQVTBVZ1FVNUVJRTVQVGtsT1JsSkpUa2RGVFVWT1ZDNGdTVTVjYmk4dklFNVBJRVZXUlU1VUlGTklRVXhNSUZSSVJTQkJWVlJJVDFKVElFOVNJRU5QVUZsU1NVZElWQ0JJVDB4RVJWSlRJRUpGSUV4SlFVSk1SU0JHVDFJZ1FVNVpJRU5NUVVsTkxGeHVMeThnUkVGTlFVZEZVeUJQVWlCUFZFaEZVaUJNU1VGQ1NVeEpWRmtzSUZkSVJWUklSVklnU1U0Z1FVNGdRVU5VU1U5T0lFOUdJRU5QVGxSU1FVTlVMQ0JVVDFKVUlFOVNYRzR2THlCUFZFaEZVbGRKVTBVc0lFRlNTVk5KVGtjZ1JsSlBUU3dnVDFWVUlFOUdJRTlTSUVsT0lFTlBUazVGUTFSSlQwNGdWMGxVU0NCVVNFVWdVMDlHVkZkQlVrVWdUMUlnVkVoRlhHNHZMeUJWVTBVZ1QxSWdUMVJJUlZJZ1JFVkJURWxPUjFNZ1NVNGdWRWhGSUZOUFJsUlhRVkpGTGx4dVhHNTJZWElnWm05eWJXRjBVbVZuUlhod0lEMGdMeVZiYzJScUpWMHZaenRjYm1WNGNHOXlkSE11Wm05eWJXRjBJRDBnWm5WdVkzUnBiMjRvWmlrZ2UxeHVJQ0JwWmlBb0lXbHpVM1J5YVc1bktHWXBLU0I3WEc0Z0lDQWdkbUZ5SUc5aWFtVmpkSE1nUFNCYlhUdGNiaUFnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJQ0FnYjJKcVpXTjBjeTV3ZFhOb0tHbHVjM0JsWTNRb1lYSm5kVzFsYm5SelcybGRLU2s3WEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCdlltcGxZM1J6TG1wdmFXNG9KeUFuS1R0Y2JpQWdmVnh1WEc0Z0lIWmhjaUJwSUQwZ01UdGNiaUFnZG1GeUlHRnlaM01nUFNCaGNtZDFiV1Z1ZEhNN1hHNGdJSFpoY2lCc1pXNGdQU0JoY21kekxteGxibWQwYUR0Y2JpQWdkbUZ5SUhOMGNpQTlJRk4wY21sdVp5aG1LUzV5WlhCc1lXTmxLR1p2Y20xaGRGSmxaMFY0Y0N3Z1puVnVZM1JwYjI0b2VDa2dlMXh1SUNBZ0lHbG1JQ2g0SUQwOVBTQW5KU1VuS1NCeVpYUjFjbTRnSnlVbk8xeHVJQ0FnSUdsbUlDaHBJRDQ5SUd4bGJpa2djbVYwZFhKdUlIZzdYRzRnSUNBZ2MzZHBkR05vSUNoNEtTQjdYRzRnSUNBZ0lDQmpZWE5sSUNjbGN5YzZJSEpsZEhWeWJpQlRkSEpwYm1jb1lYSm5jMXRwS3l0ZEtUdGNiaUFnSUNBZ0lHTmhjMlVnSnlWa0p6b2djbVYwZFhKdUlFNTFiV0psY2loaGNtZHpXMmtySzEwcE8xeHVJQ0FnSUNBZ1kyRnpaU0FuSldvbk9seHVJQ0FnSUNBZ0lDQjBjbmtnZTF4dUlDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCS1UwOU9Mbk4wY21sdVoybG1lU2hoY21kelcya3JLMTBwTzF4dUlDQWdJQ0FnSUNCOUlHTmhkR05vSUNoZktTQjdYRzRnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ2RiUTJseVkzVnNZWEpkSnp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ1pHVm1ZWFZzZERwY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhnN1hHNGdJQ0FnZlZ4dUlDQjlLVHRjYmlBZ1ptOXlJQ2gyWVhJZ2VDQTlJR0Z5WjNOYmFWMDdJR2tnUENCc1pXNDdJSGdnUFNCaGNtZHpXeXNyYVYwcElIdGNiaUFnSUNCcFppQW9hWE5PZFd4c0tIZ3BJSHg4SUNGcGMwOWlhbVZqZENoNEtTa2dlMXh1SUNBZ0lDQWdjM1J5SUNzOUlDY2dKeUFySUhnN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJSE4wY2lBclBTQW5JQ2NnS3lCcGJuTndaV04wS0hncE8xeHVJQ0FnSUgxY2JpQWdmVnh1SUNCeVpYUjFjbTRnYzNSeU8xeHVmVHRjYmx4dVhHNHZMeUJOWVhKcklIUm9ZWFFnWVNCdFpYUm9iMlFnYzJodmRXeGtJRzV2ZENCaVpTQjFjMlZrTGx4dUx5OGdVbVYwZFhKdWN5QmhJRzF2WkdsbWFXVmtJR1oxYm1OMGFXOXVJSGRvYVdOb0lIZGhjbTV6SUc5dVkyVWdZbmtnWkdWbVlYVnNkQzVjYmk4dklFbG1JQzB0Ym04dFpHVndjbVZqWVhScGIyNGdhWE1nYzJWMExDQjBhR1Z1SUdsMElHbHpJR0VnYm04dGIzQXVYRzVsZUhCdmNuUnpMbVJsY0hKbFkyRjBaU0E5SUdaMWJtTjBhVzl1S0dadUxDQnRjMmNwSUh0Y2JpQWdMeThnUVd4c2IzY2dabTl5SUdSbGNISmxZMkYwYVc1bklIUm9hVzVuY3lCcGJpQjBhR1VnY0hKdlkyVnpjeUJ2WmlCemRHRnlkR2x1WnlCMWNDNWNiaUFnYVdZZ0tHbHpWVzVrWldacGJtVmtLR2RzYjJKaGJDNXdjbTlqWlhOektTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCbGVIQnZjblJ6TG1SbGNISmxZMkYwWlNobWJpd2diWE5uS1M1aGNIQnNlU2gwYUdsekxDQmhjbWQxYldWdWRITXBPMXh1SUNBZ0lIMDdYRzRnSUgxY2JseHVJQ0JwWmlBb2NISnZZMlZ6Y3k1dWIwUmxjSEpsWTJGMGFXOXVJRDA5UFNCMGNuVmxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHWnVPMXh1SUNCOVhHNWNiaUFnZG1GeUlIZGhjbTVsWkNBOUlHWmhiSE5sTzF4dUlDQm1kVzVqZEdsdmJpQmtaWEJ5WldOaGRHVmtLQ2tnZTF4dUlDQWdJR2xtSUNnaGQyRnlibVZrS1NCN1hHNGdJQ0FnSUNCcFppQW9jSEp2WTJWemN5NTBhSEp2ZDBSbGNISmxZMkYwYVc5dUtTQjdYRzRnSUNBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpaHRjMmNwTzF4dUlDQWdJQ0FnZlNCbGJITmxJR2xtSUNod2NtOWpaWE56TG5SeVlXTmxSR1Z3Y21WallYUnBiMjRwSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1MGNtRmpaU2h0YzJjcE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1bGNuSnZjaWh0YzJjcE8xeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2QyRnlibVZrSUQwZ2RISjFaVHRjYmlBZ0lDQjlYRzRnSUNBZ2NtVjBkWEp1SUdadUxtRndjR3g1S0hSb2FYTXNJR0Z5WjNWdFpXNTBjeWs3WEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnWkdWd2NtVmpZWFJsWkR0Y2JuMDdYRzVjYmx4dWRtRnlJR1JsWW5WbmN5QTlJSHQ5TzF4dWRtRnlJR1JsWW5WblJXNTJhWEp2Ymp0Y2JtVjRjRzl5ZEhNdVpHVmlkV2RzYjJjZ1BTQm1kVzVqZEdsdmJpaHpaWFFwSUh0Y2JpQWdhV1lnS0dselZXNWtaV1pwYm1Wa0tHUmxZblZuUlc1MmFYSnZiaWtwWEc0Z0lDQWdaR1ZpZFdkRmJuWnBjbTl1SUQwZ2NISnZZMlZ6Y3k1bGJuWXVUazlFUlY5RVJVSlZSeUI4ZkNBbkp6dGNiaUFnYzJWMElEMGdjMlYwTG5SdlZYQndaWEpEWVhObEtDazdYRzRnSUdsbUlDZ2haR1ZpZFdkelczTmxkRjBwSUh0Y2JpQWdJQ0JwWmlBb2JtVjNJRkpsWjBWNGNDZ25YRnhjWEdJbklDc2djMlYwSUNzZ0oxeGNYRnhpSnl3Z0oya25LUzUwWlhOMEtHUmxZblZuUlc1MmFYSnZiaWtwSUh0Y2JpQWdJQ0FnSUhaaGNpQndhV1FnUFNCd2NtOWpaWE56TG5CcFpEdGNiaUFnSUNBZ0lHUmxZblZuYzF0elpYUmRJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ0YzJjZ1BTQmxlSEJ2Y25SekxtWnZjbTFoZEM1aGNIQnNlU2hsZUhCdmNuUnpMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLQ2NsY3lBbFpEb2dKWE1uTENCelpYUXNJSEJwWkN3Z2JYTm5LVHRjYmlBZ0lDQWdJSDA3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lHUmxZblZuYzF0elpYUmRJRDBnWm5WdVkzUnBiMjRvS1NCN2ZUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUdSbFluVm5jMXR6WlhSZE8xeHVmVHRjYmx4dVhHNHZLaXBjYmlBcUlFVmphRzl6SUhSb1pTQjJZV3gxWlNCdlppQmhJSFpoYkhWbExpQlVjbmx6SUhSdklIQnlhVzUwSUhSb1pTQjJZV3gxWlNCdmRYUmNiaUFxSUdsdUlIUm9aU0JpWlhOMElIZGhlU0J3YjNOemFXSnNaU0JuYVhabGJpQjBhR1VnWkdsbVptVnlaVzUwSUhSNWNHVnpMbHh1SUNwY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnZZbW9nVkdobElHOWlhbVZqZENCMGJ5QndjbWx1ZENCdmRYUXVYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnYjNCMGN5QlBjSFJwYjI1aGJDQnZjSFJwYjI1eklHOWlhbVZqZENCMGFHRjBJR0ZzZEdWeWN5QjBhR1VnYjNWMGNIVjBMbHh1SUNvdlhHNHZLaUJzWldkaFkzazZJRzlpYWl3Z2MyaHZkMGhwWkdSbGJpd2daR1Z3ZEdnc0lHTnZiRzl5Y3lvdlhHNW1kVzVqZEdsdmJpQnBibk53WldOMEtHOWlhaXdnYjNCMGN5a2dlMXh1SUNBdkx5QmtaV1poZFd4MElHOXdkR2x2Ym5OY2JpQWdkbUZ5SUdOMGVDQTlJSHRjYmlBZ0lDQnpaV1Z1T2lCYlhTeGNiaUFnSUNCemRIbHNhWHBsT2lCemRIbHNhWHBsVG05RGIyeHZjbHh1SUNCOU8xeHVJQ0F2THlCc1pXZGhZM2t1TGk1Y2JpQWdhV1lnS0dGeVozVnRaVzUwY3k1c1pXNW5kR2dnUGowZ015a2dZM1I0TG1SbGNIUm9JRDBnWVhKbmRXMWxiblJ6V3pKZE8xeHVJQ0JwWmlBb1lYSm5kVzFsYm5SekxteGxibWQwYUNBK1BTQTBLU0JqZEhndVkyOXNiM0p6SUQwZ1lYSm5kVzFsYm5Seld6TmRPMXh1SUNCcFppQW9hWE5DYjI5c1pXRnVLRzl3ZEhNcEtTQjdYRzRnSUNBZ0x5OGdiR1ZuWVdONUxpNHVYRzRnSUNBZ1kzUjRMbk5vYjNkSWFXUmtaVzRnUFNCdmNIUnpPMXh1SUNCOUlHVnNjMlVnYVdZZ0tHOXdkSE1wSUh0Y2JpQWdJQ0F2THlCbmIzUWdZVzRnWENKdmNIUnBiMjV6WENJZ2IySnFaV04wWEc0Z0lDQWdaWGh3YjNKMGN5NWZaWGgwWlc1a0tHTjBlQ3dnYjNCMGN5azdYRzRnSUgxY2JpQWdMeThnYzJWMElHUmxabUYxYkhRZ2IzQjBhVzl1YzF4dUlDQnBaaUFvYVhOVmJtUmxabWx1WldRb1kzUjRMbk5vYjNkSWFXUmtaVzRwS1NCamRIZ3VjMmh2ZDBocFpHUmxiaUE5SUdaaGJITmxPMXh1SUNCcFppQW9hWE5WYm1SbFptbHVaV1FvWTNSNExtUmxjSFJvS1NrZ1kzUjRMbVJsY0hSb0lEMGdNanRjYmlBZ2FXWWdLR2x6Vlc1a1pXWnBibVZrS0dOMGVDNWpiMnh2Y25NcEtTQmpkSGd1WTI5c2IzSnpJRDBnWm1Gc2MyVTdYRzRnSUdsbUlDaHBjMVZ1WkdWbWFXNWxaQ2hqZEhndVkzVnpkRzl0U1c1emNHVmpkQ2twSUdOMGVDNWpkWE4wYjIxSmJuTndaV04wSUQwZ2RISjFaVHRjYmlBZ2FXWWdLR04wZUM1amIyeHZjbk1wSUdOMGVDNXpkSGxzYVhwbElEMGdjM1I1YkdsNlpWZHBkR2hEYjJ4dmNqdGNiaUFnY21WMGRYSnVJR1p2Y20xaGRGWmhiSFZsS0dOMGVDd2diMkpxTENCamRIZ3VaR1Z3ZEdncE8xeHVmVnh1Wlhod2IzSjBjeTVwYm5Od1pXTjBJRDBnYVc1emNHVmpkRHRjYmx4dVhHNHZMeUJvZEhSd09pOHZaVzR1ZDJscmFYQmxaR2xoTG05eVp5OTNhV3RwTDBGT1UwbGZaWE5qWVhCbFgyTnZaR1VqWjNKaGNHaHBZM05jYm1sdWMzQmxZM1F1WTI5c2IzSnpJRDBnZTF4dUlDQW5ZbTlzWkNjZ09pQmJNU3dnTWpKZExGeHVJQ0FuYVhSaGJHbGpKeUE2SUZzekxDQXlNMTBzWEc0Z0lDZDFibVJsY214cGJtVW5JRG9nV3pRc0lESTBYU3hjYmlBZ0oybHVkbVZ5YzJVbklEb2dXemNzSURJM1hTeGNiaUFnSjNkb2FYUmxKeUE2SUZzek55d2dNemxkTEZ4dUlDQW5aM0psZVNjZ09pQmJPVEFzSURNNVhTeGNiaUFnSjJKc1lXTnJKeUE2SUZzek1Dd2dNemxkTEZ4dUlDQW5ZbXgxWlNjZ09pQmJNelFzSURNNVhTeGNiaUFnSjJONVlXNG5JRG9nV3pNMkxDQXpPVjBzWEc0Z0lDZG5jbVZsYmljZ09pQmJNeklzSURNNVhTeGNiaUFnSjIxaFoyVnVkR0VuSURvZ1d6TTFMQ0F6T1Ywc1hHNGdJQ2R5WldRbklEb2dXek14TENBek9WMHNYRzRnSUNkNVpXeHNiM2NuSURvZ1d6TXpMQ0F6T1YxY2JuMDdYRzVjYmk4dklFUnZiaWQwSUhWelpTQW5ZbXgxWlNjZ2JtOTBJSFpwYzJsaWJHVWdiMjRnWTIxa0xtVjRaVnh1YVc1emNHVmpkQzV6ZEhsc1pYTWdQU0I3WEc0Z0lDZHpjR1ZqYVdGc0p6b2dKMk41WVc0bkxGeHVJQ0FuYm5WdFltVnlKem9nSjNsbGJHeHZkeWNzWEc0Z0lDZGliMjlzWldGdUp6b2dKM2xsYkd4dmR5Y3NYRzRnSUNkMWJtUmxabWx1WldRbk9pQW5aM0psZVNjc1hHNGdJQ2R1ZFd4c0p6b2dKMkp2YkdRbkxGeHVJQ0FuYzNSeWFXNW5Kem9nSjJkeVpXVnVKeXhjYmlBZ0oyUmhkR1VuT2lBbmJXRm5aVzUwWVNjc1hHNGdJQzh2SUZ3aWJtRnRaVndpT2lCcGJuUmxiblJwYjI1aGJHeDVJRzV2ZENCemRIbHNhVzVuWEc0Z0lDZHlaV2RsZUhBbk9pQW5jbVZrSjF4dWZUdGNibHh1WEc1bWRXNWpkR2x2YmlCemRIbHNhWHBsVjJsMGFFTnZiRzl5S0hOMGNpd2djM1I1YkdWVWVYQmxLU0I3WEc0Z0lIWmhjaUJ6ZEhsc1pTQTlJR2x1YzNCbFkzUXVjM1I1YkdWelczTjBlV3hsVkhsd1pWMDdYRzVjYmlBZ2FXWWdLSE4wZVd4bEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUNkY1hIVXdNREZpV3ljZ0t5QnBibk53WldOMExtTnZiRzl5YzF0emRIbHNaVjFiTUYwZ0t5QW5iU2NnS3lCemRISWdLMXh1SUNBZ0lDQWdJQ0FnSUNBblhGeDFNREF4WWxzbklDc2dhVzV6Y0dWamRDNWpiMnh2Y25OYmMzUjViR1ZkV3pGZElDc2dKMjBuTzF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUhKbGRIVnliaUJ6ZEhJN1hHNGdJSDFjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJ6ZEhsc2FYcGxUbTlEYjJ4dmNpaHpkSElzSUhOMGVXeGxWSGx3WlNrZ2UxeHVJQ0J5WlhSMWNtNGdjM1J5TzF4dWZWeHVYRzVjYm1aMWJtTjBhVzl1SUdGeWNtRjVWRzlJWVhOb0tHRnljbUY1S1NCN1hHNGdJSFpoY2lCb1lYTm9JRDBnZTMwN1hHNWNiaUFnWVhKeVlYa3VabTl5UldGamFDaG1kVzVqZEdsdmJpaDJZV3dzSUdsa2VDa2dlMXh1SUNBZ0lHaGhjMmhiZG1Gc1hTQTlJSFJ5ZFdVN1hHNGdJSDBwTzF4dVhHNGdJSEpsZEhWeWJpQm9ZWE5vTzF4dWZWeHVYRzVjYm1aMWJtTjBhVzl1SUdadmNtMWhkRlpoYkhWbEtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3lrZ2UxeHVJQ0F2THlCUWNtOTJhV1JsSUdFZ2FHOXZheUJtYjNJZ2RYTmxjaTF6Y0dWamFXWnBaV1FnYVc1emNHVmpkQ0JtZFc1amRHbHZibk11WEc0Z0lDOHZJRU5vWldOcklIUm9ZWFFnZG1Gc2RXVWdhWE1nWVc0Z2IySnFaV04wSUhkcGRHZ2dZVzRnYVc1emNHVmpkQ0JtZFc1amRHbHZiaUJ2YmlCcGRGeHVJQ0JwWmlBb1kzUjRMbU4xYzNSdmJVbHVjM0JsWTNRZ0ppWmNiaUFnSUNBZ0lIWmhiSFZsSUNZbVhHNGdJQ0FnSUNCcGMwWjFibU4wYVc5dUtIWmhiSFZsTG1sdWMzQmxZM1FwSUNZbVhHNGdJQ0FnSUNBdkx5QkdhV3gwWlhJZ2IzVjBJSFJvWlNCMWRHbHNJRzF2WkhWc1pTd2dhWFFuY3lCcGJuTndaV04wSUdaMWJtTjBhVzl1SUdseklITndaV05wWVd4Y2JpQWdJQ0FnSUhaaGJIVmxMbWx1YzNCbFkzUWdJVDA5SUdWNGNHOXlkSE11YVc1emNHVmpkQ0FtSmx4dUlDQWdJQ0FnTHk4Z1FXeHpieUJtYVd4MFpYSWdiM1YwSUdGdWVTQndjbTkwYjNSNWNHVWdiMkpxWldOMGN5QjFjMmx1WnlCMGFHVWdZMmx5WTNWc1lYSWdZMmhsWTJzdVhHNGdJQ0FnSUNBaEtIWmhiSFZsTG1OdmJuTjBjblZqZEc5eUlDWW1JSFpoYkhWbExtTnZibk4wY25WamRHOXlMbkJ5YjNSdmRIbHdaU0E5UFQwZ2RtRnNkV1VwS1NCN1hHNGdJQ0FnZG1GeUlISmxkQ0E5SUhaaGJIVmxMbWx1YzNCbFkzUW9jbVZqZFhKelpWUnBiV1Z6TENCamRIZ3BPMXh1SUNBZ0lHbG1JQ2doYVhOVGRISnBibWNvY21WMEtTa2dlMXh1SUNBZ0lDQWdjbVYwSUQwZ1ptOXliV0YwVm1Gc2RXVW9ZM1I0TENCeVpYUXNJSEpsWTNWeWMyVlVhVzFsY3lrN1hHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQnlaWFE3WEc0Z0lIMWNibHh1SUNBdkx5QlFjbWx0YVhScGRtVWdkSGx3WlhNZ1kyRnVibTkwSUdoaGRtVWdjSEp2Y0dWeWRHbGxjMXh1SUNCMllYSWdjSEpwYldsMGFYWmxJRDBnWm05eWJXRjBVSEpwYldsMGFYWmxLR04wZUN3Z2RtRnNkV1VwTzF4dUlDQnBaaUFvY0hKcGJXbDBhWFpsS1NCN1hHNGdJQ0FnY21WMGRYSnVJSEJ5YVcxcGRHbDJaVHRjYmlBZ2ZWeHVYRzRnSUM4dklFeHZiMnNnZFhBZ2RHaGxJR3RsZVhNZ2IyWWdkR2hsSUc5aWFtVmpkQzVjYmlBZ2RtRnlJR3RsZVhNZ1BTQlBZbXBsWTNRdWEyVjVjeWgyWVd4MVpTazdYRzRnSUhaaGNpQjJhWE5wWW14bFMyVjVjeUE5SUdGeWNtRjVWRzlJWVhOb0tHdGxlWE1wTzF4dVhHNGdJR2xtSUNoamRIZ3VjMmh2ZDBocFpHUmxiaWtnZTF4dUlDQWdJR3RsZVhNZ1BTQlBZbXBsWTNRdVoyVjBUM2R1VUhKdmNHVnlkSGxPWVcxbGN5aDJZV3gxWlNrN1hHNGdJSDFjYmx4dUlDQXZMeUJKUlNCa2IyVnpiaWQwSUcxaGEyVWdaWEp5YjNJZ1ptbGxiR1J6SUc1dmJpMWxiblZ0WlhKaFlteGxYRzRnSUM4dklHaDBkSEE2THk5dGMyUnVMbTFwWTNKdmMyOW1kQzVqYjIwdlpXNHRkWE12YkdsaWNtRnllUzlwWlM5a2QzYzFNbk5pZENoMlBYWnpMamswS1M1aGMzQjRYRzRnSUdsbUlDaHBjMFZ5Y205eUtIWmhiSFZsS1Z4dUlDQWdJQ0FnSmlZZ0tHdGxlWE11YVc1a1pYaFBaaWduYldWemMyRm5aU2NwSUQ0OUlEQWdmSHdnYTJWNWN5NXBibVJsZUU5bUtDZGtaWE5qY21sd2RHbHZiaWNwSUQ0OUlEQXBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHWnZjbTFoZEVWeWNtOXlLSFpoYkhWbEtUdGNiaUFnZlZ4dVhHNGdJQzh2SUZOdmJXVWdkSGx3WlNCdlppQnZZbXBsWTNRZ2QybDBhRzkxZENCd2NtOXdaWEowYVdWeklHTmhiaUJpWlNCemFHOXlkR04xZEhSbFpDNWNiaUFnYVdZZ0tHdGxlWE11YkdWdVozUm9JRDA5UFNBd0tTQjdYRzRnSUNBZ2FXWWdLR2x6Um5WdVkzUnBiMjRvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdJQ0IyWVhJZ2JtRnRaU0E5SUhaaGJIVmxMbTVoYldVZ1B5QW5PaUFuSUNzZ2RtRnNkV1V1Ym1GdFpTQTZJQ2NuTzF4dUlDQWdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NkYlJuVnVZM1JwYjI0bklDc2dibUZ0WlNBcklDZGRKeXdnSjNOd1pXTnBZV3duS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0dselVtVm5SWGh3S0haaGJIVmxLU2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0ZKbFowVjRjQzV3Y205MGIzUjVjR1V1ZEc5VGRISnBibWN1WTJGc2JDaDJZV3gxWlNrc0lDZHlaV2RsZUhBbktUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tHbHpSR0YwWlNoMllXeDFaU2twSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNoRVlYUmxMbkJ5YjNSdmRIbHdaUzUwYjFOMGNtbHVaeTVqWVd4c0tIWmhiSFZsS1N3Z0oyUmhkR1VuS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0dselJYSnliM0lvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdJQ0J5WlhSMWNtNGdabTl5YldGMFJYSnliM0lvZG1Gc2RXVXBPMXh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJSFpoY2lCaVlYTmxJRDBnSnljc0lHRnljbUY1SUQwZ1ptRnNjMlVzSUdKeVlXTmxjeUE5SUZzbmV5Y3NJQ2Q5SjEwN1hHNWNiaUFnTHk4Z1RXRnJaU0JCY25KaGVTQnpZWGtnZEdoaGRDQjBhR1Y1SUdGeVpTQkJjbkpoZVZ4dUlDQnBaaUFvYVhOQmNuSmhlU2gyWVd4MVpTa3BJSHRjYmlBZ0lDQmhjbkpoZVNBOUlIUnlkV1U3WEc0Z0lDQWdZbkpoWTJWeklEMGdXeWRiSnl3Z0oxMG5YVHRjYmlBZ2ZWeHVYRzRnSUM4dklFMWhhMlVnWm5WdVkzUnBiMjV6SUhOaGVTQjBhR0YwSUhSb1pYa2dZWEpsSUdaMWJtTjBhVzl1YzF4dUlDQnBaaUFvYVhOR2RXNWpkR2x2YmloMllXeDFaU2twSUh0Y2JpQWdJQ0IyWVhJZ2JpQTlJSFpoYkhWbExtNWhiV1VnUHlBbk9pQW5JQ3NnZG1Gc2RXVXVibUZ0WlNBNklDY25PMXh1SUNBZ0lHSmhjMlVnUFNBbklGdEdkVzVqZEdsdmJpY2dLeUJ1SUNzZ0oxMG5PMXh1SUNCOVhHNWNiaUFnTHk4Z1RXRnJaU0JTWldkRmVIQnpJSE5oZVNCMGFHRjBJSFJvWlhrZ1lYSmxJRkpsWjBWNGNITmNiaUFnYVdZZ0tHbHpVbVZuUlhod0tIWmhiSFZsS1NrZ2UxeHVJQ0FnSUdKaGMyVWdQU0FuSUNjZ0t5QlNaV2RGZUhBdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBPMXh1SUNCOVhHNWNiaUFnTHk4Z1RXRnJaU0JrWVhSbGN5QjNhWFJvSUhCeWIzQmxjblJwWlhNZ1ptbHljM1FnYzJGNUlIUm9aU0JrWVhSbFhHNGdJR2xtSUNocGMwUmhkR1VvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdZbUZ6WlNBOUlDY2dKeUFySUVSaGRHVXVjSEp2ZEc5MGVYQmxMblJ2VlZSRFUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcE8xeHVJQ0I5WEc1Y2JpQWdMeThnVFdGclpTQmxjbkp2Y2lCM2FYUm9JRzFsYzNOaFoyVWdabWx5YzNRZ2MyRjVJSFJvWlNCbGNuSnZjbHh1SUNCcFppQW9hWE5GY25KdmNpaDJZV3gxWlNrcElIdGNiaUFnSUNCaVlYTmxJRDBnSnlBbklDc2dabTl5YldGMFJYSnliM0lvZG1Gc2RXVXBPMXh1SUNCOVhHNWNiaUFnYVdZZ0tHdGxlWE11YkdWdVozUm9JRDA5UFNBd0lDWW1JQ2doWVhKeVlYa2dmSHdnZG1Gc2RXVXViR1Z1WjNSb0lEMDlJREFwS1NCN1hHNGdJQ0FnY21WMGRYSnVJR0p5WVdObGMxc3dYU0FySUdKaGMyVWdLeUJpY21GalpYTmJNVjA3WEc0Z0lIMWNibHh1SUNCcFppQW9jbVZqZFhKelpWUnBiV1Z6SUR3Z01Da2dlMXh1SUNBZ0lHbG1JQ2hwYzFKbFowVjRjQ2gyWVd4MVpTa3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2hTWldkRmVIQXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwTENBbmNtVm5aWGh3SnlrN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmpkSGd1YzNSNWJHbDZaU2duVzA5aWFtVmpkRjBuTENBbmMzQmxZMmxoYkNjcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lHTjBlQzV6WldWdUxuQjFjMmdvZG1Gc2RXVXBPMXh1WEc0Z0lIWmhjaUJ2ZFhSd2RYUTdYRzRnSUdsbUlDaGhjbkpoZVNrZ2UxeHVJQ0FnSUc5MWRIQjFkQ0E5SUdadmNtMWhkRUZ5Y21GNUtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3l3Z2RtbHphV0pzWlV0bGVYTXNJR3RsZVhNcE8xeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lHOTFkSEIxZENBOUlHdGxlWE11YldGd0tHWjFibU4wYVc5dUtHdGxlU2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR1p2Y20xaGRGQnliM0JsY25SNUtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3l3Z2RtbHphV0pzWlV0bGVYTXNJR3RsZVN3Z1lYSnlZWGtwTzF4dUlDQWdJSDBwTzF4dUlDQjlYRzVjYmlBZ1kzUjRMbk5sWlc0dWNHOXdLQ2s3WEc1Y2JpQWdjbVYwZFhKdUlISmxaSFZqWlZSdlUybHVaMnhsVTNSeWFXNW5LRzkxZEhCMWRDd2dZbUZ6WlN3Z1luSmhZMlZ6S1R0Y2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCbWIzSnRZWFJRY21sdGFYUnBkbVVvWTNSNExDQjJZV3gxWlNrZ2UxeHVJQ0JwWmlBb2FYTlZibVJsWm1sdVpXUW9kbUZzZFdVcEtWeHVJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNnbmRXNWtaV1pwYm1Wa0p5d2dKM1Z1WkdWbWFXNWxaQ2NwTzF4dUlDQnBaaUFvYVhOVGRISnBibWNvZG1Gc2RXVXBLU0I3WEc0Z0lDQWdkbUZ5SUhOcGJYQnNaU0E5SUNkY1hDY25JQ3NnU2xOUFRpNXpkSEpwYm1kcFpua29kbUZzZFdVcExuSmxjR3hoWTJVb0wxNWNJbnhjSWlRdlp5d2dKeWNwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdWNtVndiR0ZqWlNndkp5OW5MQ0JjSWx4Y1hGd25YQ0lwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdWNtVndiR0ZqWlNndlhGeGNYRndpTDJjc0lDZGNJaWNwSUNzZ0oxeGNKeWM3WEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLSE5wYlhCc1pTd2dKM04wY21sdVp5Y3BPMXh1SUNCOVhHNGdJR2xtSUNocGMwNTFiV0psY2loMllXeDFaU2twWEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2NuSUNzZ2RtRnNkV1VzSUNkdWRXMWlaWEluS1R0Y2JpQWdhV1lnS0dselFtOXZiR1ZoYmloMllXeDFaU2twWEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2NuSUNzZ2RtRnNkV1VzSUNkaWIyOXNaV0Z1SnlrN1hHNGdJQzh2SUVadmNpQnpiMjFsSUhKbFlYTnZiaUIwZVhCbGIyWWdiblZzYkNCcGN5QmNJbTlpYW1WamRGd2lMQ0J6YnlCemNHVmphV0ZzSUdOaGMyVWdhR1Z5WlM1Y2JpQWdhV1lnS0dselRuVnNiQ2gyWVd4MVpTa3BYRzRnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDZHVkV3hzSnl3Z0oyNTFiR3duS1R0Y2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCbWIzSnRZWFJGY25KdmNpaDJZV3gxWlNrZ2UxeHVJQ0J5WlhSMWNtNGdKMXNuSUNzZ1JYSnliM0l1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcElDc2dKMTBuTzF4dWZWeHVYRzVjYm1aMWJtTjBhVzl1SUdadmNtMWhkRUZ5Y21GNUtHTjBlQ3dnZG1Gc2RXVXNJSEpsWTNWeWMyVlVhVzFsY3l3Z2RtbHphV0pzWlV0bGVYTXNJR3RsZVhNcElIdGNiaUFnZG1GeUlHOTFkSEIxZENBOUlGdGRPMXh1SUNCbWIzSWdLSFpoY2lCcElEMGdNQ3dnYkNBOUlIWmhiSFZsTG14bGJtZDBhRHNnYVNBOElHdzdJQ3NyYVNrZ2UxeHVJQ0FnSUdsbUlDaG9ZWE5QZDI1UWNtOXdaWEowZVNoMllXeDFaU3dnVTNSeWFXNW5LR2twS1NrZ2UxeHVJQ0FnSUNBZ2IzVjBjSFYwTG5CMWMyZ29abTl5YldGMFVISnZjR1Z5ZEhrb1kzUjRMQ0IyWVd4MVpTd2djbVZqZFhKelpWUnBiV1Z6TENCMmFYTnBZbXhsUzJWNWN5eGNiaUFnSUNBZ0lDQWdJQ0JUZEhKcGJtY29hU2tzSUhSeWRXVXBLVHRjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2IzVjBjSFYwTG5CMWMyZ29KeWNwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0JyWlhsekxtWnZja1ZoWTJnb1puVnVZM1JwYjI0b2EyVjVLU0I3WEc0Z0lDQWdhV1lnS0NGclpYa3ViV0YwWTJnb0wxNWNYR1FySkM4cEtTQjdYRzRnSUNBZ0lDQnZkWFJ3ZFhRdWNIVnphQ2htYjNKdFlYUlFjbTl3WlhKMGVTaGpkSGdzSUhaaGJIVmxMQ0J5WldOMWNuTmxWR2x0WlhNc0lIWnBjMmxpYkdWTFpYbHpMRnh1SUNBZ0lDQWdJQ0FnSUd0bGVTd2dkSEoxWlNrcE8xeHVJQ0FnSUgxY2JpQWdmU2s3WEc0Z0lISmxkSFZ5YmlCdmRYUndkWFE3WEc1OVhHNWNibHh1Wm5WdVkzUnBiMjRnWm05eWJXRjBVSEp2Y0dWeWRIa29ZM1I0TENCMllXeDFaU3dnY21WamRYSnpaVlJwYldWekxDQjJhWE5wWW14bFMyVjVjeXdnYTJWNUxDQmhjbkpoZVNrZ2UxeHVJQ0IyWVhJZ2JtRnRaU3dnYzNSeUxDQmtaWE5qTzF4dUlDQmtaWE5qSUQwZ1QySnFaV04wTG1kbGRFOTNibEJ5YjNCbGNuUjVSR1Z6WTNKcGNIUnZjaWgyWVd4MVpTd2dhMlY1S1NCOGZDQjdJSFpoYkhWbE9pQjJZV3gxWlZ0clpYbGRJSDA3WEc0Z0lHbG1JQ2hrWlhOakxtZGxkQ2tnZTF4dUlDQWdJR2xtSUNoa1pYTmpMbk5sZENrZ2UxeHVJQ0FnSUNBZ2MzUnlJRDBnWTNSNExuTjBlV3hwZW1Vb0oxdEhaWFIwWlhJdlUyVjBkR1Z5WFNjc0lDZHpjR1ZqYVdGc0p5azdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhOMGNpQTlJR04wZUM1emRIbHNhWHBsS0NkYlIyVjBkR1Z5WFNjc0lDZHpjR1ZqYVdGc0p5azdYRzRnSUNBZ2ZWeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lHbG1JQ2hrWlhOakxuTmxkQ2tnZTF4dUlDQWdJQ0FnYzNSeUlEMGdZM1I0TG5OMGVXeHBlbVVvSjF0VFpYUjBaWEpkSnl3Z0ozTndaV05wWVd3bktUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2FXWWdLQ0ZvWVhOUGQyNVFjbTl3WlhKMGVTaDJhWE5wWW14bFMyVjVjeXdnYTJWNUtTa2dlMXh1SUNBZ0lHNWhiV1VnUFNBbld5Y2dLeUJyWlhrZ0t5QW5YU2M3WEc0Z0lIMWNiaUFnYVdZZ0tDRnpkSElwSUh0Y2JpQWdJQ0JwWmlBb1kzUjRMbk5sWlc0dWFXNWtaWGhQWmloa1pYTmpMblpoYkhWbEtTQThJREFwSUh0Y2JpQWdJQ0FnSUdsbUlDaHBjMDUxYkd3b2NtVmpkWEp6WlZScGJXVnpLU2tnZTF4dUlDQWdJQ0FnSUNCemRISWdQU0JtYjNKdFlYUldZV3gxWlNoamRIZ3NJR1JsYzJNdWRtRnNkV1VzSUc1MWJHd3BPMXh1SUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdjM1J5SUQwZ1ptOXliV0YwVm1Gc2RXVW9ZM1I0TENCa1pYTmpMblpoYkhWbExDQnlaV04xY25ObFZHbHRaWE1nTFNBeEtUdGNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lHbG1JQ2h6ZEhJdWFXNWtaWGhQWmlnblhGeHVKeWtnUGlBdE1Ta2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb1lYSnlZWGtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQnpkSElnUFNCemRISXVjM0JzYVhRb0oxeGNiaWNwTG0xaGNDaG1kVzVqZEdsdmJpaHNhVzVsS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdKeUFnSnlBcklHeHBibVU3WEc0Z0lDQWdJQ0FnSUNBZ2ZTa3VhbTlwYmlnblhGeHVKeWt1YzNWaWMzUnlLRElwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lITjBjaUE5SUNkY1hHNG5JQ3NnYzNSeUxuTndiR2wwS0NkY1hHNG5LUzV0WVhBb1puVnVZM1JwYjI0b2JHbHVaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlDY2dJQ0FuSUNzZ2JHbHVaVHRjYmlBZ0lDQWdJQ0FnSUNCOUtTNXFiMmx1S0NkY1hHNG5LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQnpkSElnUFNCamRIZ3VjM1I1YkdsNlpTZ25XME5wY21OMWJHRnlYU2NzSUNkemNHVmphV0ZzSnlrN1hHNGdJQ0FnZlZ4dUlDQjlYRzRnSUdsbUlDaHBjMVZ1WkdWbWFXNWxaQ2h1WVcxbEtTa2dlMXh1SUNBZ0lHbG1JQ2hoY25KaGVTQW1KaUJyWlhrdWJXRjBZMmdvTDE1Y1hHUXJKQzhwS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnYzNSeU8xeHVJQ0FnSUgxY2JpQWdJQ0J1WVcxbElEMGdTbE5QVGk1emRISnBibWRwWm5rb0p5Y2dLeUJyWlhrcE8xeHVJQ0FnSUdsbUlDaHVZVzFsTG0xaGRHTm9LQzllWENJb1cyRXRla0V0V2w5ZFcyRXRla0V0V2w4d0xUbGRLaWxjSWlRdktTa2dlMXh1SUNBZ0lDQWdibUZ0WlNBOUlHNWhiV1V1YzNWaWMzUnlLREVzSUc1aGJXVXViR1Z1WjNSb0lDMGdNaWs3WEc0Z0lDQWdJQ0J1WVcxbElEMGdZM1I0TG5OMGVXeHBlbVVvYm1GdFpTd2dKMjVoYldVbktUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnYm1GdFpTQTlJRzVoYldVdWNtVndiR0ZqWlNndkp5OW5MQ0JjSWx4Y1hGd25YQ0lwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUM1eVpYQnNZV05sS0M5Y1hGeGNYQ0l2Wnl3Z0oxd2lKeWxjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTG5KbGNHeGhZMlVvTHloZVhDSjhYQ0lrS1M5bkxDQmNJaWRjSWlrN1hHNGdJQ0FnSUNCdVlXMWxJRDBnWTNSNExuTjBlV3hwZW1Vb2JtRnRaU3dnSjNOMGNtbHVaeWNwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUhKbGRIVnliaUJ1WVcxbElDc2dKem9nSnlBcklITjBjanRjYm4xY2JseHVYRzVtZFc1amRHbHZiaUJ5WldSMVkyVlViMU5wYm1kc1pWTjBjbWx1WnlodmRYUndkWFFzSUdKaGMyVXNJR0p5WVdObGN5a2dlMXh1SUNCMllYSWdiblZ0VEdsdVpYTkZjM1FnUFNBd08xeHVJQ0IyWVhJZ2JHVnVaM1JvSUQwZ2IzVjBjSFYwTG5KbFpIVmpaU2htZFc1amRHbHZiaWh3Y21WMkxDQmpkWElwSUh0Y2JpQWdJQ0J1ZFcxTWFXNWxjMFZ6ZENzck8xeHVJQ0FnSUdsbUlDaGpkWEl1YVc1a1pYaFBaaWduWEZ4dUp5a2dQajBnTUNrZ2JuVnRUR2x1WlhORmMzUXJLenRjYmlBZ0lDQnlaWFIxY200Z2NISmxkaUFySUdOMWNpNXlaWEJzWVdObEtDOWNYSFV3TURGaVhGeGJYRnhrWEZ4a1AyMHZaeXdnSnljcExteGxibWQwYUNBcklERTdYRzRnSUgwc0lEQXBPMXh1WEc0Z0lHbG1JQ2hzWlc1bmRHZ2dQaUEyTUNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJpY21GalpYTmJNRjBnSzF4dUlDQWdJQ0FnSUNBZ0lDQW9ZbUZ6WlNBOVBUMGdKeWNnUHlBbkp5QTZJR0poYzJVZ0t5QW5YRnh1SUNjcElDdGNiaUFnSUNBZ0lDQWdJQ0FnSnlBbklDdGNiaUFnSUNBZ0lDQWdJQ0FnYjNWMGNIVjBMbXB2YVc0b0p5eGNYRzRnSUNjcElDdGNiaUFnSUNBZ0lDQWdJQ0FnSnlBbklDdGNiaUFnSUNBZ0lDQWdJQ0FnWW5KaFkyVnpXekZkTzF4dUlDQjlYRzVjYmlBZ2NtVjBkWEp1SUdKeVlXTmxjMXN3WFNBcklHSmhjMlVnS3lBbklDY2dLeUJ2ZFhSd2RYUXVhbTlwYmlnbkxDQW5LU0FySUNjZ0p5QXJJR0p5WVdObGMxc3hYVHRjYm4xY2JseHVYRzR2THlCT1QxUkZPaUJVYUdWelpTQjBlWEJsSUdOb1pXTnJhVzVuSUdaMWJtTjBhVzl1Y3lCcGJuUmxiblJwYjI1aGJHeDVJR1J2YmlkMElIVnpaU0JnYVc1emRHRnVZMlZ2Wm1CY2JpOHZJR0psWTJGMWMyVWdhWFFnYVhNZ1puSmhaMmxzWlNCaGJtUWdZMkZ1SUdKbElHVmhjMmxzZVNCbVlXdGxaQ0IzYVhSb0lHQlBZbXBsWTNRdVkzSmxZWFJsS0NsZ0xseHVablZ1WTNScGIyNGdhWE5CY25KaGVTaGhjaWtnZTF4dUlDQnlaWFIxY200Z1FYSnlZWGt1YVhOQmNuSmhlU2hoY2lrN1hHNTlYRzVsZUhCdmNuUnpMbWx6UVhKeVlYa2dQU0JwYzBGeWNtRjVPMXh1WEc1bWRXNWpkR2x2YmlCcGMwSnZiMnhsWVc0b1lYSm5LU0I3WEc0Z0lISmxkSFZ5YmlCMGVYQmxiMllnWVhKbklEMDlQU0FuWW05dmJHVmhiaWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpRbTl2YkdWaGJpQTlJR2x6UW05dmJHVmhianRjYmx4dVpuVnVZM1JwYjI0Z2FYTk9kV3hzS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnWVhKbklEMDlQU0J1ZFd4c08xeHVmVnh1Wlhod2IzSjBjeTVwYzA1MWJHd2dQU0JwYzA1MWJHdzdYRzVjYm1aMWJtTjBhVzl1SUdselRuVnNiRTl5Vlc1a1pXWnBibVZrS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnWVhKbklEMDlJRzUxYkd3N1hHNTlYRzVsZUhCdmNuUnpMbWx6VG5Wc2JFOXlWVzVrWldacGJtVmtJRDBnYVhOT2RXeHNUM0pWYm1SbFptbHVaV1E3WEc1Y2JtWjFibU4wYVc5dUlHbHpUblZ0WW1WeUtHRnlaeWtnZTF4dUlDQnlaWFIxY200Z2RIbHdaVzltSUdGeVp5QTlQVDBnSjI1MWJXSmxjaWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpUblZ0WW1WeUlEMGdhWE5PZFcxaVpYSTdYRzVjYm1aMWJtTjBhVzl1SUdselUzUnlhVzVuS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKM04wY21sdVp5YzdYRzU5WEc1bGVIQnZjblJ6TG1selUzUnlhVzVuSUQwZ2FYTlRkSEpwYm1jN1hHNWNibVoxYm1OMGFXOXVJR2x6VTNsdFltOXNLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0ozTjViV0p2YkNjN1hHNTlYRzVsZUhCdmNuUnpMbWx6VTNsdFltOXNJRDBnYVhOVGVXMWliMnc3WEc1Y2JtWjFibU4wYVc5dUlHbHpWVzVrWldacGJtVmtLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdZWEpuSUQwOVBTQjJiMmxrSURBN1hHNTlYRzVsZUhCdmNuUnpMbWx6Vlc1a1pXWnBibVZrSUQwZ2FYTlZibVJsWm1sdVpXUTdYRzVjYm1aMWJtTjBhVzl1SUdselVtVm5SWGh3S0hKbEtTQjdYRzRnSUhKbGRIVnliaUJwYzA5aWFtVmpkQ2h5WlNrZ0ppWWdiMkpxWldOMFZHOVRkSEpwYm1jb2NtVXBJRDA5UFNBblcyOWlhbVZqZENCU1pXZEZlSEJkSnp0Y2JuMWNibVY0Y0c5eWRITXVhWE5TWldkRmVIQWdQU0JwYzFKbFowVjRjRHRjYmx4dVpuVnVZM1JwYjI0Z2FYTlBZbXBsWTNRb1lYSm5LU0I3WEc0Z0lISmxkSFZ5YmlCMGVYQmxiMllnWVhKbklEMDlQU0FuYjJKcVpXTjBKeUFtSmlCaGNtY2dJVDA5SUc1MWJHdzdYRzU5WEc1bGVIQnZjblJ6TG1selQySnFaV04wSUQwZ2FYTlBZbXBsWTNRN1hHNWNibVoxYm1OMGFXOXVJR2x6UkdGMFpTaGtLU0I3WEc0Z0lISmxkSFZ5YmlCcGMwOWlhbVZqZENoa0tTQW1KaUJ2WW1wbFkzUlViMU4wY21sdVp5aGtLU0E5UFQwZ0oxdHZZbXBsWTNRZ1JHRjBaVjBuTzF4dWZWeHVaWGh3YjNKMGN5NXBjMFJoZEdVZ1BTQnBjMFJoZEdVN1hHNWNibVoxYm1OMGFXOXVJR2x6UlhKeWIzSW9aU2tnZTF4dUlDQnlaWFIxY200Z2FYTlBZbXBsWTNRb1pTa2dKaVpjYmlBZ0lDQWdJQ2h2WW1wbFkzUlViMU4wY21sdVp5aGxLU0E5UFQwZ0oxdHZZbXBsWTNRZ1JYSnliM0pkSnlCOGZDQmxJR2x1YzNSaGJtTmxiMllnUlhKeWIzSXBPMXh1ZlZ4dVpYaHdiM0owY3k1cGMwVnljbTl5SUQwZ2FYTkZjbkp2Y2p0Y2JseHVablZ1WTNScGIyNGdhWE5HZFc1amRHbHZiaWhoY21jcElIdGNiaUFnY21WMGRYSnVJSFI1Y0dWdlppQmhjbWNnUFQwOUlDZG1kVzVqZEdsdmJpYzdYRzU5WEc1bGVIQnZjblJ6TG1selJuVnVZM1JwYjI0Z1BTQnBjMFoxYm1OMGFXOXVPMXh1WEc1bWRXNWpkR2x2YmlCcGMxQnlhVzFwZEdsMlpTaGhjbWNwSUh0Y2JpQWdjbVYwZFhKdUlHRnlaeUE5UFQwZ2JuVnNiQ0I4ZkZ4dUlDQWdJQ0FnSUNBZ2RIbHdaVzltSUdGeVp5QTlQVDBnSjJKdmIyeGxZVzRuSUh4OFhHNGdJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1lYSm5JRDA5UFNBbmJuVnRZbVZ5SnlCOGZGeHVJQ0FnSUNBZ0lDQWdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0ozTjBjbWx1WnljZ2ZIeGNiaUFnSUNBZ0lDQWdJSFI1Y0dWdlppQmhjbWNnUFQwOUlDZHplVzFpYjJ3bklIeDhJQ0F2THlCRlV6WWdjM2x0WW05c1hHNGdJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1lYSm5JRDA5UFNBbmRXNWtaV1pwYm1Wa0p6dGNibjFjYm1WNGNHOXlkSE11YVhOUWNtbHRhWFJwZG1VZ1BTQnBjMUJ5YVcxcGRHbDJaVHRjYmx4dVpYaHdiM0owY3k1cGMwSjFabVpsY2lBOUlISmxjWFZwY21Vb0p5NHZjM1Z3Y0c5eWRDOXBjMEoxWm1abGNpY3BPMXh1WEc1bWRXNWpkR2x2YmlCdlltcGxZM1JVYjFOMGNtbHVaeWh2S1NCN1hHNGdJSEpsZEhWeWJpQlBZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvYnlrN1hHNTlYRzVjYmx4dVpuVnVZM1JwYjI0Z2NHRmtLRzRwSUh0Y2JpQWdjbVYwZFhKdUlHNGdQQ0F4TUNBL0lDY3dKeUFySUc0dWRHOVRkSEpwYm1jb01UQXBJRG9nYmk1MGIxTjBjbWx1WnlneE1DazdYRzU5WEc1Y2JseHVkbUZ5SUcxdmJuUm9jeUE5SUZzblNtRnVKeXdnSjBabFlpY3NJQ2ROWVhJbkxDQW5RWEJ5Snl3Z0owMWhlU2NzSUNkS2RXNG5MQ0FuU25Wc0p5d2dKMEYxWnljc0lDZFRaWEFuTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FuVDJOMEp5d2dKMDV2ZGljc0lDZEVaV01uWFR0Y2JseHVMeThnTWpZZ1JtVmlJREUyT2pFNU9qTTBYRzVtZFc1amRHbHZiaUIwYVcxbGMzUmhiWEFvS1NCN1hHNGdJSFpoY2lCa0lEMGdibVYzSUVSaGRHVW9LVHRjYmlBZ2RtRnlJSFJwYldVZ1BTQmJjR0ZrS0dRdVoyVjBTRzkxY25Nb0tTa3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lIQmhaQ2hrTG1kbGRFMXBiblYwWlhNb0tTa3NYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lIQmhaQ2hrTG1kbGRGTmxZMjl1WkhNb0tTbGRMbXB2YVc0b0p6b25LVHRjYmlBZ2NtVjBkWEp1SUZ0a0xtZGxkRVJoZEdVb0tTd2diVzl1ZEdoelcyUXVaMlYwVFc5dWRHZ29LVjBzSUhScGJXVmRMbXB2YVc0b0p5QW5LVHRjYm4xY2JseHVYRzR2THlCc2IyY2dhWE1nYW5WemRDQmhJSFJvYVc0Z2QzSmhjSEJsY2lCMGJ5QmpiMjV6YjJ4bExteHZaeUIwYUdGMElIQnlaWEJsYm1SeklHRWdkR2x0WlhOMFlXMXdYRzVsZUhCdmNuUnpMbXh2WnlBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNCamIyNXpiMnhsTG14dlp5Z25KWE1nTFNBbGN5Y3NJSFJwYldWemRHRnRjQ2dwTENCbGVIQnZjblJ6TG1admNtMWhkQzVoY0hCc2VTaGxlSEJ2Y25SekxDQmhjbWQxYldWdWRITXBLVHRjYm4wN1hHNWNibHh1THlvcVhHNGdLaUJKYm1obGNtbDBJSFJvWlNCd2NtOTBiM1I1Y0dVZ2JXVjBhRzlrY3lCbWNtOXRJRzl1WlNCamIyNXpkSEoxWTNSdmNpQnBiblJ2SUdGdWIzUm9aWEl1WEc0Z0tseHVJQ29nVkdobElFWjFibU4wYVc5dUxuQnliM1J2ZEhsd1pTNXBibWhsY21sMGN5Qm1jbTl0SUd4aGJtY3Vhbk1nY21WM2NtbDBkR1Z1SUdGeklHRWdjM1JoYm1SaGJHOXVaVnh1SUNvZ1puVnVZM1JwYjI0Z0tHNXZkQ0J2YmlCR2RXNWpkR2x2Ymk1d2NtOTBiM1I1Y0dVcExpQk9UMVJGT2lCSlppQjBhR2x6SUdacGJHVWdhWE1nZEc4Z1ltVWdiRzloWkdWa1hHNGdLaUJrZFhKcGJtY2dZbTl2ZEhOMGNtRndjR2x1WnlCMGFHbHpJR1oxYm1OMGFXOXVJRzVsWldSeklIUnZJR0psSUhKbGQzSnBkSFJsYmlCMWMybHVaeUJ6YjIxbElHNWhkR2wyWlZ4dUlDb2dablZ1WTNScGIyNXpJR0Z6SUhCeWIzUnZkSGx3WlNCelpYUjFjQ0IxYzJsdVp5QnViM0p0WVd3Z1NtRjJZVk5qY21sd2RDQmtiMlZ6SUc1dmRDQjNiM0pySUdGelhHNGdLaUJsZUhCbFkzUmxaQ0JrZFhKcGJtY2dZbTl2ZEhOMGNtRndjR2x1WnlBb2MyVmxJRzFwY25KdmNpNXFjeUJwYmlCeU1URTBPVEF6S1M1Y2JpQXFYRzRnS2lCQWNHRnlZVzBnZTJaMWJtTjBhVzl1ZlNCamRHOXlJRU52Ym5OMGNuVmpkRzl5SUdaMWJtTjBhVzl1SUhkb2FXTm9JRzVsWldSeklIUnZJR2x1YUdWeWFYUWdkR2hsWEc0Z0tpQWdJQ0FnY0hKdmRHOTBlWEJsTGx4dUlDb2dRSEJoY21GdElIdG1kVzVqZEdsdmJuMGdjM1Z3WlhKRGRHOXlJRU52Ym5OMGNuVmpkRzl5SUdaMWJtTjBhVzl1SUhSdklHbHVhR1Z5YVhRZ2NISnZkRzkwZVhCbElHWnliMjB1WEc0Z0tpOWNibVY0Y0c5eWRITXVhVzVvWlhKcGRITWdQU0J5WlhGMWFYSmxLQ2RwYm1obGNtbDBjeWNwTzF4dVhHNWxlSEJ2Y25SekxsOWxlSFJsYm1RZ1BTQm1kVzVqZEdsdmJpaHZjbWxuYVc0c0lHRmtaQ2tnZTF4dUlDQXZMeUJFYjI0bmRDQmtieUJoYm5sMGFHbHVaeUJwWmlCaFpHUWdhWE51SjNRZ1lXNGdiMkpxWldOMFhHNGdJR2xtSUNnaFlXUmtJSHg4SUNGcGMwOWlhbVZqZENoaFpHUXBLU0J5WlhSMWNtNGdiM0pwWjJsdU8xeHVYRzRnSUhaaGNpQnJaWGx6SUQwZ1QySnFaV04wTG10bGVYTW9ZV1JrS1R0Y2JpQWdkbUZ5SUdrZ1BTQnJaWGx6TG14bGJtZDBhRHRjYmlBZ2QyaHBiR1VnS0drdExTa2dlMXh1SUNBZ0lHOXlhV2RwYmx0clpYbHpXMmxkWFNBOUlHRmtaRnRyWlhselcybGRYVHRjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdiM0pwWjJsdU8xeHVmVHRjYmx4dVpuVnVZM1JwYjI0Z2FHRnpUM2R1VUhKdmNHVnlkSGtvYjJKcUxDQndjbTl3S1NCN1hHNGdJSEpsZEhWeWJpQlBZbXBsWTNRdWNISnZkRzkwZVhCbExtaGhjMDkzYmxCeWIzQmxjblI1TG1OaGJHd29iMkpxTENCd2NtOXdLVHRjYm4xY2JpSmRmUT09IiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zXG4gKi9cblxudmFyIHV0aWwgPSB7fTtcblxudXRpbC5pc09iamVjdCA9IGZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG51dGlsLmlzTnVtYmVyID0gZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxudXRpbC5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5cbnV0aWwuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKXtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cblxuLyoqXG4gKiBFdmVudEVtaXR0ZXIgY2xhc3NcbiAqL1xuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF1dGlsLmlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicgJiYgIXRoaXMuX2V2ZW50cy5lcnJvcikge1xuICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICB1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKHV0aWwuaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmICh1dGlsLmlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcblxuICAgICAgaWYgKHV0aWwuaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIH1cbiAgICAgIGlmICh1dGlsLmlzRnVuY3Rpb24oY29uc29sZS50cmFjZSkpXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICh1dGlsLmlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAodXRpbC5pc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vLyB2aW06dHM9NDpzdHM9NDpzdz00OlxuLyohXG4gKlxuICogQ29weXJpZ2h0IDIwMDktMjAxMiBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXG4gKiBsaWNlbnNlIGZvdW5kIGF0IGh0dHA6Ly9naXRodWIuY29tL2tyaXNrb3dhbC9xL3Jhdy9tYXN0ZXIvTElDRU5TRVxuICpcbiAqIFdpdGggcGFydHMgYnkgVHlsZXIgQ2xvc2VcbiAqIENvcHlyaWdodCAyMDA3LTIwMDkgVHlsZXIgQ2xvc2UgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgWCBsaWNlbnNlIGZvdW5kXG4gKiBhdCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLmh0bWxcbiAqIEZvcmtlZCBhdCByZWZfc2VuZC5qcyB2ZXJzaW9uOiAyMDA5LTA1LTExXG4gKlxuICogV2l0aCBwYXJ0cyBieSBNYXJrIE1pbGxlclxuICogQ29weXJpZ2h0IChDKSAyMDExIEdvb2dsZSBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICovXG5cbihmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gVGhpcyBmaWxlIHdpbGwgZnVuY3Rpb24gcHJvcGVybHkgYXMgYSA8c2NyaXB0PiB0YWcsIG9yIGEgbW9kdWxlXG4gICAgLy8gdXNpbmcgQ29tbW9uSlMgYW5kIE5vZGVKUyBvciBSZXF1aXJlSlMgbW9kdWxlIGZvcm1hdHMuICBJblxuICAgIC8vIENvbW1vbi9Ob2RlL1JlcXVpcmVKUywgdGhlIG1vZHVsZSBleHBvcnRzIHRoZSBRIEFQSSBhbmQgd2hlblxuICAgIC8vIGV4ZWN1dGVkIGFzIGEgc2ltcGxlIDxzY3JpcHQ+LCBpdCBjcmVhdGVzIGEgUSBnbG9iYWwgaW5zdGVhZC5cblxuICAgIC8vIE1vbnRhZ2UgUmVxdWlyZVxuICAgIGlmICh0eXBlb2YgYm9vdHN0cmFwID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgYm9vdHN0cmFwKFwicHJvbWlzZVwiLCBkZWZpbml0aW9uKTtcblxuICAgIC8vIENvbW1vbkpTXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO1xuXG4gICAgLy8gUmVxdWlyZUpTXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZGVmaW5pdGlvbik7XG5cbiAgICAvLyBTRVMgKFNlY3VyZSBFY21hU2NyaXB0KVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlcyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoIXNlcy5vaygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXMubWFrZVEgPSBkZWZpbml0aW9uO1xuICAgICAgICB9XG5cbiAgICAvLyA8c2NyaXB0PlxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBQcmVmZXIgd2luZG93IG92ZXIgc2VsZiBmb3IgYWRkLW9uIHNjcmlwdHMuIFVzZSBzZWxmIGZvclxuICAgICAgICAvLyBub24td2luZG93ZWQgY29udGV4dHMuXG4gICAgICAgIHZhciBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogc2VsZjtcblxuICAgICAgICAvLyBHZXQgdGhlIGB3aW5kb3dgIG9iamVjdCwgc2F2ZSB0aGUgcHJldmlvdXMgUSBnbG9iYWxcbiAgICAgICAgLy8gYW5kIGluaXRpYWxpemUgUSBhcyBhIGdsb2JhbC5cbiAgICAgICAgdmFyIHByZXZpb3VzUSA9IGdsb2JhbC5RO1xuICAgICAgICBnbG9iYWwuUSA9IGRlZmluaXRpb24oKTtcblxuICAgICAgICAvLyBBZGQgYSBub0NvbmZsaWN0IGZ1bmN0aW9uIHNvIFEgY2FuIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgICAgLy8gZ2xvYmFsIG5hbWVzcGFjZS5cbiAgICAgICAgZ2xvYmFsLlEubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdsb2JhbC5RID0gcHJldmlvdXNRO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGVudmlyb25tZW50IHdhcyBub3QgYW50aWNpcGF0ZWQgYnkgUS4gUGxlYXNlIGZpbGUgYSBidWcuXCIpO1xuICAgIH1cblxufSkoZnVuY3Rpb24gKCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBoYXNTdGFja3MgPSBmYWxzZTtcbnRyeSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG59IGNhdGNoIChlKSB7XG4gICAgaGFzU3RhY2tzID0gISFlLnN0YWNrO1xufVxuXG4vLyBBbGwgY29kZSBhZnRlciB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMgcmVwb3J0ZWRcbi8vIGJ5IFEuXG52YXIgcVN0YXJ0aW5nTGluZSA9IGNhcHR1cmVMaW5lKCk7XG52YXIgcUZpbGVOYW1lO1xuXG4vLyBzaGltc1xuXG4vLyB1c2VkIGZvciBmYWxsYmFjayBpbiBcImFsbFJlc29sdmVkXCJcbnZhciBub29wID0gZnVuY3Rpb24gKCkge307XG5cbi8vIFVzZSB0aGUgZmFzdGVzdCBwb3NzaWJsZSBtZWFucyB0byBleGVjdXRlIGEgdGFzayBpbiBhIGZ1dHVyZSB0dXJuXG4vLyBvZiB0aGUgZXZlbnQgbG9vcC5cbnZhciBuZXh0VGljayA9KGZ1bmN0aW9uICgpIHtcbiAgICAvLyBsaW5rZWQgbGlzdCBvZiB0YXNrcyAoc2luZ2xlLCB3aXRoIGhlYWQgbm9kZSlcbiAgICB2YXIgaGVhZCA9IHt0YXNrOiB2b2lkIDAsIG5leHQ6IG51bGx9O1xuICAgIHZhciB0YWlsID0gaGVhZDtcbiAgICB2YXIgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICB2YXIgcmVxdWVzdFRpY2sgPSB2b2lkIDA7XG4gICAgdmFyIGlzTm9kZUpTID0gZmFsc2U7XG4gICAgLy8gcXVldWUgZm9yIGxhdGUgdGFza3MsIHVzZWQgYnkgdW5oYW5kbGVkIHJlamVjdGlvbiB0cmFja2luZ1xuICAgIHZhciBsYXRlclF1ZXVlID0gW107XG5cbiAgICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAgICAgLyoganNoaW50IGxvb3BmdW5jOiB0cnVlICovXG4gICAgICAgIHZhciB0YXNrLCBkb21haW47XG5cbiAgICAgICAgd2hpbGUgKGhlYWQubmV4dCkge1xuICAgICAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICAgICAgICAgIHRhc2sgPSBoZWFkLnRhc2s7XG4gICAgICAgICAgICBoZWFkLnRhc2sgPSB2b2lkIDA7XG4gICAgICAgICAgICBkb21haW4gPSBoZWFkLmRvbWFpbjtcblxuICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcnVuU2luZ2xlKHRhc2ssIGRvbWFpbik7XG5cbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAobGF0ZXJRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRhc2sgPSBsYXRlclF1ZXVlLnBvcCgpO1xuICAgICAgICAgICAgcnVuU2luZ2xlKHRhc2spO1xuICAgICAgICB9XG4gICAgICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIHJ1bnMgYSBzaW5nbGUgZnVuY3Rpb24gaW4gdGhlIGFzeW5jIHF1ZXVlXG4gICAgZnVuY3Rpb24gcnVuU2luZ2xlKHRhc2ssIGRvbWFpbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGFzaygpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xuICAgICAgICAgICAgICAgIC8vIEluIG5vZGUsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIGNvbnNpZGVyZWQgZmF0YWwgZXJyb3JzLlxuICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gc3luY2hyb25vdXNseSB0byBpbnRlcnJ1cHQgZmx1c2hpbmchXG5cbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29udGludWF0aW9uIGlmIHRoZSB1bmNhdWdodCBleGNlcHRpb24gaXMgc3VwcHJlc3NlZFxuICAgICAgICAgICAgICAgIC8vIGxpc3RlbmluZyBcInVuY2F1Z2h0RXhjZXB0aW9uXCIgZXZlbnRzIChhcyBkb21haW5zIGRvZXMpLlxuICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRocm93IGU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIGFzeW5jaHJvbm91c2x5IHRvIGF2b2lkIHNsb3ctZG93bnMuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmV4dFRpY2sgPSBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICB0YWlsID0gdGFpbC5uZXh0ID0ge1xuICAgICAgICAgICAgdGFzazogdGFzayxcbiAgICAgICAgICAgIGRvbWFpbjogaXNOb2RlSlMgJiYgcHJvY2Vzcy5kb21haW4sXG4gICAgICAgICAgICBuZXh0OiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgcHJvY2Vzcy50b1N0cmluZygpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG4gICAgICAgIC8vIEVuc3VyZSBRIGlzIGluIGEgcmVhbCBOb2RlIGVudmlyb25tZW50LCB3aXRoIGEgYHByb2Nlc3MubmV4dFRpY2tgLlxuICAgICAgICAvLyBUbyBzZWUgdGhyb3VnaCBmYWtlIE5vZGUgZW52aXJvbm1lbnRzOlxuICAgICAgICAvLyAqIE1vY2hhIHRlc3QgcnVubmVyIC0gZXhwb3NlcyBhIGBwcm9jZXNzYCBnbG9iYWwgd2l0aG91dCBhIGBuZXh0VGlja2BcbiAgICAgICAgLy8gKiBCcm93c2VyaWZ5IC0gZXhwb3NlcyBhIGBwcm9jZXNzLm5leFRpY2tgIGZ1bmN0aW9uIHRoYXQgdXNlc1xuICAgICAgICAvLyAgIGBzZXRUaW1lb3V0YC4gSW4gdGhpcyBjYXNlIGBzZXRJbW1lZGlhdGVgIGlzIHByZWZlcnJlZCBiZWNhdXNlXG4gICAgICAgIC8vICAgIGl0IGlzIGZhc3Rlci4gQnJvd3NlcmlmeSdzIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkc1xuICAgICAgICAvLyAgIFwiW29iamVjdCBPYmplY3RdXCIsIHdoaWxlIGluIGEgcmVhbCBOb2RlIGVudmlyb25tZW50XG4gICAgICAgIC8vICAgYHByb2Nlc3MubmV4dFRpY2soKWAgeWllbGRzIFwiW29iamVjdCBwcm9jZXNzXVwiLlxuICAgICAgICBpc05vZGVKUyA9IHRydWU7XG5cbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIC8vIEluIElFMTAsIE5vZGUuanMgMC45Kywgb3IgaHR0cHM6Ly9naXRodWIuY29tL05vYmxlSlMvc2V0SW1tZWRpYXRlXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZsdXNoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgICAgICAvLyBodHRwOi8vd3d3Lm5vbmJsb2NraW5nLmlvLzIwMTEvMDYvd2luZG93bmV4dHRpY2suaHRtbFxuICAgICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgICAvLyBBdCBsZWFzdCBTYWZhcmkgVmVyc2lvbiA2LjAuNSAoODUzNi4zMC4xKSBpbnRlcm1pdHRlbnRseSBjYW5ub3QgY3JlYXRlXG4gICAgICAgIC8vIHdvcmtpbmcgbWVzc2FnZSBwb3J0cyB0aGUgZmlyc3QgdGltZSBhIHBhZ2UgbG9hZHMuXG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSByZXF1ZXN0UG9ydFRpY2s7XG4gICAgICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlcXVlc3RQb3J0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE9wZXJhIHJlcXVpcmVzIHVzIHRvIHByb3ZpZGUgYSBtZXNzYWdlIHBheWxvYWQsIHJlZ2FyZGxlc3Mgb2ZcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgd2UgdXNlIGl0LlxuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgIHJlcXVlc3RQb3J0VGljaygpO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gb2xkIGJyb3dzZXJzXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIHJ1bnMgYSB0YXNrIGFmdGVyIGFsbCBvdGhlciB0YXNrcyBoYXZlIGJlZW4gcnVuXG4gICAgLy8gdGhpcyBpcyB1c2VmdWwgZm9yIHVuaGFuZGxlZCByZWplY3Rpb24gdHJhY2tpbmcgdGhhdCBuZWVkcyB0byBoYXBwZW5cbiAgICAvLyBhZnRlciBhbGwgYHRoZW5gZCB0YXNrcyBoYXZlIGJlZW4gcnVuLlxuICAgIG5leHRUaWNrLnJ1bkFmdGVyID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgbGF0ZXJRdWV1ZS5wdXNoKHRhc2spO1xuICAgICAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgICAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXF1ZXN0VGljaygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gbmV4dFRpY2s7XG59KSgpO1xuXG4vLyBBdHRlbXB0IHRvIG1ha2UgZ2VuZXJpY3Mgc2FmZSBpbiB0aGUgZmFjZSBvZiBkb3duc3RyZWFtXG4vLyBtb2RpZmljYXRpb25zLlxuLy8gVGhlcmUgaXMgbm8gc2l0dWF0aW9uIHdoZXJlIHRoaXMgaXMgbmVjZXNzYXJ5LlxuLy8gSWYgeW91IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsIHRoZXNlIHByaW1vcmRpYWxzIG5lZWQgdG8gYmVcbi8vIGRlZXBseSBmcm96ZW4gYW55d2F5LCBhbmQgaWYgeW91IGRvbuKAmXQgbmVlZCBhIHNlY3VyaXR5IGd1YXJhbnRlZSxcbi8vIHRoaXMgaXMganVzdCBwbGFpbiBwYXJhbm9pZC5cbi8vIEhvd2V2ZXIsIHRoaXMgKiptaWdodCoqIGhhdmUgdGhlIG5pY2Ugc2lkZS1lZmZlY3Qgb2YgcmVkdWNpbmcgdGhlIHNpemUgb2Zcbi8vIHRoZSBtaW5pZmllZCBjb2RlIGJ5IHJlZHVjaW5nIHguY2FsbCgpIHRvIG1lcmVseSB4KClcbi8vIFNlZSBNYXJrIE1pbGxlcuKAmXMgZXhwbGFuYXRpb24gb2Ygd2hhdCB0aGlzIGRvZXMuXG4vLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1jb252ZW50aW9uczpzYWZlX21ldGFfcHJvZ3JhbW1pbmdcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbDtcbmZ1bmN0aW9uIHVuY3VycnlUaGlzKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY2FsbC5hcHBseShmLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG4vLyBUaGlzIGlzIGVxdWl2YWxlbnQsIGJ1dCBzbG93ZXI6XG4vLyB1bmN1cnJ5VGhpcyA9IEZ1bmN0aW9uX2JpbmQuYmluZChGdW5jdGlvbl9iaW5kLmNhbGwpO1xuLy8gaHR0cDovL2pzcGVyZi5jb20vdW5jdXJyeXRoaXNcblxudmFyIGFycmF5X3NsaWNlID0gdW5jdXJyeVRoaXMoQXJyYXkucHJvdG90eXBlLnNsaWNlKTtcblxudmFyIGFycmF5X3JlZHVjZSA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UgfHwgZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcykge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIC8vIGNvbmNlcm5pbmcgdGhlIGluaXRpYWwgdmFsdWUsIGlmIG9uZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIHNlZWsgdG8gdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBhcnJheSwgYWNjb3VudGluZ1xuICAgICAgICAgICAgLy8gZm9yIHRoZSBwb3NzaWJpbGl0eSB0aGF0IGlzIGlzIGEgc3BhcnNlIGFycmF5XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzaXMgPSB0aGlzW2luZGV4KytdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCsraW5kZXggPj0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlICgxKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWR1Y2VcbiAgICAgICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyBhY2NvdW50IGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCB0aGUgYXJyYXkgaXMgc3BhcnNlXG4gICAgICAgICAgICBpZiAoaW5kZXggaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGJhc2lzID0gY2FsbGJhY2soYmFzaXMsIHRoaXNbaW5kZXhdLCBpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2lzO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9pbmRleE9mID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5vdCBhIHZlcnkgZ29vZCBzaGltLCBidXQgZ29vZCBlbm91Z2ggZm9yIG91ciBvbmUgdXNlIG9mIGl0XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9tYXAgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUubWFwIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3ApIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY29sbGVjdCA9IFtdO1xuICAgICAgICBhcnJheV9yZWR1Y2Uoc2VsZiwgZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBjb2xsZWN0LnB1c2goY2FsbGJhY2suY2FsbCh0aGlzcCwgdmFsdWUsIGluZGV4LCBzZWxmKSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIHJldHVybiBjb2xsZWN0O1xuICAgIH1cbik7XG5cbnZhciBvYmplY3RfY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG4gICAgZnVuY3Rpb24gVHlwZSgpIHsgfVxuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHJldHVybiBuZXcgVHlwZSgpO1xufTtcblxudmFyIG9iamVjdF9oYXNPd25Qcm9wZXJ0eSA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuXG52YXIgb2JqZWN0X2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3RfaGFzT3duUHJvcGVydHkob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn07XG5cbnZhciBvYmplY3RfdG9TdHJpbmcgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IE9iamVjdCh2YWx1ZSk7XG59XG5cbi8vIGdlbmVyYXRvciByZWxhdGVkIHNoaW1zXG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBmdW5jdGlvbiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpbiBTcGlkZXJNb25rZXkuXG5mdW5jdGlvbiBpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgb2JqZWN0X3RvU3RyaW5nKGV4Y2VwdGlvbikgPT09IFwiW29iamVjdCBTdG9wSXRlcmF0aW9uXVwiIHx8XG4gICAgICAgIGV4Y2VwdGlvbiBpbnN0YW5jZW9mIFFSZXR1cm5WYWx1ZVxuICAgICk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBoZWxwZXIgYW5kIFEucmV0dXJuIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluXG4vLyBTcGlkZXJNb25rZXkuXG52YXIgUVJldHVyblZhbHVlO1xuaWYgKHR5cGVvZiBSZXR1cm5WYWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIFFSZXR1cm5WYWx1ZSA9IFJldHVyblZhbHVlO1xufSBlbHNlIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH07XG59XG5cbi8vIGxvbmcgc3RhY2sgdHJhY2VzXG5cbnZhciBTVEFDS19KVU1QX1NFUEFSQVRPUiA9IFwiRnJvbSBwcmV2aW91cyBldmVudDpcIjtcblxuZnVuY3Rpb24gbWFrZVN0YWNrVHJhY2VMb25nKGVycm9yLCBwcm9taXNlKSB7XG4gICAgLy8gSWYgcG9zc2libGUsIHRyYW5zZm9ybSB0aGUgZXJyb3Igc3RhY2sgdHJhY2UgYnkgcmVtb3ZpbmcgTm9kZSBhbmQgUVxuICAgIC8vIGNydWZ0LCB0aGVuIGNvbmNhdGVuYXRpbmcgd2l0aCB0aGUgc3RhY2sgdHJhY2Ugb2YgYHByb21pc2VgLiBTZWUgIzU3LlxuICAgIGlmIChoYXNTdGFja3MgJiZcbiAgICAgICAgcHJvbWlzZS5zdGFjayAmJlxuICAgICAgICB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgZXJyb3IgIT09IG51bGwgJiZcbiAgICAgICAgZXJyb3Iuc3RhY2sgJiZcbiAgICAgICAgZXJyb3Iuc3RhY2suaW5kZXhPZihTVEFDS19KVU1QX1NFUEFSQVRPUikgPT09IC0xXG4gICAgKSB7XG4gICAgICAgIHZhciBzdGFja3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcCA9IHByb21pc2U7ICEhcDsgcCA9IHAuc291cmNlKSB7XG4gICAgICAgICAgICBpZiAocC5zdGFjaykge1xuICAgICAgICAgICAgICAgIHN0YWNrcy51bnNoaWZ0KHAuc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YWNrcy51bnNoaWZ0KGVycm9yLnN0YWNrKTtcblxuICAgICAgICB2YXIgY29uY2F0ZWRTdGFja3MgPSBzdGFja3Muam9pbihcIlxcblwiICsgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgKyBcIlxcblwiKTtcbiAgICAgICAgZXJyb3Iuc3RhY2sgPSBmaWx0ZXJTdGFja1N0cmluZyhjb25jYXRlZFN0YWNrcyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJTdGFja1N0cmluZyhzdGFja1N0cmluZykge1xuICAgIHZhciBsaW5lcyA9IHN0YWNrU3RyaW5nLnNwbGl0KFwiXFxuXCIpO1xuICAgIHZhciBkZXNpcmVkTGluZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG5cbiAgICAgICAgaWYgKCFpc0ludGVybmFsRnJhbWUobGluZSkgJiYgIWlzTm9kZUZyYW1lKGxpbmUpICYmIGxpbmUpIHtcbiAgICAgICAgICAgIGRlc2lyZWRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXNpcmVkTGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgcmV0dXJuIHN0YWNrTGluZS5pbmRleE9mKFwiKG1vZHVsZS5qczpcIikgIT09IC0xIHx8XG4gICAgICAgICAgIHN0YWNrTGluZS5pbmRleE9mKFwiKG5vZGUuanM6XCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSkge1xuICAgIC8vIE5hbWVkIGZ1bmN0aW9uczogXCJhdCBmdW5jdGlvbk5hbWUgKGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyKVwiXG4gICAgLy8gSW4gSUUxMCBmdW5jdGlvbiBuYW1lIGNhbiBoYXZlIHNwYWNlcyAoXCJBbm9ueW1vdXMgZnVuY3Rpb25cIikgT19vXG4gICAgdmFyIGF0dGVtcHQxID0gL2F0IC4rIFxcKCguKyk6KFxcZCspOig/OlxcZCspXFwpJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0MSkge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQxWzFdLCBOdW1iZXIoYXR0ZW1wdDFbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBBbm9ueW1vdXMgZnVuY3Rpb25zOiBcImF0IGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDIgPSAvYXQgKFteIF0rKTooXFxkKyk6KD86XFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQyKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDJbMV0sIE51bWJlcihhdHRlbXB0MlsyXSldO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3ggc3R5bGU6IFwiZnVuY3Rpb25AZmlsZW5hbWU6bGluZU51bWJlciBvciBAZmlsZW5hbWU6bGluZU51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQzID0gLy4qQCguKyk6KFxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mykge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQzWzFdLCBOdW1iZXIoYXR0ZW1wdDNbMl0pXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzSW50ZXJuYWxGcmFtZShzdGFja0xpbmUpIHtcbiAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSk7XG5cbiAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgIHZhciBsaW5lTnVtYmVyID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuXG4gICAgcmV0dXJuIGZpbGVOYW1lID09PSBxRmlsZU5hbWUgJiZcbiAgICAgICAgbGluZU51bWJlciA+PSBxU3RhcnRpbmdMaW5lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPD0gcUVuZGluZ0xpbmU7XG59XG5cbi8vIGRpc2NvdmVyIG93biBmaWxlIG5hbWUgYW5kIGxpbmUgbnVtYmVyIHJhbmdlIGZvciBmaWx0ZXJpbmcgc3RhY2tcbi8vIHRyYWNlc1xuZnVuY3Rpb24gY2FwdHVyZUxpbmUoKSB7XG4gICAgaWYgKCFoYXNTdGFja3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFjay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgdmFyIGZpcnN0TGluZSA9IGxpbmVzWzBdLmluZGV4T2YoXCJAXCIpID4gMCA/IGxpbmVzWzFdIDogbGluZXNbMl07XG4gICAgICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoZmlyc3RMaW5lKTtcbiAgICAgICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHFGaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZShjYWxsYmFjaywgbmFtZSwgYWx0ZXJuYXRpdmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlLndhcm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKG5hbWUgKyBcIiBpcyBkZXByZWNhdGVkLCB1c2UgXCIgKyBhbHRlcm5hdGl2ZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgXCIgaW5zdGVhZC5cIiwgbmV3IEVycm9yKFwiXCIpLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoY2FsbGJhY2ssIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLy8gZW5kIG9mIHNoaW1zXG4vLyBiZWdpbm5pbmcgb2YgcmVhbCB3b3JrXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UsIHBhc3NlcyBwcm9taXNlcyB0aHJvdWdoLCBvclxuICogY29lcmNlcyBwcm9taXNlcyBmcm9tIGRpZmZlcmVudCBzeXN0ZW1zLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2Ugb3IgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBRKHZhbHVlKSB7XG4gICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IGEgUHJvbWlzZSwgcmV0dXJuIGl0IGRpcmVjdGx5LiAgVGhpcyBlbmFibGVzXG4gICAgLy8gdGhlIHJlc29sdmUgZnVuY3Rpb24gdG8gYm90aCBiZSB1c2VkIHRvIGNyZWF0ZWQgcmVmZXJlbmNlcyBmcm9tIG9iamVjdHMsXG4gICAgLy8gYnV0IHRvIHRvbGVyYWJseSBjb2VyY2Ugbm9uLXByb21pc2VzIHRvIHByb21pc2VzLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXG4gICAgaWYgKGlzUHJvbWlzZUFsaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY29lcmNlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVsZmlsbCh2YWx1ZSk7XG4gICAgfVxufVxuUS5yZXNvbHZlID0gUTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHRhc2sgaW4gYSBmdXR1cmUgdHVybiBvZiB0aGUgZXZlbnQgbG9vcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRhc2tcbiAqL1xuUS5uZXh0VGljayA9IG5leHRUaWNrO1xuXG4vKipcbiAqIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IGxvbmcgc3RhY2sgdHJhY2VzIHdpbGwgYmUgb25cbiAqL1xuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XG5cbi8vIGVuYWJsZSBsb25nIHN0YWNrcyBpZiBRX0RFQlVHIGlzIHNldFxuaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MgJiYgcHJvY2Vzcy5lbnYgJiYgcHJvY2Vzcy5lbnYuUV9ERUJVRykge1xuICAgIFEubG9uZ1N0YWNrU3VwcG9ydCA9IHRydWU7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHtwcm9taXNlLCByZXNvbHZlLCByZWplY3R9IG9iamVjdC5cbiAqXG4gKiBgcmVzb2x2ZWAgaXMgYSBjYWxsYmFjayB0byBpbnZva2Ugd2l0aCBhIG1vcmUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZVxuICogcHJvbWlzZS4gVG8gZnVsZmlsbCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGFueSB2YWx1ZSB0aGF0IGlzXG4gKiBub3QgYSB0aGVuYWJsZS4gVG8gcmVqZWN0IHRoZSBwcm9taXNlLCBpbnZva2UgYHJlc29sdmVgIHdpdGggYSByZWplY3RlZFxuICogdGhlbmFibGUsIG9yIGludm9rZSBgcmVqZWN0YCB3aXRoIHRoZSByZWFzb24gZGlyZWN0bHkuIFRvIHJlc29sdmUgdGhlXG4gKiBwcm9taXNlIHRvIGFub3RoZXIgdGhlbmFibGUsIHRodXMgcHV0dGluZyBpdCBpbiB0aGUgc2FtZSBzdGF0ZSwgaW52b2tlXG4gKiBgcmVzb2x2ZWAgd2l0aCB0aGF0IG90aGVyIHRoZW5hYmxlLlxuICovXG5RLmRlZmVyID0gZGVmZXI7XG5mdW5jdGlvbiBkZWZlcigpIHtcbiAgICAvLyBpZiBcIm1lc3NhZ2VzXCIgaXMgYW4gXCJBcnJheVwiLCB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBwcm9taXNlIGhhcyBub3QgeWV0XG4gICAgLy8gYmVlbiByZXNvbHZlZC4gIElmIGl0IGlzIFwidW5kZWZpbmVkXCIsIGl0IGhhcyBiZWVuIHJlc29sdmVkLiAgRWFjaFxuICAgIC8vIGVsZW1lbnQgb2YgdGhlIG1lc3NhZ2VzIGFycmF5IGlzIGl0c2VsZiBhbiBhcnJheSBvZiBjb21wbGV0ZSBhcmd1bWVudHMgdG9cbiAgICAvLyBmb3J3YXJkIHRvIHRoZSByZXNvbHZlZCBwcm9taXNlLiAgV2UgY29lcmNlIHRoZSByZXNvbHV0aW9uIHZhbHVlIHRvIGFcbiAgICAvLyBwcm9taXNlIHVzaW5nIHRoZSBgcmVzb2x2ZWAgZnVuY3Rpb24gYmVjYXVzZSBpdCBoYW5kbGVzIGJvdGggZnVsbHlcbiAgICAvLyBub24tdGhlbmFibGUgdmFsdWVzIGFuZCBvdGhlciB0aGVuYWJsZXMgZ3JhY2VmdWxseS5cbiAgICB2YXIgbWVzc2FnZXMgPSBbXSwgcHJvZ3Jlc3NMaXN0ZW5lcnMgPSBbXSwgcmVzb2x2ZWRQcm9taXNlO1xuXG4gICAgdmFyIGRlZmVycmVkID0gb2JqZWN0X2NyZWF0ZShkZWZlci5wcm90b3R5cGUpO1xuICAgIHZhciBwcm9taXNlID0gb2JqZWN0X2NyZWF0ZShQcm9taXNlLnByb3RvdHlwZSk7XG5cbiAgICBwcm9taXNlLnByb21pc2VEaXNwYXRjaCA9IGZ1bmN0aW9uIChyZXNvbHZlLCBvcCwgb3BlcmFuZHMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goYXJncyk7XG4gICAgICAgICAgICBpZiAob3AgPT09IFwid2hlblwiICYmIG9wZXJhbmRzWzFdKSB7IC8vIHByb2dyZXNzIG9wZXJhbmRcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVycy5wdXNoKG9wZXJhbmRzWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZS5wcm9taXNlRGlzcGF0Y2guYXBwbHkocmVzb2x2ZWRQcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFhYWCBkZXByZWNhdGVkXG4gICAgcHJvbWlzZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZWFyZXJWYWx1ZSA9IG5lYXJlcihyZXNvbHZlZFByb21pc2UpO1xuICAgICAgICBpZiAoaXNQcm9taXNlKG5lYXJlclZhbHVlKSkge1xuICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmVhcmVyVmFsdWU7IC8vIHNob3J0ZW4gY2hhaW5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmVhcmVyVmFsdWU7XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN0YXRlOiBcInBlbmRpbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlZFByb21pc2UuaW5zcGVjdCgpO1xuICAgIH07XG5cbiAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IGRvbid0IHRyeSB0byB1c2UgYEVycm9yLmNhcHR1cmVTdGFja1RyYWNlYCBvciB0cmFuc2ZlciB0aGVcbiAgICAgICAgICAgIC8vIGFjY2Vzc29yIGFyb3VuZDsgdGhhdCBjYXVzZXMgbWVtb3J5IGxlYWtzIGFzIHBlciBHSC0xMTEuIEp1c3RcbiAgICAgICAgICAgIC8vIHJlaWZ5IHRoZSBzdGFjayB0cmFjZSBhcyBhIHN0cmluZyBBU0FQLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEF0IHRoZSBzYW1lIHRpbWUsIGN1dCBvZmYgdGhlIGZpcnN0IGxpbmU7IGl0J3MgYWx3YXlzIGp1c3RcbiAgICAgICAgICAgIC8vIFwiW29iamVjdCBQcm9taXNlXVxcblwiLCBhcyBwZXIgdGhlIGB0b1N0cmluZ2AuXG4gICAgICAgICAgICBwcm9taXNlLnN0YWNrID0gZS5zdGFjay5zdWJzdHJpbmcoZS5zdGFjay5pbmRleE9mKFwiXFxuXCIpICsgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3ZSBkbyB0aGUgY2hlY2tzIGZvciBgcmVzb2x2ZWRQcm9taXNlYCBpbiBlYWNoIG1ldGhvZCwgaW5zdGVhZCBvZlxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XG4gICAgLy8gcHJvbWlzZXMgd2l0aCB0aGUgbGluZXMgYGJlY29tZSh3aGF0ZXZlcih2YWx1ZSkpYC4gU2VlIGUuZy4gR0gtMjUyLlxuXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmV3UHJvbWlzZTtcbiAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xuXG4gICAgICAgIGFycmF5X3JlZHVjZShtZXNzYWdlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgbWVzc2FnZSkge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbmV3UHJvbWlzZS5wcm9taXNlRGlzcGF0Y2guYXBwbHkobmV3UHJvbWlzZSwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdm9pZCAwKTtcblxuICAgICAgICBtZXNzYWdlcyA9IHZvaWQgMDtcbiAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMgPSB2b2lkIDA7XG4gICAgfVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZSA9IHByb21pc2U7XG4gICAgZGVmZXJyZWQucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUoUSh2YWx1ZSkpO1xuICAgIH07XG5cbiAgICBkZWZlcnJlZC5mdWxmaWxsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShmdWxmaWxsKHZhbHVlKSk7XG4gICAgfTtcbiAgICBkZWZlcnJlZC5yZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShyZWplY3QocmVhc29uKSk7XG4gICAgfTtcbiAgICBkZWZlcnJlZC5ub3RpZnkgPSBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJyYXlfcmVkdWNlKHByb2dyZXNzTGlzdGVuZXJzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBwcm9ncmVzc0xpc3RlbmVyKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVyKHByb2dyZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgIH07XG5cbiAgICByZXR1cm4gZGVmZXJyZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIE5vZGUtc3R5bGUgY2FsbGJhY2sgdGhhdCB3aWxsIHJlc29sdmUgb3IgcmVqZWN0IHRoZSBkZWZlcnJlZFxuICogcHJvbWlzZS5cbiAqIEByZXR1cm5zIGEgbm9kZWJhY2tcbiAqL1xuZGVmZXIucHJvdG90eXBlLm1ha2VOb2RlUmVzb2x2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXJyb3IsIHZhbHVlKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgc2VsZi5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICBzZWxmLnJlc29sdmUoYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHJlc29sdmVyIHtGdW5jdGlvbn0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgbm90aGluZyBhbmQgYWNjZXB0c1xuICogdGhlIHJlc29sdmUsIHJlamVjdCwgYW5kIG5vdGlmeSBmdW5jdGlvbnMgZm9yIGEgZGVmZXJyZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCBtYXkgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgZ2l2ZW4gcmVzb2x2ZSBhbmQgcmVqZWN0XG4gKiBmdW5jdGlvbnMsIG9yIHJlamVjdGVkIGJ5IGEgdGhyb3duIGV4Y2VwdGlvbiBpbiByZXNvbHZlclxuICovXG5RLlByb21pc2UgPSBwcm9taXNlOyAvLyBFUzZcblEucHJvbWlzZSA9IHByb21pc2U7XG5mdW5jdGlvbiBwcm9taXNlKHJlc29sdmVyKSB7XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJyZXNvbHZlciBtdXN0IGJlIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICB9IGNhdGNoIChyZWFzb24pIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5wcm9taXNlLnJhY2UgPSByYWNlOyAvLyBFUzZcbnByb21pc2UuYWxsID0gYWxsOyAvLyBFUzZcbnByb21pc2UucmVqZWN0ID0gcmVqZWN0OyAvLyBFUzZcbnByb21pc2UucmVzb2x2ZSA9IFE7IC8vIEVTNlxuXG4vLyBYWFggZXhwZXJpbWVudGFsLiAgVGhpcyBtZXRob2QgaXMgYSB3YXkgdG8gZGVub3RlIHRoYXQgYSBsb2NhbCB2YWx1ZSBpc1xuLy8gc2VyaWFsaXphYmxlIGFuZCBzaG91bGQgYmUgaW1tZWRpYXRlbHkgZGlzcGF0Y2hlZCB0byBhIHJlbW90ZSB1cG9uIHJlcXVlc3QsXG4vLyBpbnN0ZWFkIG9mIHBhc3NpbmcgYSByZWZlcmVuY2UuXG5RLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUucGFzc0J5Q29weSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJZiB0d28gcHJvbWlzZXMgZXZlbnR1YWxseSBmdWxmaWxsIHRvIHRoZSBzYW1lIHZhbHVlLCBwcm9taXNlcyB0aGF0IHZhbHVlLFxuICogYnV0IG90aGVyd2lzZSByZWplY3RzLlxuICogQHBhcmFtIHgge0FueSp9XG4gKiBAcGFyYW0geSB7QW55Kn1cbiAqIEByZXR1cm5zIHtBbnkqfSBhIHByb21pc2UgZm9yIHggYW5kIHkgaWYgdGhleSBhcmUgdGhlIHNhbWUsIGJ1dCBhIHJlamVjdGlvblxuICogb3RoZXJ3aXNlLlxuICpcbiAqL1xuUS5qb2luID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICByZXR1cm4gUSh4KS5qb2luKHkpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uICh0aGF0KSB7XG4gICAgcmV0dXJuIFEoW3RoaXMsIHRoYXRdKS5zcHJlYWQoZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFwiPT09XCIgc2hvdWxkIGJlIE9iamVjdC5pcyBvciBlcXVpdlxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBqb2luOiBub3QgdGhlIHNhbWU6IFwiICsgeCArIFwiIFwiICsgeSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBmaXJzdCBvZiBhbiBhcnJheSBvZiBwcm9taXNlcyB0byBiZWNvbWUgc2V0dGxlZC5cbiAqIEBwYXJhbSBhbnN3ZXJzIHtBcnJheVtBbnkqXX0gcHJvbWlzZXMgdG8gcmFjZVxuICogQHJldHVybnMge0FueSp9IHRoZSBmaXJzdCBwcm9taXNlIHRvIGJlIHNldHRsZWRcbiAqL1xuUS5yYWNlID0gcmFjZTtcbmZ1bmN0aW9uIHJhY2UoYW5zd2VyUHMpIHtcbiAgICByZXR1cm4gcHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIFN3aXRjaCB0byB0aGlzIG9uY2Ugd2UgY2FuIGFzc3VtZSBhdCBsZWFzdCBFUzVcbiAgICAgICAgLy8gYW5zd2VyUHMuZm9yRWFjaChmdW5jdGlvbiAoYW5zd2VyUCkge1xuICAgICAgICAvLyAgICAgUShhbnN3ZXJQKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBVc2UgdGhpcyBpbiB0aGUgbWVhbnRpbWVcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFuc3dlclBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBRKGFuc3dlclBzW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUucmFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKFEucmFjZSk7XG59O1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBQcm9taXNlIHdpdGggYSBwcm9taXNlIGRlc2NyaXB0b3Igb2JqZWN0IGFuZCBvcHRpb25hbCBmYWxsYmFja1xuICogZnVuY3Rpb24uICBUaGUgZGVzY3JpcHRvciBjb250YWlucyBtZXRob2RzIGxpa2Ugd2hlbihyZWplY3RlZCksIGdldChuYW1lKSxcbiAqIHNldChuYW1lLCB2YWx1ZSksIHBvc3QobmFtZSwgYXJncyksIGFuZCBkZWxldGUobmFtZSksIHdoaWNoIGFsbFxuICogcmV0dXJuIGVpdGhlciBhIHZhbHVlLCBhIHByb21pc2UgZm9yIGEgdmFsdWUsIG9yIGEgcmVqZWN0aW9uLiAgVGhlIGZhbGxiYWNrXG4gKiBhY2NlcHRzIHRoZSBvcGVyYXRpb24gbmFtZSwgYSByZXNvbHZlciwgYW5kIGFueSBmdXJ0aGVyIGFyZ3VtZW50cyB0aGF0IHdvdWxkXG4gKiBoYXZlIGJlZW4gZm9yd2FyZGVkIHRvIHRoZSBhcHByb3ByaWF0ZSBtZXRob2QgYWJvdmUgaGFkIGEgbWV0aG9kIGJlZW5cbiAqIHByb3ZpZGVkIHdpdGggdGhlIHByb3BlciBuYW1lLiAgVGhlIEFQSSBtYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IHRoZSBuYXR1cmVcbiAqIG9mIHRoZSByZXR1cm5lZCBvYmplY3QsIGFwYXJ0IGZyb20gdGhhdCBpdCBpcyB1c2FibGUgd2hlcmVldmVyIHByb21pc2VzIGFyZVxuICogYm91Z2h0IGFuZCBzb2xkLlxuICovXG5RLm1ha2VQcm9taXNlID0gUHJvbWlzZTtcbmZ1bmN0aW9uIFByb21pc2UoZGVzY3JpcHRvciwgZmFsbGJhY2ssIGluc3BlY3QpIHtcbiAgICBpZiAoZmFsbGJhY2sgPT09IHZvaWQgMCkge1xuICAgICAgICBmYWxsYmFjayA9IGZ1bmN0aW9uIChvcCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgXCJQcm9taXNlIGRvZXMgbm90IHN1cHBvcnQgb3BlcmF0aW9uOiBcIiArIG9wXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGluc3BlY3QgPT09IHZvaWQgMCkge1xuICAgICAgICBpbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtzdGF0ZTogXCJ1bmtub3duXCJ9O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBwcm9taXNlID0gb2JqZWN0X2NyZWF0ZShQcm9taXNlLnByb3RvdHlwZSk7XG5cbiAgICBwcm9taXNlLnByb21pc2VEaXNwYXRjaCA9IGZ1bmN0aW9uIChyZXNvbHZlLCBvcCwgYXJncykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0b3Jbb3BdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZGVzY3JpcHRvcltvcF0uYXBwbHkocHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbGxiYWNrLmNhbGwocHJvbWlzZSwgb3AsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNvbHZlKSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJvbWlzZS5pbnNwZWN0ID0gaW5zcGVjdDtcblxuICAgIC8vIFhYWCBkZXByZWNhdGVkIGB2YWx1ZU9mYCBhbmQgYGV4Y2VwdGlvbmAgc3VwcG9ydFxuICAgIGlmIChpbnNwZWN0KSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgcHJvbWlzZS5leGNlcHRpb24gPSBpbnNwZWN0ZWQucmVhc29uO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcbiAgICAgICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwicGVuZGluZ1wiIHx8XG4gICAgICAgICAgICAgICAgaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cblByb21pc2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgUHJvbWlzZV1cIjtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciBkb25lID0gZmFsc2U7ICAgLy8gZW5zdXJlIHRoZSB1bnRydXN0ZWQgcHJvbWlzZSBtYWtlcyBhdCBtb3N0IGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmdsZSBjYWxsIHRvIG9uZSBvZiB0aGUgY2FsbGJhY2tzXG5cbiAgICBmdW5jdGlvbiBfZnVsZmlsbGVkKHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGZ1bGZpbGxlZCA9PT0gXCJmdW5jdGlvblwiID8gZnVsZmlsbGVkKHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWplY3RlZChleGNlcHRpb24pIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZWplY3RlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXhjZXB0aW9uLCBzZWxmKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkKGV4Y2VwdGlvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChuZXdFeGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ld0V4Y2VwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9wcm9ncmVzc2VkKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcHJvZ3Jlc3NlZCA9PT0gXCJmdW5jdGlvblwiID8gcHJvZ3Jlc3NlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICB9XG5cbiAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5wcm9taXNlRGlzcGF0Y2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9mdWxmaWxsZWQodmFsdWUpKTtcbiAgICAgICAgfSwgXCJ3aGVuXCIsIFtmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9yZWplY3RlZChleGNlcHRpb24pKTtcbiAgICAgICAgfV0pO1xuICAgIH0pO1xuXG4gICAgLy8gUHJvZ3Jlc3MgcHJvcGFnYXRvciBuZWVkIHRvIGJlIGF0dGFjaGVkIGluIHRoZSBjdXJyZW50IHRpY2suXG4gICAgc2VsZi5wcm9taXNlRGlzcGF0Y2godm9pZCAwLCBcIndoZW5cIiwgW3ZvaWQgMCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZTtcbiAgICAgICAgdmFyIHRocmV3ID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IF9wcm9ncmVzc2VkKHZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyZXcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhyZXcpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblEudGFwID0gZnVuY3Rpb24gKHByb21pc2UsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGFwKGNhbGxiYWNrKTtcbn07XG5cbi8qKlxuICogV29ya3MgYWxtb3N0IGxpa2UgXCJmaW5hbGx5XCIsIGJ1dCBub3QgY2FsbGVkIGZvciByZWplY3Rpb25zLlxuICogT3JpZ2luYWwgcmVzb2x1dGlvbiB2YWx1ZSBpcyBwYXNzZWQgdGhyb3VnaCBjYWxsYmFjayB1bmFmZmVjdGVkLlxuICogQ2FsbGJhY2sgbWF5IHJldHVybiBhIHByb21pc2UgdGhhdCB3aWxsIGJlIGF3YWl0ZWQgZm9yLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtRLlByb21pc2V9XG4gKiBAZXhhbXBsZVxuICogZG9Tb21ldGhpbmcoKVxuICogICAudGhlbiguLi4pXG4gKiAgIC50YXAoY29uc29sZS5sb2cpXG4gKiAgIC50aGVuKC4uLik7XG4gKi9cblByb21pc2UucHJvdG90eXBlLnRhcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gUShjYWxsYmFjayk7XG5cbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwodmFsdWUpLnRoZW5SZXNvbHZlKHZhbHVlKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXJzIGFuIG9ic2VydmVyIG9uIGEgcHJvbWlzZS5cbiAqXG4gKiBHdWFyYW50ZWVzOlxuICpcbiAqIDEuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UuXG4gKiAyLiB0aGF0IGVpdGhlciB0aGUgZnVsZmlsbGVkIGNhbGxiYWNrIG9yIHRoZSByZWplY3RlZCBjYWxsYmFjayB3aWxsIGJlXG4gKiAgICBjYWxsZWQsIGJ1dCBub3QgYm90aC5cbiAqIDMuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIG5vdCBiZSBjYWxsZWQgaW4gdGhpcyB0dXJuLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSAgICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSB0byBvYnNlcnZlXG4gKiBAcGFyYW0gZnVsZmlsbGVkICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgZnVsZmlsbGVkIHZhbHVlXG4gKiBAcGFyYW0gcmVqZWN0ZWQgICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgcmVqZWN0aW9uIGV4Y2VwdGlvblxuICogQHBhcmFtIHByb2dyZXNzZWQgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgZnJvbSB0aGUgaW52b2tlZCBjYWxsYmFja1xuICovXG5RLndoZW4gPSB3aGVuO1xuZnVuY3Rpb24gd2hlbih2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH0pO1xufTtcblxuUS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uIChwcm9taXNlLCB2YWx1ZSkge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZXNvbHZlKHZhbHVlKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHRocm93IHJlYXNvbjsgfSk7XG59O1xuXG5RLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGhlblJlamVjdChyZWFzb24pO1xufTtcblxuLyoqXG4gKiBJZiBhbiBvYmplY3QgaXMgbm90IGEgcHJvbWlzZSwgaXQgaXMgYXMgXCJuZWFyXCIgYXMgcG9zc2libGUuXG4gKiBJZiBhIHByb21pc2UgaXMgcmVqZWN0ZWQsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlIHRvby5cbiAqIElmIGl04oCZcyBhIGZ1bGZpbGxlZCBwcm9taXNlLCB0aGUgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmVhcmVyLlxuICogSWYgaXTigJlzIGEgZGVmZXJyZWQgcHJvbWlzZSBhbmQgdGhlIGRlZmVycmVkIGhhcyBiZWVuIHJlc29sdmVkLCB0aGVcbiAqIHJlc29sdXRpb24gaXMgXCJuZWFyZXJcIi5cbiAqIEBwYXJhbSBvYmplY3RcbiAqIEByZXR1cm5zIG1vc3QgcmVzb2x2ZWQgKG5lYXJlc3QpIGZvcm0gb2YgdGhlIG9iamVjdFxuICovXG5cbi8vIFhYWCBzaG91bGQgd2UgcmUtZG8gdGhpcz9cblEubmVhcmVyID0gbmVhcmVyO1xuZnVuY3Rpb24gbmVhcmVyKHZhbHVlKSB7XG4gICAgaWYgKGlzUHJvbWlzZSh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IHZhbHVlLmluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcHJvbWlzZS5cbiAqIE90aGVyd2lzZSBpdCBpcyBhIGZ1bGZpbGxlZCB2YWx1ZS5cbiAqL1xuUS5pc1Byb21pc2UgPSBpc1Byb21pc2U7XG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIFByb21pc2U7XG59XG5cblEuaXNQcm9taXNlQWxpa2UgPSBpc1Byb21pc2VBbGlrZTtcbmZ1bmN0aW9uIGlzUHJvbWlzZUFsaWtlKG9iamVjdCkge1xuICAgIHJldHVybiBpc09iamVjdChvYmplY3QpICYmIHR5cGVvZiBvYmplY3QudGhlbiA9PT0gXCJmdW5jdGlvblwiO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHBlbmRpbmcgcHJvbWlzZSwgbWVhbmluZyBub3RcbiAqIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cbiAqL1xuUS5pc1BlbmRpbmcgPSBpc1BlbmRpbmc7XG5mdW5jdGlvbiBpc1BlbmRpbmcob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzUHJvbWlzZShvYmplY3QpICYmIG9iamVjdC5pbnNwZWN0KCkuc3RhdGUgPT09IFwicGVuZGluZ1wiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1BlbmRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn07XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgdmFsdWUgb3IgZnVsZmlsbGVkXG4gKiBwcm9taXNlLlxuICovXG5RLmlzRnVsZmlsbGVkID0gaXNGdWxmaWxsZWQ7XG5mdW5jdGlvbiBpc0Z1bGZpbGxlZChvYmplY3QpIHtcbiAgICByZXR1cm4gIWlzUHJvbWlzZShvYmplY3QpIHx8IG9iamVjdC5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzRnVsZmlsbGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcbn07XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcmVqZWN0ZWQgcHJvbWlzZS5cbiAqL1xuUS5pc1JlamVjdGVkID0gaXNSZWplY3RlZDtcbmZ1bmN0aW9uIGlzUmVqZWN0ZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzUHJvbWlzZShvYmplY3QpICYmIG9iamVjdC5pbnNwZWN0KCkuc3RhdGUgPT09IFwicmVqZWN0ZWRcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNSZWplY3RlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicmVqZWN0ZWRcIjtcbn07XG5cbi8vLy8gQkVHSU4gVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vLyBUaGlzIHByb21pc2UgbGlicmFyeSBjb25zdW1lcyBleGNlcHRpb25zIHRocm93biBpbiBoYW5kbGVycyBzbyB0aGV5IGNhbiBiZVxuLy8gaGFuZGxlZCBieSBhIHN1YnNlcXVlbnQgcHJvbWlzZS4gIFRoZSBleGNlcHRpb25zIGdldCBhZGRlZCB0byB0aGlzIGFycmF5IHdoZW5cbi8vIHRoZXkgYXJlIGNyZWF0ZWQsIGFuZCByZW1vdmVkIHdoZW4gdGhleSBhcmUgaGFuZGxlZC4gIE5vdGUgdGhhdCBpbiBFUzYgb3Jcbi8vIHNoaW1tZWQgZW52aXJvbm1lbnRzLCB0aGlzIHdvdWxkIG5hdHVyYWxseSBiZSBhIGBTZXRgLlxudmFyIHVuaGFuZGxlZFJlYXNvbnMgPSBbXTtcbnZhciB1bmhhbmRsZWRSZWplY3Rpb25zID0gW107XG52YXIgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zID0gW107XG52YXIgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcblxuZnVuY3Rpb24gcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCkge1xuICAgIHVuaGFuZGxlZFJlYXNvbnMubGVuZ3RoID0gMDtcbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLmxlbmd0aCA9IDA7XG5cbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSB0cnVlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdHJhY2tSZWplY3Rpb24ocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIFEubmV4dFRpY2sucnVuQWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbWl0KFwidW5oYW5kbGVkUmVqZWN0aW9uXCIsIHJlYXNvbiwgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMucHVzaChwcm9taXNlKTtcbiAgICBpZiAocmVhc29uICYmIHR5cGVvZiByZWFzb24uc3RhY2sgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdW5oYW5kbGVkUmVhc29ucy5wdXNoKHJlYXNvbi5zdGFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdW5oYW5kbGVkUmVhc29ucy5wdXNoKFwiKG5vIHN0YWNrKSBcIiArIHJlYXNvbik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1bnRyYWNrUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGF0ID0gYXJyYXlfaW5kZXhPZih1bmhhbmRsZWRSZWplY3Rpb25zLCBwcm9taXNlKTtcbiAgICBpZiAoYXQgIT09IC0xKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcHJvY2Vzcy5lbWl0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2sucnVuQWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhdFJlcG9ydCA9IGFycmF5X2luZGV4T2YocmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICBpZiAoYXRSZXBvcnQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZW1pdChcInJlamVjdGlvbkhhbmRsZWRcIiwgdW5oYW5kbGVkUmVhc29uc1thdF0sIHByb21pc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMuc3BsaWNlKGF0UmVwb3J0LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdCwgMSk7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMuc3BsaWNlKGF0LCAxKTtcbiAgICB9XG59XG5cblEucmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zID0gcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zO1xuXG5RLmdldFVuaGFuZGxlZFJlYXNvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gTWFrZSBhIGNvcHkgc28gdGhhdCBjb25zdW1lcnMgY2FuJ3QgaW50ZXJmZXJlIHdpdGggb3VyIGludGVybmFsIHN0YXRlLlxuICAgIHJldHVybiB1bmhhbmRsZWRSZWFzb25zLnNsaWNlKCk7XG59O1xuXG5RLnN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSBmYWxzZTtcbn07XG5cbnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpO1xuXG4vLy8vIEVORCBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHJlamVjdGVkIHByb21pc2UuXG4gKiBAcGFyYW0gcmVhc29uIHZhbHVlIGRlc2NyaWJpbmcgdGhlIGZhaWx1cmVcbiAqL1xuUS5yZWplY3QgPSByZWplY3Q7XG5mdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gICAgdmFyIHJlamVjdGlvbiA9IFByb21pc2Uoe1xuICAgICAgICBcIndoZW5cIjogZnVuY3Rpb24gKHJlamVjdGVkKSB7XG4gICAgICAgICAgICAvLyBub3RlIHRoYXQgdGhlIGVycm9yIGhhcyBiZWVuIGhhbmRsZWRcbiAgICAgICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgICAgICAgIHVudHJhY2tSZWplY3Rpb24odGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZChyZWFzb24pIDogdGhpcztcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBmdW5jdGlvbiBpbnNwZWN0KCkge1xuICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJyZWplY3RlZFwiLCByZWFzb246IHJlYXNvbiB9O1xuICAgIH0pO1xuXG4gICAgLy8gTm90ZSB0aGF0IHRoZSByZWFzb24gaGFzIG5vdCBiZWVuIGhhbmRsZWQuXG4gICAgdHJhY2tSZWplY3Rpb24ocmVqZWN0aW9uLCByZWFzb24pO1xuXG4gICAgcmV0dXJuIHJlamVjdGlvbjtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgZnVsZmlsbGVkIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UuXG4gKiBAcGFyYW0gdmFsdWUgaW1tZWRpYXRlIHJlZmVyZW5jZVxuICovXG5RLmZ1bGZpbGwgPSBmdWxmaWxsO1xuZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24gKG5hbWUsIHJocykge1xuICAgICAgICAgICAgdmFsdWVbbmFtZV0gPSByaHM7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVsZXRlXCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwicG9zdFwiOiBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgICAgICAgICAgLy8gTWFyayBNaWxsZXIgcHJvcG9zZXMgdGhhdCBwb3N0IHdpdGggbm8gbmFtZSBzaG91bGQgYXBwbHkgYVxuICAgICAgICAgICAgLy8gcHJvbWlzZWQgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gbnVsbCB8fCBuYW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodm9pZCAwLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlW25hbWVdLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcHBseVwiOiBmdW5jdGlvbiAodGhpc3AsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5hcHBseSh0aGlzcCwgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIFwia2V5c1wiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0X2tleXModmFsdWUpO1xuICAgICAgICB9XG4gICAgfSwgdm9pZCAwLCBmdW5jdGlvbiBpbnNwZWN0KCkge1xuICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJmdWxmaWxsZWRcIiwgdmFsdWU6IHZhbHVlIH07XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlbmFibGVzIHRvIFEgcHJvbWlzZXMuXG4gKiBAcGFyYW0gcHJvbWlzZSB0aGVuYWJsZSBwcm9taXNlXG4gKiBAcmV0dXJucyBhIFEgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBjb2VyY2UocHJvbWlzZSkge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9taXNlLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbi8qKlxuICogQW5ub3RhdGVzIGFuIG9iamVjdCBzdWNoIHRoYXQgaXQgd2lsbCBuZXZlciBiZVxuICogdHJhbnNmZXJyZWQgYXdheSBmcm9tIHRoaXMgcHJvY2VzcyBvdmVyIGFueSBwcm9taXNlXG4gKiBjb21tdW5pY2F0aW9uIGNoYW5uZWwuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBwcm9taXNlIGEgd3JhcHBpbmcgb2YgdGhhdCBvYmplY3QgdGhhdFxuICogYWRkaXRpb25hbGx5IHJlc3BvbmRzIHRvIHRoZSBcImlzRGVmXCIgbWVzc2FnZVxuICogd2l0aG91dCBhIHJlamVjdGlvbi5cbiAqL1xuUS5tYXN0ZXIgPSBtYXN0ZXI7XG5mdW5jdGlvbiBtYXN0ZXIob2JqZWN0KSB7XG4gICAgcmV0dXJuIFByb21pc2Uoe1xuICAgICAgICBcImlzRGVmXCI6IGZ1bmN0aW9uICgpIHt9XG4gICAgfSwgZnVuY3Rpb24gZmFsbGJhY2sob3AsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoKG9iamVjdCwgb3AsIGFyZ3MpO1xuICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFEob2JqZWN0KS5pbnNwZWN0KCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogU3ByZWFkcyB0aGUgdmFsdWVzIG9mIGEgcHJvbWlzZWQgYXJyYXkgb2YgYXJndW1lbnRzIGludG8gdGhlXG4gKiBmdWxmaWxsbWVudCBjYWxsYmFjay5cbiAqIEBwYXJhbSBmdWxmaWxsZWQgY2FsbGJhY2sgdGhhdCByZWNlaXZlcyB2YXJpYWRpYyBhcmd1bWVudHMgZnJvbSB0aGVcbiAqIHByb21pc2VkIGFycmF5XG4gKiBAcGFyYW0gcmVqZWN0ZWQgY2FsbGJhY2sgdGhhdCByZWNlaXZlcyB0aGUgZXhjZXB0aW9uIGlmIHRoZSBwcm9taXNlXG4gKiBpcyByZWplY3RlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvciB0aHJvd24gZXhjZXB0aW9uIG9mXG4gKiBlaXRoZXIgY2FsbGJhY2suXG4gKi9cblEuc3ByZWFkID0gc3ByZWFkO1xuZnVuY3Rpb24gc3ByZWFkKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIFEodmFsdWUpLnNwcmVhZChmdWxmaWxsZWQsIHJlamVjdGVkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuc3ByZWFkID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy5hbGwoKS50aGVuKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICByZXR1cm4gZnVsZmlsbGVkLmFwcGx5KHZvaWQgMCwgYXJyYXkpO1xuICAgIH0sIHJlamVjdGVkKTtcbn07XG5cbi8qKlxuICogVGhlIGFzeW5jIGZ1bmN0aW9uIGlzIGEgZGVjb3JhdG9yIGZvciBnZW5lcmF0b3IgZnVuY3Rpb25zLCB0dXJuaW5nXG4gKiB0aGVtIGludG8gYXN5bmNocm9ub3VzIGdlbmVyYXRvcnMuICBBbHRob3VnaCBnZW5lcmF0b3JzIGFyZSBvbmx5IHBhcnRcbiAqIG9mIHRoZSBuZXdlc3QgRUNNQVNjcmlwdCA2IGRyYWZ0cywgdGhpcyBjb2RlIGRvZXMgbm90IGNhdXNlIHN5bnRheFxuICogZXJyb3JzIGluIG9sZGVyIGVuZ2luZXMuICBUaGlzIGNvZGUgc2hvdWxkIGNvbnRpbnVlIHRvIHdvcmsgYW5kIHdpbGxcbiAqIGluIGZhY3QgaW1wcm92ZSBvdmVyIHRpbWUgYXMgdGhlIGxhbmd1YWdlIGltcHJvdmVzLlxuICpcbiAqIEVTNiBnZW5lcmF0b3JzIGFyZSBjdXJyZW50bHkgcGFydCBvZiBWOCB2ZXJzaW9uIDMuMTkgd2l0aCB0aGVcbiAqIC0taGFybW9ueS1nZW5lcmF0b3JzIHJ1bnRpbWUgZmxhZyBlbmFibGVkLiAgU3BpZGVyTW9ua2V5IGhhcyBoYWQgdGhlbVxuICogZm9yIGxvbmdlciwgYnV0IHVuZGVyIGFuIG9sZGVyIFB5dGhvbi1pbnNwaXJlZCBmb3JtLiAgVGhpcyBmdW5jdGlvblxuICogd29ya3Mgb24gYm90aCBraW5kcyBvZiBnZW5lcmF0b3JzLlxuICpcbiAqIERlY29yYXRlcyBhIGdlbmVyYXRvciBmdW5jdGlvbiBzdWNoIHRoYXQ6XG4gKiAgLSBpdCBtYXkgeWllbGQgcHJvbWlzZXNcbiAqICAtIGV4ZWN1dGlvbiB3aWxsIGNvbnRpbnVlIHdoZW4gdGhhdCBwcm9taXNlIGlzIGZ1bGZpbGxlZFxuICogIC0gdGhlIHZhbHVlIG9mIHRoZSB5aWVsZCBleHByZXNzaW9uIHdpbGwgYmUgdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogIC0gaXQgcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgKHdoZW4gdGhlIGdlbmVyYXRvclxuICogICAgc3RvcHMgaXRlcmF0aW5nKVxuICogIC0gdGhlIGRlY29yYXRlZCBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICogICAgb2YgdGhlIGdlbmVyYXRvciBvciB0aGUgZmlyc3QgcmVqZWN0ZWQgcHJvbWlzZSBhbW9uZyB0aG9zZVxuICogICAgeWllbGRlZC5cbiAqICAtIGlmIGFuIGVycm9yIGlzIHRocm93biBpbiB0aGUgZ2VuZXJhdG9yLCBpdCBwcm9wYWdhdGVzIHRocm91Z2hcbiAqICAgIGV2ZXJ5IGZvbGxvd2luZyB5aWVsZCB1bnRpbCBpdCBpcyBjYXVnaHQsIG9yIHVudGlsIGl0IGVzY2FwZXNcbiAqICAgIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24gYWx0b2dldGhlciwgYW5kIGlzIHRyYW5zbGF0ZWQgaW50byBhXG4gKiAgICByZWplY3Rpb24gZm9yIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBkZWNvcmF0ZWQgZ2VuZXJhdG9yLlxuICovXG5RLmFzeW5jID0gYXN5bmM7XG5mdW5jdGlvbiBhc3luYyhtYWtlR2VuZXJhdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwic2VuZFwiLCBhcmcgaXMgYSB2YWx1ZVxuICAgICAgICAvLyB3aGVuIHZlcmIgaXMgXCJ0aHJvd1wiLCBhcmcgaXMgYW4gZXhjZXB0aW9uXG4gICAgICAgIGZ1bmN0aW9uIGNvbnRpbnVlcih2ZXJiLCBhcmcpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgICAgIC8vIFVudGlsIFY4IDMuMTkgLyBDaHJvbWl1bSAyOSBpcyByZWxlYXNlZCwgU3BpZGVyTW9ua2V5IGlzIHRoZSBvbmx5XG4gICAgICAgICAgICAvLyBlbmdpbmUgdGhhdCBoYXMgYSBkZXBsb3llZCBiYXNlIG9mIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBnZW5lcmF0b3JzLlxuICAgICAgICAgICAgLy8gSG93ZXZlciwgU00ncyBnZW5lcmF0b3JzIHVzZSB0aGUgUHl0aG9uLWluc3BpcmVkIHNlbWFudGljcyBvZlxuICAgICAgICAgICAgLy8gb3V0ZGF0ZWQgRVM2IGRyYWZ0cy4gIFdlIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBFUzYsIGJ1dCB3ZSdkIGFsc29cbiAgICAgICAgICAgIC8vIGxpa2UgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byB1c2UgZ2VuZXJhdG9ycyBpbiBkZXBsb3llZCBicm93c2Vycywgc29cbiAgICAgICAgICAgIC8vIHdlIGFsc28gc3VwcG9ydCBQeXRob24tc3R5bGUgZ2VuZXJhdG9ycy4gIEF0IHNvbWUgcG9pbnQgd2UgY2FuIHJlbW92ZVxuICAgICAgICAgICAgLy8gdGhpcyBibG9jay5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBTdG9wSXRlcmF0aW9uID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgLy8gRVM2IEdlbmVyYXRvcnNcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFEocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2hlbihyZXN1bHQudmFsdWUsIGNhbGxiYWNrLCBlcnJiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNwaWRlck1vbmtleSBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IFJlbW92ZSB0aGlzIGNhc2Ugd2hlbiBTTSBkb2VzIEVTNiBnZW5lcmF0b3JzLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGdlbmVyYXRvclt2ZXJiXShhcmcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBRKGV4Y2VwdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG1ha2VHZW5lcmF0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY29udGludWVyLmJpbmQoY29udGludWVyLCBcIm5leHRcIik7XG4gICAgICAgIHZhciBlcnJiYWNrID0gY29udGludWVyLmJpbmQoY29udGludWVyLCBcInRocm93XCIpO1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIFRoZSBzcGF3biBmdW5jdGlvbiBpcyBhIHNtYWxsIHdyYXBwZXIgYXJvdW5kIGFzeW5jIHRoYXQgaW1tZWRpYXRlbHlcbiAqIGNhbGxzIHRoZSBnZW5lcmF0b3IgYW5kIGFsc28gZW5kcyB0aGUgcHJvbWlzZSBjaGFpbiwgc28gdGhhdCBhbnlcbiAqIHVuaGFuZGxlZCBlcnJvcnMgYXJlIHRocm93biBpbnN0ZWFkIG9mIGZvcndhcmRlZCB0byB0aGUgZXJyb3JcbiAqIGhhbmRsZXIuIFRoaXMgaXMgdXNlZnVsIGJlY2F1c2UgaXQncyBleHRyZW1lbHkgY29tbW9uIHRvIHJ1blxuICogZ2VuZXJhdG9ycyBhdCB0aGUgdG9wLWxldmVsIHRvIHdvcmsgd2l0aCBsaWJyYXJpZXMuXG4gKi9cblEuc3Bhd24gPSBzcGF3bjtcbmZ1bmN0aW9uIHNwYXduKG1ha2VHZW5lcmF0b3IpIHtcbiAgICBRLmRvbmUoUS5hc3luYyhtYWtlR2VuZXJhdG9yKSgpKTtcbn1cblxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGludGVyZmFjZSBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpbiBTcGlkZXJNb25rZXkuXG4vKipcbiAqIFRocm93cyBhIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB0byBzdG9wIGFuIGFzeW5jaHJvbm91cyBnZW5lcmF0b3IuXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgaXMgYSBzdG9wLWdhcCBtZWFzdXJlIHRvIHN1cHBvcnQgZ2VuZXJhdG9yIHJldHVyblxuICogdmFsdWVzIGluIG9sZGVyIEZpcmVmb3gvU3BpZGVyTW9ua2V5LiAgSW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEVTNlxuICogZ2VuZXJhdG9ycyBsaWtlIENocm9taXVtIDI5LCBqdXN0IHVzZSBcInJldHVyblwiIGluIHlvdXIgZ2VuZXJhdG9yXG4gKiBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHZhbHVlIHRoZSByZXR1cm4gdmFsdWUgZm9yIHRoZSBzdXJyb3VuZGluZyBnZW5lcmF0b3JcbiAqIEB0aHJvd3MgUmV0dXJuVmFsdWUgZXhjZXB0aW9uIHdpdGggdGhlIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqIC8vIEVTNiBzdHlsZVxuICogUS5hc3luYyhmdW5jdGlvbiogKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICByZXR1cm4gZm9vICsgYmFyO1xuICogfSlcbiAqIC8vIE9sZGVyIFNwaWRlck1vbmtleSBzdHlsZVxuICogUS5hc3luYyhmdW5jdGlvbiAoKSB7XG4gKiAgICAgIHZhciBmb28gPSB5aWVsZCBnZXRGb29Qcm9taXNlKCk7XG4gKiAgICAgIHZhciBiYXIgPSB5aWVsZCBnZXRCYXJQcm9taXNlKCk7XG4gKiAgICAgIFEucmV0dXJuKGZvbyArIGJhcik7XG4gKiB9KVxuICovXG5RW1wicmV0dXJuXCJdID0gX3JldHVybjtcbmZ1bmN0aW9uIF9yZXR1cm4odmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgUVJldHVyblZhbHVlKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGUgcHJvbWlzZWQgZnVuY3Rpb24gZGVjb3JhdG9yIGVuc3VyZXMgdGhhdCBhbnkgcHJvbWlzZSBhcmd1bWVudHNcbiAqIGFyZSBzZXR0bGVkIGFuZCBwYXNzZWQgYXMgdmFsdWVzIChgdGhpc2AgaXMgYWxzbyBzZXR0bGVkIGFuZCBwYXNzZWRcbiAqIGFzIGEgdmFsdWUpLiAgSXQgd2lsbCBhbHNvIGVuc3VyZSB0aGF0IHRoZSByZXN1bHQgb2YgYSBmdW5jdGlvbiBpc1xuICogYWx3YXlzIGEgcHJvbWlzZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogdmFyIGFkZCA9IFEucHJvbWlzZWQoZnVuY3Rpb24gKGEsIGIpIHtcbiAqICAgICByZXR1cm4gYSArIGI7XG4gKiB9KTtcbiAqIGFkZChRKGEpLCBRKEIpKTtcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZGVjb3JhdGVcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn0gYSBmdW5jdGlvbiB0aGF0IGhhcyBiZWVuIGRlY29yYXRlZC5cbiAqL1xuUS5wcm9taXNlZCA9IHByb21pc2VkO1xuZnVuY3Rpb24gcHJvbWlzZWQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc3ByZWFkKFt0aGlzLCBhbGwoYXJndW1lbnRzKV0sIGZ1bmN0aW9uIChzZWxmLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8qKlxuICogc2VuZHMgYSBtZXNzYWdlIHRvIGEgdmFsdWUgaW4gYSBmdXR1cmUgdHVyblxuICogQHBhcmFtIG9iamVjdCogdGhlIHJlY2lwaWVudFxuICogQHBhcmFtIG9wIHRoZSBuYW1lIG9mIHRoZSBtZXNzYWdlIG9wZXJhdGlvbiwgZS5nLiwgXCJ3aGVuXCIsXG4gKiBAcGFyYW0gYXJncyBmdXJ0aGVyIGFyZ3VtZW50cyB0byBiZSBmb3J3YXJkZWQgdG8gdGhlIG9wZXJhdGlvblxuICogQHJldHVybnMgcmVzdWx0IHtQcm9taXNlfSBhIHByb21pc2UgZm9yIHRoZSByZXN1bHQgb2YgdGhlIG9wZXJhdGlvblxuICovXG5RLmRpc3BhdGNoID0gZGlzcGF0Y2g7XG5mdW5jdGlvbiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChvcCwgYXJncyk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24gKG9wLCBhcmdzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGRlZmVycmVkLnJlc29sdmUsIG9wLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBnZXRcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHByb3BlcnR5IHZhbHVlXG4gKi9cblEuZ2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImdldFwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3Igb2JqZWN0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIHNldFxuICogQHBhcmFtIHZhbHVlICAgICBuZXcgdmFsdWUgb2YgcHJvcGVydHlcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG4vKipcbiAqIERlbGV0ZXMgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBkZWxldGVcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLmRlbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogSW52b2tlcyBhIG1ldGhvZCBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gKiBAcGFyYW0gdmFsdWUgICAgIGEgdmFsdWUgdG8gcG9zdCwgdHlwaWNhbGx5IGFuIGFycmF5IG9mXG4gKiAgICAgICAgICAgICAgICAgIGludm9jYXRpb24gYXJndW1lbnRzIGZvciBwcm9taXNlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgIGFyZSB1bHRpbWF0ZWx5IGJhY2tlZCB3aXRoIGByZXNvbHZlYCB2YWx1ZXMsXG4gKiAgICAgICAgICAgICAgICAgIGFzIG9wcG9zZWQgdG8gdGhvc2UgYmFja2VkIHdpdGggVVJMc1xuICogICAgICAgICAgICAgICAgICB3aGVyZWluIHRoZSBwb3N0ZWQgdmFsdWUgY2FuIGJlIGFueVxuICogICAgICAgICAgICAgICAgICBKU09OIHNlcmlhbGl6YWJsZSBvYmplY3QuXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuLy8gYm91bmQgbG9jYWxseSBiZWNhdXNlIGl0IGlzIHVzZWQgYnkgb3RoZXIgbWV0aG9kc1xuUS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBpbnZvY2F0aW9uIGFyZ3VtZW50c1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cblEuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5RLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEuaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZW5kID0gLy8gWFhYIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgcGFybGFuY2VcblByb21pc2UucHJvdG90eXBlLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gYXJncyAgICAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZhcHBseSA9IGZ1bmN0aW9uIChvYmplY3QsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RW1widHJ5XCJdID1cblEuZmNhbGwgPSBmdW5jdGlvbiAob2JqZWN0IC8qIC4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzKV0pO1xufTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgcHJvbWlzZWQgZnVuY3Rpb24sIHRyYW5zZm9ybWluZyByZXR1cm4gdmFsdWVzIGludG8gYSBmdWxmaWxsZWRcbiAqIHByb21pc2UgYW5kIHRocm93biBlcnJvcnMgaW50byBhIHJlamVjdGVkIG9uZS5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXG4gKi9cblEuZmJpbmQgPSBmdW5jdGlvbiAob2JqZWN0IC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSBRKG9iamVjdCk7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuUHJvbWlzZS5wcm90b3R5cGUuZmJpbmQgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuXG4vKipcbiAqIFJlcXVlc3RzIHRoZSBuYW1lcyBvZiB0aGUgb3duZWQgcHJvcGVydGllcyBvZiBhIHByb21pc2VkXG4gKiBvYmplY3QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBrZXlzIG9mIHRoZSBldmVudHVhbGx5IHNldHRsZWQgb2JqZWN0XG4gKi9cblEua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheS4gIElmIGFueSBvZlxuICogdGhlIHByb21pc2VzIGdldHMgcmVqZWN0ZWQsIHRoZSB3aG9sZSBhcnJheSBpcyByZWplY3RlZCBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlc1xuICovXG4vLyBCeSBNYXJrIE1pbGxlclxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46Y29uY3VycmVuY3kmcmV2PTEzMDg3NzY1MjEjYWxsZnVsZmlsbGVkXG5RLmFsbCA9IGFsbDtcbmZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgdmFyIHBlbmRpbmdDb3VudCA9IDA7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9taXNlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvbWlzZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzbmFwc2hvdDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBpc1Byb21pc2UocHJvbWlzZSkgJiZcbiAgICAgICAgICAgICAgICAoc25hcHNob3QgPSBwcm9taXNlLmluc3BlY3QoKSkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHNuYXBzaG90LnZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICArK3BlbmRpbmdDb3VudDtcbiAgICAgICAgICAgICAgICB3aGVuKFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tcGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoeyBpbmRleDogaW5kZXgsIHZhbHVlOiBwcm9ncmVzcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIGlmIChwZW5kaW5nQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgcmVzb2x2ZWQgcHJvbWlzZSBvZiBhbiBhcnJheS4gUHJpb3IgcmVqZWN0ZWQgcHJvbWlzZXMgYXJlXG4gKiBpZ25vcmVkLiAgUmVqZWN0cyBvbmx5IGlmIGFsbCBwcm9taXNlcyBhcmUgcmVqZWN0ZWQuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgY29udGFpbmluZyB2YWx1ZXMgb3IgcHJvbWlzZXMgZm9yIHZhbHVlc1xuICogQHJldHVybnMgYSBwcm9taXNlIGZ1bGZpbGxlZCB3aXRoIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgcmVzb2x2ZWQgcHJvbWlzZSxcbiAqIG9yIGEgcmVqZWN0ZWQgcHJvbWlzZSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxuICovXG5RLmFueSA9IGFueTtcblxuZnVuY3Rpb24gYW55KHByb21pc2VzKSB7XG4gICAgaWYgKHByb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gUS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHZhciBwZW5kaW5nQ291bnQgPSAwO1xuICAgIGFycmF5X3JlZHVjZShwcm9taXNlcywgZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gcHJvbWlzZXNbaW5kZXhdO1xuXG4gICAgICAgIHBlbmRpbmdDb3VudCsrO1xuXG4gICAgICAgIHdoZW4ocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuICAgICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChyZXN1bHQpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKCkge1xuICAgICAgICAgICAgcGVuZGluZ0NvdW50LS07XG4gICAgICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgXCJDYW4ndCBnZXQgZnVsZmlsbG1lbnQgdmFsdWUgZnJvbSBhbnkgcHJvbWlzZSwgYWxsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJwcm9taXNlcyB3ZXJlIHJlamVjdGVkLlwiXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25Qcm9ncmVzcyhwcm9ncmVzcykge1xuICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb2dyZXNzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHVuZGVmaW5lZCk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYW55ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbnkodGhpcyk7XG59O1xuXG4vKipcbiAqIFdhaXRzIGZvciBhbGwgcHJvbWlzZXMgdG8gYmUgc2V0dGxlZCwgZWl0aGVyIGZ1bGZpbGxlZCBvclxuICogcmVqZWN0ZWQuICBUaGlzIGlzIGRpc3RpbmN0IGZyb20gYGFsbGAgc2luY2UgdGhhdCB3b3VsZCBzdG9wXG4gKiB3YWl0aW5nIGF0IHRoZSBmaXJzdCByZWplY3Rpb24uICBUaGUgcHJvbWlzZSByZXR1cm5lZCBieVxuICogYGFsbFJlc29sdmVkYCB3aWxsIG5ldmVyIGJlIHJlamVjdGVkLlxuICogQHBhcmFtIHByb21pc2VzIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgKG9yIGFuIGFycmF5KSBvZiBwcm9taXNlc1xuICogKG9yIHZhbHVlcylcbiAqIEByZXR1cm4gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBwcm9taXNlc1xuICovXG5RLmFsbFJlc29sdmVkID0gZGVwcmVjYXRlKGFsbFJlc29sdmVkLCBcImFsbFJlc29sdmVkXCIsIFwiYWxsU2V0dGxlZFwiKTtcbmZ1bmN0aW9uIGFsbFJlc29sdmVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIHdoZW4ocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICBwcm9taXNlcyA9IGFycmF5X21hcChwcm9taXNlcywgUSk7XG4gICAgICAgIHJldHVybiB3aGVuKGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gd2hlbihwcm9taXNlLCBub29wLCBub29wKTtcbiAgICAgICAgfSkpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZXM7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxSZXNvbHZlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYWxsUmVzb2x2ZWQodGhpcyk7XG59O1xuXG4vKipcbiAqIEBzZWUgUHJvbWlzZSNhbGxTZXR0bGVkXG4gKi9cblEuYWxsU2V0dGxlZCA9IGFsbFNldHRsZWQ7XG5mdW5jdGlvbiBhbGxTZXR0bGVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZXMpLmFsbFNldHRsZWQoKTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdGhlaXIgc3RhdGVzIChhc1xuICogcmV0dXJuZWQgYnkgYGluc3BlY3RgKSB3aGVuIHRoZXkgaGF2ZSBhbGwgc2V0dGxlZC5cbiAqIEBwYXJhbSB7QXJyYXlbQW55Kl19IHZhbHVlcyBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyB7QXJyYXlbU3RhdGVdfSBhbiBhcnJheSBvZiBzdGF0ZXMgZm9yIHRoZSByZXNwZWN0aXZlIHZhbHVlcy5cbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUuYWxsU2V0dGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICByZXR1cm4gYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBRKHByb21pc2UpO1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVnYXJkbGVzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS5pbnNwZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKHJlZ2FyZGxlc3MsIHJlZ2FyZGxlc3MpO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSBmYWlsdXJlIG9mIGEgcHJvbWlzZSwgZ2l2aW5nIGFuIG9wb3J0dW5pdHkgdG8gcmVjb3ZlclxuICogd2l0aCBhIGNhbGxiYWNrLiAgSWYgdGhlIGdpdmVuIHByb21pc2UgaXMgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcbiAqIHByb21pc2UgaXMgZnVsZmlsbGVkLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIGZ1bGZpbGwgdGhlIHJldHVybmVkIHByb21pc2UgaWYgdGhlXG4gKiBnaXZlbiBwcm9taXNlIGlzIHJlamVjdGVkXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGNhbGxiYWNrXG4gKi9cblEuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAocmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhIGxpc3RlbmVyIHRoYXQgY2FuIHJlc3BvbmQgdG8gcHJvZ3Jlc3Mgbm90aWZpY2F0aW9ucyBmcm9tIGFcbiAqIHByb21pc2UncyBvcmlnaW5hdGluZyBkZWZlcnJlZC4gVGhpcyBsaXN0ZW5lciByZWNlaXZlcyB0aGUgZXhhY3QgYXJndW1lbnRzXG4gKiBwYXNzZWQgdG8gYGBkZWZlcnJlZC5ub3RpZnlgYC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byByZWNlaXZlIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJucyB0aGUgZ2l2ZW4gcHJvbWlzZSwgdW5jaGFuZ2VkXG4gKi9cblEucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbmZ1bmN0aW9uIHByb2dyZXNzKG9iamVjdCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24gKHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gb3Bwb3J0dW5pdHkgdG8gb2JzZXJ2ZSB0aGUgc2V0dGxpbmcgb2YgYSBwcm9taXNlLFxuICogcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBwcm9taXNlIGlzIGZ1bGZpbGxlZCBvciByZWplY3RlZC4gIEZvcndhcmRzXG4gKiB0aGUgcmVzb2x1dGlvbiB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aGVuIHRoZSBjYWxsYmFjayBpcyBkb25lLlxuICogVGhlIGNhbGxiYWNrIGNhbiByZXR1cm4gYSBwcm9taXNlIHRvIGRlZmVyIGNvbXBsZXRpb24uXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIG9ic2VydmUgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuXG4gKiBwcm9taXNlLCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIHdoZW5cbiAqIGBgZmluYGAgaXMgZG9uZS5cbiAqL1xuUS5maW4gPSAvLyBYWFggbGVnYWN5XG5RW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KVtcImZpbmFsbHlcIl0oY2FsbGJhY2spO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmluID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUT0RPIGF0dGVtcHQgdG8gcmVjeWNsZSB0aGUgcmVqZWN0aW9uIHdpdGggXCJ0aGlzXCIuXG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGVybWluYXRlcyBhIGNoYWluIG9mIHByb21pc2VzLCBmb3JjaW5nIHJlamVjdGlvbnMgdG8gYmVcbiAqIHRocm93biBhcyBleGNlcHRpb25zLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGF0IHRoZSBlbmQgb2YgYSBjaGFpbiBvZiBwcm9taXNlc1xuICogQHJldHVybnMgbm90aGluZ1xuICovXG5RLmRvbmUgPSBmdW5jdGlvbiAob2JqZWN0LCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZG9uZShmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgdmFyIG9uVW5oYW5kbGVkRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgLy8gZm9yd2FyZCB0byBhIGZ1dHVyZSB0dXJuIHNvIHRoYXQgYGB3aGVuYGBcbiAgICAgICAgLy8gZG9lcyBub3QgY2F0Y2ggaXQgYW5kIHR1cm4gaXQgaW50byBhIHJlamVjdGlvbi5cbiAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQXZvaWQgdW5uZWNlc3NhcnkgYG5leHRUaWNrYGluZyB2aWEgYW4gdW5uZWNlc3NhcnkgYHdoZW5gLlxuICAgIHZhciBwcm9taXNlID0gZnVsZmlsbGVkIHx8IHJlamVjdGVkIHx8IHByb2dyZXNzID9cbiAgICAgICAgdGhpcy50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSA6XG4gICAgICAgIHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmRvbWFpbikge1xuICAgICAgICBvblVuaGFuZGxlZEVycm9yID0gcHJvY2Vzcy5kb21haW4uYmluZChvblVuaGFuZGxlZEVycm9yKTtcbiAgICB9XG5cbiAgICBwcm9taXNlLnRoZW4odm9pZCAwLCBvblVuaGFuZGxlZEVycm9yKTtcbn07XG5cbi8qKlxuICogQ2F1c2VzIGEgcHJvbWlzZSB0byBiZSByZWplY3RlZCBpZiBpdCBkb2VzIG5vdCBnZXQgZnVsZmlsbGVkIGJlZm9yZVxuICogc29tZSBtaWxsaXNlY29uZHMgdGltZSBvdXQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHMgdGltZW91dFxuICogQHBhcmFtIHtBbnkqfSBjdXN0b20gZXJyb3IgbWVzc2FnZSBvciBFcnJvciBvYmplY3QgKG9wdGlvbmFsKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpZiBpdCBpc1xuICogZnVsZmlsbGVkIGJlZm9yZSB0aGUgdGltZW91dCwgb3RoZXJ3aXNlIHJlamVjdGVkLlxuICovXG5RLnRpbWVvdXQgPSBmdW5jdGlvbiAob2JqZWN0LCBtcywgZXJyb3IpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRpbWVvdXQobXMsIGVycm9yKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbiAobXMsIGVycm9yKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghZXJyb3IgfHwgXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGVycm9yKSB7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvciB8fCBcIlRpbWVkIG91dCBhZnRlciBcIiArIG1zICsgXCIgbXNcIik7XG4gICAgICAgICAgICBlcnJvci5jb2RlID0gXCJFVElNRURPVVRcIjtcbiAgICAgICAgfVxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgIH0sIG1zKTtcblxuICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChleGNlcHRpb24pIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChleGNlcHRpb24pO1xuICAgIH0sIGRlZmVycmVkLm5vdGlmeSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBnaXZlbiB2YWx1ZSAob3IgcHJvbWlzZWQgdmFsdWUpLCBzb21lXG4gKiBtaWxsaXNlY29uZHMgYWZ0ZXIgaXQgcmVzb2x2ZWQuIFBhc3NlcyByZWplY3Rpb25zIGltbWVkaWF0ZWx5LlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGFmdGVyIG1pbGxpc2Vjb25kc1xuICogdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZS5cbiAqIElmIHRoZSBnaXZlbiBwcm9taXNlIHJlamVjdHMsIHRoYXQgaXMgcGFzc2VkIGltbWVkaWF0ZWx5LlxuICovXG5RLmRlbGF5ID0gZnVuY3Rpb24gKG9iamVjdCwgdGltZW91dCkge1xuICAgIGlmICh0aW1lb3V0ID09PSB2b2lkIDApIHtcbiAgICAgICAgdGltZW91dCA9IG9iamVjdDtcbiAgICAgICAgb2JqZWN0ID0gdm9pZCAwO1xuICAgIH1cbiAgICByZXR1cm4gUShvYmplY3QpLmRlbGF5KHRpbWVvdXQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbiAodGltZW91dCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgYXMgYW4gYXJyYXksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqXG4gKiAgICAgIFEubmZhcHBseShGUy5yZWFkRmlsZSwgW19fZmlsZW5hbWVdKVxuICogICAgICAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogICAgICB9KVxuICpcbiAqL1xuUS5uZmFwcGx5ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBpbmRpdmlkdWFsbHksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mY2FsbChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSlcbiAqIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiB9KVxuICpcbiAqL1xuUS5uZmNhbGwgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFdyYXBzIGEgTm9kZUpTIGNvbnRpbnVhdGlvbiBwYXNzaW5nIGZ1bmN0aW9uIGFuZCByZXR1cm5zIGFuIGVxdWl2YWxlbnRcbiAqIHZlcnNpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mYmluZChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSkoXCJ1dGYtOFwiKVxuICogLnRoZW4oY29uc29sZS5sb2cpXG4gKiAuZG9uZSgpXG4gKi9cblEubmZiaW5kID1cblEuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgUShjYWxsYmFjaykuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmJpbmQgPVxuUHJvbWlzZS5wcm90b3R5cGUuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5kZW5vZGVpZnkuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cblEubmJpbmQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpc3AsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgUShib3VuZCkuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uYmluZCA9IGZ1bmN0aW9uICgvKnRoaXNwLCAuLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMCk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLm5iaW5kLmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2sgd2l0aCBhIGdpdmVuIGFycmF5IG9mIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkIGNhbGxiYWNrLlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIHtBcnJheX0gYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2tcbiAqIHdpbGwgYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEubnBvc3QgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ucG9zdChuYW1lLCBhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUubnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MgfHwgW10pO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjaywgZm9yd2FyZGluZyB0aGUgZ2l2ZW4gdmFyaWFkaWMgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWRcbiAqIGNhbGxiYWNrIGFyZ3VtZW50LlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIC4uLmFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrIHdpbGxcbiAqIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5RLm5pbnZva2UgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblByb21pc2UucHJvdG90eXBlLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblByb21pc2UucHJvdG90eXBlLm5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBJZiBhIGZ1bmN0aW9uIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBib3RoIE5vZGUgY29udGludWF0aW9uLXBhc3Npbmctc3R5bGUgYW5kXG4gKiBwcm9taXNlLXJldHVybmluZy1zdHlsZSwgaXQgY2FuIGVuZCBpdHMgaW50ZXJuYWwgcHJvbWlzZSBjaGFpbiB3aXRoXG4gKiBgbm9kZWlmeShub2RlYmFjaylgLCBmb3J3YXJkaW5nIHRoZSBvcHRpb25hbCBub2RlYmFjayBhcmd1bWVudC4gIElmIHRoZSB1c2VyXG4gKiBlbGVjdHMgdG8gdXNlIGEgbm9kZWJhY2ssIHRoZSByZXN1bHQgd2lsbCBiZSBzZW50IHRoZXJlLiAgSWYgdGhleSBkbyBub3RcbiAqIHBhc3MgYSBub2RlYmFjaywgdGhleSB3aWxsIHJlY2VpdmUgdGhlIHJlc3VsdCBwcm9taXNlLlxuICogQHBhcmFtIG9iamVjdCBhIHJlc3VsdCAob3IgYSBwcm9taXNlIGZvciBhIHJlc3VsdClcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5vZGViYWNrIGEgTm9kZS5qcy1zdHlsZSBjYWxsYmFja1xuICogQHJldHVybnMgZWl0aGVyIHRoZSBwcm9taXNlIG9yIG5vdGhpbmdcbiAqL1xuUS5ub2RlaWZ5ID0gbm9kZWlmeTtcbmZ1bmN0aW9uIG5vZGVpZnkob2JqZWN0LCBub2RlYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdCkubm9kZWlmeShub2RlYmFjayk7XG59XG5cblByb21pc2UucHJvdG90eXBlLm5vZGVpZnkgPSBmdW5jdGlvbiAobm9kZWJhY2spIHtcbiAgICBpZiAobm9kZWJhY2spIHtcbiAgICAgICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cblEubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlEubm9Db25mbGljdCBvbmx5IHdvcmtzIHdoZW4gUSBpcyB1c2VkIGFzIGEgZ2xvYmFsXCIpO1xufTtcblxuLy8gQWxsIGNvZGUgYmVmb3JlIHRoaXMgcG9pbnQgd2lsbCBiZSBmaWx0ZXJlZCBmcm9tIHN0YWNrIHRyYWNlcy5cbnZhciBxRW5kaW5nTGluZSA9IGNhcHR1cmVMaW5lKCk7XG5cbnJldHVybiBRO1xuXG59KTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5eEwzRXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVNJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lMeThnZG1sdE9uUnpQVFE2YzNSelBUUTZjM2M5TkRwY2JpOHFJVnh1SUNwY2JpQXFJRU52Y0hseWFXZG9kQ0F5TURBNUxUSXdNVElnUzNKcGN5QkxiM2RoYkNCMWJtUmxjaUIwYUdVZ2RHVnliWE1nYjJZZ2RHaGxJRTFKVkZ4dUlDb2diR2xqWlc1elpTQm1iM1Z1WkNCaGRDQm9kSFJ3T2k4dloybDBhSFZpTG1OdmJTOXJjbWx6YTI5M1lXd3ZjUzl5WVhjdmJXRnpkR1Z5TDB4SlEwVk9VMFZjYmlBcVhHNGdLaUJYYVhSb0lIQmhjblJ6SUdKNUlGUjViR1Z5SUVOc2IzTmxYRzRnS2lCRGIzQjVjbWxuYUhRZ01qQXdOeTB5TURBNUlGUjViR1Z5SUVOc2IzTmxJSFZ1WkdWeUlIUm9aU0IwWlhKdGN5QnZaaUIwYUdVZ1RVbFVJRmdnYkdsalpXNXpaU0JtYjNWdVpGeHVJQ29nWVhRZ2FIUjBjRG92TDNkM2R5NXZjR1Z1YzI5MWNtTmxMbTl5Wnk5c2FXTmxibk5sY3k5dGFYUXRiR2xqWlc1elpTNW9kRzFzWEc0Z0tpQkdiM0pyWldRZ1lYUWdjbVZtWDNObGJtUXVhbk1nZG1WeWMybHZiam9nTWpBd09TMHdOUzB4TVZ4dUlDcGNiaUFxSUZkcGRHZ2djR0Z5ZEhNZ1lua2dUV0Z5YXlCTmFXeHNaWEpjYmlBcUlFTnZjSGx5YVdkb2RDQW9ReWtnTWpBeE1TQkhiMjluYkdVZ1NXNWpMbHh1SUNwY2JpQXFJRXhwWTJWdWMyVmtJSFZ1WkdWeUlIUm9aU0JCY0dGamFHVWdUR2xqWlc1elpTd2dWbVZ5YzJsdmJpQXlMakFnS0hSb1pTQmNJa3hwWTJWdWMyVmNJaWs3WEc0Z0tpQjViM1VnYldGNUlHNXZkQ0IxYzJVZ2RHaHBjeUJtYVd4bElHVjRZMlZ3ZENCcGJpQmpiMjF3YkdsaGJtTmxJSGRwZEdnZ2RHaGxJRXhwWTJWdWMyVXVYRzRnS2lCWmIzVWdiV0Y1SUc5aWRHRnBiaUJoSUdOdmNIa2diMllnZEdobElFeHBZMlZ1YzJVZ1lYUmNiaUFxWEc0Z0tpQm9kSFJ3T2k4dmQzZDNMbUZ3WVdOb1pTNXZjbWN2YkdsalpXNXpaWE12VEVsRFJVNVRSUzB5TGpCY2JpQXFYRzRnS2lCVmJteGxjM01nY21WeGRXbHlaV1FnWW5rZ1lYQndiR2xqWVdKc1pTQnNZWGNnYjNJZ1lXZHlaV1ZrSUhSdklHbHVJSGR5YVhScGJtY3NJSE52Wm5SM1lYSmxYRzRnS2lCa2FYTjBjbWxpZFhSbFpDQjFibVJsY2lCMGFHVWdUR2xqWlc1elpTQnBjeUJrYVhOMGNtbGlkWFJsWkNCdmJpQmhiaUJjSWtGVElFbFRYQ0lnUWtGVFNWTXNYRzRnS2lCWFNWUklUMVZVSUZkQlVsSkJUbFJKUlZNZ1QxSWdRMDlPUkVsVVNVOU9VeUJQUmlCQlRsa2dTMGxPUkN3Z1pXbDBhR1Z5SUdWNGNISmxjM01nYjNJZ2FXMXdiR2xsWkM1Y2JpQXFJRk5sWlNCMGFHVWdUR2xqWlc1elpTQm1iM0lnZEdobElITndaV05wWm1saklHeGhibWQxWVdkbElHZHZkbVZ5Ym1sdVp5QndaWEp0YVhOemFXOXVjeUJoYm1SY2JpQXFJR3hwYldsMFlYUnBiMjV6SUhWdVpHVnlJSFJvWlNCTWFXTmxibk5sTGx4dUlDcGNiaUFxTDF4dVhHNG9ablZ1WTNScGIyNGdLR1JsWm1sdWFYUnBiMjRwSUh0Y2JpQWdJQ0JjSW5WelpTQnpkSEpwWTNSY0lqdGNibHh1SUNBZ0lDOHZJRlJvYVhNZ1ptbHNaU0IzYVd4c0lHWjFibU4wYVc5dUlIQnliM0JsY214NUlHRnpJR0VnUEhOamNtbHdkRDRnZEdGbkxDQnZjaUJoSUcxdlpIVnNaVnh1SUNBZ0lDOHZJSFZ6YVc1bklFTnZiVzF2YmtwVElHRnVaQ0JPYjJSbFNsTWdiM0lnVW1WeGRXbHlaVXBUSUcxdlpIVnNaU0JtYjNKdFlYUnpMaUFnU1c1Y2JpQWdJQ0F2THlCRGIyMXRiMjR2VG05a1pTOVNaWEYxYVhKbFNsTXNJSFJvWlNCdGIyUjFiR1VnWlhod2IzSjBjeUIwYUdVZ1VTQkJVRWtnWVc1a0lIZG9aVzVjYmlBZ0lDQXZMeUJsZUdWamRYUmxaQ0JoY3lCaElITnBiWEJzWlNBOGMyTnlhWEIwUGl3Z2FYUWdZM0psWVhSbGN5QmhJRkVnWjJ4dlltRnNJR2x1YzNSbFlXUXVYRzVjYmlBZ0lDQXZMeUJOYjI1MFlXZGxJRkpsY1hWcGNtVmNiaUFnSUNCcFppQW9kSGx3Wlc5bUlHSnZiM1J6ZEhKaGNDQTlQVDBnWENKbWRXNWpkR2x2Ymx3aUtTQjdYRzRnSUNBZ0lDQWdJR0p2YjNSemRISmhjQ2hjSW5CeWIyMXBjMlZjSWl3Z1pHVm1hVzVwZEdsdmJpazdYRzVjYmlBZ0lDQXZMeUJEYjIxdGIyNUtVMXh1SUNBZ0lIMGdaV3h6WlNCcFppQW9kSGx3Wlc5bUlHVjRjRzl5ZEhNZ1BUMDlJRndpYjJKcVpXTjBYQ0lnSmlZZ2RIbHdaVzltSUcxdlpIVnNaU0E5UFQwZ1hDSnZZbXBsWTNSY0lpa2dlMXh1SUNBZ0lDQWdJQ0J0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR1JsWm1sdWFYUnBiMjRvS1R0Y2JseHVJQ0FnSUM4dklGSmxjWFZwY21WS1UxeHVJQ0FnSUgwZ1pXeHpaU0JwWmlBb2RIbHdaVzltSUdSbFptbHVaU0E5UFQwZ1hDSm1kVzVqZEdsdmJsd2lJQ1ltSUdSbFptbHVaUzVoYldRcElIdGNiaUFnSUNBZ0lDQWdaR1ZtYVc1bEtHUmxabWx1YVhScGIyNHBPMXh1WEc0Z0lDQWdMeThnVTBWVElDaFRaV04xY21VZ1JXTnRZVk5qY21sd2RDbGNiaUFnSUNCOUlHVnNjMlVnYVdZZ0tIUjVjR1Z2WmlCelpYTWdJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSXBJSHRjYmlBZ0lDQWdJQ0FnYVdZZ0tDRnpaWE11YjJzb0tTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjMlZ6TG0xaGEyVlJJRDBnWkdWbWFXNXBkR2x2Ymp0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0x5OGdQSE5qY21sd2RENWNiaUFnSUNCOUlHVnNjMlVnYVdZZ0tIUjVjR1Z2WmlCM2FXNWtiM2NnSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lnZkh3Z2RIbHdaVzltSUhObGJHWWdJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSXBJSHRjYmlBZ0lDQWdJQ0FnTHk4Z1VISmxabVZ5SUhkcGJtUnZkeUJ2ZG1WeUlITmxiR1lnWm05eUlHRmtaQzF2YmlCelkzSnBjSFJ6TGlCVmMyVWdjMlZzWmlCbWIzSmNiaUFnSUNBZ0lDQWdMeThnYm05dUxYZHBibVJ2ZDJWa0lHTnZiblJsZUhSekxseHVJQ0FnSUNBZ0lDQjJZWElnWjJ4dlltRnNJRDBnZEhsd1pXOW1JSGRwYm1SdmR5QWhQVDBnWENKMWJtUmxabWx1WldSY0lpQS9JSGRwYm1SdmR5QTZJSE5sYkdZN1hHNWNiaUFnSUNBZ0lDQWdMeThnUjJWMElIUm9aU0JnZDJsdVpHOTNZQ0J2WW1wbFkzUXNJSE5oZG1VZ2RHaGxJSEJ5WlhacGIzVnpJRkVnWjJ4dlltRnNYRzRnSUNBZ0lDQWdJQzh2SUdGdVpDQnBibWwwYVdGc2FYcGxJRkVnWVhNZ1lTQm5iRzlpWVd3dVhHNGdJQ0FnSUNBZ0lIWmhjaUJ3Y21WMmFXOTFjMUVnUFNCbmJHOWlZV3d1VVR0Y2JpQWdJQ0FnSUNBZ1oyeHZZbUZzTGxFZ1BTQmtaV1pwYm1sMGFXOXVLQ2s3WEc1Y2JpQWdJQ0FnSUNBZ0x5OGdRV1JrSUdFZ2JtOURiMjVtYkdsamRDQm1kVzVqZEdsdmJpQnpieUJSSUdOaGJpQmlaU0J5WlcxdmRtVmtJR1p5YjIwZ2RHaGxYRzRnSUNBZ0lDQWdJQzh2SUdkc2IySmhiQ0J1WVcxbGMzQmhZMlV1WEc0Z0lDQWdJQ0FnSUdkc2IySmhiQzVSTG01dlEyOXVabXhwWTNRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm5iRzlpWVd3dVVTQTlJSEJ5WlhacGIzVnpVVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCMGFHbHpPMXh1SUNBZ0lDQWdJQ0I5TzF4dVhHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLRndpVkdocGN5QmxiblpwY205dWJXVnVkQ0IzWVhNZ2JtOTBJR0Z1ZEdsamFYQmhkR1ZrSUdKNUlGRXVJRkJzWldGelpTQm1hV3hsSUdFZ1luVm5MbHdpS1R0Y2JpQWdJQ0I5WEc1Y2JuMHBLR1oxYm1OMGFXOXVJQ2dwSUh0Y2Jsd2lkWE5sSUhOMGNtbGpkRndpTzF4dVhHNTJZWElnYUdGelUzUmhZMnR6SUQwZ1ptRnNjMlU3WEc1MGNua2dlMXh1SUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lncE8xeHVmU0JqWVhSamFDQW9aU2tnZTF4dUlDQWdJR2hoYzFOMFlXTnJjeUE5SUNFaFpTNXpkR0ZqYXp0Y2JuMWNibHh1THk4Z1FXeHNJR052WkdVZ1lXWjBaWElnZEdocGN5QndiMmx1ZENCM2FXeHNJR0psSUdacGJIUmxjbVZrSUdaeWIyMGdjM1JoWTJzZ2RISmhZMlZ6SUhKbGNHOXlkR1ZrWEc0dkx5QmllU0JSTGx4dWRtRnlJSEZUZEdGeWRHbHVaMHhwYm1VZ1BTQmpZWEIwZFhKbFRHbHVaU2dwTzF4dWRtRnlJSEZHYVd4bFRtRnRaVHRjYmx4dUx5OGdjMmhwYlhOY2JseHVMeThnZFhObFpDQm1iM0lnWm1Gc2JHSmhZMnNnYVc0Z1hDSmhiR3hTWlhOdmJIWmxaRndpWEc1MllYSWdibTl2Y0NBOUlHWjFibU4wYVc5dUlDZ3BJSHQ5TzF4dVhHNHZMeUJWYzJVZ2RHaGxJR1poYzNSbGMzUWdjRzl6YzJsaWJHVWdiV1ZoYm5NZ2RHOGdaWGhsWTNWMFpTQmhJSFJoYzJzZ2FXNGdZU0JtZFhSMWNtVWdkSFZ5Ymx4dUx5OGdiMllnZEdobElHVjJaVzUwSUd4dmIzQXVYRzUyWVhJZ2JtVjRkRlJwWTJzZ1BTaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdMeThnYkdsdWEyVmtJR3hwYzNRZ2IyWWdkR0Z6YTNNZ0tITnBibWRzWlN3Z2QybDBhQ0JvWldGa0lHNXZaR1VwWEc0Z0lDQWdkbUZ5SUdobFlXUWdQU0I3ZEdGemF6b2dkbTlwWkNBd0xDQnVaWGgwT2lCdWRXeHNmVHRjYmlBZ0lDQjJZWElnZEdGcGJDQTlJR2hsWVdRN1hHNGdJQ0FnZG1GeUlHWnNkWE5vYVc1bklEMGdabUZzYzJVN1hHNGdJQ0FnZG1GeUlISmxjWFZsYzNSVWFXTnJJRDBnZG05cFpDQXdPMXh1SUNBZ0lIWmhjaUJwYzA1dlpHVktVeUE5SUdaaGJITmxPMXh1SUNBZ0lDOHZJSEYxWlhWbElHWnZjaUJzWVhSbElIUmhjMnR6TENCMWMyVmtJR0o1SUhWdWFHRnVaR3hsWkNCeVpXcGxZM1JwYjI0Z2RISmhZMnRwYm1kY2JpQWdJQ0IyWVhJZ2JHRjBaWEpSZFdWMVpTQTlJRnRkTzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWm14MWMyZ29LU0I3WEc0Z0lDQWdJQ0FnSUM4cUlHcHphR2x1ZENCc2IyOXdablZ1WXpvZ2RISjFaU0FxTDF4dUlDQWdJQ0FnSUNCMllYSWdkR0Z6YXl3Z1pHOXRZV2x1TzF4dVhHNGdJQ0FnSUNBZ0lIZG9hV3hsSUNob1pXRmtMbTVsZUhRcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdobFlXUWdQU0JvWldGa0xtNWxlSFE3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBZWE5ySUQwZ2FHVmhaQzUwWVhOck8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYUdWaFpDNTBZWE5ySUQwZ2RtOXBaQ0F3TzF4dUlDQWdJQ0FnSUNBZ0lDQWdaRzl0WVdsdUlEMGdhR1ZoWkM1a2IyMWhhVzQ3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoa2IyMWhhVzRwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCb1pXRmtMbVJ2YldGcGJpQTlJSFp2YVdRZ01EdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtiMjFoYVc0dVpXNTBaWElvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lISjFibE5wYm1kc1pTaDBZWE5yTENCa2IyMWhhVzRwTzF4dVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdkMmhwYkdVZ0tHeGhkR1Z5VVhWbGRXVXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMFlYTnJJRDBnYkdGMFpYSlJkV1YxWlM1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISjFibE5wYm1kc1pTaDBZWE5yS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQm1iSFZ6YUdsdVp5QTlJR1poYkhObE8xeHVJQ0FnSUgxY2JpQWdJQ0F2THlCeWRXNXpJR0VnYzJsdVoyeGxJR1oxYm1OMGFXOXVJR2x1SUhSb1pTQmhjM2x1WXlCeGRXVjFaVnh1SUNBZ0lHWjFibU4wYVc5dUlISjFibE5wYm1kc1pTaDBZWE5yTENCa2IyMWhhVzRwSUh0Y2JpQWdJQ0FnSUNBZ2RISjVJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnNvS1R0Y2JseHVJQ0FnSUNBZ0lDQjlJR05oZEdOb0lDaGxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVhOT2IyUmxTbE1wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdkx5QkpiaUJ1YjJSbExDQjFibU5oZFdkb2RDQmxlR05sY0hScGIyNXpJR0Z5WlNCamIyNXphV1JsY21Wa0lHWmhkR0ZzSUdWeWNtOXljeTVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F2THlCU1pTMTBhSEp2ZHlCMGFHVnRJSE41Ym1Ob2NtOXViM1Z6YkhrZ2RHOGdhVzUwWlhKeWRYQjBJR1pzZFhOb2FXNW5JVnh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1JXNXpkWEpsSUdOdmJuUnBiblZoZEdsdmJpQnBaaUIwYUdVZ2RXNWpZWFZuYUhRZ1pYaGpaWEIwYVc5dUlHbHpJSE4xY0hCeVpYTnpaV1JjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F2THlCc2FYTjBaVzVwYm1jZ1hDSjFibU5oZFdkb2RFVjRZMlZ3ZEdsdmJsd2lJR1YyWlc1MGN5QW9ZWE1nWkc5dFlXbHVjeUJrYjJWektTNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXZMeUJEYjI1MGFXNTFaU0JwYmlCdVpYaDBJR1YyWlc1MElIUnZJR0YyYjJsa0lIUnBZMnNnY21WamRYSnphVzl1TGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGtiMjFoYVc0cElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkc5dFlXbHVMbVY0YVhRb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjMlYwVkdsdFpXOTFkQ2htYkhWemFDd2dNQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHUnZiV0ZwYmlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrYjIxaGFXNHVaVzUwWlhJb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUhKdmR5QmxPMXh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDOHZJRWx1SUdKeWIzZHpaWEp6TENCMWJtTmhkV2RvZENCbGVHTmxjSFJwYjI1eklHRnlaU0J1YjNRZ1ptRjBZV3d1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1VtVXRkR2h5YjNjZ2RHaGxiU0JoYzNsdVkyaHliMjV2ZFhOc2VTQjBieUJoZG05cFpDQnpiRzkzTFdSdmQyNXpMbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5sZEZScGJXVnZkWFFvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUhKdmR5QmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBzSURBcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdhV1lnS0dSdmJXRnBiaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdaRzl0WVdsdUxtVjRhWFFvS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JseHVJQ0FnSUc1bGVIUlVhV05ySUQwZ1puVnVZM1JwYjI0Z0tIUmhjMnNwSUh0Y2JpQWdJQ0FnSUNBZ2RHRnBiQ0E5SUhSaGFXd3VibVY0ZENBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSaGMyczZJSFJoYzJzc1hHNGdJQ0FnSUNBZ0lDQWdJQ0JrYjIxaGFXNDZJR2x6VG05a1pVcFRJQ1ltSUhCeWIyTmxjM011Wkc5dFlXbHVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2JtVjRkRG9nYm5Wc2JGeHVJQ0FnSUNBZ0lDQjlPMXh1WEc0Z0lDQWdJQ0FnSUdsbUlDZ2habXgxYzJocGJtY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnNkWE5vYVc1bklEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsY1hWbGMzUlVhV05yS0NrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOU8xeHVYRzRnSUNBZ2FXWWdLSFI1Y0dWdlppQndjbTlqWlhOeklEMDlQU0JjSW05aWFtVmpkRndpSUNZbVhHNGdJQ0FnSUNBZ0lIQnliMk5sYzNNdWRHOVRkSEpwYm1jb0tTQTlQVDBnWENKYmIySnFaV04wSUhCeWIyTmxjM05kWENJZ0ppWWdjSEp2WTJWemN5NXVaWGgwVkdsamF5a2dlMXh1SUNBZ0lDQWdJQ0F2THlCRmJuTjFjbVVnVVNCcGN5QnBiaUJoSUhKbFlXd2dUbTlrWlNCbGJuWnBjbTl1YldWdWRDd2dkMmwwYUNCaElHQndjbTlqWlhOekxtNWxlSFJVYVdOcllDNWNiaUFnSUNBZ0lDQWdMeThnVkc4Z2MyVmxJSFJvY205MVoyZ2dabUZyWlNCT2IyUmxJR1Z1ZG1seWIyNXRaVzUwY3pwY2JpQWdJQ0FnSUNBZ0x5OGdLaUJOYjJOb1lTQjBaWE4wSUhKMWJtNWxjaUF0SUdWNGNHOXpaWE1nWVNCZ2NISnZZMlZ6YzJBZ1oyeHZZbUZzSUhkcGRHaHZkWFFnWVNCZ2JtVjRkRlJwWTJ0Z1hHNGdJQ0FnSUNBZ0lDOHZJQ29nUW5KdmQzTmxjbWxtZVNBdElHVjRjRzl6WlhNZ1lTQmdjSEp2WTJWemN5NXVaWGhVYVdOcllDQm1kVzVqZEdsdmJpQjBhR0YwSUhWelpYTmNiaUFnSUNBZ0lDQWdMeThnSUNCZ2MyVjBWR2x0Wlc5MWRHQXVJRWx1SUhSb2FYTWdZMkZ6WlNCZ2MyVjBTVzF0WldScFlYUmxZQ0JwY3lCd2NtVm1aWEp5WldRZ1ltVmpZWFZ6WlZ4dUlDQWdJQ0FnSUNBdkx5QWdJQ0JwZENCcGN5Qm1ZWE4wWlhJdUlFSnliM2R6WlhKcFpua25jeUJnY0hKdlkyVnpjeTUwYjFOMGNtbHVaeWdwWUNCNWFXVnNaSE5jYmlBZ0lDQWdJQ0FnTHk4Z0lDQmNJbHR2WW1wbFkzUWdUMkpxWldOMFhWd2lMQ0IzYUdsc1pTQnBiaUJoSUhKbFlXd2dUbTlrWlNCbGJuWnBjbTl1YldWdWRGeHVJQ0FnSUNBZ0lDQXZMeUFnSUdCd2NtOWpaWE56TG01bGVIUlVhV05yS0NsZ0lIbHBaV3hrY3lCY0lsdHZZbXBsWTNRZ2NISnZZMlZ6YzExY0lpNWNiaUFnSUNBZ0lDQWdhWE5PYjJSbFNsTWdQU0IwY25WbE8xeHVYRzRnSUNBZ0lDQWdJSEpsY1hWbGMzUlVhV05ySUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NISnZZMlZ6Y3k1dVpYaDBWR2xqYXlobWJIVnphQ2s3WEc0Z0lDQWdJQ0FnSUgwN1hHNWNiaUFnSUNCOUlHVnNjMlVnYVdZZ0tIUjVjR1Z2WmlCelpYUkpiVzFsWkdsaGRHVWdQVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpa2dlMXh1SUNBZ0lDQWdJQ0F2THlCSmJpQkpSVEV3TENCT2IyUmxMbXB6SURBdU9Tc3NJRzl5SUdoMGRIQnpPaTh2WjJsMGFIVmlMbU52YlM5T2IySnNaVXBUTDNObGRFbHRiV1ZrYVdGMFpWeHVJQ0FnSUNBZ0lDQnBaaUFvZEhsd1pXOW1JSGRwYm1SdmR5QWhQVDBnWENKMWJtUmxabWx1WldSY0lpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVnhkV1Z6ZEZScFkyc2dQU0J6WlhSSmJXMWxaR2xoZEdVdVltbHVaQ2gzYVc1a2IzY3NJR1pzZFhOb0tUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGNYVmxjM1JVYVdOcklEMGdablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhObGRFbHRiV1ZrYVdGMFpTaG1iSFZ6YUNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TzF4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNCOUlHVnNjMlVnYVdZZ0tIUjVjR1Z2WmlCTlpYTnpZV2RsUTJoaGJtNWxiQ0FoUFQwZ1hDSjFibVJsWm1sdVpXUmNJaWtnZTF4dUlDQWdJQ0FnSUNBdkx5QnRiMlJsY200Z1luSnZkM05sY25OY2JpQWdJQ0FnSUNBZ0x5OGdhSFIwY0RvdkwzZDNkeTV1YjI1aWJHOWphMmx1Wnk1cGJ5OHlNREV4THpBMkwzZHBibVJ2ZDI1bGVIUjBhV05yTG1oMGJXeGNiaUFnSUNBZ0lDQWdkbUZ5SUdOb1lXNXVaV3dnUFNCdVpYY2dUV1Z6YzJGblpVTm9ZVzV1Wld3b0tUdGNiaUFnSUNBZ0lDQWdMeThnUVhRZ2JHVmhjM1FnVTJGbVlYSnBJRlpsY25OcGIyNGdOaTR3TGpVZ0tEZzFNell1TXpBdU1Ta2dhVzUwWlhKdGFYUjBaVzUwYkhrZ1kyRnVibTkwSUdOeVpXRjBaVnh1SUNBZ0lDQWdJQ0F2THlCM2IzSnJhVzVuSUcxbGMzTmhaMlVnY0c5eWRITWdkR2hsSUdacGNuTjBJSFJwYldVZ1lTQndZV2RsSUd4dllXUnpMbHh1SUNBZ0lDQWdJQ0JqYUdGdWJtVnNMbkJ2Y25ReExtOXViV1Z6YzJGblpTQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsY1hWbGMzUlVhV05ySUQwZ2NtVnhkV1Z6ZEZCdmNuUlVhV05yTzF4dUlDQWdJQ0FnSUNBZ0lDQWdZMmhoYm01bGJDNXdiM0owTVM1dmJtMWxjM05oWjJVZ1BTQm1iSFZ6YUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1pzZFhOb0tDazdYRzRnSUNBZ0lDQWdJSDA3WEc0Z0lDQWdJQ0FnSUhaaGNpQnlaWEYxWlhOMFVHOXlkRlJwWTJzZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJQY0dWeVlTQnlaWEYxYVhKbGN5QjFjeUIwYnlCd2NtOTJhV1JsSUdFZ2JXVnpjMkZuWlNCd1lYbHNiMkZrTENCeVpXZGhjbVJzWlhOeklHOW1YRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QjNhR1YwYUdWeUlIZGxJSFZ6WlNCcGRDNWNiaUFnSUNBZ0lDQWdJQ0FnSUdOb1lXNXVaV3d1Y0c5eWRESXVjRzl6ZEUxbGMzTmhaMlVvTUNrN1hHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJSEpsY1hWbGMzUlVhV05ySUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2MyVjBWR2x0Wlc5MWRDaG1iSFZ6YUN3Z01DazdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYRjFaWE4wVUc5eWRGUnBZMnNvS1R0Y2JpQWdJQ0FnSUNBZ2ZUdGNibHh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDOHZJRzlzWkNCaWNtOTNjMlZ5YzF4dUlDQWdJQ0FnSUNCeVpYRjFaWE4wVkdsamF5QTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSE5sZEZScGJXVnZkWFFvWm14MWMyZ3NJREFwTzF4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgxY2JpQWdJQ0F2THlCeWRXNXpJR0VnZEdGemF5QmhablJsY2lCaGJHd2diM1JvWlhJZ2RHRnphM01nYUdGMlpTQmlaV1Z1SUhKMWJseHVJQ0FnSUM4dklIUm9hWE1nYVhNZ2RYTmxablZzSUdadmNpQjFibWhoYm1Sc1pXUWdjbVZxWldOMGFXOXVJSFJ5WVdOcmFXNW5JSFJvWVhRZ2JtVmxaSE1nZEc4Z2FHRndjR1Z1WEc0Z0lDQWdMeThnWVdaMFpYSWdZV3hzSUdCMGFHVnVZR1FnZEdGemEzTWdhR0YyWlNCaVpXVnVJSEoxYmk1Y2JpQWdJQ0J1WlhoMFZHbGpheTV5ZFc1QlpuUmxjaUE5SUdaMWJtTjBhVzl1SUNoMFlYTnJLU0I3WEc0Z0lDQWdJQ0FnSUd4aGRHVnlVWFZsZFdVdWNIVnphQ2gwWVhOcktUdGNiaUFnSUNBZ0lDQWdhV1lnS0NGbWJIVnphR2x1WnlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm14MWMyaHBibWNnUFNCMGNuVmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVnhkV1Z6ZEZScFkyc29LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDA3WEc0Z0lDQWdjbVYwZFhKdUlHNWxlSFJVYVdOck8xeHVmU2tvS1R0Y2JseHVMeThnUVhSMFpXMXdkQ0IwYnlCdFlXdGxJR2RsYm1WeWFXTnpJSE5oWm1VZ2FXNGdkR2hsSUdaaFkyVWdiMllnWkc5M2JuTjBjbVZoYlZ4dUx5OGdiVzlrYVdacFkyRjBhVzl1Y3k1Y2JpOHZJRlJvWlhKbElHbHpJRzV2SUhOcGRIVmhkR2x2YmlCM2FHVnlaU0IwYUdseklHbHpJRzVsWTJWemMyRnllUzVjYmk4dklFbG1JSGx2ZFNCdVpXVmtJR0VnYzJWamRYSnBkSGtnWjNWaGNtRnVkR1ZsTENCMGFHVnpaU0J3Y21sdGIzSmthV0ZzY3lCdVpXVmtJSFJ2SUdKbFhHNHZMeUJrWldWd2JIa2dabkp2ZW1WdUlHRnVlWGRoZVN3Z1lXNWtJR2xtSUhsdmRTQmtiMjdpZ0psMElHNWxaV1FnWVNCelpXTjFjbWwwZVNCbmRXRnlZVzUwWldVc1hHNHZMeUIwYUdseklHbHpJR3AxYzNRZ2NHeGhhVzRnY0dGeVlXNXZhV1F1WEc0dkx5QkliM2RsZG1WeUxDQjBhR2x6SUNvcWJXbG5hSFFxS2lCb1lYWmxJSFJvWlNCdWFXTmxJSE5wWkdVdFpXWm1aV04wSUc5bUlISmxaSFZqYVc1bklIUm9aU0J6YVhwbElHOW1YRzR2THlCMGFHVWdiV2x1YVdacFpXUWdZMjlrWlNCaWVTQnlaV1IxWTJsdVp5QjRMbU5oYkd3b0tTQjBieUJ0WlhKbGJIa2dlQ2dwWEc0dkx5QlRaV1VnVFdGeWF5Qk5hV3hzWlhMaWdKbHpJR1Y0Y0d4aGJtRjBhVzl1SUc5bUlIZG9ZWFFnZEdocGN5QmtiMlZ6TGx4dUx5OGdhSFIwY0RvdkwzZHBhMmt1WldOdFlYTmpjbWx3ZEM1dmNtY3ZaRzlyZFM1d2FIQS9hV1E5WTI5dWRtVnVkR2x2Ym5NNmMyRm1aVjl0WlhSaFgzQnliMmR5WVcxdGFXNW5YRzUyWVhJZ1kyRnNiQ0E5SUVaMWJtTjBhVzl1TG1OaGJHdzdYRzVtZFc1amRHbHZiaUIxYm1OMWNuSjVWR2hwY3lobUtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3d1WVhCd2JIa29aaXdnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0I5TzF4dWZWeHVMeThnVkdocGN5QnBjeUJsY1hWcGRtRnNaVzUwTENCaWRYUWdjMnh2ZDJWeU9seHVMeThnZFc1amRYSnllVlJvYVhNZ1BTQkdkVzVqZEdsdmJsOWlhVzVrTG1KcGJtUW9SblZ1WTNScGIyNWZZbWx1WkM1allXeHNLVHRjYmk4dklHaDBkSEE2THk5cWMzQmxjbVl1WTI5dEwzVnVZM1Z5Y25sMGFHbHpYRzVjYm5aaGNpQmhjbkpoZVY5emJHbGpaU0E5SUhWdVkzVnljbmxVYUdsektFRnljbUY1TG5CeWIzUnZkSGx3WlM1emJHbGpaU2s3WEc1Y2JuWmhjaUJoY25KaGVWOXlaV1IxWTJVZ1BTQjFibU4xY25KNVZHaHBjeWhjYmlBZ0lDQkJjbkpoZVM1d2NtOTBiM1I1Y0dVdWNtVmtkV05sSUh4OElHWjFibU4wYVc5dUlDaGpZV3hzWW1GamF5d2dZbUZ6YVhNcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUdsdVpHVjRJRDBnTUN4Y2JpQWdJQ0FnSUNBZ0lDQWdJR3hsYm1kMGFDQTlJSFJvYVhNdWJHVnVaM1JvTzF4dUlDQWdJQ0FnSUNBdkx5QmpiMjVqWlhKdWFXNW5JSFJvWlNCcGJtbDBhV0ZzSUhaaGJIVmxMQ0JwWmlCdmJtVWdhWE1nYm05MElIQnliM1pwWkdWa1hHNGdJQ0FnSUNBZ0lHbG1JQ2hoY21kMWJXVnVkSE11YkdWdVozUm9JRDA5UFNBeEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QnpaV1ZySUhSdklIUm9aU0JtYVhKemRDQjJZV3gxWlNCcGJpQjBhR1VnWVhKeVlYa3NJR0ZqWTI5MWJuUnBibWRjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJR1p2Y2lCMGFHVWdjRzl6YzJsaWFXeHBkSGtnZEdoaGRDQnBjeUJwY3lCaElITndZWEp6WlNCaGNuSmhlVnh1SUNBZ0lDQWdJQ0FnSUNBZ1pHOGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNocGJtUmxlQ0JwYmlCMGFHbHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHSmhjMmx6SUQwZ2RHaHBjMXRwYm1SbGVDc3JYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDZ3JLMmx1WkdWNElENDlJR3hsYm1kMGFDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQjNhR2xzWlNBb01TazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnTHk4Z2NtVmtkV05sWEc0Z0lDQWdJQ0FnSUdadmNpQW9PeUJwYm1SbGVDQThJR3hsYm1kMGFEc2dhVzVrWlhnckt5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdZV05qYjNWdWRDQm1iM0lnZEdobElIQnZjM05wWW1sc2FYUjVJSFJvWVhRZ2RHaGxJR0Z5Y21GNUlHbHpJSE53WVhKelpWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHbHVaR1Y0SUdsdUlIUm9hWE1wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaVlYTnBjeUE5SUdOaGJHeGlZV05yS0dKaGMybHpMQ0IwYUdselcybHVaR1Y0WFN3Z2FXNWtaWGdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJpWVhOcGN6dGNiaUFnSUNCOVhHNHBPMXh1WEc1MllYSWdZWEp5WVhsZmFXNWtaWGhQWmlBOUlIVnVZM1Z5Y25sVWFHbHpLRnh1SUNBZ0lFRnljbUY1TG5CeWIzUnZkSGx3WlM1cGJtUmxlRTltSUh4OElHWjFibU4wYVc5dUlDaDJZV3gxWlNrZ2UxeHVJQ0FnSUNBZ0lDQXZMeUJ1YjNRZ1lTQjJaWEo1SUdkdmIyUWdjMmhwYlN3Z1luVjBJR2R2YjJRZ1pXNXZkV2RvSUdadmNpQnZkWElnYjI1bElIVnpaU0J2WmlCcGRGeHVJQ0FnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJSFJvYVhNdWJHVnVaM1JvT3lCcEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gwYUdselcybGRJRDA5UFNCMllXeDFaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUF0TVR0Y2JpQWdJQ0I5WEc0cE8xeHVYRzUyWVhJZ1lYSnlZWGxmYldGd0lEMGdkVzVqZFhKeWVWUm9hWE1vWEc0Z0lDQWdRWEp5WVhrdWNISnZkRzkwZVhCbExtMWhjQ0I4ZkNCbWRXNWpkR2x2YmlBb1kyRnNiR0poWTJzc0lIUm9hWE53S1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ6Wld4bUlEMGdkR2hwY3p0Y2JpQWdJQ0FnSUNBZ2RtRnlJR052Ykd4bFkzUWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ1lYSnlZWGxmY21Wa2RXTmxLSE5sYkdZc0lHWjFibU4wYVc5dUlDaDFibVJsWm1sdVpXUXNJSFpoYkhWbExDQnBibVJsZUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5c2JHVmpkQzV3ZFhOb0tHTmhiR3hpWVdOckxtTmhiR3dvZEdocGMzQXNJSFpoYkhWbExDQnBibVJsZUN3Z2MyVnNaaWtwTzF4dUlDQWdJQ0FnSUNCOUxDQjJiMmxrSURBcE8xeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1kyOXNiR1ZqZER0Y2JpQWdJQ0I5WEc0cE8xeHVYRzUyWVhJZ2IySnFaV04wWDJOeVpXRjBaU0E5SUU5aWFtVmpkQzVqY21WaGRHVWdmSHdnWm5WdVkzUnBiMjRnS0hCeWIzUnZkSGx3WlNrZ2UxeHVJQ0FnSUdaMWJtTjBhVzl1SUZSNWNHVW9LU0I3SUgxY2JpQWdJQ0JVZVhCbExuQnliM1J2ZEhsd1pTQTlJSEJ5YjNSdmRIbHdaVHRjYmlBZ0lDQnlaWFIxY200Z2JtVjNJRlI1Y0dVb0tUdGNibjA3WEc1Y2JuWmhjaUJ2WW1wbFkzUmZhR0Z6VDNkdVVISnZjR1Z5ZEhrZ1BTQjFibU4xY25KNVZHaHBjeWhQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMbWhoYzA5M2JsQnliM0JsY25SNUtUdGNibHh1ZG1GeUlHOWlhbVZqZEY5clpYbHpJRDBnVDJKcVpXTjBMbXRsZVhNZ2ZId2dablZ1WTNScGIyNGdLRzlpYW1WamRDa2dlMXh1SUNBZ0lIWmhjaUJyWlhseklEMGdXMTA3WEc0Z0lDQWdabTl5SUNoMllYSWdhMlY1SUdsdUlHOWlhbVZqZENrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvYjJKcVpXTjBYMmhoYzA5M2JsQnliM0JsY25SNUtHOWlhbVZqZEN3Z2EyVjVLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhMlY1Y3k1d2RYTm9LR3RsZVNrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNGdJQ0FnY21WMGRYSnVJR3RsZVhNN1hHNTlPMXh1WEc1MllYSWdiMkpxWldOMFgzUnZVM1J5YVc1bklEMGdkVzVqZFhKeWVWUm9hWE1vVDJKcVpXTjBMbkJ5YjNSdmRIbHdaUzUwYjFOMGNtbHVaeWs3WEc1Y2JtWjFibU4wYVc5dUlHbHpUMkpxWldOMEtIWmhiSFZsS1NCN1hHNGdJQ0FnY21WMGRYSnVJSFpoYkhWbElEMDlQU0JQWW1wbFkzUW9kbUZzZFdVcE8xeHVmVnh1WEc0dkx5Qm5aVzVsY21GMGIzSWdjbVZzWVhSbFpDQnphR2x0YzF4dVhHNHZMeUJHU1ZoTlJUb2dVbVZ0YjNabElIUm9hWE1nWm5WdVkzUnBiMjRnYjI1alpTQkZVellnWjJWdVpYSmhkRzl5Y3lCaGNtVWdhVzRnVTNCcFpHVnlUVzl1YTJWNUxseHVablZ1WTNScGIyNGdhWE5UZEc5d1NYUmxjbUYwYVc5dUtHVjRZMlZ3ZEdsdmJpa2dlMXh1SUNBZ0lISmxkSFZ5YmlBb1hHNGdJQ0FnSUNBZ0lHOWlhbVZqZEY5MGIxTjBjbWx1WnlobGVHTmxjSFJwYjI0cElEMDlQU0JjSWx0dlltcGxZM1FnVTNSdmNFbDBaWEpoZEdsdmJsMWNJaUI4ZkZ4dUlDQWdJQ0FnSUNCbGVHTmxjSFJwYjI0Z2FXNXpkR0Z1WTJWdlppQlJVbVYwZFhKdVZtRnNkV1ZjYmlBZ0lDQXBPMXh1ZlZ4dVhHNHZMeUJHU1ZoTlJUb2dVbVZ0YjNabElIUm9hWE1nYUdWc2NHVnlJR0Z1WkNCUkxuSmxkSFZ5YmlCdmJtTmxJRVZUTmlCblpXNWxjbUYwYjNKeklHRnlaU0JwYmx4dUx5OGdVM0JwWkdWeVRXOXVhMlY1TGx4dWRtRnlJRkZTWlhSMWNtNVdZV3gxWlR0Y2JtbG1JQ2gwZVhCbGIyWWdVbVYwZFhKdVZtRnNkV1VnSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lwSUh0Y2JpQWdJQ0JSVW1WMGRYSnVWbUZzZFdVZ1BTQlNaWFIxY201V1lXeDFaVHRjYm4wZ1pXeHpaU0I3WEc0Z0lDQWdVVkpsZEhWeWJsWmhiSFZsSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsS1NCN1hHNGdJQ0FnSUNBZ0lIUm9hWE11ZG1Gc2RXVWdQU0IyWVd4MVpUdGNiaUFnSUNCOU8xeHVmVnh1WEc0dkx5QnNiMjVuSUhOMFlXTnJJSFJ5WVdObGMxeHVYRzUyWVhJZ1UxUkJRMHRmU2xWTlVGOVRSVkJCVWtGVVQxSWdQU0JjSWtaeWIyMGdjSEpsZG1sdmRYTWdaWFpsYm5RNlhDSTdYRzVjYm1aMWJtTjBhVzl1SUcxaGEyVlRkR0ZqYTFSeVlXTmxURzl1WnlobGNuSnZjaXdnY0hKdmJXbHpaU2tnZTF4dUlDQWdJQzh2SUVsbUlIQnZjM05wWW14bExDQjBjbUZ1YzJadmNtMGdkR2hsSUdWeWNtOXlJSE4wWVdOcklIUnlZV05sSUdKNUlISmxiVzkyYVc1bklFNXZaR1VnWVc1a0lGRmNiaUFnSUNBdkx5QmpjblZtZEN3Z2RHaGxiaUJqYjI1allYUmxibUYwYVc1bklIZHBkR2dnZEdobElITjBZV05ySUhSeVlXTmxJRzltSUdCd2NtOXRhWE5sWUM0Z1UyVmxJQ00xTnk1Y2JpQWdJQ0JwWmlBb2FHRnpVM1JoWTJ0eklDWW1YRzRnSUNBZ0lDQWdJSEJ5YjIxcGMyVXVjM1JoWTJzZ0ppWmNiaUFnSUNBZ0lDQWdkSGx3Wlc5bUlHVnljbTl5SUQwOVBTQmNJbTlpYW1WamRGd2lJQ1ltWEc0Z0lDQWdJQ0FnSUdWeWNtOXlJQ0U5UFNCdWRXeHNJQ1ltWEc0Z0lDQWdJQ0FnSUdWeWNtOXlMbk4wWVdOcklDWW1YRzRnSUNBZ0lDQWdJR1Z5Y205eUxuTjBZV05yTG1sdVpHVjRUMllvVTFSQlEwdGZTbFZOVUY5VFJWQkJVa0ZVVDFJcElEMDlQU0F0TVZ4dUlDQWdJQ2tnZTF4dUlDQWdJQ0FnSUNCMllYSWdjM1JoWTJ0eklEMGdXMTA3WEc0Z0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUhBZ1BTQndjbTl0YVhObE95QWhJWEE3SUhBZ1BTQndMbk52ZFhKalpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEF1YzNSaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J6ZEdGamEzTXVkVzV6YUdsbWRDaHdMbk4wWVdOcktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnpkR0ZqYTNNdWRXNXphR2xtZENobGNuSnZjaTV6ZEdGamF5azdYRzVjYmlBZ0lDQWdJQ0FnZG1GeUlHTnZibU5oZEdWa1UzUmhZMnR6SUQwZ2MzUmhZMnR6TG1wdmFXNG9YQ0pjWEc1Y0lpQXJJRk5VUVVOTFgwcFZUVkJmVTBWUVFWSkJWRTlTSUNzZ1hDSmNYRzVjSWlrN1hHNGdJQ0FnSUNBZ0lHVnljbTl5TG5OMFlXTnJJRDBnWm1sc2RHVnlVM1JoWTJ0VGRISnBibWNvWTI5dVkyRjBaV1JUZEdGamEzTXBPMXh1SUNBZ0lIMWNibjFjYmx4dVpuVnVZM1JwYjI0Z1ptbHNkR1Z5VTNSaFkydFRkSEpwYm1jb2MzUmhZMnRUZEhKcGJtY3BJSHRjYmlBZ0lDQjJZWElnYkdsdVpYTWdQU0J6ZEdGamExTjBjbWx1Wnk1emNHeHBkQ2hjSWx4Y2Jsd2lLVHRjYmlBZ0lDQjJZWElnWkdWemFYSmxaRXhwYm1WeklEMGdXMTA3WEc0Z0lDQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JzYVc1bGN5NXNaVzVuZEdnN0lDc3JhU2tnZTF4dUlDQWdJQ0FnSUNCMllYSWdiR2x1WlNBOUlHeHBibVZ6VzJsZE8xeHVYRzRnSUNBZ0lDQWdJR2xtSUNnaGFYTkpiblJsY201aGJFWnlZVzFsS0d4cGJtVXBJQ1ltSUNGcGMwNXZaR1ZHY21GdFpTaHNhVzVsS1NBbUppQnNhVzVsS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JrWlhOcGNtVmtUR2x1WlhNdWNIVnphQ2hzYVc1bEtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnSUNCeVpYUjFjbTRnWkdWemFYSmxaRXhwYm1WekxtcHZhVzRvWENKY1hHNWNJaWs3WEc1OVhHNWNibVoxYm1OMGFXOXVJR2x6VG05a1pVWnlZVzFsS0hOMFlXTnJUR2x1WlNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJ6ZEdGamEweHBibVV1YVc1a1pYaFBaaWhjSWlodGIyUjFiR1V1YW5NNlhDSXBJQ0U5UFNBdE1TQjhmRnh1SUNBZ0lDQWdJQ0FnSUNCemRHRmphMHhwYm1VdWFXNWtaWGhQWmloY0lpaHViMlJsTG1wek9sd2lLU0FoUFQwZ0xURTdYRzU5WEc1Y2JtWjFibU4wYVc5dUlHZGxkRVpwYkdWT1lXMWxRVzVrVEdsdVpVNTFiV0psY2loemRHRmphMHhwYm1VcElIdGNiaUFnSUNBdkx5Qk9ZVzFsWkNCbWRXNWpkR2x2Ym5NNklGd2lZWFFnWm5WdVkzUnBiMjVPWVcxbElDaG1hV3hsYm1GdFpUcHNhVzVsVG5WdFltVnlPbU52YkhWdGJrNTFiV0psY2lsY0lseHVJQ0FnSUM4dklFbHVJRWxGTVRBZ1puVnVZM1JwYjI0Z2JtRnRaU0JqWVc0Z2FHRjJaU0J6Y0dGalpYTWdLRndpUVc1dmJubHRiM1Z6SUdaMWJtTjBhVzl1WENJcElFOWZiMXh1SUNBZ0lIWmhjaUJoZEhSbGJYQjBNU0E5SUM5aGRDQXVLeUJjWENnb0xpc3BPaWhjWEdRcktUb29QenBjWEdRcktWeGNLU1F2TG1WNFpXTW9jM1JoWTJ0TWFXNWxLVHRjYmlBZ0lDQnBaaUFvWVhSMFpXMXdkREVwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUZ0aGRIUmxiWEIwTVZzeFhTd2dUblZ0WW1WeUtHRjBkR1Z0Y0hReFd6SmRLVjA3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMeThnUVc1dmJubHRiM1Z6SUdaMWJtTjBhVzl1Y3pvZ1hDSmhkQ0JtYVd4bGJtRnRaVHBzYVc1bFRuVnRZbVZ5T21OdmJIVnRiazUxYldKbGNsd2lYRzRnSUNBZ2RtRnlJR0YwZEdWdGNIUXlJRDBnTDJGMElDaGJYaUJkS3lrNktGeGNaQ3NwT2lnL09seGNaQ3NwSkM4dVpYaGxZeWh6ZEdGamEweHBibVVwTzF4dUlDQWdJR2xtSUNoaGRIUmxiWEIwTWlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1cyRjBkR1Z0Y0hReVd6RmRMQ0JPZFcxaVpYSW9ZWFIwWlcxd2RESmJNbDBwWFR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F2THlCR2FYSmxabTk0SUhOMGVXeGxPaUJjSW1aMWJtTjBhVzl1UUdacGJHVnVZVzFsT214cGJtVk9kVzFpWlhJZ2IzSWdRR1pwYkdWdVlXMWxPbXhwYm1WT2RXMWlaWEpjSWx4dUlDQWdJSFpoY2lCaGRIUmxiWEIwTXlBOUlDOHVLa0FvTGlzcE9paGNYR1FyS1NRdkxtVjRaV01vYzNSaFkydE1hVzVsS1R0Y2JpQWdJQ0JwWmlBb1lYUjBaVzF3ZERNcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGdGhkSFJsYlhCME0xc3hYU3dnVG5WdFltVnlLR0YwZEdWdGNIUXpXekpkS1YwN1hHNGdJQ0FnZlZ4dWZWeHVYRzVtZFc1amRHbHZiaUJwYzBsdWRHVnlibUZzUm5KaGJXVW9jM1JoWTJ0TWFXNWxLU0I3WEc0Z0lDQWdkbUZ5SUdacGJHVk9ZVzFsUVc1a1RHbHVaVTUxYldKbGNpQTlJR2RsZEVacGJHVk9ZVzFsUVc1a1RHbHVaVTUxYldKbGNpaHpkR0ZqYTB4cGJtVXBPMXh1WEc0Z0lDQWdhV1lnS0NGbWFXeGxUbUZ0WlVGdVpFeHBibVZPZFcxaVpYSXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1poYkhObE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUhaaGNpQm1hV3hsVG1GdFpTQTlJR1pwYkdWT1lXMWxRVzVrVEdsdVpVNTFiV0psY2xzd1hUdGNiaUFnSUNCMllYSWdiR2x1WlU1MWJXSmxjaUE5SUdacGJHVk9ZVzFsUVc1a1RHbHVaVTUxYldKbGNsc3hYVHRjYmx4dUlDQWdJSEpsZEhWeWJpQm1hV3hsVG1GdFpTQTlQVDBnY1VacGJHVk9ZVzFsSUNZbVhHNGdJQ0FnSUNBZ0lHeHBibVZPZFcxaVpYSWdQajBnY1ZOMFlYSjBhVzVuVEdsdVpTQW1KbHh1SUNBZ0lDQWdJQ0JzYVc1bFRuVnRZbVZ5SUR3OUlIRkZibVJwYm1kTWFXNWxPMXh1ZlZ4dVhHNHZMeUJrYVhOamIzWmxjaUJ2ZDI0Z1ptbHNaU0J1WVcxbElHRnVaQ0JzYVc1bElHNTFiV0psY2lCeVlXNW5aU0JtYjNJZ1ptbHNkR1Z5YVc1bklITjBZV05yWEc0dkx5QjBjbUZqWlhOY2JtWjFibU4wYVc5dUlHTmhjSFIxY21WTWFXNWxLQ2tnZTF4dUlDQWdJR2xtSUNnaGFHRnpVM1JoWTJ0ektTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNCOVhHNWNiaUFnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9LVHRjYmlBZ0lDQjlJR05oZEdOb0lDaGxLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQnNhVzVsY3lBOUlHVXVjM1JoWTJzdWMzQnNhWFFvWENKY1hHNWNJaWs3WEc0Z0lDQWdJQ0FnSUhaaGNpQm1hWEp6ZEV4cGJtVWdQU0JzYVc1bGMxc3dYUzVwYm1SbGVFOW1LRndpUUZ3aUtTQStJREFnUHlCc2FXNWxjMXN4WFNBNklHeHBibVZ6V3pKZE8xeHVJQ0FnSUNBZ0lDQjJZWElnWm1sc1pVNWhiV1ZCYm1STWFXNWxUblZ0WW1WeUlEMGdaMlYwUm1sc1pVNWhiV1ZCYm1STWFXNWxUblZ0WW1WeUtHWnBjbk4wVEdsdVpTazdYRzRnSUNBZ0lDQWdJR2xtSUNnaFptbHNaVTVoYldWQmJtUk1hVzVsVG5WdFltVnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0J4Um1sc1pVNWhiV1VnUFNCbWFXeGxUbUZ0WlVGdVpFeHBibVZPZFcxaVpYSmJNRjA3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtYVd4bFRtRnRaVUZ1WkV4cGJtVk9kVzFpWlhKYk1WMDdYRzRnSUNBZ2ZWeHVmVnh1WEc1bWRXNWpkR2x2YmlCa1pYQnlaV05oZEdVb1kyRnNiR0poWTJzc0lHNWhiV1VzSUdGc2RHVnlibUYwYVhabEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdhV1lnS0hSNWNHVnZaaUJqYjI1emIyeGxJQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJQ1ltWEc0Z0lDQWdJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1kyOXVjMjlzWlM1M1lYSnVJRDA5UFNCY0ltWjFibU4wYVc5dVhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdWQyRnliaWh1WVcxbElDc2dYQ0lnYVhNZ1pHVndjbVZqWVhSbFpDd2dkWE5sSUZ3aUlDc2dZV3gwWlhKdVlYUnBkbVVnSzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUZ3aUlHbHVjM1JsWVdRdVhDSXNJRzVsZHlCRmNuSnZjaWhjSWx3aUtTNXpkR0ZqYXlrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOckxtRndjR3g1S0dOaGJHeGlZV05yTENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUgwN1hHNTlYRzVjYmk4dklHVnVaQ0J2WmlCemFHbHRjMXh1THk4Z1ltVm5hVzV1YVc1bklHOW1JSEpsWVd3Z2QyOXlhMXh1WEc0dktpcGNiaUFxSUVOdmJuTjBjblZqZEhNZ1lTQndjbTl0YVhObElHWnZjaUJoYmlCcGJXMWxaR2xoZEdVZ2NtVm1aWEpsYm1ObExDQndZWE56WlhNZ2NISnZiV2x6WlhNZ2RHaHliM1ZuYUN3Z2IzSmNiaUFxSUdOdlpYSmpaWE1nY0hKdmJXbHpaWE1nWm5KdmJTQmthV1ptWlhKbGJuUWdjM2x6ZEdWdGN5NWNiaUFxSUVCd1lYSmhiU0IyWVd4MVpTQnBiVzFsWkdsaGRHVWdjbVZtWlhKbGJtTmxJRzl5SUhCeWIyMXBjMlZjYmlBcUwxeHVablZ1WTNScGIyNGdVU2gyWVd4MVpTa2dlMXh1SUNBZ0lDOHZJRWxtSUhSb1pTQnZZbXBsWTNRZ2FYTWdZV3h5WldGa2VTQmhJRkJ5YjIxcGMyVXNJSEpsZEhWeWJpQnBkQ0JrYVhKbFkzUnNlUzRnSUZSb2FYTWdaVzVoWW14bGMxeHVJQ0FnSUM4dklIUm9aU0J5WlhOdmJIWmxJR1oxYm1OMGFXOXVJSFJ2SUdKdmRHZ2dZbVVnZFhObFpDQjBieUJqY21WaGRHVmtJSEpsWm1WeVpXNWpaWE1nWm5KdmJTQnZZbXBsWTNSekxGeHVJQ0FnSUM4dklHSjFkQ0IwYnlCMGIyeGxjbUZpYkhrZ1kyOWxjbU5sSUc1dmJpMXdjbTl0YVhObGN5QjBieUJ3Y205dGFYTmxjeTVjYmlBZ0lDQnBaaUFvZG1Gc2RXVWdhVzV6ZEdGdVkyVnZaaUJRY205dGFYTmxLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUIyWVd4MVpUdGNiaUFnSUNCOVhHNWNiaUFnSUNBdkx5QmhjM05wYldsc1lYUmxJSFJvWlc1aFlteGxjMXh1SUNBZ0lHbG1JQ2hwYzFCeWIyMXBjMlZCYkdsclpTaDJZV3gxWlNrcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHTnZaWEpqWlNoMllXeDFaU2s3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFiR1pwYkd3b2RtRnNkV1VwTzF4dUlDQWdJSDFjYm4xY2JsRXVjbVZ6YjJ4MlpTQTlJRkU3WEc1Y2JpOHFLbHh1SUNvZ1VHVnlabTl5YlhNZ1lTQjBZWE5ySUdsdUlHRWdablYwZFhKbElIUjFjbTRnYjJZZ2RHaGxJR1YyWlc1MElHeHZiM0F1WEc0Z0tpQkFjR0Z5WVcwZ2UwWjFibU4wYVc5dWZTQjBZWE5yWEc0Z0tpOWNibEV1Ym1WNGRGUnBZMnNnUFNCdVpYaDBWR2xqYXp0Y2JseHVMeW9xWEc0Z0tpQkRiMjUwY205c2N5QjNhR1YwYUdWeUlHOXlJRzV2ZENCc2IyNW5JSE4wWVdOcklIUnlZV05sY3lCM2FXeHNJR0psSUc5dVhHNGdLaTljYmxFdWJHOXVaMU4wWVdOclUzVndjRzl5ZENBOUlHWmhiSE5sTzF4dVhHNHZMeUJsYm1GaWJHVWdiRzl1WnlCemRHRmphM01nYVdZZ1VWOUVSVUpWUnlCcGN5QnpaWFJjYm1sbUlDaDBlWEJsYjJZZ2NISnZZMlZ6Y3lBOVBUMGdYQ0p2WW1wbFkzUmNJaUFtSmlCd2NtOWpaWE56SUNZbUlIQnliMk5sYzNNdVpXNTJJQ1ltSUhCeWIyTmxjM011Wlc1MkxsRmZSRVZDVlVjcElIdGNiaUFnSUNCUkxteHZibWRUZEdGamExTjFjSEJ2Y25RZ1BTQjBjblZsTzF4dWZWeHVYRzR2S2lwY2JpQXFJRU52Ym5OMGNuVmpkSE1nWVNCN2NISnZiV2x6WlN3Z2NtVnpiMngyWlN3Z2NtVnFaV04wZlNCdlltcGxZM1F1WEc0Z0tseHVJQ29nWUhKbGMyOXNkbVZnSUdseklHRWdZMkZzYkdKaFkyc2dkRzhnYVc1MmIydGxJSGRwZEdnZ1lTQnRiM0psSUhKbGMyOXNkbVZrSUhaaGJIVmxJR1p2Y2lCMGFHVmNiaUFxSUhCeWIyMXBjMlV1SUZSdklHWjFiR1pwYkd3Z2RHaGxJSEJ5YjIxcGMyVXNJR2x1ZG05clpTQmdjbVZ6YjJ4MlpXQWdkMmwwYUNCaGJua2dkbUZzZFdVZ2RHaGhkQ0JwYzF4dUlDb2dibTkwSUdFZ2RHaGxibUZpYkdVdUlGUnZJSEpsYW1WamRDQjBhR1VnY0hKdmJXbHpaU3dnYVc1MmIydGxJR0J5WlhOdmJIWmxZQ0IzYVhSb0lHRWdjbVZxWldOMFpXUmNiaUFxSUhSb1pXNWhZbXhsTENCdmNpQnBiblp2YTJVZ1lISmxhbVZqZEdBZ2QybDBhQ0IwYUdVZ2NtVmhjMjl1SUdScGNtVmpkR3g1TGlCVWJ5QnlaWE52YkhabElIUm9aVnh1SUNvZ2NISnZiV2x6WlNCMGJ5QmhibTkwYUdWeUlIUm9aVzVoWW14bExDQjBhSFZ6SUhCMWRIUnBibWNnYVhRZ2FXNGdkR2hsSUhOaGJXVWdjM1JoZEdVc0lHbHVkbTlyWlZ4dUlDb2dZSEpsYzI5c2RtVmdJSGRwZEdnZ2RHaGhkQ0J2ZEdobGNpQjBhR1Z1WVdKc1pTNWNiaUFxTDF4dVVTNWtaV1psY2lBOUlHUmxabVZ5TzF4dVpuVnVZM1JwYjI0Z1pHVm1aWElvS1NCN1hHNGdJQ0FnTHk4Z2FXWWdYQ0p0WlhOellXZGxjMXdpSUdseklHRnVJRndpUVhKeVlYbGNJaXdnZEdoaGRDQnBibVJwWTJGMFpYTWdkR2hoZENCMGFHVWdjSEp2YldselpTQm9ZWE1nYm05MElIbGxkRnh1SUNBZ0lDOHZJR0psWlc0Z2NtVnpiMngyWldRdUlDQkpaaUJwZENCcGN5QmNJblZ1WkdWbWFXNWxaRndpTENCcGRDQm9ZWE1nWW1WbGJpQnlaWE52YkhabFpDNGdJRVZoWTJoY2JpQWdJQ0F2THlCbGJHVnRaVzUwSUc5bUlIUm9aU0J0WlhOellXZGxjeUJoY25KaGVTQnBjeUJwZEhObGJHWWdZVzRnWVhKeVlYa2diMllnWTI5dGNHeGxkR1VnWVhKbmRXMWxiblJ6SUhSdlhHNGdJQ0FnTHk4Z1ptOXlkMkZ5WkNCMGJ5QjBhR1VnY21WemIyeDJaV1FnY0hKdmJXbHpaUzRnSUZkbElHTnZaWEpqWlNCMGFHVWdjbVZ6YjJ4MWRHbHZiaUIyWVd4MVpTQjBieUJoWEc0Z0lDQWdMeThnY0hKdmJXbHpaU0IxYzJsdVp5QjBhR1VnWUhKbGMyOXNkbVZnSUdaMWJtTjBhVzl1SUdKbFkyRjFjMlVnYVhRZ2FHRnVaR3hsY3lCaWIzUm9JR1oxYkd4NVhHNGdJQ0FnTHk4Z2JtOXVMWFJvWlc1aFlteGxJSFpoYkhWbGN5QmhibVFnYjNSb1pYSWdkR2hsYm1GaWJHVnpJR2R5WVdObFpuVnNiSGt1WEc0Z0lDQWdkbUZ5SUcxbGMzTmhaMlZ6SUQwZ1cxMHNJSEJ5YjJkeVpYTnpUR2x6ZEdWdVpYSnpJRDBnVzEwc0lISmxjMjlzZG1Wa1VISnZiV2x6WlR0Y2JseHVJQ0FnSUhaaGNpQmtaV1psY25KbFpDQTlJRzlpYW1WamRGOWpjbVZoZEdVb1pHVm1aWEl1Y0hKdmRHOTBlWEJsS1R0Y2JpQWdJQ0IyWVhJZ2NISnZiV2x6WlNBOUlHOWlhbVZqZEY5amNtVmhkR1VvVUhKdmJXbHpaUzV3Y205MGIzUjVjR1VwTzF4dVhHNGdJQ0FnY0hKdmJXbHpaUzV3Y205dGFYTmxSR2x6Y0dGMFkyZ2dQU0JtZFc1amRHbHZiaUFvY21WemIyeDJaU3dnYjNBc0lHOXdaWEpoYm1SektTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCaGNtZHpJRDBnWVhKeVlYbGZjMnhwWTJVb1lYSm5kVzFsYm5SektUdGNiaUFnSUNBZ0lDQWdhV1lnS0cxbGMzTmhaMlZ6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J0WlhOellXZGxjeTV3ZFhOb0tHRnlaM01wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0c5d0lEMDlQU0JjSW5kb1pXNWNJaUFtSmlCdmNHVnlZVzVrYzFzeFhTa2dleUF2THlCd2NtOW5jbVZ6Y3lCdmNHVnlZVzVrWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0hKdlozSmxjM05NYVhOMFpXNWxjbk11Y0hWemFDaHZjR1Z5WVc1a2Mxc3hYU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCUkxtNWxlSFJVYVdOcktHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOdmJIWmxaRkJ5YjIxcGMyVXVjSEp2YldselpVUnBjM0JoZEdOb0xtRndjR3g1S0hKbGMyOXNkbVZrVUhKdmJXbHpaU3dnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMDdYRzVjYmlBZ0lDQXZMeUJZV0ZnZ1pHVndjbVZqWVhSbFpGeHVJQ0FnSUhCeWIyMXBjMlV1ZG1Gc2RXVlBaaUE5SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdhV1lnS0cxbGMzTmhaMlZ6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdjSEp2YldselpUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0IyWVhJZ2JtVmhjbVZ5Vm1Gc2RXVWdQU0J1WldGeVpYSW9jbVZ6YjJ4MlpXUlFjbTl0YVhObEtUdGNiaUFnSUNBZ0lDQWdhV1lnS0dselVISnZiV2x6WlNodVpXRnlaWEpXWVd4MVpTa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxjMjlzZG1Wa1VISnZiV2x6WlNBOUlHNWxZWEpsY2xaaGJIVmxPeUF2THlCemFHOXlkR1Z1SUdOb1lXbHVYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRzVsWVhKbGNsWmhiSFZsTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0J3Y205dGFYTmxMbWx1YzNCbFkzUWdQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doY21WemIyeDJaV1JRY205dGFYTmxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2V5QnpkR0YwWlRvZ1hDSndaVzVrYVc1blhDSWdmVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnY21WemIyeDJaV1JRY205dGFYTmxMbWx1YzNCbFkzUW9LVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdhV1lnS0ZFdWJHOXVaMU4wWVdOclUzVndjRzl5ZENBbUppQm9ZWE5UZEdGamEzTXBJSHRjYmlBZ0lDQWdJQ0FnZEhKNUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWdwTzF4dUlDQWdJQ0FnSUNCOUlHTmhkR05vSUNobEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5Qk9UMVJGT2lCa2IyNG5kQ0IwY25rZ2RHOGdkWE5sSUdCRmNuSnZjaTVqWVhCMGRYSmxVM1JoWTJ0VWNtRmpaV0FnYjNJZ2RISmhibk5tWlhJZ2RHaGxYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QmhZMk5sYzNOdmNpQmhjbTkxYm1RN0lIUm9ZWFFnWTJGMWMyVnpJRzFsYlc5eWVTQnNaV0ZyY3lCaGN5QndaWElnUjBndE1URXhMaUJLZFhOMFhHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCeVpXbG1lU0IwYUdVZ2MzUmhZMnNnZEhKaFkyVWdZWE1nWVNCemRISnBibWNnUVZOQlVDNWNiaUFnSUNBZ0lDQWdJQ0FnSUM4dlhHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCQmRDQjBhR1VnYzJGdFpTQjBhVzFsTENCamRYUWdiMlptSUhSb1pTQm1hWEp6ZENCc2FXNWxPeUJwZENkeklHRnNkMkY1Y3lCcWRYTjBYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QmNJbHR2WW1wbFkzUWdVSEp2YldselpWMWNYRzVjSWl3Z1lYTWdjR1Z5SUhSb1pTQmdkRzlUZEhKcGJtZGdMbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NISnZiV2x6WlM1emRHRmpheUE5SUdVdWMzUmhZMnN1YzNWaWMzUnlhVzVuS0dVdWMzUmhZMnN1YVc1a1pYaFBaaWhjSWx4Y2Jsd2lLU0FySURFcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0x5OGdUazlVUlRvZ2QyVWdaRzhnZEdobElHTm9aV05yY3lCbWIzSWdZSEpsYzI5c2RtVmtVSEp2YldselpXQWdhVzRnWldGamFDQnRaWFJvYjJRc0lHbHVjM1JsWVdRZ2IyWmNiaUFnSUNBdkx5QmpiMjV6YjJ4cFpHRjBhVzVuSUhSb1pXMGdhVzUwYnlCZ1ltVmpiMjFsWUN3Z2MybHVZMlVnYjNSb1pYSjNhWE5sSUhkbEoyUWdZM0psWVhSbElHNWxkMXh1SUNBZ0lDOHZJSEJ5YjIxcGMyVnpJSGRwZEdnZ2RHaGxJR3hwYm1WeklHQmlaV052YldVb2QyaGhkR1YyWlhJb2RtRnNkV1VwS1dBdUlGTmxaU0JsTG1jdUlFZElMVEkxTWk1Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUdKbFkyOXRaU2h1WlhkUWNtOXRhWE5sS1NCN1hHNGdJQ0FnSUNBZ0lISmxjMjlzZG1Wa1VISnZiV2x6WlNBOUlHNWxkMUJ5YjIxcGMyVTdYRzRnSUNBZ0lDQWdJSEJ5YjIxcGMyVXVjMjkxY21ObElEMGdibVYzVUhKdmJXbHpaVHRjYmx4dUlDQWdJQ0FnSUNCaGNuSmhlVjl5WldSMVkyVW9iV1Z6YzJGblpYTXNJR1oxYm1OMGFXOXVJQ2gxYm1SbFptbHVaV1FzSUcxbGMzTmhaMlVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJRkV1Ym1WNGRGUnBZMnNvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHNWxkMUJ5YjIxcGMyVXVjSEp2YldselpVUnBjM0JoZEdOb0xtRndjR3g1S0c1bGQxQnliMjFwYzJVc0lHMWxjM05oWjJVcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lIMHNJSFp2YVdRZ01DazdYRzVjYmlBZ0lDQWdJQ0FnYldWemMyRm5aWE1nUFNCMmIybGtJREE3WEc0Z0lDQWdJQ0FnSUhCeWIyZHlaWE56VEdsemRHVnVaWEp6SUQwZ2RtOXBaQ0F3TzF4dUlDQWdJSDFjYmx4dUlDQWdJR1JsWm1WeWNtVmtMbkJ5YjIxcGMyVWdQU0J3Y205dGFYTmxPMXh1SUNBZ0lHUmxabVZ5Y21Wa0xuSmxjMjlzZG1VZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVcElIdGNiaUFnSUNBZ0lDQWdhV1lnS0hKbGMyOXNkbVZrVUhKdmJXbHpaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdU8xeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnWW1WamIyMWxLRkVvZG1Gc2RXVXBLVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdaR1ZtWlhKeVpXUXVablZzWm1sc2JDQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTa2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb2NtVnpiMngyWldSUWNtOXRhWE5sS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCaVpXTnZiV1VvWm5Wc1ptbHNiQ2gyWVd4MVpTa3BPMXh1SUNBZ0lIMDdYRzRnSUNBZ1pHVm1aWEp5WldRdWNtVnFaV04wSUQwZ1puVnVZM1JwYjI0Z0tISmxZWE52YmlrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvY21WemIyeDJaV1JRY205dGFYTmxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0JpWldOdmJXVW9jbVZxWldOMEtISmxZWE52YmlrcE8xeHVJQ0FnSUgwN1hHNGdJQ0FnWkdWbVpYSnlaV1F1Ym05MGFXWjVJRDBnWm5WdVkzUnBiMjRnS0hCeWIyZHlaWE56S1NCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2h5WlhOdmJIWmxaRkJ5YjIxcGMyVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5Ymp0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJR0Z5Y21GNVgzSmxaSFZqWlNod2NtOW5jbVZ6YzB4cGMzUmxibVZ5Y3l3Z1puVnVZM1JwYjI0Z0tIVnVaR1ZtYVc1bFpDd2djSEp2WjNKbGMzTk1hWE4wWlc1bGNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1VTNXVaWGgwVkdsamF5aG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0hKdlozSmxjM05NYVhOMFpXNWxjaWh3Y205bmNtVnpjeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlN3Z2RtOXBaQ0F3S1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnY21WMGRYSnVJR1JsWm1WeWNtVmtPMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFTnlaV0YwWlhNZ1lTQk9iMlJsTFhOMGVXeGxJR05oYkd4aVlXTnJJSFJvWVhRZ2QybHNiQ0J5WlhOdmJIWmxJRzl5SUhKbGFtVmpkQ0IwYUdVZ1pHVm1aWEp5WldSY2JpQXFJSEJ5YjIxcGMyVXVYRzRnS2lCQWNtVjBkWEp1Y3lCaElHNXZaR1ZpWVdOclhHNGdLaTljYm1SbFptVnlMbkJ5YjNSdmRIbHdaUzV0WVd0bFRtOWtaVkpsYzI5c2RtVnlJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUhaaGNpQnpaV3htSUQwZ2RHaHBjenRjYmlBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z0tHVnljbTl5TENCMllXeDFaU2tnZTF4dUlDQWdJQ0FnSUNCcFppQW9aWEp5YjNJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhObGJHWXVjbVZxWldOMEtHVnljbTl5S1R0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaGhjbWQxYldWdWRITXViR1Z1WjNSb0lENGdNaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjMlZzWmk1eVpYTnZiSFpsS0dGeWNtRjVYM05zYVdObEtHRnlaM1Z0Wlc1MGN5d2dNU2twTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjMlZzWmk1eVpYTnZiSFpsS0haaGJIVmxLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDA3WEc1OU8xeHVYRzR2S2lwY2JpQXFJRUJ3WVhKaGJTQnlaWE52YkhabGNpQjdSblZ1WTNScGIyNTlJR0VnWm5WdVkzUnBiMjRnZEdoaGRDQnlaWFIxY201eklHNXZkR2hwYm1jZ1lXNWtJR0ZqWTJWd2RITmNiaUFxSUhSb1pTQnlaWE52YkhabExDQnlaV3BsWTNRc0lHRnVaQ0J1YjNScFpua2dablZ1WTNScGIyNXpJR1p2Y2lCaElHUmxabVZ5Y21Wa0xseHVJQ29nUUhKbGRIVnlibk1nWVNCd2NtOXRhWE5sSUhSb1lYUWdiV0Y1SUdKbElISmxjMjlzZG1Wa0lIZHBkR2dnZEdobElHZHBkbVZ1SUhKbGMyOXNkbVVnWVc1a0lISmxhbVZqZEZ4dUlDb2dablZ1WTNScGIyNXpMQ0J2Y2lCeVpXcGxZM1JsWkNCaWVTQmhJSFJvY205M2JpQmxlR05sY0hScGIyNGdhVzRnY21WemIyeDJaWEpjYmlBcUwxeHVVUzVRY205dGFYTmxJRDBnY0hKdmJXbHpaVHNnTHk4Z1JWTTJYRzVSTG5CeWIyMXBjMlVnUFNCd2NtOXRhWE5sTzF4dVpuVnVZM1JwYjI0Z2NISnZiV2x6WlNoeVpYTnZiSFpsY2lrZ2UxeHVJQ0FnSUdsbUlDaDBlWEJsYjJZZ2NtVnpiMngyWlhJZ0lUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVJQ0FnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dWSGx3WlVWeWNtOXlLRndpY21WemIyeDJaWElnYlhWemRDQmlaU0JoSUdaMWJtTjBhVzl1TGx3aUtUdGNiaUFnSUNCOVhHNGdJQ0FnZG1GeUlHUmxabVZ5Y21Wa0lEMGdaR1ZtWlhJb0tUdGNiaUFnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0J5WlhOdmJIWmxjaWhrWldabGNuSmxaQzV5WlhOdmJIWmxMQ0JrWldabGNuSmxaQzV5WldwbFkzUXNJR1JsWm1WeWNtVmtMbTV2ZEdsbWVTazdYRzRnSUNBZ2ZTQmpZWFJqYUNBb2NtVmhjMjl1S1NCN1hHNGdJQ0FnSUNBZ0lHUmxabVZ5Y21Wa0xuSmxhbVZqZENoeVpXRnpiMjRwTzF4dUlDQWdJSDFjYmlBZ0lDQnlaWFIxY200Z1pHVm1aWEp5WldRdWNISnZiV2x6WlR0Y2JuMWNibHh1Y0hKdmJXbHpaUzV5WVdObElEMGdjbUZqWlRzZ0x5OGdSVk0yWEc1d2NtOXRhWE5sTG1Gc2JDQTlJR0ZzYkRzZ0x5OGdSVk0yWEc1d2NtOXRhWE5sTG5KbGFtVmpkQ0E5SUhKbGFtVmpkRHNnTHk4Z1JWTTJYRzV3Y205dGFYTmxMbkpsYzI5c2RtVWdQU0JST3lBdkx5QkZVelpjYmx4dUx5OGdXRmhZSUdWNGNHVnlhVzFsYm5SaGJDNGdJRlJvYVhNZ2JXVjBhRzlrSUdseklHRWdkMkY1SUhSdklHUmxibTkwWlNCMGFHRjBJR0VnYkc5allXd2dkbUZzZFdVZ2FYTmNiaTh2SUhObGNtbGhiR2w2WVdKc1pTQmhibVFnYzJodmRXeGtJR0psSUdsdGJXVmthV0YwWld4NUlHUnBjM0JoZEdOb1pXUWdkRzhnWVNCeVpXMXZkR1VnZFhCdmJpQnlaWEYxWlhOMExGeHVMeThnYVc1emRHVmhaQ0J2WmlCd1lYTnphVzVuSUdFZ2NtVm1aWEpsYm1ObExseHVVUzV3WVhOelFubERiM0I1SUQwZ1puVnVZM1JwYjI0Z0tHOWlhbVZqZENrZ2UxeHVJQ0FnSUM4dlpuSmxaWHBsS0c5aWFtVmpkQ2s3WEc0Z0lDQWdMeTl3WVhOelFubERiM0JwWlhNdWMyVjBLRzlpYW1WamRDd2dkSEoxWlNrN1hHNGdJQ0FnY21WMGRYSnVJRzlpYW1WamREdGNibjA3WEc1Y2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExuQmhjM05DZVVOdmNIa2dQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnTHk5bWNtVmxlbVVvYjJKcVpXTjBLVHRjYmlBZ0lDQXZMM0JoYzNOQ2VVTnZjR2xsY3k1elpYUW9iMkpxWldOMExDQjBjblZsS1R0Y2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3p0Y2JuMDdYRzVjYmk4cUtseHVJQ29nU1dZZ2RIZHZJSEJ5YjIxcGMyVnpJR1YyWlc1MGRXRnNiSGtnWm5Wc1ptbHNiQ0IwYnlCMGFHVWdjMkZ0WlNCMllXeDFaU3dnY0hKdmJXbHpaWE1nZEdoaGRDQjJZV3gxWlN4Y2JpQXFJR0oxZENCdmRHaGxjbmRwYzJVZ2NtVnFaV04wY3k1Y2JpQXFJRUJ3WVhKaGJTQjRJSHRCYm5rcWZWeHVJQ29nUUhCaGNtRnRJSGtnZTBGdWVTcDlYRzRnS2lCQWNtVjBkWEp1Y3lCN1FXNTVLbjBnWVNCd2NtOXRhWE5sSUdadmNpQjRJR0Z1WkNCNUlHbG1JSFJvWlhrZ1lYSmxJSFJvWlNCellXMWxMQ0JpZFhRZ1lTQnlaV3BsWTNScGIyNWNiaUFxSUc5MGFHVnlkMmx6WlM1Y2JpQXFYRzRnS2k5Y2JsRXVhbTlwYmlBOUlHWjFibU4wYVc5dUlDaDRMQ0I1S1NCN1hHNGdJQ0FnY21WMGRYSnVJRkVvZUNrdWFtOXBiaWg1S1R0Y2JuMDdYRzVjYmxCeWIyMXBjMlV1Y0hKdmRHOTBlWEJsTG1wdmFXNGdQU0JtZFc1amRHbHZiaUFvZEdoaGRDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCUktGdDBhR2x6TENCMGFHRjBYU2t1YzNCeVpXRmtLR1oxYm1OMGFXOXVJQ2g0TENCNUtTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoNElEMDlQU0I1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCVVQwUlBPaUJjSWowOVBWd2lJSE5vYjNWc1pDQmlaU0JQWW1wbFkzUXVhWE1nYjNJZ1pYRjFhWFpjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCNE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLRndpUTJGdUozUWdhbTlwYmpvZ2JtOTBJSFJvWlNCellXMWxPaUJjSWlBcklIZ2dLeUJjSWlCY0lpQXJJSGtwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlNrN1hHNTlPMXh1WEc0dktpcGNiaUFxSUZKbGRIVnlibk1nWVNCd2NtOXRhWE5sSUdadmNpQjBhR1VnWm1seWMzUWdiMllnWVc0Z1lYSnlZWGtnYjJZZ2NISnZiV2x6WlhNZ2RHOGdZbVZqYjIxbElITmxkSFJzWldRdVhHNGdLaUJBY0dGeVlXMGdZVzV6ZDJWeWN5QjdRWEp5WVhsYlFXNTVLbDE5SUhCeWIyMXBjMlZ6SUhSdklISmhZMlZjYmlBcUlFQnlaWFIxY201eklIdEJibmtxZlNCMGFHVWdabWx5YzNRZ2NISnZiV2x6WlNCMGJ5QmlaU0J6WlhSMGJHVmtYRzRnS2k5Y2JsRXVjbUZqWlNBOUlISmhZMlU3WEc1bWRXNWpkR2x2YmlCeVlXTmxLR0Z1YzNkbGNsQnpLU0I3WEc0Z0lDQWdjbVYwZFhKdUlIQnliMjFwYzJVb1puVnVZM1JwYjI0Z0tISmxjMjlzZG1Vc0lISmxhbVZqZENrZ2UxeHVJQ0FnSUNBZ0lDQXZMeUJUZDJsMFkyZ2dkRzhnZEdocGN5QnZibU5sSUhkbElHTmhiaUJoYzNOMWJXVWdZWFFnYkdWaGMzUWdSVk0xWEc0Z0lDQWdJQ0FnSUM4dklHRnVjM2RsY2xCekxtWnZja1ZoWTJnb1puVnVZM1JwYjI0Z0tHRnVjM2RsY2xBcElIdGNiaUFnSUNBZ0lDQWdMeThnSUNBZ0lGRW9ZVzV6ZDJWeVVDa3VkR2hsYmloeVpYTnZiSFpsTENCeVpXcGxZM1FwTzF4dUlDQWdJQ0FnSUNBdkx5QjlLVHRjYmlBZ0lDQWdJQ0FnTHk4Z1ZYTmxJSFJvYVhNZ2FXNGdkR2hsSUcxbFlXNTBhVzFsWEc0Z0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdMQ0JzWlc0Z1BTQmhibk4zWlhKUWN5NXNaVzVuZEdnN0lHa2dQQ0JzWlc0N0lHa3JLeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdVU2hoYm5OM1pYSlFjMXRwWFNrdWRHaGxiaWh5WlhOdmJIWmxMQ0J5WldwbFkzUXBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmU2s3WEc1OVhHNWNibEJ5YjIxcGMyVXVjSEp2ZEc5MGVYQmxMbkpoWTJVZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdjbVYwZFhKdUlIUm9hWE11ZEdobGJpaFJMbkpoWTJVcE8xeHVmVHRjYmx4dUx5b3FYRzRnS2lCRGIyNXpkSEoxWTNSeklHRWdVSEp2YldselpTQjNhWFJvSUdFZ2NISnZiV2x6WlNCa1pYTmpjbWx3ZEc5eUlHOWlhbVZqZENCaGJtUWdiM0IwYVc5dVlXd2dabUZzYkdKaFkydGNiaUFxSUdaMWJtTjBhVzl1TGlBZ1ZHaGxJR1JsYzJOeWFYQjBiM0lnWTI5dWRHRnBibk1nYldWMGFHOWtjeUJzYVd0bElIZG9aVzRvY21WcVpXTjBaV1FwTENCblpYUW9ibUZ0WlNrc1hHNGdLaUJ6WlhRb2JtRnRaU3dnZG1Gc2RXVXBMQ0J3YjNOMEtHNWhiV1VzSUdGeVozTXBMQ0JoYm1RZ1pHVnNaWFJsS0c1aGJXVXBMQ0IzYUdsamFDQmhiR3hjYmlBcUlISmxkSFZ5YmlCbGFYUm9aWElnWVNCMllXeDFaU3dnWVNCd2NtOXRhWE5sSUdadmNpQmhJSFpoYkhWbExDQnZjaUJoSUhKbGFtVmpkR2x2Ymk0Z0lGUm9aU0JtWVd4c1ltRmphMXh1SUNvZ1lXTmpaWEIwY3lCMGFHVWdiM0JsY21GMGFXOXVJRzVoYldVc0lHRWdjbVZ6YjJ4MlpYSXNJR0Z1WkNCaGJua2dablZ5ZEdobGNpQmhjbWQxYldWdWRITWdkR2hoZENCM2IzVnNaRnh1SUNvZ2FHRjJaU0JpWldWdUlHWnZjbmRoY21SbFpDQjBieUIwYUdVZ1lYQndjbTl3Y21saGRHVWdiV1YwYUc5a0lHRmliM1psSUdoaFpDQmhJRzFsZEdodlpDQmlaV1Z1WEc0Z0tpQndjbTkyYVdSbFpDQjNhWFJvSUhSb1pTQndjbTl3WlhJZ2JtRnRaUzRnSUZSb1pTQkJVRWtnYldGclpYTWdibThnWjNWaGNtRnVkR1ZsY3lCaFltOTFkQ0IwYUdVZ2JtRjBkWEpsWEc0Z0tpQnZaaUIwYUdVZ2NtVjBkWEp1WldRZ2IySnFaV04wTENCaGNHRnlkQ0JtY205dElIUm9ZWFFnYVhRZ2FYTWdkWE5oWW14bElIZG9aWEpsWlhabGNpQndjbTl0YVhObGN5QmhjbVZjYmlBcUlHSnZkV2RvZENCaGJtUWdjMjlzWkM1Y2JpQXFMMXh1VVM1dFlXdGxVSEp2YldselpTQTlJRkJ5YjIxcGMyVTdYRzVtZFc1amRHbHZiaUJRY205dGFYTmxLR1JsYzJOeWFYQjBiM0lzSUdaaGJHeGlZV05yTENCcGJuTndaV04wS1NCN1hHNGdJQ0FnYVdZZ0tHWmhiR3hpWVdOcklEMDlQU0IyYjJsa0lEQXBJSHRjYmlBZ0lDQWdJQ0FnWm1Gc2JHSmhZMnNnUFNCbWRXNWpkR2x2YmlBb2IzQXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCeVpXcGxZM1FvYm1WM0lFVnljbTl5S0Z4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUZ3aVVISnZiV2x6WlNCa2IyVnpJRzV2ZENCemRYQndiM0owSUc5d1pYSmhkR2x2YmpvZ1hDSWdLeUJ2Y0Z4dUlDQWdJQ0FnSUNBZ0lDQWdLU2s3WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnZlZ4dUlDQWdJR2xtSUNocGJuTndaV04wSUQwOVBTQjJiMmxrSURBcElIdGNiaUFnSUNBZ0lDQWdhVzV6Y0dWamRDQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQjdjM1JoZEdVNklGd2lkVzVyYm05M2Jsd2lmVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0IyWVhJZ2NISnZiV2x6WlNBOUlHOWlhbVZqZEY5amNtVmhkR1VvVUhKdmJXbHpaUzV3Y205MGIzUjVjR1VwTzF4dVhHNGdJQ0FnY0hKdmJXbHpaUzV3Y205dGFYTmxSR2x6Y0dGMFkyZ2dQU0JtZFc1amRHbHZiaUFvY21WemIyeDJaU3dnYjNBc0lHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2REdGNiaUFnSUNBZ0lDQWdkSEo1SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoa1pYTmpjbWx3ZEc5eVcyOXdYU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGMzVnNkQ0E5SUdSbGMyTnlhWEIwYjNKYmIzQmRMbUZ3Y0d4NUtIQnliMjFwYzJVc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhRZ1BTQm1ZV3hzWW1GamF5NWpZV3hzS0hCeWIyMXBjMlVzSUc5d0xDQmhjbWR6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlNCallYUmphQ0FvWlhoalpYQjBhVzl1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUWdQU0J5WldwbFkzUW9aWGhqWlhCMGFXOXVLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9jbVZ6YjJ4MlpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVnpiMngyWlNoeVpYTjFiSFFwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlR0Y2JseHVJQ0FnSUhCeWIyMXBjMlV1YVc1emNHVmpkQ0E5SUdsdWMzQmxZM1E3WEc1Y2JpQWdJQ0F2THlCWVdGZ2daR1Z3Y21WallYUmxaQ0JnZG1Gc2RXVlBabUFnWVc1a0lHQmxlR05sY0hScGIyNWdJSE4xY0hCdmNuUmNiaUFnSUNCcFppQW9hVzV6Y0dWamRDa2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2FXNXpjR1ZqZEdWa0lEMGdhVzV6Y0dWamRDZ3BPMXh1SUNBZ0lDQWdJQ0JwWmlBb2FXNXpjR1ZqZEdWa0xuTjBZWFJsSUQwOVBTQmNJbkpsYW1WamRHVmtYQ0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEJ5YjIxcGMyVXVaWGhqWlhCMGFXOXVJRDBnYVc1emNHVmpkR1ZrTG5KbFlYTnZianRjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lIQnliMjFwYzJVdWRtRnNkV1ZQWmlBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJwYm5Od1pXTjBaV1FnUFNCcGJuTndaV04wS0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2FXNXpjR1ZqZEdWa0xuTjBZWFJsSUQwOVBTQmNJbkJsYm1ScGJtZGNJaUI4ZkZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsdWMzQmxZM1JsWkM1emRHRjBaU0E5UFQwZ1hDSnlaV3BsWTNSbFpGd2lLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEJ5YjIxcGMyVTdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdhVzV6Y0dWamRHVmtMblpoYkhWbE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lISmxkSFZ5YmlCd2NtOXRhWE5sTzF4dWZWeHVYRzVRY205dGFYTmxMbkJ5YjNSdmRIbHdaUzUwYjFOMGNtbHVaeUE5SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNCeVpYUjFjbTRnWENKYmIySnFaV04wSUZCeWIyMXBjMlZkWENJN1hHNTlPMXh1WEc1UWNtOXRhWE5sTG5CeWIzUnZkSGx3WlM1MGFHVnVJRDBnWm5WdVkzUnBiMjRnS0daMWJHWnBiR3hsWkN3Z2NtVnFaV04wWldRc0lIQnliMmR5WlhOelpXUXBJSHRjYmlBZ0lDQjJZWElnYzJWc1ppQTlJSFJvYVhNN1hHNGdJQ0FnZG1GeUlHUmxabVZ5Y21Wa0lEMGdaR1ZtWlhJb0tUdGNiaUFnSUNCMllYSWdaRzl1WlNBOUlHWmhiSE5sT3lBZ0lDOHZJR1Z1YzNWeVpTQjBhR1VnZFc1MGNuVnpkR1ZrSUhCeWIyMXBjMlVnYldGclpYTWdZWFFnYlc5emRDQmhYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXZMeUJ6YVc1bmJHVWdZMkZzYkNCMGJ5QnZibVVnYjJZZ2RHaGxJR05oYkd4aVlXTnJjMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMloxYkdacGJHeGxaQ2gyWVd4MVpTa2dlMXh1SUNBZ0lDQWdJQ0IwY25rZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSFI1Y0dWdlppQm1kV3htYVd4c1pXUWdQVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpQS9JR1oxYkdacGJHeGxaQ2gyWVd4MVpTa2dPaUIyWVd4MVpUdGNiaUFnSUNBZ0lDQWdmU0JqWVhSamFDQW9aWGhqWlhCMGFXOXVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2NtVnFaV04wS0dWNFkyVndkR2x2YmlrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZmNtVnFaV04wWldRb1pYaGpaWEIwYVc5dUtTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoMGVYQmxiMllnY21WcVpXTjBaV1FnUFQwOUlGd2lablZ1WTNScGIyNWNJaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdiV0ZyWlZOMFlXTnJWSEpoWTJWTWIyNW5LR1Y0WTJWd2RHbHZiaXdnYzJWc1ppazdYRzRnSUNBZ0lDQWdJQ0FnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQnlaV3BsWTNSbFpDaGxlR05sY0hScGIyNHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmpZWFJqYUNBb2JtVjNSWGhqWlhCMGFXOXVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEpsYW1WamRDaHVaWGRGZUdObGNIUnBiMjRwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ5WldwbFkzUW9aWGhqWlhCMGFXOXVLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZjSEp2WjNKbGMzTmxaQ2gyWVd4MVpTa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkSGx3Wlc5bUlIQnliMmR5WlhOelpXUWdQVDA5SUZ3aVpuVnVZM1JwYjI1Y0lpQS9JSEJ5YjJkeVpYTnpaV1FvZG1Gc2RXVXBJRG9nZG1Gc2RXVTdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1VTNXVaWGgwVkdsamF5aG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUhObGJHWXVjSEp2YldselpVUnBjM0JoZEdOb0tHWjFibU4wYVc5dUlDaDJZV3gxWlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHUnZibVVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTQ3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCa2IyNWxJRDBnZEhKMVpUdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVm1aWEp5WldRdWNtVnpiMngyWlNoZlpuVnNabWxzYkdWa0tIWmhiSFZsS1NrN1hHNGdJQ0FnSUNBZ0lIMHNJRndpZDJobGJsd2lMQ0JiWm5WdVkzUnBiMjRnS0dWNFkyVndkR2x2YmlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHUnZibVVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTQ3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCa2IyNWxJRDBnZEhKMVpUdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVm1aWEp5WldRdWNtVnpiMngyWlNoZmNtVnFaV04wWldRb1pYaGpaWEIwYVc5dUtTazdYRzRnSUNBZ0lDQWdJSDFkS1R0Y2JpQWdJQ0I5S1R0Y2JseHVJQ0FnSUM4dklGQnliMmR5WlhOeklIQnliM0JoWjJGMGIzSWdibVZsWkNCMGJ5QmlaU0JoZEhSaFkyaGxaQ0JwYmlCMGFHVWdZM1Z5Y21WdWRDQjBhV05yTGx4dUlDQWdJSE5sYkdZdWNISnZiV2x6WlVScGMzQmhkR05vS0hadmFXUWdNQ3dnWENKM2FHVnVYQ0lzSUZ0MmIybGtJREFzSUdaMWJtTjBhVzl1SUNoMllXeDFaU2tnZTF4dUlDQWdJQ0FnSUNCMllYSWdibVYzVm1Gc2RXVTdYRzRnSUNBZ0lDQWdJSFpoY2lCMGFISmxkeUE5SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0IwY25rZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1ZtRnNkV1VnUFNCZmNISnZaM0psYzNObFpDaDJZV3gxWlNrN1hHNGdJQ0FnSUNBZ0lIMGdZMkYwWTJnZ0tHVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9jbVYzSUQwZ2RISjFaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hSTG05dVpYSnliM0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCUkxtOXVaWEp5YjNJb1pTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJR1U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCcFppQW9JWFJvY21WM0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCa1pXWmxjbkpsWkM1dWIzUnBabmtvYm1WM1ZtRnNkV1VwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlYwcE8xeHVYRzRnSUNBZ2NtVjBkWEp1SUdSbFptVnljbVZrTG5CeWIyMXBjMlU3WEc1OU8xeHVYRzVSTG5SaGNDQTlJR1oxYm1OMGFXOXVJQ2h3Y205dGFYTmxMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJSEpsZEhWeWJpQlJLSEJ5YjIxcGMyVXBMblJoY0NoallXeHNZbUZqYXlrN1hHNTlPMXh1WEc0dktpcGNiaUFxSUZkdmNtdHpJR0ZzYlc5emRDQnNhV3RsSUZ3aVptbHVZV3hzZVZ3aUxDQmlkWFFnYm05MElHTmhiR3hsWkNCbWIzSWdjbVZxWldOMGFXOXVjeTVjYmlBcUlFOXlhV2RwYm1Gc0lISmxjMjlzZFhScGIyNGdkbUZzZFdVZ2FYTWdjR0Z6YzJWa0lIUm9jbTkxWjJnZ1kyRnNiR0poWTJzZ2RXNWhabVpsWTNSbFpDNWNiaUFxSUVOaGJHeGlZV05ySUcxaGVTQnlaWFIxY200Z1lTQndjbTl0YVhObElIUm9ZWFFnZDJsc2JDQmlaU0JoZDJGcGRHVmtJR1p2Y2k1Y2JpQXFJRUJ3WVhKaGJTQjdSblZ1WTNScGIyNTlJR05oYkd4aVlXTnJYRzRnS2lCQWNtVjBkWEp1Y3lCN1VTNVFjbTl0YVhObGZWeHVJQ29nUUdWNFlXMXdiR1ZjYmlBcUlHUnZVMjl0WlhSb2FXNW5LQ2xjYmlBcUlDQWdMblJvWlc0b0xpNHVLVnh1SUNvZ0lDQXVkR0Z3S0dOdmJuTnZiR1V1Ykc5bktWeHVJQ29nSUNBdWRHaGxiaWd1TGk0cE8xeHVJQ292WEc1UWNtOXRhWE5sTG5CeWIzUnZkSGx3WlM1MFlYQWdQU0JtZFc1amRHbHZiaUFvWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0JqWVd4c1ltRmpheUE5SUZFb1kyRnNiR0poWTJzcE8xeHVYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVkR2hsYmlobWRXNWpkR2x2YmlBb2RtRnNkV1VwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yTG1aallXeHNLSFpoYkhWbEtTNTBhR1Z1VW1WemIyeDJaU2gyWVd4MVpTazdYRzRnSUNBZ2ZTazdYRzU5TzF4dVhHNHZLaXBjYmlBcUlGSmxaMmx6ZEdWeWN5QmhiaUJ2WW5ObGNuWmxjaUJ2YmlCaElIQnliMjFwYzJVdVhHNGdLbHh1SUNvZ1IzVmhjbUZ1ZEdWbGN6cGNiaUFxWEc0Z0tpQXhMaUIwYUdGMElHWjFiR1pwYkd4bFpDQmhibVFnY21WcVpXTjBaV1FnZDJsc2JDQmlaU0JqWVd4c1pXUWdiMjVzZVNCdmJtTmxMbHh1SUNvZ01pNGdkR2hoZENCbGFYUm9aWElnZEdobElHWjFiR1pwYkd4bFpDQmpZV3hzWW1GamF5QnZjaUIwYUdVZ2NtVnFaV04wWldRZ1kyRnNiR0poWTJzZ2QybHNiQ0JpWlZ4dUlDb2dJQ0FnWTJGc2JHVmtMQ0JpZFhRZ2JtOTBJR0p2ZEdndVhHNGdLaUF6TGlCMGFHRjBJR1oxYkdacGJHeGxaQ0JoYm1RZ2NtVnFaV04wWldRZ2QybHNiQ0J1YjNRZ1ltVWdZMkZzYkdWa0lHbHVJSFJvYVhNZ2RIVnliaTVjYmlBcVhHNGdLaUJBY0dGeVlXMGdkbUZzZFdVZ0lDQWdJQ0J3Y205dGFYTmxJRzl5SUdsdGJXVmthV0YwWlNCeVpXWmxjbVZ1WTJVZ2RHOGdiMkp6WlhKMlpWeHVJQ29nUUhCaGNtRnRJR1oxYkdacGJHeGxaQ0FnWm5WdVkzUnBiMjRnZEc4Z1ltVWdZMkZzYkdWa0lIZHBkR2dnZEdobElHWjFiR1pwYkd4bFpDQjJZV3gxWlZ4dUlDb2dRSEJoY21GdElISmxhbVZqZEdWa0lDQWdablZ1WTNScGIyNGdkRzhnWW1VZ1kyRnNiR1ZrSUhkcGRHZ2dkR2hsSUhKbGFtVmpkR2x2YmlCbGVHTmxjSFJwYjI1Y2JpQXFJRUJ3WVhKaGJTQndjbTluY21WemMyVmtJR1oxYm1OMGFXOXVJSFJ2SUdKbElHTmhiR3hsWkNCdmJpQmhibmtnY0hKdlozSmxjM01nYm05MGFXWnBZMkYwYVc5dWMxeHVJQ29nUUhKbGRIVnliaUJ3Y205dGFYTmxJR1p2Y2lCMGFHVWdjbVYwZFhKdUlIWmhiSFZsSUdaeWIyMGdkR2hsSUdsdWRtOXJaV1FnWTJGc2JHSmhZMnRjYmlBcUwxeHVVUzUzYUdWdUlEMGdkMmhsYmp0Y2JtWjFibU4wYVc5dUlIZG9aVzRvZG1Gc2RXVXNJR1oxYkdacGJHeGxaQ3dnY21WcVpXTjBaV1FzSUhCeWIyZHlaWE56WldRcElIdGNiaUFnSUNCeVpYUjFjbTRnVVNoMllXeDFaU2t1ZEdobGJpaG1kV3htYVd4c1pXUXNJSEpsYW1WamRHVmtMQ0J3Y205bmNtVnpjMlZrS1R0Y2JuMWNibHh1VUhKdmJXbHpaUzV3Y205MGIzUjVjR1V1ZEdobGJsSmxjMjlzZG1VZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVcElIdGNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NTBhR1Z1S0daMWJtTjBhVzl1SUNncElIc2djbVYwZFhKdUlIWmhiSFZsT3lCOUtUdGNibjA3WEc1Y2JsRXVkR2hsYmxKbGMyOXNkbVVnUFNCbWRXNWpkR2x2YmlBb2NISnZiV2x6WlN3Z2RtRnNkV1VwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdVU2h3Y205dGFYTmxLUzUwYUdWdVVtVnpiMngyWlNoMllXeDFaU2s3WEc1OU8xeHVYRzVRY205dGFYTmxMbkJ5YjNSdmRIbHdaUzUwYUdWdVVtVnFaV04wSUQwZ1puVnVZM1JwYjI0Z0tISmxZWE52YmlrZ2UxeHVJQ0FnSUhKbGRIVnliaUIwYUdsekxuUm9aVzRvWm5WdVkzUnBiMjRnS0NrZ2V5QjBhSEp2ZHlCeVpXRnpiMjQ3SUgwcE8xeHVmVHRjYmx4dVVTNTBhR1Z1VW1WcVpXTjBJRDBnWm5WdVkzUnBiMjRnS0hCeWIyMXBjMlVzSUhKbFlYTnZiaWtnZTF4dUlDQWdJSEpsZEhWeWJpQlJLSEJ5YjIxcGMyVXBMblJvWlc1U1pXcGxZM1FvY21WaGMyOXVLVHRjYm4wN1hHNWNiaThxS2x4dUlDb2dTV1lnWVc0Z2IySnFaV04wSUdseklHNXZkQ0JoSUhCeWIyMXBjMlVzSUdsMElHbHpJR0Z6SUZ3aWJtVmhjbHdpSUdGeklIQnZjM05wWW14bExseHVJQ29nU1dZZ1lTQndjbTl0YVhObElHbHpJSEpsYW1WamRHVmtMQ0JwZENCcGN5QmhjeUJjSW01bFlYSmNJaUJoY3lCd2IzTnphV0pzWlNCMGIyOHVYRzRnS2lCSlppQnBkT0tBbVhNZ1lTQm1kV3htYVd4c1pXUWdjSEp2YldselpTd2dkR2hsSUdaMWJHWnBiR3h0Wlc1MElIWmhiSFZsSUdseklHNWxZWEpsY2k1Y2JpQXFJRWxtSUdsMDRvQ1pjeUJoSUdSbFptVnljbVZrSUhCeWIyMXBjMlVnWVc1a0lIUm9aU0JrWldabGNuSmxaQ0JvWVhNZ1ltVmxiaUJ5WlhOdmJIWmxaQ3dnZEdobFhHNGdLaUJ5WlhOdmJIVjBhVzl1SUdseklGd2libVZoY21WeVhDSXVYRzRnS2lCQWNHRnlZVzBnYjJKcVpXTjBYRzRnS2lCQWNtVjBkWEp1Y3lCdGIzTjBJSEpsYzI5c2RtVmtJQ2h1WldGeVpYTjBLU0JtYjNKdElHOW1JSFJvWlNCdlltcGxZM1JjYmlBcUwxeHVYRzR2THlCWVdGZ2djMmh2ZFd4a0lIZGxJSEpsTFdSdklIUm9hWE0vWEc1UkxtNWxZWEpsY2lBOUlHNWxZWEpsY2p0Y2JtWjFibU4wYVc5dUlHNWxZWEpsY2loMllXeDFaU2tnZTF4dUlDQWdJR2xtSUNocGMxQnliMjFwYzJVb2RtRnNkV1VwS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJwYm5Od1pXTjBaV1FnUFNCMllXeDFaUzVwYm5Od1pXTjBLQ2s3WEc0Z0lDQWdJQ0FnSUdsbUlDaHBibk53WldOMFpXUXVjM1JoZEdVZ1BUMDlJRndpWm5Wc1ptbHNiR1ZrWENJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJwYm5Od1pXTjBaV1F1ZG1Gc2RXVTdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlYRzRnSUNBZ2NtVjBkWEp1SUhaaGJIVmxPMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFQnlaWFIxY201eklIZG9aWFJvWlhJZ2RHaGxJR2RwZG1WdUlHOWlhbVZqZENCcGN5QmhJSEJ5YjIxcGMyVXVYRzRnS2lCUGRHaGxjbmRwYzJVZ2FYUWdhWE1nWVNCbWRXeG1hV3hzWldRZ2RtRnNkV1V1WEc0Z0tpOWNibEV1YVhOUWNtOXRhWE5sSUQwZ2FYTlFjbTl0YVhObE8xeHVablZ1WTNScGIyNGdhWE5RY205dGFYTmxLRzlpYW1WamRDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCdlltcGxZM1FnYVc1emRHRnVZMlZ2WmlCUWNtOXRhWE5sTzF4dWZWeHVYRzVSTG1selVISnZiV2x6WlVGc2FXdGxJRDBnYVhOUWNtOXRhWE5sUVd4cGEyVTdYRzVtZFc1amRHbHZiaUJwYzFCeWIyMXBjMlZCYkdsclpTaHZZbXBsWTNRcElIdGNiaUFnSUNCeVpYUjFjbTRnYVhOUFltcGxZM1FvYjJKcVpXTjBLU0FtSmlCMGVYQmxiMllnYjJKcVpXTjBMblJvWlc0Z1BUMDlJRndpWm5WdVkzUnBiMjVjSWp0Y2JuMWNibHh1THlvcVhHNGdLaUJBY21WMGRYSnVjeUIzYUdWMGFHVnlJSFJvWlNCbmFYWmxiaUJ2WW1wbFkzUWdhWE1nWVNCd1pXNWthVzVuSUhCeWIyMXBjMlVzSUcxbFlXNXBibWNnYm05MFhHNGdLaUJtZFd4bWFXeHNaV1FnYjNJZ2NtVnFaV04wWldRdVhHNGdLaTljYmxFdWFYTlFaVzVrYVc1bklEMGdhWE5RWlc1a2FXNW5PMXh1Wm5WdVkzUnBiMjRnYVhOUVpXNWthVzVuS0c5aWFtVmpkQ2tnZTF4dUlDQWdJSEpsZEhWeWJpQnBjMUJ5YjIxcGMyVW9iMkpxWldOMEtTQW1KaUJ2WW1wbFkzUXVhVzV6Y0dWamRDZ3BMbk4wWVhSbElEMDlQU0JjSW5CbGJtUnBibWRjSWp0Y2JuMWNibHh1VUhKdmJXbHpaUzV3Y205MGIzUjVjR1V1YVhOUVpXNWthVzVuSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbWx1YzNCbFkzUW9LUzV6ZEdGMFpTQTlQVDBnWENKd1pXNWthVzVuWENJN1hHNTlPMXh1WEc0dktpcGNiaUFxSUVCeVpYUjFjbTV6SUhkb1pYUm9aWElnZEdobElHZHBkbVZ1SUc5aWFtVmpkQ0JwY3lCaElIWmhiSFZsSUc5eUlHWjFiR1pwYkd4bFpGeHVJQ29nY0hKdmJXbHpaUzVjYmlBcUwxeHVVUzVwYzBaMWJHWnBiR3hsWkNBOUlHbHpSblZzWm1sc2JHVmtPMXh1Wm5WdVkzUnBiMjRnYVhOR2RXeG1hV3hzWldRb2IySnFaV04wS1NCN1hHNGdJQ0FnY21WMGRYSnVJQ0ZwYzFCeWIyMXBjMlVvYjJKcVpXTjBLU0I4ZkNCdlltcGxZM1F1YVc1emNHVmpkQ2dwTG5OMFlYUmxJRDA5UFNCY0ltWjFiR1pwYkd4bFpGd2lPMXh1ZlZ4dVhHNVFjbTl0YVhObExuQnliM1J2ZEhsd1pTNXBjMFoxYkdacGJHeGxaQ0E5SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NXBibk53WldOMEtDa3VjM1JoZEdVZ1BUMDlJRndpWm5Wc1ptbHNiR1ZrWENJN1hHNTlPMXh1WEc0dktpcGNiaUFxSUVCeVpYUjFjbTV6SUhkb1pYUm9aWElnZEdobElHZHBkbVZ1SUc5aWFtVmpkQ0JwY3lCaElISmxhbVZqZEdWa0lIQnliMjFwYzJVdVhHNGdLaTljYmxFdWFYTlNaV3BsWTNSbFpDQTlJR2x6VW1WcVpXTjBaV1E3WEc1bWRXNWpkR2x2YmlCcGMxSmxhbVZqZEdWa0tHOWlhbVZqZENrZ2UxeHVJQ0FnSUhKbGRIVnliaUJwYzFCeWIyMXBjMlVvYjJKcVpXTjBLU0FtSmlCdlltcGxZM1F1YVc1emNHVmpkQ2dwTG5OMFlYUmxJRDA5UFNCY0luSmxhbVZqZEdWa1hDSTdYRzU5WEc1Y2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExtbHpVbVZxWldOMFpXUWdQU0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnY21WMGRYSnVJSFJvYVhNdWFXNXpjR1ZqZENncExuTjBZWFJsSUQwOVBTQmNJbkpsYW1WamRHVmtYQ0k3WEc1OU8xeHVYRzR2THk4dklFSkZSMGxPSUZWT1NFRk9SRXhGUkNCU1JVcEZRMVJKVDA0Z1ZGSkJRMHRKVGtkY2JseHVMeThnVkdocGN5QndjbTl0YVhObElHeHBZbkpoY25rZ1kyOXVjM1Z0WlhNZ1pYaGpaWEIwYVc5dWN5QjBhSEp2ZDI0Z2FXNGdhR0Z1Wkd4bGNuTWdjMjhnZEdobGVTQmpZVzRnWW1WY2JpOHZJR2hoYm1Sc1pXUWdZbmtnWVNCemRXSnpaWEYxWlc1MElIQnliMjFwYzJVdUlDQlVhR1VnWlhoalpYQjBhVzl1Y3lCblpYUWdZV1JrWldRZ2RHOGdkR2hwY3lCaGNuSmhlU0IzYUdWdVhHNHZMeUIwYUdWNUlHRnlaU0JqY21WaGRHVmtMQ0JoYm1RZ2NtVnRiM1psWkNCM2FHVnVJSFJvWlhrZ1lYSmxJR2hoYm1Sc1pXUXVJQ0JPYjNSbElIUm9ZWFFnYVc0Z1JWTTJJRzl5WEc0dkx5QnphR2x0YldWa0lHVnVkbWx5YjI1dFpXNTBjeXdnZEdocGN5QjNiM1ZzWkNCdVlYUjFjbUZzYkhrZ1ltVWdZU0JnVTJWMFlDNWNiblpoY2lCMWJtaGhibVJzWldSU1pXRnpiMjV6SUQwZ1cxMDdYRzUyWVhJZ2RXNW9ZVzVrYkdWa1VtVnFaV04wYVc5dWN5QTlJRnRkTzF4dWRtRnlJSEpsY0c5eWRHVmtWVzVvWVc1a2JHVmtVbVZxWldOMGFXOXVjeUE5SUZ0ZE8xeHVkbUZ5SUhSeVlXTnJWVzVvWVc1a2JHVmtVbVZxWldOMGFXOXVjeUE5SUhSeWRXVTdYRzVjYm1aMWJtTjBhVzl1SUhKbGMyVjBWVzVvWVc1a2JHVmtVbVZxWldOMGFXOXVjeWdwSUh0Y2JpQWdJQ0IxYm1oaGJtUnNaV1JTWldGemIyNXpMbXhsYm1kMGFDQTlJREE3WEc0Z0lDQWdkVzVvWVc1a2JHVmtVbVZxWldOMGFXOXVjeTVzWlc1bmRHZ2dQU0F3TzF4dVhHNGdJQ0FnYVdZZ0tDRjBjbUZqYTFWdWFHRnVaR3hsWkZKbGFtVmpkR2x2Ym5NcElIdGNiaUFnSUNBZ0lDQWdkSEpoWTJ0VmJtaGhibVJzWldSU1pXcGxZM1JwYjI1eklEMGdkSEoxWlR0Y2JpQWdJQ0I5WEc1OVhHNWNibVoxYm1OMGFXOXVJSFJ5WVdOclVtVnFaV04wYVc5dUtIQnliMjFwYzJVc0lISmxZWE52YmlrZ2UxeHVJQ0FnSUdsbUlDZ2hkSEpoWTJ0VmJtaGhibVJzWldSU1pXcGxZM1JwYjI1ektTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tIUjVjR1Z2WmlCd2NtOWpaWE56SUQwOVBTQmNJbTlpYW1WamRGd2lJQ1ltSUhSNWNHVnZaaUJ3Y205alpYTnpMbVZ0YVhRZ1BUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVJQ0FnSUNBZ0lDQlJMbTVsZUhSVWFXTnJMbkoxYmtGbWRHVnlLR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoaGNuSmhlVjlwYm1SbGVFOW1LSFZ1YUdGdVpHeGxaRkpsYW1WamRHbHZibk1zSUhCeWIyMXBjMlVwSUNFOVBTQXRNU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCeWIyTmxjM011WlcxcGRDaGNJblZ1YUdGdVpHeGxaRkpsYW1WamRHbHZibHdpTENCeVpXRnpiMjRzSUhCeWIyMXBjMlVwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGNHOXlkR1ZrVlc1b1lXNWtiR1ZrVW1WcVpXTjBhVzl1Y3k1d2RYTm9LSEJ5YjIxcGMyVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQjFibWhoYm1Sc1pXUlNaV3BsWTNScGIyNXpMbkIxYzJnb2NISnZiV2x6WlNrN1hHNGdJQ0FnYVdZZ0tISmxZWE52YmlBbUppQjBlWEJsYjJZZ2NtVmhjMjl1TG5OMFlXTnJJQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lLU0I3WEc0Z0lDQWdJQ0FnSUhWdWFHRnVaR3hsWkZKbFlYTnZibk11Y0hWemFDaHlaV0Z6YjI0dWMzUmhZMnNwTzF4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJSFZ1YUdGdVpHeGxaRkpsWVhOdmJuTXVjSFZ6YUNoY0lpaHVieUJ6ZEdGamF5a2dYQ0lnS3lCeVpXRnpiMjRwTzF4dUlDQWdJSDFjYm4xY2JseHVablZ1WTNScGIyNGdkVzUwY21GamExSmxhbVZqZEdsdmJpaHdjbTl0YVhObEtTQjdYRzRnSUNBZ2FXWWdLQ0YwY21GamExVnVhR0Z1Wkd4bFpGSmxhbVZqZEdsdmJuTXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lIMWNibHh1SUNBZ0lIWmhjaUJoZENBOUlHRnljbUY1WDJsdVpHVjRUMllvZFc1b1lXNWtiR1ZrVW1WcVpXTjBhVzl1Y3l3Z2NISnZiV2x6WlNrN1hHNGdJQ0FnYVdZZ0tHRjBJQ0U5UFNBdE1Ta2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUhCeWIyTmxjM01nUFQwOUlGd2liMkpxWldOMFhDSWdKaVlnZEhsd1pXOW1JSEJ5YjJObGMzTXVaVzFwZENBOVBUMGdYQ0ptZFc1amRHbHZibHdpS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JSTG01bGVIUlVhV05yTG5KMWJrRm1kR1Z5S0daMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnWVhSU1pYQnZjblFnUFNCaGNuSmhlVjlwYm1SbGVFOW1LSEpsY0c5eWRHVmtWVzVvWVc1a2JHVmtVbVZxWldOMGFXOXVjeXdnY0hKdmJXbHpaU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHRjBVbVZ3YjNKMElDRTlQU0F0TVNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J3Y205alpYTnpMbVZ0YVhRb1hDSnlaV3BsWTNScGIyNUlZVzVrYkdWa1hDSXNJSFZ1YUdGdVpHeGxaRkpsWVhOdmJuTmJZWFJkTENCd2NtOXRhWE5sS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ3YjNKMFpXUlZibWhoYm1Sc1pXUlNaV3BsWTNScGIyNXpMbk53YkdsalpTaGhkRkpsY0c5eWRDd2dNU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2RXNW9ZVzVrYkdWa1VtVnFaV04wYVc5dWN5NXpjR3hwWTJVb1lYUXNJREVwTzF4dUlDQWdJQ0FnSUNCMWJtaGhibVJzWldSU1pXRnpiMjV6TG5Od2JHbGpaU2hoZEN3Z01TazdYRzRnSUNBZ2ZWeHVmVnh1WEc1UkxuSmxjMlYwVlc1b1lXNWtiR1ZrVW1WcVpXTjBhVzl1Y3lBOUlISmxjMlYwVlc1b1lXNWtiR1ZrVW1WcVpXTjBhVzl1Y3p0Y2JseHVVUzVuWlhSVmJtaGhibVJzWldSU1pXRnpiMjV6SUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDOHZJRTFoYTJVZ1lTQmpiM0I1SUhOdklIUm9ZWFFnWTI5dWMzVnRaWEp6SUdOaGJpZDBJR2x1ZEdWeVptVnlaU0IzYVhSb0lHOTFjaUJwYm5SbGNtNWhiQ0J6ZEdGMFpTNWNiaUFnSUNCeVpYUjFjbTRnZFc1b1lXNWtiR1ZrVW1WaGMyOXVjeTV6YkdsalpTZ3BPMXh1ZlR0Y2JseHVVUzV6ZEc5d1ZXNW9ZVzVrYkdWa1VtVnFaV04wYVc5dVZISmhZMnRwYm1jZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdjbVZ6WlhSVmJtaGhibVJzWldSU1pXcGxZM1JwYjI1ektDazdYRzRnSUNBZ2RISmhZMnRWYm1oaGJtUnNaV1JTWldwbFkzUnBiMjV6SUQwZ1ptRnNjMlU3WEc1OU8xeHVYRzV5WlhObGRGVnVhR0Z1Wkd4bFpGSmxhbVZqZEdsdmJuTW9LVHRjYmx4dUx5OHZMeUJGVGtRZ1ZVNUlRVTVFVEVWRUlGSkZTa1ZEVkVsUFRpQlVVa0ZEUzBsT1IxeHVYRzR2S2lwY2JpQXFJRU52Ym5OMGNuVmpkSE1nWVNCeVpXcGxZM1JsWkNCd2NtOXRhWE5sTGx4dUlDb2dRSEJoY21GdElISmxZWE52YmlCMllXeDFaU0JrWlhOamNtbGlhVzVuSUhSb1pTQm1ZV2xzZFhKbFhHNGdLaTljYmxFdWNtVnFaV04wSUQwZ2NtVnFaV04wTzF4dVpuVnVZM1JwYjI0Z2NtVnFaV04wS0hKbFlYTnZiaWtnZTF4dUlDQWdJSFpoY2lCeVpXcGxZM1JwYjI0Z1BTQlFjbTl0YVhObEtIdGNiaUFnSUNBZ0lDQWdYQ0ozYUdWdVhDSTZJR1oxYm1OMGFXOXVJQ2h5WldwbFkzUmxaQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdMeThnYm05MFpTQjBhR0YwSUhSb1pTQmxjbkp2Y2lCb1lYTWdZbVZsYmlCb1lXNWtiR1ZrWEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvY21WcVpXTjBaV1FwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMWJuUnlZV05yVW1WcVpXTjBhVzl1S0hSb2FYTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEpsYW1WamRHVmtJRDhnY21WcVpXTjBaV1FvY21WaGMyOXVLU0E2SUhSb2FYTTdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlMQ0JtZFc1amRHbHZiaUJtWVd4c1ltRmpheWdwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhSb2FYTTdYRzRnSUNBZ2ZTd2dablZ1WTNScGIyNGdhVzV6Y0dWamRDZ3BJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSHNnYzNSaGRHVTZJRndpY21WcVpXTjBaV1JjSWl3Z2NtVmhjMjl1T2lCeVpXRnpiMjRnZlR0Y2JpQWdJQ0I5S1R0Y2JseHVJQ0FnSUM4dklFNXZkR1VnZEdoaGRDQjBhR1VnY21WaGMyOXVJR2hoY3lCdWIzUWdZbVZsYmlCb1lXNWtiR1ZrTGx4dUlDQWdJSFJ5WVdOclVtVnFaV04wYVc5dUtISmxhbVZqZEdsdmJpd2djbVZoYzI5dUtUdGNibHh1SUNBZ0lISmxkSFZ5YmlCeVpXcGxZM1JwYjI0N1hHNTlYRzVjYmk4cUtseHVJQ29nUTI5dWMzUnlkV04wY3lCaElHWjFiR1pwYkd4bFpDQndjbTl0YVhObElHWnZjaUJoYmlCcGJXMWxaR2xoZEdVZ2NtVm1aWEpsYm1ObExseHVJQ29nUUhCaGNtRnRJSFpoYkhWbElHbHRiV1ZrYVdGMFpTQnlaV1psY21WdVkyVmNiaUFxTDF4dVVTNW1kV3htYVd4c0lEMGdablZzWm1sc2JEdGNibVoxYm1OMGFXOXVJR1oxYkdacGJHd29kbUZzZFdVcElIdGNiaUFnSUNCeVpYUjFjbTRnVUhKdmJXbHpaU2g3WEc0Z0lDQWdJQ0FnSUZ3aWQyaGxibHdpT2lCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZG1Gc2RXVTdYRzRnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUZ3aVoyVjBYQ0k2SUdaMWJtTjBhVzl1SUNodVlXMWxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2RtRnNkV1ZiYm1GdFpWMDdYRzRnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUZ3aWMyVjBYQ0k2SUdaMWJtTjBhVzl1SUNodVlXMWxMQ0J5YUhNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGJIVmxXMjVoYldWZElEMGdjbWh6TzF4dUlDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQmNJbVJsYkdWMFpWd2lPaUJtZFc1amRHbHZiaUFvYm1GdFpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1pHVnNaWFJsSUhaaGJIVmxXMjVoYldWZE8xeHVJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0JjSW5CdmMzUmNJam9nWm5WdVkzUnBiMjRnS0c1aGJXVXNJR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklFMWhjbXNnVFdsc2JHVnlJSEJ5YjNCdmMyVnpJSFJvWVhRZ2NHOXpkQ0IzYVhSb0lHNXZJRzVoYldVZ2MyaHZkV3hrSUdGd2NHeDVJR0ZjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJSEJ5YjIxcGMyVmtJR1oxYm1OMGFXOXVMbHh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLRzVoYldVZ1BUMDlJRzUxYkd3Z2ZId2dibUZ0WlNBOVBUMGdkbTlwWkNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIWmhiSFZsTG1Gd2NHeDVLSFp2YVdRZ01Dd2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQjJZV3gxWlZ0dVlXMWxYUzVoY0hCc2VTaDJZV3gxWlN3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUZ3aVlYQndiSGxjSWpvZ1puVnVZM1JwYjI0Z0tIUm9hWE53TENCaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2RtRnNkV1V1WVhCd2JIa29kR2hwYzNBc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQmNJbXRsZVhOY0lqb2dablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHOWlhbVZqZEY5clpYbHpLSFpoYkhWbEtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMHNJSFp2YVdRZ01Dd2dablZ1WTNScGIyNGdhVzV6Y0dWamRDZ3BJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSHNnYzNSaGRHVTZJRndpWm5Wc1ptbHNiR1ZrWENJc0lIWmhiSFZsT2lCMllXeDFaU0I5TzF4dUlDQWdJSDBwTzF4dWZWeHVYRzR2S2lwY2JpQXFJRU52Ym5abGNuUnpJSFJvWlc1aFlteGxjeUIwYnlCUklIQnliMjFwYzJWekxseHVJQ29nUUhCaGNtRnRJSEJ5YjIxcGMyVWdkR2hsYm1GaWJHVWdjSEp2YldselpWeHVJQ29nUUhKbGRIVnlibk1nWVNCUklIQnliMjFwYzJWY2JpQXFMMXh1Wm5WdVkzUnBiMjRnWTI5bGNtTmxLSEJ5YjIxcGMyVXBJSHRjYmlBZ0lDQjJZWElnWkdWbVpYSnlaV1FnUFNCa1pXWmxjaWdwTzF4dUlDQWdJRkV1Ym1WNGRGUnBZMnNvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQjBjbmtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjSEp2YldselpTNTBhR1Z1S0dSbFptVnljbVZrTG5KbGMyOXNkbVVzSUdSbFptVnljbVZrTG5KbGFtVmpkQ3dnWkdWbVpYSnlaV1F1Ym05MGFXWjVLVHRjYmlBZ0lDQWdJQ0FnZlNCallYUmphQ0FvWlhoalpYQjBhVzl1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JrWldabGNuSmxaQzV5WldwbFkzUW9aWGhqWlhCMGFXOXVLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDBwTzF4dUlDQWdJSEpsZEhWeWJpQmtaV1psY25KbFpDNXdjbTl0YVhObE8xeHVmVnh1WEc0dktpcGNiaUFxSUVGdWJtOTBZWFJsY3lCaGJpQnZZbXBsWTNRZ2MzVmphQ0IwYUdGMElHbDBJSGRwYkd3Z2JtVjJaWElnWW1WY2JpQXFJSFJ5WVc1elptVnljbVZrSUdGM1lYa2dabkp2YlNCMGFHbHpJSEJ5YjJObGMzTWdiM1psY2lCaGJua2djSEp2YldselpWeHVJQ29nWTI5dGJYVnVhV05oZEdsdmJpQmphR0Z1Ym1Wc0xseHVJQ29nUUhCaGNtRnRJRzlpYW1WamRGeHVJQ29nUUhKbGRIVnlibk1nY0hKdmJXbHpaU0JoSUhkeVlYQndhVzVuSUc5bUlIUm9ZWFFnYjJKcVpXTjBJSFJvWVhSY2JpQXFJR0ZrWkdsMGFXOXVZV3hzZVNCeVpYTndiMjVrY3lCMGJ5QjBhR1VnWENKcGMwUmxabHdpSUcxbGMzTmhaMlZjYmlBcUlIZHBkR2h2ZFhRZ1lTQnlaV3BsWTNScGIyNHVYRzRnS2k5Y2JsRXViV0Z6ZEdWeUlEMGdiV0Z6ZEdWeU8xeHVablZ1WTNScGIyNGdiV0Z6ZEdWeUtHOWlhbVZqZENrZ2UxeHVJQ0FnSUhKbGRIVnliaUJRY205dGFYTmxLSHRjYmlBZ0lDQWdJQ0FnWENKcGMwUmxabHdpT2lCbWRXNWpkR2x2YmlBb0tTQjdmVnh1SUNBZ0lIMHNJR1oxYm1OMGFXOXVJR1poYkd4aVlXTnJLRzl3TENCaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJrYVhOd1lYUmphQ2h2WW1wbFkzUXNJRzl3TENCaGNtZHpLVHRjYmlBZ0lDQjlMQ0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCUktHOWlhbVZqZENrdWFXNXpjR1ZqZENncE8xeHVJQ0FnSUgwcE8xeHVmVnh1WEc0dktpcGNiaUFxSUZOd2NtVmhaSE1nZEdobElIWmhiSFZsY3lCdlppQmhJSEJ5YjIxcGMyVmtJR0Z5Y21GNUlHOW1JR0Z5WjNWdFpXNTBjeUJwYm5SdklIUm9aVnh1SUNvZ1puVnNabWxzYkcxbGJuUWdZMkZzYkdKaFkyc3VYRzRnS2lCQWNHRnlZVzBnWm5Wc1ptbHNiR1ZrSUdOaGJHeGlZV05ySUhSb1lYUWdjbVZqWldsMlpYTWdkbUZ5YVdGa2FXTWdZWEpuZFcxbGJuUnpJR1p5YjIwZ2RHaGxYRzRnS2lCd2NtOXRhWE5sWkNCaGNuSmhlVnh1SUNvZ1FIQmhjbUZ0SUhKbGFtVmpkR1ZrSUdOaGJHeGlZV05ySUhSb1lYUWdjbVZqWldsMlpYTWdkR2hsSUdWNFkyVndkR2x2YmlCcFppQjBhR1VnY0hKdmJXbHpaVnh1SUNvZ2FYTWdjbVZxWldOMFpXUXVYRzRnS2lCQWNtVjBkWEp1Y3lCaElIQnliMjFwYzJVZ1ptOXlJSFJvWlNCeVpYUjFjbTRnZG1Gc2RXVWdiM0lnZEdoeWIzZHVJR1Y0WTJWd2RHbHZiaUJ2Wmx4dUlDb2daV2wwYUdWeUlHTmhiR3hpWVdOckxseHVJQ292WEc1UkxuTndjbVZoWkNBOUlITndjbVZoWkR0Y2JtWjFibU4wYVc5dUlITndjbVZoWkNoMllXeDFaU3dnWm5Wc1ptbHNiR1ZrTENCeVpXcGxZM1JsWkNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJSS0haaGJIVmxLUzV6Y0hKbFlXUW9ablZzWm1sc2JHVmtMQ0J5WldwbFkzUmxaQ2s3WEc1OVhHNWNibEJ5YjIxcGMyVXVjSEp2ZEc5MGVYQmxMbk53Y21WaFpDQTlJR1oxYm1OMGFXOXVJQ2htZFd4bWFXeHNaV1FzSUhKbGFtVmpkR1ZrS1NCN1hHNGdJQ0FnY21WMGRYSnVJSFJvYVhNdVlXeHNLQ2t1ZEdobGJpaG1kVzVqZEdsdmJpQW9ZWEp5WVhrcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFiR1pwYkd4bFpDNWhjSEJzZVNoMmIybGtJREFzSUdGeWNtRjVLVHRjYmlBZ0lDQjlMQ0J5WldwbFkzUmxaQ2s3WEc1OU8xeHVYRzR2S2lwY2JpQXFJRlJvWlNCaGMzbHVZeUJtZFc1amRHbHZiaUJwY3lCaElHUmxZMjl5WVhSdmNpQm1iM0lnWjJWdVpYSmhkRzl5SUdaMWJtTjBhVzl1Y3l3Z2RIVnlibWx1WjF4dUlDb2dkR2hsYlNCcGJuUnZJR0Z6ZVc1amFISnZibTkxY3lCblpXNWxjbUYwYjNKekxpQWdRV3gwYUc5MVoyZ2daMlZ1WlhKaGRHOXljeUJoY21VZ2IyNXNlU0J3WVhKMFhHNGdLaUJ2WmlCMGFHVWdibVYzWlhOMElFVkRUVUZUWTNKcGNIUWdOaUJrY21GbWRITXNJSFJvYVhNZ1kyOWtaU0JrYjJWeklHNXZkQ0JqWVhWelpTQnplVzUwWVhoY2JpQXFJR1Z5Y205eWN5QnBiaUJ2YkdSbGNpQmxibWRwYm1WekxpQWdWR2hwY3lCamIyUmxJSE5vYjNWc1pDQmpiMjUwYVc1MVpTQjBieUIzYjNKcklHRnVaQ0IzYVd4c1hHNGdLaUJwYmlCbVlXTjBJR2x0Y0hKdmRtVWdiM1psY2lCMGFXMWxJR0Z6SUhSb1pTQnNZVzVuZFdGblpTQnBiWEJ5YjNabGN5NWNiaUFxWEc0Z0tpQkZVellnWjJWdVpYSmhkRzl5Y3lCaGNtVWdZM1Z5Y21WdWRHeDVJSEJoY25RZ2IyWWdWamdnZG1WeWMybHZiaUF6TGpFNUlIZHBkR2dnZEdobFhHNGdLaUF0TFdoaGNtMXZibmt0WjJWdVpYSmhkRzl5Y3lCeWRXNTBhVzFsSUdac1lXY2daVzVoWW14bFpDNGdJRk53YVdSbGNrMXZibXRsZVNCb1lYTWdhR0ZrSUhSb1pXMWNiaUFxSUdadmNpQnNiMjVuWlhJc0lHSjFkQ0IxYm1SbGNpQmhiaUJ2YkdSbGNpQlFlWFJvYjI0dGFXNXpjR2x5WldRZ1ptOXliUzRnSUZSb2FYTWdablZ1WTNScGIyNWNiaUFxSUhkdmNtdHpJRzl1SUdKdmRHZ2dhMmx1WkhNZ2IyWWdaMlZ1WlhKaGRHOXljeTVjYmlBcVhHNGdLaUJFWldOdmNtRjBaWE1nWVNCblpXNWxjbUYwYjNJZ1puVnVZM1JwYjI0Z2MzVmphQ0IwYUdGME9seHVJQ29nSUMwZ2FYUWdiV0Y1SUhscFpXeGtJSEJ5YjIxcGMyVnpYRzRnS2lBZ0xTQmxlR1ZqZFhScGIyNGdkMmxzYkNCamIyNTBhVzUxWlNCM2FHVnVJSFJvWVhRZ2NISnZiV2x6WlNCcGN5Qm1kV3htYVd4c1pXUmNiaUFxSUNBdElIUm9aU0IyWVd4MVpTQnZaaUIwYUdVZ2VXbGxiR1FnWlhod2NtVnpjMmx2YmlCM2FXeHNJR0psSUhSb1pTQm1kV3htYVd4c1pXUWdkbUZzZFdWY2JpQXFJQ0F0SUdsMElISmxkSFZ5Ym5NZ1lTQndjbTl0YVhObElHWnZjaUIwYUdVZ2NtVjBkWEp1SUhaaGJIVmxJQ2gzYUdWdUlIUm9aU0JuWlc1bGNtRjBiM0pjYmlBcUlDQWdJSE4wYjNCeklHbDBaWEpoZEdsdVp5bGNiaUFxSUNBdElIUm9aU0JrWldOdmNtRjBaV1FnWm5WdVkzUnBiMjRnY21WMGRYSnVjeUJoSUhCeWIyMXBjMlVnWm05eUlIUm9aU0J5WlhSMWNtNGdkbUZzZFdWY2JpQXFJQ0FnSUc5bUlIUm9aU0JuWlc1bGNtRjBiM0lnYjNJZ2RHaGxJR1pwY25OMElISmxhbVZqZEdWa0lIQnliMjFwYzJVZ1lXMXZibWNnZEdodmMyVmNiaUFxSUNBZ0lIbHBaV3hrWldRdVhHNGdLaUFnTFNCcFppQmhiaUJsY25KdmNpQnBjeUIwYUhKdmQyNGdhVzRnZEdobElHZGxibVZ5WVhSdmNpd2dhWFFnY0hKdmNHRm5ZWFJsY3lCMGFISnZkV2RvWEc0Z0tpQWdJQ0JsZG1WeWVTQm1iMnhzYjNkcGJtY2dlV2xsYkdRZ2RXNTBhV3dnYVhRZ2FYTWdZMkYxWjJoMExDQnZjaUIxYm5ScGJDQnBkQ0JsYzJOaGNHVnpYRzRnS2lBZ0lDQjBhR1VnWjJWdVpYSmhkRzl5SUdaMWJtTjBhVzl1SUdGc2RHOW5aWFJvWlhJc0lHRnVaQ0JwY3lCMGNtRnVjMnhoZEdWa0lHbHVkRzhnWVZ4dUlDb2dJQ0FnY21WcVpXTjBhVzl1SUdadmNpQjBhR1VnY0hKdmJXbHpaU0J5WlhSMWNtNWxaQ0JpZVNCMGFHVWdaR1ZqYjNKaGRHVmtJR2RsYm1WeVlYUnZjaTVjYmlBcUwxeHVVUzVoYzNsdVl5QTlJR0Z6ZVc1ak8xeHVablZ1WTNScGIyNGdZWE41Ym1Nb2JXRnJaVWRsYm1WeVlYUnZjaWtnZTF4dUlDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUM4dklIZG9aVzRnZG1WeVlpQnBjeUJjSW5ObGJtUmNJaXdnWVhKbklHbHpJR0VnZG1Gc2RXVmNiaUFnSUNBZ0lDQWdMeThnZDJobGJpQjJaWEppSUdseklGd2lkR2h5YjNkY0lpd2dZWEpuSUdseklHRnVJR1Y0WTJWd2RHbHZibHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJqYjI1MGFXNTFaWElvZG1WeVlpd2dZWEpuS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2NtVnpkV3gwTzF4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCVmJuUnBiQ0JXT0NBekxqRTVJQzhnUTJoeWIyMXBkVzBnTWprZ2FYTWdjbVZzWldGelpXUXNJRk53YVdSbGNrMXZibXRsZVNCcGN5QjBhR1VnYjI1c2VWeHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1pXNW5hVzVsSUhSb1lYUWdhR0Z6SUdFZ1pHVndiRzk1WldRZ1ltRnpaU0J2WmlCaWNtOTNjMlZ5Y3lCMGFHRjBJSE4xY0hCdmNuUWdaMlZ1WlhKaGRHOXljeTVjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJRWh2ZDJWMlpYSXNJRk5OSjNNZ1oyVnVaWEpoZEc5eWN5QjFjMlVnZEdobElGQjVkR2h2YmkxcGJuTndhWEpsWkNCelpXMWhiblJwWTNNZ2IyWmNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklHOTFkR1JoZEdWa0lFVlROaUJrY21GbWRITXVJQ0JYWlNCM2IzVnNaQ0JzYVd0bElIUnZJSE4xY0hCdmNuUWdSVk0yTENCaWRYUWdkMlVuWkNCaGJITnZYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QnNhV3RsSUhSdklHMWhhMlVnYVhRZ2NHOXpjMmxpYkdVZ2RHOGdkWE5sSUdkbGJtVnlZWFJ2Y25NZ2FXNGdaR1Z3Ykc5NVpXUWdZbkp2ZDNObGNuTXNJSE52WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUIzWlNCaGJITnZJSE4xY0hCdmNuUWdVSGwwYUc5dUxYTjBlV3hsSUdkbGJtVnlZWFJ2Y25NdUlDQkJkQ0J6YjIxbElIQnZhVzUwSUhkbElHTmhiaUJ5WlcxdmRtVmNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklIUm9hWE1nWW14dlkyc3VYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdVM1J2Y0VsMFpYSmhkR2x2YmlBOVBUMGdYQ0oxYm1SbFptbHVaV1JjSWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDOHZJRVZUTmlCSFpXNWxjbUYwYjNKelhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RISjVJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnpkV3gwSUQwZ1oyVnVaWEpoZEc5eVczWmxjbUpkS0dGeVp5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU0JqWVhSamFDQW9aWGhqWlhCMGFXOXVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCeVpXcGxZM1FvWlhoalpYQjBhVzl1S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEpsYzNWc2RDNWtiMjVsS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQlJLSEpsYzNWc2RDNTJZV3gxWlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIZG9aVzRvY21WemRXeDBMblpoYkhWbExDQmpZV3hzWW1GamF5d2daWEp5WW1GamF5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdkx5QlRjR2xrWlhKTmIyNXJaWGtnUjJWdVpYSmhkRzl5YzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUM4dklFWkpXRTFGT2lCU1pXMXZkbVVnZEdocGN5QmpZWE5sSUhkb1pXNGdVMDBnWkc5bGN5QkZVellnWjJWdVpYSmhkRzl5Y3k1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGNua2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFFnUFNCblpXNWxjbUYwYjNKYmRtVnlZbDBvWVhKbktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR05oZEdOb0lDaGxlR05sY0hScGIyNHBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR2x6VTNSdmNFbDBaWEpoZEdsdmJpaGxlR05sY0hScGIyNHBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdVU2hsZUdObGNIUnBiMjR1ZG1Gc2RXVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEpsYW1WamRDaGxlR05sY0hScGIyNHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCM2FHVnVLSEpsYzNWc2RDd2dZMkZzYkdKaFkyc3NJR1Z5Y21KaFkyc3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSFpoY2lCblpXNWxjbUYwYjNJZ1BTQnRZV3RsUjJWdVpYSmhkRzl5TG1Gd2NHeDVLSFJvYVhNc0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUNBZ0lDQWdJSFpoY2lCallXeHNZbUZqYXlBOUlHTnZiblJwYm5WbGNpNWlhVzVrS0dOdmJuUnBiblZsY2l3Z1hDSnVaWGgwWENJcE8xeHVJQ0FnSUNBZ0lDQjJZWElnWlhKeVltRmpheUE5SUdOdmJuUnBiblZsY2k1aWFXNWtLR052Ym5ScGJuVmxjaXdnWENKMGFISnZkMXdpS1R0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yS0NrN1hHNGdJQ0FnZlR0Y2JuMWNibHh1THlvcVhHNGdLaUJVYUdVZ2MzQmhkMjRnWm5WdVkzUnBiMjRnYVhNZ1lTQnpiV0ZzYkNCM2NtRndjR1Z5SUdGeWIzVnVaQ0JoYzNsdVl5QjBhR0YwSUdsdGJXVmthV0YwWld4NVhHNGdLaUJqWVd4c2N5QjBhR1VnWjJWdVpYSmhkRzl5SUdGdVpDQmhiSE52SUdWdVpITWdkR2hsSUhCeWIyMXBjMlVnWTJoaGFXNHNJSE52SUhSb1lYUWdZVzU1WEc0Z0tpQjFibWhoYm1Sc1pXUWdaWEp5YjNKeklHRnlaU0IwYUhKdmQyNGdhVzV6ZEdWaFpDQnZaaUJtYjNKM1lYSmtaV1FnZEc4Z2RHaGxJR1Z5Y205eVhHNGdLaUJvWVc1a2JHVnlMaUJVYUdseklHbHpJSFZ6WldaMWJDQmlaV05oZFhObElHbDBKM01nWlhoMGNtVnRaV3g1SUdOdmJXMXZiaUIwYnlCeWRXNWNiaUFxSUdkbGJtVnlZWFJ2Y25NZ1lYUWdkR2hsSUhSdmNDMXNaWFpsYkNCMGJ5QjNiM0pySUhkcGRHZ2diR2xpY21GeWFXVnpMbHh1SUNvdlhHNVJMbk53WVhkdUlEMGdjM0JoZDI0N1hHNW1kVzVqZEdsdmJpQnpjR0YzYmlodFlXdGxSMlZ1WlhKaGRHOXlLU0I3WEc0Z0lDQWdVUzVrYjI1bEtGRXVZWE41Ym1Nb2JXRnJaVWRsYm1WeVlYUnZjaWtvS1NrN1hHNTlYRzVjYmk4dklFWkpXRTFGT2lCU1pXMXZkbVVnZEdocGN5QnBiblJsY21aaFkyVWdiMjVqWlNCRlV6WWdaMlZ1WlhKaGRHOXljeUJoY21VZ2FXNGdVM0JwWkdWeVRXOXVhMlY1TGx4dUx5b3FYRzRnS2lCVWFISnZkM01nWVNCU1pYUjFjbTVXWVd4MVpTQmxlR05sY0hScGIyNGdkRzhnYzNSdmNDQmhiaUJoYzNsdVkyaHliMjV2ZFhNZ1oyVnVaWEpoZEc5eUxseHVJQ3BjYmlBcUlGUm9hWE1nYVc1MFpYSm1ZV05sSUdseklHRWdjM1J2Y0MxbllYQWdiV1ZoYzNWeVpTQjBieUJ6ZFhCd2IzSjBJR2RsYm1WeVlYUnZjaUJ5WlhSMWNtNWNiaUFxSUhaaGJIVmxjeUJwYmlCdmJHUmxjaUJHYVhKbFptOTRMMU53YVdSbGNrMXZibXRsZVM0Z0lFbHVJR0p5YjNkelpYSnpJSFJvWVhRZ2MzVndjRzl5ZENCRlV6WmNiaUFxSUdkbGJtVnlZWFJ2Y25NZ2JHbHJaU0JEYUhKdmJXbDFiU0F5T1N3Z2FuVnpkQ0IxYzJVZ1hDSnlaWFIxY201Y0lpQnBiaUI1YjNWeUlHZGxibVZ5WVhSdmNseHVJQ29nWm5WdVkzUnBiMjV6TGx4dUlDcGNiaUFxSUVCd1lYSmhiU0IyWVd4MVpTQjBhR1VnY21WMGRYSnVJSFpoYkhWbElHWnZjaUIwYUdVZ2MzVnljbTkxYm1ScGJtY2daMlZ1WlhKaGRHOXlYRzRnS2lCQWRHaHliM2R6SUZKbGRIVnlibFpoYkhWbElHVjRZMlZ3ZEdsdmJpQjNhWFJvSUhSb1pTQjJZV3gxWlM1Y2JpQXFJRUJsZUdGdGNHeGxYRzRnS2lBdkx5QkZVellnYzNSNWJHVmNiaUFxSUZFdVlYTjVibU1vWm5WdVkzUnBiMjRxSUNncElIdGNiaUFxSUNBZ0lDQWdkbUZ5SUdadmJ5QTlJSGxwWld4a0lHZGxkRVp2YjFCeWIyMXBjMlVvS1R0Y2JpQXFJQ0FnSUNBZ2RtRnlJR0poY2lBOUlIbHBaV3hrSUdkbGRFSmhjbEJ5YjIxcGMyVW9LVHRjYmlBcUlDQWdJQ0FnY21WMGRYSnVJR1p2YnlBcklHSmhjanRjYmlBcUlIMHBYRzRnS2lBdkx5QlBiR1JsY2lCVGNHbGtaWEpOYjI1clpYa2djM1I1YkdWY2JpQXFJRkV1WVhONWJtTW9ablZ1WTNScGIyNGdLQ2tnZTF4dUlDb2dJQ0FnSUNCMllYSWdabTl2SUQwZ2VXbGxiR1FnWjJWMFJtOXZVSEp2YldselpTZ3BPMXh1SUNvZ0lDQWdJQ0IyWVhJZ1ltRnlJRDBnZVdsbGJHUWdaMlYwUW1GeVVISnZiV2x6WlNncE8xeHVJQ29nSUNBZ0lDQlJMbkpsZEhWeWJpaG1iMjhnS3lCaVlYSXBPMXh1SUNvZ2ZTbGNiaUFxTDF4dVVWdGNJbkpsZEhWeWJsd2lYU0E5SUY5eVpYUjFjbTQ3WEc1bWRXNWpkR2x2YmlCZmNtVjBkWEp1S0haaGJIVmxLU0I3WEc0Z0lDQWdkR2h5YjNjZ2JtVjNJRkZTWlhSMWNtNVdZV3gxWlNoMllXeDFaU2s3WEc1OVhHNWNiaThxS2x4dUlDb2dWR2hsSUhCeWIyMXBjMlZrSUdaMWJtTjBhVzl1SUdSbFkyOXlZWFJ2Y2lCbGJuTjFjbVZ6SUhSb1lYUWdZVzU1SUhCeWIyMXBjMlVnWVhKbmRXMWxiblJ6WEc0Z0tpQmhjbVVnYzJWMGRHeGxaQ0JoYm1RZ2NHRnpjMlZrSUdGeklIWmhiSFZsY3lBb1lIUm9hWE5nSUdseklHRnNjMjhnYzJWMGRHeGxaQ0JoYm1RZ2NHRnpjMlZrWEc0Z0tpQmhjeUJoSUhaaGJIVmxLUzRnSUVsMElIZHBiR3dnWVd4emJ5Qmxibk4xY21VZ2RHaGhkQ0IwYUdVZ2NtVnpkV3gwSUc5bUlHRWdablZ1WTNScGIyNGdhWE5jYmlBcUlHRnNkMkY1Y3lCaElIQnliMjFwYzJVdVhHNGdLbHh1SUNvZ1FHVjRZVzF3YkdWY2JpQXFJSFpoY2lCaFpHUWdQU0JSTG5CeWIyMXBjMlZrS0daMWJtTjBhVzl1SUNoaExDQmlLU0I3WEc0Z0tpQWdJQ0FnY21WMGRYSnVJR0VnS3lCaU8xeHVJQ29nZlNrN1hHNGdLaUJoWkdRb1VTaGhLU3dnVVNoQ0tTazdYRzRnS2x4dUlDb2dRSEJoY21GdElIdG1kVzVqZEdsdmJuMGdZMkZzYkdKaFkyc2dWR2hsSUdaMWJtTjBhVzl1SUhSdklHUmxZMjl5WVhSbFhHNGdLaUJBY21WMGRYSnVjeUI3Wm5WdVkzUnBiMjU5SUdFZ1puVnVZM1JwYjI0Z2RHaGhkQ0JvWVhNZ1ltVmxiaUJrWldOdmNtRjBaV1F1WEc0Z0tpOWNibEV1Y0hKdmJXbHpaV1FnUFNCd2NtOXRhWE5sWkR0Y2JtWjFibU4wYVc5dUlIQnliMjFwYzJWa0tHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlITndjbVZoWkNoYmRHaHBjeXdnWVd4c0tHRnlaM1Z0Wlc1MGN5bGRMQ0JtZFc1amRHbHZiaUFvYzJWc1ppd2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR05oYkd4aVlXTnJMbUZ3Y0d4NUtITmxiR1lzSUdGeVozTXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5TzF4dWZWeHVYRzR2S2lwY2JpQXFJSE5sYm1SeklHRWdiV1Z6YzJGblpTQjBieUJoSUhaaGJIVmxJR2x1SUdFZ1puVjBkWEpsSUhSMWNtNWNiaUFxSUVCd1lYSmhiU0J2WW1wbFkzUXFJSFJvWlNCeVpXTnBjR2xsYm5SY2JpQXFJRUJ3WVhKaGJTQnZjQ0IwYUdVZ2JtRnRaU0J2WmlCMGFHVWdiV1Z6YzJGblpTQnZjR1Z5WVhScGIyNHNJR1V1Wnk0c0lGd2lkMmhsYmx3aUxGeHVJQ29nUUhCaGNtRnRJR0Z5WjNNZ1puVnlkR2hsY2lCaGNtZDFiV1Z1ZEhNZ2RHOGdZbVVnWm05eWQyRnlaR1ZrSUhSdklIUm9aU0J2Y0dWeVlYUnBiMjVjYmlBcUlFQnlaWFIxY201eklISmxjM1ZzZENCN1VISnZiV2x6WlgwZ1lTQndjbTl0YVhObElHWnZjaUIwYUdVZ2NtVnpkV3gwSUc5bUlIUm9aU0J2Y0dWeVlYUnBiMjVjYmlBcUwxeHVVUzVrYVhOd1lYUmphQ0E5SUdScGMzQmhkR05vTzF4dVpuVnVZM1JwYjI0Z1pHbHpjR0YwWTJnb2IySnFaV04wTENCdmNDd2dZWEpuY3lrZ2UxeHVJQ0FnSUhKbGRIVnliaUJSS0c5aWFtVmpkQ2t1WkdsemNHRjBZMmdvYjNBc0lHRnlaM01wTzF4dWZWeHVYRzVRY205dGFYTmxMbkJ5YjNSdmRIbHdaUzVrYVhOd1lYUmphQ0E5SUdaMWJtTjBhVzl1SUNodmNDd2dZWEpuY3lrZ2UxeHVJQ0FnSUhaaGNpQnpaV3htSUQwZ2RHaHBjenRjYmlBZ0lDQjJZWElnWkdWbVpYSnlaV1FnUFNCa1pXWmxjaWdwTzF4dUlDQWdJRkV1Ym1WNGRGUnBZMnNvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQnpaV3htTG5CeWIyMXBjMlZFYVhOd1lYUmphQ2hrWldabGNuSmxaQzV5WlhOdmJIWmxMQ0J2Y0N3Z1lYSm5jeWs3WEc0Z0lDQWdmU2s3WEc0Z0lDQWdjbVYwZFhKdUlHUmxabVZ5Y21Wa0xuQnliMjFwYzJVN1hHNTlPMXh1WEc0dktpcGNiaUFxSUVkbGRITWdkR2hsSUhaaGJIVmxJRzltSUdFZ2NISnZjR1Z5ZEhrZ2FXNGdZU0JtZFhSMWNtVWdkSFZ5Ymk1Y2JpQXFJRUJ3WVhKaGJTQnZZbXBsWTNRZ0lDQWdjSEp2YldselpTQnZjaUJwYlcxbFpHbGhkR1VnY21WbVpYSmxibU5sSUdadmNpQjBZWEpuWlhRZ2IySnFaV04wWEc0Z0tpQkFjR0Z5WVcwZ2JtRnRaU0FnSUNBZ0lHNWhiV1VnYjJZZ2NISnZjR1Z5ZEhrZ2RHOGdaMlYwWEc0Z0tpQkFjbVYwZFhKdUlIQnliMjFwYzJVZ1ptOXlJSFJvWlNCd2NtOXdaWEowZVNCMllXeDFaVnh1SUNvdlhHNVJMbWRsZENBOUlHWjFibU4wYVc5dUlDaHZZbXBsWTNRc0lHdGxlU2tnZTF4dUlDQWdJSEpsZEhWeWJpQlJLRzlpYW1WamRDa3VaR2x6Y0dGMFkyZ29YQ0puWlhSY0lpd2dXMnRsZVYwcE8xeHVmVHRjYmx4dVVISnZiV2x6WlM1d2NtOTBiM1I1Y0dVdVoyVjBJRDBnWm5WdVkzUnBiMjRnS0d0bGVTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbVJwYzNCaGRHTm9LRndpWjJWMFhDSXNJRnRyWlhsZEtUdGNibjA3WEc1Y2JpOHFLbHh1SUNvZ1UyVjBjeUIwYUdVZ2RtRnNkV1VnYjJZZ1lTQndjbTl3WlhKMGVTQnBiaUJoSUdaMWRIVnlaU0IwZFhKdUxseHVJQ29nUUhCaGNtRnRJRzlpYW1WamRDQWdJQ0J3Y205dGFYTmxJRzl5SUdsdGJXVmthV0YwWlNCeVpXWmxjbVZ1WTJVZ1ptOXlJRzlpYW1WamRDQnZZbXBsWTNSY2JpQXFJRUJ3WVhKaGJTQnVZVzFsSUNBZ0lDQWdibUZ0WlNCdlppQndjbTl3WlhKMGVTQjBieUJ6WlhSY2JpQXFJRUJ3WVhKaGJTQjJZV3gxWlNBZ0lDQWdibVYzSUhaaGJIVmxJRzltSUhCeWIzQmxjblI1WEc0Z0tpQkFjbVYwZFhKdUlIQnliMjFwYzJVZ1ptOXlJSFJvWlNCeVpYUjFjbTRnZG1Gc2RXVmNiaUFxTDF4dVVTNXpaWFFnUFNCbWRXNWpkR2x2YmlBb2IySnFaV04wTENCclpYa3NJSFpoYkhWbEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUZFb2IySnFaV04wS1M1a2FYTndZWFJqYUNoY0luTmxkRndpTENCYmEyVjVMQ0IyWVd4MVpWMHBPMXh1ZlR0Y2JseHVVSEp2YldselpTNXdjbTkwYjNSNWNHVXVjMlYwSUQwZ1puVnVZM1JwYjI0Z0tHdGxlU3dnZG1Gc2RXVXBJSHRjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTVrYVhOd1lYUmphQ2hjSW5ObGRGd2lMQ0JiYTJWNUxDQjJZV3gxWlYwcE8xeHVmVHRjYmx4dUx5b3FYRzRnS2lCRVpXeGxkR1Z6SUdFZ2NISnZjR1Z5ZEhrZ2FXNGdZU0JtZFhSMWNtVWdkSFZ5Ymk1Y2JpQXFJRUJ3WVhKaGJTQnZZbXBsWTNRZ0lDQWdjSEp2YldselpTQnZjaUJwYlcxbFpHbGhkR1VnY21WbVpYSmxibU5sSUdadmNpQjBZWEpuWlhRZ2IySnFaV04wWEc0Z0tpQkFjR0Z5WVcwZ2JtRnRaU0FnSUNBZ0lHNWhiV1VnYjJZZ2NISnZjR1Z5ZEhrZ2RHOGdaR1ZzWlhSbFhHNGdLaUJBY21WMGRYSnVJSEJ5YjIxcGMyVWdabTl5SUhSb1pTQnlaWFIxY200Z2RtRnNkV1ZjYmlBcUwxeHVVUzVrWld3Z1BTQXZMeUJZV0ZnZ2JHVm5ZV041WEc1Ulcxd2laR1ZzWlhSbFhDSmRJRDBnWm5WdVkzUnBiMjRnS0c5aWFtVmpkQ3dnYTJWNUtTQjdYRzRnSUNBZ2NtVjBkWEp1SUZFb2IySnFaV04wS1M1a2FYTndZWFJqYUNoY0ltUmxiR1YwWlZ3aUxDQmJhMlY1WFNrN1hHNTlPMXh1WEc1UWNtOXRhWE5sTG5CeWIzUnZkSGx3WlM1a1pXd2dQU0F2THlCWVdGZ2diR1ZuWVdONVhHNVFjbTl0YVhObExuQnliM1J2ZEhsd1pWdGNJbVJsYkdWMFpWd2lYU0E5SUdaMWJtTjBhVzl1SUNoclpYa3BJSHRjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTVrYVhOd1lYUmphQ2hjSW1SbGJHVjBaVndpTENCYmEyVjVYU2s3WEc1OU8xeHVYRzR2S2lwY2JpQXFJRWx1ZG05clpYTWdZU0J0WlhSb2IyUWdhVzRnWVNCbWRYUjFjbVVnZEhWeWJpNWNiaUFxSUVCd1lYSmhiU0J2WW1wbFkzUWdJQ0FnY0hKdmJXbHpaU0J2Y2lCcGJXMWxaR2xoZEdVZ2NtVm1aWEpsYm1ObElHWnZjaUIwWVhKblpYUWdiMkpxWldOMFhHNGdLaUJBY0dGeVlXMGdibUZ0WlNBZ0lDQWdJRzVoYldVZ2IyWWdiV1YwYUc5a0lIUnZJR2x1ZG05clpWeHVJQ29nUUhCaGNtRnRJSFpoYkhWbElDQWdJQ0JoSUhaaGJIVmxJSFJ2SUhCdmMzUXNJSFI1Y0dsallXeHNlU0JoYmlCaGNuSmhlU0J2Wmx4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBiblp2WTJGMGFXOXVJR0Z5WjNWdFpXNTBjeUJtYjNJZ2NISnZiV2x6WlhNZ2RHaGhkRnh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGNtVWdkV3gwYVcxaGRHVnNlU0JpWVdOclpXUWdkMmwwYUNCZ2NtVnpiMngyWldBZ2RtRnNkV1Z6TEZ4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjeUJ2Y0hCdmMyVmtJSFJ2SUhSb2IzTmxJR0poWTJ0bFpDQjNhWFJvSUZWU1RITmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDJobGNtVnBiaUIwYUdVZ2NHOXpkR1ZrSUhaaGJIVmxJR05oYmlCaVpTQmhibmxjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1NsTlBUaUJ6WlhKcFlXeHBlbUZpYkdVZ2IySnFaV04wTGx4dUlDb2dRSEpsZEhWeWJpQndjbTl0YVhObElHWnZjaUIwYUdVZ2NtVjBkWEp1SUhaaGJIVmxYRzRnS2k5Y2JpOHZJR0p2ZFc1a0lHeHZZMkZzYkhrZ1ltVmpZWFZ6WlNCcGRDQnBjeUIxYzJWa0lHSjVJRzkwYUdWeUlHMWxkR2h2WkhOY2JsRXViV0Z3Y0d4NUlEMGdMeThnV0ZoWUlFRnpJSEJ5YjNCdmMyVmtJR0o1SUZ3aVVtVmtjMkZ1WkhKdlhDSmNibEV1Y0c5emRDQTlJR1oxYm1OMGFXOXVJQ2h2WW1wbFkzUXNJRzVoYldVc0lHRnlaM01wSUh0Y2JpQWdJQ0J5WlhSMWNtNGdVU2h2WW1wbFkzUXBMbVJwYzNCaGRHTm9LRndpY0c5emRGd2lMQ0JiYm1GdFpTd2dZWEpuYzEwcE8xeHVmVHRjYmx4dVVISnZiV2x6WlM1d2NtOTBiM1I1Y0dVdWJXRndjR3g1SUQwZ0x5OGdXRmhZSUVGeklIQnliM0J2YzJWa0lHSjVJRndpVW1Wa2MyRnVaSEp2WENKY2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExuQnZjM1FnUFNCbWRXNWpkR2x2YmlBb2JtRnRaU3dnWVhKbmN5a2dlMXh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbVJwYzNCaGRHTm9LRndpY0c5emRGd2lMQ0JiYm1GdFpTd2dZWEpuYzEwcE8xeHVmVHRjYmx4dUx5b3FYRzRnS2lCSmJuWnZhMlZ6SUdFZ2JXVjBhRzlrSUdsdUlHRWdablYwZFhKbElIUjFjbTR1WEc0Z0tpQkFjR0Z5WVcwZ2IySnFaV04wSUNBZ0lIQnliMjFwYzJVZ2IzSWdhVzF0WldScFlYUmxJSEpsWm1WeVpXNWpaU0JtYjNJZ2RHRnlaMlYwSUc5aWFtVmpkRnh1SUNvZ1FIQmhjbUZ0SUc1aGJXVWdJQ0FnSUNCdVlXMWxJRzltSUcxbGRHaHZaQ0IwYnlCcGJuWnZhMlZjYmlBcUlFQndZWEpoYlNBdUxpNWhjbWR6SUNBZ1lYSnlZWGtnYjJZZ2FXNTJiMk5oZEdsdmJpQmhjbWQxYldWdWRITmNiaUFxSUVCeVpYUjFjbTRnY0hKdmJXbHpaU0JtYjNJZ2RHaGxJSEpsZEhWeWJpQjJZV3gxWlZ4dUlDb3ZYRzVSTG5ObGJtUWdQU0F2THlCWVdGZ2dUV0Z5YXlCTmFXeHNaWEluY3lCd2NtOXdiM05sWkNCd1lYSnNZVzVqWlZ4dVVTNXRZMkZzYkNBOUlDOHZJRmhZV0NCQmN5QndjbTl3YjNObFpDQmllU0JjSWxKbFpITmhibVJ5YjF3aVhHNVJMbWx1ZG05clpTQTlJR1oxYm1OMGFXOXVJQ2h2WW1wbFkzUXNJRzVoYldVZ0x5b3VMaTVoY21kektpOHBJSHRjYmlBZ0lDQnlaWFIxY200Z1VTaHZZbXBsWTNRcExtUnBjM0JoZEdOb0tGd2ljRzl6ZEZ3aUxDQmJibUZ0WlN3Z1lYSnlZWGxmYzJ4cFkyVW9ZWEpuZFcxbGJuUnpMQ0F5S1YwcE8xeHVmVHRjYmx4dVVISnZiV2x6WlM1d2NtOTBiM1I1Y0dVdWMyVnVaQ0E5SUM4dklGaFlXQ0JOWVhKcklFMXBiR3hsY2lkeklIQnliM0J2YzJWa0lIQmhjbXhoYm1ObFhHNVFjbTl0YVhObExuQnliM1J2ZEhsd1pTNXRZMkZzYkNBOUlDOHZJRmhZV0NCQmN5QndjbTl3YjNObFpDQmllU0JjSWxKbFpITmhibVJ5YjF3aVhHNVFjbTl0YVhObExuQnliM1J2ZEhsd1pTNXBiblp2YTJVZ1BTQm1kVzVqZEdsdmJpQW9ibUZ0WlNBdktpNHVMbUZ5WjNNcUx5a2dlMXh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbVJwYzNCaGRHTm9LRndpY0c5emRGd2lMQ0JiYm1GdFpTd2dZWEp5WVhsZmMyeHBZMlVvWVhKbmRXMWxiblJ6TENBeEtWMHBPMXh1ZlR0Y2JseHVMeW9xWEc0Z0tpQkJjSEJzYVdWeklIUm9aU0J3Y205dGFYTmxaQ0JtZFc1amRHbHZiaUJwYmlCaElHWjFkSFZ5WlNCMGRYSnVMbHh1SUNvZ1FIQmhjbUZ0SUc5aWFtVmpkQ0FnSUNCd2NtOXRhWE5sSUc5eUlHbHRiV1ZrYVdGMFpTQnlaV1psY21WdVkyVWdabTl5SUhSaGNtZGxkQ0JtZFc1amRHbHZibHh1SUNvZ1FIQmhjbUZ0SUdGeVozTWdJQ0FnSUNCaGNuSmhlU0J2WmlCaGNIQnNhV05oZEdsdmJpQmhjbWQxYldWdWRITmNiaUFxTDF4dVVTNW1ZWEJ3YkhrZ1BTQm1kVzVqZEdsdmJpQW9iMkpxWldOMExDQmhjbWR6S1NCN1hHNGdJQ0FnY21WMGRYSnVJRkVvYjJKcVpXTjBLUzVrYVhOd1lYUmphQ2hjSW1Gd2NHeDVYQ0lzSUZ0MmIybGtJREFzSUdGeVozTmRLVHRjYm4wN1hHNWNibEJ5YjIxcGMyVXVjSEp2ZEc5MGVYQmxMbVpoY0hCc2VTQTlJR1oxYm1OMGFXOXVJQ2hoY21kektTQjdYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVaR2x6Y0dGMFkyZ29YQ0poY0hCc2VWd2lMQ0JiZG05cFpDQXdMQ0JoY21kelhTazdYRzU5TzF4dVhHNHZLaXBjYmlBcUlFTmhiR3h6SUhSb1pTQndjbTl0YVhObFpDQm1kVzVqZEdsdmJpQnBiaUJoSUdaMWRIVnlaU0IwZFhKdUxseHVJQ29nUUhCaGNtRnRJRzlpYW1WamRDQWdJQ0J3Y205dGFYTmxJRzl5SUdsdGJXVmthV0YwWlNCeVpXWmxjbVZ1WTJVZ1ptOXlJSFJoY21kbGRDQm1kVzVqZEdsdmJseHVJQ29nUUhCaGNtRnRJQzR1TG1GeVozTWdJQ0JoY25KaGVTQnZaaUJoY0hCc2FXTmhkR2x2YmlCaGNtZDFiV1Z1ZEhOY2JpQXFMMXh1VVZ0Y0luUnllVndpWFNBOVhHNVJMbVpqWVd4c0lEMGdablZ1WTNScGIyNGdLRzlpYW1WamRDQXZLaUF1TGk1aGNtZHpLaThwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdVU2h2WW1wbFkzUXBMbVJwYzNCaGRHTm9LRndpWVhCd2JIbGNJaXdnVzNadmFXUWdNQ3dnWVhKeVlYbGZjMnhwWTJVb1lYSm5kVzFsYm5SekxDQXhLVjBwTzF4dWZUdGNibHh1VUhKdmJXbHpaUzV3Y205MGIzUjVjR1V1Wm1OaGJHd2dQU0JtZFc1amRHbHZiaUFvTHlvdUxpNWhjbWR6S2k4cElIdGNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NWthWE53WVhSamFDaGNJbUZ3Y0d4NVhDSXNJRnQyYjJsa0lEQXNJR0Z5Y21GNVgzTnNhV05sS0dGeVozVnRaVzUwY3lsZEtUdGNibjA3WEc1Y2JpOHFLbHh1SUNvZ1FtbHVaSE1nZEdobElIQnliMjFwYzJWa0lHWjFibU4wYVc5dUxDQjBjbUZ1YzJadmNtMXBibWNnY21WMGRYSnVJSFpoYkhWbGN5QnBiblJ2SUdFZ1puVnNabWxzYkdWa1hHNGdLaUJ3Y205dGFYTmxJR0Z1WkNCMGFISnZkMjRnWlhKeWIzSnpJR2x1ZEc4Z1lTQnlaV3BsWTNSbFpDQnZibVV1WEc0Z0tpQkFjR0Z5WVcwZ2IySnFaV04wSUNBZ0lIQnliMjFwYzJVZ2IzSWdhVzF0WldScFlYUmxJSEpsWm1WeVpXNWpaU0JtYjNJZ2RHRnlaMlYwSUdaMWJtTjBhVzl1WEc0Z0tpQkFjR0Z5WVcwZ0xpNHVZWEpuY3lBZ0lHRnljbUY1SUc5bUlHRndjR3hwWTJGMGFXOXVJR0Z5WjNWdFpXNTBjMXh1SUNvdlhHNVJMbVppYVc1a0lEMGdablZ1WTNScGIyNGdLRzlpYW1WamRDQXZLaTR1TG1GeVozTXFMeWtnZTF4dUlDQWdJSFpoY2lCd2NtOXRhWE5sSUQwZ1VTaHZZbXBsWTNRcE8xeHVJQ0FnSUhaaGNpQmhjbWR6SUQwZ1lYSnlZWGxmYzJ4cFkyVW9ZWEpuZFcxbGJuUnpMQ0F4S1R0Y2JpQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNGdabUp2ZFc1a0tDa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdjSEp2YldselpTNWthWE53WVhSamFDaGNJbUZ3Y0d4NVhDSXNJRnRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE1zWEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjbWR6TG1OdmJtTmhkQ2hoY25KaGVWOXpiR2xqWlNoaGNtZDFiV1Z1ZEhNcEtWeHVJQ0FnSUNBZ0lDQmRLVHRjYmlBZ0lDQjlPMXh1ZlR0Y2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExtWmlhVzVrSUQwZ1puVnVZM1JwYjI0Z0tDOHFMaTR1WVhKbmN5b3ZLU0I3WEc0Z0lDQWdkbUZ5SUhCeWIyMXBjMlVnUFNCMGFHbHpPMXh1SUNBZ0lIWmhjaUJoY21keklEMGdZWEp5WVhsZmMyeHBZMlVvWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNGdabUp2ZFc1a0tDa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdjSEp2YldselpTNWthWE53WVhSamFDaGNJbUZ3Y0d4NVhDSXNJRnRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE1zWEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjbWR6TG1OdmJtTmhkQ2hoY25KaGVWOXpiR2xqWlNoaGNtZDFiV1Z1ZEhNcEtWeHVJQ0FnSUNBZ0lDQmRLVHRjYmlBZ0lDQjlPMXh1ZlR0Y2JseHVMeW9xWEc0Z0tpQlNaWEYxWlhOMGN5QjBhR1VnYm1GdFpYTWdiMllnZEdobElHOTNibVZrSUhCeWIzQmxjblJwWlhNZ2IyWWdZU0J3Y205dGFYTmxaRnh1SUNvZ2IySnFaV04wSUdsdUlHRWdablYwZFhKbElIUjFjbTR1WEc0Z0tpQkFjR0Z5WVcwZ2IySnFaV04wSUNBZ0lIQnliMjFwYzJVZ2IzSWdhVzF0WldScFlYUmxJSEpsWm1WeVpXNWpaU0JtYjNJZ2RHRnlaMlYwSUc5aWFtVmpkRnh1SUNvZ1FISmxkSFZ5YmlCd2NtOXRhWE5sSUdadmNpQjBhR1VnYTJWNWN5QnZaaUIwYUdVZ1pYWmxiblIxWVd4c2VTQnpaWFIwYkdWa0lHOWlhbVZqZEZ4dUlDb3ZYRzVSTG10bGVYTWdQU0JtZFc1amRHbHZiaUFvYjJKcVpXTjBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlGRW9iMkpxWldOMEtTNWthWE53WVhSamFDaGNJbXRsZVhOY0lpd2dXMTBwTzF4dWZUdGNibHh1VUhKdmJXbHpaUzV3Y205MGIzUjVjR1V1YTJWNWN5QTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3k1a2FYTndZWFJqYUNoY0ltdGxlWE5jSWl3Z1cxMHBPMXh1ZlR0Y2JseHVMeW9xWEc0Z0tpQlVkWEp1Y3lCaGJpQmhjbkpoZVNCdlppQndjbTl0YVhObGN5QnBiblJ2SUdFZ2NISnZiV2x6WlNCbWIzSWdZVzRnWVhKeVlYa3VJQ0JKWmlCaGJua2diMlpjYmlBcUlIUm9aU0J3Y205dGFYTmxjeUJuWlhSeklISmxhbVZqZEdWa0xDQjBhR1VnZDJodmJHVWdZWEp5WVhrZ2FYTWdjbVZxWldOMFpXUWdhVzF0WldScFlYUmxiSGt1WEc0Z0tpQkFjR0Z5WVcwZ2UwRnljbUY1S24wZ1lXNGdZWEp5WVhrZ0tHOXlJSEJ5YjIxcGMyVWdabTl5SUdGdUlHRnljbUY1S1NCdlppQjJZV3gxWlhNZ0tHOXlYRzRnS2lCd2NtOXRhWE5sY3lCbWIzSWdkbUZzZFdWektWeHVJQ29nUUhKbGRIVnlibk1nWVNCd2NtOXRhWE5sSUdadmNpQmhiaUJoY25KaGVTQnZaaUIwYUdVZ1kyOXljbVZ6Y0c5dVpHbHVaeUIyWVd4MVpYTmNiaUFxTDF4dUx5OGdRbmtnVFdGeWF5Qk5hV3hzWlhKY2JpOHZJR2gwZEhBNkx5OTNhV3RwTG1WamJXRnpZM0pwY0hRdWIzSm5MMlJ2YTNVdWNHaHdQMmxrUFhOMGNtRjNiV0Z1T21OdmJtTjFjbkpsYm1ONUpuSmxkajB4TXpBNE56YzJOVEl4STJGc2JHWjFiR1pwYkd4bFpGeHVVUzVoYkd3Z1BTQmhiR3c3WEc1bWRXNWpkR2x2YmlCaGJHd29jSEp2YldselpYTXBJSHRjYmlBZ0lDQnlaWFIxY200Z2QyaGxiaWh3Y205dGFYTmxjeXdnWm5WdVkzUnBiMjRnS0hCeWIyMXBjMlZ6S1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ3Wlc1a2FXNW5RMjkxYm5RZ1BTQXdPMXh1SUNBZ0lDQWdJQ0IyWVhJZ1pHVm1aWEp5WldRZ1BTQmtaV1psY2lncE8xeHVJQ0FnSUNBZ0lDQmhjbkpoZVY5eVpXUjFZMlVvY0hKdmJXbHpaWE1zSUdaMWJtTjBhVzl1SUNoMWJtUmxabWx1WldRc0lIQnliMjFwYzJVc0lHbHVaR1Y0S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2MyNWhjSE5vYjNRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FYTlFjbTl0YVhObEtIQnliMjFwYzJVcElDWW1YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdLSE51WVhCemFHOTBJRDBnY0hKdmJXbHpaUzVwYm5Od1pXTjBLQ2twTG5OMFlYUmxJRDA5UFNCY0ltWjFiR1pwYkd4bFpGd2lYRzRnSUNBZ0lDQWdJQ0FnSUNBcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndjbTl0YVhObGMxdHBibVJsZUYwZ1BTQnpibUZ3YzJodmRDNTJZV3gxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdLeXR3Wlc1a2FXNW5RMjkxYm5RN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2QyaGxiaWhjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NISnZiV2x6WlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdablZ1WTNScGIyNGdLSFpoYkhWbEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndjbTl0YVhObGMxdHBibVJsZUYwZ1BTQjJZV3gxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDZ3RMWEJsYm1ScGJtZERiM1Z1ZENBOVBUMGdNQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHUmxabVZ5Y21Wa0xuSmxjMjlzZG1Vb2NISnZiV2x6WlhNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtaV1psY25KbFpDNXlaV3BsWTNRc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJQ2h3Y205bmNtVnpjeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdWbVpYSnlaV1F1Ym05MGFXWjVLSHNnYVc1a1pYZzZJR2x1WkdWNExDQjJZV3gxWlRvZ2NISnZaM0psYzNNZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOUxDQjJiMmxrSURBcE8xeHVJQ0FnSUNBZ0lDQnBaaUFvY0dWdVpHbHVaME52ZFc1MElEMDlQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JrWldabGNuSmxaQzV5WlhOdmJIWmxLSEJ5YjIxcGMyVnpLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWkdWbVpYSnlaV1F1Y0hKdmJXbHpaVHRjYmlBZ0lDQjlLVHRjYm4xY2JseHVVSEp2YldselpTNXdjbTkwYjNSNWNHVXVZV3hzSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCaGJHd29kR2hwY3lrN1hHNTlPMXh1WEc0dktpcGNiaUFxSUZKbGRIVnlibk1nZEdobElHWnBjbk4wSUhKbGMyOXNkbVZrSUhCeWIyMXBjMlVnYjJZZ1lXNGdZWEp5WVhrdUlGQnlhVzl5SUhKbGFtVmpkR1ZrSUhCeWIyMXBjMlZ6SUdGeVpWeHVJQ29nYVdkdWIzSmxaQzRnSUZKbGFtVmpkSE1nYjI1c2VTQnBaaUJoYkd3Z2NISnZiV2x6WlhNZ1lYSmxJSEpsYW1WamRHVmtMbHh1SUNvZ1FIQmhjbUZ0SUh0QmNuSmhlU3A5SUdGdUlHRnljbUY1SUdOdmJuUmhhVzVwYm1jZ2RtRnNkV1Z6SUc5eUlIQnliMjFwYzJWeklHWnZjaUIyWVd4MVpYTmNiaUFxSUVCeVpYUjFjbTV6SUdFZ2NISnZiV2x6WlNCbWRXeG1hV3hzWldRZ2QybDBhQ0IwYUdVZ2RtRnNkV1VnYjJZZ2RHaGxJR1pwY25OMElISmxjMjlzZG1Wa0lIQnliMjFwYzJVc1hHNGdLaUJ2Y2lCaElISmxhbVZqZEdWa0lIQnliMjFwYzJVZ2FXWWdZV3hzSUhCeWIyMXBjMlZ6SUdGeVpTQnlaV3BsWTNSbFpDNWNiaUFxTDF4dVVTNWhibmtnUFNCaGJuazdYRzVjYm1aMWJtTjBhVzl1SUdGdWVTaHdjbTl0YVhObGN5a2dlMXh1SUNBZ0lHbG1JQ2h3Y205dGFYTmxjeTVzWlc1bmRHZ2dQVDA5SURBcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGRXVjbVZ6YjJ4MlpTZ3BPMXh1SUNBZ0lIMWNibHh1SUNBZ0lIWmhjaUJrWldabGNuSmxaQ0E5SUZFdVpHVm1aWElvS1R0Y2JpQWdJQ0IyWVhJZ2NHVnVaR2x1WjBOdmRXNTBJRDBnTUR0Y2JpQWdJQ0JoY25KaGVWOXlaV1IxWTJVb2NISnZiV2x6WlhNc0lHWjFibU4wYVc5dUlDaHdjbVYyTENCamRYSnlaVzUwTENCcGJtUmxlQ2tnZTF4dUlDQWdJQ0FnSUNCMllYSWdjSEp2YldselpTQTlJSEJ5YjIxcGMyVnpXMmx1WkdWNFhUdGNibHh1SUNBZ0lDQWdJQ0J3Wlc1a2FXNW5RMjkxYm5Rckt6dGNibHh1SUNBZ0lDQWdJQ0IzYUdWdUtIQnliMjFwYzJVc0lHOXVSblZzWm1sc2JHVmtMQ0J2YmxKbGFtVmpkR1ZrTENCdmJsQnliMmR5WlhOektUdGNiaUFnSUNBZ0lDQWdablZ1WTNScGIyNGdiMjVHZFd4bWFXeHNaV1FvY21WemRXeDBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtaV1psY25KbFpDNXlaWE52YkhabEtISmxjM1ZzZENrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdablZ1WTNScGIyNGdiMjVTWldwbFkzUmxaQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEJsYm1ScGJtZERiM1Z1ZEMwdE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIQmxibVJwYm1kRGIzVnVkQ0E5UFQwZ01Da2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1JsWm1WeWNtVmtMbkpsYW1WamRDaHVaWGNnUlhKeWIzSW9YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUZ3aVEyRnVKM1FnWjJWMElHWjFiR1pwYkd4dFpXNTBJSFpoYkhWbElHWnliMjBnWVc1NUlIQnliMjFwYzJVc0lHRnNiQ0JjSWlBclhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRndpY0hKdmJXbHpaWE1nZDJWeVpTQnlaV3BsWTNSbFpDNWNJbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2twTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUc5dVVISnZaM0psYzNNb2NISnZaM0psYzNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdSbFptVnljbVZrTG01dmRHbG1lU2g3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVc1a1pYZzZJR2x1WkdWNExGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhiSFZsT2lCd2NtOW5jbVZ6YzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0I5TENCMWJtUmxabWx1WldRcE8xeHVYRzRnSUNBZ2NtVjBkWEp1SUdSbFptVnljbVZrTG5CeWIyMXBjMlU3WEc1OVhHNWNibEJ5YjIxcGMyVXVjSEp2ZEc5MGVYQmxMbUZ1ZVNBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQnlaWFIxY200Z1lXNTVLSFJvYVhNcE8xeHVmVHRjYmx4dUx5b3FYRzRnS2lCWFlXbDBjeUJtYjNJZ1lXeHNJSEJ5YjIxcGMyVnpJSFJ2SUdKbElITmxkSFJzWldRc0lHVnBkR2hsY2lCbWRXeG1hV3hzWldRZ2IzSmNiaUFxSUhKbGFtVmpkR1ZrTGlBZ1ZHaHBjeUJwY3lCa2FYTjBhVzVqZENCbWNtOXRJR0JoYkd4Z0lITnBibU5sSUhSb1lYUWdkMjkxYkdRZ2MzUnZjRnh1SUNvZ2QyRnBkR2x1WnlCaGRDQjBhR1VnWm1seWMzUWdjbVZxWldOMGFXOXVMaUFnVkdobElIQnliMjFwYzJVZ2NtVjBkWEp1WldRZ1lubGNiaUFxSUdCaGJHeFNaWE52YkhabFpHQWdkMmxzYkNCdVpYWmxjaUJpWlNCeVpXcGxZM1JsWkM1Y2JpQXFJRUJ3WVhKaGJTQndjbTl0YVhObGN5QmhJSEJ5YjIxcGMyVWdabTl5SUdGdUlHRnljbUY1SUNodmNpQmhiaUJoY25KaGVTa2diMllnY0hKdmJXbHpaWE5jYmlBcUlDaHZjaUIyWVd4MVpYTXBYRzRnS2lCQWNtVjBkWEp1SUdFZ2NISnZiV2x6WlNCbWIzSWdZVzRnWVhKeVlYa2diMllnY0hKdmJXbHpaWE5jYmlBcUwxeHVVUzVoYkd4U1pYTnZiSFpsWkNBOUlHUmxjSEpsWTJGMFpTaGhiR3hTWlhOdmJIWmxaQ3dnWENKaGJHeFNaWE52YkhabFpGd2lMQ0JjSW1Gc2JGTmxkSFJzWldSY0lpazdYRzVtZFc1amRHbHZiaUJoYkd4U1pYTnZiSFpsWkNod2NtOXRhWE5sY3lrZ2UxeHVJQ0FnSUhKbGRIVnliaUIzYUdWdUtIQnliMjFwYzJWekxDQm1kVzVqZEdsdmJpQW9jSEp2YldselpYTXBJSHRjYmlBZ0lDQWdJQ0FnY0hKdmJXbHpaWE1nUFNCaGNuSmhlVjl0WVhBb2NISnZiV2x6WlhNc0lGRXBPMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkMmhsYmloaGJHd29ZWEp5WVhsZmJXRndLSEJ5YjIxcGMyVnpMQ0JtZFc1amRHbHZiaUFvY0hKdmJXbHpaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIZG9aVzRvY0hKdmJXbHpaU3dnYm05dmNDd2dibTl2Y0NrN1hHNGdJQ0FnSUNBZ0lIMHBLU3dnWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEJ5YjIxcGMyVnpPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5S1R0Y2JuMWNibHh1VUhKdmJXbHpaUzV3Y205MGIzUjVjR1V1WVd4c1VtVnpiMngyWldRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdjbVYwZFhKdUlHRnNiRkpsYzI5c2RtVmtLSFJvYVhNcE8xeHVmVHRjYmx4dUx5b3FYRzRnS2lCQWMyVmxJRkJ5YjIxcGMyVWpZV3hzVTJWMGRHeGxaRnh1SUNvdlhHNVJMbUZzYkZObGRIUnNaV1FnUFNCaGJHeFRaWFIwYkdWa08xeHVablZ1WTNScGIyNGdZV3hzVTJWMGRHeGxaQ2h3Y205dGFYTmxjeWtnZTF4dUlDQWdJSEpsZEhWeWJpQlJLSEJ5YjIxcGMyVnpLUzVoYkd4VFpYUjBiR1ZrS0NrN1hHNTlYRzVjYmk4cUtseHVJQ29nVkhWeWJuTWdZVzRnWVhKeVlYa2diMllnY0hKdmJXbHpaWE1nYVc1MGJ5QmhJSEJ5YjIxcGMyVWdabTl5SUdGdUlHRnljbUY1SUc5bUlIUm9aV2x5SUhOMFlYUmxjeUFvWVhOY2JpQXFJSEpsZEhWeWJtVmtJR0o1SUdCcGJuTndaV04wWUNrZ2QyaGxiaUIwYUdWNUlHaGhkbVVnWVd4c0lITmxkSFJzWldRdVhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNVcwRnVlU3BkZlNCMllXeDFaWE1nWVc0Z1lYSnlZWGtnS0c5eUlIQnliMjFwYzJVZ1ptOXlJR0Z1SUdGeWNtRjVLU0J2WmlCMllXeDFaWE1nS0c5eVhHNGdLaUJ3Y205dGFYTmxjeUJtYjNJZ2RtRnNkV1Z6S1Z4dUlDb2dRSEpsZEhWeWJuTWdlMEZ5Y21GNVcxTjBZWFJsWFgwZ1lXNGdZWEp5WVhrZ2IyWWdjM1JoZEdWeklHWnZjaUIwYUdVZ2NtVnpjR1ZqZEdsMlpTQjJZV3gxWlhNdVhHNGdLaTljYmxCeWIyMXBjMlV1Y0hKdmRHOTBlWEJsTG1Gc2JGTmxkSFJzWldRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdjbVYwZFhKdUlIUm9hWE11ZEdobGJpaG1kVzVqZEdsdmJpQW9jSEp2YldselpYTXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR0ZzYkNoaGNuSmhlVjl0WVhBb2NISnZiV2x6WlhNc0lHWjFibU4wYVc5dUlDaHdjbTl0YVhObEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCd2NtOXRhWE5sSUQwZ1VTaHdjbTl0YVhObEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUhKbFoyRnlaR3hsYzNNb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIQnliMjFwYzJVdWFXNXpjR1ZqZENncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIQnliMjFwYzJVdWRHaGxiaWh5WldkaGNtUnNaWE56TENCeVpXZGhjbVJzWlhOektUdGNiaUFnSUNBZ0lDQWdmU2twTzF4dUlDQWdJSDBwTzF4dWZUdGNibHh1THlvcVhHNGdLaUJEWVhCMGRYSmxjeUIwYUdVZ1ptRnBiSFZ5WlNCdlppQmhJSEJ5YjIxcGMyVXNJR2RwZG1sdVp5QmhiaUJ2Y0c5eWRIVnVhWFI1SUhSdklISmxZMjkyWlhKY2JpQXFJSGRwZEdnZ1lTQmpZV3hzWW1GamF5NGdJRWxtSUhSb1pTQm5hWFpsYmlCd2NtOXRhWE5sSUdseklHWjFiR1pwYkd4bFpDd2dkR2hsSUhKbGRIVnlibVZrWEc0Z0tpQndjbTl0YVhObElHbHpJR1oxYkdacGJHeGxaQzVjYmlBcUlFQndZWEpoYlNCN1FXNTVLbjBnY0hKdmJXbHpaU0JtYjNJZ2MyOXRaWFJvYVc1blhHNGdLaUJBY0dGeVlXMGdlMFoxYm1OMGFXOXVmU0JqWVd4c1ltRmpheUIwYnlCbWRXeG1hV3hzSUhSb1pTQnlaWFIxY201bFpDQndjbTl0YVhObElHbG1JSFJvWlZ4dUlDb2daMmwyWlc0Z2NISnZiV2x6WlNCcGN5QnlaV3BsWTNSbFpGeHVJQ29nUUhKbGRIVnlibk1nWVNCd2NtOXRhWE5sSUdadmNpQjBhR1VnY21WMGRYSnVJSFpoYkhWbElHOW1JSFJvWlNCallXeHNZbUZqYTF4dUlDb3ZYRzVSTG1aaGFXd2dQU0F2THlCWVdGZ2diR1ZuWVdONVhHNVJXMXdpWTJGMFkyaGNJbDBnUFNCbWRXNWpkR2x2YmlBb2IySnFaV04wTENCeVpXcGxZM1JsWkNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJSS0c5aWFtVmpkQ2t1ZEdobGJpaDJiMmxrSURBc0lISmxhbVZqZEdWa0tUdGNibjA3WEc1Y2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExtWmhhV3dnUFNBdkx5QllXRmdnYkdWbllXTjVYRzVRY205dGFYTmxMbkJ5YjNSdmRIbHdaVnRjSW1OaGRHTm9YQ0pkSUQwZ1puVnVZM1JwYjI0Z0tISmxhbVZqZEdWa0tTQjdYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVkR2hsYmloMmIybGtJREFzSUhKbGFtVmpkR1ZrS1R0Y2JuMDdYRzVjYmk4cUtseHVJQ29nUVhSMFlXTm9aWE1nWVNCc2FYTjBaVzVsY2lCMGFHRjBJR05oYmlCeVpYTndiMjVrSUhSdklIQnliMmR5WlhOeklHNXZkR2xtYVdOaGRHbHZibk1nWm5KdmJTQmhYRzRnS2lCd2NtOXRhWE5sSjNNZ2IzSnBaMmx1WVhScGJtY2daR1ZtWlhKeVpXUXVJRlJvYVhNZ2JHbHpkR1Z1WlhJZ2NtVmpaV2wyWlhNZ2RHaGxJR1Y0WVdOMElHRnlaM1Z0Wlc1MGMxeHVJQ29nY0dGemMyVmtJSFJ2SUdCZ1pHVm1aWEp5WldRdWJtOTBhV1o1WUdBdVhHNGdLaUJBY0dGeVlXMGdlMEZ1ZVNwOUlIQnliMjFwYzJVZ1ptOXlJSE52YldWMGFHbHVaMXh1SUNvZ1FIQmhjbUZ0SUh0R2RXNWpkR2x2Ym4wZ1kyRnNiR0poWTJzZ2RHOGdjbVZqWldsMlpTQmhibmtnY0hKdlozSmxjM01nYm05MGFXWnBZMkYwYVc5dWMxeHVJQ29nUUhKbGRIVnlibk1nZEdobElHZHBkbVZ1SUhCeWIyMXBjMlVzSUhWdVkyaGhibWRsWkZ4dUlDb3ZYRzVSTG5CeWIyZHlaWE56SUQwZ2NISnZaM0psYzNNN1hHNW1kVzVqZEdsdmJpQndjbTluY21WemN5aHZZbXBsWTNRc0lIQnliMmR5WlhOelpXUXBJSHRjYmlBZ0lDQnlaWFIxY200Z1VTaHZZbXBsWTNRcExuUm9aVzRvZG05cFpDQXdMQ0IyYjJsa0lEQXNJSEJ5YjJkeVpYTnpaV1FwTzF4dWZWeHVYRzVRY205dGFYTmxMbkJ5YjNSdmRIbHdaUzV3Y205bmNtVnpjeUE5SUdaMWJtTjBhVzl1SUNod2NtOW5jbVZ6YzJWa0tTQjdYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVkR2hsYmloMmIybGtJREFzSUhadmFXUWdNQ3dnY0hKdlozSmxjM05sWkNrN1hHNTlPMXh1WEc0dktpcGNiaUFxSUZCeWIzWnBaR1Z6SUdGdUlHOXdjRzl5ZEhWdWFYUjVJSFJ2SUc5aWMyVnlkbVVnZEdobElITmxkSFJzYVc1bklHOW1JR0VnY0hKdmJXbHpaU3hjYmlBcUlISmxaMkZ5Wkd4bGMzTWdiMllnZDJobGRHaGxjaUIwYUdVZ2NISnZiV2x6WlNCcGN5Qm1kV3htYVd4c1pXUWdiM0lnY21WcVpXTjBaV1F1SUNCR2IzSjNZWEprYzF4dUlDb2dkR2hsSUhKbGMyOXNkWFJwYjI0Z2RHOGdkR2hsSUhKbGRIVnlibVZrSUhCeWIyMXBjMlVnZDJobGJpQjBhR1VnWTJGc2JHSmhZMnNnYVhNZ1pHOXVaUzVjYmlBcUlGUm9aU0JqWVd4c1ltRmpheUJqWVc0Z2NtVjBkWEp1SUdFZ2NISnZiV2x6WlNCMGJ5QmtaV1psY2lCamIyMXdiR1YwYVc5dUxseHVJQ29nUUhCaGNtRnRJSHRCYm5rcWZTQndjbTl0YVhObFhHNGdLaUJBY0dGeVlXMGdlMFoxYm1OMGFXOXVmU0JqWVd4c1ltRmpheUIwYnlCdlluTmxjblpsSUhSb1pTQnlaWE52YkhWMGFXOXVJRzltSUhSb1pTQm5hWFpsYmx4dUlDb2djSEp2YldselpTd2dkR0ZyWlhNZ2JtOGdZWEpuZFcxbGJuUnpMbHh1SUNvZ1FISmxkSFZ5Ym5NZ1lTQndjbTl0YVhObElHWnZjaUIwYUdVZ2NtVnpiMngxZEdsdmJpQnZaaUIwYUdVZ1oybDJaVzRnY0hKdmJXbHpaU0IzYUdWdVhHNGdLaUJnWUdacGJtQmdJR2x6SUdSdmJtVXVYRzRnS2k5Y2JsRXVabWx1SUQwZ0x5OGdXRmhZSUd4bFoyRmplVnh1VVZ0Y0ltWnBibUZzYkhsY0lsMGdQU0JtZFc1amRHbHZiaUFvYjJKcVpXTjBMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJSEpsZEhWeWJpQlJLRzlpYW1WamRDbGJYQ0ptYVc1aGJHeDVYQ0pkS0dOaGJHeGlZV05yS1R0Y2JuMDdYRzVjYmxCeWIyMXBjMlV1Y0hKdmRHOTBlWEJsTG1acGJpQTlJQzh2SUZoWVdDQnNaV2RoWTNsY2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbFcxd2labWx1WVd4c2VWd2lYU0E5SUdaMWJtTjBhVzl1SUNoallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUdOaGJHeGlZV05ySUQwZ1VTaGpZV3hzWW1GamF5azdYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVkR2hsYmlobWRXNWpkR2x2YmlBb2RtRnNkV1VwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yTG1aallXeHNLQ2t1ZEdobGJpaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2RtRnNkV1U3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgwc0lHWjFibU4wYVc5dUlDaHlaV0Z6YjI0cElIdGNiaUFnSUNBZ0lDQWdMeThnVkU5RVR5QmhkSFJsYlhCMElIUnZJSEpsWTNsamJHVWdkR2hsSUhKbGFtVmpkR2x2YmlCM2FYUm9JRndpZEdocGMxd2lMbHh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc3VabU5oYkd3b0tTNTBhR1Z1S0daMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJSEpsWVhOdmJqdGNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdmU2s3WEc1OU8xeHVYRzR2S2lwY2JpQXFJRlJsY20xcGJtRjBaWE1nWVNCamFHRnBiaUJ2WmlCd2NtOXRhWE5sY3l3Z1ptOXlZMmx1WnlCeVpXcGxZM1JwYjI1eklIUnZJR0psWEc0Z0tpQjBhSEp2ZDI0Z1lYTWdaWGhqWlhCMGFXOXVjeTVjYmlBcUlFQndZWEpoYlNCN1FXNTVLbjBnY0hKdmJXbHpaU0JoZENCMGFHVWdaVzVrSUc5bUlHRWdZMmhoYVc0Z2IyWWdjSEp2YldselpYTmNiaUFxSUVCeVpYUjFjbTV6SUc1dmRHaHBibWRjYmlBcUwxeHVVUzVrYjI1bElEMGdablZ1WTNScGIyNGdLRzlpYW1WamRDd2dablZzWm1sc2JHVmtMQ0J5WldwbFkzUmxaQ3dnY0hKdlozSmxjM01wSUh0Y2JpQWdJQ0J5WlhSMWNtNGdVU2h2WW1wbFkzUXBMbVJ2Ym1Vb1puVnNabWxzYkdWa0xDQnlaV3BsWTNSbFpDd2djSEp2WjNKbGMzTXBPMXh1ZlR0Y2JseHVVSEp2YldselpTNXdjbTkwYjNSNWNHVXVaRzl1WlNBOUlHWjFibU4wYVc5dUlDaG1kV3htYVd4c1pXUXNJSEpsYW1WamRHVmtMQ0J3Y205bmNtVnpjeWtnZTF4dUlDQWdJSFpoY2lCdmJsVnVhR0Z1Wkd4bFpFVnljbTl5SUQwZ1puVnVZM1JwYjI0Z0tHVnljbTl5S1NCN1hHNGdJQ0FnSUNBZ0lDOHZJR1p2Y25kaGNtUWdkRzhnWVNCbWRYUjFjbVVnZEhWeWJpQnpieUIwYUdGMElHQmdkMmhsYm1CZ1hHNGdJQ0FnSUNBZ0lDOHZJR1J2WlhNZ2JtOTBJR05oZEdOb0lHbDBJR0Z1WkNCMGRYSnVJR2wwSUdsdWRHOGdZU0J5WldwbFkzUnBiMjR1WEc0Z0lDQWdJQ0FnSUZFdWJtVjRkRlJwWTJzb1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JXRnJaVk4wWVdOclZISmhZMlZNYjI1bktHVnljbTl5TENCd2NtOXRhWE5sS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoUkxtOXVaWEp5YjNJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQlJMbTl1WlhKeWIzSW9aWEp5YjNJcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUhKdmR5Qmxjbkp2Y2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUM4dklFRjJiMmxrSUhWdWJtVmpaWE56WVhKNUlHQnVaWGgwVkdsamEyQnBibWNnZG1saElHRnVJSFZ1Ym1WalpYTnpZWEo1SUdCM2FHVnVZQzVjYmlBZ0lDQjJZWElnY0hKdmJXbHpaU0E5SUdaMWJHWnBiR3hsWkNCOGZDQnlaV3BsWTNSbFpDQjhmQ0J3Y205bmNtVnpjeUEvWEc0Z0lDQWdJQ0FnSUhSb2FYTXVkR2hsYmlobWRXeG1hV3hzWldRc0lISmxhbVZqZEdWa0xDQndjbTluY21WemN5a2dPbHh1SUNBZ0lDQWdJQ0IwYUdsek8xeHVYRzRnSUNBZ2FXWWdLSFI1Y0dWdlppQndjbTlqWlhOeklEMDlQU0JjSW05aWFtVmpkRndpSUNZbUlIQnliMk5sYzNNZ0ppWWdjSEp2WTJWemN5NWtiMjFoYVc0cElIdGNiaUFnSUNBZ0lDQWdiMjVWYm1oaGJtUnNaV1JGY25KdmNpQTlJSEJ5YjJObGMzTXVaRzl0WVdsdUxtSnBibVFvYjI1VmJtaGhibVJzWldSRmNuSnZjaWs3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdjSEp2YldselpTNTBhR1Z1S0hadmFXUWdNQ3dnYjI1VmJtaGhibVJzWldSRmNuSnZjaWs3WEc1OU8xeHVYRzR2S2lwY2JpQXFJRU5oZFhObGN5QmhJSEJ5YjIxcGMyVWdkRzhnWW1VZ2NtVnFaV04wWldRZ2FXWWdhWFFnWkc5bGN5QnViM1FnWjJWMElHWjFiR1pwYkd4bFpDQmlaV1p2Y21WY2JpQXFJSE52YldVZ2JXbHNiR2x6WldOdmJtUnpJSFJwYldVZ2IzVjBMbHh1SUNvZ1FIQmhjbUZ0SUh0QmJua3FmU0J3Y205dGFYTmxYRzRnS2lCQWNHRnlZVzBnZTA1MWJXSmxjbjBnYldsc2JHbHpaV052Ym1SeklIUnBiV1Z2ZFhSY2JpQXFJRUJ3WVhKaGJTQjdRVzU1S24wZ1kzVnpkRzl0SUdWeWNtOXlJRzFsYzNOaFoyVWdiM0lnUlhKeWIzSWdiMkpxWldOMElDaHZjSFJwYjI1aGJDbGNiaUFxSUVCeVpYUjFjbTV6SUdFZ2NISnZiV2x6WlNCbWIzSWdkR2hsSUhKbGMyOXNkWFJwYjI0Z2IyWWdkR2hsSUdkcGRtVnVJSEJ5YjIxcGMyVWdhV1lnYVhRZ2FYTmNiaUFxSUdaMWJHWnBiR3hsWkNCaVpXWnZjbVVnZEdobElIUnBiV1Z2ZFhRc0lHOTBhR1Z5ZDJselpTQnlaV3BsWTNSbFpDNWNiaUFxTDF4dVVTNTBhVzFsYjNWMElEMGdablZ1WTNScGIyNGdLRzlpYW1WamRDd2diWE1zSUdWeWNtOXlLU0I3WEc0Z0lDQWdjbVYwZFhKdUlGRW9iMkpxWldOMEtTNTBhVzFsYjNWMEtHMXpMQ0JsY25KdmNpazdYRzU5TzF4dVhHNVFjbTl0YVhObExuQnliM1J2ZEhsd1pTNTBhVzFsYjNWMElEMGdablZ1WTNScGIyNGdLRzF6TENCbGNuSnZjaWtnZTF4dUlDQWdJSFpoY2lCa1pXWmxjbkpsWkNBOUlHUmxabVZ5S0NrN1hHNGdJQ0FnZG1GeUlIUnBiV1Z2ZFhSSlpDQTlJSE5sZEZScGJXVnZkWFFvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvSVdWeWNtOXlJSHg4SUZ3aWMzUnlhVzVuWENJZ1BUMDlJSFI1Y0dWdlppQmxjbkp2Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWlhKeWIzSWdQU0J1WlhjZ1JYSnliM0lvWlhKeWIzSWdmSHdnWENKVWFXMWxaQ0J2ZFhRZ1lXWjBaWElnWENJZ0t5QnRjeUFySUZ3aUlHMXpYQ0lwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdaWEp5YjNJdVkyOWtaU0E5SUZ3aVJWUkpUVVZFVDFWVVhDSTdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnWkdWbVpYSnlaV1F1Y21WcVpXTjBLR1Z5Y205eUtUdGNiaUFnSUNCOUxDQnRjeWs3WEc1Y2JpQWdJQ0IwYUdsekxuUm9aVzRvWm5WdVkzUnBiMjRnS0haaGJIVmxLU0I3WEc0Z0lDQWdJQ0FnSUdOc1pXRnlWR2x0Wlc5MWRDaDBhVzFsYjNWMFNXUXBPMXh1SUNBZ0lDQWdJQ0JrWldabGNuSmxaQzV5WlhOdmJIWmxLSFpoYkhWbEtUdGNiaUFnSUNCOUxDQm1kVzVqZEdsdmJpQW9aWGhqWlhCMGFXOXVLU0I3WEc0Z0lDQWdJQ0FnSUdOc1pXRnlWR2x0Wlc5MWRDaDBhVzFsYjNWMFNXUXBPMXh1SUNBZ0lDQWdJQ0JrWldabGNuSmxaQzV5WldwbFkzUW9aWGhqWlhCMGFXOXVLVHRjYmlBZ0lDQjlMQ0JrWldabGNuSmxaQzV1YjNScFpua3BPMXh1WEc0Z0lDQWdjbVYwZFhKdUlHUmxabVZ5Y21Wa0xuQnliMjFwYzJVN1hHNTlPMXh1WEc0dktpcGNiaUFxSUZKbGRIVnlibk1nWVNCd2NtOXRhWE5sSUdadmNpQjBhR1VnWjJsMlpXNGdkbUZzZFdVZ0tHOXlJSEJ5YjIxcGMyVmtJSFpoYkhWbEtTd2djMjl0WlZ4dUlDb2diV2xzYkdselpXTnZibVJ6SUdGbWRHVnlJR2wwSUhKbGMyOXNkbVZrTGlCUVlYTnpaWE1nY21WcVpXTjBhVzl1Y3lCcGJXMWxaR2xoZEdWc2VTNWNiaUFxSUVCd1lYSmhiU0I3UVc1NUtuMGdjSEp2YldselpWeHVJQ29nUUhCaGNtRnRJSHRPZFcxaVpYSjlJRzFwYkd4cGMyVmpiMjVrYzF4dUlDb2dRSEpsZEhWeWJuTWdZU0J3Y205dGFYTmxJR1p2Y2lCMGFHVWdjbVZ6YjJ4MWRHbHZiaUJ2WmlCMGFHVWdaMmwyWlc0Z2NISnZiV2x6WlNCaFpuUmxjaUJ0YVd4c2FYTmxZMjl1WkhOY2JpQXFJSFJwYldVZ2FHRnpJR1ZzWVhCelpXUWdjMmx1WTJVZ2RHaGxJSEpsYzI5c2RYUnBiMjRnYjJZZ2RHaGxJR2RwZG1WdUlIQnliMjFwYzJVdVhHNGdLaUJKWmlCMGFHVWdaMmwyWlc0Z2NISnZiV2x6WlNCeVpXcGxZM1J6TENCMGFHRjBJR2x6SUhCaGMzTmxaQ0JwYlcxbFpHbGhkR1ZzZVM1Y2JpQXFMMXh1VVM1a1pXeGhlU0E5SUdaMWJtTjBhVzl1SUNodlltcGxZM1FzSUhScGJXVnZkWFFwSUh0Y2JpQWdJQ0JwWmlBb2RHbHRaVzkxZENBOVBUMGdkbTlwWkNBd0tTQjdYRzRnSUNBZ0lDQWdJSFJwYldWdmRYUWdQU0J2WW1wbFkzUTdYRzRnSUNBZ0lDQWdJRzlpYW1WamRDQTlJSFp2YVdRZ01EdGNiaUFnSUNCOVhHNGdJQ0FnY21WMGRYSnVJRkVvYjJKcVpXTjBLUzVrWld4aGVTaDBhVzFsYjNWMEtUdGNibjA3WEc1Y2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExtUmxiR0Y1SUQwZ1puVnVZM1JwYjI0Z0tIUnBiV1Z2ZFhRcElIdGNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NTBhR1Z1S0daMWJtTjBhVzl1SUNoMllXeDFaU2tnZTF4dUlDQWdJQ0FnSUNCMllYSWdaR1ZtWlhKeVpXUWdQU0JrWldabGNpZ3BPMXh1SUNBZ0lDQWdJQ0J6WlhSVWFXMWxiM1YwS0daMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdSbFptVnljbVZrTG5KbGMyOXNkbVVvZG1Gc2RXVXBPMXh1SUNBZ0lDQWdJQ0I5TENCMGFXMWxiM1YwS1R0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdSbFptVnljbVZrTG5CeWIyMXBjMlU3WEc0Z0lDQWdmU2s3WEc1OU8xeHVYRzR2S2lwY2JpQXFJRkJoYzNObGN5QmhJR052Ym5ScGJuVmhkR2x2YmlCMGJ5QmhJRTV2WkdVZ1puVnVZM1JwYjI0c0lIZG9hV05vSUdseklHTmhiR3hsWkNCM2FYUm9JSFJvWlNCbmFYWmxibHh1SUNvZ1lYSm5kVzFsYm5SeklIQnliM1pwWkdWa0lHRnpJR0Z1SUdGeWNtRjVMQ0JoYm1RZ2NtVjBkWEp1Y3lCaElIQnliMjFwYzJVdVhHNGdLbHh1SUNvZ0lDQWdJQ0JSTG01bVlYQndiSGtvUmxNdWNtVmhaRVpwYkdVc0lGdGZYMlpwYkdWdVlXMWxYU2xjYmlBcUlDQWdJQ0FnTG5Sb1pXNG9ablZ1WTNScGIyNGdLR052Ym5SbGJuUXBJSHRjYmlBcUlDQWdJQ0FnZlNsY2JpQXFYRzRnS2k5Y2JsRXVibVpoY0hCc2VTQTlJR1oxYm1OMGFXOXVJQ2hqWVd4c1ltRmpheXdnWVhKbmN5a2dlMXh1SUNBZ0lISmxkSFZ5YmlCUktHTmhiR3hpWVdOcktTNXVabUZ3Y0d4NUtHRnlaM01wTzF4dWZUdGNibHh1VUhKdmJXbHpaUzV3Y205MGIzUjVjR1V1Ym1aaGNIQnNlU0E5SUdaMWJtTjBhVzl1SUNoaGNtZHpLU0I3WEc0Z0lDQWdkbUZ5SUdSbFptVnljbVZrSUQwZ1pHVm1aWElvS1R0Y2JpQWdJQ0IyWVhJZ2JtOWtaVUZ5WjNNZ1BTQmhjbkpoZVY5emJHbGpaU2hoY21kektUdGNiaUFnSUNCdWIyUmxRWEpuY3k1d2RYTm9LR1JsWm1WeWNtVmtMbTFoYTJWT2IyUmxVbVZ6YjJ4MlpYSW9LU2s3WEc0Z0lDQWdkR2hwY3k1bVlYQndiSGtvYm05a1pVRnlaM01wTG1aaGFXd29aR1ZtWlhKeVpXUXVjbVZxWldOMEtUdGNiaUFnSUNCeVpYUjFjbTRnWkdWbVpYSnlaV1F1Y0hKdmJXbHpaVHRjYm4wN1hHNWNiaThxS2x4dUlDb2dVR0Z6YzJWeklHRWdZMjl1ZEdsdWRXRjBhVzl1SUhSdklHRWdUbTlrWlNCbWRXNWpkR2x2Yml3Z2QyaHBZMmdnYVhNZ1kyRnNiR1ZrSUhkcGRHZ2dkR2hsSUdkcGRtVnVYRzRnS2lCaGNtZDFiV1Z1ZEhNZ2NISnZkbWxrWldRZ2FXNWthWFpwWkhWaGJHeDVMQ0JoYm1RZ2NtVjBkWEp1Y3lCaElIQnliMjFwYzJVdVhHNGdLaUJBWlhoaGJYQnNaVnh1SUNvZ1VTNXVabU5oYkd3b1JsTXVjbVZoWkVacGJHVXNJRjlmWm1sc1pXNWhiV1VwWEc0Z0tpQXVkR2hsYmlobWRXNWpkR2x2YmlBb1kyOXVkR1Z1ZENrZ2UxeHVJQ29nZlNsY2JpQXFYRzRnS2k5Y2JsRXVibVpqWVd4c0lEMGdablZ1WTNScGIyNGdLR05oYkd4aVlXTnJJQzhxTGk0dVlYSm5jeW92S1NCN1hHNGdJQ0FnZG1GeUlHRnlaM01nUFNCaGNuSmhlVjl6YkdsalpTaGhjbWQxYldWdWRITXNJREVwTzF4dUlDQWdJSEpsZEhWeWJpQlJLR05oYkd4aVlXTnJLUzV1Wm1Gd2NHeDVLR0Z5WjNNcE8xeHVmVHRjYmx4dVVISnZiV2x6WlM1d2NtOTBiM1I1Y0dVdWJtWmpZV3hzSUQwZ1puVnVZM1JwYjI0Z0tDOHFMaTR1WVhKbmN5b3ZLU0I3WEc0Z0lDQWdkbUZ5SUc1dlpHVkJjbWR6SUQwZ1lYSnlZWGxmYzJ4cFkyVW9ZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQjJZWElnWkdWbVpYSnlaV1FnUFNCa1pXWmxjaWdwTzF4dUlDQWdJRzV2WkdWQmNtZHpMbkIxYzJnb1pHVm1aWEp5WldRdWJXRnJaVTV2WkdWU1pYTnZiSFpsY2lncEtUdGNiaUFnSUNCMGFHbHpMbVpoY0hCc2VTaHViMlJsUVhKbmN5a3VabUZwYkNoa1pXWmxjbkpsWkM1eVpXcGxZM1FwTzF4dUlDQWdJSEpsZEhWeWJpQmtaV1psY25KbFpDNXdjbTl0YVhObE8xeHVmVHRjYmx4dUx5b3FYRzRnS2lCWGNtRndjeUJoSUU1dlpHVktVeUJqYjI1MGFXNTFZWFJwYjI0Z2NHRnpjMmx1WnlCbWRXNWpkR2x2YmlCaGJtUWdjbVYwZFhKdWN5QmhiaUJsY1hWcGRtRnNaVzUwWEc0Z0tpQjJaWEp6YVc5dUlIUm9ZWFFnY21WMGRYSnVjeUJoSUhCeWIyMXBjMlV1WEc0Z0tpQkFaWGhoYlhCc1pWeHVJQ29nVVM1dVptSnBibVFvUmxNdWNtVmhaRVpwYkdVc0lGOWZabWxzWlc1aGJXVXBLRndpZFhSbUxUaGNJaWxjYmlBcUlDNTBhR1Z1S0dOdmJuTnZiR1V1Ykc5bktWeHVJQ29nTG1SdmJtVW9LVnh1SUNvdlhHNVJMbTVtWW1sdVpDQTlYRzVSTG1SbGJtOWtaV2xtZVNBOUlHWjFibU4wYVc5dUlDaGpZV3hzWW1GamF5QXZLaTR1TG1GeVozTXFMeWtnZTF4dUlDQWdJSFpoY2lCaVlYTmxRWEpuY3lBOUlHRnljbUY1WDNOc2FXTmxLR0Z5WjNWdFpXNTBjeXdnTVNrN1hHNGdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJRzV2WkdWQmNtZHpJRDBnWW1GelpVRnlaM011WTI5dVkyRjBLR0Z5Y21GNVgzTnNhV05sS0dGeVozVnRaVzUwY3lrcE8xeHVJQ0FnSUNBZ0lDQjJZWElnWkdWbVpYSnlaV1FnUFNCa1pXWmxjaWdwTzF4dUlDQWdJQ0FnSUNCdWIyUmxRWEpuY3k1d2RYTm9LR1JsWm1WeWNtVmtMbTFoYTJWT2IyUmxVbVZ6YjJ4MlpYSW9LU2s3WEc0Z0lDQWdJQ0FnSUZFb1kyRnNiR0poWTJzcExtWmhjSEJzZVNodWIyUmxRWEpuY3lrdVptRnBiQ2hrWldabGNuSmxaQzV5WldwbFkzUXBPMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdaR1ZtWlhKeVpXUXVjSEp2YldselpUdGNiaUFnSUNCOU8xeHVmVHRjYmx4dVVISnZiV2x6WlM1d2NtOTBiM1I1Y0dVdWJtWmlhVzVrSUQxY2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExtUmxibTlrWldsbWVTQTlJR1oxYm1OMGFXOXVJQ2d2S2k0dUxtRnlaM01xTHlrZ2UxeHVJQ0FnSUhaaGNpQmhjbWR6SUQwZ1lYSnlZWGxmYzJ4cFkyVW9ZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQmhjbWR6TG5WdWMyaHBablFvZEdocGN5azdYRzRnSUNBZ2NtVjBkWEp1SUZFdVpHVnViMlJsYVdaNUxtRndjR3g1S0hadmFXUWdNQ3dnWVhKbmN5azdYRzU5TzF4dVhHNVJMbTVpYVc1a0lEMGdablZ1WTNScGIyNGdLR05oYkd4aVlXTnJMQ0IwYUdsemNDQXZLaTR1TG1GeVozTXFMeWtnZTF4dUlDQWdJSFpoY2lCaVlYTmxRWEpuY3lBOUlHRnljbUY1WDNOc2FXTmxLR0Z5WjNWdFpXNTBjeXdnTWlrN1hHNGdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJRzV2WkdWQmNtZHpJRDBnWW1GelpVRnlaM011WTI5dVkyRjBLR0Z5Y21GNVgzTnNhV05sS0dGeVozVnRaVzUwY3lrcE8xeHVJQ0FnSUNBZ0lDQjJZWElnWkdWbVpYSnlaV1FnUFNCa1pXWmxjaWdwTzF4dUlDQWdJQ0FnSUNCdWIyUmxRWEpuY3k1d2RYTm9LR1JsWm1WeWNtVmtMbTFoYTJWT2IyUmxVbVZ6YjJ4MlpYSW9LU2s3WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUdKdmRXNWtLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOckxtRndjR3g1S0hSb2FYTndMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lGRW9ZbTkxYm1RcExtWmhjSEJzZVNodWIyUmxRWEpuY3lrdVptRnBiQ2hrWldabGNuSmxaQzV5WldwbFkzUXBPMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdaR1ZtWlhKeVpXUXVjSEp2YldselpUdGNiaUFnSUNCOU8xeHVmVHRjYmx4dVVISnZiV2x6WlM1d2NtOTBiM1I1Y0dVdWJtSnBibVFnUFNCbWRXNWpkR2x2YmlBb0x5cDBhR2x6Y0N3Z0xpNHVZWEpuY3lvdktTQjdYRzRnSUNBZ2RtRnlJR0Z5WjNNZ1BTQmhjbkpoZVY5emJHbGpaU2hoY21kMWJXVnVkSE1zSURBcE8xeHVJQ0FnSUdGeVozTXVkVzV6YUdsbWRDaDBhR2x6S1R0Y2JpQWdJQ0J5WlhSMWNtNGdVUzV1WW1sdVpDNWhjSEJzZVNoMmIybGtJREFzSUdGeVozTXBPMXh1ZlR0Y2JseHVMeW9xWEc0Z0tpQkRZV3hzY3lCaElHMWxkR2h2WkNCdlppQmhJRTV2WkdVdGMzUjViR1VnYjJKcVpXTjBJSFJvWVhRZ1lXTmpaWEIwY3lCaElFNXZaR1V0YzNSNWJHVmNiaUFxSUdOaGJHeGlZV05ySUhkcGRHZ2dZU0JuYVhabGJpQmhjbkpoZVNCdlppQmhjbWQxYldWdWRITXNJSEJzZFhNZ1lTQndjbTkyYVdSbFpDQmpZV3hzWW1GamF5NWNiaUFxSUVCd1lYSmhiU0J2WW1wbFkzUWdZVzRnYjJKcVpXTjBJSFJvWVhRZ2FHRnpJSFJvWlNCdVlXMWxaQ0J0WlhSb2IyUmNiaUFxSUVCd1lYSmhiU0I3VTNSeWFXNW5mU0J1WVcxbElHNWhiV1VnYjJZZ2RHaGxJRzFsZEdodlpDQnZaaUJ2WW1wbFkzUmNiaUFxSUVCd1lYSmhiU0I3UVhKeVlYbDlJR0Z5WjNNZ1lYSm5kVzFsYm5SeklIUnZJSEJoYzNNZ2RHOGdkR2hsSUcxbGRHaHZaRHNnZEdobElHTmhiR3hpWVdOclhHNGdLaUIzYVd4c0lHSmxJSEJ5YjNacFpHVmtJR0o1SUZFZ1lXNWtJR0Z3Y0dWdVpHVmtJSFJ2SUhSb1pYTmxJR0Z5WjNWdFpXNTBjeTVjYmlBcUlFQnlaWFIxY201eklHRWdjSEp2YldselpTQm1iM0lnZEdobElIWmhiSFZsSUc5eUlHVnljbTl5WEc0Z0tpOWNibEV1Ym0xaGNIQnNlU0E5SUM4dklGaFlXQ0JCY3lCd2NtOXdiM05sWkNCaWVTQmNJbEpsWkhOaGJtUnliMXdpWEc1UkxtNXdiM04wSUQwZ1puVnVZM1JwYjI0Z0tHOWlhbVZqZEN3Z2JtRnRaU3dnWVhKbmN5a2dlMXh1SUNBZ0lISmxkSFZ5YmlCUktHOWlhbVZqZENrdWJuQnZjM1FvYm1GdFpTd2dZWEpuY3lrN1hHNTlPMXh1WEc1UWNtOXRhWE5sTG5CeWIzUnZkSGx3WlM1dWJXRndjR3g1SUQwZ0x5OGdXRmhZSUVGeklIQnliM0J2YzJWa0lHSjVJRndpVW1Wa2MyRnVaSEp2WENKY2JsQnliMjFwYzJVdWNISnZkRzkwZVhCbExtNXdiM04wSUQwZ1puVnVZM1JwYjI0Z0tHNWhiV1VzSUdGeVozTXBJSHRjYmlBZ0lDQjJZWElnYm05a1pVRnlaM01nUFNCaGNuSmhlVjl6YkdsalpTaGhjbWR6SUh4OElGdGRLVHRjYmlBZ0lDQjJZWElnWkdWbVpYSnlaV1FnUFNCa1pXWmxjaWdwTzF4dUlDQWdJRzV2WkdWQmNtZHpMbkIxYzJnb1pHVm1aWEp5WldRdWJXRnJaVTV2WkdWU1pYTnZiSFpsY2lncEtUdGNiaUFnSUNCMGFHbHpMbVJwYzNCaGRHTm9LRndpY0c5emRGd2lMQ0JiYm1GdFpTd2dibTlrWlVGeVozTmRLUzVtWVdsc0tHUmxabVZ5Y21Wa0xuSmxhbVZqZENrN1hHNGdJQ0FnY21WMGRYSnVJR1JsWm1WeWNtVmtMbkJ5YjIxcGMyVTdYRzU5TzF4dVhHNHZLaXBjYmlBcUlFTmhiR3h6SUdFZ2JXVjBhRzlrSUc5bUlHRWdUbTlrWlMxemRIbHNaU0J2WW1wbFkzUWdkR2hoZENCaFkyTmxjSFJ6SUdFZ1RtOWtaUzF6ZEhsc1pWeHVJQ29nWTJGc2JHSmhZMnNzSUdadmNuZGhjbVJwYm1jZ2RHaGxJR2RwZG1WdUlIWmhjbWxoWkdsaklHRnlaM1Z0Wlc1MGN5d2djR3gxY3lCaElIQnliM1pwWkdWa1hHNGdLaUJqWVd4c1ltRmpheUJoY21kMWJXVnVkQzVjYmlBcUlFQndZWEpoYlNCdlltcGxZM1FnWVc0Z2IySnFaV04wSUhSb1lYUWdhR0Z6SUhSb1pTQnVZVzFsWkNCdFpYUm9iMlJjYmlBcUlFQndZWEpoYlNCN1UzUnlhVzVuZlNCdVlXMWxJRzVoYldVZ2IyWWdkR2hsSUcxbGRHaHZaQ0J2WmlCdlltcGxZM1JjYmlBcUlFQndZWEpoYlNBdUxpNWhjbWR6SUdGeVozVnRaVzUwY3lCMGJ5QndZWE56SUhSdklIUm9aU0J0WlhSb2IyUTdJSFJvWlNCallXeHNZbUZqYXlCM2FXeHNYRzRnS2lCaVpTQndjbTkyYVdSbFpDQmllU0JSSUdGdVpDQmhjSEJsYm1SbFpDQjBieUIwYUdWelpTQmhjbWQxYldWdWRITXVYRzRnS2lCQWNtVjBkWEp1Y3lCaElIQnliMjFwYzJVZ1ptOXlJSFJvWlNCMllXeDFaU0J2Y2lCbGNuSnZjbHh1SUNvdlhHNVJMbTV6Wlc1a0lEMGdMeThnV0ZoWUlFSmhjMlZrSUc5dUlFMWhjbXNnVFdsc2JHVnlKM01nY0hKdmNHOXpaV1FnWENKelpXNWtYQ0pjYmxFdWJtMWpZV3hzSUQwZ0x5OGdXRmhZSUVKaGMyVmtJRzl1SUZ3aVVtVmtjMkZ1WkhKdkozTmNJaUJ3Y205d2IzTmhiRnh1VVM1dWFXNTJiMnRsSUQwZ1puVnVZM1JwYjI0Z0tHOWlhbVZqZEN3Z2JtRnRaU0F2S2k0dUxtRnlaM01xTHlrZ2UxeHVJQ0FnSUhaaGNpQnViMlJsUVhKbmN5QTlJR0Z5Y21GNVgzTnNhV05sS0dGeVozVnRaVzUwY3l3Z01pazdYRzRnSUNBZ2RtRnlJR1JsWm1WeWNtVmtJRDBnWkdWbVpYSW9LVHRjYmlBZ0lDQnViMlJsUVhKbmN5NXdkWE5vS0dSbFptVnljbVZrTG0xaGEyVk9iMlJsVW1WemIyeDJaWElvS1NrN1hHNGdJQ0FnVVNodlltcGxZM1FwTG1ScGMzQmhkR05vS0Z3aWNHOXpkRndpTENCYmJtRnRaU3dnYm05a1pVRnlaM05kS1M1bVlXbHNLR1JsWm1WeWNtVmtMbkpsYW1WamRDazdYRzRnSUNBZ2NtVjBkWEp1SUdSbFptVnljbVZrTG5CeWIyMXBjMlU3WEc1OU8xeHVYRzVRY205dGFYTmxMbkJ5YjNSdmRIbHdaUzV1YzJWdVpDQTlJQzh2SUZoWVdDQkNZWE5sWkNCdmJpQk5ZWEpySUUxcGJHeGxjaWR6SUhCeWIzQnZjMlZrSUZ3aWMyVnVaRndpWEc1UWNtOXRhWE5sTG5CeWIzUnZkSGx3WlM1dWJXTmhiR3dnUFNBdkx5QllXRmdnUW1GelpXUWdiMjRnWENKU1pXUnpZVzVrY204bmMxd2lJSEJ5YjNCdmMyRnNYRzVRY205dGFYTmxMbkJ5YjNSdmRIbHdaUzV1YVc1MmIydGxJRDBnWm5WdVkzUnBiMjRnS0c1aGJXVWdMeW91TGk1aGNtZHpLaThwSUh0Y2JpQWdJQ0IyWVhJZ2JtOWtaVUZ5WjNNZ1BTQmhjbkpoZVY5emJHbGpaU2hoY21kMWJXVnVkSE1zSURFcE8xeHVJQ0FnSUhaaGNpQmtaV1psY25KbFpDQTlJR1JsWm1WeUtDazdYRzRnSUNBZ2JtOWtaVUZ5WjNNdWNIVnphQ2hrWldabGNuSmxaQzV0WVd0bFRtOWtaVkpsYzI5c2RtVnlLQ2twTzF4dUlDQWdJSFJvYVhNdVpHbHpjR0YwWTJnb1hDSndiM04wWENJc0lGdHVZVzFsTENCdWIyUmxRWEpuYzEwcExtWmhhV3dvWkdWbVpYSnlaV1F1Y21WcVpXTjBLVHRjYmlBZ0lDQnlaWFIxY200Z1pHVm1aWEp5WldRdWNISnZiV2x6WlR0Y2JuMDdYRzVjYmk4cUtseHVJQ29nU1dZZ1lTQm1kVzVqZEdsdmJpQjNiM1ZzWkNCc2FXdGxJSFJ2SUhOMWNIQnZjblFnWW05MGFDQk9iMlJsSUdOdmJuUnBiblZoZEdsdmJpMXdZWE56YVc1bkxYTjBlV3hsSUdGdVpGeHVJQ29nY0hKdmJXbHpaUzF5WlhSMWNtNXBibWN0YzNSNWJHVXNJR2wwSUdOaGJpQmxibVFnYVhSeklHbHVkR1Z5Ym1Gc0lIQnliMjFwYzJVZ1kyaGhhVzRnZDJsMGFGeHVJQ29nWUc1dlpHVnBabmtvYm05a1pXSmhZMnNwWUN3Z1ptOXlkMkZ5WkdsdVp5QjBhR1VnYjNCMGFXOXVZV3dnYm05a1pXSmhZMnNnWVhKbmRXMWxiblF1SUNCSlppQjBhR1VnZFhObGNseHVJQ29nWld4bFkzUnpJSFJ2SUhWelpTQmhJRzV2WkdWaVlXTnJMQ0IwYUdVZ2NtVnpkV3gwSUhkcGJHd2dZbVVnYzJWdWRDQjBhR1Z5WlM0Z0lFbG1JSFJvWlhrZ1pHOGdibTkwWEc0Z0tpQndZWE56SUdFZ2JtOWtaV0poWTJzc0lIUm9aWGtnZDJsc2JDQnlaV05sYVhabElIUm9aU0J5WlhOMWJIUWdjSEp2YldselpTNWNiaUFxSUVCd1lYSmhiU0J2WW1wbFkzUWdZU0J5WlhOMWJIUWdLRzl5SUdFZ2NISnZiV2x6WlNCbWIzSWdZU0J5WlhOMWJIUXBYRzRnS2lCQWNHRnlZVzBnZTBaMWJtTjBhVzl1ZlNCdWIyUmxZbUZqYXlCaElFNXZaR1V1YW5NdGMzUjViR1VnWTJGc2JHSmhZMnRjYmlBcUlFQnlaWFIxY201eklHVnBkR2hsY2lCMGFHVWdjSEp2YldselpTQnZjaUJ1YjNSb2FXNW5YRzRnS2k5Y2JsRXVibTlrWldsbWVTQTlJRzV2WkdWcFpuazdYRzVtZFc1amRHbHZiaUJ1YjJSbGFXWjVLRzlpYW1WamRDd2dibTlrWldKaFkyc3BJSHRjYmlBZ0lDQnlaWFIxY200Z1VTaHZZbXBsWTNRcExtNXZaR1ZwWm5rb2JtOWtaV0poWTJzcE8xeHVmVnh1WEc1UWNtOXRhWE5sTG5CeWIzUnZkSGx3WlM1dWIyUmxhV1o1SUQwZ1puVnVZM1JwYjI0Z0tHNXZaR1ZpWVdOcktTQjdYRzRnSUNBZ2FXWWdLRzV2WkdWaVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUhSb2FYTXVkR2hsYmlobWRXNWpkR2x2YmlBb2RtRnNkV1VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJRkV1Ym1WNGRGUnBZMnNvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHNXZaR1ZpWVdOcktHNTFiR3dzSUhaaGJIVmxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5TENCbWRXNWpkR2x2YmlBb1pYSnliM0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJRkV1Ym1WNGRGUnBZMnNvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHNXZaR1ZpWVdOcktHVnljbTl5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZEdocGN6dGNiaUFnSUNCOVhHNTlPMXh1WEc1UkxtNXZRMjl1Wm14cFkzUWdQU0JtZFc1amRHbHZiaWdwSUh0Y2JpQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9YQ0pSTG01dlEyOXVabXhwWTNRZ2IyNXNlU0IzYjNKcmN5QjNhR1Z1SUZFZ2FYTWdkWE5sWkNCaGN5QmhJR2RzYjJKaGJGd2lLVHRjYm4wN1hHNWNiaTh2SUVGc2JDQmpiMlJsSUdKbFptOXlaU0IwYUdseklIQnZhVzUwSUhkcGJHd2dZbVVnWm1sc2RHVnlaV1FnWm5KdmJTQnpkR0ZqYXlCMGNtRmpaWE11WEc1MllYSWdjVVZ1WkdsdVoweHBibVVnUFNCallYQjBkWEpsVEdsdVpTZ3BPMXh1WEc1eVpYUjFjbTRnVVR0Y2JseHVmU2s3WEc0aVhYMD0iLCJ2YXIgUSA9IHJlcXVpcmUoJ3EnKTtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gZmFsc2U7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBEaXlhTm9kZSgpe1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2VkJztcblx0dGhpcy5fYWRkciA9IG51bGw7XG5cdHRoaXMuX3NvY2tldCA9IG51bGw7XG5cdHRoaXMuX25leHRJZCA9IDA7XG5cdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7XG5cdHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7XG5cdHRoaXMuX3BlbmRpbmdNZXNzYWdlcyA9IFtdO1xuXHR0aGlzLl9wZWVycyA9IFtdO1xuXHR0aGlzLl9yZWNvbm5lY3RUaW1lb3V0ID0gMTAwMDtcblx0dGhpcy5fY29ubmVjdFRpbWVvdXQgPSA1MDAwO1xufVxuaW5oZXJpdHMoRGl5YU5vZGUsIEV2ZW50RW1pdHRlcik7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLyBQdWJsaWMgQVBJIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5EaXlhTm9kZS5wcm90b3R5cGUuYWRkciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fYWRkcjsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5wZWVycyA9IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzLl9wZWVyczsgfTtcbkRpeWFOb2RlLnByb3RvdHlwZS5zZWxmID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9zZWxmOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnNldFNlY3VyZWQgPSBmdW5jdGlvbihiU2VjdXJlZCkgeyB0aGlzLl9zZWN1cmVkID0gYlNlY3VyZWQgIT09IGZhbHNlOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnNldFdTb2NrZXQgPSBmdW5jdGlvbihXU29ja2V0KSB7dGhpcy5fV1NvY2tldCA9IFdTb2NrZXQ7fVxuXG5cblxuLyoqIEByZXR1cm4ge1Byb21pc2U8U3RyaW5nPn0gdGhlIGNvbm5lY3RlZCBwZWVyIG5hbWUgKi9cbkRpeWFOb2RlLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oYWRkciwgV1NvY2tldCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5iRG9udFJlY29ubmVjdGVkID0gZmFsc2U7XG5cblx0aWYoV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IFdTb2NrZXQ7XG5cdGVsc2UgaWYoIXRoaXMuX1dTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0O1xuXHRXU29ja2V0ID0gdGhpcy5fV1NvY2tldDtcblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYWRkci5pbmRleE9mKFwid3M6Ly9cIikgPT09IDAgJiYgdGhpcy5fc2VjdXJlZCkgcmV0dXJuIFEucmVqZWN0KFwiUGxlYXNlIHVzZSBhIHNlY3VyZWQgY29ubmVjdGlvbiAoXCIgKyBhZGRyICsgXCIpXCIpO1xuXHRpZihhZGRyLmluZGV4T2YoXCJ3c3M6Ly9cIikgPT09IDAgJiYgdGhpcy5fc2VjdXJlZCA9PT0gZmFsc2UpIHJldHVybiBRLnJlamVjdChcIlBsZWFzZSB1c2UgYSBub24tc2VjdXJlZCBjb25uZWN0aW9uIChcIiArIGFkZHIgKyBcIilcIik7XG5cdGlmKGFkZHIuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGFkZHIuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKHRoaXMuX3NlY3VyZWQpIGFkZHIgPSBcIndzczovL1wiICsgYWRkcjtcblx0XHRlbHNlIGFkZHIgPSBcIndzOi8vXCIgKyBhZGRyO1xuXHR9XG5cblx0aWYodGhpcy5fYWRkciA9PT0gYWRkcil7XG5cdFx0aWYodGhpcy5fc3RhdHVzID09PSAnb3BlbmVkJylcblx0XHRcdHJldHVybiBRKHRoaXMuc2VsZigpKTtcblx0XHRlbHNlIGlmKHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSAmJiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZS5pc1BlbmRpbmcoKSlcblx0XHRcdHJldHVybiB0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiB0aGlzLmNsb3NlKCkudGhlbihmdW5jdGlvbigpe1xuXHRcdHRoYXQuX2FkZHIgPSBhZGRyO1xuXHRcdHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0XHRMb2dnZXIubG9nKCdkMTogY29ubmVjdCB0byAnICsgdGhhdC5fYWRkcik7XG5cdFx0dmFyIHNvY2sgPSBuZXcgU29ja2V0SGFuZGxlcihXU29ja2V0LCB0aGF0Ll9hZGRyLCB0aGF0Ll9jb25uZWN0VGltZW91dCk7XG5cblx0XHRpZighdGhhdC5fc29ja2V0SGFuZGxlcikgdGhhdC5fc29ja2V0SGFuZGxlciA9IHNvY2s7XG5cblx0XHRzb2NrLm9uKCdvcGVuJywgZnVuY3Rpb24oKXtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJbZDFdIFdlYnNvY2tldCByZXNwb25kZWQgYnV0IGFscmVhZHkgY29ubmVjdGVkIHRvIGEgZGlmZmVyZW50IG9uZVwiKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhhdC5fc29ja2V0SGFuZGxlciA9IHNvY2s7XG5cdFx0XHR0aGF0Ll9zdGF0dXMgPSAnb3BlbmVkJztcblx0XHRcdHRoYXQuX3NldHVwUGluZ1Jlc3BvbnNlKCk7XG5cdFx0fSk7XG5cblx0XHRzb2NrLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhhdC5fc29ja2V0SGFuZGxlciAhPT0gc29jaykgcmV0dXJuO1xuXHRcdFx0dGhhdC5fc29ja2V0SGFuZGxlciA9IG51bGw7XG5cdFx0XHR0aGF0Ll9zdGF0dXMgPSAnY2xvc2VkJztcblx0XHRcdHRoYXQuX3N0b3BQaW5nUmVzcG9uc2UoKTtcblx0XHRcdHRoYXQuX29uY2xvc2UoKTtcblx0XHRcdGlmKHRoYXQuX2Nvbm5lY3Rpb25EZWZlcnJlZCkgeyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQucmVqZWN0KFwiY2xvc2VkXCIpOyB0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO31cblx0XHR9KTtcblxuXHRcdHNvY2sub24oJ3RpbWVvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdFx0XHRpZih0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQpIHsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKTsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDt9XG5cdFx0fSlcblxuXHRcdHNvY2sub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihtZXNzYWdlKSB7IHRoYXQuX29ubWVzc2FnZShtZXNzYWdlKTsgfSk7XG5cblx0XHRyZXR1cm4gdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG5cdH0pO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5iRG9udFJlY29ubmVjdGVkID0gdHJ1ZTtcblx0cmV0dXJuIHRoaXMuY2xvc2UoKTtcbn07XG5cblxuRGl5YU5vZGUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc3RvcFBpbmdSZXNwb25zZSgpO1xuXHRpZih0aGlzLl9zb2NrZXRIYW5kbGVyKSByZXR1cm4gdGhpcy5fc29ja2V0SGFuZGxlci5jbG9zZSgpO1xuXHRlbHNlIHJldHVybiBRKCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gKHRoaXMuX3NvY2tldEhhbmRsZXIgJiYgdGhpcy5fc29ja2V0SGFuZGxlci5pc0Nvbm5lY3RlZCgpKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgdGltZW91dCwgb3B0aW9ucyl7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0aWYoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHRpZighcGFyYW1zLnNlcnZpY2UpIHtcblx0XHRMb2dnZXIuZXJyb3IoJ05vIHNlcnZpY2UgZGVmaW5lZCBmb3IgcmVxdWVzdCAhJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKHBhcmFtcywgXCJSZXF1ZXN0XCIpO1xuXHR0aGlzLl9hcHBlbmRNZXNzYWdlKG1lc3NhZ2UsIGNhbGxiYWNrKTtcblx0aWYodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwgPSBvcHRpb25zLmNhbGxiYWNrX3BhcnRpYWw7XG5cdG1lc3NhZ2Uub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0aWYoIWlzTmFOKHRpbWVvdXQpICYmIHRpbWVvdXQgPiAwKXtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgaGFuZGxlciA9IHRoYXQuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0XHRpZihoYW5kbGVyKSB0aGF0Ll9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCAnVGltZW91dCBleGNlZWRlZCAoJyt0aW1lb3V0KydtcykgIScpO1xuXHRcdH0sIHRpbWVvdXQpO1xuXHR9XG5cblx0aWYoIXRoaXMuX3NlbmQobWVzc2FnZSkpe1xuXHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlbmQgcmVxdWVzdCAhJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjayl7XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkUmVxdWVzdCc7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdGlmKCFwYXJhbXMuc2VydmljZSl7XG5cdFx0TG9nZ2VyLmVycm9yKCdObyBzZXJ2aWNlIGRlZmluZWQgZm9yIHN1YnNjcmlwdGlvbiAhJyk7XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0dmFyIG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKHBhcmFtcywgXCJTdWJzY3JpcHRpb25cIik7XG5cdHRoaXMuX2FwcGVuZE1lc3NhZ2UobWVzc2FnZSwgY2FsbGJhY2spO1xuXG5cdGlmKCF0aGlzLl9zZW5kKG1lc3NhZ2UpKXtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdExvZ2dlci5lcnJvcignQ2Fubm90IHNlbmQgc3Vic2NyaXB0aW9uICEnKTtcblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHRyZXR1cm4gbWVzc2FnZS5pZDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YklkKXtcblx0aWYodGhpcy5fcGVuZGluZ01lc3NhZ2VzW3N1YklkXSAmJiB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbc3ViSWRdLnR5cGUgPT09IFwiU3Vic2NyaXB0aW9uXCIpe1xuXHRcdHZhciBzdWJzY3JpcHRpb24gPSB0aGlzLl9yZW1vdmVNZXNzYWdlKHN1YklkKTtcblxuXHRcdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZSh7XG5cdFx0XHR0YXJnZXQ6IHN1YnNjcmlwdGlvbi50YXJnZXQsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHN1YklkOiBzdWJJZFxuXHRcdFx0fVxuXHRcdH0sIFwiVW5zdWJzY3JpYmVcIik7XG5cblx0XHRpZighdGhpcy5fc2VuZChtZXNzYWdlKSl7XG5cdFx0XHRMb2dnZXIuZXJyb3IoJ0Nhbm5vdCBzZW5kIHVuc3Vic2NyaWJlICEnKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vIEludGVybmFsIG1ldGhvZHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2FwcGVuZE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCBjYWxsYmFjayl7XG5cdHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXSA9IHtcblx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0dHlwZTogbWVzc2FnZS50eXBlLFxuXHRcdHRhcmdldDogbWVzc2FnZS50YXJnZXRcblx0fTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fcmVtb3ZlTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCl7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdGlmKGhhbmRsZXIpe1xuXHRcdGRlbGV0ZSB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZUlkXTtcblx0XHRyZXR1cm4gaGFuZGxlcjtcblx0fWVsc2V7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY2xlYXJNZXNzYWdlcyA9IGZ1bmN0aW9uKGVyciwgZGF0YSl7XG5cdGZvcih2YXIgbWVzc2FnZUlkIGluIHRoaXMuX3BlbmRpbmdNZXNzYWdlcyl7XG5cdFx0dmFyIGhhbmRsZXIgPSB0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2VJZCk7XG5cdFx0dGhpcy5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgZXJyLCBkYXRhKTtcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9jbGVhclBlZXJzID0gZnVuY3Rpb24oKXtcblx0d2hpbGUodGhpcy5fcGVlcnMubGVuZ3RoKSB0aGlzLmVtaXQoJ3BlZXItZGlzY29ubmVjdGVkJywgdGhpcy5fcGVlcnMucG9wKCkpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9nZXRNZXNzYWdlSGFuZGxlciA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCl7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdHJldHVybiBoYW5kbGVyID8gaGFuZGxlciA6IG51bGw7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX25vdGlmeUxpc3RlbmVyID0gZnVuY3Rpb24oaGFuZGxlciwgZXJyb3IsIGRhdGEpe1xuXHRpZihoYW5kbGVyICYmIHR5cGVvZiBoYW5kbGVyLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0ZXJyb3IgPSBlcnJvciA/IGVycm9yIDogbnVsbDtcblx0XHRkYXRhID0gZGF0YSA/IGRhdGEgOiBudWxsO1xuXHRcdHRyeSB7XG5cdFx0XHRoYW5kbGVyLmNhbGxiYWNrKGVycm9yLCBkYXRhKTtcblx0XHR9IGNhdGNoKGUpIHsgY29uc29sZS5sb2coJ1tFcnJvciBpbiBSZXF1ZXN0IGNhbGxiYWNrXSAnICsgZS5zdGFjayA/IGUuc3RhY2sgOiBlKTt9XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fc2VuZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRyZXR1cm4gdGhpcy5fc29ja2V0SGFuZGxlci5zZW5kKG1lc3NhZ2UpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zZXR1cFBpbmdSZXNwb25zZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLl9waW5nVGltZW91dCA9IDE1MDAwO1xuXHR0aGlzLl9sYXN0UGluZyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG5cdGZ1bmN0aW9uIGNoZWNrUGluZygpe1xuXHRcdHZhciBjdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0aWYoY3VyVGltZSAtIHRoYXQuX2xhc3RQaW5nID4gdGhhdC5fcGluZ1RpbWVvdXQpe1xuXHRcdFx0dGhhdC5fZm9yY2VDbG9zZSgpO1xuXHRcdFx0TG9nZ2VyLmxvZyhcImQxOiAgdGltZWQgb3V0ICFcIik7XG5cdFx0fWVsc2V7XG5cdFx0XHRMb2dnZXIubG9nKFwiZDE6IGxhc3QgcGluZyBva1wiKTtcblx0XHRcdHRoYXQuX3BpbmdTZXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGNoZWNrUGluZywgTWF0aC5yb3VuZCh0aGF0Ll9waW5nVGltZW91dCAvIDIuMSkpO1xuXHRcdH1cblx0fVxuXG5cdGNoZWNrUGluZygpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zdG9wUGluZ1Jlc3BvbnNlID0gZnVuY3Rpb24oKXtcblx0Y2xlYXJUaW1lb3V0KHRoaXMuX3BpbmdTZXRUaW1lb3V0SWQpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9mb3JjZUNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc29ja2V0SGFuZGxlci5jbG9zZSgpO1xuXHR0aGlzLl9vbmNsb3NlKCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8gU29ja2V0IGV2ZW50IGhhbmRsZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0aWYoaXNOYU4obWVzc2FnZS5pZCkpIHJldHVybiB0aGlzLl9oYW5kbGVJbnRlcm5hbE1lc3NhZ2UobWVzc2FnZSk7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIobWVzc2FnZS5pZCk7XG5cdGlmKCFoYW5kbGVyKSByZXR1cm47XG5cdHN3aXRjaChoYW5kbGVyLnR5cGUpe1xuXHRcdGNhc2UgXCJSZXF1ZXN0XCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVSZXF1ZXN0KGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlN1YnNjcmlwdGlvblwiOlxuXHRcdFx0dGhpcy5faGFuZGxlU3Vic2NyaXB0aW9uKGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLl9jbGVhck1lc3NhZ2VzKCdQZWVyRGlzY29ubmVjdGVkJyk7XG5cdHRoaXMuX2NsZWFyUGVlcnMoKTtcblxuXHRMb2dnZXIubG9nKCdkMTogY29ubmVjdGlvbiBsb3N0LCB0cnkgcmVjb25uZWN0aW5nJyk7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHR0aGF0LmNvbm5lY3QodGhhdC5fYWRkciwgdGhhdC5fV1NvY2tldCkuY2F0Y2goZnVuY3Rpb24oZXJyKXt9KTtcblx0fSwgdGhhdC5fcmVjb25uZWN0VGltZW91dCk7XG5cblx0dGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX2FkZHIpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vIFByb3RvY29sIGV2ZW50IGhhbmRsZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZUludGVybmFsTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRzd2l0Y2gobWVzc2FnZS50eXBlKXtcblx0XHRjYXNlIFwiUGVlckNvbm5lY3RlZFwiOlxuXHRcdFx0dGhpcy5faGFuZGxlUGVlckNvbm5lY3RlZChtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJQZWVyRGlzY29ubmVjdGVkXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVQZWVyRGlzY29ubmVjdGVkKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkhhbmRzaGFrZVwiOlxuXHRcdFx0dGhpcy5faGFuZGxlSGFuZHNoYWtlKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlBpbmdcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVBpbmcobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0fVxufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVQaW5nID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdG1lc3NhZ2UudHlwZSA9IFwiUG9uZ1wiO1xuXHR0aGlzLl9sYXN0UGluZyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHR0aGlzLl9zZW5kKG1lc3NhZ2UpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVIYW5kc2hha2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblxuXHRpZihtZXNzYWdlLnBlZXJzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG1lc3NhZ2Uuc2VsZiAhPT0gJ3N0cmluZycpe1xuXHRcdExvZ2dlci5lcnJvcihcIk1pc3NpbmcgYXJndW1lbnRzIGZvciBIYW5kc2hha2UgbWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0cmV0dXJuIDtcblx0fVxuXG5cdHRoaXMuX3NlbGYgPSBtZXNzYWdlLnNlbGY7XG5cblx0Zm9yKHZhciBpPTA7aTxtZXNzYWdlLnBlZXJzLmxlbmd0aDsgaSsrKXtcblx0XHR0aGlzLl9wZWVycy5wdXNoKG1lc3NhZ2UucGVlcnNbaV0pO1xuXHRcdHRoaXMuZW1pdCgncGVlci1jb25uZWN0ZWQnLCBtZXNzYWdlLnBlZXJzW2ldKTtcblx0fVxuXG5cdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5yZXNvbHZlKHRoaXMuc2VsZigpKTtcblx0dGhpcy5lbWl0KCdvcGVuJywgdGhpcy5fYWRkcik7XG5cdHRoaXMuX3N0YXR1cyA9ICdvcGVuZWQnO1xuXHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQgPSBudWxsO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVQZWVyQ29ubmVjdGVkID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdGlmKG1lc3NhZ2UucGVlcklkID09PSB1bmRlZmluZWQpe1xuXHRcdExvZ2dlci5lcnJvcihcIk1pc3NpbmcgYXJndW1lbnRzIGZvciBQZWVyQ29ubmVjdGVkIG1lc3NhZ2UsIGRyb3BwaW5nLi4uXCIpO1xuXHRcdHJldHVybiA7XG5cdH1cblxuXHQvL0FkZCBwZWVyIHRvIHRoZSBsaXN0IG9mIHJlYWNoYWJsZSBwZWVyc1xuXHR0aGlzLl9wZWVycy5wdXNoKG1lc3NhZ2UucGVlcklkKTtcblxuXHR0aGlzLmVtaXQoJ3BlZXItY29ubmVjdGVkJywgbWVzc2FnZS5wZWVySWQpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9oYW5kbGVQZWVyRGlzY29ubmVjdGVkID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdGlmKG1lc3NhZ2UucGVlcklkID09PSB1bmRlZmluZWQpe1xuXHRcdExvZ2dlci5lcnJvcihcIk1pc3NpbmcgYXJndW1lbnRzIGZvciBQZWVyRGlzY29ubmVjdGVkIE1lc3NhZ2UsIGRyb3BwaW5nLi4uXCIpO1xuXHRcdHJldHVybiA7XG5cdH1cblxuXHQvL0dvIHRocm91Z2ggYWxsIHBlbmRpbmcgbWVzc2FnZXMgYW5kIG5vdGlmeSB0aGUgb25lcyB0aGF0IGFyZSB0YXJnZXRlZFxuXHQvL2F0IHRoZSBkaXNjb25uZWN0ZWQgcGVlciB0aGF0IGl0IGRpc2Nvbm5lY3RlZCBhbmQgdGhlcmVmb3JlIHRoZSBjb21tYW5kXG5cdC8vY2Fubm90IGJlIGZ1bGZpbGxlZFxuXHRmb3IodmFyIG1lc3NhZ2VJZCBpbiB0aGlzLl9wZW5kaW5nTWVzc2FnZXMpe1xuXHRcdHZhciBoYW5kbGVyID0gdGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIobWVzc2FnZUlkKTtcblx0XHRpZihoYW5kbGVyICYmIGhhbmRsZXIudGFyZ2V0ID09PSBtZXNzYWdlLnBlZXJJZCkge1xuXHRcdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlSWQpO1xuXHRcdFx0dGhpcy5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgJ1BlZXJEaXNjb25uZWN0ZWQnLCBudWxsKTtcblx0XHR9XG5cdH1cblxuXHQvL1JlbW92ZSBwZWVyIGZyb20gbGlzdCBvZiByZWFjaGFibGUgcGVlcnNcblx0Zm9yKHZhciBpPXRoaXMuX3BlZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcblx0XHRpZih0aGlzLl9wZWVyc1tpXSA9PT0gbWVzc2FnZS5wZWVySWQpe1xuXHRcdFx0dGhpcy5fcGVlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dGhpcy5lbWl0KCdwZWVyLWRpc2Nvbm5lY3RlZCcsIG1lc3NhZ2UucGVlcklkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUmVxdWVzdCA9IGZ1bmN0aW9uKGhhbmRsZXIsIG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnR5cGUgPT09ICdQYXJ0aWFsQW5zd2VyJykge1xuXHRcdGlmKHR5cGVvZiB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZS5pZF0uY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dmFyIGVycm9yID0gbWVzc2FnZS5lcnJvciA/IG1lc3NhZ2UuZXJyb3IgOiBudWxsO1xuXHRcdFx0dmFyIGRhdGEgPSBtZXNzYWdlLmRhdGEgPyBtZXNzYWdlLmRhdGEgOiBudWxsO1xuXHRcdFx0dGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwoZXJyb3IsIGRhdGEpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsIG1lc3NhZ2UuZXJyb3IsIG1lc3NhZ2UuZGF0YSk7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24oaGFuZGxlciwgbWVzc2FnZSl7XG5cdC8vcmVtb3ZlIHN1YnNjcmlwdGlvbiBpZiBpdCB3YXMgY2xvc2VkIGZyb20gbm9kZVxuXHRpZihtZXNzYWdlLnJlc3VsdCA9PT0gXCJjbG9zZWRcIikge1xuXHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZS5pZCk7XG5cdFx0bWVzc2FnZS5lcnJvciA9ICdTdWJzY3JpcHRpb25DbG9zZWQnO1xuXHR9XG5cdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsIG1lc3NhZ2UuZXJyb3IsIG1lc3NhZ2UuZGF0YSA/IG1lc3NhZ2UuZGF0YSA6IG51bGwpO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBTb2NrZXRIYW5kbGVyIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIFNvY2tldEhhbmRsZXIoV1NvY2tldCwgYWRkciwgdGltZW91dCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuYWRkciA9IGFkZHI7XG5cblx0aWYoV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IFdTb2NrZXQ7XG5cdGVsc2UgaWYoIXRoaXMuX1dTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0O1xuXHRXU29ja2V0ID0gdGhpcy5fV1NvY2tldDtcblxuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmluZyc7XG5cblx0dHJ5IHtcblx0XHR0aGlzLl9zb2NrZXQgPSBuZXcgV1NvY2tldChhZGRyKTtcblx0fSBjYXRjaChlKSB7XG5cdFx0TG9nZ2VyLmVycm9yKGUuc3RhY2spO1xuXHRcdHJldHVybiB0aGF0LmNsb3NlKCk7XG5cdH1cblxuXHR0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2sgPSB0aGlzLl9vbm9wZW4uYmluZCh0aGlzKTtcblx0dGhpcy5fc29ja2V0Q2xvc2VDYWxsYmFjayA9IHRoaXMuX29uY2xvc2UuYmluZCh0aGlzKTtcblx0dGhpcy5fc29ja2V0TWVzc2FnZUNhbGxiYWNrID0gdGhpcy5fb25tZXNzYWdlLmJpbmQodGhpcyk7XG5cblx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCB0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2spO1xuXHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLHRoaXMuX3NvY2tldENsb3NlQ2FsbGJhY2spO1xuXHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cblx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oZXJyKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJbV1NdIGVycm9yIDogXCIrSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG5cdFx0dGhhdC5fc29ja2V0LmNsb3NlKCk7XG5cdH0pO1xuXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRpZih0aGF0Ll9zdGF0dXMgPT09ICdvcGVuZWQnKSByZXR1cm47XG5cdFx0aWYodGhhdC5fc3RhdHVzICE9PSAnY2xvc2VkJyl7XG5cdFx0XHRMb2dnZXIubG9nKCdkMTogJyArIHRoYXQuYWRkciArICcgdGltZWQgb3V0IHdoaWxlIGNvbm5lY3RpbmcnKTtcblx0XHRcdHRoYXQuY2xvc2UoKTtcblx0XHRcdHRoYXQuZW1pdCgndGltZW91dCcsIHRoYXQuX3NvY2tldCk7XG5cdFx0fVxuXHR9LCB0aW1lb3V0KTtcbn07XG5pbmhlcml0cyhTb2NrZXRIYW5kbGVyLCBFdmVudEVtaXR0ZXIpO1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpIHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpO1xuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2luZyc7XG5cdHRoaXMuX3NvY2tldC5jbG9zZSgpO1xuXHRyZXR1cm4gdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHR0cnkge1xuXHRcdHZhciBkYXRhID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG5cdH0gY2F0Y2goZXJyKSB7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlcmlhbGl6ZSBtZXNzYWdlJyk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dHJ5IHtcblx0XHR0aGlzLl9zb2NrZXQuc2VuZChkYXRhKTtcblx0fSBjYXRjaChlcnIpe1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBzZW5kIG1lc3NhZ2UnKTtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHRydWU7XG59XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9zb2NrZXQucmVhZHlTdGF0ZSA9PSB0aGlzLl9XU29ja2V0Lk9QRU4gJiYgdGhpcy5fc3RhdHVzID09PSAnb3BlbmVkJztcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbm9wZW4gPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fc3RhdHVzID0gJ29wZW5lZCc7XG5cdHRoaXMuZW1pdCgnb3BlbicsIHRoaXMuX3NvY2tldCk7XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2VkJztcblx0dGhpcy51bnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG5cdHRoaXMuZW1pdCgnY2xvc2UnLCB0aGlzLl9zb2NrZXQpO1xuXHRpZih0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpIHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZC5yZXNvbHZlKCk7XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25tZXNzYWdlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdHRyeSB7XG5cdFx0dmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2dC5kYXRhKTtcblx0XHR0aGlzLmVtaXQoJ21lc3NhZ2UnLCBtZXNzYWdlKTtcblx0fSBjYXRjaChlcnIpeyBMb2dnZXIuZXJyb3IoXCJbV1NdIGNhbm5vdCBwYXJzZSBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTsgfVxufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUudW5yZWdpc3RlckNhbGxiYWNrcyA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykpe1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgdGhpcy5fc29ja2V0T3BlbkNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cdH0gZWxzZSBpZih0aGlzLl9zb2NrZXQgJiYgKHR5cGVvZiB0aGlzLl9zb2NrZXQucmVtb3ZlQWxsTGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSl7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycygpO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gVXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY3JlYXRlTWVzc2FnZSA9IGZ1bmN0aW9uKHBhcmFtcywgdHlwZSl7XG5cdGlmKCFwYXJhbXMgfHwgIXR5cGUgfHwgKHR5cGUgIT09IFwiUmVxdWVzdFwiICYmIHR5cGUgIT09IFwiU3Vic2NyaXB0aW9uXCIgJiYgdHlwZSAhPT0gXCJVbnN1YnNjcmliZVwiKSl7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IHR5cGUsXG5cdFx0aWQ6IHRoaXMuX2dlbmVyYXRlSWQoKSxcblx0XHRzZXJ2aWNlOiBwYXJhbXMuc2VydmljZSxcblx0XHR0YXJnZXQ6IHBhcmFtcy50YXJnZXQsXG5cdFx0dG9rZW46IHBhcmFtcy50b2tlbixcblx0XHRmdW5jOiBwYXJhbXMuZnVuYyxcblx0XHRvYmo6IHBhcmFtcy5vYmosXG5cdFx0ZGF0YTogcGFyYW1zLmRhdGFcblx0fTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fZ2VuZXJhdGVJZCA9IGZ1bmN0aW9uKCl7XG5cdHZhciBpZCA9IHRoaXMuX25leHRJZDtcblx0dGhpcy5fbmV4dElkKys7XG5cdHJldHVybiBpZDtcbn07XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERpeWFOb2RlO1xuIiwidmFyIFEgPSByZXF1aXJlKCdxJyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG52YXIgRGl5YU5vZGUgPSByZXF1aXJlKCcuL0RpeWFOb2RlJyk7XG5cbnZhciBjb25uZWN0aW9uID0gbmV3IERpeWFOb2RlKCk7XG52YXIgY29ubmVjdGlvbkV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbnZhciB0b2tlbiA9IG51bGw7XG52YXIgX3VzZXIgPSBudWxsO1xudmFyIF9wYXNzID0gbnVsbDtcblxuXG4vLy8vLy8vLy8vLy8vL1xuLy8gIEQxIEFQSSAgLy9cbi8vLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gZDEoc2VsZWN0b3Ipe1xuXHRyZXR1cm4gbmV3IERpeWFTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmQxLkRpeWFOb2RlID0gRGl5YU5vZGU7XG5kMS5EaXlhU2VsZWN0b3IgPSBEaXlhU2VsZWN0b3I7XG5cbmQxLmNvbm5lY3QgPSBmdW5jdGlvbihhZGRyLCBXU29ja2V0KXtcblx0cmV0dXJuIGNvbm5lY3Rpb24uY29ubmVjdChhZGRyLCBXU29ja2V0KTtcbn07XG5cbmQxLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0b2tlbiA9IG51bGw7XG5cdHJldHVybiBjb25uZWN0aW9uLmRpc2Nvbm5lY3QoKTtcbn07XG5cbmQxLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKSB7XHRyZXR1cm4gY29ubmVjdGlvbi5pc0Nvbm5lY3RlZCgpO307XG5kMS5wZWVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5wZWVycygpO307XG5kMS5zZWxmID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLnNlbGYoKTsgfTtcbmQxLmFkZHIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24uYWRkcigpOyB9O1xuZDEudXNlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gX3VzZXI7IH07XG5kMS5wYXNzID0gZnVuY3Rpb24oKSB7IHJldHVybiBfcGFzczsgfTtcbmQxLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge3JldHVybiB0b2tlbiAhPSBudWxsOyB9XG5cblxuLyoqIFRyeSB0byBjb25uZWN0IHRvIHRoZSBnaXZlbiBzZXJ2ZXJzIGxpc3QgaW4gdGhlIGxpc3Qgb3JkZXIsIHVudGlsIGZpbmRpbmcgYW4gYXZhaWxhYmxlIG9uZSAqL1xuZDEudHJ5Q29ubmVjdCA9IGZ1bmN0aW9uKHNlcnZlcnMsIFdTb2NrZXQpe1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdGZ1bmN0aW9uIHRjKGkpIHtcblx0XHRkMS5jb25uZWN0KHNlcnZlcnNbaV0sIFdTb2NrZXQpLnRoZW4oZnVuY3Rpb24oZSl7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShzZXJ2ZXJzW2ldKTtcblx0XHR9KS5jYXRjaChmdW5jdGlvbihlKXtcblx0XHRcdGQxLmRpc2Nvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpKys7XG5cdFx0XHRcdGlmKGk8c2VydmVycy5sZW5ndGgpIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7dGMoaSk7fSwgMTAwKTtcblx0XHRcdFx0ZWxzZSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KFwiVGltZW91dFwiKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cdHRjKDApO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZDEuY3VycmVudFNlcnZlciA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBjb25uZWN0aW9uLl9hZGRyO1xufTtcblxuZDEub24gPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuXHRjb25uZWN0aW9uLm9uKGV2ZW50LCBjYWxsYmFjayk7XG5cdHJldHVybiBkMTtcbn07XG5cblxuLyoqIFNob3J0aGFuZCBmdW5jdGlvbiB0byBjb25uZWN0IGFuZCBsb2dpbiB3aXRoIHRoZSBnaXZlbiAodXNlcixwYXNzd29yZCkgKi9cbmQxLmNvbm5lY3RBc1VzZXIgPSBmdW5jdGlvbihpcCwgdXNlciwgcGFzc3dvcmQsIFdTb2NrZXQpIHtcblx0cmV0dXJuIGQxLmNvbm5lY3QoaXAsIFdTb2NrZXQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gZDEoXCIjc2VsZlwiKS5hdXRoKHVzZXIsIHBhc3N3b3JkKTtcblx0fSk7XG59XG5cbmQxLmRlYXV0aGVudGljYXRlID0gZnVuY3Rpb24oKXsgXHR0b2tlbiA9IG51bGw7fTtcbmQxLnNldFNlY3VyZWQgPSBmdW5jdGlvbihiU2VjdXJlZCkgeyBjb25uZWN0aW9uLnNldFNlY3VyZWQoYlNlY3VyZWQpOyB9O1xuZDEuaXNTZWN1cmVkID0gZnVuY3Rpb24oKSB7cmV0dXJuIGNvbm5lY3Rpb24uX3NlY3VyZWQ7IH1cbmQxLnNldFdTb2NrZXQgPSBmdW5jdGlvbihXU29ja2V0KSB7IGNvbm5lY3Rpb24uc2V0V1NvY2tldChXU29ja2V0KTsgfVxuXG5cbi8qKiBTZWxmLWF1dGhlbnRpY2F0ZSB0aGUgbG9jYWwgRGl5YU5vZGUgYm91bmQgdG8gcG9ydCA8cG9ydD4sIHVzaW5nIGl0cyBSU0Egc2lnbmF0dXJlICovXG5kMS5zZWxmQ29ubmVjdCA9IGZ1bmN0aW9uKHBvcnQsIHNpZ25hdHVyZSwgV1NvY2tldCkge1xuXHRyZXR1cm4gZDEuY29ubmVjdCgnd3M6Ly9sb2NhbGhvc3Q6JyArIHBvcnQsIFdTb2NrZXQpXG5cdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdFx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0XHRzZXJ2aWNlOiAncGVlckF1dGgnLFxuXHRcdFx0XHRmdW5jOiAnU2VsZkF1dGhlbnRpY2F0ZScsXG5cdFx0XHRcdGRhdGE6IHtcdHNpZ25hdHVyZTogc2lnbmF0dXJlIH1cblx0XHRcdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHRcdGlmKGRhdGEgJiYgZGF0YS5hdXRoZW50aWNhdGVkICYmIGRhdGEudG9rZW4pe1xuXHRcdFx0XHRcdHRva2VuID0gZGF0YS50b2tlbjtcblx0XHRcdFx0XHRfdXNlciA9IFwiI0RpeWFOb2RlI1wiK3BlZXJJZDtcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKCk7XG5cdFx0XHRcdH0gZWxzZSBkZWZlcnJlZC5yZWplY3QoJ0FjY2Vzc0RlbmllZCcpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fSk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERpeWFTZWxlY3RvciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIERpeWFTZWxlY3RvcihzZWxlY3Rvcil7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG5cdHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG5cdHRoaXMuX2xpc3RlbmVyQ291bnQgPSAwO1xuXHR0aGlzLl9saXN0ZW5DYWxsYmFjayA9IG51bGw7XG5cdHRoaXMuX2NhbGxiYWNrQXR0YWNoZWQgPSBmYWxzZTtcbn1cbmluaGVyaXRzKERpeWFTZWxlY3RvciwgRXZlbnRFbWl0dGVyKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFB1YmxpYyBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9zZWxlY3QoKTsgfTtcblxuXG5cbi8qKlxuICogQXBwbHkgY2FsbGJhY2sgY2IgdG8gZWFjaCBzZWxlY3RlZCBwZWVyLiBQZWVycyBhcmUgc2VsZWN0ZWRcbiAqIGFjY29yZGluZyB0byB0aGUgcnVsZSAnc2VsZWN0b3InIGdpdmVuIHRvIGNvbnN0cnVjdG9yLiBTZWxlY3RvciBjYW5cbiAqIGJlIGEgcGVlcklkLCBhIHJlZ0V4IGZvciBwZWVySWRzIG9mIGFuIGFycmF5IG9mIHBlZXJJZHMuXG4gKiBAcGFyYW1zIFx0Y2JcdFx0Y2FsbGJhY2sgdG8gYmUgYXBwbGllZFxuICogQHJldHVybiBcdHRoaXMgXHQ8RGl5YVNlbGVjdG9yPlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihjYil7XG5cdHZhciBwZWVycyA9IHRoaXMuX3NlbGVjdCgpO1xuXHRmb3IodmFyIGk9MDsgaTxwZWVycy5sZW5ndGg7IGkrKykgY2IuYmluZCh0aGlzKShwZWVyc1tpXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIHJlcXVlc3QgdG8gc2VsZWN0ZWQgcGVlcnMgKCBzZWUgZWFjaCgpICkgdGhyb3VnaCB0aGUgY3VycmVudCBjb25uZWN0aW9uIChEaXlhTm9kZSkuXG4gKiBAcGFyYW0ge1N0cmluZyB8IE9iamVjdH0gcGFyYW1zIDogY2FuIGJlIHNlcnZpY2UuZnVuY3Rpb24gb3Ige3NlcnZpY2U6c2VydmljZSwgZnVuYzpmdW5jdGlvbiwgLi4ufVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrLCB0aW1lb3V0LCBvcHRpb25zKXtcblx0aWYoIWNvbm5lY3Rpb24pIHJldHVybiB0aGlzO1xuXHRpZighb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHR2YXIgbmJBbnN3ZXJzID0gMDtcblx0dmFyIG5iRXhwZWN0ZWQgPSB0aGlzLl9zZWxlY3QoKS5sZW5ndGg7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24ocGVlcklkKXtcblx0XHRwYXJhbXMudGFyZ2V0ID0gcGVlcklkO1xuXHRcdHBhcmFtcy50b2tlbiA9IHRva2VuO1xuXG5cdFx0dmFyIG9wdHMgPSB7fTtcblx0XHRmb3IodmFyIGkgaW4gb3B0aW9ucykgb3B0c1tpXSA9IG9wdGlvbnNbaV07XG5cdFx0aWYodHlwZW9mIG9wdHMuY2FsbGJhY2tfcGFydGlhbCA9PT0gJ2Z1bmN0aW9uJykgb3B0cy5jYWxsYmFja19wYXJ0aWFsID0gZnVuY3Rpb24oZXJyLCBkYXRhKXsgb3B0aW9ucy5jYWxsYmFja19wYXJ0aWFsKHBlZXJJZCwgZXJyLCBkYXRhKTt9XG5cblx0XHRjb25uZWN0aW9uLnJlcXVlc3QocGFyYW1zLCBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7XG5cdFx0XHRuYkFuc3dlcnMrKztcblx0XHRcdGlmKG5iQW5zd2VycyA9PSBuYkV4cGVjdGVkICYmIG9wdGlvbnMuYk5vdGlmeVdoZW5GaW5pc2hlZCkgY2FsbGJhY2sobnVsbCwgZXJyLCBcIiMjRU5EIyNcIik7IC8vIFRPRE8gOiBGaW5kIGEgYmV0dGVyIHdheSB0byBub3RpZnkgcmVxdWVzdCBFTkQgISFcblx0XHR9LCB0aW1lb3V0LCBvcHRzKTtcblx0fSk7XG59O1xuXG5cbi8vIElNUE9SVEFOVCAhISEgQnkgMzAvMTEvMTUsIHRoaXMgbWV0aG9kIGRvZXNuJ3QgcmV0dXJuICd0aGlzJyBhbnltb3JlLCBidXQgYSBTdWJzY3JpcHRpb24gb2JqZWN0IGluc3RlYWRcbi8qIEBwYXJhbSB7U3RyaW5nIHwgT2JqZWN0fSBwYXJhbXMgOiBjYW4gYmUgJ3NlcnZpY2UuZnVuY3Rpb24nIG9yIHtzZXJ2aWNlOnNlcnZpY2UsIGZ1bmM6ZnVuY3Rpb24sIC4uLn0gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24ocGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucyl7XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkU3Vic2NyaXB0aW9uJztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0cmV0dXJuIG5ldyBTdWJzY3JpcHRpb24odGhpcywgcGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucyk7XG59O1xuXG5cbi8vIElNUE9SVEFOVCAhISEgQlkgMzAvMTEvMTUsIHRoaXMgbWV0aG9kIGRvZXNuJ3QgdGFrZSBzdWJJZHMgYXMgaW5wdXQgYW55bW9yZS5cbi8vIFBsZWFzZSBwcm92aWRlIGEgc3Vic2NyaXB0aW9uIGluc3RlYWQgIVxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbil7XG5cdGlmKEFycmF5LmlzQXJyYXkoc3Vic2NyaXB0aW9uKSB8fCAhc3Vic2NyaXB0aW9uLmNsb3NlKSByZXR1cm4gdGhpcy5fX29sZF9kZXByZWNhdGVkX3Vuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbik7XG5cdHJldHVybiBzdWJzY3JpcHRpb24uY2xvc2UoKTtcbn07XG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3N3b3JkLCBjYWxsYmFjaywgdGltZW91dCl7XG5cdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXMpO1xuXG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdhdXRoJyxcblx0XHRmdW5jOiAnQXV0aGVudGljYXRlJyxcblx0XHRkYXRhOiB7XG5cdFx0XHR1c2VyOiB1c2VyLFxuXHRcdFx0cGFzc3dvcmQ6IHBhc3N3b3JkXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cblx0XHRpZihlcnIgPT09ICdTZXJ2aWNlTm90Rm91bmQnKXtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCB0cnVlKTtcblx0XHRcdGVsc2UgZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdGlmKCFlcnIgJiYgZGF0YSAmJiBkYXRhLmF1dGhlbnRpY2F0ZWQgJiYgZGF0YS50b2tlbil7XG5cdFx0XHR0b2tlbiA9IGRhdGEudG9rZW47XG5cdFx0XHRfdXNlciA9IHVzZXI7XG5cdFx0XHRfcGFzcyA9IHBhc3N3b3JkO1xuXHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhwZWVySWQsIHRydWUpO1xuXHRcdFx0ZWxzZSBkZWZlcnJlZC5yZXNvbHZlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdCgnQWNjZXNzRGVuaWVkJyk7XG5cdFx0fVxuXG5cdH0sIHRpbWVvdXQpO1xuXG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuXG5cbi8vIFByaXZhdGVzXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3NlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdG9yRnVuY3Rpb24pe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0aWYoIWNvbm5lY3Rpb24pIHJldHVybiBbXTtcblx0cmV0dXJuIGNvbm5lY3Rpb24ucGVlcnMoKS5maWx0ZXIoZnVuY3Rpb24ocGVlcklkKXtcblx0XHRyZXR1cm4gbWF0Y2godGhhdC5fc2VsZWN0b3IsIHBlZXJJZCk7XG5cdH0pO1xufTtcblxuZnVuY3Rpb24gbWF0Y2goc2VsZWN0b3IsIHN0cil7XG5cdGlmKCFzZWxlY3RvcikgcmV0dXJuIGZhbHNlO1xuXHRpZihzZWxlY3RvciA9PT0gXCIjc2VsZlwiKSByZXR1cm4gY29ubmVjdGlvbiAmJiBzdHI9PT1jb25uZWN0aW9uLnNlbGYoKTtcblx0ZWxzZSBpZihzZWxlY3Rvci5ub3QpIHJldHVybiAhbWF0Y2goc2VsZWN0b3Iubm90LCBzdHIpO1xuXHRlbHNlIGlmKHNlbGVjdG9yLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTdHJpbmcnKXtcblx0XHRyZXR1cm4gbWF0Y2hTdHJpbmcoc2VsZWN0b3IsIHN0cik7XG5cdH0gZWxzZSBpZihzZWxlY3Rvci5jb25zdHJ1Y3Rvci5uYW1lID09PSAnUmVnRXhwJyl7XG5cdFx0cmV0dXJuIG1hdGNoUmVnRXhwKHNlbGVjdG9yLCBzdHIpO1xuXHR9IGVsc2UgaWYoQXJyYXkuaXNBcnJheShzZWxlY3Rvcikpe1xuXHRcdHJldHVybiBtYXRjaEFycmF5KHNlbGVjdG9yLCBzdHIpO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hTdHJpbmcoc2VsZWN0b3IsIHN0cil7XG5cdHJldHVybiBzZWxlY3RvciA9PT0gc3RyO1xufVxuXG5mdW5jdGlvbiBtYXRjaFJlZ0V4cChzZWxlY3Rvciwgc3RyKXtcblx0cmV0dXJuIHN0ci5tYXRjaChzZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIG1hdGNoQXJyYXkoc2VsZWN0b3IsIHN0cil7XG5cdGZvcih2YXIgaT0wO2k8c2VsZWN0b3IubGVuZ3RoOyBpKyspe1xuXHRcdGlmKHNlbGVjdG9yW2ldID09PSBzdHIpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuLy8gT3ZlcnJpZGVzIEV2ZW50RW1pdHRlcidzIGJlaGF2aW9yIHRvIHByb3h5IGFuZCBmaWx0ZXIgZXZlbnRzIGZyb20gdGhlIGNvbm5lY3Rpb25cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX29uID0gRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5vbjtcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUub24gPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjayl7XG5cdGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlciA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHRcdGlmKG1hdGNoKHRoaXMuX3NlbGVjdG9yLCBwZWVySWQpKSB0aGlzLmVtaXQodHlwZSwgcGVlcklkKTtcblx0fTtcblx0Y29ubmVjdGlvbi5vbih0eXBlLCBjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpO1xuXHR2YXIgcmV0ID0gdGhpcy5fb24odHlwZSwgY2FsbGJhY2spO1xuXG5cdC8vIEhhbmRsZSB0aGUgc3BlY2lmaWMgY2FzZSBvZiBcInBlZXItY29ubmVjdGVkXCIgZXZlbnRzLCBpLmUuLCBub3RpZnkgb2YgYWxyZWFkeSBjb25uZWN0ZWQgcGVlcnNcblx0aWYodHlwZSA9PT0gJ3BlZXItY29ubmVjdGVkJyAmJiBjb25uZWN0aW9uLmlzQ29ubmVjdGVkKCkpIHtcblx0XHR2YXIgcGVlcnMgPSBjb25uZWN0aW9uLnBlZXJzKCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxwZWVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYobWF0Y2godGhpcy5fc2VsZWN0b3IsIHBlZXJzW2ldKSkgY2FsbGJhY2socGVlcnNbaV0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmV0O1xufTtcblxuXG4vLyBPdmVycmlkZXMgRXZlbnRFbWl0dGVyJ3MgYmVoYXZpb3IgdG8gcHJveHkgYW5kIGZpbHRlciBldmVudHMgZnJvbSB0aGUgY29ubmVjdGlvblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fcmVtb3ZlTGlzdGVuZXIgPSBEaXlhU2VsZWN0b3IucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKSB7XG5cdGlmKGNhbGxiYWNrLl9fX0RpeWFTZWxlY3Rvcl9oaWRkZW5fd3JhcHBlcikgY29ubmVjdGlvbi5yZW1vdmVMaXN0ZW5lcih0eXBlLCBjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpO1xuXHR0aGlzLl9yZW1vdmVMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBTVUJTQ1JJUFRJT04gLy9cbi8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8qKlxuKiBIYW5kbGVzIGEgc3Vic2NyaXB0aW9uIHRvIHNvbWUgRGl5YU5vZGUgc2VydmljZSBmb3IgbXVsdGlwbGUgbm9kZXNcbiogYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBzZWxlY3RvclxuKi9cbmZ1bmN0aW9uIFN1YnNjcmlwdGlvbihzZWxlY3RvciwgcGFyYW1zLCBjYWxsYmFjaywgb3B0aW9ucykge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG5cdFx0dGhpcy5wYXJhbXMgPSBwYXJhbXM7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0dGhpcy5zdWJJZHMgPSBbXTtcblxuXHRcdHRoaXMuZG9TdWJzY3JpYmUgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0XHRcdHRoYXQuc3ViSWRzLnB1c2godGhhdC5fYWRkU3Vic2NyaXB0aW9uKHBlZXJJZCkpO1xuXHRcdFx0dGhhdC5zdGF0ZSA9IFwib3BlblwiO1xuXHRcdH07XG5cblx0XHRpZih0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmF1dG8pIHtcblx0XHRcdHRoaXMuc2VsZWN0b3Iub24oJ3BlZXItY29ubmVjdGVkJywgdGhpcy5kb1N1YnNjcmliZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2VsZWN0b3IuZWFjaCh0aGlzLmRvU3Vic2NyaWJlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcbn07XG5cblN1YnNjcmlwdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcblx0Zm9yKHZhciBpID0gMDsgaTx0aGlzLnN1Yklkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbm5lY3Rpb24udW5zdWJzY3JpYmUodGhpcy5zdWJJZHNbaV0pO1xuXHR9XG5cdHRoaXMuc3ViSWRzID0gW107XG5cdHRoaXMuc2VsZWN0b3IucmVtb3ZlTGlzdGVuZXIoJ3BlZXItY29ubmVjdGVkJywgdGhpcy5kb1N1YnNjcmliZSk7XG5cdHRoaXMuc3RhdGUgPSBcImNsb3NlZFwiO1xufTtcblxuU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5fYWRkU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0cGFyYW1zID0ge307XG5cdGZvcih2YXIgayBpbiB0aGlzLnBhcmFtcykgcGFyYW1zW2tdID0gdGhpcy5wYXJhbXNba107XG5cdHBhcmFtcy50YXJnZXQgPSBwZWVySWQ7XG5cdHBhcmFtcy50b2tlbiA9IHRva2VuO1xuXHR2YXIgc3ViSWQgPSBjb25uZWN0aW9uLnN1YnNjcmliZShwYXJhbXMsIGZ1bmN0aW9uKGVyciwgZGF0YSl7XG5cdFx0dGhhdC5jYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7XG5cdH0pO1xuXHRpZih0aGlzLm9wdGlvbnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuc3ViSWRzKSlcblx0XHR0aGlzLm9wdGlvbnMuc3ViSWRzW3BlZXJJZF0gPSBzdWJJZDtcblx0cmV0dXJuIHN1YklkO1xufTtcblxuXG5cblxuXG4vLyBMZWdhY3kgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4vKiogQGRlcHJlY2F0ZWQgICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmxpc3RlbiA9IGZ1bmN0aW9uKCl7fTtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fX29sZF9kZXByZWNhdGVkX3Vuc3Vic2NyaWJlID0gZnVuY3Rpb24oc3ViSWRzKSB7XG5cdHRoaXMuZWFjaChmdW5jdGlvbihwZWVySWQpe1xuXHRcdHZhciBzdWJJZCA9IHN1Yklkc1twZWVySWRdO1xuXHRcdGlmKHN1YklkKSBjb25uZWN0aW9uLnVuc3Vic2NyaWJlKHN1YklkKTtcblx0fSk7XG5cdHJldHVybiB0aGlzO1xufVxuXG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBkMTtcbiIsInZhciBkMSA9IHJlcXVpcmUoJy4vRGl5YVNlbGVjdG9yLmpzJyk7XG5cbnJlcXVpcmUoJy4vc2VydmljZXMvdGltZXIvdGltZXIuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvcnRjL3J0Yy5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9leHBsb3Jlci9leHBsb3Jlci5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9waWNvL3BpY28uanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvdmlld2VyX2V4cGxvcmVyL3ZpZXdlcl9leHBsb3Jlci5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9pZXEvaWVxLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL25ldHdvcmtJZC9OZXR3b3JrSWQuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvbWFwcy9tYXBzLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL3BlZXJBdXRoL1BlZXJBdXRoLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL21lc2hOZXR3b3JrL01lc2hOZXR3b3JrLmpzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzL3ZlcmJvc2UvVmVyYm9zZS5qcycpO1xucmVxdWlyZSgnLi91dGlscy9lbmNvZGluZy9lbmNvZGluZy5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9zdGF0dXMvc3RhdHVzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZDE7XG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5EaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG5cbmZ1bmN0aW9uIGV4cGxvcmVyKG5vZGUpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdHJldHVybiB0aGlzO1xufVxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmxpc3RGaWxlcyA9IGZ1bmN0aW9uKGZpbGUsIGNhbGxiYWNrKXtcdC8vYWRkIGEgcGF0aCBpbiBkYXRhIHRvIGxpc3QgZmlsZXMgaW4gVEhJUyBwYXRoXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ2V4cGxvcmVyJyxcblx0XHRmdW5jOiAnTGlzdEZpbGVzJyxcblx0XHQgZGF0YToge2VsdDogZmlsZX1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuICAgICBcdFx0XG5cdFx0XHRpZihkYXRhKXtcblx0XHRcdFx0Y2FsbGJhY2socGVlcklkLCBudWxsLCBkYXRhKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZXJyKXtcblx0XHRcdFx0Y2FsbGJhY2socGVlcklkLCBlcnIsIG51bGwpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB0aGlzO1xufTtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5vcGVuRmlsZSA9IGZ1bmN0aW9uKGZpbGUsIHR5cGUsIGNhbGxiYWNrKXtcblx0XHR0aGlzLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ2V4cGxvcmVyJyxcblx0XHRcdGZ1bmM6ICdPcGVuRmlsZScsXG5cdFx0XHRkYXRhOntcblx0XHRcdFx0ZmlsZTogZmlsZSxcblx0XHRcdFx0dHlwZTogdHlwZVxuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRcdGNhbGxiYWNrKHBlZXJJZCwgbnVsbCwgZGF0YSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcbn07XG5cblxuXG52YXIgZXhwID0ge1xuXHRcdGV4cGxvcmVyOiBleHBsb3JlclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDtcbiIsIi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAgIFRvZG8gOlxuICAgY2hlY2sgZXJyIGZvciBlYWNoIGRhdGFcbiAgIGltcHJvdmUgQVBJIDogZ2V0RGF0YShzZW5zb3JOYW1lLCBkYXRhQ29uZmlnKVxuICAgcmV0dXJuIGFkYXB0ZWQgdmVjdG9yIGZvciBkaXNwbGF5IHdpdGggRDMgdG8gcmVkdWNlIGNvZGUgaW4gSUhNID9cbiAgIHVwZGF0ZURhdGEoc2Vuc29yTmFtZSwgZGF0YUNvbmZpZylcbiAgIHNldCBhbmQgZ2V0IGZvciB0aGUgZGlmZmVyZW50IGRhdGFDb25maWcgcGFyYW1zXG5cbiovXG5cbnZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuXG52YXIgTWVzc2FnZSA9IHJlcXVpcmUoJy4uL21lc3NhZ2UnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IHRydWU7XG52YXIgTG9nZ2VyID0ge1xuXHRsb2c6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0fSxcblxuXHRlcnJvcjogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG5cdH1cbn07XG5cbi8qKlxuICpcdGNhbGxiYWNrIDogZnVuY3Rpb24gY2FsbGVkIGFmdGVyIG1vZGVsIHVwZGF0ZWRcbiAqICovXG5mdW5jdGlvbiBJRVEoc2VsZWN0b3Ipe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0dGhpcy5kYXRhTW9kZWw9e307XG5cdHRoaXMuX2NvZGVyID0gc2VsZWN0b3IuZW5jb2RlKCk7XG5cblxuXHQvKioqIHN0cnVjdHVyZSBvZiBkYXRhIGNvbmZpZyAqKipcblx0XHQgY3JpdGVyaWEgOlxuXHRcdCAgIHRpbWU6IGFsbCAzIHRpbWUgY3JpdGVyaWEgc2hvdWxkIG5vdCBiZSBkZWZpbmVkIGF0IHRoZSBzYW1lIHRpbWUuIChyYW5nZSB3b3VsZCBiZSBnaXZlbiB1cClcblx0XHQgICAgIGJlZzoge1tudWxsXSx0aW1lfSAobnVsbCBtZWFucyBtb3N0IHJlY2VudCkgLy8gc3RvcmVkIGEgVVRDIGluIG1zIChudW0pXG5cdFx0ICAgICBlbmQ6IHtbbnVsbF0sIHRpbWV9IChudWxsIG1lYW5zIG1vc3Qgb2xkZXN0KSAvLyBzdG9yZWQgYXMgVVRDIGluIG1zIChudW0pXG5cdFx0ICAgICByYW5nZToge1tudWxsXSwgdGltZX0gKHJhbmdlIG9mIHRpbWUocG9zaXRpdmUpICkgLy8gaW4gcyAobnVtKVxuXHRcdCAgIHJvYm90OiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0ICAgcGxhY2U6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgb3BlcmF0b3I6IHtbbGFzdF0sIG1heCwgbW95LCBzZH0gLSggbWF5YmUgbW95IHNob3VsZCBiZSBkZWZhdWx0XG5cdFx0IC4uLlxuXG5cdFx0IHNlbnNvcnMgOiB7W251bGxdIG9yIEFycmF5T2YgU2Vuc29yTmFtZX1cblxuXHRcdCBzYW1wbGluZzoge1tudWxsXSBvciBpbnR9XG5cdCovXG5cdHRoaXMuZGF0YUNvbmZpZyA9IHtcblx0XHRjcml0ZXJpYToge1xuXHRcdFx0dGltZToge1xuXHRcdFx0XHRiZWc6IG51bGwsXG5cdFx0XHRcdGVuZDogbnVsbCxcblx0XHRcdFx0cmFuZ2U6IG51bGwgLy8gaW4gc1xuXHRcdFx0fSxcblx0XHRcdHJvYm90OiBudWxsLFxuXHRcdFx0cGxhY2U6IG51bGxcblx0XHR9LFxuXHRcdG9wZXJhdG9yOiAnbGFzdCcsXG5cdFx0c2Vuc29yczogbnVsbCxcblx0XHRzYW1wbGluZzogbnVsbCAvL3NhbXBsaW5nXG5cdH07XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDpcbiAqIHtcbiAqXHRcInNlbnNldXJYWFwiOiB7XG4gKlx0XHRcdGRhdGE6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRwbGFjZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHF1YWxpdHlJbmRleDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJhbmdlOiBbRkxPQVQsIEZMT0FUXSxcbiAqXHRcdFx0dW5pdDogc3RyaW5nLFxuICpcdFx0bGFiZWw6IHN0cmluZ1xuICpcdFx0fSxcbiAqXHQgLi4uIChcInNlbnNldXJzWVlcIilcbiAqIH1cbiAqL1xuSUVRLnByb3RvdHlwZS5nZXREYXRhTW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59O1xuSUVRLnByb3RvdHlwZS5nZXREYXRhUmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwucmFuZ2U7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tSUVRXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtJRVF9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuSUVRLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBiZWcgYW5kIGVuZC5cbiAqIElmIHBhcmFtIGRlZmluZWRcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVCZWcgLy8gbWF5IGJlIG51bGxcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVFbmQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcmV0dXJuIHtJRVF9IHRoaXNcbiAqIElmIG5vIHBhcmFtIGRlZmluZWQ6XG4gKlx0QHJldHVybiB7T2JqZWN0fSBUaW1lIG9iamVjdDogZmllbGRzIGJlZyBhbmQgZW5kLlxuICovXG5JRVEucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZUJlZyxuZXdUaW1lRW5kLCBuZXdSYW5nZSl7XG5cdGlmKG5ld1RpbWVCZWcgfHwgbmV3VGltZUVuZCB8fCBuZXdSYW5nZSkge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyA9IG5ld1RpbWVCZWcuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCA9IG5ld1RpbWVFbmQuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlID0gbmV3UmFuZ2U7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB7XG5cdFx0XHRiZWc6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzXG4gKiBTZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSBwbGFjZUlkcyBsaXN0IG9mIHBsYWNlIElkc1xuICogR2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2YgcGxhY2UgSWRzXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YVBsYWNlSWRzID0gZnVuY3Rpb24ocGxhY2VJZHMpe1xuXHRpZihwbGFjZUlkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZUlkID0gcGxhY2VJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2U7XG59O1xuLyoqXG4gKiBHZXQgZGF0YSBieSBzZW5zb3IgbmFtZS5cbiAqXHRAcGFyYW0ge0FycmF5W1N0cmluZ119IHNlbnNvck5hbWUgbGlzdCBvZiBzZW5zb3JzXG4gKi9cbklFUS5wcm90b3R5cGUuZ2V0RGF0YUJ5TmFtZSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzKXtcblx0dmFyIGRhdGE9W107XG5cdGZvcih2YXIgbiBpbiBzZW5zb3JOYW1lcykge1xuXHRcdGRhdGEucHVzaCh0aGlzLmRhdGFNb2RlbFtzZW5zb3JOYW1lc1tuXV0pO1xuXHR9XG5cdHJldHVybiBkYXRhO1xufTtcbi8qKlxuICogVXBkYXRlIGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cbklFUS5wcm90b3R5cGUudXBkYXRlRGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwiaWVxXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJzcGxSZXFcIixcblx0XHRcdGRhdGFDb25maWc6IHRoYXQuZGF0YUNvbmZpZ1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIltcIit0aGF0LmRhdGFDb25maWcuc2Vuc29ycytcIl0gUmVjdiBlcnI6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiVXBkYXRlRGF0YTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5kYXRhQ29uZmlnKSk7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJEYXRhIHJlcXVlc3QgZmFpbGVkIChcIitkYXRhLmhlYWRlci5lcnJvci5zdCtcIik6IFwiK2RhdGEuaGVhZGVyLmVycm9yLm1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vTG9nZ2VyLmxvZyhKU09OLnN0cmluZ2lmeSh0aGF0LmRhdGFNb2RlbCkpO1xuXHRcdHRoYXQuX2dldERhdGFNb2RlbEZyb21SZWN2KGRhdGEpO1xuXG5cdFx0Ly8gTG9nZ2VyLmxvZyh0aGF0LmdldERhdGFNb2RlbCgpKTtcblxuXHRcdGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGF0KTsgLy8gYmluZCBjYWxsYmFjayB3aXRoIElFUVxuXHRcdGNhbGxiYWNrKHRoYXQuZ2V0RGF0YU1vZGVsKCkpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xufTtcblxuSUVRLnByb3RvdHlwZS5faXNEYXRhTW9kZWxXaXRoTmFOID0gZnVuY3Rpb24oKSB7XG5cdHZhciBkYXRhTW9kZWxOYU49ZmFsc2U7XG5cdHZhciBzZW5zb3JOYW47XG5cdGZvcih2YXIgbiBpbiB0aGlzLmRhdGFNb2RlbCkge1xuXHRcdHNlbnNvck5hbiA9IHRoaXMuZGF0YU1vZGVsW25dLmRhdGEucmVkdWNlKGZ1bmN0aW9uKG5hblByZXMsZCkge1xuXHRcdFx0cmV0dXJuIG5hblByZXMgJiYgaXNOYU4oZCk7XG5cdFx0fSxmYWxzZSk7XG5cdFx0ZGF0YU1vZGVsTmFOID0gZGF0YU1vZGVsTmFOICYmIHNlbnNvck5hbjtcblx0XHRMb2dnZXIubG9nKG4rXCIgd2l0aCBuYW4gOiBcIitzZW5zb3JOYW4rXCIgKFwiK2RhdGFNb2RlbE5hTitcIikgLyBcIit0aGlzLmRhdGFNb2RlbFtuXS5kYXRhLmxlbmd0aCk7XG5cdH1cbn07XG5cbklFUS5wcm90b3R5cGUuZ2V0Q29uZmluZW1lbnRMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmNvbmZpbmVtZW50O1xufTtcblxuSUVRLnByb3RvdHlwZS5nZXRBaXJRdWFsaXR5TGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5haXJRdWFsaXR5O1xufTtcblxuSUVRLnByb3RvdHlwZS5nZXRFbnZRdWFsaXR5TGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5lbnZRdWFsaXR5O1xufTtcblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cbklFUS5wcm90b3R5cGUuX2dldERhdGFNb2RlbEZyb21SZWN2ID0gZnVuY3Rpb24oZGF0YSl7XG5cdHZhciBkYXRhTW9kZWw9bnVsbDtcblx0XG5cdGlmKGRhdGEgJiYgZGF0YS5oZWFkZXIpIHtcblx0XHRmb3IgKHZhciBuIGluIGRhdGEpIHtcblx0XHRcdGlmKG4gIT0gXCJoZWFkZXJcIiAmJiBuICE9IFwiZXJyXCIpIHtcblxuXHRcdFx0XHRpZihkYXRhW25dLmVyciAmJiBkYXRhW25dLmVyci5zdD4wKSB7XG5cdFx0XHRcdFx0TG9nZ2VyLmVycm9yKG4rXCIgd2FzIGluIGVycm9yOiBcIitkYXRhW25dLmVyci5tc2cpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRpZighZGF0YU1vZGVsKVxuXHRcdFx0XHRcdGRhdGFNb2RlbD17fTtcblxuXHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZVJhbmdlPWRhdGFbbl0udGltZVJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBsYWJlbCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdW5pdCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGluZGV4UmFuZ2UgKi9cblx0XHRcdFx0ZGF0YU1vZGVsW25dLnF1YWxpdHlDb25maWc9e1xuXHRcdFx0XHRcdC8qIGNvbmZvcnRSYW5nZTogZGF0YVtuXS5jb25mb3J0UmFuZ2UsICovXG5cdFx0XHRcdFx0aW5kZXhSYW5nZTogZGF0YVtuXS5pbmRleFJhbmdlXG5cdFx0XHRcdH07XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5kYXRhID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLmRhdGEsJ2I2NCcsNCk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS50aW1lID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnRpbWUsJ2I2NCcsOCk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5xdWFsaXR5SW5kZXggPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uaW5kZXgsJ2I2NCcsNCk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5yb2JvdElkID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnJvYm90SWQsJ2I2NCcsNCk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5wbGFjZUlkID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnBsYWNlSWQsJ2I2NCcsNCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdExvZ2dlci5lcnJvcihcIk5vIERhdGEgdG8gcmVhZCBvciBoZWFkZXIgaXMgbWlzc2luZyAhXCIpO1xuXHR9XG5cdHRoaXMuZGF0YU1vZGVsPWRhdGFNb2RlbDtcblx0cmV0dXJuIGRhdGFNb2RlbDtcbn07XG5cbi8qKiBjcmVhdGUgSUVRIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLklFUSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgSUVRKHRoaXMpO1xufTtcbiIsIkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIG1hcCB7U3RyaW5nfSBtYXAncyBuYW1lXG4gKi9cbmZ1bmN0aW9uIE1hcHMocGVlcklkcykge1xuXG5cblx0dGhpcy5fcGVlcklkcyA9IHBlZXJJZHM7XG5cdHRoaXMuX3N1YklkcyA9IHt9OyAvLyBsaXN0IG9mIHN1YnNjcmlwdGlvbiBJZCAoZm9yIHVuc3Vic2NyaXB0aW9uIHB1cnBvc2UpIGUuZyB7cGVlcklkMDogc3ViSWQwLCAuLi59XG5cblx0Ly8gbGlzdCBvZiByZWdpc3RlcmVkIHBsYWNlIGJ5IERpeWFcblx0dGhpcy5fZGl5YXMgPSB7fTtcblxuXHQvLyBnZXQgYSBsaXN0IG9mIERpeWEgZnJvbSBzZWxlY3RvciBhbmQgc29ydCBpdFxuXHR0aGlzLmxpc3REaXlhID0gdGhpcy5fcGVlcklkcztcbn1cbmluaGVyaXRzKE1hcHMsIEV2ZW50RW1pdHRlcik7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vIFN0YXRpYyBmdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4vKipcbiAqIHN0YXRpYyBmdW5jdGlvbiwgZ2V0IGN1cnJlbnQgcGxhY2UgZnJvbSBkaXlhbm9kZVxuICpcbiAqIEBwYXJhbSBzZWxlY3RvciB7UmVnRXhwL1N0cmluZy9BcnJheTxTdHJpbmc+fSBzZWxlY3RvciBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbiAqIEBwYXJhbSBtYXAge1N0cmluZ30gbWFwJ3MgbmFtZVxuICogQHBhcmFtIGZ1bmMge2Z1bmN0aW9uKCl9IGNhbGxiYWNrIGZ1bmN0aW9uIHdpdGggcmV0dXJuIHBlZXJJZCwgZXJyb3IgYW5kIGRhdGEgKHsgbWFwSWQsIGxhYmVsLCBuZXVyb25JZCwgIHgsIHl9KVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdldEN1cnJlbnRQbGFjZSA9IGZ1bmN0aW9uKCBwZWVySWQsIGZ1bmMpIHtcblx0dGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0ZnVuYzogJ0dldEN1cnJlbnRQbGFjZScsXG5cdFx0b2JqOiBbIHBlZXJJZCBdXG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0ZnVuYyhwZWVySWQsIGVyciwgZGF0YSk7XG5cdH0pO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy9cbi8vLy8gSW50ZXJuYWwgZnVuY3Rpb25zIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vL1xuXG4vKipcbiAqIHJvdW5kIGZsb2F0IHRvIHNpeCBkZWNpbWFscyB0byBjb21wYXJlLCBhcyB0aGUgbnVtYmVyIGluIGpzIGlzIGVuY29kZWQgaW5cbiAqIElFRUUgNzU0IHN0YW5kYXJkIH4gYXJvdW5kIDE2IGRlY2ltYWwgZGlnaXRzIHByZWNpc2lvbiwgd2UgbGltaXQgdG8gNiBmb3JcbiAqIGVhc2llciBjb21wYXJpc2lvbiBhbmQgZXJyb3IgZHVlIHRvIGFyaXRobWV0aWMgb3BlcmF0aW9uXG4gKi9cbk1hcHMucHJvdG90eXBlLl9yb3VuZCA9IGZ1bmN0aW9uICh2YWwpIHtcblx0Ly8gcm91ZGluZyB0byBzaXggZGVjaW1hbHNcblx0cmV0dXJuIE1hdGgucm91bmQocGFyc2VGbG9hdCh2YWwpICogMTAwMDAwMCkgLyAxMDAwMDAwO1xufTtcblxuLyoqXG4gKiBjaGVjayBlcXVhbCB3aXRoIHJvdW5kaW5nXG4gKi9cbk1hcHMucHJvdG90eXBlLl9pc0Zsb2F0RXF1YWwgPSBmdW5jdGlvbiAodmFsMSwgdmFsMikge1xuXHQvLyByb3VkaW5nIHRvIHR3byBkZWNpbWFsc1xuXHRyZXR1cm4gdGhpcy5fcm91bmQodmFsMSkgPT09IHRoaXMuX3JvdW5kKHZhbDIpO1xufTtcblxuLyoqXG4gKiBjaGVjayBpZiBtYXAgaXMgbW9kaWZpZWQgYnkgY29tcGFyZSB3aXRoIGludGVybmFsIGxpc3RcbiAqL1xuTWFwcy5wcm90b3R5cGUubWFwSXNNb2RpZmllZCA9IGZ1bmN0aW9uKHBlZXJJZCwgbWFwX2luZm8pIHtcblx0Ly8gZG91YmxlIGNoZWNrXG5cdG1hcF9pbmZvLnNjYWxlID0gQXJyYXkuaXNBcnJheShtYXBfaW5mby5zY2FsZSkgPyBtYXBfaW5mby5zY2FsZVswXSA6IG1hcF9pbmZvLnNjYWxlXG5cblx0Ly8gdWdseSBjb2RlIGJ1dCBxdWljayBjb21wYXJlIHRvIGxvb3Bcblx0cmV0dXJuICEodGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC5zY2FsZSwgbWFwX2luZm8uc2NhbGUpICYmXG5cdFx0XHRcdHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBhdGgucm90YXRlLCBtYXBfaW5mby5yb3RhdGUpICYmXG5cdFx0XHRcdHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBhdGgudHJhbnNsYXRlWzBdLCBtYXBfaW5mby50cmFuc2xhdGVbMF0pICYmXG5cdFx0XHRcdHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBhdGgudHJhbnNsYXRlWzFdLCBtYXBfaW5mby50cmFuc2xhdGVbMV0pICYmXG5cdFx0XHRcdHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBhdGgucmF0aW8sIG1hcF9pbmZvLnJhdGlvKSk7XG59XG5cbi8qKlxuICogY2hlY2sgaWYgcGxhY2UgaXMgbW9kaWZpZWQgYnkgY29tcGFyZSB3aXRoIGludGVybmFsIGxpc3RcbiAqL1xuTWFwcy5wcm90b3R5cGUucGxhY2VJc01vZGlmaWVkID0gZnVuY3Rpb24ocGVlcklkLCBwbGFjZV9pbmZvKSB7XG5cdC8vIHVnbHkgY29kZSBidXQgcXVpY2sgY29tcGFyZSB0byBsb29wXG5cdHJldHVybiAhKHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBsYWNlc1twbGFjZV9pbmZvLmlkXS54LCBwbGFjZV9pbmZvLngpICYmXG5cdFx0XHRcdHRoaXMuX2lzRmxvYXRFcXVhbCh0aGlzLl9kaXlhc1twZWVySWRdLnBsYWNlc1twbGFjZV9pbmZvLmlkXS55LCBwbGFjZV9pbmZvLnkpKTtcbn1cblxuLy8gLyoqXG4vLyAgKiBhZGQgYSBEaXlhIHdoZW4gc2VsZWN0b3IgY2hhbmdlZCBhbmQgaGFkIG5ldyBEaXlhXG4vLyAgKlxuLy8gICogQHBhcmFtIHBlZXJJZCB7U3RyaW5nfSBwZWVySWQgb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4vLyAgKiBAcGFyYW0gY29sb3Ige2QzX3JnYn0gZDMgY29sb3Jcbi8vICAqL1xuLy8gTWFwcy5wcm90b3R5cGUuYWRkUGVlciA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuLy8gXHR0aGlzLl9kaXlhc1twZWVySWRdID0ge1xuLy8gXHRcdG1hcElkOiBudWxsLFxuLy8gXHRcdHBhdGg6IG51bGwsIC8vIHt0cmFuc2xhdGU6IFtdLCBzY2FsZTogbnVsbCwgcm90YXRlOiBudWxsfSxcbi8vIFx0XHRwbGFjZXM6IHt9LFxuLy8gXHRcdG1hcElzTW9kaWZpZWQ6IGZhbHNlLFxuLy8gXHR9O1xuLy8gfVxuXG4vKipcbiAqIHJlbW92ZSBhIERpeWEgd2hlbiB0aGVyZSBpcyBhIHByb2JsZW0gaW4gbGlzdGVuIG1hcCAoc3Vic2NyaXB0aW9uKVxuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICovXG5NYXBzLnByb3RvdHlwZS5yZW1vdmVQZWVyID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdGlmICh0aGlzLl9kaXlhc1twZWVySWRdKSB7XG5cdFx0Ly8gcmVtb3ZlXG5cdFx0ZGVsZXRlIHRoaXMuX2RpeWFzW3BlZXJJZF07XG5cdFx0dGhpcy5lbWl0KFwicGVlci11bnN1YnNjcmliZWRcIiwgcGVlcklkKTtcblx0fVxuXG5cdC8vIG5lY2Nlc3Nhcnk/IGlmIGRpeWFub2RlIHJlY29ubmVjdD9cblx0aWYgKHRoaXMuX3N1Yklkc1twZWVySWRdICE9PSBudWxsICYmICFpc05hTih0aGlzLl9zdWJJZHNbcGVlcklkXSkpIHtcblx0XHQvLyBleGlzdGVkIHN1YnNjcmlwdGlvbiA/P1xuXHRcdC8vIHVuc3Vic2NyaWJlXG5cdFx0ZDEocGVlcklkKS51bnN1YnNjcmliZSh0aGlzLl9zdWJJZHMpO1xuXHRcdGRlbGV0ZSB0aGlzLl9zdWJJZHNbcGVlcklkXTtcblx0fVxufTtcblxuLyoqXG4gKiBjb25uZWN0IHRvIHNlcnZpY2UgbWFwXG4gKi9cbk1hcHMucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdC8vIG9wdGlvbnMgZm9yIHN1YnNjcmlwdGlvblxuXHR2YXIgb3B0aW9ucyA9IHtcblx0XHRhdXRvOiB0cnVlLCAvLyBhdXRvIHJlc3Vic2NyaWJlP1xuXHRcdHN1YklkczogW10gLy8gaW4gZmFjdCwgaXQgaXMgYSBsaXN0LCBidXQgdGhlIGNvZGUgaW4gRGl5YVNlbGVjdG9yIGNoZWNrIGZvciBhcnJheVxuXHR9O1xuXG5cdC8vIHN1YnNjcmliZSBmb3IgbWFwIHNlcnZpY2Vcblx0ZDEoXCIjc2VsZlwiKS5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdtYXBzJyxcblx0XHRmdW5jOiAnTGlzdGVuTWFwJyxcblx0XHRvYmo6IHRoaXMuX3BlZXJJZHMgXG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0aWYgKGVyciB8fCBkYXRhLmVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIk1hcHM6IGZhaWwgdG8gZ2V0IGluZm8gZnJvbSBtYXAsIGVycm9yOlwiLCBlcnIgfHwgZGF0YS5lcnJvciwgXCIhXCIpOyAvLyBtb3N0bHkgUGVlckRpc2Nvbm5lY3RlZFxuXG5cdFx0XHQvLyByZW1vdmUgdGhhdCBwZWVyXG5cdFx0XHQvL3RoYXQucmVtb3ZlUGVlcihwZWVySWQpOy8vLi4uXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGRhdGEgPT0gbnVsbCkgcmV0dXJuIDtcblxuXHRcdHBlZXJJZCA9IGRhdGEucGVlcklkO1xuXG5cdFx0aWYoIXBlZXJJZCl7XG5cdFx0XHRjb25zb2xlLmxvZyhcIk1hcHM6IHJlY2VpdmVkIGluZm8gd2l0aG91dCBhIHBlZXJJZFwiKTsgICAgICAgXG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdGlmICghQXJyYXkuaXNBcnJheShkYXRhLnBsYWNlcykpIHsgLy8gd2lubmVyLCB0aGlzIGlzbid0IDFzdCBtZXNzYWdlXG5cdFx0XHRkYXRhLnBsYWNlcyA9IFtdO1xuXHRcdH1cblxuXHRcdC8vIGRhdGEucGxhY2UgaXMgY3VycmVudCBwbGFjZVxuXHRcdGlmIChkYXRhLnBsYWNlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGRhdGEucGxhY2VzLnB1c2goZGF0YS5wbGFjZSk7IC8vIG1heSBiZSBudWxsIC4uLlxuXHRcdH1cblxuXHRcdHZhciBtYXBfaW5mbyA9IG51bGwsIHBsYWNlc19pbmZvID0gW107XG5cblx0XHRpZihkYXRhLnR5cGUgPT09ICdNYXBJbmZvJyl7XG5cdFx0XHQvLyBkYXRhIDoge2lkLCBuYW1lLCBwbGFjZXMsIHJvdGF0ZSwgc2NhbGUsIHR4LCB0eSwgcmF0aW99XG5cdFx0XHRpZiAodGhhdC5fZGl5YXNbcGVlcklkXSA9PSBudWxsKSB7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0gPSB7XG5cdFx0XHRcdFx0cGF0aDoge1xuXHRcdFx0XHRcdFx0dHJhbnNsYXRlOiBbZGF0YS50eCwgZGF0YS50eV0sXG5cdFx0XHRcdFx0XHRzY2FsZTogZGF0YS5zY2FsZSxcblx0XHRcdFx0XHRcdHJvdGF0ZTogZGF0YS5yb3RhdGUsXG5cdFx0XHRcdFx0XHRyYXRpbzogZGF0YS5yYXRpb1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cGxhY2VzOiB7fVxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aCA9PSBudWxsKSB7XG5cdFx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoID0ge307XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoLnRyYW5zbGF0ZSA9IFtkYXRhLnR4LCBkYXRhLnR5XTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoLnNjYWxlID0gZGF0YS5zY2FsZTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoLnJvdGF0ZSA9IGRhdGEucm90YXRlO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGgucmF0aW8gPSBkYXRhLnJhdGlvO1xuXHRcdFx0XHRpZiAodGhhdC5fZGl5YXNbcGVlcklkXS5wbGFjZXMgPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzID0ge307XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1hcF9pbmZvID0ge1xuXHRcdFx0XHRpZDogZGF0YS5pZCxcblx0XHRcdFx0bmFtZTogZGF0YS5uYW1lLFxuXHRcdFx0XHRyb3RhdGU6IGRhdGEucm90YXRlLFxuXHRcdFx0XHRzY2FsZTogZGF0YS5zY2FsZSxcblx0XHRcdFx0dHJhbnNsYXRlOiBbZGF0YS50eCwgZGF0YS50eV0sXG5cdFx0XHRcdHJhdGlvOiBkYXRhLnJhdGlvXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIHNhdmUgZGF0YSB2YWx1ZXNcblx0XHRkYXRhLnBsYWNlcy5tYXAoZnVuY3Rpb24ocGxhY2UpIHtcblx0XHRcdGlmIChwbGFjZSkgeyAvLyBudWxsIGlmIGN1cnJlbnRwbGFjZSBpc24ndCBpbml0IGluIERpeWFOb2RlXG5cdFx0XHRcdC8vIHBsYWNlIHsgbWFwSWQsIGxhYmVsLCBuZXVyb25JZCwgIHgsIHl9XG5cblx0XHRcdFx0Ly8gbmV1cm9uSWQgKGFsc28gcGxhY2UgJ3MgSWQpXG5cdFx0XHRcdHZhciBpZCA9IHBsYWNlLm5ldXJvbklkO1xuXG5cdFx0XHRcdC8vIFVwZGF0ZSBpbnRlcm5hbCBsaXN0XG5cdFx0XHRcdC8vIGNvbnZlcnQgZnJvbSBEaXlhIHBhcmFtZXRlciAoMC4uMSBrbSkgdG8gZGl5YS1tYXAgKDAuLjEwMDAwMClcblx0XHRcdFx0cGxhY2UgPSB7XG5cdFx0XHRcdFx0aWQ6IGlkLFxuXHRcdFx0XHRcdGxhYmVsOiBwbGFjZS5sYWJlbCxcblx0XHRcdFx0XHR4OiBwbGFjZS54LFxuXHRcdFx0XHRcdHk6IHBsYWNlLnksXG5cdFx0XHRcdFx0dDogMzYwICogcGxhY2UudFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmICh0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlc1tpZF0gPT0gbnVsbCkgeyAvLyBub25leGlzdGVudCBwbGFjZVxuXHRcdFx0XHRcdC8vIGlmIGlzIG51bGwgb3IgdW5kZWZpbmVkXG5cdFx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wbGFjZXNbaWRdID0gcGxhY2U7IC8vIHNhdmUgaXRcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHBsYWNlc19pbmZvLnB1c2goT2JqZWN0LmNyZWF0ZShwbGFjZSkpOy8vIGNyZWF0ZSBhIGNvcHkgdG8gc2VuZCB0byB1c2VyXG5cblx0XHRcdFx0Ly8gc2F2ZSBiYXNlIHBsYWNlIChmaXJzdCBrbm93biBwbGFjZSwgYWxzbyBmaXJzdCBlbGVtZW50IG9mIHBsYWNlcyBhcnJheSlcblx0XHRcdFx0Ly8gdXNlbGVzcyBhdCB0aGUgbW9tZW50XG5cdFx0XHRcdC8vIGlmICghdGhhdC5fZGl5YXNbcGVlcklkXS5iYXNlUGxhY2UpIHRoYXQuX2RpeWFzW3BlZXJJZF0uYmFzZVBsYWNlID0gcGxhY2U7XG5cdFx0XHR9IGVsc2UgeyAvLyBjdXJyZW50IHBsYWNlIGlzIG51bGxcblx0XHRcdFx0cGxhY2VzX2luZm8ucHVzaChudWxsKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmIChwbGFjZXNfaW5mby5sZW5ndGggPT09IDApIHBsYWNlc19pbmZvID0gbnVsbDtcblxuXHRcdHRoYXQuZW1pdChcInBlZXItc3Vic2NyaWJlZFwiLHBlZXJJZCwgbWFwX2luZm8sIHBsYWNlc19pbmZvKTtcblx0fSwgb3B0aW9ucyk7XG5cblx0Zm9yICh2YXIgcGVlcklkIGluIG9wdGlvbnMuc3ViSWRzKSB7XG5cdFx0aWYgKHRoaXMuX3N1Yklkc1twZWVySWRdICE9PSBudWxsICYmICFpc05hTih0aGlzLl9zdWJJZHNbcGVlcklkXSkpIHtcblx0XHRcdC8vIGV4aXN0ZWQgc3Vic2NyaXB0aW9uID8/XG5cdFx0XHRkMShcIiNzZWxmXCIpLnVuc3Vic2NyaWJlKHRoaXMuX3N1Yklkcylcblx0XHRcdGRlbGV0ZSB0aGlzLl9zdWJJZHNbcGVlcklkXTtcblx0XHRcdGNvbnNvbGUubG9nKFwiTWFwczogYnVnOiBleGlzdGVkIHN1YnNjcmlwdGlvbiA/P1wiKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBzYXZlIHN1YklkIGZvciBsYXRlciB1bnN1YnNjcmlwdGlvblxuXHRcdFx0dGhpcy5fc3ViSWRzW3BlZXJJZF0gPSBvcHRpb25zLnN1Yklkc1twZWVySWRdO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIGRpc2Nvbm5lY3QgZnJvbSBzZXJ2aWNlIG1hcCwgZnJlZSBldmVyeXRoaW5nIHNvIGl0IGlzIHNhZmUgdG8gZ2FyYmFnZSBjb2xsZWN0ZSB0aGlzIHNlcnZpY2VcbiAqL1xuTWFwcy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGQxKFwiI3NlbGZcIikudW5zdWJzY3JpYmUodGhpcy5fc3ViSWRzKTtcblx0dGhpcy5fZGl5YXMgPSB7fTsvLyBkZWxldGUgP1xuXHR0aGlzLl9wZWVySWRzLmZvckVhY2goZnVuY3Rpb24ocGVlcklkKSB7XG5cdFx0dGhhdC5lbWl0KFwicGVlci11bnN1YnNjcmliZWRcIiwgcGVlcklkKTtcblx0fSk7XG5cdHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG59XG5cbi8qKlxuICogc2F2ZSBtYXBcbiAqXG4gKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbiAqIEBwYXJhbSBtYXBfaW5mbyB7T2JqZWN0fSAoe3JvdGF0ZSwgc2NhbGUsIHRyYW5zbGF0ZX0pXG4gKiBAcGFyYW0gY2Ige0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIGVycm9yIGFzIGFyZ3VtZW50XG4gKi9cbk1hcHMucHJvdG90eXBlLnNhdmVNYXAgPSBmdW5jdGlvbiAocGVlcklkLCBtYXBfaW5mbywgY2IpIHtcblx0dmFyIF9tYXBfaW5mbyA9IE9iamVjdC5jcmVhdGUobWFwX2luZm8pOyAvLyBjcmVhdGUgYSBkdXBsaWNhdGUgb2YgbWFwX2luZm9cblx0dmFyIHRoYXQgPSB0aGlzO1xuXHQvLyBzYXZlIG1hcCdzIGluZm9cblx0X21hcF9pbmZvLnNjYWxlID0gQXJyYXkuaXNBcnJheShfbWFwX2luZm8uc2NhbGUpID8gX21hcF9pbmZvLnNjYWxlWzBdIDogX21hcF9pbmZvLnNjYWxlXG5cblx0aWYgKHRoaXMubWFwSXNNb2RpZmllZChwZWVySWQsIF9tYXBfaW5mbykpIHtcblx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdFx0ZnVuYzogJ1VwZGF0ZU1hcCcsXG5cdFx0XHRvYmo6IFsgcGVlcklkIF0sXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHNjYWxlOiBfbWFwX2luZm8uc2NhbGUsXG5cdFx0XHRcdHR4OiBfbWFwX2luZm8udHJhbnNsYXRlWzBdLFxuXHRcdFx0XHR0eTogX21hcF9pbmZvLnRyYW5zbGF0ZVsxXSxcblx0XHRcdFx0cm90YXRlOiBfbWFwX2luZm8ucm90YXRlLFxuXHRcdFx0XHRyYXRpbzogX21hcF9pbmZvLnJhdGlvXG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGguc2NhbGUgPSBfbWFwX2luZm8uc2NhbGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC5yb3RhdGUgPSBfbWFwX2luZm8ucm90YXRlO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGgudHJhbnNsYXRlWzBdID0gX21hcF9pbmZvLnRyYW5zbGF0ZVswXTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoLnRyYW5zbGF0ZVsxXSA9IF9tYXBfaW5mby50cmFuc2xhdGVbMV07XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2IpIGNiKGVycik7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGNiKSBjYihuZXcgRXJyb3IoXCJObyBjaGFuZ2UgdG8gbWFwICdcIiArIHRoaXMuX21hcCArIFwiJyFcIikpO1xuXHR9XG59XG5cbi8qKlxuICogdXBkYXRlIGV2ZXJ5IHBsYWNlc1xuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIHBsYWNlX2luZm8ge09iamVjdH0gKHsgaWQsIHgsIHl9KVxuICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gY2FsbGJhY2sgd2l0aCBlcnJvciBhcyBhcmd1bWVudFxuICovXG5NYXBzLnByb3RvdHlwZS5zYXZlUGxhY2UgPSBmdW5jdGlvbiAocGVlcklkLCBwbGFjZV9pbmZvLCBjYikge1xuXHQvLyBzYXZlIG1hcCdzIGluZm9cblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgZXJyb3IgPSBcIlwiO1xuXG5cdHZhciBfcGxhY2VfaW5mbyA9IE9iamVjdC5jcmVhdGUocGxhY2VfaW5mbyk7XG5cblx0Ly8gc2F2ZSBwbGFjZVxuXHRpZiAodGhpcy5wbGFjZUlzTW9kaWZpZWQocGVlcklkLCBfcGxhY2VfaW5mbykpIHtcblx0XHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdFx0ZnVuYzogJ1VwZGF0ZVBsYWNlJyxcblx0XHRcdG9iajogWyBwZWVySWQgXSxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0bmV1cm9uSWQ6IF9wbGFjZV9pbmZvLmlkLFxuXHRcdFx0XHR4OiBfcGxhY2VfaW5mby54LFxuXHRcdFx0XHR5OiBfcGxhY2VfaW5mby55XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlc1tfcGxhY2VfaW5mby5pZF0ueCA9IF9wbGFjZV9pbmZvLng7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW19wbGFjZV9pbmZvLmlkXS55ID0gX3BsYWNlX2luZm8ueTtcblx0XHRcdH1cblx0XHRcdGlmIChjYikgY2IoZXJyKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRpZiAoY2IpIGNiKG5ldyBFcnJvcihcIk5vIGNoYW5nZSB0byBwbGFjZSBuwrBcIiArIF9wbGFjZV9pbmZvLmlkICsgXCIhXCIpKTtcblx0fVxufVxuXG4vKipcbiAqIGRlbGV0ZSBldmVyeSBzYXZlZCBwbGFjZXMgb2YgRGl5YSAoY2hvb3NlbiBpbiBzZWxlY3RvcilcbiAqXG4gKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbiAqIEBwYXJhbSBjYiB7RnVuY3Rpb259IGNhbGxiYWNrIHdpdGggZXJyb3IgYXMgYXJndW1lbnRcbiAqL1xuTWFwcy5wcm90b3R5cGUuY2xlYXJQbGFjZXMgPSBmdW5jdGlvbihwZWVySWQsIGNiKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHRkMShcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdtYXBzJyxcblx0XHRmdW5jOiAnQ2xlYXJNYXAnLFxuXHRcdG9iajogWyBwZWVySWQgXVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdGlmIChlcnIgIT0gbnVsbCkge1xuXHRcdFx0Ly8gZGVsZXRlIGZyb20gaW50ZXJuYWwgbGlzdFxuXHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wbGFjZXMgPSB7fTtcblx0XHR9XG5cdFx0aWYgKGNiKSBjYihlcnIpO1xuXHR9KTtcbn1cblxuLy8gZXhwb3J0IGl0IGFzIG1vZHVsZSBvZiBEaXlhU2VsZWN0b3JcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubWFwcyA9IGZ1bmN0aW9uKHBlZXJJZHMpIHtcblx0dmFyIG1hcHMgPSBuZXcgTWFwcyhwZWVySWRzKTtcblxuXHRyZXR1cm4gbWFwcztcbn1cbiIsInZhciBEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG52YXIgZDEgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKTtcbnZhciBRID0gcmVxdWlyZSgncScpO1xuXG5cbmQxLmtub3duUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIGQxKFwiI3NlbGZcIikua25vd25QZWVycygpO1xufTtcbmQxLmtwID0gZDEua25vd25QZWVycztcblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmtub3duUGVlcnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdHRoaXMucmVxdWVzdCh7c2VydmljZTogJ21lc2hOZXR3b3JrJyxmdW5jOiAnTGlzdEtub3duUGVlcnMnfSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdHZhciBwZWVycyA9IFtdO1xuXHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdH0pO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuXG5cbmQxLmxpc3Rlbk1lc2hOZXR3b3JrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0ZDEoLy4qLykuc3Vic2NyaWJlKHsgc2VydmljZTogJ21lc2hOZXR3b3JrJywgZnVuYzogJ1N1YnNjcmliZU1lc2hOZXR3b3JrJyB9LCBjYWxsYmFjaywge2F1dG86IHRydWV9KTtcbn07XG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbmZ1bmN0aW9uIE1lc3NhZ2Uoc2VydmljZSwgZnVuYywgb2JqLCBwZXJtYW5lbnQpe1xuXG5cdHRoaXMuc2VydmljZSA9IHNlcnZpY2U7XG5cdHRoaXMuZnVuYyA9IGZ1bmM7XG5cdHRoaXMub2JqID0gb2JqO1xuXHRcblx0dGhpcy5wZXJtYW5lbnQgPSBwZXJtYW5lbnQ7IC8vSWYgdGhpcyBmbGFnIGlzIG9uLCB0aGUgY29tbWFuZCB3aWxsIHN0YXkgb24gdGhlIGNhbGxiYWNrIGxpc3QgbGlzdGVuaW5nIGZvciBldmVudHNcbn1cblxuTWVzc2FnZS5idWlsZFNpZ25hdHVyZSA9IGZ1bmN0aW9uKG1zZyl7XG5cdHJldHVybiBtc2cuc2VydmljZSsnLicrbXNnLmZ1bmMrJy4nK21zZy5vYmo7XG59XG5cblxuTWVzc2FnZS5wcm90b3R5cGUuc2lnbmF0dXJlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuc2VydmljZSsnLicrdGhpcy5mdW5jKycuJyt0aGlzLm9iajtcbn1cblxuTWVzc2FnZS5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRyZXR1cm4ge1xuXHRcdHNlcnZpY2U6IHRoaXMuc2VydmljZSxcblx0XHRmdW5jOiB0aGlzLmZ1bmMsXG5cdFx0b2JqOiB0aGlzLm9iaixcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZXNzYWdlO1xuIiwidmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcblxuXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuaXAgPSBmdW5jdGlvbihpZmFjZSwgY2FsbGJhY2spe1xuXHRyZXR1cm4gdGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAnbmV0d29ya0lkJyxcblx0XHRmdW5jOiAnR2V0TG9jYWxJUCcsXG5cdFx0ZGF0YToge1xuXHRcdFx0aWZhY2U6IGlmYWNlXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cdFx0Y2FsbGJhY2socGVlcklkLCAoIWVyciAmJiBkYXRhICYmIGRhdGEuYWRkcmVzcykgPyBkYXRhLmFkZHJlc3MgOiBudWxsKTtcblx0fSk7XG59O1xuIiwidmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciBkMSA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpO1xudmFyIFEgPSByZXF1aXJlKCdxJyk7XG5cbmlmKHR5cGVvZiBJTkZPID09PSAndW5kZWZpbmVkJykgSU5GTyA9IGZ1bmN0aW9uKHMpIHsgY29uc29sZS5sb2cocyk7fVxuaWYodHlwZW9mIE9LID09PSAndW5kZWZpbmVkJykgT0sgPSBmdW5jdGlvbihzKSB7IGNvbnNvbGUubG9nKHMpO31cblxuXG5cbi8qKlxuKiBJbnN0YWxscyBhIG5ldyBEaXlhTm9kZSBkZXZpY2UgKHdpdGggYWRkcmVzcyAnaXAnKSBpbnRvIGFuIGV4aXN0aW5nIG5ldHdvcmssIGJ5XG4qIGNvbnRhY3RpbmcgYW4gZXhpc3RpbmcgRGl5YU5vZGUgZGV2aWNlIHdpdGggYWRkcmVzcyAnYm9vdHN0cmFwX2lwJyA6XG4qICAgMSkgQ29udGFjdCB0aGUgbmV3IG5vZGUgdG8gZ2V0IGl0cyBwdWJsaWMga2V5XG4qICAgMikgQWRkIHRoaXMgcHVibGljIGtleSB0byB0aGUgZXhpc3Rpbmcgbm9kZSBUcnVzdGVkUGVlcnMgbGlzdFxuKiAgIDMpIEFkZCB0aGUgZXhpc3Rpbmcgbm9kZSdzIHB1YmxpYyBrZXkgdG8gdGhlIG5ldyBub2RlJ3MgVHJ1c3RlZFBlZXJzIGxpc3RcbiogICA0KSBBc2sgdGhlIG5ldyBub2RlIHRvIGpvaW4gdGhlIG5ldHdvcmsgYnkgY2FsbGluZyBAc2Vle2QxKCkuam9pbigpfVxuKlxuKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgdGhlIGdpdmVuIHVzZXIgdG8gaGF2ZSByb290IHJvbGUgb24gYm90aCBub2Rlc1xuKlxuKiBAcGFyYW0gaXAgOiB0aGUgSVAgYWRkcmVzcyBvZiB0aGUgbmV3IGRldmljZVxuKiBAcGFyYW0gdXNlciA6IGEgdXNlcm5hbWUgd2l0aCByb290IHJvbGUgb24gdGhlIG5ldyBkZXZpY2VcbiogQHBhcmFtIHBhc3N3b3JkIDogdGhlIHBhc3N3b3JkIGZvciAndXNlcidcbiogQHBhcmFtIGJvb3RzdHJhcF9pcCA6IHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBib290c3RyYXAgZGV2aWNlXG4qIEBwYXJhbSBib290c3RyYXBfdXNlciA6IGEgdXNlciBpZGVudGlmaWVyIHdpdGggcm9vdCByb2xlIG9uIHRoZSBib29zdHJhcCBkZXZpY2VcbiogQHBhcmFtIGJvb3RzdHJhcF9wYXNzd29yZCA6IHRoZSBwYXNzd29yZCBmb3IgJ2Jvb3RzdHJhcF91c2VyJ1xuKiBAcGFyYW0gYm9vdHN0cmFwX25ldCA6IHRoZSBJUCBhZGRyZXNzIHdoZXJlIHRoZSBuZXcgZGV2aWNlIHdpbGwgY29ubmVjdCB0byB0aGUgYm9vc3RyYXAgb25lXG4qIEBwYXJhbSBjYWxsYmFjayA6IG9mIHRoZSBmb3JtIGNhbGxiYWNrKG5ld19wZWVyX25hbWUsYm9vdHN0cmFwX3BlZXJfbmFtZSwgZXJyLCBkYXRhKVxuKi9cbmQxLmluc3RhbGxOb2RlRXh0ID0gZnVuY3Rpb24oaXAsIHVzZXIsIHBhc3N3b3JkLCBib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQsIGJvb3RzdHJhcF9uZXQsIGNhbGxiYWNrKSB7XG5cdGlmKHR5cGVvZiBpcCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBpcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGJvb3RzdHJhcF9pcCBzaG91bGQgYmUgYW4gSVAgYWRkcmVzc1wiO1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX25ldCAhPT0gJ3N0cmluZycpIHRocm93IFwiW2luc3RhbGxOb2RlXSBib290c3RyYXBfbmV0IHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYm9vdHN0cmFwX2lwLmluZGV4T2YoXCJ3czovL1wiKSAhPT0gMCAmJiBib290c3RyYXBfaXAuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfaXAgPSBcIndzczovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHRcdGVsc2UgYm9vdHN0cmFwX2lwID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX2lwO1xuXHR9XG5cdGlmKGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGJvb3RzdHJhcF9uZXQuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKGQxLmlzU2VjdXJlZCgpKSBib290c3RyYXBfbmV0ID0gXCJ3c3M6Ly9cIiArIGJvb3RzdHJhcF9uZXQ7XG5cdFx0ZWxzZSBib290c3RyYXBfbmV0ID0gXCJ3czovL1wiICsgYm9vdHN0cmFwX25ldDtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKSB7XG5cdFx0ZDEoXCIjc2VsZlwiKS5qb2luKGJvb3RzdHJhcF9uZXQsIHRydWUsIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSl7XG5cdFx0XHRpZighZXJyKSBPSyhcIkpPSU5FRCAhISFcIik7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSk7XG5cdFx0fSk7XG5cdH1cblxuXHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpe1xuXHRcdGQxKFwiI3NlbGZcIikuZ2l2ZVB1YmxpY0tleShmdW5jdGlvbihwZWVyLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycj09PSdTZXJ2aWNlTm90Rm91bmQnKSB7XG5cdFx0XHRcdElORk8oXCJQZWVyIEF1dGhlbnRpY2F0aW9uIGRpc2FibGVkIC4uLiBkaXJlY3RseSBqb2luaW5nXCIpO1xuXHRcdFx0XHRqb2luKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZXJyKSByZXR1cm4gY2FsbGJhY2socGVlciwgbnVsbCwgZXJyLCBudWxsKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRJTkZPKFwiQWRkIHRydXN0ZWQgcGVlciBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIHRvIFwiICsgYm9vdHN0cmFwX2lwICsgXCIgd2l0aCBwdWJsaWMga2V5IFwiICsgZGF0YS5wdWJsaWNfa2V5LnNsaWNlKDAsMjApKTtcblx0XHRcdFx0ZDEuY29ubmVjdEFzVXNlcihib290c3RyYXBfaXAsIGJvb3RzdHJhcF91c2VyLCBib290c3RyYXBfcGFzc3dvcmQpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKHBlZXIsIGRhdGEucHVibGljX2tleSwgZnVuY3Rpb24oYm9vdHN0cmFwX3BlZXIsIGVyciwgZGF0YSkge1xuXG5cdFx0XHRcdFx0XHRpZihlcnIpIHJldHVybiBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBudWxsKTtcblx0XHRcdFx0XHRcdGlmKGRhdGEuYWxyZWFkeVRydXN0ZWQpIElORk8ocGVlciArIFwiIGFscmVhZHkgdHJ1c3RlZCBieSBcIiArIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdGVsc2UgSU5GTyhib290c3RyYXBfcGVlciArIFwiKGlwPVwiKyBib290c3RyYXBfaXAgK1wiKSBhZGRlZCBcIiArIHBlZXIgKyBcIihpcD1cIiArIGlwICsgXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXG5cdFx0XHRcdFx0XHRJTkZPKFwiSW4gcmV0dXJuLCBhZGQgXCIgKyBib290c3RyYXBfcGVlciArIFwiIHRvIFwiICsgcGVlciArIFwiIGFzIGEgVHJ1c3RlZCBQZWVyIHdpdGggcHVibGljIGtleSBcIiArIGRhdGEucHVibGljX2tleS5zbGljZSgwLDIwKSk7XG5cdFx0XHRcdFx0XHRkMS5jb25uZWN0QXNVc2VyKGlwLCB1c2VyLCBwYXNzd29yZCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0XHRkMShcIiNzZWxmXCIpLmFkZFRydXN0ZWRQZWVyKGJvb3RzdHJhcF9wZWVyLCBkYXRhLnB1YmxpY19rZXksIGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKGVycikgY2FsbGJhY2socGVlciwgYm9vdHN0cmFwX3BlZXIsIGVyciwgbnVsbCk7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZihkYXRhLmFscmVhZHlUcnVzdGVkKSBJTkZPKGJvb3RzdHJhcF9wZWVyICsgXCIgYWxyZWFkeSB0cnVzdGVkIGJ5IFwiICsgcGVlcik7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBJTkZPKHBlZXIgKyBcIihpcD1cIisgaXAgK1wiKSBhZGRlZCBcIiArIGJvb3RzdHJhcF9wZWVyICsgXCIoaXA9XCIrIGJvb3RzdHJhcF9pcCArXCIpIGFzIGEgVHJ1c3RlZCBQZWVyXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vIE9uY2UgS2V5cyBoYXZlIGJlZW4gZXhjaGFuZ2VkIGFzayB0byBqb2luIHRoZSBuZXR3b3JrXG5cdFx0XHRcdFx0XHRcdFx0T0soXCJLRVlTIE9LICEgTm93LCBsZXQgXCIrcGVlcitcIihpcD1cIitpcCtcIikgam9pbiB0aGUgbmV0d29yayB2aWEgXCIrYm9vdHN0cmFwX3BlZXIrXCIoaXA9XCIrYm9vdHN0cmFwX25ldCtcIikgLi4uXCIpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBqb2luKHBlZXIsIGJvb3RzdHJhcF9wZWVyKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5cbi8qKiBTaG9ydCB2ZXJzaW9uIG9mIEBzZWV7ZDEuaW5zdGFsbE5vZGVFeHR9ICovXG5kMS5pbnN0YWxsTm9kZSA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spIHtcblx0XHR2YXIgaXAgPSBkMS5hZGRyKCk7XG5cdFx0dmFyIHVzZXIgPSBkMS51c2VyKCk7XG5cdFx0dmFyIHBhc3N3b3JkID0gZDEucGFzcygpO1xuXHRcdHZhciBib290c3RyYXBfdXNlciA9IHVzZXI7XG5cdFx0dmFyIGJvb3RzdHJhcF9wYXNzd29yZCA9IHBhc3N3b3JkO1xuXHRcdHJldHVybiBkMS5pbnN0YWxsTm9kZUV4dChpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spO1xufVxuXG5cblxuXG4vKipcbiAqIE1ha2UgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBqb2luIGFuIGV4aXN0aW5nIERpeWFOb2RlcyBNZXNoIE5ldHdvcmsgYnkgY29udGFjdGluZ1xuICogdGhlIGdpdmVuIGJvb3RzdHJhcCBwZWVycy5cbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGNvbnRhY3QgdG8gam9pbiB0aGUgTmV0d29ya1xuICogQHBhcmFtIGJQZXJtYW5lbnQgOiBpZiB0cnVlLCBwZXJtYW5lbnRseSBhZGQgdGhlIGJvb3RzdHJhcCBwZWVycyBhcyBhdXRvbWF0aWMgYm9vdHN0cmFwIHBlZXJzIGZvciB0aGUgc2VsZWN0ZWQgbm9kZXMuXG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbihib290c3RyYXBfaXBzLCBiUGVybWFuZW50LCBjYWxsYmFjayl7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXBzID09PSAnc3RyaW5nJykgYm9vdHN0cmFwX2lwcyA9IFsgYm9vdHN0cmFwX2lwcyBdO1xuXHRpZihib290c3RyYXBfaXBzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkgdGhyb3cgXCJqb2luKCkgOiBib290c3RyYXBfaXBzIHNob3VsZCBiZSBhbiBhcnJheSBvZiBwZWVycyBVUklzXCI7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZSA6ICdtZXNoTmV0d29yaycsIGZ1bmM6ICdKb2luJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIERpc2Nvbm5lY3QgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyBmcm9tIHRoZSBnaXZlbiBib290c3RyYXAgcGVlcnNcbiAqXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIGJvb3RzdHJhcF9pcHMgOiBhbiBhcnJheSBvZiBib290c3RyYXAgSVAgYWRkcmVzc2VzIHRvIGxlYXZlXG4gKiBAcGFyYW0gYlBlcm1hbmVudCA6IGlmIHRydWUsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGUgZ2l2ZW4gcGVlcnMgZnJvbSB0aGUgYXV0b21hdGljIGJvb3RzdHJhcCBwZWVycyBsaXN0XG4gKlxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24oYm9vdHN0cmFwX2lwcywgYlBlcm1hbmVudCwgY2FsbGJhY2spe1xuXHRpZih0eXBlb2YgYm9vdHN0cmFwX2lwcyA9PT0gJ3N0cmluZycpIGJvb3RzdHJhcF9pcHMgPSBbIGJvb3RzdHJhcF9pcHMgXTtcblx0aWYoYm9vdHN0cmFwX2lwcy5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHRocm93IFwibGVhdmUoKSA6IGJvb3RzdHJhcF9pcHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHBlZXJzIFVSSXNcIjtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlIDogJ21lc2hOZXR3b3JrJywgZnVuYzogJ0xlYXZlJywgZGF0YTogeyBib290c3RyYXBfaXBzOiBib290c3RyYXBfaXBzLCBiUGVybWFuZW50OiBiUGVybWFuZW50IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7IGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIEFzayB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGZvciB0aGVpciBwdWJsaWMga2V5c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdpdmVQdWJsaWNLZXkgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dpdmVQdWJsaWNLZXknLFx0ZGF0YToge30gfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7Y2FsbGJhY2socGVlcklkLGVycixkYXRhKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIEFkZCBhIG5ldyB0cnVzdGVkIHBlZXIgUlNBIHB1YmxpYyBrZXkgdG8gdGhlIHNlbGVjdGVkIERpeWFOb2Rlc1xuICogTk9URSA6IFRoaXMgb3BlcmF0aW9uIHJlcXVpcmVzIHJvb3Qgcm9sZVxuICpcbiAqIEBwYXJhbSBuYW1lIDogdGhlIG5hbWUgb2YgdGhlIG5ldyB0cnVzdGVkIERpeWFOb2RlIHBlZXJcbiAqIEBwYXJhbSBwdWJsaWNfa2V5IDogdGhlIFJTQSBwdWJsaWMga2V5IG9mIHRoZSBuZXcgdHJ1c3RlZCBEaXlhTm9kZSBwZWVyXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYWRkVHJ1c3RlZFBlZXIgPSBmdW5jdGlvbihuYW1lLCBwdWJsaWNfa2V5LCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoeyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FkZFRydXN0ZWRQZWVyJyxcdGRhdGE6IHsgbmFtZTogbmFtZSwgcHVibGljX2tleTogcHVibGljX2tleSB9fSxcblx0XHRmdW5jdGlvbihwZWVySWQsZXJyLGRhdGEpe2NhbGxiYWNrKHBlZXJJZCxlcnIsZGF0YSk7fVxuXHQpO1xufTtcblxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBzZWxlY3RlZCBEaXlhTm9kZXMgdHJ1c3QgdGhlIGdpdmVuIHBlZXJzXG4gKiBAcGFyYW0gcGVlcnMgOiBhbiBhcnJheSBvZiBwZWVyIG5hbWVzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuYXJlVHJ1c3RlZCA9IGZ1bmN0aW9uKHBlZXJzLCBjYWxsYmFjayl7XG5cdHJldHVybiB0aGlzLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0FyZVRydXN0ZWQnLFx0ZGF0YTogeyBwZWVyczogcGVlcnMgfSB9LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHR2YXIgYWxsVHJ1c3RlZCA9IGRhdGEudHJ1c3RlZDtcblx0XHRcdGlmKGFsbFRydXN0ZWQpIHsgT0socGVlcnMgKyBcIiBhcmUgdHJ1c3RlZCBieSBcIiArIHBlZXJJZCk7IGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7IH1cblx0XHRcdGVsc2UgeyBFUlIoXCJTb21lIHBlZXJzIGluIFwiICsgcGVlcnMgKyBcIiBhcmUgdW50cnVzdGVkIGJ5IFwiICsgcGVlcklkKTsgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7IH1cblx0XHR9XG5cdCk7XG59O1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5pc1RydXN0ZWQgPSBmdW5jdGlvbihwZWVyLCBjYWxsYmFjaykgeyByZXR1cm4gdGhpcy5hcmVUcnVzdGVkKFtwZWVyXSwgY2FsbGJhY2spOyB9XG5cblxuZDEudHJ1c3RlZFBlZXJzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0ZDEoXCIjc2VsZlwiKS5yZXF1ZXN0KFxuXHRcdHsgc2VydmljZTogJ3BlZXJBdXRoJyxcdGZ1bmM6ICdHZXRUcnVzdGVkUGVlcnMnIH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdGlmKGVycikgcmV0dXJuIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0dmFyIHBlZXJzID0gW107XG5cdFx0XHRmb3IodmFyIGk9MDsgaTxkYXRhLnBlZXJzLmxlbmd0aDsgaSsrKSBwZWVycy5wdXNoKGRhdGEucGVlcnNbaV0ubmFtZSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShwZWVycyk7XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5kMS50cCA9IGQxLnRydXN0ZWRQZWVyczsgLy8gU2hvcnRoYW5kXG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbkRpYVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xuXG5mdW5jdGlvbiBwaWNvKG5vZGUpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdHJldHVybiB0aGlzO1xufVxuXG4vL1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnBvd2VyID0gZnVuY3Rpb24oKXtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnUG93ZXInXG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHQvKmlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTsqL1xuXG5cdH0pO1xufVxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnpvb20gPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAncGljbycsXG5cdFx0ZnVuYzogJ1pvb20nXG5cdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdC8qaWYoZGF0YS5waWNvKVxuXHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBpY28pO1xuXHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpOyovXG5cblx0fSk7XG59XG5cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5iYWNrID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdCYWNrJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0XHQvKmlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnVwID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdVcCdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdCovXG5cdH0pO1xufVxuXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubGVmdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnTGVmdCdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdCovXG5cdH0pO1xufVxuXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUub2sgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAncGljbycsXG5cdFx0ZnVuYzogJ09rJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJpZ2h0ID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdSaWdodCdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG5cdC8qXHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdFx0Ki9cblx0fSk7XG59XG5cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5kb3duID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdEb3duJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdQcmV2J1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdQbGF5J1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnTmV4dCdcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG4vKlx0XHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdCovXG5cdH0pO1xufVxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmx1bWlEb3duID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdMdW1pRG93bidcblx0fSwgZnVuY3Rpb24oZGF0YSl7XG4vKlx0XHRpZihkYXRhLnBpY28pXG5cdFx0XHRjYWxsYmFjayhudWxsLGRhdGEucGljbyk7XG5cdFx0aWYoZGF0YS5lcnJvcilcblx0XHRcdGNhbGxiYWNrKGRhdGEuZXJyb3IsbnVsbCk7XG5cdCovXG5cdH0pO1xufVxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmx1bWlVcCA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnTHVtaVVwJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS52b2x1bWVEb3duID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdWb2x1bWVEb3duJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0XHQvKmlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0Ki9cblx0fSk7XG59XG5cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5tdXRlID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuXG5cdHRoaXMucmVxdWVzdCh7XG5cdFx0c2VydmljZTogJ3BpY28nLFxuXHRcdGZ1bmM6ICdNdXRlJ1xuXHR9LCBmdW5jdGlvbihkYXRhKXtcblx0LypcdGlmKGRhdGEucGljbylcblx0XHRcdGNhbGxiYWNrKG51bGwsZGF0YS5waWNvKTtcblx0XHRpZihkYXRhLmVycm9yKVxuXHRcdFx0Y2FsbGJhY2soZGF0YS5lcnJvcixudWxsKTtcblx0XHQqL1xuXHR9KTtcbn1cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS52b2x1bWVVcCA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblxuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdwaWNvJyxcblx0XHRmdW5jOiAnVm9sdW1lVXAnXG5cdH0sIGZ1bmN0aW9uKGRhdGEpe1xuXHQvKlx0aWYoZGF0YS5waWNvKVxuXHRcdFx0Y2FsbGJhY2sobnVsbCxkYXRhLnBpY28pO1xuXHRcdGlmKGRhdGEuZXJyb3IpXG5cdFx0XHRjYWxsYmFjayhkYXRhLmVycm9yLG51bGwpO1xuXHRcdCovXG5cdH0pO1xufVxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmRpc3BsYXkgPSBmdW5jdGlvbihjYWxsYmFjayl7XG5cblx0dGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAncGljbycsXG5cdFx0ZnVuYzogJ0Rpc3BsYXknLFxuXHRcdC8vIGRhdGE6IHJlcVxuXHR9LCBmdW5jdGlvbihkYXRhKXtcblxuXHR9KTtcbn1cblxuXG5cbnZhciBleHAgPSB7XG5cdFx0cGljbzogcGljb1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cDtcbiIsIkRpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbkV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5cbmlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKXtcblx0dmFyIFJUQ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb247XG5cdHZhciBSVENJY2VDYW5kaWRhdGUgPSB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy5tb3pSVENJY2VDYW5kaWRhdGUgfHwgd2luZG93LndlYmtpdFJUQ0ljZUNhbmRpZGF0ZTtcblx0dmFyIFJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93Lm1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xufVxuXG5cbmZ1bmN0aW9uIENoYW5uZWwoZG5JZCwgbmFtZSwgb3Blbl9jYil7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXHR0aGlzLm5hbWUgPSBuYW1lO1xuXHR0aGlzLmRuSWQgPSBkbklkO1xuXG5cdHRoaXMuZnJlcXVlbmN5ID0gMjA7XG5cblx0dGhpcy5jaGFubmVsID0gdW5kZWZpbmVkO1xuXHR0aGlzLm9ub3BlbiA9IG9wZW5fY2I7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG59XG5pbmhlcml0cyhDaGFubmVsLCBFdmVudEVtaXR0ZXIpO1xuXG5DaGFubmVsLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24oZGF0YWNoYW5uZWwpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuY2hhbm5lbCA9IGRhdGFjaGFubmVsO1xuXHR0aGlzLmNoYW5uZWwuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cdHRoaXMuX25lZ29jaWF0ZSgpO1xuXG59O1xuXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcbn07XG5cbkNoYW5uZWwucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKXtcblx0aWYoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5zaXplIHx8IGlzTmFOKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuXHR0aGlzLl9idWZmZXJbaW5kZXhdID0gdmFsdWU7XG5cdHRoaXMuX3JlcXVlc3RTZW5kKCk7XG5cdHJldHVybiB0cnVlO1xufTtcblxuQ2hhbm5lbC5wcm90b3R5cGUud3JpdGVBbGwgPSBmdW5jdGlvbih2YWx1ZXMpe1xuXHRpZighQXJyYXkuaXNBcnJheSh2YWx1ZXMpIHx8IHZhbHVlcy5sZW5ndGggIT09IHRoaXMuc2l6ZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8dmFsdWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgaWYoaXNOYU4odmFsdWVzW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLl9idWZmZXJbaV0gPSB2YWx1ZXNbaV07XG4gICAgfVxuICAgIHRoaXMuX3JlcXVlc3RTZW5kKCk7XG59O1xuXG5DaGFubmVsLnByb3RvdHlwZS5fcmVxdWVzdFNlbmQgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLl9sYXN0U2VuZFRpbWVzdGFtcDtcblx0dmFyIHBlcmlvZCA9IDEwMDAgLyB0aGlzLmZyZXF1ZW5jeTtcblx0aWYoZWxhcHNlZFRpbWUgPj0gcGVyaW9kKXtcblx0XHRkb1NlbmQoKTtcblx0fWVsc2UgaWYoIXRoaXMuX3NlbmRSZXF1ZXN0ZWQpe1xuXHRcdHRoaXMuX3NlbmRSZXF1ZXN0ZWQgPSB0cnVlO1xuXHRcdHNldFRpbWVvdXQoZG9TZW5kLCBwZXJpb2QgLSBlbGFwc2VkVGltZSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkb1NlbmQoKXtcblx0XHR0aGF0Ll9zZW5kUmVxdWVzdGVkID0gZmFsc2U7XG5cdFx0dGhhdC5fbGFzdFNlbmRUaW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHR2YXIgcmV0ID0gdGhhdC5fc2VuZCh0aGF0Ll9idWZmZXIpO1xuXHRcdC8vSWYgYXV0b3NlbmQgaXMgc2V0LCBhdXRvbWF0aWNhbGx5IHNlbmQgYnVmZmVyIGF0IHRoZSBnaXZlbiBmcmVxdWVuY3lcblx0XHRpZihyZXQgJiYgdGhhdC5hdXRvc2VuZCkgdGhhdC5fcmVxdWVzdFNlbmQoKTtcblx0fVxufTtcblxuQ2hhbm5lbC5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbihtc2cpe1xuXHRpZih0aGlzLmNsb3NlZCkgcmV0dXJuIGZhbHNlO1xuXHRlbHNlIGlmKHRoaXMuY2hhbm5lbC5yZWFkeVN0YXRlID09PSAnb3Blbicpe1xuXHRcdHRyeXtcblx0XHRcdHRoaXMuY2hhbm5lbC5zZW5kKG1zZyk7XG5cdFx0fWNhdGNoKGUpe1xuXHRcdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gZXhjZXB0aW9uIG9jY3VyZWQgd2hpbGUgc2VuZGluZyBkYXRhJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGVsc2V7XG5cdFx0Y29uc29sZS5sb2coJ1tydGMuY2hhbm5lbC53cml0ZV0gd2FybmluZyA6IHdlYnJ0YyBkYXRhY2hhbm5lbCBzdGF0ZSA9ICcrdGhpcy5jaGFubmVsLnJlYWR5U3RhdGUpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuQ2hhbm5lbC5wcm90b3R5cGUuX25lZ29jaWF0ZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLmNoYW5uZWwub25tZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0dmFyIHZpZXcgPSBuZXcgRGF0YVZpZXcobWVzc2FnZS5kYXRhKTtcblxuXHRcdHZhciB0eXBlQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlldy5nZXRVaW50OCgwKSk7XG5cdFx0aWYodHlwZUNoYXIgPT09ICdPJyl7XG5cdFx0XHQvL0lucHV0XG5cdFx0XHR0aGF0LnR5cGUgPSAnaW5wdXQnOyAvL1Byb21ldGhlIE91dHB1dCA9IENsaWVudCBJbnB1dFxuXHRcdH1lbHNlIGlmKHR5cGVDaGFyID09PSAnSScpe1xuXHRcdFx0Ly9PdXRwdXRcblx0XHRcdHRoYXQudHlwZSA9ICdvdXRwdXQnOyAvL1Byb21ldGhlIElucHV0ID0gQ2xpZW50IE91dHB1dFxuXHRcdH1lbHNle1xuXHRcdFx0Ly9FcnJvclxuXHRcdH1cblxuXHRcdHZhciBzaXplID0gdmlldy5nZXRJbnQzMigxLHRydWUpO1xuXHRcdGlmKHNpemUgIT0gdW5kZWZpbmVkKXtcblx0XHRcdHRoYXQuc2l6ZSA9IHNpemU7XG5cdFx0XHR0aGF0Ll9idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpO1xuXHRcdH1lbHNle1xuXHRcdFx0Ly9lcnJvclxuXHRcdH1cblxuXHRcdHRoYXQuY2hhbm5lbC5vbm1lc3NhZ2UgPSB0aGF0Ll9vbk1lc3NhZ2UuYmluZCh0aGF0KTtcblxuXHRcdHRoYXQuY2hhbm5lbC5vbmNsb3NlID0gdGhhdC5fb25DbG9zZS5iaW5kKHRoYXQpO1xuXG5cdFx0aWYodHlwZW9mIHRoYXQub25vcGVuID09PSAnZnVuY3Rpb24nKSB0aGF0Lm9ub3Blbih0aGF0LmRuSWQsIHRoYXQpO1xuXG5cdFx0Y29uc29sZS5sb2coJ2NoYW5uZWwgJyt0aGF0Lm5hbWUrJyBuZWdvY2lhdGVkICEnKVxuXHR9XG59O1xuXG5DaGFubmVsLnByb3RvdHlwZS5fb25NZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdHZhciB2YWxBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkobWVzc2FnZS5kYXRhKTtcblx0dGhpcy5lbWl0KCd2YWx1ZScsIHZhbEFycmF5KTtcbn07XG5cbkNoYW5uZWwucHJvdG90eXBlLl9vbkNsb3NlID0gZnVuY3Rpb24oKXtcblx0Y29uc29sZS5sb2coJ2NoYW5uZWwgJyt0aGlzLm5hbWUrJyBjbG9zZWQgIScpO1xuXHR0aGlzLmVtaXQoJ2Nsb3NlJyk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFJUQyBQZWVyIGltcGxlbWVudGF0aW9uIC8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBQZWVyKGRuSWQsIHJ0YywgaWQsIGNoYW5uZWxzKXtcblx0dGhpcy5kbiA9IGQxKGRuSWQpO1xuXHR0aGlzLmRuSWQgPSBkbklkO1xuXHR0aGlzLmlkID0gaWQ7XG5cdHRoaXMuY2hhbm5lbHMgPSBjaGFubmVscztcblx0dGhpcy5ydGMgPSBydGM7XG5cdHRoaXMucGVlciA9IG51bGw7XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59XG5cblBlZXIucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5kbi5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdDb25uZWN0Jyxcblx0XHRvYmo6IHRoaXMuY2hhbm5lbHMsXG5cdFx0ZGF0YToge1xuXHRcdFx0cHJvbUlEOiB0aGlzLmlkXG5cdFx0fVxuXHR9LFxuXHRmdW5jdGlvbihkaXlhLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGRhdGEpIHRoYXQuX2hhbmRsZU5lZ29jaWF0aW9uTWVzc2FnZShkYXRhKTtcblx0fSk7XG5cblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdGlmKCF0aGF0LmNvbm5lY3RlZCAmJiAhdGhhdC5jbG9zZWQpe1xuXHRcdFx0dGhhdC5fcmVjb25uZWN0KCk7XG5cdFx0fVxuXHR9LCAxMDAwMCk7XG59O1xuXG5QZWVyLnByb3RvdHlwZS5fcmVjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5jbG9zZSgpO1xuXG5cdHRoaXMucGVlciA9IG51bGw7XG5cdHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cblx0dGhpcy5fY29ubmVjdCgpO1xufTtcblxuXG5QZWVyLnByb3RvdHlwZS5faGFuZGxlTmVnb2NpYXRpb25NZXNzYWdlID0gZnVuY3Rpb24obXNnKXtcblx0aWYobXNnLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZU9mZmVyJyl7XG5cdFx0dGhpcy5fY3JlYXRlUGVlcihtc2cpO1xuXHR9ZWxzZSBpZihtc2cuZXZlbnRUeXBlID09PSAnUmVtb3RlSUNFQ2FuZGlkYXRlJyl7XG5cdFx0dGhpcy5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlKG1zZyk7XG5cdH1cbn07XG5cbnZhciBzZXJ2ZXJzID0ge1wiaWNlU2VydmVyc1wiOiBbe1widXJsXCI6IFwic3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMlwifV19O1xuXG5QZWVyLnByb3RvdHlwZS5fY3JlYXRlUGVlciA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIHBlZXIgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oc2VydmVycywgIHttYW5kYXRvcnk6IFt7RHRsc1NydHBLZXlBZ3JlZW1lbnQ6IHRydWV9LCB7RW5hYmxlRHRsc1NydHA6IHRydWV9XX0pO1xuXHR0aGlzLnBlZXIgPSBwZWVyO1xuXG5cdHBlZXIuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7c2RwOiBkYXRhLnNkcCwgdHlwZTogZGF0YS50eXBlfSkpO1xuXG5cdHBlZXIuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKHNlc3Npb25fZGVzY3JpcHRpb24pe1xuXHRcdHBlZXIuc2V0TG9jYWxEZXNjcmlwdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKTtcblxuXHRcdHRoYXQuZG4ucmVxdWVzdCh7XG5cdFx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRcdGZ1bmM6ICdBbnN3ZXInLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRwcm9tSUQ6IGRhdGEucHJvbUlELFxuXHRcdFx0XHRwZWVySWQ6IGRhdGEucGVlcklkLFxuXHRcdFx0XHRzZHA6IHNlc3Npb25fZGVzY3JpcHRpb24uc2RwLFxuXHRcdFx0XHR0eXBlOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnR5cGVcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0ZnVuY3Rpb24oZXJyKXtcblx0XHRjb25zb2xlLmxvZyhcIlJUQzogY2Fubm90IGNyZWF0ZSBhbnN3ZXIgOlwiKTtcblx0XHRjb25zb2xlLmxvZyhlcnIpO1xuXHR9LFxuXHR7J21hbmRhdG9yeSc6IHsgJ09mZmVyVG9SZWNlaXZlQXVkaW8nOiB0cnVlLCAnT2ZmZXJUb1JlY2VpdmVWaWRlbyc6IHRydWV9fSk7XG5cblx0cGVlci5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG5cdFx0Y29uc29sZS5sb2coJ1JUQzogc3RhdGUgY2hhbmdlKCcrdGhhdC5pZCsnOicrdGhhdC5kbklkKycpIDogJytwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSk7XG5cdFx0aWYocGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjb25uZWN0ZWQnKXtcblx0XHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHRcdGlmKHRoYXQuc3Vic2NyaXB0aW9uKSB0aGF0LnN1YnNjcmlwdGlvbi5jbG9zZSgpO1xuXHRcdH1cblx0XHRlbHNlIGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZGlzY29ubmVjdGVkJyl7XG5cdFx0XHRpZighdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpO1xuXHRcdH1cblx0fTtcblxuXHRwZWVyLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KXtcblx0XHRjb25zb2xlLmxvZyhcImxvY2FsIGNhbmRpZGF0ZSA6IFwiKTtcblx0XHRjb25zb2xlLmxvZyhldnQuY2FuZGlkYXRlKTtcblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnSUNFQ2FuZGlkYXRlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiB0aGF0LmlkLFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25EYXRhQ2hhbm5lbCh0aGF0LmRuSWQsIGV2dC5jaGFubmVsKTtcblx0fTtcbn07XG5cblxuUGVlci5wcm90b3R5cGUuX2FkZFJlbW90ZUlDRUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdFxuXHRjb25zb2xlLmxvZyhcInJlbW90ZSBjYW5kaWRhdGUgOiBcIik7XG5cdGNvbnNvbGUubG9nKGRhdGEuY2FuZGlkYXRlKTtcblxuXHR0cnl7XG5cdFx0dmFyIGNhbmRpZGF0ZSA9IG5ldyBSVENJY2VDYW5kaWRhdGUoZGF0YS5jYW5kaWRhdGUpO1xuXHRcdHRoaXMucGVlci5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLCBmdW5jdGlvbigpe1xuXHRcdFx0Y29uc29sZS5sb2coXCJSVEM6IGNhbmRpZGF0ZSBhZGRlZChcIit0aGF0LmlkK1wiOlwiK3RoYXQuZG5JZCtcIikgOiBcIit0aGF0LnBlZXIuaWNlQ29ubmVjdGlvblN0YXRlKTtcblx0XHR9LGZ1bmN0aW9uKGVycil7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiUlRDOiBjYW5ub3QgYWRkIFJlbW90ZUlDRUNhbmRpZGF0ZSA6XCIpO1xuXHRcdFx0Y29uc29sZS5lcnJvcihlcnIpO1xuXHRcdH0pO1xuXHR9Y2F0Y2goZXJyKXtcblx0XHRjb25zb2xlLmVycm9yKFwiUlRDOiBjYW5ub3QgYWRkIFJlbW90ZUlDRUNhbmRpZGF0ZSA6IFwiKTtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdH1cbn07XG5cblBlZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0aWYodGhpcy5zdWJzY3JpcHRpb24pIHRoaXMuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdGlmKHRoaXMucGVlcil7XG5cdFx0dHJ5e1xuXHRcdFx0dGhpcy5wZWVyLmNsb3NlKCk7XG5cdFx0fWNhdGNoKGUpe31cblx0XHR0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY2xvc2VkID0gdHJ1ZTtcblx0fVxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBSVEMgc2VydmljZSBpbXBsZW1lbnRhdGlvbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG5mdW5jdGlvbiBSVEMoc2VsZWN0b3Ipe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcblxuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzID0gW107XG59XG5cblxuUlRDLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc2VsZWN0b3IuZWFjaChmdW5jdGlvbihkbklkKXtcblx0XHRpZighdGhhdFtkbklkXSkgcmV0dXJuIDtcblx0XHRmb3IodmFyIHByb21JRCBpbiB0aGF0W2RuSWRdLnBlZXJzKXtcblx0XHRcdHRoYXQuX2Nsb3NlUGVlcihkbklkLCBwcm9tSUQpO1xuXHRcdH1cblx0fSk7XG5cblx0aWYodGhpcy5zdWJzY3JpcHRpb24pIHRoaXMuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuUlRDLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihuYW1lX3JlZ2V4LCBvbm9wZW5fY2FsbGJhY2spe1xuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goe3JlZ2V4OiBuYW1lX3JlZ2V4LCBjYjogb25vcGVuX2NhbGxiYWNrfSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuUlRDLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdydGMnLFxuXHRcdGZ1bmM6ICdMaXN0ZW5QZWVycydcblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblxuXHRcdGlmKCF0aGF0W2RuSWRdKSB0aGF0Ll9jcmVhdGVEaXlhTm9kZShkbklkKTtcblxuXHRcdGlmKGVyciA9PT0gJ1N1YnNjcmlwdGlvbkNsb3NlZCcgfHwgZXJyID09PSAnUGVlckRpc2Nvbm5lY3RlZCcpe1xuXHRcdFx0dGhhdC5fY2xvc2VEaXlhTm9kZShkbklkKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0aWYoZGF0YSAmJiBkYXRhLmV2ZW50VHlwZSAmJiBkYXRhLnByb21JRCAhPT0gdW5kZWZpbmVkKXtcblxuXHRcdFx0aWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ29ubmVjdGVkJyl7XG5cdFx0XHRcdGlmKCF0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSl7XG5cdFx0XHRcdFx0dmFyIGNoYW5uZWxzID0gdGhhdC5fbWF0Y2hDaGFubmVscyhkbklkLCBkYXRhLmNoYW5uZWxzKTtcblx0XHRcdFx0XHRpZihjaGFubmVscy5sZW5ndGggPiAwKXtcblx0XHRcdFx0XHRcdHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdID0gbmV3IFBlZXIoZG5JZCwgdGhhdCwgZGF0YS5wcm9tSUQsIGNoYW5uZWxzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdQZWVyQ2xvc2VkJyl7XG5cdFx0XHRcdGlmKHRoYXRbZG5JZF0ucGVlcnNbZGF0YS5wcm9tSURdKXtcblx0XHRcdFx0XHR0aGF0Ll9jbG9zZVBlZXIoZG5JZCwgZGF0YS5wcm9tSUQpO1xuXHRcdFx0XHRcdGlmKHR5cGVvZiB0aGF0Lm9uY2xvc2UgPT09ICdmdW5jdGlvbicpIHRoYXQub25jbG9zZShkbklkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sIHthdXRvOiB0cnVlfSk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5SVEMucHJvdG90eXBlLl9jcmVhdGVEaXlhTm9kZSA9IGZ1bmN0aW9uKGRuSWQpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpc1tkbklkXSA9IHtcblx0XHRkbklkOiBkbklkLFxuXHRcdHVzZWRDaGFubmVsczogW10sXG5cdFx0cmVxdWVzdGVkQ2hhbm5lbHM6IFtdLFxuXHRcdHBlZXJzOiBbXVxuXHR9XG5cblx0dGhpcy5yZXF1ZXN0ZWRDaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGMpe3RoYXRbZG5JZF0ucmVxdWVzdGVkQ2hhbm5lbHMucHVzaChjKX0pO1xufTtcblxuUlRDLnByb3RvdHlwZS5fY2xvc2VEaXlhTm9kZSA9IGZ1bmN0aW9uKGRuSWQpe1xuXHRmb3IodmFyIHByb21JRCBpbiB0aGlzW2RuSWRdLnBlZXJzKXtcblx0XHR0aGlzLl9jbG9zZVBlZXIoZG5JZCwgcHJvbUlEKTtcblx0fVxuXG5cdGRlbGV0ZSB0aGlzW2RuSWRdO1xufTtcblxuUlRDLnByb3RvdHlwZS5fY2xvc2VQZWVyID0gZnVuY3Rpb24oZG5JZCwgcHJvbUlEKXtcblx0aWYodGhpc1tkbklkXS5wZWVyc1twcm9tSURdKXtcblx0XHR2YXIgcCA9IHRoaXNbZG5JZF0ucGVlcnNbcHJvbUlEXTtcblx0XHRwLmNsb3NlKCk7XG5cblx0XHRmb3IodmFyIGk9MDtpPHAuY2hhbm5lbHMubGVuZ3RoOyBpKyspe1xuXHRcdFx0ZGVsZXRlIHRoaXNbZG5JZF0udXNlZENoYW5uZWxzW3AuY2hhbm5lbHNbaV1dO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzW2RuSWRdLnBlZXJzW3Byb21JRF07XG5cdH1cbn07XG5cblJUQy5wcm90b3R5cGUuX21hdGNoQ2hhbm5lbHMgPSBmdW5jdGlvbihkbklkLCByZWNlaXZlZENoYW5uZWxzKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBjaGFubmVscyA9IFtdO1xuXG5cdGZvcih2YXIgaSA9IDA7IGkgPCByZWNlaXZlZENoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgbmFtZSA9IHJlY2VpdmVkQ2hhbm5lbHNbaV07XG5cblx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVscy5sZW5ndGg7IGorKyl7XG5cdFx0XHR2YXIgcmVxID0gdGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVsc1tqXTtcblxuXHRcdFx0aWYobmFtZSAmJiBuYW1lLm1hdGNoKHJlcS5yZWdleCkgJiYgIXRoYXRbZG5JZF0udXNlZENoYW5uZWxzW25hbWVdKXtcblx0XHRcdFx0dGhhdFtkbklkXS51c2VkQ2hhbm5lbHNbbmFtZV0gPSBuZXcgQ2hhbm5lbChkbklkLCBuYW1lLCByZXEuY2IpO1xuXHRcdFx0XHRjaGFubmVscy5wdXNoKG5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiAgY2hhbm5lbHM7XG59O1xuXG5cblJUQy5wcm90b3R5cGUuX29uRGF0YUNoYW5uZWwgPSBmdW5jdGlvbihkbklkLCBkYXRhY2hhbm5lbCl7XG5cdHZhciBjaGFubmVsID0gdGhpc1tkbklkXS51c2VkQ2hhbm5lbHNbZGF0YWNoYW5uZWwubGFiZWxdO1xuXG5cdGlmKCFjaGFubmVsKXtcblx0XHRjb25zb2xlLmxvZyhcIkNoYW5uZWwgXCIrZGF0YWNoYW5uZWwubGFiZWwrXCIgdW5tYXRjaGVkLCBjbG9zaW5nICFcIik7XG5cdFx0ZGF0YWNoYW5uZWwuY2xvc2UoKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cdGNvbnNvbGUubG9nKFwiQ2hhbm5lbCBcIitkYXRhY2hhbm5lbC5sYWJlbCtcIiBjcmVhdGVkICFcIik7XG5cblx0Y2hhbm5lbC5zZXRDaGFubmVsKGRhdGFjaGFubmVsKTtcbn07XG5cblxuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJ0YyA9IGZ1bmN0aW9uKGRvbU5vZGUsIHNlbGVjdGVkTm9kZXMpe1xuXHR2YXIgcnRjID0gbmV3IFJUQyh0aGlzKTtcblxuXHRpZihkb21Ob2RlKXtcblx0XHRjcmVhdGVOZXVyb25zRnJvbURPTShkb21Ob2RlLCBzZWxlY3RlZE5vZGVzLCBydGMpO1xuXHR9XG5cblx0cmV0dXJuIHJ0Yztcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gY3JlYXRlTmV1cm9uc0Zyb21ET00oZG9tTm9kZSwgc2VsZWN0ZWROb2RlcywgcnRjKXtcblx0aWYoIWRvbU5vZGUgfHwgIWRvbU5vZGUucXVlcnlTZWxlY3RvckFsbCkgcmV0dXJuIDtcblxuXG5cdC8vUmV0cmlldmUgYWxsIHRhZ3Mgd2hpY2ggbmFtZSBzdGFydHMgd2l0aCBcIm5ldXJvbi1cIlxuXHR2YXIgbmV1cm9uTm9kZUxpc3QgPSBkb21Ob2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcblx0dmFyIG5ldXJvbk5vZGVzID0gW107XG5cdGZvcih2YXIgaT0wO2k8bmV1cm9uTm9kZUxpc3QubGVuZ3RoOyBpKyspe1xuXHRcdGlmKGlzTmV1cm9uVGFnKG5ldXJvbk5vZGVMaXN0W2ldKSl7XG5cdFx0XHRuZXVyb25Ob2Rlcy5wdXNoKG5ldXJvbk5vZGVMaXN0W2ldKTtcblx0XHRcdGlmKEFycmF5LmlzQXJyYXkoc2VsZWN0ZWROb2RlcykpIHNlbGVjdGVkTm9kZXMucHVzaChuZXVyb25Ob2RlTGlzdFtpXSk7XG5cdFx0fVxuXHR9XG5cblx0Ly9mb3IgZWFjaCB0YWcgdGhhdCBoYXMgYSBuYW1lIGF0dHJpYnV0ZSwgY3JlYXRlIGEgbmV1cm9uIGFzc29jaWF0ZWQgd2l0aCBpdFxuXHRuZXVyb25Ob2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5ldXJvbk5vZGUpe1xuXG5cdFx0dmFyIGNoYW5uZWwgPSBnZXRDaGFubmVsKG5ldXJvbk5vZGUuYXR0cmlidXRlc1tcIm5hbWVcIl0udmFsdWUpO1xuXG5cdFx0cnRjLnVzZShjaGFubmVsLCBmdW5jdGlvbihkbklkLCBuZXVyb24pe1xuXHRcdFx0bmV1cm9uTm9kZS5zZXROZXVyb24oZG5JZCwgbmV1cm9uKTtcblx0XHR9KTtcblxuXHR9KTtcblxufVxuXG5cbmZ1bmN0aW9uIGlzTmV1cm9uVGFnKG5vZGUpe1xuXHRyZXR1cm4gbm9kZS50YWdOYW1lLnN0YXJ0c1dpdGgoXCJORVVST04tXCIpICYmXG5cdFx0bm9kZS5hdHRyaWJ1dGVzW1wibmFtZVwiXSAmJlxuXHRcdCh0eXBlb2Ygbm9kZS5zZXROZXVyb24gPT09ICdmdW5jdGlvbicpO1xufVxuXG5mdW5jdGlvbiBnZXRDaGFubmVsKG5hbWUpe1xuXHRyZXR1cm4gbmFtZS5yZXBsYWNlKC9cXHMrLywgXCJcIik7XG59XG4iLCIvKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gdHJ1ZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLyoqXG4gKlx0Y2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIFN0YXR1cyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXG5cdC8qKiBtb2RlbCBvZiByb2JvdCA6IGF2YWlsYWJsZSBwYXJ0cyBhbmQgc3RhdHVzICoqL1xuXHR0aGlzLnJvYm90TW9kZWwgPSBbXTtcblx0dGhpcy5fcm9ib3RNb2RlbEluaXQgPSBmYWxzZTtcblxuXHQvKioqIHN0cnVjdHVyZSBvZiBkYXRhIGNvbmZpZyAqKipcblx0XHQgY3JpdGVyaWEgOlxuXHRcdCAgIHRpbWU6IGFsbCAzIHRpbWUgY3JpdGVyaWEgc2hvdWxkIG5vdCBiZSBkZWZpbmVkIGF0IHRoZSBzYW1lIHRpbWUuIChyYW5nZSB3b3VsZCBiZSBnaXZlbiB1cClcblx0XHQgICAgIGJlZzoge1tudWxsXSx0aW1lfSAobnVsbCBtZWFucyBtb3N0IHJlY2VudCkgLy8gc3RvcmVkIGEgVVRDIGluIG1zIChudW0pXG5cdFx0ICAgICBlbmQ6IHtbbnVsbF0sIHRpbWV9IChudWxsIG1lYW5zIG1vc3Qgb2xkZXN0KSAvLyBzdG9yZWQgYXMgVVRDIGluIG1zIChudW0pXG5cdFx0ICAgICByYW5nZToge1tudWxsXSwgdGltZX0gKHJhbmdlIG9mIHRpbWUocG9zaXRpdmUpICkgLy8gaW4gcyAobnVtKVxuXHRcdCAgIHJvYm90OiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0ICAgcGxhY2U6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgb3BlcmF0b3I6IHtbbGFzdF0sIG1heCwgbW95LCBzZH0gLSggbWF5YmUgbW95IHNob3VsZCBiZSBkZWZhdWx0XG5cdFx0IC4uLlxuXG5cdFx0IHBhcnRzIDoge1tudWxsXSBvciBBcnJheU9mIFBhcnRzSWR9IHRvIGdldCBlcnJvcnNcblx0XHQgc3RhdHVzIDoge1tudWxsXSBvciBBcnJheU9mIFN0YXR1c05hbWV9IHRvIGdldCBzdGF0dXNcblxuXHRcdCBzYW1wbGluZzoge1tudWxsXSBvciBpbnR9XG5cdCovXG5cdHRoaXMuZGF0YUNvbmZpZyA9IHtcblx0XHRjcml0ZXJpYToge1xuXHRcdFx0dGltZToge1xuXHRcdFx0XHRiZWc6IG51bGwsXG5cdFx0XHRcdGVuZDogbnVsbCxcblx0XHRcdFx0cmFuZ2U6IG51bGwgLy8gaW4gc1xuXHRcdFx0fSxcblx0XHRcdHJvYm90OiBudWxsXG5cdFx0fSxcblx0XHRvcGVyYXRvcjogJ2xhc3QnLFxuXHRcdHBhcnRzOiBudWxsLFxuXHRcdHN0YXR1czogbnVsbFxuXHR9O1xuXG5cdHJldHVybiB0aGlzO1xufTtcbi8qKlxuICogR2V0IHJvYm90TW9kZWwgOlxuICoge1xuICogIHBhcnRzOiB7XG4gKlx0XHRcInBhcnRYWFwiOiB7XG4gKiBcdFx0XHQgZXJyb3JzRGVzY3I6IHsgZW5jb3VudGVyZWQgZXJyb3JzIGluZGV4ZWQgYnkgZXJyb3JJZHM+MCB9XG4gKlx0XHRcdFx0PiBDb25maWcgb2YgZXJyb3JzIDpcbiAqXHRcdFx0XHRcdGNyaXRMZXZlbDogRkxPQVQsIC8vIGNvdWxkIGJlIGludC4uLlxuICogXHRcdFx0XHRcdG1zZzogU1RSSU5HLFxuICpcdFx0XHRcdFx0c3RvcFNlcnZpY2VJZDogU1RSSU5HLFxuICpcdFx0XHRcdFx0cnVuU2NyaXB0OiBTZXF1ZWxpemUuU1RSSU5HLFxuICpcdFx0XHRcdFx0bWlzc2lvbk1hc2s6IFNlcXVlbGl6ZS5JTlRFR0VSLFxuICpcdFx0XHRcdFx0cnVuTGV2ZWw6IFNlcXVlbGl6ZS5JTlRFR0VSXG4gKlx0XHRcdGVycm9yOltGTE9BVCwgLi4uXSwgLy8gY291bGQgYmUgaW50Li4uXG4gKlx0XHRcdHRpbWU6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRyb2JvdDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdC8vLyBwbGFjZTpbRkxPQVQsIC4uLl0sIG5vdCBpbXBsZW1lbnRlZCB5ZXRcbiAqXHRcdH0sXG4gKlx0IFx0Li4uIChcIlBhcnRZWVwiKVxuICogIH0sXG4gKiAgc3RhdHVzOiB7XG4gKlx0XHRcInN0YXR1c1hYXCI6IHtcbiAqXHRcdFx0XHRkYXRhOltGTE9BVCwgLi4uXSwgLy8gY291bGQgYmUgaW50Li4uXG4gKlx0XHRcdFx0dGltZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRcdC8vLyBwbGFjZTpbRkxPQVQsIC4uLl0sIG5vdCBpbXBsZW1lbnRlZCB5ZXRcbiAqXHRcdFx0XHRyYW5nZTogW0ZMT0FULCBGTE9BVF0sXG4gKlx0XHRcdFx0bGFiZWw6IHN0cmluZ1xuICpcdFx0XHR9LFxuICpcdCBcdC4uLiAoXCJTdGF0dXNZWVwiKVxuICogIH1cbiAqIH1cbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5nZXRSb2JvdE1vZGVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMucm9ib3RNb2RlbDtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFDb25maWcgY29uZmlnIGZvciBkYXRhIHJlcXVlc3RcbiAqIGlmIGRhdGFDb25maWcgaXMgZGVmaW5lIDogc2V0IGFuZCByZXR1cm4gdGhpc1xuICpcdCBAcmV0dXJuIHtTdGF0dXN9IHRoaXNcbiAqIGVsc2VcbiAqXHQgQHJldHVybiB7T2JqZWN0fSBjdXJyZW50IGRhdGFDb25maWdcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhQ29uZmlnID0gZnVuY3Rpb24obmV3RGF0YUNvbmZpZyl7XG5cdGlmKG5ld0RhdGFDb25maWcpIHtcblx0XHR0aGlzLmRhdGFDb25maWc9bmV3RGF0YUNvbmZpZztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZztcbn07XG4vKipcbiAqIFRPIEJFIElNUExFTUVOVEVEIDogb3BlcmF0b3IgbWFuYWdlbWVudCBpbiBETi1TdGF0dXNcbiAqIEBwYXJhbSAge1N0cmluZ31cdCBuZXdPcGVyYXRvciA6IHtbbGFzdF0sIG1heCwgbW95LCBzZH1cbiAqIEByZXR1cm4ge1N0YXR1c30gdGhpcyAtIGNoYWluYWJsZVxuICogU2V0IG9wZXJhdG9yIGNyaXRlcmlhLlxuICogRGVwZW5kcyBvbiBuZXdPcGVyYXRvclxuICpcdEBwYXJhbSB7U3RyaW5nfSBuZXdPcGVyYXRvclxuICpcdEByZXR1cm4gdGhpc1xuICogR2V0IG9wZXJhdG9yIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge1N0cmluZ30gb3BlcmF0b3JcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhT3BlcmF0b3IgPSBmdW5jdGlvbihuZXdPcGVyYXRvcil7XG5cdGlmKG5ld09wZXJhdG9yKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yID0gbmV3T3BlcmF0b3I7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcub3BlcmF0b3I7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIG51bVNhbXBsZXNcbiAqIEBwYXJhbSB7aW50fSBudW1iZXIgb2Ygc2FtcGxlcyBpbiBkYXRhTW9kZWxcbiAqIGlmIGRlZmluZWQgOiBzZXQgbnVtYmVyIG9mIHNhbXBsZXNcbiAqXHRAcmV0dXJuIHtTdGF0dXN9IHRoaXNcbiAqIGVsc2VcbiAqXHRAcmV0dXJuIHtpbnR9IG51bWJlciBvZiBzYW1wbGVzXG4gKiovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFTYW1wbGluZyA9IGZ1bmN0aW9uKG51bVNhbXBsZXMpe1xuXHRpZihudW1TYW1wbGVzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLnNhbXBsaW5nID0gbnVtU2FtcGxlcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZztcbn07XG4vKipcbiAqIFNldCBvciBnZXQgZGF0YSB0aW1lIGNyaXRlcmlhIGJlZyBhbmQgZW5kLlxuICogSWYgcGFyYW0gZGVmaW5lZFxuICpcdEBwYXJhbSB7RGF0ZX0gbmV3VGltZUJlZyAvLyBtYXkgYmUgbnVsbFxuICpcdEBwYXJhbSB7RGF0ZX0gbmV3VGltZUVuZCAvLyBtYXkgYmUgbnVsbFxuICpcdEByZXR1cm4ge1N0YXR1c30gdGhpc1xuICogSWYgbm8gcGFyYW0gZGVmaW5lZDpcbiAqXHRAcmV0dXJuIHtPYmplY3R9IFRpbWUgb2JqZWN0OiBmaWVsZHMgYmVnIGFuZCBlbmQuXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YVRpbWUgPSBmdW5jdGlvbihuZXdUaW1lQmVnLG5ld1RpbWVFbmQsIG5ld1JhbmdlKXtcblx0aWYobmV3VGltZUJlZyB8fCBuZXdUaW1lRW5kIHx8IG5ld1JhbmdlKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuYmVnID0gbmV3VGltZUJlZy5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuZW5kID0gbmV3VGltZUVuZC5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UgPSBuZXdSYW5nZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHtcblx0XHRcdGJlZzogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuYmVnKSxcblx0XHRcdGVuZDogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuZW5kKSxcblx0XHRcdHJhbmdlOiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5yYW5nZSlcblx0XHR9O1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiByb2JvdElkc1xuICogU2V0IHJvYm90IGNyaXRlcmlhLlxuICpcdEBwYXJhbSB7QXJyYXlbSW50XX0gcm9ib3RJZHMgbGlzdCBvZiByb2JvdCBJZHNcbiAqIEdldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtBcnJheVtJbnRdfSBsaXN0IG9mIHJvYm90IElkc1xuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFSb2JvdElkcyA9IGZ1bmN0aW9uKHJvYm90SWRzKXtcblx0aWYocm9ib3RJZHMpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3QgPSByb2JvdElkcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5yb2JvdDtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcGxhY2VJZHMgLy8gbm90IHJlbGV2YW50Pywgbm90IGltcGxlbWVudGVkIHlldFxuICogU2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEBwYXJhbSB7QXJyYXlbSW50XX0gcGxhY2VJZHMgbGlzdCBvZiBwbGFjZSBJZHNcbiAqIEdldCBwbGFjZSBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtBcnJheVtJbnRdfSBsaXN0IG9mIHBsYWNlIElkc1xuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFQbGFjZUlkcyA9IGZ1bmN0aW9uKHBsYWNlSWRzKXtcblx0aWYocGxhY2VJZHMpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2VJZCA9IHBsYWNlSWRzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnBsYWNlO1xufTtcbi8qKlxuICogR2V0IGRhdGEgYnkgc2Vuc29yIG5hbWUuXG4gKlx0QHBhcmFtIHtBcnJheVtTdHJpbmddfSBzZW5zb3JOYW1lIGxpc3Qgb2Ygc2Vuc29yc1xuICovXG5TdGF0dXMucHJvdG90eXBlLmdldERhdGFCeU5hbWUgPSBmdW5jdGlvbihzZW5zb3JOYW1lcyl7XG5cdHZhciBkYXRhPVtdO1xuXHRmb3IodmFyIG4gaW4gc2Vuc29yTmFtZXMpIHtcblx0XHRkYXRhLnB1c2godGhpcy5kYXRhTW9kZWxbc2Vuc29yTmFtZXNbbl1dKTtcblx0fVxuXHRyZXR1cm4gZGF0YTtcbn07XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIGVycm9yL3N0YXR1cyB1cGRhdGVzXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24ocm9ib3ROYW1lcywgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGNvbnNvbGUubG9nKHJvYm90TmFtZXMpO1xuXHR0aGlzLnNlbGVjdG9yLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogJ3N0YXR1cycsXG5cdFx0ZnVuYzogJ0xpc3RlblVwZGF0ZXMnLFxuXHRcdGRhdGE6IHJvYm90TmFtZXNcblx0fSwgZnVuY3Rpb24gKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cocGVlcklkKTtcblx0XHQvLyBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdC8vIGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdGlmIChlcnIgfHwgKGRhdGEmJmRhdGEuZXJyJmRhdGEuZXJyLnN0KSApIHtcblx0XHRcdExvZ2dlci5lcnJvciggXCJTdGF0dXNTdWJzY3JpYmU6XCIrKGVycj9lcnI6XCJcIikrXCJcXG5cIisoZGF0YSYmZGF0YS5lcnI/ZGF0YS5lcnI6XCJcIikgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlciAmJiBkYXRhLmhlYWRlci5yZXFDb25maWdcblx0XHRcdCAgICYmIGRhdGEuaGVhZGVyLnJlcUNvbmZpZy50eXBlID09PSBcImluaXRcIikge1xuXHRcdFx0XHQvLyBpbml0aWFsaXNhdGlvbiBvZiByb2JvdCBtb2RlbFxuXHRcdFx0XHR0aGF0LnJvYm90TW9kZWxJbml0ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmKHRoYXQucm9ib3RNb2RlbEluaXQpIHtcblx0XHRcdFx0dGhhdC5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2KGRhdGEucm9ib3RzKTtcblx0XHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHRcdGNhbGxiYWNrKHRoYXQucm9ib3RNb2RlbCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gRXJyb3Jcblx0XHRcdFx0TG9nZ2VyLmVycm9yKFwiUm9ib3QgbW9kZWwgaGFzIG5vdCBiZWVuIGluaXRpYWxpc2VkLCBjYW5ub3QgYmUgdXBkYXRlZFwiKTtcblx0XHRcdFx0Ly8vIFRPRE8gdW5zdWJzY3JpYmVcblx0XHRcdH1cblx0XHR9XG5cdH0sIHsgYXV0bzogdHJ1ZSB9KTtcbn07XG5cblxuXG5cbi8qKlxuICogR2V0IGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0dmFyIGRhdGFNb2RlbCA9IHt9O1xuXHRpZihkYXRhQ29uZmlnKVxuXHRcdHRoaXMuRGF0YUNvbmZpZyhkYXRhQ29uZmlnKTtcblx0Ly8gY29uc29sZS5sb2coXCJSZXF1ZXN0OiBcIitKU09OLnN0cmluZ2lmeShkYXRhQ29uZmlnKSk7XG5cdHRoaXMuc2VsZWN0b3IucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJzdGF0dXNcIixcblx0XHRmdW5jOiBcIkRhdGFSZXF1ZXN0XCIsXG5cdFx0ZGF0YToge1xuXHRcdFx0dHlwZTpcInNwbFJlcVwiLFxuXHRcdFx0ZGF0YUNvbmZpZzogdGhhdC5kYXRhQ29uZmlnXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1wiK3RoYXQuZGF0YUNvbmZpZy5zZW5zb3JzK1wiXSBSZWN2IGVycjogXCIrSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJVcGRhdGVEYXRhOlxcblwiK0pTT04uc3RyaW5naWZ5KGRhdGEuaGVhZGVyLnJlcUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL0xvZ2dlci5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRkYXRhTW9kZWwgPSB0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcblxuXHRcdExvZ2dlci5sb2codGhhdC5nZXREYXRhTW9kZWwoKSk7XG5cblx0XHRjYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhhdCk7IC8vIGJpbmQgY2FsbGJhY2sgd2l0aCBTdGF0dXNcblx0XHRjYWxsYmFjayhkYXRhTW9kZWwpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgcm9ib3QgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuX2dldFJvYm90TW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgcm9ib3Q7XG5cblx0aWYoIXRoaXMucm9ib3RNb2RlbClcblx0XHR0aGlzLnJvYm90TW9kZWwgPSBbXTtcblx0Ly8gY29uc29sZS5sb2coXCJfZ2V0Um9ib3RNb2RlbEZyb21SZWN2XCIpO1xuXHQvLyBjb25zb2xlLmxvZyh0aGlzLnJvYm90TW9kZWwpO1xuXG5cdC8qKiBPbmx5IG9uZSByb2JvdCBpcyBtYW5hZ2UgYXQgdGhlIHNhbWUgdGltZSBjdXJyZW50bHkgKiovXG5cdGZvcih2YXIgbiBpbiBkYXRhKSB7XG5cdFx0aWYoIXRoaXMucm9ib3RNb2RlbFtuXSlcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXT17fTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucm9ib3QgPSBkYXRhW25dLnJvYm90O1xuXG5cdFx0Ly8gaWYodGhpcy5yb2JvdE1vZGVsLmxlbmd0aDxkYXRhLmxlbmd0aCkge1xuXHRcdC8vIFx0dGhpcy5yb2JvdE1vZGVsLnB1c2goe3JvYm90OiBkYXRhWzBdLnJvYm90c30pO1xuXHRcdC8vIH1cblxuXHRcdC8qKiBleHRyYWN0IHBhcnRzIGluZm8gKiovXG5cdFx0aWYoZGF0YVtuXSAmJiBkYXRhW25dLnBhcnRzKSB7XG5cdFx0XHRpZighdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzKVxuXHRcdFx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMgPSB7fTtcblx0XHRcdHZhciBwYXJ0cyA9IGRhdGFbbl0ucGFydHM7XG5cdFx0XHR2YXIgclBhcnRzID0gdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzO1xuXHRcdFx0Zm9yKHZhciBxIGluIHJQYXJ0cykge1xuXHRcdFx0XHQvKiogcGFydFtxXSB3YXMgbm90IHNlbnQgYmVjYXVzZSBubyBlcnJvciAqKi9cblx0XHRcdFx0aWYoIXBhcnRzW3FdXG5cdFx0XHRcdCAgICYmclBhcnRzW3FdLmV2dHMmJnJQYXJ0c1txXS5ldnRzLmNvZGUpIHtcblx0XHRcdFx0XHRyUGFydHNbcV0uZXZ0cyA9IHtcblx0XHRcdFx0XHRcdGNvZGU6IFswXSxcblx0XHRcdFx0XHRcdGNvZGVSZWY6IFswXSxcblx0XHRcdFx0XHRcdHRpbWU6IFtEYXRlLm5vdygpXSAvKiogdXBkYXRlICoqL1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHAgaW4gcGFydHMpIHtcblx0XHRcdFx0aWYocGFydHNbcF0mJnBhcnRzW3BdLmVyciAmJiBwYXJ0c1twXS5lcnIuc3Q+MCkge1xuXHRcdFx0XHRcdExvZ2dlci5lcnJvcihcIlBhcnRzIFwiK3ArXCIgd2FzIGluIGVycm9yOiBcIitkYXRhW3BdLmVyci5tc2cpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFyUGFydHNbcF0pIHtcblx0XHRcdFx0XHRyUGFydHNbcF09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocGFydHNbcF0pIHtcblx0XHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGNhdGVnb3J5ICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmNhdGVnb3J5PXBhcnRzW3BdLmNhdGVnb3J5O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IG5hbWUgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubmFtZT1wYXJ0c1twXS5uYW1lO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGxhYmVsICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmxhYmVsPXBhcnRzW3BdLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciB0aW1lICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0pO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy50aW1lKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0udGltZSk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLmNvZGUpO1xuXG5cdFx0XHRcdFx0LyoqIHVwZGF0ZSBlcnJvckxpc3QgKiovXG5cdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3QpXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0PXt9O1xuXHRcdFx0XHRcdGZvciggdmFyIGVsIGluIHBhcnRzW3BdLmVycm9yTGlzdCApXG5cdFx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdFtlbF0pXG5cdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3RbZWxdID0gcGFydHNbcF0uZXJyb3JMaXN0W2VsXTtcblxuXHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzID0ge1xuXHRcdFx0XHRcdFx0Y29kZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGUpLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGVSZWYpLFxuXHRcdFx0XHRcdFx0dGltZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLnRpbWUpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ3BhcnRzLCByUGFydHMnKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0cyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiTm8gcGFydHMgdG8gcmVhZCBmb3Igcm9ib3QgXCIrZGF0YVtuXS5yb2JvdC5uYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKiBjcmVhdGUgU3RhdHVzIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLlN0YXR1cyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgU3RhdHVzKHRoaXMpO1xufTtcblxuLyoqXG4gKiBTZXQgb24gc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGZpbmQgc3RhdHVzIHRvIG1vZGlmeVxuICogQHBhcmFtIHBhcnROYW1lIFx0dG8gZmluZCBzdGF0dXMgdG8gbW9kaWZ5XG4gKiBAcGFyYW0gY29kZVx0XHRuZXdDb2RlXG4gKiBAcGFyYW0gY2FsbGJhY2tcdFx0cmV0dXJuIGNhbGxiYWNrICg8Ym9vbD5zdWNjZXNzKVxuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnNldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNvZGUsIHNvdXJjZSwgY2FsbGJhY2spIHtcblx0dmFyIGZ1bmNOYW1lID0gXCJTZXRTdGF0dXNfXCIrcGFydE5hbWU7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6ZnVuY05hbWUsZGF0YToge3JvYm90TmFtZTogcm9ib3ROYW1lLCBzdGF0dXNDb2RlOiBjb2RlLCBzb3VyY2U6IHNvdXJjZXwxfX0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2sodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEdldCBvbmUgc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBwYXJ0TmFtZSBcdHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBjYWxsYmFja1x0XHRyZXR1cm4gY2FsbGJhY2soLTEgaWYgbm90IGZvdW5kL2RhdGEgb3RoZXJ3aXNlKVxuICogQHBhcmFtIF9mdWxsIFx0bW9yZSBkYXRhIGFib3V0IHN0YXR1c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNhbGxiYWNrLCBfZnVsbCkge1xuXHR2YXIgZnVsbD1fZnVsbHx8ZmFsc2U7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6XCJHZXRTdGF0dXNcIixkYXRhOiB7cm9ib3ROYW1lOiByb2JvdE5hbWUsIHBhcnROYW1lOiBwYXJ0TmFtZSwgZnVsbDogZnVsbH19LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjaygtMSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGRhdGEpO1xuXHRcdFx0fVxuXHRcdH0pO1xufTtcbiIsIkRpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS50aW1lID0gZnVuY3Rpb24obG9vcCwgY2FsbGJhY2spe1xuXHRpZihsb29wKXtcblx0XHR0aGlzLnN1YnNjcmliZSh7XG5cdFx0XHRzZXJ2aWNlOiAndGltZXInLFxuXHRcdFx0ZnVuYzogJ1N1YnNjcmliZVRpbWVyJyxcblx0XHR9LCBjYWxsYmFjaywge2F1dG86IHRydWV9KTtcblx0fWVsc2V7XG5cdFx0dGhpcy5yZXF1ZXN0KHtcblx0XHRcdHNlcnZpY2U6ICd0aW1lcicsXG5cdFx0XHRmdW5jOiAnR2V0VGltZScsXG5cdFx0fSwgY2FsbGJhY2spO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIGQxID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJyk7XG5cblxuZDEudmVyYm9zZSA9IGZ1bmN0aW9uKGJWZXJib3NlKSB7XG4gIGlmKHR5cGVvZiBiVmVyYm9zZSA9PT0gJ3VuZGVmaW5lZCcpIGJWZXJib3NlID0gdHJ1ZTtcbiAgdmFyIG9wdGlvbnMgPSB7c3ViSWRzOiBbXX07XG4gIGlmKGJWZXJib3NlKSB7XG4gICAgZDEoXCIjc2VsZlwiKS5zdWJzY3JpYmUoe1xuICAgICAgc2VydmljZTogJ21hcHMnLFxuICAgICAgZnVuYzogJ0xpc3Rlbk1hcCcsXG4gICAgICBvYmo6IFsgdGhpcy5fbWFwIF1cbiAgICB9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuICAgICAgaWYoZXJyKSBjb25zb2xlLmxvZyhcIltFUlJdIFwiICsgZXJyKTtcbiAgICAgIGVsc2UgY29uc29sZS5sb2coZGF0YSk7XG4gICAgfSwgb3B0aW9ucyk7XG4gICAgX3ZlcmJvc2Vfc3ViSWRzID0gb3B0aW9ucy5zdWJJZHM7XG4gIH1cbiAgZWxzZSB7XG4gICAgZDEoXCIjc2VsZlwiKS51bnN1YnNjcmliZShfdmVyYm9zZV9zdWJJZHMpO1xuICB9XG59XG52YXIgX3ZlcmJvc2Vfc3ViSWRzID0gW107XG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5EaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG5cbmZ1bmN0aW9uIGV4cGxvcmVyKG5vZGUpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMubm9kZSA9IG5vZGU7XG5cdHJldHVybiB0aGlzO1xufVxuXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubGlzdGVuVmlld2VycyA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblx0XHR0aGlzLnN1YnNjcmliZSh7XG5cdFx0XHRzZXJ2aWNlOiAnZXhwbG9yZXInLFxuXHRcdFx0ZnVuYzogJ0xpc3RlblZpZXdlcnMnLFxuXHRcdFx0Ly8gZGF0YTogeyBmaWxlOiBmaWxlfVxuXG5cdFx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXHRcdFx0Y2FsbGJhY2socGVlcklkLCBudWxsLCBkYXRhKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzO1xufTtcbiIsIihmdW5jdGlvbiAoQnVmZmVyKXtcbi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgY2hhbm5lbCBlbmNvZGluZ1xuICogLSBiYXNlNjQgY29kaW5nXG4gKiAtIG5vbmVcbiAqIERhdGEgZm9ybWF0IDogXG4gKlx0XHR0OiB7J2I2NCcsJ25vbmUnfVxuICpcdFx0YjogPGlmIGI2ND4gezQsOH1cbiAqXHRcdGQ6IGVuY29kZWQgZGF0YSB7YnVmZmVyIG9yIEFycmF5fVxuICpcdFx0czogc2l6ZVxuICovXG5cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcblxuXG4vKipcbiAqIERlZmF1bHQgOiBubyBlbmNvZGluZ1xuICogRWZmZWN0aXZlIGZvciBzdHJpbmcgYmFzZWQgY2hhbm5lbHMgKGxpa2UgSlNPTiBiYXNlZCBXUylcbiAqICovXG5mdW5jdGlvbiBOb0NvZGluZygpe1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGJ1ZmZlciBjb2RlZCBpbiBiYXNlNjQgYW5kIGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieVxuKiBieXRlQ29kaW5nIGJ5dGVzIGludG8gYXJyYXlcbiogQHBhcmFtIGJ1ZmZlciBpbiBiYXNlNjRcbiogQHBhcmFtIGJ5dGVDb2RpbmcgbnVtYmVyIG9mIGJ5dGVzIGZvciBlYWNoIG51bWJlciAoNCBvciA4KVxuKiBAcmV0dXJuIGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCkuIG51bGwgaWYgY291bGQgbm90IGNvbnZlcnQuXG4qL1xuTm9Db2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdHJldHVybiBkYXRhLmQ7XG59O1xuXG4vKipcbiogQ29udmVydCBhcnJheSBjb250YWluaW5nIG51bWJlcnMgY29kZWQgYnkgYnl0ZUNvZGluZyBieXRlcyBpbnRvIGJ1ZmZlciBjb2RlZCBpbiBiYXNlNjRcbiogQHBhcmFtIFx0e0FycmF5PEZsb2F0Pn0gXHRhcnJheSBvZiBmbG9hdCAoMzIgb3IgNjQgYml0cylcbiogQHBhcmFtIFx0e2ludGVnZXJ9IFx0Ynl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggZmxvYXQgKDQgb3IgOClcbiogQHJldHVybiAgXHR7U3RyaW5nfSBcdGJ1ZmZlciBpbiBiYXNlNjQuIG51bGwgaWYgY291bGQgbm90IGNvbnZlcnQuXG4qL1xuTm9Db2RpbmcucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXkpIHtcblx0cmV0dXJuIHtcblx0XHR0OiAnbm8nLCAvKiB0eXBlICovXG5cdFx0ZDogYXJyYXksIC8qIGRhdGEgKi9cblx0XHRzOiBhcnJheS5sZW5ndGhcblx0fTtcbn07XG5cblxuXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBiYXNlNjQgZW5jb2RpbmdcbiAqIEVmZmVjdGl2ZSBmb3Igc3RyaW5nIGJhc2VkIGNoYW5uZWxzIChsaWtlIEpTT04gYmFzZWQgV1MpXG4gKiAqL1xuZnVuY3Rpb24gQmFzZTY0Q29kaW5nKCl7XG5cdHJldHVybiB0aGlzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vICAgIFV0aWxpdHkgZnVuY3Rpb25zICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLypcXFxuIHwqfFxuIHwqfCAgdXRpbGl0YWlyZXMgZGUgbWFuaXB1bGF0aW9ucyBkZSBjaGHDrm5lcyBiYXNlIDY0IC8gYmluYWlyZXMgLyBVVEYtOFxuIHwqfFxuIHwqfCAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9Ew6ljb2Rlcl9lbmNvZGVyX2VuX2Jhc2U2NFxuIHwqfFxuIFxcKi9cbi8qKiBEZWNvZGVyIHVuIHRhYmxlYXUgZCdvY3RldHMgZGVwdWlzIHVuZSBjaGHDrm5lIGVuIGJhc2U2NCAqL1xudmFyIGI2NFRvVWludDYgPSBmdW5jdGlvbihuQ2hyKSB7XG5cdHJldHVybiBuQ2hyID4gNjQgJiYgbkNociA8IDkxID9cblx0XHRuQ2hyIC0gNjVcblx0XHQ6IG5DaHIgPiA5NiAmJiBuQ2hyIDwgMTIzID9cblx0XHRuQ2hyIC0gNzFcblx0XHQ6IG5DaHIgPiA0NyAmJiBuQ2hyIDwgNTggP1xuXHRcdG5DaHIgKyA0XG5cdFx0OiBuQ2hyID09PSA0MyA/XG5cdFx0NjJcblx0XHQ6IG5DaHIgPT09IDQ3ID9cblx0XHQ2M1xuXHRcdDpcdDA7XG59O1xuXG4vKipcbiAqIERlY29kZSBiYXNlNjQgc3RyaW5nIHRvIFVJbnQ4QXJyYXlcbiAqIEBwYXJhbSAge1N0cmluZ30gc0Jhc2U2NFx0XHRiYXNlNjQgY29kZWQgc3RyaW5nXG4gKiBAcGFyYW0gIHtpbnR9IG5CbG9ja3NTaXplIHNpemUgb2YgYmxvY2tzIG9mIGJ5dGVzIHRvIGJlIHJlYWQuIE91dHB1dCBieXRlQXJyYXkgbGVuZ3RoIHdpbGwgYmUgYSBtdWx0aXBsZSBvZiB0aGlzIHZhbHVlLlxuICogQHJldHVybiB7VWludDhBcnJheX1cdFx0XHRcdHRhYiBvZiBkZWNvZGVkIGJ5dGVzXG4gKi9cbnZhciBiYXNlNjREZWNUb0FyciA9IGZ1bmN0aW9uKHNCYXNlNjQsIG5CbG9ja3NTaXplKSB7XG5cdHZhclxuXHRzQjY0RW5jID0gc0Jhc2U2NC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL10vZywgXCJcIiksIG5JbkxlbiA9IHNCNjRFbmMubGVuZ3RoLFxuXHRuT3V0TGVuID0gbkJsb2Nrc1NpemUgPyBNYXRoLmNlaWwoKG5JbkxlbiAqIDMgKyAxID4+IDIpIC8gbkJsb2Nrc1NpemUpICogbkJsb2Nrc1NpemUgOiBuSW5MZW4gKiAzICsgMSA+PiAyLFxuXHRidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobk91dExlbiksIHRhQnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG5cdGZvciAodmFyIG5Nb2QzLCBuTW9kNCwgblVpbnQyNCA9IDAsIG5PdXRJZHggPSAwLCBuSW5JZHggPSAwOyBuSW5JZHggPCBuSW5MZW47IG5JbklkeCsrKSB7XG5cdFx0bk1vZDQgPSBuSW5JZHggJiAzOyAvKiBuIG1vZCA0ICovXG5cdFx0blVpbnQyNCB8PSBiNjRUb1VpbnQ2KHNCNjRFbmMuY2hhckNvZGVBdChuSW5JZHgpKSA8PCAxOCAtIDYgKiBuTW9kNDtcblx0XHRpZiAobk1vZDQgPT09IDMgfHwgbkluTGVuIC0gbkluSWR4ID09PSAxKSB7XG5cdFx0XHRmb3IgKG5Nb2QzID0gMDsgbk1vZDMgPCAzICYmIG5PdXRJZHggPCBuT3V0TGVuOyBuTW9kMysrLCBuT3V0SWR4KyspIHtcblx0XHRcdFx0dGFCeXRlc1tuT3V0SWR4XSA9IG5VaW50MjQgPj4+ICgxNiA+Pj4gbk1vZDMgJiAyNCkgJiAyNTU7XG5cdFx0XHR9XG5cdFx0XHRuVWludDI0ID0gMDtcblx0XHR9XG5cdH1cblx0Ly8gY29uc29sZS5sb2coXCJ1OGludCA6IFwiK0pTT04uc3RyaW5naWZ5KHRhQnl0ZXMpKTtcblx0cmV0dXJuIGJ1ZmZlcjtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vICAgSW50ZXJmYWNlIGZ1bmN0aW9ucyAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4vKipcbiogQ29udmVydCBidWZmZXIgY29kZWQgaW4gYmFzZTY0IGFuZCBjb250YWluaW5nIG51bWJlcnMgY29kZWQgYnlcbiogYnl0ZUNvZGluZyBieXRlcyBpbnRvIGFycmF5XG4qIEBwYXJhbSBidWZmZXIgaW4gYmFzZTY0XG4qIEBwYXJhbSBieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBudW1iZXIgKDQgb3IgOClcbiogQHJldHVybiBhcnJheSBvZiBmbG9hdCAoMzIgb3IgNjQpLiBudWxsIGlmIGNvdWxkIG5vdCBjb252ZXJ0LlxuKi9cbkJhc2U2NENvZGluZy5wcm90b3R5cGUuZnJvbSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0dmFyIGJ5dGVDb2RpbmcgPSBkYXRhLmI7XG5cdFxuXHQvKiBjaGVjayBieXRlIGNvZGluZyAqL1xuXHRpZihieXRlQ29kaW5nICE9PSA0ICYmIGJ5dGVDb2RpbmcgIT09IDgpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qIGRlY29kZSBkYXRhIHRvIGFycmF5IG9mIGJ5dGUgKi9cblx0dmFyIGJ1ZiA9IGJhc2U2NERlY1RvQXJyKGRhdGEuZCwgZGF0YS5iKTtcblx0LyogcGFyc2UgZGF0YSB0byBmbG9hdCBhcnJheSAqL1xuXHR2YXIgZkFycmF5PW51bGw7XG5cdHN3aXRjaChkYXRhLmIpIHtcblx0Y2FzZSA0OlxuXHRcdGZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmKTtcblx0XHRicmVhaztcblx0Y2FzZSA4OlxuXHRcdGZBcnJheSA9IG5ldyBGbG9hdDY0QXJyYXkoYnVmKTtcblx0XHRicmVhaztcblx0ZGVmYXVsdDpcblx0XHRjb25zb2xlLmxvZyhcIlVuZXhwZWN0ZWQgYnl0ZUNvZGluZyEgU2hvdWxkIG5vdCBoYXBwZW4hIVwiKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHQvKiBwYXJzZSBmQXJyYXkgaW50byBub3JtYWwgYXJyYXkgKi9cblx0dmFyIHRhYiA9IFtdLnNsaWNlLmNhbGwoZkFycmF5KTtcblxuXHRpZihkYXRhLnMgIT09IHRhYi5sZW5ndGgpIHtcblx0XHRjb25zb2xlLmxvZyhcIlNpemUgbWlzbWF0Y2ggd2hlbiBkZWNvZGluZyAhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0YWI7XG59O1xuXG4vKipcbiogQ29udmVydCBhcnJheSBjb250YWluaW5nIG51bWJlcnMgY29kZWQgYnkgYnl0ZUNvZGluZyBieXRlcyBpbnRvIGJ1ZmZlciBjb2RlZCBpbiBiYXNlNjRcbiogQHBhcmFtIFx0e0FycmF5PEZsb2F0Pn0gXHRhcnJheSBvZiBmbG9hdCAoMzIgb3IgNjQgYml0cylcbiogQHBhcmFtIFx0e2ludGVnZXJ9IFx0Ynl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggZmxvYXQgKDQgb3IgOClcbiogQHJldHVybiAgXHR7U3RyaW5nfSBcdGJ1ZmZlciBpbiBiYXNlNjQuIG51bGwgaWYgY291bGQgbm90IGNvbnZlcnQuXG4qL1xuQmFzZTY0Q29kaW5nLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5LCBieXRlQ29kaW5nKSB7XG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Lyogd3JpdGUgYWxsIHNhbXBsZXMgaW4gQnVmZmVyICovXG5cdHZhciBidWYgPSBuZXcgQnVmZmVyKGFycmF5Lmxlbmd0aCpieXRlQ29kaW5nKSxpO1xuXHRzd2l0Y2goYnl0ZUNvZGluZykge1xuXHRjYXNlIDQ6XG5cdFx0Zm9yKGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmKHR5cGVvZiBhcnJheVtpXSAhPT0gJ251bWJlcicpXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0YnVmLndyaXRlRmxvYXRMRShhcnJheVtpXSwgaSAqIGJ5dGVDb2RpbmcpO1xuXHRcdH1cblx0XHRicmVhaztcblx0Y2FzZSA4OlxuXHRcdGZvcihpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZih0eXBlb2YgYXJyYXlbaV0gIT09ICdudW1iZXInKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdGJ1Zi53cml0ZURvdWJsZUxFKGFycmF5W2ldLCBpICogYnl0ZUNvZGluZyk7XG5cdFx0fVxuXHRcdGJyZWFrO1xuXHR9XG5cblx0LyogY29udmVydCBCdWZmZXIgdG8gYmFzZTY0IHN0cmluZyAqL1xuXHR2YXIgYjY0QnVmZiA9IGJ1Zi50b1N0cmluZygnYmFzZTY0Jyk7IFxuXHRyZXR1cm4ge1xuXHRcdHQ6ICdiNjQnLCAvKiB0eXBlICovXG5cdFx0YjogYnl0ZUNvZGluZywgLyogYnl0ZUNvZGluZyAqL1xuXHRcdGQ6IGI2NEJ1ZmYsIC8qIGRhdGEgKi9cblx0XHRzOiBhcnJheS5sZW5ndGggLyogc2l6ZSAqL1xuXHR9O1xufTtcblxuXG5cblxuLyoqXG4gKiBNYW5hZ2VtZW50IG9mIGNvbW0gZW5jb2RpbmdcbiAqICovXG5mdW5jdGlvbiBDb2RpbmdIYW5kbGVyKCl7XG5cdHRoaXMuYjY0ID0gbmV3IEJhc2U2NENvZGluZygpO1xuXHR0aGlzLm5vbmUgPSBuZXcgTm9Db2RpbmcoKTtcblx0XG5cdHJldHVybiB0aGlzO1xufTtcblxuXG5Db2RpbmdIYW5kbGVyLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHRpZighZGF0YSB8fCBkYXRhPT09bnVsbClcblx0XHRyZXR1cm4gbnVsbDtcblx0c3dpdGNoKGRhdGEudCkge1xuXHRjYXNlICdiNjQnOlxuXHRcdHJldHVybiB0aGlzLmI2NC5mcm9tKGRhdGEpO1xuXHRkZWZhdWx0OlxuXHRcdHJldHVybiB0aGlzLm5vbmUuZnJvbShkYXRhKTtcdFx0XG5cdH1cbn07XG5cblxuQ29kaW5nSGFuZGxlci5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihhcnJheSwgdHlwZSwgYnl0ZUNvZGluZykge1xuXHRpZih0eXBlb2YgYXJyYXkgPT09ICdudW1iZXInKSB7XG5cdFx0YXJyYXk9W2FycmF5XTtcblx0fVxuXHRpZighQXJyYXkuaXNBcnJheShhcnJheSkpe1xuXHRcdGNvbnNvbGUubG9nKFwiQ29kaW5nSGFuZGxlci50byBvbmx5IGFjY2VwdHMgYXJyYXkgIVwiKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRcblx0c3dpdGNoKHR5cGUpIHtcblx0Y2FzZSAnYjY0Jzpcblx0XHRyZXR1cm4gdGhpcy5iNjQudG8oYXJyYXksIGJ5dGVDb2RpbmcpO1xuXHRjYXNlICdubyc6XG5cdGRlZmF1bHQ6XG5cdFx0cmV0dXJuIHRoaXMubm9uZS50byhhcnJheSk7XHRcdFxuXHR9XG59O1xuXG5cbi8qKiBBZGQgYmFzZTY0IGhhbmRsZXIgdG8gRGl5YVNlbGVjdG9yICoqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbmV3IENvZGluZ0hhbmRsZXIoKTtcbn07XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyKVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW5OeVl5OTFkR2xzY3k5bGJtTnZaR2x1Wnk5bGJtTnZaR2x1Wnk1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTSXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpTHlvZ2JXRjVZUzFqYkdsbGJuUmNiaUFxSUVOdmNIbHlhV2RvZENBb1l5a2dNakF4TkN3Z1VHRnlkRzVsY21sdVp5QlNiMkp2ZEdsamN5d2dRV3hzSUhKcFoyaDBjeUJ5WlhObGNuWmxaQzVjYmlBcUlGUm9hWE1nYkdsaWNtRnllU0JwY3lCbWNtVmxJSE52Wm5SM1lYSmxPeUI1YjNVZ1kyRnVJSEpsWkdsemRISnBZblYwWlNCcGRDQmhibVF2YjNKY2JpQXFJRzF2WkdsbWVTQnBkQ0IxYm1SbGNpQjBhR1VnZEdWeWJYTWdiMllnZEdobElFZE9WU0JNWlhOelpYSWdSMlZ1WlhKaGJDQlFkV0pzYVdOY2JpQXFJRXhwWTJWdWMyVWdZWE1nY0hWaWJHbHphR1ZrSUdKNUlIUm9aU0JHY21WbElGTnZablIzWVhKbElFWnZkVzVrWVhScGIyNDdJSFpsY25OcGIyNWNiaUFxWEhRekxqQWdiMllnZEdobElFeHBZMlZ1YzJVdUlGUm9hWE1nYkdsaWNtRnllU0JwY3lCa2FYTjBjbWxpZFhSbFpDQnBiaUIwYUdVZ2FHOXdaVnh1SUNvZ2RHaGhkQ0JwZENCM2FXeHNJR0psSUhWelpXWjFiQ3dnWW5WMElGZEpWRWhQVlZRZ1FVNVpJRmRCVWxKQlRsUlpPeUIzYVhSb2IzVjBJR1YyWlc1Y2JpQXFJSFJvWlNCcGJYQnNhV1ZrSUhkaGNuSmhiblI1SUc5bUlFMUZVa05JUVU1VVFVSkpURWxVV1NCdmNpQkdTVlJPUlZOVElFWlBVaUJCSUZCQlVsUkpRMVZNUVZKY2JpQXFJRkJWVWxCUFUwVXVJRk5sWlNCMGFHVWdSMDVWSUV4bGMzTmxjaUJIWlc1bGNtRnNJRkIxWW14cFl5Qk1hV05sYm5ObElHWnZjaUJ0YjNKbElHUmxkR0ZwYkhNdVhHNGdLaUJaYjNVZ2MyaHZkV3hrSUdoaGRtVWdjbVZqWldsMlpXUWdZU0JqYjNCNUlHOW1JSFJvWlNCSFRsVWdUR1Z6YzJWeUlFZGxibVZ5WVd3Z1VIVmliR2xqWEc0Z0tpQk1hV05sYm5ObElHRnNiMjVuSUhkcGRHZ2dkR2hwY3lCc2FXSnlZWEo1TGx4dUlDb3ZYRzVjYmk4cUtseHVJQ29nVFdGdVlXZGxiV1Z1ZENCdlppQmphR0Z1Ym1Wc0lHVnVZMjlrYVc1blhHNGdLaUF0SUdKaGMyVTJOQ0JqYjJScGJtZGNiaUFxSUMwZ2JtOXVaVnh1SUNvZ1JHRjBZU0JtYjNKdFlYUWdPaUJjYmlBcVhIUmNkSFE2SUhzbllqWTBKeXduYm05dVpTZDlYRzRnS2x4MFhIUmlPaUE4YVdZZ1lqWTBQaUI3TkN3NGZWeHVJQ3BjZEZ4MFpEb2daVzVqYjJSbFpDQmtZWFJoSUh0aWRXWm1aWElnYjNJZ1FYSnlZWGw5WEc0Z0tseDBYSFJ6T2lCemFYcGxYRzRnS2k5Y2JseHVYRzUyWVhJZ1JHbDVZVk5sYkdWamRHOXlJRDBnY21WeGRXbHlaU2duTGk0dkxpNHZSR2w1WVZObGJHVmpkRzl5SnlrdVJHbDVZVk5sYkdWamRHOXlPMXh1WEc1Y2JpOHFLbHh1SUNvZ1JHVm1ZWFZzZENBNklHNXZJR1Z1WTI5a2FXNW5YRzRnS2lCRlptWmxZM1JwZG1VZ1ptOXlJSE4wY21sdVp5QmlZWE5sWkNCamFHRnVibVZzY3lBb2JHbHJaU0JLVTA5T0lHSmhjMlZrSUZkVEtWeHVJQ29nS2k5Y2JtWjFibU4wYVc5dUlFNXZRMjlrYVc1bktDbDdYRzVjZEhKbGRIVnliaUIwYUdsek8xeHVmVHRjYmx4dUx5b3FYRzRxSUVOdmJuWmxjblFnWW5WbVptVnlJR052WkdWa0lHbHVJR0poYzJVMk5DQmhibVFnWTI5dWRHRnBibWx1WnlCdWRXMWlaWEp6SUdOdlpHVmtJR0o1WEc0cUlHSjVkR1ZEYjJScGJtY2dZbmwwWlhNZ2FXNTBieUJoY25KaGVWeHVLaUJBY0dGeVlXMGdZblZtWm1WeUlHbHVJR0poYzJVMk5GeHVLaUJBY0dGeVlXMGdZbmwwWlVOdlpHbHVaeUJ1ZFcxaVpYSWdiMllnWW5sMFpYTWdabTl5SUdWaFkyZ2diblZ0WW1WeUlDZzBJRzl5SURncFhHNHFJRUJ5WlhSMWNtNGdZWEp5WVhrZ2IyWWdabXh2WVhRZ0tETXlJRzl5SURZMEtTNGdiblZzYkNCcFppQmpiM1ZzWkNCdWIzUWdZMjl1ZG1WeWRDNWNiaW92WEc1T2IwTnZaR2x1Wnk1d2NtOTBiM1I1Y0dVdVpuSnZiU0E5SUdaMWJtTjBhVzl1S0dSaGRHRXBJSHRjYmx4MGNtVjBkWEp1SUdSaGRHRXVaRHRjYm4wN1hHNWNiaThxS2x4dUtpQkRiMjUyWlhKMElHRnljbUY1SUdOdmJuUmhhVzVwYm1jZ2JuVnRZbVZ5Y3lCamIyUmxaQ0JpZVNCaWVYUmxRMjlrYVc1bklHSjVkR1Z6SUdsdWRHOGdZblZtWm1WeUlHTnZaR1ZrSUdsdUlHSmhjMlUyTkZ4dUtpQkFjR0Z5WVcwZ1hIUjdRWEp5WVhrOFJteHZZWFErZlNCY2RHRnljbUY1SUc5bUlHWnNiMkYwSUNnek1pQnZjaUEyTkNCaWFYUnpLVnh1S2lCQWNHRnlZVzBnWEhSN2FXNTBaV2RsY24wZ1hIUmllWFJsUTI5a2FXNW5JRzUxYldKbGNpQnZaaUJpZVhSbGN5Qm1iM0lnWldGamFDQm1iRzloZENBb05DQnZjaUE0S1Z4dUtpQkFjbVYwZFhKdUlDQmNkSHRUZEhKcGJtZDlJRngwWW5WbVptVnlJR2x1SUdKaGMyVTJOQzRnYm5Wc2JDQnBaaUJqYjNWc1pDQnViM1FnWTI5dWRtVnlkQzVjYmlvdlhHNU9iME52WkdsdVp5NXdjbTkwYjNSNWNHVXVkRzhnUFNCbWRXNWpkR2x2YmloaGNuSmhlU2tnZTF4dVhIUnlaWFIxY200Z2UxeHVYSFJjZEhRNklDZHVieWNzSUM4cUlIUjVjR1VnS2k5Y2JseDBYSFJrT2lCaGNuSmhlU3dnTHlvZ1pHRjBZU0FxTDF4dVhIUmNkSE02SUdGeWNtRjVMbXhsYm1kMGFGeHVYSFI5TzF4dWZUdGNibHh1WEc1Y2JseHVMeW9xWEc0Z0tpQk5ZVzVoWjJWdFpXNTBJRzltSUdKaGMyVTJOQ0JsYm1OdlpHbHVaMXh1SUNvZ1JXWm1aV04wYVhabElHWnZjaUJ6ZEhKcGJtY2dZbUZ6WldRZ1kyaGhibTVsYkhNZ0tHeHBhMlVnU2xOUFRpQmlZWE5sWkNCWFV5bGNiaUFxSUNvdlhHNW1kVzVqZEdsdmJpQkNZWE5sTmpSRGIyUnBibWNvS1h0Y2JseDBjbVYwZFhKdUlIUm9hWE03WEc1OU8xeHVYRzVjYmx4dUx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkwxeHVMeTh2THk4dkx5OHZMeTh2THk4dkx5OGdJQ0FnVlhScGJHbDBlU0JtZFc1amRHbHZibk1nSUNBZ0x5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMMXh1THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2TDF4dVhHNHZLbHhjWEc0Z2ZDcDhYRzRnZkNwOElDQjFkR2xzYVhSaGFYSmxjeUJrWlNCdFlXNXBjSFZzWVhScGIyNXpJR1JsSUdOb1ljT3VibVZ6SUdKaGMyVWdOalFnTHlCaWFXNWhhWEpsY3lBdklGVlVSaTA0WEc0Z2ZDcDhYRzRnZkNwOElDQm9kSFJ3Y3pvdkwyUmxkbVZzYjNCbGNpNXRiM3BwYkd4aExtOXlaeTltY2k5a2IyTnpMMFREcVdOdlpHVnlYMlZ1WTI5a1pYSmZaVzVmWW1GelpUWTBYRzRnZkNwOFhHNGdYRndxTDF4dUx5b3FJRVJsWTI5a1pYSWdkVzRnZEdGaWJHVmhkU0JrSjI5amRHVjBjeUJrWlhCMWFYTWdkVzVsSUdOb1ljT3VibVVnWlc0Z1ltRnpaVFkwSUNvdlhHNTJZWElnWWpZMFZHOVZhVzUwTmlBOUlHWjFibU4wYVc5dUtHNURhSElwSUh0Y2JseDBjbVYwZFhKdUlHNURhSElnUGlBMk5DQW1KaUJ1UTJoeUlEd2dPVEVnUDF4dVhIUmNkRzVEYUhJZ0xTQTJOVnh1WEhSY2REb2dia05vY2lBK0lEazJJQ1ltSUc1RGFISWdQQ0F4TWpNZ1AxeHVYSFJjZEc1RGFISWdMU0EzTVZ4dVhIUmNkRG9nYmtOb2NpQStJRFEzSUNZbUlHNURhSElnUENBMU9DQS9YRzVjZEZ4MGJrTm9jaUFySURSY2JseDBYSFE2SUc1RGFISWdQVDA5SURReklEOWNibHgwWEhRMk1seHVYSFJjZERvZ2JrTm9jaUE5UFQwZ05EY2dQMXh1WEhSY2REWXpYRzVjZEZ4ME9seDBNRHRjYm4wN1hHNWNiaThxS2x4dUlDb2dSR1ZqYjJSbElHSmhjMlUyTkNCemRISnBibWNnZEc4Z1ZVbHVkRGhCY25KaGVWeHVJQ29nUUhCaGNtRnRJQ0I3VTNSeWFXNW5mU0J6UW1GelpUWTBYSFJjZEdKaGMyVTJOQ0JqYjJSbFpDQnpkSEpwYm1kY2JpQXFJRUJ3WVhKaGJTQWdlMmx1ZEgwZ2JrSnNiMk5yYzFOcGVtVWdjMmw2WlNCdlppQmliRzlqYTNNZ2IyWWdZbmwwWlhNZ2RHOGdZbVVnY21WaFpDNGdUM1YwY0hWMElHSjVkR1ZCY25KaGVTQnNaVzVuZEdnZ2QybHNiQ0JpWlNCaElHMTFiSFJwY0d4bElHOW1JSFJvYVhNZ2RtRnNkV1V1WEc0Z0tpQkFjbVYwZFhKdUlIdFZhVzUwT0VGeWNtRjVmVngwWEhSY2RGeDBkR0ZpSUc5bUlHUmxZMjlrWldRZ1lubDBaWE5jYmlBcUwxeHVkbUZ5SUdKaGMyVTJORVJsWTFSdlFYSnlJRDBnWm5WdVkzUnBiMjRvYzBKaGMyVTJOQ3dnYmtKc2IyTnJjMU5wZW1VcElIdGNibHgwZG1GeVhHNWNkSE5DTmpSRmJtTWdQU0J6UW1GelpUWTBMbkpsY0d4aFkyVW9MMXRlUVMxYVlTMTZNQzA1WEZ3clhGd3ZYUzluTENCY0lsd2lLU3dnYmtsdVRHVnVJRDBnYzBJMk5FVnVZeTVzWlc1bmRHZ3NYRzVjZEc1UGRYUk1aVzRnUFNCdVFteHZZMnR6VTJsNlpTQS9JRTFoZEdndVkyVnBiQ2dvYmtsdVRHVnVJQ29nTXlBcklERWdQajRnTWlrZ0x5QnVRbXh2WTJ0elUybDZaU2tnS2lCdVFteHZZMnR6VTJsNlpTQTZJRzVKYmt4bGJpQXFJRE1nS3lBeElENCtJRElzWEc1Y2RHSjFabVpsY2lBOUlHNWxkeUJCY25KaGVVSjFabVpsY2lodVQzVjBUR1Z1S1N3Z2RHRkNlWFJsY3lBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0dKMVptWmxjaWs3WEc1Y2JseDBabTl5SUNoMllYSWdiazF2WkRNc0lHNU5iMlEwTENCdVZXbHVkREkwSUQwZ01Dd2diazkxZEVsa2VDQTlJREFzSUc1SmJrbGtlQ0E5SURBN0lHNUpia2xrZUNBOElHNUpia3hsYmpzZ2JrbHVTV1I0S3lzcElIdGNibHgwWEhSdVRXOWtOQ0E5SUc1SmJrbGtlQ0FtSURNN0lDOHFJRzRnYlc5a0lEUWdLaTljYmx4MFhIUnVWV2x1ZERJMElIdzlJR0kyTkZSdlZXbHVkRFlvYzBJMk5FVnVZeTVqYUdGeVEyOWtaVUYwS0c1SmJrbGtlQ2twSUR3OElERTRJQzBnTmlBcUlHNU5iMlEwTzF4dVhIUmNkR2xtSUNodVRXOWtOQ0E5UFQwZ015QjhmQ0J1U1c1TVpXNGdMU0J1U1c1SlpIZ2dQVDA5SURFcElIdGNibHgwWEhSY2RHWnZjaUFvYmsxdlpETWdQU0F3T3lCdVRXOWtNeUE4SURNZ0ppWWdiazkxZEVsa2VDQThJRzVQZFhSTVpXNDdJRzVOYjJRekt5c3NJRzVQZFhSSlpIZ3JLeWtnZTF4dVhIUmNkRngwWEhSMFlVSjVkR1Z6VzI1UGRYUkpaSGhkSUQwZ2JsVnBiblF5TkNBK1BqNGdLREUySUQ0K1BpQnVUVzlrTXlBbUlESTBLU0FtSURJMU5UdGNibHgwWEhSY2RIMWNibHgwWEhSY2RHNVZhVzUwTWpRZ1BTQXdPMXh1WEhSY2RIMWNibHgwZlZ4dVhIUXZMeUJqYjI1emIyeGxMbXh2WnloY0luVTRhVzUwSURvZ1hDSXJTbE5QVGk1emRISnBibWRwWm5rb2RHRkNlWFJsY3lrcE8xeHVYSFJ5WlhSMWNtNGdZblZtWm1WeU8xeHVmVHRjYmx4dUx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkwxeHVMeTh2THk4dkx5OHZMeTh2THk4dkx5OGdJQ0JKYm5SbGNtWmhZMlVnWm5WdVkzUnBiMjV6SUNBZ0x5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMMXh1THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2TDF4dVhHNWNiaThxS2x4dUtpQkRiMjUyWlhKMElHSjFabVpsY2lCamIyUmxaQ0JwYmlCaVlYTmxOalFnWVc1a0lHTnZiblJoYVc1cGJtY2diblZ0WW1WeWN5QmpiMlJsWkNCaWVWeHVLaUJpZVhSbFEyOWthVzVuSUdKNWRHVnpJR2x1ZEc4Z1lYSnlZWGxjYmlvZ1FIQmhjbUZ0SUdKMVptWmxjaUJwYmlCaVlYTmxOalJjYmlvZ1FIQmhjbUZ0SUdKNWRHVkRiMlJwYm1jZ2JuVnRZbVZ5SUc5bUlHSjVkR1Z6SUdadmNpQmxZV05vSUc1MWJXSmxjaUFvTkNCdmNpQTRLVnh1S2lCQWNtVjBkWEp1SUdGeWNtRjVJRzltSUdac2IyRjBJQ2d6TWlCdmNpQTJOQ2t1SUc1MWJHd2dhV1lnWTI5MWJHUWdibTkwSUdOdmJuWmxjblF1WEc0cUwxeHVRbUZ6WlRZMFEyOWthVzVuTG5CeWIzUnZkSGx3WlM1bWNtOXRJRDBnWm5WdVkzUnBiMjRvWkdGMFlTa2dlMXh1WEhSMllYSWdZbmwwWlVOdlpHbHVaeUE5SUdSaGRHRXVZanRjYmx4MFhHNWNkQzhxSUdOb1pXTnJJR0o1ZEdVZ1kyOWthVzVuSUNvdlhHNWNkR2xtS0dKNWRHVkRiMlJwYm1jZ0lUMDlJRFFnSmlZZ1lubDBaVU52WkdsdVp5QWhQVDBnT0NrZ2UxeHVYSFJjZEhKbGRIVnliaUJ1ZFd4c08xeHVYSFI5WEc1Y2JseDBMeW9nWkdWamIyUmxJR1JoZEdFZ2RHOGdZWEp5WVhrZ2IyWWdZbmwwWlNBcUwxeHVYSFIyWVhJZ1luVm1JRDBnWW1GelpUWTBSR1ZqVkc5QmNuSW9aR0YwWVM1a0xDQmtZWFJoTG1JcE8xeHVYSFF2S2lCd1lYSnpaU0JrWVhSaElIUnZJR1pzYjJGMElHRnljbUY1SUNvdlhHNWNkSFpoY2lCbVFYSnlZWGs5Ym5Wc2JEdGNibHgwYzNkcGRHTm9LR1JoZEdFdVlpa2dlMXh1WEhSallYTmxJRFE2WEc1Y2RGeDBaa0Z5Y21GNUlEMGdibVYzSUVac2IyRjBNekpCY25KaGVTaGlkV1lwTzF4dVhIUmNkR0p5WldGck8xeHVYSFJqWVhObElEZzZYRzVjZEZ4MFprRnljbUY1SUQwZ2JtVjNJRVpzYjJGME5qUkJjbkpoZVNoaWRXWXBPMXh1WEhSY2RHSnlaV0ZyTzF4dVhIUmtaV1poZFd4ME9seHVYSFJjZEdOdmJuTnZiR1V1Ykc5bktGd2lWVzVsZUhCbFkzUmxaQ0JpZVhSbFEyOWthVzVuSVNCVGFHOTFiR1FnYm05MElHaGhjSEJsYmlFaFhDSXBPMXh1WEhSY2RISmxkSFZ5YmlCdWRXeHNPMXh1WEhSOVhHNWNkQzhxSUhCaGNuTmxJR1pCY25KaGVTQnBiblJ2SUc1dmNtMWhiQ0JoY25KaGVTQXFMMXh1WEhSMllYSWdkR0ZpSUQwZ1cxMHVjMnhwWTJVdVkyRnNiQ2htUVhKeVlYa3BPMXh1WEc1Y2RHbG1LR1JoZEdFdWN5QWhQVDBnZEdGaUxteGxibWQwYUNrZ2UxeHVYSFJjZEdOdmJuTnZiR1V1Ykc5bktGd2lVMmw2WlNCdGFYTnRZWFJqYUNCM2FHVnVJR1JsWTI5a2FXNW5JQ0ZjSWlrN1hHNWNkRngwY21WMGRYSnVJRzUxYkd3N1hHNWNkSDFjYmx4MGNtVjBkWEp1SUhSaFlqdGNibjA3WEc1Y2JpOHFLbHh1S2lCRGIyNTJaWEowSUdGeWNtRjVJR052Ym5SaGFXNXBibWNnYm5WdFltVnljeUJqYjJSbFpDQmllU0JpZVhSbFEyOWthVzVuSUdKNWRHVnpJR2x1ZEc4Z1luVm1abVZ5SUdOdlpHVmtJR2x1SUdKaGMyVTJORnh1S2lCQWNHRnlZVzBnWEhSN1FYSnlZWGs4Um14dllYUStmU0JjZEdGeWNtRjVJRzltSUdac2IyRjBJQ2d6TWlCdmNpQTJOQ0JpYVhSektWeHVLaUJBY0dGeVlXMGdYSFI3YVc1MFpXZGxjbjBnWEhSaWVYUmxRMjlrYVc1bklHNTFiV0psY2lCdlppQmllWFJsY3lCbWIzSWdaV0ZqYUNCbWJHOWhkQ0FvTkNCdmNpQTRLVnh1S2lCQWNtVjBkWEp1SUNCY2RIdFRkSEpwYm1kOUlGeDBZblZtWm1WeUlHbHVJR0poYzJVMk5DNGdiblZzYkNCcFppQmpiM1ZzWkNCdWIzUWdZMjl1ZG1WeWRDNWNiaW92WEc1Q1lYTmxOalJEYjJScGJtY3VjSEp2ZEc5MGVYQmxMblJ2SUQwZ1puVnVZM1JwYjI0b1lYSnlZWGtzSUdKNWRHVkRiMlJwYm1jcElIdGNibHgwTHlvZ1kyaGxZMnNnWW5sMFpTQmpiMlJwYm1jZ0tpOWNibHgwYVdZb1lubDBaVU52WkdsdVp5QWhQVDBnTkNBbUppQmllWFJsUTI5a2FXNW5JQ0U5UFNBNEtTQjdYRzVjZEZ4MGNtVjBkWEp1SUc1MWJHdzdYRzVjZEgxY2JseHVYSFF2S2lCM2NtbDBaU0JoYkd3Z2MyRnRjR3hsY3lCcGJpQkNkV1ptWlhJZ0tpOWNibHgwZG1GeUlHSjFaaUE5SUc1bGR5QkNkV1ptWlhJb1lYSnlZWGt1YkdWdVozUm9LbUo1ZEdWRGIyUnBibWNwTEdrN1hHNWNkSE4zYVhSamFDaGllWFJsUTI5a2FXNW5LU0I3WEc1Y2RHTmhjMlVnTkRwY2JseDBYSFJtYjNJb2FTQTlJREE3SUdrZ1BDQmhjbkpoZVM1c1pXNW5kR2c3SUdrckt5a2dlMXh1WEhSY2RGeDBhV1lvZEhsd1pXOW1JR0Z5Y21GNVcybGRJQ0U5UFNBbmJuVnRZbVZ5SnlsY2JseDBYSFJjZEZ4MGNtVjBkWEp1SUc1MWJHdzdYRzVjZEZ4MFhIUmlkV1l1ZDNKcGRHVkdiRzloZEV4RktHRnljbUY1VzJsZExDQnBJQ29nWW5sMFpVTnZaR2x1WnlrN1hHNWNkRngwZlZ4dVhIUmNkR0p5WldGck8xeHVYSFJqWVhObElEZzZYRzVjZEZ4MFptOXlLR2tnUFNBd095QnBJRHdnWVhKeVlYa3ViR1Z1WjNSb095QnBLeXNwSUh0Y2JseDBYSFJjZEdsbUtIUjVjR1Z2WmlCaGNuSmhlVnRwWFNBaFBUMGdKMjUxYldKbGNpY3BYRzVjZEZ4MFhIUmNkSEpsZEhWeWJpQnVkV3hzTzF4dVhIUmNkRngwWW5WbUxuZHlhWFJsUkc5MVlteGxURVVvWVhKeVlYbGJhVjBzSUdrZ0tpQmllWFJsUTI5a2FXNW5LVHRjYmx4MFhIUjlYRzVjZEZ4MFluSmxZV3M3WEc1Y2RIMWNibHh1WEhRdktpQmpiMjUyWlhKMElFSjFabVpsY2lCMGJ5QmlZWE5sTmpRZ2MzUnlhVzVuSUNvdlhHNWNkSFpoY2lCaU5qUkNkV1ptSUQwZ1luVm1MblJ2VTNSeWFXNW5LQ2RpWVhObE5qUW5LVHNnWEc1Y2RISmxkSFZ5YmlCN1hHNWNkRngwZERvZ0oySTJOQ2NzSUM4cUlIUjVjR1VnS2k5Y2JseDBYSFJpT2lCaWVYUmxRMjlrYVc1bkxDQXZLaUJpZVhSbFEyOWthVzVuSUNvdlhHNWNkRngwWkRvZ1lqWTBRblZtWml3Z0x5b2daR0YwWVNBcUwxeHVYSFJjZEhNNklHRnljbUY1TG14bGJtZDBhQ0F2S2lCemFYcGxJQ292WEc1Y2RIMDdYRzU5TzF4dVhHNWNibHh1WEc0dktpcGNiaUFxSUUxaGJtRm5aVzFsYm5RZ2IyWWdZMjl0YlNCbGJtTnZaR2x1WjF4dUlDb2dLaTljYm1aMWJtTjBhVzl1SUVOdlpHbHVaMGhoYm1Sc1pYSW9LWHRjYmx4MGRHaHBjeTVpTmpRZ1BTQnVaWGNnUW1GelpUWTBRMjlrYVc1bktDazdYRzVjZEhSb2FYTXVibTl1WlNBOUlHNWxkeUJPYjBOdlpHbHVaeWdwTzF4dVhIUmNibHgwY21WMGRYSnVJSFJvYVhNN1hHNTlPMXh1WEc1Y2JrTnZaR2x1WjBoaGJtUnNaWEl1Y0hKdmRHOTBlWEJsTG1aeWIyMGdQU0JtZFc1amRHbHZiaWhrWVhSaEtTQjdYRzVjZEdsbUtDRmtZWFJoSUh4OElHUmhkR0U5UFQxdWRXeHNLVnh1WEhSY2RISmxkSFZ5YmlCdWRXeHNPMXh1WEhSemQybDBZMmdvWkdGMFlTNTBLU0I3WEc1Y2RHTmhjMlVnSjJJMk5DYzZYRzVjZEZ4MGNtVjBkWEp1SUhSb2FYTXVZalkwTG1aeWIyMG9aR0YwWVNrN1hHNWNkR1JsWm1GMWJIUTZYRzVjZEZ4MGNtVjBkWEp1SUhSb2FYTXVibTl1WlM1bWNtOXRLR1JoZEdFcE8xeDBYSFJjYmx4MGZWeHVmVHRjYmx4dVhHNURiMlJwYm1kSVlXNWtiR1Z5TG5CeWIzUnZkSGx3WlM1MGJ5QTlJR1oxYm1OMGFXOXVLR0Z5Y21GNUxDQjBlWEJsTENCaWVYUmxRMjlrYVc1bktTQjdYRzVjZEdsbUtIUjVjR1Z2WmlCaGNuSmhlU0E5UFQwZ0oyNTFiV0psY2ljcElIdGNibHgwWEhSaGNuSmhlVDFiWVhKeVlYbGRPMXh1WEhSOVhHNWNkR2xtS0NGQmNuSmhlUzVwYzBGeWNtRjVLR0Z5Y21GNUtTbDdYRzVjZEZ4MFkyOXVjMjlzWlM1c2IyY29YQ0pEYjJScGJtZElZVzVrYkdWeUxuUnZJRzl1YkhrZ1lXTmpaWEIwY3lCaGNuSmhlU0FoWENJcE8xeHVYSFJjZEhKbGRIVnliaUJ1ZFd4c08xeHVYSFI5WEc1Y2RGeHVYSFJ6ZDJsMFkyZ29kSGx3WlNrZ2UxeHVYSFJqWVhObElDZGlOalFuT2x4dVhIUmNkSEpsZEhWeWJpQjBhR2x6TG1JMk5DNTBieWhoY25KaGVTd2dZbmwwWlVOdlpHbHVaeWs3WEc1Y2RHTmhjMlVnSjI1dkp6cGNibHgwWkdWbVlYVnNkRHBjYmx4MFhIUnlaWFIxY200Z2RHaHBjeTV1YjI1bExuUnZLR0Z5Y21GNUtUdGNkRngwWEc1Y2RIMWNibjA3WEc1Y2JseHVMeW9xSUVGa1pDQmlZWE5sTmpRZ2FHRnVaR3hsY2lCMGJ5QkVhWGxoVTJWc1pXTjBiM0lnS2lvdlhHNUVhWGxoVTJWc1pXTjBiM0l1Y0hKdmRHOTBlWEJsTG1WdVkyOWtaU0E5SUdaMWJtTjBhVzl1S0NsN1hHNWNkSEpsZEhWeWJpQnVaWGNnUTI5a2FXNW5TR0Z1Wkd4bGNpZ3BPMXh1ZlR0Y2JseHVJbDE5Il19
