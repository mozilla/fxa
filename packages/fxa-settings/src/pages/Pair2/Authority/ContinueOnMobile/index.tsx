/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import { MobileDevicePairingImage } from '../../../../components/images';

export type ContinueOnMobileProps = {
  /**
   * Aborts pairing. Required so that routing this card cannot leave its only
   * action inert — the flow logic itself lands with the route.
   */
  onCancel: () => void;
};

/**
 * The desktop screen shown once the user has scanned the pairing QR code with
 * their phone. It hands the flow off to the mobile device and tells the user to
 * finish the remaining steps there.
 *
 * This is a passive waiting state: it advances on its own when the pairing
 * channel reports the mobile device is done, so there is deliberately no
 * primary action. Cancel is the only control.
 */
export const ContinueOnMobile = ({ onCancel }: ContinueOnMobileProps) => (
  <AppLayout>
    <div className="flex flex-col items-center text-center">
      <FtlMsg id="pair2-authority-continue-on-mobile-heading">
        <h1 className="card-header">Continue on your mobile device</h1>
      </FtlMsg>
      <FtlMsg id="pair2-authority-continue-on-mobile-description">
        <p className="text-base">Follow the steps on your phone or tablet.</p>
      </FtlMsg>

      <MobileDevicePairingImage className="mt-8 h-40 w-auto" />

      <FtlMsg id="pair2-authority-continue-on-mobile-cancel-button">
        <button
          type="button"
          onClick={onCancel}
          data-glean-id="dtm_desktop_continue_cancel"
          className="link-dark-grey"
        >
          Cancel
        </button>
      </FtlMsg>
    </div>
  </AppLayout>
);

export default ContinueOnMobile;
