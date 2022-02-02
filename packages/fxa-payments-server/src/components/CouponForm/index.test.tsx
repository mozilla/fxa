import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CouponForm, { CouponErrorMessageType } from './index';
import * as Coupon from 'fxa-shared/dto/auth/payments/coupon';
import {
  COUPON_DETAILS_EXPIRED,
  COUPON_DETAILS_INVALID,
  COUPON_DETAILS_MAX_REDEEMED,
  COUPON_DETAILS_VALID,
  INVOICE_PREVIEW_WITHOUT_DISCOUNT,
  SELECTED_PLAN,
} from '../../lib/mock-data';
import waitForExpect from 'wait-for-expect';

jest.mock('../../lib/apiClient', () => {
  return {
    ...jest.requireActual('../../lib/apiClient'),
    apiRetrieveCouponDetails: jest.fn(),
  };
});

// eslint-disable-next-line import/first
import { APIError, apiRetrieveCouponDetails } from '../../lib/apiClient';

beforeEach(() => {
  (apiRetrieveCouponDetails as jest.Mock)
    .mockClear()
    .mockResolvedValue(COUPON_DETAILS_VALID);
});

afterEach(cleanup);

describe('CouponForm', () => {
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

  it('shows an error message when invalid coupon code is used', async () => {
    (apiRetrieveCouponDetails as jest.Mock)
      .mockClear()
      .mockResolvedValue(COUPON_DETAILS_INVALID);

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

    await waitForExpect(() =>
      expect(queryByTestId('coupon-error')).toBeInTheDocument()
    );

    const couponError = getByTestId('coupon-error');

    expect(couponError).toHaveTextContent(CouponErrorMessageType.Invalid);
  });

  it('shows an error message when expired coupon code is used', async () => {
    (apiRetrieveCouponDetails as jest.Mock)
      .mockClear()
      .mockResolvedValue(COUPON_DETAILS_EXPIRED);
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

    await waitForExpect(() =>
      expect(queryByTestId('coupon-error')).toBeInTheDocument()
    );

    const couponError = getByTestId('coupon-error');

    expect(couponError).toHaveTextContent(CouponErrorMessageType.Expired);
  });

  it('shows an error message when maximally redeemed coupon code is used', async () => {
    (apiRetrieveCouponDetails as jest.Mock)
      .mockClear()
      .mockResolvedValue(COUPON_DETAILS_MAX_REDEEMED);
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

    await waitForExpect(() =>
      expect(queryByTestId('coupon-error')).toBeInTheDocument()
    );

    const couponError = getByTestId('coupon-error');

    expect(couponError).toHaveTextContent(CouponErrorMessageType.LimitReached);
  });

  it('shows an error message when apiRetrieveCouponDetails fails', async () => {
    (apiRetrieveCouponDetails as jest.Mock)
      .mockClear()
      .mockRejectedValue(new APIError());
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

    await waitForExpect(() =>
      expect(queryByTestId('coupon-error')).toBeInTheDocument()
    );

    const couponError = getByTestId('coupon-error');

    expect(couponError).toHaveTextContent(CouponErrorMessageType.Generic);
  });
});
