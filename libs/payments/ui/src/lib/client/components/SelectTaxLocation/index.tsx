/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import classNames from 'classnames';
import countries from 'i18n-iso-countries';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { BaseButton, ButtonVariant, SubmitButton } from '@fxa/payments/ui';
import { validateAndFormatPostalCode } from '@fxa/payments/ui/actions';
import spinnerWhiteImage from '@fxa/shared/assets/images/spinnerwhite.svg';

enum SaveActionErrors {
  CURRENCY_CHANGE_NOT_ALLOWED = 'currency_change', //TaxChangeAllowedStatus.CurrencyChange
}

type SaveActionSignature = (
  countryCode: string,
  postalCode: string
) => Promise<
  | {
      ok: false;
      error: string | { message: string; data: any };
    }
  | {
      ok: true;
      data: any;
    }
  | void
>;

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
              className="h-12"
              variant={ButtonVariant.Primary}
              data-testid="tax-location-edit-button"
            >
              <Localized id="select-tax-location-edit-button">
                <span>Edit</span>
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
  initialCountryCode: string | undefined;
  initialPostalCode: string | undefined;
  currentCurrency?: string;
  saveAction: SaveActionSignature;
  cancelAction?: () => void;
  buttonContent?: {
    ftlId: string;
    label: string;
  };
  showNewTaxRateInfoMessage?: boolean;
}

