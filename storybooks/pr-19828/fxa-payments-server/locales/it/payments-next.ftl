loyalty-discount-terms-heading = Termini e restrizioni
loyalty-discount-terms-support = Contatta l’assistenza
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Contatta l’assistenza per { $productName }
not-found-page-title-terms = Pagina non trovata
not-found-page-description-terms = La pagina che stai cercando non esiste.
not-found-page-button-terms-manage-subscriptions = Gestisci gli abbonamenti

## Page

checkout-signin-or-create = 1. Accedi o crea un { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = o
continue-signin-with-google-button = Continua con { -brand-google }
continue-signin-with-apple-button = Continua con { -brand-apple }
next-payment-method-header = Scegli il tuo metodo di pagamento
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Per prima cosa devi approvare il tuo abbonamento
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Seleziona il tuo Paese e inserisci il tuo codice postale <p>per continuare con il pagamento per { $productName }</p>
location-banner-info = Non è stato possibile rilevare automaticamente la tua posizione
location-required-disclaimer = Utilizziamo queste informazioni solo per calcolare tasse e valuta.
location-banner-currency-change = Cambio valuta non supportato. Per continuare, seleziona un Paese che corrisponda alla valuta di fatturazione corrente.

## Page - Upgrade page

upgrade-page-payment-information = Informazioni di pagamento
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Il tuo piano verrà cambiato immediatamente e ti verrà addebitato oggi un importo ripartito proporzionalmente per la parte restante del ciclo di fatturazione. A partire da { $nextInvoiceDate } ti verrà addebitato l’intero importo.

## Authentication Error page

auth-error-page-title = Impossibile accedere
checkout-error-boundary-retry-button = Riprova
checkout-error-boundary-basic-error-message = Si è verificato un errore. Riprovare o <contactSupportLink>contattare il supporto</contactSupportLink>.
amex-logo-alt-text = Logo { -brand-amex }
diners-logo-alt-text = Logo { -brand-diner }
discover-logo-alt-text = Logo { -brand-discover }
jcb-logo-alt-text = Logo { -brand-jcb }
mastercard-logo-alt-text = Logo { -brand-mastercard }
paypal-logo-alt-text = Logo { -brand-paypal }
unionpay-logo-alt-text = Logo { -brand-unionpay }
visa-logo-alt-text = Logo { -brand-visa }
# Alt text for generic payment card logo
unbranded-logo-alt-text = Logo senza marchio
link-logo-alt-text = Logo { -brand-link }
apple-pay-logo-alt-text = Logo di { -brand-apple-pay }
google-pay-logo-alt-text = Logo di { -brand-google-pay }

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Gestione abbonamento
next-iap-blocked-contact-support = Hai un abbonamento in-app effettuato da mobile in conflitto con questo prodotto. Contatta il supporto per ricevere assistenza.
next-payment-error-retry-button = Riprova
next-basic-error-message = Si è verificato un problema. Riprova più tardi.
checkout-error-contact-support-button = Contatta l’assistenza
checkout-error-not-eligible = Non puoi abbonarti a questo prodotto. Contatta il supporto per ricevere assistenza.
checkout-error-already-subscribed = Sei già abbonato a questo prodotto.
checkout-error-contact-support = Contatta il supporto per ricevere assistenza.
cart-error-currency-not-determined = Non è stato possibile determinare la valuta per questo acquisto. Riprova.
checkout-processing-general-error = Si è verificato un errore imprevisto durante l’elaborazione del pagamento, riprova.
cart-total-mismatch-error = L’importo della fattura è cambiato. Riprova.

## Error pages - Payment method failure messages

intent-card-error = La transazione non può essere elaborata. Verifica i dati della tua carta di credito e riprova.
intent-expired-card-error = Questa carta di credito risulta scaduta. Prova con un’altra carta.
intent-payment-error-try-again = Uhm… si è verificato un problema durante l’autorizzazione del pagamento. Riprova o contatta l’emittente della carta.
intent-payment-error-get-in-touch = Uhm… si è verificato un problema durante l’autorizzazione del pagamento. Contatta l’emittente della carta.
intent-payment-error-generic = Si è verificato un errore imprevisto durante l’elaborazione del pagamento, riprova.
intent-payment-error-insufficient-funds = Questa carta non dispone di credito sufficiente. Prova con un’altra carta di credito.
general-paypal-error = Si è verificato un errore imprevisto durante l’elaborazione del pagamento, riprova.
paypal-active-subscription-no-billing-agreement-error = Sembra che si sia verificato un problema di fatturazione con il tuo account { -brand-paypal }. Riattiva i pagamenti automatici per il tuo abbonamento.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Attendi mentre elaboriamo il tuo pagamento…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Grazie! Ora controlla la tua email.
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Riceverai un’email all’indirizzo { $email } con le istruzioni relative all’abbonamento e i dettagli per il pagamento.
next-payment-confirmation-order-heading = Dettagli dell’ordine
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Fattura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Informazioni di pagamento

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Prosegui con il download

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Carta che termina con { $last4 }

## Not found page

not-found-title-subscriptions = Abbonamento non trovato
not-found-description-subscriptions = Impossibile trovare l’abbonamento. Riprova o contatta il supporto.
not-found-button-back-to-subscriptions = Torna agli abbonamenti

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = Nessun metodo di pagamento aggiunto
subscription-management-page-banner-warning-link-no-payment-method = Aggiungi un metodo di pagamento
subscription-management-subscriptions-heading = Abbonamenti
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Vai a
subscription-management-nav-payment-details = Dettagli del pagamento
subscription-management-nav-active-subscriptions = Abbonamenti attivi
subscription-management-payment-details-heading = Dettagli del pagamento
subscription-management-email-label = Email
subscription-management-credit-balance-label = Credito residuo
subscription-management-credit-balance-message = Il credito verrà automaticamente applicato alle fatture future
subscription-management-payment-method-label = Metodo di pagamento
subscription-management-button-add-payment-method-aria = Aggiungi metodo di pagamento
subscription-management-button-add-payment-method = Aggiungi
subscription-management-page-warning-message-no-payment-method = Aggiungi un metodo di pagamento per evitare interruzioni del tuo abbonamento.
subscription-management-button-manage-payment-method-aria = Gestisci il metodo di pagamento
subscription-management-button-manage-payment-method = Gestisci
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Carta che termina con { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Scade il { $expirationDate }
subscription-management-active-subscriptions-heading = Abbonamenti attivi
subscription-management-you-have-no-active-subscriptions = Non ci sono abbonamenti attivi
subscription-management-new-subs-will-appear-here = I nuovi abbonamenti verranno visualizzati qui.
subscription-management-your-active-subscriptions-aria = I tuoi abbonamenti attivi
subscription-management-button-support = Ottieni assistenza
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Ottieni assistenza per { $productName }
subscription-management-your-apple-iap-subscriptions-aria = I tuoi abbonamenti in-app via { -brand-apple }
subscription-management-apple-in-app-purchase-2 = Acquisto in-app con { -brand-apple }
subscription-management-your-google-iap-subscriptions-aria = I tuoi abbonamenti in-app via { -brand-google }
subscription-management-google-in-app-purchase-2 = Acquisto in-app con { -brand-google }
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Scade il { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Gestisci abbonamento a { $productName }
subscription-management-button-manage-subscription-1 = Gestisci abbonamento
error-payment-method-banner-title-expired-card = Carta scaduta
error-payment-method-banner-message-add-new-card = Aggiungi una nuova carta o un metodo di pagamento per evitare interruzioni dei tuoi abbonamenti.
error-payment-method-banner-label-update-payment-method = Aggiorna metodo di pagamento
error-payment-method-expired-card = La carta è scaduta. Aggiungi una nuova carta o metodo di pagamento per evitare interruzioni dei tuoi abbonamenti.
error-payment-method-banner-title-invalid-payment-information = Informazioni di pagamento non valide
error-payment-method-banner-message-account-issue = Si è verificato un problema con il tuo account.
subscription-management-button-manage-payment-method-1 = Gestisci il metodo di pagamento
subscription-management-error-apple-pay = Si è verificato un problema con il tuo account { -brand-apple-pay }. Risolvi il problema per mantenere attivi gli abbonamenti.
subscription-management-error-google-pay = Si è verificato un problema con il tuo account { -brand-google-pay }. Risolvi il problema per mantenere attivi gli abbonamenti.
subscription-management-error-link = Si è verificato un problema con il tuo account { -brand-link }. Risolvi il problema per mantenere attivi gli abbonamenti.
subscription-management-error-paypal-billing-agreement = Si è verificato un problema con il tuo account { -brand-paypal }. Risolvi il problema per mantenere attivi gli abbonamenti.
subscription-management-error-payment-method = Si è verificato un problema con il metodo di pagamento. Risolvi il problema per mantenere attivi gli abbonamenti.
manage-payment-methods-heading = Gestisci metodi di pagamento
paypal-payment-management-page-invalid-header = Informazioni di fatturazione non valide
paypal-payment-management-page-invalid-description = Sembra che si sia verificato un errore con il tuo account { -brand-paypal }. È necessario seguire i passaggi richiesti per risolvere questo problema con il pagamento.
# Page - Not Found
page-not-found-title = Pagina non trovata
page-not-found-description = La pagina richiesta non è stata trovata. Abbiamo ricevuto una segnalazione e risolveremo eventuali collegamenti non funzionanti.
page-not-found-back-button = Torna indietro
alert-dialog-title = Finestra di avviso

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Pagina principale dell’account
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Abbonamenti
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Gestisci metodi di pagamento
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Torna a { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Ci dispiace per la tua decisione
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Il tuo abbonamento a { $name } è stato annullato. Potrai comunque accedere a { $name } fino al { $date }.
subscription-cancellation-dialog-aside = Hai una domanda? Visita il sito per il <LinkExternal>supporto { -brand-mozilla }</LinkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = Cancella l’abbonamento a { $productName }

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = Non potrai più utilizzare { $productName } dopo { $currentPeriodEnd }, l’ultimo giorno del ciclo di fatturazione.
subscription-content-cancel-access-message = Disattiva il mio accesso e rimuovi le informazioni salvate in { $productName } prima di { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Cancella abbonamento
    .aria-label = Cancella l’abbonamento a { $productName }
cancel-subscription-button-stay-subscribed = Rimani abbonato
    .aria-label = Rimani abbonato a { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Autorizzo { -brand-mozilla } ad addebitare l’importo visualizzato utilizzando il metodo di pagamento da me scelto, in base alle <termsOfServiceLink>condizioni di utilizzo del servizio</termsOfServiceLink> e all’<privacyNoticeLink>informativa sulla privacy</privacyNoticeLink>, fino a quando non annullerò il mio abbonamento.
next-payment-confirm-checkbox-error = È necessario selezionare questa opzione per procedere

## Checkout Form

next-new-user-submit = Abbonati adesso
next-pay-with-heading-paypal = Paga con { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Inserisci il codice
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Codice promozionale
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Codice promozionale applicato
next-coupon-remove = Rimuovi
next-coupon-submit = Applica

# Component - Header

payments-header-help =
    .title = Assistenza
    .aria-label = Assistenza
    .alt = Assistenza
payments-header-bento =
    .title = Prodotti { -brand-mozilla }
    .aria-label = Prodotti { -brand-mozilla }
    .alt = Logo { -brand-mozilla }
payments-header-bento-close =
    .alt = Chiudi
payments-header-bento-tagline = Altri prodotti { -brand-mozilla } che proteggono la tua privacy
payments-header-bento-firefox-desktop = Browser { -brand-firefox } per desktop
payments-header-bento-firefox-mobile = Browser { -brand-firefox } per dispositivi mobili
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Realizzato da { -brand-mozilla }
payments-header-avatar =
    .title = Menu { -product-mozilla-account }
payments-header-avatar-icon =
    .alt = Immagine del profilo per l’account
payments-header-avatar-expanded-signed-in-as = Accesso effettuato come
payments-header-avatar-expanded-sign-out = Disconnetti
payments-client-loading-spinner =
    .aria-label = Caricamento…
    .alt = Caricamento…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Imposta come metodo di pagamento predefinito
# Save button for saving a new payment method
payment-method-management-save-method = Salva metodo di pagamento
manage-stripe-payments-title = Gestisci metodi di pagamento

## Component - PurchaseDetails

next-plan-details-header = Dettagli del prodotto
next-plan-details-list-price = Prezzo di listino
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Prezzo ripartito proporzionalmente per { $productName }
next-plan-details-tax = Tasse e commissioni
next-plan-details-total-label = Totale
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Credito dal tempo inutilizzato
purchase-details-subtotal-label = Totale parziale
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Credito applicato
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Totale dovuto
next-plan-details-hide-button = Nascondi dettagli
next-plan-details-show-button = Mostra dettagli
next-coupon-success = Il tuo piano si rinnoverà automaticamente al prezzo di listino.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Il tuo piano si rinnoverà automaticamente dopo { $couponDurationDate } al prezzo di listino.

## Select Tax Location

select-tax-location-title = Posizione
select-tax-location-edit-button = Modifica
select-tax-location-save-button = Salva
select-tax-location-continue-to-checkout-button = Procedi con il pagamento
select-tax-location-country-code-label = Paese
select-tax-location-country-code-placeholder = Seleziona il tuo Paese
select-tax-location-error-missing-country-code = Seleziona il tuo Paese
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } non è disponibile in questa località.
select-tax-location-postal-code-label = Codice postale
select-tax-location-postal-code =
    .placeholder = Inserisci il tuo codice postale
select-tax-location-error-missing-postal-code = Inserisci il tuo codice postale
select-tax-location-error-invalid-postal-code = Inserire un codice postale valido
select-tax-location-successfully-updated = La tua posizione è stata aggiornata.
select-tax-location-error-location-not-updated = Impossibile aggiornare la posizione. Riprova.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Il tuo account viene fatturato in { $currencyDisplayName }. Seleziona un Paese che utilizza { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Seleziona un Paese che corrisponda alla valuta dei tuoi abbonamenti attivi.
select-tax-location-new-tax-rate-info = Aggiornando la tua posizione verrà applicata la nuova aliquota fiscale a tutti gli abbonamenti attivi sul tuo account, a partire dal prossimo ciclo di fatturazione.
signin-form-continue-button = Continua
signin-form-email-input = Inserisci il tuo indirizzo email
signin-form-email-input-missing = Inserisci il tuo indirizzo email
signin-form-email-input-invalid = Inserire un indirizzo email valido
next-new-user-subscribe-product-updates-mdnplus = Desidero ricevere aggiornamenti e novità sui prodotti da { -product-mdn-plus } e { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Desidero ricevere aggiornamenti e novità sui prodotti da { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Desidero ricevere aggiornamenti su sicurezza e privacy da { -brand-mozilla }
next-new-user-subscribe-product-assurance = Utilizziamo la tua email solo per creare il tuo account. Non la venderemo mai a terzi.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Vuoi continuare a utilizzare { $productName }?
stay-subscribed-access-will-continue = Continuerai ad avere accesso a { $productName } e il ciclo di fatturazione e il pagamento non subiranno cambiamenti.
subscription-content-button-resubscribe = Abbonati nuovamente
    .aria-label = Abbonati nuovamente a { $productName }
resubscribe-success-dialog-title = Grazie! Tutto pronto.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = Il prossimo addebito sarà di { $nextInvoiceTotal } + { $taxDue } tasse il { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = Il prossimo addebito sarà di { $nextInvoiceTotal } il { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = Verrà applicato uno sconto di { $promotionName }
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Ultima fattura • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } tasse
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Visualizza fattura
subscription-management-link-view-invoice-aria = Visualizza fattura per { $productName }
subscription-content-expires-on-expiry-date = Scade il { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Prossima fattura • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } tasse
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Rimani abbonato
    .aria-label = Rimani abbonato a { $productName }
subscription-content-button-cancel-subscription = Cancella abbonamento
    .aria-label = Cancella l’abbonamento a { $productName }

##

dialog-close = Chiudi finestra di dialogo
button-back-to-subscriptions = Torna agli abbonamenti
subscription-content-cancel-action-error = Si è verificato un errore imprevisto. Riprova.
paypal-unavailable-error = { -brand-paypal } non è attualmente disponibile. Utilizza un’altra opzione di pagamento o riprova più tardi.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } al giorno
plan-price-interval-weekly = { $amount } alla settimana
plan-price-interval-monthly = { $amount } al mese
plan-price-interval-halfyearly = { $amount } ogni 6 mesi
plan-price-interval-yearly = { $amount } all’anno

## Component - SubscriptionTitle

next-subscription-create-title = Configura l’abbonamento
next-subscription-success-title = Conferma dell’abbonamento
next-subscription-processing-title = Conferma abbonamento…
next-subscription-error-title = Errore durante la conferma dell’abbonamento…
subscription-title-sub-exists = Sei già abbonato
subscription-title-plan-change-heading = Rivedi la tua modifica
subscription-title-not-supported = Questa modifica al piano di abbonamento non è supportata
next-sub-guarantee = Garanzia di rimborso di 30 giorni

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Condizioni di utilizzo del servizio
next-privacy = Informativa sulla privacy
next-terms-download = Scarica i termini
terms-and-privacy-stripe-label = { -brand-mozilla } utilizza { -brand-name-stripe } per l’elaborazione sicura dei pagamenti.
terms-and-privacy-stripe-link = Informativa sulla privacy di { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } utilizza { -brand-paypal } per l’elaborazione sicura dei pagamenti.
terms-and-privacy-paypal-link = Informativa sulla privacy di { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } utilizza { -brand-name-stripe } e { -brand-paypal } per l’elaborazione sicura dei pagamenti.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Piano attuale
upgrade-purchase-details-new-plan-label = Nuovo piano
upgrade-purchase-details-promo-code = Codice promozionale
upgrade-purchase-details-tax-label = Tasse e commissioni
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Credito emesso sull’account
upgrade-purchase-details-credit-will-be-applied = Il credito verrà applicato al tuo account e utilizzato per le prossime fatture.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (al giorno)
upgrade-purchase-details-new-plan-weekly = { $productName } (alla settimana)
upgrade-purchase-details-new-plan-monthly = { $productName } (al mese)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 mesi)
upgrade-purchase-details-new-plan-yearly = { $productName } (all’anno)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Acquista | { $productTitle }
metadata-description-checkout-start = Inserisci i dati per il pagamento per completare l’acquisto.
# Checkout processing
metadata-title-checkout-processing = Elaborazione | { $productTitle }
metadata-description-checkout-processing = Attendi il completamento dell’elaborazione del pagamento.
# Checkout error
metadata-title-checkout-error = Errore | { $productTitle }
metadata-description-checkout-error = Si è verificato un errore durante l’elaborazione dell’abbonamento. Se il problema persiste, contattare il supporto.
# Checkout success
metadata-title-checkout-success = Operazione riuscita | { $productTitle }
metadata-description-checkout-success = Congratulazioni. L’acquisto è stato completato correttamente.
# Checkout needs_input
metadata-title-checkout-needs-input = Azione richiesta | { $productTitle }
metadata-description-checkout-needs-input = Completare l’azione richiesta per procedere con il pagamento.
# Upgrade start
metadata-title-upgrade-start = Aggiorna | { $productTitle }
metadata-description-upgrade-start = Inserisci i dati per il pagamento per completare l’aggiornamento.
# Upgrade processing
metadata-title-upgrade-processing = Elaborazione | { $productTitle }
metadata-description-upgrade-processing = Attendi il completamento dell’elaborazione del pagamento.
# Upgrade error
metadata-title-upgrade-error = Errore | { $productTitle }
metadata-description-upgrade-error = Si è verificato un errore durante l’aggiornamento. Se il problema persiste, contattare il supporto.
# Upgrade success
metadata-title-upgrade-success = Operazione riuscita | { $productTitle }
metadata-description-upgrade-success = Congratulazioni. L’aggiornamento è stato completato correttamente.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Azione richiesta | { $productTitle }
metadata-description-upgrade-needs-input = Completare l’azione richiesta per procedere con il pagamento.
# Default
metadata-title-default = Pagina non trovata | { $productTitle }
metadata-description-default = La pagina richiesta non è stata trovata.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Il codice inserito non può essere utilizzato: il tuo account è già abbonato a uno dei nostri servizi.
next-coupon-error-expired = Il codice inserito è scaduto.
next-coupon-error-generic = Si è verificato un errore durante l’elaborazione del codice. Riprova.
next-coupon-error-invalid = Il codice inserito non è valido.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Il codice inserito ha raggiunto il proprio limite.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Questa offerta è scaduta.
stay-subscribed-error-discount-used = Codice sconto già applicato.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = Questo sconto è disponibile solo per gli attuali abbonati a { $productTitle }.
stay-subscribed-error-still-active = Il tuo abbonamento a { $productTitle } è ancora attivo.
stay-subscribed-error-general = Si è verificato un problema con il rinnovo dell’abbonamento.
