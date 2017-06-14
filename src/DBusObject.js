"use strict";

let EventEmitter = require('node-event-emitter')
let DiyaSelector = require('./DiyaSelector.js').DiyaSelector

DiyaSelector.prototype.dbusObject = function (service, path, partialObject, signals) {
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
			dbusService.set(path, new DBusObjectHandler(this._connection._d1inst, peerId, service, path, signals))
		}
		let object = dbusService.get(path)

		object.importPartialObject(partialObject)
		object.importSignals(signals)

		objects.push(object)
	})

	return objects
}

class DBusObjectHandler extends EventEmitter {

	constructor (d1inst, peerId, service, path, signals) {
		super()

		this.objPath = path
		this.service = service
		this._signals = signals
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

	importSignals (signals) {
		if (signals == null) {
			return
		}
		this._signals = signals
		this.subscribeToSignals()
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
		console.log(`Subscribe to property changes`)
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

	subscribeToSignals() {
		console.log(`subscribeToSignals , signals = ${JSON.stringify(this._signals)}, this._subscriptions = ${this._subscriptions}`)
		if (this._signals == null) return
		if (this._subscriptions == null) this._subscriptions = new Map()
		this._signals.forEach(obj => {
			if (this._subscriptions.get(obj.id) != null) {
				console.warn(`Already subscribed, signal ${obj.id}`)
				return
			} // refuse duplicate subscriptions
			let subscription = this._d1inst(this._peerId).subscribe({
				service: this.service,
				func: obj.name,
				obj: {
					interface: obj.iface,
					path: obj.objectPath,
				}
			}, (peerId, err, data) => {
				if (err) {
					console.error('subscribeToSignals', obj, err)
					return
				}
				this.emit(obj.id, Array.isArray(data) ? data[0] : data) // event 'id' is emitted instead of 'name' because signal's names may be duplicate
			})
			this._subscriptions.set(obj.id, subscription)
		})

	}

}
