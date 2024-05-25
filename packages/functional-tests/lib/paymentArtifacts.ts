/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CreditCard } from '../pages/products/components/paymentInformation';

export const BAD_CAVE_JOHNSON_CREDIT_CARD: CreditCard = {
  name: 'Cave Johnson',
  number: '4000000000000341',
  expirationDate: '666',
  cvc: '444',
  zip: '77777',
};

export const CAVE_JOHNSON_CREDIT_CARD: CreditCard = {
  name: 'Cave Johnson',
  number: '4242424242424242',
  expirationDate: '555',
  cvc: '333',
  zip: '66666',
};

export const TEST_USER_CREDIT_CARD: CreditCard = {
  name: 'Test User',
  number: '5555555555554444',
  expirationDate: '444',
  cvc: '777',
  zip: '88888',
};
