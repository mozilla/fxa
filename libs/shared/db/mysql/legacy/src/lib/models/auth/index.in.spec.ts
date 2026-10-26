/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import { Knex } from 'knex';
import { ValidationError } from 'objection';

import {
  Account,
  AccountCustomers,
  accountExists,
  createAccountCustomer,
  createPayPalBA,
  deleteAccountCustomer,
  deleteAllPayPalBAs,
  getAccountCustomerByUid,
  getAllPayPalBAByUid,
  getPayPalBAByBAId,
  getUidAndEmailByStripeCustomerId,
  LinkedAccount,
  updateAccountCustomer,
  updatePayPalBA,
} from '.';
import { defaultOpts, testDatabaseSetup } from '../../testing/helpers';
import {
  chance,
  randomAccount,
  randomEmail,
} from '../../testing/models/auth/helpers';
import { sanitizeIp } from './security-event';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
import { Device } from '.';

describe('auth', () => {
  let knex: Knex;

  beforeAll(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });
    // Load the user in
    await Account.query().insertGraph({ ...USER_1, emails: [EMAIL_1] });
  }, 20000);

  afterAll(async () => {
    await knex?.destroy();
  });

  describe('accountExists', () => {
    it('returns true if the account is found', async () => {
      expect(await accountExists(USER_1.uid)).toBe(true);
    });

    it('returns false if the account is not found', async () => {
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      expect(await accountExists(uid)).toBe(false);
    });
  });

  describe('getUidAndEmailByStripeCustomerId', () => {
    const stripeCustomerId = 'cus_123456789';
    beforeAll(async () => {
      await createAccountCustomer(USER_1.uid, stripeCustomerId);
    });
    it('finds an existing FxA user id and email', async () => {
      const result = await getUidAndEmailByStripeCustomerId(stripeCustomerId);
      expect(result).toBeDefined();
      expect(result.uid).toBe(USER_1.uid);
      expect(result.email).toBe(USER_1.email);
    });
    it('returns null for uid and email if the stripeCustomerId is not found', async () => {
      const { uid, email } = await getUidAndEmailByStripeCustomerId('cus_123');
      expect(uid).toBeNull();
      expect(email).toBeNull();
    });
  });

  describe('accountCustomers CRUD', () => {
    describe('createAccountCustomer', () => {
      const userId = '263e29ad86d245eeabf309e6a125bbfb';
      const customerId = 'cus_I4jZCBRq3aiRKX';
      it('Creates a new customer when the uid and customer id are valid', async () => {
        const testCustomer = (await createAccountCustomer(
          userId,
          customerId
        )) as AccountCustomers;

        expect(testCustomer).toBeDefined();
        expect(testCustomer.uid).toBe(userId);
        expect(testCustomer.stripeCustomerId).toBe(customerId);
        expect(testCustomer.createdAt).not.toBeNull();
        expect(testCustomer.createdAt).toBe(testCustomer.updatedAt);

        // Insert is only attempted when the record for the given uid does not exist.
        const secondCustomer = await createAccountCustomer(
          userId,
          'cus_o8ghropsigjpser'
        );
        expect(secondCustomer?.stripeCustomerId).toBe(
          testCustomer.stripeCustomerId
        );
      });

      it('Fails to create when the uid is invalid', async () => {
        try {
          await createAccountCustomer(
            '27384d1476564252aade14e9c71bec4\\',
            'cus_123'
          );
          throw new Error('Validation error expected for invalid uid');
        } catch (err) {
          expect(err instanceof ValidationError).toBe(true);
          expect(err.message.includes('uid: must match pattern')).toBe(true);
        }
      });

      it('Fails to create when the customer id is invalid', async () => {
        try {
          await createAccountCustomer(
            '27384d1476564252aade14e9c71bec53',
            'cus_12_'
          );
          throw new Error(
            'Validation error expected for invalid stripe customer id'
          );
        } catch (err) {
          expect(err instanceof ValidationError).toBe(true);
          expect(
            err.message.includes('stripeCustomerId: must match pattern')
          ).toBe(true);
        }
      });
    });
    describe('getAccountCustomerByUid', () => {
      const uid = '1bec4927384d147aade165642524e9c7';
      const stripeCustomerId = 'cus_123456789';

      beforeAll(async () => {
        await createAccountCustomer(uid, stripeCustomerId);
      });
      it('finds an existing accountCustomer', async () => {
        const result = (await getAccountCustomerByUid(uid)) as AccountCustomers;
        expect(result).toBeDefined();
        expect(result.uid).toBe(uid);
        expect(result.stripeCustomerId).toBe(stripeCustomerId);
      });

      it('does not find a non-existent accountCustomer', async () => {
        const result = await getAccountCustomerByUid(
          '11114d1476500002aade14e9c71baaaa'
        );
        expect(result).toBeUndefined();
      });

      it('handles bad input', async () => {
        try {
          await getAccountCustomerByUid('asfgewarger089_');
          throw new Error();
        } catch (err) {
          expect(err.message.includes('Invalid hex data')).toBe(true);
        }
      });
    });

    describe('updateAccountCustomer', () => {
      const uid = '00000927384d147aade1656425200000';
      const stripeCustomerId = 'cus_asdf1234';

      beforeAll(async () => {
        await createAccountCustomer(uid, stripeCustomerId);
      });
      it('Returns 1 when a row is successfully updated', async () => {
        expect(await updateAccountCustomer(uid, 'cus_1234')).toBe(1);
      });

      it('Returns 0 when no rows are affected', async () => {
        expect(await updateAccountCustomer('0000', 'cus_1234')).toBe(0);
      });

      it('Throws error when validation fails', async () => {
        try {
          await updateAccountCustomer(uid, '34rsdfg');
          throw new Error();
        } catch (err) {
          expect(err instanceof ValidationError).toBe(true);
        }
      });
    });

    describe('deleteAccountCustomer', () => {
      const uid = 'aa000927384d147aade1656425200000';
      const stripeCustomerId = 'cus_asdf1234';

      beforeAll(async () => {
        await createAccountCustomer(uid, stripeCustomerId);
      });
      it('Returns 1 when a row is successfully deleted', async () => {
        expect(await deleteAccountCustomer(uid)).toBe(1);
      });

      it('Returns 0 when no rows are affected', async () => {
        expect(await deleteAccountCustomer('0000')).toBe(0);
      });
    });
    it('creates, retrieves, updates, and deletes an AccountCustomer successfully', async () => {
      const userId = '27384d1400004252aaaa14e9c71bec49';
      const customerId = 'cus_I4jZCBRq3aiRKX';

      // Test Creation
      const testCustomer = (await createAccountCustomer(
        userId,
        customerId
      )) as AccountCustomers;

      expect(testCustomer).toBeDefined();
      expect(testCustomer.uid).toBe(userId);
      expect(testCustomer.stripeCustomerId).toBe(customerId);
      expect(testCustomer.createdAt).not.toBeNull();
      expect(testCustomer.createdAt).toBe(testCustomer.updatedAt);

      // Test Retrieval
      const locatedCustomer = (await getAccountCustomerByUid(
        userId
      )) as AccountCustomers;
      expect(locatedCustomer).toBeDefined();

      expect(locatedCustomer.uid).toBe(testCustomer.uid);
      expect(locatedCustomer.stripeCustomerId).toBe(
        testCustomer.stripeCustomerId
      );
      expect(locatedCustomer.createdAt).toBe(testCustomer.createdAt);
      expect(locatedCustomer.updatedAt).toBe(testCustomer.updatedAt);

      // Test Update
      const createdAt = testCustomer.createdAt;
      const newCustomerId = 'cus_1234567';
      const numberOfUpdatedRows = await updateAccountCustomer(
        userId,
        newCustomerId
      );
      expect(numberOfUpdatedRows).toBe(1);

      // Test Retreival Again
      const updatedCustomer = (await getAccountCustomerByUid(
        userId
      )) as AccountCustomers;
      expect(updatedCustomer).toBeDefined();
      expect(updatedCustomer.uid).toBe(userId);
      expect(updatedCustomer.stripeCustomerId).toBe(newCustomerId);
      expect(updatedCustomer.createdAt).toBe(createdAt);
      expect(updatedCustomer.updatedAt).not.toBe(createdAt);
      expect(updatedCustomer.updatedAt > createdAt).toBe(true);

      // Test Deletion
      const numberOfAffectedRows = await deleteAccountCustomer(userId);
      expect(numberOfAffectedRows).toBe(1);

      // Test Final Retrieval
      const finallocate = await getAccountCustomerByUid(userId);
      expect(finallocate).toBeUndefined();
    });
  });

  describe('paypalCustomers CRUD', () => {
    describe('createPayPalBA', () => {
      const userId = '263e29ad86d245eeabf309e6a125bbfb';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';
      it('Creates a new billing agreement when the uid and billing agreement id are valid', async () => {
        const testCustomer = await createPayPalBA(
          userId,
          billingAgreementId,
          status
        );

        expect(testCustomer).toBeDefined();
        expect(testCustomer.uid).toBe(userId);
        expect(testCustomer.billingAgreementId).toBe(billingAgreementId);
        expect(testCustomer.status).toBe(status);
        expect(testCustomer.createdAt).not.toBeNull();
      });

      it('Fails to create when the uid is invalid', async () => {
        try {
          await createPayPalBA(
            '27384d1476564252aade14e9c71bec4\\',
            'B-1234XXXXX',
            'Active'
          );
          throw new Error('Validation error expected for invalid uid');
        } catch (err) {
          expect(err instanceof ValidationError).toBe(true);
          expect(err.message.includes('uid: must match pattern')).toBe(true);
        }
      });

      it('Fails to create when the billing agreement id is invalid', async () => {
        try {
          await createPayPalBA(
            '27384d1476564252aade14e9c71bec53',
            'BASDFASDF',
            'Active'
          );
          throw new Error(
            'Validation error expected for invalid billing agreement id'
          );
        } catch (err) {
          expect(err instanceof ValidationError).toBe(true);
          expect(
            err.message.includes('billingAgreementId: must match pattern')
          ).toBe(true);
        }
      });
    });
    describe('getPayPalBAByUid', () => {
      const uid = '1bec4927384d147aade165642524e9c7';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      beforeAll(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('finds an existing paypalCustomer', async () => {
        const result = await getAllPayPalBAByUid(uid);
        expect(result).toBeDefined();
        expect(result).toHaveLength(1);
        const ba = result[0];
        expect(ba.uid).toBe(uid);
        expect(ba.billingAgreementId).toBe(billingAgreementId);
      });

      it('does not find a non-existent paypalCustomer', async () => {
        const result = await getAllPayPalBAByUid(
          '11114d1476500002aade14e9c71baaaa'
        );
        expect(result).toHaveLength(0);
      });

      it('handles bad input', async () => {
        try {
          await getAllPayPalBAByUid('asfgewarger089_');
          throw new Error();
        } catch (err) {
          expect(err.message.includes('Invalid hex data')).toBe(true);
        }
      });
    });

    describe('getPayPalBAByBAId', () => {
      const uid = '10000927384d147aade1656425200000';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      beforeAll(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('finds an existing PayPalBillingAgreements', async () => {
        const result = await getPayPalBAByBAId(billingAgreementId);
        expect(result).toBeDefined();
        expect(result?.uid).toBe(uid);
        expect(result?.billingAgreementId).toBe(billingAgreementId);
      });

      it('does not find a non-existent PayPalBillingAgreements', async () => {
        const result = await getPayPalBAByBAId('B-1234');
        expect(result).toBeUndefined();
      });
    });

    describe('updatePayPalBA', () => {
      const uid = '00000927384d147aade1656425200000';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      beforeAll(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('Returns 1 when a row is successfully updated', async () => {
        expect(await updatePayPalBA(uid, billingAgreementId, 'Cancelled')).toBe(
          1
        );
      });

      it('Returns 0 when no rows are affected', async () => {
        expect(
          await updatePayPalBA('0000', billingAgreementId, 'Cancelled')
        ).toBe(0);
      });

      it('Throws error when validation fails', async () => {
        try {
          await updatePayPalBA(uid, billingAgreementId, '1213212312' as any);
          throw new Error();
        } catch (err) {
          expect(err instanceof ValidationError).toBe(true);
        }
      });
    });

    describe('deletePayPalBA', () => {
      const uid = 'aa000927384d147aade1656425200000';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      beforeAll(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('Returns 1 when a row is successfully deleted', async () => {
        expect(await deleteAllPayPalBAs(uid)).toBe(1);
      });

      it('Returns 0 when no rows are affected', async () => {
        expect(await deleteAllPayPalBAs('0000')).toBe(0);
      });
    });

    it('creates, retrieves, updates, and deletes a Paypal Billing Agreements successfully', async () => {
      const userId = '27384d1400004252aaaa14e9c71bec49';
      const billingAgreementId1 = 'B-1234XXXXX';
      const billingAgreementId2 = 'B-2882XXXXX';
      const status1 = 'Cancelled';
      const status2 = 'Active';

      // Test Creation
      const testBA1 = await createPayPalBA(
        userId,
        billingAgreementId1,
        status1
      );
      const testBA2 = await createPayPalBA(
        userId,
        billingAgreementId2,
        status2
      );

      expect(testBA1).toBeDefined();
      expect(testBA1.uid).toBe(userId);
      expect(testBA1.billingAgreementId).toBe(billingAgreementId1);
      expect(testBA1.createdAt).not.toBeNull();

      expect(testBA2).toBeDefined();
      expect(testBA2.uid).toBe(userId);
      expect(testBA2.billingAgreementId).toBe(billingAgreementId2);
      expect(testBA2.createdAt).not.toBeNull();

      // Test Retrieval
      const locatedBAs = await getAllPayPalBAByUid(userId);
      expect(locatedBAs).toHaveLength(2);

      expect(locatedBAs[0].uid).toBe(testBA2.uid);
      expect(locatedBAs[0].billingAgreementId).toBe(testBA2.billingAgreementId);
      expect(locatedBAs[0].createdAt).toBe(testBA2.createdAt);

      expect(locatedBAs[1].uid).toBe(testBA1.uid);
      expect(locatedBAs[1].billingAgreementId).toBe(testBA1.billingAgreementId);
      expect(locatedBAs[1].createdAt).toBe(testBA1.createdAt);

      // Test Update
      const newStatus = 'Suspended';
      const numberOfUpdatedRows = await updatePayPalBA(
        userId,
        billingAgreementId2,
        newStatus
      );
      expect(numberOfUpdatedRows).toBe(1);

      // Test Retreival Again
      const updatedBA = (await getAllPayPalBAByUid(userId))[0];
      expect(updatedBA).toBeDefined();
      expect(updatedBA.uid).toBe(userId);
      expect(updatedBA.billingAgreementId).toBe(billingAgreementId2);
      expect(updatedBA.status).toBe(newStatus);

      // Test Deletion
      const numberOfAffectedRows = await deleteAllPayPalBAs(userId);
      expect(numberOfAffectedRows).toBe(2);

      // Test Final Retrieval
      const finallocate = await getAllPayPalBAByUid(userId);
      expect(finallocate).toHaveLength(0);
    });
  });

  describe('linkedAccounts', () => {
    const userId = '263e29ad86d245eeabf309e6a125bbfb';
    const GOOGLE_PROVIDER = 'google';
    function getRandomId() {
      return `${Date.now() + Math.random() * 1000}`;
    }

    describe('createLinkedAccount', () => {
      it('creates and get new linked linked account', async () => {
        const id = getRandomId();
        await LinkedAccount.createLinkedAccount(userId, id, GOOGLE_PROVIDER);

        const linkedAccounts = await LinkedAccount.findByUid(userId);

        expect(linkedAccounts.length).toBe(1);

        expect(linkedAccounts[0].uid).toBe(userId);
        expect(linkedAccounts[0].id).toBe(id);
        expect(linkedAccounts[0].providerId).toBe(1);

        const linkedAccount = await LinkedAccount.findByLinkedAccount(
          id,
          GOOGLE_PROVIDER
        );
        expect(linkedAccount?.uid).toBe(userId);
        expect(linkedAccount?.id).toBe(id);
        expect(linkedAccount?.providerId).toBe(1);
      });

      it('can delete linked account', async () => {
        const id = getRandomId();
        await LinkedAccount.createLinkedAccount(userId, id, GOOGLE_PROVIDER);

        await LinkedAccount.deleteLinkedAccount(userId, GOOGLE_PROVIDER);

        const linkedAccount = await LinkedAccount.findByLinkedAccount(
          id,
          GOOGLE_PROVIDER
        );
        expect(linkedAccount).toBeUndefined();
      });
    });
  });

  describe('unverifiedAccounts', () => {
    it('returns a list of unverified accounts in a date range', async () => {
      for (let x = 0; x < 3; x++) {
        const acct = randomAccount();
        const email = randomEmail(acct);
        await Account.query().insertGraph({
          ...acct,
          emailVerified: false,
          emails: [email],
        });
      }
      const unverifiedAccounts = await Account.getEmailUnverifiedAccounts({
        startCreatedAtDate: 0,
        endCreatedAtDate: Date.now(),
      });
      expect(unverifiedAccounts.length).toBe(3);
    });
  });
  describe('Account.revokeTokens', () => {
    const uid = USER_1.uid;
    const OTHER_UID = '0123456789abcdef0123456789abcdef';
    const SESSION_TOKEN_ID = 'aa'.repeat(32);
    const OTHER_SESSION_TOKEN_ID = 'bb'.repeat(32);
    const KEY_FETCH_TOKEN_ID = 'cc'.repeat(32);
    const DEVICE_ID = 'dd'.repeat(16);
    const revokedTables = [
      'sessionTokens',
      'keyFetchTokens',
      'devices',
      'unverifiedTokens',
      'unblockCodes',
    ];

    async function countRows(table: string, forUid: string) {
      const [rows] = await knex.raw(
        `SELECT COUNT(*) AS count FROM ${table} WHERE uid = UNHEX(?)`,
        [forUid]
      );
      return Number(rows[0].count);
    }

    beforeEach(async () => {
      for (const table of revokedTables) {
        await knex.raw(`DELETE FROM ${table}`);
      }
      await knex.raw(
        'INSERT INTO sessionTokens (tokenId, tokenData, uid, createdAt) VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?)',
        [SESSION_TOKEN_ID, SESSION_TOKEN_ID, uid, Date.now()]
      );
      await knex.raw(
        'INSERT INTO sessionTokens (tokenId, tokenData, uid, createdAt) VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?)',
        [OTHER_SESSION_TOKEN_ID, OTHER_SESSION_TOKEN_ID, OTHER_UID, Date.now()]
      );
      await knex.raw(
        'INSERT INTO keyFetchTokens (tokenId, authKey, uid, keyBundle, createdAt) VALUES (UNHEX(?), UNHEX(?), UNHEX(?), UNHEX(?), ?)',
        [KEY_FETCH_TOKEN_ID, 'ee'.repeat(32), uid, 'ff'.repeat(96), Date.now()]
      );
      await knex.raw(
        "INSERT INTO devices (uid, id, sessionTokenId, nameUtf8, type, createdAt) VALUES (UNHEX(?), UNHEX(?), UNHEX(?), 'Test Device', 'mobile', ?)",
        [uid, DEVICE_ID, SESSION_TOKEN_ID, Date.now()]
      );
      await knex.raw(
        'INSERT INTO unverifiedTokens (tokenId, tokenVerificationId, uid) VALUES (UNHEX(?), UNHEX(?), UNHEX(?))',
        [SESSION_TOKEN_ID, '11'.repeat(16), uid]
      );
      await knex.raw(
        'INSERT INTO unblockCodes (uid, unblockCodeHash, createdAt) VALUES (UNHEX(?), UNHEX(?), ?)',
        [uid, '22'.repeat(32), Date.now()]
      );
    });

    for (const table of revokedTables) {
      it(`deletes the account's ${table} rows`, async () => {
        await Account.revokeTokens(uid);
        expect(await countRows(table, uid)).toBe(0);
      });
    }

    it('leaves the account row in place', async () => {
      await Account.revokeTokens(uid);
      expect(await Account.findByUid(uid)).not.toBeNull();
    });

    it("leaves other accounts' sessions untouched", async () => {
      await Account.revokeTokens(uid);
      expect(await countRows('sessionTokens', OTHER_UID)).toBe(1);
    });
  });

  describe('Device.findByUidAndRefreshTokenId', () => {
    beforeEach(async () => {
      const testTables = [
        'devices',
        'deviceCommandIdentifiers',
        'deviceCommands',
      ];
      for (const table of testTables) {
        await knex.raw(`DELETE FROM ${table}`);
      }
    });

    it('returns device when found with refreshTokenId', async () => {
      const uid = USER_1.uid;
      const deviceId = '0123456789abcdef0123456789abcdef';
      const refreshTokenId =
        'abcdef0123456789abcdef0123456789abcdef00000000000000000000000000';

      await knex.raw(
        `
        INSERT INTO devices (uid, id, refreshTokenId, nameUtf8, type, createdAt)
        VALUES (UNHEX(?), UNHEX(?), UNHEX(?), 'Test Device', 'mobile', ?)
      `,
        [uid, deviceId, refreshTokenId, Date.now()]
      );

      const device = await Device.findByUidAndRefreshTokenId(
        uid,
        refreshTokenId
      );

      expect(device).not.toBeNull();
      expect(device?.id).toBe(deviceId);
      expect(device?.refreshTokenId).toBe(refreshTokenId);
      expect(device?.name).toBe('Test Device');
      expect(device?.type).toBe('mobile');
      expect(device?.availableCommands).toEqual(expect.any(Object));
    });

    it('returns null when device not found', async () => {
      const uid = USER_1.uid;
      const refreshTokenId =
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const device = await Device.findByUidAndRefreshTokenId(
        uid,
        refreshTokenId
      );

      expect(device).toBeNull();
    });

    it('aggregates deviceCommands correctly', async () => {
      const uid = USER_1.uid;
      const deviceId = '11111111111111111111111111111111';
      const refreshTokenId =
        '2222222222222222222222222222222222222222222222222222222222222222';

      await knex.raw(
        `
        INSERT INTO devices (uid, id, refreshTokenId, nameUtf8, type, createdAt)
        VALUES (UNHEX(?), UNHEX(?), UNHEX(?), 'Device with Commands', 'desktop', ?)
      `,
        [uid, deviceId, refreshTokenId, Date.now()]
      );

      await knex.raw(`
        INSERT IGNORE INTO deviceCommandIdentifiers (commandName)
        VALUES ('https://identity.mozilla.com/cmd/open-uri'),
               ('https://identity.mozilla.com/cmd/send-tab')
      `);

      // Insert device commands
      const cmdIds = await knex.raw(`
        SELECT commandId FROM deviceCommandIdentifiers
        WHERE commandName IN ('https://identity.mozilla.com/cmd/open-uri',
                              'https://identity.mozilla.com/cmd/send-tab')
      `);

      for (const cmd of cmdIds[0]) {
        await knex.raw(
          `
          INSERT INTO deviceCommands (uid, deviceId, commandId, commandData)
          VALUES (UNHEX(?), UNHEX(?), ?, '{"enabled": true}')
        `,
          [uid, deviceId, cmd.commandId]
        );
      }

      const device = (await Device.findByUidAndRefreshTokenId(
        uid,
        refreshTokenId
      )) as Device;

      expect(device).not.toBeNull();
      expect(device.availableCommands).toEqual(expect.any(Object));
      expect(Object.keys(device.availableCommands).length).toBe(2);
      expect(
        typeof device.availableCommands[
          'https://identity.mozilla.com/cmd/open-uri'
        ]
      ).toBe('string');
      expect(
        typeof device.availableCommands[
          'https://identity.mozilla.com/cmd/send-tab'
        ]
      ).toBe('string');
    });
  });

  describe('Device.countByUid', () => {
    const uid = USER_1.uid;
    const OTHER_UID = '0123456789abcdef0123456789abcdef';
    const LIVE_SESSION_TOKEN_ID = 'aa'.repeat(32);
    const GONE_SESSION_TOKEN_ID = 'bb'.repeat(32);
    const REFRESH_TOKEN_ID = 'cc'.repeat(32);
    const CREATED_AT = 1_700_000_000_000;

    async function insertDevice(
      forUid: string,
      id: string,
      sessionTokenId: string | null,
      refreshTokenId: string | null
    ) {
      await knex.raw(
        "INSERT INTO devices (uid, id, sessionTokenId, refreshTokenId, nameUtf8, type, createdAt) VALUES (UNHEX(?), UNHEX(?), UNHEX(?), UNHEX(?), 'Test Device', 'mobile', ?)",
        [forUid, id, sessionTokenId, refreshTokenId, CREATED_AT]
      );
    }

    beforeEach(async () => {
      await knex.raw('DELETE FROM devices');
      await knex.raw('DELETE FROM sessionTokens');
      await knex.raw(
        'INSERT INTO sessionTokens (tokenId, tokenData, uid, createdAt) VALUES (UNHEX(?), UNHEX(?), UNHEX(?), ?)',
        [LIVE_SESSION_TOKEN_ID, LIVE_SESSION_TOKEN_ID, uid, CREATED_AT]
      );
    });

    it('returns 0 when the user has no devices', async () => {
      expect(await Device.countByUid(uid)).toBe(0);
    });

    it('counts a device backed by a live session token', async () => {
      await insertDevice(uid, '11'.repeat(16), LIVE_SESSION_TOKEN_ID, null);
      expect(await Device.countByUid(uid)).toBe(1);
    });

    it('counts a device backed only by a refresh token', async () => {
      await insertDevice(uid, '22'.repeat(16), null, REFRESH_TOKEN_ID);
      expect(await Device.countByUid(uid)).toBe(1);
    });

    it('counts a device whose session token is gone but has a refresh token', async () => {
      await insertDevice(
        uid,
        '33'.repeat(16),
        GONE_SESSION_TOKEN_ID,
        REFRESH_TOKEN_ID
      );
      expect(await Device.countByUid(uid)).toBe(1);
    });

    it('excludes a zombie device with no session token row and no refresh token', async () => {
      await insertDevice(uid, '44'.repeat(16), GONE_SESSION_TOKEN_ID, null);
      expect(await Device.countByUid(uid)).toBe(0);
    });

    it('excludes devices belonging to other users', async () => {
      await insertDevice(OTHER_UID, '55'.repeat(16), null, REFRESH_TOKEN_ID);
      expect(await Device.countByUid(uid)).toBe(0);
    });

    it('matches the length of findByUid on a mixed fixture', async () => {
      await insertDevice(uid, '11'.repeat(16), LIVE_SESSION_TOKEN_ID, null);
      await insertDevice(uid, '22'.repeat(16), null, REFRESH_TOKEN_ID);
      await insertDevice(uid, '44'.repeat(16), GONE_SESSION_TOKEN_ID, null);
      await insertDevice(OTHER_UID, '55'.repeat(16), null, REFRESH_TOKEN_ID);

      const count = await Device.countByUid(uid);
      expect(count).toBe(2);
      expect(count).toBe((await Device.findByUid(uid)).length);
    });
  });
});

describe('security-event', () => {
  describe('sanitizes ip address', () => {
    it('handles multiple ips', () => {
      const ip = sanitizeIp(' 127.0.0.1, 127.0.0.2');
      expect(ip).toBe('127.0.0.1');
    });
    it('handles ip v4', () => {
      const ip = sanitizeIp('127.0.0.1');
      expect(ip).toBe('127.0.0.1');
    });

    it('trims whitespace', () => {
      const ip = sanitizeIp(' 127.0.0.1  ');
      expect(ip).toBe('127.0.0.1');
    });

    it('handles multiple ip v6', () => {
      const ip = sanitizeIp('2001:db8::1111, 2001:db8::2222');
      expect(ip).toBe('2001:db8::1111');
    });
  });
});
