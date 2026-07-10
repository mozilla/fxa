## FreeTrialContent

## $amount (Number) - The charge amount excluding tax. It will be formatted as currency.
## $date (Date) - The date the free trial ends or expires (e.g., September 8, 2026)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $tax (Number) - The tax amount. It will be formatted as currency.

free-trial-content-trial-expires = Your free trial expires on { $date }.
free-trial-content-trial-cancelled = Your free trial has been cancelled.

# Charge info strings - with tax, per interval

free-trial-content-charge-info-with-tax-day = You will be charged { $amount } + { $tax } tax per day after the free trial ends on { $date }.
free-trial-content-charge-info-with-tax-week = You will be charged { $amount } + { $tax } tax per week after the free trial ends on { $date }.
free-trial-content-charge-info-with-tax-month = You will be charged { $amount } + { $tax } tax per month after the free trial ends on { $date }.
free-trial-content-charge-info-with-tax-halfyear = You will be charged { $amount } + { $tax } tax every six months after the free trial ends on { $date }.
free-trial-content-charge-info-with-tax-year = You will be charged { $amount } + { $tax } tax per year after the free trial ends on { $date }.
free-trial-content-charge-info-with-tax-default = You will be charged { $amount } + { $tax } tax after the free trial ends on { $date }.

# Charge info strings - no tax, per interval

free-trial-content-charge-info-no-tax-day = You will be charged { $amount } per day after the free trial ends on { $date }.
free-trial-content-charge-info-no-tax-week = You will be charged { $amount } per week after the free trial ends on { $date }.
free-trial-content-charge-info-no-tax-month = You will be charged { $amount } per month after the free trial ends on { $date }.
free-trial-content-charge-info-no-tax-halfyear = You will be charged { $amount } every six months after the free trial ends on { $date }.
free-trial-content-charge-info-no-tax-year = You will be charged { $amount } per year after the free trial ends on { $date }.
free-trial-content-charge-info-no-tax-default = You will be charged { $amount } after the free trial ends on { $date }.

free-trial-content-trial-ends = Your free trial ends on { $date }. Update your payment method to keep access after your free trial.
free-trial-content-trial-active = Your free trial is active.
free-trial-content-action-error = An unexpected error occurred. Please try again.

free-trial-content-button-resume-trial = Resume trial
free-trial-content-button-resume-trial-aria = Resume trial for { $productName }
free-trial-content-button-cancel-trial = Cancel trial
free-trial-content-button-cancel-trial-aria = Cancel trial for { $productName }
free-trial-content-button-cancel-subscription = Cancel subscription
free-trial-content-button-cancel-subscription-aria = Cancel subscription for { $productName }

## $billedOnDate (Date) - The date of the last bill (e.g., July 20, 2025)
## $invoiceTotal (Number) - The invoice total amount excluding tax. It will be formatted as currency.
## $taxDue (Number) - The tax amount. It will be formatted as currency.

free-trial-content-last-bill = Last bill • { $billedOnDate }
free-trial-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } tax
free-trial-content-last-bill-no-tax = { $invoiceTotal }

##

free-trial-content-link-view-invoice = View invoice
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
free-trial-content-link-view-invoice-aria = View invoice for { $productName }
# $date (Date) - The date the free trial ended (e.g., January 16, 2026)
free-trial-content-trial-ended = Your free trial ended on <bold>{ $date }</bold>.
free-trial-content-could-not-process-payment = We couldn’t process your payment. Update your payment method to restore access. Processing can take up to 24 hours and may vary by bank or payment method.
free-trial-content-button-update-payment = Update payment method
