const oauthDB = require('../../oauth/db/');
const proxied = require('./proxied');

module.exports = (log, config, oauthService, db, mailer, devices) => {
  const routes = proxied(log, config, oauthService, db, mailer, devices);
  routes.push(require('./client/get')({ log, oauthDB }));
  routes.push(require('./key_data')({ log, oauthDB }));
  routes.push(require('./verify')({ log }));
  return routes;
};
