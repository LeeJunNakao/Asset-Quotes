const { InexistentAsset } = require("../../../utils/aux-entity");
const { formatSearchResult } = require("../../../utils/parser");

module.exports = {
    searchInternalQuotes: async ({ assetCodes, source, date, currency, exchange }) => {
        const promises = assetCodes.map(async code => {
            const quote = await strapi.db.query('api::asset-quote.asset-quote').findOne({
                select: '*',
                where: { asset: { name: code }, closeDate: date, currency },
            })

            const parsedQuote = strapi.service('api::asset-quote.internal-quotes').formatSearchedQuote(quote);

            return [code, parsedQuote]
        });

        return Promise.all(promises)
    },
    parseInternalQuotes: (quotes) => {
        const validInternalQuotes = quotes.map(([code, result]) => [code, formatSearchResult(result)]);

        return Object.fromEntries(validInternalQuotes);
    },
    formatSearchedQuote: (quote) => {
        if (!quote) return quote;

        const { createdAt, updatedAt, id, ...parsedQuote } = quote;

        return parsedQuote;
    }
}