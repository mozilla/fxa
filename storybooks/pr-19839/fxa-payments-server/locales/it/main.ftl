



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $capitalization ->
        [uppercase] Account Firefox
       *[lowercase] account Firefox
    }
-product-mozilla-account =
    { $capitalization ->
        [uppercase] Account Mozilla
       *[lowercase] account Mozilla
    }
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Account Mozilla
       *[lowercase] account Mozilla
    }
-product-firefox-account =
    { $capitalization ->
        [uppercase] Account Firefox
       *[lowercase] account Firefox
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Errore generale dell’applicazione
app-general-err-message = Si è verificato un problema. Riprova più tardi.
app-query-parameter-err-heading = Richiesta non valida: parametri della query non validi


app-footer-mozilla-logo-label = Logo { -brand-mozilla }
app-footer-privacy-notice = Informativa sulla privacy del sito web
app-footer-terms-of-service = Condizioni di utilizzo del servizio


app-default-title-2 = { -product-mozilla-accounts(capitalization: "uppercase") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "uppercase") }


link-sr-new-window = Si apre in una nuova finestra


app-loading-spinner-aria-label-loading = Caricamento in corso…


app-logo-alt-3 =
    .alt = Logo con la m di  { -brand-mozilla }



settings-home = Pagina principale dell’account
settings-project-header-title = { -product-mozilla-account(capitalization: "uppercase") }


coupon-promo-code-applied = Codice promozionale applicato
coupon-submit = Applica
coupon-remove = Rimuovi
coupon-error = Il codice inserito non è valido o è scaduto.
coupon-error-generic = Si è verificato un errore durante l’elaborazione del codice. Riprova.
coupon-error-expired = Il codice inserito è scaduto.
coupon-error-limit-reached = Il codice inserito ha raggiunto il proprio limite.
coupon-error-invalid = Il codice inserito non è valido.
coupon-enter-code =
    .placeholder = Inserisci il codice


default-input-error = Campo obbligatorio
input-error-is-required = { $label } è un campo obbligatorio


brand-name-mozilla-logo = Logo { -brand-mozilla }


new-user-sign-in-link-2 = Hai già un { -product-mozilla-account }? <a>Accedi</a>
new-user-enter-email =
    .label = Inserisci il tuo indirizzo email
new-user-confirm-email =
    .label = Conferma il tuo indirizzo email
new-user-subscribe-product-updates-mozilla = Desidero ricevere aggiornamenti e novità sui prodotti da { -brand-mozilla }
new-user-subscribe-product-updates-snp = Desidero ricevere aggiornamenti su sicurezza e privacy da { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Desidero ricevere aggiornamenti e novità sui prodotti da { -product-mozilla-hubs } e { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Desidero ricevere aggiornamenti e novità sui prodotti da { -product-mdn-plus } e { -brand-mozilla }
new-user-subscribe-product-assurance = Utilizziamo la tua email solo per creare il tuo account. Non la venderemo mai a terzi.
new-user-email-validate = L’email non è valida
new-user-email-validate-confirm = Gli indirizzi email non corrispondono
new-user-already-has-account-sign-in = Hai già un account. <a>Accedi</a>
new-user-invalid-email-domain = Hai sbagliato a digitare l’email? { $domain } non offre un servizio di email.


payment-confirmation-thanks-heading = Grazie!
payment-confirmation-thanks-heading-account-exists = Grazie! Ora controlla la tua email.
payment-confirmation-thanks-subheading = È stata inviata un’email di conferma a { $email } con i dettagli su come iniziare a usare { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Riceverai un’email all’indirizzo { $email } con le istruzioni per configurare il tuo account e i dettagli per il pagamento.
payment-confirmation-order-heading = Dettagli dell’ordine
payment-confirmation-invoice-number = Fattura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informazioni di pagamento
payment-confirmation-amount = { $amount } per { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } al giorno
       *[other] { $amount } ogni { $intervalCount } giorni
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } alla settimana
       *[other] { $amount } ogni { $intervalCount } settimane
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } al mese
       *[other] { $amount } ogni { $intervalCount } mesi
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } all’anno
       *[other] { $amount } ogni { $intervalCount } anni
    }
payment-confirmation-download-button = Prosegui con il download


payment-confirm-with-legal-links-static-3 = Autorizzo { -brand-mozilla } ad addebitare l’importo visualizzato utilizzando il metodo di pagamento da me scelto, in base alle <termsOfServiceLink>condizioni di utilizzo del servizio</termsOfServiceLink> e all’<privacyNoticeLink>informativa sulla privacy</privacyNoticeLink>, fino a quando non annullerò il mio abbonamento.
payment-confirm-checkbox-error = È necessario selezionare questa opzione per procedere


payment-error-retry-button = Riprova
payment-error-manage-subscription-button = Gestione abbonamento


iap-upgrade-already-subscribed-2 = Hai già un abbonamento a { $productName } tramite gli app store di { -brand-google } o { -brand-apple }.
iap-upgrade-no-bundle-support = Gli aggiornamenti non sono disponibili per questi abbonamenti, ma lo saranno presto.
iap-upgrade-contact-support = Puoi ancora ottenere questo prodotto: contatta l’assistenza per ricevere supporto.
iap-upgrade-get-help-button = Ricevi assistenza


payment-name =
    .placeholder = Nome completo
    .label = Nome così come appare sulla carta
payment-cc =
    .label = La tua carta
payment-cancel-btn = Annulla
payment-update-btn = Aggiorna
payment-pay-btn = Paga ora
payment-pay-with-paypal-btn-2 = Paga con { -brand-paypal }
payment-validate-name-error = Inserisci il tuo nome


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } utilizza { -brand-name-stripe } e { -brand-paypal } per l’elaborazione sicura dei pagamenti.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Informativa sulla privacy di { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Informativa sulla privacy di { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } utilizza { -brand-paypal } per l’elaborazione sicura dei pagamenti.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Informativa sulla privacy di { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } utilizza { -brand-name-stripe } per l’elaborazione sicura dei pagamenti.
payment-legal-link-stripe-3 = <stripePrivacyLink>Informativa sulla privacy di { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Scegli il tuo metodo di pagamento
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Per prima cosa devi approvare il tuo abbonamento


payment-processing-message = Attendi mentre elaboriamo il tuo pagamento…


payment-confirmation-cc-card-ending-in = Carta che termina con { $last4 }


pay-with-heading-paypal-2 = Paga con { -brand-paypal }


plan-details-header = Dettagli del prodotto
plan-details-list-price = Prezzo di listino
plan-details-show-button = Mostra dettagli
plan-details-hide-button = Nascondi dettagli
plan-details-total-label = Totale
plan-details-tax = Tasse e commissioni


product-no-such-plan = Nessun piano di questo tipo per questo prodotto.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } di tasse
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } al giorno
       *[other] { $priceAmount } ogni { $intervalCount } giorni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } al giorno
           *[other] { $priceAmount } ogni { $intervalCount } giorni
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } alla settimana
       *[other] { $priceAmount } ogni { $intervalCount } settimane
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } alla settimana
           *[other] { $priceAmount } ogni { $intervalCount } settimane
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } al mese
       *[other] { $priceAmount } ogni { $intervalCount } mesi
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } al mese
           *[other] { $priceAmount } ogni { $intervalCount } mesi
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } all’anno
       *[other] { $priceAmount } ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } all’anno
           *[other] { $priceAmount } ogni { $intervalCount } anni
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tasse al giorno
       *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } giorni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tasse al giorno
           *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } giorni
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } alla settimana
       *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } settimane
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } alla settimana
           *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } settimane
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tasse al mese
       *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } mesi
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tasse al mese
           *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } mesi
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tasse all’anno
       *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tasse all’anno
           *[other] { $priceAmount } + { $taxAmount } di tasse ogni { $intervalCount } anni
        }


subscription-create-title = Configura l’abbonamento
subscription-success-title = Conferma dell’abbonamento
subscription-processing-title = Conferma abbonamento…
subscription-error-title = Errore durante la conferma dell’abbonamento…
subscription-noplanchange-title = Questa modifica al piano di abbonamento non è supportata
subscription-iapsubscribed-title = Già abbonato
sub-guarantee = Garanzia di rimborso di 30 giorni


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Condizioni di utilizzo del servizio
privacy = Informativa sulla privacy
terms-download = Scarica i termini


document =
    .title = Firefox Accounts
close-aria =
    .aria-label = Chiudi finestra di dialogo
settings-subscriptions-title = Abbonamenti
coupon-promo-code = Codice promozionale


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } al giorno
       *[other] { $amount } ogni { $intervalCount } giorni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } al giorno
           *[other] { $amount } ogni { $intervalCount } giorni
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } settimanalmente
       *[other] { $amount } ogni { $intervalCount } settimane
    }
    .title =
        { $intervalCount ->
            [one] { $amount } settimanalmente
           *[other] { $amount } ogni { $intervalCount } settimane
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } al mese
       *[other] { $amount } ogni { $intervalCount } mesi
    }
    .title =
        { $intervalCount ->
            [one] { $amount } al mese
           *[other] { $amount } ogni { $intervalCount } mesi
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } all’anno
       *[other] { $amount } ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } all’anno
           *[other] { $amount } ogni { $intervalCount } anni
        }


