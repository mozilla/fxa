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

      **Example error:** \n
            {
              "code": 400, // matches the HTTP status code
              "errno": 101, // stable application-level error number
              "error": "Bad Request", // string description of error type
              "message": "Unknown client"
            }

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
  plugins: {
    'hapi-swagger': {
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v "https://oauth.accounts.firefox.com/v1/authorization?client_id=5901bd09376fadaa&state=1234&scope=profile:email&action=signup"',
        },
      ],
    },
  },
};

const AUTHORIZATION_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorization',
  notes: ['This endpoint should be used by the fxa-content-server, requesting that we supply a short-lived code (currently 15 minutes) that will be sent back to the client. This code will be traded for a token at the [token][] endpoint.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid request will return a 200 response, with JSON containing the \`redirect\` to follow.
            <br />
            **Example:** \n
                { \n
                  "redirect": "https://example.domain/path?foo=bar&code=4ab433e31ef3a7cf7c20590f047987922b5c9ceb1faff56f0f8164df053dd94c&state=1234" \n
                }

            **Implicit Grant** \\n If requesting an implicit grant (token), the response will match the [/v1/token][token] response.
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n -X POST \\\n -H "Content-Type: application/json" \\\n "https://oauth.accounts.firefox.com/v1/authorization" \\\n -d \'{\n  "client_id": "5901bd09376fadaa",\n  "assertion": "<assertion>",\n  "state": "1234",\n  "scope": "profile:email"\n}\'',
        },
      ],
    },
  },
};

const DESTROY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/destroy',
  notes: [
    dedent`
      After a client is done using a token, the responsible thing to do is to destroy the token afterwards. A client can use this route to do so.

      **Request Parameters**
      - \`token|access_token|refresh_token|refresh_token_id\`: The hex string access token. By default, \`token\` is assumed to be the access token.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: 'A valid request will return an empty response, with a 200 status code.',
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n -X POST \\\n -H "Content-Type: application/json" \\\n "https://oauth.accounts.firefox.com/v1/destroy" \\\n -d \'{\n  "token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0"\n}\'',
        },
      ],
    },
  },
};

const AUTHORIZED_CLIENTS_DESTROY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorized-clients/destroy',
  notes: [
    `This endpoint revokes tokens granted to a given client. It must be authenticated with an identity assertion for the user's account.`,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: 'A valid 200 response will return an empty JSON object.'
        }
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -X POST \\\n "https://oauth.accounts.firefox.com/v1/authorized-clients/destroy \\\n -H \'cache-control: no-cache\' \\\n -H \'content-type: application/json\' \\\n -d \'{\n  "client_id": "5901bd09376fadaa",\n  "refresh_token_id": "6e8c38f6a9c27dc0e4df698dc3e3e8b101ad6d79e87842b1ca96ad9b3cd8ed28",\n  "assertion": "eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7Imt0eSI6IlJTQSIsIm4iOiJvWmdsNkpwM0Iwcm5BVXppNThrdS1iT0RvR3ZuUGNnWU1UdXQ1WkpyQkJiazBCdWU4VUlRQ0dnYVdrYU5Xb29INkktMUZ6SXU0VFpZYnNqWGJ1c2JRRlQxOGREUkN6VVRubFlXdVZXUzhoSWhKc3lhZHJwSHJOVkI1VndmSlRKZVgwTjFpczBXcU1qdUdOc2VMLXluYnFjOVhueElncFJaai05QnZqY2ZKYXNOUTNZdHR3VHZVaFJOLVFGNWgxQkY1MnA2QmdOTVBvWmQ5MC1EU0xydlpseXp6MEh0Q2tFZnNsc013czVkR0ExTlZ1dEwtcGVDeU50VTFzOEtFaDlzcGxXeF9lQlFybTlYQU1kYXp5ZWR6VUpJU1UyMjZmQzhEUHh5c0ZreXpCbjlDQnFDQUpTNjQzTGFydUVDaS1rMGhKOWFmM2JXTmJnWmpSNVJ2NXF4THciLCJlIjoiQVFBQiJ9LCJwcmluY2lwYWwiOnsiZW1haWwiOiIwNjIxMzM0YzIwNjRjNmYzNmJlOGFkOWE0N2M1NTliY2FwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9LCJpYXQiOjE1MDY5Njk2OTU0MzksImV4cCI6MTUwNjk2OTY5NjQzOSwiZnhhLXZlcmlmaWVkRW1haWwiOiIzMjM2NzJiZUBtb3ppbGxhLmNvbSIsImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.hFZd5zFheXOFrXKkJvw6Vpv2l7ctlxuBTvuh5f_jLPAjZoJ9ri-vaJjL_WYBFUvS2xHzfx3-ldxLddyTKwCDAJeB_NkOFL_WJSrMet9C7_Z1hH9HmydeXIT82xJmhrwzW-WOO4ibQvRbocEFiNujynKsg1gS8v0iiYjIX-0cXCrlkxkbVx_8EXJFKDDOGzK9v7Zq6D7gkhP-CHEaNYaTHMn65tLQtBS6snGdaXlxoGHMWmDL6STbnJzWa7sa4QwHf-AgT1rUkQQAUHNa_XLZ0FEzqiCPctMadlihiUZL2V6vxIDBS4mHUF4qj0FvIMJflivDnJVkRNijDuP-h-Lh_A~eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJvYXV0aC5meGEiLCJleHAiOjE1MDY5Njk2OTY0MzksImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.M5xyk3RffucgaavjbUm7Eqnt47hzeGbGa2VR3jnVEIlRHfz5S25Qf3ngejwee7XECvIywbaKWeijXFOwS-EkB-7qP1gl4oNJjPmbnCk7S1lgckLWvdMIU-HLGKjrN6Mw76__LzvAbsusSeGmsvTCIVuOJ49Xs3tC1fLyB_re0QNpCcS6AUnJ1KOxIMEM3Om7ysNO5F_AqcD3PwlEti5lbwSk8iP5TWL12C2Nkb_6Hxze_mA1NZNAHOips9bF2J7oy1hqGoMYj1XYZrsyjpPWEuZQATAPlKSjbh1hq-UtDeT7DlwEmIbIUd3JA8qh1MkHKGgavd4fIMap0IPmr9rs4A",\n}\'',
        },
      ],
    }
  }
};

