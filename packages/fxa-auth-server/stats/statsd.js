module.exports = function (inherits, Statsd, Stats) {
  function StatsdStats(options) {
    Stats.call(this)
    this.client = new Statsd(
      {
        host: options.host,
        port: options.port
      }
    )
  }
  inherits(StatsdStats, Stats)

  StatsdStats.prototype.mem = function (usage) {
    this.client.gauge('rss', usage.rss)
    this.client.gauge('heapTotal', usage.heapTotal)
    this.client.gauge('heapUsed', usage.heapUsed)
  }

  StatsdStats.prototype.request = function () {
    //TODO
  }

  return StatsdStats
}
