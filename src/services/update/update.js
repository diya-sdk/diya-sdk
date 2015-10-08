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

/* Goal : to know if an apt is running within the diya-node 
		via the res.lockStatus
*/
DiyaSelector.prototype.statusUpdate = function(SubID,callback){
	
	
	this.subscribe({
			service: 'update',
			func: 'SubscribeUpdateStatus'
		}, 
		function(peerId, error, res){
			callback(peerId,error,res);
		},{auto:true, subIds:SubID});

};

/* Goal : provide list of packages in data.packages 
			where each package is defined by
			data.packages[i].name 
			data.packages[i].version 
 			data.packages[i].status
*/
DiyaSelector.prototype.listPackages = function(callback){

	this.request({
		service: 'update',
		func: 'ListPackages'
	}, function(peerId, error, data){
		if(data) 
			callback(null,data); 
		if(error)
			callback(error,null);
		
	}); 
};

/* Goal : apply an apt-get update 
	return in error: statusError and infoOut (contain the return of apt-get update)
	return in data: log (contain the return of apt-get update)
*/
DiyaSelector.prototype.updateAll = function(callback){

	this.request({
		service: 'update',
		func: 'UpdateAll'
	}, function(peerId, error, data){
		if(data)
			callback(null,data); 
		if(error)
			callback(error,null);
	}); 
};

/* Goal : apply an apt-get update and dist-upgrade
	return in error: statusError and infoOut (contain the return of apt-get update)
	return in data: log (contain the return of apt-get update)
					packages (list of Diya packages, each package contain :
								[i].name [i].version [i].status)
*/
	
DiyaSelector.prototype.upgradeAll = function(callback){

	this.request({
		service: 'update',
		func: 'UpgradeAll'
	}, function(peerId, error, data){
		if(data)
			callback(null,data); 
		if(error)
			callback(error,null);
	}); 
};

/* Goal : apply an apt-get update and dist-upgrade
	return in error: statusError and infoOut (contain the return of apt-get update)
	return in data: log (contain the return of apt-get update)
					packages (contain one package information : .name .version .status)
*/
	
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
						callback(null,data); 
				if(error)
					callback(error,null);
		
			});
		}
	}
	
};

/* Goal : apply an apt-get update and dist-upgrade
	return in error: statusError and infoOut (contain the return of apt-get update)
	return in data: log (contain the return of apt-get update)
					packages (contain one package information : .name .version .status)
*/
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
						callback(null,data); 
				if(error)
					callback(error,null);	
				
			});
		}
	}
	
};
		
