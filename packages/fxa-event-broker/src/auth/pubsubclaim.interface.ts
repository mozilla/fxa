/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Google PubSub JWT
 *
 * See: https://cloud.google.com/pubsub/docs/push#jwt_format
 */
export interface PubSubJWT {
  aud: string;
  azp: string;
  email: string;
  sub: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  iss: string;
}
