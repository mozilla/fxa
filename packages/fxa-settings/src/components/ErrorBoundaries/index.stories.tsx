/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { AppError } from '.';
import AppLayout from '../AppLayout';
import {
  GenericData,
  ModelValidationErrors,
  UrlQueryData,
} from '../../lib/model-data';
import { withLocalization } from 'fxa-react/lib/storybooks';

import { Meta } from '@storybook/react';
import { OAuthQueryParams } from '../../models/pages/signin';
import { ReachRouterWindow } from '../../lib/window';

export default {
  title: 'Components/AppError',
  component: AppError,
  decorators: [withLocalization],
} as Meta;

export const DefaultAppError = () => <AppError />;

export const QueryParamValidationError = () => {
  // Contrive a validation error. There should be validation errors
  // since this model contains required values.
  let validationError: Error | undefined = undefined;
  try {
    const model = new OAuthQueryParams(
      new UrlQueryData({
        location: {
          search: '',
        },
        navigate: function () {},
      } as unknown as ReachRouterWindow)
    );
    model.validate();
  } catch (error) {
    validationError = error;
  }

  // AppError should display a list of the validation errors
  return <AppError error={validationError} />;
};
