/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constants } from '../constants';
import { storage } from '../storage/storage';

const STORAGE_KEY__REACT_EXPERIMENT = Constants.STORAGE_REACT_EXPERIMENT;

/*
 * Check that the React enrolled flag in local storage is set to `true`.
 * Note that if users don't hit the Backbone JS bundle, this is not going
 * to get set.
 */
export function isInReactExperiment() {
  const storageReactExp = storage.local.get(STORAGE_KEY__REACT_EXPERIMENT);
  try {
    const parsedData = JSON.parse(storageReactExp);
    return parsedData && parsedData.enrolled === true;
  } catch (error) {
    return false;
  }
}
