/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';
import { HeartsVerifiedImage } from '../../components/images';
import CardHeader from '../CardHeader';

// We'll actually be getting the isSignedIn value from a context when this is wired up.
export type ReadyProps = {
  continueHandler?: Function;
  isSignedIn?: boolean;
  serviceName?: MozServices;
  viewName: ViewNameType;
};

export type ViewNameType =
  | 'signin-confirmed'
  | 'signin-verified'
  | 'signup-confirmed'
  | 'signup-verified'
  | 'reset-password-confirmed'
  | 'reset-password-verified'
  | 'reset-password-with-recovery-key-verified'
  | 'primary-email-verified';

const getTemplateValues = (viewName: ViewNameType) => {
  let templateValues = {
    headerText: '',
    headerId: '',
  };
  switch (viewName) {
    case 'signin-confirmed':
    case 'signin-verified':
      templateValues.headerId = 'sign-in-complete-header';
      templateValues.headerText = 'Sign-in confirmed';
      break;
    case 'signup-confirmed':
    case 'signup-verified':
      templateValues.headerId = 'sign-up-complete-header';
      templateValues.headerText = 'Account confirmed';
      break;
    case 'reset-password-confirmed':
    case 'reset-password-with-recovery-key-verified':
      templateValues.headerId = 'reset-password-complete-header';
      templateValues.headerText = 'Your password has been reset';
      break;
    case 'primary-email-verified':
      templateValues.headerId = 'primary-email-verified-header';
      templateValues.headerText = 'Primary email confirmed';
      break;
    default:
      throw new Error('Invalid view name submitted to Ready component');
  }
  return templateValues;
};

const Ready = ({
  continueHandler,
  isSignedIn = true,
  serviceName,
  viewName,
}: ReadyProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const templateValues = getTemplateValues(viewName);

  return (
    <>
      <CardHeader
        headingText={templateValues.headerText}
        headingTextFtlId={templateValues.headerId}
      />
      <div className="flex justify-center mx-auto">
        <HeartsVerifiedImage className="w-3/5" />
      </div>
      <section>
        <div className="error"></div>
        {isSignedIn ? (
          serviceName ? (
            <FtlMsg id="ready-use-service" vars={{ serviceName }}>
              <p className="my-4 text-sm">{`You’re now ready to use ${serviceName}`}</p>
            </FtlMsg>
          ) : (
            <FtlMsg id="ready-use-service-default">
              <p className="my-4 text-sm">
                You’re now ready to use account settings
              </p>
            </FtlMsg>
          )
        ) : (
          <FtlMsg id="ready-account-ready">
            <p className="my-4 text-sm">Your account is ready!</p>
          </FtlMsg>
        )}
      </section>
      {continueHandler && (
        <div className="flex justify-center mx-auto mt-6 max-w-64">
          <button
            type="submit"
            className="cta-primary cta-base-p font-bold mx-2 flex-1"
            onClick={(e) => {
              const eventName = `${viewName}.continue`;
              logViewEvent(viewName, eventName, REACT_ENTRYPOINT);
              continueHandler(e);
            }}
          >
            <FtlMsg id="ready-continue">Continue</FtlMsg>
          </button>
        </div>
      )}
    </>
  );
};

export default Ready;
