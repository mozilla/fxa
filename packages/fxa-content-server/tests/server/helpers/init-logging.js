var mozlog = require('mozlog');
var config = require('../../../server/lib/configuration');

mozlog.config(config.get('logging'));
