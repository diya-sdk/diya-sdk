const Transform = require('stream').Transform;

class DiyaSocket extends Transform {
	constructor(d1inst, params, options) {
		super(options);
		this.d1inst = d1inst;
		this.socketName = params.socketName;
		this.socketId = params.socketId;
		this.peerId = params.target;
		this.flagSocketIsDead = false;
		this.subscriptionSocketClosed = null;
	}

	_write(chunk, encoding, callback) {
		if (this.flagSocketIsDead === false) {
			let params = {
				data: {
					socketId: this.socketId,
					socketBuffer: chunk.toString('base64'),
				}, target: this.peerId
			};
			this.d1inst.sendSocketData(params);
		}
		callback();
	}

	end() {
		super.end();
		if (this.flagSocketIsDead === false) {
			this.end();
			this.d1inst.request({
				service: 'socketHandler',
				func: 'DisconnectClient',
				data: {
					socket_id: this.socketId
				}
			}, (peerId, err, data) => {
				this.flagSocketIsDead = true
			})
		}
	}

	subscribeSocketClosed(openedSocketId) {
		this.subscriptionSocketClosed = this.d1inst.subscribe({
			service: 'SocketHandler',
			func: 'SocketIsClosed'
		}, (peerId, err, data) => {
			if (err == null && data != null) {
				if (data[0] === openedSocketId) this.d1inst.onSocketClosed(data[0]);
			} else {
				this.disconnect()
			}
			this.subscriptionSocketClosed.close();
			this.subscriptionSocketClosed = null;
			this.d1inst = null;
			this.socketName = null;
			this.socketId = null;
			this.peerId = null;
			this.flagSocketIsDead = null;
		})
	}
}

module.exports = DiyaSocket;
