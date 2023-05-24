import { paypal } from './paypal';

describe('paypal', () => {
  it('should work', () => {
    expect(paypal()).toEqual('paypal');
  });
});
