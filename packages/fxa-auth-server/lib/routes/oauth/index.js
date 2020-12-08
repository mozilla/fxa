const oauthDB = require('../../oauth/db');
const proxied = require('./proxied');

module.exports = (log, config, oauthService, db, mailer, devices) => {
  const routes = proxied(log, config, oauthService, db, mailer, devices);
  const directRoutes = [
    require('./authorization')({ log, oauthDB }),
    require('./client/get')({ log, oauthDB }),
    require('./introspect')({ oauthDB }),
    require('./key_data')({ log, oauthDB }),
    require('./redirect')({ log, oauthDB }),
    require('./verify')({ log }),
  ];

  directRoutes.forEach((r) => {
    r.config.cors = { origin: 'ignore' };
    if (r.method !== 'GET' && r.method !== 'HEAD') {
      if (!r.config.payload) {
        r.config.payload = {
          allow: ['application/json', 'application/x-www-form-urlencoded'],
        };
      }
    }
  });

  return routes.concat(directRoutes);
};
