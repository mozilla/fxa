const config = require('../config');
config.set('oauthServer.mysql.createSchema', true);
const oauthdb = require('../lib/oauth/db');
oauthdb.mysql.then(() => {
  process.exit();
});
