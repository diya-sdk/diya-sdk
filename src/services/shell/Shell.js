const DiyaSelector = require('../../DiyaSelector.js').DiyaSelector


DiyaSelector.prototype.shell = function (command, args, cols, rows, term, callback) {
	this.request({
		service: 'shell',
		func: 'RegisterProcess',
		data: {
			command,
			args,
			cols,
			rows,
			term
		}
	}, (peerId, err, termId) => {
		if (err) return callback(peerId, err, null)
		
		this._connection._d1inst(peerId).openSocket('/var/run/diya/shell.sock', (peerId, err, socket) => {
			if (err) return callback (peerId, err, null)

			//send authentication token
			socket.write(`${termId}\n`)
			
			//notify client that the socket is ready
			callback (peerId, null, new Shell (this._connection._d1inst, peerId, termId, socket))
		})
	})
}


class Shell {
	constructor (d1inst, peerId, termId, socket) {
		this._d1inst = d1inst
		this._peerId = peerId
		this._termId = termId
		this.socket = socket
	}
	
	resize (cols, rows) {
		this._d1inst(this._peerId).request({
			service: 'shell',
			func: 'ResizeShell',
			data: {
				process_id: this._termId,
				cols: cols,
				rows: rows
			}
		}, (peerId, err, data) => {
			console.log(`resized term ${this._termId}`)
		})
	}

	close () {
		this.socket.disconnect ()
	}
}
