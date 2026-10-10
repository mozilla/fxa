/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { SUBJECT_CHUNK_SIZE } from './metering.constants';
import type {
  AdvanceWatermarkParams,
  FindActiveMetersParams,
  FindNewSessionStartsParams,
  FindSessionCandidatesParams,
  FindWindowCandidatesParams,
  MeterKey,
  RecordedNotification,
  SentNotification,
  SessionStartRecord,
  SubjectsParams,
  SweepCandidate,
} from './metering.types';
import { MeteringSweepRepository } from './metering-sweep.repository';
import { chunk } from './utils/chunk';
import { notificationKey } from './utils/notificationKey';

@Injectable()
export class MeteringSweepManager {
  constructor(
    private readonly meteringSweepRepository: MeteringSweepRepository
  ) {}

  async findActiveMeters(params: FindActiveMetersParams): Promise<MeterKey[]> {
    return this.meteringSweepRepository.findActiveMeters(params);
  }

  async findWindowCandidates(
    params: FindWindowCandidatesParams
  ): Promise<SweepCandidate[]> {
    return this.meteringSweepRepository.findWindowCandidates(params);
  }

  async findSessionCandidates(
    params: FindSessionCandidatesParams
  ): Promise<SweepCandidate[]> {
    return this.meteringSweepRepository.findSessionCandidates(params);
  }

  async findLastNotifications(
    params: SubjectsParams
  ): Promise<Map<string, SentNotification>> {
    const result = new Map<string, SentNotification>();

    for (const subjects of chunk(params.subjects, SUBJECT_CHUNK_SIZE)) {
      const rows = await this.meteringSweepRepository.findLastNotifications({
        clientId: params.clientId,
        slug: params.slug,
        subjects,
      });

      for (const row of rows) {
        result.set(
          notificationKey(row.subject, row.threshold, row.signing_client_id),
          {
            windowId: row.last_window_id.length > 0 ? row.last_window_id : null,
            sentAt: new Date(row.last_sent_at),
          }
        );
      }
    }

    return result;
  }

  async findSessionStarts(params: SubjectsParams): Promise<Map<string, Date>> {
    const result = new Map<string, Date>();

    for (const subjects of chunk(params.subjects, SUBJECT_CHUNK_SIZE)) {
      const rows = await this.meteringSweepRepository.findSessionStarts({
        clientId: params.clientId,
        slug: params.slug,
        subjects,
      });

      for (const row of rows) {
        result.set(row.subject, new Date(row.started_at));
      }
    }

    return result;
  }

  async findNewSessionStarts(
    params: FindNewSessionStartsParams
  ): Promise<SessionStartRecord[]> {
    const rows =
      await this.meteringSweepRepository.findNewSessionStarts(params);

    return rows.map((row) => ({
      clientId: params.clientId,
      slug: params.slug,
      subject: row.subject,
      sessionStart: new Date(row.started_at),
    }));
  }

  async findWatermark(params: MeterKey): Promise<Date | null> {
    const watermark = await this.meteringSweepRepository.findWatermark(params);
    return watermark ? new Date(watermark) : null;
  }

  async advanceWatermark(params: AdvanceWatermarkParams): Promise<void> {
    await this.meteringSweepRepository.advanceWatermark(params);
  }

  async recordNotifications(
    notifications: RecordedNotification[]
  ): Promise<void> {
    await this.meteringSweepRepository.recordNotifications(notifications);
  }

  async recordSessionStarts(sessions: SessionStartRecord[]): Promise<void> {
    await this.meteringSweepRepository.recordSessionStarts(sessions);
  }
}
