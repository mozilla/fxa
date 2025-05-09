/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import PasswordStrengthInline from '.';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';

describe('PasswordStrengthInline component', () => {
  // TODO: enable l10n tests when FXA-6461 is resolved (handle embedded tags)
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders password requirements as expected', () => {
    renderWithLocalizationProvider(
      <PasswordStrengthInline
        isPasswordEmpty={true}
        isConfirmedPasswordEmpty={true}
        isTooShort={true}
        isSameAsEmail={false}
        isCommon={false}
        isUnconfirmed={false}
      />
    );
    // testAllL10n(screen, bundle);

    screen.getByText('At least 8 characters');
    screen.getByText('Not your email address');
    screen.getByText('Not a commonly used password');
    screen.getByText('Confirmation matches the new password');
  });

  it('displays checkmark icon when password requirements are respected', () => {
    renderWithLocalizationProvider(
      <PasswordStrengthInline
        isPasswordEmpty={false}
        isConfirmedPasswordEmpty={false}
        isTooShort={false}
        isSameAsEmail={false}
        isCommon={false}
        isUnconfirmed={false}
      />
    );

    const checkmarks = screen.queryAllByText('icon-check.svg');
    expect(checkmarks).toHaveLength(4);

    const warnings = screen.queryAllByText('icon-x.svg');
    expect(warnings).toHaveLength(0);
  });

  it('displays x icon when password is too short', () => {
    renderWithLocalizationProvider(
      <PasswordStrengthInline
        isPasswordEmpty={false}
        isConfirmedPasswordEmpty={false}
        isTooShort={true}
        isSameAsEmail={false}
        isCommon={false}
        isUnconfirmed={false}
      />
    );

    const container = screen.getByTestId('password-min-char-req');
    expect(container.getElementsByTagName('svg').item(0)).toHaveTextContent(
      'icon-x.svg'
    );
  });

  it('displays x icon when password is the same as email', () => {
    renderWithLocalizationProvider(
      <PasswordStrengthInline
        isPasswordEmpty={false}
        isConfirmedPasswordEmpty={false}
        isTooShort={false}
        isSameAsEmail={true}
        isCommon={false}
        isUnconfirmed={false}
      />
    );

    const container = screen.getByTestId('password-not-email-req');
    expect(container.getElementsByTagName('svg').item(0)).toHaveTextContent(
      'icon-x.svg'
    );
  });

  it('displays x icon when password is common', () => {
    renderWithLocalizationProvider(
      <PasswordStrengthInline
        isPasswordEmpty={false}
        isConfirmedPasswordEmpty={false}
        isTooShort={false}
        isSameAsEmail={false}
        isCommon={true}
        isUnconfirmed={false}
      />
    );

    const container = screen.getByTestId('password-not-common-req');
    expect(container.getElementsByTagName('svg').item(0)).toHaveTextContent(
      'icon-x.svg'
    );
  });

  it('displays dot icon when confirmed password is empty', () => {
    renderWithLocalizationProvider(
      <PasswordStrengthInline
        isPasswordEmpty={false}
        isConfirmedPasswordEmpty={false}
        isTooShort={false}
        isSameAsEmail={false}
        isCommon={false}
        isUnconfirmed={true}
      />
    );

    const container = screen.getByTestId('passwords-match');
    expect(container.getElementsByTagName('svg').item(0)).toHaveTextContent(
      'icon-x.svg'
    );
  });

  it('displays x icon when password do not match', () => {
    renderWithLocalizationProvider(
      <PasswordStrengthInline
        isPasswordEmpty={false}
        isConfirmedPasswordEmpty={false}
        isTooShort={false}
        isSameAsEmail={false}
        isCommon={false}
        isUnconfirmed={true}
      />
    );

    const container = screen.getByTestId('passwords-match');
    expect(container.getElementsByTagName('svg').item(0)).toHaveTextContent(
      'icon-x.svg'
    );
  });

});
