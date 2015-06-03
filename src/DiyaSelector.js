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
}
inherits(DiyaSelector, EventEmitter);


DiyaSelector.prototype._select = function(selectorFunction){
	if(!connection) return [];

	if(this._selector.constructor.name === 'String'){
		return this._selectString();
	}else if(this._selector.constructor.name === 'RegExp'){
		return this._selectRegExp();
	}else if(Array.isArray(this._selector)){
		return this._selectArray();
	}

	return [];
};

DiyaSelector.prototype._selectString = function(){
	var peers = connection.peers();

	for(var i=0;i<peers.length; i++){
		if(peers[i] === this._selector) return [ peers[i] ];
	}
	return [];
};

DiyaSelector.prototype._selectRegExp = function(){
	return connection.peers().filter(function(peer){
		return peer.match(this._selector);
	}, this);
};

DiyaSelector.prototype._selectArray = function(){
	return connection.peers().filter(function(peer){
		for(var i=0;i<this._selector.length; i++){
			if(this._selector[i] === peer) return true;
		}
		return false;
	}, this);
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
	if(options.auto){
		connection.on('peer-connected', doSubscribe);
	}
	return this;
};

DiyaSelector.prototype.unsubscribe = function(subIds){
	return this.each(function(peerId){
		var subId = subIds[peerId];
		if(subId) connection.unsubscribe(subId);
	});
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
