/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * FXA-13863 — Pairing start placeholder (THROWAWAY).
 *
 * This is where the deep-link flow lands inside Firefox once pairing begins.
 * For now it is a static placeholder. In later versions this page will invoke
 * the pairing channel server and notify the waiting desktop client.
 */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';

export const viewName = 'poc_pair_start';

const PocPairStart = (_: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <CardHeader
        headingText="Pairing Started"
        headingTextFtlId="poc_pair_start-header"
      />
      <p className="text-sm text-grey-400 mt-2">
        Initiating connection to pairing channel
      </p>
    </AppLayout>
  );
};

export default PocPairStart;
