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
	}
	, (peerId, err, termId) => {
		if (err) return callback(peerId, err, null)
		
		this._connection._d1inst(peerId).openSocket('/var/run/diya/shell.sock', (peerId, err, socket) => {
			if (err) return callback (peerId, err, null)

			socket.write(`${termId}\n`)


			callback (peerId, null, {
				socket: socket,
				
				resize: (cols, rows) => {
					this._connection._d1inst(peerId).request({
						service: 'shell',
						func: 'ResizeShell',
						data: {
							process_id: termId,
							cols: cols,
							rows: rows
						}
					}, (peerId, err, data) => {
						console.log(`resized term ${termId}`)
					})
				},

				close: () => {
					socket.disconnect()
				}
			})
		})
	})
}
