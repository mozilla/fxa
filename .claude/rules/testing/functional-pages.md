---
paths:
  - 'packages/functional-tests/pages/**'
  - 'packages/functional-tests/tests/**'
  - 'packages/functional-tests/lib/**'
---

# FXA Functional-Test Locator Rules

Applies to Playwright page objects and specs under `packages/functional-tests`.
Stacks on top of `.claude/rules/testing/base.md`.

---

## Never match CMS-overridable copy

Relying parties override page copy through the CMS, keyed by client id and
entrypoint. A locator that matches default English copy fails precisely when the
CMS is working as intended — and it fails in the smoke suites, against stage and
production, where CMS content exists.

`libs/shared/cms/src/lib/queries/relying-party/query.ts` is the authoritative
list of overridable pages;
`fxa-settings/src/models/integrations/relier-interfaces.ts` mirrors it for the
client. Every page listed can have its `headline`, `description`,
`primaryButtonText` and `pageTitle` replaced.

```ts
// Violation — the CTA label is CMS-overridable
get submitButton() {
  return this.page.getByRole('button', { name: /^(Confirm|Start syncing)$/i });
}

// Correct — structural, survives any copy change
get submitButton() {
  this.checkPath();
  return this.formSubmitButton;
}
```

## Where identity comes from

Removing copy also removes the page identity it incidentally provided. Replace
it deliberately, in this order:

1. **`checkPath()`** — the CMS overrides content, never routes, so the URL is
   the only CMS-immune identity signal. Use it when the page object maps to
   exactly one route.
2. **Form fields** — input labels come from FTL, not the CMS, so field
   visibility proves which step you are on. Use this in flow helpers for page
   objects that span several routes and so cannot use `checkPath()`.
3. **A `data-testid`** when two steps share a route and no field distinguishes
   them. Add it to the component and guard it in that component's unit test, so
   the contract is asserted where it is cheap.
4. **`BaseLayout.formSubmitButton`** and **`BaseTokenCodePage.pageHeading`** —
   structural, but see the hazard below.

A heading proves the page rendered, not which page it is; never let one be the
only guard before an action. The same applies to any getter that is an alias of
the generic form submit — pair it with a field or URL guard.

## Level matching is not a safe swap for copy matching

`getByRole('heading', { level: 1 })` looks like a drop-in replacement, but a
strict-mode violation **throws immediately — `expect` never retries it**. A copy
match that resolves to nothing retries for the full timeout, which is what lets
an assertion double as a wait for a pending navigation.

Two ways that bites:

- On a page with a second `h1` (Settings renders one for the header logo), level
  matching turns a working wait into an instant failure.
- Where a page renders a generic `h1` and puts its headline in an `h2`, it
  resolves to one element and matches the wrong heading **silently** — no
  strict-mode error to warn you.

Use `pageHeading` only where the page object is route-guarded and its single
`h1` is the headline. Everywhere else, move the call site to a field locator or
a testid; changing the getter alone makes things worse.

## Copy belongs in unit tests

Assert copy — default and CMS branches — in the `fxa-settings` component tests,
where it is cheap and deterministic. When you remove a copy assertion from a
page object, confirm the component test covers it; add the test if it does not.

Specs under `tests/cms/` deliberately assert CMS copy and are exempt.
