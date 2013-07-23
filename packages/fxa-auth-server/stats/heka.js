
module.exports = function (Heka) {
  function HekaStats(options) {
    this.client = Heka.clientFromJsonConfig(
      JSON.stringify(
        {
          sender: {
            factory: './senders:udpSenderFactory',
            hosts: options.host,
            ports: options.port
          },
          logger: 'picl-idp',
          severity: 5
        }
      )
    );
  }

  HekaStats.prototype.mem = function (usage) {
    this.client.heka(
      'mem',
      {
        timestamp: new Date(),
        severity: 6,
        fields: {
          rss: usage.rss,
          heapTotal: usage.heapTotal,
          heapUsed: usage.heapUsed
        },
        pid: this.pid,
        hostname: this.hostname
      }
    );
  };

  HekaStats.prototype.request = function (event) {
    this.client.heka(
      'request',
      {
        timestamp: new Date(event.timestamp),
        severity: 6,
        fields: {
          statusCode: event.statusCode,
          path: event.path,
          responseTime: event.responseTime
        },
        pid: this.pid,
        hostname: this.hostname
      }
    );
  };

  return HekaStats;
};
