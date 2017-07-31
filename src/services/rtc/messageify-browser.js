require('buffer')


module.exports = function (socket) {
	if (socket._messageified) return socket
	socket._messageified = true

	//structures for building messages from unix socket bytestream
	let msgBufSize = 81920;
	let msgBuf = new Buffer(msgBufSize);
	let tmpBuf = new Buffer(msgBufSize);
	let bufPos = 0;

	//listen to socket events
	socket.on('data', data => {
		let len = data.length
		let msgComplete = false

		//Size up msgBuf if it is too small 
		if(bufPos + data.length > msgBufSize){
			msgBufSize = msgBufSize + 2*data.length
			tmpBuf = new Buffer(msgBufSize)
			msgBuf.copy(tmpBuf)
			msgBuf = tmpBuf
			tmpBuf = new Buffer(msgBufSize)
		}

		//copy new chunk into msgBuf
		data.copy(msgBuf, bufPos, 0, data.length)

		bufPos += len

		do{
			msgComplete = false
			//read message length
			let msgLength = msgBuf.readInt32LE(0)

			//if buffer contains more than msgLength, a message is ready to be sent to user
			if(bufPos > msgLength){
				//extract message from buffer
				let newMessage = msgBuf.toString('utf8',4,4+msgLength)

				//send message to user
				socket.emit('message', newMessage)

				//delete message from buffer
				msgBuf.copy(tmpBuf, 0, 4+msgLength, msgBufSize-4-msgLength)
				tmpBuf.copy(msgBuf)
				bufPos -= (4 + msgLength)

				msgComplete = true
			}
		} while (msgComplete && bufPos > 0) //read messages while there are complete messages and the buffer is not empty
	})

	socket.sendMessage = function (message) {
		//message size + 4 bytes for storing message length
		let buffer = new Buffer (message.length+4)

		buffer.writeInt32LE(message.length, 0)
		buffer.write(message, 4)
		
		socket.write(buffer)
	}

	return socket
}


