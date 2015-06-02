DiyaSelector = require('../../DiyaSelector').DiyaSelector;
EventEmitter = require('node-event-emitter');
inherits = require('inherits');


var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;


function Channel(dnId, name, open_cb){
	EventEmitter.call(this);
	this.name = name;
	this.dnId = dnId;

	this.frequency = 20;

	this.channel = undefined;
	this.onopen = open_cb;
	this.closed = false;
}
inherits(Channel, EventEmitter);

Channel.prototype.setChannel = function(datachannel){
	var that = this;
	this.channel = datachannel;
	this._negociate();

};

Channel.prototype.close = function(){
	this.closed = true;
};

Channel.prototype.write = function(index, value){
	if(index < 0 || index > this.size || isNaN(value)) return false;
	this._buffer[index] = value;
	this._requestSend();
	return true;
};

Channel.prototype.writeAll = function(values){
	if(!Array.isArray(values) || values.length !== this.size)
        return false;

    for (var i = 0; i<values.length; i++){
        if(isNaN(values[i])) return false;
        this._buffer[i] = values[i];
    }
    this._requestSend();
};


Channel.prototype._requestSend = function(){
	var that = this;

	var elapsedTime = new Date().getTime() - this._lastSendTimestamp;
	var period = 1000 / this.frequency;
	if(elapsedTime >= period){
		doSend();
	}else if(!this._sendRequested){
		this._sendRequested = true;
		setTimeout(doSend, period - elapsedTime);
	}

	function doSend(){
		that._sendRequested = false;
		that._lastSendTimestamp = new Date().getTime();
		that._send(that._buffer);
	}
};

Channel.prototype._send = function(msg){
	if(this.closed) return false;
	else if(this.channel.readyState === 'open'){
		try{
			this.channel.send(msg);
		}catch(e){
			console.log('[rtc.channel.write] exception occured while sending data');
		}
		return true;
	}
	else{
		console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
		return false;
	}
};

Channel.prototype._negociate = function(){
	var that = this;

	this.channel.onmessage = function(message){
		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if(typeChar === 'O'){
			//Input
			that.type = 'input'; //Promethe Output = Client Input
		}else if(typeChar === 'I'){
			//Output
			that.type = 'output'; //Promethe Input = Client Output
		}else{
			//Error
		}

		var size = view.getInt32(1,true);
		if(size != undefined){
			that.size = size;
			that._buffer = new Float32Array(size);
		}else{
			//error
		}

		that.channel.onmessage = that._onMessage.bind(that);

		if(typeof that.onopen === 'function') that.onopen(that.dnId, that);
	}
};

Channel.prototype._onMessage = function(message){
	var valArray = new Float32Array(message.data);
	this.emit('value', valArray);
}


//////////////////////////////////////////////////////////////////
///////////////////// RTC Peer implementation ////////////////////
//////////////////////////////////////////////////////////////////


function Peer(dn, rtc, id, channels){
	this.dn = d1(dn.id);
	this.dnId = dn.id;
	this.id = id;
	this.channels = channels;
	this.rtc = rtc;
	this.peer = null;

	this.connected = false;
	this.closed = false;

	this._connect();
}

Peer.prototype._connect = function(){
	var that = this;

	this.subIds = [];

	this.dn.subscribe({
		service: 'rtc',
		func: 'Connect',
		obj: this.channels,
		data: {
			promID: this.id
		}
	},
	function(diya, err, data){
		if(data) that._handleNegociationMessage(data);
	}, this.subIds);

	setTimeout(function(){
		if(!that.connected && !that.closed){
			that._reconnect();
		}
	}, 10000);
};

Peer.prototype._reconnect = function(){
	this.close();

	this.peer = null;
	this.connected = false;
	this.closed = false;

	this._connect();
};


Peer.prototype._handleNegociationMessage = function(msg){
	if(msg.eventType === 'RemoteOffer'){
		this._createPeer(msg);
	}else if(msg.eventType === 'RemoteICECandidate'){
		this._addRemoteICECandidate(msg);
	}
};

var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

