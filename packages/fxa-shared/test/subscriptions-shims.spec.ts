/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import * as baseShim from '../subscriptions/configuration/base';
import * as baseLib from '@fxa/accounts/subscriptions-legacy/subscriptions/configuration/base';
import * as helpersShim from '../subscriptions/configuration/helpers';
import * as helpersLib from '@fxa/accounts/subscriptions-legacy/subscriptions/configuration/helpers';
import * as planShim from '../subscriptions/configuration/plan';
import * as planLib from '@fxa/accounts/subscriptions-legacy/subscriptions/configuration/plan';
import * as productShim from '../subscriptions/configuration/product';
import * as productLib from '@fxa/accounts/subscriptions-legacy/subscriptions/configuration/product';
import * as utilsShim from '../subscriptions/configuration/utils';
import * as utilsLib from '@fxa/accounts/subscriptions-legacy/subscriptions/configuration/utils';
import * as metadataShim from '../subscriptions/metadata';
import * as metadataLib from '@fxa/accounts/subscriptions-legacy/subscriptions/metadata';
import * as stripeShim from '../subscriptions/stripe';
import * as stripeLib from '@fxa/accounts/subscriptions-legacy/subscriptions/stripe';
import * as typeGuardsShim from '../subscriptions/type-guards';
import * as typeGuardsLib from '@fxa/accounts/subscriptions-legacy/subscriptions/type-guards';
import * as typesShim from '../subscriptions/types';
import * as typesLib from '@fxa/accounts/subscriptions-legacy/subscriptions/types';
import * as validationShim from '../subscriptions/validation';
import * as validationLib from '@fxa/accounts/subscriptions-legacy/subscriptions/validation';
import * as iapSubscriptionShim from '../dto/auth/payments/iap-subscription';
import * as iapSubscriptionLib from '@fxa/accounts/subscriptions-legacy/dto/auth/payments/iap-subscription';
import * as invoiceShim from '../dto/auth/payments/invoice';
import * as invoiceLib from '@fxa/accounts/subscriptions-legacy/dto/auth/payments/invoice';
import * as planConfigurationShim from '../dto/auth/payments/plan-configuration';
import * as planConfigurationLib from '@fxa/accounts/subscriptions-legacy/dto/auth/payments/plan-configuration';

const modules = {
  'subscriptions/configuration/base': [baseShim, baseLib],
  'subscriptions/configuration/helpers': [helpersShim, helpersLib],
  'subscriptions/configuration/plan': [planShim, planLib],
  'subscriptions/configuration/product': [productShim, productLib],
  'subscriptions/configuration/utils': [utilsShim, utilsLib],
  'subscriptions/metadata': [metadataShim, metadataLib],
  'subscriptions/stripe': [stripeShim, stripeLib],
  'subscriptions/type-guards': [typeGuardsShim, typeGuardsLib],
  'subscriptions/types': [typesShim, typesLib],
  'subscriptions/validation': [validationShim, validationLib],
  'dto/auth/payments/iap-subscription': [
    iapSubscriptionShim,
    iapSubscriptionLib,
  ],
  'dto/auth/payments/invoice': [invoiceShim, invoiceLib],
  'dto/auth/payments/plan-configuration': [
    planConfigurationShim,
    planConfigurationLib,
  ],
};

describe('subscriptions shims', () => {
  for (const [path, [shim, lib]] of Object.entries(modules)) {
    it(`re-export every export of ${path}`, () => {
      assert.deepEqual(Object.keys(shim).sort(), Object.keys(lib).sort());
      for (const key of Object.keys(lib)) {
        assert.strictEqual(Reflect.get(shim, key), Reflect.get(lib, key));
      }
    });
  }
});
