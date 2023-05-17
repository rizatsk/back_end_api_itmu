function generateDifferentNumbers() {
    const maxNumber = 100; // Angka maksimum yang diinginkan
    let number1 = Math.floor(Math.random() * maxNumber) + 1;
    let number2 = Math.floor(Math.random() * maxNumber) + 1;

    while (number2 === number1) {
        number2 = Math.floor(Math.random() * maxNumber) + 1;
    }

    return number1;
}

module.exports = generateDifferentNumbers;