/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Resource } from '@opentelemetry/resources';
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { TracingOpts } from '../config';

export function createNodeProvider(opts: TracingOpts) {
  return new NodeTracerProvider({
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(opts.sampleRate),
    }),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: opts.serviceName,
    }),
  });
}
