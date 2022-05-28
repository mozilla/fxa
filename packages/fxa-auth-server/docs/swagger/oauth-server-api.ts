/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const OAUTH_SERVER_API_DESCRIPTION = {
  description: dedent`
      ## URL Structure for OAuth Server
      > \`https://<server-url>/v1/<api-endpoint>\`

      Note that:
      - All API access must be over HTTPS
      - The URL embeds a version identifier "v1"; future versions of this API may introduce new version numbers.
      - The base URL of the server may be configured on a per-client basis.

      ## Errors
      Invalid requests will return 4XX responses. Internal failures will return 5XX. Both will include JSON responses describing the error.

      **Example error:**
      > {<br/>
      >  \`"code": 400,\` // matches the HTTP status code<br/>
      >  \`"errno": 101,\` // stable application-level error number<br/>
      >  \`"error": "Bad Request",\` // string description of error type<br/>
      >  \`"message": "Unknown client"\`<br/>
      > }

      The currently-defined error responses are:

      | status code | errno | description                                     |
      |-------------|-------|-------------------------------------------------|
      | 400         | 101   | unknown client id                               |
      | 400         | 102   | incorrect client secret                         |
      | 400         | 103   | \`redirect_uri\` doesn't match registered value |
      | 401         | 104   | invalid fxa assertion                           |
      | 400         | 105   | unknown code                                    |
      | 400         | 106   | incorrect code                                  |
      | 400         | 107   | expired code                                    |
      | 400         | 108   | invalid token                                   |
      | 400         | 109   | invalid request parameter                       |
      | 400         | 110   | invalid response_type                           |
      | 401         | 111   | unauthorized                                    |
      | 403         | 112   | forbidden                                       |
      | 415         | 113   | invalid content type                            |
      | 400         | 114   | invalid scopes                                  |
      | 400         | 115   | expired token                                   |
      | 400         | 116   | not a public client                             |
      | 400         | 117   | incorrect code_challenge                        |
      | 400         | 118   | pkce parameters missing                         |
      | 400         | 119   | stale authentication timestamp                  |
      | 400         | 120   | mismatch acr value                              |
      | 400         | 121   | invalid grant_type                              |
      | 500         | 999   | internal server error                           |


      ## API Endpoints
      - [GET /v1/authorization](#tag/OAuth-Server-API-Overview/operation/getAuthorization)
      - [POST /v1/authorization](#tag/OAuth-Server-API-Overview/operation/postAuthorization)
      - [POST /v1/authorized-clients](#tag/OAuth-Server-API-Overview/operation/postAuthorizedclients)
      - [POST /v1/authorized-clients/destroy](#tag/OAuth-Server-API-Overview/operation/postAuthorizedclientsDestroy)
      - [GET /v1/client/:id](#tag/OAuth-Server-API-Overview/operation/getClientClient_id)
      - [POST /v1/destroy](#tag/OAuth-Server-API-Overview/operation/postDestroy)
      - [POST /v1/introspect](#tag/OAuth-Server-API-Overview/operation/postIntrospect)
      - [GET /v1/jwks](#tag/OAuth-Server-API-Overview/operation/getJwks)
      - [POST /v1/key-data](#tag/OAuth-Server-API-Overview/operation/postKeydata)
      - [POST /v1/token](#tag/OAuth-Server-API-Overview/operation/postToken)
      - [POST /v1/verify](#tag/OAuth-Server-API-Overview/operation/postVerify)
  `,
};

const TAGS_OAUTH_SERVER = {
  tags: TAGS.OAUTH_SERVER,
};

const AUTHORIZATION_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorization',
  notes: [
    'This endpoint starts the OAuth flow. A client redirects the user agent to this url. This endpoint will then redirect to the appropriate content-server page.',
  ],
};

const AUTHORIZATION_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorization',
  notes: [
    dedent`
      This endpoint should be used by the fxa-content-server, requesting that we supply a short-lived code (currently 15 minutes) that will be sent back to the client. This code will be traded for a token at the [token][] endpoint.

      Note:

      Responses

      Implicit Grant - If requesting an implicit grant (token), the response will match the [/v1/token][token] response.
    `,
  ],
};

const DESTROY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/destroy',
  notes: [
    'After a client is done using a token, the responsible thing to do is to destroy the token afterwards. A client can use this route to do so.',
  ],
};

const AUTHORIZED_CLIENTS_DESTROY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorized-clients/destroy',
  notes: [
    `This endpoint revokes tokens granted to a given client. It must be authenticated with an identity assertion for the user's account.`,
  ],
};

const AUTHORIZED_CLIENTS_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorized_clients',
  notes: [
    dedent`
      This endpoint returns a list of all OAuth client instances connected to the user's account, including the the scopes granted to each client instance and the time at which it was last active, if available. It must be authenticated with an identity assertion for the user's account

      Note:

      Responses

      For clients that use refresh tokens, each refresh token is taken to represent a separate instance of that client and is returned as a separate entry in the list, with the \`refresh_token_id\` field distinguishing each.

      For clients that only use access tokens, all active access tokens are combined into a single entry in the list, and the \`refresh_token_id\` field will not be present.
    `,
  ],
};

const CLIENT_CLIENTID_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/client/{client_id}',
  notes: [
    'This endpoint is for the fxa-content-server to retrieve information about a client to show in its user interface.',
  ],
};

const INTROSPECT_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/introspect',
  notes: [
    dedent`
      This endpoint returns the status of the token and meta-information about this token.

      If the token has attribute \`active: false\`, none of the other attributes in the response will have content
    `,
  ],
};

const JWKS_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/jwks',
  notes: [
    'This endpoint returns the [JWKs](https://datatracker.ietf.org/doc/html/rfc7517) that are used for signing OpenID Connect id tokens.',
  ],
};

const KEY_DATA_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/key-data',
  notes: ['This endpoint returns the required scoped key metadata.'],
};

const TOKEN_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/token',
  notes: [
    dedent`
      After receiving an authorization grant from the user, clients exercise that grant at this endpoint to obtain tokens that can be used to access attached services for a particular user.

      The following types of grant are possible:

      - \`authorization_code\`: a single-use code as produced by the [authorization][] endpoint, obtained through a redirect-based authorization flow.
      - \`refresh_token\`: a token previously obtained from this endpoint when using access_type=offline.
      - \`fxa-credentials\`: an FxA identity assertion, obtained by directly authenticating the user's account.

      **WARNING**: Do not include \`scope\` unless you want to downgrade it.
    `,
  ],
};

const VERIFY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/verify',
  notes: [
    'Attached services can post tokens to this endpoint to learn about which user and scopes are permitted for the token.',
  ],
};

const API_DOCS = {
  OAUTH_SERVER_API_DESCRIPTION,
  AUTHORIZATION_GET,
  AUTHORIZATION_POST,
  DESTROY_POST,
  AUTHORIZED_CLIENTS_DESTROY_POST,
  AUTHORIZED_CLIENTS_POST,
  CLIENT_CLIENTID_GET,
  INTROSPECT_POST,
  JWKS_GET,
  KEY_DATA_POST,
  TOKEN_POST,
  VERIFY_POST,
};

export default API_DOCS;
