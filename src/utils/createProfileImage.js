const { createCanvas } = require("canvas");

function createProfileImage(initials) {
    initials = initials.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
    initials = initials.toUpperCase();

    const canvas = createCanvas(200, 200);
    const context = canvas.getContext('2d');

    // atur latar belakang
    context.fillStyle = '#0F3D3E';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // atur font
    context.font = '80px Impact';
    context.fillStyle = '#FFFFFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // tulis inisial di tengah-tengah
    context.fillText(initials, canvas.width / 2, canvas.height / 2);

    // kembalikan data gambar dalam bentuk Base64
    return canvas.toDataURL('image/png');
}

module.exports = createProfileImage;