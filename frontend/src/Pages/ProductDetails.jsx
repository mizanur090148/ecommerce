import React from "react";
import AdditionalInfo from "../Components/Product/AdditonInfo/AdditionalInfo";
import Product from "../Components/Product/ProductMain/Product";
import RelatedProducts from "../Components/Product/RelatedProducts/RelatedProducts";
import { useParams } from "react-router-dom";
import useProductDetails from "../Hooks/useProductDetails";

const ProductDetails = () => {
  const { slug } = useParams();
  const { product, refetch } = useProductDetails(slug);

  return (
    <>
      <Product />
      <AdditionalInfo product={product} onReviewSubmitted={refetch} />
      <RelatedProducts />
    </>
  );
};

export default ProductDetails;
