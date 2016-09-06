# Integrate Botnet Controller List (BCL)

## Problem Summary

Currently, Firefox Accounts uses [customs server](https://github.com/mozilla/fxa-customs-server) to detect fraud and abuse.
This server is capable of blocking and rate limiting requests from a variety of sources.
The primary problem is that the custom server does not take advantage of known blocklists when evaluating whether or not a request should be processed.

There are multiple BCLs, each with varying rates of success and false positives. This feature does not specify a specific blocklist that will be used but rather the format needed by the list and how to handle updating and processing several lists at a time. Some of the major blocklist sites include [Spamhaus BCL](https://www.spamhaus.org/bcl/) and [FireHOL](http://iplists.firehol.org/).

### Assumptions

According to our last security event analysis, utilizing Spamhaus BCL (2016-06-21) could potentially reject requests from 66% of the IPs used. The Spamhaus BCL (2016-04-20) would have rejected 54% of the IPs. This decrease is to be expected from the constant churn of IPs in botnets, and points more to the health of the BCL if anything.

Spamhaus BCL claims that false positives are extremely rare because each IP on the BCL was investigated by a human individual that deemed the traffic malicious. However, this might not hold true for all blocklists.

In phase 1 of this feature we will be testing several blocklists. While any blocklist can be used, we will be testing with [FireHOL](http://firehol.org/). FireHOL has a prebuilt script that is capable of downloading and updating blocklists through a [cron job](https://github.com/firehol/blocklist-ipsets/wiki/Installing-update-ipsets). The blocklist module will have the ability to reload its configuration if it detects a new list.

## Outcomes

The primary outcome for this feature will be a better understanding of blocklist performance. We shall be able to determine which blocklist has the lowest false positive rate and use that knowledge to make better decesions moving forward.

## Hypothesis

We believe that adding a BCL will provide more security for our system and users by blocking known exploited sources.
We will know this to be true by monitoring the number of requests that are blocked by the blocklist. By evaluating the performance of multiple BCL, we will be able to determine which ones to use.

## Metrics

Events monitored

* `fxa.customs.blocklist.hit`
  * Event emitted whenever there is a hit on the blocklist

## Detailed design

This module is composed of these primary functions.

* load(path)
 * Takes a relative path to a blocklist and sets up the internal structures to perform query.
* contains(ip)
 * Checks to see if the given ip address is contained in the loaded blocklist.
* clear()
 * Clears the loaded blocklist
* refresh()
 * Checks if the timestamp of loaded blocklist file has changed. Reload the list if so.

The blocklist file format is simply a text file that contains one column of ip addresses. These addresses can be
in the form of a absolute address `127.0.0.1` or a CDIR `8.8.8.8/24`. Lines that begin with `#` are ignored. This format is common among Spamhaus and FireHOL.

Additionally, the module will be able to load and refresh multiple lists.

### Unresolved questions and risks

Currently unanswered questions

* How to handle the rate of false positives. How to measure it and what to do if it seems to high.
* Should the system allow user's to bypass the blocklist via confirmation loop.
