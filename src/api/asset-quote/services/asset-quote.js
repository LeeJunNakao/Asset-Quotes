'use strict';

/**
 * asset-quote service.
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { InvalidExchangeError } = require("../../../utils/errors");


module.exports = createCoreService('api::asset-quote.asset-quote', ({ strapi }) => ({
    searchAsset: async ({ assetCodes, source, date, currency }) => {
        const exchange = await strapi.service('api::asset-quote.asset-quote').searchExchange(source);
        const quotes = strapi.service('api::asset-quote.asset-quote').searchQuotes({
            assetCodes, source, date, currency, exchange
        });

        return quotes;
    },
    searchExchange: async (source) => {
        const exchange = await strapi.db.query('api::exchange.exchange').findOne({
            select: '*',
            where: { name: source }
        })

        if (exchange) return exchange;

        throw new InvalidExchangeError();

    },
    searchQuotes: async ({ assetCodes, source, date, currency, exchange }) => {
        const internalQuotes = await strapi.service('api::asset-quote.internal-quotes').searchInternalQuotes({ assetCodes, source, date, currency, exchange })
        const notStoredAssets = internalQuotes.filter(([_code, quote]) => !quote).map(([code]) => code);
        const externalQuotes = await strapi.service('api::asset-quote.external-quotes').searchExternalQuotes({ assetCodes: notStoredAssets, source, date, currency, exchange });

        await strapi.service('api::asset-quote.asset-quote').saveQuotes(externalQuotes, exchange);

        return strapi.service('api::asset-quote.asset-quote').parseQuotes(internalQuotes, externalQuotes);
    },
    parseQuotes: async (internalQuotes, externalQuotes) => {
        const parsedInternal = strapi.service('api::asset-quote.internal-quotes').parseInternalQuotes(internalQuotes);
        const parsedExternal = strapi.service('api::asset-quote.external-quotes').parseExternalQuotes(externalQuotes);

        return { ...parsedInternal, ...parsedExternal };
    },
    saveQuotes: async (quotes, exchange) => {
        const promises = Object.entries(quotes).filter(([_key, quote]) => quote).map(async ([key, quote]) => {
            const { closePrice, date: closeDate, currency } = quote;
            const asset = await strapi.service('api::asset-quote.asset-quote').searchAssetEntity(key, exchange);

            return strapi.db.query('api::asset-quote.asset-quote').create({
                data: {
                    asset,
                    closeDate,
                    closePrice,
                    currency
                }
            })
        })

        return Promise.all(promises);
    },
    searchAssetEntity: async (code, exchange) => {
        const asset = await strapi.db.query('api::asset.asset').findOne({
            select: '*',
            where: { name: code }
        })

        if (asset) return asset;

        return await strapi.db.query('api::asset.asset').create({
            data: {
                name: code,
                exchange
            }
        })
    },
}));
