/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';

import LinkExternal from 'fxa-react/components/LinkExternal';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';

import GleanMetrics from '../../../lib/glean';
import { GleanClickEventType2FA, TotpInfo } from '../../../lib/types';
import { formatSecret } from '../../../lib/utilities';

import { RelierCmsInfo, useFtlMsgResolver } from '../../../models';

import Banner from '../../Banner';
import DataBlockInline from '../../DataBlockInline';
import FormVerifyTotp from '../../FormVerifyTotp';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { TwoStepSetupMethod } from './types';

export type FlowSetup2faAppProps = {
  localizedPageTitle: string;
  totpInfo: TotpInfo;
  verifyCode: (code: string) => Promise<{ error?: boolean }>;
  currentStep?: number;
  hideBackButton?: boolean;
  initialSetupMethod?: TwoStepSetupMethod;
  numberOfSteps?: number;
  onBackButtonClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.KeyboardEvent<HTMLButtonElement>
  ) => void;
  reason?: GleanClickEventType2FA;
  showProgressBar?: boolean;
  cmsInfo?: RelierCmsInfo;
  customQrInstructionEl?: React.ReactNode;
};

export const FlowSetup2faApp = ({
  localizedPageTitle,
  totpInfo,
  verifyCode,
  currentStep,
  hideBackButton = false,
  initialSetupMethod = TwoStepSetupMethod.QrCode,
  numberOfSteps,
  onBackButtonClick,
  reason = GleanClickEventType2FA.setup,
  showProgressBar = true,
  cmsInfo,
  customQrInstructionEl,
}: FlowSetup2faAppProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [setupMethod, setSetupMethod] =
    useState<TwoStepSetupMethod>(initialSetupMethod);

  const ftlMsgResolver = useFtlMsgResolver();

  const clearBanners = useCallback(() => {
    setErrorMessage('');
  }, [setErrorMessage]);

  const handleCode = async (code: string) => {
    clearBanners();
    const result = await verifyCode(code);
    if (result?.error) {
      setErrorMessage(
        ftlMsgResolver.getMsg(
          'flow-setup-2fa-code-error',
          'Invalid or expired code. Check your authenticator app and try again.'
        )
      );
    }
  };

  const localizedHeading =
    setupMethod === TwoStepSetupMethod.QrCode
      ? ftlMsgResolver.getMsg(
          'flow-setup-2fa-qr-heading',
          'Connect to your authenticator app'
        )
      : ftlMsgResolver.getMsg(
          'flow-setup-2fa-manual-key-heading',
          'Enter code manually'
        );

  return (
    <FlowContainer
      title={localizedPageTitle}
      {...{ hideBackButton, onBackButtonClick }}
    >
      {showProgressBar && currentStep != null && numberOfSteps != null && (
        <ProgressBar {...{ currentStep, numberOfSteps }} />
      )}
      <h2 className="text-xl font-bold my-2">{localizedHeading}</h2>

      {errorMessage && (
        <Banner
          type="error"
          content={{ localizedDescription: errorMessage }}
          bannerId="flow-setup-2fa"
        />
      )}

      {setupMethod === TwoStepSetupMethod.QrCode && (
        <QrCodeStep
          {...{ reason, setSetupMethod, customQrInstructionEl }}
          qrCodeUrl={totpInfo.qrCodeUrl}
        />
      )}
      {setupMethod === TwoStepSetupMethod.ManualCode && (
        <ManualCodeStep
          {...{ reason, setSetupMethod }}
          secret={totpInfo.secret}
        />
      )}

      <FtlMsg
        id="flow-setup-2fa-step-2-instruction"
        elems={{ strong: <strong></strong> }}
      >
        <p className="text-sm mt-4">
          <strong>Step 2: </strong>Enter the code from your authenticator app.
        </p>
      </FtlMsg>
      <FormVerifyTotp
        {...{ clearBanners, errorMessage, setErrorMessage }}
        className="mt-4"
        codeLength={6}
        codeType="numeric"
        errorBannerId="flow-setup-2fa"
        gleanDataAttrs={{
          id:
            setupMethod === TwoStepSetupMethod.QrCode
              ? 'two_step_auth_qr_submit'
              : 'two_step_auth_manual_code_submit',
          type: reason,
        }}
        localizedInputLabel={ftlMsgResolver.getMsg(
          'flow-setup-2fa-input-label',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'flow-setup-2fa-button',
          'Continue'
        )}
        verifyCode={handleCode}
        cmsButton={{ color: cmsInfo?.shared.buttonColor }}
      />
    </FlowContainer>
  );
};

