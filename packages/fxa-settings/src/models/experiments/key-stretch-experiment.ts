/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsOptional, IsString } from 'class-validator';
import { bind, ModelDataProvider } from '../../lib/model-data';

export class KeyStretchExperiment extends ModelDataProvider {
  @IsOptional()
  @IsString()
  @bind()
  stretch?: string;

  @IsOptional()
  @IsString()
  @bind()
  forceExperiment?: string;

  @IsOptional()
  @IsString()
  @bind()
  forceExperimentGroup?: string;

  isV2(config: { featureFlags?: { keyStretchV2?: boolean } }) {
    // If stretch=2 in the URL, then force V2 key stretching for this page render,
    // This is used for dev/test purposes.
    if (this.stretch === '2') {
      return true;
    }

    // If stretch=1 in the URL, then force V1 key stretching for this page render,
    // This is used for dev/test purposes.
    if (this.stretch === '1') {
      return false;
    }

    // Typical state. Not enrolled and not using V2 key stretching.
    return config.featureFlags?.keyStretchV2 === true;
  }
}
