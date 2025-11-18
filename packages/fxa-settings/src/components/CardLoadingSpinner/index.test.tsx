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
  ...jest.requireActual('fxa-react/components/LoadingSpinner'),
  default: ({ spinnerType, imageClassName }: any) => (
    <div
      data-testid="loading-spinner"
      data-spinner-type={spinnerType}
      data-image-class={imageClassName}
    >
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

  it('applies custom className', () => {
    renderWithLocalizationProvider(
      <CardLoadingSpinner className="custom-class" />
    );

    const container = screen.getByTestId('loading-spinner').closest('.card');
    expect(container).toHaveClass('custom-class');
  });

  it('renders with white spinner type', () => {
    renderWithLocalizationProvider(
      <CardLoadingSpinner spinnerType={SpinnerType.White} />
    );

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute(
      'data-spinner-type',
      SpinnerType.White.toString()
    );
  });

  it('renders with custom spinner size', () => {
    renderWithLocalizationProvider(
      <CardLoadingSpinner spinnerSize="w-16 h-16" />
    );

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute(
      'data-image-class',
      'w-16 h-16 animate-spin'
    );
  });

  it('has correct default structure', () => {
    renderWithLocalizationProvider(<CardLoadingSpinner />);

    // Check that the card has the expected classes
    const card = screen.getByTestId('loading-spinner').closest('.card');
    expect(card).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
