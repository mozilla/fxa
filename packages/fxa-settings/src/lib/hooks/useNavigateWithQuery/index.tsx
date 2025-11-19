/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate, NavigateOptions, useLocation } from '@reach/router';
import { navigateWithQueryHelper } from '../../utilities';

export function useNavigateWithQuery() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    to: string,
    options?: NavigateOptions<{}>,
    includeHash: boolean = true
  ) => {
    return navigateWithQueryHelper(
      location,
      navigate,
      to,
      options,
      includeHash
    );
  };
}
