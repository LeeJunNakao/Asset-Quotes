
module.exports = {
    searchInternalQuotes: async ({ assetCodes, source, date, currency, exchange }) => {
        const promises = assetCodes.map(async code => {
            const quote = await strapi.db.query('api::asset-quote.asset-quote').findOne({
                select: '*',
                where: { asset: { name: code }, closeDate: date, currency },
            })

            return [code, quote]
        });

        return Promise.all(promises)
    },
    parseInternalQuotes: (quotes) => {
        const validInternalQuotes = quotes.filter(([code, result]) => result);
        return Object.fromEntries(validInternalQuotes);
    }
}