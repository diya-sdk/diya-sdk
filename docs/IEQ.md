diya-sdk v1.x - IEQ
===================


## IEQ API

The Indoor Environment Quality (IEQ) API allows fetching and subscribing to
air quality data streams available in various diya network nodes.

When the IEQ API is to be used, an IEQ handler should be
instantiated with the ```d1(selector).IEQ()``` call. The
handler allows to perform the different requests to the diya-node server.
This handler should be unique in the application (application wide object).

A client can subscribe once or several times to different data
channels with the ```IEQ.watch``` method. The subscription can be parameterized to
select the time range. Depending on the time range, data will be averaged on different time units :
- minute: raw data
- hour: data averaged by minutes on the last hour
- day: data averaged by hours on the last day
- week: data averaged by hours on the last week
- month: data averaged by days on the last month
- year: data averaged by weeks on the last year

A callback will provide one with the result formatted in a model containing relevant
data (see Reference).


In order to end all running subscriptions, use the ```IEQ.closeSubscriptions``` method.

Data can also be requested with the ```IEQ.getCSVData``` method.


### References

#### d1(selector).IEQ()

- Returns: ```<Object>``` IEQ handler



#### d1(selector).IEQ().watch(data, callback)

- **data** ```<Object>```
	- **[timeRange]** ```String:{'minutes','hours','days','weeks','months'}``` Filter to keep only data in time range : i.e. period between now and 1 timeRange. Ex: data on the past minute.
	- **[robots]** ```Array<String>``` Default is undefined: data are aggregated across robots. Array is a list of robot name (ex: D1R00015) which will be selected and exported.
- **callback** ```<Function>``` callback
	- **dataModel** ```<Object>``` model filled with the received IEQ data
		- **Sensor 1** ```<Object>```
			- **time** ```< Array<float> >``` array of timestamps. The items are synchronised by index in array between the different following arrays (first item in time with first item in avg.d for instance, etc.)
			- **avg** ```<Object>```
				- **d** ```< Array<float> >``` array of averaged data value
				- **i** ```< Array<float> >``` array of averaged quality estimation (%)
			- **max** ```<Object>```
				- **d** ```< Array<float> >``` array of max data value
				- **i** ```< Array<float> >``` array of max quality estimation (%)
			- **min** ```<Object>```
				- **d** ```< Array<float> >``` array of min data value
				- **i** ```< Array<float> >``` array of min quality estimation (%)
			- **stddev** ```<Object>```	not implemented yet
				- **d** ```< Array<float> >``` array of stddev data value
				- **i** ```< Array<float> >``` array of stddev quality estimation (%)
			- **robotId** ```< Array<int> >``` array of robots, each item correspond to an item in time and thus tags the sample by the name of the robot which captured the data
			- **x** ```< Array<float> >``` array of x positions
			- **y** ```< Array<float> >``` array of y positions
			- **precision** ```<float>``` accuracy of data value
			- **unit** ```<String>``` unit of data value
			- **category** ```< String>``` comma separated list of tags ('ieq' : all ieq sensors,'sensor': raw sensors,'index': built quality indexes)
			- **range** ```< Array<float> >``` [min possible value, max possible value]
			- **timeRange** ```< Array<float> >``` [begin time, end time] for the received data
			- **label** ```<String>``` a label naming the sensor. deprecated, use i18n file to display name of sensor.
			- **data** ```<Object>``` array of data value. Mainly duplicate of avg.d. deprecated.
			- **qualityIndex** ```< Array<float> >``` array of quality index, duplicate of avg.i, deprecated
			- **placeId** ```< Array<int> >``` array of place indexes, deprecated
			- **trend** ```<String>``` not implemented
			- **zoomRange** ```< Array<float> >``` not implemented
		- ...
		- **Sensor n**
			- ...


### d1(selector).IEQ().closeSubscriptions()


#### d1(selector).IEQ().getCSVData(csvConfig,callback)

- **csvConfig**
	- **sensorNames** ```< null | Array<String> >``` list of sensors to request. Default is null i.e. all available sensors.
	- **nlines** ```< undefined | number >``` max number of lines to be fetched
	- **startTime** ```< String | <Javascript Date> >``` beginning date of the exported data. The String must follow a parsable date format in ```new Date(string)```, for instance : ```'2016-01-01 12:00:12'```
	- **endTime** ```< String | <Javascript Date> >``` end date of the exported data. The String must follow a parsable date format in ```new Date(string)```, for instance : ```'2016-01-01 12:00:12'```
	- **timeSample** ```< 'second' | string >``` select which table to take data from according to sampling time : one of ```{'second','minute','hour','day','week','month'}```
