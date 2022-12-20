/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Localized } from '@fluent/react';
import { ReactComponent as PulseHearts } from './account-verified.svg';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';

type ReadyProps = {
  serviceName?: string;
  continueHandler?: Function;
  viewName: string;
};

const Ready = ({
  serviceName = 'Account Settings',
  continueHandler,
  viewName,
}: ReadyProps & RouteComponentProps) => {
  usePageViewEvent(viewName, {
    entrypoint_variation: 'react',
  });

  return (
    <>
      <div className="mb-4">
        <Localized id="ready-confirmation">
          <h1 className="card-header">Your password has been reset</h1>
        </Localized>
      </div>
      <div className="flex justify-center mx-auto">
        <PulseHearts />
      </div>
      <section>
        <div className="error"></div>
        <Localized id="ready-use-service">
          <p className="my-4 text-sm">{`You’re now ready to use ${serviceName}`}</p>
        </Localized>
      </section>
      {continueHandler && (
        <div className="flex justify-center mx-auto mt-6 max-w-64">
          <Localized id="ready-continue">
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
              Continue
            </button>
          </Localized>
        </div>
      )}
    </>
  );
};

export default Ready;
