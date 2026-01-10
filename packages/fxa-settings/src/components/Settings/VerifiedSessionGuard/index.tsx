/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { useSession, useAuthClient } from '../../../models';
import ModalVerifySession from '../ModalVerifySession';

export const VerifiedSessionGuard = ({
  onDismiss,
  onError,
  children,
}: {
  onDismiss: () => void;
  onError: (error: Error) => void;
  children?: ReactNode;
}) => {
  const session = useSession();
  const authClient = useAuthClient();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Check session status on mount to avoid flash
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await authClient.sessionStatus(session.token);
        setIsVerified(status.state === 'verified');
      } catch {
        setIsVerified(false);
      }
    };
    checkStatus();
  }, [authClient, session.token]);

  const onCompleted = useCallback(() => {
    setIsVerified(true);
  }, []);

  // Show nothing while checking status
  if (isVerified === null) {
    return null;
  }

  return isVerified ? (
    <>{children}</>
  ) : (
    <ModalVerifySession {...{ onDismiss, onError, onCompleted }} />
  );
};

export default VerifiedSessionGuard;
