/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from './index';

const mockPaymentElementListeners: Array<[string, (event?: unknown) => void]> =
  [];
const mockPaymentElement = {
  on: (event: string, cb: (event?: unknown) => void) => {
    mockPaymentElementListeners.push([event, cb]);
  },
};
const mockElementsSubmit = jest.fn();
const mockElements = {
  getElement: () => mockPaymentElement,
  submit: mockElementsSubmit,
};
const mockCreateConfirmationToken = jest.fn();
const mockStripe = { createConfirmationToken: mockCreateConfirmationToken };

jest.mock('@stripe/react-stripe-js', () => ({
  __esModule: true,
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  PaymentElement: () => <div data-testid="payment-element" />,
  LinkAuthenticationElement: () => <div data-testid="link-auth-element" />,
}));

type PayPalButtonsMockProps = {
  onApprove: (data: { orderID: string }) => unknown;
  onError: (err: unknown) => unknown;
  [key: string]: unknown;
};
let mockLastPaypalProps: PayPalButtonsMockProps | null = null;
const mockPaypalScriptState = { isPending: false, isRejected: false };

jest.mock('@paypal/react-paypal-js', () => ({
  __esModule: true,
  PayPalButtons: (props: PayPalButtonsMockProps) => {
    mockLastPaypalProps = props;
    return <div data-testid="paypal-buttons" />;
  },
  usePayPalScriptReducer: () => [mockPaypalScriptState],
}));

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockRouterPush = jest.fn();

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockRouterPush }),
  useParams: () => ({ offeringId: 'foo', interval: 'monthly' }),
  usePathname: () => '/test/checkout/cart-id',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    className,
  }: {
    alt?: string;
    className?: string;
    src?: unknown;
  }) => <img alt={alt ?? ''} className={className} src="mock-image" />,
}));

const mockGlean = {
  recordInterstitialOfferView: jest.fn(),
  recordInterstitialOfferEngage: jest.fn(),
  recordInterstitialOfferSubmit: jest.fn(),
};

jest.mock('../../hooks/useGleanMetrics', () => ({
  __esModule: true,
  useGleanMetrics: () => mockGlean,
}));

const mockCheckoutCartWithStripe = jest.fn();
const mockCheckoutCartWithPaypal = jest.fn();
const mockFinalizeCartWithError = jest.fn();
const mockHandleStripeErrorAction = jest.fn();
const mockRecordEmitterEventAction = jest.fn();
const mockGetPayPalCheckoutToken = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  checkoutCartWithStripe: (...args: unknown[]) =>
    mockCheckoutCartWithStripe(...args),
  checkoutCartWithPaypal: (...args: unknown[]) =>
    mockCheckoutCartWithPaypal(...args),
  finalizeCartWithError: (...args: unknown[]) =>
    mockFinalizeCartWithError(...args),
  handleStripeErrorAction: (...args: unknown[]) =>
    mockHandleStripeErrorAction(...args),
  recordEmitterEventAction: (...args: unknown[]) =>
    mockRecordEmitterEventAction(...args),
  getPayPalCheckoutToken: (...args: unknown[]) =>
    mockGetPayPalCheckoutToken(...args),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  BaseButton: ({
    children,
    className,
    type,
    'aria-disabled': ariaDisabled,
  }: {
    children: React.ReactNode;
    className?: string;
    type?: 'submit' | 'button' | 'reset';
    'aria-disabled'?: boolean;
  }) => (
    <button type={type} aria-disabled={ariaDisabled} className={className}>
      {children}
    </button>
  ),
  ButtonVariant: { Primary: 'primary' },
  CheckoutCheckbox: ({
    notifyCheckboxChange,
    disabled,
    termsOfService,
    privacyNotice,
  }: {
    notifyCheckboxChange: (value: boolean) => void;
    disabled: boolean;
    termsOfService?: string;
    privacyNotice?: string;
  }) => (
    <>
      <input
        type="checkbox"
        data-testid="consent-checkbox"
        disabled={disabled}
        onChange={(e) => notifyCheckboxChange(e.target.checked)}
      />
      {termsOfService && (
        <a href={termsOfService} data-testid="link-terms-of-service">
          Terms of Service
        </a>
      )}
      {privacyNotice && (
        <a href={privacyNotice} data-testid="link-privacy-notice">
          Privacy Notice
        </a>
      )}
    </>
  ),
}));

jest.mock('@fxa/shared/db/mysql/account/kysely-types', () => ({
  __esModule: true,
  CartErrorReasonId: { BASIC_ERROR: 'basic-error' },
}));

jest.mock('@sentry/nextjs', () => ({
  __esModule: true,
  captureMessage: jest.fn(),
}));

const baseCart = {
  id: 'cart-id',
  version: 1,
  uid: 'session-uid',
  errorReasonId: null,
  couponCode: null,
  currency: 'usd',
  taxAddress: { countryCode: 'US', postalCode: '94107' },
};

