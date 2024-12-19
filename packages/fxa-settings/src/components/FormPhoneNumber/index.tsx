/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useForm } from 'react-hook-form';
import InputPhoneNumber from '../InputPhoneNumber';
import Banner from '../Banner';

export interface InputPhoneNumberData {
  phoneNumber: string;
  countryCode: string;
}

const FormPhoneNumber = ({
  showInfo = false,
  localizedCTAText,
}: {
  showInfo?: boolean;
  localizedCTAText: string;
}) => {
  const { handleSubmit, register, formState } = useForm<InputPhoneNumberData>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      phoneNumber: '',
      countryCode: '',
    },
  });

  const onSubmit = async ({
    phoneNumber,
    countryCode,
  }: InputPhoneNumberData) => {
    // Strip everything that isn't a number
    const strippedNumber = phoneNumber.replace(/\D/g, '');
    const formattedPhoneNumber = countryCode + strippedNumber;

    // TODO, actually send this value where needed
    alert(`formattedPhoneNumber: ${formattedPhoneNumber}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputPhoneNumber {...{ register }} />

      {showInfo && (
        <Banner type="info" content={{ localizedHeading: 'TODO' }} />
      )}

      <div className="flex mt-5">
        <button
          type="submit"
          className="cta-primary cta-xl"
          disabled={!formState.isValid || !formState.touched}
        >
          {localizedCTAText}
        </button>
      </div>
    </form>
  );
};

export default FormPhoneNumber;
