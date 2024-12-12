/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ButtonVariant } from '@fxa/payments/ui';
import { SubmitButton } from '../SubmitButton';

interface CollapsedProps {
  savedSelectedCountryCode: string | undefined;
  savedSelectedPostalCode: string | undefined;
  setSavedSelectedCountryCode: (value: string | undefined) => void;
  setSavedSelectedPostalCode: (value: string | undefined) => void;
  setSelectedCountryCode: (value: string | undefined) => void;
  setSelectedPostalCode: (value: string | undefined) => void;
}

const Collapsed = ({
  savedSelectedCountryCode,
  savedSelectedPostalCode,
  setSavedSelectedCountryCode,
  setSavedSelectedPostalCode,
  setSelectedCountryCode,
  setSelectedPostalCode,
}: CollapsedProps) => {
  return (
    <Form.Root
      action={async () => {
        setSelectedCountryCode(savedSelectedCountryCode);
        setSelectedPostalCode(savedSelectedPostalCode);
        setSavedSelectedCountryCode(undefined);
        setSavedSelectedPostalCode(undefined);
      }}
      className="flex gap-4 justify-between items-center"
      data-testid="tax-location-haslocation"
    >
      <span>
        {savedSelectedCountryCode}, {savedSelectedPostalCode}
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
  selectedCountryCode: string | undefined;
  selectedPostalCode: string | undefined;
  setSavedSelectedCountryCode: (value: string | undefined) => void;
  setSavedSelectedPostalCode: (value: string | undefined) => void;
  setSelectedCountryCode: (value: string | undefined) => void;
  setSelectedPostalCode: (value: string | undefined) => void;
}

type FormData = {
  countryCode: string;
  postalCode: string;
};

const Expanded = ({
  selectedCountryCode,
  selectedPostalCode,
  setSavedSelectedCountryCode,
  setSavedSelectedPostalCode,
  setSelectedCountryCode,
  setSelectedPostalCode,
}: ExpandedProps) => {
  const form = useForm<FormData>({
    defaultValues: {
      countryCode: selectedCountryCode,
      postalCode: selectedPostalCode,
    },
  });

  return (
    <Form.Root
      {...form}
      action={async () => {
        setSavedSelectedCountryCode(selectedCountryCode);
        setSavedSelectedPostalCode(selectedPostalCode);
      }}
      className="flex flex-col gap-4"
      data-testid="select-location-form"
    >
      <Form.Field name="countryCode">
        <Form.Label className="text-grey-400 block mb-1 text-start">
          <Localized id="select-tax-location-country-code-input">
            Country / Region
          </Localized>
        </Form.Label>
        <Form.Control asChild>
          <Select.Root
            defaultValue={selectedCountryCode}
            name="countryCode"
            onValueChange={setSelectedCountryCode}
            required
            aria-required
          >
            <Select.Trigger asChild aria-label="country">
              <button className="flex items-center justify-between gap-4 w-full border rounded-md border-black/30 p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError">
                <Select.Value
                  placeholder={
                    selectedCountryCode || 'Select your country/region'
                  }
                />
                <Select.Icon>
                  <ChevronDownIcon />
                </Select.Icon>
              </button>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-10">
                <Select.ScrollUpButton className="flex items-center justify-center">
                  <ChevronUpIcon />
                </Select.ScrollUpButton>
                <Select.Viewport className="bg-white p-2 rounded-lg shadow-lg">
                  <Select.Group>
                    {['US', 'CA', 'DE', 'FR', 'CN'].map((code, idx) => (
                      <Select.Item
                        disabled={code === 'CN'}
                        key={`${code}-${idx}`}
                        value={code}
                        className="relative flex items-center px-8 py-2 rounded-md focus:text-white focus:bg-blue-500"
                      >
                        <Select.ItemText>{code}</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <CheckIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton className="flex items-center justify-center">
                  <ChevronDownIcon />
                </Select.ScrollDownButton>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </Form.Control>
        <Form.Message match="valueMissing">
          <Localized id="select-tax-location-error-missing-country-code">
            <p className="mt-1 text-alert-red" role="alert">
              Please select your country/region
            </p>
          </Localized>
        </Form.Message>
      </Form.Field>

      <Form.Field name="postalCode">
        <Form.Label className="text-grey-400 block mb-1 text-start">
          <Localized id="select-tax-location-postal-code-input">
            Postal Code
          </Localized>
        </Form.Label>
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
              setSelectedPostalCode(e.target.value);
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
      </Form.Field>

      <Form.Submit asChild>
        <SubmitButton
          className="w-full"
          type="submit"
          data-testid="tax-location-save-button"
          variant={ButtonVariant.Secondary}
          onClick={() => {
            console.log('hi', selectedCountryCode, selectedPostalCode);
          }}
        >
          <Localized id="select-tax-location-save-button">Save</Localized>
        </SubmitButton>
      </Form.Submit>
    </Form.Root>
  );
};

interface SelectTaxLocationProps {
  countryCode: string | undefined;
  postalCode: string | undefined;
}

export function SelectTaxLocation({
  countryCode,
  postalCode,
}: SelectTaxLocationProps) {
  const [savedSelectedCountryCode, setSavedSelectedCountryCode] = useState<
    string | undefined
  >();
  const [savedSelectedPostalCode, setSavedSelectedPostalCode] = useState<
    string | undefined
  >();
  const [selectedCountryCode, setSelectedCountryCode] = useState<
    string | undefined
  >();
  const [selectedPostalCode, setSelectedPostalCode] = useState<
    string | undefined
  >();

  useEffect(() => {
    const formData = new FormData();

    if (countryCode) {
      setSavedSelectedCountryCode(countryCode);
      setSelectedCountryCode(countryCode);
      formData.set('countryCode', countryCode);
    }

    if (postalCode) {
      setSavedSelectedPostalCode(postalCode);
      setSelectedPostalCode(postalCode);
      formData.set('postalCode', postalCode);
    }
  }, []);

  return (
    <div
      className="bg-white rounded-b-lg shadow-sm shadow-grey-300 mt-6 p-4 rounded-t-lg text-base tablet:my-8"
      aria-label="Tax location form"
    >
      <h2 className="m-0 mb-4 font-semibold text-grey-600">
        <Localized id="select-tax-location-title">Location</Localized>
      </h2>

      {savedSelectedCountryCode && savedSelectedPostalCode ? (
        <Collapsed
          savedSelectedCountryCode={savedSelectedCountryCode}
          savedSelectedPostalCode={savedSelectedPostalCode}
          setSavedSelectedCountryCode={setSavedSelectedCountryCode}
          setSavedSelectedPostalCode={setSavedSelectedPostalCode}
          setSelectedCountryCode={setSelectedCountryCode}
          setSelectedPostalCode={setSelectedPostalCode}
        />
      ) : (
        <Expanded
          selectedCountryCode={selectedCountryCode}
          selectedPostalCode={selectedPostalCode}
          setSavedSelectedCountryCode={setSavedSelectedCountryCode}
          setSavedSelectedPostalCode={setSavedSelectedPostalCode}
          setSelectedCountryCode={setSelectedCountryCode}
          setSelectedPostalCode={setSelectedPostalCode}
        />
      )}
    </div>
  );
}
