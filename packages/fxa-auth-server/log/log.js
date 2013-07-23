
module.exports = function (bunyan) {

  function createLog(config) {
    var logStreams = [
      {
        type: 'rotating-file',
        level: config.log.level,
        path: config.log.path,
        period: config.log.period,
        count: config.log.count
      },
      {
        type: 'raw',
        level: 'trace',
        stream: new bunyan.RingBuffer({ limit: 100 })
      }
    ]

    if (config.env !== 'production') {
      logStreams.push({ stream: process.stderr, level: 'trace' });
    }

    const log = bunyan.createLogger(
      {
        name: 'picl-idp',
        streams: logStreams
      }
    )

    log.info(config, "starting config")

    return log
  }

  return createLog
}
