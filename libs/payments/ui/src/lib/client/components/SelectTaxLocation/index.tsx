/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import countries from 'i18n-iso-countries';
import { useEffect, useState } from 'react';
import { ButtonVariant } from '@fxa/payments/ui';
import { SubmitButton } from '../SubmitButton';

interface CollapsedProps {
  savedCountryCode: string | undefined;
  savedPostalCode: string | undefined;
  setSavedCountryCode: (value: string | undefined) => void;
  setSavedPostalCode: (value: string | undefined) => void;
  setSelectedCountryCode: (value: string | undefined) => void;
  setSelectedPostalCode: (value: string | undefined) => void;
}

const Collapsed = ({
  savedCountryCode,
  savedPostalCode,
  setSavedCountryCode,
  setSavedPostalCode,
  setSelectedCountryCode,
  setSelectedPostalCode,
}: CollapsedProps) => {
  return (
    <Form.Root
      action={async () => {
        setSelectedCountryCode(savedCountryCode);
        setSelectedPostalCode(savedPostalCode);
        setSavedCountryCode(undefined);
        setSavedPostalCode(undefined);
      }}
      className="flex gap-4 justify-between items-center"
      data-testid="tax-location-haslocation"
    >
      <span>
        {savedCountryCode}, {savedPostalCode}
      </span>
      <span>
        <Form.Submit asChild>
          <SubmitButton
            variant={ButtonVariant.Secondary}
            data-testid="tax-location-edit-button"
          >
            <Localized id="select-tax-location-edit-button">Edit</Localized>
          </SubmitButton>
        </Form.Submit>
      </span>
    </Form.Root>
  );
};

interface ExpandedProps {
  locale: string;
  unsupportedLocations: string;
  selectedCountryCode: string | undefined;
  selectedPostalCode: string | undefined;
  setSavedCountryCode: (value: string | undefined) => void;
  setSavedPostalCode: (value: string | undefined) => void;
  setSelectedCountryCode: (value: string | undefined) => void;
  setSelectedPostalCode: (value: string | undefined) => void;
}

const Expanded = ({
  locale,
  unsupportedLocations,
  selectedCountryCode,
  selectedPostalCode,
  setSavedCountryCode,
  setSavedPostalCode,
  setSelectedCountryCode,
  setSelectedPostalCode,
}: ExpandedProps) => {
  const [countryCodes, setCountryCodes] = useState<
    { name: string; code: string }[]
  >([]);
  const [serverErrors, setServerErrors] = useState<{
    [key: string]: boolean;
  }>({
    missingCountryCode: false,
    unsupportedCountry: false,
    missingPostalCode: false,
    invalidPostalCode: false,
  });

  useEffect(() => {
    countries.registerLocale(
      require(`i18n-iso-countries/langs/${locale}.json`)
    );
    const countryObj = countries.getNames(locale, { select: 'official' });
    const countryArr = Object.entries(countryObj).map(([key, value]) => {
      return {
        name: value,
        code: key,
      };
    });
    setCountryCodes(countryArr.sort((a, b) => a.name.localeCompare(b.name)));
  }, [locale]);

  const handleCountryCodeChange = (countryCode: string | undefined) => {
    setServerErrors((prev) => ({
      ...prev,
      missingCountryCode: false,
      unsupportedCountries: false,
    }));

    if (!countryCode) {
      return setServerErrors((prev) => ({ ...prev, missingCountryCode: true }));
    }

    setSelectedCountryCode(countryCode);

    if (unsupportedLocations.includes(countryCode)) {
      setServerErrors((prev) => ({ ...prev, unsupportedCountry: true }));
    } else {
      setServerErrors((prev) => ({ ...prev, unsupportedCountry: false }));
    }
  };

  const handlePostalCodeChange = async (
    selectedPostalCode: string | undefined
  ) => {
    setServerErrors((prev) => ({
      ...prev,
      missingPostalCode: false,
      invalidPostalCode: false,
    }));

    if (!selectedPostalCode)
      return setServerErrors({ missingPostalCode: true });

    setSelectedPostalCode(selectedPostalCode);
    // placeholder for validation
    // if valid, setSavedPostalCode
    // else setServerErrors invalidPostalCode true
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      selectedCountryCode &&
      unsupportedLocations.includes(selectedCountryCode)
    ) {
      setServerErrors((prev) => ({ ...prev, unsupportedCountry: true }));
    } else {
      setSavedCountryCode(selectedCountryCode);
      setSavedPostalCode(selectedPostalCode);
    }
  };

  return (
    <Form.Root
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-4"
      data-testid="select-location-form"
    >
      <Form.Field name="countryCode">
        <Localized id="select-tax-location-country-code-select">
          <Form.Label className="text-grey-400 block mb-1 text-start">
            Country
          </Form.Label>
        </Localized>
        <Form.Control asChild>
          <select
            name="countryCode"
            defaultValue={selectedCountryCode}
            value={selectedCountryCode}
            onChange={(e) => {
              handleCountryCodeChange(e.target.value);
            }}
            className="flex items-center justify-between gap-4 w-full border rounded-md border-black/30 p-3 bg-white placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:text-grey-500 data-[invalid=true]:border-alert-red data-[invalid=true]:shadow-inputError"
            required
            aria-required
          >
            {!selectedCountryCode && (
              <Localized id="select-tax-location-country-code-placeholder">
                <option value="">Select your country</option>
              </Localized>
            )}
            {countryCodes.map((country, idx) => (
              <option
                key={`${country.code}-${idx}`}
                value={country.code}
                className="relative flex items-center px-8 py-2 rounded-md focus:text-white focus:bg-blue-500"
              >
                {country.name}
              </option>
            ))}
          </select>
        </Form.Control>
        <Form.Message match="valueMissing">
          <Localized id="select-tax-location-error-missing-country-code">
            <p className="mt-1 text-alert-red" role="alert">
              Please select your country
            </p>
          </Localized>
        </Form.Message>
        {serverErrors.unsupportedCountry && (
          <Form.Message>
            {/* <Localized id="next-location-unsupported"> */}
            <p className="mt-1 text-alert-red" role="alert">
              Your current location is not supported according to our Terms of
              Service.
            </p>
            {/* </Localized> */}
          </Form.Message>
        )}
      </Form.Field>

      <Form.Field name="postalCode">
        <Localized id="select-tax-location-postal-code-input">
          <Form.Label className="text-grey-400 block mb-1 text-start">
            Postal Code
          </Form.Label>
        </Localized>

        <Form.Control asChild>
          {/* <Localized
            attrs={{ placeholder: true }}
            id="select-tax-location-postal-code-placeholder"
          > */}
          <input
            className="w-full border rounded-md border-black/30 p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError"
            name="postalCode"
            type="text"
            data-testid="postal-code"
            placeholder="Enter your postal code"
            onChange={(e) => {
              handlePostalCodeChange(e.target.value);
            }}
            defaultValue={selectedPostalCode}
            required
            aria-required
          />
          {/* </Localized> */}
        </Form.Control>
        <Form.Message match="valueMissing">
          <Localized id="select-tax-location-error-missing-postal-code">
            <p className="mt-1 text-alert-red" role="alert">
              Please enter your postal code
            </p>
          </Localized>
        </Form.Message>
        {serverErrors.invalidPostalCode && (
          <Form.Message>
            {/* <Localized id="select-tax-location-error-invalid-postal-code"> */}
            <p className="mt-1 text-alert-red" role="alert">
              Please enter a valid postal code
            </p>
            {/* </Localized> */}
          </Form.Message>
        )}
      </Form.Field>

      <Form.Submit asChild>
        <SubmitButton
          className="w-full"
          type="submit"
          data-testid="tax-location-save-button"
          variant={ButtonVariant.Secondary}
        >
          <Localized id="select-tax-location-save-button">Save</Localized>
        </SubmitButton>
      </Form.Submit>
    </Form.Root>
  );
};

