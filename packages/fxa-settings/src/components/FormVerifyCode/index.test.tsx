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

  describe('Submit button state management', () => {
    it('should disable submit button initially', () => {
      renderWithLocalizationProvider(<Subject />);
      const submitButton = screen.getByRole('button', { name: 'Check that code' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when valid code is entered', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject />);
      const input = screen.getByRole('textbox', { name: 'Enter your 4-digit code' });
      const submitButton = screen.getByRole('button', { name: 'Check that code' });

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Type valid 4-digit code
      await user.type(input, '1234');

      // Button should be enabled
      expect(submitButton).toBeEnabled();
    });

    it('should disable submit button when invalid code is entered', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject />);
      const input = screen.getByRole('textbox', { name: 'Enter your 4-digit code' });
      const submitButton = screen.getByRole('button', { name: 'Check that code' });

      // Type invalid code (less than 4 digits)
      await user.type(input, '123');

      // Button should remain disabled
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when code becomes invalid', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject />);
      const input = screen.getByRole('textbox', { name: 'Enter your 4-digit code' });
      const submitButton = screen.getByRole('button', { name: 'Check that code' });

      // Type valid code first
      await user.type(input, '1234');
      expect(submitButton).toBeEnabled();

      // Clear input to make it invalid
      await user.clear(input);
      expect(submitButton).toBeDisabled();
    });

    it('should handle different pattern validations correctly', async () => {
      const user = userEvent.setup();
      const customFormAttributes = {
        inputFtlId: 'demo-input-label-id',
        inputLabelText: 'Enter your 6-digit code',
        pattern: '[0-9]{6}',
        maxLength: 6,
        submitButtonFtlId: 'demo-submit-button-id',
        submitButtonText: 'Check that code',
      };

      renderWithLocalizationProvider(
        <Subject
          formAttributes={customFormAttributes}
          verifyCode={jest.fn().mockImplementation((code: string) => Promise.resolve())}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Enter your 6-digit code' });
      const submitButton = screen.getByRole('button', { name: 'Check that code' });

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Type 5 digits (invalid for 6-digit pattern)
      await user.type(input, '12345');
      expect(submitButton).toBeDisabled();

      // Type 6 digits (valid for 6-digit pattern)
      await user.type(input, '6');
      expect(submitButton).toBeEnabled();
    });
  });

  describe('Input validation', () => {
    it('should validate code pattern in real-time', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject />);

      const input = screen.getByRole('textbox', { name: 'Enter your 4-digit code' });
      const submitButton = screen.getByRole('button', { name: 'Check that code' });

      // Type character by character
      await user.type(input, '1');
      expect(submitButton).toBeDisabled();

      await user.type(input, '2');
      expect(submitButton).toBeDisabled();

      await user.type(input, '3');
      expect(submitButton).toBeDisabled();

      await user.type(input, '4');
      expect(submitButton).toBeEnabled();
    });

    it('should handle backspace and editing correctly', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject />);

      const input = screen.getByRole('textbox', { name: 'Enter your 4-digit code' });
      const submitButton = screen.getByRole('button', { name: 'Check that code' });

      // Type valid code
      await user.type(input, '1234');
      expect(submitButton).toBeEnabled();

      // Backspace to make it invalid
      await user.keyboard('{Backspace}');
      expect(submitButton).toBeDisabled();

      // Type again to make it valid
      await user.type(input, '4');
      expect(submitButton).toBeEnabled();
    });
  });

  // TODO Add tests for (engage, success, etc.) metrics events once submit button enabled
});
