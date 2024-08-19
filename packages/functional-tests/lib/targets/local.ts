/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BoolString } from '../../../fxa-auth-client/lib/client';
import { TargetName } from '.';
import { BaseTarget, Credentials } from './base';

const RELIER_CLIENT_ID = 'dcdb5ae7add825d2';
const SUB_PRODUCT = 'prod_GqM9ToKK62qjkK';
const SUB_PRODUCT_NAME = '123Done Pro';
const SUB_PLAN = 'plan_GqM9N6qyhvxaVk';

export class LocalTarget extends BaseTarget {
  static readonly target = 'local';
  readonly name: TargetName = LocalTarget.target;
  readonly contentServerUrl = 'http://localhost:3030';
  readonly paymentsServerUrl = 'http://localhost:3031';
  readonly relierUrl = 'http://localhost:8080';
  readonly relierClientID = RELIER_CLIENT_ID;
  readonly subscriptionConfig = {
    product: SUB_PRODUCT,
    name: SUB_PRODUCT_NAME,
    plan: SUB_PLAN,
  };

  constructor() {
    super('http://localhost:9000', 'http://localhost:9001');
  }

  async createAccount(
    email: string,
    password: string,
    options = { lang: 'en', preVerified: 'true' as BoolString }
  ) {
    const result = await this.authClient.signUp(email, password, options);
    await this.authClient.deviceRegister(
      result.sessionToken,
      'playwright',
      'tester'
    );
    return {
      email,
      password,
      ...result,
    } as Credentials;
  }
}