const baseProps = {
  cmsCommonContent: {
    termsOfServiceUrl: 'https://example.com/tos',
    privacyNoticeUrl: 'https://example.com/privacy',
  },
  cart: baseCart,
  locale: 'en',
  sessionEmail: 'user@example.com',
};

const fireStripeReady = () => {
  const handler = mockPaymentElementListeners.find(([e]) => e === 'ready')?.[1];
  if (!handler) throw new Error('PaymentElement ready listener not registered');
  act(() => {
    handler();
  });
};

const fireStripeChange = (event: {
  complete: boolean;
  value: { type: string; payment_method?: { id?: string } };
}) => {
  const handler = [...mockPaymentElementListeners]
    .reverse()
    .find(([e]) => e === 'change')?.[1];
  if (!handler)
    throw new Error('PaymentElement change listener not registered');
  act(() => {
    handler(event);
  });
};

const renderAndSelectPaypal = async () => {
  const user = userEvent.setup();
  render(<CheckoutForm {...baseProps} />);
  fireStripeReady();
  await user.click(screen.getByTestId('consent-checkbox'));
  fireStripeChange({
    complete: true,
    value: { type: 'external_paypal' },
  });
};

const getPaypalProps = (): PayPalButtonsMockProps => {
  if (!mockLastPaypalProps) throw new Error('PayPalButtons not rendered');
  return mockLastPaypalProps;
};

