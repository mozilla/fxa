import { paymentsCapability } from './payments-capability';

describe('paymentsCapability', () => {
  it('should work', () => {
    expect(paymentsCapability()).toEqual('payments-capability');
  });
});
