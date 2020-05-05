'use strict';

let isBrowser = !(typeof window === 'undefined')

if (!isBrowser) {

	const Q            = require('q')
	const net          = require ('net')
	const JSONSocket   = require ('json-socket')
	const EventEmitter = require ('node-event-emitter')

	class UNIXSocketHandler extends EventEmitter {
		constructor (addr, connectTimeout) {
			super()
			this.addr = addr

			this._socket = new JSONSocket(new net.Socket())
			this._socket.connect(this.addr)

			// Store callback so that we can unregister them later
			this._socketOpenCallback = this._onopen.bind(this)
			this._socketCloseCallback = this._onclose.bind(this)
			this._socketMessageCallback = this._onmessage.bind(this)
			this._socketErrorCallback = this._onerror.bind(this)

			this._socket.on('connect', this._socketOpenCallback)
			this._socket._socket.on('close',this._socketCloseCallback)
			this._socket.on('message', this._socketMessageCallback)
			this._socket._socket.on('error', this._socketErrorCallback)

			// Create timeout to abord connectiong
			setTimeout(_ => {
				// Whe ntime times out, if the socket is opened, simply return
				if (this._status === 'opened')
					return
				// Otherwise, abord
				if (this._status !== 'closed'){
					Logger.log('d1: ' + that.addr + ' timed out while connecting')
					this.close()
					this.emit('timeout', this._socket)
				}
			}, connectTimeout)
		}

		close () {
			if (this._disconnectionDeferred && this._disconnectionDeferred.promise)
				return this._disconnectionDeferred.promise

			this._disconnectionDeferred = Q.defer()
			this._status = 'closing'

			this.emit('closing', this._socket)

			if (this._socket)
				this._socket.end()

			return this._disconnectionDeferred.promise
		}

		/**
		 * Send a JSON-formatted message through the socket
		 * @param {JSON} msg The JSON to send (do not stringify it, json-socket will do it)
		 */
		send (msg) {
			try {
				this._socket.sendMessage(msg)
			} catch(err){
				console.error('Cannot send message: ' + err.message)
				return false
			}

			return true
		}

		isConnected () {
			return !this._socket.isClosed() && this._status === 'opened'
		}

		_onopen () {
			this._status = 'opened'
			this.emit('open', this._socket)
		}

		_onclose () {
			this._status = 'closed'
			this.unregisterCallbacks()
			this.emit('close', this._socket)
			if (this._disconnectionDeferred && this._disconnectionDeferred.promise)
				this._disconnectionDeferred.resolve()
		}

		_onmessage (msg) {
			// The message is already a JSON
			this.emit('message', msg)
		}

		_onerror (err) {
			this.emit('error', err)
		}

		unregisterCallbacks () {
			if (this._socket && (typeof this._socket.removeEventListener === 'function')) {
				this._socket.removeEventListener('open', this._socketOpenCallback)
				this._socket.removeEventListener('close', this._socketCloseCallback)
				this._socket.removeEventListener('message', this._socketMessageCallback)
			} else if (this._socket && (typeof this._socket.removeAllListeners === 'function')) {
				this._socket.removeAllListeners()
			}
		}
	}

	module.exports = UNIXSocketHandler
}
