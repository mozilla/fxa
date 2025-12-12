# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Brands used across fxa-auth-server, fxa-payments-server, and fxa-settings.
##
## Unless otherwise indicated, brands cannot be:
## - Transliterated.
## - Translated.
##
## Declension should be avoided where possible, leaving the original
## brand unaltered in prominent UI positions.
##
## For further details, consult:
## https://mozilla-l10n.github.io/styleguides/mozilla_general/#brands-copyright-and-trademark

# Firefox and Mozilla Brand
-brand-mozilla = Mozilla
-brand-firefox = Firefox
# "accounts" can be localized and should be lowercase, "Firefox" must be treated as a brand.
# "Firefox accounts" refers to the service
-product-firefox-accounts = Firefox 계정
# "account" can and should be localized, "Mozilla" must be treated as a brand. Singular "Mozilla account" should be used in most cases.
-product-mozilla-account = Mozilla 계정
# "accounts" can and should be localized, "Mozilla" must be treated as a brand. Plural "Mozilla accounts" is used when referring to something affecting all Mozilla accounts, not just the individual's account.
# "accounts" should be lowercase in almost all cases. Uppercase is reserved for special use cases where headline case is necessary, for example legal document names and references.
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla 계정
       *[lowercase] Mozilla 계정
    }
# "account" should be localized and lowercase, "Firefox" must be treated as a brand.
# This is used to refer to a user's account, e.g. "update your Firefox account ..."
-product-firefox-account = Firefox 계정
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
# Mozilla Developer Network
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = 아메리칸 익스프레스
-brand-diners = 다이너스 클럽
-brand-discover = 디스커버 카드
-brand-jcb = JCB
-brand-mastercard = 마스터카드
-brand-unionpay = 은련페이
-brand-visa = 비자카드
-app-store = App Store
-google-play = Google Play
