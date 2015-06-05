var Q = require('q');
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var connection = null;
var tokens = [];

function d1(selector){
	return new DiyaSelector(selector);
}

d1.DiyaNode = DiyaNode;
d1.DiyaSelector = DiyaSelector;

d1.connect = function(addr){

	//Close already existing connections
	if(connection !== null){
		connection.close();
	}

	connection = new DiyaNode(addr);
	return connection.connect();
};


function DiyaSelector(selector){
	EventEmitter.call(this);

	this._selector = selector;
	this._listenerCount = 0;
	this._listenCallback = null;
}
inherits(DiyaSelector, EventEmitter);


function match(selector, str){
	if(selector.constructor.name === 'String'){
		return matchString(selector, str);
	}else if(selector.constructor.name === 'RegExp'){
		return matchRegExp(selector, str);
	}else if(Array.isArray(selector)){
		return matchArray(selector, str);
	}
	return false;
}

function matchString(selector, str){
	return selector === str;
}

function matchRegExp(selector, str){
	return str.match(selector);
}

function matchArray(selector, str){
	for(var i=0;i<selector.length; i++){
		if(selector[i] === str) return true;
	}
	return false;
}


DiyaSelector.prototype._select = function(selectorFunction){
	var that = this;

	if(!connection) return [];
	return connection.peers().filter(function(peerId){
		return match(that._selector, peerId);
	});
};

DiyaSelector.prototype._listenConnection = function(){
	if(this._listenerCount === 0){
		this._listenCallback = this._handlePeerConnected.bind(this);
		connection.on('peer-connected', this._listenCallback);
	}
	this._listenerCount++;
};

DiyaSelector.prototype._handlePeerConnected = function(peerId){
	if(match(this._selector, peerId)) {
		console.log("match");
		this.emit('peer-connected', peerId);
	}
};

//////////////////////////////////////////////////////////
////////////////////// Public API ////////////////////////
//////////////////////////////////////////////////////////


DiyaSelector.prototype.each = function(cb){
	var peers = this._select();

	for(var i=0; i<peers.length; i++) cb.bind(this)(peers[i]);
	return this;
};

DiyaSelector.prototype.request = function(params, callback, timeout){
	if(!connection) return this;

	return this.each(function(peerId){
		params.target = peerId;
		params.token = tokens[peerId];
		connection.request(params, function(err, data){
			if(typeof callback === 'function') callback(peerId, err, data);
		}, timeout);
	});
};

DiyaSelector.prototype.subscribe = function(params, callback, options){

	function doSubscribe(peerId){
		params.target = peerId;
		params.token = tokens[peerId];
		var subId = connection.subscribe(params, function(err, data){
			callback(peerId, err, data);
		});
		if(options && Array.isArray(options.subIds))
			options.subIds[peerId] = subId;
	}

	//send subscription to all selected peer
	this.each(doSubscribe);
	if(options && options.auto){
		this._listenConnection();
		this.on('peer-connected', doSubscribe);
	}
	return this;
};

DiyaSelector.prototype.unsubscribe = function(subIds){
	return this.each(function(peerId){
		var subId = subIds[peerId];
		if(subId) connection.unsubscribe(subId);
	});
	this._listenerCount--;
	if(this._listenerCount === 0){
		connection.removeListener('peer-connected', this._listenCallback);
		this._listenCallback = null;
	}
};

DiyaSelector.prototype.auth = function(user, password, callback, timeout){
	callback = callback.bind(this);

	return this.request({
		service: 'auth',
		func: 'Authenticate',
		data: {
			user: user,
			password: password
		}
	}, function(peerId, err, data){
		if(!err && data.authenticated && data.token){
			tokens[peerId] = data.token;
			callback(peerId, true);
		}else {
			callback(peerId, false);
		}
	}, timeout);
};

module.exports = d1;
