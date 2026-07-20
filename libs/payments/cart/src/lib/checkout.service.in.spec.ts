/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CartErrorReasonId,
  CartState,
  testAccountDatabaseSetup,
  AccountDatabase,
} from '@fxa/shared/db/mysql/account';

import { CartManager } from './cart.manager';
import {
  FinishCartFactory,
  FinishErrorCartFactory,
  SetupCartFactory,
  UpdateProcessingCartFactory,
} from './cart.factories';
import type { StatsD } from '@fxa/shared/metrics/statsd';
import { LoggerService } from '@nestjs/common';

const TEST_UID = 'aabbccdd11223344aabbccdd11223344';
const TEST_TIMESTAMP = 1700000000000;

async function seedAccount(db: AccountDatabase, uidHex: string) {
  await db
    .insertInto('accounts')
    .values({
      uid: Buffer.from(uidHex, 'hex'),
      email: `${uidHex}@example.com`,
      normalizedEmail: `${uidHex}@example.com`,
      emailCode: Buffer.alloc(16),
      emailVerified: 1,
      kA: Buffer.alloc(32),
      wrapWrapKb: Buffer.alloc(32),
      authSalt: Buffer.alloc(32),
      verifyHash: Buffer.alloc(32),
      verifierVersion: 1,
      verifierSetAt: TEST_TIMESTAMP,
      createdAt: TEST_TIMESTAMP,
    })
    .execute();
}

describe('CheckoutService', () => {
  let db: AccountDatabase;
  let cartManager: CartManager;

  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    setContext: jest.fn(),
  };

  beforeAll(async () => {
    db = await testAccountDatabaseSetup(['accounts', 'carts']);
    cartManager = new CartManager(
      db,
      { timing: jest.fn() } as unknown as StatsD,
      mockLogger as unknown as LoggerService
    );
    await seedAccount(db, TEST_UID);
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('full flow: cart state transitions in DB', () => {
    it('setupCart → setProcessingCart → payWithStripe (3DS) → setNeedsInputCart → finishCart', async () => {
      // 1. setupCart — cart starts in START
      const cart = await cartManager.createCart(
        SetupCartFactory({ uid: TEST_UID })
      );
      expect(cart.state).toEqual(CartState.START);

      // 2. checkoutCartWithStripe calls setProcessingCart → PROCESSING
      await cartManager.setProcessingCart(cart.id);
      const processingCart = await cartManager.fetchCartById(cart.id);
      expect(processingCart.state).toEqual(CartState.PROCESSING);

      // 3. payWithStripe writes subscription/intent IDs while processing
      await cartManager.dangerouslyUpdateProcessingCart(
        cart.id,
        processingCart.version,
        UpdateProcessingCartFactory({
          stripeSubscriptionId: 'sub_3ds_test',
          stripeIntentId: 'pi_3ds_test',
        })
      );

      // 4. Stripe intent returns requires_action (3DS challenge) →
      //    payWithStripe calls setNeedsInputCart → NEEDS_INPUT
      await cartManager.setNeedsInputCart(cart.id);
      const needsInputCart = await cartManager.fetchCartById(cart.id);
      expect(needsInputCart.state).toEqual(CartState.NEEDS_INPUT);

      // 5. User completes 3DS challenge → submitNeedsInput retrieves
      //    the now-succeeded intent and calls postPaySteps → finishCart
      //    directly from NEEDS_INPUT (finishCart accepts NEEDS_INPUT)
      await cartManager.finishCart(
        cart.id,
        needsInputCart.version,
        FinishCartFactory()
      );
      const finalCart = await cartManager.fetchCartById(cart.id);
      expect(finalCart.state).toEqual(CartState.SUCCESS);
    });

    it('setupCart → setProcessingCart → finishCart (direct success, no 3DS)', async () => {
      const cart = await cartManager.createCart(
        SetupCartFactory({ uid: TEST_UID })
      );
      expect(cart.state).toEqual(CartState.START);

      await cartManager.setProcessingCart(cart.id);
      const processingCart = await cartManager.fetchCartById(cart.id);
      expect(processingCart.state).toEqual(CartState.PROCESSING);

      await cartManager.dangerouslyUpdateProcessingCart(
        cart.id,
        processingCart.version,
        UpdateProcessingCartFactory({
          stripeSubscriptionId: 'sub_direct_success',
          stripeIntentId: 'pi_direct_success',
        })
      );

      await cartManager.finishCart(
        cart.id,
        processingCart.version + 1,
        FinishCartFactory()
      );
      const finalCart = await cartManager.fetchCartById(cart.id);
      expect(finalCart.state).toEqual(CartState.SUCCESS);
    });

    it('setupCart → setProcessingCart → finishErrorCart (payment failure)', async () => {
      const cart = await cartManager.createCart(
        SetupCartFactory({ uid: TEST_UID })
      );
      expect(cart.state).toEqual(CartState.START);

      await cartManager.setProcessingCart(cart.id);
      const processingCart = await cartManager.fetchCartById(cart.id);
      expect(processingCart.state).toEqual(CartState.PROCESSING);

      await cartManager.finishErrorCart(
        cart.id,
        FinishErrorCartFactory({
          errorReasonId: CartErrorReasonId.INTENT_FAILED_CARD_DECLINED,
        })
      );
      const finalCart = await cartManager.fetchCartById(cart.id);
      expect(finalCart.state).toEqual(CartState.FAIL);
      expect(finalCart.errorReasonId).toEqual(
        CartErrorReasonId.INTENT_FAILED_CARD_DECLINED
      );
    });

    it('setupCart → setProcessingCart → setNeedsInputCart → finishErrorCart (3DS failure)', async () => {
      const cart = await cartManager.createCart(
        SetupCartFactory({ uid: TEST_UID })
      );
      expect(cart.state).toEqual(CartState.START);

      await cartManager.setProcessingCart(cart.id);
      const processingCart = await cartManager.fetchCartById(cart.id);
      expect(processingCart.state).toEqual(CartState.PROCESSING);

      await cartManager.dangerouslyUpdateProcessingCart(
        cart.id,
        processingCart.version,
        UpdateProcessingCartFactory({
          stripeSubscriptionId: 'sub_3ds_fail',
          stripeIntentId: 'pi_3ds_fail',
        })
      );

      await cartManager.setNeedsInputCart(cart.id);
      const needsInputCart = await cartManager.fetchCartById(cart.id);
      expect(needsInputCart.state).toEqual(CartState.NEEDS_INPUT);

      await cartManager.finishErrorCart(
        cart.id,
        FinishErrorCartFactory({
          errorReasonId: CartErrorReasonId.INTENT_FAILED_GET_IN_TOUCH,
        })
      );
      const finalCart = await cartManager.fetchCartById(cart.id);
      expect(finalCart.state).toEqual(CartState.FAIL);
      expect(finalCart.errorReasonId).toEqual(
        CartErrorReasonId.INTENT_FAILED_GET_IN_TOUCH
      );
    });
  });
});
