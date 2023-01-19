import React from 'react';
import { graphql } from 'gatsby';

const ProductsPage = ({ data }: any) => (
  <div>
    <h1>Products</h1>
    {data.allMarkdownRemark.edges.map((product: any) => (
      <div
        key={product.node.frontmatter.id}
        className="component-card font-semibold my-8 py-4 text-center w-[30%]"
      >
        <p>{product.node.frontmatter.productName}</p>
      </div>
    ))}
  </div>
);

export const productQuery = graphql`
  query ProductIndexQuery {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            id
            productName
          }
        }
      }
    }
  }
`;

export default ProductsPage;
