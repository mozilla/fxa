# Per the guidelines at [1] we allow robots to crawl the site,
# then use the "noindex" directive to instruct them not to store
# any site contents in their index.
#
# [1] https://support.google.com/webmasters/answer/93710

User-agent: archive.org_bot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: *
Allow:
