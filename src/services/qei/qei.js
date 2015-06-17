/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License. This library is distributed in the hope
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
 *  callback : function called after model updated
 * */
function IEQ(selector){
    var that = this;
    this.selector = selector;
    this.dataModel={};


    /*** structure of data config ***
	 criteria :
	    time:
	       deb: {[null],time} (/ means most recent) // stored a UTC in ms (num)
	       end: {[null], time} (/ means most oldest) // stored as UTC in ms (num)
	    robot: {ArrayOf ID or ["all"]}
	    place: {ArrayOf ID or ["all"]}
	 operator: {[last], max, moy, sd} -( maybe moy should be default
	 ...

	 sensors : {[all] or ArrayOf SensorName}

	 sampling: {[all] or int}
    */
    this.dataConfig = {
		criteria: {
		    time: {
				deb: null,
				end: null
		    },
		    robot: null,
		    place: null
		},
		operator: 'last',
		sensors: null,
		sampling: null //sampling
    };
//    this.callback = callback || function(res){}; /* callback, usually after getModel */

    return this;


    // this.selector.request({
	// service: "qei",
	// func: "DataRequest",
	// data: {
	//     type:"msgInit",
	//     dataConfig: {
	// 	operator: 'last',
	// 	sensors: {},
	// 	sampling: 1 //sampling
	//     }
	// }
    // }, function(dnId, err, data){
	// //console.log("init: data : "+JSON.stringify(data));
	//
	// // TODO : add init loop process
	//
	// if(data.header.error) {
	//     // TODO : check/use err status and adapt behavior accordingly
	//     console.log("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
	//     return;
	// }
	//
	// that._getDataModelFromRecv(data);
	// console.log(JSON.stringify(that.dataModel));
	// /** TO BE REMOVED ? */
	// /*that.updateQualityIndex();
	// that._updateLevels(that.dataModel);
	// that.callback(that.dataModel);*/
	//
	// that.timedRequest = function() {
	//     var now = new Date();
	//     var deb_time = new Date(now - 5*24*60*60*1000);
	//     console.log("now "+now+" / deb time "+deb_time);
	//
	//     that.setDataTime(deb_time,now);
	//     that.setDataSampling(null);
	//     /* that.dataConfig.criteria.time = {
	// 	deb: deb_time,
	// 	end: now
	//     };*/
	//     this.selector.request({
	// 	service: "qei",
	// 	func: "DataRequest",
	// 	data: {
	// 	    type:"splReq",
	// 	    dataConfig: that.dataConfig
	// 	}
	//     }, function(dnId, err, data){
	// 	console.log(JSON.stringify(data));
	// 	if(data.header.error) {
	// 	    // TODO : check/use err status and adapt behavior accordingly
	// 	    console.log("timedRequest:\n"+JSON.stringify(data.header.dataConfig));
	// 	    console.log("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
	// 	    return;
	// 	}
	// 	// console.log(JSON.stringify(that.dataModel));
	// 	that._getDataModelFromRecv(data);
	// 	// console.log(JSON.stringify(that.dataModel));
	//
	// 	that.updateQualityIndex();
	// 	that._updateLevels(that.dataModel);
	// 	that.callback(that.dataModel);
	//     });
	//     setTimeout(that.timedRequest,3000);
	// };
	// //setTimeout(that.timedRequest(),3000);
	//
	// /*
	//   this.selector.subscribe({
	// 	service: "qei",
	// 	func: "SubscribeQei"
	// 	}, function(res) {
	// 	that._getDataModelFromRecv(res.data);
	// 	that._updateLevels(that.dataModel);
	// 	that.callback(that.dataModel);
	// 	});
	// */
    // });
    // return this;
};
/**
 * Get dataModel :
 * {
 * 	time: [FLOAT, ...],
 * 	"senseurXX": {
 * 			data:[FLOAT, ...],
 * 			qualityIndex:[FLOAT, ...],
 * 			range: [FLOAT, FLOAT],
 * 			unit: string,
 *      label: string
 * 		},
 *   ... ("senseursYY")
 * }
 */
IEQ.prototype.getDataModel = function(){
    return this.dataModel;
};
IEQ.prototype.getDataRange = function(){
    return this.dataModel.range;
};
IEQ.prototype.updateQualityIndex = function(){
    var that=this;
    var dm = this.dataModel;

    for(var d in dm) {
	if(d=='time' || !dm[d].data) continue;

	if(!dm[d].qualityIndex || dm[d].data.length != dm[d].qualityIndex.length)
	    dm[d].qualityIndex = new Array(dm[d].data.length);

	/* default value for robotId and placeId */
	if(d=='robotId' || d=='placeId') {
	    dm[d].data.forEach(function(v,i) {
		dm[d].qualityIndex[i] = 1;
	    });
	}
    }
};

