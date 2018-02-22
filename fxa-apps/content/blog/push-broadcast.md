+++
title = "Why WebPush Doesn’t Allow Broadcast"
date = "2017-1-10T13:07:31+02:00"
tags = ["ipsum"]
categories = ["lorem"]
banner = "img/banners/banner-5.jpg"
+++

One of the common questions we get working on the Web Push backend team, is “How do I broadcast a Push message to all my customers?” The short answer is, you don’t.

In the early days, I used say that Web Push is more like a doorbell than a walkie-talkie. Web push is designed to send a timely message of interest from a website to a specific customer. Like a doorbell, it’s pretty much a one to one thing.

There’s a lot you can do once you make the decision to make things one to one rather than one to many. For instance, it’s very easy to do end-to-end encryption. When you encrypt a message you make it so that only a certain number of people can read it. Ideally, a message should be readable by just two people, the person who created the message and the person who receives the message. Right now, a message is encrypted by you for your recipient and Mozilla can’t read it. We don’t have and will never see the key.

You can share the message with a group by sharing the key, but with every share, you run the risk of the key leaking to someone you don’t want to have it. On my wall at work, there are two pictures. One is of the TSA luggage security keys, the other is of a Yale 1620 key. The second one you may not have heard about. The 1620 is the master firefighter key for much of New York City, and many firefighters and building supervisors have a copy. Technically, it’s against the law to have an unauthorized copy, but that doesn’t stop many folks from acquiring a copy or some publications from printing very high definition versions so you can make them at home with a blank and a metal file. It’s a good example of having encryption that’s not really encryption. We want to avoid that kind of situation.

There are other issues at hand with doing a “broadcast”. One of the bigger ones is that “broadcast” has already been solved, every time you go to a web page. Web pages can be delivered securely via any number of means, and there are a whole host of existing protocols and procedures in place that make delivery fast and safe. How a browser knows to check a given page is a bit fuzzy, but again, there are hosts of protocols and functions in place to make that as lightweight as possible.

An important consideration for broadcasts (and one to one messages too): when do they need to arrive? Now? Soon? What does that mean really mean in the context of your app? Our system tries hard to deliver messages quickly, but we will never deliver them instantly. Likewise, there are all sorts of reasons that a device may not get a message quickly. The device may be off, out of range, or traveling and have no net access for the next few hours. Once a device is back online, it will try to reconnect and retrieve messages, but even this is essentially polling, and again, there are long established methods for doing these sorts of things. Determining how soon is “now” may help determine when your app really needs to poll for the broadcast elements.

Much like a doorbell or Philips head screwdriver, Web push is a tool for a specific task. It’s possible to use it for other tasks, but it’s ill suited and there are far better tools available.

If you’re interested in some of the more technical details, you can read much of the lively discussion that was held among the working group, as well as a preliminary draft for a webpush-aggregation service.
