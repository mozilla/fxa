/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isPaymentIntentId } from './isPaymentIntentId';

describe('isPaymentIntentId', () => {
  it.each([
    { intentId: 'pi_abc123', expected: true },
    { intentId: 'pi_', expected: true },
    { intentId: 'seti_abc123', expected: false },
    { intentId: 'sub_abc123', expected: false },
    { intentId: '', expected: false },
  ])(
    'returns $expected for "$intentId"',
    ({ intentId, expected }) => {
      expect(isPaymentIntentId(intentId)).toBe(expected);
    }
  );
});
