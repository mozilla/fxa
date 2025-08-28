/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { SpinnerType } from 'fxa-react/components/LoadingSpinner';
import { CardLoadingSpinner } from './';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

// Mock the LoadingSpinner component
jest.mock('fxa-react/components/LoadingSpinner', () => ({
  __esModule: true,
  default: ({ spinnerType, imageClassName }: any) => (
    <div data-testid="loading-spinner" data-spinner-type={spinnerType} data-image-class={imageClassName}>
      LoadingSpinner
    </div>
  ),
}));

describe('CardLoadingSpinner', () => {
  it('renders with default props', () => {
    renderWithLocalizationProvider(<CardLoadingSpinner />);

    const card = screen.getByTestId('loading-spinner').closest('.card');
    expect(card).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies custom width class', () => {
    renderWithLocalizationProvider(<CardLoadingSpinner widthClass="w-96" />);

    const card = screen.getByTestId('loading-spinner').closest('.card');
    expect(card).toHaveClass('w-96');
  });

  it('applies custom className', () => {
    renderWithLocalizationProvider(<CardLoadingSpinner className="custom-class" />);

    const container = screen.getByTestId('loading-spinner').closest('.relative');
    expect(container).toHaveClass('custom-class');
  });

  it('renders with white spinner type', () => {
    renderWithLocalizationProvider(<CardLoadingSpinner spinnerType={SpinnerType.White} />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('data-spinner-type', 'white');
  });

  it('renders with custom spinner size', () => {
    renderWithLocalizationProvider(<CardLoadingSpinner spinnerSize="w-16 h-16" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('data-image-class', 'w-16 h-16 animate-spin');
  });

  it('has correct default structure', () => {
    renderWithLocalizationProvider(<CardLoadingSpinner />);

    // Check that the card has the expected classes
    const card = screen.getByTestId('loading-spinner').closest('.card');
    expect(card).toHaveClass('card');

    // Check that the section has the expected classes
    const section = card?.closest('section');
    expect(section).toHaveClass('mobileLandscape:flex', 'mobileLandscape:items-center', 'mobileLandscape:flex-1');
  });
});
