# Disable Squash and Merge

- Status: Accepted
- Deciders: Lauren Zugai, Ivo Planemac, Barry Chen, Wil Clouser, Vijay Budhram
- Date: 2022-03-25

Technical Story: [#11721](https://github.com/mozilla/fxa/issues/11721)

## Context and Problem Statement

In late September 2021, we enabled "squash and merge" for pull requests through the GitHub UI for optional engineering convenience. However, enabling this option caused several issues to surface. Through team discussions, we have chosen to turn the option off (for now). This document, while not an _architecture_ decision, serves to capture a summary of the experiment and problems around squash and merge with our current git workflow. Changing development or release strategies is out of scope for this ADR, but those conversations are ongoing.

FxA's [commit guidelines](../../CONTRIBUTING.md#git-commit-guidelines) standardize our commit formatting, and we prefer one commit per issue or PR closed. These preferences help us maintain a clean git and changelog history - not only does it serve as documentation when needing to git blame a line and help reviewers understand the breadth of changes in PR review, but one commit per task can help us debug problems that arise after merging and also makes cherry-picking for dot releases easier. Because of these preferences, engineers sometimes need to run an interactive rebase, squash commits into one, and force push branches if they've been previously pushed with multiple commits, or if changes are requested on PR. Squashing and merging through GH helps mitigate the need to force push through the terminal at the final review step because engineers can squash commits, edit the commit message, and merge the PR in GH.

GitHub sets user's default merge strategy to whatever they used last (squash and merge or regular merge) and doesn't allow disabling the option on certain branches. These caveats, alongside human error and automated dependency upgrades, have caused a number of problems we've identified:

1. Accidentally squashing and merging train branches into `main` causes merge conflicts for the next patch release because of differing parent commits
1. Accidentally forgetting to edit the commit message when squashing and merging an approved PR means PRs can be merged without meeting our commit guidelines
1. Accidentally regular merging a branch that was meant to be squashed and merged means multiple unformatted commits can land for a single task
1. While squashing and merging Dependabot (`package.json`) and Bananafox (`yarn.lock`) commits on automated dependency PRs seemed like a nice _pro_ for keeping squash and merge, there's been a couple of instances where something funky happened with a bad squash and merge dependency update which caused Bananafox to get out of sync and commit on multiple PRs without `package.json` changes. This caused an issue with a dot release that could have been mitigated by being able to cherry-pick in only the needed change without the `yarn.lock` commit, see [this PR](https://github.com/mozilla/fxa/pull/12064) and and others around this time, and so it seems more ideal to keep these in separate commits until Dependabot [works properly with yarn 2](https://github.com/dependabot/dependabot-core/issues/1297) so we can retire Bananafox

## Considered Options

- Continue allowing squash and merge through GH
- Disable squash and merge

## Decision Outcome

Chosen option: "option 2", disable squash and merge, because with our current workflow, team discussions have concluded there doesn't appear to be adequate workarounds to alleviate the problems listed above while leaving squash and merge enabled. We will also disable force pushing on `train-*` branches, and keep our rule to never force push to `main`. This is not a final decision; we will continue to have conversations around development strategy process improvements and viability of squash and merge in the future.

### Positive Consequences

- Train branches will no longer be accidentally squashed and merged, reducing merge conflicts and burden on release owners
- While there is an extra step to squashing commits locally, pushing, and regular merging through GH rather than doing it all at once with a squash and merge button in GH, this extra step allows us to see exactly what's going to be merged when we click "merge." The 2nd and 3rd problems laid out above should be alleviated
- Commit messages can be reviewed as part of the PR review. We don't need to have a hard rule for this, but it's oftentimes nicer reviewing a PR that has the type/scope/summary and commit message body filled out already, rather than r+'ing a PR with a bunch of "WIP" commits and trusting that it will be squashed into one commit that follows guidelines once the PR is merged
- Disabling force pushing on train branches can help alleviate some of the risk around allowing force pushing, since `train-*` branches are shared
- Better preservation of commit signing integrity. When we squash and merge through GH, GH signs the commit for us

### Negative Consequences

- Squashing and merging through GH can be convenient for engineers
- Interactive rebase to squash and then force push a branch can feel scary since it overrides history
- There may be a rare circumstance where we may want to push

While force pushing is not risk-free, there are ways to soften any risk of loss of work. Engineers can push to their fork before squashing locally to preserve a copy of history at that point in time, run a `git diff` against their locally squashed branch and what's been pushed, and/or use the `--force-with-lease` option when pushing. We also have branch protection against force pushing on `main`, and can add this protection to train branches (`train-*`). Force pushing on any other branch that has more than one person using it, e.g. when pairing, should be done with a lot of care and coordination and is safest with `--force-with-lease`.

## Links

- [A Tale of Two Merges](https://docs.google.com/document/d/1zu3AV60Xhd4n91f38ZHfx5L7lQCDBrtScHyaqxuCFto/edit) - document created to deep-dive into why squash and merge causes a problem on train branches, beginnings of process improvement conversations
