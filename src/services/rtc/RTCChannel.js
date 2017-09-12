'use strict';

const EventEmitter = require('node-event-emitter')

class RTCChannel extends EventEmitter {
	constructor (name, dataChannelCallback, streamCallback) {
		super ()

		this.name = name
		this.type = 'N/A'
		this.frequency = 20
		this._lastSendTimestamp = 0
		
		this._dataChannelCallback = dataChannelCallback
		this._streamCallback = streamCallback

		this._dataChannel = null
		this._buffer = null
		this._stream = null

		console.log ('created channel '+this.name+' !')
	}

	close () {
		if (this._dataChannel == null) {
			console.warn (`trying to close non-open channel ${this.name}`)
			return
		}

		this._dataChannel.close()
	}

	setDataChannel (dataChannel) {
		console.log(`data channel ${this.name} connected !`)

		this._dataChannel = dataChannel

		this._dataChannel.binaryType = 'arraybuffer';

		dataChannel.onmessage = message => {
			// First message carries channel description header
			let view = new DataView(message.data);

			// extract channel type (input or output)
			let typeChar = String.fromCharCode(view.getUint8(0));
			if(typeChar === 'O') this.type = 'input'; //Promethe Output = Client Input
			else if(typeChar === 'I') this.type = 'output'; //Promethe Input = Client Output
			else throw "Unrecnognized channel type : " + typeChar;

			//extract channel size
			let size = view.getInt32(1,true);
			if(isNaN(size)) throw "Wrong datachannel message size";
			this.size = size;
			this._buffer = new Float32Array(size);

			// Subsequent messages are forwarded to appropriate handlers
			dataChannel.onmessage = message => this._onMessage (message)
			dataChannel.onclose = () => this._onClose ()

			if(typeof this._dataChannelCallback === 'function') {
				this._dataChannelCallback ("N/A", this)
			}

			console.log (`data channel ${this.name} ready !`)
		}
	}

	/** Bind an incoming RTC stream to this channel */
	setStream (stream) {
		this._stream = stream
		if(typeof this._streamCallback === 'function') {
			this._streamCallback ("N/A", stream)
		} else {
			console.warn("Ignore stream " + stream.id)
		}
	
		console.log(`stream ${this.name} ready !`);
	}

	/** Write a scalar value to the given index on the RTC datachannel */
	write (index, value) {
		if(index < 0 || index > this.size || isNaN(value)) {
			return false
		}

		this._buffer[index] = value
		this._requestSend()
		return true
	}

	/** Write an array of values to the RTC datachannel */
	writeAll (values) {
		if(!Array.isArray(values) || values.length !== this.size) {
			return false
		}

		for (let i = 0; i < values.length; i++) {
			if(isNaN(values[i])) return false
			this._buffer[i] = values[i]
		}
		
		this._requestSend()
	}

	/** Ask to send the internal data buffer through the datachannel at the defined frequency */
	_requestSend () {
		let doSend = () => {
			this._sendRequested = false
			this._lastSendTimestamp = new Date().getTime()
			let ret = this._send(this._buffer)
			//If autosend is set, automatically send buffer at the given frequency
			if(ret && this.autosend) {
				this._requestSend()
			}
		}

		let elapsedTime = new Date().getTime() - this._lastSendTimestamp
		let period = 1000 / this.frequency

		if(elapsedTime >= period) {
			doSend()
		} else if(!this._sendRequested) {
			this._sendRequested = true
			setTimeout(doSend, period - elapsedTime)
		}

	}

	/** Actual send the internal data buffer through the RTC datachannel */
	_send (msg) {
		if (this.closed || this._dataChannel == null) {
			return false
		} else if (this._dataChannel.readyState === 'open') {
			try {
				this._dataChannel.send(msg)
			} catch(e) {
				console.error('[rtc.channel.write] exception occured while sending data');
			}
			return true
		} else {
			console.warn('[rtc.channel.write] warning : webrtc datachannel state = '+this._dataChannel.readyState);
			return false
		}
	}

	/** Called when a message is received from the channel's RTC datachannel */
	_onMessage (message) {
		let valArray = new Float32Array(message.data)
		this.emit('value', valArray)
	}
	
	/** Called when the channel is closed on the remote side */
	_onClose () {
		console.log(`data channel ${this.name} closed !`)
		this.emit('close')
	}
}

module.exports = RTCChannel
