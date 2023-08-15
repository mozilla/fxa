/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
} from '../../lib/model-data';
import { IsBase64, IsNotEmpty } from 'class-validator';

export class ChannelInfo extends ModelDataProvider {
  @IsBase64()
  @IsNotEmpty()
  @bind(T.snakeCase)
  channelId: string | undefined;

  @IsBase64()
  @IsNotEmpty()
  @bind(T.snakeCase)
  channelKey: string | undefined;
}
