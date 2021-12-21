import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TestRenderer from 'react-test-renderer';

import Coupon from './index';
import { getLocalizedCurrency } from '../../lib/formats';

afterEach(cleanup);

describe('PlanDetails', () => {
  it('renders as expected', () => {
    const subject = () => {
      return render(<Coupon />);
    };

    const { queryByTestId } = subject();
    const couponInputField = queryByTestId('coupon');
    expect(couponInputField).toBeInTheDocument();
  });
});
