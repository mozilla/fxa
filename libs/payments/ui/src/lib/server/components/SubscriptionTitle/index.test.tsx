/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { SubscriptionTitle, getComponentTitle } from './index';
import {
  CartState,
  CartEligibilityStatus,
  CartErrorReasonId,
} from '@fxa/shared/db/mysql/account';
import type { CartDTO } from '@fxa/payments/cart';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    className,
    role,
  }: {
    alt?: string;
    className?: string;
    role?: string;
  }) => (
    <img alt={alt ?? ''} className={className} role={role} src="mock-image" />
  ),
}));

const mockL10n = {
  getString: (
    _id: string,
    varsOrFallback?: Record<string, unknown> | string,
    fallback?: string
  ) => {
    if (typeof varsOrFallback === 'string') return varsOrFallback;
    return fallback ?? _id;
  },
};

type SubscriptionTitleProps = Parameters<typeof SubscriptionTitle>[0];

function makeCart(overrides: Partial<CartDTO> = {}): CartDTO {
  return {
    id: 'cart-123',
    state: CartState.START,
    eligibilityStatus: CartEligibilityStatus.CREATE,
    errorReasonId: null,
    offeringConfigId: 'offering-123',
    interval: 'monthly',
    amount: 999,
    currency: 'usd',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    ...overrides,
  } as CartDTO;
}

async function renderSubscriptionTitle(
  propsOverride?: Partial<SubscriptionTitleProps>
) {
  const defaultProps: SubscriptionTitleProps = {
    cart: makeCart(),
    l10n: mockL10n as unknown as SubscriptionTitleProps['l10n'],
  };
  const jsx = await SubscriptionTitle({ ...defaultProps, ...propsOverride });
  return render(jsx);
}

describe('getComponentTitle', () => {
  it('returns error title for FAIL state with CART_ELIGIBILITY_STATUS_SAME', () => {
    const result = getComponentTitle(
      makeCart({
        state: CartState.FAIL,
        errorReasonId: CartErrorReasonId.CART_ELIGIBILITY_STATUS_SAME,
      })
    );
    expect(result.titleFtl).toBe('subscription-title-sub-exists');
  });

  it.each([
    CartErrorReasonId.CART_ELIGIBILITY_STATUS_DOWNGRADE,
    CartErrorReasonId.CART_ELIGIBILITY_STATUS_INVALID,
    CartErrorReasonId.IAP_BLOCKED_CONTACT_SUPPORT,
  ])('returns not-supported title for FAIL state with %s', (errorReasonId) => {
    const result = getComponentTitle(
      makeCart({ state: CartState.FAIL, errorReasonId })
    );
    expect(result.titleFtl).toBe('subscription-title-not-supported');
  });

  it('returns generic error title for FAIL state with other errors', () => {
    const result = getComponentTitle(
      makeCart({
        state: CartState.FAIL,
        errorReasonId: CartErrorReasonId.BASIC_ERROR,
      })
    );
    expect(result.titleFtl).toBe('next-subscription-error-title');
  });

  it.each([CartState.NEEDS_INPUT, CartState.PROCESSING])(
    'returns processing title for %s state',
    (state) => {
      const result = getComponentTitle(makeCart({ state }));
      expect(result.titleFtl).toBe('next-subscription-processing-title');
    }
  );

  it('returns upgrade title for START state with UPGRADE eligibility', () => {
    const result = getComponentTitle(
      makeCart({
        state: CartState.START,
        eligibilityStatus: CartEligibilityStatus.UPGRADE,
      })
    );
    expect(result.titleFtl).toBe('subscription-title-plan-change-heading');
  });

  it('returns create title for START state with CREATE eligibility', () => {
    const result = getComponentTitle(
      makeCart({
        state: CartState.START,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      })
    );
    expect(result.titleFtl).toBe('next-subscription-create-title');
  });

  it('returns success title for SUCCESS state', () => {
    const result = getComponentTitle(makeCart({ state: CartState.SUCCESS }));
    expect(result.titleFtl).toBe('next-subscription-success-title');
  });
});

describe('SubscriptionTitle', () => {
  it('renders the heading with the correct title text', async () => {
    await renderSubscriptionTitle();
    expect(
      screen.getByRole('heading', { name: 'Set up your subscription' })
    ).toBeInTheDocument();
  });

  it('renders the 30-day guarantee subtitle for START state', async () => {
    await renderSubscriptionTitle();
    expect(screen.getByText('30-day money-back guarantee')).toBeInTheDocument();
  });

  it('does not render the subtitle for START with UPGRADE eligibility', async () => {
    await renderSubscriptionTitle({
      cart: makeCart({
        state: CartState.START,
        eligibilityStatus: CartEligibilityStatus.UPGRADE,
      }),
    });
    expect(
      screen.queryByText('30-day money-back guarantee')
    ).not.toBeInTheDocument();
  });

  it('renders the confirmation image for SUCCESS state', async () => {
    await renderSubscriptionTitle({
      cart: makeCart({ state: CartState.SUCCESS }),
    });
    const images = screen.getAllByRole('presentation');
    const confirmationImage = images.find((img) =>
      img.classList.contains('w-30')
    );
    expect(confirmationImage).toBeInTheDocument();
  });

  it('does not render the confirmation image for non-SUCCESS states', async () => {
    await renderSubscriptionTitle({
      cart: makeCart({ state: CartState.START }),
    });
    const images = screen.queryAllByRole('presentation');
    const confirmationImage = images.find((img) =>
      img.classList.contains('w-30')
    );
    expect(confirmationImage).toBeUndefined();
  });

  it('renders the subtitle for PROCESSING state', async () => {
    await renderSubscriptionTitle({
      cart: makeCart({ state: CartState.PROCESSING }),
    });
    expect(screen.getByText('30-day money-back guarantee')).toBeInTheDocument();
  });

  it('does not render the subtitle for FAIL state', async () => {
    await renderSubscriptionTitle({
      cart: makeCart({
        state: CartState.FAIL,
        errorReasonId: CartErrorReasonId.BASIC_ERROR,
      }),
    });
    expect(
      screen.queryByText('30-day money-back guarantee')
    ).not.toBeInTheDocument();
  });
});
