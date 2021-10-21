/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useAccount, useAlertBar } from '../../models';
import InputPassword from '../InputPassword';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import {
  HomePath,
  LockwiseLink,
  MonitorLink,
  ROOTPATH,
  VPNLink,
} from '../../constants';
import {
  logPageViewEvent,
  logViewEvent,
  settingsViewName,
} from '../../lib/metrics';
import { Checkbox } from '../Checkbox';
import { useLocalization } from '@fluent/react';
import { Localized } from '@fluent/react';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

type FormData = {
  password: string;
};

const checkboxLabels = [
  'delete-account-chk-box-1',
  'delete-account-chk-box-2',
  'delete-account-chk-box-3',
  'delete-account-chk-box-4',
];

export const PageDeleteAccount = (_: RouteComponentProps) => {
  const account = useAccount();
  if (account.metricsEnabled) {
    logPageViewEvent(settingsViewName);
  }
  const { l10n } = useLocalization();
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
  const [subtitleText, setSubtitleText] = useState<string>(
    l10n.getString('delete-account-step-1-2')
  );
  const [checkedBoxes, setCheckedBoxes] = useState<string[]>([]);
  const allBoxesChecked = checkboxLabels.every((element) =>
    checkedBoxes.includes(element)
  );
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goHome = useCallback(() => window.history.back(), []);

  const advanceStep = () => {
    setSubtitleText(l10n.getString('delete-account-step-2-2'));
    setConfirmed(true);
    if (account.metricsEnabled) {
      logViewEvent('flow.settings.account-delete', 'terms-checked.success');
    }
  };

  const deleteAccount = useCallback(
    async (password: string) => {
      try {
        await account.destroy(password);
        if (account.metricsEnabled) {
          logViewEvent(
            'flow.settings.account-delete',
            'confirm-password.success'
          );
        }
        // must use location.href over navigate() since this is an external link
        window.location.href = `${ROOTPATH}?delete_account_success=true`;
      } catch (e) {
        const localizedError = l10n.getString(
          `auth-error-${AuthUiErrors.INCORRECT_PASSWORD.errno}`,
          null,
          AuthUiErrors.INCORRECT_PASSWORD.message
        );
        if (e.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
          setErrorText(localizedError);
          setValue('password', '');
        } else {
          alertBar.error(localizedError);

          if (account.metricsEnabled) {
            logViewEvent(
              'flow.settings.account-delete',
              'confirm-password.fail'
            );
          }
        }
      }
    },
    [account, l10n, setErrorText, setValue, alertBar]
  );

  const handleConfirmChange =
    (labelText: string) => (event: ChangeEvent<HTMLInputElement>) => {
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
    deleteAccount(password);
  };

  return (
    <Localized id="delete-account-header" attrs={{ title: true }}>
      <FlowContainer title="Delete account" subtitle={subtitleText}>
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
        {!confirmed && (
          <div className="my-4 text-sm" data-testid="delete-account-confirm">
            <Localized id="delete-account-confirm-title-2">
              <p className="mb-4">
                You've connected your Firefox account to Mozilla products that
                keep you secure and productive on the web:
              </p>
            </Localized>
            <div className="p-2">
              <ul className="list-inside mb-4">
                <li className="list-disc">
                  <a className="link-blue" href={VPNLink}>
                    <Localized id="product-mozilla-vpn">Mozilla VPN</Localized>
                  </a>
                </li>
                <li className="list-disc">
                  <a className="link-blue" href={LockwiseLink}>
                    <Localized id="firefox-lockwise">
                      Firefox Lockwise
                    </Localized>
                  </a>
                </li>
                <li className="list-disc">
                  <a className="link-blue" href={MonitorLink}>
                    <Localized id="product-firefox-monitor">
                      Firefox Monitor
                    </Localized>
                  </a>
                </li>
              </ul>
            </div>
            <Localized id="delete-account-acknowledge">
              <p className="mb-4">
                Please acknowledge that by deleting your account:
              </p>
            </Localized>
            <form>
              <ul className="mt-4 text-xs">
                {checkboxLabels.map((label, i) => (
                  <li className="py-2" key={i}>
                    <Localized id={label} attrs={{ label: true }}>
                      <Checkbox
                        data-testid="required-confirm"
                        label={label}
                        onChange={handleConfirmChange(label)}
                      />
                    </Localized>
                  </li>
                ))}
              </ul>
            </form>
            <div className="mt-4 flex items-center justify-center">
              <Localized id="delete-account-cancel-button">
                <button
                  className="cta-neutral mx-2 px-10"
                  onClick={() =>
                    navigate(HomePath + '#delete-account', { replace: true })
                  }
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
              </Localized>
              <Localized id="delete-account-continue-button">
                <button
                  className="cta-primary mx-2 px-10"
                  disabled={!allBoxesChecked}
                  onClick={() => advanceStep()}
                  data-testid="continue-button"
                >
                  Continue
                </button>
              </Localized>
            </div>
          </div>
        )}
        {confirmed && (
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="mt-4 mb-6" data-testid="delete-account-input">
              <Localized
                id="delete-account-password-input"
                attrs={{ label: true }}
              >
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
                    minLength: 8,
                  })}
                  {...{ errorText }}
                />
              </Localized>
            </div>

            <div className="flex items-center justify-center">
              <Localized id="delete-account-cancel-button">
                <button
                  type="button"
                  className="cta-neutral mx-2 px-4 tablet:px-10"
                  data-testid="cancel-button"
                  onClick={goHome}
                >
                  Cancel
                </button>
              </Localized>
              <Localized id="delete-account-delete-button-2">
                <button
                  type="submit"
                  className="cta-caution mx-2 px-4 tablet:px-10"
                  data-testid="delete-account-button"
                  disabled={disabled}
                >
                  Delete
                </button>
              </Localized>
            </div>
          </form>
        )}
      </FlowContainer>
    </Localized>
  );
};

export default PageDeleteAccount;
