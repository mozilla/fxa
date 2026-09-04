# Page Object Models

Page Object Models (POMs) do the heavy lifting of performing actions and getting
data on a page. If React Components are on one side of the browser coin POMs are
on the other.

## Locator strategy

**Never match a CMS-overridable string.** Relying parties can override page copy
through the CMS, so a locator matching default English copy fails precisely when
the CMS is working as intended.

The full rule — what to use for identity instead, and the strict-mode hazard
that makes level matching unsafe — is in
[`.claude/rules/testing/functional-pages.md`](../../../.claude/rules/testing/functional-pages.md).
