/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_SIGN = {
  tags: TAGS.SIGN,
};

const CERTIFICATE_SIGN_POST = {
  ...TAGS_SIGN,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Sign a BrowserID public key. The server is given a public key and returns a signed certificate using the same JWT-like mechanism as a BrowserID primary IdP would (see [**browserid-certifier**](https://github.com/mozilla/browserid-certifier) for details). The signed certificate includes a \`principal.email\` property to indicate the Firefox Account identifier (a UUID at the account server's primary domain) and is stamped with an expiry time based on the \`duration\` parameter.

      This request will fail unless the primary email address for the account has been verified.

      Clients should include a query parameter, \`service\`, for metrics and validation purposes. The value of \`service\` should be \`sync\` when connecting to Firefox Sync or the OAuth \`client_id\` when connecting to an OAuth relier.

      If you do not specify a \`service parameter\`, or if you specify \`service=sync\`, this endpoint assumes the request is from a legacy Sync client. If the session token doesn't have a corresponding device record, one will be created automatically by the server.

      The signed certificate includes these additional claims:

        - \`fxa-generation\`: A number that increases each time the user's password is changed.
        - \`fxa-keysChangedAt\`: A timestamp that increases each time the user's encryption key is changed.
        - \`fxa-profileChangedAt\`: A timestamp that increases each time the user's core profile data is changed.
        - \`fxa-lastAuthAt\`: Authentication time for this session, in seconds since epoch.
        - \`fxa-verifiedEmail\`: The user's verified recovery email address.
        - \`fxa-tokenVerified\`: A boolean indicating whether the user's login was verified using an email confirmation or 2FA in addition to their password.
        - \`fxa-amr\`: A list of strings giving the ways in which the user was authenticated. Possible values include:
          - \`pwd\`: the user provided the account password
          - \`email\`: the user completed an email confirmation loop
          - \`otp\`: the user completed a 2FA challenge
        - \`fxa-aal\`: An integer giving the authenticator assurance level at which the user was authenticated - that is, the number of independent auth factors that they provided during login.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description:
            'Failing requests may be caused by the following errors (this is not an exhaustive list): \n `errno: 104` - Unverified account \n `errno: 108` - Missing parameter in request body \n `errno: 138` - Unverified session',
        },
      },
    },
  },
};

const API_DOCS = {
  CERTIFICATE_SIGN_POST,
};

export default API_DOCS;
