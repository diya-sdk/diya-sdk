var Q = require('q');

var DiyaNode = require('./DiyaNode');

var connections = [];
var tokens = [];

function d1(selector){
	return new DiyaSelector(selector);
}

d1.DiyaNode = DiyaNode;

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
	this.length = 0;
	if(selector.constructor.name === 'String') this._selectString(selector);
	else if(selector.constructor.name === 'RegExp') this._selectRegExp(selector);
}

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

DiyaSelector.prototype.each = function(cb){
	for(var i=0; i<this.length; i++) cb(this[i]);
	return this;
};

DiyaSelector.prototype.request = function(params, callback, timeout){
	return this.each(function(peer){
		params.target = peer.id;
		params.token = tokens[peer.id];
		peer.handler.request(params, function(err, data){
			callback(peer.id, err, data);
		}, timeout);
	});
};

DiyaSelector.prototype.subscribe = function(params, callback){
	var subIds = [];
	this.each(function(peer){
		params.target = peer.id;
		params.token = tokens[peer.id];
		var subId = peer.handler.subscribe(params, function(err, data){
			callback(peer.id, err, data);
		});
		subIds.push({subId: subId, peerId: peer.id});
	});
	return subIds;
};

DiyaSelector.prototype.auth = function(user, password, callback, timeout){
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


///////////////////////////////////////////////
/*
d1.connect("ws://partneringportal.fr/api");
d1.connect("ws://10.42.0.1:1234");

d1("RobotOne").auth("admin", "pass");

d1("RobotOne").request({
	service: "timer",
	func: "SubscribeTimer"
}, function(err, data){

});

d1("cofely.*").install("libmayartc");
d1("cofely.*").update("diya-node");
d1("cofely.*").updateAll("diya-node");

var rtc = d1("cofely.d1p1").rtc()
	.use("ctrl.info", onInfoNeuron)
	.use("ctrl.force", onForceNeuron)
	.onclose(onclose)

rtc.connect();
rtc.close();
*/
