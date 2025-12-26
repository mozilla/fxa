



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Contas Firefox
-product-mozilla-account = Conta Mozilla
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Contas Mozilla
       *[lowercase] contas Mozilla
    }
-product-firefox-account = Conta Firefox
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
-brand-link = Ligação
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Erro geral da aplicação
app-general-err-message = Algo correu mal. Por favor, tente novamente mais tarde.
app-query-parameter-err-heading = Pedido inválido: parâmetros de consulta inválidos


app-footer-mozilla-logo-label = Logótipo da { -brand-mozilla }
app-footer-privacy-notice = Nota de privacidade do site
app-footer-terms-of-service = Condições de utilização


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Abre numa nova janela


app-loading-spinner-aria-label-loading = A carregar…


app-logo-alt-3 =
    .alt = Logótipo m da { -brand-mozilla }



settings-home = Página inicial da conta
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Código promocional aplicado
coupon-submit = Aplicar
coupon-remove = Remover
coupon-error = O código que inseriu é inválido ou expirou.
coupon-error-generic = Ocorreu um erro ao processar o código. Por favor, tente novamente.
coupon-error-expired = O código que introduziu expirou.
coupon-error-limit-reached = O código que introduziu chegou ao seu limite.
coupon-error-invalid = O código que introduziu é inválido.
coupon-enter-code =
    .placeholder = Introduzir código


default-input-error = Este campo é obrigatório
input-error-is-required = { $label } é necessário


brand-name-mozilla-logo = Logótipo da { -brand-mozilla }


new-user-sign-in-link-2 = Já tem uma { -product-mozilla-account }? <a>Iniciar sessão</a>
new-user-enter-email =
    .label = Insira o seu e-mail
new-user-confirm-email =
    .label = Confirme o seu e-mail
new-user-subscribe-product-updates-mozilla = Eu gostaria de receber notícias e atualizações de produtos da { -brand-mozilla }
new-user-subscribe-product-updates-snp = Eu gostaria de receber notícias e atualizações sobre segurança e privacidade da { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Eu gostaria de receber notícias e atualizações de produtos de { -product-mozilla-hubs } e da { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Eu gostaria de receber notícias e atualizações de produtos da { -product-mdn-plus } e da { -brand-mozilla }
new-user-subscribe-product-assurance = Nós apenas utilizamos o seu e-mail para criar a sua conta. Nós nunca iremos vendê-lo a terceiros.
new-user-email-validate = O e-mail não é válido
new-user-email-validate-confirm = Os e-mails não coincidem
new-user-already-has-account-sign-in = Já tem uma conta. <a>Inicie sessão</a>
new-user-invalid-email-domain = E-mail incorreto? { $domain } não fornece e-mail.


payment-confirmation-thanks-heading = Obrigado!
payment-confirmation-thanks-heading-account-exists = Obrigado, agora consulte o seu email!
payment-confirmation-thanks-subheading = Foi enviado um e-mail de confirmação para { $email } com detalhes sobre como começar a utilizar o { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Irá receber um e-mail em { $email } com instruções para configurar a sua conta, bem como os seus detalhes de pagamento.
payment-confirmation-order-heading = Detalhes de compra
payment-confirmation-invoice-number = Fatura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informação de pagamento
payment-confirmation-amount = { $amount } por { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } diariamente
       *[other] { $amount } a cada { $intervalCount } dias
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } semanalmente
       *[other] { $amount } a cada { $intervalCount } semanas
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mensalmente
       *[other] { $amount } a cada { $intervalCount } meses
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } anualmente
       *[other] { $amount } a cada { $intervalCount } anos
    }
payment-confirmation-download-button = Continuar para descarregar


payment-confirm-with-legal-links-static-3 = Eu autorizo a { -brand-mozilla } a cobrar o meu método de pagamento pelo valor apresentado, de acordo com os <termsOfServiceLink>Termos do serviço</termsOfServiceLink> e a <privacyNoticeLink>Informação de privacidade</privacyNoticeLink>, até eu cancelar a minha subscrição.
payment-confirm-checkbox-error = Precisa de concluir isto antes de continuar


payment-error-retry-button = Tentar novamente
payment-error-manage-subscription-button = Gerir a minha subscrição