Peer.prototype._createPeer = function(data){
	var that = this;

	var peer = new RTCPeerConnection(servers,  {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});
	this.peer = peer;

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		that.dn.request({
			service: 'rtc',
			func: 'Answer',
			data: {
				promID: data.promID,
				peerId: data.peerId,
				sdp: session_description.sdp,
				type: session_description.type
			}
		});
	},
	function(err){
		console.log("RTC: cannot create answer :");
		console.log(err);
	},
	{'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true}});

	peer.oniceconnectionstatechange = function(){
		console.log('RTC: state change('+that.id+':'+that.dnId+') : '+peer.iceConnectionState);
		if(peer.iceConnectionState === 'connected'){
			that.connected = true;
			that.dn.unsubscribe(that.subIds);
		}
		else if(peer.iceConnectionState === 'disconnected'){
			if(!that.closed) that._reconnect();
		}
	};

	peer.onicecandidate = function(evt){
		that.dn.request({
			service: 'rtc',
			func: 'ICECandidate',
			data: {
				peerId: data.peerId,
				promID: that.id,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function(evt){
		that.connected = true;
		that.rtc._onDataChannel(that.dnId, evt.channel);
	};
};


Peer.prototype._addRemoteICECandidate = function(data){
	var that = this;
	try{
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate, function(){
			console.log("RTC: candidate added("+that.id+":"+that.dnId+") : "+that.peer.iceConnectionState);
		},function(err){
			console.error("RTC: cannot add RemoteICECandidate :");
			console.error(err);
		});
	}catch(err){
		console.error("RTC: cannot add RemoteICECandidate : ");
		console.error(err);
	}
};

Peer.prototype.close = function(){
	this.dn.unsubscribe(this.subIds);
	if(this.peer){
		try{
			this.peer.close();
		}catch(e){}
		this.connected = false;
		this.closed = true;
	}
};


//////////////////////////////////////////////////////////////////////////////
/////////////////////////// RTC service implementation ///////////////////////
//////////////////////////////////////////////////////////////////////////////



function RTC(selector){
	var that = this;
	this.selector = selector;

	selector.each(function(dn){
		that[dn.id] = {
			dn: dn,
			usedChannels: [],
			requestedChannels: [],
			peers: []
		}
	});
}


RTC.prototype.disconnect = function(){
	var that = this;

	this.selector.each(function(dn){
		for(var promID in that[dn.id].peers){
			that._closePeer(dn.id, promID);
		}
	});

	this.selector.unsubscribe(this.subIds);
	return this;
};

RTC.prototype.use = function(name_regex, onopen_callback){
	var that = this;
	this.selector.each(function(dn){
		that[dn.id].requestedChannels.push({regex: name_regex, cb: onopen_callback});
	});
	return this;
};

RTC.prototype.connect = function(){
	var that = this;

	this.subIds = [];

	this.selector.subscribe({
		service: 'rtc',
		func: 'ListenPeers'
	}, function(dnId, err, data){

		if(data && data.eventType && data.promID !== undefined){

			if(data.eventType === 'PeerConnected'){
				if(!that[dnId].peers[data.promID]){
					var channels = that._matchChannels(dnId, data.channels);
					if(channels.length > 0){
						that[dnId].peers[data.promID] = new Peer(that[dnId].dn, that, data.promID, channels);
					}
				}
			}
			else if(data.eventType === 'PeerClosed'){
				if(that[dnId].peers[data.promID]){
					that._closePeer(dnId, data.promID);
					if(typeof that.onclose === 'function') that.onclose(dnId);
				}
			}

		}

	}, this.subIds);

	return this;
};

RTC.prototype._closePeer = function(dnId, promID){
	if(this[dnId].peers[promID]){
		var p = this[dnId].peers[promID];
		p.close();

		for(var i=0;i<p.channels.length; i++){
			delete this[dnId].usedChannels[p.channels[i]];
		}

		delete this[dnId].peers[promID];
	}
};

RTC.prototype._matchChannels = function(dnId, receivedChannels){
	var that = this;

	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];

		for(var j = 0; j < that[dnId].requestedChannels.length; j++){
			var req = that[dnId].requestedChannels[j];

			if(name && name.match(req.regex) && !that[dnId].usedChannels[name]){
				that[dnId].usedChannels[name] = new Channel(dnId, name, req.cb);
				channels.push(name);
			}
		}
	}

	return  channels;
};


RTC.prototype._onDataChannel = function(dnId, datachannel){
	console.log("Channel "+datachannel.label+" created !");

	var channel = this[dnId].usedChannels[datachannel.label];
	if(!channel){
		datachannel.close();
		return ;
	}

	channel.setChannel(datachannel);
};



DiyaSelector.prototype.rtc = function(){
	return new RTC(this);
};
