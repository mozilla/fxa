/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsOptional, IsString } from 'class-validator';
import { bind, ModelDataProvider } from '../../lib/model-data';
import * as Sentry from '@sentry/browser';

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
    // If the feature flag is off or unspecified, always disable the functionality!
    if (!config.featureFlags?.keyStretchV2) {
      return false;
    }

    // If stretch=2 in the URL, then force V2 key stretching for this page render,
    // This is used for dev/test purposes.
    if (this.stretch === '2') {
      return true;
    }

    // If force experiment params are in URL, then force V2 key stretching, and
    // automatically enroll in experiment, so that content server will pick it up.
    if (
      this.forceExperiment === 'keyStretchV2' &&
      this.forceExperimentGroup === 'v2'
    ) {
      enrollInExp('keyStretchV2', true);
      return true;
    }

    if (isEnrolledIn('keyStretchV2')) {
      return true;
    }

    // Typical state. Not enrolled and not using V2 key stretching.
    return false;
  }
}

/**
 * Sets state for a local experiment. Typically this is set by
 * content-server/backbone, but we are in the midst of a migration to
 * react. So for now we will sort of go behind the content server's back
 * here. Note, that this will only happen if force experiment query params
 * are set. Otherwise, the experiment will not be activated, or have to be
 * activated by a content server / backbone page.
 */
function enrollInExp(key: string, enrolled: boolean) {
  window.localStorage.setItem(
    `__fxa_storage.experiment.${key}`,
    JSON.stringify(JSON.stringify({ enrolled }))
  );
}

/**
 * Check if local storage indicates an active key stretch experiment.
 * This is set by content-server/backbone. In the future we will be
 * porting over experimentation code into settings, but this is in flux
 * at the moment. See FXA-9183 for more info and latest status
 */
function isEnrolledIn(key: string) {
  try {
    let value: any = window.localStorage.getItem(
      `__fxa_storage.experiment.${key}`
    );
    const json = value ? JSON.parse(JSON.parse(value)) : { enrolled: false };
    return json.enrolled === true;
  } catch (error) {
    Sentry.captureException(error);
    // If value was malformed then assume false.
    return false;
  }
}
