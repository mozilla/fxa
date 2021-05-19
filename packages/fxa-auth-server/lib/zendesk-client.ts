/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import zendesk from 'node-zendesk';

export const createZendeskClient = (config: Record<string, any>) => {
  const zendeskClient = zendesk.createClient({
    username: config.zendesk.username,
    token: config.zendesk.token,
    remoteUri: `https://${config.zendesk.subdomain}.zendesk.com/api/v2`,
    disableGlobalState: true,
  });

  (zendeskClient as any).updateIdentity = (
    userId: string,
    userIdentityID: string,
    payload: Record<string, any>
  ) =>
    new Promise((resolve, reject) =>
      // A very ugly call in to get the actual Zendesk API call because the
      // update call used in this library hardcodes a payload rather than
      // accepting one.
      (zendeskClient.useridentities as any).__proto__.request.call(
        zendeskClient.useridentities,
        'PUT',
        ['users', userId, 'identities', userIdentityID],
        payload,
        (err: any, req: any, result: any) =>
          err ? reject(err) : resolve({ req, result })
      )
    );

  return zendeskClient;
};

module.exports = createZendeskClient;
