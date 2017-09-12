'use strict';

const DiyaSelector = require('../../DiyaSelector').DiyaSelector
const EventEmitter = require('node-event-emitter')

require('webrtc-adapter')

const RTCController = require('./RTCController.js')





class RTC {
	constructor (selector) {
		this._selector = selector	
		this._rtcControllers = []

		this._requestedChannels = []
	}

	use (name_regex, type, ondatachannel_callback, onaddstream_callback){
		this._requestedChannels.push({regex: name_regex, type:type, cb: ondatachannel_callback, stream_cb: onaddstream_callback});
		return this;
	}

	connect () {
		this._rtcControllers = this._selector.dbusObject('fr.partnering.RTC', '/fr/partnering/RTC').map(object => {
			return new RTCController(object, this._requestedChannels)
		})

		this._rtcControllers.forEach (c => c.connect())
	}

	disconnect () {
		this._rtcControllers.forEach (c => c.disconnect())
	}
}


DiyaSelector.prototype.rtc = function () {
	return new RTC(this)
}
