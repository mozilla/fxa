# L10n / I18N Improvements

- Status: accepted
- Deciders: Lauren Zugai, Dan Schomburg, Barry Chen, Vijay Budhram, Wil Clouser
- Date: 2022-09-22

## Technical Story

[This document](https://docs.google.com/document/d/1TgD7WBLvS4aZ10neLJNk-EYvDR8Kb9GOk2KHxhjVzbk/) was a RFC from 2022-07-09 to 2022-09-19 and contains Jira links, more information, and more context.

## Context and Problem Statement

As Firefox Accounts has migrated from gettext to Fluent over the last 2-3 years, several questions around l10n, including infrastructure, package inconsistencies, and general improvements have surfaced.

While discussions occurred in the linked document above, this ADR captures major decisions from that doc, mentions other relevant past decisions, and only lists pros/cons, or negative consequences, of new decisions that have reasonable alternatives.

Note that most decisions cover Fluent packages - `fxa-settings`, `fxa-payments-server`, `fxa-react`, and `fxa-auth-server`. As noted in the RFC, `fxa-content-server` still uses gettext and will share our Fluent infrastructure when we refactor it to React in 2023.

## Decision Drivers

- Consistency across packages
- Reliability
- More robust and complete testing
- Allowing `fxa-react` to manage its own l10n
- More straightforward l10n in emails

## Decision outcome 1: Use consistent FTL paths, names, and setup across packages

`en-US` was FxA's default locale until early 2021 when the l10n team recommended we switch to `en`. `fxa-settings` still contains `en-US.ftl` files that will be updated to `en.ftl`.

Historically, we did not deploy our `en` or `en-US` Fluent bundles, but we have since May 2022 to support any missing fallback text and for consistency across locales and environments.

### `fxa-payments-server` setup changes

`fxa-payments-server` commits a single file to [`public/locales/en-US/main.ftl`](https://github.com/mozilla/fxa/blob/main/packages/fxa-payments-server/public/locales/en-US/main.ftl) which is copied to the l10n repo. This differs from `fxa-settings` and `fxa-auth-server`, wherein we separate FTL files per component and then concatenate the files together to copy into the l10n repo.

For consistency, better maintainability, and because we need to set up concatenation anyway (see the `fxa-react` decision), we'll split `fxa-payments-server`'s FTL file into per-component `en.ftl` files. This will require setting up something similar to `fxa-auth-server`'s `merge-ftl-test` script for test, and we can make sure those reference the same relative path. We can also rename `main.ftl` to become `payments.ftl`.

#### Negative consequences

Keeping strings in a single file that doesn't need an additional build step for testing or pushing to the l10n repo means the final output could feel more clear since a single committed file would reflect exactly what's going out.

### Fluent configuration files

Fluent configuration files are useful when the same repository needs to support different locales for different files or when there are complex paths involved, but because FxA manages its translations in a separate repository, it won't benefit. We'll remove `fxa-payments-server`'s config file.

## Decision outcome 2: continue using fallback text and set up better testing strategies

In theory, Fluent should always insert translated strings found in its bundles for us, including English strings. Because of this, we considered dropping our fallback text in favor of relying on Fluent.

### Pros of dropping fallback text

- Better maintainability and guarantee of consistency due to not needing duplicate strings (one for fallback text and one in an FTL file), in the codebase
- It might feel more i18n-friendly to depend on Fluent instead of prioritizing English speaking users by explicitly setting English fallback text

### Cons of dropping fallback text

- String extraction timing considerations; there is currently a delay between when FxA lands PRs and when we can reference the latest compiled FTL files, including `en`
- `@fluent/react` docs actually [recommend fallback text](https://github.com/projectfluent/fluent.js/wiki/Localized#fallback-string) and state that in the future, it may be used for automatic [extraction of source copy](https://github.com/projectfluent/fluent.js/wiki/Localized#fallback-string)
- We ran a small test (see technical story doc) that showed at least on rare occasions, Fluent may fail to retrieve strings or the browser can't always load the Fluent bundle files after loading the page successfully, wherein fallback text is displayed
- It would take at least two searches to find where a string should ultimately end up in a component, e.g. finding the corresponding FTL ID then searching for it

### Solutions

One of the primary concerns around using fallback text is maintainability and consistency guarantee. We should be testing:

- All provided FTL IDs exist in the source-of-truth `en` bundle
- Fallback text matches the message tied to the ID in the `en.ftl` bundle, and validate that variables referenced in the message string are available
- The message doesn’t contain straight quotes (nice to have)

#### React-based packages

We will create two wrappers, one for `Localized` and one for `l10n.getString()`, to enforce fallback text is always provided, set up a `merge:ftl-test` script for when tests run, and mock the wrappers to test what's outlined above.

#### `fxa-auth-server`

We will create a helper function to send into our templates to more easily grab messages from Fluent bundles for things like alt text that otherwise require additional complexities due to our MJML and `@fluent/dom` set up. We can also automatically apply `data-l10n-args`.

We test our email templates in an enormous, single test file of email strings. We will adjust our email test set up and separate these out per component for better maintainability and easier testing.

## Decision outcome 3: concat `fxa-react` FTL files to other packages, use a global branding file

When we use components from `fxa-react` in another package, we have to add the FTL ID and string into the package using the component rather than in `fxa-react`. This can be easily forgotten or lead to duplication of IDs/messages across our packages.

Instead, we can concat files from `fxa-react` into the existing Fluent bundles. Additionally, to help with consistency and maintainability across the board, we'll create a "global" FTL file with our license and branding to be shared across our packages to be used first to build our bundles.

### Other considered options

We could create a new bundle for `fxa-react` similar to other packages. However, we'd need to ship the outputted file with our other packages which would create another network request and more importantly we'd have to reconfigure our Fluent set up to check for translations in two different bundles.

## Decision outcome 4: Clone `fxa-content-server-l10n` once, instead of per-package

We currently clone the l10n repo into each package via a `clone-l10n.sh` script at the `postinstall` step.

Instead of every package cloning the repo, we should have our script pull the repo into a central location so each package can skip that script, and then update build steps per package accordingly. We know this script works and can tweak it to our needs, and it doesn't require any management from engineers when new strings land.

While subtrees may be a good option, we would need to heavily modify and still maintain a script introducing a new-to-FxA git concept.

### Other considered options

#### Use a git submodule

Git submodules are essentially gitlinks with a reference to a commit. Locally, the link looks no different than a clone (e.g. you can see and poke around `fxa-content-server-l10n` within packages), but git tracks it as a reference to that commit and uses a `.gitmodules` config file.

##### Pros

- We could ditch our `clone-l10n.sh` script in favor of a native git feature
- Can make pushing to the l10n repo easier (which is not a feature we would use often) if `submodule` commands are known
- Submodules can be useful for switching between different states for comparison

##### Neutral

- We'll need to maintain the `.gitmodules` configuration file

##### Cons

- All engineers will need to run `git submodule init` once
- While engineers won't have to know much, submodules are one more thing to read about and understand and will be more visible, vs our clone script that is essentially hidden from developers
- While we could add a `git submodule update --remote` call at the build and postinstall step to fetch latest, we would still have to commit an update to the FxA repo to update gitlink commit SHA. At least one Mozilla project does this with a bot.
- We may need to tweak our build steps and CI set up

#### Use a git subtree

A git subtree is a replica or a copy of a git repository and creates a relationship between it and its parent repository (FxA).

##### Pros

- Similar to our existing setup and unlike submodules, complexity is hidden from engineers
- We may be able to remove copying directories from build steps in our packages in favor of using `git-subtrees-split` and `git-subtree-merge`

##### Cons

- While a subtree wouldn't add a new metadata file like a git module would, we would need to modify or create a new version of our `clone-l10n.sh` script to `git subtree add` the tree(s) alongside other checks. Updating a `subtree` requires the command `git subtree pull` and since we want to `.gitignore` the output and have this update on `postinstall`, we may need to always run an additional command to first remove the subtree so we can use `add` every time, or have some extra checks to see if `pull` or `add` should be used.
- While engineers won't have to know much, subtrees are one more thing to read about and understand

## Links

- [Original RFC](https://docs.google.com/document/d/1TgD7WBLvS4aZ10neLJNk-EYvDR8Kb9GOk2KHxhjVzbk/) that was created before this ADR
