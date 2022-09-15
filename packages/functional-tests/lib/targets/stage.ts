import { TargetName } from '.';
import { RemoteTarget } from './remote';

export class StageTarget extends RemoteTarget {
  static readonly target = 'stage';
  readonly name: TargetName = StageTarget.target;
  readonly contentServerUrl = 'https://accounts.stage.mozaws.net';
  readonly relierUrl = 'https://stage-123done.herokuapp.com';

  constructor() {
    super('https://api-accounts.stage.mozaws.net');
  }
}
