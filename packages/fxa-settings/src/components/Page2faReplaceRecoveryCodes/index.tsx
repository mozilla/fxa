/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import DataBlock from '../DataBlock';
import InputText from '../InputText';
import { HomePath } from '../../constants';
import { useAccount, useAlertBar, useConfig, useSession } from '../../models';
import { useLocalization, Localized } from '@fluent/react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { copyRecoveryCodes } from '../../lib/totp';

export const Page2faReplaceRecoveryCodes = (_: RouteComponentProps) => {
  const alertBar = useAlertBar();
  const navigate = useNavigate();
  const session = useSession();
  const account = useAccount();
  const config = useConfig();
  const { l10n } = useLocalization();

  const goHome = () =>
    navigate(HomePath + '#two-step-authentication', { replace: true });

  const [subtitle, setSubtitle] = useState<string>(
    l10n.getString('tfa-replace-code-1-2', null, 'Step 1 of 2')
  );
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodesAcknowledged, setRecoveryCodesAcknowledged] =
    useState<boolean>(false);

  const alertSuccessAndGoHome = () => {
    alertBar.success(
      l10n.getString(
        'tfa-replace-code-success-alert',
        null,
        'Account recovery codes updated.'
      )
    );
    navigate(HomePath + '#two-step-authentication', { replace: true });
  };

  const onRecoveryCodeSubmit = async (_: RecoveryCodeForm) => {
    try {
      const { success } = await account.updateRecoveryCodes(recoveryCodes);

      if (!success) throw new Error('Update recovery codes not successful.');

      alertSuccessAndGoHome();
    } catch (e) {
      alertBar.error(
        l10n.getString(
          'tfa-replace-code-error',
          null,
          'There was a problem replacing your recovery codes.'
        )
      );
    }
  };

  const createRecoveryCodes = useCallback(async () => {
    try {
      if (
        !config.recoveryCodes ||
        !config.recoveryCodes.count ||
        !config.recoveryCodes.length
      ) {
        throw new Error('Invalid config for recoveryCodes.');
      }

      const recoveryCodes = await account.generateRecoveryCodes(
        config.recoveryCodes.count,
        config.recoveryCodes.length
      );
      setRecoveryCodes(recoveryCodes);
    } catch (e) {
      alertBar.error(
        l10n.getString(
          'tfa-replace-code-error',
          null,
          'There was a problem creating your recovery codes.'
        )
      );
    }
  }, [config, account, alertBar, l10n]);

  const activateStep = (step: number) => {
    switch (step) {
      case 1:
        setSubtitle(
          l10n.getString('tfa-replace-code-1-2', null, 'Step 1 of 2')
        );
        setRecoveryCodesAcknowledged(false);
        break;

      case 2:
        setSubtitle(
          l10n.getString('tfa-replace-code-2-2', null, 'Step 2 of 2')
        );
        setRecoveryCodesAcknowledged(true);
        break;

      default:
        throw new Error(`Invalid step ${step}`);
    }
  };

  const moveBack = () => {
    if (!recoveryCodesAcknowledged) {
      return goHome();
    }
    return activateStep(1);
  };

  useEffect(() => {
    session.verified && recoveryCodes.length < 1 && createRecoveryCodes();
  }, [session, recoveryCodes, createRecoveryCodes]);

  return (
    <FlowContainer
      title={l10n.getString('tfa-title', null, 'Two-step authentication')}
      {...{ subtitle, onBackButtonClick: moveBack }}
    >
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />

      {!recoveryCodesAcknowledged && (
        <>
          <div className="my-2" data-testid="2fa-recovery-codes">
            <Localized id="tfa-replace-code-success">
              New codes have been created. Save these one-time use codes in a
              safe place — you’ll need them to access your account if you don’t
              have your mobile device.
            </Localized>
            <div className="mt-6 flex flex-col items-center h-auto justify-between">
              {recoveryCodes.length > 0 ? (
                <DataBlock
                  value={recoveryCodes}
                  separator=" "
                  onCopy={copyRecoveryCodes}
                />
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </div>
          <div className="flex justify-center mt-6 mb-4 mx-auto max-w-64">
            <Localized id="tfa-button-cancel">
              <button
                type="button"
                className="cta-neutral mx-2 flex-1"
                onClick={goHome}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="recovery-key-continue-button">
              <button
                type="submit"
                className="cta-neutral mx-2 px-10"
                data-testid="ack-recovery-code"
                onClick={() => {
                  activateStep(2);
                }}
              >
                Continue
              </button>
            </Localized>
          </div>
        </>
      )}

      {recoveryCodesAcknowledged && (
        <RecoveryCodeCheck
          recoveryCodes={recoveryCodes}
          goHome={goHome}
          onRecoveryCodeSubmit={onRecoveryCodeSubmit}
          cancellable={true}
        />
      )}
    </FlowContainer>
  );
};

// TODO: Reuse RecoveryCodeCheck in PageTwoStepAuthentication
type RecoveryCodeForm = { recoveryCode: string };
type RecoverCodeCheckType = {
  cancellable: boolean;
  recoveryCodes: string[];
  onRecoveryCodeSubmit: ({ recoveryCode }: RecoveryCodeForm) => Promise<void>;
  goHome: () => void;
};
const RecoveryCodeCheck = ({
  cancellable,
  recoveryCodes,
  goHome,
  onRecoveryCodeSubmit,
}: RecoverCodeCheckType) => {
  const { l10n } = useLocalization();

  const [recoveryCodeError, setRecoveryCodeError] = useState<string>('');

  const recoveryCodeForm = useForm<RecoveryCodeForm>({
    mode: 'onTouched',
  });

  const onSubmit = async ({ recoveryCode }: RecoveryCodeForm) => {
    if (!recoveryCodes.includes(recoveryCode)) {
      setRecoveryCodeError(
        l10n.getString(
          'tfa-incorrect-recovery-code',
          null,
          'Incorrect recovery code'
        )
      );
      return;
    }

    await onRecoveryCodeSubmit({ recoveryCode });
  };

  const isValidRecoveryCodeFormat = (recoveryCode: string) =>
    /\w/.test(recoveryCode);

  return (
    <form onSubmit={recoveryCodeForm.handleSubmit(onSubmit)}>
      <Localized id="tfa-enter-code-to-confirm">
        <p className="mt-4 mb-4">
          Please enter one of your recovery codes now to confirm you've saved
          it. You'll need a code if you lose your device and want to access your
          account.
        </p>
      </Localized>
      <div className="mt-4 mb-6" data-testid="recovery-code-input">
        <Localized id="tfa-enter-recovery-code" attrs={{ label: true }}>
          <InputText
            name="recoveryCode"
            label="Enter a recovery code"
            prefixDataTestId="recovery-code"
            autoFocus
            onChange={() => {
              setRecoveryCodeError('');
              recoveryCodeForm.trigger('recoveryCode');
            }}
            inputRef={recoveryCodeForm.register({
              validate: isValidRecoveryCodeFormat,
            })}
            {...{ errorText: recoveryCodeError }}
          />
        </Localized>
      </div>
      <div className="flex justify-center mb-4 mx-auto max-w-64">
        {cancellable && (
          <Localized id="tfa-button-cancel">
            <button
              type="button"
              className="cta-neutral mx-2 flex-1"
              onClick={goHome}
            >
              Cancel
            </button>
          </Localized>
        )}
        <Localized id="tfa-button-finish">
          <button
            type="submit"
            data-testid="submit-recovery-code"
            className="cta-primary mx-2 flex-1"
            disabled={
              !recoveryCodeForm.formState.isDirty ||
              !recoveryCodeForm.formState.isValid
            }
          >
            Finish
          </button>
        </Localized>
      </div>
    </form>
  );
};
