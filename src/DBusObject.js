"use strict";

const EventEmitter = require('node-event-emitter')
const DiyaSelector = require('./DiyaSelector.js').DiyaSelector


const PROPERTIES_CHANGED_SIGNAL = 'org.freedesktop.DBus.Properties.PropertiesChanged' 


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

		let object = dbusService.get(path)
		if (object == null) {
			object = new DBusObjectHandler(this._connection._d1inst, peerId, service, path)
			dbusService.set(path, object)
			//delete dbus object when no one uses it anymore
			object.once('release', () => dbusService.delete(path))
		}

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

		this._propertiesChangedCallback = null
		this._propertiesChangedWatchers = new Set()

		this._signalHandlers = new Map()

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

	onSignal (signal, callback) {
		let signalHandler = this._signalHandlers.get(signal)

		//if no signalHandler is registered for this signal,
		//register one, and do the actual subscription to remote
		//server
		if (signalHandler == null) {
			let [iface, member] = this._extractIface (signal)

			signalHandler = this._d1inst(this._peerId).subscribe({
				service: this.service,
				func: member,
				obj: {
					interface: iface,
					path: this.objPath
				}
			}, (peerId, err, data) => {
				//notify clients when a signal is received
				this.emit(signal, err != null ? err : data)
			})

			this._signalHandlers.set(signal, signalHandler)
		}

		this.on (signal, callback)
	}

	removeSignalListener (signal, callback) {
		this.removeListener (signal, callback)

		//if there are other listeners on this signal, do noting
		if (this.listeners(signal).length > 0) {
			return 
		}

		//else, try to close the subscription to that signal
		let signalHandler = this._signalHandlers.get(signal)
		if (signalHandler == null) {
			return 
		}

		signalHandler.close ()
		this._signalHandlers.delete(signal)
	}

	watchProperties (context) {
		if (this._propertiesChangedCallback == null) {
			this._propertiesChangedCallback = data => this._onPropertiesChanged (data)
			this.onSignal (PROPERTIES_CHANGED_SIGNAL, this._propertiesChangedCallback)
		}
	
		this._propertiesChangedWatchers.add (context)
	}

	unwatchProperties (context) {
		this._propertiesChangedWatchers.delete (context)

		//if no one listen for properties, remove listener on property changes (object's properties will not be updated anymore)
		if (this._propertiesChangedWatchers.size <= 0 && this._propertiesChangedCallback != null) {
			this.removeSignalListener (PROPERTIES_CHANGED_SIGNAL, this._propertiesChangedCallback)
			this._propertiesChangedCallback = null
		}
	}


	call (method, args, callback) {
		let iface
		[iface, method] = this._extractIface(method)
			
		this._d1inst(this._peerId).request({
			service: this.service,
			func: method,
			obj: {
				path: this.objPath,
				interface: iface
			},
			data: args
		}, callback)
	}

	get (iface, propName) {
		this.call('org.freedesktop.DBus.Properties.Get', {
			interface: iface, //systemd devs are fucktard that don't follow their own fucking standard !
			interface_name: iface,
			property_name: propName
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

		this.call('org.freedesktop.DBus.Properties.GetAll', {
			interface: iface, //systemd devs are fucktard that don't follow their own fucking standard !
			interface_name: iface,
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

		this.emit ('properties-changed', simpleIface, changedProperties, invalidatedProperties)
	}
	
	_extractIface (member) {
		let iface = member.split('.')
		member = iface[iface.length - 1]
		iface.pop()
		iface = iface.join('.')
	
		return [iface, member]
	}
}
