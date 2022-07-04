const getDateTime = () => {
  const newDate = new Date();
  const year = `${newDate.getFullYear()}`;

  let month = `${newDate.getMonth()}`;
  month = month.length > 2 ? `0`.month : month;

  let date = `${newDate.getDate()}`;
  date = date.length > 2 ? `0`.date : date;

  const time = `${newDate.getHours()}:${newDate.getMinutes()}:${newDate.getSeconds()}`;
  const dateTime = `${year}-${month}-${date} ${time}`;
  return dateTime;
};

module.exports = getDateTime;
