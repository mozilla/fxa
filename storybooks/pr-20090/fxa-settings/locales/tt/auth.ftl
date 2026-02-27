## Non-email strings

session-verify-send-push-title-2 = { -product-mozilla-account } эченә кердегезме?
session-verify-send-push-body-2 = Сез икәнегезне раслау өчен монда басыгыз
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } раслау коды: { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } коды: { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } коды: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } логотибы">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } логотибы">
subplat-automated-email = Бу автоматик электрон хат. Аның килүе бер хата аркасында булды дип уйласагыз, берни дә эшләргә кирәкми.
subplat-privacy-notice = Хосусыйлык аңлатмасы
subplat-privacy-plaintext = Хоусыйлык аңлатмасы:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = { $email } адресы өчен { -product-mozilla-account } аккаунты булганы һәм Сез { $productName } хезмәтенә теркәлгәнегез өчен, Сезгә бу хат җибәрелде.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = { $email } адресы өчен { -product-mozilla-account } хисабы булганга, Сезгә бу хат җибәрелде.
subplat-explainer-multiple-2 = { $email } адресы өчен { -product-mozilla-account } аккаунты булганга һәм Сез берничә продуктка язылганга күрә, Сезгә бу хат җибәрелде.
subplat-explainer-was-deleted-2 = { $email } адресы өчен { -product-mozilla-account } хисабы булганы өчен, Сезгә бу хат җибәрелде.
subplat-manage-account-2 = { -product-mozilla-account } көйләүләрен <a data-l10n-name="subplat-account-page">Хисап битегездә</a> үзгәртә аласыз.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = { -product-mozilla-account } көйләүләрен хисап битегездә карап һәм үзгәртеп була: { $accountSettingsUrl }
subplat-terms-policy = Шартлар һәм баш тарту сәясәте
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Язылудан баш тарту
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Язылуны яңадан активлаштыру
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Түләү турындагы мәгълүматны яңарту
subplat-privacy-policy = { -brand-mozilla }-ның Хосусыйлык Сәясәте
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Хосусыйлык Аңлатмасы
subplat-privacy-policy-plaintext = { subplat-privacy-policy } :
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Куллану Шартлары
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Хокукый мәсьәләләр
subplat-legal-plaintext = { subplat-legal }：
subplat-privacy = Хосусыйлык
subplat-privacy-website-plaintext = { subplat-privacy }：
cancellationSurvey = Хезмәтләребезне яхшыртырга ярдәм итү өчен зинһар бу <a data-l10n-name="cancellationSurveyUrl">кыска сораулыкка</a> җавап бирүегезне сорыйбыз.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Зинһар, хезмәтләребезне яхшыртырга ярдәм итү өчен бу кыска сораулыкны алыгыз:
payment-details = Түләү мәгълүматлары:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Квитанция номеры: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceDateOnly } көнне { $invoiceTotal } түләнде
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Киләсе квитанция: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Моңа кадәр барлыгы: { $invoiceSubtotal }

##

