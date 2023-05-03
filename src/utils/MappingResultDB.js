const MappingCategoriesProduct = ({ category_product_id, name, parentName }) => ({
  categoryProductId: category_product_id,
  parentName,
  name,
});

function mappedDataCategories(categories, parentId = null) {
  const result = [];
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].parent_id === parentId) {
      const category = {
        category_product_id: categories[i].category_product_id,
        parent_id: categories[i].parent_id,
        parentName: categories[i].parentName,
        name: categories[i].name,
        children: mappedDataCategories(categories, categories[i].category_product_id) // Rekursi untuk memetakan children
      };
      result.push(category);
    }
  }

  return result;
}

const MappingPricePromotionProductById = ({ product_id, price, price_promotion }) => ({
  productId: product_id,
  price,
  pricePromotion: price_promotion,
})

const MappingProducts = ({
  product_id,
  name,
  price,
  created,
  status,
  price_promotion,
  sale,
  sparepart
}) => ({
  product_id,
  name,
  price,
  price_promotion,
  percent_promotion: price_promotion ? Math.ceil(((price - price_promotion) / price) * 100) : null,
  created,
  status,
  sale,
  sparepart
});

module.exports = {
  MappingCategoriesProduct,
  mappedDataCategories,
  MappingPricePromotionProductById,
  MappingProducts
};