const AUTHORIZED_CLIENTS_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorized-clients',
  notes: [
    "This endpoint returns a list of all OAuth client instances connected to the user's account, including the the scopes granted to each client instance and the time at which it was last active, if available. It must be authenticated with an identity assertion for the user's account.",
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid 200 response will be a JSON array.

            For clients that use refresh tokens, each refresh token is taken to represent a separate instance of that client and is returned as a separate entry in the list, with the \`refresh_token_id\` field distinguishing each.

            For clients that only use access tokens, all active access tokens are combined into a single entry in the list, and the \`refresh_token_id\` field will not be present.

            **Example:** \n
                [ \n
                  { \n
                    "client_id": "5901bd09376fadaa", \n
                    "refresh_token_id": "6e8c38f6a9c27dc0e4df698dc3e3e8b101ad6d79e87842b1ca96ad9b3cd8ed28", \n
                    "name": "Example Sync Client", \n
                    "created_time": 1528334748000, \n
                    "last_access_time": 1528334748000, \n
                    "scope": ["profile", "https://identity.mozilla.com/apps/oldsync"] \n
                  }, \n
                  { \n
                    "client_id": "5901bd09376fadaa", \n
                    "refresh_token_id": "eb5e17f246a6b0937356412118ea12b67a638232d6b376e2511cf38a0c4eecf9", \n
                    "name": "Example Sync Client", \n
                    "created_time": 1528334748000, \n
                    "last_access_time": 1528334834000, \n
                    "scope": ["profile", "https://identity.mozilla.com/apps/oldsync"] \n
                  }, \n
                  { \n
                    "client_id": "23d10a14f474ca41", \n
                    "name": "Example Website", \n
                    "created_time": 1328334748000, \n
                    "last_access_time": 1476677854037, \n
                    "scope": ["profile:email", "profile:uid"] \n
                  } \n
                ]
          `
        }
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -X POST \\\n "https://oauth.accounts.firefox.com/v1/authorized-clients" \\\n -H \'cache-control: no-cache\' \\\n -H "Content-Type: application/json" \\\n -d \'{\n  "assertion": "eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7Imt0eSI6IlJTQSIsIm4iOiJvWmdsNkpwM0Iwcm5BVXppNThrdS1iT0RvR3ZuUGNnWU1UdXQ1WkpyQkJiazBCdWU4VUlRQ0dnYVdrYU5Xb29INkktMUZ6SXU0VFpZYnNqWGJ1c2JRRlQxOGREUkN6VVRubFlXdVZXUzhoSWhKc3lhZHJwSHJOVkI1VndmSlRKZVgwTjFpczBXcU1qdUdOc2VMLXluYnFjOVhueElncFJaai05QnZqY2ZKYXNOUTNZdHR3VHZVaFJOLVFGNWgxQkY1MnA2QmdOTVBvWmQ5MC1EU0xydlpseXp6MEh0Q2tFZnNsc013czVkR0ExTlZ1dEwtcGVDeU50VTFzOEtFaDlzcGxXeF9lQlFybTlYQU1kYXp5ZWR6VUpJU1UyMjZmQzhEUHh5c0ZreXpCbjlDQnFDQUpTNjQzTGFydUVDaS1rMGhKOWFmM2JXTmJnWmpSNVJ2NXF4THciLCJlIjoiQVFBQiJ9LCJwcmluY2lwYWwiOnsiZW1haWwiOiIwNjIxMzM0YzIwNjRjNmYzNmJlOGFkOWE0N2M1NTliY2FwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9LCJpYXQiOjE1MDY5Njk2OTU0MzksImV4cCI6MTUwNjk2OTY5NjQzOSwiZnhhLXZlcmlmaWVkRW1haWwiOiIzMjM2NzJiZUBtb3ppbGxhLmNvbSIsImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.hFZd5zFheXOFrXKkJvw6Vpv2l7ctlxuBTvuh5f_jLPAjZoJ9ri-vaJjL_WYBFUvS2xHzfx3-ldxLddyTKwCDAJeB_NkOFL_WJSrMet9C7_Z1hH9HmydeXIT82xJmhrwzW-WOO4ibQvRbocEFiNujynKsg1gS8v0iiYjIX-0cXCrlkxkbVx_8EXJFKDDOGzK9v7Zq6D7gkhP-CHEaNYaTHMn65tLQtBS6snGdaXlxoGHMWmDL6STbnJzWa7sa4QwHf-AgT1rUkQQAUHNa_XLZ0FEzqiCPctMadlihiUZL2V6vxIDBS4mHUF4qj0FvIMJflivDnJVkRNijDuP-h-Lh_A~eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJvYXV0aC5meGEiLCJleHAiOjE1MDY5Njk2OTY0MzksImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.M5xyk3RffucgaavjbUm7Eqnt47hzeGbGa2VR3jnVEIlRHfz5S25Qf3ngejwee7XECvIywbaKWeijXFOwS-EkB-7qP1gl4oNJjPmbnCk7S1lgckLWvdMIU-HLGKjrN6Mw76__LzvAbsusSeGmsvTCIVuOJ49Xs3tC1fLyB_re0QNpCcS6AUnJ1KOxIMEM3Om7ysNO5F_AqcD3PwlEti5lbwSk8iP5TWL12C2Nkb_6Hxze_mA1NZNAHOips9bF2J7oy1hqGoMYj1XYZrsyjpPWEuZQATAPlKSjbh1hq-UtDeT7DlwEmIbIUd3JA8qh1MkHKGgavd4fIMap0IPmr9rs4A"\n}\'',
        },
      ],
    }
  }
};

