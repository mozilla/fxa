/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { AppError } from '.';
import AppLayout from '../AppLayout';
import { GenericData, ModelValidationErrors } from '../../lib/model-data';
import { withLocalization } from 'fxa-react/lib/storybooks';

import { OAuthIntegrationData } from '../../models';
import { Meta } from '@storybook/react';
import { OAuthQueryParams } from '../../models/pages/signin';

export default {
  title: 'Components/AppError',
  component: AppError,
  decorators: [withLocalization],
} as Meta;

export const DefaultAppError = () => (
  <AppLayout>
    <AppError />
  </AppLayout>
);

export const QueryParamValidationError = () => {
  // Contrive a validation error. There should validation errors
  // since this model contains required values
  let validationError: Error | undefined = undefined;
  try {
    const model = new OAuthQueryParams(new GenericData({}));
    model.validate();
  } catch (error) {
    validationError = error;
  }

  if (validationError instanceof ModelValidationErrors) {
    validationError.condition = 'QueryParameterValidation';
  }

  // AppError should display a list of the validation errors
  return (
    <AppLayout>
      <AppError error={validationError} />
    </AppLayout>
  );
};
