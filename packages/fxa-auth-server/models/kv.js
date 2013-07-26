/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (P, kvstore, config) {

  var KV = kvstore(config)

  function KVPromise(config) {
    this.kv = KV.connect(config)
  }

  function callback(d, err, value) {
    return err ? d.reject(err) : d.resolve(value)
  }

  KVPromise.prototype.get = function(key) {
    var d = P.defer()
    this.kv.get(key, callback.bind(null, d))
    return d.promise
  }

  KVPromise.prototype.set = function(key, value) {
    var d = P.defer()
    this.kv.set(key, value, callback.bind(null, d))
    return d.promise
  }

  KVPromise.prototype.cas = function(key, value, casid) {
    var d = P.defer()
    this.kv.cas(key, value, casid, callback.bind(null, d))
    return d.promise
  }

  KVPromise.prototype.delete = function(key) {
    var d = P.defer()
    this.kv.delete(key, callback.bind(null, d))
    return d.promise
  }

  KVPromise.prototype.close = function() {
    var d = P.defer()
    this.kv.close(callback.bind(null, d))
    return d.promise
  }

  KVPromise.prototype.ping = function() {
    var d = P.defer()
    this.kv.ping(callback.bind(null, d))
    return d.promise
  }

  return {
    cache: new KVPromise({ backend: config.kvstore.cache }),
    store: new KVPromise({ backend: config.kvstore.backend })
  }
}
