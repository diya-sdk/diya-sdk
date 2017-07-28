const EventEmitter = require('node-event-emitter')

class RTCChannel extends EventEmitter {
	constructor (name, cb, stream_cb) {
		super ()
		this.name = name
		this.cb = cb
		this.stream_cb = stream_cb

		console.log ('created channel '+this.name+' !')
	}

	close () {
		console.log ('closed channel '+this.name+' !')
	}
}


module.exports = RTCChannel
