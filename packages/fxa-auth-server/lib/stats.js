const os = require('os');
const Heka = require('heka');
//const Statsd = require('node-statsd').StatsD;

//TODO read config

const HOSTNAME = os.hostname();
const PID = process.pid;

var heka = Heka.clientFromJsonConfig(
  JSON.stringify(
    {
      sender: {
        factory: './senders:udpSenderFactory',
        hosts: '127.0.0.1',
        ports: 4880
      },
      logger: 'picl-idp',
      severity: 5
    }
  )
);

// var statsd = new Statsd(
//   {
//     host: '127.0.0.1',
//     port: 8125
//   }
// );

module.exports = {

  mem: function (usage) {
    heka.heka(
     'mem',
     {
       timestamp: new Date(),
       severity: 6,
       fields: {
         rss: usage.rss,
         heapTotal: usage.heapTotal,
         heapUsed: usage.heapUsed
       },
       pid: PID,
       hostname: HOSTNAME
     }
    );
  },

  request: function (event) {

    heka.heka(
      'request',
      {
        timestamp: new Date(event.timestamp),
        severity: 6,
        fields: {
          statusCode: event.statusCode,
          path: event.path,
          responseTime: event.responseTime
        },
        pid: PID,
        hostname: HOSTNAME
      }
    );
  }
};
