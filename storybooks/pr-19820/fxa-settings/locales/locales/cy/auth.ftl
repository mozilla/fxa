## Non-email strings

session-verify-send-push-title-2 = Mewngofnodi i'ch { -product-mozilla-account }?
session-verify-send-push-body-2 = Cliciwch yma i gadarnhau mai chi sydd yno
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } yw eich cod dilysu { -brand-mozilla }. Daw i ben mewn 5 munud.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Cod dilysu { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } yw eich cod adfer { -brand-mozilla }. Daw i ben mewn 5 munud.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Cod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } yw eich cod adfer { -brand-mozilla }. Daw i ben mewn 5 munud.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Cod { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Cydweddu dyfeisiau">
body-devices-image = <img data-l10n-name="devices-image" alt="Dyfeisiau">
fxa-privacy-url = Polisi Preifatrwydd { -brand-mozilla }
moz-accounts-privacy-url-2 = Hysbysiad Preifatrwydd { -product-mozilla-accounts(cyfalafu: "uppercase") }
moz-accounts-terms-url = Amodau Gwasanaeth { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = E-bost awtomatig yw hwn; os ydych wedi derbyn yr e-bost hwn ar gam, nid oes angen gweithredu.
subplat-privacy-notice = Hysbysiad preifatrwydd
subplat-privacy-plaintext = Hysbysiad preifatrwydd:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Rydych yn derbyn yr e-bost hwn oherwydd bod gan { $email } gyfrif { -product-mozilla-account } ac rydych wedi cofrestru ar gyfer { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Rydych chi'n derbyn yr e-bost hwn oherwydd bod gan { $email } gyfrif { -product-mozilla-account }.
subplat-explainer-multiple-2 = Rydych chi'n derbyn yr e-bost hwn oherwydd bod gan { $email } gyfrif { -product-mozilla-account } a'ch bod wedi tanysgrifio i fwy nag un cynnyrch.
subplat-explainer-was-deleted-2 = Rydych chi'n derbyn yr e-bost hwn oherwydd bod { $email } wedi'i gofrestru ar gyfer { -product-mozilla-account }.
subplat-manage-account-2 = Rheolwch eich gosodiadau cyfrif { -product-mozilla-account } drwy ymweld â'ch <a data-l10n-name="subplat-account-page">tudalen cyfrif</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Rheolwch eich gosodiadau cyfrif { -product-mozilla-account } drwy fynd i dudalen eich cyfrif: { $accountSettingsUrl }
subplat-terms-policy = Polisi telerau a chanslo
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Canslo tanysgrifiad
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Ailgychwyn y tanysgrifiad
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Diweddaru’r manylion bilio
subplat-privacy-policy = Polisi Preifatrwydd { -brand-mozilla }
subplat-privacy-policy-2 = Hysbysiad Preifatrwydd { -product-mozilla-accounts(cyfalafu: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 } :
subplat-moz-terms = Amodau Gwasanaeth { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms } :
subplat-legal = Cyfreithiol
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Preifatrwydd
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Os caiff eich cyfrif ei ddileu, byddwch yn dal i dderbyn e-byst gan y Mozilla Corporation a'r Mozilla Foundation, oni bai eich bod <a data-l10n-name="unsubscribeLink">yn gofyn i ddad-danysgrifio</a>.
account-deletion-info-block-support = Os oes gennych unrhyw gwestiynau, teimlwch yn rydd i gysyllu â'n <a data-l10n-name="supportLink">tîm cymorth</a>.
account-deletion-info-block-communications-plaintext = Os caiff eich cyfrif ei ddileu, byddwch yn dal i dderbyn e-byst gan y Mozilla Corporation a'r Mozilla Foundation, oni bai eich bod yn gofyn i gael dad-danysgrifio:
account-deletion-info-block-support-plaintext = Os oes gennych unrhyw gwestiynau neu os oes angen cymorth arnoch, mae croeso i chi gysylltu â'n tîm cymorth:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Llwytho { $productName }  i lawr o { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Llwytho { $productName }  i lawr o { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Gosod { $productName } ar <a data-l10n-name="anotherDeviceLink">ddyfais bwrdd gwaith arall</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Gosod { $productName } ar <a data-l10n-name="anotherDeviceLink">ddyfais arall</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Cael { $productName } o Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Llwythwch { $productName } i awr o'r App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Gosodwch { $productName } ar ddyfais arall:
automated-email-change-2 = Os nad chi wnaeth hyn, <a data-l10n-name="passwordChangeLink">newidiwch eich cyfrinair</a> ar unwaith.
automated-email-support = Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">{ -brand-mozilla } Cefnogaeth</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Os nad chi wnaeth hyn, newidiwch eich cyfrinair ar unwaith:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Am ragor o wybodaeth, ewch i { -brand-mozilla } Cefnogaeth:
automated-email-inactive-account = E-bost awtomatig yw hwn. Rydych yn ei dderbyn oherwydd bod gennych chi gyfrif { -product-mozilla-account } ac mae'n 2 flynedd ers i chi fewngofnodi diwethaf.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">Cefnogaeth { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Mae hwn yn e-bost awtomataidd. Os gwnaethoch ei dderbyn trwy gamgymeriad, nid oes angen i chi wneud dim.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = E-bost awtomataidd yw hwn; os na wnaethoch awdurdodi'r weithred hon, yna newidiwch eich cyfrinair:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Daeth y cais hwn gan { $uaBrowser } ar { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Daeth y cais hwn gan { $uaBrowser } ar { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Daeth y cais hwn gan { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Daeth y cais hwn gan { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Daeth y cais hwn gan { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Os nad chi oedd hwn, <a data-l10n-name="revokeAccountRecoveryLink">dilëwch yr allwedd newydd</a> a <a data-l10n-name="passwordChangeLink">newidiwch eich cyfrinair</a>.
automatedEmailRecoveryKey-change-pwd-only = Os nad chi oedd hwn, <a data-l10n-name="passwordChangeLink">newidiwch eich cyfrinair</a>.
automatedEmailRecoveryKey-more-info = Am ragor o wybodaeth, ewch i'n <a data-l10n-name="supportLink">{ -brand-mozilla } Cefnogaeth</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Daeth y cais hwn gan:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Os nad chi oedd hwn, dilëwch yr allwedd newydd:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Os nad chi oedd hwn, newidiwch eich cyfrinair:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = a newidiwch eich cyfrinair:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Am ragor o wybodaeth, ewch i'n { -brand-mozilla } Cefnogaeth:
automated-email-reset =
    Mae hwn yn e-bost awtomatig; os na wnaethoch chi awdurdodi'r weithred hon, yna <a data-l10n-name="resetLink"> newidiwch eich cyfrinair</a>.
    Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">Cymorth { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Os nad chi wnaeth awdurdodi'r weithred hon, ailosodwch eich cyfrinair nawr yn { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Os na chi wnaeth hyn, yna <a data-l10n-name="resetLink">ailosodwch eich cyfrinair</a> ac <a data-l10n-name="twoFactorSettingsLink">ailosod dilysiad dau gam</a>yn syth. Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">{ -brand-mozilla } Cefnogaeth</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Os nad chi wnaeth hyn, yna ailosodwch eich cyfrinair ar unwaith yn:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Hefyd, ailosodwch ddilysiad dau gam yn:
brand-banner-message = Oeddech chi'n gwybod ein bod ni wedi newid ein henw o { -product-firefox-accounts } i { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Darllen rhagor</a>
cancellationSurvey = Helpwch ni i wella ein gwasanaethau trwy lanw'r <a data-l10n-name="cancellationSurveyUrl">arolwg byr</a> hwn.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Helpwch ni i wella ein gwasanaethau trwy lanw’r arolwg byr hwn:
change-password-plaintext = Os ydych yn amau bod rhywun yn ceisio cael mynediad at eich cyfrif, newidiwch eich cyfrinair.
manage-account = Rheoli cyfrif
manage-account-plaintext = { manage-account }:
payment-details = Manylion talu:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Rhif Anfoneb: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Codwyd: { $invoiceTotal } ar { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Anfoneb Nesaf: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Dull talu:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Dull talu: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Dull talu: { $cardName } yn gorffen gyda { $lastFour }
payment-provider-card-ending-in-plaintext = Dull talu: Cerdyn yn gorffen gyda { $lastFour }
payment-provider-card-ending-in = <b>Dull talu:</b> Cerdyn yn gorffen gyda { $lastFour }
payment-provider-card-ending-in-card-name = <b>Dull talu:</b> { $cardName } yn gorffen gyda { $lastFour }
subscription-charges-invoice-summary = Crynodeb o'r Anfoneb

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Rhif yr anfoneb:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Rhif anfoneb: { $invoiceNumber }
subscription-charges-invoice-date = <b>Dyddiad:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Dyddiad: { $invoiceDateOnly }
subscription-charges-prorated-price = Pris prorata
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Pris prorata: { $remainingAmountTotal }
subscription-charges-list-price = Rhestru'r pris
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Rhestr pris: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credyd am amser heb ei ddefnyddio
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credyd o amser heb ei ddefnyddio: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Is-gyfanswm</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Is-gyfanswm: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Gostyngiad un-tro
subscription-charges-one-time-discount-plaintext = Gostyngiad un-tro: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [zero] Gostyngiad o { $discountDuration } misoedd
        [one] Gostyngiad o { $discountDuration } mis
        [two] Gostyngiad o { $discountDuration } fis
        [few] Gostyngiad o { $discountDuration } mis
        [many] Gostyngiad o { $discountDuration } mis
       *[other] Gostyngiad o { $discountDuration } mis
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [zero] Gostyngiad o { $discountDuration }-misoedd: { $invoiceDiscountAmount }
        [one] Gostyngiad o { $discountDuration }-mis: { $invoiceDiscountAmount }
        [two] Gostyngiad o { $discountDuration }-fis: { $invoiceDiscountAmount }
        [few] Gostyngiad o { $discountDuration }-mis: { $invoiceDiscountAmount }
        [many] Gostyngiad o { $discountDuration }-mis: { $invoiceDiscountAmount }
       *[other] Gostyngiad o { $discountDuration }-mis: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Gostyngiad
subscription-charges-discount-plaintext = Gostyngiad: { $invoiceDiscountAmount }
subscription-charges-taxes = Trethi a ffioedd
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Trethi a ffioedd: { $invoiceTaxAmount }
subscription-charges-total = <b>Cyfanswm</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Cyfanswm: { $invoiceTotal }
subscription-charges-credit-applied = Credyd wedi'i gynnwys
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credyd wedi'i gynnwys: { $creditApplied }
subscription-charges-amount-paid = <b>Swm dalwyd</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Swm dalwyd: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Rydych wedi derbyn credyd cyfrif o { $creditReceived }, a fydd yn cael ei gynnwys i'ch anfonebau yn y dyfodol.

##

subscriptionSupport = Cwestiynau am eich tanysgrifiad? Mae ein tîm cymorth <a data-l10n-name="subscriptionSupportUrl">tîm cymorth</a> yma i'ch helpu chi.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Cwestiynau am eich tanysgrifiad? Mae ein tîm cymorth yma i’ch helpu chi:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Diolch am danysgrifio i { $productName }. Os oes gennych unrhyw gwestiynau am eich tanysgrifiad neu os oes angen mwy o wybodaeth arnoch am{ $productName }, <a data-l10n-name="subscriptionSupportUrl">cysylltwch â ni</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Diolch am danysgrifio i { $productName }. Os oes gennych unrhyw gwestiynau am eich tanysgrifiad neu os oes angen mwy o wybodaeth arnoch am { $productName }, cysylltwch â ni.
subscription-support-get-help = Cael help gyda'ch tanysgrifiad
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Rheoli eich tanysgrifiad</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Rheoli eich tanysgrifiad:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Cysylltu â chefnogaeth</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Cymorth cyswllt:
subscriptionUpdateBillingEnsure = Gallwch sicrhau bod eich dull talu a manylion eich cyfrif yn gyfredol <a data-l10n-name="updateBillingUrl">yma</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Gallwch sicrhau bod eich dull talu a manylion eich cyfrif yn gyfredol yma:
subscriptionUpdateBillingTry = Byddwn yn rhoi cynnig ar eich taliad eto dros yr ychydig ddyddiau nesaf, ond efallai y bydd angen i chi ein helpu i'w drwsio trwy <a data-l10n-name="updateBillingUrl">ddiweddaru eich manylion talu</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Byddwn yn rhoi cynnig ar eich taliad eto dros yr ychydig ddyddiau nesaf, ond efallai y bydd angen i chi ein helpu i'w drwsio trwy ddiweddaru eich manylion talu.
subscriptionUpdatePayment = Er mwyn atal unrhyw darfu ar eich gwasanaeth, <a data-l10n-name="updateBillingUrl">diweddarwch eich manylion talu</a> cyn gynted â phosibl.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Er mwyn atal unrhyw darfu ar eich gwasanaeth, diweddarwch eich manylion talu cyn gynted â phosibl.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">Gefnogaeth { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Am ragor o wybodaeth, ewch i Cefnogaeth: { -brand-mozilla } { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } ar { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } ar { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (amcan)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (amcan)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (amcan)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (amcan)
view-invoice-link-action = Gweld anfoneb
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Gweld yr Anfoneb: { $invoiceLink }
cadReminderFirst-subject-1 = Beth am gydweddu { -brand-firefox }?
cadReminderFirst-action = Cydweddu dyfais arall
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Mae'n cymryd dau i gydweddu
cadReminderFirst-description-v2 = Ewch â'ch tabiau ar draws eich holl ddyfeisiau. Cewch eich nodau tudalen, cyfrineiriau, a data arall ym mhob man rydych yn defnyddio { -brand-firefox }.
cadReminderSecond-subject-2 = Peidiwch â cholli allan! Gadewch i ni orffen eich gosodiad cydweddu
cadReminderSecond-action = Cydweddu dyfais arall
cadReminderSecond-title-2 = Peidiwch ag anghofio cydweddu!
cadReminderSecond-description-sync = Cyrchwch a chydweddu eich nodau tudalen, cyfrineiriau, a mwy ym mhob man y byddwch yn defnyddio { -brand-firefox }.
cadReminderSecond-description-plus = Hefyd, mae eich data bob amser wedi'i amgryptio. Dim ond chi a dyfeisiau rydych chi'n eu cymeradwyo all ei weld.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Croeso i { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Croeso i { $productName }
downloadSubscription-content-2 = Gadewch i ni ddechrau defnyddio'r holl nodweddion sydd wedi'u cynnwys yn eich tanysgrifiad:
downloadSubscription-link-action-2 = Cychwyn Arni
fraudulentAccountDeletion-subject-2 = Cafodd eich cyfrif { -product-mozilla-account } ei ddileu
fraudulentAccountDeletion-title = Cafodd eich cyfrif ei ddileu
fraudulentAccountDeletion-content-part1-v2 = Yn ddiweddar, crëwyd cyfrif { -product-mozilla-account } a chodwyd tâl am danysgrifiad gan ddefnyddio'r cyfeiriad e-bost hwn. Fel gyda phob cyfrif newydd, rydym wedi gofyn i chi gadarnhau eich cyfrif trwy ddilysu'r cyfeiriad e-bost hwn yn gyntaf.
fraudulentAccountDeletion-content-part2-v2 = Ar hyn o bryd, rydym yn gweld na chafodd y cyfrif byth ei chadarnhau. Gan na chwblhawyd y cam hwn, nid ydym yn siŵr a oedd hwn yn danysgrifiad go-iawn. O ganlyniad, cafodd y cyfrif { -product-mozilla-account } a gofrestrwyd i'r cyfeiriad e-bost hwn ei ddileu a chafodd eich tanysgrifiad ei ddiddymu a chafodd yr holl daliadau eu had-dalu.
fraudulentAccountDeletion-contact = Os oes gennych unrhyw gwestiynau, cysylltwch â'n <a data-l10n-name="mozillaSupportUrl">tîm cymorth</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Os oes gennych unrhyw gwestiynau, cysylltwch â'n tîm cymorth: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Y cyfle olaf i gadw'ch cyfrif { -product-mozilla-account }
inactiveAccountFinalWarning-title = Bydd eich cyfrif a'ch data { -brand-mozilla } yn cael eu dileu
inactiveAccountFinalWarning-preview = Mewngofnodwch i gadw'ch cyfrif
inactiveAccountFinalWarning-account-description = Mae eich cyfrif { -product-mozilla-account } yn cael ei ddefnyddio i gael mynediad at gynnyrch preifatrwydd am ddim a chynnyrch pori fel { -brand-firefox } Sync , { -product-mozilla-monitor }, { -product-firefox-relay }, a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Ar <strong>{ $deletionDate }</strong>, bydd eich cyfrif a'ch data personol yn cael eu dileu'n barhaol oni bai eich bod yn mewngofnodi.
inactiveAccountFinalWarning-action = Mewngofnodwch i gadw'ch cyfrif
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Mewngofnodwch i gadw'ch cyfrif:
inactiveAccountFirstWarning-subject = Peidiwch â cholli'ch cyfrif
inactiveAccountFirstWarning-title = Ydych chi am gadw eich cyfrif a'ch data { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Mae eich cyfrif { -product-mozilla-account } yn cael ei ddefnyddio i gael mynediad at gynnyrch preifatrwydd am ddim a chynnyrch pori fel { -brand-firefox } Sync , { -product-mozilla-monitor }, { -product-firefox-relay }, a { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Rydym wedi sylwi nad ydych wedi mewngofnodi ers 2 flynedd.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Bydd eich cyfrif a'ch data personol yn cael eu dileu yn barhaol ar <strong>{ $deletionDate }</strong> oherwydd nad ydych wedi bod yn weithredol.
inactiveAccountFirstWarning-action = Mewngofnodwch i gadw'ch cyfrif
inactiveAccountFirstWarning-preview = Mewngofnodwch i gadw'ch cyfrif
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Mewngofnodwch i gadw'ch cyfrif:
inactiveAccountSecondWarning-subject = Camau i'w cymryd: Bydd eich cyfrif yn cael ei ddileu o fewn 7 diwrnod
inactiveAccountSecondWarning-title = Bydd eich cyfrif a'ch data { -brand-mozilla } yn cael eu dileu ymhen 7 diwrnod
inactiveAccountSecondWarning-account-description-v2 = Mae eich cyfrif { -product-mozilla-account } yn cael ei ddefnyddio i gael mynediad at gynnyrch preifatrwydd am ddim a chynnyrch pori fel { -brand-firefox } Sync , { -product-mozilla-monitor }, { -product-firefox-relay }, a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Bydd eich cyfrif a'ch data personol yn cael eu dileu yn barhaol ar <strong>{ $deletionDate }</strong> oherwydd nad ydych wedi bod yn weithredol.
inactiveAccountSecondWarning-action = Mewngofnodwch i gadw'ch cyfrif
inactiveAccountSecondWarning-preview = Mewngofnodwch i gadw'ch cyfrif
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Mewngofnodwch i gadw'ch cyfrif:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Rydych chi allan o godau dilysu wrth gefn!
codes-reminder-title-one = Rydych chi ar eich cod dilysu wrth gefn olaf
codes-reminder-title-two = Mae'n bryd creu mwy o godau dilysu wrth gefn
codes-reminder-description-part-one = Mae codau dilysu wrth gefn yn eich helpu i adfer eich manylion pan fyddwch chi'n anghofio'ch cyfrinair.
codes-reminder-description-part-two = Crëwch godau newydd nawr fel na fyddwch chi'n colli'ch data yn nes ymlaen.
codes-reminder-description-two-left = Dim ond dau god sydd gennych ar ôl.
codes-reminder-description-create-codes = Crëwch godau dilysu wrth gefn newydd i'ch helpu i ddychwelyd i'ch cyfrif os ydych wedi'ch cloi allan.
lowRecoveryCodes-action-2 = Creu codau
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Does dim codau dilysu ar ôl!
        [zero] Does dim codau dilysu ar ôl!
        [one] Dim ond 1 cod dilysu wrth gefn ar ôl!
        [two] Dim ond { $numberRemaining } god dilysu wrth gefn ar ôl!
        [few] Dim ond { $numberRemaining } cod dilysu wrth gefn ar ôl!
        [many] Dim ond { $numberRemaining } chod dilysu wrth gefn ar ôl!
       *[other] Dim ond { $numberRemaining } cod dilysu wrth gefn ar ôl!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Mewngofnod newydd i { $clientName }
newDeviceLogin-subjectForMozillaAccount = Mewngofnod newydd i'ch { -product-mozilla-account }
newDeviceLogin-title-3 = Defnyddiwyd eich cyfrif { -product-mozilla-account } i fewngofnodi
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Nid chi? <a data-l10n-name="passwordChangeLink">Newidiwch eich cyfrinair</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Nid chi? Newidiwch eich cyfrinair:
newDeviceLogin-action = Rheoli cyfrif
passwordChanged-subject = Diweddarwyd y cyfrinair
passwordChanged-title = Mae’r cyfrinair wedi ei newid yn llwyddiannus
passwordChanged-description-2 = Cafodd eich cyfrinair cyfrif { -product-mozilla-account } ei newid yn llwyddiannus o'r ddyfais ganlynol:
passwordChangeRequired-subject = Gweithgaredd amheus wedi’i ganfod
passwordChangeRequired-preview = Newidiwch eich cyfrinair ar unwaith
passwordChangeRequired-title-2 = Ailosodwch eich cyfrinair
passwordChangeRequired-suspicious-activity-3 = Rydym wedi cloi eich cyfrif i'w gadw'n ddiogel rhag gweithgarwch amheus. Rydych chi wedi cael eich allgofnodi o'ch holl ddyfeisiau ac mae unrhyw ddata sydd wedi'u cydweddu wedi'u dileu rhag ofn.
passwordChangeRequired-sign-in-3 = I fewngofnodi'n ôl i'ch cyfrif, y cyfan sydd angen i chi ei wneud yw ailosod eich cyfrinair.
passwordChangeRequired-different-password-2 = <b>Pwysig:</b> Dewiswch gyfrinair cryf sy'n wahanol i'r un rydych chi wedi'i ddefnyddio yn y gorffennol.
passwordChangeRequired-different-password-plaintext-2 = Pwysig: Dewiswch gyfrinair cryf sy'n wahanol i'r un rydych chi wedi'i ddefnyddio yn y gorffennol.
passwordChangeRequired-action = Ailosodwch y cyfrinair
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Defnyddiwch { $code } i newid eich cyfrinair
password-forgot-otp-preview = Mae'r cod hwn yn dod i ben o fewn 10 munud
password-forgot-otp-title = Wedi anghofio eich cyfrinair?
password-forgot-otp-request = Rydym wedi derbyn cais i newid cyfrinair ar eich cyfrif { -product-mozilla-account } oddi wrth:
password-forgot-otp-code-2 = Os mai chi oedd hwn, dyma'ch cod cadarnhau i symud ymlaen:
password-forgot-otp-expiry-notice = Mae'r cod hwn yn dod i ben mewn 10 munud.
passwordReset-subject-2 = Mae eich cyfrinair wedi ei ailosod
passwordReset-title-2 = Mae eich cyfrinair wedi ei ailosod
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Rydych chi wedi ailosod eich cyfrinair { -product-mozilla-account } ar:
passwordResetAccountRecovery-subject-2 = Mae eich cyfrinair wedi'i ailosod
passwordResetAccountRecovery-title-3 = Mae eich cyfrinair wedi ei ailosod
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Fe wnaethoch chi ddefnyddio'ch allwedd adfer cyfrif i ailosod eich cyfrinair { -product-mozilla-account } ar:
passwordResetAccountRecovery-information = Fe wnaethom eich allgofnodi o'ch holl ddyfeisiau wedi'u cydweddu. Rydym wedi creu allwedd adfer cyfrif newydd yn lle'r un a ddefnyddiwyd gennych. Gallwch ei newid yng ngosodiadau eich cyfrif.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Fe wnaethom eich allgofnodi o'ch holl ddyfeisiau wedi'u cydweddu. Rydym wedi creu allwedd adfer cyfrif newydd yn lle'r un a ddefnyddiwyd gennych. Gallwch ei newid yng ngosodiadau eich cyfrif:
passwordResetAccountRecovery-action-4 = Rheoli cyfrif
passwordResetRecoveryPhone-subject = Ffôn adfer wedi'i ddefnyddio
passwordResetRecoveryPhone-preview = Gwiriwch i wneud yn siŵr mai chi oedd hwn
passwordResetRecoveryPhone-title = Cafodd eich ffôn adfer ei ddefnyddio i gadarnhau ailosod cyfrinair
passwordResetRecoveryPhone-device = Defnyddiwch ffôn adfer o:
passwordResetRecoveryPhone-action = Rheoli cyfrif
passwordResetWithRecoveryKeyPrompt-subject = Mae eich cyfrinair wedi ei ailosod
passwordResetWithRecoveryKeyPrompt-title = Mae eich cyfrinair wedi ei ailosod
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Rydych chi wedi ailosod eich cyfrinair { -product-mozilla-account } ar:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crëwch allwedd adfer cyfrif
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crëwch allwedd adfer cyfrif
passwordResetWithRecoveryKeyPrompt-cta-description = Bydd angen i chi fewngofnodi eto ar bob un o'ch dyfeisiau wedi'u cydweddu. Cadwch eich data yn ddiogel y tro nesaf gydag allwedd adfer cyfrif. Mae hyn yn eich galluogi i adennill eich data os byddwch yn anghofio eich cyfrinair.
postAddAccountRecovery-subject-3 = Allwedd adfer cyfrif newydd wedi'i chreu
postAddAccountRecovery-title2 = Rydych chi wedi creu allwedd adfer cyfrif newydd
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Cadwch yr allwedd hon mewn man diogel - bydd ei hangen arnoch i adfer eich data pori wedi'i amgryptio os byddwch yn anghofio eich cyfrinair.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Dim ond unwaith y mae modd defnyddio'r allwedd hon. Ar ôl i chi ei ddefnyddio, byddwn yn creu un newydd i chi'n awtomatig. Neu gallwch greu un newydd ar unrhywadeg o osodiadau eich cyfrif.
postAddAccountRecovery-action = Rheoli cyfrif
postAddLinkedAccount-subject-2 = Cyfrif newydd yn gysylltiedig â'ch cyfrif { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Mae eich cyfrif { $providerName } wedi'i gysylltu â'ch cyfrif { -product-mozilla-account }
postAddLinkedAccount-action = Rheoli cyfrif
postAddRecoveryPhone-subject = Ffôn adfer wedi'i ychwanegu
postAddRecoveryPhone-preview = Mae'r cyfrif wedi'i ddiogelu gan ddilysiad dau gam
postAddRecoveryPhone-title-v2 = Rydych wedi ychwanegu rhif ffôn adfer
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Rydych wedi ychwanegu { $maskedLastFourPhoneNumber } fel eich rhif ffôn adfer
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Sut mae hyn yn diogelu eich cyfrif
postAddRecoveryPhone-how-protect-plaintext = Sut mae hyn yn diogelu eich cyfrif:
postAddRecoveryPhone-enabled-device = Rydych chi wedi'i alluogi o:
postAddRecoveryPhone-action = Rheoli cyfrif
postAddTwoStepAuthentication-preview = Mae eich cyfrif wedi'i ddiogelu
postAddTwoStepAuthentication-subject-v3 = Mae dilysu dau gam ymlaen
postAddTwoStepAuthentication-title-2 = Rydych chi wedi troi dilysu dau gam ymlaen
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Rydych wedi gofyn am hyn oddi wrth:
postAddTwoStepAuthentication-action = Rheoli cyfrif
postAddTwoStepAuthentication-code-required-v4 = Bellach mae angen codau diogelwch o'ch ap dilysu bob tro y byddwch chi'n mewngofnodi.
postAddTwoStepAuthentication-recovery-method-codes = Rydych chi hefyd wedi ychwanegu codau dilysu wrth gefn fel eich dull adfer.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Rydych hefyd wedi ychwanegu { $maskedPhoneNumber } fel eich rhif ffôn adfer.
postAddTwoStepAuthentication-how-protects-link = Sut mae hyn yn diogelu eich cyfrif
postAddTwoStepAuthentication-how-protects-plaintext = Sut mae hyn yn diogelu eich cyfrif:
postAddTwoStepAuthentication-device-sign-out-message = Er mwyn diogelu eich holl ddyfeisiau cysylltiedig, dylech allgofnodi ym mhob man rydych chi'n defnyddio'r cyfrif hwn, ac yna mewngofnodi eto gan ddefnyddio dilysiad dau gam.
postChangeAccountRecovery-subject = Allwedd adfer cyfrif wedi'i newid
postChangeAccountRecovery-title = Rydych wedi newid eich allwedd adfer cyfrif
postChangeAccountRecovery-body-part1 = Mae gennych bellach allwedd adfer cyfrif newydd. Cafodd eich allwedd flaenorol ei dileu.
postChangeAccountRecovery-body-part2 = Cadwch yr allwedd newydd hon mewn man diogel - bydd ei hangen arnoch i adfer eich data pori wedi'i amgryptio os byddwch yn anghofio eich cyfrinair.
postChangeAccountRecovery-action = Rheoli cyfrif
postChangePrimary-subject = Diweddarwyd y prif e-bost
postChangePrimary-title = Prif e-bost newydd
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Rydych wedi llwyddo i newid eich prif e-bost i { $email }. Y cyfeiriad hwn bellach yw eich enw defnyddiwr ar gyfer mewngofnodi i'ch cyfrif { -product-mozilla-account }, yn ogystal â derbyn hysbysiadau diogelwch a chadarnhau eich mewngofnodi.
postChangePrimary-action = Rheoli cyfrif
postChangeRecoveryPhone-subject = Ffôn adfer wedi'i ddiweddaru
postChangeRecoveryPhone-preview = Mae'r cyfrif wedi'i ddiogelu gan ddilysiad dau gam
postChangeRecoveryPhone-title = Rydych wedi newid eich ffôn adfer
postChangeRecoveryPhone-description = Mae gennych ffôn adfer newydd nawr. Cafodd eich rhif ffôn blaenorol ei ddileu.
postChangeRecoveryPhone-requested-device = Rydych wedi gofyn amdano o:
postChangeTwoStepAuthentication-preview = Mae eich cyfrif wedi'i ddiogelu
postChangeTwoStepAuthentication-subject = Dilysiad dau gam wedi'i ddiweddaru
postChangeTwoStepAuthentication-title = Mae dilysu dau gam wedi'i ddiweddaru
postChangeTwoStepAuthentication-use-new-account = Nawr mae angen i chi ddefnyddio'r cofnod { -product-mozilla-account } newydd yn eich ap dilysu. Bydd yr un hynaf ddim yn gweithio mwyach a gallwch ei dynnu.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Rydych wedi gofyn am hyn oddi wrth:
postChangeTwoStepAuthentication-action = Rheoli cyfrif
postChangeTwoStepAuthentication-how-protects-link = Sut mae hyn yn diogelu'ch cyfrif
postChangeTwoStepAuthentication-how-protects-plaintext = Sut mae hyn yn diogelu'ch cyfrif:
postChangeTwoStepAuthentication-device-sign-out-message = Er mwyn diogelu eich holl ddyfeisiau cysylltiedig, dylech allgofnodi ym mhobman rydych yn defnyddio'r cyfrif hwn, ac yna mewngofnodi eto gan ddefnyddio'ch dilysiad dau gam newydd.
postConsumeRecoveryCode-title-3 = Defnyddiwyd eich cod dilysu wrth gefn i gadarnhau ailosod y cyfrinair
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Cod defnyddiwyd o:
postConsumeRecoveryCode-action = Rheoli cyfrif
postConsumeRecoveryCode-subject-v3 = Defnyddiwyd cod dilysu wrth gefn
postConsumeRecoveryCode-preview = Gwiriwch i wneud yn siŵr mai chi oedd hwn
postNewRecoveryCodes-subject-2 = Crëwyd codau dilysu wrth gefn newydd
postNewRecoveryCodes-title-2 = Rydych wedi creu codau dilysu wrth gefn newydd
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Fe'u crëwyd ar:
postNewRecoveryCodes-action = Rheoli cyfrif
postRemoveAccountRecovery-subject-2 = Diëwyd yr allwedd adfer cyfrif.
postRemoveAccountRecovery-title-3 = Rydych wedi dileu allwedd adfer eich cyfrif
postRemoveAccountRecovery-body-part1 = Mae angen eich allwedd adfer cyfrif i adfer eich data pori wedi'i amgryptio os byddwch yn anghofio eich cyfrinair.
postRemoveAccountRecovery-body-part2 = Os nad ydych wedi gwneud hynny eisoes, crëwch allwedd adfer cyfrif newydd yng ngosodiadau eich cyfrif i atal colli eich cyfrineiriau sydd wedi'u cadw, nodau tudalen, hanes pori, a mwy.
postRemoveAccountRecovery-action = Rheoli cyfrif
postRemoveRecoveryPhone-subject = Ffôn adfer wedi'i dynnu
postRemoveRecoveryPhone-preview = Mae'r cyfrif wedi'i ddiogelu gan ddilysiad dau gam
postRemoveRecoveryPhone-title = Ffôn adfer wedi'i dynnu
postRemoveRecoveryPhone-description-v2 = Mae eich ffôn adfer wedi'i dynnu o'ch gosodiadau dilysu dau gam.
postRemoveRecoveryPhone-description-extra = Gallwch barhau i ddefnyddio eich codau dilysu wrth gefn i fewngofnodi os na allwch ddefnyddio eich ap dilysu.
postRemoveRecoveryPhone-requested-device = Rydych wedi gofyn amdano o:
postRemoveSecondary-subject = Tynnwyd yr ail e-bost
postRemoveSecondary-title = Tynnwyd yr ail e-bost
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Rydych wedi llwyddo i ddileu { $secondaryEmail } fel ail e-bost o'ch cyfrif { -product-mozilla-account }. Ni fydd hysbysiadau diogelwch a chadarnhad mewngofnodi yn cael eu hanfon i'r cyfeiriad hwn mwyach.
postRemoveSecondary-action = Rheoli cyfrif
postRemoveTwoStepAuthentication-subject-line-2 = Mae dilysu dau gam wedi'i ddiffodd
postRemoveTwoStepAuthentication-title-2 = Rydych wedi diffodd dilysu dau gam
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Rydych wedi'i analluogi o:
postRemoveTwoStepAuthentication-action = Rheoli cyfrif
postRemoveTwoStepAuthentication-not-required-2 = Nid oes angen codau diogelwch arnoch o'ch ap dilysu mwyach pan fyddwch yn mewngofnodi.
postSigninRecoveryCode-subject = Y cod dilysu wrth gefn a ddefnyddiwyd i fewngofnodi
postSigninRecoveryCode-preview = Cadarnhau gweithgarwch cyfrif
postSigninRecoveryCode-title = Defnyddiwyd eich cod dilysu wrth gefn i fewngofnodi
postSigninRecoveryCode-description = Os nad chi wnaeth hyn, dylech newid eich cyfrinair ar unwaith i gadw'ch cyfrif yn ddiogel.
postSigninRecoveryCode-device = Fe wnaethoch chi fewngofnodi o:
postSigninRecoveryCode-action = Rheoli cyfrif
postSigninRecoveryPhone-subject = Ffôn adfer sy'n cael ei ddefnyddio i fewngofnodi
postSigninRecoveryPhone-preview = Cadarnhau gweithgarwch cyfrif
postSigninRecoveryPhone-title = Defnyddiwyd eich ffôn adfer i fewngofnodi
postSigninRecoveryPhone-description = Os nad chi wnaeth hyn, dylech newid eich cyfrinair ar unwaith i gadw'ch cyfrif yn ddiogel.
postSigninRecoveryPhone-device = Rydych chi wedi mewngofnodi o:
postSigninRecoveryPhone-action = Rheoli cyfrif
postVerify-sub-title-3 = Rydym wrth ein bodd eich gweld!
postVerify-title-2 = Eisiau gweld yr un tab ar ddwy ddyfais?
postVerify-description-2 = Mae'n hawdd! Gosodwch { -brand-firefox } ar ddyfais arall a mewngofnodi i gydyweddu. Mae fel hud a lledrith!
postVerify-sub-description = (Psst… Mae hefyd yn golygu y gallwch gael eich holl nodau tudalen, cyfrineiriau, a data { -brand-firefox } ym mhobman rydych wedi mewngofnodi iddo.)
postVerify-subject-4 = Croeso i { -brand-mozilla }!
postVerify-setup-2 = Cysylltwch ddyfais arall:
postVerify-action-2 = Cysylltwch ddyfais arall
postVerifySecondary-subject = Ychwanegwyd ail e-bost
postVerifySecondary-title = Ychwanegwyd ail e-bost
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Rydych wedi llwyddo i gadarnhau { $secondaryEmail } fel ail e-bost ar gyfer eich cyfrif { -product-mozilla-account }. Bydd hysbysiadau diogelwch a chadarnhad mewngofnodi nawr yn cael eu hanfon i'r ddau gyfeiriad e-bost.
postVerifySecondary-action = Rheoli cyfrif
recovery-subject = Ailosod eich cyfrinair
recovery-title-2 = Wedi anghofio eich cyfrinair?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Cawsom gais am newid cyfrinair ar eich cyfrif { -product-mozilla-account } oddi wrth:
recovery-new-password-button = Crëwch gyfrinair newydd trwy glicio ar y botwm isod. Bydd y ddolen hon yn dod i ben o fewn yr awr nesaf.
recovery-copy-paste = Crëwch gyfrinair newydd trwy gopïo a gludo'r URL isod i'ch porwr. Bydd y ddolen hon yn dod i ben o fewn yr awr nesaf.
recovery-action = Creu cyfrinair newydd
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Mae eich tanysgrifiad i { $productName } wedi'i ddiddymu
subscriptionAccountDeletion-title = Mae’n ddrwg gennym eich gweld chi‘n gadael
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Rydych wedi dileu eich cyfrif { -product-mozilla-account } yn ddiweddar. O ganlyniad, rydym wedi diddymu eich tanysgrifiad { $productName }. Talwyd eich taliad olaf o { $invoiceTotal } ar { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Croeso i { $productName }: Cyflwynwch eich cyfrinair.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Croeso i { $productName }.
subscriptionAccountFinishSetup-content-processing = Mae'ch taliad yn cael ei brosesu a gall gymryd hyd at bedwar diwrnod gwaith i'w gwblhau. Bydd eich tanysgrifiad yn adnewyddu'n awtomatig bob cyfnod bilio oni bai eich bod yn dewis ei orffen.
subscriptionAccountFinishSetup-content-create-3 = Nesaf, byddwch yn creu cyfrinair cyfrif { -product-mozilla-account } i ddechrau defnyddio'ch tanysgrifiad newydd.
subscriptionAccountFinishSetup-action-2 = Cychwyn arni
subscriptionAccountReminderFirst-subject = Nodyn atgoffa: Gorffennwch greu eich cyfrif
subscriptionAccountReminderFirst-title = Nid oes modd i chi gael mynediad i'ch tanysgrifiad eto
subscriptionAccountReminderFirst-content-info-3 = Ychydig ddyddiau yn ôl fe wnaethoch chi greu { -product-mozilla-account } ond heb ei gadarnhau. Rydym yn gobeithio y byddwch yn gorffen cwblhau'ch cyfrif, fel y gallwch ddefnyddio'ch tanysgrifiad newydd.
subscriptionAccountReminderFirst-content-select-2 = Dewiswch “Creu Cyfrinair” i osod cyfrinair newydd a gorffen cadarnhau eich cyfrif.
subscriptionAccountReminderFirst-action = Crëwch Gyfrinair
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Nodyn atgoffa terfynol: Crëwch eich cyfrif
subscriptionAccountReminderSecond-title-2 = Croeso i { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Ychydig ddyddiau yn ôl fe wnaethoch chi greu cyfrif { -product-mozilla-account } ond heb ei gadarnhau. Rydym yn gobeithio y byddwch yn gorffen cwblhau'ch cyfrif, fel y gallwch ddefnyddio'ch tanysgrifiad newydd.
subscriptionAccountReminderSecond-content-select-2 = Dewiswch “Creu Cyfrinair” i osod cyfrinair newydd a gorffen cadarnhau eich cyfrif.
subscriptionAccountReminderSecond-action = Crëwch Gyfrinair
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Mae eich tanysgrifiad i { $productName } wedi'i ddiddymu
subscriptionCancellation-title = Mae’n ddrwg gennym eich gweld chi‘n gadael

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Rydym wedi diddymu eich tanysgrifiad { $productName }. Talwyd eich taliad olaf o { $invoiceTotal } ar { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Rydym wedi diddymu eich tanysgrifiad { $productName }. Talwyd eich taliad olaf o { $invoiceTotal } ar { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Bydd eich gwasanaeth yn parhau tan ddiwedd eich cyfnod bilio cyfredol, sef { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Rydych wedi newid i { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Rydych wedi symud o { $productNameOld } i { $productName } yn llwyddiannus.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = O'ch bil nesaf ymlaen, bydd eich taliad yn newid o { $paymentAmountOld } y { $productPaymentCycleOld } i { $paymentAmountNew } bob { $productPaymentCycleNew }. Bryd hynny, byddwch hefyd yn derbyn credyd am unwaith o { $paymentProrated } i adlewyrchu'r tâl is am weddill y { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Os oes yna feddalwedd newydd i chi ei osod er mwyn defnyddio { $productName }, byddwch yn derbyn e-bost ar wahân gyda chyfarwyddiadau llwytho i lawr.
subscriptionDowngrade-content-auto-renew = Bydd eich tanysgrifiad yn adnewyddu pob cyfnod bilio yn awtomatig oni bai eich bod yn dewis diddymu.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Mae eich tanysgrifiad i { $productName } wedi'i ddiddymu
subscriptionFailedPaymentsCancellation-title = Mae eich tanysgrifiad wedi'i ddiddymu
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Rydym wedi diddymu eich tanysgrifiad { $productName } oherwydd bod sawl ymgais talu wedi methu. I gael mynediad eto, dechreuwch danysgrifiad newydd gyda dull talu wedi'i ddiweddaru.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Cadarnhawyd y taliad am { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Diolch am danysgrifio i { $productName }
subscriptionFirstInvoice-content-processing = Mae'ch taliad yn cael ei brosesu ar hyn o bryd a gall gymryd hyd at bedwar diwrnod busnes i'w gwblhau.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Byddwch yn derbyn e-bost ar wahân ar sut i ddechrau defnyddio { $productName } .
subscriptionFirstInvoice-content-auto-renew = Bydd eich tanysgrifiad yn adnewyddu pob cyfnod bilio yn awtomatig oni bai eich bod yn dewis diddymu.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Bydd eich anfoneb nesaf yn cael ei chyhoeddi ar { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Mae'r dull talu ar gyfer { $productName } wedi dod i ben neu'n dod i ben yn fuan
subscriptionPaymentExpired-title-2 = Mae eich dull talu wedi dod i ben neu ar fin dod i ben
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Mae'r dull talu rydych chi'n ei ddefnyddio ar gyfer { $productName } wedi dod i ben neu ar fin dod i ben.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Methodd y taliad am { $productName }
subscriptionPaymentFailed-title = Ymddiheuruadau, rydym yn cael trafferth gyda'ch taliad
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Rydym wedi cael anhawster gyda'ch taliad diweddaraf am { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Mae’n bosibl bod eich dull talu wedi dod i ben, neu fod eich dull talu presennol wedi dyddio.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Mae angen diweddaru'r manylion talu ar gyfer { $productName }
subscriptionPaymentProviderCancelled-title = Ymddiheuruadau, rydym yn cael trafferth gyda'ch dull o dalu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Rydym wedi canfod anhawster gyda'ch dull o dalu am { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Mae’n bosibl bod eich dull talu wedi dod i ben, neu fod eich dull talu presennol wedi dyddio.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Ail-gychwynnwyd tanysgrifiad { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Diolch am ail gychwyn eich tanysgrifiad { $productName }s
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Bydd eich cylch bilio a'ch taliad yn aros yr un peth. Eich tâl nesaf fydd { $invoiceTotal } ar { $nextInvoiceDateOnly }. Bydd eich tanysgrifiad yn cael ei adnewyddu pob cyfnod bilio yn awtomatig oni bai eich bod yn dewis ei ddiddymu.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Hysbysiad adnewyddu awtomatig { $productName }
subscriptionRenewalReminder-title = Bydd eich tanysgrifiad yn cael ei adnewyddu'n fuan
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Annwyl gwsmer { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Mae disgwyl i'ch tanysgrifiad cyfredol adnewyddu'n awtomatig ymhen { $reminderLength }s diwrnod. Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad { $planIntervalCount } { $planInterval } a chodir tâl o { $invoiceTotal } ar y dull talu ar eich cyfrif.
subscriptionRenewalReminder-content-closing = Yn gywir,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Tîm { $productName }
subscriptionReplaced-subject = Mae'ch tanysgrifiad wedi'i ddiweddaru fel rhan o'ch uwchraddio
subscriptionReplaced-title = Mae eich tanysgrifiad wedi'i ddiweddaru
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Mae eich tanysgrifiad { $productName } unigol wedi'i ddisodli ac mae bellach wedi'i gynnwys yn eich bwndel newydd.
subscriptionReplaced-content-credit = Byddwch yn derbyn credyd am unrhyw amser na chafodd eich tanysgrifiad blaenorol wedi'i ddefnyddio. Bydd y credyd hwn yn cael ei osod yn awtomatig yn eich cyfrif a'i ddefnyddio tuag at daliadau yn y dyfodol.
subscriptionReplaced-content-no-action = Does dim angen gweithredu ar eich rhan chi.
subscriptionsPaymentExpired-subject-2 = Mae'r dull talu ar gyfer eich tanysgrifiadau yn dod i ben neu'n dod i ben yn fuan
subscriptionsPaymentExpired-title-2 = Mae eich dull talu wedi dod i ben neu ar fin dod i ben
subscriptionsPaymentExpired-content-2 = Mae'r dull talu rydych chi'n ei ddefnyddio i wneud taliadau am y tanysgrifiadau canlynol wedi dod i ben neu ar fin dod i ben.
subscriptionsPaymentProviderCancelled-subject = Mae angen diweddaru'r manylion talu am danysgrifiadau { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Ymddiheuruadau, rydym yn cael trafferth gyda'ch dull o dalu
subscriptionsPaymentProviderCancelled-content-detected = Rydym wedi canfod anhawster gyda'ch dull o dalu am y tanysgrifiadau canlynol.
subscriptionsPaymentProviderCancelled-content-payment-1 = Mae’n bosibl bod eich dull talu wedi dod i ben, neu fod eich dull talu presennol wedi dyddio.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Derbyniwyd taliad am { $productName }
subscriptionSubsequentInvoice-title = Diolch am fod yn danysgrifiwr!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Rydym wedi derbyn eich taliad diweddaraf am { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Bydd eich anfoneb nesaf yn cael ei chyhoeddi ar { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Rydych wedi uwchraddio i { $productName }
subscriptionUpgrade-title = Diolch am uwchraddio!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Rydych wedi uwchraddio i { $productName } yn llwyddiannus.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Codwyd ffi un-tro o { $invoiceAmountDue } arnoch i adlewyrchu pris uwch eich tanysgrifiad am weddill y cyfnod bilio hwn ( { $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Rydych wedi derbyn credyd cyfrif yn y swm o { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Gan ddechrau gyda'ch bil nesaf, bydd pris eich tanysgrifiad yn newid.
subscriptionUpgrade-content-old-price-day = Y gyfradd flaenorol oedd { $paymentAmountOld } y dydd.
subscriptionUpgrade-content-old-price-week = Y gyfradd flaenorol oedd { $paymentAmountOld } yr wythnos.
subscriptionUpgrade-content-old-price-month = Y gyfradd flaenorol oedd { $paymentAmountOld } y mis.
subscriptionUpgrade-content-old-price-halfyear = Y gyfradd flaenorol oedd { $paymentAmountOld } pob chwe mis.
subscriptionUpgrade-content-old-price-year = Y gyfradd flaenorol oedd { $paymentAmountOld } y flwyddyn.
subscriptionUpgrade-content-old-price-default = Y gyfradd flaenorol oedd { $paymentAmountOld } fesul cyfnod bilio.
subscriptionUpgrade-content-old-price-day-tax = Y gyfradd flaenorol oedd { $paymentAmountOld } + { $paymentTaxOld } treth y dydd.
subscriptionUpgrade-content-old-price-week-tax = Y gyfradd flaenorol oedd { $paymentAmountOld } + { $paymentTaxOld } treth yr wythnos.
subscriptionUpgrade-content-old-price-month-tax = Y gyfradd flaenorol oedd { $paymentAmountOld } + { $paymentTaxOld } treth y mis.
subscriptionUpgrade-content-old-price-halfyear-tax = Y gyfradd flaenorol oedd { $paymentAmountOld } + { $paymentTaxOld } treth pob chwe mis.
subscriptionUpgrade-content-old-price-year-tax = Y gyfradd flaenorol oedd { $paymentAmountOld } + { $paymentTaxOld } treth pob blwyddyn.
subscriptionUpgrade-content-old-price-default-tax = Y gyfradd flaenorol oedd { $paymentAmountOld } + { $paymentTaxOld } treth fesul cyfnod bilio.
subscriptionUpgrade-content-new-price-day = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } y dydd arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-week = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } yr wythnos arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-month = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } y mis arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-halfyear = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } arnoch bob chwe mis, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-year = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } y flwyddyn arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-default = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } arnoch fesul cyfnod bilio, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-day-dtax = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } + { $paymentTaxNew } treth y dydd arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-week-tax = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } + { $paymentTaxNew } treth yr wythnos arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-month-tax = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } + { $paymentTaxNew } treth y mis arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-halfyear-tax = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } + { $paymentTaxNew } treth arnoch bob chwe mis, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-year-tax = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } + { $paymentTaxNew } treth y flwyddyn arnoch, heb gynnwys gostyngiadau.
subscriptionUpgrade-content-new-price-default-tax = Yn y dyfodol, byddwn yn codi { $paymentAmountNew } + { $paymentTaxNew } treth arnoch fesul cyfnod bilio, heb gynnwys gostyngiadau.
subscriptionUpgrade-existing = Os bydd unrhyw un o'ch tanysgrifiadau presennol yn gorgyffwrdd â'r uwchraddio hwn, byddwn yn eu trin ac yn anfon e-bost ar wahân atoch gyda'r manylion. Os yw eich cynllun newydd yn cynnwys cynnyrch sydd angen eu gosod, byddwn yn anfon e-bost ar wahân atoch gyda chyfarwyddiadau gosod.
subscriptionUpgrade-auto-renew = Bydd eich tanysgrifiad yn adnewyddu pob cyfnod bilio yn awtomatig oni bai eich bod yn dewis diddymu.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Defnyddiwch { $unblockCode } i fewngofnodi
unblockCode-preview = Daw'r cod hwn i ben o fewn awr
unblockCode-title = Ai hwn yw chi’n allgofnodi?
unblockCode-prompt = Os ie, dyma’r cod awdurdodi sydd ei angen arnoch:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Os ie, dyma'r cod awdurdodi sydd ei angen arnoch: { $unblockCode }
unblockCode-report = Os nad, cynorthwywch ni i gadw ymyrwyr draw ac <a data-l10n-name="reportSignInLink">adrodd arno i ni.</a>
unblockCode-report-plaintext = Os nad, cynorthwywch ni i gadw ymyrwyr draw ac adrodd arno i ni.
verificationReminderFinal-subject = Atgoffwr terfynol i gadarnhau eich cyfrif
verificationReminderFinal-description-2 = Ychydig wythnosau yn ôl fe wnaethoch chi greu cyfrif { -product-mozilla-account }, ond heb ei gadarnhau. Er eich diogelwch, byddwn yn dileu'r cyfrif os na fydd yn cael ei ddilysu yn ystod y 24 awr nesaf.
confirm-account = Cadarnhewch eich cyfrif
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Cofiwch gadarnhau eich cyfrif
verificationReminderFirst-title-3 = Croeso i { -brand-mozilla }!
verificationReminderFirst-description-3 = Ychydig ddyddiau yn ôl fe wnaethoch chi greu { -product-mozilla-account }, ond heb ei gadarnhau. Cadarnhewch eich cyfrif o fewn y 15 diwrnod nesaf neu bydd yn cael ei ddileu'n awtomatig.
verificationReminderFirst-sub-description-3 = Peidiwch â cholli allan ar y porwr sy'n eich rhoi chi a'ch preifatrwydd yn gyntaf.
confirm-email-2 = Cadarnhewch eich cyfrif
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Cadarnhewch eich cyfrif
verificationReminderSecond-subject-2 = Cofiwch gadarnhau eich cyfrif
verificationReminderSecond-title-3 = Peidiwch â cholli allan ar { -brand-mozilla }!
verificationReminderSecond-description-4 = Ychydig ddyddiau yn ôl fe wnaethoch chi greu cyfrif { -product-mozilla-account }, ond heb ei gadarnhau. Cadarnhewch eich cyfrif o fewn y 10 diwrnod nesaf neu bydd yn cael ei ddileu yn awtomatig.
verificationReminderSecond-second-description-3 = Mae eich cyfrif { -product-mozilla-account } yn caniatáu i chi gydweddu eich profiad { -brand-firefox } ar draws dyfeisiau ac yn datgloi mynediad i ragor o gynnyrch sy'n diogelu eich preifatrwydd gan { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Byddwch yn rhan o’n cenhadaeth i drawsnewid y rhyngrwyd yn lle sy’n agored i bawb.
verificationReminderSecond-action-2 = Cadarnhewch eich cyfrif
verify-title-3 = Agorwch y rhyngrwyd gyda { -brand-mozilla }
verify-description-2 = Cadarnhewch eich cyfrif a chael y gorau o { -brand-mozilla } ym mhob man rydych yn mewngofnodi gan ddechrau gyda:
verify-subject = Gorffen creu eich cyfrif
verify-action-2 = Cadarnhewch eich cyfrif
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Defnyddiwch { $code } i newid eich cyfrif
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Daw'r cod hwn i ben ymhen { $expirationTime } munudau.
        [zero] Daw'r cod hwn i ben ymhen { $expirationTime } munud.
        [two] Daw'r cod hwn i ben ymhen { $expirationTime } funud
        [few] Daw'r cod hwn i ben ymhen { $expirationTime } munud
        [many] Daw'r cod hwn i ben ymhen { $expirationTime } munud
       *[other] Daw'r cod hwn i ben ymhen { $expirationTime } munud
    }
verifyAccountChange-title = Ydych chi'n newid manylion eich cyfrif?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Helpwch ni i gadw'ch cyfrif yn ddiogel trwy gymeradwyo'r newid hwn ar:
verifyAccountChange-prompt = Os ydych, dyma eich cod awdurdodi:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Daw i ben ymhen { $expirationTime } munud.
        [zero] Daw i ben ymhen { $expirationTime } munud.
        [two] Daw i ben ymhen { $expirationTime } funud.
        [few] Daw i ben ymhen { $expirationTime } munud.
        [many] Daw i ben ymhen { $expirationTime } munud.
       *[other] Daw i ben ymhen { $expirationTime } munud.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = A wnaethoch chi fewngofnodi i { $clientName }?
verifyLogin-description-2 = Helpwch ni i gadw'ch cyfrif yn ddiogel drwy gadarnhau eich bod wedi mewngofnodi ar:
verifyLogin-subject-2 = Cadarnhewch eich mewngofnodi
verifyLogin-action = Cadarnhau eich mewngofnodi
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Defnyddiwch { $code } i fewngofnodi
verifyLoginCode-preview = Mae'r cod hwn yn dod i ben o fewn 5 munud.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = A wnaethoch chi fewngofnodi i { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Helpwch ni i gadw'ch cyfrif yn ddiogel trwy gymeradwyo eich mewngofnodi:
verifyLoginCode-prompt-3 = Os ydych, dyma eich cod awdurdodi:
verifyLoginCode-expiry-notice = Daw i ben mewn 5 munud.
verifyPrimary-title-2 = Cadarnhau'r prif e-bost
verifyPrimary-description = Mae cais wedi ei wneud o’r ddyfais ganlynol i newid cyfrif:
verifyPrimary-subject = Cadarnhau’r prif e-bost
verifyPrimary-action-2 = Cadarnhau'r e-bost
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Unwaith y bydd wedi ei gadarnhau, bydd newid cyfrif fel ychwanegu ail e-bost yn bosib o'r ddyfais hon.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Defnyddiwch { $code } i gadarnhau eich ail e-bost
verifySecondaryCode-preview = Mae'r cod hwn yn dod i ben o fewn 5 munud.
verifySecondaryCode-title-2 = Cadarnhau'r ail e-bost
verifySecondaryCode-action-2 = Cadarnhau'r e-bost
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Mae cais i ddefnyddio { $email } fel cyfeiriad ail e-bost wedi'i wneud o'r cyfrif { -product-mozilla-account } canlynol:
verifySecondaryCode-prompt-2 = Defnyddiwch y cod cadarnhau yma:
verifySecondaryCode-expiry-notice-2 = Daw i ben ymhen 5 munud. Ar ôl ei gadarnhau, bydd y cyfeiriad hwn yn dechrau derbyn hysbysiadau a chadarnhad diogelwch.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Defnyddiwch { $code } i gadarnhau eich cyfrif
verifyShortCode-preview-2 = Mae'r cod hwn yn dod i ben o fewn 5 munud
verifyShortCode-title-3 = Agorwch y rhyngrwyd gyda { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Cadarnhewch eich cyfrif a chael y gorau o { -brand-mozilla } ym mhob man rydych yn mewngofnodi gan ddechrau gyda:
verifyShortCode-prompt-3 = Defnyddiwch y cod cadarnhau yma:
verifyShortCode-expiry-notice = Daw i ben mewn 5 munud.
