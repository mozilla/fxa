import { TargetName } from '.';
import { RemoteTarget } from './remote';

const ACCOUNTS_DOMAIN =
  process.env.ACCOUNTS_DOMAIN || 'accounts.stage.mozaws.net';
const ACCOUNTS_API_DOMAIN =
  process.env.ACCOUNTS_API_DOMAIN || 'api-accounts.stage.mozaws.net';
const PAYMENTS_DOMAIN =
  process.env.PAYMENTS_DOMAIN ||
  'payments-stage.fxa.nonprod.cloudops.mozgcp.net';
const RELIER_DOMAIN =
  process.env.RELIER_DOMAIN || 'stage-123done.herokuapp.com';
const RELIER_CLIENT_ID = 'dcdb5ae7add825d2';
const SUB_PRODUCT = 'prod_FfiuDs9u11ESbD';
const SUB_PRODUCT_NAME = 'One, Two, Three Done...PRO';
const SUB_PLAN = 'plan_FfiupsKXZ3mMZ6';

export class StageTarget extends RemoteTarget {
  static readonly target = 'stage';
  readonly name: TargetName = StageTarget.target;
  readonly contentServerUrl = `https://${ACCOUNTS_DOMAIN}`;
  readonly paymentsServerUrl = `https://${PAYMENTS_DOMAIN}`;
  readonly relierUrl = `https://${RELIER_DOMAIN}`;
  readonly relierClientID = RELIER_CLIENT_ID;
  readonly subscriptionConfig = {
    product: SUB_PRODUCT,
    name: SUB_PRODUCT_NAME,
    plan: SUB_PLAN,
  };

  constructor() {
    super(`https://${ACCOUNTS_API_DOMAIN}`);
  }
}
