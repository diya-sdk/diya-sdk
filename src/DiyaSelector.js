var Q = require('q');
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var connection = new DiyaNode();
var connectionEvents = new EventEmitter();
var token = null;
var _user = null;
var _pass = null;

function d1(selector){
	return new DiyaSelector(selector);
}


d1.DiyaNode = DiyaNode;
d1.DiyaSelector = DiyaSelector;

d1.connect = function(addr, WSocket){
	return connection.connect(addr, WSocket);
};

d1.disconnect = function(){
	token = null;
	return connection.close();
};

d1.isConnected = function() {	return connection.isConnected();};
d1.peers = function() { return connection.peers();};
d1.self = function() { return connection.self(); };
d1.addr = function() { return connection.addr(); };
d1.user = function() { return _user; };
d1.pass = function() { return _pass; };


/** Try to connect to the given servers list in the list order, until finding a available one */
d1.tryConnect = function(servers, WSocket){
	var deferred = Q.defer();
	function tc(i) {
		console.log("TRY : " + servers[i]);
		d1.connect(servers[i], WSocket).then(function(e){
			console.log("youpi : " + servers[i]);
			return deferred.resolve(servers[i]);
		}).catch(function(e){
			console.log("FAILED : " + servers[i]);
			d1.disconnect().then(function() {
				i++;
				if(i<servers.length) setTimeout(function() {tc(i);}, 100);
				else return deferred.reject("Timeout");
			});
		});
	}
	tc(0);
	return deferred.promise;
}

d1.currentServer = function(){
	return connection._addr;
};

d1.on = function(event, callback){
	connection.on(event, callback);
	return d1;
};

/** Shorthand function to connect and login with the given (user,password) */
d1.connectAsUser = function(ip, user, password) {
	return d1.connect(ip).then(function(){
		return d1().auth(user, password);
	});
}

d1.deauthenticate = function(){
	token = null;
};

d1.setSecured = function(bSecured) {
	connection.setSecured(bSecured);
};


function DiyaSelector(selector){
	EventEmitter.call(this);

	this._selector = selector;
	this._listenerCount = 0;
	this._listenCallback = null;
	this._callbackAttached = false;
}
inherits(DiyaSelector, EventEmitter);


function match(selector, str){
	if(!selector || selector === "#self") return connection && str===connection.self();
	else if(selector.constructor.name === 'String'){
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

// TODO : Definitely change to public
DiyaSelector.prototype.select = function() { return this._select(); };
DiyaSelector.prototype._select = function(selectorFunction){
	var that = this;

	if(!connection) return [];
	return connection.peers().filter(function(peerId){
		return match(that._selector, peerId);
	});
};

DiyaSelector.prototype._addConnectionListener = function(){
	if(this._listenerCount === 0){
		this._attachListenCallback();
	}
	this._listenerCount++;
};

DiyaSelector.prototype._removeConnectionListener = function(){
	if(this._listenerCount === 0) return ;
	this._listenerCount--;
	if(this._listenerCount === 0){
		this._detachListenCallback();
	}
};

DiyaSelector.prototype._attachListenCallback = function(){

	this._connectedCallback = this._handlePeerConnected.bind(this);
	this._disconnectedCallback = this._handlePeerDisconnected.bind(this);

	connection.on('peer-connected', this._connectedCallback);
	connection.on('peer-disconnected', this._disconnectedCallback);

	if(connection.isConnected()){
		var peers = connection.peers();
		for(var i=0;i<peers.length; i++){
			this._handlePeerConnected(peers[i]);
		}
	}
};

DiyaSelector.prototype._detachListenCallback = function(){
	connection.removeListener('peer-connected', this._connectedCallback);
	connection.removeListener('peer-disconnected', this._disconnectedCallback);
};

DiyaSelector.prototype._handlePeerConnected = function(peerId){
	if(match(this._selector, peerId)) {
		this.emit('peer-connected', peerId);
	}
};

DiyaSelector.prototype._handlePeerDisconnected = function(peerId){
	if(match(this._selector, peerId)) {
		this.emit('peer-disconnected', peerId);
	}
};

//////////////////////////////////////////////////////////
////////////////////// Public API ////////////////////////
//////////////////////////////////////////////////////////


DiyaSelector.prototype.listen = function(){
	this._addConnectionListener();
	return this;
};

/**
 * Apply callback cb to each selected peer. Peers are selected
 * according to the rule 'selector' given to constructor. Selector can
 * be a peerId, a regEx for peerIds of an array of peerIds.
 * @params 	cb		callback to be applied
 * @return 	this 	<DiyaSelector>
 */
DiyaSelector.prototype.each = function(cb){
	var peers = this._select();
	for(var i=0; i<peers.length; i++) cb.bind(this)(peers[i]);
	return this;
};

/**
 * Send request to selected peers ( see each() ) through the current
 * connection (DiyaNode).
 */
DiyaSelector.prototype.request = function(params, callback, timeout){
	if(!connection) return this;

	return this.each(function(peerId){
		params.target = peerId;
		params.token = token;
		connection.request(params, function(err, data){
			if(typeof callback === 'function') callback(peerId, err, data);
		}, timeout);
	});
};

DiyaSelector.prototype.subscribe = function(params, callback, options){

	function doSubscribe(peerId){
		params.target = peerId;
		params.token = token;
		var subId = connection.subscribe(params, function(err, data){
			callback(peerId, err, data);
		});
		if(options && Array.isArray(options.subIds))
			options.subIds[peerId] = subId;
	}

	//send subscription to all selected peer
	this.each(doSubscribe);
	if(options && options.auto){
		this._addConnectionListener();
		this.on('peer-connected', doSubscribe);
	}
	return this;
};

DiyaSelector.prototype.unsubscribe = function(subIds){
	this.each(function(peerId){
		var subId = subIds[peerId];
		if(subId) connection.unsubscribe(subId);
	});
	this._removeConnectionListener();
	return this;
};

DiyaSelector.prototype.auth = function(user, password, callback, timeout){
	if(typeof callback === 'function') callback = callback.bind(this);
	
	var deferred = Q.defer();

	this.request({
		service: 'auth',
		func: 'Authenticate',
		data: {
			user: user,
			password: password
		}
	}, function(peerId, err, data){

		if(err === 'ServiceNotFound'){
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.reject(err);
			return ;
		}

		if(!err && data && data.authenticated && data.token){
			token = data.token;
			_user = user;
			_pass = password;
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.resolve();
		} else {
			if(typeof callback === 'function') callback(peerId, false);
			else deferred.reject('AccessDenied');
		}

	}, timeout);

	return deferred.promise;
};

module.exports = d1;