- **callback** ```<Function>``` callback
	- **file** ```< String >``` path to download generated csv file


## Example


### Example 1 : default subscription
```js
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
		/** Example of output
		"Confinement":{
			"range":[0,1],
			"timeRange":[1483917420000,1483917420000],
			"label":"Confinement",
			"unit":" ",
			"precision":1,
			"category":"ieq,index",  			// confinement is a built quality index
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":1},
			"time":[1483917420000], 			// only 1 sample was sent. At subscription start, data on the whole range of time are sent (see example below)
			"data":[1],
			"qualityIndex":[1],
			"robotId":null,"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{						// only avg is currently sent for indexes
				"d":[1],
				"i":[1]},
			"trend":"mss"},
		"Temperature":{
			"range":[0,50],
			"timeRange":[1483917420000,1483917420000],
			"label":"Température",
			"unit":"°C",
			"precision":0.1,				// values should be rounded with a 0.1 precision
			"category":"ieq,sensor",			// temperature is a raw ieq sensor
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":4},
			"time":[1483917420000],				// only 1 sample was sent
			"data":[0],
			"qualityIndex":[0],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[0],
				"i":[0]},
			"min":{
				"d":[0],
				"i":[0]},
			"max":{
				"d":[0],
				"i":[0]},
			"trend":"mss"},
		"AirQuality":{
			"range":[0,1],
			"timeRange":[1483917420000,1483917420000],
			"label":"Qualité d'air",
			"unit":" ",
			"precision":1,
			"category":"ieq,index",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":1},
			"time":[1483917420000],
			"data":[0.25],
			"qualityIndex":[0.25],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[0.25],
				"i":[0.25]},
			"trend":"mss"},
		"Humidity":{
			"range":[0,100],
			"timeRange":[1483917420000,1483917420000],
			"label":"Humidité",
			"unit":"%",
			"precision":1,
			"category":"ieq,sensor",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":4},
			"time":[1483917420000],
			"data":[0],
			"qualityIndex":[0],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[0],
				"i":[0]},
			"min":{
				"d":[0],
				"i":[0]},
			"max":{
				"d":[0],
				"i":[0]},
			"trend":"mss"},
		"EnvQuality":{
			"range":[0,1],
			"timeRange":[1483917420000,1483917420000],
			"label":"Qualité d'environnement",
			"unit":" ",
			"precision":1,
			"category":"ieq,index",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":1},
			"time":[1483917420000],
			"data":[0],
			"qualityIndex":[0],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[0],
				"i":[0]},
			"trend":"mss"},
		"CO2":{
			"range":[0,4000],
			"timeRange":[1483917420000,1483917420000],
			"label":"CO2",
			"unit":"ppm",
			"precision":50,
			"category":"ieq,sensor",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":4},
			"time":[1483917420000],
			"data":[0],
			"qualityIndex":[1],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[0],
				"i":[1]},
			"min":{
				"d":[0],
				"i":[1]},
			"max":{
				"d":[0],
				"i":[1]},
			"trend":"mss"},
		"VOCt":{
			"range":[0,4],
			"timeRange":[1483917420000,1483917420000],
			"label":"COVt",
			"unit":"ppm",
			"precision":0.05,
			"category":"ieq,sensor",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":4},
			"time":[1483917420000],
			"data":[0],
			"qualityIndex":[1],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[0],
				"i":[1]},
			"min":{
				"d":[0],
				"i":[1]},
			"max":{
				"d":[0],
				"i":[1]},
			"trend":"mss"},
		"FineDust":{
			"range":[0,300],
			"timeRange":[1483917420000,1483917420000],
			"label":"Particules",
			"unit":"µg/m³",
			"precision":0.1,
			"category":"ieq,sensor",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":4},
			"time":[1483917420000],
			"data":[0],
			"qualityIndex":[1],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[0],
				"i":[1]},
			"min":{
				"d":[0],
				"i":[1]},
			"max":{
				"d":[0],
				"i":[1]},
			"trend":"mss"},
		"Ozone":{
			"range":[0,200],
			"timeRange":[1483917420000,1483917420000],
			"label":"Ozone",
			"unit":"ppb",
			"precision":10,
			"category":"ieq,sensor",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":4},
			"time":[1483917420000],
			"data":[120.06878662109375],
			"qualityIndex":[0.25],
			"robotId":null,
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[120.06878662109375],
				"i":[0.25]},
			"min":{
				"d":[120.06900024414062],
				"i":[0.25]},
			"max":{
				"d":[120.06900024414062],
				"i":[0.25]},
			"trend":"mss"}}
		**/

		/** bind data or extract sensor from data for binding with web
		components for display **/

	}
	catch(e) { console.error(e); }
});

```



