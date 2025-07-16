/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import FlowContainer from '../FlowContainer';
import GleanMetrics from '../../../lib/glean';
import { useFtlMsgResolver } from '../../../models';
import Banner from '../../Banner';
import {
  BackupCodesIcon,
  BackupRecoverySmsIcon,
  CheckmarkGreenIcon,
} from '../../Icons';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { GleanClickEventType2FA } from '../../../lib/types';

type FlowSetup2faCompleteProps = (
  | {
      backupType: 'code';
      numCodesRemaining: number;
    }
  | {
      backupType: 'phone';
      lastFourPhoneDigits: string;
    }
) & {
  serviceName: string;
  onContinue: () => void;
  reason?: GleanClickEventType2FA;
};

const BackupCodesDetails = ({
  numCodesRemaining,
}: {
  numCodesRemaining: number;
}) => {
  return (
    <div className="bg-grey-10 rounded-lg flex mt-3 p-6 gap-5 items-center">
      <BackupCodesIcon className="flex-none" />
      <div>
        <FtlMsg id="flow-setup-2fa-inline-complete-backup-code">
          <p className="font-semibold text-md">Backup authentication codes</p>
        </FtlMsg>
        <div className="flex">
          <CheckmarkGreenIcon mode="enabled" className="flex-none" />
          <FtlMsg
            id="flow-setup-2fa-inline-complete-backup-code-info"
            vars={{ count: numCodesRemaining }}
          >
            <p className="text-sm">{`${numCodesRemaining} ${numCodesRemaining === 1 ? 'code' : 'codes'} remaining`}</p>
          </FtlMsg>
        </div>
      </div>
    </div>
  );
};

const RecoveryPhoneDetails = ({
  lastFourPhoneDigits,
}: {
  lastFourPhoneDigits: string;
}) => {
  return (
    <div className="bg-grey-10 rounded-lg flex mt-3 p-6 gap-5 items-center">
      <BackupRecoverySmsIcon className="flex-none" />
      <div>
        <FtlMsg id="flow-setup-2fa-inline-complete-backup-phone">
          <p className="font-semibold text-md">Recovery phone</p>
        </FtlMsg>
        <div className="flex">
          <CheckmarkGreenIcon mode="enabled" className="flex-none" />
          {/* Phone numbers should always be displayed left-to-right,
           *including* in rtl languages */}
          <p dir="ltr" className="text-sm">
            •••••• {lastFourPhoneDigits}
          </p>
        </div>
      </div>
    </div>
  );
};

export const FlowSetup2faComplete = (props: FlowSetup2faCompleteProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const {
    backupType,
    serviceName,
    onContinue,
    reason = GleanClickEventType2FA.inline,
  } = props;

  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthCompleteView({
      event: { reason },
    });
  }, [reason]);

  return (
    <FlowContainer hideBackButton={true}>
      <Banner
        type="success"
        textAlignClassName="text-center"
        content={{
          localizedHeading: ftlMsgResolver.getMsg(
            'flow-setup-2fa-inline-complete-success-banner',
            'Two-step authentication enabled'
          ),
        }}
      ></Banner>
      {backupType === 'code' ? (
        <BackupCodesDetails numCodesRemaining={props.numCodesRemaining} />
      ) : (
        <RecoveryPhoneDetails lastFourPhoneDigits={props.lastFourPhoneDigits} />
      )}
      <div className="text-sm px-4 mt-6 mb-16">
        {backupType === 'code' ? (
          <FtlMsg id="flow-setup-2fa-inline-complete-backup-code-description">
            <p className="mb-2">
              This is the safest recovery method if you can’t sign in with your
              mobile device or authenticator app.
            </p>
          </FtlMsg>
        ) : (
          <FtlMsg id="flow-setup-2fa-inline-complete-backup-phone-description">
            <p className="mb-2">
              This is the easiest recovery method if you can’t sign in with your
              authenticator app.
            </p>
          </FtlMsg>
        )}
        <FtlMsg id="flow-setup-2fa-inline-complete-learn-more-link">
          <LinkExternal
            className="link-blue"
            href="https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication"
          >
            How this protects your account
          </LinkExternal>
        </FtlMsg>
      </div>
      <FtlMsg
        id="flow-setup-2fa-inline-complete-continue-button"
        vars={{ serviceName }}
      >
        <button
          className="cta-primary cta-xl w-full"
          onClick={onContinue}
          data-glean-id="two_step_auth_complete_continue"
          data-glean-type={reason}
        >
          Continue to {serviceName}
        </button>
      </FtlMsg>
    </FlowContainer>
  );
};

export default FlowSetup2faComplete;
