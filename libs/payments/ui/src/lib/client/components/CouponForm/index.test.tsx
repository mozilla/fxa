/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@radix-ui/react-form');

jest.mock('react', () => {
  const actual = jest.requireActual<typeof import('react')>('react');
  return {
    ...actual,
    useActionState: <S, P>(
      action: (state: S, payload: P) => Promise<S> | S,
      initial: S
    ) => {
      const [state, setState] = actual.useState<S>(initial);
      const formAction = async (payload: P) => {
        const result = await action(state, payload);
        setState(result);
        return result;
      };
      return [state, formAction];
    },
  };
});

jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    useFormStatus: () => ({
      pending: false,
      data: null,
      method: null,
      action: null,
    }),
  };
});

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockRouterPush = jest.fn();
const mockSearchParamsRef: { current: URLSearchParams } = {
  current: new URLSearchParams(''),
};

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => '/test/path',
  useSearchParams: () => mockSearchParamsRef.current,
}));

const mockApplyCouponAction = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  applyCouponAction: (...args: unknown[]) => mockApplyCouponAction(...args),
}));

import { CouponForm } from './index';
import { CouponErrorMessageType } from '../../../utils/error-ftl-messages';

const baseProps = {
  cartId: 'cart-id',
  cartVersion: 1,
  readOnly: false,
};

describe('CouponForm', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockApplyCouponAction.mockReset();
    mockSearchParamsRef.current = new URLSearchParams('');
  });

  it('submits the entered coupon code to applyCouponAction without setting an error', async () => {
    mockApplyCouponAction.mockResolvedValue(undefined);

    render(<CouponForm {...baseProps} promoCode={null} />);

    fireEvent.change(screen.getByTestId('coupon-input'), {
      target: { value: 'SAVE10' },
    });
    fireEvent.click(screen.getByTestId('coupon-button'));

    await waitFor(() => {
      expect(mockApplyCouponAction).toHaveBeenCalledWith(
        'cart-id',
        1,
        'SAVE10'
      );
    });

    expect(screen.queryByTestId('coupon-error')).not.toBeInTheDocument();
  });

  it('shows the error fallback text and keeps the input visible when an invalid coupon is submitted', async () => {
    mockApplyCouponAction.mockResolvedValue(CouponErrorMessageType.Invalid);

    render(<CouponForm {...baseProps} promoCode={null} />);

    fireEvent.change(screen.getByTestId('coupon-input'), {
      target: { value: 'BADCODE' },
    });
    fireEvent.click(screen.getByTestId('coupon-button'));

    await waitFor(() => {
      expect(screen.getByTestId('coupon-error')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/code you entered is invalid/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('coupon-input')).toBeInTheDocument();
    expect(screen.queryByTestId('coupon-hascoupon')).not.toBeInTheDocument();
  });

  it('removes an applied coupon and resets to the input view when re-rendered without a promoCode', async () => {
    mockApplyCouponAction.mockResolvedValue(undefined);

    const { rerender } = render(
      <CouponForm {...baseProps} promoCode="SAVE10" />
    );

    expect(screen.getByTestId('coupon-hascoupon')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('coupon-remove-button'));

    await waitFor(() => {
      expect(mockApplyCouponAction).toHaveBeenCalledWith('cart-id', 1, '');
    });

    rerender(<CouponForm {...baseProps} promoCode={null} />);

    expect(screen.queryByTestId('coupon-hascoupon')).not.toBeInTheDocument();
    expect(screen.getByTestId('coupon-input')).toBeInTheDocument();
  });

  it('auto-applies a coupon from the search params on mount without user action', async () => {
    mockApplyCouponAction.mockResolvedValue(undefined);
    mockSearchParamsRef.current = new URLSearchParams('coupon=AUTOCODE');

    render(<CouponForm {...baseProps} promoCode={null} />);

    await waitFor(() => {
      expect(mockApplyCouponAction).toHaveBeenCalledWith(
        'cart-id',
        1,
        'AUTOCODE'
      );
    });

    expect(screen.queryByTestId('coupon-error')).not.toBeInTheDocument();
    expect(screen.getByTestId('coupon-input')).toBeInTheDocument();
  });
});
