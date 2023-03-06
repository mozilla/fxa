import { paypalApiClient } from './paypal-api-client';

describe('paypalApiClient', () => {
  it('should work', () => {
    expect(paypalApiClient()).toEqual('paypal-api-client');
  });
});
