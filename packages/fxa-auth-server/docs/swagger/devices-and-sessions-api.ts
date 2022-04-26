/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_DEVICES_AND_SESSIONS = {
  tags: TAGS.DEVICES_AND_SESSIONS,
};

const ACCOUNT_ATTACHED_CLIENTS_GET = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token.

      Returns an array listing all the clients connected to the authenticated user's account, including devices, OAuth clients, and web sessions.

      This endpoint is primarily designed to power the "devices and apps" view on the user's account settings page. Depending on the type of client, it will have at least one and possibly several of the following properties:

      - \`clientId\`: The OAuth client_id of the connected application.
      - \`sessionTokenId\`: The id of the \`sessionToken\` held by that client, if any.
      - \`refreshTokenId\`: The id of the OAuth \`refreshToken\` held by that client, if any.
      - \`deviceId\`: The id of the client's device record, if it has registered one.

      These identifiers can be passed to [**/account/attached_client/destroy**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#post-accountattached_clientdestroy) in order to disconnect the client.
    `,
  ],
};

const ACCOUNT_ATTACHED_CLIENT_DESTROY_POST = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token.

      Destroy all tokens held by a connected client, disconnecting it from the user's account.

      This endpoint is designed to be used in conjunction with [**/account/attached_clients**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#get-accountattached_clients). It accepts as the request body an object in the same format as returned by that endpoing, and will disconnect that client from the user's account.
    `,
  ],
};

const ACCOUNT_DEVICE_POST = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken, refreshToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token or authenticated with OAuth refresh token

      Creates or updates the [**device registration**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/device_registration.md) record associated with the auth token used for this request. At least one of \`name\`, \`type\`, \`pushCallback\` or the tuple \`{ pushCallback, pushPublicKey, pushAuthKey }\` must be present. Beware that if you provide \`pushCallback\` without the pair \`{ pushPublicKey, pushAuthKey }\`, both of those keys will be reset to the empty string.

      \`pushEndpointExpired\` will be reset to false on update if the tuple \`{ pushCallback, pushPublicKey, pushAuthKey }\` is specified.

      Devices should register with this endpoint before attempting to access the user's sync data, so that an appropriate device name can be made available to other connected devices.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description:
            'Failing requests may be caused by the following errors (this is not an exhaustive list): \n `errno: 107` - Invalid parameter in request body',
        },
        503: {
          description:
            'Failing requests may be caused by the following errors (this is not an exhaustive list): \n `errno: 202` - Feature not enabled',
        },
      },
    },
  },
};

const ACCOUNT_DEVICE_COMMANDS_GET = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken, refreshToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token or authenticated with OAuth refresh token.

      Fetches commands enqueued for the current device by prior calls to \`/account/devices/invoke_command\`. The device can page through the enqueued commands by using the \`index\` and \`limit\` parameters.

      For more details, see the [**device registration**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/device_registration.md) docs.
    `,
  ],
};

const ACCOUNT_DEVICES_INVOKE_COMMAND_POST = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken, refreshToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token or authenticated with OAuth refresh token.

      Enqueues a command to be invoked on a target device.

      For more details, see the [**device registration**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/device_registration.md) docs.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 157\` - Unavailable device command
          `,
        },
      },
    },
  },
};

const ACCOUNT_DEVICES_NOTIFY_POST = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken, refreshToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token or authenticated with OAuth refresh token.

      Notifies a set of devices associated with the user's account of an event by sending a browser push notification. A typical use case would be to send a notification to another device after sending a tab with Sync, so it can sync too and display the tab in a timely manner.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 107\` - Invalid parameter in request body
          `,
        },
        503: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 202\` - Feature not enabled
          `,
        },
      },
    },
  },
};

const ACCOUNT_DEVICES_GET = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken, refreshToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token or authenticated with OAuth refresh token.

      Returns an array of registered device objects for the authenticated user.
    `,
  ],
};

const ACCOUNT_SESSIONS_GET = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: 'deprecated (🔒 sessionToken)',
  notes: [
    dedent`
      [**DEPRECATED**]: Please use [**/account/attached_clients**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#get-accountattached_clients) instead.

      🔒 HAWK-authenticated with session token.

      Returns an array of session objects for the authenticated user.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      deprecated: true,
    },
  },
};

const ACCOUNT_DEVICE_DESTROY_POST = {
  ...TAGS_DEVICES_AND_SESSIONS,
  description: '🔒 sessionToken, refreshToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token or authenticated with OAuth refresh token

      Destroys a device record and the associated \`sessionToken\` for the authenticated user.
    `,
  ],
};

const API_DOCS = {
  ACCOUNT_ATTACHED_CLIENT_DESTROY_POST,
  ACCOUNT_ATTACHED_CLIENTS_GET,
  ACCOUNT_DEVICE_COMMANDS_GET,
  ACCOUNT_DEVICE_DESTROY_POST,
  ACCOUNT_DEVICE_POST,
  ACCOUNT_DEVICES_GET,
  ACCOUNT_DEVICES_INVOKE_COMMAND_POST,
  ACCOUNT_DEVICES_NOTIFY_POST,
  ACCOUNT_SESSIONS_GET,
};

export default API_DOCS;
