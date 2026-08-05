/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { TermsAndPrivacy } from './index';

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

type TermsAndPrivacyProps = Parameters<typeof TermsAndPrivacy>[0];

const baseProps: TermsAndPrivacyProps = {
  l10n: mockL10n as unknown as TermsAndPrivacyProps['l10n'],
  productName: 'Mozilla VPN',
  termsOfServiceUrl: 'https://example.com/tos',
  termsOfServiceDownloadUrl: 'https://example.com/tos-download',
  privacyNoticeUrl: 'https://example.com/privacy',
  contentServerUrl: 'https://accounts.firefox.com',
};

async function renderTermsAndPrivacy(
  propsOverride?: Partial<TermsAndPrivacyProps>
) {
  const jsx = await TermsAndPrivacy({ ...baseProps, ...propsOverride });
  return render(jsx);
}

describe('TermsAndPrivacy', () => {
  it('renders the terms and privacy aside', async () => {
    await renderTermsAndPrivacy();
    expect(
      screen.getByRole('complementary', {
        name: 'Terms and Privacy Notices',
      })
    ).toBeInTheDocument();
  });

  it('renders default payment terms with Stripe and PayPal', async () => {
    await renderTermsAndPrivacy();
    expect(
      screen.getByRole('link', { name: /Stripe privacy policy/i })
    ).toHaveAttribute('href', 'https://stripe.com/privacy');
    expect(
      screen.getByRole('link', { name: /PayPal privacy policy/i })
    ).toHaveAttribute(
      'href',
      'https://www.paypal.com/webapps/mpp/ua/privacy-full'
    );
  });

  it('renders Stripe-only payment terms when payment type is card', async () => {
    await renderTermsAndPrivacy({
      paymentInfo: { type: 'card' },
      hasActiveSubscriptions: true,
    });
    expect(
      screen.getByRole('link', { name: /Stripe privacy policy/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /PayPal privacy policy/i })
    ).not.toBeInTheDocument();
  });

  it('renders PayPal-only payment terms when payment type is external_paypal', async () => {
    await renderTermsAndPrivacy({
      paymentInfo: { type: 'external_paypal' },
      hasActiveSubscriptions: true,
    });
    expect(
      screen.getByRole('link', { name: /PayPal privacy policy/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Stripe privacy policy/i })
    ).not.toBeInTheDocument();
  });

  it('renders product terms links', async () => {
    await renderTermsAndPrivacy();
    const productTermsLinks = screen
      .getAllByRole('link')
      .filter(
        (link) =>
          link.getAttribute('href') === 'https://example.com/tos' ||
          link.getAttribute('href') === 'https://example.com/privacy' ||
          link.getAttribute('href') === 'https://example.com/tos-download'
      );
    expect(productTermsLinks).toHaveLength(3);
  });

  it('does not render FXA links when showFXALinks is false', async () => {
    await renderTermsAndPrivacy({ showFXALinks: false });
    expect(
      screen.queryByRole('link', {
        name: /Terms of Service.*Opens in new window/i,
      })
    ).not.toHaveAttribute?.('href', 'https://accounts.firefox.com/legal/terms');
  });

  it('renders FXA links when showFXALinks is true', async () => {
    await renderTermsAndPrivacy({ showFXALinks: true });
    const fxaTermsLink = screen
      .getAllByRole('link')
      .find(
        (link) =>
          link.getAttribute('href') ===
          'https://accounts.firefox.com/legal/terms'
      );
    expect(fxaTermsLink).toBeInTheDocument();
  });

  it('opens all links in a new window', async () => {
    await renderTermsAndPrivacy();
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });
  });

  it('includes screen reader text for external links', async () => {
    await renderTermsAndPrivacy();
    const srOnlyTexts = screen.getAllByText('Opens in new window');
    expect(srOnlyTexts.length).toBeGreaterThan(0);
    srOnlyTexts.forEach((el) => {
      expect(el).toHaveClass('sr-only');
    });
  });
});
