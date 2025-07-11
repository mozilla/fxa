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

export type FlowSetup2faPromptProps = {
  localizedPageTitle: string;
  onContinue: () => void;
  onCancel: () => void;
  serviceName: string;
  localizedErrorMessage?: string;
};

export const FlowSetup2faPrompt = ({
  localizedPageTitle,
  onContinue,
  onCancel,
  serviceName,
  localizedErrorMessage,
}: FlowSetup2faPromptProps) => {
  return (
    <FlowContainer onBackButtonClick={onCancel} title={localizedPageTitle}>
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
        <p className="text-base">
          {serviceName} requires you set up two-step authentication to keep your
          account safe.
        </p>
      </FtlMsg>
      <FtlMsg
        id="flow-setup-2fa-prompt-use-authenticator-apps"
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
              these authenticator apps
            </LinkExternal>
          ),
        }}
      >
        <p className="text-sm my-8">
          You can use any of{' '}
          <LinkExternal
            className="link-blue text-sm"
            href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
            gleanDataAttrs={{
              id: 'two_step_auth_app_link',
              type: GleanClickEventType2FA.inline,
            }}
          >
            these authenticator apps
          </LinkExternal>{' '}
          to proceed.
        </p>
      </FtlMsg>
      <button
        type="submit"
        className="cta-primary cta-xl w-full mb-6"
        onClick={onContinue}
      >
        <FtlMsg id="flow-setup-2fa-prompt-continue-button">Continue</FtlMsg>
      </button>
      <button type="button" className="link-blue text-sm" onClick={onCancel}>
        <FtlMsg id="flow-setup-2fa-prompt-cancel">Cancel</FtlMsg>
      </button>
    </FlowContainer>
  );
};

export default FlowSetup2faPrompt;
