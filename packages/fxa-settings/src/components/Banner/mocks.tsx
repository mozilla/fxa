/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import Banner, { BannerType } from '.';

export const Subject = () => {
  const [visible, setVisible] = useState<boolean>(true);

  return (
    <>
      {visible && (
        <Banner type={BannerType.info} dismissible setIsVisible={setVisible}>
          <p>This is a dismissible "info" type banner inside our AppLayout.</p>
        </Banner>
      )}
    </>
  );
};
