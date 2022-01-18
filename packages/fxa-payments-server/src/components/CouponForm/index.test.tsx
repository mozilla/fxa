import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CouponForm from './index';
import * as Coupon from 'fxa-shared/dto/auth/payments/coupon';
import {
  INVOICE_PREVIEW_WITHOUT_DISCOUNT,
  SELECTED_PLAN,
} from '../../lib/mock-data';
import waitForExpect from 'wait-for-expect';

jest.mock('../../lib/apiClient', () => {
  return {
    ...jest.requireActual('../../lib/apiClient'),
    apiInvoicePreview: jest.fn(),
  };
});

// eslint-disable-next-line import/first
import { apiInvoicePreview } from '../../lib/apiClient';

beforeEach(() => {
  (apiInvoicePreview as jest.Mock)
    .mockClear()
    .mockResolvedValue(INVOICE_PREVIEW_WITHOUT_DISCOUNT);
});

afterEach(cleanup);

describe.only('CouponForm', () => {
  it('renders as expected', () => {
    const subject = () => {
      return render(
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={undefined}
          setCoupon={() => {}}
        />
      );
    };

    const { queryByTestId } = subject();
    const couponInputField = queryByTestId('coupon-input');
    const couponButton = queryByTestId('coupon-button');
    expect(couponInputField).toBeInTheDocument();
    expect(couponButton).toBeInTheDocument();
  });

  it('shows an error message when invalid coupon code is used', async () => {
    const subject = () => {
      return render(
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={undefined}
          setCoupon={() => {}}
        />
      );
    };

    const { queryByTestId, getByTestId } = subject();
    fireEvent.change(getByTestId('coupon-input'), { target: { value: 'a' } });
    fireEvent.click(getByTestId('coupon-button'));

    console.log('here wego');

    await waitForExpect(() =>
      expect(queryByTestId('coupon-error')).toBeInTheDocument()
    );

    const tester = getByTestId('coupon-error');
    console.log({ tester });

    expect(tester).toHaveTextContent(
      'An error occurred processing the coupon. Please try again.'
    );
  });

  it('shows the coupon code and hides the input when a coupon is used', () => {
    const coupon: Coupon.couponDetailsSchema = {
      discountAmount: 200,
      promotionCode: '',
      type: '',
      valid: true,
    };
    const subject = () => {
      return render(
        <CouponForm
          planId={SELECTED_PLAN.plan_id}
          coupon={coupon}
          setCoupon={(coupon) => {}}
        />
      );
    };

    const { queryByTestId } = subject();
    const couponForm = queryByTestId('coupon-form');
    const validCoupon = queryByTestId('coupon-hascoupon');
    expect(couponForm).not.toBeInTheDocument();
    expect(validCoupon).toBeInTheDocument();
  });
});
