const config = require('../config');
config.set('oauthServer.mysql.createSchema', true);
const oauthDB = require('../lib/oauth/db');
oauthDB.mysql.then(() => {
  process.exit();
});
