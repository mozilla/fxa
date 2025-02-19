/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import InputPhoneNumber from '../InputPhoneNumber';
import Banner from '../Banner';
import { BannerContentProps, BannerLinkProps } from '../Banner/interfaces';
import { GleanClickEventDataAttrs } from '../../lib/types';

export interface InputPhoneNumberData {
  phoneNumber: string;
  countryCode: string;
}

export type FormPhoneNumberProps = {
  infoBannerContent?: BannerContentProps;
  infoBannerLink?: BannerLinkProps;
  localizedCTAText: string;
  submitPhoneNumber: (phoneNumber: string) => Promise<{ hasErrors: boolean }>;
  errorBannerId?: string;
  gleanDataAttrs?: GleanClickEventDataAttrs;
};

const FormPhoneNumber = ({
  infoBannerContent,
  infoBannerLink,
  localizedCTAText,
  submitPhoneNumber,
  errorBannerId,
  gleanDataAttrs,
}: FormPhoneNumberProps) => {
  const [hasErrors, setHasErrors] = React.useState(false);
  const { control, formState, handleSubmit, register, setValue } =
    useForm<InputPhoneNumberData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        phoneNumber: '',
        countryCode: '',
      },
    });

  // Use `useWatch` to observe the `phoneNumber` field without causing re-renders
  const phoneNumberInput: string | undefined = useWatch({
    control,
    name: 'phoneNumber',
  });

  const formatPhoneNumber = ({
    phoneNumber,
    countryCode,
  }: InputPhoneNumberData) => {
    // Strip everything that isn't a number
    const strippedNumber = phoneNumber.replace(/\D/g, '');
    return countryCode + strippedNumber;
  };

  const onSubmit = async ({
    phoneNumber,
    countryCode,
  }: InputPhoneNumberData) => {
    setHasErrors(false);
    const formattedPhoneNumber = formatPhoneNumber({
      phoneNumber,
      countryCode,
    });
    const result = await submitPhoneNumber(formattedPhoneNumber);
    if (result !== undefined && result.hasErrors) {
      setHasErrors(true);
      const phoneInput = document.querySelector(
        'input[name="phoneNumber"]'
      ) as HTMLInputElement;
      phoneInput && phoneInput.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputPhoneNumber {...{ hasErrors, register, setValue, errorBannerId }} />

      {infoBannerContent && !infoBannerLink && (
        <Banner
          type="info"
          isFancy
          content={{
            localizedHeading: infoBannerContent.localizedHeading || '',
            localizedDescription: infoBannerContent.localizedDescription || '',
          }}
        />
      )}

      {infoBannerContent && infoBannerLink && (
        <Banner
          type="info"
          isFancy
          content={{
            localizedHeading: infoBannerContent.localizedHeading || '',
            localizedDescription: infoBannerContent.localizedDescription || '',
          }}
          link={{
            path: infoBannerLink.path || '',
            localizedText: infoBannerLink.localizedText || '',
          }}
        />
      )}

      <div className="flex mt-5">
        <button
          type="submit"
          className="cta-primary cta-xl"
          disabled={
            !formState.isDirty ||
            phoneNumberInput === undefined ||
            phoneNumberInput.replace(/\D/g, '').length !== 10
          }
          {...(gleanDataAttrs && {
            'data-glean-id': gleanDataAttrs.id,
            'data-glean-type': gleanDataAttrs.type,
            'data-glean-label': gleanDataAttrs.label,
          })}
        >
          {localizedCTAText}
        </button>
      </div>
    </form>
  );
};

export default FormPhoneNumber;
