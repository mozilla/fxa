# Integrate Spamhaus Exploits Block List (XBL)

## Problem Summary

Currently, Firefox Accounts uses a [custom server](https://github.com/mozilla/fxa-customs-server) to detect fraud and abuse.
This server is capable of blocking and rate limiting requests from a variety of sources.
The primary problem is that the custom server does not take advantage of known blocklists when evaluating whether or not a request should be processed.

In the current system, addresses can be manually added to the blocklist or programmatically if certain request thresholds have been met.
Utilizing a blocklist such as [Spamhaus XBL](https://www.spamhaus.org/xbl/) would allow the custom server to block or rate limit requests that it has no previous record of.

### Assumptions

Spamhaus claims that it can block on average [50-70%](https://www.spamhaus.org/faq/section/Spamhaus%20XBL#100) of incoming spam requests.

## Outcomes

The primary outcome for this feature would be an increase in blocked requests from known exploited sources.

## Hypothesis

We believe that adding the Spamhaus XBL will provide more security for our system and users by blocking known exploited sources.
We will know this to be true by monitoring the number of requests that are blocked by the blocklist.

## Metrics

TBD

## Detailed design

TBD

### Unresolved questions and risks

TBD
