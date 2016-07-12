## Firefox Accounts GeoDB Repo for Geolocation based services
Provides a wrapper around [node-maxmind] (https://github.com/runk/node-maxmind) for getting the location data in an easy-to-read format.

### Getting started
Install the module by running `npm install fxa-geodb --save`. Then, include the module in your source file, like so:

```JavaScript
var geoDb = require('fxa-geodb')();
```

You can also pass other `options` like the path to the database to the `require` statement, like so:

```JavaScript
var geoDb = require('fxa-geodb')({
	dbPath: 'cities-db.mmdb' // Defaults to fxa-geodb/db/cities-db.mmdb
});
```

--
### API
The function returns a promise that may either resolve (on successful finding of location data) or reject (if either the ip was invalid, or location data could not be found). Call the function, like so:

```JavaScript
geoDb(ip).then(function (location) {
        // success, resolved
        // location data is available here
      }, function (err) {
        // rejected :(
        // Uh-oh error
      });
```

On successful resolution of the promise, the `location` object has the following data:

```JavaScript
accuracy: 'accuracy-radius-in-km', // 5 (number)
city: 'human-readable-city-name', // Mountain View
continent: 'human-readable-continent-name', // North America
country: 'human-readable-country-name', // USA
ll: {
    latitude: 'latitude-in-decimal', // 37.386 (number)
    longitude: 'longitude-in-decimal' // -122.0838 (number)
},
time_zone: 'IANA-compatible-timezone', // America/Los_Angeles
```
--

### Testing
Mocha Tests are located in the `test` subdirectory. To run the tests, call `npm test`.


--
### Code Coverage
Code coverage is provided with `Istanbul`, to run coverage, simply call `npm run-script cover`

--
### Updating
A Cron job that runs every week on Wednesday at 01:30:30 (UTC -7) updates the Geodata-DB from Maxmind. 
All you have to do while using the repo for the first time is to run `npm run-script build`, and the cron job will keep running in the background.
 
--
### Getting involved

Interested in contributing to the development of Firefox Accounts GeoDB repo?  Great! Head over to the #fxa channel on irc.mozilla.org with questions, or jump ahead and fix any of the issues we have.

Please review and understand the [Mozilla Community Participation Guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) before contributing to this project. Also, following the [commit guidelines] (https://github.com/mozilla/fxa/blob/master/CONTRIBUTING.md#git-commit-guidelines) is greatly appreciated.

--
### Submitting bugs
You can file issues here on GitHub. Please try to include as much information as you can and under what conditions you saw the issue.
 
--
### License

[MPL 2.0] (LICENSE)
