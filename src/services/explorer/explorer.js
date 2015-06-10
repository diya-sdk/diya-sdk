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
DiyaSelector = require('../../DiyaSelector').DiyaSelector;

function explorer(node){
	var that = this;
	this.node = node;
	return this;
}
/*
DiyaSelector.prototype.explorer = function(file, callback){
	if (file){
		this.request({
			service: 'explorer',
			func: 'OpenFile',
			data: file=file,
		}, function(data){
				if(data.file){
					callback(null,data.file);
				}
				else if(data.error){
					callback(data.error, null);
				}
			}
		);
	}
	else{
		this.request({
			service: 'explorer',
			func: 'ListFiles',
		}, function(data){
	     		if(data){
					callback(null,data);
				}
				else if(data.error){
					callback(data.error, null);
				}
			}
		);
	}
	return this;
};*/

explorer.prototype.listFiles = function(callback){
	this.request({
		service: 'explorer',
		func: 'ListFiles',
	}, function(data){
     		if(data){
				callback(null,data);
			}
			else if(data.error){
				callback(data.error, null);
			}
		}
	);
	return this;
};

explorer.prototype.OpenFile = function(file,callback){
		this.request({
			service: 'explorer',
			func: 'OpenFile',
			data: file=file,
		}, function(data){
				if(data.file){
					callback(null,data.file);
				}
				else if(data.error){
					callback(data.error, null);
				}
			}
		);
	return this;
};



DiyaSelector.prototype.explorer = function(){
	return new explorer(this);
};


var exp = {
		explorer: explorer
}

module.exports = exp;
