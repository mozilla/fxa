/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormPasswordWithInlineCriteria from '../FormPasswordWithInlineCriteria';
import { FormSetupAccountProps } from './interfaces';

export const FormSetupAccount = ({
  formState,
  errors,
  trigger,
  register,
  getValues,
  email,
  onFocusMetricsEvent,
  onSubmit,
  loading,
  isSync,
  offeredSyncEngineConfigs,
  submitButtonGleanId,
  passwordFormType = 'signup',
  cmsButton,
}: FormSetupAccountProps) => {
  // We receive a web channel message back from the browser which gives FxA
  // the available sync engines. This should never impact users since it's
  // immediate but we don't want to allow submission until we've received
  // the list from the browser.
  const disableSubmit = !!(isSync
    ? !offeredSyncEngineConfigs || loading
    : loading);

  return (
    <FormPasswordWithInlineCriteria
      loading={disableSubmit}
      {...{
        formState,
        errors,
        trigger,
        register,
        getValues,
        email,
        onFocusMetricsEvent,
        disableButtonUntilValid: true,
        onSubmit,
        submitButtonGleanId,
        passwordFormType,
        cmsButton,
      }}
      requirePasswordConfirmation={isSync}
    />
  );
};
