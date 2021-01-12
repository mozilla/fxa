/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useAccountDestroyer } from '../../lib/auth';
import { sessionToken } from '../../lib/cache';
import { useAlertBar } from '../../lib/hooks';
import { useAccount } from '../../models';
import InputPassword from '../InputPassword';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';
import {
  HomePath,
  LockwiseLink,
  MonitorLink,
  ROOTPATH,
  VPNLink,
} from '../../constants';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { Checkbox } from '../Checkbox';

type FormData = {
  password: string;
};

const checkboxLabels = [
  'Any paid subscriptions you have will be cancelled',
  'Any may lose saved information and features within Mozilla products',
  'Reactivating with this email may not restore your saved information',
  'Any extensions and themes that you published to addons.mozilla.org will be deleted',
];

export const PageDeleteAccount = (_: RouteComponentProps) => {
  usePageViewEvent('settings.delete-account');
  const { handleSubmit, register, formState, setValue } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  });
  // TODO: the `.errors.password` clause shouldn't be necessary, but `isValid` isn't updating
  // properly. I think this is a bug in react-hook-form.
  const disabled =
    !formState.isDirty || !formState.isValid || !!formState.errors.password;
  const [errorText, setErrorText] = useState<string>();
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [subtitleText, setSubtitleText] = useState<string>('Step 1 of 2');
  const [checkedBoxes, setCheckedBoxes] = useState<string[]>([]);
  const allBoxesChecked = checkboxLabels.every((element) =>
    checkedBoxes.includes(element)
  );
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goBack = useCallback(() => window.history.back(), []);

  const { primaryEmail } = useAccount();

  const advanceStep = () => {
    setSubtitleText('Step 2 of 2');
    setConfirmed(true);

    logViewEvent('flow.settings.account-delete', 'terms-checked.success');
  };

  const deleteAccount = useAccountDestroyer({
    onSuccess: () => {
      // must use location.href over navigate() since this is an exernal link
      window.location.href = `${ROOTPATH}?delete_account_success=true`;
      logViewEvent('flow.settings.account-delete', 'confirm-password.success');
    },
    onError: (error) => {
      if (error.errno === 103) {
        setErrorText(error.message);
        setValue('password', '');
      } else {
        alertBar.setType('error');
        alertBar.setContent(error.message);
        alertBar.show();
        logViewEvent('flow.settings.account-delete', 'confirm-password.fail');
      }
    },
  });

  const handleConfirmChange = (labelText: string) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.persist();
    setCheckedBoxes((existing) => {
      if (event.target.checked) {
        return [...existing, labelText];
      } else {
        return [...existing.filter((text) => text !== labelText)];
      }
    });
  };

  const onFormSubmit = ({ password }: FormData) => {
    deleteAccount.execute(primaryEmail.email, password, sessionToken()!);
  };

  return (
    <FlowContainer title="Delete Account" subtitle={subtitleText}>
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="delete-account-error">{alertBar.content}</p>
        </AlertBar>
      )}
      <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />
      {!confirmed && (
        <div className="my-4 text-sm" data-testid="delete-account-confirm">
          <p className="mb-4">
            You've connected your Firefox account to Mozilla products that keep
            you secure and productive on the web:
          </p>
          <div className="p-2">
            <ul className="list-inside mb-4">
              <li className="list-disc">
                <a className="link-blue" href={VPNLink}>
                  Mozilla VPN
                </a>
              </li>
              <li className="list-disc">
                <a className="link-blue" href={LockwiseLink}>
                  Firefox Lockwise
                </a>
              </li>
              <li className="list-disc">
                <a className="link-blue" href={MonitorLink}>
                  Firefox Monitor
                </a>
              </li>
            </ul>
          </div>
          <p className="mb-4">
            Please acknowledge that by deleting your account:
          </p>
          <form>
            <ul className="mt-4 text-xs">
              {checkboxLabels.map((label, i) => (
                <li className="py-2" key={i}>
                  <Checkbox
                    data-testid="required-confirm"
                    label={label}
                    onChange={handleConfirmChange(label)}
                  />
                </li>
              ))}
            </ul>
          </form>
          <div className="mt-4 flex items-center justify-center">
            <button
              className="cta-neutral mx-2 px-10"
              onClick={() => navigate(HomePath, { replace: true })}
              data-testid="close-button"
            >
              Close
            </button>
            <button
              className="cta-primary mx-2 px-10"
              disabled={!allBoxesChecked}
              onClick={() => advanceStep()}
              data-testid="continue-button"
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {confirmed && (
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="mt-4 mb-6" data-testid="delete-account-input">
            <InputPassword
              name="password"
              label="Enter password"
              prefixDataTestId="delete-account-confirm"
              onChange={() => {
                if (errorText) {
                  setErrorText(undefined);
                }
              }}
              inputRef={register({
                required: true,
              })}
              {...{ errorText }}
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              className="cta-neutral mx-2 px-4 tablet:px-10"
              data-testid="cancel-button"
              onClick={goBack}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cta-primary mx-2 px-4"
              data-testid="delete-account-button"
              disabled={disabled}
            >
              Delete Account
            </button>
          </div>
        </form>
      )}
    </FlowContainer>
  );
};

export default PageDeleteAccount;
