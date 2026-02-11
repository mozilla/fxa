/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/**
 * This script allows us to see the distinct query parameter values being
 * sent to FxA, which can be useful in several scenarios.
 *
 * - Reverse engineering legacy query parameter usage
 * - Figuring out which parameters always accompany one another
 * - Trouble shooting end user issues
 * - Finding variation in parameter naming
 * - Finding realistic set of values provided for a query parameter
 * - Debugging user reported issues where a distinct specific parameter is known.
 *
 * */

const fs = require('node:fs');

if (process.argv[2] === 'help') {
  console.log(`


Usage
=====

> node createQueryParamSets.cjs $logfilePath $urlFilter

- $logfilePath: A single column csv of incoming requests (ie urls)
- $urlFilter:   A regular expression that will be applied to each url. Only matches will be processed.


Example
=======

This script is analyzes incoming FxA requests to better understand external interactions and the query
parameters being provided.

To use this script, go to our bigquery logs, and query the requests table for requestUrl. For example
the following query will look at incoming requests to oauth sign in:


    SELECT distinct httpRequest.requestUrl
    FROM requests -- NOTE! Adjust table name. It'll be prefixed with moz-fx-fxa...
    WHERE
      TIMESTAMP_TRUNC(_PARTITIONTIME, DAY) = TIMESTAMP("2025-04-01")
      and httpRequest.requestUrl is not null
      and (
        httpRequest.requestUrl like 'https://accounts.stage.mozaws.net/oauth/signin%'
      )
      LIMIT 10000

Once the results are downloaded as a csv on the local machine, run the script on the downloaded file
and filter a couple client ids.

    > node createQueryParamSets.cjs ~/Downloads/bq_777.csv "client_id=(abc|123)"

After executing this, the result will be written to the console and all distinct query parameters will be
shown.
  `);
  return;
}

const pathToCsv = process.argv[2];
const queryFilter = new RegExp(process.argv[3] || '.*');

console.log('Processing file at: ', pathToCsv);

const body = fs.readFileSync(pathToCsv).toString();

const params = {};
body.toString().split('\n')
  .filter(x => queryFilter.test(x))
  .flatMap(x => x.split(/\?|&/))
  .filter(x => !x.startsWith('https'))
  .map(x => x.split(/=/))
  .forEach(x => {
    if (x.length >= 2) {
      const k = x.slice(0,1);
      const v = x.slice(1).join('=');

      if (v) {
        if (!params[k]) {
          params[k] = new Set();
        }
        params[k].add(v);
      }
    }
  });

console.log(params)
