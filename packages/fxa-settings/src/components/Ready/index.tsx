/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as PulseHearts } from './account-verified.svg';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';

type ReadyProps = {
  serviceName?: string;
  continueHandler?: Function;
  viewName: viewNameType;
};

type viewNameType =
  | 'signin-confirmed'
  | 'signin-verified'
  | 'reset-password-confirmed'
  | 'reset-password-verified'
  | 'reset-password-with-recovery-key-verified';

const getTemplateValues = (viewName: viewNameType) => {
  let templateValues: { headerText: string; headerId: string } = {
    headerText: '',
    headerId: '',
  };
  // I use the switch case here instead of just a hash because there's a lot of duplication,
  // and I think the fallthrough structure is really intuitive! Open to feedback on this --
  // if it seems unclear to people, that's a good reason to change it
  switch (viewName) {
    case 'signin-confirmed':
    case 'signin-verified':
      templateValues.headerId = 'fxa-sign-in-complete-header';
      templateValues.headerText = 'Sign-in confirmed';
      break;
    case 'reset-password-confirmed':
    case 'reset-password-with-recovery-key-verified':
      templateValues.headerId = 'fxa-reset-password-complete-header';
      templateValues.headerText = 'Your password has been reset';
  }
  return templateValues;
};

const Ready = ({
  serviceName = 'Account Settings',
  continueHandler,
  viewName,
}: ReadyProps & RouteComponentProps) => {
  usePageViewEvent(viewName, {
    entrypoint_variation: 'react',
  });

  const templateValues = getTemplateValues(viewName);

  return (
    <>
      <div className="mb-4">
        <FtlMsg id={templateValues.headerId} attrs={{ header: true }}>
          {templateValues.headerText}
        </FtlMsg>
      </div>
      <div className="flex justify-center mx-auto">
        <PulseHearts />
      </div>
      <section>
        <div className="error"></div>
        <FtlMsg id="ready-use-service">
          {`You’re now ready to use ${serviceName}`}
        </FtlMsg>
      </section>
      {continueHandler && (
        <div className="flex justify-center mx-auto mt-6 max-w-64">
          <button
            type="submit"
            className="cta-primary cta-base-p font-bold mx-2 flex-1"
            onClick={(e) => {
              const eventName = `${viewName}.continue`;
              logViewEvent(viewName, eventName, {
                entrypoint_variation: 'react',
              });
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
