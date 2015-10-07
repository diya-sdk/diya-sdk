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
	if(bootstrap_peers.constructor !== Array) throw "join() : bootstrap_peers should be an array of peers URIs";

	if(bAuthenticate) {
		ERR("Request public key to " + this._select());
		return this.givePublicKey(function(joining_peer, err, data){
			if(err) ERR("The PeerAuth service is not running on " + joining_peer);
			else {
					ERR("Add trusted peer " + joining_peer + " with public key <p style='font-size:8px'>" + data.public_key + "</p>");
					d1(bootstrap_peers).addTrustedPeer(joining_peer, data.public_key, function(peerId, err, data) {
					});
			}
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
		{ service: 'peerAuth',	func: 'AddTrustedPeer',	data: { name: name, public_key: public_key } },
		function(peerId, err, data) {
			if(err) ERR(err);
			else {
				alert(Object.keys(data));
				alert("ok " + data.peerName);
				callback(peerId,err,data);
			}
		}
	);
};


/**
 * Check if the selected DiyaNodes trust the given peers
 * @param peers : an array of peer names
 */
DiyaSelector.prototype.areTrusted = function(peers, callback){
	return this.request(
		{ service: 'peerAuth',	func: 'AreTrusted',	data: { peers: peers } },
		function(peerId, err, data) {
			var allTrusted = data.trusted;
			if(allTrusted) ERR(peers + " are trusted by " + peerId);
			else ERR("Some peers in " + peers + " are untrusted by " + peerId);
		}
	);
};
