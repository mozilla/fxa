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
    clients: [
      {
        client_id: 'dcdb5ae7add825d2',
        client_secret: process.env.CLIENT_SECRET_123DONE || 'change me',
        redirect_uris: ['http://localhost:8080/api/oauth'],
      },
    ],
    pkce: {
      required: () => false,
    },
    scopes: ['openid', 'profile', 'email'],
    claims: {
      email: ['email'],
    },
    cookies: {
      long: {
        httpOnly: true,
        overwrite: true,
        sameSite: 'lax',
      },
    },
    findAccount: async (ctx, sub, token) => {
      const account = await db.accountRecord(sub);
      return {
        accountId: account.email,
        async claims(use, scope, claims, rejected) {
          return {
            sub: account.uid,
            email: account.email,
          };
        },
      };
    },
    interactions: {
      url(ctx, interaction) {
        // For other interactions, return the default URL
        return `/v1/interaction/${interaction.uid}`;
      },
    },
    features: {
      // disable the packaged interactions
      devInteractions: { enabled: false },
    },
  };

  const oidc = new Provider('http://localhost:3030', configuration);

  oidc.use(async (ctx, next) => {
    console.log('pre middleware', ctx.method, ctx.path);
    await next();
    console.log('post middleware', ctx.method, ctx.url);
  });

  const callback = oidc.callback();

  return [
    {
      path: '/interaction/{uid}',
      method: 'GET',
      async handler(request, h) {
        try {
          const { uid } = request.params;
          const details = await oidc.interactionDetails(
            request.raw.req,
            request.raw.res
          );

          if (details.prompt.name === 'consent') {
            // Automatically approve consent
            const interactionDetails = await oidc.interactionDetails(
              request.raw.req,
              request.raw.res
            );
            const {
              prompt: { details },
              params,
              session: { accountId },
            } = interactionDetails;

            let { grantId } = interactionDetails;
            let grant;

            if (grantId) {
              // we'll be modifying existing grant in existing session
              grant = await oidc.Grant.find(grantId);
            } else {
              // we're establishing a new grant
              grant = new oidc.Grant({
                accountId,
                clientId: params.client_id,
              });
            }

            if (details.missingOIDCScope) {
              grant.addOIDCScope(details.missingOIDCScope.join(' '));
            }
            if (details.missingOIDCClaims) {
              grant.addOIDCClaims(details.missingOIDCClaims);
            }
            if (details.missingResourceScopes) {
              for (const [indicator, scopes] of Object.entries(
                details.missingResourceScopes
              )) {
                grant.addResourceScope(indicator, scopes.join(' '));
              }
            }

            grantId = await grant.save();

            const consent = {};
            if (!interactionDetails.grantId) {
              // we don't have to pass grantId to consent, we're just modifying existing one
              consent.grantId = grantId;
            }

            const result = { consent };
            await oidc.interactionFinished(
              request.raw.req,
              request.raw.res,
              result,
              { mergeWithLastSubmission: true }
            );

            await once(request.raw.res, 'finish');
            return request.raw.res.finished ? h.abandon : h.continue;
          }
          if (details.prompt.name === 'login') {
            const searchParams = new URLSearchParams(details.params);
            searchParams.set('response_mode', 'query');
            return h.redirect(
              `http://localhost:3030/oauth/signin/?${searchParams.toString()}&interaction=${uid}`
            );
          }
        } catch (err) {
          console.log(err);
        }
      },
    },
    {
      method: 'POST',
      path: '/interaction/{uid}/login',
      async handler(request, h) {
        const { email } = request.payload;
        // Verify the user/session token

        // Finish the interaction
        await oidc.interactionFinished(
          request.raw.req,
          request.raw.res,
          {
            login: { accountId: email },
          },
          { mergeWithLastSubmission: false }
        );
        await once(request.raw.res, 'finish');

        return request.raw.res.finished ? h.abandon : h.continue;
      },
    },
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
      },
    },
  ];
};
