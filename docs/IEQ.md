diya-sdk v1.x - IEQ
===================


## IEQ API

The IEQ API allows to request data or subscribe to data from the IEQ
service available on diya-node server instances.

When the IEQ API is to be used, an IEQ singleton should be
instantiated with ```d1(selector).IEQ()```.  This singleton is the
handler to perform the different requests to the diya-node server.

A client can subscribe once or several times to different data
channels with ```watch()```. The subscription can be parameterized to
select only some of sensors and the time range.

The selection of the sensors is based on tags associated to data :
Available tags are :
- 'ieq': all ieq data
- 'sensor': raw sensors
- 'index': built quality indexes
A callback provide the result formatted in a model containing the
different received data (see Reference).


In order to reset subscriptions, ```closeSubscriptions()``` will close
all subscriptions.

Data can also be requested with the ```getCSVData()``` function. The data
on 7 days starting from the ```firstDay``` parameter are exported and
available in the callback.


### References

#### d1(selector).IEQ()

- Returns: ```<Object>``` IEQ handler



#### d1(selector).IEQ().watch(data, callback)

- **data** ```<Object>```
	- **[cat]** ```String``` optional filter on requested sensors. Default is 'ieq'.
	- **[timeRange]** ```String:{'minutes','hours','days','weeks','months'}``` Filter to keep only data in time range : i.e. period between now and 1 timeRange. Ex: data on the past minute.
- **callback** ```<Function>``` callback
	- **dataModel** ```<Object>``` model filled with the received IEQ data
		- **Sensor1** <Object>
			- **time** < Array<float> > array of timestamps. The items are synchronised by index in array between the different following arrays (first item in time with first item in avg.d for instance, etc.)
			- **avg** <Object>
				- **d** < Array<float> > array of averaged data value
				- **i** < Array<float> > array of averaged quality estimation (%)
			- **max** < Array<float> > array of max on averaging time window
			- **min** < Array<float> > array of min on averaging time window
			- **stddev** < Array<float> > array of standard deviation on averaging time window
			- **x** < Array<float> > array of x positions
			- **y** < Array<float> > array of y positions
			- **precision** <float> accuracy of data value
			- **unit** <String> unit of data value
			- **category** < String> comma separated list of tags ('ieq','sensor','index')
			- **range** < Array<float> > [min possible value, max possible value]
			- **timeRange** < Array<float> > [begin time, end time] for the received data
			- **label** <String> a label naming the sensor. deprecated, use i18n file to display name of sensor.
			- **data** <Object> array of data value. Mainly duplicate of avg.d. deprecated.
			- **qualityIndex** < Array<float> > array of quality index, duplicate of avg.i, deprecated
			- **placeId** < Array<int> > array of place indexes, deprecated
			- **trend** <String> not implemented
			- **zoomRange** < Array<float> > not implemented
		- ...
		- **Sensorn**
			- ...

#### d1(selector).IEQ().closeSubscriptions()


#### d1(selector).IEQ().getCSVData(sensorNames,firstDay,callback)

- **sensorNames** ```< null | Array<String> >``` list of sensors to request. Default is null i.e. all available sensors.
- **firstDay** ```< String | <Javascript Date> >``` beginning date of the exported data. The String must follow a parsable date format in ```new Date(string)```, for instance : ```'2016-01-01 12:00:12'```
- **callback** ```<Function>``` callback
	- **dataModel** ```<Object>``` model filled with the received IEQ data
		- **Sensor1** <Object>
			- **time** < Array<float> > array of timestamps. The items are synchronised by index in array between the different following arrays (first item in time with first item in avg.d for instance, etc.)
			- **avg** <Object>
				- **d** < Array<float> > array of averaged data value
				- **i** < Array<float> > array of averaged quality estimation (%)
			- **max** < Array<float> > array of max on averaging time window
			- **min** < Array<float> > array of min on averaging time window
			- **stddev** < Array<float> > array of standard deviation on averaging time window
			- **x** < Array<float> > array of x positions
			- **y** < Array<float> > array of y positions
			- **precision** <float> accuracy of data value
			- **unit** <String> unit of data value
			- **category** < String> comma separated list of tags ('ieq','sensor','index')
			- **range** < Array<float> > [min possible value, max possible value]
			- **timeRange** < Array<float> > [begin time, end time] for the received data
			- **label** <String> a label naming the sensor. deprecated, use i18n file to display name of sensor.
			- **data** <Object> array of data value. Mainly duplicate of avg.d. deprecated.
			- **qualityIndex** < Array<float> > array of quality index, duplicate of avg.i, deprecated
			- **placeId** < Array<int> > array of place indexes, deprecated
			- **trend** <String> not implemented
			- **zoomRange** < Array<float> > not implemented
		- ...
		- **Sensorn**
			- ...



## Example


```
// Upon new selection of diya-node

// close all existing subscription before changing selection of diya-node
if(this.ieq_handler) this.ieq_handler.closeSubscriptions();

// instantiate new ieq handler with new selector
this.ieq_handler = d1(this.selector).IEQ();

// subscribe to 'ieq' data on past hour (default configuration)
this.ieq_handler.watch({}, function(data) {
	try {
		// data contains the received data
		console.log(data);

		/** bind data or extract sensor from data for binding with web
		components for display **/

	}
	catch(e) { console.error(e); }
});

```
