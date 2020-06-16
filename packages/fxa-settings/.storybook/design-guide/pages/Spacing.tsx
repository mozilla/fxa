import React from 'react';
import Page from '../Page';
import Copiable from '../Copiable';
import Snippet from '../Snippet';

const nonIntMap = {
  px: {
    name: '1px',
    width: 1,
  },
  '-px': {
    name: '-1px',
    width: 1,
  },
  auto: {
    name: 'auto',
    width: 0,
  },
};

const Spacing = ({ config }) => {
  const twSpacing = {};

  Object.keys(config.theme.padding).forEach((size) => {
    twSpacing[size] = {
      value: config.theme.padding[size],
      available: ['p'],
    };
  });

  Object.keys(config.theme.margin).forEach((size) => {
    if (twSpacing[size]) {
      return twSpacing[size].available.push('m');
    }

    const withoutMinus = size.slice(1);
    if (size.charAt(0) === '-' && twSpacing[withoutMinus]) {
      return twSpacing[withoutMinus].available.push('-m');
    }

    twSpacing[size] = {
      value: config.theme.margin[size],
      available: ['m'],
    };
  });

  return (
    <Page title="Spacing">
      <p className="pb-3 max-w-4xl">
        We use <span className="font-bold">increments of 4px</span> across all
        sizing scales, particularly for spacing. If you encounter visuals that
        do not adhere to the 4px rule it is advised to inquire further about the
        decision and advocate for a value that adheres to the rule.
      </p>
      <p className="pb-6 max-w-4xl">
        Spacing classes can be derived by combining the property (such as{' '}
        <Snippet>p</Snippet>
        for padding or <Snippet>m</Snippet> for margin) with one of the
        available sizing values. Additionally, modifiers can be used to target
        specific axes. Some examples:
      </p>
      <ul className="shadow-md border border-black border-opacity-25 rounded max-w-2xl p-3 mb-8 bg-white">
        <li className="pb-3 mb-3 border-b border-grey-100">
          <Snippet>y</Snippet> will target only vertical axes (top and bottom,
          e.g.{' '}
          <Copiable value="my-3">
            <Snippet>my-3</Snippet>
          </Copiable>
          ), <Snippet>x</Snippet> will target only horizontal axes (left and
          right, e.g.{' '}
          <Copiable value="px-16">
            <Snippet>px-16</Snippet>
          </Copiable>
          ).
        </li>
        <li className="pb-3 mb-3 border-b border-grey-100">
          <Snippet>t</Snippet> <Snippet>b</Snippet>, <Snippet>l</Snippet>, and{' '}
          <Snippet>r</Snippet> will target top (e.g.{' '}
          <Copiable value="pt-2">
            <Snippet>pt-2</Snippet>
          </Copiable>
          ), bottom (e.g.{' '}
          <Copiable value="pb-10">
            <Snippet>pb-10</Snippet>
          </Copiable>
          ), left (e.g.{' '}
          <Copiable value="ml-0">
            <Snippet>ml-0</Snippet>
          </Copiable>
          ), and right sides only (e.g.{' '}
          <Copiable value="pr-18">
            <Snippet>pr-18</Snippet>
          </Copiable>
          ), respectively.
        </li>
        <li>
          <Snippet>-</Snippet> will apply the negative value (margin only, e.g.{' '}
          <Copiable value="-m-8">
            <Snippet>-m-8</Snippet>
          </Copiable>
          ,{' '}
          <Copiable value="-mr-64">
            <Snippet>-mr-64</Snippet>
          </Copiable>
          ).
        </li>
      </ul>

      <div className="border border-grey-200 rounded-md shadow-md p-3 bg-white">
        <table className="flex flex-col">
          <thead>
            <th className="flex text-left">
              <td className="flex-1 pb-2">name</td>
              <td className="flex-2 pb-2">value</td>
              <td className="flex-7 pb-2">example</td>
              <td className="flex-1 pb-2 text-right">availability</td>
            </th>
          </thead>
          <tbody>
            {Object.keys(twSpacing).map((size) => {
              const data = twSpacing[size];
              const parsedSize = parseFloat(size);
              const parsedValue = parseFloat(data.value);

              return (
                <tr className="flex relative spacing-item-row">
                  <td className="flex-1 mb-2">
                    <code>{size}</code>

                    <div className="spacing-more-content hidden absolute top-0 left-0 rounded w-full bg-grey-50 overflow-scroll whitespace-no-wrap flex items-center justify-center py-1">
                      <span className="font-bold mr-2">size: {size}</span>
                      {data.available.includes('p') && (
                        <span className="mx-2">
                          <Copiable value={`p-${size}`}>
                            <Snippet moarClasses="mx-1">p-{size}</Snippet>
                          </Copiable>
                          <Copiable value={`px-${size}`}>
                            <Snippet moarClasses="mx-1">px-{size}</Snippet>
                          </Copiable>
                          <Copiable value={`py-${size}`}>
                            <Snippet moarClasses="mx-1">py-{size}</Snippet>
                          </Copiable>
                          <Copiable value={`pt-${size}`}>
                            <Snippet moarClasses="mx-1">pt-{size}</Snippet>
                          </Copiable>
                        </span>
                      )}
                      {data.available.includes('m') && (
                        <span className="mx-2">
                          <Copiable value={`m-${size}`}>
                            <Snippet moarClasses="mx-1">m-{size}</Snippet>
                          </Copiable>
                          <Copiable value={`mx-${size}`}>
                            <Snippet moarClasses="mx-1">mx-{size}</Snippet>
                          </Copiable>
                          <Copiable value={`my-${size}`}>
                            <Snippet moarClasses="mx-1">my-{size}</Snippet>
                          </Copiable>
                          <Copiable value={`mr-${size}`}>
                            <Snippet moarClasses="mx-1">mr-{size}</Snippet>
                          </Copiable>
                        </span>
                      )}
                      {data.available.includes('-m') && (
                        <span className="mx-2">
                          <Copiable value={`-m-${size}`}>
                            <Snippet moarClasses="mx-1">-m-{size}</Snippet>
                          </Copiable>
                          <Copiable value={`-mb-${size}`}>
                            <Snippet moarClasses="mx-1">-mb-{size}</Snippet>
                          </Copiable>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="flex-2 mb-2">
                    <code>
                      {isNaN(parsedSize)
                        ? data.value
                        : `${data.value} (${parsedValue * 16}px)`}
                    </code>
                  </td>
                  <td className="flex-7 mb-2">
                    <span
                      className="block h-full bg-blue-500 rounded-sm"
                      style={{
                        width: isNaN(parsedSize)
                          ? `${nonIntMap[size].width}px`
                          : `${Math.abs(parsedValue) * 16}px`,
                      }}
                    ></span>
                  </td>
                  <td className="flex-1 mb-2 text-right">
                    <span>
                      {data.available.map((a) => (
                        <code className="bg-white ml-1 bg-grey-100 px-1 rounded-sm">
                          {a}
                        </code>
                      ))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Page>
  );
};

export default Spacing;
