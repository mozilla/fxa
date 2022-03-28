const oauthDB = require('../../oauth/db');

module.exports = (log, config, db, mailer, devices) => {
  const routes = [
    require('./authorization')({ log, oauthDB, config }),
    require('./authorized-clients/destroy')({ oauthDB }),
    require('./authorized-clients/list')({ oauthDB }),
    require('./client/get')({ log, oauthDB }),
    require('./destroy')({ log, oauthDB }),
    require('./id_token_verify')(),
    require('./introspect')({ oauthDB }),
    require('./jwks')(),
    require('./key_data')({ log, oauthDB }),
    require('./token')({ log, oauthDB, db, mailer, devices }),
    require('./verify')({ log }),
  ].flat();

  const clientGetAlias = require('./client/get')({ log, oauthDB });
  clientGetAlias.path = '/oauth/client/{client_id}';
  clientGetAlias.config.notes = [
    'Retrieve metadata about the specified OAuth client, such as its display name and redirect URI.',
  ];
  clientGetAlias.config.tags = ['api', 'Oauth'];
  routes.push(clientGetAlias);

  routes.forEach((r) => {
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