describe('CheckoutForm', () => {
  beforeEach(() => {
    mockPaymentElementListeners.length = 0;
    mockLastPaypalProps = null;
    mockPaypalScriptState.isPending = false;
    mockPaypalScriptState.isRejected = false;
    mockRouterPush.mockReset();
    mockElementsSubmit.mockReset();
    mockCreateConfirmationToken.mockReset();
    mockCheckoutCartWithStripe.mockReset();
    mockCheckoutCartWithPaypal.mockReset();
    mockFinalizeCartWithError.mockReset();
    mockHandleStripeErrorAction.mockReset();
    mockRecordEmitterEventAction.mockReset();
    mockGetPayPalCheckoutToken.mockReset();
  });

  describe('Stripe payment path', () => {
    it('renders the payment element, consent checkbox, and submit button when Stripe is ready', () => {
      render(<CheckoutForm {...baseProps} />);
      fireStripeReady();

      expect(screen.getByTestId('payment-element')).toBeInTheDocument();
      expect(screen.getByTestId('consent-checkbox')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Subscribe Now/i })
      ).toBeInTheDocument();
      expect(screen.queryByTestId('paypal-buttons')).not.toBeInTheDocument();
    });

    it('keeps the submit button disabled until consent is given and stripe fields are complete', async () => {
      const user = userEvent.setup();
      render(<CheckoutForm {...baseProps} />);
      fireStripeReady();

      const submitButton = screen.getByRole('button', {
        name: /Subscribe Now/i,
      });
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');

      await user.click(screen.getByTestId('consent-checkbox'));
      fireStripeChange({ complete: false, value: { type: 'card' } });
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');

      fireStripeChange({ complete: true, value: { type: 'card' } });
      expect(submitButton).toHaveAttribute('aria-disabled', 'false');
    });

    it('shows a loading spinner and disables the submit button while submission is in flight', async () => {
      const user = userEvent.setup();
      mockElementsSubmit.mockImplementation(() => new Promise(() => {}));

      render(<CheckoutForm {...baseProps} />);
      fireStripeReady();
      await user.click(screen.getByTestId('consent-checkbox'));
      fireStripeChange({ complete: true, value: { type: 'card' } });

      await user.click(screen.getByRole('button', { name: /Subscribe Now/i }));

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button.querySelector('img.animate-spin')).toBeInTheDocument();
      });
    });

    it('re-enables the form and calls handleStripeErrorAction when payment confirmation fails', async () => {
      mockElementsSubmit.mockResolvedValue({ error: undefined });
      mockCreateConfirmationToken.mockResolvedValue({
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.',
        },
      });
      mockHandleStripeErrorAction.mockResolvedValue(undefined);

      const user = userEvent.setup();
      render(<CheckoutForm {...baseProps} />);
      fireStripeReady();
      await user.click(screen.getByTestId('consent-checkbox'));
      fireStripeChange({ complete: true, value: { type: 'card' } });

      await user.click(screen.getByRole('button', { name: /Subscribe Now/i }));

      await waitFor(() => {
        expect(mockHandleStripeErrorAction).toHaveBeenCalledWith(
          'cart-id',
          expect.objectContaining({ type: 'card_error' }),
          '/test/checkout/cart-id',
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Subscribe Now/i })
        ).toHaveAttribute('aria-disabled', 'false');
      });

      expect(mockCheckoutCartWithStripe).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('PayPal payment path', () => {
    it('checks out the cart and routes to processing when PayPal onApprove is invoked', async () => {
      mockCheckoutCartWithPaypal.mockResolvedValue(undefined);
      await renderAndSelectPaypal();

      await waitFor(() => {
        expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument();
      });
      const { onApprove } = getPaypalProps();

      await act(async () => {
        await onApprove({ orderID: 'order-id-123' });
      });

      expect(mockCheckoutCartWithPaypal).toHaveBeenCalledWith(
        'cart-id',
        1,
        expect.any(Object),
        expect.any(Object),
        expect.any(Object),
        'order-id-123'
      );
      expect(mockRouterPush).toHaveBeenCalledWith('./processing');
    });

    it('finalizes the cart with an error and routes to error when PayPal onError is invoked', async () => {
      mockFinalizeCartWithError.mockResolvedValue(undefined);
      await renderAndSelectPaypal();

      await waitFor(() => {
        expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument();
      });
      const { onError } = getPaypalProps();

      await act(async () => {
        await onError(new Error('paypal failure'));
      });

      expect(mockFinalizeCartWithError).toHaveBeenCalledWith(
        'cart-id',
        'basic-error'
      );
      expect(mockRouterPush).toHaveBeenCalledWith('./error');
      expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument();
      expect(mockCheckoutCartWithPaypal).not.toHaveBeenCalled();
    });
  });

  it('renders both Stripe PaymentElement and PayPal buttons when PayPal payment type is selected', async () => {
    await renderAndSelectPaypal();

    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    expect(screen.getByTestId('paypal-buttons')).toBeInTheDocument();
  });

  describe('wallet payment type handling', () => {
    it.each([
      { paymentType: 'link', label: 'Link' },
      { paymentType: 'google_pay', label: 'Google Pay' },
      { paymentType: 'apple_pay', label: 'Apple Pay' },
    ])(
      'enables submit button when $label wallet type is selected and fields are complete',
      async ({ paymentType }) => {
        const user = userEvent.setup();
        render(<CheckoutForm {...baseProps} />);
        fireStripeReady();

        await user.click(screen.getByTestId('consent-checkbox'));
        fireStripeChange({ complete: true, value: { type: paymentType } });

        const submitButton = screen.getByRole('button', {
          name: /Subscribe Now/i,
        });
        expect(submitButton).toHaveAttribute('aria-disabled', 'false');
      }
    );

    it.each([
      { paymentType: 'link', label: 'Link' },
      { paymentType: 'google_pay', label: 'Google Pay' },
      { paymentType: 'apple_pay', label: 'Apple Pay' },
    ])(
      'calls checkoutCartWithStripe with confirmation token for $label payment type',
      async ({ paymentType }) => {
        const user = userEvent.setup();
        mockElementsSubmit.mockResolvedValue({ error: undefined });
        mockCreateConfirmationToken.mockResolvedValue({
          confirmationToken: { id: `ctoken_${paymentType}_123` },
        });
        mockCheckoutCartWithStripe.mockResolvedValue(undefined);

        render(<CheckoutForm {...baseProps} />);
        fireStripeReady();
        await user.click(screen.getByTestId('consent-checkbox'));
        fireStripeChange({
          complete: true,
          value: { type: paymentType },
        });

        await user.click(
          screen.getByRole('button', { name: /Subscribe Now/i })
        );

        await waitFor(() => {
          expect(mockCheckoutCartWithStripe).toHaveBeenCalledWith(
            'cart-id',
            1,
            `ctoken_${paymentType}_123`,
            paymentType,
            expect.any(Object),
            expect.any(Object),
            expect.any(Object)
          );
        });

        await waitFor(() => {
          expect(mockRouterPush).toHaveBeenCalledWith('./processing');
        });
      }
    );

    it('does not show PayPal buttons for non-PayPal wallet types', async () => {
      render(<CheckoutForm {...baseProps} />);
      fireStripeReady();
      fireStripeChange({ complete: true, value: { type: 'google_pay' } });

      expect(screen.queryByTestId('paypal-buttons')).not.toBeInTheDocument();
    });
  });

  describe('Checkout legal links', () => {
    it('renders the Terms of Service link with the correct href', () => {
      render(<CheckoutForm {...baseProps} />);
      fireStripeReady();

      const tosLink = screen.getByTestId('link-terms-of-service');
      expect(tosLink).toHaveAttribute('href', 'https://example.com/tos');
    });

    it('renders the Privacy Notice link with the correct href', () => {
      render(<CheckoutForm {...baseProps} />);
      fireStripeReady();

      const privacyLink = screen.getByTestId('link-privacy-notice');
      expect(privacyLink).toHaveAttribute(
        'href',
        'https://example.com/privacy'
      );
    });

    it('renders both legal links with distinct hrefs from cmsCommonContent', () => {
      const customProps = {
        ...baseProps,
        cmsCommonContent: {
          termsOfServiceUrl: 'https://custom.example.com/terms',
          privacyNoticeUrl: 'https://custom.example.com/privacy',
        },
      };
      render(<CheckoutForm {...customProps} />);
      fireStripeReady();

      expect(screen.getByTestId('link-terms-of-service')).toHaveAttribute(
        'href',
        'https://custom.example.com/terms'
      );
      expect(screen.getByTestId('link-privacy-notice')).toHaveAttribute(
        'href',
        'https://custom.example.com/privacy'
      );
    });
  });
});
