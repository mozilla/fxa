/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const dedent = require('dedent');
const Joi = require('joi');
const DESCRIPTIONS = require('./descriptions');

const TAGS_CUSTOMS_SERVER = {
  tags: ['api'],
};

const BLOCKEMAIL_POST = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/blockEmail',
  notes: [
    dedent`
      *Not currently used by anyone.*

      Used by internal services to temporarily ban requests associated with a given email address. These bans last for \`config.limits.blockIntervalSeconds\` (default: 24 hours).
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description:
            'Successful requests will produce a "200 OK" response with an empty JSON object as the body: {}',
        },
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - code MissingParameters: email is required
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n-H "Content-Type: application/json" \\\n"http://localhost:7000/blockEmail" \\\n-d \'{\n  "email": "me@example.com"\n}\'',
        },
      ],
    },
  },
  validate: {
    payload: Joi.object({
      email: Joi.string().description(DESCRIPTIONS.blockEmail),
    }),
  },
};

const BLOCKIP_POST = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/blockIp',
  notes: [
    dedent`
      *Not currently used by anyone.*

      Used by internal services to temporarily ban requests associated with a given IP address. These bans last for \`config.limits.blockIntervalSeconds\` (default: 24 hours).
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description:
            'Successful requests will produce a "200 OK" response with an empty JSON object as the body: {}',
        },
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - code MissingParameters: ip is required
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n-H "Content-Type: application/json" \\\n"http://localhost:7000/blockIp" \\\n-d \'{\n  "ip": "192.0.2.1"\n}\'',
        },
      ],
    },
  },
  validate: {
    payload: Joi.object({
      ip: Joi.string().description('the IP address to ban'),
    }),
  },
};

const CHECK_POST = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/check',
  notes: [
    'Called by the auth server before performing an action on its end to check whether or not the action should be blocked. The endpoint is capable of rate-limiting and blocking requests that involve a variety of [actions](https://github.com/mozilla/fxa/blob/main/packages/fxa-customs-server/lib/actions.js).',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            Successful requests will produce a "200 OK" response with the blocking advice in the JSON body:
            {
              "block": true,
              "retryAfter": 86396
            }
            - \`block\` indicates whether or not the action should be blocked and \`retyAfter\` tells the client how long it should wait (in seconds) before attempting this action again.
          `,
        },
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - code MissingParameters: email, ip and action are all required
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n-H "Content-Type: application/json" \\\n"http://localhost:7000/check" \\\n-d \'{\n  "email": "me@example.com",\n  "ip": "192.0.2.1",\n  "action": "accountCreate"\n}\'',
        },
      ],
    },
  },
  validate: {
    payload: Joi.object({
      email: Joi.string().description(DESCRIPTIONS.email),
      ip: Joi.string().description(DESCRIPTIONS.ip),
      action: Joi.string().description(DESCRIPTIONS.action),
      headers: Joi.object().optional().description(DESCRIPTIONS.headers),
      payload: Joi.object().optional().description(DESCRIPTIONS.payload),
      phoneNumber: Joi.string()
        .optional()
        .description(DESCRIPTIONS.phoneNumber),
    }),
  },
};

const CHECK_AUTHENTICATED_POST = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/checkAuthenticated',
  notes: [
    'Called by the auth server before performing an authenticated action to check whether or not the action should be blocked.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            Successful requests will produce a "200 OK" response with the blocking advice in the JSON body:
            {
              "block": true,
              "retryAfter": 86396
            }
            - \`block\` indicates whether or not the action should be blocked and \`retyAfter\` tells the client how long it should wait (in seconds) before attempting this action again.
          `,
        },
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - code MissingParameters: action, ip and uid are all required
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n-H "Content-Type: application/json" \\\n"http://localhost:7000/checkAuthenticated" \\\n-d \'{\n  "action": "devicesNotify",\n  "ip": "192.0.2.1",\n  "uid": "0b65dd742b5a415487f2108cca597044",\n}\'',
        },
      ],
    },
  },
  validate: {
    payload: Joi.object({
      action: Joi.string().description(DESCRIPTIONS.action),
      ip: Joi.string().description(DESCRIPTIONS.ip),
      uid: Joi.string().description(DESCRIPTIONS.uid),
    }),
  },
};

