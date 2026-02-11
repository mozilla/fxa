/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import React from 'react';
import { screen } from '@testing-library/react';

import { LoadingSpinner, SpinnerType } from './index';
import { renderWithLocalizationProvider } from '../../lib/test-utils/localizationProvider';

it('renders defaults as expected', () => {
  renderWithLocalizationProvider(<LoadingSpinner />);
  const result = screen.queryByTestId('loading-spinner');
  const spinnerType = screen.queryByTestId('loading-spinner-blue');
  expect(result).toBeInTheDocument();
  expect(spinnerType).toBeInTheDocument();
});

it('renders with custom spinner classNames', () => {
  renderWithLocalizationProvider(<LoadingSpinner imageClassName="testclass" />);
  const result = screen.queryByTestId('loading-spinner');
  const spinnerImage = screen.queryByTestId('loading-spinner-blue');
  expect(result).toBeInTheDocument();
  expect(spinnerImage).toHaveClass('testclass');
});

it('renders blue spinner as expected', () => {
  renderWithLocalizationProvider(
    <LoadingSpinner spinnerType={SpinnerType.Blue} />
  );
  const result = screen.queryByTestId('loading-spinner');
  const spinnerType = screen.queryByTestId('loading-spinner-blue');
  expect(result).toBeInTheDocument();
  expect(spinnerType).toBeInTheDocument();
});

it('renders white spinner as expected', () => {
  renderWithLocalizationProvider(
    <LoadingSpinner spinnerType={SpinnerType.White} />
  );
  const result = screen.queryByTestId('loading-spinner');
  const spinnerType = screen.queryByTestId('loading-spinner-white');
  expect(result).toBeInTheDocument();
  expect(spinnerType).toBeInTheDocument();
});
