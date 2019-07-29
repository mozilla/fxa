# Minimizing password entry

- Deciders: Shane Tomlinson, Alex Davis, Ryan Feeley, Ryan Kelly
- Date: 2019-08-07

## Context and Problem Statement

See [Github Issue 1371][#gh-issue-1371]. The FxA authorization flow sometimes asks already authenticated users to enter their password, sometimes it does not. Password entry, especially on mobile devices, is difficult and a source of user dropoff. Minimizing the need for a password in an authorization flow should increase flow completion rates.

When and where passwords are asked for has been a repeated source of confusion amongst both users and Firefox Accounts developers. If a user is signed into Sync, passwords are only _supposed_ to be required for authorization flows for RPs that require encryption keys. However, there is a bug in the state management logic that forces users to enter their password more often than expected.

Technically, we _must always_ ask the user to enter their password any time encryption keys are needed by an RP, e.g., Sync, Lockwise, and Send. For RPs that do not require encryption keys, e.g., Monitor and AMO, there is no technical reason why authenticated users must enter their password again, the existing sessionToken is capable of requesting new OAuth tokens.

## Decision Drivers

- User happiness via fewer keystrokes, less confusion
- Improved signin rates

## Considered Options

1. Keep the existing flow
2. Only ask authenticated users for a password if encryption keys are required

## Decision Outcome

Chosen option: "option 2", because it minimizes the number of places the user must enter their password.

### Positive Consequences

- User will need to type their password in fewer places.
- Signin completion rates should increase.

### Negative Consequences

- There may be user confusion around what it means to sign out.

### [option 1] Keep the existing flow

If a user signs in to Sync first and is not signing into an OAuth
RP that requires encryption keys, then no password is required.

If a user does not sign into Sync and instead signs into an
OAuth RP, e.g., Send, and then visits a 2nd OAuth RP that does not
require encryption keys, e.g., Monitor, then they must enter their password.

**example 1** User performs the initial authorization flow for an OAuth RP, e.g., Send, and then visits a 2nd OAuth RP that does not require encryption keys, e.g., Monitor, then _ask_ for the password.

**example 2** User performs the initial authorization flow for Sync, then a subsequent authorization flow for an OAuth RP that does not require encryption keys, e.g., Monitor, _do not_ ask for the password.

**example 3** User performs the initial authorization flow for an OAuth RP, e.g., Monitor, and then a subsequent authorization flow for an OAuth RP that _does_ require encryption keys, e.g., Send, then _ask_ for the password.

**example 4** User performs the initial authorization flow for Sync, then a subsequent authorization flow for an OAuth RP that _does_ require encryption keys, e.g., Send, then _ask_ for the password.

**example 5** User performs the initial authorization flow for an OAuth RP that does not require keys, e.g., Monitor, and then performs an authorization flow for Sync, then _ask_ for the password.

**example 6** User performs the initial authorization flow for an OAuth RP that does does require keys, e.g., Send, and then performs an authorization flow for Sync, then _ask_ for the password.

- Good, because we already have it and no effort is required to keep it.
- Bad because there is no technical reason why we cannot re-use existing sessionTokens created when signing into OAuth RPs to generate OAuth tokens for other non-key requesting OAuth RPs.
- Bad, because users need to enter their password more than they need to.
- Bad, because due to a bug in the code, users that are currently signed into Sync are sometimes asked for their password to sign into services such as Monitor that do not require keys.

### [option 2] Only ask authenticated users for a password if encryption keys are required

**example 1** User performs the initial authorization flow for an OAuth RP, e.g., Send, and then visits a 2nd OAuth RP that does not require encryption keys, e.g., Monitor, then _do not_ ask for the password.

**example 2** User performs the initial authorization flow for Sync, then a subsequent authorization flow for an OAuth RP that does not require encryption keys, e.g., Monitor, _do not_ ask for the password.

**example 3** User performs the initial authorization flow for an OAuth RP, e.g., Monitor, and then a subsequent authorization flow for an OAuth RP that _does_ require encryption keys, e.g., Send, then _ask_ for the password.

**example 4** User performs the initial authorization flow for Sync, then a subsequent authorization flow for an OAuth RP that _does_ require encryption keys, e.g., Send, then _ask_ for the password.

**example 5** User performs the initial authorization flow for an OAuth RP that does not require keys, e.g., Monitor, and then performs an authorization flow for Sync, then _ask_ for the password.

**example 6** User performs the initial authorization flow for an OAuth RP that does does require keys, e.g., Send, and then performs an authorization flow for Sync, then _ask_ for the password.

- Good, because case 1 _does not_ ask for a password whereas it _does_ with option 1.
- Bad, because there is potential for user confusion about expected behavior when destroying the sessionToken - should destroying the sessionToken sign the user out of the RP too? See [Github issue 640][#gh-issue-640].
  - Support for [RP initiated logout][#gh-issue-1979] will largely mitigate this.

## Is a password needed for service &lt;X&gt;?

| Service                 | Password needed if already authenticated to FxA? |
| ----------------------- | ------------------------------------------------ |
| Lockwise                | yes                                              |
| Notes                   | yes                                              |
| Send                    | yes                                              |
| Sync                    | yes                                              |
| AMO                     | no                                               |
| Email preferences       | no                                               |
| Firefox Private Network | no                                               |
| Monitor                 | no                                               |
| Mozilla IAM             | no?                                              |
| Mozilla Support         | no                                               |
| Pocket                  | no                                               |
| Pontoon                 | no                                               |

## Expired sessions

Not mentioned above is how invalid sessions are handled. Sessions become invalid under a number of scenarios, including password change, password reset, and session revocation from the [FxA Devices & Apps panel][#fxa-devices-apps-panel]. FxA only knows when previously authenticated sessions are invalid when the user attempts to use the previously authenticated session. If a previously authenticated user attempts to sign into Monitor, FxA will not initially ask for their password. Once the user clicks "Submit", FxA will learn the session is invalid and ask the user for their password.

## Future

In the future some sort of "session freshness" heuristic may be used to force users who have not recently authenticated must re-enter their password. Support for [RP initiated logout][#gh-issue-1979] will largely mitigate user confusion around what it means to sign out of a service and whether destroying a sessionToken should also sign the user out of an RP.

[#gh-issue-1371]: https://github.com/mozilla/fxa/issues/1371
[#gh-issue-640]: https://github.com/mozilla/fxa/issues/640
[#gh-issue-1979]: https://github.com/mozilla/fxa/issues/1979
[#fxa-devices-apps-panel]: https://accounts.firefox.com/settings/clients
