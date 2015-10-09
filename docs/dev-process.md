# Development Process

We develop and deploy on a two-week iteration cycle.  Every two weeks we
cut a release "train" that goes through deployment to stage and into production.

## Product Planning

Product-level feature planning takes place in Aha:

* [Feature cards](https://mozilla.aha.io/products/FXA/feature_cards)
* [Ongoing project initiatives](https://mozilla.aha.io/products/FXA/initiatives)

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

When we start working on feature card from Aha, we create a corresponding
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

* **now**:  issues that we've committed to for the current development cycle.
* **progress**:  issues that someone is actively working on.
* **review**: issues that have a PR ready for review; the assignee is the.
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
  put it in **now** and consider adding a **❤❤❤** label to
  increase visibility.

* If we should get to it in the next few weeks, put it in **next**.

* If we should get to it in the next few months, put it towards the top
  of **backlog** and add a **❤** label to increase visibility.

* If we should get to it eventually, put it further down in **backlog**.

* Otherwise, just close it.

While we hold regular triage meetings, developers with sufficient context are
welcome to deal with issues in the **triage** column at any time.


## Checkin Meetings

The team meets regularly to stay in sync about development status and ensure nothing
is falling through the cracks.  We hold the following meetings over the course of each
two-week cycle, with meeting times pinned to Mozilla Standard Time (aka Pacific Time).

### Mondays at 09:00

This is a 15 minute meeting slot, followed by a bug triage session.  It's in a
timeslot that's convenient for Europe and US-East.

##### First week: Outbound Train Review

We review any PRs that remain open, and determine which need to make the outboard train and
which can be delayed.  Items that must be on board the outbound train receive the **shipit**
label, and completing them becomes the top development priority for the next two days.

##### Second week: Ongoing Train Review

Half-way through the cycle, we take a look at the things still outstanding and decide whether
to scale back on commitments based on actual progress made so far.  Items cut from the train
at this point are moved back into **next**.

### Mondays at 13:30

##### First week: Outbound Train Demos and Retrospective

We get together to demonstrate any new features that will be included on the outbound train,
or any other interesting work that was compelted in the previous cycle.  We also talk about
the development process itself, doing a "start/stop/keep" analysis of the previous two weeks.

##### Second week: No Meeting

There's no point in meeting just because...

### Mondays at 14:00

This is the one time each week where all team members everywhere in the world get together
in the same (virtual) room at the same time.

##### First week: Sprint Planning Meeting

We review any items remaining in **now**, **progress** or **review** to determine whether they
should carry over to the upcoming train, or be de-priotitized.  We then work through the issues
in **next** to decide what to commit to for the upcoming train.

##### Second week: Status Updates and Retrospective

Since this is our only whole-team timeslot, we take the opportunity to do a round of status
updates and give everyone a chance to raise any comments or concerns.  We can also use the
remaining time to continue the "start/stop/keep" restrospective from the previous week.

### Tuesdays at 15:30

This is a 15 minute meeting slot, followed by a bug triage session.  It's in a timeslot
that's convenient for US-West and Oceania.

##### First week: Cut the Train

We review the final status of any **shipit** items from the Monday meeting, and tag new releases
of the relevant repos for the outbound train.

##### Second week: Ops Review/Update

We dedicate some time to discuss backend operational issues.

### Thursdays at 09:00

This is a quick 15-minute checkin in a timeslot convenient for Europe and US-East.

##### First week: Blockers and Calls for Help

We take 15mins to checkin with each other about anything that's blocked or otherwise needs help.
Items in the **blocked** column should receive special attention.

##### First week: Items in Danger

We take 15mins to identify any items that are in danger of not being completed this train, and
ensure we either have a plan for completing them, or take them off the train.


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
