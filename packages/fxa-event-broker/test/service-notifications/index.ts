/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Chance from 'chance';
import { FactoryBot } from 'factory-bot-ts';

import { LoginEvent } from './login-event';
import { SubscriptionEvent } from './subscription-event';

const chance = new Chance.Chance();

export interface MetricsContext {
  [key: string]: string;
}

FactoryBot.define(
  'subscriptionEvent',
  {
    event: 'subscription:update',
    isActive: () => chance.bool(),
    metricsContext: {},
    productCapabilities: (): string[] =>
      [...new Array(chance.integer({ max: 5, min: 1 }))].map(() => chance.word()),
    productName: () => chance.word(),
    subscriptionId: () => chance.hash(),
    ts: () => new Date().getTime(),
    uid: () => chance.hash()
  },
  SubscriptionEvent
);

FactoryBot.define(
  'loginEvent',
  {
    clientId: () => chance.hash(),
    deviceCount: () => chance.integer({ min: 1, max: 3 }),
    email: () => chance.email(),
    event: 'login',
    metricsContext: {},
    service: () => chance.word(),
    ts: () => new Date().getTime(),
    uid: () => chance.hash(),
    userAgent: () => chance.word()
  },
  LoginEvent
);

export { FactoryBot, LoginEvent, SubscriptionEvent };
