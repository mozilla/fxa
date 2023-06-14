import { render } from '@testing-library/react';

import CouponFormServer from './coupon-form-server';

describe('CouponFormServer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CouponFormServer />);
    expect(baseElement).toBeTruthy();
  });
});
