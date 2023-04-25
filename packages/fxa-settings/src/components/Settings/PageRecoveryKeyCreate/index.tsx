/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate } from '@reach/router';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { HomePath } from '../../../constants';

export const PageRecoveryKeyCreate = (_: RouteComponentProps) => {
  const navigate = useNavigate();
  const goHome = () => navigate(HomePath + '#recovery-key', { replace: true });
  return (
    <>
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
      {/* TODO New content for recovery key flow will go here */}
      Hello I'm the new Recovery Key Create Page
    </>
  );
};

export default PageRecoveryKeyCreate;
