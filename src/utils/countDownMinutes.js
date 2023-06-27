function countDownMinutes(data, minutes) {
    const startTime = new Date(data);

    // Tambahkan menit ke waktu awal
    const endTime = new Date(startTime.getTime() + (minutes * 60 * 1000));

    // Waktu saat ini
    const currentTime = new Date();

    // Hitung selisih waktu dalam milidetik
    const timeDiff = currentTime.getTime() - startTime.getTime();
    const timeUp = endTime.getTime() - currentTime.getTime();

    // Konversi selisih waktu menjadi menit
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    const minutesUp = Math.floor(timeUp / (1000 * 60)) % 60;
    const secondUp = Math.floor(timeUp / 1000) % 60;

    // Periksa apakah selisih waktu lebih dari 10 menit
    const isElapsed = minutesDiff >= minutes;

    return {
        minutes: minutesUp,
        second: secondUp,
        status: isElapsed
    }
}

module.exports = countDownMinutes;
