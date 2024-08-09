import { sharedGlean } from './shared-glean';

describe('sharedGlean', () => {
  it('should work', () => {
    expect(sharedGlean()).toEqual('shared-glean');
  });
});
