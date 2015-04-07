/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



var util = require('util');


var Message = require('../message');

/*==========================================*/
var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function Channel(name, open_cb){
	this.name = name;

	this.channel = undefined;
	this.onopen = open_cb;
	this.closed = false;
}

Channel.prototype.setChannel = function(datachannel){
	this.channel = datachannel;

	var that = this;
	if(that.onopen) that.onopen(that);
}

Channel.prototype.close = function(){
	this.closed = true;
}

Channel.prototype.setOnMessage = function(onmessage){
	this.channel.onmessage = onmessage;
}

Channel.prototype.send = function(msg){
	if(this.closed) return false;
	else if(this.channel.readyState === 'open'){
		this.channel.send(msg);
		return true;
	}
	else{
		console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
		return false;
	}
}


////////////////////////////////////////////////

function Peer(rtc, id, channels){
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

	this.sub = this.rtc.node.listen({
		service: 'rtc',
		func: 'Connect',
		obj: this.channels,
		data: {
			promID: this.id
		}
	},
	function(data){
		that._handleNegociationMessage(data);
	});

	setTimeout(function(){
		if(!that.connected){
			that.rtc.reconnect();
		}else{
		}
	}, 10000);
}

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

	var peer = new RTCPeerConnection(servers, {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});
	this.peer = peer;

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		that.rtc.node.get({
			service: 'rtc',
			func: 'Answer',
			data:{
				promID: data.promID,
				peerId: data.peerId,
				sdp: session_description.sdp,
				type: session_description.type
			}
		});
	},
	function(err){
		console.log("cannot create answer");
	}, 
	{ 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });


	peer.oniceconnectionstatechange = function(){
		console.log(peer.iceConnectionState);
		if(peer.iceConnectionState === 'connected'){
			that.connected = true;  
			that.rtc.node.stopListening(this.sub);
		}else if(peer.iceConnectionState === 'disconnected'){
			if(!that.closed) that.rtc.reconnect();
		}
	}

	peer.onicecandidate = function(evt){
		that.rtc.node.get({
			service: 'rtc',
			func: 'ICECandidate',
			data:{
				peerId: data.peerId,
				promID: that.id,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function(evt){
		that.connected = true;
		that.rtc._onDataChannel(evt.channel);
	};
}

Peer.prototype._addRemoteICECandidate = function(data){
	var that = this;
	try{
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate,function(){
			console.log("candidate added ("+that.peer.iceConnectionState+")");
		},function(e){
			console.log(e);
		});
	}catch(e) {console.log(e);}
}

Peer.prototype.close = function(){
	this.rtc.node.stopListening(this.sub);
	if(this.peer) this.peer.close();
	this.connected = false;
	this.closed = true;
}



/////////////////////////////////


function RTC(node){
	var that = this;
	
	this.node = node;
	this.usedChannels = [];

	this.requestedChannels = [];

	this.peers = [];
}

RTC.prototype.use = function(name_regex, onopen_callback){
	this.requestedChannels.push({regex: name_regex, cb: onopen_callback});
}

RTC.prototype.reconnect = function(){
	console.log("reconnecting...");
	this.disconnect();
	this.connect();
}

RTC.prototype.disconnect = function(){

	for(var promID in this.peers){
		this._closePeer(promID);
	}

	if(typeof this.onclose === 'function') this.onclose();
}

RTC.prototype.connect = function(){
	var that = this;
	var foundChannels = false;

	var sub = this.node.listen({
		service: 'rtc',
		func: 'ListenPeers'
	},
	function(data){
			
		if(data.eventType && data.promID !== undefined){

			if(data.eventType === 'PeerConnected'){
				if(!that.peers[data.promID]){
					var channels = that._matchChannels(data.channels);
					if(channels.length > 0){
						that.peers[data.promID] = new Peer(that, data.promID, channels);
					}
				}
			}
			else if(data.eventType === 'PeerClosed'){
				if(that.peers[data.promID]) that._closePeer(data.promID);
			}
		}

	});
}


RTC.prototype._closePeer = function(promID){

	if(this.peers[promID]){
		var p = this.peers[promID];
		p.close();

		for(var i=0; i < p.channels.length; i++){
			delete this.usedChannels[p.channels[i]];
		}

		delete this.peers[promID];
	}
}

RTC.prototype._matchChannels = function(receivedChannels){
	var that = this;

	//Contains all channels that will be passed to Connect as objects
	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];
		
		for(var j = 0; j < that.requestedChannels.length; j++){
			var req = that.requestedChannels[j];
			
			if(name && name.match(req.regex) && !that.usedChannels[name]){
				that.usedChannels[name] = new Channel(name, req.cb);
				channels.push(name); //prepare the connect object list
			}
		}
	}

	return channels;
};

RTC.prototype._onDataChannel = function(datachannel){
	console.log("Channel "+datachannel.label+" created !");

	var channel = this.usedChannels[datachannel.label];
	if(!channel){
		datachannel.close();
		return ;
	}

	channel.setChannel(datachannel);
}


var exp = {
		RTC: RTC
}

module.exports = exp; 
