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


var message = require('./services/message');

//Services
var core = require('./services/core/core');
var timer = require('./services/timer/timer');
var rtc = require('./services/rtc/rtc');
var Promethe = require('./services/promethe/promethe');

var WebSocket = window.WebSocket || window.MozWebSocket;

 

function Maya(addr){
	var that = this;
	var socket;	
	
	var messageHandlers = new Array();
	
	function dispatch(msg){
		var sig = message.buildSignature(msg);
		var handler = messageHandlers[sig];
		
		console.log(msg);
		console.log(handler);

		if(handler){
			if(!handler.permanent){
				delete messageHandlers[sig];
			}

				handler.parse(msg.data);
			
		}
	}
	
	
	function send(msg){
		try{
			data = JSON.stringify(msg);
			socket.send(data);
		}catch(e){
			console.log('malformed JSON, ignoring msg...');
		}
	}	
	
	function handleMessage(incomingMessage){
		var msg;

		try{
			msg = JSON.parse(incomingMessage.data);
		}catch(e){
			console.log("malformed JSON");
			 
			return ;
		}
		
		dispatch(msg);

	};
	
	function closeAll(){
		for(var i in messageHandlers){
			if(messageHandlers[i].onClose)
				messageHandlers[i].onClose();
			
			delete messageHandlers[i];
		}
		if(that.onClose) that.onClose();
	}
	
	this.connect = function(callback, args){
		
		try{
			socket = new WebSocket(addr);
		}catch(e){
			console.log("can't connect to "+addr);
		}
		
		socket.onopen = function(){
			callback(args);
		};
		
		socket.onmessage = function(incomingMessage){
			handleMessage(incomingMessage);
		}
		
		socket.onclose = function(){
			closeAll();
		}
	};
	
	this.exec = function(message){
		messageHandlers[message.signature()] = message;
		send(message.exec());
	}
	
}


function MayaClient(addr, user, password){

	var that = this;

	var nodes = new Array();


	function createNode(){
		var node = new maya.Maya(addr);
		nodes.push(node);

		return node;
	}

	this.createSession = function(onconnected, onfailure){

		var node = createNode();

		node.connect(function(){
			var cmd_auth = new maya.core.Authenticate(user, password, function(authenticated){
				if(authenticated){
					onconnected(node);
				}else{
					onfailure();
				}
			});
			node.exec(cmd_auth);
		});	
	}
	
}


var maya = {
		MayaClient: MayaClient,
		Maya: Maya,
		core: core,
		timer: timer,
		rtc: rtc,
		Promethe: Promethe
}

module.exports = maya;
