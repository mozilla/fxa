/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Features } from '@fxa/payments/experiments';
import type { NimbusEnrollment } from '@fxa/shared/experiments';
import { IsArray, IsDefined } from 'class-validator';

class Experiments {
  @IsDefined()
  Features!: Features;

  @IsArray()
  Enrollments!: Array<NimbusEnrollment>;
}

export class GetExperimentsActionResult {
  experiments?: Experiments;
}
