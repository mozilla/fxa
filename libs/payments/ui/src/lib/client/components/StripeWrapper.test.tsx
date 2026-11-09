/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { StripeWrapper } from './StripeWrapper';

const mockElements = jest.fn();

jest.mock('@stripe/stripe-js', () => ({
  __esModule: true,
  loadStripe: jest.fn().mockResolvedValue(null),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  __esModule: true,
  Elements: (props: {
    options: StripeElementsOptions;
    children: React.ReactNode;
  }) => {
    mockElements(props.options);
    return <>{props.children}</>;
  },
}));

const renderWrapper = (amount: number) =>
  render(
    <StripeWrapper
      amount={amount}
      currency="USD"
      cart={{ id: 'cart_12345' }}
      locale="en"
    >
      <div />
    </StripeWrapper>
  );

describe('StripeWrapper', () => {
  beforeEach(() => {
    mockElements.mockClear();
  });

  it('passes the amount in subscription mode when it meets the minimum charge', () => {
    renderWrapper(1000);

    expect(mockElements).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        amount: 1000,
        currency: 'usd',
      })
    );
  });

  it('passes a zero amount in subscription mode when below the minimum charge', () => {
    renderWrapper(30);

    expect(mockElements).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        amount: 0,
        currency: 'usd',
      })
    );
  });
});