IEQ.prototype.getDataconfortRange = function(){
    return this.dataModel.confortRange;
};
IEQ.prototype.getDataConfig = function(){
    return this.dataConfig;
};
/**
 * @param {Object} dataConfig config for data request
 * @return {IEQ} this - immutable
 */
IEQ.prototype.setDataConfig = function(newDataConfig){
    this.dataConfig=newDataConfig;
    return this;
};
IEQ.prototype.getDataOperator = function(){
    return this.dataConfig.operator;
};
/**
 * TO BE IMPLEMENTED : operator management in DN-IEQ
 * @param  {String}  newOperator : {[last], max, moy, sd}
 * @return {IEQ} this - immutable
 */
IEQ.prototype.setDataOperator = function(newOperator){
    this.dataConfig.operator = newOperator;
    return this;
};
IEQ.prototype.getDataSampling = function(){
    return this.dataConfig.sampling;
};
IEQ.prototype.setDataSampling = function(numSamples){
    this.dataConfig.sampling = numSamples;
    return this;
};
IEQ.prototype.getDataTime = function(){
    return {
	deb: new Date(this.dataConfig.criteria.time.deb),
	end: new Date(this.dataConfig.criteria.time.deb)};
};
/**
 * Set data time criteria deb and end.
 *  @param {Date} newTimeDeb // may be null
 *  @param {Date} newTimeEnd // may be null
 */
IEQ.prototype.setDataTime = function(newTimeDeb,newTimeEnd){
    this.dataConfig.criteria.time.deb = newTimeDeb.getTime();
    this.dataConfig.criteria.time.end = newTimeEnd.getTime();
    return this;
};
/**
 * Get robot criteria.
 *  @return {Array[Int]} list of robot Ids
 */
IEQ.prototype.getDataRobotId = function(){
    return this.dataConfig.criteria.robotId;
};
/**
 * Set robot criteria.
 *  @param {Array[Int]} robotIds list of robot Ids
 */
IEQ.prototype.setDataRobotId = function(robotIds){
    this.dataConfig.criteria.robotId = robotIds;
    return this;
};
/**
 * Get place criteria.
 *  @return {Array[Int]} list of place Ids
 */
IEQ.prototype.getDataPlaceId = function(){
    return this.dataConfig.criteria.placeId;
};
/**
 * Set place criteria.
 *  @param {Array[Int]} placeIds list of place Ids
 */
IEQ.prototype.setDataPlaceId = function(placeIds){
    this.dataConfig.criteria.placeId = placeIds;
    return this;
};
/**
 * Get data by sensor name.
 *  @param {Array[String]} sensorName list of sensors
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
	this.setDataConfig(dataConfig);
    console.log("Request: "+JSON.stringify(dataConfig));
    this.selector.request({
	service: "qei",
	func: "DataRequest",
	data: {
	    type:"splReq",
	    dataConfig: that.dataConfig
	}
    }, function(dnId, err, data){
	if(data.header.error) {
	    // TODO : check/use err status and adapt behavior accordingly
	    console.log("UpdateData:\n"+JSON.stringify(data.header.dataConfig));
	    console.log("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
	    return;
	}
	// console.log(JSON.stringify(that.dataModel));
	that._getDataModelFromRecv(data);
	// console.log(JSON.stringify(that.dataModel));

	that.updateQualityIndex();
	that._updateLevels(that.dataModel);
	callback(that); // callback func
    });
    /** TODO USE PROMISE ? */
};



IEQ.prototype._updateConfinementLevel = function(model){
    /** check if co2 and voct are available ? */
    var co2 = model['CO2'].data[model['CO2'].data.length - 1];
    var voct = model['VOCt'].data[model['VOCt'].data.length - 1];
    var confinement = Math.max(co2, voct);

    if(confinement < 800){
	return 3;
    }
    if(confinement < 1600){
	return 2;
    }
    if(confinement < 2400){
	return 1;
    }
    if(confinement < 3000){
	return 0;
    }
    /* default */
    return 0;
};

IEQ.prototype._updateAirQualityLevel = function(confinement, model){
    var fineDustQualityIndex = model['Fine Dust'].qualityIndex[model['Fine Dust'].qualityIndex.length-1];
    var ozoneQualityIndex = model['Ozone'].qualityIndex[model['Ozone'].qualityIndex.length-1];

    var qualityIndex = fineDustQualityIndex + ozoneQualityIndex;
    if(qualityIndex < 2) return confinement - 1;
    else return confinement;
};

