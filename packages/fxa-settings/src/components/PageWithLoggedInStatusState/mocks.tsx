/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

export const MockComponent = ({ isSignedIn }: { isSignedIn: boolean }) => {
  return (
    <>
      {isSignedIn ? <p>You are signed in!</p> : <p>You are not signed in.</p>}
    </>
  );
};

export default MockComponent;
