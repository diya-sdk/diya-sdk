"use strict"

const debug = require ('debug')('diya-sdk:DiyaNode')
const debugInput = require ('debug')('diya-sdk:DiyaNode:msg:in')
const debugOutput = require ('debug')('diya-sdk:DiyaNode:msg:out')

const EventEmitter = require ('node-event-emitter')

class DiyaNode extends EventEmitter {
	constructor (addr) {
		super ()

		this._addr = addr
		this._socket = new WebSocket (addr)
		this._socket.addEventListener('open', evt => this._onOpen (evt))
		this._socket.addEventListener('close', evt => this._onClose (evt))
		this._socket.addEventListener('error', evt => this._onError (evt))
		this._socket.addEventListener('message', evt => this._onMessage (evt))

		this._msgCallbacks = new Map ()
		this._msgCount = 1
	}


	////////////////////////////////////////////////////
	///////////////// DiyaNode API /////////////////////
	////////////////////////////////////////////////////

	request (params, target, callback) {
		params.type = 'Request'

		const id = this._sendToPeer (params, target, data => {
			this._clearMessage (id)

			if (typeof callback === 'function') {
				callback (data)
			}
		})
	}

	subscribe (params, target, callback) {
		params.type = 'Subscription'

		const id = this._sendToPeer (params, target, data => {
			if (typeof callback === 'function') {
				callback (data)
			}
		})

		return { target, id }
	}

	unsubscribe (handle) {
		this._send ({
			target: handle.target,
			subId: handle.id,
			type: 'Unsubscribe'
		})

		this._clearMessage (handle.id)
	}

	////////////////////////////////////////////////////
	/////////////// Socket events //////////////////////
	////////////////////////////////////////////////////

	_onOpen () {
		debug ('socket opened !')
	}

	_onClose () {
		debug ('socket closed !')

		this.emit ('close')
	}

	_onError (err) {
		debug (err)
	}

	_onMessage (evt) {
		debugInput (evt.data)
		let message
		try { message = JSON.parse (evt.data) } catch (e) { return }

		switch (message.type) {
			case "Handshake":
				this._handleHandshake (message)
				break
			case "Ping":
				this._handlePing (message)
				break
			case "Answer":
				this._handleAnswer (message)
				break
		}
	}

	/////////////////////////////////////////////////////////
	////////////// Handling received message ////////////////
	/////////////////////////////////////////////////////////

	_handleHandshake (message) {
		if (!Array.isArray (message.peers) 
			|| !message.peers.every (p => typeof p === 'string')
			|| typeof message.self !== 'string') {
			this._protocolError (message)
			return
		}

		this.peers = message.peers
		this.self = message.self

		this.emit ('open')
	}

	_handlePing (message) {
		this._send ({
			type: 'Pong'
		})
	}

	_handleAnswer (message) {
		if (isNaN (message.id)){
			this._protocolError (message)	
			return
		}

		const callback = this._msgCallbacks.get (message.id)

		if (typeof callback !== 'function') {
			debug ('No callback received for registered message, dropping...')
			return
		}

		callback (message.data)
	}

	_protocolError (message) {
		debug (`protocol error in received message :`)
		debug (message)
		debug ("terminating connection...")

		this._socket.close ()
	}

	////////////////////////////////////////////////////////////
	/////////////////////// sending messages ///////////////////
	////////////////////////////////////////////////////////////

	_sendToPeer (message, target, callback) {
		if (typeof callback !== 'function') {
			debug ('callback must be a function. dropping message...')
			return
		}

		if (!this.peers.includes (target)) {
			debug (`trying to send data to unknown peer ${target}. dropping message...`)
			return 
		}

		let id = this._msgCount ++
		this._msgCallbacks.set (id, callback)
		message.target = target
		message.id = id

		this._send (message)
	}

	_clearMessage (id) {
		this._msgCallbacks.delete (id)
	}

	_send (message) {
		let data
		try { data = JSON.stringify (message) } catch (err) { return }
		
		debugOutput (data)
		this._socket.send (data)
	}
}

module.exports = DiyaNode
