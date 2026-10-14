/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import { Knex } from 'knex';

import { EmailType, SentEmail } from '.';
import { defaultOpts, testDatabaseSetup } from '../../testing/helpers';
import { randomAccount } from '../../testing/models/auth/helpers';

describe('SentEmail', () => {
  const emailType = 'subscriptionPaymentFailed';
  const emailParams = {
    subscriptionId: 'sub_bigtime',
    planId: 'plan_bigprice',
  };
  let knex: Knex;
  let emailTypeId: number;

  beforeAll(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });
    emailTypeId = (
      (await EmailType.query().findOne({
        emailType,
      })) as EmailType
    ).id;
  }, 20000);

  afterAll(async () => {
    await knex?.destroy();
  });

  describe('createSentEmail', () => {
    it('inserts correctly without params', async () => {
      const acct = randomAccount();
      const inserted = (await SentEmail.createSentEmail(
        acct.uid,
        emailType
      )) as SentEmail;
      expect(inserted.uid).toBe(acct.uid);
      expect(inserted.emailTypeId).toBe(emailTypeId);
      expect(Math.abs(inserted.sentAt - Date.now())).toBeLessThanOrEqual(2000);
      expect(inserted.params).toBeNull();
    });

    it('inserts correctly with params', async () => {
      const acct = randomAccount();
      const inserted = (await SentEmail.createSentEmail(
        acct.uid,
        emailType,
        emailParams
      )) as SentEmail;
      expect(inserted.uid).toBe(acct.uid);
      expect(inserted.emailTypeId).toBe(emailTypeId);
      expect(Math.abs(inserted.sentAt - Date.now())).toBeLessThanOrEqual(2000);
      expect(inserted.params).toEqual(emailParams);
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
      expect(actual).toEqual(expected);
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
      expect(actual).toEqual(expected);
    });

    it('returns undefined when no match record is found', async () => {
      const acct = randomAccount();
      await SentEmail.createSentEmail(acct.uid, emailType, emailParams);
      const actual = await SentEmail.findLatestSentEmailByType(
        acct.uid,
        'subscriptionPaymentExpired',
        emailParams
      );
      expect(actual).toBeUndefined();
    });
  });
});
