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
cancellationSurvey = Ma ulac aɣilif, mudd-aɣ-d afus ad nesnerni imeẓla-nneɣ s uttekki deg <a data-l10n-name="cancellationSurveyUrl">tefrant-a wezzilen</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ma ulac aɣilif, mudd-aɣ-d afus ad nesnerni imeẓla-nneɣ s uttekki deg tefrant-a wezzilen:
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
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Wali tafaṭurt-ik·im: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Amulteɣ-ik·im ɣer { $productName } yefsex
subscriptionAccountDeletion-title = Neḥzen imi tṛuḥeḍ
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Tekkseḍ tineggura-a { -product-mozilla-account }. Ihi, nsefsex ajerred-ik•im ɣer { $productName }. Lexlaṣ-ik aneggaru n { $invoiceTotal } yettwag deg { $invoiceDateOnly }.
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
subscriptionsPaymentProviderCancelled-subject = Aleqqem n telɣut n lexlaṣ yettusra i yimultaɣ { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Suref-aɣ, nesɛa uguren s tarrayt-ik·im n lexlaṣ
subscriptionsPaymentProviderCancelled-content-detected = Nemlal-d ugur akked tarrayt-ik·im n lexlaṣ i yimultaɣ-a.
