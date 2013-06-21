const os = require('os');

module.exports = function (log) {

  function Stats() {
    this.hostname = os.hostname();
    this.pid = process.pid;
  }

  Stats.prototype.mem = function (usage) {
    log.info(usage);
  };

  Stats.prototype.request = function (event) {
    log.info(
      {
        code: event.statusCode,
        path: event.path,
        ms: event.responseTime
      }
    );
  };

  return Stats;
};
