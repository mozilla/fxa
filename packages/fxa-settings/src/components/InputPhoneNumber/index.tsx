/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import InputText from '../InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import { UseFormMethods } from 'react-hook-form';

interface Country {
  id: number;
  code: string;
  classNameFlag: string;
  name: string;
  ftlId: string;
  validationPattern: RegExp;
}

export type InputPhoneNumberProps = {
  countries?: Country[];
  hasErrors?: boolean;
  register: UseFormMethods['register'];
  setValue: UseFormMethods['setValue'];
  errorBannerId?: string;
};

export const phoneNorthAmerica = {
  // North American Numbering Plan (NANP) countries are 123-123-1235
  validationPattern: /^\d{3}-\d{3}-\d{4}$/,
};

export const defaultCountries = [
  // We need IDs because country codes can be the same, and countries
  // can have multiple country codes, so 'name' isn't necessarily unique.
  {
    // Currently, the country with an ID of 1 is the default selected country
    // as well as the country always shown at the top of the drop down list.
    // Also, when we expand this list, we'll want to sort alphabetically by name.
    id: 1,
    code: '+1',
    classNameFlag: 'bg-flag-usa',
    name: 'United States',
    ftlId: 'input-phone-number-country-united-states',
    ...phoneNorthAmerica,
  },
  {
    id: 2,
    code: '+1',
    classNameFlag: 'bg-flag-canada',
    name: 'Canada',
    ftlId: 'input-phone-number-country-canada',
    ...phoneNorthAmerica,
  },
];

const InputPhoneNumber = ({
  countries = defaultCountries,
  hasErrors = false,
  register,
  setValue,
  errorBannerId,
}: InputPhoneNumberProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const sortedLocalizedCountries = countries
    .map((country) => ({
      ...country,
      localizedName:
        ftlMsgResolver.getMsg(country.ftlId, country.name) || country.name,
    }))
    .sort((a, b) => {
      return new Intl.Collator(navigator.language).compare(
        a.localizedName,
        b.localizedName
      );
    });
  // currently USA is the default country, but we should aim to select the default country based on user location
  // FXA-11212
  const defaultCountry =
    sortedLocalizedCountries.find((country) => country.id === 1) ||
    sortedLocalizedCountries[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const localizedLabel = ftlMsgResolver.getMsg(
    'input-phone-number-enter-number',
    'Enter phone number'
  );

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = sortedLocalizedCountries.find(
      (country) => country.id === parseInt(event.target.value, 10)
    );
    if (selectedCountry) {
      setSelectedCountry(selectedCountry);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const formattedValue = formatPhoneNumber(inputValue);
    setValue('phoneNumber', formattedValue);
  };

  // Format the phone number as the user types - for easier review by the user
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-numeric characters
    const cleanedInput = input.replace(/\D/g, '');

    // Format dynamically based on the pattern (for North America, the pattern is 123-123-1235)
    if (
      selectedCountry.validationPattern === phoneNorthAmerica.validationPattern
    ) {
      const formatted = cleanedInput
        .replace(/^(\d{3})(\d)/, '$1-$2') // Add the first dash after the area code
        .replace(/^(\d{3}-\d{3})(\d)/, '$1-$2') // Add the second dash after the exchange code
        .slice(0, 12); // Limit to 12 characters

      return formatted.trim();
    }

    return cleanedInput.trim();
  };

  return (
    <div className="flex">
      <div className="relative inline-block w-[60px] me-2">
        <FtlMsg id="input-phone-number-country-list-aria-label">
          <label id="countryLabel" className="sr-only">
            Select country
          </label>
        </FtlMsg>
        <select
          aria-labelledby="countryLabel"
          onChange={handleCountryChange}
          value={selectedCountry.id}
          /* The forced-colors styling is for Windows HCM
           * keeps label hidden when the select is collapsed without hiding from screen readers
           */
          className="
            w-full h-full
            px-2
            border border-grey-200 rounded-md
            bg-transparent text-transparent
            focus:border-blue-400 focus:outline-none focus:shadow-input-blue-focus
            forced-color-adjust:none
            [@media(forced-colors:active)]:text-[ButtonFace]
            [@media(forced-colors:active)]:text-shadow-[0_0_0_transparent]
            appearance-none
          "
        >
          {sortedLocalizedCountries.map((country) => (
            <option key={country.id} value={country.id} className="text-black">
              {country.localizedName} ({country.code})
            </option>
          ))}
        </select>

        <span
          aria-hidden
          className={`
              absolute start-1 top-1/2 -translate-y-1/2
              w-6 h-4 bg-no-repeat bg-[length:1.5rem_1rem]
              pointer-events-none
              ${selectedCountry.classNameFlag}
            `}
        />

        {/* chevron ▾ */}
        <svg
          aria-hidden
          viewBox="0 0 8 5"
          className="absolute end-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5
                   fill-current text-current pointer-events-none
                   [forced-colors:active]:text-[ButtonText]"
        >
          <path d="M0 0h8L4 5z" />
        </svg>
      </div>

      {/* Because the country code may not be unique, the above `select`'s `value` must
       be by country ID. This hidden input allows us to access it in the form data. */}
      <input
        type="hidden"
        name="countryCode"
        value={selectedCountry.code}
        ref={register()}
      />
      <InputText
        name="phoneNumber"
        type="tel"
        label={localizedLabel}
        required
        className="text-start w-full"
        autoComplete="off"
        spellCheck={false}
        inputRef={register({
          required: true,
          pattern: selectedCountry.validationPattern,
        })}
        {...{ hasErrors }}
        onChange={handleInputChange}
        aria-describedby={errorBannerId}
      />
    </div>
  );
};

export default InputPhoneNumber;
