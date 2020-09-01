import { Config, defaultConfig } from './config';
import { Plan, Profile, Customer, Subscription, Token } from '../store/types';
import * as Amplitude from './amplitude';

// TODO: Use a better type here
export interface APIFetchOptions {
  [propName: string]: any;
}

type ErrorResponseBody = {
  code?: string;
  statusCode?: number;
  errno?: number;
  error?: string;
  message?: string;
  info?: string;
};

export class APIError extends Error {
  body: ErrorResponseBody | null;
  response: Response | null | undefined;
  code: string | null;
  statusCode: number | null;
  errno: number | null;
  error: string | null;

  constructor(
    body?: ErrorResponseBody,
    response?: Response,
    code?: string,
    errno?: number,
    error?: string,
    statusCode?: number,
    ...params: Array<any>
  ) {
    super(...params);
    this.response = response;
    this.body = body || null;
    this.code = code || null;
    this.statusCode = statusCode || null;
    this.errno = errno || null;
    this.error = error || null;

    if (this.body) {
      const { code, errno, error, message, statusCode } = this.body;
      Object.assign(this, { code, errno, error, message, statusCode });
    }
  }
}

let accessToken = '';
let config: Config = defaultConfig();

export function updateAPIClientConfig(configFromMeta: any) {
  config = configFromMeta;
}

export function updateAPIClientToken(token: string) {
  accessToken = token;
}

async function apiFetch(
  method: string,
  path: string,
  options: APIFetchOptions = {}
) {
  const response = await fetch(path, {
    mode: 'cors',
    credentials: 'omit',
    method,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });
  if (response.status >= 400) {
    let body = {};
    try {
      // Parse the body as JSON, but will fail if things have really gone wrong
      body = await response.json();
    } catch (_) {
      // No-op
    }
    throw new APIError(body, response);
  }
  return response.json();
}

export async function apiFetchProfile(): Promise<Profile> {
  return apiFetch('GET', `${config.servers.profile.url}/v1/profile`);
}

export async function apiFetchPlans(): Promise<Plan[]> {
  return apiFetch(
    'GET',
    `${config.servers.auth.url}/v1/oauth/subscriptions/plans`
  );
}

export async function apiFetchSubscriptions(): Promise<Subscription[]> {
  return apiFetch(
    'GET',
    `${config.servers.auth.url}/v1/oauth/subscriptions/active`
  );
}

export async function apiFetchToken(): Promise<Token> {
  return apiFetch('POST', `${config.servers.oauth.url}/v1/introspect`, {
    body: JSON.stringify({
      token: accessToken,
    }),
  });
}

export async function apiFetchCustomer(): Promise<Customer> {
  return apiFetch(
    'GET',
    `${config.servers.auth.url}/v1/oauth/subscriptions/customer`
  );
}

export async function apiUpdateSubscriptionPlan(params: {
  subscriptionId: string;
  planId: string;
  productId: string;
}) {
  const { subscriptionId, planId, productId } = params;
  const metricsOptions = {
    planId,
    productId,
  };
  try {
    Amplitude.updateSubscriptionPlan_PENDING(metricsOptions);
    const result = await apiFetch(
      'PUT',
      `${config.servers.auth.url}/v1/oauth/subscriptions/active/${subscriptionId}`,
      { body: JSON.stringify({ planId }) }
    );
    Amplitude.updateSubscriptionPlan_FULFILLED(metricsOptions);
    return result;
  } catch (error) {
    Amplitude.updateSubscriptionPlan_REJECTED({
      ...metricsOptions,
      error,
    });
    throw error;
  }
}

