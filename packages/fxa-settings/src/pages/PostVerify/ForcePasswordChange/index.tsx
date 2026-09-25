/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';
import FormPasswordWithInlineCriteria from '../../../components/FormPasswordWithInlineCriteria';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import {
  logViewEvent,
  logViewEventOnce,
  usePageViewEvent,
} from '../../../lib/metrics';
import { useFtlMsgResolver } from '../../../models';
import {
  ForcePasswordChangeFormData,
  ForcePasswordChangeProps,
} from './interfaces';

export const viewName = 'force-password-change';

export const ForcePasswordChange = ({
  email,
  changePasswordHandler,
}: ForcePasswordChangeProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();
  const [loading, setLoading] = useState(false);
  const [bannerErrorText, setBannerErrorText] = useState('');

  const { handleSubmit, register, getValues, formState, trigger } =
    useForm<ForcePasswordChangeFormData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        email,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    });

  const onSubmit = useCallback(
    async ({ oldPassword, newPassword }: ForcePasswordChangeFormData) => {
      logViewEvent('flow', `${viewName}.submit`, REACT_ENTRYPOINT);
      setBannerErrorText('');

      if (oldPassword === newPassword) {
        setBannerErrorText(
          getLocalizedErrorMessage(
            ftlMsgResolver,
            AuthUiErrors.PASSWORDS_MUST_BE_DIFFERENT
          )
        );
        return;
      }

      setLoading(true);
      const { error } = await changePasswordHandler(oldPassword, newPassword);
      if (error) {
        setBannerErrorText(getLocalizedErrorMessage(ftlMsgResolver, error));
        setLoading(false);
      }
    },
    [changePasswordHandler, ftlMsgResolver]
  );

  return (
    <AppLayout>
      <FtlMsg id="force-password-change-heading">
        <h1 id="fxa-force-password-change-header" className="card-header">
          Please change your password
        </h1>
      </FtlMsg>

      {bannerErrorText && (
        <Banner type="error" content={{ localizedHeading: bannerErrorText }} />
      )}

      <FtlMsg id="force-password-change-info">
        <p className="text-sm mt-6 mb-3">
          We detected suspicious behavior on your Mozilla account. To protect
          your account, please create a new password. You’ll use this password
          to sign back in to all of your Mozilla account services.
        </p>
      </FtlMsg>
      <FtlMsg id="force-password-change-data-info">
        <p className="text-sm mb-5">
          Synced history, bookmarks, logins, and other personal data will not be
          lost.
        </p>
      </FtlMsg>

      <FormPasswordWithInlineCriteria
        {...{
          formState,
          errors: formState.errors,
          trigger,
          register,
          getValues,
          email,
          loading,
        }}
        passwordFormType="force-password-change"
        onSubmit={handleSubmit(onSubmit)}
        onFocusMetricsEvent={() =>
          logViewEventOnce('flow', `${viewName}.engage`, REACT_ENTRYPOINT)
        }
      />
    </AppLayout>
  );
};

export default ForcePasswordChange;
