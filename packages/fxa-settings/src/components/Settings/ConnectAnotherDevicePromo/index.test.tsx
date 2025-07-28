/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import ConnectAnotherDevicePromo from '.';
import { renderWithRouter } from '../../../models/mocks';
import { getStoreImageByLanguages, StoreType } from './storeImageLoader';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

describe('Connect another device Promo', () => {
  it('renders "fresh load" <ConnectAnotherDevicePromo/> with correct content', async () => {
    renderWithRouter(<ConnectAnotherDevicePromo />);

    await screen.findByText('Get Firefox on mobile or tablet');
    await screen.findByText('Find Firefox in the Google Play and App Store.');
    expect(screen.getByTestId('play-store-link')).toHaveAttribute(
      'href',
      'https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.mozilla.firefox'
    );
    expect(screen.getByTestId('app-store-link')).toHaveAttribute(
      'href',
      'https://app.adjust.com/2uo1qc?redirect=https%3A%2F%2Fitunes.apple.com%2Fus%2Fapp%2Ffirefox-private-safe-browser%2Fid989804926'
    );
  });
});

describe('getStoreImageByLanguages', () => {
  it('should return default image, if no locale is provided', async () => {
    renderWithLocalizationProvider(getStoreImageByLanguages(StoreType.apple));
    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('en.svg'));
  });

  it('should return default image, if invalid locale is provided', async () => {
    const languages = ['invalidLanguage'];
    renderWithLocalizationProvider(
      getStoreImageByLanguages(StoreType.apple, languages)
    );
    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('en.svg'));
  });

  it('should return image for valid language', async () => {
    const languages = ['en', 'de'];
    renderWithLocalizationProvider(
      getStoreImageByLanguages(StoreType.apple, languages)
    );
    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('en.svg'));
  });

  it('should return valid image if multiple languages are provided and 1st language is not valid', async () => {
    const languages = ['invalidLanguage', 'en'];
    renderWithLocalizationProvider(
      getStoreImageByLanguages(StoreType.apple, languages)
    );
    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('en.svg'));
  });

  it('should return image with region code', async () => {
    const languages = ['pt-BR', 'pt'];
    renderWithLocalizationProvider(
      getStoreImageByLanguages(StoreType.apple, languages)
    );
    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('pt-BR.svg'));
  });

  it('should return language image if region is not available', async () => {
    const languages = ['pt-ZA', 'pt'];
    renderWithLocalizationProvider(
      getStoreImageByLanguages(StoreType.apple, languages)
    );
    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('pt.svg'));
  });
});
