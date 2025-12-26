## Non-email strings

session-verify-send-push-title-2 = Qqen ɣer { -product-mozilla-account }?
session-verify-send-push-body-2 = Sit da i wakken ad nẓer d kečč·kemm
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } d tangalt-ik⋅im n uselkin { -brand-mozilla }. Ad temmet deg 5 tesdidin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } tangalt n usenqed: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } d tangalt-ik⋅im n tririt { -brand-mozilla }. Ad temmet deg 5 tesdidin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } tangalt: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } d tangalt-ik⋅im n tririt { -brand-mozilla }. Ad temmet deg 5 tesdidin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } tangalt: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Alugu n { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = Tasertit tabaḍnit n { -brand-mozilla }
moz-accounts-privacy-url-2 = Tasertit n tbaḍnit { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Tiwtilin n useqdec { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Wagi d iymayl awurman; ma yella d tuccḍa, ulac ayen ara txedmeḍ.
subplat-privacy-notice = Tasertit n tbaḍnit
subplat-privacy-plaintext = Tasertit n tbaḍnit:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Tremseḍ-d imayl-a acku { $email } ɣur-s { -product-mozilla-account } daɣen tjerrdeḍ ɣer { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Tremdeḍ-d imayl-a acku { $email } ɣur-s { -product-mozilla-account }.
subplat-explainer-multiple-2 = Teṭṭfeḍ imayl-a acku { $email } ɣur-s { -product-mozilla-account } yerna tmuletɣed ɣer waṭas n yifarisen.
subplat-explainer-was-deleted-2 = Tremdeḍ-d imayl-a acku { $email } yettwasekles i { -product-mozilla-account }.
subplat-manage-account-2 = Sefrek iɣewwarengik•im { -product-mozilla-account } s tirza ɣer <a data-l10n-name="subplat-account-page">usebter n umiḍan-ik•im</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Sefrek { -product-mozilla-account } iɣewwaṛen-ik s tirza ɣer usebter n umiḍan-ik: { $accountSettingsUrl }
subplat-terms-policy = Tiwtilin akked tsertit n usefsex
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Sefsex ajerred
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Ales armad n ujerred
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Aleqqem n telɣut n ufter
subplat-privacy-policy = Tasertit tabaḍnit n { -brand-mozilla }
subplat-privacy-policy-2 = Tasertit n tbaḍnit { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Tiwtilin n useqdec { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Usḍif
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Tabaḍnit
subplat-privacy-website-plaintext = { subplat-privacy }:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Sader { $productName } seg { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Sader { $productName } seg { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Sebded { $productName } deg <a data-l10n-name="anotherDeviceLink"> yibenk-nniḍen n tnarit </a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Sebded { $productName } deg <a data-l10n-name="anotherDeviceLink"> yibenk-nniḍen </a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Awi { $productName } deg Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Sader-d { $productName } seg the App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Sebded { $productName } ɣef yibenk-nniḍen:
automated-email-change-2 = Mayella ur texdimeḍ ara aya, <a data-l10n-name="passwordChangeLink"> beddel awal-ik uffir </a> tura yakan.
automated-email-support = I wugar n yisallen, rzu ɣer <a data-l10n-name="supportLink">{ -brand-mozilla } Tallelt </a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Mayella ur texdimeḍ ara aya, beddel awal-ik uffir tura yakan.
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = I wugar n telɣut, ddu ɣer tallalt n { -brand-mozilla }:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Wugar n yisallen, rzu ɣer<a data-l10n-name="supportLink">{ -brand-mozilla } Tallelt</a>.
automated-email-no-action-plaintext = Wa d imayl awurman. Ma tenremseḍ-t s leɣlaḍ, ur tesriḍ ad txedmeḍ kra.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Wagi d imayl awurman; ma yella ur tessirgeḍ ara tigawt-a, ttxil-k·m beddel awal-ik·im uffir:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Assuter-a yusa-d seg { $uaBrowser } ɣef { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Assuter-a yusa-d seg { $uaBrowser } ɣef { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Assuter-a yusa-d seg { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Assuter-a yusa-d seg { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Assuter-a yusa-d seg { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ma yella mačči d kečč⋅kemm, <a data-l10n-name="revokeAccountRecoveryLink">kkes tisirit tamaynut</a> akked <a data-l10n-name="passwordChangeLink">beddel n wawal-ik⋅im n uɛeddi</a>.
automatedEmailRecoveryKey-change-pwd-only = Ma yella mačči d kečč⋅kemm, <a data-l10n-name="passwordChangeLink">beddel n wawal-ik⋅im n uɛeddi</a>.
automatedEmailRecoveryKey-more-info = I wugar n yisallen, rzu ɣer <a data-l10n-name="supportLink">{ -brand-mozilla } Tallelt </a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Assuter-a yusa-d seg:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ma yella mačči d kečc, kkes tasarut tamaynut:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ma yella mačči d kečč, beddel awal-ik n uεeddi:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = rnu beddel awal-ik·im uffir:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = I wugar n telɣut, ddu ɣer tallalt n { -brand-mozilla }:
automated-email-reset =
    Wa d imayl awurman;ma ur tessirgeḍ ara tigawt-a, ihi <a data-l10n-name="resetLink">Ttxil wennez awal-ik•im uffir</a>.
    I wugar n telɣut, ttxil rzu ɣer <a data-l10n-name="supportLink">{ -brand-mozilla } Tallelt</a>.
cancellationSurvey = Ma ulac aɣilif, mudd-aɣ-d afus ad nesnerni imeẓla-nneɣ s uttekki deg <a data-l10n-name="cancellationSurveyUrl">tefrant-a wezzilen</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ma ulac aɣilif, mudd-aɣ-d afus ad nesnerni imeẓla-nneɣ s uttekki deg tefrant-a wezzilen:
change-password-plaintext = Ma tcukeḍ yella win yettawṛaḍen ad yekcem ɣer umiḍan inek, snifel awal inek uffir ma ulac aɣilif.
manage-account = Sefrek amiḍan
manage-account-plaintext = { manage-account }:
payment-details = Talqayt n uxelleṣ:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Uṭṭun n tfaturt: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Yettwafter: { $invoiceTotal } deg { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Tafaṭurt i d-iteddun: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Asemday-arnaw: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-discount = Asenɣes
subscription-charges-discount-plaintext = Asenqes: { $invoiceDiscountAmount }
subscription-charges-total = <b>Asemday</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Asemday: { $invoiceTotal }
subscription-charges-credit-applied = Yettwasnas usmad
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Asmad i yettwasnasen: { $creditApplied }

##

subscriptionSupport = Isteqsiyen ɣer ujerred-ik? <a data-l10n-name="subscriptionSupportUrl">tarbeɛt-nneɣ n tallelt</a> a-tt-a da ad ak-d-efk afus.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Isteqsiyen ɣer ujerred-ik? Tarbeɛt-nneɣ n tallelt a-tt-a da ad ak-d-efk afus:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Tanemmirt imi tjerrdeḍ ɣer { $productName }. Ma tesɛiḍ isteqsiyen ɣef ujerred-ik•im neɣ tuḥwaǧeḍ ugar telɣut ɣef { $productName }, ttxil <a data-l10n-name="subscriptionSupportUrl">nermes-aɣ-d</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Tanemmirt imi tjerrdeḍ ɣer{ $productName }. Ma tesɛiḍ isteqsiyen ɣef ujerred-ik•im neɣ tuḥwaǧeḍ ugar n telɣut ɣef{ $productName }, ttxil nermes-aɣ-d:
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Sefrek amulteɣ-ik⋅im:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Nermes tallalt</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Nermes tallalt:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tzemreḍ ad tḍemneḍ tarrayt-ik·im n uxelleḍ d telɣut n umiḍan-ik·im ttwaleqqamen da:
subscriptionUpdatePayment = Akken ur tḥebbes ara tenfiwt-ik, ttxil-k·m <a data-l10n-name="updateBillingUrl"> leqqem talɣut n lexlaṣ-ik </a> s lɛejlan.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Akken ur tḥebbes ara tenfiwt-ik, ttxil leqqem talɣut n lexlaṣ-ik s lɛejlan:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } ɣef { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } ɣef { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (ahat)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (ahat)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (ahat)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (ahat)
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Wali tafaṭurt-ik·im: { $invoiceLink }
cadReminderFirst-subject-1 = asmekti! Aha mtawi { -brand-firefox }
cadReminderFirst-action = Mtawi ibenk-nniḍen
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Laqen sin i umtawi
cadReminderSecond-subject-2 = Ur ttaǧǧa ara acemma ad ak-ifat! Fakk asesteb n umtawi
cadReminderSecond-action = Mtawi ibenk-nniḍen
cadReminderSecond-title-2 = Ur tettu ara amtawi!
cadReminderSecond-description-sync = Mtawi ticraḍ n yisebtar-inek·inem, awalen-ik·im uffiren, accaren yeldin d wugar — s kra n wanda i tseqdaceḍ { -brand-firefox }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Ansuf ɣer { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Ansuf ɣer { $productName }
downloadSubscription-content-2 = Aha bdu aseqdec n meṛṛa timahilin yeddan deg umulteɣ-inek·inem:
downloadSubscription-link-action-2 = Bdu
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } inek yettwakkes
fraudulentAccountDeletion-title = Amiḍan-ik•im yettwakkes
inactiveAccountFinalWarning-title = Amiḍan-ik·im { -brand-mozilla } akked isefka-inek·inem ad ttwakksen
inactiveAccountFinalWarning-preview = Kcem akken ad tḥerzeḍ amiḍan-ik·im
inactiveAccountFinalWarning-action = Kcem akken ad tḥerzeḍ amiḍan-ik·im
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Kcem akken ad tḥerzeḍ amiḍan-ik·im:
inactiveAccountFirstWarning-subject = Ur sṛuḥuy ara amiḍan-ik·im
inactiveAccountFirstWarning-title = Tebɣiḍ ad tḥerzeḍ amiḍan d yisefka inek⋅inem n { -brand-mozilla }?
inactiveAccountFirstWarning-action = Kcem akken ad tḥerzeḍ amiḍan-ik·im
inactiveAccountFirstWarning-preview = Kcem akken ad tḥerzeḍ amiḍan-ik·im
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Kcem akken ad tḥerzeḍ amiḍan-ik·im:
inactiveAccountSecondWarning-subject = Tigawt tettwasra: Amiḍan ad yettwakkes deg 7 wussan
inactiveAccountSecondWarning-title = Amiḍan-ik·im { -brand-mozilla } akked isefka-inek·inem ad ttwakksen deg 7 wussan
inactiveAccountSecondWarning-action = Kcem akken ad tḥerzeḍ amiḍan-ik·im
inactiveAccountSecondWarning-preview = Kcem akken ad tḥerzeḍ amiḍan-ik·im
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Kcem akken ad tḥerzeḍ amiḍan-ik·im:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Ur tesɛiḍ ula  yiwet n tengalt n usesteb n uḥraz!
codes-reminder-title-one = Tesseqdaceḍ tangalt-ik·im taneggarut  n usesteb n uḥraz
codes-reminder-description-part-two = Rnu tingalin timaynutin tura i wakken ar tesruḥuyeḍ ara isefka-k⋅ù mbaɛd.
codes-reminder-description-two-left = Mazal-ak kan snat tengalin.
lowRecoveryCodes-action-2 = Rnu tingalin
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Tuqqna tamaynut ɣer { $clientName }
newDeviceLogin-subjectForMozillaAccount = Tuqqna tamaynut ɣer { -product-mozilla-account }-ik
newDeviceLogin-title-3 = Yettwaseqdac { -product-mozilla-account }-ik i tuqqna
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Mačči d kečč⋅kemm? <a data-l10n-name="passwordChangeLink">Senfel awal n uɛeddi</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Mačči d kečč·kemm? Beddel awal-ik·im uffir:
newDeviceLogin-action = Sefrek amiḍan
passwordChanged-subject = Awal uffir yettuleqqem
passwordChanged-title = Awal uffir yettusnifel akken iwata
passwordChanged-description-2 = Awal-ik·im uffir n { -product-mozilla-account } yettwabeddel akken iwata seg yibenk-a:
passwordChangeRequired-subject = Armud anida yella ccek yettwaf
passwordChangeRequired-title-2 = Wennez awal uffir-ik⋅im
passwordChangeRequired-action = Wennez awal n uɛeddi
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
password-forgot-otp-title = Tettuḍ awal-ik n uεeddi?
password-forgot-otp-request = Neṭṭef-d assuter n ubeddel n wawal uffir ɣqef { -product-mozilla-account }-inek·inem seg:
password-forgot-otp-code-2 = Ma yella d kečč⋅kemm, ha-tt-a tengalt n usentem i ukemmel:
password-forgot-otp-expiry-notice = Tangalt-a ad temmet deg 10 n tseddatin.
passwordReset-subject-2 = Awla inek uffir yettuwennez
passwordReset-title-2 = Awla inek uffir yettuwennez
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Twennzeḍ awal-ik⋅im n uɛeddi { -product-mozilla-account }:
passwordResetAccountRecovery-subject-2 = Awla inek uffir yettuwennez
passwordResetAccountRecovery-title-3 = Awla inek uffir yettuwennez
passwordResetAccountRecovery-action-4 = Sefrek amiḍan
passwordResetRecoveryPhone-subject = Uṭṭun n tiliɣri yettwaseqdec
passwordResetRecoveryPhone-device = Uṭṭun n tiliɣri yettwaseqdec seg:
passwordResetRecoveryPhone-action = Sefrek amiḍan
passwordResetWithRecoveryKeyPrompt-subject = Awla inek uffir yettuwennez
passwordResetWithRecoveryKeyPrompt-title = Awla inek uffir yettuwennez
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Twennzeḍ awal-ik⋅im n uɛeddi { -product-mozilla-account }:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Rnu tasarut n tririt n umiḍan
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Rnu tasarut n tririt n umiḍan:
postAddAccountRecovery-subject-3 = Tasarut n tririt n umiḍan amaynut i tettwarna
postAddAccountRecovery-title2 = Terniḍ tasarut n tririt n umiḍani tamaynut
postAddAccountRecovery-action = Sefrek amiḍan
postAddLinkedAccount-subject-2 = Amiḍan amaynut yeqqen ɣer { -product-mozilla-account }-ik⋅im
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Amiḍan-ik·im { $providerName } yettwaqqen ɣer { -product-mozilla-account }-ik·im
postAddLinkedAccount-action = Sefrek amiḍan
postAddRecoveryPhone-subject = Uṭṭun n tiliɣri yettwarna
postAddRecoveryPhone-title-v2 = Terniḍ uṭṭun n tiliɣri n tririt
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Amek ara yemmesten waya amiḍan-ik⋅im
postAddRecoveryPhone-how-protect-plaintext = Amek ara yemmesten waya amiḍan-ik⋅im:
postAddRecoveryPhone-enabled-device = Tremdeḍ-t-d seg:
postAddRecoveryPhone-action = Sefrek amiḍan
postAddTwoStepAuthentication-title-2 = Tremseḍ asesteb s snat tarrayin
postAddTwoStepAuthentication-action = Sefrek amiḍan
postChangeAccountRecovery-subject = Tasarut n tririt n umiḍan tbeddel
postChangeAccountRecovery-title = Tbeddleḍ tasarut-ik·im n tririt n umiḍani tamaynut
postChangeAccountRecovery-action = Sefrek amiḍan
postChangePrimary-subject = Imayl amezwaru ittuleqqem
postChangePrimary-title = Imayl amezwaru amaynut
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Asnifel n { $email } am imay amezwaru yedda akken iwata.tansa-agi attan tura d isem-ik n useqdac i yis ad teqneḍ γer umiḍan-ik { -product-mozilla-account }, daγen tansa-a ar γur-s ad ttwaznen ilγa n teγlist akked
postChangePrimary-action = Sefrek amiḍan
postChangeRecoveryPhone-subject = Tilifun n tririt tettwaleqqem
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Tangalt tettwaseqdec seg:
postConsumeRecoveryCode-action = Sefrek amiḍan
postConsumeRecoveryCode-subject-v3 = Tingalin n usesteb n uḥraz tettwaseqdec
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Ttwarnan ɣef:
postNewRecoveryCodes-action = Sefrek amiḍan
postRemoveAccountRecovery-subject-2 = Tasarut n tririt n umiḍan tettwakkes
postRemoveAccountRecovery-title-3 = Tekkseḍ tasarut-ik·im n tririt n umiḍani tamaynut
postRemoveAccountRecovery-action = Sefrek amiḍan
postRemoveRecoveryPhone-subject = Uṭṭun n tiliɣri yettwakkes
postRemoveRecoveryPhone-title = Uṭṭun n tiliɣri yettwakkes
postRemoveSecondary-subject = Imay wis sin ittwakkes
postRemoveSecondary-title = Imay wis sin ittwakkes
postRemoveSecondary-action = Sefrek amiḍan
postRemoveTwoStepAuthentication-subject-line-2 = Asesteb s snat n tarrayin yensa
postRemoveTwoStepAuthentication-title-2 = Tessenseḍ asesteb s snat tarrayin
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Tessenseḍ-t seg:
postRemoveTwoStepAuthentication-action = Sefrek amiḍan
postSigninRecoveryCode-preview = Sentem armud n umiḍan
postSigninRecoveryCode-action = Sefrek amiḍan
postSigninRecoveryPhone-preview = Sentem armud n umiḍan
postSigninRecoveryPhone-device = Teqqneḍ-d seg:
postSigninRecoveryPhone-action = Sefrek amiḍan
postVerify-title-2 = Tebɣiḍ kifkif iccer ara twaliḍ ɣef sin yibenkan?
postVerify-subject-4 = Ansuf ɣer { -brand-mozilla }!
postVerify-setup-2 = Qqen ibenk-nniḍen:
postVerify-action-2 = Qqen ibenk-nniḍen
postVerifySecondary-subject = Imay wis sin ittwarna
postVerifySecondary-title = Imay wis sin ittwarna
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Tesnetmeḍ akken iwata { $secondaryEmail } imayl-ik asnawan i{ -product-mozilla-account }. Ilɣa n tɣellist akked isentam n tuqqna ad d-ttwaznen ar snat n tansiwin imayl.
postVerifySecondary-action = Sefrek amiḍan
recovery-subject = Wennez awal uffir-ik
recovery-title-2 = Tettuḍ awal inek uffir?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Neṭṭef-d assuter n ubeddel n wawal uffir ɣqef { -product-mozilla-account }-inek·inem seg:
recovery-action = Sekcem awal uffir amaynut
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Amulteɣ-ik·im ɣer { $productName } yefsex
subscriptionAccountDeletion-title = Neḥzen imi tṛuḥeḍ
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Tekkseḍ tineggura-a { -product-mozilla-account }. Ihi, nsefsex ajerred-ik•im ɣer { $productName }. Lexlaṣ-ik aneggaru n { $invoiceTotal } yettwag deg { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Ansuf ɣer { $productName }: Ma ulac aɣlif, sbadu awal-ik·im uffir.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Ansuf ɣer { $productName }
subscriptionAccountFinishSetup-content-create-3 = Sakin, ad ternuḍ awal uffir n { -product-mozilla-account } i wakken ad tebduḍ aseqdec n umulteɣ-ik·im amaynut.
subscriptionAccountFinishSetup-action-2 = Bdu
subscriptionAccountReminderFirst-subject = Asmekti: Ssali asesteb n umiḍan-ik·im
subscriptionAccountReminderFirst-title = Mazal ur tezmireḍ ara ad tkecmeḍ ɣer umulteɣ-ik·im
subscriptionAccountReminderFirst-action = Rnu awal uffir
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Asmekti aneggaru: Sesteb amiḍan-ik·im
subscriptionAccountReminderSecond-title-2 = Ansuf ɣer { -brand-mozilla }!
subscriptionAccountReminderSecond-action = Rnu awal uffir
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Amulteɣ-ik·im ɣer { $productName } yefsex
subscriptionCancellation-title = Neḥzen imi tṛuḥeḍ

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Tuɣaleḍ ɣer { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Tuɣaleḍ akken iwata seg { $productNameOld } ɣer { $productName }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Ma yella useɣẓan amaynut i tebɣiḍ ad tesbeddeḍ akken ad tesqedceḍ { $productName }, ad ak·akem-id-yaweḍ yimayl iεezlen s yiwellihen ara d-tessadreḍ.
subscriptionDowngrade-content-auto-renew = Ajerred-ik ad yales s wudem awurman yala tawal n ufter, ala ma tferneḍ ad yefsex.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Amulteɣ-ik·im ɣer { $productName } yefsex
subscriptionFailedPaymentsCancellation-title = Amulteɣ-inek·inem yettusefsex
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Lexlaṣ n { $productName } yettwasentem
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Tanemmirt ɣef ujerred ɣer { $productName }
subscriptionFirstInvoice-content-processing = Lexlaṣ-ik iteddu akka tura daɣen izmer ad yaweḍ arma d kuẓ n wussan yeldin.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Ad teṭṭfeḍ imayl iεezlen ideg yella wamek ara tebduḍ aseqdec n { $productName }
subscriptionFirstInvoice-content-auto-renew = Ajerred-ik ad yales s wudem awurman yala tawal n ufter, ala ma tferneḍ ad yefsex.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Axelleṣ n { $productName } yecceḍ
subscriptionPaymentFailed-title = Suref-aɣ, nesɛa uguren akked lexlaṣ-ik
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Nemmuger-d ugur akked lexlaṣ-ik aneggaru n { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Aleqqem n telɣut n lexlaṣ tettusra i { $productName }
subscriptionPaymentProviderCancelled-title = Suref-aɣ, nesɛa uguren s tarrayt-ik·im n lexlaṣ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Ajerred n { $productName } yettwarmed
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Tanemmirt imi tulseḍ ajerred ɣer { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Allus ufetter-ik•im d uxelleṣ ad qqimen akken. Ssuma-k•m i d-itteddun ad tili d { $invoiceTotal } deg { $nextInvoiceDateOnly }. Amulteɣ-ik•im ad imuynet s wudem awurman yal tallit n ufetter anagar ma tferneḍ ad tesfesxeḍ.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Alɣu allus awurman n { $productName }
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Ay iseqdac ɛzizen { $productName },
subscriptionRenewalReminder-content-closing = S tumert,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Tarbaεt { $productName }
subscriptionReplaced-content-no-action = Ulac tigawt i yettwasran seg tama-k⋅m.
subscriptionsPaymentProviderCancelled-subject = Aleqqem n telɣut n lexlaṣ yettusra i yimultaɣ { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Suref-aɣ, nesɛa uguren s tarrayt-ik·im n lexlaṣ
subscriptionsPaymentProviderCancelled-content-detected = Nemlal-d ugur akked tarrayt-ik·im n lexlaṣ i yimultaɣ-a.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Lexlaṣ n { $productName } yettwarmes
subscriptionSubsequentInvoice-title = Tanemmirt imi telliḍ d ameltaɣ!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Nnermes-d lexlaṣ-ik anaggaru i { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Tuliḍ ɣer { $productName }
subscriptionUpgrade-title = Tanemmirt ɣef uleqqem!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Tleqqmeḍ akken iwata ɣer { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Ajerred-ik ad yales s wudem awurman yala tawal n ufter, ala ma tferneḍ ad yefsex.
unblockCode-title = D kečč i d-yessutren tuqqna agi?
unblockCode-prompt = Ma yella ih, hattan tengalt n tsiregt i tesriḍ:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ma yella ih, ha-tt-an tengalt n tsiregt i tesriḍ: { $unblockCode }
unblockCode-report = Ma ulac, mmel-aɣ-d amek ad neḥwi yir imdanen <a data-l10n-name="reportSignInLink">mmel-aɣ-t-id</a>.
unblockCode-report-plaintext = Ma ulac, mudd-aɣ-d afus akken ad neḥwi yir imdanen udiɣ mmel-aɣ-tid.
verificationReminderFinal-subject = Asmekti aneggaru i usentem n umiḍan-ik:im
confirm-account = Sentem amiḍan
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ur tettu ara ad tesnetmeḍ amiḍan-ik·im
verificationReminderFirst-title-3 = Ansuf ɣer { -brand-mozilla }!
confirm-email-2 = Sentem amiḍan
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Sentem amiḍan
verificationReminderSecond-subject-2 = Ur tettu ara ad tesnetmeḍ amiḍan-ik·im
verificationReminderSecond-title-3 = Ur ttaǧǧa ara ad ak-iruḥ kra ɣef { -brand-mozilla }!
verificationReminderSecond-action-2 = Sentem amiḍan
verify-title-3 = Ldi internet s { -brand-mozilla }
verify-description-2 = Sentem amiḍan-ik daɣen faṛes tagnit seg { -brand-mozilla } sekra wanida i teqqneḍ, bdu s:
verify-subject = Fak timerna n umiḍan-ik
verify-action-2 = Sentem amiḍan
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Teqqneḍ ɣer { $clientName }?
verifyLogin-subject-2 = Sentem tuqqna
verifyLogin-action = Sentem tuqqna
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Teqqneḍ ɣer { $serviceName }?
verifyLoginCode-expiry-notice = Ad immet deg 5 n tseddatin.
verifyPrimary-title-2 = Sentem tansa tagejdant
verifyPrimary-description = Asuter i usnifel n umiḍan tettwag seg ibenk agi:
verifyPrimary-subject = Sentem tansa tagejdant
verifyPrimary-action-2 = Sentem imayl
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Mi yedda usentem, tzemreḍ ad tesnifleḍ amiḍan deg ibenk-a am tirna n tansa n imayl tis snat.
verifySecondaryCode-title-2 = Sentem tansa tis snat
verifySecondaryCode-action-2 = Sentem imayl
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Tdda tuttra i wseqdec n { $email } am tansa n imayl tis snat si umiḍan-agi n { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Seqdec tangalt-a n usentem:
verifySecondaryCode-expiry-notice-2 = Aya ad yemmet deg 5 n tesdatin. Ticki yettwasentem, tansa-yagi ad as-d-aweḍen yilγa n tγellist akked usentem.
verifyShortCode-title-3 = Ldi internet s { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Sentem amiḍan-ik daɣen faṛes tagnit seg { -brand-mozilla } sekra wanida i teqqneḍ, bdu s:
verifyShortCode-prompt-3 = Seqdec tangalt-a n usentem:
verifyShortCode-expiry-notice = Ad immet deg 5 n tseddatin.
