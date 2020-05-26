/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../config').get('geodb');
const geodb = require('../../fxa-geodb')(config);
const ACCURACY_MAX_KM = 200;
const ACCURACY_MIN_KM = 25;

// Force the geo to load and run at startup, not waiting for it to run on
// some route later.
const knownIp = '63.245.221.32'; // Mozilla MTV
geodb(knownIp);

/**
 * Thin wrapper around geodb, to help log the accuracy
 * and catch errors. On success, returns an object with
 * `location` data. On failure, returns an empty object
 **/
module.exports = (log) => {
  log.info('geodb.start', { enabled: config.enabled, dbPath: config.dbPath });

  return (ip) => {
    if (config.enabled === false) {
      return {};
    }

    try {
      const location = geodb(ip);
      const accuracy = location.accuracy;
      let confidence = 'fxa.location.accuracy.';

      if (accuracy > ACCURACY_MAX_KM) {
        confidence += 'unknown';
      } else if (accuracy > ACCURACY_MIN_KM && accuracy <= ACCURACY_MAX_KM) {
        confidence += 'uncertain';
      } else if (accuracy <= ACCURACY_MIN_KM) {
        confidence += 'confident';
      } else {
        confidence += 'no_accuracy_data';
      }

      if (config.logAccuracy) {
        log.info('geodb.accuracy', { accuracy });
        log.info('geodb.accuracy_confidence', {
          accuracy_confidence: confidence,
        });
      }

      return {
        location: {
          city: location.city,
          country: location.country,
          countryCode: location.countryCode,
          state: location.state,
          stateCode: location.stateCode,
        },
        timeZone: location.timeZone,
      };
    } catch (err) {
      log.error('geodb.1', { err: err.message });
      return {};
    }
  };
};
