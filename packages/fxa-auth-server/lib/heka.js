const os = require('os');
const heka = require('heka');

const HOSTNAME = os.hostname();
const PID = process.pid;

var conf = {
	sender: {
		factory: './senders:udpSenderFactory',
		hosts: 'localhost',
		ports: 4880
	},
	logger: 'picl-idp',
	severity: 5
};

var client = heka.clientFromJsonConfig(JSON.stringify(conf));

module.exports = {
	ops: function (event) {
		client.heka(
			'ops',
			{
				timestamp: new Date(event.timestamp),
				severity: 6,
				fields: {
					rss: event.proc.mem.rss,
					heapTotal: event.proc.mem.heapTotal,
					heapUsed: event.proc.mem.heapUsed,
					uptime: event.proc.uptime
				},
				pid: PID,
				hostname: HOSTNAME
			}
		);
	}
};
