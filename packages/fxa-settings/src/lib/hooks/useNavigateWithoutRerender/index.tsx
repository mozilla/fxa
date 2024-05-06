/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NavigateOptions } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';

import { useCallback } from 'react';

/*
 * This MUST be used instead of `navigate` when using a model validator and when
 * the _next page_ to navigate to does not require or would become invalid on the same
 * validation check. `navigate` causes a re-render of the component prior to actually
 * performing the next component mount so the validation check re-runs and can throw an
 * unintentional error.
 */
export default function useNavigateWithoutRerender() {
  const navigate = useNavigate();

  const navigateWithoutRerender = useCallback(
    (path: string, options: NavigateOptions<{}>) => {
      window.requestAnimationFrame(() => navigate(path, options));
    },
    [navigate]
  );

  return navigateWithoutRerender;
}
