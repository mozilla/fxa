/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { assert } from 'chai';
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
} from '../../../../db/models/auth';
import { defaultOpts, testDatabaseSetup } from '../../../../test/db/helpers';
import { chance, randomAccount, randomEmail } from './helpers';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);

describe('#integration - auth', () => {
  let knex: Knex;

  before(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });
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

  describe('getUidAndEmailByStripeCustomerId', () => {
    const stripeCustomerId = 'cus_123456789';
    before(async () => {
      await createAccountCustomer(USER_1.uid, stripeCustomerId);
    });
    it('finds an existing FxA user id and email', async () => {
      const result = await getUidAndEmailByStripeCustomerId(stripeCustomerId);
      assert.isDefined(result);
      assert.equal(result.uid, USER_1.uid);
      assert.equal(result.email, USER_1.email);
    });
    it('returns null for uid and email if the stripeCustomerId is not found', async () => {
      const { uid, email } = await getUidAndEmailByStripeCustomerId('cus_123');
      assert.isNull(uid);
      assert.isNull(email);
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

        assert.isDefined(secondCustomer);
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
          assert.isTrue(err.message.includes('uid: must match pattern'));
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
            err.message.includes('stripeCustomerId: must match pattern')
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

        assert.isDefined(testCustomer);
        assert.equal(testCustomer.uid, userId);
        assert.equal(testCustomer.billingAgreementId, billingAgreementId);
        assert.equal(testCustomer.status, status);
        assert.isNotNull(testCustomer.createdAt);
      });

      it('Fails to create when the uid is invalid', async () => {
        try {
          await createPayPalBA(
            '27384d1476564252aade14e9c71bec4\\',
            'B-1234XXXXX',
            'Active'
          );
          assert.fail('Validation error expected for invalid uid');
        } catch (err) {
          assert.isTrue(err instanceof ValidationError);
          assert.isTrue(err.message.includes('uid: must match pattern'));
        }
      });

      it('Fails to create when the billing agreement id is invalid', async () => {
        try {
          await createPayPalBA(
            '27384d1476564252aade14e9c71bec53',
            'BASDFASDF',
            'Active'
          );
          assert.fail(
            'Validation error expected for invalid billing agreement id'
          );
        } catch (err) {
          assert.isTrue(err instanceof ValidationError);
          assert.isTrue(
            err.message.includes('billingAgreementId: must match pattern')
          );
        }
      });
    });
    describe('getPayPalBAByUid', () => {
      const uid = '1bec4927384d147aade165642524e9c7';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      before(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('finds an existing paypalCustomer', async () => {
        const result = await getAllPayPalBAByUid(uid);
        assert.isDefined(result);
        assert.lengthOf(result, 1);
        const ba = result[0];
        assert.equal(ba.uid, uid);
        assert.equal(ba.billingAgreementId, billingAgreementId);
      });

      it('does not find a non-existent paypalCustomer', async () => {
        const result = await getAllPayPalBAByUid(
          '11114d1476500002aade14e9c71baaaa'
        );
        assert.lengthOf(result, 0);
      });

      it('handles bad input', async () => {
        try {
          const result = await getAllPayPalBAByUid('asfgewarger089_');
          assert.fail();
        } catch (err) {
          assert.isTrue(err.message.includes('Invalid hex data'));
        }
      });
    });

    describe('getPayPalBAByBAId', () => {
      const uid = '10000927384d147aade1656425200000';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      before(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('finds an existing PayPalBillingAgreements', async () => {
        const result = await getPayPalBAByBAId(billingAgreementId);
        assert.isDefined(result);
        assert.equal(result.uid, uid);
        assert.equal(result.billingAgreementId, billingAgreementId);
      });

      it('does not find a non-existent PayPalBillingAgreements', async () => {
        const result = await getPayPalBAByBAId('B-1234');
        assert.isUndefined(result, 'no result defined');
      });
    });

    describe('updatePayPalBA', () => {
      const uid = '00000927384d147aade1656425200000';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      before(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('Returns 1 when a row is successfully updated', async () => {
        assert.equal(
          await updatePayPalBA(uid, billingAgreementId, 'Cancelled'),
          1
        );
      });

      it('Returns 0 when no rows are affected', async () => {
        assert.equal(
          await updatePayPalBA('0000', billingAgreementId, 'Cancelled'),
          0
        );
      });

      it('Throws error when validation fails', async () => {
        try {
          await updatePayPalBA(uid, billingAgreementId, '1213212312' as any);
          assert.fail();
        } catch (err) {
          assert.isTrue(err instanceof ValidationError);
        }
      });
    });

    describe('deletePayPalBA', () => {
      const uid = 'aa000927384d147aade1656425200000';
      const billingAgreementId = 'B-1234XXXXX';
      const status = 'Active';

      before(async () => {
        await createPayPalBA(uid, billingAgreementId, status);
      });

      it('Returns 1 when a row is successfully deleted', async () => {
        assert.equal(await deleteAllPayPalBAs(uid), 1);
      });

      it('Returns 0 when no rows are affected', async () => {
        assert.equal(await deleteAllPayPalBAs('0000'), 0);
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

      assert.isDefined(testBA1);
      assert.equal(testBA1.uid, userId);
      assert.equal(testBA1.billingAgreementId, billingAgreementId1);
      assert.isNotNull(testBA1.createdAt);

      assert.isDefined(testBA2);
      assert.equal(testBA2.uid, userId);
      assert.equal(testBA2.billingAgreementId, billingAgreementId2);
      assert.isNotNull(testBA2.createdAt);

      // Test Retrieval
      const locatedBAs = await getAllPayPalBAByUid(userId);
      assert.lengthOf(locatedBAs, 2);

      assert.equal(locatedBAs[0].uid, testBA2.uid);
      assert.equal(
        locatedBAs[0].billingAgreementId,
        testBA2.billingAgreementId
      );
      assert.equal(locatedBAs[0].createdAt, testBA2.createdAt);

      assert.equal(locatedBAs[1].uid, testBA1.uid);
      assert.equal(
        locatedBAs[1].billingAgreementId,
        testBA1.billingAgreementId
      );
      assert.equal(locatedBAs[1].createdAt, testBA1.createdAt);

      // Test Update
      const newStatus = 'Suspended';
      const numberOfUpdatedRows = await updatePayPalBA(
        userId,
        billingAgreementId2,
        newStatus
      );
      assert.equal(numberOfUpdatedRows, 1);

      // Test Retreival Again
      const updatedBA = (await getAllPayPalBAByUid(userId))[0];
      assert.isDefined(updatedBA);
      assert.equal(updatedBA.uid, userId);
      assert.equal(updatedBA.billingAgreementId, billingAgreementId2);
      assert.equal(updatedBA.status, newStatus);

      // Test Deletion
      const numberOfAffectedRows = await deleteAllPayPalBAs(userId);
      assert.equal(numberOfAffectedRows, 2);

      // Test Final Retrieval
      const finallocate = await getAllPayPalBAByUid(userId);
      assert.lengthOf(finallocate, 0);
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

        assert.equal(linkedAccounts.length, 1);

        assert.equal(linkedAccounts[0].uid, userId);
        assert.equal(linkedAccounts[0].id, id);
        assert.equal(linkedAccounts[0].providerId, 1);

        const linkedAccount = await LinkedAccount.findByLinkedAccount(
          id,
          GOOGLE_PROVIDER
        );

        assert.isDefined(linkedAccount);
        assert.equal(linkedAccount.uid, userId);
        assert.equal(linkedAccount.id, id);
        assert.equal(linkedAccount.providerId, 1);
      });

      it('can delete linked account', async () => {
        const id = getRandomId();
        await LinkedAccount.createLinkedAccount(userId, id, GOOGLE_PROVIDER);

        await LinkedAccount.deleteLinkedAccount(userId, GOOGLE_PROVIDER);

        const linkedAccount = await LinkedAccount.findByLinkedAccount(
          id,
          GOOGLE_PROVIDER
        );
        assert.isUndefined(linkedAccount);
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
      assert.equal(unverifiedAccounts.length, 3);
    });
  });
});
