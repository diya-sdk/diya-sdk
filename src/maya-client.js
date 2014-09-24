var message = require('./services/message');
var core = require('./services/core/core');

var WebSocket = window.WebSocket || window.MozWebSocket;



function Maya(addr){
	var socket;	

	var messageHandlers = new Array();
	
	
	function dispatch(msg){
		var sig = message.buildSignature(msg);
		var handler = messageHandlers[sig];
		
		if(handler){
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
	
	this.connect = function(callback, args){
		socket = new WebSocket(addr);
		
		socket.onopen = function(){
			callback(args);
		};
		
		socket.onmessage = function(incomingMessage){
			handleMessage(incomingMessage);
		}
	};
	
	this.exec = function(message){
		messageHandlers[message.signature()] = message;
		send(message.exec());
	}
	
}



var maya = {
		Maya: Maya,
		core: core
}

module.exports = maya;