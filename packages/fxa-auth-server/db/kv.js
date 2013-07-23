module.exports = function (P, kvstore) {

  var KV = null

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

  function create(config) {
    KV = kvstore(config)
    return {
      cache: new KVPromise({ backend: config.kvstore.cache }),
      store: new KVPromise({ backend: config.kvstore.backend })
    }
  }

  return create
}
