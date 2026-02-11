/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';

export const NETWORK_SERVER_ERROR = new ApolloError({
  graphQLErrors: [],
  networkError: {
    name: 'ServerError',
    message: 'Response not successful: Received status code 400',
    response: new Response(),
    statusCode: 400,
    result: {
      errors: [
        {
          message: 'Cannot query field "MOOO" on type "CowExperimentType".',
          locations: [
            {
              line: 3,
              column: 5,
            },
          ],
        },
      ],
    },
  },
});

export const NETWORK_SERVER_PARSE_ERROR = new ApolloError({
  graphQLErrors: [],
  networkError: {
    name: 'ServerParseError',
    message:
      'JSON.parse: unexpected character at line 1 column 1 of the JSON data',
    response: new Response(),
    statusCode: 404,
    bodyText:
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta http-equiv="content-type" content="text/html; charset=utf-8">\n  <title>Page not found at /graphql</title>\n  <meta name="robots" content="NONE,NOARCHIVE">\n  <style type="text/css">\n    html * { padding:0; margin:0; }\n    body * { padding:10px 20px; }\n    body * * { padding:0; }\n    body { font:small sans-serif; background:#eee; color:#000; }\n    body>div { border-bottom:1px solid #ddd; }\n    h1 { font-weight:normal; margin-bottom:.4em; }\n    h1 span { font-size:60%; color:#666; font-weight:normal; }\n    table { border:none; border-collapse: collapse; width:100%; }\n    td, th { vertical-align:top; padding:2px 3px; }\n    th { width:12em; text-align:right; color:#666; padding-right:.5em; }\n    #info { background:#f6f6f6; }\n    #info ol { margin: 0.5em 4em; }\n    #info ol li { font-family: monospace; }\n    #summary { background: #ffc; }\n    #explanation { background:#eee; border-bottom: 0px none; }\n    pre.exception_value { font-family: sans-serif; color: #575757; font-size: 1.5em; margin: 10px 0 10px 0; }\n  </style>\n</head>\n<body>\n  <div id="summary">\n    <h1>Page not found <span>(404)</span></h1>\n    \n    <table class="meta">\n      <tr>\n        <th>Request Method:</th>\n        <td>POST</td>\n      </tr>\n      <tr>\n        <th>Request URL:</th>\n        <td>https://localhost/graphql</td>\n      </tr>\n      \n    </table>\n  </div>\n  <div id="info">\n    \n      <p>\n      Using the URLconf defined in <code>experimenter.urls</code>,\n      Django tried these URL patterns, in this order:\n      </p>\n      <ol>\n        \n          <li>\n            \n                ^media/(?P&lt;path&gt;.*)$\n                \n            \n          </li>\n        \n          <li>\n            \n                ^api/v1/experiments/\n                \n            \n          </li>\n        \n          <li>\n            \n                ^api/v2/experiments/\n                \n            \n          </li>\n        \n          <li>\n            \n                ^api/v3/\n                \n            \n          </li>\n        \n          <li>\n            \n                ^api/v5/\n                \n            \n          </li>\n        \n          <li>\n            \n                ^api/v6/\n                \n            \n          </li>\n        \n          <li>\n            \n                ^admin/\n                \n            \n          </li>\n        \n          <li>\n            \n                ^experiments/\n                \n            \n          </li>\n        \n          <li>\n            \n                ^nimbus/\n                [name=\'nimbus-list\']\n            \n          </li>\n        \n          <li>\n            \n                ^nimbus/(?P&lt;slug&gt;[\\w-]+)/\n                [name=\'nimbus-detail\']\n            \n          </li>\n        \n          <li>\n            \n                ^$\n                [name=\'home\']\n            \n          </li>\n        \n          <li>\n            \n                ^404/\n                \n            \n          </li>\n        \n      </ol>\n      <p>\n        \n          The current path, <code>graphql</code>,\n        \n        didn’t match any of these.\n      </p>\n    \n  </div>\n\n  <div id="explanation">\n    <p>\n      You’re seeing this error because you have <code>DEBUG = True</code> in\n      your Django settings file. Change that to <code>False</code>, and Django\n      will display a standard 404 page.\n    </p>\n  </div>\n</body>\n</html>\n',
  },
});

export const NETWORK_ERROR = new ApolloError({
  graphQLErrors: [],
  networkError: {
    name: 'Error',
    message: 'Response not successful: Received status code 400',
    response: new Response(),
    statusCode: 400,
    result: {
      errors: [
        {
          message: 'Cannot query field "WOOT" on type "NimbusExperimentType".',
          locations: [
            {
              line: 3,
              column: 5,
            },
          ],
        },
      ],
    },
  },
});

export const GQL_ERROR = new ApolloError({
  graphQLErrors: [new GraphQLError('Received incompatible instance "MOO".')],
  networkError: null,
});

export const GQL_ERROR_MULTIPLE = new ApolloError({
  graphQLErrors: [
    new GraphQLError('Received incompatible instance "b".'),
    new GraphQLError('Received incompatible instance "a".'),
    new GraphQLError('Received incompatible instance "d".'),
  ],
  networkError: null,
});
