const oauthDB = require('../../oauth/db');

module.exports = (log) => {
  const routes = [
    require('./redirect')({ log, oauthDB }),
    require('./authorization')({ log, oauthDB }),
    require('./authorized-clients/destroy')({ oauthDB }),
    require('./authorized-clients/list')({ oauthDB }),
    require('./client/get')({ log, oauthDB }),
    require('./destroy')({ log, oauthDB }),
    require('./introspect')({ oauthDB }),
    require('./jwks')(),
    require('./key_data')({ log, oauthDB }),
    require('./token')({ log, oauthDB }),
    require('./verify')({ log }),
  ];

  routes.forEach((r) => {
    r.config.cors = { origin: 'ignore' };
    if (r.method !== 'GET' && r.method !== 'HEAD') {
      if (!r.config.payload) {
        r.config.payload = {
          allow: ['application/json', 'application/x-www-form-urlencoded'],
        };
      }
    }
  });
  return routes;
};