export async function apiCancelSubscription(params: {
  subscriptionId: string;
  planId: string;
  productId: string;
}) {
  const { subscriptionId } = params;
  const metricsOptions = {
    planId: params.planId,
    productId: params.productId,
  };
  try {
    Amplitude.cancelSubscription_PENDING(metricsOptions);
    await apiFetch(
      'DELETE',
      `${config.servers.auth.url}/v1/oauth/subscriptions/active/${subscriptionId}`
    );
    Amplitude.cancelSubscription_FULFILLED(metricsOptions);
    // Cancellation response does not include subscriptionId, but we want it.
    return { subscriptionId };
  } catch (error) {
    Amplitude.cancelSubscription_REJECTED({
      ...metricsOptions,
      error,
    });
    throw error;
  }
}

export async function apiReactivateSubscription({
  subscriptionId,
  planId,
}: {
  subscriptionId: string;
  planId: string;
}) {
  await apiFetch(
    'POST',
    `${config.servers.auth.url}/v1/oauth/subscriptions/reactivate`,
    { body: JSON.stringify({ subscriptionId }) }
  );
  return {
    subscriptionId,
    planId,
  };
}

export async function apiCreateCustomer(params: {
  displayName: string;
  idempotencyKey: string;
}): Promise<Customer> {
  return apiFetch(
    'POST',
    `${config.servers.auth.url}/v1/oauth/subscriptions/customer`,
    { body: JSON.stringify(params) }
  );
}

export async function apiCreateSubscriptionWithPaymentMethod(params: {
  priceId: string;
  productId: string;
  paymentMethodId?: string;
  idempotencyKey: string;
}): Promise<{
  id: string;
  latest_invoice: {
    id: string;
    payment_intent: {
      id: string;
      client_secret: string;
      status: string;
      payment_method: string;
    };
  };
}> {
  const { priceId, paymentMethodId, idempotencyKey } = params;
  const metricsOptions = {
    planId: params.priceId,
    productId: params.productId,
  };
  try {
    Amplitude.createSubscriptionWithPaymentMethod_PENDING(metricsOptions);
    const result = await apiFetch(
      'POST',
      `${config.servers.auth.url}/v1/oauth/subscriptions/active/new`,
      { body: JSON.stringify({ priceId, paymentMethodId, idempotencyKey }) }
    );
    Amplitude.createSubscriptionWithPaymentMethod_FULFILLED({
      ...metricsOptions,
      sourceCountry: result.sourceCountry,
    });
    return result.subscription;
  } catch (error) {
    Amplitude.createSubscriptionWithPaymentMethod_REJECTED({
      ...metricsOptions,
      error,
    });
    throw error;
  }
}

export async function apiRetryInvoice(params: {
  invoiceId: string;
  paymentMethodId: string;
  idempotencyKey: string;
}): Promise<{
  id: string;
  payment_intent: {
    id: string;
    client_secret: string;
    status: string;
    payment_method: string;
  };
}> {
  return apiFetch(
    'POST',
    `${config.servers.auth.url}/v1/oauth/subscriptions/invoice/retry`,
    { body: JSON.stringify(params) }
  );
}

export type FilteredSetupIntent = {
  client_secret: string;
  created: number;
  next_action: string | null;
  payment_method: string | null;
  status: string;
};

export async function apiCreateSetupIntent(): Promise<FilteredSetupIntent> {
  return apiFetch(
    'POST',
    `${config.servers.auth.url}/v1/oauth/subscriptions/setupintent/create`
  );
}

export async function apiUpdateDefaultPaymentMethod(params: {
  paymentMethodId: string;
}): Promise<Customer> {
  const { paymentMethodId } = params;
  try {
    Amplitude.updateDefaultPaymentMethod_PENDING();
    const result = await apiFetch(
      'POST',
      `${config.servers.auth.url}/v1/oauth/subscriptions/paymentmethod/default`,
      { body: JSON.stringify({ paymentMethodId }) }
    );
    Amplitude.updateDefaultPaymentMethod_FULFILLED();
    return result;
  } catch (error) {
    Amplitude.updateDefaultPaymentMethod_REJECTED({
      error,
    });
    throw error;
  }
}
