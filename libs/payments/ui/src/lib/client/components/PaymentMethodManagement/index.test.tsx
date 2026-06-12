/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  Stripe,
  StripeElements,
  StripePaymentElementChangeEvent,
  ConfirmationTokenResult,
  PaymentIntentOrSetupIntentResult,
} from '@stripe/stripe-js';
import { PaymentMethodManagement } from './index';

jest.mock('@radix-ui/react-form');

let mockPaymentElementChangeHandler:
  | ((event: StripePaymentElementChangeEvent) => void)
  | undefined;
let mockPaymentElementLoaderStartHandler: (() => void) | undefined;

jest.mock('@stripe/react-stripe-js', () => ({
  __esModule: true,
  PaymentElement: (props: {
    onChange?: (event: StripePaymentElementChangeEvent) => void;
    onLoaderStart?: () => void;
  }) => {
    mockPaymentElementChangeHandler = props.onChange;
    mockPaymentElementLoaderStartHandler = props.onLoaderStart;
    return <div data-testid="stripe-payment-element">PaymentElement</div>;
  },
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLocalization: () => ({
    l10n: {
      getString: (
        _id: string,
        _vars?: Record<string, unknown>,
        fallback?: string
      ) => fallback || _id,
    },
  }),
}));

const mockRouterPush = jest.fn();

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt ?? ''} className={className} src="mock-image" />
  ),
}));

const mockUpdateStripePaymentDetails = jest.fn();
const mockSetDefaultStripePaymentDetails = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  updateStripePaymentDetails: (...args: unknown[]) =>
    mockUpdateStripePaymentDetails(...args),
  setDefaultStripePaymentDetails: (...args: unknown[]) =>
    mockSetDefaultStripePaymentDetails(...args),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  BaseButton: ({
    children,
    className,
    disabled,
    'aria-disabled': ariaDisabled,
    type,
  }: {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    'aria-disabled'?: boolean;
    type?: string;
  }) => (
    <button
      type={type as 'submit' | 'button' | 'reset'}
      className={className}
      disabled={disabled}
      aria-disabled={ariaDisabled}
    >
      {children}
    </button>
  ),
  ButtonVariant: { Primary: 'primary' },
  getManagePaymentMethodErrorFtlInfo: (errorMessage?: string) => ({
    messageFtl: 'error-ftl-id',
    message: errorMessage || 'An error occurred',
  }),
}));

jest.mock('../LoadingSpinner', () => ({
  __esModule: true,
  LoadingSpinner: ({ className }: { className?: string }) => (
    <div data-testid="loading-spinner" className={className}>
      Loading...
    </div>
  ),
}));

let mockStripe: jest.Mocked<
  Pick<Stripe, 'createConfirmationToken' | 'handleNextAction'>
>;
let mockElements: jest.Mocked<Pick<StripeElements, 'submit'>>;

function buildChangeEvent(
  overrides: Pick<StripePaymentElementChangeEvent, 'complete' | 'value'>
): StripePaymentElementChangeEvent {
  return {
    elementType: 'payment',
    empty: false,
    collapsed: false,
    ...overrides,
  };
}

function simulateLoaderStart() {
  act(() => {
    mockPaymentElementLoaderStartHandler?.();
  });
}

function simulatePaymentChange(event: StripePaymentElementChangeEvent) {
  act(() => {
    mockPaymentElementChangeHandler?.(event);
  });
}

