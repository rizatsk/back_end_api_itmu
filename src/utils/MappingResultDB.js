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
        name: categories[i].name,
        children: mappedDataCategories(categories, categories[i].category_product_id) // Rekursi untuk memetakan children
      };
      result.push(category);
    }
  }

  return result;
}

module.exports = {
  MappingCategoriesProduct,
  mappedDataCategories
};
