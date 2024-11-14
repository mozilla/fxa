/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import { TwoFactorAuthImage } from '../../components/images';
import CardHeader from '../../components/CardHeader';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormVerifyCode from '../../components/FormVerifyCode';
import AppLayout from '../../components/AppLayout';
import { InlineTotpSetupProps } from './interfaces';
import DataBlockManual from '../../components/DataBlockManual';
import { GleanClickEventType2FA } from '../../lib/types';
import Banner from '../../components/Banner';

export const InlineTotpSetup = ({
  totp,
  serviceName,
  cancelSetupHandler,
  verifyCodeHandler,
}: InlineTotpSetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedQRCodeAltText = ftlMsgResolver.getMsg(
    'tfa-qr-code-alt',
    `Use the code ${totp.secret} to set up two-step authentication in supported applications.`,
    { code: totp.secret }
  );
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'inline-totp-setup-code-required-error',
    'Authentication code required'
  );
  const [showIntro, setShowIntro] = useState(true);
  const [showQR, setShowQR] = useState(true);
  const [totpErrorMessage, setTotpErrorMessage] = useState('');
  const [localizedBannerMessage, setLocalizedBannerMessage] =
    useState<string>('');

  const onCancel = useCallback(() => {
    try {
      cancelSetupHandler();
    } catch (error) {
      setLocalizedBannerMessage(
        ftlMsgResolver.getMsg(error.ftlId, error.message)
      );
    }
  }, [cancelSetupHandler, ftlMsgResolver]);

  const onSubmit = async (code: string) => {
    try {
      setTotpErrorMessage('');
      await verifyCodeHandler(code);
    } catch (error) {
      setTotpErrorMessage(ftlMsgResolver.getMsg(error.ftlId, error.message));
    }
  };

  return (
    <AppLayout>
      {showIntro && (
        <>
          <CardHeader
            headingText="Enable two-step authentication"
            headingWithCustomServiceFtlId="inline-totp-setup-enable-two-step-authentication-custom-header-2"
            headingWithDefaultServiceFtlId="inline-totp-setup-enable-two-step-authentication-default-header-2"
            {...{ serviceName }}
          />
          {localizedBannerMessage && (
            <Banner
              type="error"
              content={{ localizedHeading: localizedBannerMessage }}
            />
          )}
          <section className="flex flex-col items-center">
            <TwoFactorAuthImage />
            <FtlMsg
              id="inline-totp-setup-add-security-link"
              elems={{
                authenticationAppsLink: (
                  <LinkExternal
                    className="link-blue text-sm"
                    href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
                    gleanDataAttrs={{
                      id: 'two_step_auth_app_link',
                      type: GleanClickEventType2FA.inline,
                    }}
                  >
                    these authentication apps
                  </LinkExternal>
                ),
              }}
            >
              <p className="text-sm">
                Add a layer of security to your account by requiring
                authentication codes from one of{' '}
                <LinkExternal
                  className="link-blue text-sm"
                  href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
                  gleanDataAttrs={{
                    id: 'two_step_auth_app_link',
                    type: GleanClickEventType2FA.inline,
                  }}
                >
                  these authentication apps
                </LinkExternal>
                .
              </p>
            </FtlMsg>
            <button
              type="submit"
              className="cta-primary cta-xl w-full my-6"
              onClick={() => {
                setShowIntro(false);
                setLocalizedBannerMessage('');
              }}
            >
              <FtlMsg id="inline-totp-setup-continue-button">Continue</FtlMsg>
            </button>
            <button
              type="button"
              className="link-blue text-sm"
              onClick={onCancel}
            >
              <FtlMsg id="inline-totp-setup-cancel-setup-button">
                Cancel setup
              </FtlMsg>
            </button>
          </section>
        </>
      )}
      {!showIntro && (
        <>
          {showQR ? (
            <CardHeader
              headingText="Scan authentication code"
              headingWithCustomServiceFtlId="inline-totp-setup-show-qr-custom-service-header-2"
              headingWithDefaultServiceFtlId="inline-totp-setup-show-qr-default-service-header-2"
              {...{ serviceName }}
            />
          ) : (
            <CardHeader
              headingText="Enter code manually"
              headingWithCustomServiceFtlId="inline-totp-setup-no-qr-custom-service-header-2"
              headingWithDefaultServiceFtlId="inline-totp-setup-no-qr-default-service-header-2"
              {...{ serviceName }}
            />
          )}
          {localizedBannerMessage && (
            <Banner
              type="error"
              content={{ localizedHeading: localizedBannerMessage }}
            />
          )}
          <section>
            <div id="totp" className="totp-details">
              {showQR ? (
                <>
                  <FtlMsg
                    id="inline-totp-setup-use-qr-or-enter-key-instructions"
                    elems={{
                      toggleToManualModeButton: (
                        <button
                          type="button"
                          onClick={() => {
                            setShowQR(false);
                          }}
                          className="link-blue inline"
                        >
                          Can’t scan code?
                        </button>
                      ),
                    }}
                  >
                    <p className="text-sm my-4">
                      Scan the QR code in your authentication app and then enter
                      the authentication code it provides.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setShowQR(false);
                        }}
                        className="link-blue inline"
                      >
                        Can’t scan code?
                      </button>
                    </p>
                  </FtlMsg>
                  <div>
                    <img
                      className={classNames(
                        {
                          hidden: !totp.qrCodeUrl,
                        },
                        'mx-auto w-48 h-48 rounded-xl border-8 border-green-800/10'
                      )}
                      alt={localizedQRCodeAltText}
                      src={totp.qrCodeUrl}
                    />
                  </div>
                  <FtlMsg id="inline-totp-setup-on-completion-description">
                    <p className="text-sm my-4">
                      Once complete, it will begin generating authentication
                      codes for you to enter.
                    </p>
                  </FtlMsg>
                </>
              ) : (
                <>
                  <FtlMsg
                    id="inline-totp-setup-enter-key-or-use-qr-instructions"
                    elems={{
                      toggleToQRButton: (
                        <button
                          onClick={() => {
                            setShowQR(true);
                          }}
                          className="link-blue inline"
                        >
                          Scan QR code instead?
                        </button>
                      ),
                    }}
                  >
                    <p className="text-sm mt-4">
                      Type this secret key into your authentication app.{' '}
                      <button
                        onClick={() => {
                          setShowQR(true);
                        }}
                        className="link-blue inline"
                      >
                        Scan QR code instead?
                      </button>
                    </p>
                  </FtlMsg>
                  <DataBlockManual secret={totp.secret} />
                  <FtlMsg id="inline-totp-setup-on-completion-description">
                    <p className="text-sm mb-4">
                      Once complete, it will begin generating authentication
                      codes for you to enter.
                    </p>
                  </FtlMsg>
                </>
              )}
              <FormVerifyCode
                viewName="inline_totp_setup"
                verifyCode={onSubmit}
                formAttributes={{
                  inputLabelText: 'Authentication code',
                  inputFtlId: 'inline-totp-setup-security-code-placeholder',
                  pattern: 'd{6}',
                  maxLength: 6,
                  submitButtonText: 'Ready',
                  submitButtonFtlId: 'inline-totp-setup-ready-button',
                }}
                codeErrorMessage={totpErrorMessage}
                setCodeErrorMessage={setTotpErrorMessage}
                {...{ localizedCustomCodeRequiredMessage }}
                gleanDataAttrs={{
                  id: 'two_step_auth_qr_submit',
                  type: GleanClickEventType2FA.inline,
                }}
              />
              <button className="link-blue text-sm mt-4" onClick={onCancel}>
                <FtlMsg id="inline-totp-setup-cancel-setup-button">
                  Cancel setup
                </FtlMsg>
              </button>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default InlineTotpSetup;
