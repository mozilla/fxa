/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// const sinon = require('sinon');
// const assert = { ...sinon.assert, ...require('chai').assert };

// const mocks = require('../mocks');
// const error = require('../../lib/error');
// const uuid = require('uuid');

// const { default: Container } = require('typedi');
// const { Account } = require('../../lib/account');

// const TEST_EMAIL = 'foo@gmail.com';

// describe('Account', () => {
//   beforeEach(() => {
//     // TODO
//   });

//   it('constructor', () => {
//     // TODO
//   });

//   describe('isVerified', () => {
//     // TODO
//   });

//   // TODO: This is from the old implementation of `hasActiveSubscription` on the StripeHelper. Simplify.
//   describe('hasActiveSubscription', () => {
//     let customerExpanded, subscription;
//     beforeEach(() => {
//       customerExpanded = deepCopy(customer1);
//       subscription = deepCopy(subscription2);
//     });

//     it('returns true for an active subscription', async () => {
//       subscription.status = 'active';
//       customerExpanded.subscriptions.data[0] = subscription;
//       sandbox.stub(stripeHelper, 'expandResource').resolves(customerExpanded);
//       assert.isTrue(
//         await stripeHelper.hasActiveSubscription(
//           customerExpanded.metadata.userid
//         )
//       );
//     });

//     it('returns false when there is no Stripe customer', async () => {
//       const uid = uuidv4().replace(/-/g, '');
//       customerExpanded = undefined;
//       sandbox.stub(stripeHelper, 'expandResource').resolves(customerExpanded);
//       assert.isFalse(await stripeHelper.hasActiveSubscription(uid));
//     });

//     it('returns false when there is no active subscription', async () => {
//       subscription.status = 'canceled';
//       customerExpanded.subscriptions.data[0] = subscription;
//       sandbox.stub(stripeHelper, 'expandResource').resolves(customerExpanded);
//       assert.isFalse(
//         await stripeHelper.hasActiveSubscription(
//           customerExpanded.metadata.userid
//         )
//       );
//     });
//   });

//   describe('deleteAccountIfUnverified', () => {
//     const account = Container.get(Account);
//     const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
//     const mockDB = mocks.mockDB({
//       email: TEST_EMAIL,
//       uid,
//     });
//     const mockRequest = mocks.mockRequest({
//       payload: {
//         email: TEST_EMAIL,
//         metricsContext: {},
//       },
//     });

//     const emailRecord = {
//       isPrimary: true,
//       isVerified: false,
//     };
//     mockDB.getSecondaryEmail = sinon.spy(async () =>
//       Promise.resolve(emailRecord)
//     );

//     beforeEach(() => {
//       mockDB.deleteAccount = sinon.spy(async () => Promise.resolve());
//     });

//     afterEach(() => {
//       sinon.restore();
//     });

//     it('should delete an unverified account with no active subscriptions', async () => {
//       account.hasActiveSubscription = sinon.stub().resolves(false);

//       await account.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
//       sinon.assert.calledWithMatch(mockDB.deleteAccount, emailRecord);
//     });

//     it('should not delete an unverified account with an active subscription and return early', async () => {
//       account.hasActiveSubscription = sinon.stub().resolves(true);
//       let failed = false;
//       try {
//         await account.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
//       } catch (err) {
//         failed = true;
//         assert.equal(err.errno, error.ERRNO.ACCOUNT_EXISTS);
//       }
//       assert.isTrue(failed);
//       sinon.assert.notCalled(mockDB.deleteAccount);
//     });

//     it('should delete a Stripe customer with no subscriptions', async () => {
//       const mockStripeHelper = {
//         hasActiveSubscription: async () => Promise.resolve(false),
//         removeCustomer: sinon.stub().resolves(),
//       };

//       await account.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
//       sinon.assert.calledOnceWithExactly(
//         mockStripeHelper.removeCustomer,
//         emailRecord.uid,
//         emailRecord.email
//       );
//     });

//     it('should report to Sentry when a Stripe customer deletion fails', async () => {
//       const stripeError = new Error('no good');
//       const mockStripeHelper = {
//         hasActiveSubscription: async () => Promise.resolve(false),
//         removeCustomer: sinon.stub().throws(stripeError),
//       };
//       const sentryModule = require('../../../lib/sentry');
//       sinon.stub(sentryModule, 'reportSentryError').returns({});
//       try {
//         await account.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
//         sinon.assert.calledOnceWithExactly(
//           mockStripeHelper.removeCustomer,
//           emailRecord.uid,
//           emailRecord.email
//         );
//         sinon.assert.calledOnceWithExactly(
//           sentryModule.reportSentryError,
//           stripeError,
//           mockRequest
//         );
//       } catch (e) {
//         assert.fail('should not have re-thrown');
//       }
//       sentryModule.reportSentryError.restore();
//     });
//   });
// });
