/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { extendedCountryOptions, Subject } from './mocks';

describe('InputPhoneNumber', () => {
  it('renders as expected with default countries', () => {
    renderWithLocalizationProvider(<Subject />);

    const usOption = screen.getByText('United States (+1)');
    const canadaOption = screen.getByText('Canada (+1)');
    expect(usOption).toBeInTheDocument();
    expect(canadaOption).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);

    // expect list to be sorted alphabetically
    expect(options[0]).toHaveTextContent('Canada (+1)');
    expect(options[1]).toHaveTextContent('United States (+1)');
    // US is currently the default
    expect((options[1] as HTMLOptionElement).selected).toBe(true);

    expect(
      screen.getByRole('textbox', { name: /Enter phone number/i })
    ).toBeInTheDocument();
  });

  it('renders a select option for every country, and the country with ID=1 is selected by default', async () => {
    renderWithLocalizationProvider(
      <Subject countries={extendedCountryOptions} />
    );
    let options = screen.getAllByRole('option');
    expect(options.length).toBe(extendedCountryOptions.length);

    // There should be an option for each country listed
    expect(extendedCountryOptions.length).toEqual(options.length);
    extendedCountryOptions.forEach((countryOption) => {
      expect(
        options.some((option) =>
          option.textContent?.includes(countryOption.name)
        )
      ).toBe(true);
    });

    // The default country (country with ID=1) should be selected by default
    const defaultCountry = extendedCountryOptions.find(
      (country) => country.id === 1
    );
    const selectElement = options[0].closest('select') as HTMLSelectElement;
    expect(selectElement).toHaveValue(defaultCountry?.id.toString());
  });
});
