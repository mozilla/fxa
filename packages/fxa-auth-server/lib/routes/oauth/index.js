const proxied = require('./proxied');

module.exports = (log, config, oauthdb, db, mailer, devices) => {
  const routes = proxied(log, config, oauthdb, db, mailer, devices);
  routes.push(require('./verify')(log));
  return routes;
};
