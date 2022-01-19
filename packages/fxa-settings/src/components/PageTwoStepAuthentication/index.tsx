/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import FlowContainer from '../FlowContainer';
import InputText from '../InputText';
import LinkExternal from 'fxa-react/components/LinkExternal';
import React, { useCallback, useEffect, useState } from 'react';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import DataBlock from '../DataBlock';
import { useAccount, useAlertBar, useSession } from '../../models';
import { checkCode, copyRecoveryCodes, getCode } from '../../lib/totp';
import { HomePath } from '../../constants';
import { logViewEvent, useMetrics } from '../../lib/metrics';
import { Localized, useLocalization } from '@fluent/react';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { useAsync } from 'react-async-hook';

export const metricsPreInPostFix = 'settings.two-step-authentication';

type TotpForm = { totp: string };
type RecoveryCodeForm = { recoveryCode: string };

export const PageTwoStepAuthentication = (_: RouteComponentProps) => {
  const account = useAccount();
  const navigate = useNavigate();
  const { l10n } = useLocalization();
  const alertBar = useAlertBar();
  const goHome = () =>
    navigate(HomePath + '#two-step-authentication', { replace: true });
  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      l10n.getString('tfa-enabled', null, 'Two-step authentication enabled')
    );
    navigate(HomePath + '#two-step-authentication', { replace: true });
  }, [alertBar, l10n, navigate]);

  const totpForm = useForm<TotpForm>({
    mode: 'onTouched',
  });
  const isValidTotpFormat = (totp: string) => /\d{6}/.test(totp);

  const recoveryCodeForm = useForm<RecoveryCodeForm>({
    mode: 'onTouched',
  });
  const isValidRecoveryCodeFormat = (recoveryCode: string) =>
    /\w/.test(recoveryCode);

  const { logPageViewEventOnce: logStep1PageViewEvent } = useMetrics();
  const { logPageViewEventOnce: logStep2PageViewEvent } = useMetrics();
  const { logViewEventOnce: logTotpSubmitEvent } = useMetrics();
  const logDataTrioActionEvent = (action: string) => {
    logViewEvent(
      `flow.${metricsPreInPostFix}.recovery-codes`,
      `${action}-option`
    );
  };

  const localizedStep1 = l10n.getString('tfa-step-1-3', null, 'Step 1 of 3');
  const [subtitle, setSubtitle] = useState<string>(localizedStep1);
  const [showQrCode, setShowQrCode] = useState(true);
  const [totpVerified, setTotpVerified] = useState<boolean>(false);
  const [invalidCodeError, setInvalidCodeError] = useState<string>('');
  const [recoveryCodesAcknowledged, setRecoveryCodesAcknowledged] =
    useState<boolean>(false);
  const [recoveryCodeError, setRecoveryCodeError] = useState<string>('');

  // Handles the "Continue" on step two, which doesn't submits any values.
  const onRecoveryCodesAcknowledged = () => {
    setRecoveryCodesAcknowledged(true);
    setSubtitle(l10n.getString('tfa-step-3-3', null, 'Step 3 of 3'));
  };

  const showQrCodeStep = () => {
    setTotpVerified(false);
    setSubtitle(localizedStep1);
  };

  const showRecoveryCodes = () => {
    setRecoveryCodesAcknowledged(false);
    setSubtitle(l10n.getString('tfa-step-2-3', null, 'Step 2 of 3'));
  };

  const verifyTotp = useCallback(
    async (code: string) => {
      try {
        await account.verifyTotp(code);
        alertSuccessAndGoHome();
      } catch (e) {
        if (e.errno === AuthUiErrors.TOTP_TOKEN_NOT_FOUND.errno) {
          setRecoveryCodeError(
            l10n.getString(
              `auth-error-${AuthUiErrors.TOTP_TOKEN_NOT_FOUND.errno}`,
              null,
              AuthUiErrors.TOTP_TOKEN_NOT_FOUND.message
            )
          );
        } else {
          alertBar.error(
            l10n.getString(
              'tfa-cannot-verify-code',
              null,
              'There was a problem verifying your recovery code.'
            )
          );
        }
      }
    },
    [account, alertSuccessAndGoHome, setRecoveryCodeError, l10n, alertBar]
  );

  const session = useSession();
  const totpInfo = useAsync(
    async () => session.verified && account.createTotp(),
    [account, session.verified]
  );

  const onTotpSubmit = async ({ totp }: TotpForm) => {
    if (!totpInfo.result) {
      return;
    }
    const isValidCode = await checkCode(totpInfo.result.secret, totp);
    setTotpVerified(isValidCode);
    if (isValidCode) {
      showRecoveryCodes();
    } else {
      setInvalidCodeError(
        l10n.getString(
          'tfa-incorrect-totp',
          null,
          'Incorrect two-step authentication code'
        )
      );
    }
    logTotpSubmitEvent(metricsPreInPostFix, 'submit');
  };

  const onRecoveryCodeSubmit = async ({ recoveryCode }: RecoveryCodeForm) => {
    if (!totpInfo.result) {
      return;
    }
    if (!totpInfo.result.recoveryCodes.includes(recoveryCode)) {
      setRecoveryCodeError(
        l10n.getString(
          'tfa-incorrect-recovery-code',
          null,
          'Incorrect recovery code'
        )
      );
      return;
    }
    const code = await getCode(totpInfo.result.secret);
    verifyTotp(code);
  };

  useEffect(() => {
    session.verified && logStep1PageViewEvent(metricsPreInPostFix);
  }, [session.verified, logStep1PageViewEvent]);

  useEffect(() => {
    totpVerified &&
      !recoveryCodesAcknowledged &&
      logStep2PageViewEvent(`${metricsPreInPostFix}.recovery-codes`);
  }, [totpVerified, recoveryCodesAcknowledged, logStep2PageViewEvent]);

  const moveBack = () => {
    if (!totpVerified) {
      return goHome();
    }
    if (totpVerified && !recoveryCodesAcknowledged) {
      return showQrCodeStep();
    }
    if (recoveryCodesAcknowledged) {
      setRecoveryCodeError('');
      return showRecoveryCodes();
    }
    goHome();
  };

  return (
    <FlowContainer
      title={l10n.getString('tfa-title', null, 'Two-step authentication')}
      {...{ subtitle, onBackButtonClick: moveBack }}
    >
      {!totpVerified && (
        <form onSubmit={totpForm.handleSubmit(onTotpSubmit)}>
          <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
          {showQrCode && totpInfo.result && (
            <>
              <Localized
                id="tfa-scan-this-code"
                elems={{
                  linkExternal: (
                    <LinkExternal
                      className="link-blue"
                      href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
                    >
                      {' '}
                    </LinkExternal>
                  ),
                }}
              >
                <p className="my-4">
                  Scan this QR code using one of{' '}
                  <LinkExternal
                    className="link-blue"
                    href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
                  >
                    these authentication apps
                  </LinkExternal>
                  .
                </p>
              </Localized>
              <div className="flex flex-col mb-4">
                {totpInfo.result.qrCodeUrl && (
                  <Localized
                    id="tfa-qa-code"
                    vars={{ secret: totpInfo.result.secret }}
                    attrs={{ alt: true }}
                  >
                    <img
                      className="mx-auto w-48 h-48 qr-code-border"
                      data-testid="2fa-qr-code"
                      src={totpInfo.result.qrCodeUrl}
                      alt={`Use the code ${totpInfo.result.secret} to set up two-step authentication in supported applications.`}
                    />
                  </Localized>
                )}
                {!totpInfo.result.qrCodeUrl && (
                  <div className="h-48">{/* vertical space placeholder */}</div>
                )}
                <Localized id="tfa-button-cant-scan-qr">
                  <button
                    type="button"
                    className="mx-auto link-blue text-sm"
                    data-testid="cant-scan-code"
                    onClick={() => setShowQrCode(false)}
                  >
                    Can't scan code?
                  </button>
                </Localized>
              </div>
            </>
          )}
          {!showQrCode && totpInfo.result && (
            <div className="mt-4 flex flex-col">
              <Localized id="tfa-enter-secret-key">
                <p>Enter this secret key into your authenticator app:</p>
              </Localized>
              <p className="my-8 mx-auto font-bold" data-testid="manual-code">
                {totpInfo.result.secret.toUpperCase().match(/.{4}/g)!.join(' ')}
              </p>
            </div>
          )}
          <Localized id="tfa-enter-totp">
            <p>Now enter the security code from the authentication app.</p>
          </Localized>

          <div className="mt-4 mb-6" data-testid="recovery-key-input">
            <Localized id="tfa-input-enter-totp" attrs={{ label: true }}>
              <InputText
                name="totp"
                label="Enter security code"
                prefixDataTestId="totp"
                maxLength={6}
                autoFocus
                onChange={() => {
                  setInvalidCodeError('');
                  totpForm.trigger('totp');
                }}
                inputRef={totpForm.register({
                  validate: isValidTotpFormat,
                })}
                {...{ errorText: invalidCodeError }}
              />
            </Localized>
          </div>

          <div className="flex justify-center mb-4 mx-auto max-w-64">
            <Localized id="tfa-button-cancel">
              <button
                type="button"
                className="cta-neutral mx-2 flex-1"
                onClick={goHome}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="tfa-button-continue">
              <button
                type="submit"
                data-testid="submit-totp"
                className="cta-primary mx-2 flex-1"
                disabled={
                  !totpForm.formState.isDirty || !totpForm.formState.isValid
                }
              >
                Continue
              </button>
            </Localized>
          </div>
        </form>
      )}
      {totpVerified && !recoveryCodesAcknowledged && totpInfo.result && (
        <>
          <div className="my-2" data-testid="2fa-recovery-codes">
            <Localized id="tfa-save-these-codes">
              Save these one-time use codes in a safe place for when you don’t
              have your mobile device.
            </Localized>
            <div className="mt-6 flex flex-col items-center justify-between">
              <DataBlock
                value={totpInfo.result.recoveryCodes.map((x) => x)}
                separator=" "
                onAction={logDataTrioActionEvent}
                onCopy={copyRecoveryCodes}
              ></DataBlock>
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
            <Localized id="tfa-button-continue">
              <button
                data-testid="ack-recovery-code"
                type="submit"
                className="cta-primary mx-2 flex-1"
                onClick={onRecoveryCodesAcknowledged}
              >
                Continue
              </button>
            </Localized>
          </div>
        </>
      )}
      {totpVerified && recoveryCodesAcknowledged && (
        <form onSubmit={recoveryCodeForm.handleSubmit(onRecoveryCodeSubmit)}>
          <Localized id="tfa-enter-code-to-confirm">
            <p className="mt-4 mb-4">
              Please enter one of your recovery codes now to confirm you've
              saved it. You'll need a code if you lose your device and want to
              access your account.
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
            <Localized id="tfa-button-cancel">
              <button
                type="button"
                className="cta-neutral mx-2 flex-1"
                onClick={goHome}
              >
                Cancel
              </button>
            </Localized>
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
      )}
    </FlowContainer>
  );
};

export default PageTwoStepAuthentication;
