/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



var util = require('util');


var Message = require('../message');

/*============COMMANDS==============*/

function ListNeurons(onList){
	Message.call(this, 'promethe', 'ListNeurons');
	
	this.onList = onList;
}
util.inherits(ListNeurons, Message);

ListNeurons.prototype.exec = function(){
	return ListNeurons.super_.prototype.exec.call(this);
}

ListNeurons.prototype.parse = function(data){
	if(this.onList) onList(data.neurons);
}

function Offer(neuronList){
	Message.call(this,'promethe', 'RTCOffer');
	this.neuronList = neuronList;
}
util.inherits(Offer, Message);

Offer.prototype.exec = function(){
	
	for(var i=0;i<this.neuronList.length;i++){
		//create offer
		//add offer to neuronList item
	}	
	
	//send offer to remote peer
}

/*==========================================*/

function Neuron(params){
	this.name = params.name;
	this.type = params.type;
	this.size = params.size;
}

var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

function RTCHandler(node, ready_callback){
	var that = this;
	
	this.node = node;
	this.neurons = undefined;
	
	this.usedProm = new Array();
	
	var cmd = new ListNeurons(function(data){
		that.neurons = data;
		
		if(ready_callback) ready_callback();
	});
	this.node.exec(cmd);		
}

RTC.prototype.available = function(name_regex){
	
	var neurons = new Array();
	
	for(var i=0; i < this.neurons.length;i++){
		var n = this.neurons[i];
		if(n.name && n.name.match(name_regex)){
			neurons.push(n);
		}
	}
	
	return neurons;
}

RTC.prototype.use = function(name_regex){
	for(var i=0; i < this.neurons.length;i++){
		var n = this.neurons[i];
		if(n.name && n.name.match(name_regex)){
			
			if(!this.usedProm[n.promID]) this.usedProm[n.promID] = {neurons: new Array()};
			this.usedProm[n.promID].neurons.push(n);
			
		}
	}
}


RTCHandler.prototype.connect = function(callback){
	
	for(var promID in this.usedProm){
		var prom = this.usedProm[promID];
		
		prom.peer = new RTCPeerConnection(
				{"iceServers": [{"url": "stun:stun.l.google.com:19302"}]},
				{optional: []}
		);
		
		for(var i=0;i<prom.neurons.length;i++){
			var n = prom.neurons[i];
			
			n.channel = prom.peer.createDataChannel(n.name, {maxRetransmits: 0});
		}
	}
	
}


var exp = {
		ListNeurons: ListNeurons,
		Offer: Offer
}

module.exports = exp; 
