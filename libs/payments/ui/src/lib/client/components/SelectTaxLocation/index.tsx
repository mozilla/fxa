/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import countries from 'i18n-iso-countries';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BaseButton, ButtonVariant, SubmitButton } from '@fxa/payments/ui';
import { validateAndFormatPostalCode } from '@fxa/payments/ui/actions';
import spinnerWhiteImage from '@fxa/shared/assets/images/spinnerwhite.svg';

interface CollapsedProps {
  countryCode: string | undefined;
  postalCode: string | undefined;
  displayAlert: boolean;
  editAction: () => void;
}

const Collapsed = ({
  countryCode,
  postalCode,
  displayAlert,
  editAction,
}: CollapsedProps) => {
  return (
    <Form.Root action={editAction} data-testid="tax-location-haslocation">
      <div className="flex gap-4 justify-between items-center">
        <span>
          {countryCode}, {postalCode}
        </span>
        <span>
          <Form.Submit asChild>
            <SubmitButton
              variant={ButtonVariant.Secondary}
              data-testid="tax-location-edit-button"
            >
              <Localized id="select-tax-location-edit-button">
                <p>Edit</p>
              </Localized>
            </SubmitButton>
          </Form.Submit>
        </span>
      </div>

      {displayAlert && (
        <Localized id="select-tax-location-successfully-updated">
          <p className="font-medium mt-4 text-green-900" role="alert">
            Your location has been updated.
          </p>
        </Localized>
      )}
    </Form.Root>
  );
};

interface ExpandedProps {
  cmsCountryCodes: string[];
  locale: string;
  productName: string;
  unsupportedLocations: string;
  countryCode: string | undefined;
  postalCode: string | undefined;
  saveAction: (countryCode: string, postalCode: string) => void;
  buttonContent?: {
    ftlId: string;
    label: string;
  };
}

