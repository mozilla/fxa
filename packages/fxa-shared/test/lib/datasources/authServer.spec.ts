/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { DataSourceConfig } from 'apollo-datasource';
import { assert } from 'chai';
import Chance from 'chance';
import sinon, { stubInterface } from 'ts-sinon';
import { Container } from 'typedi';

import { fxAccountClientToken } from '../../../lib/constants';
import {
  AuthServerSource,
  snakeToCamelObject,
} from '../../../lib/datasources/authServer';
import { Context } from '../../../lib/server';
import { mockContext } from '../mocks';

const sandbox = sinon.createSandbox();

const chance = new Chance();

function randomHexId() {
  return chance.guid({ version: 4 }).replace(/-/g, '');
}

function randomSubscription() {
  return {
    created: chance.timestamp(),
    current_period_end: chance.timestamp(),
    current_period_start: chance.timestamp(),
    cancel_at_period_end: chance.bool(),
    end_at: chance.timestamp(),
    latest_invoice: 'invoice_1234',
    plan_id: 'plan_1234',
    product_name: '123done',
    product_id: 'product_1234',
    status: 'active',
    subscription_id: 'subscription_1234',
  };
}

function randomAttachedClient() {
  return {
    clientId: randomHexId(),
    deviceId: randomHexId(),
    sessionTokenId: randomHexId(),
    refreshTokenId: randomHexId(),
    isCurrentSession: chance.bool(),
    deviceType: chance.name(),
    name: chance.name(),
    createdTime: chance.timestamp(),
    createdTimeFormatted: '',
    lastAccessTime: chance.timestamp(),
    lastAccessTimeFormatted: '',
    approximateLastAccessTime: chance.timestamp(),
    approximateLastAccessTimeFormatted: '',
    scope: [],
    location: null,
    userAgent: chance.name(),
    os: chance.name(),
  };
}

describe('AuthServerSource', () => {
  let authClient: any;
  let context;
  let authSource: AuthServerSource;

  beforeEach(() => {
    sandbox.resetBehavior();
    sandbox.resetHistory();
    authClient = {
      account: sandbox.stub(),
      attachedClients: sandbox.stub(),
      checkTotpTokenExists: sandbox.stub(),
      recoveryKeyExists: sandbox.stub(),
      deleteRecoveryKey: sandbox.stub(),
      sessionStatus: sandbox.stub(),
      recoveryEmailCreate: sandbox.stub(),
      recoveryEmailDestroy: sandbox.stub(),
      recoveryEmailSetPrimaryEmail: sandbox.stub(),
      recoveryEmailSecondaryResendCode: sandbox.stub(),
      recoveryEmailSecondaryVerifyCode: sandbox.stub(),
      sessionResendVerifyCode: sandbox.stub(),
      sessionVerifyCode: sandbox.stub(),
      sessionDestroy: sandbox.stub(),
    };
    Container.set(fxAccountClientToken, authClient);
    context = mockContext() as Context;
    authSource = new AuthServerSource();
    const config = stubInterface<DataSourceConfig<Context>>();
    config.context = context;
    authSource.initialize(config);
  });

  describe('snakeToCamelObject', () => {
    it('converts to camelCase', () => {
      const sub = randomSubscription();
      const alteredSub = snakeToCamelObject(sub);
      assert.includeMembers(Object.keys(alteredSub), [
        'currentPeriodEnd',
        'currentPeriodStart',
        'productId',
        'planId',
      ]);
    });
  });

  describe('subscriptions', () => {
    it('returns a transformed subscription', async () => {
      const sub = randomSubscription();
      const alteredSub = snakeToCamelObject(sub);
      authClient.account.resolves({ subscriptions: [sub] });
      const result = await authSource.subscriptions();
      assert.deepEqual(result, [alteredSub]);
    });

    it('returns no subscriptions', async () => {
      authClient.account.resolves({ subscriptions: [] });
      const result = await authSource.subscriptions();
      assert.deepEqual(result, []);
    });
  });

  describe('attachedClients', () => {
    it('returns an attached client', async () => {
      const client = randomAttachedClient();
      authClient.attachedClients.resolves([client]);
      const result = await authSource.attachedClients();
      assert.deepEqual(result, [client]);
    });
  });

  describe('totp', () => {
    it('returns totp status', async () => {
      const totp = { exists: true, verified: false };
      authClient.checkTotpTokenExists.resolves(totp);
      const result = await authSource.totp();
      assert.deepEqual(result, totp);
    });
  });

  describe('hasRecoveryKey', () => {
    it('returns recovery key existence', async () => {
      const rec = { exists: true };
      authClient.recoveryKeyExists.resolves(rec);
      const result = await authSource.hasRecoveryKey();
      assert.isTrue(result);
    });
  });

  for (const name of [
    'recoveryEmailCreate',
    'recoveryEmailDestroy',
    'recoveryEmailSetPrimaryEmail',
    'recoveryEmailSecondaryResendCode',
    'recoveryEmailSecondaryVerifyCode',
    'sessionResendVerifyCode',
    'sessionVerifyCode',
    'deleteRecoveryKey',
    'sessionDestroy',
  ]) {
    describe(name, () => {
      it('returns', async () => {
        authClient[name].resolves(true);
        const result = await (authSource as any)[name]();
        assert.isTrue(result);
      });
    });
  }
});
