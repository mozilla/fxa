/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { BackupRecoveryPhoneCodeImage } from '../../images';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FlowContainer from '../FlowContainer';
import { GleanClickEventType2FA } from '../../../lib/types';
import Banner from '../../Banner';
import { RelierCmsInfo } from '../../../models';
import CmsButtonWithFallback from '../../CmsButtonWithFallback';

export type FlowSetup2faPromptProps = {
  localizedPageTitle: string;
  onContinue: () => void;
  onBackButtonClick?: () => void;
  hideBackButton?: boolean;
  serviceName: string;
  localizedErrorMessage?: string;
  cmsInfo?: RelierCmsInfo;
};

export const FlowSetup2faPrompt = ({
  localizedPageTitle,
  onContinue,
  hideBackButton = true,
  onBackButtonClick,
  serviceName,
  localizedErrorMessage,
  cmsInfo,
}: FlowSetup2faPromptProps) => {
  return (
    <FlowContainer
      onBackButtonClick={onBackButtonClick}
      hideBackButton={hideBackButton}
      title={localizedPageTitle}
    >
      {localizedErrorMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorMessage }}
        />
      )}
      <BackupRecoveryPhoneCodeImage ariaHidden />
      <FtlMsg id="flow-setup-2fa-prompt-heading">
        <h2 className="font-bold text-xl my-2">
          Set up two-step authentication
        </h2>
      </FtlMsg>
      <FtlMsg id="flow-setup-2fa-prompt-description" vars={{ serviceName }}>
        <p className="text-base mb-4">
          {serviceName} requires you to set up two-step authentication to keep
          your account safe.
        </p>
      </FtlMsg>
      <FtlMsg
        id="flow-setup-2fa-prompt-use-authenticator-apps"
        elems={{
          authenticationAppsLink: (
            <LinkExternal
              className="link-blue text-base"
              href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
              gleanDataAttrs={{
                id: 'two_step_auth_inline_prompt_app_link',
                type: GleanClickEventType2FA.inline,
              }}
            >
              these authenticator apps
            </LinkExternal>
          ),
        }}
      >
        <p className="text-base mb-8">
          You can use any of{' '}
          <LinkExternal
            className="link-blue text-base"
            href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
            gleanDataAttrs={{
              id: 'two_step_auth_inline_prompt_app_link',
              type: GleanClickEventType2FA.inline,
            }}
          >
            these authenticator apps
          </LinkExternal>{' '}
          to proceed.
        </p>
      </FtlMsg>
      <FtlMsg id="flow-setup-2fa-prompt-continue-button">
        <CmsButtonWithFallback
          type="submit"
          className="cta-primary cta-xl w-full"
          onClick={onContinue}
          buttonColor={cmsInfo?.shared.buttonColor}
        >
          Continue
        </CmsButtonWithFallback>
      </FtlMsg>
    </FlowContainer>
  );
};

export default FlowSetup2faPrompt;
