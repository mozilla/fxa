## Firefox Accounts GeoDB Repo for Geolocation based services
Provides a wrapper around [node-maxmind] (https://github.com/runk/node-maxmind) for getting the location data in an easy-to-read format.

### Getting started
Clone/fork the repo and run `npm i`. Then, include the module in your source file, like so:

```
var GeoDB = require('./fxa-geodb');
```
--
### API
The function returns a promise that may either resolve (on successful finding of location data) or reject (if either the ip was invalid, or location data could not be found). Call the function, like so:

```
GeoDB(ip).then(function (location) {
		// success, resolved
		// location data is available here
      }, function (err) {
      	// rejected :(
      	// Uh-oh error
      });
```

On successful resolution of the promise, the `location` object has the following data:

```JSON
country: 'human-readable-country-name', // USA
city: 'human-readable-city-name', // Mountain View
continent: 'human-readable-continent-name', // North America
ll: {
	latitude: 'latitude-in-decimal', // 37.386
	longitude: 'longitude-in-decimal' // -122.0838
},
time_zone: 'IANA-compatible-timezone', // America/Los_Angeles
local_time: '(mm or dd)/(mm or dd)/yyyy hh:mm:ss' based on locale and timezone, 
// 6/22/2016, 5:36:40 PM for USA, tz-LA

```
--

### Testing
Mocha Tests are provided inside `test/fxa-geodb.js`. To run the tests, simply call `npm test`.

--
### Code Coverage
Code coverage is provided with `Istanbul`, to run coverage, simply call `npm run-script cover`

--
