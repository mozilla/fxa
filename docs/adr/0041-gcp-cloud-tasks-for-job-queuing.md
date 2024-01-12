---
status: accepted
date: 2024-01-24
deciders: Ben Bangert, Dan Schomberg
consulted: Barry Chen, Wil Clouser
informed: FxA Team
---

# Use Google Cloud Tasks for job queueing

## Context and Problem Statement

Many account related tasks require interaction with multiple systems that may exceed the typical request deadline. Some tasks require additional guarantee's when they fail, or may partially complete before erroring and require a retry. We also occasionally run into cases where there's many thousands or millions of tasks to complete that have been handled before by splitting up lists of arguments and running them in parallel across many nodes manually by our SRE's. Another challenge we've faced when running large quantities of tasks in a batch manner is ensuring rate limits or adverse system conditions aren't hit.

This type of task handling is typically handled in large systems by a job/task/queue system, which can track jobs, retry them if they fail, inspect failed jobs, and limit the rate at which they're processed. FxA has used SQS/SNS for messaging for some task/event distribution, but has no system built for queueing tasks and processing jobs in a reliable manner.

The most immediate problem is that we want to run large quantities of tasks in a reliable manner, with effective rate limiting. Later, we'd like to be able to queue tasks such as sending an email so that they complete reliably and do not hold up request processing, ideally in a manner that is not programming language dependent so that emails can be sent separately by the Sub Plat team without needing to replicate email handling functionality.

We have had problems in the past using message queues as neither Google Pub/Sub nor AWS SQS have a way to inspect messages that may be stuck in the queue.

## Decision Drivers

- Rate limiting of job processing
- Job retries
- Avoid additional services requiring operational support
- Task deduplication
- Task inspection while in queue
- Scheduling of tasks in the future
- Programming language agnostic

## Considered Options

Push based system can push the tasks in the queue out to the task handler that processes it, which avoids the need to setup a separate service of task processors that would pull from a the job queue. Pull based will require a separate deployment by SRE of job processors to pull tasks from the queue.

- Google Cloud Tasks (Push based)
- Google Pub/Sub (Push based)
- BullMQ + Redis (Pull based)
- Database table of tasks (Pull based)

## Decision Outcome

Chosen option: Google Cloud Tasks, because it meets all our criteria in a cost effective manner with minimal risk and we already utilize a variety of Google Cloud Platform services.

## Pros and Cons of the Options

### Google Cloud Tasks

- Good, because we can have our existing API nodes process tasks with no additional job processor service.
- Good, because centralized rate limiting means we can easily rate limit the overall processing of tasks regardless of how many nodes are processing them.
- Good, because it meets **all** of the criteria in the decision drivers list.
- Good, because push based means there's a central rate lmiting control instead of having to calculate it amongst job processors.
- Good, because HTTP API tasks use a well supported calling method in FxA.
- Bad, because its a new system we don't have prior experience with at Mozilla.
- Bad, because its a Google Cloud Platform only service which would impact our ability to migrate to a different cloud provider.
- Bad, because a HTTP task is akin a HTTP API call but with a very different request context, thus preventing code reuse or requiring workarounds.

### Google Pub/Sub

- Good, because we can have our existing API nodes process tasks with no additional job processor service.
- Good, because it can retry failed jobs.
- Good, because it's programming language agnostic.
- Neutral, because messages can be delayed, but it isn't as flexible as other task scheduling options.
- Bad, because there's no central rate limiting, we'd have to calculate it on the processors.
- Bad, because there's no task deduplication.
- Bad, because tasks can't be introspected in the queue.

### BullMQ + Redis

- Good, because there's task deduplication.
- Good, because there's central rate limiting.
- Good, because its portable to any cloud provider.
- Bad, because there's no central rate limiting, we'd have to calculate it on the processors.
- Bad, because we need job processors setup to pull jobs.
- Bad, because we need another Redis instance focused on the job queues.
- Bad, because we can only use BullMQ from Node both for queuing tasks, and processing them.

### Database table of tasks

- Good, because we already have experience with MySQL.
- Good, because its portable to any cloud provider.
- Bad, because we need another database setup and administrated.
- Bad, because the existing libraries for this aren't very popular.
- Bad, because there's no rate limiting included.
