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

/*============COMMANDS==============*/

function ListChannels(onList){
	Message.call(this, 'rtc', 'ListChannels');
	
	this.onList = onList;

	this.permanent = true;
}
util.inherits(ListChannels, Message);

ListChannels.prototype.exec = function(){
	return ListChannels.super_.prototype.exec.call(this);
}

ListChannels.prototype.parse = function(data){
	if(this.onList) this.onList(data.channels);
}

function Connect(channels){
	Message.call(this,'rtc', 'Connect');

	this.channels = channels;
}
util.inherits(Connect, Message);

Connect.prototype.exec =function(){
	var msg = Connect.super_.prototype.exec.call(this);
	msg.obj = this.channels;
	return msg;
}

Connect.prototype.parse = function(data){}

function OfferListener(onoffer){
	Message.call(this, 'rtc', 'RemoteOffer');

	this.onOffer = onoffer;

	this.permanent = true;
}
util.inherits(OfferListener, Message);

OfferListener.prototype.exec = function(){
	return null;
}

OfferListener.prototype.parse = function(data){
	if(this.onOffer) this.onOffer(data);
}

function Answer(promID, session_description){
	Message.call(this, 'rtc', 'Answer');

	this.session_description = session_description;
	this.promID = promID;
}
util.inherits(Answer, Message);

Answer.prototype.exec = function(){
	var that = this;
	return Answer.super_.prototype.exec.call(this, {
		sdp: that.session_description.sdp,
		type: that.session_description.type,
		promID: that.promID
	});
}

Answer.prototype.parse = function(data){

}

function ICECandidate(promID, candidate){
	Message.call(this, 'rtc', 'ICECandidate');

	this.candidate = candidate;
	this.promID = promID;
}
util.inherits(ICECandidate, Message);

ICECandidate.prototype.exec = function(){
	var that = this;
	return ICECandidate.super_.prototype.exec.call(this,{
		candidate: that.candidate,
		promID: that.promID
	});
}

ICECandidate.prototype.parse = function(data){

}

function ICECandidateListener(onicecandidate){
	Message.call(this, 'rtc', 'RemoteICECandidate');

	this.onICECandidate = onicecandidate;

	this.permanent = true;
}
util.inherits(ICECandidateListener, Message);

ICECandidateListener.prototype.exec = function(){
	return null;
}

ICECandidateListener.prototype.parse = function(data){
	if(this.onICECandidate) this.onICECandidate(data);
}

/*==========================================*/
var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function Channel(params){
	this.name = params;

	this.channel = undefined;
	this.onopen = undefined;
}

Channel.prototype.setChannel = function(datachannel){
	this.channel = datachannel;

	var that = this;
	if(that.onopen) that.onopen(that);
}

Channel.prototype.setOnMessage = function(onmessage){
	this.channel.onmessage = onmessage;
}

Channel.prototype.send = function(msg){
	if(this.channel.readyState === 'open') this.channel.send(msg);
	else console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
}

function RTC(node){
	var that = this;
	
	this.node = node;
	this.availableChannels = new Array();
	this.usedChannels = new Array();

	this.peers = new Array();
	
	this.id = -1;

	function listChannels(){
		var cmdListChannels = new ListChannels(function(data){ 
			for(var i = 0; i < data.length; i++){
				that.availableChannels.push(new Channel(data[i]));
			}
		});
		that.node.exec(cmdListChannels);
	}

	listChannels();
}

RTC.prototype.use = function(name_regex, onopen_callback){

	for(var i=0; i < this.availableChannels.length;i++){
		var n = this.availableChannels[i];
		if(n.name && n.name.match(name_regex)){
			n.onopen = onopen_callback;
			this.usedChannels[n.name] = n;
		}
	}
}

RTC.prototype.disconnect = function(){
	for(var i=0;i<this.peers.length;i++){
		this.peers[i].close();
	}
	this.peers = new Array();
}

RTC.prototype.connect = function(){
	var that = this;

	var channels = new Array();
	for(var n in this.usedChannels){
		channels.push(n);
	}

	var cmdConnect = new Connect(channels);

	//Register for offers
	var cmdOffer = new OfferListener(function(data){
		var peer = that._createPeer(data);
		that.peers.push(peer);
	});
	
	this.node.exec(cmdOffer);

	this.node.exec(cmdConnect);
}


var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

RTC.prototype._createPeer = function(data){
	var that = this;

	var peer = new RTCPeerConnection(servers, {mandatory: [{DtlsSrtpKeyAgreement: true}, {EnableDtlsSrtp: true}]});

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		var cmdAnswer = new Answer(data.promID, session_description);
		that.node.exec(cmdAnswer);
	},
	function(err){
		console.log("cannot create answer");
	}, 
	{ 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });

	peer.onicecandidate = function(evt){
		var cmdICECandidate = new ICECandidate(data.promID,evt.candidate);
		that.node.exec(cmdICECandidate);
	};

	peer.ondatachannel = function(evt){
		that._onDataChannel(evt.channel);
	};

	peer.onaddstream = function(evt){
		console.log("ON ADD STREAM");
		var remoteView = document.querySelector("#myvid");
		remoteView.src = URL.createObjectURL(evt.stream);
	};

	var cmdIce = new ICECandidateListener(function(data){
		
		try{
			var candidate = new RTCIceCandidate(data.candidate);
			peer.addIceCandidate(candidate,function(){
				console.log("candidate added ("+peer.iceConnectionState+")");
			},function(e){
				console.log(e);
			});
		}catch(e) {console.log(e);}
		

	});
	that.node.exec(cmdIce);

	peer.promID = data.promID;

	return peer;
}

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
		ListChannels: ListChannels,
		RTC: RTC
}

module.exports = exp; 
