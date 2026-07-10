## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Pair using an app
pair-unsupported-message = Did you use the system camera? You must pair from within a { -brand-firefox } app.

# Shown as heading when a desktop user visits from a non-Firefox browser
pair-unsupported-oops-header = Oops! It looks like you’re not using { -brand-firefox }.

# Shown below the heading on desktop non-Firefox, prompting the user to switch browsers
pair-unsupported-switch-to-firefox = Switch to { -brand-firefox } and open this page to connect another device.

# Shown inline on mobile non-Firefox browsers before the download link
pair-unsupported-oops-mobile = Oops! It looks like you’re not using { -brand-firefox }.

# v2: Heading for the mobile instructional message, shown on all mobile devices
# (Firefox and non-Firefox) when the URL is NOT a system camera pair URL.
# Aligned with legacy Backbone copy (see templates/partial/unsupported-pair.mustache).
pair-unsupported-connecting-mobile-header-v2 = Connecting your mobile device with your { -product-mozilla-account }

# v2: Instructions shown below the mobile heading. `<b>` wraps the firefox.com/pair
# URL so the domain does not wrap to a new line on narrow screens.
pair-unsupported-connecting-mobile-instructions-v2 = Open { -brand-firefox } on your computer, visit <b>firefox.com/pair</b>, and follow the on-screen instructions to connect your mobile device.

# v2: "Learn more" link below the mobile instructions; links to a Mozilla support article.
pair-unsupported-learn-more-link-v2 = Learn more

# v2: Fallback shown to a desktop Firefox user who somehow reaches /pair/unsupported.
# Matches the legacy Backbone "Oops! Something went wrong." message.
pair-unsupported-desktop-firefox-fallback-header-v2 = Oops! Something went wrong.
pair-unsupported-desktop-firefox-fallback-message-v2 = Please close this tab and try again.
