const RTCPeer = require('./RTCPeer.js')
const RTCChannel = require('./RTCChannel.js')


class RTCController {
	constructor (dbusObject, requestedChannels) {
		this._dbusObject = dbusObject
		this._requestedChannels = requestedChannels
		this._usedChannels = []

		this._peers = new Map()

		this._dbusObject.on('properties-changed', (...args) => this._propertiesChanged (...args))
	}

	connect () {
		this._dbusObject.initPropertiesChangedSignal()
		this._dbusObject.getAll('fr.partnering.RTC', true)
	}

	disconnect () {
		for (let [id, peer] of this._peers) {
			peer.close()
		}
		this._usedChannels = []
		this._dbusObject.close ()
	}

	_propertiesChanged (iface, changedProperties, invalidatedProperties) {
		if (changedProperties == null || changedProperties.LocalPeers == null) {
			return ;
		}

		//find and notify new peers
		changedProperties.LocalPeers.forEach(peerData => {
			if (!this._peers.has(peerData[0])) {
				this._onPeerConnected (peerData)
			}
		})

		//find and notify deleted peers
		for (let [peerId, peer] of this._peers) {
			if (!changedProperties.LocalPeers.find (p => p[0] === peerId)) {
				this._onPeerDisconnected (peer)
			}
		}
	}

	_onPeerConnected (peerData) {
		let channels = this._matchChannels (peerData[1])

		if (channels.length > 0) {
			this._peers.set(peerData[0], new RTCPeer(peerData[0], channels, this._dbusObject))
		} else {
			console.log ("not using peer "+peerData[0])
		}
	}

	_onPeerDisconnected (peer) {
		this._peers.delete(peer.id)
		peer.channels.forEach (channel => {
			delete this._usedChannels[channel.name]
		})
		peer.close()
	}

	_matchChannels (receivedChannels) {
		let channels = [];

		for(let i = 0; i < receivedChannels.length; i++){
			let name = receivedChannels[i];
			let remoteStreamId = name.split("_;:_")[1];
			name = name.split("_;:_")[0];

			for(let j = 0; j < this._requestedChannels.length; j++){
				let req = this._requestedChannels[j];
	
				if(!name || !name.match(req.regex) || this._usedChannels[name]) {
					continue 
				}
				
				let channel = new RTCChannel(name, req.cb, req.stream_cb);
				this._usedChannels[name] = channel;
				channels.push(channel);

				/*
				// If a stream id is provided for the channel, register the mapping
				if(remoteStreamId) {
					this._channelsByStream = this._channelsByStream.filter((cbs) => {
						return cbs.stream !== remoteStreamId && cbs.channel !== channel
					})
					this._channelsByStream.push({
						stream: remoteStreamId, 
						channel: channel
					})
					channel.streamId = streamId
				}
				//let localStreamId = that.channelsByStream.filter(function(cbs){return cbs.channel === name; })[0]; TODO: what's that global channelsByStream obj ?!
				if(localStreamId) {
					this._channelsByStream = this._channelsByStream.filter((cbs) => {
						return cbs.stream !== localStreamId && cbs.channel !== name
					})
					this._channelsByStream.push({
						stream: localStreamId, 
						channel: name
					})
					channel.localStreamId = localStreamId
				}*/
			}
		}

		return  channels;
	}
}


module.exports = RTCController
