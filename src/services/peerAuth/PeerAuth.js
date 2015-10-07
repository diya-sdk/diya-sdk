var DiyaSelector = require('../../DiyaSelector').DiyaSelector;



/**
 * Make the selected DiyaNodes join an existing DiyaNodes Mesh Network by contacting
 * the given bootstrap peers.
 * 
 * NOTE : If bAuthenticate = true, this operation requires root role 
 * 
 * @param bootstrap_peers : an array of bootstrap peers to contact to join the Network
 * @param bAuthenticate : if true, authenticate and offer public key to the bootstrap peers
 */
DiyaSelector.prototype.join = function(bootstrap_peers, bAuthenticate, callback){
	if(typeof bootstrap_peers === 'string') bootstrap_peers = [ bootstrap_peers ];
	if(bootstrap_peers.constructor !== 'Array') throw "join() : bootstrap_peers should be an array of peers URIs";

	if(bAuthenticate) {
		return this.givePublicKey(function(joining_peer, err, data){
			Logger.error("YOUPI !! " + data.keys().join(","));
			var public_key = data.public_key;
			d1(bootstrap_peers).addTrustedPeer(joining_peer, public_key, function(peerId, err, data) {
				
			});
		});
	} else {
		this.request(
			{service : 'meshNetwork', func: 'Join', data: { bootstrap_peers: bootstrap_peers }}, 
			function(peerId, err, data) {callback(peerId, err, data);}
		);
	}
};


/**
 * Ask the selected DiyaNodes for their public keys
 */
DiyaSelector.prototype.givePublicKey = function(callback){
	return this.request(
		{ service: 'peerAuth',	func: 'GivePublicKey',	data: {} }, 
		function(peerId, err, data){callback(peerId,err,data);
	}); 
};

/**
 * Add a new trusted peer RSA public key to the selected DiyaNodes
 * NOTE : This operation requires root role
 * 
 * @param name : the name of the new trusted DiyaNode peer
 * @param public_key : the RSA public key of the new trusted DiyaNode peer
 */
DiyaSelector.prototype.addTrustedPeer = function(name, public_key, callback){
	return this.request(
		{ service: 'peerAuth',	func: 'AddTrustedPeer',	data: {} }, 
		function(peerId, err, data){callback(peerId,err,data);
	});
};

