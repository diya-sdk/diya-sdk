var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');
var Q = require('q');


d1.knownPeers = function() {
	var deferred = Q.defer();
	d1("#self").request({service: 'meshNetwork',func: 'ListKnownPeers'}, function(peerId, err, data){
		if(err) return deferred.reject(err);
		var peers = [];
		for(var i=0; i<data.peers.length; i++) peers.push(data.peers[i].name);
		return deferred.resolve(peers);
	});
	return deferred.promise;
};
d1.kp = d1.knownPeers;
