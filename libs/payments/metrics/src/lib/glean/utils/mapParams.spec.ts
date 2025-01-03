/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CheckoutParamsFactory } from '../glean.factory';
import { mapParams } from './mapParams';

describe('mapParams', () => {
  it('should map the values if present', () => {
    const params = CheckoutParamsFactory();
    expect(mapParams(params)).toEqual({
      offeringId: params['offeringId'],
      interval: params['interval'],
      cartId: params['cartId'],
    });
  });

  it('should return empty strings if the values are not present', () => {
    expect(mapParams({})).toEqual({
      offeringId: '',
      interval: '',
      cartId: '',
    });
  });
});