iap-upgrade-already-subscribed-2 = Já tem uma subscrição do(a) { $productName } através das lojas de aplicações da { -brand-google } ou da { -brand-apple }.
iap-upgrade-no-bundle-support = Não suportamos atualizações para estas subscrições, mas iremos suportar em breve.
iap-upgrade-contact-support = Ainda pode obter este produto – contacte o suporte para que possamos ajudar.
iap-upgrade-get-help-button = Obter ajuda


payment-name =
    .placeholder = Nome completo
    .label = Nome como aparece no seu cartão
payment-cc =
    .label = O seu cartão
payment-cancel-btn = Cancelar
payment-update-btn = Atualizar
payment-pay-btn = Pagar agora
payment-pay-with-paypal-btn-2 = Pagar com o { -brand-paypal }
payment-validate-name-error = Por favor, insira o seu nome


payment-legal-copy-stripe-and-paypal-3 = A { -brand-mozilla } utiliza o { -brand-name-stripe } e o { -brand-paypal } para processar pagamentos de forma segura.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>política de privacidade do { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>política de privacidade do { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } utiliza o { -brand-paypal } para processar pagamentos de forma segura.
payment-legal-link-paypal-3 = <paypalPrivacyLink>política de privacidade do { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = A { -brand-mozilla } utiliza o { -brand-name-stripe } para processar pagamentos de forma segura.
payment-legal-link-stripe-3 = <stripePrivacyLink>política de privacidade do { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Escolha o seu método de pagamento
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primeiro, precisa de aprovar a sua subscrição


payment-processing-message = Por favor, aguarde enquanto processamos o seu pagamento…


payment-confirmation-cc-card-ending-in = Cartão que terminar em { $last4 }


pay-with-heading-paypal-2 = Pagar com o { -brand-paypal }


plan-details-header = Detalhes do produto
plan-details-list-price = Preço de tabela
plan-details-show-button = Mostrar detalhes
plan-details-hide-button = Ocultar detalhes
plan-details-total-label = Total
plan-details-tax = Impostos e Taxas


product-no-such-plan = Não existe esse plano para este produto.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } em impostos
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } diariamente
       *[other] { $priceAmount } a cada { $intervalCount } dia
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } diariamente
           *[other] { $priceAmount } a cada { $intervalCount } dias
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } semanalmente
       *[other] { $priceAmount } a cada { $intervalCount } semana
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } semanalmente
           *[other] { $priceAmount } a cada { $intervalCount } semanas
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } mensalmente
       *[other] { $priceAmount } a cada { $intervalCount } mês
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mensalmente
           *[other] { $priceAmount } a cada { $intervalCount } meses
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } anualmente
       *[other] { $priceAmount } a cada { $intervalCount } ano
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } anualmente
           *[other] { $priceAmount } a cada { $intervalCount } anos
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } imposto diariamente
       *[other] { $priceAmount } + { $taxAmount } imposto a cada { $intervalCount } dias
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } imposto diariamente
           *[other] { $priceAmount } + { $taxAmount } imposto a cada { $intervalCount } dias
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de imposto, por semana
       *[other] { $priceAmount } + { $taxAmount } de imposto, a cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de imposto, por semana
           *[other] { $priceAmount } + { $taxAmount } de imposto, a cada { $intervalCount } semanas
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de imposto, por mês
       *[other] { $priceAmount } + { $taxAmount } de imposto, a cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de imposto, por mês
           *[other] { $priceAmount } + { $taxAmount } de imposto, a cada { $intervalCount } meses
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de imposto, por ano
       *[other] { $priceAmount } + { $taxAmount } de imposto, a cada { $intervalCount } anos
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de imposto, por ano
           *[other] { $priceAmount } + { $taxAmount } de imposto, a cada { $intervalCount } anos
        }


subscription-create-title = Configurar a sua subscrição.
subscription-success-title = Confirmação de subscrição
subscription-processing-title = A confirmar a subscrição…
subscription-error-title = Erro ao confirmar a subscrição…
subscription-noplanchange-title = Esta alteração do plano de subscrição não é suportada
subscription-iapsubscribed-title = Já está subscrito
sub-guarantee = Garantia de devolução do dinheiro em 30 dias


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Termos do serviço
privacy = Informação de privacidade
terms-download = Termos da transferência


document =
    .title = Contas do Firefox
close-aria =
    .aria-label = Fechar janela
