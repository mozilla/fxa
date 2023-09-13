/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import BrandMessaging, { bannerClosedLocalStorageKey } from '.';

describe('BrandMessaging', () => {
  const preLaunchMessageTestId = 'brand-prelaunch';
  const postlaunchMessageTestId = 'brand-postlaunch';
  const closeBrandMessagingTestId = 'close-brand-messaging';

  beforeEach(() => {
    window.localStorage.removeItem(bannerClosedLocalStorageKey);
  });

  it('renders nothing with mode of none', () => {
    renderWithLocalizationProvider(
      <BrandMessaging mode="none" viewName="test" />
    );
    expect(screen.queryByTestId(preLaunchMessageTestId)).toBeNull();
    expect(screen.queryByTestId(postlaunchMessageTestId)).toBeNull();
    expect(screen.queryByTestId(closeBrandMessagingTestId)).toBeNull();
  });

  it('renders prelaunch messaging', () => {
    renderWithLocalizationProvider(
      <BrandMessaging mode="prelaunch" viewName="test" />
    );
    expect(screen.getByTestId(preLaunchMessageTestId)).toBeInTheDocument();
    expect(screen.queryByTestId(postlaunchMessageTestId)).toBeNull();
    expect(screen.getByTestId(closeBrandMessagingTestId)).toBeInTheDocument();
  });

  it('renders postlaunch messaging', () => {
    renderWithLocalizationProvider(
      <BrandMessaging mode="postlaunch" viewName="test" />
    );
    expect(screen.queryByTestId(preLaunchMessageTestId)).toBeNull();
    expect(screen.getByTestId(postlaunchMessageTestId)).toBeInTheDocument();
    expect(screen.getByTestId(closeBrandMessagingTestId)).toBeInTheDocument();
  });

  it('closes', async () => {
    renderWithLocalizationProvider(
      <BrandMessaging mode="postlaunch" viewName="test" />
    );
    const closeElement = screen.getByTestId(closeBrandMessagingTestId);
    await act(() => closeElement.click());

    expect(screen.queryByTestId(preLaunchMessageTestId)).toBeNull();
    expect(screen.queryByTestId(postlaunchMessageTestId)).toBeNull();
    expect(screen.queryByTestId(closeBrandMessagingTestId)).toBeNull();
  });
});
