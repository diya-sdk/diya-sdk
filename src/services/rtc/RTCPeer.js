const EventEmitter = require('node-event-emitter')
const messageify = require('messageify')

class RTCPeer extends EventEmitter {
	constructor (id, channels, dbusObject) {
		super ()
		this.id = id
		this.channels = channels
		this._dbusObject = dbusObject

		this._connect ()
	}

	close () {
		console.log("Peer "+this.id+" closed !")
		this.channels.forEach (c => c.close())
		this.channels = []
	}

	_connect () {
		console.log("trying to connect to peer "+this.id+"...")
	
		this._connectSignaling ()
	}

	_connectSignaling () {
		this._dbusObject.call('fr.partnering.RTC.Connect', {
			localPeerId: this.id,
			channels: this.channels.map (c => c.name)
		}, (_, err, sessionToken) => {
			this._dbusObject._d1inst(this._dbusObject._peerId).openSocket('/var/run/diya/rtc.sock', (_, err, socket) => {
				socket.write(`${sessionToken}\n`)	

				this._onSignalingConnected(socket)
			})
		})
	}

	_onSignalingConnected (socket) {
		this._signaling = messageify(socket)
	}
}


module.exports = RTCPeer
