var message = require('./services/message');

//Services
var core = require('./services/core/core');
var timer = require('./services/timer/timer');
var promethe = require('./services/promethe/promethe');

var WebSocket = window.WebSocket || window.MozWebSocket;



function Maya(addr){
	var that = this;
	var socket;	
	
	var messageHandlers = new Array();
	
	function dispatch(msg){
		var sig = message.buildSignature(msg);
		var handler = messageHandlers[sig];
		
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



var maya = {
		Maya: Maya,
		core: core,
		timer: timer,
		promethe: promethe
}

module.exports = maya;