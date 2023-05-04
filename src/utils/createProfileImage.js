const textToImage = require('text-to-image');

async function createProfileImage(initials) {
    initials = initials.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
    initials = initials.toUpperCase();

    const imageBuffer = await textToImage.generate(initials, {
        maxWidth: 200,
        fontSize: 80,
        lineHeight: 100,
        margin: 50,
        textAlign: 'center',
        bgColor: '#0F3D3E',
        textColor: '#FFFFFF',
    });

    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `${base64Image}`;
    return imageUrl;
}

module.exports = createProfileImage;