const Expanded = ({
  cmsCountryCodes,
  locale,
  productName,
  unsupportedLocations,
  initialCountryCode,
  initialPostalCode,
  currentCurrency,
  saveAction,
  cancelAction,
  buttonContent,
  showNewTaxRateInfoMessage = false,
}: ExpandedProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
  const countrySelectRef = useRef<HTMLSelectElement>(null);

  // Ensure that the defaultValue matches the initial countryCode
  // Necessary because the select countryCodes opttions are
  // set dynamically
  useEffect(() => {
    if (countryCodes && countrySelectRef.current) {
      // Only set after countryCodes exist in DOM
      countrySelectRef.current.value = initialCountryCode || '';
    }
  }, [countryCodes]);

  const currentCurrencyDisplayName =
    currentCurrency &&
    new Intl.DisplayNames([locale], { type: 'currency' }).of(
      currentCurrency.toUpperCase()
    );

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
  }, [initialCountryCode, initialPostalCode, locale]);

  const handleCountryCodeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setServerErrors((prev) => ({
      ...prev,
      missingCountryCode: false,
      productNotAvailable: false,
      unsupportedCountries: false,
      invalidPostalCode: false,
      invalidCurrencyChange: false,
    }));

    if (!event.target.value) {
      return setServerErrors((prev) => ({ ...prev, missingCountryCode: true }));
    }

    // If the selected location is not supported per TOS, it is not necessary to
    // also inform the customer that the product is not available in their location.
    const isSanctionedLocation = unsupportedLocations.includes(
      event.target.value
    );
    const isProductAvailable = cmsCountryCodes.includes(event.target.value);
    setServerErrors((prev) => ({
      ...prev,
      productNotAvailable: isSanctionedLocation
        ? isProductAvailable
        : !isProductAvailable,
      unsupportedCountry: isSanctionedLocation,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const formCountryCode =
      typeof data.countryCode === 'string' ? data.countryCode : '';
    const formPostalCode =
      typeof data.postalCode === 'string' ? data.postalCode : '';

    if (formCountryCode && unsupportedLocations.includes(formCountryCode)) {
      setServerErrors((prev) => ({ ...prev, unsupportedCountry: true }));
    }

    try {
      if (formCountryCode && formPostalCode) {
        const { isValid, formattedPostalCode } =
          await validateAndFormatPostalCode(formPostalCode, formCountryCode);

        if (!isValid) {
          setServerErrors((prev) => ({ ...prev, invalidPostalCode: true }));
          setIsLoading(false);
        } else {
          const result = await saveAction(
            formCountryCode,
            formattedPostalCode || formPostalCode
          );
          if (result && !result.ok) {
            if (result.error === SaveActionErrors.CURRENCY_CHANGE_NOT_ALLOWED) {
              setServerErrors((prev) => ({
                ...prev,
                invalidCurrencyChange: true,
              }));
            } else {
              setServerErrors((prev) => ({
                ...prev,
                locationNotUpdated: true,
              }));
            }
            setIsLoading(false);
          }
        }
      }
    } catch (err) {
      setServerErrors((prev) => ({ ...prev, locationNotUpdated: true }));
      setIsLoading(false);
    }
  };

  const blockingErrorExists = Object.entries(serverErrors).some(
    ([key, value]) => (key === 'locationNotUpdated' ? false : !!value)
  );

  return (
    <Form.Root
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-4 w-full"
      data-testid="select-location-form"
      aria-busy={isLoading}
      aria-live="polite"
    >
      {isLoading && (
        <span className="sr-only" role="status">
          Saving...
        </span>
      )}
      <Form.Field name="countryCode">
        <Localized id="select-tax-location-country-code-label">
          <Form.Label
            htmlFor="countryCode"
            className="text-grey-400 block mb-1 text-start"
          >
            Country
          </Form.Label>
        </Localized>
        <div className="relative w-full">
          <select
            id="countryCode"
            name="countryCode"
            ref={countrySelectRef}
            onChange={handleCountryCodeChange}
            onInvalid={(e: React.FormEvent<HTMLSelectElement>) => {
              if (!e.currentTarget.value) {
                setServerErrors((prev) => ({
                  ...prev,
                  missingCountryCode: true,
                }));
              }
            }}
            className={classNames(
              'appearance-none pr-10 w-full border rounded-md p-3 bg-white placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:text-grey-500 data-[invalid=true]:border-alert-red data-[invalid=true]:shadow-inputError',
              {
                'border-black/30':
                  !serverErrors.missingCountryCode &&
                  !serverErrors.productNotAvailable &&
                  !serverErrors.unsupportedCountry,
                'border-alert-red shadow-inputError':
                  serverErrors.missingCountryCode ||
                  serverErrors.productNotAvailable ||
                  serverErrors.unsupportedCountry,
                'cursor-not-allowed': isLoading,
              }
            )}
            required
            aria-required
            aria-invalid={
              serverErrors.missingCountryCode ||
              serverErrors.productNotAvailable ||
              serverErrors.unsupportedCountry ||
              undefined
            }
            disabled={isLoading}
          >
            <Localized id="select-tax-location-country-code-placeholder">
              <option value="" disabled>
                Select your country
              </option>
            </Localized>
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
          <svg
            className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 9l-7 7-7-7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {serverErrors.missingCountryCode && (
          <Form.Message>
            <Localized id="select-tax-location-error-missing-country-code">
              <p className="mt-1 text-alert-red" role="alert">
                Please select your country
              </p>
            </Localized>
          </Form.Message>
        )}
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
        {serverErrors.invalidCurrencyChange && (
          <Form.Message>
            {currentCurrencyDisplayName ? (
              <Localized
                id="select-tax-location-invalid-currency-change"
                vars={{
                  currencyDisplayName: currentCurrencyDisplayName,
                }}
              >
                <p className="mt-1 text-alert-red" role="alert">
                  {`Your account is billed in ${currentCurrencyDisplayName}. Select a country that uses the ${currentCurrencyDisplayName}.`}
                </p>
              </Localized>
            ) : (
              <Localized id="select-tax-location-invalid-currency-change-default">
                <p className="mt-1 text-alert-red" role="alert">
                  Select a country that matches the currency of your active
                  subscriptions.
                </p>
              </Localized>
            )}
          </Form.Message>
        )}
      </Form.Field>

      <Form.Field name="postalCode">
        <Localized id="select-tax-location-postal-code-label">
          <Form.Label
            htmlFor="postalCode"
            className="text-grey-400 block mb-1 text-start"
          >
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
              className={classNames(
                'w-full border rounded-md p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError data-[invalid=true]:placeholder:text-alert-red',
                {
                  'border-black/30': !serverErrors.invalidPostalCode,
                  'border-alert-red text-alert-red shadow-inputError':
                    serverErrors.invalidPostalCode,
                  'cursor-not-allowed': isLoading,
                }
              )}
              name="postalCode"
              type="text"
              data-testid="postal-code"
              placeholder="Enter your postal code"
              onChange={() => {
                setServerErrors((prev) => ({
                  ...prev,
                  invalidPostalCode: false,
                }));
              }}
              onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                if (e?.currentTarget?.validity?.patternMismatch) {
                  setServerErrors((prev) => ({
                    ...prev,
                    invalidPostalCode: true,
                  }));
                }
              }}
              pattern="^[\p{L}\p{N}\s\-\.\,]{1,15}$"
              maxLength={15}
              defaultValue={initialPostalCode}
              required
              aria-required
              aria-invalid={serverErrors.invalidPostalCode || undefined}
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

      {showNewTaxRateInfoMessage && (
        <Localized id="select-tax-location-new-tax-rate-info">
          <p
            className="mt-1 text-sm"
            role="alert"
            aria-describedby="form-information"
          >
            Updating your location will apply the new tax rate to all active
            subscriptions on your account, starting with your next billing
            cycle.
          </p>
        </Localized>
      )}

      <div className="flex gap-4 justify-between items-center">
        {!buttonContent && (
          <BaseButton
            variant={ButtonVariant.Secondary}
            className="h-12 w-full"
            data-testid="tax-location-cancel-button"
            onClick={cancelAction}
            type="button"
          >
            <span>Cancel</span>
          </BaseButton>
        )}

        <Form.Submit asChild>
          <BaseButton
            variant={ButtonVariant.Primary}
            className="h-12 w-full"
            data-testid="tax-location-save-button"
            type="submit"
            disabled={blockingErrorExists || isLoading}
            aria-disabled={blockingErrorExists || isLoading}
            {...((buttonContent?.label || showNewTaxRateInfoMessage) && {
              'aria-describedby': 'form-information',
            })}
          >
            {isLoading ? (
              <>
                <span className="sr-only">Saving...</span>
                <Image
                  src={spinnerWhiteImage}
                  alt=""
                  className="absolute animate-spin h-8 w-8"
                />
              </>
            ) : buttonContent ? (
              <Localized id={buttonContent.ftlId}>
                <span>{buttonContent.label}</span>
              </Localized>
            ) : (
              <Localized id="select-tax-location-save-button">
                <span>Save</span>
              </Localized>
            )}
          </BaseButton>
        </Form.Submit>
      </div>
    </Form.Root>
  );
};

