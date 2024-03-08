import { PaypalCustomer } from '@fxa/shared/db/mysql/account';

export type ResultPaypalCustomer = Readonly<Omit<PaypalCustomer, 'uid'>> & {
  readonly uid: string;
};

export interface CreatePaypalCustomer {
  uid: string;
  billingAgreementId: string;
  status: string;
  endedAt: number | null;
}

export interface UpdatePaypalCustomer {
  billingAgreementId: string;
  status: string;
  endedAt: number | null;
}
