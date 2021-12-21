import React, { useState } from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CouponForm from './index';
import { Coupon } from '../../lib/Coupon';

afterEach(cleanup);

describe('CouponForm', () => {
  it('renders as expected', () => {
    const subject = () => {
      return render(<CouponForm coupon={undefined} setCoupon={() => {}} />);
    };

    const { queryByTestId } = subject();
    const couponInputField = queryByTestId('coupon-input');
    const couponButton = queryByTestId('coupon-button');
    expect(couponInputField).toBeInTheDocument();
    expect(couponButton).toBeInTheDocument();
  });

  it('shows an error message when invalid coupon code is used', () => {
    const subject = () => {
      return render(<CouponForm coupon={undefined} setCoupon={() => {}} />);
    };

    const { queryByTestId, getByTestId } = subject();
    fireEvent.change(getByTestId('coupon-input'), { target: { value: 'a' } });
    fireEvent.click(getByTestId('coupon-button'));

    expect(queryByTestId('coupon-error')).toBeInTheDocument();
  });

  it('shows the coupon code and hides the input when a coupon is used', () => {
    const coupon: Coupon = { amount: 200 };
    const subject = () => {
      return render(<CouponForm coupon={coupon} setCoupon={(coupon) => {}} />);
    };

    const { queryByTestId } = subject();
    const couponForm = queryByTestId('coupon-form');
    const validCoupon = queryByTestId('coupon-hascoupon');
    expect(couponForm).not.toBeInTheDocument();
    expect(validCoupon).toBeInTheDocument();
  });
});
