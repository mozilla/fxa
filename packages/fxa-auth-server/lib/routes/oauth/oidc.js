/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: Notes below used as reference while creating proof of concept
//
// This file implements the OAuth "token endpoint", the core endpoint of the OAuth
// system at which clients can exchange their various types of authorization grant
// for some OAuth tokens.   There's significant complexity here because of the
// different types of grant:
//
//   * `grant_type=authorization_code` for vanilla exchange-a-code-for-a-token OAuth
//   * `grant_type=refresh_token` for refreshing a previously-granted token
//   * `grant_type=fxa-credentials` for directly granting via an FxA identity assertion
//
// And because of the different types of token that can be requested:
//
//   * A short-lived `access_token`
//   * A long-lived `refresh_token`, via `access_type=offline`
//   * An OpenID Connect `id_token`, via `scope=openid`
//
// And because of the different client authentication methods:
//
//   * `client_secret`, provided in either header or request body
//   * PKCE parameters, if using `grant_type=authorization_code` with a public client
//
// So, we've tried to make it as readable as possible, but...be careful in there!

/*jshint camelcase: false*/
import Provider from 'oidc-provider';
const { once } = require('events');

module.exports = ({ log, oauthDB, db, mailer, devices, statsd, glean }) => {
  const configuration = {
    clients: [{
      client_id: 'dcdb5ae7add825d2',
      client_secret: process.env.CLIENT_SECRET_123DONE || 'change me',
      redirect_uris: ['http://localhost:8080/api/oauth'],
    }],
    pkce: {
      required: () => false,
    },
    scopes: ['openid', 'profile', 'email'],
    claims: {
      email: ['email'],
    },
    findAccount: async (ctx, sub, token) => {
      const account = await db.accountRecord(sub);
      return {
        accountId: account.email,
        // @param use {string} - can either be "id_token" or "userinfo", depending on
        //   where the specific claims are intended to be put in
        // @param scope {string} - the intended scope, while oidc-provider will mask
        //   claims depending on the scope automatically you might want to skip
        //   loading some claims from external resources or through db projection etc. based on this
        //   detail or not return them in ID Tokens but only UserInfo and so on
        // @param claims {object} - the part of the claims authorization parameter for either
        //   "id_token" or "userinfo" (depends on the "use" param)
        // @param rejected {Array[String]} - claim names that were rejected by the end-user, you might
        //   want to skip loading some claims from external resources or through db projection
        async claims(use, scope, claims, rejected) {
          return {
            sub: account.uid,
            email: account.email,
          };
        },
      };
    },
  };

  const oidc = new Provider('http://localhost:3030', configuration);

  const callback = oidc.callback();

  return [
    {
      path: `/oidc/{any*}`,
      method: '*',
      config: { payload: { output: 'stream', parse: false } },
      async handler({ raw: { req, res } }, h) {
        req.originalUrl = req.url;
        req.url = req.url.replace('/v1/oidc', '');

        callback(req, res);
        await once(res, 'finish');

        req.url = req.url.replace('/', '/v1/oidc');
        delete req.originalUrl;

        return res.finished ? h.abandon : h.continue;
      }
    }
  ];
};
