/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../../../config';
import {
  createAccountsEventsEvent,
  createEventsServerEventLogger,
} from './server_events';
import { version } from '../../../package.json';
import { createHash } from 'crypto';
import { AuthRequest } from '../../types';
import * as AppError from '../../error';
import { clientId as clientIdValidator } from '../../oauth/validators';
import { MetricsContext } from '@fxa/shared/metrics/glean';

// According to @types/hapi, request.auth.credentials.user is of type
// UserCredentials, which is just {}. That's not actually the case and it
// mismatches the real type, which is string.  I extended AuthRequest below but
// the type, MetricsRequest is for this file only.
interface MetricsRequest extends Omit<AuthRequest, 'auth'> {
  payload: Record<string, any>;
  auth: { credentials: Record<string, string> };
}

type MetricsData = {
  uid?: string;
  reason?: string;
  oauthClientId?: string;
  scopes?: string | Array<string>;
};

type AdditionalMetricsCallback = (
  metrics: Record<string, any>
) => Record<string, any>;

type GleanEventFnOptions = {
  // for certain events, passing in the "client" ip address isn't helpful since
  // the client in question is a service from an RP
  skipClientIp?: boolean;

  // a callback to allow the caller to pass in additional metrics
  additionalMetrics?: AdditionalMetricsCallback;
};

type ErrorLoggerFnParams = {
  glean: ReturnType<typeof gleanMetrics>;
  request: AuthRequest;
  error: AppError;
};

let appConfig: ConfigType;
let gleanEventLogger: ReturnType<typeof createAccountsEventsEvent>;
let gleanServerEventLogger: ReturnType<typeof createEventsServerEventLogger>;

const isEnabled = async (request: MetricsRequest) =>
  appConfig.gleanMetrics.enabled && (await request.app.isMetricsEnabled);

const findUid = (request: MetricsRequest, metricsData?: MetricsData): string =>
  metricsData?.uid ||
  request.auth?.credentials?.uid ||
  request.auth?.credentials?.user ||
  '';

const sha256HashUid = (uid: string) =>
  createHash('sha256').update(uid).digest('hex');

const findServiceName = async (request: MetricsRequest) => {
  const metricsContext = await request.app.metricsContext;
  return metricsContext.service || '';
};

const findOauthClientId = async (
  request: MetricsRequest,
  metricsData?: MetricsData
): Promise<string> => {
  const clientId =
    metricsData?.oauthClientId ||
    request.auth.credentials?.client_id ||
    request.payload?.client_id;

  // for OAuth the content-server places the client id into the service
  // property for metrics, so we'll check that value for something shaped like
  // an oauth id
  const clientIdInService = async () => {
    const service = await findServiceName(request);
    const { error } = clientIdValidator.validate(service);

    if (!error) {
      return service;
    }

    return null;
  };

  return clientId || (await clientIdInService()) || '';
};

const getMetricMethod = (eventName: string) => {
  const uppercaseWords = eventName
    .split('_')
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join('');
  const methodName = `record${uppercaseWords}`;

  if (
    !gleanServerEventLogger[methodName as keyof typeof gleanServerEventLogger]
  ) {
    process.stderr.write(
      `Method ${methodName} for eventName ${eventName} not found in gleanServerEventLogger`
    );
    process.exit(1);
  }

  return gleanServerEventLogger[
    methodName as keyof typeof gleanServerEventLogger
  ] as (args: any) => void;
};