interface SelectTaxLocationProps {
  saveAction: SaveActionSignature;
  cmsCountries: string[];
  locale: string;
  productName: string;
  unsupportedLocations: string;
  countryCode: string | undefined;
  postalCode: string | undefined;
  currentCurrency: string;
  buttonContent?: {
    ftlId: string;
    label: string;
  };
  showNewTaxRateInfoMessage: boolean;
}

export function SelectTaxLocation({
  saveAction,
  cmsCountries,
  locale,
  productName,
  unsupportedLocations,
  countryCode,
  postalCode,
  currentCurrency,
  buttonContent,
  showNewTaxRateInfoMessage = false,
}: SelectTaxLocationProps) {
  const [expanded, setExpanded] = useState<boolean>(
    !countryCode || !postalCode
  );
  const [localLocation, setLocalLocation] = useState<{
    countryCode?: string;
    postalCode?: string;
  }>({ countryCode, postalCode });

  // This ensures that the localLocation always matches the
  // countryCode and postalCode passed into the component
  useEffect(() => {
    setLocalLocation({ countryCode, postalCode });
  }, [countryCode, postalCode]);

  const [alertStatus, setAlertStatus] = useState<boolean>(false);
  const cmsCountryCodes = cmsCountries.map((country) => country.slice(0, 2));

  return expanded ? (
    <Expanded
      cmsCountryCodes={cmsCountryCodes}
      locale={locale}
      productName={productName}
      unsupportedLocations={unsupportedLocations}
      initialCountryCode={countryCode}
      initialPostalCode={postalCode}
      currentCurrency={currentCurrency}
      saveAction={async (countryCode: string, postalCode: string) => {
        const result = await saveAction(countryCode, postalCode);
        if (result && result.ok) {
          setExpanded(false);
          setAlertStatus(true);
          setLocalLocation({
            countryCode: result.data.countryCode,
            postalCode: result.data.postalCode,
          });
        }
        return result;
      }}
      cancelAction={() => {
        setExpanded(false);
        setAlertStatus(false);
      }}
      buttonContent={buttonContent}
      showNewTaxRateInfoMessage={showNewTaxRateInfoMessage}
    />
  ) : (
    <Collapsed
      countryCode={localLocation.countryCode}
      postalCode={localLocation.postalCode}
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
  currentCurrency,
}: Omit<
  SelectTaxLocationProps,
  'countryCode' | 'postalCode' | 'currentCurrency'
> & {
  currentCurrency?: string;
}) {
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
      saveAction={async (countryCode: string, postalCode: string) => {
        setUpdatedCountryCode(countryCode);
        setUpdatedPostalCode(postalCode);
        return await saveAction(countryCode, postalCode);
      }}
      cmsCountryCodes={cmsCountryCodes}
      locale={locale}
      productName={productName}
      unsupportedLocations={unsupportedLocations}
      initialCountryCode={updatedCountryCode}
      initialPostalCode={updatedPostalCode}
      currentCurrency={currentCurrency}
      buttonContent={{
        ftlId: 'select-tax-location-continue-to-checkout-button',
        label: 'Continue to checkout',
      }}
    />
  );
}
