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

  isV2() {
    return (
      this.stretch === '2' ||
      (this.forceExperiment === 'key-stretch' &&
        this.forceExperimentGroup === 'v2')
    );
  }
}
