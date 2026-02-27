## Non-email strings

session-verify-send-push-title-2 = Skrá þig inn á { -product-mozilla-account }?
session-verify-send-push-body-2 = Smelltu hér til að staðfesta að þetta sért þú
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } er { -brand-mozilla } staðfestingarkóðinn þinn. Hann rennur út eftir 5 mínútur.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } staðfestingarkóði: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } er { -brand-mozilla } endurheimtukóðinn þinn. Hann rennur út eftir 5 mínútur.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kóði: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } er { -brand-mozilla } endurheimtukóðinn þinn. Hann rennur út eftir 5 mínútur.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kóði: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } táknmerki">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } táknmerki">
subplat-automated-email = Þetta er sjálfvirkur tölvupóstur; ef þú fékkst hann óvart sendan, þarftu ekkert að gera.
subplat-privacy-notice = Meðferð persónuupplýsinga
subplat-privacy-plaintext = Meðferð persónuupplýsinga:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Þú færð þennan tölvupóst vegna þess að { $email } er með { -product-mozilla-account } og þú hefur skráð þig á { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Þú færð þennan tölvupóst vegna þess að { $email } er með { -product-mozilla-account }.
subplat-explainer-multiple-2 = Þú færð þennan tölvupóst vegna þess að { $email } er með { -product-mozilla-account } og þú ert áskrifandi að ýmsum þjónustum.
subplat-explainer-was-deleted-2 = Þú færð þennan tölvupóst vegna þess að { $email } var skráð fyrir { -product-mozilla-account }.
subplat-manage-account-2 = Sýslaðu með stillingar { -product-mozilla-account } með því að fara á <a data-l10n-name="subplat-account-page">reikningssíðuna þína</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Stjórnaðu stillingum { -product-mozilla-account } með því að fara á reikningssíðuna þína: { $accountSettingsUrl }
subplat-terms-policy = Skilmálar og afbókunarreglur
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Hætta áskrift
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Endurvirkja áskrift
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Uppfæra greiðsluupplýsingar
subplat-privacy-policy = Persónuverndarstefna { -brand-mozilla }
subplat-privacy-policy-2 = Persónuverndarstefna { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Þjónustuskilmálar { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Lögfræðilegt efni
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Friðhelgi
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Hjálpaðu okkur við að bæta þjónustuna með því að taka þátt í <a data-l10n-name="cancellationSurveyUrl">stuttri könnun</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjálpaðu okkur við að bæta þjónustuna með því að taka þátt í stuttri könnun:
payment-details = Nánar um greiðslu:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Reikningur númer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Innheimt: { $invoiceTotal } þann { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Næsti reikningur: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Greiðslumáti:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Greiðslumáti: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Greiðslumáti: { $cardName } kort sem endar á { $lastFour }
payment-provider-card-ending-in-plaintext = Greiðslumáti: Kort sem endar á { $lastFour }
payment-provider-card-ending-in = <b>Greiðslumáti:</b> Kort sem endar á { $lastFour }
payment-provider-card-ending-in-card-name = <b>Greiðslumáti:</b> { $cardName } kort sem endar á { $lastFour }

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Samtala: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-discount = Afsláttur
subscription-charges-discount-plaintext = Afsláttur: { $invoiceDiscountAmount }
subscription-charges-taxes = Skattar og gjöld
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Skattar og gjöld: { $invoiceTaxAmount }
subscription-charges-total = <b>Samtals</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Samtals: { $invoiceTotal }
subscription-charges-amount-paid = <b>Greidd upphæð</b>

##

subscriptionSupport = Spurningar varðandi áskriftina þína? <a data-l10n-name="subscriptionSupportUrl">Aðstoðarteymið</a> okkar er hér til að hjálpa þér.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Spurningar um áskriftina þína? Þjónustuteymi okkar er hér til að hjálpa þér:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Þakka þér fyrir að gerast áskrifandi að { $productName }. Ef þú hefur einhverjar spurningar um áskriftina þína eða þarft frekari upplýsingar um { $productName } geturðu <a data-l10n-name="subscriptionSupportUrl">haft samband við okkur</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Þakka þér fyrir að gerast áskrifandi að { $productName }. Ef þú hefur einhverjar spurningar um áskriftina þína eða þarft frekari upplýsingar um { $productName } geturðu haft samband við okkur:
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Hafa samband við aðstoðarteymið:
subscriptionUpdateBillingEnsure = Þú getur tryggt að greiðslumáti og reikningsupplýsingar þínar séu uppfærðar <a data-l10n-name="updateBillingUrl">hér</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Þú getur tryggt að greiðslumáti og reikningsupplýsingar þínar séu uppfærðar hér:
subscriptionUpdateBillingTry = Við reynum aftur að fá greiðsluna þína í gegn á næstu dögum, en þú gætir þurft að hjálpa okkur við að lagfæra þetta með því að <a data-l10n-name="updateBillingUrl">uppfæra greiðsluupplýsingarnar þínar</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Við reynum aftur að fá greiðsluna þína í gegn á næstu dögum, en þú gætir þurft að hjálpa okkur við að lagfæra þetta með því að uppfæra greiðsluupplýsingarnar þínar:
subscriptionUpdatePayment = Til að koma í veg fyrir truflanir á þjónustunni þinni skaltu <a data-l10n-name="updateBillingUrl">uppfæra greiðsluupplýsingarnar þínar</a> eins fljótt og auðið er.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Til að koma í veg fyrir truflanir á þjónustunni þinni skaltu uppfæra greiðsluupplýsingarnar þínar eins fljótt og auðið er:
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Skoða reikning: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Velkomin í { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Velkomin í { $productName }
downloadSubscription-content-2 = Við skulum byrja á að nota alla eiginleikana sem fylgja áskriftinni þinni:
downloadSubscription-link-action-2 = Komast í gang
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } þínum var eytt
fraudulentAccountDeletion-title = Reikningnum þínum var eytt
fraudulentAccountDeletion-content-part1-v2 = Nýlega var stofnaður { -product-mozilla-account } og áskrift sett í innheimtu með þessu póstfangi. Eins og við gerum með alla nýja reikninga, báðum við þig um að staðfesta reikninginn þinn með því að staðfesta þetta tölvupóstfang fyrst.
fraudulentAccountDeletion-content-part2-v2 = Sem stendur sjáum við að reikningurinn hefur aldrei verið staðfestur. Þar sem ekki var lokið við þetta skref, getum við ekki verið viss um hvort þetta hafi verið heimil áskrift. Þess vegna var { -product-mozilla-account } sem skráður var á þetta póstfang eytt og áskriftinni sagt upp auk þess að allar kröfur hafa verið endurgreiddar.
fraudulentAccountDeletion-contact = Ef þú ert með einhverjar spurningar skaltu hafa samband við <a data-l10n-name="mozillaSupportUrl">aðstoðarteymið okkar</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ef þú ert með einhverjar spurningar skaltu hafa samband við aðstoðarteymið okkar: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Áskriftinni þinni að { $productName } hefur verið hætt
subscriptionAccountDeletion-title = Okkur þykir miður að þú sért á förum
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Þú eyddir { -product-mozilla-account }-reikningnum þínum nýlega. Fyrir vikið höfum við sagt upp { $productName } áskriftinni þinni. Lokagreiðsla þín upp á { $invoiceTotal } var greidd þann { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Áminning: Ljúktu við að setja upp reikninginn þinn
subscriptionAccountReminderFirst-title = Þú hefur ekki ennþá aðgang að áskriftinni þinni
subscriptionAccountReminderFirst-content-info-3 = Fyrir nokkrum dögum síðan bjóstu til { -product-mozilla-account } en staðfestir hann aldrei. Við vonum að þú ljúkir við að setja upp reikninginn þinn svo þú getir notað nýju áskriftina þína.
subscriptionAccountReminderFirst-content-select-2 = Veldu „Búa til lykilorð“ til að setja upp nýtt lykilorð og ljúka við að staðfesta reikninginn þinn.
subscriptionAccountReminderFirst-action = Búa til lykilorð
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Lokaáminning: Settu upp reikninginn þinn
subscriptionAccountReminderSecond-title-2 = Velkomin í { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Fyrir nokkrum dögum síðan bjóstu til { -product-mozilla-account } en staðfestir hann aldrei. Við vonum að þú ljúkir við að setja upp reikninginn þinn svo þú getir notað nýju áskriftina þína.
subscriptionAccountReminderSecond-content-select-2 = Veldu „Búa til lykilorð“ til að setja upp nýtt lykilorð og ljúka við að staðfesta reikninginn þinn.
subscriptionAccountReminderSecond-action = Búa til lykilorð
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Áskriftinni þinni að { $productName } hefur verið hætt
subscriptionCancellation-title = Okkur þykir miður að þú sért á förum

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Við höfum sagt upp { $productName } áskriftinni þinni. Lokagreiðsla þín að upphæð { $invoiceTotal } var greidd { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Við höfum sagt upp { $productName } áskriftinni þinni. Lokagreiðsla þín að upphæð { $invoiceTotal } verður til greiðslu { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Þjónustan þín verður áfram virk til loka núverandi greiðslutímabils, sem er { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Þú hefur skipt yfir í { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Þér hefur tekist að skipta úr { $productNameOld } yfir í { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Frá og með næsta reikningi þínum mun gjaldið þitt breytast úr { $paymentAmountOld } á { $productPaymentCycleOld } í { $paymentAmountNew } á { $productPaymentCycleNew }. Á þeim tímapunkti muntu einnig fá eins-skiptis inneign upp á { $paymentProrated } til að endurspegla lægra gjaldið fyrir það sem eftir er af { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Ef nauðsynlegt er að þú setjir upp nýjan hugbúnað til að geta notað { $productName }, munt þú fá sendan sérstakann tölvupóst með leiðbeiningum varðandi niðurhal.
subscriptionDowngrade-content-auto-renew = Áskriftin þín mun endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú ákveðir að hætta áskriftinni.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Áskriftinni þinni að { $productName } hefur verið hætt
subscriptionFailedPaymentsCancellation-title = Áskriftinni þinni hefur verið sagt upp
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Við höfum sagt upp { $productName } áskriftinni þinni vegna þess að margar tilraunir til greiðslu mistókust. Til að fá aðgang aftur skaltu fá þér nýja áskrift með uppfærðum greiðslumáta.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Greiðsla fyrir { $productName } staðfest
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Takk fyrir að gerast áskrifandi að { $productName }
subscriptionFirstInvoice-content-processing = Greiðslan þín er í vinnslu og getur tekið allt að fjóra virka daga að ganga frá henni.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Þú færð sérstakan tölvupóst um hvernig eigi að byrja að nota { $productName }.
subscriptionFirstInvoice-content-auto-renew = Áskriftin þín mun endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú ákveðir að hætta áskriftinni.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Greiðslumáti fyrir { $productName } er útrunnið eða rennur út fljótlega
subscriptionPaymentExpired-title-2 = Greiðslumátinn þinn er útrunninn eða er við það að renna út
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Greiðslumátinn sem þú notar til að greiða fyrir { $productName } er útrunnið eða er við það að renna út.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Greiðsla fyrir { $productName } mistókst
subscriptionPaymentFailed-title = Því miður, við eigum í vandræðum með greiðsluna þína
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Við höfum fundið vandamál varðandi síðustu greiðslu þína vegna { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Það kann að vera að greiðslumátinn þinn sé útrunninn eða að fyrirliggjandi greiðslumáti þinn sé úreltur.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Uppfærsla greiðsluupplýsinga er nauðsynleg fyrir { $productName }
subscriptionPaymentProviderCancelled-title = Því miður, við eigum í vandræðum með greiðslumátann þinn
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Við höfum fundið vandamál varðandi greiðslumátann þinn fyrir { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Það kann að vera að greiðslumátinn þinn sé útrunninn eða að fyrirliggjandi greiðslumáti þinn sé úreltur.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Áskrift að { $productName } hefur verið endurvirkjuð
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Takk fyrir að endurvirkja { $productName } áskriftina þína!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Greiðslutímabil þitt og reikningsupphæð verða óbreytt. Næsta gjaldfærsla þín verður { $invoiceTotal } þann { $nextInvoiceDateOnly }. Áskriftin þín endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú veljir að hætta áskriftinni.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Tilkynning um sjálfvirka endurnýjun { $productName }
subscriptionRenewalReminder-title = Áskriftin þín verður endurnýjuð fljótlega
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Ágæti viðskiptavinur { $productName },
subscriptionRenewalReminder-content-closing = Með bestu kveðjum,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName }-teymið
subscriptionReplaced-title = Áskriftin þín hefur verið uppfærð
subscriptionReplaced-content-no-action = Þú þarft ekki að gera neitt.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Greiðsla fyrir { $productName } móttekin
subscriptionSubsequentInvoice-title = Takk fyrir að vera áskrifandi!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Við fengum síðustu greiðslu þína vegna { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Þú hefur uppfært í { $productName }
subscriptionUpgrade-title = Takk fyrir að uppfæra!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Þú hefur uppfært í { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Áskriftin þín mun endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú ákveðir að hætta áskriftinni.
subscriptionsPaymentExpired-subject-2 = Greiðslumátinn fyrir áskriftirnar þínar er útrunninn eða rennur út bráðlega
subscriptionsPaymentExpired-title-2 = Greiðslumátinn þinn er útrunninn eða er við það að renna út
subscriptionsPaymentExpired-content-2 = Greiðslumátinn sem þú notar til að greiða fyrir eftirfarandi áskriftir er útrunninn eða er við það að renna út.
subscriptionsPaymentProviderCancelled-subject = Uppfærsla greiðsluupplýsinga er nauðsynleg fyrir { -brand-mozilla }-áskriftir
subscriptionsPaymentProviderCancelled-title = Því miður, við eigum í vandræðum með greiðslumátann þinn
subscriptionsPaymentProviderCancelled-content-detected = Við höfum fundið vandamál varðandi greiðslumátann þinn fyrir eftirfarandi áskriftir.
subscriptionsPaymentProviderCancelled-content-payment-1 = Það kann að vera að greiðslumátinn þinn sé útrunninn eða að fyrirliggjandi greiðslumáti þinn sé úreltur.
