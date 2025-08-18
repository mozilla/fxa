/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import Footer from '.';
import { renderWithLocalizationProvider } from '../../lib/test-utils/localizationProvider';

describe('Footer', () => {
  it('renders as expected without LocaleToggle', () => {
    renderWithLocalizationProvider(<Footer showLocaleToggle={false} />);

    const linkMozilla = screen.getByTestId('link-mozilla');

    expect(linkMozilla).toHaveAttribute(
      'href',
      'https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral'
    );
    expect(linkMozilla.firstElementChild).toHaveAttribute(
      'alt',
      'Mozilla logo'
    );
    expect(screen.getByTestId('link-privacy')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/privacy/websites/'
    );
    expect(screen.getByTestId('link-terms')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/about/legal/terms/services/'
    );

    // Check that LocaleToggle placeholder is NOT rendered when showLocaleToggle is false
    expect(screen.queryByTestId('locale-toggle-placeholder')).not.toBeInTheDocument();
  });

  it('renders LocaleToggle when showLocaleToggle is true and localeToggleComponent is provided', () => {
    const MockLocaleToggle = ({ placement }: { placement?: 'footer' | 'header' }) => (
      <div data-testid="locale-toggle" data-placement={placement}>
        Mock LocaleToggle
      </div>
    );

    renderWithLocalizationProvider(
      <Footer showLocaleToggle={true} localeToggleComponent={MockLocaleToggle} />
    );

    // Check that LocaleToggle is rendered in the footer
    const localeToggle = screen.getByTestId('locale-toggle');
    expect(localeToggle).toBeInTheDocument();
    expect(localeToggle).toHaveAttribute('data-placement', 'footer');
  });

  it('does not render LocaleToggle when showLocaleToggle is true but no localeToggleComponent is provided', () => {
    renderWithLocalizationProvider(<Footer showLocaleToggle={true} />);

    // Check that nothing is rendered when no component is provided
    expect(screen.queryByTestId('locale-toggle')).not.toBeInTheDocument();
  });

  it('renders without LocaleToggle by default', () => {
    renderWithLocalizationProvider(<Footer />);

    // Check that LocaleToggle placeholder is NOT rendered by default
    expect(screen.queryByTestId('locale-toggle-placeholder')).not.toBeInTheDocument();
  });
});
