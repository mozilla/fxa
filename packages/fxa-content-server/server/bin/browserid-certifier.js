var config = require('../lib/configuration');

// Setup and run a browserid-certifer
process.env['IP_ADDRESS'] = config.get('certifier_host');
process.env['ISSUER_HOSTNAME'] = config.get('issuer');
process.env['PORT'] = config.get('certifier_port');
process.env['PUB_KEY_PATH'] = config.get('pub_key_path');
process.env['PRIV_KEY_PATH'] = config.get('priv_key_path');
process.env['VAR_PATH'] = config.get('var_path');

delete process.env.CONFIG_FILES;

var certifier = require('browserid-certifier').loadBin();

certifier(function (err, port) {
  console.log('Certifier started on port ' + port);
});
