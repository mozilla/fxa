/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import UnitRowRecoveryKey from '../UnitRowRecoveryKey';
import UnitRowTwoStepAuth from '../UnitRowTwoStepAuth';

export const Security = () => {
  return (
    <section className="mt-11" id="security" data-testid="settings-security">
      <h2 className="font-header font-bold ml-4 mb-4">Security</h2>
      <div className="bg-white tablet:rounded-xl shadow">
        <UnitRowRecoveryKey />
        <hr className="unit-row-hr" />
        <UnitRowTwoStepAuth />
      </div>
    </section>
  );
};

export default Security;
