# Retiring fxa-email-service

- Deciders: Danny Coates, Vijay Budhram, Jon Buckley
- Date: 2021-10-06

## Context and Problem Statement

The goal of fxa-email-service was to spin off the email sending responsibilities of FxA into a shared service that multiple Mozilla projects could use. From its readme:

> The FxA team had an OKR for Q2 2018 about decoupling the auth server from SES and making it possible to send email via different providers. Subsequently, some other teams expressed an interest in depending on a standalone email service too.

> This repo started as our experiment to see what a decoupled email-sending service would look like, written in Rust. It is now handling all FxA email traffic in production, and we are gradually separating it from the FxA stack to run as a standalone service in its own right.

Had it achieved the goal of fully decoupling from FxA and being more widely used we'd likely continue using it. However, in the approximately 4 years of its existance it has only really been used as an intermediate step between auth-server and SES. Fortunately in that time it hasn't required much maintenance so its "weight", being a fairly large codebase for what it does and our only Rust service, has never been a concern. Recent work to eliminate fxa-auth-db-mysql meant we either needed make changes to it or rethink how FxA sends email. It turned out the work to update email-service was larger than eliminating it and replacing it by sending email directly from auth-server via SES or SMTP.

## Decision Drivers

- Future maintenance
- Email provider flexability

## Considered Options

- Keep email-service and update db access
- Eliminate email-service and send directly from auth-server

## Decision Outcome

We will eliminate email-service.

## Pros and Cons of Options

### Keep email-service

Pros:

- Change is scary

Cons:

- More code to maintain
- Less team experience with Rust

### Eliminate email-service

Pros:

- Significantly reduces our code footprint
- No Rust simplifies our build process
- Future email work will be easier to implement and maintain in JS/TS

Cons:

- Lose (at least temporarily) the ability to use multiple email providers simultaneously
  - We've never used this beyond testing so far
  - We could add it to auth-server if required
