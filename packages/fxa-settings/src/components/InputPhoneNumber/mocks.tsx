/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InputPhoneNumber, { defaultCountries, phoneNorthAmerica } from '.';
import { useForm } from 'react-hook-form';
import AppLayout from '../AppLayout';
import { InputPhoneNumberData } from '../FormPhoneNumber';

export const extendedCountryOptions = [
  ...defaultCountries,
  {
    id: 100,
    code: '+44',
    classNameFlag: 'bg-flag-usa',
    name: 'Murica',
    ftlId: 'fake-ftl-id',
    ...phoneNorthAmerica,
  },
  {
    id: 101,
    code: '+11',
    classNameFlag: 'bg-flag-canada',
    name: 'Sorry Canada',
    ftlId: 'fake-ftl-id',
    ...phoneNorthAmerica,
  },
  {
    id: 103,
    code: '+50',
    classNameFlag: 'bg-flag-usa',
    name: 'Eagle Country',
    ftlId: 'fake-ftl-id',
    ...phoneNorthAmerica,
  },
  {
    id: 104,
    code: '+27',
    classNameFlag: 'bg-flag-canada',
    name: 'Maple Country',
    ftlId: 'fake-ftl-id',
    ...phoneNorthAmerica,
  },
];

export const Subject = ({ countries = defaultCountries }) => {
  const { register } = useForm<InputPhoneNumberData>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      phoneNumber: '',
      countryCode: '',
    },
  });

  return (
    <AppLayout>
      <InputPhoneNumber {...{ register, countries }} />
    </AppLayout>
  );
};
