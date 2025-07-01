/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

import { memo } from 'react';
import { useFtlMsgResolver } from '../../models';

 // This component uses CSS and the XML we set in public/index.html that is
 // be available before the first app render completes.
const LoadingSpinnerSprite = () => {
  const ftlMsgResolver = useFtlMsgResolver();
  const loadingAriaLabel = ftlMsgResolver.getMsg(
    'app-loading-spinner-aria-label-loading',
    'Loading…'
  );

  return (
    <div className="loading-spinner-fullscreen">
      <svg className="loading-spinner" role="img" aria-label={loadingAriaLabel}>
        <use xlinkHref="#loading-spinner" />
      </svg>
    </div>
  );
}

export default memo(LoadingSpinnerSprite);
