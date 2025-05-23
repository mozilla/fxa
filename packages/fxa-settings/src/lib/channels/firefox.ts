/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    choose_what_to_sync?: boolean;
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

export type FxALoginRequest = {
  email: string;
  sessionToken: hexstring;
  uid: hexstring;
  verified: boolean;
  keyFetchToken?: hexstring;
  unwrapBKey?: string;
  verifiedCanLinkAccount?: boolean;
  services?:
    | {
        sync: {
          offeredEngines?: string[];
          declinedEngines?: string[];
        };
      }
    // For sync optional flows (currently only Relay)
    | {
        relay: {};
      };
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
};

// ref: https://searchfox.org/mozilla-central/rev/82828dba9e290914eddd294a0871533875b3a0b5/services/fxaccounts/FxAccountsWebChannel.sys.mjs#230
export type FxACanLinkAccount = {
  email: string;
};
type FxACanLinkAccountResponse = {
  ok: boolean;
};

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
        if (message.error || message.data.error) {
          const error = {
            message: message.error || message.data.error?.message,
            stack: message.data.error?.stack,
          };
          this.dispatchEvent(
            new CustomEvent(FirefoxCommand.Error, { detail: error })
          );
        } else {
          this.dispatchEvent(
            new CustomEvent(message.command, { detail: message.data })
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
