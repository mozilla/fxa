/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { HeartsVerifiedImage } from '../images';

it('applies localization by default', () => {
  renderWithLocalizationProvider(<HeartsVerifiedImage />);
  expect(
    screen.getByLabelText(
      'A computer and a mobile phone and a tablet with a pulsing heart on each'
    )
  ).toBeInTheDocument();
});

it('applies basic styles by default', () => {
  renderWithLocalizationProvider(<HeartsVerifiedImage />);
  expect(screen.getByRole('img')).toHaveClass('w-3/5');
});

it('applies a11y by default', () => {
  renderWithLocalizationProvider(<HeartsVerifiedImage />);
  expect(
    screen.getByLabelText(
      'A computer and a mobile phone and a tablet with a pulsing heart on each'
    )
  ).toBeInTheDocument();
});

it('can be hidden from screen readers when desired', () => {
  renderWithLocalizationProvider(<HeartsVerifiedImage ariaHidden />);
  const image = screen.getByTestId('aria-hidden-image');
  expect(image).toBeInTheDocument();
  expect(image).toHaveAttribute('aria-hidden');
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

it('applies custom classNames when desired', () => {
  const MOCK_CLASS = 'w-full';
  renderWithLocalizationProvider(
    <HeartsVerifiedImage className={MOCK_CLASS} />
  );
  expect(screen.getByRole('img')).toHaveClass(MOCK_CLASS);
});

describe('images without l10n', () => {
  it('applies basic styles by default', () => {
    renderWithLocalizationProvider(<HeartsVerifiedImage />);
    expect(screen.getByRole('img')).toHaveClass('w-3/5');
  });
  it('applies custom classNames when desired', () => {
    const MOCK_CLASS = 'w-full';
    renderWithLocalizationProvider(
      <HeartsVerifiedImage className={MOCK_CLASS} />
    );
    expect(screen.getByRole('img')).toHaveClass(MOCK_CLASS);
  });
});
