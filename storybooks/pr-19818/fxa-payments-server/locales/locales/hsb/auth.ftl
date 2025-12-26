## Non-email strings

session-verify-send-push-title-2 = Pola { -product-mozilla-account(case: "gen") } přizjewić?
session-verify-send-push-body-2 = Klikńće tu, zo byšće wobkrućił, zo ty to sy
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } je wobkrućenski kod { -brand-mozilla }. Płaći 5 mjeńšin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Wobkrućenski kod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } je wobnowjenski kod { -brand-mozilla }. Płaći 5 mjeńšin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } je wobnowjenski kod { -brand-mozilla }. Płaći 5 mjeńšin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kod { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synchronizowane graty">
body-devices-image = <img data-l10n-name="devices-image" alt="Graty">
fxa-privacy-url = Prawidła priwatnosće { -brand-mozilla }
moz-accounts-privacy-url-2 = Zdźělenka priwatnosće { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
moz-accounts-terms-url = Słužbne wuměnjenja { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="logo { -brand-mozilla }">
subplat-automated-email = To je awtomatizowana e-mejlka; jeli sće ju zmylnje dóstał, njetrjebaće ničo činić.
subplat-privacy-notice = Zdźělenka priwatnosće
subplat-privacy-plaintext = Zdźělenka priwatnosće:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Dóstawaće tutu mejlku, dokelž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") } a wy sće za { $productName } zregistrowany.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Dóstawaće tutu mejlku, dokelž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") }.
subplat-explainer-multiple-2 = Dóstawaće tutu mejlku, dokelž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") } a sće wjacore produkty abonował.
subplat-explainer-was-deleted-2 = Dóstawaće tutu mejlku, dokelž { $email } je so za { -product-mozilla-account(case: "acc", capitalization: "lower") } zregistrowała.
subplat-manage-account-2 = Wopytajće swoju <a data-l10n-name="subplat-account-page">kontowu stronu</a>, zo byšće swoje nastajenja { -product-mozilla-account(case: "acc", capitalization: "lower") } rjadował.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Wopytajće swoju kontowu stronu, zo byšće swoje nastajenja { -product-mozilla-account(case: "acc", capitalization: "lower") } rjadował: { $accountSettingsUrl }
subplat-terms-policy = Wuměnjenja a wotwołanske prawidła
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Abonement wupowědźić
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Abonement zaso aktiwizować
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Płaćenske informacije aktualizować
subplat-privacy-policy = Prawidła priwatnosće { -brand-mozilla }
subplat-privacy-policy-2 = Zdźělenka priwatnosće { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Słužbne wuměnjenja { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Prawniske
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Priwatnosć
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Jeli so waše konto zhaša, budźeće hišće mejlki wot Mozilla Corporation a załožby Mozilla Foundation dóstawać, chibazo <a data-l10n-name="unsubscribeLink">prosyće wo wotskazanje</a>.
account-deletion-info-block-support = Jeli prašenja maće abo pomoc trjebaće, stajće so z našim <a data-l10n-name="supportLink">teamom pomocy</a> do zwiska.
account-deletion-info-block-communications-plaintext = Jeli so waše konto zhaša, budźeće hišće mejlki wot Mozilla Corporation a załožby Mozilla Foundation dóstawać, chibazo prosyće wo wotskazanje:
account-deletion-info-block-support-plaintext = Jeli prašenja maće abo pomoc trjebaće, stajće so z našim teamom pomocy do zwiska.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } na { -google-play } sćahnyć">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } na { -app-store } sćahnyć">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalujće { $productName } na <a data-l10n-name="anotherDeviceLink">druhim desktopowym graće</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalujće { $productName } na <a data-l10n-name="anotherDeviceLink">druhim graće</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Dóstańće { $productName } na Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Sćehńće { $productName } z App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instalujće { $productName } na druhim graće:
automated-email-change-2 = Jeli njejsće tutu akciju wuwjedł, <a data-l10n-name="passwordChangeLink">změńće hnydom swoje hesło</a>.
automated-email-support = Za dalše informacije wopytajće <a data-l10n-name="supportLink">pomoc { -brand-mozilla }</a>
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Jeli njejsće tutu akciju wuwjedł, změńće hnydom swoje hesło:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Za dalše informacije wopytajće pomoc { -brand-mozilla }:
automated-email-inactive-account = To je awtomatizowana mejlka. Dóstawaće ju, dokelž maće { -product-mozilla-account } a sće so před dwěmaj lětomaj posledni raz přizjewił.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Za dalše informacije wopytajće <a data-l10n-name="supportLink"> pomoc { -brand-mozilla }</a>.
automated-email-no-action-plaintext = To je awtomatizowana mejlka. Jeli sće ju zmylnje dóstał, njetrjebaće ničo činić.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = To je awtomatiska e-mejlka; jeli njejsće tutu akciju awtorizował, změńće prošu swoje hesło.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Tute naprašowanje wot { $uaBrowser } na { $uaOS } { $uaOSVersion } přińdźe.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Tute naprašowanje wot { $uaBrowser } na { $uaOS } přińdźe.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Tute naprašowanje wot { $uaBrowser } přińdźe.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Tute naprašowanje wot{ $uaOS } { $uaOSVersion } přińdźe.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Tute naprašowanje wot { $uaOS } přińdźe.
automatedEmailRecoveryKey-delete-key-change-pwd = Jeli njejsće to był wy, <a data-l10n-name="revokeAccountRecoveryLink">zhašejće nowy kluč</a> a <a data-l10n-name="passwordChangeLink">změńće swoje hesło</a>.
automatedEmailRecoveryKey-change-pwd-only = Jeli njejsće to był wy, <a data-l10n-name="passwordChangeLink">změńće swoje hesło</a>.
automatedEmailRecoveryKey-more-info = Za dalše informacije wopytajće <a data-l10n-name="supportLink">pomoc { -brand-mozilla }</a>
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Tute naprašowanje přińdźe wot:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Jeli njejsće to był wy, zhašejće nowy kluč:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Jeli njejsće to był wy, změńće swoje hesło:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = a změńće swoje hesło:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Za dalše informacije wopytajće pomoc { -brand-mozilla }:
automated-email-reset =
    To je awtomatizowana mejlka; jeli njejsće tutu akciju awtorizował, <a data-l10n-name="resetLink">stajće prošu swoje hesło wróćo.</a>.
    Za dalše informacije wopytajće prošu <a data-l10n-name="supportLink">pomoc { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Jeli njejsće tutu akciju awtorizował, stajće prošu nětko swoje hesło na { $resetLink } wróćo
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Jeli njejsće tutu akciju wuwjedł, <a data-l10n-name="resetLink">stajće swoje hesło</a> a <a data-l10n-name="twoFactorSettingsLink">stajće dwukročelowu awtentifikaciju</a> hnydom wróćo.
    Za dalše informacije wopytajće prošu <a data-l10n-name="supportLink">Pomoc { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Jeli njejsće tutu akciju wuwjedł, stajće swoje hesło hnydom wróćo:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Stajće tež dwukročelowu awtentifikaciju wróćo:
brand-banner-message = Sće wědźał, zo smy naše mjeno wot { -product-firefox-accounts } do { -product-mozilla-accounts } změnili? <a data-l10n-name="learnMore">Dalše informacije</a>
cancellationSurvey = Prošu wobdźělće so na tutym <a data-l10n-name="cancellationSurveyUrl">krótkim naprašowanju</a>, zo byšće nam pomhał, naše słužby polěpšić.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Prošu wobdźělće so na tutym krótkim naprašowanju, zo byšće nam pomhał, naše słužby polěpšić:
change-password-plaintext = Jeli měniće, zo něchtó pospytuje, přistup k wašemu kontu dóstać, prošu změńće swoje hesło.
manage-account = Konto rjadować
manage-account-plaintext = { manage-account }:
payment-details = Płaćenske podrobnosće:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Čisło zličbowanki: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } dnja { $invoiceDateOnly } wotknihowane
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Přichodna zličbowanka: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Płaćenska metoda:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Płaćenska metoda: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Płaćenska metoda: { $cardName } so na { $lastFour } kónči
payment-provider-card-ending-in-plaintext = Płaćenska metoda: Karta so na { $lastFour } kónči
payment-provider-card-ending-in = <b>Płaćenska metoda:</b> Karta so na { $lastFour } kónči
payment-provider-card-ending-in-card-name = <b>Płaćenska metoda:</b> { $cardName } so na { $lastFour } kónči
subscription-charges-invoice-summary = Zjeće zličbowanki

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Čisło zličbowanki:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Čisło zličbowanki: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Podźělna płaćizna
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Podźělna płaćizna: { $remainingAmountTotal }
subscription-charges-list-price = Lisćinowa płaćizna
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Lisćinowa płaćizna: { $offeringPrice }
subscription-charges-credit-from-unused-time = Dobropis za njezwužity čas
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Dobroměće z njewužiteho časa: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Mjezywuslědk</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Mjezysuma: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Jónkróćny rabat
subscription-charges-one-time-discount-plaintext = Jónkróćny rabat: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-měsačny rabat
        [two] { $discountDuration }-měsačny rabat
        [few] { $discountDuration }-měsačny rabat
       *[other] { $discountDuration }-měsačny rabat
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
        [two] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
        [few] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabat
subscription-charges-discount-plaintext = Rabat: { $invoiceDiscountAmount }
subscription-charges-taxes = Dawki a popłatki
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Dawki a popłatki: { $invoiceTaxAmount }
subscription-charges-total = <b>Dohromady</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Dohromady: { $invoiceTotal }
subscription-charges-credit-applied = Dobroměće je nałožene
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Dobroměće nałožene: { $creditApplied }
subscription-charges-amount-paid = <b>Suma zapłaćena</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Suma zapłaćena: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Sće dobroměće { $creditReceived } dóstał, kotrež so z wašimi přichodnymi zličbowankami rozličujo.

##

subscriptionSupport = Maće prašenja wo swojim abonemenće? Naš <a data-l10n-name="subscriptionSupportUrl">team pomocy</a> je tu, zo by wam pomhał.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Maće prašenja wo swojim abonemenće? Naš team pomocy je tu, zo by wam pomhał:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Wulki dźak, zo sće { $productName } abonował. Jeli prašenja wo swojim abonemenće maće abo wjace informacijow wo { $productName } trjebaće,  <a data-l10n-name="subscriptionSupportUrl">stajće so prošu z nami do zwiska</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Wulki dźak, zo sće { $productName } abonował. Jeli prašenja wo swojim abonemenće maće abo wjace informacijow wo { $productName }s trjebaće,  stajće so prošu z nami do zwiska.
subscription-support-get-help = Wobstarajće sej pomoc za swój abonement
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Rjadujće swój abonement</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Rjadujće swój abonement:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Pomoc skontaktować</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Pomoc skontaktować:
subscriptionUpdateBillingEnsure = Móžeće <a data-l10n-name="updateBillingUrl">tu</a> zawěsćić, zo waša płaćenska metoda a waše kontowe informacije su aktualne:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Móžeće tu zawěsćić, zo waša płaćenska metoda a waše kontowe informacije su aktualne:
subscriptionUpdateBillingTry = Budźemy pospytować, waše płaćenje za přichodne dny znowa přewjesć, ale dyrbiće snano <a data-l10n-name="updateBillingUrl">swoje płaćenske informacije aktualizować</a>, zo byšće nam pomhali, problem rozrisać.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Budźemy pospytować, waše płaćenje za přichodne dny znowa přewjesć, ale dyrbiće snano swoje płaćenske informacije aktualizować, zo byšće nam pomhali, problem rozrisać.
subscriptionUpdatePayment = Zo byšće přetorhnjenje swojeje słužby wobešoł, <a data-l10n-name="updateBillingUrl">aktualizujće prošu swoje płaćenske informacije</a> tak bórze kaž móžno.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Zo byšće přetorhnjenje swojeje słužby wobešoł, aktualizujće prošu swoje płaćenske informacije tak bórze kaž móžno:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Za dalše informacije wopytajće <a data-l10n-name="supportLink">pomoc { -brand-mozilla }</a>
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Za dalše informacije wopytajće pomoc { -brand-mozilla }: { $supportUrl }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } na { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } na { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (trochowany)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (trochowane)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (trochowane)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (trochowane)
view-invoice-link-action = Zličbowanku wobhladać
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Zličbowanku pokazać: { $invoiceLink }
cadReminderFirst-subject-1 = Dopomnjeće! Synchronizujće { -brand-firefox }
cadReminderFirst-action = Druhi grat synchronizować
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = K synchronizaciji přeco dwaj šłušetej
cadReminderFirst-description-v2 = Wužiwajće swoje rajtarki na wšěch wašich gratach. Wobstarajće sej zapołožki, hesła a druhe daty wšudźe tam, hdźež { -brand-firefox } wužiwaće.
cadReminderSecond-subject-2 = Njewuwostajejće ničo! Dajće nam konfiguraciju wašeje snychronizacije dokónčić
cadReminderSecond-action = Druhi grat synchronizować
cadReminderSecond-title-2 = Njezabudźće synchronizować!
cadReminderSecond-description-sync = Synchronizujće swoje zapołožki, hesła, wočinjene rajtarki a wjace – wšudźe, hdźež { -brand-firefox } wužiwaće.
cadReminderSecond-description-plus = Nimo toho so waše daty přeco zaklučuja. Jenož wy a graty, kotrež dowoleće, móža je widźeć.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Witajće k { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Witajće k { $productName }
downloadSubscription-content-2 = Započńće wšě funkcije w swojim abonemenće wužiwać:
downloadSubscription-link-action-2 = Prěnje kroki
fraudulentAccountDeletion-subject-2 = Waše { -product-mozilla-account(captialization: "lower") } je so zhašało
fraudulentAccountDeletion-title = Waše konto je so zhašało
fraudulentAccountDeletion-content-part1-v2 = Njedawno je so { -product-mozilla-account(capitalization: "lower") } załožiło a abonement je so z pomocu tuteje e-mejloweje adresy wotličił. Kaž při wšěch kontach smy was prosyli, tutu e-mejlowa adresu wobkrućić, zo byšće swoje konto wobkrućił.
fraudulentAccountDeletion-content-part2-v2 = Tuchwilu widźimy, zo konto njeje so ženje wobkrućiło. Dokelž tutón krok njeje so dokónčił, njejsmy sej wěsći, hač to je awtorizowany abonement było. Tohodla je so { -product-mozilla-account(capitalization: "lower") }, kotrež je so z tutej e-mejlowej adresu zregistrowało, zhašało a waš abonement je so wupowědźił zarunujo wšě popłatki.
fraudulentAccountDeletion-contact = Jeli prašenja maće, stajće so z našim <a data-l10n-name="mozillaSupportUrl">teamom pomocy</a> do zwiska.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Jeli prašenja maće, stajće so prošu z našim teamom pomocy do zwiska: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Poslednja šansa, zo byšće při swojim konće { -product-mozilla-account } wostał
inactiveAccountFinalWarning-title = Waše kontowe a daty { -brand-mozilla } so zhašeja
inactiveAccountFinalWarning-preview = Přizjewće so, zo byšće při swojim konće wostał
inactiveAccountFinalWarning-account-description = Waše { -product-mozilla-account } so za přistup k darmotnym produktam priwatnosće a přehladowanja kaž sync { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn } wužiwa.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> so waše konto a waše wosobinske daty na přeco zhašeja, chibazo so přizjewjeće.
inactiveAccountFinalWarning-action = Přizjewće so, zo byšće při swojim konće wostał
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Přizjewće so, zo byšće při swojim konće wostał:
inactiveAccountFirstWarning-subject = Njezhubjejće swoje konto
inactiveAccountFirstWarning-title = Chceće při swojim konće { -brand-mozilla } a swojich datach wostać?
inactiveAccountFirstWarning-account-description-v2 = Waše { -product-mozilla-account } so za přistup k darmotnym produktam priwatnosće a přehladowanja kaž sync { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn } wužiwa.
inactiveAccountFirstWarning-inactive-status = Smy pytnyli, zo njejsće so 2 lěće dołho přizjewił.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Waše konto a waše wosobinske daty so <strong>{ $deletionDate }</strong> na přeco zhašeja, dokelž njejsće aktiwny był.
inactiveAccountFirstWarning-action = Přizjewće so, zo byšće při swojim konće wostał
inactiveAccountFirstWarning-preview = Přizjewće so, zo byšće při swojim konće wostał
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Přizjewće so, zo byšće při swojim konće wostał:
inactiveAccountSecondWarning-subject = Akcija trěbna: Kontowe zhašenje za 7 dnjow
inactiveAccountSecondWarning-title = Waše kontowe a daty { -brand-mozilla } so za 7 dnjow zhašeja
inactiveAccountSecondWarning-account-description-v2 = Waše { -product-mozilla-account } so za přistup k darmotnym produktam priwatnosće a přehladowanja kaž sync { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn } wužiwa.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Waše konto a waše wosobinske daty so <strong>{ $deletionDate }</strong> na přeco zhašeja, dokelž njejsće aktiwny był.
inactiveAccountSecondWarning-action = Přizjewće so, zo byšće při swojim konće wostał
inactiveAccountSecondWarning-preview = Přizjewće so, zo byšće při swojim konće wostał
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Přizjewće so, zo byšće při swojim konće wostał:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Nimaće hižo kody za zawěsćensku awtentfikaciju!
codes-reminder-title-one = Wužiwaće hižo swój posledni kod za zawěsćensku awtentifikaciju
codes-reminder-title-two = Je čas, dalše kody za zawěsćensku awtentifikaciju wutworić
codes-reminder-description-part-one = Kody za zawěsćensku awtentifikaciju wam pomhaja, waše informacije wobnowić, hdyž sće swoje hesło zabył.
codes-reminder-description-part-two = Wutworće nětko nowe kody, zo njebyšće so pozdźišo swoje daty zhubił
codes-reminder-description-two-left = Maće jenož dwaj kodaj wyše.
codes-reminder-description-create-codes = Wutworće awtentifikaciske kody za zawěsćenje, zo byšće zaso přistup k swojemu kontu dóstał, jeli sće wuzamknjeny.
lowRecoveryCodes-action-2 = Kody wutworić
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Žane kody za zawěsćensku awtentifikaciju wyše
        [one] Jenož { $numberRemaining } kod za zawěsćensku awtentifikaciju wyše
        [two] Jenož { $numberRemaining } kodaj za zawěsćensku awtentifikaciju wyše
        [few] Jenož { $numberRemaining } kody za zawěsćensku awtentifikaciju wyše
       *[other] Jenož { $numberRemaining } kodow za zawěsćensku awtentifikaciju wyše
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nowe přizjewjenje pola { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nowe přizjewjenje pola wašeho { -product-mozilla-account }
newDeviceLogin-title-3 = Waše { -product-mozilla-account(capitalization: "lower") } je so za přizjewjenje wužiło
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = To wy njejsće? <a data-l10n-name="passwordChangeLink">Změńće swoje hesło</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = To wy njejsće? Změńće swoje hesło:
newDeviceLogin-action = Konto rjadować
passwordChanged-subject = Hesło je so zaktualizowało
passwordChanged-title = Hesło je so wuspěšnje změniło
passwordChanged-description-2 = Hesło wašeho { -product-mozilla-account(case: "gen", capitalization: "lower") } je so wuspěšnje ze slědowaceho grata změniło:
passwordChangeRequired-subject = Podhladna aktiwita wotkryta
passwordChangeRequired-preview = Změńće hnydom swoje hesło
passwordChangeRequired-title-2 = Stajće swoje hesło wróćo
passwordChangeRequired-suspicious-activity-3 = Smy waše konto zawrěli, zo bychmy was před podhladnej aktiwitu škitali. Sće so wot wšěch wašich gratow wotzjewił a synchronizowane daty su so wěstoty dla zhašeli.
passwordChangeRequired-sign-in-3 = Zo byšće so zaso pola swojeho konta přizjewił, trjebaće jenož swoje hesło wróćo stajić.
passwordChangeRequired-different-password-2 = <b>Wažny:</b> Wubjerće mócne hesło, kotrež so wot toho rozeznawa, kotrež sće w zańdźenosći wužiwał.
passwordChangeRequired-different-password-plaintext-2 = Wažny: Wubjerće mócne hesło, kotrež so wot toho rozeznawa, kotrež sće w zańdźenosći wužiwał.
passwordChangeRequired-action = Hesło wróćo stajić
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Wužiwajće { $code }, zo byšće swoje hesło změnił
password-forgot-otp-preview = Tutón kod za 10 mjeńšin spadnje
password-forgot-otp-title = Sće swoje hesło zabył?
password-forgot-otp-request = Smy próstwu wo změnjenje hesła za waše { -product-mozilla-account(case: "acc", capitalization: "lower") } dóstali:
password-forgot-otp-code-2 = Jeli to běšće wy, tu je waš wobkrućenski kod, zo byšće pokročował:
password-forgot-otp-expiry-notice = Tutón kod za 20 minutow spadnje.
passwordReset-subject-2 = Waše hesło je so wróćo stajiło
passwordReset-title-2 = Waše hesło je so wróćo stajiło
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Sće swoje hesło { -product-mozilla-account }  wróćo stajił:
passwordResetAccountRecovery-subject-2 = Waše hesło je so wróćo stajiło
passwordResetAccountRecovery-title-3 = Waše hesło je so wróćo stajiło
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Sće swój kontowy wobnowjenski kluč wužił, zo byšće swoje hesło { -product-mozilla-account } wróćo stajił dnja:
passwordResetAccountRecovery-information = Smy was ze wšěch wašich synchronizowanych gratow wotzjewili. Wutworichmy nowy kontowy wobnowjenski kluč, kotryž tón naruna, kotryž sće wužiwał. Móžeće jón w swojich kontowych nastajenjach změnić.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Smy was ze wšěch wašich synchronizowanych gratow wotzjewili. Wutworichmy nowy kontowy wobnowjenski kluč, kotryž tón naruna, kotryž sće wužiwał. Móžeće jón w swojich kontowych nastajenjach změnić:
passwordResetAccountRecovery-action-4 = Konto rjadować
passwordResetRecoveryPhone-subject = Wobnowjenski telefon wužity
passwordResetRecoveryPhone-preview = Přepruwujće, hač wy sće to był
passwordResetRecoveryPhone-title = Waš wobnowjenski telefon je so wužił, zo by wróćostajenje hesła wobkrućił
passwordResetRecoveryPhone-device = Wobnowjenski telefon wužity wot:
passwordResetRecoveryPhone-action = Konto rjadować
passwordResetWithRecoveryKeyPrompt-subject = Waše hesło je so wróćo stajiło
passwordResetWithRecoveryKeyPrompt-title = Waše hesło je so wróćo stajiło
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Sće swoje hesło { -product-mozilla-account }  wróćo stajił dnja:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Kontowy wobnowjenski kluč wutworić
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Wutworće kontowy wobnowjenski kluč:
passwordResetWithRecoveryKeyPrompt-cta-description = Dyrbiće so na wšěch swojich synchronizowanych gratach přizjewić. Dźeržće swoje daty přichodny wěsty raz z kontowym wobnowjenskim klučom. To wam zmóžnja, waše daty wobnowić, jeli sće waše hesło zabył.
postAddAccountRecovery-subject-3 = Nowy kontowy wobnowjenski kluč je so wutworił
postAddAccountRecovery-title2 = Sće nowy kontowy wobnowjenski kluč wutworił
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Składujće tutón kluč na wěstym městnje – trjebaće jón, zo byšće swoje zaklučowane přehladowanske daty wobnowił, jeli swoje hesło zabudźeće.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Tutón kluč da so jenož jedyn raz wužiwać. Po tym zo sće jón wužił, wutworimy awtomatisce nowy kluč za was. Abo móžeće kóždy čas nowy kluč ze swojich kontowych nastajenjow wutworić.
postAddAccountRecovery-action = Konto rjadować
postAddLinkedAccount-subject-2 = Nowe konto je so z wašim { -product-mozilla-account(case: "instr", capitalization: "lower") } zwjazało
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Waše konto { $providerName } je so z wašim { -product-mozilla-account(case: "instr", capitalization: "lower") } zwjazało.
postAddLinkedAccount-action = Konto rjadować
postAddRecoveryPhone-subject = Wobnowjenski telefon přidaty
postAddRecoveryPhone-preview = Konto so přez dwukročelowu awtentifikaciju škita
postAddRecoveryPhone-title-v2 = Sće čisło wobnowjenskeho telefona přidał
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Sće { $maskedLastFourPhoneNumber } jako swoje wobnowjenske telefonowe čisło přidał
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Kak to waše konto škita
postAddRecoveryPhone-how-protect-plaintext = Kak to waše konto škita:
postAddRecoveryPhone-enabled-device = Sće ju zmóžnił z:
postAddRecoveryPhone-action = Konto rjadować
postAddTwoStepAuthentication-preview = Waše konto je škitane
postAddTwoStepAuthentication-subject-v3 = Dwukročelowa awtentifikacija zmóžnjena
postAddTwoStepAuthentication-title-2 = Sće dwukročelowu awtentifikaciju zmóžnił
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Sće to požadał wot:
postAddTwoStepAuthentication-action = Konto rjadować
postAddTwoStepAuthentication-code-required-v4 = Wěstotne kody z wašeho nałoženja awtentizowanja su kóždy raz trěbne, hdyž so přizjewjeće.
postAddTwoStepAuthentication-recovery-method-codes = Sće tež kody za awtentifikaciju zawěsćenja jako swoju wobnowjensku metodu přidał.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Sće tež { $maskedPhoneNumber } jako swoje wobnowjenske telefonowe čisło přidał.
postAddTwoStepAuthentication-how-protects-link = Kak to waše konto škita
postAddTwoStepAuthentication-how-protects-plaintext = Kak to waše konto škita:
postAddTwoStepAuthentication-device-sign-out-message = Zo byšće wšě swoje zwjazane graty škitał, wy měł so wšudźe, hdźež tute konto wužiwaće, wotzjewić a so potom z pomocu dwukročeloweje awtentifikacije zaso přizjewić.
postChangeAccountRecovery-subject = Kontowy wobnowjenski kluč je so změnił
postChangeAccountRecovery-title = Sće swój kontowy wobnowjenski kluč změnił
postChangeAccountRecovery-body-part1 = Maće nětko nowy kontowy wobnowjenski kluč. Waš předchadny kluč je so zhašał.
postChangeAccountRecovery-body-part2 = Składujće tutón nowy kluč na wěstym městnje – trjebaće jón, zo byšće swoje zaklučowane přehladowanske daty wobnowił, jeli swoje hesło zabudźeće.
postChangeAccountRecovery-action = Konto rjadować
postChangePrimary-subject = Primarna e-mejlowa adresa je so zaktualizowała
postChangePrimary-title = Nowa primarna e-mejlowa adresa
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Sće swoju primarnu e-mejlowu adresu wuspěšnje do { $email } změnił. Tuta adresa je nětko waše wužiwarske mjeno za přizjewjenje pola wašeho { -product-mozilla-account(case: "gen", capitalization: "lower") } a zo byšće wěstotne powěsće a přizjewjenske
postChangePrimary-action = Konto rjadować
postChangeRecoveryPhone-subject = Wobnowjenski telefon zaktualizowany
postChangeRecoveryPhone-preview = Konto so přez dwukročelowu awtentifikaciju škita
postChangeRecoveryPhone-title = Sće swój wobnowjenski telefon změnił
postChangeRecoveryPhone-description = Maće nětko nowy wobnowjenski telefon. Waše předchadne telefonowe čisło je so zhašało.
postChangeRecoveryPhone-requested-device = Sće jón požadał wot:
postChangeTwoStepAuthentication-preview = Waše konto je škitane
postChangeTwoStepAuthentication-subject = Dwukročelowa awtentifikacija je so zaktualizowała
postChangeTwoStepAuthentication-title = Dwukročelowa awtentifikacija je so zaktualizowała
postChangeTwoStepAuthentication-use-new-account = Dyrbiće nětko nowy zapisk { -product-mozilla-account } w swojim awtentifikaciskim nałoženju wužiwać. Starši hižo njebudźe fungować a móžeće jón wotstronić.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Sće to požadał wot:
postChangeTwoStepAuthentication-action = Konto rjadować
postChangeTwoStepAuthentication-how-protects-link = Kak to waše konto škita
postChangeTwoStepAuthentication-how-protects-plaintext = Kak to waše konto škita:
postChangeTwoStepAuthentication-device-sign-out-message = Zo byšće wšě swoje zwjazane graty škitał, wy měł so wšudźe, hdźež tute konto wužiwaće, wotzjewić a so potom z pomocu swojeje noweje dwukročeloweje awtentifikacije zaso přizjewić.
postConsumeRecoveryCode-title-3 = Waš awtentifikaciski kod za zawěsćenje je so wobkrućenje wróćostajenja hesła wužił
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Wužity kod z:
postConsumeRecoveryCode-action = Konto rjadować
postConsumeRecoveryCode-subject-v3 = Awtentifikaciski kod za zawěsćenje je so wužił
postConsumeRecoveryCode-preview = Přepruwujće, hač wy sće to był
postNewRecoveryCodes-subject-2 = Nowe kody za zawěsćensku awtentifikaciju su so wutworili
postNewRecoveryCodes-title-2 = Sće nowy kod za zawěsćensku awtentifikaciju wutworił
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Su so wutworili za:
postNewRecoveryCodes-action = Konto rjadować
postRemoveAccountRecovery-subject-2 = Kontowy wobnowjenski kluč je so zhašał
postRemoveAccountRecovery-title-3 = Sće swój kontowy wobnowjenski kluč zhašał
postRemoveAccountRecovery-body-part1 = Waš kontowy wobnowjenski kluč je trěbny, zo bychu so waše zaklučowane přehladowanske daty wobnowili, jeli waše hesło zabudźeće.
postRemoveAccountRecovery-body-part2 = Jeli hišće kluč nimaće, wutworće nowy kontowy wobnowjenski kluč w swojich kontowych nastajenjach, zo byšće tomu zadźěwał, zo so waše składowane hesła, zapołožki, přehladowanska historija a wjace zhubja.
postRemoveAccountRecovery-action = Konto rjadować
postRemoveRecoveryPhone-subject = Wobnowjenski telefon wotstronjeny
postRemoveRecoveryPhone-preview = Konto so přez dwukročelowu awtentifikaciju škita
postRemoveRecoveryPhone-title = Wobnowjenski telefon wotstronjeny
postRemoveRecoveryPhone-description-v2 = Waš wobnowjenski telefon je so z wašich nastajenjow za dwukročelowu awtentifikaciju wotstronił.
postRemoveRecoveryPhone-description-extra = Móžeće hišće swoje kody za zawěsćensku awtentifikaciju za přizjewjenje wužiwać, jeli njemóžeće swoje nałoženje awtentifikacije wužiwać.
postRemoveRecoveryPhone-requested-device = Sće jón požadał wot:
postRemoveSecondary-subject = Sekundarna e-mejlowa adresa wotstronjena
postRemoveSecondary-title = Sekundarna e-mejlowa adresa wotstronjena
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Sće { $secondaryEmail } jako sekundarnu e-mejlowu adresu ze swojeho { -product-mozilla-account(case: "gen", capitalization: "lower") } wuspěšnje wotstronił. Wěstotne zdźělenki a přizjewjenske wobkrućenja njebudu so hižo na tutu adresu słać.
postRemoveSecondary-action = Konto rjadować
postRemoveTwoStepAuthentication-subject-line-2 = Dwukročelowa awtentifikacija znjemóžnjena
postRemoveTwoStepAuthentication-title-2 = Sće dwukročelowu awtentifikaciju znjemóžnił
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Sće ju znjemóžnił z:
postRemoveTwoStepAuthentication-action = Konto rjadować
postRemoveTwoStepAuthentication-not-required-2 = Njetrjebaće hižo wěstotne kody ze swojeho awtentifikaciskeho nałoženja, hdyž so přizjewjeće.
postSigninRecoveryCode-subject = Awtentifikaciski kod za zawěsćenje, kotryž so za přizjewjenje wužiwa
postSigninRecoveryCode-preview = Kontowu aktiwitu wobkrućić
postSigninRecoveryCode-title = Waš awtentifikaciski kod za zawěsćenje, kotryž je so za přizjewjenje wužił
postSigninRecoveryCode-description = Jeli njejsće to činił, změńće swoje hesło hnydom, zo byšće swoje konto wěsty dźeržał.
postSigninRecoveryCode-device = Sće so přizjewił wot:
postSigninRecoveryCode-action = Konto rjadować
postSigninRecoveryPhone-subject = Wobnowjenski telefon, kotryž so za přizjewjenje wužiwa
postSigninRecoveryPhone-preview = Kontowu aktiwitu wobkrućić
postSigninRecoveryPhone-title = Waš wobnowjenski telefon je so za přizjewjenje wužił
postSigninRecoveryPhone-description = Jeli njejsće to činił, změńće swoje hesło hnydom, zo byšće swoje konto wěsty dźeržał.
postSigninRecoveryPhone-device = Sće so přizjewił wot:
postSigninRecoveryPhone-action = Konto rjadować
postVerify-sub-title-3 = Wjeselimy so was widźeć!
postVerify-title-2 = Chceće samsny rajtark na dwěmaj gratomaj widźeć?
postVerify-description-2 = To je lochko! Instalujće prosće { -brand-firefox } na druhim graće a přizjewće so za synchronizaciju. Na magiske wašnje!
postVerify-sub-description = (Pst… Woznamjenja tež, zo móžeće swoje zapołožki, hesła a druhe daty { -brand-firefox } dóstać, hdźežkuli sće so přizjewił.)
postVerify-subject-4 = Witajće k { -brand-mozilla }!
postVerify-setup-2 = Z druhim gratom zwjazać:
postVerify-action-2 = Z druhim gratom zwjazać
postVerifySecondary-subject = Druha e-mejlowa adresa je so přidała
postVerifySecondary-title = Druha e-mejlowa adresa je so přidała
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Sće { $secondaryEmail } jako sekundarnu e-mejlowu adresu za swoje { -product-mozilla-account(case: "acc", capitalization: "lower") } wuspěšnje přepruwował. Wěstotne zdźělenki a přizjewjenske wobkrućenja budu so nětko na wobě e-mejlowej adresy słać.
postVerifySecondary-action = Konto rjadować
recovery-subject = Stajće swoje hesło wróćo
recovery-title-2 = Sće swoje hesło zabył?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Smy próstwu wo změnjenje hesła za waše { -product-mozilla-account(case: "acc", capitalization: "lower") } dóstali:
recovery-new-password-button = Klikńće na slědowace tłóčatko, zo byšće nowe hesło wutworił. Tutón wotkaz za přichodnu hodźinu spadnje.
recovery-copy-paste = Kopěrujće slědowacy URL do swojeho wobhladowaka, zo byšće hesło wutworił. Tutón wotkaz za přichodnu hodźinu spadnje.
recovery-action = Nowe hesło wutworić
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Waš abonement { $productName } je so wotskazał
subscriptionAccountDeletion-title = Škoda, zo woteńdźeće
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Sće njedawno swoje { -product-mozilla-account(case: "acc", capitalization: "lower") } zhašał. Tohodla smy waš abonement { $productName } wotskazali. Waše kónčne płaćenje { $invoiceTotal } je so dnja { $invoiceDateOnly } zapłaćiło.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Witajće k { $productName }: Nastajće prošu swoje hesło.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Witajće k { $productName }
subscriptionAccountFinishSetup-content-processing = Waše płaćenje so předźěłuje a móže hač do štyri wšědnych dnjow trać. Waš abonement so w kóždym wotličenskim času awtomatisce podlěša, chibazo wupowědźeće.
subscriptionAccountFinishSetup-content-create-3 = Jako dalše hesło { -product-mozilla-account(case: "gen", capitalization: "lower") } wutworiće, zo byšće započał swój nowy abonement wužiwać.
subscriptionAccountFinishSetup-action-2 = Prěnje kroki
subscriptionAccountReminderFirst-subject = Dopomnjeće: Dokónčće konfigurowanje swojeho konta
subscriptionAccountReminderFirst-title = Hisće nimaće přistup k swojemu abonementej
subscriptionAccountReminderFirst-content-info-3 = Před někotrymi dnjemi sće { -product-mozilla-account(case: "acc", capitalization: "lower") } załožił, ale njejsće jo ženje wobkrućił. Nadźijamy so, zo konfigurowanje swojeho konta dokónčiće, zo byšće swój nowy abonement wužiwać móhł.
subscriptionAccountReminderFirst-content-select-2 = Wubjerće „Hesło wutworić“, zo byšće nowe hesło nastajił a přepruwowanje swojeho konta dokónčił.
subscriptionAccountReminderFirst-action = Hesło wutworić
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Poslednje dopomnjeće: Konfigurujće swoje konto
subscriptionAccountReminderSecond-title-2 = Witajće k { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Před někotrymi dnjemi sće { -product-mozilla-account(case: "acc", capitalization: "lower") } załožił, ale njejsće jo ženje wobkrućił. Nadźijamy so, zo konfigurowanje swojeho konta dokónčiće, zo byšće swój nowy abonement wužiwać móhł.
subscriptionAccountReminderSecond-content-select-2 = Wubjerće „Hesło wutworić“, zo byšće nowe hesło nastajił a přepruwowanje swojeho konta dokónčił.
subscriptionAccountReminderSecond-action = Hesło wutworić
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Waš abonement { $productName } je so wotskazał
subscriptionCancellation-title = Škoda, zo woteńdźeće

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Smy waš abonement za { $productName } wupowědźili. Waše kónčne płaćenje { $invoiceTotal } je so dnja { $invoiceDateOnly } sćiniło.
subscriptionCancellation-outstanding-content-2 = Smy waš abonement za { $productName } wupowědźili. Waše kónčne płaćenje { $invoiceTotal } so dnja { $invoiceDateOnly } sćini.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Waša słužba so hač do kónca wašeho aktualneho wotličenskeje doby pokročuje, kotraž je { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Sće k { $productName } přešoł
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Sće wuspěšnje wot { $productNameOld } do { $productName } přeměnił.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Započinajo z wašej přichodnej zličbowanku so waš popłatk wot { $paymentAmountOld } přez { $productPaymentCycleOld } do { $paymentAmountNew } přez { $productPaymentCycleNew } změni. Potom tež jónkróćny dobropis { $paymentProrated } dóstanjeće, zo by so niši popłatk za zbytk { $productPaymentCycleOld } wotbłyšćował.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Jeli dyrbiće nowu softwaru instalować, zo byšće { $productName }s wužiwał, dóstanjeće separatnu mejlku ze sćehnjenskimi instrukcijemi.
subscriptionDowngrade-content-auto-renew = Waš abonement so awtomatisce kóždu wotličensku dobu podlěšuje, chibazo wupowědźiće.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Waš abonement { $productName } je so wotskazał
subscriptionFailedPaymentsCancellation-title = Waš abonement je so wupowědźił
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Smy waš abonement { $productName } wupowědźili, dokelž wjacore płaćenske pospyty njejsu so poradźili. Zo byšće znowa přistup měł, startujće nowy abonement ze zaktualizowanej płaćenskej metodu.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Płaćenje { $productName } wobkrućene
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Wulki dźak, zo sće { $productName } abonował
subscriptionFirstInvoice-content-processing = Waše płaćenje so tuchwilu předźěłuje a móže do štyrjoch wobchodnych dnjow trać.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Dóstanjeće separatnu mejlku wo tym, kak móžeće započeć { $productName } wužiwać.
subscriptionFirstInvoice-content-auto-renew = Waš abonement so awtomatisce kóždu wotličensku dobu podlěšuje, chibazo wupowědźiće.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Waša přichodna zličbowanka so dnja { $nextInvoiceDateOnly } wuda.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Płaćenska metoda za { $productName } je spadnyła abo bórze spadnje
subscriptionPaymentExpired-title-2 = Waša płaćenska metoda je spadnyła abo bórze spadnje
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Płaćenska metoda, kotruž za { $productName } wužiwaće, je spadnyła abo bórze spadnje.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Płaćenje { $productName } je so nimokuliło
subscriptionPaymentFailed-title = Bohužel mamy problemy z wašim płaćenjom
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Mějachmy problem z wašim najnowšim płaćenjom za { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Waša płaćenska metoda je snano spadnjena, abo waša aktualna płaćenska metoda je zestarjena.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Aktualizowanje płaćenskich informacijow je za { $productName } trěbne
subscriptionPaymentProviderCancelled-title = Bohužel mamy problemy z wašej płaćenskej metodu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Mějachmy problem z wašej płaćenskej metodu za { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Waša płaćenska metoda je snano spadnjena, abo waša aktualna płaćenska metoda je zestarjena.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonement { $productName } je so zaso zaktiwizował
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Wulki dźak, zo sće zaso zaktiwizował swój abonement { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Waš wotličenski cyklus a płaćenje samsnej wostanjetej. Waša přichodna wotknihownje budźe { $invoiceTotal } dnja { $nextInvoiceDateOnly }. Waš abonement so po kóždej wotličenskej periodźe awtomatisce wobnowja, chibazo jón wupowědźiće.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Zdźělenka wo awtomatiskim podlěšenju { $productName }
subscriptionRenewalReminder-title = Waš abonement so bórze podlěši
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Luby kupc { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Waš aktualny abonement so za { $reminderLength } dnjow awtomatisce podlěši. Potom { -brand-mozilla } waš abonement { $planIntervalCount } { $planInterval } podlěši a waše konto so wužiwajo płaćensku metodu ze sumu { $invoiceTotal } poćeži.
subscriptionRenewalReminder-content-closing = Z přećelnym postrowom
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Team { $productName }
subscriptionReplaced-subject = Waš abonement je so jako dźěl wašeje aktualizacije zaktualizował
subscriptionReplaced-title = Waš abonement je so zaktualizował
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Waš jednotliwy abonement { $productName } je so wuměnił a je nětko we wašim pakeće wobsahowany.
subscriptionReplaced-content-credit = Dóstanjeće dobropis za njewužity čas ze swojeho předchadneho abonementa. Tutón dobropis so awtomatisce na waše konto nałoži a za přichodne popłatki wužiwa.
subscriptionReplaced-content-no-action = Z wašeje strony akcija trěbna njeje.
subscriptionsPaymentExpired-subject-2 = Płaćenska metoda za swoje abonementy je spadnyła abo bórze spadnje
subscriptionsPaymentExpired-title-2 = Waša płaćenska metoda je spadnyła abo bórze spadnje
subscriptionsPaymentExpired-content-2 = Płaćenska metoda, z kotrejž płaćenja za slědowace abonementy přewjedźeće, je spadnyła abo bórze spadnje.
subscriptionsPaymentProviderCancelled-subject = Aktualizowanje płaćenskich informacijow je za abonementy { -brand-mozilla } trěbne
subscriptionsPaymentProviderCancelled-title = Bohužel mamy problemy z wašej płaćenskej metodu
subscriptionsPaymentProviderCancelled-content-detected = Mějachmy problem z wašej płaćenskej metodu za slědowace abonementy.
subscriptionsPaymentProviderCancelled-content-payment-1 = Waša płaćenska metoda je snano spadnjena, abo waša aktualna płaćenska metoda je zestarjena.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Płaćenje { $productName } dóstane
subscriptionSubsequentInvoice-title = Wulki dźak, zo sće abonent!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Smy waše najnowše płaćenje za { $productName } dóstali.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Waša přichodna zličbowanka so dnja { $nextInvoiceDateOnly } wuda.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Sće na { $productName } zaktualizował
subscriptionUpgrade-title = Wulki dźak za aktualizowanje!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Sće wuspěšnje na { $productName } zaktualizował.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Wam je so jónkróćny popłatk { $invoiceAmountDue } wobličił, zo by so wyša płaćizna wašeho abonementa za zbytk tuteje wotličenskeje periody wotbłyšćowała ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Sće dobroměće we wysokosći { $paymentProrated } dóstał.
subscriptionUpgrade-content-subscription-next-bill-change = Započinajo z wašej přichodnej zličbowanku, so płaćizna wašeho abonementa změni.
subscriptionUpgrade-content-old-price-day = Předchadny popłatk je { $paymentAmountOld } na dźeń był.
subscriptionUpgrade-content-old-price-week = Předchadny popłatk je { $paymentAmountOld } na tydźeń był.
subscriptionUpgrade-content-old-price-month = Předchadny popłatk je { $paymentAmountOld } na měsac był.
subscriptionUpgrade-content-old-price-halfyear = Předchadny popłatk je { $paymentAmountOld } na šěsć měsacow był.
subscriptionUpgrade-content-old-price-year = Předchadny popłatk je { $paymentAmountOld } na lěto był.
subscriptionUpgrade-content-old-price-default = Předchadny popłatk je { $paymentAmountOld } na wotličenski interwal był.
subscriptionUpgrade-content-old-price-day-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na dźeń był.
subscriptionUpgrade-content-old-price-week-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na tydźeń był.
subscriptionUpgrade-content-old-price-month-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na měsac był.
subscriptionUpgrade-content-old-price-halfyear-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na šěsć měsacow był.
subscriptionUpgrade-content-old-price-year-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na lěto był.
subscriptionUpgrade-content-old-price-default-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na wotličenski interwal był.
subscriptionUpgrade-content-new-price-day = Wotnětka dyrbiće { $paymentAmountNew } na dźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-week = Wotnětka dyrbiće { $paymentAmountNew } na tydźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-month = Wotnětka dyrbiće { $paymentAmountNew } na měsac płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-halfyear = Wotnětka dyrbiće { $paymentAmountNew } na šěsć měsacow płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-year = Wotnětka dyrbiće { $paymentAmountNew } na lěto płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-default = Wotnětka dyrbiće { $paymentAmountNew } na wotličenski interwal płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-day-dtax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na dźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-week-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na tydźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-month-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na měsac płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-halfyear-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na šěsć měsacow płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-year-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na lěto płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-default-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na wotličenski interwal płaćić, nimo rabatow.
subscriptionUpgrade-existing = Jeli so jedyn z wašich eksistowacych abonementow z tutej aktualizaciju překrywaja, budźemy so z nim zaběrać a wam separatnu mejlku z podrobnosćemi słać. Jeli waš nowy plan produkty wopřijima, kotrež sej instalaciju wužaduja, budźemy wam separatnu mejlku z instalaciskimi instrukcijemi słać.
subscriptionUpgrade-auto-renew = Waš abonement so awtomatisce kóždu wotličensku dobu podlěšuje, chibazo wupowědźiće.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Wužiwajće { $unblockCode } za přizjewjenje
unblockCode-preview = Tutón kod za jednu hodźinu spadnje
unblockCode-title = Chceće so wy přizjewić?
unblockCode-prompt = Jeli haj, tu je awtorizowanski kod, kotryž trjebaće:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Jeli haj, tu je awtorizowanski kod, kotryž trjebaće: { $unblockCode }
unblockCode-report = Jeli nic, pomhajće nam zadobywarjow wotwobarać a <a data-l10n-name="reportSignInLink">zdźělće nam to.</a>
unblockCode-report-plaintext = Jeli nic, pomhajće nam zadobywarjow wotwobarać a zdźělće nam to.
verificationReminderFinal-subject = Poslednje dopomnjeće: Wobkrućće swoje konto
verificationReminderFinal-description-2 = Před někotrymi njedźelemi sće { -product-mozilla-account(case: "acc", capitalization: "lower") } załožił, ale njejsće jo wobkrućił. Za wašu wěstotu zhašamy konto, jeli so za přichodne 24 hodźin njewobkrući.
confirm-account = Konto wobkrućić
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Njezabywajće swoje konto wobkrućić
verificationReminderFirst-title-3 = Witajće k { -brand-mozilla }!
verificationReminderFirst-description-3 = Před někotrymi dnjemi sće { -product-mozilla-account(case: "acc", capitalization: "lower") } załožił, ale njejsće jo wobkrućił. Prošu wobkrućće swoje konto w běhu 15 dnjow abo konto so awtomatisce zhaša.
verificationReminderFirst-sub-description-3 = Njezapasće wobhladowak, za kotryž wy a waša priwatnosć na prěnje městno stejatej.
confirm-email-2 = Konto wobkrućić
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Konto wobkrućić
verificationReminderSecond-subject-2 = Njezabywajće swoje konto wobkrućić
verificationReminderSecond-title-3 = Popřejće sej { -brand-mozilla }!
verificationReminderSecond-description-4 = Před někotrymi dnjemi sće { -product-mozilla-account(case: "acc", capitalization: "lower") } załožił, ale njejsće jo wobkrućił. Prošu wobkrućće swoje konto w běhu 10 dnjow abo konto so awtomatisce zhaša.
verificationReminderSecond-second-description-3 = Waš { -product-mozilla-account } wam zmóžnja, swoje dožiwjenje { -brand-firefox } přez graty synchronizować a dowoluje přistup k wjace priwatnosć škitacym produktam wot { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Budźće dźěl našeje misije, internet do městna přetworić, kotryž je wotewrjeny za kóždeho.
verificationReminderSecond-action-2 = Konto wobkrućić
verify-title-3 = Wočińće internet z { -brand-mozilla }
verify-description-2 = Wobkrućće swoje konto a wućehńće najlěpše z { -brand-mozilla }, wšudźe, hdźež so přizjewjeće, započinajo z:
verify-subject = Dokónčće załoženje swojeho konta
verify-action-2 = Konto wobkrućić
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Wužiwajće { $code }, zo byšće swoje konto změnił
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Tutón kod za { $expirationTime } mjeńšinu spadnje.
        [two] Tutón kod za { $expirationTime } mjeńšinje spadnje.
        [few] Tutón kod za { $expirationTime } mjeńšiny spadnje.
       *[other] Tutón kod za { $expirationTime } mjeńšinow spadnje.
    }
verifyAccountChange-title = Měnjeće swoje kontowe informacije?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Schwalće tutu změnu, zo byšće nam pomhał, waše konto škitać:
verifyAccountChange-prompt = Jeli haj, tu je waš awtorizowanski kod:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Spadnje za { $expirationTime } mjeńšinu.
        [two] Spadnje za { $expirationTime } mjeńšinje.
        [few] Spadnje za { $expirationTime } mjeńšiny.
       *[other] Spadnje za { $expirationTime } mjeńšinow.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Sće so pola { $clientName } přizjewił?
verifyLogin-description-2 = Wobkrućće, zo sće so přizjewił, zo byšće nam pomhał, waše konto škitać.
verifyLogin-subject-2 = Přizjewjenje wobkrućić
verifyLogin-action = Přizjewjenje wobkrućić
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Wužiwajće { $code } za přizjewjenje
verifyLoginCode-preview = Tutón kod za 5 mjeńšin spadnje.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Sće so pola { $serviceName } přizjewił?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Schwalće swoje přizjewjenje, zo byšće nam pomhał, waše konto škitać.
verifyLoginCode-prompt-3 = Jeli haj, tu je waš awtorizowanski kod:
verifyLoginCode-expiry-notice = Spadnje za 5 mjeńšin.
verifyPrimary-title-2 = Primarnu e-mejlowu adresu wobkrućić
verifyPrimary-description = Slědowacy grat je požadał, kontowu změnu přewjesć:
verifyPrimary-subject = Primarnu e-mejlowu adresu wobkrućić
verifyPrimary-action-2 = E-mejlowu adresu wobkrućić
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Hdyž su wobkrućene, su kontowe změny móžne, kaž na přikład přidawanje sekundarneje e-mejloweje adresy z tutoho grata.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Wužiwajće { $code }, zo byšće swoju sekundarnu e-mejlowu adresu wobkrućił
verifySecondaryCode-preview = Tutón kod za 5 mjeńšin spadnje.
verifySecondaryCode-title-2 = Sekundarnu e-mejlowu adresu wobkrućić
verifySecondaryCode-action-2 = E-mejlowu adresu wobkrućić
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Slědowace konto { -product-mozilla-account } je požadało, { $email } jako druhu e-mejlowu adresu wužiwać:
verifySecondaryCode-prompt-2 = Tutón wobkrućenski kod zapodać:
verifySecondaryCode-expiry-notice-2 = Spadnje za 5 mjeńšin. Tak ruče kaž je so wobkrućiła, tuta adresa započnje, wěstotne zdźělenki a wobkrućenja dóstawać.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Wužiwajće { $code }, zo byšće swoje konto wobkrućił
verifyShortCode-preview-2 = Tutón kod za 5 mjeńšin spadnje
verifyShortCode-title-3 = Wočińće internet z { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Wobkrućće swoje konto a wućehńće najlěpše z { -brand-mozilla }, wšudźe, hdźež so přizjewjeće, započinajo z:
verifyShortCode-prompt-3 = Tutón wobkrućenski kod zapodać:
verifyShortCode-expiry-notice = Spadnje za 5 mjeńšin.
