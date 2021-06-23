/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { uuidTransformer } from '../../transformers';
import { BaseAuthModel } from './base-auth';

/**
 * Track subscription related emails sent to FxA users.
 */

export class SentEmail extends BaseAuthModel {
  public static tableName = 'sentEmails';
  public static idColumn = 'id';

  protected $uuidFields = ['uid'];

  public uid!: string;
  public emailTypeId!: number;
  public params!: any;
  public sentAt!: number;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['uid', 'emailType'],
      properties: {
        id: {
          type: 'integer',
        },
        uid: {
          type: 'string',
          pattern: '^(?:[a-fA-F0-9]{2})+$',
        },
        emailTypeId: {
          type: 'integer',
        },
        params: {
          type: 'json',
        },
      },
    };
  }

  $beforeInsert() {
    this.sentAt = Date.now();
  }

  $afterFind() {
    this.params = JSON.parse(this.params);
  }

  static async createSentEmail(
    uid: string,
    emailType: string,
    params?: any
  ): Promise<SentEmail> {
    const knex = SentEmail.knex();
    const result = await knex(
      knex.raw('?? (??, ??, ??, ??)', [
        this.tableName,
        'uid',
        'params',
        'sentAt',
        'emailTypeId',
      ])
    ).insert(
      knex
        .select(
          knex.raw('?, ?, ?', [
            uuidTransformer.to(uid),
            params ? JSON.stringify(params) : 'null',
            Date.now(),
          ]),
          'id'
        )
        .from('emailTypes')
        .where({ emailType })
    );

    return SentEmail.query().findOne({ id: result[0] });
  }

  static async findLatestSentEmailByType(
    uid: string,
    emailType: string,
    params?: any
  ): Promise<SentEmail> {
    const paramsCondition = params
      ? SentEmail.knex().raw(
          `${this.tableName}.params = CAST('${JSON.stringify(params)}' as JSON)`
        )
      : SentEmail.knex().raw(
          // thanks, I hate it
          `CAST (${this.tableName}.params as CHAR) = 'null'`
        );
    return SentEmail.query()
      .select(`${this.tableName}.*`)
      .join('emailTypes', `${this.tableName}.emailTypeId`, 'emailTypes.id')
      .where({
        [`${this.tableName}.uid`]: uuidTransformer.to(uid),
        ['emailTypes.emailType']: emailType,
      })
      .where(paramsCondition)
      .orderBy('sentAt', 'desc')
      .limit(1)
      .first();
  }
}
