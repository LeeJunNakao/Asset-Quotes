'use strict';

/**
 * asset-quote service.
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { dateToString } = require("../../../utils/parser");
const { InexistentAsset } = require("../../../utils/aux-entity");

const findItemByDate = date => i => dateToString(i.date).match(new RegExp(date));
const getItem = (items, date) => key => [key.split(".")[0], items[key].find(findItemByDate(date))]
const parseResponse = ([key, item]) => [key, {
    date: dateToString(item.date),
    closePrice: Number((item.close * 100).toFixed(0)),
    currency: 'BRL'
}]


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

        // return await strapi.db.query('api::exchange.exchange').create({
        //     data: {
        //         name: source
        //     }
        // })
    },
    searchQuotes: async ({ assetCodes, source, date, currency, exchange }) => {
        const internalQuotes = await strapi.service('api::asset-quote.internal-quotes').searchInternalQuotes({ assetCodes, source, date, currency, exchange })

        const notStoredAssets = internalQuotes.filter(([_code, quote]) => !quote).map(([code]) => code);

        const externalQuotes = await strapi.service('api::asset-quote.external-quotes').searchExternalQuotes({ assetCodes: notStoredAssets, source, date, currency, exchange });

        return strapi.service('api::asset-quote.asset-quote').parseQuotes(internalQuotes, externalQuotes);
    },
    parseQuotes: async (internalQuotes, externalQuotes) => {
        const parsedInternal = strapi.service('api::asset-quote.internal-quotes').parseInternalQuotes(internalQuotes);
        const parsedExternal = strapi.service('api::asset-quote.external-quotes').parseExternalQuotes(externalQuotes);

        return { ...parsedInternal, ...parsedExternal };
    },
    searchAssetEntity: async (code, exchange) => {
        const asset = await strapi.db.query('api::asset.asset').findOne({
            select: '*',
            where: { name: code }
        })

        if (asset) return asset;

        // return await strapi.db.query('api::asset.asset').create({
        //     data: {
        //         name: code,
        //         exchange
        //     }
        // })
    },
}));