general-error-heading = Errore generale dell’applicazione
basic-error-message = Si è verificato un problema. Riprova più tardi.
payment-error-1 = Uhm… si è verificato un problema durante l’autorizzazione del pagamento. Riprova o contatta l’emittente della carta.
payment-error-2 = Uhm… si è verificato un problema durante l’autorizzazione del pagamento. Contatta l’emittente della carta.
payment-error-3b = Si è verificato un errore imprevisto durante l’elaborazione del pagamento, riprova.
expired-card-error = Questa carta di credito risulta scaduta. Prova con un’altra carta.
insufficient-funds-error = Questa carta non dispone di credito sufficiente. Prova con un’altra carta di credito.
withdrawal-count-limit-exceeded-error = La transazione supera il limite di credito disponibile per questa carta. Prova con un’altra carta.
charge-exceeds-source-limit = La transazione supera il limite di credito disponibile per questa carta. Prova con un’altra carta o attendi 24 ore.
instant-payouts-unsupported = Questa carta di debito non risulta configurata per i pagamenti istantanei. Prova con un’altra carta di debito o di credito.
duplicate-transaction = Uhm… sembra che sia stata appena inviata una transazione identica. Controlla la cronologia dei pagamenti.
coupon-expired = Il codice promozionale risulta scaduto.
card-error = La transazione non può essere elaborata. Verifica i dati della tua carta di credito e riprova.
country-currency-mismatch = La valuta di questo abbonamento non è valida per il Paese associato alla tua modalità di pagamento.
currency-currency-mismatch = Siamo spiacenti, non è possibile cambiare la valuta.
location-unsupported = La tua posizione attuale non è supportata dalle nostre condizioni di utilizzo del servizio.
no-subscription-change = Siamo spiacenti, non puoi modificare il tuo piano di abbonamento.
iap-already-subscribed = Sei già abbonato tramite { $mobileAppStore }.
fxa-account-signup-error-2 = Un errore di sistema ha impedito l’abbonamento a { $productName }. Non è stato applicato alcun addebito sul tuo metodo di pagamento. Riprova.
fxa-post-passwordless-sub-error = La sottoscrizione dell’abbonamento è confermata ma il caricamento della pagina di conferma non è riuscito. Verifica la tua email per configurare il tuo account.
newsletter-signup-error = Non sei iscritto alle notifiche via mail relative agli aggiornamenti dei prodotti. Puoi riprovare nelle impostazioni del tuo account.
product-plan-error =
    .title = Errore nel caricamento dei piani
product-profile-error =
    .title = Errore nel caricamento del profilo
product-customer-error =
    .title = Errore nel caricamento del cliente
product-plan-not-found = Piano non trovato
product-location-unsupported-error = Posizione non supportata


coupon-success = Il tuo piano si rinnoverà automaticamente al prezzo di listino.
coupon-success-repeating = Il tuo piano si rinnoverà automaticamente dopo { $couponDurationDate } al prezzo di listino.


new-user-step-1-2 = 1. Crea un { -product-mozilla-account }
new-user-card-title = Inserisci le informazioni relative alla tua carta di credito
new-user-submit = Abbonati adesso


sub-update-payment-title = Informazioni di pagamento


pay-with-heading-card-only = Paga con la carta
product-invoice-preview-error-title = Problema durante il caricamento dell’anteprima della fattura
product-invoice-preview-error-text = Impossibile caricare l’anteprima della fattura


subscription-iaperrorupgrade-title = Non è ancora possibile effettuare l’aggiornamento


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Rivedi la tua modifica
sub-change-failed = Modifica del piano non riuscita
sub-update-acknowledgment = Il tuo piano verrà cambiato immediatamente e ti verrà addebitato oggi un importo ripartito proporzionalmente per la parte restante del ciclo di fatturazione. A partire da { $startingDate } ti verrà addebitato l’intero importo.
sub-change-submit = Conferma modifica
sub-update-current-plan-label = Piano attuale
sub-update-new-plan-label = Nuovo piano
sub-update-total-label = Nuovo totale
sub-update-prorated-upgrade = Aggiornamento ripartito proporzionalmente


