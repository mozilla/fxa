const inherits = require('util').inherits;
const Statsd = require('node-statsd').StatsD;

module.exports = function (Stats) {
  function StatsdStats(host, port) {
    Stats.call(this);
    this.client = new Statsd(
      {
        host: host,
        port: port
      }
    );
  }
  inherits(StatsdStats, Stats);

  StatsdStats.prototype.mem = function (usage) {
    this.client.gauge('rss', usage.rss);
    this.client.gauge('heapTotal', usage.heapTotal);
    this.client.gauge('heapUsed', usage.heapUsed);
  };

  StatsdStats.prototype.request = function () {
    //TODO
  };

  return StatsdStats;
};