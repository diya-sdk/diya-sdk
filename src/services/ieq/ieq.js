/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

/**
   Todo :
   check err for each data
   improve API : getData(sensorName, dataConfig)
   return adapted vector for display with D3 to reduce code in IHM ?
   updateData(sensorName, dataConfig)
   set and get for the different dataConfig params

*/

DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var util = require('util');


var Message = require('../message');

/**
 *	callback : function called after model updated
 * */
function IEQ(selector){
	var that = this;
	this.selector = selector;
	this.dataModel={};


	/*** structure of data config ***
		 criteria :
		 time:
		 beg: {[null],time} (/ means most recent) // stored a UTC in ms (num)
		 end: {[null], time} (/ means most oldest) // stored as UTC in ms (num)
		 robot: {ArrayOf ID or ["all"]}
		 place: {ArrayOf ID or ["all"]}
		 operator: {[last], max, moy, sd} -( maybe moy should be default
		 ...

		 sensors : {[null] or ArrayOf SensorName}

		 sampling: {[null] or int}
	*/
	this.dataConfig = {
		criteria: {
			time: {
				beg: null,
				end: null
			},
			robot: null,
			place: null
		},
		operator: 'last',
		sensors: null,
		sampling: null //sampling
	};

	return this;
};
/**
 * Get dataModel :
 * {
 *	time: [FLOAT, ...],
 *	"senseurXX": {
 *			data:[FLOAT, ...],
 *			qualityIndex:[FLOAT, ...],
 *			range: [FLOAT, FLOAT],
 *			unit: string,
 *		label: string
 *		},
 *	 ... ("senseursYY")
 * }
 */
IEQ.prototype.getDataModel = function(){
	return this.dataModel;
};
IEQ.prototype.getDataRange = function(){
	return this.dataModel.range;
};

/**
 * @param {Object} dataConfig config for data request
 * if dataConfig is define : set and return this
 *	 @return {IEQ} this
 * else
 *	 @return {Object} current dataConfig
 */
IEQ.prototype.DataConfig = function(newDataConfig){
	if(newDataConfig) {
		this.dataConfig=newDataConfig;
		return this;
	}
	else
		return this.dataConfig;
};
/**
 * TO BE IMPLEMENTED : operator management in DN-IEQ
 * @param  {String}	 newOperator : {[last], max, moy, sd}
 * @return {IEQ} this - chainable
 * Set operator criteria.
 * Depends on newOperator
 *	@param {String} newOperator
 *	@return this
 * Get operator criteria.
 *	@return {String} operator
 */
IEQ.prototype.DataOperator = function(newOperator){
	if(newOperator) {
		this.dataConfig.operator = newOperator;
		return this;
	}
	else
		return this.dataConfig.operator;
};
/**
 * Depends on numSamples
 * @param {int} number of samples in dataModel
 * if defined : set number of samples
 *	@return {IEQ} this
 * else
 *	@return {int} number of samples
 **/
IEQ.prototype.DataSampling = function(numSamples){
	if(numSamples) {
		this.dataConfig.sampling = numSamples;
		return this;
	}
	else
		return this.dataConfig.sampling;
};
/**
 * Set or get data time criteria beg and end.
 * If param defined
 *	@param {Date} newTimeBeg // may be null
 *	@param {Date} newTimeEnd // may be null
 *	@return {IEQ} this
 * If no param defined:
 *	@return {Object} Time object: fields beg and end.
 */
IEQ.prototype.DataTime = function(newTimeBeg,newTimeEnd){
	if(newTimeBeg || newTimeEnd) {
		this.dataConfig.criteria.time.beg = newTimeBeg.getTime();
		this.dataConfig.criteria.time.end = newTimeEnd.getTime();
		return this;
	}
	else
		return {
			beg: new Date(this.dataConfig.criteria.time.beg),
			end: new Date(this.dataConfig.criteria.time.end)};
};
/**
 * Depends on robotIds
 * Set robot criteria.
 *	@param {Array[Int]} robotIds list of robot Ids
 * Get robot criteria.
 *	@return {Array[Int]} list of robot Ids
 */
IEQ.prototype.DataRobotIds = function(robotIds){
	if(robotIds) {
		this.dataConfig.criteria.robot = robotIds;
		return this;
	}
	else
		return this.dataConfig.criteria.robot;
};
/**
 * Depends on placeIds
 * Set place criteria.
 *	@param {Array[Int]} placeIds list of place Ids
 * Get place criteria.
 *	@return {Array[Int]} list of place Ids
 */
IEQ.prototype.DataPlaceIds = function(placeIds){
	if(placeIds) {
		this.dataConfig.criteria.placeId = placeIds;
		return this;
	}
	else
		return this.dataConfig.criteria.place;
};
/**
 * Get data by sensor name.
 *	@param {Array[String]} sensorName list of sensors
 */
IEQ.prototype.getDataByName = function(sensorNames){
	var data=[];
	data.push(this.dataModel['time']);
	for(var n in sensorNames) {
		data.push(this.dataModel[sensorNames[n]]);
	}
	return data;
};
/**
 * Update data given dataConfig.
 * @param {func} callback : called after update
 * TODO USE PROMISE
 */
IEQ.prototype.updateData = function(callback, dataConfig){
	var that=this;
	if(dataConfig)
		this.DataConfig(dataConfig);
//	console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "ieq",
		func: "DataRequest",
		data: {
			type:"splReq",
			dataConfig: that.dataConfig
		}
	}, function(dnId, err, data){
		if(err) {
			console.log("Recv err: "+err);
			return;
		}
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			console.log("UpdateData:\n"+JSON.stringify(data.header.dataConfig));
			console.log("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
			return;
		}
		//console.log(JSON.stringify(that.dataModel));
		that._getDataModelFromRecv(data);

		//console.log(that.getDataModel());

		callback = callback.bind(that); // bind callback with IEQ
		callback(that.getDataModel()); // callback func
	});
	/** TODO USE PROMISE ? */
};

