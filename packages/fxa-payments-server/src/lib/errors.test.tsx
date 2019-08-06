import 'jest-dom/extend-expect';
import { getErrorMessage, BASIC_ERROR, PAYMENT_ERROR_1 } from './errors';

it('returns the basic error text if not predefined error type', () => {
  expect(getErrorMessage('NON_PREDEFINED_ERROR')).toEqual(BASIC_ERROR);
});

it('returns the payment error text for the correct error type', () => {
  expect(getErrorMessage('approve_with_id')).toEqual(PAYMENT_ERROR_1);
});
