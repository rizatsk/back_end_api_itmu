function StringToLikeSearch(data) {
    if (data) {
        const convertedString = `%${data.replace(/\s+/g, '%')}%`;
        return convertedString
    } else {
        return '%%';
    }
}

module.exports = StringToLikeSearch