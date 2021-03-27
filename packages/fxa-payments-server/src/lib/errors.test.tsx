import '@testing-library/jest-dom/extend-expect';
import { getErrorMessage, BASIC_ERROR, PAYMENT_ERROR_1 } from './errors';

it('returns the basic error text if undefined error type', () => {
  expect(getErrorMessage(undefined)).toEqual(BASIC_ERROR);
});

it('returns the basic error text if not predefined error type', () => {
  expect(getErrorMessage({ code: 'NON_PREDEFINED_ERROR' })).toEqual(
    BASIC_ERROR
  );
});

it('returns the payment error text for the correct error type', () => {
  expect(getErrorMessage({ code: 'approve_with_id' })).toEqual(PAYMENT_ERROR_1);
});

it('returns the payment error text for setup intent authentication failure', () => {
  expect(
    getErrorMessage({ code: 'setup_intent_authentication_failure' })
  ).toEqual(PAYMENT_ERROR_1);
});

it('returns payment error based on message if that is what is available in error map', () => {
  expect(getErrorMessage({ code: 'test', message: 'approve_with_id' })).toEqual(
    PAYMENT_ERROR_1
  );
});
