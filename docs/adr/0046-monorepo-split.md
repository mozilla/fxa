# Keep SubPlat in the Nx monorepo with targeted improvements

* **Status:** proposed
* **Deciders:** Julian Poyourow, Reino Muhl, Vijay Budhram
* **Date:** 2025-08-18

## Context and Problem Statement

FxA (Mozilla Accounts) and SubPlat (Subscription Platform) share a long‑lived monorepo that migrated to Nx about two years ago. The monorepo contains:

* **Older/Legacy yarn-workspace-based under `packages/*`** (e.g., `auth-server`, `admin-server`, the legacy `payments-server` UI), a mix of JavaScript and TypeScript in an older style.
* **Modern Nx‑library based code under `apps/*` and `libs/*`**, including `apps/payments-next` (Next.js) and domain libraries:

  * `libs/payments/*` (SubPlat)
  * `libs/accounts/*` (FxA)
  * `libs/shared/*` (shared CMS, logging, etc.)
  * `libs/*` other

Historically, SubPlat processed most payments, emails, and webhooks via `auth-server`. Over the last year, SubPlat moved payment processing and the frontend to `payments-next` (Next.js), increasing independence while still depending on `auth-server` for various functions. `admin-server` also spans both domains.

SubPlat has considered moving to a separate repository for the maintenance and deployment of Subscription Platform-specific functionality.

**Pain points that led to considering a split:**

* Slow CI (often ≥ \~20 minutes).
* Legacy TS+JS in `auth-server` with wide use of typecasts and older testing methodologies.
* Coupled release process: FxA and SubPlat are forced to tag and deploy together.
* Dependency upgrades are painful across the repo.
* Consistency of code style between the two teams varies.

**Work already done as of writing this ADR:**

* New SubPlat work lives under Nx (`apps/*`, `libs/*`) starting with `payments-next` for SubPlat 3.0.
  * This helps decouple the dependence between SubPlat and FxA.
* Nx remote caching backed by S3 to improve CI runtimes when modifying non-FxA code.
* Reduced interdependence between FxA and SubPlat with SubPlat 3.0
  * Removed sub-accounts.
  * Very limited interaction directly with FxA accounts tables.

**Current issues:**

* CI is still not great.
  * CI runtime varies, depending on what you touch.
  * If functional tests have to spin up, they require a stack start.
* Significant SubPlat logic remains in `auth-server`.
  * All webhook processing code.
  * All emailing logic.
* Cross‑team style drift still happens.
* SubPlat still reads from the FxA accounts table in a few limited places.

**Question:** Should SubPlat split into its own repository, stay as-is, or remain in the monorepo while formalizing the improvements already underway?

## Decision Drivers

* Release independence for SubPlat.
* CI performance and developer velocity.
* Migration cost and risk.
* Ability to share code (`libs/shared/*`) and infra (CI, image building).
* Ongoing maintenance burden (dependency upgrades, code organization).
* Reduction of legacy coupling to `auth-server`.

## Considered Options

A. **Split SubPlat into its own repo and abandon the monorepo.**
B. **Status quo, do nothing**
C. **Stay in the monorepo and implement the improvements outlined above.**

## Decision Outcome

**Chosen option: C — Stay in the monorepo and implement targeted improvements.**

We believe this best fits the current state: we already have `payments-next` in Nx, remote caching is in place, and nothing actually prevents an independent release cadence for SubPlat when coexisting in the monorepo. We keep the benefits of shared libraries and shared CI/devops while focusing effort on extracting remaining SubPlat logic from `auth-server` into `payments-api`, and on test modernization, instead of spending that effort on a risky+costly repo split.

This decision can always be re-evaluated in the future, but represents our plan for the next ~year. We may decide at some point in the future that SubPlat is better served by moving to it's own repository. At that time, we can revisit and document the pros/cons as we see them then.

### Positive Consequences

* Preserve shared code under `libs/shared/*` and reduce duplication.
* Keep using shared CI, devops, and image-building pipelines.
* Avoid large one‑time migration cost; focus energy on extracting SubPlat code from `auth-server`.
* SubPlat can immediately run an independent release cadence for `payments-next`.
* Nx S3 caching remains in place to incrementally improve CI.

### Negative Consequences

* CI will still be slower for SubPlat than a dedicated repo would be.
* Dependency upgrades must remain coordinated across the monorepo.
* Style drift and code‑organization hygiene still require attention.
* `auth-server` remains a dependency for SubPlat but will incrementally be extracted.
* It remains easy to make the mistake of coupling FxA and SubPlat at runtime, such as querying FxA accounts directly.

## Pros and Cons of the Options

### Option A: Split SubPlat into its own repo

**Description:**

* Create a new SubPlat repository and move `apps/payments-next` and `libs/payments/*` into it.
* Decide how to handle shared code currently under `libs/shared/*`: either duplicate it in the new repo or stand up a separate shared repo.
* Leave legacy SubPlat functionality that still lives in `auth-server` behind initially and migrate it gradually.
* Set up new CI, image building, and deployment pipelines for the new repository.
* Keep necessary integration points with FxA operational during the transition, but aim to always interact via API call.

**Pros and cons:**

* **Good:** SubPlat CI would be faster relative to the current shared setup.
* **Good:** Dependency upgrades are simpler within a smaller, focused repo.
* **Good:** Full independence between SubPlat and FxA forcing interaction only by API.
* **Bad:** Migration is long and painful: move `libs/payments/*`, `apps/payments-next`, and either duplicate shared code or spin up an additional shared repo (even more of a maintenance and deployment hassle).
* **Bad:** Legacy SubPlat logic in `auth-server` can’t move all at once; coupling persists during a lengthy transition.
* **Bad:** Lose shared CI/devops/image-building - must be re-created for the new repo.

### Option B: Status quo, do nothing

**Description:**

* Keep the current monorepo structure and practices unchanged.
* Continue joint tagging/deploying and existing CI/test setup.
* Keep SubPlat logic that lives in `auth-server` where it is.
* Continue current dependency‑upgrade and code‑style practices.

**Pros and cons:**

* **Good:** Zero immediate work.
* **Bad:** Keeps the current problems: slow CI (\~20 min builds), joint tagging/deploying mindset, heavy `auth-server` coupling, dependency‑upgrade pain, style drift, and direct DB reads.

### Option C: Stay in the monorepo and implement improvements (Chosen)

**Description:**

* Keep SubPlat in the existing Nx monorepo.
* Establish an independent release cadence for `payments-next` (update CI/CD and configs to allow separate deploys).
* Continue extracting SubPlat functionality (webhooks, emails, etc.) from `auth-server` into a new `payments-api` app.
* Remove legacy `payments-server` functional tests and add lighter smoke‑style functional tests for `payments-next`.
* Keep new SubPlat work under `apps/*` and `libs/payments/*`; continue using `libs/shared/*` for shared code; retain Nx S3 caching.
* Eliminate direct calls from SubPlat code to FxA data, and aim to interact only via API or via queue.

**Pros and cons:**

* **Good:** Independent release cadence for `payments-next` is possible, but does require a few changes to infrastructure configs.
* **Good:** Continue leveraging shared libraries and shared CI/devops.
* **Good:** Focus on extracting SubPlat code from `auth-server` to `payments-api` and on test modernization (drop legacy `payments-server` functional tests; add lighter `payments-next` tests).
* **Bad:** CI remains slower than a dedicated SubPlat repo.
* **Bad:** Coordinated dependency upgrades and ongoing code‑organization discipline are still required.
