import '@testing-library/jest-dom/extend-expect';
import {
  getFallbackTextByFluentId,
  getErrorMessageId,
  BASIC_ERROR,
  PAYMENT_ERROR_1,
  COUNTRY_CURRENCY_MISMATCH,
  LOCATION_UNSUPPORTED,
} from './errors';

describe('lib/errors', () => {
  it('returns the basic error id if undefined error type', () => {
    expect(getErrorMessageId(undefined)).toEqual(BASIC_ERROR);
  });

  it('returns the basic error id if not predefined error type', () => {
    expect(getErrorMessageId({ code: 'NON_PREDEFINED_ERROR' })).toEqual(
      BASIC_ERROR
    );
  });

  it('returns the payment error id for the correct error type', () => {
    expect(getErrorMessageId({ code: 'approve_with_id' })).toEqual(
      PAYMENT_ERROR_1
    );
  });

  it('returns the payment error id for setup intent authentication failure', () => {
    expect(
      getErrorMessageId({ code: 'setup_intent_authentication_failure' })
    ).toEqual(PAYMENT_ERROR_1);
  });

  it('returns payment error id based on error number if that is what is available in error map', () => {
    expect(getErrorMessageId({ code: 'test', errno: 130 })).toEqual(
      COUNTRY_CURRENCY_MISMATCH
    );
  });

  it('returns unsupported location error id based on error number available in error map', () => {
    expect(getErrorMessageId({ code: 'test', errno: 213 })).toEqual(
      LOCATION_UNSUPPORTED
    );
  });

  it('returns generic error message if provided error id is undefined', () => {
    expect(getFallbackTextByFluentId(undefined)).toEqual(
      'Something went wrong. Please try again later.'
    );
  });

  it('returns generic error message if provided error id does not match any key in dictionary', () => {
    expect(getFallbackTextByFluentId('foo-bar')).toEqual(
      'Something went wrong. Please try again later.'
    );
  });
});
