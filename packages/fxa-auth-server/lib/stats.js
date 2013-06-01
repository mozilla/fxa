const os = require('os');
const Heka = require('heka');
const Statsd = require('node-statsd').StatsD;

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

var statsd = new Statsd(
	{
		host: '127.0.0.1',
		port: 8125
	}
);

module.exports = {
	ops: function (event) {

		statsd.gauge('rss', event.proc.mem.rss);
		statsd.gauge('heapTotal', event.proc.mem.heapTotal);
		statsd.gauge('heapUsed', event.proc.mem.heapUsed);

		// When we send stats with heka it will look like this:
		//
		// heka.heka(
		// 	'ops',
		// 	{
		// 		timestamp: new Date(event.timestamp),
		// 		severity: 6,
		// 		fields: {
		// 			rss: event.proc.mem.rss,
		// 			heapTotal: event.proc.mem.heapTotal,
		// 			heapUsed: event.proc.mem.heapUsed,
		// 			uptime: event.proc.uptime
		// 		},
		// 		pid: PID,
		// 		hostname: HOSTNAME
		// 	}
		// );
	}
};
