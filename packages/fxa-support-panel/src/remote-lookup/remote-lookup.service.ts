/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import superagent from 'superagent';

import { AppConfig } from '../config';
import {
  AccountResponse,
  DevicesResponse,
  SubscriptionResponse,
  SigninLocationResponse,
} from './remote-responses.dto';

const MS_IN_SEC = 1000;

@Injectable()
export class RemoteLookupService {
  private authdbUrl: string;
  private authServer: AppConfig['authServer'];

  constructor(configService: ConfigService<AppConfig>) {
    this.authdbUrl = configService.get('authdbUrl') as string;
    this.authServer = configService.get(
      'authServer'
    ) as AppConfig['authServer'];
  }

  /**
   * Helper to include bearer token for auth server calls and extract the body.
   *
   * @param url
   */
  authServerGetBody(url: string): Promise<any> {
    return superagent
      .get(url)
      .set('Authorization', `Bearer ${this.authServer.secretBearerToken}`)
      .set('accept', 'json')
      .then((response) => response.body);
  }

  async account(uid: string): Promise<AccountResponse> {
    const response = await superagent.get(`${this.authdbUrl}/account/${uid}`);
    return response.body;
  }

  async devices(uid: string): Promise<DevicesResponse> {
    const response = await superagent.get(
      `${this.authdbUrl}/account/${uid}/devices`
    );
    return response.body;
  }

  async subscriptions(
    uid: string,
    email: string
  ): Promise<SubscriptionResponse> {
    try {
      const subscriptions = await this.authServerGetBody(
        `${this.authServer.url}${
          this.authServer.subscriptionsSearchPath
        }?uid=${uid}&email=${encodeURIComponent(email)}`
      );
      return subscriptions.map((s: any) => ({
        ...s,
        created: String(new Date(s.created * MS_IN_SEC)),
        current_period_end: String(new Date(s.current_period_end * MS_IN_SEC)),
        current_period_start: String(
          new Date(s.current_period_start * MS_IN_SEC)
        ),
        plan_changed: s.plan_changed
          ? String(new Date(s.plan_changed * MS_IN_SEC))
          : 'N/A',
        previous_product: s.previous_product || 'N/A',
      }));
    } catch (err) {
      // A lack of subscriptions results in a errno 998 for invalid user
      if (err.status === 500 && err.response?.body.errno === 998) {
        return [];
      } else {
        throw err;
      }
    }
  }

  async signinLocations(uid: string): Promise<SigninLocationResponse> {
    const locations = await this.authServerGetBody(
      `${this.authServer.url}${this.authServer.signinLocationsSearchPath}?uid=${uid}`
    );
    return locations.map((v: any) => ({
      ...v,
      lastAccessTime: new Date(v.lastAccessTime),
    }));
  }

  async totpEnabled(uid: string): Promise<boolean> {
    try {
      const response = await superagent.get(`${this.authdbUrl}/totp/${uid}`);
      return response.body.enabled;
    } catch (err) {
      if (err.status === 404) {
        return false;
      }
      throw err;
    }
  }
}
