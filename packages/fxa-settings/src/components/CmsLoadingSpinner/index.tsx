/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCms } from '../../models/contexts/CmsContext';
import type { LoadingSpinnerProps } from 'fxa-react/components/LoadingSpinner';

/**
 * CMS-aware wrapper around LoadingSpinner that automatically applies
 * CMS shared background colors when available.
 */
export const CmsLoadingSpinner = (props: LoadingSpinnerProps) => {
  const { backgroundColor: cmsBackgroundColor } = useCms();

  const effectiveBackgroundColor = props.backgroundColor || cmsBackgroundColor;

  return (
    <LoadingSpinner
      {...props}
      backgroundColor={effectiveBackgroundColor}
    />
  );
};

export default CmsLoadingSpinner;