settings-subscriptions-title = Subscrições
coupon-promo-code = Código promocional


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } diariamente
       *[other] { $amount } a cada { $intervalCount } dia
    }
    .title =
        { $intervalCount ->
            [one] { $amount } diariamente
           *[other] { $amount } a cada { $intervalCount } dias
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } semanalmente
       *[other] { $amount } a cada { $intervalCount } semana
    }
    .title =
        { $intervalCount ->
            [one] { $amount } semanalmente
           *[other] { $amount } a cada { $intervalCount } semanas
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } mensalmente
       *[other] { $amount } a cada { $intervalCount } mês
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mensalmente
           *[other] { $amount } a cada { $intervalCount } meses
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } anualmente
       *[other] { $amount } a cada { $intervalCount } ano
    }
    .title =
        { $intervalCount ->
            [one] { $amount } anualmente
           *[other] { $amount } a cada { $intervalCount } anos
        }


general-error-heading = Erro geral da aplicação
basic-error-message = Algo correu mal. Tente novamente mais tarde.
payment-error-1 = Hmm. Ocorreu um problema ao autorizar o seu pagamento. Tente novamente mais tarde ou entre em contacto com o emissor do seu cartão.
payment-error-2 = Hmm. Ocorreu um problema ao autorizar o seu pagamento. Entre em contacto com o emissor do seu cartão.
payment-error-3b = Ocorreu um erro inesperado ao processar o seu pagamento, por favor, tente novamente.
expired-card-error = Parece que o seu cartão de crédito expirou. Tente outro cartão.
insufficient-funds-error = Parece que o seu cartão não possui fundos suficientes. Tente outro cartão.
withdrawal-count-limit-exceeded-error = Parece que esta transação excederá o seu limite de crédito. Tente outro cartão.
charge-exceeds-source-limit = Parece que esta transação excederá o seu limite de crédito diário. Tente outro cartão ou novamente daqui a 24 horas.
instant-payouts-unsupported = Parece que o seu cartão de débito não está configurado para pagamentos instantâneos. Tente outro cartão de débito ou crédito.
duplicate-transaction = Hmm. Parece que uma transação idêntica acabou de ser enviada. Verifique o seu histórico de pagamentos.
coupon-expired = Parece que este código promocional expirou.
card-error = Não foi possível processar sua transação. Verifique as informações do seu cartão de crédito e tente novamente.
country-currency-mismatch = A moeda desta subscrição não é válida para o país associado ao seu pagamento.
currency-currency-mismatch = Pedimos desculpa. Não pode alternar entre moedas.
location-unsupported = De acordo com os nossos Termos de Serviço, a sua localização atual não é suportada.
no-subscription-change = Lamentamos mas não pode alterar o seu plano de subscrição.
iap-already-subscribed = Já está subscrito através da { $mobileAppStore }.
fxa-account-signup-error-2 = Um erro de sistema fez com que a sua subscrição no(a) { $productName } falhasse. Não houve cobrança no seu método de pagamento. Por favor, tente novamente.
fxa-post-passwordless-sub-error = Subscrição confirmada, mas o carregamento da página de confirmação falhou. Por favor, consulte o seu e-mail para configurar a sua conta.
newsletter-signup-error = Não subscreveu a quaisquer e-mails de atualizações do produto. Pode tentar novamente nas definições da sua conta.
product-plan-error =
    .title = Problema ao carregar planos
product-profile-error =
    .title = Problema ao carregar perfil
product-customer-error =
    .title = Problema ao carregar o cliente
product-plan-not-found = Plano não encontrado
product-location-unsupported-error = Localização não suportada


coupon-success = O seu plano será renovado automaticamente pelo preço de tabela.
coupon-success-repeating = O seu plano será renovado automaticamente depois de { $couponDurationDate } pelo preço de tabela.


new-user-step-1-2 = 1. Crie uma { -product-mozilla-account }
new-user-card-title = Introduza a informação do seu cartão
new-user-submit = Subscrever agora


sub-update-payment-title = Informação de pagamento


pay-with-heading-card-only = Pagar com cartão
product-invoice-preview-error-title = Problema ao carregar a pré-visualização da fatura
product-invoice-preview-error-text = Não foi possível carregar a pré-visualização da fatura


subscription-iaperrorupgrade-title = Nós ainda não o podemos atualizar


brand-name-google-play-2 = { -google-play }
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Rever a sua alteração
sub-change-failed = A alteração do plano falhou
sub-update-acknowledgment =
    O seu plano irá mudar imediatamente, e será cobrado um valor ajustado 
    durante o resto do seu ciclo de faturação. A partir de { $startingDate }
    será cobrado o valor total.
