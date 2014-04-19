/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('request')
var P = require('./promise')

module.exports = function requestp(options) {
  var d = P.defer()
  var r = (typeof(options) === 'string') ? { url: options, method: 'GET'} : options
  request(
    r,
    function (err, res, body) {
      if (!err && Math.floor(res.statusCode / 100) === 2) {
        return d.resolve(body)
      }
      d.reject({ error: err, statusCode: res.statusCode, body: body })
    }
  )
  return d.promise
}