const CLIENT_CLIENTID_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/client/{client_id}',
  notes: [
    'This endpoint is for the fxa-content-server to retrieve information about a client to show in its user interface.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid 200 response will be a JSON blob.
            <br />
            **Example:** \n
                { \n
                  "name": "Where's My Fox", \n
                  "image_uri": "https://mozilla.org/firefox.png", \n
                  "redirect_uri": "https://wheres.my.firefox.com/oauth", \n
                  "trusted": true \n
                }
          `,
        }
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v "http://oauth.accounts.firefox.com/v1/client/5901bd09376fadaa"',
        },
      ],
    },
  },
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
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid request will return a JSON response.
            <br />
            **Example** \n
                { \n
                  "active": true, \n
                  "scope": "profile https://identity.mozilla.com/account/subscriptions", \n
                  "client_id": "59cceb6f8c32317c", \n
                  "token_type": "access_token", \n
                  "iat": 1566535888243, \n
                  "sub": "913fe9395bb946b48c1521d7beb2cb24", \n
                  "jti": "5ae05d8fe413a749e0f4eb3c495a1c526fb52c85ca5fde516df5dd77d41f7b5b", \n
                  "exp": 1566537688243 \n
                }
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -X POST \\\n -H "Content-Type: application/json" \\\n "https://oauth.accounts.firefox.com/v1/introspect" \\\n -d \'{\n  "token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0"\n}\'',
        },
      ],
    },
  },
};

const JWKS_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/jwks',
  notes: [
    'This endpoint returns the [JWKs](https://datatracker.ietf.org/doc/html/rfc7517) that are used for signing OpenID Connect id tokens.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid response will return JSON of the \`keys\`.
            <br />
            **Example:** \n
                { \n
                  "keys": [ \n
                    "alg": "RS256", \n
                    "use": "sig", \n
                    "kty": "RSA", \n
                    "kid": "2015.12.02-1", \n
                    "n":"xaQHsKpu1KSK-YEMoLzZS7Xxciy3esGrhrrqW_JBrq3IRmeGLaqlE80zcpIVnStyp9tbet2niYTemt8ug591YWO5Y-S0EgQyFTxnGjzNOvAL6Cd2iGie9QeSehfFLNyRPdQiadYw07fw-h5gweMpVJs8nTgS-Bcorlw9JQM6Il1cUpbP0Lt-F_5qrzlaOiTEAAb4JGOusVh0n-MZfKt7w0mikauMH5KfhflwQDn4YTzRkWJzlldXr1Cs0ZkYzOwS4Hcoku7vd6lqCUO0GgZvkuvCFqdVKzpa4CGboNdfIjcGVF4f1CTQaQ0ao51cwLzq1pgi5aWYhVH7lJcm6O_BQw", \n
                    "e":"AQAC" \n
                  ] \n
                }
          `,
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v "http://oauth.accounts.firefox.com/v1/jwks"',
        },
      ],
    },
  },
};