describe('PaymentMethodManagement', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockUpdateStripePaymentDetails.mockReset();
    mockSetDefaultStripePaymentDetails.mockReset();
    mockStripe = {
      createConfirmationToken: jest.fn(),
      handleNextAction: jest.fn(),
    } as jest.Mocked<
      Pick<Stripe, 'createConfirmationToken' | 'handleNextAction'>
    >;
    mockElements = {
      submit: jest.fn(),
    } as jest.Mocked<Pick<StripeElements, 'submit'>>;
    mockPaymentElementChangeHandler = undefined;
    mockPaymentElementLoaderStartHandler = undefined;
  });

  it('renders the heading and Stripe PaymentElement', () => {
    render(<PaymentMethodManagement locale="en" />);

    expect(
      screen.getByRole('heading', { name: /manage payment methods/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('stripe-payment-element')).toBeInTheDocument();
  });

  it('shows loading spinner before PaymentElement is ready', () => {
    render(<PaymentMethodManagement locale="en" />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('hides loading spinner after PaymentElement fires onLoaderStart', () => {
    render(<PaymentMethodManagement locale="en" />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    simulateLoaderStart();

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('does not show save button before card details are entered', () => {
    render(<PaymentMethodManagement locale="en" />);

    simulateLoaderStart();

    expect(
      screen.queryByRole('button', { name: /save payment method/i })
    ).not.toBeInTheDocument();
  });

  it('shows "Save payment method" button when new card details are entered', () => {
    render(<PaymentMethodManagement locale="en" />);

    simulateLoaderStart();
    simulatePaymentChange(
      buildChangeEvent({
        complete: true,
        value: { type: 'card' },
      })
    );

    expect(
      screen.getByRole('button', { name: /save payment method/i })
    ).toBeInTheDocument();
  });

  it('shows "Set as default" button when a non-default saved card is selected', () => {
    render(
      <PaymentMethodManagement
        locale="en"
        defaultPaymentMethod={{ id: 'pm_default_123', type: 'card' }}
      />
    );

    simulateLoaderStart();
    simulatePaymentChange(
      buildChangeEvent({
        complete: true,
        value: {
          type: 'card',
          payment_method: {
            id: 'pm_other_456',
            type: 'card',
            billing_details: {
              address: {
                city: null,
                country: null,
                line1: null,
                line2: null,
                postal_code: null,
                state: null,
              },
              name: null,
              email: null,
              phone: null,
            },
          },
        },
      })
    );

    expect(
      screen.getByRole('button', { name: /set as default payment method/i })
    ).toBeInTheDocument();
  });

  it('does not show button when the current default card is re-selected', () => {
    render(
      <PaymentMethodManagement
        locale="en"
        defaultPaymentMethod={{ id: 'pm_default_123', type: 'card' }}
      />
    );

    simulateLoaderStart();
    simulatePaymentChange(
      buildChangeEvent({
        complete: true,
        value: {
          type: 'card',
          payment_method: {
            id: 'pm_default_123',
            type: 'card',
            billing_details: {
              address: {
                city: null,
                country: null,
                line1: null,
                line2: null,
                postal_code: null,
                state: null,
              },
              name: null,
              email: null,
              phone: null,
            },
          },
        },
      })
    );

    expect(
      screen.queryByRole('button', { name: /set as default payment method/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /save payment method/i })
    ).not.toBeInTheDocument();
  });

  it('calls updateStripePaymentDetails on submit with new card and redirects on success', async () => {
    const user = userEvent.setup();

    mockElements.submit.mockResolvedValue({ error: undefined });
    mockStripe.createConfirmationToken.mockResolvedValue({
      confirmationToken: { id: 'ctoken_123' },
      error: undefined,
    } as ConfirmationTokenResult);
    mockUpdateStripePaymentDetails.mockResolvedValue({
      ok: true,
      result: { status: 'succeeded', clientSecret: null },
    });

    render(
      <PaymentMethodManagement locale="en" sessionEmail="user@example.com" />
    );

    simulateLoaderStart();
    simulatePaymentChange(
      buildChangeEvent({
        complete: true,
        value: { type: 'card' },
      })
    );

    const submitButton = screen.getByRole('button', {
      name: /save payment method/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateStripePaymentDetails).toHaveBeenCalledWith('ctoken_123');
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/en/subscriptions/manage');
    });
  });

  it('calls setDefaultStripePaymentDetails on submit when a non-default saved card is selected', async () => {
    const user = userEvent.setup();

    mockElements.submit.mockResolvedValue({ error: undefined });
    mockStripe.createConfirmationToken.mockResolvedValue({
      confirmationToken: { id: 'ctoken_456' },
      error: undefined,
    } as ConfirmationTokenResult);
    mockUpdateStripePaymentDetails.mockResolvedValue({
      ok: true,
      result: { status: 'requires_action', clientSecret: 'seti_secret_abc' },
    });
    mockStripe.handleNextAction.mockResolvedValue({
      setupIntent: {
        status: 'succeeded',
        payment_method: 'pm_other_789',
        client_secret: 'seti_secret_abc',
      },
      error: undefined,
    } as PaymentIntentOrSetupIntentResult);
    mockSetDefaultStripePaymentDetails.mockResolvedValue({});

    render(
      <PaymentMethodManagement
        locale="en"
        defaultPaymentMethod={{ id: 'pm_default_123', type: 'card' }}
      />
    );

    simulateLoaderStart();
    simulatePaymentChange(
      buildChangeEvent({
        complete: true,
        value: {
          type: 'card',
          payment_method: {
            id: 'pm_other_789',
            type: 'card',
            billing_details: {
              address: {
                city: null,
                country: null,
                line1: null,
                line2: null,
                postal_code: null,
                state: null,
              },
              name: null,
              email: null,
              phone: null,
            },
          },
        },
      })
    );

    const submitButton = screen.getByRole('button', {
      name: /set as default payment method/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockStripe.handleNextAction).toHaveBeenCalledWith({
        clientSecret: 'seti_secret_abc',
      });
    });

    await waitFor(() => {
      expect(mockSetDefaultStripePaymentDetails).toHaveBeenCalledWith(
        'pm_other_789'
      );
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/en/subscriptions/manage');
    });
  });

  it('displays error message when updateStripePaymentDetails returns not ok', async () => {
    const user = userEvent.setup();

    mockElements.submit.mockResolvedValue({ error: undefined });
    mockStripe.createConfirmationToken.mockResolvedValue({
      confirmationToken: { id: 'ctoken_123' },
      error: undefined,
    } as ConfirmationTokenResult);
    mockUpdateStripePaymentDetails.mockResolvedValue({
      ok: false,
      result: null,
      errorMessage: 'Card was declined',
    });

    render(<PaymentMethodManagement locale="en" />);

    simulateLoaderStart();
    simulatePaymentChange(
      buildChangeEvent({
        complete: true,
        value: { type: 'card' },
      })
    );

    const submitButton = screen.getByRole('button', {
      name: /save payment method/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Card was declined')).toBeInTheDocument();
    });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('displays error message when elements.submit returns an error', async () => {
    const user = userEvent.setup();

    mockElements.submit.mockResolvedValue({
      error: {
        type: 'validation_error',
        message: 'Your card number is incomplete.',
      },
    });

    render(<PaymentMethodManagement locale="en" />);

    simulateLoaderStart();
    simulatePaymentChange(
      buildChangeEvent({
        complete: true,
        value: { type: 'card' },
      })
    );

    const submitButton = screen.getByRole('button', {
      name: /save payment method/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Your card number is incomplete.')
      ).toBeInTheDocument();
    });

    expect(mockStripe.createConfirmationToken).not.toHaveBeenCalled();
  });
});
