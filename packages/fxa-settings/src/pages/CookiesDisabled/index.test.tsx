/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import CookiesDisabled, { viewName } from '.';
import { screen, render, fireEvent } from '@testing-library/react';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { REACT_ENTRYPOINT } from '../../constants';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const originalWindow = window;
function setLocationSearch(search = '') {
  // @ts-ignore
  delete window.location;
  window.location = {
    ...originalWindow.location,
    search,
  };
}

function setCookieEnabled(cookieEnabled = true) {
  // @ts-ignore
  delete window.navigator;
  window.navigator = {
    ...originalWindow.navigator,
    cookieEnabled,
  };
}

describe('CookiesDisabled', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  const getTryAgainButton = () =>
    screen.getByRole('button', { name: 'Try again' });

  it('renders as expected', () => {
    render(<CookiesDisabled />);
    testAllL10n(screen, bundle);

    screen.getByRole('heading', {
      name: 'Local storage and cookies are required',
    });
    screen.getByText(
      'Please enable cookies and local storage in your browser',
      { exact: false }
    );
    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer'
    );

    getTryAgainButton();

    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('"Try again" button', () => {
    let historyGoSpy: jest.SpyInstance, historyBackSpy: jest.SpyInstance;
    const mockHistoryGo = jest.fn();
    const mockHistoryBack = jest.fn();

    beforeAll(() => {
      setLocationSearch();
      setCookieEnabled();
    });

    afterAll(() => {
      window.location = originalWindow.location;
      window.navigator = originalWindow.navigator;
    });

    beforeEach(() => {
      historyGoSpy = jest.spyOn(window.history, 'go');
      historyBackSpy = jest.spyOn(window.history, 'back');

      historyGoSpy.mockImplementation(mockHistoryGo);
      historyBackSpy.mockImplementation(mockHistoryBack);
    });

    afterEach(() => {
      jest.resetAllMocks();
      setLocationSearch();
      setCookieEnabled();
    });

    it('emits expected metrics events on success', () => {
      render(<CookiesDisabled />);
      fireEvent.click(getTryAgainButton());
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'submit',
        REACT_ENTRYPOINT
      );
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'success',
        REACT_ENTRYPOINT
      );
    });

    it('emits expected metrics events on error', () => {
      setLocationSearch('?disable_local_storage=1');
      render(<CookiesDisabled />);
      fireEvent.click(getTryAgainButton());
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'submit',
        REACT_ENTRYPOINT
      );
      expect(logViewEvent).toHaveBeenCalledWith(
        `flow.${viewName}`,
        'fail',
        REACT_ENTRYPOINT
      );
    });

    describe('goes back in history if localStorage and cookies are enabled', () => {
      it('when redirected from content-server', () => {
        setLocationSearch('?contentRedirect=true');

        render(<CookiesDisabled />);
        fireEvent.click(getTryAgainButton());
        expect(mockHistoryGo).toBeCalledWith(-2);
      });

      it('when hit directly', () => {
        render(<CookiesDisabled />);
        fireEvent.click(getTryAgainButton());
        expect(mockHistoryBack).toBeCalled();
      });
    });

    describe('shows an error', () => {
      it('if cookies are still disabled', async () => {
        setCookieEnabled(false);

        render(<CookiesDisabled />);
        testAllL10n(screen, bundle);
        fireEvent.click(getTryAgainButton());
        await screen.findByText('Local storage or cookies are still disabled');
      });

      it('if localStorage is still disabled', async () => {
        setLocationSearch('?disable_local_storage=1');

        render(<CookiesDisabled />);
        fireEvent.click(getTryAgainButton());
        await screen.findByText('Local storage or cookies are still disabled');
      });
    });
  });
});