const KEY_DATA_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/key-data',
  notes: ['This endpoint returns the required scoped key metadata.'],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid response will return JSON the scoped key information for every scope that has scoped keys.
            <br />
            **Example** \n
                { \n
                  "https://identity.mozilla.com/apps/sample-scope-can-scope-key": { \n
                    "identifier": "https://identity.mozilla.com/apps/sample-scope-can-scope-key", \n
                    "keyRotationSecret": "0000000000000000000000000000000000000000000000000000000000000000", \n
                    "keyRotationTimestamp": 1506970363512 \n
                  } \n
                }
          `
        }
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -X POST \\\n "https://oauth.accounts.firefox.com/v1/key-data" \\\n  -H \'cache-control: no-cache\' \\\n  -H \'content-type: application/json\' \\\n  -d \'{\n   "client_id": "5901bd09376fadaa",\n   "assertion": "eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7Imt0eSI6IlJTQSIsIm4iOiJvWmdsNkpwM0Iwcm5BVXppNThrdS1iT0RvR3ZuUGNnWU1UdXQ1WkpyQkJiazBCdWU4VUlRQ0dnYVdrYU5Xb29INkktMUZ6SXU0VFpZYnNqWGJ1c2JRRlQxOGREUkN6VVRubFlXdVZXUzhoSWhKc3lhZHJwSHJOVkI1VndmSlRKZVgwTjFpczBXcU1qdUdOc2VMLXluYnFjOVhueElncFJaai05QnZqY2ZKYXNOUTNZdHR3VHZVaFJOLVFGNWgxQkY1MnA2QmdOTVBvWmQ5MC1EU0xydlpseXp6MEh0Q2tFZnNsc013czVkR0ExTlZ1dEwtcGVDeU50VTFzOEtFaDlzcGxXeF9lQlFybTlYQU1kYXp5ZWR6VUpJU1UyMjZmQzhEUHh5c0ZreXpCbjlDQnFDQUpTNjQzTGFydUVDaS1rMGhKOWFmM2JXTmJnWmpSNVJ2NXF4THciLCJlIjoiQVFBQiJ9LCJwcmluY2lwYWwiOnsiZW1haWwiOiIwNjIxMzM0YzIwNjRjNmYzNmJlOGFkOWE0N2M1NTliY2FwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9LCJpYXQiOjE1MDY5Njk2OTU0MzksImV4cCI6MTUwNjk2OTY5NjQzOSwiZnhhLXZlcmlmaWVkRW1haWwiOiIzMjM2NzJiZUBtb3ppbGxhLmNvbSIsImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.hFZd5zFheXOFrXKkJvw6Vpv2l7ctlxuBTvuh5f_jLPAjZoJ9ri-vaJjL_WYBFUvS2xHzfx3-ldxLddyTKwCDAJeB_NkOFL_WJSrMet9C7_Z1hH9HmydeXIT82xJmhrwzW-WOO4ibQvRbocEFiNujynKsg1gS8v0iiYjIX-0cXCrlkxkbVx_8EXJFKDDOGzK9v7Zq6D7gkhP-CHEaNYaTHMn65tLQtBS6snGdaXlxoGHMWmDL6STbnJzWa7sa4QwHf-AgT1rUkQQAUHNa_XLZ0FEzqiCPctMadlihiUZL2V6vxIDBS4mHUF4qj0FvIMJflivDnJVkRNijDuP-h-Lh_A~eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJvYXV0aC5meGEiLCJleHAiOjE1MDY5Njk2OTY0MzksImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.M5xyk3RffucgaavjbUm7Eqnt47hzeGbGa2VR3jnVEIlRHfz5S25Qf3ngejwee7XECvIywbaKWeijXFOwS-EkB-7qP1gl4oNJjPmbnCk7S1lgckLWvdMIU-HLGKjrN6Mw76__LzvAbsusSeGmsvTCIVuOJ49Xs3tC1fLyB_re0QNpCcS6AUnJ1KOxIMEM3Om7ysNO5F_AqcD3PwlEti5lbwSk8iP5TWL12C2Nkb_6Hxze_mA1NZNAHOips9bF2J7oy1hqGoMYj1XYZrsyjpPWEuZQATAPlKSjbh1hq-UtDeT7DlwEmIbIUd3JA8qh1MkHKGgavd4fIMap0IPmr9rs4A",\n   "scope": "https://identity.mozilla.com/apps/sample-scope-can-scope-key"\n}\'',
        },
      ],
    },
  },
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
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid request will return a JSON response.
            <br />
            **Example:** \n
                {\n
                  "access_token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0", \n
                  "scope": "profile:email profile:avatar", \n
                  "token_type": "bearer", \n
                  "expires_in": 3600, \n
                  "refresh_token": "58d59cc97c3ca183b3a87a65eec6f93d5be051415b53afbf8491cc4c45dbb0c6", \n
                  "auth_at": 1422336613 \n
                }
          `
        }
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n -X POST \\\n -H "Content-Type: application/json" \\\n "https://oauth.accounts.firefox.com/v1/token" \\\n -d \'{\n  "client_id": "5901bd09376fadaa",\n  "client_secret": "20c6882ef864d75ad1587c38f9d733c80751d2cbc8614e30202dc3d1d25301ff",\n  "ttl": 3600,\n  "grant_type": "authorization_code",\n  "code": "4ab433e31ef3a7cf7c20590f047987922b5c9ceb1faff56f0f8164df053dd94c"\n}\'',
        },
      ],
    },
  },
};

const VERIFY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/verify',
  notes: [
    'Attached services can post tokens to this endpoint to learn about which user and scopes are permitted for the token.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        200: {
          description: dedent`
            A valid request will return a JSON response.

            - Note: \`email\` of the respective user has been **REMOVED**.

            **Example:** \n
                { \n
                  "user": "5901bd09376fadaa076afacef5251b6a", \n
                  "client_id": "45defeda038a1c92", \n
                  "scope": ["profile:email", "profile:avatar"], \n
                }
          `
        },
      },
      'x-codeSamples': [
        {
          lang: 'JavaScript',
          source:
            'curl -v \\\n -X POST \\\n -H "Content-Type: application/json" \\\n "https://oauth.accounts.firefox.com/v1/verify" \\\n -d \'{\n  "token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0"\n}\'',
        },
      ],
    },
  },
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
