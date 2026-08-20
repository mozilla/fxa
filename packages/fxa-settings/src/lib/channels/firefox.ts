/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constants } from "../constants";

export enum FirefoxCommand {
  AccountDeleted = 'fxaccounts:delete',
  ProfileChanged = 'profile:change',
  PasswordChanged = 'fxaccounts:change_password',
  FxAStatus = 'fxaccounts:fxa_status',
  Login = 'fxaccounts:login',
  Logout = 'fxaccounts:logout',
  Loaded = 'fxaccounts:loaded',
  Error = 'fxError',
  OAuthLogin = 'fxaccounts:oauth_login',
  CanLinkAccount = 'fxaccounts:can_link_account',
  // opens sync preferences if user is signed in to sync
  // use as: firefox.send(FirefoxCommand.SyncPreferences, {ok: true});
  // caveat: if browser does not support the command
  // or the user is not signed in to sync
  // there is no response and the command fails silently
  // As of May 2025, this command is available on desktop
  // support will be added on Android (https://bugzilla.mozilla.org/show_bug.cgi?id=1968130)
  // and iOS (https://github.com/mozilla-mobile/firefox-ios/issues/26837)
  SyncPreferences = 'fxaccounts:sync_preferences',
  // Check if Firefox has an active OAuth flow
  OAuthFlowIsActive = 'fxaccounts:oauth_flow_is_active',
  // Start new OAuth flow and get fresh params
  OAuthFlowBegin = 'fxaccounts:oauth_flow_begin',

  // Pairing commands — sent between web page and Firefox browser
  PairHeartbeat = 'fxaccounts:pair_heartbeat',
  PairSupplicantMetadata = 'fxaccounts:pair_supplicant_metadata',
  PairAuthorize = 'fxaccounts:pair_authorize',
  PairDecline = 'fxaccounts:pair_decline',
  PairComplete = 'fxaccounts:pair_complete',
  PairPreferences = 'fxaccounts:pair_preferences',

  PairOauthStart = 'fxaccounts:pair_oauth_start',
  PairOauthFinish = 'fxaccounts:pair_oauth_finish',
}

export interface FirefoxMessageDetail {
  id: string;
  message?: FirefoxMessage;
}

export interface FirefoxMessage {
  command: FirefoxCommand;
  data: Record<string, any> & {
    error?: {
      message: string;
      stack: string;
    };
  };
  params?: Record<string, any>; // Some commands use params instead of data
  messageId: string;
  error?: string;
}

export interface FirefoxMessageError {
  error?: string;
  stack?: string;
}

interface ProfileUid {
  uid: hexstring;
}

interface ProfileMetricsEnabled {
  metricsEnabled: boolean;
}

type Profile = ProfileUid | ProfileMetricsEnabled;
type FirefoxEvent = CustomEvent<FirefoxMessageDetail | string>;

// This is defined in the Firefox source code:
// https://searchfox.org/mozilla-central/source/services/fxaccounts/tests/xpcshell/test_web_channel.js#348
type FxAStatusRequest = {
  service: string; // ex. 'sync'
  isPairing: boolean;
  context: string; // ex. 'fx_desktop_v3'
};

export type FxAStatusResponse = {
  capabilities: {
    engines: string[];
    multiService: boolean;
    pairing: boolean;
    pairingVersion?: number;
    choose_what_to_sync?: boolean;
    keys_optional?: boolean;
    can_link_account_uid?: boolean;
    hasSyncKeys?: boolean;
  };
  clientId?: string;
  signedInUser?: SignedInUser;

};

export type SignedInUser = {
  email: string;
  // This can be undefined when the browser account
  // is in an "Account disconnected" state
  sessionToken: string | undefined;
  uid: string;
  verified: boolean;
};

export type PairOAuthStartState = {
  state:string,
  scope:string,
  code_challenge: string,
  keys_jwk:string
}
export type PairOAuthFinishState = {
  state:string,
  code:string
}

