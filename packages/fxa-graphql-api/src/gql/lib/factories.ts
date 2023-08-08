import { faker } from '@faker-js/faker';
import { CartState } from '@fxa/shared/db/mysql/account';
import { CartIdInput } from '../dto/input/cart-id.input';
import { Cart } from '../model/cart.model';
import { Invoice } from '../model/invoice.model';
import { SetupCartInput } from '../dto/input/setup-cart.input';
import { Subscription } from '../model/subscription.model';
import { TaxAddress } from '../model/tax-address.model';
import { TaxAmount } from '../model/tax-amount.model';
import { UpdateCartInput } from '../dto/input/update-cart.input';

const OFFERING_CONFIG_IDS = [
  'vpn',
  'relay-phone',
  'relay-email',
  'hubs',
  'mdnplus',
];

export const CartFactory = (override?: Partial<Cart>): Cart => ({
  id: faker.string.uuid(),
  state: CartState.START,
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  interval: faker.helpers.arrayElement([
    'daily',
    'monthly',
    'semiannually',
    'annually',
  ]),
  nextInvoice: InvoiceFactory(),
  createdAt: faker.date.recent().getTime(),
  updatedAt: faker.date.recent().getTime(),
  amount: faker.number.int(10000),
  ...override,
});

export const TaxAmountFactory = (override?: Partial<TaxAmount>): TaxAmount => ({
  title: faker.location.state({ abbreviated: true }),
  amount: faker.number.int(10000),
  ...override,
});

export const InvoiceFactory = (override?: Partial<Invoice>): Invoice => ({
  totalAmount: faker.number.int(10000),
  taxAmounts: [TaxAmountFactory()],
  ...override,
});

export const SubscriptionFactory = (
  override?: Partial<Subscription>
): Subscription => ({
  pageConfigId: faker.helpers.arrayElement(['default', 'alternate-pricing']),
  previousInvoice: InvoiceFactory(),
  nextInvoice: InvoiceFactory(),
  ...override,
});

export const TaxAddressFactory = (
  override?: Partial<TaxAddress>
): TaxAddress => ({
  countryCode: faker.location.countryCode(),
  postalCode: faker.location.zipCode(),
  ...override,
});

export const CartIdInputFactory = (
  override?: Partial<CartIdInput>
): CartIdInput => ({
  id: faker.string.uuid(),
  ...override,
});

export const SetupCartInputFactory = (
  override?: Partial<SetupCartInput>
): SetupCartInput => ({
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  ...override,
});

export const UpdateCartInputFactory = (
  override?: Partial<UpdateCartInput>
): UpdateCartInput => ({
  id: faker.string.uuid(),
  ...override,
});
