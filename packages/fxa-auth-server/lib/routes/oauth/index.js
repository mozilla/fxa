import oauthDB from '../../oauth/db';

export default (log, config, db, mailer, devices, statsd, glean) => {
  const routes = [
    require('./authorization')({ log, oauthDB, config }),
    require('./authorized-clients/destroy')({ oauthDB }),
    require('./authorized-clients/list')({ oauthDB }),
    require('./client/get')({ log, oauthDB }),
    require('./destroy')({ log, oauthDB }),
    require('./id_token_verify')(),
    require('./introspect')({ oauthDB }),
    require('./jwks')(),
    require('./key_data')({ log, oauthDB, statsd }),
    require('./token')({ log, oauthDB, db, mailer, devices, statsd, glean }),
    require('./verify')({ log, glean }),
  ].flat();

  const clientGetAlias = require('./client/get')({ log, oauthDB });
  clientGetAlias.path = '/oauth/client/{client_id}';
  clientGetAlias.config.description = '/oauth/client/{client_id}';
  clientGetAlias.config.notes = [
    'Retrieve metadata about the specified OAuth client, such as its display name and redirect URI.',
  ];
  clientGetAlias.config.tags = ['api', 'Oauth'];
  // Prevents hapi-swagger from including /v1/client/{client_id}'s response example
  clientGetAlias.config.plugins = {};
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
