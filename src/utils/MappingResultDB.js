const ConvertToRupiah = require("./ConvertToRupiah");
const generateDifferentNumbers = require("./generateDiferentNumber");

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
});

const MappingGetUserByServiceId = ({
  email,
  fullname,
  device,
  brand,
  cracker,
  status,
  servicing,
  estimation_price,
  real_price
}) => ({
  email,
  fullname,
  device,
  brand,
  cracker,
  status,
  servicing,
  estimation_price: estimation_price ? ConvertToRupiah(estimation_price) : 'Rp 0',
  real_price: real_price ? ConvertToRupiah(real_price) : 'Belum di tentukan',
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

const MappingProductsForUser = ({
  product_id,
  name,
  price,
  price_promotion,
  image_link
}) => ({
  product_id,
  name,
  price,
  price_promotion,
  percent_promotion: price_promotion ? Math.ceil(((price - price_promotion) / price) * 100) : null,
  image_link: image_link ? `${process.env.URLIMAGE}${image_link}` : null
})

const MappingImageProductForUser = ({
  link,
}) => ({
  image_link: link ? `${process.env.URLIMAGE}${link}` : null
})

const mapRequestServiceLine = (data) => {
  const groupedData = {};
  data.forEach(item => {
    const key = `${item.device} - ${item.brand}`;
    if (!groupedData[key]) {
      groupedData[key] = Array(12).fill(0);
    }
    groupedData[key][item.month - 1] += parseInt(item.amount);
  });

  // Mengubah data menjadi format yang diinginkan
  const output = Object.entries(groupedData).map(([key, data]) => {
    const brand = key.split(' - ')[1];
    const color = `hsl(${generateDifferentNumbers() * 3}, 70%, 50%)`;
    const formattedData = data.map((amount, index) => {
      return {
        x: getMonthName(index),
        y: amount
      };
    });

    return {
      id: `${key}`,
      color: color,
      data: formattedData
    };
  });

  // Fungsi untuk mendapatkan nama bulan berdasarkan indeks
  function getMonthName(monthIndex) {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ];
    return months[monthIndex];
  }

  return output;
}

const mapRoleUserAdminsDonuts = (data) => {
  const transformedData = data.map(item => {
    const id = item.role_name.replace(/\s/g, '_');
    const label = item.role_name;
    const value = item.mount ? parseInt(item.mount) : 0;
    const color = `hsl(${generateDifferentNumbers() * 10}, 70%, 50%)`;

    return { id, label, value, color };
  });

  return transformedData;
}

const mapStatusRequestServiceBar = (data) => {
  const transformedData = data.map(item => {
    const newObject = {};
    newObject.type = item.status;
    newObject[item.status] = parseInt(item.mount);
    return newObject;
  });

  return transformedData;
}

module.exports = {
  MappingCategoriesProduct,
  mappedDataCategories,
  MappingPricePromotionProductById,
  MappingProducts,
  MappingProductsForUser,
  MappingImageProductForUser,
  MappingGetUserByServiceId,
  mapRequestServiceLine,
  mapRoleUserAdminsDonuts,
  mapStatusRequestServiceBar,
};
