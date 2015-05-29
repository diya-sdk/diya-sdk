DiyaSelector = require('../../DiyaSelector').DiyaSelector;

DiyaSelector.prototype.time = function(loop, callback){
	if(loop){
		this.subscribe({
			service: 'timer',
			func: 'SubscribeTimer',
		}, callback);
	}else{
		this.request({
			service: 'timer',
			func: 'GetTime'
		}, callback);
	}
	return this;
};
