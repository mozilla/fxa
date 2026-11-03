# Support the ability to listen for authentication events to specific services

- Status: accepted
- Deciders: Segun Famisa, Lauren Zugai, Mark Hammond
- Date: 2026-09-24

Technical Story: [FXA-14892](https://mozilla-hub.atlassian.net/browse/FXA-14892)

> NOTE: This decision was made during Android Sync Decoupling and first written up in [this proposal](https://docs.google.com/document/d/1p_P41yibFqYYIbhdEjSnKtIYMrkczmDYikRShgFQ1Hs/edit?tab=t.7q3l1ioxqw0) by Android Engineering. It lives here as a documented FxA decision.

## Context and Problem Statement

Problem one-liner: for decoupling accounts from sync, services (like sync) need to know when an auth flow specific for the feature/service has just completed, so that they can respond to it.
For sync, that means, we want to update sync state storage after an auth flow specific for sync service.

We have multiple features that want to start an authentication flow and perform certain actions after their authentication has succeeded or failed.

Today, we really cannot tell which feature or service has requested authentication, and so our [observers' "**onAuthenticated**" event gets delivered to all the observers](https://searchfox.org/firefox-main/rev/3c71a541b0e7ac6e086907b38670dabca9174c45/mobile/android/android-components/components/concept/sync/src/main/java/mozilla/components/concept/sync/OAuthAccount.kt#220-226), but they have no way of knowing if the authentication event is for the service they care about.

It has not been a problem before now, as sync was the only real feature that needed to respond to authentication events. Now, with VPN & Relay, it is possible that the authentication event that just completed belonged to the other feature, and they don't necessarily want to respond to that event.

VPN worked around this problem (in a way that will be discussed below), because we also need to attempt to connect to VPN (or show an error, as the case may be) after a user has authenticated _for_ VPN.

## Considered Options

- Option 1 - Emulate the existing solution
- Option 2 - Get application-services to tell us which service was just authenticated for
  - 2.1 - Using the `state` parameter that fxa-client generates to identify auth flows.
  - 2.2 - Extending Rust's state machine to return the service
- Option 3 - Include the `service` in FxA's oauth_login web channel message where available

## Decision Outcome

Chosen option: "Option 3 - Include the `service` in FxA's oauth_login web channel message where available", because it needs no fxa-client (Rust) changes and no state tracked on Android. It also simplifies Desktop, which today has to remember `services` from `fxaccounts:login` until it handles it from `fxaccounts:oauth_login`.

FxA sends the same `services` object it already sends in `fxaccounts:login`, with no change to its layout: the service name is the key (e.g. `services.vpn = {}`). Desktop and Android read `services` from `fxaccounts:oauth_login`.

### Positive Consequences

- Desktop and Android read which service authenticated from the same message.
- No changes to fxa-client.

### Neutral Consequences

- Android reads the sync engine lists from the top-level `declinedSyncEngines` / `offeredSyncEngines` in `fxaccounts:oauth_login`, and Desktop reads them from `services.sync` in `fxaccounts:login`, until both platforms stop reading them. Per-device sync settings keeps CWTS in Firefox.
- `services.sync` in `fxaccounts:oauth_login` is `{}`, matching other services.
- If FxA shows CWTS at sign-up again, FxA stores the choices (e.g. in local storage) instead of Firefox, and sends them under `services.sync`.

### Negative Consequences

- FxA sends `services` in both `fxaccounts:login` and `fxaccounts:oauth_login` until Desktop versions that read it from `fxaccounts:login` are no longer supported.

## Pros and Cons of the Options

Whichever option we go with here other than option 1, we'd need to update `AccountObserver`'s `onAuthenticated()` and `onAuthFlowError()` callbacks to pass in the identifier we decide on. Something like:

```kotlin
interface AccountObserver {
  fun onAuthenticated(identifier..., account: OAuthAccount, authType: AuthType)
  fun onAuthFlowError(identifier..., error..)
}
```

### Option 1 - Emulate the existing solution

VPN was the first feature to try to solve this problem. The VPN use-case is that when a user clicks a toggle to enable the feature, we want to start an authentication flow, and only when we get the **_onAuthenticated_** callback, do we want to then start connecting the VPN.

The problem is that, if the user then goes to the sync to authenticate, we will also get the same callback, but that was for sync, so we should not be trying to kickstart a VPN connection flow.
To solve this problem, the VPN feature creates a **_IpProtectionFxaAuthFlowObserver_**

```kotlin
class IPProtectionActivityAuthFlowObserver(
  private val shouldNotify: Lazy<Boolean>,
  ....
) : AccountObserver {

    override fun onAuthenticated(account: OAuthAccount, authType: AuthType) {
        if (shouldNotify.value) {
            // handle auth event
        }
    }
}
```

We then embed this observer into the AuthCustomTabActivity , and shouldNotify is computed based on an intent extra like so:

```kotlin
class AuthCustomTabActivity : ExternalAppBrowserActivity() {

    private val ipProtectionActivityAuthFlowObserver =
        IPProtectionActivityAuthFlowObserver(
            shouldNotify = lazy { intent.getBooleanExtra(INTENT_ON_COMPLETE, false) },
            ...
        )
    ...
}
```

And when the custom tab activity is created, we pass in the [INTENT_ON_COMPLETE extra - in the IPProtectionFragment](https://searchfox.org/firefox-main/rev/3c71a541b0e7ac6e086907b38670dabca9174c45/mobile/android/fenix/app/src/main/java/org/mozilla/fenix/settings/IPProtectionFragment.kt#154).

**Pros**

- It demonstrably works without a doubt.

**Cons**

- It will likely be tricky to scale to other features that need to handle their own specific authentication events - each feature/service would have to:
  - Register their own "identifier" flags in the intent,
  - Register their own auth flow observer.
- Assumes that authentication will always happen through a custom tab activity.
  - That's true today, but there are active thoughts about moving away from a custom tab authentication - or at least, to allow some forms of authentication to take place in a regular web browser, and this current approach would not survive there.

### Option 2 - Get application-services to tell us which service was just authenticated for

For this option, we are considering these options:

#### 2.1 - Using the `state` parameter that fxa-client generates to identify auth flows.

During an auth flow, [fxa–client generates a `state`](https://github.com/mozilla/application-services/blob/97fadb81fa3e7578c72c977ed66f6ae63be0e45d/components/fxa-client/src/internal/oauth.rs#L299) string that gets returned to the client as part of the auth url. This is always uniquely generated, and could be a good proxy for identifying a specific auth flow that a feature requested.

**Pros**

- It is always present in the auth url, as well as in the [FxaWebChannel messages & auth data](https://searchfox.org/firefox-main/rev/06fa2674be3db4f3b623bad938282310509cc54b/mobile/android/android-components/components/feature/accounts/src/main/java/mozilla/components/feature/accounts/FxaWebChannelFeature.kt#532,541-548). So we are able to know the "state" & request for which this authentication flow succeeded or failed.
- Does not need any upstream changes

**Cons**

- The feature needs to keep track of the state, until the authentication terminates, in order to know if the authentication in flight belongs to the specific flow they started.
- In the event that fxa-client decides to stop sending the state, our implementation breaks without them knowing.
- The account/auth states of authentication starts to diverge - with some kept within fxa-client, and some kept outside.

#### 2.2 - Extending Rust's state machine to return the service

When we are authenticating, we use fxa–client's state machine, by calling `processEvent()` with a BeginAuthFlow event which already includes the service we want to authenticate into, and we get back an `Authorizing` state that contains a url (See [fxa-client code](https://github.com/mozilla/application-services/blob/97fadb81fa3e7578c72c977ed66f6ae63be0e45d/components/fxa-client/src/state_machine/transitions.rs#L72-L75)).

Since we are moving to a service-based authentication, and we already specify the service, and rust knows the service, we could extend the state machine in rust to return the `service` to us at the end of the authentication.

That way, we can know which service's authentication just completed and the auth flow observers of that service can know to check if the authentication satisfies the requirements to enable their service.

**Pros**

- Changes are centralised and all clients can take advantage of this.
- No state kept or tracked on Android. Each observer can just listen for the service they care about (e.g `sync`), and once `sync` service is present in the auth callback, then the sync feature should treat it as an auth response it is interested in.

**Cons**

- The changes are breaking changes, and have to be applied to iOS and Android simultaneously
- This involves changing the state machine to also track the `service` parameter, and return it as part of the `FxaState.Connected`, hypothetical API changes look like:

```rust
pub enum FxaState {
    ...
    Authenticating {
        oauth_url: String,
        initial_state: FxaRustAuthState,
    },

    // new "reason"
    Connected { reason: ConnectedReason },
    ...
}

// new reason based on the FxaEvent that eventually resulted in Connected
pub enum ConnectedReason {
    Existing,
    OAuthFlow { service: Option<String> }, // <--- our prize
    Recovered,
    PasswordChange,
}
```

### Option 3 - Include the `service` in FxA's oauth_login web channel message where available

FxA could send us the **`service`** that was in the url we just signed into - via the **_oauth_login_** [web channel message](https://searchfox.org/firefox-main/rev/06fa2674be3db4f3b623bad938282310509cc54b/mobile/android/android-components/components/feature/accounts/src/main/java/mozilla/components/feature/accounts/FxaWebChannelFeature.kt#541-548) & also via the [**_redirect uri_**](https://searchfox.org/firefox-main/rev/06fa2674be3db4f3b623bad938282310509cc54b/mobile/android/android-components/components/feature/accounts/src/main/java/mozilla/components/feature/accounts/FirefoxAccountsAuthFeature.kt#119-133), so that we can put that in the AuthData.
When we send that AuthData to fxa-client, which attempts to exchange the tokens and set up the state. At the end of that interaction, we get an [`FxaState.Connected` state via the `AuthData`](https://searchfox.org/firefox-main/rev/06fa2674be3db4f3b623bad938282310509cc54b/mobile/android/android-components/components/service/firefox-accounts/src/main/java/mozilla/components/service/fxa/manager/FxaAccountManager.kt#580-587) event. But since we have just called it, when we get our response, we know exactly what service got connected (if present).

**Pros**

- No fxa-client (rust) changes involved
- No state kept or tracked on Android
- Seemingly the easiest way to do this with minimal 3rd party changes.
- Low level of effort for FxA
- Mark has already expressed listening to the first message as being less than ideal in Desktop architecture as well. This could be an opportunity to make them consistent

**Neutral**

- If we re-implement CWTS at sign-up in the future, FxA can use local storage to store CWTS options, instead of Firefox storing it

**Cons**

- Not sure if other clients have this ease we have of having the auth data close to the `Connected` state we transition into - so this could potentially be easy only for Android.
- Desktop already listens for `fxa_login` for this, and we want them to be consistent
- FxA will need to maintain sending the list in both web channel messages for some time, to avoid breaking old Desktop clients
