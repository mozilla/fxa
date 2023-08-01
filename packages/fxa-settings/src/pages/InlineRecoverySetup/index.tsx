/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { usePageViewEvent } from '../../lib/metrics';
import { MozServices } from '../../lib/types';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import InputText from '../../components/InputText';
import DataBlock from '../../components/DataBlock';
import { REACT_ENTRYPOINT } from '../../constants';
import { RecoveryCodesImage } from '../../components/images';
import CardHeader from '../../components/CardHeader';

export type InlineRecoverySetupProps = {
  isIOS?: boolean;
  recoveryCodes: Array<string>;
  serviceName?: MozServices;
  showConfirmation: boolean;
};

export const viewName = 'inline-recovery-setup';

const InlineRecoverySetup = ({
  isIOS,
  recoveryCodes,
  serviceName,
  showConfirmation,
}: InlineRecoverySetupProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedInputTextLabel = ftlMsgResolver.getMsg(
    'inline-recovery-backup-authentication-code',
    'Backup authentication code'
  );

  /* TODO: - Add in copy/download/print/continue/cancel actions for all buttons
   *       - Add in metrics for all events
   *       - Add tests for all metrics
   */
  const cancelSetup = () => {};
  const continueSetup = () => {};

  return (
    <>
      {showConfirmation ? (
        <>
          <CardHeader
            headingText="Confirm backup authentication code"
            headingWithDefaultServiceFtlId="inline-recovery-confirmation-header-default"
            headingWithCustomServiceFtlId="inline-recovery-confirmation-header"
            {...{ serviceName }}
          />
          <section>
            <form noValidate>
              <div>
                <RecoveryCodesImage className="mx-auto" />
                <FtlMsg id="inline-recovery-confirmation-description">
                  <p className="text-sm mb-6">
                    To ensure that you will be able to regain access to your
                    account in the event of a lost device, please enter one of
                    your saved backup authentication codes.
                  </p>
                </FtlMsg>
                <InputText
                  label={localizedInputTextLabel}
                  className="tooltip-below recovery-code text-start my-4"
                  anchorPosition="start"
                  required
                  autoFocus
                  autoComplete="off"
                />
                <FtlMsg id="inline-recovery-confirm-button">
                  <button type="submit" className="cta-primary cta-xl w-full">
                    Confirm
                  </button>
                </FtlMsg>
                <div className="flex justify-between mt-4">
                  <FtlMsg id="inline-recovery-back-link">
                    <button type="button" className="link-blue text-sm">
                      Back
                    </button>
                  </FtlMsg>
                  <FtlMsg id="inline-recovery-cancel-setup">
                    <button type="button" className="link-blue text-sm">
                      Cancel setup
                    </button>
                  </FtlMsg>
                </div>
              </div>
            </form>
          </section>
        </>
      ) : (
        <>
          <CardHeader
            headingText="Save backup authentication codes"
            headingWithDefaultServiceFtlId="inline-recovery-setup-header-default"
            headingWithCustomServiceFtlId="inline-recovery-setup-header"
            {...{ serviceName }}
          />
          <section className="mt-6 flex flex-col items-center h-auto justify-between">
            <FtlMsg id="inline-recovery-setup-message">
              <p className="text-sm mb-6">
                Store these one-time use codes in a safe place for when you
                don’t have your mobile device.
              </p>
            </FtlMsg>
            <DataBlock value={recoveryCodes} isIOS={isIOS} />
            <div className="flex justify-center mt-6 mb-4 mx-auto max-w-64">
              <FtlMsg id="inline-recovery-cancel-button">
                <button
                  type="button"
                  className="cta-neutral mx-2 px-10 py-2 flex-1"
                  onClick={cancelSetup}
                >
                  Cancel
                </button>
              </FtlMsg>
              <FtlMsg id="inline-recovery-continue-button">
                <button
                  type="button"
                  className="cta-neutral mx-2 px-10 py-2"
                  onClick={continueSetup}
                >
                  Continue
                </button>
              </FtlMsg>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default InlineRecoverySetup;
