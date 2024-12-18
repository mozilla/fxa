/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import FormPhoneNumber from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

describe('FormPhoneNumber', () => {
  function render() {
    renderWithLocalizationProvider(
      <FormPhoneNumber localizedCTAText="Send code" />
    );
  }

  function getPhoneInput() {
    return screen.getByRole('textbox', {
      name: 'Enter phone number',
    });
  }
  function getSubmitButton() {
    return screen.getByRole('button', {
      name: 'Send code',
    });
  }

  it('submit button is disabled by default', async () => {
    render();
    await waitFor(() => {
      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe('form validity and submission', () => {
    // alertMock is temporary until real functionality is implemented
    let alertMock: jest.SpyInstance<void, [message?: any], any>;
    beforeEach(() => {
      alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    });
    afterEach(() => {
      alertMock.mockRestore();
    });
    it('submit button is enabled for valid North American number, 1231231234, and is formatted as expected', async () => {
      const user = userEvent.setup();
      render();
      await waitFor(async () => await user.type(getPhoneInput(), '1231231234'));
      expect(getSubmitButton()).toBeEnabled();
      await waitFor(async () => await user.click(getSubmitButton()));
      expect(alertMock).toHaveBeenCalledWith(
        'formattedPhoneNumber: +11231231234'
      );
    });

    it('submit button is enabled for valid North American number, (123) 123-1234, and is formatted as expected', async () => {
      const user = userEvent.setup();
      const alertMock = jest
        .spyOn(window, 'alert')
        .mockImplementation(() => {});
      render();
      await waitFor(
        async () => await user.type(getPhoneInput(), '(123) 123-1234')
      );
      expect(getSubmitButton()).toBeEnabled();
      await waitFor(async () => await user.click(getSubmitButton()));
      expect(alertMock).toHaveBeenCalledWith(
        'formattedPhoneNumber: +11231231234'
      );
    });

    it('submit button is disabled for invalid 11-digit phoneValidationNorthAmerica, 12312312345', async () => {
      const user = userEvent.setup();
      render();
      await waitFor(
        async () => await user.type(getPhoneInput(), '12312312345')
      );
      expect(getSubmitButton()).toBeDisabled();
    });
    it('submit button is disabled for invalid number with letters phoneValidationNorthAmerica, abc12312345', async () => {
      const user = userEvent.setup();
      render();
      await waitFor(
        async () => await user.type(getPhoneInput(), 'abc12312345')
      );
      expect(getSubmitButton()).toBeDisabled();
    });
  });
});
