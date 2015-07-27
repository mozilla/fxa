# Development Process Overview

We develop and deploy on a two-week iteration cycle.  You can view our current development
status and priorities on the [Firefox Teams page](https://wiki.mozilla.org/Firefox/Teams).

## Issue management

Most of our work takes place on [GitHub](https://github.com/mozilla/fxa).  We use labels and
milestones to keep things organised, and [waffle.io](https://waffle.io) to provide an overview
of bug status and activity:

* [Active issues for Firefox Accounts](https://waffle.io/mozilla/fxa)

Conventions that we follow for waffle:

* All incoming issues start out unlabeled and in the "triage" column in waffle.
* Things that are ready for someone to pick up and work on right now are labelled with
  "waffle:ready".  We try to keep the "ready" column roughly sorted in order of priority.
* Things that we want to keep track of, but don't plan to work on soon, are labelled
  with "waffle:later".  We periodically review the "later" column to see what should be
  promoted to "ready" and what should be closed.
* Things that are actively being worked on are labelled either "waffle:progress" or
  "waffle:review" depending on their status:
    * When you start working on somthing, assign it yourself and mark it "waffle:progress".
    * Once it's got a pull request with code ready for review, change it to "waffle:review".
* Issues that were recently closed out will automatically move to the "done" column.

The assignee of an issue is the person responsible for taking the next action on that
issue.  This might be the developer, the reviewer, or somebody else who is being
roped in for additional context.

* Issues in "waffle:progress" or "waffle:review" should always have an assignee;
  issues in other states generally shouldn't.
* We have an automated script to bump issues with an assignee that haven't seen
  any activity since the last development cycle.

Each two-week development iteration gets a milestone, to which we assign the issues
we plan to resolve in that period.  We use additional labels to organise our work into
broad initiatives:

* New feature initiatives should get a label named after them, which can be applied to
  all issues in the breakdown of that feature.  For example, ["avatars"](https://waffle.io/mozilla/fxa?label=avatars) or ["/firstrun"](https://waffle.io/mozilla/fxa?label=%2Ffirstrun).
  The feature will be considered done when all the labelled issues are closed.
* Bugfixes and improvements in existing features get the label ["quality"](https://waffle.io/mozilla/fxa?label=quality).
* Non-user-facing (though no less important!) cleanup tasks get the label ["chore"](https://waffle.io/mozilla/fxa?label=chore).
* Issues that need to be resolved before the release of a particular Firefox version
  are labelled with a 'FxVERSION' tag, e.g. ["Fx42"](https://waffle.io/mozilla/fxa?label=Fx42).


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
    * It must be appropriately escaped, e.g. htmlescaped before being insrted into web content.
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
