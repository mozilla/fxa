/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../lib/metrics';
import Signup, { viewName } from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('Signup page', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    render(<Signup email={MOCK_ACCOUNT.primaryEmail.email} />);
    // testAllL10n(screen, bundle);
    screen.getByRole('heading', { name: 'Set your password' });
    screen.getByRole('link', { name: 'Change email' });
    screen.getByLabelText('Password');
    screen.getByLabelText('Repeat password');
    screen.getByLabelText('How old are you?');
    screen.getByRole('link', { name: /Why do we ask/ });
    screen.getByRole('button', { name: 'Create account' });
    const firefoxTermsLink: HTMLElement = screen.getByRole('link', {
      name: 'Terms of Service',
    });
    const firefoxPrivacyLink: HTMLElement = screen.getByRole('link', {
      name: 'Privacy Notice',
    });

    // By default, neither newsletters or CWTS are enabled
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(firefoxTermsLink).toHaveAttribute('href', '/legal/terms');
    expect(firefoxPrivacyLink).toHaveAttribute('href', '/legal/privacy');
  });

  it('allows users to show and hide password input', () => {
    render(<Signup email={MOCK_ACCOUNT.primaryEmail.email} />);

    const newPasswordInput = screen.getByLabelText('Password');

    expect(newPasswordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByTestId('new-password-visibility-toggle'));
    expect(newPasswordInput).toHaveAttribute('type', 'password');
  });

  it('allows the user to change their email when canGoBack is true', () => {
    render(
      <Signup email={MOCK_ACCOUNT.primaryEmail.email} canChangeEmail={false} />
    );
    expect(
      screen.queryByRole('link', { name: 'Change email' })
    ).not.toBeInTheDocument();
  });

  it('shows an info banner and Pocket-specific TOS when client is Pocket', () => {
    render(
      <Signup
        email={MOCK_ACCOUNT.primaryEmail.email}
        serviceName={MozServices.Pocket}
      />
    );

    const infoBannerLink = screen.getByRole('link', {
      name: /Find out here/,
    });
    expect(infoBannerLink).toBeInTheDocument();

    // info banner is dismissible
    // const infoBannerDismissButton = screen.getByRole('button', {
    //   name: 'Close',
    // });
    // fireEvent.click(infoBannerDismissButton);
    // expect(infoBannerLink).not.toBeInTheDocument();

    // Pocket links should always open in a new window (announced by screen readers)
    const pocketTermsLink = screen.getByRole('link', {
      name: 'Terms of Service Opens in new window',
    });
    const pocketPrivacyLink = screen.getByRole('link', {
      name: 'Privacy Notice Opens in new window',
    });

    expect(pocketTermsLink).toHaveAttribute(
      'href',
      'https://getpocket.com/tos/'
    );
    expect(pocketPrivacyLink).toHaveAttribute(
      'href',
      'https://getpocket.com/privacy/'
    );
  });

  it('shows options to choose what to sync when CWTS is enabled', () => {
    render(<Signup email={MOCK_ACCOUNT.primaryEmail.email} isCWTSEnabled />);

    screen.getByText('Choose what to sync:');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(8);
  });

  it('shows newsletter subscription options when newsletters are enabled', () => {
    render(
      <Signup email={MOCK_ACCOUNT.primaryEmail.email} areNewslettersEnabled />
    );

    screen.getByText(
      'Practical knowledge is coming to your inbox. Sign up for more:'
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('emits a metrics event on render', () => {
    render(<Signup email={MOCK_ACCOUNT.primaryEmail.email} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
