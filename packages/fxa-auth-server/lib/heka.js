const heka = require('heka');

var conf = {
	sender: {
		factory: './senders:udpSenderFactory',
		hosts: 'localhost',
		ports: 4880
	},
	logger: 'picl-idp',
	severity: 5
};

module.exports = heka.clientFromJsonConfig(JSON.stringify(conf));
