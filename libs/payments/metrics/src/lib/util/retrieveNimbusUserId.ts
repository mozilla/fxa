/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { NimbusManager } from '@fxa/payments/experiments';

export async function getNimbusUserId(
  nimbusManager: NimbusManager,
  {
    uid,
    language,
    region,
    experimentationId,
    experimentationPreview,
  }: {
    uid?: string;
    language: string;
    region?: string;
    experimentationId: string;
    experimentationPreview: boolean;
  }
) {
  const generatedNimbusUserId = nimbusManager.generateNimbusId(
    uid,
    experimentationId
  );
  try {
    const experiments = await nimbusManager.fetchExperiments({
      nimbusUserId: generatedNimbusUserId,
      language,
      region,
      preview: experimentationPreview,
    });

    return {
      ok: true,
      nimbusUserId:
        experiments?.Enrollments?.at(0)?.nimbus_user_id ||
        generatedNimbusUserId,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      nimbusUserId: generatedNimbusUserId,
      error,
    };
  }
}
