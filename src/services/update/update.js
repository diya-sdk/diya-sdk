/* maya-client
 *
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

var util = require('util');

 
DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var Message = require('../message');

DiyaSelector.prototype.statusUpdate = function(SubID,callback){
	
	
	this.subscribe({
			service: 'update',
			func: 'SubscribeUpdateStatus'
		}, 
		function(peerId, error, res){
			callback(peerId,error,res);
			console.log(res.lockStatus);
		},{auto:true, subIds:SubID});

};

DiyaSelector.prototype.listPackages = function(callback){

	this.request({
		service: 'update',
		func: 'ListPackages'
	}, function(peerId, error, data){
		if(data.packages) 
			callback(null,data.packages); 
		if(error)
			callback(error,null);
		
	}); 
};
	
DiyaSelector.prototype.updateAll = function(callback){

	this.request({
		service: 'update',
		func: 'UpdateAll'
	}, function(peerId, error, data){
		if(data)
			if(data.packages) 
				callback(null,data.packages); 
		if(error)
			callback(error,null);
	}); 
};
	
DiyaSelector.prototype.installPackage = function(pkg, callback){
		
	if ((pkg === 'Undefined') || (typeof pkg !== 'string') || (pkg.length < 2)){
		callback('undefinedPackage',null);
	}
	else {
	
		var INVALID_PARAMETERS_REGEX = /^-|[^\s]\s+[^\s]|-$/;
		var testNamePkg= INVALID_PARAMETERS_REGEX.test(pkg);
		if (testNamePkg)
			callback("InvalidParameters",null);
		else{
				
			this.request({
				service: 'update',
				func: 'InstallPackage',
				data:{
					package: pkg,
				}
			}, function(peerId, error, data){
				if(data)
					if(data.packages) 
						callback(null,data.packages); 
				if(error)
					callback(error,null);
		
			});
		}
	}
	
};

DiyaSelector.prototype.removePackage = function(pkg, callback){
		
	if ((pkg === 'Undefined') || (typeof pkg !== 'string') || (pkg.length < 2)){
		callback('undefinedPackage',null);
	}
	else {
	
		var INVALID_PARAMETERS_REGEX = /^[+ -]|[^\s]\s+[^\s]|[+ -]$/;
		var testNamePkg= INVALID_PARAMETERS_REGEX.test(pkg);
		if (testNamePkg)
			callback("InvalidParameters",null);
		else{
				
			this.request({
				service: 'update',
				func: 'RemovePackage',
				data:{
					package: pkg,
				}
			}, function(peerId, error, data){
				if (data)
					if(data.packages) 
						callback(null,data.packages); 
				if(error)
					callback(error,null);	
				
			});
		}
	}
	
};
		