const createEventFn =
  // On MetricsData: for an event like successful login, the uid isn't known at
  // the time of request since the request itself isn't authenticated.  We'll
  // accept data from the event logging call for metrics that are known/easily
  // accessible in the calling scope but difficult/not possible to get from any
  // context attached to the request.

  (eventName: string, options?: GleanEventFnOptions) => {
    // Resolve the Glean event metric method
    const method = getMetricMethod(eventName);
    const eventOptions = options || {};

    return async (req: AuthRequest, metricsData?: MetricsData) => {
      // where the function is called the request object is likely to be declared
      // to be AuthRequest, so we do a cast here.
      const request = req as unknown as MetricsRequest;
      const enabled = await isEnabled(request);
      if (!enabled) {
        return;
      }

      const metricsContext: MetricsContext = await request.app.metricsContext;

      // metrics sent with every event
      const commonMetrics = {
        user_agent: request.headers['user-agent'],
        ip_address:
          eventOptions.skipClientIp === true ? '' : request.app.clientAddress,
        account_user_id: '',
        account_user_id_sha256: '',
        relying_party_oauth_client_id: await findOauthClientId(
          request,
          metricsData
        ),
        relying_party_service: await findServiceName(request),
        session_device_type: request.app.ua.deviceType || '',
        session_entrypoint: metricsContext.entrypoint || '',
        // experiment and variation were added for content server backend pings
        // auth server TODO FXA-9847
        session_entrypoint_experiment: '',
        session_entrypoint_variation: '',
        session_flow_id: metricsContext.flowId || '',
        utm_campaign: metricsContext.utmCampaign || '',
        utm_content: metricsContext.utmContent || '',
        utm_medium: metricsContext.utmMedium || '',
        utm_source: metricsContext.utmSource || '',
        utm_term: metricsContext.utmTerm || '',
        scopes: metricsData?.scopes || '',
      };

      // reason is sent in access_token_created, login_submit_backend_error, and reg_submit_error
      const eventReason = metricsData?.reason || '';

      // uid needs extra handling because we need to hash the value
      const uid = findUid(request, metricsData);
      if (uid !== '') {
        commonMetrics.account_user_id = uid;
        commonMetrics.account_user_id_sha256 = sha256HashUid(uid);
      }

      // new style Glean events with event metric type
      const moreMetrics = eventOptions.additionalMetrics
        ? eventOptions.additionalMetrics({
            ...commonMetrics,
            ...(metricsData || {}),
          })
        : {};
      method.call(gleanServerEventLogger, { ...commonMetrics, ...moreMetrics });

      gleanEventLogger.record({
        ...commonMetrics,
        event_name: eventName,
        event_reason: eventReason,
      });
    };
  };

const extraKeyReasonCb = (metrics: Record<string, any>) => ({
  reason: metrics.reason,
});

