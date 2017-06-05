"use strict";

let EventEmitter = require('node-event-emitter')
let DiyaSelector = require('./DiyaSelector.js').DiyaSelector

DiyaSelector.prototype.dbusObject = function (service, path, partialObject) {
	let objects = []

	this.each(peerId => {
		let store = this._connection.store.get(peerId)
		if (store.get('dbus') == null) {
			store.set('dbus', new Map())
		}
		let dbus = store.get('dbus')
		
		if (dbus.get(service) == null) {
			dbus.set(service, new Map())
		}
		let dbusService = dbus.get(service)

		if (dbusService.get(path) == null) {
			dbusService.set(path, new DBusObjectHandler(this._connection._d1inst, peerId, service, path))
		}
		let object = dbusService.get(path)

		object.importPartialObject(partialObject)

		objects.push(object)
	})

	return objects
}


class DBusObjectHandler extends EventEmitter {

	constructor (d1inst, peerId, service, path) {
		super()

		this.objPath = path
		this.service = service
		this._d1inst = d1inst
		this._peerId = peerId

		this._getAllDone = {}
	}

	importPartialObject (partialObject) {
		if (partialObject == null) {
			return 
		}

		for (let iface in partialObject) {
			this._onPropertiesChanged ([iface, partialObject[iface], []])
		}
	}

	get (iface, propName) {
		this._d1inst(this._peerId).request({
			service: this.service,
			func: 'Get',
			obj: {
				interface: 'org.freedesktop.DBus.Properties',
				path: this.objPath
			},
			data: {
				interface: iface, 
				property: propName
			}
		}, (peerId, err, data) => {
			if (err) {
				//TODO : handle error
				console.error(err)
			} else {
				let res = {}
				res[propName] = data
				this._onGetAll(iface, res)
			}
		})

	}

	getAll (iface, force) {
		//by default, prevent one to run get all more than once (that shouldn't be useful if PropertiesChanged does its job
		if (!force && this._getAllDone[iface]) {
			return 
		}
		this._getAllDone[iface] = true

		this._d1inst(this._peerId).request({
			service: this.service,
			func: 'GetAll',
			obj: {
				interface: 'org.freedesktop.DBus.Properties',
				path: this.objPath
			},
			data: {
				interface: iface 
			}
		}, (peerId, err, data) => {
			if (err) {
				//TODO : handle error
				console.error(err)
			} else {
				this._onGetAll(iface, data)
			}
		})
	}

	_onGetAll (iface, data) {
		if (data == null) {
			return
		}
	
		this._onPropertiesChanged([iface, data, []])
	}

	initPropertiesChangedSignal () {
		if (this._subProperties != null) return 

		this._subProperties = this._d1inst(this._peerId).subscribe({
			service: this.service,
			func: 'PropertiesChanged',
			obj: {
				interface: 'org.freedesktop.DBus.Properties',
				path: this.objPath
			}
		}, (peerId, err, data) => {
			if (err) {
				//TODO : handle error
			} else {
				this._onPropertiesChanged(data)
			}
		})
	}

	_onPropertiesChanged (data) {
		if (!Array.isArray(data) || data.length !== 3) {
			return 
		}

		let iface = data[0]
		let changedProperties = data[1]
		let invalidatedProperties = data[2]
		
		let simpleIface = iface.split('.')
		simpleIface = simpleIface[simpleIface.length - 1]

		if (this[simpleIface] == null) {
			this[simpleIface] = {}
		}

		for (let propName in changedProperties) {
			this[simpleIface][propName] = changedProperties[propName]
		}

		invalidatedProperties.forEach(propName => {
			this[simpleIface][propName] = null
		})

		this.emit('properties-changed', simpleIface, changedProperties, invalidatedProperties)
	}
}
