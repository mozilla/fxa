import GenericTerms, { GenericTermsListItem } from './GenericTerms';

export type GenericTermItem = {
  key: string;
  title: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
};

type TermsAndConditionsProps = {
  terms: GenericTermItem[];
};

export default function TermsAndConditions(props: TermsAndConditionsProps) {
  const { terms } = props;
  return (
    <>
      {terms.map((term) => (
        <GenericTerms {...term} />
      ))}
    </>
  );
}