interface SelectTaxLocationProps {
  locale: string;
  unsupportedLocations: string;
  countryCode: string | undefined;
  postalCode: string | undefined;
}

export function SelectTaxLocation({
  locale,
  unsupportedLocations,
  countryCode,
  postalCode,
}: SelectTaxLocationProps) {
  const [savedCountryCode, setSavedCountryCode] = useState<
    string | undefined
  >();
  const [savedPostalCode, setSavedPostalCode] = useState<string | undefined>();
  const [selectedCountryCode, setSelectedCountryCode] = useState<
    string | undefined
  >();
  const [selectedPostalCode, setSelectedPostalCode] = useState<
    string | undefined
  >();

  useEffect(() => {
    const formData = new FormData();

    if (countryCode) {
      setSavedCountryCode(countryCode);
      setSelectedCountryCode(countryCode);
      formData.set('countryCode', countryCode);
    }

    if (postalCode) {
      setSavedPostalCode(postalCode);
      setSelectedPostalCode(postalCode);
      formData.set('postalCode', postalCode);
    }
  }, []);

  const languageCode = locale.split('-')[0];

  return (
    <div
      className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8"
      aria-label="Tax location form"
    >
      <Localized id="select-tax-location-title">
        <h2 className="m-0 mb-4 font-semibold text-grey-600">Location</h2>
      </Localized>

      {savedCountryCode && savedPostalCode ? (
        <Collapsed
          savedCountryCode={savedCountryCode}
          savedPostalCode={savedPostalCode}
          setSavedCountryCode={setSavedCountryCode}
          setSavedPostalCode={setSavedPostalCode}
          setSelectedCountryCode={setSelectedCountryCode}
          setSelectedPostalCode={setSelectedPostalCode}
        />
      ) : (
        <Expanded
          locale={languageCode}
          unsupportedLocations={unsupportedLocations}
          selectedCountryCode={selectedCountryCode}
          selectedPostalCode={selectedPostalCode}
          setSavedCountryCode={setSavedCountryCode}
          setSavedPostalCode={setSavedPostalCode}
          setSelectedCountryCode={setSelectedCountryCode}
          setSelectedPostalCode={setSelectedPostalCode}
        />
      )}
    </div>
  );
}
