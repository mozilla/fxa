/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var kvstore = require('kvstore')
var P = require('p-promise')

module.exports = function (config, log) {

  var KV = kvstore(config)

  function KVPromise(config) {
    this.kv = KV.connect(config)
  }

  function callback(d, op, key, err, value) {
    log.trace(
      {
        op: op + '.1',
        key: key,
        err: err && err.message,
        val: !!value
      }
    )
    return err ? d.reject(err) : d.resolve(value)
  }

  KVPromise.prototype.get = function(key) {
    var d = P.defer()
    var op = 'KV.get'
    log.trace({ op: op, key: key })
    this.kv.get(key, callback.bind(null, d, op, key))
    return d.promise
  }

  KVPromise.prototype.set = function(key, value) {
    var d = P.defer()
    var op = 'KV.set'
    log.trace({ op: op, key: key })
    this.kv.set(key, value, callback.bind(null, d, op, key))
    return d.promise
  }

  KVPromise.prototype.cas = function(key, value, casid) {
    var d = P.defer()
    var op = 'KV.cas'
    log.trace({ op: op, key: key, cas: casid })
    this.kv.cas(key, value, casid, callback.bind(null, d, op, key))
    return d.promise
  }

  KVPromise.prototype.delete = function(key) {
    var d = P.defer()
    var op = 'KV.delete'
    log.trace({ op: op, key: key })
    this.kv.delete(key, callback.bind(null, d, op, key))
    return d.promise
  }

  KVPromise.prototype.close = function() {
    var d = P.defer()
    var op = 'KV.close'
    log.trace({ op: op })
    this.kv.close(callback.bind(null, d, op, null))
    return d.promise
  }

  KVPromise.prototype.ping = function() {
    var d = P.defer()
    var op = 'KV.ping'
    log.trace({ op: op })
    this.kv.ping(callback.bind(null, d, op, null))
    return d.promise
  }

  return {
    cache: new KVPromise({ backend: config.kvstore.cache }),
    store: new KVPromise({ backend: config.kvstore.backend })
  }
}
