import React from 'react';
import { Localized } from '@fluent/react';
import { getLocalizedCurrency, getLocalizedCurrencyString } from './formats';

// helper
type LabelItemProps = {
  label: string;
  amount: number;
  currency: string;
  intervalCount: number;
  idNum?: number;
};

export const LabelItem = ({
  label,
  amount,
  currency,
  intervalCount,
  idNum = 1,
}: LabelItemProps) => {
  const listId = label.replace(/\s+/g, '-').toLowerCase();
  const listAmount = getLocalizedCurrencyString(amount, currency);
  return (
    <div className="plan-details-item">
      <Localized id={`plan-details-${listId}-label`}>
        <div>{label}</div>
      </Localized>

      <Localized
        id={listId}
        key={`listId-${idNum}`}
        attrs={{ title: true }}
        vars={{
          amount: getLocalizedCurrency(amount, currency),
          intervalCount,
        }}
      >
        <div data-testid={listId} title={listAmount}>
          {label === 'Promo Code' && '- '}
          {listAmount}
        </div>
      </Localized>
    </div>
  );
};
