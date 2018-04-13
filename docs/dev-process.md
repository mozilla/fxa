# Development Process

We develop and deploy on a two-week iteration cycle.  Every two weeks we
cut a release "train" that goes through deployment to stage and into production.

* [Product planning](#product-planning)
* [Issue management](#issue-management)
  * [Milestones](#milestones)
  * [Waffle columns](#waffle-columns)
  * [Other labels](#other-labels)
  * [Bug triage](#bug-triage)
* [Checkin meetings](#checkin-meetings)
  * [Mondays at 08:30](#mondays-at-0830)
  * [Mondays at 12:30](#mondays-at-1230)
  * [Mondays at 13:00](#mondays-at-1300)
  * [Tuesdays at 14:00](#tuesdays-at-1400)
  * [Thursdays at 12:00](#thursdays-at-1200)
* [Code review](#code-review)
  * [Review Checklist](#review-checklist)
* [Tagging releases](#tagging-releases)
  * [What if the merge messes up the changelog?](#what-if-the-merge-messes-up-the-changelog)
  * [What if I already pushed a fix to `master` and it needs to be uplifted to an earlier train?](#what-if-i-already-pushed-a-fix-to-master-and-it-needs-to-be-uplifted-to-an-earlier-train)
  * [What if there are two separate train branches containing parallel updates?](#what-if-there-are-two-separate-train-branches-containing-parallel-updates)

## Product Planning

Product-level feature planning is managed
in a separate tool called "Projects":

* [The fxa features board](https://projects-beta.growthhackers.com/u/orgs/mozilla-corporation/projects/FAAS/notebook)

## Issue management

Most of our work takes place on [GitHub](https://github.com/mozilla/fxa).  We use labels and
milestones to keep things organised, and [waffle.io](https://waffle.io) to provide an overview
of bug status and activity:

* [Active issues for Firefox Accounts](https://waffle.io/mozilla/fxa)

Issue status is reflected by the following:

* The milestone indicates *why* we are working on this issue.
* The waffle column indicates *what* the next action is and *when*
  we expect to complete it.
* The assignee, if any, indicates *who* is responsible for that action.

### Milestones

When we start working on a card from the features board, we create a corresponding
[milestone in github](https://github.com/mozilla/fxa/milestones) and break
down the task into bugs associated with that milestone.  There's also an ongoing
["quality" milestone](https://waffle.io/mozilla/fxa?milestone=FxA-0:%20quality)
for tracking work related to overall quality rather than a particular feature.

If it's not obvious what milestone an issue should belong to, that's a strong
signal that we're not ready to work on it yet.

Milestones are synced across all the repos using the
[sync_milestones.js](https://github.com/mozilla/fxa/blob/master/scripts/sync_milestones.js)
script.

### Waffle Columns

Issues that are not being actively worked on are managed in the following columns:

* **triage**:  all incoming issues start out in this column by default.
* **backlog**: issues that we plan to work on someday, but not urgently.
* **next**: issues that we plan to pick up in the next development cycle.

Issues that are under active development are managed in the following columns:

* **active**:  issues that someone is actively working on.
* **in review**: issues that have a PR ready for review; the assignee is the.
* **blocked**:  issues on which progress has stalled due to external factors.

All issues in these four columns should have an assignee, who is the person
responsible for taking the next action on that bug.

### Other Labels

We use the following labels to add additional context on issues:

* **❤** : used to raise visibility of important items in the backlog.
* **❤❤❤** : used to raise visibility of very important issues in the
  current development cycle.
* **shipit**: indicates items that need to be merged before cutting the current train.
* **good-first-bug**: indicates well-scoped, approachable tasks that may be a good
  starting point for new contributors to the project.
* **i18n**: indicates issues that affect internationalized strings, and so need special
  care when merging to avoid issues with translations.
* **ux**: indicates issues that have a UX component, and thus should receive input and
  validation from the UX team.

Labels are synced across all the repos using the
[sync_labels.js](https://github.com/mozilla/fxa/blob/master/scripts/sync_labels.js)
script.

### Bug Triage

Issues in the **triage** column should move into one of the other columns
via these guidelines:

* If it's so important that we need to get to it in the next few days,
  put it in **active** and consider adding a **❤❤❤** label to
  increase visibility.

* If we should get to it in the next few weeks, put it in **next**.

* If we should get to it in the next few months, put it towards the top
  of **backlog** and add a **❤** label to increase visibility.

* If we should get to it eventually, put it further down in **backlog**.

* Otherwise, just close it.

While we hold regular triage meetings, developers with sufficient context are
welcome to deal with issues in the **triage** column at any time.


## Checkin Meetings

The team meets regularly to stay in sync about development status
and ensure nothing is falling through the cracks.
During meetings we take notes in the public
**[fxa-engineering-coordination etherpad](https://public.etherpad-mozilla.org/p/fxa-engineering-coordination)**,
and afterward we send a summary of each meeting to an appropriate mailing list.

We hold the following meetings over the course of each
two-week cycle, with meeting times pinned to Mozilla Standard Time (aka Pacific Time).

### Mondays at 08:30

This is a 60 minute meeting slot that's convenient for Europe and US-East.
The first 30 minutes are split between UX/PM and dev/ops discussions,
the second 30 for triaging new bugs and pruning the backlog.

Minutes are emailed to [dev-fxacct@mozilla.org](https://mail.mozilla.org/pipermail/dev-fxacct/)

### Mondays at 12:30

#### Weekly: Show and Tell and Share

We get together to demonstrate any new features that will be included on the next train,
or any other interesting work that was completed in the previous cycle.

Minutes are emailed to [dev-fxacct@mozilla.org](https://mail.mozilla.org/pipermail/dev-fxacct/)

### Mondays at 13:00

This is the one time each week where all team members everywhere in the world get together
in the same (virtual) room at the same time.

#### First week: Dev Planning Meeting

We review any items remaining in **blocked**, **review** or **active** to determine whether they
should carry over to the upcoming train, or be de-priotitized.  We then work through the issues
in **next** to decide what to commit to for the upcoming train.

Minutes are not recorded from this meeting.

#### Second week: Retrospective

We take time every two weeks to explicitly reflect on our development process.
What worked, what didn't, what new things we'd like to try.

Minutes are private and are emailed to [fxa-staff@mozilla.com](https://groups.google.com/a/mozilla.com/forum/#!forum/fxa-staff)

### Tuesdays at 14:00

This is a 15 minute meeting slot, followed by a bug triage session.  It's in a timeslot
that's convenient for US-West and Oceania.

#### First week: Cut the Train

We review the final status of any **shipit** items from the Monday meeting, and tag new releases
of the relevant repos for the outbound train.

#### Second week: Ops Review/Update

We dedicate some time to discuss backend operational issues.

Minutes are emailed to [dev-fxacct@mozilla.org](https://mail.mozilla.org/pipermail/dev-fxacct/), sans any confidential operational notes.

### Thursdays at 12:00: 

This is our weekly product meeting, where we review the status of features
currently being developed, and the metrics from features currently being shipped.

Minutes are private and are emailed to [fxa-staff@mozilla.com](https://groups.google.com/a/mozilla.com/forum/#!forum/fxa-staff)


## Code Review

This project is production Mozilla code and subject to our [engineering practices and quality standards](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Committing_Rules_and_Responsibilities).  Every patch must be [reviewed](https://developer.mozilla.org/en-US/docs/Code_Review_FAQ) by an owner or peer of the [Firefox Accounts module](https://wiki.mozilla.org/Modules/Other#Firefox_Accounts).

### Review Checklist

Here are some handy questions and things to consider when reviewing code for Firefox Accounts:

* How will we tell if this change is successful?
    * If it's fixing a bug, have we introduced tests to ensure the bug stays fixed?
    * If it's a feature, do we have metrics to tell whether it's providing value?
    * Should it be A/B tested to check whether it's a good idea at all?
* Did test coverage increase, or at least stay the same?
    * We need a pretty good reason to merge code that decreases test coverage...
    * If it's hard to answer this question, consider adding a test that tests the test coverage.
* Does it introduce new user-facing strings?
    * These strings will need to go through our localization process.  Check that the
      templates in which they're defined are covered by our string extraction scripts.
    * The code must be merged before the string-extraction date for that development cycle.
* Does it store user-provided data?
    * The validation rules should be explicit, documented, and clearly enforced before storage.
* Does it display user-controlled data?
    * It must be appropriately escaped, e.g. htmlescaped before being inserted into web content.
* Does it involve a database schema migration?
    * The changes must be backwards-compatible with the previous deployed version.  This means
      that you can't do something like `ALTER TABLE CHANGE COLUMN` in a single deployment, but
      must split it into two: one to add the new column and start using it, and second to
      drop the now-unused old column.
    * Does it contain any long-running statements that might lock tables during deployment?
    * Can the changes be rolled back without data loss or a service outage?
    * Has the canonical db schema been kept in sync with the patch files?
    * Once merged, please file an Ops bug to track deployment in stage and production.
* Does it alter the public API of a service?
    * Ensure that the chage is backwards compatible.
    * Ensure that it's documented appropriately in the API description.
    * Note whether we should announce it on one or more developer mailing lists.
* Does it add new metrics or logging?
    * Make sure they're documented for future reference.
* Does it conform to the prevailing style of the codebase?
    * If it introduces new files, ensure they're covered by the linter.
    * If you notice a stylistic issue that was *not* detected by the linter,
      consider updating the linter.
* For fixes that are patching a train,
  has the PR been opened against the correct train branch?
    * If the PR is against `master`,
      it is likely that it will mess up
      our change logs and the git history
      when merged.
    * If no appropriate train branch exists,
      one can be created at the appropriate point in history
      and pushed.
      After the patch has been tagged (see below),
      the train branch can then be merged to `master`.
      Commits should not be cherry-picked
      between train branches and `master`.

## Tagging releases

Each repo has a `grunt` script
for tagging new releases.
This script is responsible for:

* Updating the version strings
  in `package.json` and `npm-shrinkwrap.json`.

* Writing commit summaries
  to the change log.

* Committing these changes.

The script will not push the tag,
so you can always check what's changed
before making the decision
about whether the changes were correct
and it's okay to push.

To tag a major release, run:

```
grunt version
```

To tag a patch release, run:

```
grunt version:patch
```

Patch releases should normally be tagged
in a specific `train-nnn` branch,
which must then be merged back to `master`.

It's important that:

1. The merge happens;

2. It really is just a vanilla `git merge`
   and not a `rebase`, `cherry-pick` or `merge --squash`.

Doing it this way
ensures that all releases show up in the changelog,
with commits correctly listed under the appropriate version,
and that future releases are never missing the details
from earlier ones.
Other approaches,
like cherry-picking between branches
or fixing in master then uplifting to a train branch,
will break the history.

### What if the merge messes up the changelog?

After merging but before pushing,
you should check the changelog to make sure
that the expected versions are listed
and they're in the right order.
If any are missing or the order is wrong,
manually edit the changelog
so that it makes sense,
using the commit summaries from `git log --graph --oneline`
to fill in any blanks as necessary.
Then `git add` those changes
and squash them into the preceding merge commit
using `git commit --amend`.
Now you can push
and the merged changelog will make sense.

### What if I already pushed a fix to `master` and it needs to be uplifted to an earlier train?

In this case,
it's okay to use `git cherry-pick`
because that's the only way to get the fix
into the earlier train.
However, after tagging and pushing the earlier release,
you should still merge the train branch back to `master`
so that future changelogs include the new release.

### What if there are two separate train branches containing parallel updates?

In this case,
the easiest way to keep the changelogs complete
and in the appropriate version order,
is to:

1. Merge from the earlier train branch
   into the later one.
   [Fix up the changelog](#what-if-the-merge-messes-up-the-changelog)
   if it needs it
   and then push the train branch.

2. Now merge from the later train branch
   into `master`.
   Again,
   remember to fix up the changelog before pushing
   if required.