### Example 2 : subscription with time range defined
```js
// Upon new selection of diya-node

// close all existing subscription before changing selection of diya-node
if(this.ieq_handler) this.ieq_handler.closeSubscriptions();

// instantiate new ieq handler with new selector
this.ieq_handler = d1(this.selector).IEQ();

// subscribe to 'ieq' data on past day
var timeRange = 'day';
this.ieq_handler.watch({timeRange:timeRange}}, function(data) {
	try {
		// data contains the received data
		console.log(data);
		/** example of output
		{"Confinement":{
			"range":[0,1],
			"timeRange":[1483916400000,1483833600000],
			"label":"Confinement",
			"unit":" ",
			"precision":1,
			"category":"ieq,index",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":1},
			"time":[1483833600000,1483837200000,1483909200000,1483912800000,1483916400000], 	// 5 samples corresponding to 5 different hours on the past day. Note timestamps are in ms.
			"data":[1,1,1,1,1],
			"qualityIndex":[1,1,1,1,1],
			"robotId":null,
			"placeId":null,
			"x":[0,0,0,0,0],
			"y":[0,0,0,0,0],
			"avg":{
				"d":[1,1,1,1,1],
				"i":[1,1,1,1,1]},
			"trend":"mss"},
		"Temperature":{
			"range":[0,50],
			"timeRange":[1483833600000,1483916400000],
			"label":"Température",
			"unit":"°C",
			"precision":0.1,
			"category":"ieq,sensor",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":4},
			"time":[1483916400000,1483912800000,1483909200000,1483837200000,1483833600000],
			"data":[22.4,22.4,22.4,22.4,22.4],
			"qualityIndex":[1,1,1,1,1],
			"robotId":null,
			"placeId":null,
			"x":[0,0,0,0,0],
			"y":[0,0,0,0,0],
			"avg":{
				"d":[22.4,22.5,22.4,22.3,22.3],
				"i":[1,1,1,1,1]},
			"min":{
				"d":[22.1,22.2,22.1,22.2,22.2],
				"i":[1,1,1,1,1]},
			"max":{
				"d":[22.5,22.6,22.6,22.4,22.4],
				"i":[1,1,1,1,1]},
			"trend":"mss"}
		...
		**/
		/** bind data or extract sensor from data for binding with web
		components for display **/

	}
	catch(e) { console.error(e); }
});

```

### Example 3 : selection of robot
```js
// Upon new selection of diya-node

// close all existing subscription before changing selection of diya-node
if(this.ieq_handler) this.ieq_handler.closeSubscriptions();

// instantiate new ieq handler with new selector
this.ieq_handler = d1(this.selector).IEQ();

// subscribe to 'ieq' data on past day
var timeRange = 'day';
this.ieq_handler.watch({timeRange:timeRange, robots: ['D1R00015']}}, function(data) {
	try {
		// data contains the received data
		console.log(data);
		/** Example of output
		{
		"Confinement":{
			"range":[0,1],
			"timeRange":[1484091180000,1484091180000],
			"label":"Confinement",
			"unit":" ",
			"precision":1,
			"category":"ieq,index",
			"zoomRange":[0,100],
			"qualityConfig":{"indexRange":1},
			"time":[1484091180000],
			"data":[1],
			"qualityIndex":[1],
			"robotId":["D1R00015"],   // Only 1 item from D1R00015
			"placeId":null,
			"x":[0],
			"y":[0],
			"avg":{
				"d":[1],
				"i":[1]},
			"trend":"mss"},
		...
		**/

	}
	catch(e) { console.error(e); }
});

```


### Example 4 : get history of data (like in CSV export)

```js

this.ieq_handler.getCSVData({sensorNames: ['Temperature','Ozone'], startTime: '2016-01-01 12:12:12'}, function(filename) {
	var downloadPath = 'https://partnering-cloud.com/files/'+filename;

	// Name of sensor is case sensitive. Check names as fields from output examples above.
	// NB using null or undefined instead of array of sensor names will export all available sensors
	try {
		// file name to download data
		console.log(downloadPath);
	}
	catch(e) { console.error(e); }
});

```
