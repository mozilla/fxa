/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { MOCK_ACCOUNT, renderWithRouter } from '../../models/mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import ConnectAnotherDevice, { Devices, viewName } from '.';
import { ENTRYPOINTS, REACT_ENTRYPOINT } from '../../constants';
import { usePageViewEvent } from '../../lib/metrics';
import {
  MOCK_BASIC_PROPS,
  MOCK_DEFAULTS,
  MOCK_DEVICE_BASIC_PROPS,
} from './mocks';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('ConnectAnotherDevice', () => {
  // let bundle: FluentBundle;
  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn();
    //   bundle = await getFtlBundle('settings');
  });
  it('renders default content as expected', () => {
    renderWithRouter(
      <ConnectAnotherDevice isSignIn isSignUp={false} {...MOCK_BASIC_PROPS} />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('You’re signed into Firefox');

    expect(
      screen.getByRole('img', {
        name: 'A computer and a mobile phone and a tablet with a pulsing heart on each',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Want to get your tabs, bookmarks, and passwords on another device?'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Connect another device' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Not now' })).toBeInTheDocument();
  });

  it('hides the success message when desired', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn
        isSignUp={false}
        showSuccessMessage={false}
        isSignedIn
        canSignIn={false}
        {...MOCK_DEFAULTS}
      />
    );
    // testAllL10n(screen, bundle);
    expect(
      screen.queryByText('You’re signed into Firefox')
    ).not.toBeInTheDocument();
  });

  it('shows the signup success message when desired', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn={false}
        isSignUp
        showSuccessMessage
        isSignedIn={false}
        canSignIn
        {...MOCK_DEFAULTS}
      />
    );

    // testAllL10n(screen, bundle);

    screen.getByText('Email confirmed');
  });

  it('shows the signin success message when desired', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn
        isSignUp={false}
        showSuccessMessage
        isSignedIn={false}
        canSignIn
        {...MOCK_DEFAULTS}
      />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('Sign-in confirmed');
  });

  it('prompts a signed out user to sign in', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        isSignIn
        isSignUp={false}
        showSuccessMessage={false}
        email={MOCK_ACCOUNT.primaryEmail.email}
        entrypoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
        device={Devices.FIREFOX_DESKTOP}
        isSignedIn={false}
        canSignIn
      />
    );
    // testAllL10n(screen, bundle);
    expect(
      screen.getByText('Sign in to this Firefox to complete set-up')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders device-specific messaging for Android', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        device={Devices.OTHER_ANDROID}
        {...MOCK_DEVICE_BASIC_PROPS}
      />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('Sign in to Firefox for Android to complete set-up');
  });

  it('renders device-specific messaging for iOS', () => {
    renderWithRouter(
      <ConnectAnotherDevice
        device={Devices.OTHER_IOS}
        {...MOCK_DEVICE_BASIC_PROPS}
      />
    );
    // testAllL10n(screen, bundle);
    screen.getByText('Sign in to Firefox for iOS to complete set-up');
  });

  it('emits the expected metrics on render', () => {
    renderWithRouter(<ConnectAnotherDevice {...MOCK_DEVICE_BASIC_PROPS} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
