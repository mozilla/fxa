/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const zendesk = require('node-zendesk');

module.exports = config => {
  const zendeskClient = zendesk.createClient({
    username: config.zendesk.username,
    token: config.zendesk.token,
    remoteUri: `https://${config.zendesk.subdomain}.zendesk.com/api/v2`,
    disableGlobalState: true,
  });

  // Promisify our callback functions, note bluebird.promisify can't be used
  // and a generic promisify failed due to odd `this` manipulation, so here we are.
  zendeskClient.createRequest = t =>
    new Promise((resolve, reject) =>
      zendeskClient.requests.create(t, (err, req, result) =>
        err ? reject(err) : resolve({ req, result })
      )
    );

  zendeskClient.showUser = id =>
    new Promise((resolve, reject) =>
      zendeskClient.users.show(id, (err, req, result) =>
        err ? reject(err) : resolve({ req, result })
      )
    );

  zendeskClient.updateUser = (id, user) =>
    new Promise((resolve, reject) =>
      zendeskClient.users.update(id, user, (err, req, result) =>
        err ? reject(err) : resolve({ req, result })
      )
    );

  zendeskClient.searchQueryAll = query =>
    new Promise((resolve, reject) =>
      zendeskClient.search.queryAll(query, (err, req, result) =>
        err ? reject(err) : resolve({ req, result })
      )
    );

  zendeskClient.listIdentities = userId =>
    new Promise((resolve, reject) =>
      zendeskClient.useridentities.list(userId, (err, req, result) =>
        err ? reject(err) : resolve({ req, result })
      )
    );

  zendeskClient.updateIdentity = (userId, userIdentityID, payload) =>
    new Promise((resolve, reject) =>
      // A very ugly call in to get the actual Zendesk API call because the
      // update call used in this library hardcodes a payload rather than
      // accepting one.
      zendeskClient.useridentities.__proto__.request.call(
        zendeskClient.useridentities,
        'PUT',
        ['users', userId, 'identities', userIdentityID],
        payload,
        (err, req, result) => (err ? reject(err) : resolve({ req, result }))
      )
    );

  return zendeskClient;
};
