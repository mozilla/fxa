/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { SigninIntegration } from './interfaces';

/**
 * Shared derived state to be used by components that use the "cached lockup" view
 * container.
 */
export const useCachedSigninLockup = ({
  integration,
  localizedErrorFromLocationState,
}: {
  integration: SigninIntegration;
  localizedErrorFromLocationState?: string;
}) => {
  const [localizedBannerError, setLocalizedBannerError] = useState(
    localizedErrorFromLocationState || ''
  );

  const clientId = integration.getClientId();
  const legalTerms = integration.getLegalTerms();
  const cmsInfo = integration.getCmsInfo();
  // All views using this hook reuse the cached page's "Sign in" framing —
  // same header text, same CMS surface — none that prompt for a password.
  const cachedPageCms = cmsInfo?.SigninCachedPage;
  const signinPageCms = cmsInfo?.SigninPage;
  const title = cachedPageCms?.pageTitle;
  // If cachedPageCms does not specify splitLayout, fall back to
  // signinPageCms.splitLayout.
  const splitLayout = cachedPageCms?.splitLayout ?? signinPageCms?.splitLayout;
  const additionalAccessibilityInfo =
    cmsInfo?.shared.additionalAccessibilityInfo;

  return {
    clientId,
    legalTerms,
    cmsInfo,
    cachedPageCms,
    title,
    splitLayout,
    additionalAccessibilityInfo,
    localizedBannerError,
    setLocalizedBannerError,
  };
};