const CHECKIPONLY_POST = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/checkIpOnly',
  notes: [
    'Like [/check](#operation/postCheck), called by the auth server before performing an action on its end to check whether or not the action should be blocked based only on the request IP.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            Successful requests will produce a "200 OK" response with the blocking advice in the JSON body:
            {
              "block": true,
              "retryAfter": 86396
            }
            - \`block\` indicates whether or not the action should be blocked and \`retyAfter\` tells the client how long it should wait (in seconds) before attempting this action again.
          `,
        },
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - code MissingParameters: ip and action are both required
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n-H "Content-Type: application/json" \\\n"http://localhost:7000/checkIpOnly" \\\n-d \'{\n  "ip": "192.0.2.1",\n  "action": "accountCreate"\n}\'',
        },
      ],
    },
  },
  validate: {
    payload: Joi.object({
      email: Joi.string().optional().description(DESCRIPTIONS.email),
      ip: Joi.string().required().description(DESCRIPTIONS.ip),
      action: Joi.string().required().description(DESCRIPTIONS.action),
    }),
  },
};

const FAILEDLOGINATTEMPT_POST = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/failedLoginAttempt',
  notes: [
    dedent`
      Called by the auth server to signal to the customs server that a failed login attempt has occured.

      This information is stored by the customs server to enforce some of its policies.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            Successful requests will produce a "200 OK" response: {}

            - \`lockout\` indicates whether or not the account should be locked out.
          `,
        },
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - code MissingParameters: email and ip are both required
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n-H "Content-Type: application/json" \\\n"http://localhost:7000/failedLoginAttempt" \\\n-d \'{\n  "email": "me@example.com",\n  "ip": "192.0.2.1",\n}\'',
        },
      ],
    },
  },
  validate: {
    payload: Joi.object({
      email: Joi.string().description(DESCRIPTIONS.email),
      ip: Joi.string().description(DESCRIPTIONS.ip),
      action: Joi.string().optional().description(DESCRIPTIONS.action),
    }),
  },
};

const PASSWORDRESET_POST = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/passwordReset',
  notes: [
    dedent`
      Called by the auth server to signal to the customs server that the password on the account has been successfully reset.

      The customs server uses this information to update its state (expiring bad logins for example).
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description:
            'Successful requests will produce a "200 OK" response with an empty JSON object as the body: {}',
        },
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - code MissingParameters: email is required
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n-H "Content-Type: application/json" \\\n"http://localhost:7000/passwordReset" \\\n-d \'{\n  "email": "me@example.com",\n}\'',
        },
      ],
    },
  },
  validate: {
    payload: Joi.object({
      email: Joi.string().description(DESCRIPTIONS.email),
    }),
  },
};

const GET = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/',
};

const LIMITS_GET = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/limits',
};

const ALLOWED_IPS_GET = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/allowedIps',
};

const ALLOWED_EMAILDOMAINS_GET = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/allowedEmailDomains',
};

const ALLOWED_PHONENUMBERS_GET = {
  ...TAGS_CUSTOMS_SERVER,
  description: '/allowedPhoneNumbers',
};

module.exports = {
  BLOCKEMAIL_POST,
  BLOCKIP_POST,
  CHECK_POST,
  CHECK_AUTHENTICATED_POST,
  CHECKIPONLY_POST,
  FAILEDLOGINATTEMPT_POST,
  PASSWORDRESET_POST,
  GET,
  LIMITS_GET,
  ALLOWED_IPS_GET,
  ALLOWED_EMAILDOMAINS_GET,
  ALLOWED_PHONENUMBERS_GET,
};
