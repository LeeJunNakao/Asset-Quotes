const { InexistentAsset } = require("../../../utils/aux-entity");

module.exports = {
    searchExternalQuotes: async (params) => {
        if (!params.assetCodes.length) return {}
        const { source } = params;

        const serviceOptions = {
            B3: strapi.service('api::asset-quote.source-exchange').searchB3,
            crypto: strapi.service('api::asset-quote.source-exchange').searchCrypto
        }

        const service = serviceOptions[source];

        return await service(params);
    },
    parseExternalQuotes: (quotes) => {
        const validExternalQuotes = Object.entries(quotes).filter(([_code, result]) => !(result instanceof InexistentAsset));
        return Object.fromEntries(validExternalQuotes)
    }
}