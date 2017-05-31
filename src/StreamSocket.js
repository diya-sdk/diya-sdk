const Transform = require('stream').Transform;
var d1 = require('diya-sdk');

class StreamSocket extends Transform {
	constructor(d1inst, params, options) {
		super(options);
		this.d1inst = d1inst;
		this.socketName = params.socketName;
		this.socketId = params.socketId;
		this.peerId = params.target;
		this.flagSocketIsDead = false;
		this.subscriptionSocketClosed = null;
	}

	_read() {
	}

	_write(chunk, encoding, callback) {
		if (this.flagSocketIsDead === false) {
			var params = {
				data: {
					socketName: this.socketName,
					socketId: this.socketId,
					socketBuffer: chunk.toString('base64'),
				}, target: this.peerId
			};
			this.d1inst.sendSocket(params);
		}
		callback();
	}

	getSocketId() {
		return this.socketId;
	}

	disconnect() {
		if (this.flagSocketIsDead === false) {
			this.end();
			this.d1inst.request({
				service: 'socketHandler',
				func: 'DisconnectClient',
				data: {
					socket_id: this.socketId
				}
			})
			this.flagSocketIsDead = true
		}
	}

	subscribeSocketClosed(openedSocketId) {
		var that = this;
		this.subscriptionSocketClosed = this.d1inst.subscribe({
			service: 'socketHandler',
			func: 'IsSocketClosed',
		}, function (peerId, err, data) {
			if (data[0] === openedSocketId) that.d1inst.onSocketClosed(data[0]);
			that.subscriptionSocketClosed.close();
		})
	}
}

module.exports = StreamSocket;