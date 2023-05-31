function generateQuery(input) {
    if (input) {
        const keywords = input.split(' ');
        const conditions = keywords.map(keyword => `name ILIKE '%${keyword}%'`);
        const query = conditions.join(' AND ');
        return query;
    } else {
        return `name ILIKE '%%'`;
    }
}

module.exports = generateQuery;