/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    onClick,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

const mockCancelSubscriptionAtPeriodEndAction = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  cancelSubscriptionAtPeriodEndAction: (...args: unknown[]) =>
    mockCancelSubscriptionAtPeriodEndAction(...args),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  ButtonVariant: {
    Primary: 'primary',
    SubscriptionManagementError: 'sub-mgmt-error',
  },
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

jest.mock('@fxa/shared/react', () => ({
  __esModule: true,
  LinkExternal: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { CancelSubscription } from './index';

const baseProps = {
  subscriptionId: 'sub-id',
  locale: 'en',
  pageContent: {
    active: true,
    cancelAtPeriodEnd: false,
    productName: 'Mozilla VPN',
    currentPeriodEnd: 1735689600,
    supportUrl: 'https://support.example.com',
    webIcon: 'https://example.com/icon.png',
  },
};

describe('CancelSubscription', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockCancelSubscriptionAtPeriodEndAction.mockReset();
  });

  describe('Already-cancelled variant', () => {
    it('hides the cancel checkbox and submit button, displays expiry date, and shows the back-to-subscriptions link', () => {
      render(
        <CancelSubscription
          {...baseProps}
          pageContent={{ ...baseProps.pageContent, cancelAtPeriodEnd: true }}
        />
      );

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Cancel your subscription/i })
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole('heading', { name: /sorry to see you go/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Mozilla VPN subscription has been cancelled/i)
      ).toBeInTheDocument();

      const backLink = screen.getByRole('link', {
        name: /Back to subscriptions/i,
      });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/en/subscriptions/landing');
    });
  });

  describe('Active subscription cancel flow', () => {
    it('cancel button disabled until checkbox checked', async () => {
      const user = userEvent.setup();
      render(<CancelSubscription {...baseProps} />);

      const submitButton = screen.getByRole('button', {
        name: /Cancel your subscription/i,
      });
      expect(submitButton).toBeDisabled();

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(submitButton).not.toBeDisabled();
    });

    it('shows "sorry to see you go" message after successful cancel', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: true });

      render(<CancelSubscription {...baseProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      await user.click(
        screen.getByRole('button', { name: /Cancel your subscription/i })
      );

      await waitFor(() => {
        expect(mockCancelSubscriptionAtPeriodEndAction).toHaveBeenCalledWith(
          'sub-id'
        );
      });
    });

    it('shows expiry date after cancellation completes', () => {
      render(
        <CancelSubscription
          {...baseProps}
          pageContent={{ ...baseProps.pageContent, cancelAtPeriodEnd: true }}
        />
      );

      expect(
        screen.getByText(/subscription has been cancelled/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Back to subscriptions/i })
      ).toBeInTheDocument();
    });

    it('shows error alert when cancel action rejects', async () => {
      const user = userEvent.setup();
      mockCancelSubscriptionAtPeriodEndAction.mockResolvedValue({ ok: false });

      render(<CancelSubscription {...baseProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      await user.click(
        screen.getByRole('button', { name: /Cancel your subscription/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/An unexpected error occurred/i)
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Cancel your subscription/i })
      ).not.toBeDisabled();
    });
  });
});
