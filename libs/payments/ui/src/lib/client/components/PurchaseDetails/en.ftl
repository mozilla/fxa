## Component - PurchaseDetails

next-plan-details-header = Product details
next-plan-details-list-price = List Price
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Prorated price for { $productName }
next-plan-details-tax = Taxes and Fees
next-plan-details-total-label = Total
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Credit from unused time
purchase-details-subtotal-label = Subtotal
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Credit applied
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Total due
next-plan-details-hide-button = Hide details
next-plan-details-show-button = Show details

## $trialDayLength (Number) - The number of days in the free trial

free-trial-start-title =  { $trialDayLength ->
  *[other] Start your { $trialDayLength }-day free trial
}
free-trial-success-title = { $trialDayLength ->
  *[other] Your { $trialDayLength }-day free trial has started
}

## $firstPrice (String) - The total price of the first charge for the subscription after the free trial ends
## $endDate (String) - The date the free trial ends

free-trial-start-message-daily = No payment required today. You will be charged { $firstPrice }/day after the free trial ends on { $endDate }.
free-trial-start-message-weekly = No payment required today. You will be charged { $firstPrice }/week after the free trial ends on { $endDate }.
free-trial-start-message-monthly = No payment required today. You will be charged { $firstPrice }/month after the free trial ends on { $endDate }.
free-trial-start-message-halfyearly = No payment required today. You will be charged { $firstPrice }/6 months after the free trial ends on { $endDate }.
free-trial-start-message-yearly = No payment required today. You will be charged { $firstPrice }/year after the free trial ends on { $endDate }.

##

# $endDate (String) - The date of the first charge after the free trial ends
free-trial-first-charge-title = First charge: { $endDate }

## $firstPrice (String) - The total price of the first charge for the subscription after the free trial ends
## $endDate (String) - The date of the first charge after the free trial ends

free-trial-first-charge-message-daily = You will be billed { $firstPrice } on { $endDate }, then daily thereafter until you cancel.
free-trial-first-charge-message-weekly = You will be billed { $firstPrice } on { $endDate }, then weekly thereafter until you cancel.
free-trial-first-charge-message-monthly = You will be billed { $firstPrice } on { $endDate }, then monthly thereafter until you cancel.
free-trial-first-charge-message-halfyearly = You will be billed { $firstPrice } on { $endDate }, then every 6 months thereafter until you cancel.
free-trial-first-charge-message-yearly = You will be billed { $firstPrice } on { $endDate }, then yearly thereafter until you cancel.

##

next-coupon-success = Your plan will automatically renew at the list price.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Your plan will automatically renew after { $couponDurationDate } at the list price.
