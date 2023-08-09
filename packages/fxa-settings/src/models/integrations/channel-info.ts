/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
  ModelValidation as V,
} from '../../lib/model-data';

export class ChannelInfo extends ModelDataProvider {
  @bind([V.isChannelId], T.snakeCase)
  channelId: string | undefined;

  @bind([V.isChannelKey], T.snakeCase)
  channelKey: string | undefined;
}
