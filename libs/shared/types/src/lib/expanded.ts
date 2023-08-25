import { NonString } from './nonstring';
import { Stripe } from 'stripe';

export type Expanded<T, K extends string | number | symbol> = Omit<T, K> & {
  [P in K]: NonString<T[P]>;
};

// type MyType = {
//   prop1: string ;
//   prop2: string | number;
// }

// type MyType2 = Expanded<MyType, 'prop2'>

// const blag = {
//   prop1: "",
//   prop2: 1
// } satisfies MyType2

// console.log(blag)

export type Product = Expanded<Stripe.Product, 'default_price' | 'tax_code'>;

function someFunc(product: Expanded<Stripe.Product, 'default_price'>): void {
  // product.default_price now cant be a string but this requires that
  // the property is narrowed before being passed
}

const blag = {
  id: '',
  object: 'product',
  active: true,
  attributes: null,
  created: 0,
  description: '',
  images: [''],
  livemode: true,
  name: '',
  shippable: true,
  type: 'service',
  url: '',
  updated: 0,
  tax_code: '',
  package_dimensions: null,
  metadata: {},
  default_price: undefined,
} satisfies Stripe.Product;

someFunc(blag); //no error but there should be one
