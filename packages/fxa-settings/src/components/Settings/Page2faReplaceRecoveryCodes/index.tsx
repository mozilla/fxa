/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import DataBlock from '../../DataBlock';
import InputText from '../../InputText';
import { SETTINGS_PATH } from '../../../constants';
import {
  useAccount,
  useAlertBar,
  useConfig,
  useFtlMsgResolver,
  useSession,
} from '../../../models';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { copyRecoveryCodes } from '../../../lib/totp';
import { FtlMsg } from 'fxa-react/lib/utils';
import { GleanClickEventType2FA } from '../../../lib/types';

export const Page2faReplaceRecoveryCodes = (_: RouteComponentProps) => {
  const alertBar = useAlertBar();
  const navigate = useNavigate();
  const session = useSession();
  const account = useAccount();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();

  const goHome = () =>
    navigate(SETTINGS_PATH + '#two-step-authentication', { replace: true });

  const [subtitle, setSubtitle] = useState<string>(
    ftlMsgResolver.getMsg('tfa-replace-code-1-2', 'Step 1 of 2')
  );
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodesAcknowledged, setRecoveryCodesAcknowledged] =
    useState<boolean>(false);

  const alertSuccessAndGoHome = () => {
    alertBar.success(
      ftlMsgResolver.getMsg(
        'tfa-replace-code-success-alert-3',
        'Account backup authentication codes updated'
      )
    );
    navigate(SETTINGS_PATH + '#two-step-authentication', { replace: true });
  };

  const onRecoveryCodeSubmit = async (_: RecoveryCodeForm) => {
    try {
      const { success } = await account.updateRecoveryCodes(recoveryCodes);

      if (!success)
        throw new Error('Update backup authentication codes not successful.');

      alertSuccessAndGoHome();
    } catch (e) {
      alertBar.error(
        ftlMsgResolver.getMsg(
          'tfa-replace-code-error-3',
          'There was a problem replacing your backup authentication codes'
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
        ftlMsgResolver.getMsg(
          'tfa-create-code-error',
          'There was a problem creating your backup authentication codes'
        )
      );
    }
  }, [config, account, alertBar, ftlMsgResolver]);

  const activateStep = (step: number) => {
    switch (step) {
      case 1:
        setSubtitle(
          ftlMsgResolver.getMsg('tfa-replace-code-1-2', 'Step 1 of 2')
        );
        setRecoveryCodesAcknowledged(false);
        break;

      case 2:
        setSubtitle(
          ftlMsgResolver.getMsg('tfa-replace-code-2-2', 'Step 2 of 2')
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
      title={ftlMsgResolver.getMsg('tfa-title', 'Two-step authentication')}
      {...{ subtitle, onBackButtonClick: moveBack }}
    >
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />

      {!recoveryCodesAcknowledged && (
        <>
          <div className="my-2" data-testid="2fa-recovery-codes">
            <FtlMsg id="tfa-replace-code-success-1">
              New codes have been created. Save these one-time use backup
              authentication codes in a safe place — you’ll need them to access
              your account if you don’t have your mobile device.
            </FtlMsg>
            <div className="mt-6 flex flex-col items-center h-auto justify-between">
              {recoveryCodes.length > 0 ? (
                <DataBlock
                  value={recoveryCodes}
                  separator=" "
                  onCopy={copyRecoveryCodes}
                  contentType="Backup authentication codes"
                  email={account.email}
                  gleanDataAttrs={{
                    download: {
                      id: 'two_step_auth_codes_download',
                      type: GleanClickEventType2FA.replace,
                    },
                    copy: {
                      id: 'two_step_auth_codes_copy',
                      type: GleanClickEventType2FA.replace,
                    },
                    print: {
                      id: 'two_step_auth_codes_print',
                      type: GleanClickEventType2FA.replace,
                    },
                  }}
                />
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </div>
          <div className="flex justify-center mt-6 mb-4 mx-auto max-w-64">
            <FtlMsg id="tfa-button-cancel">
              <button
                type="button"
                className="cta-neutral cta-base-p mx-2 flex-1"
                onClick={goHome}
                data-glean-id="two_step_auth_codes_cancel"
                data-glean-type="replace"
              >
                Cancel
              </button>
            </FtlMsg>
            <FtlMsg id="tfa-button-continue">
              <button
                type="submit"
                className="cta-neutral mx-2 px-10 py-2"
                data-testid="ack-recovery-code"
                data-glean-id="two_step_auth_codes_submit"
                data-glean-type="replace"
                onClick={() => {
                  activateStep(2);
                }}
              >
                Continue
              </button>
            </FtlMsg>
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
  const ftlMsgResolver = useFtlMsgResolver();

  const [recoveryCodeError, setRecoveryCodeError] = useState<string>('');

  const recoveryCodeForm = useForm<RecoveryCodeForm>({
    mode: 'onTouched',
  });

  const onSubmit = async ({ recoveryCode }: RecoveryCodeForm) => {
    if (!recoveryCodes.includes(recoveryCode)) {
      setRecoveryCodeError(
        ftlMsgResolver.getMsg(
          'tfa-incorrect-recovery-code-1',
          'Incorrect backup authentication code'
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
      <FtlMsg id="tfa-enter-code-to-confirm-1">
        <p className="mt-4 mb-4">
          Please enter one of your backup authentication codes now to confirm
          you've saved it. You’ll need a code to login if you don’t have access
          to your mobile device.
        </p>
      </FtlMsg>
      <div className="mt-4 mb-6" data-testid="recovery-code-input">
        <FtlMsg id="tfa-enter-recovery-code-1" attrs={{ label: true }}>
          <InputText
            name="recoveryCode"
            label="Enter a backup authentication code"
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
        </FtlMsg>
      </div>
      <div className="flex justify-center mb-4 mx-auto max-w-64">
        {cancellable && (
          <FtlMsg id="tfa-button-cancel">
            <button
              type="button"
              className="cta-neutral cta-base-p mx-2 flex-1"
              onClick={goHome}
            >
              Cancel
            </button>
          </FtlMsg>
        )}
        <FtlMsg id="tfa-button-finish">
          <button
            type="submit"
            data-testid="submit-recovery-code"
            className="cta-primary cta-base-p mx-2 flex-1"
            disabled={
              !recoveryCodeForm.formState.isDirty ||
              !recoveryCodeForm.formState.isValid
            }
            data-glean-id="two_step_auth_enter_code_submit"
            data-glean-type="replace"
          >
            Finish
          </button>
        </FtlMsg>
      </div>
    </form>
  );
};
