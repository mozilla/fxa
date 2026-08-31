/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface MeteringEventInput {
  eventIdHash: string;
  clientId: string;
  slug: string;
  subject: string;
  amount: number;
  eventTime: Date;
  ingestedAt: Date;
}

export interface MeterKey {
  clientId: string;
  slug: string;
}

export interface SumUsageParams extends MeterKey {
  subject: string;
  from: Date;
  to: Date;
}

export type DedupeStatus = 'claimed' | 'duplicate' | 'pending';

export interface PubSubMessage {
  data: Buffer;
  ack(): void;
  nack(): void;
}

export interface DedupePipeline {
  set(
    key: string,
    value: string,
    expiryMode: string,
    time: number,
    setMode?: string
  ): unknown;
  get(key: string): unknown;
  exec(): Promise<Array<[Error | null, unknown]>>;
}

export interface DedupeRedis {
  pipeline(): DedupePipeline;
  del(...keys: string[]): Promise<number>;
  quit(): Promise<'OK'>;
  disconnect(): void;
}

export interface SentNotification {
  windowId: string | null;
  sentAt: Date;
}

export type SweepOutcome =
  | 'meter-not-configured'
  | 'no-webhooks'
  | 'no-thresholds'
  | 'no-candidates'
  | 'no-crossings'
  | 'dispatched';

export interface SweepResult {
  outcome: SweepOutcome;
  candidates: number;
  dispatched: number;
  held: boolean;
  watermark: string;
}

export interface SweepAllResult {
  total: number;
  held: number;
  failed: number;
}

export interface FindActiveMetersParams {
  ingestedSince: Date;
}

export interface SweepCandidate {
  subject: string;
  usage: number;
}

export interface FindWindowCandidatesParams extends MeterKey {
  from: Date;
  to: Date;
  ingestedSince: Date;
  eventTimeFloor: Date;
  minUsage: number;
}

export interface FindSessionCandidatesParams extends MeterKey {
  expiredBefore: Date;
  to: Date;
  minUsage: number;
}

export interface FindNewSessionStartsParams extends MeterKey {
  ingestedSince: Date;
  eventTimeFloor: Date;
  to: Date;
  durationMs: number;
}

export interface SubjectsParams extends MeterKey {
  subjects: string[];
}

export interface AdvanceWatermarkParams extends MeterKey {
  watermark: Date;
  updatedAt: Date;
}

export interface RecordedNotification extends MeterKey {
  subject: string;
  threshold: number;
  signingClientId: string;
  windowId: string | null;
  sentAt: Date;
}

export interface SessionStartRecord extends MeterKey {
  subject: string;
  sessionStart: Date;
}

export interface WebhookDispatchParams {
  signingClientId: string;
  url: string;
  slug: string;
  subject: string;
  threshold: number;
  currentUsage: number;
  limit: number;
  grantedAmount: number;
  unit: string;
  windowStart: Date;
  windowEnd: Date;
  idempotencyKey: string;
}
