module.exports = function (log, type, options) {
	const Stats = require('./stats')(log);
	const HekaStats = require('./heka')(Stats);
	const StatsdStats = require('./statsd')(Stats);

	var stats = null;
	switch (type) {
		case 'heka':
			stats = new HekaStats(options.host, options.port);
			break;
		case 'statsd':
			stats = new StatsdStats(options.host, options.port);
			break;
		default:
			stats = new Stats();
			break;
	}
	return stats;
};