function ConvertToRupiah(number) {
    const formattedNumber = number.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    return formattedNumber;
}

module.exports = ConvertToRupiah;