/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaypalManagement } from './index';
import * as Sentry from '@sentry/nextjs';

let capturedCreateOrder: (() => Promise<string>) | undefined;
let capturedOnApprove:
  | ((data: { orderID: string }) => Promise<void>)
  | undefined;
let capturedOnError: ((error: unknown) => void) | undefined;
let mockScriptReducerState = { isPending: false, isRejected: false };

jest.mock('@paypal/react-paypal-js', () => ({
  __esModule: true,
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  PayPalButtons: (props: {
    createOrder?: () => Promise<string>;
    onApprove?: (data: { orderID: string }) => Promise<void>;
    onError?: (error: unknown) => void;
    className?: string;
  }) => {
    capturedCreateOrder = props.createOrder;
    capturedOnApprove = props.onApprove;
    capturedOnError = props.onError;
    return (
      <button
        data-testid="paypal-button"
        onClick={async () => {
          if (capturedCreateOrder && capturedOnApprove) {
            const orderId = await capturedCreateOrder();
            await capturedOnApprove({ orderID: orderId });
          }
        }}
      >
        PayPal
      </button>
    );
  },
  usePayPalScriptReducer: () => [mockScriptReducerState],
}));

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockRouterPush = jest.fn();

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockRouterPush }),
  useParams: () => ({ locale: 'en' }),
  useSearchParams: () => ({
    toString: () => '',
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt ?? ''} className={className} src="mock-image" />
  ),
}));

const mockGetPayPalCheckoutToken = jest.fn();
const mockCreatePayPalBillingAgreementId = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getPayPalCheckoutToken: (...args: unknown[]) =>
    mockGetPayPalCheckoutToken(...args),
  createPayPalBillingAgreementId: (...args: unknown[]) =>
    mockCreatePayPalBillingAgreementId(...args),
}));

jest.mock('@sentry/nextjs', () => ({
  __esModule: true,
  captureMessage: jest.fn(),
}));

describe('PaypalManagement', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockGetPayPalCheckoutToken.mockReset();
    mockCreatePayPalBillingAgreementId.mockReset();
    capturedCreateOrder = undefined;
    capturedOnApprove = undefined;
    capturedOnError = undefined;
    mockScriptReducerState = { isPending: false, isRejected: false };
  });

  it('renders the PayPal button when script is loaded', () => {
    render(
      <PaypalManagement
        paypalClientId="test-client-id"
        currency="usd"
      />
    );

    expect(screen.getByTestId('paypal-button')).toBeInTheDocument();
  });

  it('shows a spinner while the PayPal script is loading', () => {
    mockScriptReducerState = { isPending: true, isRejected: false };

    render(
      <PaypalManagement
        paypalClientId="test-client-id"
        currency="usd"
      />
    );

    expect(screen.getByRole('presentation')).toBeInTheDocument();
    expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument();
  });

  it('shows an error message and reports to Sentry when PayPal script fails to load', () => {
    mockScriptReducerState = { isPending: false, isRejected: true };

    render(
      <PaypalManagement
        paypalClientId="test-client-id"
        currency="usd"
      />
    );

    expect(
      screen.getByText(/PayPal is currently unavailable/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('paypal-button')).not.toBeInTheDocument();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'PayPal script failed to load'
    );
  });

  it('calls getPayPalCheckoutToken with lowercase currency on createOrder', async () => {
    mockGetPayPalCheckoutToken.mockResolvedValue('EC-TOKEN123');

    render(
      <PaypalManagement
        paypalClientId="test-client-id"
        currency="USD"
      />
    );

    if (!capturedCreateOrder) {
      throw new Error('createOrder callback was not captured');
    }
    const token = await capturedCreateOrder();

    expect(mockGetPayPalCheckoutToken).toHaveBeenCalledWith('usd');
    expect(token).toBe('EC-TOKEN123');
  });

  it('creates billing agreement and redirects to manage page on approval', async () => {
    const user = userEvent.setup();
    mockGetPayPalCheckoutToken.mockResolvedValue('EC-TOKEN123');
    mockCreatePayPalBillingAgreementId.mockResolvedValue(undefined);

    render(
      <PaypalManagement
        paypalClientId="test-client-id"
        currency="usd"
      />
    );

    await user.click(screen.getByTestId('paypal-button'));

    await waitFor(() => {
      expect(mockCreatePayPalBillingAgreementId).toHaveBeenCalledWith(
        'EC-TOKEN123'
      );
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        '/en/subscriptions/manage'
      );
    });
  });

  it('propagates PayPal checkout errors via onError handler', () => {
    render(
      <PaypalManagement
        paypalClientId="test-client-id"
        currency="usd"
      />
    );

    if (!capturedOnError) {
      throw new Error('onError callback was not captured');
    }
    const onError = capturedOnError;
    const testError = new Error('PayPal checkout failed');
    expect(() => onError(testError)).toThrow('PayPal checkout failed');
  });
});
