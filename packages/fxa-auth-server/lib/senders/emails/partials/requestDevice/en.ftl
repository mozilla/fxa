# "This request" refers to some action a person has taken that leads to the email.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
account-request-origin-device-all = This request came from { $uaBrowser } on { $uaOS } { $uaOSVersion }.

# "This request" refers to some action a person has taken that leads to the email.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
account-request-origin-device-browser-os = This request came from { $uaBrowser } on { $uaOS }.

# "This request" refers to some action a person has taken that leads to the email.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
account-request-origin-device-browser-only = This request came from { $uaBrowser }.

# "This request" refers to some action a person has taken that leads to the email.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
account-request-origin-device-OS-version-only = This request came from { $uaOS } { $uaOSVersion }.

# "This request" refers to some action a person has taken that leads to the email.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
account-request-origin-device-OS-only = This request came from { $uaOS }.

# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
account-request-origin-plaintext = This request came from:
