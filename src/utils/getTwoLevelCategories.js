function getTwoLevelCategories(categories) {
    const result = [];

    categories.forEach(function (category) {
        if (category.parent_id === null) {
            // Jika kategori tidak memiliki parent, tambahkan ke hasil
            result.push(category);
        } else {
            const parent = categories.find(function (parent) {
                return parent.category_product_id === category.parent_id;
            });

            if (parent && parent.parent_id === null) {
                // Jika kategori memiliki parent yang hanya memiliki parent
                // (2 level), tambahkan ke hasil
                result.push(category);
            }
        }
    });

    return result;
}

module.exports = getTwoLevelCategories