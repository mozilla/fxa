/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormPhoneNumber from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

const mockSubmit = jest.fn();

describe('FormPhoneNumber', () => {
  function render() {
    renderWithLocalizationProvider(
      <FormPhoneNumber
        localizedCTAText="Send code"
        submitPhoneNumber={mockSubmit}
      />
    );
  }

  function renderWithInfoBannerProps() {
    renderWithLocalizationProvider(
      <FormPhoneNumber
        localizedCTAText="Send code"
        submitPhoneNumber={mockSubmit}
        infoBannerContent={{
          localizedDescription: 'This is a banner description',
          localizedHeading: 'This is a banner heading',
        }}
        infoBannerLink={{
          localizedText: 'This is a banner link',
          path: '#',
        }}
      />
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

  it('renders the component as expected', async () => {
    render();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(getPhoneInput()).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
    });
  });

  it('renders the component with info banner', async () => {
    renderWithInfoBannerProps();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    expect(getPhoneInput()).toBeInTheDocument();
    expect(getSubmitButton()).toBeInTheDocument();

    expect(screen.getByText('This is a banner heading')).toBeInTheDocument();
    expect(
      screen.getByText('This is a banner description')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /This is a banner link/ })
    ).toBeInTheDocument();
  });

  it('submit button is disabled by default', async () => {
    render();
    await waitFor(() => {
      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe('form validity and submission', () => {
    it('submit button is enabled for valid North American number, 1231231234, and is formatted as expected', async () => {
      const user = userEvent.setup();
      render();
      await waitFor(() => user.type(getPhoneInput(), '1231231234'));
      expect(getSubmitButton()).toBeEnabled();
      user.click(getSubmitButton());
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith('+11231231234')
      );
    });

    it('submit button is enabled for valid North American number, (123) 123-1234, and is formatted as expected', async () => {
      const user = userEvent.setup();
      render();
      await waitFor(
        async () => await user.type(getPhoneInput(), '(123) 123-1234')
      );
      expect(getSubmitButton()).toBeEnabled();
      await waitFor(async () => await user.click(getSubmitButton()));
      expect(mockSubmit).toHaveBeenCalledWith('+11231231234');
    });

    it('input value is restricted to 10 digits', async () => {
      const user = userEvent.setup();
      render();
      await waitFor(
        async () => await user.type(getPhoneInput(), '12312312345')
      );
      expect(getPhoneInput()).toHaveValue('123-123-1234');
      expect(getSubmitButton()).toBeEnabled();
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
