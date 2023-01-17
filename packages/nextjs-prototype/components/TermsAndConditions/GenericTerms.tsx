import { Localized } from '@fluent/react';
import LinkExternal from 'fxa-react/components/LinkExternal';

export type GenericTermsListItem = {
  href: string;
  text: string;
  localizationId: string;
};

export type GenericTermsProps = {
  title: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
};

export default function GenericTerms(props: GenericTermsProps) {
  const { title, titleLocalizationId, items } = props;
  return (
    <div className="clear-both mt-5 text-xs leading-5 text-center">
      <Localized id={titleLocalizationId}>
        <p className="m-0 font-semibold text-grey-500">{title}</p>
      </Localized>

      <p className="m-0 text-grey-400">
        {items.map((item) => (
          <span key={`span-${item.href}`} className="mr-3 last:mr-0">
            <LinkExternal key={item.href} href={item.href}>
              {item.text}
            </LinkExternal>
          </span>
        ))}
      </p>
    </div>
  );
}
