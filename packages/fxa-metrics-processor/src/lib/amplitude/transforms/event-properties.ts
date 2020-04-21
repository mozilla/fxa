/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GROUPS, Group, Event, EventContext, Services } from './types';
import { ServiceNameAndClientIdMapper } from './common';

function NOP() {
  return {};
}

const EVENT_PROPERTIES: {
  [key in Group]: (
    evt: Event,
    ctx: EventContext
  ) => ReturnType<typeof mapAmplitudeEventPropertiesFromGroup>;
} = {
  [GROUPS.activity]: NOP,
  [GROUPS.button]: NOP,
  [GROUPS.connectDevice]: mapConnectDeviceFlow,
  [GROUPS.email]: mapEmailType,
  [GROUPS.emailFirst]: NOP,
  [GROUPS.login]: NOP,
  [GROUPS.notify]: NOP,
  [GROUPS.registration]: mapDomainValidationResult,
  [GROUPS.rp]: NOP,
  [GROUPS.settings]: mapDisconnectReason,
  [GROUPS.sms]: NOP,
  [GROUPS.sub]: NOP,
  [GROUPS.subCancel]: NOP,
  [GROUPS.subManage]: NOP,
  [GROUPS.subPayManage]: NOP,
  [GROUPS.subPaySetup]: NOP,
  [GROUPS.subPayUpgrade]: NOP,
  [GROUPS.subSupport]: NOP,
} as const;

const CONNECT_DEVICE_FLOWS = {
  'app-store': 'store_buttons',
  install_from: 'store_buttons',
  pair: 'pairing',
  signin_from: 'signin',
  sms: 'sms',
} as const;

type ConnectDeviceFlowKeys = keyof typeof CONNECT_DEVICE_FLOWS;
type ConnectDeviceEventProperties = {
  connect_device_flow: string;
  connect_device_os?: string;
};
type EmailTypeEventProperties = {
  email_type: string;
  email_provider?: string;
  email_sender?: string;
  email_service?: string;
  email_template?: string;
  email_version?: string;
};
type DisconnectReason = {
  reason: string;
};
type ValidationResult = { validation_result: string };
export type AmplitudeEventProperties = Partial<
  ConnectDeviceEventProperties &
    EmailTypeEventProperties &
    DisconnectReason &
    ValidationResult & {
      plan_id: string;
      product_id: string;
      service: string;
      oauth_client_id: string;
    }
>;

export function createAmplitudeEventPropertiesMapper(
  servicePropMapper: ServiceNameAndClientIdMapper
) {
  return (evt: Event, context: EventContext): AmplitudeEventProperties => {
    const { serviceName: service, clientId: oauthClientId } = servicePropMapper(context);

    return {
      plan_id: context.planId,
      product_id: context.productId,
      service,
      oauth_client_id: oauthClientId,
      ...mapAmplitudeEventPropertiesFromGroup(evt, context),
    };
  };
}

function mapAmplitudeEventPropertiesFromGroup(
  evt: Event,
  context: EventContext
):
  | {}
  | ConnectDeviceEventProperties
  | EmailTypeEventProperties
  | DisconnectReason
  | ValidationResult {
  if (evt.group in EVENT_PROPERTIES) {
    return EVENT_PROPERTIES[evt.group as Group](evt, context);
  }
  return {};
}

function mapConnectDeviceFlow(evt: Event): ConnectDeviceEventProperties | {} {
  if (evt.category && evt.category in CONNECT_DEVICE_FLOWS) {
    const connectDeviceFlow = CONNECT_DEVICE_FLOWS[evt.category as ConnectDeviceFlowKeys];
    const result: ConnectDeviceEventProperties = { connect_device_flow: connectDeviceFlow };

    if (evt.target) {
      result.connect_device_os = evt.target;
    }

    return result;
  }

  return {};
}

function mapEmailType(evt: Event, context: EventContext): EmailTypeEventProperties | {} {
  if (evt.category && context.emailTypes && evt.category in context.emailTypes) {
    const emailType = context.emailTypes[evt.category];
    const result: EmailTypeEventProperties = {
      email_type: emailType,
      email_provider: context.emailDomain,
      email_sender: context.emailSender,
      email_service: context.emailService,
    };

    const { templateVersion } = context;
    if (templateVersion) {
      result.email_template = evt.category;
      result.email_version = templateVersion;
    }

    return result;
  }

  return {};
}

function mapDisconnectReason(evt: Event): DisconnectReason | {} {
  if (evt.type === 'disconnect_device' && evt.category) {
    return { reason: evt.category };
  }
  return {};
}

function mapDomainValidationResult(evt: Event): ValidationResult | {} {
  // This function is called for all fxa_reg events, only add the event
  // properties for the results pertaining to domain_validation_result.
  if (evt.type === 'domain_validation_result' && evt.category) {
    return { validation_result: evt.category };
  }
  return {};
}
