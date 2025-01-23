import assert from 'assert';
import { SP2MapConfigFactory } from '../factories';
import { getSP2Params } from './getSP2Params';

describe('getSP2Params', () => {
  const reportErrorMock = jest.fn();
  const sp2mapConfig = SP2MapConfigFactory();

  beforeEach(() => {
    reportErrorMock.mockClear();
  });

  describe('success', () => {
    it('successfully returns productId and planId', () => {
      const { productId, priceId } = getSP2Params(
        sp2mapConfig,
        reportErrorMock,
        'vpn',
        'monthly',
        'USD'
      );
      expect(reportErrorMock).not.toHaveBeenCalled();
      expect(productId).toBe('prod_productid');
      expect(priceId).toBe('price_priceId');
    });
  });

  describe('success - with default fallbacks', () => {
    it('successfully returns productId and planId if no currency is provided', () => {
      const { productId, priceId } = getSP2Params(
        sp2mapConfig,
        reportErrorMock,
        'vpn',
        'monthly'
      );
      expect(reportErrorMock).toHaveBeenCalledWith('Currency is missing');
      expect(productId).toBe('prod_productid');
      expect(priceId).toBe('price_priceId');
    });

    it('successfully returns productId and planId if invalid interval is provided', () => {
      const { productId, priceId } = getSP2Params(
        sp2mapConfig,
        reportErrorMock,
        'vpn',
        'invalid',
        'USD'
      );
      expect(reportErrorMock).toHaveBeenCalledWith(
        'Interval is not supported',
        { interval: 'invalid' }
      );
      expect(productId).toBe('prod_productid');
      expect(priceId).toBe('price_priceId');
    });
  });

  describe('failure', () => {
    it('throws an error if offering could not be found in config', () => {
      try {
        getSP2Params(
          sp2mapConfig,
          reportErrorMock,
          'invalid',
          'monthly',
          'USD'
        );
        assert('should have thrown an error');
      } catch (err) {
        expect(reportErrorMock).toHaveBeenCalledWith(
          'Missing or invalid offering',
          { offeringId: 'invalid' }
        );
        expect(err).toBeInstanceOf(Error);
      }
    });

    it('throws an error if interval could not be found in config', () => {
      try {
        getSP2Params(sp2mapConfig, reportErrorMock, 'vpn', 'daily', 'USD');
        assert('should have thrown an error');
      } catch (err) {
        expect(reportErrorMock).toHaveBeenCalledWith(
          'Invalid interval for offering',
          { offeringId: 'vpn', interval: 'daily' }
        );
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
