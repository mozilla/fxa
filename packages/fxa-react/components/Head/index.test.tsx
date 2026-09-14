/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act } from '@testing-library/react';
import Head from '.';
import { renderWithLocalizationProvider } from '../../lib/test-utils/localizationProvider';

const iconLinks = () => document.head.querySelectorAll('link[rel="icon"]');

// Helmet defers its head update to the next animation frame.
const helmetFlush = () =>
  act(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  );

describe('Head', () => {
  it('renders an icon link when a favicon is given', async () => {
    renderWithLocalizationProvider(<Head favicon="https://cdn/some.ico" />);
    await helmetFlush();

    const links = iconLinks();
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://cdn/some.ico');
  });

  it('renders no icon link when the favicon is undefined', async () => {
    renderWithLocalizationProvider(<Head />);
    await helmetFlush();

    expect(iconLinks()).toHaveLength(0);
  });
});
