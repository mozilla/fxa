/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { SessionFactory } from '@fxa/payments/ui-auth/testing';
import StripePaymentManagementPage from './page';

const mockAuth = jest.fn();
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();
const mockGetStripeClientSession = jest.fn();
const mockStripeManagementWrapper = jest.fn();
const mockPaymentMethodManagement = jest.fn();

jest.mock('apps/payments/next/auth', () => ({
  __esModule: true,
  auth: () => mockAuth(),
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
  },
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  // Next.js redirect() throws to halt execution
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error('NEXT_REDIRECT');
  },
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'mock-uuid-value',
}));

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  getStripeClientSession: (...args: unknown[]) =>
    mockGetStripeClientSession(...args),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  StripeManagementWrapper: (props: Record<string, unknown>) => {
    mockStripeManagementWrapper(props);
    return (
      <div data-testid="stripe-management-wrapper">
        {props.children as React.ReactNode}
      </div>
    );
  },
  PaymentMethodManagement: (props: Record<string, unknown>) => {
    mockPaymentMethodManagement(props);
    return <div data-testid="payment-method-management" />;
  },
}));

const baseSession = SessionFactory();
const MOCK_USER_EMAIL = baseSession.user.email;
const MOCK_CLIENT_SECRET = 'cs_test_secret_abc';
const MOCK_CURRENCY = 'usd';

const baseStripeClientSession = {
  clientSecret: MOCK_CLIENT_SECRET,
  currency: MOCK_CURRENCY,
  defaultPaymentMethod: {
    type: 'card',
    id: 'pm_123',
    brand: 'visa',
    last4: '4242',
  },
};

const defaultParams = Promise.resolve({ locale: 'en' });

async function renderPage(paramsOverride?: Promise<Record<string, string>>) {
  const jsx = await StripePaymentManagementPage({
    params: (paramsOverride ?? defaultParams) as any,
  });
  return render(jsx);
}

describe('StripePaymentManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(baseSession);
    mockGetStripeClientSession.mockResolvedValue(baseStripeClientSession);
  });

  it('redirects unauthenticated users to landing', async () => {
    mockAuth.mockResolvedValue(null);

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('redirects when session user has no id', async () => {
    mockAuth.mockResolvedValue({ user: { email: MOCK_USER_EMAIL } });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('redirects when AccountCustomerNotFoundError is thrown', async () => {
    const error = new Error('Customer not found');
    error.name = 'AccountCustomerNotFoundError';
    mockGetStripeClientSession.mockRejectedValue(error);

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('redirects when CurrencyForCustomerNotFoundError is thrown', async () => {
    const error = new Error('Currency not found');
    error.name = 'CurrencyForCustomerNotFoundError';
    mockGetStripeClientSession.mockRejectedValue(error);

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith(
      'https://payments.example.com/en/subscriptions/landing'
    );
  });

  it('re-throws unexpected errors from getStripeClientSession', async () => {
    const unexpectedError = new Error('Something went wrong');
    mockGetStripeClientSession.mockRejectedValue(unexpectedError);

    await expect(renderPage()).rejects.toThrow('Something went wrong');
  });

  it('renders StripeManagementWrapper with correct props', async () => {
    await renderPage();

    expect(screen.getByTestId('stripe-management-wrapper')).toBeInTheDocument();
    expect(mockStripeManagementWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en',
        currency: MOCK_CURRENCY,
        sessionSecret: MOCK_CLIENT_SECRET,
        instanceKey: 'card-pm_123',
      })
    );
  });

  it('renders PaymentMethodManagement with defaultPaymentMethod and email', async () => {
    await renderPage();

    expect(screen.getByTestId('payment-method-management')).toBeInTheDocument();
    expect(mockPaymentMethodManagement).toHaveBeenCalledWith({
      defaultPaymentMethod: baseStripeClientSession.defaultPaymentMethod,
      sessionEmail: MOCK_USER_EMAIL,
      locale: 'en',
    });
  });

  it('renders PaymentMethodManagement without defaultPaymentMethod (empty state)', async () => {
    mockGetStripeClientSession.mockResolvedValue({
      clientSecret: MOCK_CLIENT_SECRET,
      currency: MOCK_CURRENCY,
      defaultPaymentMethod: null,
    });

    await renderPage();

    expect(mockPaymentMethodManagement).toHaveBeenCalledWith({
      defaultPaymentMethod: null,
      sessionEmail: MOCK_USER_EMAIL,
      locale: 'en',
    });
  });

  it('uses uuid as instanceKey when defaultPaymentMethod is null', async () => {
    mockGetStripeClientSession.mockResolvedValue({
      clientSecret: MOCK_CLIENT_SECRET,
      currency: MOCK_CURRENCY,
      defaultPaymentMethod: null,
    });

    await renderPage();

    expect(mockStripeManagementWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        instanceKey: 'mock-uuid-value',
      })
    );
  });

  it('renders the section with the correct data-testid', async () => {
    await renderPage();

    expect(screen.getByTestId('stripe-payment-management')).toBeInTheDocument();
  });
});
