/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@radix-ui/react-form');

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

const mockResubscribeSubscriptionAction = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  resubscribeSubscriptionAction: (...args: unknown[]) =>
    mockResubscribeSubscriptionAction(...args),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  ButtonVariant: { Primary: 'primary' },
  SubmitButton: ({
    children,
    className,
    disabled,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    'aria-label'?: string;
  }) => (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

import { StaySubscribed } from './index';

const basePageContent = {
  active: true,
  cancelAtPeriodEnd: true,
  currency: 'usd',
  currentPeriodEnd: 1735689600,
  productName: 'Mozilla VPN',
  webIcon: 'https://example.com/icon.png',
};

const baseProps = {
  userId: 'user-id',
  subscriptionId: 'sub-id',
  locale: 'en',
  pageContent: basePageContent,
};

describe('StaySubscribed', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockResubscribeSubscriptionAction.mockReset();
  });

  describe('Resubscribe view', () => {
    it('renders the product name, the next charge with a tax line, and a resubscribe button when nextInvoiceTax is present', () => {
      render(
        <StaySubscribed
          {...baseProps}
          pageContent={{
            ...basePageContent,
            nextInvoiceTotal: 999,
            nextInvoiceTax: 100,
          }}
        />
      );

      expect(
        screen.getByRole('heading', { name: /Want to keep using Mozilla VPN/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/\$1\.00 tax/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Resubscribe to Mozilla VPN/i })
      ).toBeInTheDocument();
    });

    it('renders the next charge without a tax line when nextInvoiceTax is absent', () => {
      render(
        <StaySubscribed
          {...baseProps}
          pageContent={{
            ...basePageContent,
            nextInvoiceTotal: 999,
          }}
        />
      );

      expect(
        screen.getByRole('heading', { name: /Want to keep using Mozilla VPN/i })
      ).toBeInTheDocument();
      expect(screen.queryByText(/tax/i)).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Resubscribe to Mozilla VPN/i })
      ).toBeInTheDocument();
    });
  });

  describe('Resubscribe error path', () => {
    it('shows an error message and keeps the form interactive when the resubscribe action fails', async () => {
      mockResubscribeSubscriptionAction.mockResolvedValue({ ok: false });

      render(
        <StaySubscribed
          {...baseProps}
          pageContent={{
            ...basePageContent,
            nextInvoiceTotal: 999,
          }}
        />
      );

      const submitButton = screen.getByRole('button', {
        name: /Resubscribe to Mozilla VPN/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/An unexpected error occurred/i)
        ).toBeInTheDocument();
      });

      expect(mockResubscribeSubscriptionAction).toHaveBeenCalledWith(
        'user-id',
        'sub-id'
      );

      expect(submitButton).not.toBeDisabled();
    });
  });
});
