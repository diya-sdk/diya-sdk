var RTC = require('../rtc/rtc');

function Promethe(session){
	var that = this;

	this.rtc = new RTC.RTC(session);

	this.rtc.onclose = function(){
		if(typeof that.onclose === 'function') that.onclose();
	}
}

Promethe.prototype.use = function(regex, callback){
	var that = this;
	this.rtc.use(regex, function(channel){
		that._negociateNeuron(channel, callback);
	});
}

Promethe.prototype.connect = function(){
	this.rtc.connect();
}

Promethe.prototype.disconnect = function(){
	this.rtc.disconnect();
}


Promethe.prototype._negociateNeuron = function(channel, callback){
	channel.setOnMessage(function(message){

		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if(typeChar === 'O'){
			//Input
			channel.type = 'input'; //Promethe Output = Client Input
		}else if(typeChar === 'I'){
			//Output
			channel.type = 'output'; //Promethe Input = Client Output
		}else{
			//Error
		}

		var size = view.getInt32(1,true);
		if(size != undefined){
			channel.size = size;
			channel._buffer = new Float32Array(size);
		}else{
			//error
		}



		channel.setOnMessage(undefined);

		channel.setOnValue = function(onvalue_cb){
			channel.setOnMessage(onvalue_cb);
		};

		channel.write = function(index, value){
			if(index < 0 || index > channel.size || isNaN(value)) return false;
			channel._buffer[index] = value;
			channel._requestSend();
			return true;
		};

		channel.writeAll = function(values){
			if(!Array.isArray(values) || values.length !== channel.size)
				return false;

			for (var i = 0; i<values.length; i++){
				if(isNaN(values[i])) return false;
				channel._buffer[i] = values[i];
			}
			channel._requestSend();
		};

		channel._lastSendTimestamp = 0;
		channel._sendRequested = false;

		channel.frequency = 30;

		channel._requestSend = function(){
			var elapsedTime = new Date().getTime() - channel._lastSendTimestamp;
			var period = 1000 / channel.frequency;
			if(elapsedTime >= period){
				channel._doSend();
			}else if(!channel._sendRequested){
				channel._sendRequested = true;
				setTimeout(channel._doSend, period - elapsedTime);
			}
		};

		channel._doSend = function(){
			channel._sendRequested = false;
			channel._lastSendTimestamp = new Date().getTime();
			channel.send(channel._buffer);
		};

		callback(channel);

	});
}


module.exports = Promethe;
