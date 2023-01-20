import React from 'react';
import { graphql, Link } from 'gatsby';

import Layout from '../layouts';
import AppLocalizationProvider from '../AppLocalizationProvider';
import PlanDetailsHeader from '../components/PlanDetailsHeader';

const ProductButton = ({ plan }) => {
  const productPath = plan.productName.replace(/\s+/g, '-').toLowerCase();
  return (
    <Link to={`/plan/${productPath}`} className="no-underline">
      <PlanDetailsHeader
        className="component-card min-w-[20rem] m-4 my-4 pl-4 rounded-lg"
        selectedPlan={plan}
      />
    </Link>
  );
};

const ProductsPage = ({ data }) => {
  const additionalData = {
    amount: 935,
    interval: 'month',
    interval_count: 1,
  };
  const revisedPlan = {
    ...data.subplat.plan,
    ...data.subplat.invoicePreview,
    ...additionalData,
  };

  return (
    <AppLocalizationProvider
      userLocales={['en-US']}
      bundles={['gatsby', 'react']}
    >
      <Layout>
        <main className="mt-20 mx-4 min-h-[calc(100vh_-_4rem)] w-[90%]">
          <h1 className="text-xl">Products</h1>
          <div className="flex flex-wrap">
            {data.allMarkdownRemark.edges.map((product: any) => {
              const prod = product.node.frontmatter;
              const compiledPlan = {
                ...additionalData,
                ...prod,
                ...data.subplat.invoicePreview,
              };
              return <ProductButton plan={compiledPlan} />;
            })}
            <ProductButton plan={revisedPlan} />
          </div>
        </main>
      </Layout>
    </AppLocalizationProvider>
  );
};

export const productQuery = graphql`
  query ProductIndexQuery {
    allMarkdownRemark(sort: { frontmatter: { productName: ASC } }) {
      edges {
        node {
          frontmatter {
            id
            productName
            subtitle
            webIconUrl
          }
        }
      }
    }
    subplat {
      plan(id: "123", locale: "en-us") {
        id
        productName
        subtitle
        webIconUrl
      }
      invoicePreview(planId: "123") {
        currency
      }
    }
  }
`;

export default ProductsPage;
