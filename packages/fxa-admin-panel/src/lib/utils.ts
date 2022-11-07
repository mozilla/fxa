/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dateFormat from 'dateformat';

const DATE_FORMAT = 'yyyy-mm-dd @ HH:MM:ss Z';

export const getFormattedDate = (raw: Nullable<number> | undefined) =>
  dateFormat(new Date(raw || 0), DATE_FORMAT);
