---
paths:
  - "packages/fxa-auth-server/lib/routes/**"
  - "packages/fxa-auth-server/lib/senders/**"
  - "packages/fxa-shared/db/models/auth/account.ts"
  - "libs/shared/account/**"
---

# FXA — signup email vs current primary email

`account.email` (the `accounts.email` column) is the **immutable signup email** — it never
changes, even when the user changes their primary (which only flips `isPrimary` in the
`emails` table). The **current primary** is `account.primaryEmail.email` (see
`Account.findByUid`). Reaching for `account.email` when you mean "the user's email" is a
common footgun: it works for accounts that never changed their primary, so it passes tests
and review, then sends a **stale address** for the accounts that did.

Use the **current primary** (`account.primaryEmail.email`) for anything user-facing or
identity-representing — email recipients, WebAuthn display names, and attached-service
notifications. A valid account always has a primary email (creation seeds one; it can't be
deleted), so dereference it directly — no `?? account.email` fallback for a state that
can't occur.

`account.email` is correct **only** for the original/signup address itself (e.g. an
`originalEmail` field) or at account creation, where signup == primary.

```ts
// ✗ signup email as the WebAuthn display name
generateRegistrationChallenge(uid, account.email);

// ✓ current primary
generateRegistrationChallenge(uid, account.primaryEmail.email);
```

**Sending email:** target the primary _verified_ address —
`account.emails?.find((e) => e.isPrimary && e.isVerified)?.email || account.email` (see
`senders/fxa-mailer-format.ts`), or use `FxaMailerFormat.account(account)`.
