/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hapi from '@hapi/hapi';
import { OAuth2Client } from 'google-auth-library';

const authClient = new OAuth2Client();

type PubSubOptions = { audience?: string; authenticate?: boolean; verificationToken?: string };

/** Google PubSub Push Endpoint Authentication Plugin for Hapi */
export class PubSubScheme {
  private audience: string;
  private verificationToken: string;
  private verifyAuth: boolean;

  constructor(server: hapi.Server, options?: hapi.ServerAuthSchemeOptions) {
    if (!options) {
      throw new Error('Invalid options for pubsub auth scheme');
    }
    const opts = options as PubSubOptions;
    this.audience = opts.audience ?? '';
    this.verificationToken = opts.verificationToken ?? '';
    this.verifyAuth = opts.authenticate ?? false;
  }

  /**
   * Authenticate a Google PubSub message using the included JWT.
   *
   * See https://cloud.google.com/pubsub/docs/push#authentication_and_authorization_by_the_push_endpoint
   * for details on the authentication steps.
   *
   * @param request
   * @param h
   */
  public async authenticate(
    request: hapi.Request,
    h: hapi.ResponseToolkit
  ): Promise<hapi.Auth | void> {
    if (!this.verifyAuth) {
      return h.authenticated({ credentials: {} });
    }

    if (request.query.token !== this.verificationToken) {
      throw new Error('Invalid application token: ' + request.query.token);
    }

    // Verify that the push request originates from Cloud Pub/Sub.
    try {
      // Get the Cloud Pub/Sub-generated JWT in the "Authorization" header.
      const bearer = request.headers.authorization;
      const token = (bearer.match(/Bearer (.*)/) as string[])[1];

      // Verify and decode the JWT.
      const ticket = await authClient.verifyIdToken({
        audience: this.audience,
        idToken: token
      });
      const claim = ticket.getPayload();
      if (claim) {
        return h.authenticated({ credentials: { app: claim } });
      }
      return h.unauthenticated(new Error('No claims found'));
    } catch (e) {
      return h.unauthenticated(new Error(`Invalid JWT token: ${e}`));
    }
  }
}

/** Configure the Hapi Authentication Plugin */
export default function(server: hapi.Server, options?: hapi.ServerAuthSchemeOptions) {
  return new PubSubScheme(server, options);
}
