import { TargetName } from '.';
import { RemoteTarget } from './remote';

export class ProductionTarget extends RemoteTarget {
  static readonly target = 'production';
  readonly name: TargetName = ProductionTarget.target;
  readonly contentServerUrl = 'https://accounts.firefox.com';
  readonly relierUrl = 'https://123done.org';

  constructor() {
    super('https://api.accounts.firefox.com');
  }
}
