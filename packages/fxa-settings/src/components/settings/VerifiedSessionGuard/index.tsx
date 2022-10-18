/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ApolloError } from '@apollo/client';
import { useSession } from '../../models';
import ModalVerifySession from '../ModalVerifySession';

export const VerifiedSessionGuard = ({
  onDismiss,
  onError,
  children,
}: {
  onDismiss: () => void;
  onError: (error: ApolloError) => void;
  children?: React.ReactNode;
}) => {
  return useSession().verified ? (
    <>{children}</>
  ) : (
    <ModalVerifySession {...{ onDismiss, onError }} />
  );
};

export default VerifiedSessionGuard;