subscriptionSupport = Язылуыгыз турында сорауларыгыз бармы? Безнең <a data-l10n-name="subscriptionSupportUrl">ярдәм такымы</a> Сезгә бик теләп ярдәм итәчәк.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Язылуыгыз турында сорауларыгыз бармы? Безнең ярдәм такымы Сезгә бик теләп ярдәм итәчәк:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName } хәбәрләренә язылганыгыз өчен рәхмәт. Язылуларыгыз турында сорауларыгыз булса яки { $productName } турында күбрәк мәгълүмат эзләсәгез, зинһар <a data-l10n-name="subscriptionSupportUrl">безнең белән элемтәгә керегез</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName } хәбәрләренә язылганыгыз өчен рәхмәт. Язылуларыгыз турында сорауларыгыз булса яки { $productName } турында күбрәк мәгълүмат эзләсәгез, зинһар безнең белән элемтәгә керегез:
subscriptionUpdateBillingEnsure = Түләү ысулыгызның һәм хисабыгыз турындагы мәгълүматның актуаль булуын <a data-l10n-name="updateBillingUrl">монда</a> тикшерә аласыз.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Түләү ысулыгызның һәм хисабыгыз турындагы мәгълүматның актуаль булуын монда тикшерә аласыз:
subscriptionUpdateBillingTry = Берничә көн эчендә тагын бер кат түләвегезне алырга тырышып карарбыз. Ләкин проблема чишелсен өчен <a data-l10n-name="updateBillingUrl">түләү турындагы мәгълүматыгызны яңартырга</a> кирәк булырга мөмкин.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Берничә көн эчендә тагын бер кат түләвегезне алырга тырышып карарбыз, ләкин проблема чишелсен өчен түләү турындагы мәгълүматыгызны яңартырга кирәк булырга мөмкин:
subscriptionUpdatePayment = Хезмәтегезнең өзелүен булдырмас өчен, зинһар, тиз арада <a data-l10n-name="updateBillingUrl">түләү турындагы мәгълүматыгызны яңартыгыз</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Хезмәтегезнең өзелүен булдырмас өчен, зинһар, тиз арада түләү турындагы мәгълүматыгызны яңартыгыз:
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Квитанцияне карау: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName } кушымтасына рәхим итегез
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName } кушымтасына рәхим итегез
downloadSubscription-content-2 = Абунәгезнең барлык мөмкинлекләрен куллана башлыйк:
downloadSubscription-link-action-2 = Башлап җибәрү
fraudulentAccountDeletion-subject-2 = Сезнең { -product-mozilla-account } хисабыгыз бетерелде
fraudulentAccountDeletion-title = Сезнең хисабыгыз бетерелде
fraudulentAccountDeletion-content-part1-v2 = Күптән түгел, { -product-mozilla-account } хисабы булдырылды һәм бу эл. почта адресы аша язылу бәясе алынды. Барлык яңа хисаплар белән булган кебек, башта бу эл. почта адресын раслап, хисабыгызны раславыгызны сорадык.
fraudulentAccountDeletion-content-part2-v2 = Хәзерге вакытта без хисапның беркайчан да расланмаганын күрәбез. Бу адым тәмамланмаганлыктан, бу вәкаләт бирелгән язылу булганмы-юкмы, без белмибез. Нәтиҗәдә, бу эл. почта адресына теркәлгән { -product-mozilla-account } хисабы бетерелде һәм барлык түләүләр кире кайтарлыып, язылуыгыз туктатылды.
fraudulentAccountDeletion-contact = Сорауларыгыз булса, зинһар, безнең <a data-l10n-name="mozillaSupportUrl">ярдәм төркеменә</a> мөрәҗәгать итегез.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Сорауларыгыз булса, зинһар, безнең ярдәм төркеменә мөрәҗәгать итегез: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Сезнең { $productName } хезмәтенә язылуыгыз бетерелде
subscriptionAccountDeletion-title = Китүегез безгә кызганыч
subscriptionAccountReminderFirst-subject = Бер искәртү: Хисабыгызны көйләүне тәмамлагыз
subscriptionAccountReminderFirst-title = Сез әле абунәгезгә керә алмыйсыз
subscriptionAccountReminderFirst-action = Серсүз булдыру
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Соңгы искәртү: Хисабыгызны көйләгез
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla }-ка рәхим итегез!
subscriptionAccountReminderSecond-action = Серсүз булдыру
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Сезнең { $productName } хезмәтенә язылуыгыз бетерелде
subscriptionCancellation-title = Китүегез безгә кызганыч

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = { $productName } хезмәтенә күчтегез
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld } продуктыннан { $productName } продуктына күчү уңышлы узды.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Сезнең { $productName } хезмәтенә язылуыгыз туктатылды
subscriptionFailedPaymentsCancellation-title = Язылуыгыз туктатылды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } өчен түләү расланды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName } хәбәрләренә язылганыгыз өчен рәхмәт
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } өчен түләү уңышсыз тәмамланды
subscriptionPaymentFailed-title = Гафу итегез, түләвегез белән проблема килеп чыкты
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = { $productName } өчен соңгы түләвегез белән бер проблема килеп чыкты.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName } өчен түләү турындагы мәгълүматны яңарту кирәк
subscriptionPaymentProviderCancelled-title = Гафу итегез, сезнең түләү ысулы белән проблема бар
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = { $productName } өчен түләү ысулыгыз белән бер проблема ачыкладык.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } продуктына язылу яңадан активлаштырылды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = { $productName } абунәгезне яңартуыгыз өчен рәхмәт!
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } абунәсен автоматик рәвештә озайту турындагы белдерү
subscriptionRenewalReminder-title = Абунәгез тиздән яңартылачак
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Хөрмәтле { $productName } мөштәрие,
subscriptionRenewalReminder-content-closing = Хөрмәт илә,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } такымы
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } өчен түләү кабул ителде
subscriptionSubsequentInvoice-title = Язылуыгыз өчен рәхмәт!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName } өчен соңгы түләвегезне кабул иттек.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName } продуктына күтәрелү уңышлы узды
subscriptionUpgrade-title = Яңартуыгыз өчен рәхмәт!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } абунәләре өчен түләү турындагы мәгълүматны яңарту кирәк
subscriptionsPaymentProviderCancelled-title = Гафу итегез, сезнең түләү ысулы белән проблема бар
subscriptionsPaymentProviderCancelled-content-detected = Түбәндәге абунәләр өчен түләү ысулыгыз белән бер проблема ачыкладык.
