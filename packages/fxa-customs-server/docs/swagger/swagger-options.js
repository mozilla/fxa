/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const dedent = require('dedent');

module.exports = {
  info: {
    title: 'Firefox Accounts Customs Server API Documentation',
    description: dedent`
      # Overview

      ## Request Format
      None of the requests are authenticated. The customs server is an internal service that is running on the same machine as the service that uses it (currently only the auth server) and is listening on localhost.

      ## Response Format
      All successful requests will produce a response with HTTP status code of "200" and content-type of "application/json". The structure of the response body will depend on the endpoint in question.

      Failures due to invalid behavior from the client will produce a response with HTTP status code of "400" and content-type of "application/json". Failures due to an unexpected situation on the server will produce a response with HTTP status code of "500" and content-type of "application/json".

      ## API Endpoints
      - [GET /allowedEmailDomains](#operation/getAllowedemaildomains)
      - [GET /allowedIps](#operation/getAllowedips)
      - [GET /allowedPhoneNumbers](#operation/getAllowedphonenumbers)
      - [GET /limits](#operation/getLimits)
      - [GET /](#operation/get)
      - [POST /blockEmail](#operation/postBlockemail)
      - [POST /blockIp](#operation/postBlockip)
      - [POST /check](#operation/postCheck)
      - [POST /checkAuthenticated](#operation/postCheckauthenticated)
      - [POST /checkIpOnly](#operation/postCheckiponly)
      - [POST /failedLoginAttempt](#operation/postFailedloginattempt)
      - [POST /passwordReset](#operation/postPasswordreset)
    `,
  },
  basePath: '/',
  schemes: ['https'],
  grouping: 'tags',
  documentationPage: false,
  swaggerUI: false,
};