IEQ.prototype._updateEnvQualityLevel = function(airQuality, model){
    var humidityQualityIndex = model['Humidity'].qualityIndex[model['Humidity'].qualityIndex.length-1];
    var temperatureQualityIndex = model['Temperature'].qualityIndex[model['Temperature'].qualityIndex.length-1];

    var qualityIndex = humidityQualityIndex + temperatureQualityIndex;
    if(qualityIndex < 2) return airQuality - 1;
    else return airQuality;
};

IEQ.prototype._updateLevels = function(model){
    this.confinement = this._updateConfinementLevel(model);
    this.airQuality = this._updateAirQualityLevel(this.confinement, model);
    this.envQuality = this._updateEnvQualityLevel(this.airQuality, model);
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


var checkQuality = function(data, qualityConfig){
    var quality;
    if(data && qualityConfig) {
	if(data>qualityConfig.confortRange[1] || data<qualityConfig.confortRange[0])
	    quality=0;
	else
	    quality=1.0;
	return quality;
    }
    return 1.0;
};

/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}     [description]
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
    b64ToUint6 = function(nChr) {
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
     * @param  {String} sBase64     base64 coded string
     * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
     * @return {Uint8Array}             tab of decoded bytes
     */
    base64DecToArr = function(sBase64, nBlocksSize) {
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

    if(data && data.header) {
	//~ console.log('rcvdata '+JSON.stringify(data));
	// if(!data.header.sampling) data.header.sampling=1;

	/** case 1 : 1 value received added to dataModel - deprecated ? */
	if(data.header.sampling==1) {
	    if(data.header.timeEnd) {
		if(!dataModel.time) dataModel.time=[];
		dataModel.time.push(data.header.timeEnd);
		if(dataModel.time.length > this.sampling) {
		    dataModel.time = dataModel.time.slice(dataModel.time.length - this.sampling);
		}
	    }
	    for (var n in data) {
		if(n != "header" && n != "time") {
		    //console.log(JSON.stringify(data[n]));
		    if(!dataModel[n]) {
			dataModel[n]={};
			dataModel[n].data=[];
		    }

		    /* update data range */
		    dataModel[n].range=data[n].range;
		    /* update data label */
		    dataModel[n].label=data[n].label;
		    /* update data unit */
		    dataModel[n].unit=data[n].unit;
		    /* update data confortRange */
		    dataModel[n].qualityConfig={confortRange: data[n].confortRange};

		    if(data[n].data.length > 0) {
			/* decode data to Float32Array*/
			var buf = base64DecToArr(data[n].data, 4);
			// console.log(JSON.stringify(buf));
			var fArray = new Float32Array(buf);

			if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
			if(data[n].size != 1) console.log("Expected 1 value received :"+data[n].size);

			if(!dataModel[n].data) dataModel[n].data=[];
			dataModel[n].data.push(fArray[0]);
			if(dataModel[n].data.length > this.sampling) {
			    dataModel[n].data = dataModel[n].data.slice(dataModel[n].data.length - this.sampling);
			}
		    }
		    else {
			if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
			dataModel[n].data = [];
		    }
		    this.updateQualityIndex();
		    //~ console.log('mydata '+JSON.stringify(dataModel[n].data));
		}
	    }
	}
	else {
	    /** case 2 : history data - many values received */
	    for (var n in data) {
		if(n != "header") {
		    // console.log(n);
		    if(!dataModel[n]) {
			dataModel[n]={};
			dataModel[n].data=[];
		    }

		    /* update data range */
		    dataModel[n].range=data[n].range;
		    /* update data label */
		    dataModel[n].label=data[n].label;
		    /* update data unit */
		    dataModel[n].unit=data[n].unit;
		    /* update data confortRange */
		    dataModel[n].qualityConfig={confortRange: data[n].confortRange};

		    if(data[n].data.length > 0) {
			/* decode data to Float32Array*/
			var buf = base64DecToArr(data[n].data, 4);
			// console.log(JSON.stringify(buf));
			var fArray = new Float32Array(buf);

			if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
			// /* increase size of data if necessary */
			if(fArray.length>dataModel[n].data.length) {
			    // dataModel[n].size=data[n].size;
			    dataModel[n].data = new Array(dataModel[n].size);
			}
			/* update nb of samples stored */
			for(var i in fArray) {
			    dataModel[n].data[parseInt(i)]=fArray[i]; /* keep first val - name of column */
			}
		    }
		    else {
			if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
			dataModel[n].data = [];
		    }
		    // dataModel[n].data = Array.from(fArray);
		    // console.log('mydata '+JSON.stringify(dataModel[n].data));
		}
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
