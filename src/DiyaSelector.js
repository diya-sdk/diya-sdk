var Q = require('q');
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var connections = [];
var tokens = [];

function d1(selector){
	return new DiyaSelector(selector);
}

d1.DiyaNode = DiyaNode;
d1.DiyaSelector = DiyaSelector;

d1.connect = function(addr){

	//If connection already exists, return the connection promise associated with it
	for(var i=0;i<connections.length; i++){
		if(connections[i].handler._addr === addr)
		 	return connections[i].promise;
	}

	//create and init the connection to remote DiyaNode
	var handler = new DiyaNode(addr);
	var promise = handler.connect();

	//Add connection to the connections array
	connections.push({
		handler: handler,
		promise: promise
	});

	//Remove the connection from connections array when connection is closed
	function removeConnection(){
		for(var i=0; i<connections.length; i++){
			if(connections[i].handler === handler){
				connections.splice(i, 1);
				break;
			}
		}
	};

	handler.onclose = removeConnection;
	promise.catch(removeConnection);

	//return a promise that will be
	return promise;
};


function DiyaSelector(selector){
	EventEmitter.call(this);
	this.length = 0;
	if(selector.constructor.name === 'String') this._selectString(selector);
	else if(selector.constructor.name === 'RegExp') this._selectRegExp(selector);
}
inherits(DiyaSelector, EventEmitter);

DiyaSelector.prototype._selectString = function(selector){
	var that = this;

	this._select(function(peer){
		//If selector match peer name, select peer and
		//stop exploring peers by returning false
		if(peer.id === selector){
			that.length = 1;
			that[0] = peer;
			return false;
		}
		//Otherwise keep exploring peers
		return true;
	})
};

DiyaSelector.prototype._selectRegExp = function(selector){
	var that = this;

	this._select(function(peer){
		if(peer.id.match(selector)){
			that[that.length] = peer;
			that.length += 1;
		}
		return true;
	});
};

DiyaSelector.prototype._select = function(selectorFunction){
	for(var i=0;i<connections.length; i++){
		var peers = connections[i].handler.peers();
		for(var j=0; j<peers.length; j++){
			if(!selectorFunction({id: peers[j], handler: connections[i].handler})) break;
		}
	}
};


//////////////////////////////////////////////////////////
////////////////////// Public API ////////////////////////
//////////////////////////////////////////////////////////


DiyaSelector.prototype.each = function(cb){
	for(var i=0; i<this.length; i++) cb.bind(this)(this[i]);
	return this;
};

DiyaSelector.prototype.request = function(params, callback, timeout){
	return this.each(function(peer){
		params.target = peer.id;
		params.token = tokens[peer.id];
		peer.handler.request(params, function(err, data){
			if(typeof callback === 'function') callback(peer.id, err, data);
		}, timeout);
	});
};

DiyaSelector.prototype.subscribe = function(params, callback, subIds){
	return this.each(function(peer){
		params.target = peer.id;
		params.token = tokens[peer.id];
		var subId = peer.handler.subscribe(params, function(err, data){
			callback(peer.id, err, data);
		});
		if(Array.isArray(subIds))
			subIds[peer.id] = subId;
	});
};

DiyaSelector.prototype.unsubscribe = function(subIds){
	return this.each(function(peer){
		var subId = subIds[peer.id];
		if(subId) peer.handler.unsubscribe(subId);
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
