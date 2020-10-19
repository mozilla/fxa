/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import Knex from 'knex';
import 'mocha';

import {
  chance,
  randomAccount,
  randomEmail,
  testDatabaseSetup,
} from './helpers';

import {
  Account,
  accountByUid,
  accountExists,
  AccountCustomers,
  createAccountCustomer,
  deleteAccountCustomer,
  getAccountCustomerByUid,
  updateAccountCustomer,
} from '../../../../db/models/auth';
import { UniqueViolationError, ValidationError } from 'objection';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);

describe('auth', () => {
  let knex: Knex;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the user in
    await Account.query().insertGraph({ ...USER_1, emails: [EMAIL_1] });
  });

  after(async () => {
    await knex.destroy();
  });

  describe('accountExists', () => {
    it('returns true if the account is found', async () => {
      assert.isTrue(await accountExists(USER_1.uid));
    });

    it('returns false if the account is not found', async () => {
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      assert.isFalse(await accountExists(uid));
    });
  });

  describe('accountByUid', () => {
    it('retrieves record successfully', async () => {
      const result = (await accountByUid(USER_1.uid)) as Account;
      assert.isDefined(result);
      assert.equal(result.uid, USER_1.uid);
      assert.equal(result.email, USER_1.email);
    });

    it('retrieves record with emails included successfully', async () => {
      const result = (await accountByUid(USER_1.uid, {
        include: ['emails'],
      })) as Account;
      assert.isDefined(result);
      assert.equal(result.uid, USER_1.uid);
      assert.equal(result.email, USER_1.email);
      if (!result.emails) {
        assert.fail('result emails not defined');
      }
      assert.deepInclude(result.emails[0], EMAIL_1);
    });

    it('does not find a non-existent user', async () => {
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      const result = await accountByUid(uid);
      assert.isUndefined(result);
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

        assert.isDefined(testCustomer);
        assert.equal(testCustomer.uid, userId);
        assert.equal(testCustomer.stripeCustomerId, customerId);
        assert.isNotNull(testCustomer.createdAt);
        assert.equal(testCustomer.createdAt, testCustomer.updatedAt);

        // Insert is only attempted when the record for the given uid does not exist.
        const secondCustomer = await createAccountCustomer(
          userId,
          'cus_o8ghropsigjpser'
        );
        assert.equal(
          secondCustomer.stripeCustomerId,
          testCustomer.stripeCustomerId
        );
      });

      it('Fails to create when the uid is invalid', async () => {
        try {
          await createAccountCustomer(
            '27384d1476564252aade14e9c71bec4\\',
            'cus_123'
          );
          assert.fail('Validation error expected for invalid uid');
        } catch (err) {
          assert.isTrue(err instanceof ValidationError);
          assert.isTrue(err.message.includes('uid: should match pattern'));
        }
      });

      it('Fails to create when the customer id is invalid', async () => {
        try {
          await createAccountCustomer(
            '27384d1476564252aade14e9c71bec53',
            'cus_12_'
          );
          assert.fail(
            'Validation error expected for invalid stripe customer id'
          );
        } catch (err) {
          assert.isTrue(err instanceof ValidationError);
          assert.isTrue(
            err.message.includes('stripeCustomerId: should match pattern')
          );
        }
      });
    });
    describe('getAccountCustomerByUid', () => {
      const uid = '1bec4927384d147aade165642524e9c7';
      const stripeCustomerId = 'cus_123456789';

      before(async () => {
        await createAccountCustomer(uid, stripeCustomerId);
      });
      it('finds an existing accountCustomer', async () => {
        const result = (await getAccountCustomerByUid(uid)) as AccountCustomers;
        assert.isDefined(result);
        assert.equal(result.uid, uid);
        assert.equal(result.stripeCustomerId, stripeCustomerId);
      });

      it('does not find a non-existent accountCustomer', async () => {
        const result = await getAccountCustomerByUid(
          '11114d1476500002aade14e9c71baaaa'
        );
        assert.isUndefined(result);
      });

      it('handles bad input', async () => {
        try {
          const result = await getAccountCustomerByUid('asfgewarger089_');
          assert.fail();
        } catch (err) {
          assert.isTrue(err.message.includes('Invalid hex data'));
        }
      });
    });

    describe('updateAccountCustomer', () => {
      const uid = '00000927384d147aade1656425200000';
      const stripeCustomerId = 'cus_asdf1234';

      before(async () => {
        await createAccountCustomer(uid, stripeCustomerId);
      });
      it('Returns 1 when a row is successfully updated', async () => {
        assert.equal(await updateAccountCustomer(uid, 'cus_1234'), 1);
      });

      it('Returns 0 when no rows are affected', async () => {
        assert.equal(await updateAccountCustomer('0000', 'cus_1234'), 0);
      });

      it('Throws error when validation fails', async () => {
        try {
          await updateAccountCustomer(uid, '34rsdfg');
          assert.fail();
        } catch (err) {
          assert.isTrue(err instanceof ValidationError);
        }
      });
    });

    describe('deleteAccountCustomer', () => {
      const uid = 'aa000927384d147aade1656425200000';
      const stripeCustomerId = 'cus_asdf1234';

      before(async () => {
        await createAccountCustomer(uid, stripeCustomerId);
      });
      it('Returns 1 when a row is successfully deleted', async () => {
        assert.equal(await deleteAccountCustomer(uid), 1);
      });

      it('Returns 0 when no rows are affected', async () => {
        assert.equal(await deleteAccountCustomer('0000'), 0);
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

      assert.isDefined(testCustomer);
      assert.equal(testCustomer.uid, userId);
      assert.equal(testCustomer.stripeCustomerId, customerId);
      assert.isNotNull(testCustomer.createdAt);
      assert.equal(testCustomer.createdAt, testCustomer.updatedAt);

      // Test Retrieval
      const locatedCustomer = (await getAccountCustomerByUid(
        userId
      )) as AccountCustomers;
      assert.isDefined(locatedCustomer);

      assert.equal(locatedCustomer.uid, testCustomer.uid);
      assert.equal(
        locatedCustomer.stripeCustomerId,
        testCustomer.stripeCustomerId
      );
      assert.equal(locatedCustomer.createdAt, testCustomer.createdAt);
      assert.equal(locatedCustomer.updatedAt, testCustomer.updatedAt);

      // Test Update
      const createdAt = testCustomer.createdAt;
      const newCustomerId = 'cus_1234567';
      const numberOfUpdatedRows = await updateAccountCustomer(
        userId,
        newCustomerId
      );
      assert.equal(numberOfUpdatedRows, 1);

      // Test Retreival Again
      const updatedCustomer = (await getAccountCustomerByUid(
        userId
      )) as AccountCustomers;
      assert.isDefined(updatedCustomer);
      assert.equal(updatedCustomer.uid, userId);
      assert.equal(updatedCustomer.stripeCustomerId, newCustomerId);
      assert.equal(updatedCustomer.createdAt, createdAt);
      assert.notEqual(updatedCustomer.updatedAt, createdAt);
      assert.isTrue(updatedCustomer.updatedAt > createdAt);

      // Test Deletion
      const numberOfAffectedRows = await deleteAccountCustomer(userId);
      assert.equal(numberOfAffectedRows, 1);

      // Test Final Retrieval
      const finallocate = await getAccountCustomerByUid(userId);
      assert.isUndefined(finallocate);
    });
  });
});
