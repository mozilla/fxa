/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../../promise')
const request = require('request').defaults({ json: true, strictSSL: true })

function post(opts, args) {
  var dfd = P.defer()

  opts.body = args
  opts.progress = opts.progress || Function.prototype

  opts.progress('POSTing to', opts.url, opts.headers['accept-language'])

  request.post(opts, function(err, res, body) {
    if (err) {
      return dfd.reject(err)
    }

    if (res.statusCode !== 200) {
      err = new Error('Non 200 response: ' + res.statusCode)
      err.res = res
      return dfd.reject(err)
    }

    opts.progress(('POST complete', res.req.path, res.req._headers['accept-language']))

    res.body = body
    dfd.resolve(res)
  })

  return dfd.promise
}

var getDefaults = {
  // if false, do not retry if incomplete
  retry: true,

  // retry polling interval
  interval: 2000,

  // function to test if response is complete
  complete: function() { return true },

  // callback to report progress
  progress: Function.prototype,

  // maximum time to wait for completed request
  timeout: 30000
}

function get(options) {
  var opts = extend(getDefaults, options)
  opts._startTime = opts._startTime || Date.now()

  return get_internal(opts)
    .then(
      function(result) {

        if (!opts.complete || opts.complete(result)) {
          return result.body
        }

        var age = Date.now() - opts._startTime
        if (age > opts.timeout) {
          opts.progress('Timeout; rejecting')
          var err = new Error('Timeout getting 3 messages for ' + opts.url)
          return err
        }

        var dfd = P.defer()

        if (opts.retry) {
          opts.progress('Retrying', opts.url)
          setTimeout(function () {
            get(opts)
              .done(dfd.resolve, dfd.reject)
          }, opts.interval)
        }

        return dfd.promise
      }
    )
}

function get_internal(options) {
  var dfd = P.defer()

  options.progress('Starting GET for', options.url)

  request.get(options, function(err, res, body) {
    if (err) {
      return dfd.reject(err)
    }

    if (res.statusCode !== 200) {
      err = new Error('Non 200 response: ' + res.statusCode)
      err.res = res
      return dfd.reject(err)
    }

    res.body = body
    return dfd.resolve(res)
  })

  return dfd.promise
}

function extend(defaults, options) {
  Object.keys(defaults).forEach(function(key) {
    if (!options[key]) {
      options[key] = defaults[key]
    }
  })
  return options
}

module.exports = {
  get: get,
  post: post
}
