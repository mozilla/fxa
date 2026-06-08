/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaypalPaymentManagementPage from './page';

const mockAuth = jest.fn();
const mockGetL10n = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();
const mockGetPayPalBillingAgreementId = jest.fn();
const mockDetermineCurrencyForCustomerAction = jest.fn();
const mockPaypalManagement = jest.fn();

jest.mock('apps/payments/next/auth', () => ({
  __esModule: true,
  auth: () => mockAuth(),
}));

jest.mock('@fxa/payments/ui/server', () => ({
  __esModule: true,
  getApp: () => ({
    getL10n: (...args: unknown[]) => mockGetL10n(...args),
  }),
}));

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getPayPalBillingAgreementId: (...args: unknown[]) =>
    mockGetPayPalBillingAgreementId(...args),
  determineCurrencyForCustomerAction: (...args: unknown[]) =>
    mockDetermineCurrencyForCustomerAction(...args),
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
    paypal: { clientId: 'paypal-client-id' },
  },
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error('NEXT_REDIRECT');
  },
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

// eslint-disable-next-line @next/next/no-img-element
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    className,
  }: {
    alt?: string;
    className?: string;
    src?: unknown;
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img alt={alt ?? ''} className={className} src="mock-image" />,
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  PaypalManagement: (props: Record<string, unknown>) => {
    mockPaypalManagement(props);
    return <div data-testid="paypal-management" />;
  },
}));

jest.mock('@fxa/shared/assets/images/error.svg', () => 'error.svg', {
  virtual: true,
});

const MOCK_USER_ID = 'user-123';

const baseSession = {
  user: {
    id: MOCK_USER_ID,
    email: 'user@example.com',
  },
};

const mockL10n = {
  getString: (_id: string, ...rest: unknown[]) => {
    const fallback = rest.length === 1 ? rest[0] : rest[1];
    return typeof fallback === 'string' ? fallback : '';
  },
};

const defaultParams = Promise.resolve({ locale: 'en' });

async function renderPage(paramsOverride?: Promise<Record<string, string>>) {
  const jsx = await PaypalPaymentManagementPage({
    params: (paramsOverride ?? defaultParams) as any,
  });
  return render(jsx);
}

describe('PayPal payment management page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => 'en-US' });
    mockAuth.mockResolvedValue(baseSession);
    mockGetL10n.mockReturnValue(mockL10n);
    mockGetPayPalBillingAgreementId.mockResolvedValue(null);
    mockDetermineCurrencyForCustomerAction.mockResolvedValue('usd');
  });

  it('redirects to landing when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('redirects to landing when billing agreement already exists', async () => {
    mockGetPayPalBillingAgreementId.mockResolvedValue('ba_existing');

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('redirects to landing when currency cannot be determined', async () => {
    mockDetermineCurrencyForCustomerAction.mockResolvedValue(null);

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('renders invalid billing information heading', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', { name: /Invalid billing information/i })
    ).toBeInTheDocument();
  });

  it('renders error description about PayPal account issue', async () => {
    await renderPage();

    expect(
      screen.getByText(
        /There seems to be an error with your PayPal account/i
      )
    ).toBeInTheDocument();
  });

  it('renders "Pay with PayPal" separator text', async () => {
    await renderPage();

    expect(screen.getByText(/Pay with PayPal/i)).toBeInTheDocument();
  });

  it('renders PaypalManagement component with config and currency', async () => {
    await renderPage();

    expect(screen.getByTestId('paypal-management')).toBeInTheDocument();
    expect(mockPaypalManagement).toHaveBeenCalledWith(
      expect.objectContaining({
        paypalClientId: 'paypal-client-id',
        currency: 'usd',
      })
    );
  });

  it('renders the page section with correct test id', async () => {
    await renderPage();

    expect(
      screen.getByTestId('paypal-payment-management')
    ).toBeInTheDocument();
  });
});