export type FxALoginRequest = {
  email: string;
  sessionToken: hexstring;
  uid: hexstring;
  verified: boolean;
  keyFetchToken?: hexstring;
  unwrapBKey?: string;
  verifiedCanLinkAccount?: boolean;
  services?: WebChannelServices;
};

export type SyncEngines = {
  offeredEngines?: string[];
  declinedEngines?: string[];
};

export type WebChannelServices =
  | {
      sync: SyncEngines;
    }
  // For sync optional flows (currently Relay and SmartWindow)
  | {
      relay: {};
    }
  | {
      smartwindow: {};
    }
  | {
      vpn: {};
    };

// ref: [FxAccounts.sys.mjs](https://searchfox.org/mozilla-central/rev/82828dba9e290914eddd294a0871533875b3a0b5/services/fxaccounts/FxAccounts.sys.mjs#910)
export type FxALoginSignedInUserRequest = FxALoginRequest & {
  authAt: number;
};

export type FxAOAuthLogin = {
  action: string;
  code: string;
  redirect: string;
  state: string;
  // OAuth desktop looks at the sync engine list in fxaLogin.
  // OAuth mobile currently looks at fxaOAuthLogin, but should
  // eventually move to look at fxaLogin as well to prevent FXA-10596.
  declinedSyncEngines?: string[];
  offeredSyncEngines?: string[];
  /**
   * Space-separated list of granted scopes, sent so the browser knows
   * which scopes were authorized in this flow; this implements ADR 0049.
   */
  scope?: string;
};

// ref: https://searchfox.org/mozilla-central/rev/82828dba9e290914eddd294a0871533875b3a0b5/services/fxaccounts/FxAccountsWebChannel.sys.mjs#230
export type FxACanLinkAccount = {
  email: string;
  // To allow secondary email sign-ins, we send the UID up to the browser when
  // the UID is available and the 'can_link_account_uid' capability is true.
  uid?: string;
};

type FxACanLinkAccountResponse = {
  ok: boolean;
};

export type FxAOAuthFlowIsActiveResponse = {
  isActive: boolean;
};

// Pairing types
export type PairHeartbeatResponse = {
  err?: { errno: number; message: string };
  suppAuthorized?: boolean;
};

export type PairSupplicantMetadataResponse = {
  ua: string;
  city: string;
  country: string;
  region: string;
  ipAddress: string;
};

export type FxAOAuthFlowBeginResponse = {
  action: string;
  response_type: string;
  access_type: string;
  scope: string;
  client_id: string;
  state: string;
  code_challenge?: string;
  code_challenge_method?: string;
  // Forward to /authorization, otherwise the OAuth code is keyless and Sync never enables.
  keys_jwk?: string;
};

// Builds the oauth_webchannel_v1 Sync sign-in URL search params from the
// fxa_oauth_flow_begin response. Callers may set additional params on the
// returned URLSearchParams (e.g. entrypoint, email, utm_*).
export function buildSyncOAuthSearch(
  oauthParams: FxAOAuthFlowBeginResponse
): URLSearchParams {
  const search = new URLSearchParams({
    context: 'oauth_webchannel_v1',
    service: 'sync',
    client_id: oauthParams.client_id,
    state: oauthParams.state,
    scope: oauthParams.scope,
    access_type: oauthParams.access_type ?? 'offline',
    response_type: oauthParams.response_type ?? 'code',
  });
  if (oauthParams.action) search.set('action', oauthParams.action);
  if (oauthParams.code_challenge) {
    search.set('code_challenge', oauthParams.code_challenge);
  }
  if (oauthParams.code_challenge_method) {
    search.set('code_challenge_method', oauthParams.code_challenge_method);
  }
  if (oauthParams.keys_jwk) search.set('keys_jwk', oauthParams.keys_jwk);
  return search;
}

