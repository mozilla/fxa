## ReportSignin page
## If we think a signin may be phony, we send users a notification asking if it was them.
## In that email there will be a link for them to report if it was a fraudulent signin.
## Users reach this page via that link and are given the opportunity to report the signin as fraud.

# Card header element describing the purpose of the page (to allow users report an unauthorized sign-in)
report-signin-header = Report unauthorized sign-in?
# Message describing context for the page, namely that the user reached this page via the link in their email, and that they can report the signin.
report-signin-message = You received an email about attempted access to your account. Would you like to report this activity as suspicious?
# CTA for the main button on the page, prompting the user to report a signin as unauthenticated
report-signin-cta-button = Report activity
# External link for support, explaining why the user received an email asking whether a signin was or was not legitimate
# https://support.mozilla.org/kb/accounts-blocked
report-signin-support-link-prompt = Why is this happening?

# Card header element shown at the top of the page if the link which lead the user to this page is invalid
report-signin-link-damaged-header = Link damaged
