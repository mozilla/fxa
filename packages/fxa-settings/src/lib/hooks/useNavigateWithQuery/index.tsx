/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate, NavigateOptions } from '@reach/router';

export function useNavigateWithQuery() {
  const navigate = useNavigate();

  return (
    to: string,
    options?: NavigateOptions<{}>,
    includeHash: boolean = true
  ) => {
    const location = window.location;
    let path = to;

    if (to.includes('?')) {
      path = to;
    } else if (location.search) {
      path = `${to}${location.search}`;
    }

    if (includeHash && location.hash) {
      path = `${path}${location.hash}`;
    }

    if (options) {
      return navigate(path, options);
    }

    return navigate(path);
  };
}