export function gleanMetrics(config: ConfigType) {
  appConfig = config;
  gleanEventLogger = createAccountsEventsEvent({
    applicationId: config.gleanMetrics.applicationId,
    appDisplayVersion: version,
    channel: config.gleanMetrics.channel,
    logger_options: { app: config.gleanMetrics.loggerAppName },
  });
  gleanServerEventLogger = createEventsServerEventLogger({
    applicationId: config.gleanMetrics.applicationId,
    appDisplayVersion: version,
    channel: config.gleanMetrics.channel,
    logger_options: { app: config.gleanMetrics.loggerAppName },
  });

  return {
    registration: {
      accountCreated: createEventFn('reg_acc_created'),
      confirmationEmailSent: createEventFn('reg_email_sent'),
      accountVerified: createEventFn('reg_acc_verified'),
      complete: createEventFn('reg_complete'),
      error: createEventFn('reg_submit_error', {
        additionalMetrics: extraKeyReasonCb,
      }),
    },

    login: {
      success: createEventFn('login_success'),
      error: createEventFn('login_submit_backend_error', {
        additionalMetrics: extraKeyReasonCb,
      }),
      totpSuccess: createEventFn('login_totp_code_success'),
      totpFailure: createEventFn('login_totp_code_failure'),
      recoveryCodeSuccess: createEventFn('login_backup_code_success'),
      verifyCodeEmailSent: createEventFn('login_email_confirmation_sent'),
      verifyCodeConfirmed: createEventFn('login_email_confirmation_success'),
      complete: createEventFn('login_complete'),
    },

    resetPassword: {
      emailSent: createEventFn('password_reset_email_sent'),
      createNewSuccess: createEventFn('password_reset_create_new_success'),
      accountReset: createEventFn('account_password_reset'),
      recoveryKeySuccess: createEventFn('password_reset_recovery_key_success'),

      otpEmailSent: createEventFn('password_reset_email_confirmation_sent'),
      otpVerified: createEventFn('password_reset_email_confirmation_success'),

      twoFactorSuccess: createEventFn('password_reset_two_factor_success'),
      twoFactorRecoveryCodeSuccess: createEventFn(
        'password_reset_recovery_code_success'
      ),

      recoveryKeyCreatePasswordSuccess: createEventFn(
        'password_reset_recovery_key_create_success'
      ),
    },

    oauth: {
      tokenCreated: createEventFn('access_token_created', {
        additionalMetrics: extraKeyReasonCb,
      }),
      tokenChecked: createEventFn('access_token_checked', {
        skipClientIp: true,
        additionalMetrics: (metrics) => ({
          scopes: metrics.scopes
            ? Array.isArray(metrics.scopes)
              ? metrics.scopes.sort().join(',')
              : metrics.scopes.split(',').sort().join(',')
            : '',
        }),
      }),
    },

    thirdPartyAuth: {
      googleLoginComplete: createEventFn(
        'third_party_auth_google_login_complete',
        {
          additionalMetrics: (metrics) => ({
            linking: metrics.reason === 'linking',
          }),
        }
      ),
      appleLoginComplete: createEventFn(
        'third_party_auth_apple_login_complete',
        {
          additionalMetrics: (metrics) => ({
            linking: metrics.reason === 'linking',
          }),
        }
      ),
      googleRegComplete: createEventFn('third_party_auth_google_reg_complete'),
      appleRegComplete: createEventFn('third_party_auth_apple_reg_complete'),
      setPasswordComplete: createEventFn(
        'third_party_auth_set_password_complete'
      ),
    },

    account: {
      deleteComplete: createEventFn('account_delete_complete'),
    },
    twoFactorAuth: {
      codeComplete: createEventFn('two_factor_auth_code_complete'),
    },
    twoStepAuthPhoneCode: {
      sent: createEventFn('two_step_auth_phone_code_sent'),
      sendError: createEventFn('two_step_auth_phone_code_send_error'),
      complete: createEventFn('two_step_auth_phone_code_complete'),
    },

    inactiveAccountDeletion: {
      statusChecked: createEventFn('inactive_account_deletion_status_checked'),
      firstEmailTaskRequest: createEventFn(
        'inactive_account_deletion_first_email_task_request'
      ),
      firstEmailTaskEnqueued: createEventFn(
        'inactive_account_deletion_first_email_task_enqueued'
      ),
      firstEmailTaskRejected: createEventFn(
        'inactive_account_deletion_first_email_task_rejected',
        {
          additionalMetrics: (metrics) => ({
            errorCode: metrics.errorCode,
          }),
        }
      ),
    },
    twoStepAuthPhoneRemove: {
      success: createEventFn('two_step_auth_phone_remove_success'),
    },
  };
}

export type GleanMetricsType = ReturnType<typeof gleanMetrics>;

const routePathToErrorPingFnMap = {
  '/account/create': 'registration.error',
  '/account/login': 'login.error',
};

const getPingFnWithPath = (path: string) =>
  Object.entries(routePathToErrorPingFnMap)
    .find(([k, _]) => path.endsWith(k))
    ?.at(1);

export const logErrorWithGlean = ({
  glean,
  request,
  error,
}: ErrorLoggerFnParams) => {
  const pingFn = getPingFnWithPath(request.path);
  if (pingFn) {
    const [funnel, event] = pingFn.split('.');
    const funnelFns =
      glean[
        funnel as keyof Omit<
          ReturnType<typeof gleanMetrics>,
          | 'resetPassword'
          | 'oauth'
          | 'thirdPartyAuth'
          | 'account'
          | 'twoFactorAuth'
          | 'twoFactorAuthSetup'
          | 'inactiveAccountDeletion'
          | 'twoStepAuthPhoneRemove'
        >
      ];
    funnelFns[event as keyof typeof funnelFns](request, {
      // we use the errno's key here because the human readable error message
      // can be too verbose, while the short error title is too low resolution
      // since some errors are grouped under the same title (e.g. "Bad
      // Request")
      reason: AppError.mapErrnoToKey(error),
    });
  }
};
