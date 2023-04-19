import { TargetName } from '.';
import { RemoteTarget } from './remote';

export class ProductionTarget extends RemoteTarget {
  static readonly target = 'production';
  readonly name: TargetName = ProductionTarget.target;
  readonly contentServerUrl = 'https://accounts.firefox.com';
  readonly paymentsServerUrl = 'https://subscriptions.firefox.com';
  readonly relierUrl = 'https://production-123done.herokuapp.com/';

  constructor() {
    super('https://api.accounts.firefox.com');
  }
}
