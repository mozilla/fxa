/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import ConnectAnotherDevicePromo from '.';
import { renderWithRouter } from '../../../models/mocks';
import { getStoreImageByLanguages, StoreType } from './storeImageLoader';

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
  it('should return default image, if no locale is provided', () => {
    const expected = 'SvgEn';
    const {
      render: { name: actual },
    }: any = getStoreImageByLanguages(StoreType.apple);

    expect(actual).toEqual(expected);
  });

  it('should return default image, if invalid locale is provided', () => {
    const languages = ['invalidLanguage'];
    const expected = 'SvgEn';
    const {
      render: { name: actual },
    }: any = getStoreImageByLanguages(StoreType.apple, languages);

    expect(actual).toEqual(expected);
  });

  it('should return image for valid language', () => {
    const languages = ['en', 'de'];
    const expected = 'SvgEn';
    const {
      render: { name: actual },
    }: any = getStoreImageByLanguages(StoreType.apple, languages);

    expect(actual).toEqual(expected);
  });

  it('should return valid image if multiple languages are provided and 1st language is not valid', () => {
    const languages = ['invalidLanguage', 'en'];
    const expected = 'SvgEn';
    const {
      render: { name: actual },
    }: any = getStoreImageByLanguages(StoreType.apple, languages);

    expect(actual).toEqual(expected);
  });

  it('should return image with region code', () => {
    const languages = ['pt-BR', 'pt'];
    const expected = 'SvgPtBr';
    const {
      render: { name: actual },
    }: any = getStoreImageByLanguages(StoreType.apple, languages);

    expect(actual).toEqual(expected);
  });

  it('should return language image if region is not available', () => {
    const languages = ['pt-ZA', 'pt'];
    const expected = 'SvgPt';
    const {
      render: { name: actual },
    }: any = getStoreImageByLanguages(StoreType.apple, languages);

    expect(actual).toEqual(expected);
  });
});
