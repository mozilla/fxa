import { BaseAuthModel } from './base-auth';

export class MetaData extends BaseAuthModel {
  static tableName = 'dbMetadata';

  public name!: string;
  public value!: string;
}

export class SessionTokensMetaData extends MetaData {
  public static get lastPruned() {
    return MetaData.query().select('value').where('name', 'lastPrunedAt');
  }

  public static get prunedUntil() {
    return MetaData.query().select('value').where('name', 'prunedUntil');
  }
}
