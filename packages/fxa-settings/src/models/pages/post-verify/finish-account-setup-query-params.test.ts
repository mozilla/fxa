/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData } from '../../../lib/model-data';
import { FinishAccountSetupQueryParams } from './finish-account-setup-query-params';

const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.dGVzdHNpZ25hdHVyZQ';

function modelFor(params: Record<string, string>) {
  return new FinishAccountSetupQueryParams(new GenericData(params));
}

describe('FinishAccountSetupQueryParams', () => {
  it('accepts a well formed email link', () => {
    const model = modelFor({
      token: VALID_TOKEN,
      email: 'user@example.com',
      product_name: 'Mozilla VPN',
    });

    expect(model.tryValidate().error).toBeUndefined();
    expect(model.productName).toBe('Mozilla VPN');
  });

  it('accepts a link without a product name', () => {
    const model = modelFor({ token: VALID_TOKEN, email: 'user@example.com' });

    expect(model.tryValidate().error).toBeUndefined();
  });

  it('rejects a token that is not a JWT', () => {
    const model = modelFor({ token: 'not-a-jwt', email: 'user@example.com' });

    expect(model.tryValidate().error).toBeDefined();
  });

  it('rejects a link with no token', () => {
    const model = modelFor({ email: 'user@example.com' });

    expect(model.tryValidate().error).toBeDefined();
  });

  it('rejects a link with no email', () => {
    const model = modelFor({ token: VALID_TOKEN });

    expect(model.tryValidate().error).toBeDefined();
  });

  it('rejects a malformed email', () => {
    const model = modelFor({ token: VALID_TOKEN, email: 'not-an-email' });

    expect(model.tryValidate().error).toBeDefined();
  });
});
