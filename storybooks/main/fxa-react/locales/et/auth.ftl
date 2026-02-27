## Non-email strings

subplat-automated-email = See e-kiri on saadetud automaatselt. Kui sa ei tellinud seda, siis ei ole sul vaja midagi teha.
subplat-privacy-notice = Privaatsusreeglid
subplat-privacy-plaintext = Privaatsusreeglid:
subplat-update-billing-plaintext = { subplat-update-billing }:
subplat-terms-policy = Teenus- ja tühistamistingimused
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Tühista tellimus
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Aktiveeri tellimus uuesti
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Värskenda arveldusinfot
subplat-privacy-policy = { -brand-mozilla } privaatsuspoliitika
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } privaatsusteatis
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } kasutustingimused
subplat-legal = Õiguslik teave
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privaatsusest
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Palun aita meil teenust paremaks teha, osaledes selles <a data-l10n-name="cancellationSurveyUrl">lühiküsitluses</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Palun aita meil teenust paremaks teha, osaledes järgnevas lühiküsitluses:
payment-details = Makse andmed:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Arve number: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Tasu: { $invoiceTotal } kuupäeval { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Järgmine arve: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Vahesumma: { $invoiceSubtotal }

##

subscriptionSupport = Kas sul on tellimuse kohta küsimusi? Meie <a data-l10n-name="subscriptionSupportUrl">tugitiim</a> on siin ja valmis aitama.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Kas sul on tellimuse kohta küsimusi? Meie tugitiim asub järgneval aadressil ja on valmis aitama:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Täname, et tellisid teenuse { $productName }. Kui sul on küsimusi oma tellimuse kohta või vajad rohkem teavet teenuse { $productName } kohta, siis palun <a data-l10n-name="subscriptionSupportUrl">võta meiega ühendust</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Täname, et tellisid teenuse { $productName }. Kui sul on küsimusi tellimuse kohta või vajad rohkem teavet teenuse { $productName } kohta, siis palun võta meiega ühendust:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Siin</a> saad tagada, et sinu makseviis ja kontoteave on ajakohased.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = järgneval aadressil saad tagada, et sinu makseviis ja kontoteave on ajakohased:
subscriptionUpdateBillingTry = Proovime sinu makset järgmiste päevade jooksul uuesti teostada, kuid pead võib-olla aitama meil seda probleemi lahendada <a data-l10n-name="updateBillingUrl">oma makseteabe värskendamisega</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Proovime sinu makset järgmiste päevade jooksul uuesti teostada, kuid pead võib-olla aitama meil seda probleemi lahendada oma makseteabe värskendamisega:
subscriptionUpdatePayment = Teenuste katkestuste vältimiseks <a data-l10n-name="updateBillingUrl">värskenda palun oma makseteavet</a> niipea kui võimalik.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Teenuste katkestuste vältimiseks värskenda oma palun oma makseteavet niipea kui võimalik:
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Vaata arvet: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Tere tulemast kasutama teenust { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Tere tulemast kasutama teenust { $productName }
downloadSubscription-content-2 = Alustame kõigi sinu tellimusega kaasnevate funktsionaalsuste kasutamisega:
downloadSubscription-link-action-2 = Tee algust
fraudulentAccountDeletion-title = Sinu konto kustutati
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Teenuse { $productName } tellimus on tühistatud
subscriptionAccountDeletion-title = Kahju, et lahkud
subscriptionAccountReminderFirst-subject = Meeldetuletus: vii oma konto seadistamine lõpule
subscriptionAccountReminderFirst-title = Sa ei saa veel oma teenust kasutada
subscriptionAccountReminderFirst-action = Määra parool
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Viimane meeldetuletus: seadista oma konto
subscriptionAccountReminderSecond-action = Määra parool
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Teenuse { $productName } tellimus on tühistatud
subscriptionCancellation-title = Kahju, et lahkud

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Oled lülitunud tootele { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Oled edukalt lülitanud tootelt { $productNameOld } tootele { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Alates järgmisest arvest muutub tasu. Senise { $paymentAmountOld } { $productPaymentCycleOld } eest { $paymentAmountNew } { $productPaymentCycleNew }. Sel ajal saad ka ühekordse kreeditarve { $paymentProrated }, mis kajastab perioodi { $productPaymentCycleOld } madalamat tasu.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Kui kasutatava teenuse { $productName } jaoks on paigaldamiseks saadaval uus tarkvara, siis saad selle kohta eraldi kirja allalaadimisjuhistega.
subscriptionDowngrade-content-auto-renew = Sinu tellimust uuendatakse automaatselt igal arveldusperioodil, kui sa ei otsusta tühistada.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Teenuse { $productName } tellimus on tühistatud
subscriptionFailedPaymentsCancellation-title = Sinu tellimus on tühistatud
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Toote { $productName } tellimus on tühistatud, sest mitu tasumise katset ebaõnnestusid. Ligipääsu taastamiseks alusta uut tellimust uuendatud makseviisiga.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Toote { $productName } makse on kinnitatud
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Täname teenuse { $productName } tellimise eest
subscriptionFirstInvoice-content-processing = Sinu makset töödeldakse ja see võib võtta kuni neli tööpäeva.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Saad eraldi e-kirja selle kohta, kuidas teenust { $productName } kasutama hakata.
subscriptionFirstInvoice-content-auto-renew = Sinu tellimust uuendatakse automaatselt igal arveldusperioodil, kui sa ei otsusta tühistada.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Toote { $productName } makse on ebaõnnestus
subscriptionPaymentFailed-title = Kahjuks on meil probleeme sinu makse teostamisega
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Meil tekkis probleem toote { $productName } viimase maksega.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Vaja on uuendada toote { $productName } makseteavet
subscriptionPaymentProviderCancelled-title = Kahjuks on meil probleeme sinu makseviisiga
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Toote { $productName } makseviisiga tuvastati probleem.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Teenuse { $productName } tellimus aktiveeriti uuesti
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Täname, et aktiveerisid uuesti teenuse { $productName } tellimuse!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Sinu arveldustsükkel ja makse jäävad samaks. Järgmine arve on { $invoiceTotal } kuupäeval { $nextInvoiceDateOnly }. Tellimust uuendatakse automaatselt igal arveldusperioodil, kui sa ei otsusta tühistada.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Teenuse { $productName } automaatse uuendamise teatis
subscriptionRenewalReminder-title = Sinu tellimust uuendatakse peagi
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Lugupeetud teenuse { $productName } klient
subscriptionRenewalReminder-content-closing = Lugupidamisega
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Teenuse { $productName } tiim
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Toote { $productName } makse jõudis kohale
subscriptionSubsequentInvoice-title = Täname, et oled tellija!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Saime kätte sinu viimase makse toote { $productName } eest.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Oled üle läinud tootele { $productName }
subscriptionUpgrade-title = Täname, et sooritasid uuenduse!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Sinu tellimust uuendatakse automaatselt igal arveldusperioodil, kui sa ei otsusta tühistada.
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } tellimuste jaoks on vajalik makseteabe uuendamine
subscriptionsPaymentProviderCancelled-title = Kahjuks on meil probleeme sinu makseviisiga
subscriptionsPaymentProviderCancelled-content-detected = Järgnevate tellimuste makseviisiga tuvastati probleem.
