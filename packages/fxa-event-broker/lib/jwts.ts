/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as jwtool from 'fxa-jwtool';

// SET Event identifiers
export const SUBSCRIPTION_STATE_EVENT_ID =
  'https://schemas.accounts.firefox.com/event/subscription-state-change';

type securityEvent = {
  uid: string;
  clientId: string;
  events?: {
    [key: string]: {
      [key: string]: any;
    };
  };
};

type subscriptionEvent = {
  uid: string;
  clientId: string;
  capabilities: string[];
  isActive: boolean;
};

type JWTConfig = {
  issuer: string;
  key: any;
};

export class JWT {
  private issuer: string;
  private tokenKey: jwtool.PrivateJWK;

  constructor(config: JWTConfig) {
    this.issuer = config.issuer;
    this.tokenKey = jwtool.JWK.fromObject(config.key, { iss: this.issuer });
  }

  /**
   * Generate a Security Event Token for delivery to Relying Parties.
   *
   * See: https://tools.ietf.org/html/rfc8417
   *
   * @param event
   */
  public generateSET(event: securityEvent): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      aud: event.clientId,
      events: event.events,
      sub: event.uid
    };
    return this.tokenKey.sign(claims);
  }

  /**
   * Generate a Subscription Security Event Token.
   *
   * @param subEvent
   */
  public generateSubscriptionSET(subEvent: subscriptionEvent): Promise<string> {
    return this.generateSET({
      clientId: subEvent.clientId,
      events: {
        [SUBSCRIPTION_STATE_EVENT_ID]: {
          capabilities: subEvent.capabilities,
          id: subEvent.uid,
          isActive: subEvent.isActive
        }
      },
      uid: subEvent.uid
    });
  }
}