IEQ.prototype._isDataModelWithNaN = function() {
	var dataModelNaN=false;
	var sensorNan;
	for(var n in this.dataModel) {
		sensorNan = this.dataModel[n].data.reduce(function(nanPres,d) {
			return nanPres && isNaN(d);
		},false);
		dataModelNaN = dataModelNaN && sensorNan;
		console.log(n+" with nan : "+sensorNan+" ("+dataModelNaN+") / "+this.dataModel[n].data.length);
	}
};

IEQ.prototype.getConfinementLevel = function(){
	return this.confinement;
};

IEQ.prototype.getAirQualityLevel = function(){
	return this.airQuality;
};

IEQ.prototype.getEnvQualityLevel = function(){
	return this.envQuality;
};

/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
IEQ.prototype._getDataModelFromRecv = function(data){
	var dataModel=this.dataModel;
	/*\
	  |*|
	  |*|  utilitaires de manipulations de chaînes base 64 / binaires / UTF-8
	  |*|
	  |*|  https://developer.mozilla.org/fr/docs/Décoder_encoder_en_base64
	  |*|
	  \*/
	/** Decoder un tableau d'octets depuis une chaîne en base64 */
	var b64ToUint6 = function(nChr) {
		return nChr > 64 && nChr < 91 ?
			nChr - 65
			: nChr > 96 && nChr < 123 ?
			nChr - 71
			: nChr > 47 && nChr < 58 ?
			nChr + 4
			: nChr === 43 ?
			62
			: nChr === 47 ?
			63
			:	0;
	};
	/**
	 * Decode base64 string to UInt8Array
	 * @param  {String} sBase64		base64 coded string
	 * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
	 * @return {Uint8Array}				tab of decoded bytes
	 */
	var base64DecToArr = function(sBase64, nBlocksSize) {
		var
		sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
		nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
		buffer = new ArrayBuffer(nOutLen), taBytes = new Uint8Array(buffer);

		for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
			nMod4 = nInIdx & 3; /* n mod 4 */
			nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
					taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;
			}
		}
		// console.log("u8int : "+JSON.stringify(taBytes));
		return buffer;
	};

	var arrayFromBuffer = function(data) {
		/* decode data to Float32Array*/
		var buf = base64DecToArr(data.vals, data.byteCoding);
		var fArray=null;
		if(data.byteCoding===4)
			fArray = new Float32Array(buf);
		else if (data.byteCoding===8)
			fArray = new Float64Array(buf);

		if(data.size != fArray.length) console.log("Mismatch of size "+data.size+" vs "+fArray.length);
		var tab = new Array(data.size);
		/* update nb of samples stored */
		for(var i in fArray) {
			tab[parseInt(i)]=fArray[i]; /* keep first val - name of column */
		}
		return tab;
	};


	if(data && data.header) {
		for (var n in data) {
			if(n != "header" && n != "err") {

				if(data[n].err && data[n].err.st>0) {
					console.log(n+" was in error: "+data[n].err.msg);
					continue;
				}

				// console.log(n);
				if(!dataModel[n]) {
					dataModel[n]={};
					dataModel[n].data={};
				}
				/* update data range */
				dataModel[n].range=data[n].range;
				/* update data label */
				dataModel[n].label=data[n].label;
				/* update data unit */
				dataModel[n].unit=data[n].unit;
				/* update data indexRange */
				dataModel[n].qualityConfig={
					/* confortRange: data[n].confortRange, */
					indexRange: data[n].indexRange
				};
				//					console.log("data : "+JSON.stringify(data[n]));
				if(data[n].data.vals.length > 0)
					dataModel[n].data = arrayFromBuffer(data[n].data);
				else {
					if(data[n].data.size != 0) console.log("Size mismatch received data (no data versus size="+data[n].data.size+")");
					dataModel[n].data = [];
				}
				if(data[n].time.vals.length > 0)
					dataModel[n].time = arrayFromBuffer(data[n].time);
				else {
					if(data[n].time.size != 0) console.log("Size mismatch received data (no data versus size="+data[n].time.size+")");
					dataModel[n].time = [];
				}
				if(data[n].index.vals.length > 0)
					dataModel[n].qualityIndex = arrayFromBuffer(data[n].index);
				else {
					if(data[n].index.size != 0) console.log("Size mismatch received data (no data versus size="+data[n].index.size+")");
					dataModel[n].qualityIndex = [];
				}
				if(data[n].robotId.vals.length > 0)
					dataModel[n].robotId = arrayFromBuffer(data[n].robotId);
				else {
					if(data[n].robotId.size != 0) console.log("Size mismatch received data (no data versus size="+data[n].robotId.size+")");
					dataModel[n].robotId = [];
				}
				if(data[n].placeId.vals.length > 0)
					dataModel[n].placeId = arrayFromBuffer(data[n].robotId);
				else {
					if(data[n].placeId.size != 0) console.log("Size mismatch received data (no data versus size="+data[n].placeId.size+")");
					dataModel[n].placeId = [];
				}
				// dataModel[n].data = Array.from(fArray);
				//console.log('mydata '+JSON.stringify(dataModel[n].data));
			}
		}
	}
	else {
		console.log("No Data to read or header is missing !");
	}
	return this.dataModel;
};

/** create IEQ service **/
DiyaSelector.prototype.IEQ = function(){
	var ieq = new IEQ(this);
	return ieq;
};
