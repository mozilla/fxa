## Firefox Accounts GeoDB Repo for Geolocation based services

Provides a wrapper around [node-maxmind](https://github.com/runk/node-maxmind) for getting the location data in an easy-to-read format.

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

The function returns a location object
or throws if the ip was invalid
or location data could not be found.
Call the function like so:

```JavaScript
try {
  const location = geoDb(ip);
  // Use location...
} catch (err) {
  // Handle err
}
```

The `location` object has the following properties:

- `accuracy`: Accuracy radius in km (number)
- `city`: Human readable city name (string)
- `state`: Human readable state name (string)
- `stateCode`: ISO 3166-2 state code (string)
- `country`: Human readable country name (string)
- `countryCode`: ISO 3166-1 alpha-2 country code (string)
- `continent`: Human readable continent name (string)
- `timeZone`: IANA tz database timezone (string)
- `latLong`: An object containing two properties:
  - `latitude`: Latitude (number)
  - `longitude`: Longitude (number)

For example:

```js
{
  accuracy: 5,
  city: 'Mountain View',
  state: 'California',
  stateCode: 'CA',
  country: 'United States',
  countryCode: 'US',
  continent: 'North America',
  timeZone: 'America/Los_Angeles'
  latLong: {
    latitude: 37.3885,
    longitude: -122.0741
  }
}
```

A working example is provided in the `examples` directory.

--

### Testing

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will test all files under `test/`.

Test specific tests with the following commands:

```bash
# Test only src/test/lib/sentry.spec.ts
npx mocha test/fxa-geodb.js

# Grep for "setupDownloadList"
npx mocha /test/** -g "setupDownloadList"
```

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

--

### Code Coverage

Code coverage is provided with `nyc`, to run coverage, call `npm run-script cover`

--

### Updating

A Cron job is provided in `lib/maxmind-db-downloader`, that can be configured and run like so:

```JavaScript
  var maxmindDbDownloader = new MaxmindDbDownloader();
  var targetDirPath = maxmindDbDownloader.createTargetDir('db-name');
  var downloadPromiseFunctions = maxmindDbDownloader.setupDownloadList(
    path.join(__dirname, '..','path-to-sources-file'),
    targetDirPath
  );
  maxmindDbDownloader.setupAutoUpdate('30 30 1 * * 3', downloadPromiseFunctions);
```

By default, the cron job runs every week on Wednesday at 01:30:30 (UTC -7) and updates the Geodata-DB from Maxmind.

--

### Getting involved

Interested in contributing to the development of Firefox Accounts GeoDB repo? Great! Head over to the [#fxa:mozilla.org](https://chat.mozilla.org/#/room/#fxa:mozilla.org) room on Matrix with questions, or jump ahead and fix any of the issues we have.

Please review and understand the [Mozilla Community Participation Guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) before contributing to this project. Also, following the [commit guidelines](https://github.com/mozilla/fxa/blob/master/CONTRIBUTING.md#git-commit-guidelines) is greatly appreciated.

UPDATE: On March 2020, Mozilla moved from IRC to Matrix. For more information on Matrix, check out the following wiki article: <https://wiki.mozilla.org/Matrix>.

--

### Submitting bugs

You can file issues here on GitHub. Please try to include as much information as you can and under what conditions you saw the issue.

--

### Attribution

This product includes GeoLite2 data created by MaxMind, available from
<a href="http://www.maxmind.com">http://www.maxmind.com</a>.

--

### Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)

--

### License

[MPL 2.0](LICENSE)