// timeout tuned for device latency
// max timeout of 100-200 ms would be optimal for an ultra-snappy UX, but could cause false negatives on mobile
// compromising with 500ms for safer mobile support without being noticeably long if it times out
const DEFAULT_SEND_TIMEOUT_LENGTH_MS = 500;

let messageIdSuffix = 0;
/**
 * Create a messageId for a given command/data combination.
 *
 * messageId is sent to the relier who is expected to respond
 * with the same messageId. Used to keep track of outstanding requests
 * and is required in at least Firefox iOS to send back a response.
 * */
function createMessageId() {
  // If two messages are created within the same millisecond, Date.now()
  // returns the same value. Append a suffix that ensures uniqueness.
  return `${Date.now()}${++messageIdSuffix}`;
}

export class Firefox extends EventTarget {
  private broadcastChannel?: BroadcastChannel;
  readonly id: string;
  constructor() {
    super();
    this.id = 'account_updates';
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('firefox_accounts');
      this.broadcastChannel.addEventListener('message', (event) =>
        this.handleBroadcastEvent(event)
      );
    }
    window.addEventListener('WebChannelMessageToContent', (event) =>
      this.handleFirefoxEvent(event as FirefoxEvent)
    );
  }

  private handleBroadcastEvent(event: MessageEvent) {
    console.debug('broadcast', event);
    const envelope = JSON.parse(event.data);
    this.dispatchEvent(
      new CustomEvent(envelope.name, { detail: envelope.data })
    );
  }

  private handleFirefoxEvent(event: FirefoxEvent) {
    console.debug('webchannel', event);
    try {
      const detail =
        typeof event.detail === 'string'
          ? (JSON.parse(event.detail) as FirefoxMessageDetail)
          : event.detail;
      if (detail.id !== this.id) {
        return;
      }
      const message = detail.message;
      if (message) {
        if (message.error || message.data?.error) {
          const error = {
            message: message.error || message.data.error?.message,
            stack: message.data?.error?.stack,
          };
          this.dispatchEvent(
            new CustomEvent(FirefoxCommand.Error, { detail: error })
          );
        } else {
          const responseData = message.data || message.params;
          this.dispatchEvent(
            new CustomEvent(message.command, { detail: responseData })
          );
        }
      }
    } catch (e) {
      // TODO: log and ignore
    }
  }

  private formatEventDetail(
    command: FirefoxCommand,
    data: any,
    messageId: string = createMessageId()
  ) {
    const detail = {
      id: this.id,
      message: {
        command,
        data,
        messageId,
      },
    };

    // Firefox Desktop and Fennec >= 50 expect the detail to be
    // sent as a string and fxios as an object.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=1275616 and
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1238128
    if (navigator.userAgent.toLowerCase().includes('fxios')) {
      return detail;
    }
    return JSON.stringify(detail);
  }

  /**
   * Save the name of the event into sessionStorage, used for testing.
   *
   * @param {String} command
   * @private
   */
  private saveEventForTests(command: FirefoxCommand, data: any) {
    const agent = navigator.userAgent;
    const isWebDriver = navigator.webdriver;
    if (!isWebDriver && agent.indexOf('FxATester') === -1) {
      // not running in automated tests, no reason to store this info.
      return;
    }

    let storedEvents;
    try {
      storedEvents =
        JSON.parse(sessionStorage.getItem('webChannelEvents') || '') || [];
    } catch (e) {
      storedEvents = [];
    }
    storedEvents.push({ command, data });
    try {
      sessionStorage.setItem('webChannelEvents', JSON.stringify(storedEvents));
    } catch (e) {}
  }

  // send a message to the browser chrome
  send(command: FirefoxCommand, data: any, messageId?: string) {
    const detail = this.formatEventDetail(command, data, messageId);
    window.dispatchEvent(
      new CustomEvent('WebChannelMessageToChrome', {
        detail,
      })
    );
    this.saveEventForTests(command, data);
  }

  // broadcast a message to other tabs
  broadcast(name: FirefoxCommand, data: any) {
    this.broadcastChannel?.postMessage(JSON.stringify({ name, data }));
  }

  accountDeleted(uid: hexstring) {
    this.send(FirefoxCommand.AccountDeleted, { uid });
    this.broadcast(FirefoxCommand.AccountDeleted, { uid });
  }

  passwordChanged(
    email: string,
    uid: hexstring,
    sessionToken: hexstring,
    verified: boolean,
    keyFetchToken?: hexstring,
    unwrapBKey?: hexstring
  ) {
    this.send(FirefoxCommand.PasswordChanged, {
      email,
      uid,
      sessionToken,
      verified,
      keyFetchToken,
      unwrapBKey,
    });
    this.broadcast(FirefoxCommand.PasswordChanged, {
      uid,
    });
  }

  profileChanged(profile: Profile) {
    this.send(FirefoxCommand.ProfileChanged, profile);
    this.broadcast(FirefoxCommand.ProfileChanged, profile);
  }

  async fxaStatus(options: FxAStatusRequest): Promise<FxAStatusResponse> {
    // We must wait for the browser to send a web channel message
    // in response to the fxaLogin command. Without this we navigate the user before
    // the login completes, resulting in an "Invalid token" error on the next page.
    return new Promise((resolve) => {
      const eventHandler = (firefoxEvent: any) => {
        this.removeEventListener(FirefoxCommand.FxAStatus, eventHandler);
        resolve(firefoxEvent.detail as FxAStatusResponse);
      };
      this.addEventListener(FirefoxCommand.FxAStatus, eventHandler);

      // requestAnimationFrame ensures the event listener is added first
      // otherwise, there is a race condition
      requestAnimationFrame(() => {
        this.send(FirefoxCommand.FxAStatus, options);
      });
    });
  }

  fxaLogin(options: FxALoginRequest): void {
    this.send(FirefoxCommand.Login, options);
  }

  fxaLoginSignedInUser(options: FxALoginSignedInUserRequest) {
    this.send(FirefoxCommand.Login, options);
  }

  fxaLogout(options: { uid: string }) {
    this.send(FirefoxCommand.Logout, options);
  }

  fxaLoaded(options: any) {
    this.send(FirefoxCommand.Loaded, options);
  }

  fxaOAuthLogin(options: FxAOAuthLogin) {
    this.send(FirefoxCommand.OAuthLogin, options);
  }

  fxaOpenSyncPreferences() {
    this.send(FirefoxCommand.SyncPreferences, { ok: true });
  }

  async fxaCanLinkAccount(
    options: FxACanLinkAccount
  ): Promise<FxACanLinkAccountResponse> {
    return new Promise((resolve) => {
      const eventHandler = (firefoxEvent: any) => {
        this.removeEventListener(FirefoxCommand.CanLinkAccount, eventHandler);
        resolve(firefoxEvent.detail || { ok: false });
      };

      this.addEventListener(FirefoxCommand.CanLinkAccount, eventHandler);
      requestAnimationFrame(() => {
        this.send(FirefoxCommand.CanLinkAccount, options);
      });
    });
  }

  /** Check if Firefox has an active OAuth flow in memory. */
  async fxaOAuthFlowIsActive(): Promise<FxAOAuthFlowIsActiveResponse> {
    let timeoutId: number;
    return Promise.race<FxAOAuthFlowIsActiveResponse>([
      new Promise<FxAOAuthFlowIsActiveResponse>((resolve) => {
        const eventHandler = (firefoxEvent: any) => {
          clearTimeout(timeoutId);
          this.removeEventListener(
            FirefoxCommand.OAuthFlowIsActive,
            eventHandler
          );
          const response = firefoxEvent.detail as FxAOAuthFlowIsActiveResponse;
          resolve(response);
        };

        this.addEventListener(FirefoxCommand.OAuthFlowIsActive, eventHandler);
        requestAnimationFrame(() => {
          this.send(FirefoxCommand.OAuthFlowIsActive, {});
        });
      }),
      new Promise<FxAOAuthFlowIsActiveResponse>((resolve) => {
        timeoutId = window.setTimeout(() => {
          // If timeout, assume no active flow (older Firefox or not supported)
          resolve({ isActive: false });
        }, DEFAULT_SEND_TIMEOUT_LENGTH_MS);
      }),
    ]);
  }

  /** Start new OAuth flow in Firefox and get fresh params for recovery. */
  async fxaOAuthFlowBegin(
    scopes: string[]
  ): Promise<FxAOAuthFlowBeginResponse | null> {
    let timeoutId: number;
    return Promise.race<FxAOAuthFlowBeginResponse | null>([
      new Promise<FxAOAuthFlowBeginResponse | null>((resolve) => {
        const eventHandler = (firefoxEvent: any) => {
          clearTimeout(timeoutId);
          this.removeEventListener(FirefoxCommand.OAuthFlowBegin, eventHandler);
          const response = firefoxEvent.detail as FxAOAuthFlowBeginResponse;
          resolve(response);
        };

        this.addEventListener(FirefoxCommand.OAuthFlowBegin, eventHandler);
        requestAnimationFrame(() => {
          this.send(FirefoxCommand.OAuthFlowBegin, { scopes });
        });
      }),
      new Promise<FxAOAuthFlowBeginResponse | null>((resolve) => {
        timeoutId = window.setTimeout(() => {
          resolve(null);
        }, DEFAULT_SEND_TIMEOUT_LENGTH_MS);
      }),
    ]);
  }

  // Pairing methods

  /** Poll for heartbeat — authority calls this every ~1000ms. */
  async pairHeartbeat(channelId: string): Promise<PairHeartbeatResponse> {
    let timeoutId: number;
    let eventHandler: EventListener | null = null;
    return Promise.race<PairHeartbeatResponse>([
      new Promise<PairHeartbeatResponse>((resolve) => {
        eventHandler = (firefoxEvent: Event) => {
          clearTimeout(timeoutId);
          this.removeEventListener(FirefoxCommand.PairHeartbeat, eventHandler!);
          resolve(
            (firefoxEvent as CustomEvent).detail as PairHeartbeatResponse
          );
        };
        this.addEventListener(FirefoxCommand.PairHeartbeat, eventHandler);
        requestAnimationFrame(() => {
          this.send(FirefoxCommand.PairHeartbeat, { channel_id: channelId });
        });
      }),
      new Promise<PairHeartbeatResponse>((resolve) => {
        timeoutId = window.setTimeout(() => {
          if (eventHandler) {
            this.removeEventListener(
              FirefoxCommand.PairHeartbeat,
              eventHandler
            );
          }
          resolve({});
        }, DEFAULT_SEND_TIMEOUT_LENGTH_MS);
      }),
    ]);
  }

  /** Request supplicant device metadata from browser. */
  async pairSupplicantMetadata(
    channelId: string
  ): Promise<PairSupplicantMetadataResponse> {
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.removeEventListener(
          FirefoxCommand.PairSupplicantMetadata,
          eventHandler
        );
        reject(new Error('pairSupplicantMetadata timed out'));
      }, 10000);

      const eventHandler = (firefoxEvent: Event) => {
        clearTimeout(timeoutId);
        this.removeEventListener(
          FirefoxCommand.PairSupplicantMetadata,
          eventHandler
        );
        resolve(
          (firefoxEvent as CustomEvent).detail as PairSupplicantMetadataResponse
        );
      };
      this.addEventListener(
        FirefoxCommand.PairSupplicantMetadata,
        eventHandler
      );
      requestAnimationFrame(() => {
        this.send(FirefoxCommand.PairSupplicantMetadata, {
          channel_id: channelId,
        });
      });
    });
  }

  /**
   * Send a pairing command using the request/response pattern (not
   * fire-and-forget) so the browser's WebChannel handler completes
   * before we proceed — matches Backbone's authority.js which uses
   * request() instead of send().  Resolves after the browser responds
   * or after a timeout (whichever comes first).
   */
  private sendPairingCommand(
    command: FirefoxCommand,
    channelId: string
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const timeoutId = window.setTimeout(() => {
        this.removeEventListener(command, handler);
        resolve(); // resolve anyway — browser may not respond
      }, DEFAULT_SEND_TIMEOUT_LENGTH_MS);

      const handler = () => {
        clearTimeout(timeoutId);
        this.removeEventListener(command, handler);
        resolve();
      };
      this.addEventListener(command, handler);
      requestAnimationFrame(() => {
        this.send(command, { channel_id: channelId });
      });
    });
  }

  /** Notify browser that authority approved the pairing request. */
  async pairAuthorize(channelId: string): Promise<void> {
    return this.sendPairingCommand(FirefoxCommand.PairAuthorize, channelId);
  }

  /** Notify browser that authority declined the pairing request. */
  async pairDecline(channelId: string): Promise<void> {
    return this.sendPairingCommand(FirefoxCommand.PairDecline, channelId);
  }

  /** Notify browser that pairing is complete. */
  async pairComplete(channelId: string): Promise<void> {
    return this.sendPairingCommand(FirefoxCommand.PairComplete, channelId);
  }

  /** Requests that a pairing oauth operation begin. This is the first half of pairing dance. */
  async pairOauthStart(msg:{
    scopes?: string[]
  }):Promise<PairOAuthStartState|undefined> {

    // Default sync scopes
    if (msg.scopes == null) {
      msg.scopes = [
        Constants.OAUTH_OLDSYNC_SCOPE,
        Constants.OAUTH_TRUSTED_PROFILE_SCOPE
      ];
    }

    return this._executeCommandWithResponse<PairOAuthStartState>(
      FirefoxCommand.PairOauthStart,
      msg,
      (event) => {
        if (event?.detail?.state == null) {
          throw new Error(`${FirefoxCommand.PairOauthFinish} missing state from event.details`);
        }
        if (event?.detail?.scope == null) {
          throw new Error(`${FirefoxCommand.PairOauthFinish} missing code from event.details`);
        }
        if (event?.detail?.code_challenge == null) {
          throw new Error(`${FirefoxCommand.PairOauthFinish} missing code_challenge from event.details`);
        }
        if (event?.detail?.keys_jwk == null) {
          throw new Error(`${FirefoxCommand.PairOauthFinish} missing keys_jwk from event.details`);
        }
        return event.detail as PairOAuthStartState;
      }
    )
  }

  /** Requests that a pairing oauth operation be finished. This is the second half of pairing dance. */
  async pairOauthFinish(msg:{
    client_id:string,
    state:string,
    scope:string,
    code_challenge:string,
  }):Promise<PairOAuthFinishState|undefined> {
    return this._executeCommandWithResponse<PairOAuthFinishState>(
      FirefoxCommand.PairOauthFinish,
      msg,
      (event) => {
        if (event?.detail?.code == null) {
          throw new Error(`${FirefoxCommand.PairOauthFinish} missing code from event.details`);
        }
        if (event?.detail?.state == null) {
          throw new Error(`${FirefoxCommand.PairOauthFinish} missing state from event.details`);
        }
        if (event.detail.state !== msg.state) {
          throw new Error(`${FirefoxCommand.PairOauthFinish} invalid state!`);

        }
        return event.detail as PairOAuthFinishState
      },
      10_000 // The final handshake makes a web call. Give it some leeway.
    )
  }

  /**
   * Utility method to help inovke web-channel commands with an expected.
   * @param cmd - The firefox command to execute
   * @param msg - The msg 'data' to send with the command
   * @param handleResp - A callback to handle a message returned in response by Firefox
   * @param timeout - Optional override, in milliseconds, to wait for a response. Defaults to 500 ms
   **/
  private async _executeCommandWithResponse<TResp>(
    cmd: FirefoxCommand,
    msg: any,
    handleResp:(event:any) => TResp,
    timeout = DEFAULT_SEND_TIMEOUT_LENGTH_MS
  ) {
    let timeoutId: number;
    let onResp:EventListenerOrEventListenerObject;
    return Promise.race<undefined | TResp>([
      new Promise<undefined | TResp>((resolve, reject) => {
        onResp = (event: any) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          this.removeEventListener(cmd, onResp);

          // Make sure the contract is fullfilled. There should be an event object returned.
          if (event == null) {
            throw new Error('event missing in response');
          }

          // The handler might throw an error and fail fast if the data looks wrong. Handle error
          // and reject if this happens.
          try {
            const resp = handleResp(event)

            resolve(resp);
          } catch (err) {
            reject(err);
          }
        }
        this.addEventListener(cmd, onResp);
        requestAnimationFrame(() => {
          console.log(`[[Firefox WebChannel] ${cmd} sent msg`, msg);
          this.send(cmd, msg);
        });
      }),

      new Promise((resolve) => {
        timeoutId = window.setTimeout(() => {
          console.warn(
            `[Firefox WebChannel] ${cmd} timed out or unavailable in this browser`
          );
          if (onResp) {
            this.removeEventListener(cmd, onResp)
          }
          resolve(undefined);
        }, timeout);
      }),
    ]);
  }




  /*
   * Sends an fxa_status and returns the signed in user if available.
   */
  async requestSignedInUser(
    context: string,
    isPairing: boolean,
    service: string
  ): Promise<undefined | SignedInUser> {
    let timeoutId: number;
    return Promise.race<undefined | SignedInUser>([
      new Promise<undefined | SignedInUser>((resolve) => {
        const handleFxAStatusEvent = (event: any) => {
          clearTimeout(timeoutId);
          this.removeEventListener(
            FirefoxCommand.FxAStatus,
            handleFxAStatusEvent
          );

          const status = event.detail as FxAStatusResponse;
          resolve(status.signedInUser);
        };

        this.addEventListener(FirefoxCommand.FxAStatus, handleFxAStatusEvent);
        // requestAnimationFrame ensures the event listener is added first
        // otherwise, there is a race condition
        requestAnimationFrame(() => {
          this.send(FirefoxCommand.FxAStatus, {
            context,
            isPairing,
            service,
          });
        });
      }),
      // Ideally, we would detect WebChannel support instead of relying on a timeout.
      // However, it's difficult to reliably detect all compatible environments —
      // including Firefox Desktop, Android (Fenix), and iOS (FxA iOS) — especially
      // when considering misconfigurations. For example, when using `localhost`
      // with a browser configured to talk to production or stage servers,
      // the WebChannel may be present but not able to communicate correctly.
      // Because of this, we fall back to a short timeout to detect unresponsiveness.
      new Promise((resolve) => {
        timeoutId = window.setTimeout(() => {
          console.warn(
            '[Firefox WebChannel] fxa_status timed out or unavailable in this browser'
          );
          resolve(undefined);
        }, DEFAULT_SEND_TIMEOUT_LENGTH_MS);
      }),
    ]);
  }
}

// Some non-firefox legacy browsers can't extend EventTarget.
// For those we can safely return a mock instance that
// implements the interface but does nothing because
// this functionality is only meant for firefox.
let canUseEventTarget = true;
try {
  new EventTarget();
} catch (e) {
  canUseEventTarget = false;
}
function noop() {}
function mock() {
  return Object.fromEntries(
    Object.getOwnPropertyNames(Firefox.prototype)
      .map((name) => [name, noop])
      .concat([
        ['addEventListener', noop],
        ['removeEventListener', noop],
        ['dispatchEvent', noop],
      ])
  ) as unknown as Firefox;
}
export const firefox = (() => {
  try {
    if (canUseEventTarget && typeof window.localStorage !== 'undefined') {
      return new Firefox();
    }
    return mock();
  } catch (_) {
    return mock();
  }
})();

export default firefox;
