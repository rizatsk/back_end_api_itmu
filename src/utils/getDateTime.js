const getDateTime = () => {
  const newDate = new Date();
  const year = `${newDate.getFullYear()}`;

  let month = newDate.getMonth();
  month += 1;
  month = `${month}`;
  month = month.length == 1 ? `0${month}` : month;

  let date = `${newDate.getDate()}`;
  date = date.length == 1 ? `0`.date : date;

  const time = `${newDate.getHours()}:${newDate.getMinutes()}:${newDate.getSeconds()}`;
  const dateTime = `${year}-${month}-${date} ${time}`;
  return dateTime;
};

module.exports = getDateTime;
