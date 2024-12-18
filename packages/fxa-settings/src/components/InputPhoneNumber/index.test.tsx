/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { extendedCountryOptions, Subject } from './mocks';
import userEvent from '@testing-library/user-event';

describe('InputPhoneNumber', () => {
  it('renders as expected with default countries', () => {
    renderWithLocalizationProvider(<Subject />);

    const usOption = screen.getByText('United States (+1)');
    const canadaOption = screen.getByText('Canada (+1)');
    expect(usOption).toBeInTheDocument();
    expect(canadaOption).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);

    // The first option should be United States, and it should be selected by default
    expect(options[0]).toHaveTextContent('United States (+1)');
    expect((options[0] as HTMLOptionElement).selected).toBe(true);

    expect(
      screen.getByRole('textbox', { name: /Enter phone number/i })
    ).toBeInTheDocument();
  });

  it('renders a select option for every country, and the country with ID=1 is always the first option', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <Subject countries={extendedCountryOptions} />
    );
    let options = screen.getAllByRole('option');
    expect(options.length).toBe(extendedCountryOptions.length);

    // There should be an option for each country listed
    options.forEach((option, index) => {
      const { name, code } = extendedCountryOptions[index];
      const expectedText = `${name} (${code})`;
      expect(option).toHaveTextContent(expectedText);
    });

    // The first option should correspond to the country with ID=1
    const defaultCountry = extendedCountryOptions.find(
      (country) => country.id === 1
    );
    expect(options[0]).toHaveTextContent(
      `${defaultCountry?.name} (${defaultCountry?.code})`
    );
    const selectElement = options[0].closest('select') as HTMLSelectElement;
    expect(selectElement).not.toBeNull();

    // We must use 'act' because we need to get all options after selection has finished
    await act(async () => {
      // Select "Murica" (id=100)
      await user.selectOptions(selectElement, ['100']);
    });
    const updatedOptions = screen.getAllByRole('option');
    expect(updatedOptions[0]).toHaveTextContent('United States (+1)');
  });
});
