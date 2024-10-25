/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { assert } from 'chai';
import { Knex } from 'knex';

import { EmailType, SentEmail } from '../../../../db/models/auth';
import { defaultOpts, testDatabaseSetup } from '../../../../test/db/helpers';
import { randomAccount } from '../../../../test/db/models/auth/helpers';

describe('#integration - SentEmail', () => {
  const emailType = 'subscriptionPaymentFailed';
  const emailParams = {
    subscriptionId: 'sub_bigtime',
    planId: 'plan_bigprice',
  };
  let knex: Knex;
  let emailTypeId: number;

  before(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });
    const firstEmailType = await EmailType.query().findOne({
      emailType,
    });
    assert.isDefined(firstEmailType);
    emailTypeId = firstEmailType.id;
  });

  after(async () => {
    await knex.destroy();
  });

  describe('createSentEmail', () => {
    it('inserts correctly without params', async () => {
      const acct = randomAccount();
      const inserted = await SentEmail.createSentEmail(acct.uid, emailType);
      assert.isDefined(inserted);
      assert.strictEqual(inserted.uid, acct.uid);
      assert.strictEqual(inserted.emailTypeId, emailTypeId);
      assert.approximately(inserted.sentAt, Date.now(), 2000);
      assert.isNull(inserted.params);
    });

    it('inserts correctly with params', async () => {
      const acct = randomAccount();
      const inserted = await SentEmail.createSentEmail(
        acct.uid,
        emailType,
        emailParams
      );
      assert.isDefined(inserted);
      assert.strictEqual(inserted.uid, acct.uid);
      assert.strictEqual(inserted.emailTypeId, emailTypeId);
      assert.approximately(inserted.sentAt, Date.now(), 2000);
      assert.deepEqual(inserted.params, emailParams);
    });
  });

  describe('findLatestSentEmailByType', () => {
    it('finds the correct record without params', async () => {
      const acct = randomAccount();
      await SentEmail.createSentEmail(acct.uid, emailType);
      const expected = await SentEmail.createSentEmail(acct.uid, emailType);
      const actual = await SentEmail.findLatestSentEmailByType(
        acct.uid,
        emailType
      );
      assert.deepEqual(actual, expected);
    });

    it('finds the correct record with the given params', async () => {
      const acct = randomAccount();
      await SentEmail.createSentEmail(acct.uid, emailType, emailParams);
      const expected = await SentEmail.createSentEmail(
        acct.uid,
        emailType,
        emailParams
      );
      const actual = await SentEmail.findLatestSentEmailByType(
        acct.uid,
        emailType,
        emailParams
      );
      assert.deepEqual(actual, expected);
    });

    it('returns undefined when no match record is found', async () => {
      const acct = randomAccount();
      await SentEmail.createSentEmail(acct.uid, emailType, emailParams);
      const actual = await SentEmail.findLatestSentEmailByType(
        acct.uid,
        'subscriptionPaymentExpired',
        emailParams
      );
      assert.isUndefined(actual);
    });
  });
});
