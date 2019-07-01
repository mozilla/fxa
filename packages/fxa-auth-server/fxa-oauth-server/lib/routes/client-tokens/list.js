/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const config = require('../../config');
const db = require('../../db');
const SCOPE_CLIENT_WRITE = require('../../auth_bearer').SCOPE_CLIENT_WRITE;
const localizeTimestamp = require('fxa-shared').l10n.localizeTimestamp({
  supportedLanguages: config.get('i18n.supportedLanguages'),
  defaultLanguage: config.get('i18n.defaultLanguage'),
});

function serialize(client, acceptLanguage) {
  var lastAccessTime = client.lastAccessTime.getTime();
  var lastAccessTimeFormatted = localizeTimestamp.format(
    lastAccessTime,
    acceptLanguage
  );

  return {
    name: client.name,
    id: hex(client.id),
    lastAccessTime: lastAccessTime,
    lastAccessTimeFormatted: lastAccessTimeFormatted,
    scope: client.scope,
  };
}

module.exports = {
  auth: {
    strategy: 'authBearer',
    scope: SCOPE_CLIENT_WRITE.getImplicantValues(),
  },
  handler: async function activeServices(req) {
    return db
      .getActiveClientsByUid(req.auth.credentials.user)
      .then(function(clients) {
        return clients.map(function(client) {
          return serialize(client, req.headers['accept-language']);
        });
      });
  },
};
