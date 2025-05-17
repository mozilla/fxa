/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { Subject } from './mocks';
import userEvent from '@testing-library/user-event';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

describe('FormVerifyCode component', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    // testAllL10n(screen, bundle);
    screen.getByRole('textbox', { name: 'Enter your 4-digit code' });

    screen.getByRole('button', { name: 'Check that code' });
  });

  it('submits when a valid code is pasted', async () => {
    const user = userEvent.setup();
    const verifyCode = jest.fn();
    renderWithLocalizationProvider(<Subject verifyCode={verifyCode} />);
    const input = screen.getByRole('textbox', {
      name: 'Enter your 4-digit code',
    });
    input.focus();
    await user.keyboard('1'); // should submit regardless of existing value
    await user.paste('1234');
    expect(verifyCode).toHaveBeenCalledWith('1234');
  });

  it('handles pasted content normally when an invalid code is pasted', async () => {
    const user = userEvent.setup();
    const verifyCode = jest.fn();
    renderWithLocalizationProvider(<Subject verifyCode={verifyCode} />);
    const input = screen.getByRole('textbox', {
      name: 'Enter your 4-digit code',
    });
    input.focus();
    await user.keyboard('1');
    await user.paste('123');
    // should not submit even though the value after pasting is valid
    // because we only care about pasted content here.
    expect(input).toHaveValue('1123');
    expect(verifyCode).not.toHaveBeenCalled();
  });

  it('does not submit on paste when submitFormOnPaste is false', async () => {
    const user = userEvent.setup();
    const verifyCode = jest.fn();
    renderWithLocalizationProvider(
      <Subject verifyCode={verifyCode} submitFormOnPaste={false} />
    );
    const input = screen.getByRole('textbox', {
      name: 'Enter your 4-digit code',
    });
    input.focus();
    await user.paste('1234');
    expect(verifyCode).not.toHaveBeenCalled();
  });

  // TODO Add tests for (engage, success, etc.) metrics events once submit button enabled
});
