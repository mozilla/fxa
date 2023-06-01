import { render } from '@testing-library/react';

import CouponForm from './coupon-form';

describe('CouponForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CouponForm />);
    expect(baseElement).toBeTruthy();
  });
});
