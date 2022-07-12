const groupByData = (obbjectArray, property) => {
  const dataGroupBy = obbjectArray.reduce((acc, current) => {
    const key = current[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(current);
    return acc;
  }, {});

  return dataGroupBy;
};

module.exports = groupByData;