const Expanded = ({
  cmsCountryCodes,
  locale,
  productName,
  unsupportedLocations,
  countryCode,
  postalCode,
  saveAction,
  buttonContent,
}: ExpandedProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<
    string | undefined
  >();
  const [selectedPostalCode, setSelectedPostalCode] = useState<
    string | undefined
  >();
  const [countryCodes, setCountryCodes] = useState<
    { name: string; code: string }[]
  >([]);
  const [serverErrors, setServerErrors] = useState<{
    [key: string]: boolean;
  }>({
    missingCountryCode: false,
    productNotAvailable: false,
    unsupportedCountry: false,
    invalidPostalCode: false,
    locationNotUpdated: false,
  });

  useEffect(() => {
    if (countryCode) {
      setSelectedCountryCode(countryCode);
    }

    if (postalCode) {
      setSelectedPostalCode(postalCode);
    }

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
      productNotAvailable: false,
      unsupportedCountries: false,
    }));

    if (!countryCode) {
      return setServerErrors((prev) => ({ ...prev, missingCountryCode: true }));
    }

    setSelectedCountryCode(countryCode);

    // If the selected location is not supported per TOS, it is not necessary to
    // also inform the customer that the product is not available in their location.
    if (
      unsupportedLocations.includes(countryCode) &&
      !cmsCountryCodes.includes(countryCode)
    ) {
      setServerErrors((prev) => ({
        ...prev,
        productNotAvailable: false,
        unsupportedCountry: true,
      }));
    } else if (unsupportedLocations.includes(countryCode)) {
      setServerErrors((prev) => ({
        ...prev,
        productNotAvailable: false,
        unsupportedCountry: true,
      }));
    } else if (!cmsCountryCodes.includes(countryCode)) {
      setServerErrors((prev) => ({
        ...prev,
        productNotAvailable: true,
        unsupportedCountry: false,
      }));
    } else {
      setServerErrors((prev) => ({
        ...prev,
        productNotAvailable: false,
        unsupportedCountry: false,
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      selectedCountryCode &&
      unsupportedLocations.includes(selectedCountryCode)
    ) {
      setServerErrors((prev) => ({ ...prev, unsupportedCountry: true }));
    }

    try {
      if (selectedCountryCode && selectedPostalCode) {
        const { isValid, formattedPostalCode } =
          await validateAndFormatPostalCode(
            selectedPostalCode,
            selectedCountryCode
          );

        if (!isValid) {
          setServerErrors((prev) => ({ ...prev, invalidPostalCode: true }));
          setIsLoading(false);
        } else {
          saveAction(
            selectedCountryCode,
            formattedPostalCode || selectedPostalCode
          );
        }
      }
    } catch (err) {
      setServerErrors((prev) => ({ ...prev, locationNotUpdated: true }));
    }
  };

  const errorExists = Object.values(serverErrors).some(
    (value) => value === true
  );

  return (
    <Form.Root
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-4 w-full"
      data-testid="select-location-form"
    >
      <Form.Field name="countryCode">
        <Localized id="select-tax-location-country-code-label">
          <Form.Label className="text-grey-400 block mb-1 text-start">
            Country
          </Form.Label>
        </Localized>
        <Form.Control asChild>
          <select
            name="countryCode"
            value={selectedCountryCode}
            onChange={(e) => {
              setServerErrors((prev) => ({
                ...prev,
                invalidPostalCode: false,
              }));
              handleCountryCodeChange(e.target.value);
            }}
            className="flex items-center justify-between gap-4 w-full border rounded-md border-black/30 p-3 bg-white placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:text-grey-500 data-[invalid=true]:border-alert-red data-[invalid=true]:shadow-inputError"
            required
            aria-required
            disabled={isLoading}
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
        {serverErrors.productNotAvailable && (
          <Form.Message>
            <Localized
              id="select-tax-location-product-not-available"
              vars={{ productName }}
            >
              <p className="mt-1 text-alert-red" role="alert">
                {productName} is not available in this location.
              </p>
            </Localized>
          </Form.Message>
        )}
        {serverErrors.unsupportedCountry && (
          <Form.Message>
            <Localized id="next-location-unsupported">
              <p className="mt-1 text-alert-red" role="alert">
                Your current location is not supported according to our Terms of
                Service.
              </p>
            </Localized>
          </Form.Message>
        )}
      </Form.Field>

      <Form.Field name="postalCode">
        <Localized id="select-tax-location-postal-code-label">
          <Form.Label className="text-grey-400 block mb-1 text-start">
            Postal Code
          </Form.Label>
        </Localized>

        <Localized
          attrs={{ placeholder: true }}
          id="select-tax-location-postal-code"
        >
          <Form.Control asChild>
            <input
              id="postalCode"
              className="w-full border rounded-md border-black/30 p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError"
              name="postalCode"
              type="text"
              data-testid="postal-code"
              placeholder="Enter your postal code"
              onChange={(e) => {
                setServerErrors((prev) => ({
                  ...prev,
                  invalidPostalCode: false,
                }));
                setSelectedPostalCode(e.target.value);
              }}
              defaultValue={selectedPostalCode}
              required
              aria-required
              disabled={isLoading}
            />
          </Form.Control>
        </Localized>
        <Form.Message match="valueMissing">
          <Localized id="select-tax-location-error-missing-postal-code">
            <p
              className="mt-1 text-alert-red"
              role="alert"
              aria-live="assertive"
            >
              Please enter your postal code
            </p>
          </Localized>
        </Form.Message>
        {serverErrors.invalidPostalCode && (
          <Form.Message>
            <Localized id="select-tax-location-error-invalid-postal-code">
              <p
                className="mt-1 text-alert-red"
                role="alert"
                aria-live="assertive"
              >
                Please enter a valid postal code
              </p>
            </Localized>
          </Form.Message>
        )}
      </Form.Field>
      {serverErrors.locationNotUpdated && (
        <Localized id="select-tax-location-error-location-not-updated">
          <p className="mt-1 text-alert-red" role="alert">
            Your location could not be updated. Please try again.
          </p>
        </Localized>
      )}

      <Form.Submit asChild>
        <BaseButton
          variant={ButtonVariant.Primary}
          className="w-full"
          data-testid="tax-location-save-button"
          type="submit"
          disabled={errorExists || isLoading}
          aria-disabled={errorExists || isLoading}
        >
          {isLoading ? (
            <Image
              src={spinnerWhiteImage}
              alt=""
              className="absolute animate-spin h-8 w-8"
            />
          ) : buttonContent ? (
            <Localized id={buttonContent.ftlId}>
              <p>{buttonContent.label}</p>
            </Localized>
          ) : (
            <Localized id="select-tax-location-save-button">
              <p>Save</p>
            </Localized>
          )}
        </BaseButton>
      </Form.Submit>
    </Form.Root>
  );
};

interface SelectTaxLocationProps {
  saveAction: (countryCode: string, postalCode: string) => Promise<void> | void;
  cmsCountries: string[];
  locale: string;
  productName: string;
  unsupportedLocations: string;
  countryCode: string | undefined;
  postalCode: string | undefined;
  buttonContent?: {
    ftlId: string;
    label: string;
  };
}

export function SelectTaxLocation({
  saveAction,
  cmsCountries,
  locale,
  productName,
  unsupportedLocations,
  countryCode,
  postalCode,
  buttonContent,
}: SelectTaxLocationProps) {
  const [expanded, setExpanded] = useState<boolean>(
    !countryCode || !postalCode
  );

  const [alertStatus, setAlertStatus] = useState<boolean>(false);
  const cmsCountryCodes = cmsCountries.map((country) => country.slice(0, 2));

  return expanded ? (
    <Expanded
      cmsCountryCodes={cmsCountryCodes}
      locale={locale}
      productName={productName}
      unsupportedLocations={unsupportedLocations}
      countryCode={countryCode}
      postalCode={postalCode}
      saveAction={async (countryCode: string, postalCode: string) => {
        await saveAction(countryCode, postalCode);
        setExpanded(false);
        setAlertStatus(true);
      }}
      buttonContent={buttonContent}
    />
  ) : (
    <Collapsed
      countryCode={countryCode}
      postalCode={postalCode}
      editAction={() => {
        setExpanded(true);
      }}
      displayAlert={alertStatus}
    />
  );
}

export function IsolatedSelectTaxLocation({
  saveAction,
  cmsCountries,
  locale,
  productName,
  unsupportedLocations,
}: Omit<SelectTaxLocationProps, 'countryCode' | 'postalCode'>) {
  const queryParams = useSearchParams();

  const countryCode = queryParams?.get('countryCode') ?? '';
  const postalCode = queryParams?.get('postalCode') ?? '';
  const [updatedCountryCode, setUpdatedCountryCode] =
    useState<string>(countryCode);
  const [updatedPostalCode, setUpdatedPostalCode] =
    useState<string>(postalCode);
  const cmsCountryCodes = cmsCountries.map((country) => country.slice(0, 2));
  return (
    <Expanded
      saveAction={(countryCode: string, postalCode: string) => {
        setUpdatedCountryCode(countryCode);
        setUpdatedPostalCode(postalCode);
        saveAction(countryCode, postalCode);
      }}
      cmsCountryCodes={cmsCountryCodes}
      locale={locale}
      productName={productName}
      unsupportedLocations={unsupportedLocations}
      countryCode={updatedCountryCode}
      postalCode={updatedPostalCode}
      buttonContent={{
        ftlId: 'select-tax-location-continue-to-checkout-button',
        label: 'Continue to checkout',
      }}
    />
  );
}