sub-change-submit = Confirmar alteração
sub-update-current-plan-label = Plano atual
sub-update-new-plan-label = Novo plano
sub-update-total-label = Novo total
sub-update-prorated-upgrade = Upgrade proporcional


sub-update-new-plan-daily = { $productName } (diário)
sub-update-new-plan-weekly = { $productName } (semanal)
sub-update-new-plan-monthly = { $productName } (mensal)
sub-update-new-plan-yearly = { $productName } (anual)
sub-update-prorated-upgrade-credit = O balanço negativo apresentado será aplicado como créditos na sua conta e utilizado para futuras faturas.


sub-item-cancel-sub = Cancelar subscrição
sub-item-stay-sub = Manter a subscrição


sub-item-cancel-msg =
    Não vai poder mais o { $name } após
    { $period }, o último dia do seu ciclo de faturação.
sub-item-cancel-confirm =
    Cancelar o meu acesso e a minha informação guardada em
    { $name } em { $period }
sub-promo-coupon-applied = Código { $promotion_name } aplicado: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Este pagamento de subscrição teve como resultado um crédito no balanço da sua conta: <priceDetails></priceDetails>


sub-route-idx-reactivating = A reativação da subscrição falhou
sub-route-idx-cancel-failed = O cancelamento da subscrição falhou
sub-route-idx-contact = Contatar o Suporte
sub-route-idx-cancel-msg-title = Lamentamos vê-lo partir
sub-route-idx-cancel-msg =
    A sua subscrição { $name } foi cencelada.
    <br />
    Ainda terá acesso a { $name } até { $date }.
sub-route-idx-cancel-aside-2 = Tem questões? Visite o <a>Apoio da { -brand-mozilla }</a>.


sub-customer-error =
    .title = Problema em carregar o cliente
sub-invoice-error =
    .title = Problema ao carregar as faturas
sub-billing-update-success = A sua informação de pagamento foi atualizada com sucesso
sub-invoice-previews-error-title = Problema ao carregar as pré-visualizações da fatura
sub-invoice-previews-error-text = Não foi possível carregar as pré-visualizações da fatura


pay-update-change-btn = Alterar
pay-update-manage-btn = Gerir


sub-next-bill = Próxima faturação em { $date }
sub-next-bill-due-date = A próxima fatura vence a { $date }
sub-expires-on = Expira a { $date }




pay-update-card-exp = Expira em { $expirationDate }
sub-route-idx-updating = A atualizar a informação de pagamento…
sub-route-payment-modal-heading = Informação de faturação inválida
sub-route-payment-modal-message-2 = Parece existir um erro com a sua conta { -brand-paypal }. Precisamos que execute os passos necessários para resolver este problema de pagamento.
sub-route-missing-billing-agreement-payment-alert = Informação de pagamento inválida; há um erro com a sua conta. <div>Gerir</div>
sub-route-funding-source-payment-alert = Informação de pagamento inválida; há um erro com a sua conta. Este alerta pode levar algum tempo a desaparecer depois de atualizar as suas informações com sucesso. <div>Gerir</div>


sub-item-no-such-plan = Não existe um plano para esta subscrição.
invoice-not-found = Fatura subsequente não encontrada
sub-item-no-such-subsequent-invoice = Fatura subsequente não encontrada para esta subscrição.
sub-invoice-preview-error-title = Não foi encontrada a pré-visualização da fatura
sub-invoice-preview-error-text = Não foi encontrada a pré-visualização da fatura para esta subscrição


reactivate-confirm-dialog-header = Deseja continuar a usar { $name }?
reactivate-confirm-copy =
    O seu acesso a { $name } irá continuar e o seu ciclo de faturação
    e pagamento irão permanecer. O seu próximo débito será de
    { $amount } para o cartão que termina em { $last } em { $endDate }.
reactivate-confirm-without-payment-method-copy =
    O seu acesso a { $name } irá continuar e o seu ciclo de faturação
    e de pagamento irão permanecer os mesmos. O seu próximo débito será de
    { $amount } a { $endDate }.
reactivate-confirm-button = Resubscrever


reactivate-panel-copy = Você ira perder acesso a { $name } em <strong>{ $date }</strong>.
reactivate-success-copy = Obrigado! Está pronto para começar.
reactivate-success-button = Fechar


sub-iap-item-google-purchase-2 = { -brand-google }: Compra na aplicação
sub-iap-item-apple-purchase-2 = { -brand-apple }: Compra na aplicação
sub-iap-item-manage-button = Gerir
