# Next Two Factor authentication in FxA

- Status: accepted
- Deciders: Vijay Budhram
- Date: 2020-04-01

## Context and Problem Statement

Firefox Account originally implemented multi-factor authentication (MFA) support in Q1 of 2018.
This feature used TOTP based codes and was based on RFC 6238.
Additionally, if users lost their MFA device, they could use one time recovery codes to regain access to the account.

Having MFA support has helped secure our users' accounts and given them more security flexibility.
However, over time it has become more obvious that users that lose their MFA device (usually phone) are at risk of getting locked out of their account because they don't save their recovery codes.
There are a non-trivial amount of users that don’t save or download their recovery codes, which is currently the only way they can regain access.
In 2019 Q4, FxA started requiring that users confirm recovery codes before enabling MFA.
While this did help reduce lockouts, we still want to reduce it further.

We believe that adding a new MFA method to Firefox Accounts that has the similar security properties as TOTP would allow users to have another method to recover their account.

## Decision Drivers

- Improve user's account security
- Reduce the risk of account lockout because of lost device/recovery code
- Could be completed in roughly a quarter

## Considered Options

- Option A - Implement WebAuthn and FIDO2 authentication
- Option B - Implement SMS as opt-in backup method

## Decision Outcome

Chosen option: Option A, because this is more inline with Mozilla's security and privacy principles than option B.
There is less security risk to users if this feature is added.

## Pros and Cons of the Options

### Option A - Implement WebAuthn and FIDO2 authentication

- Description
  - Use WebAuthn JS api and FIDO2 based authentication as a second authentication factor for FxA.
- Pros
  - WebAuthn and FIDO2 are open standards with good browser support
  - More secure than SMS
  - Aligns with Mozilla's security and privacy features
  - Not dependent on other features and could be worked independently
- Cons
  - Some unknowns with UX parts and design
  - Less familiar to users
  - Losing authenticator could still potentially lock you out of account
  - More complex feature that has risk of taking longer than a quarter to complete

### Option B - Implement SMS as opt-in backup method

- Description
  - Add the ability to have users send a recovery code to a phone number associated to the account, which could then be used to recover the account.
- Pros
  - Common account recovery pattern used on many sites
  - Less UX unknowns
  - In theory easier to implement
  - Could be completed over a quarter
- Cons
  - Would require additional security reviews
  - Less secure

## Links

- [WebAuthn Spec](https://w3c.github.io/webauthn/)
- [Feature Document](https://docs.google.com/document/d/1RhwkeYJRvYZKRvtjVb-5N9KnJfwE2CwVTYT9FYwIpNY/edit#)
- [Security with SMS](https://www.pandasecurity.com/mediacenter/security/sim-hijacking-explained/)