sub-update-new-plan-daily = { $productName } (al giorno)
sub-update-new-plan-weekly = { $productName } (alla settimana)
sub-update-new-plan-monthly = { $productName } (al mese)
sub-update-new-plan-yearly = { $productName } (all’anno)
sub-update-prorated-upgrade-credit = Il saldo negativo visualizzato verrà applicato come credito al tuo account e utilizzato per le prossime fatture.


sub-item-cancel-sub = Cancella abbonamento
sub-item-stay-sub = Resta abbonato


sub-item-cancel-msg = Non potrai più utilizzare { $name } dopo il { $period }, ultimo giorno del tuo ciclo di fatturazione.
sub-item-cancel-confirm = Disattiva il mio accesso e rimuovi le informazioni personali salvate in { $name } il { $period }
sub-promo-coupon-applied = Coupon { $promotion_name } applicato: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Il pagamento di questo abbonamento ha generato un accredito sul saldo del tuo account: <priceDetails></priceDetails>


sub-route-idx-reactivating = Riattivazione dell’abbonamento non riuscita
sub-route-idx-cancel-failed = Annullamento dell’abbonamento non riuscito
sub-route-idx-contact = Contatta l’assistenza
sub-route-idx-cancel-msg-title = Ci dispiace che tu abbia deciso di andartene
sub-route-idx-cancel-msg =
    Il tuo abbonamento a { $name } è stato annullato.
          <br />
          Potrai ancora accedere a { $name } fino al { $date }.
sub-route-idx-cancel-aside-2 = Hai domande? Visita il <a>supporto per { -brand-mozilla }</a>.


sub-customer-error =
    .title = Errore nel caricamento del cliente
sub-invoice-error =
    .title = Errore nel caricamento delle fatture
sub-billing-update-success = I tuoi dati di fatturazione sono stati aggiornati correttamente
sub-invoice-previews-error-title = Problema durante il caricamento delle anteprime delle fatture
sub-invoice-previews-error-text = Impossibile caricare le anteprime delle fatture


pay-update-change-btn = Modifica
pay-update-manage-btn = Gestisci


sub-next-bill = Prossimo addebito il { $date }
sub-next-bill-due-date = La prossima fattura è in scadenza il { $date }
sub-expires-on = Scade il { $date }




pay-update-card-exp = Scade il { $expirationDate }
sub-route-idx-updating = Aggiornamento dati di fatturazione…
sub-route-payment-modal-heading = Informazioni di fatturazione non valide
sub-route-payment-modal-message-2 = Sembra che si sia verificato un errore con il tuo account { -brand-paypal }, è necessario seguire i passaggi richiesti per risolvere questo problema con il pagamento.
sub-route-missing-billing-agreement-payment-alert = Si è verificato un errore con il tuo account: informazioni di pagamento non valide. <div>Gestisci</div>
sub-route-funding-source-payment-alert = Si è verificato un errore con il tuo account: informazioni di pagamento non valide. Potrebbe trascorrere diverso tempo prima che questo avviso venga rimosso, anche dopo aver aggiornato correttamente le informazioni. <div>Gestisci</div>


sub-item-no-such-plan = Nessun piano di questo tipo per questo abbonamento.
invoice-not-found = Fattura successiva non trovata
sub-item-no-such-subsequent-invoice = Fattura successiva non trovata per questo abbonamento.
sub-invoice-preview-error-title = Anteprima fattura non trovata
sub-invoice-preview-error-text = Anteprima fattura non trovata per questo abbonamento


reactivate-confirm-dialog-header = Vuoi continuare a utilizzare { $name }?
reactivate-confirm-copy =
    Potrai continuare ad accedere a { $name }, il tuo ciclo di fatturazione
    e il pagamento rimarranno invariati. Il tuo prossimo addebito sulla carta che termina con { $last }
    sarà di { $amount } e avverrà il { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Potrai continuare ad accedere a { $name }. Ciclo di fatturazione 
    e importo rimarranno invariati. Il prossimo addebito 
    sarà di { $amount } e avverrà il { $endDate }.
reactivate-confirm-button = Abbonati nuovamente


reactivate-panel-copy = Perderai l’accesso a { $name } il <strong>{ $date }</strong>.
reactivate-success-copy = Grazie! Tutto pronto.
reactivate-success-button = Chiudi


sub-iap-item-google-purchase-2 = { -brand-google }: acquisto in-app
sub-iap-item-apple-purchase-2 = { -brand-apple }: acquisto in-app
sub-iap-item-manage-button = Gestisci
