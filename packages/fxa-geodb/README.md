## Firefox Accounts GeoDB Repo for Geolocation based services
Provides a wrapper around [node-maxmind] (https://github.com/runk/node-maxmind) for getting the location data in an easy-to-read format.

### Getting started
Clone/fork the repo and run `npm i`. Then, include the module in your source file, like so:

```JavaScript
var GeoDB = require('./fxa-geodb');
```
--
### API
The function returns a promise that may either resolve (on successful finding of location data) or reject (if either the ip was invalid, or location data could not be found). Call the function, like so:

```JavaScript
GeoDB(ip).then(function (location) {
		// success, resolved
		// location data is available here
      }, function (err) {
      	// rejected :(
      	// Uh-oh error
      });
```

If you want to pass a custom timestamp to the function, do like so:
```JavaScript
GeoDB(ip, timestamp).then(function (location) {
		// success, resolved
		// location data is available here
      }, function (err) {
      	// Uh-oh error
      });
```
where `timestamp` can be any JavaScript compatible representation of time.

On successful resolution of the promise, the `location` object has the following data:

```JavaScript
accuracy: 'accuracy-radius-in-km', // 5
city: 'human-readable-city-name', // Mountain View
continent: 'human-readable-continent-name', // North America
country: 'human-readable-country-name', // USA
local_time: '(mm or dd)/(mm or dd)/yyyy hh:mm:ss' based on locale and timezone,
ll: {
	latitude: 'latitude-in-decimal', // 37.386
	longitude: 'longitude-in-decimal' // -122.0838
},
time_zone: 'IANA-compatible-timezone', // America/Los_Angeles 
// 6/22/2016, 5:36:40 PM for USA, tz-LA
```
--

### Testing
Mocha Tests are provided inside `test/fxa-geodb.js`. To run the tests, simply call `npm test`.

--
### Code Coverage
Code coverage is provided with `Istanbul`, to run coverage, simply call `npm run-script cover`

--
### Updating
A Cron job that runs every week on Wednesday at 1:30:30 AM updates the Geodata-DB from Maxmind. 
All you have to do while using the repo for the first time is to run `npm run-script build`, and the 
 cron job will keep running in the background.
 