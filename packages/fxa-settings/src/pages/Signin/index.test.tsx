/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Signin from '.';
import { usePageViewEvent } from '../../lib/metrics';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { MOCK_EMAIL, MOCK_SERVICE, MOCK_OTHER_ICON } from './mocks';
import { MozServices } from '../../lib/types';
jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

// TODO: Once https://mozilla-hub.atlassian.net/browse/FXA-6461 is resolved, we can
// add the l10n tests back in. Right now, they can't handle embedded tags.

describe('Signin', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  it('renders Signin page as expected with password required', () => {
    render(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={true}
        serviceName={MOCK_SERVICE}
      />
    );
    // testAllL10n(screen, bundle);

    const signinHeader = screen.getByRole('heading', {
      name: 'Enter your password for your Firefox account',
    });
    const passwordInputForm = screen.getByLabelText('Password');

    expect(signinHeader).toBeInTheDocument();
    expect(passwordInputForm).toBeInTheDocument();
  });

  it('renders Signin page as expected with password not required', () => {
    render(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={false}
        serviceName={MOCK_SERVICE}
      />
    );
    // testAllL10n(screen, bundle);

    const signinHeader = screen.getByRole('heading', {
      name: 'Sign in',
    });
    const passwordInputForm = screen.queryByLabelText('Password');

    expect(signinHeader).toBeInTheDocument();
    expect(passwordInputForm).not.toBeInTheDocument();
  });

  it('renders Signin page as expected with service logo', () => {
    render(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={false}
        serviceName={MOCK_SERVICE}
        ServiceLogo={MOCK_OTHER_ICON}
      />
    );
    // testAllL10n(screen, bundle);

    const signinHeader = screen.getByRole('heading', {
      name: 'Sign in',
    });
    const passwordInputForm = screen.queryByLabelText('Password');
    const exampleLogo = screen.getByLabelText(MOCK_SERVICE);

    expect(signinHeader).toBeInTheDocument();
    expect(exampleLogo).toBeInTheDocument();
    expect(passwordInputForm).not.toBeInTheDocument();
  });

  it('renders Signin page with Pocket client as expected', () => {
    render(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={false}
        serviceName={MozServices.Pocket}
      />
    );
    // testAllL10n(screen, bundle);

    const signinHeader = screen.getByRole('heading', {
      name: 'Sign in',
    });
    const passwordInputForm = screen.queryByLabelText('Password');
    const pocketLogo = screen.getByLabelText('Pocket');

    expect(signinHeader).toBeInTheDocument();
    expect(pocketLogo).toBeInTheDocument();
    expect(passwordInputForm).not.toBeInTheDocument();
  });

  it('emits the expected metrics on render', () => {
    render(
      <Signin
        email={MOCK_EMAIL}
        isPasswordNeeded={false}
        serviceName={MOCK_SERVICE}
      />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith('signin', {
      entrypoint_variation: 'react',
    });
  });
});
