/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import TermsPrivacyAgreement, { LegalTerms } from '.';

const mockLegalTerms: LegalTerms = {
  label: 'Mozilla Subscription Services',
  termsOfServiceLink:
    'https://www.mozilla.org/about/legal/terms/subscription-services/',
  privacyNoticeLink: 'https://www.mozilla.org/privacy/subscription-services/',
  fontSize: 'default',
};

describe('TermsPrivacyAgreement', () => {
  describe('Default state (no customization)', () => {
    it('renders default Mozilla Accounts ToS/PP only', () => {
      renderWithLocalizationProvider(<TermsPrivacyAgreement />);

      const linkElements: HTMLElement[] = screen.getAllByRole('link');

      // Check to search for text that includes links
      const container = screen.getByTestId('terms-privacy-agreement-default');
      expect(
        container.textContent?.includes(
          'By proceeding, you agree to the Terms of Service and Privacy Notice.'
        )
      ).toBeTruthy();
      expect(linkElements).toHaveLength(2);
      expect(linkElements[0]).toHaveAttribute('href', '/legal/terms');
      expect(linkElements[1]).toHaveAttribute('href', '/legal/privacy');

      // Should not show subscription services text
      expect(
        screen.queryByText('Mozilla Subscription Services')
      ).not.toBeInTheDocument();
    });

    it('applies default font size (text-xs)', () => {
      const { container } = renderWithLocalizationProvider(
        <TermsPrivacyAgreement />
      );

      const wrapper = container.querySelector('.text-grey-500');
      expect(wrapper).toHaveClass('text-xs');
    });
  });

  describe('With custom legal terms', () => {
    it('renders custom ToS/PP along with Mozilla Accounts ToS/PP', () => {
      renderWithLocalizationProvider(
        <TermsPrivacyAgreement legalTerms={mockLegalTerms} />
      );

      const linkElements: HTMLElement[] = screen.getAllByRole('link');

      expect(
        screen.getByText('By proceeding, you agree to the following:')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Mozilla Subscription Services', { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Mozilla Accounts', { exact: false })
      ).toBeInTheDocument();

      // Should have 4 links total (2 for subscription services, 2 for Mozilla Accounts)
      expect(linkElements).toHaveLength(4);
      expect(linkElements[0]).toHaveAttribute(
        'href',
        'https://www.mozilla.org/about/legal/terms/subscription-services/'
      );
      expect(linkElements[1]).toHaveAttribute(
        'href',
        'https://www.mozilla.org/privacy/subscription-services/'
      );
      expect(linkElements[2]).toHaveAttribute('href', '/legal/terms');
      expect(linkElements[3]).toHaveAttribute('href', '/legal/privacy');
    });

    it('renders custom label correctly', () => {
      const customTerms: LegalTerms = {
        label: 'Custom Service Name',
        termsOfServiceLink: 'https://example.com/terms',
        privacyNoticeLink: 'https://example.com/privacy',
        fontSize: 'default',
      };

      renderWithLocalizationProvider(
        <TermsPrivacyAgreement legalTerms={customTerms} />
      );

      expect(
        screen.getByText('Custom Service Name', { exact: false })
      ).toBeInTheDocument();

      const linkElements: HTMLElement[] = screen.getAllByRole('link');
      expect(linkElements[0]).toHaveAttribute(
        'href',
        'https://example.com/terms'
      );
      expect(linkElements[1]).toHaveAttribute(
        'href',
        'https://example.com/privacy'
      );
    });

    it('renders as list when custom terms are provided', () => {
      const { container } = renderWithLocalizationProvider(
        <TermsPrivacyAgreement legalTerms={mockLegalTerms} />
      );

      const list = container.querySelector('ul');
      const listItems = container.querySelectorAll('li');

      expect(list).toBeInTheDocument();
      expect(listItems).toHaveLength(2); // Subscription services + Mozilla Accounts
    });
  });

  describe('Font size variants', () => {
    it('applies default font size (text-xs)', () => {
      const { container } = renderWithLocalizationProvider(
        <TermsPrivacyAgreement
          legalTerms={{ ...mockLegalTerms, fontSize: 'default' }}
        />
      );

      const wrapper = container.querySelector('.text-grey-500');
      expect(wrapper).toHaveClass('text-xs');
      expect(wrapper).not.toHaveClass('text-sm');
      expect(wrapper).not.toHaveClass('text-base');
    });

    it('applies medium font size (text-sm)', () => {
      const { container } = renderWithLocalizationProvider(
        <TermsPrivacyAgreement
          legalTerms={{ ...mockLegalTerms, fontSize: 'medium' }}
        />
      );

      const wrapper = container.querySelector('.text-grey-500');
      expect(wrapper).toHaveClass('text-sm');
      expect(wrapper).not.toHaveClass('text-xs');
      expect(wrapper).not.toHaveClass('text-base');
    });

    it('applies large font size (text-base)', () => {
      const { container } = renderWithLocalizationProvider(
        <TermsPrivacyAgreement
          legalTerms={{ ...mockLegalTerms, fontSize: 'large' }}
        />
      );

      const wrapper = container.querySelector('.text-grey-500');
      expect(wrapper).toHaveClass('text-base');
      expect(wrapper).not.toHaveClass('text-xs');
      expect(wrapper).not.toHaveClass('text-sm');
    });
  });

  describe('Edge cases', () => {
    it('handles null legalTerms as default state', () => {
      renderWithLocalizationProvider(
        <TermsPrivacyAgreement legalTerms={null} />
      );

      const linkElements: HTMLElement[] = screen.getAllByRole('link');

      // Should render default Mozilla Accounts ToS/PP only
      expect(linkElements).toHaveLength(2);
      expect(linkElements[0]).toHaveAttribute('href', '/legal/terms');
      expect(linkElements[1]).toHaveAttribute('href', '/legal/privacy');
    });
  });

  describe('Accessibility', () => {
    it('renders all links with proper attributes', () => {
      renderWithLocalizationProvider(
        <TermsPrivacyAgreement legalTerms={mockLegalTerms} />
      );

      const linkElements: HTMLElement[] = screen.getAllByRole('link');

      linkElements.forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });

    it('maintains semantic HTML structure', () => {
      const { container } = renderWithLocalizationProvider(
        <TermsPrivacyAgreement legalTerms={mockLegalTerms} />
      );

      // Should have proper list structure
      const list = container.querySelector('ul');
      const listItems = container.querySelectorAll('li');

      expect(list).toBeInTheDocument();
      expect(listItems.length).toBeGreaterThan(0);
    });
  });
});
