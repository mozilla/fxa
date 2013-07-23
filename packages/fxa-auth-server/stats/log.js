
module.exports = function (log) {
  function LogStats() {
    this.log = log
  }

  LogStats.prototype.mem = function (usage) {
    this.log.info(usage)
  }

  LogStats.prototype.request = function (event) {
    this.log.info(
      {
        code: event.statusCode,
        path: event.path,
        ms: event.responseTime
      }
    )
  }

  return LogStats
}
