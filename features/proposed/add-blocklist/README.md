# Integrate Spamhaus Botnet Controller List (BCL)

## Problem Summary

Currently, Firefox Accounts uses a [customs server](https://github.com/mozilla/fxa-customs-server) to detect fraud and abuse.
This server is capable of blocking and rate limiting requests from a variety of sources.
The primary problem is that the custom server does not take advantage of known blocklists when evaluating whether or not a request should be processed.

In the current system, addresses can be manually added to the blocklist or programmatically if certain request thresholds have been met.
Utilizing a blocklist such as [Spamhaus BCL](https://www.spamhaus.org/bcl/) would allow the custom server to block or rate limit requests that it has no previous record of.

### Assumptions

According to our last security event analysis, utilizing Spamhaus BCL (2016-04-06) could potentially reject requests from 66% of the IPs used. The Spamhaus BCL (2016-04-20) would have rejected 54% of the IPs. This decrease is to be expected from the constant churn of IPs in botnets, and points more to the health of the BCL if anything.

Spamhaus BCL claims that false positives are extremely rare because each IP on the BCL was investigated by a human individual that deemed the traffic malicious.

## Outcomes

The primary outcome for this feature would be an increase in blocked requests from known exploited sources.

## Hypothesis

We believe that adding the Spamhaus BCL will provide more security for our system and users by blocking known exploited sources.
We will know this to be true by monitoring the number of requests that are blocked by the blocklist.

## Metrics

Events monitored

* `fxa.customs.blocklist.hit`
  * Event emitted whenever there is a hit on the blocklist


## Detailed design

This feature is designed to function as a simple standalone module. The module constructor takes a relative path to the Spamhaus block list which is then parsed and stored in memory.

The module will have two primary functions, `reload` and `contains`. The `reload` operation takes a relative path and repopulates the data in memory. The `contains` operation takes an ip address and checks to see if it is contained in the list.

### Unresolved questions and risks

Currently unanswered questions

* How to handle the rate of false positives. How to measure it and what to do if it seems to high.
* Should the system allow user's to bypass the blocklist via confirmation loop.
