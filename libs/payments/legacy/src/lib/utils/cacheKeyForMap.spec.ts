import { StripePlanFactory } from '@fxa/payments/stripe';
import { cacheKeyForMap } from './cacheKeyForMap';

describe('cacheKeyForMap', () => {
  const stripePlan = StripePlanFactory({ id: '1' });
  const stripePlan2 = StripePlanFactory({ id: '2' });
  const locale = 'en';

  it('should successfully return cache key', () => {
    expect(cacheKeyForMap([stripePlan], locale)).toBe(
      'stripeMapperCache:47983b4bfae739b1284cf74c841547f3a7596551940f337f1e4e51d03ef04585:en'
    );
  });

  it('should return different key for locale change', () => {
    expect(cacheKeyForMap([stripePlan], 'de')).toBe(
      'stripeMapperCache:47983b4bfae739b1284cf74c841547f3a7596551940f337f1e4e51d03ef04585:de'
    );
  });

  describe('multiple plans', () => {
    const expected =
      'stripeMapperCache:6254b553f98c4d39dce38c8149d2ed7b09726c4542220f40604ac0caf2047e82:en';
    it('should return different key for different plans array', () => {
      expect(cacheKeyForMap([stripePlan, stripePlan2], locale)).toBe(expected);
    });

    it('should return same key if array order is different', () => {
      expect(cacheKeyForMap([stripePlan2, stripePlan], locale)).toBe(expected);
    });

    it('should return same key if plans content is different', () => {
      expect(
        cacheKeyForMap(
          [{ ...stripePlan, product: 'different' }, stripePlan2],
          locale
        )
      ).toBe(expected);
    });
  });
});
