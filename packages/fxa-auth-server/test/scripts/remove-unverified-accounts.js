'use strict';

// import {
//   retreiveUnverifiedAccounts,
//   cancelSubscriptionsAndDeleteCustomer,
//   issueRefund,
// } from '../../scripts/remove-unverified-accounts';
// import * as cp from 'child_process';
// import * as util from 'util';
// import * as path from 'path';
// import * as sinon from 'sinon';
// import { assert } from 'chai';

// const ROOT_DIR = '../..';
// const execAsync = util.promisify(cp.exec);
// const cwd = path.resolve(__dirname, ROOT_DIR);
// const execOptions = {
//   cwd,
//   env: {
//     ...process.env,
//     NODE_ENV: 'dev',
//     LOG_LEVEL: 'error',
//     AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
//   },
// };

// describe('scripts/remove-unverified-accounts startup', () => {
//   it('does not fail', function () {
//     this.timeout(20000);
//     return execAsync(
//       'node -r esbuild-register scripts/remove-unverified-accounts.ts',
//       execOptions
//     );
//   });
// });

// describe('scripts/remove-unverified-accounts - retreiveUnverifiedAccounts', () => {
//   it('filters for unverified accounts that are older than 16 days old', async () => {
//     const accounts = [
//       {
//         uid: '1234',
//         createdAt: new Date(),
//         email: 'user1@test.com',
//         emailCode: undefined,
//         normalizedEmail: 'user1@test.com',
//         emailVerified: false,
//         verifierVersion: 1,
//         verifyHash: undefined,
//         authSalt: undefined,
//         kA: undefined,
//         wrapWrapKb: undefined,
//         verifierSetAt: 0,
//         locale: 'en-US',
//       },
//       {
//         uid: '1234',
//         createdAt: new Date().setDate(new Date().getDate() - 17),
//         email: 'user2@test.com',
//         emailCode: undefined,
//         normalizedEmail: 'user2@test.com',
//         emailVerified: false,
//         verifierVersion: 1,
//         verifyHash: undefined,
//         authSalt: undefined,
//         kA: undefined,
//         wrapWrapKb: undefined,
//         verifierSetAt: 0,
//         locale: 'en-US',
//       },
//     ];

//     const database = {
//       listAllUnverifiedAccounts: () => {
//         return Promise.resolve(accounts);
//       },
//     };

//     const accountsToDelete = await retreiveUnverifiedAccounts(database);
//     assert.equal(accountsToDelete.length, 1);
//     assert.equal(accountsToDelete[0].email, 'user2@test.com');
//   });
// });

// describe('scripts/remove-unverified-accounts - cancelSubscriptionsAndDeleteCustomer', () => {
//   let account, stripeHelper;

//   beforeEach(() => {
//     account = {
//       uid: '1234',
//       createdAt: new Date().getDate() - 17,
//       email: 'user2@test.com',
//       emailCode: undefined,
//       normalizedEmail: 'user2@test.com',
//       emailVerified: false,
//       verifierVersion: 1,
//       verifyHash: undefined,
//       authSalt: undefined,
//       kA: undefined,
//       wrapWrapKb: undefined,
//       verifierSetAt: 0,
//       locale: 'en-US',
//     };

//     stripeHelper = {
//       fetchCustomer: () => {
//         return Promise.resolve({
//           subscriptions: {
//             data: [{ id: 'sub1' }],
//           },
//         });
//       },
//       getInvoice: () => {
//         return Promise.resolve({ payment_intent: 'paymentIntentId' });
//       },
//       refundPayment: () => {
//         return Promise.resolve();
//       },
//       cancelSubscription: () => {
//         return Promise.resolve();
//       },
//       removeCustomer: () => {
//         return Promise.resolve();
//       },
//       getInvoicePaypalTransactionId: () => {
//         return Promise.resolve({ paypalTransactionId: 'transactionId' });
//       },
//     };
//   });

//   it('calls refundPayment, cancelSubscription, and removeCustomer for a stripe customer', async () => {
//     stripeHelper.getPaymentProvider = () => {
//       return Promise.resolve('stripe');
//     };
//     const refundSpy = sinon.spy(stripeHelper, 'refundPayment');
//     const cancelSpy = sinon.spy(stripeHelper, 'cancelSubscription');
//     const removeSpy = sinon.spy(stripeHelper, 'removeCustomer');

//     await cancelSubscriptionsAndDeleteCustomer(stripeHelper, {}, account, []);
//     sinon.assert.calledOnce(refundSpy);
//     sinon.assert.calledOnce(cancelSpy);
//     sinon.assert.calledOnce(removeSpy);
//   });
// });

// describe('scripts/remove-unverified-accounts - issueRefund', () => {
//   it('calls stripeHelper.refundPayment if the paymentProvider is stripe', async () => {
//     const stripeHelper = {
//       getInvoice: () => {
//         return Promise.resolve({ payment_intent: 'paymentIntentId' });
//       },
//       refundPayment: () => {},
//     };

//     const spy = sinon.spy(stripeHelper, 'refundPayment');
//     await issueRefund(
//       stripeHelper,
//       {},
//       { latest_invoice: 'invoiceId' },
//       'stripe'
//     );
//     sinon.assert.calledOnce(spy);
//   });

//   it('calls paypal.issueRefund if the paymentProvider is paypal', async () => {
//     const stripeHelper = {
//       getInvoice: () => {
//         return Promise.resolve({ payment_intent: 'paymentIntentId' });
//       },
//       getInvoicePaypalTransactionId: () => {
//         return Promise.resolve({ paypalTransactionId: 'transactionId' });
//       },
//     };

//     const paypalHelper = {
//       issueRefund: () => {
//         return Promise.resolve();
//       },
//     };

//     const spy = sinon.spy(paypalHelper, 'issueRefund');
//     await issueRefund(
//       stripeHelper,
//       paypalHelper,
//       { latest_invoice: 'invoiceId' },
//       'paypal'
//     );
//     sinon.assert.calledOnce(spy);
//   });
// });
