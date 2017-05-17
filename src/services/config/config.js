/*
 * Copyright : Partnering 3.0 (2007-2016)
 * Author : Sylvain Mahé <sylvain.mahe@partnering.fr>
 *
 * This file is part of diya-sdk.
 *
 * diya-sdk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * diya-sdk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with diya-sdk.  If not, see <http://www.gnu.org/licenses/>.
 */





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

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var util = require('util');


var Message = require('../message');


//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = true;
var Logger = {
	log: function(message){
		if(DEBUG) console.log(message);
	},

	error: function(message){
		if(DEBUG) console.error(message);
	}
};

/**
 * Config API handler
 */
function Config(selector){
	var that = this;
	this.selector = selector;
	this.subscriptions = [];

	return this;
};

/**
 * List all available keys
 * @param {func} callback : called after update with params ({Array<String>} list, {Error} error)
 */
Config.prototype.list = function(callback){
	var that = this;
	this.selector.request({
		service: "configManager",
		func: "List"
	}, function(dnId, err, data){
		if(err) {
			if (typeof err =="string") Logger.error(dnId+" sent error: "+ err);
			else if (typeof err == "object" && typeof err.name =='string') {
				callback(null, err.name);
				if (typeof err.message=="string") Logger.error(dnId+" sent error: "+err.message);
			}
			return;
		}
		callback(data); // callback func
	});

};

/**
 * Set config for given key
 * @param {String} key : key to which is associated the config value
 * @param {Object} config : configuration to be stored
 */
Config.prototype.set = function(key,config){
	var that = this;
	this.selector.request({
		service: "configManager",
		func: "Set",
		data: config,
		obj: key
	}, function(dnId, err){
		if(err) {
			if (typeof err =="string") Logger.error(dnId+" sent error: "+ err);
			else if (typeof err == "object" && typeof err.name =='string') {
				if (typeof err.message=="string") Logger.error(dnId+" sent error: "+err.message);
			}
			return;
		}
	});

};


/**
 * Update internal model with received data
 * @param  key to select configuration to be watched
 * @param  callback called on answers (@param : {Object} configuration )
 */
Config.prototype.watch = function(key, callback){
	var that = this;

	var subs = this.selector.subscribe({
		service: "configManager",
		func: "Config",
		obj: key
	}, function(dnId, err, data){
		if(err) {
			if (typeof err == "string") Logger.error(dnId+" sent error: "+ err);
			else if (typeof err == "object" && typeof err.name =='string') {
				if (typeof err.message=="string") Logger.error(dnId+" sent error: "+err.message);
			}
			that.closeSubscriptions(); // should not be necessary
			that.subscriptionReqPeriod = that.subscriptionReqPeriod+1000||1000; // increase delay by 1 sec
			if(that.subscriptionReqPeriod > 300000) that.subscriptionReqPeriod=300000; // max 5min
			subs.watchTentative = setTimeout(function() {	that.watch(key,callback); }, that.subscriptionReqPeriod); // try again later
			return;
		}
		that.subscriptionReqPeriod=0; // reset period on subscription requests
		callback(data.value); // callback func
	});

	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
Config.prototype.closeSubscriptions = function(){
	for(var i in this.subscriptions) {
		this.subscriptions[i].close();
		clearTimeout(this.subscription[i].watchTentative);
	}
	this.subscriptions =[];
};



/** create Config service **/
DiyaSelector.prototype.Config = function(){
	return new Config(this);
};
