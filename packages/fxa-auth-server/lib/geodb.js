/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config').get('geodb')
var geodb = require('fxa-geodb')(config.dbPath)
var P = require('./promise')
var ACCURACY_MAX_KM = 200
var ACCURACY_MIN_KM = 25

/**
* Thin wrapper around geodb, to help log the accuracy
* and catch errors. On success, returns an object with
* `location` data. On failure, returns an empty object
**/
module.exports = function (log) {

  log.info({ op: 'geodb.start', enabled: config.enabled, dbPath: config.dbPath })

  return function (ip) {
    // this is a kill-switch and can be used to not return location data
    if (config.enabled === false) {
      // if kill-switch is set, return a promise that resolves
      // with an empty object
      return new P.resolve({})
    }
    return geodb(ip)
      .then(function (location) {
        var logEventPrefix = 'fxa.location.accuracy.'
        var logEvent = 'no_accuracy_data'
        var accuracy = location.accuracy

        if (accuracy) {
          if (accuracy > ACCURACY_MAX_KM) {
            logEvent = 'unknown'
          } else if (accuracy > ACCURACY_MIN_KM && accuracy <= ACCURACY_MAX_KM) {
            logEvent = 'uncertain'
          } else if (accuracy <= ACCURACY_MIN_KM) {
            logEvent = 'confident'
          }
        }

        log.info({op: 'geodb.accuracy', 'accuracy': accuracy})
        log.info({op: 'geodb.accuracy_confidence', 'accuracy_confidence': logEventPrefix + logEvent})
        return {
          location: {
            city: location.city,
            country: location.country
          },
          timeZone: location.timeZone
        }
      }).catch(function (err) {
        log.error({ op: 'geodb.1', err: err.message})
        // return an empty object, so that we can still send out
        // emails without the location data
        return {}
      })
  }
}
