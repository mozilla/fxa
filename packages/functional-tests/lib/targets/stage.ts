import { TargetName } from '.';
import { RemoteTarget } from './remote';

const ACCOUNTS_DOMAIN =
  process.env.ACCOUNTS_DOMAIN || 'accounts.stage.mozaws.net';
const ACCOUNTS_API_DOMAIN =
  process.env.ACCOUNTS_API_DOMAIN || 'api-accounts.stage.mozaws.net';
const PAYMENTS_DOMAIN =
  process.env.PAYMENTS_DOMAIN || 'payments.stage.mozaws.net';
const RELIER_DOMAIN =
  process.env.RELIER_DOMAIN || 'stage-123done.herokuapp.com';

export class StageTarget extends RemoteTarget {
  static readonly target = 'stage';
  readonly name: TargetName = StageTarget.target;
  readonly contentServerUrl = `https://${ACCOUNTS_DOMAIN}`;
  readonly paymentsServerUrl = `https://${PAYMENTS_DOMAIN}`;
  readonly relierUrl = `https://${RELIER_DOMAIN}`;

  constructor() {
    super(`https://${ACCOUNTS_API_DOMAIN}`);
  }
}