const LearnMoreLink = ({ reason }: { reason: GleanClickEventType2FA }) => {
  return (
    <FtlMsg id="flow-setup-2fa-more-info-link">
      <LinkExternal
        className="link-blue text-sm"
        href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one"
        gleanDataAttrs={{
          id: 'two_step_auth_app_link',
          type: reason,
        }}
      >
        Learn more about authenticator apps
      </LinkExternal>
    </FtlMsg>
  );
};

const QrCodeStep = ({
  reason,
  setSetupMethod,
  qrCodeUrl,
  customQrInstructionEl,
}: {
  reason: GleanClickEventType2FA;
  setSetupMethod: React.Dispatch<React.SetStateAction<TwoStepSetupMethod>>;
  qrCodeUrl: string;
  customQrInstructionEl?: React.ReactNode;
}) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthQrView({
      event: { reason: GleanClickEventType2FA.setup },
    });
  }, []);

  return (
    <div>
      {customQrInstructionEl || (
        <FtlMsg
          id="flow-setup-2a-qr-instruction"
          elems={{ strong: <strong></strong> }}
        >
          <p className="text-sm">
            <strong>Step 1: </strong>Scan this QR code using any authenticator
            app, like Duo or Google Authenticator.
          </p>
        </FtlMsg>
      )}
      <LearnMoreLink {...{ reason }} />

      <div className="relative mx-auto w-fit mt-4 mb-2 flex justify-center items-center rounded-xl border-8 border-green-800/10">
        {!imgLoaded && (
          <LoadingSpinner className="absolute inset-0 flex items-center justify-center" />
        )}
        <img
          width="192"
          height="192"
          className={`w-48 h-48 transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          data-testid="2fa-qr-code"
          src={qrCodeUrl}
          alt={ftlMsgResolver.getMsg(
            'flow-setup-2fa-qr-alt-text',
            'QR code for setting up two-step authentication. Scan it, or choose “Can’t scan QR code?” to get a setup secret key instead.'
          )}
          loading="eager"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => setSetupMethod(TwoStepSetupMethod.ManualCode)}
        />
      </div>

      <div className="flex justify-center w-full">
        <FtlMsg id="flow-setup-2fa-cant-scan-qr-button">
          <button
            type="button"
            data-testid="cant-scan-code"
            className="mx-auto link-blue text-sm mb-4"
            onClick={() => {
              setSetupMethod(TwoStepSetupMethod.ManualCode);
            }}
            data-glean-id="two_step_auth_cant_scan_qr_click"
            data-glean-type={reason}
          >
            Can’t scan QR code?
          </button>
        </FtlMsg>
      </div>
    </div>
  );
};

const ManualCodeStep = ({
  reason,
  setSetupMethod,
  secret,
}: {
  reason: GleanClickEventType2FA;
  setSetupMethod: React.Dispatch<React.SetStateAction<TwoStepSetupMethod>>;
  secret: string;
}) => {
  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthManualCodeView({
      event: { reason: GleanClickEventType2FA.setup },
    });
  }, []);

  return (
    <div>
      <FtlMsg
        id="flow-setup-2fa-manual-key-instruction"
        elems={{ strong: <strong></strong> }}
      >
        <p className="text-sm">
          <strong>Step 1: </strong>Enter this code in your preferred
          authenticator app.
        </p>
      </FtlMsg>
      <LearnMoreLink {...{ reason }} />
      <DataBlockInline
        value={formatSecret(secret)}
        prefixDataTestId="manual"
        extraClassnames="mt-4 mb-2"
      />
      <div className="flex justify-center w-full">
        <FtlMsg id="flow-setup-2fa-scan-qr-instead-button">
          <button
            type="button"
            className="mx-auto link-blue text-sm mb-4"
            onClick={() => {
              setSetupMethod(TwoStepSetupMethod.QrCode);
            }}
            data-glean-id="two_step_auth_scan_qr_instead_click"
            data-glean-type={reason}
          >
            Scan QR code instead?
          </button>
        </FtlMsg>
      </div>
    </div>
  );
};

export default FlowSetup2faApp;
