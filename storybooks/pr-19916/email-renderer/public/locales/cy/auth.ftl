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
cancellationSurvey = Helpwch ni i wella ein gwasanaethau trwy lanw'r <a data-l10n-name="cancellationSurveyUrl">arolwg byr</a> hwn.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Helpwch ni i wella ein gwasanaethau trwy lanw’r arolwg byr hwn:
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
view-invoice-link-action = Gweld anfoneb
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Gweld yr Anfoneb: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Mae eich tanysgrifiad i { $productName } wedi'i ddiddymu
subscriptionAccountDeletion-title = Mae’n ddrwg gennym eich gweld chi‘n gadael
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Rydych wedi dileu eich cyfrif { -product-mozilla-account } yn ddiweddar. O ganlyniad, rydym wedi diddymu eich tanysgrifiad { $productName }. Talwyd eich taliad olaf o { $invoiceTotal } ar { $invoiceDateOnly }.
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
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Bydd eich tanysgrifiad o { $productName } yn dod i ben cyn bo hir
subscriptionEndingReminder-title = Bydd eich tanysgrifiad o { $productName } yn dod i ben cyn bo hir
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Bydd eich mynediad i { $productName } yn gorffen ar <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Os hoffech chi barhau i ddefnyddio { $productName } , gallwch ail-greu eich tanysgrifiad yn eich <a data-l10n-name="subscriptionEndingReminder-account-settings">Gosodiadau Cyfrif</a> cyn <strong>{ $serviceLastActiveDateOnly }</strong>. Os oes angen cymorth arnoch, <a data-l10n-name="subscriptionEndingReminder-contact-support">cysylltwch â'n Tîm Cymorth</a>.
subscriptionEndingReminder-content-line1-plaintext = Bydd eich mynediad i { $productName } yn gorffen ar { $serviceLastActiveDateOnly } .
subscriptionEndingReminder-content-line2-plaintext = Os hoffech barhau i ddefnyddio { $productName }, gallwch ail-greu eich tanysgrifiad yng Ngosodiadau eich Cyfrif cyn { $serviceLastActiveDateOnly }. Os oes angen cymorth arnoch, cysylltwch â'n Tîm Cymorth.
subscriptionEndingReminder-content-closing = Diolch am fod yn danysgrifiwr gwerthfawr!
subscriptionEndingReminder-churn-title = Eisiau cadw mynediad?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Mae telerau a chyfyngiadau cyfyngedig yn berthnasol</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Mae telerau a chyfyngiadau cyfyngedig yn berthnasol: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Cysylltwch â'n Tîm Cymorth: { $subscriptionSupportUrlWithUtm }
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
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Bydd eich tanysgrifiad presennol yn cael ei adnewyddu'n awtomatig ymhen { $reminderLength } diwrnod.
subscriptionRenewalReminder-content-discount-change = Mae eich anfoneb nesaf yn adlewyrchu newid mewn prisiau, gan fod gostyngiad blaenorol wedi dod i ben a gostyngiad newydd wedi'i osod.
subscriptionRenewalReminder-content-discount-ending = Oherwydd bod gostyngiad blaenorol wedi dod i ben, bydd eich tanysgrifiad yn adnewyddu am y pris safonol.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad dyddiol a chodi tâl o { $invoiceTotalExcludingTax } + { $invoiceTax } o dreth ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-with-tax-week = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad wythnosol a bydd tâl o { $invoiceTotalExcludingTax } + { $invoiceTax } o dreth yn cael ei osod i ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-with-tax-month = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad misol a bydd tâl o { $invoiceTotalExcludingTax } + { $invoiceTax } o dreth yn cael ei osod i ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad chwe mis a chodi tâl o { $invoiceTotalExcludingTax } + { $invoiceTax } o dreth ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-with-tax-year = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad blynyddol a chodi tâl o { $invoiceTotalExcludingTax } + { $invoiceTax } o dreth ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-with-tax-default = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad a chodi tâl o { $invoiceTotalExcludingTax } + { $invoiceTax } o dreth ar ddull talu eich cyfrif.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad dyddiol a bydd tâl o { $invoiceTotal } yn cael ei godi ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-invoice-total-week = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad wythnosol a bydd tâl o { $invoiceTotal } yn cael ei godi ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-invoice-total-month = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad misol a bydd tâl o { $invoiceTotal } yn cael ei godi ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad chwe mis a bydd tâl o { $invoiceTotal } yn cael ei godi ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-invoice-total-year = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad blynyddol a bydd tâl o { $invoiceTotal } yn cael ei godi ar ddull talu eich cyfrif.
subscriptionRenewalReminder-content-charge-invoice-total-default = Bryd hynny, bydd { -brand-mozilla } yn adnewyddu eich tanysgrifiad a bydd tâl o { $invoiceTotal } yn cael ei godi ar ddull talu eich cyfrif.
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
subscriptionsPaymentExpired-subject-2 = Mae'r dull talu ar gyfer eich tanysgrifiadau yn dod i ben neu'n dod i ben yn fuan
subscriptionsPaymentExpired-title-2 = Mae eich dull talu wedi dod i ben neu ar fin dod i ben
subscriptionsPaymentExpired-content-2 = Mae'r dull talu rydych chi'n ei ddefnyddio i wneud taliadau am y tanysgrifiadau canlynol wedi dod i ben neu ar fin dod i ben.
subscriptionsPaymentProviderCancelled-subject = Mae angen diweddaru'r manylion talu am danysgrifiadau { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Ymddiheuruadau, rydym yn cael trafferth gyda'ch dull o dalu
subscriptionsPaymentProviderCancelled-content-detected = Rydym wedi canfod anhawster gyda'ch dull o dalu am y tanysgrifiadau canlynol.
subscriptionsPaymentProviderCancelled-content-payment-1 = Mae’n bosibl bod eich dull talu wedi dod i ben, neu fod eich dull talu presennol wedi dyddio.
